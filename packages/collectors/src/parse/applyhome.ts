/**
 * 청약홈(한국부동산원) 분양정보 파서 — 순수 함수만. 네트워크 없음 → selftest 로 검증한다.
 *
 * ── 왜 파서를 따로 두나
 * 이 저장소의 규칙은 "수치는 코드가 뽑는다"다. 청약홈 응답은 필드 이름이 길고(대문자 스네이크)
 * 오퍼레이션마다 조금씩 다르다. 그 차이를 **여기 한 곳에서만** 흡수하고, 바깥에는
 * 우리 이름으로 정규화한 객체만 내보낸다.
 *
 * ── 필드 이름이 바뀌면 조용히 비는 대신 던진다
 * 2026-07-31 에 이 회사는 "키가 없으면 스크립트가 조용히 건너뛰어 몇 주간 아무도 몰랐던" 사고를
 * 겪었다. 같은 실수를 데이터 층에서 반복하지 않는다 — 필수 필드를 못 찾으면 `normalize` 가
 * **던진다.** 빈 배열을 반환하면 "오늘은 공고가 없었다"와 구분되지 않는다.
 */

/** 청약홈 원본 레코드(키 이름을 우리가 통제하지 못한다) */
export type RawRow = Record<string, unknown>;

/** odcloud 공통 응답 봉투 */
export type Envelope = {
  currentCount?: number;
  matchCount?: number;
  page?: number;
  perPage?: number;
  totalCount?: number;
  data?: RawRow[];
};

export type Kind = "apt" | "remndr";

/** 우리 이름으로 정규화한 공고 한 건 */
export type Notice = {
  kind: Kind;
  /** 공고번호 — 같은 공고를 두 번 등록하지 않기 위한 열쇠 */
  pblancNo: string;
  name: string;
  /** 청약홈의 공급지역명(예: 서울, 경기, 인천, 부산…) */
  areaName: string;
  address: string;
  /** 총 공급 세대수. 못 읽으면 null — 0 으로 채우지 않는다(0 은 '없다'는 뜻이라 거짓말이 된다) */
  supply: number | null;
  /** 모집공고일 YYYY-MM-DD */
  noticeDate: string | null;
  /** 접수 시작·종료 YYYY-MM-DD */
  receiptFrom: string | null;
  receiptTo: string | null;
  /** 당첨자 발표 */
  announceDate: string | null;
  builder: string | null;
  /** 분양가상한제 적용 여부 */
  priceCap: boolean;
  /** 투기과열지구 */
  speculative: boolean;
  homepage: string | null;
  noticeUrl: string | null;
  /** 블록별로 쪼개진 공고를 합쳤을 때 몇 건을 합쳤나(합치지 않았으면 없음) */
  blocks?: number;
  blockNames?: string[];
};

/* ── 필드 별칭 ──
 * 오퍼레이션마다 접수일 필드 이름이 다르다(APT 는 GNRL_RNK1_*, 무순위는 SUBSCRPT_RCEPT_*).
 * 후보를 나열해 두고 **처음 발견되는 것**을 쓴다. 하나도 없으면 null 이고, 필수 항목이면 던진다. */
const ALIAS = {
  pblancNo: ["PBLANC_NO", "HOUSE_MANAGE_NO"],
  name: ["HOUSE_NM"],
  areaName: ["SUBSCRPT_AREA_CODE_NM"],
  address: ["HSSPLY_ADRES"],
  supply: ["TOT_SUPLY_HSHLDCO"],
  noticeDate: ["RCRIT_PBLANC_DE"],
  receiptFrom: ["SUBSCRPT_RCEPT_BGNDE", "GNRL_RNK1_CRSPAREA_RCPTDE", "RCEPT_BGNDE", "SPSPLY_RCEPT_BGNDE"],
  receiptTo: ["SUBSCRPT_RCEPT_ENDDE", "GNRL_RNK2_ETC_RCPTDE", "RCEPT_ENDDE", "GNRL_RNK1_ETC_RCPTDE"],
  announceDate: ["PRZWNER_PRESNATN_DE"],
  builder: ["CNSTRCT_ENTRPS_NM", "BSNS_MBY_NM"],
  priceCap: ["PARCPRC_ULS_AT"],
  speculative: ["SPECLT_RDN_EARTH_AT"],
  homepage: ["HMPG_ADRES"],
  noticeUrl: ["PBLANC_URL"],
} as const;

function pick(row: RawRow, keys: readonly string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s && s !== "-" && s.toLowerCase() !== "null") return s;
  }
  return null;
}

/** "2026-08-10" · "20260810" · "2026.08.10" 을 모두 YYYY-MM-DD 로. 못 읽으면 null. */
export function toIsoDate(v: string | null): string | null {
  if (!v) return null;
  const digits = v.replace(/[^0-9]/g, "");
  if (digits.length !== 8) return null;
  const [y, m, d] = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)];
  const yy = Number(y);
  if (yy < 2000 || yy > 2100) return null;
  if (Number(m) < 1 || Number(m) > 12 || Number(d) < 1 || Number(d) > 31) return null;
  return `${y}-${m}-${d}`;
}

/** "1,859" · "1859세대" → 1859. 숫자를 못 찾으면 null(0 이 아니다). */
export function toCount(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

const isY = (v: string | null) => v === "Y" || v === "y";

/**
 * 응답 봉투 → 우리 이름의 공고 목록.
 * 첫 레코드에서 **이름·공고번호를 못 찾으면 던진다** — 필드 이름이 바뀐 것이므로
 * 빈 결과로 넘기면 "오늘은 공고가 없었다"로 오독된다.
 */
export function normalize(env: Envelope, kind: Kind): Notice[] {
  const rows = Array.isArray(env?.data) ? env.data : null;
  if (!rows) throw new Error(`청약홈 응답에 data 배열이 없다(kind=${kind}) — 키 오류 또는 스펙 변경`);
  if (rows.length === 0) return [];

  const probe = rows[0];
  if (!pick(probe, ALIAS.name) || !pick(probe, ALIAS.pblancNo)) {
    throw new Error(
      `청약홈 필드 이름이 예상과 다르다(kind=${kind}). 받은 키: ${Object.keys(probe).slice(0, 15).join(", ")}`,
    );
  }

  return rows.map((r) => ({
    kind,
    pblancNo: pick(r, ALIAS.pblancNo)!,
    name: pick(r, ALIAS.name)!,
    areaName: pick(r, ALIAS.areaName) ?? "",
    address: pick(r, ALIAS.address) ?? "",
    supply: toCount(pick(r, ALIAS.supply)),
    noticeDate: toIsoDate(pick(r, ALIAS.noticeDate)),
    receiptFrom: toIsoDate(pick(r, ALIAS.receiptFrom)),
    receiptTo: toIsoDate(pick(r, ALIAS.receiptTo)),
    announceDate: toIsoDate(pick(r, ALIAS.announceDate)),
    builder: pick(r, ALIAS.builder),
    priceCap: isY(pick(r, ALIAS.priceCap)),
    speculative: isY(pick(r, ALIAS.speculative)),
    homepage: pick(r, ALIAS.homepage),
    noticeUrl: pick(r, ALIAS.noticeUrl),
  }));
}

/** 날짜 차이(일). a 기준으로 b 까지 며칠 남았나. 둘 중 하나라도 없으면 null. */
export function daysBetween(fromIso: string, toIso: string | null): number | null {
  if (!toIso) return null;
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}

/**
 * 최근 것만 남긴다 — 모집공고일이 `withinDays` 이내이거나, 접수가 아직 안 끝난 건.
 * 지난 공고를 매일 다시 소재로 올리면 보드가 영구 알림이 된다(CEO 07-26).
 */
export function recent(list: Notice[], today: string, withinDays = 7): Notice[] {
  return list.filter((x) => {
    /* 공고가 뜬 지 얼마 안 됐거나(fresh), 접수가 아직 열려 있으면(open) 남긴다.
       음수 age 는 '아직 오지 않은 공고'라 fresh 가 아니다 — 미래 공고를 오늘 소재로 올리지 않는다. */
    const age = x.noticeDate ? daysBetween(x.noticeDate, today) : null;
    const fresh = age !== null && age >= 0 && age <= withinDays;
    const left = x.receiptTo ? daysBetween(today, x.receiptTo) : null;
    const open = left !== null && left >= 0;
    return fresh || open;
  });
}

/* ────────────────────────────────────────────────────────────────────
 * 소재 점수 — 규칙은 전부 코드다. LLM 이 고르지 않는다.
 *
 * 오너 선택(2026-08-01): **전국 수집 + 수도권 가점.**
 * 지방을 버리지 않는 이유는 범어역 파크드림 디아르(대구 수성) 101.48대 1 같은 건을
 * 놓치지 않기 위해서다 — 세대수·브랜드가 크면 지방도 올라온다.
 * ──────────────────────────────────────────────────────────────────── */

/** 수도권 = 서울·경기·인천. 청약홈 공급지역명이 이 문자열로 온다. */
const CAPITAL = ["서울", "경기", "인천"];
const METRO = ["부산", "대구", "광주", "대전", "울산", "세종"];

/** 로고를 이미 갖고 있는 브랜드 — 카드로 만들기 쉬운 쪽에 가점. 자산이 곧 생산성이다. */
export const KNOWN_BRANDS = [
  "래미안", "자이", "힐스테이트", "푸르지오", "더샵", "e편한세상", "롯데캐슬",
  "SK뷰", "아크로", "디에이치", "르엘", "오티에르", "써밋", "드파인", "아이파크",
  "위브", "포레나", "하늘채", "센트레빌", "한라비발디", "우미린", "제일풍경채",
];

export type Scored = Notice & { score: number; reasons: string[] };

/**
 * 점수 = 지역 + 규모 + 성격 + 임박도 + 브랜드 + 규제.
 * 이유(reasons)를 함께 남긴다 — 왜 이게 위로 올라왔는지 오너가 물으면 답이 있어야 한다.
 */
export function score(x: Notice, today: string): Scored {
  let s = 0;
  const why: string[] = [];

  // ① 지역 — 수도권 가점(오너 선택)
  if (CAPITAL.some((k) => x.areaName.includes(k))) {
    const seoul = x.areaName.includes("서울");
    s += seoul ? 30 : 18;
    why.push(seoul ? "서울" : "수도권");
  } else if (METRO.some((k) => x.areaName.includes(k))) {
    s += 10;
    why.push("광역시");
  } else {
    s += 4;
  }

  // ② 규모 — 무순위는 애초에 물량이 작아 자를 자를 따로 쓴다
  const n = x.supply ?? 0;
  if (x.kind === "remndr") {
    if (n >= 100) { s += 20; why.push(`${n}가구`); }
    else if (n >= 30) { s += 14; why.push(`${n}가구`); }
    else if (n >= 10) { s += 8; }
    else if (n >= 1) { s += 4; }
  } else {
    if (n >= 1000) { s += 25; why.push(`${n.toLocaleString("ko-KR")}가구 대단지`); }
    else if (n >= 500) { s += 18; why.push(`${n.toLocaleString("ko-KR")}가구`); }
    else if (n >= 300) { s += 12; }
    else if (n >= 100) { s += 6; }
    else { s += 2; }
  }

  // ③ 성격 — 무순위(줍줍)는 그 자체가 후킹이다
  if (x.kind === "remndr") { s += 25; why.push("무순위"); }

  // ④ 임박도 — 접수 마감이 코앞이면 '오늘 낼 이유'가 생긴다
  const left = daysBetween(today, x.receiptTo);
  if (left !== null && left >= 0) {
    if (left <= 2) { s += 15; why.push(left === 0 ? "오늘 마감" : `D-${left}`); }
    else if (left <= 6) { s += 8; why.push(`D-${left}`); }
  }

  // ⑤ 브랜드 — 로고를 가진 브랜드면 카드가 바로 나온다
  const hay = `${x.name} ${x.builder ?? ""}`;
  const brand = KNOWN_BRANDS.find((b) => hay.includes(b));
  if (brand) { s += 10; why.push(brand); }

  // ⑥ 규제 — 상한제는 시세차익 서사가 붙는다
  if (x.blocks && x.blocks > 1) why.push(`${x.blocks}개 블록 합계`);
  if (x.priceCap) { s += 12; why.push("분양가상한제"); }
  if (x.speculative) { s += 5; why.push("투기과열지구"); }

  return { ...x, score: s, reasons: why };
}

/** 점수 높은 순. 동점이면 접수 마감이 이른 순(급한 것이 먼저). */
export function rank(list: Notice[], today: string): Scored[] {
  return list
    .map((x) => score(x, today))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const la = daysBetween(today, a.receiptTo) ?? 9999;
      const lb = daysBetween(today, b.receiptTo) ?? 9999;
      return la - lb;
    });
}

/* ────────────────────────────────────────────────────────────────────
 * 블록별로 쪼개진 공고 합치기 (2026-08-02 첫 실제 실행에서 드러난 문제)
 *
 * 첫날 결과 상위 5칸을 「더샵 송도그란테르 G5-1·G5-3·G5-4·G5-5·G5-11블록」이 통째로 차지했다.
 * 청약홈은 같은 단지라도 **블록마다 공고를 따로** 낸다. 그대로 두면 소재 보드가
 * 한 단지로 도배되고, 오너는 다섯 줄을 보고도 "송도에 줍줍 하나 떴다"밖에 못 읽는다.
 * 한 화면은 한 가지 일만 맡는다(CEO 07-26).
 *
 * 합치는 조건은 좁게 잡는다 — **같은 종류·같은 지역·같은 접수 마감일**이고 이름이
 * 블록 표기만 다를 때. 회차가 다르면 접수일이 달라 자동으로 안 합쳐진다.
 * ──────────────────────────────────────────────────────────────────── */

/** 이름에서 블록 표기를 걷어낸다. "G5-11블록"·"(A59BL)"·"A5블록" 등.
 *  ⚠️ "안산고잔2차"의 '2차'는 블록이 아니라 단지 이름의 일부다 — 건드리지 않는다. */
export function baseName(name: string): string {
  return name
    .replace(/[(（]?\s*[A-Za-z]{0,3}\d+(?:-\d+)?\s*(?:블록|블럭|BL)\s*[)）]?/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*,\s*\)/g, ")")
    .trim();
}

/**
 * 블록 공고들을 한 줄로 합친다. 2건 이상 모일 때만 합치고, 혼자면 원래 이름을 그대로 둔다
 * (혼자인데 이름에서 블록만 지우면 "A5블록"이라는 사실 정보를 잃는다).
 * 합친 줄의 세대수는 **합계**다 — 45+36+35+12+22 = 150가구가 진짜 크기다.
 */
export function mergeBlocks(list: Notice[]): Notice[] {
  const groups = new Map<string, Notice[]>();
  for (const x of list) {
    const key = `${x.kind}|${baseName(x.name)}|${x.areaName}|${x.receiptTo ?? ""}`;
    const g = groups.get(key);
    if (g) g.push(x);
    else groups.set(key, [x]);
  }

  const out: Notice[] = [];
  for (const g of groups.values()) {
    if (g.length === 1) { out.push(g[0]); continue; }
    const supplies = g.map((x) => x.supply).filter((v): v is number => v !== null);
    const first = [...g].sort((a, b) => a.pblancNo.localeCompare(b.pblancNo))[0];
    out.push({
      ...first,
      name: baseName(first.name),
      supply: supplies.length ? supplies.reduce((a, b) => a + b, 0) : null,
      blocks: g.length,
      blockNames: g.map((x) => x.name),
    });
  }
  return out;
}

/** 공고번호로 중복 제거 — 같은 단지가 여러 오퍼레이션에 걸쳐 나올 수 있다. */
export function dedupe(list: Notice[]): Notice[] {
  const seen = new Set<string>();
  const out: Notice[] = [];
  for (const x of list) {
    const key = `${x.kind}:${x.pblancNo}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(x);
  }
  return out;
}
