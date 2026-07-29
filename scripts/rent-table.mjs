/**
 * 전월세 연도별 변화 표 — **지수와 실제 금액을 나란히** 놓는다.
 *
 * ── 왜 나란히 놓는가 (2026-07-29)
 * 같은 시장을 두 가지로 잴 수 있고, 둘이 다른 이야기를 한다:
 *   · 가격지수  = 품질조정된 표본 지수. 통계청·부동산원이 "상승률"이라 부르는 것
 *   · 평균가격  = 실제 계약 금액. 언론의 "서울 월세 150만원 시대"가 이것
 * 어느 쪽도 틀리지 않았다. **재는 것이 다르다.** 카드에 쓸 쪽을 눈으로 고르고,
 * 고른 쪽을 캡션에 밝히기 위해 둘을 같은 표에 올린다.
 *
 * 실행: node scripts/rent-table.mjs [지역코드]
 * 출력: 터미널 표 + data/review/rent-table.md (오너가 눈으로 보는 판)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));

/** 서울 = R-ONE 지역코드 500008. 이름으로 집지 않는다 — 동명 구가 여럿이다. */
const CODE = process.argv[2] || "500008";
const NAME = doc.regionNames?.[CODE] || CODE;
/** 임대차 2법(계약갱신청구권·전월세상한제) 시행 */
const LAW = "2020-07";

const SERIES = [
  ["전세지수", doc.jeonse?.[CODE], "index"],
  ["월세지수", doc.wolse?.[CODE], "index"],
  ["월세통합지수", doc.wolseAll?.[CODE], "index"],
  ["평균전세액", doc.avgJeonse?.[CODE], "amount"],
  ["평균월세액", doc.avgWolse?.[CODE], "amount"],
];

const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const ms = (s) => Object.keys(s || {}).sort();
const pct = (a, b) => (a == null || b == null || a === 0 ? null : Math.round(((b - a) / a) * 1000) / 10);
const f = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`);

/** 마지막 관측월 (전 계열 공통 기준) */
const LAST = SERIES.map(([, s]) => ms(s).pop()).filter(Boolean).sort().pop();

/* ── 연도별 변화율: 전년 12월 → 당해 12월. 마지막 해는 관측된 마지막 달까지(부분) ── */
const YEARS = [];
for (let y = 2004; y <= Number(LAST.slice(0, 4)); y++) YEARS.push(y);
const rows = YEARS.map((y) => {
  const partial = y === Number(LAST.slice(0, 4));
  const to = partial ? LAST : `${y}-12`;
  const from = `${y - 1}-12`;
  return { y, partial, cells: SERIES.map(([, s]) => pct(at(s, from), at(s, to))) };
});

/* ── 구간 요약: 각 계열의 시작 → 법 시행 → 마지막 ── */
function span(s, a, b) {
  const x = at(s, a);
  const z = at(s, b);
  if (x == null || z == null) return null;
  const yrs = (Number(b.slice(0, 4)) * 12 + Number(b.slice(5)) - (Number(a.slice(0, 4)) * 12 + Number(a.slice(5)))) / 12;
  return {
    total: Math.round(((z - x) / x) * 1000) / 10,
    cagr: yrs > 0 ? Math.round((Math.pow(z / x, 1 / yrs) - 1) * 10000) / 100 : null,
    yrs: Math.round(yrs * 10) / 10,
    from: a,
    to: b,
    fromV: x,
    toV: z,
  };
}

/** 금액 표시 — 원 단위로 오는지 만원 단위로 오는지 데이터 크기로 판단한다(추측 금지) */
function money(v) {
  if (v == null) return "—";
  if (v >= 100000) return `${Math.round(v / 10000).toLocaleString("ko-KR")}만원`; // 원 단위
  if (v >= 1000) return `${Math.round(v).toLocaleString("ko-KR")}만원`; // 만원 단위(전세)
  return `${Math.round(v).toLocaleString("ko-KR")}만원`; // 만원 단위(월세)
}

/* ── 출력 ── */
const md = [];
const p = (line = "") => {
  console.log(line);
  md.push(line);
};

p(`# 서울 아파트 전월세 — 연도별 변화 (지수 vs 실제 금액)`);
p();
p(`- 지역: **${NAME}** (R-ONE 지역코드 ${CODE})`);
p(`- 출처: ${doc.meta?.source}`);
p(`- 기준: **${LAST}** 까지 · 연도별은 전년 12월 → 당해 12월`);
p(`- 기준선: **${LAW}** 임대차 2법(계약갱신청구권·전월세상한제) 시행`);
p();
p(`## 계열별 관측 구간`);
p();
p(`| 계열 | 무엇을 재나 | 구간 | 개월 |`);
p(`|---|---|---|---:|`);
for (const [label, s, kind] of SERIES) {
  const k = ms(s);
  const what = kind === "index" ? "품질조정 지수 (2021.6=100)" : "실제 계약 평균 금액";
  p(`| ${label} | ${what} | ${k.length ? `${k[0]} ~ ${k[k.length - 1]}` : "자료 없음"} | ${k.length} |`);
}
p();
p(`## 연도별 변화율`);
p();
p(`| 연도 | ${SERIES.map(([l]) => l).join(" | ")} |`);
p(`|---:|${SERIES.map(() => "---:").join("|")}|`);
for (const r of rows) {
  p(`| ${r.y}${r.partial ? ` (${LAST.slice(5)}월까지)` : ""} | ${r.cells.map(f).join(" | ")} |`);
}
p();
p(`## 법 시행 전후 비교`);
p();
p(`| 계열 | 시행 전 | 시행 후 (~${LAST}) |`);
p(`|---|---|---|`);
for (const [label, s] of SERIES) {
  const k = ms(s);
  if (!k.length) {
    p(`| ${label} | 자료 없음 | 자료 없음 |`);
    continue;
  }
  const b = span(s, k[0], LAW);
  const a = span(s, LAW, k[k.length - 1]);
  const cell = (x) => (x ? `${x.from}→${x.to} · **${x.total > 0 ? "+" : ""}${x.total}%** (연 ${x.cagr}%, ${x.yrs}년)` : "자료 없음");
  p(`| ${label} | ${cell(b)} | ${cell(a)} |`);
}
p();
p(`## 실제 금액 — 얼마에서 얼마로`);
p();
const amounts = SERIES.filter(([, s, kind]) => kind === "amount" && ms(s).length);
if (!amounts.length) {
  p(`> ⚠️ 금액 계열이 비어 있습니다. 수집 로그의 '항목' 목록을 확인하세요.`);
} else {
  p(`| 계열 | 시작 | 법 시행 시점 | 지금 (${LAST}) |`);
  p(`|---|---|---|---|`);
  for (const [label, s] of amounts) {
    const k = ms(s);
    p(`| ${label} | ${k[0]} ${money(at(s, k[0]))} | ${money(at(s, LAW))} | **${money(at(s, k[k.length - 1]))}** |`);
  }
}
p();
p(`---`);
p(`*수치는 전부 코드로 추출했습니다. 감사 기록: \`data/review/rent-index.audit.json\`*`);

const dir = join(ROOT, "data/review");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "rent-table.md"), md.join("\n") + "\n", "utf8");
console.log(`\n🗂  data/review/rent-table.md`);
