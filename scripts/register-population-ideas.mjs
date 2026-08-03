#!/usr/bin/env node
/**
 * 인구 신호 보고 — 수집 결과에서 뽑힌 신호를 **읽기 좋게 정리**한다.
 *
 *   node scripts/register-population-ideas.mjs [--min 45] [--top 8] [--digest] [--register]
 *
 * ── ⚠️ 기본값은 "보드에 올리지 않는다" (2026-08-03 오너 결정)
 * 오너 선택: **"데이터만 자동, 소재는 내가 고른다."**
 * 그래서 이 스크립트는 기본적으로 `research/ideas.json` 을 **건드리지 않는다.**
 * 하는 일은 두 가지뿐이다 — 신호를 점수순으로 정리해 `data/population-signals.md` 에 적고,
 * 텔레그램 알림 문구를 만든다. 오너는 그걸 보고 마음에 드는 것만 관제탑에서 직접 소재로 올린다.
 *
 * `--register` 를 주면 예전처럼 상위 N 건을 보드에 자동 등록한다(청약홈과 같은 방식).
 * 나중에 오너가 "이건 그냥 자동으로 올려도 되겠다"고 하면 워크플로에 이 플래그만 붙이면 된다.
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
/* 보드에 자동 등록할 것인가. 기본은 **아니다** — 오너가 직접 고른다(2026-08-03). */
const REGISTER = process.argv.includes("--register");

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

/* ── 신호를 사람이 읽는 표로 ──
   보드에 안 올리더라도 **어떤 신호가 있었는지는 남는다.** 세션은 Actions 로그를 못 보고,
   오너는 매달 무엇이 잡혔는지 한 눈에 봐야 고를 수 있다. */
const reportPath = join(ROOT, "data/population-signals.md");
const KIND_LABEL = { milestone: "문턱 돌파·붕괴", streak: "연속 증감", topmove: "전국 순위" };
{
  const L = [];
  L.push(`# 인구 신호 — ${period} 기준`);
  L.push("");
  L.push(`> 코드가 계산한 것이다(\`packages/collectors/src/parse/kosis.ts\` 의 \`score()\`).`);
  L.push("> **소재 보드에는 자동으로 올리지 않는다** — 오너가 보고 고른다(2026-08-03 결정).");
  L.push("> 마음에 드는 줄을 관제탑에서 소재로 올리면 된다.");
  L.push("");
  if (data.meta?.verified === false) {
    L.push("⚠️ 이 데이터는 아직 `verified: false` 입니다 — 카드 발행 전 KOSIS 원문 대조가 필요합니다.");
    L.push("");
  }
  L.push(`문턱 ${MIN}점을 넘은 신호 **${signals.length}건**.`);
  L.push("");
  L.push("| 점수 | 종류 | 제목 | 근거 |");
  L.push("|---:|---|---|---|");
  for (const s of signals) {
    L.push(`| ${s.score} | ${KIND_LABEL[s.kind] ?? s.kind} | ${s.title} | ${s.why} |`);
  }
  if (!signals.length) L.push("| — | — | (이달에 문턱을 넘은 신호 없음 — 이것도 사실이다) | — |");
  writeFileSync(reportPath, L.join("\n") + "\n", "utf8");
}

/* ── 보드 등록은 --register 를 줄 때만 ── */
let added = 0, updated = 0, removed = 0, boardTotal = null;
if (REGISTER) {
  const ideasPath = join(ROOT, "research/ideas.json");
  const board = JSON.parse(readFileSync(ideasPath, "utf8"));

  /** 같은 신호를 두 번 올리지 않기 위한 열쇠. 시점이 바뀌면 다른 소재다. */
  const idOf = (s) =>
    `pop-${s.kind}-${s.code}-${String(s.facts.milestone ?? s.facts.direction ?? "x")}-${period}`.replace(/[^a-zA-Z0-9-]/g, "");

  /* 낡은 자동 소재 정리 — 오너가 손대지 않은 것만 지운다. */
  const before = board.ideas.length;
  board.ideas = board.ideas.filter((i) => {
    if (!String(i.id ?? "").startsWith("pop-")) return true;
    if (i.feed !== "auto") return true;
    if (i.state !== "" || i.status) return true; // 오너가 손댄 것은 오너의 결정이다
    return String(i.id).endsWith(period);
  });
  removed = before - board.ideas.length;

  const byId = new Map(board.ideas.map((i) => [i.id, i]));
  for (const s of picked) {
    const id = idOf(s);
    const entry = {
      id,
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
    if (!cur) { board.ideas.push(entry); byId.set(id, entry); added++; continue; }
    if (cur.feed !== "auto" || cur.state !== "" || cur.status) continue;
    Object.assign(cur, { cat: entry.cat, title: entry.title, why: entry.why, source: entry.source });
    updated++;
  }

  board.meta = board.meta ?? {};
  board.meta.updated = new Date().toISOString().slice(0, 10);
  writeFileSync(ideasPath, JSON.stringify(board, null, 2) + "\n", "utf8");
  boardTotal = board.ideas.length;
}

/* ── 알림 — 신호가 있으면 보낸다(등록 여부와 무관하게 오너가 알아야 한다) ── */
const alertPath = join(ROOT, "data/population-alert.txt");
let msg = "";
if (signals.length && (DIGEST || !REGISTER || added > 0)) {
  const lines = [
    `🧭 인구 신호 ${signals.length}건 (${period} 기준)`,
    "",
    ...picked.slice(0, 6).map((s) => `· ${s.score}점 ${s.title}\n   ${s.why}`),
  ];
  if (dropped > 0) lines.push("", `※ 문턱(${MIN}점)은 넘었지만 상위 ${TOP}건 밖인 신호가 ${dropped}건 더 있습니다.`);
  lines.push("", REGISTER
    ? `→ 상위 ${picked.length}건을 소재 보드에 올려 뒀습니다.`
    : "→ 보드에는 올리지 않았습니다. 전체 목록은 `data/population-signals.md` 에 있습니다 — 보시고 고르세요.");
  if (data.meta?.verified === false) {
    lines.push("", "⚠️ 아직 verified=false — 카드 발행 전 KOSIS 원문 대조가 필요합니다.");
  }
  msg = lines.join("\n");
}
writeFileSync(alertPath, msg, "utf8");

console.log(`✅ 인구 신호 ${signals.length}건 (문턱 ${MIN}점) → ${reportPath}`);
if (dropped > 0) console.log(`   ※ 상위 ${TOP} 밖 신호 ${dropped}건`);
console.log(REGISTER
  ? `   보드 등록 — 신규 ${added} · 갱신 ${updated} · 정리 ${removed} · 총 ${boardTotal}건`
  : "   보드에는 올리지 않았습니다(오너가 직접 고릅니다). --register 를 주면 자동 등록합니다.");
console.log(`   알림 ${msg ? "있음" : "없음"}`);
