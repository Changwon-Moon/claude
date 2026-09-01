/**
 * 통화지표 개편으로 M2 에서 빠진 금액 — `streak-line@1`.
 * 제목: "통계에서 사라진 621조" / "M2 4,831조 → 4,210조" (오너 확정 2026-09-01)
 *
 * ── 무슨 일이 있었나
 * 한국은행이 2025-12-30 통화·유동성 통계를 개편해 **수익증권(펀드·ETF)을 M2 에서 제외**했다
 * (초대형 IB 발행어음·일부 CMA 는 새로 포함). 2026년 1월 공표분(2025년 11월 통계)부터 신 기준이
 * 적용되고, **신·구 두 계열을 2026년 12월까지 1년간 병행 공표**한다.
 *
 * ── 이 카드가 말하는 것 (오너 지시 2026-09-01: "담담하게 사실만")
 * 같은 달의 통화량이 자에 따라 두 값을 갖는다는 **사실**과, 그 차이가 10년 가까이 100~200조대에
 * 머물다 최근 급격히 벌어졌다는 **사실**. 판단하는 문장은 쓰지 않는다.
 *
 * ── 데이터: 원자료에서 코드가 계산한다 (오보 0)
 * `scripts/lib/m2.mjs` 가 구 M2(BBHA16 접합)와 신 M2 를 함께 내준다. 격차·좌표는 전부 계산값이다.
 *
 * ⚠️ **카드에 적히는 격차는 「표시값의 뺄셈」이다.** 4,831.48 − 4,209.87 = 621.61 을 반올림하면
 * 622 인데, 카드에 찍힌 두 수(4,831 · 4,210)의 차는 621 이다. 독자가 카드 위에서 직접 빼 보면
 * 맞아야 하므로 **표시값끼리 뺀 값**을 쓰고, 원값과 1.5조 넘게 어긋나면 던진다.
 *
 * 실행: node scripts/build-m2-gap.mjs [YYYY-MM-DD] [--publish]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadM2, yearTicks, ymLabel, jo, r1, shownJo, INK, RED, SLATE, MUTE } from "./lib/m2.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { M2, NEW, lastYm, worst } = loadM2();

const FROM = "201601";                    // 두 계열이 붙어 있던 시절부터 보여 준다
if (!(FROM in M2) || !(FROM in NEW)) throw new Error(`시작월 ${FROM} 이 두 계열에 다 없다`);
if (!(lastYm in NEW)) throw new Error(`신 M2 에 최신월 ${lastYm} 이 없다 — 병행 공표가 끝났는지 확인한다`);

const win = Object.keys(M2).filter((m) => m >= FROM && m <= lastYm && m in NEW).sort();
if (win.length < 24) throw new Error(`두 계열이 겹치는 달이 ${win.length}개뿐 — 창을 다시 잡는다`);

const oldLast = M2[lastYm], newLast = NEW[lastYm];
if (oldLast <= newLast) throw new Error("구 M2 가 신 M2 보다 크지 않다 — 개편 방향이 뒤집혔다");

/* 표시값끼리의 뺄셈(위 머리말 참고). 원값과 크게 어긋나면 표기 방식을 다시 정한다. */
const oldShown = Math.round(oldLast), newShown = Math.round(newLast);
const gapShown = oldShown - newShown;
const gapTrue = oldLast - newLast;
if (Math.abs(gapShown - gapTrue) > 1.5) throw new Error(`표시 격차(${gapShown})와 실제(${gapTrue.toFixed(1)})가 1.5조 넘게 다르다`);

/* 격차의 과거 — "요즘 벌어졌다"를 말이 아니라 계산으로 확인한다 */
const gaps = win.map((m) => M2[m] - NEW[m]);
const gapMin = Math.min(...gaps), gapMax = Math.max(...gaps);
if (gapMax !== gaps[gaps.length - 1]) throw new Error("최신월이 격차 최대가 아니다 — 카드 문장을 다시 짠다");

/* ── 좌표 (뷰박스 1000×780 — m2-trend 와 같은 자) ── */
/* 제목이 두 줄이라 m2-trend(780)보다 낮게 잡는다 — 안 그러면 마무리 문구가 푸터에 붙는다 */
const AXIS_X = 172, RIGHT = 915, TOP = 70, BASE = 640, VB_H = 700;
const YMAX = 5000;
if (oldLast > YMAX) throw new Error(`구 M2 ${r1(oldLast)}조 가 Y축 상한 ${YMAX}조를 넘었다 — 눈금을 올린다`);

const N = win.length;
const xi = (i) => r1(AXIS_X + (i / (N - 1)) * (RIGHT - AXIS_X));
const yv = (v) => r1(BASE - (v / YMAX) * (BASE - TOP));
const line = (pick) => win.map((m, i) => `${xi(i)},${yv(pick(m))}`);

const oldPts = line((m) => M2[m]);
const newPts = line((m) => NEW[m]);

const grid = [1000, 2000, 3000, 4000, 5000].map((v) => ({ x1: AXIS_X, x2: RIGHT, y: yv(v) }));
const ylabels = [0, 1000, 2000, 3000, 4000, 5000].map((v) => ({
  x: AXIS_X - 18, y: yv(v) + 11, text: v.toLocaleString("ko-KR"),
}));

/* 두 곡선 **사이**만 칠한다 — 그 면적이 곧 이 카드의 주제(빠진 금액)다.
   곡선 아래 전체를 칠하면 주제가 아니라 잔액 규모를 칠하는 것이 된다. */
const areas = [{
  points: `${oldPts.join(" ")} ${newPts.slice().reverse().join(" ")}`,
  fill: RED, opacity: 0.16,
}];
const polylines = [
  { points: newPts.join(" "), color: SLATE, width: 7 },
  { points: oldPts.join(" "), color: RED, width: 8 },
];

const yOld = yv(oldLast), yNew = yv(newLast);
const dots = [
  { x: xi(N - 1), y: yNew, color: SLATE, r: 15 },
  { x: xi(N - 1), y: yOld, color: RED, r: 16 },
];
/* 끝값은 **범례 안에 적는다.** 처음엔 곡선 끝 옆에 세웠는데, 두 곡선의 끝 간격이 80px 뿐이라
   아래쪽 라벨(4,210조)이 왼쪽으로 뻗어 **범례와 곡선을 덮었다**(첫 렌더 실측).
   자리를 옮겨 피하는 대신 **한 곳에서 한 번만** 말하게 했다 — 제목도 이미 두 값을 말한다.
   SVG 안 글자는 designQa 넘침 검사 밖이라, 겹칠 자리를 아예 만들지 않는 쪽이 맞다. */
const vlabels = [];

/* 격차 구간을 세로 점선으로 한 번 더 못박는다 */
const vmarks = [{ x: xi(N - 1), y1: yOld, y2: yNew, color: RED }];

/* X 눈금 — 3년 간격 + 마지막 달. 자리잡기는 lib/m2.mjs 의 yearTicks 한 곳이 한다. */
const lastText = ymLabel(lastYm).replace(/\.0/, ".");
const xlabels = [
  ...yearTicks({ months: win, x: xi, right: RIGHT, lastText, every: 3 })
    .map((t) => ({ x: xi(t.i), y: BASE + 46, text: t.text, fill: MUTE, anchor: t.anchor })),
  { x: RIGHT, y: BASE + 46, text: lastText, fill: RED, anchor: "end" },
];

/* 범례가 곧 끝값 표다 — 선 색·이름·최신값·정의를 한 덩어리로 읽게 한다.
   ⚠️ 설명줄은 짧게. "수익증권 제외 (신 M2)"로 길게 뒀더니 글자 끝이 회색 곡선에 닿았다
   (실측 폭 ~340px, 곡선이 그 높이를 지나는 x=671). 구·신 명칭은 캡션이 설명한다. */
const legend = [
  { sx1: 232, sx2: 310, sy: 142, color: RED, tx: 328, ty: 132, text: `개편 전  ${jo(oldLast)}조`, fill: INK, sub: "수익증권 포함", sty: 178 },
  { sx1: 232, sx2: 310, sy: 232, color: SLATE, tx: 328, ty: 222, text: `개편 후  ${jo(newLast)}조`, fill: INK, sub: "수익증권 제외", sty: 268 },
];
const wm = { x: 250, y: 470, size: 40, text: "@wirit_note", fill: INK, opacity: 0.14, anchor: "start" };

const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;

const card = {
  template: "streak-line@1",
  date,
  badge: `한국은행 통화·유동성 통계 개편 (2025.12.30) · 단위 조원`,
  title: `<span class="tl">통계에서 <span class="hi">사라진 ${gapShown}조</span></span>` +
         `<span class="tl">M2 ${jo(oldLast)}조 → ${jo(newLast)}조</span>`,
  chart: {
    vb: `0 0 1000 ${VB_H}`,
    wm,
    base: { y: yv(0), x1: AXIS_X, x2: RIGHT },
    grid, areas, ylabels, vmarks, polylines, dots, vlabels, xlabels, legend,
  },
  /* 무엇이 빠졌는지는 사실 그대로 한 줄. 판단하는 말은 넣지 않는다(오너 지시 2026-09-01). */
  note: `빠진 것은 <b>펀드·ETF 등 수익증권</b>`,
  source: { name: "한국은행 ECOS(M2 평잔·원계열, 신·구 병행)", asOf: ymLabel(lastYm) },
  meta: {
    verified: true,
    provenance: "ECOS 161Y006 BBHA16([참고] 구 M2) vs BBHA00(M2, 개편 후)",
    basis: "2025-12-30 한국은행 통화·유동성 통계 개편 — 수익증권(펀드·ETF) 제외, 초대형 IB 발행어음·일부 CMA 포함. 신·구 병행 공표는 2026년 12월까지",
    window: { from: FROM, to: lastYm, months: N },
    oldValue: r1(oldLast),
    newValue: r1(newLast),
    gapShown,
    gapTrue: r1(gapTrue),
    gapMin: r1(gapMin),
    gapMax: r1(gapMax),
    /* 캡션은 **이 정수만** 쓴다 — meta 의 소수값을 다시 반올림하면 카드와 1 씩 어긋난다 */
    shown: { old: oldShown, new: newShown, gap: gapShown, gapMin: shownJo(gapMin) },
    overlapCheckMaxDiff: r1(worst),
  },
};

const PUBLISH = process.argv.includes("--publish");
const outDir = PUBLISH ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "m2-gap.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`m2-gap — ${ymLabel(FROM)}~${ymLabel(lastYm)} (${N}개월)`);
console.log(`   구 ${r1(oldLast)}조 / 신 ${r1(newLast)}조 · 표시격차 ${gapShown}조(실제 ${r1(gapTrue)}조)`);
console.log(`   격차 범위 ${r1(gapMin)}~${r1(gapMax)}조 · 최대는 최신월`);
console.log(`   → ${join(outDir, "m2-gap.json")}`);
