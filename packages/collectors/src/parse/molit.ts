/**
 * 국토부 실거래가 API 파서 — 아파트 매매(상세, getRTMSDataSvcAptTradeDev) XML → 정규화 거래 배열.
 * 1차 출처(국토교통부). 오보 0 원칙: 수치는 여기서 코드로 추출하고 provenance를 남긴다.
 *
 * 방어적 태그 추출: 상세(Dev, 영문 태그: aptNm/dealAmount/excluUseAr/dealYear…)와
 * 기본(한글 태그: 아파트/거래금액/전용면적/년…) 응답을 모두 처리한다.
 * 해제여부(cdealType='O')·직거래(dealingGbn) 필드도 보존해 후속 콘텐츠(해제 통계 등)에 사용.
 */

/** <tag>값</tag> 중 names 후보의 첫 매치 텍스트(트림). 없으면 "" */
function tag(block: string, ...names: string[]): string {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}>\\s*([\\s\\S]*?)\\s*</${n}>`));
    if (m) return m[1].trim();
  }
  return "";
}

/** 콤마·공백 제거 숫자화 (실패 시 NaN) */
export function num(s: unknown): number {
  if (s == null) return NaN;
  const n = Number(String(s).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export interface AptTrade {
  aptNm: string; // 아파트명
  umdNm: string; // 법정동
  jibun: string; // 지번
  priceWon: number; // 거래금액(원) — 만원*10000
  priceManwon: number; // 거래금액(만원)
  area: number; // 전용면적(㎡)
  floor: number; // 층
  buildYear: number; // 건축년도
  date: string; // YYYY-MM-DD 계약일
  dealingGbn: string; // 거래유형(중개/직거래) — 상세만
  canceled: boolean; // 해제여부(cdealType='O')
  sggCd: string; // 시군구코드
}

/** 국토부 아파트 매매 실거래 응답 XML → 거래 배열. 해제 거래도 포함(canceled=true 플래그) */
export function parseAptTrades(xml: string): AptTrade[] {
  const out: AptTrade[] = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const it of items) {
    const priceManwon = num(tag(it, "dealAmount", "거래금액"));
    const y = tag(it, "dealYear", "년");
    const mo = tag(it, "dealMonth", "월");
    const d = tag(it, "dealDay", "일");
    if (!Number.isFinite(priceManwon) || !y) continue;
    const pad = (s: string) => s.padStart(2, "0");
    out.push({
      aptNm: tag(it, "aptNm", "아파트"),
      umdNm: tag(it, "umdNm", "법정동"),
      jibun: tag(it, "jibun", "지번"),
      priceWon: priceManwon * 10000,
      priceManwon,
      area: num(tag(it, "excluUseAr", "전용면적")),
      floor: num(tag(it, "floor", "층")),
      buildYear: num(tag(it, "buildYear", "건축년도")),
      date: `${y}-${pad(mo)}-${pad(d)}`,
      dealingGbn: tag(it, "dealingGbn"),
      canceled: tag(it, "cdealType") === "O",
      sggCd: tag(it, "sggCd", "지역코드"),
    });
  }
  return out;
}

/** API 응답에서 totalCount(전체 건수) 추출 — 페이지네이션 종료 판단용 */
export function parseTotalCount(xml: string): number {
  return num(tag(xml, "totalCount"));
}

/** 응답이 정상인지(resultCode 00) — 아니면 사유 문자열 반환, 정상이면 null */
export function apiError(xml: string): string | null {
  const code = tag(xml, "resultCode", "returnReasonCode");
  const msg = tag(xml, "resultMsg", "returnAuthMsg", "errMsg");
  if (code && code !== "00" && code !== "000") return `${code} ${msg}`.trim();
  if (/SERVICE ERROR|LIMITED_NUMBER|SERVICE_KEY_IS_NOT_REGISTERED/i.test(xml)) return msg || "API 오류";
  return null;
}

const key = (t: AptTrade) => `${t.aptNm}|${t.umdNm}`;

/** 유효 거래(해제 제외) */
export function validTrades(txs: AptTrade[]): AptTrade[] {
  return txs.filter((t) => !t.canceled && t.priceWon > 0 && t.aptNm);
}

/** 단지별 최고가 1건만(신고가). aptNm+법정동 기준. 가격 내림차순 */
export function highestPerApt(txs: AptTrade[]): AptTrade[] {
  const best = new Map<string, AptTrade>();
  for (const t of validTrades(txs)) {
    const k = key(t);
    const cur = best.get(k);
    if (!cur || t.priceWon > cur.priceWon) best.set(k, t);
  }
  return [...best.values()].sort((a, b) => b.priceWon - a.priceWon);
}

/**
 * 대장 산출: ①절대가 대장 TOP ②국평(전용 84㎡대) 대장.
 * areaBand 기본 [82,86) — 전용 84㎡ '국민평형' 근사.
 */
export function summarizeDaejang(
  txs: AptTrade[],
  opts: { topN?: number; areaBand?: [number, number] } = {},
): { topByPrice: AptTrade[]; flagship84: AptTrade | null; count: number } {
  const topN = opts.topN ?? 3;
  const [lo, hi] = opts.areaBand ?? [82, 86];
  const ranked = highestPerApt(txs);
  const flagship84 =
    ranked.filter((t) => t.area >= lo && t.area < hi).sort((a, b) => b.priceWon - a.priceWon)[0] ?? null;
  return { topByPrice: ranked.slice(0, topN), flagship84, count: validTrades(txs).length };
}

/** 억 표기 문자열 (예: 1050000000 → "105억", 445000000 → "44.5억") */
export function toEok(won: number): string {
  const eok = won / 100000000;
  return (Number.isInteger(eok) ? eok.toFixed(0) : eok.toFixed(1)) + "억";
}
