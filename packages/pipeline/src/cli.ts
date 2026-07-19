#!/usr/bin/env node
import { closeBrowser } from "@wirit/renderer";
import { buildMarketUs } from "./buildMarket.js";

/**
 * 사용법: build-market-us --raw <us-market.json 경로>
 * raw 수집물에서 "간밤의 미국 증시" 카드를 자동 생성·렌더한다.
 */
function parseArgs(argv: string[]): { raw?: string } {
  let raw: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--raw") raw = argv[++i];
  }
  return { raw };
}

async function main(): Promise<void> {
  const { raw } = parseArgs(process.argv.slice(2));
  if (!raw) {
    console.error("❌ --raw <us-market.json> 가 필요합니다.");
    process.exit(1);
  }
  console.log(`🏭 카드 자동 생성: ${raw}`);
  const { contentPath, outputs } = await buildMarketUs(raw);
  await closeBrowser();
  console.log(`✅ 콘텐츠 JSON: ${contentPath}`);
  for (const o of outputs) console.log(`✅ 카드 PNG: ${o}`);
}

main().catch((err) => {
  console.error(`실패: ${err instanceof Error ? err.message : err}`);
  void closeBrowser();
  process.exit(1);
});
