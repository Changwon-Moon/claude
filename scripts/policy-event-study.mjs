/**
 * 제도 시점을 기준선으로 놓고 **그 전후 전월세가 어떻게 움직였나**를 센다.
 *
 * ── 왜 이 스크립트인가 (2026-07-29 오너 지시)
 * "전세의 월세화를 일으키는 제도들을 정리하고, 그것과 월세 상승률의 관계를 레버로 잡아라."
 * 제도는 하나가 아니다. 임대차 2법만 기준선으로 쓰면 그 뒤에 겹친 대출 규제들이
 * 통째로 안 보인다. 그래서 **연표의 모든 시점**에 같은 계산을 돌린다.
 *
 * ── 인과를 주장하지 않는다
 * 이건 **사건 전후 비교**다. "이 제도가 월세를 올렸다"는 인과 주장이 아니라
 * "이 시점 전후로 숫자가 이렇게 달라졌다"는 사실이다. 카드도 그렇게 써야 한다 —
 * 여러 제도와 시장 사건이 겹쳐 있어서 하나로 돌릴 수 없다. 선을 긋고 보여주면 독자가 판단한다.
 *
 * ── 창 길이를 왜 12개월로 잡나
 * 임대차 계약은 2년 단위다. 6개월은 계약 갱신 주기 안에서 노이즈만 본다.
 * 24개월은 다음 제도와 겹친다(대책이 1~2년마다 나왔다). 12개월이 타협점이고,
 * 24개월도 함께 찍어 어느 쪽이든 이야기가 성립하는지 확인한다.
 *
 * 실행: node scripts/policy-event-study.mjs [지역코드]
 * 출력: 터미널 표 + data/review/policy-event-study.md
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));
const policy = JSON.parse(readFileSync(join(ROOT, "research/policy-timeline.json"), "utf8"));

/** 서울 = R-ONE 지역코드 500008. 이름으로 집지 않는다 — 동명 구가 여럿이다. */
const CODE = process.argv[2] || "500008";
const NAME = data.regionNames?.[CODE] || CODE;

const SERIES = {
  월세지수: data.wolse?.[CODE],
  전세지수: data.jeonse?.[CODE],
  평균월세액: data.avgWolse?.[CODE],
  평균전세액: data.avgJeonse?.[CODE],
};

const ms = (s) => Object.keys(s || {}).sort();
const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const LAST = Object.values(SERIES).map((s) => ms(s).pop()).filter(Boolean).sort().pop();

/** YYYY-MM 에 n개월 더하기 */
function shift(ym, n) {
  const t = Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5)) - 1 + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
}
/** 연율화 변화율(%) — 창 길이가 다른 것을 같은 자로 재려면 필요하다 */
function annual(s, a, b) {
  const x = at(s, a);
  const z = at(s, b);
  if (x == null || z == null || x <= 0) return null;
  const yrs = (Number(b.slice(0, 4)) * 12 + Number(b.slice(5)) - (Number(a.slice(0, 4)) * 12 + Number(a.slice(5)))) / 12;
  if (yrs <= 0) return null;
  return Math.round((Math.pow(z / x, 1 / yrs) - 1) * 10000) / 100;
}
const f = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`);

const md = [];
const p = (l = "") => {
  console.log(l);
  md.push(l);
};

p(`# 제도 시점 전후 — 전월세 연율 변화 (${NAME})`);
p();
p(`- 출처: ${data.meta?.source} · 자료 기준 **${LAST}**`);
p(`- 연표: \`research/policy-timeline.json\` (verified=false 항목은 발행 전 원문 확인 필요)`);
p(`- ⚠️ **인과 주장이 아니다.** 여러 제도·시장 사건이 겹쳐 있어 하나로 돌릴 수 없다.`);
p(`  이 표는 "그 시점 전후로 숫자가 이렇게 달라졌다"는 사실만 말한다.`);
p();

const rows = [];
for (const ev of policy.events) {
  if (!ev.date) continue; // 날짜 미확인 항목은 계산하지 않는다
  const ym = ev.date.slice(0, 7);
  const row = { ev, cells: {} };
  for (const [label, s] of Object.entries(SERIES)) {
    const k = ms(s);
    if (!k.length) continue;
    // 창이 자료 범위를 벗어나면 계산하지 않는다(억지로 채우지 않는다)
    for (const w of [12, 24]) {
      const b0 = shift(ym, -w);
      const a1 = shift(ym, w);
      row.cells[`${label}/전${w}`] = b0 >= k[0] ? annual(s, b0, ym) : null;
      row.cells[`${label}/후${w}`] = a1 <= k[k.length - 1] ? annual(s, ym, a1) : null;
    }
    row.cells[`${label}/이후지금`] = ym >= k[0] ? annual(s, ym, k[k.length - 1]) : null;
  }
  rows.push(row);
}

for (const w of [12, 24]) {
  p(`## 전후 ${w}개월 · 연율 변화`);
  p();
  p(`| 시점 | 제도 | 월세지수 전→후 | 평균월세액 전→후 | 전세지수 전→후 | 평균전세액 전→후 |`);
  p(`|---|---|---|---|---|---|`);
  for (const r of rows) {
    const c = r.cells;
    const pair = (lbl) => `${f(c[`${lbl}/전${w}`])} → **${f(c[`${lbl}/후${w}`])}**`;
    const mark = r.ev.verified ? "" : " ⚠️";
    p(`| ${r.ev.date}${mark} | ${r.ev.name.split(" — ")[0].slice(0, 28)} | ${pair("월세지수")} | ${pair("평균월세액")} | ${pair("전세지수")} | ${pair("평균전세액")} |`);
  }
  p();
}

p(`## 각 시점 이후 → 지금(${LAST}) 연율`);
p();
p(`| 시점 | 제도 | 월세지수 | 평균월세액 | 전세지수 | 평균전세액 |`);
p(`|---|---|---|---|---|---|`);
for (const r of rows) {
  const c = r.cells;
  const mark = r.ev.verified ? "" : " ⚠️";
  p(`| ${r.ev.date}${mark} | ${r.ev.name.split(" — ")[0].slice(0, 28)} | ${f(c["월세지수/이후지금"])} | ${f(c["평균월세액/이후지금"])} | ${f(c["전세지수/이후지금"])} | ${f(c["평균전세액/이후지금"])} |`);
}
p();
p(`> ⚠️ 표시 = 연표에서 아직 원문 확인이 안 된 시점. 카드에 쓰기 전 확인이 필요하다.`);
p();

/* ── 레버: 월세가 전세를 앞지른 시점을 찾는다 ──
 * "언제부터 뒤집혔나"는 제도 하나를 지목하지 않고도 말할 수 있는 사실이다. */
const wj = SERIES.평균월세액;
const jj = SERIES.평균전세액;
if (wj && jj) {
  p(`## 레버 — 월세 상승이 전세 상승을 앞지른 구간`);
  p();
  p(`12개월 이동 연율(직전 12개월 대비)로 두 계열을 나란히 놓고, 월세가 전세를 앞선 달을 표시한다.`);
  p();
  p(`| 연월 | 평균월세액(12개월) | 평균전세액(12개월) | 월세가 앞섬 |`);
  p(`|---|---|---|---|`);
  const k = ms(wj).filter((m) => m >= "2016-12");
  let flips = 0;
  const lines = [];
  for (const m of k) {
    const a = annual(wj, shift(m, -12), m);
    const b = annual(jj, shift(m, -12), m);
    if (a == null || b == null) continue;
    const win = a > b;
    if (win) flips++;
    // 매달 다 찍으면 표가 길어 못 읽는다 → 6월·12월만
    if (!/-(06|12)$/.test(m)) continue;
    lines.push(`| ${m} | ${f(a)} | ${f(b)} | ${win ? "**●**" : "—"} |`);
  }
  for (const l of lines) p(l);
  p();
  p(`관측 ${k.length}개월 중 월세가 앞선 달 **${flips}개월**.`);
}

const dir = join(ROOT, "data/review");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "policy-event-study.md"), md.join("\n") + "\n", "utf8");
console.log(`\n🗂  data/review/policy-event-study.md`);
