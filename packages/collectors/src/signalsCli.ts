#!/usr/bin/env node
/**
 * 소재 보드 생성 CLI.
 * 사용: collect-signals [--date YYYY-MM-DD]
 * 출력: research/briefs/{date}-auto.md + data/raw/{date}/research-signals.json
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT, rawDir } from "./paths.js";
import { collectResearchSignals, renderBoard } from "./sources/researchSignals.js";

function parseArgs(argv: string[]): { date: string } {
  let date = new Date().toISOString().slice(0, 10);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--date") date = argv[++i];
  }
  return { date };
}

async function main(): Promise<void> {
  const { date } = parseArgs(process.argv.slice(2));
  console.log(`🔎 소재 신호 수집 (${date})`);

  const { signals, trendKeywords } = await collectResearchSignals();
  const ok = signals.filter((s) => !s.error);
  const failed = signals.filter((s) => s.error);
  const total = ok.reduce((n, s) => n + s.items.length, 0);
  const demandHits = ok.reduce(
    (n, s) => n + s.items.filter((i) => i.demand).length,
    0,
  );

  // JSON 원본 저장 (추후 R2 기획 에이전트의 입력)
  const jdir = rawDir(date);
  fs.mkdirSync(jdir, { recursive: true });
  fs.writeFileSync(
    path.join(jdir, "research-signals.json"),
    JSON.stringify({ date, trendKeywords, signals }, null, 2),
    "utf8",
  );

  // 소재 보드 마크다운
  const bdir = path.join(REPO_ROOT, "research", "briefs");
  fs.mkdirSync(bdir, { recursive: true });
  const boardPath = path.join(bdir, `${date}-auto.md`);
  fs.writeFileSync(boardPath, renderBoard(date, signals, trendKeywords), "utf8");

  console.log(`✅ 소재 보드: ${boardPath}`);
  console.log(
    `   주제 ${ok.length}개(항목 ${total}건, 수요신호📈 ${demandHits}건, 트렌드 키워드 ${trendKeywords.length}개), 실패 ${failed.length}개`,
  );
  for (const f of failed) console.log(`   ⚠️ ${f.topic}: ${f.error}`);
  if (ok.length === 0) process.exit(1); // 전부 실패 시 알림 트리거
}

main().catch((err) => {
  console.error(`실패: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
