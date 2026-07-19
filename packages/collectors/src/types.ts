/**
 * 수집기 정규화 스키마 (계약).
 * 모든 소스는 이 형태로 변환해 data/raw/{date}/{source}.json 에 저장한다.
 * 편집 단계(M5+)가 이 raw 를 읽어 콘텐츠 JSON(렌더 입력)을 만든다.
 */

/** 시세/지수 한 종목의 스냅샷 */
export interface Quote {
  /** 심볼 (예: "^SPX", "KOSPI", "USD/KRW") */
  symbol: string;
  /** 표시 라벨 (예: "S&P 500", "코스피") */
  label: string;
  /** 최신 값 (지수/가격/환율) */
  value: number;
  /** 전일 대비 절대 변화 */
  changeAbs: number;
  /** 전일 대비 % */
  changePct: number;
  /** 방향 */
  dir: "up" | "down" | "flat";
  /** 기준 일자 (YYYY-MM-DD) */
  asOf: string;
}

/** 시계열 (1년 차트 등) */
export interface Series {
  symbol: string;
  label: string;
  /** 오래된 → 최신 순 [{ date, close }] */
  points: { date: string; close: number }[];
}

/** 소스 하나의 수집 결과 (raw 파일 1개) */
export interface CollectionResult {
  /** 소스 식별자 (파일명, 예: "us-market") */
  source: string;
  /** 기준 일자 */
  asOf: string;
  /** 수집 시각(ISO). raw 메타용 — 렌더에는 쓰지 않음 */
  collectedAt: string;
  /** 시세 스냅샷들 */
  quotes: Quote[];
  /** 시계열들 (선택) */
  series?: Series[];
  /** 원본 출처 표기용 */
  sourceName: string;
}

/** 방향 계산 헬퍼 */
export function direction(changeAbs: number): "up" | "down" | "flat" {
  if (changeAbs > 0) return "up";
  if (changeAbs < 0) return "down";
  return "flat";
}

/** 반올림 헬퍼 (소수 n자리) */
export function round(n: number, digits = 2): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}
