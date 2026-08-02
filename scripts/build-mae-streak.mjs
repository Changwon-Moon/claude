/**
 * 서울 아파트 주간 매매가격 '연속 상승' — 누적 상승률 궤적 비교. streak-line@1 (꺾은선/직선).
 * 제목: "서울 아파트 77주 연속 상승" ('77주 연속 상승'만 레드)
 *
 * ── 무엇을 말하는 카드인가
 * 두 국면의 '누적 상승률 궤적'을 직선으로 겹쳐 그린다.
 *   · 현재(빨강): 77주 만에 +15.55% — 더 짧은데 더 가파르고 더 높이 닿는다
 *   · 역대 최장(회색): 85주 동안 +7.71%
 * 기울기(=평균 주간 상승률)와 끝 높이(=누적)로 "짧은데 더 올랐다"를 한 번에 보여준다.
 *
 * ── 왜 직선인가 (오보 0)
 * '주간 매매가격지수'의 주별 시계열 원자료가 저장소에 아직 없다. 주별 등락을 지어내지 않고,
 * 확정된 '평균 주간 상승률(=기울기)'과 '누적 상승률(=끝점)'만으로 정직하게 긋는다.
 * 그래서 캡션에 '직선 = 평균 상승 속도'를 밝힌다. 좌표는 아래에서 코드가 계산한다.
 * ⚠️ 데이터셋 verified=false — R-ONE 주간 매매지수 수집·재계산 대조 전에는 발행하지 않는다.
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
if (cur.rankByWeeks !== 2) throw new Error(`rankByWeeks 는 2여야 한다 — 지금 ${cur.rankByWeeks}`);
const gap = rec.weeks - cur.weeks;
if (gap <= 0) throw new Error(`gap 이 0 이하다(${gap})`);
if (!(cur.cumPct > rec.cumPct)) throw new Error(`현재 누적이 역대 최장기 누적보다 커야 한다`);
const speed = r1(cur.avgWeeklyPct / rec.avgWeeklyPct);

/* ── 좌표계 (뷰박스 1000×590) ── */
const RED = "#e5484d", SLATE = "#5b6b7f", INK = "#141821", MUTE = "#9aa3af";
const AXIS_X = 70, RIGHT = 980, TOP = 60, BASE = 520;
const XMAX = 90, YMAX = 17;                                  // 주 0~90 · % 0~17 (여백 포함)
const xw = (w) => r1(AXIS_X + (w / XMAX) * (RIGHT - AXIS_X));
const yp = (p) => r1(BASE - (p / YMAX) * (BASE - TOP));

const curX = xw(cur.weeks), curY = yp(cur.cumPct);
const recX = xw(rec.weeks), recY = yp(rec.cumPct);

const grid = [5, 10, 15].map((p) => ({ x1: AXIS_X, x2: RIGHT, y: yp(p) }));
const ylabels = [0, 5, 10, 15].map((p) => ({ x: AXIS_X - 12, y: yp(p) + 7, text: `${p}%` }));

const areas = [
  { points: `${AXIS_X},${BASE} ${recX},${recY} ${recX},${BASE}`, fill: SLATE, opacity: 0.06 },
  { points: `${AXIS_X},${BASE} ${curX},${curY} ${curX},${BASE}`, fill: RED, opacity: 0.08 },
];
const lines = [
  { x1: AXIS_X, y1: BASE, x2: recX, y2: recY, color: SLATE, width: 6 },
  { x1: AXIS_X, y1: BASE, x2: curX, y2: curY, color: RED, width: 7 },
];
const dots = [
  { x: recX, y: recY, color: SLATE, r: 10 },
  { x: curX, y: curY, color: RED, r: 11 },
];
const vmarks = [
  { x: recX, y1: recY, y2: BASE, color: SLATE },
  { x: curX, y1: curY, y2: BASE, color: RED },
];
const vlabels = [
  { x: curX, y: curY - 22, text: `+${cur.cumPct}%`, fill: RED, anchor: "middle" },
  { x: recX - 16, y: recY - 16, text: `+${rec.cumPct}%`, fill: SLATE, anchor: "end" },
];
const xlabels = [
  { x: AXIS_X, y: BASE + 42, text: "0", fill: MUTE },
  { x: curX, y: BASE + 42, text: `${cur.weeks}주`, fill: RED },
  { x: recX, y: BASE + 42, text: `${rec.weeks}주`, fill: SLATE },
];
const legend = [
  { sx1: 104, sx2: 148, sy: 100, color: RED, tx: 160, ty: 109, text: "현재 상승기", fill: INK },
  { sx1: 104, sx2: 148, sy: 142, color: SLATE, tx: 160, ty: 151, text: "역대 최장 (2020~22)", fill: INK },
];

const card = {
  template: "streak-line@1",
  date,
  badge: date.replace(/-/g, ".").slice(2),
  title: `서울 아파트 <span class="hi">${cur.weeks}주 연속 상승</span>`,
  chart: {
    vb: "0 0 1000 590",
    base: { y: BASE, x1: AXIS_X, x2: RIGHT },
    grid, areas, ylabels, vmarks, lines, dots, vlabels, xlabels, legend,
    caption: { x: RIGHT, y: 44, text: "직선 = 평균 상승 속도" },
  },
  note: `누적 상승률 궤적 — 현재는 <b>${gap}주</b> 짧은데(역대 ${cur.rankByWeeks}위), 오름폭은 이미 <b>${speed.toFixed(1)}배</b>.`,
  source: { name: d.meta.source, asOf: d.meta.asOf },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "mae-streak.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`mae-streak (streak-line) — 직선 ${lines.length}개`);
console.log(`   현재 (${cur.weeks}주, +${cur.cumPct}%) 기울기>${''} 역대 (${rec.weeks}주, +${rec.cumPct}%) · gap ${gap} · 속도 ${speed.toFixed(1)}배`);
console.log(`   ⚠ 데이터셋 verified=${d.verified} — R-ONE 주간 매매지수 대조 전 발행 금지`);
console.log(`   → data/content/${date}/mae-streak.json`);
