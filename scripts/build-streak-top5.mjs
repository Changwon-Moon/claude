/**
 * 서울 아파트 연속 상승 TOP5 — 좌 매매 / 우 전세. streak-top5@1.
 *
 * ── 데이터: 원자료에서 코드가 계산한다 (오보 0)
 * data/datasets/reb-weekly-index.json(부동산원 R-ONE 주간 매매·전세지수)만 읽는다.
 * 연속 상승 구간은 **부동산원 발표 기준**으로 센다 (CEO.md ⑪ · 2026-09-25 교정):
 *   판정 = 발표 변동률(소수 둘째 자리) > 0.00%  ·  주수 = 발표 건수
 * 지수 레벨(v[i] > v[i-1])로 세면 미세 상승주를 얹어 과다계상된다 — 09-18 오보의 원인.
 *
 * ── 날짜 환산
 * scripts/lib/reb-week.mjs 가 정본. ISO 연차주로 계산하면 2017·2023 년이 일주일 밀린다
 * (2026-10-04 발견 — 이 카드의 매매 3위 구간이 2017년이라 여기서 처음 드러났다).
 *
 * ── 축척은 두 패널이 공유한다
 * 전세 역대 1위(135주)가 매매 1위(86주)보다 훨씬 길다. 패널마다 따로 늘려 길이를 맞추면
 * 두 시장이 같아 보인다 — 길이로 거짓말하지 않는다. 한 자(尺)로 둘 다 잰다.
 *
 * 실행: node scripts/build-streak-top5.mjs [a|b|c] [날짜]
 *   a = 나비형(가운데 순위축·좌우 대칭)  b = 좌우 세로막대  c = 좌우 가로막대 랭킹
 *   인자 없으면 세 시안을 모두 만든다.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { makeRebCalendar } from "./lib/reb-week.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const SEOUL = d.meta.seoulCode;
const CAL = makeRebCalendar(Object.keys(d.mae[SEOUL]));

const RED = "#e5484d", COBALT = "#2e6bff", INK = "#141821", MUTE = "#9aa3af";
const RED_SOFT = "rgba(229,72,77,0.16)", COB_SOFT = "rgba(46,107,255,0.16)";

/* ── 연속 상승 구간 TOP N ───────────────────────────────────────────────────── */
function topRuns(series, n = 5) {
  const ks = Object.keys(series).sort();
  const v = ks.map((k) => series[k]);
  const pub = (i) => Math.round(((v[i] / v[i - 1] - 1) * 100) * 100) / 100;   // 발표 형식(소수 둘째)
  const runs = [];
  for (let i = 1; i < ks.length;) {
    if (pub(i) > 0) {
      const base = i - 1; let j = i;
      while (j < ks.length && pub(j) > 0) j++;
      runs.push({ base, end: j - 1, weeks: (j - 1) - base });
      i = j + 1;
    } else i++;
  }
  const last = ks.length - 1;
  return runs
    .map((r) => ({
      weeks: r.weeks,
      start: CAL.label(ks[r.base + 1]), end: CAL.label(ks[r.end]),
      startIso: CAL.iso(ks[r.base + 1]), endIso: CAL.iso(ks[r.end]),
      cum: (v[r.end] / v[r.base] - 1) * 100,
      ongoing: r.end === last,
    }))
    .sort((a, b) => b.weeks - a.weeks)
    .slice(0, n);
}

const mae = topRuns(d.mae[SEOUL]);
const jeon = topRuns(d.jeonse[SEOUL]);
const MAXW = Math.max(...mae.map((r) => r.weeks), ...jeon.map((r) => r.weeks));   // 공유 축척의 기준
const maeNow = mae.findIndex((r) => r.ongoing) + 1;      // 현재 상승기의 매매 순위
const jeonNow = jeon.findIndex((r) => r.ongoing) + 1;
const nowW = mae.find((r) => r.ongoing)?.weeks;
if (!maeNow || !jeonNow) throw new Error("현재 진행 중인 상승 구간을 못 찾았다 — 지금은 상승 국면이 아니다");
if (nowW !== jeon.find((r) => r.ongoing).weeks)
  console.warn(`⚠️  매매(${nowW}주)와 전세(${jeon.find((r) => r.ongoing).weeks}주)의 현재 주수가 다르다 — 제목 문구를 확인하라`);

/* 연도 범위 — 'YY.M~YY.M' 짧은 표기 (막대 아래 작은 글씨용) */
const span = (r) => {
  const a = r.startIso.slice(2, 7).replace("-", "."), b = r.endIso.slice(2, 7).replace("-", ".");
  return `${a}~${r.ongoing ? "현재" : b}`;
};

const latestKey = d.meta.asOf || Object.keys(d.mae[SEOUL]).sort().pop();
const asOfLabel = CAL.label(latestKey);
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

const seoulHref = "data:image/svg+xml;base64," +
  readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg")).toString("base64");

const TITLE =
  `<span class="tl"><img class="tlogo" src="${seoulHref}" alt="" />서울 아파트 <span class="hi">연속 상승</span> 역대 TOP5</span>` +
  `<span class="tl">매매는 <span class="hi">${maeNow}위</span>, 전세는 <span class="hb">${jeonNow}위</span></span>`;

const NOTE =
  `지금 상승기는 매매 <b>${maeNow}위(${nowW}주)</b> · 전세 <i>${jeonNow}위</i> — ` +
  `막대 길이는 좌우가 같은 축척(최장 ${MAXW}주)`;

const SOURCE = { name: "한국부동산원 주간 아파트가격동향", asOf: asOfLabel };

/* ── 시안 A: 나비형 — 가운데 순위축, 좌 매매 / 우 전세 ───────────────────────── */
function variantA() {
  const CX = 500, GAP = 54;                  // 중앙 순위축 ~ 막대 시작까지의 반폭
  const L0 = CX - GAP, R0 = CX + GAP;
  /* 축척 상한은 "가장 긴 막대 끝 + 주수 글씨"가 카드 밖으로 안 나가게 잡는다.
     135주 라벨이 잘려 나간 1차 시안의 재발 방지 — 폭은 계산해서 정한다. */
  const LABELW = 128, EDGE = 16;
  const MAXLEN = CX - GAP - LABELW - EDGE;   // = 302
  const BH = 62, ROW = 124, TOP = 196;
  const LCOL = CX - GAP - MAXLEN - 16, RCOL = CX + GAP + MAXLEN + 16;   // 주수 고정 열
  const CUM_MIN = 150;                        // 누적률(+00.00%)이 막대 안에 들어가는 최소 길이
  const len = (w) => Math.max(16, Math.round(w / MAXW * MAXLEN));
  const rects = [], texts = [], lines = [];

  texts.push({ cls: "st-pt", x: L0 - 6, y: 96, text: "매매", fill: RED, anchor: "end" });
  texts.push({ cls: "st-pt", x: R0 + 6, y: 96, text: "전세", fill: COBALT, anchor: "start" });
  texts.push({ cls: "st-ptsub", x: L0 - 6, y: 136, text: "← 연속 상승 주수", fill: MUTE, anchor: "end" });
  texts.push({ cls: "st-ptsub", x: R0 + 6, y: 136, text: "연속 상승 주수 →", fill: MUTE, anchor: "start" });

  for (let i = 0; i < 5; i++) {
    const y = TOP + i * ROW, cy = y + BH / 2;
    texts.push({ cls: "st-rank", x: CX, y: cy + 10, text: `${i + 1}`, fill: INK, anchor: "middle" });

    const m = mae[i], j = jeon[i];
    const lw = len(m.weeks), rw = len(j.weeks);
    rects.push({ x: L0 - lw, y, w: lw, h: BH, rx: 11, fill: m.ongoing ? RED : RED_SOFT });
    rects.push({ x: R0, y, w: rw, h: BH, rx: 11, fill: j.ongoing ? COBALT : COB_SOFT });

    /* 주수는 **고정 열**에 — 막대 끝에 붙이면 들쭉날쭉해 읽기 나쁘다 */
    texts.push({ cls: m.ongoing ? "st-valb" : "st-val", x: LCOL, y: cy + 12,
                 text: `${m.weeks}주`, fill: m.ongoing ? RED : INK, anchor: "end" });
    texts.push({ cls: j.ongoing ? "st-valb" : "st-val", x: RCOL, y: cy + 12,
                 text: `${j.weeks}주`, fill: j.ongoing ? COBALT : INK, anchor: "start" });
    /* 누적률은 막대 안쪽 끝에. 막대가 짧아 글자가 삐져나올 때만 막대 바깥으로 뺀다
       — 1차 시안에서 40·52주 막대 위로 "+4.87%" 가 흘러나왔다. */
    const fitsL = lw >= CUM_MIN, fitsR = rw >= CUM_MIN;
    texts.push({ cls: "st-cum", x: fitsL ? L0 - 14 : L0 - lw - 16, y: cy + 11,
                 text: `+${m.cum.toFixed(2)}%`, fill: fitsL && m.ongoing ? "#fff" : RED, anchor: "end" });
    texts.push({ cls: "st-cum", x: fitsR ? R0 + 14 : R0 + rw + 16, y: cy + 11,
                 text: `+${j.cum.toFixed(2)}%`, fill: fitsR && j.ongoing ? "#fff" : COBALT, anchor: "start" });
    /* 기간은 막대 아래 작은 글씨 — 막대 안에 넣으면 짧은 막대에서 삐져나온다 */
    texts.push({ cls: "st-sub", x: L0 - 4, y: y + BH + 26, text: span(m), fill: MUTE, anchor: "end" });
    texts.push({ cls: "st-sub", x: R0 + 4, y: y + BH + 26, text: span(j), fill: MUTE, anchor: "start" });
  }
  const H = TOP + 5 * ROW + 42;
  lines.push({ x1: CX, y1: 158, x2: CX, y2: H - 46, stroke: "rgba(20,24,33,0.10)", sw: 2 });
  return { vb: `0 0 1000 ${H}`, rects, texts, lines,
           wm: { x: 500, y: H - 4, size: 32, text: "@wirit_note", fill: INK, opacity: 0.13, anchor: "middle" } };
}

/* ── 시안 B: 좌우 2열 세로 막대 ─────────────────────────────────────────────── */
function variantB() {
  /* 칸 폭(STEP)은 가장 넓은 글자("135")가 들어갈 만큼 둔다 — 1차 시안에서 135·134 가 붙었다 */
  const PW = 448, LX = 28, RX = 1000 - 28 - PW;
  const BASE = 640, MAXH = 360, BW = 58, STEP = 86, PAD = 24;
  const h = (w) => Math.max(10, Math.round(w / MAXW * MAXH));
  const rects = [], texts = [], lines = [];

  const panel = (x0, rows, color, soft, name) => {
    texts.push({ cls: "st-pt", x: x0 + PW / 2, y: 62, text: name, fill: color, anchor: "middle" });
    texts.push({ cls: "st-ptsub", x: x0 + PW / 2, y: 100, text: "막대 = 연속 상승 주수", fill: MUTE, anchor: "middle" });
    lines.push({ x1: x0 + 8, y1: BASE, x2: x0 + PW - 8, y2: BASE, stroke: "rgba(20,24,33,0.14)", sw: 2 });
    rows.forEach((r, i) => {
      const bx = x0 + PAD + i * STEP, cxb = bx + BW / 2, bh = h(r.weeks), by = BASE - bh;
      rects.push({ x: bx, y: by, w: BW, h: bh, rx: 9, fill: r.ongoing ? color : soft });
      texts.push({ cls: r.ongoing ? "st-valb" : "st-val", x: cxb, y: by - 18,
                   text: `${r.weeks}`, fill: r.ongoing ? color : INK, anchor: "middle" });
      texts.push({ cls: "st-rank", x: cxb, y: BASE + 40, text: `${i + 1}위`, fill: r.ongoing ? color : INK, anchor: "middle" });
      texts.push({ cls: "st-sub", x: cxb, y: BASE + 72, text: r.startIso.slice(0, 4), fill: MUTE, anchor: "middle" });
      texts.push({ cls: "st-sub", x: cxb, y: BASE + 106, text: `+${r.cum.toFixed(1)}%`, fill: r.ongoing ? color : INK, anchor: "middle" });
    });
  };
  panel(LX, mae, RED, RED_SOFT, "매매");
  panel(RX, jeon, COBALT, COB_SOFT, "전세");
  lines.push({ x1: 500, y1: 48, x2: 500, y2: BASE + 118, stroke: "rgba(20,24,33,0.10)", sw: 2 });
  const H = BASE + 150;
  return { vb: `0 0 1000 ${H}`, rects, texts, lines,
           wm: { x: 500, y: 210, size: 36, text: "@wirit_note", fill: INK, opacity: 0.10, anchor: "middle" } };
}

/* ── 시안 C: 좌우 2열 가로 막대 랭킹 ────────────────────────────────────────── */
function variantC() {
  const PW = 452, LX = 32, RX = 1000 - 32 - PW;
  const BARX = 44, CUMW = 128;                 // 순위 열 폭 · 오른쪽 누적률 열 폭
  const BARMAX = PW - BARX - CUMW - 12;        // = 268. 막대가 누적률 열을 침범하지 않게 계산한다
  const BH = 58, ROW = 124, TOP = 152, VIN = 120;   // VIN: 주수를 막대 안에 넣는 최소 길이
  const len = (w) => Math.max(12, Math.round(w / MAXW * BARMAX));
  const rects = [], texts = [], lines = [];

  const panel = (x0, rows, color, soft, name) => {
    texts.push({ cls: "st-pt", x: x0, y: 62, text: name, fill: color, anchor: "start" });
    texts.push({ cls: "st-ptsub", x: x0 + PW, y: 62, text: "누적 상승률", fill: MUTE, anchor: "end" });
    lines.push({ x1: x0, y1: 88, x2: x0 + PW, y2: 88, stroke: "rgba(20,24,33,0.14)", sw: 2 });
    rows.forEach((r, i) => {
      const y = TOP + i * ROW, cy = y + BH / 2;
      const bx = x0 + BARX, bw = len(r.weeks);
      texts.push({ cls: "st-rank", x: x0, y: cy + 9, text: `${i + 1}`, fill: r.ongoing ? color : MUTE, anchor: "start" });
      rects.push({ x: bx, y, w: bw, h: BH, rx: 9, fill: r.ongoing ? color : soft });
      /* 주수는 막대 안 오른쪽 끝. 짧은 막대만 바깥으로 — 바깥에 두면 누적률 열과 부딪친다 */
      const inside = bw >= VIN;
      texts.push({ cls: r.ongoing ? "st-valb" : "st-val",
                   x: inside ? bx + bw - 14 : bx + bw + 12, y: cy + 12,
                   text: `${r.weeks}주`,
                   fill: inside ? (r.ongoing ? "#fff" : color) : (r.ongoing ? color : INK),
                   anchor: inside ? "end" : "start" });
      texts.push({ cls: "st-cum", x: x0 + PW, y: cy + 1, text: `+${r.cum.toFixed(2)}%`, fill: r.ongoing ? color : INK, anchor: "end" });
      texts.push({ cls: "st-sub", x: x0 + PW, y: cy + 31, text: span(r), fill: MUTE, anchor: "end" });
    });
  };
  panel(LX, mae, RED, RED_SOFT, "매매");
  panel(RX, jeon, COBALT, COB_SOFT, "전세");
  const H = TOP + 5 * ROW + 26;
  lines.push({ x1: 500, y1: 40, x2: 500, y2: H - 34, stroke: "rgba(20,24,33,0.10)", sw: 2 });
  return { vb: `0 0 1000 ${H}`, rects, texts, lines,
           wm: { x: 500, y: H - 2, size: 30, text: "@wirit_note", fill: INK, opacity: 0.13, anchor: "middle" } };
}

const VARIANTS = { a: variantA, b: variantB, c: variantC };
const argv = process.argv.slice(2);
const want = argv.filter((a) => /^[abc]$/.test(a));
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;
const picks = want.length ? want : ["a", "b", "c"];

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });

for (const v of picks) {
  const chart = VARIANTS[v]();
  const label = `streak-top5-${v}`;
  const card = {
    template: "streak-top5@1",
    date,
    badge: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
    title: TITLE,
    chart,
    note: NOTE,
    source: SOURCE,
  };
  writeFileSync(join(outDir, `${label}.json`), JSON.stringify(card, null, 2) + "\n");
  console.log(`${label} (streak-top5@1) — ${date} · 기준 ${asOfLabel}(${latestKey})`);
}
console.log(`   매매 TOP5 ${mae.map((r) => r.weeks).join("·")}주  (현재 ${maeNow}위)`);
console.log(`   전세 TOP5 ${jeon.map((r) => r.weeks).join("·")}주  (현재 ${jeonNow}위)`);
console.log(`   공유 축척 최장 ${MAXW}주`);
