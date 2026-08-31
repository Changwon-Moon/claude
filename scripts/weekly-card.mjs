#!/usr/bin/env node
/**
 * 주간 지수 카드 원커맨드 — 매매·전세 연속 상승 두 장을 한 줄로.
 *
 * 오너: *"주간 상승률 카드 만들어줘"* → `node scripts/weekly-card.mjs`
 *
 * 왜 원커맨드인가 (2026-08-31):
 *   노선(`line-card.mjs`)·청약(`danji-card.mjs`)은 원커맨드가 있는데 **주간 지수는 없었다.**
 *   매주 도는 정기물인데 매번 빌드→렌더→검수를 손으로 이어 붙였다는 뜻이고,
 *   손으로 잇는 절차는 **한 단계씩 빠진다** — 이 저장소가 반복해서 겪은 일이다
 *   (배포 순서에서 build-archive 를 빠뜨려 "로컬만 초록"이 났던 것처럼).
 *
 * 무엇을 하나:
 *   ① 자료 신선도 확인 — `reb-weekly-index.json` 이 낡았으면 **먼저 말한다**
 *   ② 두 빌더 실행 (매매·전세)
 *   ③ 렌더 → 자동 검수
 *
 * ⚠️ **수집은 여기서 안 한다.** 세션은 외부망이 막혀 있어 R-ONE 을 못 부른다 —
 *    자료가 낡았으면 `data/reb-weekly-queue.txt` 에 한 줄 밀고 푸시해야 한다(CLAUDE.md §6).
 *    그 사실을 조용히 넘기지 않고 **화면에 크게 띄운다.**
 *
 * 쓰는 법:
 *   node scripts/weekly-card.mjs            # 매매 + 전세
 *   node scripts/weekly-card.mjs --only mae # 하나만
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (k) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : null;
};
const ONLY = arg("only");

const run = (title, cmd, args) => {
  console.log(`\n── ${title}`);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) {
    console.log(`\n❌ ${title} 실패 — 여기서 멈춥니다. 위 메시지를 보세요.`);
    process.exit(1);
  }
};

/* ── ① 자료가 낡았나 ── */
const idx = join(ROOT, "data/datasets/reb-weekly-index.json");
if (!existsSync(idx)) {
  console.log(`
❌ 주간 지수 자료가 없습니다 — data/datasets/reb-weekly-index.json

   세션은 외부망이 막혀 R-ONE 을 직접 못 부릅니다. Actions 가 받아옵니다:
     echo "run $(new Date().toISOString().slice(0,10))" >> data/reb-weekly-queue.txt
     git commit -am "주간 지수 수집" && git push      ← 이 푸시가 방아쇠입니다
`);
  process.exit(1);
}
const ageDays = Math.floor((Date.now() - statSync(idx).mtimeMs) / 86400000);
let asOf = "?";
try {
  const j = JSON.parse(readFileSync(idx, "utf8"));
  asOf = j?.meta?.asOf ?? j?.asOf ?? "?";
} catch { /* 못 읽어도 진행은 한다 — 빌더가 다시 검증한다 */ }

console.log(`\n📅 주간 지수 자료 — 기준 ${asOf} · 파일 갱신 ${ageDays}일 전`);
if (ageDays > 8) {
  console.log(`
⚠️  자료가 ${ageDays}일 됐습니다. 주간 지수는 매주 금요일에 갱신됩니다 —
   지난주 숫자로 카드를 내면 "이번 주"가 아닙니다.

   먼저 받아오려면:
     printf 'run %s\\n' "$(date -u -d '+9 hours' +%%Y-%%m-%%d)" >> data/reb-weekly-queue.txt
     git commit -am "주간 지수 수집" && git push

   그래도 지금 자료로 진행하려면 3초 뒤 계속됩니다…
`);
  spawnSync("sleep", ["3"]);
}

/* ── ② 빌드 ── */
const JOBS = [
  { key: "mae", label: "mae-streak", title: "매매 연속 상승", cmd: "scripts/build-mae-streak.mjs" },
  { key: "jeonse", label: "jeonse-streak", title: "전세 연속 상승", cmd: "scripts/build-jeonse-streak.mjs" },
].filter((j) => !ONLY || j.key === ONLY);

if (!JOBS.length) {
  console.log(`\n❌ --only 값이 잘못됐습니다. mae 또는 jeonse 를 쓰세요.\n`);
  process.exit(1);
}

for (const j of JOBS) run(`${j.title} 빌드`, "node", [j.cmd]);

/* ── ③ 렌더 + 검수 ──
 * produce-card 가 빌드·렌더·검수를 다 하지만, 위에서 이미 빌드했으므로
 * 여기서는 그것을 그대로 쓴다 — 같은 일을 두 번 하지 않는다. */
for (const j of JOBS) run(`${j.title} 렌더·검수`, "node", ["scripts/produce-card.mjs", j.label]);

console.log(`
✅ 주간 카드 ${JOBS.length}장 완료 — 기준 ${asOf}

   다음: 오너에게 렌더 PNG 를 보내고, 확정을 받으면
     node scripts/confirm.mjs ${JOBS.map((j) => j.label).join(" ")}
`);
