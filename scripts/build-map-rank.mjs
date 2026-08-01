/**
 * 서울 행정구별 대장 APT — 코로플레스 지도(축소) + 구별 최고가 순위표. 2장 캐러셀.
 *   p1: 순위 1~13 · p2: 순위 14~25
 *   지도는 페이지별로 "해당 순위 구간의 구만 색상, 나머지는 회색" 처리.
 * data/geo/seoul-districts.geojson + data/datasets/molit/*.json(최근 6개월) 사용.
 * 실행: node scripts/build-map-rank.mjs <84|59> [date]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const metric = process.argv[2] || "84";
const date = process.argv[3] || "2026-07-21";
const BAND = metric === "59" ? [58, 61] : [83, 86];
const PYEONG = metric === "59" ? "25평" : "34평";

// 서울특별시 공식 심볼마크(위키미디어 공용, 산·해·한강 3색 브러시) 인라인 — 결정적 렌더용
const emblem = readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg"), "utf8")
  .replace(/<\?xml[^>]*\?>/i, "")
  .replace(/<metadata>[\s\S]*?<\/metadata>/i, "")
  .replace(/<svg\s/i, '<svg class="em" preserveAspectRatio="xMidYMid meet" ')
  .replace(/\swidth="[^"]*"/i, "")
  .replace(/\sheight="[^"]*"/i, "")
  .replace(/\senable-background="[^"]*"/i, "")
  .trim();

// 집계 창 = **그해 1월부터 최신월까지 누적**(2026-07-31 오너 결정).
// 이전에는 `slice(-6)` 로 항상 최근 6개월이었다 — 7월이 들어오면 1월이 밀려나면서
// 구에 따라 최고가가 **내려가는** 일이 생긴다. "올해 가장 비싼 거래"라는 말과도 어긋난다.
const molitDir = join(ROOT, "data/datasets/molit");
// ⚠️ **서울만** 읽는다(법정동코드 11xxx). 지역 구분 없이 읽으면 나중에 다른 지역
//    실거래를 수집하는 순간 이 카드가 조용히 오염된다 — 실제로 그랬다:
//    7/21 서울 카드가 7/22 경기 수집 후 과천·분당·동탄이 섞인 채로 바뀌었다(2026-07-27 오너 발견).
//    제목이 "서울 아파트"인데 경기가 들어가면 그건 오보다.
const files = readdirSync(molitDir).filter((f) => /^11\d{3}-\d{6}\.json$/.test(f));
const yms = [...new Set(files.map((f) => f.match(/-(\d{6})\.json$/)?.[1]).filter(Boolean))].sort();
const YEAR = yms.at(-1)?.slice(0, 4) ?? "";
const useMonths = yms.filter((m) => m.startsWith(YEAR));
const byGu = {};
for (const f of files) {
  const ym = f.match(/-(\d{6})\.json$/)?.[1];
  if (!useMonths.includes(ym)) continue;
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  (byGu[d.meta.gu] ??= []).push(...d.trades);
}
const guTop = {};
for (const [gu, txs] of Object.entries(byGu)) {
  const best = new Map();
  for (const t of txs) {
    if (t.canceled || !t.priceWon || !t.aptNm) continue;
    if (!(t.area >= BAND[0] && t.area < BAND[1])) continue;
    const k = `${t.aptNm}|${t.umdNm}`;
    if (!best.has(k) || t.priceWon > best.get(k).priceWon) best.set(k, t);
  }
  const top = [...best.values()].sort((a, b) => b.priceWon - a.priceWon)[0];
  if (top) guTop[gu] = { price: top.priceWon / 1e8, apt: top.aptNm };
}
const ranked = Object.entries(guTop).map(([gu, v]) => ({ gu, ...v })).sort((a, b) => b.price - a.price);
const prices = ranked.map((r) => r.price);
const mn = Math.min(...prices), mx = Math.max(...prices);
const eok = (v) => (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1));
/* 표기: 2026.1~07월 기준. 최신월이 **아직 신고 기간 안**이면 그 사실을 카드에 적는다 —
 * 실거래 신고기한은 계약 후 30일이라, 갓 지난 달은 절반쯤만 들어와 있다.
 * 밝히지 않으면 나중에 신고가 채워져 숫자가 바뀔 때 앞 카드가 틀린 것처럼 보인다.
 * 판정은 눈이 아니라 빌드 날짜(인자)와 최신월의 차이로 한다 — 결정적으로 재현된다. */
const lastYm = useMonths.at(-1) ?? "";
const [bY, bM] = date.split("-").map(Number);
const gapMonths = lastYm ? (bY - +lastYm.slice(0, 4)) * 12 + (bM - +lastYm.slice(4)) : 99;
const partial = gapMonths <= 1; // 최신월이 이번 달이거나 지난달 → 신고가 아직 들어오는 중
const asOfBase = useMonths.length
  ? `${YEAR}.${+useMonths[0].slice(4)}~${useMonths.at(-1).slice(4)}월`
  : "최근 6개월";
const asOf = partial ? `${asOfBase}(${+lastYm.slice(4)}월분 신고 진행 중)` : asOfBase;

// ── 색상(빨강 히트맵) ──
const C_LO = [255, 224, 217], C_HI = [176, 11, 30];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const norm = (p) => (mx === mn ? 0.5 : (p - mn) / (mx - mn));
const fill = (p) => `rgb(${lerp(C_LO[0], C_HI[0], norm(p))},${lerp(C_LO[1], C_HI[1], norm(p))},${lerp(C_LO[2], C_HI[2], norm(p))})`;
const textCol = (p) => (norm(p) > 0.45 ? "#ffffff" : "#1c2431");
const GRAY_FILL = "#dfe2e7", GRAY_TEXT = "#aab2bd"; // 언급 안 되는 구

// ── GeoJSON → 투영 준비 ──
const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of geo.features) for (const r of rings(f.geometry)) for (const [lo, la] of r) {
  minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo); minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
}
const kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
const W = 1000, scale = W / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale), PAD = 6;
const px = (lo) => PAD + (lo - minLon) * kx * scale, py = (la) => PAD + (maxLat - la) * scale;

// activeGus: 이 페이지에서 색을 입힐 구(Set). 나머지는 회색.
function genMap(activeGus) {
  let paths = "", labels = "";
  for (const f of geo.features) {
    const name = f.properties.name, info = guTop[name];
    const active = activeGus.has(name) && info;
    const p = info ? info.price : mn;
    let d = "", big = null, bl = 0;
    for (const ring of rings(f.geometry)) {
      d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
      if (ring.length > bl) { bl = ring.length; big = ring; }
    }
    paths += `<path class="mr-geo" d="${d}" fill="${active ? fill(p) : GRAY_FILL}"/>`;
    const pts = big.map(([lo, la]) => [px(lo), py(la)]);
    let A = 0, cx = 0, cy = 0;
    for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
    if (Math.abs(A) < 1e-6) { cx = pts.reduce((s, q) => s + q[0], 0) / pts.length; cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; }
    else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
    const tc = active ? textCol(p) : GRAY_TEXT;
    labels += `<text class="mr-lab" x="${cx.toFixed(0)}" y="${(cy + 10).toFixed(0)}" fill="${tc}"><tspan class="g" x="${cx.toFixed(0)}">${name.replace(/구$/, "")}</tspan></text>`;
  }
  return `<svg viewBox="0 0 ${W + PAD * 2} ${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg"><style>.mr-lab .g{font-size:34px}</style>${paths}${labels}</svg>`;
}

// ── 콘텐츠 2장 ──
const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
// 출처는 **수치의 출처**만 적는다(2026-07-31 오너 지시로 '서울시 행정경계' 제거).
// 행정경계는 지도를 그리는 도형일 뿐 표의 숫자가 나온 곳이 아니다 — 함께 적으면
// 독자가 "가격도 서울시 자료인가" 하고 헷갈린다. 도형 출처는 geojson 쪽에 남아 있다.
const source = { name: "국토부 실거래가", asOf };
const MEDALS = ["🥇", "🥈", "🥉"];
const toRow = (r, i) => ({ rank: i + 1, gu: r.gu, apt: r.apt, price: eok(r.price), cls: i < 3 ? `r${i + 1}` : "", medal: MEDALS[i] || "" });
const rowsAll = ranked.map(toRow);
const half = Math.ceil(rowsAll.length / 2); // 13
const rows1 = rowsAll.slice(0, half), rows2 = rowsAll.slice(half);
const gus1 = new Set(rows1.map((r) => r.gu)), gus2 = new Set(rows2.map((r) => r.gu));
const base = {
  template: "map-rank@1", date, metric, emblem, pyeong: PYEONG,
  subtitle: `전용 ${metric}㎡(${metric === "59" ? "25평" : "34평"}) 기준 · ${asOfBase} 최고 실거래`,
  source,
};
writeFileSync(join(outDir, `maprank-${metric}-p1.json`), JSON.stringify({ ...base, mapSvg: genMap(gus1), rows: rows1 }, null, 2) + "\n");
writeFileSync(join(outDir, `maprank-${metric}-p2.json`), JSON.stringify({ ...base, mapSvg: genMap(gus2), rows: rows2 }, null, 2) + "\n");
console.log(`✅ ${PYEONG}(전용${metric}) 2장 — ${ranked.length}개구 · 1위 ${ranked[0].gu} ${ranked[0].apt} ${eok(mx)}억 · 기간 ${asOf}`);
