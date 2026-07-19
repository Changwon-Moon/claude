/**
 * DART 평균연봉 데이터셋 생성 CLI (Actions에서 실행 — 네트워크·키 필요).
 *   DART_API_KEY=xxx tsx src/dartCli.ts <year> <corpCode.xml> <회사목록.json> <out.json>
 * 회사목록.json: { "companies": ["삼성전자", ...] } 또는 데이터셋(rows[].name) 재사용 가능.
 * 산출: verified 데이터셋(1인 평균급여액). 첫 수집분은 품질검수(1~2개사 원문 대조) 후 사용.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseCorpCodeXml } from "./parse/dart.js";
import { collectSalaries } from "./sources/dartSalary.js";

const CWD = process.env.INIT_CWD || process.cwd();
const fromCwd = (p: string): string => resolve(CWD, p);

async function main() {
  const [year, corpXmlPath, companiesPath, outPath] = process.argv.slice(2);
  const key = process.env.DART_API_KEY;
  if (!year || !corpXmlPath || !companiesPath || !outPath) {
    console.error("사용법: DART_API_KEY=... tsx src/dartCli.ts <year> <corpCode.xml> <회사목록.json> <out.json>");
    process.exit(1);
  }
  if (!key) {
    console.error("DART_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }

  const corpMap = parseCorpCodeXml(readFileSync(fromCwd(corpXmlPath), "utf8"));
  const src = JSON.parse(readFileSync(fromCwd(companiesPath), "utf8"));
  const names: string[] = src.companies ?? (src.rows ?? []).map((r: any) => r.name);
  console.log(`corp_code ${corpMap.size}개 로드, 대상 ${names.length}개사`);

  const { got, missed } = await collectSalaries(names, corpMap, year, key);

  const rows = got
    .map((r) => ({
      name: r.corpName,
      avgSalaryWon: r.avgSalaryWon,
      avgSalaryManwon: Math.round(r.avgSalaryWon / 10000),
      headcount: r.headcount,
    }))
    .sort((a, b) => b.avgSalaryWon - a.avgSalaryWon);

  const dataset = {
    meta: {
      title: `대기업 평균연봉 (${year})`,
      source: "금융감독원 전자공시 DART — 사업보고서 직원현황(1인 평균급여액)",
      sourceUrl: "https://opendart.fss.or.kr",
      asOf: year,
      collectedAt: new Date().toISOString().slice(0, 10),
      verified: false,
      perishable: false,
      basis: "empSttus 1인 평균급여액(가중평균). 첫 수집분은 사람이 1~2개사 DART 원문 대조 후 verified=true로.",
    },
    rows,
  };
  writeFileSync(fromCwd(outPath), JSON.stringify(dataset, null, 2) + "\n");
  console.log(`\n✅ ${rows.length}개사 수집 → ${outPath}`);
  rows.forEach((r) => console.log(`  · ${r.name}: ${r.avgSalaryManwon.toLocaleString()}만원 (${r.headcount}명)`));
  if (missed.length) {
    console.log(`\n⚠️ 미수집 ${missed.length}건:`);
    missed.forEach((m) => console.log("  ·", m));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
