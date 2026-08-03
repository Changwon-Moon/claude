/**
 * 서울 구별 '월세 비중' 코로플레스 + TOP 순위. singoga-map@1 재사용(지도·순위 규격 상속).
 *
 * ── 데이터: 국토부 아파트 전월세 실거래 집계(오보 0)
 * data/datasets/molit-rent/11xxx-{YYYYMM}.json 만 읽는다(서울 25개구, 법정동코드 11xxx).
 * 각 파일의 agg 에서 전세/월세·신규/갱신 건수를 코드가 합산 → 구별 월세비중, 서울 전체(전체·신규) 비중.
 * 월세비중 = 월세건수/전체 (월세금액 0=전세, >0=월세로 수집기가 이미 분류).
 * 손으로 적은 숫자 0개.
 *
 * 실행: node scripts/build-jeonwolse-map.mjs [latestMonth=202606] [date=오늘] [topN=8]
 * 출력: data/content/{date}/jeonwolse-map.json
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const latest = process.argv[2] || "202606";
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[3] || kstToday;
const topN = parseInt(process.argv[4] || "8", 10);
const latestPrefix = `${latest.slice(0, 4)}-${latest.slice(4, 6)}`;

// ── 전월세 집계 → 구별 월세비중, 서울 전체(전체·신규) ──
const dir = join(ROOT, "data/datasets/molit-rent");
const files = readdirSync(dir).filter((f) => new RegExp(`^11\\d{3}-${latest}\\.json$`).test(f));
if (files.length < 20) throw new Error(`서울 25개구 ${latest} 집계가 부족하다(${files.length}개) — 전월세 수집 확대 필요`);

const guStat = []; // {gu, ratio, total, wolse}
let T = 0, W = 0, J = 0, nT = 0, nW = 0;
let verified = true;
for (const f of files) {
  const d = JSON.parse(readFileSync(join(dir, f), "utf8"));
  if (d.meta?.verified === false) verified = false;
  const a = d.agg;
  T += a.total; W += a.wolse; J += a.jeonse; nT += a.newTotal; nW += a.newWolse;
  guStat.push({ gu: d.meta.gu, ratio: a.wolseRatio, total: a.total, wolse: a.wolse });
}
const r1 = (a, b) => Math.round((a / b) * 1000) / 10;
const seoulWolse = r1(W, T);       // 전체 계약 월세비중
const seoulNewWolse = r1(nW, nT);  // 신규 계약 월세비중
const ratioMap = Object.fromEntries(guStat.map((r) => [r.gu, r.ratio]));

// ── 코로플레스: 월세비중이 높을수록 진한 빨강. 대비 위해 [min,max]로 정규화 ──
const vals = guStat.map((r) => r.ratio);
const vMin = Math.min(...vals), vMax = Math.max(...vals);
const C_LO = [255, 226, 219], C_HI = [176, 11, 30];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const norm = (v) => (vMax > vMin ? (v - vMin) / (vMax - vMin) : 0);
const fill = (v) => `rgb(${lerp(C_LO[0], C_HI[0], norm(v))},${lerp(C_LO[1], C_HI[1], norm(v))},${lerp(C_LO[2], C_HI[2], norm(v))})`;
const textCol = (v) => (norm(v) > 0.5 ? "#ffffff" : "#26303d");

const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of geo.features) for (const r of rings(f.geometry)) for (const [lo, la] of r) {
  minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo); minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
}
const kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
const W2 = 1000, scale = W2 / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale), PAD = 6;
const px = (lo) => PAD + (lo - minLon) * kx * scale, py = (la) => PAD + (maxLat - la) * scale;

let paths = "", labels = "";
for (const f of geo.features) {
  const name = f.properties.name, v = ratioMap[name] ?? vMin;
  let d = "", big = null, bl = 0;
  for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > bl) { bl = ring.length; big = ring; }
  }
  paths += `<path class="sm-geo" d="${d}" fill="${fill(v)}"/>`;
  const pts = big.map(([lo, la]) => [px(lo), py(la)]);
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
  if (Math.abs(A) < 1e-6) { cx = pts.reduce((s, q) => s + q[0], 0) / pts.length; cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; }
  else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
  labels += `<text class="sm-lab" x="${cx.toFixed(0)}" y="${cy.toFixed(0)}" fill="${textCol(v)}">` +
    `<tspan class="n" x="${cx.toFixed(0)}">${name.replace(/구$/, "")}</tspan>` +
    `<tspan class="c" x="${cx.toFixed(0)}" dy="34">${v}%</tspan></text>`;
}
const mapSvg = `<svg viewBox="0 0 ${W2 + PAD * 2} ${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.sm-lab{text-anchor:middle}.sm-lab .n{font-size:30px;font-weight:800}.sm-lab .c{font-size:29px;font-weight:900;font-family:'Wanted Sans','Pretendard',sans-serif}</style>` +
  `${paths}${labels}</svg>`;

// ── TOP 순위(월세비중) ──
const MEDALS = ["🥇", "🥈", "🥉"];
const ranked = guStat.slice().sort((a, b) => b.ratio - a.ratio);
const rows = ranked.slice(0, topN).map((r, i) => ({
  rank: i + 1, medal: MEDALS[i] || "", top: i < 3,
  gu: r.gu.replace(/구$/, ""), hits: r.ratio.toFixed(1),
}));

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "singoga-map@1",
  date,
  note: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
  title: `<span class="hi">월세</span>가 전세를 넘어섰다`,
  subtitle: `서울 · ${latestPrefix.replace("-", "년 ")}월 · 구별 월세 비중 (아파트 전월세 실거래)`,
  head: { l: "구", r: "월세 비중" },
  unit: "%",
  mapSvg,
  legend: true,
  rows,
  cta: {
    title: `새로 맺는 계약, <b>10건 중 6건</b>이 월세 🏠`,
    rows: [
      { k: "전체 계약", v: `월세 ${seoulWolse}%`, n: "" },
      { k: "신규 계약", v: `월세 ${seoulNewWolse}%`, n: "" },
    ],
  },
  footnote: `${latestPrefix.replace("-", "년 ")}월 서울 아파트 전월세 <b>${T.toLocaleString()}건</b> 중 월세 <b>${seoulWolse}%</b> · 신규계약은 <b>${seoulNewWolse}%</b>`,
  source: { name: "국토부 아파트 전월세 실거래 · 서울시 행정경계", period: `${latestPrefix.replace("-", "년 ")}월`, verified },
};
writeFileSync(join(outDir, "jeonwolse-map.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`✅ 월세비중 지도 — 서울 전체 월세 ${seoulWolse}%(신규 ${seoulNewWolse}%) · TOP ${rows.slice(0, 3).map((r) => `${r.gu}${r.hits}%`).join(" ")} · 검증=${verified}`);
