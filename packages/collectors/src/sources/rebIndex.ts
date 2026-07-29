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

/**
 * 재시도하는 JSON GET. 실패 사유는 본문 앞자락과 함께 던진다.
 *
 * ⚠️ 5회로 늘린 이유(2026-07-29): 표 두 개를 57페이지씩 연달아 때리자 R-ONE 이
 *    `fetch failed` 로 끊었다. 3회로는 못 넘겼다. 서버를 두들기는 쪽이 우리이므로
 *    간격도 함께 둔다(아래 fetchMonthly 의 페이지 간 대기).
 */
async function getJson(url: string): Promise<any> {
  let last = "";
  for (let i = 0; i < 5; i++) {
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
    if (i < 4) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
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
/**
 * R-ONE 데이터 응답에서 행 배열과 전체 건수를 꺼낸다.
 *
 * 실측한 실제 응답(2026-07-29 probe):
 *   {"SttsApiTblData":[{"head":[{"list_total_count":56751},{"RESULT":{"CODE":"INFO-000",…}}]},
 *                      {"row":[{ …STATBL_ID, WRTTIME_IDTFR_ID, CLS_ID, CLS_NM, ITM_ID, ITM_NM, DTA_VAL… }]}]}
 * head 와 row 가 **형제 배열 원소**로 나뉘어 있다. 그래서 예전처럼 아무 객체 배열이나
 * 긁으면 head 항목까지 데이터 행으로 세게 된다 — 형태를 알았으니 정확히 짚어 읽는다.
 */
export function readPage(doc: any): { rows: any[]; total: number } {
  const box = doc?.SttsApiTblData;
  if (!Array.isArray(box)) {
    // 오류 응답은 {"RESULT":{"CODE":"ERROR-300",…}} 처럼 껍데기가 없다
    const code = doc?.RESULT?.CODE;
    if (code && code !== "INFO-000") throw new Error(`R-ONE ${code} · ${doc?.RESULT?.MESSAGE || ""}`);
    return { rows: rowsOf(doc), total: 0 }; // 알 수 없는 형태 → 느슨하게 시도
  }
  let rows: any[] = [];
  let total = 0;
  for (const part of box) {
    if (Array.isArray(part?.row)) rows = part.row;
    if (Array.isArray(part?.head)) {
      for (const h of part.head) {
        if (typeof h?.list_total_count === "number") total = h.list_total_count;
        const code = h?.RESULT?.CODE;
        if (code && code !== "INFO-000") throw new Error(`R-ONE ${code} · ${h.RESULT.MESSAGE || ""}`);
      }
    }
  }
  return { rows, total };
}

/** R-ONE 한 번 요청의 상한 (초과하면 ERROR-336). 실측으로 확인한 값. */
const PAGE = 1000;

/**
 * 한 통계표의 **월별 전 계열**을 받는다.
 *
 * ⚠️ 조회 문법을 실측으로 확정했다(2026-07-29 probe). 짐작으로 쓰면 조용히 0건이 온다:
 *   · `START_WRTTIME`/`END_WRTTIME` 은 **먹지 않는다** ("해당하는 데이터가 없습니다")
 *   · 기간을 주려면 `WRTTIME_IDTFR_ID=YYYYMM` (한 달)
 *   · 기간을 아예 안 주면 **전 기간**이 온다 → 페이지로 훑는 편이 요청 수가 훨씬 적다
 *     (한 표 56,751행 = 57페이지 vs 달마다 요청하면 187번)
 *   · `DTACYCLE_CD` 는 필수 (빼면 ERROR-300)
 *   · 한 번에 1,000건 초과 금지 (ERROR-336)
 *
 * 표에는 지수 외 항목(전월비 등)이 섞일 수 있어 **항목 이름이 '지수'인 행만** 쓴다.
 */
export async function fetchMonthly(
  key: string,
  statblId: string,
  fromYear: number,
  toYear: number,
): Promise<{ points: RebPoint[]; note: string }> {
  const points: RebPoint[] = [];
  const notes: string[] = [];
  const base =
    `${HOST}/SttsApiTblData.do?KEY=${encodeURIComponent(key)}&Type=json` +
    `&STATBL_ID=${encodeURIComponent(statblId)}&DTACYCLE_CD=MM&pSize=${PAGE}`;

  let total = 0;
  let seen = 0;
  let skippedItems = 0;
  for (let page = 1; page <= 200; page++) {
    // 서버를 연달아 두들기지 않는다 — 이래서 앞선 수집이 중간에 끊겼다
    if (page > 1) await new Promise((r) => setTimeout(r, 350));
    let got: { rows: any[]; total: number };
    try {
      got = readPage(await getJson(`${base}&pIndex=${page}`));
    } catch (e) {
      /* ⚠️ 여기서 break 하고 "받은 만큼" 돌려주면 안 된다.
       * 그렇게 했다가 3페이지에서 끊긴 반쪽 데이터(2,000행)가 그대로 커밋됐다(2026-07-29).
       * 반쪽 계열로 만든 카드는 오보가 된다 — 조용히 넘기지 말고 여기서 끝낸다. */
      throw new Error(`${statblId} ${page}페이지에서 끊김 — ${String((e as Error)?.message || e).slice(0, 100)}`);
    }
    if (page === 1) total = got.total;
    if (!got.rows.length) break;
    seen += got.rows.length;

    for (const r of got.rows) {
      // 항목이 여러 개인 표가 있다 — '지수'가 아닌 행(전월비 등)은 섞지 않는다
      const item = pick(r, "ITM_NM", "itmNm");
      if (item && !item.includes("지수")) {
        skippedItems++;
        continue;
      }
      const ymRaw = pick(r, "WRTTIME_IDTFR_ID", "wrttimeIdtfrId");
      const m = ymRaw.match(/^(\d{4})(\d{2})$/);
      if (!m) continue;
      const y = Number(m[1]);
      if (y < fromYear || y > toYear) continue; // 표는 2003년부터 온다 — 필요한 구간만 남긴다
      const value = Number(pick(r, "DTA_VAL", "dtaVal"));
      if (!Number.isFinite(value)) continue;
      const region = pick(r, "CLS_NM", "clsNm");
      if (!region) continue;
      points.push({ region, regionCode: pick(r, "CLS_ID", "clsId"), ym: `${m[1]}-${m[2]}`, value });
    }
    if (total && seen >= total) break;
  }

  /* 전체 건수를 알고 있는데 덜 받았다면 그건 실패다. 경고로 남기고 넘어가면
   * "왜 우리 카드에 최근 달이 없지?"를 나중에 눈으로 찾아야 한다. */
  if (total && seen < total) throw new Error(`${statblId}: 전체 ${total}행 중 ${seen}행만 받았다 — 불완전`);
  if (skippedItems) notes.push(`지수 아닌 항목 ${skippedItems}행 제외`);
  return { points, note: notes.join(" / ") };
}

/**
 * 지역코드 → { YYYY-MM: 값 } 으로 접는다.
 *
 * ⚠️ **이름으로 접으면 안 된다.** `중구`·`동구`·`남구`·`북구`·`서구` 는 서울·부산·대구·인천·
 *    광주·대전·울산에 다 있다. 이름을 키로 쓰면 서로 덮어써서 **어느 도시 값인지 알 수 없는
 *    계열**이 만들어진다(2026-07-29 실제로 그렇게 나왔다 — 지역 211개 중 6개가 겹쳤다).
 *    같은 종류의 사고를 이미 한 번 겪었다: 서울 랭킹 카드에 경기도가 섞였던 일.
 *    **코드가 정체성이다.** 이름은 표시용으로만 따로 들고 다닌다.
 */
export function toSeries(points: RebPoint[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const p of points) {
    const key = p.regionCode || p.region; // 코드가 없으면 이름이라도 (구형 응답 방어)
    (out[key] ||= {})[p.ym] = p.value;
  }
  return out;
}

/** 코드 → 이름 표. 이름은 표시용이고, 계열의 정체성은 코드다. */
export function regionNames(points: RebPoint[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of points) if (p.regionCode) out[p.regionCode] = p.region;
  return out;
}

/**
 * 같은 이름이 여러 코드에 걸린 것을 찾아낸다 — 카드에 쓰기 전에 반드시 본다.
 * 이름만으로 "노원구"를 집는 코드는 언젠가 다른 도시의 동명 구를 집는다.
 */
export function ambiguousNames(names: Record<string, string>): Record<string, string[]> {
  const byName: Record<string, string[]> = {};
  for (const [code, name] of Object.entries(names)) (byName[name] ||= []).push(code);
  const dup: Record<string, string[]> = {};
  for (const [name, codes] of Object.entries(byName)) if (codes.length > 1) dup[name] = codes;
  return dup;
}

/** 계열에서 가장 최근 관측월 — 수집 시각이 아니라 **데이터가 말하는 시점**을 쓴다(결정성) */
export function latestMonth(series: Record<string, Record<string, number>>): string {
  let max = "";
  for (const r of Object.keys(series)) for (const ym of Object.keys(series[r])) if (ym > max) max = ym;
  return max;
}
