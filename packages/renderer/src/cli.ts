#!/usr/bin/env node
import path from "node:path";
import { renderContentFile } from "./renderContent.js";
import { closeBrowser } from "./screenshot.js";
import { DEFAULT_OUT_DIR } from "./paths.js";

/**
 * 사용법:
 *   wirit-render --data <콘텐츠.json> [--out <출력폴더>]
 *
 * 예:
 *   pnpm --filter @wirit/renderer render -- --data templates/dummy-card/sample.json --out data/out
 */
function parseArgs(argv: string[]): { data?: string; out: string } {
  let data: string | undefined;
  let out = DEFAULT_OUT_DIR;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--data" || a === "-d") data = argv[++i];
    else if (a === "--out" || a === "-o") out = argv[++i];
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return { data, out };
}

function printHelp(): void {
  console.log(`
wirit 카드 렌더러 — 콘텐츠 JSON을 인스타 카드 PNG로 변환

사용법:
  wirit-render --data <콘텐츠.json> [--out <출력폴더>]

옵션:
  --data, -d   렌더할 콘텐츠 JSON 경로 (필수)
  --out,  -o   PNG 출력 폴더 (기본: data/out)
  --help, -h   이 도움말
`);
}

async function main(): Promise<void> {
  const { data, out } = parseArgs(process.argv.slice(2));
  if (!data) {
    console.error("❌ --data <콘텐츠.json> 가 필요합니다. (--help 참고)");
    process.exit(1);
  }

  const contentPath = path.resolve(process.cwd(), data);
  const outDir = path.resolve(process.cwd(), out);

  console.log(`🎨 렌더 시작: ${contentPath}`);
  const result = await renderContentFile(contentPath, outDir);
  await closeBrowser();

  console.log(`✅ 완료 — 템플릿 "${result.template}", ${result.outputs.length}장:`);
  for (const p of result.outputs) console.log(`   • ${p}`);
}

main().catch((err) => {
  console.error(`\n❌ 렌더 실패:\n${err instanceof Error ? err.message : err}`);
  void closeBrowser();
  process.exit(1);
});
