/**
 * 관제탑 상태(TowerState) 스키마.
 * 저장소 곳곳의 산출물을 이 하나의 구조로 집계한다. UI(HTML)는 이 구조의 뷰일 뿐이다.
 * (설계: docs/archive/CONTROL_TOWER.md §1 — 판단 기록 공통 스키마. 2026-08-30 사료로 이동)
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

/** 6축 rubric 라벨 (정본: docs/RESEARCH_WORKFLOW.md §3-2). 수요·데이터 이중축의 5개 세부. */
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
  /** ⚠️ **누가 무엇을 봤나** (2026-08-31 신설).
   *  verdict 한 단어만으로는 오너가 무엇을 고쳐야 할지 모른다 —
   *  "REVISE · warn 7" 을 보고 세션이 7건을 하나씩 풀어 설명해야 했다.
   *  팀별로 묶어 보여주면 "디자인은 넘기고 캡션은 고친다"를 그 자리에서 판단한다. */
  teams?: { team: string; level: string; msgs: string[] }[];
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
  /** 발행 세트 라벨(sets.json) — 원본 내려받기 링크(download/{label}-{n}.jpg)를 만들 때 씀 */
  setLabel?: string;
  /** sets.json 의 제작 상태 — "시안"이면 결재 화면에서 🗑 로 내릴 수 있다(2026-08-12) */
  setState?: string;
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
  /**
   * 분류 = **발행 주기**다(주제가 아니다). daily|weekly|monthly|quarter|yearly|hot|once|todo.
   * 2026-07-27 오너 지시로 주제별 → 주기별로 재편했다. 오너가 소재 보드에서 묻는 질문이
   * "이건 무슨 분야지?"가 아니라 "이건 언제 또 내야 하지?"였기 때문이다.
   */
  cat: string;
  /** 주제 — 보관함 폴더링에 쓴다(부동산·증시·경제·돈·연봉·교통·생활·생활·통계). */
  topic?: string;
  /**
   * 데이터가 스스로 갱신되는가.
   *  auto   = 수집기가 이미 돌고 있다 → 관제탑 [🔁 다시 제작] 버튼만으로 최신판이 나온다
   *  manual = 자료를 사람(작업 세션)이 다시 넣어야 한다 → 정기물로 잡아도 버튼만으론 안 된다
   */
  feed?: "auto" | "manual";
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
  /** 미승인 | 발행 대기 | 발행됨 — **발행** 상태다 */
  state: string;
  /** sets.json 의 **제작** 상태(시안 · 오너 확정 · 발행 승인 · 발행 보류…).
   *  위 `state`(발행 상태)와 뜻이 다르다 — "그림이 됐나"와 "올렸나"를 섞지 않는다.
   *  관제탑은 이 값으로 시안을 가려내 🗑 삭제 버튼을 붙인다(2026-08-12). */
  setState?: string;
  verdict: string;
  reviewSummary?: string;
  /** 캡션 전문 — 보관함에서 바로 읽고 복사한다 */
  caption?: string;
  captionChars: number;
  files: { content: string[]; png: string[]; caption: string; review: string };
  /** 저장소에 없는(매번 다시 그리는) 산출물 경로 — 링크가 아니라 정보로 보여준다 */
  rebuilt?: { content: string[]; png: string[] };
  /** 대표 장 썸네일(이미지 풀 키) — buildState 가 채운다 */
  thumb?: string | null;
  /** 카드 전 장 이미지(이미지 풀 키) — 보관함에서 실물을 본다.
   *  ⚠️ 위의 `pages`(숫자=렌더 장수)와 다른 것이라 이름을 나눴다. */
  shots?: string[];
}
export interface ArchiveFolder {
  topic: string;
  count: number;
  items: ArchiveWork[];
}

/** 발행 후 실제 성과 한 줄 (data/performance.md 표) */
export interface PerfRow {
  date: string;
  card: string;
  reach: string;
  saved: string;
  likes: string;
  comments: string;
  memo: string;
}

/**
 * 요청 대장 한 줄 (data/requests.json).
 *
 * 오너가 관제탑에서 시킨 일은 전부 여기 남는다. 화면은 이걸 읽어
 * **누가 · 언제** 처리하는지를 말한다 — "대기 중"이라고만 쓰지 않는다.
 * (2026-07-26 오너 질문: "언제까지 기다려야 해?")
 */
export interface RequestRow {
  id: string;
  at: string; // 사람이 읽는 접수일 (예: "26.07.26(일)")
  ts: string; // UTC ISO — 경과 시간 계산용
  kind: string; // 자료 조사 | 수정 지시 | 소재 등록 | 작업 지시
  what: string; // 오너가 적은 말 그대로
  about?: string; // 대상 티켓 제목
  /** digest = 수집이 자동으로 돈다 / order = 작업지시서가 자동 생성된다 / none = 사람이 해야 한다 */
  auto: string;
  run?: string; // 자동 실행을 건 Actions 주소
  done: boolean;
  doneAt?: string;
  result?: string; // 무엇이 생겼는지 (사실만)
  order?: string; // 생성된 작업지시서 경로
}

/** 완성본 저장소 한 건 = **실제로 인스타에 올라간** 게시물 하나 (published/index.json) */
export interface PublishedPost {
  /** published/ 아래 폴더 이름 — `{발행일}-{label}` */
  dir: string;
  label: string;
  title: string;
  /** 오너가 올린 날 (YYYY-MM-DD) */
  publishedAt: string;
  pages: number;
  captionChars: number;
  /** 발행 시점의 자동검수 판정 */
  verdict: string;
  /**
   * 오너가 [✅ 인스타에 올렸습니다]를 눌러 만들어진 기록인가.
   * false = 이전 세션이 **업로드용으로 만들어만 둔** 옛 꾸러미 — 실제 발행 여부는 오너만 안다.
   * 이 둘을 섞어 세면 또 거짓 보고가 된다.
   */
  confirmed: boolean;
}

export interface IdeaCat {
  key: string;
  label: string;
  /** 이 주기가 무슨 뜻인지 한 줄 — 보드 그룹 머리에 그대로 뜬다 */
  note?: string;
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
  /** 배관 계기판 — `scripts/collect-actions-health.mjs` 가 배포 때 구워 둔 실행 이력.
   *  토큰이 없는 환경에서는 null 이고, 그때 화면은 이 칸을 아예 안 그린다.
   *  ⚠️ 비율이 아니라 **날짜별 점**을 담는다 — 평균은 "언제부터 아픈지"를 지운다
   *     (2026-08-31: 실행률 53% 하나가 08-26 까지 멀쩡했던 사실을 감추고 있었다). */
  health: {
    generatedAt: string;
    windowDays: number;
    scheduled: {
      file: string; name: string; cron: string; cronChangedOn: string | null;
      dueKst: string | null;
      dots: { day: string; state: "ontime" | "ok" | "late" | "fail" | "none";
              at: string | null; delay: number | null }[];
      medianDelay: number | null; maxDelay: number | null;
      /** ⚠️ 실행 ≠ 성공. lastRun 은 돌긴 한 날, lastOk 는 **성공한** 날이다 —
       *  인구 수집이 "22일 전"으로 떴는데 그날 실패했고 성공은 27일 전이었다(2026-08-31). */
      lastRun: string | null; lastOk: string | null; okDaysAgo: number | null;
    }[];
    manual: { file: string; name: string; lastRun: string | null; daysAgo: number | null;
              lastOk: string | null; okDaysAgo: number | null;
              fails30: number; runs30: number }[];
  } | null;
  /** 소재 보드 — 관제탑 '소재' 탭에서 마이닝과 한 화면으로 통합된다. */
  ideas: { path: string; cats: IdeaCat[]; items: Idea[] };
  /** 최근 오너가 소재를 지우며 남긴 사유 — 다음 발굴에 "피할 것"으로 실린다. */
  recentDrops: string[];
  /** 보관함 — 완성 작업물을 주제별로 묶은 색인 (data/archive/index.json) */
  archive: ArchiveFolder[];
  /** 완성본 저장소 — 실제로 발행된 게시물 (published/index.json). 발행 이력의 사실. */
  published: PublishedPost[];
  /** 성과 — 발행 후 도달·저장 수 (data/performance.md) */
  perf: { rows: PerfRow[]; path: string };
  /** 요청 대장 — 오너가 시킨 일의 접수·담당·처리 상태 (data/requests.json) */
  requests: RequestRow[];
  /** 기계 재생산이 가능한 세트 라벨들(builders.json) — 관제탑 [제작 실행] 버튼의 근거 */
  builders: string[];
}
