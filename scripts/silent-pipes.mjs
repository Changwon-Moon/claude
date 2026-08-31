#!/usr/bin/env node
/**
 * 배관 침묵 감시 — 조용히 죽은 것을 **하루 한 번 모아서** 말한다.
 *
 * 왜 필요한가 (2026-08-31):
 *   `KOSIS_API_KEY` 가 만료돼 인구 수집이 **27일간 전부 실패**했는데 아무도 몰랐다.
 *   그 워크플로에 텔레그램이 없어서다. 세어 보니 **43개 중 25개가 실패해도 말할 입이 없다.**
 *
 * 왜 워크플로마다 알림을 안 붙이나:
 *   25곳에 각각 붙이면 텔레그램이 시끄러워진다. 그리고 **시끄러운 알림은 안 읽힌다** —
 *   이 저장소가 이미 배운 것이다("맞는 것을 매번 지적하면 지적을 안 읽는다").
 *   계기판(`data/actions-health.json`)이 이미 43개 전부를 보고 있으니,
 *   **거기서 조용히 죽은 것만 골라 하루 한 번** 보낸다.
 *
 * 무엇을 침묵으로 보나 — 셋 다 "돌지 않는다"와는 다른 상태다:
 *   ① 성공한 지 오래됨 — 마지막 **성공**이 기준일 초과 (실행이 아니라 성공이다)
 *   ② 돌지만 계속 실패 — 최근 실행은 있는데 성공 기록이 그보다 오래됨
 *   ③ 아예 성공한 적 없음 — 30일 내내 실패만
 *
 * ⚠️ **조용한 날은 아무 말도 안 한다.** 매일 "이상 없음"을 보내면 그 알림도 안 읽히고,
 *    정작 문제가 있는 날의 메시지가 그 사이에 묻힌다.
 *
 * 쓰는 법:
 *   node scripts/silent-pipes.mjs             # 화면에만
 *   node scripts/silent-pipes.mjs --notify    # 문제가 있을 때만 텔레그램
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "data/actions-health.json");
const NOTIFY = process.argv.includes("--notify");

/** 성공한 지 이만큼 지나면 침묵으로 본다. 월 1~2회짜리도 있어 넉넉히 잡는다 */
const QUIET_DAYS = 35;
/** 이 워크플로들은 원래 가끔만 돈다 — 오래 안 돌았다고 고장이 아니다 */
const ON_DEMAND = /probe|font-convert|asset-fetch|photo-|geo|svg-|collect-on-request|telegram-test|notify-once/;

if (!existsSync(FILE)) {
  console.log("⏭  계기판 파일이 없습니다 — scripts/collect-actions-health.mjs 를 먼저 도세요");
  process.exit(0);
}
const h = JSON.parse(readFileSync(FILE, "utf8"));
const all = [...(h.scheduled || []), ...(h.manual || [])];

const problems = [];
for (const w of all) {
  if (ON_DEMAND.test(w.file)) continue;
  if (!w.lastRun && !w.lastOk) continue;              // 30일간 아예 안 돈 것은 침묵이 아니다

  if (w.lastRun && !w.lastOk) {
    problems.push({ w, why: "30일간 한 번도 성공 못 함", detail: `실행 ${w.lastRun}` });
  } else if (w.lastOk && w.lastRun && w.lastRun !== w.lastOk && (w.fails30 ?? 0) > 0) {
    problems.push({ w, why: "돌지만 계속 실패", detail: `마지막 성공 ${w.lastOk}(${w.okDaysAgo}일 전) · 30일 실패 ${w.fails30}회` });
  } else if ((w.okDaysAgo ?? 0) > QUIET_DAYS) {
    problems.push({ w, why: `성공한 지 ${w.okDaysAgo}일`, detail: `마지막 성공 ${w.lastOk}` });
  }
}

console.log(`\n배관 침묵 감시 — 워크플로 ${all.length}개 · 기준 성공 ${QUIET_DAYS}일\n`);
if (!problems.length) {
  console.log("✅ 조용히 죽은 배관 없음\n");
  process.exit(0);
}
for (const p of problems) console.log(`  ⚠️ ${p.w.name}\n     ${p.why} — ${p.detail}`);
console.log("");

if (!NOTIFY) process.exit(0);

/* ⚠️ 문구에 마크다운을 쓰지 않는다 — notify-telegram 은 parse_mode 를 안 넘겨
   평문으로 보낸다. 별표를 적으면 별표가 그대로 찍힌다(docs/CAPTION.md §7). */
const lines = [
  `🔧 조용히 멈춘 배관 ${problems.length}건`,
  "",
  ...problems.slice(0, 8).map((p) => `· ${p.w.name}\n  ${p.why} — ${p.detail}`),
];
if (problems.length > 8) lines.push(`… 외 ${problems.length - 8}건`);
lines.push("", "관제탑 「배관」 탭에서 전체를 봅니다.");

const r = spawnSync("node", [join(ROOT, "scripts/notify-telegram.mjs"), lines.join("\n")],
  { cwd: ROOT, stdio: "inherit" });
process.exit(r.status ?? 0);
