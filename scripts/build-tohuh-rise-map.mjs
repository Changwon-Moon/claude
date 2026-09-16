/**
 * 📈 「YYYY년 초부터 지금까지」 토허제 40곳 아파트 매매가격 상승률 — 지도 + 순위표 1장. (singoga-map@1)
 *
 * 4장 시리즈(2023·2024·2025·2026년 초 → 같은 끝점). 오너 2026-09-16:
 *   *"서울 25개구, 경기 15개 합쳐서 총 40개 토허제 지역으로 확장해줘.
 *     각 연도별~현재까지 상승률 4개 카드로 만들어줘"*
 * 판형·지도는 월세 카드(build-tohuh-rent-map)와 **같다** — 복사하지 않고 같은 모듈을 부른다.
 *
 * ── 자료: 한국부동산원 주간 아파트 매매가격지수 (data/datasets/reb-weekly-index.json)
 *   · 지역코드는 이름으로 짐작하지 않는다 → tohuh-2026.json 의 `rebWeeklyCode`
 *     (주간 코드 체계는 월간 `rebCode` 와 다르다: 서울 50008 vs 월간 코드)
 *   · 기준점: 키 `YYYY01` = 1월 1일이 든 주(전년 마지막 조사). 이 키끼리의 비가
 *     부동산원 발표 「연간 누적」과 일치한다(2025: 서울 8.71·송파 20.92·성동 19.12 — 2026-09-16 대조)
 *   · 끝점은 인자로 **못 박는다**(`--end`). 새 주가 들어와도 이 카드의 픽셀이 조용히 바뀌지 않게.
 *
 * ── 화성 동탄구: 주간 동탄구 계열은 2026-02 분구 이후치뿐 → 기준점이 없으면 화성시(`rebWeeklyFallback`)
 *    4장 모두 같은 계열을 써야 장끼리 비교가 되므로 **대체는 4장 공통**으로 한다. 카드 하단에 밝힌다.
 *
 * 실행: node scripts/build-tohuh-rise-map.mjs --base 2023 [--end 202637] [--date 2026-09-16]
 * 출력: data/content/{date}/tohuh-rise-{base}.json · 캡션 data/review/captions/tohuh-rise-{base}.txt
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tohuhParts, tohuhMapSvg } from "./lib/tohuh-map.mjs";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (k, dflt) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const BASE_Y = arg("base");
const END = arg("end", "202637");
const date = arg("date", "2026-09-16");
if (!/^20\d\d$/.test(BASE_Y || "")) throw new Error("--base 2023 처럼 연도를 주세요");
const BASE = `${BASE_Y}01`;
const SERIES_BASES = ["2023", "2024", "2025", "2026"]; // 캡션에서 네 장을 나란히 적을 때 쓴다

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
if (doc.meta?.verified !== true) {
  throw new Error("reb-weekly-index.json meta.verified 가 true 가 아니다 — 보도자료와 대조한 뒤 올린다");
}
const mae = doc.mae;
const SEOUL = doc.meta.seoulCode || "50008";
if (!mae[SEOUL]?.[END]) throw new Error(`끝점 ${END} 가 자료에 없다 (asOf=${doc.meta.asOf})`);

/** 부동산원 주 키 → 그 주 조사일(월요일). reb-weekly-brief 와 같은 규칙. */
const mondayOf = (key) => {
  const y = +key.slice(0, 4), w = +key.slice(4);
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  const mon = new Date(simple);
  mon.setUTCDate(simple.getUTCDate() - dow + 1);
  return mon;
};
const endDate = mondayOf(END);
const endKo = `${endDate.getUTCFullYear()}년 ${endDate.getUTCMonth() + 1}월 ${endDate.getUTCDate()}일`;
const endDot = `${endDate.getUTCFullYear()}.${String(endDate.getUTCMonth() + 1).padStart(2, "0")}.${String(endDate.getUTCDate()).padStart(2, "0")}`;

const AREAS = [
  ...tohuh.seoul.areas.map((a) => ({ ...a, region: "서울" })),
  ...tohuh.newly.areas.map((a) => ({ ...a, isNew: true, region: "경기" })),
  ...tohuh.existing.areas.map((a) => ({ ...a, region: "경기" })),
];
if (AREAS.length !== 40) throw new Error(`토허제 지역이 40곳이 아니다: ${AREAS.length}곳`);

/** 지역의 계열 — 네 기준점이 **모두** 있는 계열만 쓴다(장끼리 같은 계열이어야 비교가 된다). */
const seriesOf = (a) => {
  const need = [...SERIES_BASES.map((y) => `${y}01`), END];
  const ok = (c) => c && mae[c] && need.every((k) => Number.isFinite(mae[c][k]));
  if (ok(a.rebWeeklyCode)) return { code: a.rebWeeklyCode, fallback: false };
  if (ok(a.rebWeeklyFallback)) return { code: a.rebWeeklyFallback, fallback: true };
  throw new Error(`${a.label}: 주간 계열(${a.rebWeeklyCode}${a.rebWeeklyFallback ? "/" + a.rebWeeklyFallback : ""})에 기준점이 비었다`);
};
const rise = (code, base) => (mae[code][END] / mae[code][base] - 1) * 100;
const r1 = (v) => Math.round(v * 10) / 10;
const pctTxt = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(r1(v)).toFixed(1)}`;

const stat = AREAS.map((a) => {
  const s = seriesOf(a);
  return { ...a, ...s, v: rise(s.code, BASE) };
});
const val = new Map(stat.map((a) => [a.geoName, a.v]));
/* 같은 값(소수 첫째 자리)이면 원값으로, 그래도 같으면 이름순 — 순위가 실행마다 흔들리지 않게 */
const ranked = [...stat].sort((a, b) => b.v - a.v || a.label.localeCompare(b.label, "ko"));
const fallbacks = stat.filter((a) => a.fallback);
const seoulV = rise(SEOUL, BASE);

/* ── 지도 ── */
const parts = tohuhParts(AREAS);
const mapSvg = tohuhMapSvg({
  parts,
  valueOf: (info) => val.get(info.geoName),
  textOf: (p) => `${pctTxt(p.v)}%`,
  twoLine: true,
  labelWidth: 118,
  placement: "nearest",
});

/* ── 표: 상위 8곳 (월세 카드와 같은 기준) ── */
const TOP = 8;
const MEDALS = ["🥇", "🥈", "🥉"];
/* 순위는 **보이는 값**(소수 첫째 자리)으로 매긴다 — 40.65 와 40.60 이 둘 다 「+40.6%」로 찍히는데
 * 1위·2위로 갈라 적으면 독자는 같은 숫자에 다른 순위가 붙은 것을 본다(2024장 성동·분당, 2026-09-16).
 * 같은 값이면 공동 순위(1·1·3 …). */
const rankOf = new Map();
ranked.forEach((a, i) => {
  const prev = ranked[i - 1];
  rankOf.set(a.geoName, prev && r1(prev.v) === r1(a.v) ? rankOf.get(prev.geoName) : i + 1);
});
/* 표 이름: 서울 구·경기 시는 label(「송파구」「광명시」), 경기 시 안의 구는 mapLabel(「성남 분당」).
 * 「성남시 분당구」는 표 칸에서 「성남시 분 / 당구」로 글자 중간이 꺾였다(첫 렌더). */
const tableName = (a) => (a.region === "경기" && /시 .+구$/.test(a.label) ? a.mapLabel : a.label);
const rows = ranked.slice(0, TOP).map((a) => {
  const rk = rankOf.get(a.geoName);
  return { rank: rk, medal: MEDALS[rk - 1] || "", top: rk <= 3, gu: tableName(a), hits: pctTxt(a.v) };
});
const top1 = ranked[0];
const coTop = ranked.filter((a) => rankOf.get(a.geoName) === 1);
const last = ranked.at(-1);
const upAll = stat.every((a) => a.v > 0);

const card = {
  template: "singoga-map@1",
  date,
  compact: true,
  spread: true,
  hideFooterId: true,
  note: `${BASE_Y}년 초부터 · 토지거래허가구역 40곳 · 아파트 매매가`,
  /* 네 장이 같은 모양이어야 넘기며 비교된다 — 연도와 1위만 바뀐다 */
  title: `${BASE_Y}년부터 ${coTop.length > 1 ? "공동 " : ""}1위 <span class="hi">${coTop.map((a) => a.mapLabel.split(" ").pop()).join("·")} ${pctTxt(top1.v)}%</span>`,
  fitTitle: true,
  unit: "%",
  head: { c: ["순위", "지역", "상승률"] },
  asOfNote: `${endKo} 기준`,
  mapSvg,
  rows,
  footnote:
    `${BASE_Y}년 초~${endDot} 주간 아파트 매매가격지수 · 서울 평균 ${pctTxt(seoulV)}%` +
    (fallbacks.length ? ` · ${fallbacks.map((a) => a.mapLabel.split(" ").pop() + "구").join("·")}는 화성시 기준` : ""),
  source: { name: "한국부동산원 주간 아파트가격동향 · 서울시·경기도 허가구역 고시" },
};

const label = `tohuh-rise-${BASE_Y}`;
const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${label}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");

/* ── 캡션 ── 숫자는 전부 위 계산값 */
const seoulRanked = ranked.filter((a) => a.region === "서울");
const ggRanked = ranked.filter((a) => a.region === "경기");
const caption = [
  `${BASE_Y}년 초부터 지금까지, 가장 많이 오른 곳은 ${coTop.map((a) => a.label).join("·")} ${pctTxt(top1.v)}% 📈`,
  `같은 기간 서울 평균은 ${pctTxt(seoulV)}%입니다.`,
  ``,
  `서울 25개 자치구 전역 + 경기 15곳,`,
  `토지거래허가구역 40곳의 아파트 매매가격지수를`,
  `${BASE_Y}년 초 → ${endKo} 로 비교했습니다.`,
  ``,
  `· 서울 1위 : ${seoulRanked[0].label} ${pctTxt(seoulRanked[0].v)}%`,
  `· 경기 1위 : ${ggRanked[0].label} ${pctTxt(ggRanked[0].v)}%`,
  upAll
    ? `· 가장 적게 오른 곳 : ${last.label} ${pctTxt(last.v)}% (40곳 모두 상승)`
    : `· 가장 낮은 곳 : ${last.label} ${pctTxt(last.v)}%`,
  ``,
  `[40곳 전체 · ${BASE_Y}년 초부터 상승률]`,
  ...ranked.map((a) => `${rankOf.get(a.geoName)}. ${a.label} ${pctTxt(a.v)}%`),
  ``,
  `📌 시작점을 바꾸면 1등이 바뀝니다 — 2023·2024·2025·2026년 네 장을 넘겨 보세요`,
  ``,
  `—`,
  `📊 출처 · 한국부동산원 주간 아파트가격동향 (매매가격지수)`,
  `   ${BASE_Y}년 첫 주(전년 마지막 조사) → ${endKo} 조사`,
  `🗂 허가구역 : 서울시·경기도 토지거래허가구역 지정 고시`,
  `   서울 25개 자치구 전역 · 경기 15곳`,
  ``,
  ...(fallbacks.length
    ? [`※ 동탄구는 화성시 전체 기준입니다 — 동탄구 지수는 2026년 분구 이후치뿐이라 비교 기준점이 없습니다`]
    : []),
  `※ 지수는 거래된 단지 구성의 영향을 걸러낸 값이라, 실거래 평균·중위가격 상승률과는 다를 수 있습니다`,
  `※ 시·군·구 경계 기준이며, 실제 허가구역이 일부인 곳이 있습니다`,
  ``,
  `#부동산 #아파트값 #토지거래허가구역 #집값 #데이터시각화`,
].join("\n");
writeCaption(label, caption);

console.log(
  `✅ ${label} (${BASE}→${END}) 1위 ${top1.label} ${pctTxt(top1.v)}% · 40위 ${last.label} ${pctTxt(last.v)}% · 서울 ${pctTxt(seoulV)}%` +
    (fallbacks.length ? ` · 대체계열 ${fallbacks.map((a) => a.label).join(",")}` : ""),
);
