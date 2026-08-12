/**
 * 역대 정부 통화량(M2) 증가 규모 — `gov-bars@1`.
 *
 * ── 데이터: 원자료에서 코드가 계산한다 (오보 0)
 * `data/datasets/m2-monthly.json` 만 읽는다(한국은행 ECOS OpenAPI 수집분).
 * 손으로 적은 숫자 0개 — 증가폭·월평균·개월수·막대 높이가 전부 계산값이다.
 *
 * ── 왜 "개편 전 기준(구 M2)" 인가  ★이 카드의 핵심 판단
 * 한국은행이 2025-12-30 통화지표를 개편해 **수익증권(펀드·ETF)을 M2 에서 뺐다**(약 -400조).
 * 신 기준으로 역대 정부를 재면 **현 정부 구간만 유독 작아진다** — 자를 바꿔 놓고 키를 비교하는 꼴이다.
 * ECOS 는 같은 통계표에 `[참고] 구 M2(평잔·원계열)` 를 함께 싣고 신·구를 1년간 병행 발표한다.
 * 그래서 이 카드는 **전 구간을 개편 전 기준으로 통일**한다(2026-08-12 오너 지시).
 *
 * ── 왜 두 계열을 잇나
 * 개편 전 계열(BBHA16)은 2003-10 부터라 노무현 정부 취임 직전월(2003-01)이 없다.
 * 그 앞은 구지표 표(`101Y004`, 1986-01~2004-09)에 있고, **겹치는 달의 값이 소수점까지 같다**
 * (200310·200312·200409 실측 차이 0.0). 값이 같으니 잇는 것은 해석이 아니라 확인이다 —
 * 이 스크립트는 겹치는 달을 **매번 다시 대조하고, 다르면 던진다.**
 *
 * ── 구간 정의 (오너 확정 2026-08-12)
 * 각 정부 = **전임 정부 퇴임월 → 자기 퇴임월**(첫 정부는 취임 직전월부터).
 * 겹침이 없어 막대를 다 더하면 전체 증가와 정확히 맞는다. 권한대행 기간은 후임 정부에 포함된다.
 *
 * 실행: node scripts/build-m2-gov.mjs [YYYY-MM-DD]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = JSON.parse(readFileSync(join(ROOT, "data/datasets/m2-monthly.json"), "utf8"));

const r1 = (v) => Math.round(v * 10) / 10;

/* ── 계열 두 벌 → 조원 맵 ── */
if (!raw.legacyM2) throw new Error("m2-monthly.json 에 legacyM2([참고] 구 M2)가 없다 — ECOS 수집을 먼저 돌린다");
const OLD = Object.fromEntries(raw.legacyM2.series.map((r) => [r.ym, r.value / 1000]));
const PRE_SRC = raw.others?.["101Y004"];
if (!PRE_SRC) throw new Error("m2-monthly.json 에 구지표 표(101Y004)가 없다");
const PRE = Object.fromEntries(PRE_SRC.series.map((r) => [r.ym, r.value / 1000]));

/* 겹치는 달을 매번 대조한다 — 같아야만 잇는다 */
const overlap = Object.keys(PRE).filter((k) => k in OLD);
if (overlap.length < 3) throw new Error(`두 계열이 겹치는 달이 ${overlap.length}개뿐 — 이어 붙일 근거가 없다`);
const worst = Math.max(...overlap.map((k) => Math.abs(PRE[k] - OLD[k])));
if (worst > 0.05) throw new Error(`겹치는 달의 값이 다르다(최대 ${worst.toFixed(2)}조) — 접합 불가`);
const M2 = { ...PRE, ...OLD };

/* ── 정부 구간 ──
   퇴임월은 사실이고(취임·퇴임일), 시작월은 위의 규칙이 정한다. */
/* `end` = 데이터 구간의 끝(월). `from`/`to` = **실제 취임·퇴임일**.
   ── 왜 둘을 나누나 (기획팀 지적 2026-08-12)
   얼굴 아래 붙은 "N개월"을 독자는 무조건 **재임 기간**으로 읽는다. 그런데 데이터 구간은
   월 단위로 끊여 실제 재임과 최대 2개월까지 어긋난다(문재인 데이터 62개월 vs 실제 60개월).
   그대로 두면 **인쇄된 오보**다. 그래서 라벨은 취임·퇴임일에서 계산하고,
   월평균은 종전대로 데이터 구간으로 나눈다 — 각자 자기 자를 쓴다. */
const GOV = [
  { name: "노무현", photo: "roh-moohyun-face.png", start: "200301", end: "200802", from: "2003-02-25", to: "2008-02-24" },
  { name: "이명박", photo: "lee-myungbak-face.png", end: "201302", from: "2008-02-25", to: "2013-02-24" },
  { name: "박근혜", photo: "park-geunhye-face.png", end: "201703", from: "2013-02-25", to: "2017-03-10" }, // 탄핵 파면
  { name: "문재인", photo: "moon-jaein-face.png", end: "202205", from: "2017-05-10", to: "2022-05-09" },
  { name: "윤석열", photo: "yoon-sukyeol4-face.png", end: "202504", from: "2022-05-10", to: "2025-04-04" }, // 탄핵 파면
  { name: "이재명", photo: "lee-jaemyung-face.png", end: null, from: "2025-06-04", to: null }, // 재임 중 — 최신월 말까지
];

/** 두 날짜 사이 개월(평균 월 길이로 환산 후 반올림). 취임·퇴임일이 월 중순이라 달력 차이는 애매하다 */
const monthsBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000 / 30.4375);

const months = Object.keys(M2).sort();
const lastYm = months[months.length - 1];

const rows = [];
for (let i = 0; i < GOV.length; i++) {
  const g = GOV[i];
  const start = g.start ?? GOV[i - 1].end;
  const end = g.end ?? lastYm;
  if (!(start in M2)) throw new Error(`${g.name}: 시작월 ${start} 값이 없다`);
  if (!(end in M2)) throw new Error(`${g.name}: 끝월 ${end} 값이 없다`);
  const n = (+end.slice(0, 4) * 12 + +end.slice(4)) - (+start.slice(0, 4) * 12 + +start.slice(4));
  const delta = M2[end] - M2[start];
  /* 재임 개월 — 재임 중이면 데이터 최신월의 **말일**까지 센다 */
  const endDate = g.to ?? new Date(Date.UTC(+end.slice(0, 4), +end.slice(4), 0)).toISOString().slice(0, 10);
  const termMonths = monthsBetween(g.from, endDate);
  rows.push({ ...g, start, end, months: n, termMonths, delta, rate: delta / n, running: !g.end });
}

/* 합이 전체와 맞는지 — 구간 정의가 어긋나면 여기서 드러난다 */
const sum = rows.reduce((a, r) => a + r.delta, 0);
const whole = M2[rows[rows.length - 1].end] - M2[rows[0].start];
if (Math.abs(sum - whole) > 0.5) throw new Error(`막대 합(${sum.toFixed(0)})과 전체 증가(${whole.toFixed(0)})가 다르다 — 구간에 겹침/공백이 있다`);

/* 사진은 `scripts/normalize-portraits.py` 가 **얼굴 크기를 재서** 같은 틀(480×640)로 맞춘
   `-face.png` 를 쓴다. 원본을 그대로 걸면 화각이 달라 얼굴 크기가 두 배까지 벌어진다
   (오너 지적 2026-08-12). 저장소에 실제로 있는 것만 건다 — 없으면 이름만 나간다. */
for (const r of rows) {
  if (r.photo && !existsSync(join(ROOT, "templates/_shared/photos", r.photo))) r.photo = null;
}

const maxDelta = Math.max(...rows.map((r) => r.delta));
const maxRate = Math.max(...rows.map((r) => r.rate));

/* ── 좌표 ──
   막대는 전부 플러스라 0선 위아래가 없다. 바닥선 하나에 세운다. */
const INK = "#141821", RED = "#e5484d", COBALT = "#2e6bff", GRAY = "#5b6b7f";
const VB_W = 1000, VB_H = 652;
/* 좌우 여백을 0 으로 둔다 — SVG 안쪽에 여백을 주면 **자가 두 개**가 된다.
   막대는 (여백 뺀 폭)을 6등분하는데 아래 인물 축은 카드 폭을 6등분하므로
   양끝 칸에서 인물이 자기 막대 아래에 안 선다(디자인팀 실측 ±22.9px, 2026-08-12).
   플롯의 좌우 끝 = 카드 패딩선 = 제목·푸터와 같은 선. */
const LEFT = 0, RIGHT = VB_W, BASE = VB_H - 6, TOP = 80;
const N = rows.length;
const slot = (RIGHT - LEFT) / N;
const BAR_W = Math.round(slot * 0.68);
const cx = (i) => r1(LEFT + slot * (i + 0.5));

/* 최대 막대가 플롯 높이를 다 쓰게 — 눈금이 없는 카드라 절대 높이는 뜻이 없고 비율만 뜻이 있다 */
const hOf = (d) => r1(((BASE - TOP) * d) / maxDelta);

/* 재임 중인 정부의 막대는 **점선 테두리 + 옅은 칠**로 그린다 (오너 지시 2026-08-12).
   13개월짜리 구간을 5년짜리와 나란히 꽉 찬 막대로 세우면 "임기 다 채우고 저만큼"으로 읽힌다.
   아직 안 끝났다는 사실을 글자('재임 중')만이 아니라 **모양으로도** 말한다 —
   그래픽만 잘라 써도 경고가 살아 있어야 한다(year-bars 의 추정 구간에서 배운 규칙). */
const bars = rows.map((r, i) => {
  const h = hOf(r.delta);
  const base = { x: r1(cx(i) - BAR_W / 2), y: r1(BASE - h), w: BAR_W, h };
  /* 색이 뜻을 하나씩만 갖게 나눈다(오너 지시 2026-08-12).
     레드 = 현 정부 · 코발트 = 최대 총액(문재인) · 잉크 = 나머지.
     현 정부 막대는 **아직 안 끝난 값**이라 채도를 낮춰 옅게 칠하고 점선 테두리를 남긴다 —
     같은 레드라도 '확정된 값'과 '진행 중인 값'이 같은 무게로 보이면 안 된다. */
  if (r.running) return { ...base, fill: "rgba(229,72,77,0.42)", stroke: RED, sw: 4, dash: "14 10" };
  if (r.delta === maxDelta) return { ...base, fill: COBALT };
  return { ...base, fill: INK };
});

/* ── 무엇을 크게 보여줄 것인가 (오너 지시 2026-08-12)
   **월평균 증가액이 더 중요한 지표다.** 임기 길이가 제각각(12~62개월)이라 총액만 나란히 두면
   오래 재임한 정부가 자동으로 커 보인다. 그래서 **막대 위 큰 숫자 = 월평균**,
   총 증가액은 막대 안으로 넣는다. (막대 높이는 그대로 총액 — 규모 자체도 사실이므로 버리지 않는다) */
const values = rows.map((r, i) => ({
  x: cx(i), y: r1(BASE - hOf(r.delta) - 22), text: `월 ${r1(r.rate).toFixed(1)}조`,
  fill: r.rate === maxRate ? RED : r.delta === maxDelta ? COBALT : INK,
}));

/* 총 증가액 — 막대 안 위쪽(알약). 막대 높이가 뜻하는 바로 그 값이라 막대 안에 두는 게 맞다. */
const PILL_W = BAR_W, PILL_H = 42;
const rates = rows.map((r, i) => {
  const top = BASE - hOf(r.delta);
  return {
    x: r1(cx(i) - PILL_W / 2), y: r1(top + 16), w: PILL_W, h: PILL_H, r: PILL_H / 2,
    /* 레드 막대 위에서는 흰 반투명이 묻히고, 점선(옅은) 막대 위에서는 흰 글자가 사라진다 —
       바탕에 맞춰 알약 바탕을 고른다. 강조는 채널마다 한 곳: 위 숫자=최고 속도, 알약=최대 총액. */
    fill: r.running ? "rgba(143,31,35,0.72)" : "rgba(255,255,255,0.16)",
    tx: cx(i), ty: r1(top + 16 + PILL_H / 2 + 8),
    text: `${Math.round(r.delta).toLocaleString("ko-KR")}조`,
    tfill: "#ffffff",
  };
});

/* "재임 중" 꼬리표는 뺐다(오너 지시 2026-08-12) — 점선 테두리 + 아래 뱃지 + "재임 12개월"이
   같은 말을 세 번 하고 있었다. 한 가지는 한 번만 말한다. */
const tags = [];

const ymLabel = (ym) => `${ym.slice(0, 4)}.${ym.slice(4)}`;

const runIdx = rows.findIndex((r) => r.running);
/* ── 재임 중인 칸 **위 빈 공간**의 뱃지 (오너 지시 2026-08-12)
   최신월 한 달 증가를 3줄 카드로 세운다. 이 카드의 배수가 이 한 달에 크게 기대므로
   숨기지 않고 앞세운다 — 271개월 중 한 달 증가폭 1위다. 수치는 계산값.
   글자가 카드 밖으로 나가지 않게 **자리를 빌더가 잰다**: SVG 안 글자는 designQa 넘침 검사 밖이다. */
const lastDelta = M2[lastYm] - M2[months[months.indexOf(lastYm) - 1]];
const prevMax = Math.max(
  ...months.slice(1, months.length - 1).map((m, i) => M2[m] - M2[months[i]]),
);
const BD_FS = 25, BD_LH = 34, BD_PADX = 16, BD_PADY = 18;
/* 줄마다 색이 다르다 — 첫 줄(언제)은 잉크, 아래 두 줄(무엇)은 레드.
   전부 레드로 두면 어디가 핵심인지 안 갈린다(오너 지시 2026-08-12). */
const bdLines = runIdx >= 0
  ? [
      { t: `'${lastYm.slice(2, 4)}.${lastYm.slice(4)} 한 달`, fill: INK },
      { t: `+${r1(lastDelta).toFixed(1)}조 증가`, fill: RED },
      { t: lastDelta >= prevMax ? "(역대 최고)" : "(최근 최고)", fill: RED },
    ]
  : [];
const bdW = Math.round(Math.max(...bdLines.map((l) => l.t.length * BD_FS * 0.58), 0)) + BD_PADX * 2;
const bdH = BD_LH * bdLines.length + BD_PADY * 2 - 8;
const badges = runIdx >= 0
  ? (() => {
      const wantX = cx(runIdx) - bdW / 2;
      const x = r1(Math.min(Math.max(wantX, 4), VB_W - 4 - bdW));
      /* 뱃지는 **막대 위 월평균 라벨보다 더 위**에 둔다.
         34px 만 띄웠더니 옆 칸(윤석열)의 월평균 글자와 겹쳤다 — 두 막대 높이가 거의 같아서다.
         라벨 자리(22 + 글자 37) + 숨(17) 을 합쳐 76px 을 비운다. */
      const y = r1(BASE - hOf(rows[runIdx].delta) - 76 - bdH);
      return [{
        x, y, w: bdW, h: bdH, r: 16, sw: 3,
        tx: r1(x + bdW / 2), ty: r1(y + BD_PADY + BD_FS - 4), lh: BD_LH,
        lines: bdLines,
      }];
    })()
  : [];

/* ── 플롯 좌상단 빈 공간: **지금 얼마나 풀려 있나** (오너 지시 2026-08-12)
   막대는 '정부별로 얼마나 늘었나'만 말한다. 그 늘어난 돈이 쌓인 **현재 총량**은 다른 축이라
   막대로 그리면 안 되고(높이가 통째로 달라진다), 빈 자리에 글자로 둔다.
   기준은 카드 전체와 같은 개편 전 계열(구 M2). 값은 원자료의 최신월. */
const level = {
  x: 8,
  y: r1(TOP - 4),
  lh: 46,
  lines: [
    { t: `${ymLabel(lastYm)} 현재`, fill: GRAY, size: 26, weight: 800 },
    { t: `M2 ${Math.round(M2[lastYm]).toLocaleString("ko-KR")}조`, fill: INK, size: 44, weight: 900 },
  ],
};

const grid = [0.25, 0.5, 0.75, 1].map((f) => ({ x1: LEFT, x2: RIGHT, y: r1(BASE - (BASE - TOP) * f) }));

const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[2] || kstToday;

const card = {
  template: "gov-bars@1",
  date,
  /* 상단 캡션 = 이 카드의 **기준**. 날짜를 적던 자리인데, 이 소재는 "어느 M2 냐"가 숫자의 뜻을 바꾼다(오너 지시). */
  badge: `M2(광의통화) 개편 전 기준·${ymLabel(rows[0].start)}~${ymLabel(lastYm)}`,
  title: `역대 정부 <span class="hi">통화량 증가 규모</span>`,
  axisCount: N,
  axisGap: "0px", // 막대 칸과 같은 자를 쓴다(gap 을 주면 인물이 막대에서 밀린다)
  chart: {
    vb: `0 0 ${VB_W} ${VB_H}`,
    baseline: { y: BASE, x1: LEFT, x2: RIGHT },
    grid,
    bars,
    values,
    rates,
    tags,
    badges,
    level,
    faces0: BASE,
  },
  faces: rows.map((r) => ({
    name: r.name,
    term: `재임 ${r.termMonths}개월`, // "재임"을 붙여 데이터 구간이 아니라 임기임을 못박는다
    photo: r.photo ?? undefined,
    hot: r.rate === maxRate,
  })),
  /* 하단 문구 — 배수는 계산값이다(손으로 적지 않는다). 오너 확정 문안(2026-08-12).
     ".0" 은 떼고 적는다 — "2.0배"는 소수 자리가 뜻을 갖는 것처럼 읽힌다. */
  note: `현 정부 통화량 증가속도는 문 정부 대비 <b>${(maxRate / rows.find((r) => r.name === "문재인").rate).toFixed(1).replace(/\.0$/, "")}배 속도</b>`,
  source: { name: "한국은행 ECOS(M2 평잔·원계열, 개편 전 기준)", asOf: ymLabel(lastYm) },
  meta: {
    verified: true,
    provenance: `${raw.meta.provenance} + ${raw.legacyM2.itemCode}(${raw.legacyM2.itemName}) + 101Y004`,
    basis: "개편 전 기준(구 M2). 2025-12-30 한국은행 통화지표 개편으로 수익증권 제외 — 신 기준은 현 정부 구간만 축소되어 역대 비교가 어긋난다",
    segments: rows.map((r) => ({ name: r.name, start: r.start, end: r.end, months: r.months, termMonths: r.termMonths, delta: r1(r.delta), rate: r1(r.rate) })),
    /* 최신월 한 달 증가 — 이 카드의 배수가 이 달에 크게 기댄다는 사실을 데이터로 남긴다(오너 인지 2026-08-12) */
    lastMonthDelta: r1(M2[lastYm] - M2[months[months.indexOf(lastYm) - 1]]),
    overlapCheckMaxDiff: r1(worst),
  },
};

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "m2-gov.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`m2-gov — 개편 전 기준(구 M2) · ${ymLabel(rows[0].start)}~${ymLabel(lastYm)} · 겹침대조 최대차 ${worst.toFixed(2)}조`);
for (const r of rows) {
  console.log(`  ${r.name}  ${ymLabel(r.start)}→${ymLabel(r.end)}  데이터 ${r.months}개월 / 재임 ${r.termMonths}개월  ${Math.round(r.delta)}조  월 ${r1(r.rate).toFixed(1)}조${r.photo ? "" : "  (사진 없음)"}`);
}
console.log(`  합 ${Math.round(sum)}조 = 전체 ${Math.round(whole)}조`);
