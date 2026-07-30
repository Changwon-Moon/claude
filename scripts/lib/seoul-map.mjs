/**
 * 서울 자치구 코로플레스 지도 SVG 생성 — 공용 모듈.
 *
 * ── 왜 모듈로 뽑았나 (2026-07-30)
 * 경계 투영과 라벨 무게중심 계산이 build-map-card.mjs 와 build-map-rank.mjs 에
 * **똑같이 복사돼** 있었다. 세 번째 카드(전·월세 상승률 지도)를 만들면서 또 복사하면
 * 투영을 한 번 고칠 때 세 곳을 고쳐야 하고, 한 곳을 빠뜨리면 카드마다 지도가
 * 미묘하게 달라진다 — 같은 서울인데 모양이 다른 지도가 계정에 섞이는 셈이다.
 *
 * 결정적이어야 한다: 같은 입력 → 같은 SVG 문자열(랜덤·시각 요소 없음).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const GEO = join(ROOT, "data/geo/seoul-districts.geojson");

const rings = (geom) =>
  geom?.type === "Polygon"
    ? geom.coordinates
    : geom?.type === "MultiPolygon"
      ? geom.coordinates.flat()
      : [];

/** 경계 파일을 읽고 화면 좌표 변환기를 만든다. W=1000 고정(템플릿이 100% 폭으로 늘린다). */
export function loadSeoulGeo({ width = 1000, pad = 6 } = {}) {
  const geo = JSON.parse(readFileSync(GEO, "utf8"));
  let minLon = 999,
    maxLon = -999,
    minLat = 999,
    maxLat = -999;
  for (const f of geo.features)
    for (const ring of rings(f.geometry))
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
  // 위도에 따른 경도 축소 보정 — 안 하면 서울이 가로로 늘어난다
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const scale = width / ((maxLon - minLon) * kx);
  const height = Math.round((maxLat - minLat) * scale);
  return {
    geo,
    width,
    height,
    pad,
    px: (lon) => pad + (lon - minLon) * kx * scale,
    py: (lat) => pad + (maxLat - lat) * scale,
  };
}

/**
 * 폴리곤 무게중심(면적 가중). 오목한 자치구(예: 강서·송파)에서도 라벨이 도형 안에 남는다.
 * 정점 평균으로 하면 꼭짓점이 몰린 쪽으로 끌려가 라벨이 도형 밖으로 나간다.
 */
export function centroid(pts) {
  let A = 0,
    cx = 0,
    cy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cross = x0 * y1 - x1 * y0;
    A += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  if (Math.abs(A) < 1e-6) {
    return [
      pts.reduce((s, p) => s + p[0], 0) / pts.length,
      pts.reduce((s, p) => s + p[1], 0) / pts.length,
    ];
  }
  A *= 0.5;
  return [cx / (6 * A), cy / (6 * A)];
}

/**
 * 화면좌표 폴리곤의 면적(px²).
 *
 * ── 왜 필요한가 (2026-07-30)
 * 자치구 이름과 값을 지도에 같이 찍으면 **작은 구에서 글자가 서로 겹친다.**
 * 첫 렌더에서 성동·광진·중구 라벨이 뭉쳤다. 모든 라벨을 작게 하면 큰 구가 허전하고,
 * 사람이 구마다 크기를 손으로 정하면 데이터가 바뀔 때 또 손을 대야 한다.
 * → 면적으로 글자 크기를 정한다. 규칙 하나로 끝나고 결정적이다.
 */
export function polyArea(pts) {
  let A = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    A += x0 * y1 - x1 * y0;
  }
  return Math.abs(A) / 2;
}

/** [r,g,b] 두 색 사이 보간 → "rgb(...)" */
export function ramp(lo, hi, t) {
  const c = (i) => Math.round(lo[i] + (hi[i] - lo[i]) * Math.min(1, Math.max(0, t)));
  return `rgb(${c(0)},${c(1)},${c(2)})`;
}

/**
 * 코로플레스 SVG 문자열.
 *
 * @param opts.geoClass  path 에 붙일 클래스(템플릿마다 다르다: mc-geo / mr-geo)
 * @param opts.labClass  text 에 붙일 클래스
 * @param opts.value     (자치구명) → { fill, textFill, lines: [{text, cls, dy}] } | null
 *                       null 이면 '값 없음' 처리(호출자가 회색 등으로 정한다)
 * @param opts.blankFill 값이 없는 자치구 색
 * @param opts.blankText 값이 없는 자치구 글자색
 * @param opts.extraStyle svg 안에 넣을 <style> 내용(라벨 크기 등)
 */
export function choroplethSvg({
  geoClass = "mc-geo",
  labClass = "mc-lab",
  value,
  blankFill = "#eee",
  blankText = "#98a2b3",
  extraStyle = "",
  width = 1000,
  pad = 6,
} = {}) {
  const { geo, height, px, py } = loadSeoulGeo({ width, pad });

  /* 도형을 먼저 다 재고(면적 포함) → 그 다음에 라벨을 만든다.
   * 라벨 크기를 면적 비율로 정하려면 **가장 큰 구를 알아야** 하므로 두 번 돈다. */
  const shapes = geo.features.map((f) => {
    let d = "";
    let biggest = null;
    let biggestLen = 0;
    for (const ring of rings(f.geometry)) {
      d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
      if (ring.length > biggestLen) {
        biggestLen = ring.length;
        biggest = ring;
      }
    }
    const pts = biggest.map(([lo, la]) => [px(lo), py(la)]);
    return { name: f.properties.name, d, pts, area: polyArea(pts) };
  });
  const maxArea = Math.max(...shapes.map((s) => s.area));

  let paths = "";
  let labels = "";
  for (const s of shapes) {
    const v = value ? value(s.name, { area: s.area, maxArea }) : null;
    paths += `<path class="${geoClass}" d="${s.d}" fill="${v ? v.fill : blankFill}"/>`;
    const [cx0, cy0] = centroid(s.pts);
    const cx = cx0.toFixed(0);
    const lines = v?.lines || [];
    /* 라벨 후광(halo): 글자 뒤에 **그 자치구의 색**을 두껍게 깔고 그 위에 글자를 그린다.
     * 작은 구에서는 라벨이 옆 구 경계를 넘어갈 수밖에 없는데(글자가 도형보다 넓다),
     * 후광이 없으면 두 구의 글자가 뒤엉켜 읽히지 않는다(첫 렌더에서 성동·광진이 그랬다).
     * 후광 색을 자기 구 색으로 쓰면 넘어간 글자도 **어느 구의 글자인지** 보인다. */
    const halo = v?.halo
      ? `paint-order:stroke;stroke:${v.halo};stroke-width:6px;stroke-linejoin:round`
      : "";
    labels +=
      `<text class="${labClass}" x="${cx}" y="${(cy0 + (v?.dy ?? 0)).toFixed(0)}" fill="${v ? v.textFill : blankText}"` +
      (halo ? ` style="${halo}"` : "") +
      `>` +
      lines
        .map(
          (l, i) =>
            `<tspan${l.cls ? ` class="${l.cls}"` : ""} x="${cx}"` +
            (i > 0 ? ` dy="${l.dy ?? 26}"` : "") +
            (l.size ? ` style="font-size:${l.size}px"` : "") +
            `>${l.text}</tspan>`,
        )
        .join("") +
      `</text>`;
  }
  const style = extraStyle ? `<style>${extraStyle}</style>` : "";
  return `<svg viewBox="0 0 ${width + pad * 2} ${height + pad * 2}" xmlns="http://www.w3.org/2000/svg">${style}${paths}${labels}</svg>`;
}
