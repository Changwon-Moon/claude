/**
 * 디자인 검수 CLI — 카드 콘텐츠(들)를 렌더해 레이아웃 문제를 자동 검출·보고한다.
 *   tsx src/qaCli.ts <content.json ...>
 * 문제(error)가 하나라도 있으면 종료코드 1 → CI/파이프라인에서 발행 차단 가능.
 */
import { resolve } from "node:path";
import { runDesignQa } from "./designQa.js";
import { closeBrowser } from "./screenshot.js";

const CWD = process.env.INIT_CWD || process.cwd();

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("사용법: tsx src/qaCli.ts <content.json ...>");
    process.exit(1);
  }
  let errors = 0;
  for (const a of args) {
    const p = resolve(CWD, a);
    console.log(`\n🧐 디자인 검수: ${a}`);
    try {
      const findings = await runDesignQa(p);
      if (!findings.length) {
        console.log("  ✅ 문제 없음 (정렬·여백·넘침 이상 없음)");
        continue;
      }
      findings.forEach((f) => {
        const icon = f.level === "error" ? "❌" : "⚠️";
        console.log(`  ${icon} [${f.code}] ${f.msg}`);
        if (f.level === "error") errors++;
      });
    } catch (e) {
      console.error(`  ⛔ 검수 실패: ${e instanceof Error ? e.message : e}`);
      errors++;
    }
  }
  await closeBrowser();
  console.log(`\n${errors ? "❌ 검수 실패 — 위 error 항목을 고치세요" : "✅ 검수 통과"} (error ${errors}건)`);
  process.exit(errors ? 1 : 0);
}

main();
