/**
 * 오늘의 신고가(기준선 이후 최고가 경신) 수집 CLI — 매일 아침 (네트워크·키 필요 → GitHub Actions).
 *
 *   MOLIT_API_KEY=xxx tsx src/molitSingoCli.ts --today 2026-08-13 [--months 2] [--top 10]
 *
 * ── 하는 일
 * ① **명부(1000세대 이상 단지)** 를 읽는다 — `data/datasets/apt-universe.json`
 * ② 대상 지역의 최근 몇 달치 실거래를 받는다(신고기한 30일이라 어제 계약이 오늘 뜨진 않는다)
 * ③ 명부에 있는 단지의 **전용 59·84 타입** 거래만 남기고, 최고가 인덱스와 대조한다
 * ④ 넘어선 것이 오늘의 신고가 — 단지명 · 평(00평) · 실거래가
 * ⑤ 인덱스를 갱신한다 — 그래야 내일은 오늘 것이 기준이 된다
 *
 * ── 판정하지 않는 것
 * · **인덱스가 아직 안 채워진 지역** — 반쪽 기준으로 "최고가"라 부르면 그게 오보다
 * · ⚠️ 기준선은 **2020-01 이후**다(오너 결정). 2006~2019 기록은 안 본다 → "역대"라고 쓰지 않는다
 * · **명부에 없는 단지** — 1000세대 미만이거나 아직 세대수를 확인 못 한 곳
 * · **직거래** — 특수관계인 거래가 섞여 시세로 읽기 어렵다. 다만 인덱스에는 넣는다.
 *   기록에서 빼면 직거래로 세워진 고점을 모르고 최고가라 부르게 되기 때문이다
 * · **전용 59·84 이외 평형** — 오너 결정(2026-08-12). 리센츠 48평 신고가는 안 잡힌다
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchAptTradesMonth } from "./sources/molit.js";
import { validTrades, type AptTrade } from "./parse/molit.js";
import {
  foldPeaks,
  findSingo,
  areaType,
  normAptName,
  manwonToEok,
  PEAK_SCHEMA,
  BASELINE_FROM,
  baselineLabel,
  type PeakIndex,
  type SingoHit,
} from "./parse/singo.js";
import { singoRegions, monthRange } from "./sources/singoRegions.js";

const CWD = process.env.INIT_CWD || process.cwd();
const R = (p: string) => resolve(CWD, p);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** today(YYYY-MM-DD) 기준 최근 n개월의 YYYYMM (오래된 것부터) */
function recentMonths(today: string, n: number): string[] {
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  let sy = y;
  let sm = m - (n - 1);
  while (sm <= 0) { sm += 12; sy--; }
  return monthRange(`${sy}${String(sm).padStart(2, "0")}`, `${y}${String(m).padStart(2, "0")}`);
}

interface UniverseItem {
  lawdCd: string; gu: string; umd: string; kaptCode: string; kaptName: string; norm: string; hhld: number;
}

async function main() {
  const key = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_API_KEY;
  if (!key) {
    console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }
  const today = arg("today") ?? new Date().toISOString().slice(0, 10);
  const nMonths = Number(arg("months") ?? 2);
  const topN = Number(arg("top") ?? 10);

  const peakDir = R("data/datasets/molit-peak");
  const uniPath = R("data/datasets/apt-universe.json");

  // ── 명부 — 없으면 판정할 대상 자체가 없다. 조용히 0건으로 넘어가지 않는다.
  const uni = existsSync(uniPath) ? JSON.parse(readFileSync(uniPath, "utf8")) : null;
  const uniItems: UniverseItem[] = uni?.items ?? [];
  const uniReady = uniItems.length > 0;

  /** 구별 명부 — 실거래 표기(법정동+단지명)로 찾기 위한 조회판 */
  const byGu = new Map<string, UniverseItem[]>();
  for (const it of uniItems) {
    if (!byGu.has(it.lawdCd)) byGu.set(it.lawdCd, []);
    byGu.get(it.lawdCd)!.push(it);
  }

  /**
   * 실거래의 (법정동, 단지명) 이 명부에 있는지.
   * 같은 법정동 + 정규화 이름 완전일치 → 없으면 포함관계 후보가 **하나뿐일 때만** 인정.
   * 애매하면 붙이지 않는다 — 잘못 붙이면 1000세대 미만 단지가 알림에 섞인다.
   */
  function inUniverse(lawdCd: string, umdNm: string, aptNm: string): UniverseItem | null {
    const list = byGu.get(lawdCd);
    if (!list) return null;
    const want = normAptName(aptNm);
    if (!want) return null;
    const sameUmd = list.filter((a) => a.umd === umdNm);
    const pool = sameUmd.length ? sameUmd : list;
    const exact = pool.filter((a) => a.norm === want);
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) return null;
    const part = pool.filter((a) => a.norm.length > 1 && (a.norm.includes(want) || want.includes(a.norm)));
    return part.length === 1 ? part[0] : null;
  }

  const regions = singoRegions();
  const months = recentMonths(today, nMonths);
  const hits: (SingoHit & { hhld: number })[] = [];
  const skipped: string[] = [];
  let fetched = 0;
  let judged = 0;
  // ⚠️ 수집이 실패한 날의 "0건"은 **"신고가가 없었다"가 아니다.** 그 둘을 같은 문구로
  //    보내면 오보다. 실패를 세어 알림에 그대로 싣는다(2026-08-12 첫 실전 실행에서
  //    실거래 API 가 느려지며 이 구멍이 드러났다).
  let failed = 0;
  const failNotes: string[] = [];
  // ⚠️ **연달아 실패하면 빨리 접는다.** 2026-08-12 첫 실전 실행이 35분을 매달려 있었다 —
  //    매일 아침 도는 일이 30분씩 붙들려 있으면 그건 실패보다 나쁘다(아무 말도 안 하니까).
  //    엔드포인트 하나가 죽으면 122번을 전부 재시도하며 30분을 태운다. 6번 연속이면 접고
  //    **왜 접었는지 말한다.**
  const FAIL_STREAK_STOP = 6;
  let failStreak = 0;
  let bailed = false;

  for (const { gu, lawdCd } of regions) {
    if (bailed) break;
    const peakPath = join(peakDir, `${lawdCd}.json`);
    if (!existsSync(peakPath)) { skipped.push(`${gu} (인덱스 없음)`); continue; }
    const idx: PeakIndex = JSON.parse(readFileSync(peakPath, "utf8"));
    if ((idx.meta.schemaVersion ?? 1) !== PEAK_SCHEMA) { skipped.push(`${gu} (인덱스 판번호 옛것)`); continue; }
    const done = new Set(idx.meta.doneMonths);

    // 이 지역의 인덱스가 기준선 시작월부터 지난달까지 **빠짐없이** 차 있는지 본다.
    // 한 달이라도 비면 그 달의 고점을 모르는 채로 "최고가"라 부르게 된다.
    const need = monthRange(BASELINE_FROM, months[months.length - 2] ?? months[0]);
    const missing = need.filter((m) => !done.has(m));
    const judgeable = missing.length === 0 && uniReady;
    if (missing.length) skipped.push(`${gu} (초기 수집 ${missing.length}개월 남음)`);
    else if (!uniReady) skipped.push(`${gu} (명부 없음)`);
    else judged++;

    const fresh: AptTrade[] = [];
    for (const ym of months) {
      if (bailed) break;
      try {
        const raw = await fetchAptTradesMonth(lawdCd, ym, key);
        fetched++;
        failStreak = 0;
        fresh.push(...raw);
        if (!done.has(ym)) { idx.meta.doneMonths.push(ym); done.add(ym); }
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        if (failNotes.length < 5) failNotes.push(`${gu} ${ym}: ${msg.slice(0, 120)}`);
        console.error(`⚠️ ${gu} ${ym} 수집 실패: ${msg}`);
        if (++failStreak >= FAIL_STREAK_STOP) {
          bailed = true;
          console.error(`⛔ ${FAIL_STREAK_STOP}번 연속 실패 — 실거래 API 가 응답하지 않는 것으로 보고 여기서 접습니다.\n   (계속 두드리면 30분을 태우고도 결과는 같습니다)`);
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    const tx = validTrades(fresh);

    if (judgeable) {
      // 전용 59·84 · 중개거래 · 명부에 있는 단지 — 세 조건을 다 만족하는 것만 판정 대상
      const target = tx.filter((t) => areaType(t.area) && t.dealingGbn !== "직거래");
      const inUni: { t: AptTrade; u: UniverseItem }[] = [];
      for (const t of target) {
        const u = inUniverse(lawdCd, t.umdNm, t.aptNm);
        if (u) inUni.push({ t, u });
      }
      const found = findSingo(idx.peaks, lawdCd, gu, inUni.map((x) => x.t));
      for (const h of found) {
        const u = inUniverse(lawdCd, h.umdNm, h.aptNm);
        hits.push({ ...h, hhld: u?.hhld ?? 0 });
      }
    }
    // 직거래·타 평형 포함 전건을 인덱스에 접어 넣는다 — 기록은 기록대로 남아야 한다
    foldPeaks(idx.peaks, lawdCd, tx);
    idx.meta.doneMonths.sort();
    idx.meta.updatedAt = today;
    writeFileSync(peakPath, JSON.stringify(idx, null, 0) + "\n");
  }

  // ── 정렬: 기본은 **거래가 큰 순**.
  // 리허설에서 갱신폭(상승률) 순으로 세워 보니 상위가 소형·저가 단지로 채워졌다. 레퍼런스
  // 카드(「잠실 리센츠 33평 36.95억」)가 말하는 소식은 그쪽이 아니다. 갱신폭은 데이터에
  // 그대로 남겨 두어(카드가 "직전 최고가 대비 +X%"로 쓸 수 있다) 언제든 바꿀 수 있게 한다.
  const sortBy = arg("sort") ?? "price";
  const byMetric = (a: SingoHit, b: SingoHit) =>
    sortBy === "gain" ? (b.gainPct ?? 0) - (a.gainPct ?? 0) : b.priceManwon - a.priceManwon;
  // ⚠️ **10억 돌파는 언제나 위로.** 상위 10건만 이름이 나가는데, "처음으로 30억을 넘었다"가
  //    더 비싼 평범한 신고가에 밀려 잘리면 그날의 진짜 소식을 놓친다.
  hits.sort((a, b) => (a.milestone ? 0 : 1) - (b.milestone ? 0 : 1) || byMetric(a, b));
  const milestones = hits.filter((h) => h.milestone);

  mkdirSync(R("data/datasets"), { recursive: true });
  writeFileSync(
    R("data/datasets/singo-latest.json"),
    JSON.stringify(
      {
        meta: {
          today,
          months,
          regions: regions.length,
          judgedRegions: judged,
          skipped,
          universe: { ready: uniReady, count: uniItems.length, minHhld: uni?.meta?.minHhld ?? null, complete: uni?.meta?.complete ?? false },
          types: ["전용 59타입 = 25평", "전용 84타입 = 34평"],
          baselineFrom: BASELINE_FROM,
          baselineLabel: baselineLabel(),
          sortBy,
          milestoneCount: milestones.length,
          fetchTried: fetched + failed,
          fetchFailed: failed,
          fetchFailNotes: failNotes,
          bailedOut: bailed,
          verified: true,
          source: "국토교통부 아파트 매매 실거래가 상세자료 · 공동주택 기본 정보(세대수)",
          note:
            `1000세대 이상 단지(명부)의 전용 59·84 타입 중개거래 중, 구·법정동·단지명 기준 ${baselineLabel()} 최고가를 넘어선 건. 2006~2019 기록은 보지 않으므로 "역대"라고 쓰지 않는다. 직거래·해제거래 제외. 평 표기는 관용 환산(전용률 미공개)이라 단지에 따라 ±1평 어긋날 수 있고 원본 전용면적을 함께 남긴다.`,
        },
        hits,
      },
      null,
      2,
    ) + "\n",
  );

  // 알림 문구 — 오너 요청: **단지명 + 평 + 실거래가**
  const lines: string[] = [];
  if (hits.length) {
    lines.push(
      `🔥 오늘의 신고가 ${hits.length}건${milestones.length ? ` (10억 돌파 ${milestones.length}건)` : ""} (${today} · ${baselineLabel()} 최고가 기준)`,
    );
    lines.push("");
    for (const h of hits.slice(0, topN)) {
      // 10억 단위 돌파는 사람이 기억하는 사건이라 한 마디 붙인다 — 나머지는 오너 요청대로 단지명+평+가격만.
      lines.push(`· ${h.aptNm} ${h.pyeong} ${manwonToEok(h.priceManwon)}${h.milestone ? ` 🎉 ${h.milestone}억 돌파` : ""}`);
    }
    if (hits.length > topN) lines.push(`… 외 ${hits.length - topN}건`);
  }
  // 수집이 반이라도 실패했으면 **0건이든 몇 건이든 그 사실을 먼저 말한다.**
  // 조용한 실패는 "오늘은 신고가가 없었구나"로 읽혀 그대로 오보가 된다.
  if (failed > 0) {
    const head = bailed
      ? `⛔ 실거래 API 가 응답하지 않아 수집을 중단했습니다 (${failed}번 연속 실패) — 오늘 판정은 없습니다`
      : `⚠️ 수집 실패 ${failed}/${fetched + failed}건 — 오늘 판정은 불완전합니다`;
    if (lines.length) lines.splice(1, 0, head);
    else lines.push(`${head} (${today})`, "", ...failNotes.map((n) => `· ${n}`));
  }
  writeFileSync(R("data/singo-alert.txt"), lines.join("\n"));

  console.log(
    `명부 ${uniItems.length}개 단지 · 판정 지역 ${judged}/${regions.length} · ` +
      `수집 성공 ${fetched}회 / 실패 ${failed}회\n` +
      `→ 오늘의 신고가 ${hits.length}건`,
  );
  if (skipped.length) console.log(`  제외: ${skipped.slice(0, 8).join(", ")}${skipped.length > 8 ? " …" : ""}`);
  for (const h of hits.slice(0, 15)) {
    console.log(`  · ${h.gu} ${h.aptNm} ${h.pyeong} ${manwonToEok(h.priceManwon)} (전용 ${h.area}㎡ ${h.floor}층 ${h.date} · 직전 ${manwonToEok(h.prevPeakManwon)} ${h.prevPeakDate} · ${h.hhld.toLocaleString("ko-KR")}세대)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
