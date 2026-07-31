/**
 * sets.json 에 실린 카드를 전부 data/out/{날짜}/ 로 렌더한다 — 관제탑 썸네일의 원천.
 *
 * ── 왜 이 파일인가 (2026-07-31, 코워크에서 백지 clone 재현 중 발견)
 * `data/out/` 은 gitignore 대상이다. 그래서 **갓 clone 한 환경에는 카드 PNG가 하나도 없고**,
 * 관제탑은 썸네일을 못 그린다 → smoke-tower 가 "보관함에 카드 실물 썸네일" ·
 * "결재 화면에 나갈 카드 실물" 두 항에서 떨어진다.
 *
 * 기존 작업 환경에서는 예전에 만든 PNG가 남아 있어 그냥 통과한다.
 * 즉 **정말 백지에서 복제될 때만 드러나는 구멍**이었다. 인수인계는 문서가 아니라
 * 재현으로 끝나야 한다는 §1 의 원칙이 이 스크립트를 만든 이유다.
 *
 * rebuild-cards.mjs 는 카드 JSON 을 만들고 검수까지 하지만, PNG 를 data/out 에 남기지는
 * 않는다(검수는 임시 렌더). 그 빈자리를 이 스크립트가 채운다.
 *
 * 실행: node scripts/render-sets.mjs
 */
import { readFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SETS = join(ROOT, "data/review/sets.json");
const CONTENT = join(ROOT, "data/content");

if (!existsSync(SETS)) {
  console.log("::warning::발행 명세(data/review/sets.json)가 없습니다 — 렌더를 건너뜁니다.");
  process.exit(0);
}
if (!existsSync(CONTENT)) {
  console.log("::warning::data/content 가 없습니다 — 먼저 `node scripts/rebuild-cards.mjs` 로 카드 JSON을 만드세요.");
  process.exit(0);
}

// 카드 JSON 은 날짜 폴더 아래 있다 — 가장 최근 것을 쓴다(rebuild-cards.mjs 와 같은 규칙)
const days = readdirSync(CONTENT)
  .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
  .sort()
  .reverse();

const { sets } = JSON.parse(readFileSync(SETS, "utf8"));
const targets = [];
for (const s of Array.isArray(sets) ? sets : []) {
  for (const slug of s.cards || []) {
    for (const d of days) {
      const p = join(CONTENT, d, `${slug}.json`);
      if (existsSync(p)) {
        targets.push({ date: d, slug, path: p });
        break;
      }
    }
  }
}

if (!targets.length) {
  console.log("::warning::렌더할 카드를 찾지 못했습니다 — 먼저 `node scripts/rebuild-cards.mjs` 를 돌리세요.");
  process.exit(0);
}

console.log(`🖼  카드 렌더 ${targets.length}장 → data/out/`);
let ok = 0;
let bad = 0;
for (const t of targets) {
  const outDir = join(ROOT, "data/out", t.date);
  mkdirSync(outDir, { recursive: true });
  // 렌더러는 절대경로를 요구한다(HANDOFF §4)
  const r = spawnSync(
    "pnpm",
    ["-s", "--filter", "@wirit/renderer", "render", "--data", t.path, "--out", outDir],
    { cwd: ROOT, stdio: "pipe" },
  );
  if (r.status === 0) {
    ok++;
    console.log(`  ✅ ${t.date}/${t.slug}`);
  } else {
    bad++;
    console.log(`::warning::렌더 실패 — ${t.date}/${t.slug} (exit ${r.status})`);
    const err = (r.stderr || "").toString().trim().split("\n").slice(-3).join("\n");
    if (err) console.log(`     ${err}`);
  }
}

console.log(`\n🖼  렌더 완료 — 성공 ${ok} · 실패 ${bad}`);
console.log("   다음: node scripts/build-tower-site.mjs && node scripts/smoke-tower.mjs");

// 일부 실패해도 나머지 카드·정보는 정상 표시돼야 한다(rebuild-cards.mjs 와 같은 방침).
// 실패는 위 ::warning 으로 보인다 — 조용히 빠뜨리지 않는다.
process.exit(0);
