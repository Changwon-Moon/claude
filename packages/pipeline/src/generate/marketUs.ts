/**
 * 미국 증시 raw → "간밤의 미국 증시" 콘텐츠 JSON 변환 (결정적).
 * 수집기(us-market)의 지수 3종(S&P500·나스닥·다우) + 1년 시계열을 카드 입력으로 매핑한다.
 * LLM 미사용: 모든 수치는 raw 에서 코드로 추출.
 */
import { formatNum, formatDelta, formatDateShort, formatYearMonth } from "../format.js";
import type { RawCollection, RawQuote, MarketContent } from "../types.js";

function findQuote(raw: RawCollection, symbol: string): RawQuote {
  const q = raw.quotes.find((x) => x.symbol === symbol);
  if (!q) throw new Error(`raw에 ${symbol} 시세가 없습니다 (source=${raw.source})`);
  return q;
}

export function generateMarketUs(raw: RawCollection): MarketContent {
  const order = ["^SPX", "^NDQ", "^DJI"];
  const quotes = order.map((s) => findQuote(raw, s));

  const indices = quotes.map((q) => ({
    label: q.label,
    value: formatNum(q.value),
    delta: formatDelta(q.changeAbs, q.changePct),
    dir: q.dir,
  }));

  // 대표: S&P 500 + 1년 차트
  const spx = quotes[0];
  const spxSeries = raw.series?.find((s) => s.symbol === "^SPX");
  if (!spxSeries || spxSeries.points.length < 2) {
    throw new Error("^SPX 1년 시계열이 없습니다");
  }
  const points = spxSeries.points;

  const featured: MarketContent["featured"] = {
    name: "S&P 500",
    logoText: "S&P",
    logoColor: "#1f4fd1",
    sublabel: "미국 대표지수",
    price: formatNum(spx.value),
    delta: formatDelta(spx.changeAbs, spx.changePct),
    dir: spx.dir,
    chart: points.map((p) => p.close),
    chartFrom: formatYearMonth(points[0].date),
    chartTo: formatYearMonth(points[points.length - 1].date),
  };

  return {
    template: "market-daily@1",
    date: formatDateShort(raw.asOf),
    flag: "us",
    title: "간밤의 미국 증시",
    indices,
    featured,
    source: { name: raw.sourceName, asOf: raw.asOf },
  };
}
