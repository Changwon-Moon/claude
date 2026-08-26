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
import { scopeMatch } from "./scopeChecks.js";
import { llmAvailability, reviewImage } from "./llmReview.js";
import { decideVerdict } from "./types.js";
import type { Finding, CardResult, ReviewReport } from "./types.js";

const CWD = process.env.INIT_CWD || process.cwd();

function md5(p: string): string {
  return createHash("md5").update(readFileSync(p)).digest("hex");
}

/**
 * 관제탑(`data/review/sets.json`)에서 이 세트의 캡션 교차검증 허용값을 읽는다.
 *
 * 형식: `"captionCrossCheck": [{ "value": "3.1", "why": "같은 평형 분양권 실거래 기준 마진" }]`
 * `why` 가 없는 항목은 **허용하지 않고 error 로 올린다** — 예외에는 항상 이유가 붙어야 한다.
 * 파일이 없거나 세트가 없으면 조용히 빈 목록이다(검사는 원래대로 깐깐하게 돈다).
 */
function readCaptionCrossCheck(label: string): { ok: { value: string; why: string }[]; bad: string[] } {
  /* ⚠️ 이 CLI 는 `packages/pipeline` 을 cwd 로 돌아간다(produce-card.mjs). 저장소 루트를
     가정하면 파일을 못 찾고 **조용히 빈 목록**이 된다 — 예외가 안 먹힌 채 통과처럼 보인다.
     그래서 위로 올라가며 찾는다. */
  let path = "";
  for (let dir = CWD, i = 0; i < 6; i++, dir = join(dir, "..")) {
    const cand = join(dir, "data/review/sets.json");
    if (existsSync(cand)) { path = cand; break; }
  }
  if (!path) return { ok: [], bad: [] };
  try {
    const doc = JSON.parse(readFileSync(path, "utf8")) as { sets?: { label: string; captionCrossCheck?: unknown }[] };
    const raw = doc.sets?.find((s) => s.label === label)?.captionCrossCheck;
    if (!Array.isArray(raw)) return { ok: [], bad: [] };
    const ok: { value: string; why: string }[] = [];
    const bad: string[] = [];
    for (const e of raw as { value?: unknown; why?: unknown }[]) {
      const value = e?.value == null ? "" : String(e.value);
      const why = typeof e?.why === "string" ? e.why.trim() : "";
      if (!value) continue;
      if (why) ok.push({ value, why });
      else bad.push(value);
    }
    return { ok, bad };
  } catch {
    return { ok: [], bad: [] };
  }
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
      const lenses = ["design", "reference", "adversarial"];
      const { results, note } = await reviewImage(png, undefined, lenses);
      if (note !== "ok") setFindings.push({ reviewer: "llm", level: "info", code: "llm-note", msg: note });
      results.forEach((lr) => findings.push(...lr.findings));
    }

    cardResults.push({ file: basename(c), deterministic, qaErrors, findings, png: r1.outputs[0] });
  }

  // 4-0) 범위 정합 — 캡션과 무관하다. 캡션이 없어도 반드시 본다.
  setFindings.push(...scopeMatch(cardDocs));

  // 4) 캡션 검수(세트 레벨)
  if (captionText) {
    setFindings.push(...lintCaption(captionText));
    /* 캡션이 카드에 없는 억 금액을 말해야 할 때가 있다 — 안전마진 판형에서 카드가 호가로
       가면 캡션이 실거래 기준을 함께 실어야 한다(오보를 막는 장치다). 그건 정의상 카드에
       없다. 검사를 끄는 대신 **관제탑에 값과 이유를 적게** 한다. 이유가 없으면 안 통과한다. */
    const cross = readCaptionCrossCheck(label);
    for (const c of cross.bad)
      setFindings.push({ reviewer: "caption-number", level: "error", code: "crosscheck-no-reason",
        msg: `sets.json 의 captionCrossCheck 항목 "${c}" 에 이유(why)가 없습니다 — 이유 없는 예외는 통과시키지 않습니다` });
    for (const c of cross.ok)
      setFindings.push({ reviewer: "caption-number", level: "info", code: "crosscheck-allowed",
        msg: `캡션 교차검증값 ${c.value}억 허용 — ${c.why}` });
    setFindings.push(...captionNumberMatch(captionText, cardDocs, cross.ok.map((c) => c.value)));
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
