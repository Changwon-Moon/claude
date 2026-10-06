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
const years = ((+latest.slice(0, 4) * 12 + +latest.slice(5)) - (+first.ym.slice(0, 4) * 12 + +first.ym.slice(5))) / 12;

const dataUri = (file) => {
  const p = join(ROOT, "templates/_shared/photos", file);
  if (!existsSync(p)) return null;
  return "data:image/png;base64," + readFileSync(p).toString("base64");
};
const seoulHref = "data:image/svg+xml;base64," +
  readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg")).toString("base64");

const TITLE =
  `<span class="tl"><img class="tlogo" src="${seoulHref}" alt="" />서울 아파트 ${Math.round(years)}년, 매매만 <span class="hi">${mult.mae.toFixed(1)}배</span></span>` +
  `<span class="tl">전세 ${mult.jeon.toFixed(1)}배 · 월세 ${mult.wol.toFixed(1)}배</span>`;
const NOTE =
  `매매 <b>${first.mae.toFixed(1)} → ${now.mae.toFixed(1)}억</b> · 전세 <i>${first.jeon.toFixed(1)} → ${now.jeon.toFixed(1)}억</i> · ` +
  `월세 ${Math.round(first.wol)} → ${Math.round(now.wol)}만원<br>` +
  `※ 시점은 각 정부 출범월 — 박근혜만 평균월세 집계가 시작된 ${first.when}`;
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

const VARIANTS = { a: variantA, b: variantB };
const argv = process.argv.slice(2);
const picks = argv.filter((a) => /^[ab]$/.test(a));
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ||
  new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });

for (const v of (picks.length ? picks : ["a", "b"])) {
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
