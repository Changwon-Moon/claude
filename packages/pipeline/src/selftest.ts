/**
 * generate 변환 셀프테스트 (네트워크 불필요).
 * 실행: pnpm --filter @wirit/pipeline selftest
 */
import { generateMarketUs } from "./generate/marketUs.js";
import { formatNum, formatDelta, formatDateShort, formatYearMonth } from "./format.js";
import type { RawCollection } from "./types.js";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = ""): void {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.error(`  ❌ ${name} ${detail}`); }
}

console.log("[포맷 헬퍼]");
check("formatNum 천단위", formatNum(6820.5) === "6,820.50", formatNum(6820.5));
check("formatDelta 절대값", formatDelta(-15.38, -1.92) === "15.38 (1.92%)", formatDelta(-15.38, -1.92));
check("formatDateShort", formatDateShort("2026-07-17") === "26.07.17(금)", formatDateShort("2026-07-17"));
check("formatYearMonth", formatYearMonth("2025-07-18") === "2025.07");

console.log("[미국 증시 변환]");
const raw: RawCollection = {
  source: "us-market",
  asOf: "2026-07-17",
  sourceName: "Stooq",
  quotes: [
    { symbol: "^SPX", label: "S&P 500", value: 6820.5, changeAbs: 10.5, changePct: 0.15, dir: "up", asOf: "2026-07-17" },
    { symbol: "^NDQ", label: "나스닥", value: 22450.2, changeAbs: -80.4, changePct: -0.36, dir: "down", asOf: "2026-07-17" },
    { symbol: "^DJI", label: "다우존스", value: 44100.0, changeAbs: 120.0, changePct: 0.27, dir: "up", asOf: "2026-07-17" },
  ],
  series: [
    { symbol: "^SPX", label: "S&P 500", points: [
      { date: "2025-07-18", close: 6400 },
      { date: "2026-01-18", close: 6600 },
      { date: "2026-07-17", close: 6820.5 },
    ] },
  ],
};
const c = generateMarketUs(raw);
check("template", c.template === "market-daily@1");
check("flag=us", c.flag === "us");
check("title", c.title === "간밤의 미국 증시");
check("date 포맷", c.date === "26.07.17(금)", c.date);
check("지수 3개", c.indices.length === 3);
check("코스피 대신 S&P value", c.indices[0].value === "6,820.50", c.indices[0].value);
check("나스닥 down delta", c.indices[1].dir === "down" && c.indices[1].delta === "80.40 (0.36%)", c.indices[1].delta);
check("featured chart 3점", c.featured?.chart.length === 3);
check("featured chartFrom", c.featured?.chartFrom === "2025.07", c.featured?.chartFrom);
check("featured chartTo", c.featured?.chartTo === "2026.07", c.featured?.chartTo);
check("source", c.source.name === "Stooq" && c.source.asOf === "2026-07-17");

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail > 0) process.exit(1);
