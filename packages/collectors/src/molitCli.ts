/**
 * 국토부 아파트 매매 실거래 수집 CLI (Actions에서 실행 — 네트워크·키 필요).
 *   MOLIT_API_KEY=xxx tsx src/molitCli.ts --gu 강남구,서초구 --months 202606,202607 [--out <dir>] [--force]
 *   --gu all  → 서울 25개구 전체
 * 산출: <out>/{LAWD}-{YYYYMM}.json (유효 거래 캐시) — 이후 대장 엔진·카드 빌더가 재사용.
 * 캐시 존재 시 스킵(--force로 재수집). 세션은 네트워크 차단 → Actions 전용.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAptTradesMonth } from "./sources/molit.js";
import { validTrades } from "./parse/molit.js";

const CWD = process.env.INIT_CWD || process.cwd();
const HERE = resolve(fileURLToPath(import.meta.url), "..");
/** 지역 코드표 — `--region seoul|gyeonggi|all` (기본 seoul). 이름 충돌 없음(서울=구, 경기=시/구). */
// 인천은 2026-09-01 에 붙였다(학군지 카드의 송도·부평). 코드표에 개편 대상 구(중·동·서)는
// 일부러 없다 — 자세한 이유는 data/lawd-incheon.json 의 주석 참고. 청라(서구)는 그래서 빠진다.
const REGION_FILES: Record<string, string> = {
  seoul: "lawd-seoul.json",
  gyeonggi: "lawd-gyeonggi.json",
  incheon: "lawd-incheon.json",
};
const loadCodes = (f: string) =>
  JSON.parse(readFileSync(join(HERE, "data", f), "utf8")).codes as Record<string, string>;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const key = process.env.MOLIT_API_KEY;
  if (!key) {
    console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }
  const regionArg = arg("region") ?? "seoul";
  const regions = regionArg === "all" ? Object.keys(REGION_FILES) : regionArg.split(",").map((s) => s.trim());
  const LAWD: Record<string, string> = {};
  for (const r of regions) {
    const f = REGION_FILES[r];
    if (!f) { console.error(`알 수 없는 region: ${r} (seoul|gyeonggi|incheon|all)`); process.exit(1); }
    Object.assign(LAWD, loadCodes(f));
  }
  const guArg = arg("gu") ?? "강남구";
  const monthsArg = arg("months");
  if (!monthsArg) {
    console.error("사용법: [--region seoul|gyeonggi|incheon|all] --gu 강남구,서초구|all --months 202606,202607 [--out dir] [--force]");
    process.exit(1);
  }
  const guList = guArg === "all" ? Object.keys(LAWD) : guArg.split(",").map((s) => s.trim());
  const months = monthsArg.split(",").map((s) => s.trim());
  const outDir = resolve(CWD, arg("out") ?? "data/datasets/molit");
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
        const raw = await fetchAptTradesMonth(code, ym, key);
        const trades = validTrades(raw);
        writeFileSync(
          outPath,
          JSON.stringify(
            {
              meta: {
                gu, lawdCd: code, dealYmd: ym,
                source: "국토교통부 아파트 매매 실거래가 상세자료 (getRTMSDataSvcAptTradeDev)",
                sourceUrl: "https://www.data.go.kr",
                collectedAt: new Date().toISOString().slice(0, 10),
                count: trades.length, rawCount: raw.length,
                verified: true,
                note: "API 응답 원본을 코드로 정규화(해제 거래 제외). 1차 출처.",
              },
              trades,
            },
            null,
            2,
          ) + "\n",
        );
        console.log(`✅ ${gu} ${ym} — 유효 ${trades.length}건 (원본 ${raw.length}) → ${code}-${ym}.json`);
        ok++; totalTx += trades.length;
      } catch (e) {
        console.error(`❌ ${gu} ${ym}: ${e instanceof Error ? e.message : e}`);
        failed++;
      }
    }
  }
  console.log(`\n요약: 수집 ${ok} · 스킵 ${skip} · 실패 ${failed} · 거래 ${totalTx.toLocaleString()}건`);
  if (ok === 0 && failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
