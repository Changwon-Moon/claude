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
const monthsBetween = (aIso, bIso) => {
  const a = new Date(aIso + "T00:00:00Z"), b = new Date(bIso + "T00:00:00Z");
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24 * 30.44)));
};

/**
 * 시계열 → 주석 차트 SVG.
 * 3점(연초·고점·현재) 마커+라벨(날짜·주가), 연초→고점 상승률, 고점→현재 하락률,
 * 하단 날짜축(연초·고점·현재 tick). 결정적.
 */
function chartSvg(series, startIso, peakIso, lastIso, riseTxt, monthsTxt) {
  const W = 1000, H = 360;
  const L = 16, R = 16, T = 82, B = 46; // T = 상단 주석 전용 밴드(데이터는 이 아래에만 그림)
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
  // 주가 라벨(날짜는 축). up>0 위쪽, up<0 아래쪽.
  const priceLabel = (cls, i, c, anchor, up) => {
    const dx = anchor === "start" ? 6 : anchor === "end" ? -6 : 0;
    return `<text class="ix-pt ${cls}" x="${(x(i) + dx).toFixed(1)}" y="${(y(c) - up).toFixed(1)}" text-anchor="${anchor}">${fmt(c)}</text>`;
  };

  // ── 연초→고점 상승 곡선 화살표(연한 빨강) — 라벨은 상단 전용 밴드(y<T, 데이터 없음)에 ──
  const ax = x(P.s.i), ay = y(P.s.c), bx = x(P.p.i), by = y(P.p.c);
  const midx = (ax + bx) / 2;
  const tipX = bx - 3, tipY = by - 4;
  const ctrlX = midx, ctrlY = 14; // 상단 밴드에서 볼록
  const ux0 = tipX - ctrlX, uy0 = tipY - ctrlY, dl = Math.hypot(ux0, uy0) || 1;
  const ux = ux0 / dl, uy = uy0 / dl, pxp = -uy, pyp = ux, aL = 15, aW = 9;
  const barb = `M${(tipX - ux * aL + pxp * aW).toFixed(1)},${(tipY - uy * aL + pyp * aW).toFixed(1)} L${tipX.toFixed(1)},${tipY.toFixed(1)} L${(tipX - ux * aL - pxp * aW).toFixed(1)},${(tipY - uy * aL - pyp * aW).toFixed(1)}`;
  const riseArc = `<path class="ix-risearc" d="M${ax.toFixed(1)},${(ay - 8).toFixed(1)} Q${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)}"/><path class="ix-risearc" d="${barb}"/>`;
  // 라벨: 상단 밴드 좌측(아치 왼쪽 개활지)에 2줄
  const labelX = Math.max(L + 130, Math.min(midx - 40, W * 0.42));
  const riseLabel = `<text class="ix-rise" text-anchor="middle">` +
    `<tspan class="sm" x="${labelX.toFixed(1)}" y="26">${monthsTxt} 만에</tspan>` +
    `<tspan class="big" x="${labelX.toFixed(1)}" y="60">▲ ${riseTxt}</tspan></text>`;

  // ── 고점→현재 하락 곡선 화살표(연한 파랑) ──
  const fx1 = bx, fy1 = by, fx2 = x(P.l.i), fy2 = y(P.l.c);
  const fcx = (fx1 + fx2) / 2 + 14, fcy = (fy1 + fy2) / 2 + 30; // 살짝 아래로 볼록
  const fux0 = fx2 - fcx, fuy0 = fy2 - fcy, fdl = Math.hypot(fux0, fuy0) || 1;
  const fux = fux0 / fdl, fuy = fuy0 / fdl, fpx = -fuy, fpy = fux;
  const ftipX = fx2 - fux * 4, ftipY = fy2 - fuy * 4;
  const fbarb = `M${(ftipX - fux * aL + fpx * aW).toFixed(1)},${(ftipY - fuy * aL + fpy * aW).toFixed(1)} L${ftipX.toFixed(1)},${ftipY.toFixed(1)} L${(ftipX - fux * aL - fpx * aW).toFixed(1)},${(ftipY - fuy * aL - fpy * aW).toFixed(1)}`;
  const guide = `<path class="ix-fallarc" d="M${fx1.toFixed(1)},${(fy1 + 10).toFixed(1)} Q${fcx.toFixed(1)},${fcy.toFixed(1)} ${ftipX.toFixed(1)},${ftipY.toFixed(1)}"/><path class="ix-fallarc" d="${fbarb}"/>`;

  // ── 축 ──
  const axis = `<line class="ix-axis" x1="${L}" y1="${H - B + 4}" x2="${W - R}" y2="${H - B + 4}"/>`;
  const tick = (i, iso, anchor) => `<text class="ix-tick" x="${x(i).toFixed(1)}" y="${H - 10}" text-anchor="${anchor}">${md(iso)}</text>`;
  const ticks = tick(si, startIso, "start") + tick(pi, peakIso, "middle") + tick(li, lastIso, "end");

  // 현재가 라벨은 헤더에 크게 표기하므로 차트에선 생략(중복·화살촉 겹침 방지). 고점은 마커 아래.
  const peakUp = -26;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">` +
    `<path class="ix-area" d="${area}"/>` +
    `<polyline class="ix-line" points="${pts.join(" ")}"/>` +
    guide + riseArc +
    marker("start", P.s.i, P.s.c) + marker("peak", P.p.i, P.p.c) + marker("last", P.l.i, P.l.c) +
    priceLabel("", P.s.i, P.s.c, "start", 20) +
    priceLabel("peak", P.p.i, P.p.c, "end", peakUp) +
    riseLabel +
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
  const months = monthsBetween(startIso, peakIso);
  blocks.push({
    name: ix.label,
    asOf: md(ix.asOf),
    now: fmt(ix.current),
    dd: `${dd > 0 ? "+" : ""}${dd}`,
    chartSvg: chartSvg(
      ix.series, startIso, peakIso, lastIso,
      `${risePct > 0 ? "+" : ""}${risePct}%`,
      `약 ${months}개월`,
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
