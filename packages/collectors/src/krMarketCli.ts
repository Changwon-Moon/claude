/**
 * 국내 증시 수집 CLI — 코스피(^KS11)·코스닥(^KQ11) 일간 종가를 받아
 * 2026년 궤적·연중 고점·고점대비 하락률을 코드로 산출해 데이터셋으로 저장한다.
 *
 *   tsx src/krMarketCli.ts [--year 2026] [--out data/datasets/kr-market-2026.json]
 *
 * 소스: 야후 파이낸스 차트 API(무료·키 불필요, JSON). Stooq는 봇 차단(JS 검증)으로 러너에서 불가.
 * 세션은 외부망 차단 → Actions(kr-market.yml)에서 실행해 커밋. LLM 수치 창작 없음.
 * 주의: 집계 소스 — 헤드라인 수치는 발행 전 KRX·언론 보도와 교차확인(verified 승격).
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fetchText } from "./http.js";

const CWD = process.env.INIT_CWD || process.cwd();

const INDICES = [
  { key: "kospi", label: "코스피", yahoo: "^KS11" },
  { key: "kosdaq", label: "코스닥", yahoo: "^KQ11" },
];

const r2 = (v: number) => Math.round(v * 100) / 100;

interface Day {
  date: string;
  close: number;
}

/** 야후 차트 JSON → 일간 종가 배열 */
export function parseYahooChart(json: string): Day[] {
  const doc = JSON.parse(json);
  const res = doc?.chart?.result?.[0];
  if (!res) throw new Error(`야후 응답에 chart.result 없음: ${json.slice(0, 200)}`);
  const ts: number[] = res.timestamp || [];
  const closes: (number | null)[] = res.indicators?.quote?.[0]?.close || [];
  const tz: string = res.meta?.exchangeTimezoneName || "Asia/Seoul";
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const rows: Day[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c == null || Number.isNaN(c)) continue;
    rows.push({ date: fmt.format(new Date(ts[i] * 1000)), close: c });
  }
  return rows;
}

function summarize(rows: Day[], year: string) {
  const yr = rows.filter((r) => r.date.startsWith(year));
  if (yr.length < 2) throw new Error(`${year}년 데이터가 ${yr.length}건 — 수집 불가`);
  const first = yr[0];
  const last = yr[yr.length - 1];
  let peak = yr[0];
  let trough = yr[0];
  for (const r of yr) {
    if (r.close > peak.close) peak = r;
    if (r.close < trough.close) trough = r;
  }
  return {
    asOf: last.date,
    current: r2(last.close),
    yearStart: { date: first.date, close: r2(first.close) },
    peak: { date: peak.date, close: r2(peak.close) },
    trough: { date: trough.date, close: r2(trough.close) },
    ytdPct: r2(((last.close - first.close) / first.close) * 100),
    drawdownFromPeakPct: r2(((last.close - peak.close) / peak.close) * 100),
    series: yr.map((q) => ({ d: q.date, c: r2(q.close) })),
  };
}

const yahooUrl = (sym: string) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=2y&interval=1d`;

async function main() {
  const argv = process.argv.slice(2);
  let year = "2026";
  let out = `data/datasets/kr-market-2026.json`;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--year") year = argv[++i];
    else if (argv[i] === "--out") out = argv[++i];
  }

  const indices: Record<string, unknown> = {};
  for (const idx of INDICES) {
    console.log(`📥 ${idx.label} (${idx.yahoo}) 수집...`);
    const json = await fetchText(yahooUrl(idx.yahoo), {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (wirit-collector)" },
    });
    const rows = parseYahooChart(json);
    if (!rows.length) throw new Error(`${idx.label}: 시세 행 없음`);
    const s = summarize(rows, year);
    indices[idx.key] = { label: idx.label, ...s };
    console.log(
      `   ✅ ${s.asOf} 기준 ${s.current} · ${year} 고점 ${s.peak.close}(${s.peak.date}) · 고점대비 ${s.drawdownFromPeakPct}% · YTD ${s.ytdPct}% · ${s.series.length}일`,
    );
  }

  const doc = {
    dataset: `kr-market-${year}`,
    year,
    indices,
    meta: {
      source: "야후 파이낸스 일간 종가 (무료 집계 소스)",
      provenance: INDICES.map((i) => yahooUrl(i.yahoo)),
      verified: false,
      verificationNote:
        "발행 전 헤드라인 수치(현재지수·고점)를 KRX 정보데이터시스템 또는 언론 보도와 교차확인 후 verified=true 승격",
    },
  };
  const p = resolve(CWD, out);

  /* ⚠️ 시계열은 **덮어쓰지 않고 합친다** (2026-08-16d 사고로 추가)
   *
   * 예전엔 소스가 준 것을 그대로 `series` 에 넣었다. 그런데 야후의 `range=2y` 창은
   * 고정이 아니라서 **어떤 날은 지난 거래일을 빼고 준다.** 실제로 2026-08-16 수집이
   * `2026-07-21` · `07-22` · `07-31` 을 지웠고, 그 07-31 을 마지막 점으로 쓰던
   * **오너 확정 카드(`kospi-record`)의 픽셀이 조용히 깨졌다.**
   * doctor 가 잡아 주긴 했지만, 잡힌 것은 픽셀이었고 진짜 사고는 **근거가 사라진 것**이다.
   *
   * 지난 값은 바뀌지 않는다(종가는 확정된 사실이다). 그러니 **한 번 받은 점은 남긴다** —
   * 같은 날짜가 또 오면 새 값으로 갱신하고, 안 온 날은 그대로 둔다.
   * 무엇이 빠질 뻔했는지 **말한다** — 조용히 메우면 소스가 망가진 걸 아무도 모른다. */
  let kept = 0;
  if (existsSync(p)) {
    try {
      const prev = JSON.parse(readFileSync(p, "utf8"));
      for (const [key, idx] of Object.entries<any>(doc.indices ?? {})) {
        const before: { d: string; c: number }[] = prev?.indices?.[key]?.series ?? [];
        if (!before.length) continue;
        const now = new Map<string, number>((idx.series ?? []).map((q: any) => [q.d, q.c]));
        const missing = before.filter((q) => !now.has(q.d));
        if (!missing.length) continue;
        kept += missing.length;
        console.warn(`   ⚠️ ${key}: 소스가 지난 ${missing.length}일을 안 줬습니다 — 기존 값을 지키고 합칩니다`);
        console.warn(`      ${missing.slice(0, 8).map((q) => q.d).join(", ")}${missing.length > 8 ? " …" : ""}`);
        for (const q of missing) now.set(q.d, q.c);
        idx.series = [...now].map(([d, c]) => ({ d, c })).sort((a, b) => a.d.localeCompare(b.d));
      }
    } catch {
      console.warn("   ⚠️ 기존 파일을 못 읽어 합치기를 건너뜁니다 — 새로 받은 것만 남습니다");
    }
  }
  if (kept) console.log(`   🧷 지난 점 ${kept}개를 지켰습니다 (지우면 확정 카드의 근거가 사라집니다)`);

  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
  console.log(`💾 저장: ${out}`);
}

main().catch((e) => {
  console.error("수집 실패:", e);
  process.exit(1);
});
