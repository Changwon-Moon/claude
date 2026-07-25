/**
 * 신고가 지도 — 서울 구별 '올해 최고 실거래 경신' 건수 코로플레스 + TOP 순위.
 * 판정: (구|단지|법정동|전용면적) 그룹에서 이력 3건+ 있을 때 누적최고 경신 = 신고가 경신(이상치 방지).
 * 킬러 인사이트: 신고가 경신은 강남 3구가 아니라 노원·성북·강서 등에서 쏟아진다(건수·비율 모두).
 * 모든 수치는 raw 실거래에서 코드 산출(창작 금지). 지도·색은 결정적.
 * ⚠️ 캐시가 2026 상반기(1~6월)뿐 → '역대 신고가' 아닌 '올해 최고 실거래 경신'으로 라벨.
 * 실행: node scripts/build-singoga-map.mjs [latestMonth=202606] [date=2026-07-23] [topN=8]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const latest = process.argv[2] || "202606";
const date = process.argv[3] || "2026-07-23";
const topN = parseInt(process.argv[4] || "8", 10);
const latestPrefix = `${latest.slice(0, 4)}-${latest.slice(4, 6)}`;

// ── 실거래 → 구별 신고가 경신 건수·거래수·비율 ──
const molitDir = join(ROOT, "data/datasets/molit");
// ⚠️ 서울(법정동코드 11xxx)만. 경기(41xxx) 캐시가 같은 폴더에 있으므로 반드시 필터링한다.
const files = readdirSync(molitDir).filter((f) => /^11\d{3}-\d{6}\.json$/.test(f));
const yms = [...new Set(files.map((f) => f.match(/-(\d{6})\.json$/)?.[1]).filter(Boolean))].sort();
const groups = new Map();
const totalByGu = {};
let verified = true;
for (const f of files) {
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  if (d.meta?.verified === false) verified = false;
  const gu = d.meta.gu;
  for (const t of d.trades) {
    if (t.canceled) continue;
    totalByGu[gu] = (totalByGu[gu] || 0) + 1;
    const k = `${gu}|${t.aptNm}|${t.umdNm}|${Math.round(t.area)}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push({ p: t.priceWon, d: t.date, gu });
  }
}
const hitByGu = {};
for (const [, arr] of groups) {
  if (arr.length < 3) continue;
  arr.sort((a, b) => (a.d < b.d ? -1 : 1));
  let mx = -1;
  for (let i = 0; i < arr.length; i++) {
    const r = arr[i];
    if (i >= 2 && r.p > mx && r.d >= `${latestPrefix}-01`) hitByGu[r.gu] = (hitByGu[r.gu] || 0) + 1;
    if (r.p > mx) mx = r.p;
  }
}
const stat = Object.keys(totalByGu).map((gu) => {
  const hits = hitByGu[gu] || 0, total = totalByGu[gu];
  return { gu, hits, total, ratio: Math.round((hits / total) * 1000) / 10 };
});
const byHits = [...stat].sort((a, b) => b.hits - a.hits);
const totalHits = stat.reduce((s, r) => s + r.hits, 0);
// 반전 근거: 강남 3구 순위(하위권 확인)
const rankOf = (g) => byHits.findIndex((r) => r.gu === g) + 1;
const laggards = ["강남구", "서초구", "송파구"].map((g) => ({
  gu: g.replace(/구$/, ""), hits: hitByGu[g] || 0, rank: rankOf(g),
}));
const hitMap = Object.fromEntries(stat.map((r) => [r.gu, r.hits]));
const maxHits = Math.max(...stat.map((r) => r.hits));

// ── 코로플레스(건수 히트맵) ──
const C_LO = [255, 226, 219], C_HI = [176, 11, 30];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const norm = (h) => (maxHits ? h / maxHits : 0);
const fill = (h) => `rgb(${lerp(C_LO[0], C_HI[0], norm(h))},${lerp(C_LO[1], C_HI[1], norm(h))},${lerp(C_LO[2], C_HI[2], norm(h))})`;
const textCol = (h) => (norm(h) > 0.5 ? "#ffffff" : "#26303d");

const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of geo.features) for (const r of rings(f.geometry)) for (const [lo, la] of r) {
  minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo); minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
}
const kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
const W = 1000, scale = W / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale), PAD = 6;
const px = (lo) => PAD + (lo - minLon) * kx * scale, py = (la) => PAD + (maxLat - la) * scale;

let paths = "", labels = "";
for (const f of geo.features) {
  const name = f.properties.name, h = hitMap[name] ?? 0;
  let d = "", big = null, bl = 0;
  for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > bl) { bl = ring.length; big = ring; }
  }
  paths += `<path class="sm-geo" d="${d}" fill="${fill(h)}"/>`;
  const pts = big.map(([lo, la]) => [px(lo), py(la)]);
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
  if (Math.abs(A) < 1e-6) { cx = pts.reduce((s, q) => s + q[0], 0) / pts.length; cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; }
  else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
  const tc = textCol(h);
  labels += `<text class="sm-lab" x="${cx.toFixed(0)}" y="${cy.toFixed(0)}" fill="${tc}">` +
    `<tspan class="n" x="${cx.toFixed(0)}">${name.replace(/구$/, "")}</tspan>` +
    `<tspan class="c" x="${cx.toFixed(0)}" dy="34">${h}</tspan></text>`;
}
const mapSvg = `<svg viewBox="0 0 ${W + PAD * 2} ${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.sm-lab{text-anchor:middle}.sm-lab .n{font-size:30px;font-weight:800}.sm-lab .c{font-size:31px;font-weight:900;font-family:'Wanted Sans','Pretendard',sans-serif}</style>` +
  `${paths}${labels}</svg>`;

// ── TOP 순위(건수) ──
const MEDALS = ["🥇", "🥈", "🥉"];
const rows = byHits.slice(0, topN).map((r, i) => ({
  rank: i + 1, medal: MEDALS[i] || "", top: i < 3,
  gu: r.gu, hits: r.hits, ratio: r.ratio.toFixed(1),
}));

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "singoga-map@1",
  date,
  note: "국토부 실거래 · 서울 25개 자치구",
  title: `신고가는 <span class="hi">강남</span>이 아니었다`,
  subtitle: `${latestPrefix.replace("-", "년 ")}월 · 구별 신고가(올해 최고 실거래) 경신 건수`,
  mapSvg,
  rows,
  cta: {
    title: `그런데 <b>강남 3구</b>는? 🥶`,
    rows: laggards.map((l) => ({ k: l.gu, v: `${l.hits}건`, n: `${l.rank}위` })),
  },
  footnote: `2026 상반기 서울 신고가 경신 <b>${totalHits}건</b> · 강남·서초·송파는 TOP 밖`,
  laggards,
  totalHits,
  source: { name: "국토부 아파트 실거래가 · 서울시 행정경계", period: "2026 상반기(1~6월)", verified },
};
writeFileSync(join(outDir, `singoga-map.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ 신고가 지도 — 총 ${totalHits}건 · TOP ${rows.map((r) => `${r.gu}${r.hits}`).join(" ")} (검증=${verified})`);
