/**
 * 파서 셀프테스트 (네트워크 불필요).
 * 실행: pnpm --filter @wirit/collectors selftest
 * 빌드 환경에서 외부 API가 막혀 있어도, 데이터 해석 로직의 정확성을 여기서 검증한다.
 */
import { parseStooqDailyCsv, monthlySample } from "./parse/stooq.js";
import { parseEcosJson } from "./parse/ecos.js";
import { toQuote } from "./sources/usMarket.js";
import { ecosToQuote } from "./sources/krRates.js";
import {
  STOOQ_SPX_CSV,
  STOOQ_WITH_GAPS_CSV,
  ECOS_FX_JSON,
  ECOS_ERROR_JSON,
} from "./__fixtures__/fixtures.js";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.error(`  ❌ ${name} ${detail}`);
  }
}

console.log("[Stooq CSV 파서]");
const spx = parseStooqDailyCsv(STOOQ_SPX_CSV);
check("행 5개 파싱", spx.length === 5, `got ${spx.length}`);
check("최신 종가 6820.50", spx[spx.length - 1].close === 6820.5);
const gaps = parseStooqDailyCsv(STOOQ_WITH_GAPS_CSV);
check("결측(N/D) 스킵 → 2행", gaps.length === 2, `got ${gaps.length}`);

console.log("[미국지수 Quote 계산]");
const q = toQuote("^SPX", "S&P 500", spx);
check("value=6820.5", q.value === 6820.5);
check("changeAbs=+10.5", q.changeAbs === 10.5, `got ${q.changeAbs}`);
check("changePct≈0.15", q.changePct === 0.15, `got ${q.changePct}`);
check("dir=up", q.dir === "up");
check("asOf=2026-07-17", q.asOf === "2026-07-17");

console.log("[월 샘플링]");
const sampled = monthlySample(spx, 13);
check("포인트 수 ≤ 원본", sampled.length <= spx.length);
check("최신 포인트 유지", sampled[sampled.length - 1].close === 6820.5);

console.log("[ECOS 파서/Quote]");
const fx = parseEcosJson(ECOS_FX_JSON);
check("환율 3포인트", fx.length === 3, `got ${fx.length}`);
const fxQuote = ecosToQuote(
  { symbol: "USD/KRW", label: "원/달러 환율", statCode: "731Y001", itemCode: "0000001", cycle: "D", count: 30 },
  fx,
);
check("환율 value=1495.2", fxQuote.value === 1495.2);
check("환율 changeAbs=+4.3", fxQuote.changeAbs === 4.3, `got ${fxQuote.changeAbs}`);
check("환율 asOf=2026-07-17", fxQuote.asOf === "2026-07-17");

console.log("[ECOS 에러 응답 처리]");
let threw = false;
try {
  parseEcosJson(ECOS_ERROR_JSON);
} catch {
  threw = true;
}
check("에러 응답은 throw", threw);

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail > 0) process.exit(1);
