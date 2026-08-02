/**
 * 서울 아파트 주간 매매가격 누적 상승률 — 현재 국면 vs 역대 최장. streak-line@1.
 * 제목: "서울 아파트, 상승폭은 이미 文정부의 2배" ('文정부의 2배' 레드)
 * 부제: "최장 기간 연속 상승까지 단 N주 남았다" ('N주' 레드)
 *
 * ── 데이터: 원자료에서 코드가 계산한다 (오보 0)
 * data/datasets/reb-weekly-index.json (한국부동산원 R-ONE 주간 매매가격지수, Actions 수집)만 읽는다.
 * 서울 지수 계열에서 **전주比 상승이 이어진 구간(연속 상승 run)** 을 코드가 찾아
 *   · 현재 국면 = 마지막 주까지 이어진 run
 *   · 역대 최장 = 그 외 가장 긴 run
 * 을 고르고, 각 run 의 **주별 누적 상승률**(=지수/시작주지수−1) 곡선을 그린다.
 * 주수·누적률·남은 주(gap)·배수는 전부 여기서 계산한다 — 손으로 적은 숫자 0개.
 *
 * 실행: node scripts/build-mae-streak.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-01";
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const sc = d.meta.seoulCode;
const series = d.mae?.[sc];
if (!series) throw new Error(`서울(${sc}) 매매 주간 계열이 없다 — reb-weekly-index.json 확인`);

const ks = Object.keys(series).sort();          // YYYYWW 정렬
const vals = ks.map((k) => series[k]);
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;

/* ── 연속 상승 run 계산: 전주比 상승이 이어진 구간. base=첫 상승 직전(저점) ── */
const runs = [];
for (let i = 1; i < ks.length; ) {
  if (vals[i] > vals[i - 1]) {
    const base = i - 1; let j = i;
    while (j < ks.length && vals[j] > vals[j - 1]) j++;
    runs.push({ base, end: j - 1, weeks: (j - 1) - base });
    i = j + 1;
  } else i++;
}
const last = ks.length - 1;
const current = runs.find((r) => r.end === last);
if (!current) throw new Error("마지막 주까지 이어진 상승 구간이 없다 — 현재는 상승 국면이 아니다");
const record = runs.filter((r) => r !== current).sort((a, b) => b.weeks - a.weeks)[0];
if (!record) throw new Error("역대 최장 구간을 못 찾았다");

const cumAt = (r, k) => (vals[r.base + k] / vals[r.base] - 1) * 100;   // k=1..weeks
const curCum = r2(cumAt(current, current.weeks));
const recCum = r2(cumAt(record, record.weeks));
const gap = record.weeks - current.weeks;
const ratio = r1(curCum / recCum);
if (gap <= 0) throw new Error(`현재(${current.weeks})가 역대 최장(${record.weeks})을 이미 넘었다 — 제목을 바꾼다`);
if (ratio < 1.9) throw new Error(`누적 배수 ${ratio} 가 2배 미만 — 제목을 고친다`);

/* ── 좌표 (뷰박스 1000×715 — 그래프 높이 살짝 축소) ── */
const RED = "#e5484d", SLATE = "#5b6b7f", INK = "#141821", MUTE = "#9aa3af";
const AXIS_X = 95, RIGHT = 915, TOP = 70, BASE = 650, VB_H = 715;
const WMAX = Math.max(current.weeks, record.weeks), YMAX = 17;
const xw = (w) => r1(AXIS_X + ((w - 1) / (WMAX - 1)) * (RIGHT - AXIS_X));   // 1주차 = 좌축
const yp = (p) => r1(BASE - (p / YMAX) * (BASE - TOP));
const y0 = yp(0);

const curvePts = (r) => {
  const pts = [];
  for (let k = 1; k <= r.weeks; k++) pts.push(`${xw(k)},${yp(cumAt(r, k))}`);
  return pts;
};
const curCurve = curvePts(current), recCurve = curvePts(record);

const grid = [5, 10, 15].map((p) => ({ x1: AXIS_X, x2: RIGHT, y: yp(p) }));
const ylabels = [0, 5, 10, 15].map((p) => ({ x: AXIS_X - 16, y: yp(p) + 9, text: `${p}` }));
const yunit = { x: AXIS_X - 16, y: TOP - 8, text: "(%)" };

const areas = [
  { points: `${recCurve.join(" ")} ${xw(record.weeks)},${y0} ${xw(1)},${y0}`, fill: SLATE, opacity: 0.06 },
  { points: `${curCurve.join(" ")} ${xw(current.weeks)},${y0} ${xw(1)},${y0}`, fill: RED, opacity: 0.09 },
];
const polylines = [
  { points: recCurve.join(" "), color: SLATE, width: 7 },
  { points: curCurve.join(" "), color: RED, width: 8 },
];
const cx = xw(current.weeks), cy = yp(curCum), rx = xw(record.weeks), ry = yp(recCum);
const dots = [
  { x: rx, y: ry, color: SLATE, r: 15 },
  { x: cx, y: cy, color: RED, r: 16 },
];
const vmarks = [
  { x: rx, y1: ry, y2: y0, color: SLATE },
  { x: cx, y1: cy, y2: y0, color: RED },
];
const vlabels = [
  { x: cx, y: cy - 36, text: `+${curCum.toFixed(2)}%`, fill: RED, anchor: "middle" },
  { x: rx - 16, y: ry - 26, text: `+${recCum.toFixed(2)}%`, fill: SLATE, anchor: "end" },
];
const xlabels = [
  { x: AXIS_X, y: BASE + 46, text: "1주차", fill: MUTE, anchor: "middle" },
  { x: cx, y: BASE + 46, text: `${current.weeks}주`, fill: RED, anchor: "end" },
  { x: rx, y: BASE + 46, text: `${record.weeks}주`, fill: SLATE, anchor: "start" },
];
const ay = BASE - 26, midX = r1((cx + rx) / 2);
const arrow = {
  x1: cx, x2: rx, y: ay, color: RED,
  heads: [
    { points: `${cx},${ay} ${cx + 15},${ay - 7} ${cx + 15},${ay + 7}`, fill: RED },
    { points: `${rx},${ay} ${rx - 15},${ay - 7} ${rx - 15},${ay + 7}`, fill: RED },
  ],
  lx: midX, ly: ay - 16, text: `${gap}주`,
};
const legend = [
  { sx1: 118, sx2: 196, sy: 178, color: RED, tx: 214, ty: 168, text: "현재 상승기", fill: INK, sub: "2025.2 첫째주 ~ 진행 중", sty: 214 },
  { sx1: 118, sx2: 196, sy: 292, color: SLATE, tx: 214, ty: 282, text: "역대 최장 (文정부)", fill: INK, sub: "2020.6 둘째주 ~ 2022.1 셋째주", sty: 328 },
];
/* 그래프 뒤 옅은 '서울' 배경 워드마크 (공식 로고 파일이 없어 워드마크로 — 자산 있으면 교체) */
const bg = { x: 590, y: 540, size: 270, text: "서울", fill: INK, opacity: 0.05 };
/* 범례 아래 빈 공간(좌하 삼각)에 위릿 워드마크 워터마크 */
const wm = { x: 150, y: 452, size: 66, text: "위릿.", fill: "#2e6bff", opacity: 0.18, anchor: "start" };

const card = {
  template: "streak-line@1",
  date,
  badge: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
  title: `<span class="tl">서울 아파트 <span class="hi">${current.weeks}주 연속</span> 상승</span>` +
         `<span class="tl">상승폭은 이미 文정부의 <span class="hi">${ratio.toFixed(0)}배</span></span>`,
  chart: { vb: `0 0 1000 ${VB_H}`, bg, wm, base: { y: y0, x1: AXIS_X, x2: RIGHT }, grid, areas, ylabels, yunit, vmarks, polylines, dots, vlabels, xlabels, arrow, legend },
  note: `역사상 최장 기간 연속 상승까지,<br>단 <b>${gap}주</b>`,
  source: { name: "한국부동산원 주간 아파트가격동향" },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "mae-streak.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`mae-streak (streak-line, 실곡선) — 원자료 계산`);
console.log(`   현재 ${current.weeks}주(${ks[current.base]}~${ks[current.end]}) 누적 +${curCum}%`);
console.log(`   역대 최장 ${record.weeks}주(${ks[record.base]}~${ks[record.end]}) 누적 +${recCum}%`);
console.log(`   남은 ${gap}주 · 배수 ${ratio}배 · 곡선점 현재 ${curCurve.length}·역대 ${recCurve.length}`);
