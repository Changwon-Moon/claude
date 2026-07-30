/**
 * 토지거래허가구역 40곳 지도 SVG — 공용 모듈.
 *
 * ── 왜 모듈인가 (2026-07-30)
 * 이 지도는 손이 많이 간 자산이다: 한강을 손으로 그리지 않고 구 경계의 공유 정점에서 뽑고,
 * 서울 시 경계만 남기는 클립을 걸고, 40개 라벨이 겹치지 않게 아래로 밀어낸다.
 * 신고가 카드(build-tohuh-rank.mjs)에만 들어 있던 그 코드를 **전·월세 카드도 그대로 쓰라**는
 * 오너 지시로 여기 뽑았다. 복사하면 한강 로직을 한 번 고칠 때 두 곳을 고쳐야 하고,
 * 한 곳을 빠뜨리면 같은 수도권인데 강 모양이 다른 지도가 계정에 섞인다.
 *
 * 값이 무엇인지는 호출자가 정한다(신고가 건수 / 상승률 %). 이 모듈은 **그리는 법**만 안다.
 * 결정적: 같은 입력 → 같은 SVG 문자열.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const rings = (g) =>
  g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : [];

/** 한강 = '이북 구'와 '이남 구'가 공유하는 경계 정점. 구리=이북, 하남·강동=이남으로 둔다. */
const NORTH = new Set([
  "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구",
  "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "구리시",
]);
const SOUTH = new Set([
  "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구",
  "서초구", "강남구", "송파구", "강동구", "하남시",
]);
/** 양 끝단은 서울/경기 '시계'라 공유 정점이 없다 → 해당 구의 북쪽 링 정점을 이어붙인다. */
const WEST_TAIL = [[126.807, 37.6012], [126.8225, 37.588]]; // 강서구 북쪽 링(건너편 고양시)
const EAST_TAIL = [[127.2014, 37.5883], [127.2364, 37.5549]]; // 하남시 북쪽 링(건너편 남양주)

/** 아이덴티티 스탬프 위치 — 지도 '안'의 빈 여백 2곳(뷰박스 좌표라 지도 밖으로 안 나간다) */
const STAMP_AT = [[120, 1020], [720, 110]];

/**
 * 표시 단위 목록을 만든다. subCodes 가 있으면 읍면동을 합성해 신설 구(화성 동탄구)를 만든다.
 * @param areas [{geoName, label, mapLabel, subCodes?, region}]
 */
export function tohuhParts(areas) {
  const muni = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-municipalities.geojson"), "utf8"));
  const sub = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-submunicipalities.geojson"), "utf8"));
  const parts = [];
  for (const a of areas) {
    if (a.subCodes) {
      const fs2 = sub.features.filter((f) => a.subCodes.includes(f.properties.code));
      if (fs2.length !== a.subCodes.length) {
        throw new Error(`합성 경계 누락: ${a.geoName} (${fs2.length}/${a.subCodes.length})`);
      }
      parts.push({ info: a, features: fs2 });
      continue;
    }
    const f = muni.features.find(
      (x) => x.properties.name === a.geoName && /^(11|31)/.test(x.properties.code),
    );
    if (!f) throw new Error(`경계를 못 찾았다: ${a.geoName}`);
    parts.push({ info: a, features: [f] });
  }
  return parts;
}

/**
 * 지도 SVG.
 * @param parts    tohuhParts() 결과
 * @param valueOf  (info) → number  색·글자색을 정하는 값
 * @param textOf   (info) → string  라벨에 붙일 값 문자열(예: "57" 또는 "+22.9%")
 * @param maxValue 색 정규화 기준(없으면 valueOf 최대값)
 * @param labelWidth 라벨 충돌 판정 폭. 값 문자열이 길면(예: "+6.9%") 키운다. 기본 140
 */
export function tohuhMapSvg({ parts, valueOf, textOf, maxValue = null, labelWidth = 140 }) {
  /* bbox 는 **표시 대상만**으로 잡는다 — 경기 전체로 잡으면 40곳이 깨알처럼 작아진다 */
  const shown = parts.flatMap((p) => p.features);
  let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
  for (const f of shown)
    for (const r of rings(f.geometry))
      for (const [lo, la] of r) {
        minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
        minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
      }
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const W = 1000;
  const scale = W / ((maxLon - minLon) * kx);
  const H = Math.round((maxLat - minLat) * scale);
  const PAD = 26;
  const px = (lo) => PAD + (lo - minLon) * kx * scale;
  const py = (la) => PAD + (maxLat - la) * scale;

  const vals = parts.map((p) => valueOf(p.info));
  const max = maxValue ?? Math.max(...vals, 1);
  const C_LO = [255, 226, 219], C_HI = [176, 11, 30];
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const norm = (v) => Math.min(1, Math.max(0, v / max));
  const fill = (v) => {
    const t = norm(v);
    return `rgb(${lerp(C_LO[0], C_HI[0], t)},${lerp(C_LO[1], C_HI[1], t)},${lerp(C_LO[2], C_HI[2], t)})`;
  };
  const textCol = (v) => (norm(v) > 0.5 ? "#ffffff" : "#26303d");

  let paths = "";
  let clipD = ""; // 표시 지역 전체(한강 클리핑 — 그린 땅 위에만 강이 보이게)
  let seoulD = ""; // 서울 25구 링(시 외곽선 collar 용)
  const placed = [];
  for (const part of parts) {
    const info = part.info;
    const v = valueOf(info);
    const merged = part.features.length > 1; // 합성 지역은 내부 경계선을 지운다
    let d = "", big = null, bl = 0;
    for (const f of part.features)
      for (const ring of rings(f.geometry)) {
        d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
        if (ring.length > bl) { bl = ring.length; big = ring; }
      }
    paths += `<path class="tk-geo${merged ? " tk-merged" : ""}" d="${d}" fill="${fill(v)}"/>`;
    clipD += d;
    if (info.region === "서울") seoulD += d;
    const pts = big.map(([lo, la]) => [px(lo), py(la)]);
    let A = 0, cx = 0, cy = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const c = x0 * y1 - x1 * y0;
      A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
    }
    if (Math.abs(A) < 1e-6) {
      cx = pts.reduce((s, q) => s + q[0], 0) / pts.length;
      cy = pts.reduce((s, q) => s + q[1], 0) / pts.length;
    } else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
    placed.push({ cx, cy, v, label: info.mapLabel || info.label });
  }

  /* 라벨 충돌 회피: 위→아래로 배치하며 너무 가까우면 아래로 밀어낸다.
   * 40곳(서울 25구)이 밀집해 라벨은 1줄("이름 값")로 합쳐 높이를 줄인다. */
  /* 라벨 폭은 **호출자가 준다.** 기본 140 은 신고가 카드("성남 수정 26") 기준이고,
   * 상승률 카드는 "성남 수정 +6.9%" 로 더 넓어서 140 으로는 겹친다(노원·구리가 겹쳤다).
   * 이 값을 바꾸면 신고가 카드 픽셀이 변하므로 기본값은 절대 건드리지 않는다. */
  const LW = labelWidth, LH = 26; // 라벨 대략 폭·높이(viewBox 단위)
  placed.sort((a, b) => a.cy - b.cy || a.cx - b.cx);
  const done = [];
  const XMIN = 78, XMAX = W + PAD * 2 - 78; // 가장자리 라벨이 잘리지 않게 안쪽으로 클램프
  for (const p of placed) {
    p.x = Math.max(XMIN, Math.min(XMAX, p.cx));
    let y = p.cy, guard = 0;
    while (guard++ < 30 && done.some((q) => Math.abs(q.x - p.x) < LW && Math.abs(q.y - y) < LH)) y += 7;
    p.y = y;
    done.push({ x: p.x, y });
  }
  let labels = "";
  for (const p of placed) {
    labels +=
      `<text class="tk-lab" x="${p.x.toFixed(0)}" y="${p.y.toFixed(0)}" fill="${textCol(p.v)}">` +
      `<tspan class="n">${p.label}</tspan> <tspan class="c">${textOf(p)}</tspan></text>`;
  }

  /* 한강 — 손으로 그리지 않는다. 이북·이남 구가 공유하는 정점을 경도순으로 이으면
   * 선이 정확히 구 경계 위에 놓인다. */
  const vkey = (p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
  const nPts = new Map(), sPts = new Map();
  for (const part of parts) {
    const nm = part.info.geoName;
    const bag = NORTH.has(nm) ? nPts : SOUTH.has(nm) ? sPts : null;
    if (!bag) continue;
    for (const f of part.features) for (const r of rings(f.geometry)) for (const p of r) bag.set(vkey(p), p);
  }
  const riverCore = [...nPts.keys()]
    .filter((k) => sPts.has(k))
    .map((k) => nPts.get(k))
    .sort((a, b) => a[0] - b[0]);
  if (riverCore.length < 8) throw new Error(`한강 경계 정점 부족(${riverCore.length}) — 경계 데이터 확인`);
  const riverPts = [...WEST_TAIL, ...riverCore, ...EAST_TAIL];
  const riverD = "M" + riverPts.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L");
  const riverSvg =
    `<clipPath id="tkLand"><path d="${clipD}"/></clipPath>` +
    `<path class="tk-river" d="${riverD}" clip-path="url(#tkLand)"/>`;

  /* 서울 시 경계만 남기기 — 25구 링 전체를 굵게 stroke 하고, "서울 바깥"만 남기는
   * 클립(전체 사각형 + 서울 링, evenodd)을 걸면 구·구 내부 경계선이 잘려 사라진다.
   * 폴리곤 union 없이 시 외곽선을 얻는 방법. */
  const VW = W + PAD * 2, VH = H + PAD * 2;
  const seoulOutline =
    `<clipPath id="tkOutSeoul"><path clip-rule="evenodd" d="M0,0H${VW}V${VH}H0Z${seoulD}"/></clipPath>` +
    `<path class="tk-seoul" d="${seoulD}" clip-path="url(#tkOutSeoul)"/>`;

  const stamps = STAMP_AT.map(([x, y]) => `<text class="tk-stamp" x="${x}" y="${y}">@wirit_note</text>`).join("");

  return (
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
    `<style>.tk-geo{stroke:#fff;stroke-width:2.5}.tk-merged{stroke:none}` +
    `.tk-seoul{fill:none;stroke:#54636f;stroke-width:9;stroke-linejoin:round;opacity:.62}` +
    `.tk-river{fill:none;stroke:#8fbfe0;stroke-width:11;stroke-linecap:round;stroke-linejoin:round}` +
    `.tk-stamp{font-size:38px;font-weight:800;fill:#141821;opacity:.17;letter-spacing:-0.01em}` +
    `.tk-lab{text-anchor:middle;paint-order:stroke;stroke:rgba(255,255,255,.65);stroke-width:3.5px;stroke-linejoin:round}` +
    `.tk-lab .n{font-size:21px;font-weight:800}` +
    `.tk-lab .c{font-size:23px;font-weight:900;font-family:'Wanted Sans','Pretendard',sans-serif}</style>` +
    `${paths}${riverSvg}${seoulOutline}${labels}${stamps}</svg>`
  );
}
