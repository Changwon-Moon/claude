/**
 * 서울 행정구별 대장 APT — 캐러셀 후킹 커버(질문형 + 정답 가리기, 다크 사진).
 * 최고가 1위 숫자는 국토부 실거래(최근 6개월)에서 코드로 산출 — 창작 금지(오보 0).
 * 실행: node scripts/build-estate-cover.mjs <84|59> <photo파일명> [date]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const metric = process.argv[2] || "84";
const photo = process.argv[3] || "seoul-apart-night.jpg";
const date = process.argv[4] || "2026-07-21";
const BAND = metric === "59" ? [58, 61] : [83, 86];
const PYEONG = metric === "59" ? "25평" : "34평";

// 최근 6개월 데이터에서 밴드 최고가 1위 산출(대장 엔진과 동일 로직)
const molitDir = join(ROOT, "data/datasets/molit");
const files = readdirSync(molitDir).filter((f) => f.endsWith(".json"));
const yms = [...new Set(files.map((f) => f.match(/-(\d{6})\.json$/)?.[1]).filter(Boolean))].sort();
const use6 = yms.slice(-6);
let top = 0;
for (const f of files) {
  const ym = f.match(/-(\d{6})\.json$/)?.[1];
  if (!use6.includes(ym)) continue;
  const d = JSON.parse(readFileSync(join(molitDir, f), "utf8"));
  for (const t of d.trades) {
    if (t.canceled || !t.priceWon || !t.aptNm) continue;
    if (!(t.area >= BAND[0] && t.area < BAND[1])) continue;
    if (t.priceWon > top) top = t.priceWon;
  }
}
const topEok = top / 1e8;
const eok = (v) => (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1));

// 서울 공식 심볼마크(작게, 캡션용)
const emblem = readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg"), "utf8")
  .replace(/<\?xml[^>]*\?>/i, "")
  .replace(/<metadata>[\s\S]*?<\/metadata>/i, "")
  .replace(/<svg\s/i, '<svg class="emb" preserveAspectRatio="xMidYMid meet" ')
  .replace(/\swidth="[^"]*"/i, "")
  .replace(/\sheight="[^"]*"/i, "")
  .replace(/\senable-background="[^"]*"/i, "")
  .trim();

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const out = {
  template: "estate-cover@1", date, photo, emblem,
  caption: "국토부 실거래 · 서울 25개 자치구",
  hook: `서울에서 가장 비싼\n<span class="pt">${PYEONG}</span>은?`,
  revealLabel: "서울 최고가 1위",
  revealValue: eok(topEok),
  revealUnit: "억",
  cta: `👉 <b>우리 구 대장</b>은 몇 위? 다음장에서`,
};
writeFileSync(join(outDir, `estate-cover-${metric}.json`), JSON.stringify(out, null, 2) + "\n");
console.log(`✅ 커버(${PYEONG}) — 최고가 1위 ${eok(topEok)}억 · 사진 ${photo}`);
