/**
 * 서울 행정구별 대장 APT — 코로플레스 지도(축소) + 구별 최고가 순위표. 2장 캐러셀.
 *   p1: 순위 1~13 · p2: 순위 14~25 (지도는 양쪽 공통, 히트맵)
 * data/geo/seoul-districts.geojson + data/datasets/molit/*.json(최근 6개월) 사용.
 * 실행: node scripts/build-map-rank.mjs <84|59> [date]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const metric = process.argv[2] || "84";
const date = process.argv[3] || "2026-07-21";
const BAND = metric === "59" ? [58, 61] : [83, 86];
const PYEONG = metric === "59" ? "25평" : "34평";

// 최근 6개월만 사용
const molitDir = join(ROOT, "data/datasets/molit");
const files = readdirSync(molitDir).filter((f) => f.endsWith(".json"));
const yms = [...new Set(files.map((f) => f.match(/-(\d{6})\.json$/)?.[1]).filter(Boolean))].sort();
const use6 = yms.slice(-6);
const byGu = {};
for (const f of files) {
  const ym = f.match(/-(\d{6})\.json$/)?.[1];
  if (!use6.includes(ym)) continue;
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  (byGu[d.meta.gu] ??= []).push(...d.trades);
}
const guTop = {};
for (const [gu, txs] of Object.entries(byGu)) {
  const best = new Map();
  for (const t of txs) {
    if (t.canceled || !t.priceWon || !t.aptNm) continue;
    if (!(t.area >= BAND[0] && t.area < BAND[1])) continue;
    const k = `${t.aptNm}|${t.umdNm}`;
    if (!best.has(k) || t.priceWon > best.get(k).priceWon) best.set(k, t);
  }
  const top = [...best.values()].sort((a, b) => b.priceWon - a.priceWon)[0];
  if (top) guTop[gu] = { price: top.priceWon / 1e8, apt: top.aptNm };
}
const ranked = Object.entries(guTop).map(([gu, v]) => ({ gu, ...v })).sort((a, b) => b.price - a.price);
const prices = ranked.map((r) => r.price);
const mn = Math.min(...prices), mx = Math.max(...prices);
const eok = (v) => (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1));
const asOf = use6.length ? `${use6[0].slice(0,4)}.${+use6[0].slice(4)}~${use6.at(-1).slice(4)}월` : "최근 6개월";

// ── 색상(빨강 히트맵) ──
const C_LO = [255, 224, 217], C_HI = [176, 11, 30];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const norm = (p) => (mx === mn ? 0.5 : (p - mn) / (mx - mn));
const fill = (p) => `rgb(${lerp(C_LO[0], C_HI[0], norm(p))},${lerp(C_LO[1], C_HI[1], norm(p))},${lerp(C_LO[2], C_HI[2], norm(p))})`;
const textCol = (p) => (norm(p) > 0.45 ? "#ffffff" : "#1c2431");

// ── GeoJSON → SVG (구명만 라벨, 가격은 표로) ──
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
  const name = f.properties.name, info = guTop[name];
  const p = info ? info.price : mn;
  let d = "", big = null, bl = 0;
  for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > bl) { bl = ring.length; big = ring; }
  }
  paths += `<path class="mr-geo" d="${d}" fill="${info ? fill(p) : "#e8eaed"}"/>`;
  const pts = big.map(([lo, la]) => [px(lo), py(la)]);
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
  if (Math.abs(A) < 1e-6) { cx = pts.reduce((s, q) => s + q[0], 0) / pts.length; cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; }
  else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
  labels += `<text class="mr-lab" x="${cx.toFixed(0)}" y="${(cy + 10).toFixed(0)}" fill="${info ? textCol(p) : "#98a2b3"}"><tspan class="g" x="${cx.toFixed(0)}">${name.replace(/구$/, "")}</tspan></text>`;
}
const mapSvg = `<svg viewBox="0 0 ${W + PAD * 2} ${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg"><style>.mr-lab .g{font-size:34px}</style>${paths}${labels}</svg>`;

// ── 콘텐츠 2장 ──
const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const source = { name: "국토부 실거래가 · 서울시 행정경계", asOf };
const toRow = (r, i) => ({ rank: i + 1, gu: r.gu, apt: r.apt, price: eok(r.price), cls: i < 3 ? `r${i + 1}` : "" });
const rowsAll = ranked.map(toRow);
const base = {
  template: "map-rank@1", date, mapSvg,
  subtitle: `전용 ${metric}㎡ 기준 · 최근 6개월 최고 실거래`,
  title: `서울 행정구별 ${PYEONG} 대장 APT`,
  source,
};
const half = Math.ceil(rowsAll.length / 2); // 13
writeFileSync(join(outDir, `maprank-${metric}-p1.json`), JSON.stringify({ ...base, rows: rowsAll.slice(0, half) }, null, 2) + "\n");
writeFileSync(join(outDir, `maprank-${metric}-p2.json`), JSON.stringify({ ...base, rows: rowsAll.slice(half) }, null, 2) + "\n");
console.log(`✅ ${PYEONG}(전용${metric}) 2장 — ${ranked.length}개구 · 1위 ${ranked[0].gu} ${ranked[0].apt} ${eok(mx)}억 · 기간 ${asOf}`);
