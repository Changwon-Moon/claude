/**
 * 🏠 토허제 40곳 · 전용 84㎡ / 59㎡ 아파트 전세 실거래 평균 — 지도 + 순위표 1장. (singoga-map@1)
 *
 * 실행: node scripts/build-jeonse-band-map.mjs --type 84|59 [--date YYYY-MM-DD]
 * 출력: data/content/{date}/jeonse{84|59}-map.json + 캡션
 *
 * ── 왜 '평당가 × 34평' 이 아닌가 (2026-09-01 오너 문답, 실측으로 닫음)
 * 오너가 KOSIS 「아파트 전세 실거래 평균가격」에서 서울 2026.06 = 895.5만원/㎡ 를 보고
 * "평당 2,955만 × 34평 = 국평 10.0억" 으로 잡았다. 그런데 **그 ㎡는 전용면적이다.**
 *   · 그 표의 원자료는 국토부 실거래 신고자료이고, 신고 항목의 면적은 전용면적 하나뿐이다.
 *   · 우리가 같은 원자료를 직접 집계한 서울 25구 전용 ㎡당이 **879.6만원**(2026.06)으로
 *     KOSIS 895.5 와 1.8% 차이다. 공급 기준이었다면 1,183만원이 나왔어야 한다.
 * 그래서 ×34평(공급)은 실제로는 전용 112㎡ = 45평형의 값이 된다. 카드는 그 길로 가지 않는다.
 *
 * ── 왜 '㎡당 × 84.98' 환산이 아니라 **그 면적대 실거래만** 재는가
 * 환산은 그 구의 면적 구성에 흔들린다. 실측(2026-09-01): 종로는 환산 7.83억인데
 * 전용 84㎡ 실거래 평균은 **9.59억**이다. 우리는 잴 수 있는 것을 추정하지 않는다.
 * 면적대 창(84=82~86 / 59=57~61)은 수집기의 `AREA_BANDS` 한 곳에 있고, 집계 결과가
 * `loM2`·`hiM2` 로 그 창을 함께 실어 온다 — 카드는 데이터가 말한 창을 그대로 쓴다.
 *
 * ── 지도는 토허제 지도 모듈 하나만 쓴다 (복사하지 않는다)
 * 한강·서울 외곽선·40곳 라벨 충돌 회피·동탄구 합성 경계·지도 안 워터마크는 전부
 * `scripts/lib/tohuh-map.mjs` 에 있고 신고가·월세 카드도 같은 모듈을 쓴다.
 *
 * ── 월세 카드보다 나은 점 하나
 * R-ONE 은 동탄구 계열이 짧아 월세 카드가 **화성시 전체**로 갈음했는데, 국토부 실거래는
 * 동탄구(41597)가 독립 법정코드라 **경계와 수치가 일치한다.** 그 갈음 주석이 여기엔 없다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tohuhParts, tohuhMapSvg } from "./lib/tohuh-map.mjs";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const TYPE = arg("type") ?? "84";
if (TYPE !== "84" && TYPE !== "59") throw new Error(`--type 은 84 또는 59 다 (받은 값: ${TYPE})`);
const KEY = TYPE === "84" ? "kp84" : "kp59";
const date = arg("date") ?? new Date().toISOString().slice(0, 10);

/** 집계에 넣을 달. `--months 202606` 처럼 넘긴다.
 * ⚠️ 실거래는 신고기한이 30일이라 **한 달만 쓰면 표본이 얇은 구가 생긴다.**
 * 실측(2026-09-01): 종로구 전용 59㎡ 는 06월 9건 7.41억 / 07월 11건 5.63억 — 한 달 차이로
 * 1.8억이 움직인다. 두 달을 합치면 20건 6.43억이다. 아래 표본 하한이 그래서 있다. */
const MONTHS = (arg("months") || "202606,202607").split(",").map((s) => s.trim());

/* ── 지역 명단 ── 토허제 지정 현황의 원천은 이 데이터셋 하나다 */
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const AREAS = [
  ...tohuh.seoul.areas.map((a) => ({ ...a, region: "서울" })),
  ...tohuh.newly.areas.map((a) => ({ ...a, isNew: true, region: "경기" })),
  ...tohuh.existing.areas.map((a) => ({ ...a, region: "경기" })),
];
if (AREAS.length !== 40) throw new Error(`토허제 지역이 40곳이 아니다: ${AREAS.length}곳`);

/* ── 법정동코드 ── 이름으로 짐작하지 않는다. 하나라도 못 찾으면 던진다. */
const LAWD = {
  ...JSON.parse(readFileSync(join(ROOT, "packages/collectors/src/data/lawd-seoul.json"), "utf8")).codes,
  ...JSON.parse(readFileSync(join(ROOT, "packages/collectors/src/data/lawd-gyeonggi.json"), "utf8")).codes,
};
const noCode = AREAS.filter((a) => !LAWD[a.geoName]);
if (noCode.length) {
  throw new Error(
    `법정동코드를 못 찾은 지역: ${noCode.map((a) => a.geoName).join(", ")}\n` +
      `  packages/collectors/src/data/lawd-{seoul,gyeonggi}.json 의 이름과 tohuh-2026.json 의 geoName 이 어긋납니다.`,
  );
}

/* ── 집계 ── 수치는 전부 여기서 계산한다. 손으로 적은 숫자 0개.
 * 면적대 평균은 **건수 가중**으로 두 달을 합친다(단순평균하면 거래가 적은 달이 같은 무게를 갖는다). */
const band = new Map();
let winLo = null, winHi = null, collectedAt = null;
for (const a of AREAS) {
  const code = LAWD[a.geoName];
  let d = 0, n = 0;
  for (const ym of MONTHS) {
    const f = join(ROOT, `data/datasets/molit-rent/${code}-${ym}.json`);
    if (!existsSync(f)) {
      throw new Error(
        `${a.geoName}(${code}) ${ym} 집계 파일이 없다: ${f}\n` +
          `  data/molit-rent-queue.txt 에 한 줄 밀고 푸시하세요 (CLAUDE.md §6).`,
      );
    }
    const doc = JSON.parse(readFileSync(f, "utf8"));
    if (doc.meta?.verified !== true) throw new Error(`${a.geoName} ${ym} meta.verified 가 true 가 아니다`);
    const p = doc.agg?.price;
    if (!p) {
      throw new Error(
        `${a.geoName} ${ym} 에 agg.price 가 없다 — 금액·면적 집계 이전에 받은 옛 파일이다.\n` +
          `  force=true 로 다시 수집해야 합니다 (data/molit-rent-queue.txt).`,
      );
    }
    const b = p[KEY];
    if (!b) continue; // 그 달 그 면적대 거래가 0건 — 다른 달로 채운다
    /* 면적대 창은 **데이터가 말한 것**을 쓴다. 파일마다 다르면 수집 시점이 섞인 것이므로 던진다. */
    if (winLo == null) { winLo = b.loM2; winHi = b.hiM2; }
    else if (winLo !== b.loM2 || winHi !== b.hiM2) {
      throw new Error(
        `면적대 창이 파일마다 다르다: ${winLo}~${winHi} vs ${b.loM2}~${b.hiM2} (${a.geoName} ${ym})\n` +
          `  옛 수집분과 새 수집분이 섞였습니다 — force=true 로 전체를 다시 받으세요.`,
      );
    }
    d += b.avgDeposit * b.n;
    n += b.n;
    collectedAt = doc.meta.collectedAt;
  }
  if (n === 0) {
    throw new Error(
      `${a.geoName}: ${MONTHS.join("·")} 두 달 모두 전용 ${TYPE}㎡ 전세 거래가 0건이다 — 구멍 난 지도는 오보다.\n` +
        `  달을 늘리거나(MONTHS) 이 면적대를 포기해야 합니다.`,
    );
  }
  band.set(a.geoName, { eok: d / n / 10000, n });
}
if (winLo == null) throw new Error("면적대 창을 한 건도 못 읽었다");

/* 표본이 너무 얇으면 평균이 한두 건에 끌려다닌다. 10건 미만은 카드에 올리지 않는다. */
const tooThin = AREAS.filter((a) => band.get(a.geoName).n < 10);
if (tooThin.length) {
  throw new Error(
    `표본 10건 미만: ${tooThin.map((a) => `${a.label}(${band.get(a.geoName).n}건)`).join(", ")}\n` +
      `  평균이 몇 건에 끌려다닙니다 — 달을 늘리세요.`,
  );
}
const thin = AREAS.filter((a) => band.get(a.geoName).n < 50).sort(
  (x, y) => band.get(x.geoName).n - band.get(y.geoName).n,
);
if (thin.length) {
  console.log(
    `⚠️ 표본 50건 미만 ${thin.length}곳 — ${thin.map((a) => `${a.label} ${band.get(a.geoName).n}건`).join(" · ")}`,
  );
}

/* ── 지도 ── */
const eokOf = (g) => band.get(g).eok;
const eokTxt = (v) => `${v.toFixed(1)}억`;
const parts = tohuhParts(AREAS);
const mapSvg = tohuhMapSvg({
  parts,
  valueOf: (info) => eokOf(info.geoName),
  textOf: (p) => eokTxt(p.v),
  /* 라벨은 '행정구 / 값' 2줄 — 좁은 도형에서 1줄보다 잘 들어간다(월세 카드와 같은 판단) */
  twoLine: true,
  labelWidth: 118,
  placement: "nearest",
  /* 지도 안 @wirit_note 스탬프를 끈다. 이 모듈은 스탬프를 **2개** 찍는데 BRAND.md 는
   * 「아이디는 카드당 1개」다. 우리는 푸터 워터마크(슬롯 B, 모든 카드 기본)를 쓰므로 여기는 끈다.
   * — 오너 지적 2026-09-01 "푸터에 위릿노트가 안 들어가 있다". 앞선 판은 월세 카드의
   *   hideFooterId 를 근거 없이 따라 했고, 그 결과 카드에 아이디가 2개(지도) + 0개(푸터) 였다. */
  stamps: false,
  /* ── 지도 글자를 전부 잉크색으로 (오너 지시 2026-09-01)
   * 그러려면 **진한 끝을 밝혀야 한다.** 판형 기본 진한끝 rgb(176,11,30) 위의 잉크는 대비
   * 2.46 으로 WCAG 큰글자 AA(3.0)에도 못 미친다 — 서초·강남이 안 읽힌다.
   * 계정 레드 `#E5484D`(BRAND.md 데이터용 레드)를 진한끝으로 쓰면 **전 구간 4.54 이상**이다.
   * 색을 새로 만든 게 아니라 계정이 이미 가진 빨강으로 내린 것이다. */
  labelInk: true,
  colorLo: [255, 235, 232],
  colorHi: [229, 72, 77],
  /* 라벨을 경계에서 가장 먼 안쪽 점에 놓고, 글자가 경계선에 닿으면 벌점 (오너 지시 2026-09-01
   * "중구·성동구 포함 전체적으로 경계 라인에 닿지 않게 중앙으로"). 무게중심은 오목한 구에서
   * 경계 바로 옆에 떨어진다 — 최대 내접원 중심이 정의상 가장 넉넉한 자리다. */
  centerFit: true,
  /* 최저값이 0 이 아니라 4억대라 [0,max] 정규화하면 색이 다 비슷해진다 → [min,max] 로 편다 */
  minValue: Math.min(...AREAS.map((a) => eokOf(a.geoName))),
});

/* ── 표 ── **1~17위 + ··· + 38~40위** (오너 2026-09-01: *"위에서 열 몇 개 + … + 하위 3개"*)
 *
 * 이 판형의 40곳 카드는 원래 이 모양이었다 — `build-jeonwolse-map.mjs`(월세 비중 지도)가
 * 같은 20행 구조를 쓴다. 처음에 상위 8곳만 실었던 것은 **월세 상승분 카드**(`tohuh-rent-map`)를
 * 따라간 것인데, 그 카드는 제목을 키운 대가로 표를 줄인 별개 판단이었다(2026-07-30).
 * 40곳 지도의 기본은 20행이고, 지도에서 우리 동네를 찾은 사람이 **순위까지 같이 보는 것**이
 * 이 카드의 값이다.
 *
 * ⚠️ 꼬리 행은 템플릿이 `ratio`(보조값)를 렌더하지 않는다. 17행에만 건수를 달면 꼬리 3행과
 * 모양이 갈리고, 20행 전부에 달면 두 줄짜리 행이 20개라 표가 넘친다.
 * → **표에서 건수를 빼고** 얇은 표본은 하단 주석과 캡션이 말한다(아래 footnote 의 minN).
 */
const ranked = [...AREAS].sort((a, b) => eokOf(b.geoName) - eokOf(a.geoName));
const MEDALS = ["🥇", "🥈", "🥉"];
/* 제목이 커진 만큼 표가 짧아져야 한다(오너 2026-09-01). 값은 렌더 실측으로 맞춘다 —
 * 넘치면 QA 가 잡고, 너무 적으면 표 아래가 빈다. */
const HEAD_N = Number(process.env.WIRIT_HEAD_N || 16);
const TAIL_N = 3;
if (AREAS.length <= HEAD_N + TAIL_N) throw new Error("지역이 20곳 이하면 꼬리를 만들 이유가 없다 — 전부 싣는다");
const rows = ranked.slice(0, HEAD_N).map((a, i) => ({
  rank: i + 1,
  medal: MEDALS[i] || "",
  top: i < 3,
  gu: a.label,
  hits: eokOf(a.geoName).toFixed(1),
}));
/* 하위 3곳 — 순위 번호는 **전체 곳수에서 센다**(38·39·40). 손으로 적지 않는다. */
const bottom = ranked.slice(-TAIL_N);
const tail = {
  rows: bottom.map((a, i) => ({
    rank: AREAS.length - TAIL_N + 1 + i,
    gu: a.label,
    hits: eokOf(a.geoName).toFixed(1),
  })),
  /* 브래킷 주석은 넣지 않는다 — 표 오른쪽이 지도라 겹친다(월세 비중 카드도 같은 이유로 뺐다) */
};

/* 권역 평균 — 건수 가중. 제목이 쓰는 값이라 반드시 계산으로 낸다. */
const avgOf = (reg) => {
  const list = AREAS.filter((a) => a.region === reg);
  const n = list.reduce((s, a) => s + band.get(a.geoName).n, 0);
  const d = list.reduce((s, a) => s + band.get(a.geoName).eok * band.get(a.geoName).n, 0);
  return { eok: d / n, n };
};
/** "2026.06월" / "2026.06~07월" — MONTHS 에서 만든다 */
const monthsLabel = (() => {
  const ms = [...MONTHS].sort();
  const mm = (x) => x.slice(4, 6);
  return ms.length === 1 ? `${ms[0].slice(0, 4)}.${mm(ms[0])}월`
    : `${ms[0].slice(0, 4)}.${mm(ms[0])}~${mm(ms.at(-1))}월`;
})();
const seoul = avgOf("서울");
const gg = avgOf("경기");
const totalN = seoul.n + gg.n;
/** 표에서 건수를 뺀 대신, 표본이 가장 얇은 곳을 하단 주석이 밝힌다 */
const minSample = AREAS.map((a) => ({ label: a.label, n: band.get(a.geoName).n }))
  .sort((x, y) => x.n - y.n)[0];
/** 평형 통칭 — 전용 84㎡ = 공급 34평(국평), 전용 59㎡ = 공급 25평. **같은 집을 가리키는 다른 이름**이라
 * 통칭을 써도 오보가 아니다. 오보였던 것은 「전용 평당가에 34(공급평)를 곱하는 것」이지 호칭이 아니었다. */
const PYEONG_NAME = TYPE === "84" ? "34평" : "25평";
const top1 = ranked[0];
const last = ranked.at(-1);
const gap = eokOf(top1.geoName) / eokOf(last.geoName);

const card = {
  template: "singoga-map@1",
  date,
  compact: true,
  /* 20행짜리 표에는 `spread`(행 간격 펴기)를 쓰지 않는다 — 행이 적은 카드용이라 넘친다.
   * 대신 `centerBody` 를 켠다: 판형이 행 높이를 줄이고 본문을 세로 가운데로 맞춘다
   * (`.sm-cb.sm-c .sm-row` — 월세 비중 지도가 같은 17+3 행에서 쓰는 조합이다). */
  centerBody: true,
  /* centerBody 는 상단 패딩을 72px 로 내려 제목이 우상단 뱃지 아래 11px 로 붙는다.
   * CARD_CHECKLIST §2 는 세로 30px 이상을 요구하고 designQa 의 badgeclear 가 그걸 잰다. */
  topGap: true,
  /* 강조색은 **빨강**(판형 기본값) — 오너 지시 2026-09-01.
   * 처음엔 코발트로 냈다: 빨강은 상승·과열 전용이고(docs/BRAND.md) 이 카드는 '수준'을
   * 말한다는 이유였다. 오너가 이 카드에서는 빨강으로 정했고, 그러면 지도 그라데이션도
   * 같이 빨강이어야 한다 — 한쪽만 바꾸면 카드 안에 색이 둘 남는다.
   * (판형의 `accent: "cobalt"` 변형은 그대로 남아 있다. 지금은 아무 카드도 쓰지 않는다.) */
  /* 기간은 **집계한 달에서 만든다** — 손으로 적으면 달을 바꿀 때 카드가 거짓말을 한다 */
  note: `${monthsLabel} 실거래 · 수도권 토지거래허가구역 40곳`,
  /* 숫자를 손으로 적지 않는다 — 수집이 갱신되면 제목도 따라 바뀐다.
   * '국평'·'25평' 같은 통칭 대신 **전용 ○○㎡** 로 쓴다. 통칭은 공급면적 기준이라
   * 이 카드의 수치(전용)와 기준이 어긋난다(2026-09-01).
   *
   * ⚠️ 맨 앞의 '수도권'을 빼지 않는다. 이 카드는 경기 15곳을 함께 싣는데 제목이 '서울'만
   * 말하면 **표 3위에 과천시가 앉는다** — 범위 검사(scope)가 실제로 그것을 막았다.
   * '서울 평균'은 그 범위 안에서 고른 대표값이라는 뜻이고, 범위 자체는 수도권이다. */
  /* 오너 확정 문안(2026-09-01). 주어는 **서울**이고 값도 서울 25구 평균이다.
   * 표·지도는 수도권 40곳이라 범위 검사가 막는 자리인데, 오너가 알고 고른 것이므로
   * 관제탑(sets.json)의 `scopeAck` 에 경기 15곳 명단과 이유를 적어 통과시킨다.
   * 명단에 없는 지역이 새로 끼면 그대로 막힌다 — 07-27 의 캐시 오염 사고는 여전히 잡힌다. */
  /* 강조 둘: **평형은 파랑(hi-b)**, **금액은 빨강(hi)** — 오너 2026-09-01.
   * 한 문장의 주어(어떤 집)와 술어(얼마)라 강조가 둘이어도 초점이 갈리지 않는다
   * (청약 카드의 「훅 + 금액 둘 다 코발트」와 같은 판단 — 청약분양-카드-기준 §2). */
  title: `서울 <span class="hi-b">${PYEONG_NAME}</span> 평균 전세 <span class="hi">${seoul.eok.toFixed(1)}억</span>`,
  fitTitle: true,
  unit: "억",
  /* 머리글은 **2열**(지역 / 값)이다. 3열(`head.c`)로 두면 판형이 `sm-h3` 를 켜 값 칸을
   * **176px 로 못박고**, 남은 폭에 「성남시 분당구」·「용인시 기흥구」가 두 줄로 접혀
   * 20행 표가 카드 밖으로 236px 넘쳤다(2026-09-01 실측). 월세 비중 지도가 2열인 이유가 이것이다.
   * 3열은 8행짜리 카드(월세 상승분)에서만 성립한다. */
  head: { l: "지역", r: `전용 ${TYPE}㎡ 전세` },
  mapSvg,
  rows,
  tail,
  /* 표에서 건수를 뺐으므로 **표본의 얇은 쪽**을 여기서 말한다. 가장 적은 곳을 밝히면
   * 나머지는 그보다 두껍다는 뜻이 되어, 40줄을 적지 않고도 독자가 평균의 무게를 잰다. */
  /* ⚠️ 캡션이 말하는 억 단위 값은 **카드에도 있어야 한다**(caption-number 게이트).
   * 경기 평균을 여기서 뺐더니 캡션의 「경기 평균 4.2억」이 카드에 없는 숫자로 잡혀 막혔다
   * (84 카드는 4.2억이 우연히 지도에 있어 안 걸렸다 — 우연에 기대지 않는다). */
  source: { name: "국토교통부 아파트 전월세 실거래가 · 서울시·경기도 허가구역 고시" },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const slug = `jeonse${TYPE}-map`;
writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");

/* ── 캡션 ── 숫자는 전부 위 계산값 */
const ggRanked = ranked.filter((a) => a.region === "경기");
const seoulRanked = ranked.filter((a) => a.region === "서울");
const nm = (a) => a.label;
const line = (a) => `${eokTxt(eokOf(a.geoName))} (${band.get(a.geoName).n.toLocaleString()}건)`;
const caption = [
  `전용 ${TYPE}㎡ 전세, 서울 평균 ${seoul.eok.toFixed(1)}억. 🏠`,
  `가장 비싼 곳과 가장 싼 곳이 ${gap.toFixed(1)}배 벌어집니다.`,
  ``,
  `서울 25개 자치구 전역 + 경기 15곳,`,
  `토지거래허가구역 40곳의 아파트 전세 실거래를`,
  `전용 ${winLo}~${winHi}㎡ 만 골라 평균했습니다.`,
  `(2026년 6~7월 신고분 ${totalN.toLocaleString()}건)`,
  ``,
  /* ⚠️ 캡션의 억 단위 값은 **카드에도 있어야 한다**(caption-number 게이트).
   * 서울 평균은 제목에 있으니 괜찮지만, 하단 주석을 뺀 뒤로 **경기 평균은 카드 어디에도 없다**
   * — 그래서 평균 대신 카드에 찍혀 있는 경기 최고·최저로 말한다(2026-09-01). */
  `· 서울 평균 : ${seoul.eok.toFixed(1)}억 (${seoul.n.toLocaleString()}건)`,
  `· 경기 15곳 : ${eokTxt(eokOf(ggRanked.at(-1).geoName))} ~ ${eokTxt(eokOf(ggRanked[0].geoName))} (${gg.n.toLocaleString()}건)`,
  `· 최고 : ${nm(top1)} ${line(top1)}`,
  `· 최저 : ${nm(last)} ${line(last)}`,
  `· 경기 최고 : ${nm(ggRanked[0])} ${line(ggRanked[0])}`,
  `· 서울 최저 : ${nm(seoulRanked.at(-1))} ${line(seoulRanked.at(-1))}`,
  ``,
  `[40곳 전체 · 전용 ${TYPE}㎡ 전세 평균]`,
  ...ranked.map((a, i) => `${i + 1}. ${nm(a)} ${eokTxt(eokOf(a.geoName))}`),
  ``,
  `📌 저장해두고 우리 동네가 몇 위인지 확인하기`,
  ``,
  `—`,
  `📊 출처 · 국토교통부 아파트 전월세 실거래가`,
  `   2026년 6~7월 신고분 · 전세(월세 0원) 계약만`,
  `🗂 허가구역 : 서울시·경기도 토지거래허가구역 지정 고시`,
  `   서울 25개 자치구 전역(2025년 10월) · 경기 15곳(기존 12곳 + 2026년 7월 신규 3곳 ⚡)`,
  ``,
  `※ 면적은 전부 전용면적입니다. 실거래 신고에는 공급면적이 없습니다`,
  `   — '${TYPE === "84" ? "34" : "25"}평'으로 부르는 그 평형이지만, 평(공급) 기준으로 곱한 값이 아닙니다`,
  `※ 평균은 그 두 달에 계약된 단지 구성에 흔들립니다`,
  ...(thin.length
    ? [`※ 거래가 적은 곳은 평균이 크게 움직입니다 — ${thin.slice(0, 3).map((a) => `${nm(a)} ${band.get(a.geoName).n}건`).join(" · ")}`]
    : []),
  `※ 신규·갱신 계약이 모두 섞여 있습니다 (갱신은 5% 상한이 걸린 건이 있습니다)`,
  `※ 시·군·구 경계 기준이며, 실제 허가구역이 일부인 곳이 있습니다`,
  ``,
  `#부동산 #전세 #전세가 #토지거래허가구역 #데이터시각화`,
].join("\n");
mkdirSync(join(ROOT, "data/review/captions"), { recursive: true });
writeCaption(slug, caption);

console.log(
  `✅ 토허제 40곳 전용 ${TYPE}㎡ 전세 (${winLo}~${winHi}㎡ · ${MONTHS.join(",")}) — ` +
    `서울 ${seoul.eok.toFixed(2)}억 · 경기 ${gg.eok.toFixed(2)}억 · 실거래 ${totalN.toLocaleString()}건`,
);
console.log(
  `   1위 ${nm(top1)} ${eokTxt(eokOf(top1.geoName))} · 40위 ${nm(last)} ${eokTxt(eokOf(last.geoName))} · 격차 ${gap.toFixed(2)}배`,
);
console.log(`   → data/content/${date}/${slug}.json`);
