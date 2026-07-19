/**
 * data/datasets/avg-salary-{year}.json (DART 수집) → 평균연봉 ranking-table 콘텐츠.
 * 수치는 데이터셋(1차 출처)에서 코드로 추출. 동일 값은 공동순위. 로고는 자동 해결(Tier A).
 * 실행: node scripts/build-avgsalary-card.mjs <year> [date]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveLogo } from "./lib/logo-resolver.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const year = process.argv[2] || "2025";
const date = process.argv[3] || "2026-07-19";

const dsPath = join(ROOT, `data/datasets/avg-salary-${year}.json`);
if (!existsSync(dsPath)) {
  console.error(`데이터셋 없음: ${dsPath}\n먼저 dart-salary 워크플로로 수집하세요.`);
  process.exit(1);
}
const ds = JSON.parse(readFileSync(dsPath, "utf8"));

const fmt = (n) => n.toLocaleString("en-US");
const sorted = [...ds.rows].sort((a, b) => b.avgSalaryManwon - a.avgSalaryManwon).slice(0, 10);

let lastVal = null;
let lastRank = 0;
const items = sorted.map((r, i) => {
  const rank = r.avgSalaryManwon === lastVal ? lastRank : i + 1;
  lastVal = r.avgSalaryManwon;
  lastRank = rank;
  // 로고 자동 해결(Tier A: simple-icons). 없으면 이름 첫 글자 폴백(템플릿이 처리)
  const logo = resolveLogo(r.name);
  return {
    name: r.name,
    rank: String(rank),
    ...(logo ? { logo: logo.slug } : {}),
    value: fmt(r.avgSalaryManwon),
    sub: `${fmt(r.headcount)}명`,
  };
});

const content = {
  template: "ranking-table@1",
  date,
  subtitle: `금융감독원 전자공시(DART) · ${year} 사업보고서 · 직원 1인 평균급여액`,
  title: `${year} 대기업\n평균연봉 순위`,
  nameLabel: "기업",
  valueLabel: "평균연봉(만원)",
  subLabel: "직원수",
  items,
  source: { name: "금융감독원 전자공시 DART", asOf: year },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "avg-salary.json"), JSON.stringify(content, null, 2) + "\n");
console.log(`✅ avg-salary.json — ${items.length}개사 (${year} DART). 수치는 데이터셋에서 추출.`);
console.log(`   ${ds.meta.verified ? "verified ✓" : "⚠️ verified=false — 1~2개사 원문 대조 후 발행"}`);
