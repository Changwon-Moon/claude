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
 *       C1 = 과세대상근로소득(총급여)규모별 — 아래 BRACKETS
 *       C2 = 주소지 · `15133JSJ00` 이 **합계(전국)**
 *       항목 = `16133T2008_0135` 인원
 *
 *     ⚠️ **1억 초과는 한 칸이 아니다.** 구간이 「1억 이하」까지만 있고 그 위는
 *        2억·3억·5억·10억 이하 + 10억 초과로 쪼개져 있다 — **다섯 칸을 더해야** 한다.
 *        한 칸만 집으면 154만이 아니라 140만쯤 나오는데, **그 숫자도 그럴듯해 보인다.**
 *
 *     ⚠️ 국세청은 '총급여'를 '과세대상 근로소득'이라고 부른다(4.2.1 의 축 이름이
 *        "과세대상 근로소득(총급여)" 로 둘을 같이 적어 준다). 다른 기준이 아니다.
 *
 *  ② populationYear = 101/DT_1B040A3 을 연간·전국으로
 *       C1 = `00` 전국 · 항목 = `T20` 총인구수 · 단위 명
 *
 * ── 두 비중은 **분모가 다르다.** 카드에서 섞으면 그대로 오보다.
 *     sharePayer = 억대 ÷ 연말정산 신고인원   (기사가 쓰는 7.3%)
 *     sharePop   = 억대 ÷ 주민등록 총인구     (유아·노인까지 포함한 국민 전체)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fetchTable } from "./sources/kosis.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** 총급여 규모 구간 코드 → 이름. probe 가 준 그대로다(추측 금지). */
const BRACKETS: Record<string, string> = {
  "15133GSD00": "소계",
  "15133GSD02": "1천만 이하",
  "15133GSD03_1": "1.5천만 이하",
  "15133GSD05": "2천만 이하",
  "15133GSD06": "3천만 이하",
  "15133GSD07": "4천만 이하",
  "15133GSD07_1": "4.5천만 이하",
  "15133GSD08": "5천만 이하",
  "15133GSD09": "6천만 이하",
  "15133GSD0B": "8천만 이하",
  "15133GSD0D": "1억 이하",
  "15133GSD0E": "2억 이하",
  "15133GSD0F": "3억 이하",
  "15133GSD0G": "5억 이하",
  "15133GSD0H": "10억 이하",
  "15133GSD0I": "10억 초과",
};

/** 「1억 초과」를 이루는 칸들. 이 다섯을 더한 것이 억대 연봉자다. */
const OVER_100M = ["15133GSD0E", "15133GSD0F", "15133GSD0G", "15133GSD0H", "15133GSD0I"];
/** 전체 신고인원(비중의 분모). */
const TOTAL = "15133GSD00";
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
  const wageJson = await fetchTable("wageBracket", key, {
    prdSe: "Y",
    startPrdDe: String(from),
    endPrdDe: String(to),
    itmId: ITM_PEOPLE,
    objL1: "ALL",          // C1 = 총급여 규모 (전 구간)
    extraObjL: [NATION],   // C2 = 주소지 → 합계만
  });
  const wageRows = rowsOf(wageJson, "wageBracket");

  /* 받은 구간 코드가 우리가 아는 목록과 같은지 본다.
     통계표가 구간을 쪼개거나 합치면 **합계가 조용히 틀어진다** — 그때는 여기서 멈춘다. */
  const seen = new Set(wageRows.map((r) => String(r.C1)));
  const unknown = [...seen].filter((c) => !(c in BRACKETS));
  if (unknown.length) {
    throw new Error(
      `모르는 총급여 구간 코드가 왔다: ${unknown.join(", ")} — ` +
      `표의 구간이 바뀌었을 수 있다. 더하기 전에 사람이 확인해야 한다`,
    );
  }

  type Y = { year: number; total: number; over100m: number; byBracket: Record<string, number> };
  const byYear = new Map<number, Y>();
  for (const r of wageRows) {
    if (String(r.C2) !== NATION) continue;          // 합계 행만
    if (String(r.ITM_ID) !== ITM_PEOPLE) continue;  // 인원 항목만
    const year = Number(String(r.PRD_DE));
    if (!Number.isFinite(year)) continue;
    const code = String(r.C1);
    const v = num(r.DT, `wageBracket ${year} ${BRACKETS[code] ?? code}`);
    const y = byYear.get(year) ?? { year, total: 0, over100m: 0, byBracket: {} };
    y.byBracket[code] = v;
    byYear.set(year, y);
  }
  if (byYear.size === 0) throw new Error("wageBracket: 합계(전국) 행이 하나도 없다 — C2 코드를 다시 본다");

  for (const y of byYear.values()) {
    const missing = [TOTAL, ...OVER_100M].filter((c) => y.byBracket[c] === undefined);
    if (missing.length) {
      throw new Error(
        `${y.year}년: 필요한 구간이 빠졌다 — ${missing.map((c) => BRACKETS[c]).join(", ")}. ` +
        `한 칸이라도 없으면 억대 합계가 조용히 작아진다`,
      );
    }
    y.total = y.byBracket[TOTAL];
    y.over100m = OVER_100M.reduce((a, c) => a + y.byBracket[c], 0);
    /* 소계가 진짜 소계인지 검산한다. 구간을 다 더하면 소계와 같아야 한다. */
    const sumParts = Object.entries(y.byBracket)
      .filter(([c]) => c !== TOTAL)
      .reduce((a, [, v]) => a + v, 0);
    const gap = Math.abs(sumParts - y.total);
    if (gap > y.total * 0.005) {
      throw new Error(
        `${y.year}년: 구간 합(${sumParts.toLocaleString()})이 소계(${y.total.toLocaleString()})와 ` +
        `${gap.toLocaleString()}명 어긋난다 — '소계'로 쓴 코드가 소계가 아닐 수 있다`,
      );
    }
  }

  /* ── ② 연도별 전국 총인구 ─────────────────────────────────────── */
  const popJson = await fetchTable("populationYear", key, {
    prdSe: "Y",
    startPrdDe: String(from),
    endPrdDe: String(to),
    itmId: "T20",
    objL1: "00",
  });
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
    return {
      year,
      over100m: y.over100m,
      payers: y.total,
      population,
      /* 비중은 **분모를 이름에 박아** 둔다. 카드가 둘을 섞지 못하게. */
      sharePayerPct: Number(((y.over100m / y.total) * 100).toFixed(1)),
      sharePopPct: Number(((y.over100m / population) * 100).toFixed(1)),
      byBracket: Object.fromEntries(
        Object.entries(y.byBracket).map(([c, v]) => [BRACKETS[c] ?? c, v]),
      ),
    };
  });
  if (rows.length < 2) throw new Error(`연도가 ${rows.length}개뿐이다 — 시계열 카드가 안 된다`);

  /* ── 2차 출처 대조 (보도 수치와 다르면 **계산값을 쓰고 차이를 보고한다**) ── */
  const CROSSCHECK: Record<number, { people: number; pct: number; from: string }> = {
    2023: { people: 1_393_088, pct: 6.7, from: "머니투데이 2026-09-14 그래프(자료 국세청)·한국세정신문 2024" },
    2024: { people: 1_545_725, pct: 7.3, from: "머니투데이 2026-09-14 그래프(자료 국세청)" },
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
      throw new Error(`대조가 2% 넘게 어긋난다 — 구간 코드부터 다시 본다.\n  ${line}`);
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
        "구간 코드·항목 코드는 2026-09-14 probe 실측값이고, 소계 검산(구간 합 = 소계)과 " +
        "2023·2024년 보도값 대조를 코드가 매 수집마다 돌린다. 어긋나면 수집이 던진다.",
      perishable: false,
      unit: { over100m: "명", payers: "명", population: "명", sharePayerPct: "%", sharePopPct: "%" },
      basis:
        "over100m = 총급여 2억 이하+3억 이하+5억 이하+10억 이하+10억 초과 (1억 초과는 한 칸이 아니다). " +
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
      `신고자중 ${r.sharePayerPct}%  인구대비 ${r.sharePopPct}%  (신고 ${r.payers.toLocaleString()} · 인구 ${r.population.toLocaleString()})`,
    );
  }
  notes.forEach((n) => console.log(`   · ${n}`));
  console.log(`   → ${out}`);
}

main().catch((e) => {
  console.error(`❌ ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
