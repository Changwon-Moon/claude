/** 파서 테스트용 고정 샘플(픽스처). 실제 응답 형식을 모사. */

// Stooq 일간 CSV (오래된 → 최신). 마지막 전일 6810.00 → 최신 6820.50 (=+10.50, +0.15%)
export const STOOQ_SPX_CSV = `Date,Open,High,Low,Close,Volume
2025-07-18,6400.00,6410.00,6390.00,6405.00,0
2025-08-18,6500.00,6520.00,6480.00,6510.00,0
2025-12-18,6700.00,6720.00,6680.00,6705.00,0
2026-07-16,6800.00,6815.00,6790.00,6810.00,0
2026-07-17,6812.00,6830.00,6805.00,6820.50,0`;

// 결측(N/D) 포함 케이스 — 파서가 스킵해야 함
export const STOOQ_WITH_GAPS_CSV = `Date,Open,High,Low,Close,Volume
2026-07-15,100,101,99,100.00,0
2026-07-16,N/D,N/D,N/D,N/D,N/D
2026-07-17,101,103,100,102.50,0`;

// ECOS StatisticSearch JSON (환율). 최신 1495.20, 전일 1490.90 (=+4.30)
export const ECOS_FX_JSON = JSON.stringify({
  StatisticSearch: {
    list_total_count: 3,
    row: [
      { STAT_CODE: "731Y001", TIME: "20260715", DATA_VALUE: "1488.00", ITEM_CODE1: "0000001" },
      { STAT_CODE: "731Y001", TIME: "20260716", DATA_VALUE: "1490.90", ITEM_CODE1: "0000001" },
      { STAT_CODE: "731Y001", TIME: "20260717", DATA_VALUE: "1495.20", ITEM_CODE1: "0000001" },
    ],
  },
});

// ECOS 에러 응답 — 파서가 명확히 throw 해야 함
export const ECOS_ERROR_JSON = JSON.stringify({
  RESULT: { CODE: "INFO-200", MESSAGE: "해당하는 데이터가 없습니다." },
});

// 국토부 아파트 매매 상세(Dev, 영문 태그) 응답 모사.
// 대장 = 신현대(3.0억?) 아니고 여기선 A동 105억, 국평(84.9㎡) = C 30억, 해제 1건은 제외돼야 함.
export const MOLIT_APT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<response><header><resultCode>00</resultCode><resultMsg>NORMAL SERVICE.</resultMsg></header>
<body><items>
  <item><aptNm>신현대11차</aptNm><umdNm>압구정동</umdNm><jibun>456</jibun><dealAmount>1,050,000</dealAmount><excluUseAr>183.41</excluUseAr><floor>7</floor><buildYear>1982</buildYear><dealYear>2026</dealYear><dealMonth>7</dealMonth><dealDay>3</dealDay><dealingGbn>중개거래</dealingGbn><cdealType></cdealType><sggCd>11680</sggCd></item>
  <item><aptNm>래미안대치팰리스</aptNm><umdNm>대치동</umdNm><jibun>12</jibun><dealAmount>650,000</dealAmount><excluUseAr>151.00</excluUseAr><floor>10</floor><buildYear>2015</buildYear><dealYear>2026</dealYear><dealMonth>7</dealMonth><dealDay>9</dealDay><dealingGbn>중개거래</dealingGbn><cdealType></cdealType><sggCd>11680</sggCd></item>
  <item><aptNm>국평샘플</aptNm><umdNm>도곡동</umdNm><jibun>3</jibun><dealAmount>300,000</dealAmount><excluUseAr>84.90</excluUseAr><floor>15</floor><buildYear>2005</buildYear><dealYear>2026</dealYear><dealMonth>7</dealMonth><dealDay>2</dealDay><dealingGbn>직거래</dealingGbn><cdealType></cdealType><sggCd>11680</sggCd></item>
  <item><aptNm>신현대11차</aptNm><umdNm>압구정동</umdNm><jibun>456</jibun><dealAmount>900,000</dealAmount><excluUseAr>160.00</excluUseAr><floor>3</floor><buildYear>1982</buildYear><dealYear>2026</dealYear><dealMonth>7</dealMonth><dealDay>1</dealDay><dealingGbn>중개거래</dealingGbn><cdealType></cdealType><sggCd>11680</sggCd></item>
  <item><aptNm>해제거래</aptNm><umdNm>청담동</umdNm><jibun>9</jibun><dealAmount>2,000,000</dealAmount><excluUseAr>200.00</excluUseAr><floor>20</floor><buildYear>2020</buildYear><dealYear>2026</dealYear><dealMonth>7</dealMonth><dealDay>5</dealDay><dealingGbn>중개거래</dealingGbn><cdealType>O</cdealType><sggCd>11680</sggCd></item>
</items>
<totalCount>5</totalCount></body></response>`;

// 국토부 인증키 미등록 에러 응답 모사
export const MOLIT_ERROR_XML = `<OpenAPI_ServiceResponse><cmmMsgHeader><returnReasonCode>30</returnReasonCode><returnAuthMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</returnAuthMsg><errMsg>SERVICE ERROR</errMsg></cmmMsgHeader></OpenAPI_ServiceResponse>`;

/* ── 청약홈(odcloud) 응답 모사 ─────────────────────────────────────────
 * 실제 응답을 세션에서 받아볼 수 없으므로(외부망 차단) 공개된 스펙의 필드 이름으로 만든 표본이다.
 * **이 표본이 맞다는 보장은 없다** — 그래서 파서는 필드를 못 찾으면 던지고, 첫 실제 실행에서
 * 이름이 다르면 워크플로가 빨갛게 뜬다(빈 결과로 넘어가지 않는다). 그때 이 표본을 실물로 교체한다.
 * 접수 마감 필드 이름이 오퍼레이션마다 다른 것(GNRL_RNK1_* vs SUBSCRPT_RCEPT_*)을 일부러 섞어 뒀다. */
export const APPLYHOME_APT_JSON = JSON.stringify({
  currentCount: 3,
  totalCount: 3,
  page: 1,
  perPage: 500,
  data: [
    {
      PBLANC_NO: "2026000401",
      HOUSE_MANAGE_NO: "2026000401",
      HOUSE_NM: "상동역 롯데캐슬 시그니처",
      SUBSCRPT_AREA_CODE_NM: "경기",
      HSSPLY_ADRES: "경기도 부천시 원미구 상동 540-1",
      TOT_SUPLY_HSHLDCO: "1859",
      RCRIT_PBLANC_DE: "2026-07-30",
      GNRL_RNK1_CRSPAREA_RCPTDE: "2026-08-11",
      GNRL_RNK2_ETC_RCPTDE: "2026-08-13",
      PRZWNER_PRESNATN_DE: "2026-08-20",
      CNSTRCT_ENTRPS_NM: "롯데건설",
      PARCPRC_ULS_AT: "N",
      SPECLT_RDN_EARTH_AT: "N",
      HMPG_ADRES: "https://www.i-lotte.kr/",
      PBLANC_URL: "https://www.applyhome.co.kr/",
    },
    {
      PBLANC_NO: "2026000402",
      HOUSE_NM: "지방소형단지",
      SUBSCRPT_AREA_CODE_NM: "전북",
      HSSPLY_ADRES: "전북 어딘가",
      TOT_SUPLY_HSHLDCO: "80",
      RCRIT_PBLANC_DE: "2026-07-31",
      RCEPT_BGNDE: "2026-08-05",
      RCEPT_ENDDE: "2026-08-07",
      CNSTRCT_ENTRPS_NM: "무명건설",
      PARCPRC_ULS_AT: "N",
    },
    {
      PBLANC_NO: "2026000399",
      HOUSE_NM: "지난달공고단지",
      SUBSCRPT_AREA_CODE_NM: "서울",
      HSSPLY_ADRES: "서울 어딘가",
      TOT_SUPLY_HSHLDCO: "300",
      RCRIT_PBLANC_DE: "2026-06-01",
      RCEPT_BGNDE: "2026-06-10",
      RCEPT_ENDDE: "2026-06-12",
      CNSTRCT_ENTRPS_NM: "옛건설",
    },
  ],
});

export const APPLYHOME_REMNDR_JSON = JSON.stringify({
  currentCount: 1,
  totalCount: 1,
  data: [
    {
      PBLANC_NO: "2026R00077",
      HOUSE_NM: "서울무순위샘플아파트",
      SUBSCRPT_AREA_CODE_NM: "서울",
      HSSPLY_ADRES: "서울특별시 어딘가",
      TOT_SUPLY_HSHLDCO: "12",
      RCRIT_PBLANC_DE: "2026-07-30",
      SUBSCRPT_RCEPT_BGNDE: "2026-08-01",
      SUBSCRPT_RCEPT_ENDDE: "2026-08-02",
      PRZWNER_PRESNATN_DE: "2026-08-08",
      BSNS_MBY_NM: "샘플주택",
      PARCPRC_ULS_AT: "Y",
      SPECLT_RDN_EARTH_AT: "Y",
    },
  ],
});

/** 필드 이름이 통째로 바뀐 경우 — 파서가 조용히 빈 결과를 내지 않고 던져야 한다 */
export const APPLYHOME_SHAPE_CHANGED_JSON = JSON.stringify({
  data: [{ houseName: "이름이바뀐응답", area: "서울" }],
});
