/**
 * 🗺 토지거래허가구역 40곳 전·월세 상승률 지도 — 2장. (map-choropleth@1)
 *   p1: 월세 상승률  p2: 전세 상승률
 *
 * ── 왜 40곳인가 (2026-07-30 오너 지시)
 * 서울 25개 자치구(2025-10-20 전역 지정) + 경기 15곳(기존 12 + 2026-07-05 신규 3) = **40곳**.
 * 지정 현황의 원천은 `data/datasets/tohuh-2026.json` 하나다 — 여기 목록이 바뀌면 지도도 바뀐다.
 *
 * ── 지역 매칭은 명단으로 한다 (규칙으로 하지 않는다)
 * 이름으로 지역을 집으면 조용히 틀린다. 실제로 "코드가 530으로 시작하면 서울"이라고 잘랐다가
 * 경기 시·군·구 24곳이 서울 순위표에 섞여 1위가 영통구(수원)로 나왔다(2026-07-30).
 * 그래서 **경계 이름 → R-ONE 코드**를 아래 표에 하나씩 적는다. 명단은 틀리면 눈에 보인다.
 *
 * ── 그리는 범위: 지정된 40곳만 (2026-07-30 오너 지시)
 * 미지정 지역을 회색 배경으로 깔지 않는다. 화면도 40곳으로 꽉 채운다.
 * 이미 만들어 둔 토허제 지도(build-tohuh-rank.mjs)와 같은 규칙이다.
 *
 * ── 화성 동탄구: 경계는 동탄, 수치는 화성시
 * 허가구역은 **동탄구만**이다. 그래서 지도에도 **동탄구 경계만** 그린다
 * (2013 읍면동 동탄면·동탄1~3동 합성 — tohuh-2026.json 의 subCodes).
 * 다만 R-ONE 동탄구 지수는 2026-01 분구 이후 6개월치뿐이라 2020-07 비교가 불가능해서,
 * **수치는 화성시 전체 기준**을 쓴다. 경계와 수치의 단위가 다르므로 카드 아래에 따로 밝힌다.
 * 동탄 값인 척하는 것이 오보다.
 *
 * 실행: node scripts/build-tohuh-rent-map.mjs [date=2026-07-30]
 * 출력: data/content/{date}/tohuh-rent-map-p1.json, -p2.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { choroplethSvg, ramp, readGeo } from "./lib/seoul-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-30";
const BASE = "2020-07"; // 임대차 2법 시행월 — 날짜가 확인된 유일한 분기점(인과 아님)

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const asOf = doc.meta?.asOf;
if (doc.meta?.verified !== true) {
  throw new Error("데이터셋 meta.verified 가 true 가 아니다 — 교차 확인 전에는 카드를 만들지 않는다");
}

/**
 * 경기 토허제 지역: **경계 이름 → R-ONE 지역코드**.
 * 이름이 아니라 코드로 계열을 집는다(중구·강서구처럼 동명 지역이 여러 도시에 있다).
 */
const GG_CODE = {
  과천시: "520018",
  광명시: "520031",
  구리시: "520037",
  의왕시: "520022",
  하남시: "520038",
  성남시수정구: "530048",
  성남시중원구: "530049",
  성남시분당구: "530050",
  수원시장안구: "530060",
  수원시팔달구: "530062",
  수원시영통구: "530063",
  안양시동안구: "530046",
  용인시수지구: "530058",
  용인시기흥구: "530057",
  // 경계는 동탄구, 수치는 화성시(520032) — 동탄구 지수가 2026-01 분구 이후치뿐이다
  화성시동탄구: "520032",
};
/**
 * 지도에 적을 짧은 이름.
 *
 * 규칙: **구 단위는 구 이름만, 시 단위는 시 이름만.** 서울 자치구를 "강남·송파"로 적는 것과 같다.
 * "수원팔달"·"성남수정"처럼 시+구를 붙이면 라벨이 도형보다 넓어져 옆 지역과 겹친다
 * (첫 렌더에서 수원팔달/수원영통, 성남수정/성남중원이 겹쳤다). 시 이름은 캡션이 밝힌다.
 */
const GG_LABEL = {
  화성시동탄구: "동탄",
  성남시수정구: "수정",
  성남시중원구: "중원",
  성남시분당구: "분당",
  수원시장안구: "장안",
  수원시팔달구: "팔달",
  수원시영통구: "영통",
  안양시동안구: "동안",
  용인시수지구: "수지",
  용인시기흥구: "기흥",
  과천시: "과천",
  광명시: "광명",
  구리시: "구리",
  의왕시: "의왕",
  하남시: "하남",
};

/* 지정 목록과 매칭표가 어긋나면 지도에 구멍이 난다 — 조용히 빠지지 않게 먼저 검사한다 */
const GG_AREAS = [...tohuh.newly.areas, ...tohuh.existing.areas];
const missing = GG_AREAS.map((a) => a.geoName).filter((n) => !GG_CODE[n]);
if (missing.length) {
  throw new Error(
    `토허제 지정 지역 중 매칭표에 없는 곳: ${missing.join(", ")}\n` +
      `  GG_CODE 에 R-ONE 코드를 추가하세요 — 이름으로 짐작해 집으면 다른 도시 값이 섞입니다.`,
  );
}

/* 서울 25개 자치구는 데이터셋이 내보낸 명단에서 가져온다(코드 접두사로 자르지 않는다) */
const SEOUL_GU = doc.meta?.groups?.seoulGu;
if (!Array.isArray(SEOUL_GU) || SEOUL_GU.length !== 25) {
  throw new Error(`meta.groups.seoulGu 가 25곳이 아니다(${SEOUL_GU?.length ?? "없음"})`);
}

const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const pct = (a, b) => (a == null || b == null ? null : ((b - a) / a) * 100);
const sign1 = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
const ymKo = (ym) => `${ym.slice(0, 4)}년 ${Number(ym.slice(5))}월`;

/** 경계 이름 → { code, label } 40곳. 이 표가 곧 이 카드의 대상 목록이다. */
const TARGET = new Map();
for (const c of SEOUL_GU) {
  const nm = doc.regionNames?.[c];
  if (!nm) throw new Error(`서울 자치구 코드 ${c} 의 지역명이 없다`);
  TARGET.set(nm, { code: c, label: nm.replace(/구$/, "") });
}
for (const [geoName, code] of Object.entries(GG_CODE)) {
  TARGET.set(geoName, { code, label: GG_LABEL[geoName] || geoName });
}
if (TARGET.size !== 40) throw new Error(`대상이 40곳이 아니다: ${TARGET.size}곳`);

/* ── 그릴 도형 40개를 직접 만든다 ──
 * 미지정 지역은 아예 안 그린다(오너 지시). 그래서 배경 필터가 아니라 **명시 목록**을 넘긴다.
 * 동탄구처럼 2013 경계에 없는 신설 구는 읍면동(subCodes)을 합성해 만든다 —
 * 화성시 전체를 칠하면 지정되지 않은 향남·봉담까지 규제 지역처럼 보인다. */
const muni = readGeo("capital");
const sub = readGeo("sub");
const SUB_CODES = new Map(GG_AREAS.filter((a) => a.subCodes).map((a) => [a.geoName, a.subCodes]));
const PARTS = [...TARGET.keys()].map((geoName) => {
  const codes = SUB_CODES.get(geoName);
  if (codes) {
    const features = sub.features.filter((f) => codes.includes(String(f.properties.code)));
    if (features.length !== codes.length) {
      throw new Error(`합성 경계 누락: ${geoName} (${features.length}/${codes.length}) — subCodes 확인 필요`);
    }
    return { name: geoName, features };
  }
  const f = muni.features.find((x) => x.properties.name === geoName);
  if (!f) throw new Error(`경계를 못 찾았다: ${geoName} — korea-municipalities.geojson 이름 표기 확인`);
  return { name: geoName, features: [f] };
});

/** 계열별 값 표(경계 이름 → %). 값이 하나라도 비면 던진다 — 구멍 난 지도는 오보다. */
function valuesOf(seriesKey) {
  const out = new Map();
  for (const [geoName, t] of TARGET) {
    const v = pct(at(doc[seriesKey]?.[t.code], BASE), at(doc[seriesKey]?.[t.code], asOf));
    if (v == null) {
      throw new Error(`${geoName}(${t.code}) 의 ${seriesKey} 값이 비었다 — ${BASE}~${asOf} 계열 확인 필요`);
    }
    out.set(geoName, v);
  }
  return out;
}

/* 색 규칙 — 카드 1번과 같다: 오름=레드, 내림=코발트. 0에서 종이색으로 만난다. */
const PAPER = [250, 250, 248];
const RISE = [176, 11, 30];
const FALL = [23, 65, 168];

/**
 * 지도 SVG 하나를 만든다.
 * @param small 지도가 카드의 오른쪽 절반만 차지하는 경우(지도+표 포맷) — 라벨을 못 넣는다.
 *              40곳 라벨을 554px 폭에 넣으면 서로 덮는다. 숫자는 표가 말한다.
 */
function mapOf({ vals, colorOf, isDark, small = false, labelTop = 0 }) {
  const ranked = [...vals.entries()].sort((a, b) => b[1] - a[1]);
  const topSet = new Set(ranked.slice(0, labelTop).map(([g]) => g));
  return choroplethSvg({
    parts: PARTS,
    margin: 0.03,
    geoClass: "mc-geo",
    extraStyle:
      `.mc-geo{stroke:#fff;stroke-width:${small ? 1.6 : 2.4}}` +
      ".mc-lab .g{font-weight:800}.mc-lab .v{font-weight:900}",
    value: (geoName, { area, maxArea }) => {
      const t = TARGET.get(geoName);
      if (!t) return null;
      const v = vals.get(geoName);
      const fill = colorOf(v);
      const base = { fill, textFill: isDark(v) ? "#ffffff" : "#1c2431", halo: fill };
      if (small) {
        /* 좁은 패널: 상위 몇 곳만 이름을 적는다. 전부 적으면 아무것도 안 읽힌다. */
        if (!topSet.has(geoName)) return { ...base, lines: [] };
        return { ...base, dy: 6, lines: [{ text: t.label, cls: "g", size: 30 }] };
      }
      /* 40곳은 25곳보다 훨씬 촘촘하다 — 글자 크기를 면적으로 정하고 하한을 낮춘다 */
      const k = Math.pow(area / maxArea, 0.28);
      const nameSize = Math.round(Math.max(15, Math.min(27, 27 * k)));
      const valSize = Math.round(nameSize * 1.14);
      return {
        ...base,
        dy: -Math.round(valSize * 0.2),
        lines: [
          { text: t.label, cls: "g", size: nameSize },
          { text: sign1(v), cls: "v", dy: valSize, size: valSize },
        ],
      };
    },
  });
}

/** 계열의 색 함수 묶음 — 오름=레드, 내림=코발트, 0에서 종이색. */
function palette(vals) {
  const nums = [...vals.values()];
  const mn = Math.min(...nums);
  const mx = Math.max(...nums);
  const posMax = Math.max(0, mx);
  const negMax = Math.max(0, -mn);
  return {
    mn,
    mx,
    colorOf: (v) =>
      v >= 0 ? ramp(PAPER, RISE, posMax ? v / posMax : 0) : ramp(PAPER, FALL, negMax ? -v / negMax : 0),
    isDark: (v) => (v >= 0 ? (posMax ? v / posMax : 0) : negMax ? -v / negMax : 0) > 0.6,
  };
}

/* 표·캡션에서는 **시 이름까지** 밝힌다 — 지도에선 좁아서 짧게 썼으니 글에서 갚는다 */
const FULL = {
  화성시동탄구: "화성 동탄구",
  성남시수정구: "성남 수정구", 성남시중원구: "성남 중원구", 성남시분당구: "성남 분당구",
  수원시장안구: "수원 장안구", 수원시팔달구: "수원 팔달구", 수원시영통구: "수원 영통구",
  안양시동안구: "안양 동안구", 용인시수지구: "용인 수지구", 용인시기흥구: "용인 기흥구",
};
const nameOf = (g) => FULL[g] || TARGET.get(g).label;

/* 최하단 설명 문구 — 오너 지시(2026-07-30): "동탄구는 화성시 전체 수치 기준" */
const DONGTAN_NOTE = "※ 동탄구는 화성시 전체 수치 기준입니다";

/** 지도 한 장 카드 (map-choropleth@1) — 값을 지도 위에 다 적는다. */
function mapCard({ seriesKey, label, titleFn }) {
  const vals = valuesOf(seriesKey);
  const { mn, mx, colorOf, isDark } = palette(vals);
  const mapSvg = mapOf({ vals, colorOf, isDark });
  const ranked = [...vals.entries()].sort((a, b) => b[1] - a[1]);
  const title = titleFn(ranked);
  if ([...title].length > 20) throw new Error(`제목이 너무 길다(${[...title].length}자): ${title}`);

  return {
    template: "map-choropleth@1",
    date,
    subtitle: `토지거래허가구역 40곳 · ${ymKo(BASE)} 이후 변화 · 단위 %`,
    title,
    mapSvg,
    /* 오너 지시: 하단 범례 삭제. 값이 지도 위에 다 적혀 있어 색 눈금이 필요 없다.
     * 다만 **기준·한계 문구는 남긴다** — 그건 범례가 아니라 정직의 문제다. */
    hideLegend: true,
    footnote: `서울 25구 전역 + 경기 15곳 · ${label} · ${ymKo(BASE)} 대비 ${ymKo(asOf)}\n${DONGTAN_NOTE}`,
    colorLo: colorOf(mn),
    colorHi: colorOf(mx),
    topName: ranked[0][0],
    topValue: `${sign1(ranked[0][1])}%`,
    /* 푸터는 한 줄이다 — 길면 "…2026.6 / 기준" 으로 잘린다 */
    source: {
      name: `한국부동산원 ${label}`,
      asOf: `${BASE.replace("-0", ".")}→${asOf.replace("-0", ".")}`,
    },
  };
}

/**
 * 지도 + 행정구역 표 카드 (singoga-map@1) — 이미 쓰던 '토허제 신고가' 카드와 같은 포맷.
 *
 * 40곳을 한 표에 다 넣을 수 없다(칸이 20줄쯤 들어간다). 그래서 **상위 N + 하위 3 + 생략 표시**로
 * 자르고, 몇 곳을 생략했는지 표 안에 적는다 — 조용히 자르면 "40곳 다 보여준 표"로 읽힌다.
 * 지도는 색만 말하고(라벨은 상위 3곳), 숫자는 표가 말한다.
 */
function rankCard({ seriesKey, label, titleFn, subtitle }) {
  const vals = valuesOf(seriesKey);
  const { colorOf, isDark } = palette(vals);
  const ranked = [...vals.entries()].sort((a, b) => b[1] - a[1]);

  /* 표에 몇 줄이 들어가는지는 렌더로 재 봤다: 상위 12 + 하위 3 이 한계다.
   * 15+3 은 표가 푸터를 덮었고, 13+3 은 마지막 줄이 하단 설명에 닿았다. */
  const TOP = 12;
  const TAIL = 3;
  const omitted = ranked.length - TOP - TAIL;
  if (omitted < 1) throw new Error(`표 자르기 계산이 안 맞다 — 대상 ${ranked.length}곳`);

  const MEDALS = ["🥇", "🥈", "🥉"];
  const row = (entry, i) => ({
    rank: i + 1,
    medal: MEDALS[i] || "",
    top: i < 3,
    gu: nameOf(entry[0]),
    hits: sign1(entry[1]),
  });
  const rows = ranked.slice(0, TOP).map(row);
  const tailRows = ranked.slice(-TAIL).map((e) => row(e, ranked.indexOf(e)));

  const title = titleFn(ranked);
  return {
    template: "singoga-map@1",
    date,
    compact: true,
    hideFooterId: false,
    note: `토지거래허가구역 40곳 · 서울 25구 전역 + 경기 15곳`,
    title,
    subtitle,
    unit: "%", // 기본값은 '건' — 이 카드는 상승률이라 단위를 바꿔 넘긴다
    head: { l: "지역", r: `${label} 상승률` },
    mapSvg: mapOf({ vals, colorOf, isDark, small: true, labelTop: 3 }),
    rows,
    tail: {
      rows: tailRows,
      note: `가운데 <b>${omitted}곳</b> 생략 · 40곳 전부 캡션에`,
    },
    footnote: `${ymKo(BASE)}(임대차 2법 시행월) 대비 ${ymKo(asOf)} · ${DONGTAN_NOTE}`,
    /* 푸터는 한 줄이다 — 길면 두 줄로 밀려 잘린다. 고시 출처는 캡션이 밝힌다. */
    source: {
      name: `한국부동산원 ${label}가격지수 · 허가구역 고시`,
      period: `${BASE.replace("-0", ".")}→${asOf.replace("-0", ".")}`,
    },
  };
}

/* p1 — 오너 지시(2026-07-30): 월세 카드는 '토허제 신고가' 카드와 같은 지도+표 포맷으로 */
const p1 = rankCard({
  seriesKey: "wolse",
  label: "월세",
  subtitle: `${ymKo(BASE)} 이후 월세가격지수 상승률`,
  titleFn: (ranked) => {
    const up = ranked.filter(([, v]) => v > 0).length;
    return up === ranked.length
      ? `토허제 40곳, <span class="hi">월세 전부</span> 올랐다`
      : `토허제 40곳 월세 상승률`;
  },
});
const p2 = mapCard({
  seriesKey: "jeonse",
  label: "전세가격지수",
  titleFn: (ranked) => {
    const down = ranked.filter(([, v]) => v < 0);
    return down.length ? `전세는 ${down.length}곳이 내렸다` : `토허제 40곳 전세 상승률`;
  },
});

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "tohuh-rent-map-p1.json"), JSON.stringify(p1, null, 2) + "\n", "utf8");
writeFileSync(join(outDir, "tohuh-rent-map-p2.json"), JSON.stringify(p2, null, 2) + "\n", "utf8");

/* 캡션의 숫자도 여기서 나온다 */
const w = valuesOf("wolse");
const j = valuesOf("jeonse");
const rank = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);
const wR = rank(w);
const jDown = rank(j).filter(([, v]) => v < 0);
const gapR = [...w.entries()].map(([g, v]) => [g, v - j.get(g)]).sort((a, b) => b[1] - a[1]);
const seoulSet = new Set([...TARGET].filter(([, t]) => SEOUL_GU.includes(t.code)).map(([g]) => g));
const ggTop = wR.filter(([g]) => !seoulSet.has(g))[0];
const caption = [
  `토지거래허가구역 40곳, 전·월세는 어떻게 됐나 🗺`,
  ``,
  `서울 25개 자치구 전역(2025년 10월 지정)과`,
  `경기 15곳(기존 12곳 + 2026년 7월 신규 3곳),`,
  `모두 ${TARGET.size}곳의 ${ymKo(BASE)} 이후 변화를 한 지도에 올렸습니다.`,
  ``,
  `[월세]`,
  `· ${wR.filter(([, v]) => v > 0).length}곳 전부 올랐습니다`,
  `· 가장 많이 : ${nameOf(wR[0][0])} ${sign1(wR[0][1])}%`,
  `· 가장 적게 : ${nameOf(wR.at(-1)[0])} ${sign1(wR.at(-1)[1])}%`,
  ...(ggTop ? [`· 경기 중 가장 많이 : ${nameOf(ggTop[0])} ${sign1(ggTop[1])}%`] : []),
  ``,
  `[전세]`,
  jDown.length
    ? `· ${jDown.length}곳은 오히려 내렸습니다 (${jDown.map(([g]) => nameOf(g)).join(", ")})`
    : `· 내린 곳은 없습니다`,
  `· 가장 많이 오른 곳은 ${nameOf(rank(j)[0][0])} ${sign1(rank(j)[0][1])}%`,
  ``,
  `두 숫자의 차이가 가장 큰 곳은 ${nameOf(gapR[0][0])}입니다.`,
  `월세 ${sign1(w.get(gapR[0][0]))}% / 전세 ${sign1(j.get(gapR[0][0]))}%`,
  ``,
  `[월세 상승률 40곳 전체]`,
  ...wR.map(([g, v], i) => `${i + 1}. ${nameOf(g)} ${sign1(v)}%`),
  ``,
  `📌 저장해두고 우리 동네 두 숫자를 비교해 보기`,
  ``,
  `—`,
  `📊 가격 : 한국부동산원 「전국주택가격동향조사」 아파트 월세·전세가격지수`,
  `   (${ymKo(asOf)} 공표분 · ${ymKo(BASE)} 대비)`,
  `🗂 허가구역 : 서울시·경기도 토지거래허가구역 지정 고시`,
  `※ 동탄구는 화성시 전체 수치 기준입니다. 지도 경계는 동탄구(2013 읍면동 합성)지만,`,
  `   동탄구 지수는 2026년 분구 이후 6개월치뿐이어서 2020년과 비교할 수 없습니다.`,
  `※ 그 외 지역은 시·군·구 경계 기준입니다.`,
  `※ 기준으로 잡은 ${ymKo(BASE)}은 시행일이 확인된 기준점이어서 쓴 것이며,`,
  `   특정 제도가 원인이라는 뜻이 아닙니다.`,
  ``,
  `#부동산 #토지거래허가구역 #전세 #월세 #데이터시각화`,
].join("\n");
mkdirSync(join(ROOT, "data/review/captions"), { recursive: true });
writeFileSync(join(ROOT, "data/review/captions/tohuh-rent-map.txt"), caption + "\n", "utf8");

console.log(
  `✅ 토허제 40곳 전·월세 지도 2장 — 월세 ${sign1(Math.min(...w.values()))}~${sign1(Math.max(...w.values()))}% · ` +
    `전세 ${sign1(Math.min(...j.values()))}~${sign1(Math.max(...j.values()))}%`,
);
console.log(`   ${p1.title} / ${p2.title} · 서울 25 + 경기 ${Object.keys(GG_CODE).length}`);
