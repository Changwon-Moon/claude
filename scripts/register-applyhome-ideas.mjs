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
 * ── --digest — "오늘 것 한 번 보내줘"
 * 평소 알림은 **새로 들어온 것만** 보낸다(알림 피로 방지). 그런데 오너가 직접 물을 때는
 * 새것 여부와 무관하게 **지금 살아 있는 소재 전체**를 보고 싶은 것이다.
 * --digest 는 그 요청용이다 — 접수가 아직 열려 있는 건을 점수순으로 담는다.
 *
 * 실행: node scripts/register-applyhome-ideas.mjs [--today 2026-08-01] [--min 45] [--top 5] [--digest]
 * 산출: research/ideas.json 갱신 · data/applyhome-alert.txt (알림 문구, 보낼 게 없으면 빈 파일)
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
/* 오너가 직접 물었을 때만 켜는 모드 — 새것만이 아니라 지금 살아 있는 것 전체를 보낸다 */
const DIGEST = process.argv.includes("--digest");

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

/* ── ② 새 공고 등록 · 이미 있는 건 최신 내용으로 갱신 ──
 *
 * 갱신이 왜 필요한가 (2026-08-02):
 *  · **D-N 이 굳는다.** 어제 D-3 이던 줄이 오늘도 D-3 이라고 적혀 있으면 그건 틀린 정보다.
 *  · **합쳐진 뒤의 이름·세대수가 반영돼야 한다.** 블록 5건을 한 줄로 합치자 살아남은 항목이
 *    옛 블록 이름("G5-1블록 · 35가구")을 그대로 달고 있었다. 지금 사실은 "150가구 · 5개 블록"이다.
 *
 * 단, **오너가 손댄 줄은 절대 덮지 않는다**(state 나 status 가 채워진 것).
 * 그건 오너의 결정이고, 기계가 덮으면 결정이 사라진다. */
function entryOf(x) {
  const left = daysLeft(x.receiptTo);
  const isJupjup = x.kind === "remndr";
  /* cat 은 '얼마나 자주 내는가'다(CEO 07-27). 마감이 코앞인 줍줍은 정확히 '🔥 시의성'의 정의
     — 날짜가 지나면 김빠진다. 나머지는 '분류 대기'에 두고 오너가 정한다. */
  const cat = isJupjup && left !== null && left <= 3 ? "hot" : "todo";
  const dl = x.receiptTo ? ` · 접수 ~${x.receiptTo}${left !== null && left >= 0 ? `(D-${left})` : ""}` : "";
  return {
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
  };
}

const passing = notices.filter((x) => x.score >= MIN);
const fresh = passing.filter((x) => !known.has(idOf(x)));
const byId = new Map(board.ideas.map((i) => [i.id, i]));
let updated = 0;
for (const x of passing) {
  const e = entryOf(x);
  const cur = byId.get(e.id);
  if (!cur) { board.ideas.push(e); continue; }
  if (cur.feed !== "auto" || cur.state !== "" || cur.status) continue; // 오너의 것은 건드리지 않는다
  if (cur.title === e.title && cur.why === e.why && cur.deadline === e.deadline) continue;
  Object.assign(cur, { cat: e.cat, title: e.title, why: e.why, deadline: e.deadline, url: e.url });
  updated++;
}

board.meta = board.meta || {};
board.meta.updated = TODAY;
writeFileSync(ideasPath, JSON.stringify(board, null, 2) + "\n", "utf8");

/* ── ③ 알림 문구 ──
 * 기본은 **새로 들어온 것만**(알림 피로 방지 — 매일 같은 목록을 보내면 아무도 안 본다).
 * --digest 면 새것 여부와 무관하게 **지금 접수가 열려 있는 것 전체**를 점수순으로 담는다. */
const alertPath = join(ROOT, "data/applyhome-alert.txt");
const line = (x) => {
  const left = daysLeft(x.receiptTo);
  const dl = left === null ? "" : left === 0 ? " ⏰오늘 마감" : left > 0 ? ` D-${left}` : "";
  const tag = x.kind === "remndr" ? "줍줍" : "신규";
  const blk = x.blocks ? `·${x.blocks}블록` : "";
  const cnt = x.supply ? ` ${x.supply.toLocaleString("ko-KR")}가구` : "";
  return `· [${tag}] ${x.name}\n   ${x.areaName}${cnt}${blk}${dl}`;
};

let msg = "";
if (DIGEST) {
  /* 이미 마감된 건 뺀다 — 오늘 못 넣는 공고를 알림에 올리면 그건 정보가 아니라 소음이다. */
  const live = passing.filter((x) => {
    const left = daysLeft(x.receiptTo);
    return left === null || left >= 0;
  });
  if (live.length) {
    const head = `🏠 오늘의 청약·분양 소재 (${TODAY})`;
    const jup = live.filter((x) => x.kind === "remndr");
    const npd = live.filter((x) => x.kind !== "remndr");
    const parts = [head, ""];
    if (jup.length) parts.push(`— 무순위·줍줍 ${jup.length}건 —`, ...jup.slice(0, TOP).map(line));
    if (npd.length) parts.push("", `— 신규 분양 ${npd.length}건 —`, ...npd.slice(0, TOP).map(line));
    const cut = Math.max(0, jup.length - TOP) + Math.max(0, npd.length - TOP);
    if (cut) parts.push("", `외 ${cut}건은 관제탑 소재 탭에서`);
    msg = parts.join("\n");
  } else {
    /* 빈손도 답이다 — 물었는데 아무 말이 없으면 "고장인가?" 를 의심하게 된다. */
    msg = `🏠 오늘의 청약·분양 소재 (${TODAY})\n\n접수가 열려 있는 ${MIN}점 이상 공고가 없습니다.`;
  }
} else if (fresh.length) {
  const more = fresh.length > TOP ? `\n\n외 ${fresh.length - TOP}건` : "";
  msg = `🏠 청약홈 새 공고 ${fresh.length}건 (${TODAY})\n\n${fresh.slice(0, TOP).map(line).join("\n")}${more}`;
}
writeFileSync(alertPath, msg, "utf8");

console.log(`청약홈 소재 등록 — 새로 ${fresh.length}건 · 갱신 ${updated}건 · 지난 것 정리 ${pruned}건 · 보드 총 ${board.ideas.length}건`);
for (const x of fresh.slice(0, TOP)) console.log(`   +${x.score}점 ${x.name} (${x.areaName})`);
if (DIGEST) console.log("   📨 요약 알림(digest) 문구를 작성했습니다 — 새것 여부와 무관하게 보냅니다.");
else if (!fresh.length) console.log("   (문턱 넘은 새 공고 없음 — 알림 보내지 않음)");
