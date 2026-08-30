#!/usr/bin/env node
/**
 * 문서 링크 검사 — 살아있는 문서가 없는 파일을 가리키지 않게.
 *
 * 왜 필요한가 (2026-08-30):
 *   문서를 archive 로 옮기는 정리를 하다 보면 남은 문서가 옛 주소를 가리킨 채 남는다.
 *   그러면 다음 세션이 "그 문서를 읽어라"는 지시를 따라갔다가 없는 파일에 부딪힌다.
 *   실제로 `docs/CONTROL_TOWER.md` 가 archive 로 간 뒤 코드 주석이 옛 주소를 계속 가리키고 있었다.
 *
 *   손으로 고치면 언젠가 멈춘다. 그리고 멈춘 뒤에는 아무도 눈치채지 못한다.
 *
 * 검사하지 않는 곳:
 *   - `docs/archive/` · `docs/history/` — **사료다.** 그때의 문서가 그때의 주소를 가리키는 건
 *     정상이고, 고치면 오히려 역사가 왜곡된다. 사료는 읽는 물건이지 따라가는 물건이 아니다.
 *   - `node_modules` · `.git`
 *   - `http(s)://` 바깥 링크 — 이 검사는 망을 쓰지 않는다
 *
 * 쓰는 법: node scripts/check-doc-links.mjs   (깨진 게 있으면 종료코드 1)
 */
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = ["node_modules", ".git"];        // 어느 깊이에 있든 건너뛴다
const SKIP_PATHS = [`docs${"/"}archive`, `docs${"/"}history`]; // 사료 — 그때의 주소를 가리키는 게 정상

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP_DIRS.includes(e)) continue;            // ← 하위 패키지의 node_modules 도 잡는다
    const p = join(dir, e);
    const rel = relative(ROOT, p);
    if (SKIP_PATHS.some((s) => rel === s || rel.startsWith(s + "/"))) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (e.endsWith(".md")) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const broken = [];

for (const f of files) {
  const text = readFileSync(f, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/\]\(([^)\s]+\.md)(?:#[^)]*)?\)/g)) {
      const link = m[1];
      if (/^https?:/.test(link)) continue;
      const target = normalize(join(dirname(f), link));
      if (!existsSync(target)) {
        broken.push({ file: relative(ROOT, f), line: i + 1, link });
      }
    }
  });
}

console.log(`\n문서 링크 검사 — 살아있는 문서 ${files.length}개 (사료 docs/archive 는 제외)`);
if (!broken.length) {
  console.log("✅ 깨진 링크 없음\n");
  process.exit(0);
}
for (const b of broken) console.log(`  ❌ ${b.file}:${b.line} → ${b.link}`);
console.log(`\n❌ ${broken.length}건. 옮긴 문서라면 새 주소로, 없앤 문서라면 링크를 지웁니다.\n`);
process.exit(1);
