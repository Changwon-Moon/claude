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

/* ── ② 구간 ───────────────────────────────────────────────────
 * **1채를 넣는다**(오너 2026-09-07). 그러면 값이 곧 등기정보광장 공표값이 되어
 * 재정규화가 사라진다 — '원지수' 라는 (내가 지어낸) 열도 함께 사라졌다.
 *   1채 = 100 − 다소유지수 합. 포털 유의사항이 그렇게 하라고 적어 둔 계산이다.
 *
 * ⚠️ 그런데 1채가 84% 라 **나머지가 짓눌린다.** 2~9채를 개별 칸으로 두면
 * 7·8·9채가 20px 안팎이 돼 채수조차 못 적는다(실측 스윕).
 * 그래서 **트리맵은 5칸(1·2·3·4·5채 이상), 표는 10행 전부**로 나눈다 —
 * 그림은 크기를 말하고, 표가 세부를 잃지 않는다. 묶인 다섯 행은 표에서
 * 같은 색과 묶음선으로 「이 다섯 줄이 저 한 칸」임을 보인다. */
const TAB_TAIL = ["10", "11-20", "21-30", "31-40", "41-50", "51-100", "101+"];
const tail = MULTI.filter((m) => TAB_TAIL.includes(m.key));
const tailV = r3(tail.reduce((a, m) => a + m.v, 0));

/* 표 — 1채 + 2~9채 + 10채 이상 = 10행. 값은 전부 공표값 그대로다. */
const TABLE_ROWS = [
  { key: "1", label: "1채", v: oneShare },
  ...MULTI.filter((m) => !TAB_TAIL.includes(m.key)).map((m) => ({ key: m.key, label: m.label, v: m.v })),
  { key: "10+", label: "10채 이상", v: tailV },
];
if (Math.abs(TABLE_ROWS.reduce((a, g) => a + g.v, 0) - 100) > 1e-9) throw new Error("표 합이 100이 아니다");

/* 트리맵 — 5칸. PLOT_KEYS 안의 것만 제 칸을 갖고, 나머지는 마지막 칸으로 묶인다. */
const PLOT_KEYS = ["1", "2", "3", "4"];
const mergedV = r3(TABLE_ROWS.filter((g) => !PLOT_KEYS.includes(g.key)).reduce((a, g) => a + g.v, 0));
const GROUPS = [
  ...TABLE_ROWS.filter((g) => PLOT_KEYS.includes(g.key)),
  { key: "5+", label: "5채 이상", v: mergedV },
];
if (Math.abs(GROUPS.reduce((a, g) => a + g.v, 0) - 100) > 1e-9) throw new Error("묶은 뒤 합이 100이 아니다");
/* 표의 어느 행이 트리맵의 어느 칸에 속하는지 — 색과 묶음선이 이걸 따른다. */
const TAIL_KEY = "5+"; /* 묶인 마지막 칸의 키 — 배합이 이걸로 「꼬리」를 알아본다 */
const groupOf = (key) => (PLOT_KEYS.includes(key) ? key : TAIL_KEY);

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
    name: "중립 회색 + 마지막 칸만 코발트",
    fn: (() => {
      const r = rampOf([{ t: 0, c: "#E7E4DC" }, { t: 1, c: "#6E6A60" }]);
      return (i, n, key) => (key === TAIL_KEY ? COBALT : r(i / (n - 2)));
    })(),
  },
  /* D. 이산 계단 — 보간 없이 그룹마다 한 색. 「2채 / 3~4채 / 5~9채 / 10채 이상」이 눈에 묶인다. */
  steps: {
    name: "4단 계단 (1 / 2 / 3~4 / 5채↑)",
    fn: (i, n, key) => {
      if (key === "1") return "#DEE9FF";
      if (key === "2") return "#93B8FF";
      if (key === TAIL_KEY) return "#16223F";
      return COBALT; /* 3·4채 */
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

/* 소수 자릿수는 카드 안에서 통일한다(CARD_CHECKLIST §2). 공표값이 소수 셋째 자리까지라 3으로 맞춘다. */
const pct = (n, d = 3) => `${n.toFixed(d)}%`;

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

/* ── ⑥ 표 ─────────────────────────────────────────────────────
 * 트리맵이 크기를 보여 주고, 표가 값을 읽게 한다. **모든 구간이 표에 있다.**
 *
 * ⚠️ 글자 크기를 손으로 못박지 않는다. 판 폭을 조금만 바꿔도 표에 남는 폭이 달라지고,
 * 그때마다 「이름이 말줄임(…)으로 잘렸다」로 designQa 가 막는다(실제로 겪었다).
 * 후보를 큰 것부터 대 보고 **전부 들어가는 첫 조합**을 고른다 — 자리가 바뀌면 알아서 줄어든다. */
const PRESETS = {
  few:  [{ hd: 19, nm: 30, v1: 40, w1: 150 }, { hd: 18, nm: 26, v1: 34, w1: 130 }],
  mid:  [{ hd: 17, nm: 26, v1: 26, w1: 134 }, { hd: 17, nm: 23, v1: 23, w1: 122 }, { hd: 16, nm: 21, v1: 21, w1: 112 }],
  many: [{ hd: 16, nm: 19, v1: 19, w1: 94 }, { hd: 15, nm: 17, v1: 17, w1: 86 }],
};
function buildTable(rows, head, plotH, tabW) {
  const n = rows.length;
  const cands = n <= 5 ? PRESETS.few : n <= 10 ? PRESETS.mid : PRESETS.many;
  const fits = (P) => {
    const cols = "14px 1fr " + P.w1 + "px";
    const nameW = tabW - 14 - P.w1 - 20;
    if (nameW < 60) return null;
    for (const r of rows) {
      if (textW(r.label, P.nm) > nameW) return null;
      if (textW(r.valueTxt, P.v1) > P.w1) return null;
    }
    if (textW(head[0], P.hd) > nameW || textW(head[1], P.hd) > P.w1) return null;
    return cols;
  };
  for (const P of cands) {
    const cols = fits(P);
    if (!cols) continue;
    if ((plotH - (P.hd + 11)) / n < 30) continue;
    return {
      cols, head, hdPx: P.hd, nmPx: P.nm, v1Px: P.v1,
      rowH: 0, rowFlex: "1 1 0",
      /* grp = 트리맵에서 한 칸으로 묶인 행. 템플릿이 왼쪽에 묶음선을 그린다 —
       * 「이 다섯 줄이 저 한 칸」이라는 것을 색만으로는 못 말한다. */
      rows: rows.map((r) => ({ label: r.label, v1: r.valueTxt, bg: r.bg, ...(r.grp ? { grp: true } : {}) })),
    };
  }
  throw new Error(`표가 폭 ${tabW}px 에 안 들어간다 (행 ${n}개) — 판 폭을 줄이거나 구간을 묶는다`);
}

/* '주택'이라 쓰면 오보다 — 이 판형의 모집단은 집합건물이다(단독주택 제외 · 오피스텔 포함).
 *
 * ── 제목만 예외다. 그리고 **공짜 예외가 아니다** (오너 2026-09-07)
 * 오너가 「2026년 현재, 다주택자 비율?」로 가자고 했다. 일상어로 후킹하고 정확한 정의는
 * 카드가 붙여 준다는 판단이다. 맞는 판단이지만, **정의가 붙어 있을 때만** 맞다 —
 * 나중에 킥커나 각주를 지우면 제목만 남아 그때부터 오보가 된다.
 * 그래서 예외에 조건을 건다: 킥커가 지표명을 밝히고, 각주가 두 낱말을 풀어야 한다.
 * 셋 중 하나라도 빠지면 빌드가 멈춘다. 「나중에 누가 지울까」를 사람 기억에 맡기지 않는다. */
/* 요약 한 줄이 카드 폭(안쪽 936px)을 넘는지 — 넘으면 둘째 줄로 흘러 레이아웃이 무너진다.
 * 태그를 걷어낸 글자만 잰다. 32px 는 .tm-sum 의 크기이고, 한쪽을 바꾸면 반대쪽도 바꾼다. */
function fitsOneLine(html, px = 32, avail = 936) {
  const plain = String(html).replace(/<[^>]+>/g, "");
  const w = textW(plain, px);
  if (w > avail) throw new Error(`요약이 한 줄을 넘는다 (${Math.round(w)}px > ${avail}px): "${plain}"`);
}

function noHousingWord(card) {
  const body = JSON.stringify({ ...card, title: undefined });
  const bad = body.match(/주택수|다주택|[0-9]주택/g);
  if (bad) throw new Error(`카드 본문에 '주택' 표현이 있다: ${[...new Set(bad)].join(", ")} — 모집단은 집합건물이다`);

  if (/다주택/.test(card.title)) {
    const notes = (card.notes || []).join(" ");
    if (!/집합건물\s*다소유지수/.test(card.subtitle || ""))
      throw new Error("제목이 '다주택'을 쓰는데 킥커가 「집합건물 다소유지수」를 안 밝힌다 — 둘은 짝이다");
    if (!/집합건물<\/b>\s*:/.test(notes))
      throw new Error("제목이 '다주택'을 쓰는데 각주에 「집합건물」 풀이가 없다");
    if (!/다소유지수<\/b>\s*:/.test(notes))
      throw new Error("제목이 '다주택'을 쓰는데 각주에 「다소유지수」 풀이가 없다");
  }
}

/* ── ⑦ 카드 ───────────────────────────────────────────────── */
/* 판 크기 — 트리맵은 오른쪽, 표는 왼쪽. 카드 높이에서 머리·요약·각주·푸터를 뺀 나머지를
 * 판이 **전부** 가져간다. 제목 상자를 고정 높이로 못박았으므로 이 값은 제목 길이와 무관하다. */
/* 판 폭 520 — 490 이면 「10채 이상」 칸이 81px 라 채수만 들어간다(실측 스윕).
 * 520 에서 147×84 가 되어 아홉 칸 전부가 채수 + 비중을 담는다. 표는 남는 390px 를 쓴다. */
const PLOT_W = 600, PLOT_GAP = 26, PLOT_H = 786;

/* 제목 후보 — 오너가 고른다(--title <번호>). 전부 **계산이 확인한 말**만 쓴다:
 *   「열에 일곱」 = 2채 69.19%  ·  「열에 아홉」 = 2+3+4채 90.64%  ·  「100명 중 3명」 = 10채 이상 2.95% */
const TITLES = [
  /* 오너 확정 2026-09-07. '다주택자'는 일상어이고 이 자료의 모집단(집합건물)과 정확히 같지는
   * 않다 — 그래서 **킥커가 지표명을 밝히고 각주가 두 낱말을 풀어 줄 때만** 쓴다.
   * 그 조건을 noHousingWord() 가 실제로 검사한다(문구를 지우면 빌드가 멈춘다). */
  `2026년 현재, <span class="hi">다주택자 비율</span>?`,
  `두 채가 <span class="hi">열에 일곱</span>`,
  `2026년 현재, <span class="hi">몇 채씩</span> 갖고 있나`,
  `열에 아홉은 <span class="hi">네 채 안쪽</span>`,
  `여러 채라고 <span class="hi">다 같지 않다</span>`,
  `10채 이상은 <span class="hi">100명 중 3명</span>`,
];
const titleArg = (() => { const i = argv.indexOf("--title"); return i >= 0 ? Number(argv[i + 1]) : 0; })();
if (!TITLES[titleArg]) throw new Error(`없는 제목 번호: ${titleArg} (0~${TITLES.length - 1})`);

const SRC = { name: "법원 등기정보광장 등기지수", asOf: "2026년 8월" };

function makeCard(palKey) {
  const pal = PALETTES[palKey];
  if (!pal) throw new Error(`없는 배합: ${palKey} — ${Object.keys(PALETTES).join(", ")}`);

  /* 칸 색 — 트리맵 5칸이 기준이고, 표의 각 행은 제가 속한 칸의 색을 그대로 쓴다.
   * 색이 곧 「이 줄은 저 칸」이라는 연결선이다. */
  const tileBg = {};
  GROUPS.forEach((g, i) => { tileBg[g.key] = pal.fn(i, GROUPS.length, g.key); });

  const plotRows = GROUPS.map((g) => ({
    value: g.v, label: g.label, valueTxt: pct(g.v), bg: tileBg[g.key],
  }));
  const plot = buildPlot(plotRows.slice().sort((a, b) => b.value - a.value), PLOT_W, PLOT_H);

  const tableRows = TABLE_ROWS.map((g) => ({
    label: g.label, valueTxt: pct(g.v), bg: tileBg[groupOf(g.key)],
    grp: !PLOT_KEYS.includes(g.key),
  }));

  const one = TABLE_ROWS[0].v, two = TABLE_ROWS[1].v;
  const card = {
    template: "daso-treemap@1",
    date,
    subtitle: "집합건물 다소유지수 ('26.08월 기준)",
    title: TITLES[titleArg],
    plot: { w: PLOT_W, h: PLOT_H, gap: PLOT_GAP, side: "right" },
    tiles: plot.tiles,
    table: buildTable(tableRows, ["보유 채수", "소유자 중"], PLOT_H, 936 - PLOT_W - PLOT_GAP),
    /* 제목의 질문에 **답이 첫머리에** 온다. 두 값 모두 위에서 계산한 것이다.
     * ⚠️ 한 줄을 넘기지 않는다 — fitsOneLine() 이 폭을 재서 막는다. */
    summary:
      `100명 중 <b>${Math.round(one)}명</b>이 1채 · 2채 이상은 <b>${multiSum.toFixed(1)}%</b>`,
    notes: [
      `※ <b>집합건물</b> : 아파트 · 오피스텔 · 연립 · 다세대 등 구분소유 건물 (단독주택 제외)`,
      `※ <b>다소유지수</b> : 집합건물 소유자 중 2채 이상 보유자 비율`,
    ],
    source: SRC,
  };
  noHousingWord(card);
  fitsOneLine(card.summary);
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
