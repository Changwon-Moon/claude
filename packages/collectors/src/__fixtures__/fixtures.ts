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
