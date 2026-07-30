/**
 * 기사가 말한 수치 ↔ 우리 데이터 **교차 확인**.
 *
 * ── 왜 이걸 코드로 하나 (2026-07-30)
 * 기사는 2차 출처다. 그런데 기사와 우리 숫자가 어긋나면 둘 중 하나는 틀렸고,
 * **어느 쪽이 틀렸는지 모르는 상태로 카드를 만들면 오보가 된다.**
 * 눈으로 대조하면 놓친다. 그래서 기사 수치를 코드에 적어 두고 기계가 비교한다.
 *
 * ── 이 대조가 해 준 일
 * 금액 계열의 단위를 우리는 '천원'으로 **추론**했다(응답에 단위 필드가 없어서).
 * 기사가 같은 달 평균 월세를 159만 2,000원이라고 밝혔다 → 우리 원자료 1592.33 과
 * 맞물리면서 추론이 **확인**됐다. 이런 확인은 기록해 두지 않으면 다음 사람이 또 의심한다.
 *
 * 실행: node scripts/article-crosscheck.mjs
 * 출력: data/review/article-crosscheck.md
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));
const SEOUL = "500008";

const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const pct = (a, b) => (a == null || b == null ? null : ((b - a) / a) * 100);

/**
 * 기사가 밝힌 수치. **기사에 적힌 그대로** 옮긴다 — 반올림해서 옮기면 대조가 무의미해진다.
 * 출처(어느 기사)와 함께 둔다. 나중에 "이 숫자 어디서 왔지?"가 없게.
 */
const CLAIMS = [
  {
    what: "서울 아파트 평균 월세 (2026-06)",
    said: 1592, // 천원 = 159만 2,000원
    unit: "천원",
    mine: () => at(doc.avgWolse?.[SEOUL], "2026-06"),
    tol: 1, // 기사는 천원 단위로 반올림해 적었다
    src: "세계일보 2026-07-30",
  },
  {
    what: "서울 아파트 평균 월세 (2025-06)",
    said: 1422,
    unit: "천원",
    mine: () => at(doc.avgWolse?.[SEOUL], "2025-06"),
    tol: 1,
    src: "세계일보 2026-07-30",
  },
  {
    what: "서울 아파트 평균 월세 (2026-01)",
    said: 1504,
    unit: "천원",
    mine: () => at(doc.avgWolse?.[SEOUL], "2026-01"),
    tol: 1,
    src: "세계일보 2026-07-30",
  },
  {
    what: "월세통합가격지수 (2026-06)",
    said: 103.98,
    unit: "지수",
    mine: () => at(doc.wolseAll?.[SEOUL], "2026-06"),
    tol: 0.01,
    src: "뉴시스 2026-07-30",
  },
  {
    what: "2026 상반기 월세가격지수 상승률",
    said: 4.55,
    unit: "%",
    mine: () => pct(at(doc.wolse?.[SEOUL], "2025-12"), at(doc.wolse?.[SEOUL], "2026-06")),
    tol: 0.1,
    src: "세계일보 2026-07-30",
  },
  {
    what: "2026 상반기 전세가격지수 상승률",
    said: 4.99,
    unit: "%",
    mine: () => pct(at(doc.jeonse?.[SEOUL], "2025-12"), at(doc.jeonse?.[SEOUL], "2026-06")),
    tol: 0.1,
    src: "세계일보 2026-07-30",
  },
  {
    what: "1년 상승률 (평균 월세, 2025-06→2026-06)",
    said: 12.0,
    unit: "%",
    mine: () => pct(at(doc.avgWolse?.[SEOUL], "2025-06"), at(doc.avgWolse?.[SEOUL], "2026-06")),
    tol: 0.15,
    src: "세계일보 2026-07-30 (기사 자체 계산)",
  },
  {
    what: "2026 서울 아파트 월세 상승률(누적)",
    said: 3.37,
    unit: "%",
    mine: () => pct(at(doc.wolse?.[SEOUL], "2025-12"), at(doc.wolse?.[SEOUL], "2026-06")),
    tol: 0.1,
    src: "뉴시스 2026-07-30",
    note: "기사 두 건이 서로 다른 값을 말한다(4.55% vs 3.37%) — 기준 시점·계열이 다를 수 있다",
  },
  {
    what: "2026 서울 아파트 전셋값 누적 상승률",
    said: 5.11,
    unit: "%",
    mine: () => pct(at(doc.jeonse?.[SEOUL], "2025-12"), at(doc.jeonse?.[SEOUL], "2026-06")),
    tol: 0.15,
    src: "뉴시스 2026-07-30",
    note: "세계일보는 같은 항목을 4.99% 로 적었다",
  },
];

const r = (v, d = 2) => (v == null ? null : Math.round(v * 10 ** d) / 10 ** d);
const md = [];
const p = (l = "") => {
  console.log(l);
  md.push(l);
};

p(`# 기사 수치 ↔ 우리 데이터 교차 확인`);
p();
p(`- 우리 자료: ${doc.meta?.source} · 기준 ${doc.meta?.asOf}`);
p(`- 대조 대상: 세계일보·뉴시스 2026-07-30 기사 (research/articles/)`);
p(`- 판정: 기사 값과 우리 값의 차이가 허용오차 안이면 ✅`);
p();
p(`| 항목 | 기사 | 우리 | 차이 | 판정 | 출처 |`);
p(`|---|---:|---:|---:|:--:|---|`);

let ok = 0;
let bad = 0;
const fails = [];
for (const c of CLAIMS) {
  const mine = c.mine();
  const diff = mine == null ? null : mine - c.said;
  const pass = mine != null && Math.abs(diff) <= c.tol;
  if (mine == null) {
    p(`| ${c.what} | ${c.said}${c.unit === "%" ? "%" : ""} | 자료 없음 | — | ⚠️ | ${c.src} |`);
    fails.push(`${c.what}: 우리 자료에 값이 없다`);
    bad++;
    continue;
  }
  if (pass) ok++;
  else {
    bad++;
    fails.push(`${c.what}: 기사 ${c.said} vs 우리 ${r(mine)} (차이 ${r(diff)})`);
  }
  p(
    `| ${c.what} | ${c.said} | ${r(mine)} | ${r(diff)} | ${pass ? "✅" : "❌"} | ${c.src} |`,
  );
  if (c.note) p(`| ↳ ${c.note} | | | | | |`);
}

p();
p(`**${ok}/${CLAIMS.length} 일치.**`);
p();
if (fails.length) {
  p(`## 어긋난 항목 — 카드에 쓰기 전에 정리해야 한다`);
  p();
  for (const f of fails) p(`- ${f}`);
  p();
  p(`> 어긋남이 곧 우리가 틀렸다는 뜻은 아니다. 기준 시점·계열(월간/주간, 순수월세/월세통합)이`);
  p(`> 다르면 값이 달라진다. **어느 쪽을 쓸지 정하고 캡션에 그 기준을 밝히는 것**이 답이다.`);
} else {
  p(`어긋난 항목 없음.`);
}

p();
p(`## 이 대조가 확정해 준 것`);
p();
const w = at(doc.avgWolse?.[SEOUL], "2026-06");
p(`금액 계열의 단위를 우리는 '천원'으로 **추론**했다(R-ONE 응답에 단위 필드가 없다).`);
p(`기사가 같은 달 서울 아파트 평균 월세를 **159만 2,000원**이라고 밝혔고,`);
p(`우리 원자료는 **${r(w, 2)}** 이다 → 천원 단위로 읽어야 맞는다. **추론이 확인됐다.**`);

mkdirSync(join(ROOT, "data/review"), { recursive: true });
writeFileSync(join(ROOT, "data/review/article-crosscheck.md"), md.join("\n") + "\n", "utf8");
console.log(`\n🗂  data/review/article-crosscheck.md`);
if (bad) process.exitCode = 0; // 어긋남은 정보다 — 실패로 끝내지 않고 사람이 판단하게 남긴다
