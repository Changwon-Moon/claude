#!/usr/bin/env node
/**
 * 소재 보드 건강 진단 — `research/ideas.json` 이 쌓이기만 하고 있지 않은가.
 *
 * 왜 필요한가 (2026-08-31 실측):
 *   소재가 **298건** 쌓여 있는데 그중
 *     · 날짜(`at`)가 있는 것 **10건** — 288건은 언제 들어왔는지 모른다
 *     · 상태(`state`)가 있는 것 **41건** — 257건은 채택인지 기각인지도 모른다
 *   나이도 반응도 모르면 **무엇을 지울지 정할 수가 없다.** 그래서 계속 쌓인다.
 *
 *   관제탑 화면에는 "아직 안 고른 것 260건"이라고만 뜬다. 숫자가 커질수록
 *   오너는 보드를 안 열게 되고, 안 열면 더 쌓인다.
 *
 * 왜 자동으로 안 지우나:
 *   `research/ideas.json` 은 **18곳이 읽는다**(관제탑·워크플로 4개·스크립트 10개).
 *   구조를 건드리면 무엇이 깨질지 예측하기 어렵고, 소재는 되살릴 방법이 git 뿐이다.
 *   → 이 스크립트는 **읽기만 한다.** 지우는 판단은 오너 몫이고,
 *      그 판단을 하려면 먼저 **보이게** 만들어야 한다.
 *
 * 쓰는 법:
 *   node scripts/ideas-health.mjs           # 진단
 *   node scripts/ideas-health.mjs --strict  # 기준을 넘으면 종료코드 1
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "research/ideas.json");

/** 이만큼 넘으면 "고르는 것보다 쌓이는 게 빠르다"는 신호다 */
const MAX_OPEN = 320;
/** 날짜를 모르는 것이 이 비율을 넘으면 정리 자체가 불가능해진다 */
const MAX_UNDATED_RATIO = 0.98;

if (!existsSync(FILE)) {
  console.log("⏭  research/ideas.json 이 없습니다");
  process.exit(0);
}

const data = JSON.parse(readFileSync(FILE, "utf8"));
const items = data.ideas || data.items || (Array.isArray(data) ? data : []);

const done = items.filter((i) => i.status === "done" || Number(i.stage || 0) > 0);
const open = items.filter((i) => !(i.status === "done" || Number(i.stage || 0) > 0));
const undated = open.filter((i) => !i.at);
const unstated = open.filter((i) => !i.state);

/* 주제별 — 한 갈래로 쏠려 있으면 발굴이 편식하고 있다는 뜻이다 */
const byTopic = {};
for (const i of open) byTopic[i.topic || "(없음)"] = (byTopic[i.topic || "(없음)"] || 0) + 1;
const topTopics = Object.entries(byTopic).sort((a, b) => b[1] - a[1]).slice(0, 5);

console.log(`\n소재 보드 건강 — 전체 ${items.length}건`);
console.log(`  진행/완료 ${done.length}건 · **안 고른 것 ${open.length}건**`);
console.log(`  날짜 모름 ${undated.length}건 (${Math.round((undated.length / open.length) * 100)}%)`);
console.log(`  상태 모름 ${unstated.length}건 (${Math.round((unstated.length / open.length) * 100)}%)`);
console.log(`\n  주제 쏠림:`);
for (const [t, n] of topTopics) console.log(`    ${String(n).padStart(4)}건  ${t}`);

const tooMany = open.length > MAX_OPEN;
const tooBlind = undated.length / open.length > MAX_UNDATED_RATIO;

if (!tooMany && !tooBlind) {
  console.log(`\n✅ 보드가 관리 가능한 범위입니다 (기준: 안 고른 것 ${MAX_OPEN}건 이하)\n`);
  process.exit(0);
}

console.log(`\n⚠️  소재가 고르는 속도보다 빨리 쌓이고 있습니다.\n`);
if (tooMany) console.log(`    · 안 고른 것 ${open.length}건 > 기준 ${MAX_OPEN}건`);
if (tooBlind) console.log(`    · 날짜를 모르는 것이 ${Math.round((undated.length / open.length) * 100)}% — 나이로 정리할 수 없다`);
console.log(`
  무엇부터 하나 — **지우는 것보다 보이게 하는 것이 먼저다**:
   ① 새로 들어오는 소재에 \`at\`(들어온 날)을 남긴다
      → register-*.mjs · ingest-signals.mjs 가 만드는 자리
   ② 오너가 기각한 사유는 이미 research/decisions-inbox.md 에 쌓이고 있다.
      그것을 되읽어 **발굴 규칙**을 고치는 월 1회 회고가 아직 없다.
   ③ 그 다음에야 "오래되고 반응 없는 것"을 골라낼 수 있다.

  ⚠️ 자동 삭제하지 않는다 — 이 파일은 18곳이 읽고, 되살릴 방법은 git 뿐이다.
`);
process.exit(process.argv.includes("--strict") ? 1 : 0);
