#!/usr/bin/env node
import { runAll } from "./run.js";

/**
 * 사용법:
 *   collect [--date YYYY-MM-DD]
 * 기본 날짜는 오늘(UTC). GitHub Actions cron 이 매일 실행한다.
 */
function parseArgs(argv: string[]): { date: string } {
  let date = new Date().toISOString().slice(0, 10);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--date") date = argv[++i];
  }
  return { date };
}

async function main(): Promise<void> {
  const { date } = parseArgs(process.argv.slice(2));
  console.log(`📥 수집 시작 (${date})`);
  const report = await runAll(date);
  console.log(
    `\n요약: 성공 ${report.ok.length} [${report.ok.join(", ")}] / 실패 ${report.failed.length}`,
  );
  // 전부 실패면 비정상 종료(알림 트리거). 일부 성공이면 0 종료(부분 수집 허용).
  if (report.ok.length === 0) process.exit(1);
}

main().catch((err) => {
  console.error(`수집 오류: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
