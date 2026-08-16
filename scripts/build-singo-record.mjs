/**
 * 「오늘의 신고가」 단지 한 곳 카드 빌더 — singo-record@1
 *
 *   node scripts/build-singo-record.mjs --apt "상록마을(라이프2차)" --type 84 [--date 2026-08-13] [--publish]
 *
 * ── 읽는 것 (전부 코드가 받아 둔 1차 자료)
 * · `data/datasets/singo-log/{YYYY-MM}.json`      — 그 거래의 판정 결과(직전 최고가·갱신폭·돌파선)
 * · `data/datasets/singo-history/{구}-{단지}-{타입}.json` — 월별 최고가 곡선
 *
 * ── 이 파일이 지키는 것
 * ① **수치를 여기서 만들지 않는다.** 전부 위 두 파일에서 읽어 계산만 한다.
 * ② **"역대"라고 쓰지 않는다.** 기준선은 2020-01 이후다 — 문구는 데이터의 `from` 에서 뽑는다.
 * ③ 곡선의 x 는 **달을 균등하게** 놓는다. 거래가 있던 달만 촘촘히 놓으면 2년 공백이 사라져
 *    "쉬지 않고 올랐다"는 그림이 된다.
 * ④ 수집을 못 한 달(ok=false)이 사이에 있으면 **선을 끊는다.** 이어 버리면 모르는 구간을
 *    아는 것처럼 그리게 된다.
 * ⑤ SVG 안 글자는 디자인 검수가 재지 못한다(designQa 는 Range 로 재는데 SVG text 는 대상이
 *    아니다). 그래서 라벨이 판을 넘지 않는지 **여기서 계산해 확인하고, 넘으면 던진다.**
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const flag = (n) => process.argv.includes(`--${n}`);

/* ── 이름 정규화 — 수집기(parse/singo.ts)의 fullAptName 과 같은 규칙이어야 한다.
      괄호 안까지 살린다: 상록마을(라이프2차) → 상록마을라이프2차 */
const full = (s) =>
  String(s ?? "")
    .replace(/[()[\]]/g, "")
    .replace(/[\s·.\-_,]/g, "")
    .trim();

const eok = (manwon) => {
  const v = manwon / 10000;
  return `${v.toFixed(2).replace(/\.?0+$/, "")}억`;
};

const APT = arg("apt");
const TYPE = arg("type") ?? "84";
if (!APT) {
  console.error('사용법: node scripts/build-singo-record.mjs --apt "상록마을(라이프2차)" --type 84');
  process.exit(1);
}
const DATE = arg("date") ?? new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

/* ── 단지 개요를 실을 때 쓰는 대장 열쇠 (--kapt A46378521)
   ⚠️ 이름으로 자동 매칭하지 않는다. 그러다 `상록마을(라이프2차)` 가 남의 단지
      `정자상록마을우성(1,762세대)` 에 붙어 세대수가 그대로 알림에 나갔다(2026-08-13).
      대장 항목은 **사람이 짚어 준 kaptCode 로만** 물린다 — 어느 단지인지 카드 meta 에 남는다. */
const KAPT = arg("kapt");
let kapt = null;
if (KAPT) {
  const hp = P("data/datasets/apt-hhld.json");
  if (!existsSync(hp)) throw new Error("data/datasets/apt-hhld.json 이 없습니다 — 대장 세대수를 물릴 수 없습니다.");
  kapt = JSON.parse(readFileSync(hp, "utf8")).byKapt[KAPT];
  if (!kapt) throw new Error(`공동주택 대장에 ${KAPT} 가 없습니다.`);
}

/* ── ① 판정 결과 찾기 — 누적 로그에서 그 단지·그 타입의 건 */
const logDir = P("data/datasets/singo-log");
let hit = null;
if (existsSync(logDir)) {
  for (const f of readdirSync(logDir).sort().reverse()) {
    if (!f.endsWith(".json")) continue;
    const log = JSON.parse(readFileSync(join(logDir, f), "utf8"));
    for (const h of log.hits) {
      if (full(h.aptNm) === full(APT) && String(h.type) === String(TYPE)) {
        if (!hit || h.date > hit.date) hit = h;
      }
    }
    if (hit) break;
  }
}
if (!hit) {
  throw new Error(`신고가 로그에서 "${APT}" 전용 ${TYPE}타입 건을 못 찾았습니다 — data/datasets/singo-log 를 확인하세요.`);
}

/* ── ② 곡선 자료 */
const histPath = P(`data/datasets/singo-history/${hit.lawdCd}-${full(APT)}-${TYPE}.json`);
if (!existsSync(histPath)) {
  throw new Error(
    `곡선 자료가 없습니다: ${histPath}\n` +
      `→ data/singo-history-queue.txt 에 아래 한 줄을 쓰고 푸시하세요\n` +
      `   lawd=${hit.lawdCd} umd=${hit.umdNm} type=${TYPE} apt="${APT}"`,
  );
}
const hist = JSON.parse(readFileSync(histPath, "utf8"));

/* 판정 결과와 곡선이 서로 다른 이야기를 하면 그대로 오보다 — 여기서 맞춰 본다. */
if (hist.meta.peak.manwon !== hit.priceManwon) {
  throw new Error(
    `곡선의 최고가(${eok(hist.meta.peak.manwon)})와 신고가 판정(${eok(hit.priceManwon)})이 다릅니다 — 곡선을 다시 받으세요.`,
  );
}

const pts = hist.points;
const traded = pts.filter((p) => p.maxManwon != null);
if (traded.length < 3) throw new Error(`거래가 있던 달이 ${traded.length}개뿐이라 곡선을 그릴 수 없습니다.`);

/* ── ③ 좌표 계산 */
const VB_W = 936; // 카드 안쪽 폭(1080 - 좌우 여백 72×2)
/* ⚠️ SVG 는 width:100% + viewBox 비율로 높이가 정해진다 — **판이 남는 높이를 못 먹는다.**
   제목이 한 줄로 낮아지면서(2026-08-13 개편) 곡선 위에 250px 짜리 빈 칸이 생겼다.
   판 높이를 키워 그 자리를 곡선이 쓰게 한다. 여기 숫자를 바꾸면 곡선의 세로 크기가 바뀐다. */
/* ⚠️ 이 값이 곧 곡선의 세로 크기다. 위에 줄이 늘면(역 뱃지 등) **여기를 줄여야** 한다 —
   SVG 는 flex 로 안 줄어들어 자리가 모자라면 아랫줄을 그대로 덮는다.
   덮은 것은 designQa 의 `svgspill` 이 error 로 잡는다(2026-08-16 에 실제로 45px 밟았다). */
const VB_H = 700;
const PAD_T = 62; // 위 — 돌파선 라벨이 앉을 자리
const PAD_B = 62; // 아래 — 연도 축
/* ⚠️ 좌우 여백을 두는 이유: 2020·2026 연도 라벨이 판 끝에서 잘려 나가 **간격이 어긋나 보였다**
   (오너 2026-08-13 "연도들끼리 간격이 안맞아"). 예전엔 끝 라벨만 왼쪽/오른쪽 정렬로 물려
   붙였는데, 그러면 라벨이 자기 눈금에서 벗어나 더 어긋나 보인다. 여백으로 푼다. */
const X0 = 46;
const X1 = VB_W - 46;
const plotTop = PAD_T;
const plotBot = VB_H - PAD_B;

const lo = Math.min(...traded.map((p) => p.maxManwon));
const hi = Math.max(...traded.map((p) => p.maxManwon));
/* 위아래 여유는 **다르게** 준다.
   위쪽은 '이번에 넘은 선'이 곧 최고가라 여유가 크면 판 위쪽이 통째로 빈 칸이 된다
   (2026-08-16: 가격과 곡선 사이에 130px 짜리 죽은 자리가 생겼다).
   아래쪽은 곡선이 바닥에 붙지 않게 넉넉히 둔다. */
const span = hi - lo || hi * 0.1;
const yMax = hi + span * 0.09;
const yMin = Math.max(0, lo - span * 0.14);
const xOf = (i) => X0 + ((X1 - X0) * i) / (pts.length - 1);
const yOf = (m) => plotBot - ((plotBot - plotTop) * (m - yMin)) / (yMax - yMin);
const r2 = (v) => Math.round(v * 10) / 10;

/* 선 — 수집을 못 한 달(ok=false)에서 끊는다 */
const paths = [];
let seg = [];
pts.forEach((p, i) => {
  if (!p.ok) {
    if (seg.length > 1) paths.push(seg);
    seg = [];
    return;
  }
  if (p.maxManwon != null) seg.push([r2(xOf(i)), r2(yOf(p.maxManwon))]);
});
if (seg.length > 1) paths.push(seg);

/**
 * 점을 **부드럽게** 잇는다 (오너 2026-08-16 "딱딱 꺾이지 않게").
 *
 * ⚠️ 아무 스플라인이나 쓰면 안 된다. 보통의 Catmull-Rom 은 두 점 사이에서 **양쪽 값보다
 *    높이 솟거나 낮게 파인다**(오버슈트). 이 카드에서 그건 "그달에 더 비싸게 팔렸다"는
 *    말이 되어 **그림이 하는 거짓말**이 된다.
 *    그래서 **단조 3차 보간(Fritsch–Carlson)** 을 쓴다 — 구간 안에서 값이 두 끝점을
 *    절대 벗어나지 않는 방법이다. 아래에서 실제로 벗어나지 않는지 다시 재고, 벗어나면 던진다.
 */
function smoothPath(pts) {
  const n = pts.length;
  if (n < 3) return pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const dx = [];
  const dy = [];
  const d = []; // 구간 기울기
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    dy.push(pts[i + 1][1] - pts[i][1]);
    d.push(dy[i] / dx[i]);
  }
  const m = [d[0]];
  for (let i = 1; i < n - 1; i++) {
    // 꺾이는 지점(부호가 바뀌는 곳)에서는 기울기를 0 으로 — 여기가 오버슈트의 발원지다
    m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  }
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  let out = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    const c1x = r2(pts[i][0] + h);
    const c1y = r2(pts[i][1] + m[i] * h);
    const c2x = r2(pts[i + 1][0] - h);
    const c2y = r2(pts[i + 1][1] - m[i + 1] * h);
    out += ` C${c1x} ${c1y} ${c2x} ${c2y} ${pts[i + 1][0]} ${pts[i + 1][1]}`;
  }
  return out;
}

/** 곡선이 두 끝점 사이를 벗어나는지 실제로 재 본다 — 벗어나면 그림이 거짓말을 하는 것이다. */
function assertNoOvershoot(pts) {
  const n = pts.length;
  if (n < 3) return;
  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const dxs = [];
  const ds = [];
  for (let i = 0; i < n - 1; i++) {
    dxs.push(pts[i + 1][0] - pts[i][0]);
    ds.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
  }
  const m = [ds[0]];
  for (let i = 1; i < n - 1; i++) m.push(ds[i - 1] * ds[i] <= 0 ? 0 : (ds[i - 1] + ds[i]) / 2);
  m.push(ds[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (ds[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / ds[i], b = m[i + 1] / ds[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * ds[i]; m[i + 1] = t * b * ds[i]; }
  }
  for (let i = 0; i < n - 1; i++) {
    const h = dxs[i] / 3;
    const y0 = pts[i][1], y3 = pts[i + 1][1];
    const y1 = y0 + m[i] * h, y2 = y3 - m[i + 1] * h;
    const lo2 = Math.min(y0, y3) - 0.5;
    const hi2 = Math.max(y0, y3) + 0.5;
    for (let k = 1; k < 12; k++) {
      const v = bez(y0, y1, y2, y3, k / 12);
      if (v < lo2 || v > hi2) {
        throw new Error(`곡선이 구간 ${i} 에서 값을 벗어납니다(오버슈트) — 부드럽게 그리는 방식을 확인하세요.`);
      }
    }
  }
}

for (const sg of paths) assertNoOvershoot(sg);
const chartPaths = paths.map((sg) => ({ d: smoothPath(sg) }));

const dots = pts
  .map((p, i) => (p.maxManwon != null && p.ok ? { x: r2(xOf(i)), y: r2(yOf(p.maxManwon)), r: 4.5 } : null))
  .filter(Boolean);

/* 판 바탕 — 옅은 회색(오너 2026-08-16). 곡선이 놓인 '자리'를 만들어 준다.
   ⚠️ 아주 옅게. 진해지면 카드에 회색 덩어리가 앉은 것처럼 보인다(한 번 겪었다). */
const bg = { x: 0, y: 0, w: VB_W, h: VB_H, r: 10 };
const floor = null;
const band = null;

/* 이번에 넘은 선 — 라벨을 **오른쪽 끝(오늘 자리)** 에 둔다(오너 2026-08-16).
   왼쪽에 두면 6년 전 자리에서 오늘 값을 말하게 된다. */
let threshold = null;
if (hit.milestone) {
  const ty = r2(yOf(hit.milestone * 10000));
  threshold = { x1: X0, x2: X1, y: ty, tx: X1, ty: r2(ty - 20), anchor: "end", text: `${hit.milestone}억` };
}

/* 이번 거래 점 */
const lastIdx = pts.findIndex((p) => p.ym === hit.date.slice(0, 4) + hit.date.slice(5, 7));
const dx = r2(xOf(lastIdx >= 0 ? lastIdx : pts.length - 1));
const dy = r2(yOf(hit.priceManwon));
/* ⚠️ 점 옆 "10억" 라벨은 걷어냈다 — 바로 위 큰 숫자가 이미 그 말을 한다.
   같은 말을 두 번 하면 그게 곧 '군더더기'고, 카드가 템플릿처럼 보이는 이유다. */
const dot = { x: dx, y: dy, r: 12, rOuter: 19 };

/* 연도 축 — 1월이 있는 달에만 */
const axis = pts
  .map((p, i) => (p.ym.slice(4) === "01" ? { i, y: p.ym.slice(0, 4) } : null))
  .filter(Boolean)
  .map(({ i, y }) => ({ x: r2(xOf(i)), y: VB_H - 12, anchor: "middle", text: y }));

/* ⚠️ SVG 글자는 디자인 검수가 못 잰다 — 판을 넘지 않는지 여기서 확인한다.
   태백/Wanted 실측 대신 넉넉한 상한(글자당 0.62em)으로 잡는다. 넘으면 던진다. */
const widthOf = (text, size) => text.length * size * 0.62;
/* 연도는 **전부 가운데 정렬**이라 간격이 눈금 간격과 같다. 하나라도 판을 넘으면 여백이
   모자란 것이니 던진다 — 끝만 슬쩍 밀어 붙이면 간격이 어긋나 보인다(오너가 바로 알아봤다). */
for (const a of axis) {
  const w = widthOf(a.text, 24) / 2;
  if (a.x - w < 0 || a.x + w > VB_W) {
    throw new Error(`연도 축 "${a.text}" 이 판을 넘습니다 — X0/X1 여백을 키우세요.`);
  }
}
/* 눈금 간격이 실제로 고른지 확인한다(달 수가 12로 안 떨어지면 어긋난다) */
for (let i = 2; i < axis.length; i++) {
  const d1 = axis[i].x - axis[i - 1].x;
  const d0 = axis[i - 1].x - axis[i - 2].x;
  if (Math.abs(d1 - d0) > 1) throw new Error(`연도 간격이 고르지 않습니다: ${d0} vs ${d1}`);
}

/* ── ④ 지난 사이클 고점 — 사람이 눈으로 고르지 않는다
   낙폭(drawdown)이 가장 깊었던 골을 찾고, **그 골 이전의 최고가**를 지난 사이클 고점으로 본다.
   (이 단지: 2021-03 14.8억 → 2023-04 10.9억 으로 -26% 가 최대 낙폭 → 지난 고점 14.8억)
   ⚠️ "지난 고점"을 손으로 찍으면 단지가 바뀔 때마다 사람이 다시 골라야 하고, 그때 틀린다. */
let runMax = -1;
let runMaxIdx = -1;
let worst = { dd: 0, atMaxIdx: -1 };
traded.forEach((p, i) => {
  if (p.maxManwon > runMax) {
    runMax = p.maxManwon;
    runMaxIdx = i;
  }
  const dd = p.maxManwon / runMax - 1;
  if (dd < worst.dd) worst = { dd, atMaxIdx: runMaxIdx };
});
let cycle = null;
if (worst.atMaxIdx >= 0) {
  const pk = traded[worst.atMaxIdx];
  const vs = ((hit.priceManwon - pk.maxManwon) / pk.maxManwon) * 100;
  cycle = {
    peak: eok(pk.maxManwon),
    when: `${pk.ym.slice(0, 4)}.${pk.ym.slice(4)}월`,
    vs: `${vs >= 0 ? "+" : "−"}${Math.abs(vs).toFixed(1)}%`,
    dir: vs >= 0 ? "up" : "down",
  };
}

/* ── 기준선 두 줄을 그래프 안에 (오너 2026-08-16)
   · 지난 사이클 고점 : `9억(21.10월)` + 빨강 `고점 대비 +11.1%`
   · 기준선 이후 최저점 : `6.15억(20.01월)` + 파랑 `저점 대비 +62.6%`
   색 기준은 방향이 아니라 **무엇과 견주는가**로 고정했다(오너 지시) —
   고점 대비는 늘 빨강, 저점 대비는 늘 파랑.

   ⚠️ 세로 브래킷으로 두 선을 묶어 봤다가 걷었다. 곡선이 두 선 사이를 지나는 단지에서는
      설 자리가 아예 없어 표시가 통째로 사라졌다(상록마을 라이프2차). 라벨 꼬리로 붙이면
      단지가 어떻게 생겼든 항상 나온다 — **가끔 예뻐지는 것보다 늘 나오는 편이 낫다.** */
const ymLab = (ym) => `${ym.slice(2, 4)}.${ym.slice(4)}월`;

let prevLine = null;
let old = null;
if (cycle && worst.atMaxIdx >= 0) {
  const pk = traded[worst.atMaxIdx];
  const py = r2(yOf(pk.maxManwon));
  prevLine = {
    x1: X0,
    x2: X1,
    y: py,
    tx: X0,
    ty: r2(py - 14),
    text: `${eok(pk.maxManwon)}(${ymLab(pk.ym)})`,
    tail: ` 고점 대비 ${cycle.vs}`,
    tone: "hi", // 고점 대비 = 빨강
  };
  const idx = pts.findIndex((p) => p.ym === pk.ym);
  if (idx >= 0) old = { x: r2(xOf(idx)), y: py, r: 10 };
}

/* 기준선 이후 최저점 — 저점 대비 상승률. 최저점이 곧 오늘이면(내내 내림) 그릴 것이 없다. */
let lowLine = null;
let lowDot = null;
const lowPt = traded.reduce((a, b) => (b.maxManwon < a.maxManwon ? b : a));
if (lowPt.maxManwon < hit.priceManwon) {
  const ly = r2(yOf(lowPt.maxManwon));
  const vsLow = ((hit.priceManwon - lowPt.maxManwon) / lowPt.maxManwon) * 100;
  lowLine = {
    x1: X0,
    x2: X1,
    y: ly,
    tx: X0,
    /* ⚠️ 저점 라벨은 선 **아래**에 둔다. 위에 두면 최저점 빈 원과 겹친다 —
       최저점은 곡선의 가장 아래라 그 위가 원의 자리다(2026-08-16 렌더에서 겹쳤다).
       아래는 연도 축까지 비어 있어 자리가 넉넉하다. */
    ty: r2(ly + 34),
    text: `${eok(lowPt.maxManwon)}(${ymLab(lowPt.ym)})`,
    tail: ` 저점 대비 +${vsLow.toFixed(1)}%`,
    tone: "lo", // 저점 대비 = 파랑
  };
  const li = pts.findIndex((p) => p.ym === lowPt.ym);
  if (li >= 0) lowDot = { x: r2(xOf(li)), y: ly, r: 10 };
}

/* ⚠️ SVG 글자는 designQa 가 못 잰다 — 판을 넘는지 여기서 재고, 넘으면 던진다. */
for (const L of [prevLine, lowLine]) {
  if (!L) continue;
  const w = widthOf(L.text + (L.tail ?? ""), 26);
  if (L.tx + w > VB_W) throw new Error(`기준선 라벨("${L.text}${L.tail ?? ""}")이 판을 넘습니다.`);
  if (L.ty - 26 < 0) throw new Error(`기준선 라벨이 판 위로 넘칩니다.`);
  if (L.ty + 8 > VB_H) throw new Error(`기준선 라벨이 판 아래로 넘칩니다.`);
}
/* 두 기준선이 붙어 있으면 라벨이 겹친다 — 고점 라벨을 한 단계 더 위로 올린다. */
if (prevLine && lowLine && Math.abs(prevLine.y - lowLine.y) < 60) {
  prevLine.ty = r2(prevLine.y - 34);
}
if (threshold && prevLine && Math.abs(threshold.ty - prevLine.ty) < 30) {
  throw new Error(`돌파선 라벨과 고점 라벨이 너무 가깝습니다 — 판 높이를 키우세요.`);
}

/* ── 가까운 역 (오너 2026-08-16 "가까운 역을 뱃지로")
   파일이 없으면 **뱃지를 붙이지 않는다.** 내가 아는 역 이름을 적는 건 오보다 —
   `data/apt-station-queue.txt` 에 `kapt=...` 한 줄을 밀어 코드가 재게 한다.
   ⚠️ 거리는 카드에서 뺐다(오너 2026-08-16) — 노선과 역 이름만 알약 하나에 담는다. */
let station = null;
if (KAPT) {
  const sp = P(`data/datasets/apt-station/${KAPT}.json`);
  if (existsSync(sp)) {
    const st = JSON.parse(readFileSync(sp, "utf8"));
    station = { name: st.station, lines: st.lines ?? [], distanceM: st.distanceM };
  } else {
    console.warn(
      `ⓘ 가까운 역 자료가 없어 뱃지를 생략합니다. 붙이려면:\n` +
        `   data/apt-station-queue.txt 에  kapt=${KAPT}  한 줄을 쓰고 푸시`,
    );
  }
}

/* ── ⑤ 문구 — 전부 위 수치에서 나온다 */
const first = traded[0];
const fromLabel = `${hist.meta.from.slice(0, 4)}년${hist.meta.from.slice(4) === "01" ? "" : ` ${Number(hist.meta.from.slice(4))}월`}`;
const dot2 = (d) => `${d.slice(0, 4)}.${d.slice(5, 7)}.${d.slice(8, 10)}`;

/* 제목에 쓸 지역 이름 — "성남시분당구"·"광명시"는 제목에 길다.
   ① 구가 붙은 시("성남시분당구")는 시 이름을 떼고 "분당구"
   ② 끝의 "구"·"시"는 남는 글자가 2자 이상일 때만 뗀다 → "분당" · "광명"
   ⚠️ 중구·서구처럼 한 글자만 남는 곳은 그대로 둔다("중 필동"은 말이 안 된다). */
const guRaw = hit.gu.replace(/^[가-힣]+시(?=[가-힣]+구$)/, "");
const guShort = /[구시]$/.test(guRaw) && guRaw.length >= 3 ? guRaw.slice(0, -1) : guRaw;
/* ⚠️ 단지명이 이미 지역을 품고 있으면 지역 라벨을 안 붙인다 —
   "광명 광명한진타운"처럼 같은 말이 두 번 나온다(2026-08-16 광명한진타운 첫 실행에서 나왔다).
   "광명한진타운"이면 어느 시인지는 이름이 이미 말한다. */
const aptStartsWithRegion = full(hit.aptNm).startsWith(full(guShort));

/* 제원 두 줄 — 세대수 | 준공(년식) / 전용 | 층.
   ⚠️ 준공 연도를 '년식'으로 겹쳐 적는 건 오너 지정 형식이다(2026-08-13). */
const SEP = '<span class="sep">|</span>';
const yy = hit.buildYear ? String(hit.buildYear).slice(2) : null;
const specTop = [
  kapt ? `${kapt.hhld.toLocaleString("ko-KR")}세대` : null,
  hit.buildYear ? `${hit.buildYear}년 준공` : null,
].filter(Boolean);
const specBot = [`전용 ${hit.area}㎡`, `${hit.floor}층`];
const spec = [specTop.join(SEP), specBot.join(SEP)].filter((x) => x);

const card = {
  template: "singo-record@1",
  date: DATE,
  /* 킥커 — 오너 지정 문구(2026-08-13). 돌파가 아니면 '클럽 가입'이라 부를 수 없다. */
  kicker: hit.milestone
    ? `오늘의 ${hit.milestone}억 클럽 (${DATE.replace(/-/g, ".")})`
    : `오늘의 신고가 (${DATE.replace(/-/g, ".")})`,
  /* 제목 — 지역은 회색으로 물러나고 단지·평형만 잉크. */
  title: aptStartsWithRegion
    ? `${hit.aptNm} ${hit.pyeong}`
    : `<span class="rg">${guShort}</span> ${hit.aptNm} ${hit.pyeong}`,
  station,
  price: eok(hit.priceManwon),
  spec,
  chart: { vb: `0 0 ${VB_W} ${VB_H}`, bg, threshold, prevLine, lowLine, paths: chartPaths, dots, axis, old, lowDot, dot },
  /* ⚠️ 하단 기준 문구를 걷어냈다(오너 2026-08-16). 다만 **"역대가 아니라 2020년 이후"** 라는
     단서는 오보를 막는 장치라 버릴 수 없어 **푸터 출처 줄로 옮겼다.** 카드 어딘가에는 있어야 한다. */
  /* 푸터는 한 줄이어야 한다 — asOf 까지 넣었더니 두 줄로 넘쳤다(2026-08-16).
     날짜는 킥커가 이미 말하므로 여기서는 **무엇을 기준으로 재는가**만 남긴다. */
  source: { name: `국토교통부 아파트 매매 실거래가 · ${fromLabel} 이후 기준` },
  meta: {
    verified: true,
    provenance: [
      `singo-log: ${hit.foundOn ?? DATE} 판정`,
      `singo-history: ${histPath.replace(ROOT + "/", "")} (${hist.meta.monthsTried}개월 · 실패 ${hist.meta.monthsFailed})`,
    ],
    baselineFrom: hist.meta.from,
    /* 곡선이 그리는 값을 **글자로도** 남긴다.
       chart 에는 픽셀 좌표뿐이라, 이게 없으면 그림이 자료와 맞는지 아무도 대조할 수 없다.
       (캡션 검수도 이 풀과 대조해 "카드에 없는 금액"을 잡는다.) */
    curve: traded.map((p) => ({ ym: p.ym, eok: eok(p.maxManwon), date: p.date, floor: p.floor })),
    prevPeak: { eok: eok(hit.prevPeakManwon), date: hit.prevPeakDate, gainPct: Number(hit.gainPct.toFixed(2)) },
    cycle,
    cycleCalc: {
      maxDrawdownPct: Number((worst.dd * 100).toFixed(2)),
      note: "지난 사이클 고점 = 최대 낙폭이 난 골 직전의 최고가. 코드가 계산한다(사람이 고르지 않는다).",
    },
    firstPoint: { ym: first.ym, eok: eok(first.maxManwon) },
    station: station
      ? { ...station, note: "카카오 로컬이 잰 **직선거리**. 걸어간 거리가 아니다." }
      : { note: "가까운 역 자료 없음 — 뱃지를 붙이지 않았다." },
    hhld: kapt
      ? {
          kaptCode: KAPT,
          kaptName: kapt.name,
          hhld: kapt.hhld,
          addr: kapt.addr,
          note:
            "공동주택 대장 값. 실거래 표기(" +
            hit.aptNm +
            ")와 대장 표기가 달라 **이름으로 자동 매칭하지 않고 kaptCode 로 짚었다** — " +
            "오너가 2026-08-13 같은 단지임을 확인했다.",
        }
      : { note: "세대수는 싣지 않는다 — 대장 항목을 짚지 않았다(--kapt 미지정)." },
  },
};

const slug = `singo-${full(APT)}-${TYPE}`;
const outDir = flag("publish") ? P(join("data/content", DATE)) : P("data/out/_spike");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${slug}.json`);
writeFileSync(outPath, JSON.stringify(card, null, 2) + "\n");

console.log(
  `${outPath}\n` +
    `${hit.aptNm} ${hit.pyeong} ${eok(hit.priceManwon)} · 직전 ${eok(hit.prevPeakManwon)} ${hit.prevPeakDate}\n` +
    (cycle ? `지난 사이클 고점 ${cycle.peak} (${cycle.when}) · 고점 대비 ${cycle.vs}\n` : "지난 사이클 고점 없음(내림 구간이 없었다)\n") +
    `곡선 ${traded.length}개월 / ${pts.length}개월 · 끊긴 구간 ${chartPaths.length - 1}곳`,
);
