/**
 * 서울 아파트 주간 매매가격 누적 상승률 — 현재 국면 vs 역대 최장. streak-line@1.
 * 제목: "서울 아파트, 상승폭은 이미 文정부의 2배" ('文정부의 2배' 레드)
 * 부제: "최장 기간 연속 상승까지 단 8주 남았다" ('8주' 레드)
 *
 * ── 강조: 이번 상승기는 이전과 다르다
 * 현재(빨강)는 더 짧은 기간(77주)에 더 가파르게 올라 역대 최장기(85주)의 누적을 2배 넘게 앞선다.
 *
 * ── 데이터 (오보 0)
 * data/datasets/mae-streak-2026-08.json 하나만 읽는다. 끝점·기간·시작값은 첨부 부동산원 인포그래픽.
 * '주간 매매가격지수' 주별 시계열이 저장소에 없어(세션은 reb.or.kr 네트워크 차단·키는 Actions Secret)
 * 주별 굴곡은 그리지 않는다 — 직선은 시작→끝 평균 궤적, 끝점만 실측이다. verified=false.
 * 좌표는 아래에서 코드가 계산한다(템플릿은 숫자를 만들지 않는다).
 *
 * 실행: node scripts/build-mae-streak.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-01";
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/mae-streak-2026-08.json"), "utf8"));
const cur = d.current, rec = d.record;
const r1 = (v) => Math.round(v * 10) / 10;

/* ── 정합성 검사 ── */
if (!(cur.weeks < rec.weeks)) throw new Error(`현재 ${cur.weeks}주가 역대 최장 ${rec.weeks}주보다 짧아야 한다`);
if (cur.rankByWeeks !== 2) throw new Error(`rankByWeeks 는 2여야 한다`);
const gap = rec.weeks - cur.weeks;
if (gap <= 0) throw new Error(`gap 이 0 이하다(${gap})`);
if (!(cur.cumPct > rec.cumPct)) throw new Error(`현재 누적이 역대 최장기 누적보다 커야 한다`);
const ratio = r1(cur.cumPct / rec.cumPct);          // 상승폭(누적) 배수 → 제목 '2배'
if (ratio < 1.9) throw new Error(`누적 배수 ${ratio} 가 2배 미만이다 — 제목을 고친다`);

/* ── 좌표계 (뷰박스 1000×850) ── */
const RED = "#e5484d", SLATE = "#5b6b7f", INK = "#141821", MUTE = "#9aa3af";
const AXIS_X = 95, RIGHT = 968, TOP = 64, BASE = 782;
const WMAX = 90, YMAX = 17;
const xw = (w) => r1(AXIS_X + ((w - 1) / (WMAX - 1)) * (RIGHT - AXIS_X));  // 1주차 = 좌축
const yp = (p) => r1(BASE - (p / YMAX) * (BASE - TOP));

const curX = xw(cur.weeks), curY = yp(cur.cumPct);
const recX = xw(rec.weeks), recY = yp(rec.cumPct);
const x1 = AXIS_X, y0 = yp(0);

const grid = [5, 10, 15].map((p) => ({ x1: AXIS_X, x2: RIGHT, y: yp(p) }));
const ylabels = [0, 5, 10, 15].map((p) => ({ x: AXIS_X - 16, y: yp(p) + 9, text: `${p}` }));
const yunit = { x: AXIS_X - 16, y: TOP - 8, text: "(%)" };

const areas = [
  { points: `${x1},${y0} ${recX},${recY} ${recX},${y0}`, fill: SLATE, opacity: 0.06 },
  { points: `${x1},${y0} ${curX},${curY} ${curX},${y0}`, fill: RED, opacity: 0.09 },
];
const lines = [
  { x1, y1: y0, x2: recX, y2: recY, color: SLATE, width: 7 },
  { x1, y1: y0, x2: curX, y2: curY, color: RED, width: 8 },
];
const dots = [
  { x: recX, y: recY, color: SLATE, r: 13 },
  { x: curX, y: curY, color: RED, r: 14 },
];
const vmarks = [
  { x: recX, y1: recY, y2: y0, color: SLATE },
  { x: curX, y1: curY, y2: y0, color: RED },
];
const vlabels = [
  { x: curX, y: curY - 30, text: `+${cur.cumPct.toFixed(2)}%`, fill: RED, anchor: "middle" },
  { x: recX - 18, y: recY - 20, text: `+${rec.cumPct.toFixed(2)}%`, fill: SLATE, anchor: "end" },
];
const xlabels = [
  { x: AXIS_X, y: BASE + 52, text: "1주차", fill: MUTE },
  { x: curX, y: BASE + 52, text: `${cur.weeks}주`, fill: RED },
  { x: recX, y: BASE + 52, text: `${rec.weeks}주`, fill: SLATE },
];

/* 77주 → 85주 = gap주 화살표 (역대 최장까지 남은 거리) */
const ay = BASE - 26, midX = r1((curX + recX) / 2);
const arrow = {
  x1: curX, x2: recX, y: ay, color: RED,
  heads: [
    { points: `${curX},${ay} ${curX + 15},${ay - 7} ${curX + 15},${ay + 7}`, fill: RED },
    { points: `${recX},${ay} ${recX - 15},${ay - 7} ${recX - 15},${ay + 7}`, fill: RED },
  ],
  lx: midX, ly: ay - 16, text: `${gap}주`,
};

const legend = [
  { sx1: 120, sx2: 182, sy: 172, color: RED, tx: 200, ty: 164, text: cur.label, fill: INK, sub: cur.periodLabel, sty: 206 },
  { sx1: 120, sx2: 182, sy: 262, color: SLATE, tx: 200, ty: 254, text: rec.label, fill: INK, sub: rec.periodLabel, sty: 296 },
];

const card = {
  template: "streak-line@1",
  date,
  badge: date.replace(/-/g, ".").slice(2),
  title: `서울 아파트, 상승폭은 이미<br><span class="hi">文정부의 ${ratio.toFixed(0)}배</span>`,
  subtitle: `최장 기간 연속 상승까지 단 <span class="hi">${gap}주</span> 남았다`,
  chart: {
    vb: "0 0 1000 850",
    base: { y: y0, x1: AXIS_X, x2: RIGHT },
    grid, areas, ylabels, yunit, vmarks, lines, dots, vlabels, xlabels, arrow, legend,
  },
  source: { name: d.meta.source, asOf: d.meta.asOf },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "mae-streak.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`mae-streak (streak-line) — 현재 ${cur.weeks}주 +${cur.cumPct}% vs 역대 ${rec.weeks}주 +${rec.cumPct}% · 누적 ${ratio}배 · gap ${gap}주`);
console.log(`   ⚠ verified=${d.verified} — R-ONE 주간 매매지수 수집(Actions)·재현 대조 전 발행 금지`);
console.log(`   → data/content/${date}/mae-streak.json`);
