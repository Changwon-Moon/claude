/**
 * 관제탑 상태(TowerState) 스키마.
 * 저장소 곳곳의 산출물을 이 하나의 구조로 집계한다. UI(HTML)는 이 구조의 뷰일 뿐이다.
 * (설계: docs/CONTROL_TOWER.md §1 — 판단 기록 공통 스키마)
 */

/** 파이프라인 칸반 단계. 인덱스가 곧 stage 번호. */
export const STAGES = [
  "소재후보",
  "기획안",
  "제작중",
  "검수대기",
  "승인대기",
  "발행됨",
  "성과",
] as const;

/** 6축 rubric 라벨 (docs/AGENTS.md / RESEARCH_WORKFLOW). 수요·데이터 이중축의 5개 세부. */
export const RUBRIC_LABELS = [
  "시의성",
  "데이터",
  "저장가치",
  "관심폭",
  "우리다움",
] as const;

/** 근거 한 줄: [출처, 왜]. */
export type Evidence = [source: string, why: string];

/** 팀 판단 타임라인 항목(제작을 통과한 티켓에서 팀별 판단이 쌓임). */
export interface TimelineEntry {
  team: string; // 이모지 포함 팀 표기 (예: "🔎 리서치팀")
  tag: string; // 판단 종류 (예: "소재 발굴")
  say: string; // 사람이 읽는 한 줄
  why?: string; // 부연
  evidence?: Evidence[];
  rubric?: Rubric;
  thumb?: string; // 렌더 미리보기 (data-uri 또는 상대경로)
}

export interface Rubric {
  labels: readonly string[];
  values: number[];
  sum: number;
  max: number;
}

/** 소재 1건 = 티켓 1장. */
export interface Ticket {
  id: string;
  title: string;
  topic: string;
  tier: "T1" | "T2";
  fire: boolean; // 🔥 숫자·순위 레버 뚜렷
  fmt: string; // 포맷 (ranking-table 등)
  stage: number; // STAGES 인덱스
  rubric?: Rubric | null;
  evidence: Evidence[];
  timeline: TimelineEntry[];
  thumb?: string | null; // 승인대기·발행 티켓의 렌더 카드
  flags: string[]; // 보류 / 수정요청 / 버림
  auto?: boolean; // 무인(L3) 슬롯
  origin: "brief" | "ideas" | "decision" | "produced"; // 어느 산출물에서 왔나
  provenance: string; // 추적용 원본 경로
}

export interface TeamCard {
  slug: string;
  emoji: string;
  name: string;
  values: string; // 가치관 한 줄
  responsibility: string; // 책임 한 줄
  autonomy: string; // 자동화 수위 (R0~R3)
  logCount: number; // 학습 로그 항목 수
  path: string; // company/teams/{slug}.md
  promptPath: string; // prompts/{slug}.md
  hasPrompt: boolean;
}

export interface Principle {
  date: string;
  text: string;
}

export interface AssetGroup {
  kind: string; // logos / photos / datasets
  label: string;
  count: number;
  items: { title: string; meta?: string }[];
}

export interface TowerState {
  generatedFrom: string; // 어떤 저장소 상태 기준인지 (결정적: 콘텐츠 날짜에서 파생)
  dateLabel: string; // 상단 표시용 (예: "26.07.19(일)")
  repo: { owner: string; name: string; branch: string }; // GitHub 직접 편집 링크용
  kpi: { label: string; value: string; note: string }[];
  stages: readonly string[];
  rubricLabels: readonly string[];
  tickets: Ticket[];
  company: {
    principlesCount: number;
    principles: Record<string, Principle[]>; // 카테고리 → 원칙들
    ceoPath: string; // company/CEO.md
    teams: TeamCard[];
  };
  assets: {
    groups: AssetGroup[];
    reuseNote: string;
  };
  counts: { candidates: number; inProgress: number; awaiting: number; published: number };
  /** 이미지 풀: 썸네일 data-uri 중복 저장 방지. thumb 필드는 이 맵의 키를 담는다. */
  images: Record<string, string>;
}
