/** 검수 루프 공통 타입 — 에이전트끼리 주고받는 판정 구조 */
export type Level = "error" | "warn" | "info";

/** 하나의 검수 지적 */
export interface Finding {
  reviewer: string; // 검수자(코드/에이전트) 식별
  level: Level;
  code: string; // 기계 식별용 짧은 코드
  msg: string; // 사람이 읽는 설명(수정 지시 포함)
}

export type Verdict = "pass" | "revise" | "block";

/** 카드 1장 검수 결과 */
export interface CardResult {
  file: string;
  deterministic: boolean; // 이중 렌더 해시 동일
  qaErrors: number;
  findings: Finding[];
  png?: string;
}

/** 세트(커버+표+캡션) 전체 검수 리포트 — 관제탑/워크플로가 이 JSON을 소비 */
export interface ReviewReport {
  label: string;
  verdict: Verdict;
  summary: string;
  findings: Finding[]; // 세트 레벨(캡션 등)
  cards: CardResult[];
  llm: { available: boolean; note: string; lenses?: Record<string, unknown> };
}

/** verdict 산정: error 하나라도 → block, warn만 → revise, 없음 → pass */
export function decideVerdict(findings: Finding[]): Verdict {
  if (findings.some((f) => f.level === "error")) return "block";
  if (findings.some((f) => f.level === "warn")) return "revise";
  return "pass";
}
