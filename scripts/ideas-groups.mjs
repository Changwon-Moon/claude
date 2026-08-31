#!/usr/bin/env node
/**
 * 소재 묶음 정리 — 278건을 낱개로 못 지우니 **묶어서** 본다.
 *
 * 왜 필요한가 (2026-08-31 실측):
 *   관제탑에 🗑 버튼은 이미 있다. 문제는 그게 **낱개**라는 것이다 —
 *   278건을 하나씩 지우는 건 불가능하고, 그래서 안 지우고, 그래서 쌓인다.
 *   화면에는 「278건」이라고만 뜨니 **어디부터 손댈지도 모른다.**
 *
 * 어떻게 묶나 — 실측으로 고른 축이다:
 *   ① 자동수집(auto) 인가 오너·세션이 넣은 것(manual) 인가  ← 성격이 완전히 다르다
 *   ② 나이 — `at` 이 없어도 **`source` 에 날짜가 박혀 있다**
 *      ("자동 수집 · 2026-08-07-auto.md"). 278건 중 208건(75%)의 나이를 여기서 캔다.
 *   ③ 주제 — 증시·경제 131 / 부동산 121 로 갈린다
 *
 *   `cat`(todo 214) 과 `state`(없음 248) 는 거의 한 값이라 묶어도 안 갈린다. 안 쓴다.
 *
 * ⚠️ **이 스크립트는 지우지 않는다.** 목록을 보여주고 `--plan` 으로 정리안을 파일에 쓴다.
 *    실제 삭제는 그 파일을 오너가 확인한 뒤 `--apply` 로만 한다. 두 단계인 이유는
 *    `research/ideas.json` 을 18곳이 읽고, 한 번에 수백 건이 날아가면 git 말고는
 *    되살릴 방법이 없기 때문이다.
 *
 * 쓰는 법:
 *   node scripts/ideas-groups.mjs                    # 묶음 보기
 *   node scripts/ideas-groups.mjs --plan --older 21  # 21일 넘은 자동수집 정리안 작성
 *   node scripts/ideas-groups.mjs --apply            # 정리안대로 실행(보관 후 제거)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "research/ideas.json");
const PLAN = join(ROOT, "data/ideas-cleanup-plan.json");
const KEEP = join(ROOT, "research/ideas-dropped.json");   // 보관함 — 지운 것은 여기 남는다

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d;
};
const MODE = process.argv.includes("--apply") ? "apply" : process.argv.includes("--plan") ? "plan" : "show";
const OLDER = Number(arg("older", 21));
/* 주제를 좁혀 정리한다 — 2026-08-31 오너 지시로 증시 비중을 35→10% 로 내리면서 필요해졌다.
   갈래마다 사정이 다르다: 증시는 지나간 헤드라인이라 7일이면 낡지만,
   부동산은 코어라 같은 잣대로 자르면 안 된다. **한 자로 전부 재지 않는다.** */
const ONLY = arg("topic", "");

const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const ageOf = (i) => {
  const d = i.at || (String(i.source || "").match(/(\d{4}-\d{2}-\d{2})/) || [])[1];
  if (!d) return null;
  return Math.round((Date.parse(today) - Date.parse(d)) / 86400000);
};
const isOpen = (i) => !(i.status === "done" || Number(i.stage || 0) > 0);

const data = JSON.parse(readFileSync(FILE, "utf8"));
const open = data.ideas.filter(isOpen);

/* ── 묶기 ── */
const groups = new Map();
for (const i of open) {
  const age = ageOf(i);
  const feed = i.feed === "auto" || /자동 수집/.test(String(i.source || "")) ? "자동수집" : "오너·세션";
  const band = age == null ? "나이 모름" : age > 60 ? "60일 초과" : age > 30 ? "31~60일" : age > 14 ? "15~30일" : "14일 이내";
  const key = `${feed} · ${band} · ${i.topic || "주제없음"}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(i);
}
const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

console.log(`\n소재 묶음 — 안 고른 것 ${open.length}건 · ${groups.size}묶음\n`);
for (const [k, v] of sorted) {
  const mark = /자동수집/.test(k) && !/14일 이내|나이 모름/.test(k) ? "🟡" : "  ";
  console.log(`${mark} ${String(v.length).padStart(4)}건  ${k}`);
}
console.log(`\n🟡 = 자동수집이고 오래된 것 — 정리 1순위다. 오너가 넣은 것은 나이로 안 자른다.`);

if (MODE === "show") {
  console.log(`
  정리안 만들기:  node scripts/ideas-groups.mjs --plan --older ${OLDER}
`);
  process.exit(0);
}

/* ── 정리안 ── */
if (MODE === "plan") {
  const drop = open.filter((i) => {
    if (i.state === "approve") return false;              // 오너가 고른 것은 절대 안 건드린다
    if (Number(i.stage || 0) > 0) return false;
    const auto = i.feed === "auto" || /자동 수집/.test(String(i.source || ""));
    if (!auto) return false;                              // 오너·세션이 넣은 것도 안 건드린다
    if (ONLY && (i.topic || "") !== ONLY) return false;    // --topic 을 주면 그 갈래만
    const age = ageOf(i);
    return age != null && age > OLDER;                    // 나이를 모르면 안 자른다
  });
  mkdirSync(dirname(PLAN), { recursive: true });
  writeFileSync(PLAN, JSON.stringify({
    madeAt: today, olderThan: OLDER,
    rule: `자동수집 + 나이 확인됨 + approve 아님 + 진행 안 함${ONLY ? ` + 주제=${ONLY}` : ""}`,
    topic: ONLY || "(전체)",
    count: drop.length,
    ids: drop.map((i) => i.id),
    preview: drop.slice(0, 20).map((i) => ({ id: i.id, at: ageOf(i) + "일", title: (i.title || "").slice(0, 60) })),
  }, null, 2) + "\n");
  console.log(`\n📝 정리안 작성 — ${drop.length}건 (${OLDER}일 초과 자동수집${ONLY ? ` · 주제 ${ONLY}` : ""})`);
  console.log(`   ${PLAN}\n`);
  for (const i of drop.slice(0, 15)) console.log(`   ${String(ageOf(i)).padStart(3)}일  ${(i.title || "").slice(0, 58)}`);
  if (drop.length > 15) console.log(`   … 외 ${drop.length - 15}건 (정리안 파일에 전부 있습니다)`);
  console.log(`
  ⚠️ 아직 아무것도 안 지웠습니다. 위 목록을 보고 결정하세요.
     실행:  node scripts/ideas-groups.mjs --apply
     취소:  이 파일을 지우면 됩니다 — ${PLAN}
`);
  process.exit(0);
}

/* ── 실행 ── */
if (!existsSync(PLAN)) {
  console.log(`\n❌ 정리안이 없습니다. 먼저 만드세요: node scripts/ideas-groups.mjs --plan\n`);
  process.exit(1);
}
const plan = JSON.parse(readFileSync(PLAN, "utf8"));
const ids = new Set(plan.ids);
const dropped = data.ideas.filter((i) => ids.has(i.id));
const kept = data.ideas.filter((i) => !ids.has(i.id));

/* 보관함 — 지운 것은 사라지지 않는다 */
const keepFile = existsSync(KEEP) ? JSON.parse(readFileSync(KEEP, "utf8")) : { dropped: [] };
keepFile.dropped.push({ at: today, rule: plan.rule, olderThan: plan.olderThan, items: dropped });
writeFileSync(KEEP, JSON.stringify(keepFile, null, 2) + "\n");

data.ideas = kept;
data.meta = data.meta || {};
data.meta.updated = today;
writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");

console.log(`\n✅ ${dropped.length}건을 보드에서 내렸습니다 (남은 것 ${kept.length}건)`);
console.log(`   보관함: research/ideas-dropped.json — 지운 게 아니라 옮긴 것입니다`);
console.log(`   되돌리려면 그 파일에서 꺼내면 됩니다\n`);
