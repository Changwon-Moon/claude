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
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { makeRebCalendar } from "./lib/reb-week.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const sc = d.meta.seoulCode;
const series = d.mae?.[sc];
if (!series) throw new Error(`서울(${sc}) 매매 주간 계열이 없다 — reb-weekly-index.json 확인`);

const ks = Object.keys(series).sort();          // YYYYWW 정렬
const vals = ks.map((k) => series[k]);
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;

/* ── 시점 코드(YYYYWW) → 실제 날짜: 손으로 안 적는다(오보 0) ─────────────────────
 * 부동산원 주차는 ISO 연차주가 아니다(2026-10-04 교정). 환산 규칙과 체크포인트는
 * scripts/lib/reb-week.mjs 한 곳이 정본 — 여기서 다시 계산하지 않는다. */
const cal = makeRebCalendar(ks);
const mondayOf = (key) => cal.monday(key);
const weekLabel = (key) => cal.label(key);        // "2020.6 둘째주" (부동산원식 월-주차)
const isoDate = (key) => cal.iso(key);            // YYYY-MM-DD

/* 뱃지·저장 폴더 날짜 = **발행일(오늘 KST)** — '오늘의 주요 부동산 이슈' 뱃지 원칙(CEO 08-03).
 * 배포/주간 자동생산이 도는 날로 스탬프된다. 인자를 주면 그걸로 덮어쓴다(과거 발행분 재현용).
 * (데이터가 몇 주째인지는 weekLabel 로 범례에 따로 표기 — 뱃지 날짜와 무관.) */
const latestKey = d.meta.asOf || ks[ks.length - 1];
/* 신선도 경고(비차단) — 최신주가 오래 묵으면 수집이 밀린 것이다. 확정은 confirm.mjs 게이트가 막는다. */
{ const _age = Math.floor((Date.now() - mondayOf(latestKey).getTime()) / 86400000);
  if (_age > 10) console.warn(`⚠️  주간지수가 ${_age}일 묵었다(최신주 ${latestKey}) — 수집(reb-weekly-collect)이 밀렸는지 확인. 카드가 옛 주수로 나갈 수 있다.`); }
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[2] || kstToday;

/* ── 연속 상승 run 계산 — **부동산원 발표 기준**으로 센다 (2026-09-24 교정) ──────────
 * 부동산원이 공표하는 주간 변동률은 소수 둘째 자리다. 지수 원값이 +0.0036% 처럼 미세하게
 * 올라도 **발표는 0.00% = 보합**이고, 보합은 '연속 상승'을 끊는다.
 * 지수 레벨로 v[i] > v[i-1] 만 보면 그 보합 주까지 상승으로 세어 주수가 과다계상된다
 * — 2026-09-18 카드가 87주로 나갔는데 발표값은 84주였다(3주 초과). 그 원인이 이것이다.
 * 검증(2026-09-24): 이 방식이면 역대 최장이 85주 · 2020.6 둘째주~2022.1 셋째주 · 누적 +7.71%
 * 로 나와 보도값과 주수·기간·누적률이 **동시에** 맞는다. */
const pubRate = (i) => Math.round(((vals[i] / vals[i - 1] - 1) * 100) * 100) / 100;   // 발표 형식(소수 둘째)
const runs = [];
for (let i = 1; i < ks.length; ) {
  if (pubRate(i) > 0) {
    const base = i - 1; let j = i;
    while (j < ks.length && pubRate(j) > 0) j++;
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

/* 연속 '주수' = **발표 건수(관측 개수)**. 달력 주수로 세던 2026-09-07 방식은 오판이었다 —
   설·추석 미조사 주를 채워 넣어 보도값보다 많아졌다. 부동산원은 발표한 주만 센다. */
const curWeeks = current.weeks, recWeeks = record.weeks;

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
  for (let k = 1; k <= r.weeks; k++) pts.push(`${xw(k)},${yp(cumAt(r, k))}`);
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
/* 두 끝점의 x 가 가까우면(타이·신기록·박빙) 주수 라벨이 겹치거나 오른쪽으로 잘린다.
   실측 2026-09-18: 87주 vs 85주 = 19px 차 → 겹침 + '85주'가 축 밖으로 잘림.
   가까우면 현재 주수 하나로 합친다 — 역대 최장 값은 범례와 마무리 문구가 이미 들고 있다. */
const X_LABEL_MIN_GAP = 170;
const xOrigin = { x: AXIS_X, y: BASE + 46, text: "1주차", fill: MUTE, anchor: "start" };   /* y축 "0" 라벨과 겹침 방지(2026-09-07) */
const xlabels = Math.abs(cx - rx) < X_LABEL_MIN_GAP
  ? [xOrigin, { x: cx, y: BASE + 46, text: `${curWeeks}주`, fill: gap === 0 ? INK : RED, anchor: "end" }]
  : [
      xOrigin,
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
  { sx1: 118, sx2: 196, sy: 210, color: SLATE, tx: 214, ty: 200, text: `역대 최장 ${recWeeks}주 (文정부)`, fill: INK, sub: `${recStart} ~ ${recEnd}`, sty: 246 },
];
/* 그래프 뒤 옅은 '서울' 배경 워드마크 (공식 로고 파일이 없어 워드마크로 — 자산 있으면 교체) */
/* 그래프 뒤 서울시 공식 로고(자동 수집 자산)를 옅게 배경으로 — 텍스트 대체가 아니라 실제 자산 */
const seoulHref = "data:image/svg+xml;base64," + readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg")).toString("base64");
const LOGO_H = 300, LOGO_W = Math.round((LOGO_H * 306) / 329.88);
const bgImage = { href: seoulHref, x: Math.round(505 - LOGO_W / 2), y: 200, w: LOGO_W, h: LOGO_H, opacity: 0.08 };
/* 범례 아래 빈 공간에 계정 아이디 워터마크(BRAND §4b 슬롯 C — @wirit_note·잉크 옅게) */
const wm = { x: 150, y: 418, size: 40, text: "@wirit_note", fill: INK, opacity: 0.14, anchor: "start" };

/* ── 대통령 얼굴(연하게) — 오너 지시 2026-10-09 ─────────────────────────────────
 * 현재 상승기(빨강) 누적률 라벨 아래 = 이재명 · 역대 최장(회색) 라벨 아래 회색 영역 안 = 문재인.
 * 자리는 **눈대중이 아니라 계산**한다. 데이터가 한 주만 바뀌어도 곡선이 움직이고,
 * 손으로 박은 좌표는 그 순간 얼굴이 선을 가르거나 숫자를 덮는다.
 *   이재명: 빨강 곡선 **아래** · 회색 곡선 **위** (빨강만 칠해진 띠 안)
 *   문재인: 회색 곡선 **아래** · 0선 **위** (회색 칠 안)
 * 두 원 모두 누적률 라벨·범례·세로 점선·서울 로고·워터마크와 겹치지 않게 고른다.
 * ⚠️ 문재인 얼굴은 '역대 최장 85주' 구간(2020.6~2022.1)이 文정부 임기 안이라 사실과 맞는다.
 *    이재명 얼굴은 현재 상승기에 얹지만, 이 구간은 **2025.2 시작**이라 출범(2025.6)보다 넉 달 이르다 —
 *    범례의 시작 주가 그 사실을 그대로 보여 준다(숨기지 않는다). */
const photoUri = (file) => {
  const p = join(ROOT, "templates/_shared/photos", file);
  return existsSync(p) ? "data:image/png;base64," + readFileSync(p).toString("base64") : null;
};
const toPts = (arr) => arr.map((s) => s.split(",").map(Number));
const interp = (pts) => (x) => {
  if (x < pts[0][0] || x > pts[pts.length - 1][0]) return null;
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) { const [x0, y0_] = pts[i - 1], [x1, y1] = pts[i]; return y0_ + (y1 - y0_) * ((x - x0) / (x1 - x0 || 1)); }
  }
  return pts[pts.length - 1][1];
};
const yRed = interp(toPts(curCurve)), yGray = interp(toPts(recCurve));
const VL_W = (t) => t.length * 0.62 * 54, VL_ASC = 44, VL_DESC = 10;   // .sl-vl 54px 근사
const boxOfVL = (v) => {
  const w = VL_W(v.text), x0 = v.anchor === "end" ? v.x - w : v.anchor === "middle" ? v.x - w / 2 : v.x;
  return { x0, x1: x0 + w, y0: v.y - VL_ASC, y1: v.y + VL_DESC };
};
const OBST = [
  ...vlabels.map(boxOfVL),
  { x0: 100, x1: 760, y0: 70, y1: 268 },                                                      // 범례 두 줄
  { x0: bgImage.x, x1: bgImage.x + bgImage.w, y0: bgImage.y, y1: bgImage.y + bgImage.h },     // 서울 로고
  { x0: wm.x - 6, x1: wm.x + 330, y0: wm.y - 40, y1: wm.y + 8 },                               // @wirit_note
];
const hitsBox = (fx, fy, R, b, m) => {
  const nx = Math.max(b.x0, Math.min(fx, b.x1)), ny = Math.max(b.y0, Math.min(fy, b.y1));
  return (fx - nx) ** 2 + (fy - ny) ** 2 < (R + m) ** 2;
};
/** 띠 안에 들어가는 가장 큰 원을 찾는다. upper/lower = 원 위·아래 경계 함수(x→y) */
function fitCircle({ upper, lower, prefX, xMax, avoid = [], Rmax = 132, Rmin = 56, M = 14 }) {
  let best = null;
  for (let R = Rmax; R >= Rmin; R -= 4) {
    for (let fx = AXIS_X + R + M; fx <= xMax - R; fx += 6) {
      for (let fy = TOP + R; fy <= y0 - R; fy += 6) {
        let ok = true;
        for (let sx = fx - R; sx <= fx + R && ok; sx += 6) {
          const half = Math.sqrt(Math.max(0, R * R - (sx - fx) ** 2));
          const up = upper(sx), lo = lower(sx);
          if (up == null || lo == null) { ok = false; break; }
          if (fy - half < up + M || fy + half > lo - M) ok = false;
        }
        if (!ok) continue;
        if ([...OBST, ...avoid].some((b) => hitsBox(fx, fy, R, b, M))) continue;
        const score = -Math.abs(fx - prefX) - fy * 0.15;          // 라벨 바로 아래 · 가능한 한 위쪽
        if (!best || score > best.score) best = { fx, fy, R, score };
      }
    }
    if (best) return best;   // 가장 큰 R 에서 찾았으면 거기서 멈춘다
  }
  return null;
}
const vlCur = boxOfVL(vlabels[0]), vlRec = boxOfVL(vlabels[1]);
const markX = Math.min(cx, rx) - 8;                                   // 세로 점선 왼쪽까지만
const leeFit = fitCircle({ upper: yRed, lower: yGray, prefX: (vlCur.x0 + vlCur.x1) / 2, xMax: markX });
/* 두 얼굴은 **같은 크기**로 — 크기가 다르면 한쪽을 강조하는 것처럼 읽힌다.
 * 빨강 띠가 더 좁아서(곡선과 +7.71% 라벨 사이) 이재명 쪽 최대 크기에 문재인을 맞춘다. */
const moonArgs = {
  upper: yGray, lower: () => y0, prefX: (vlRec.x0 + vlRec.x1) / 2, xMax: markX,
  avoid: leeFit ? [{ x0: leeFit.fx - leeFit.R, x1: leeFit.fx + leeFit.R, y0: leeFit.fy - leeFit.R, y1: leeFit.fy + leeFit.R }] : [],
};
const moonFit = (leeFit && fitCircle({ ...moonArgs, Rmax: leeFit.R, Rmin: leeFit.R })) || fitCircle(moonArgs);
const FACE_OPACITY = 0.2;
const faces = [];
for (const [fit, file, id, who] of [[leeFit, "lee-jaemyung-face.png", "faceLee", "이재명"], [moonFit, "moon-jaein-face.png", "faceMoon", "문재인"]]) {
  const href = photoUri(file);
  if (!fit || !href) { console.warn(`⚠️  ${who} 얼굴 자리를 못 찾았다(또는 사진 없음) — 얼굴 없이 그린다`); continue; }
  faces.push({ id, cx: fit.fx, cy: fit.fy, r: fit.R, href, x: fit.fx - fit.R, y: fit.fy - fit.R, w: fit.R * 2, h: fit.R * 2, opacity: FACE_OPACITY });
}

const card = {
  template: "streak-line@1",
  date,
  badge: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
  title: `<span class="tl"><img class="tlogo" src="${seoulHref}" alt="" />서울 아파트 <span class="hi">${curWeeks}주 연속</span> 상승</span>` +
         `<span class="tl">이미 文정부의 <span class="hi">${ratio.toFixed(1)}배</span> 상승</span>`,
  chart: { vb: `0 0 1000 ${VB_H}`, bgImage, wm, base: { y: y0, x1: AXIS_X, x2: RIGHT }, grid, areas, faces, ylabels, yunit, vmarks, polylines, dots, vlabels, xlabels, arrow, legend },
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
console.log(`   현재 ${curWeeks}주(발표 기준) · 관측 ${current.weeks}건(${ks[current.base]}~${ks[current.end]}) 누적 +${curCum}% · 시작 ${curStart}`);
console.log(`   역대 최장 ${recWeeks}주(발표 기준) · 관측 ${record.weeks}건(${ks[record.base]}~${ks[record.end]}) 누적 +${recCum}%`);
console.log(`   gap ${gap}주 · 배수 ${ratio}배 · 곡선점 현재 ${curCurve.length}·역대 ${recCurve.length}`);
