/**
 * 발행 대기열 점검.
 *
 * 관제탑에서 [🚀 발행 승인]을 누르면 data/publish-queue.md 에 한 줄이 붙는다.
 *   - [ ] 미발행   - [x] 발행 완료
 *
 * 이 스크립트는 대기열을 읽어 "지금 올릴 수 있는 것"과 "아직 막힌 것"을 갈라 보여준다.
 * ⚠️ 업로드는 **오너가 직접** 한다(2026-07-27 결정). 여기서는 점검까지만 하고,
 *    올린 사실은 관제탑 [✅ 인스타에 올렸습니다]가 대기열에 체크로 남긴다.
 *
 * 막는 조건(오보 0 원칙):
 *   · 캡션 없음 → 올릴 글이 없다
 *   · 자동 검수 verdict 가 block → 수치·레이아웃에 오류가 잡혔다
 *
 * 실행: node scripts/check-publish-queue.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "data/publish-queue.md");
const REVIEW = join(ROOT, "data/review");
const SETS = join(REVIEW, "sets.json");

if (!existsSync(QUEUE)) {
  console.log("data/publish-queue.md 없음 — 아직 승인된 발행이 없습니다.");
  process.exit(0);
}

const raw = readFileSync(QUEUE, "utf8");
const lines = raw.split("\n");
const pending = lines.filter((l) => /^\s*-\s*\[ \]/.test(l));
const done = lines.filter((l) => /^\s*-\s*\[[xX]\]/.test(l));

console.log(`📮 발행 대기열 — 대기 ${pending.length}건 · 완료 ${done.length}건`);
if (!pending.length) process.exit(0);

// 세트 정의를 읽어 캡션·검수 상태를 대조한다
let sets = [];
if (existsSync(SETS)) {
  try {
    sets = JSON.parse(readFileSync(SETS, "utf8")).sets || [];
  } catch {
    /* 깨져 있으면 대조를 건너뛴다 */
  }
}

const ready = [];
const blocked = [];

for (const line of pending) {
  // "**제목**" 부분으로 세트를 찾는다
  const m = line.match(/\*\*(.+?)\*\*/);
  const title = m ? m[1] : line.replace(/^\s*-\s*\[ \]\s*/, "").slice(0, 60);
  const set = sets.find((s) => s.title === title || title.includes(s.label));

  const reasons = [];
  if (!set) {
    reasons.push("발행 세트 미등록 (data/review/sets.json 에 추가 필요)");
  } else {
    const capName = set.caption || set.label;
    if (!capName || !existsSync(join(REVIEW, "captions", `${capName}.txt`))) {
      reasons.push("캡션 없음");
    }
    const revName = set.review || set.label;
    const revPath = join(REVIEW, `${revName}.json`);
    if (existsSync(revPath)) {
      try {
        const v = JSON.parse(readFileSync(revPath, "utf8")).verdict;
        if (v === "block") reasons.push("자동 검수 BLOCK — 발행 금지");
      } catch {
        /* 리포트가 깨졌으면 없는 것으로 본다 */
      }
    } else {
      reasons.push("자동 검수 리포트 없음 (권장: pnpm --filter @wirit/pipeline review)");
    }
  }

  (reasons.length ? blocked : ready).push({ title, reasons });
}

if (ready.length) {
  console.log(`\n✅ 올릴 준비 완료 ${ready.length}건`);
  for (const r of ready) console.log(`   · ${r.title}`);
}
if (blocked.length) {
  console.log(`\n⏸ 아직 막힌 것 ${blocked.length}건`);
  for (const b of blocked) console.log(`   · ${b.title}\n     └ ${b.reasons.join(" / ")}`);
}

console.log(
  `\n※ 인스타 업로드는 오너가 직접 합니다. 올리신 뒤 관제탑에서 [✅ 인스타에 올렸습니다]를 눌러주세요\n` +
  `  — 그래야 발행일이 기록되고 완성본이 published/ 에 보관됩니다.\n` +
    `  그 버튼을 안 누르면 발행 사실이 어디에도 남지 않습니다.`
);

// 점검 결과를 대기열 파일 머리에 남겨, 관제탑·저장소에서 바로 읽히게 한다
const stamp = `<!-- 점검: 대기 ${pending.length} · 올릴 준비 ${ready.length} · 막힘 ${blocked.length} -->`;
const body = raw.replace(/^<!-- 점검:.*-->\n?/m, "");
writeFileSync(QUEUE, `${stamp}\n${body.replace(/^\n+/, "")}`, "utf8");
