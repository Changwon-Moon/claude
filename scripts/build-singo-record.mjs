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
const yMax = hi + span * 0.05;
const yMin = Math.max(0, lo - span * 0.16);
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

/* 가로선은 **뜻이 있는 것만** 남긴다 — 이 판에는 문턱선 하나뿐이다.
   ⚠️ 25/50/75% 눈금선 3줄을 깔았다가 걷어냈다: 값 라벨이 없어 **아무것도 말하지 않는 선**이었다.
   ⚠️ 바닥선도 걷어냈다. y축이 0에서 시작하지 않는데(최저 6.15억 아래로 여유만 둔다)
      바닥에 선이 있으면 **그게 0선으로 읽힌다** — 그건 그림이 하는 거짓말이다.
      연도 글자가 이미 판의 바닥을 말해 준다. */
const floor = null;

/* 넘어선 선 + 그 위 영역("N억 클럽 자리") — 10억 단위 돌파가 있을 때만 */
let threshold = null;
if (hit.milestone) {
  const ty = r2(yOf(hit.milestone * 10000));
  threshold = { x1: X0, x2: X1, y: ty, tx: X0, ty: r2(ty - 14), text: `${hit.milestone}억` };
}
/* ⚠️ 문턱 **위쪽에 옅은 톤을 깔아 봤다가 걷어냈다**(2026-08-16). 잉크 4.5% 여도 종이(#FAFAF8)
   위에서는 큰 회색 사각형으로 읽혔다 — 오너가 피하려던 바로 그 "AI티"다.
   빨간 점이 점선 위에 올라앉은 그림이 이미 "넘었다"를 말한다. 선 하나면 충분하다. */
const band = null;

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

/* ── 지난 사이클을 **그래프 안으로** 옮긴다 (오너 2026-08-16 "최하단 내용을 그래프에 붙여줘")
   · 지난 고점 값에 맞춰 가로 점선 하나
   · 그 선과 돌파선 사이를 세로 브래킷으로 묶고 옆에 "고점 대비 +N%"
   두 선 사이의 **간격이 곧 그 퍼센트**다 — 숫자와 그림이 같은 것을 가리킨다. */
let prevLine = null;
let gap = null;
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
    text: `지난 고점 ${cycle.peak} · ${cycle.when}`,
  };

  // 옛 고점 그 달에 빈 원을 찍어 "이 점이 그 고점"임을 말한다
  const idx = pts.findIndex((p) => p.ym === pk.ym);
  if (idx >= 0) old = { x: r2(xOf(idx)), y: py, r: 10 };

  /* ⚠️ 라벨을 원 오른쪽으로 밀어 봤다가 되돌렸다(2026-08-16).
     라벨은 선 **위**에 앉고 원은 선 **위에 중심**이 있어 세로로는 절대 안 겹친다.
     그런데 밀고 나니 라벨이 판 가운데를 차지해 **브래킷이 설 자리가 없어졌고,
     '고점 대비' 표시가 통째로 사라졌다.** 안 겹치는 것을 피하려다 있어야 할 것을 잃었다.
     라벨은 왼쪽 끝에 그대로 둔다. */

  /* 브래킷은 **곡선이 비어 있는 x** 에 세운다. 두 선 사이를 지나는 구간을 피해야
     글자가 곡선 위에 얹히지 않는다 — 후보 x 를 훑어 곡선과 가장 멀리 떨어진 자리를 고른다.
     (사람이 눈으로 자리를 찍지 않는다. 단지가 바뀌면 곡선 모양도 바뀐다.) */
  const yTop = r2(yOf(hit.milestone ? hit.milestone * 10000 : hit.priceManwon));
  const seriesY = pts.map((p, i) => (p.maxManwon != null ? [xOf(i), yOf(p.maxManwon)] : null)).filter(Boolean);
  const bandLo = Math.min(yTop, py);
  const bandHi = Math.max(yTop, py);
  /* 지난 고점 라벨도 이 띠 안에 앉아 있다 — 브래킷이 그 위를 지나면 둘 다 안 읽힌다.
     라벨이 차지한 x 구간을 후보에서 통째로 뺀다(2026-08-16 렌더에서 실제로 스쳤다). */
  const labW = prevLine.text.length * 26 * 0.62;
  const labX1 = prevLine.tx - 24;
  const labX2 = prevLine.tx + labW + 24;

  /* 브래킷 + 글자가 **함께 들어갈 자리**를 찾는다. 브래킷만 피해서는 소용이 없다 —
     글자가 곡선 위에 얹히면 둘 다 안 읽힌다(2026-08-16 첫 렌더에서 "+11.1%" 가
     마지막 급등 구간을 밟았다). 글자 폭은 **실제 크기(34px)** 로 잡는다. */
  const GAP_FS = 34;
  const gapText = `고점 대비 ${cycle.vs}`;
  const gapW = gapText.length * GAP_FS * 0.62;

  let bestX = null;
  for (let t = 0.12; t <= 0.9; t += 0.005) {
    const gx = X0 + (X1 - X0) * t;
    const winL = gx - 26;
    const winR = gx + 26 + gapW;
    if (winR > VB_W) break;                      // 판을 넘으면 더 오른쪽은 볼 것도 없다
    if (winR > labX1 && winL < labX2) continue;  // 지난 고점 라벨과 겹치면 제외
    let clear = true;
    for (const [sx, sy] of seriesY) {
      if (sx < winL - 12 || sx > winR + 12) continue;
      if (sy >= bandLo - 10 && sy <= bandHi + 10) { clear = false; break; }
    }
    if (clear) { bestX = gx; break; }            // 가장 왼쪽의 빈 자리를 쓴다
  }
  /* ⚠️ 브래킷이 설 자리가 아예 없을 수 있다 — 곡선이 두 선 사이를 계속 지나가는 단지가 그렇다
     (상록마을 라이프2차: 14.8억~20억 구간을 곡선이 내내 오르내린다).
     그때 '고점 대비'를 통째로 빼면 **오너가 요구한 정보가 사라진다.**
     그래서 지난 고점 라벨 **꼬리에 붙여** 적는다 — 자리를 못 찾았지 뜻을 버린 게 아니다. */
  if (bestX == null) prevLine.tail = ` · 고점 대비 ${cycle.vs}`;

  const bestClear = bestX == null ? -1 : 1;
if (bestX != null && bestClear > 0) {
    const gx = r2(bestX);
    gap = {
      x: gx,
      y1: yTop,
      y2: py,
      tickX1: r2(gx - 14),
      tickX2: r2(gx + 14),
      tx: r2(gx + 22),
      ty: r2((yTop + py) / 2 + 12),
      anchor: "start",
      text: gapText,
      dir: cycle.dir,
    };
  }
}

/* ⚠️ SVG 글자는 designQa 가 못 잰다 — 판을 넘는지 여기서 재고, 넘으면 던진다. */
if (prevLine) {
  const w = widthOf(prevLine.text + (prevLine.tail ?? ""), 26);
  if (prevLine.tx + w > VB_W) throw new Error(`지난 고점 라벨("${prevLine.text}")이 판을 넘습니다.`);
  if (prevLine.ty - 26 < 0) throw new Error(`지난 고점 라벨이 판 위로 넘칩니다.`);
  if (threshold && Math.abs(threshold.ty - prevLine.ty) < 34) {
    throw new Error(`돌파선 라벨과 지난 고점 라벨이 너무 가깝습니다 — 판 높이를 키우세요.`);
  }
}
if (gap) {
  // 자리 선정에서 이미 보장했지만, 계산이 어긋나면 조용히 넘치는 것보다 던지는 편이 낫다
  const w = gap.text.length * 34 * 0.62;
  if (gap.tx + w > VB_W) throw new Error(`고점 대비 라벨("${gap.text}")이 판을 넘습니다.`);
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
  hit.buildYear ? `${hit.buildYear}년 준공(${yy}년식)` : null,
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
  chart: { vb: `0 0 ${VB_W} ${VB_H}`, threshold, prevLine, gap, gapDir: cycle ? cycle.dir : null, paths: chartPaths, dots, axis, old, dot },
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
