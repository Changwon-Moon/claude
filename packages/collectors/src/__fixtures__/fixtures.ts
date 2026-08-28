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

// 국토부 아파트 전월세 응답 모사 — 전세(월세0)·월세(월세>0), 신규/갱신, 영문·한글 태그 혼용.
// 전세 3(신규2·갱신1) / 월세 3(신규1·갱신1·구분없음1) → 총6·월세비중 50%·신규월세비중 33.3%·typed 5.
export const MOLIT_RENT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<response><header><resultCode>00</resultCode><resultMsg>NORMAL SERVICE.</resultMsg></header>
<body><items>
  <item><aptNm>전세신규A</aptNm><umdNm>대치동</umdNm><deposit>50000</deposit><monthlyRent>0</monthlyRent><excluUseAr>84.9</excluUseAr><floor>5</floor><buildYear>2010</buildYear><dealYear>2026</dealYear><dealMonth>6</dealMonth><dealDay>3</dealDay><contractType>신규</contractType><useRRRight></useRRRight><sggCd>11680</sggCd></item>
  <item><아파트>전세신규B</아파트><법정동>도곡동</법정동><보증금액>40,000</보증금액><월세금액>0</월세금액><전용면적>59.9</전용면적><층>9</층><건축년도>2005</건축년도><년>2026</년><월>6</월><일>7</일><계약구분>신규</계약구분><지역코드>11680</지역코드></item>
  <item><aptNm>전세갱신C</aptNm><umdNm>역삼동</umdNm><deposit>60000</deposit><monthlyRent>0</monthlyRent><excluUseAr>114.0</excluUseAr><floor>12</floor><buildYear>2018</buildYear><dealYear>2026</dealYear><dealMonth>6</dealMonth><dealDay>10</dealDay><contractType>갱신</contractType><useRRRight>사용</useRRRight><sggCd>11680</sggCd></item>
  <item><aptNm>월세신규D</aptNm><umdNm>대치동</umdNm><deposit>20000</deposit><monthlyRent>80</monthlyRent><excluUseAr>84.9</excluUseAr><floor>3</floor><buildYear>2010</buildYear><dealYear>2026</dealYear><dealMonth>6</dealMonth><dealDay>2</dealDay><contractType>신규</contractType><sggCd>11680</sggCd></item>
  <item><아파트>월세갱신E</아파트><법정동>청담동</법정동><보증금액>10,000</보증금액><월세금액>120</월세금액><전용면적>72.0</전용면적><층>6</층><건축년도>2012</건축년도><년>2026</년><월>6</월><일>5</일><계약구분>갱신</계약구분><지역코드>11680</지역코드></item>
  <item><aptNm>월세무구분F</aptNm><umdNm>삼성동</umdNm><deposit>5000</deposit><monthlyRent>60</monthlyRent><excluUseAr>45.0</excluUseAr><floor>2</floor><buildYear>2001</buildYear><dealYear>2026</dealYear><dealMonth>6</dealMonth><dealDay>1</dealDay><contractType></contractType><sggCd>11680</sggCd></item>
</items>
<totalCount>6</totalCount></body></response>`;

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
      SPSPLY_RCEPT_BGNDE: "2026-08-10",
      MVN_PREARNGE_YM: "203101",
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

/* ── KOSIS 주민등록 인구 (2026-08-03 추가) ──
 * ⚠️ 이것은 **표본**이다. 실제 KOSIS 응답을 세션에서 한 번도 못 봤다(외부망 차단).
 *    필드 이름은 KOSIS OpenAPI 공개 문서 기준이고, 첫 실제 실행에서 맞는지 판가름 난다.
 *    그래서 파서가 필드를 못 찾으면 던지도록 해 두었다 — 조용히 비는 것이 가장 위험하다.
 *
 * 확인 대상 두 가지가 이 표본에 다 들어 있다:
 *   ① 전국('00')·시도(2자리)가 시군구(5자리)와 **한 응답에 섞여 온다** → 5자리만 남는지
 *   ② 인구가 쉼표 섞인 문자열로 온다 → 정수로 읽는지
 */
export const KOSIS_POP_JSON = JSON.stringify([
  { C1: "00", C1_NM: "전국", PRD_DE: "202605", DT: "51,203,441", ITM_ID: "T20", ITM_NM: "총인구수", UNIT_NM: "명", TBL_NM: "행정구역(시군구)별, 성별 인구수" },
  { C1: "11", C1_NM: "서울특별시", PRD_DE: "202605", DT: "9,331,205", ITM_ID: "T20", ITM_NM: "총인구수", UNIT_NM: "명" },
  { C1: "11010", C1_NM: "종로구", PRD_DE: "202605", DT: "141,102", ITM_ID: "T20", ITM_NM: "총인구수", UNIT_NM: "명" },
  { C1: "11010", C1_NM: "종로구", PRD_DE: "202606", DT: "140,880", ITM_ID: "T20", ITM_NM: "총인구수", UNIT_NM: "명" },
  { C1: "31241", C1_NM: "화성시만세구", PRD_DE: "202605", DT: "299,410", ITM_ID: "T20", ITM_NM: "총인구수", UNIT_NM: "명" },
  { C1: "31241", C1_NM: "화성시만세구", PRD_DE: "202606", DT: "301,255", ITM_ID: "T20", ITM_NM: "총인구수", UNIT_NM: "명" },
  { C1: "1101053", C1_NM: "사직동", PRD_DE: "202606", DT: "9,412", ITM_ID: "T20", ITM_NM: "총인구수", UNIT_NM: "명" },
]);

/** 필드 이름이 바뀐 표본 — 파서가 **던져야** 한다(빈 결과로 넘어가면 안 된다) */
export const KOSIS_POP_SHAPE_CHANGED_JSON = JSON.stringify([
  { REGION_CD: "11010", REGION_NM: "종로구", PERIOD: "202606", VALUE: "140,880" },
]);

/* ── 국토부 분양권전매 실거래(getRTMSDataSvcSilvTrade) 응답 ────────────────────
 * ✅ **2026-08-28 실측 응답으로 교체했다.** 처음엔 매매 API 에서 유추한 표본이었고,
 * 그 유추는 틀렸다 — `dealTypeNm`·`구분` 같은 태그는 응답에 아예 없었고(평택 171건 전부
 * '미상'으로 파싱됐다), 분양권/입주권을 담는 칸은 **`ownershipGbn`** 이었다.
 * 항목 이름은 평택시 202607 실제 응답을 그대로 따랐다:
 *   aptNm · buyerGbn · cdealDay · cdealType · dealAmount · dealDay · dealMonth · dealYear ·
 *   dealingGbn · estateAgentSggNm · excluUseAr · floor · jibun · ownershipGbn ·
 *   sggCd · sggNm · slerGbn · umdNm
 * 한글 태그 item 은 **일부러 남겨 뒀다** — 국토부는 판올림마다 한/영을 오간다(매매에서 겪었다).
 * 마지막 item 의 `ownershipGbn` 공백은 실측에서 실제로 본 모양이다: 빈칸은 '미상'이고
 * 미상은 카드에 못 쓴다. */
export const MOLIT_SILV_XML = `<?xml version="1.0" encoding="UTF-8"?>
<response><header><resultCode>00</resultCode><resultMsg>NORMAL SERVICE.</resultMsg></header>
<body><items>
  <item><aptNm>가상센트럴파크</aptNm><buyerGbn>개인</buyerGbn><cdealDay> </cdealDay><cdealType> </cdealType><dealAmount>130,000</dealAmount><dealDay>4</dealDay><dealMonth>7</dealMonth><dealYear>2026</dealYear><dealingGbn>중개거래</dealingGbn><excluUseAr>84.97</excluUseAr><floor>18</floor><jibun>1500</jibun><ownershipGbn>분양권</ownershipGbn><sggCd>11440</sggCd><sggNm>마포구</sggNm><slerGbn>개인</slerGbn><umdNm>상암동</umdNm></item>
  <item><aptNm>가상센트럴파크</aptNm><buyerGbn>개인</buyerGbn><dealAmount>128,000</dealAmount><dealDay>21</dealDay><dealMonth>6</dealMonth><dealYear>2026</dealYear><dealingGbn>중개거래</dealingGbn><excluUseAr>84.97</excluUseAr><floor>7</floor><jibun>1500</jibun><ownershipGbn>분양권</ownershipGbn><sggCd>11440</sggCd><sggNm>마포구</sggNm><slerGbn>개인</slerGbn><umdNm>상암동</umdNm></item>
  <item><단지>가상한강자이</단지><법정동>망원동</법정동><지번>200</지번><거래금액>95,500</거래금액><전용면적>59.98</전용면적><층>11</층><년>2026</년><월>7</월><일>2</일><구분>입주권</구분><지역코드>11440</지역코드></item>
  <item><aptNm>해제된분양권</aptNm><dealAmount>200,000</dealAmount><dealDay>1</dealDay><dealMonth>7</dealMonth><dealYear>2026</dealYear><excluUseAr>84.97</excluUseAr><floor>3</floor><ownershipGbn>분양권</ownershipGbn><cdealType>O</cdealType><sggCd>11440</sggCd><umdNm>합정동</umdNm></item>
  <item><aptNm>구분빈칸거래</aptNm><buyerGbn>개인</buyerGbn><dealAmount>77,000</dealAmount><dealDay>9</dealDay><dealMonth>7</dealMonth><dealYear>2026</dealYear><dealingGbn>직거래</dealingGbn><excluUseAr>49.5</excluUseAr><floor>4</floor><ownershipGbn> </ownershipGbn><sggCd>11440</sggCd><sggNm>마포구</sggNm><slerGbn>개인</slerGbn><umdNm>연남동</umdNm></item>
</items>
<totalCount>5</totalCount></body></response>`;
