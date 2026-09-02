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
import { validTrades, explainApiError, type AptTrade } from "./parse/molit.js";
import {
  foldPeaks,
  findSingo,
  areaType,
  pickUniverse,
  manwonToEok,
  alertBody,
  PEAK_SCHEMA,
  BASELINE_FROM,
  baselineLabel,
  type PeakIndex,
  type SingoHit,
} from "./parse/singo.js";
import { jibunFromAddr, normJibun } from "./parse/aptInfo.js";
import { foldMonth, needsRefresh } from "./parse/monthCache.js";
import { hasMonth, writeMonth } from "./monthCacheIo.js";
import { singoRegions, monthRange } from "./sources/singoRegions.js";
import { inspectKey, describeKey } from "./keyHygiene.js";

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
  /* 키는 **다듬어서** 쓴다 — Secrets 에 딸려 들어간 줄바꿈은 화면에 안 보이는데
     그대로 실으면 서버가 "모르는 키"라고 답한다(2026-08-19 추적). 값은 안 찍고 모양만 찍는다. */
  const kr = inspectKey(process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_API_KEY);
  const key = kr.key || undefined;
  if (key) console.log(describeKey("MOLIT_API_KEY", kr));
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

  /* ── 지번 조회판 (2026-08-25 오너 승인)
   *
   * 이름으로 못 잇는 단지가 **명부의 43%** 였다(실측 2026-08-25):
   *   실거래 「위례24단지(꿈에그린)」 ↔ 대장 「송파꿈에그린아파트」 — 어떤 규칙으로도 안 맞는다.
   *   「SK북한산시티아파트」↔「에스케이북한산시티」, 「수원SK스카이뷰」↔「수원 SK SKY VIEW」…
   * 그런데 **지번은 흔들리지 않는다.** 대장 주소에 들어 있다(장지동 901).
   * 이름 → 실패 시 지번, 두 단계로 잇는다. 실측 652 → 834개(56.8% → 72.7%).
   *
   * ⚠️ **한 지번에 명부 단지가 둘 이상이면 버린다(null).** 어느 쪽인지 모르는 채로 붙이면
   *    그게 상록마을 사고다 — 남의 단지 세대수가 알림에 실린다. 못 잇는 편이 낫다.
   * ⚠️ 지번은 `apt-hhld.json` 의 주소에서 뽑는다. 명부(apt-universe)에는 주소가 없다. */
  const hhldPath = R("data/datasets/apt-hhld.json");
  const byKapt = existsSync(hhldPath)
    ? (JSON.parse(readFileSync(hhldPath, "utf8")).byKapt as Record<string, { addr?: string }>)
    : {};
  const byJibun = new Map<string, UniverseItem | null>();
  for (const it of uniItems) {
    const j = jibunFromAddr(byKapt[it.kaptCode]?.addr ?? "");
    if (!j) continue;
    const k = `${it.lawdCd}|${it.umd}|${j}`;
    byJibun.set(k, byJibun.has(k) ? null : it); // 겹치면 버린다
  }
  const jibunDupes = [...byJibun.values()].filter((v) => v === null).length;
  console.log(
    `명부 지번 조회판 ${byJibun.size - jibunDupes}칸 (지번 겹쳐 버린 것 ${jibunDupes}칸)`,
  );

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
  function inUniverse(
    lawdCd: string,
    umdNm: string,
    aptNm: string,
    jibun?: string | null,
  ): UniverseItem | null {
    const list = byGu.get(lawdCd);
    if (!list) return null;
    /* ⚠️ **이름은 같은 법정동 안에서만 잇는다** (2026-08-26).
       예전엔 그 동에 명부 단지가 하나도 없으면 **구 전체**를 뒤졌다(`sameUmd.length ? sameUmd : list`).
       그게 이번 달에 세 번, **전부 남의 단지에** 붙었다:
         · 신동아(동작구 **본동** 481, 765세대) → 신동아리버파크(**노량진동**, 1,696세대)
           → 1000세대 미만 단지가 명부를 통과해 **08-26 알림 20건 중 1건이 오보였다**
         · 미성(은평구 **신사동** 140-1) → 미성아파트(불광동)(**불광동**, 1,340세대)
           → 08-25 에 "카드를 만들다 만" 그 단지다. 못 만든 게 아니라 **애초에 다른 단지**였다
         · 현대3차(영등포구 **문래동5가** 21) → 대림현대3차(**대림동**, 1,162세대)
       **한 건도 옳게 이은 적이 없다.** 이 폴백은 지우는 것이 맞다.
       동이 다른데 이름이 비슷한 것은 **형제 단지가 아니라 남**이다 — 서울 한 구에
       `신동아`·`미성`·`현대N차` 는 여러 동에 흩어져 있다.
       못 이은 것은 아래 **지번**이 받는다. 지번도 `동|지번` 키라 동을 넘지 않는다.
       ⚠️ 되살리고 싶으면 위 세 건부터 다시 본다 — 「명부가 커진다」는 이유로는 안 된다.
          잘못 이으면 커지는 게 아니라 **틀린다**. */
    /* 판단은 `parse/singo.ts` 의 **`pickUniverse` 하나**가 한다 — 여기선 재료만 모은다.
       이름과 지번을 **서로 검사**시키는 규칙이 그 안에 있고, 자가검사가 그것을 잰다
       (2026-09-02 하계동 284 「청구」 → 「하계학여울청구」 오매칭). */
    const sameUmd = list.filter((a) => a.umd === umdNm);
    const j = normJibun(jibun ?? "");
    const byJ = j ? byJibun.get(`${lawdCd}|${umdNm}|${j}`) : null;
    return pickUniverse(aptNm, sameUmd, byJ);
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
        /* ── 📦 「구 × 월」 캐시도 **같이** 채운다 (2026-09-02)
         *
         * 이 응답은 곡선 수집기가 받는 것과 **완전히 같은 것**이다 — 그 구의 그 달 전체 거래.
         * 지금까지는 「역대 최고가 한 줄」로만 접고 나머지를 버렸고, 그래서 곡선을 그릴 때마다
         * 같은 달을 다시 받아야 했다(단지 19곳이면 약 1,500회 · 아침 알림 전체가 122회다).
         *
         * **추가 호출은 0회다.** 이미 손에 있는 것을 한 번 더 접어 두는 것뿐이다.
         * 하루가 지날수록 캐시가 저절로 자라고, 그만큼 곡선이 국토부를 덜 부른다. */
        if (uniReady && needsRefresh(ym, today, hasMonth(lawdCd, ym))) {
          writeMonth(lawdCd, ym, foldMonth(raw, (umd, apt, jibun) => !!inUniverse(lawdCd, umd, apt, jibun)));
        }
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        if (failNotes.length < 5) failNotes.push(`${gu} ${ym}: ${msg.slice(0, 120)}`);
        console.error(`⚠️ ${gu} ${ym} 수집 실패: ${explainApiError(msg)}`);
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
        const u = inUniverse(lawdCd, t.umdNm, t.aptNm, t.jibun);
        if (u) inUni.push({ t, u });
      }
      const found = findSingo(idx.peaks, lawdCd, gu, inUni.map((x) => x.t));
      for (const h of found) {
        const u = inUniverse(lawdCd, h.umdNm, h.aptNm, h.jibun);
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
    // ⚠️ "**새로 확인된**" 이 다섯 글자가 빠져 있어서 오너가 두 번 되물었다 (2026-08-24).
    //    목록의 계약일이 흩어져 보이는 것은 며칠치를 모아 보내서가 아니라 신고기한(최대 30일)
    //    탓인데, 문구가 그걸 안 적으니 읽는 사람이 알 길이 없었다. **재는 것과 말하는 것을 맞춘다.**
    lines.push(`🔥 오늘 새로 확인된 신고가 ${hits.length}건${mtag} (${today} · ${baselineLabel()} 최고가 기준)`);
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

  /* ── 한 건도 못 받았으면 **실패로 끝낸다** (2026-08-19) ──
   *
   * 지금까지는 문이 완전히 닫혀 수집 0회여도 종료코드가 0이라 워크플로가 **초록불**이었다.
   * 텔레그램 본문에는 "⛔ … 오늘 판정은 없습니다"라고 크게 적혀 나갔지만 Actions 목록과
   * 관제탑에는 아무 표시가 없어, **오너가 알림 본문을 끝까지 읽어야만** 알 수 있었다.
   * 실제로 08-12·13·15·18·19 다섯 번이 그렇게 지나갔고, 오너가 알림을 읽고서야 물었다.
   *
   * 저장소 규칙: 초록불은 "일을 했다"는 뜻이어야지 "죽지 않고 끝났다"는 뜻이면 안 된다.
   *
   * 일부만 실패한 날(fetched > 0)은 그대로 0 으로 끝낸다 — 판정이 불완전할 뿐 데이터는 왔고
   * 그 사실은 위에서 이미 알림 첫 줄로 말한다. 부분 실패까지 빨간불로 만들면 빨간불이 흔해져
   * 안 읽히게 된다(맞는 것을 매번 지적하면 지적을 안 읽는다).
   */
  if (fetched === 0 && failed > 0) {
    console.error(
      `\n❌ 실거래 API 에서 한 건도 받지 못했습니다 (${failed}회 시도 전부 실패) — 오늘 판정은 없습니다.\n` +
        `   알림은 이미 나갔지만, 수집이 0건인 날을 초록불로 끝내지 않습니다.\n` +
        `   첫 실패 사유: ${failNotes[0] ?? "(기록 없음)"}\n` +
        `   ↳ 403/401 이면 공공데이터포털 마이페이지에서 **활용신청 상태와 만료일**을 확인하세요.`,
    );
    process.exit(1);
  }

  for (const h of hits.slice(0, 15)) {
    console.log(`  · ${h.gu} ${h.aptNm} ${h.pyeong} ${manwonToEok(h.priceManwon)} (전용 ${h.area}㎡ ${h.floor}층 ${h.date} · 직전 ${manwonToEok(h.prevPeakManwon)} ${h.prevPeakDate} · ${h.hhld.toLocaleString("ko-KR")}세대)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
