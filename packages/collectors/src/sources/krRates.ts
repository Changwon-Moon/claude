/**
 * 한국은행 ECOS 수집기 — 기준금리 + 원/달러 환율.
 * ECOS_API_KEY 환경변수 필요(M0에서 발급, GitHub Secrets 주입).
 *
 * 통계표 코드(ECOS):
 *  - 한국은행 기준금리: 722Y001 / 항목 0101000 / 주기 D
 *  - 원/달러 매매기준율: 731Y001 / 항목 0000001 / 주기 D
 * (코드가 바뀌면 아래 상수만 수정. ECOS 통계코드 검색으로 확인.)
 */
import { fetchText } from "../http.js";
import { parseEcosJson, ecosTimeToDate, type EcosPoint } from "../parse/ecos.js";
import {
  direction,
  round,
  type CollectionResult,
  type Quote,
} from "../types.js";

const ECOS_BASE = "https://ecos.bok.or.kr/api/StatisticSearch";

interface EcosSpec {
  symbol: string;
  label: string;
  statCode: string;
  itemCode: string;
  cycle: "D" | "M";
  /** 조회 최근 N개 */
  count: number;
}

const SPECS: EcosSpec[] = [
  { symbol: "BASE_RATE", label: "기준금리", statCode: "722Y001", itemCode: "0101000", cycle: "D", count: 30 },
  { symbol: "USD/KRW", label: "원/달러 환율", statCode: "731Y001", itemCode: "0000001", cycle: "D", count: 30 },
];

/** 최근 데이터 조회를 위한 시작/끝 기간 (D: YYYYMMDD, M: YYYYMM) */
function period(cycle: "D" | "M", now: Date): { start: string; end: string } {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  if (cycle === "M") return { start: `${y - 1}${m}`, end: `${y}${m}` };
  return { start: `${y - 1}${m}${d}`, end: `${y}${m}${d}` };
}

function ecosUrl(key: string, spec: EcosSpec, now: Date): string {
  const { start, end } = period(spec.cycle, now);
  // /{KEY}/json/kr/{start_row}/{end_row}/{STAT}/{CYCLE}/{START}/{END}/{ITEM}
  return `${ECOS_BASE}/${key}/json/kr/1/${spec.count}/${spec.statCode}/${spec.cycle}/${start}/${end}/${spec.itemCode}`;
}

/** EcosPoint[] → Quote (기준금리는 변화가 드물어 changeAbs=0 흔함) */
export function ecosToQuote(spec: EcosSpec, points: EcosPoint[]): Quote {
  if (points.length === 0) throw new Error(`${spec.symbol}: ECOS 데이터 없음`);
  const last = points[points.length - 1];
  const prev = points[points.length - 2] ?? last;
  const changeAbs = round(last.value - prev.value, spec.symbol === "BASE_RATE" ? 2 : 2);
  const changePct = prev.value ? round(((last.value - prev.value) / prev.value) * 100, 2) : 0;
  return {
    symbol: spec.symbol,
    label: spec.label,
    value: round(last.value, 2),
    changeAbs,
    changePct,
    dir: direction(changeAbs),
    asOf: ecosTimeToDate(last.time),
  };
}

export async function collectKrRates(now = new Date()): Promise<CollectionResult> {
  const key = process.env.ECOS_API_KEY;
  if (!key) {
    throw new Error(
      "ECOS_API_KEY 환경변수가 없습니다. (M0에서 발급 → GitHub Secrets 등록)",
    );
  }

  const quotes: Quote[] = [];
  let asOf = "";
  for (const spec of SPECS) {
    const json = await fetchText(ecosUrl(key, spec, now));
    const points = parseEcosJson(json);
    const q = ecosToQuote(spec, points);
    quotes.push(q);
    asOf = q.asOf > asOf ? q.asOf : asOf;
  }

  return {
    source: "kr-rates",
    asOf,
    collectedAt: now.toISOString(),
    quotes,
    sourceName: "한국은행 ECOS",
  };
}
