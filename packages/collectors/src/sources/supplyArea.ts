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
  /** 전용률(전유÷공급). **눈으로 의심할 자리**를 만든다 — 아래 note 참고 */
  ratio: number;
  /**
   * 주거공용을 이룬 줄들 — 용도별로. **합계만 남기면 나중에 의심할 수가 없다.**
   * 실제로 이 목록이 없었으면 서초포레스타2단지의 주거공용 39.87㎡(전용률 68%)를
   * "그런가 보다" 하고 넘길 뻔했다.
   */
  parts: { purpose: string; floor: string; area: number }[];
  /** 전용률이 흔한 범위(70~85%) 밖이면 경고를 남긴다 — 막지는 않는다(사람이 본다) */
  warn?: string;
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
 * ⚠️ **주차장·대피소는 「주건축물」로 적혀 있어도 주거공용이 아니다** (2026-09-05)
 *
 * 위 `mainAtchGbCd` 규칙은 대부분 맞지만 **전부는 아니다.** 어떤 단지는 지하주차장을
 * `주건축물` 칸에 넣어 두는데, 그러면 그 면적이 통째로 주거공용에 더해진다.
 * 그 결과가 이렇다 — 전용 59~60㎡ 72곳의 표기 중앙값이 **25평**인데:
 *
 *   · 석수e-편한세상   지하주차장 20.5 + 대피소 5.3 → **30평** (전용률 59.6%)
 *   · 개봉 한마을      지하주차장 22.0 + 대피소 5.8 → **31평** (전용률 58.1%)
 *   · 철산주공(A42385801) 주차장 15.1            → **28평** (전용률 64.0%)
 *
 * 09-05 에 석수 카드를 만들다 드러났다. 「30평」이 제목에 박히면 그게 곧 오보다.
 *
 * ── 왜 이번엔 이름으로 거르나
 * 이 파일 머리말은 *"용도 이름으로 거르지 않는다 — 「승강**기계**단」이 `기계` 에 걸렸다"* 고
 * 적어 두었고 그 교훈은 **그대로 유효하다.** 그래서 넓게 거르지 않는다.
 * `주차` 와 `대피` 두 낱말만 본다 — 주거공용 용도에 이 두 글자가 들어가는 이름은 없다
 * (계단·복도·엘리베이터·홀·기계실·전기실 어디에도 안 걸린다).
 *
 * ⚠️ **두 칸을 다 본다.** 09-05 첫 판은 `mainPurpsCdNm` 만 봤는데, 실제 대장에서
 *    그 칸은 「부대시설」·「아파트」 같은 큰 갈래이고 **「지하주차장」은 `etcPurps` 에 있다.**
 *    그래서 아무것도 안 걸렀고 값이 그대로 30평이었다. 셀프테스트는 통과했다 —
 *    **내가 짐작한 모양으로 시험 자료를 만들었기 때문**이다. 시험 자료는 실제 응답의 모양을 따라야 한다.
 *
 * ⚠️ 이미 받아 둔 파일은 **다시 계산하지 않는다.** 그 값으로 이미 나간 카드가 있고,
 *    발행된 그림을 소급해 바꾸지 않는 것이 이 공장의 규칙이다(2026-09-03 오너).
 *    새로 받는 것부터 바르게 나온다. 되받고 싶으면 대기열에 `force=1` 을 붙인다.
 */
const isOtherCommon = (r: Row) =>
  /주차|대피/.test(`${r.mainPurpsCdNm ?? ""} ${(r as { etcPurps?: string }).etcPurps ?? ""}`);

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

  const commonAll = best.rs.filter((r) => !isExclusive(r) && isMainBld(r));
  /* 「주건축물」로 적혀 있어도 주차장·대피소는 기타공용이다 — 뺀 것을 기록에 남긴다 */
  const excluded = commonAll.filter(isOtherCommon);
  const commonRows = commonAll.filter((r) => !isOtherCommon(r));
  const common = commonRows.reduce((a, r) => a + num(r.area), 0);
  if (common <= 0) return null;   // 주거공용이 0인 아파트는 없다 — 응답이 빈 것이다

  const supply = best.ex + common;
  const ratio = best.ex / supply;
  const [dong, ho] = best.key.split("|");

  /* 전용률이 흔한 범위 밖이면 **말한다.** 막지는 않는다 — 진짜 그런 단지도 있다.
     다만 조용히 넘어가면 사람이 볼 기회가 없다. 실제로 서초포레스타2단지가
     68%(주거공용 39.87㎡)로 나왔고, 그건 84타입 공급평이 38평이라는 뜻이었다. */
  const warn = ratio < 0.70 || ratio > 0.85
    ? `전용률 ${(ratio * 100).toFixed(1)}% — 흔한 범위(70~85%) 밖이다. `
      + `parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것`
    : undefined;

  return {
    exclusive: Number(best.ex.toFixed(3)),
    commonResidential: Number(common.toFixed(3)),
    supply: Number(supply.toFixed(2)),
    pyeong: Number((supply / PY_M2).toFixed(2)),
    pyeongLabel: supplyPyeongLabel(supply),
    sampleDong: dong,
    sampleHo: ho,
    sampleCount: hits.length,
    ratio: Number(ratio.toFixed(4)),
    parts: commonRows.map((r) => ({
      purpose: `${r.mainPurpsCdNm ?? ""}${(r as any).etcPurps ? ` / ${(r as any).etcPurps}` : ""}`.trim(),
      floor: `${(r as any).flrGbCdNm ?? ""} ${(r as any).flrNoNm ?? ""}`.trim(),
      area: num(r.area),
    })).sort((a, b) => b.area - a.area),
    /* ⚠️ **뺀 것도 남긴다.** 「왜 이 단지만 평이 작지」를 나중에 되짚을 수 있어야 한다 —
       빼 놓고 말 안 하면 그건 조용히 값을 바꾼 것이다. */
    ...(excluded.length
      ? {
          excludedFromCommon: excluded
            .map((r) => ({ purpose: String(r.mainPurpsCdNm ?? ""), area: num(r.area) }))
            .sort((a, b) => b.area - a.area),
          excludedNote:
            "대장이 「주건축물」로 적었지만 주차장·대피소는 기타공용이라 공급면적에서 뺐다(2026-09-05). " +
            "이 줄을 넣으면 전용 60㎡ 가 30평으로 나온다 — 같은 타입 72곳의 중앙값은 25평이다.",
        }
      : {}),
    ...(warn ? { warn } : {}),
  };
}
