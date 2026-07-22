/**
 * 국내 증시 수집 CLI — 코스피·코스닥 일간 시세(Stooq, 무료·키 불필요)를 받아
 * 2026년 궤적·연중 고점·고점대비 하락률을 코드로 산출해 데이터셋으로 저장한다.
 *
 *   tsx src/krMarketCli.ts [--year 2026] [--out data/datasets/kr-market-2026.json]
 *
 * 세션은 외부망 차단 → Actions(kr-market.yml)에서 실행해 커밋. LLM 수치 창작 없음.
 * 주의: Stooq는 집계 소스 — 헤드라인 수치는 발행 전 KRX·언론 보도와 교차확인(verified 승격).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fetchText } from "./http.js";
import { parseStooqDailyCsv, type DailyRow } from "./parse/stooq.js";

const CWD = process.env.INIT_CWD || process.cwd();

const INDICES = [
  { key: "kospi", label: "코스피", stooq: "^kospi" },
  { key: "kosdaq", label: "코스닥", stooq: "^kosdaq" },
];

const r2 = (v: number) => Math.round(v * 100) / 100;

function summarize(rows: DailyRow[], year: string) {
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
    const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(idx.stooq)}&i=d`;
    console.log(`📥 ${idx.label} (${idx.stooq}) 수집...`);
    const csv = await fetchText(url);
    const rows = parseStooqDailyCsv(csv);
    if (!rows.length) throw new Error(`${idx.label}: Stooq 응답에 시세 행 없음 (심볼 확인 필요)`);
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
      source: "Stooq 일간 종가 (무료 집계 소스)",
      provenance: INDICES.map((i) => `https://stooq.com/q/d/l/?s=${i.stooq}&i=d`),
      verified: false,
      verificationNote:
        "발행 전 헤드라인 수치(현재지수·고점)를 KRX 정보데이터시스템 또는 언론 보도와 교차확인 후 verified=true 승격",
    },
  };
  const p = resolve(CWD, out);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
  console.log(`💾 저장: ${out}`);
}

main().catch((e) => {
  console.error("수집 실패:", e);
  process.exit(1);
});
