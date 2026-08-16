/**
 * 카드 1세트 기계 재생산 — 오너가 관제탑 버튼으로 직접 시키는 제작.
 *
 * ── 왜 (2026-07-26 오너 질문 "대시보드에서 제작 명령을 내릴 수는 없어?")
 * 데이터·템플릿·빌더가 이미 있는 카드(정기물·재사용 카드)는 사람 판단이 필요 없다.
 * 이건 결정적 코드 재실행이므로 **AI 세션 없이** 버튼 → GitHub Actions 로 돌 수 있다.
 * (빌더가 없는 새 소재의 첫 제작만 작업 세션이 필요하다 — 그건 화면이 그렇게 말한다)
 *
 * 하는 일: builders.json 에서 이 세트를 만드는 빌더들을 찾아 실행(최신 데이터 반영)
 *         → 세트의 카드 전 장 렌더 → 캡션 있으면 자동 검수까지.
 *
 * 실행: node scripts/produce-card.mjs <세트라벨>   (예: tohuh-rank)
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const label = (process.argv[2] || "").trim();
if (!label) {
  console.log("사용법: node scripts/produce-card.mjs <세트라벨>");
  process.exit(2);
}

const sets = JSON.parse(readFileSync(join(ROOT, "data/review/sets.json"), "utf8")).sets || [];
const builders = JSON.parse(readFileSync(join(ROOT, "data/review/builders.json"), "utf8")).builders || [];

const set = sets.find((s) => s.label === label);
if (!set) {
  console.log(`::error::세트를 찾을 수 없습니다 — "${label}" (data/review/sets.json)`);
  process.exit(1);
}

// 이 세트를 만드는 빌더 = 라벨이 같거나, 세트 카드 slug 와 접두로 대응되는 것
const base = (c) => c.replace(/-p\d+$/, "");
const mine = builders.filter(
  (b) => b.label === label || set.cards.some((c) => c.startsWith(b.label) || b.label.startsWith(base(c)))
);
if (!mine.length) {
  console.log(`::error::이 세트를 만드는 빌더가 없습니다 — "${label}". 새 소재의 첫 제작은 작업 세션(사람)이 필요합니다.`);
  process.exit(1);
}

const sh = (cmd, args) => {
  console.log(`▶ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} 실패 (exit ${r.status})`);
};

/* ① 데이터 → 카드 JSON (최신 데이터셋 기준으로 다시 계산) */
for (const b of mine) sh("node", [join(ROOT, b.cmd), ...(b.args || [])]);

/* ② 렌더 — 세트의 카드 slug 를 data/content 에서 찾아 전 장 그린다 */
const CONTENT = join(ROOT, "data/content");
function contentOf(slug) {
  const hits = [];
  for (const d of readdirSync(CONTENT).sort()) {
    const p = join(CONTENT, d, `${slug}.json`);
    if (existsSync(p)) hits.push(p);
  }
  return hits.pop(); // 가장 최근 날짜
}
/* ⚠️ 빌더가 방금 쓴 것을 렌더하는지 **확인한다.**
   `--publish` 없이 도는 빌더는 결과를 `data/out/_spike` 에 떨구는데, 여기는 `data/content`
   만 보므로 **옛 판본을 그리고 "재생산 완료"라고 말한다** — 그 상태로 확정까지 갔다
   (2026-08-16 실제로 겪었다: 확정 md5 가 옛 카드의 것이 될 뻔했다).
   조용히 고쳐 주지 않고 **멈춘다** — 어느 판본을 확정하는지는 짐작할 일이 아니다. */
function assertFreshest(slug, contentPath) {
  const spike = join(ROOT, "data/out/_spike", `${slug}.json`);
  if (!existsSync(spike)) return;
  if (statSync(spike).mtimeMs <= statSync(contentPath).mtimeMs) return;
  console.log(
    `::error::${slug} — 빌더가 방금 만든 것은 data/out/_spike 에 있는데 ` +
      `렌더 대상은 더 오래된 ${contentPath.replace(ROOT + "/", "")} 입니다.\n` +
      `   → data/review/builders.json 의 이 빌더 args 에 "--publish" 를 넣으세요.`,
  );
  process.exit(1);
}

const cardPaths = [];
for (const slug of set.cards) {
  const p = contentOf(slug);
  if (!p) {
    console.log(`::error::카드 JSON이 안 만들어졌습니다 — ${slug}`);
    process.exit(1);
  }
  assertFreshest(slug, p);
  const outDir = join(ROOT, "data/out", dirname(p).split("/").pop());
  sh("pnpm", ["--filter", "@wirit/renderer", "render", "--", "--data", p, "--out", outDir]);
  cardPaths.push(p);
}

/* ③ 캡션이 있으면 자동 검수(결정성·레이아웃·캡션·수치 대조)까지 */
const capName = set.caption || set.label;
const capPath = join(ROOT, "data/review/captions", `${capName}.txt`);
if (existsSync(capPath)) {
  const r = spawnSync(
    "npx",
    ["tsx", "src/review/reviewCli.ts", ...cardPaths, "--caption", capPath, "--label", label, "--out", join(ROOT, "data/review")],
    { cwd: join(ROOT, "packages/pipeline"), stdio: "inherit" }
  );
  if (r.status !== 0) {
    console.log(`::error::자동 검수가 이 카드를 막았습니다 — 위 리포트를 확인하세요`);
    process.exit(1);
  }
} else {
  console.log(`ℹ️ 캡션 없음(${capName}.txt) — 검수는 캡션 작성 후에 돕니다`);
}

console.log(`\n✅ 재생산 완료 — ${label} · ${cardPaths.length}장. 배포가 관제탑·내려받기에 반영합니다.`);
