/**
 * 국토부 아파트 전월세 실거래 수집 CLI (Actions에서 실행 — 네트워크·키 필요).
 *   MOLIT_API_KEY=xxx tsx src/molitRentCli.ts --gu all --months 202606,202607 [--region seoul|gyeonggi|all] [--out dir] [--force]
 * 산출: <out>/{LAWD}-{YYYYMM}.json — 구·월별 **전세/월세·신규/갱신 집계(건수·비중)**.
 *   원거래는 저장하지 않는다(비중 카드에 필요한 건 집계). 수치는 코드가 센다(오보 0).
 * 캐시 존재 시 스킵(--force 재수집). 세션은 data.go.kr 차단 → Actions 전용.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAptRentsMonth } from "./sources/molit.js";
import { aggregateRents } from "./parse/molit.js";

const CWD = process.env.INIT_CWD || process.cwd();
const HERE = resolve(fileURLToPath(import.meta.url), "..");
const REGION_FILES: Record<string, string> = { seoul: "lawd-seoul.json", gyeonggi: "lawd-gyeonggi.json" };
const loadCodes = (f: string) =>
  JSON.parse(readFileSync(join(HERE, "data", f), "utf8")).codes as Record<string, string>;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const key = process.env.MOLIT_API_KEY;
  if (!key) { console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록)."); process.exit(1); }

  const regionArg = arg("region") ?? "seoul";
  const regions = regionArg === "all" ? Object.keys(REGION_FILES) : regionArg.split(",").map((s) => s.trim());
  const LAWD: Record<string, string> = {};
  for (const r of regions) {
    const f = REGION_FILES[r];
    if (!f) { console.error(`알 수 없는 region: ${r} (seoul|gyeonggi|all)`); process.exit(1); }
    Object.assign(LAWD, loadCodes(f));
  }
  const guArg = arg("gu") ?? "all";
  const monthsArg = arg("months");
  if (!monthsArg) {
    console.error("사용법: [--region seoul|gyeonggi|all] --gu all|강남구,서초구 --months 202606,202607 [--out dir] [--force]");
    process.exit(1);
  }
  const guList = guArg === "all" ? Object.keys(LAWD) : guArg.split(",").map((s) => s.trim());
  const months = monthsArg.split(",").map((s) => s.trim());
  const outDir = resolve(CWD, arg("out") ?? "data/datasets/molit-rent");
  const force = process.argv.includes("--force");
  mkdirSync(outDir, { recursive: true });

  let ok = 0, skip = 0, failed = 0, totalTx = 0;
  for (const gu of guList) {
    const code = LAWD[gu];
    if (!code) { console.warn(`⚠️ 알 수 없는 구: ${gu}`); failed++; continue; }
    for (const ym of months) {
      const outPath = join(outDir, `${code}-${ym}.json`);
      if (existsSync(outPath) && !force) { console.log(`· 캐시 스킵 ${gu} ${ym}`); skip++; continue; }
      try {
        const rents = await fetchAptRentsMonth(code, ym, key);
        const agg = aggregateRents(rents);
        writeFileSync(
          outPath,
          JSON.stringify(
            {
              meta: {
                gu, lawdCd: code, dealYmd: ym,
                source: "국토교통부 아파트 전월세 실거래가 (getRTMSDataSvcAptRent)",
                sourceUrl: "https://www.data.go.kr",
                collectedAt: new Date().toISOString().slice(0, 10),
                verified: true,
                note: "월세금액 0=전세 / >0=월세. 계약구분(신규/갱신)은 전월세신고제(2021.6~) 이후만 채워짐(typedTotal로 커버리지 확인). 집계만 저장(원거래 미보존). agg.price 는 전세 계약의 금액·면적 집계이며 **전용면적 기준**이다 — 실거래에는 공급면적이 없다(공급 평당가로 읽으면 30%쯤 부풀려진다).",
              },
              agg,
            },
            null,
            2,
          ) + "\n",
        );
        const p = agg.price;
        console.log(`✅ ${gu} ${ym} — 계약 ${agg.total}건 (전세 ${agg.jeonse}/월세 ${agg.wolse}, 월세비중 ${agg.wolseRatio}%${agg.newWolseRatio != null ? `, 신규월세 ${agg.newWolseRatio}%` : ""})${p ? ` · 전세 전용평당 ${p.perPyeong.toLocaleString()}만 (평균 ${p.avgArea}㎡·${p.avgDeposit.toLocaleString()}만, 84㎡ ${p.kp84 ? `${p.kp84.n}건 ${p.kp84.avgDeposit.toLocaleString()}만` : "없음"} · 59㎡ ${p.kp59 ? `${p.kp59.n}건 ${p.kp59.avgDeposit.toLocaleString()}만` : "없음"})` : ""} → ${code}-${ym}.json`);
        ok++; totalTx += agg.total;
      } catch (e) {
        console.error(`❌ ${gu} ${ym}: ${e instanceof Error ? e.message : e}`);
        failed++;
      }
    }
  }
  console.log(`\n요약: 수집 ${ok} · 스킵 ${skip} · 실패 ${failed} · 계약 ${totalTx.toLocaleString()}건`);
  if (ok === 0 && failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
