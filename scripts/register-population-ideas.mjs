#!/usr/bin/env node
/**
 * 인구 소재 자동 등록 — 수집 결과의 신호를 `research/ideas.json` 소재 보드에 올린다.
 *
 *   node scripts/register-population-ideas.mjs [--min 45] [--top 8] [--digest]
 *
 * ── 무엇을 고르나
 * 고르는 규칙은 여기 없다. **`packages/collectors/src/parse/kosis.ts` 의 `score()` 가 다 계산했다.**
 * 이 스크립트는 그 결과에서 셋만 본다: 문턱을 넘었나 / 이미 올렸나 / 낡았나.
 * LLM 이 고르지 않는다.
 *
 * ── 보드가 쌓이지 않게
 * 매달 도는 수집기가 등록만 하고 정리를 안 하면 보드가 몇 달 만에 못 쓰게 된다.
 *   · 같은 신호를 두 번 올리지 않는다(id 로 막는다)
 *   · **지난달 자동 소재 중 오너가 손대지 않은 것은 지운다** — 인구 소재는 시점이 지나면
 *     숫자가 틀려진다("6개월 연속"이 다음 달엔 7개월이거나 끊긴다). 그건 결정 요청이 아니라
 *     영구 알림이다.
 *   · **오너가 손댄 줄(state·status 가 채워진 것)은 절대 덮거나 지우지 않는다.**
 *
 * 산출: research/ideas.json 갱신 · data/population-alert.txt (알림 문구, 없으면 빈 파일)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.env.INIT_CWD || process.cwd());

function arg(name, dflt) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : dflt;
}
const MIN = Number(arg("min", 45));
const TOP = Number(arg("top", 8));
const DIGEST = process.argv.includes("--digest");

const dataPath = join(ROOT, "data/datasets/population-latest.json");
if (!existsSync(dataPath)) {
  console.error(`❌ ${dataPath} 가 없습니다 — 수집이 먼저입니다.`);
  process.exit(1);
}
const data = JSON.parse(readFileSync(dataPath, "utf8"));

/* ⚠️ 합성 데이터로는 절대 보드를 건드리지 않는다. --dry 산출이 실수로 여기까지 오면 멈춘다. */
if (data.meta?.dry) {
  console.error("❌ --dry 합성 데이터입니다. 소재 보드에 올리지 않습니다.");
  process.exit(1);
}

const period = data.meta?.latestPeriod ?? "";
const signals = (data.signals ?? []).filter((s) => s.score >= MIN);

/* 점수순 상위 TOP 만 올린다. **잘라낸 개수를 반드시 말한다** —
   조용히 자르면 "이번 달은 이게 다"로 읽힌다. */
const picked = signals.slice(0, TOP);
const dropped = signals.length - picked.length;

const ideasPath = join(ROOT, "research/ideas.json");
const board = JSON.parse(readFileSync(ideasPath, "utf8"));

/** 같은 신호를 두 번 올리지 않기 위한 열쇠. 시점이 바뀌면 다른 소재다. */
const idOf = (s) =>
  `pop-${s.kind}-${s.code}-${String(s.facts.milestone ?? s.facts.direction ?? "x")}-${period}`.replace(/[^a-zA-Z0-9-]/g, "");

/* ── ① 낡은 자동 소재 정리 ──
   이번 수집의 시점(period)과 다른 인구 자동 소재 중, 오너가 손대지 않은 것만 지운다. */
const before = board.ideas.length;
board.ideas = board.ideas.filter((i) => {
  if (!String(i.id ?? "").startsWith("pop-")) return true; // 인구 자동 소재가 아니면 그대로
  if (i.feed !== "auto") return true;
  if (i.state !== "" || i.status) return true; // 오너가 손댄 것은 오너의 결정이다
  return String(i.id).endsWith(period); // 이번 달 것만 남긴다
});
const removed = before - board.ideas.length;

/* ── ② 새 소재 등록 ── */
const byId = new Map(board.ideas.map((i) => [i.id, i]));
let added = 0;
let updated = 0;

for (const s of picked) {
  const id = idOf(s);
  const entry = {
    id,
    /* 전국 순위표는 매달 다시 낼 수 있는 정기물, 개별 지역 사건은 시의성 일회물이다. */
    cat: s.kind === "topmove" ? "monthly" : "hot",
    topic: "인구·지역",
    feed: "auto",
    title: `[인구] ${s.title}`,
    why: `${s.why} · ${s.score}점(${s.reasons.join("·")})`,
    source: `KOSIS 주민등록 인구 (${period})`,
    state: "",
    status: "",
  };

  const cur = byId.get(id);
  if (!cur) {
    board.ideas.push(entry);
    byId.set(id, entry);
    added++;
    continue;
  }
  /* 이미 있는 줄은 **오너의 것이 아닐 때만** 갱신한다. */
  if (cur.feed !== "auto" || cur.state !== "" || cur.status) continue;
  Object.assign(cur, { cat: entry.cat, title: entry.title, why: entry.why, source: entry.source });
  updated++;
}

board.meta = board.meta ?? {};
board.meta.updated = new Date().toISOString().slice(0, 10);
writeFileSync(ideasPath, JSON.stringify(board, null, 2) + "\n", "utf8");

/* ── ③ 알림 — 새로 올라온 게 있을 때만 보낸다 ── */
const alertPath = join(ROOT, "data/population-alert.txt");
let msg = "";
if (added > 0 || (DIGEST && picked.length)) {
  const lines = [
    `🧭 인구 소재 ${added ? `${added}건 새로 올라왔습니다` : "오늘의 정리"} (${period} 기준)`,
    "",
    ...picked.slice(0, 6).map((s) => `· ${s.score}점 ${s.title}\n   ${s.why}`),
  ];
  if (dropped > 0) lines.push("", `※ 문턱(${MIN}점)을 넘었지만 상위 ${TOP}건에 들지 못한 소재가 ${dropped}건 더 있습니다.`);
  if (data.meta?.verified === false) {
    lines.push("", "⚠️ 이 데이터는 아직 verified=false 입니다 — 카드 발행 전 KOSIS 원문 대조가 필요합니다.");
  }
  msg = lines.join("\n");
}
writeFileSync(alertPath, msg, "utf8");

console.log(`✅ 인구 소재 — 신규 ${added} · 갱신 ${updated} · 낡은 자동소재 정리 ${removed}`);
if (dropped > 0) console.log(`   ※ 문턱은 넘었지만 상위 ${TOP} 밖이라 안 올린 소재 ${dropped}건`);
console.log(`   보드 총 ${board.ideas.length}건 · 알림 ${msg ? "있음" : "없음"}`);
