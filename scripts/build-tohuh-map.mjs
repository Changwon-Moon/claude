/**
 * 경기 토허제 지도 — 토지거래허가구역(아파트) 지정 시·군·구 + 지정 직전 6개월 신고가 경신 건수.
 * 색 = 토허제 상태(신규/기존/미지정), 숫자 = 신고가 경신 건수(코드 산출).
 * 판정 엔진은 singoga-map과 동일(그룹 이력 3건+ 누적최고 경신 → 이상치 방지).
 * ⚠️ 캐시가 2026 상반기(1~6월) = 신규 지정(7/5 발효) **직전** → '규제 효과'가 아니라
 *    '지정 직전 6개월 열기'로만 해석·표기한다(오보 0).
 * ⚠️ 지도는 시·군·구 단위. 실제 허가구역은 일부만인 경우가 있다(화성=동탄 일대) → 카드에 caveat 표기.
 * 실행: node scripts/build-tohuh-map.mjs [latestMonth=202606] [date=2026-07-23]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const latest = process.argv[2] || "202606";
const date = process.argv[3] || "2026-07-23";
const latestPrefix = `${latest.slice(0, 4)}-${latest.slice(4, 6)}`;

// ── 토허제 지정 현황(별도 데이터셋 — 정책 사실) ──
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const NEW = new Map(tohuh.newly.areas.map((a) => [a.geoName, a]));
const OLD = new Map(tohuh.existing.areas.map((a) => [a.geoName, a]));
const statusOf = (name) => (NEW.has(name) ? "new" : OLD.has(name) ? "old" : "none");

// ── 경기 실거래 → 시군구별 신고가 경신 건수 ──
const molitDir = join(ROOT, "data/datasets/molit");
const files = readdirSync(molitDir).filter((f) => /^41\d{3}-\d{6}\.json$/.test(f));
if (!files.length) throw new Error("경기(41xxx) 실거래 캐시가 없습니다 — molit-collect(region=gyeonggi) 먼저 실행");
const groups = new Map();
const totalBy = {};
let verifiedData = true;
for (const f of files) {
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  if (d.meta?.verified === false) verifiedData = false;
  const region = d.meta.gu; // lawd-gyeonggi 키(예: 용인시기흥구)
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

/** GeoJSON 이름 → 실거래 데이터 키. 토허제 데이터셋에 dataKey가 있으면 우선(화성=동탄구). */
const dataKey = (geoName) => {
  const a = NEW.get(geoName) || OLD.get(geoName);
  return (a && a.dataKey) || geoName;
};

// ── 지도 ──
const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-municipalities.geojson"), "utf8"));
const gg = geo.features.filter((f) => f.properties.code.startsWith("31")); // 경기(2013 통계청 코드)
const seoul = geo.features.filter((f) => f.properties.code.startsWith("11"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of [...gg, ...seoul]) for (const r of rings(f.geometry)) for (const [lo, la] of r) {
  minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo); minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
}
const kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
const W = 1000, scale = W / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale), PAD = 8;
const px = (lo) => PAD + (lo - minLon) * kx * scale, py = (la) => PAD + (maxLat - la) * scale;
const pathOf = (f) => {
  let d = "", big = null, bl = 0;
  for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > bl) { bl = ring.length; big = ring; }
  }
  const pts = big.map(([lo, la]) => [px(lo), py(la)]);
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
  if (Math.abs(A) < 1e-6) { cx = pts.reduce((s, q) => s + q[0], 0) / pts.length; cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; }
  else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
  return { d, cx, cy };
};

const FILL = { new: "#c8102e", old: "#f2a0a6", none: "#e6e9ee" };
const TEXT = { new: "#ffffff", old: "#3b1116", none: "#98a2b0" };
let paths = "", labels = "";
// 서울: 회색 덩어리 한 개(지리 맥락용, 라벨 1개)
let sMinX = 1e9, sMaxX = -1e9, sMinY = 1e9, sMaxY = -1e9;
for (const f of seoul) {
  const { d, cx, cy } = pathOf(f);
  paths += `<path class="th-seoul" d="${d}"/>`;
  sMinX = Math.min(sMinX, cx); sMaxX = Math.max(sMaxX, cx); sMinY = Math.min(sMinY, cy); sMaxY = Math.max(sMaxY, cy);
}
const seoulLabel = `<text class="th-seoullab" x="${((sMinX + sMaxX) / 2).toFixed(0)}" y="${((sMinY + sMaxY) / 2).toFixed(0)}">서울</text>`;
// 경기: 토허제 색 + (지정지역만) 라벨·건수
for (const f of gg) {
  const name = f.properties.name;
  const st = statusOf(name);
  const { d, cx, cy } = pathOf(f);
  paths += `<path class="th-geo th-${st}" d="${d}" fill="${FILL[st]}"/>`;
  // 라벨은 신규 3곳만 — 기존 12곳은 서울 남부에 밀집해 라벨이 겹친다(수치는 좌측 리스트로).
  if (st === "new") {
    const info = NEW.get(name);
    const hits = hitBy[dataKey(name)] ?? 0;
    labels += `<text class="th-lab" x="${cx.toFixed(0)}" y="${cy.toFixed(0)}" fill="${TEXT[st]}">` +
      `<tspan class="n" x="${cx.toFixed(0)}">${info.label}</tspan>` +
      `<tspan class="c" x="${cx.toFixed(0)}" dy="46">${hits}</tspan></text>`;
  }
}
const mapSvg = `<svg viewBox="0 0 ${W + PAD * 2} ${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.th-geo{stroke:#fff;stroke-width:1.6}.th-new{stroke:#7d0a1d;stroke-width:3}` +
  `.th-seoul{fill:#c3cad4;stroke:#fff;stroke-width:1.2}` +
  `.th-seoullab{text-anchor:middle;font-size:46px;font-weight:900;fill:#5f6b80}` +
  `.th-lab{text-anchor:middle;paint-order:stroke;stroke:rgba(125,10,29,.55);stroke-width:5px;stroke-linejoin:round}` +
  `.th-lab .n{font-size:36px;font-weight:800}` +
  `.th-lab .c{font-size:46px;font-weight:900;font-family:'Wanted Sans','Pretendard',sans-serif}</style>` +
  `${paths}${seoulLabel}${labels}</svg>`;

// ── 통계: 신규 3곳 + 토허제 전체 vs 미지정 ──
// 주의: 통계는 '데이터 키' 기준이라 geo 이름과 다를 수 있다(화성시→화성시동탄구).
// dataKey가 지정된 지역은 그 키에 토허제 상태를 부여해야 집계가 맞는다.
const statusByDataKey = new Map();
for (const [g, a] of NEW) statusByDataKey.set(a.dataKey || g, "new");
for (const [g, a] of OLD) statusByDataKey.set(a.dataKey || g, "old");
const statusOfData = (k) => statusByDataKey.get(k) || "none";
const list = Object.keys(totalBy).map((r) => ({
  region: r, hits: hitBy[r] || 0, total: totalBy[r], status: statusOfData(r),
}));
const sum = (arr, k) => arr.reduce((s, x) => s + x[k], 0);
const tohuhAll = list.filter((r) => r.status !== "none");
const plain = list.filter((r) => r.status === "none");
const rate = (arr) => (sum(arr, "total") ? Math.round((sum(arr, "hits") / sum(arr, "total")) * 1000) / 10 : 0);

const newRows = tohuh.newly.areas.map((a) => ({
  label: a.label,
  hits: hitBy[dataKey(a.geoName)] ?? 0,
  ratio: (() => { const t = totalBy[dataKey(a.geoName)] || 0; const h = hitBy[dataKey(a.geoName)] || 0; return t ? (Math.round((h / t) * 1000) / 10).toFixed(1) : "0.0"; })(),
  partial: !!a.partial,
})).sort((a, b) => b.hits - a.hits);

// 기존 지정 12곳 — 건수 순(지도엔 라벨 없음, 여기서 수치 전달)
const oldRows = tohuh.existing.areas
  .map((a) => {
    const k = a.dataKey || a.geoName;
    const h = hitBy[k] ?? 0, t = totalBy[k] || 0;
    return { label: a.label, hits: h, ratio: t ? (Math.round((h / t) * 1000) / 10).toFixed(1) : "0.0" };
  })
  .sort((a, b) => b.hits - a.hits);

const stats = {
  tohuhRate: rate(tohuhAll).toFixed(1),
  plainRate: rate(plain).toFixed(1),
  tohuhHits: sum(tohuhAll, "hits"),
  plainHits: sum(plain, "hits"),
  tohuhCount: tohuhAll.length,
  plainCount: plain.length,
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "tohuh-map@1",
  date,
  note: "경기도 토지거래허가구역(아파트) · 국토부 실거래",
  title: `묶인 데는 <span class="hi">이유</span>가 있었다`,
  subtitle: `경기 아파트 토허제 15곳 · 숫자 = 지정 직전 6개월 신고가 경신 건수`,
  mapSvg,
  newRows,
  oldRows,
  stats,
  caveat: "지도는 시·군·구 경계 기준. 실제 허가구역은 일부만 지정된 경우가 있다(화성=동탄 일대, 수치도 동탄구 기준). 신규 3곳은 아파트만 대상.",
  source: {
    name: "경기도 허가구역 고시 · 국토부 실거래가",
    period: "2026 상반기",
    verified: verifiedData && tohuh.meta.verified,
  },
};
writeFileSync(join(outDir, `tohuh-map.json`), JSON.stringify(doc, null, 2) + "\n");

console.log(`✅ 토허제 지도 — 신규 3곳: ${newRows.map((r) => `${r.label} ${r.hits}건(${r.ratio}%)`).join(" · ")}`);
console.log(`   토허제 ${stats.tohuhCount}곳 신고가율 ${stats.tohuhRate}% (${stats.tohuhHits}건) vs 미지정 ${stats.plainCount}곳 ${stats.plainRate}% (${stats.plainHits}건)`);
console.log(`   경기 전체 상위:`);
[...list].sort((a, b) => b.hits - a.hits).slice(0, 10).forEach((r) =>
  console.log(`     ${String(r.hits).padStart(3)}건 ${r.region} (거래 ${r.total} · ${((r.hits / r.total) * 100).toFixed(1)}%) ${r.status !== "none" ? "[" + r.status + "]" : ""}`));
