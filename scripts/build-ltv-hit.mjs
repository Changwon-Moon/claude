/**
 * 「6.27은 위를, 10.15는 아래를」 → streak-line@1.
 *
 * 소재: 오너 발제(2026-09-10). 기획 정본은 프로젝트 문서
 * `claude/소재-1억으로-살수있는집-LTV규제-2026-09-10.md`.
 *
 * ── 이 카드만 말할 수 있는 것
 * 매트릭스 카드(`ltv-matrix`)는 두 대책을 **합친** 총 감소를 보여 준다. 그래서 고현금 쪽이
 * 더 많이 줄어 보이고, "10.15가 아래를 때렸다"는 문장을 그 표로는 증명할 수 없다.
 * 여기서는 **대책별로 갈라** 감소율 곡선 두 개를 겹친다 — 두 곡선이 교차하는 것이 요점이다.
 *
 *   · 6.27  = 한도만 6억으로 걸었다 → LTV 가 무는 저현금 구간은 **변화 0**, 현금이 클수록 깊어진다
 *   · 10.15 = LTV 를 70→40% 로 내렸다 → 저현금은 **정확히 반토막**, 고현금은 이미 한도에 눌려 있어 얕다
 *
 * ── x축이 시간이 아니라 **현금**이다
 * streak-line 은 원래 시계열용이지만 계약은 「좌표를 빌더가 계산해 넘긴다」뿐이라
 * 가로축이 무엇이든 그린다(2026-09-02 에 격차 맞대결 카드가 같은 계약을 재활용한 전례).
 * 새 판형을 세우지 않는다.
 *
 * ── 손으로 적은 숫자 0개
 * 두 곡선·교차점·최대 감소 모두 `scripts/lib/ltv-calc.mjs` 가 규칙표에서 계산한다.
 *
 * 실행: node scripts/build-ltv-hit.mjs [date=2026-09-10]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { maxPrice } from "./lib/ltv-calc.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-09-10";
const LABEL = "ltv-hit";
const INK = "#141821", RED = "#e5484d", SLATE = "#5b6b7f", MUTE = "#9aa3af";

const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/ltv-rules-2026-09.json"), "utf8"));
const P = Object.fromEntries(ds.phases.map((p) => [p.key, p]));
for (const k of ["2023-01", "2025-06", "2025-10"]) if (!P[k]) throw new Error(`국면 없음: ${k}`);

/* ── 곡선 ── 현금 0.5억~30억, 0.1억 간격. 두 대책 각각의 감소율(%). */
const CASH_MIN = 0.5, CASH_MAX = 30, STEP = 0.1;
const xs = [];
for (let E = CASH_MIN; E <= CASH_MAX + 1e-9; E += STEP) xs.push(Math.round(E * 10) / 10);

const drop = (before, after, E) => {
  const b = maxPrice(P[before].gen, E), a = maxPrice(P[after].gen, E);
  if (b <= 0) throw new Error(`현금 ${E}억 에서 기준값이 0 이다`);
  return (a / b - 1) * 100;
};
const h627 = xs.map((E) => drop("2023-01", "2025-06", E));
const h1015 = xs.map((E) => drop("2025-06", "2025-10", E));

/* ── 가드 ── 이 카드의 주장이 실제로 성립하는지 계산으로 확인한다.
 * 성립하지 않으면 카드를 만들지 않는다(CARD_CHECKLIST §2 「문구」). */
const at = (arr, E) => arr[xs.findIndex((x) => Math.abs(x - E) < 1e-9)];
if (!(Math.abs(at(h627, 1)) < 0.01)) throw new Error("6.27 이 현금 1억에 영향을 줬다 — 카드 주장이 깨진다");
if (!(Math.abs(at(h1015, 1) + 50) < 0.5)) throw new Error(`10.15 의 현금 1억 감소율이 −50% 가 아니다: ${at(h1015, 1).toFixed(1)}%`);
if (!(Math.abs(at(h627, 30)) > Math.abs(at(h1015, 30)))) throw new Error("현금 30억에서 6.27 이 10.15 보다 얕다 — 교차 구조가 깨진다");

/* 교차점 — 두 곡선의 깊이가 뒤바뀌는 현금 구간을 **찾는다**(손으로 적지 않는다). */
let crossAt = null;
for (let i = 1; i < xs.length; i++) {
  const prev = Math.abs(h627[i - 1]) - Math.abs(h1015[i - 1]);
  const cur = Math.abs(h627[i]) - Math.abs(h1015[i]);
  if (prev < 0 && cur >= 0) { crossAt = xs[i]; break; }
}
if (crossAt == null) throw new Error("두 곡선이 교차하지 않는다 — 이 카드의 요점이 사라진다");

/* ── 좌표 ── m2-gap 과 같은 자(1000×700). */
const AXIS_X = 150, RIGHT = 930, TOP = 270, BASE = 620, VB_H = 700;
const YMIN = -70;
const worst = Math.min(...h627, ...h1015);
if (worst < YMIN) throw new Error(`최대 감소 ${worst.toFixed(1)}% 가 Y축 하한 ${YMIN}% 를 넘었다 — 눈금을 내린다`);

const r1 = (n) => Math.round(n * 10) / 10;
const xi = (E) => r1(AXIS_X + ((E - CASH_MIN) / (CASH_MAX - CASH_MIN)) * (RIGHT - AXIS_X));
const yv = (v) => r1(TOP + (v / YMIN) * (BASE - TOP));
const pts = (arr) => xs.map((E, i) => `${xi(E)},${yv(arr[i])}`).join(" ");

const TICKS = [0, -10, -20, -30, -40, -50, -60, -70];
const grid = TICKS.map((v) => ({ x1: AXIS_X, x2: RIGHT, y: yv(v) }));
const ylabels = TICKS.map((v) => ({ x: AXIS_X - 16, y: yv(v) + 10, text: `${v}%` }));

const polylines = [
  { points: pts(h627), color: SLATE, width: 7 },
  { points: pts(h1015), color: RED, width: 8 },
];
const dots = [
  { x: xi(CASH_MAX), y: yv(at(h627, 30)), color: SLATE, r: 15 },
  { x: xi(CASH_MIN), y: yv(h1015[0]), color: RED, r: 15 },
];
/* 교차 구간에 세로 점선 하나. 라벨은 범례가 받는다 — SVG 글자는 designQa 밖이라
   곡선 옆에 글자를 세우면 겹침을 검사가 못 잡는다(m2-gap 머리말의 실측 교훈). */
const vmarks = [{ x: xi(crossAt), y1: yv(0), y2: yv(YMIN), color: MUTE }];

/* 25억을 빼는 이유: 마지막 눈금(30억)이 오른쪽 끝에 end 정렬로 붙어 있어
   25억과 글자가 닿는다("25억30억"으로 읽힌다 — 2026-09-10 육안 검수).
   designQa 는 SVG 안 글자를 재지 않으므로 자리를 아예 만들지 않는다. */
const XT = [1, 5, 10, 15, 20, 30];
const xlabels = XT.map((E) => ({
  x: xi(E), y: BASE + 46, text: `${E}억`, fill: E === 1 ? RED : MUTE,
  anchor: E === CASH_MAX ? "end" : E === 1 ? "start" : "middle",
}));

/* 범례 두 줄의 간격은 **90px**. 78px 로 뒀더니 위 줄의 설명(sub)과 아래 줄의 이름이
   29% 겹쳤다(designQa svglabel, 2026-09-10). m2-gap 이 쓰는 간격과 같게 맞췄다. */
const legend = [
  { sx1: 168, sx2: 246, sy: 110, color: RED, tx: 264, ty: 100, text: `10.15 — LTV 70→40%`, fill: INK,
    sub: `현금 1억 ${at(h1015, 1).toFixed(0)}% · 30억 ${at(h1015, 30).toFixed(0)}%`, sty: 146 },
  { sx1: 168, sx2: 246, sy: 200, color: SLATE, tx: 264, ty: 190, text: `6.27 — 한도 6억`, fill: INK,
    sub: `현금 1억 ${at(h627, 1).toFixed(0)}% · 30억 ${at(h627, 30).toFixed(0)}%`, sty: 236 },
];
const wm = { x: 640, y: 540, size: 40, text: "@wirit_note", fill: INK, opacity: 0.14, anchor: "start" };

const card = {
  template: "streak-line@1",
  date,
  badge: `무주택·서울 아파트 · 최대 집값 감소율`,
  title: `<span class="tl">6.27은 <span class="hi">위를</span>,</span>` +
         `<span class="tl">10.15는 <span class="hi">아래를</span> 때렸다</span>`,
  chart: {
    vb: `0 0 1000 ${VB_H}`,
    wm,
    base: { y: yv(0), x1: AXIS_X, x2: RIGHT },
    grid, ylabels, vmarks, polylines, dots, vlabels: [], xlabels, legend,
  },
  /* 하단 한 줄은 한 줄에 들어가야 한다 — 길게 적었더니 "…4.5억에서" 뒤가 카드 밖으로
     잘렸다(2026-09-10 육안 검수. designQa 는 이 줄의 넘침을 재지 않는다). */
  note: `가로축은 <b>가진 현금</b> · 현금 ${crossAt}억에서 뒤바뀐다`,
  source: { name: "정책브리핑 · 금융위원회 · 국토교통부", asOf: ds.meta.asOf },
  meta: {
    verified: ds.meta.verified,
    provenance: "data/datasets/ltv-rules-2026-09.json → scripts/lib/ltv-calc.mjs",
    basis: "6.27 = 2023.1 규제해제 국면 대비 / 10.15 = 6.27 국면 대비, 각각 살 수 있는 최대 집값의 감소율",
    crossAt,
    hit627: { at1: r1(at(h627, 1)), at10: r1(at(h627, 10)), at30: r1(at(h627, 30)) },
    hit1015: { at1: r1(at(h1015, 1)), at10: r1(at(h1015, 10)), at30: r1(at(h1015, 30)) },
  },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${LABEL}.json`), JSON.stringify(card, null, 2) + "\n");

const cap = [
  `대책은 둘 다 대출을 줄였습니다. 그런데 줄인 대상이 정반대였습니다 🎯`,
  ``,
  `가로축을 시간이 아니라 <가진 현금>으로 놓고, 각 대책이 「살 수 있는 최대 집값」을 몇 % 깎았는지 그려봤습니다.`,
  ``,
  `🔹 6.27 (한도 6억)`,
  `· 현금 1억 → ${at(h627, 1).toFixed(0)}% (변화 없음)`,
  `· 현금 10억 → ${at(h627, 10).toFixed(0)}%`,
  `· 현금 30억 → ${at(h627, 30).toFixed(0)}%`,
  `LTV는 그대로 두고 한도만 걸었으니, 한도 6억에 닿는 사람부터 걸립니다.`,
  ``,
  `🔹 10.15 (LTV 70→40%)`,
  `· 현금 1억 → ${at(h1015, 1).toFixed(0)}%`,
  `· 현금 10억 → ${at(h1015, 10).toFixed(0)}%`,
  `· 현금 30억 → ${at(h1015, 30).toFixed(0)}%`,
  `비율을 내리면 현금이 적은 쪽이 그대로 절반이 됩니다. 고현금은 이미 한도에 눌려 있어 더 깎일 게 적었습니다.`,
  ``,
  `두 곡선은 현금 ${crossAt}억에서 뒤바뀝니다.`,
  `그보다 현금이 적으면 10.15가, 많으면 6.27이 더 아팠습니다.`,
  ``,
  `📌 저장해두고 내 현금이 어느 쪽인지 확인하기`,
  ``,
  `—`,
  `📊 출처 : 정책브리핑 · 금융위원회 · 국토교통부 (${ds.meta.asOf} 기준)`,
  `🧮 기준 : 무주택 세대주 · 서울 아파트 · 소득 충분 가정 · 취득세 별도`,
  `🗓 비교 구간 : 2023년 1월 규제해제 ~ 2025년 10월 10.15대책`,
  ``,
  `#627대책 #1015대책 #LTV #주택담보대출 #부동산규제`,
].join("\n");
writeFileSync(join(ROOT, `data/review/captions/${LABEL}.txt`), cap + "\n");

console.log(`✅ ${LABEL}.json — 현금 ${CASH_MIN}~${CASH_MAX}억 곡선 2본 (${xs.length}점)`);
console.log(`   6.27  현금 1억 ${at(h627, 1).toFixed(1)}% / 10억 ${at(h627, 10).toFixed(1)}% / 30억 ${at(h627, 30).toFixed(1)}%`);
console.log(`   10.15 현금 1억 ${at(h1015, 1).toFixed(1)}% / 10억 ${at(h1015, 10).toFixed(1)}% / 30억 ${at(h1015, 30).toFixed(1)}%`);
console.log(`   교차점 = 현금 ${crossAt}억 (계산으로 찾음) · 최대 감소 ${worst.toFixed(1)}%`);
