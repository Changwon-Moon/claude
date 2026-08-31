#!/usr/bin/env node
/**
 * STATUS 부피 감시 — "지금 상태"가 다시 서사 창고가 되는 것을 잡는다.
 *
 * 왜 필요한가:
 *   2026-08-08 에 STATUS.md 764줄을 archive 로 비우고 "여기엔 지금 상태 + 다음 할 일만 둔다"
 *   고 파일 첫머리에 적었다. **3주 만에 서사 13블록 578줄이 다시 쌓였다.**
 *   문서가 자기 규칙을 어기고 있었는데 아무도 재지 않아서 아무도 몰랐다.
 *
 *   손으로 옮기는 정리는 언젠가 멈춘다. 멈춘 뒤에는 아무도 눈치채지 못한다.
 *   그래서 센다. 옛 실수를 두 번 하지 않는 방법은 규칙을 다시 적는 게 아니라 재는 것이다.
 *
 * 왜 자동으로 안 옮기나:
 *   서사 블록에는 「이 날 굳은 것 (되돌리지 말 것)」 같은 **확정 규칙**이 섞여 있다.
 *   기계가 옮기면 그 규칙이 사료로 내려가 아무도 안 읽는다.
 *   → 옮기기 전에 **각 정본으로 승격**하는 판단이 필요하다. 그건 사람 몫이다.
 *   이 스크립트는 **말만 한다.**
 *
 * 쓰는 법:
 *   node scripts/prune-status.mjs            # 세기만 한다
 *   node scripts/prune-status.mjs --strict   # 넘치면 종료코드 1
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "STATUS.md");

/** 서사 블록은 몇 개까지 두나 — 최근 것 몇 개는 다음 세션이 이어받는 데 필요하다 */
const MAX_BLOCKS = 3;
/** 전체 줄수 상한 — 2026-08-31 정리 직후가 108줄이었다 */
const MAX_LINES = 200;

if (!existsSync(FILE)) {
  console.log("⏭  STATUS.md 가 없습니다");
  process.exit(0);
}

const text = readFileSync(FILE, "utf8");
const lines = text.split("\n");
/* 서사 블록 = 인용문 안의 날짜 제목 (`> ## ✅ 2026-08-31 — …`) */
const blocks = lines.filter((l) => /^>\s*##\s/.test(l));

const over = blocks.length > MAX_BLOCKS || lines.length > MAX_LINES;

console.log(`\nSTATUS 부피 — ${lines.length}줄 / 서사 블록 ${blocks.length}개`);
console.log(`  기준: ${MAX_LINES}줄 · 블록 ${MAX_BLOCKS}개 이하`);

if (!over) {
  console.log("✅ STATUS 가 '지금 상태'로 유지되고 있습니다\n");
  process.exit(0);
}

console.log(`\n⚠️  STATUS 가 다시 부풀고 있습니다.\n`);
for (const b of blocks.slice(MAX_BLOCKS)) {
  console.log(`    ${b.replace(/^>\s*##\s*/, "").slice(0, 70)}`);
}
console.log(`
  옮기기 전에 **먼저 건져낸다** — 이 순서를 뒤집으면 규칙이 사료에 묻힌다:
   ① 블록 안의 「되돌리지 말 것」·「굳은 규칙」을 각 정본으로 승격
      (카드 절차 → docs/CARD_CHECKLIST.md · 캡션 → docs/CAPTION.md ·
       세션 규칙 → CLAUDE.md · 소재 판단 → company/CEO.md)
   ② 남은 서사를 docs/archive/STATUS-history.md 로 이동
   ③ STATUS.md 에는 '지금 상태 + 다음 할 일'만 남긴다
`);
process.exit(process.argv.includes("--strict") ? 1 : 0);
