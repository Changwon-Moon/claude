/**
 * 수도권(서울 25구 + 경기 47곳) 시군구 경계 지도 + 학군지 번호 핀.
 *
 * 좌표는 전부 지오데이터에서 계산한다 — 손으로 찍은 좌표는 0개다.
 *  - 시군구 경계: data/geo/korea-sgg-2026.geojson (sido = 서울특별시 / 경기도)
 *  - 핀 좌표: pinDong(행정동, 분동은 평균) 중심. 단 **그 시군구 폴리곤 안에 든 것만** 쓴다.
 *            같은 이름의 동이 여러 시군구에 있기 때문이다(장지동=송파·화성, 목동=양천·화성,
 *            상동=부천·여러 곳). 이름만으로 고르면 엉뚱한 곳에 핀이 박히고,
 *            그건 지도에서 조용히 안 보인다. 못 찾으면 시군구 중심으로 떨어진다.
 *  - 면 색: 토지거래허가구역 지정 여부 두 갈래뿐(지정 / 미지정).
 *
 * 반환: { svg, resolved } — resolved 는 핀마다 무엇으로 좌표를 잡았는지(dong|sgg)를 담는다.
 *       빌더가 이걸 찍어야 "동으로 잡은 줄 알았는데 구 중심이었다"를 사람이 볼 수 있다.
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
    a *= 0.5;
    const area = Math.abs(a);
    if (area > bestA) { bestA = area; best = a ? [cx / (6 * a), cy / (6 * a)] : r[0]; }
  }
  return best;
}

/** 점이 폴리곤(멀티 포함) 안에 있나 — ray casting. 동을 시군구에 묶는 유일한 판정이다. */
function inside(pt, geom) {
  const [x, y] = pt;
  let hit = false;
  for (const r of rings(geom)) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
  }
  return hit;
}

/**
 * @param {object} o
 * @param {Array}  o.pins   [{ n, label, geoName, pinDong?, dx?, dy?, lx?, ly?, anchor? }]
 *                          n=지도에 찍을 번호, label=핀 옆에 적을 학군지 이름
 *                          lx/ly=이름만 미세조정, anchor=start|end|middle(기본 start)
 * @param {Set}    o.hitSgg 토지거래허가구역으로 칠할 시군구명 집합(korea-sgg-2026 의 name)
 * @param {boolean} o.showLabels 핀 옆에 학군지 이름을 적을지
 */
export function sudogwonMapSvg({ pins, hitSgg = new Set(), focusPad = 0.16, showLabels = false }) {
  const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"))
    .features.filter((f) => ["서울특별시", "경기도"].includes(f.properties.sido));
  const dongs = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-submunicipalities.geojson"), "utf8")).features;

  const sggOf0 = (name) => sgg.find((f) => f.properties.name === name);

  // ── 핀 위경도를 먼저 잡는다 ────────────────────────────────────────
  // 화면 범위를 **핀 기준**으로 자르기 위해서다. 수도권 전체(가평·연천까지)를 담으면
  // 학군지가 없는 동북부가 화면의 절반을 먹고, 서울 9곳이 한 덩어리로 뭉쳐 번호를 못 읽는다.
  // 잘라낸 바깥은 viewBox 밖으로 나가 자연스럽게 잘린다 — 데이터를 버리는 게 아니다.
  const resolved = [];
  const placed = [];
  for (const p of pins) {
    const host = sggOf0(p.geoName);
    if (!host) throw new Error(`시군구를 못 찾았습니다: ${p.geoName} (${p.label}) — korea-sgg-2026.geojson 이름과 대조하세요.`);
    let c = null, by = "sgg";
    if (p.pinDong) {
      const cs = dongs
        .filter((f) => f.properties.name.startsWith(p.pinDong))
        .map((f) => centroid(f.geometry))
        .filter((c2) => c2 && inside(c2, host.geometry));
      if (cs.length) {
        c = [cs.reduce((s, x) => s + x[0], 0) / cs.length, cs.reduce((s, x) => s + x[1], 0) / cs.length];
        by = "dong";
      }
    }
    if (!c) c = centroid(host.geometry);
    resolved.push({ label: p.label, by, dong: p.pinDong ?? null });
    placed.push({ ...p, lon: c[0], lat: c[1] });
  }

  let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
  for (const p of placed) {
    if (p.lon < minLon) minLon = p.lon; if (p.lon > maxLon) maxLon = p.lon;
    if (p.lat < minLat) minLat = p.lat; if (p.lat > maxLat) maxLat = p.lat;
  }
  const padLon = (maxLon - minLon) * focusPad, padLat = (maxLat - minLat) * focusPad;
  minLon -= padLon; maxLon += padLon; minLat -= padLat; maxLat += padLat;

  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const PAD = 16, W = 1000;
  const S = W / ((maxLon - minLon) * kx);
  const VW = Math.round((maxLon - minLon) * kx * S + PAD * 2);
  const VH = Math.round((maxLat - minLat) * S + PAD * 2);
  const px = (lo) => PAD + (lo - minLon) * kx * S;
  const py = (la) => PAD + (maxLat - la) * S;
  const pathOf = (geom) =>
    rings(geom)
      .map((r) => "M" + r.map(([lo, la]) => `${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join("L") + "Z")
      .join("");

  // 면 — 허가구역 / 미지정 두 갈래
  let base = "";
  for (const f of sgg) {
    const d = pathOf(f.geometry);
    if (!d) continue;
    base += `<path d="${d}" class="${hitSgg.has(f.properties.name) ? "sg-hit" : "sg-off"}"/>`;
  }

  // 핀 — 위에서 잡은 좌표를 화면 좌표로. dx/dy 는 겹칠 때의 미세조정(픽셀).
  // pinsXY 는 **viewBox 좌표**다. 카드 픽셀로 옮기는 계산은 빌더가 한다(연결선용).
  let marks = "";
  let labels = "";
  const pinsXY = [];
  for (const p of placed) {
    const x = px(p.lon) + (p.dx || 0);
    const y = py(p.lat) + (p.dy || 0);
    pinsXY.push({ key: p.key ?? p.label, n: p.n, x, y });
    marks +=
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="22" class="sg-pin g${p.grade}"/>` +
      `<text x="${x.toFixed(1)}" y="${(y + 9).toFixed(1)}" class="sg-num">${p.n}</text>`;
    if (showLabels && p.label) {
      // 이름은 기본으로 핀 오른쪽. 겹치는 곳만 lx/ly/anchor 로 옮긴다(위치를 지어내지 않는다).
      const anchor = p.anchor || "start";
      const off = anchor === "end" ? -30 : anchor === "middle" ? 0 : 30;
      const lx = x + off + (p.lx || 0);
      const ly = y + 11 + (p.ly || 0);
      labels +=
        `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="sg-lab" text-anchor="${anchor}">${p.label}</text>`;
    }
  }

  const svg =
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
    `<style>` +
    `.sg-off{fill:#e7e9ee;stroke:#fff;stroke-width:1.6}` +
    `.sg-hit{fill:#f6c9cd;stroke:#fff;stroke-width:1.6}` +
    `.sg-pin{stroke:#fff;stroke-width:3.5}` +
    `.sg-pin.g1{fill:#c8102e}.sg-pin.g2{fill:#141821}.sg-pin.g3{fill:#8f9bad}` +
    `.sg-num{font-size:24px;font-weight:900;fill:#fff;text-anchor:middle}` +
    `.sg-lab{font-size:30px;font-weight:800;fill:#141821;letter-spacing:-0.03em;` +
    `paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round}` +
    `.sg-wm{font-size:34px;font-weight:800;fill:#c4c9d2;letter-spacing:-0.01em}` +
    `</style>` +
    // 워터마크는 면(base) **뒤에** 그린다. 앞에 두면 폴리곤이 덮어 조용히 사라진다
    // — 화면을 좁게 자른 뒤 실제로 그렇게 사라졌다(2026-09-01).
    // 두 개를 좌상단·좌하단 빈 코너에 둔다(오너 2026-09-01). 데이터 위에는 올리지 않는다.
    `<g>${base}</g>` +
    `<text x="${(PAD + VW * 0.035).toFixed(1)}" y="${(PAD + VH * 0.05).toFixed(1)}" class="sg-wm">@wirit_note</text>` +
    `<text x="${(PAD + VW * 0.035).toFixed(1)}" y="${(PAD + VH * 0.93).toFixed(1)}" class="sg-wm">@wirit_note</text>` +
    `<g>${labels}</g><g>${marks}</g>` +
    `</svg>`;

  return { svg, resolved, pinsXY, viewBox: { w: VW, h: VH } };
}
