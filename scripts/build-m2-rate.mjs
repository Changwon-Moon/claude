/**
 * 통화량(M2) 증가율 추이 — `year-bars@2`.
 * 제목: "통화량 증가율 12.3% — 4년 만의 최고" (오너 확정 2026-09-01)
 *
 * ── 왜 **각 해 6월** 기준인가  ★이 카드에서 가장 조심한 곳
 * 최신 자료가 2026년 6월이다. 다른 해를 12월로 재고 마지막 해만 6월로 재면 **자가 섞인다**.
 * 게다가 12월 기준으로 재면 2021년(+13.2%)이 지금(+12.3%)보다 높아, 카드 안에
 * "최고"라는 제목보다 **더 높은 막대**가 서게 된다 — 같은 카드가 자기 모순이 된다
 * (CARD_CHECKLIST 「제목이 데이터와 모순되면 제목을 고친다」).
 * 그래서 **모든 막대를 그 해 6월의 전년동월비**로 통일하고, 그 사실을 상단 캡션에 밝힌다.
 *
 * ── "N년 만의 최고"는 계산이 확인했을 때만 나간다
 * 월별 전년동월비 전 계열에서 **지금보다 높았던 마지막 달**을 찾아 거리를 잰다.
 * 손으로 적으면 다음 달 자료에서 조용히 거짓이 된다(CLAUDE.md §8).
 * 표시된 막대 중 최신이 최고가 아니면 던진다 — 그림과 제목이 어긋나는 것을 코드가 막는다.
 *
 * ── 데이터: `scripts/lib/m2.mjs` 의 개편 전 기준(구 M2)만 쓴다. 손으로 적은 숫자 0개.
 *
 * 실행: node scripts/build-m2-rate.mjs [YYYY-MM-DD] [--publish]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadM2, ymLabel, yoy, jo, r1, shownJo } from "./lib/m2.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { M2, NEW, months, lastYm, worst } = loadM2();

const lastMo = lastYm.slice(4);                 // 최신 자료의 '월' — 모든 막대가 이 달로 통일된다
const lastYear = +lastYm.slice(0, 4);
const BARS = 11;                                // 검증된 칸 수(wolse-flip 과 같다). 더 늘리면 값 라벨이 뭉친다
const firstYear = lastYear - (BARS - 1);

const rows = [];
for (let y = firstYear; y <= lastYear; y++) {
  const ym = `${y}${lastMo}`;
  const v = ym in M2 ? yoy(M2, ym) : null;
  if (v == null) throw new Error(`${ym} 의 전년동월비를 못 구한다 — 창을 좁힌다`);
  rows.push({ y, ym, v: r1(v) });
}
const cur = rows[rows.length - 1];

/* 그림과 제목이 어긋나지 않게 — 표시되는 막대 중 최신이 최고여야 한다 */
const tallest = rows.reduce((a, b) => (b.v > a.v ? b : a));
if (tallest !== cur) throw new Error(`표시 구간 최고는 ${tallest.y}년(${tallest.v}%)이고 최신은 ${cur.v}% — 제목을 고친다`);
if (rows.some((r) => r.v < 0)) throw new Error("음(-)의 증가율이 있다 — 0선 배치를 다시 잡는다");

/* "N년 만의 최고" — 월별 전 계열에서 지금 이상이었던 **마지막 달**까지의 거리 */
const mIdx = (m) => +m.slice(0, 4) * 12 + +m.slice(4);
const higher = months
  .filter((m) => m < lastYm && yoy(M2, m) != null && yoy(M2, m) >= cur.v)
  .pop();
if (!higher) throw new Error("전 계열에서 지금보다 높았던 달이 없다 — '역대 최고'로 제목을 바꾼다");
const sinceMonths = mIdx(lastYm) - mIdx(higher);
const sinceYears = Math.floor(sinceMonths / 12);
if (sinceYears < 1) throw new Error(`직전 고점이 ${sinceMonths}개월 전 — "N년 만의 최고"라 쓸 수 없다`);

/* ── 막대 높이 (플롯 높이 대비 %) ──
   전부 오름이라 0선은 바닥에 붙는다. 바닥에 딱 붙이면 최저 막대가 축에 눌려 보여
   아주 얇은 아래 여백만 남긴다. */
const maxUp = Math.max(...rows.map((r) => r.v));
const HEADROOM = 1.12;                          // 가장 높은 막대 위 값 라벨 한 줄 자리
const spanUp = maxUp * HEADROOM;
const spanDown = maxUp * 0.02;
const total = spanUp + spanDown;
const zeroAt = (spanUp / total) * 100;
const pctOf = (v) => `${((Math.abs(v) / total) * 100).toFixed(2)}%`;

/* 값 라벨은 **부호+숫자만**(단위 %는 상단 캡션에). "%"를 붙이면 라벨이 칸보다 넓어져 옆 칸과 겹친다. */
const bare = (v) => `+${v.toFixed(1)}`;

const points = rows.map((r) => ({
  year: String(r.y),
  value: bare(r.v),
  dir: "up",
  h: pctOf(r.v),
  totalH: pctOf(r.v),
  /* 강조는 한 곳 — 최고 연도(=최신) 하나. 지금이 그 해라 초점이 갈리지 않는다. */
  ...(r === cur ? { peak: true } : {}),
}));

/* ── 좌상단 강조 카드는 **쓰지 않는다** (2026-09-01 실측) ──
   처음엔 잔액·연간 증가액 두 장을 좌상단에 뒀는데, 판형의 `.yc-side` 는 플롯 폭의 68% 를
   정사각 두 장으로 채운다(각 308px). 그 아래로 2020(+9.9)·2021(+10.9) 막대가 올라와
   **값 라벨이 카드 글자와 겹쳤다** — designQa 가 `textclip` error 2건으로 막았다.
   자리를 비틀어 피하는 대신 **뺐다**: 잔액은 다른 카드(m2-trend)가 말하고,
   이 카드는 증가율 하나만 또렷하게 말한다(CARD_CHECKLIST 「카드는 한 가지만」).
   빈 좌상단은 판형이 이미 가진 장식 곡선(`arrow`)이 채운다 — 막대 뒤 레이어라 데이터를 안 덮는다. */
const yearAgo = `${lastYear - 1}${lastMo}`;
const addend = M2[lastYm] - M2[yearAgo];

const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;

const card = {
  template: "year-bars@2",
  date,
  /* 상단 캡션은 **제목이 말하지 않는 것**만 — 여기선 '무엇을 어떻게 쟀나'(측정 정의)다.
     이게 없으면 12.3% 가 연간인지 전년동월비인지 알 수 없다. */
  subtitle: `M2 개편 전 기준 · 각 해 ${+lastMo}월 전년동월비(%)`,
  title: `통화량 증가율 <span class="hi">${cur.v.toFixed(1)}%</span> — ${sinceYears}년 만의 최고`,
  zeroAt: `${zeroAt.toFixed(2)}%`,
  points,
  arrow: true,
  source: { name: "한국은행 ECOS(M2 평잔·원계열, 개편 전 기준)", asOf: ymLabel(lastYm) },
  meta: {
    verified: true,
    provenance: "ECOS 161Y006 BBHA16([참고] 구 M2) + 101Y004 접합",
    basis: `각 해 ${+lastMo}월의 전년동월비. 12월 기준으로 재면 2021년이 더 높아 제목과 그림이 어긋난다`,
    current: { ym: lastYm, yoy: cur.v, level: shownJo(M2[lastYm]), yearAdd: shownJo(addend) },
    /* 같은 달을 **개편 후 기준**으로 재면 얼마인가 — 캡션이 반드시 함께 말해야 하는 숫자다.
       한쪽 자만 보여 주면 "12.3%"가 현행 공식 통계인 것처럼 읽힌다. */
    currentNewBasis: (() => {
      const p = `${lastYear - 1}${lastMo}`;
      return lastYm in NEW && p in NEW ? { yoy: r1((NEW[lastYm] / NEW[p] - 1) * 100), level: shownJo(NEW[lastYm]) } : null;
    })(),
    low: (() => { const m = rows.reduce((a, b) => (b.v < a.v ? b : a)); return { ym: m.ym, yoy: m.v }; })(),
    prevHigher: { ym: higher, yoy: r1(yoy(M2, higher)), sinceMonths },
    series: rows.map((r) => ({ ym: r.ym, yoy: r.v })),
    overlapCheckMaxDiff: r1(worst),
  },
};

const PUBLISH = process.argv.includes("--publish");
const outDir = PUBLISH ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "m2-rate.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`m2-rate — 각 해 ${+lastMo}월 전년동월비 · ${firstYear}~${lastYear} (${BARS}칸)`);
console.log(`   현재 ${ymLabel(lastYm)} +${cur.v}% · 직전에 이보다 높았던 달 ${ymLabel(higher)}(+${r1(yoy(M2, higher))}%) → ${sinceMonths}개월 전 = ${sinceYears}년 만의 최고`);
console.log(`   막대: ${rows.map((r) => `${r.y} ${r.v}`).join(" · ")}`);
console.log(`   → ${join(outDir, "m2-rate.json")}`);
