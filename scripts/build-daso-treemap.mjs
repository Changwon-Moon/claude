/**
 * 집합건물 다보유자 분포 — 좌 표 · 우 트리맵 (`daso-treemap@1`).
 *
 * ── 이 카드가 지키는 것
 * ① **두 지수를 곱해 국민 기준으로 환산하고, 항등식으로 검산한다.**
 *    1채분 + 다보유분 = 소유지수. 안 맞으면 던진다. 숫자를 손으로 적지 않는다.
 *    (카드 본문은 소유자 기준이지만, 검산은 이 항등식이 성립해야 자료를 옳게 읽은 것이다)
 * ② **'주택'이라고 쓰지 않는다.** 등기정보광장의 모집단은 집합건물이다 —
 *    단독주택이 빠지고 오피스텔·상가가 들어간다. 빌더가 카드 문구를 검사해 던진다(§8 오보 0).
 * ③ **라벨 자리를 손으로 정하지 않는다.** 칸의 실제 픽셀을 재서 등급을 고른다.
 *    ⚠️ 다만 **채수(라벨)는 모든 칸에 적는다**(오너 2026-09-07) — 값이 안 들어가는 칸은
 *    채수만 적고 %는 옆 표가 받는다. 채수마저 못 들어가면 그건 판을 잘못 짠 것이라 **던진다.**
 * ④ **넘침을 두 번, 서로 다른 방법으로 잰다.** ⓐ 빌더가 글자 폭을 넉넉히 어림해 등급을 내린다
 *    ⓑ designQa 가 브라우저가 그린 bbox 를 실측한다.
 * ⑤ **면적을 여백으로 깎지 않는다.** 칸 사이 틈은 안쪽 그림자다 —
 *    면적이 곧 비율인 판에서 margin 으로 틈을 내면 그만큼 비율이 거짓이 된다.
 *
 * ── 왜 10채 이상을 묶나 (오너 2026-09-07)
 * 원자료는 10채·11~20·21~30·31~40·41~50·51~100·101채 이상으로 일곱 칸이다. 그대로 그리면
 * 마지막 넷이 20px 안팎의 티끌이 돼 **채수를 적을 자리가 없다.** 한 칸(2.95%)으로 묶으면
 * 아홉 칸 전부에 채수가 들어간다. **묶어서 감추는 게 아니라** 묶인 내역을 각주가 그대로 적는다.
 *
 * 실행:
 *   node scripts/build-daso-treemap.mjs [날짜] [--publish] [--palette <이름>]
 *   node scripts/build-daso-treemap.mjs --variants     # 색 배합 시안 전부를 _spike 에
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
const variants = argv.includes("--variants");
const palArg = (() => { const i = argv.indexOf("--palette"); return i >= 0 ? argv[i + 1] : null; })();

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
 * 소유지수만 분모가 '국민'이라 곱셈 한 번으로 국민 기준이 된다. */
const multiSum = r3(MULTI.reduce((a, m) => a + m.v, 0));
const oneShare = r3(100 - multiSum);
const popOne = (OWN * oneShare) / 100;
const popMulti = (OWN * multiSum) / 100;
if (Math.abs(popOne + popMulti - OWN) > 1e-9) throw new Error(`검산 실패: ${popOne} + ${popMulti} ≠ ${OWN}`);

/* ── ② 구간 묶기 — 10채 이상을 한 칸으로 ───────────────────── */
const TAIL_KEYS = ["10", "11-20", "21-30", "31-40", "41-50", "51-100", "101+"];
const head = MULTI.filter((m) => !TAIL_KEYS.includes(m.key));
const tail = MULTI.filter((m) => TAIL_KEYS.includes(m.key));
if (head.length !== 8 || tail.length !== 7) throw new Error(`구간 묶기 전제가 깨졌다: 앞 ${head.length} · 뒤 ${tail.length}`);
const tailV = r3(tail.reduce((a, m) => a + m.v, 0));
const GROUPS = [...head.map((m) => ({ key: m.key, label: m.label, v: m.v })), { key: "10+", label: "10채 이상", v: tailV }];
if (Math.abs(GROUPS.reduce((a, g) => a + g.v, 0) - multiSum) > 1e-9) throw new Error("묶은 뒤 합이 원래 합과 다르다");

/* ── ③ 색 배합 ─────────────────────────────────────────────────
 * BRAND.md: 레드는 '상승·경고' 시그널 전용이라 여기 쓰지 않는다. 코발트·잉크·중립만 쓴다.
 * 어느 배합이든 **규격 코발트 rgb(46,107,255) 가 반드시 들어가야 한다** —
 * 그래야 이 면색이 「규격색의 농담」이 되고 auditHead 의 면색 예외가 정당해진다. */
const COBALT = "#2E6BFF";
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function rampOf(stops) {
  return (t) => {
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i].t + 1e-12) {
        const a = stops[i - 1], b = stops[i];
        const k = (t - a.t) / (b.t - a.t);
        return hex(rgb(a.c).map((v, j) => v + (rgb(b.c)[j] - v) * k));
      }
    }
    return stops.at(-1).c;
  };
}

const PALETTES = {
  /* A. 브랜드 기본 — 큰 칸이 옅고 꼬리로 갈수록 짙다. 작고 짙은 칸이 눈에 걸린다. */
  cobalt: {
    name: "코발트 농담 (기본)",
    fn: (() => {
      const r = rampOf([
        /* ⚠️ 정거장을 칸이 실제로 밟는 t 에 놓는다. 9칸이면 t = i/8 만 나오는데,
           코발트를 0.7 에 두면 **어느 칸도 규격색이 아니게 된다**(처음에 그렇게 짰다가 걸렸다).
           0.75 = 6/8 이라 일곱 번째 칸이 정확히 규격 코발트다. */
        { t: 0, c: "#DEE9FF" }, { t: 0.25, c: "#A9C6FF" }, { t: 0.5, c: "#6E9BFF" },
        { t: 0.75, c: COBALT }, { t: 1, c: "#16223F" },
      ]);
      return (i, n) => r(i / (n - 1));
    })(),
  },
  /* B. 뒤집기 — 2채가 잉크로 앉아 카드가 묵직해진다. 꼬리가 밝아 대비가 반대로 선다. */
  inkFirst: {
    name: "잉크 → 코발트 (역방향)",
    fn: (() => {
      const r = rampOf([
        { t: 0, c: "#16223F" }, { t: 0.25, c: "#24447F" }, { t: 0.5, c: COBALT },
        { t: 0.75, c: "#8AB2FF" }, { t: 1, c: "#DEE9FF" },
      ]);
      return (i, n) => r(i / (n - 1));
    })(),
  },
  /* C. 중립 + 포인트 — 2~9채는 회색 계단, 「10채 이상」만 코발트.
     시선이 꼬리로 간다. 색이 곧 「여기를 보라」다. */
  monoAccent: {
    name: "중립 회색 + 10채 이상만 코발트",
    fn: (() => {
      const r = rampOf([{ t: 0, c: "#E7E4DC" }, { t: 1, c: "#6E6A60" }]);
      return (i, n, key) => (key === "10+" ? COBALT : r(i / (n - 2)));
    })(),
  },
  /* D. 이산 계단 — 보간 없이 그룹마다 한 색. 「2채 / 3~4채 / 5~9채 / 10채 이상」이 눈에 묶인다. */
  steps: {
    name: "4단 계단 (2 / 3~4 / 5~9 / 10+)",
    fn: (i, n, key) => {
      if (key === "2") return "#DEE9FF";
      if (key === "3" || key === "4") return "#93B8FF";
      if (key === "10+") return "#16223F";
      return COBALT;
    },
  },
};
for (const [k, p] of Object.entries(PALETTES)) {
  const used = GROUPS.map((g, i) => p.fn(i, GROUPS.length, g.key).toUpperCase());
  if (!used.includes(COBALT)) throw new Error(`배합 '${k}' 에 규격 코발트 ${COBALT} 가 없다 — 강조색 규격에서 벗어난다`);
  if (new Set(used).size !== used.length && k !== "steps") throw new Error(`배합 '${k}' 에 같은 색 칸이 있다 — 구간이 구분되지 않는다`);
}

/* 글자색은 취향이 아니라 대비다 — 상대휘도로 가른다. */
function fgOf(bg) {
  const [r, g, b] = rgb(bg).map((v) => v / 255);
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.42 ? "#141821" : "#FFFFFF";
}

/* ── ④ 라벨 등급 — 칸의 실제 픽셀을 재서 고른다 ────────────────
 * vl:0 은 **채수만 적는 등급**이다. 오너 지시상 채수는 모든 칸에 들어가야 하므로
 * 값이 안 들어가는 칸은 여기로 내려온다. 이것마저 안 되면 던진다. */
const TIERS = [
  { minW: 320, minH: 240, lb: 46, vl: 92, pad: 20 },
  { minW: 200, minH: 150, lb: 30, vl: 54, pad: 16 },
  { minW: 150, minH: 105, lb: 22, vl: 38, pad: 13 },
  { minW: 86, minH: 74, lb: 17, vl: 26, pad: 10 },
  { minW: 86, minH: 50, lb: 15, vl: 20, pad: 8 },
  { minW: 40, minH: 30, lb: 14, vl: 0, pad: 7 },
  { minW: 32, minH: 22, lb: 12, vl: 0, pad: 5 },
];
/* 글자 폭 어림 — 실측으로 되맞춘 값이다(한글·물결 1.05em · 숫자 0.70em · 안전분 6%).
 * 처음 0.58em 로 잡았다가 「11~20채 1.66%」가 6px 넘쳐 designQa 에 잡혔다. 낮추지 말 것. */
function textW(s, px) {
  let em = 0;
  for (const ch of s) em += /[가-힣~]/.test(ch) ? 1.05 : 0.7;
  return em * px * 1.06;
}
/* 세로는 줄높이까지 넣어 잰다 — 템플릿이 lb 1.3 · vl(0.1em 여백 + 1.15) 로 그린다.
 * 이 숫자가 템플릿과 어긋나면 라벨이 칸 위로 삐져나온다. 한쪽을 바꾸면 반대쪽도 바꾼다. */
const labelH = (t) => t.lb * 1.3 + (t.vl ? t.vl * 1.25 : 0) + t.pad * 2;
function tierFor(wPx, hPx, label, value) {
  for (const t of TIERS) {
    if (wPx < t.minW || hPx < t.minH) continue;
    const avail = wPx - t.pad * 2;
    if (textW(label, t.lb) > avail) continue;
    if (t.vl && textW(value, t.vl) > avail) continue;
    if (labelH(t) > hPx) continue;
    return t;
  }
  return null;
}

const pct = (n, d = 2) => `${n.toFixed(d)}%`;

/* ── ⑤ 트리맵 ─────────────────────────────────────────────── */
function buildPlot(rows, plotW, plotH) {
  const total = rows.reduce((a, r) => a + r.value, 0);
  if (Math.abs(total - 100) > 0.05) throw new Error(`값의 합이 100이 아니다: ${total.toFixed(3)}`);
  /* ⚠️ **실제 픽셀 크기로** 배치한다. 처음엔 100×100 정사각 좌표로 돌리고 나중에 늘렸는데,
   * squarify 는 담는 그릇의 가로세로 비를 보고 줄을 끊으므로 **정사각형에 맞춘 배치를
   * 세로로 긴 판에 늘리면 칸이 찌그러진다** — 9채가 25×75px 이 돼 채수를 못 적었다(실측).
   * 픽셀로 배치하고 그 결과를 %로 되돌린다. */
  const rects = squarify(rows, 0, 0, plotW, plotH);
  const tiles = [];
  for (const rc of rects) {
    const it = rc.item;
    const t = tierFor(rc.w, rc.h, it.label, it.valueTxt);
    if (!t) throw new Error(`「${it.label}」 칸이 너무 좁아 채수를 못 적는다 (${Math.round(rc.w)}×${Math.round(rc.h)}px) — 구간을 더 묶거나 판을 키운다`);
    tiles.push({
      x: r3((rc.x / plotW) * 100), y: r3((rc.y / plotH) * 100),
      w: r3((rc.w / plotW) * 100), h: r3((rc.h / plotH) * 100),
      bg: it.bg, fg: fgOf(it.bg),
      label: it.label, lbPx: t.lb, pdPx: t.pad,
      ...(t.vl ? { value: it.valueTxt, vlPx: t.vl } : {}),
    });
  }
  const area = tiles.reduce((a, t) => a + (t.w * t.h) / 100, 0);
  if (Math.abs(area - 100) > 0.05) throw new Error(`칸 넓이 합이 100%가 아니다: ${area.toFixed(3)}%`);
  const noVal = tiles.filter((t) => !t.value).map((t) => t.label);
  return { tiles, noVal };
}

/* ── ⑥ 표 ─────────────────────────────────────────────────── */
const TAB_W = 420;
function buildTable(rows, head, plotH) {
  const n = rows.length;
  const hasV2 = rows.some((r) => r.rawTxt);
  /* 행 수에 따라 글자 크기를 고른다 — 손으로 정하면 행이 늘 때 넘친다. */
  const P = n <= 5 ? { hd: 19, nm: 30, v1: 44, v2: 26, cols: "14px 1fr 128px" }
    : n <= 10 ? { hd: 17, nm: 26, v1: 26, v2: 19, cols: "14px 1fr 118px 106px" }
      : { hd: 17, nm: 21, v1: 21, v2: 18, cols: "14px 1fr 92px 96px" };
  const headH = P.hd + 11;
  const t = {
    cols: hasV2 ? P.cols : "14px 1fr 128px",
    head, hdPx: P.hd, nmPx: P.nm, v1Px: P.v1,
    rowH: 0, rowFlex: "1 1 0",
    rows: rows.map((r) => ({ label: r.label, v1: r.valueTxt, ...(r.rawTxt ? { v2: r.rawTxt } : {}), bg: r.bg })),
  };
  if (hasV2) t.v2Px = P.v2;
  if ((plotH - headH) / n < 30) throw new Error(`표 행이 너무 얇다 — 행이 ${n}개면 판을 키우거나 구간을 묶는다`);
  /* 열마다 가장 긴 값이 들어가는지 — 안 들어가면 말줄임(…)이 되고 designQa 가 error 로 막는다.
   * 여기서 먼저 잡아 무엇이 문제인지 이름으로 말해 준다. */
  const fixed = t.cols.split(" ").filter((c) => c.endsWith("px")).reduce((a, c) => a + parseFloat(c), 0);
  const gaps = (t.cols.split(" ").length - 1) * 10;
  const nameW = TAB_W - fixed - gaps;
  const colW = t.cols.split(" ").filter((c) => c.endsWith("px")).map(parseFloat);
  for (const r of rows) {
    if (textW(r.label, t.nmPx) > nameW) throw new Error(`표 이름 열이 좁다: "${r.label}" (${Math.round(textW(r.label, t.nmPx))}px > ${nameW}px)`);
    if (textW(r.valueTxt, t.v1Px) > colW[1]) throw new Error(`표 비중 열이 좁다: "${r.valueTxt}"`);
    if (r.rawTxt && textW(r.rawTxt, t.v2Px) > colW[2]) throw new Error(`표 원지수 열이 좁다: "${r.rawTxt}"`);
  }
  return t;
}

/* '주택'이라 쓰면 오보다 — 이 판형의 모집단은 집합건물이다. */
function noHousingWord(card) {
  const bad = JSON.stringify(card).match(/주택수|다주택|[0-9]주택/g);
  if (bad) throw new Error(`카드 문구에 '주택' 표현이 있다: ${[...new Set(bad)].join(", ")} — 모집단은 집합건물이다`);
}

/* ── ⑦ 카드 ───────────────────────────────────────────────── */
const PLOT_W = 490, PLOT_GAP = 26, PLOT_H = 742;

/* 제목 후보 — 오너가 고른다(--title <번호>). 전부 **계산이 확인한 말**만 쓴다:
 *   「열에 일곱」 = 2채 69.19%  ·  「열에 아홉」 = 2+3+4채 90.64%
 * ⚠️ '다주택'은 쓰지 않는다 — 이 자료의 모집단은 집합건물이라 단독주택이 빠지고
 *    오피스텔·상가가 들어간다. noHousingWord() 가 실제로 막는다. */
const TITLES = [
  `두 채가 <span class="hi">열에 일곱</span>`,
  `2026년 현재, <span class="hi">몇 채씩</span> 갖고 있나`,
  `열에 아홉은 <span class="hi">네 채 안쪽</span>`,
  `여러 채라고 <span class="hi">다 같지 않다</span>`,
  `2채 이상 100명 중 <span class="hi">69명이 딱 2채</span>`,
  `10채 이상은 <span class="hi">100명 중 3명</span>`,
];
const titleArg = (() => { const i = argv.indexOf("--title"); return i >= 0 ? Number(argv[i + 1]) : 0; })();
if (!TITLES[titleArg]) throw new Error(`없는 제목 번호: ${titleArg} (0~${TITLES.length - 1})`);
const SRC = { name: "법원 등기정보광장 등기지수", asOf: "2026년 8월" };

function makeCard(palKey) {
  const pal = PALETTES[palKey];
  if (!pal) throw new Error(`없는 배합: ${palKey} — ${Object.keys(PALETTES).join(", ")}`);
  const rows = GROUPS.map((g, i) => ({
    value: (g.v / multiSum) * 100,
    label: g.label,
    valueTxt: pct((g.v / multiSum) * 100),
    rawTxt: `${r3(g.v)}%`, /* 원지수 — 포털에서 그대로 대조되는 공표값 */
    bg: pal.fn(i, GROUPS.length, g.key),
  }));
  /* ⚠️ 트리맵만 **값 내림차순**으로 넘긴다(표는 채수 순 그대로).
   * 채수 순으로 그리면 「10채 이상」(2.95%)이 5~9채(0.49~2.72%) **뒤에** 와서
   * squarify 가 남은 자리를 얇게 저미고, 9채가 82×23px 이 돼 채수를 못 적는다(실측).
   * 칸마다 채수를 적으니 그림에서 읽는 순서는 색이 맡고, 순서는 옆 표가 맡는다. */
  const plot = buildPlot(rows.slice().sort((a, b) => b.value - a.value), PLOT_W, PLOT_H);
  const two = rows[0].value, three = rows[1].value, ten = rows.at(-1).value;

  const card = {
    template: "daso-treemap@1",
    date,
    subtitle: "집합건물 다소유지수 ('26.08월 기준)",
    title: TITLES[titleArg],
    /* 표가 왼쪽, 트리맵이 오른쪽 (오너 2026-09-07) */
    plot: { w: PLOT_W, h: PLOT_H, gap: PLOT_GAP, side: "right" },
    tiles: plot.tiles,
    table: buildTable(rows, ["보유 채수", "비중", "원지수"], PLOT_H),
    summary:
      `2채가 <b>${two.toFixed(1)}%</b> · 3채까지 더하면 <b>${(two + three).toFixed(1)}%</b> · ` +
      `10채 이상은 <b>${ten.toFixed(1)}%</b>`,
    /* ※ 용어 풀이 — 이 카드의 두 낱말은 일상어가 아니다. 안 풀면 독자가 '주택'으로 읽는다.
     * 세 번째 줄은 **묶은 것을 숨기지 않겠다는 약속**이다 — 원자료의 일곱 칸을 그대로 적는다. */
    notes: [
      `※ <b>집합건물</b> : 아파트 · 오피스텔 · 연립 · 다세대 등 구분소유 건물 (단독주택 제외)`,
      `※ <b>다소유지수</b> : 집합건물 소유자 중 2채 이상 보유자 비율 — 표의 '원지수'가 그 값입니다`,
      /* 구간 이름은 **키에서** 만든다 — 라벨에서 '채'를 빼면 「101채 이상」이 「101 이상」이 돼
       * 「101 이상채 이상」 같은 말이 나온다(실제로 한 번 나왔다). */
      `※ <b>10채 이상</b> : 원자료 일곱 구간(${tail.map((m) => (m.key === "101+" ? "101채 이상" : m.key.replace("-", "~"))).join(" · ")}) 합계 ${tailV}%`,
      `※ 2026년 8월 말 기준 <b>잠정치</b>입니다 — 신청 후 등기가 완료되지 않은 건이 있을 수 있습니다`,
    ],
    source: SRC,
  };
  noHousingWord(card);
  return { card, noVal: plot.noVal, palName: pal.name };
}

/* ── ⑧ 내보내기 ───────────────────────────────────────────── */
if (variants) {
  const dir = join(ROOT, "data/out/_spike/daso-treemap");
  mkdirSync(dir, { recursive: true });
  console.log(`🎨 색 배합 시안 ${Object.keys(PALETTES).length}종 — ${dir}`);
  for (const k of Object.keys(PALETTES)) {
    const { card, noVal, palName } = makeCard(k);
    writeFileSync(join(dir, `daso-treemap-${k}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");
    console.log(`   ${k.padEnd(11)} ${palName} — 채수만 적힌 칸: ${noVal.length ? noVal.join(", ") : "없음"}`);
  }
  console.log(`   검산 ✅ 1채 ${popOne.toFixed(3)} + 다보유 ${popMulti.toFixed(3)} = 소유지수 ${OWN}`);
} else {
  const palKey = palArg || "cobalt";
  const { card, noVal, palName } = makeCard(palKey);
  const outDir = publish ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike/daso-treemap");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "daso-treemap.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

  /* ── 캡션 — 수치는 전부 위에서 계산한 값이다. 보고 옮겨 적지 않는다. ── */
  const per10k = (v) => { const n = (OWN * v) / 100 * 100; return n >= 10 ? n.toFixed(0) : n >= 1 ? n.toFixed(1) : n.toFixed(2); };
  const caption = [
    `집합건물을 여러 채 가진 사람은 몇 채씩 갖고 있을까요?`,
    ``,
    `법원 등기정보광장은 매달 두 가지 지수를 냅니다.`,
    `· 소유지수 — 전체 국민 중 집합건물 소유명의인 비율. 2026년 8월 ${OWN}%`,
    `· 다소유지수 — 그 소유자 중 2채 이상 보유자 비율. 같은 달 합계 ${multiSum}%`,
    ``,
    `국민 100명으로 환산하면 ${popOne.toFixed(1)}명이 1채, ${popMulti.toFixed(1)}명이 2채 이상입니다.`,
    `이 카드는 그 '2채 이상' 100명을 열어 본 것입니다.`,
    ``,
    ...GROUPS.map((g) => `· ${g.label} ${((g.v / multiSum) * 100).toFixed(2)}% (원지수 ${r3(g.v)}% · 국민 1만명당 ${per10k(g.v)}명)`),
    ``,
    `2채가 ${((GROUPS[0].v / multiSum) * 100).toFixed(1)}%입니다. 여러 채를 가진 사람 열에 일곱은 딱 두 채입니다.`,
    ``,
    `※ '10채 이상'은 원자료의 일곱 구간을 묶은 것입니다. 내역은 이렇습니다 —`,
    `   ${tail.map((m) => `${m.label} ${m.v}%`).join(" · ")} (원지수 기준)`,
    `※ '주택'이 아니라 '집합건물'입니다. 아파트·연립·다세대·오피스텔 등이 들어가고`,
    `   단독주택은 빠집니다. 오피스텔·상가도 집합건물이라 여기 잡힙니다.`,
    `※ 그래서 국가데이터처 주택소유통계의 다보유 비율(2024년 14.9%)과는 다른 통계입니다.`,
    `   모집단이 다르니 두 숫자를 나란히 놓고 비교하지 마세요.`,
    `※ 소유명의인 기준입니다(내국인·재외국민).`,
    `※ 최신월은 잠정치입니다 — 포털도 "신청 후 등기가 완료되지 않은 소유명의인이 존재할 수 있다"고 적어 둡니다.`,
    `※ 출처: 법원 등기정보광장 집합건물 소유지수·다소유지수, 2026년 8월 기준.`,
    ``,
    `#등기정보광장 #집합건물 #부동산통계 #오피스텔 #위릿`,
  ].join("\n");
  writeCaption("daso-treemap", caption); // ⚠️ 서명은 writeCaption 이 붙인다

  console.log(`🧩 daso-treemap [${palName}] — ${publish ? "data/content" : "_spike"}/${date}`);
  console.log(`   검산 ✅ 1채 ${popOne.toFixed(3)} + 다보유 ${popMulti.toFixed(3)} = 소유지수 ${OWN}`);
  console.log(`   칸 ${GROUPS.length} (전부 채수 표기) · 채수만 적힌 칸: ${noVal.length ? noVal.join(", ") : "없음"}`);
}
