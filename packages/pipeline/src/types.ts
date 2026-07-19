/**
 * 파이프라인 입력(raw 수집 결과)과 출력(콘텐츠 JSON) 타입.
 * 입력 형태는 @wirit/collectors 의 CollectionResult 와 동일 계약(결합을 피해 여기 재정의).
 */

export interface RawQuote {
  symbol: string;
  label: string;
  value: number;
  changeAbs: number;
  changePct: number;
  dir: "up" | "down" | "flat";
  asOf: string;
}

export interface RawSeries {
  symbol: string;
  label: string;
  points: { date: string; close: number }[];
}

export interface RawCollection {
  source: string;
  asOf: string;
  quotes: RawQuote[];
  series?: RawSeries[];
  sourceName: string;
}

/** market-daily 템플릿이 받는 콘텐츠 JSON (렌더 입력) */
export interface MarketContent {
  template: "market-daily@1";
  date: string;
  flag: string;
  title: string;
  indices: {
    label: string;
    value: string;
    delta: string;
    dir: "up" | "down" | "flat";
  }[];
  featured?: {
    name: string;
    logoText?: string;
    logoColor?: string;
    sublabel?: string;
    price: string;
    delta: string;
    dir: "up" | "down" | "flat";
    chart: number[];
    chartFrom: string;
    chartTo: string;
  };
  source: { name: string; asOf: string };
}
