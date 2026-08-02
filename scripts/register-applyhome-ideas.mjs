/**
 * 청약홈 수집 결과 → 소재 보드(research/ideas.json) 등록 + 알림 문구 작성.
 *
 * ── 왜 이 단계가 따로 있나
 * 수집기는 "무엇이 있었나"를 적고, 이 스크립트는 "그중 무엇이 소재인가"를 고른다.
 * 고르는 규칙은 전부 코드다 — 점수는 파서(parse/applyhome.ts)가 계산했고 여기서는
 * **문턱을 넘었는가 · 이미 올린 것인가 · 지난 것인가**만 본다. LLM 이 개입하지 않는다.
 *
 * ── 오너가 쌓인 목록을 보게 하지 않는다 (CEO 07-26)
 *  · 이미 올린 공고는 다시 올리지 않는다(id = ah-{kind}-{공고번호}).
 *  · 접수가 끝났고 오너가 아직 안 고른 자동 소재는 **지운다.** 지난 줍줍이 보드에 남으면
 *    그건 결정 요청이 아니라 영구 알림이다. 오너가 이미 고른 것(state 가 채워진 것)은 건드리지 않는다.
 *  · 알림은 **새로 들어온 게 있을 때만** 간다.
 *
 * 실행: node scripts/register-applyhome-ideas.mjs [--today 2026-08-01] [--min 45] [--top 5]
 * 산출: research/ideas.json 갱신 · data/applyhome-alert.txt (알림 문구, 새 게 없으면 빈 파일)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

const TODAY = arg("today", new Date().toISOString().slice(0, 10));
const MIN = Number(arg("min", 45));
const TOP = Number(arg("top", 5));

const latestPath = join(ROOT, "data/datasets/applyhome-latest.json");
if (!existsSync(latestPath)) {
  console.error(`❌ ${latestPath} 가 없습니다 — 수집기를 먼저 돌리세요.`);
  process.exit(1);
}
const doc = JSON.parse(readFileSync(latestPath, "utf8"));
const notices = Array.isArray(doc.notices) ? doc.notices : [];

const ideasPath = join(ROOT, "research/ideas.json");
const board = JSON.parse(readFileSync(ideasPath, "utf8"));
board.ideas = Array.isArray(board.ideas) ? board.ideas : [];

const idOf = (x) => `ah-${x.kind}-${x.pblancNo}`;
const known = new Set(board.ideas.map((i) => i.id));
const daysLeft = (to) =>
  to ? Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`)) / 86400000) : null;

/* ── ① 지난 자동 소재 청소 ──
 * 접수가 끝났는데 오너가 아직 손대지 않은(state === "") 자동 등록 건만 지운다.
 * 오너가 [진행]을 눌렀거나 메모를 남긴 것은 그대로 둔다 — 그건 오너의 결정이다. */
const before = board.ideas.length;
/* 이번 수집에 실제로 들어 있는 공고 목록 — '사라진 것'을 가려내는 기준.
   ⚠️ 수집이 0건인 날에는 이 기준을 쓰지 않는다. 하루 API 가 비면 보드가 통째로 비워진다. */
const inRun = new Set(notices.map(idOf));
const runHasData = notices.length > 0;
board.ideas = board.ideas.filter((i) => {
  if (!String(i.id).startsWith("ah-") || i.feed !== "auto") return true;
  if (i.state !== "" || i.status) return true; // 오너가 손댄 것은 오너의 결정이다 — 건드리지 않는다
  const left = daysLeft(i.deadline);
  if (left !== null && left < 0) return false; // 접수가 끝났다
  /* 이번 수집에 없는 자동 소재도 내린다. 블록별로 쪼개졌던 공고를 한 줄로 합치면
     옛 블록 항목들이 갈 곳을 잃는데(2026-08-02), 그것들이 보드에 남으면 같은 단지가 두 번 보인다. */
  if (runHasData && !inRun.has(i.id)) return false;
  return true;
});
const pruned = before - board.ideas.length;

/* ── ② 새 공고 등록 ── */
const fresh = notices.filter((x) => x.score >= MIN && !known.has(idOf(x)));
for (const x of fresh) {
  const left = daysLeft(x.receiptTo);
  const isJupjup = x.kind === "remndr";
  /* cat 은 '얼마나 자주 내는가'다(CEO 07-27). 마감이 코앞인 줍줍은 정확히 '🔥 시의성'의 정의
     — 날짜가 지나면 김빠진다. 나머지는 '분류 대기'에 두고 오너가 정한다. */
  const cat = isJupjup && left !== null && left <= 3 ? "hot" : "todo";
  const dl = x.receiptTo ? ` · 접수 ~${x.receiptTo}${left !== null && left >= 0 ? `(D-${left})` : ""}` : "";
  board.ideas.push({
    id: idOf(x),
    cat,
    topic: "부동산",
    feed: "auto",
    title: `${isJupjup ? "[줍줍]" : "[신규분양]"} ${x.name}`,
    why:
      `${x.areaName}${x.supply ? ` · ${x.supply.toLocaleString("ko-KR")}가구` : ""}` +
      `${x.blocks ? `(${x.blocks}개 블록 합계)` : ""}${dl}` +
      ` · ${x.score}점(${x.reasons.join("·")})`,
    source: "한국부동산원 청약홈 API",
    state: "",
    status: "",
    deadline: x.receiptTo || "",
    url: x.noticeUrl || x.homepage || "",
  });
}

board.meta = board.meta || {};
board.meta.updated = TODAY;
writeFileSync(ideasPath, JSON.stringify(board, null, 2) + "\n", "utf8");

/* ── ③ 알림 문구 — 새 게 있을 때만 ── */
const alertPath = join(ROOT, "data/applyhome-alert.txt");
let msg = "";
if (fresh.length) {
  const lines = fresh.slice(0, TOP).map((x) => {
    const left = daysLeft(x.receiptTo);
    const urgent = left !== null && left >= 0 && left <= 2 ? ` ⏰D-${left}` : "";
    const tag = x.kind === "remndr" ? "줍줍" : "신규";
    const blk = x.blocks ? ` ${x.blocks}블록` : "";
    return `· [${tag}] ${x.name} (${x.areaName}${x.supply ? ` ${x.supply.toLocaleString("ko-KR")}가구` : ""}${blk})${urgent}`;
  });
  const more = fresh.length > TOP ? `\n외 ${fresh.length - TOP}건` : "";
  msg = `🏠 청약홈 새 공고 ${fresh.length}건 (${TODAY})\n${lines.join("\n")}${more}`;
}
writeFileSync(alertPath, msg, "utf8");

console.log(`청약홈 소재 등록 — 새로 ${fresh.length}건 · 지난 것 정리 ${pruned}건 · 보드 총 ${board.ideas.length}건`);
for (const x of fresh.slice(0, TOP)) console.log(`   +${x.score}점 ${x.name} (${x.areaName})`);
if (!fresh.length) console.log("   (문턱 넘은 새 공고 없음 — 알림 보내지 않음)");
