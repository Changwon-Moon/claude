/**
 * 서울 구별 전용면적 최고가 코로플레스 지도 카드.
 * data/geo/seoul-districts.geojson(경계) + data/datasets/molit/*.json(실거래) → map-{metric} 콘텐츠.
 * 빨강 히트맵(비쌀수록 진함) + 구별 이름·가격 라벨.
 * 실행: node scripts/build-map-card.mjs <84|59> [date]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const metric = process.argv[2] || "84";
const date = process.argv[3] || "2026-07-21";
const BAND = metric === "59" ? [58, 61] : [83, 86];

// ── 1) 실거래 → 구별 밴드 최고가 ──
const molitDir = join(ROOT, "data/datasets/molit");
const byGu = {};
for (const f of readdirSync(molitDir).filter((f) => f.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  (byGu[d.meta.gu] ??= []).push(...d.trades);
}
const asOf = "2026-05~06";
const guTop = {}; // 구 → {price(억), apt}
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
const vals = Object.values(guTop).map((v) => v.price);
const mn = Math.min(...vals), mx = Math.max(...vals);
const topGuName = Object.entries(guTop).sort((a, b) => b[1].price - a[1].price)[0][0];
const eok = (v) => (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1));

// ── 2) 색상(빨강 히트맵) ──
const C_LO = [255, 224, 217], C_HI = [176, 11, 30];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const norm = (p) => (p - mn) / (mx - mn);
const fill = (p) => `rgb(${lerp(C_LO[0], C_HI[0], norm(p))},${lerp(C_LO[1], C_HI[1], norm(p))},${lerp(C_LO[2], C_HI[2], norm(p))})`;
const textCol = (p) => (norm(p) > 0.45 ? "#ffffff" : "#1c2431");

// ── 3) GeoJSON → SVG 투영 ──
const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (geom) =>
  geom.type === "Polygon" ? geom.coordinates : geom.type === "MultiPolygon" ? geom.coordinates.flat() : [];
// bbox
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of geo.features)
  for (const ring of rings(f.geometry))
    for (const [lon, lat] of ring) {
      minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    }
const midLat = (minLat + maxLat) / 2;
const kx = Math.cos((midLat * Math.PI) / 180); // 경도 보정
const W = 1000;
const spanX = (maxLon - minLon) * kx, spanY = maxLat - minLat;
const scale = W / spanX;
const H = Math.round(spanY * scale);
const PAD = 6;
const px = (lon) => PAD + (lon - minLon) * kx * scale;
const py = (lat) => PAD + (maxLat - lat) * scale;

let paths = "", labels = "";
for (const f of geo.features) {
  const name = f.properties.name; // "강남구"
  const guKey = name.replace(/구$|시$/, ""); // molit meta.gu는 "강남구" 그대로 → 매칭 위해 둘 다 시도
  const info = guTop[name] || guTop[guKey] || null;
  const p = info ? info.price : mn;
  let d = "";
  let biggest = null, biggestLen = 0;
  for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > biggestLen) { biggestLen = ring.length; biggest = ring; }
  }
  paths += `<path class="mc-geo" d="${d}" fill="${info ? fill(p) : "#eee"}"/>`;
  // 라벨 위치 = 최대 링의 정식 폴리곤 무게중심(면적 가중) — 오목형에서도 안정
  const pts = biggest.map(([lo, la]) => [px(lo), py(la)]);
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cross = x0 * y1 - x1 * y0;
    A += cross; cx += (x0 + x1) * cross; cy += (y0 + y1) * cross;
  }
  if (Math.abs(A) < 1e-6) { // 폴백: 정점 평균
    cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  } else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
  const short = name.replace(/구$/, "");
  const tc = info ? textCol(p) : "#98a2b3";
  labels += `<text class="mc-lab" x="${cx.toFixed(0)}" y="${cy.toFixed(0)}" fill="${tc}">` +
    `<tspan class="g" x="${cx.toFixed(0)}">${short}</tspan>` +
    (info ? `<tspan class="v" x="${cx.toFixed(0)}" dy="26">${eok(info.price)}억</tspan>` : "") +
    `</text>`;
}
const mapSvg = `<svg viewBox="0 0 ${W + PAD * 2} ${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg">${paths}${labels}</svg>`;

// ── 4) 콘텐츠 JSON ──
const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const label = metric === "59" ? "전용 59㎡ (24평형)" : "전용 84㎡ (국민평형)";
writeFileSync(
  join(outDir, `map-${metric}.json`),
  JSON.stringify(
    {
      template: "map-choropleth@1", date,
      subtitle: `${label} · 구별 최고 실거래 · 색이 진할수록 비쌈`,
      title: `서울 ${metric}㎡ 최고가 지도`,
      mapSvg,
      colorLo: `rgb(${C_LO.join(",")})`, colorHi: `rgb(${C_HI.join(",")})`,
      legendLo: `${eok(mn)}억`, legendHi: `${eok(mx)}억`,
      topName: topGuName, topValue: `${eok(guTop[topGuName].price)}억`,
      source: { name: "국토부 실거래가 · 서울시 행정경계", asOf },
    },
    null, 2,
  ) + "\n",
);
console.log(`✅ 서울 ${metric}㎡ 지도 — 구 ${Object.keys(guTop).length}개 · 최고 ${topGuName} ${eok(mx)}억 · 최저 ${eok(mn)}억`);
