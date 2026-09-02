#!/usr/bin/env node
/**
 * 🔍 「같은 값에서 출발한 두 단지」 짝 찾기
 *
 *   node scripts/find-gap-pairs.mjs [--base 201911-202003] [--now 202603-202608]
 *                                   [--tol 5] [--min-gap 3] [--limit 40] [--json]
 *
 * ── 무엇을 하나 (오너 2026-09-02 확정)
 * 1,000세대 이상 명부 단지의 **전용 59·84 를 한 풀에 섞어** 놓고,
 * 기준창(2019-11~2020-03) 최고가가 **±5% 안에서 겹치는 두 칸**을 모은다.
 * 그 다음 최근창(최근 6개월) 최고가의 **금액 차이(억)**로 줄을 세운다.
 *
 * ⚠️ **평형을 섞는 것은 오너의 결정이다.** "한 지역의 59와 다른 지역의 84가 같은 값이었을
 *    수도 있다" — 그래서 이 카드가 말하는 것은 「같은 집끼리의 비교」가 **아니라**
 *    **「그때 같은 돈이면 살 수 있던 두 집」**이다. 그러므로 카드·캡션은
 *    **두 단지의 평형을 반드시 함께 적는다.** 평형을 빼면 그 순간 오보가 된다.
 *
 * ── 어디서 읽나
 * `data/datasets/molit-monthly/{구}/{연월}.json` — 「구 × 월」 캐시. **API 를 부르지 않는다.**
 * 캐시에 없는 달은 **모른다**로 다룬다(0원이 아니다). 두 창 중 한쪽이라도 비면 그 칸은 던진다.
 *
 * ── 던지는 칸 (오보 방지)
 *   · 기준창에 거래가 없다 → 출발점을 모른다
 *   · 최근창에 거래가 없다 → 지금 값을 모른다(오래된 값으로 「안 올랐다」고 말하지 않는다)
 *   · 같은 단지끼리의 짝(59 vs 84) → 맞대결이 아니라 한 단지의 평형 비교다
 *   · **거래가 얇은 칸** → 아래 참고
 *
 * ── ⚠️ 거래 두께 가드 (2026-09-02 실측으로 붙였다)
 * 첫 결과에 `분당 이매촌(삼성) 25평` 이 2.42배로 올라왔다. 실제 캐시를 열어 보니
 * **기준창 다섯 달 중 거래가 있던 달이 하나**(2020-02 · **1건** · 5층 6.40억)였고,
 * 최근창도 달마다 1건씩인데 값이 **15.48 → 12.08 → 14.60억**으로 3억 넘게 출렁였다.
 * 저층 한 건을 「그 단지의 값」으로 삼으면 배수가 통째로 흔들린다.
 *
 * 그래서 두 창 모두 **거래가 있던 달 2개 이상 · 거래 3건 이상**을 요구한다.
 * (신고가 카드의 「관측 15개월 미만은 던진다」와 같은 취지 — 할 말이 없는 그림은 안 그린다.)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => join(ROOT, p);
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

const MONTH_DIR = R("data/datasets/molit-monthly");
const [BASE_FROM, BASE_TO] = arg("base", "201911-202003").split("-");
const [NOW_FROM, NOW_TO] = arg("now", "202603-202608").split("-");
const TOL = Number(arg("tol", 5)) / 100;      // 기준가 유사 판정 폭
const MIN_GAP = Number(arg("min-gap", 3));    // 억 — 이보다 작은 차이는 카드가 안 된다
const LIMIT = Number(arg("limit", 40));
const MIN_MONTHS = Number(arg("min-months", 2));  // 창마다 거래가 있던 달
const MIN_TRADES = Number(arg("min-trades", 3));  // 창마다 거래 건수
/** 같은 평형끼리만 짝지을까 — 오너 기본은 **섞기**(다른 평형도 짝짓는다) */
const SAME_TYPE = process.argv.includes("--same-type");

const PYEONG = { 59: "25평", 84: "34평" };
const eok = (manwon) => manwon / 10000;
const fmtEok = (manwon) => `${eok(manwon).toFixed(1)}억`;

function monthRange(from, to) {
  const out = [];
  let y = +from.slice(0, 4), m = +from.slice(4);
  const ey = +to.slice(0, 4), em = +to.slice(4);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}${String(m).padStart(2, "0")}`);
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}

/** 그 창 안에서 각 칸의 최고가를 모은다. 캐시에 없는 달은 **건너뛴다**(0이 아니다). */
function collect(months) {
  const best = new Map();
  const monthsSeen = new Set();
  for (const lawd of readdirSync(MONTH_DIR).filter((d) => /^\d+$/.test(d))) {
    for (const ym of months) {
      const p = join(MONTH_DIR, lawd, `${ym}.json`);
      if (!existsSync(p)) continue;
      let cell;
      try { cell = JSON.parse(readFileSync(p, "utf8")); } catch { continue; }
      /* scope 가 안 적힌 칸은 무엇을 걸러 담았는지 모른다 — 안 믿는다 */
      if (cell.scope !== "universe") continue;
      monthsSeen.add(ym);
      for (const r of cell.rows ?? []) {
        const key = `${lawd}|${r.umd}|${r.apt}|${r.type}`;
        const cur = best.get(key);
        if (!cur) {
          best.set(key, {
            lawd, umd: r.umd, apt: r.apt, type: r.type,
            max: r.max, area: r.area, floor: r.floor, date: r.date, ym,
            months: 1, trades: r.count,
          });
          continue;
        }
        cur.months += 1;
        cur.trades += r.count;
        if (r.max > cur.max) { cur.max = r.max; cur.area = r.area; cur.floor = r.floor; cur.date = r.date; cur.ym = ym; }
      }
    }
  }
  return { best, monthsSeen: [...monthsSeen].sort() };
}

function main() {
  if (!existsSync(MONTH_DIR)) {
    console.error("⛔ 「구 × 월」 캐시가 없습니다 — data/datasets/molit-monthly");
    console.error("   먼저: pnpm --filter @wirit/collectors fold-month-cache  (호출 0회)");
    process.exit(1);
  }
  const uni = JSON.parse(readFileSync(R("data/datasets/apt-universe.json"), "utf8"));
  const hhldBy = new Map();
  const guBy = new Map();
  for (const it of uni.items) {
    guBy.set(it.lawdCd, it.gu);
    hhldBy.set(`${it.lawdCd}|${it.umd}|${it.kaptName}`, it.hhld);
  }

  const baseMonths = monthRange(BASE_FROM, BASE_TO);
  const nowMonths = monthRange(NOW_FROM, NOW_TO);
  const base = collect(baseMonths);
  const now = collect(nowMonths);

  /* ⚠️ 창이 통째로 비어 있으면 여기서 멈춘다. 빈 창으로 계산하면 「짝이 없다」는 답이
     나오는데, 그건 「없다」가 아니라 「모른다」다 — 그 둘을 같게 말하지 않는다. */
  if (!base.monthsSeen.length) {
    console.error(`⛔ 기준창(${BASE_FROM}~${BASE_TO})이 캐시에 한 달도 없습니다 — 백필이 아직 안 돌았습니다.`);
    console.error("   data/month-backfill-queue.txt 에 한 줄 밀고 푸시하면 돕니다.");
    process.exit(2);
  }
  if (!now.monthsSeen.length) {
    console.error(`⛔ 최근창(${NOW_FROM}~${NOW_TO})이 캐시에 한 달도 없습니다.`);
    process.exit(2);
  }

  /* 두 창에 모두 있고, 두 창 모두 **거래가 두꺼운** 칸만 남긴다 */
  const units = [];
  let thin = 0;
  for (const [key, b] of base.best) {
    const n = now.best.get(key);
    if (!n) continue;
    if (b.months < MIN_MONTHS || b.trades < MIN_TRADES || n.months < MIN_MONTHS || n.trades < MIN_TRADES) { thin++; continue; }
    const [lawd, umd, apt, type] = key.split("|");
    units.push({
      key, lawd, gu: guBy.get(lawd) ?? lawd, umd, apt, type,
      pyeong: PYEONG[type] ?? `${type}㎡`,
      danji: `${lawd}|${umd}|${apt}`,
      hhld: hhldBy.get(`${lawd}|${umd}|${apt}`) ?? null,
      base: b.max, baseDate: b.date, baseArea: b.area, baseMonths: b.months, baseTrades: b.trades,
      now: n.max, nowDate: n.date, nowArea: n.area, nowMonths: n.months, nowTrades: n.trades,
      ratio: n.max / b.max,
    });
  }
  units.sort((a, b) => a.base - b.base || a.key.localeCompare(b.key));

  /* 기준가가 ±TOL 안에서 겹치는 모든 짝. 정렬돼 있으므로 앞으로만 훑는다. */
  const pairs = [];
  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      const a = units[i], b = units[j];
      if (b.base / a.base > 1 + TOL) break;           // 더 가도 멀어지기만 한다
      if (a.danji === b.danji) continue;              // 같은 단지의 59 vs 84 는 맞대결이 아니다
      if (SAME_TYPE && a.type !== b.type) continue;
      const gap = Math.abs(a.now - b.now);
      if (eok(gap) < MIN_GAP) continue;
      const [hi, lo] = a.now >= b.now ? [a, b] : [b, a];
      pairs.push({
        hi, lo, gapManwon: gap, gapEok: +eok(gap).toFixed(2),
        baseGapPct: +(((b.base / a.base) - 1) * 100).toFixed(2),
        /* ⚠️ 평형이 다른 짝이라는 표시. 카드·캡션이 이걸 보고 반드시 평형을 함께 적는다 */
        typeMix: a.type !== b.type,
      });
    }
  }
  pairs.sort((x, y) => y.gapManwon - x.gapManwon);

  /* 카드로 쓸 목록은 **한 단지가 한 번만** 나오게 고른다.
     ⚠️ 칸(단지+평형)이 아니라 **단지**로 잡는다 — 칸으로 잡았더니 첫 결과에
     「서현동 시범현대 25평」과 「시범현대 34평」이 각각 뽑혀 같은 단지가 두 번 나왔다.
     캐러셀은 한 게시물이라 같은 이름이 두 번 넘어가면 되풀이로 읽힌다. */
  const used = new Set();
  const picks = [];
  for (const p of pairs) {
    if (used.has(p.hi.danji) || used.has(p.lo.danji)) continue;
    used.add(p.hi.danji); used.add(p.lo.danji);
    picks.push(p);
    if (picks.length >= LIMIT) break;
  }

  const meta = {
    baseWindow: `${BASE_FROM}~${BASE_TO}`,
    baseMonthsInCache: base.monthsSeen,
    nowWindow: `${NOW_FROM}~${NOW_TO}`,
    nowMonthsInCache: now.monthsSeen,
    tolerancePct: TOL * 100,
    minGapEok: MIN_GAP,
    minMonthsPerWindow: MIN_MONTHS,
    minTradesPerWindow: MIN_TRADES,
    sameTypeOnly: SAME_TYPE,
    universe: uni.items.length,
    unitsBothWindows: units.length,
    unitsDroppedThin: thin,
    pairsFound: pairs.length,
    pairsTypeMixed: pairs.filter((p) => p.typeMix).length,
    picks: picks.length,
    source: "국토교통부 아파트 매매 실거래가 (「구 × 월」 캐시)",
    builtAt: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10),
    note: "전용 59·84 를 한 풀에 섞어 **가격만으로** 짝지었다. 같은 집끼리의 비교가 아니라 「그때 같은 돈이면 살 수 있던 두 집」이므로 카드는 두 단지의 평형을 반드시 함께 적는다.",
  };

  mkdirSync(R("data/datasets"), { recursive: true });
  writeFileSync(R("data/datasets/gap-pairs.json"), JSON.stringify({ meta, picks, units }, null, 0) + "\n");

  /* 사람이 읽는 판 */
  const line = (u) => `${u.gu} ${u.umd} ${u.apt} ${u.pyeong}`;
  const md = [
    `# 「같은 값에서 출발한 두 단지」 — 후보 목록`,
    ``,
    `- 기준창 **${BASE_FROM}~${BASE_TO}** (캐시에 있는 달 ${base.monthsSeen.length}개) · 최근창 **${NOW_FROM}~${NOW_TO}** (${now.monthsSeen.length}개)`,
    `- 명부 ${uni.items.length}단지 → 두 창에 모두 거래가 있는 칸 **${units.length}개** (전용 59·84 각각 한 칸)`,
    `- 거래가 얇아 던진 칸 ${thin}개 (창마다 ${MIN_MONTHS}개월·${MIN_TRADES}건 미만)`,
    `- 기준가 ±${TOL * 100}% · 지금 차이 ${MIN_GAP}억 이상 → 짝 **${pairs.length}개** · 겹치지 않게 고른 **${picks.length}개**`,
    ``,
    `> ⚠️ 평형을 섞어 짝지었다(짝 ${pairs.filter((p) => p.typeMix).length}개가 평형이 다르다).`,
    `> 「같은 집」이 아니라 **「그때 같은 돈이면 살 수 있던 두 집」**이다 — 카드는 두 평형을 반드시 함께 적는다.`,
    ``,
    `| # | 그때 | 더 간 쪽 | 덜 간 쪽 | 지금 차이 |`,
    `|--:|---|---|---|--:|`,
    ...picks.map((p, i) =>
      `| ${i + 1} | ${fmtEok(p.lo.base)} / ${fmtEok(p.hi.base)} | ${line(p.hi)} — ${fmtEok(p.hi.now)} (${p.hi.ratio.toFixed(2)}배) | ${line(p.lo)} — ${fmtEok(p.lo.now)} (${p.lo.ratio.toFixed(2)}배) | **${p.gapEok.toFixed(1)}억** |`,
    ),
    ``,
  ].join("\n");
  writeFileSync(R("data/gap-pairs.md"), md);

  console.log(md.slice(0, 4000));
  console.log(`\n→ data/datasets/gap-pairs.json · data/gap-pairs.md`);
  if (process.argv.includes("--json")) console.log(JSON.stringify(meta, null, 2));
}

main();
