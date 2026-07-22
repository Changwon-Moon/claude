/**
 * 국토부 실거래가 수집 (네트워크·키 필요 → GitHub Actions).
 * 아파트 매매 상세: getRTMSDataSvcAptTradeDev. 구(LAWD 5자리) × 월(YYYYMM) 단위로 전 페이지 수집.
 * MOLIT_API_KEY 필요(공공, 무료·인코딩 인증키). 세션은 네트워크 차단이라 Actions에서 실행.
 */
import { fetchText } from "../http.js";
import { parseAptTrades, parseTotalCount, apiError, type AptTrade } from "../parse/molit.js";

const BASE = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev";

/** 구·월 한 달치 아파트 매매 전 건 수집(전 페이지). key는 인코딩 인증키(URL 그대로 붙임) */
export async function fetchAptTradesMonth(
  lawdCd: string,
  dealYmd: string,
  key: string,
  opts: { rows?: number; maxPages?: number } = {},
): Promise<AptTrade[]> {
  const rows = opts.rows ?? 1000;
  const maxPages = opts.maxPages ?? 20;
  const all: AptTrade[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url =
      `${BASE}?serviceKey=${key}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}` +
      `&pageNo=${page}&numOfRows=${rows}`;
    const xml = await fetchText(url, { retries: 2 });
    const err = apiError(xml);
    if (err) throw new Error(`MOLIT ${lawdCd}/${dealYmd} 오류: ${err}`);
    const batch = parseAptTrades(xml);
    all.push(...batch);
    const total = parseTotalCount(xml);
    if (!batch.length || all.length >= total || batch.length < rows) break;
  }
  return all;
}
