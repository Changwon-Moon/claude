/**
 * 캡션 고정 서명 — 모든 캡션 맨 아래에 위릿노트 3줄을 같은 자리에 붙인다.
 *
 * ── 왜 (2026-08-01 오너 "맨 아래 3줄짜리 위릿노트 설명을 고정으로 박아두려고")
 * 계정 소개 3줄은 **모든 게시물에서 같아야** 브랜드로 굳는다. 캡션마다 손으로 적으면
 * 한 글자씩 달라지고, 문구를 바꿀 때 열 몇 개를 다 고쳐야 한다.
 * 원천은 `data/review/captions/_signature.txt` **한 곳**이고, 이 스크립트가 뿌린다.
 *
 * 자리: 출처 블록 다음, **해시태그 바로 위**.
 *   해시태그는 항상 마지막이어야 한다(인스타에서 접힘 아래로 밀어 넣는 자리).
 *   서명이 태그 아래로 가면 접혀서 안 보인다.
 *
 * 실행: node scripts/apply-signature.mjs [--check]
 *   --check  고칠 것이 있으면 종료코드 1 (CI·확정 스크립트에서 쓴다)
 *
 * 되돌려 붙여도 안전하다(멱등) — 이미 있으면 그 자리에서 최신 문구로 갈아끼운다.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "data/review/captions");
const SIG_FILE = join(DIR, "_signature.txt");
const checkOnly = process.argv.includes("--check");

const SIG = readFileSync(SIG_FILE, "utf8").trim();
/** 서명 첫 줄(구분자)로 기존 서명 블록을 찾는다 — 문구가 바뀌어도 자리를 잡는다 */
const MARK = SIG.split("\n")[0];

const files = readdirSync(DIR).filter((f) => f.endsWith(".txt") && !f.startsWith("_"));
let changed = 0;

for (const f of files) {
  const p = join(DIR, f);
  const orig = readFileSync(p, "utf8");
  const lines = orig.replace(/\s+$/, "").split("\n");

  // ① 기존 서명 블록 제거 (구분자 줄부터 서명 줄 수만큼)
  const at = lines.findIndex((l) => l.trim() === MARK);
  if (at >= 0) lines.splice(at, SIG.split("\n").length);

  // ② 해시태그 줄 찾기 — 없으면 맨 끝
  let tagAt = lines.findIndex((l) => /^\s*#\S/.test(l));
  const body = (tagAt >= 0 ? lines.slice(0, tagAt) : lines).join("\n").replace(/\s+$/, "");
  const tags = tagAt >= 0 ? lines.slice(tagAt).join("\n").trim() : "";

  const next = `${body}\n\n${SIG}\n${tags ? "\n" + tags + "\n" : ""}`;
  if (next !== orig) {
    changed++;
    if (!checkOnly) writeFileSync(p, next, "utf8");
    console.log(`${checkOnly ? "· 서명 필요" : "✅ 서명 반영"} — ${f}`);
  }
}

console.log(
  changed === 0
    ? `✅ 캡션 ${files.length}개 전부 서명이 제자리에 있습니다`
    : `${checkOnly ? "⚠️" : "✅"} ${changed}/${files.length}개 ${checkOnly ? "가 서명과 어긋납니다" : "에 서명을 반영했습니다"}`,
);
process.exit(checkOnly && changed ? 1 : 0);
