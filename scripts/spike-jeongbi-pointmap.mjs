/**
 * 🧪 실험 — 점 지도(사업지 위치 마커) 형태가 카드 안에서 성립하는가.
 *
 * ⚠️ **발행용 카드가 아니다.** 오너 질문 "1번 인포그래픽 같은 형태가 가능한가"에
 * 답하기 위한 시험이다. sets.json·builders.json 에 등록하지 않는다.
 *
 * ── 무엇을 확인하려는가
 * 관건은 좌표가 아니라 **라벨**이다. 24곳에 각각 '구역명 / 브랜드명' 두 줄이 붙는데,
 * 1080×1350 안에서 겹치지 않고 읽히느냐가 되고 안 되고를 가른다.
 * 특히 강남 6곳·서초 4곳이 몰려 있어 그 일대가 최대 난제다.
 *
 * ── 좌표는 가짜다
 * 진짜 좌표는 카카오 로컬 API 지오코딩이 필요하다(수집기 아직 없음).
 * 여기서는 **구 무게중심 주위에 결정적으로 흩뿌린** 임시 좌표를 쓴다.
 * 위치는 틀리지만 "한 구에 여러 곳이 몰릴 때 라벨이 견디는가"는 그대로 드러난다 —
 * 그게 이 시험이 답해야 할 질문이다.
 *
 * 실행: node scripts/spike-jeongbi-pointmap.mjs
 * 산출: data/out/_spike/jeongbi-pointmap.json  (렌더는 호출자가)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/jeongbi-order-2026-07.json"), "utf8"));
const sites = doc.seoulSites.items;

// 원본 인포그래픽과 같은 조건에서 시험한다 — 건설사별 색 구분 포함.
// (채택 여부는 시험 결과를 보고 오너가 정한다. 여기서 정하지 않는다.)
const COLOR = {
  현대건설: "#12356B", GS건설: "#1E8A4C", 삼성물산: "#4FA8DC", 대우건설: "#E07B21",
  롯데건설: "#D4232E", 포스코이앤씨: "#7A4BB5", DL이앤씨: "#C2367F", SK에코플랜트: "#8A8F98",
};
const UNKNOWN = "#B4BAC2";

// ── 서울 경계 + 투영 ──
const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of geo.features) for (const r of rings(f.geometry)) for (const [lo, la] of r) {
  minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
  minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
}
const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const W = 1000, scale = W / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale), PAD = 6;
const px = (lo) => PAD + (lo - minLon) * kx * scale;
const py = (la) => PAD + (maxLat - la) * scale;

// 구별 무게중심(면적 가중)
const cen = {};
let paths = "";
for (const f of geo.features) {
  let d = "", big = null, bl = 0;
  for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > bl) { bl = ring.length; big = ring; }
  }
  paths += `<path d="${d}" fill="#EEF0F3" stroke="#FFFFFF" stroke-width="2"/>`;
  const pts = big.map(([lo, la]) => [px(lo), py(la)]);
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
  }
  if (Math.abs(A) < 1e-6) { cx = pts.reduce((s, q) => s + q[0], 0) / pts.length; cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; }
  else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
  cen[f.properties.name] = [cx, cy];
}

/* ── 임시 좌표: 구 무게중심 주위에 결정적으로 흩뿌린다 ──
 * 같은 구의 n개를 원형으로 배치. 랜덤 금지(결정성) — 인덱스로만 정한다. */
const byGu = {};
for (const s of sites) (byGu[s.gu] ||= []).push(s);
const pts = [];
for (const [gu, arr] of Object.entries(byGu)) {
  const [cx, cy] = cen[gu] || [W / 2, H / 2];
  const R = arr.length === 1 ? 0 : 26 + arr.length * 4;
  arr.forEach((s, i) => {
    const th = (-Math.PI / 2) + (i * 2 * Math.PI) / arr.length;
    pts.push({ ...s, x: cx + R * Math.cos(th), y: cy + R * Math.sin(th) });
  });
}

/* ── 라벨 배치: 점 주위 8방향을 순서대로 시도해 안 겹치는 자리를 고른다 ──
 * 결정적이어야 하므로 시도 순서를 고정한다. 끝내 자리가 없으면 그대로 두고 세어 둔다 —
 * **몇 개가 겹친 채 남는지가 이 시험의 답이다.** 숨기면 시험이 아니다. */
const LW = 150, LH = 44; // 라벨 상자(폭·높이) — 2줄 기준
const CAND = [[0,-1],[0,1],[1,0],[-1,0],[1,-1],[-1,-1],[1,1],[-1,1]];
const placed = [];
let unresolved = 0;
const hit = (a, b) => !(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0);
for (const p of pts) {
  let box = null;
  for (const [dx, dy] of CAND) {
    const cx = p.x + dx * (LW / 2 + 10), cy = p.y + dy * (LH / 2 + 12);
    const b = { x0: cx - LW / 2, x1: cx + LW / 2, y0: cy - LH / 2, y1: cy + LH / 2, cx, cy };
    if (!placed.some((q) => hit(b, q))) { box = b; break; }
  }
  if (!box) {
    unresolved++;
    const cx = p.x, cy = p.y - (LH / 2 + 12);
    box = { x0: cx - LW / 2, x1: cx + LW / 2, y0: cy - LH / 2, y1: cy + LH / 2, cx, cy, bad: true };
  }
  placed.push(box);
  p.box = box;
}

let marks = "", labels = "";
for (const p of pts) {
  const col = COLOR[p.builder] || UNKNOWN;
  marks += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7" fill="${col}" stroke="#fff" stroke-width="2"/>`;
  marks += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${p.box.cx.toFixed(1)}" y2="${p.box.cy.toFixed(1)}" stroke="${col}" stroke-width="1.2" opacity="0.5"/>`;
  labels +=
    `<text class="pl" x="${p.box.cx.toFixed(0)}" y="${(p.box.cy - 4).toFixed(0)}" fill="${col}">` +
    `<tspan class="a" x="${p.box.cx.toFixed(0)}">${p.name}</tspan>` +
    `<tspan class="b" x="${p.box.cx.toFixed(0)}" dy="20">${p.brand}</tspan></text>`;
}

// 범례
const used = [...new Set(pts.map((p) => p.builder).filter(Boolean))];
let legend = "";
used.forEach((b, i) => {
  const lx = 10 + (i % 3) * 210, ly = H + 30 + Math.floor(i / 3) * 30;
  legend += `<circle cx="${lx}" cy="${ly - 5}" r="7" fill="${COLOR[b]}"/>` +
    `<text class="lg" x="${lx + 14}" y="${ly}">${b}</text>`;
});
const legendH = 30 + Math.ceil(used.length / 3) * 30;

const mapSvg =
  `<svg viewBox="0 0 ${W + PAD * 2} ${H + PAD * 2 + legendH}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.pl{text-anchor:middle}.pl .a{font-size:19px;font-weight:800}` +
  `.pl .b{font-size:16px;font-weight:600;opacity:.75}` +
  `.lg{font-size:19px;font-weight:700;fill:#26303d;dominant-baseline:middle}</style>` +
  `${paths}${marks}${labels}${legend}</svg>`;

const card = {
  template: "map-choropleth@1",
  date: "2026-07-31",
  title: "🧪 점 지도 형태 시험 (좌표는 임시)",
  subtitle: `서울 사업지 ${pts.length}곳 · 라벨 겹침 미해결 ${unresolved}건`,
  mapSvg,
  source: { name: "형태 시험용 — 발행 금지", asOf: "2026-07-31" },
};

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "jeongbi-pointmap.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`🧪 점 지도 시험 — 마커 ${pts.length}개`);
console.log(`   라벨 자리 못 찾은 것: ${unresolved}건 / ${pts.length}`);
const top = Object.entries(byGu).sort((a, b) => b[1].length - a[1].length)[0];
console.log(`   가장 몰린 구: ${top[0]} ${top[1].length}곳`);
console.log(`   미해결 라벨: ${pts.filter((p) => p.box.bad).map((p) => p.name).join(", ")}`);
console.log(`   → data/out/_spike/jeongbi-pointmap.json`);
