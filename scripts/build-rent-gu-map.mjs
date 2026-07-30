/**
 * 🗺 서울 자치구 전·월세 상승률 지도 — 2장.
 *   p1: 월세 상승률  p2: 전세 상승률   (map-choropleth@1)
 *
 * ── 왜 이미 있는 템플릿을 쓰나
 * 오너 요청: "행정구별 매매 상승률 템플릿 이용해서 전세·월세도".
 * map-choropleth@1 은 제목·색·범례·1위 문구가 전부 데이터로 들어오는 구조라
 * 새 템플릿 없이 그대로 쓴다. 지도 투영은 scripts/lib/seoul-map.mjs 공용 모듈.
 *
 * ── 두 장이 **같은 색 언어**를 쓴다
 * 오름 = 레드, 내림 = 코발트. p1(year-bars)과 같은 규칙이다.
 * 처음엔 "월세는 빨강 지도 / 전세는 파랑 지도"로 만들었는데 그게 틀렸다:
 * 전세는 −5.0%~+16.2% 로 0을 가로지르는데 단색 농담으로 칠하니
 * **−5.0%인 금천구가 옅은 파랑 = 소폭 상승처럼** 읽혔다. 색이 거짓말을 한 것이다.
 * 그래서 0을 기준으로 색이 갈리는 발산 배색을 쓴다 — 내린 구가 한눈에 튄다.
 * ⚠️ 두 장의 농도 범위는 다르다(월세 +11~+29, 전세 −5~+16).
 *    농도만 보고 두 장을 비교하면 오독하므로 범례에 최소·0·최대를 숫자로 박는다.
 *
 * ── 기준월
 * 2020-07(임대차 2법 시행월). 날짜가 확인된 유일한 분기점이라 기준선으로 쓴다.
 * ⚠️ 인과가 아니다. 카드에는 "시행월 이후 변화"로만 적는다.
 *
 * 실행: node scripts/build-rent-gu-map.mjs [date=2026-07-30]
 * 출력: data/content/{date}/rent-gu-map-p1.json, -p2.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { choroplethSvg, ramp } from "./lib/seoul-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-30";
const BASE = "2020-07";

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));
const asOf = doc.meta?.asOf;
if (doc.meta?.verified !== true) {
  throw new Error("데이터셋 meta.verified 가 true 가 아니다 — 교차 확인 전에는 카드를 만들지 않는다");
}
const GU = doc.meta?.groups?.seoulGu;
if (!Array.isArray(GU) || GU.length !== 25) {
  throw new Error(
    `meta.groups.seoulGu 가 25곳이 아니다(${GU?.length ?? "없음"}) — ` +
      `코드 접두사(530…)로 자르면 경기 시·구가 섞입니다`,
  );
}

const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const pct = (a, b) => (a == null || b == null ? null : ((b - a) / a) * 100);
const sign1 = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
const ymKo = (ym) => `${ym.slice(0, 4)}년 ${Number(ym.slice(5))}월`;

/** 자치구명 → 상승률(%) 표. 이름은 표시용이고 값은 **코드로** 집는다. */
function byName(seriesKey) {
  const out = new Map();
  for (const c of GU) {
    const s = doc[seriesKey]?.[c];
    const v = pct(at(s, BASE), at(s, asOf));
    const name = doc.regionNames?.[c];
    if (!name) throw new Error(`코드 ${c} 의 지역명이 없다`);
    if (v == null) throw new Error(`${name}(${c}) 의 ${seriesKey} 값이 비었다`);
    out.set(name, v);
  }
  return out;
}

/* 지도 라벨 글자색: 배경이 진하면 흰 글씨. 대비를 눈으로 정하면 어느 카드에선 안 보인다. */
const TEXT_ON_DARK = "#ffffff";
const TEXT_ON_LIGHT = "#1c2431";

/* 색 규칙 — p1(year-bars)과 같다: 오름=레드, 내림=코발트.
 * 0 에서 종이색(거의 흰색)으로 만나 **0을 넘는 순간 색이 바뀐다.** */
const PAPER = [250, 250, 248];
const RISE = [176, 11, 30]; // 진한 레드
const FALL = [23, 65, 168]; // 진한 코발트

function card({ seriesKey, label, titleFn }) {
  const vals = byName(seriesKey);
  const nums = [...vals.values()];
  const mn = Math.min(...nums);
  const mx = Math.max(...nums);
  const crossesZero = mn < 0;

  /* 색 배정: 양수는 0→최대를 종이→레드로, 음수는 0→최소를 종이→코발트로.
   * 양쪽 농도를 각자의 최대 절대값으로 정규화한다 — 그러지 않으면 한쪽이 거의 흰색으로 죽는다. */
  const posMax = Math.max(0, mx);
  const negMax = Math.max(0, -mn);
  const colorOf = (v) =>
    v >= 0
      ? ramp(PAPER, RISE, posMax ? v / posMax : 0)
      : ramp(PAPER, FALL, negMax ? -v / negMax : 0);
  /* 글자를 흰색으로 뒤집는 지점: 바탕이 어두워지는 지점(각 방향 60% 이상) */
  const isDark = (v) => (v >= 0 ? (posMax ? v / posMax : 0) : negMax ? -v / negMax : 0) > 0.6;

  const mapSvg = choroplethSvg({
    geoClass: "mc-geo",
    labClass: "mc-lab",
    extraStyle: ".mc-lab .g{font-size:26px}.mc-lab .v{font-size:30px}",
    value: (name, { area, maxArea }) => {
      const v = vals.get(name);
      if (v == null) return null; // 경계 파일에 있고 데이터엔 없는 지역 — 회색으로 남는다
      /* 글자 크기를 면적으로 정한다 — 작은 구(성동·광진·중)에서 라벨이 겹치던 문제.
       * 면적의 네제곱근을 쓰면(√를 두 번) 큰 구는 과하게 커지지 않고
       * 작은 구는 너무 작아지지 않는다. 22~34px 로 가둔다. */
      const k = Math.pow(area / maxArea, 0.25);
      const nameSize = Math.round(Math.max(19, Math.min(31, 31 * k)));
      const valSize = Math.round(nameSize * 1.16);
      const fill = colorOf(v);
      return {
        fill,
        textFill: isDark(v) ? TEXT_ON_DARK : TEXT_ON_LIGHT,
        halo: fill, // 넘어간 글자도 자기 구 색을 등에 지고 간다
        dy: -Math.round(valSize * 0.22),
        lines: [
          { text: name.replace(/구$/, ""), cls: "g", size: nameSize },
          /* 지도에서는 '%'를 뺀다 — 두 글자를 줄이면 작은 구의 겹침이 확 줄고,
           * 단위는 아래 범례(+11.1% ~ +29.2%)와 제목이 이미 말한다. */
          { text: sign1(v), cls: "v", dy: valSize, size: valSize },
        ],
      };
    },
  });

  const ranked = [...vals.entries()].sort((a, b) => b[1] - a[1]);
  const title = titleFn(ranked);
  /* 제목은 nowrap 이다 — 길면 템플릿이 줄여 주지만, 너무 줄면 부제만 한 크기가 된다.
   * 여기서 미리 막아 "제목이 작아진 카드"가 조용히 나가는 걸 방지한다. */
  if ([...title].length > 20) throw new Error(`제목이 너무 길다(${[...title].length}자, 20자 이하): ${title}`);

  return {
    template: "map-choropleth@1",
    date,
    subtitle: `서울 아파트 · ${ymKo(BASE)}(임대차 2법 시행월) 이후 변화`,
    title,
    mapSvg,
    colorLo: colorOf(mn),
    colorHi: colorOf(mx),
    /* 0을 가로지르면 발산 범례. 0의 위치를 색 띠 위에 실제 비율로 찍는다 —
     * 가운데로 두면 "절반이 마이너스"처럼 보인다. */
    ...(crossesZero
      ? {
          colorMid: `rgb(${PAPER.join(",")})`,
          midAt: `${Math.round(((0 - mn) / (mx - mn)) * 100)}%`,
          legendMid: "0 기준",
        }
      : {}),
    legendLo: `${sign1(mn)}%`,
    legendHi: `${sign1(mx)}%`,
    topName: ranked[0][0],
    topValue: `${sign1(ranked[0][1])}%`,
    source: {
      name: `한국부동산원 ${label}`,
      asOf: `${BASE.replace("-0", ".")} → ${asOf.replace("-0", ".")}`,
    },
  };
}

const p1 = card({
  seriesKey: "wolse",
  label: "월세가격지수",
  titleFn: (ranked) => {
    const up = ranked.filter(([, v]) => v > 0).length;
    return up === ranked.length ? `서울 월세, ${ranked.length}개 구 전부 올랐다` : "서울 자치구 월세 상승률";
  },
});
const p2 = card({
  seriesKey: "jeonse",
  label: "전세가격지수",
  titleFn: (ranked) => {
    const down = ranked.filter(([, v]) => v < 0);
    return down.length ? `전세는 ${down.length}개 구가 내렸다` : "같은 기간 전세 상승률";
  },
});

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "rent-gu-map-p1.json"), JSON.stringify(p1, null, 2) + "\n", "utf8");
writeFileSync(join(outDir, "rent-gu-map-p2.json"), JSON.stringify(p2, null, 2) + "\n", "utf8");

/* 캡션의 숫자도 여기서 나온다 — 손으로 적으면 다음 갱신에 카드와 캡션이 어긋난다 */
const wolse = byName("wolse");
const jeonse = byName("jeonse");
const rank = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);
const wRank = rank(wolse);
const jDown = rank(jeonse).filter(([, v]) => v < 0);
const gap = [...wolse.entries()]
  .map(([n, v]) => [n, v - jeonse.get(n)])
  .sort((a, b) => b[1] - a[1]);
const caption = [
  `서울 전·월세, 지도로 겹쳐 보면 🗺`,
  ``,
  `${ymKo(BASE)}(임대차 2법 시행월) 이후 지금까지,`,
  `서울 25개 자치구의 전세·월세 변화를 같은 지도에 올렸습니다.`,
  ``,
  `[월세]`,
  `· ${wRank.filter(([, v]) => v > 0).length}개 구 전부 올랐습니다`,
  `· 가장 많이 : ${wRank[0][0]} ${sign1(wRank[0][1])}%`,
  `· 가장 적게 : ${wRank.at(-1)[0]} ${sign1(wRank.at(-1)[1])}%`,
  ``,
  `[전세]`,
  jDown.length
    ? `· ${jDown.length}개 구는 오히려 내렸습니다 (${jDown.map(([n]) => n).join(", ")})`
    : `· 내린 자치구는 없습니다`,
  `· 가장 많이 오른 곳은 ${rank(jeonse)[0][0]} ${sign1(rank(jeonse)[0][1])}%`,
  ``,
  `두 지도의 차이가 가장 큰 곳은 ${gap[0][0]}입니다.`,
  `월세 ${sign1(wolse.get(gap[0][0]))}% / 전세 ${sign1(jeonse.get(gap[0][0]))}%`,
  ``,
  `📌 저장해두고 우리 동네 두 숫자를 비교해 보기`,
  ``,
  `—`,
  `📊 출처 : 한국부동산원 「전국주택가격동향조사」 · 서울 아파트`,
  `· 월세가격지수 / 전세가격지수 · ${ymKo(asOf)} 공표분 기준`,
  `※ 두 지도의 색 농도 범위는 다릅니다. 색으로 두 장을 비교하지 말고`,
  `   각 지도의 범례 숫자를 보세요. 0을 기준으로 색이 갈립니다.`,
  `※ 기준 시점으로 잡은 ${ymKo(BASE)}은 시행일이 확인된 분기점이어서 쓴 것이며,`,
  `   특정 제도가 원인이라는 뜻이 아닙니다. 그 시점 전후의 변화만 보여줍니다.`,
  ``,
  `#부동산 #전세 #월세 #서울아파트 #데이터시각화`,
].join("\n");
mkdirSync(join(ROOT, "data/review/captions"), { recursive: true });
writeFileSync(join(ROOT, "data/review/captions/rent-gu-map.txt"), caption + "\n", "utf8");

console.log(
  `✅ 전·월세 상승률 지도 2장 — 월세 ${p1.legendLo}~${p1.legendHi} (1위 ${p1.topName}) · ` +
    `전세 ${p2.legendLo}~${p2.legendHi} (1위 ${p2.topName})`,
);
console.log(`   ${p1.title} / ${p2.title}`);
