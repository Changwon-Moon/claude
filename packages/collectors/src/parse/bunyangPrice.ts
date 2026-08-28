/**
 * 청약홈 「APT 주택형별 분양정보」(15101047) 파서.
 *
 * 이 데이터가 필요한 이유는 하나다 — **프리미엄을 코드가 빼기 위해서**다.
 *   프리미엄 = 분양권 실거래가 − 같은 타입 분양가
 * 뒤의 값을 사람이 옮겨 적으면 그 순간 오보 0 이 깨진다.
 *
 * ⚠️ **컬럼 이름은 유추하지 않는다.** 포털 화면의 항목표에 한글 이름만 적혀 있고
 * 영문명 칸은 비어 있다(2026-08-28 확인). 자동변환 API 가 한글 키를 그대로 낼지
 * 영문으로 바꿔 낼지는 **응답을 봐야 안다** — 분양권 수집기에서 유추가 한 번 틀렸던
 * 바로 그 자리다. 그래서 후보를 나열하고, 첫 수집이 원본 한 행과 키 목록을 남긴다.
 */

/** 후보 중 값이 있는 첫 키. 없으면 "" */
function pick(row: Record<string, unknown>, ...names: string[]): string {
  for (const n of names) {
    const v = row[n];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

/** 콤마·공백 제거 숫자화 (실패 시 NaN) */
function num(s: unknown): number {
  if (s == null) return NaN;
  const n = Number(String(s).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export interface TypePrice {
  houseManageNo: string; // 주택관리번호 — 공고를 잇는 열쇠
  pblancNo: string; // 공고번호
  modelNo: string; // 모델번호
  houseType: string; // 주택형 (예: "084.9721A")
  supplyArea: number; // 주택공급면적(㎡)
  exclusiveArea: number; // 주택형에서 뽑은 전용면적(㎡) — 실거래와 잇는 열쇠
  generalUnits: number; // 일반공급 세대수
  specialUnits: number; // 특별공급 세대수
  topPriceManwon: number; // 공급금액(분양최고금액, 만원)
}

/**
 * 주택형 문자열에서 전용면적을 뽑는다. 청약홈 표기는 `084.9721A` 꼴이다 —
 * 앞의 숫자가 전용면적, 뒤 글자가 타입(A/B/C…).
 * 실거래(`excluUseAr`)와 잇는 유일한 공통 열쇠라 여기서 확실히 뽑는다.
 */
export function areaFromHouseType(houseType: string): number {
  const m = houseType.match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : NaN;
}

/** 주택형에서 타입 글자(A/B/C…). 없으면 "" */
export function letterFromHouseType(houseType: string): string {
  const m = houseType.match(/\d+(?:\.\d+)?\s*([A-Za-z가-힣]+)/);
  return m ? m[1] : "";
}

export function parseTypePrices(rows: Record<string, unknown>[]): TypePrice[] {
  const out: TypePrice[] = [];
  for (const r of rows) {
    const houseType = pick(r, "주택형", "HOUSE_TY", "houseTy");
    const top = num(pick(r, "공급금액(분양최고금액)", "공급금액_분양최고금액", "공급금액", "LTTOT_TOP_AMOUNT", "supplyAmount"));
    if (!houseType || !Number.isFinite(top)) continue;
    out.push({
      houseManageNo: pick(r, "주택관리번호", "HOUSE_MANAGE_NO", "houseManageNo"),
      pblancNo: pick(r, "공고번호", "PBLANC_NO", "pblancNo"),
      modelNo: pick(r, "모델번호", "MODEL_NO", "modelNo"),
      houseType,
      supplyArea: num(pick(r, "주택공급면적", "SUPLY_AR", "suplyAr")),
      exclusiveArea: areaFromHouseType(houseType),
      generalUnits: num(pick(r, "일반공급세대수", "GNRL_HSHLDCO", "gnrlHshldco")) || 0,
      specialUnits: num(pick(r, "특별공급세대수", "SPSPLY_HSHLDCO", "spsplyHshldco")) || 0,
      topPriceManwon: top,
    });
  }
  return out;
}

/**
 * 전용면적이 **얼마나 가까우면 같은 타입인가**.
 * 실거래의 `excluUseAr` 와 청약홈 주택형의 숫자는 소수점 아래에서 갈린다
 * (84.9721 vs 84.97). 0.05㎡ 안이면 같은 타입으로 본다 — 한 단지 안에서
 * 그보다 가까운 서로 다른 타입은 없다.
 */
export const AREA_TOLERANCE = 0.05;

/**
 * 한 공고의 타입 목록에서 주어진 전용면적에 맞는 것을 고른다.
 * **둘 이상 맞으면 null 을 낸다** — 상록마을 사고와 같은 자리다.
 * 애매한 것을 하나 골라 붙이느니 못 이은 채로 두는 편이 낫다.
 */
export function matchType(types: TypePrice[], area: number): TypePrice | null {
  const hits = types.filter((t) => Math.abs(t.exclusiveArea - area) <= AREA_TOLERANCE);
  if (hits.length !== 1) return null;
  return hits[0];
}

/**
 * 프리미엄(만원). 실거래가에서 그 타입 **분양최고금액**을 뺀다.
 * 최고금액을 빼므로 결과는 **실제 프리미엄의 하한**이다 — 카드에 그렇게 적는다.
 */
export function premiumManwon(dealManwon: number, type: TypePrice): number {
  return dealManwon - type.topPriceManwon;
}

/** 응답 첫 행의 키 이름 전부. 유추가 틀렸을 때 답을 찾는 자리. */
export function rowKeys(rows: Record<string, unknown>[]): string[] {
  return rows.length ? Object.keys(rows[0]) : [];
}
