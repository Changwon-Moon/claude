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
/* ⚠️ **이 판형에 맞지 않는 단지를 거른다** (2026-08-16b).
   판은 2020-01 부터 6년을 그린다. 그런데 새 단지는 관측이 맨 오른쪽 끝에만 몰려
   판의 80%가 텅 빈 채로 나간다 — 반정아이파크캐슬5단지는 첫 거래가 2025-11 이라
   80개월 판에 점이 6개였다. 그림이 거짓말을 하는 건 아니지만 **할 말이 없는 그림**이고,
   그 상태로도 "지난 사이클 고점"을 4개월 전 값으로 적게 된다(아래 가드가 그걸 막는다).
   → 이런 단지는 이 판형으로 만들지 않는다. 다른 판형이 필요하다는 뜻이다. */
const MIN_MONTHS = 15;
if (traded.length < MIN_MONTHS) {
  throw new Error(
    `거래가 있던 달이 ${traded.length}개월뿐입니다(첫 거래 ${traded[0].ym}) — ` +
      `이 판형은 2020년부터 6년을 그리므로 최소 ${MIN_MONTHS}개월이 필요합니다.\n` +
      `→ 새 단지라 이력이 짧습니다. 이 소재는 다른 판형으로 다루세요.`,
  );
}

/* ── ③ 좌표 계산 */
const VB_W = 936; // 카드 안쪽 폭(1080 - 좌우 여백 72×2)
/* ⚠️ SVG 는 width:100% + viewBox 비율로 높이가 정해진다 — **판이 남는 높이를 못 먹는다.**
   제목이 한 줄로 낮아지면서(2026-08-13 개편) 곡선 위에 250px 짜리 빈 칸이 생겼다.
   판 높이를 키워 그 자리를 곡선이 쓰게 한다. 여기 숫자를 바꾸면 곡선의 세로 크기가 바뀐다. */
/* ⚠️ 이 값이 곧 곡선의 세로 크기다. 위에 줄이 늘면(역 뱃지 등) **여기를 줄여야** 한다 —
   SVG 는 flex 로 안 줄어들어 자리가 모자라면 아랫줄을 그대로 덮는다.
   덮은 것은 designQa 의 `svgspill` 이 error 로 잡는다(2026-08-16 에 실제로 45px 밟았다). */
/* ⚠️ 775 였을 때 판이 담는 칸(`.sr-chart`, 760px)을 **7px 넘쳐** designQa 가 error 를 냈다
   (2026-08-16b 검수). 제원이 세 줄이 되면서 히어로가 커져 칸이 그만큼 줄어든 것이다.
   **위에 줄이 늘면 여기를 줄여야 한다** — SVG 는 flex 로 안 줄어들어 그냥 아랫줄을 덮는다. */
const VB_H = 768;
/* 위 — 돌파선 라벨이 앉을 자리만 남긴다. 62 였을 때 판 위쪽에 빈 띠가 남았다
   (오너 2026-08-16b "그래프 위쪽 여백이 과해"). 아래 `yMax` 여유와 **둘이 합쳐** 그 띠를 만든다.
   ⚠️ 라벨(28px)이 y-20 에 앉으므로 48px 아래로는 못 내린다 — 그 아래는 라벨이 판을 넘는다. */
const PAD_T = 44;
/* 아래 — 연도 축이 앉을 자리. 62 였을 때 곡선 바닥과 연도 사이가 통째로 비어 보였다
   (오너 2026-08-16 "연도축과 그래프 하단 사이 여백 좀 줄여줘").
   아래 `yMin` 여유와 **둘이 합쳐** 그 빈칸을 만든다 — 한쪽만 줄이면 티가 안 난다. */
const PAD_B = 40;
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
const yMax = hi + span * 0.04;
const yMin = Math.max(0, lo - span * 0.05);
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

/* ⚠️ 달마다 찍던 관측 점(`.sr-obs`)을 걷어냈다 (2026-08-16b 검수).
   65개월치 점이 14px 간격으로 5px 굵기 곡선 **위에** 찍히면서, "그달에 거래가 있었다"를
   말해 주기는커녕 선 양옆에 회색 털이 붙은 것처럼 보였다. 오늘 점 자리에도 하나가 겹쳐
   **속을 비운 링 한가운데에 회색 점이 박혔다**(오너 지시와 정반대).
   ⚠️ 그래도 "선은 관측 사이를 이은 것"이라는 정직함은 버리지 않는다 — 수집을 못 한 달에서
      path 를 끊는 규칙과 `meta.curve`(모든 관측을 글자로 남김)가 그 몫을 그대로 한다. */
const dots = [];

/* 판 바탕 — 옅은 회색(오너 2026-08-16). 곡선이 놓인 '자리'를 만들어 준다.
   ⚠️ 아주 옅게. 진해지면 카드에 회색 덩어리가 앉은 것처럼 보인다(한 번 겪었다). */
/* 모서리는 4px. CARD_CHECKLIST 의 "AI티 금지"가 "각을 세우고(≤4px)"라고 못박는다 —
   크게 둥근 옅은 회색 판이 정확히 그 'AI티'의 표본이다(2026-08-16b 검수). */
const bg = { x: 0, y: 0, w: VB_W, h: VB_H, r: 4 };
const floor = null;
const band = null;

/* 이번에 넘은 선 — 라벨을 **오른쪽 끝(오늘 자리)** 에 둔다(오너 2026-08-16).
   왼쪽에 두면 6년 전 자리에서 오늘 값을 말하게 된다. */
let threshold = null;
if (hit.milestone) {
  const ty = r2(yOf(hit.milestone * 10000));
  /* ⚠️ 오른쪽 끝에 딱 붙이지 않는다 — 저점 대비 파랑 직선이 **판 맨 오른쪽**에 서면서
     그 눈금(±12px)과 이 라벨이 같은 자리를 놓고 다툰다(오너 2026-08-16). 34px 만 물린다. */
  threshold = { x1: X0, x2: X1, y: ty, tx: X1 - 34, ty: r2(ty - 20), anchor: "end", text: `${hit.milestone}억` };
}

/* 이번 거래 점 */
const lastIdx = pts.findIndex((p) => p.ym === hit.date.slice(0, 4) + hit.date.slice(5, 7));
const dx = r2(xOf(lastIdx >= 0 ? lastIdx : pts.length - 1));
const dy = r2(yOf(hit.priceManwon));
/* ⚠️ 점 옆 "10억" 라벨은 걷어냈다 — 바로 위 큰 숫자가 이미 그 말을 한다.
   같은 말을 두 번 하면 그게 곧 '군더더기'고, 카드가 템플릿처럼 보이는 이유다. */
/* 오늘 점은 **채우기 없이 잉크 테두리**(오너 2026-08-16b). 빨강으로 채웠더니 고점 점과
   같은 색이라 어느 쪽이 오늘인지 흐렸다 — 속이 빈 원 하나면 오늘만 다르게 읽힌다. */
const dot = { x: dx, y: dy, r: 13, rOuter: 20 };

/* 연도 축 — 1월이 있는 달에만 */
const axis = pts
  .map((p, i) => (p.ym.slice(4) === "01" ? { i, y: p.ym.slice(0, 4) } : null))
  .filter(Boolean)
  .map(({ i, y }) => ({ x: r2(xOf(i)), y: VB_H - 14, anchor: "middle", text: y }));

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
  /* ⚠️ **몇 달 전 값을 "지난 사이클 고점"이라 부르지 않는다** (2026-08-16b).
     낙폭 계산은 관측이 몇 개든 답을 내놓는다 — 반정아이파크캐슬5단지는 4개월 전(2026.04)
     값을 지난 사이클 고점으로 집었다. 넉 달은 사이클이 아니다. 그 말이 카드에 나가면
     독자는 한 번의 오르내림을 시장 사이클로 읽는다. */
  const MIN_CYCLE_MONTHS = 12;
  const monthsApart = (a, b) =>
    (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + (Number(b.slice(4)) - Number(a.slice(4)));
  const gap = monthsApart(pk.ym, `${hit.date.slice(0, 4)}${hit.date.slice(5, 7)}`);
  if (gap < MIN_CYCLE_MONTHS) {
    throw new Error(
      `지난 사이클 고점으로 집힌 ${pk.ym} 이 이번 거래(${hit.date})에서 ${gap}개월밖에 안 됐습니다 — ` +
        `그건 사이클이 아닙니다(최소 ${MIN_CYCLE_MONTHS}개월).\n` +
        `→ 오르내림이 한 번뿐인 단지입니다. 이 소재는 다른 판형으로 다루세요.`,
    );
  }
  const vs = ((hit.priceManwon - pk.maxManwon) / pk.maxManwon) * 100;
  cycle = {
    peak: eok(pk.maxManwon),
    when: `${pk.ym.slice(0, 4)}.${pk.ym.slice(4)}월`,
    vs: `${vs >= 0 ? "+" : "−"}${Math.abs(vs).toFixed(1)}%`,
    dir: vs >= 0 ? "up" : "down",
  };
}

/* ── 기준선 두 줄 + 폭 표시 직선 (오너 2026-08-16)
   · 지난 사이클 고점 : 왼쪽에 2행 `9억(21.10월)` / 빨강 `고점대비 +11.1%`
   · 기준선 이후 최저점 : **최우측**에 2행 `6.15억(20.01월)` / 파랑 `저점대비 +62.6%`
   · 두 선과 오늘 선 사이를 **세로 직선**으로 잇는다 — 그 길이가 곧 퍼센트다
     (빨강 = 고점 대비, 파랑 = 저점 대비)

   색 기준은 방향이 아니라 **무엇과 견주는가**로 고정했다(오너 지시).

   ⚠️ 직선 자리는 훑어 고르지 않는다. 예전에 곡선 빈 자리를 찾게 했더니 단지에 따라
      자리가 없어 표시가 통째로 사라졌다(상록마을 라이프2차).
      **각자 제 라벨 옆에 고정으로 세우고, 곡선 뒤에 깐다** — 늘 나온다. */
const ymLab = (ym) => `${ym.slice(2, 4)}.${ym.slice(4)}월`;
const thrY = threshold ? threshold.y : r2(yOf(hit.priceManwon));
const LAB_FS = 27;

let prevLine = null;
let old = null;
let brkHi = null;
if (cycle && worst.atMaxIdx >= 0) {
  const pk = traded[worst.atMaxIdx];
  const py = r2(yOf(pk.maxManwon));
  const bx = r2(X0 + 26);
  prevLine = {
    x1: X0,
    x2: X1,
    y: py,
    tx: r2(bx + 26),
    anchor: "start",
    ty1: r2(py - 52),
    ty2: r2(py - 16),
    text1: `${eok(pk.maxManwon)}(${ymLab(pk.ym)})`,
    /* ⚠️ "고점대비" 만 쓰면 **역대 고점 대비**로 읽힌다(2026-08-16b 검수).
       여기 고점은 지난 사이클 고점(9억·2021.10)이고, 직전 최고가는 9.5억(2026-07-14)로 따로 있다.
       윗줄이 값과 연월을 박아 두지만, 단어 자체가 기준을 말하게 한다. */
    text2: `지난 고점대비 ${cycle.vs}`,
    tone: "hi",
  };
  brkHi = { x: bx, y1: thrY, y2: py, tickX1: r2(bx - 12), tickX2: r2(bx + 12), tone: "hi" };
  const idx = pts.findIndex((p) => p.ym === pk.ym);
  /* 고점 점은 **빨강 채움**(오너 2026-08-16) — 빈 원 두 개는 어느 쪽이 고점인지 말해 주지 않았다.
     색이 라벨과 같으니 그림에서 숫자를 찾는 데 한 걸음이 준다. */
  if (idx >= 0) old = { x: r2(xOf(idx)), y: py, r: 10, tone: "hi" };
}

/* 기준선 이후 최저점. 최저점이 곧 오늘이면(내내 내림) 그릴 것이 없다. */
let lowLine = null;
let lowDot = null;
let brkLo = null;
const lowPt = traded.reduce((a, b) => (b.maxManwon < a.maxManwon ? b : a));
if (lowPt.maxManwon < hit.priceManwon) {
  const ly = r2(yOf(lowPt.maxManwon));
  const vsLow = ((hit.priceManwon - lowPt.maxManwon) / lowPt.maxManwon) * 100;
  const t1 = `${eok(lowPt.maxManwon)}(${ymLab(lowPt.ym)})`;
  const t2 = `저점대비 +${vsLow.toFixed(1)}%`;
  /* 파랑 직선은 **판 맨 오른쪽**에 세운다(오너 2026-08-16).
     오늘 자리가 곧 오른쪽 끝이라, 여기 서야 "오늘 값에서 저점까지"라는 말이 그림과 맞는다.
     그래서 라벨은 그 왼쪽으로 물린다 — 안 물리면 글자를 직선이 관통한다. */
  /* ⚠️ X1(판 끝)에 세웠더니 오늘 점(x=879)을 11px 비껴 지나가, 파랑 눈금이 링 옆구리로
     삐져나오고 세로선이 곡선과 나란히 어긋났다(2026-08-16b 검수).
     **오늘 점 바로 그 자리**에 세운다 — "오늘 값에서 저점까지"라는 말이 그림과 맞아야 한다. */
  const bx = dx;
  const LOW_LAB_TX = r2(X1 - 34);
  lowLine = {
    x1: X0,
    x2: X1,
    y: ly,
    tx: LOW_LAB_TX,
    anchor: "end",
    ty1: r2(ly - 52),
    ty2: r2(ly - 16),
    text1: t1,
    text2: t2,
    tone: "lo",
  };
  brkLo = { x: bx, y1: thrY, y2: ly, tickX1: r2(bx - 12), tickX2: r2(bx + 12), tone: "lo" };
  const li = pts.findIndex((p) => p.ym === lowPt.ym);
  /* 저점 점은 **파랑 채움** — 저점 라벨과 같은 색이라 눈이 바로 잇는다. */
  if (li >= 0) lowDot = { x: r2(xOf(li)), y: ly, r: 10, tone: "lo" };
}

/* ⚠️ SVG 글자는 designQa 가 못 잰다 — 판을 넘는지 여기서 재고, 넘으면 던진다. */
for (const L of [prevLine, lowLine]) {
  if (!L) continue;
  const w = Math.max(widthOf(L.text1, LAB_FS), widthOf(L.text2, LAB_FS));
  const left = L.anchor === "end" ? L.tx - w : L.tx;
  if (left < 0 || left + w > VB_W) throw new Error(`기준선 라벨("${L.text1}")이 판을 넘습니다.`);
  if (L.ty1 - LAB_FS < 0) throw new Error(`기준선 라벨이 판 위로 넘칩니다.`);
  if (L.ty2 + 8 > VB_H) throw new Error(`기준선 라벨이 판 아래로 넘칩니다.`);
}
/* 두 기준선이 붙어 있으면 라벨 두 벌이 겹친다 — 그때는 고점 라벨을 더 위로 올린다. */
if (prevLine && lowLine && Math.abs(prevLine.y - lowLine.y) < 110) {
  prevLine.ty1 = r2(prevLine.ty1 - 44);
  prevLine.ty2 = r2(prevLine.ty2 - 44);
}
if (threshold && prevLine && prevLine.ty1 - threshold.ty < 24) {
  throw new Error(`돌파선 라벨과 고점 라벨이 너무 가깝습니다 — 판 높이를 키우세요.`);
}

/* ── 판 안쪽 워터마크 (오너 2026-08-16b "더 키워서 대각선으로 기울여서 중앙배치")
   BRAND.md 슬롯 C. 이 카드는 곡선 판이 카드 높이의 절반을 넘어(775/1350 ≈ 57%)
   **판만 잘라 재업로드**가 실제로 되는 모양이라 슬롯 C 조건을 만족한다.

   ⚠️ 처음엔 "빈 곳을 재서" 고르게 했는데(BRAND.md 원칙), 오너가 **중앙 고정**으로 바꿨다.
      자리를 재면 단지마다 워터마크가 다른 데 앉아 카드가 매번 달라 보인다 — 정기물에는
      그게 더 나쁘다. 대신 **흰색 + 모든 데이터 아래**라 무엇을 밟아도 가려지지 않는다.

   기울기는 손으로 찍지 않는다. **판 자신의 대각선 각도**를 쓰고, 크기는 그 각도로
   돌린 글자 상자가 판 안에 들어가는 **최대치**를 계산해 쓴다 — 판 비율이 바뀌어도 따라온다. */
function centerStamp(text) {
  const MARGIN = 24;
  const deg = (Math.atan2(VB_H, VB_W) * 180) / Math.PI; // 판 대각선
  const th = (deg * Math.PI) / 180;
  const availW = VB_W - MARGIN * 2;
  const availH = VB_H - MARGIN * 2;
  /* 돌린 글자 상자의 외접 크기:  W' = w·cosθ + h·sinθ ,  H' = w·sinθ + h·cosθ
     (w = 글자 폭 = len·size·0.62, h = size) → size 에 대해 1차식이라 바로 풀린다. */
  const k = text.length * 0.62;
  const perW = k * Math.cos(th) + Math.sin(th);
  const perH = k * Math.sin(th) + Math.cos(th);
  const size = Math.floor(Math.min(availW / perW, availH / perH));
  if (size < 40) return null; // 이만큼도 안 들어가면 안 붙인다
  return {
    x: r2(VB_W / 2),
    y: r2(VB_H / 2 + size * 0.34), // 가운데 정렬 → 베이스라인
    cx: r2(VB_W / 2),
    cy: r2(VB_H / 2),
    size,
    text,
    rotate: -r2(deg), // 오른쪽 위로 올라가는 대각선
  };
}
const stamp = centerStamp("@wirit_note");
if (!stamp) console.warn("ⓘ 판이 작아 워터마크를 생략합니다.");

/* ── 가까운 역 (오너 2026-08-16 "가까운 역을 뱃지로")
   파일이 없으면 **뱃지를 붙이지 않는다.** 내가 아는 역 이름을 적는 건 오보다 —
   `data/apt-station-queue.txt` 에 `kapt=...` 한 줄을 밀어 코드가 재게 한다.
   ⚠️ 거리는 카드에서 뺐다(오너 2026-08-16) — 노선과 역 이름만 알약 하나에 담는다. */
let station = null;
let stationRaw = null; // 뱃지를 생략하더라도 **잰 값은 meta 에 남긴다**
if (KAPT) {
  const sp = P(`data/datasets/apt-station/${KAPT}.json`);
  if (existsSync(sp)) {
    const st = JSON.parse(readFileSync(sp, "utf8"));
    /* ⚠️ 거리를 카드에서 뺐기 때문에(오너 2026-08-16) 뱃지는 **"가깝다"는 말**이 된다.
       그러면 먼 역을 붙이는 순간 그 자체가 과장이다 — 반정아이파크캐슬5단지는
       가장 가까운 역이 1,614m 였다(걸어서 20분 이상). 그건 역세권이라 부를 거리가 아니다.
       그래서 **직선 1,000m 를 넘으면 뱃지를 안 붙인다.** 수집은 그대로 남는다(meta 에 기록). */
    const MAX_BADGE_M = 1000;
    stationRaw = { name: st.station, lines: st.lines ?? [], distanceM: st.distanceM };
    if (st.distanceM != null && st.distanceM > MAX_BADGE_M) {
      console.warn(
        `ⓘ 가장 가까운 역이 ${st.station} ${st.distanceM}m — ${MAX_BADGE_M}m 를 넘어 뱃지를 생략합니다.`,
      );
      station = null;
    } else {
      station = { name: st.station, lines: st.lines ?? [], distanceM: st.distanceM };
    }
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
/* 주차대수 — **세대당 몇 대**로 적는다(오너 2026-08-16 "주차대수 0.0대").
   ⚠️ 총 대수만 적으면 큰 단지가 무조건 좋아 보인다. 사람이 궁금한 건 "내 차 댈 데 있나"다.
   ⚠️ 자료가 없으면 **줄을 안 붙인다.** 짐작해 적는 순간 오보다 —
      `data/apt-detail-queue.txt` 에 `kapt=...` 한 줄을 밀어 코드가 받게 한다. */
let parking = null;
if (KAPT && kapt?.hhld > 0) {
  const dp = P(`data/datasets/apt-detail/${KAPT}.json`);
  if (existsSync(dp)) {
    const d = JSON.parse(readFileSync(dp, "utf8"));
    if (d.parkTotal > 0) parking = { ...d, perHhld: d.parkTotal / kapt.hhld };
  } else {
    console.warn(
      `ⓘ 주차대수 자료가 없어 그 줄을 생략합니다. 붙이려면:\n` +
        `   data/apt-detail-queue.txt 에  kapt=${KAPT}  한 줄을 쓰고 푸시`,
    );
  }
}
const specBot = [`전용 ${hit.area}㎡`, `${hit.floor}층`];
/* 오너 지시는 "전용면적·층수 **아래**" — 같은 줄에 붙이지 않고 셋째 줄로 세운다. */
const specPark = parking ? `세대당 주차 ${parking.perHhld.toFixed(1)}대` : null;
const spec = [specTop.join(SEP), specBot.join(SEP), specPark].filter((x) => x);

const card = {
  template: "singo-record@1",
  date: DATE,
  /* 킥커 — 오너 지정 문구(2026-08-13). 돌파가 아니면 '클럽 가입'이라 부를 수 없다. */
  /* ⚠️ 날짜는 **계약일**이다(오너 2026-08-16b 지시). 발행일을 적었더니 "오늘 팔린 값"으로
     읽혔는데, 실제 계약은 2026-07-19 였다 — 실거래는 계약 후 신고까지 시차가 있어
     발행일과 늘 어긋난다. '계약' 두 글자를 앞에 붙여 무슨 날짜인지 자체가 말하게 한다. */
  kicker: hit.milestone
    ? `오늘의 ${hit.milestone}억 클럽 (계약 ${dot2(hit.date)})`
    : `오늘의 신고가 (계약 ${dot2(hit.date)})`,
  /* 제목 — 지역은 회색으로 물러나고 단지·평형만 잉크. */
  /* 평형은 코발트(오너 2026-08-16b). 지역=회색, 단지명=잉크, 평형=코발트로 셋이 갈려
     한 줄 안에서 "어디 · 무엇 · 어느 평형"이 눈으로 끊긴다. */
  title: aptStartsWithRegion
    ? `${hit.aptNm} <span class="py">${hit.pyeong}</span>`
    : `<span class="rg">${guShort}</span> ${hit.aptNm} <span class="py">${hit.pyeong}</span>`,
  station,
  price: eok(hit.priceManwon),
  /* 가격 옆 한 마디 — 오너 지시(2026-08-16b, 자리에 있던 워터마크를 이걸로 바꿨다).
     ⚠️ **돌파일 때만 붙인다.** 선을 넘지 않은 그냥 신고가에 "달성!"은 말이 안 된다. */
  priceSuffix: hit.milestone ? "달성!" : null,
  spec,
  chart: { vb: `0 0 ${VB_W} ${VB_H}`, bg, stamp, threshold, prevLine, lowLine, brkHi, brkLo, paths: chartPaths, dots, axis, old, lowDot, dot },
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
      : stationRaw
        ? {
            ...stationRaw,
            note: `가장 가까운 역이 직선 ${stationRaw.distanceM}m 로 1,000m 를 넘어 **뱃지를 붙이지 않았다.** 거리를 안 싣는 판형이라 먼 역을 붙이면 그 자체가 과장이 된다.`,
          }
        : { note: "가까운 역 자료 없음 — 뱃지를 붙이지 않았다." },
    hhld: kapt
      ? {
          kaptCode: KAPT,
          kaptName: kapt.name,
          hhld: kapt.hhld,
          addr: kapt.addr,
          /* ⚠️ 예전엔 여기에 "오너가 2026-08-13 확인했다"가 **단지와 무관하게 박혀** 있었다.
             그 카드에서만 참인 말이 모든 카드에 붙으면, 다음 검수가 있지도 않은 확인을
             근거로 삼는다(2026-08-16b 검수가 잡았다). **이 실행에서 참인 것만 적는다.** */
          note:
            `공동주택 대장 값. 실거래 표기(${hit.aptNm})와 대장 표기(${kapt.name})가 달라 ` +
            `**이름으로 자동 매칭하지 않고 --kapt ${KAPT} 로 사람이 짚었다.** ` +
            `대조 근거: 실거래 지번 ${hit.umdNm} ${hit.jibun ?? "(지번 없음)"} ↔ 대장 주소 ${kapt.addr}`,
        }
      : { note: "세대수는 싣지 않는다 — 대장 항목을 짚지 않았다(--kapt 미지정)." },
    parking: parking
      ? {
          ground: parking.parkGround,
          under: parking.parkUnder,
          total: parking.parkTotal,
          hhld: kapt.hhld,
          perHhld: Number(parking.perHhld.toFixed(3)),
          note: "국토교통부 공동주택 **상세**정보(지상+지하). 세대당 = 총 대수 ÷ 대장 세대수.",
        }
      : { note: "주차대수 자료 없음 — 그 줄을 붙이지 않았다(data/apt-detail-queue.txt 에 kapt 를 밀면 받는다)." },
    /* 워터마크 자리를 남긴다 — 손으로 찍지 않았다는 증거이자, 다음에 곡선이 바뀌어
       자리가 옮겨졌을 때 "왜 옮겼나"를 대조할 수 있는 값이다. */
    stamp: stamp
      ? { ...stamp, note: "BRAND.md 슬롯 C. 판을 격자로 훑어 잉크에서 가장 먼 칸을 골랐다(clear = 잉크까지 거리 px)." }
      : { note: "판에 빈 자리가 없어 워터마크를 붙이지 않았다(BRAND.md 슬롯 C 조건 ③)." },
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
