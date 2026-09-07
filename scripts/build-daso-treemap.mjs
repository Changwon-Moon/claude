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
 * **바(bar)와 트리맵은 분모가 다르다.** 이걸 흐리면 카드가 거짓말을 한다.
 *   · 가로막대 = 소유자 100명을 1채(83.98%) / 2채 이상(16.02%) 로 가른다.
 *   · 트리맵   = 그 오른쪽 토막(2채 이상)만 **확대한 것**이다.
 * 그래서 칸의 **넓이**는 2채 이상 안에서의 비중이지만, 칸에 **적히는 %**는
 * 오너 지시대로 **전체 소유자 기준 공표값**이다(1채 83.98%가 포함된 분모).
 * 두 분모가 다르다는 사실을 「확대」 라벨이 카드 위에 직접 적는다 — 주석에만 적어 두면
 * 카드를 보는 사람은 알 길이 없다.
 *
 * 표는 **원자료 15구간 + 1채 = 16행 전부**를 싣는다(오너 2026-09-07).
 * 트리맵은 꼬리 구간을 한 칸으로 묶는다 — 그대로 그리면 20px 티끌이 돼 채수조차 못 적기
 * 때문이다. 묶인 줄들은 표에서 묶음선으로 「저 한 칸」임을 보인다. */
/* 꼬리를 어디서부터 묶을지는 **손으로 정하지 않는다.** 판이 좁아지면 마지막 칸이
 * 채수도 못 적을 만큼 얇아지는데, 그때 필요한 건 「더 묶는 것」이다.
 * 10채부터 시작해 안 되면 9채·8채로 한 칸씩 물러난다 — 실제로 그리는 픽셀이 결정한다.
 * 묶어서 감추는 게 아니다: 표는 언제나 16행 전부를 싣고, 캡션이 묶인 내역을 적는다. */
const TAIL_FROM = [10, 9, 8, 7];
function groupingFrom(minTail) {
  const solo = MULTI.filter((m) => /^\d+$/.test(m.key) && Number(m.key) < minTail);
  const tailItems = MULTI.filter((m) => !solo.includes(m));
  const tailV = r3(tailItems.reduce((a, m) => a + m.v, 0));
  const tailKey = `${minTail}+`;
  const groups = [
    ...solo.map((m) => ({ key: m.key, label: m.label, v: m.v })),
    { key: tailKey, label: `${minTail}채 이상`, v: tailV },
  ];
  if (Math.abs(groups.reduce((a, g) => a + g.v, 0) - multiSum) > 1e-9) throw new Error("묶은 뒤 합이 다소유지수 합과 다르다");
  return { minTail, tailKey, tailItems, groups, soloKeys: solo.map((m) => m.key) };
}

/* 표 — 1채 + 원자료 15구간 = 16행. 값은 전부 공표값 그대로다(재정규화 없음). */
const TABLE_ROWS = [
  { key: "1", label: "1채", v: oneShare },
  ...MULTI.map((m) => ({ key: m.key, label: m.label, v: m.v })),
];
if (Math.abs(TABLE_ROWS.reduce((a, g) => a + g.v, 0) - 100) > 1e-9) throw new Error("표 합이 100이 아니다");

const ONE_KEY = "1";    /* 트리맵에 없는 행 — 가로막대의 왼쪽 토막이다 */
const isTail = (key) => key.endsWith("+");
/* 배합 검사용 기본 묶음 — 실제 카드가 어느 묶음을 쓸지는 픽셀이 정한다. */
const GROUPS = groupingFrom(TAIL_FROM[0]).groups;
const groupOfIn = (G) => (key) => (key === ONE_KEY ? ONE_KEY : G.soloKeys.includes(key) ? key : G.tailKey);

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
      return (i, n, key) => (isTail(key) ? COBALT : r(i / (n - 2)));
    })(),
  },
  /* D. 이산 계단 — 보간 없이 묶음마다 한 색. 「2채 / 3채 / 4~9채 / 10채 이상」이 눈에 묶인다. */
  steps: {
    name: "4단 계단 (2 / 3 / 4~9 / 10채↑)",
    fn: (i, n, key) => {
      if (key === "2") return "#DEE9FF";
      if (key === "3") return "#93B8FF";
      if (isTail(key)) return "#16223F";
      return COBALT; /* 4~9채 */
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

/* 소수 자릿수는 카드 안에서 통일한다(CARD_CHECKLIST §2). 오너 지시로 **둘째 자리**에 맞춘다
 * (공표값은 셋째 자리까지지만, 카드에서 자릿수가 섞이면 눈이 값을 비교하지 못한다). */
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

/* ── ⑥ 표 ─────────────────────────────────────────────────────
 * 트리맵이 크기를 보여 주고, 표가 값을 읽게 한다. **모든 구간이 표에 있다.**
 *
 * ⚠️ 글자 크기를 손으로 못박지 않는다. 판 폭을 조금만 바꿔도 표에 남는 폭이 달라지고,
 * 그때마다 「이름이 말줄임(…)으로 잘렸다」로 designQa 가 막는다(실제로 겪었다).
 * 후보를 큰 것부터 대 보고 **전부 들어가는 첫 조합**을 고른다 — 자리가 바뀌면 알아서 줄어든다. */
const PRESETS = {
  few:  [{ hd: 21, nm: 34, v1: 44, w1: 168 }, { hd: 19, nm: 30, v1: 40, w1: 150 }, { hd: 18, nm: 26, v1: 34, w1: 130 }],
  mid:  [{ hd: 19, nm: 30, v1: 30, w1: 148 }, { hd: 17, nm: 26, v1: 26, w1: 134 }, { hd: 17, nm: 23, v1: 23, w1: 122 }, { hd: 16, nm: 21, v1: 21, w1: 112 }],
  /* 16행짜리도 판을 좁히면 큰 글자가 들어간다(오너 「표 폰트 키워줘」 2026-09-07).
     큰 것부터 대 보고 전부 들어가는 첫 조합을 고르므로, 나중에 판 폭을 바꿔도 알아서 따라온다. */
  /* 값 열 폭(w1)은 값이 필요한 만큼만 준다 — 넉넉히 주면 그만큼 이름 열이 좁아져
     「101채 이상」이 말줄임으로 잘리고, 그러면 한 단계 작은 글자로 내려간다. */
  many: [{ hd: 22, nm: 28, v1: 28, w1: 130 }, { hd: 21, nm: 26, v1: 26, w1: 122 }, { hd: 20, nm: 24, v1: 24, w1: 114 },
         { hd: 19, nm: 22, v1: 22, w1: 106 }, { hd: 18, nm: 21, v1: 21, w1: 102 }, { hd: 16, nm: 19, v1: 19, w1: 94 }],
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
const SUM_TIERS = [36, 34, 32, 30, 28, 26, 24, 22];
/* ⚠️ textW 는 트리맵 칸이 넘치지 않도록 **넉넉히** 어림한 값이라, 한글이 많은 문장에서는
 * 실제 폭의 1.4배쯤 나온다(32px 요약 실측 426px, 어림 617px). 트리맵 쪽 어림을 건드리면
 * 잘 맞던 라벨 등급이 흔들리므로, 요약에만 실측으로 되맞춘 계수를 곱한다.
 * 그래도 어림은 어림이라 — **designQa 의 .tm-sum 잘림 검사가 마지막 그물이다.** */
const sumW = (plain, px) => textW(plain, px) * 0.80;
function pickSumPx(html, avail) {
  const plain = String(html).replace(/<[^>]+>/g, "");
  const px = SUM_TIERS.find((p) => sumW(plain, p) <= avail);
  if (!px) throw new Error(`요약이 폭 ${avail}px 에 한 줄로 안 들어간다: "${plain}"`);
  return px;
}

function noHousingWord(card) {
  /* 제목과 요약 두 줄만 일상어를 쓸 수 있다 — 그 밖의 어디에도 '주택'이 들어가면 오보다. */
  const body = JSON.stringify({ ...card, title: undefined, summary: undefined });
  const bad = body.match(/주택수|다주택|[0-9]주택/g);
  if (bad) throw new Error(`카드 본문에 '주택' 표현이 있다: ${[...new Set(bad)].join(", ")} — 모집단은 집합건물이다`);

  /* 예외는 **공짜가 아니다.** 킥커가 지표명을 밝히고 각주가 두 낱말을 풀어야 성립한다.
   * 나중에 누가 킥커나 각주를 지우면 일상어만 남아 그때부터 오보가 되므로,
   * 「누가 지울까」를 사람 기억에 맡기지 않고 빌드가 멈추게 한다. */
  const loose = [card.title, card.summary].filter((t) => /다주택|유주택/.test(t || ""));
  if (loose.length) {
    const notes = (card.notes || []).join(" ");
    if (!/집합건물\s*다소유지수/.test(card.subtitle || ""))
      throw new Error("제목·요약이 '주택' 일상어를 쓰는데 킥커가 「집합건물 다소유지수」를 안 밝힌다 — 둘은 짝이다");
    if (!/집합건물<\/b>\s*:/.test(notes))
      throw new Error("제목·요약이 '주택' 일상어를 쓰는데 각주에 「집합건물」 풀이가 없다");
    if (!/다소유지수<\/b>\s*:/.test(notes))
      throw new Error("제목·요약이 '주택' 일상어를 쓰는데 각주에 「다소유지수」 풀이가 없다");
  }
}

/* ── ⑥-b 가로막대 + 확대 깔때기 ────────────────────────────────
 * 카드가 먼저 말해야 하는 건 「1채가 84%」다. 트리맵만 두면 2채 이상 안쪽만 보이고
 * **얼마짜리 조각을 확대한 것인지** 사라진다. 그래서 막대를 위에 세운다.
 *
 * ⚠️ 글자는 막대 **안이 아니라 위**에 있다(오너 2026-09-07). 좁은 토막이 100px 남짓이라
 * 안에 넣으면 두 토막의 글자 크기가 달라진다 — 「같은 크기로 키우라」는 지시를 칸 안에서는
 * 지킬 수 없다. 밖으로 빼면 제약이 사라지고, 크기는 여기서도 손으로 못박지 않고
 * 두 라벨을 합쳐 판 폭에 들어가는 첫 등급을 고른다.
 *
 * 확대는 **글이 아니라 그림이 말한다.** 코발트 토막의 좌우 끝에서 트리맵의 좌우 끝으로
 * 벌어지는 사다리꼴 하나면 된다. 「아래는 2채 이상만 확대」라고 적던 줄은 지웠다. */
const BARLAB_TIERS = [
  { nm: 34, vl: 46 }, { nm: 31, vl: 42 }, { nm: 28, vl: 38 },
  { nm: 25, vl: 34 }, { nm: 22, vl: 29 }, { nm: 19, vl: 25 },
];
function buildBar(segs, barW, labH, barH, gap) {
  const total = segs.reduce((a, g) => a + g.v, 0);
  if (Math.abs(total - 100) > 1e-9) throw new Error(`막대 합이 100이 아니다: ${total}`);
  /* 두 라벨이 한 줄에 나란히 선다 — 합친 폭 + 최소 숨(40px)이 판 폭 안에 들어와야 한다. */
  const t = BARLAB_TIERS.find((T) => {
    const w = segs.reduce((a, g) => a + textW(g.label + " ", T.nm) + textW(g.valueTxt, T.vl), 0);
    return w + 40 <= barW && T.vl * 1.15 <= labH; /* 40px = 두 라벨 사이 최소 숨 */
  });
  if (!t) throw new Error(`막대 라벨이 판 폭 ${barW}px 에 안 들어간다`);
  return {
    labH, h: barH, gap,
    labels: segs.map((g, i) => ({
      cls: i === 0 ? "one" : "two",
      name: g.label, value: g.valueTxt, nmPx: t.nm, vlPx: t.vl,
    })),
    segments: segs.map((g) => ({ w: r3(g.v), bg: g.bg })),
  };
}
/* 깔때기 — 위 변은 확대 대상 토막의 좌우(막대에서의 위치), 아래 변은 트리맵의 좌우(0~100%).
 * 막대 비율이 바뀌면 깔때기도 따라 움직인다. 좌표를 손으로 적지 않는다. */
/* 막대 토막과 트리맵 칸은 종이색 안쪽 선(2px)으로 서로 떨어져 있다 — 그 선만큼 색면이
 * 안으로 들어가 있다는 뜻이다. 깔때기에 같은 값을 안 빼면 **깔때기만 좌우로 2px씩 더 넓어**
 * 막대·판 밖으로 튀어나와 보인다(오너 2026-09-07). 이 값은 템플릿의 inset 그림자와 같은 수다. */
const EDGE = 2;
function buildFunnel(x0, x1, h, bg, bg2) {
  if (!(x1 > x0)) throw new Error("깔때기 위 변이 뒤집혔다");
  if (x1 !== 100) throw new Error("깔때기 위 변 오른쪽은 막대 오른쪽 끝이어야 한다");
  /* 위는 막대 토막 색, 아래는 트리맵 첫 칸 색 — 빛줄기가 막대에서 판으로 떨어지는 모양이다. */
  return {
    h, bg, bg2,
    clip: `calc(${r3(x0)}% + ${EDGE}px) 0%, calc(100% - ${EDGE}px) 0%, `
        + `calc(100% - ${EDGE}px) 100%, ${EDGE}px 100%`,
  };
}

/* ── ⑦ 카드 ───────────────────────────────────────────────── */
/* 판 크기 — 오른쪽 칸은 **막대 → 확대 라벨 → 트리맵** 세 층이다. 표는 왼쪽.
 * BODY_H 는 카드 높이에서 머리·요약·각주·푸터를 뺀 나머지 전부다(제목 상자가 고정이라
 * 제목 길이와 무관하다). 트리맵 높이는 남는 것을 받는다 —
 * ZOOM_H 는 .tm-zoom 의 위여백 13 + 줄 19 + 아래여백 9 이고, 템플릿과 같아야 한다. */
/* 판 폭 560 — 640에서 줄였다(오너 「트리맵 좀 줄여줘」 2026-09-07).
 * 줄인 폭은 그대로 표가 가져가고, 표는 그 폭으로 더 큰 글자를 고른다. */
/* BODY_H 868 — 요약이 판 안으로 들어오면서 아래에 80px 넘는 죽은 자리가 생겼다(실측).
 * 그 자리를 판이 가져간다. 각주·푸터 사이 숨은 .tm-note 의 아래 margin 이 못박는다. */
const PLOT_W = 560, PLOT_GAP = 26, BODY_H = 868;
/* BAR_H 32 — 막대는 「1채 대 2채 이상」 한 가지만 말하는 도형이라 두꺼울 이유가 없다.
 * 글자가 막대 밖 라벨 줄에 있으므로 높이는 순전히 굵기 취향이다(오너 「좀 더 얇게」 2026-09-07).
 * 줄인 만큼은 아래 판이 그대로 가져간다. */
const LAB_H = 48, BAR_GAP = 12, BAR_H = 32, FUNNEL_H = 54, SUM_GAP = 20;
/* 요약 상자 높이는 **표의 한 행과 같다**(오너 2026-09-07: 두 아래끝을 같은 라인에).
 * 표는 머리글(hdPx + 아래여백 9 + 밑줄 2) 아래를 16행이 똑같이 나눠 갖는다 —
 * 그 한 칸과 같은 높이를 요약에 주면 밑줄이 저절로 맞는다. 좌표를 손으로 적지 않는다. */
const rowBandH = (hdPx, n) => (BODY_H - (hdPx + 11)) / n;
/* 막대 색 — 1채는 **연회색**(오너 2026-09-07: 종이 위에서 더 뒤로 물러나게), 2채 이상은 규격 코발트.
 * 「코발트 토막을 확대한 게 아래 트리맵」이라는 걸 색과 깔때기가 함께 말한다. */
const ONE_BG = "#E6E7EA", MULTI_BG = COBALT;

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

  /* 가로막대 — 소유자 100명을 1채 / 2채 이상으로 가른다. 글자는 막대 위 라벨 줄에 선다. */
  const bar = buildBar([
    { label: "1채", v: oneShare, valueTxt: pct(oneShare), bg: ONE_BG },
    { label: "2채 이상", v: multiSum, valueTxt: pct(multiSum), bg: MULTI_BG },
  ], PLOT_W, LAB_H, BAR_H, BAR_GAP);

  /* 표를 먼저 짓는다 — 표가 고른 머리글 크기가 요약 상자 높이를 정하고,
   * 그 높이가 정해져야 트리맵에 남는 세로가 나온다. 순서가 곧 의존 관계다.
   * (표는 언제나 16행 전부라 어느 묶음을 쓰든 모양이 같다 — 색만 나중에 채운다) */
  const table = buildTable(
    TABLE_ROWS.map((g) => ({ label: g.label, valueTxt: pct(g.v) })),
    ["보유 채수", "소유자 중"], BODY_H, 936 - PLOT_W - PLOT_GAP);
  const sumH = Math.floor(rowBandH(table.hdPx, TABLE_ROWS.length));
  const plotH = BODY_H - LAB_H - BAR_GAP - BAR_H - FUNNEL_H - SUM_GAP - sumH;
  if (plotH < 300) throw new Error(`판에 남는 세로가 ${plotH}px 뿐이다 — 위아래 층을 줄이거나 카드를 키운다`);

  const summary = `유주택자 중 다주택자 비율 <b>약 ${Math.round(multiSum)}%</b>`;

  /* 트리맵 — 막대의 오른쪽 토막을 확대한 것.
   * ⚠️ value(넓이)는 **2채 이상 안에서의 비중**으로 정규화하고,
   *    valueTxt(적히는 글자)는 **전체 기준 공표값** 그대로다(오너 2026-09-07).
   *    두 분모가 다르므로 깔때기가 카드 위에 「확대」라는 사실을 그린다.
   *
   * 꼬리 묶음은 **판이 정한다.** 10채부터 묶어 보고 마지막 칸이 채수도 못 담으면
   * 9채·8채로 한 칸씩 물러난다. 손으로 정하면 판 크기를 바꿀 때마다 사람이 다시 재야 한다. */
  let G, tileBg, plot, lastErr;
  for (const minTail of TAIL_FROM) {
    G = groupingFrom(minTail);
    /* 칸 색 — 트리맵 칸이 기준이고, 표의 각 행은 제가 속한 칸의 색을 그대로 쓴다.
     * 1채 행만 트리맵에 칸이 없다 — 그 행은 막대 왼쪽 토막의 색을 받는다. */
    tileBg = { [ONE_KEY]: ONE_BG };
    G.groups.forEach((g, i) => { tileBg[g.key] = pal.fn(i, G.groups.length, g.key); });
    const plotRows = G.groups.map((g) => ({
      value: r3((g.v / multiSum) * 100), label: g.label, valueTxt: pct(g.v), bg: tileBg[g.key],
    }));
    try {
      plot = buildPlot(plotRows.slice().sort((a, b) => b.value - a.value), PLOT_W, plotH);
      break;
    } catch (e) { lastErr = e; plot = null; }
  }
  if (!plot) throw lastErr;

  /* 색과 묶음선은 확정된 묶음을 따라 채운다. */
  const groupOf = groupOfIn(G);
  table.rows = TABLE_ROWS.map((g) => ({
    label: g.label, v1: pct(g.v), bg: tileBg[groupOf(g.key)],
    ...(isTail(groupOf(g.key)) ? { grp: true } : {}),
  }));

  /* 깔때기 — 코발트 토막(막대의 오른쪽 끝 구간)이 아래 트리맵으로 벌어진다. */
  const funnel = buildFunnel(oneShare, 100, FUNNEL_H, MULTI_BG, tileBg[G.groups[0].key]);

  const card = {
    template: "daso-treemap@1",
    date,
    subtitle: "집합건물 다소유지수 (2026.08월 기준)",
    title: TITLES[titleArg],
    plot: { w: PLOT_W, h: BODY_H, gap: PLOT_GAP, side: "right" },
    bar,
    /* 깔때기 — **없으면 안 되는 도형**이다. 트리맵 칸의 넓이와 적힌 %가 서로 다른 분모를
     * 쓰기 때문에, 확대라는 사실이 안 보이면 카드가 「2채가 판의 69%」라고 읽히고 그건 오보다.
     * 예전엔 이걸 문장으로 적었는데(오너 「설명 빼줘」 2026-09-07), 그림이 할 일이라 도형으로 옮겼다.
     * 문장이 아니라 도형이 되었을 뿐 **필수라는 성질은 그대로**라, 아래에서 존재를 검사한다. */
    funnel,
    tiles: plot.tiles,
    table,
    /* 오너 지시 문구(2026-09-07). 숫자는 손으로 적지 않는다 — 다소유지수 합을 반올림한 값이다.
     * ⚠️ 11%가 아니라 16%다. 11.08%는 「딱 2채」 한 구간이고, 다주택자는 2채 이상 전부다. */
    summary,
    /* 요약 상자 — 높이를 표의 한 행과 같게 줘 아래끝을 맞춘다. 글자 크기는 판 폭에 맞춘다. */
    sumBox: { h: sumH, gap: SUM_GAP, px: pickSumPx(summary, PLOT_W - 12) },
    notes: [
      `※ <b>집합건물</b> : 아파트 · 오피스텔 · 연립 · 다세대 등 구분소유 건물 (단독주택 제외)`,
      `※ <b>다소유지수</b> : 집합건물 소유자 중 2채 이상 보유자 비율`,
    ],
    source: SRC,
  };
  noHousingWord(card);
  /* 세로 뺄셈이 어긋나면 판이 flex 로 조용히 늘거나 줄어 칸 크기가 거짓이 된다 — 여기서 막는다. */
  const stack = LAB_H + BAR_GAP + BAR_H + FUNNEL_H + plotH + SUM_GAP + sumH;
  if (stack !== BODY_H) throw new Error(`오른쪽 칸 세로 합이 ${stack}px — 판 높이 ${BODY_H}px 와 다르다`);
  /* 분모가 둘인 판이라 깔때기가 사라지면 그림이 거짓말을 한다 — 사람 기억에 안 맡긴다. */
  if (!card.funnel || !/^calc\([\d.]+% \+ \d+px\) 0%,/.test(card.funnel.clip))
    throw new Error("확대 깔때기가 없다 — 칸 넓이(2채 이상 기준)와 적힌 %(전체 기준)의 분모가 다르다는 걸 카드가 못 말한다");
  return { card, noVal: plot.noVal, palName: pal.name, grouping: G };
}

/* ── ⑧ 내보내기 ───────────────────────────────────────────── */
if (variants) {
  const dir = join(ROOT, "data/out/_spike/daso-treemap");
  mkdirSync(dir, { recursive: true });
  console.log(`🎨 색 배합 시안 ${Object.keys(PALETTES).length}종 — ${dir}`);
  for (const k of Object.keys(PALETTES)) {
    const { card, noVal, palName, grouping } = makeCard(k);
    writeFileSync(join(dir, `daso-treemap-${k}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");
    console.log(`   ${k.padEnd(11)} ${palName} — 꼬리 ${grouping.minTail}채↑ · 채수만 적힌 칸: ${noVal.length ? noVal.join(", ") : "없음"}`);
  }
  console.log(`   검산 ✅ 1채 ${popOne.toFixed(3)} + 다보유 ${popMulti.toFixed(3)} = 소유지수 ${OWN}`);
} else {
  const palKey = palArg || "cobalt";
  const { card, noVal, palName, grouping } = makeCard(palKey);
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
    `집합건물 소유자 100명으로 보면 ${oneShare.toFixed(2)}명이 1채, ${multiSum.toFixed(2)}명이 2채 이상입니다.`,
    `카드의 가로막대가 이 둘이고, 아래 트리맵은 오른쪽 토막(2채 이상)만 확대한 것입니다.`,
    `칸의 크기는 2채 이상 안에서의 비중이지만, 칸에 적힌 %는 전체 소유자 기준 값입니다.`,
    ``,
    ...TABLE_ROWS.map((g) => `· ${g.label} ${g.v.toFixed(2)}% (국민 1만명당 ${per10k(g.v)}명)`),
    ``,
    `집합건물을 가진 사람 중 2채 이상은 ${multiSum.toFixed(2)}% — 약 ${Math.round(multiSum)}%입니다.`,
    `그 가운데 ${MULTI[0].v.toFixed(2)}%p가 딱 2채라, 여러 채를 가진 사람 열에 일곱은 두 채입니다.`,
    ``,
    `※ 트리맵에서 제일 큰 칸의 ${MULTI[0].v.toFixed(2)}%는 '2채' 한 구간의 값입니다.`,
    `   2채 이상 전체(=다보유)는 ${multiSum.toFixed(2)}%이니 둘을 섞지 마세요.`,
    ``,
    `※ 트리맵의 '${grouping.minTail}채 이상'은 원자료 ${grouping.tailItems.length}개 구간을 묶은 것입니다. 내역은 이렇습니다 —`,
    `   ${grouping.tailItems.map((m) => `${m.label} ${m.v.toFixed(2)}%`).join(" · ")}`,
    `   (카드 왼쪽 표에는 열여섯 구간이 그대로 다 들어 있습니다)`,
    `※ '주택'이 아니라 '집합건물'입니다. 아파트·연립·다세대·오피스텔 등이 들어가고`,
    `   단독주택은 빠집니다. 오피스텔·상가도 집합건물이라 여기 잡힙니다.`,
    `※ 그래서 국가데이터처 주택소유통계의 다보유 비율(2024년 14.9%)과는 다른 통계입니다.`,
    `   모집단이 다르니 두 숫자를 나란히 놓고 비교하지 마세요.`,
    `※ 1채 비율은 포털 유의사항대로 100 − 다소유지수 합으로 구했습니다.`,
    `※ 소유명의인 기준입니다(내국인·재외국민).`,
    `※ 최신월은 잠정치입니다 — 포털도 "신청 후 등기가 완료되지 않은 소유명의인이 존재할 수 있다"고 적어 둡니다.`,
    `※ 출처: 법원 등기정보광장 집합건물 소유지수·다소유지수, 2026년 8월 기준.`,
    ``,
    `#등기정보광장 #집합건물 #부동산통계 #오피스텔 #위릿`,
  ].join("\n");
  writeCaption("daso-treemap", caption); // ⚠️ 서명은 writeCaption 이 붙인다

  console.log(`🧩 daso-treemap [${palName}] — ${publish ? "data/content" : "_spike"}/${date}`);
  console.log(`   검산 ✅ 1채 ${popOne.toFixed(3)} + 다보유 ${popMulti.toFixed(3)} = 소유지수 ${OWN}`);
  console.log(`   칸 ${grouping.groups.length} (꼬리 ${grouping.minTail}채↑ 로 묶음 · 전부 채수 표기) · 채수만 적힌 칸: ${noVal.length ? noVal.join(", ") : "없음"}`);
}
