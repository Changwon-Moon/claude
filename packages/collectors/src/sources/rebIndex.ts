/**
 * 한국부동산원 R-ONE — 전세가격지수 · 월세가격지수 수집 (1차 출처).
 *
 * ── 왜 R-ONE 인가
 * 전세/월세 가격지수를 **만드는 기관이 부동산원 자신**이다. 언론 기사나 KB 시세는
 * 2차 가공물이라 기준시점·표본이 다르면 숫자가 어긋난다(오보 0 원칙 — ARCHITECTURE.md §2).
 *
 * ── 왜 '구별 원자료'를 받아 두는가
 * 부동산원이 공표하는 권역(도심·동북·서북·서남·동남)은 우리가 쓰고 싶은 묶음과 다르다.
 * 25개 자치구 월별 계열을 통째로 받아 두면 **묶음은 코드로 언제든 다시 만든다.**
 * (오너가 쓰던 노원·도봉·강북·성북 / 강남3구 같은 커스텀 권역도 여기서 파생된다)
 *
 * ── 표(STATBL_ID)를 하드코딩하지 않는 이유
 * 통계표 ID는 개편 때 바뀐다. 이름으로 찾아 쓰고, 찾은 ID를 결과에 적어 둔다.
 * 그래야 다음 사람이 "왜 이 표인가"를 되짚을 수 있다.
 *
 * RONE_API_KEY 필요(무료). 세션은 네트워크 차단이라 GitHub Actions 에서 실행한다.
 */

const HOST = "https://www.reb.or.kr/r-one/openapi";

export interface RebTable {
  id: string;
  name: string;
  /** MM=월, QQ=분기, YY=년 */
  cycle: string;
}

export interface RebPoint {
  /** 지역명 (예: "서울특별시", "노원구") */
  region: string;
  /** 지역 코드 — 이름이 개편돼도 계열을 이을 수 있게 함께 둔다 */
  regionCode: string;
  /** YYYY-MM */
  ym: string;
  value: number;
}

/** 상태·본문을 함께 반환하는 GET (실패해도 본문을 봐야 원인을 안다) */
async function getRaw(url: string, timeoutMs = 20000): Promise<{ status: number; body: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "wirit-collector/0.1" } });
    return { status: res.status, body: await res.text() };
  } finally {
    clearTimeout(t);
  }
}

/** 3회까지 재시도하는 JSON GET. 실패 사유는 본문 앞자락과 함께 던진다. */
async function getJson(url: string): Promise<any> {
  let last = "";
  for (let i = 0; i < 3; i++) {
    try {
      const { status, body } = await getRaw(url);
      if (status !== 200) {
        last = `HTTP ${status} · ${body.slice(0, 160)}`;
      } else {
        try {
          return JSON.parse(body);
        } catch {
          // R-ONE 은 키가 틀리면 JSON 대신 HTML 안내를 준다 — 그 사실을 그대로 알린다
          last = `JSON 아님 · ${body.slice(0, 160).replace(/\s+/g, " ")}`;
        }
      }
    } catch (e) {
      last = String(e).slice(0, 160);
    }
    if (i < 2) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error(`R-ONE 요청 실패 — ${last}`);
}

/**
 * R-ONE 응답 껍데기가 판올림마다 조금씩 달라서(배열/객체, head/row 중첩) 형태를 가리지 않고
 * **행 배열**만 끄집어낸다. 스키마를 단정하지 않는 편이 오래 간다.
 */
function rowsOf(doc: any): any[] {
  const out: any[] = [];
  const walk = (v: any, depth: number): void => {
    if (depth > 6 || v == null) return;
    if (Array.isArray(v)) {
      // 객체들의 배열이면 데이터 행으로 본다
      if (v.length && typeof v[0] === "object" && !Array.isArray(v[0])) {
        const keys = Object.keys(v[0]);
        if (keys.length > 1) out.push(...v.filter((x) => x && typeof x === "object"));
      }
      for (const x of v) walk(x, depth + 1);
      return;
    }
    if (typeof v === "object") for (const k of Object.keys(v)) walk(v[k], depth + 1);
  };
  walk(doc, 0);
  return out;
}

/** 키 이름이 판올림마다 달라서, 후보를 순서대로 훑어 첫 값을 쓴다 */
function pick(row: any, ...names: string[]): string {
  for (const n of names) {
    const v = row?.[n];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

/**
 * 데이터 조회 파라미터를 **실측으로 찾는다**.
 *
 * ── 왜 필요한가 (2026-07-29)
 * 표 ID는 목록 API로 확인했는데 데이터가 0건으로 돌아왔다. 즉 기간·페이지 파라미터의
 * 이름이나 형태가 내 짐작과 다르다. 이럴 때 짐작을 고쳐 다시 던지는 걸 반복하면
 * CI 왕복만 늘어난다. **한 번에 여러 형태를 던져 보고 무엇이 행을 주는지 눈으로 본다.**
 * 응답 앞자락을 그대로 찍는 게 핵심이다 — 판정만 있으면 또 추측해야 한다.
 */
export interface ProbeResult {
  label: string;
  url: string;
  status: number;
  rows: number;
  head: string;
}

export async function probeData(key: string, statblId: string): Promise<ProbeResult[]> {
  const base = `${HOST}/SttsApiTblData.do?KEY=${encodeURIComponent(key)}&Type=json&STATBL_ID=${encodeURIComponent(statblId)}`;
  const variants: [string, string][] = [
    ["기간범위(YYYYMM)", `&DTACYCLE_CD=MM&START_WRTTIME=202601&END_WRTTIME=202612&pIndex=1&pSize=100`],
    ["단일시점", `&DTACYCLE_CD=MM&WRTTIME_IDTFR_ID=202606&pIndex=1&pSize=100`],
    ["기간없음", `&DTACYCLE_CD=MM&pIndex=1&pSize=100`],
    ["주기없음", `&pIndex=1&pSize=100`],
    ["기간범위(YYYY)", `&DTACYCLE_CD=MM&START_WRTTIME=2026&END_WRTTIME=2026&pIndex=1&pSize=100`],
    ["큰페이지", `&DTACYCLE_CD=MM&START_WRTTIME=202601&END_WRTTIME=202612&pIndex=1&pSize=10000`],
  ];
  const out: ProbeResult[] = [];
  for (const [label, qs] of variants) {
    const url = base + qs;
    try {
      const { status, body } = await getRaw(url);
      let rows = 0;
      try {
        rows = rowsOf(JSON.parse(body)).length;
      } catch {
        rows = -1; // JSON 이 아니다
      }
      out.push({ label, url: url.replace(encodeURIComponent(key), "***"), status, rows, head: body.slice(0, 300).replace(/\s+/g, " ") });
    } catch (e) {
      out.push({ label, url: url.replace(encodeURIComponent(key), "***"), status: 0, rows: -1, head: String(e).slice(0, 200) });
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return out;
}

/** 통계표 목록 — 이름에 keyword 가 들어간 표만 (표 ID를 하드코딩하지 않기 위한 탐색) */
export async function listTables(key: string, keyword: string): Promise<RebTable[]> {
  const found: RebTable[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= 20; page++) {
    const doc = await getJson(`${HOST}/SttsApiTbl.do?KEY=${encodeURIComponent(key)}&Type=json&pIndex=${page}&pSize=100`);
    const rows = rowsOf(doc);
    if (!rows.length) break;
    let added = 0;
    for (const r of rows) {
      const id = pick(r, "STATBL_ID", "statblId");
      const name = pick(r, "TBL_NM", "STATBL_NM", "tblNm");
      if (!id || !name || seen.has(id)) continue;
      seen.add(id);
      added++;
      if (keyword && !name.includes(keyword)) continue;
      found.push({ id, name, cycle: pick(r, "DTACYCLE_CD", "dtacycleCd") || "MM" });
    }
    if (!added) break;
  }
  return found;
}

/**
 * 한 통계표의 월별 계열을 통째로 받는다.
 *
 * R-ONE 은 기간을 한 번에 다 주지 않는 판올림이 있어, **연 단위로 나눠** 요청하고 합친다.
 * 빈 해가 나와도 멈추지 않는다 — 중간이 비어 있을 뿐 뒤에 데이터가 있을 수 있다.
 */
export async function fetchMonthly(
  key: string,
  statblId: string,
  fromYear: number,
  toYear: number,
): Promise<{ points: RebPoint[]; note: string }> {
  const points: RebPoint[] = [];
  const empty: number[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    const url =
      `${HOST}/SttsApiTblData.do?KEY=${encodeURIComponent(key)}&Type=json&pIndex=1&pSize=10000` +
      `&STATBL_ID=${encodeURIComponent(statblId)}&DTACYCLE_CD=MM` +
      `&START_WRTTIME=${y}01&END_WRTTIME=${y}12`;
    let doc: any;
    try {
      doc = await getJson(url);
    } catch (e) {
      // 한 해가 실패해도 나머지는 살린다 — 전체를 버리면 아무것도 못 만든다
      empty.push(y);
      continue;
    }
    const rows = rowsOf(doc);
    let got = 0;
    for (const r of rows) {
      const ymRaw = pick(r, "WRTTIME_IDTFR_ID", "WRTTIME_DESC", "wrttimeIdtfrId");
      const m = ymRaw.match(/^(\d{4})[-.]?(\d{2})/);
      if (!m) continue;
      const raw = pick(r, "DTA_VAL", "dtaVal");
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      const region = pick(r, "CLS_NM", "CLS_FULLNM", "clsNm");
      if (!region) continue;
      points.push({ region, regionCode: pick(r, "CLS_ID", "clsId"), ym: `${m[1]}-${m[2]}`, value });
      got++;
    }
    if (!got) empty.push(y);
  }
  const note = empty.length ? `자료 없음: ${empty.join(",")}` : "";
  return { points, note };
}

/** 지역 → { YYYY-MM: 값 } 으로 접는다. 같은 지역·월이 겹치면 마지막 값을 쓴다. */
export function toSeries(points: RebPoint[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const p of points) {
    (out[p.region] ||= {})[p.ym] = p.value;
  }
  return out;
}

/** 계열에서 가장 최근 관측월 — 수집 시각이 아니라 **데이터가 말하는 시점**을 쓴다(결정성) */
export function latestMonth(series: Record<string, Record<string, number>>): string {
  let max = "";
  for (const r of Object.keys(series)) for (const ym of Object.keys(series[r])) if (ym > max) max = ym;
  return max;
}
