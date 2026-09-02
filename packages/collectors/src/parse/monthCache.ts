/**
 * 📦 「구 × 월」 최고가 캐시 — 곡선을 **API 없이** 그리기 위한 저장고
 *
 * ── 왜 생겼나 (2026-09-02)
 * 국토부에는 **「그 단지의 이력」을 주는 창구가 없다.** 그래서 곡선 수집기는 이렇게 한다:
 *
 *     「광명시 2020년 1월 **전체 거래** 줘」 → 수백 건 받아서 → **우리 단지 한 곳만** 골라낸다
 *     …이걸 81번 반복
 *
 * 여기에 낭비가 둘 있었다.
 *   ① **같은 것을 여러 번 받는다.** 09-02 에 카드 19장의 구는 14곳뿐이었는데,
 *      광명시 하나에 3단지가 있어 광명시 81개월치를 **세 번** 받았다.
 *   ② **변하지 않는 것을 매번 다시 받는다.** 2020년 3월 거래는 앞으로도 2020년 3월 거래다.
 *
 * 그 결과 곡선 한 번이 **약 1,500회**를 썼고(아침 신고가 전체가 122회다),
 * 09-02 에 하루 예산을 통째로 태워 낮에는 모든 국토부 배관이 막혔다.
 * 문구는 `SERVICE_KEY_IS_NOT_REGISTERED_ERROR`(등록되지 않은 서비스키)로 나오지만
 * **실은 일일 호출 한도**다(2026-08-16d 실측).
 *
 * ── 무엇을 담나
 * 그 구·그 달의 **명부 단지별·타입별 최고가 한 줄**. 원본 거래를 통째로 담지 않는다 —
 * 그러면 수십 MB 가 아니라 수백 MB 가 된다. 카드가 쓰는 것은 월 최고가뿐이다.
 *
 * ⚠️ **1,000세대 이상 명부 단지만** 담는다. 카드는 명부 안에서만 만들어지기 때문이다.
 *    나중에 어떤 단지가 명부에 새로 들어오면 그 단지의 과거는 캐시에 없다 —
 *    그때는 그 구를 한 번 백필하면 된다(그 구의 다른 단지도 같이 채워진다).
 *
 * ── ⚠️ 최근 두 달은 덮어쓴다
 * 실거래 **신고기한이 30일**이라 지난달 계약이 뒤늦게 들어온다.
 * 그래서 「이미 있으면 건너뛴다」는 **세 달 전부터**만 참이다.
 */
import type { AptTrade } from "./molit.js";
import { areaType } from "./singo.js";

/** 캐시 한 줄 — 그 달, 그 단지, 그 타입의 최고가 */
export interface MonthRow {
  /** 실거래 신고 표기 그대로의 단지명 (곡선이 `sameApt` 으로 잇는다) */
  apt: string;
  /** 법정동 — 같은 구에 같은 이름이 여럿이라 반드시 함께 본다 */
  umd: string;
  /** "59" | "84" */
  type: string;
  /** 그 달 최고가(만원) */
  max: number;
  area: number;
  floor: number;
  /** 계약일 YYYY-MM-DD */
  date: string;
  /** 그 달 그 칸의 거래 건수 — 곡선의 `count` 로 간다 */
  count: number;
}

export interface MonthCache {
  lawd: string;
  ym: string;
  /** 언제 접었나 — 최근 두 달을 다시 받을지 판단할 때 본다 */
  savedAt: string;
  /**
   * **무엇을 걸러 담았나.** 지금은 `"universe"` 하나뿐이다 — 1,000세대 이상 명부 단지만.
   *
   * ⚠️ 이 칸이 없으면 안 된다. 명부만 담은 파일을 「전부 담긴 것」으로 읽으면,
   *    명부 밖 단지의 곡선이 **거래가 없던 달처럼** 그려진다. 빈 곡선은 틀린 곡선이고
   *    그건 오보다. 읽는 쪽이 이 칸을 보고 **믿을지 말지**를 정한다.
   */
  scope: "universe";
  rows: MonthRow[];
}

/**
 * 한 구·한 달의 거래를 **캐시 줄로 접는다.**
 *
 * 곡선이 쓰는 것과 **똑같은 조건**으로 거른다 — 조건이 갈라지면 캐시로 그린 곡선과
 * API 로 그린 곡선이 달라지고, 그게 「같은 입력 = 같은 픽셀」을 깨뜨린다:
 *   · 전용 59·84 타입만
 *   · **직거래 제외**
 *   · 해제거래 제외(`validTrades` 가 이미 걸렀다고 보고 여기선 `canceled` 만 한 번 더 본다)
 *
 * @param inUniverse 그 (법정동, 단지명)이 **1,000세대 이상 명부**에 있는지. 없으면 안 담는다.
 *                   판단을 여기서 하지 않는 이유는 명부 잇기 규칙이 `parse/singo.ts` 의
 *                   `pickUniverse` 하나에 있기 때문이다 — 같은 판단을 두 곳에 두지 않는다.
 */
export function foldMonth(
  trades: AptTrade[],
  inUniverse: (umdNm: string, aptNm: string, jibun: string) => boolean,
): MonthRow[] {
  const best = new Map<string, MonthRow>();
  for (const t of trades) {
    if (t.canceled) continue;
    if (!(t.priceManwon > 0) || !t.aptNm) continue;
    const type = areaType(t.area);
    if (!type) continue;
    if (t.dealingGbn === "직거래") continue;
    if (!inUniverse(t.umdNm, t.aptNm, t.jibun)) continue;
    const k = `${t.umdNm}|${t.aptNm}|${type}`;
    const cur = best.get(k);
    if (!cur) {
      best.set(k, {
        apt: t.aptNm, umd: t.umdNm, type,
        max: t.priceManwon, area: t.area, floor: t.floor, date: t.date, count: 1,
      });
      continue;
    }
    cur.count += 1;
    if (t.priceManwon > cur.max) {
      cur.max = t.priceManwon; cur.area = t.area; cur.floor = t.floor; cur.date = t.date;
    }
  }
  /* 줄 순서를 고정한다 — 같은 입력이면 같은 파일이어야 git 이 헛되이 안 바뀐다 */
  return [...best.values()].sort((a, b) =>
    a.umd === b.umd ? (a.apt === b.apt ? a.type.localeCompare(b.type) : a.apt.localeCompare(b.apt)) : a.umd.localeCompare(b.umd),
  );
}

/**
 * 캐시에서 한 단지·한 타입의 그 달 값을 꺼낸다.
 * `sameApt`(이름 잇기)은 곡선 쪽에서 넘겨받는다 — 규칙을 여기 복사하지 않는다.
 */
export function pickRow(
  rows: MonthRow[],
  aptNm: string,
  type: string,
  umdNm: string | undefined,
  sameApt: (a: string, b: string) => boolean,
): MonthRow | null {
  let best: MonthRow | null = null;
  for (const r of rows) {
    if (r.type !== type) continue;
    if (umdNm && r.umd !== umdNm) continue;
    if (!sameApt(r.apt, aptNm)) continue;
    if (!best || r.max > best.max) best = r;
  }
  return best;
}

/**
 * 그 달을 **다시 받아야 하나.**
 *
 * ⚠️ 「있으면 건너뛴다」는 **세 달 전부터**만 참이다. 실거래 신고기한이 30일이라
 *    이번 달·지난달은 뒤늦게 들어오는 계약이 있다(그래서 아침 알림도 2개월을 본다).
 *
 * @param ym    보려는 달 "YYYYMM"
 * @param today 오늘 "YYYY-MM-DD" (KST 기준으로 넘긴다)
 */
export function needsRefresh(ym: string, today: string, has: boolean): boolean {
  if (!has) return true;
  const cur = Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1;
  const m = Number(ym.slice(0, 4)) * 12 + Number(ym.slice(4, 6)) - 1;
  return cur - m <= 1; // 이번 달·지난달만 덮어쓴다
}
