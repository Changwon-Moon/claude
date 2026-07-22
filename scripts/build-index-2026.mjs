/**
 * 국장 성적표 — 코스피·코스닥 연중 주가추이 + 고점대비 하락률(메인 포커스).
 * data/datasets/kr-market-<year>.json(수집기 산출·1차 캐시) → index-2026 콘텐츠 JSON.
 * 차트에 연초(1/1)·연중 고점·현재 3점을 날짜·주가와 함께 주석. 축(날짜) 표기.
 * 모든 수치는 데이터셋 값 그대로(창작 금지). 차트 SVG도 결정적으로 생성.
 * 실행: node scripts/build-index-2026.mjs [year] [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const year = process.argv[2] || "2026";
const date = process.argv[3] || "2026-07-26";

const ds = JSON.parse(readFileSync(join(ROOT, `data/datasets/kr-market-${year}.json`), "utf8"));

const fmt = (v) => v.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const md = (iso) => `${+iso.slice(5, 7)}/${+iso.slice(8, 10)}`;
const pct = (a, b) => Math.round(((b - a) / a) * 1000) / 10; // 소수1

/**
 * 시계열 → 주석 차트 SVG.
 * 3점(연초·고점·현재) 마커+라벨(날짜·주가), 연초→고점 상승률, 고점→현재 하락률,
 * 하단 날짜축(연초·고점·현재 tick). 결정적.
 */
function chartSvg(series, startIso, peakIso, lastIso, riseTxt, fallTxt) {
  const W = 1000, H = 300;
  const L = 14, R = 14, T = 40, B = 40; // 상단 라벨 여백·하단 축 여백
  const closes = series.map((p) => p.c);
  const mn = Math.min(...closes), mx = Math.max(...closes);
  const span = mx - mn || 1;
  const x = (i) => L + (i / (series.length - 1)) * (W - L - R);
  const y = (c) => T + (1 - (c - mn) / span) * (H - T - B);
  const idxOf = (iso) => series.findIndex((p) => p.d === iso);

  const pts = series.map((p, i) => `${x(i).toFixed(1)},${y(p.c).toFixed(1)}`);
  const si = 0, pi = idxOf(peakIso), li = series.length - 1;
  const area = `M${pts[0]}L${pts.join("L")}L${x(li).toFixed(1)},${H - B}L${x(0).toFixed(1)},${H - B}Z`;

  const P = { s: { i: si, ...series[si] }, p: { i: pi, ...series[pi] }, l: { i: li, ...series[li] } };
  const marker = (cls, i, c) => `<circle class="ix-dot-${cls}" cx="${x(i).toFixed(1)}" cy="${y(c).toFixed(1)}" r="9"/>`;

  // 마커 라벨 = 주가만(날짜는 하단 축). 마커 위에 얹어 축과 겹침 방지.
  const priceLabel = (cls, i, c, anchor, up = 22) => {
    const px = x(i), py = y(c);
    const dx = anchor === "start" ? 14 : anchor === "end" ? -14 : 0;
    return `<text class="ix-pt ${cls}" x="${(px + dx).toFixed(1)}" y="${(py - up).toFixed(1)}" text-anchor="${anchor}">${fmt(c)}</text>`;
  };

  // 연초→고점 상승률(빨강, 상단 개활지)
  const riseX = (x(P.s.i) + x(P.p.i)) / 2;
  const riseLabel = `<text class="ix-rise" x="${riseX.toFixed(1)}" y="${(T + 22).toFixed(1)}" text-anchor="middle">▲ ${riseTxt}</text>`;
  // 고점→현재 하락 = 대각 점선 가이드(그래프상 시각 표현). 하락률 숫자는 상단 히어로 박스가 메인.
  const guide = `<line class="ix-guide" x1="${x(P.p.i).toFixed(1)}" y1="${y(P.p.c).toFixed(1)}" x2="${x(P.l.i).toFixed(1)}" y2="${y(P.l.c).toFixed(1)}"/>`;
  const fallLabel = "";

  // 하단 날짜축(연초·고점·현재만)
  const axis = `<line class="ix-axis" x1="${L}" y1="${H - B + 4}" x2="${W - R}" y2="${H - B + 4}"/>`;
  const tick = (i, iso, anchor) => `<text class="ix-tick" x="${x(i).toFixed(1)}" y="${H - 10}" text-anchor="${anchor}">${md(iso)}</text>`;
  const ticks = tick(si, startIso, "start") + tick(pi, peakIso, "middle") + tick(li, lastIso, "end");

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">` +
    `<path class="ix-area" d="${area}"/>` +
    `<polyline class="ix-line" points="${pts.join(" ")}"/>` +
    guide +
    marker("start", P.s.i, P.s.c) + marker("peak", P.p.i, P.p.c) + marker("last", P.l.i, P.l.c) +
    priceLabel("", P.s.i, P.s.c, "start", 26) +
    priceLabel("peak", P.p.i, P.p.c, "end", 24) +
    priceLabel("last", P.l.i, P.l.c, "end", 28) +
    riseLabel + fallLabel +
    axis + ticks +
    `</svg>`;
}

const blocks = [];
let asOf = "";
for (const key of ["kospi", "kosdaq"]) {
  const ix = ds.indices[key];
  if (!ix) continue;
  asOf = ix.asOf;
  const startIso = ix.yearStart.date, peakIso = ix.peak.date, lastIso = ix.asOf;
  const risePct = pct(ix.yearStart.close, ix.peak.close); // 연초→고점
  const dd = ix.drawdownFromPeakPct; // 고점→현재(음수)
  blocks.push({
    name: ix.label,
    asOf: md(ix.asOf),
    now: fmt(ix.current),
    dd: `${dd > 0 ? "+" : ""}${dd}`,
    chartSvg: chartSvg(
      ix.series, startIso, peakIso, lastIso,
      `${risePct > 0 ? "+" : ""}${risePct}%`,
      `${dd}%`,
    ),
  });
}
if (!blocks.length) throw new Error("데이터셋에 지수 블록 없음");

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const asOfKor = `${+asOf.slice(5, 7)}/${+asOf.slice(8, 10)}`;
const doc = {
  template: "index-2026@1",
  date,
  year,
  title: `2026년 국장 성적표<span class="sub">${asOfKor} 기준</span>`,
  subtitle: "2026년 코스피·코스닥 주가추이",
  blocks,
  source: { name: (ds.meta?.source || "국내 증시 일간 종가").replace(/\s*\(무료 집계 소스\)/, ""), asOf },
};
writeFileSync(join(outDir, `index-${year}.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ index-${year} — ${blocks.map((b) => `${b.name} ${b.now} (고점대비 ${b.dd}%)`).join(" · ")} · ${asOf} 기준`);
