/**
 * 국장 성적표 어그로 커버 — 다크 + 코스피 급락 차트 배경 + 충격 숫자(고점→현재).
 * data/datasets/kr-market-<year>.json 사용. 수치·차트 전부 코드 생성(창작 금지).
 * 실행: node scripts/build-index-cover.mjs [year] [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const year = process.argv[2] || "2026";
const date = process.argv[3] || "2026-07-26";
const ds = JSON.parse(readFileSync(join(ROOT, `data/datasets/kr-market-${year}.json`), "utf8"));

const fmt = (v) => v.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 코스피 시계열 → 풀블리드 배경 차트(상승 후 급락 실루엣). 결정적. */
function bgSvg(series, peakIso) {
  const W = 1080, H = 1350;
  const closes = series.map((p) => p.c);
  const mn = Math.min(...closes), mx = Math.max(...closes);
  const span = mx - mn || 1;
  // 하단 45%~92% 영역에 크게 깔기
  const top = H * 0.42, bot = H * 0.94;
  const x = (i) => (i / (series.length - 1)) * W;
  const y = (c) => bot - ((c - mn) / span) * (bot - top);
  const pts = series.map((p, i) => `${x(i).toFixed(1)},${y(p.c).toFixed(1)}`);
  const pi = series.findIndex((p) => p.d === peakIso);
  const li = series.length - 1;
  const area = `M0,${bot}L${pts.join("L")}L${W},${bot}Z`;
  const fall = pi >= 0
    ? `<line class="icv-fall" x1="${x(pi).toFixed(1)}" y1="${y(series[pi].c).toFixed(1)}" x2="${x(li).toFixed(1)}" y2="${y(series[li].c).toFixed(1)}"/>`
    : "";
  const peakDot = pi >= 0 ? `<circle class="icv-peak" cx="${x(pi).toFixed(1)}" cy="${y(series[pi].c).toFixed(1)}" r="12"/>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">` +
    `<path class="icv-area" d="${area}"/><polyline class="icv-line" points="${pts.join(" ")}"/>${fall}${peakDot}</svg>`;
}

const kospi = ds.indices.kospi;
const kosdaq = ds.indices.kosdaq;
const drops = [kospi, kosdaq].map((ix) => ({
  name: ix.label,
  peak: fmt(ix.peak.close),
  now: fmt(ix.current),
  pct: `${ix.drawdownFromPeakPct}`,
}));

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "index-cover@1",
  date,
  caption: `${year} 코스피·코스닥`,
  hook: `사상 최고 찍고\n<span class="em">한 달 만에</span>`,
  drops,
  cta: "무슨 일이 있었나 👉 다음장에서",
  bgSvg: bgSvg(kospi.series, kospi.peak.date),
};
writeFileSync(join(outDir, `index-cover-${year}.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ index-cover ${year} — 코스피 ${drops[0].pct}% · 코스닥 ${drops[1].pct}%`);
