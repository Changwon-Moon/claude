/**
 * 🔥 최근 1년 토허제 40곳 월세 상승 — 지도 + 행정구역 표 1장. (singoga-map@1)
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
 * ── 기준 기간: 최근 1년 = 2025년 6월 → 2026년 6월
 * 오너 질문("2025.07~2026.06으로 바꿔야 1년일까?")에 대한 답:
 * **아니다.** 지수·평균금액은 그 달의 **시점 값**이다. 1년 변화는 같은 달끼리 비교하는
 * 동월 대비(2025-06 → 2026-06)가 정확히 12개월이다.
 * "2025.07~2026.06"은 12개월 **구간**(누적) 표기인데, 시점 값에는 맞지 않는다
 * (그렇게 쓰면 시작점이 2025-06 인지 2025-07 인지 흐려진다).
 * 그래서 기간은 그대로 두고 표기만 "최근 1년(2025.06 → 2026.06)"으로 한다.
 * ⚠️ 인과 주장이 아니다 — "대비"까지만 쓴다.
 *
 * ── 왜 지수가 아니라 금액인가 (2026-07-30 오너 질문 "금액으로 바꾸면 더 와닿을까?")
 * 와닿는다. 특히 **1년에 얼마 더 내게 됐나(오른 금액)** 가 가장 체감이 크다.
 * 그래서 주값 = 오른 금액, 보조값 = 현재 월세로 바꿨다(둘 다 같은 계열 = 평균월세금액).
 * ⚠️ 대신 평균 금액은 **그 달에 계약된 아파트 구성**에 흔들린다. 지수는 그 영향을 통제한다.
 *    실제로 송파는 금액 +20.2% 인데 지수로는 +10.6% 다(구성 변화 영향).
 *    그래서 카드·캡션에 "평균 금액 기준"을 반드시 밝힌다.
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
const BASE = "2025-06"; // 최근 1년의 시작 시점(동월 대비)
const BASE_NOTE = "李정부 취임";
/** 천원 → 만원. R-ONE 금액 계열의 단위는 천원이다(meta.unit 에 확정 기록). */
const MAN = (v) => v / 10;

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

/* 금액 계열의 단위가 확정돼 있어야 만원으로 바꿀 수 있다 — 추론으로 나누지 않는다 */
if (doc.meta?.unit?.avgWolse !== "천원") {
  throw new Error(
    `평균월세 단위가 '천원'으로 확정돼 있지 않다(meta.unit.avgWolse=${doc.meta?.unit?.avgWolse}) — ` +
      `scripts/article-crosscheck.mjs 로 단위를 확인한 뒤 다시 실행하세요.`,
  );
}

/** 지역별 월세 금액(만원)과 상승 — 값이 하나라도 비면 던진다. 구멍 난 지도는 오보다. */
const money = new Map();
for (const a of AREAS) {
  const s = doc.avgWolse?.[a.rebCode];
  const from = at(s, BASE);
  const to = at(s, asOf);
  if (from == null || to == null) {
    throw new Error(`${a.geoName}(${a.rebCode}) 평균월세 값이 비었다 — ${BASE}~${asOf} 계열 확인 필요`);
  }
  money.set(a.geoName, { now: MAN(to), up: MAN(to - from), pct: pct(from, to) });
}
/** 색·순위의 기준 = 오른 금액(만원). 표의 주값과 같은 값이라야 순위가 납득된다. */
const rate = new Map([...money].map(([k, v]) => [k, v.up]));

/* ── 지도 ── 신고가 카드와 같은 모듈. 라벨은 mapLabel + 상승률 %. */
const parts = tohuhParts(AREAS);
const won = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.round(Math.abs(v))}만`;
const mapSvg = tohuhMapSvg({
  parts,
  valueOf: (info) => rate.get(info.geoName),
  textOf: (p) => won(p.v),
  /* 오너 지시(2026-07-30): 지도 라벨은 **행정구 / 값** 2줄. 좁은 도형에서 1줄보다 잘 들어간다.
   * 2줄이면 라벨 폭이 절반쯤이라 충돌 판정 폭도 줄인다(1줄 184 → 2줄 118). */
  twoLine: true,
  labelWidth: 118,
  /* 라벨을 무게중심에서 가장 가까운 빈 자리에 둔다(오너 지적: 위치가 많이 틀어져 있다).
   * 기본값 "down" 은 이미 발행된 신고가 카드의 배치라 건드리지 않는다. */
  placement: "nearest",
});

/* ── 표 ── 이름은 label(행정구·시까지).
 * 오너 지시(2026-07-30): "가운데 N곳 생략" 표시와 기호는 삭제.
 * 그래서 신고가 카드와 같은 방식으로 **상위 16곳만** 보여주는 순위표가 된다
 * (그 카드도 40곳 중 16곳을 싣는다). 40곳 전체는 캡션에 있다. */
const ranked = [...AREAS].sort((a, b) => rate.get(b.geoName) - rate.get(a.geoName));
/* 오너 지시(2026-07-30): 제목을 키운 만큼 표를 줄인다 → 8위까지.
 * 40곳 전체는 캡션에 있다. 행 간격은 spread 로 펴서 표가 본문 높이를 채운다. */
const TOP = 8;
const MEDALS = ["🥇", "🥈", "🥉"];
const rows = ranked.slice(0, TOP).map((a, i) => ({
  rank: i + 1,
  medal: MEDALS[i] || "",
  top: i < 3,
  gu: a.label + (a.isNew ? " ⚡" : ""),
  hits: won(money.get(a.geoName).up),
  ratio: `${Math.round(money.get(a.geoName).now)}만원`,
}));

const upAll = AREAS.every((a) => rate.get(a.geoName) > 0);
const top1 = ranked[0];
const last = ranked.at(-1);

const card = {
  template: "singoga-map@1",
  date,
  compact: true,
  /* 10행이면 표 아래가 크게 빈다 → 행 간격을 펴서 본문 높이를 채운다(오너 지시: 여백 신경).
   * 행이 많은 카드에서 켜면 표가 넘치므로 이 카드에서만 켠다. */
  spread: true,
  hideFooterId: true, // 아이디는 지도 안(스탬프)에 있다 — 푸터 중복 제거
  /* 상단 캡션은 한 줄이다 — 길면 두 줄로 접혀 제목을 밀어낸다(첫 렌더에서 "격지수"가 내려갔다) */
  note: `최근 1년 · 수도권 토지거래허가구역 · 아파트 평균 월세`,
  /* ⚠️ 제목의 '전체'는 **데이터가 허락할 때만** 쓴다.
   * 오너가 "토허제 40곳 전체 월세 폭등중"을 요청했지만 이 기간(1년) 기준으로
   * 과천시가 −0.2% 다. 그 숫자는 아래 표 40위 줄에 그대로 보인다 —
   * 제목이 '전체'라고 하면 **같은 카드 안에서 제목과 표가 서로 모순된다.**
   * 그래서 '전체'는 upAll 일 때만 붙이고, 아니면 뺀다. 문구보다 사실이 먼저다. */
  /* 오너 지시 문구(2026-07-30). 숫자는 손으로 적지 않는다 — 1위 값이 바뀌면 제목도 바뀐다. */
  title: `1년 만에 월세 <span class="hi">${Math.round(money.get(top1.geoName).up)}만원</span> 더 낸다`,
  /* 오너 지시: 제목을 좌우 여백 최소로 크게 — 템플릿이 폭에 맞춰 폰트를 키운다.
   * 발행된 신고가 카드는 이 필드가 없어 기존 크기(66px)를 유지한다. */
  fitTitle: true,
  /* 오너 지시: 제목 아래 부제(subtitle) 없음 */
  unit: "원", // 주값이 "+38만" → "+38만원". 기본값 '건' 은 신고가 카드용
  subUnit: "현재", // 보조값 앞에 붙는다 → "현재 227만원"
  /* 오너 지시: 머리글 3열(순위 / 지역 / 월세 상승분) · 가운데 정렬 */
  head: { c: ["순위", "지역", "월세 상승분"] },
  mapSvg,
  rows,
  /* 오너 지시 문구 그대로. 인과가 아니라 '대비'로만 쓴다. */
  /* 평균 금액은 그달 계약 구성에 흔들린다 — 이 한 줄을 빼면 오보가 된다 */
  /* 오너 지시 문구 그대로(2026-07-30). '평균 월세' 표기는 오보 방지상 반드시 남긴다. */
  footnote: `최근 1년(${BASE.replace("-", ".")}~${asOf.replace("-", ".")}) 아파트 평균 월세 · 동탄구는 화성시 기준`,
  /* 오너 지시: 푸터는 '허가구역 고시.' 까지. 연월은 넣지 않는다. */
  /* 오너 지시: 푸터 끝 마침표 삭제 */
  source: { name: "한국부동산원 평균월세가격 · 서울시·경기도 허가구역 고시" },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "tohuh-rent-map.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

/* ── 캡션 ── 숫자는 전부 위 계산값. 손으로 적으면 다음 갱신에 카드와 어긋난다. */
const seoulRanked = ranked.filter((a) => a.region === "서울");
const ggRanked = ranked.filter((a) => a.region === "경기");
const m = (g) => money.get(g);
const line = (a) => `${won(m(a.geoName).up)}원 → 현재 ${Math.round(m(a.geoName).now)}만원`;
const caption = [
  `토허제 40곳, 1년 만에 월세가 이만큼 올랐습니다 🔥`,
  ``,
  `서울 25개 자치구 전역과 경기 15곳,`,
  `토지거래허가구역 40곳의 아파트 평균 월세를`,
  `최근 1년(${ymKo(BASE)} → ${ymKo(asOf)})으로 비교했습니다.`,
  ``,
  upAll
    ? `· 40곳 전부 올랐습니다. 내린 곳은 없습니다`
    : `· 40곳 중 ${AREAS.filter((a) => rate.get(a.geoName) > 0).length}곳이 올랐습니다`,
  `· 가장 많이 : ${top1.label} ${line(top1)}`,
  `· 가장 적게 : ${last.label} ${line(last)}`,
  `· 서울 1위 : ${seoulRanked[0].label} ${line(seoulRanked[0])}`,
  `· 경기 1위 : ${ggRanked[0].label} ${line(ggRanked[0])}`,
  ``,
  `[40곳 전체 · 1년간 오른 월세]`,
  ...ranked.map((a, i) => `${i + 1}. ${a.label} ${line(a)}`),
  ``,
  `📌 저장해두고 우리 동네가 몇 위인지 확인하기`,
  ``,
  `—`,
  `📊 가격 : 한국부동산원 「전국주택가격동향조사」 아파트 평균월세가격`,
  `   (${ymKo(asOf)} 공표분 · ${ymKo(BASE)} 대비 · 단위 만원)`,
  `🗂 허가구역 : 서울시·경기도 토지거래허가구역 지정 고시`,
  `   서울 25개 자치구 전역(2025년 10월 지정) · 경기 15곳(기존 12곳 + 2026년 7월 신규 3곳 ⚡)`,
  `※ 동탄구는 화성시 전체 수치 기준입니다. 지도 경계는 동탄구(2013 읍면동 합성)지만,`,
  `   동탄구 지수는 2026년 분구 이후 6개월치뿐이어서 1년 비교를 할 수 없습니다.`,
  `※ 그 외 지역은 시·군·구 경계 기준이며, 실제 허가구역이 일부인 곳이 있습니다.`,
  `※ 평균 금액이라 그달 계약된 아파트 구성에 따라 흔들립니다. 구성 영향을 통제한`,
  `   월세가격지수로 보면 순위가 조금 달라집니다(예: 송파 금액 +20.2% / 지수 +10.6%).`,
  `※ ${ymKo(BASE)}은 비교 기준점이며, 특정 정부·제도가 원인이라는 뜻이 아닙니다.`,
  ``,
  `#부동산 #월세 #토지거래허가구역 #전월세 #데이터시각화`,
].join("\n");
mkdirSync(join(ROOT, "data/review/captions"), { recursive: true });
writeFileSync(join(ROOT, "data/review/captions/tohuh-rent-map.txt"), caption + "\n", "utf8");

console.log(
  `✅ 최근 1년 토허제 40곳 월세 (${BASE}→${asOf}) — ` +
    `${won(money.get(last.geoName).up)}원 ~ ${won(money.get(top1.geoName).up)}원 · ` +
    `상승 ${AREAS.filter((a) => rate.get(a.geoName) > 0).length}/40`,
);
console.log(
  `   1위 ${top1.label} ${won(money.get(top1.geoName).up)}원(현재 ${Math.round(money.get(top1.geoName).now)}만원) · ` +
    `40위 ${last.label} ${won(money.get(last.geoName).up)}원 · 표 상위 ${TOP}곳`,
);
