/**
 * 파서 셀프테스트 (네트워크 불필요).
 * 실행: pnpm --filter @wirit/collectors selftest
 * 빌드 환경에서 외부 API가 막혀 있어도, 데이터 해석 로직의 정확성을 여기서 검증한다.
 */
import { parseStooqDailyCsv, monthlySample } from "./parse/stooq.js";
import { parseEcosJson } from "./parse/ecos.js";
import { parseRss, dedupeByTitle } from "./parse/rss.js";
import {
  hasLever,
  extractTrendKeywords,
  matchDemand,
  renderBoard,
} from "./sources/researchSignals.js";
import { toQuote } from "./sources/usMarket.js";
import { ecosToQuote } from "./sources/krRates.js";
import {
  parseCommonsSearch,
  pickBestFile,
  parseImageInfo,
  isLicenseSafe,
} from "./sources/logoFetch.js";
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

console.log("[RSS 파서 (소재 신호)]");
{
  const RSS_FIXTURE = `<?xml version="1.0"?><rss><channel>
  <item><title>10대 건설사 평균연봉 1위는 &quot;삼성물산&quot;</title><link>https://ex.com/1</link><pubDate>Sun, 19 Jul 2026 01:00:00 GMT</pubDate><source url="https://ex.com">매일경제</source></item>
  <item><title><![CDATA[코스피 2,900 돌파…사상 최고]]></title><link>https://ex.com/2</link></item>
  <item><title>10대 건설사 평균연봉 1위는 "삼성물산" - 한국경제</title><link>https://ex.com/3</link></item>
  <item><title>링크 없는 항목</title></item>
  </channel></rss>`;
  const items = parseRss(RSS_FIXTURE);
  check("item 3건 파싱(링크없는 것 제외)", items.length === 3, `got ${items.length}`);
  check("엔티티 복원", items[0].title.includes('"삼성물산"'), items[0].title);
  check("CDATA 처리", items[1].title === "코스피 2,900 돌파…사상 최고", items[1].title);
  check("source 추출", items[0].source === "매일경제");
  const deduped = dedupeByTitle(items);
  check("유사중복 제거(꼬리 언론사)", deduped.length === 2, `got ${deduped.length}`);
  check("레버 감지(1위/돌파)", hasLever(items[0].title) && hasLever(items[1].title));
  check("레버 없음", !hasLever("오늘 날씨가 흐립니다"));
}

console.log("[트렌드분석 v1: 수요 신호]");
{
  const trendItems = [
    { title: "SK하이닉스", link: "x" },
    { title: "아파트 실거래가", link: "x" },
  ];
  const kws = extractTrendKeywords(trendItems);
  check("키워드 추출(복합어 토큰 포함)", kws.includes("SK하이닉스") && kws.includes("아파트") && kws.includes("실거래가"), kws.join(","));
  check("수요 매칭: 겹침", matchDemand("SK하이닉스 3분기 실적 사상 최대", kws));
  check("수요 매칭: 부분어(아파트)", matchDemand("서울 아파트값 상승", kws));
  check("수요 매칭: 안겹침", !matchDemand("오늘의 날씨와 미세먼지", kws));

  const board = renderBoard(
    "2026-07-19",
    [
      { topic: "부동산", tier: "main", items: [{ title: "서울 아파트 1위", link: "http://a", lever: true, demand: true }] },
      { topic: "검색 트렌드", tier: "sub", items: trendItems.map(t => ({ ...t, lever: false })) },
    ],
    kws,
  );
  check("보드에 📈 표시", board.includes("🔥 📈"));
  check("보드에 급상승 검색어 줄", board.includes("오늘의 급상승 검색어"));
}

console.log("\n[로고 취득 파서 — Wikimedia]");
{
  const search = JSON.stringify({
    query: {
      search: [
        { title: "File:SK hynix logo.svg" },
        { title: "File:SK Hynix building.jpg" },
        { title: "File:Skhynix icon.png" },
      ],
    },
  });
  const titles = parseCommonsSearch(search);
  check("검색: File 제목 3개", titles.length === 3);
  check("최적 선택: svg·logo 우선", pickBestFile(titles) === "File:SK hynix logo.svg", pickBestFile(titles) || "");
  check("사진류 회피", pickBestFile(["File:X building.jpg", "File:X logo.svg"]) === "File:X logo.svg");
  check("svg/png 없으면 null", pickBestFile(["File:X.pdf"]) === null);

  const info = JSON.stringify({
    query: {
      pages: {
        "-1": {
          imageinfo: [
            {
              url: "https://upload.wikimedia.org/x/SK_hynix_logo.svg",
              mime: "image/svg+xml",
              extmetadata: { LicenseShortName: { value: "Public domain" } },
            },
          ],
        },
      },
    },
  });
  const parsed = parseImageInfo(info);
  check("imageinfo: URL 추출", parsed?.url.endsWith("SK_hynix_logo.svg") === true);
  check("imageinfo: 라이선스 추출", parsed?.license === "Public domain");
  check("라이선스 안전: PD-textlogo 허용", isLicenseSafe("PD-textlogo"));
  check("라이선스 안전: CC-BY 허용", isLicenseSafe("CC BY-SA 4.0"));
  check("라이선스 거부: non-free", !isLicenseSafe("Non-free logo"));
  check("라이선스 거부: 빈값", !isLicenseSafe(""));
}

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail > 0) process.exit(1);
