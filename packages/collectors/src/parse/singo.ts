/**
 * 신고가(역대 최고가) 판별 — 공통 규칙.
 *
 * ── 무엇을 재나 (2026-08-12 오너 결정)
 * "역대 최고가"는 **단지 + 평형대** 단위로 잰다. 같은 단지라도 59㎡와 84㎡은 다른 물건이라
 * 한 덩어리로 비교하면 뜻이 없기 때문이다.
 *
 * ── 왜 평형대(밴드)이지 전용면적 그대로가 아닌가
 * 오너가 읽을 단위가 "30평대"다. 그리고 **밴드로 재는 것이 전용면적으로 재는 것보다 엄격하다** —
 * 밴드는 그 전용면적을 부분집합으로 품으므로, 밴드 최고가를 넘었다면 같은 전용면적 최고가도
 * 반드시 넘는다. 즉 이 기준으로 "신고가"라 부른 것은 더 좁은 기준으로도 신고가다.
 * (반대로 밴드로 재면 작은 타입은 거의 안 걸린다 — 알림이 적고 강해지는 쪽이라 의도한 결과다.)
 *
 * ── 단지 키에 지번을 안 넣는 이유
 * 큰 단지는 동에 따라 지번이 갈려 신고된다. 지번까지 키에 넣으면 한 단지가 둘로 쪼개져
 * **가짜 신고가**가 난다(작은 쪽 지번의 최고가만 넘어도 신고가가 되어버린다).
 * 구 + 법정동 + 단지명으로 묶으면 쪼개지지 않는다. 같은 동에 같은 이름의 다른 단지가 있으면
 * 둘이 합쳐지는데, 그건 문턱이 높아지는 방향(=보수적)이라 오보를 만들지 않는다.
 */

/** 전용면적(㎡) → 평형대 라벨. 경계는 국민주택 규모(85㎡)와 실제 공급 타입 분포에 맞췄다. */
export function areaBand(area: number): string {
  if (!Number.isFinite(area) || area <= 0) return "";
  if (area < 40) return "10평대";
  if (area < 60) return "20평대";
  if (area < 85) return "30평대";
  if (area < 115) return "40평대";
  if (area < 145) return "50평대";
  return "60평대 이상";
}

/**
 * 단지명 정규화 — 같은 단지가 신고 표기에 따라 갈라지지 않게 한다.
 * 공백·괄호주석·차수 표기 흔들림을 흡수하되, **이름 자체는 지우지 않는다**(다른 단지가 합쳐지면 안 된다).
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

/** 최고가 인덱스의 칸 키 — 단지 키 + 평형대. */
export function peakKey(sggCd: string, umdNm: string, aptNm: string, area: number): string {
  return `${aptKey(sggCd, umdNm, aptNm)}|${areaBand(area)}`;
}

export interface PeakEntry {
  aptNm: string;
  umdNm: string;
  band: string;
  priceManwon: number;
  area: number;
  floor: number;
  date: string; // YYYY-MM-DD
}

export interface PeakIndex {
  meta: {
    lawdCd: string;
    gu: string;
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
    const band = areaBand(t.area);
    if (!band) continue;
    const k = peakKey(lawdCd, t.umdNm, t.aptNm, t.area);
    const cur = peaks[k];
    if (!cur || t.priceManwon > cur.priceManwon) {
      peaks[k] = {
        aptNm: t.aptNm,
        umdNm: t.umdNm,
        band,
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
  band: string;
  lawdCd: string;
  gu: string;
  prevPeakManwon: number | null;
  prevPeakDate: string | null;
  gainPct: number | null; // 직전 최고가 대비 상승률(%). 직전 기록이 없으면 null
}

/**
 * 거래 목록 중 **직전까지의 최고가를 넘어선 것**만 고른다.
 *
 * ⚠️ 인덱스를 훑는 동안 함께 갱신한다. 같은 날 같은 밴드에서 두 건이 연달아 신고가면
 * 더 높은 쪽만 남기기 위해서다(둘 다 알리면 "신고가 두 번"이 되어 사실과 어긋난다).
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
  // 기록**이어야 한다 — 중간값을 기준으로 잡으면 "0.3% 상승" 같은 사실과 다른 상승률이 나온다.
  const before = new Map<string, PeakEntry>();
  const best = new Map<string, { t: TradeLike; band: string }>();

  for (const t of sorted) {
    const band = areaBand(t.area);
    if (!band) continue;
    const k = peakKey(lawdCd, t.umdNm, t.aptNm, t.area);
    const cur = peaks[k];
    if (!cur) continue; // 역대 기록이 없는 칸 — 판정하지 않는다
    if (!before.has(k)) before.set(k, cur);
    if (t.priceManwon <= cur.priceManwon) continue;
    // 같은 칸의 뒤 거래는 이 값을 기준으로 본다(그래야 "신고가 두 번"이 안 생긴다)
    peaks[k] = { aptNm: t.aptNm, umdNm: t.umdNm, band, priceManwon: t.priceManwon, area: t.area, floor: t.floor, date: t.date };
    const prev = best.get(k);
    if (!prev || t.priceManwon > prev.t.priceManwon) best.set(k, { t, band });
  }

  const hits: SingoHit[] = [];
  for (const [k, { t, band }] of best) {
    const base = before.get(k)!;
    hits.push({
      ...t,
      band,
      lawdCd,
      gu,
      prevPeakManwon: base.priceManwon,
      prevPeakDate: base.date,
      gainPct: base.priceManwon > 0 ? ((t.priceManwon - base.priceManwon) / base.priceManwon) * 100 : null,
    });
  }
  return hits;
}

/** 만원 → "12억 3,400" 같은 읽는 금액. 카드가 아니라 알림용 표기다. */
export function manwonToKo(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok <= 0) return `${manwon.toLocaleString("ko-KR")}만`;
  if (rest === 0) return `${eok}억`;
  return `${eok}억 ${rest.toLocaleString("ko-KR")}`;
}
