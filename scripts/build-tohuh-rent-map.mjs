/**
 * 🔥 토허제 40곳 월세 폭등 — 지도 + 행정구역 표 1장. (singoga-map@1)
 *
 * ── 지도 포맷은 '2026년 6월 신고가' 카드와 **완전히 같다** (2026-07-30 오너 지시)
 * 한강 · 서울 시 외곽선 · 40곳 라벨(충돌 회피) · 동탄구 합성 경계 · 지도 안 워터마크 —
 * 전부 `scripts/lib/tohuh-map.mjs` 한 곳에 있고, 신고가 카드도 같은 모듈을 쓴다.
 * **앞으로 토허제 지도를 쓰는 카드는 전부 이 모듈을 불러온다. 복사하지 않는다.**
 *
 * ── 지역 표기 기준도 데이터에 있다 (손으로 다시 만들지 않는다)
 * `data/datasets/tohuh-2026.json` 의 각 지역이 세 가지를 들고 있다:
 *   label    → **표**에 쓰는 이름. 행정구·시까지 (예: "화성시 동탄구", "광명시")
 *   mapLabel → **지도**에 쓰는 짧은 이름 (예: "화성 동탄", "광명")
 *   rebCode  → 한국부동산원 R-ONE 지역코드. 이름으로 집으면 동명 지역이 섞인다
 * 세 개가 한 파일에 모여 있어야 카드마다 표기가 갈리지 않는다.
 *
 * ── 기준 기간 (2026-07-30 오너 지시)
 * 2025년 6월 → 2026년 6월. 오너가 잡은 기준점이며 카드에 그대로 밝힌다.
 * ⚠️ 인과 주장이 아니다 — "대비"까지만 쓴다.
 *
 * ── 화성 동탄구
 * 경계는 동탄구(2013 읍면동 합성)인데 R-ONE 동탄구 지수는 2026-01 분구 이후 6개월치뿐이다.
 * 그래서 수치는 화성시 전체 기준이고, 그 사실을 카드 최하단에 적는다. 숨기면 오보다.
 *
 * 실행: node scripts/build-tohuh-rent-map.mjs [date=2026-07-30]
 * 출력: data/content/{date}/tohuh-rent-map.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tohuhParts, tohuhMapSvg } from "./lib/tohuh-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-30";
const BASE = "2025-06"; // 오너 지정 기준점
const BASE_NOTE = "李정부 취임";

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const asOf = doc.meta?.asOf;
if (doc.meta?.verified !== true) {
  throw new Error("데이터셋 meta.verified 가 true 가 아니다 — 교차 확인 전에는 카드를 만들지 않는다");
}

/** 토허제 40곳 — 지정 현황의 원천은 이 데이터셋 하나다 */
const AREAS = [
  ...tohuh.seoul.areas.map((a) => ({ ...a, region: "서울" })),
  ...tohuh.newly.areas.map((a) => ({ ...a, isNew: true, region: "경기" })),
  ...tohuh.existing.areas.map((a) => ({ ...a, region: "경기" })),
];
if (AREAS.length !== 40) throw new Error(`토허제 지역이 40곳이 아니다: ${AREAS.length}곳`);
const noCode = AREAS.filter((a) => !a.rebCode);
if (noCode.length) {
  throw new Error(
    `rebCode 가 없는 지역: ${noCode.map((a) => a.geoName).join(", ")}\n` +
      `  data/datasets/tohuh-2026.json 에 R-ONE 코드를 적어 주세요 — 이름으로 짐작하면 다른 도시 값이 섞입니다.`,
  );
}

const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const pct = (a, b) => (a == null || b == null ? null : ((b - a) / a) * 100);
const sign1 = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
const ymKo = (ym) => `${ym.slice(0, 4)}년 ${Number(ym.slice(5))}월`;

/** 지역별 월세 상승률(%) — 값이 하나라도 비면 던진다. 구멍 난 지도는 오보다. */
const rate = new Map();
for (const a of AREAS) {
  const s = doc.wolse?.[a.rebCode];
  const v = pct(at(s, BASE), at(s, asOf));
  if (v == null) {
    throw new Error(`${a.geoName}(${a.rebCode}) 월세 값이 비었다 — ${BASE}~${asOf} 계열 확인 필요`);
  }
  rate.set(a.geoName, v);
}

/* ── 지도 ── 신고가 카드와 같은 모듈. 라벨은 mapLabel + 상승률 %. */
const parts = tohuhParts(AREAS);
const mapSvg = tohuhMapSvg({
  parts,
  valueOf: (info) => rate.get(info.geoName),
  textOf: (p) => `${sign1(p.v)}%`,
  /* "성남 수정 +6.9%" 는 신고가 카드의 "성남 수정 26" 보다 넓다 — 겹침 판정 폭을 키운다 */
  labelWidth: 176,
});

/* ── 표 ── 이름은 label(행정구·시까지). 상위 12 + 하위 3 + 생략 표시.
 * 40곳을 다 넣으면 표가 푸터를 덮는다(15+3 에서 넘쳤고 13+3 은 하단 설명에 닿았다).
 * 줄인 만큼 캡션에 40곳 전부를 적는다 — 조용히 자르면 "다 보여준 표"로 읽힌다. */
const ranked = [...AREAS].sort((a, b) => rate.get(b.geoName) - rate.get(a.geoName));
const TOP = 12;
const TAIL = 3;
const omitted = ranked.length - TOP - TAIL;
const MEDALS = ["🥇", "🥈", "🥉"];
const rowOf = (a, i) => ({
  rank: i + 1,
  medal: MEDALS[i] || "",
  top: i < 3,
  gu: a.label + (a.isNew ? " ⚡" : ""),
  hits: sign1(rate.get(a.geoName)),
});
const rows = ranked.slice(0, TOP).map(rowOf);
const tailRows = ranked.slice(-TAIL).map((a) => rowOf(a, ranked.indexOf(a)));

const upAll = AREAS.every((a) => rate.get(a.geoName) > 0);
const top1 = ranked[0];
const last = ranked.at(-1);

const card = {
  template: "singoga-map@1",
  date,
  compact: true,
  hideFooterId: true, // 아이디는 지도 안(스탬프)에 있다 — 푸터 중복 제거
  /* 상단 캡션은 한 줄이다 — 길면 두 줄로 접혀 제목을 밀어낸다(첫 렌더에서 "격지수"가 내려갔다) */
  note: `수도권 토지거래허가구역(서울25+경기15) · 월세가격지수`,
  /* ⚠️ 제목의 '전체'는 **데이터가 허락할 때만** 쓴다.
   * 오너가 "토허제 40곳 전체 월세 폭등중"을 요청했지만 이 기간(1년) 기준으로
   * 과천시가 −0.2% 다. 그 숫자는 아래 표 40위 줄에 그대로 보인다 —
   * 제목이 '전체'라고 하면 **같은 카드 안에서 제목과 표가 서로 모순된다.**
   * 그래서 '전체'는 upAll 일 때만 붙이고, 아니면 뺀다. 문구보다 사실이 먼저다. */
  title: upAll
    ? `토허제 40곳 <span class="hi">전체 월세 폭등중</span>`
    : `토허제 40곳 <span class="hi">월세 폭등중</span>`,
  /* 오너 지시: 제목 아래 부제(subtitle) 없음 */
  unit: "%", // 기본값 '건' — 이 카드는 상승률이라 단위를 바꿔 넘긴다
  head: { l: "지역", r: "월세 상승률" },
  mapSvg,
  rows,
  tail: { rows: tailRows, note: `가운데 <b>${omitted}곳</b> 생략 · 40곳 전부 캡션에` },
  /* 오너 지시 문구 그대로. 인과가 아니라 '대비'로만 쓴다. */
  footnote:
    `${ymKo(BASE)}(${BASE_NOTE}) 대비 ${ymKo(asOf)} · 동탄구는 화성시 전체 기준` +
    (upAll ? "" : ` · 40곳 중 ${AREAS.filter((a) => rate.get(a.geoName) > 0).length}곳 상승`),
  /* 오너 지시: 푸터는 '허가구역 고시.' 까지. 연월은 넣지 않는다. */
  source: { name: "한국부동산원 월세가격지수 · 서울시·경기도 허가구역 고시." },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "tohuh-rent-map.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

/* ── 캡션 ── 숫자는 전부 위 계산값. 손으로 적으면 다음 갱신에 카드와 어긋난다. */
const seoulRanked = ranked.filter((a) => a.region === "서울");
const ggRanked = ranked.filter((a) => a.region === "경기");
const caption = [
  `토허제 40곳, 1년 만에 월세가 이만큼 올랐습니다 🔥`,
  ``,
  `서울 25개 자치구 전역과 경기 15곳,`,
  `토지거래허가구역 40곳의 월세가격지수를`,
  `${ymKo(BASE)}(${BASE_NOTE})과 ${ymKo(asOf)}로 비교했습니다.`,
  ``,
  upAll
    ? `· 40곳 전부 올랐습니다. 내린 곳은 없습니다`
    : `· ${AREAS.filter((a) => rate.get(a.geoName) > 0).length}곳이 올랐습니다`,
  `· 가장 많이 : ${top1.label} ${sign1(rate.get(top1.geoName))}%`,
  `· 가장 적게 : ${last.label} ${sign1(rate.get(last.geoName))}%`,
  `· 서울 1위 : ${seoulRanked[0].label} ${sign1(rate.get(seoulRanked[0].geoName))}%`,
  `· 경기 1위 : ${ggRanked[0].label} ${sign1(rate.get(ggRanked[0].geoName))}%`,
  ``,
  `[40곳 전체]`,
  ...ranked.map((a, i) => `${i + 1}. ${a.label} ${sign1(rate.get(a.geoName))}%`),
  ``,
  `📌 저장해두고 우리 동네가 몇 위인지 확인하기`,
  ``,
  `—`,
  `📊 가격 : 한국부동산원 「전국주택가격동향조사」 아파트 월세가격지수`,
  `   (${ymKo(asOf)} 공표분 · ${ymKo(BASE)} 대비)`,
  `🗂 허가구역 : 서울시·경기도 토지거래허가구역 지정 고시`,
  `   서울 25개 자치구 전역(2025년 10월 지정) · 경기 15곳(기존 12곳 + 2026년 7월 신규 3곳 ⚡)`,
  `※ 동탄구는 화성시 전체 수치 기준입니다. 지도 경계는 동탄구(2013 읍면동 합성)지만,`,
  `   동탄구 지수는 2026년 분구 이후 6개월치뿐이어서 1년 비교를 할 수 없습니다.`,
  `※ 그 외 지역은 시·군·구 경계 기준이며, 실제 허가구역이 일부인 곳이 있습니다.`,
  `※ ${ymKo(BASE)}은 비교 기준점이며, 특정 정부·제도가 원인이라는 뜻이 아닙니다.`,
  ``,
  `#부동산 #월세 #토지거래허가구역 #전월세 #데이터시각화`,
].join("\n");
mkdirSync(join(ROOT, "data/review/captions"), { recursive: true });
writeFileSync(join(ROOT, "data/review/captions/tohuh-rent-map.txt"), caption + "\n", "utf8");

console.log(
  `✅ 토허제 40곳 월세 (${BASE}→${asOf}) — ` +
    `${sign1(rate.get(last.geoName))}% ~ ${sign1(rate.get(top1.geoName))}% · ` +
    `상승 ${AREAS.filter((a) => rate.get(a.geoName) > 0).length}/40`,
);
console.log(`   1위 ${top1.label} · 40위 ${last.label} · 표 ${TOP}+${TAIL}(생략 ${omitted})`);
