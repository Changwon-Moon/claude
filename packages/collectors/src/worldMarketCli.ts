/**
 * 세계 주요국 지수 수집 CLI — 8개국 대표지수의 일간 종가를 받아
 * **월별 등락률·YTD** 를 코드로 산출해 데이터셋으로 저장한다.
 *
 *   tsx src/worldMarketCli.ts [--year 2026] [--out data/datasets/world-market-2026.json]
 *
 * 소스: 야후 파이낸스 차트 API(무료·키 불필요, JSON). krMarketCli 와 같은 소스·같은 파서.
 * 세션은 외부망 차단(2026-09-04 실측: query1.finance.yahoo.com 이 allowlist 밖) →
 * Actions(world-market.yml)에서 실행해 커밋한다. LLM 수치 창작 없음.
 *
 * ── 이 파일이 지키는 것
 * ① **통화는 현지통화다.** 환산하지 않는다 — 환율을 얹으면 그건 다른 카드다.
 *    카드·캡션이 반드시 "현지통화 기준"을 적어야 한다(meta.basis 가 그 문구를 들고 있다).
 * ② **월말은 그 나라의 월말이다.** 거래일 달력이 나라마다 달라서, 각 지수의
 *    "그 달 마지막 거래일 종가"를 쓴다. 같은 날짜로 억지로 맞추면 휴장일에 값을 지어내게 된다.
 * ③ **1월 등락률의 밑은 전년 12월 말이다.** 그래서 `range=2y` 로 받아 전년치를 남긴다.
 *    전년 12월이 없으면 1월 칸은 **비운다**(null) — 0% 로 적으면 "안 움직였다"는 거짓말이 된다.
 * ④ **한 나라라도 실패하면 아무것도 안 쓴다.** 8개국 카드에서 한 줄이 조용히 빠지면
 *    읽는 사람은 그 나라가 없는 줄 안다(CARD_CHECKLIST 「no silent caps」).
 *    대신 **실패한 것을 전부 모아 한 번에** 말한다 — 한 번 돌려 전부 알아내라고.
 * ⑤ **심볼은 첫 성공 이후 못 박는다.** 후보를 순서대로 시도하는 것은 **처음 한 번뿐**이고,
 *    데이터셋이 생긴 뒤로는 meta.symbols 에 박힌 심볼만 쓴다. 안 그러면 야후가 잠깐
 *    흔들린 날 **다른 지수로 갈아타고도 아무도 모른다.**
 * ⑥ **지난 점은 지우지 않고 합친다.** krMarketCli 가 2026-08-16 에 겪은 사고와 같은 병이다
 *    (야후의 range 창이 고정이 아니라 어떤 날은 지난 거래일을 빼고 준다).
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fetchText } from "./http.js";
import { parseYahooChart, type Day } from "./parse/yahooChart.js";

const CWD = process.env.INIT_CWD || process.cwd();

/**
 * 오너 확정 8개국 (2026-09-04). 순서가 카드의 행 순서다.
 *
 * `yahoo` 는 **후보 배열**이다 — 첫 수집 때 앞에서부터 시도해 처음 성공한 것을 못 박는다.
 * 후보가 여럿인 것은 야후의 심볼 표기가 시장마다 갈리기 때문이고(특히 베트남·인도),
 * 세션에서는 외부망이 막혀 어느 것이 맞는지 **미리 확인할 수가 없다.**
 * `flag` 는 flag-icons 의 ISO 3166-1 alpha-2 소문자 코드(외국인 카드와 같은 자산).
 */
export const WORLD_INDICES = [
  { key: "korea", label: "한국", index: "코스피", flag: "kr", yahoo: ["^KS11"] },
  { key: "usa", label: "미국", index: "S&P 500", flag: "us", yahoo: ["^GSPC"] },
  { key: "japan", label: "일본", index: "닛케이225", flag: "jp", yahoo: ["^N225"] },
  { key: "china", label: "중국", index: "상해종합", flag: "cn", yahoo: ["000001.SS"] },
  { key: "hongkong", label: "홍콩", index: "항셍", flag: "hk", yahoo: ["^HSI"] },
  { key: "germany", label: "독일", index: "DAX", flag: "de", yahoo: ["^GDAXI"] },
  { key: "india", label: "인도", index: "니프티50", flag: "in", yahoo: ["^NSEI", "^BSESN"] },
  /* 베트남은 2026-09-04 첫 실행에서 셋 다 떨어졌다 —
     ^VNINDEX·VNINDEX.VN 은 HTTP 실패, ^VNI 는 응답은 왔는데 **시세 행 0건**이었다.
     그래서 후보를 넓히고, 그래도 안 되면 아래 `probeSymbol()` 이 야후에 직접 물어본다. */
  { key: "vietnam", label: "베트남", index: "VN-Index", flag: "vn", yahoo: ["^VNINDEX", "VNINDEX.VN", "^VNI", "VNINDEX", "VNI.VN"], probeQuery: "Vietnam VN Index Ho Chi Minh stock" },
] as const;

const r2 = (v: number) => Math.round(v * 100) / 100;
const ym = (iso: string) => iso.slice(0, 7);

/**
 * 일간 종가 → **월말 종가**. 그 달의 마지막 거래일을 그 나라 달력대로 잡는다.
 * 반환은 달 오름차순. 거래가 하루도 없던 달은 아예 안 나온다(0 을 만들지 않는다).
 */
export function monthEnds(rows: Day[]): { m: string; d: string; c: number }[] {
  const last = new Map<string, Day>();
  for (const r of rows) {
    const k = ym(r.date);
    const prev = last.get(k);
    if (!prev || r.date > prev.date) last.set(k, r);
  }
  return [...last.entries()]
    .map(([m, r]) => ({ m, d: r.date, c: r2(r.close) }))
    .sort((a, b) => a.m.localeCompare(b.m));
}

/**
 * 월말 종가 → 월별 등락률. `base` 는 전년 12월 말(1월 등락률의 밑).
 * 밑이 없으면 그 칸은 `pct: null` — **0 으로 채우지 않는다.**
 */
export function monthlyReturns(ends: { m: string; d: string; c: number }[], year: string) {
  const base = ends.find((e) => e.m === `${+year - 1}-12`) ?? null;
  const inYear = ends.filter((e) => e.m.startsWith(year));
  const out: { m: string; asOf: string; close: number; pct: number | null }[] = [];
  for (let i = 0; i < inYear.length; i++) {
    const cur = inYear[i];
    const prev = i === 0 ? base : inYear[i - 1];
    out.push({
      m: cur.m,
      asOf: cur.d,
      close: cur.c,
      pct: prev ? r2(((cur.c - prev.c) / prev.c) * 100) : null,
    });
  }
  return { base, months: out };
}

function summarize(rows: Day[], year: string) {
  const ends = monthEnds(rows);
  const { base, months } = monthlyReturns(ends, year);
  const yr = rows.filter((r) => r.date.startsWith(year));
  if (yr.length < 2) throw new Error(`${year}년 데이터가 ${yr.length}건 — 수집 불가`);
  const last = yr[yr.length - 1];
  let peak = yr[0];
  for (const r of yr) if (r.close > peak.close) peak = r;

  return {
    asOf: last.date,
    current: r2(last.close),
    /** 전년 12월 말 — YTD 와 1월 등락률의 밑. 없으면 null 이고 그 칸들은 비운다 */
    prevYearEnd: base,
    /** 연중 최고 종가(연내) */
    peak: { date: peak.date, close: r2(peak.close) },
    ytdPct: base ? r2(((last.close - base.c) / base.c) * 100) : null,
    monthly: months,
    series: yr.map((q) => ({ d: q.date, c: r2(q.close) })),
    /** 전년 12월 종가도 한 줄 남긴다 — 다음 해 1월을 다시 계산할 수 있어야 한다 */
    prevYearSeries: rows
      .filter((r) => r.date.startsWith(String(+year - 1) + "-12"))
      .map((q) => ({ d: q.date, c: r2(q.close) })),
  };
}

const yahooUrl = (sym: string) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=2y&interval=1d`;

/**
 * 실패한 지수를 **야후에게 직접 물어본다** (2026-09-04).
 *
 * 세션은 외부망이 막혀 심볼을 미리 확인할 수 없다. 그래서 후보를 찍어 밀고, 떨어지면
 * 후보를 하나 더 찍어 또 미는 식이 된다 — 한 번 왕복에 몇 분씩 걸리는 짓이다.
 * 야후에는 검색 엔드포인트가 있으니, **실패한 그 실행이 답까지 물어 오게** 한다.
 * 다음 세션은 로그에서 진짜 심볼을 읽어 후보 맨 앞에 넣기만 하면 된다.
 *
 * 검색 결과를 **자동으로 쓰지는 않는다** — 이름이 비슷한 다른 상품(ETF·선물)이 1위로
 * 올라오면 조용히 남의 지수를 그리게 된다. 사람이 보고 고르는 자리다.
 */
async function probeSymbol(query: string): Promise<string> {
  try {
    const json = await fetchText(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`,
      { retries: 1, headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (wirit-collector)" } },
    );
    const quotes: any[] = JSON.parse(json)?.quotes ?? [];
    if (!quotes.length) return `      (야후 검색 "${query}" — 결과 없음)`;
    return quotes
      .map((q) => `      · ${q.symbol}  [${q.quoteType ?? "?"}] ${q.shortname ?? q.longname ?? ""} ${q.exchange ?? ""}`)
      .join("\n");
  } catch (e) {
    return `      (야후 검색도 실패: ${String((e as Error).message ?? e).slice(0, 80)})`;
  }
}

/**
 * 후보 심볼 하나를 **끝까지** 재 본다 — 받고, 세어 보고, 셈까지 해 본다.
 *
 * ⚠️ 2026-09-04 두 번째 실행에서 배운 것: `^VNINDEX.VN` 은 응답도 오고 행도 있었다.
 *    그런데 **연내 1건**이었다. 「행이 0건이 아니다」만 보고 후보로 채택해 버리는 바람에
 *    그 뒤 summarize 가 던졌고, 그 예외는 후보 루프 **밖**이라 8개국 수집 전체가 죽었다.
 *    후보 검증이 얕으면 껍데기 심볼이 통과한다 — **여기서 다 재고 넘긴다.**
 *
 * 문턱을 60거래일로 둔 이유: 진짜 지수는 한 해에 240일 안팎 거래한다. 60일이면
 * 약 석 달치라, 「연중 성적표」를 그릴 수 있는 최소치이면서 껍데기는 확실히 걸러진다.
 */
const MIN_YEAR_ROWS = 60;

async function tryFetch(sym: string, year: string): Promise<Day[]> {
  const json = await fetchText(yahooUrl(sym), {
    retries: 2,
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (wirit-collector)" },
  });
  const rows = parseYahooChart(json);
  if (!rows.length) throw new Error("시세 행 0건");
  const inYear = rows.filter((r) => r.date.startsWith(year)).length;
  if (inYear < MIN_YEAR_ROWS)
    throw new Error(`${year}년 거래일이 ${inYear}일뿐 (최소 ${MIN_YEAR_ROWS}일) — 지수가 아니거나 빈 심볼입니다`);
  return rows;
}

async function main() {
  const argv = process.argv.slice(2);
  let year = "2026";
  let out = "";
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--year") year = argv[++i];
    else if (argv[i] === "--out") out = argv[++i];
  }
  if (!out) out = `data/datasets/world-market-${year}.json`;
  const p = resolve(CWD, out);

  /* 이미 한 번 성공한 심볼은 못 박는다(위 ⑤) */
  let pinned: Record<string, string> = {};
  let prev: any = null;
  if (existsSync(p)) {
    try {
      prev = JSON.parse(readFileSync(p, "utf8"));
      pinned = prev?.meta?.symbols ?? {};
    } catch {
      console.warn("⚠️ 기존 파일을 못 읽었습니다 — 심볼 고정 없이 진행합니다");
    }
  }

  const indices: Record<string, any> = {};
  const symbols: Record<string, string> = {};
  const failed: { label: string; tried: string[]; why: string; probe: string }[] = [];

  for (const idx of WORLD_INDICES) {
    const candidates = pinned[idx.key] ? [pinned[idx.key]] : [...idx.yahoo];
    if (pinned[idx.key]) console.log(`📌 ${idx.label} — 못 박힌 심볼 ${pinned[idx.key]} 만 씁니다`);
    let rows: Day[] | null = null;
    let used = "";
    const why: string[] = [];
    for (const sym of candidates) {
      try {
        console.log(`📥 ${idx.label} ${idx.index} (${sym}) 수집...`);
        rows = await tryFetch(sym, year);
        used = sym;
        break;
      } catch (e) {
        why.push(`${sym}: ${String((e as Error).message ?? e).slice(0, 90)}`);
      }
    }
    if (!rows) {
      /* 떨어진 그 자리에서 야후에게 진짜 심볼을 물어본다 — 다음 왕복을 아끼려고 */
      const probe = await probeSymbol((idx as any).probeQuery ?? idx.index);
      failed.push({ label: `${idx.label} ${idx.index}`, tried: candidates, why: why.join(" / "), probe });
      console.error(`   ❌ ${idx.label} 실패 — ${why.join(" / ")}`);
      console.error(`   🔎 야후 검색 결과 — 이 중에 맞는 것이 있는지 사람이 고릅니다:\n${probe}`);
      continue;
    }
    /* ⚠️ summarize 도 후보 루프처럼 **가둬서** 부른다. 09-04 에 이게 밖에 있어서
       한 나라의 셈 실패가 8개국 수집 전체를 죽였다 — 아무것도 못 건지고 로그만 남았다.
       가둬 두면 나머지 일곱 나라는 끝까지 재고, 실패는 아래 한 자리에 모여 나온다. */
    let s: ReturnType<typeof summarize>;
    try {
      s = summarize(rows, year);
    } catch (e) {
      const probe = await probeSymbol((idx as any).probeQuery ?? idx.index);
      const msg = `${used}: 받았지만 셈이 안 됩니다 — ${String((e as Error).message ?? e).slice(0, 90)}`;
      failed.push({ label: `${idx.label} ${idx.index}`, tried: candidates, why: msg, probe });
      console.error(`   ❌ ${idx.label} — ${msg}`);
      continue;
    }
    indices[idx.key] = { label: idx.label, index: idx.index, flag: idx.flag, ...s };
    symbols[idx.key] = used;
    const shown = s.monthly.map((m) => `${+m.m.slice(5)}월 ${m.pct === null ? "—" : (m.pct > 0 ? "+" : "") + m.pct}%`);
    console.log(`   ✅ ${used} · ${s.asOf} 기준 ${s.current} · YTD ${s.ytdPct === null ? "—" : s.ytdPct + "%"}`);
    console.log(`      ${shown.join(" · ")}`);
  }

  /* ── 한 나라라도 빠지면 **쓰지 않는다** (위 ④) ── */
  if (failed.length) {
    console.error("\n⛔ 수집 실패 — 파일을 쓰지 않습니다. 빠진 나라로 8개국 카드를 그리면 그게 오보입니다.\n");
    for (const f of failed) {
      console.error(`   · ${f.label} — 시도한 심볼: ${f.tried.join(", ")}\n     ${f.why}`);
      console.error(`     🔎 야후가 아는 것:\n${f.probe}`);
    }
    console.error(
      "\n   → 심볼이 틀렸다면 packages/collectors/src/worldMarketCli.ts 의 WORLD_INDICES 후보에 추가하세요.\n" +
        "     (야후 심볼 표기는 시장마다 갈립니다. 세션은 외부망이 막혀 미리 확인할 수 없어\n" +
        "      후보를 순서대로 시도하도록 만들어 두었습니다.)",
    );
    process.exit(1);
  }

  const doc = {
    dataset: `world-market-${year}`,
    year,
    countries: WORLD_INDICES.map((i) => i.key),
    indices,
    meta: {
      source: "야후 파이낸스 일간 종가 (무료 집계 소스)",
      symbols,
      provenance: Object.values(symbols).map((s) => yahooUrl(s)),
      basis: "현지통화 기준 · 각국 월 마지막 거래일 종가 · 1월 등락률과 YTD 의 밑은 전년 12월 말",
      verified: false,
      verificationNote:
        "발행 전 헤드라인 수치(월별 등락률 상·하위 두어 나라)를 각 거래소 또는 언론 보도와 교차확인 후 verified=true 승격",
    },
  };

  /* ── 지난 점은 지키고 합친다 (위 ⑥ · krMarketCli 2026-08-16 사고와 같은 처방) ── */
  let kept = 0;
  if (prev) {
    for (const [key, idx] of Object.entries<any>(doc.indices)) {
      for (const field of ["series", "prevYearSeries"] as const) {
        const before: { d: string; c: number }[] = prev?.indices?.[key]?.[field] ?? [];
        if (!before.length) continue;
        const now = new Map<string, number>((idx[field] ?? []).map((q: any) => [q.d, q.c]));
        const missing = before.filter((q) => !now.has(q.d));
        if (!missing.length) continue;
        kept += missing.length;
        console.warn(`   ⚠️ ${key}.${field}: 소스가 지난 ${missing.length}일을 안 줬습니다 — 기존 값을 지킵니다`);
        console.warn(`      ${missing.slice(0, 8).map((q) => q.d).join(", ")}${missing.length > 8 ? " …" : ""}`);
        for (const q of missing) now.set(q.d, q.c);
        idx[field] = [...now].map(([d, c]) => ({ d, c })).sort((a, b) => a.d.localeCompare(b.d));
      }
      /* 합친 뒤에는 월말·등락률을 **다시 센다** — 안 그러면 표와 곡선이 갈린다 */
      const merged = [...(idx.prevYearSeries ?? []), ...(idx.series ?? [])].map((q: any) => ({ date: q.d, close: q.c }));
      const re = monthlyReturns(monthEnds(merged), year);
      idx.prevYearEnd = re.base;
      idx.monthly = re.months;
      if (re.base) {
        const lastC = idx.series[idx.series.length - 1].c;
        idx.ytdPct = r2(((lastC - re.base.c) / re.base.c) * 100);
      }
    }
  }
  if (kept) console.log(`\n🧷 지난 점 ${kept}개를 지켰습니다 (지우면 확정 카드의 근거가 사라집니다)`);

  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
  console.log(`\n💾 저장: ${out} — ${Object.keys(indices).length}개국`);
}

/* 셀프테스트가 import 할 때는 안 돈다 */
if (process.argv[1] && /worldMarketCli\.ts$/.test(process.argv[1])) {
  main().catch((e) => {
    console.error("수집 실패:", e);
    process.exit(1);
  });
}
