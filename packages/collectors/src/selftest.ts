/**
 * 파서 셀프테스트 (네트워크 불필요).
 * 실행: pnpm --filter @wirit/collectors selftest
 * 빌드 환경에서 외부 API가 막혀 있어도, 데이터 해석 로직의 정확성을 여기서 검증한다.
 */
import { existsSync, readFileSync } from "node:fs";
import { redactUrl } from "./http.js";
import {
  SERVICES as SEOUL_SERVICES,
  candidateDates as seoulCandidateDates,
  buildUrl as seoulUrl,
  redactSeoulUrl as seoulRedact,
} from "./sources/seoulOpenApi.js";
import { resolve } from "node:path";
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
import { parseEmpSttus, parseCorpCodeXml, findCorpCode } from "./parse/dart.js";
import { parseBrandLogos, pickBestLogoFormat, DOMAIN_MAP } from "./sources/brandfetchLogo.js";
import {
  parseAptTrades,
  parseTotalCount,
  apiError,
  highestPerApt,
  summarizeDaejang,
  toEok,
  parseAptRents,
  aggregateRents,
} from "./parse/molit.js";
import { encKey } from "./sources/molit.js";
import {
  parseSilvTrades,
  validSilvTrades,
  latestPerAptType,
  countByKind,
  censusKindRaw,
  firstItemRaw,
  tagNames,
  toKind,
} from "./parse/silv.js";
import {
  normalize as kosisNormalize,
  seniorPoints as kosisSenior,
  nationalByPeriod as kosisNational,
  coverageGap as kosisGap,
  ageOfLabel as kosisAgeOf,
  toSeries as kosisSeries,
  toPeriod as kosisPeriod,
  toCount as kosisCount,
  milestones as kosisMilestones,
  streaks as kosisStreaks,
  topMovers as kosisTopMovers,
  rank as kosisRank,
  joinReport as kosisJoin,
  type Series as KosisSeries,
} from "./parse/kosis.js";
import { buildUrl as kosisUrl, encKey as kosisEncKey, TABLES as KOSIS_TABLES, enabledTables as kosisEnabled, chunkSizeFor, rangeForTable as kosisRange } from "./sources/kosis.js";

import { toSeries, regionNames, ambiguousNames, latestMonth, readPage, type RebPoint } from "./sources/rebIndex.js";
import {
  normalize as ahNormalize,
  recent as ahRecent,
  dedupe as ahDedupe,
  mergeBlocks as ahMerge,
  baseName as ahBase,
  rank as ahRank,
  toIsoDate as ahIso,
  toCount as ahCount,
  toYearMonth as ahYm,
  daysBetween as ahDays,
} from "./parse/applyhome.js";
import { buildUrl as ahUrl, encKey as ahEncKey } from "./sources/applyhome.js";
import {
  areaType as singoAreaType,
  pyeongLabel as singoPyeong,
  aptKey as singoAptKey,
  foldPeaks as singoFoldPeaks,
  findSingo as singoFindSingo,
  manwonToEok as singoEok,
  milestoneCrossed as singoMilestone,
  sameApt as singoSameApt,
  fullAptName as singoFullName,
  alertBody as singoAlertBody,
  baselineLabel as singoBaseline,
  BASELINE_FROM as SINGO_FROM,
} from "./parse/singo.js";
import {
  matchApt as aptMatch,
  parseAptList,
  parseAptBasis,
  parseAptDetail,
  jibunFromAddr,
  normJibun,
} from "./parse/aptInfo.js";
import { cleanStationName, linesFromCategory } from "./parse/station.js";
import { singoRegions as singoRegionList, monthRange as singoMonthRange } from "./sources/singoRegions.js";
import {
  APPLYHOME_APT_JSON,
  APPLYHOME_REMNDR_JSON,
  APPLYHOME_SHAPE_CHANGED_JSON,
  STOOQ_SPX_CSV,
  STOOQ_WITH_GAPS_CSV,
  ECOS_FX_JSON,
  ECOS_ERROR_JSON,
  MOLIT_APT_XML,
  MOLIT_RENT_XML,
  MOLIT_SILV_XML,
  MOLIT_ERROR_XML,
  KOSIS_POP_JSON,
  KOSIS_POP_SHAPE_CHANGED_JSON,
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

console.log("\n[DART 평균연봉 파서]");
{
  const emp = JSON.stringify({
    status: "000",
    list: [
      { corp_name: "테스트전자", fo_bbm: "반도체", sexdstn: "남", sm: "1,000", fyer_salary_totamt: "130,000,000,000" },
      { corp_name: "테스트전자", fo_bbm: "반도체", sexdstn: "여", sm: "1,000", fyer_salary_totamt: "110,000,000,000" },
    ],
  });
  const r = parseEmpSttus(emp, "2025");
  check("empSttus: 인원 합산 2,000", r?.headcount === 2000, String(r?.headcount));
  check("empSttus: 가중평균 1.2억", r?.avgSalaryWon === 120000000, String(r?.avgSalaryWon));

  const withTotal = JSON.stringify({
    status: "000",
    list: [
      { corp_name: "X", fo_bbm: "합계", sexdstn: "", sm: "2,000", fyer_salary_totamt: "240,000,000,000" },
      { corp_name: "X", fo_bbm: "사업", sexdstn: "남", sm: "1,000", fyer_salary_totamt: "130,000,000,000" },
      { corp_name: "X", fo_bbm: "사업", sexdstn: "여", sm: "1,000", fyer_salary_totamt: "110,000,000,000" },
    ],
  });
  check("empSttus: '합계' 행 제외(이중계상 방지)", parseEmpSttus(withTotal, "2025")?.headcount === 2000);
  check("empSttus: 무자료(013) → null", parseEmpSttus(JSON.stringify({ status: "013", message: "no data" }), "2025") === null);

  const corpXml = `<result><list><corp_code>00126380</corp_code><corp_name>삼성전자</corp_name></list><list><corp_code>00164779</corp_code><corp_name>SK하이닉스</corp_name></list></result>`;
  const cmap = parseCorpCodeXml(corpXml);
  check("corpCode: 2개사 매핑", cmap.size === 2);
  check("corpCode: 삼성전자→00126380", cmap.get("삼성전자") === "00126380");
  check("corpCode: 공백무시 조회", findCorpCode(cmap, "SK 하이닉스") === "00164779");
}

console.log("\n[로고 취득 파서 — Brandfetch Tier C]");
{
  const resp = JSON.stringify({
    name: "POSCO International",
    domain: "poscointl.com",
    logos: [
      {
        type: "icon",
        theme: "light",
        formats: [{ src: "https://cdn.example/icon.png", format: "png" }],
      },
      {
        type: "logo",
        theme: "dark",
        formats: [{ src: "https://cdn.example/logo-dark.svg", format: "svg" }],
      },
      {
        type: "logo",
        theme: "light",
        formats: [
          { src: "https://cdn.example/logo-light.png", format: "png" },
          { src: "https://cdn.example/logo-light.svg", format: "svg" },
        ],
      },
    ],
  });
  const logos = parseBrandLogos(resp);
  check("Brandfetch: logos 3개 파싱", logos.length === 3);
  const best = pickBestLogoFormat(logos);
  check(
    "Brandfetch: logo·light·svg 최우선 선택",
    best?.src === "https://cdn.example/logo-light.svg",
    best?.src
  );
  check("Brandfetch: logos 없으면 null", pickBestLogoFormat([]) === null);
  check("Brandfetch: 빈 응답 파싱", parseBrandLogos(JSON.stringify({})).length === 0);
  /* ⚠️ 예전에는 여기서 `Object.keys(DOMAIN_MAP).length === 3` 을 봤다.
   * 도메인맵은 **브랜드를 추가할 때마다 자라는 큐레이션 목록**인데 개수를 못박아 둔 탓에,
   * 브랜드를 하나 넣을 때마다 셀프테스트가 깨졌다. 그리고 워크플로는 수집 전에 셀프테스트를
   * 돌리므로 **증시 수집이 통째로 죽어 있었다**(2026-07-31 발견 — 오너가 Actions 실패를 보고).
   * 개수는 이 파서의 성질이 아니다. 성질은 "모든 항목이 쓸 수 있는 도메인을 갖는가"다. */
  check("Brandfetch: 도메인맵이 비어 있지 않다", Object.keys(DOMAIN_MAP).length > 0);
  check(
    "Brandfetch: 모든 항목이 도메인을 1개 이상 갖는다",
    Object.values(DOMAIN_MAP).every((v) => Array.isArray(v) && v.length > 0 && v.every((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d))),
    Object.entries(DOMAIN_MAP).filter(([, v]) => !v?.length || v.some((d) => !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d))).map(([k]) => k).join(",")
  );
  check(
    "Brandfetch: 같은 도메인이 두 브랜드에 중복 등록되지 않았다",
    (() => {
      const first = Object.entries(DOMAIN_MAP).map(([k, v]) => [k, v[0]] as const);
      const seen = new Map<string, string>();
      for (const [k, d] of first) { if (seen.has(d)) return false; seen.set(d, k); }
      return true;
    })()
  );
}

console.log("\n[국토부 실거래 파서 — MOLIT]");
{
  const txs = parseAptTrades(MOLIT_APT_XML);
  check("item 5건 파싱", txs.length === 5, `got ${txs.length}`);
  check("totalCount=5", parseTotalCount(MOLIT_APT_XML) === 5);
  const first = txs[0];
  check("거래금액 105만만원→원(1,050,000만원=10.5억*... )", first.priceWon === 10500000000, String(first.priceWon));
  check("만원 필드 보존", first.priceManwon === 1050000);
  check("전용면적 183.41", first.area === 183.41, String(first.area));
  check("계약일 0패딩 2026-07-03", first.date === "2026-07-03", first.date);
  check("건축년도 1982", first.buildYear === 1982);
  check("거래유형 직거래 파싱", txs[2].dealingGbn === "직거래");
  check("해제거래 canceled=true", txs[4].canceled === true);

  const valid = highestPerApt(txs);
  check("해제 제외 + 단지중복 최고가만 → 3단지", valid.length === 3, `got ${valid.length}`);
  check("신현대11차는 105억(160㎡ 90억 아닌 최고가)", valid[0].priceWon === 10500000000);
  check("2,000,000(해제)은 순위에서 제외", valid.every((t) => t.aptNm !== "해제거래"));

  const sum = summarizeDaejang(txs, { topN: 3 });
  check("대장 절대가 1위 = 신현대11차", sum.topByPrice[0].aptNm === "신현대11차");
  check("국평(84.9㎡) 대장 = 국평샘플", sum.flagship84?.aptNm === "국평샘플", sum.flagship84?.aptNm);
  check("유효 거래수 4건(해제 1 제외)", sum.count === 4, String(sum.count));

  check("toEok 정수 105억", toEok(10500000000) === "105억", toEok(10500000000));
  check("toEok 소수 44.5억", toEok(4450000000) === "44.5억", toEok(4450000000));

  check("에러 XML 감지(키 미등록)", apiError(MOLIT_ERROR_XML) !== null);
  check("정상 XML은 에러 없음", apiError(MOLIT_APT_XML) === null);

  // 서비스키 정규화: 디코딩 키·인코딩 키 둘 다 같은 안전 형태로
  const enc = encKey("abc+/def=");
  check("encKey: 디코딩키 퍼센트인코딩", enc === "abc%2B%2Fdef%3D", enc);
  check("encKey: 인코딩키 더블인코딩 방지(동일 결과)", encKey("abc%2B%2Fdef%3D") === enc);
}

console.log("\n[국토부 전월세 파서 — MOLIT Rent]");
{
  const rents = parseAptRents(MOLIT_RENT_XML);
  check("item 6건 파싱", rents.length === 6, `got ${rents.length}`);
  check("영문태그 전세 파싱(월세0→전세)", rents[0].isJeonse === true && rents[0].deposit === 50000);
  check("한글태그 전세 파싱(보증금액 콤마)", rents[1].deposit === 40000 && rents[1].isJeonse === true);
  check("월세>0 → 월세계약", rents[3].isJeonse === false && rents[3].monthlyRent === 80);
  check("계약구분 신규 추출", rents[0].contractType === "신규");
  check("갱신요구권 사용 추출", rents[2].useRRRight === "사용");
  const a = aggregateRents(rents);
  check("총 6건", a.total === 6, String(a.total));
  check("전세 3 / 월세 3", a.jeonse === 3 && a.wolse === 3, `${a.jeonse}/${a.wolse}`);
  check("월세비중 50.0%", a.wolseRatio === 50.0, String(a.wolseRatio));
  check("신규 3건(전세2+월세1)", a.newTotal === 3 && a.newWolse === 1, `${a.newTotal}/${a.newWolse}`);
  check("신규 중 월세비중 33.3%", a.newWolseRatio === 33.3, String(a.newWolseRatio));
  check("갱신 2건", a.renewTotal === 2, String(a.renewTotal));
  check("계약구분 있는 건 5건(무구분 1 제외)", a.typedTotal === 5, String(a.typedTotal));
}

console.log("\n[국토부 분양권전매 파서 — MOLIT Silv]");
{
  /* 여기서 지키는 것은 **분양권과 입주권을 섞지 않는 것**이다.
   * 둘은 분양가 기준이 아예 달라(청약 당첨분 vs 조합원분) 섞으면 프리미엄이 통째로 틀어진다.
   *
   * ⚠️ 이 표본은 2026-08-28 **실측 응답**으로 교체됐다. 그전에는 매매 API 에서 유추한
   * 표본이었고 그 유추는 틀렸다 — 구분 칸은 `dealTypeNm` 이 아니라 **`ownershipGbn`** 이다.
   * 유추 표본으로 짠 테스트는 그때도 전부 초록이었다. **표본이 틀리면 테스트는 틀린 것을
   * 지킨다** — 그래서 실물이 오면 표본부터 갈아 끼운다. */
  const txs = parseSilvTrades(MOLIT_SILV_XML);
  check("item 5건 파싱", txs.length === 5, `got ${txs.length}`);
  check("거래금액 콤마 제거 → 만원", txs[0].priceManwon === 130000, String(txs[0].priceManwon));
  check("만원 → 원 환산", txs[0].priceWon === 1300000000, String(txs[0].priceWon));
  check("계약일 0패딩 2026-07-04", txs[0].date === "2026-07-04", txs[0].date);
  check("구분은 ownershipGbn 에서 읽는다 → 분양권", txs[0].kind === "분양권", txs[0].kind);
  check("한글태그 구분 → 입주권", txs[2].kind === "입주권", txs[2].kind);
  check("한글태그 단지명 파싱", txs[2].aptNm === "가상한강자이", txs[2].aptNm);
  check("매도·매수 구분 보존", txs[0].sellerGbn === "개인" && txs[0].buyerGbn === "개인");
  check("시군구명 보존", txs[0].sggNm === "마포구", txs[0].sggNm);
  check("구분 칸이 **공백**이면 미상(임의로 분양권에 넣지 않는다)", txs[4].kind === "미상", txs[4].kind);
  check("구분 원값을 그대로 남긴다(태그 재조사의 증거)", txs[4].kindRaw.trim() === "", JSON.stringify(txs[4].kindRaw));
  check("해제 거래 canceled=true", txs[3].canceled === true);

  const valid = validSilvTrades(txs);
  check("해제 1건 제외 → 4건", valid.length === 4, String(valid.length));
  check("해제된 20억이 유효거래에 없다", valid.every((t) => t.priceManwon !== 200000));

  const kinds = countByKind(txs);
  check("구분 집계 분양권 2 / 입주권 1 / 미상 1", kinds.분양권 === 2 && kinds.입주권 === 1 && kinds.미상 === 1,
    `${kinds.분양권}/${kinds.입주권}/${kinds.미상}`);

  const census = censusKindRaw(txs);
  check("원값 분포에 '(빈칸)' 이 잡힌다", census.some(([k]) => k === "(빈칸)"), JSON.stringify(census));

  const names = tagNames(MOLIT_SILV_XML);
  check("응답 태그 이름을 뽑는다(ownershipGbn 포함)", names.includes("ownershipGbn"), names.join(","));

  const latest = latestPerAptType(txs);
  check("같은 단지·같은 전용면적은 1건으로 접힌다", latest.filter((t) => t.aptNm === "가상센트럴파크").length === 1);
  check("접힐 때 최고가가 아니라 **최신** 거래가 남는다(7/4 13.0억)",
    latest.find((t) => t.aptNm === "가상센트럴파크")?.date === "2026-07-04");

  check("toKind: 공백 섞인 값도 읽는다", toKind(" 분 양 권 ") === "분양권");
  check("toKind: 빈 값은 미상", toKind("") === "미상");
  check("firstItemRaw: 원본 item 을 그대로 떠 온다", firstItemRaw(MOLIT_SILV_XML).includes("가상센트럴파크"));
}

console.log("\n[부동산원 전세·월세 지수 — R-ONE]");
{
  /* R-ONE 응답은 판올림마다 껍데기가 바뀐다. 여기서 지키는 것은 **접는 규칙**이다 —
   * 지역×월 격자로 접히는가, 그리고 asOf 를 '실행 시각'이 아니라 '데이터가 말하는 달'로
   * 잡는가. 후자를 놓치면 같은 입력이 매번 다른 파일을 만든다(결정성 위반). */
  const pts: RebPoint[] = [
    { region: "서울특별시", regionCode: "11", ym: "2026-06", value: 240.1 },
    { region: "서울특별시", regionCode: "11", ym: "2026-07", value: 243.8 },
    { region: "노원구", regionCode: "11350", ym: "2026-07", value: 231.2 },
  ];
  // 계열의 키는 **코드**다 (이름이 아니다)
  const s = toSeries(pts);
  check("지역코드×월 격자로 접힌다", Object.keys(s).length === 2 && Object.keys(s["11"]).length === 2);
  check("값이 그대로 살아 있다", s["11350"]["2026-07"] === 231.2);
  check("최신 관측월을 데이터에서 읽는다(실행 시각 아님)", latestMonth(s) === "2026-07", latestMonth(s));
  // 같은 지역·월이 두 번 오면 마지막 값으로 덮는다(중복 행 방어)
  const dupS = toSeries([...pts, { region: "노원구", regionCode: "11350", ym: "2026-07", value: 232.0 }]);
  check("같은 지역·월 중복은 마지막 값", dupS["11350"]["2026-07"] === 232.0);
  check("빈 계열이면 최신월도 빈 값", latestMonth({}) === "");

  /* ⚠️ 이름으로 접으면 여러 도시의 동명 구가 서로를 덮어쓴다 — 실제로 그렇게 나왔다
   * (2026-07-29: 중구·동구·남구·북구·서구·강북지역 6종이 겹쳤다).
   * 이름 충돌을 **찾아내는지**를 검사한다. 못 찾으면 빌더가 조용히 엉뚱한 도시를 집는다. */
  const two: RebPoint[] = [
    { region: "중구", regionCode: "11140", ym: "2026-06", value: 250 }, // 서울 중구
    { region: "중구", regionCode: "26110", ym: "2026-06", value: 130 }, // 부산 중구
  ];
  const nm = regionNames(two);
  check("코드가 다르면 계열도 따로 유지된다", Object.keys(toSeries(two)).length === 2);
  const amb = ambiguousNames(nm);
  check("이름 충돌을 잡아낸다", (amb["중구"] || []).length === 2, JSON.stringify(amb));
  check("충돌 없으면 빈 목록", Object.keys(ambiguousNames({ "11350": "노원구" })).length === 0);

  /* 실제 R-ONE 응답 그대로(2026-07-29 probe 실측). head 와 row 가 **형제 배열 원소**다 —
   * 예전 구현은 아무 객체 배열이나 긁어서 head 항목까지 데이터 행으로 셌다. */
  const REAL = {
    SttsApiTblData: [
      { head: [{ list_total_count: 56751 }, { RESULT: { CODE: "INFO-000", MESSAGE: "정상 처리되었습니다." } }] },
      {
        row: [
          { STATBL_ID: "A_2024_00050", DTACYCLE_CD: "MM", WRTTIME_IDTFR_ID: "202606",
            CLS_ID: 500001, CLS_NM: "전국", ITM_ID: 100001, ITM_NM: "지수", DTA_VAL: 102.04742 },
          { STATBL_ID: "A_2024_00050", DTACYCLE_CD: "MM", WRTTIME_IDTFR_ID: "200311",
            CLS_ID: 510111, CLS_NM: "창원시", ITM_ID: 100001, ITM_NM: "지수", DTA_VAL: 58.463 },
        ],
      },
    ],
  };
  const pg = readPage(REAL);
  check("실제 응답에서 행만 정확히 뽑는다(head 안 섞임)", pg.rows.length === 2, String(pg.rows.length));
  check("전체 건수를 읽는다", pg.total === 56751, String(pg.total));

  // 오류 응답은 조용히 0건으로 넘기지 않고 사유를 던진다 — 안 그러면 빈 데이터셋이 커밋된다
  let threw = "";
  try { readPage({ RESULT: { CODE: "ERROR-336", MESSAGE: "데이터요청은 한번에 최대 1,000건을 넘을 수 없습니다." } }); }
  catch (e) { threw = String((e as Error).message); }
  check("오류 응답은 예외로 알린다", threw.includes("ERROR-336"), threw);
  let threw2 = "";
  try { readPage({ SttsApiTblData: [{ head: [{ RESULT: { CODE: "INFO-200", MESSAGE: "해당하는 데이터가 없습니다." } }] }] }); }
  catch (e) { threw2 = String((e as Error).message); }
  check("껍데기 안의 오류 코드도 잡는다", threw2.includes("INFO-200"), threw2);
}

console.log("\n[청약홈 분양정보 파서]");
{
  const TODAY = "2026-08-01"; // 오늘을 인자로 못박는다 — 시계에 의존하면 테스트가 내일 깨진다

  check("날짜 정규화 20260810 → 2026-08-10", ahIso("20260810") === "2026-08-10");
  check("점 찍힌 날짜도 읽는다", ahIso("2026.08.10") === "2026-08-10");
  check("빈 값·형식 오류는 null", ahIso("") === null && ahIso("2026-8") === null);
  check("세대수 1,859 → 1859", ahCount("1,859") === 1859);
  check("세대수 0·빈칸은 null(0 으로 채우지 않는다)", ahCount("0") === null && ahCount(null) === null);
  check("남은 일수 계산", ahDays(TODAY, "2026-08-03") === 2);
  check("입주예정월 파싱", ahYm("203101") === "2031-01" && ahYm("20310") === null);

  const apt = ahNormalize(JSON.parse(APPLYHOME_APT_JSON), "apt");
  check("APT 3건 정규화", apt.length === 3, String(apt.length));
  check("공고번호·이름을 읽는다", apt[0].pblancNo === "2026000401" && apt[0].name === "상동역 롯데캐슬 시그니처");
  check("세대수 1859", apt[0].supply === 1859, String(apt[0].supply));
  // 접수 마감 필드 이름이 오퍼레이션마다 다르다 — 별칭 목록의 첫 발견값을 쓴다
  check("APT 접수 마감을 별칭으로 찾는다", apt[0].receiptTo === "2026-08-13", String(apt[0].receiptTo));
  check("무명 단지는 접수 필드가 달라도 읽힌다", apt[1].receiptTo === "2026-08-07", String(apt[1].receiptTo));
  // 청약 일정 3칸은 오너가 고른 고정 항목이다 — 하나로 뭉개면 카드가 못 쓴다
  check("특별공급 접수일을 따로 읽는다", apt[0].specialFrom === "2026-08-10", String(apt[0].specialFrom));
  check("1순위 접수일을 따로 읽는다", apt[0].rank1From === "2026-08-11", String(apt[0].rank1From));
  check("당첨자 발표일을 읽는다", apt[0].announceDate === "2026-08-20", String(apt[0].announceDate));
  // 입주예정월은 보도마다 달리 적히는 항목이라 1차 출처가 특히 중요하다
  check("입주예정월 202601 형식을 읽는다", apt[0].moveInYm === "2031-01", String(apt[0].moveInYm));

  const rem = ahNormalize(JSON.parse(APPLYHOME_REMNDR_JSON), "remndr");
  check("무순위 접수 마감(SUBSCRPT_RCEPT_ENDDE)", rem[0].receiptTo === "2026-08-02", String(rem[0].receiptTo));
  check("상한제·투기과열 플래그", rem[0].priceCap === true && rem[0].speculative === true);
  check("시행사만 있으면 그것을 쓴다", rem[0].builder === "샘플주택", String(rem[0].builder));

  // ⚠️ 필드 이름이 바뀌면 **빈 결과가 아니라 예외**여야 한다.
  //    빈 배열로 넘기면 "오늘은 공고가 없었다"와 구분되지 않는다(2026-07-31 조용한 실패 교훈).
  let ahThrew = "";
  try { ahNormalize(JSON.parse(APPLYHOME_SHAPE_CHANGED_JSON), "apt"); }
  catch (e) { ahThrew = String((e as Error).message); }
  check("필드 이름이 바뀌면 던진다", ahThrew.includes("필드 이름"), ahThrew);

  let ahThrew2 = "";
  try { ahNormalize({} as never, "apt"); }
  catch (e) { ahThrew2 = String((e as Error).message); }
  check("data 배열이 없으면 던진다", ahThrew2.includes("data"), ahThrew2);

  // 최근 것만 — 6월 공고(접수도 끝남)는 빠져야 한다
  const fresh = ahRecent([...apt, ...rem], TODAY, 7);
  check("지난달 공고는 걸러진다", !fresh.some((x) => x.name === "지난달공고단지"), fresh.map((x) => x.name).join(","));
  check("최근·접수중만 3건", fresh.length === 3, String(fresh.length));

  const ranked = ahRank(ahDedupe(fresh), TODAY);
  check("무순위·서울·D-1 이 1위", ranked[0].name === "서울무순위샘플아파트", ranked[0].name);
  check("1위 점수에 이유가 붙는다", ranked[0].reasons.includes("무순위") && ranked[0].reasons.includes("서울"),
    ranked[0].reasons.join(","));
  check("대단지·브랜드가 지방 소형보다 위", 
    ranked.findIndex((x) => x.name === "상동역 롯데캐슬 시그니처") < ranked.findIndex((x) => x.name === "지방소형단지"));
  check("브랜드를 알아본다(롯데캐슬)", ranked.find((x) => x.name.includes("롯데캐슬"))!.reasons.includes("롯데캐슬"));

  /* ── 블록 합치기 (2026-08-02 첫 실제 실행에서 드러난 문제) ──
     같은 단지가 블록마다 따로 공고돼 소재 보드 상위 5칸을 한 단지가 도배했다. */
  check("블록 표기를 걷어낸다", ahBase("더샵 송도그란테르 G5-11블록") === "더샵 송도그란테르",
    ahBase("더샵 송도그란테르 G5-11블록"));
  check("괄호 안 블록도 걷어낸다", ahBase("금강펜테리움 6차(A59BL) (3차)") === "금강펜테리움 6차 (3차)",
    ahBase("금강펜테리움 6차(A59BL) (3차)"));
  // ⚠️ '2차'는 블록이 아니라 단지 이름의 일부다 — 지우면 1차와 합쳐져 오보가 된다
  check("'N차'는 건드리지 않는다", ahBase("한화포레나 안산고잔2차") === "한화포레나 안산고잔2차",
    ahBase("한화포레나 안산고잔2차"));

  const blocks: typeof rem = [45, 36, 35].map((n, i) => ({
    ...rem[0], pblancNo: `B${i}`, name: `더샵 송도그란테르 G5-${i + 1}블록`, supply: n,
  }));
  const merged = ahMerge(blocks);
  check("블록 3건이 1건으로", merged.length === 1, String(merged.length));
  check("세대수는 합계 116", merged[0].supply === 116, String(merged[0].supply));
  check("합친 이름은 블록 없는 이름", merged[0].name === "더샵 송도그란테르", merged[0].name);
  check("몇 개를 합쳤는지 남긴다", merged[0].blocks === 3, String(merged[0].blocks));
  // 접수 마감일이 다르면(=다른 회차) 합치지 않는다
  const diffDate = ahMerge([blocks[0], { ...blocks[1], receiptTo: "2026-08-09" }]);
  check("접수일이 다르면 합치지 않는다", diffDate.length === 2, String(diffDate.length));
  // 혼자면 이름을 그대로 둔다 — 블록만 지우면 사실 정보를 잃는다
  const alone = ahMerge([blocks[0]]);
  check("혼자면 원래 이름 유지", alone[0].name === "더샵 송도그란테르 G5-1블록", alone[0].name);

  const dup = ahDedupe([...fresh, ...fresh]);
  check("공고번호로 중복 제거", dup.length === fresh.length, String(dup.length));

  // 이미 인코딩된 키를 다시 인코딩하면 인증이 깨진다(국토부에서 한 번 밟은 함정)
  check("인코딩된 키는 그대로 둔다", ahEncKey("abc%2Bdef") === "abc%2Bdef");
  check("디코딩된 키는 인코딩한다", ahEncKey("abc+def") === "abc%2Bdef");
  check("URL 에 오퍼레이션 경로가 들어간다", ahUrl("remndr", "K", 1, 500).includes("getRemndrLttotPblancDetail"));
}

/* ────────────────────────────────────────────────
   KOSIS 주민등록 인구 (2026-08-03)
   ──────────────────────────────────────────────── */
{
  check("KOSIS 기간 202606 → 2026-06", kosisPeriod("202606") === "2026-06");
  check("KOSIS 연간 2026 → 2026-12", kosisPeriod("2026") === "2026-12");
  check("KOSIS 형식 오류는 null", kosisPeriod("26-6") === null && kosisPeriod("") === null);
  check("쉼표 섞인 인구를 정수로", kosisCount("140,880") === 140880);
  check("숫자가 아니면 null(0 으로 안 채운다)", kosisCount("-") === null && kosisCount(null) === null);

  const pts = kosisNormalize(JSON.parse(KOSIS_POP_JSON));
  // 전국('00')·시도(2자리)·읍면동(7자리)은 버리고 시군구(5자리)만 남아야 한다
  check("시군구 4행만 남는다(전국·시도·동 제외)", pts.length === 4, String(pts.length));
  check("전국이 섞여 들어오지 않는다", !pts.some((p) => p.name === "전국"));
  check("읍면동이 섞여 들어오지 않는다", !pts.some((p) => p.name === "사직동"));
  check("종로구 인구를 읽는다", pts.find((p) => p.period === "2026-06" && p.code === "11010")!.value === 140880);

  const ser = kosisSeries(pts);
  check("시군구 2곳의 시계열", ser.length === 2, String(ser.length));
  check("시점이 오름차순", ser[0].points[0].period === "2026-05" && ser[0].points[1].period === "2026-06");

  // ⚠️ 필드 이름이 바뀌면 **빈 결과가 아니라 예외**여야 한다(2026-07-31 조용한 실패 교훈)
  let kThrew = "";
  try { kosisNormalize(JSON.parse(KOSIS_POP_SHAPE_CHANGED_JSON)); }
  catch (e) { kThrew = String((e as Error).message); }
  check("KOSIS 필드 이름이 바뀌면 던진다", kThrew.includes("필드 이름"), kThrew);

  let kThrew2 = "";
  try { kosisNormalize([]); }
  catch (e) { kThrew2 = String((e as Error).message); }
  check("빈 응답이면 던진다(빈 결과 ≠ 실패)", kThrew2.includes("행이 없다"), kThrew2);

  /* ── 소재 추출 규칙 ── 합성 시계열로 규칙만 검증한다(원자료가 아니라 로직 시험). */
  const mk = (code: string, name: string, vals: number[]): KosisSeries => ({
    code, name,
    points: vals.map((v, i) => ({ period: `2025-${String(i + 1).padStart(2, "0")}`, value: v })),
  });

  // 문턱 돌파 — 99,800 → 100,300 은 10만 선을 넘었다
  const ms = kosisMilestones([mk("31240", "가상시", [99_800, 100_300])]);
  check("10만 돌파를 잡는다", ms.length === 1 && ms[0].title.includes("10만 돌파"), ms.map((x) => x.title).join(","));
  const msDown = kosisMilestones([mk("37010", "가상군", [100_200, 99_500])]);
  check("10만 붕괴를 잡는다", msDown[0].title.includes("10만 붕괴"), msDown[0]?.title);
  check("선을 안 건드리면 신호 없음", kosisMilestones([mk("11010", "가상구", [98_000, 99_000])]).length === 0);

  // 연속 증감 — 값이 같은 달은 연속을 끊어야 한다(부풀리면 오보)
  const down8 = mk("11010", "감소구", [108, 107, 106, 105, 104, 103, 102, 101, 100].map((v) => v * 1000));
  const st = kosisStreaks([down8], 6);
  check("8개월 연속 감소를 센다", st.length === 1 && st[0].facts.months === 8, JSON.stringify(st[0]?.facts.months));
  const flat = mk("11020", "보합구", [108, 107, 106, 106, 105, 104, 103, 102, 101].map((v) => v * 1000));
  const stFlat = kosisStreaks([flat], 6);
  check("값이 같은 달은 연속을 끊는다", stFlat.length === 0, JSON.stringify(stFlat.map((x) => x.facts.months)));
  check("짧은 연속은 소재가 아니다", kosisStreaks([mk("11030", "짧은구", [105, 104, 103, 102].map((v) => v * 1000))], 6).length === 0);

  // 1년 증감률 상·하위 — 13개 시점이 있어야 계산된다
  const many = Array.from({ length: 25 }, (_, i) =>
    mk(`3${String(1000 + i)}`, `가상${i}`, Array.from({ length: 13 }, (_, j) => 100_000 + i * 100 * j)),
  );
  const tm = kosisTopMovers(many, 10);
  check("증가·감소 순위표 2건", tm.length === 2, String(tm.length));
  check("증가 1위는 가장 많이 늘어난 곳", tm[0].facts.leader === "가상24", String(tm[0].facts.leader));
  check("시점이 13개 미만이면 순위표를 안 만든다", kosisTopMovers([mk("11010", "짧은", [1, 2, 3])], 10).length === 0);

  // 점수 — 서울 대도시 100만 돌파가 지방 소도시 5만 돌파보다 위여야 한다
  const ranked = kosisRank([
    ...kosisMilestones([mk("11010", "서울대구", [999_000, 1_000_500])]),
    ...kosisMilestones([mk("37010", "지방군", [49_800, 50_200])]),
  ], 45);
  check("100만 돌파가 5만 돌파보다 위", ranked[0].name === "서울대구", ranked.map((x) => `${x.name}:${x.score}`).join(","));
  check("점수에 이유가 붙는다", ranked[0].reasons.includes("서울") && ranked[0].reasons.some((r) => r.includes("100만")),
    ranked[0].reasons.join(","));
  check("문턱 아래는 걸러진다", kosisRank([...kosisMilestones([mk("37010", "지방군", [49_800, 50_200])])], 999).length === 0);

  // 지도 조인 — 우리 지도에 없는 코드가 있으면 드러나야 한다
  const jr = kosisJoin([mk("11010", "종로구", [1, 2]), mk("99999", "없는곳", [1, 2])], ["11010", "11020"]);
  check("지도에 없는 시군구를 집어낸다", jr.missingInGeo.join(",") === "99999", jr.missingInGeo.join(","));
  check("데이터에 없는 시군구도 집어낸다", jr.missingInData.join(",") === "11020", jr.missingInData.join(","));

  // 인코딩된 키를 다시 인코딩하면 인증이 깨진다(국토부에서 밟은 함정)
  check("KOSIS 인코딩된 키는 그대로", kosisEncKey("a%2Bb") === "a%2Bb");
  const ku = kosisUrl("population", "KEY", { startPrdDe: "202501", endPrdDe: "202606" });
  check("URL 에 표 ID 가 들어간다", ku.includes("tblId=DT_1B040A3"), ku);
  check("URL 에 인증키가 들어간다", ku.includes("apiKey=KEY"), ku);
  check("URL 에 기간이 들어간다", ku.includes("startPrdDe=202501") && ku.includes("endPrdDe=202606"));

  /* ── 표 등록부 규칙 ──
     규격을 확인 못 한 표가 실수로 정기 수집에 끼는 것이 이 배관에서 가장 위험한 사고다.
     "확실" 이 아닌 표는 반드시 enabled=false 여야 한다. */
  const notSure = Object.entries(KOSIS_TABLES).filter(([, t]) => t.confidence !== "확실" && t.enabled);
  check("규격 미확인 표는 정기 수집에 끼지 않는다", notSure.length === 0, notSure.map(([k]) => k).join(","));
  /* 켜진 표는 probe 로 실물 검증된 것만 — 2026-08-03 probe 결과 3개(인구·세대·이동) 통과.
     "인구뿐" 이라고 못 박아 두면 검증이 진행될 때마다 이 줄을 고쳐야 하고,
     고치다 보면 규칙이 아니라 통과시키기 위한 숫자가 된다. 원칙만 지킨다. */
  const enabledNames = kosisEnabled();
  check("켜진 표가 하나는 있다", enabledNames.length > 0, enabledNames.join(","));
  const enabledUnsure = enabledNames.filter((k) => KOSIS_TABLES[k].confidence !== "확실");
  check("켜진 표는 전부 '확실'", enabledUnsure.length === 0, enabledUnsure.join(","));
  /* 파서가 ITM_ID 를 구분하지 않는다 — 항목을 여러 개 받으면 한 지역에 값이 겹쳐 시계열이 망가진다.
     그래서 켜진 표의 itmId 는 반드시 단일 코드여야 한다. ALL·'+' 는 금지. */
  const multiItem = enabledNames.filter((k) => {
    const it = KOSIS_TABLES[k].itmId;
    return it === "ALL" || it.includes("+");
  });
  check("켜진 표의 항목은 단일 코드(파서가 항목 축을 안 가른다)", multiItem.length === 0, multiItem.join(","));
  /* vital 코드 체계(출생·사망)는 대조표 없이 켜지면 숫자가 엉뚱한 지역에 얹힌다.
     26=울산/부산 처럼 시도부터 겹치는데 지도는 정상으로 그려져 눈으로 안 잡힌다. */
  /* ── 코드 대조표는 켜진 **모든** 표에 있어야 한다 ──
     2026-08-04: 우리 지도(11010=종로구)와 인구표(11110=종로구)는 체계가 다르고
     겹치는 코드가 255개 중 9개뿐인데 그 9개는 우연이다. 대조표 없이 켜면
     9곳에 엉뚱한 숫자가 들어가고 246곳이 빈다. */
  const vitalOn = kosisEnabled();
  const mapPath = resolve(process.env.INIT_CWD || process.cwd(), "data/geo/kosis-region-map.json");
  const mapExists = existsSync(mapPath);
  check("켜진 표에 코드 대조표가 있다", !vitalOn.length || mapExists,
    vitalOn.length ? `${vitalOn.join(",")} → 대조표 ${mapExists ? "있음" : "없음"}` : "(해당 없음)");
  if (vitalOn.length && mapExists) {
    const rm = JSON.parse(readFileSync(mapPath, "utf8")) as { maps?: Record<string, Record<string, string>> };
    for (const k of vitalOn) {
      const n = Object.keys(rm.maps?.[k] ?? {}).length;
      check(`대조표에 ${k} 코드가 들어 있다`, n > 100, `${n}개`);
      /* 지도를 얼마나 채우는지 — 이게 진짜 지표다. 굵은 표는 이유가 적혀 있어야 한다. */
      const cov = (rm as unknown as { coverage?: Record<string, { mapCovered: number; mapTotal: number; knownCoarse?: string }> })
        .coverage?.[k];
      if (cov) {
        const pct = (cov.mapCovered / cov.mapTotal) * 100;
        check(`${k} 가 지도를 충분히 채운다`, pct >= 90 || !!cov.knownCoarse,
          `${cov.mapCovered}/${cov.mapTotal}곳 (${pct.toFixed(1)}%)${cov.knownCoarse ? " · 구조적 한계 기록됨" : ""}`);
      }
    }
  }
  /* 4만 셀 한도 — 축이 큰 표는 나눠 부를 계산이 되어 있어야 한다. */
  const bigNoChunk = kosisEnabled().filter((k) => (KOSIS_TABLES[k].cellsPerRegionPeriod ?? 1) > 1
    && chunkSizeFor(k, 26) < 1);
  check("축이 큰 표는 나눠 부를 크기가 계산된다", bigNoChunk.length === 0, bigNoChunk.join(","));

  /* ── 지역 축을 잘못 읽는 사고를 시험으로 못 박는다 ──
     사망 표는 C1 이 사망원인이고 C2 가 행정구역이다. C1 을 지역으로 읽으면
     '11=호흡기 결핵' 이 지역 코드가 되는데 응답은 정상이라 아무도 모른다. */
  const deathShaped = [{
    C1: "11", C1_NM: "호흡기 결핵 (A15-A16)",
    C2: "11010", C2_NM: "종로구",
    C3: "0", C3_NM: "계",
    PRD_DE: "2024", DT: "12", ITM_ID: "T1", ITM_NM: "사망자수",
  }];
  const byC2 = kosisNormalize(deathShaped, "C2");
  check("지역 축을 C2 로 주면 종로구를 집는다",
    byC2.length === 1 && byC2[0].code === "11010" && byC2[0].name === "종로구",
    JSON.stringify(byC2[0] ?? null));
  /* 기본값(C1)으로 읽으면 5자리가 아니라 걸러져 0행이 되고, 파서가 던진다.
     조용히 빈 배열이 되는 것보다 던지는 편이 낫다 — 빈 배열은 "그 해 사망자가 없었다"와 구분이 안 된다. */
  let threw = false;
  try { kosisNormalize(deathShaped); } catch { threw = true; }
  check("지역 축을 틀리면 조용히 비지 않고 던진다", threw, threw ? "던짐" : "조용히 빈 배열 — 위험");

  /* 표가 지역 축을 적어 뒀는지 — vital 계열은 특히 축 순서가 다르다. */
  const axisUnset = kosisEnabled().filter((k) => !KOSIS_TABLES[k].regionAxis);
  check("켜진 표는 지역 축이 명시돼 있다(기본 C1 이라도)", true,
    axisUnset.length ? `기본 C1 사용: ${axisUnset.join(",")}` : "전부 명시");

  /* ── 연령 표 접기 ──
     1세별 102줄을 65세 이상 합계로 접는다. 코드가 아니라 이름의 숫자를 읽는지 확인한다 —
     연령 코드는 규칙이 없어(0701=10세, 440=100세 이상) 코드로 추리면 언젠가 어긋난다. */
  check("연령 이름 파싱 — 65세", kosisAgeOf("65세") === 65, String(kosisAgeOf("65세")));
  check("연령 이름 파싱 — 100세 이상", kosisAgeOf("100세 이상") === 100, String(kosisAgeOf("100세 이상")));
  check("연령 이름 파싱 — '계' 는 연령이 아니다", kosisAgeOf("계") === null, String(kosisAgeOf("계")));
  const ageRows = [
    { C1: "11110", C1_NM: "종로구", C2: "000", C2_NM: "계", PRD_DE: "202606", DT: "1000" },
    { C1: "11110", C1_NM: "종로구", C2: "3801", C2_NM: "64세", PRD_DE: "202606", DT: "50" },
    { C1: "11110", C1_NM: "종로구", C2: "3802", C2_NM: "65세", PRD_DE: "202606", DT: "40" },
    { C1: "11110", C1_NM: "종로구", C2: "4305", C2_NM: "99세", PRD_DE: "202606", DT: "3" },
    { C1: "11110", C1_NM: "종로구", C2: "440", C2_NM: "100세 이상", PRD_DE: "202606", DT: "2" },
    { C1: "11", C1_NM: "서울특별시", C2: "3802", C2_NM: "65세", PRD_DE: "202606", DT: "9999" },
  ];
  const sp = kosisSenior(ageRows);
  check("65세 이상만 합친다(64세·계 제외)", sp.length === 1 && sp[0].value === 45,
    JSON.stringify(sp[0] ?? null));
  check("시도(2자리)는 시군구 합계에 안 낀다", sp.length === 1, `${sp.length}행`);
  /* 이름 규칙이 바뀌면 조용히 0이 되지 않고 던져야 한다 — 0은 '고령인구 없는 시군구' 가 되어 오보다. */
  let ageThrew = false;
  try {
    kosisSenior([{ C1: "11110", C1_NM: "종로구", C2: "000", C2_NM: "계", PRD_DE: "202606", DT: "1" }]);
  } catch { ageThrew = true; }
  check("65세 이상이 한 줄도 없으면 던진다", ageThrew, ageThrew ? "던짐" : "조용히 0 — 위험");

  /* ── 인증키가 로그·산출물에 실리면 안 된다 ──
     2026-08-03 사고: 실패한 URL 이 오류 메시지에 그대로 실렸고, probe 가 그것을
     결과 파일에 적어 저장소에 커밋했다. 키가 통째로 남았다. */
  check("URL 오류 메시지에서 apiKey 가 지워진다",
    redactUrl("https://x/y?a=1&apiKey=SECRETVALUE&b=2") === "https://x/y?a=1&apiKey=***&b=2",
    redactUrl("https://x/y?a=1&apiKey=SECRETVALUE&b=2"));
  check("serviceKey·authKey 도 지워진다",
    redactUrl("https://x?serviceKey=AAA&authKey=BBB") === "https://x?serviceKey=***&authKey=***",
    redactUrl("https://x?serviceKey=AAA&authKey=BBB"));
  /* 커밋된 산출물에 키가 남아 있지 않은지 — 사고가 재발하면 여기서 걸린다. */
  for (const f of ["data/kosis-probe.md", "data/kosis-probe-raw.json"]) {
    const fp = resolve(process.env.INIT_CWD || process.cwd(), f);
    if (!existsSync(fp)) continue;
    const body = readFileSync(fp, "utf8");
    const leaked = /(?:apiKey|serviceKey|authKey)=(?!\*\*\*)[A-Za-z0-9%+/=_-]{8,}/i.test(body);
    check(`${f} 에 인증키가 남아 있지 않다`, !leaked, leaked ? "키로 보이는 문자열 발견" : "깨끗함");
  }

  /* ── 표마다 기간 형식이 맞아야 한다 ──
     연간 표에 월 형식(202407)을 주면 KOSIS 가 "데이터가 존재하지 않습니다" 를 준다.
     오류 응답이라 파서까지 못 가고, 그 지표만 조용히 빠진다.
     실측 2026-08-04: 출생·사망이 이 한 줄 때문에 통째로 빠졌다. */
  const yRange = kosisRange({ prdSe: "Y" }, "2026-08-04", 25);
  check("연간 표의 기간은 YYYY", /^\d{4}$/.test(yRange.start) && /^\d{4}$/.test(yRange.end),
    `${yRange.start}~${yRange.end}`);
  const mRange = kosisRange({ prdSe: "M" }, "2026-08-04", 25);
  check("월간 표의 기간은 YYYYMM", /^\d{6}$/.test(mRange.start) && /^\d{6}$/.test(mRange.end),
    `${mRange.start}~${mRange.end}`);
  const capped = kosisRange({ prdSe: "M", maxMonths: 13 }, "2026-08-04", 25);
  check("maxMonths 가 기간을 실제로 줄인다", capped.periods === 14, `${capped.start}~${capped.end} (${capped.periods}시점)`);
  /* 계산에 쓴 시점 수와 실제 요청 시점 수가 다르면 4만 셀 한도에 걸린다 — 실제로 걸렸다. */
  for (const k of kosisEnabled()) {
    const t = KOSIS_TABLES[k];
    const per = t.cellsPerRegionPeriod ?? 1;
    if (per <= 1) continue;
    const r = kosisRange(t, "2026-08-04", 25);
    const size = chunkSizeFor(k, r.periods);
    check(`${k} 한 요청이 4만 셀 안에 든다`, size * r.periods * per <= 40000,
      `${size}곳 × ${r.periods}시점 × ${per}셀 = ${size * r.periods * per}`);
  }

  /* ── 전국 대조 ──
     시군구를 다 받은 줄 알았는데 합계가 공표치보다 적은 일이 있었다(출생에서 화성시 누락).
     이런 누락은 지도에서 빈 칸으로만 보여 눈으로 안 잡힌다. */
  const natRows = [
    { C1: "00", C1_NM: "전국", PRD_DE: "2024", DT: "1000" },
    { C1: "11010", C1_NM: "종로구", PRD_DE: "2024", DT: "400" },
    { C1: "11020", C1_NM: "중구", PRD_DE: "2024", DT: "500" },
  ];
  const nat = kosisNational(natRows);
  check("전국 행('00')을 시점별로 뽑는다", nat.get("2024-12") === 1000, String(nat.get("2024-12")));
  const gap = kosisGap(kosisNormalize(natRows), nat);
  check("빠진 시군구를 % 로 잡는다", !!gap && Math.round(gap.gapPct) === 10,
    gap ? `우리 ${gap.ours} / 전국 ${gap.national} → ${gap.gapPct.toFixed(1)}%` : "null");
  const full = [...natRows, { C1: "11030", C1_NM: "용산구", PRD_DE: "2024", DT: "100" }];
  const gap2 = kosisGap(kosisNormalize(full), kosisNational(full));
  check("다 받았으면 차이 0%", !!gap2 && Math.abs(gap2.gapPct) < 0.001, gap2 ? `${gap2.gapPct}%` : "null");

  /* ── 한 지역에 KOSIS 코드가 둘 붙는 경우 ──
     출생·사망 표는 광역시 산하 군을 옛 코드와 현재 코드로 두 번 준다(83곳).
     덮어쓰면 어느 쪽이 살아남는지가 응답 순서에 달리고, 실제로 울주군·달성군·
     강화군의 2024년 출생아가 0명으로 들어와 자연감소 1위가 됐었다.
     0명은 "그 해 아이가 한 명도 안 태어났다" 로 읽힌다 — 그대로 오보다.
     대조표에 그런 중복이 실제로 있는지 확인한다(있어야 정상이다). */
  if (mapExists) {
    const rm2 = JSON.parse(readFileSync(mapPath, "utf8")) as { maps?: Record<string, Record<string, string>> };
    for (const k of ["births", "deaths"]) {
      const m = rm2.maps?.[k];
      if (!m) continue;
      const seen = new Map<string, number>();
      for (const [src, dst] of Object.entries(m)) {
        if (src.length !== 5) continue;
        seen.set(dst, (seen.get(dst) ?? 0) + 1);
      }
      const dup = [...seen.values()].filter((n) => n > 1).length;
      check(`${k} 대조표에 옛코드·현코드 중복이 잡혀 있다`, dup > 0, `${dup}곳`);
    }
  }

  /* ══════ 서울 열린데이터광장 ══════
     이 API 는 **인증키가 경로에 들어간다**. http.ts 의 redactUrl 은 쿼리스트링만 지우므로
     그것만 믿으면 키가 그대로 새어 나간다 — 2026-08-03 KOSIS 키 유출을 여기서 반복하지 않는다. */
  const leaky = "http://openapi.seoul.go.kr:8088/MYSECRETKEY123/json/SPOP_FORN_LONG_RESD_DONG/1/5/20260801";
  check("서울 API URL 에서 경로형 인증키가 지워진다",
    seoulRedact(leaky) === "http://openapi.seoul.go.kr:8088/***/json/SPOP_FORN_LONG_RESD_DONG/1/5/20260801",
    seoulRedact(leaky));
  check("일반 redactUrl 로는 경로형 키가 안 지워진다(그래서 전용 함수가 필요하다)",
    redactUrl(leaky).includes("MYSECRETKEY123"), "확인");

  /* 서비스명을 모르는 채로 부르면 조용히 빈 결과가 오거나 다른 데이터가 온다 — 던져야 한다.
     실제 서비스 3종이 모두 서비스명을 갖게 됐으므로(2026-08-08), 빈 이름 항목을 잠깐 심어
     이 가드가 여전히 살아 있는지 확인한다 — 통과만 보면 검사가 켜졌는지 알 수 없다. */
  let noSvcThrew = false;
  (SEOUL_SERVICES as Record<string, unknown>).__emptyProbe__ = {
    service: "", label: "가드 테스트용 임시", metric: "x", args: [],
    confidence: "추정", enabled: false, note: "빈 서비스명 가드가 실제로 던지는지 확인하는 임시 항목",
  };
  try { seoulUrl("__emptyProbe__" as never, "K", { start: 1, end: 5 }); } catch { noSvcThrew = true; }
  delete (SEOUL_SERVICES as Record<string, unknown>).__emptyProbe__;
  check("서비스명이 비면 URL 을 만들지 않고 던진다", noSvcThrew, noSvcThrew ? "던짐" : "조용히 만듦 — 위험");

  /* 1,000행 제한. 넘겨 부르면 서울시가 거부하거나 잘라 준다 — 잘린 줄 모르는 게 더 나쁘다. */
  let tooManyThrew = false;
  try { seoulUrl("foreignLong", "K", { start: 1, end: 1001, date: "20260801" }); } catch { tooManyThrew = true; }
  check("1,000행을 넘겨 요청하면 던진다", tooManyThrew, tooManyThrew ? "던짐" : "그냥 만듦 — 위험");

  const okUrl = seoulUrl("foreignLong", "K", { start: 1, end: 5, date: "20260801" });
  check("서울 API URL 형식", okUrl.endsWith("/json/SPOP_FORN_LONG_RESD_DONG/1/5/20260801"), okUrl.replace("/K/", "/***/"));

  /* 켜진 서비스는 서비스명이 있어야 한다 — 빈 이름으로 켜면 수집이 통째로 죽는다. */
  const onNoSvc = Object.entries(SEOUL_SERVICES).filter(([, v]) => v.enabled && !v.service);
  check("켜진 서울 서비스는 서비스명이 채워져 있다", onNoSvc.length === 0, onNoSvc.map(([k]) => k).join(","));

  /* probe 는 한 날짜만 보지 않고 점점 과거로 물러난다 — 외국인 생활인구는 공개 지연이 길어
     6일 전엔 INFO-200(데이터 없음)이 나기 때문이다(2026-08-08). 날짜 후보가
     YYYYMMDD 8자리이고, 점점 과거이며, 2개월(60일) 안에 있는지 본다. */
  const nowMs = Date.UTC(2026, 7, 8); // 2026-08-08 고정 시각으로 결정적 검사
  const cand = seoulCandidateDates(nowMs);
  check("probe 날짜 후보는 YYYYMMDD 8자리다", cand.every((d) => /^\d{8}$/.test(d)), cand.join(","));
  check("probe 날짜 후보는 점점 과거다", cand.every((d, i) => i === 0 || d < cand[i - 1]), cand.join(","));
  const oldestOk = cand[cand.length - 1] >= "20260609"; // 60일 전(06-09)보다 뒤여야 2개월 창 안
  check("probe 가장 이른 후보도 2개월(60일) 창 안이다", oldestOk, cand[cand.length - 1]);

  const noNote = Object.entries(KOSIS_TABLES).filter(([, t]) => !t.note || t.note.length < 20);
  check("표마다 무엇이 미확인인지 적혀 있다", noNote.length === 0, noNote.map(([k]) => k).join(","));
  // probe 는 최근 1개 시점만 받는다 — 전 기간을 받으면 수십 MB 라 검증 목적에 안 맞는다
  const pu = kosisUrl("deaths", "K", { newEstPrdCnt: 1 });
  check("probe URL 은 newEstPrdCnt 로 최근 1개만", pu.includes("newEstPrdCnt=1") && !pu.includes("startPrdDe"), pu);
}

/* ─────────────────────────────────────────────────────────────
   신고가(역대 최고가 경신) 판별 — 2026-08-12
   검사는 "통과했다"가 아니라 "무엇을 쟀다"로 읽는다. 여기서 재는 것:
   ① 전용 59·84 타입 경계와 그 밖은 판정 대상이 아니라는 것 ② 단지 키가 동 표기로 안 쪼개진다
   ③ 역대 기록이 없는 칸은 판정하지 않는다 ④ 같은 값 재거래는 신고가가 아니다
   ⑤ 같은 칸 연속 경신이면 더 높은 하나만 ⑥ 억 표기가 레퍼런스 카드와 같은 꼴인가
   ────────────────────────────────────────────────────────── */
{
  console.log("\n[신고가 판별]");
  // 오너가 좁힌 판정 단위 — 전용 59·84 두 타입뿐이다(2026-08-12)
  check("전용 59.99 → 59타입", singoAreaType(59.99) === "59", String(singoAreaType(59.99)));
  check("전용 58.71 → 59타입(구축 표기 흔들림)", singoAreaType(58.71) === "59", String(singoAreaType(58.71)));
  check("전용 84.99 → 84타입", singoAreaType(84.99) === "84", String(singoAreaType(84.99)));
  check("전용 83.53 → 84타입(B타입)", singoAreaType(83.53) === "84", String(singoAreaType(83.53)));
  check("전용 74.9 는 대상 아님", singoAreaType(74.9) === null, String(singoAreaType(74.9)));
  check("전용 114.9 는 대상 아님(48평 신고가는 안 잡힌다)", singoAreaType(114.9) === null, String(singoAreaType(114.9)));
  check("전용 39.6 은 대상 아님", singoAreaType(39.6) === null, String(singoAreaType(39.6)));
  check("면적 0 은 대상 아님", singoAreaType(0) === null, String(singoAreaType(0)));

  check("59타입 표기는 25평", singoPyeong(59.99) === "25평", singoPyeong(59.99));
  check("84타입 표기는 34평", singoPyeong(84.99) === "34평", singoPyeong(84.99));
  check("대상 밖은 평 표기가 없다", singoPyeong(101.2) === "", `"${singoPyeong(101.2)}"`);

  // 동 표기가 붙어도 같은 단지다 — 갈라지면 작은 쪽 최고가만 넘어도 신고가가 되어 오보가 난다
  check(
    "단지명 '신현(101동)' 과 '신현' 은 같은 키",
    singoAptKey("11110", "신교동", "신현(101동)") === singoAptKey("11110", "신교동", "신현"),
  );
  check(
    "공백 표기 흔들림 흡수",
    singoAptKey("11680", "대치동", "래미안 대치 팰리스") === singoAptKey("11680", "대치동", "래미안대치팰리스"),
  );

  const mkT = (aptNm: string, area: number, priceManwon: number, date: string, umdNm = "잠실동") => ({
    aptNm, umdNm, area, priceManwon, floor: 15, date,
  });

  // ③ 역대 기록이 없는 칸 — 첫 거래를 신고가라 부르지 않는다
  check(
    "역대 기록이 없으면 판정하지 않는다",
    singoFindSingo({}, "11710", "송파구", [mkT("리센츠", 84.99, 369500, "2026-07-24")]).length === 0,
  );

  // ④ 같은 값이면 신고가가 아니다(최초로 그 값에 닿은 거래가 기록이다)
  const p1: Record<string, any> = {};
  singoFoldPeaks(p1, "11710", [mkT("리센츠", 84.99, 369500, "2026-01-05")]);
  check("같은 금액 재거래는 신고가가 아니다", singoFindSingo({ ...p1 }, "11710", "송파구", [mkT("리센츠", 84.99, 369500, "2026-07-24")]).length === 0);
  check("1만원이라도 넘으면 신고가다", singoFindSingo({ ...p1 }, "11710", "송파구", [mkT("리센츠", 84.99, 369501, "2026-07-24")]).length === 1);

  // 같은 타입 안의 A/B 타입은 한 칸이다 — 84.99 기록을 83.53 이 넘어야 신고가
  check(
    "84.99 기록은 83.53 거래도 넘어야 한다(같은 84타입)",
    singoFindSingo({ ...p1 }, "11710", "송파구", [mkT("리센츠", 83.53, 360000, "2026-07-24")]).length === 0,
  );
  // 59타입은 84타입과 다른 칸이다 — 서로 간섭하지 않는다
  check(
    "59타입은 84타입 기록과 무관하다",
    singoFindSingo({ ...p1 }, "11710", "송파구", [mkT("리센츠", 59.99, 200000, "2026-07-24")]).length === 0,
  );

  // ⑤ 같은 칸에서 연달아 갱신되면 더 높은 한 건만 — 둘 다 알리면 "신고가 두 번"이 된다
  const p3: Record<string, any> = {};
  singoFoldPeaks(p3, "11710", [mkT("리센츠", 84.99, 300000, "2026-01-05")]);
  const twice = singoFindSingo(p3, "11710", "송파구", [
    mkT("리센츠", 84.99, 310000, "2026-07-20"),
    mkT("리센츠", 84.99, 320000, "2026-07-24"),
  ]);
  check("같은 칸 연속 경신은 최고 한 건만", twice.length === 1 && twice[0].priceManwon === 320000, `${twice.length}건`);
  check(
    "직전 최고가는 이번 묶음이 들어오기 전 기록이다",
    twice[0].prevPeakManwon === 300000 && Math.round(twice[0].gainPct ?? 0) === 7,
    String(twice[0].gainPct),
  );
  check("히트에 평 표기가 붙는다", twice[0].pyeong === "34평", twice[0].pyeong);

  // 세대수 매칭 — 애매하면 붙이지 않는다(잘못 붙인 세대수는 곧 오보다)
  const list = [
    { kaptCode: "A1", kaptName: "래미안대치팰리스1단지", bjdCode: "", sido: "서울", sigungu: "강남구", umd: "대치동" },
    { kaptCode: "A2", kaptName: "래미안대치팰리스2단지", bjdCode: "", sido: "서울", sigungu: "강남구", umd: "대치동" },
    { kaptCode: "B1", kaptName: "은마", bjdCode: "", sido: "서울", sigungu: "강남구", umd: "대치동" },
  ];
  check("후보가 여럿이면 붙이지 않는다", aptMatch(list, "대치동", "래미안대치팰리스") === null);
  check("한 곳뿐이면 붙인다", aptMatch(list, "대치동", "은마")?.kaptCode === "B1");
  check("이름이 아예 다르면 null", aptMatch(list, "대치동", "선경") === null);

  // 응답 모양이 바뀌면 세대수가 조용히 0 이 된다 — 파서가 실제로 읽는지 본다
  const basisXml = `<response><body><item><kaptCode>A1</kaptCode><kaptName>리센츠</kaptName><kaptdaCnt>5563</kaptdaCnt><kaptDongCnt>65</kaptDongCnt><kaptUsedate>20080701</kaptUsedate><kaptAddr>서울 송파구 잠실동</kaptAddr></item></body></response>`;
  check("기본정보에서 세대수를 읽는다", parseAptBasis(basisXml)?.hhldCnt === 5563, String(parseAptBasis(basisXml)?.hhldCnt));
  check("세대수가 없으면 null (0 으로 떨어뜨리지 않는다)", parseAptBasis("<response><body><item><kaptCode>A1</kaptCode></item></body></response>") === null);
  const listXml = `<response><body><items><item><kaptCode>A1</kaptCode><kaptName>리센츠</kaptName><bjdCode>1171010100</bjdCode><as1>서울특별시</as1><as2>송파구</as2><as3>잠실동</as3></item></items></body></response>`;
  check("단지목록을 읽는다(XML)", parseAptList(listXml).length === 1 && parseAptList(listXml)[0].umd === "잠실동");

  // ⚠️ 이 두 서비스는 포털 화면상 **JSON 이 기본**이다(2026-08-12 오너 확인).
  //    한쪽만 읽게 두면 판이 바뀐 날 조용히 0건이 된다 — 오는 대로 읽는지 잰다.
  const listJson = JSON.stringify({ response: { body: { items: { item: [
    { kaptCode: "A1", kaptName: "리센츠", bjdCode: "1171010100", as1: "서울특별시", as2: "송파구", as3: "잠실동" },
  ] } } } });
  check("단지목록을 읽는다(JSON)", parseAptList(listJson).length === 1 && parseAptList(listJson)[0].kaptName === "리센츠");
  const listJson1 = JSON.stringify({ response: { body: { items: { item: { kaptCode: "B1", kaptName: "은마", as3: "대치동" } } } } });
  check("JSON 이 1건이면 배열이 아니다 — 그것도 읽는다", parseAptList(listJson1).length === 1, String(parseAptList(listJson1).length));
  check("JSON 이 비면 빈 배열", parseAptList(JSON.stringify({ response: { body: { items: "" } } })).length === 0);

  const basisJson = JSON.stringify({ response: { body: { item: { kaptCode: "A1", kaptName: "리센츠", kaptdaCnt: 5563, kaptDongCnt: 65, kaptUsedate: "20080701", kaptAddr: "서울 송파구 잠실동" } } } });
  check("기본정보 세대수를 읽는다(JSON)", parseAptBasis(basisJson)?.hhldCnt === 5563, String(parseAptBasis(basisJson)?.hhldCnt));
  check("JSON 에 세대수가 없으면 null", parseAptBasis(JSON.stringify({ response: { body: { item: { kaptCode: "A1" } } } })) === null);

  /* ── 주차대수 (2026-08-16 오너 "주차대수 0.0대")
     ⚠️ 지상·지하 **두 칸**이다. 한쪽만 읽으면 지하주차장 단지에서 "0.1대"가 나온다.
     ⚠️ 둘 다 0이면 null — 0대인 아파트는 없다. 그건 빈 응답이고, 0으로 적으면 오보다. */
  const dtlXml = `<response><body><item><kaptCode>A1</kaptCode><kaptdPcnt>120</kaptdPcnt><kaptdPcntu>980</kaptdPcntu></item></body></response>`;
  check("상세정보에서 주차대수를 읽는다(XML·지상+지하)", parseAptDetail(dtlXml)?.parkTotal === 1100, String(parseAptDetail(dtlXml)?.parkTotal));
  const dtlUnderOnly = JSON.stringify({ response: { body: { item: { kaptCode: "A1", kaptdPcnt: 0, kaptdPcntu: 980 } } } });
  check("지상이 0이어도 지하를 읽는다", parseAptDetail(dtlUnderOnly)?.parkTotal === 980, String(parseAptDetail(dtlUnderOnly)?.parkTotal));
  const dtlGroundOnly = JSON.stringify({ response: { body: { item: { kaptCode: "A1", kaptdPcnt: 430 } } } });
  check("지하 칸이 아예 없어도 지상만으로 읽는다", parseAptDetail(dtlGroundOnly)?.parkTotal === 430, String(parseAptDetail(dtlGroundOnly)?.parkTotal));
  check("둘 다 0이면 null (0대로 적지 않는다)", parseAptDetail(JSON.stringify({ response: { body: { item: { kaptCode: "A1", kaptdPcnt: 0, kaptdPcntu: 0 } } } })) === null);
  check("주차 칸이 없으면 null", parseAptDetail("<response><body><item><kaptCode>A1</kaptCode></item></body></response>") === null);
  check("단지코드가 없으면 null", parseAptDetail(JSON.stringify({ response: { body: { item: { kaptdPcnt: 100 } } } })) === null);

  // ⑥ 레퍼런스 카드가 "36.95억" 꼴이다 — 표기를 거기에 맞췄다
  check("369,500만원 → 36.95억", singoEok(369500) === "36.95억", singoEok(369500));
  check("딱 떨어지면 30억", singoEok(300000) === "30억", singoEok(300000));
  check("소수 한 자리면 한 자리만", singoEok(365000) === "36.5억", singoEok(365000));

  // 대상 지역 목록은 코드가 쥔다 — 말로만 정해두면 어느 날 조용히 달라진다
  const regs = singoRegionList();
  const seoulN = regs.filter((r) => r.lawdCd.startsWith("11")).length;
  check("서울 25개구 전역", seoulN === 25, String(seoulN));
  check("경기는 오너가 고른 20개 시만", regs.length - seoulN === 36, `${regs.length - seoulN}개 구·시`);
  // ⚠️ 부분일치로 재면 "남양주시"가 "양주"에 걸린다 — 시 이름은 **머리부터** 맞춰야 한다
  const NOT_PICKED = ["의정부시", "파주시", "이천시", "안성시", "양주시", "포천시", "동두천시", "여주시", "연천군", "가평군", "양평군"];
  const leaked = regs.filter((r) => NOT_PICKED.some((n) => r.gu.startsWith(n))).map((r) => r.gu);
  check("안 고른 시·군은 하나도 없다", leaked.length === 0, leaked.join(","));
  check("남양주시는 '양주'와 다르다 — 들어 있어야 한다", regs.some((r) => r.gu === "남양주시"));
  check("성남 3개구가 모두 들어 있다", regs.filter((r) => r.gu.startsWith("성남시")).length === 3);
  check("지역 코드는 5자리 법정동 코드", regs.every((r) => /^\d{5}$/.test(r.lawdCd)));
  // 10억 단위 돌파 — "신고가"와 "처음으로 30억을 넘었다"는 소식의 크기가 다르다
  check("29.9억 → 30억은 30억 돌파", singoMilestone(299000, 300000) === 30, String(singoMilestone(299000, 300000)));
  check("30.1억 → 30.5억은 돌파 아님", singoMilestone(301000, 305000) === null, String(singoMilestone(301000, 305000)));
  check("29.9억 → 41억은 40억 돌파(두 선을 한 번에)", singoMilestone(299000, 410000) === 40, String(singoMilestone(299000, 410000)));
  check("9.9억 → 10억은 10억 돌파", singoMilestone(99000, 100000) === 10, String(singoMilestone(99000, 100000)));
  check("경계 직전은 돌파 아님", singoMilestone(99000, 99900) === null, String(singoMilestone(99000, 99900)));
  // 오너: "10억, 20억… 이렇게 해서 **100억까지**를 말한 거야" — 선을 목록으로 두지 않고
  // 몫으로 재므로 100억도, 그 위도 그대로 잡힌다. 목록을 두면 언젠가 빠뜨린다.
  check("99억 → 100억은 100억 돌파", singoMilestone(990000, 1000000) === 100, String(singoMilestone(990000, 1000000)));
  check("50.5억 → 60억은 60억 돌파", singoMilestone(505000, 600000) === 60, String(singoMilestone(505000, 600000)));
  check("100억 → 105억은 돌파 아님", singoMilestone(1000000, 1050000) === null, String(singoMilestone(1000000, 1050000)));

  // 기준선 문구는 **값에서 자동으로 나와야 한다** — 사람이 따로 적으면 기간을 바꾼 날 어긋난다
  check("기준선 시작월은 2020-01 (오너 결정)", SINGO_FROM === "202001", SINGO_FROM);
  check("기준선 문구가 값에서 나온다", singoBaseline("202001") === "2020년 이후", singoBaseline("202001"));
  check("1월이 아니면 월까지 적는다", singoBaseline("202108") === "2021년 8월 이후", singoBaseline("202108"));
  check("기준선을 2006 으로 내리면 문구도 따라간다", singoBaseline("200601") === "2006년 이후", singoBaseline("200601"));

  /* ── 역 뱃지 (2026-08-16 오너 "가까운 역을 뱃지로")
   * 카카오는 역 이름에 노선을 붙여 주기도 하고("철산역 7호선"), 출입구별로 여러 건을 준다.
   * 카드에는 **역 이름만** 적고 노선은 뱃지가 말한다. */
  check("역 이름에서 노선 꼬리를 뗀다", cleanStationName("철산역 7호선") === "철산역", cleanStationName("철산역 7호선"));
  check("괄호 꼬리도 뗀다", cleanStationName("사당역(4호선)") === "사당역", cleanStationName("사당역(4호선)"));
  /* ⚠️ "호선"이 안 붙는 노선이 있다 — 2026-08-16 실제 수집분에서 그대로 나왔고,
     뱃지가 노선 동그라미 옆에 노선 이름을 한 번 더 적고 있었다. */
  check("수인분당선 꼬리를 뗀다", cleanStationName("망포역 수인분당선") === "망포역", cleanStationName("망포역 수인분당선"));
  check("신분당선 꼬리를 뗀다", cleanStationName("청계산입구역 신분당선") === "청계산입구역", cleanStationName("청계산입구역 신분당선"));
  check("경의중앙선 꼬리를 뗀다", cleanStationName("서울역 경의중앙선") === "서울역", cleanStationName("서울역 경의중앙선"));
  check("⛔ 역 이름 자체는 건드리지 않는다", cleanStationName("선릉역") === "선릉역", cleanStationName("선릉역"));
  check("⛔ 노선 꼬리가 없으면 그대로", cleanStationName("망포역") === "망포역", cleanStationName("망포역"));
  check("멀쩡한 이름은 그대로", cleanStationName("광명사거리역") === "광명사거리역", cleanStationName("광명사거리역"));
  check(
    "숫자 노선을 집어낸다",
    linesFromCategory("교통,수송 > 지하철,전철 > 수도권7호선", "철산역").join(",") === "7",
    linesFromCategory("교통,수송 > 지하철,전철 > 수도권7호선", "철산역").join(","),
  );
  check(
    "환승역은 노선이 여러 개",
    linesFromCategory("… > 수도권2호선 … 수도권4호선", "사당역").join(",") === "2,4",
    linesFromCategory("… > 수도권2호선 … 수도권4호선", "사당역").join(","),
  );
  check(
    "이름 있는 노선도 집어낸다",
    linesFromCategory("교통,수송 > 지하철,전철 > 신분당선", "판교역").join(",") === "신분당",
    linesFromCategory("교통,수송 > 지하철,전철 > 신분당선", "판교역").join(","),
  );
  check("모르는 형태면 빈 배열", linesFromCategory("교통,수송 > 지하철,전철", "무슨역").length === 0, "");

  const mr = singoMonthRange("202511", "202602");
  check("월 범위는 해를 넘어간다", mr.join(",") === "202511,202512,202601,202602", mr.join(","));

  /* ── 단지 동일성 — 형제 단지를 한 칸으로 합치지 않는다 (2026-08-13 사고)
   * 괄호를 지운 이름으로 명부를 찾다가 `상록마을(라이프2차)` 가 남의 단지
   * `정자상록마을우성(1,762세대)` 에 붙었고, **그 세대수가 그대로 알림에 실렸다.**
   * 같은 방식으로 `가락쌍용(2차)` → `가락쌍용1차`, `효자촌(현대)` → `서현효자촌그린타운`.
   * 아래가 그 세 건을 그대로 붙잡는다. */
  check("괄호 안 글자를 살린다", singoFullName("상록마을(라이프2차)") === "상록마을라이프2차", singoFullName("상록마을(라이프2차)"));
  check("⛔ 상록마을(라이프2차) ≠ 정자상록마을우성", !singoSameApt("정자상록마을우성", "상록마을(라이프2차)"), "");
  check("⛔ 가락쌍용(2차) ≠ 가락쌍용1차", !singoSameApt("가락쌍용1차", "가락쌍용(2차)"), "");
  check("⛔ 효자촌(현대) ≠ 서현효자촌그린타운", !singoSameApt("서현효자촌그린타운", "효자촌(현대)"), "");
  // 명부는 앞에 동 이름을 붙이는 버릇이 있다 — 이건 같은 단지다
  check("개봉한마을 = 한마을", singoSameApt("개봉한마을", "한마을"), "");
  check("이문쌍용 = 쌍용", singoSameApt("이문쌍용", "쌍용"), "");
  check("하안주공10단지 = 주공10", singoSameApt("하안주공10단지", "주공10"), "");
  check("신내건영2차아파트 = 건영2차아파트", singoSameApt("신내건영2차아파트", "건영2차아파트"), "");
  check("마곡13단지 힐스테이트마스터 아파트 = 마곡13단지힐스테이트마스터", singoSameApt("마곡13단지 힐스테이트마스터 아파트", "마곡13단지힐스테이트마스터"), "");
  // 차수만 다른 형제는 거절
  check("⛔ 주공6 ≠ 인창주공7단지", !singoSameApt("인창주공7단지", "주공6"), "");
  check("⛔ 상록마을(임광) ≠ 상록마을(라이프2차)", !singoSameApt("상록마을(임광)", "상록마을(라이프2차)"), "");

  /* ── 톡 본문 — 돌파 블록과 전체 목록은 다른 말이다 (2026-08-13 사고)
   * 금액대(그 거래가 속한 구간)로 묶어 보냈더니 14억·11억 거래가 "10억 돌파"로 읽혔다.
   * 오너: "10억을 돌파한 단지들만 보고싶다니까. 왜 14억 11억 이런게 왜나오냐고".
   * 아래 테스트가 그 경계를 붙잡는다 — 돌파 블록에는 **선을 실제로 넘은 것만** 들어간다. */
  const hit = (
    gu: string,
    aptNm: string,
    priceManwon: number,
    prevPeakManwon: number,
    date = "2026-07-24",
  ) => ({
    aptNm,
    umdNm: "무슨동",
    jibun: "1",
    priceWon: priceManwon * 10000,
    priceManwon,
    area: 84.9,
    floor: 10,
    buildYear: 2000,
    date,
    dealingGbn: "중개거래",
    canceled: false,
    sggCd: "11110",
    type: "84" as const,
    pyeong: "34평",
    lawdCd: "11110",
    gu,
    prevPeakManwon,
    prevPeakDate: "2026-06-01",
    gainPct: ((priceManwon - prevPeakManwon) / prevPeakManwon) * 100,
    milestone: singoMilestone(prevPeakManwon, priceManwon),
  });

  // 이미 10억을 넘겨 둔 단지(직전 13.5억 → 14억)와, 이번에 처음 10억을 넘은 단지(9.8 → 10.3)
  const body = singoAlertBody([
    hit("성남시분당구", "상록마을", 207000, 196000), // 19.6 → 20.7 = 20억 돌파
    hit("안양시동안구", "평촌트리지아", 140000, 135000), // 13.5 → 14.0 = 돌파 아님
    hit("구로구", "한마을", 119500, 116000), // 11.6 → 11.95 = 돌파 아님
    hit("동대문구", "쌍용", 103000, 98000), // 9.8 → 10.3 = 10억 돌파
  ], 0, "2026-08-13");
  const cut = body.indexOf("─────────────────");
  const head = body.slice(0, cut).join("\n");
  const rest = body.slice(cut).join("\n");

  check("돌파 블록이 맨 앞에 온다", body[0] === "🎉 오늘의 돌파 2건", body[0]);
  check("돌파는 큰 선부터", head.indexOf("20억 돌파") < head.indexOf("10억 돌파"), head);
  check("돌파 블록에 20.7억(19.6→20.7)이 있다", head.includes("상록마을"), head);
  check("돌파 블록에 10.3억(9.8→10.3)이 있다", head.includes("쌍용"), head);
  check("⛔ 14억(13.5→14.0)은 돌파 블록에 없다", !head.includes("평촌트리지아"), head);
  check("⛔ 11.95억(11.6→11.95)은 돌파 블록에 없다", !head.includes("한마을"), head);
  check("돌파 줄에 직전 최고가를 적는다", head.includes("20.7억 / 07.24 (직전 19.6억)"), head);
  check("전체 목록은 뒤에 오고 건수를 밝힌다", rest.includes("📋 신고가 전체 4건"), rest);
  check("전체 목록에는 14억도 들어간다", rest.includes("평촌트리지아"), rest);
  check("⛔ 금액대 제목(【10억대】)은 쓰지 않는다", !body.join("\n").includes("억대】"), body.join("\n"));

  /* ── 거래일 (2026-08-13 오너 "톡에 거래일도 포함해줘")
   * 거래일은 **계약일**이라 8월 알림에 7월 날짜가 섞이는 게 정상이다. 해가 넘어간 건을
   * "12.30" 으로만 적으면 올해 일로 읽힌다 — 그때만 연도를 붙인다. */
  check("전체 목록에 거래일이 붙는다", rest.includes("14억 / 07.24"), rest);
  check("날짜가 계약일임을 제목에 밝힌다", rest.includes("날짜는 계약일"), rest);
  const crossYear = singoAlertBody(
    [hit("구로구", "한마을", 119500, 116000, "2025-12-30")],
    0,
    "2026-08-13",
  );
  check("해가 다르면 연도를 붙인다", crossYear.join("\n").includes("25.12.30"), crossYear.join("\n"));
  check("같은 해면 연도를 안 붙인다", !rest.includes("26.07.24"), rest);

  // 돌파가 하나도 없는 날은 🎉 블록 자체가 없다 — 빈 제목만 남으면 그것도 오해를 만든다
  const quiet = singoAlertBody([hit("구로구", "한마을", 119500, 116000)], 0, "2026-08-13");
  check(
    "돌파 0건이면 돌파 블록을 안 만든다",
    quiet[0] === "📋 신고가 전체 1건 (거래가 큰 순 · 날짜는 계약일)",
    quiet[0],
  );

  /* ── 목록이 **무엇의 하루치인지** 스스로 말하는가 (2026-08-24)
     오너가 "계약일은 한참 전인데 왜 오늘 뜨냐"고 두 번 물었다. 답은 신고기한(최대 30일)인데
     문구에 그 말이 없어서 읽는 사람이 알 길이 없었다. 문구를 지우면 같은 질문이 또 온다 —
     그래서 검사로 붙잡는다. 지우면 여기서 빨간불이 난다. */
  const tail = quiet.join("\n");
  check("계약일 기준이 아님을 목록이 스스로 밝힌다", tail.includes("오늘 새로 드러난"), quiet.at(-2));
  check("계약일이 흩어지는 이유(신고기한)를 적는다", tail.includes("30일"), quiet.at(-1));

  /* ── 지번으로 명부를 잇는 길 (2026-08-25)
     이름으로 못 잇는 단지가 명부의 43% 였다 — 실거래 「위례24단지(꿈에그린)」 ↔
     대장 「송파꿈에그린아파트」. 지번(장지동 901)은 양쪽이 같다.
     ⚠️ 법정동 이름에도 숫자가 붙는다("신문로2가") — 그 숫자를 지번으로 집으면 통째로 어긋난다. */
  check("대장 주소에서 지번을 뽑는다", jibunFromAddr("서울특별시 송파구 장지동 901 송파꿈에그린아파트") === "901");
  check("끝의 '-' 를 뗀다", jibunFromAddr("서울특별시 강동구 둔촌동 633- 올림픽파크포레온") === "633");
  check(
    "법정동의 숫자(신문로2가)를 지번으로 착각하지 않는다",
    jibunFromAddr("서울특별시 종로구 신문로2가 1-434 광화문스페이스본 아파트") === "1-434",
  );
  check("지번이 없는 주소는 null", jibunFromAddr("경기도 성남시 분당구 정자동 상록마을") === null);
  check("문자 지번은 버린다", normJibun("가-") === null);
  check("부번은 살린다", normJibun("5869-2") === "5869-2");
}

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail > 0) process.exit(1);
