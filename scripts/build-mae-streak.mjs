/**
 * 서울 아파트 주간 매매가격 누적 상승률 — 현재 국면 vs 역대 최장. streak-line@1.
 * 제목: "서울 아파트, 상승폭은 이미 文정부의 2배" ('文정부의 2배' 레드)
 * 부제: "최장 기간 연속 상승까지 단 N주 남았다" ('N주' 레드)
 *
 * ── 데이터: 원자료에서 코드가 계산한다 (오보 0)
 * data/datasets/reb-weekly-index.json (한국부동산원 R-ONE 주간 매매가격지수, Actions 수집)만 읽는다.
 * 서울 지수 계열에서 **전주比 상승이 이어진 구간(연속 상승 run)** 을 코드가 찾아
 *   · 현재 국면 = 마지막 주까지 이어진 run
 *   · 역대 최장 = 그 외 가장 긴 run
 * 을 고르고, 각 run 의 **주별 누적 상승률**(=지수/시작주지수−1) 곡선을 그린다.
 * 주수·누적률·남은 주(gap)·배수는 전부 여기서 계산한다 — 손으로 적은 숫자 0개.
 *
 * 실행: node scripts/build-mae-streak.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const sc = d.meta.seoulCode;
const series = d.mae?.[sc];
if (!series) throw new Error(`서울(${sc}) 매매 주간 계열이 없다 — reb-weekly-index.json 확인`);

const ks = Object.keys(series).sort();          // YYYYWW 정렬
const vals = ks.map((k) => series[k]);
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;

/* ── 시점 코드(YYYYWW) → 실제 날짜: 손으로 안 적는다(오보 0). 매주 자동으로 굴러간다 ──
 * WW = ISO 연차주. 그 주 월요일 = 부동산원 '기준일'(보도자료 "(m.d일 기준)"과 같은 날).
 * 202631 이 2026-07-27(월, ISO 31주)로 나오는 것을 오늘 날짜로 검증했다. */
const mondayOf = (key) => {
  const y = +key.slice(0, 4), w = +key.slice(4);
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  const mon = new Date(simple); mon.setUTCDate(simple.getUTCDate() - dow + 1);
  return mon;                                    // UTC 자정 기준 월요일
};
const ORD = ["", "첫", "둘", "셋", "넷", "다섯"];
const weekLabel = (key) => {                      // "2020.6 둘째주" (부동산원식 월-주차)
  const m = mondayOf(key);
  const wom = Math.floor((m.getUTCDate() - 1) / 7) + 1;
  return `${m.getUTCFullYear()}.${m.getUTCMonth() + 1} ${ORD[wom]}째주`;
};
const isoDate = (key) => mondayOf(key).toISOString().slice(0, 10);   // YYYY-MM-DD

/* 뱃지·저장 폴더 날짜 = **발행일(오늘 KST)** — '오늘의 주요 부동산 이슈' 뱃지 원칙(CEO 08-03).
 * 배포/주간 자동생산이 도는 날로 스탬프된다. 인자를 주면 그걸로 덮어쓴다(과거 발행분 재현용).
 * (데이터가 몇 주째인지는 weekLabel 로 범례에 따로 표기 — 뱃지 날짜와 무관.) */
const latestKey = d.meta.asOf || ks[ks.length - 1];
/* 신선도 경고(비차단) — 최신주가 오래 묵으면 수집이 밀린 것이다. 확정은 confirm.mjs 게이트가 막는다. */
{ const _age = Math.floor((Date.now() - mondayOf(latestKey).getTime()) / 86400000);
  if (_age > 10) console.warn(`⚠️  주간지수가 ${_age}일 묵었다(최신주 ${latestKey}) — 수집(reb-weekly-collect)이 밀렸는지 확인. 카드가 옛 주수로 나갈 수 있다.`); }
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[2] || kstToday;

/* ── 연속 상승 run 계산: 전주比 상승이 이어진 구간. base=첫 상승 직전(저점) ── */
const runs = [];
for (let i = 1; i < ks.length; ) {
  if (vals[i] > vals[i - 1]) {
    const base = i - 1; let j = i;
    while (j < ks.length && vals[j] > vals[j - 1]) j++;
    runs.push({ base, end: j - 1, weeks: (j - 1) - base });
    i = j + 1;
  } else i++;
}
const last = ks.length - 1;
const current = runs.find((r) => r.end === last);
if (!current) throw new Error("마지막 주까지 이어진 상승 구간이 없다 — 현재는 상승 국면이 아니다");
const record = runs.filter((r) => r !== current).sort((a, b) => b.weeks - a.weeks)[0];
if (!record) throw new Error("역대 최장 구간을 못 찾았다");

const cumAt = (r, k) => (vals[r.base + k] / vals[r.base] - 1) * 100;   // k=1..r.weeks (관측 개수 기준)

/* ── 연속 '주수'는 **달력 주**로 센다 (2026-09-07 교정) ───────────────────────
 * 부동산원은 설·추석 연휴 주에 주간조사를 쉰다 → 그 주는 계열에 아예 없다.
 * 관측 개수로 세면 쉰 주만큼 적게 나온다(2025 설 202505·추석 202541 누락 → 현재 국면 2주 과소).
 * 부동산원·언론이 말하는 "N주 연속"은 **첫 상승주 ~ 마지막주 달력 주수**다.
 * 실측(2026-09-07): 현재 관측83/달력85 · 역대최장 관측85/달력85 → 달력 기준이 보도값과 일치.
 * 곡선의 x 도 관측 순번이 아니라 달력 주 위치로 찍는다(쉰 주는 간격으로 드러난다 — 사실대로). */
const WEEK_MS = 7 * 864e5;
const calAt = (r, k) => Math.round((mondayOf(ks[r.base + k]) - mondayOf(ks[r.base + 1])) / WEEK_MS) + 1;
const calWeeks = (r) => calAt(r, r.weeks);
const curWeeks = calWeeks(current), recWeeks = calWeeks(record);

const curCum = r2(cumAt(current, current.weeks));
const recCum = r2(cumAt(record, record.weeks));
const gap = recWeeks - curWeeks;          // >0 남음 · 0 타이 · <0 신기록
const ratio = r1(curCum / recCum);
if (ratio < 1.9) throw new Error(`누적 배수 ${ratio} 가 2배 미만 — 제목을 고친다`);

/* ── 좌표 (뷰박스 1000×715 — 그래프 높이 살짝 축소) ── */
const RED = "#e5484d", SLATE = "#5b6b7f", INK = "#141821", MUTE = "#9aa3af";
const AXIS_X = 95, RIGHT = 915, TOP = 70, BASE = 650, VB_H = 715;
const WMAX = Math.max(curWeeks, recWeeks);
/* y축 상한은 데이터에 맞춰 여유를 둔다 — 끝점 값 라벨이 차트 위로 잘리지 않게(2026-09-07).
   16.94% 가 상한 17 에 닿아 '+16.94%' 윗변이 뷰박스 밖(-4px)으로 나갔다. 최소 1.5%p 헤드룸. */
const YMAX = Math.max(17, Math.ceil(Math.max(curCum, recCum) + 1.5));
const GRIDS = []; for (let g = 5; g < YMAX; g += 5) GRIDS.push(g);
const xw = (w) => r1(AXIS_X + ((w - 1) / (WMAX - 1)) * (RIGHT - AXIS_X));   // 1주차 = 좌축
const yp = (p) => r1(BASE - (p / YMAX) * (BASE - TOP));
const y0 = yp(0);

const curvePts = (r) => {
  const pts = [];
  for (let k = 1; k <= r.weeks; k++) pts.push(`${xw(calAt(r, k))},${yp(cumAt(r, k))}`);
  return pts;
};
const curCurve = curvePts(current), recCurve = curvePts(record);

const grid = GRIDS.map((p) => ({ x1: AXIS_X, x2: RIGHT, y: yp(p) }));
const ylabels = [0, ...GRIDS].map((p) => ({ x: AXIS_X - 16, y: yp(p) + 9, text: `${p}` }));
const yunit = { x: AXIS_X - 16, y: TOP - 8, text: "(%)" };

const areas = [
  { points: `${recCurve.join(" ")} ${xw(recWeeks)},${y0} ${xw(1)},${y0}`, fill: SLATE, opacity: 0.06 },
  { points: `${curCurve.join(" ")} ${xw(curWeeks)},${y0} ${xw(1)},${y0}`, fill: RED, opacity: 0.09 },
];
const polylines = [
  { points: recCurve.join(" "), color: SLATE, width: 7 },
  { points: curCurve.join(" "), color: RED, width: 8 },
];
const cx = xw(curWeeks), cy = yp(curCum), rx = xw(recWeeks), ry = yp(recCum);
const dots = [
  { x: rx, y: ry, color: SLATE, r: 15 },
  { x: cx, y: cy, color: RED, r: 16 },
];
const vmarks = [
  { x: rx, y1: ry, y2: y0, color: SLATE },
  { x: cx, y1: cy, y2: y0, color: RED },
];
/* 현재 끝점이 오른쪽 축 끝(타이·신기록)에 붙으면 가운데정렬 라벨이 카드 밖으로 잘린다.
   끝단이면 오른쪽 정렬로 눕힌다(2026-09-07 타이 국면에서 실제로 잘려 잡음). */
const curAtEdge = curWeeks >= WMAX;
const vlabels = [
  { x: curAtEdge ? cx - 10 : cx, y: cy - 36, text: `+${curCum.toFixed(2)}%`, fill: RED, anchor: curAtEdge ? "end" : "middle" },
  { x: rx - 16, y: ry - 26, text: `+${recCum.toFixed(2)}%`, fill: SLATE, anchor: "end" },
];
/* 타이(gap 0)면 두 끝점이 같은 x 라 라벨을 하나로 합친다 — 겹쳐 찍지 않는다. */
const xlabels = gap === 0
  ? [
      { x: AXIS_X, y: BASE + 46, text: "1주차", fill: MUTE, anchor: "start" }   /* y축 "0" 라벨과 겹침 방지(2026-09-07) */,
      { x: cx, y: BASE + 46, text: `${curWeeks}주`, fill: INK, anchor: "end" },
    ]
  : [
      { x: AXIS_X, y: BASE + 46, text: "1주차", fill: MUTE, anchor: "start" }   /* y축 "0" 라벨과 겹침 방지(2026-09-07) */,
      { x: cx, y: BASE + 46, text: `${curWeeks}주`, fill: RED, anchor: "end" },
      { x: rx, y: BASE + 46, text: `${recWeeks}주`, fill: SLATE, anchor: "start" },
    ];
/* 남은 주 화살표는 '아직 남았을 때'만 뜻이 있다. 타이·신기록이면 그리지 않는다. */
const ay = BASE - 26, midX = r1((cx + rx) / 2);
const arrow = gap > 0
  ? {
      x1: cx, x2: rx, y: ay, color: RED,
      heads: [
        { points: `${cx},${ay} ${cx + 15},${ay - 7} ${cx + 15},${ay + 7}`, fill: RED },
        { points: `${rx},${ay} ${rx - 15},${ay - 7} ${rx - 15},${ay + 7}`, fill: RED },
      ],
      lx: midX, ly: ay - 16, text: `${gap}주`,
    }
  : null;
/* 범례 기간 라벨도 원자료에서 계산한다(손으로 적지 않는다). 상승 시작주 = base 다음 주(첫 상승주). */
const curStart = weekLabel(ks[current.base + 1]);
const recStart = weekLabel(ks[record.base + 1]);
const recEnd = weekLabel(ks[record.end]);
const legend = [
  { sx1: 118, sx2: 196, sy: 120, color: RED, tx: 214, ty: 110, text: "현재 상승기", fill: INK, sub: `${curStart} ~ 진행 중`, sty: 156 },
  { sx1: 118, sx2: 196, sy: 210, color: SLATE, tx: 214, ty: 200, text: "역대 최장 (文정부)", fill: INK, sub: `${recStart} ~ ${recEnd}`, sty: 246 },
];
/* 그래프 뒤 옅은 '서울' 배경 워드마크 (공식 로고 파일이 없어 워드마크로 — 자산 있으면 교체) */
/* 그래프 뒤 서울시 공식 로고(자동 수집 자산)를 옅게 배경으로 — 텍스트 대체가 아니라 실제 자산 */
const seoulHref = "data:image/svg+xml;base64," + readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg")).toString("base64");
const LOGO_H = 300, LOGO_W = Math.round((LOGO_H * 306) / 329.88);
const bgImage = { href: seoulHref, x: Math.round(505 - LOGO_W / 2), y: 200, w: LOGO_W, h: LOGO_H, opacity: 0.08 };
/* 범례 아래 빈 공간에 계정 아이디 워터마크(BRAND §4b 슬롯 C — @wirit_note·잉크 옅게) */
const wm = { x: 150, y: 418, size: 40, text: "@wirit_note", fill: INK, opacity: 0.14, anchor: "start" };

const card = {
  template: "streak-line@1",
  date,
  badge: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
  title: `<span class="tl">서울 아파트 <span class="hi">${curWeeks}주 연속</span> 상승</span>` +
         `<span class="tl">이미 文정부의 <span class="hi">${ratio.toFixed(1)}배</span> 상승</span>`,
  chart: { vb: `0 0 1000 ${VB_H}`, bgImage, wm, base: { y: y0, x1: AXIS_X, x2: RIGHT }, grid, areas, ylabels, yunit, vmarks, polylines, dots, vlabels, xlabels, arrow, legend },
  /* 마무리 문구는 국면에 맞춘다(오보 0) — 남음 / 타이 / 신기록 */
  note: gap > 0 ? `역사상 최장 기간 연속 상승까지, 단 <b>${gap}주</b>`
       : gap === 0 ? `역사상 최장 기간 연속 상승과 <b>타이</b>`
       : `역사상 최장 기간 연속 상승을 <b>${-gap}주</b> 넘어섰다`,
  source: { name: "한국부동산원 주간 아파트가격동향" },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "mae-streak.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`mae-streak (streak-line, 실곡선) — 원자료 계산 · 기준일 ${date}(최신 주 ${latestKey})`);
console.log(`   현재 ${curWeeks}주(달력) · 관측 ${current.weeks}개(${ks[current.base]}~${ks[current.end]}) 누적 +${curCum}% · 시작 ${curStart}`);
console.log(`   역대 최장 ${recWeeks}주(달력) · 관측 ${record.weeks}개(${ks[record.base]}~${ks[record.end]}) 누적 +${recCum}%`);
console.log(`   gap ${gap}주 · 배수 ${ratio}배 · 곡선점 현재 ${curCurve.length}·역대 ${recCurve.length}`);
