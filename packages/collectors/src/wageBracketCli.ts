/**
 * 억대 연봉 근로소득자 연도별 시계열 수집 — **Actions 전용**.
 *
 *   KOSIS_API_KEY=xxx tsx src/wageBracketCli.ts \
 *     --from 2009 --to 2024 --out <절대경로>/data/datasets/wage-100m.json
 *
 * ── 이 수집기가 존재하는 이유
 * 「연봉 1억 넘는 근로자가 몇 명인가」 카드의 재료다. 기사 그래프를 옮겨 적는 대신
 * 원자료(국세청 국세통계 · KOSIS)에서 구간별 인원을 받아 **카드가 스스로 더하게** 한다.
 *
 * ── 두 표를 받는다 (2026-09-14 probe 실측 · data/kosis-probe.md)
 *
 *  ① wageBracket = 133/DT_133N_427
 *     「4.2.11 주소지별·과세대상 근로소득 규모별 연말정산 신고 현황[2007~]」
 *       C1 = 과세대상근로소득(총급여)규모별
 *       C2 = 주소지 · `15133JSJ00` 이 **합계(전국)**
 *       항목 = `16133T2008_0135` 인원
 *
 *     ⚠️ **1억 초과는 한 칸이 아니다.** 구간이 「1억 이하」까지만 있고 그 위는
 *        2억·3억·5억·10억 이하 + 10억 초과로 쪼개져 있다 — 여러 칸을 더해야 한다.
 *        한 칸만 집으면 154만이 아니라 140만쯤 나오는데, **그 숫자도 그럴듯해 보인다.**
 *
 *     ⚠️ 국세청은 '총급여'를 '과세대상 근로소득'이라고 부른다(4.2.1 의 축 이름이
 *        "과세대상 근로소득(총급여)" 로 둘을 같이 적어 준다). 다른 기준이 아니다.
 *
 *  ② populationYear = 101/DT_1B040A3 을 연간·전국으로
 *       C1 = `00` 전국 · 항목 = `T20` 총인구수 · 단위 명
 *
 * ── 두 비중은 **분모가 다르다.** 카드에서 섞으면 그대로 오보다.
 *     sharePayerPct = 억대 ÷ 연말정산 신고인원   (기사가 쓰는 7.3%)
 *     sharePopPct   = 억대 ÷ 주민등록 총인구     (유아·노인까지 포함한 국민 전체)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fetchTable } from "./sources/kosis.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/* ── 구간을 **코드가 아니라 이름으로** 가른다 (2026-09-14, 첫 수집이 가르쳐 준 것) ──
 *
 * probe 는 최신 한 시점만 보여 준다. 그래서 2024년 코드 16개를 적어 두고 2009년부터 받았더니
 * 모르는 코드가 7개 더 왔다(15133GSD01·03·04·0B_1·0C·0C_1·00_1) — **구간 체계가 해마다 바뀐다.**
 * 코드를 박아 두면 표가 구간을 쪼갤 때마다 수집이 멈추거나, 운이 나쁘면 한 칸이 조용히 빠진다.
 *
 * 응답의 `C1_NM` 은 "1억 이하"·"10억 초과"처럼 **경계가 그대로 적힌 이름**이다.
 * 그래서 이름을 숫자로 풀어 「상한이 1억을 넘는 칸」을 모은다. 이름이 문법에 안 맞으면 던진다 —
 * 파싱이 조용히 실패해 빈 칸이 생기는 것이 이 자리에서 제일 위험하다.
 */

/** "1억 이하" → 1e8 · "1.5천만 이하" → 1.5e7 · "10억 초과" → Infinity · "소계" → null(합계 행) */
export function bound(name: string): number | null {
  const n = name.replace(/\s+/g, "");
  if (/^(소계|합계|계|총계)$/.test(n)) return null;
  const m = /^([0-9.]+)(천만|억|만)?(이하|초과|미만)$/.exec(n);
  if (!m) throw new Error(`총급여 구간 이름을 못 읽었다: "${name}" — 표의 구간 표기가 바뀌었다`);
  const v = Number(m[1]);
  if (!Number.isFinite(v)) throw new Error(`총급여 구간 숫자를 못 읽었다: "${name}"`);
  const mult = m[2] === "억" ? 1e8 : m[2] === "천만" ? 1e7 : m[2] === "만" ? 1e4 : 1;
  /* "N 초과"는 맨 윗칸이다 — 상한이 없다. */
  return m[3] === "초과" ? Infinity : v * mult;
}

/** 1억. 이 경계가 그해 구간표에 **실제로 있어야** 억대를 정확히 가를 수 있다. */
const LINE_100M = 1e8;
/** 주소지 축의 '합계'. 시도를 더하지 않는다 — 표가 합계를 직접 준다. */
const NATION = "15133JSJ00";
/** 인원 항목. 금액·과세표준·결정세액과 섞으면 안 된다. */
const ITM_PEOPLE = "16133T2008_0135";

type Row = {
  C1?: string; C1_NM?: string; C2?: string; C2_NM?: string;
  ITM_ID?: string; PRD_DE?: string; DT?: string; UNIT_NM?: string;
};

function rowsOf(json: unknown, what: string): Row[] {
  if (!Array.isArray(json)) {
    throw new Error(`${what}: 응답이 배열이 아니다 — ${JSON.stringify(json).slice(0, 300)}`);
  }
  if (json.length === 0) {
    throw new Error(`${what}: 응답이 비었다. 빈 배열은 '자료 없음'이 아니라 요청이 틀린 것일 수 있다`);
  }
  return json as Row[];
}

/** 숫자만 통과시킨다. KOSIS 는 결측을 "-"·""·"…" 로 준다 — 0 으로 읽으면 그래프가 바닥으로 꺾인다. */
/* ── 연결이 안 잡히는 실패는 **기다림이 아니라 새 러너**로 푼다 ──
 * (docs/API_CONNECTIONS.md · .github/workflows/singo-retry.yml 이 같은 것을 먼저 배웠다)
 *
 * 2026-09-14 실측: 같은 표·같은 인자가 05:02 런에서는 응답했고(그 런은 구간 코드로 멈췄다),
 * 05:08·05:10·05:21 세 런은 전부 TCP 연결 자체가 안 잡혔다(UND_ERR_CONNECT_TIMEOUT).
 * kosis.kr 사이트는 그 시각에 멀쩡했다 — 막힌 것은 **러너의 출구 IP** 쪽이다.
 *
 * 그래서 05:21 런에 75·90·120초 인내를 붙여 봤지만 네 번 다 같은 곳에서 죽었다.
 * 당연하다 — **같은 실행 안에서는 출구 IP 가 안 바뀐다.** 신고가 배관이 2026-08-24 에
 * 정확히 같은 결론에 닿아 사다리(새 런)로 갔다. 여기서 그 교훈을 다시 사지 않는다.
 *
 * 남겨 둔 60초 한 번은 '순간적인 흔들림'만 받아 주는 자리다. 그 이상은 새 런의 몫이다.
 *
 * ⚠️ 기다림이 푸는 것은 '연결이 안 잡힌다'뿐이다. 「표가 없다」·「파라미터가 틀렸다」는
 *    다시 밀어도 같으므로 바로 던진다 — 두 실패를 같은 것으로 세지 않는다. */
const WAITS_MS = [60_000];

function isClosedWindow(e: unknown): boolean {
  const m = e instanceof Error ? `${e.message}` : String(e);
  return /UND_ERR_CONNECT_TIMEOUT|ConnectTimeoutError|ECONNRESET|EAI_AGAIN|socket hang up|fetch failed/i.test(m);
}

async function withPatience<T>(what: string, fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= WAITS_MS.length; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isClosedWindow(e) || i === WAITS_MS.length) throw e;
      const wait = WAITS_MS[i];
      console.log(
        `⏳ ${what}: kosis.kr 연결이 안 잡힙니다(${i + 1}/${WAITS_MS.length + 1}). ` +
        `${Math.round(wait / 1000)}초 쉬고 다시 두드립니다 — 주소 문제가 아니라 닫힌 창입니다.`,
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

function num(dt: string | undefined, where: string): number {
  const s = String(dt ?? "").replace(/,/g, "").trim();
  if (!/^-?\d+(\.\d+)?$/.test(s)) throw new Error(`${where}: 숫자가 아닌 값 "${dt}"`);
  return Number(s);
}

async function main() {
  const key = process.env.KOSIS_API_KEY;
  if (!key) {
    /* 키가 없으면 **실패한다.** 조용히 건너뛰면 아무도 모르는 채 몇 주가 간다(2026-07-31 사고). */
    console.error("❌ KOSIS_API_KEY 가 없습니다. 이 수집기는 Actions 에서 Secrets 로 돕니다.");
    process.exit(1);
  }

  const from = Number(arg("from") ?? "2009");
  const to = Number(arg("to") ?? String(new Date().getUTCFullYear() - 2));
  const out = arg("out") ?? resolve(CWD, "data/datasets/wage-100m.json");
  if (!(from >= 2007 && to >= from)) throw new Error(`연도 범위가 이상하다: ${from}~${to} (표는 2007~)`);

  /* ── ① 총급여 규모별 인원 (전국 합계) ───────────────────────────── */
  const wageJson = await withPatience("총급여 규모별 인원", () => fetchTable("wageBracket", key, {
    prdSe: "Y",
    startPrdDe: String(from),
    endPrdDe: String(to),
    itmId: ITM_PEOPLE,
    objL1: "ALL",          // C1 = 총급여 규모 (전 구간)
    extraObjL: [NATION],   // C2 = 주소지 → 합계만
  }));
  const wageRows = rowsOf(wageJson, "wageBracket");

  type Bracket = { name: string; upper: number | null; people: number };
  type Y = { year: number; total: number; over100m: number; brackets: Bracket[] };
  const byYear = new Map<number, Y>();

  for (const r of wageRows) {
    if (String(r.C2) !== NATION) continue;          // 합계(전국) 행만
    if (String(r.ITM_ID) !== ITM_PEOPLE) continue;  // 인원 항목만
    const year = Number(String(r.PRD_DE));
    if (!Number.isFinite(year)) continue;
    const name = String(r.C1_NM ?? "").trim();
    if (!name) throw new Error(`${year}년: 구간 이름(C1_NM)이 비었다 — 응답 모양이 바뀌었다`);
    const people = num(r.DT, `wageBracket ${year} ${name}`);
    const y = byYear.get(year) ?? { year, total: 0, over100m: 0, brackets: [] };
    y.brackets.push({ name, upper: bound(name), people });
    byYear.set(year, y);
  }
  if (byYear.size === 0) throw new Error("wageBracket: 합계(전국) 행이 하나도 없다 — C2 코드를 다시 본다");

  for (const y of byYear.values()) {
    const totals = y.brackets.filter((b) => b.upper === null);
    if (totals.length !== 1) {
      throw new Error(
        `${y.year}년: 합계 행이 ${totals.length}개다(${totals.map((t) => t.name).join(", ") || "없음"}) — ` +
        `하나여야 한다. 표에 소계가 둘로 갈렸는지 본다`,
      );
    }
    y.total = totals[0].people;

    const parts = y.brackets.filter((b) => b.upper !== null);
    /* 1억 경계가 그해 구간표에 실제로 있어야 한다. 없으면 '8천만 이하 다음이 2억 이하'처럼
       1억이 칸 한가운데 묻혀 있다는 뜻이고, 그러면 억대를 정확히 셀 수 없다 — 추정하지 않는다. */
    if (!parts.some((b) => b.upper === LINE_100M)) {
      throw new Error(
        `${y.year}년: 구간표에 '1억 이하' 경계가 없다 — 있는 칸: ${parts.map((b) => b.name).join(" · ")}. ` +
        `1억이 칸 한가운데 묻히면 억대를 정확히 셀 수 없다`,
      );
    }
    const over = parts.filter((b) => (b.upper as number) > LINE_100M);
    if (over.length === 0) throw new Error(`${y.year}년: 1억을 넘는 칸이 하나도 없다`);
    y.over100m = over.reduce((a, b) => a + b.people, 0);

    /* 소계 검산 — 칸을 다 더하면 소계와 같아야 한다. 아니면 '소계'로 읽은 행이 소계가 아니다. */
    const sumParts = parts.reduce((a, b) => a + b.people, 0);
    const gap = Math.abs(sumParts - y.total);
    if (gap > y.total * 0.005) {
      throw new Error(
        `${y.year}년: 구간 합(${sumParts.toLocaleString()})이 소계(${y.total.toLocaleString()})와 ` +
        `${gap.toLocaleString()}명 어긋난다 — '소계'로 쓴 행이 소계가 아닐 수 있다`,
      );
    }
  }

  /* ── ② 연도별 전국 총인구 ─────────────────────────────────────── */
  const popJson = await withPatience("연도별 총인구", () => fetchTable("populationYear", key, {
    prdSe: "Y",
    startPrdDe: String(from),
    endPrdDe: String(to),
    itmId: "T20",
    objL1: "00",
  }));
  const popRows = rowsOf(popJson, "populationYear");
  const pop = new Map<number, number>();
  for (const r of popRows) {
    if (String(r.C1) !== "00") continue;
    const year = Number(String(r.PRD_DE));
    if (!Number.isFinite(year)) continue;
    const v = num(r.DT, `populationYear ${year}`);
    /* 자릿수 사고를 막는다. 대한민국 총인구가 4천만 미만·6천만 초과로 올 리 없다. */
    if (v < 40_000_000 || v > 60_000_000) {
      throw new Error(`${year}년 총인구가 ${v.toLocaleString()} 명이다 — 축이나 항목이 틀렸다`);
    }
    pop.set(year, v);
  }

  /* ── 합치기 ─────────────────────────────────────────────────── */
  const years = [...byYear.keys()].sort((a, b) => a - b);
  const rows = years.map((year) => {
    const y = byYear.get(year)!;
    const population = pop.get(year);
    if (population === undefined) throw new Error(`${year}년: 총인구가 없다 — 인구 표의 수록 범위를 본다`);
    const parts = y.brackets.filter((b) => b.upper !== null);
    return {
      year,
      over100m: y.over100m,
      payers: y.total,
      population,
      /* 비중은 **분모를 이름에 박아** 둔다. 카드가 둘을 섞지 못하게. */
      sharePayerPct: Number(((y.over100m / y.total) * 100).toFixed(1)),
      sharePopPct: Number(((y.over100m / population) * 100).toFixed(1)),
      /* 그해 구간표가 어떻게 생겼는지 통째로 남긴다 — 구간이 바뀐 해를 나중에 되짚을 수 있게. */
      over100mParts: parts.filter((b) => (b.upper as number) > LINE_100M).map((b) => b.name),
      byBracket: Object.fromEntries(parts.map((b) => [b.name, b.people])),
    };
  });
  if (rows.length < 2) throw new Error(`연도가 ${rows.length}개뿐이다 — 시계열 카드가 안 된다`);

  /* ── 2차 출처 대조 (보도 수치와 다르면 **계산값을 쓰고 차이를 보고한다**) ── */
  const CROSSCHECK: Record<number, { people: number; from: string }> = {
    2023: { people: 1_393_088, from: "머니투데이 2026-09-14 그래프(자료 국세청)·한국세정신문 2024" },
    2024: { people: 1_545_725, from: "머니투데이 2026-09-14 그래프(자료 국세청)" },
  };
  const notes: string[] = [];
  for (const r of rows) {
    const c = CROSSCHECK[r.year];
    if (!c) continue;
    const d = r.over100m - c.people;
    if (d === 0) { notes.push(`${r.year}년 인원 ${r.over100m.toLocaleString()}명 — 보도값과 일치`); continue; }
    const rel = Math.abs(d) / c.people;
    const line =
      `${r.year}년 인원: 우리 계산 ${r.over100m.toLocaleString()}명 vs 보도 ${c.people.toLocaleString()}명 ` +
      `(차이 ${d > 0 ? "+" : ""}${d.toLocaleString()}명, ${(rel * 100).toFixed(2)}%) · 출처 ${c.from}`;
    if (rel > 0.02) {
      throw new Error(`대조가 2% 넘게 어긋난다 — 구간 이름 파싱부터 다시 본다.\n  ${line}`);
    }
    notes.push(`${line} → 계산값을 쓴다`);
  }

  const last = rows[rows.length - 1];
  const first = rows[0];
  const payload = {
    meta: {
      title: "연봉 1억 초과 근로소득자 — 연도별",
      source:
        "국세청 국세통계 · KOSIS 133/DT_133N_427(4.2.11 주소지별·과세대상 근로소득 규모별 연말정산 신고 현황) · " +
        "통계청 101/DT_1B040A3(행정구역별 성별 인구수, 연간·전국)",
      sourceUrl: "https://kosis.kr/statHtml/statHtml.do?orgId=133&tblId=DT_133N_427",
      sourceLabel: "국세청 국세통계 · 통계청 주민등록인구",
      asOf: String(last.year),
      collectedAt: new Date().toISOString().slice(0, 10),
      verified: true,
      verifiedNote:
        "항목·축 코드는 2026-09-14 probe 실측값이고, 구간은 코드가 아니라 이름(C1_NM)으로 가른다. " +
        "소계 검산(구간 합 = 소계)과 2023·2024년 보도값 대조를 매 수집마다 돌리고 어긋나면 던진다.",
      perishable: false,
      unit: { over100m: "명", payers: "명", population: "명", sharePayerPct: "%", sharePopPct: "%" },
      basis:
        "over100m = 총급여 상한이 1억을 넘는 칸을 모두 더한 값(1억 초과는 한 칸이 아니다). " +
        "payers = 연말정산 신고인원 소계. population = 주민등록 총인구(연말). " +
        "⚠️ sharePayerPct 와 sharePopPct 는 분모가 다르다 — 한 문장에 섞지 않는다.",
      crosscheck: notes,
    },
    rows,
    summary: {
      firstYear: first.year,
      lastYear: last.year,
      over100mFirst: first.over100m,
      over100mLast: last.over100m,
      multiple: Number((last.over100m / first.over100m).toFixed(2)),
      sharePayerFirstPct: first.sharePayerPct,
      sharePayerLastPct: last.sharePayerPct,
      sharePopFirstPct: first.sharePopPct,
      sharePopLastPct: last.sharePopPct,
    },
  };

  mkdirSync(dirname(resolve(CWD, out)), { recursive: true });
  writeFileSync(resolve(CWD, out), JSON.stringify(payload, null, 2) + "\n");

  console.log(`✅ 억대 연봉 근로소득자 ${rows.length}개 연도 — ${first.year}~${last.year}`);
  for (const r of rows) {
    console.log(
      `   ${r.year}  ${String(r.over100m).padStart(9)}명  ` +
      `신고자중 ${r.sharePayerPct}%  인구대비 ${r.sharePopPct}%  ` +
      `(신고 ${r.payers.toLocaleString()} · 인구 ${r.population.toLocaleString()} · 더한 칸 ${r.over100mParts.join("+")})`,
    );
  }
  notes.forEach((n) => console.log(`   · ${n}`));
  console.log(`   → ${out}`);
}

main().catch((e) => {
  console.error(`❌ ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
