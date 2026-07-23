/**
 * 국장 커버 — 시그니처 '1위(빨강·취소선) → 세계 꼴찌(블루·초대형)' 색 반전 타이포.
 * 근거: 파이낸셜뉴스(2026-07-20) "세계 1위 수익률이었는데…'세계 꼴찌'로 추락한 코스피".
 * 지수 숫자·박스 제외(오너 지시). 실행: node scripts/build-index-cover.mjs [year] [date] [photo]
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
  caption: "2026 코스피·코스닥",
  setup: `올해 세계 수익률 <s>1위</s>였던 <b>코스피</b>`,
  lead: "한 달 만에",
  crash: "세계 꼴찌",
  fact: `최근 한 달 주요국 지수 중 <em>최대 낙폭</em>`,
  source: "파이낸셜뉴스 · 2026.07.20",
  cta: "무슨 일이 있었나 <b>👉 다음장에서</b>",
};
writeFileSync(join(outDir, `index-cover-${year}.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ index-cover ${year} — '세계 1위→꼴찌' 반전 · 사진 ${photo}`);
