/**
 * 전세·월세 지수에서 **말이 되는 수치**를 뽑는다 (카드 만들기 전 단계).
 *
 * ── 왜 별도 스크립트인가
 * 카드를 만들기 전에 "이 이야기가 데이터로 성립하는가"를 먼저 봐야 한다.
 * 성립하지 않는 이야기에 디자인을 얹는 건 가장 비싼 낭비다.
 * 여기서 나온 수치만 카드 빌더로 넘어간다 — 눈으로 읽은 숫자는 넘어가지 않는다.
 *
 * ── 오너가 잡은 각도 (2026-07-29)
 *   "월세가 평생 안 오르다가 전세 관련 정책 후 폭등하기 시작했다"
 * 이걸 우리 수치로 검증한다. 남의 게시물 숫자는 옮기지 않는다 —
 * 옮기면 그 사람 실수까지 옮긴다.
 *
 * ── 기준선
 * 임대차 2법(계약갱신청구권·전월세상한제) 시행 = **2020년 7월 31일**.
 * 정치 언어 대신 날짜와 제도명을 쓴다. 선을 긋고 전후를 보여주면 독자가 판단한다.
 *
 * 실행: node scripts/analyze-rent-index.mjs [지역코드]
 * 출력: 사람이 읽는 표 + data/review/rent-index.audit.json (수치 감사용)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "data/datasets/reb-rent-index.json");

/** 서울 = R-ONE 지역코드 500008. 이름으로 집지 않는다 — 동명 구가 여럿이다. */
const SEOUL = process.argv[2] || "500008";
/** 임대차 2법 시행 */
const LAW = { ym: "2020-07", label: "2020년 7월 임대차 2법 시행" };

const doc = JSON.parse(readFileSync(SRC, "utf8"));
const name = doc.regionNames?.[SEOUL] || SEOUL;

/** 계열에서 한 달 값 (없으면 null) */
const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const months = (s) => Object.keys(s || {}).sort();
const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;

/** 연도별 12월 → 다음해 12월 변화율(%). 12월이 없으면 그 해는 건너뛴다. */
function yearlyChanges(s) {
  const out = [];
  const ys = [...new Set(months(s).map((m) => Number(m.slice(0, 4))))].sort();
  for (const y of ys) {
    const prev = at(s, `${y - 1}-12`);
    const cur = at(s, `${y}-12`);
    if (prev == null || cur == null) continue;
    out.push({ year: y, pct: r2(((cur - prev) / prev) * 100) });
  }
  return out;
}

/** 기간 총변화율(%)과 연평균(CAGR, %) */
function span(s, fromYm, toYm) {
  const a = at(s, fromYm);
  const b = at(s, toYm);
  if (a == null || b == null) return null;
  const yrs = (Number(toYm.slice(0, 4)) * 12 + Number(toYm.slice(5)) - (Number(fromYm.slice(0, 4)) * 12 + Number(fromYm.slice(5)))) / 12;
  return {
    from: fromYm,
    to: toYm,
    fromValue: r1(a),
    toValue: r1(b),
    totalPct: r1(((b - a) / a) * 100),
    yearsSpan: r1(yrs),
    cagrPct: yrs > 0 ? r2((Math.pow(b / a, 1 / yrs) - 1) * 100) : null,
  };
}

/** 사상 최고치와 그 달 · 지금이 최고인가 */
function peak(s) {
  const ms = months(s);
  if (!ms.length) return null;
  let best = ms[0];
  for (const m of ms) if (s[m] > s[best]) best = m;
  const last = ms[ms.length - 1];
  return {
    peakYm: best,
    peakValue: r1(s[best]),
    lastYm: last,
    lastValue: r1(s[last]),
    isNowPeak: best === last,
    fromPeakPct: r1(((s[last] - s[best]) / s[best]) * 100),
  };
}

/** 최저점 이후 회복률 — 전세가 얼마나 되돌아왔나 */
function trough(s, sinceYm) {
  const ms = months(s).filter((m) => m >= sinceYm);
  if (!ms.length) return null;
  let low = ms[0];
  for (const m of ms) if (s[m] < s[low]) low = m;
  const last = ms[ms.length - 1];
  return { troughYm: low, troughValue: r1(s[low]), sinceTroughPct: r1(((s[last] - s[low]) / s[low]) * 100) };
}

/** 한 계열을 통째로 요약 */
function summarize(label, s) {
  const ms = months(s);
  if (!ms.length) return { label, empty: true };
  const first = ms[0];
  const last = ms[ms.length - 1];
  const yc = yearlyChanges(s);

  // 정책 시행 전/후를 같은 길이로 잘라 비교한다 — 길이가 다르면 비교가 아니다
  const before = span(s, first, LAW.ym);
  const after = span(s, LAW.ym, last);

  // "안 올랐다"를 검증: 시행 전 구간의 연도별 변화가 실제로 0% 근처였나
  const beforeYears = yc.filter((x) => x.year < 2020);
  const afterYears = yc.filter((x) => x.year >= 2020);
  const avg = (a) => (a.length ? r2(a.reduce((n, x) => n + x.pct, 0) / a.length) : null);

  return {
    label,
    range: { first, last, months: ms.length },
    peak: peak(s),
    before,
    after,
    yearly: yc,
    beforeLaw: {
      years: beforeYears.length,
      avgYearlyPct: avg(beforeYears),
      maxYearlyPct: beforeYears.length ? Math.max(...beforeYears.map((x) => x.pct)) : null,
      minYearlyPct: beforeYears.length ? Math.min(...beforeYears.map((x) => x.pct)) : null,
      negativeYears: beforeYears.filter((x) => x.pct < 0).length,
    },
    afterLaw: {
      years: afterYears.length,
      avgYearlyPct: avg(afterYears),
      negativeYears: afterYears.filter((x) => x.pct < 0).length,
    },
  };
}

const series = {
  전세: doc.jeonse?.[SEOUL],
  월세: doc.wolse?.[SEOUL],
  월세통합: doc.wolseAll?.[SEOUL],
};

const out = {
  _: "전세·월세 지수 분석 — 카드로 넘어갈 수치의 감사 기록. 손으로 고치지 말 것.",
  region: { code: SEOUL, name },
  source: doc.meta?.source,
  tables: doc.meta?.tables,
  asOf: doc.meta?.asOf,
  lawLine: LAW,
  series: {},
};

console.log(`📊 ${name} (코드 ${SEOUL}) · 자료 기준 ${doc.meta?.asOf}`);
console.log(`   기준선: ${LAW.label}\n`);

for (const [label, s] of Object.entries(series)) {
  const sum = summarize(label, s);
  out.series[label] = sum;
  if (sum.empty) {
    console.log(`— ${label}: 자료 없음`);
    continue;
  }
  console.log(`── ${label} (${sum.range.first} ~ ${sum.range.last}, ${sum.range.months}개월)`);
  console.log(`   사상 최고: ${sum.peak.peakYm} ${sum.peak.peakValue}` +
    (sum.peak.isNowPeak ? "  ← 지금이 최고" : `  (현재 ${sum.peak.lastValue}, 최고 대비 ${sum.peak.fromPeakPct}%)`));
  if (sum.before) {
    console.log(`   시행 전 ${sum.before.from}→${sum.before.to}: ${sum.before.totalPct}% (${sum.before.yearsSpan}년 · 연평균 ${sum.before.cagrPct}%)`);
  }
  if (sum.after) {
    console.log(`   시행 후 ${sum.after.from}→${sum.after.to}: ${sum.after.totalPct}% (${sum.after.yearsSpan}년 · 연평균 ${sum.after.cagrPct}%)`);
  }
  console.log(`   시행 전 연도별 평균 ${sum.beforeLaw.avgYearlyPct}% (하락한 해 ${sum.beforeLaw.negativeYears}/${sum.beforeLaw.years})`);
  console.log(`   시행 후 연도별 평균 ${sum.afterLaw.avgYearlyPct}% (하락한 해 ${sum.afterLaw.negativeYears}/${sum.afterLaw.years})`);
  console.log(`   연도별: ${sum.yearly.map((x) => `${x.year} ${x.pct > 0 ? "+" : ""}${x.pct}%`).join(" · ")}`);
  console.log("");
}

/* 전세가 무너진 구간에 월세는 어땠나 — 두 계열을 같은 창으로 비교한다.
 * 이 대비가 오너가 잡은 이야기의 심장이다. */
const j = series.전세;
const wAll = series.월세통합;
if (j && wAll) {
  const jt = trough(j, "2021-01");
  if (jt) {
    const jPeakBefore = peak(Object.fromEntries(months(j).filter((m) => m <= jt.troughYm).map((m) => [m, j[m]])));
    const w1 = at(wAll, jPeakBefore.peakYm);
    const w2 = at(wAll, jt.troughYm);
    const crash = {
      window: { from: jPeakBefore.peakYm, to: jt.troughYm },
      jeonsePct: r1(((j[jt.troughYm] - j[jPeakBefore.peakYm]) / j[jPeakBefore.peakYm]) * 100),
      wolseAllPct: w1 != null && w2 != null ? r1(((w2 - w1) / w1) * 100) : null,
      jeonseRecoveredPct: jt.sinceTroughPct,
    };
    out.crashWindow = crash;
    console.log(`── 전세가 무너진 구간 (${crash.window.from} → ${crash.window.to})`);
    console.log(`   전세 ${crash.jeonsePct}%  ·  같은 기간 월세통합 ${crash.wolseAllPct == null ? "자료 없음" : `${crash.wolseAllPct > 0 ? "+" : ""}${crash.wolseAllPct}%`}`);
    console.log(`   이후 전세는 바닥에서 ${crash.jeonseRecoveredPct}% 회복\n`);
  }
}

const dir = join(ROOT, "data/review");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "rent-index.audit.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`🗂  수치 감사 기록: data/review/rent-index.audit.json`);
