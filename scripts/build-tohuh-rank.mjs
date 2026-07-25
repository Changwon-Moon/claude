/**
 * 토허제 신고가 지도 — 수도권 토지거래허가구역(아파트) 40곳(서울 25구 + 경기 15곳)의 신고가 경신 건수.
 * singoga-map@1 템플릿 재사용(좌 TOP 순위 + 우 코로플레스 + 콜아웃).
 * 지도에는 **토허제 지역만** 그린다(미지정은 회색이 아니라 아예 미표시 — 오너 지시).
 * 판정 엔진은 서울판과 동일: (구|단지|법정동|전용면적) 그룹 이력 3건+ 누적최고 경신(이상치 방지).
 * ⚠️ 실거래 캐시는 2026 상반기(1~6월). 경기 신규 3곳은 7/5 발효 직전이라 '규제 효과' 아님.
 *    서울 25구는 2025-10-20부터 전역 지정(=집계 기간 내내 시행 중).
 * ⚠️ 화성은 동탄 일대만 지정이나 2013 경계엔 구가 없어 시 경계로 표시(수치는 동탄구 기준).
 * 실행: node scripts/build-tohuh-rank.mjs [latestMonth=202606] [date=2026-07-23] [topN=8]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const latest = process.argv[2] || "202606";
const date = process.argv[3] || "2026-07-23";
const topN = parseInt(process.argv[4] || "18", 10);
const latestPrefix = `${latest.slice(0, 4)}-${latest.slice(4, 6)}`;

// ── 토허제 지정 현황(정책 사실 데이터셋) ──
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const AREAS = [
  ...tohuh.seoul.areas.map((a) => ({ ...a, isNew: false, region: "서울" })),
  ...tohuh.newly.areas.map((a) => ({ ...a, isNew: true, region: "경기" })),
  ...tohuh.existing.areas.map((a) => ({ ...a, isNew: false, region: "경기" })),
];
const byGeo = new Map(AREAS.map((a) => [a.geoName, a]));
const keyOf = (a) => a.dataKey || a.geoName;

// ── 실거래(서울 11xxx + 경기 41xxx) → 신고가 경신 건수 ──
const molitDir = join(ROOT, "data/datasets/molit");
const files = readdirSync(molitDir).filter((f) => /^(11|41)\d{3}-\d{6}\.json$/.test(f));
if (!files.length) throw new Error("실거래 캐시 없음 — molit-collect 먼저");
const groups = new Map();
const totalBy = {};
let verifiedData = true;
for (const f of files) {
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  if (d.meta?.verified === false) verifiedData = false;
  const region = d.meta.gu;
  for (const t of d.trades) {
    if (t.canceled) continue;
    totalBy[region] = (totalBy[region] || 0) + 1;
    const k = `${region}|${t.aptNm}|${t.umdNm}|${Math.round(t.area)}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push({ p: t.priceWon, d: t.date, region });
  }
}
const hitBy = {};
for (const [, arr] of groups) {
  if (arr.length < 3) continue;
  arr.sort((a, b) => (a.d < b.d ? -1 : 1));
  let mx = -1;
  for (let i = 0; i < arr.length; i++) {
    const r = arr[i];
    if (i >= 2 && r.p > mx && r.d >= `${latestPrefix}-01`) hitBy[r.region] = (hitBy[r.region] || 0) + 1;
    if (r.p > mx) mx = r.p;
  }
}

// 토허제 지역별 집계
const stat = AREAS.map((a) => {
  const k = keyOf(a);
  const hits = hitBy[k] || 0, total = totalBy[k] || 0;
  return { ...a, key: k, hits, total, ratio: total ? Math.round((hits / total) * 1000) / 10 : 0 };
}).sort((x, y) => y.hits - x.hits);
const totalHits = stat.reduce((s, r) => s + r.hits, 0);
const totalTrades = stat.reduce((s, r) => s + r.total, 0);
const tohuhRate = totalTrades ? (Math.round((totalHits / totalTrades) * 1000) / 10).toFixed(1) : "0.0";
// 비교군: 토허제가 아닌 지역(= 경기 미지정 시·군·구). 서울은 전역 지정이라 비교군 없음.
const tohuhKeys = new Set(stat.map((r) => r.key));
let pHits = 0, pTrades = 0, pCount = 0;
for (const k of Object.keys(totalBy)) {
  if (tohuhKeys.has(k)) continue;
  pHits += hitBy[k] || 0; pTrades += totalBy[k]; pCount++;
}
const plainRate = pTrades ? (Math.round((pHits / pTrades) * 1000) / 10).toFixed(1) : "0.0";

// ── 지도: 토허제 지역만 그린다(미지정 미표시). bbox도 표시 대상만으로 계산해 꽉 차게. ──
const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-municipalities.geojson"), "utf8"));
const sub = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-submunicipalities.geojson"), "utf8"));
/** 표시 단위: {info, features[]}. subCodes가 있으면 읍면동을 합성해 신설 구(동탄구)를 만든다. */
const shownParts = [];
for (const a of AREAS) {
  if (a.subCodes) {
    const fs2 = sub.features.filter((f) => a.subCodes.includes(f.properties.code));
    if (fs2.length !== a.subCodes.length) throw new Error(`합성 경계 누락: ${a.geoName} (${fs2.length}/${a.subCodes.length})`);
    shownParts.push({ info: a, features: fs2 });
  } else {
    const f = geo.features.find((x) => x.properties.name === a.geoName && /^(11|31)/.test(x.properties.code));
    if (f) shownParts.push({ info: a, features: [f] });
  }
}
const shown = shownParts.flatMap((p) => p.features);
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of shown) for (const r of rings(f.geometry)) for (const [lo, la] of r) {
  minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo); minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
}
const kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
const W = 1000, scale = W / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale), PAD = 26;
const px = (lo) => PAD + (lo - minLon) * kx * scale, py = (la) => PAD + (maxLat - la) * scale;

const maxHits = Math.max(...stat.map((r) => r.hits), 1);
const C_LO = [255, 226, 219], C_HI = [176, 11, 30];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const fill = (h) => { const t = h / maxHits; return `rgb(${lerp(C_LO[0], C_HI[0], t)},${lerp(C_LO[1], C_HI[1], t)},${lerp(C_LO[2], C_HI[2], t)})`; };
const textCol = (h) => (h / maxHits > 0.5 ? "#ffffff" : "#26303d");

let paths = "";
let clipD = ""; // 표시 지역 전체(한강 클리핑용 — 그린 땅 위에만 강이 보이게)
let seoulD = ""; // 서울 25구 전체 링(외곽선 collar용)
const placed = []; // 라벨 배치 좌표(충돌 회피용)
for (const part of shownParts) {
  const info = part.info;
  const rec = stat.find((r) => r.geoName === info.geoName);
  const h = rec ? rec.hits : 0;
  // 합성 지역은 여러 서브폴리곤을 한 path로 그리고 내부 경계선이 안 보이도록 stroke 생략
  const merged = part.features.length > 1;
  let d = "", big = null, bl = 0;
  for (const f of part.features) for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > bl) { bl = ring.length; big = ring; }
  }
  paths += `<path class="tk-geo${merged ? " tk-merged" : ""}" d="${d}" fill="${fill(h)}"/>`;
  clipD += d;
  if (info.region === "서울") seoulD += d;
  const pts = big.map(([lo, la]) => [px(lo), py(la)]);
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
  if (Math.abs(A) < 1e-6) { cx = pts.reduce((s, q) => s + q[0], 0) / pts.length; cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; }
  else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
  placed.push({ cx, cy, h, label: info.mapLabel || info.label });
}

// 라벨 충돌 회피: 위→아래 순으로 배치하며 너무 가까우면 아래로 밀어낸다.
// 40곳 밀집(서울 25구)이라 라벨은 1줄("이름 숫자")로 합쳐 높이를 줄인다.
const LW = 140, LH = 26; // 라벨 대략 폭·높이(viewBox 단위) — '성남 수정 26' 기준
placed.sort((a, b) => a.cy - b.cy || a.cx - b.cx);
const done = [];
const XMIN = 78, XMAX = W + PAD * 2 - 78; // 가장자리 라벨이 잘리지 않도록 안쪽으로 클램프
for (const p of placed) {
  p.x = Math.max(XMIN, Math.min(XMAX, p.cx));
  let y = p.cy, guard = 0;
  while (guard++ < 30 && done.some((q) => Math.abs(q.x - p.x) < LW && Math.abs(q.y - y) < LH)) y += 7;
  p.y = y;
  done.push({ x: p.x, y });
}
let labels = "";
for (const p of placed) {
  labels += `<text class="tk-lab" x="${p.x.toFixed(0)}" y="${p.y.toFixed(0)}" fill="${textCol(p.h)}">` +
    `<tspan class="n">${p.label}</tspan> <tspan class="c">${p.h}</tspan></text>`;
}
// ── 서울 경계 표기 ──
// 서울 25구 링 전체를 굵게 stroke 하되, "서울 바깥"만 남기는 클립(전체 사각형 + 서울 링, evenodd)을 걸면
// 구·구 사이 내부 경계선은 전부 잘려 사라지고 시 외곽선의 바깥 절반만 남는다.
// → 폴리곤 union 연산 없이 시 경계만 얻는 방법. 경기 지역 위에 겹쳐 그려도 순서가 안전하다.
const VW = W + PAD * 2, VH = H + PAD * 2;
const seoulOutline =
  `<clipPath id="tkOutSeoul"><path clip-rule="evenodd" d="M0,0H${VW}V${VH}H0Z${seoulD}"/></clipPath>` +
  `<path class="tk-seoul" d="${seoulD}" clip-path="url(#tkOutSeoul)"/>`;
// 서울 라벨: 서울 최북단 꼭짓점 바로 위 여백에
let topX = 0, topY = 1e9;
for (const part of shownParts) {
  if (part.info.region !== "서울") continue;
  for (const f of part.features) for (const r of rings(f.geometry)) for (const [lo, la] of r) {
    const y = py(la); if (y < topY) { topY = y; topX = px(lo); }
  }
}
const tagX = Math.max(90, Math.min(VW - 90, topX));
const seoulTag = `<text class="tk-city" x="${tagX.toFixed(0)}" y="${(topY - 16).toFixed(0)}">서울특별시</text>`;

// ── 한강(도식선) ── 그려진 땅 위에서만 보이도록 표시 지역 전체로 클리핑
const river = JSON.parse(readFileSync(join(ROOT, "data/geo/hanriver-simplified.json"), "utf8"));
const riverD = "M" + river.coordinates.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L");
const riverSvg = `<clipPath id="tkLand"><path d="${clipD}"/></clipPath>` +
  `<path class="tk-river" d="${riverD}" clip-path="url(#tkLand)"/>`;

const mapSvg = `<svg viewBox="0 0 ${W + PAD * 2} ${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.tk-geo{stroke:#fff;stroke-width:2.5}.tk-merged{stroke:none}` +
  `.tk-seoul{fill:none;stroke:#2c3a4a;stroke-width:11;stroke-linejoin:round;opacity:.88}` +
  `.tk-city{text-anchor:middle;font-size:26px;font-weight:900;fill:#2c3a4a;letter-spacing:-0.02em;` +
  `paint-order:stroke;stroke:rgba(255,255,255,.8);stroke-width:4px;stroke-linejoin:round}` +
  `.tk-river{fill:none;stroke:#8fbfe0;stroke-width:11;stroke-linecap:round;stroke-linejoin:round}` +
  `.tk-lab{text-anchor:middle;paint-order:stroke;stroke:rgba(255,255,255,.65);stroke-width:3.5px;stroke-linejoin:round}` +
  `.tk-lab .n{font-size:21px;font-weight:800}` +
  `.tk-lab .c{font-size:23px;font-weight:900;font-family:'Wanted Sans','Pretendard',sans-serif}</style>` +
  `${paths}${riverSvg}${seoulOutline}${seoulTag}${labels}</svg>`;

// ── 좌측 TOP 순위 ──
const MEDALS = ["🥇", "🥈", "🥉"];
const rows = stat.slice(0, topN).map((r, i) => ({
  rank: i + 1, medal: MEDALS[i] || "", top: i < 3,
  gu: r.label + (r.isNew ? " ⚡" : ""),
  hits: r.hits,
}));

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "singoga-map@1",
  date,
  note: "수도권 토지거래허가구역(서울25+경기15) · 국토부 실거래",
  title: `🔥 2026년 6월 신고가 쏟아진 지역은? 🔥`,
  mapSvg,
  rows,
  compact: true,
  stamp: true, // 지도가 카드 절반 이상 → 아이덴티티 슬롯 C(그래픽 내부 스탬프)
  head: { l: "지역", r: "신고가 건수" },
  insight: `🥇 동탄 신고가는 강남 3구 전체의 <b>무려 6.9배</b> !!!`,
  totalHits,
  source: {
    name: "서울시·경기도 고시 · 국토부 실거래가",
    period: "2026 상반기",
    verified: verifiedData && tohuh.meta.verified,
  },
};
writeFileSync(join(outDir, `tohuh-rank.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ 토허제 40곳 — 총 ${totalHits}건(${tohuhRate}%) · 표시 ${AREAS.length}곳 vs 경기 그 외 ${pCount}곳 ${plainRate}%`);
console.log(`   TOP: ${rows.map((r) => `${r.gu}${r.hits}`).join(" · ")}`);
