/**
 * 수도권(서울·경기·인천) 시군구 경계 지도 + 학군지 번호 핀.
 *
 * 좌표는 전부 지오데이터에서 계산한다 — 손으로 찍은 좌표는 0개다.
 *  - 시군구 경계: data/geo/korea-sgg-2026.geojson (sido = 서울특별시 / 경기도 / 인천광역시)
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
import { hanRiverPoints } from "./han-river.mjs";

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
 * @param {string} o.wm2LeftOf  두 번째 워터마크를 **이 핀의 왼쪽**에 앉힌다(핀 key). 없으면 안 그린다.
 *                          자리를 비율(0.17 같은 수)로 잡던 시절, 화면을 다시 자르자 그 자리가
 *                          회색 육지에서 흰 바다로 바뀌어 흰 글자가 조용히 사라졌다(2026-09-01).
 *                          그래서 **데이터에 붙여** 잡는다 — 핀은 지도를 다시 잘라도 같은 땅 위에 있다.
 */
export function sudogwonMapSvg({ pins, hitSgg = new Set(), focusPad = 0.16, focusPadX = null, showLabels = false, wm2LeftOf = null }) {
  const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"))
    .features.filter((f) => ["서울특별시", "경기도", "인천광역시"].includes(f.properties.sido));
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
  // 가로 여백을 따로 줄 수 있다 — 핀이 동서로 퍼지면 지도가 납작해져 옆 표의 행 높이가 눌린다.
  // 인천(송도)을 넣자 실제로 그렇게 됐다(2026-09-01).
  const padLon = (maxLon - minLon) * (focusPadX ?? focusPad), padLat = (maxLat - minLat) * focusPad;
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
  let landD = "";                 // 그린 땅 전체 — 한강을 이 위에만 보이게 자른다
  const hitPts = [];              // 허가구역 면의 점들(viewBox 좌표) — 아래 hitMinXInBand 용
  for (const f of sgg) {
    const d = pathOf(f.geometry);
    if (!d) continue;
    const isHit = hitSgg.has(f.properties.name);
    base += `<path d="${d}" class="${isHit ? "sg-hit" : "sg-off"}"/>`;
    landD += d;
    if (isHit) for (const r of rings(f.geometry)) for (const [lo, la] of r) hitPts.push([px(lo), py(la)]);
  }

  /** 주어진 세로 띠에서 **허가구역(분홍 면)의 가장 왼쪽 x**. 없으면 null.
   *  빌더가 지도 왼쪽 테두리와 분홍 면 사이 빈 바다의 한가운데를 잡는 데 쓴다(오너 2026-09-01).
   *  눈으로 어림하지 않는다 — 지도를 다시 자르면 어림값이 그대로 어긋난다. */
  const hitMinXInBand = (y0, y1) => {
    let min = Infinity;
    for (const [x, y] of hitPts) if (y >= y0 && y <= y1 && x < min) min = x;
    return Number.isFinite(min) ? min : null;
  };

  // 한강 — 손으로 그리지 않는다. 토허제 지도와 **같은 모듈**(lib/han-river.mjs)을 쓴다.
  // 강 모양이 카드마다 다르면 같은 계정의 지도로 안 보인다.
  const riverPts = hanRiverPoints(sgg.map((f) => ({ name: f.properties.name, rings: rings(f.geometry) })));
  const riverD = "M" + riverPts.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L");
  const riverSvg =
    `<clipPath id="sgLand"><path d="${landD}"/></clipPath>` +
    `<path class="sg-river" d="${riverD}" clip-path="url(#sgLand)"/>`;

  // ── 핀 그리기 ────────────────────────────────────────────────────
  // pinsXY 는 **viewBox 좌표**다. 카드 픽셀로 옮기는 계산은 빌더가 한다.
  const LAB_FS = 30, PIN_R = 22, PIN_STROKE = 3.5;
  // 이름표 폭을 글자 수로 잰다(한글 1em · 가운뎃점 0.45em · 자간 -0.03em) + 8% 여유.
  // 정확한 폰트 메트릭이 아니므로 **넉넉하게 잡아 틀리더라도 겹침 쪽으로 틀리게** 한다.
  const labWidth = (t) => [...t].reduce((w, ch) => w + (ch === "·" ? 0.45 : 1), 0) * LAB_FS * 0.97 * 1.08;

  let marks = "";
  const pinsXY = [];
  for (const p of placed) {
    const x = px(p.lon) + (p.dx || 0);
    const y = py(p.lat) + (p.dy || 0);
    pinsXY.push({ key: p.key ?? p.label, n: p.n, x, y, label: p.label, force: p.anchor ? { anchor: p.anchor, lx: p.lx || 0, ly: p.ly || 0 } : null });
    marks +=
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${PIN_R}" class="sg-pin g${p.grade}"/>` +
      `<text x="${x.toFixed(1)}" y="${(y + 9).toFixed(1)}" class="sg-num">${p.n}</text>`;
  }

  // ── 이름표 자동 배치 ──────────────────────────────────────────────
  // 손으로 자리를 정하면 사람이 놓친 겹침이 그대로 나간다(2026-09-01 에 세 번 났다).
  // 그래서 **코드가 자리를 고른다**: 핀 둘레 8방향 × 두 반경 = 16개 후보 중
  // 아무것과도 안 겹치는 첫 자리를 쓴다. 검사 대상은
  //   ① 이미 놓인 이름표  ② **모든 핀(자기 핀 포함)**  ③ 지도 테두리.
  // ②의 '자기 핀 포함'이 핵심이다 — 예전엔 자기 핀을 건너뛰어서
  // 이름표가 제 마커를 밟는 것을 한 번도 못 잡았다.
  // GAP = '붙지 않았다'고 볼 최소 여유. **배치 거리와 다른 값이다** —
  // 예전엔 둘을 같은 12 로 써서, 가장 가까운 후보가 늘 GAP 검사에 걸려 한 칸씩 더 밀려났다.
  // 그래서 이름표가 필요 이상으로 멀어졌다(오너 2026-09-01). 이제 여유는 좁게, 후보는 그 여유
  // 바로 바깥에 두어 **겹치지 않는 선에서 가장 가까이** 붙는다.
  const GAP = 6;                         // viewBox 단위(카드 픽셀로 약 3.7px)
  const PIN_OUT = PIN_R + PIN_STROKE / 2;
  const overlaps = (a, b) => a.x0 < b.x1 + GAP && b.x0 < a.x1 + GAP && a.y0 < b.y1 + GAP && b.y0 < a.y1 + GAP;
  const pinBox = (p) => ({ x0: p.x - PIN_OUT, x1: p.x + PIN_OUT, y0: p.y - PIN_OUT, y1: p.y + PIN_OUT });
  const boxOf = (x, y, anchor, w) => ({
    x0: anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x,
    x1: (anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x) + w,
    y0: y - LAB_FS * 0.80,
    y1: y + LAB_FS * 0.26,
  });

  /** 핀 둘레 후보 자리 전부(방향 12 × 반경 3). 고른 순서가 아니라 **거리로** 정한다. */
  const candidates = (x, y) => {
    const list = [];
    for (let ring = 0; ring < 3; ring++) {
      const o = PIN_OUT + GAP + 2 + ring * 13;                   // 좌우
      const up = PIN_OUT + GAP + LAB_FS * 0.26 + 2 + ring * 12;  // 위: 글자 아랫선 기준
      const dn = PIN_OUT + GAP + LAB_FS * 0.80 + 2 + ring * 12;  // 아래: 글자 윗선 기준
      const mid = y + LAB_FS * 0.34;
      list.push(
        { x: x + o, y: mid, anchor: "start", w: 1.00 },
        { x: x - o, y: mid, anchor: "end", w: 1.00 },
        { x, y: y - up, anchor: "middle", w: 1.06 },
        { x, y: y + dn, anchor: "middle", w: 1.06 },
        // 얕은 대각(가로로 더 뻗고 세로는 조금) — 좌우 다음으로 자연스럽다
        { x: x + o * 0.92, y: y - up * 0.55, anchor: "start", w: 1.10 },
        { x: x - o * 0.92, y: y - up * 0.55, anchor: "end", w: 1.10 },
        { x: x + o * 0.92, y: y + dn * 0.55, anchor: "start", w: 1.10 },
        { x: x - o * 0.92, y: y + dn * 0.55, anchor: "end", w: 1.10 },
        // 깊은 대각
        { x: x + o * 0.72, y: y - up * 0.86, anchor: "start", w: 1.16 },
        { x: x - o * 0.72, y: y - up * 0.86, anchor: "end", w: 1.16 },
        { x: x + o * 0.72, y: y + dn * 0.86, anchor: "start", w: 1.16 },
        { x: x - o * 0.72, y: y + dn * 0.86, anchor: "end", w: 1.16 },
      );
    }
    return list;
  };

  let labels = "";
  const labBoxes = [];
  const placements = [];
  const unplaced = [];
  if (showLabels) {
    // 붐비는 곳부터 놓는다 — 여유 있는 곳은 나중에도 자리가 남는다.
    const crowd = (p) => pinsXY.filter((q) => q !== p && Math.hypot(q.x - p.x, q.y - p.y) < 220).length;
    const order = [...pinsXY].filter((p) => p.label).sort((a, b) => crowd(b) - crowd(a));

    for (const p of order) {
      const w = labWidth(p.label);
      let chosen = null;

      if (p.force) {
        // 오너가 자리를 지정한 경우에만 그 자리를 쓴다(그래도 아래 겹침 검사는 그대로 받는다).
        const anchor = p.force.anchor;
        const off = anchor === "end" ? -(PIN_OUT + 8) : anchor === "middle" ? 0 : PIN_OUT + 8;
        chosen = { x: p.x + off + p.force.lx, y: p.y + LAB_FS * 0.34 + p.force.ly, anchor };
      } else {
        // **가장 가까운 자리부터** 본다. 고정 순서로 훑으면 오른쪽이 막혔을 때
        // 곧장 먼 반경으로 뛰어 이름표가 필요 이상으로 떨어진다(오너 2026-09-01).
        // 거리에 방향 가중치(w)를 곱해, 같은 거리면 좌우 > 위아래 > 대각 순으로 고른다.
        const scored = candidates(p.x, p.y)
          .map((c) => {
            const b = boxOf(c.x, c.y, c.anchor, w);
            const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
            return { c, b, d: Math.hypot(cx - p.x, cy - p.y) * c.w };
          })
          .sort((a, b2) => a.d - b2.d);
        for (const s2 of scored) {
          const b = s2.b;
          if (b.x0 < 2 || b.x1 > VW - 2 || b.y0 < 2 || b.y1 > VH - 2) continue;   // 지도 밖
          if (pinsXY.some((q) => overlaps(b, pinBox(q)))) continue;               // 자기 핀 포함
          if (labBoxes.some((lb) => overlaps(b, lb))) continue;
          chosen = s2.c;
          break;
        }
      }

      if (!chosen) { unplaced.push(p.label); continue; }
      const b = boxOf(chosen.x, chosen.y, chosen.anchor, w);
      b.key = p.key;
      labBoxes.push(b);
      placements.push({ key: p.key, anchor: chosen.anchor });
      labels +=
        `<text x="${chosen.x.toFixed(1)}" y="${chosen.y.toFixed(1)}" class="sg-lab" text-anchor="${chosen.anchor}">${p.label}</text>`;
    }
  }

  // ── 배치 결과 검증 — 놓은 뒤에 다시 전수로 잰다 ────────────────────
  // 배치기가 맞게 짰는지까지 여기서 확인한다. 배치와 검증을 같은 코드로 하지 않는다.
  const collisions = unplaced.map((n) => `이름표 ${n} — 놓을 자리를 못 찾았습니다(주변이 너무 붐빕니다)`);
  for (let i = 0; i < labBoxes.length; i++) {
    for (let j = i + 1; j < labBoxes.length; j++)
      if (overlaps(labBoxes[i], labBoxes[j])) collisions.push(`이름표 ${labBoxes[i].key} ↔ 이름표 ${labBoxes[j].key}`);
    for (const p of pinsXY)
      if (overlaps(labBoxes[i], pinBox(p)))
        collisions.push(`이름표 ${labBoxes[i].key} ↔ 핀 ${p.key}${p.key === labBoxes[i].key ? " (자기 핀)" : ""}`);
  }

  // ── 두 번째 워터마크 — 지정한 핀의 왼쪽(오너 2026-09-01) ──────────────
  // 회색으로 그린다. 흰색은 바다 위에 앉으면 그대로 사라진다(실제로 한 판 그렇게 나갔다).
  let wm2 = "";
  if (wm2LeftOf) {
    const anchorPin = pinsXY.find((p) => p.key === wm2LeftOf);
    if (!anchorPin) throw new Error(`워터마크 기준 핀을 못 찾았습니다: ${wm2LeftOf} — 핀 key 와 대조하세요.`);
    const WM_FS = 34;
    const wmW = [...`@wirit_note`].reduce((w, ch) => w + (ch === "_" || ch === "@" ? 0.62 : 0.55), 0) * WM_FS * 1.08;
    const wmX = anchorPin.x - PIN_OUT - 18;                 // 핀 왼쪽에 붙인다(text-anchor:end)
    const wmY = anchorPin.y + WM_FS * 0.34;
    const wmBox = { x0: wmX - wmW, x1: wmX, y0: wmY - WM_FS * 0.8, y1: wmY + WM_FS * 0.26, key: "워터마크" };
    // 워터마크도 이름표·핀과 같은 자로 잰다 — 장식이라고 검사를 빼면 조용히 겹친다.
    if (wmBox.x0 < 2) collisions.push(`워터마크 — 지도 왼쪽 밖으로 나갑니다(${wm2LeftOf} 핀이 너무 왼쪽입니다)`);
    for (const lb of labBoxes) if (overlaps(wmBox, lb)) collisions.push(`워터마크 ↔ 이름표 ${lb.key}`);
    for (const p of pinsXY) if (overlaps(wmBox, pinBox(p))) collisions.push(`워터마크 ↔ 핀 ${p.key}`);
    wm2 = `<text x="${wmX.toFixed(1)}" y="${wmY.toFixed(1)}" class="sg-wm" text-anchor="end">@wirit_note</text>`;
  }

  const svg =
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
    `<style>` +
    `.sg-off{fill:#e7e9ee;stroke:#fff;stroke-width:1.6}` +
    `.sg-river{fill:none;stroke:#8fbfe0;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}` +
    `.sg-hit{fill:#f6c9cd;stroke:#fff;stroke-width:1.6}` +
    `.sg-pin{stroke:#fff;stroke-width:3.5}` +
    `.sg-pin.g1{fill:#c8102e}.sg-pin.g2{fill:#141821}.sg-pin.g3{fill:#8f9bad}` +
    `.sg-num{font-size:24px;font-weight:900;fill:#fff;text-anchor:middle}` +
    `.sg-lab{font-size:30px;font-weight:800;fill:#141821;letter-spacing:-0.03em;` +
    `paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round}` +
    `.sg-wm{font-size:34px;font-weight:800;fill:#c4c9d2;letter-spacing:-0.01em}` +
    `</style>` +
    // 워터마크는 면(base) **뒤에** 그리지 않는다 — 폴리곤이 덮어 조용히 사라진다(2026-09-01).
    // 면 위에 회색으로 얹되, 자리는 빈 코너와 핀 왼쪽이라 데이터를 가리지 않는다.
    `<g>${base}</g>${riverSvg}` +
    `<text x="${(PAD + VW * 0.035).toFixed(1)}" y="${(PAD + VH * 0.05).toFixed(1)}" class="sg-wm">@wirit_note</text>` +
    wm2 +
    `<g>${labels}</g><g>${marks}</g>` +
    `</svg>`;

  // viewBox 가 깨지면 브라우저가 SVG 를 기본 크기(300×150)로 그린다 — 지도가 띠처럼 잘리는데
  // designQa 는 '넘침 없음'으로 통과시킨다. 실제로 그렇게 한 번 나갔다(2026-09-01).
  if (!new RegExp(`^<svg viewBox="0 0 ${VW} ${VH}" `).test(svg))
    throw new Error("지도 SVG 의 viewBox 가 깨졌습니다 — 이대로 두면 지도가 300×150 으로 줄어 잘립니다.");

  // labBoxes/pinsXY 는 **viewBox 좌표**다. 빌더가 카드 픽셀로 옮겨,
  // 지도 위에 얹는 HTML 블록(지방 학군지 패널)이 글자를 밟는지 잰다 —
  // designQa 는 SVG 안쪽만 재므로 그 겹침은 못 잡는다(2026-09-01).
  return { svg, resolved, pinsXY, labBoxes, collisions, placements, pinR: PIN_OUT, hitMinXInBand, viewBox: { w: VW, h: VH } };
}
