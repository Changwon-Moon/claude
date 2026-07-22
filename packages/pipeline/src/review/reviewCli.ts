/**
 * 검수 오케스트레이터 — 콘텐츠 세트(커버+표+캡션)를 에이전트끼리 검수한다.
 *
 *   tsx src/review/reviewCli.ts <card1.json> <card2.json> ... [--caption cap.txt] [--label 이름] [--out dir]
 *
 * 단계: 렌더(이중=결정성) → designQa(레이아웃) → 캡션 린트·수치대조 → (키 있으면) LLM 채점
 * → 판정(pass/revise/block) → 리포트 JSON 저장·출력. block이면 종료코드 1(발행 차단).
 * 코드 검수는 키 없이 항상 동작. LLM 검수는 ANTHROPIC_API_KEY 있을 때만.
 */
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve, basename } from "node:path";
import { renderContentFile, runDesignQa, closeBrowser } from "@wirit/renderer";
import { lintCaption, captionNumberMatch } from "./captionChecks.js";
import { llmAvailability, reviewImage } from "./llmReview.js";
import { decideVerdict } from "./types.js";
import type { Finding, CardResult, ReviewReport } from "./types.js";

const CWD = process.env.INIT_CWD || process.cwd();

function md5(p: string): string {
  return createHash("md5").update(readFileSync(p)).digest("hex");
}

async function main() {
  const argv = process.argv.slice(2);
  const cards: string[] = [];
  let captionPath = "";
  let label = "review";
  let outDir = "";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") continue;
    else if (a === "--caption") captionPath = argv[++i];
    else if (a === "--label") label = argv[++i];
    else if (a === "--out") outDir = argv[++i];
    else cards.push(a);
  }
  if (!cards.length) {
    console.error("사용법: tsx src/review/reviewCli.ts <card.json ...> [--caption cap.txt] [--label 이름] [--out dir]");
    process.exit(2);
  }

  const setFindings: Finding[] = [];
  const cardResults: CardResult[] = [];
  const cardDocs: unknown[] = [];

  const llm = llmAvailability();
  const captionText = captionPath && existsSync(resolve(CWD, captionPath))
    ? readFileSync(resolve(CWD, captionPath), "utf8")
    : "";

  for (const c of cards) {
    const cp = resolve(CWD, c);
    const doc = JSON.parse(readFileSync(cp, "utf8"));
    cardDocs.push(doc);
    const findings: Finding[] = [];

    // 1) 결정성(이중 렌더 해시)
    const d1 = mkdtempSync(join(tmpdir(), "wr1-"));
    const d2 = mkdtempSync(join(tmpdir(), "wr2-"));
    const r1 = await renderContentFile(cp, d1);
    const r2 = await renderContentFile(cp, d2);
    const deterministic =
      r1.outputs.length === r2.outputs.length &&
      r1.outputs.every((p, i) => md5(p) === md5(r2.outputs[i]));
    if (!deterministic)
      findings.push({ reviewer: "determinism", level: "error", code: "nondeterministic", msg: "이중 렌더 결과가 다릅니다(타임스탬프·랜덤 요소 의심)" });

    // 2) 레이아웃 검수
    const qa = await runDesignQa(cp);
    let qaErrors = 0;
    for (const q of qa) {
      if (q.level === "error") qaErrors++;
      findings.push({ reviewer: "design-qa", level: q.level, code: q.code, msg: q.msg });
    }

    // 3) LLM 디자인·적대적 렌즈(키 있을 때)
    if (llm.ok) {
      const png = r1.outputs[0];
      const lenses = ["design", "adversarial"];
      const { results, note } = await reviewImage(png, undefined, lenses);
      if (note !== "ok") setFindings.push({ reviewer: "llm", level: "info", code: "llm-note", msg: note });
      results.forEach((lr) => findings.push(...lr.findings));
    }

    cardResults.push({ file: basename(c), deterministic, qaErrors, findings, png: r1.outputs[0] });
  }

  // 4) 캡션 검수(세트 레벨)
  if (captionText) {
    setFindings.push(...lintCaption(captionText));
    setFindings.push(...captionNumberMatch(captionText, cardDocs));
    if (llm.ok && cardResults[0]?.png) {
      const { results } = await reviewImage(cardResults[0].png, captionText, ["copy"]);
      results.forEach((lr) => setFindings.push(...lr.findings));
    }
  } else {
    setFindings.push({ reviewer: "caption-lint", level: "info", code: "no-caption", msg: "캡션 미제공 — 캡션 검수 생략(--caption로 전달)" });
  }

  await closeBrowser();

  const allFindings = [...setFindings, ...cardResults.flatMap((c) => c.findings)];
  const verdict = decideVerdict(allFindings);
  const nErr = allFindings.filter((f) => f.level === "error").length;
  const nWarn = allFindings.filter((f) => f.level === "warn").length;
  const summary = `${verdict.toUpperCase()} — error ${nErr} · warn ${nWarn} · 카드 ${cardResults.length}장${llm.ok ? " · LLM 검수 포함" : " · 코드 검수만"}`;

  const report: ReviewReport = {
    label,
    verdict,
    summary,
    findings: setFindings,
    cards: cardResults.map((c) => ({ ...c, png: undefined })),
    llm: { available: llm.ok, note: llm.note },
  };

  const dir = outDir ? resolve(CWD, outDir) : resolve(CWD, "data/review");
  mkdirSync(dir, { recursive: true });
  const reportPath = join(dir, `${label}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");

  // 콘솔 출력
  const icon = { error: "❌", warn: "⚠️", info: "ℹ️" } as const;
  console.log(`\n🧪 검수: ${label}`);
  console.log(`   ${llm.note}`);
  for (const c of cardResults) {
    console.log(`\n  📄 ${c.file}  ${c.deterministic ? "결정성✓" : "결정성✗"}  QA에러 ${c.qaErrors}`);
    c.findings.forEach((f) => console.log(`     ${icon[f.level]} [${f.reviewer}] ${f.msg}`));
  }
  if (setFindings.length) {
    console.log(`\n  📝 세트/캡션`);
    setFindings.forEach((f) => console.log(`     ${icon[f.level]} [${f.reviewer}] ${f.msg}`));
  }
  console.log(`\n  → 판정: ${summary}`);
  console.log(`  → 리포트: ${reportPath}\n`);

  process.exit(verdict === "block" ? 1 : 0);
}

main().catch((e) => {
  console.error("검수 실패:", e);
  process.exit(2);
});
