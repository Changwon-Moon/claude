/**
 * 서울 정비사업 수주 지도 — 구별 사업지 수 코로플레스 + 좌 순위. singoga-map@1 재사용.
 *
 * ── 소재 (2026-07-31 오너 지시 "인포그래픽 1번 서울 지도를 나의 포맷으로")
 * 뉴시스 지도 인포그래픽(2026-07-30, 전진우 기자)의 마커 24곳.
 *
 * ── 왜 점(사업지) 지도가 아니라 구별 코로플레스인가
 * 원본은 사업지 **위치**에 점을 찍은 지도다. 그러려면 단지·구역 좌표가 있어야 하는데
 * 좌표 수집기(카카오 로컬 API)가 아직 없다. 손으로 찍는 것은 금지돼 있다 —
 * CARD_CHECKLIST §2: *"이 칸을 손으로 지정 → 데이터가 바뀌면 엉뚱한 칸이 된다"*.
 * 그래서 **지도가 이미 배치해 준 자치구**로 집계한다. 위치는 우리가 추정하지 않는다.
 * (좌표 수집기가 생기면 점 지도로 승격할 수 있다. KAKAO_REST_KEY 가 그 용도로 이미 등록돼 있다.)
 *
 * ── 이 카드가 말하는 것
 * 24곳 중 강남·서초에 10곳. 정비사업 물량이 어디로 쏠렸는지가 한눈에 보인다.
 * 건설사별 색 구분은 하지 않는다 — 브랜드 서열로 읽히면 안 된다(ideas.json 민감 표시).
 *
 * 실행: node scripts/build-jeongbi-map.mjs [date=2026-07-31]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/jeongbi-order-2026-07.json"), "utf8"));
const sites = doc.seoulSites?.items;
if (!Array.isArray(sites) || !sites.length) throw new Error("seoulSites 가 비었다");

// ── 구별 집계 ──
const byGu = {};
for (const s of sites) byGu[s.gu] = (byGu[s.gu] || 0) + 1;
const total = sites.length;
const totalFromGu = Object.values(byGu).reduce((a, b) => a + b, 0);
if (totalFromGu !== total) throw new Error(`구별 합계 불일치: ${totalFromGu} vs ${total}`);

const stat = Object.entries(byGu)
  .map(([gu, n]) => ({ gu, n }))
  .sort((a, b) => b.n - a.n || a.gu.localeCompare(b.gu, "ko"));
const maxN = Math.max(...stat.map((r) => r.n));

/* 제목 문구는 계산이 확인했을 때만 나간다(CARD_CHECKLIST §2).
 * '강남·서초에 몇 곳'은 세어 보고 쓴다 — 손으로 적으면 다음 갱신에 거짓이 된다. */
const gangnamSeocho = (byGu["강남구"] || 0) + (byGu["서초구"] || 0);
const share = Math.round((gangnamSeocho / total) * 1000) / 10;

// ── 코로플레스 (신고가 지도와 같은 색 체계 — 계정 안에서 지도 문법을 통일한다) ──
const C_LO = [255, 226, 219];
const C_HI = [176, 11, 30];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const norm = (n) => (maxN ? n / maxN : 0);
const fill = (n) => `rgb(${lerp(C_LO[0], C_HI[0], norm(n))},${lerp(C_LO[1], C_HI[1], norm(n))},${lerp(C_LO[2], C_HI[2], norm(n))})`;
const textCol = (n) => (norm(n) > 0.5 ? "#ffffff" : "#26303d");

const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of geo.features)
  for (const r of rings(f.geometry))
    for (const [lo, la] of r) {
      minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
      minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
    }
const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const W = 1000, scale = W / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale), PAD = 6;
const px = (lo) => PAD + (lo - minLon) * kx * scale;
const py = (la) => PAD + (maxLat - la) * scale;

/* 지도에 그려진 구 이름이 집계 키와 하나도 안 맞으면 색이 전부 0으로 칠해진다 —
 * 조용히 회색 지도가 나가는 것보다 던지는 게 낫다. */
const geoNames = new Set(geo.features.map((f) => f.properties.name));
for (const g of Object.keys(byGu)) {
  if (!geoNames.has(g)) throw new Error(`지도에 없는 구 이름: ${g} — geojson 표기와 맞추라`);
}

let paths = "", labels = "";
for (const f of geo.features) {
  const name = f.properties.name;
  const n = byGu[name] ?? 0;
  let d = "", big = null, bl = 0;
  for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > bl) { bl = ring.length; big = ring; }
  }
  paths += `<path class="sm-geo" d="${d}" fill="${fill(n)}"/>`;
  // 면적 가중 무게중심 — 정점 평균으로 하면 라벨이 도형 밖으로 나간다(seoul-map.mjs 주석 참고)
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
  const tc = textCol(n);
  /* 2줄 라벨(이름+숫자)은 무게중심에서 **아래로** 뻗는다. 그대로 두면 서초처럼
   * 남북으로 긴 구에서 숫자가 경계 밖으로 나간다 — 라벨이 남의 구에 있으면
   * 숫자가 통째로 오독된다(CARD_CHECKLIST §2 지도). 두 줄을 무게중심에
   * 맞춰 중앙정렬하도록 위로 절반 올린다. */
  const ly = n ? cy - 16 : cy;
  labels +=
    `<text class="sm-lab" x="${cx.toFixed(0)}" y="${ly.toFixed(0)}" fill="${tc}">` +
    `<tspan class="n" x="${cx.toFixed(0)}">${name.replace(/구$/, "")}</tspan>` +
    // 0곳인 구에 "0"을 적으면 지도가 숫자로 뒤덮인다. 수주가 있는 구만 숫자를 쓴다.
    (n ? `<tspan class="c" x="${cx.toFixed(0)}" dy="34">${n}</tspan>` : "") +
    `</text>`;
}
const mapSvg =
  `<svg viewBox="0 0 ${W + PAD * 2} ${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.sm-lab{text-anchor:middle}.sm-lab .n{font-size:30px;font-weight:800}` +
  `.sm-lab .c{font-size:31px;font-weight:900;font-family:'Wanted Sans','Pretendard',sans-serif}</style>` +
  `${paths}${labels}</svg>`;

// ── 좌측 순위 (메달 없음 — 많이 수주된 게 '잘한 것'이 아니라 물량이 쏠린 곳이다) ──
const rows = stat.map((r, i) => ({
  rank: i + 1,
  medal: "",
  top: i < 3,
  gu: r.gu,
  hits: r.n,
}));

const card = {
  template: "singoga-map@1",
  date,
  /* 제목은 짧게 — 길면 우상단 로고 뱃지를 침범한다(첫 렌더에서 badgeclip 41px 발생).
   * 맥락(총 몇 곳·기준일)은 부제가 갖는다. */
  title: `강남·서초에 ${gangnamSeocho}곳 쏠렸다`,
  subtitle: `올해 서울 정비사업 수주 ${total}곳 · ${doc.seoulSites.asOf.replace(/-/g, ".").slice(2)} 기준`,
  unit: "곳",
  /* ⚠️ head 를 안 주면 템플릿 기본값 "신고가 건수 · 비율"이 그대로 나간다 —
   * 신고가 카드의 라벨이다. 실제로 첫 렌더가 그렇게 나갔고, 정비사업 건수를
   * "신고가 건수"라고 부르는 건 그 자체로 오보다. 머리글은 **반드시 명시한다**. */
  head: { l: "자치구", r: "사업지 수" },
  /* 행이 10개뿐이라 그냥 두면 카드 아래 1/3이 빈다(CARD_CHECKLIST §2 여백).
   * 정보를 늘리지 않고 간격만 편다. */
  spread: true,
  mapSvg,
  rows,
  totalHits: total,
  note: `서울 ${stat.length}개 구에 ${total}곳. 그중 ${gangnamSeocho}곳(${share}%)이 강남·서초다.`,
  source: { name: "각 사 · 뉴시스 정리", asOf: doc.seoulSites.asOf },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "jeongbi-map.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

// ── 캡션(코드 생성) ──
const known = sites.filter((s) => s.builder);
const byBuilder = {};
for (const s of known) (byBuilder[s.builder] ||= []).push(s);
const capDir = join(ROOT, "data/review/captions");
mkdirSync(capDir, { recursive: true });
const caption = [
  card.title,
  ``,
  `올해 주요 건설사가 서울에서 따낸 정비사업 ${total}곳을 자치구별로 세어 봤습니다.`,
  `${card.note}`,
  ``,
  `[자치구별]`,
  ...stat.map((r) => `· ${r.gu} ${r.n}곳`),
  ``,
  `[건설사별 서울 사업지]`,
  ...Object.entries(byBuilder)
    .sort((x, y) => y[1].length - x[1].length)
    .map(([b, arr]) => `· ${b} — ${arr.map((s) => s.name).join(", ")}`),
  ``,
  `※ 자치구는 원 자료 지도가 표시한 위치를 그대로 옮겼습니다.`,
  `※ 자료: 각 사 (뉴시스 2026-07-30 정리). 1차 출처 대조 전입니다.`,
  ``,
  `#부동산 #재건축 #재개발 #도시정비사업 #압구정 #성수동 #목동재건축 #서울부동산 #부동산정보 #위릿`,
].join("\n");
writeFileSync(join(capDir, "jeongbi-map.txt"), caption + "\n", "utf8");

console.log(`🗺  jeongbi-map — 서울 ${stat.length}개 구 · ${total}곳`);
console.log(`   제목: ${card.title}`);
console.log(`   강남+서초 ${gangnamSeocho}곳 (${share}%) · 최다 ${stat[0].gu} ${stat[0].n}곳`);
console.log(`   → data/content/${date}/jeongbi-map.json`);
