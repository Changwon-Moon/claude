/**
 * 역대 최고가 인덱스 구축 CLI (네트워크·키 필요 → GitHub Actions).
 *
 *   MOLIT_API_KEY=xxx tsx src/molitPeakCli.ts --from 200601 --to 202607 --budget 7000
 *
 * ── 무엇을 만드나
 * `data/datasets/molit-peak/{lawdCd}.json` — **단지+평형대별 역대 최고가 한 줄씩**.
 * 원본 거래는 저장하지 않는다. 2006년부터의 전 거래를 그대로 담으면 저장소가 수 GB가 되는데,
 * 신고가 판정에 필요한 건 "지금까지의 최고가" 하나뿐이다.
 *
 * ── 왜 한 번에 안 끝내나
 * 지역 66곳 × 240개월 ≈ 1.6만 회 호출이다. 공공데이터포털 일일 트래픽 한도에 걸리므로
 * `--budget` 만큼만 하고 멈춘다. **어디까지 했는지는 각 지역 파일의 `meta.doneMonths` 가 안다** —
 * 별도 진행판을 두면 파일과 진행판이 어긋나는 날이 온다. 진실은 한 곳에만 둔다.
 * 다시 실행하면 안 한 데부터 이어서 한다. 다 끝나면 아무것도 안 하고 끝난다(멱등).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchAptTradesMonth } from "./sources/molit.js";
import { validTrades } from "./parse/molit.js";
import { foldPeaks, type PeakIndex } from "./parse/singo.js";
import { singoRegions, monthRange } from "./sources/singoRegions.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** 실거래 공개 시작월. 국토부 아파트 매매 실거래 자료는 2006-01 부터다. */
const FIRST_MONTH = "200601";

function prevMonth(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth(); // 0-based → 이미 '지난달'
  const yy = m === 0 ? y - 1 : y;
  const mm = m === 0 ? 12 : m;
  return `${yy}${String(mm).padStart(2, "0")}`;
}

async function main() {
  const key = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_API_KEY;
  if (!key) {
    console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }
  const from = arg("from") ?? FIRST_MONTH;
  const to = arg("to") ?? prevMonth(new Date());
  const budget = Number(arg("budget") ?? 7000);
  const outDir = resolve(CWD, arg("out") ?? "data/datasets/molit-peak");
  mkdirSync(outDir, { recursive: true });

  const regions = singoRegions();
  const months = monthRange(from, to);
  console.log(`역대 최고가 인덱스 — 지역 ${regions.length}곳 × ${months.length}개월, 이번 실행 예산 ${budget}회`);

  let used = 0;
  let foldedTotal = 0;
  let regionsTouched = 0;
  const failures: string[] = [];

  for (const { gu, lawdCd } of regions) {
    if (used >= budget) break;
    const path = join(outDir, `${lawdCd}.json`);
    const idx: PeakIndex = existsSync(path)
      ? JSON.parse(readFileSync(path, "utf8"))
      : {
          meta: {
            lawdCd,
            gu,
            doneMonths: [],
            updatedAt: "",
            source:
              "국토교통부 아파트 매매 실거래가 상세자료 (getRTMSDataSvcAptTradeDev) — 단지+평형대별 역대 최고가만 보관",
          },
          peaks: {},
        };
    const done = new Set(idx.meta.doneMonths);
    const todo = months.filter((m) => !done.has(m));
    if (!todo.length) continue;

    let touched = false;
    for (const ym of todo) {
      if (used >= budget) break;
      try {
        const raw = await fetchAptTradesMonth(lawdCd, ym, key);
        used++;
        const tx = validTrades(raw);
        foldedTotal += foldPeaks(idx.peaks, lawdCd, tx);
        idx.meta.doneMonths.push(ym);
        touched = true;
      } catch (e) {
        used++;
        const msg = e instanceof Error ? e.message : String(e);
        failures.push(`${gu} ${ym}: ${msg}`);
        // 인증·한도 문제면 더 두드려도 소용없다 — 이번 실행은 여기서 접는다
        if (/LIMITED_NUMBER|SERVICE_KEY|HTTP 40[13]/i.test(msg)) {
          console.error(`⛔ ${gu} ${ym} — ${msg} · 이번 실행 중단`);
          used = budget;
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 120));
    }
    if (touched) {
      idx.meta.doneMonths.sort();
      idx.meta.gu = gu;
      idx.meta.updatedAt = new Date().toISOString().slice(0, 10);
      writeFileSync(path, JSON.stringify(idx, null, 0) + "\n");
      regionsTouched++;
      console.log(`· ${gu} ${idx.meta.doneMonths.length}/${months.length}개월 · 칸 ${Object.keys(idx.peaks).length}`);
    }
  }

  // ── 남은 일이 얼마인지 한 줄로 (이게 없으면 "다 됐나?"를 사람이 세게 된다)
  let remaining = 0;
  let ready = 0;
  for (const { lawdCd } of regions) {
    const p = join(outDir, `${lawdCd}.json`);
    const n = existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as PeakIndex).meta.doneMonths.length : 0;
    remaining += months.length - n;
    if (n >= months.length) ready++;
  }
  const summary = {
    from,
    to,
    regions: regions.length,
    monthsPerRegion: months.length,
    regionsComplete: ready,
    monthsRemaining: remaining,
    complete: remaining === 0,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  writeFileSync(join(outDir, "_progress.json"), JSON.stringify(summary, null, 2) + "\n");

  console.log(
    `\n호출 ${used}회 · 갱신된 칸 ${foldedTotal} · 손댄 지역 ${regionsTouched}곳\n` +
      `완료 지역 ${ready}/${regions.length} · 남은 월 ${remaining} · ${summary.complete ? "✅ 전부 완료" : "⏳ 이어서 진행 필요"}`,
  );
  if (failures.length) {
    console.log(`\n실패 ${failures.length}건 (다음 실행에서 다시 시도합니다):`);
    for (const f of failures.slice(0, 20)) console.log(`  · ${f}`);
  }
  // 실패가 있어도 진행분은 살린다 — 커밋되지 않으면 다음 실행이 처음부터 다시 한다
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
