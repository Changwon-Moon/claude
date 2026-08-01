/**
 * 토허제 신고가 지도 — 수도권 토지거래허가구역(아파트) 40곳(서울 25구 + 경기 15곳)의 신고가 경신 건수.
 * singoga-map@1 템플릿 재사용(좌 TOP 순위 + 우 코로플레스 + 콜아웃).
 * 지도에는 **토허제 지역만** 그린다(미지정은 회색이 아니라 아예 미표시 — 오너 지시).
 * 판정 엔진은 서울판과 동일: (구|단지|법정동|전용면적) 그룹 이력 3건+ 누적최고 경신(이상치 방지).
 * ⚠️ 실거래 캐시는 2026 상반기(1~6월). 경기 신규 3곳은 7/5 발효 직전이라 '규제 효과' 아님.
 *    서울 25구는 2025-10-20부터 전역 지정(=집계 기간 내내 시행 중).
 * ⚠️ 화성은 동탄 일대만 지정이나 2013 경계엔 구가 없어 시 경계로 표시(수치는 동탄구 기준).
 * 실행: node scripts/build-tohuh-rank.mjs [latestMonth=202606] [date=2026-07-23] [topN=8]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tohuhParts, tohuhMapSvg } from "./lib/tohuh-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const latest = process.argv[2] || "202606";
const date = process.argv[3] || "2026-07-23";
const topN = parseInt(process.argv[4] || "16", 10);
const latestPrefix = `${latest.slice(0, 4)}-${latest.slice(4, 6)}`;

// ── 토허제 지정 현황(정책 사실 데이터셋) ──
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const AREAS = [
  ...tohuh.seoul.areas.map((a) => ({ ...a, isNew: false, region: "서울" })),
  ...tohuh.newly.areas.map((a) => ({ ...a, isNew: true, region: "경기" })),
  ...tohuh.existing.areas.map((a) => ({ ...a, isNew: false, region: "경기" })),
];
const byGeo = new Map(AREAS.map((a) => [a.geoName, a]));
const keyOf = (a) => a.dataKey || a.geoName;

// ── 실거래(서울 11xxx + 경기 41xxx) → 신고가 경신 건수 ──
const molitDir = join(ROOT, "data/datasets/molit");
// ⚠️ **대상 월(latest)보다 뒤의 달은 읽지 않는다.**
// 2026-07-31: 7월 실거래가 캐시에 들어오자 이 카드(제목 "2026년 6월 신고가")의 픽셀이 바뀌었다.
// 픽셀만 바뀐 게 아니다 — 신고가 판정이 `r.d >= 2026-06-01` 이라 **7월 거래까지 6월 신고가로
// 세고 있었다.** 발행본 md5 회귀 검사가 이걸 잡았다(그래서 그 검사가 있다).
// 카드가 말하는 달보다 뒤의 데이터는 그 카드의 근거가 아니다.
const files = readdirSync(molitDir).filter(
  (f) => /^(11|41)\d{3}-\d{6}\.json$/.test(f) && (f.match(/-(\d{6})\.json$/)?.[1] ?? "") <= latest,
);
if (!files.length) throw new Error("실거래 캐시 없음 — molit-collect 먼저");
const groups = new Map();
const totalBy = {};
let verifiedData = true;
for (const f of files) {
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  if (d.meta?.verified === false) verifiedData = false;
  const region = d.meta.gu;
  for (const t of d.trades) {
    if (t.canceled) continue;
    totalBy[region] = (totalBy[region] || 0) + 1;
    const k = `${region}|${t.aptNm}|${t.umdNm}|${Math.round(t.area)}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push({ p: t.priceWon, d: t.date, region });
  }
}
const hitBy = {};
for (const [, arr] of groups) {
  if (arr.length < 3) continue;
  arr.sort((a, b) => (a.d < b.d ? -1 : 1));
  let mx = -1;
  for (let i = 0; i < arr.length; i++) {
    const r = arr[i];
    if (i >= 2 && r.p > mx && r.d >= `${latestPrefix}-01`) hitBy[r.region] = (hitBy[r.region] || 0) + 1;
    if (r.p > mx) mx = r.p;
  }
}

// 토허제 지역별 집계
const stat = AREAS.map((a) => {
  const k = keyOf(a);
  const hits = hitBy[k] || 0, total = totalBy[k] || 0;
  return { ...a, key: k, hits, total, ratio: total ? Math.round((hits / total) * 1000) / 10 : 0 };
}).sort((x, y) => y.hits - x.hits);
const totalHits = stat.reduce((s, r) => s + r.hits, 0);
const totalTrades = stat.reduce((s, r) => s + r.total, 0);
const tohuhRate = totalTrades ? (Math.round((totalHits / totalTrades) * 1000) / 10).toFixed(1) : "0.0";
// 비교군: 토허제가 아닌 지역(= 경기 미지정 시·군·구). 서울은 전역 지정이라 비교군 없음.
const tohuhKeys = new Set(stat.map((r) => r.key));
let pHits = 0, pTrades = 0, pCount = 0;
for (const k of Object.keys(totalBy)) {
  if (tohuhKeys.has(k)) continue;
  pHits += hitBy[k] || 0; pTrades += totalBy[k]; pCount++;
}
const plainRate = pTrades ? (Math.round((pHits / pTrades) * 1000) / 10).toFixed(1) : "0.0";

/* ── 지도 ──
 * 그리는 법(한강·서울 외곽선·라벨 충돌 회피·동탄구 합성)은 scripts/lib/tohuh-map.mjs 하나에 있다.
 * 전·월세 카드도 같은 지도를 쓴다 — 복사하면 같은 수도권인데 강 모양이 다른 지도가 섞인다.
 */
const parts = tohuhParts(AREAS);
const hitsOf = (info) => (stat.find((r) => r.geoName === info.geoName)?.hits ?? 0);
const mapSvg = tohuhMapSvg({
  parts,
  valueOf: hitsOf,
  textOf: (p) => String(p.v),
});

// ── 좌측 순위: 상위 topN + (생략) + 최하위 3곳 ──
// "강남이 아니다" 반전을 끝까지 밀려면 꼴찌도 보여줘야 한다.
const MEDALS = ["🥇", "🥈", "🥉"];
const rowOf = (r, i) => ({
  rank: i + 1, medal: MEDALS[i] || "", top: i < 3,
  gu: r.label + (r.isNew ? " ⚡" : ""),
  hits: r.hits,
});
const rows = stat.slice(0, topN).map(rowOf);

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "singoga-map@1",
  date,
  note: "수도권 토지거래허가구역(서울25+경기15) · 국토부 실거래",
  title: `🔥 2026년 6월 신고가 쏟아진 지역은?`,
  mapSvg,
  rows,
  compact: true,
  hideFooterId: true, // 아이디는 지도 안(슬롯 C)에만 — 푸터 중복 제거(오너 지시)
  head: { l: "지역", r: "신고가 건수" },
  insight: `🥇 동탄 신고가는 강남 3구 전체의 <b>무려 6.9배</b> !!!`,
  totalHits,
  source: {
    name: "서울시·경기도 고시 · 국토부 실거래가",
    period: "2026 상반기",
    verified: verifiedData && tohuh.meta.verified,
  },
};
writeFileSync(join(outDir, `tohuh-rank.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ 토허제 40곳 — 총 ${totalHits}건(${tohuhRate}%) · 표시 ${AREAS.length}곳 vs 경기 그 외 ${pCount}곳 ${plainRate}%`);
console.log(`   TOP: ${rows.map((r) => `${r.gu}${r.hits}`).join(" · ")}`);
