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
const GOV = [
  { name: "노무현", photo: "roh-moohyun-face.png", start: "200301", end: "200802" },
  { name: "이명박", photo: "lee-myungbak-face.png", end: "201302" },
  { name: "박근혜", photo: "park-geunhye-face.png", end: "201703" },
  { name: "문재인", photo: "moon-jaein-face.png", end: "202205" },
  { name: "윤석열", photo: "yoon-sukyeol4-face.png", end: "202504" },
  { name: "이재명", photo: "lee-jaemyung-face.png", end: null }, // 재임 중 — 최신월까지
];

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
  rows.push({ ...g, start, end, months: n, delta, rate: delta / n, running: !g.end });
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
const INK = "#141821", RED = "#e5484d", GRAY = "#5b6b7f";
const VB_W = 1000, VB_H = 594;
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
  if (r.running) return { ...base, fill: "rgba(20,24,33,0.13)", stroke: INK, sw: 4, dash: "14 10" };
  return { ...base, fill: r.delta === maxDelta ? RED : INK };
});

/* 총액 라벨 — 막대 위 */
const values = rows.map((r, i) => ({
  x: cx(i), y: r1(BASE - hOf(r.delta) - 22), text: `${Math.round(r.delta).toLocaleString("ko-KR")}조`,
  fill: r.delta === maxDelta ? RED : INK,
}));

/* 월평균 뱃지 — 막대 안 위쪽(알약). 총액과 다른 채널이라 '최고 속도'를 따로 강조한다 */
const PILL_W = BAR_W, PILL_H = 42;
const rates = rows.map((r, i) => {
  const top = BASE - hOf(r.delta);
  return {
    x: r1(cx(i) - PILL_W / 2), y: r1(top + 16), w: PILL_W, h: PILL_H, r: PILL_H / 2,
    /* 레드 막대 위에서는 흰 반투명이 묻힌다 — 바탕색에 맞춰 알약 바탕을 고른다 */
    fill: r.rate === maxRate ? RED : r.delta === maxDelta ? "rgba(20,24,33,0.30)" : "rgba(255,255,255,0.16)",
    tx: cx(i), ty: r1(top + 16 + PILL_H / 2 + 8),
    text: `월 ${r1(r.rate).toFixed(1)}조`,
    tfill: "#ffffff",
  };
});

/* 꼬리표 — 재임 중인 칸에만. 12개월짜리 막대를 5년짜리와 나란히 두면 오독되기 쉽다 */
const tags = rows
  .map((r, i) => (r.running ? { x: cx(i), y: r1(BASE - hOf(r.delta) - 80), text: "재임 중", fill: GRAY } : null))
  .filter(Boolean);

const grid = [0.25, 0.5, 0.75, 1].map((f) => ({ x1: LEFT, x2: RIGHT, y: r1(BASE - (BASE - TOP) * f) }));

const ymLabel = (ym) => `${ym.slice(0, 4)}.${ym.slice(4)}`;
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[2] || kstToday;

const card = {
  template: "gov-bars@1",
  date,
  badge: `역대 정부 통화량 (${date.replace(/-/g, ".")})`,
  title: `역대 정부 <span class="hi">통화량 증가 규모</span>`,
  subtitle: `M2(광의통화) 개편 전 기준·${ymLabel(rows[0].start)}~${ymLabel(lastYm)}`,
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
    faces0: BASE,
  },
  faces: rows.map((r) => ({
    name: r.name,
    term: `${r.months}개월`,
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
    segments: rows.map((r) => ({ name: r.name, start: r.start, end: r.end, months: r.months, delta: r1(r.delta), rate: r1(r.rate) })),
    overlapCheckMaxDiff: r1(worst),
  },
};

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "m2-gov.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`m2-gov — 개편 전 기준(구 M2) · ${ymLabel(rows[0].start)}~${ymLabel(lastYm)} · 겹침대조 최대차 ${worst.toFixed(2)}조`);
for (const r of rows) {
  console.log(`  ${r.name}  ${ymLabel(r.start)}→${ymLabel(r.end)}  ${r.months}개월  ${Math.round(r.delta)}조  월 ${r1(r.rate).toFixed(1)}조${r.photo ? "" : "  (사진 없음)"}`);
}
console.log(`  합 ${Math.round(sum)}조 = 전체 ${Math.round(whole)}조`);
