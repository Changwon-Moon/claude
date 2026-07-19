import fs from "node:fs";
import path from "node:path";
import { rawDir } from "./paths.js";
import { collectUsMarket } from "./sources/usMarket.js";
import { collectKrRates } from "./sources/krRates.js";
import type { CollectionResult } from "./types.js";

/** 등록된 수집기. 하나가 실패해도 나머지는 계속 진행한다. */
const SOURCES: { name: string; run: () => Promise<CollectionResult> }[] = [
  { name: "us-market", run: collectUsMarket },
  { name: "kr-rates", run: collectKrRates },
  // P1(부동산 실거래가·청약)·P2(DART·KOSIS)는 이후 마일스톤에서 추가
];

export interface RunReport {
  date: string;
  ok: string[];
  failed: { source: string; error: string }[];
}

/** 모든 수집기 실행 → data/raw/{date}/{source}.json 저장. 실패는 모아서 리포트. */
export async function runAll(date: string): Promise<RunReport> {
  const dir = rawDir(date);
  fs.mkdirSync(dir, { recursive: true });

  const report: RunReport = { date, ok: [], failed: [] };

  for (const src of SOURCES) {
    try {
      const result = await src.run();
      const outPath = path.join(dir, `${src.name}.json`);
      fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
      report.ok.push(src.name);
      console.log(`✅ ${src.name} → ${outPath} (${result.quotes.length}종목)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      report.failed.push({ source: src.name, error: msg });
      console.error(`❌ ${src.name} 실패: ${msg}`);
    }
  }
  return report;
}
