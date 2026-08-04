/**
 * 서울 25구 지도 + 글로벌 자본 '투자 위치' 핀. 좌표는 전부 지오데이터에서 계산(손 좌표 없음).
 *  - 구 경계: data/geo/seoul-districts.geojson (25구)
 *  - 핀 좌표: 동을 주면 data/geo/korea-submunicipalities.geojson 의 해당 동(분동 평균) 중심,
 *            동이 없으면 구 중심.
 * 반환: <svg>…</svg> 문자열.
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
 * @param {Array} o.spots [{gu, dong?, label}] — gu=자치구명(seoul-districts name). dong 주면 동 중심, 없으면 구 중심.
 */
export function seoulInvestSvg({ spots }) {
  const gus = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
  const dong = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-submunicipalities.geojson"), "utf8"))
    .features.filter((f) => String(f.properties.code).startsWith("11"));

  // bbox(서울 전체)
  let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
  for (const f of gus.features)
    for (const r of rings(f.geometry))
      for (const [lo, la] of r) {
        minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
        minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
      }
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const PAD = 20, W = 1000;
  const S = W / ((maxLon - minLon) * kx);
  const VW = Math.round((maxLon - minLon) * kx * S + PAD * 2);
  const VH = Math.round((maxLat - minLat) * S + PAD * 2);
  const px = (lo) => PAD + (lo - minLon) * kx * S;
  const py = (la) => PAD + (maxLat - la) * S;
  const pathOf = (geom) =>
    rings(geom).map((r) => "M" + r.map(([lo, la]) => `${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join("L") + "Z").join("");

  // 투자 유입 구 집합
  const hitGu = new Set(spots.map((s) => s.gu));
  // 동 중심(분동 평균) 헬퍼
  const dongCenter = (base) => {
    const hits = dong.filter((f) => f.properties.name.startsWith(base));
    if (!hits.length) return null;
    const cs = hits.map((f) => centroid(f.geometry)).filter(Boolean);
    return [cs.reduce((s, c) => s + c[0], 0) / cs.length, cs.reduce((s, c) => s + c[1], 0) / cs.length];
  };
  const guCenter = (name) => {
    const f = gus.features.find((x) => x.properties.name === name);
    return f && centroid(f.geometry);
  };

  // 구 채색
  let base = "";
  for (const f of gus.features) {
    const d = pathOf(f.geometry); if (!d) continue;
    base += `<path d="${d}" class="${hitGu.has(f.properties.name) ? "si-hit" : "si-gu"}"/>`;
  }

  // 핀 + 라벨
  let pins = "", labels = "";
  for (const s of spots) {
    const c = (s.dong && dongCenter(s.dong)) || guCenter(s.gu);
    if (!c) continue;
    const x = px(c[0]), y = py(c[1]);
    pins += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" class="si-pin"/>`;
    const lx = x + (s.dx || 0), ly = y - 18 + (s.dy || 0);
    labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="si-lab">${s.label}</text>`;
  }

  return (
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
    `<style>` +
    `.si-gu{fill:#e7e9ee;stroke:#fff;stroke-width:2}` +
    `.si-hit{fill:#c9d8ff;stroke:#fff;stroke-width:2}` +
    `.si-pin{fill:var(--wirit-red,#e5484d);stroke:#fff;stroke-width:3}` +
    `.si-lab{font-size:25px;font-weight:800;fill:var(--wirit-ink,#141821);text-anchor:middle;` +
    `paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}` +
    `.si-wm{font-size:38px;font-weight:800;fill:#c4c9d2;letter-spacing:-0.01em}` +
    `</style>` +
    // 좌상단 연회색 워터마크(BRAND 슬롯 C) — 지도 몸통에 더 붙여 배치(오너 지시)
    `<text x="${(PAD + VW * 0.11).toFixed(1)}" y="${(PAD + VH * 0.20).toFixed(1)}" class="si-wm">@wirit_note</text>` +
    `<g>${base}</g><g>${pins}${labels}</g>` +
    `</svg>`
  );
}
