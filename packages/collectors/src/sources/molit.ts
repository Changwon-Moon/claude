/**
 * 국토부 실거래가 수집 (네트워크·키 필요 → GitHub Actions).
 * 아파트 매매: 상세(getRTMSDataSvcAptTradeDev) 우선, 실패 시 기본(getRTMSDataSvcAptTrade) 폴백.
 * (활용신청 종류에 따라 상세/기본 중 하나만 열려 있어도 동작하도록.)
 * MOLIT_API_KEY 필요(공공, 무료). 세션은 네트워크 차단이라 Actions에서 실행.
 */
import { parseAptTrades, parseTotalCount, apiError, type AptTrade } from "../parse/molit.js";

const HOST = "https://apis.data.go.kr/1613000";
// 상세(Dev, 영문태그·해제/거래유형 필드) → 기본(한글태그) 순으로 시도
const ENDPOINTS = [
  `${HOST}/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev`,
  `${HOST}/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade`,
];

/**
 * 서비스키 정규화 — 공공데이터포털의 '인코딩 키'와 '디코딩 키' 어느 쪽이 등록됐든
 * URL에 안전한 형태(퍼센트 인코딩)로 통일한다.
 */
export function encKey(raw: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(raw));
  } catch {
    return encodeURIComponent(raw);
  }
}

/** 상태·본문을 함께 반환하는 GET(403 등도 본문 확보해 진단) */
async function getRaw(url: string, timeoutMs = 15000): Promise<{ status: number; body: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "wirit-collector/0.1" } });
    const body = await res.text();
    return { status: res.status, body };
  } finally {
    clearTimeout(t);
  }
}

/** 한 페이지 요청 — endpoint·key·params → 정상 XML 본문. 실패 시 사유 throw */
async function fetchPage(endpoint: string, key: string, lawdCd: string, dealYmd: string, page: number, rows: number): Promise<string> {
  const url = `${endpoint}?serviceKey=${encKey(key)}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&pageNo=${page}&numOfRows=${rows}`;
  let last = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const { status, body } = await getRaw(url);
    if (status === 200) {
      const err = apiError(body);
      if (err) throw new Error(`API본문오류: ${err}`);
      return body;
    }
    last = `HTTP ${status}${body ? " · " + body.replace(/\s+/g, " ").slice(0, 160) : ""}`;
    if (status === 403 || status === 401) break; // 인증 문제는 재시도 무의미
    await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
  }
  throw new Error(last || "요청 실패");
}

/** 구·월 한 달치 아파트 매매 전 건 수집. 엔드포인트(상세→기본) 자동 선택 후 전 페이지 */
export async function fetchAptTradesMonth(
  lawdCd: string,
  dealYmd: string,
  key: string,
  opts: { rows?: number; maxPages?: number } = {},
): Promise<AptTrade[]> {
  const rows = opts.rows ?? 1000;
  const maxPages = opts.maxPages ?? 20;

  // 1페이지로 동작하는 엔드포인트 결정
  let endpoint = "";
  let firstXml = "";
  const errs: string[] = [];
  for (const ep of ENDPOINTS) {
    try {
      firstXml = await fetchPage(ep, key, lawdCd, dealYmd, 1, rows);
      endpoint = ep;
      break;
    } catch (e) {
      errs.push(`${ep.split("/").pop()}: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (!endpoint) {
    throw new Error(
      `모든 엔드포인트 실패 — ${errs.join(" | ")}\n` +
        `↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). ` +
        `공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.`,
    );
  }

  const all: AptTrade[] = [...parseAptTrades(firstXml)];
  const total = parseTotalCount(firstXml);
  for (let page = 2; page <= maxPages; page++) {
    if (all.length >= total) break;
    const xml = await fetchPage(endpoint, key, lawdCd, dealYmd, page, rows);
    const batch = parseAptTrades(xml);
    all.push(...batch);
    if (batch.length < rows) break;
  }
  return all;
}
