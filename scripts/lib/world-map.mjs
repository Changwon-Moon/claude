/**
 * 세계지도(자본 출자국 → 서울 흐름) SVG 생성기. data/geo/world-countries.geojson(Natural Earth 110m)
 * 을 등거리 원통도법으로 그린다. 손으로 찍은 좌표 없음 — 나라 폴리곤·중심점은 지오데이터에서 계산.
 *
 * 반환: <svg ...>...</svg> 문자열(카드 템플릿 mapSvg 로 주입).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function rings(geom) {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates;
  if (geom.type === "MultiPolygon") return geom.coordinates.flat();
  return [];
}
// 면적 최대 링의 무게중심(라벨·흐름 시작점) — 데이터에서 계산(손 좌표 아님)
function centroid(geom) {
  let best = null, bestA = -1;
  for (const r of rings(geom)) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) {
      const [x0, y0] = r[i], [x1, y1] = r[i + 1];
      const f = x0 * y1 - x1 * y0; a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
    }
    a *= 0.5;
    const area = Math.abs(a);
    if (area > bestA) { bestA = area; best = a ? [cx / (6 * a), cy / (6 * a)] : r[0]; }
  }
  return best;
}

/**
 * @param {object} o
 * @param {Array} o.sources  [{name, flag, lon?, lat?}] — name 은 geojson properties.name. lon/lat 주면 점으로(싱가포르처럼 폴리곤 없는 나라).
 * @param {object} o.dest    {name, lon, lat, label} — 도착지(서울/한국).
 * @param {object} [o.win]   {lonMin,lonMax,latMin,latMax} 지도 창(기본 북반구 위주).
 */
export function worldFlowSvg({ sources, dest, win }) {
  const W = { lonMin: -140, lonMax: 150, latMin: -12, latMax: 74, ...(win || {}) };
  const fc = JSON.parse(readFileSync(join(ROOT, "data/geo/world-countries.geojson"), "utf8"));

  const PAD = 16;
  const spanLon = W.lonMax - W.lonMin, spanLat = W.latMax - W.latMin;
  const S = 1000 / spanLon;                 // 가로 1000 기준 스케일
  const VW = Math.round(spanLon * S + PAD * 2);
  const VH = Math.round(spanLat * S + PAD * 2);
  const px = (lon) => PAD + (lon - W.lonMin) * S;
  const py = (lat) => PAD + (W.latMax - lat) * S;

  const pathOf = (geom) =>
    rings(geom).map((r) => "M" + r.map(([lo, la]) => `${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join("L") + "Z").join("");

  const srcNames = new Set(sources.filter((s) => !s.lon).map((s) => s.name));
  const isDest = (f) => f.properties.name === dest.name;

  // ── 육지(전체) + 출자국 강조 + 도착국 강조 ──
  let land = "", hiSrc = "", hiDst = "";
  for (const f of fc.features) {
    const d = pathOf(f.geometry);
    if (!d) continue;
    if (srcNames.has(f.properties.name)) hiSrc += `<path d="${d}" class="wc-src"/>`;
    else if (isDest(f)) hiDst += `<path d="${d}" class="wc-dst"/>`;
    else land += `<path d="${d}" class="wc-land"/>`;
  }

  // ── 흐름 곡선(출자국 중심 → 서울) + 출발 점 + 국기 라벨 ──
  const D = [px(dest.lon), py(dest.lat)];
  let flows = "", dots = "", labels = "";
  for (const s of sources) {
    let lon = s.lon, lat = s.lat;
    if (lon == null) {
      const f = fc.features.find((x) => x.properties.name === s.name);
      const c = f && centroid(f.geometry);
      if (c) { lon = c[0]; lat = c[1]; }
    }
    if (lon == null) continue;
    const A = [px(lon), py(lat)];
    // 2차 베지어 — 위로 볼록하게 당겨 대륙 간 이동감을 준다
    const mx = (A[0] + D[0]) / 2, my = Math.min(A[1], D[1]) - Math.abs(D[0] - A[0]) * 0.18 - 20;
    flows += `<path d="M${A[0].toFixed(1)} ${A[1].toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${D[0].toFixed(1)} ${D[1].toFixed(1)}" class="wc-flow"/>`;
    dots += `<circle cx="${A[0].toFixed(1)}" cy="${A[1].toFixed(1)}" r="7" class="wc-dot"/>`;
    // 라벨(국기)은 점 위. 유럽처럼 붙는 나라는 dx/dy 로 살짝 벌린다.
    const lx = A[0] + (s.dx || 0), ly = A[1] - 16 + (s.dy || 0);
    labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="wc-flag">${s.flag}</text>`;
  }
  // 서울(도착) 별 + 라벨
  const star = `<circle cx="${D[0].toFixed(1)}" cy="${D[1].toFixed(1)}" r="11" class="wc-star"/>` +
    `<circle cx="${D[0].toFixed(1)}" cy="${D[1].toFixed(1)}" r="20" class="wc-star-ring"/>` +
    `<text x="${D[0].toFixed(1)}" y="${(D[1] + 40).toFixed(1)}" class="wc-seoul">${dest.label}</text>`;

  return (
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
    `<style>` +
    `.wc-land{fill:#e7e9ee;stroke:#fff;stroke-width:0.8}` +
    `.wc-src{fill:#2e6bff;stroke:#fff;stroke-width:0.8}` +
    `.wc-dst{fill:var(--wirit-red,#e5484d);stroke:#fff;stroke-width:0.8}` +
    `.wc-flow{fill:none;stroke:#2e6bff;stroke-width:3.2;opacity:.55;stroke-linecap:round;stroke-dasharray:2 9}` +
    `.wc-dot{fill:#2e6bff;stroke:#fff;stroke-width:2}` +
    `.wc-star{fill:var(--wirit-red,#e5484d);stroke:#fff;stroke-width:3}` +
    `.wc-star-ring{fill:none;stroke:var(--wirit-red,#e5484d);stroke-width:3;opacity:.4}` +
    `.wc-flag{font-size:34px;text-anchor:middle}` +
    `.wc-seoul{font-size:28px;font-weight:900;fill:var(--wirit-ink,#141821);text-anchor:middle;paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}` +
    `</style>` +
    `<g>${land}${hiSrc}${hiDst}</g><g>${flows}${dots}${star}${labels}</g>` +
    `</svg>`
  );
}
