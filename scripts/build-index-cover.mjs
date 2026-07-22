/**
 * 국장 성적표 어그로 커버 — 주식 사진 + 강한 후킹 + '주요국 증시 하락률 1위'(팩트체크·출처 표기).
 * 지수 숫자는 커버에서 제외(오너 지시). 실행: node scripts/build-index-cover.mjs [year] [date] [photo]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const year = process.argv[2] || "2026";
const date = process.argv[3] || "2026-07-26";
const photo = process.argv[4] || "stock-board.jpg";

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "index-cover@1",
  date,
  photo,
  caption: `${year} 코스피·코스닥`,
  hook: `사상 최고 찍고\n<span class="em">한 달 만에</span>`,
  // 팩트체크: 뉴시스(2026-07-21) "미국 멀쩡한데 코스피 -28%…주요국 하락 1위" → '주요국' 한정 표기
  rankLabel: `주요국 증시<br><em>하락률</em>`,
  rankNo: "1",
  sourceNote: "· 최근 한 달 주요국 지수 · 뉴시스(2026.7)",
  cta: "무슨 일이 있었나 👉 다음장에서",
};
writeFileSync(join(outDir, `index-cover-${year}.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ index-cover ${year} — 주요국 하락률 1위 · 사진 ${photo}`);
