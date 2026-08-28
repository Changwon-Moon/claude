/**
 * 국토부 **아파트 분양권전매 실거래가** 수집 (네트워크·키 필요 → GitHub Actions).
 *   API: 공공데이터포털 15126471 · `RTMSDataSvcSilvTrade/getRTMSDataSvcSilvTrade`
 *   파라미터는 매매·전월세와 같다(LAWD_CD 5자리 + DEAL_YMD YYYYMM).
 *
 * 왜 이 배관을 새로 놓았나 (2026-08-28) —
 *   준공 전 단지에는 **매매 실거래가 없다.** 가장 가까운 실거래는 분양권 전매인데,
 *   그동안 우리는 그 값을 **보도에서 옮겨** 쓰고 있었다(구리역 롯데캐슬 시그니처
 *   11억8,681만원 = 뉴스핌 2026-08-26). 오보 0 은 '남이 쓴 숫자 베끼기'가 아니라
 *   '원자료에서 직접 세기'다 — 그 구멍을 메우는 배관이다.
 *
 * ⚠️ 활용신청이 매매·전월세와 **별도 승인 대상**이다. 403 이면 키가 아니라 승인을 본다.
 */
import { fetchPage, encKey } from "./molit.js";
import { parseSilvTrades, firstItemRaw, type SilvTrade } from "../parse/silv.js";
import { parseTotalCount, apiError } from "../parse/molit.js";

const HOST = "https://apis.data.go.kr/1613000";
const ENDPOINTS = [`${HOST}/RTMSDataSvcSilvTrade/getRTMSDataSvcSilvTrade`];

export { encKey };

export interface SilvMonth {
  trades: SilvTrade[];
  /** 응답이 말한 전체 건수 — 페이지네이션이 끝났는지 판단하는 근거 */
  totalCount: number;
  /** 첫 item 원본. 태그 이름을 사람이 대조하기 위한 것(추측을 조용히 통과시키지 않는다) */
  sampleItem: string;
}

/** 구·월 한 달치 분양권전매 전 건 수집(전 페이지). */
export async function fetchSilvTradesMonth(
  lawdCd: string,
  dealYmd: string,
  key: string,
  opts: { rows?: number; maxPages?: number } = {},
): Promise<SilvMonth> {
  const rows = opts.rows ?? 1000;
  const maxPages = opts.maxPages ?? 20;

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
      `분양권전매 엔드포인트 실패 — ${errs.join(" | ")}\n` +
        `↳ 403이면: (a) 키 전파 지연(최대 1~2시간) 또는 (b) '아파트 분양권전매 실거래가 자료'(data.go.kr 15126471) ` +
        `활용신청 미승인. 매매·전월세와 **별도 승인**이다.`,
    );
  }

  const err = apiError(firstXml);
  if (err) throw new Error(`API본문오류: ${err}`);

  const trades: SilvTrade[] = [...parseSilvTrades(firstXml)];
  const totalCount = parseTotalCount(firstXml);
  const sampleItem = firstItemRaw(firstXml);

  for (let page = 2; page <= maxPages; page++) {
    if (trades.length >= totalCount) break;
    const xml = await fetchPage(endpoint, key, lawdCd, dealYmd, page, rows);
    const batch = parseSilvTrades(xml);
    trades.push(...batch);
    if (batch.length < rows) break;
  }
  return { trades, totalCount, sampleItem };
}
