/**
 * 한국부동산원 R-ONE — **주간** 아파트 매매·전세 가격지수 수집 (1차 출처).
 *
 * ── 왜 별도 모듈인가
 * 기존 rebIndex 는 '월간(MM)만' 받도록 못박혀 있다(주간은 표본·기준이 다른 별개 표).
 * 주간 매매/전세 누적 상승률 카드(연속 상승 국면 비교)는 **주간 계열**이 있어야 하므로
 * 검증된 월간 코드를 건드리지 않고 주간 경로를 따로 둔다. 공용 헬퍼(getJson·readPage·pick 등)는
 * rebIndex 에서 재사용한다.
 *
 * ── 시점 식별자
 * 월간은 WRTTIME_IDTFR_ID 가 YYYYMM 이지만, 주간은 조사기준일 YYYYMMDD(또는 YYYYMM) 로 온다.
 * 형태를 단정하지 않고 6~8자리 숫자를 그대로 **정렬 가능한 키(t)** 로 보존한다. 누적 계산은
 * 빌더가 t 순서로 한다(수집기는 원자료만, 파생은 빌더 — ARCHITECTURE 원칙).
 *
 * RONE_API_KEY 필요. 세션은 reb.or.kr 네트워크 차단이라 **GitHub Actions 에서 실행한다.**
 */
import { getJson, readPage, pick, type RebTable } from "./rebIndex.js";

const HOST = "https://www.reb.or.kr/r-one/openapi";
const PAGE = 1000; // R-ONE 한 요청 상한 (초과 시 ERROR-336)

export interface WeekPoint {
  region: string;
  regionCode: string;
  /** 정렬 가능한 원시 시점 키 (YYYYMMDD 또는 YYYYMM) */
  t: string;
  value: number;
}

/**
 * 주간 매매/전세 '지수' 표를 이름으로 고른다. 월간 chooseTable 과 반대로 **매매를 살린다.**
 * 함정(오피스텔·규모별·계절조정·평균/중위·전월비·수급) 은 떨어뜨린다. 애매하면 null → 사람이 --discover 로 확인.
 */
const EXCLUDE = /오피스텔|규모별|연령별|계절조정|준전세|준월세|수급|평균|중위|전월비|전주비|대비/;
export function chooseWeeklyTable(tables: RebTable[], want: "매매" | "전세"): RebTable | null {
  const scored = tables
    .filter((t) => t.cycle === "WK" || /주간|주\)/.test(t.name)) // 주간 계열
    .filter((t) => t.name.includes(want) && t.name.includes("지수"))
    .filter((t) => !EXCLUDE.test(t.name))
    .map((t) => {
      let s = 0;
      if (t.name.includes("아파트")) s += 5; // 카드는 아파트 기준으로 통일
      if (/주간|\(주\)|WK/i.test(t.name) || t.cycle === "WK") s += 2;
      return { t, s };
    })
    .sort((a, b) => b.s - a.s);
  return scored.length && scored[0].s > 0 ? scored[0].t : null;
}

/** 주간 데이터 조회 형태를 실측한다(월간 probe 의 주간판) — 0건이면 파라미터를 눈으로 고른다. */
export interface WeeklyProbe { label: string; url: string; status: number; rows: number; head: string; }
export async function probeWeekly(key: string, statblId: string): Promise<WeeklyProbe[]> {
  const base = `${HOST}/SttsApiTblData.do?KEY=${encodeURIComponent(key)}&Type=json&STATBL_ID=${encodeURIComponent(statblId)}`;
  const variants: [string, string][] = [
    ["주기WK·기간없음", `&DTACYCLE_CD=WK&pIndex=1&pSize=100`],
    ["주기WK·단일시점8", `&DTACYCLE_CD=WK&WRTTIME_IDTFR_ID=20260727&pIndex=1&pSize=100`],
    ["주기WK·단일시점6", `&DTACYCLE_CD=WK&WRTTIME_IDTFR_ID=202607&pIndex=1&pSize=100`],
    ["주기없음", `&pIndex=1&pSize=100`],
    ["큰페이지WK", `&DTACYCLE_CD=WK&pIndex=1&pSize=10000`],
  ];
  const out: WeeklyProbe[] = [];
  for (const [label, qs] of variants) {
    const url = base + qs;
    try {
      const doc = await getJson(url);
      let rows = 0;
      try { rows = readPage(doc).rows.length; } catch { rows = -1; }
      out.push({ label, url: url.replace(encodeURIComponent(key), "***"), status: 200, rows, head: JSON.stringify(doc).slice(0, 300) });
    } catch (e) {
      out.push({ label, url: url.replace(encodeURIComponent(key), "***"), status: 0, rows: -1, head: String(e).slice(0, 200) });
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return out;
}

/**
 * 한 통계표의 **주간 전 계열**을 받는다. 월간 fetchMonthly 와 같은 안전장치:
 *   · 페이지 간 대기(서버 과부하 방지) · 중간 끊김은 throw(반쪽 저장 금지)
 *   · 전체 건수(total)를 알면 덜 받았을 때 실패로 본다
 * 다른 점: DTACYCLE_CD=WK, 시점은 6~8자리 원시 키(t)로 보존.
 */
export async function fetchWeekly(
  key: string,
  statblId: string,
  wantItem?: (itemName: string) => boolean,
): Promise<{ points: WeekPoint[]; note: string }> {
  const points: WeekPoint[] = [];
  const notes: string[] = [];
  const itemsSeen = new Set<string>();
  const base =
    `${HOST}/SttsApiTblData.do?KEY=${encodeURIComponent(key)}&Type=json` +
    `&STATBL_ID=${encodeURIComponent(statblId)}&DTACYCLE_CD=WK&pSize=${PAGE}`;
  let total = 0, seen = 0, skipped = 0;
  for (let page = 1; page <= 400; page++) {
    if (page > 1) await new Promise((r) => setTimeout(r, 350));
    let got: { rows: any[]; total: number };
    try {
      got = readPage(await getJson(`${base}&pIndex=${page}`));
    } catch (e) {
      throw new Error(`${statblId} ${page}페이지에서 끊김 — ${String((e as Error)?.message || e).slice(0, 100)}`);
    }
    if (page === 1) total = got.total;
    if (!got.rows.length) break;
    seen += got.rows.length;
    for (const r of got.rows) {
      const item = pick(r, "ITM_NM", "itmNm");
      if (item) {
        itemsSeen.add(item);
        if (wantItem && !wantItem(item)) { skipped++; continue; }
      }
      const raw = pick(r, "WRTTIME_IDTFR_ID", "wrttimeIdtfrId");
      const m = raw.match(/^(\d{6,8})$/);
      if (!m) continue;
      const value = Number(pick(r, "DTA_VAL", "dtaVal"));
      if (!Number.isFinite(value)) continue;
      const region = pick(r, "CLS_NM", "clsNm");
      if (!region) continue;
      points.push({ region, regionCode: pick(r, "CLS_ID", "clsId"), t: m[1], value });
    }
    if (total && seen >= total) break;
  }
  if (total && seen < total) throw new Error(`${statblId}: 전체 ${total}행 중 ${seen}행만 받았다 — 불완전`);
  if (skipped) notes.push(`항목 조건에 안 맞아 ${skipped}행 제외`);
  if (itemsSeen.size) notes.push(`항목: ${[...itemsSeen].join(", ")}`);
  if (!points.length) {
    throw new Error(`${statblId}: 조건에 맞는 주간 행이 없다 — 받은 항목 [${[...itemsSeen].join(", ") || "없음"}]. --probe 로 조회 형태를 확인하라.`);
  }
  return { points, note: notes.join(" / ") };
}

/** 지역코드 → { t: 값 }. 이름이 아니라 **코드**로 접는다(동명 구 덮어쓰기 방지 — rebIndex 와 같은 이유). */
export function toWeekSeries(points: WeekPoint[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const p of points) (out[p.regionCode || p.region] ||= {})[p.t] = p.value;
  return out;
}

export function weekRegionNames(points: WeekPoint[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of points) if (p.regionCode) out[p.regionCode] = p.region;
  return out;
}

/** 계열에서 가장 최근 시점 키(t) — 수집 시각이 아니라 데이터가 말하는 시점(결정성) */
export function latestT(series: Record<string, Record<string, number>>): string {
  let max = "";
  for (const r of Object.keys(series)) for (const t of Object.keys(series[r])) if (t > max) max = t;
  return max;
}
