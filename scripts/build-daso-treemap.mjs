/**
 * 집합건물 보유 채수별 분포 트리맵 2컷 (`daso-treemap@1`).
 *
 * ── 이 카드가 지키는 것
 * ① **두 지수를 곱해 국민 기준으로 환산하고, 그 결과를 항등식으로 검산한다.**
 *    1채분 + 다주택분 = 소유지수. 안 맞으면 던진다. 숫자를 손으로 적지 않는다.
 * ② **'주택'이라고 쓰지 않는다.** 등기정보광장의 모집단은 집합건물이다 —
 *    단독주택이 빠지고 오피스텔·상가가 들어간다. 제목·부제·각주 전부 '집합건물'로 간다.
 *    빌더가 카드 문구에 '주택' 표현이 섞이면 던진다(§8 오보 0).
 * ③ **라벨 자리를 손으로 정하지 않는다.** 칸의 실제 픽셀을 재서 등급을 고르고,
 *    글자가 안 들어가는 칸은 라벨을 아예 안 준다. 못 들어간 구간은 아래 칩 줄이 받는다.
 *    (CARD_CHECKLIST §2 「이름표 자리를 손으로 정하지 않는다 — 코드가 고르게 한다」)
 * ④ **넘침을 두 번, 서로 다른 방법으로 잰다.** ⓐ 여기서 글자 폭을 넉넉히 어림해
 *    안 들어가면 등급을 내린다 ⓑ designQa 가 브라우저가 그린 bbox 를 실측한다.
 * ⑤ **면적을 여백으로 깎지 않는다.** 칸 사이 틈은 안쪽 그림자다 —
 *    면적이 곧 비율인 판에서 margin 으로 틈을 내면 그만큼 비율이 거짓이 된다.
 *
 * ── 두 컷의 분모가 다르다 (섞으면 오보)
 *   p1 = **전 국민** 100명 기준 (소유지수로 환산)
 *   p2 = **2채 이상 소유자** 100명 기준 (다소유지수를 그 안에서 재정규화)
 * 그래서 p2 각주가 원지수(전체 소유자 기준) 값을 같이 적는다 — 포털에서 그대로 대조된다.
 *
 * 실행: node scripts/build-daso-treemap.mjs [날짜] [--publish]
 *   --publish 없이 돌리면 결과가 data/out/_spike 로 간다(확정은 data/content 를 본다).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { squarify } from "./lib/treemap.mjs";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 10);
const publish = argv.includes("--publish");

const DS = join(ROOT, "data/datasets/iros-daso-2026-08.json");
const doc = JSON.parse(readFileSync(DS, "utf8"));
if (doc.meta?.verified !== true) throw new Error("데이터셋이 verified:true 가 아니다 — 카드로 못 만든다 (CLAUDE.md §8)");
if (doc.meta.unit !== "percent") throw new Error(`단위가 percent 가 아니다: ${doc.meta.unit}`);

const OWN = doc.ownIndex;
const MULTI = doc.multi;
if (!(OWN > 0 && OWN < 100)) throw new Error(`소유지수가 0~100 밖이다: ${OWN}`);
if (MULTI.length !== 15) throw new Error(`다소유 구분이 15개가 아니다: ${MULTI.length}`);
for (const m of MULTI) if (!(m.v > 0)) throw new Error(`${m.label} 값이 0 이하다`);

const r3 = (n) => Math.round(n * 1000) / 1000;

/* ── ① 항등식 검산 ─────────────────────────────────────────────
 * 포털 유의사항: 「100 − 다소유지수(합) = 집합건물 1채 보유자 비율」
 * 소유지수만 분모가 '국민'이라 곱셈 한 번으로 국민 기준이 된다.
 * 두 길로 구한 소유지수가 같아야 한다 — 다르면 데이터를 잘못 읽은 것이다. */
const multiSum = r3(MULTI.reduce((a, m) => a + m.v, 0));
const oneShare = r3(100 - multiSum);
const popOne = (OWN * oneShare) / 100;
const popMulti = (OWN * multiSum) / 100;
const popNone = 100 - OWN;
if (Math.abs(popOne + popMulti - OWN) > 1e-9) throw new Error(`검산 실패: ${popOne} + ${popMulti} ≠ ${OWN}`);
if (Math.abs(popNone + popOne + popMulti - 100) > 1e-9) throw new Error("국민 기준 세 칸의 합이 100이 아니다");

/* ── ② 색 ──────────────────────────────────────────────────────
 * 순서가 있는 구간이라 순차 램프를 쓴다(BRAND.md 코발트 축).
 * 큰 칸일수록 옅게 — 카드가 숨을 쉬고, 작고 짙은 칸이 눈에 걸린다. 그게 이 카드의 메시지다.
 * 레드는 이 계정에서 '상승' 시그널 전용이라 여기 쓰지 않는다. */
/* 앞쪽(2·3·4채)이 카드 넓이의 대부분을 차지하는데 처음엔 세 칸이 거의 같은 색이었다.
 * 큰 칸일수록 t 간격이 촘촘해서 그렇다 — 그래서 앞 구간에 정거장을 더 놓아 벌린다. */
const STOPS = [
  { t: 0, c: [222, 233, 255] },
  { t: 0.14, c: [169, 198, 255] },
  { t: 0.3, c: [110, 155, 255] },
  { t: 0.5, c: [46, 107, 255] },
  { t: 0.75, c: [30, 63, 143] },
  { t: 1, c: [16, 21, 33] },
];
/* 램프의 한 정거장은 **규격 코발트 그 자체**여야 한다 — 그래야 이 램프가
 * 「규격색의 농담」이라고 말할 수 있고, auditHead 의 면색 예외가 정당해진다
 * (auditHead.ts 「코로플레스 면색은 강조색이 아니다」 주석 참고). */
const COBALT = [46, 107, 255];
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
function ramp(t) {
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i].t + 1e-12) {
      const a = STOPS[i - 1], b = STOPS[i];
      const k = (t - a.t) / (b.t - a.t);
      return hex(a.c.map((v, j) => v + (b.c[j] - v) * k));
    }
  }
  return hex(STOPS.at(-1).c);
}
/* 글자색은 취향이 아니라 대비다 — 상대휘도로 가른다. */
function fgOf(bg) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16) / 255);
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.42 ? "#141821" : "#FFFFFF";
}

/* ── ③ 라벨 등급 — 칸의 실제 픽셀을 재서 고른다 ────────────────
 * 「이 칸은 이 크기」를 손으로 지정하지 않는다. 데이터가 바뀌면 칸이 바뀌기 때문이다. */
const TIERS = [
  { minW: 320, minH: 240, lb: 46, vl: 92, pad: 20 },
  { minW: 200, minH: 150, lb: 30, vl: 54, pad: 16 },
  { minW: 150, minH: 105, lb: 22, vl: 38, pad: 13 },
  { minW: 86, minH: 74, lb: 17, vl: 26, pad: 10 },
  { minW: 86, minH: 50, lb: 15, vl: 20, pad: 8 },
];
/* 글자 폭 어림 — 넉넉히 잡는다. 처음엔 숫자를 0.58em 으로 봤다가 `11~20채 1.66%` 가
 * 6px 넘쳐 designQa 에 잡혔다(2026-09-07). 실측으로 되맞춘 값이 아래다:
 *   한글 1.05em · 물결(~) 1.05em · 숫자·기호 0.70em, 그리고 전체에 6% 안전분.
 * 여기서 놓쳐도 designQa 가 실측으로 다시 잡지만, 두 번 다 놓치면 잘린 채 나간다. */
function textW(s, px) {
  let em = 0;
  for (const ch of s) em += /[가-힣~]/.test(ch) ? 1.05 : 0.7;
  return em * px * 1.06;
}
/* 세로는 줄높이까지 넣어 잰다 — 템플릿이 lb 1.3 · vl(0.1em 여백 + 1.15) 로 그린다.
 * 이 숫자가 템플릿과 어긋나면 라벨이 칸 위로 삐져나온다. 한쪽을 바꾸면 반대쪽도 바꾼다. */
function labelH(t) {
  return t.lb * 1.3 + t.vl * 0.1 + t.vl * 1.15 + t.pad * 2;
}
function tierFor(wPx, hPx, label, value) {
  for (const t of TIERS) {
    if (wPx < t.minW || hPx < t.minH) continue;
    const avail = wPx - t.pad * 2;
    if (textW(label, t.lb) > avail) continue;
    if (textW(value, t.vl) > avail) continue;
    if (labelH(t) > hPx) continue;
    return t;
  }
  return null;
}

const pct = (n, d = 1) => `${n.toFixed(d)}%`;

/* ── ④ 판 만들기 ─────────────────────────────────────────────
 * rows: { value(0~100 합계 100), label, valueTxt, bg, rawTxt? } */
const PLOT_W = 520, PLOT_GAP = 26, TAB_W = 936 - 520 - 26;
function buildPlot(rows, plotW, plotH) {
  const total = rows.reduce((a, r) => a + r.value, 0);
  if (Math.abs(total - 100) > 0.05) throw new Error(`값의 합이 100이 아니다: ${total.toFixed(3)}`);
  const rects = squarify(rows, 0, 0, 100, 100); /* 백분율 좌표 — 템플릿이 % 로 배치한다 */
  const tiles = [], unlabeled = [];
  for (const rc of rects) {
    const it = rc.item;
    const wPx = (rc.w / 100) * plotW, hPx = (rc.h / 100) * plotH;
    const t = tierFor(wPx, hPx, it.label, it.valueTxt);
    const tile = { x: r3(rc.x), y: r3(rc.y), w: r3(rc.w), h: r3(rc.h), bg: it.bg, fg: fgOf(it.bg) };
    if (t) Object.assign(tile, { label: it.label, value: it.valueTxt, lbPx: t.lb, vlPx: t.vl, pdPx: t.pad });
    else unlabeled.push({ label: it.label, value: it.valueTxt, bg: it.bg });
    tiles.push(tile);
  }
  const area = tiles.reduce((a, t) => a + (t.w * t.h) / 100, 0);
  if (Math.abs(area - 100) > 0.05) throw new Error(`칸 넓이 합이 100%가 아니다: ${area.toFixed(3)}%`);
  return { tiles, unlabeled };
}

/* ── ⑤ 오른쪽 표 ─────────────────────────────────────────────
 * 트리맵이 크기를 보여 주고, 표가 값을 읽게 한다. **모든 구간이 표에 있다** —
 * 칸이 좁아 라벨을 못 단 구간도 여기서는 똑같이 한 줄을 받는다(오너 2026-09-07).
 * 글자 크기·행 높이는 행 수에서 계산한다 — 손으로 정하면 행이 늘 때 넘친다. */
function buildTable(rows, head, plotH) {
  const n = rows.length;
  const hasV2 = rows.some((r) => r.rawTxt);
  const few = n <= 5;
  const hdPx = few ? 19 : 17;
  const headH = hdPx + 11; /* 글자 + 아래 여백 + 밑줄 */
  const rowH = few ? 0 : Math.floor((plotH - headH) / n);
  if (!few && rowH < 30) throw new Error(`표 행이 너무 얇다(${rowH}px) — 행이 ${n}개면 판을 키우거나 구간을 묶는다`);
  const t = {
    cols: hasV2 ? "14px 1fr 92px 96px" : "14px 1fr 128px",
    head, hdPx,
    rowH: few ? 0 : rowH,
    rowFlex: few ? "1 1 0" : "0 0 auto",
    nmPx: few ? 30 : 21,
    v1Px: few ? 44 : 21,
    rows: rows.map((r) => ({ label: r.label, v1: r.valueTxt, ...(r.rawTxt ? { v2: r.rawTxt } : {}), bg: r.bg })),
  };
  if (hasV2) t.v2Px = 18;
  /* 이름 열에 남는 폭으로 가장 긴 이름이 들어가는지 — 안 들어가면 말줄임(…)이 되고
   * designQa 가 error 로 막는다. 여기서 먼저 잡아 무엇이 문제인지 이름으로 말해 준다. */
  const fixed = t.cols.split(" ").filter((c) => c.endsWith("px")).reduce((a, c) => a + parseFloat(c), 0);
  const gaps = (t.cols.split(" ").length - 1) * 10;
  const nameW = TAB_W - fixed - gaps;
  for (const r of rows) {
    if (textW(r.label, t.nmPx) > nameW) throw new Error(`표 이름 열이 좁다: "${r.label}" (${Math.round(textW(r.label, t.nmPx))}px > ${nameW}px)`);
  }
  return t;
}

/* '주택'이라 쓰면 오보다 — 이 판형의 모집단은 집합건물이다. */
function noHousingWord(card) {
  const bad = JSON.stringify(card).match(/주택수|다주택|[0-9]주택/g);
  if (bad) throw new Error(`카드 문구에 '주택' 표현이 있다: ${[...new Set(bad)].join(", ")} — 모집단은 집합건물이다`);
}

const SRC = { name: "법원 등기정보광장 등기지수", asOf: "2026년 8월" };

/* ── p1 · 전 국민 100명 ───────────────────────────────────── */
const P1_H = 780;
const p1rows = [
  { value: popNone, label: "집합건물 없음", valueTxt: pct(popNone), bg: "#E4E1D9" },
  { value: popOne, label: "1채", valueTxt: pct(popOne), bg: "#7E93B0" },
  { value: popMulti, label: "2채 이상", valueTxt: pct(popMulti), bg: "#2E6BFF" },
];
const p1 = buildPlot(p1rows, PLOT_W, P1_H);
if (p1.unlabeled.length) throw new Error(`p1 은 세 칸 모두 라벨이 들어가야 한다 — 빠진 칸: ${p1.unlabeled.map((u) => u.label).join(", ")}`);

const card1 = {
  template: "daso-treemap@1",
  date,
  subtitle: "전 국민 기준 · 집합건물(아파트·오피스텔·빌라 등)",
  title: `두 채 이상은 100명 중 <span class="hi">${popMulti.toFixed(1)}명</span>`,
  plot: { w: PLOT_W, h: P1_H, gap: PLOT_GAP },
  tiles: p1.tiles,
  table: buildTable(p1rows, ["구분", "국민 100명 중"], P1_H),
  /* 다음 장으로 넘기는 다리 — p2 의 분모(소유자 100명)를 여기서 미리 말해 준다.
   * 두 장의 분모가 다른 카드라 이 한 줄이 없으면 섞어 읽는다. */
  summary:
    `소유자는 100명 중 <b>${OWN.toFixed(1)}명</b> · 그중 2채 이상이 <b>${multiSum.toFixed(1)}%</b>`,
  note:
    `소유명의인 기준(내국인·재외국민) · 단독주택은 빠지고 오피스텔·상가는 들어간다 · ` +
    `면적이 곧 비율이다`,
  source: SRC,
};
noHousingWord(card1);

/* ── p2 · 2채 이상 소유자 100명 ───────────────────────────── */
const P2_H = 780;
const p2rows = MULTI.map((m, i) => ({
  value: (m.v / multiSum) * 100,
  label: m.label,
  valueTxt: pct((m.v / multiSum) * 100, 2),
  bg: ramp(i / (MULTI.length - 1)),
  rawTxt: `${m.v}%`, /* 원지수 — 포털에서 그대로 대조되는 공표값 */
}));
const p2 = buildPlot(p2rows, PLOT_W, P2_H);


const two = p2rows[0].value, three = p2rows[1].value;
const over21 = p2rows.filter((r) => ["21~30채", "31~40채", "41~50채", "51~100채", "101채 이상"].includes(r.label))
  .reduce((a, r) => a + r.value, 0);

const card2 = {
  template: "daso-treemap@1",
  date,
  subtitle: "집합건물 2채 이상 소유자 100명 기준",
  title: `두 채가 <span class="hi">열에 일곱</span>`,
  plot: { w: PLOT_W, h: P2_H, gap: PLOT_GAP },
  tiles: p2.tiles,
  table: buildTable(p2rows, ["보유 채수", "비중", "원지수"], P2_H),
  summary:
    `2채가 <b>${two.toFixed(1)}%</b> · 3채까지 더하면 <b>${(two + three).toFixed(1)}%</b> · ` +
    `21채 이상은 다 합쳐 <b>${over21.toFixed(1)}%</b>`,
  note:
    `왼쪽 넓이 = 비중 · '원지수'는 전체 소유자 기준 공표값(합 ${multiSum}%) · ` +
    `값은 2026년 8월 말 잠정치`,
  source: SRC,
};
noHousingWord(card2);

/* ── 내보내기 ─────────────────────────────────────────────── */
const outDir = publish ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike/daso-treemap");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "daso-treemap-p1.json"), JSON.stringify(card1, null, 2) + "\n", "utf8");
writeFileSync(join(outDir, "daso-treemap-p2.json"), JSON.stringify(card2, null, 2) + "\n", "utf8");

/* ── 캡션 — 수치는 전부 위에서 계산한 값이다. 보고 옮겨 적지 않는다. ── */
/* 자릿수를 크기에 맞춰 고른다 — 한 목록 안에서 315 와 7.00 이 섞이면 독자가 의심한다
 * (CARD_CHECKLIST §2 숫자 표기). */
const per10k = (v) => { const n = v * 100; return n >= 10 ? n.toFixed(0) : n >= 1 ? n.toFixed(1) : n.toFixed(2); };
const caption = [
  `국민 100명 중 집합건물을 여러 채 가진 사람은 몇 명일까요?`,
  ``,
  `법원 등기정보광장은 매달 두 가지 지수를 냅니다.`,
  `· 소유지수 — 전체 국민 중 집합건물 소유명의인 비율. 2026년 8월 ${OWN}%`,
  `· 다소유지수 — 그 소유자 중 2채 이상 보유자 비율. 같은 달 합계 ${multiSum}%`,
  ``,
  `분모가 '국민 → 소유자'로 한 단계만 좁혀지는 구조라, 두 값을 곱하면`,
  `전 국민 기준 분포가 그대로 나옵니다.`,
  ``,
  `[1] 국민 100명 기준`,
  `· 집합건물 없음 ${popNone.toFixed(1)}명`,
  `· 1채 ${popOne.toFixed(1)}명`,
  `· 2채 이상 ${popMulti.toFixed(1)}명`,
  ``,
  `[2] 그 '2채 이상' 100명을 열어 보면`,
  ...MULTI.map((m, i) => `· ${m.label} ${((m.v / multiSum) * 100).toFixed(2)}% (국민 1만명당 ${per10k((OWN * m.v) / 100)}명)`),
  ``,
  `2채가 ${two.toFixed(1)}%입니다. 여러 채를 가진 사람 열에 일곱은 딱 두 채고,`,
  `21채 이상은 다 합쳐도 ${over21.toFixed(1)}%입니다.`,
  ``,
  `※ '주택'이 아니라 '집합건물'입니다. 아파트·연립·다세대·오피스텔 등이 들어가고`,
  `   단독주택은 빠집니다. 오피스텔·상가도 집합건물이라 여기 잡힙니다.`,
  `※ 그래서 국가데이터처 주택소유통계의 다주택자 비율(2024년 14.9%)과는 다른 통계입니다.`,
  `   모집단이 다르니 두 숫자를 나란히 놓고 비교하지 마세요.`,
  `※ 소유명의인 기준입니다(내국인·재외국민).`,
  `※ 최신월은 잠정치입니다 — 포털도 "신청 후 등기가 완료되지 않은 소유명의인이 존재할 수 있다"고 적어 둡니다.`,
  `※ 출처: 법원 등기정보광장 집합건물 소유지수·다소유지수, 2026년 8월 기준.`,
  ``,
  `#등기정보광장 #집합건물 #부동산통계 #오피스텔 #위릿`,
].join("\n");
writeCaption("daso-treemap", caption); // ⚠️ 서명은 writeCaption 이 붙인다

console.log(`🧩 daso-treemap — ${publish ? "data/content" : "_spike"}/${date}`);
console.log(`   검산 ✅ 1채 ${popOne.toFixed(3)} + 다주택 ${popMulti.toFixed(3)} = 소유지수 ${OWN}`);
console.log(`   p1 칸 ${p1.tiles.length} (라벨 ${p1.tiles.length - p1.unlabeled.length})`);
console.log(`   p2 칸 ${p2.tiles.length} (라벨 ${p2.tiles.length - p2.unlabeled.length}) · 표 ${MULTI.length}행 — 표는 모든 구간을 담는다`);
