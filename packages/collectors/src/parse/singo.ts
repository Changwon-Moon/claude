/**
 * 신고가(역대 최고가 경신) 판별 — 공통 규칙.
 *
 * ── 무엇을 재나 (2026-08-12 오너 결정, 같은 날 한 번 좁혔다)
 * 처음엔 평형대(20·30·40평대)로 묶었는데, 오너가 레퍼런스 카드(theflow.daily「잠실 리센츠 33평
 * 36.95억」)를 보여주며 **"평형대 말고 평형. 전용 59·84 두 타입만"** 으로 좁혔다.
 * 그래서 판정 단위는 **단지 + 전용 59타입 / 전용 84타입** 둘뿐이다.
 *
 * ── 왜 이 둘인가
 * 이 둘이 아파트 시장의 표준 단위다. 같은 단지·같은 타입끼리 비교해야 "얼마나 올랐나"가
 * 뜻을 갖고, 다른 단지와도 견줄 수 있다. 나머지 평형은 단지마다 구성이 제각각이라
 * 매일 나가는 알림의 기준으로 삼기 어렵다.
 *
 * ── 단지 키에 지번을 안 넣는 이유
 * 큰 단지는 동에 따라 지번이 갈려 신고된다. 지번까지 키에 넣으면 한 단지가 둘로 쪼개져
 * **가짜 신고가**가 난다(작은 쪽 지번의 최고가만 넘어도 신고가가 되어버린다).
 * 구 + 법정동 + 단지명으로 묶으면 쪼개지지 않는다. 같은 동에 같은 이름의 다른 단지가 있으면
 * 둘이 합쳐지는데, 그건 문턱이 높아지는 방향(=보수적)이라 오보를 만들지 않는다.
 */

/** 인덱스 스키마 판번호. 판정 단위가 바뀌면 올린다 — 옛 인덱스는 자동으로 다시 채워진다. */
export const PEAK_SCHEMA = 2;

/**
 * 전용면적(㎡) → 타입. 우리가 보는 건 59타입·84타입 둘뿐이고, 나머지는 null(판정 대상 아님).
 *
 * 폭을 둔 이유: 같은 "84타입"이라도 신고 값이 84.97·84.99·83.53 처럼 흔들린다(A/B/C 타입).
 * 한 단지 안에서 이들은 같은 평형으로 거래·호가되므로 한 칸으로 묶는다.
 * 묶으면 문턱이 올라가는 쪽(=보수적)이라 오보를 만들지 않는다.
 */
export function areaType(area: number): "59" | "84" | null {
  if (!Number.isFinite(area) || area <= 0) return null;
  if (area >= 56 && area <= 62) return "59";
  if (area >= 82 && area <= 85.5) return "84";
  return null;
}

/**
 * 타입 → 공급면적 기준 평 표기 (2026-08-12 오너: "관용 환산표로 00평").
 *
 * ⚠️ 국토부 실거래에는 **전용면적만** 들어 있다. '33평'은 공급면적 기준이고 공급면적은
 * 단지별 전용률(보통 72~80%)에 달려 있어 자료에 없다. 그래서 이건 **환산 관용값**이고,
 * 단지에 따라 ±1평 어긋날 수 있다(예: 잠실 리센츠는 전용 84.99를 33평으로 부른다 — 구축이라
 * 전용률이 높다). 원본 전용면적은 산출 파일에 그대로 남긴다.
 * 표기를 바꾸려면 이 표 한 줄만 고친다.
 */
export const PYEONG_LABEL: Record<"59" | "84", string> = {
  "59": "25평",
  "84": "34평",
};

/** 전용면적 → "25평"/"34평". 대상 타입이 아니면 "" */
export function pyeongLabel(area: number): string {
  const t = areaType(area);
  return t ? PYEONG_LABEL[t] : "";
}

/**
 * 단지명 정규화 — 같은 단지가 신고 표기에 따라 갈라지지 않게 한다.
 * 공백·괄호주석·구분기호 흔들림을 흡수하되, **이름 자체는 지우지 않는다**(다른 단지가 합쳐지면 안 된다).
 */
export function normAptName(raw: string): string {
  return String(raw ?? "")
    .replace(/\([^)]*\)/g, "") // "(101동)" 같은 동 표기 제거 — 같은 단지가 동별로 갈리는 것을 막는다
    .replace(/[\s·.\-_]/g, "")
    .trim();
}

/** 단지 키 — 구 + 법정동 + 정규화 단지명. */
export function aptKey(sggCd: string, umdNm: string, aptNm: string): string {
  return `${sggCd}|${String(umdNm ?? "").trim()}|${normAptName(aptNm)}`;
}

/** 최고가 인덱스의 칸 키 — 단지 키 + 타입(59/84). 대상 타입이 아니면 null. */
export function peakKey(sggCd: string, umdNm: string, aptNm: string, area: number): string | null {
  const t = areaType(area);
  return t ? `${aptKey(sggCd, umdNm, aptNm)}|${t}` : null;
}

export interface PeakEntry {
  aptNm: string;
  umdNm: string;
  type: "59" | "84";
  priceManwon: number;
  area: number;
  floor: number;
  date: string; // YYYY-MM-DD
}

export interface PeakIndex {
  meta: {
    lawdCd: string;
    gu: string;
    schemaVersion: number;
    doneMonths: string[];
    updatedAt: string;
    source: string;
  };
  peaks: Record<string, PeakEntry>;
}

export interface TradeLike {
  aptNm: string;
  umdNm: string;
  priceManwon: number;
  area: number;
  floor: number;
  date: string;
  sggCd?: string;
}

/**
 * 거래 목록을 최고가 인덱스에 접어 넣는다(파괴적 갱신).
 * 같은 금액이면 **먼저 있던 기록을 유지**한다 — "최초로 그 값에 닿은 거래"가 기록이기 때문이다.
 * 그래서 같은 값의 재거래는 신고가로 잡히지 않는다.
 */
export function foldPeaks(peaks: Record<string, PeakEntry>, lawdCd: string, trades: TradeLike[]): number {
  let updated = 0;
  for (const t of trades) {
    const type = areaType(t.area);
    if (!type) continue;
    const k = `${aptKey(lawdCd, t.umdNm, t.aptNm)}|${type}`;
    const cur = peaks[k];
    if (!cur || t.priceManwon > cur.priceManwon) {
      peaks[k] = {
        aptNm: t.aptNm,
        umdNm: t.umdNm,
        type,
        priceManwon: t.priceManwon,
        area: t.area,
        floor: t.floor,
        date: t.date,
      };
      updated++;
    }
  }
  return updated;
}

export interface SingoHit extends TradeLike {
  type: "59" | "84";
  pyeong: string; // "25평" · "34평"
  lawdCd: string;
  gu: string;
  prevPeakManwon: number;
  prevPeakDate: string;
  gainPct: number | null; // 직전 최고가 대비 상승률(%)
}

/**
 * 거래 목록 중 **직전까지의 최고가를 넘어선 것**만 고른다.
 *
 * ⚠️ 인덱스를 훑는 동안 함께 갱신한다. 같은 칸에서 두 건이 연달아 신고가면 더 높은 쪽만
 * 남기기 위해서다(둘 다 알리면 "신고가 두 번"이 되어 사실과 어긋난다).
 * 그래서 **거래를 시간·금액 순으로 정렬해 넣어야** 한다.
 *
 * `peaks` 에 아예 기록이 없는 칸은 신고가로 치지 않는다 — 역대 자료가 안 채워진 구간일 수
 * 있고, 그때 "첫 거래 = 신고가"라고 부르면 그게 곧 오보다.
 */
export function findSingo(
  peaks: Record<string, PeakEntry>,
  lawdCd: string,
  gu: string,
  trades: TradeLike[],
): SingoHit[] {
  const sorted = [...trades].sort((a, b) =>
    a.date === b.date ? a.priceManwon - b.priceManwon : a.date < b.date ? -1 : 1,
  );

  // 같은 칸에서 여러 건이 연달아 경신될 수 있다. 그때 **직전 최고가는 이번 묶음이 들어오기 전의
  // 기록**이어야 한다 — 중간값을 기준으로 잡으면 사실과 다른 상승률이 나온다.
  const before = new Map<string, PeakEntry>();
  const best = new Map<string, { t: TradeLike; type: "59" | "84" }>();

  for (const t of sorted) {
    const type = areaType(t.area);
    if (!type) continue;
    const k = `${aptKey(lawdCd, t.umdNm, t.aptNm)}|${type}`;
    const cur = peaks[k];
    if (!cur) continue; // 역대 기록이 없는 칸 — 판정하지 않는다
    if (!before.has(k)) before.set(k, cur);
    if (t.priceManwon <= cur.priceManwon) continue;
    peaks[k] = { aptNm: t.aptNm, umdNm: t.umdNm, type, priceManwon: t.priceManwon, area: t.area, floor: t.floor, date: t.date };
    const prev = best.get(k);
    if (!prev || t.priceManwon > prev.t.priceManwon) best.set(k, { t, type });
  }

  const hits: SingoHit[] = [];
  for (const [k, { t, type }] of best) {
    const base = before.get(k)!;
    hits.push({
      ...t,
      type,
      pyeong: PYEONG_LABEL[type],
      lawdCd,
      gu,
      prevPeakManwon: base.priceManwon,
      prevPeakDate: base.date,
      gainPct: base.priceManwon > 0 ? ((t.priceManwon - base.priceManwon) / base.priceManwon) * 100 : null,
    });
  }
  return hits;
}

/**
 * 만원 → 알림 표기. 레퍼런스 카드가 "36.95억" 꼴이라 **억 소수 둘째 자리**로 맞춘다.
 * (369,500만원 → "36.95억", 300,000만원 → "30억")
 */
export function manwonToEok(manwon: number): string {
  const eok = manwon / 10000;
  const s = eok.toFixed(2).replace(/\.?0+$/, "");
  return `${s}억`;
}
