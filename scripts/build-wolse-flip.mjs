/**
 * 📉📈 월세, 뒤집힌 해 — 3장 캐러셀.
 *   p1  year-bars@1     서울 아파트 월세가격지수 연도별 변화율 (5년 마이너스 → 6년 플러스)
 *   p2  ranking-table@1 자치구 월세 상승률 1~13위 (전세와 나란히)
 *   p3  ranking-table@1 자치구 14~25위 + "25곳 중 25곳" 요약
 *
 * ── 모든 수치는 원자료에서 코드로 뽑는다 (ARCHITECTURE.md §2)
 * 입력: data/datasets/reb-rent-index.json (한국부동산원 R-ONE, meta.verified: true)
 * LLM 이 만든 숫자는 한 개도 없다. 문구도 계산 결과로 조립한다 —
 * "5년 연속"·"25곳 중 25곳" 같은 말은 손으로 쓰면 데이터가 바뀔 때 거짓이 된다.
 *
 * ── 기준월을 2020-07 로 잡는 이유 (자치구 페이지)
 * 임대차 2법 시행월(2020-07-31)이 **날짜가 확인된 유일한 분기점**이다.
 * ⚠️ 인과 주장이 아니다. 카드에도 "그 시점 전후"로만 적는다.
 *
 * 실행: node scripts/build-wolse-flip.mjs [date=2026-07-30]
 * 출력: data/content/{date}/wolse-flip-p1.json … -p3.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-30";
const SEOUL = "500008";
const BASE = "2020-07";

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));
const asOf = doc.meta?.asOf;
if (!asOf) throw new Error("meta.asOf 가 없다 — 데이터셋이 온전하지 않다");

/* 검증되지 않은 데이터로 카드를 만들면 그게 오보의 시작이다 */
if (doc.meta?.verified !== true) {
  throw new Error(
    "데이터셋 meta.verified 가 true 가 아니다 — 교차 확인 전에는 카드를 만들지 않는다\n" +
      "  node scripts/article-crosscheck.mjs 로 대조하고 verified 를 올린 뒤 다시 실행하세요.",
  );
}

const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const pct = (a, b) => (a == null || b == null ? null : ((b - a) / a) * 100);
const sign1 = (v) => (v == null ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%");

/* ─────────────────────────────────────────────────────────
 * p1 — 연도별 변화율
 * 12월 대비 12월. 마지막 연도는 아직 안 끝났으므로 asOf 월까지로 끊고 표시한다.
 * ───────────────────────────────────────────────────────── */
const wolse = doc.wolse?.[SEOUL];
const jeonse = doc.jeonse?.[SEOUL];
if (!wolse || !jeonse) throw new Error("서울(500008) 계열이 없다");

const lastYear = Number(asOf.slice(0, 4));
const lastMon = asOf.slice(5);
const firstYear = 2016; // 순수 월세지수는 2015-06 시작 → 온전한 연간 비교는 2016년부터

const yearRows = [];
for (let y = firstYear; y <= lastYear; y++) {
  const from = at(wolse, `${y - 1}-12`);
  const partial = y === lastYear && lastMon !== "12";
  const to = partial ? at(wolse, asOf) : at(wolse, `${y}-12`);
  const v = pct(from, to);
  if (v == null) continue;
  yearRows.push({ y, v, partial });
}
if (yearRows.length < 8) throw new Error(`연도 행이 ${yearRows.length}개뿐이다 — 계열이 짧다`);

/* 연속 구간을 **데이터에서** 찾는다. "5년 연속"을 손으로 적으면 다음 달에 거짓이 된다. */
const groupsRaw = [];
for (const r of yearRows) {
  const tone = r.v < 0 ? "neg" : "pos";
  const g = groupsRaw.at(-1);
  if (g && g.tone === tone) g.rows.push(r);
  else groupsRaw.push({ tone, rows: [r] });
}
const maxAbs = Math.max(...yearRows.map((r) => Math.abs(r.v)));
/* 최고 상승 연도는 **끝난 연도 중에서** 고른다. 진행 중인 연도(6월까지)를
 * "가장 많이 오른 해"라고 강조하면 연말에 그 말이 틀린다. */
const donePos = yearRows.filter((r) => r.v > 0 && !r.partial).map((r) => r.v);
const maxPos = donePos.length ? Math.max(...donePos) : null;
const runWord = (tone) => (tone === "neg" ? "마이너스" : "플러스");

const groups = groupsRaw.map((g, gi) => ({
  tone: g.tone,
  label: `${g.rows.length}년 연속 ${runWord(g.tone)}`,
  /* 구분선은 방향이 바뀌는 지점에만. 첫 구간 앞에는 넣지 않는다. */
  ...(gi > 0 ? { split: "여기서 뒤집혔다" } : {}),
  rows: g.rows.map((r) => ({
    year: String(r.y),
    value: sign1(r.v),
    dir: r.v < 0 ? "neg" : "pos",
    w: Math.round((Math.abs(r.v) / maxAbs) * 100),
    ...(r.partial ? { partial: true, note: `${Number(lastMon)}월까지` } : {}),
    ...(maxPos != null && r.v === maxPos && !r.partial ? { max: true } : {}),
  })),
}));

/* 사상 최고인지도 계산해서 말한다 — 눈으로 보고 적으면 틀린다 */
const allMonths = Object.keys(wolse).sort();
const peak = allMonths.reduce((a, m) => (wolse[m] > wolse[a] ? m : a), allMonths[0]);
const isPeakNow = peak === asOf;
const trough = allMonths.reduce((a, m) => (wolse[m] < wolse[a] ? m : a), allMonths[0]);
const ymKo = (ym) => `${ym.slice(0, 4)}년 ${Number(ym.slice(5))}월`;

const negRun = groupsRaw.find((g) => g.tone === "neg");
const posRun = groupsRaw.at(-1);

const p1 = {
  template: "year-bars@1",
  date,
  subtitle: `서울 아파트 · 월세가격지수 · ${ymKo(asOf)} 기준`,
  title: "서울 월세,\n뒤집힌 해",
  lede: `${firstYear}년부터 ${lastYear}년까지 연도별 변화율`,
  many: yearRows.length >= 12,
  negLabel: "내림",
  posLabel: "오름",
  groups,
  foot: [
    { k: "지수 최저", v: ymKo(trough) },
    ...(isPeakNow ? [{ k: "지금은", v: "사상 최고", accent: true }] : [{ k: "사상 최고", v: ymKo(peak) }]),
    { k: `${posRun.rows[0].y}년부터`, v: `${posRun.rows.length}년 연속 오름`, accent: true },
  ],
  /* 정직 문구는 한 줄에 들어와야 한다 — 두 줄로 밀리면 마지막 글자가 잘려
   * 경고가 반쪽이 된다(첫 렌더에서 "사선 막대)"가 다음 줄로 넘어갔다). */
  caveat: `순수 월세가격지수 기준 · 통계 시작 2015년 6월 · ${lastYear}년은 ${Number(lastMon)}월까지(사선)`,
  source: { name: "한국부동산원 「전국주택가격동향조사」", asOf: ymKo(asOf) },
};

/* ─────────────────────────────────────────────────────────
 * p2·p3 — 자치구 25곳
 * ───────────────────────────────────────────────────────── */
const GU = doc.meta?.groups?.seoulGu;
if (!Array.isArray(GU) || GU.length !== 25) {
  throw new Error(
    `meta.groups.seoulGu 가 25곳이 아니다(${GU?.length ?? "없음"}). ` +
      `코드 접두사(530…)로 자르면 경기 시·구가 섞입니다 — 수집기를 다시 돌려 명단을 채우세요.`,
  );
}

const guRows = GU.map((c) => {
  const w = pct(at(doc.wolse?.[c], BASE), at(doc.wolse?.[c], asOf));
  const j = pct(at(doc.jeonse?.[c], BASE), at(doc.jeonse?.[c], asOf));
  return { code: c, name: doc.regionNames?.[c] || c, w, j };
});
const hole = guRows.find((r) => r.w == null || r.j == null);
if (hole) throw new Error(`${hole.name}(${hole.code}) 값이 비었다 — 25곳이 다 있어야 순위가 맞다`);
guRows.sort((a, b) => b.w - a.w);

/* ── 공동순위 ──
 * 소수 첫째 자리까지만 보여주므로 **표시값이 같은데 순위가 다른 행**이 생긴다
 * (송파 14.9193 / 동작 14.8916 → 둘 다 "+14.9%" 인데 18위·19위).
 * 독자에게 그건 계산 오류로 보인다. 보이는 값이 같으면 순위도 같게 매기고
 * 다음 순위는 건너뛴다(표준 공동순위). 정렬 자체는 정밀값 그대로 둔다. */
let prevShown = null;
let prevRank = 0;
guRows.forEach((r, i) => {
  const shown = sign1(r.w);
  r.rank = shown === prevShown ? prevRank : i + 1;
  prevShown = shown;
  prevRank = r.rank;
});

const upAll = guRows.every((r) => r.w > 0);
const fasterN = guRows.filter((r) => r.w > r.j).length;
const slower = guRows.filter((r) => r.w <= r.j);
const seoulW = pct(at(wolse, BASE), at(wolse, asOf));
const seoulJ = pct(at(jeonse, BASE), at(jeonse, asOf));
/* 올해 상반기 — "월세만 오른다"는 오독을 우리가 먼저 막는 숫자 */
const h1W = pct(at(wolse, `${lastYear - 1}-12`), at(wolse, asOf));
const h1J = pct(at(jeonse, `${lastYear - 1}-12`), at(jeonse, asOf));

const half = Math.ceil(guRows.length / 2); // 13 / 12
const toItem = (r) => ({
  rank: String(r.rank),
  name: r.name,
  value: sign1(r.w),
  sub: sign1(r.j),
  /* 강조는 **예외**에만 준다.
   * 1위는 이미 표의 맨 위라 강조가 필요 없고, 순위표의 hl-fast 는 코발트인데
   * 이 카드에서 코발트는 '내림'을 뜻한다(p1과 같은 색 규칙) — 최고 상승에 쓰면 색이 거짓말을 한다.
   * 월세가 전세보다 덜 오른 곳(= 이 카드의 유일한 반례)만 표시한다. */
  ...(r.w <= r.j ? { hl: "slow" } : {}),
});

const guBase = {
  template: "ranking-table@1",
  date,
  hideMark: true, // 자치구는 로고가 없다 — 첫 글자 원은 정보가 아니라 노이즈다
  plainRank: true, // 많이 오른 게 '잘한 것'이 아니다 → 메달 금지
  nameLabel: "자치구",
  valueLabel: "월세",
  subLabel: "전세",
  /* 푸터는 한 줄이다 — ymKo 를 그대로 쓰면 "…2026년 6 / 월 기준"으로 잘린다(첫 렌더에서 잘렸다) */
  source: {
    name: "한국부동산원 「전국주택가격동향조사」",
    asOf: `${BASE.replace("-0", ".").replace("-", ".")} → ${asOf.replace("-0", ".").replace("-", ".")}`,
  },
};

/* 기준월이 임대차 2법 시행월임을 카드 안에 적는다 — 캡션에만 적으면 이미지만 돌 때 사라진다.
 * ⚠️ "시행월"이라고만 쓴다. "때문"이라고 쓰지 않는다. */
const guSub = `서울 아파트 · ${ymKo(BASE)}(임대차 2법 시행월) 이후 변화`;

const p2 = {
  ...guBase,
  subtitle: guSub,
  title: upAll ? "서울 25개 구,\n25곳 전부 월세가 올랐다" : "서울 자치구 월세 상승률",
  items: guRows.slice(0, half).map(toItem),
};
const p3 = {
  ...guBase,
  subtitle: guSub,
  title:
    slower.length === 1
      ? `${fasterN}곳은 전세보다 빠르게,\n예외는 ${slower[0].name} 한 곳`
      : `${fasterN}곳은 전세보다 빠르게`,
  items: guRows.slice(half).map(toItem),
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
for (const [n, d] of [["p1", p1], ["p2", p2], ["p3", p3]]) {
  writeFileSync(join(outDir, `wolse-flip-${n}.json`), JSON.stringify(d, null, 2) + "\n", "utf8");
}

/* ── 캡션도 여기서 쓴다 ──
 * 왜: 캡션을 손으로 적어 두면 다음 달 데이터가 갱신될 때 **카드는 새 숫자, 캡션은 옛 숫자**가 된다.
 * 문장은 사람이 쓰고(아래 틀), 숫자는 전부 위 계산값을 끼워 넣는다.
 * ⚠️ 인과 표현 금지 — "시행월 전후"까지만 쓴다. */
const nl = (...xs) => xs.join("\n");
const yearLine = (r) => `${r.y}  ${sign1(r.v)}${r.partial ? ` (${Number(lastMon)}월까지)` : ""}`;
const negRows = negRun ? negRun.rows : [];
const posRows = posRun.rows;
const caption = nl(
  `서울 월세, 원래부터 오르던 게 아닙니다 📉📈`,
  ``,
  `월세가격지수 연도별 변화율을 그대로 늘어놓으면 이렇게 됩니다.`,
  ``,
  ...negRows.map(yearLine),
  ``,
  `${negRows.length}년 연속 마이너스였습니다.`,
  `그 뒤로는 이렇게 됩니다.`,
  ``,
  ...posRows.map(yearLine),
  ``,
  `${posRows.length}년 연속 플러스, 그리고 ${isPeakNow ? "지금이 사상 최고치입니다" : `사상 최고는 ${ymKo(peak)}입니다`}.`,
  ``,
  `자치구로 내려가면 더 분명해집니다.`,
  `${ymKo(BASE)}(임대차 2법 시행월) 이후 지금까지,`,
  ``,
  `· 25곳 중 ${guRows.filter((r) => r.w > 0).length}곳에서 월세가 올랐습니다`,
  `· 그중 ${fasterN}곳은 전세보다 더 많이 올랐습니다`,
  ...(slower.length === 1
    ? [`· 예외는 ${slower[0].name} 한 곳입니다 (월세 ${sign1(slower[0].w)} / 전세 ${sign1(slower[0].j)})`]
    : []),
  `· 가장 많이 오른 곳은 ${guRows[0].name} ${sign1(guRows[0].w)}, 가장 적게 오른 곳은 ${guRows.at(-1).name} ${sign1(guRows.at(-1).w)}`,
  ``,
  `서울 전체로는 월세 ${sign1(seoulW)}, 전세 ${sign1(seoulJ)}입니다.`,
  /* ⚠️ 인스타 캡션은 마크다운을 못 쓴다 — **강조**를 넣으면 별표가 그대로 보인다 */
  `월세만 오른 게 아니라, 월세가 '더 빠르게' 오른 것입니다.`,
  /* 약점을 우리 입으로 먼저 말한다. 숫자까지 붙여야 신뢰가 된다. */
  `실제로 올해 상반기(${lastYear - 1}년 12월 → ${Number(lastMon)}월)에는`,
  `전세 ${sign1(h1J)}, 월세 ${sign1(h1W)}로 둘 다 오르고 있습니다.`,
  ``,
  `📌 저장해두고 우리 동네는 얼마나 올랐는지 확인하기`,
  ``,
  `—`,
  `📊 출처 : 한국부동산원 「전국주택가격동향조사」`,
  `· 서울 아파트 · 순수 월세가격지수(보증금 12개월치 이하) / 전세가격지수`,
  `· ${ymKo(asOf)} 공표분 기준 · 지수 통계 시작 2015년 6월`,
  `※ ${lastYear}년 수치는 ${Number(lastMon)}월까지의 누적입니다.`,
  `※ 기준 시점으로 잡은 ${ymKo(BASE)}은 시행일이 확인된 분기점이어서 쓴 것이며,`,
  `   특정 제도가 원인이라는 뜻이 아닙니다. 그 시점 전후의 변화만 보여줍니다.`,
  ``,
  `#부동산 #월세 #전세 #서울아파트 #임대차`,
);
mkdirSync(join(ROOT, "data/review/captions"), { recursive: true });
writeFileSync(join(ROOT, "data/review/captions/wolse-flip.txt"), caption + "\n", "utf8");

console.log(
  `✅ 월세 뒤집힌 해 3장 — ` +
    `${negRun ? `${negRun.rows.length}년 연속 ${runWord("neg")} → ` : ""}` +
    `${posRun.rows.length}년 연속 ${runWord("pos")} · ` +
    `자치구 상승 ${guRows.filter((r) => r.w > 0).length}/25 · 전세보다 빠른 곳 ${fasterN}/25`,
);
console.log(
  `   서울 전체 월세 ${sign1(seoulW)} / 전세 ${sign1(seoulJ)} · ` +
    `1위 ${guRows[0].name} ${sign1(guRows[0].w)} · 25위 ${guRows.at(-1).name} ${sign1(guRows.at(-1).w)}`,
);
