/**
 * 2030 대한민국 M2 통화량은? — `streak-line@1`.
 * 제목: "2030 대한민국 M2통화량은?" (오너 확정 2026-09-01)
 *
 * ── 왜 2003-10 부터인가 (오너 지시 2026-09-01)
 * ECOS 의 개편 전 계열 **`BBHA16` [참고] 구 M2 가 2003-10 부터**다. 그 앞(1986~)은 구지표
 * 통계표를 이어 붙여야 하는데, 이 카드는 **앞으로를 말하는 카드**라 뒤를 길게 늘이는 대신
 * **한 계열만** 쓴다. 접합이 없으니 "어디까지가 무슨 표인가"를 설명할 필요도 없다.
 * (이 자리에 있던 「1986~2026 40년 추이」 카드를 오너 지시로 교체했다.)
 *
 * ── 2030 시나리오 — **원자료에 없는 숫자다**
 * CARD_CHECKLIST 「추정치」가 요구하는 네 겹을 다 건다:
 *   ① **점선** — 실측은 실선, 예측은 점선(판형에 옵셔널 `dash` 를 열어 두었다)
 *   ② **'예측' 꼬리표** — 범례가 실측/예측을 이름으로 가른다
 *   ③ **경계 세로선** — 마지막 실측월에 점선을 세워 여기서부터 예측임을 못박는다
 *   ④ **캡션에 산술 가정** — 두 연평균 증가율이 어느 구간에서 나온 값인지 그대로 적는다
 *
 * ⚠️ 두 시나리오는 **우리가 고른 숫자가 아니라 과거가 실제로 그랬던 속도**다.
 *    ① 역사적 평균  : 2003.10 ~ 2025.06 연평균 증가율
 *    ② 최근 1년 속도 : 최신월의 전년동월비(1년 그대로)
 *    자의적인 낙관·비관을 세우지 않는 것이 이 카드가 방어되는 유일한 근거다.
 *
 * ⚠️ ②의 이름과 숫자는 **짝이다**(오너 확정 2026-09-01). 처음엔 "현 정부 속도"라 부르며
 *    12.3% 를 쓰려 했는데 그건 최신월 전년동월비지 정부 구간(2025.04~) 연평균(11.8%)이 아니다.
 *    이름을 「최근 1년 속도」로 맞춰 12.3% 가 정확한 값이 됐다. **이름을 바꾸면 숫자도 바꾼다.**
 *
 * ── 색 (오너 지시 2026-09-01)
 *    실측 = 회색 / 역사적 평균 아래 = 코발트 / 그 위 최근1년까지 = 레드.
 *    과거는 무채색으로 두고 **미래만 두 색으로 갈린다** — 이 카드가 말하는 것이 앞날이라서다.
 *    BRAND 의 「코발트 1개 축」에 대한 예외이고, market-daily(상승 레드·하락 코발트)와 같은 결이다.
 *
 * 실행: node scripts/build-m2-trend.mjs [YYYY-MM-DD] [--publish]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadM2, yearTicks, yoy, ymLabel, jo, r1, shownJo, INK, RED, SLATE, MUTE } from "./lib/m2.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { OLD, lastYm, raw } = loadM2();
const COBALT = "#2e6bff";

/* 접합하지 않는다 — 개편 전 계열(BBHA16) 하나만 쓴다 */
const hist = Object.keys(OLD).sort().filter((m) => m <= lastYm);
const firstYm = hist[0];
if (firstYm.slice(0, 4) !== "2003") throw new Error(`구 M2 계열이 ${firstYm} 부터다 — 카드 문구(2003)를 다시 본다`);
const cur = OLD[lastYm];

const TO_YM = "203012";                                   // 예측 끝
const mIdx = (m) => +m.slice(0, 4) * 12 + +m.slice(4);
const yrsBetween = (a, b) => (mIdx(b) - mIdx(a)) / 12;

/** 두 달 사이 연평균 증가율(%) */
const cagr = (a, b) => {
  if (!(a in OLD) || !(b in OLD)) throw new Error(`CAGR 구간(${a}~${b})에 값이 없다`);
  return (Math.pow(OLD[b] / OLD[a], 1 / yrsBetween(a, b)) - 1) * 100;
};

/* ── 시나리오 둘 (오너 확정 2026-09-01) ── */
const yearAgo = `${+lastYm.slice(0, 4) - 1}${lastYm.slice(4)}`;
const SCEN = [
  { key: "hist", name: "역사적 평균", from: firstYm, to: "202506", color: COBALT },
  { key: "now", name: "최근 1년 속도", from: yearAgo, to: lastYm, color: RED },
].map((s) => {
  const rate = cagr(s.from, s.to);
  return { ...s, rate, value: cur * Math.pow(1 + rate / 100, yrsBetween(lastYm, TO_YM)) };
});
if (SCEN[1].rate <= SCEN[0].rate) throw new Error("최근 1년 속도가 역사적 평균보다 낮다 — 위/아래 배치와 색을 다시 짠다");
/* 「최근 1년 속도」는 정의상 전년동월비와 같아야 한다 — 이름과 숫자가 갈라지지 않게 대조한다 */
if (Math.abs(SCEN[1].rate - yoy(OLD, lastYm)) > 0.05) throw new Error("최근 1년 CAGR 이 전년동월비와 다르다 — 구간을 다시 본다");

const lo = SCEN[0], hi = SCEN[1];

/* ── 좌표 ── */
/* RIGHT 를 915 → 820 으로 당겼다. 끝값 두 개를 곡선 **오른쪽**에 세우기 위한 자리다 —
   처음엔 오른쪽 끝에 anchor=end 로 뒀더니 라벨이 왼쪽으로 자라며 회색 예측 곡선을 덮었다
   (SVG 안 글자는 designQa 검사 밖이라 그림에서만 드러난다).
   폭은 실측으로 정했다 — "7,988조"(6자·54px)가 194px 이라 820 에서는 카드를 넘쳤고,
   가드가 그것을 잡아 780 까지 당겼다. 값이 자릿수를 더 먹으면 가드가 다시 잡는다. */
/* 좌축 눈금을 없앴으므로(오너 지시) 왼쪽 여백이 필요 없다 — 곡선을 그만큼 크게 쓴다. */
const AXIS_X = 24, RIGHT = 780, LBL_X = 792, TOP = 60, BASE = 742, VB_H = 800;
const YMAX = 9000;   // 상단 시나리오(약 8,000조) 위에 끝값 라벨 한 줄이 앉을 여유까지 잡은 값
if (hi.value > YMAX) throw new Error(`상단 시나리오 ${r1(hi.value)}조 가 Y축 상한 ${YMAX}조를 넘었다 — 눈금을 올린다`);

/* x 는 전체 구간(실측 + 예측)을 하나의 자로 잡는다 */
const allMonths = [];
for (let i = mIdx(firstYm); i <= mIdx(TO_YM); i++) {
  allMonths.push(`${Math.floor((i - 1) / 12)}${String(((i - 1) % 12) + 1).padStart(2, "0")}`);
}
const N = allMonths.length;
const pos = Object.fromEntries(allMonths.map((m, i) => [m, i]));
const xm = (m) => r1(AXIS_X + (pos[m] / (N - 1)) * (RIGHT - AXIS_X));
const yv = (v) => r1(BASE - (v / YMAX) * (BASE - TOP));

const histPts = hist.map((m) => `${xm(m)},${yv(OLD[m])}`);
/** 최신월에서 출발해 매달 복리로 늘어나는 곡선 */
const projPts = (rate) => {
  const out = [];
  const mo = Math.pow(1 + rate / 100, 1 / 12);
  for (let i = mIdx(lastYm); i <= mIdx(TO_YM); i++) {
    const m = allMonths[i - mIdx(firstYm)];
    out.push(`${xm(m)},${yv(cur * Math.pow(mo, i - mIdx(lastYm)))}`);
  }
  return out;
};
const loPts = projPts(lo.rate), hiPts = projPts(hi.rate);

/* 좌축 **값은 그리지 않는다**(오너 지시 2026-09-01). 수준은 뱃지와 끝값 라벨이 말한다.
   격자선은 남긴다 — 눈금 없이도 높이를 견주는 바탕은 있어야 한다. */
const grid = [3000, 6000, 9000].map((v) => ({ x1: AXIS_X, x2: RIGHT, y: yv(v) }));
const ylabels = [];

/* ── 칠하기 (오너 지시 2026-09-01) ──
   ① 역사적 평균 곡선 **아래** = 코발트  ② 그 위 최근1년까지 = 레드
   실측 아래는 칠하지 않는다 — 과거를 무채색으로 두어야 "색이 갈리는 곳 = 미래"가 된다. */
const x0 = xm(lastYm), x1 = RIGHT, yBase = yv(0);
const areas = [
  { points: `${loPts.join(" ")} ${x1},${yBase} ${x0},${yBase}`, fill: COBALT, opacity: 0.14 },
  { points: `${hiPts.join(" ")} ${loPts.slice().reverse().join(" ")}`, fill: RED, opacity: 0.16 },
];
const polylines = [
  { points: loPts.join(" "), color: COBALT, width: 7, dash: "18 14" },
  { points: hiPts.join(" "), color: RED, width: 7, dash: "18 14" },
  { points: histPts.join(" "), color: SLATE, width: 8 },   // 실측 = 회색 실선, 맨 위 레이어
];

const dots = [
  { x: xm(lastYm), y: yv(cur), color: SLATE, r: 15 },
  { x: RIGHT, y: yv(lo.value), color: COBALT, r: 14 },
  { x: RIGHT, y: yv(hi.value), color: RED, r: 14 },
];

/* 끝값 두 개. 위/아래로 갈라 세우되 **겹치지 않을 자리를 빌더가 잰다**
   (SVG 안 글자는 designQa 넘침·겹침 검사 밖이다). */
const LB = 54, VB_W = 1000, CW = 0.6;
const yHi = r1(yv(hi.value) + 18), yLo = r1(yv(lo.value) + 18);
const hiT = `${jo(hi.value)}조`, loT = `${jo(lo.value)}조`;
const vlabels = [
  { x: LBL_X, y: yHi, text: hiT, fill: RED, anchor: "start" },
  { x: LBL_X, y: yLo, text: loT, fill: COBALT, anchor: "start" },
];
const wOf = (t) => t.length * LB * CW;
for (const [t, y] of [[hiT, yHi], [loT, yLo]]) {
  if (LBL_X + wOf(t) > VB_W - 4) throw new Error(`끝값 라벨 "${t}"이 카드 오른쪽으로 넘친다`);
  if (y - LB < 0) throw new Error(`끝값 라벨 "${t}"이 카드 위로 넘친다(y=${y}) — YMAX 를 올린다`);
}
if (yLo - LB < yHi) throw new Error(`끝값 두 라벨이 겹친다(간격 ${r1(yLo - yHi)}px)`);

/* ③ 실측/예측 경계 — 마지막 실측월에 세로 점선. 글자만이 아니라 **자리로도** 가른다 */
const vmarks = [{ x: xm(lastYm), y1: TOP - 10, y2: yv(0), color: MUTE }];

/* 9년 간격 — 2003·2012·2021 + 끝의 2030. 5년으로 두면 붙는 칸이 생겨 눈금이 들쭉날쭉해진다 */
const ticks = yearTicks({ months: allMonths, x: (i) => xm(allMonths[i]), right: RIGHT, lastText: "2030", every: 9 });
const xlabels = [
  ...ticks.map((t) => ({ x: xm(allMonths[t.i]), y: BASE + 46, text: t.text, fill: MUTE, anchor: t.anchor })),
  { x: RIGHT, y: BASE + 46, text: "2030", fill: INK, anchor: "end" },
];

/* ── 「지금 여기」 뱃지 (오너 지시 2026-09-01: 그래프 안, 경계선 왼쪽) ──
   좌축 눈금을 없앴으므로 **수준을 말하는 것은 이 뱃지 하나**다. 그래서 실측 곡선이 끝나는
   지점 바로 옆에 세운다. 글자가 카드 밖으로 나가지 않게 **자리를 빌더가 잰다**
   (SVG 안 글자는 designQa 넘침 검사 밖이다). */
const BD_FS = 34, BD_LH = 46, BD_PADX = 26, BD_PADY = 22;
const bdLines = [
  { t: "지금 M2", fill: MUTE, size: 27, weight: 800 },
  { t: `${jo(cur)}조`, fill: INK, size: 52, weight: 900 },
  { t: ymLabel(lastYm), fill: MUTE, size: 26, weight: 800 },
];
const bdW = Math.round(Math.max(...bdLines.map((l) => l.t.length * l.size * 0.62))) + BD_PADX * 2;
const bdH = BD_LH * bdLines.length + BD_PADY * 2 - 6;
/* 경계선 **왼쪽**에 붙인다. 곡선(2026 끝값)보다 위로 띄워 데이터를 덮지 않는다. */
const bdX = r1(Math.max(AXIS_X + 6, xm(lastYm) - 18 - bdW));
const bdY = r1(yv(cur) - 40 - bdH);
if (bdY < TOP - 20) throw new Error(`뱃지가 카드 위로 넘친다(y=${bdY})`);
if (bdX < AXIS_X) throw new Error(`뱃지가 왼쪽으로 넘친다(x=${bdX})`);
const badge = {
  x: bdX, y: bdY, w: bdW, h: bdH, r: 16, stroke: "#c9cdd4", sw: 3,
  tx: r1(bdX + bdW / 2), ty: r1(bdY + BD_PADY + 24),
  lines: bdLines.map((l, i) => ({ ...l, dy: i === 0 ? 0 : BD_LH })),
};

/* 워터마크는 곡선이 아직 낮은 좌상단 빈 칸 — 데이터 위에 얹지 않는다(base.css 규칙) */
const wm = { x: 60, y: 250, size: 40, text: "@wirit_note", fill: INK, opacity: 0.14, anchor: "start" };

/* 범례는 **하단 표로 내렸다**(오너 지시) — 그래프 안이 비어 곡선을 그만큼 크게 쓴다.
   숫자는 전부 계산값이고, 색은 곡선·영역과 같은 색을 그대로 쓴다(같은 것을 두 색으로 부르지 않는다). */
const scen = [
  { color: COBALT, name: lo.name, rate: `연 ${lo.rate.toFixed(1)}%`, value: `${jo(lo.value)}조` },
  { color: RED, name: hi.name, rate: `연 ${hi.rate.toFixed(1)}%`, value: `${jo(hi.value)}조` },
];

const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;

const card = {
  template: "streak-line@1",
  date,
  badge: `M2(광의통화) 개편 전 기준 · 평잔·원계열 · 단위 조원`,
  /* 「2030년」 코발트 · 「M2 통화량」 레드 (오너 지시 2026-09-01) */
  title: `<span class="tl"><span class="hb">2030년</span> 대한민국 <span class="hi">M2 통화량</span>?</span>`,
  chart: {
    vb: `0 0 1000 ${VB_H}`,
    wm,
    base: { y: yv(0), x1: AXIS_X, x2: RIGHT },
    grid, areas, ylabels, vmarks, polylines, dots, vlabels, xlabels, badge,
  },
  /* 범례 대신 **하단 표** — 두 시나리오를 나눠서 적는다(오너 지시 2026-09-01) */
  scen,
  source: { name: "한국은행 ECOS(M2 평잔·원계열, 개편 전 기준)", asOf: ymLabel(lastYm) },
  meta: {
    verified: true,
    provenance: `${raw.legacyM2.itemCode ?? "BBHA16"}([참고] 구 M2) 단일 계열 — 접합 없음`,
    basis: "개편 전 기준(구 M2). 2030년 값은 예측이며 한국은행 발표값이 아니다",
    range: { from: firstYm, to: lastYm, months: hist.length },
    current: { ym: lastYm, shown: shownJo(cur) },
    projection: {
      toYm: TO_YM,
      years: yrsBetween(lastYm, TO_YM),
      scenarios: SCEN.map((s) => ({
        key: s.key, name: s.name, from: s.from, to: s.to,
        rate: r1(s.rate), shown: shownJo(s.value), times: r1(s.value / cur),
      })),
      /* 오너 메모와의 차이를 남긴다 — 다음 세션이 12.3% 로 되돌리지 않게 */
      ownerNote: "오너 메모 '李정부 평균 12.3%' 는 최신월 전년동월비다. 정부 구간의 연평균은 11.8% 이고 카드는 계산값을 쓴다",
    },
  },
};

const PUBLISH = process.argv.includes("--publish");
const outDir = PUBLISH ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "m2-trend.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`m2-trend — 실측 ${ymLabel(firstYm)}~${ymLabel(lastYm)} (${hist.length}개월) · 예측 ~${ymLabel(TO_YM)}`);
console.log(`   현재 ${r1(cur)}조`);
for (const s of SCEN) console.log(`   ${s.name}: 연 ${s.rate.toFixed(2)}% (${ymLabel(s.from)}~${ymLabel(s.to)}) → 2030말 ${Math.round(s.value).toLocaleString("ko-KR")}조 (${r1(s.value / cur)}배)`);
console.log(`   → ${join(outDir, "m2-trend.json")}`);
