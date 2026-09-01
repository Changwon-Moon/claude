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

/* ───────────────────────────── 아파트 전월세 실거래 ─────────────────────────────
 * 국토부 아파트 전월세(getRTMSDataSvcAptRent). 매매와 같은 RTMS 계열·같은 LAWD_CD/DEAL_YMD.
 * 계약 한 건마다 보증금·월세금액이 있고, **월세금액 0 = 전세 / >0 = 월세** 로 코드가 가른다(오보 0).
 * 계약구분(신규/갱신)은 전월세신고제(2021.6~) 이후만 채워진다 — 없으면 typed 집계에서 빠진다.
 */
export interface AptRent {
  aptNm: string;        // 아파트명
  umdNm: string;        // 법정동
  deposit: number;      // 보증금(만원)
  monthlyRent: number;  // 월세(만원) — 0이면 전세
  isJeonse: boolean;    // 월세==0
  area: number;         // 전용면적(㎡)
  floor: number;
  buildYear: number;
  date: string;         // YYYY-MM-DD 계약일
  contractType: string; // 계약구분: 신규|갱신|"" (전월세신고제 이후만)
  useRRRight: string;   // 갱신요구권사용: 사용|미사용|""
  sggCd: string;        // 시군구코드
}

/** 국토부 아파트 전월세 응답 XML → 계약 배열. 영문(deposit/monthlyRent…)·한글(보증금액/월세금액…) 태그 모두 처리 */
export function parseAptRents(xml: string): AptRent[] {
  const out: AptRent[] = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const it of items) {
    const deposit = num(tag(it, "deposit", "보증금액"));
    const y = tag(it, "dealYear", "년");
    const mo = tag(it, "dealMonth", "월");
    const d = tag(it, "dealDay", "일");
    if (!Number.isFinite(deposit) || !y) continue;
    const mr = num(tag(it, "monthlyRent", "월세금액", "월세"));
    const monthlyRent = Number.isFinite(mr) ? mr : 0;
    const pad = (s: string) => s.padStart(2, "0");
    out.push({
      aptNm: tag(it, "aptNm", "아파트"),
      umdNm: tag(it, "umdNm", "법정동"),
      deposit,
      monthlyRent,
      isJeonse: !(monthlyRent > 0),
      area: num(tag(it, "excluUseAr", "전용면적")),
      floor: num(tag(it, "floor", "층")),
      buildYear: num(tag(it, "buildYear", "건축년도")),
      date: `${y}-${pad(mo)}-${pad(d)}`,
      contractType: tag(it, "contractType", "계약구분"),
      useRRRight: tag(it, "useRRRight", "갱신요구권사용"),
      sggCd: tag(it, "sggCd", "지역코드"),
    });
  }
  return out;
}

export interface RentAgg {
  total: number; jeonse: number; wolse: number; wolseRatio: number; // 월세/전체(%)
  newTotal: number; newJeonse: number; newWolse: number; newWolseRatio: number | null; // 신규계약 중 월세비중(%)
  renewTotal: number; renewJeonse: number; renewWolse: number;
  typedTotal: number; // 계약구분이 있는 건수(신규+갱신) — 전월세신고제 커버리지
  /** 전세 금액·면적 집계 (2026-09-01 신설). 전세(월세금액 0) 계약만 */
  price?: RentPriceAgg;
}

/**
 * 전세 금액·면적 집계 — **전용면적 기준**이다.
 *
 * ⚠️ 국토부 실거래(`excluUseAr`)에는 **전용면적만** 있고 공급면적은 없다.
 * 그래서 여기서 나오는 평당가는 전부 **전용 평당가**다. 공급 평당가로 읽으면 30%쯤 부풀려진다
 * (전용 84.98㎡ = 25.7 전용평 vs 공급 112.4㎡ = 34 공급평).
 * 공급면적이 필요하면 건축물대장(`apt-supply`)에서 단지별로 받아야 한다 — 여기서 추정하지 않는다.
 *
 * 평당가는 **면적가중**(보증금 합 ÷ 면적 합)이다. 이는 「평균 보증금 ÷ 평균 면적」과 항등이라
 * 통계표에서 평균가를 평균면적으로 나누는 방식과 같은 정의다. 계약별 평당가의 단순평균
 * (`perPyeongSimple`)은 소형 계약에 가중이 실려 값이 달라지므로 **대조용으로만** 함께 적어 둔다.
 */
export interface RentPriceAgg {
  unit: "만원 · 전용면적(㎡) 기준";
  /** 금액·면적이 모두 유효한 전세 계약 수 */
  n: number;
  depositSum: number;   // 보증금 합(만원)
  areaSum: number;      // 전용면적 합(㎡)
  avgDeposit: number;   // 평균 보증금(만원)
  avgArea: number;      // 평균 전용면적(㎡)
  perM2: number;        // 전용 ㎡당(만원) = depositSum / areaSum
  perPyeong: number;    // 전용 평당(만원) = perM2 × 3.3057851
  perPyeongSimple: number; // 계약별 평당가의 단순평균(만원) — 대조용
  /**
   * 면적대별 전세 평균 — **평당가를 곱해 만든 값이 아니라 그 면적대 계약만 직접 잰 값**이다.
   * 환산(㎡당 × 84.98)은 그 구의 면적 구성에 흔들린다. 실제로 종로는 환산 7.83억인데
   * 84㎡ 실측은 9.59억이었다(2026-09-01 실측). 카드에 쓰는 것은 **실측** 쪽이다.
   * 표본이 얇은 구가 생기므로 `n`(건수)을 반드시 함께 읽는다.
   */
  kp84: AreaBandAgg | null; // 전용 82~86㎡ (국평·34평형)
  kp59: AreaBandAgg | null; // 전용 57~61㎡ (25평형)
}

export interface AreaBandAgg {
  /** 면적대 하한·상한(㎡, 포함) — 카드가 "어디까지를 그 평형으로 셌나"를 말할 수 있게 함께 둔다 */
  loM2: number;
  hiM2: number;
  n: number;
  avgDeposit: number; // 만원
  avgArea: number;    // ㎡
}

/** 1평 = 400/121 ㎡ ≈ 3.3057851. 여기 한 곳에만 둔다 */
const PYEONG_M2 = 400 / 121;

/**
 * 면적대 창(㎡, 양끝 포함). **여기 한 곳에만 둔다** — 빌더가 자기 숫자를 따로 쓰면
 * 카드마다 "몇 ㎡까지를 84로 셌나"가 갈린다.
 * 84 는 82~86(84.9x·85.0 을 담는다), 59 는 57~61(59.7x~60.0 을 담는다).
 */
export const AREA_BANDS = { kp84: [82, 86], kp59: [57, 61] } as const;

/** 전월세 계약 배열 → 전세/월세·신규/갱신 집계(비중 포함) + 전세 금액·면적 집계. 수치는 코드가 센다(오보 0) */
export function aggregateRents(rents: AptRent[]): RentAgg {
  let jeonse = 0, wolse = 0, nT = 0, nJ = 0, nW = 0, rT = 0, rJ = 0, rW = 0;
  let pn = 0, dSum = 0, aSum = 0, ppSum = 0;
  const band = { kp84: { n: 0, d: 0, a: 0 }, kp59: { n: 0, d: 0, a: 0 } };
  for (const r of rents) {
    if (r.isJeonse) jeonse++; else wolse++;
    if (r.contractType === "신규") { nT++; r.isJeonse ? nJ++ : nW++; }
    else if (r.contractType === "갱신") { rT++; r.isJeonse ? rJ++ : rW++; }
    // ── 전세 금액·면적: 전세이면서 보증금·면적이 둘 다 양수인 것만 (0·결측은 세지 않는다)
    if (!r.isJeonse) continue;
    if (!(r.deposit > 0) || !(r.area > 0)) continue;
    pn++; dSum += r.deposit; aSum += r.area;
    ppSum += (r.deposit / r.area) * PYEONG_M2;
    for (const k of ["kp84", "kp59"] as const) {
      const [lo, hi] = AREA_BANDS[k];
      if (r.area >= lo && r.area <= hi) { band[k].n++; band[k].d += r.deposit; band[k].a += r.area; }
    }
  }
  const total = rents.length;
  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const bandOf = (k: "kp84" | "kp59"): AreaBandAgg | null => {
    const b = band[k];
    if (b.n === 0) return null;
    const [loM2, hiM2] = AREA_BANDS[k];
    return { loM2, hiM2, n: b.n, avgDeposit: r2(b.d / b.n), avgArea: r2(b.a / b.n) };
  };
  const price: RentPriceAgg | undefined =
    pn > 0
      ? {
          unit: "만원 · 전용면적(㎡) 기준",
          n: pn,
          depositSum: r2(dSum),
          areaSum: r2(aSum),
          avgDeposit: r2(dSum / pn),
          avgArea: r2(aSum / pn),
          perM2: r2(dSum / aSum),
          perPyeong: r2((dSum / aSum) * PYEONG_M2),
          perPyeongSimple: r2(ppSum / pn),
          kp84: bandOf("kp84"),
          kp59: bandOf("kp59"),
        }
      : undefined;
  return {
    total, jeonse, wolse, wolseRatio: pct(wolse, total),
    newTotal: nT, newJeonse: nJ, newWolse: nW, newWolseRatio: nT > 0 ? pct(nW, nT) : null,
    renewTotal: rT, renewJeonse: rJ, renewWolse: rW,
    typedTotal: nT + rT,
    ...(price ? { price } : {}),
  };
}
