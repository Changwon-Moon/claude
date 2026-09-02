/**
 * 📦 「구 × 월」 캐시 백필 — 과거 달을 **며칠에 나눠** 채운다
 *
 *   MOLIT_API_KEY=xxx tsx src/monthBackfillCli.ts [--budget 1200] [--from 202001] [--lawd 41210]
 *
 * ── 왜 (2026-09-02)
 * 곡선은 「그 구의 그 달 전체 거래」를 받아 우리 단지만 골라낸다. 그래서 카드 19장에
 * 약 1,500회가 들었고(아침 알림 전체가 122회다), 그 하나가 하루 예산을 태워
 * 낮에는 모든 국토부 배관이 막혔다.
 *
 * 캐시가 차면 곡선은 **호출 0회**가 된다. 문제는 처음 한 번 채우는 값이다 —
 * 61구 × 79개월 = **약 4,900회**. 하루에 다 하면 오늘과 똑같은 사고가 난다.
 * 그래서 **하루 예산만큼만** 채우고 접는다. 사나흘이면 다 찬다.
 *
 * ── 규칙 셋
 * ① **오래된 달부터.** 최근 두 달은 아침 알림이 매일 덮어쓰므로 여기서 건드리지 않는다.
 * ② **예산을 넘기지 않는다.** 아침 알림(122회)을 지키는 것이 1순위다 — 그게 계정의 심장이다.
 * ③ **한 구 끝날 때마다 저장한다.** 잡이 죽어도 채운 칸은 남는다
 *    (09-02 에 곡선이 두 시간을 돌고도 커밋 전에 죽어 통째로 날아갔다).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAptTradesMonth } from "./sources/molit.js";
import { foldMonth } from "./parse/monthCache.js";
import { monthRange } from "./sources/singoRegions.js";
import { BASELINE_FROM } from "./parse/singo.js";
import { hasMonth, writeMonth } from "./monthCacheIo.js";
import { buildUniverseLookup, type UniverseItem } from "./universeIndex.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const R = (p: string) => join(ROOT, p);
const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const KEY = process.env.MOLIT_API_KEY ?? "";
if (!KEY) {
  console.error("::error::MOLIT_API_KEY 가 없습니다");
  process.exit(1);
}

/** 하루에 쓸 호출 수. 아침 알림(약 122회)과 그날의 곡선 몫을 남겨 둔다. */
const BUDGET = Number(arg("budget") ?? 1200);
const FROM = arg("from") ?? BASELINE_FROM;
/**
 * 특정 구만 — **콤마로 여럿**을 받는다(2026-09-02).
 * 격차 카드는 곡선을 그릴 구가 열두 곳이었다. 하나씩만 받으면 대기열을 열두 번 밀어야 하는데,
 * 대기열은 **마지막 줄만** 읽으므로 그건 애초에 안 되는 방법이었다.
 */
const ONLY = (arg("lawd") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
/**
 * 어디까지 채울까 — 비우면 「두 달 전」까지(정기 백필의 기본).
 *
 * ⚠️ 왜 달았나 (2026-09-02 · 「같은 값에서 출발한 두 단지」 카드)
 * 그 카드는 **기준창 다섯 달(2019-11~2020-03)과 최근 몇 달**만 있으면 된다. 그런데 백필은
 * `FROM` 부터 **끝까지** 훑으므로 `--from 201911` 을 주면 그 사이 83개월이 전부 대상이 된다
 * (61구 × 83 ≈ 5,000회 · 나흘). 창을 좁히면 **수백 회**로 끝난다.
 * 정기 백필이 어차피 며칠에 걸쳐 전부 채우므로, 이건 **급한 창만 앞당기는 손잡이**다.
 *
 * ⚠️ 넘긴 값이 「두 달 전」보다 뒤면 무시한다 — 최근 두 달은 아침 알림의 몫이고,
 *    덜 들어온 달을 캐시에 굳히면 「그 달은 원래 그만큼이었다」로 읽힌다.
 */
const TO = arg("to");

async function main() {
  const uniPath = R("data/datasets/apt-universe.json");
  if (!existsSync(uniPath)) {
    console.error("::error::명부(apt-universe.json)가 없습니다 — 캐시는 명부 단지만 담습니다");
    process.exit(1);
  }
  const lookup = buildUniverseLookup();
  if (!lookup) {
    console.error("::error::명부 조회판을 못 만들었습니다 — 덜 담긴 캐시는 오보가 됩니다. 여기서 멈춥니다");
    process.exit(1);
  }
  const items: UniverseItem[] = JSON.parse(readFileSync(uniPath, "utf8")).items ?? [];
  const lawds = [...new Set(items.map((x) => x.lawdCd))].sort();
  const gu = new Map(items.map((x) => [x.lawdCd, x.gu]));

  /* 최근 두 달은 아침 알림의 몫이다 — 여기서 건드리면 같은 것을 두 번 받는 셈이다. */
  const kst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const cur = Number(kst.slice(0, 4)) * 12 + Number(kst.slice(5, 7)) - 1;
  const cap = `${Math.floor((cur - 2) / 12)}${String(((cur - 2) % 12) + 1).padStart(2, "0")}`;
  /* `--to` 는 창을 **좁힐 때만** 듣는다. 늘려 달라는 요청은 조용히 무시하지 않고 말한다. */
  const lastYm = TO && TO < cap ? TO : cap;
  if (TO && TO > cap) {
    console.log(`ⓘ --to ${TO} 는 최근 두 달 안이라 ${cap} 까지만 채웁니다(그 두 달은 아침 알림의 몫입니다)`);
  }
  const months = monthRange(FROM, lastYm);

  const targets = ONLY.length ? lawds.filter((l) => ONLY.includes(l)) : lawds;
  /* ⚠️ 넘긴 코드가 명부에 없으면 **말한다.** 조용히 0곳으로 돌면 「빈 칸이 없다」는
     초록 메시지가 나오고, 그건 「다 찼다」로 읽힌다 — 그 둘은 다른 뜻이다. */
  const unknown = ONLY.filter((l) => !lawds.includes(l));
  if (unknown.length) console.warn(`⚠️ 명부에 없는 구 코드 ${unknown.length}개: ${unknown.join(",")}`);
  if (ONLY.length && !targets.length) {
    console.error("::error::넘긴 구 코드가 명부에 하나도 없습니다 — 여기서 멈춥니다");
    process.exit(1);
  }
  let holes = 0;
  for (const l of targets) for (const m of months) if (!hasMonth(l, m)) holes++;

  console.log(
    `📦 캐시 백필 — 구 ${targets.length}개 × ${months.length}개월(${FROM}~${lastYm})\n` +
      `   빈 칸 ${holes}개 · 오늘 예산 ${BUDGET}회`,
  );
  if (!holes) {
    console.log("✅ 빈 칸이 없습니다 — 곡선은 이제 호출 없이 그려집니다");
    return;
  }

  let used = 0;
  let filled = 0;
  let failedCalls = 0;
  let quotaHit = false;
  /* ⚠️ **첫 실패의 문구를 기록에 남긴다.** 예전 기록은 「실패 11회」만 적었다.
     그러면 로그를 열 수 없는 사람(코워크 세션은 api.github.com 이 막혀 있다)은
     한도인지·코드가 없는 건지·API 가 그 달을 안 주는 건지 구분할 수 없고,
     같은 대기열을 다시 밀어 보는 것 말고 할 수 있는 일이 없다.
     2026-09-02~03 에 오산 202607 이 세 번 실패하는 동안 실제로 그렇게 됐다. */
  let firstFail = "";

  outer: for (const ym of months) {
    /* 오래된 달부터 — 최근 달은 아침 알림이 매일 채우므로 뒤로 미룰수록 이득이다 */
    for (const lawdCd of targets) {
      if (used >= BUDGET) break outer;
      if (hasMonth(lawdCd, ym)) continue;
      try {
        const raw = await fetchAptTradesMonth(lawdCd, ym, KEY);
        used++;
        writeMonth(lawdCd, ym, foldMonth(raw, (umd, apt, jb) => !!lookup(lawdCd, umd, apt, jb)));
        filled++;
      } catch (e) {
        used++;
        failedCalls++;
        const msg = e instanceof Error ? e.message : String(e);
        /* ⚠️ 문구가 원인을 가린다 — `등록되지 않은 서비스키` 는 **일일 호출 한도**다(2026-08-16d).
           여기서 계속 두드리면 내일 몫까지 태운다. 즉시 접는다. */
        if (/SERVICE_KEY_IS_NOT_REGISTERED|LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(msg)) {
          quotaHit = true;
          console.error(
            `⛔ **일일 호출 한도**에 걸렸습니다(문구는 「등록되지 않은 서비스키」로 나오지만 키 문제가 아닙니다).\n` +
              `   여기서 접습니다 — 더 두드리면 내일 몫까지 태웁니다. 내일 예약이 이어서 채웁니다.`,
          );
          break outer;
        }
        if (!firstFail) firstFail = `${gu.get(lawdCd) ?? lawdCd} ${ym} — ${msg.slice(0, 160)}`;
        if (failedCalls <= 5) console.error(`⚠️ ${gu.get(lawdCd)} ${ym}: ${msg.slice(0, 100)}`);
      }
      await new Promise((r) => setTimeout(r, 120));
    }
    console.log(`   … ${ym} 까지 · 채움 ${filled} · 쓴 호출 ${used}/${BUDGET}`);
  }

  let left = 0;
  for (const l of targets) for (const m of months) if (!hasMonth(l, m)) left++;

  const line =
    `- 실행: ${kst} (KST)\n` +
    `- 예산: ${BUDGET}회 · 쓴 호출: ${used}회 · 채운 칸: ${filled}개 · 실패: ${failedCalls}회\n` +
    `- 남은 빈 칸: **${left}개** ${left ? `(하루 ${BUDGET}회면 약 ${Math.ceil(left / Math.max(filled || 1, 1))}일)` : "— 다 찼습니다 🎉"}\n` +
    (quotaHit ? `- ⚠️ **일일 한도**에 걸려 중간에 접었습니다(키 문제 아님)\n` : "") +
    (firstFail ? `- 첫 실패: \`${firstFail.replace(/`/g, "'")}\`\n` : "");
  writeFileSync(R("data/molit-monthly-last.md"), `# 「구 × 월」 캐시 백필 — 마지막 실행\n\n${line}`);

  console.log(`\n${line}`);
  console.log(`→ data/molit-monthly-last.md`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
