/**
 * 렌더러가 다루는 데이터 계약(타입).
 * 콘텐츠 JSON의 최상위 구조는 ARCHITECTURE.md §2 를 따른다.
 */

/** 콘텐츠 JSON 최상위. 편집 에이전트(M6)의 출력이자 렌더러의 입력. */
export interface ContentDoc {
  /** 템플릿 ID + 버전. 예: "dummy-card@1", "ranking-table@1" */
  template: string;
  /** 발행 기준 날짜 (YYYY-MM-DD) */
  date?: string;
  /**
   * 캐러셀 페이지 배열. 없으면 이 문서 전체를 1장짜리 카드로 렌더한다.
   * 있으면 각 원소가 한 장(슬라이드)이 된다.
   */
  pages?: Record<string, unknown>[];
  /** 그 외 모든 템플릿별 필드 (schema.json이 검증) */
  [key: string]: unknown;
}

/** 템플릿 폴더의 config.json 구조 (선택) */
export interface TemplateConfig {
  /** 카드 폭(px). 기본 1080 */
  width?: number;
  /** 카드 높이(px). 기본 1350 (인스타 4:5) */
  height?: number;
  /** 레티나 배율. 기본 2 → 실제 출력은 width*scale × height*scale */
  scale?: number;
}

/** 로드된 템플릿 번들 */
export interface LoadedTemplate {
  /** 요청된 전체 ID (예: dummy-card@1) */
  id: string;
  /** 이름 부분 (예: dummy-card) */
  name: string;
  /** 버전 부분 (예: 1) */
  version: string;
  /** 템플릿 폴더 절대경로 */
  dir: string;
  /** template.html 원문 */
  html: string;
  /** schema.json (JSON Schema). 없으면 null */
  schema: object | null;
  /** config.json 병합 결과 (기본값 적용됨) */
  config: Required<TemplateConfig>;
}

/** 렌더 결과 */
export interface RenderResult {
  contentPath: string;
  template: string;
  /** 생성된 PNG 파일 경로들 (페이지 순서) */
  outputs: string[];
}
