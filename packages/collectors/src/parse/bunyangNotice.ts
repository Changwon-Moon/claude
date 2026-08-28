/**
 * 청약홈 「APT 분양정보」(15101046) CSV 파서 — **공고의 뼈대**.
 *
 * 주택형별 분양가(15101047)와 **한 쌍**이다. 포털이 그렇게 안내한다:
 *   "분양정보의 기본정보(주택명, 공급위치 등) 확인이 필요하면 '주택관리번호'와 매핑하라"
 *
 * 우리 쓰임새는 둘이다:
 *   ① **입주예정월** — 「27년 이후 입주 분양권」의 '27년 이후'를 코드가 가른다.
 *      캡처의 그 목록을 사람 눈이 아니라 데이터가 만든다.
 *   ② **주택명·공급위치** — 국토부 실거래의 단지명·법정동과 잇는 열쇠.
 *
 * ⚠️ 이것도 매일 도는 청약홈 수집기(`applyhome-latest.json`)와 **다른 것**이다.
 * 그쪽은 "지금 접수 중인 공고"만 최근 7일치 담는다. 이 CSV 는 **2,594건의 지난 공고**다 —
 * 이미 분양이 끝나 분양권이 거래되는 단지는 여기에만 있다.
 */

/** 후보 중 값이 있는 첫 컬럼. 없으면 "" */
function pick(row: Record<string, string>, ...names: string[]): string {
  for (const n of names) {
    const v = row[n];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function num(s: unknown): number {
  if (s == null) return NaN;
  const n = Number(String(s).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

/** CSV 의 Y/N 칸. 비어 있으면 null — **모르는 것을 false 로 만들지 않는다.** */
function yn(s: string): boolean | null {
  const v = s.trim().toUpperCase();
  if (v === "Y") return true;
  if (v === "N") return false;
  return null;
}

export interface BunyangNotice {
  houseManageNo: string; // 주택관리번호 — 주택형별 분양가와 잇는 열쇠
  pblancNo: string; // 공고번호
  name: string; // 주택명
  areaName: string; // 공급지역명
  address: string; // 공급위치
  supply: number; // 공급규모(가구)
  noticeDate: string; // 모집공고일
  moveInYm: string; // 입주예정월 (YYYY-MM)
  builder: string; // 건설업체명(시공사)
  developer: string; // 사업주체명(시행사)
  kindName: string; // 주택구분코드명 (민영/국민/신혼희망타운 …)
  priceCap: boolean | null; // 분양가상한제
  speculative: boolean | null; // 투기과열지구
  adjusted: boolean | null; // 조정대상지역
  redevelopment: boolean | null; // 정비사업
}

export function parseBunyangNotices(rows: Record<string, string>[]): BunyangNotice[] {
  const out: BunyangNotice[] = [];
  for (const r of rows) {
    const name = pick(r, "주택명", "HOUSE_NM", "houseNm");
    const houseManageNo = pick(r, "주택관리번호", "HOUSE_MANAGE_NO", "houseManageNo");
    if (!name || !houseManageNo) continue;
    out.push({
      houseManageNo,
      pblancNo: pick(r, "공고번호", "PBLANC_NO", "pblancNo"),
      name,
      areaName: pick(r, "공급지역명", "SUBSCRPT_AREA_CODE_NM"),
      address: pick(r, "공급위치", "HSSPLY_ADRES"),
      supply: num(pick(r, "공급규모", "TOT_SUPLY_HSHLDCO")) || 0,
      noticeDate: pick(r, "모집공고일", "RCRIT_PBLANC_DE"),
      moveInYm: pick(r, "입주예정월", "MVN_PREARNGE_YM"),
      builder: pick(r, "건설업체명_시공사", "건설업체명(시공사)", "CNSTRCT_ENTRPS_NM"),
      developer: pick(r, "사업주체명_시행사", "사업주체명(시행사)", "BSNS_MBY_NM"),
      kindName: pick(r, "주택구분코드명", "HOUSE_SECD_NM"),
      priceCap: yn(pick(r, "분양가상한제", "LRSCL_BLDLND_AT")),
      speculative: yn(pick(r, "투기과열지구", "SPECLT_RDN_EARTH_AT")),
      adjusted: yn(pick(r, "조정대상지역", "MDAT_TRGET_AREA_SECD")),
      redevelopment: yn(pick(r, "정비사업", "IMPRMN_BSNS_AT")),
    });
  }
  return out;
}

/**
 * 입주예정월이 `since`(YYYY-MM) 이후인 공고만.
 * 「27년 이후 입주」를 **코드가 가른다** — 목록을 사람이 고르면 그게 커뮤니티 글과 같아진다.
 * 입주예정월이 비어 있는 공고는 **뺀다.** 모르는 것을 '이후'에 넣지 않는다.
 */
export function movingInSince(notices: BunyangNotice[], since: string): BunyangNotice[] {
  return notices.filter((n) => n.moveInYm && n.moveInYm >= since);
}

/**
 * 이름 대조용 정규화 — 공백·괄호·중점을 없앤다.
 * 청약홈은 `마포자이힐스테이트 라첼스`, 국토부 실거래는 `마포자이힐스테이트라첼스` 로 온다.
 *
 * ⚠️ **여기서 더 지우지 않는다.** 2026-08-13 상록마을 사고는 괄호 안 숫자까지 지운 이름이
 * 남의 단지에 붙어 생겼다. `송도자이풍경채 그라노블 1단지` 와 `4단지` 는 다른 단지다 —
 * 숫자는 반드시 남긴다.
 */
export function normName(s: string): string {
  return s.replace(/[\s()（）·・,]/g, "");
}
