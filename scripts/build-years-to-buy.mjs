/**
 * 💸 월급으로 사는 데 몇 년? — 서울 자치구별 34평(84㎡) 아파트를 사는 데 걸리는 햇수.
 *
 * ── 계산 (전부 코드로 추출한다. LLM이 수치를 만들지 않는다 — ARCHITECTURE.md §2)
 *   집값  = 구별 84㎡대(83~86㎡) 실거래 **중위가** (최고가는 이상치라 쓰지 않는다)
 *   연봉  = DART 대기업 10곳 1인 평균급여액의 **중위값** (avg-salary-2025.json)
 *   햇수  = 집값 ÷ 연봉  — 세금·생활비 0원, 즉 **한 푼도 안 쓰고 모았을 때**
 *
 * ── 왜 '대기업 연봉'인가
 * 이 데이터셋은 DART 사업보고서에서 뽑은 **대기업 10곳**이다. 전 국민 평균이 아니다.
 * 그래서 카드도 그렇게 말한다 — "대기업 다녀도 N년". 숨기면 그게 오보다.
 *
 * 실행: node scripts/build-years-to-buy.mjs [date=2026-07-26]
 * 출력: data/content/{date}/years-to-buy.json  (ranking-table@1)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-26";
const BAND = [83, 86]; // 34평 = 전용 84㎡대
const TOP = 16;

/* ── ① 연봉 (DART) ── */
const sal = JSON.parse(readFileSync(join(ROOT, "data/datasets/avg-salary-2025.json"), "utf8"));
const salaries = sal.rows.map((r) => r.avgSalaryWon).sort((a, b) => a - b);
const median = (arr) => {
  const n = arr.length;
  if (!n) return 0;
  return n % 2 ? arr[(n - 1) / 2] : Math.round((arr[n / 2 - 1] + arr[n / 2]) / 2);
};
const salaryWon = median(salaries);

/* ── ② 구별 84㎡ 중위 실거래가 (국토부) ── */
const molitDir = join(ROOT, "data/datasets/molit");
const files = readdirSync(molitDir)
  .filter((f) => /^11\d{3}-\d{6}\.json$/.test(f))
  .sort(); // 결정적 순서
if (!files.length) throw new Error("서울 실거래 캐시 없음 — molit-collect 먼저 실행");

const byGu = new Map();
const months = new Set();
let verified = true;
for (const f of files) {
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  if (d.meta?.verified === false) verified = false;
  months.add(d.meta.dealYmd);
  for (const t of d.trades) {
    if (t.canceled) continue;
    if (t.area < BAND[0] || t.area > BAND[1]) continue;
    if (!byGu.has(d.meta.gu)) byGu.set(d.meta.gu, []);
    byGu.get(d.meta.gu).push(t.priceWon);
  }
}

const MIN_TRADES = 20; // 표본이 얇으면 중위가가 흔들린다 — 뺀다
const rows = [];
for (const [gu, prices] of byGu) {
  if (prices.length < MIN_TRADES) continue;
  prices.sort((a, b) => a - b);
  const priceWon = median(prices);
  rows.push({ gu, priceWon, n: prices.length, years: priceWon / salaryWon });
}
rows.sort((a, b) => b.years - a.years || (a.gu < b.gu ? -1 : 1));

const ms = [...months].sort();
const period = `${ms[0].slice(0, 4)}.${ms[0].slice(4)}~${ms[ms.length - 1].slice(4)}`;
const fmtEok = (won) => (won / 1e8).toFixed(1);
const fmtYears = (y) => y.toFixed(1);

const top = rows.slice(0, TOP);
const last = rows[rows.length - 1];

/* ── ③ 카드 (ranking-table@1 계약 그대로) ──
 * 제목은 34자 제한 → 두 줄로 나눠 담는다.
 * value = 모으는 햇수(주 지표), sub = 84㎡ 중위 실거래가(근거). */
const card = {
  template: "ranking-table@1",
  date,
  variant: "a",
  badge: "서울 · 34평",
  title: "월급 안 쓰고 모으면\n서울 34평까지 몇 년?",
  // ⚠️ 캡션이 인용할 수치는 카드에도 있어야 한다(검수기가 대조한다).
  //    표에는 상위 16곳만 실으므로 '최저값'을 여기에 적어 독자가 눈으로 확인할 수 있게 한다.
  subtitle: `84㎡ 중위가 ÷ 연봉 ${(salaryWon / 1e8).toFixed(2)}억 · 최저 ${last.gu} ${fmtYears(last.years)}년`,
  nameLabel: "자치구",
  valueLabel: "모으는 기간",
  subLabel: "중위가",
  // 자치구엔 로고가 없다 — 첫 글자 원은 정보가 아니라 얼룩이다
  hideMark: true,
  // 1위가 '잘한 것'이 아니다(가장 비싼 곳). 메달을 달면 뜻이 뒤집힌다
  plainRank: true,
  items: top.map((r) => ({
    name: r.gu,
    value: `${fmtYears(r.years)}년`,
    sub: `${fmtEok(r.priceWon)}억`,
  })),
  source: {
    name: `국토부 실거래(${period}) · DART 평균급여 ${(salaryWon / 1e8).toFixed(2)}억(2025) · 세금·생활비 0원 가정`,
    asOf: date,
  },
};

/* 검수·추적용 부속 정보. 렌더는 안 쓰지만 오보 0의 근거가 된다. */
const audit = {
  slug: "years-to-buy",
  verified,
  salaryWon,
  salaryBasis: `DART ${sal.rows.length}개사 1인 평균급여액 중위값`,
  period,
  minTrades: MIN_TRADES,
  guCount: rows.length,
  provenance: [
    "data/datasets/molit/11*-2026??.json",
    "data/datasets/avg-salary-2025.json",
    "scripts/build-years-to-buy.mjs",
  ],
  disclaimer:
    "세금·생활비를 한 푼도 안 쓴다는 가정의 단순 계산. 대기업 10곳 연봉 기준이라 전 국민 평균이 아니다. 투자 권유·미래 전망 아님.",
  rows: rows.map((r) => ({ gu: r.gu, priceWon: r.priceWon, n: r.n, years: Number(r.years.toFixed(2)) })),
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "years-to-buy.json");
writeFileSync(outPath, JSON.stringify(card, null, 2) + "\n", "utf8");
// ⚠️ data/content 에는 **카드만** 둔다. 다른 JSON을 두면 관제탑이 그것도 카드로 세서
//    '실험 렌더'가 하나 더 생긴다(2026-07-26에 실제로 그랬다). 감사 자료는 검수 폴더로.
const auditDir = join(ROOT, "data/review");
mkdirSync(auditDir, { recursive: true });
writeFileSync(join(auditDir, "years-to-buy.audit.json"), JSON.stringify(audit, null, 2) + "\n", "utf8");

console.log(`💸 월급으로 사는 데 몇 년 — ${outPath}`);
console.log(`   연봉 기준 ${(salaryWon / 1e8).toFixed(2)}억 (DART ${sal.rows.length}개사 중위)`);
console.log(`   실거래 ${period} · 84㎡대 표본 ${MIN_TRADES}건 이상인 구 ${rows.length}곳`);
for (const r of top.slice(0, 5)) {
  console.log(`   ${r.gu.padEnd(5)} ${fmtEok(r.priceWon)}억 → ${fmtYears(r.years)}년 (표본 ${r.n})`);
}
console.log(`   …최소 ${last.gu} ${fmtYears(last.years)}년`);
