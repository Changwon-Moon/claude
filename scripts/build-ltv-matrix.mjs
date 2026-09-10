/**
 * 「같은 현금, 세 번의 규제」 → tax-matrix@1 카드 + 캡션.
 *
 * 소재: 오너 발제(2026-09-10) — "1억으로 살 수 있는 집이 규제로 완전히 다운그레이드됐다".
 * 기획 정본은 프로젝트 문서 `claude/소재-1억으로-살수있는집-LTV규제-2026-09-10.md`.
 *
 * ── 왜 열이 3+1 개인가 (CARD_CHECKLIST §2 「표」)
 * `tax-matrix@1` 은 주석에 **2~4열·짧은 숫자**를 전제로 치수가 박혀 있다. 실제로 world-price
 * 카드가 열을 늘렸다가 designQa 에서 겹침 51건을 맞았다. 규제 국면은 7개지만 이 카드는
 * **오너가 물은 두 대책(6.27·10.15)의 전·후 3국면 + 총 감소율** 4열로 자른다.
 * 7국면 전체 흐름은 꺾은선 카드(`ltv-power`)가 맡는다 — 한 카드는 한 가지만 말한다.
 *
 * ── 카드에 없는 것
 * 생애최초 우대선은 이 카드에 넣지 않는다. 요건(소득·주택가격 상한)이 국면마다 달라
 * 한 칸에 담으면 각주가 표보다 길어진다. 꺾은선 카드의 보조선이 맡는다.
 *
 * ── 손으로 적은 숫자 0개
 * 모든 칸은 `scripts/lib/ltv-calc.mjs` 가 규칙표에서 계산한다. 감소율도 계산값이다.
 *
 * 실행: node scripts/build-ltv-matrix.mjs [date=2026-09-10]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { maxPrice } from "./lib/ltv-calc.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-09-10";
const LABEL = "ltv-matrix";

const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/ltv-rules-2026-09.json"), "utf8"));

/* ── 가드 ── 규칙표가 우리가 믿는 모양이 아니면 카드를 만들지 않는다. */
if (ds.meta.unit !== "억원 / %") throw new Error(`단위가 다르다: ${ds.meta.unit}`);
const P = Object.fromEntries(ds.phases.map((p) => [p.key, p]));
for (const k of ["2023-01", "2025-06", "2025-10"])
  if (!P[k]) throw new Error(`국면 없음: ${k}`);

/* 열은 「느슨했던 마지막 국면 → 6.27 → 10.15」 세 개 + 총 감소율. */
const COLS = ["2023-01", "2025-06", "2025-10"];
const CASH = [1, 2, 4, 7, 10, 20, 30];

/** 억 → "3.3" / "15.0". 소수 첫째까지. 정수여도 자리를 지킨다(칸 폭이 흔들리지 않게). */
const f1 = (n) => n.toFixed(1);

const rows = CASH.map((E) => {
  const vals = COLS.map((k) => maxPrice(P[k].gen, E));
  const drop = (vals[2] / vals[0] - 1) * 100;
  return {
    label: `${E}억`,
    cells: [
      ...vals.map((v, i) => ({ v: f1(v), unit: "억", cls: i === 2 ? "up" : "" })),
      { v: `${drop.toFixed(0)}%`, cls: "down" },
    ],
    _E: E,
    _vals: vals,
    _drop: drop,
  };
});

/* ── 계산이 확인한 것만 문구로 쓴다 (CARD_CHECKLIST §2 「문구」) ──
 * 6.27 은 현금이 많을수록, 10.15 는 현금이 적을수록 세게 때린다 — 이 방향이 실제로
 * 성립하는지 **재고** 문장을 만든다. 성립하지 않으면 문장을 비운다. */
const hit627 = rows.map((r) => (maxPrice(P["2025-06"].gen, r._E) / maxPrice(P["2023-01"].gen, r._E) - 1) * 100);
const hit1015 = rows.map((r) => (maxPrice(P["2025-10"].gen, r._E) / maxPrice(P["2025-06"].gen, r._E) - 1) * 100);
const mono = (arr, dir) => arr.every((v, i) => i === 0 || (dir < 0 ? v <= arr[i - 1] + 1e-9 : v >= arr[i - 1] - 1e-9));
/** 6.27: 현금이 커질수록 타격이 커진다 — 단조성이 실제로 성립한다. */
const shape627 = mono(hit627, -1);
/** 10.15: 단조는 **아니다**(10억 −6.2% → 15억 −9.5% 로 다시 커진다). 그래서 단조성이 아니라
 *  「아래쪽이 위쪽보다 압도적으로 크다」만 잰다 — 현금 1억 타격이 현금 10억 이상 최대 타격의
 *  2배를 넘는가. 이게 성립할 때만 "아래를 때렸다"고 쓴다. */
const lowHit = Math.abs(hit1015[0]);
const highHit = Math.max(...CASH.map((E, i) => (E >= 10 ? Math.abs(hit1015[i]) : 0)));
const shape1015 = lowHit >= highHit * 2;

const one = rows.find((r) => r._E === 1);
const ten = rows.find((r) => r._E === 10);

const halved = rows.filter((r) => Math.abs(hit1015[rows.indexOf(r)] + 50) < 0.5).map((r) => r._E);
const untouched = rows.filter((r) => Math.abs(hit627[rows.indexOf(r)]) < 0.05).map((r) => r._E);

/* ── 하단 한 줄은 **이 표가 실제로 말하는 것**이어야 한다 (CARD_CHECKLIST §2 「문구」).
 * 처음엔 "6.27은 위를, 10.15는 아래를 때렸습니다" 를 넣었는데, 이 표의 마지막 열은
 * 두 대책을 합친 **총 감소**라 고현금 쪽이 더 크게 줄어 보인다(−68%). 같은 카드가
 * 자기 모순이 된다 → 두 대책을 갈라 보이는 것은 꺾은선 카드(`ltv-hit`)에 맡기고,
 * 여기서는 표 전체가 만족하는 사실만 쓴다. */
const allHalved = rows.every((r) => r._drop <= -50 + 1e-9);
const worst = rows.reduce((a, r) => (r._drop < a._drop ? r : a));
const foot = allHalved
  ? `현금이 많든 적든 <b>절반 아래로</b> · 최대 ${Math.abs(worst._drop).toFixed(0)}% (현금 ${worst._E}억)`
  : `현금 ${one._E}억 기준 ${Math.abs(one._drop).toFixed(0)}% 감소`;

const content = {
  template: "tax-matrix@1",
  date,
  who: "무주택 세대주 · 서울 아파트",
  status: "가정 계산",
  title: `같은 현금, <span class="hi">세 번의 규제</span>`,
  lead: "가진 현금",
  n: 4,
  labw: 210,
  cols: [
    { t: "2023.1 완화" },
    { t: "2025.6 6.27" },
    { t: "2025.10 10.15" },
    { t: "총 감소" },
  ],
  rows: rows.map(({ label, cells }) => ({ label, cells })),
  foot,
  applyAt: "소득 충분(DSR 미저촉) 가정 · 취득세·중개보수 별도 · 살 수 있는 최대 집값",
  source: { name: "정책브리핑 · 금융위원회 · 국토교통부", asOf: ds.meta.asOf },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${LABEL}.json`), JSON.stringify(content, null, 2) + "\n");

/* ── 캡션 ── 카드에 없는 국면·요건은 여기서 받는다. */
const line = (E) => {
  const r = rows.find((x) => x._E === E);
  return `· 현금 ${E}억 → ${f1(r._vals[0])}억 → ${f1(r._vals[1])}억 → ${f1(r._vals[2])}억`;
};
const caption = [
  `소득이 충분해도, 살 수 있는 집은 규제가 정합니다 🏦`,
  ``,
  `현금 1억으로 살 수 있는 서울 아파트는 2023년 ${f1(one._vals[0])}억이었습니다.`,
  `지금은 ${f1(one._vals[2])}억. ${one._drop.toFixed(0)}%입니다.`,
  ``,
  `💰 가진 현금 → 살 수 있는 최대 집값`,
  `(2023.1 규제해제 → 2025.6 6.27대책 → 2025.10 10.15대책)`,
  ...[1, 4, 10, 30].map(line),
  ``,
  `여기서 두 대책이 갈립니다.`,
  ``,
  untouched.length
    ? `🔹 6.27(한도 6억)은 현금 ${untouched.join("·")}억엔 아무 변화가 없었습니다. LTV를 그대로 두고 한도만 걸었으니, 한도에 닿는 사람부터 걸립니다.`
    : null,
  halved.length
    ? `🔹 10.15(LTV 70→40%)는 현금 ${halved.join("·")}억을 정확히 반토막 냈습니다. 비율을 건드리면 현금이 적은 쪽이 그대로 절반이 됩니다.`
    : null,
  shape1015
    ? `   같은 대책이 현금 10억 이상에서는 ${highHit.toFixed(0)}% 안쪽에 그쳤습니다.`
    : null,
  ``,
  shape627 && shape1015 ? `6.27은 위를, 10.15는 아래를 때렸습니다.` : null,
  ``,
  `현금 10억도 지금은 ${f1(ten._vals[2])}억이 최대입니다 — 15억이 넘는 순간 한도가 6억에서 4억으로 떨어지기 때문입니다.`,
  ``,
  `📌 저장해두고 내 현금으로 어디까지 가능한지 확인하기`,
  ``,
  `—`,
  `📊 출처 : 정책브리핑 · 금융위원회 · 국토교통부 (${ds.meta.asOf} 기준)`,
  `🧮 기준 : 무주택 세대주 · 서울 아파트 · 소득 충분 가정`,
  `ℹ️ 대출 = min(집값×LTV, 가격구간별 한도) · 취득세·중개보수 별도`,
  ``,
  `#부동산대출 #LTV #주택담보대출 #1015대책 #내집마련`,
]
  .filter((l) => l !== null)
  .join("\n");

writeFileSync(join(ROOT, `data/review/captions/${LABEL}.txt`), caption + "\n");

console.log(`✅ ${LABEL}.json — 현금 ${CASH.length}구간 × 국면 ${COLS.length} (규칙표에서 계산)`);
console.log(`   현금 1억: ${f1(one._vals[0])}억 → ${f1(one._vals[2])}억 (${one._drop.toFixed(0)}%)`);
console.log(`   하단 문구 근거 — 모든 행이 −50% 이하: ${allHalved} (최대 감소 ${Math.abs(worst._drop).toFixed(0)}% · 현금 ${worst._E}억)`);
console.log(`   6.27 무영향 현금: ${untouched.join("·") || "없음"}억 / 10.15 정확히 반토막: ${halved.join("·") || "없음"}억`);
console.log(`   방향성 검증 — 6.27 단조(현금↑타격↑): ${shape627} / 10.15 저현금 타격이 고현금의 2배↑: ${shape1015} (${lowHit.toFixed(0)}% vs ${highHit.toFixed(0)}%)`);
console.log(`   ⚠️ verified=${ds.meta.verified} — 2014.8·2023.1 국면은 언론 확인분. 발행 전 원문 승격 필요`);
