/**
 * 한 단지·한 타입의 **월별 최고가 이력** 수집 CLI (네트워크·키 필요 → GitHub Actions).
 *
 *   MOLIT_API_KEY=xxx tsx src/molitHistoryCli.ts \
 *     --lawd 41135 --apt "상록마을(라이프2차)" --umd 정자동 --type 84 [--from 202001] [--to 202608]
 *
 * ── 왜 따로 만드나
 * 매일 도는 인덱스(`molit-peak`)는 **단지·타입별 최고가 한 줄만** 남긴다. 저장소를 키우지
 * 않으려는 설계라 "2020년부터 어떻게 올라왔나" 하는 **곡선을 그릴 수 없다.**
 * 카드에 곡선을 그리려면 그 단지만 다시 훑어야 한다 — 한 구 × 79개월 ≈ 80회 호출이면 된다.
 *
 * ── 오보를 막는 두 가지
 * ① 단지 판정은 `sameApt` 이 한다 — 괄호 안까지 보고 형제 단지를 가른다
 *    (2026-08-13 `상록마을(라이프2차)` 가 `정자상록마을우성` 에 붙었던 사고).
 * ② **한 달이라도 수집에 실패하면 그 달은 `null` 로 남긴다.** 0으로 채우면 곡선이
 *    바닥을 찍고 올라오는 그림이 되어 그 자체가 오보다.
 *
 * 결과: `data/datasets/singo-history/{lawdCd}-{슬러그}-{타입}.json`
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchAptTradesMonth } from "./sources/molit.js";
import { validTrades } from "./parse/molit.js";
import { areaType, sameApt, fullAptName, BASELINE_FROM, manwonToEok } from "./parse/singo.js";
import { monthRange } from "./sources/singoRegions.js";

const CWD = process.env.INIT_CWD || process.cwd();
const R = (p: string) => resolve(CWD, p);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

interface MonthPoint {
  ym: string;
  /** 그달 최고가(만원). 거래가 없으면 null, **수집 실패도 null** — `ok` 로 구분한다 */
  maxManwon: number | null;
  count: number;
  area: number | null;
  floor: number | null;
  date: string | null;
  /** 그달을 실제로 받아왔나. false 면 "거래 없음"이 아니라 "모른다" */
  ok: boolean;
}

async function main() {
  const key = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_API_KEY;
  if (!key) {
    console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }
  const lawdCd = arg("lawd");
  const aptNm = arg("apt");
  const umdNm = arg("umd");
  const type = arg("type") as "59" | "84" | undefined;
  if (!lawdCd || !aptNm || !type) {
    console.error('사용법: --lawd 41135 --apt "상록마을(라이프2차)" [--umd 정자동] --type 84');
    process.exit(1);
  }
  /* ⚠️ 이미 받아 둔 곡선은 다시 훑지 않는다 — 한 단지가 80회 호출이라, 대기열을 여러 줄
     처리하게 되면서(2026-08-16) 이미 있는 것까지 다시 받으면 실행이 몇 배로 늘어난다.
     새로 받고 싶으면 대기열 줄에 `force=1` 을 붙인다(워크플로가 `--force` 로 넘긴다). */
  if (!process.argv.includes("--force")) {
    const slugExist = fullAptName(aptNm);
    const outExist = R(`data/datasets/singo-history/${lawdCd}-${slugExist}-${type}.json`);
    if (existsSync(outExist)) {
      console.log(`⏭ 이미 있음 — ${outExist.split("/").pop()} (다시 받으려면 force=1)`);
      return;
    }
  }

  const from = arg("from") ?? BASELINE_FROM;
  const kst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const to = arg("to") ?? `${kst.slice(0, 4)}${kst.slice(5, 7)}`;
  const months = monthRange(from, to);

  console.log(`${aptNm} · 전용 ${type}타입 · ${lawdCd} · ${from}~${to} (${months.length}개월)`);

  // 문이 닫히는 창이 있다(UND_ERR_CONNECT_TIMEOUT). 초 단위 재시도로는 못 넘어 분 단위로 기다린다.
  const FAIL_STREAK_WAIT = 3;
  const DOOR_WAIT_MS = 60_000;
  const MAX_DOOR_WAITS = 5;
  let failStreak = 0;
  let doorWaits = 0;

  const points: MonthPoint[] = [];
  let failed = 0;

  for (const ym of months) {
    let done = false;
    while (!done) {
      try {
        const raw = await fetchAptTradesMonth(lawdCd, ym, key);
        failStreak = 0;
        const tx = validTrades(raw).filter(
          (t) =>
            areaType(t.area) === type &&
            (!umdNm || t.umdNm === umdNm) &&
            sameApt(t.aptNm, aptNm) &&
            t.dealingGbn !== "직거래",
        );
        let best: (typeof tx)[number] | null = null;
        for (const t of tx) if (!best || t.priceManwon > best.priceManwon) best = t;
        points.push({
          ym,
          maxManwon: best ? best.priceManwon : null,
          count: tx.length,
          area: best ? best.area : null,
          floor: best ? best.floor : null,
          date: best ? best.date : null,
          ok: true,
        });
        done = true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`⚠️ ${ym} 수집 실패: ${msg.slice(0, 120)}`);
        if (++failStreak >= FAIL_STREAK_WAIT && doorWaits < MAX_DOOR_WAITS) {
          doorWaits++;
          failStreak = 0;
          console.warn(`   ⏸ 문이 닫힌 것으로 보고 ${DOOR_WAIT_MS / 1000}초 기다립니다 (${doorWaits}/${MAX_DOOR_WAITS})`);
          await new Promise((r) => setTimeout(r, DOOR_WAIT_MS));
          continue; // 같은 달 재시도
        }
        // ⚠️ 실패한 달을 0 이나 직전값으로 메우지 않는다 — 곡선이 거짓말을 하게 된다.
        failed++;
        points.push({ ym, maxManwon: null, count: 0, area: null, floor: null, date: null, ok: false });
        done = true;
      }
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  const traded = points.filter((p) => p.maxManwon != null);
  const okMonths = points.filter((p) => p.ok).length;
  /* ⚠️ "거래가 없다"와 "받아오질 못했다"를 같은 문구로 말하면 엉뚱한 곳을 고치게 된다.
     2026-08-16 에 실제로 80개월 전부 수집 실패했는데 문구는 "단지명·법정동을 확인하세요"였다 —
     이름은 멀쩡했고 API 가 그 시간대에 죽어 있었던 것이다. 둘을 갈라 말한다. */
  if (!okMonths) {
    console.error(
      `⛔ ${months.length}개월을 **한 달도 받지 못했습니다** — 단지명 문제가 아니라 실거래 API 가 응답하지 않았습니다.\n` +
        `   잠시 뒤 대기열에 같은 줄을 다시 밀어 넣으세요(문이 닫히는 시간대가 있습니다).`,
    );
    process.exit(1);
  }
  if (failed) {
    console.warn(`⚠️ ${failed}/${months.length}개월을 못 받았습니다 — 그 달은 곡선에서 끊깁니다.`);
  }
  if (!traded.length) {
    console.error(
      `⛔ ${okMonths}개월을 받았지만 ${aptNm} 전용 ${type}타입 거래가 한 건도 없습니다 — ` +
        `단지명·법정동 표기를 확인하세요(실거래 신고 표기 그대로여야 합니다).`,
    );
    process.exit(1);
  }
  const peak = traded.reduce((a, b) => ((b.maxManwon as number) > (a.maxManwon as number) ? b : a));

  const outDir = R("data/datasets/singo-history");
  mkdirSync(outDir, { recursive: true });
  const slug = fullAptName(aptNm);
  const outPath = join(outDir, `${lawdCd}-${slug}-${type}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        meta: {
          lawdCd,
          umdNm: umdNm ?? null,
          aptNm,
          type,
          from,
          to,
          monthsTried: months.length,
          monthsFailed: failed,
          monthsTraded: traded.length,
          peak: { manwon: peak.maxManwon, date: peak.date, area: peak.area, floor: peak.floor },
          source: "국토교통부 아파트 매매 실거래가 상세자료",
          note:
            "월별 최고가. maxManwon=null 은 그달 거래가 없었다는 뜻이고, ok=false 면 " +
            "수집을 못 한 달이라 **거래 유무를 모른다** — 곡선에서 이 둘을 같게 그리지 않는다. " +
            "직거래 제외. 단지 판정은 sameApt(괄호 안까지 대조).",
        },
        points,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    `${outPath}\n` +
      `거래 있던 달 ${traded.length}/${months.length} · 수집 실패 ${failed}개월\n` +
      `최고가 ${manwonToEok(peak.maxManwon as number)} (${peak.date} · 전용 ${peak.area}㎡ ${peak.floor}층)`,
  );
  if (existsSync(outPath)) process.exitCode = 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
