/**
 * KOSIS 주민등록 인구 파서 — 순수 함수만. 네트워크 없음 → selftest 로 검증한다.
 *
 * ── 이 파일이 지는 책임
 * ① KOSIS 응답을 우리 이름으로 정규화한다(필드 이름이 바뀌면 **던진다**).
 * ② 시군구 시계열을 만든다.
 * ③ **무엇이 소재인가**를 규칙으로 정한다 — 문턱 돌파·연속 증감·증감률 상위.
 *    LLM 이 고르지 않는다. 점수는 전부 여기 `score()` 가 계산한다.
 *
 * ── 조용한 실패를 막는다
 * 2026-07-31 에 이 회사는 "키가 없으면 스크립트가 조용히 건너뛰어 몇 주간 아무도 몰랐던" 사고를
 * 겪었다. 데이터 층에서 같은 실수를 반복하지 않는다 — 필수 필드를 못 찾으면 던진다.
 * 빈 배열을 반환하면 "그 달에 인구가 없었다"와 구분되지 않는다.
 */

/** KOSIS 원본 레코드(키 이름을 우리가 통제하지 못한다) */
export type RawRow = Record<string, unknown>;

/** 한 지역·한 시점의 인구 */
export type Point = {
  /** 통계청 행정구역코드 5자리 — 지도(data/geo/korea-sgg-2026.geojson)의 code 와 같은 열쇠 */
  code: string;
  name: string;
  /** YYYY-MM */
  period: string;
  /** 인구(명) */
  value: number;
};

/** 시군구 한 곳의 시계열 */
export type Series = {
  code: string;
  name: string;
  /** 오래된 것 → 최신 순 */
  points: { period: string; value: number }[];
};

/* ── 필드 별칭 ──
 * KOSIS 는 분류 축을 C1~C8 로 준다. 우리 표는 objL1=행정구역이므로 C1 이 지역이다.
 * 다만 표에 따라 축 순서가 다를 수 있어 후보를 나열하고 **처음 발견되는 것**을 쓴다. */
const ALIAS = {
  code: ["C1"],
  name: ["C1_NM"],
  period: ["PRD_DE"],
  value: ["DT"],
} as const;

function pick(row: RawRow, keys: readonly string[]): unknown {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
  }
  return undefined;
}

/** KOSIS 의 PRD_DE 는 YYYYMM(월간) 또는 YYYY(연간)다. YYYY-MM 으로 통일한다. */
export function toPeriod(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (/^\d{6}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
  if (/^\d{4}$/.test(s)) return `${s}-12`; // 연간값은 그 해 12월로 본다
  return null;
}

/** 인구는 정수다. 쉼표·공백을 걷고, 숫자가 아니면 null(0 으로 채우지 않는다 — 0 은 거짓말이 된다). */
export function toCount(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Math.round(Number(s));
  return Number.isFinite(n) ? n : null;
}

/**
 * KOSIS 응답 → Point[].
 *
 * **시군구만 남긴다.** KOSIS 는 전국(코드 '00')·시도(2자리)·시군구(5자리)를 한 응답에 섞어 준다.
 * 5자리만 취하지 않으면 전국 인구가 시군구 하나로 들어가 지도가 통째로 틀어진다.
 */
export function normalize(payload: unknown, regionAxis: "C1" | "C2" | "C3" | "C4" = "C1"): Point[] {
  const rows: RawRow[] = Array.isArray(payload)
    ? (payload as RawRow[])
    : Array.isArray((payload as { data?: unknown })?.data)
      ? ((payload as { data: RawRow[] }).data)
      : [];

  if (!rows.length) {
    throw new Error(
      "KOSIS 응답에 행이 없다. 빈 결과와 실패는 다르다 — 표 ID·기간·인증키를 확인해야 한다.",
    );
  }

  /* ── 지역이 몇 번째 축인가 ──
     기본은 C1 이지만 표마다 다르다. 사망 표는 C1 이 **사망원인**이고 C2 가 행정구역이다.
     모르고 C1 을 지역으로 읽으면 '11=호흡기 결핵' 이 지역 코드가 되고 지도가 통째로 거짓이 된다.
     그래서 축을 표가 정하게 하고, 그 축이 응답에 없으면 **던진다.** */
  const AX = {
    code: [regionAxis],
    name: [`${regionAxis}_NM`],
    period: ALIAS.period,
    value: ALIAS.value,
  } as const;

  /* 첫 행으로 필드 이름을 확인한다. 이름이 바뀌면 여기서 멈춘다. */
  const probe = rows[0];
  for (const [our, keys] of Object.entries(AX)) {
    if (pick(probe, keys) === undefined) {
      throw new Error(
        `KOSIS 응답의 필드 이름이 바뀌었다 — '${our}'(후보: ${keys.join(", ")})를 찾을 수 없다. ` +
        `있는 필드: ${Object.keys(probe).join(", ")}`,
      );
    }
  }

  const out: Point[] = [];
  for (const r of rows) {
    const code = String(pick(r, AX.code) ?? "").trim();
    /* 시군구는 5자리. 전국('00')·시도(2자리)·읍면동(7자리 이상)은 버린다. */
    if (!/^\d{5}$/.test(code)) continue;

    const period = toPeriod(pick(r, AX.period));
    const value = toCount(pick(r, AX.value));
    const name = String(pick(r, AX.name) ?? "").trim();
    if (!period || value === null || !name) continue;

    out.push({ code, name, period, value });
  }

  if (!out.length) {
    throw new Error(
      `KOSIS 응답 ${rows.length}행 중 시군구(코드 5자리) 행이 하나도 없다. ` +
      `objL1 분류가 행정구역이 맞는지, 표 ID 가 시군구 단위인지 확인해야 한다.`,
    );
  }
  return out;
}

/** Point[] → 시군구별 시계열. 시점 오름차순으로 정렬한다. */
export function toSeries(points: Point[]): Series[] {
  const m = new Map<string, Series>();
  for (const p of points) {
    if (!m.has(p.code)) m.set(p.code, { code: p.code, name: p.name, points: [] });
    const s = m.get(p.code)!;
    /* 같은 시점이 두 번 오면(성별 축이 안 접혔을 때) 뒤엣것을 버린다 — 더하면 인구가 두 배가 된다. */
    if (s.points.some((x) => x.period === p.period)) continue;
    s.points.push({ period: p.period, value: p.value });
  }
  for (const s of m.values()) s.points.sort((a, b) => a.period.localeCompare(b.period));
  return [...m.values()].sort((a, b) => a.code.localeCompare(b.code));
}

/* ────────────────────────────────────────────────────────────────
   여기서부터 "무엇이 소재인가" — 규칙은 전부 코드다
   ──────────────────────────────────────────────────────────────── */

export type SignalKind = "milestone" | "streak" | "topmove";

export type Signal = {
  kind: SignalKind;
  code: string;
  name: string;
  /** 카드 제목 후보 — 숫자는 전부 계산값이다 */
  title: string;
  /** 왜 소재인가(관제탑 보드의 why 칸) */
  why: string;
  score: number;
  reasons: string[];
  /** 근거 수치 — 카드 빌더가 그대로 쓴다 */
  facts: Record<string, string | number>;
};

/** 인구 규모가 클수록 화제가 된다 — 강원 어느 군의 1% 와 수원의 1% 는 무게가 다르다. */
function sizeBonus(pop: number): { s: number; why?: string } {
  if (pop >= 1_000_000) return { s: 22, why: "100만 대도시" };
  if (pop >= 500_000) return { s: 16, why: "50만 이상" };
  if (pop >= 300_000) return { s: 11 };
  if (pop >= 100_000) return { s: 6 };
  return { s: 2 };
}

/** 수도권 가점 — 오너 선택(2026-08-03, 청약홈과 같은 기준). 통계청 코드 시도 앞 2자리. */
const CAPITAL = new Set(["11", "23", "31"]); // 서울·인천·경기
const METRO = new Set(["21", "22", "24", "25", "26", "29"]); // 부산·대구·광주·대전·울산·세종

function regionBonus(code: string): { s: number; why?: string } {
  const sido = code.slice(0, 2);
  if (sido === "11") return { s: 18, why: "서울" };
  if (CAPITAL.has(sido)) return { s: 12, why: "수도권" };
  if (METRO.has(sido)) return { s: 7, why: "광역시" };
  return { s: 3 };
}

/** 사람이 기억하는 선. 이걸 넘거나 깨지면 그 자체가 뉴스다. */
const MILESTONES = [50_000, 100_000, 200_000, 300_000, 500_000, 700_000, 1_000_000];

const fmt = (n: number) => n.toLocaleString("ko-KR");
/** 10만·100만 같은 선을 한국어로 */
function milestoneLabel(n: number): string {
  if (n >= 10_000 && n % 10_000 === 0) return `${n / 10_000}만`;
  return fmt(n);
}

/**
 * 문턱 돌파 — 마지막 두 시점 사이에 상징적인 선을 넘었나.
 * "화성시 100만 돌파" 는 그 한 줄로 카드가 된다.
 */
export function milestones(list: Series[]): Signal[] {
  const out: Signal[] = [];
  for (const s of list) {
    const n = s.points.length;
    if (n < 2) continue;
    const prev = s.points[n - 2];
    const cur = s.points[n - 1];
    for (const m of MILESTONES) {
      const up = prev.value < m && cur.value >= m;
      const down = prev.value >= m && cur.value < m;
      if (!up && !down) continue;
      const lab = milestoneLabel(m);
      out.push({
        kind: "milestone",
        code: s.code,
        name: s.name,
        title: up ? `${s.name}, 인구 ${lab} 돌파` : `${s.name}, 인구 ${lab} 붕괴`,
        why: `${prev.period} ${fmt(prev.value)}명 → ${cur.period} ${fmt(cur.value)}명 (${lab} 선 ${up ? "상향" : "하향"} 통과)`,
        score: 0,
        reasons: [up ? `${lab} 돌파` : `${lab} 붕괴`],
        facts: {
          milestone: m,
          direction: up ? "up" : "down",
          prevPeriod: prev.period,
          prevValue: prev.value,
          period: cur.period,
          value: cur.value,
        },
      });
    }
  }
  return out;
}

/**
 * 연속 증감 — 몇 달째 같은 방향인가. 서사가 붙는 소재다.
 * ⚠️ 값이 같은 달은 **연속을 끊는다**(늘지도 줄지도 않았으므로). 이걸 이어 세면
 *    "N개월 연속 감소"가 부풀려져 오보가 된다.
 */
export function streaks(list: Series[], minMonths = 6): Signal[] {
  const out: Signal[] = [];
  for (const s of list) {
    const p = s.points;
    if (p.length < minMonths + 1) continue;
    const dir = Math.sign(p[p.length - 1].value - p[p.length - 2].value);
    if (dir === 0) continue;

    let run = 0;
    for (let i = p.length - 1; i >= 1; i--) {
      if (Math.sign(p[i].value - p[i - 1].value) === dir) run++;
      else break;
    }
    if (run < minMonths) continue;

    const cur = p[p.length - 1];
    const from = p[p.length - 1 - run];
    const delta = cur.value - from.value;
    out.push({
      kind: "streak",
      code: s.code,
      name: s.name,
      title: `${s.name}, ${run}개월 연속 인구 ${dir > 0 ? "증가" : "감소"}`,
      why: `${from.period}~${cur.period} ${run}개월 연속 ${dir > 0 ? "증가" : "감소"} · 누적 ${delta > 0 ? "+" : ""}${fmt(delta)}명`,
      score: 0,
      reasons: [`${run}개월 연속 ${dir > 0 ? "증가" : "감소"}`],
      facts: {
        months: run,
        direction: dir > 0 ? "up" : "down",
        fromPeriod: from.period,
        fromValue: from.value,
        period: cur.period,
        value: cur.value,
        delta,
      },
    });
  }
  return out;
}

/**
 * 최근 1년 증감률 상위·하위 — 지도 카드 한 장의 재료.
 * 개별 지역이 아니라 **전국 순위표**가 소재이므로 상위 N 을 하나의 신호로 묶는다.
 */
export function topMovers(list: Series[], topN = 10): Signal[] {
  const rows: { code: string; name: string; rate: number; from: number; to: number; fromPeriod: string; period: string }[] = [];
  for (const s of list) {
    const p = s.points;
    if (p.length < 13) continue; // 12개월 전과 비교하려면 13개 시점이 필요하다
    const to = p[p.length - 1];
    const from = p[p.length - 13];
    if (!from.value) continue;
    rows.push({
      code: s.code,
      name: s.name,
      rate: (to.value - from.value) / from.value,
      from: from.value,
      to: to.value,
      fromPeriod: from.period,
      period: to.period,
    });
  }
  if (rows.length < topN * 2) return [];

  const sorted = [...rows].sort((a, b) => b.rate - a.rate);
  const gain = sorted.slice(0, topN);
  const lose = sorted.slice(-topN).reverse();
  const pct = (r: number) => `${(r * 100).toFixed(2)}%`;
  const period = rows[0].period;
  const fromPeriod = rows[0].fromPeriod;

  return [
    {
      kind: "topmove",
      code: "ALL",
      name: "전국",
      title: `1년 새 인구가 가장 많이 늘어난 시군구 TOP${topN}`,
      why: `${fromPeriod}→${period} · 1위 ${gain[0].name} ${pct(gain[0].rate)} · 전국 ${rows.length}개 시군구 비교`,
      score: 0,
      reasons: ["전국 순위", `1위 ${gain[0].name}`],
      facts: { direction: "up", topN, fromPeriod, period, leader: gain[0].name, leaderRate: pct(gain[0].rate), pool: rows.length },
    },
    {
      kind: "topmove",
      code: "ALL",
      name: "전국",
      title: `1년 새 인구가 가장 많이 줄어든 시군구 TOP${topN}`,
      why: `${fromPeriod}→${period} · 1위 ${lose[0].name} ${pct(lose[0].rate)} · 전국 ${rows.length}개 시군구 비교`,
      score: 0,
      reasons: ["전국 순위", `1위 ${lose[0].name}`],
      facts: { direction: "down", topN, fromPeriod, period, leader: lose[0].name, leaderRate: pct(lose[0].rate), pool: rows.length },
    },
  ];
}

/**
 * 점수 매기기. 배점은 청약홈과 같은 사고방식이다 —
 * **지금 낼 이유(변화)** + **얼마나 많은 사람의 이야기인가(규모)** + **우리 독자의 동네인가(지역)**.
 */
export function score(sig: Signal): Signal {
  let s = 0;
  const why = [...sig.reasons];

  if (sig.kind === "topmove") {
    /* 전국 순위표는 지역·규모 가점이 의미 없다. 매달 낼 수 있는 고정물이라 기본점을 준다. */
    s = 62;
    return { ...sig, score: s, reasons: why };
  }

  const region = regionBonus(sig.code);
  s += region.s;
  if (region.why) why.push(region.why);

  const pop = Number(sig.facts.value ?? 0);
  const size = sizeBonus(pop);
  s += size.s;
  if (size.why) why.push(size.why);

  if (sig.kind === "milestone") {
    /* 문턱 돌파가 가장 강한 후킹이다. 큰 선일수록 세다. */
    const m = Number(sig.facts.milestone ?? 0);
    s += m >= 1_000_000 ? 40 : m >= 500_000 ? 32 : m >= 300_000 ? 26 : m >= 100_000 ? 22 : 16;
    /* 줄어서 깨진 쪽이 늘어서 넘은 쪽보다 이야깃거리가 크다(지방소멸 서사). */
    if (sig.facts.direction === "down") { s += 6; why.push("하향 돌파"); }
  } else {
    /* 연속 개월이 길수록 세다 — 다만 규모·지역보다 세지 않게 상한을 둔다. */
    const months = Number(sig.facts.months ?? 0);
    s += Math.min(30, 8 + months * 1.5);
  }

  return { ...sig, score: Math.round(s), reasons: why };
}

/** 점수순 정렬 + 문턱. 동점이면 코드순 — 같은 입력이면 항상 같은 순서(결정성). */
export function rank(sigs: Signal[], min = 45): Signal[] {
  return sigs
    .map(score)
    .filter((x) => x.score >= min)
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code) || a.title.localeCompare(b.title));
}

/**
 * 지도에 얹기 전 코드 대조 — 우리 지도에 없는 시군구가 하나라도 있으면 **알려준다**.
 * (행정구역이 바뀌면 여기서 먼저 드러난다. 조용히 빈 칸으로 그리면 그 자체가 오보다.)
 */
export function joinReport(
  list: Series[],
  geoCodes: string[],
): { matched: string[]; missingInGeo: string[]; missingInData: string[] } {
  const data = new Set(list.map((s) => s.code));
  const geo = new Set(geoCodes);
  return {
    matched: [...data].filter((c) => geo.has(c)).sort(),
    missingInGeo: [...data].filter((c) => !geo.has(c)).sort(),
    missingInData: [...geo].filter((c) => !data.has(c)).sort(),
  };
}
