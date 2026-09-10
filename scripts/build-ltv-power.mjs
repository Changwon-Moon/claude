/**
 * 「현금 4억의 12년」 → streak-line@1. 규제 국면 7개를 가로축에 놓고 구매력을 그린다.
 *
 * 소재: 오너 발제(2026-09-10). 기획 정본은 프로젝트 문서
 * `claude/소재-1억으로-살수있는집-LTV규제-2026-09-10.md`.
 *
 * ── 가로축이 「국면」인 이유
 * 달력 축으로 그리면 2022.12 와 2023.1 이 한 달 차이로 붙어 두 국면이 한 점이 된다.
 * 이 카드가 재는 것은 시간이 아니라 **규칙이 몇 번 바뀌었나**라서 국면을 등간격으로 놓는다.
 * (2026-09-02 격차 맞대결 카드가 streak-line 계약을 시계열 아닌 축에 재활용한 전례를 따른다.)
 *
 * ── 세 선을 한 판에 놓는 이유
 * 현금 1억 선은 1.7~3.3억 사이에서 바닥에 붙어 움직인다. 이걸 따로 그리면 "출렁였다"로 보이지만,
 * 4억 선과 같은 자에 놓으면 **애초에 선택지가 없었다**가 보인다 — 그게 오너가 물은 것이다.
 * 생애최초선(점선)은 요건을 충족했을 때만 유효한 보조선이라 실선과 굵기·모양을 다르게 둔다.
 *
 * ── 손으로 적은 숫자 0개
 * 모든 점은 `scripts/lib/ltv-calc.mjs` 가 규칙표에서 계산한다.
 *
 * 실행: node scripts/build-ltv-power.mjs [date=2026-09-10]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { maxPrice } from "./lib/ltv-calc.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-09-10";
const LABEL = "ltv-power";
const INK = "#141821", RED = "#e5484d", SLATE = "#5b6b7f", MUTE = "#9aa3af";

const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/ltv-rules-2026-09.json"), "utf8"));
const ph = ds.phases;
if (ph.length < 5) throw new Error(`국면이 ${ph.length}개뿐 — 흐름을 그릴 수 없다`);

const BIG = 4, SMALL = 1;                       // 두 현금 규모
const big = ph.map((p) => maxPrice(p.gen, BIG));
const small = ph.map((p) => maxPrice(p.gen, SMALL));
const first = ph.map((p) => maxPrice(p.first, BIG));

/* ── 가드 ── 계산이 확인한 것만 문구로 쓴다. */
const peakV = Math.max(...big);
const peakIdx = big.map((v, i) => (Math.abs(v - peakV) < 1e-9 ? i : -1)).filter((i) => i >= 0);
const peakI = peakIdx[0];               // 점을 찍을 자리(가장 이른 국면)
const lastI = ph.length - 1;
if (big[lastI] >= big[peakI]) throw new Error("최신 국면이 최고점이다 — 이 카드의 제목이 성립하지 않는다");
const dropFromPeak = (big[lastI] / big[peakI] - 1) * 100;
/* 생애최초선이 실선보다 **낮은** 국면이 있으면 '우대'라는 말을 쓰지 않는다.
 * 실제로 있다: 2023.1 국면은 생애최초 LTV 80%인데 한도 6억이 걸려 있고, 일반 무주택은
 * LTV 70%에 한도가 없다. 현금 4억이면 일반이 13.3억, 생애최초가 10.0억으로 **뒤집힌다.**
 * 이 뒤집힘은 캡션이 이름을 대고 말한다 — 점선이 늘 위라고 읽히면 그게 오보다. */
const firstAlwaysGE = first.every((v, i) => v >= big[i] - 1e-9);
const flipped = ph.map((p, i) => ({ p, i })).filter(({ i }) => first[i] < big[i] - 1e-9);
/* 현금 1억 선이 정말 바닥에 붙어 있나 — 전 국면 최댓값이 4억 선의 최솟값보다 작은가 */
const smallFlat = Math.max(...small) <= Math.min(...big) + 1e-9;

/* ── 좌표 ── */
const AXIS_X = 150, RIGHT = 930, TOP = 290, BASE = 640, VB_H = 700;
const YMAX = 14;
if (Math.max(...big, ...first) > YMAX) throw new Error(`최고 ${Math.max(...big, ...first)}억 이 Y축 상한 ${YMAX}억을 넘었다`);
const r1 = (n) => Math.round(n * 10) / 10;
const N = ph.length;
const xi = (i) => r1(AXIS_X + (i / (N - 1)) * (RIGHT - AXIS_X));
const yv = (v) => r1(BASE - (v / YMAX) * (BASE - TOP));
const pts = (arr) => arr.map((v, i) => `${xi(i)},${yv(v)}`).join(" ");

const TICKS = [0, 2, 4, 6, 8, 10, 12, 14];
const grid = TICKS.map((v) => ({ x1: AXIS_X, x2: RIGHT, y: yv(v) }));
const ylabels = TICKS.map((v) => ({ x: AXIS_X - 16, y: yv(v) + 10, text: `${v}` }));

const polylines = [
  { points: pts(first), color: RED, width: 5, dash: "12 10" },
  { points: pts(small), color: SLATE, width: 6 },
  { points: pts(big), color: RED, width: 8 },
];
const dots = [
  { x: xi(peakI), y: yv(big[peakI]), color: RED, r: 15 },
  { x: xi(lastI), y: yv(big[lastI]), color: RED, r: 16 },
  { x: xi(lastI), y: yv(small[lastI]), color: SLATE, r: 13 },
];
const vmarks = [{ x: xi(lastI), y1: yv(big[lastI]), y2: yv(small[lastI]), color: MUTE }];

/* X 눈금은 국면 라벨. 7개가 붙지 않게 **한 칸 걸러** 쓰고, 처음·마지막은 반드시 넣는다. */
/* 눈금 글자는 **줄여 쓴다**: "2023.1"·"2025.10" 을 그대로 쓰면 두 눈금이 서로 닿는다
   (2026-09-10 육안 검수 — SVG 안 글자라 designQa 가 못 잡는다). 연도 두 자리로 줄여
   폭을 절반으로 만든다. 전체 연도는 캡션이 적는다. */
const short = (label) => label.replace(/^20/, "'");
const xlabels = ph.map((p, i) => ({ i, p })).filter(({ i }) => i % 2 === 0 || i === lastI)
  .map(({ i, p }) => ({
    x: xi(i), y: BASE + 42, text: short(p.label), fill: i === lastI ? RED : MUTE,
    anchor: i === 0 ? "start" : i === lastI ? "end" : "middle",
  }));

const legend = [
  { sx1: 168, sx2: 246, sy: 110, color: RED, tx: 264, ty: 100, text: `현금 ${BIG}억 — 무주택`, fill: INK,
    sub: `최고 ${r1(big[peakI])}억 → 지금 ${r1(big[lastI])}억`, sty: 146 },
  { sx1: 168, sx2: 246, sy: 200, color: SLATE, tx: 264, ty: 190, text: `현금 ${SMALL}억 — 무주택`, fill: INK,
    sub: `최고 ${r1(Math.max(...small))}억 → 지금 ${r1(small[lastI])}억`, sty: 236 },
];

const card = {
  template: "streak-line@1",
  date,
  badge: `서울 아파트 · 살 수 있는 최대 집값(억)`,
  title: `<span class="tl">현금 ${BIG}억으로 살 수 있는 집,</span>` +
         `<span class="tl">규제 <span class="hi">일곱 번</span>의 기록</span>`,
  chart: {
    vb: `0 0 1000 ${VB_H}`,
    /* 워터마크는 두 선 **사이의 빈 곳**에 둔다 — 처음엔 x600/y545 였는데 현금 1억 선(회색)을
       가로질렀다(2026-09-10 육안 검수). 국면 1~3 구간은 붉은선 y≈473, 회색선 y≈598 사이가 빈다. */
    wm: { x: 300, y: 545, size: 36, text: "@wirit_note", fill: INK, opacity: 0.14, anchor: "start" },
    base: { y: yv(0), x1: AXIS_X, x2: RIGHT },
    grid, ylabels, vmarks, polylines, dots, vlabels: [], xlabels, legend,
  },
  note: `붉은 점선은 <b>생애최초</b> 기준(요건 충족 시)`,
  source: { name: "정책브리핑 · 금융위원회 · 국토교통부", asOf: ds.meta.asOf },
  meta: {
    verified: ds.meta.verified,
    provenance: "data/datasets/ltv-rules-2026-09.json → scripts/lib/ltv-calc.mjs",
    basis: "무주택 세대주 · 서울 아파트 · 소득 충분 가정 · 취득세 별도. 가로축은 시간이 아니라 규제 국면",
    phases: ph.map((p, i) => ({ label: p.label, name: p.name, big: r1(big[i]), small: r1(small[i]), first: r1(first[i]), sourceTier: p.sourceTier })),
    peak: { phases: peakIdx.map((i) => ph[i].label), value: r1(peakV) },
    now: { phase: ph[lastI].label, value: r1(big[lastI]) },
    dropFromPeak: r1(dropFromPeak),
    firstAlwaysGE, smallFlat,
    firstBelowGeneral: flipped.map(({ p, i }) => ({ phase: p.label, first: r1(first[i]), general: r1(big[i]) })),
  },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${LABEL}.json`), JSON.stringify(card, null, 2) + "\n");

const row = (i) => `· ${ph[i].label} ${ph[i].name} → ${r1(big[i])}억`;
const cap = [
  `현금 4억으로 살 수 있는 서울 아파트, 12년 동안 이렇게 움직였습니다 🏦`,
  ``,
  `소득은 충분하다고 치겠습니다. 그래도 살 수 있는 집은 <가진 현금 × 그때의 규제>가 정합니다.`,
  ``,
  `💰 현금 4억 → 살 수 있는 최대 집값`,
  ...ph.map((_, i) => row(i)),
  ``,
  `최고는 ${peakIdx.map((i) => ph[i].label).join("·")} 국면의 ${r1(peakV)}억, 지금은 ${r1(big[lastI])}억입니다. ${Math.abs(dropFromPeak).toFixed(0)}% 줄었습니다.`,
  ``,
  smallFlat
    ? `현금 1억 선은 어느 국면에서도 ${r1(Math.min(...small))}~${r1(Math.max(...small))}억을 벗어나지 못했습니다. 지금은 ${r1(small[lastI])}억입니다.`
    : null,
  ``,
  `그런데 점선(생애최초)이 늘 위에 있는 건 아닙니다.`,
  ...flipped.map(({ p, i }) =>
    `· ${p.label} — 생애최초 ${r1(first[i])}억 < 일반 무주택 ${r1(big[i])}억`),
  flipped.length
    ? `LTV는 생애최초가 높았지만(80%) 한도 6억이 걸려 있었고, 일반 무주택은 LTV 70%에 한도가 없었습니다. 비율보다 한도가 먼저 무는 구간이 있다는 뜻입니다.`
    : null,
  ``,
  `${ph[lastI].label} 지금은 두 선이 같습니다 — 규제지역에서는 생애최초도 LTV 40%입니다.`,
  ``,
  `📌 저장해두고 내 현금이 어느 선에 있는지 확인하기`,
  ``,
  `—`,
  `📊 출처 : 정책브리핑 · 금융위원회 · 국토교통부 (${ds.meta.asOf} 기준)`,
  `🧮 기준 : 무주택 세대주 · 서울 아파트 · 소득 충분 가정 · 취득세 별도`,
  `ℹ️ 가로축은 달력이 아니라 규제 국면입니다`,
  ``,
  `#부동산규제 #LTV #생애최초 #주택담보대출 #내집마련`,
].filter((l) => l !== null).join("\n");
writeFileSync(join(ROOT, `data/review/captions/${LABEL}.txt`), cap + "\n");

console.log(`✅ ${LABEL}.json — 국면 ${N}개`);
ph.forEach((p, i) => console.log(`   ${p.label.padEnd(8)} 4억→${r1(big[i]).toFixed(2).padStart(6)}억  1억→${r1(small[i]).toFixed(2).padStart(5)}억  생최4억→${r1(first[i]).toFixed(2).padStart(6)}억`));
console.log(`   최고 ${peakIdx.map((i)=>ph[i].label).join("·")} ${r1(peakV)}억 → 지금 ${r1(big[lastI])}억 (${dropFromPeak.toFixed(0)}%)`);
console.log(`   가드 — 생애최초가 항상 실선 이상: ${firstAlwaysGE} / 1억선이 4억선 아래: ${smallFlat}`);
if (flipped.length) console.log(`   ⚠️ 생애최초 < 일반 무주택 국면: ${flipped.map(({ p, i }) => `${p.label}(${r1(first[i])}<${r1(big[i])})`).join(" · ")}`);
