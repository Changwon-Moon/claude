/**
 * 스파이크 — 신안산선 **실좌표 지도**를 SVG 로 뽑아 본다.
 *
 * ⚠️ 스파이크다. 카드가 아니다. 판형·확정·픽셀 기준값과 상관없다.
 *    무엇을 그릴 수 있고 무엇이 비는지 **눈으로 보려고** 만든다.
 *
 * 넣는 것:
 *   · 시군구 경계 — data/geo/korea-sgg-2026.geojson
 *   · 한강 — scripts/lib/han-river.mjs
 *   · 신안산선 선형 — OSM railway=construction (탐사 결과 _probe-rail-osm.json, 401점)
 *   · 역 점 — OSM 에 좌표가 있는 **기존 역 9개만**
 *
 * 빠지는 것(그래서 이 그림이 알려 주는 것):
 *   · 신설역 10개(도림사거리·대림삼거리·시흥사거리·목감·장하·성포·호수·한양대·학온·매화)
 *     — OSM 에 점이 없다. 이 그림에서 **비어 보이는 자리**가 정확히 그 자리다.
 *
 * 실행: node scripts/spike-rail-geomap.mjs > /tmp/rail-geomap.svg
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { hanRiverPoints } from "./lib/han-river.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const probe = JSON.parse(readFileSync(join(ROOT, "data/geo/_probe-rail-osm.json"), "utf8"));
const O = probe.결과.find((x) => x.key === "sinansan");
if (!O || !O.좌표) throw new Error("탐사 결과에 신안산선 좌표가 없다");

/* 그릴 것 — 본선(construction)만. 연장 계획(proposed)은 다른 색으로 구분한다. */
const ways = O.좌표;
const pts = ways.flatMap((w) => w.g);

/* 화면 상자 — 노선 + 여유. 세로로 긴 노선이라 카드 비율(4:5)에 맞춰 가로를 넉넉히 준다. */
const W = 1080, H = 1350, PAD = 70;
const lat0 = Math.min(...pts.map((p) => p.lat)), lat1 = Math.max(...pts.map((p) => p.lat));
const lon0 = Math.min(...pts.map((p) => p.lon)), lon1 = Math.max(...pts.map((p) => p.lon));
const cLat = (lat0 + lat1) / 2;
const kx = Math.cos((cLat * Math.PI) / 180); // 위도에 따른 경도 축척 보정 — 안 하면 가로로 늘어난다

/* 노선 상자를 화면에 맞추되 **가로세로 비율을 지킨다**(지도는 늘리면 거짓말이 된다). */
const spanX = (lon1 - lon0) * kx, spanY = lat1 - lat0;
const s = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
const offX = (W - spanX * s) / 2, offY = (H - spanY * s) / 2;
const X = (lon) => offX + (lon - lon0) * kx * s;
const Y = (lat) => H - (offY + (lat - lat0) * s); // 위도는 위로 갈수록 커진다 — 화면은 반대

const path = (g) => g.map((p, i) => `${i ? "L" : "M"}${X(p.lon).toFixed(1)},${Y(p.lat).toFixed(1)}`).join("");

/* 시군구 경계 — 화면 상자에 걸치는 것만 그린다. */
const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"));
const rings = (geom) => !geom ? [] : geom.type === "Polygon" ? geom.coordinates
  : geom.type === "MultiPolygon" ? geom.coordinates.flat() : [];
const PADD = 0.06;
const inBox = (r) => r.some(([lon, lat]) =>
  lat > lat0 - PADD && lat < lat1 + PADD && lon > lon0 - PADD && lon < lon1 + PADD);

let land = "";
for (const f of sgg.features)
  for (const r of rings(f.geometry)) {
    if (!inBox(r)) continue;
    const d = r.map(([lon, lat], i) => `${i ? "L" : "M"}${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join("") + "Z";
    land += `<path d="${d}" fill="#efece5" stroke="#dcd8cf" stroke-width="1.2"/>`;
  }

/* 한강 */
let river = "";
try {
  const named = sgg.features.map((f) => ({ name: f.properties.name, rings: rings(f.geometry) }));
  const hr = hanRiverPoints(named);
  const d = hr.map(([lon, lat], i) => `${i ? "L" : "M"}${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join("");
  river = `<path d="${d}" fill="none" stroke="#bcd6e8" stroke-width="14" stroke-linecap="round"/>`;
} catch { river = ""; }

const RED = "#C10230"; // 신안산선 — templates/_shared/metro-lines.json 정본
let line = "", plan = "";
for (const w of ways) {
  const d = path(w.g);
  if (w.railway === "proposed") plan += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="7" stroke-dasharray="16 12" opacity="0.45" stroke-linecap="round" stroke-linejoin="round"/>`;
  else line += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/* 좌표가 있는 역 — 탐사에서 이름이 맞은 것만. 없는 역은 **그리지 않는다.** */
const OURS = ["여의도","영등포","도림사거리","신풍","대림삼거리","구로디지털단지","독산","시흥사거리",
              "석수","광명","목감","장하","성포","중앙","호수","한양대","학온","매화","시흥시청"];
const known = (O.역점.표본 || []).filter((h) => OURS.includes((h.name || "").replace(/역$/, "")));
let dots = "";
for (const h of known) {
  const x = X(h.lon), y = Y(h.lat);
  dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="#ffffff" stroke="${RED}" stroke-width="6"/>`
        + `<text x="${(x + 20).toFixed(1)}" y="${(y + 8).toFixed(1)}" font-family="sans-serif" font-size="25" font-weight="800" fill="#141821">${h.name}</text>`;
}

const missing = OURS.filter((n) => !known.some((h) => (h.name || "").replace(/역$/, "") === n));

process.stdout.write(
`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#fafaf8"/>
${land}${river}${plan}${line}${dots}
<text x="${PAD}" y="60" font-family="sans-serif" font-size="34" font-weight="800" fill="#141821">신안산선 — OSM 선형 ${pts.length}점 · 역 점 ${known.length}/${OURS.length}</text>
<text x="${PAD}" y="98" font-family="sans-serif" font-size="22" fill="#8a8f98">좌표 없는 역 ${missing.length}: ${missing.join(" · ")}</text>
</svg>`);
process.stderr.write(`선형 ${pts.length}점 · 역 ${known.length}/${OURS.length} · 없는 역: ${missing.join(", ")}\n`);
