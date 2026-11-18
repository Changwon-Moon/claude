/**
 * 🔥 올해 토허제 40곳 월세 상승률 — 지도 + 행정구역 표 1장. (singoga-map@1)
 *
 * 2026-11-18 오너 요청: 기사("천정부지 월세…서울 25개 자치구 통계 작성 이래 최고치")를 보고
 * "토허제 40구역 자치구별 올해 월세 상승률 구해주고 카드로 만들어줘".
 *
 * ── 형식은 tohuh-rent-map(최근 1년 오른 금액)과 같다 — 같은 지도 모듈(lib/tohuh-map.mjs),
 *    같은 지역 표기(tohuh-2026.json label/mapLabel/rebCode). 다른 점은 값 하나:
 *    · 값 = **월세가격지수(순수 월세) 올해 누적 변동률** = 전년 12월 → 최신 공표월
 *      (wolse-flip 의 '2026년 +x%'와 같은 계열·같은 기간 — 서울 값이 두 카드에서 같아야 한다)
 *    · 지수를 쓰는 이유: 평균 금액은 그달 계약 구성에 흔들린다. '상승률'은 지수로 말한다.
 *    · 보조값 = 현재 평균 월세(금액 계열) — 체감용. 표 아래 주석에 두 계열을 밝힌다.
 *
 * ── '역대 최고' 개수는 계산한다(손으로 적지 않는다): 최신월 지수 ≥ 그 이전 모든 달.
 * ── 화성 동탄구: 2025-12 비교가 필요해 화성시 코드 기준(tohuh-rent-map 과 같은 처리).
 *
 * 실행: node scripts/build-tohuh-rent-ytd.mjs [date]
 * 출력: data/content/{date}/tohuh-rent-ytd.json · data/review/captions/tohuh-rent-ytd.txt
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tohuhParts, tohuhMapSvg } from "./lib/tohuh-map.mjs";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || new Date().toISOString().slice(0, 10);
const MAN = (v) => v / 10; // 천원 → 만원

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const asOf = doc.meta?.asOf;
if (!asOf) throw new Error("meta.asOf 가 없다");
if (doc.meta?.verified !== true) throw new Error("데이터셋 meta.verified 가 true 가 아니다 — 교차 확인 전에는 카드를 만들지 않는다");
if (doc.meta?.unit?.avgWolse !== "천원") throw new Error("평균월세 단위가 '천원'으로 확정돼 있지 않다");
const YEAR = Number(asOf.slice(0, 4));
const MON = Number(asOf.slice(5));
const BASE = `${YEAR - 1}-12`; // 올해 누적 = 전년 12월 대비
if (MON < 2) throw new Error("1월 공표분은 '올해 누적'이 한 달뿐이다 — 이 카드는 2월 공표분부터");

const AREAS = [
  ...tohuh.seoul.areas.map((a) => ({ ...a, region: "서울" })),
  ...tohuh.newly.areas.map((a) => ({ ...a, isNew: true, region: "경기" })),
  ...tohuh.existing.areas.map((a) => ({ ...a, region: "경기" })),
];
if (AREAS.length !== 40) throw new Error(`토허제 지역이 40곳이 아니다: ${AREAS.length}곳`);

const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const pct = (a, b) => ((b - a) / a) * 100;
const p1 = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
const ymKo = (ym) => `${ym.slice(0, 4)}년 ${Number(ym.slice(5))}월`;

const val = new Map();
for (const a of AREAS) {
  const s = doc.wolse?.[a.rebCode];
  const from = at(s, BASE), to = at(s, asOf);
  const now = at(doc.avgWolse?.[a.rebCode], asOf);
  if (from == null || to == null || now == null) throw new Error(`${a.geoName}(${a.rebCode}) 값이 비었다 — ${BASE}~${asOf}`);
  const prevMax = Math.max(...Object.entries(s).filter(([m]) => m < asOf).map(([, v]) => v));
  val.set(a.geoName, { pct: pct(from, to), now: MAN(now), record: to >= prevMax });
}
const rate = new Map([...val].map(([k, v]) => [k, v.pct]));
const seoulS = doc.wolse?.["500008"];
const seoulPct = pct(at(seoulS, BASE), at(seoulS, asOf));

const parts = tohuhParts(AREAS);
/* 가독성 시안(2026-11-18 오너 "지도를 더 가독성 좋게") — 모듈에 이미 있는 선택 옵션만 켠다.
 *  · minValue: 0 기준이 아니라 [최저,최고] 정규화 → 1.5%~14.7% 차이가 색으로 벌어진다
 *  · colorHi 계정 레드 #E5484D + labelInk: 글자 전부 진한 잉크(흰 글자/흰 테두리 번짐 제거, 대비 4.5+)
 *  · centerFit: 라벨을 도형 안쪽 가장 넓은 점에 — 경계선 걸침 감소
 *  · riverCasing: 한강 흰 테두리 */
const READ_OPTS = {
  minValue: Math.min(...[...rate.values()]),
  colorLo: [255, 236, 232],
  colorHi: [229, 72, 77],
  labelInk: true,
  centerFit: true,
  riverCasing: true,
};
const mapSvg = tohuhMapSvg({
  parts,
  valueOf: (info) => rate.get(info.geoName),
  textOf: (p) => `${p1(p.v)}%`,
  twoLine: true,
  labelWidth: 118,
  placement: "nearest",
  ...READ_OPTS,
});

const ranked = [...AREAS].sort((a, b) => rate.get(b.geoName) - rate.get(a.geoName));
const TOP = 8;
const MEDALS = ["🥇", "🥈", "🥉"];
const rows = ranked.slice(0, TOP).map((a, i) => ({
  rank: i + 1,
  medal: MEDALS[i] || "",
  top: i < 3,
  /* 값 열(+14.7%)이 금액 카드보다 넓어 '수원시 영통구'가 글자 중간에서 접혔다(첫 렌더) → 긴 이름은 지도용 짧은 이름 */
  gu: (a.label.length > 5 && a.mapLabel ? a.mapLabel : a.label), // ⚡(신규 지정) 표시는 뺀다 — 값 열이 넓어 줄이 접힌다
  hits: p1(rate.get(a.geoName)),
  ratio: `${Math.round(val.get(a.geoName).now)}만원`,
}));
const top1 = ranked[0];
const last = ranked.at(-1);
const upN = AREAS.filter((a) => rate.get(a.geoName) > 0).length;
const recN = AREAS.filter((a) => val.get(a.geoName).record).length;
const notRec = AREAS.filter((a) => !val.get(a.geoName).record);
const seoulRecN = AREAS.filter((a) => a.region === "서울" && val.get(a.geoName).record).length;
const period = `${YEAR}년 1~${MON}월`;

const card = {
  template: "singoga-map@1",
  date,
  compact: true,
  spread: true,
  hideFooterId: true,
  note: `${period} · 수도권 토지거래허가구역 · 아파트 월세가격지수`,
  title: `올해만 월세 <span class="hi">${rate.get(top1.geoName).toFixed(1)}%</span> 올랐다`,
  fitTitle: true,
  unit: "%",
  subUnit: "현재",
  head: { c: ["순위", "지역", "올해 상승률"] },
  asOfNote: `${YEAR}년 ${MON}월 말 기준`,
  mapSvg,
  rows,
  footnote: `상승률 = 월세가격지수(${BASE.replace("-", ".")} 대비) · 현재 = 평균 월세 · 동탄구는 화성시 기준`,
  source: { name: "한국부동산원 전국주택가격동향조사 · 서울시·경기도 허가구역 고시" },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "tohuh-rent-ytd.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

const gg = ranked.filter((a) => a.region === "경기");
const caption = [
  `올해만 월세 ${rate.get(top1.geoName).toFixed(1)}%. 🔥`,
  upN === AREAS.length ? `토허제 ${AREAS.length}곳 모두 올랐고, ${recN}곳이 역대 최고입니다.` : `토허제 ${AREAS.length}곳 중 ${upN}곳이 올랐고, ${recN}곳이 역대 최고입니다.`,
  ``,
  `한국부동산원 아파트 월세가격지수로`,
  `토지거래허가구역 40곳(서울 25구 + 경기 15곳)의`,
  `${period} 상승률을 구했습니다.`,
  ``,
  `· 서울 전체 : ${p1(seoulPct)}%`,
  `· 1위 : ${top1.label} ${p1(rate.get(top1.geoName))}%`,
  `· 경기 1위 : ${gg[0].label} ${p1(rate.get(gg[0].geoName))}%`,
  `· 가장 낮은 곳 : ${last.label} ${p1(rate.get(last.geoName))}%`,
  `· 지수 역대 최고 : 40곳 중 ${recN}곳 (서울 ${seoulRecN}/25)` +
    (notRec.length ? ` — ${notRec.map((a) => a.label).join("·")}만 직전 고점 아래` : ``),
  ``,
  `[40곳 전체 · ${period} 월세 상승률]`,
  ...ranked.map((a, i) => `${i + 1}. ${a.label} ${p1(rate.get(a.geoName))}%`),
  ``,
  `📌 저장해두고 우리 동네가 몇 위인지 확인하기`,
  ``,
  `—`,
  `📊 출처 · 한국부동산원 전국주택가격동향조사(월세가격지수·평균월세가격, 아파트)`,
  `   ${ymKo(asOf)} 공표분 · 상승률은 ${ymKo(BASE)} 대비 지수 변동률`,
  `🗂 허가구역 : 서울시·경기도 토지거래허가구역 지정 고시`,
  ``,
  `※ 월세가격지수는 순수 월세(보증금이 월세 12개월치 이하) 기준입니다`,
  `※ '현재'는 ${ymKo(asOf)} 평균 월세(금액)입니다 — 그달 계약된 아파트 구성에 따라 흔들립니다`,
  `※ 동탄구는 화성시 전체 기준입니다(2026년 1월 분구)`,
  `※ 시·군·구 경계 기준이며, 실제 허가구역이 일부인 곳이 있습니다`,
  ``,
  `#부동산 #월세 #토지거래허가구역 #전월세 #위릿노트`,
].join("\n");
writeCaption("tohuh-rent-ytd", caption);

console.log(`✅ 올해 토허제 40곳 월세 상승률 (${BASE}→${asOf}) — 1위 ${top1.label} ${p1(rate.get(top1.geoName))}% · 40위 ${last.label} ${p1(rate.get(last.geoName))}% · 상승 ${upN}/40 · 역대최고 ${recN}/40 · 서울 ${p1(seoulPct)}%`);
