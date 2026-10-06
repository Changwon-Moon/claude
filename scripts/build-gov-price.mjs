/**
 * 서울 아파트 평균 매매·전세·월세 — 정부 시점별 5×3 격자. gov-price-grid@1.
 *
 * ── 데이터: 원자료에서 코드가 계산한다 (오보 0)
 * data/datasets/reb-rent-index.json 의 **금액 계열 세 개**만 읽는다(지수가 아니다):
 *   avgMae(평균매매가격_아파트) · avgJeonse(평균전세가격_아파트) · avgWolse(평균월세가격_아파트)
 * 모두 한국부동산원 R-ONE, 단위는 **천원**. 서울(500008) 계열만 쓴다.
 * 손으로 적은 금액 0개 — 표시 단위(억·만원) 변환까지 여기서 한다.
 *
 * ── 왜 첫 시점이 '정부 출범일'이 아닌가 (오너 선택 2026-10-06)
 * 부동산원 **평균월세가격은 2015-07부터**다. 박근혜 정부 출범(2013-02)에는 월세 칸을 채울 수
 * 없다. 빈 칸을 만들거나 정부를 하나 빼는 대신, 오너가 **그 자리를 2015-07(월세 집계 시작)로**
 * 바꾸기로 했다. 그래서 첫 행은 '박근혜 정부 · 2015.7'이고, 그 사실을 카드 각주에 밝힌다.
 * 나머지 네 시점은 출범월(문재인 2017-05 · 윤석열 2022-05 · 이재명 2025-06)과 최신월이다.
 *
 * 실행: node scripts/build-gov-price.mjs [a|b] [날짜]
 *   a = 격자(사진 축 + 세 열)   b = 지표별 세로 막대 3묶음
 *   인자 없으면 둘 다 만든다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { makeRebCalendar } from "./lib/reb-week.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));
const SEOUL = d.meta.seoulCode || "500008";

const RED = "#e5484d", COBALT = "#2e6bff", INK = "#141821", MUTE = "#9aa3af";
const RED_SOFT = "rgba(229,72,77,0.16)", INK_SOFT = "rgba(20,24,33,0.10)";

/* ── 금액 계열 셋이 다 있어야 한다. 하나라도 없으면 던진다(반쪽 카드 금지) ── */
for (const k of ["avgMae", "avgJeonse", "avgWolse"]) {
  if (!d[k]?.[SEOUL]) throw new Error(`${k} 서울 계열이 없다 — reb-collect 로 수집했는지 확인하라`);
}
/* 단위는 데이터가 말한 것만 믿는다. meta.unit 이 천원이라고 적어 둔 계열이 기준이고,
 * 평균매매는 평균전세와 같은 표 묶음(같은 API·같은 항목)이라 같은 단위다. */
const UNIT = d.meta.unit || {};
if (UNIT.avgJeonse && UNIT.avgJeonse !== "천원")
  throw new Error(`금액 단위가 천원이 아니다(${UNIT.avgJeonse}) — 환산식을 다시 맞춰라`);

const mae = d.avgMae[SEOUL], jeon = d.avgJeonse[SEOUL], wol = d.avgWolse[SEOUL];

/* ── 표본 개편 단절을 **코드가 찾는다** (2026-10-07 발견 · 오보 0) ────────────────
 * 부동산원 '평균 금액'은 품질조정 지수가 아니라 그 달 표본의 산술평균이다. 그래서
 * **표본을 갈아끼운 달에 금액이 통째로 점프한다** — 시장이 움직인 게 아니다.
 * 2021년 7월 개편(표본주택 3.5배 확대)이 대표적이고, 그 달 금액은 매매 +19.5%·전세 +23.5%
 * 뛰었는데 **가격지수는 +0.6%·+0.7%** 였다. 2015-07·2017-12·2019-01·2020-01·2025-04 도 같다.
 * 이 단절을 모르고 두 시점을 나누면 "11년 2.5배"가 나오는데, 품질조정 지수로는 1.43배다.
 * → 금액 계열의 월간 변동이 **같은 달 지수 변동과 3%p 이상 벌어지고 4% 넘게 튀면** 단절로 본다.
 *   (2022년 말 전세 급락은 지수도 같이 내려가 여기 안 걸린다 — 그건 진짜 시장이다)
 * 카드는 이 자리를 점선으로 긋고, 배수 문구를 제목에서 뺀다. */
const wk = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const WCAL = makeRebCalendar(Object.keys(wk.mae[wk.meta.seoulCode]));
const maeIdx = (() => {
  const src = wk.mae[wk.meta.seoulCode], bucket = {};
  for (const k of Object.keys(src).sort()) {
    const m = WCAL.iso(k).slice(0, 7);
    (bucket[m] ||= []).push(src[k]);
  }
  return Object.fromEntries(Object.entries(bucket).map(([m, v]) => [m, v.reduce((a, b) => a + b, 0) / v.length]));
})();
const IDX = { mae: maeIdx, jeon: d.jeonse[SEOUL], wol: d.wolseAll[SEOUL] };
const MONEY = { mae, jeon, wol };
const BREAK_MOM = 4, BREAK_GAP = 3;
const breaks = (() => {
  const hit = new Map();
  for (const key of ["mae", "jeon", "wol"]) {
    const money = MONEY[key], idx = IDX[key], ks = Object.keys(money).sort();
    for (let i = 1; i < ks.length; i++) {
      const m = ks[i], p = ks[i - 1];
      if (idx[m] === undefined || idx[p] === undefined) continue;
      const mm = (money[m] / money[p] - 1) * 100, ii = (idx[m] / idx[p] - 1) * 100;
      if (Math.abs(mm) >= BREAK_MOM && Math.abs(mm - ii) >= BREAK_GAP) {
        if (!hit.has(m)) hit.set(m, []);
        hit.get(m).push(`${key} 금액 ${mm.toFixed(1)}% vs 지수 ${ii.toFixed(1)}%`);
      }
    }
  }
  return [...hit.entries()].sort().map(([ym, why]) => ({ ym, why }));
})();
if (!breaks.length) console.warn("⚠️  표본 개편 단절을 하나도 못 찾았다 — 탐지 기준이나 데이터를 확인하라");
const latest = [mae, jeon, wol].map((s) => Object.keys(s).sort().pop()).sort()[0];   // 셋 다 있는 가장 늦은 달

/* ── 시점 다섯 ── */
const WOLSE_FROM = Object.keys(wol).sort()[0];        // 평균월세 집계 시작월(실측)
const POINTS = [
  { ym: WOLSE_FROM, name: "박근혜", photo: "park-geunhye-face.png", note: "월세 집계 시작" },
  { ym: "2017-05", name: "문재인", photo: "moon-jaein-face.png", note: "정부 출범" },
  { ym: "2022-05", name: "윤석열", photo: "yoon-sukyeol4-face.png", note: "정부 출범" },
  { ym: "2025-06", name: "이재명", photo: "lee-jaemyung-face.png", note: "정부 출범" },
  { ym: latest, name: "지금", photo: null, note: "최신 공표", now: true },
];
const ymLabel = (ym) => `${ym.slice(2, 4)}.${String(+ym.slice(5))}`;      // "17.5"

const rows = POINTS.map((p) => {
  for (const [lbl, s] of [["매매", mae], ["전세", jeon], ["월세", wol]]) {
    if (s[p.ym] === undefined) throw new Error(`${p.ym} 의 ${lbl} 값이 없다 — 시점을 바꾸거나 수집을 확인하라`);
  }
  return {
    ...p,
    when: ymLabel(p.ym),
    mae: mae[p.ym] / 100000,     // 천원 → 억원
    jeon: jeon[p.ym] / 100000,   // 천원 → 억원
    wol: wol[p.ym] / 10,         // 천원 → 만원
  };
});
const first = rows[0], now = rows[rows.length - 1];
const x = (b, a) => b / a;                                   // 배수
const COLS = [
  { key: "mae", name: "매매", unit: "억원", fmt: (v) => v.toFixed(1), color: RED },
  { key: "jeon", name: "전세", unit: "억원", fmt: (v) => v.toFixed(1), color: COBALT },
  { key: "wol", name: "월세", unit: "만원", fmt: (v) => Math.round(v).toLocaleString("ko-KR"), color: INK },
];
const mult = Object.fromEntries(COLS.map((c) => [c.key, x(now[c.key], first[c.key])]));
/* 품질조정 지수 기준 배수 — 금액 배수는 표본 개편이 섞여 과장된다. 비교는 이쪽이 정직하다. */
const multIdx = Object.fromEntries(COLS.map((c) => {
  const i = IDX[c.key];
  return [c.key, (i[latest] !== undefined && i[first.ym] !== undefined) ? i[latest] / i[first.ym] : null];
}));
const years = ((+latest.slice(0, 4) * 12 + +latest.slice(5)) - (+first.ym.slice(0, 4) * 12 + +first.ym.slice(5))) / 12;

const dataUri = (file) => {
  const p = join(ROOT, "templates/_shared/photos", file);
  if (!existsSync(p)) return null;
  return "data:image/png;base64," + readFileSync(p).toString("base64");
};
const seoulHref = "data:image/svg+xml;base64," +
  readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg")).toString("base64");

/* ⚠️ 제목에 **금액 배수를 쓰지 않는다** (2026-10-07).
 * 평균 금액 계열에는 표본 개편 단절이 다섯 번 들어 있어 "11년 2.5배"는 시장이 그만큼 올랐다는
 * 뜻이 아니다(품질조정 지수로는 1.43배). 수준(얼마가 됐나)은 그대로 말할 수 있으므로
 * 제목은 **금액 수준**으로 간다. */
const TITLE =
  `<span class="tl"><img class="tlogo" src="${seoulHref}" alt="" />정부가 네 번 바뀌는 동안</span>` +
  `<span class="tl">서울 아파트 <span class="hi">${first.mae.toFixed(1)}억 → ${now.mae.toFixed(1)}억</span></span>`;
const NOTE =
  `매매 <b>${first.mae.toFixed(1)} → ${now.mae.toFixed(1)}억</b> · 전세 <i>${first.jeon.toFixed(1)} → ${now.jeon.toFixed(1)}억</i> · ` +
  `월세 ${Math.round(first.wol)} → ${Math.round(now.wol)}만원<br>` +
  `※ 점선 ${breaks.length}곳 = 조사 표본이 바뀌어 금액만 튄 달 · 품질조정 지수로는 ` +
  `매매 ${multIdx.mae.toFixed(1)} · 전세 ${multIdx.jeon.toFixed(1)} · 월세 ${multIdx.wol.toFixed(1)}배`;
const SOURCE = { name: "한국부동산원 평균 매매·전세·월세가격(아파트)", asOf: `${latest.slice(0, 4)}.${+latest.slice(5)}` };

/* ── 시안 A: 사진 축 + 세 열 격자 ─────────────────────────────────────────── */
function variantA() {
  const NAMEW = 212, GAP = 14;
  const COLW = Math.floor((1000 - NAMEW - GAP * 2) / 3);        // = 252
  const TOP = 136, ROW = 132;
  const rects = [], texts = [], lines = [], faces = [];

  /* 단위는 열 이름 바로 아래에 둔다. 오른쪽 끝에 붙이면 **다음 열 제목 옆**에 가서
     "억원 전세"처럼 읽힌다(1차 시안에서 실제로 그렇게 보였다). */
  COLS.forEach((c, ci) => {
    const cx = NAMEW + ci * (COLW + GAP);
    texts.push({ cls: "gp-col", x: cx, y: 44, text: c.name, fill: c.color, anchor: "start" });
    texts.push({ cls: "gp-unit", x: cx, y: 82, text: `단위 ${c.unit}`, fill: MUTE, anchor: "start" });
  });
  lines.push({ x1: 0, y1: 100, x2: 1000, y2: 100, stroke: "rgba(20,24,33,0.14)", sw: 2 });

  const maxOf = Object.fromEntries(COLS.map((c) => [c.key, Math.max(...rows.map((r) => r[c.key]))]));

  rows.forEach((r, ri) => {
    const y = TOP + ri * ROW;
    if (r.now) rects.push({ x: -2, y: y - 14, w: 1004, h: ROW - 8, rx: 16, fill: RED_SOFT });

    /* 왼쪽: 사진(없으면 레드 알약) + 이름 + 시점 */
    if (r.photo && dataUri(r.photo)) {
      const R = 38, cxp = 44, cyp = y + 40;
      faces.push({ id: `f${ri}`, cx: cxp, cy: cyp, r: R, ring: R + 3, ringFill: "rgba(20,24,33,0.10)",
                   href: dataUri(r.photo), x: cxp - R, y: cyp - R, w: R * 2, h: R * 2 });
    } else {
      rects.push({ x: 14, y: y + 14, w: 60, h: 52, rx: 14, fill: RED });
      texts.push({ cls: "gp-name", x: 44, y: y + 50, text: "NOW", fill: "#fff", anchor: "middle" });
    }
    texts.push({ cls: "gp-name", x: 96, y: y + 34, text: r.name, fill: r.now ? RED : INK, anchor: "start" });
    /* 시점만 적는다 — "15.7 월세 집계 시작"처럼 길게 쓰면 매매 열 막대 위로 흘러나간다.
       무엇을 뜻하는 시점인지는 카드 아래 각주가 한 번에 말한다. */
    texts.push({ cls: "gp-when", x: 96, y: y + 66, text: r.when, fill: MUTE, anchor: "start" });

    COLS.forEach((c, ci) => {
      const cx = NAMEW + ci * (COLW + GAP);
      const v = r[c.key];
      const bw = Math.max(6, Math.round(v / maxOf[c.key] * (COLW - 10)));
      rects.push({ x: cx, y: y + 62, w: COLW - 10, h: 10, rx: 5, fill: INK_SOFT });
      rects.push({ x: cx, y: y + 62, w: bw, h: 10, rx: 5, fill: r.now ? c.color : "rgba(20,24,33,0.34)" });
      texts.push({ cls: r.now ? "gp-valb" : "gp-val", x: cx, y: y + 44, text: c.fmt(v),
                   fill: r.now ? c.color : INK, anchor: "start" });
    });
  });

  const H = TOP + rows.length * ROW + 8;
  return { vb: `0 0 1000 ${H}`, rects, texts, lines, faces,
           wm: { x: 500, y: H - 2, size: 28, text: "@wirit_note", fill: INK, opacity: 0.12, anchor: "middle" } };
}

/* ── 시안 B: 지표별 세로 막대 3묶음 ───────────────────────────────────────── */
function variantB() {
  const PW = 320, GX = 20, PX = [0, PW + GX, (PW + GX) * 2];
  const BASE = 580, MAXH = 330, BW = 44, STEP = 62, PAD = 22;
  const rects = [], texts = [], lines = [], faces = [];
  const maxOf = Object.fromEntries(COLS.map((c) => [c.key, Math.max(...rows.map((r) => r[c.key]))]));

  COLS.forEach((c, ci) => {
    const x0 = PX[ci];
    texts.push({ cls: "gp-col", x: x0 + PW / 2, y: 52, text: c.name, fill: c.color, anchor: "middle" });
    texts.push({ cls: "gp-unit", x: x0 + PW / 2, y: 86, text: `단위 ${c.unit}`, fill: MUTE, anchor: "middle" });
    lines.push({ x1: x0 + 6, y1: BASE, x2: x0 + PW - 6, y2: BASE, stroke: "rgba(20,24,33,0.14)", sw: 2 });
    rows.forEach((r, ri) => {
      const bx = x0 + PAD + ri * STEP, cxb = bx + BW / 2;
      const bh = Math.max(10, Math.round(r[c.key] / maxOf[c.key] * MAXH)), by = BASE - bh;
      rects.push({ x: bx, y: by, w: BW, h: bh, rx: 8, fill: r.now ? c.color : "rgba(20,24,33,0.16)" });
      texts.push({ cls: "gp-sub", x: cxb, y: by - 14, text: c.fmt(r[c.key]), fill: r.now ? c.color : INK, anchor: "middle" });
      if (ci === 0) {
        /* 사진 축은 왼쪽 묶음 아래 한 번만 — 세 묶음이 같은 순서라 반복하면 소음이다 */
        if (r.photo && dataUri(r.photo)) {
          const R = 26, cyp = BASE + 46;
          faces.push({ id: `g${ri}`, cx: cxb, cy: cyp, r: R, ring: R + 2, ringFill: "rgba(20,24,33,0.10)",
                       href: dataUri(r.photo), x: cxb - R, y: cyp - R, w: R * 2, h: R * 2 });
        } else {
          rects.push({ x: cxb - 26, y: BASE + 22, w: 52, h: 48, rx: 12, fill: RED });
          texts.push({ cls: "gp-sub", x: cxb, y: BASE + 53, text: "NOW", fill: "#fff", anchor: "middle" });
        }
        texts.push({ cls: "gp-sub", x: cxb, y: BASE + 96, text: r.when, fill: r.now ? RED : MUTE, anchor: "middle" });
      }
    });
  });
  texts.push({ cls: "gp-when", x: PX[1], y: BASE + 96, text: "← 같은 순서(박근혜 → 지금)", fill: MUTE, anchor: "start" });
  const H = BASE + 124;
  return { vb: `0 0 1000 ${H}`, rects, texts, lines, faces,
           wm: { x: 500, y: 150, size: 34, text: "@wirit_note", fill: INK, opacity: 0.10, anchor: "middle" } };
}

/* ── 시안 C: 표 + 월별 선그래프 3개 + 정부 구간 밴드 ──────────────────────────
 * 위는 다섯 시점 표, 아래는 **월별 전 구간** 곡선 셋. 표는 "얼마"를, 곡선은 "어떻게"를 말한다.
 * ⚠️ 세 곡선은 **x축을 공유**한다(데이터 시작월 ~ 최신월). 월세만 선이 중간에서 시작하는데,
 *    평균월세 집계가 2015-07부터이기 때문이다 — 그 공백을 이어 그리지 않는다(없는 궤적 금지).
 * ⚠️ 세로 밴드는 정부 **교체월**로 끊는다. 권한대행 기간(2017.3~5 · 2025.4~6)은 따로 칠하지
 *    않고 직전 정부 구간에 포함했다 — 두 달짜리 띠는 카드에서 소음이고, 그 사실은 각주에 밝힌다. */
const GOVS = [
  { name: "이명박", from: "2008-02" },
  { name: "박근혜", from: "2013-02" },
  { name: "문재인", from: "2017-05" },
  { name: "윤석열", from: "2022-05" },
  { name: "이재명", from: "2025-06", now: true },
];
const mi = (ym) => +ym.slice(0, 4) * 12 + (+ym.slice(5) - 1);   // 월 일련번호

function variantC() {
  const allMonths = Object.keys(mae).sort();
  const M0 = mi(allMonths[0]), M1 = mi(latest);
  const SPAN = M1 - M0;
  const px = (ym) => Math.round((mi(ym) - M0) / SPAN * 1000);

  const rects = [], texts = [], lines = [], paths = [], areas = [], dots = [], faces = [];

  /* ① 표 — 다섯 시점 */
  const CX = [250, 500, 748, 1000];                 // 각 숫자 열의 오른쪽 끝
  texts.push({ cls: "gp-th", x: 0, y: 26, text: "시점", fill: MUTE, anchor: "start" });
  COLS.forEach((c, ci) => texts.push({ cls: "gp-th", x: CX[ci + 1], y: 26, text: `${c.name} (${c.unit})`, fill: c.color, anchor: "end" }));
  lines.push({ x1: 0, y1: 42, x2: 1000, y2: 42, stroke: "rgba(20,24,33,0.16)", sw: 2 });
  const RH = 48, R0 = 42;
  rows.forEach((r, ri) => {
    const y = R0 + ri * RH;
    if (r.now) rects.push({ x: -8, y: y + 3, w: 1016, h: RH - 4, rx: 12, fill: RED_SOFT });
    else if (ri % 2 === 1) rects.push({ x: -8, y: y + 3, w: 1016, h: RH - 4, rx: 12, fill: "rgba(20,24,33,0.035)" });
    texts.push({ cls: "gp-th", x: 0, y: y + 34, text: `${r.name} ${r.when}`, fill: r.now ? RED : INK, anchor: "start" });
    COLS.forEach((c, ci) => texts.push({
      cls: r.now ? "gp-tdb" : "gp-td", x: CX[ci + 1], y: y + 36,
      text: c.fmt(r[c.key]), fill: r.now ? c.color : INK, anchor: "end",
    }));
  });

  /* ② 월별 곡선 셋 — 같은 x축 */
  const CH = 130, CGAP = 16, C0 = R0 + rows.length * RH + 30;
  const bandEdges = GOVS.map((g, i) => ({
    ...g,
    x1: Math.max(0, px(g.from < allMonths[0] ? allMonths[0] : g.from)),
    x2: i + 1 < GOVS.length ? px(GOVS[i + 1].from) : 1000,
  })).filter((g) => g.x2 > g.x1);

  COLS.forEach((c, ci) => {
    const top = C0 + ci * (CH + CGAP), bot = top + CH;
    const series = { mae, jeon, wol }[{ mae: "mae", jeon: "jeon", wol: "wol" }[c.key]];
    const scale = c.key === "wol" ? 10 : 100000;      // 천원 → 만원 / 억원
    const months = Object.keys(series).sort().filter((m) => mi(m) >= M0 && mi(m) <= M1);
    const vals = months.map((m) => series[m] / scale);
    const vmax = Math.max(...vals) * 1.12;
    const y = (v) => Math.round(bot - (v / vmax) * (CH - 14));

    /* 정부 구간 밴드 — 색은 뜻 하나씩: 현 정부만 레드, 나머지는 번갈아 옅은 잉크 */
    bandEdges.forEach((g, gi) => rects.push({
      x: g.x1, y: top, w: g.x2 - g.x1, h: CH, rx: 0,
      fill: g.now ? "rgba(229,72,77,0.10)" : (gi % 2 ? "rgba(20,24,33,0.055)" : "rgba(20,24,33,0.025)"),
    }));
    bandEdges.slice(1).forEach((g) => lines.push({ x1: g.x1, y1: top, x2: g.x1, y2: bot, stroke: "rgba(20,24,33,0.16)", sw: 2 }));
    /* 표본 개편 자리 — 세 그래프 모두에 같은 점선. 여기서 선이 한 칸 솟는 것은 시장이 아니다 */
    breaks.forEach((b) => lines.push({ x1: px(b.ym), y1: top + 4, x2: px(b.ym), y2: bot - 4,
                                       stroke: "rgba(20,24,33,0.46)", sw: 2.5, dash: "7 6" }));

    const pts = months.map((m, i) => `${px(m)},${y(vals[i])}`).join(" ");
    areas.push({ points: `${px(months[0])},${bot} ${pts} ${px(months[months.length - 1])},${bot}`, fill: c.key === "mae" ? "rgba(229,72,77,0.13)" : c.key === "jeon" ? "rgba(46,107,255,0.12)" : "rgba(20,24,33,0.10)" });
    paths.push({ points: pts, stroke: c.color, sw: 5 });
    const lx = px(months[months.length - 1]), ly = y(vals[vals.length - 1]);
    dots.push({ cx: lx, cy: ly, r: 8, fill: "#fff", stroke: c.color, sw: 5 });

    texts.push({ cls: "gp-th", x: 10, y: top + 30, text: `${c.name} (${c.unit})`, fill: c.color, anchor: "start" });
    texts.push({ cls: "gp-tick", x: lx - 14, y: ly - 16, text: c.fmt(vals[vals.length - 1]), fill: c.color, anchor: "end" });
    if (c.key === "wol") texts.push({ cls: "gp-tick", x: px(months[0]) + 10, y: bot - 12, text: `${months[0].slice(2, 4)}.${+months[0].slice(5)} 집계 시작`, fill: MUTE, anchor: "start" });
  });

  /* ③ 정부 이름 띠 — 한 번만 */
  const LY = C0 + 3 * (CH + CGAP) + 6;
  bandEdges.forEach((g) => {
    const w = g.x2 - g.x1;
    if (w < 70) return;                               // 좁은 칸은 이름을 안 넣는다(겹친다)
    texts.push({ cls: "gp-tick", x: (g.x1 + g.x2) / 2, y: LY + 22, text: g.name, fill: g.now ? RED : MUTE, anchor: "middle" });
  });
  const H = LY + 40;
  return { vb: `0 0 1000 ${H}`, rects, texts, lines, paths, areas, dots, faces,
           wm: { x: 330, y: C0 + CH + CGAP + 112, size: 30, text: "@wirit_note", fill: INK, opacity: 0.11, anchor: "middle" } };
}

const VARIANTS = { a: variantA, b: variantB, c: variantC };
const argv = process.argv.slice(2);
const picks = argv.filter((a) => /^[abc]$/.test(a));
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ||
  new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });

for (const v of (picks.length ? picks : ["a", "b", "c"])) {
  const card = {
    template: "gov-price-grid@1",
    date,
    badge: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
    title: TITLE,
    chart: VARIANTS[v](),
    note: NOTE,
    source: SOURCE,
  };
  writeFileSync(join(outDir, `gov-price-${v}.json`), JSON.stringify(card, null, 2) + "\n");
  console.log(`gov-price-${v} (gov-price-grid@1) — ${date} · 기준 ${latest}`);
}
console.log("   시점별 (매매억 / 전세억 / 월세만원)");
for (const r of rows) console.log(`   ${r.when.padEnd(6)} ${r.name.padEnd(4)} ${r.mae.toFixed(2)} / ${r.jeon.toFixed(2)} / ${r.wol.toFixed(1)}`);
console.log(`   ${first.when}→${now.when} 배수: 매매 ${mult.mae.toFixed(2)} · 전세 ${mult.jeon.toFixed(2)} · 월세 ${mult.wol.toFixed(2)}`);
