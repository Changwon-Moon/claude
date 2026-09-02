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
import { hanRiverPoints } from "./han-river.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const rings = (g) =>
  g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : [];

/* 한강 북/남 구 명단·꼬리 좌표·정점 추출은 lib/han-river.mjs 하나가 정본이다(2026-09-01 분리). */

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
 * @param twoLine  라벨을 2줄로(이름 / 값). 좁은 도형에서 1줄보다 훨씬 잘 들어간다.
 *                 폭이 절반쯤으로 줄어드니 labelWidth 도 함께 줄인다.
 */
/* ── 라벨을 경계에서 떼어 놓기 위한 기하 도우미 (2026-09-01, `centerFit` 전용) ──
 * 무게중심은 "가운데"가 아니다. 오목한 구(중구·성동구)에서는 무게중심이 경계 바로 옆이나
 * 아예 옆 구 위에 떨어진다. 여기서 쓰는 것은 **최대 내접원의 중심**(polylabel) —
 * 다각형 안에서 **경계까지의 거리가 최대**인 점이다. 정의상 가장 넉넉한 자리다.
 * 격자·분할 순서가 고정돼 있어 같은 입력 → 같은 좌표(결정적 렌더의 전제). */

/** 점 → 선분 최단거리의 제곱 */
function seg2(x, y, x1, y1, x2, y2) {
  let dx = x2 - x1, dy = y2 - y1;
  if (dx || dy) {
    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x1 = x2; y1 = y2; } else if (t > 0) { x1 += dx * t; y1 += dy * t; }
  }
  dx = x - x1; dy = y - y1;
  return dx * dx + dy * dy;
}

/** 링 안이면 +, 밖이면 − 인 경계까지의 거리 */
function edgeDist(rs, x, y) {
  let inside = false, best = Infinity;
  for (const r of rs)
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      best = Math.min(best, seg2(x, y, xj, yj, xi, yi));
    }
  return (inside ? 1 : -1) * Math.sqrt(best);
}

/** 정점이 너무 촘촘하면 거리 계산이 느려진다 — 최소 간격으로 솎는다(모양은 유지) */
function thin(r, minGap = 2) {
  const out = [r[0]];
  for (const q of r) {
    const [px0, py0] = out[out.length - 1];
    if (Math.hypot(q[0] - px0, q[1] - py0) >= minGap) out.push(q);
  }
  if (out.length < 4) return r;
  return out;
}

/** 최대 내접원 중심 — 격자를 잘라 가며 좁힌다(polylabel 축약판) */
function poleOfInaccessibility(rs, precision = 1) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of rs) for (const [x, y] of r) {
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  const w = maxX - minX, h = maxY - minY;
  let cell = Math.min(w, h) / 2 || 1;
  let best = null;
  /** 한 칸의 중심 점수 = 경계거리, 잠재력 = 점수 + 칸 대각 반지름 */
  const mk = (x, y, hw) => { const d = edgeDist(rs, x, y); return { x, y, hw, d, max: d + hw * Math.SQRT2 }; };
  let queue = [];
  for (let x = minX; x < maxX; x += cell)
    for (let y = minY; y < maxY; y += cell) queue.push(mk(x + cell / 2, y + cell / 2, cell / 2));
  for (const c of queue) if (!best || c.d > best.d) best = c;
  let guard = 0;
  while (queue.length && guard++ < 4000) {
    queue.sort((a, b) => b.max - a.max);
    const c = queue.shift();
    if (c.max - best.d <= precision) break;
    const hw = c.hw / 2;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const q = mk(c.x + sx * hw, c.y + sy * hw, hw);
      if (q.d > best.d) best = q;
      queue.push(q);
    }
  }
  return best ? { x: best.x, y: best.y, r: best.d } : null;
}

export function tohuhMapSvg({
  parts,
  valueOf,
  textOf,
  maxValue = null,
  /** 색·정규화 옵션(기본값 = 기존 동작 유지 → 발행 카드 픽셀 불변).
   * minValue 를 주면 [min,max] 정규화(대비↑). colorLo/colorHi 로 그라데이션 양끝을 바꾼다. */
  minValue = 0,
  colorLo = [255, 226, 219],
  colorHi = [176, 11, 30],
  textThreshold = 0.5,
  /** 지도 안 @wirit_note 스탬프. 기본은 켬(발행 카드 픽셀 불변).
   * ⚠️ 이 모듈은 스탬프를 **2개** 찍는데 BRAND.md 는 「아이디는 카드당 1개」다.
   * 푸터 워터마크를 켜는 카드는 여기를 꺼야 한 장에 하나가 된다(2026-09-01). */
  stamps: withStamps = true,
  /** 지도 글자를 전부 잉크색으로. 기본은 끔(진한 칸은 흰 글자 — 발행 카드 픽셀 불변).
   * ⚠️ 켜려면 `colorHi` 를 밝은 쪽으로 줘야 한다. 기본 진한끝 rgb(176,11,30) 위의 잉크는
   * 대비 2.46 으로 WCAG 큰글자 AA(3.0)에도 못 미친다. 계정 레드 #E5484D 를 진한끝으로
   * 쓰면 전 구간 4.54 이상이 나온다(2026-09-01 실측). */
  labelInk = false,
  /** 라벨을 **경계에서 가장 먼 안쪽 점**(최대 내접원 중심)에 놓고, 글자 상자가 경계선에
   * 닿으면 벌점을 준다. 기본은 끔 — 켜면 배치가 달라져 발행 카드 픽셀이 바뀐다.
   * `placement:"nearest"` 와 함께 쓴다(무게중심 대신 그 점을 기준으로 겨룬다). */
  centerFit = false,
  /** 한강에 **흰 테두리(케이싱)**를 두른다. 기본은 끔(발행 카드 픽셀 불변).
   *
   * ── 왜 (오너 2026-09-02 확인 → 반영)
   * 강 색 `#8fbfe0` 은 **빨강 지도에서는 색상 대비**로 또렷하다(파랑 선 vs 붉은 면).
   * 그런데 전세 지도를 파랑 램프로 바꾸자 **파랑 선 vs 파랑 면**이 되어 색상 대비가
   * 사라지고 명도 대비만 남았다 — 실측(전세 84 성동 칸) 강 0.487 / 면 0.377 로 **1.26:1**,
   * 사실상 안 보이는 값이다. 강이 흐려지면 지도가 방위를 잃는다(한강은 이 지도의 축이다).
   *
   * ⚠️ 강 색 자체를 바꾸지 않는다. 그러면 발행본(월세 비중 지도)의 픽셀이 함께 바뀐다.
   * 대신 **지도학의 표준 해법인 케이싱**을 쓴다 — 굵은 흰 선을 아래에 깔고 그 위에 강을
   * 그린다. 밝은 면 위에서도 어두운 면 위에서도 **면과 강 사이에 흰 띠**가 생기므로
   * 램프 색이 무엇이든 분리가 유지된다. 구 경계선도 이미 흰색(`.tk-geo` stroke)이라
   * 새 요소처럼 보이지 않고 같은 언어로 읽힌다. */
  riverCasing = false,
  labelWidth = 140,
  twoLine = false,
  /** 라벨 배치 방식. "down"(기본) = 아래로만 밀기 · "nearest" = 중앙에서 가장 가까운 빈 자리.
   * ⚠️ 기본값을 바꾸면 **이미 발행된** 신고가 카드(published/2026-07-26-tohuh-rank)의
   *    픽셀이 달라진다. 발행본과 저장소 보관본이 어긋나면 "그날의 픽셀"이라는 기록이 거짓이 된다.
   *    그래서 개선은 새 카드에서만 켠다. */
  placement = "down",
}) {
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
  const min = minValue;                       // 기본 0 → v/max (기존 동작)
  const span = max - min || 1;
  const C_LO = colorLo, C_HI = colorHi;
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const norm = (v) => Math.min(1, Math.max(0, (v - min) / span));
  const fill = (v) => {
    const t = norm(v);
    return `rgb(${lerp(C_LO[0], C_HI[0], t)},${lerp(C_LO[1], C_HI[1], t)},${lerp(C_LO[2], C_HI[2], t)})`;
  };
  const textCol = (v) => (labelInk ? "#141821" : norm(v) > textThreshold ? "#ffffff" : "#26303d");

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
    /* 면적도 함께 넘긴다 — 큰 구부터 자리를 잡아 중앙을 지켜주려면 필요하다 */
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    /* 투영된 링 전부 — 라벨이 **자기 도형 안에** 앉았는지 판정하는 데 쓴다.
     * 무게중심만으로는 부족하다: 오목한 구(중랑·성동)는 무게중심이 옆 구 위에 떨어진다. */
    const projRings = [];
    for (const f of part.features)
      for (const ring of rings(f.geometry)) projRings.push(ring.map(([lo, la]) => [px(lo), py(la)]));
    /* `centerFit` 이면 무게중심 대신 **최대 내접원 중심**을 기준점으로 삼는다.
     * 링은 솎아서 넘긴다 — 정점이 수백 개면 거리 계산이 40곳 × 후보격자만큼 반복된다. */
    const thinRings = centerFit ? projRings.map((r) => thin(r)) : projRings;
    const pole = centerFit ? poleOfInaccessibility(thinRings) : null;
    placed.push({
      cx: pole ? pole.x : cx,
      cy: pole ? pole.y : cy,
      inR: pole ? pole.r : 0,
      v, area, rings: projRings, thinRings,
      label: info.mapLabel || info.label,
    });
  }

  /* 라벨 충돌 회피: 위→아래로 배치하며 너무 가까우면 아래로 밀어낸다.
   * 40곳(서울 25구)이 밀집해 라벨은 1줄("이름 값")로 합쳐 높이를 줄인다. */
  /* 라벨 폭은 **호출자가 준다.** 기본 140 은 신고가 카드("성남 수정 26") 기준이고,
   * 상승률 카드는 "성남 수정 +6.9%" 로 더 넓어서 140 으로는 겹친다(노원·구리가 겹쳤다).
   * 이 값을 바꾸면 신고가 카드 픽셀이 변하므로 기본값은 절대 건드리지 않는다. */
  const LW = labelWidth, LH = twoLine ? 52 : 26;
  const XMIN = 78, XMAX = W + PAD * 2 - 78; // 가장자리 라벨이 잘리지 않게 안쪽으로 클램프
  const done = [];
  const free = (x, y) => !done.some((q) => Math.abs(q.x - x) < LW && Math.abs(q.y - y) < LH);
  const clampX = (x) => Math.max(XMIN, Math.min(XMAX, x));

  if (placement === "nearest") {
    /* ── 자기 도형 안, 중앙에 가장 가까운 자리 (2026-07-30 오너 3차 지적) ──
     * "down" 방식은 겹치면 아래로만 밀어서 라벨이 자기 구역을 훌쩍 벗어난다.
     * 2차 시도(빈 자리 우선 탐색)도 "겹치지 않는 첫 자리"를 잡느라 중랑·서대문·금천이
     * 옆 구 위로 날아갔다 — **겹침 회피가 소속보다 앞선** 게 원인이다.
     *
     * 그래서 셋을 한 점수로 겨룬다. 후보 격자를 전부 훑어 최솟값을 고른다:
     *   ① 중앙에서 멀어진 거리(px)
     *   ② 라벨이 자기 도형 **밖**으로 나간 정도 (OUT_PEN)
     *   ③ 다른 라벨과 겹친 **면적 비율** (OVER_PEN — 0/1 이 아니라 연속값)
     * ③ 이 연속값이라 좁은 구(수원 팔달)는 "살짝 겹치고 제자리"를 택한다(오너 허용).
     * 큰 구부터 자리를 잡는다 — 작은 구는 어차피 밀리므로 큰 구의 중앙을 지켜준다.
     * 결정적: 격자·순서가 고정돼 있어 같은 입력 → 같은 배치. */
    const OUT_PEN = 300; // 도형 밖으로 완전히 나간 라벨의 벌점(px 환산)
    /* ⚠️ centerFit 을 켜면 겹침 벌점을 올린다. 안 그러면 좁은 구(중구)가 "제자리에 가깝고
     * 경계 여유도 그럭저럭"인 자리를 골라 **옆 구 라벨과 겹친 채로** 끝난다
     * (2026-09-01 첫 판에서 중구가 종로의 "9.6억" 위에 앉았다). 겹침이 여유보다 눈에 띈다. */
    const OVER_PEN = centerFit ? 1100 : 560; // 라벨 하나와 완전히 겹쳤을 때의 벌점(px 환산)
    const CLEAR_PEN = 420; // 경계에 완전히 붙었을 때의 벌점(centerFit 전용)
    const NEED = twoLine ? 16 : 11; // 글자 상자 끝에서 경계까지 바라는 여유(px)
    /* 라벨 글자 상자의 세로 표본점 — 2줄이면 위/가운데/아래를 다 본다(앵커 기준 상대 좌표) */
    const PROBE = twoLine ? [-22, 0, 14] : [0];
    const inPoly = (rs, x, y) => {
      let c = false;
      for (const r of rs)
        for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
          const [xi, yi] = r[i], [xj, yj] = r[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
        }
      return c;
    };
    /* ── 배치 순서
     * 기존: **큰 구부터** — "작은 구는 어차피 밀리니 큰 구의 중앙을 지켜준다"는 판단이었다.
     * centerFit 에서는 뒤집는다: **여유가 좁은 구부터**(내접원 반지름 오름차순).
     * 좁은 구는 갈 곳이 없고 넓은 구는 비켜 줄 자리가 있기 때문이다.
     * 실측(2026-09-01): 큰 구 우선일 때 성북이 먼저 앉아 종로를 24px 남쪽으로 밀었고,
     * 밀린 종로가 다시 중구를 덮었다(중구 내접원 26px — 40곳 중 가장 좁다).
     * ⚠️ `placement:"nearest"` + centerFit 을 안 켠 카드는 예전 순서 그대로다(픽셀 불변). */
    if (centerFit) placed.sort((a, b) => a.inR - b.inR || a.cy - b.cy || a.cx - b.cx);
    else placed.sort((a, b) => b.area - a.area || a.cy - b.cy || a.cx - b.cx);
    /* 격자 간격·범위. centerFit 은 좁은 구가 자기 안에서 빈 자리를 더 멀리까지 찾아야 해서
     * 세로 범위를 넓힌다(중구·성동구처럼 가늘고 긴 도형). */
    const SX = LW / 12, SY = 6, RX = 8, RY = centerFit ? 16 : 11;
    for (const p of placed) {
      let best = null;
      for (let iy = -RY; iy <= RY; iy++)
        for (let ix = -RX; ix <= RX; ix++) {
          const x = clampX(p.cx + ix * SX);
          const y = p.cy + iy * SY;
          let out = 0;
          for (const dy of PROBE) if (!inPoly(p.rings, x, y + dy)) out++;
          let ov = 0;
          for (const q of done) {
            const fx = Math.max(0, LW - Math.abs(q.x - x)) / LW;
            const fy = Math.max(0, LH - Math.abs(q.y - y)) / LH;
            ov += fx * fy;
          }
          /* ── 경계 여유 (centerFit 전용, 2026-09-01 오너 지시)
           * "도형 안에 있다"만 보면 라벨이 경계선에 붙는다(중구·성동구가 그랬다).
           * 글자 상자의 **가로 끝·세로 끝**에서 경계까지의 거리를 재서, 필요한 여유보다
           * 모자란 만큼 벌점을 준다. 좁은 구는 애초에 여유가 없으니 `inR` 로 눈높이를 낮춘다
           * — 안 그러면 좁은 구가 벌점을 피하려고 자기 도형을 떠난다. */
          let clr = 0;
          if (centerFit) {
            const need = Math.min(NEED, p.inR * 0.75);
            let worst = Infinity;
            for (const dx of [-LW * 0.34, 0, LW * 0.34])
              for (const dy of PROBE) worst = Math.min(worst, edgeDist(p.thinRings, x + dx, y + dy));
            if (worst < need) clr = (need - worst) / Math.max(need, 1);
          }
          const score =
            Math.hypot(x - p.cx, y - p.cy) + (out / PROBE.length) * OUT_PEN + ov * OVER_PEN + clr * CLEAR_PEN;
          if (!best || score < best.score) best = { x, y, score };
        }
      p.x = best.x;
      p.y = best.y;
      /* 라벨이 왜 거기 앉았는지 보려면 `WIRIT_MAP_DEBUG=1` — 기준점(내접원 중심)·반지름·최종 좌표.
       * 눈으로 "겹쳤다"만 보고 상수를 흔들면 다른 구가 깨진다. 수치를 보고 고친다. */
      if (process.env.WIRIT_MAP_DEBUG)
        console.error(
          `[map] ${String(p.label).padEnd(8)} pole=(${p.cx.toFixed(0)},${p.cy.toFixed(0)}) inR=${p.inR.toFixed(0)}` +
            ` → (${p.x.toFixed(0)},${p.y.toFixed(0)}) 이동 ${Math.hypot(p.x - p.cx, p.y - p.cy).toFixed(0)}px`,
        );
      done.push({ x: p.x, y: p.y });
    }
  } else {
    /* 기존 방식(발행된 신고가 카드가 이 배치로 굳어 있다) — 위→아래로 훑으며 아래로만 밀어낸다 */
    placed.sort((a, b) => a.cy - b.cy || a.cx - b.cx);
    for (const p of placed) {
      p.x = clampX(p.cx);
      let y = p.cy, guard = 0;
      while (guard++ < 30 && !free(p.x, y)) y += 7;
      p.y = y;
      done.push({ x: p.x, y });
    }
  }
  let labels = "";
  for (const p of placed) {
    const y = twoLine ? p.y - 9 : p.y;
    labels +=
      `<text class="tk-lab" x="${p.x.toFixed(0)}" y="${y.toFixed(0)}" fill="${textCol(p.v)}">` +
      (twoLine
        ? `<tspan class="n" x="${p.x.toFixed(0)}">${p.label}</tspan>` +
          `<tspan class="c" x="${p.x.toFixed(0)}" dy="27">${textOf(p)}</tspan>`
        : `<tspan class="n">${p.label}</tspan> <tspan class="c">${textOf(p)}</tspan>`) +
      `</text>`;
  }

  /* 한강 — 손으로 그리지 않는다. 이북·이남 구가 공유하는 정점을 경도순으로 이으면
   * 선이 정확히 구 경계 위에 놓인다. */
  const riverPts = hanRiverPoints(
    parts.map((part) => ({
      name: part.info.geoName,
      rings: part.features.flatMap((f) => rings(f.geometry)),
    })),
  );
  const riverD = "M" + riverPts.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L");
  const riverSvg =
    `<clipPath id="tkLand"><path d="${clipD}"/></clipPath>` +
    /* 케이싱을 **먼저** 그린다(아래에 깔린다). 같은 클립을 쓰므로 바다로는 안 번진다. */
    (riverCasing ? `<path class="tk-river-case" d="${riverD}" clip-path="url(#tkLand)"/>` : "") +
    `<path class="tk-river" d="${riverD}" clip-path="url(#tkLand)"/>`;

  /* 서울 시 경계만 남기기 — 25구 링 전체를 굵게 stroke 하고, "서울 바깥"만 남기는
   * 클립(전체 사각형 + 서울 링, evenodd)을 걸면 구·구 내부 경계선이 잘려 사라진다.
   * 폴리곤 union 없이 시 외곽선을 얻는 방법. */
  const VW = W + PAD * 2, VH = H + PAD * 2;
  const seoulOutline =
    `<clipPath id="tkOutSeoul"><path clip-rule="evenodd" d="M0,0H${VW}V${VH}H0Z${seoulD}"/></clipPath>` +
    `<path class="tk-seoul" d="${seoulD}" clip-path="url(#tkOutSeoul)"/>`;

  const stamps = withStamps
    ? STAMP_AT.map(([x, y]) => `<text class="tk-stamp" x="${x}" y="${y}">@wirit_note</text>`).join("")
    : "";

  return (
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
    `<style>.tk-geo{stroke:#fff;stroke-width:2.5}.tk-merged{stroke:none}` +
    `.tk-seoul{fill:none;stroke:#54636f;stroke-width:9;stroke-linejoin:round;opacity:.62}` +
    `.tk-river{fill:none;stroke:#8fbfe0;stroke-width:11;stroke-linecap:round;stroke-linejoin:round}` +
    /* 케이싱 폭 17 = 강 11 + 양쪽 3px 흰 띠. 구 경계선(2.5px 흰색)보다 살짝 굵어
       강이 경계선의 일부가 아니라 **그 위를 지나는 물**로 읽힌다. */
    (riverCasing
      ? `.tk-river-case{fill:none;stroke:#fff;stroke-width:17;stroke-linecap:round;stroke-linejoin:round}`
      : "") +
    `.tk-stamp{font-size:38px;font-weight:800;fill:#141821;opacity:.17;letter-spacing:-0.01em}` +
    `.tk-lab{text-anchor:middle;paint-order:stroke;stroke:rgba(255,255,255,.65);stroke-width:3.5px;stroke-linejoin:round}` +
    `.tk-lab .n{font-size:21px;font-weight:800}` +
    `.tk-lab .c{font-size:23px;font-weight:900;font-family:'Wanted Sans','Pretendard',sans-serif}</style>` +
    `${paths}${riverSvg}${seoulOutline}${labels}${stamps}</svg>`
  );
}
