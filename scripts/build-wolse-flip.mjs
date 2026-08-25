/**
 * 📉📈 미쳐버린 서울 월세 폭등 상황.
 *   p1  year-bars@2     서울 아파트 월세가격지수 연간 변화율 (5년 마이너스 → 6년 플러스)
 *                       ★ **오너 확정(2026-07-30) — 발행 세트는 이 한 장이다.**
 *                       확정 이후 이 카드의 픽셀은 바꾸지 않는다(md5 = docs/CARD_CHECKLIST.md §5)
 *   p2  ranking-table@1 자치구 월세 상승률 1~13위 (전세와 나란히)
 *   p3  ranking-table@1 자치구 14~25위 + "25곳 중 25곳" 요약
 *
 * ⚠️ p2·p3 는 **발행 세트에서 뺐다**(2026-07-30). 기준 시점이 p1(연간 변화율)과 다르다 —
 *    2020-07(임대차 2법 시행월) 이후 누적이라 한 캐러셀에 섞으면 독자가 두 기준을 헷갈린다.
 *    빌더는 그대로 두었으니 별도 소재로 낼 때 sets.json 에 다시 실으면 된다.
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
import { writeCaption } from "./lib/caption-signature.mjs";

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
/** 좌측 카드용 짧은 표기 — "2020.09월" */
const ymNum = (ym) => `${ym.slice(0, 4)}.${ym.slice(5)}월`;
/** 지수값 — 소수 둘째 자리까지. 반올림을 손으로 하지 않는다. */
const idx = (ym) => (at(wolse, ym) ?? 0).toFixed(2);
/** 지수값(카드용) — 소수 한 자리. 카드는 한 줄이라 자릿수를 줄인다. */
const idx1 = (ym) => (at(wolse, ym) ?? 0).toFixed(1);

const negRun = groupsRaw.find((g) => g.tone === "neg");
const posRun = groupsRaw.at(-1);

/* ── 마지막 연도의 연간 추정 (2026-07-30 오너 지시) ──
 * ⚠️ **원자료에 없는 숫자다.** 그래서 규칙을 여기 한 줄로 못박고, 카드에서도 분리해 그린다:
 *     추정 = 상반기 실적 × (12 / 지난 개월수)   ← 남은 기간이 같은 속도라고 가정
 * 이건 예측 모델이 아니라 **명시된 산술 가정**이다. 계절성·정책 변화를 전혀 반영하지 않는다.
 * 그래서 ① 점선+사선 막대 ② "하반기 추정" 꼬리표 ③ 실측/추정 경계 세로선 ④ 캡션 주석
 * 네 곳에서 실측과 갈라 놓는다. 하나만 빠뜨리면 추정치가 사실로 읽힌다. */
const partialRow = yearRows.find((r) => r.partial);
const monthsDone = Number(lastMon);
const estAdd = partialRow ? partialRow.v * ((12 - monthsDone) / monthsDone) : null;
const estFull = partialRow ? partialRow.v + estAdd : null;

/* ── 세로 막대 좌표 (플롯 높이 대비 %) ──
 * 0선 위쪽은 최대 오름(추정 포함), 아래쪽은 최대 내림이 차지한다. */
const maxUp = Math.max(...yearRows.map((r) => (r.v > 0 ? r.v : 0)), estFull ?? 0);
const maxDown = Math.max(...yearRows.map((r) => (r.v < 0 ? -r.v : 0)));
/* 가장 높은 막대 위에 남길 여유.
 * 1.18 → 1.42(추정 카드가 막대 위에 앉던 시안) → **1.10**(2026-07-30 2차 수정).
 * 카드들이 플롯 좌측으로 내려갔으니 막대 위에는 값 라벨 한 줄만 앉는다.
 * 그만큼 막대가 커져 "제목과 푸터 사이를 꽉 채운다"(오너 지시). */
const HEADROOM = 1.1;
const spanUp = maxUp * HEADROOM;
/* 내림 막대 아래에 값 라벨이 들어갈 자리. 1.75 → 1.45 로 줄였다(오너 지시: 꽉 차 보이게).
 * 이 값을 줄이면 0선이 아래로 내려가 **양수 막대가 그만큼 커진다**.
 * 1.3 이하로 내리면 −1.5 값 라벨이 연도 축과 겹친다(렌더로 확인). */
const spanDown = maxDown * 1.45;
const total = spanUp + spanDown;
const zeroAt = (spanUp / total) * 100;
const pctOf = (v) => `${((Math.abs(v) / total) * 100).toFixed(2)}%`;

/* 막대 라벨은 **부호+숫자만** 쓴다(단위는 부제에). "%"를 붙이면 라벨이 칸보다 넓어져
 * 옆 칸과 겹친다(첫 렌더에서 +2.0% / +1.8% / +2.3% 가 뭉쳤다). */
const bare = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);

/* 추정 배수(12 / 지난 개월수) — 카드에 적는 '가정' 그 자체다. 6월까지면 ×2.
 * 문구를 손으로 "×2"라고 쓰면 7월 공표분에서 거짓이 된다. */
const estMul = monthsDone ? 12 / monthsDone : null;
const mulTxt = estMul == null ? "" : Number.isInteger(estMul) ? String(estMul) : estMul.toFixed(1);

const points = yearRows.map((r) => {
  const isEst = r.partial && estAdd != null;
  const h = pctOf(r.v);
  return {
    year: String(r.y),
    /* 추정 연도만 단위를 붙인다 — 이 카드가 말하려는 한 숫자다 */
    value: isEst ? `${bare(estFull)}%` : bare(r.v),
    dir: r.v < 0 ? "down" : "up",
    h,
    ...(isEst
      ? {
          hEst: pctOf(estAdd),
          totalH: pctOf(estFull),
          /* 정사각 2줄 뱃지(오너 지시 6차) — 알약형 1줄은 막대보다 넓어 곡선과 겹쳤다 */
          tag: ["하반기", "추정"],
          /* 오너 지시: 실측(6월까지) 값도 그래프에 표기. 추정 막대가 위에 쌓여도
           * **어디까지가 실측인지** 숫자로 보인다. */
          solidValue: `${bare(r.v)}`,
        }
      : { totalH: h }),
    /* ⚠️ '최고 실측 연도' 강조는 넣지 않는다.
     * 2025년(연 +4.5%)보다 2026년 상반기 실측(+4.6%)이 이미 높아서, 2025에 최고 표식을 달면
     * 독자가 두 강조 사이에서 초점을 잃는다. 이 카드의 초점은 마지막 막대 하나다. */
  };
});
/* ── 월세가격지수 곡선 (2026-07-30 오너 제안: 지수 그래프도 겹쳐 보기) ──
 * 막대 = **그 해에 얼마나 올랐나**(연간 변화율), 곡선 = **어디까지 왔나**(지수 수준).
 * 둘은 축이 다르다. 그래서:
 *   · 곡선에는 **눈금을 넣지 않는다.** 두 축의 눈금을 나란히 두면 "선이 막대를 앞질렀다" 같은
 *     착시가 생긴다. 시작값·끝값만 적어 수준을 읽게 한다.
 *   · 곡선은 옅은 잉크색 배경 레이어다(막대 뒤). 데이터지만 **주인공은 막대**다.
 *   · 지수 기준시점(2026-01=100)을 카드에 밝힌다 — 안 밝히면 103.90 이 뭔지 알 수 없다.
 * x 는 연도 칸 안의 월 위치, y 는 0선 위 영역에 지수 최소~최대를 매핑한다(정규화 1000×1000). */
const lineMonths = Object.keys(wolse)
  .filter((m) => m >= `${firstYear}-01` && m <= asOf)
  .sort();
if (lineMonths.length < 24) throw new Error(`지수 곡선용 월이 ${lineMonths.length}개뿐이다`);
const lineVals = lineMonths.map((m) => wolse[m]);
const lMin = Math.min(...lineVals);
const lMax = Math.max(...lineVals);
const nCols = points.length;
const Y_TOP = 110; // 플롯 위쪽 여유(추정 배지·값 라벨 자리)
/* 곡선 바닥(최저점) — 0선 바로 위(0.94)에 두면 최하점(2020-09)이 2021 막대를 관통한다
 * (2026-07-30 오너: "2020 최하점을 2021 막대와 겹치지 않게 위로").
 * 그래서 **첫 플러스 연도 막대의 상단보다 30 위**로 올린다. 상한(끝점=최고값)은
 * Y_TOP 에 앵커돼 있어 Y_BOT 을 올려도 2026 끝점은 움직이지 않는다. */
const zeroNorm = zeroAt * 10; // zeroAt 는 %, 정규화 좌표는 1000
const firstPos = yearRows.find((r) => r.v > 0);
const Y_BOT = firstPos
  ? Math.min(zeroNorm * 0.94, zeroNorm - (firstPos.v / total) * 1000 - 30)
  : zeroNorm * 0.94;
const lx = (m) => {
  const y = Number(m.slice(0, 4));
  const mo = Number(m.slice(5));
  return (((y - firstYear) + (mo - 0.5) / 12) / nCols) * 1000;
};
const ly = (v) => Y_BOT - ((v - lMin) / (lMax - lMin || 1)) * (Y_BOT - Y_TOP);
/* ── 곡선 위 지수 레이블 (2026-07-30 오너 3차: 2016·2020·2026 세 개만) ──
 * 11개를 다 찍으니 회색 숫자 띠가 생겨 곡선 자체가 안 읽혔다. 셋만 남긴다:
 *   시작(2016) → 바닥 근처(2020) → 지금(2026). 곡선의 이야기가 이 세 점이다.
 * 2016 은 **곡선 시작점(2016-01)**을 쓴다 — 오너가 값(90.94)을 지정했고,
 * 왼쪽 끝에서 독자가 찾는 건 '곡선이 어디서 출발했나'다. 2020·2026 은 6월 말.
 * anchor: "s"=시작점(오른쪽 위로), "l"=끝점(왼쪽으로 — 위는 추정 막대 라벨 자리), 기본=위 가운데 */
const LABEL_YEARS = [2020, lastYear];
const labelMonths = [{ m: lineMonths[0], anchor: "s" }];
for (const y of LABEL_YEARS) {
  const m = `${y}-06`;
  if (m <= asOf && at(wolse, m) != null)
    labelMonths.push({ m, ...(y === lastYear ? { anchor: "l" } : {}) });
}
const indexLine = {
  points: lineMonths.map((m) => `${lx(m).toFixed(1)},${ly(wolse[m]).toFixed(1)}`).join(" "),
  labels: labelMonths.map(({ m, anchor }) => ({
    x: `${(lx(m) / 10).toFixed(2)}%`,
    y: `${(ly(wolse[m]) / 10).toFixed(2)}%`,
    /* 원형 뱃지 안에 들어가야 하니 **소수 한 자리**다(둘째 자리까지 쓰면 6글자라 원을 넘친다).
     * 카드의 103.9 와도 같은 자릿수 — 한 카드 안에서 정밀도가 엇갈리면 독자가 의심한다. */
    text: idx1(m),
    ...(anchor ? { anchor } : {}),
  })),
};

/* ── 값 라벨을 막대 **안**(흰 글씨)에 넣을 칸 고르기 (오너 지시 6차: +1.7 을 막대 안으로) ──
 * 눈대중으로 "2021번 칸"이라고 박아두면 데이터가 바뀔 때 엉뚱한 칸이 흰 글씨가 된다.
 * 규칙: 막대 위에 라벨을 놓을 자리(막대 top - 라벨 높이)가 **곡선보다 위**로 올라가면
 *       곡선과 겹친다 → 그 칸은 라벨을 막대 안으로 내린다.
 * 지금 데이터에서는 2021 한 칸만 걸린다(곡선이 바닥 근처를 지나는 해). */
const LABEL_H = 44; // 라벨 높이 + 막대와의 간격(정규화 1000 기준)
for (const p of points) {
  if (p.dir !== "up" || p.hEst) continue; // 추정 칸은 이미 막대 안에 실측값을 흰 글씨로 쓴다
  const barTop = zeroNorm - parseFloat(p.h) * 10; // % → 정규화 1000
  const curveY = ly(at(wolse, `${p.year}-06`) ?? lMin);
  /* 막대가 라벨을 품을 만큼 높지 않으면 오히려 글자가 막대를 넘친다 — 그때는 그냥 위에 둔다 */
  if (barTop - LABEL_H < curveY && parseFloat(p.h) * 10 > LABEL_H + 18) p.valueInside = true;
}

/* 실측/추정 경계선 — 마지막 막대의 왼쪽 경계에 세운다 */
const splitAt = partialRow ? `${((points.length - 1) / points.length) * 100}%` : "";

const p1 = {
  template: "year-bars@2",
  date,
  /* 단위(%)는 여기로 옮겼다 — lede 를 지웠고, 축 왼쪽에 붙이면 −1.5 라벨과 겹친다.
   * ⚠️ 캡션은 한 줄이다. "…공표분"까지 붙였더니 두 줄로 접혀 제목을 밀어냈다(렌더 확인).
   *    공표 기준월은 하단 푸터(source.asOf)에 이미 있으니 여기서는 뺀다. */
  /* 오너 지시(2026-07-30): 최상단 문구에서 '순수' 삭제, 3차 지시로 '단위 %'도 삭제.
   * % 단위는 좌측 추정 카드 값(+9.2%)과 마지막 막대 라벨에 남아 있다. */
  subtitle: `서울 아파트 · 월세가격지수 연간 변화율`,
  /* 오너 지시(2026-07-30): 제목은 이 문구 그대로 한 줄. 템플릿이 폭에 맞춰 폰트를 줄인다.
   * 3차 지시로 '월세 폭등'만 레드 — 이 카드에서 레드는 '오름'이라 색이 뜻과 어긋나지 않는다. */
  title: `미쳐버린 서울 <span class="hi">월세 폭등</span> 상황`,
  zeroAt: `${zeroAt.toFixed(2)}%`,
  colGap: "10px",
  splitAt,
  /* 장식 곡선은 뺐다(2026-07-30 오너 지시로 **실제 지수 곡선**이 들어온다).
   * 장식과 데이터를 같이 두면 독자가 어느 선이 사실인지 구분하지 못한다. */
  arrow: false,
  line: indexLine,
  stamp: true, // 0선 아래 빈 칸의 wirit 워터마크 — 그래픽만 잘라 써도 출처가 따라간다
  /* 4차 지시: 지수 곡선 아래·막대 위 빈 칸에 워터마크 하나 더.
   * 초년도(2016~2020)는 막대가 0선 아래에만 있어 0선 바로 위가 통째로 빈다. */
  stamp2: true,
  points,
  /* ── 플롯 좌측 정보 블록 (2026-07-30 2차 수정) ──
   * 오너 지시: '6년 연속 상승중' 카드는 삭제. 월세가격지수 카드는 아래 형태로 디벨롭하고
   * 추정 배지와 함께 **그래프 좌측 빈 칸**에 둔다.
   *
   * 과거 기준월은 **지수 최저점**을 쓴다. "몇 년부터"처럼 임의로 고른 해가 아니라
   * 데이터가 정한 바닥이라 "여기서 여기까지"가 반박당하지 않는다. */
  /* ── 좌측 강조 카드 2장 (2026-07-30 오너 3차 지시) ──
   * 각 카드는 자기 그래프 요소와 **색을 공유**한다:
   *   est(레드·점선·사선) = 추정 막대 / idx(잉크·회색) = 지수 곡선
   * 회색 범례문(막대·곡선 설명)은 삭제 — 카드가 그 역할을 대신한다.
   * ⚠️ est 카드의 산술 가정 한 줄(n)은 남긴다. 없으면 추정치가 실측처럼 읽힌다.
   * ⚠️ "역사상 최고 경신"은 isPeakNow 를 계산으로 확인했을 때만 적는다 — 손으로 적으면
   *    다음 달 데이터에서 거짓이 될 수 있다. */
  /* 3차 지시: 카드 두 장을 **좌우로**(좌 = 월세지수, 우 = 상승률) · 글자 크기는 전부 동일.
   * 강조는 색과 굵기로만 준다. 유일하게 작은 글자는 (추정) — 부가 표기다.
   * ⚠️ 오너 메모에는 "9.6%" 로 적혀 있었지만 계산값은 +9.2% 다(6개월 실측 +4.6% × 2).
   *    수치는 코드가 뽑은 값만 쓴다 — 손으로 적으면 그게 오보다. */
  side: {
    cards: [
      {
        style: "idx",
        /* "역사상 최고"는 **계산으로 확인됐을 때만** 쓴다. 손으로 박아두면 다음 달 공표분에서
         * 지수가 꺾이는 순간 카드가 거짓말을 한다. 아니면 최고 시점을 대신 적는다. */
        lines: ["월세지수", isPeakNow ? "역사상 최고" : `최고는 ${ymNum(peak)}`],
        value: isPeakNow ? idx1(asOf) : idx1(peak),
      },
      ...(partialRow
        ? [
            {
              style: "est",
              lines: [`${lastYear}년`, "월세상승률"],
              value: `${bare(estFull)}%`,
              /* (추정) 은 작아도 반드시 붙는다 — 이 숫자만 원자료에 없다 */
              small: "(추정)",
            },
          ]
        : []),
    ],
  },
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
/* 지수 계열의 시작월·기준월(=100)도 데이터에서 읽는다 — 손으로 적으면 개편 때 거짓이 된다 */
const seriesFrom = allMonths[0];
const baseMonth = allMonths.find((mo) => wolse[mo] === 100) || null;

const caption = nl(
  /* 인스타는 첫 두 줄만 보이고 나머지는 '더 보기'로 접힌다 — 반전을 여기서 끝낸다 */
  `서울 월세, 원래부터 오르던 게 아닙니다 📉📈`,
  `${negRows.length}년 연속 마이너스였다가 ${posRows.length}년 연속 오르고 있습니다.`,
  ``,
  `월세가격지수 연간 변화율을 그대로 늘어놓으면 이렇게 됩니다.`,
  ``,
  ...negRows.map(yearLine),
  `· · · 여기서 뒤집힙니다 · · ·`,
  ...posRows.map(yearLine),
  ``,
  `지수는 ${idx1(asOf)},`,
  isPeakNow
    ? `통계 시작(${ymKo(seriesFrom)}) 이후 가장 높습니다.`
    : `사상 최고는 ${ymKo(peak)}의 ${idx1(peak)}입니다.`,
  ``,
  /* 추정치는 캡션에서도 실측과 갈라 놓는다 — 카드의 점선 막대와 같은 이야기 */
  `올해는 반년 만에 이미 ${sign1(partialRow.v)}입니다.`,
  `남은 반년이 같은 속도라면 연간 ${bare(estFull)}% —`,
  `카드의 점선 막대가 그 추정치입니다.`,
  `⚠️ 산술 가정(${monthsDone}개월 실측 × ${mulTxt})일 뿐이고,`,
  `   계절성·정책 변화는 반영하지 않았습니다.`,
  ``,
  /* 약점을 우리 입으로 먼저 말한다. 숫자까지 붙여야 신뢰가 된다. */
  `한 가지 덧붙이면, 전세도 같이 오르고 있습니다.`,
  `올해 상반기 전세 ${sign1(h1J)} / 월세 ${sign1(h1W)}.`,
  /* ⚠️ 인스타 캡션은 마크다운을 못 쓴다 — **강조**를 넣으면 별표가 그대로 보인다 */
  `'월세만' 오른 게 아니라, 월세가 ${posRows.length}년째 한 방향이라는 게 이 카드의 요점입니다.`,
  ``,
  `📌 저장해두고 내년 이맘때 다시 보기`,
  ``,
  `—`,
  /* "출처" 라는 낱말이 있어야 캡션 린트를 통과한다 — 이모지만으론 독자도 출처인지 모른다 */
  `📊 출처 · 한국부동산원 「전국주택가격동향조사」`,
  `· 서울 아파트 · 순수 월세가격지수(보증금 12개월치 이하${baseMonth ? `, ${ymKo(baseMonth)}=100` : ""})`,
  `· ${ymKo(asOf)} 공표분 · 지수 통계 시작 ${ymKo(seriesFrom)}`,
  `· 연간 변화율 = 전년 12월 대비 12월 (${lastYear}년만 ${monthsDone}월까지 누적)`,
  ``,
  `#부동산 #월세 #서울아파트 #월세지수 #임대차`,
);
mkdirSync(join(ROOT, "data/review/captions"), { recursive: true });
writeCaption("wolse-flip", caption); // ⚠️ 서명은 writeCaption 이 붙인다 (lib/caption-signature.mjs)

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
