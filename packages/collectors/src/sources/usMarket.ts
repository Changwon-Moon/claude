/**
 * 미국 증시 수집기 (Stooq, 무료·키 불필요) — "간밤의 미국 증시" 원료.
 * 지수: S&P 500(^spx), 나스닥 종합(^ndq), 다우(^dji).
 */
import { fetchText } from "../http.js";
import { parseStooqDailyCsv, monthlySample, type DailyRow } from "../parse/stooq.js";
import {
  direction,
  round,
  type CollectionResult,
  type Quote,
  type Series,
} from "../types.js";

const INDICES: { symbol: string; label: string; stooq: string }[] = [
  { symbol: "^SPX", label: "S&P 500", stooq: "^spx" },
  { symbol: "^NDQ", label: "나스닥", stooq: "^ndq" },
  { symbol: "^DJI", label: "다우존스", stooq: "^dji" },
];

const stooqDailyUrl = (s: string) =>
  `https://stooq.com/q/d/l/?s=${encodeURIComponent(s)}&i=d`;

/** DailyRow[] → 최신 Quote (전일 대비 계산) */
export function toQuote(symbol: string, label: string, rows: DailyRow[]): Quote {
  if (rows.length < 2) {
    throw new Error(`${symbol}: 시세 행이 2개 미만이라 등락 계산 불가`);
  }
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  const changeAbs = round(last.close - prev.close, 2);
  const changePct = round(((last.close - prev.close) / prev.close) * 100, 2);
  return {
    symbol,
    label,
    value: round(last.close, 2),
    changeAbs,
    changePct,
    dir: direction(changeAbs),
    asOf: last.date,
  };
}

export async function collectUsMarket(): Promise<CollectionResult> {
  const quotes: Quote[] = [];
  const series: Series[] = [];
  let asOf = "";

  for (const idx of INDICES) {
    const csv = await fetchText(stooqDailyUrl(idx.stooq));
    const rows = parseStooqDailyCsv(csv);
    const q = toQuote(idx.symbol, idx.label, rows);
    quotes.push(q);
    asOf = q.asOf;
    series.push({
      symbol: idx.symbol,
      label: idx.label,
      points: monthlySample(rows).map((r) => ({ date: r.date, close: r.close })),
    });
  }

  return {
    source: "us-market",
    asOf,
    collectedAt: new Date().toISOString(),
    quotes,
    series,
    sourceName: "Stooq",
  };
}
