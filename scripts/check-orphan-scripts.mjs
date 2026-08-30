#!/usr/bin/env node
/**
 * 고아 스크립트 검사 — 아무도 부르지 않는 mjs 를 센다.
 *
 * 왜 필요한가 (2026-08-30 실측):
 *   `scripts/*.mjs` 132개 중 **18개(2,006줄)가 아무도 안 부르는 상태**였다.
 *   워크플로도, `builders.json` 도, 다른 코드도, 문서도 그 이름을 모르고 있었다.
 *
 *   원인은 하나로 모인다 — **카드를 만들 때 빌더는 쓰고 `builders.json` 등록은 잊는다.**
 *   등록을 안 하면 `rebuild-cards.mjs` 가 안 부르고, 실사이트에도 안 뜨고,
 *   그러면 아무도 그 스크립트를 다시 안 본다. 만든 사람도 다음 주면 잊는다.
 *   실제로 「대장 도감」 25편 시리즈가 1화만 나가고 빌더가 명세에서 빠진 채 멈춰 있었다.
 *
 *   고아 자체는 죄가 아니다. 문제는 **고아인 줄 모르는 것**이다. 그래서 센다.
 *
 * 무엇을 "부른다"로 보나:
 *   ① `.github/workflows/*.yml` 이 실행한다
 *   ② `data/review/builders.json` 에 등록돼 있다(재생산 대상)
 *   ③ 다른 스크립트·패키지가 import 하거나 spawn 한다
 *   ④ 살아있는 문서(md)가 이름을 적어 뒀다 — 사람이 손으로 부르는 물건이다
 *   ⑤ `scripts/lib/` 안에 있다 — 공용 모듈이라 import 로만 쓰인다
 *
 * 쓰는 법:
 *   node scripts/check-orphan-scripts.mjs            # 세기만 한다
 *   node scripts/check-orphan-scripts.mjs --strict   # 고아가 있으면 종료코드 1
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STRICT = process.argv.includes("--strict");

/** 참조를 찾을 곳 — 여기 어디에도 이름이 없으면 고아다 */
const HAYSTACK_DIRS = [".github/workflows", "scripts", "packages", "data", "docs", "research", "company", "templates"];
const HAYSTACK_EXT = [".yml", ".yaml", ".mjs", ".js", ".ts", ".json", ".md"];
/** 사료는 보지 않는다 — 옛 문서가 옛 스크립트를 적어 둔 건 참조가 아니라 기록이다 */
const HAYSTACK_SKIP = ["docs/archive", "docs/history", "node_modules", ".git"];

function collect(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".git") continue;
    const p = join(dir, e);
    const rel = relative(ROOT, p);
    if (HAYSTACK_SKIP.some((s) => rel === s || rel.startsWith(s + "/"))) continue;
    if (statSync(p).isDirectory()) collect(p, out);
    else if (HAYSTACK_EXT.some((x) => e.endsWith(x))) out.push(p);
  }
  return out;
}

const haystack = HAYSTACK_DIRS.flatMap((d) => collect(join(ROOT, d)));
const scripts = readdirSync(join(ROOT, "scripts"))
  .filter((f) => f.endsWith(".mjs"))
  .map((f) => `scripts/${f}`);

/* 파일별 본문을 한 번만 읽어 둔다 — 스크립트마다 전수 재읽기는 느리다 */
const texts = haystack.map((p) => ({ p: relative(ROOT, p), t: readFileSync(p, "utf8") }));

const orphans = [];
for (const s of scripts) {
  const base = s.replace("scripts/", "");
  const hit = texts.find(({ p, t }) => p !== s && t.includes(base));
  if (!hit) orphans.push(s);
}

console.log(`\n고아 스크립트 검사 — scripts/*.mjs ${scripts.length}개`);
if (!orphans.length) {
  console.log("✅ 모두 어딘가에서 불립니다\n");
  process.exit(0);
}

console.log(`\n⚠️  아무도 안 부르는 스크립트 ${orphans.length}개:\n`);
for (const o of orphans) console.log(`    ${o}`);
console.log(`
  판정하는 법 — 셋 중 하나다:
   · 살릴 카드다        → data/review/builders.json 에 한 줄 넣는다(그래야 실사이트에 뜬다)
   · 사람이 부르는 도구다 → 문서에 쓰는 법을 적는다
   · 임무가 끝났다      → 지운다. git 이 보관하므로 되살릴 수 있다
                          (은퇴 기록: docs/archive/RETIRED_SCRIPTS.md)
`);
process.exit(STRICT ? 1 : 0);
