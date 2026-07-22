/**
 * 코스피·코스닥 연중 궤적 + 고점대비 하락률 카드 빌더.
 * data/datasets/kr-market-<year>.json(수집기 산출·1차 캐시) → index-2026 콘텐츠 JSON.
 * 모든 수치는 데이터셋 값 그대로(창작 금지). 차트 SVG도 여기서 결정적으로 생성.
 * 실행: node scripts/build-index-2026.mjs [year] [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const year = process.argv[2] || "2026";
const date = process.argv[3] || "2026-07-22";

const ds = JSON.parse(readFileSync(join(ROOT, `data/datasets/kr-market-${year}.json`), "utf8"));

const fmt = (v) => v.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const md = (iso) => `${+iso.slice(5, 7)}.${+iso.slice(8, 10)}`;

/** 시계열 → 스파크라인 SVG (고점 마커·현재점 포함, 결정적) */
function sparkSvg(series, peakDate) {
  const W = 900, H = 210, PAD = 10, LABEL_H = 34;
  const closes = series.map((p) => p.c);
  const mn = Math.min(...closes), mx = Math.max(...closes);
  const span = mx - mn || 1;
  const x = (i) => PAD + (i / (series.length - 1)) * (W - PAD * 2);
  const y = (c) => LABEL_H + PAD + (1 - (c - mn) / span) * (H - LABEL_H - PAD * 2);
  const pts = series.map((p, i) => `${x(i).toFixed(1)},${y(p.c).toFixed(1)}`);
  const peakIdx = series.findIndex((p) => p.d === peakDate);
  const lastIdx = series.length - 1;
  const area = `M${pts[0]}L${pts.join("L")}L${x(lastIdx).toFixed(1)},${H - PAD}L${x(0).toFixed(1)},${H - PAD}Z`;

  let marks = "";
  if (peakIdx >= 0) {
    const px = x(peakIdx), py = y(series[peakIdx].c);
    const anchor = px > W * 0.8 ? "end" : px < W * 0.2 ? "start" : "middle";
    marks += `<circle class="ix-peak-dot" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9"/>`;
    marks += `<text class="ix-peak-lab" x="${px.toFixed(1)}" y="${(py - 14).toFixed(1)}" text-anchor="${anchor}">고점 ${md(peakDate)}</text>`;
  }
  marks += `<circle class="ix-last-dot" cx="${x(lastIdx).toFixed(1)}" cy="${y(series[lastIdx].c).toFixed(1)}" r="8"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">` +
    `<path class="ix-area" d="${area}"/><polyline class="ix-line" points="${pts.join(" ")}"/>${marks}</svg>`;
}

const blocks = [];
let asOf = "";
for (const key of ["kospi", "kosdaq"]) {
  const ix = ds.indices[key];
  if (!ix) continue;
  asOf = ix.asOf;
  const dd = ix.drawdownFromPeakPct;
  blocks.push({
    name: ix.label,
    now: fmt(ix.current),
    ytdLabel: `연초 대비 ${ix.ytdPct > 0 ? "+" : ""}${ix.ytdPct}%`,
    ytdCls: ix.ytdPct >= 0 ? "up" : "down",
    peak: fmt(ix.peak.close),
    peakDate: md(ix.peak.date),
    dd: `${dd > 0 ? "+" : ""}${dd}`,
    ddCls: Math.abs(dd) < 0.005 ? "flat" : "",
    chartSvg: sparkSvg(ix.series, ix.peak.date),
  });
}
if (!blocks.length) throw new Error("데이터셋에 지수 블록 없음");

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "index-2026@1",
  date,
  year,
  title: "국내 증시, 지금 어디쯤?",
  subtitle: `코스피·코스닥 ${year}년 궤적 · 연중 고점 대비 현재`,
  blocks,
  source: { name: ds.meta?.source || "국내 증시 일간 종가", asOf },
};
writeFileSync(join(outDir, `index-${year}.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ index-${year} — ${blocks.map((b) => `${b.name} ${b.now} (고점대비 ${b.dd}%)`).join(" · ")} · ${asOf} 기준`);
