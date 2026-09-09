/**
 * 예정 노선의 **역 위치를 실제 선형 위에 순서대로 얹는다.**
 *
 * ── 왜 이 방식인가 (2026-09-09, 오너 지시)
 * 측량 정확도는 필요 없다. 시중에 도는 예정 노선도 수준의 **개략 지도**면 된다.
 * 그런데 개략이라고 아무 데나 찍으면 안 된다 — 2026-09-08 실측에서 동 중심 오차 중앙값이
 * 601m 였고, 도심 구간은 역간 1km 안팎이라 **역 순서가 뒤집힌다.** 지도에서 순서가 뒤집히면
 * 그건 개략이 아니라 틀린 그림이다.
 *
 * 그래서 두 가지를 분리한다:
 *   · **선형**은 실제다 — OSM railway=construction (신안산선 401점).
 *   · **역 위치**는 개략이되 **순서는 절대 안 뒤집힌다** — 선형 위 진행거리(t)로만 놓고,
 *     t 를 단조증가로 강제한다. 닻이 순서를 어기면 이웃 사이로 밀어 넣는다.
 *
 * 이게 이 방식을 성립시키는 전부다. 순서 강제를 빼면 못 쓰는 방식으로 되돌아간다.
 *
 * ── 닻(anchor)
 *   · OSM 에 실좌표가 있는 역(기존 역)은 그 좌표를 닻으로 쓴다.
 *   · 없는 역(신설역)은 data/datasets/rail-station-anchors.json 의 **시군구+동** 중심.
 *     ⚠️ 같은 이름의 동이 여러 시군구에 있다(목동=양천·화성, 상동=부천·여러 곳).
 *        그래서 **그 시군구 폴리곤 안에 든 동만** 쓴다 — sudogwon-map.mjs 와 같은 규칙이다.
 *   · 그래도 못 잡은 역은 **이웃 사이를 등분**한다. 지어낸 좌표가 아니라 '모른다'의 표현이다.
 */

const R = 6371000;
const rad = (x) => (x * Math.PI) / 180;

/** 두 점 사이 거리(m) — 수도권 규모에서는 평면 근사로 충분하다. */
export function metres(a, b) {
  const m = rad((a.lat + b.lat) / 2);
  return R * Math.hypot(rad(b.lon - a.lon) * Math.cos(m), rad(b.lat - a.lat));
}

export const rings = (geom) =>
  !geom ? [] : geom.type === "Polygon" ? geom.coordinates
    : geom.type === "MultiPolygon" ? geom.coordinates.flat() : [];

export function ringCentroid(geom) {
  let best = null, bestA = -1;
  for (const r of rings(geom)) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) {
      const [x0, y0] = r[i], [x1, y1] = r[i + 1];
      const f = x0 * y1 - x1 * y0; a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
    }
    a *= 0.5;
    if (Math.abs(a) > bestA) { bestA = Math.abs(a); best = a ? [cx / (6 * a), cy / (6 * a)] : r[0]; }
  }
  return best;
}

export function pointInRing(pt, r) {
  let c = false;
  for (let i = 0, k = r.length - 1; i < r.length; k = i++) {
    const [xi, yi] = r[i], [xk, yk] = r[k];
    if ((yi > pt[1]) !== (yk > pt[1]) && pt[0] < ((xk - xi) * (pt[1] - yi)) / (yk - yi) + xi) c = !c;
  }
  return c;
}
export const pointInGeom = (pt, geom) => rings(geom).some((r) => pointInRing(pt, r));

/**
 * 이름이 맞고 **그 시군구 안에 든** 동들의 중심 평균.
 * 분동(독산1~4동)은 접두사로 잡아 평균한다 — 어느 하나만 고르면 그게 곧 임의 선택이다.
 * 못 찾으면 null. **폴백으로 시군구 중심을 쓰지 않는다** — 그건 조용히 몇 km 를 옮긴다.
 */
export function dongCentre(dongGeo, sggGeom, dongName) {
  const hits = [];
  for (const f of dongGeo.features) {
    const nm = f.properties?.name || "";
    if (!nm.startsWith(dongName)) continue;
    const c = ringCentroid(f.geometry);
    if (!c) continue;
    if (!pointInGeom(c, sggGeom)) continue; // ← 같은 이름 다른 동네를 여기서 거른다
    hits.push(c);
  }
  if (!hits.length) return null;
  const lon = hits.reduce((a, c) => a + c[0], 0) / hits.length;
  const lat = hits.reduce((a, c) => a + c[1], 0) / hits.length;
  return { lat, lon, parts: hits.length };
}

/** 선형(점 배열)을 하나의 진행거리 축으로 만든다. 반환: [{lat,lon,d}] — d 는 누적 m. */
export function buildTrack(points) {
  const out = [];
  let d = 0;
  for (let i = 0; i < points.length; i++) {
    if (i) d += metres(points[i - 1], points[i]);
    out.push({ lat: points[i].lat, lon: points[i].lon, d });
  }
  return out;
}

/** 닻을 선형에 투영해 진행거리 t(m)와 그때의 거리(m)를 돌려준다. */
export function projectOnTrack(track, p) {
  let best = null;
  for (const q of track) {
    const m = metres(p, q);
    if (!best || m < best.m) best = { m, t: q.d, lat: q.lat, lon: q.lon };
  }
  return best;
}

/** 진행거리 t 에 해당하는 선형 위 점. */
export function pointAt(track, t) {
  if (t <= track[0].d) return track[0];
  const last = track[track.length - 1];
  if (t >= last.d) return last;
  for (let i = 1; i < track.length; i++) {
    if (track[i].d >= t) {
      const a = track[i - 1], b = track[i];
      const f = (t - a.d) / (b.d - a.d || 1);
      return { lat: a.lat + (b.lat - a.lat) * f, lon: a.lon + (b.lon - a.lon) * f, d: t };
    }
  }
  return last;
}

/**
 * ⭐ 이 파일의 핵심 — 역 순서대로 t 를 **단조증가**로 만든다.
 *
 * anchors: [{name, t|null}] — 노선 순서대로. t 가 null 이면 '닻 없음'.
 * 규칙:
 *   ① 닻이 있는 역만 남겨 t 가 증가하도록 훑는다. 앞 역보다 t 가 작으면 **그 닻을 버린다**
 *      (억지로 밀어 넣지 않는다 — 순서를 어긴 닻은 애초에 잘못 잡힌 것이다).
 *   ② 남은 빈 자리는 앞뒤 확정 t 사이를 **등분**한다.
 *   ③ 양 끝이 비면 선형의 끝을 쓴다.
 * 반환: [{name, t, from}] — from 은 'anchor' | 'interp' | 'end' | 'dropped→interp'
 */
export function monotonicPositions(anchors, trackLen) {
  const n = anchors.length;
  const t = new Array(n).fill(null);
  const from = new Array(n).fill("interp");

  let prev = -Infinity;
  for (let i = 0; i < n; i++) {
    const a = anchors[i];
    if (a.t == null) continue;
    if (a.t <= prev) { from[i] = "dropped→interp"; continue; } // 순서를 어긴 닻은 버린다
    t[i] = a.t; from[i] = "anchor"; prev = a.t;
  }

  if (t[0] == null) { t[0] = 0; from[0] = from[0] === "anchor" ? "anchor" : "end"; }
  if (t[n - 1] == null) { t[n - 1] = trackLen; from[n - 1] = from[n - 1] === "anchor" ? "anchor" : "end"; }

  let i = 0;
  while (i < n) {
    if (t[i] != null) { i++; continue; }
    let j = i; while (j < n && t[j] == null) j++;
    const a = t[i - 1], b = t[j];           // 양 끝은 위에서 채웠으므로 둘 다 있다
    const gap = j - (i - 1);
    for (let k = i; k < j; k++) t[k] = a + ((b - a) * (k - (i - 1))) / gap;
    i = j;
  }
  return anchors.map((a, k) => ({ name: a.name, t: t[k], from: from[k] }));
}
