/**
 * 세션 일지 — **지금 어느 세션이 무엇을 하고 있나**를 저장소에 남긴다.
 *
 * ── 왜 필요한가 (2026-08-06)
 * 여러 코워크 세션이 같은 저장소를 동시에 민다. 그런데 서로 뭘 하는지 모른다.
 * 오늘만 이런 일이 있었다:
 *   · 다른 세션이 공용 렌더러를 바꿔 오너 확정 카드 픽셀이 달라졌다
 *   · 브랜치가 몇 분 간격으로 밀려 검증 결과가 유실됐다
 *   · 같은 소재를 두 세션이 따로 설계했다(세제 카드)
 *
 * 문지기(guard)는 **망가지는 것**을 막는다. 이 일지는 **겹치는 것**을 막는다.
 * 둘은 다른 문제다.
 *
 * ── 왜 세션마다 파일을 따로 쓰나
 * 한 파일에 여러 세션이 쓰면 서로 덮어쓴다. 파일을 나누면 충돌이 없다.
 * 합치는 것은 읽을 때 한다(build-session-board.mjs).
 *
 * 쓰는 법:
 *   node scripts/session-log.mjs start "서울 생활인구 배관"
 *   node scripts/session-log.mjs update "probe 워크플로까지 완료"
 *   node scripts/session-log.mjs done   "커밋 7건 — 푸시는 막힘"
 *   node scripts/session-log.mjs block  "저장소 푸시 권한이 끊겼다"
 *
 * 세션 이름은 `WIRIT_SESSION` 환경변수로 고정할 수 있다.
 * 없으면 날짜+작업명으로 만든다 — 같은 세션이 이어서 쓰면 같은 파일에 쌓인다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "data/sessions");

const STATES = {
  start: "진행중",
  update: "진행중",
  done: "끝",
  block: "막힘",
};

const cmd = process.argv[2];
const text = process.argv.slice(3).join(" ").trim();

if (!cmd || !STATES[cmd]) {
  console.error("쓰는 법: node scripts/session-log.mjs <start|update|done|block> \"무엇을 하는지\"");
  console.error("  start  — 작업 시작할 때");
  console.error("  update — 중간에 한 줄 (여러 번 가능)");
  console.error("  done   — 끝냈을 때");
  console.error("  block  — 막혔을 때 (무엇에 막혔는지 적을 것)");
  process.exit(1);
}
if (!text) {
  console.error("❌ 무엇을 하는지 한 줄 적어야 합니다. 빈 일지는 없는 일지입니다.");
  process.exit(1);
}

/** 세션 이름 — 사람이 읽을 수 있게. 파일명으로 쓰므로 안전한 글자만 남긴다. */
const slug = (s) => String(s).replace(/[^0-9A-Za-z가-힣_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const now = new Date().toISOString();
const today = now.slice(0, 10);
const name = process.env.WIRIT_SESSION || `${today}-${slug(text).slice(0, 24)}`;
const file = join(DIR, `${slug(name)}.json`);

mkdirSync(DIR, { recursive: true });

let entry;
if (existsSync(file)) {
  entry = JSON.parse(readFileSync(file, "utf8"));
} else {
  entry = { session: name, startedAt: now, task: text, log: [] };
}

entry.status = STATES[cmd];
entry.updatedAt = now;
/* start 는 제목을 갈아 끼운다. update 는 제목을 유지하고 줄만 쌓는다 —
   중간 보고가 제목을 덮어쓰면 "무슨 작업이었는지"가 사라진다. */
if (cmd === "start") entry.task = text;
entry.last = text;
entry.log.push({ at: now, cmd, text });
/* 일지가 무한히 길어지면 아무도 안 읽는다. 최근 20줄만 남긴다. */
if (entry.log.length > 20) entry.log = entry.log.slice(-20);

writeFileSync(file, JSON.stringify(entry, null, 1) + "\n", "utf8");

console.log(`📋 ${entry.status} · ${entry.task}`);
console.log(`   ${text}`);
console.log(`   → ${file.replace(ROOT + "/", "")}`);
console.log("   (이 파일을 커밋해야 다른 세션이 봅니다)");
