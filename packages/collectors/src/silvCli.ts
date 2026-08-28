/**
 * 국토부 아파트 **분양권전매** 실거래 수집 CLI (Actions에서 실행 — 네트워크·키 필요).
 *   MOLIT_API_KEY=xxx tsx src/silvCli.ts --region seoul --gu all --months 202607,202608 [--out dir] [--force]
 *
 * 산출: <out>/{LAWD}-{YYYYMM}.json — 구·월별 **거래 원본 배열**.
 *   전월세와 달리 집계가 아니라 거래를 그대로 남긴다. 카드가 묻는 것이
 *   "이 단지 이 타입이 얼마에 팔렸나"라 단지·전용면적까지 필요하기 때문이다.
 *
 * 그리고 **첫 수집에서 원본 item 한 건을 `data/silv-probe.md` 에 그대로 남긴다.**
 *   이 API 는 세션이 한 번도 실제로 불러 본 적이 없다(컨테이너는 data.go.kr 차단).
 *   태그 이름(`구분` vs `dealTypeNm` 등)은 **추측**으로 적혀 있고, 추측이 맞았는지는
 *   응답을 봐야 안다. 파서가 조용히 빈 값을 채우고 통과하는 것을 막으려는 장치다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchSilvTradesMonth } from "./sources/silv.js";
import { validSilvTrades, countByKind, type SilvTrade } from "./parse/silv.js";

const CWD = process.env.INIT_CWD || process.cwd();
const HERE = resolve(fileURLToPath(import.meta.url), "..");
const REGION_FILES: Record<string, string> = {
  seoul: "lawd-seoul.json",
  gyeonggi: "lawd-gyeonggi.json",
  // 송도(연수구)가 서울·경기 표에 없어 2026-08-28 신설. 개편 예고 구는 빠져 있다 — 파일 주석 참고.
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
  if (!key) { console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록)."); process.exit(1); }

  const regionArg = arg("region") ?? "seoul";
  const regions = regionArg === "all" ? Object.keys(REGION_FILES) : regionArg.split(",").map((s) => s.trim());
  const LAWD: Record<string, string> = {};
  for (const r of regions) {
    const f = REGION_FILES[r];
    if (!f) { console.error(`알 수 없는 region: ${r} (seoul|gyeonggi|incheon|all)`); process.exit(1); }
    Object.assign(LAWD, loadCodes(f));
  }

  const guArg = arg("gu") ?? "all";
  const monthsArg = arg("months");
  if (!monthsArg) {
    console.error("사용법: [--region seoul|gyeonggi|incheon|all] --gu all|강남구,마포구 --months 202607,202608 [--out dir] [--force]");
    process.exit(1);
  }
  const guList = guArg === "all" ? Object.keys(LAWD) : guArg.split(",").map((s) => s.trim());
  const months = monthsArg.split(",").map((s) => s.trim());
  const outDir = resolve(CWD, arg("out") ?? "data/datasets/silv");
  const probePath = resolve(CWD, arg("probe") ?? "data/silv-probe.md");
  const force = process.argv.includes("--force");
  mkdirSync(outDir, { recursive: true });

  let ok = 0, skip = 0, failed = 0, totalTx = 0;
  const kindTotal = { 분양권: 0, 입주권: 0, 미상: 0 };
  let sample = "";
  let sampleFrom = "";

  for (const gu of guList) {
    const code = LAWD[gu];
    if (!code) { console.warn(`⚠️ 알 수 없는 구: ${gu}`); failed++; continue; }
    for (const ym of months) {
      const outPath = join(outDir, `${code}-${ym}.json`);
      if (existsSync(outPath) && !force) { console.log(`· 캐시 스킵 ${gu} ${ym}`); skip++; continue; }
      try {
        const { trades, totalCount, sampleItem } = await fetchSilvTradesMonth(code, ym, key);
        const valid = validSilvTrades(trades);
        const kinds = countByKind(trades);
        kindTotal.분양권 += kinds.분양권;
        kindTotal.입주권 += kinds.입주권;
        kindTotal.미상 += kinds.미상;
        if (!sample && sampleItem) { sample = sampleItem; sampleFrom = `${gu} ${ym}`; }

        writeFileSync(
          outPath,
          JSON.stringify(
            {
              meta: {
                gu, lawdCd: code, dealYmd: ym,
                source: "국토교통부 아파트 분양권전매 실거래가 (getRTMSDataSvcSilvTrade)",
                sourceUrl: "https://www.data.go.kr/data/15126471/openapi.do",
                collectedAt: new Date().toISOString().slice(0, 10),
                verified: true,
                totalCount,
                counts: { raw: trades.length, valid: valid.length, ...kinds },
                unit: { price: "만원", area: "㎡(전용)" },
                note: "분양권과 입주권은 다른 물건이다(청약 당첨분 vs 조합원분) — kind 로 갈라 쓴다. 해제 거래는 canceled=true 로 남겨 두되 집계에서 뺀다. 프리미엄은 여기 값만으로 못 구한다: 같은 타입 분양가가 있어야 뺄 수 있다.",
              },
              trades,
            },
            null,
            2,
          ) + "\n",
        );
        console.log(`✅ ${gu} ${ym} — ${valid.length}건 (분양권 ${kinds.분양권}/입주권 ${kinds.입주권}/미상 ${kinds.미상}) → ${code}-${ym}.json`);
        ok++; totalTx += valid.length;
      } catch (e) {
        console.error(`❌ ${gu} ${ym}: ${e instanceof Error ? e.message : e}`);
        failed++;
      }
    }
  }

  // ── 태그 대조표 — 추측한 파서가 맞았는지 사람이 1초에 보게 한다
  if (sample) {
    const guessed = kindTotal.미상;
    const known = kindTotal.분양권 + kindTotal.입주권;
    const verdict = known === 0
      ? "🔴 구분 칸을 **하나도 못 읽었다** — 태그 이름이 틀렸다. 아래 원본에서 실제 이름을 찾아 parse/silv.ts 의 toKind 후보에 넣을 것"
      : guessed > known
        ? "🟠 '미상'이 더 많다 — 값 표기가 예상과 다르다. 아래 원본 확인"
        : "🟢 구분 칸을 읽고 있다";
    writeFileSync(
      probePath,
      [
        "# 분양권전매 API — 응답 태그 대조",
        "",
        `- 실행: ${new Date().toISOString().slice(0, 10)} · 표본: ${sampleFrom}`,
        `- 구분 집계: 분양권 ${kindTotal.분양권} · 입주권 ${kindTotal.입주권} · 미상 ${kindTotal.미상}`,
        `- 판정: ${verdict}`,
        "",
        "> 이 파일이 있는 이유: 세션 컨테이너는 data.go.kr 이 막혀 있어 이 API 를 한 번도",
        "> 직접 불러 본 적이 없다. 파서의 태그 이름은 **매매 API 에서 유추한 것**이고,",
        "> 유추가 맞았는지는 응답을 봐야 안다. 파서가 빈 값을 채우고 조용히 통과하는 것을 막는다.",
        "",
        "## 원본 item 한 건",
        "",
        "```xml",
        sample,
        "```",
        "",
      ].join("\n"),
    );
    console.log(`\n🔎 태그 대조표 → ${probePath}`);
    console.log(`   ${verdict}`);
  }

  console.log(`\n요약: 수집 ${ok} · 스킵 ${skip} · 실패 ${failed} · 유효거래 ${totalTx.toLocaleString()}건`);
  if (ok === 0 && failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });

export type { SilvTrade };
