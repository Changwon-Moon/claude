/**
 * 인스타 스토리 하이라이트 커버 세트 생성 (wirit 브랜드 — 잉크 배경 + 흰 라인 아이콘).
 * 콘텐츠 기둥(부동산·증시·연봉·생활데이터·꿀팁) + 소개.
 * 실행: node scripts/build-highlight-covers.mjs [date]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-21";
const S = (body) =>
  `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const covers = [
  { key: "01-소개", word: 'wirit<span class="dot">.</span>' },
  {
    key: "02-부동산",
    icon: S('<path d="M18 49 L50 23 L82 49"/><path d="M28 45 V80 H72 V45"/><path d="M44 80 V61 H56 V80"/>'),
  },
  {
    key: "03-증시경제",
    icon: S('<polyline points="20,72 40,54 54,62 80,30"/><polyline points="62,30 80,30 80,48"/>'),
  },
  { key: "04-연봉돈", won: true },
  {
    key: "05-생활데이터",
    icon: S('<rect x="22" y="50" width="15" height="30"/><rect x="42.5" y="36" width="15" height="44"/><rect x="63" y="24" width="15" height="56"/>'),
  },
  {
    key: "06-꿀팁트렌드",
    icon: S('<path d="M50 20 a22 22 0 0 1 13 40 c-3 2 -4 5 -4 9 H41 c0 -4 -1 -7 -4 -9 a22 22 0 0 1 13 -40 Z"/><path d="M42 80 h16"/><path d="M45 87 h10"/>'),
  },
];

const outDir = join(ROOT, `data/content/${date}/highlights`);
mkdirSync(outDir, { recursive: true });
for (const c of covers) {
  const obj = { template: "highlight-cover@1", date, ...c };
  delete obj.key;
  writeFileSync(join(outDir, `${c.key}.json`), JSON.stringify(obj, null, 2) + "\n");
}
console.log(`✅ 하이라이트 커버 ${covers.length}종 생성 → data/content/${date}/highlights/`);
console.log(`   ${covers.map((c) => c.key).join(" · ")}`);
