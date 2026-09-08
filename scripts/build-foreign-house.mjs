/**
 * 국적별 외국인 집주인 추이 — `streak-line@1`.
 * 「중국 vs 미국 두 선 + 그 밖의 모든 나라 한 선」, 2022년 하반기 ~ 최신 반기 (오너 확정 2026-09-08).
 *
 * ── 이 카드가 말하는 것
 * 외국인이 가진 집이 몇 채인지가 아니라, **늘어난 몫이 어느 국적으로 갔는지**다.
 * 원본 소재(다른 계정 카드)는 '지금 순위'만 보여 줬다. 순위는 3년 내내 안 바뀌었으므로
 * 새로 말할 것이 있으려면 시간축이 필요하다 — 그게 오너가 이 카드를 고른 이유다.
 *
 * ── 숫자는 전부 데이터에서 나온다 (오보 0)
 * `data/datasets/foreign-house-nat.json` ← KOSIS 한국부동산원 원자료를 수집기가 집계
 * (공동주택 DT_408004_007 + 단독주택 DT_408004_008, 총괄 DT_408004_001 과 대조).
 * 손으로 적은 숫자는 **하나도 없다**. 제목의 「3분의 2」도 계산이 확인한 뒤에만 나간다.
 *
 * ── ⚠️ 「그 밖의 모든 나라」의 정의 — 총계 − 중국 − 미국
 * 국적별 표를 다 더하면 총계보다 조금 크다(2025년 하반기 +261호). 국적이 다른 사람들이
 * 한 집을 공동소유하면 국적마다 한 번씩 세어지기 때문이다. 그대로 쓰면 **카드 위의 세 값이
 * 총계와 안 맞는데**, 독자가 카드에서 직접 더해 볼 수 있는 그림이라 그건 오보로 읽힌다.
 * → 세 값이 반드시 총계가 되도록 나머지를 **뺄셈으로** 정의하고, 그 사실을 캡션이 밝힌다.
 *
 * ── 색 (BRAND 「코발트 1개 축」의 판형 내 예외 — streak-line 이 이미 연 문)
 * 중국 = 레드(이 카드의 주인공) · 미국 = 코발트 · 나머지 = 회색.
 * 미국과 나머지는 값이 2만대에서 붙어 다녀 **두 회색으로 두면 한 선처럼 보인다**(실측).
 * 그래서 두 색으로 갈랐다.
 *
 * ── 끝값을 곡선 옆에 안 쓰는 이유
 * 미국(23,187)과 나머지(23,605)의 끝점이 3px 안에서 만난다. 라벨을 곡선 옆에 세우면
 * 두 글자가 겹치는데 **SVG 안 글자는 designQa 검사 밖**이라 통과된 채 나간다.
 * 그래서 값은 그래프 아래 표(scen)에서 한 번만 말한다(m2-gap 이 같은 이유로 정한 자리).
 *
 * 실행: node scripts/build-foreign-house.mjs [YYYY-MM-DD] [--publish]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INK = "#141821", RED = "#e5484d", COBALT = "#2e6bff", MUTE = "#9aa3af";
const r1 = (n) => Math.round(n * 10) / 10;
const comma = (n) => n.toLocaleString("ko-KR");
/** 24719 → "2만 4,719" · 9000 → "9,000" (만 단위가 있을 때만 쪼갠다) */
const man = (n) => (n >= 10000 ? `${Math.floor(n / 10000)}만 ${comma(n % 10000).padStart(1, "0")}` : comma(n));

/* ── 자료 ───────────────────────────────────────────────────────────── */
const DS = join(ROOT, "data/datasets/foreign-house-nat.json");
const data = JSON.parse(readFileSync(DS, "utf8"));
if (!data.meta?.verified) throw new Error("foreign-house-nat.json 이 verified 가 아니다 — 검증 전 자료로 카드를 만들지 않는다");
if (data.meta.unit !== "호") throw new Error(`단위가 '호' 가 아니다: ${data.meta.unit}`);

const series = data.series;
if (!Array.isArray(series) || series.length < 4) throw new Error(`시점이 ${series?.length}개뿐 — 추이 카드를 만들 수 없다`);

/* 세 계열을 만든다. 나머지는 뺄셈(머리말 참고) — 세 값의 합이 반드시 총계가 된다. */
const pts = series.map((s) => {
  const cn = s.nat["중국"]?.houses, us = s.nat["미국"]?.houses;
  if (!Number.isFinite(cn) || !Number.isFinite(us)) throw new Error(`${s.prdDe}: 중국·미국 값이 없다`);
  const etc = s.totalHouses - cn - us;
  if (etc <= 0) throw new Error(`${s.prdDe}: 나머지가 ${etc} 다 — 총계·국적 값을 다시 본다`);
  if (cn + us + etc !== s.totalHouses) throw new Error(`${s.prdDe}: 세 값의 합이 총계와 다르다`);
  return { ...s, cn, us, etc };
});
const A = pts[0], Z = pts[pts.length - 1];

/* ── 문구가 되는 사실들은 전부 여기서 '확인'된다 ── */
/* ① 중국이 내내 1위였나 — 아니면 제목의 전제가 깨진다 */
for (const p of pts) {
  const top = Object.entries(p.nat).sort((a, b) => b[1].houses - a[1].houses)[0][0];
  if (top !== "중국") throw new Error(`${p.prdDe} 1위가 중국이 아니라 ${top} 다 — 제목을 다시 짠다`);
}
/* ② 총계가 내내 늘었나 — '늘어간다'는 말의 근거 */
for (let i = 1; i < pts.length; i++) {
  if (pts[i].totalHouses <= pts[i - 1].totalHouses) throw new Error(`${pts[i].prdDe} 에서 총계가 안 늘었다 — '계속 는다'를 못 쓴다`);
}

const addTotal = Z.totalHouses - A.totalHouses;
const addCn = Z.cn - A.cn, addUs = Z.us - A.us, addEtc = Z.etc - A.etc;
if (addCn + addUs + addEtc !== addTotal) throw new Error("증가분 세 조각의 합이 총 증가분과 다르다");
const shareCn = addCn / addTotal;

/* ③ 「3분의 2」는 계산이 허락할 때만 쓴다. 다음 공표에서 어긋나면 여기서 멈춘다. */
const THIRDS = [0.63, 0.70];
if (shareCn < THIRDS[0] || shareCn > THIRDS[1]) {
  throw new Error(`중국 몫이 ${(shareCn * 100).toFixed(1)}% 라 '3분의 2'가 아니다 — 제목 문구를 고친다`);
}

const yrs = (Z.year + (Z.half === 2 ? 1 : 0.5)) - (A.year + (A.half === 2 ? 1 : 0.5));
const spanText = `${yrs % 1 === 0 ? yrs : r1(yrs)}년`;
const pct = (a, b) => ((b / a - 1) * 100);

/* ── 좌표 (뷰박스 1000×720) ──────────────────────────────────────────
   그래프 아래 표(scen)가 3줄이라 그만큼 자리를 내준다. 처음 560 으로 잡았더니
   제목과 그래프 사이가 통째로 비어 카드가 헐거워 보였다(첫 렌더 실측) — 그 빈칸을 그래프가 먹는다. */
const AXIS_X = 178, RIGHT = 915, TOP = 44, BASE = 600, VB_H = 680;
const YMAX = 65000;
if (Z.cn > YMAX) throw new Error(`중국 ${comma(Z.cn)}호 가 Y축 상한 ${comma(YMAX)}호를 넘었다 — 눈금을 올린다`);

const N = pts.length;
const xi = (i) => r1(AXIS_X + (i / (N - 1)) * (RIGHT - AXIS_X));
const yv = (v) => r1(BASE - (v / YMAX) * (BASE - TOP));
const lineOf = (pick) => pts.map((p, i) => `${xi(i)},${yv(pick(p))}`).join(" ");

const grid = [20000, 40000, 60000].map((v) => ({ x1: AXIS_X, x2: RIGHT, y: yv(v) }));
const ylabels = [0, 20000, 40000, 60000].map((v) => ({
  x: AXIS_X - 18, y: yv(v) + 11, text: v === 0 ? "0" : `${v / 10000}만`,
}));

/* 칠하지 않는다. 처음엔 중국 곡선 아래를 옅은 레드로 깔았는데, 미국·나머지 두 곡선이
   **그 칠 안쪽에** 놓여 두 색이 분홍 바탕 위에서 흐려졌다(첫 렌더 실측). 칠이 말해 주는 것보다
   빼앗는 것이 컸다 — 이 카드는 면적이 아니라 세 선의 벌어짐을 말한다. */
const cnPts = lineOf((p) => p.cn);
const areas = [];

/* ⚠️ 미국(23,187)과 나머지(23,605)는 끝에서 418호 차이라 화면에서 3px 안에 만난다.
   위에 그리는 쪽이 아래를 덮으므로 **끝에서 실제로 위에 있는 계열을 나중에** 그린다.
   (2025년 상반기에 나머지가 미국을 앞질렀다 — 그 교차가 보이려면 순서가 맞아야 한다) */
const usAbove = Z.us > Z.etc;
const usLine = { points: lineOf((p) => p.us), color: COBALT, width: 7 };
const etcLine = { points: lineOf((p) => p.etc), color: MUTE, width: 7 };
const polylines = [
  ...(usAbove ? [etcLine, usLine] : [usLine, etcLine]),
  { points: cnPts, color: RED, width: 9 },   // 주인공을 맨 위 레이어에
];
const usDot = { x: xi(N - 1), y: yv(Z.us), color: COBALT, r: 13 };
const etcDot = { x: xi(N - 1), y: yv(Z.etc), color: MUTE, r: 13 };
const dots = [
  ...(usAbove ? [etcDot, usDot] : [usDot, etcDot]),
  { x: xi(N - 1), y: yv(Z.cn), color: RED, r: 16 },
];
const vlabels = [];   // 끝값은 아래 표가 말한다(머리말 참고)

/* X 눈금 — 연말(하반기) 시점만. 반기 7개를 다 적으면 글자가 서로 붙는다(실측). */
const xlabels = pts
  .map((p, i) => ({ p, i }))
  .filter(({ p }) => p.half === 2)
  .map(({ p, i }) => ({
    x: xi(i), y: BASE + 46,
    text: `${String(p.year).slice(2)}년 말`,
    fill: i === N - 1 ? INK : MUTE,
    anchor: i === N - 1 ? "end" : i === 0 ? "start" : "middle",
    size: 38,
  }));
if (xlabels.length < 3) throw new Error(`연말 눈금이 ${xlabels.length}개뿐 — 가로축이 안 읽힌다`);

/* 워터마크는 곡선이 아직 낮은 좌상단. 중국 곡선의 첫 점보다 위에 둔다(데이터 위에 안 얹는다). */
const wmY = r1(yv(A.cn) - 46);
if (wmY < TOP + 20) throw new Error("좌상단에 워터마크 자리가 없다");
const wm = { x: AXIS_X + 24, y: wmY, size: 38, text: "@wirit_note", fill: INK, opacity: 0.13, anchor: "start" };

/* ── 그래프 아래 표 — 색·이름·증가율·최신값 ── */
const scen = [
  { color: RED, name: "중국", rate: `${spanText} +${pct(A.cn, Z.cn).toFixed(1)}%`, value: `${comma(Z.cn)}호` },
  { color: COBALT, name: "미국", rate: `${spanText} +${pct(A.us, Z.us).toFixed(1)}%`, value: `${comma(Z.us)}호` },
  { color: MUTE, name: "그 밖의 모든 나라", rate: `${spanText} +${pct(A.etc, Z.etc).toFixed(1)}%`, value: `${comma(Z.etc)}호` },
];

const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;

const card = {
  template: "streak-line@1",
  date,
  /* 한 줄을 넘으면 우상단 로고 뱃지와 부딪힌다(첫 렌더에서 「단위/호」로 접혀 부딪혔다).
     기간은 푸터가 이미 말하므로 여기선 무엇을 세는지만 적는다. */
  badge: `외국인이 가진 국내 주택 · 반기 · 단위 호`,
  /* 윗줄은 회색으로 물리고 숫자만 잉크로, 아랫줄이 선다(streak-line 두 줄 제목 규격). */
  title:
    `<span class="tl tg">${spanText} 새 늘어난 외국인 집 <span class="ti">${man(addTotal)}호</span></span>` +
    `<span class="tl">그중 <span class="hi">3분의 2가 중국</span></span>`,
  chart: {
    vb: `0 0 1000 ${VB_H}`,
    wm,
    base: { y: yv(0), x1: AXIS_X, x2: RIGHT },
    grid, areas, ylabels, polylines, dots, vlabels, xlabels,
  },
  scen,
  source: { name: "한국부동산원 외국인주택소유통계(KOSIS)", asOf: Z.label },
  meta: {
    verified: true,
    provenance: data.meta.source,
    basis:
      "주택수 = 공동주택 + 단독주택. 「그 밖의 모든 나라」는 총계 − 중국 − 미국 으로 계산했다 — " +
      "국적별 표를 그대로 더하면 국적이 다른 사람들의 공동소유가 국적마다 세어져 총계보다 커진다",
    window: { from: A.prdDe, to: Z.prdDe, periods: N, years: r1(yrs) },
    latest: { total: Z.totalHouses, china: Z.cn, usa: Z.us, etc: Z.etc, owners: Z.totalOwners },
    first: { total: A.totalHouses, china: A.cn, usa: A.us, etc: A.etc },
    added: { total: addTotal, china: addCn, usa: addUs, etc: addEtc },
    chinaShareOfGrowth: r1(shareCn * 100),
    growthPct: { china: r1(pct(A.cn, Z.cn)), usa: r1(pct(A.us, Z.us)), etc: r1(pct(A.etc, Z.etc)), total: r1(pct(A.totalHouses, Z.totalHouses)) },
    dupHouses: Z.dupHouses,
    /* 캡션은 이 값만 쓴다 — meta 를 다시 반올림하면 카드와 어긋난다 */
    shown: { addTotal: man(addTotal), china: comma(Z.cn), usa: comma(Z.us), etc: comma(Z.etc), total: comma(Z.totalHouses) },
  },
};

const PUBLISH = process.argv.includes("--publish");
const outDir = PUBLISH ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "foreign-house.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

/* ── 캡션 초안 — 숫자는 위에서 계산한 것만 쓴다(옮겨 적지 않는다) ── */
const capPath = writeCaption("foreign-house", [
  `한국 집을 사는 외국인, 어느 나라 사람이 늘었을까요 🏠`,
  ``,
  `${Z.label}(${Z.asOf}) 기준 외국인이 가진 국내 주택은 ${comma(Z.totalHouses)}호입니다.`,
  `${A.label} ${comma(A.totalHouses)}호에서 ${spanText} 동안 ${man(addTotal)}호 늘었습니다.`,
  ``,
  `📊 늘어난 ${man(addTotal)}호를 국적으로 나눠 보면`,
  `· 중국 +${comma(addCn)}호 (늘어난 몫의 ${(shareCn * 100).toFixed(0)}%)`,
  `· 미국 +${comma(addUs)}호`,
  `· 그 밖의 모든 나라 +${comma(addEtc)}호`,
  ``,
  `지금 보유량은 중국 ${comma(Z.cn)}호, 미국 ${comma(Z.us)}호,`,
  `그 밖의 모든 나라를 합쳐 ${comma(Z.etc)}호입니다.`,
  ``,
  `${spanText}간 늘어난 비율로 보면 중국 +${pct(A.cn, Z.cn).toFixed(1)}%,`,
  `미국 +${pct(A.us, Z.us).toFixed(1)}%, 그 밖의 나라 +${pct(A.etc, Z.etc).toFixed(1)}% 입니다.`,
  ``,
  `👉 순위는 3년 내내 그대로였지만, 벌어진 폭은 그대로가 아니었습니다.`,
  ``,
  `📌 저장해두고 반기마다 확인하기`,
  ``,
  `—`,
  `📊 출처 : 한국부동산원 외국인주택소유통계 (KOSIS)`,
  `📅 기준 : ${A.label} ~ ${Z.label} (반기 ${N}개 시점)`,
  `※ 주택수는 공동주택과 단독주택을 합한 값입니다.`,
  `※ 「그 밖의 모든 나라」는 전체에서 중국과 미국을 뺀 값입니다.`,
  `   국적별 표를 그대로 더하면 국적이 다른 사람끼리의 공동소유가`,
  `   국적마다 한 번씩 세어져 전체보다 ${comma(Z.dupHouses)}호 많아집니다.`,
  ``,
  `#외국인부동산 #외국인주택 #부동산통계 #주택소유 #부동산데이터`,
].join("\n"));

console.log(`foreign-house — ${A.label} ~ ${Z.label} (${N}개 시점)`);
console.log(`   총계 ${comma(A.totalHouses)} → ${comma(Z.totalHouses)}호 (+${comma(addTotal)})`);
console.log(`   중국 ${comma(A.cn)} → ${comma(Z.cn)} (+${comma(addCn)}, 증가분의 ${(shareCn * 100).toFixed(1)}%)`);
console.log(`   미국 ${comma(A.us)} → ${comma(Z.us)} (+${comma(addUs)})`);
console.log(`   나머지 ${comma(A.etc)} → ${comma(Z.etc)} (+${comma(addEtc)})`);
console.log(`   → ${join(outDir, "foreign-house.json")}`);
console.log(`   → ${capPath}`);
