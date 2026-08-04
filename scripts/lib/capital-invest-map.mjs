/**
 * 수도권(서울+인천+경기) 지도 + 투자 위치 점. 좌표는 지오데이터에서 계산(손 좌표 없음).
 *  - 시군구 경계: data/geo/korea-sgg-2026.geojson (sido 로 수도권만 필터)
 *  - 서울 동 중심: data/geo/korea-submunicipalities.geojson (code 11 = 서울)
 * 점 라벨은 없음(표가 위치를 갖는다) — 지도는 '어디에 얼마나 퍼졌나'를 보여준다.
 * 반환: <svg>…</svg>.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CAPITAL_SIDO = new Set(["서울특별시", "인천광역시", "경기도"]);

function rings(geom) {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates;
  if (geom.type === "MultiPolygon") return geom.coordinates.flat();
  return [];
}
function centroid(geom) {
  let best = null, bestA = -1;
  for (const r of rings(geom)) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) {
      const [x0, y0] = r[i], [x1, y1] = r[i + 1];
      const f = x0 * y1 - x1 * y0; a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
    }
    a *= 0.5; const area = Math.abs(a);
    if (area > bestA) { bestA = area; best = a ? [cx / (6 * a), cy / (6 * a)] : r[0]; }
  }
  return best;
}

/**
 * @param {object} o
 * @param {Array} o.spots [{gu?, dong?, sgg?, label?}] — dong→서울 동 중심, sgg→수도권 시군구 중심, gu→서울 구 중심.
 *                        hit 강조 구역은 gu(서울 구) 또는 sgg(경기 시군) 이름으로 집계.
 */
export function capitalInvestSvg({ spots }) {
  const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"))
    .features.filter((f) => CAPITAL_SIDO.has(f.properties.sido));
  const dong = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-submunicipalities.geojson"), "utf8"))
    .features.filter((f) => String(f.properties.code).startsWith("11"));

  let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
  for (const f of sgg)
    for (const r of rings(f.geometry))
      for (const [lo, la] of r) {
        minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
        minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
      }
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const PAD = 16, W = 1000;
  const S = W / ((maxLon - minLon) * kx);
  const VW = Math.round((maxLon - minLon) * kx * S + PAD * 2);
  const VH = Math.round((maxLat - minLat) * S + PAD * 2);
  const px = (lo) => PAD + (lo - minLon) * kx * S;
  const py = (la) => PAD + (maxLat - la) * S;
  const pathOf = (geom) =>
    rings(geom).map((r) => "M" + r.map(([lo, la]) => `${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join("L") + "Z").join("");

  const hit = new Set(spots.map((s) => s.sgg || s.gu).filter(Boolean));
  let base = "";
  for (const f of sgg) {
    const d = pathOf(f.geometry); if (!d) continue;
    base += `<path d="${d}" class="${hit.has(f.properties.name) ? "ci-hit" : "ci-reg"}"/>`;
  }

  const dongCenter = (b) => {
    const hs = dong.filter((f) => f.properties.name.startsWith(b));
    if (!hs.length) return null;
    const cs = hs.map((f) => centroid(f.geometry)).filter(Boolean);
    return [cs.reduce((s, c) => s + c[0], 0) / cs.length, cs.reduce((s, c) => s + c[1], 0) / cs.length];
  };
  const sggCenter = (name) => { const f = sgg.find((x) => x.properties.name === name); return f && centroid(f.geometry); };

  let pins = "", labels = "";
  for (const s of spots) {
    const c = (s.dong && dongCenter(s.dong)) || (s.sgg && sggCenter(s.sgg)) || (s.gu && sggCenter(s.gu));
    if (!c) continue;
    const x = px(c[0]), y = py(c[1]);
    pins += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" class="ci-pin"/>`;
    if (s.label) {
      const lx = x + (s.dx || 0), ly = y - 20 + (s.dy || 0);
      labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="ci-lab">${s.label}</text>`;
    }
  }

  return (
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
    `<style>` +
    `.ci-reg{fill:#e7e9ee;stroke:#fff;stroke-width:1.6}` +
    `.ci-hit{fill:#b9cdff;stroke:#fff;stroke-width:1.6}` +
    `.ci-pin{fill:var(--wirit-red,#e5484d);stroke:#fff;stroke-width:3}` +
    `.ci-lab{font-size:27px;font-weight:800;fill:var(--wirit-ink,#141821);text-anchor:middle;` +
    `paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round}` +
    `</style>` +
    `<g>${base}</g><g>${pins}${labels}</g>` +
    `</svg>`
  );
}
