/**
 * 🏗️ 공급면적 — 건축물대장 전유공용면적에서 **실측**으로 뽑는다
 *
 * ── 왜 (오너 2026-08-16d: "카드를 만들때에는 실제 공급평수를 적어줘야지")
 * 예전엔 전용 84 → 34평, 59 → 25평 **고정 대응표**였다(`parse/singo.ts` 의 `PYEONG_LABEL`).
 * 단지가 뭐든 같은 값이 나오니 **오보 0 규칙 위반**이고, 실제로 틀렸다 —
 * 늘푸른벽산·래미안크리시엘·광명한진은 34평이 아니라 **33평**, 화서역푸르지오는 25평이 아니라 **26평**.
 *
 * ── 셈법 (2026-08-16d 실측으로 확정 · 네이버부동산 표기와 대조 완료)
 *
 *     공급면적 = 전유 + 「주건축물」 공용
 *
 * 건축물대장은 한 호에 달린 면적을 줄 단위로 준다. 늘푸른벽산 110동 1703호 실제 응답:
 *
 *   | 전유 | 주건축물   | 지상 17층 | 아파트          | 84.925 |  ← 전용
 *   | 공용 | 주건축물   | 각층      | 계단,승강기      | 16.571 |  ← 주거공용
 *   | 공용 | 주건축물   | 지하 지층 | 지하대피소       |  8.444 |  ← 주거공용
 *   | 공용 | 부속건축물 | 지상 1층  | 독서실,경비실    |  0.294 |  ← 기타공용
 *   | 공용 | 부속건축물 | 지상      | 관리,노인정      |  0.699 |  ← 기타공용
 *   | 공용 | 부속건축물 | 지상      | 기계,전기실,창고 |  0.319 |  ← 기타공용
 *   | 공용 | 부속건축물 | 지하      | 지하주차장       | 37.074 |  ← 기타공용
 *
 *   전유 84.925 + 주건축물 공용 25.015 = **109.94㎡** = 33.26평
 *   → 네이버부동산 표기 **109.94㎡ (84.92)** 와 소수점까지 일치한다.
 *
 * ── 왜 `mainAtchGbCd` 로 가르나 (키워드로 거르지 않는다)
 * 처음엔 용도 이름으로 주차·기계·복리를 걸러 보려 했는데, **「승강**기계**단」이 `기계` 에
 * 걸리는 오탐**이 났다. 이름은 단지마다 다르게 적히고 붙여 쓰기도 한다.
 * `mainAtchGbCd`(0=주건축물 · 1=부속건축물)는 **대장이 스스로 나눠 둔 칸**이라 흔들리지 않는다.
 *
 * ── 평 환산
 * 1평 = 3.305785㎡, **반올림**(2026-08-16d 오너 확인). 33.26 → 33평 · 25.95 → 26평.
 */

export type SupplyArea = {
  /** 전용면적(㎡) — 이 값으로 타입을 찾는다 */
  exclusive: number;
  /** 주거공용(㎡) = 주건축물 공용 합 */
  commonResidential: number;
  /** 공급면적(㎡) = 전유 + 주거공용 */
  supply: number;
  /** 공급 기준 평(반올림 전 실수) */
  pyeong: number;
  /** 카드에 쓰는 표기 — "33평" */
  pyeongLabel: string;
  /** 표본으로 쓴 호 — 근거를 남긴다 */
  sampleDong: string;
  sampleHo: string;
  /** 같은 전용면적 호가 몇 개였나 — 1개뿐이면 표본이 약하다는 뜻 */
  sampleCount: number;
};

export const PY_M2 = 3.305785;

/** 공급면적(㎡) → 카드 표기. 반올림(오너 2026-08-16d) */
export function supplyPyeongLabel(supplyM2: number): string {
  return `${Math.round(supplyM2 / PY_M2)}평`;
}

type Row = {
  dongNm?: string; hoNm?: string;
  exposPubuseGbCdNm?: string;   // 전유 / 공용
  mainAtchGbCd?: string;        // 0=주건축물 1=부속건축물
  mainAtchGbCdNm?: string;
  mainPurpsCdNm?: string;
  area?: number | string;
};

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const isExclusive = (r: Row) => String(r.exposPubuseGbCdNm ?? "").includes("전유");
const isMainBld = (r: Row) =>
  String(r.mainAtchGbCd ?? "") === "0" || String(r.mainAtchGbCdNm ?? "").includes("주건축물");

/**
 * 전유공용면적 줄 전부 → 찾는 전용면적에 해당하는 호의 공급면적.
 *
 * `wantExclusive` 에 가장 가까운 **아파트 전유**를 가진 호를 고른다.
 * 못 찾으면 **null 을 돌려준다 — 추정하지 않는다.**
 */
export function supplyAreaOf(rows: Row[], wantExclusive: number, tolerance = 0.6): SupplyArea | null {
  if (!rows?.length || !Number.isFinite(wantExclusive) || wantExclusive <= 0) return null;

  // 호 단위로 묶는다
  const byHo = new Map<string, Row[]>();
  for (const r of rows) {
    const k = `${String(r.dongNm ?? "").trim()}|${String(r.hoNm ?? "").trim()}`;
    if (!byHo.has(k)) byHo.set(k, []);
    byHo.get(k)!.push(r);
  }

  // 전용면적이 맞는 호들을 모은다
  const hits: { key: string; rs: Row[]; ex: number }[] = [];
  for (const [key, rs] of byHo) {
    const ex = rs.filter((r) => isExclusive(r) && /아파트|공동주택/.test(String(r.mainPurpsCdNm ?? "")))
      .reduce((a, r) => a + num(r.area), 0);
    if (ex > 0 && Math.abs(ex - wantExclusive) <= tolerance) hits.push({ key, rs, ex });
  }
  if (!hits.length) return null;

  // 가장 가까운 호를 표본으로
  hits.sort((a, b) => Math.abs(a.ex - wantExclusive) - Math.abs(b.ex - wantExclusive));
  const best = hits[0];

  const common = best.rs
    .filter((r) => !isExclusive(r) && isMainBld(r))
    .reduce((a, r) => a + num(r.area), 0);
  if (common <= 0) return null;   // 주거공용이 0인 아파트는 없다 — 응답이 빈 것이다

  const supply = best.ex + common;
  const [dong, ho] = best.key.split("|");
  return {
    exclusive: Number(best.ex.toFixed(3)),
    commonResidential: Number(common.toFixed(3)),
    supply: Number(supply.toFixed(2)),
    pyeong: Number((supply / PY_M2).toFixed(2)),
    pyeongLabel: supplyPyeongLabel(supply),
    sampleDong: dong,
    sampleHo: ho,
    sampleCount: hits.length,
  };
}
