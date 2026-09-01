/**
 * 대한민국 M2 통화량 40년 추이 — `streak-line@1`.
 * 제목: "대한민국 M2통화량 (1986~2026)" (오너 확정 문안 2026-09-01 — 수사 없이 추이 그대로)
 *
 * ── 데이터: 원자료에서 코드가 계산한다 (오보 0)
 * `scripts/lib/m2.mjs` 가 내주는 **개편 전 기준(구 M2)** 하나만 쓴다. 접합·대조 게이트는 그 안에 있다.
 * 곡선 좌표·배수·눈금은 전부 여기서 계산한다 — 손으로 적은 숫자 0개.
 *
 * ── 두 폴리라인은 장식이 아니라 **출처 구분**이다
 * 1986-01~2003-09 는 구지표 표(101Y004), 2003-10~ 는 ECOS `[참고] 구 M2`(BBHA16)에서 온다.
 * 겹치는 12개월의 값이 같아 이어 붙일 수 있지만, **이어 붙였다는 사실은 그림에도 남긴다**
 * (카드 각주로만 밝히면 그래픽만 잘라 쓸 때 사라진다 — year-bars 추정 구간에서 배운 규칙).
 * 접합점은 두 폴리라인이 **같은 점을 공유**하게 그려 끊긴 것처럼 보이지 않게 한다.
 *
 * 실행: node scripts/build-m2-trend.mjs [YYYY-MM-DD] [--publish]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadM2, yearTicks, ymLabel, jo, r1, shownJo, INK, RED, SLATE, MUTE } from "./lib/m2.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { M2, months, lastYm, worst, raw } = loadM2();

const firstYm = months[0];
const JOIN = "200309";                    // 구지표 표의 마지막 달(= 두 계열의 접합점)
if (!(JOIN in M2)) throw new Error(`접합점 ${JOIN} 값이 없다`);

const first = M2[firstYm], last = M2[lastYm];
const times = last / first;
const spanMonths = (+lastYm.slice(0, 4) * 12 + +lastYm.slice(4)) - (+firstYm.slice(0, 4) * 12 + +firstYm.slice(4));
const spanYears = Math.round(spanMonths / 12);

/* ── 좌표 (뷰박스 1000×715 — streak-line 규격) ──
   Y 눈금이 "5,000" 네 글자라 좌축을 넉넉히 띄운다. SVG 안 글자는 designQa 넘침 검사 밖이라
   **잘리지 않을 자리를 빌더가 책임진다**(CARD_CHECKLIST 「새 판형」). */
const AXIS_X = 172, RIGHT = 915, TOP = 70, BASE = 712, VB_H = 780;
const YMAX = 5000;                        // 최신값 4,831 을 덮는 가장 가까운 천 단위
if (last > YMAX) throw new Error(`최신 M2 ${r1(last)}조 가 Y축 상한 ${YMAX}조를 넘었다 — 눈금을 올린다`);

const idx = Object.fromEntries(months.map((m, i) => [m, i]));
const N = months.length;
const xm = (ym) => r1(AXIS_X + (idx[ym] / (N - 1)) * (RIGHT - AXIS_X));
const yv = (v) => r1(BASE - (v / YMAX) * (BASE - TOP));

const ptsOf = (from, to) => {
  const out = [];
  for (let i = idx[from]; i <= idx[to]; i++) out.push(`${xm(months[i])},${yv(M2[months[i]])}`);
  return out.join(" ");
};

const grid = [1000, 2000, 3000, 4000, 5000].map((v) => ({ x1: AXIS_X, x2: RIGHT, y: yv(v) }));
const ylabels = [0, 1000, 2000, 3000, 4000, 5000].map((v) => ({
  x: AXIS_X - 18, y: yv(v) + 11, text: v.toLocaleString("ko-KR"),
}));
/* 축 단위는 **상단 캡션에 한 번만** 적는다. 좌축 위에 "(조원)"을 얹었더니 최상단 눈금(5,000)과
   세로 23px 차이로 겹쳤다 — 눈금을 지우면 끝점 높이를 못 가늠하므로 단위 쪽을 옮겼다
   (CARD_CHECKLIST 「단위는 한 번만」). */

/* 면적 칠은 곡선 아래 한 벌만 — 두 구간을 다른 색으로 칠하면 "다른 지표"로 읽힌다.
   선은 출처를 가르고, 칠은 하나의 지표임을 말한다. */
const areas = [{
  points: `${ptsOf(firstYm, lastYm)} ${xm(lastYm)},${yv(0)} ${xm(firstYm)},${yv(0)}`,
  fill: RED, opacity: 0.08,
}];
const polylines = [
  { points: ptsOf(firstYm, JOIN), color: SLATE, width: 7 },
  { points: ptsOf(JOIN, lastYm), color: RED, width: 8 },
];

const dots = [{ x: xm(lastYm), y: yv(last), color: RED, r: 16 }];
const vlabels = [
  { x: RIGHT, y: yv(last) - 34, text: `${jo(last)}조`, fill: RED, anchor: "end" },
];

/* X 눈금 — 10년 간격 + 마지막 달. 자리잡기는 lib/m2.mjs 의 yearTicks 한 곳이 한다
   (겹치면 빌더가 뺀다 — SVG 안 글자는 designQa 검사 밖이라 그림에서만 드러난다). */
const lastText = ymLabel(lastYm).replace(/\.0/, ".");
const xlabels = [
  ...yearTicks({ months, x: (i) => xm(months[i]), right: RIGHT, lastText, every: 10 })
    .map((t) => ({ x: xm(months[t.i]), y: BASE + 46, text: t.text, fill: MUTE, anchor: t.anchor })),
  { x: RIGHT, y: BASE + 46, text: lastText, fill: RED, anchor: "end" },
];

const legend = [
  { sx1: 232, sx2: 310, sy: 142, color: SLATE, tx: 328, ty: 132, text: "1986~2003", fill: INK, sub: "한국은행 구지표 통계표", sty: 178 },
  { sx1: 232, sx2: 310, sy: 232, color: RED, tx: 328, ty: 222, text: "2003~2026", fill: INK, sub: "ECOS [참고] 구 M2", sty: 268 },
];
/* 워터마크는 곡선이 아직 바닥에 붙어 있는 좌하단 빈 칸에 — 데이터 위에 얹지 않는다(base.css 규칙). */
const wm = { x: 250, y: 486, size: 40, text: "@wirit_note", fill: INK, opacity: 0.14, anchor: "start" };

const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;

const card = {
  template: "streak-line@1",
  date,
  /* 상단 캡션 = 이 카드의 **기준**. 이 소재군은 "어느 M2 냐"가 숫자의 뜻을 통째로 바꾼다. */
  badge: `M2(광의통화) 개편 전 기준 · 평잔·원계열 · 단위 조원`,
  title: `<span class="tl">대한민국 M2통화량 (1986~2026)</span>`,
  chart: {
    vb: `0 0 1000 ${VB_H}`,
    wm,
    base: { y: yv(0), x1: AXIS_X, x2: RIGHT },
    grid, areas, ylabels, polylines, dots, vlabels, xlabels, legend,
  },
  /* 배수는 계산값이다. "40년"은 실제 구간(485개월)을 연 단위로 반올림한 것 — 캡션에 정확한 구간을 적는다. */
  note: `${spanYears}년 새 <b>${Math.round(times)}배</b>`,
  source: { name: "한국은행 ECOS(M2 평잔·원계열, 개편 전 기준)", asOf: ymLabel(lastYm) },
  meta: {
    verified: true,
    provenance: `${raw.legacyM2.itemCode ?? "BBHA16"}([참고] 구 M2) + 101Y004(구지표) 접합`,
    basis: "개편 전 기준(구 M2). 2025-12-30 한국은행 통화·유동성 통계 개편으로 수익증권이 M2 에서 제외됐다",
    range: { from: firstYm, to: lastYm, months: spanMonths + 1 },
    firstValue: r1(first),
    lastValue: r1(last),
    /* 캡션 전용 표시정수 — 카드와 같은 값에서 한 번만 반올림한다(이중 반올림 방지) */
    shown: { first: shownJo(first), last: shownJo(last), times: Math.round(times) },
    times: r1(times),
    /* 10년 단위 마디 — 캡션이 "증가율은 낮아졌는데 금액은 커졌다"를 말할 근거다.
       연말(12월)끼리 비교해 기준이 섞이지 않게 한다. */
    decades: (() => {
      const out = [];
      for (let y = 1986; y + 10 <= +lastYm.slice(0, 4); y += 10) {
        const a = `${y}12`, b = `${y + 10}12`;
        if (a in M2 && b in M2) out.push({ from: y, to: y + 10, fromV: shownJo(M2[a]), toV: shownJo(M2[b]), times: r1(M2[b] / M2[a]), add: shownJo(M2[b] - M2[a]) });
      }
      /* 마지막 마디는 아직 10년이 안 찼다 — 개월수를 함께 적어 캡션이 정직하게 쓰게 한다 */
      const la = `${out.length ? out[out.length - 1].to : 1986}12`;
      if (la in M2) out.push({ from: +la.slice(0, 4), to: +lastYm.slice(0, 4), fromV: shownJo(M2[la]), toV: shownJo(last), times: r1(last / M2[la]), add: shownJo(last - M2[la]), partialTo: lastYm });
      return out;
    })(),
    /* 최근 한 해(연말 기준) 증가액 — "옛날 10년치 ≈ 요즘 1년치"의 상대편 숫자 */
    lastFullYearAdd: (() => {
      const y = +lastYm.slice(0, 4) - 1;
      return `${y}12` in M2 && `${y - 1}12` in M2 ? { year: y, add: shownJo(M2[`${y}12`] - M2[`${y - 1}12`]) } : null;
    })(),
    joinAt: JOIN,
    overlapCheckMaxDiff: r1(worst),
  },
};

const PUBLISH = process.argv.includes("--publish");
const outDir = PUBLISH ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "m2-trend.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`m2-trend — 개편 전 기준(구 M2) · ${ymLabel(firstYm)}~${ymLabel(lastYm)} · ${months.length}개월`);
console.log(`   ${r1(first)}조 → ${r1(last)}조 = ${r1(times)}배 (${spanYears}년) · 접합 ${JOIN} · 겹침대조 최대차 ${worst.toFixed(2)}조`);
console.log(`   → ${join(outDir, "m2-trend.json")}`);
