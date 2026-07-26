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

/** 자동 검수 결과 요약 — 발행 승인 화면에서 "기계가 뭘 확인했는지"를 보여준다. */
export interface ReviewInfo {
  verdict: string; // pass | revise | block
  summary: string;
  errors: number;
  warns: number;
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
  /** 캐러셀 전 장(이미지 풀 키). 발행 승인 시 실물을 다 넘겨본다. */
  pages?: string[];
  /** 업로드 캡션 전문 (data/review/captions/{slug}.txt) */
  caption?: string;
  /** 자동 검수 리포트 요약 (data/review/{slug}.json) */
  review?: ReviewInfo | null;
  /** 소재에서 승격된 티켓의 원본 소재 id — 관제탑이 되쓸 때 씀 */
  ideaId?: string;
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

/** 소재(아이디어) 1건. research/ideas.json 이 단일 원천이며 관제탑이 직접 되쓴다. */
export interface Idea {
  id: string;
  cat: string;
  title: string;
  why: string;
  source: string;
  /** 오너 결정: approve | hold | reject | "" (미결) */
  state: string;
  /** "done" = 이미 카드로 제작됨 */
  status: string;
  /**
   * 파이프라인 위치. 없거나 0이면 아직 소재 풀에만 있다.
   * 1 이상이면 STAGES 인덱스로 파이프라인 칸반에 티켓으로 뜬다.
   * (오너가 "이 소재 진행"을 누르면 1=기획안으로 올라간다)
   */
  stage?: number;
  /**
   * 반려·보류 이유. 회사의 학습 신호 — 다음 소재 발굴이 이걸 읽고 취향을 반영한다.
   * (CEO.md §C: 오너가 같은 말을 두 번 하게 하지 않는다)
   */
  reason?: string;
  /** 마지막 결정 시점 라벨 (예: "26.07.26(일)") */
  at?: string;
}

/** 보관함 한 칸 = 주제 하나. 안에 완성 작업물이 최근 순으로 들어간다. */
export interface ArchiveWork {
  label: string;
  title: string;
  topic: string;
  date: string;
  cards: number;
  pages: number;
  /** 미승인 | 발행 대기 | 발행됨 */
  state: string;
  verdict: string;
  reviewSummary?: string;
  /** 캡션 전문 — 보관함에서 바로 읽고 복사한다 */
  caption?: string;
  captionChars: number;
  files: { content: string[]; png: string[]; caption: string; review: string };
  /** 대표 장 썸네일(이미지 풀 키) — buildState 가 채운다 */
  thumb?: string | null;
}
export interface ArchiveFolder {
  topic: string;
  count: number;
  items: ArchiveWork[];
}

export interface IdeaCat {
  key: string;
  label: string;
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
  /** 컨텐츠 마이닝 설정 — 주제 비중(합 100 지향). 마이닝 요청 시 이 비중을 실어 보낸다. */
  mining: { weights: { label: string; pct: number }[] };
  /** 소재 보드 — 관제탑 '소재' 탭에서 마이닝과 한 화면으로 통합된다. */
  ideas: { path: string; cats: IdeaCat[]; items: Idea[] };
  /** 최근 오너가 소재를 지우며 남긴 사유 — 다음 발굴에 "피할 것"으로 실린다. */
  recentDrops: string[];
  /** 보관함 — 완성 작업물을 주제별로 묶은 색인 (data/archive/index.json) */
  archive: ArchiveFolder[];
}
