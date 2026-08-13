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
  fullAptName,
  sameApt,
  manwonToEok,
  alertBody,
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
  // 오너 요청(2026-08-13): **톡에 전체 단지가 다 보이게.** 0(기본) = 전부.
  // 길면 notify-telegram 이 줄 단위로 나눠 보낸다 — 자르지 않는다.
  const topArg = Number(arg("top") ?? 0);

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
   *
   * ⚠️ 예전엔 **괄호를 지운 이름**으로 포함관계를 봤다. 그래서
   *    `상록마을(라이프2차)` → `상록마을` → 명부의 `정자상록마을우성` 에 붙었고,
   *    **남의 단지 세대수 1,762이 그대로 알림에 실렸다** (2026-08-13 오너 확인 요청 중 발견).
   *    같은 방식으로 `가락쌍용(2차)` 가 `가락쌍용1차` 에, `효자촌(현대)` 가
   *    `서현효자촌그린타운` 에 붙어 있었다.
   *    이제는 **괄호 안까지 살린 이름**으로 `sameApt` 이 판정한다 —
   *    차수가 어긋나거나 형제 이름이면 거절한다. 명부가 앞에 동 이름을 붙이는 경우
   *    (`개봉한마을` ⊃ `한마을`)는 포함관계로 그대로 통과한다.
   *    애매하면 붙이지 않는다 — 잘못 붙이면 1000세대 미만 단지가 알림에 섞인다.
   */
  function inUniverse(lawdCd: string, umdNm: string, aptNm: string): UniverseItem | null {
    const list = byGu.get(lawdCd);
    if (!list) return null;
    if (!fullAptName(aptNm)) return null;
    const sameUmd = list.filter((a) => a.umd === umdNm);
    const pool = sameUmd.length ? sameUmd : list;
    const hit = pool.filter((a) => sameApt(a.kaptName, aptNm));
    return hit.length === 1 ? hit[0] : null;
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
  // ── 실측으로 확정된 원인 (2026-08-12)
  // 실패 문구는 `fetch failed` = `UND_ERR_CONNECT_TIMEOUT apis.data.go.kr:443` —
  // **연결 자체가 안 열린다.** 오늘 오전엔 같은 API 로 4,819회를 잘 받았으니 키·권한 문제가
  // 아니라 **문이 닫히는 창**이다(KOSIS·공동주택 API 에서 이미 같은 성질을 겪었다).
  // 초 단위 재시도로는 못 넘고, 그렇다고 122번을 다 두드리면 30분을 태운다.
  // → **3번 연속 실패하면 60초 쉬고 다시 본다. 5번 쉬고도 안 열리면 접고 이유를 말한다.**
  const FAIL_STREAK_WAIT = 3;
  const DOOR_WAIT_MS = 60_000;
  const MAX_DOOR_WAITS = 5;
  let failStreak = 0;
  let doorWaits = 0;
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
        if (++failStreak >= FAIL_STREAK_WAIT) {
          if (doorWaits < MAX_DOOR_WAITS) {
            doorWaits++;
            failStreak = 0;
            console.warn(`   ⏸ ${FAIL_STREAK_WAIT}번 연속 실패 — 문이 닫힌 것으로 보고 ${DOOR_WAIT_MS / 1000}초 기다립니다 (${doorWaits}/${MAX_DOOR_WAITS})`);
            await new Promise((r) => setTimeout(r, DOOR_WAIT_MS));
            continue; // 같은 달을 다시 시도한다
          }
          bailed = true;
          console.error(
            `⛔ ${MAX_DOOR_WAITS}번(약 ${Math.round((MAX_DOOR_WAITS * DOOR_WAIT_MS) / 60000)}분) 기다렸는데도 안 열립니다 — 여기서 접습니다.\n` +
              `   (계속 두드리면 30분을 태우고도 결과는 같습니다)`,
          );
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
          doorWaits,
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

  // ── 누적 로그 — 주간 콘텐츠가 되짚을 수 있게 (2026-08-12 오너 "매주 발행 컨텐츠로 쓸거야")
  // `singo-latest.json` 은 매일 덮어쓴다. 그것만으로는 **지난 한 주를 되짚을 수가 없다.**
  // 그래서 히트를 월별 파일에 append 한다. `foundOn` 은 **우리가 확인한 날**이다 —
  // 계약일이 아니다. 실거래 신고기한이 30일이라 계약일로 주간을 자르면 주간이 텅 빈다.
  // 같은 칸이 다시 잡히면 덮어쓴다(그날의 최종 기록만 남긴다).
  const logDir = R("data/datasets/singo-log");
  mkdirSync(logDir, { recursive: true });
  const logPath = join(logDir, `${today.slice(0, 7)}.json`);
  const log: any[] = existsSync(logPath) ? JSON.parse(readFileSync(logPath, "utf8")).hits ?? [] : [];
  const seen = new Map<string, number>();
  log.forEach((h, i) => seen.set(`${h.foundOn}|${h.lawdCd}|${h.umdNm}|${h.aptNm}|${h.type}`, i));
  for (const h of hits) {
    const k = `${today}|${h.lawdCd}|${h.umdNm}|${h.aptNm}|${h.type}`;
    const rec = { foundOn: today, ...h };
    const at = seen.get(k);
    if (at === undefined) { seen.set(k, log.length); log.push(rec); }
    else log[at] = rec;
  }
  writeFileSync(
    logPath,
    JSON.stringify(
      {
        meta: {
          month: today.slice(0, 7),
          note: "매일 확인된 신고가 누적. foundOn = 우리가 확인한 날(계약일 아님). 주간 집계가 이 파일을 읽는다.",
          baselineFrom: BASELINE_FROM,
          source: "국토교통부 아파트 매매 실거래가 상세자료",
        },
        hits: log,
      },
      null,
      2,
    ) + "\n",
  );

  // 알림 문구 — 오너 요청: **단지명 + 평 + 실거래가**
  const lines: string[] = [];
  if (hits.length) {
    // ⚠️ "10억 돌파"라고 박아 뒀다가 실제로 20억을 넘은 날 그대로 나갔다(2026-08-13).
    //    선은 10억 단위지만 **넘은 값은 20억·30억일 수 있다.** 넘은 선을 그대로 적는다.
    const mlines = [...new Set(milestones.map((h) => h.milestone))].sort((a, b) => (b ?? 0) - (a ?? 0));
    const topN = topArg > 0 ? topArg : hits.length;
    const mtag = mlines.length ? ` (${mlines.map((m) => `${m}억`).join("·")} 돌파 ${milestones.length}건)` : "";
    lines.push(`🔥 오늘의 신고가 ${hits.length}건${mtag} (${today} · ${baselineLabel()} 최고가 기준)`);
    lines.push("");

    // 본문(돌파 먼저 → 신고가 전체)은 parse/singo.ts 의 alertBody 가 만든다.
    // 셀프테스트가 그 함수를 직접 붙잡고 있어서, 형식이 조용히 어긋나지 않는다.
    lines.push(...alertBody(hits, topArg, today));
  }
  // 수집이 반이라도 실패했으면 **0건이든 몇 건이든 그 사실을 먼저 말한다.**
  // 조용한 실패는 "오늘은 신고가가 없었구나"로 읽혀 그대로 오보가 된다.
  if (failed > 0) {
    const head = bailed
      ? `⛔ 실거래 API 가 계속 응답하지 않아 수집을 중단했습니다 (${Math.round((MAX_DOOR_WAITS * DOOR_WAIT_MS) / 60000)}분 대기 후) — 오늘 판정은 없습니다`
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
