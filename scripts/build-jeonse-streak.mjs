/**
 * 서울 아파트 매매·전세 **동반 78주 연속 상승** — 두 곡선을 나란히. streak-line@1.
 * 제목: "서울 아파트 매매도 전세도 / 나란히 78주 연속 상승" ('78주 연속' 레드)
 *
 * ── 데이터: 원자료에서 코드가 계산한다 (오보 0)
 * data/datasets/reb-weekly-index.json (부동산원 R-ONE 주간 매매·전세 지수)만 읽는다.
 * 서울 매매·전세 각 계열에서 **마지막 주까지 이어진 연속 상승 run**(전주比 상승)을 코드가 찾아
 * 두 국면의 **주별 누적 상승률** 곡선을 겹쳐 그린다. 주수·누적률·시작주는 전부 계산값 — 손으로 적은 숫자 0개.
 *
 * 실행: node scripts/build-jeonse-streak.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const SEOUL = d.meta.seoulCode;

const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;

/* 시점키(YYYYWW, ISO 연차주) → 그 주 월요일 = 부동산원 기준일 (매매 카드와 동일 규칙) */
const mondayOf = (key) => {
  const y = +key.slice(0, 4), w = +key.slice(4);
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  const mon = new Date(simple); mon.setUTCDate(simple.getUTCDate() - dow + 1);
  return mon;
};
const ORD = ["", "첫", "둘", "셋", "넷", "다섯"];
const weekLabel = (key) => {
  const m = mondayOf(key);
  const wom = Math.floor((m.getUTCDate() - 1) / 7) + 1;
  return `${m.getUTCFullYear()}.${m.getUTCMonth() + 1} ${ORD[wom]}째주`;
};
const isoDate = (key) => mondayOf(key).toISOString().slice(0, 10);

/* 각 계열의 '마지막 주까지 이어진 연속 상승 run' */
function currentRun(series) {
  const ks = Object.keys(series).sort();
  const v = ks.map((k) => series[k]);
  const runs = [];
  for (let i = 1; i < ks.length; ) {
    if (v[i] > v[i - 1]) { const base = i - 1; let j = i; while (j < ks.length && v[j] > v[j - 1]) j++; runs.push({ base, end: j - 1, weeks: (j - 1) - base }); i = j + 1; } else i++;
  }
  const last = ks.length - 1;
  const run = runs.find((r) => r.end === last);
  if (!run) throw new Error("마지막 주까지 이어진 상승 구간이 없다");
  const cumAt = (k) => (v[run.base + k] / v[run.base] - 1) * 100; // k=1..weeks
  return { ks, v, run, cumAt, cum: r2(cumAt(run.weeks)) };
}

const mae = currentRun(d.mae[SEOUL]);
const jeon = currentRun(d.jeonse[SEOUL]);
const N = mae.run.weeks;
if (jeon.run.weeks !== N) throw new Error(`매매(${N})·전세(${jeon.run.weeks}) 연속 주수가 달라 '동반' 프레임이 안 맞는다 — 제목을 바꾼다`);
const sameBottom = mae.ks[mae.run.base] === jeon.ks[jeon.run.base];
const startLabel = weekLabel(mae.ks[mae.run.base + 1]);
/* 뱃지·폴더 = 발행일(오늘, KST). '오늘의 이슈'라 데이터 기준일이 아니라 카드가 나가는 날짜를 쓴다.
   인자를 주면 그 날짜로 고정(재현/테스트용). 정기물이라 pixel-baselines 미등록 → 날짜 변동 OK. */
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[2] || kstToday;

/* ── 좌표 (매매 카드와 동일 규격 상속) ── */
const RED = "#e5484d", COBALT = "#2e6bff", INK = "#141821", MUTE = "#9aa3af";
const AXIS_X = 95, RIGHT = 915, TOP = 70, BASE = 650, VB_H = 715;
const WMAX = N, YMAX = 17;
const xw = (w) => r1(AXIS_X + ((w - 1) / (WMAX - 1)) * (RIGHT - AXIS_X));
const yp = (p) => r1(BASE - (p / YMAX) * (BASE - TOP));
const y0 = yp(0);

const curve = (o) => { const pts = []; for (let k = 1; k <= o.run.weeks; k++) pts.push(`${xw(k)},${yp(o.cumAt(k))}`); return pts; };
const maeCurve = curve(mae), jeonCurve = curve(jeon);

const grid = [5, 10, 15].map((p) => ({ x1: AXIS_X, x2: RIGHT, y: yp(p) }));
const ylabels = [0, 5, 10, 15].map((p) => ({ x: AXIS_X - 16, y: yp(p) + 9, text: `${p}` }));
const yunit = { x: AXIS_X - 16, y: TOP - 8, text: "(%)" };

const areas = [
  { points: `${jeonCurve.join(" ")} ${xw(N)},${y0} ${xw(1)},${y0}`, fill: COBALT, opacity: 0.07 },
  { points: `${maeCurve.join(" ")} ${xw(N)},${y0} ${xw(1)},${y0}`, fill: RED, opacity: 0.09 },
];
const polylines = [
  { points: jeonCurve.join(" "), color: COBALT, width: 7 },
  { points: maeCurve.join(" "), color: RED, width: 8 },
];
const ex = xw(N);
const mey = yp(mae.cum), jey = yp(jeon.cum);
const dots = [
  { x: ex, y: jey, color: COBALT, r: 16 },
  { x: ex, y: mey, color: RED, r: 17 },
];
/* 끝점에서 두 값의 격차를 점선으로 잇는다(매매−전세 갭 = 동반 상승 속 매매 우위) */
const vmarks = [
  { x: ex, y1: mey, y2: jey, color: MUTE },
];
/* 값은 범례가 든다 — 두 곡선이 같은 x 로 끝나 곡선 위엔 겹치지 않게 띄울 자리가 없다.
   (매매 카드 때 배운 것: 그래픽 위 라벨은 자리가 없으면 억지로 얹지 않는다) */
const vlabels = [];
const xlabels = [
  { x: AXIS_X, y: BASE + 46, text: "1주차", fill: MUTE, anchor: "middle" },
  { x: ex, y: BASE + 46, text: `${N}주`, fill: INK, anchor: "end" },
];
const legend = [
  { sx1: 118, sx2: 196, sy: 120, color: RED, tx: 214, ty: 110, text: `매매 +${mae.cum.toFixed(2)}%`, fill: INK, sub: `${startLabel} ~ 진행 중`, sty: 156 },
  { sx1: 118, sx2: 196, sy: 210, color: COBALT, tx: 214, ty: 200, text: `전세 +${jeon.cum.toFixed(2)}%`, fill: INK, sub: `${startLabel} ~ 진행 중`, sty: 246 },
];

/* 그래프 뒤 서울시 공식 로고(저장소 자산)를 옅게 배경으로 — 매매 카드와 동일 상속 */
const seoulHref = "data:image/svg+xml;base64," + readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg")).toString("base64");
const LOGO_H = 300, LOGO_W = Math.round((LOGO_H * 306) / 329.88);
const bgImage = { href: seoulHref, x: Math.round(505 - LOGO_W / 2), y: 200, w: LOGO_W, h: LOGO_H, opacity: 0.08 };
/* 그래픽 안 계정 워터마크(BRAND 슬롯 C) */
const wm = { x: 150, y: 418, size: 40, text: "@wirit_note", fill: INK, opacity: 0.14, anchor: "start" };

const card = {
  template: "streak-line@1",
  date,
  badge: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
  // 1째줄 = 리드(본줄의 절반·진회색·가운데, 서울 로고 얹음), 2째줄 = 본 제목(크게).
  titleLead: { text: "서울 아파트 매매도 전세도", logo: { href: seoulHref } },
  title: `<span class="tl">나란히 <span class="hi">${N}주 연속</span> 상승</span>`,
  chart: { vb: `0 0 1000 ${VB_H}`, bgImage, wm, base: { y: y0, x1: AXIS_X, x2: RIGHT }, grid, areas, ylabels, yunit, vmarks, polylines, dots, vlabels, xlabels, legend },
  note: `브레이크 없는 상승세, <b>언제까지</b> 지속될까요?`,
  source: { name: "한국부동산원 주간 아파트가격동향" },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "jeonse-streak.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`jeonse-streak (매매·전세 동반) — 원자료 계산 · 기준일 ${date}`);
console.log(`   매매 ${N}주 누적 +${mae.cum}% · 전세 ${N}주 누적 +${jeon.cum}% · 시작 ${startLabel} · 같은주바닥 ${sameBottom}`);
