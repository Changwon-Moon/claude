/**
 * 수도권 학군지 — 좌: 급지별 3개 표(급지 안에서 국평 시세 순, 번호는 표마다 1번부터)
 *                 우: 수도권 시군구 지도(토허제 면 + 급지색 번호 핀).
 *
 * 두 판본을 만든다(오너 2026-09-01):
 *   · hakgun-map        — 연결선 없음
 *   · hakgun-map-lines  — 표의 각 행과 지도 핀을 잇는 꺾은 선 있음
 *
 * 소재: claude/소재-학군지도-2026-09-01.md
 * 급지 분류: data/datasets/hakgun-districts-2026.json (『대한민국 학군지도』 인용 · verified:false)
 * 가격     : data/datasets/molit/*.json (국토부 실거래 · verified:true) — **여기서 코드가 계산한다**
 * 허가구역 : data/datasets/tohuh-2026.json
 *
 * ⚠️ 손으로 적은 숫자 0개. 중위가·거래건수·허가구역 여부·핀 좌표·연결선 좌표 전부 계산값이다.
 *
 * ⚠️ 판형 치수(LAYOUT)는 **여기 한 곳**에만 있다. 템플릿은 이 값을 CSS 변수로 받아 쓴다 —
 *    연결선은 표 행과 지도 핀의 픽셀 위치를 둘 다 알아야 그릴 수 있는데, 그 값이 CSS 와
 *    빌더 두 곳에 있으면 반드시 갈라진다. 갈라지면 선이 엉뚱한 데 꽂히고 그건 조용하다.
 *
 * 실행: node scripts/build-hakgun-map.mjs [date=오늘] [--publish]
 * 출력: data/content/{date}/hakgun-map.json · hakgun-map-lines.json
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sudogwonMapSvg } from "./lib/sudogwon-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;
const publish = process.argv.includes("--publish");

const AREA_MIN = 79, AREA_MAX = 86; // 전용 84㎡대(국민평형) = 통칭 34평
const MIN_TRADES = 20;              // 이보다 적으면 중위값이 흔들린다 — 던진다

// ── 판형 치수(카드 안쪽 936px 기준) ─────────────────────────────────
// bodyH 는 1350 에서 머리(로고를 피한 여백 112 + 제목 82 + 부제 55) · 본문 위 여백 14 ·
// 각주 2줄 57 · 푸터 94 를 뺀 나머지다. 이 계산이 어긋나면 표가 각주를 밟는다(2026-09-01 실제로 밟았다).
const LAYOUT = {
  bodyW: 936, bodyH: 936,
  tableW: 372, gutter: 26,
  rowH: 41, hdrH: 36, grpGap: 16,
};
LAYOUT.mapX = LAYOUT.tableW + LAYOUT.gutter;
LAYOUT.mapW = LAYOUT.bodyW - LAYOUT.mapX;

const J = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

// ── 1. 실거래 전량 적재 ──────────────────────────────────────────────
const MOLIT = join(ROOT, "data/datasets/molit");
const files = readdirSync(MOLIT).filter((f) => /^\d{5}-\d{6}\.json$/.test(f));
if (!files.length) throw new Error("실거래 데이터가 없습니다 — data/datasets/molit 이 비었습니다.");
const rows = [];
const months = new Set();
for (const f of files) {
  const j = JSON.parse(readFileSync(join(MOLIT, f), "utf8"));
  if (j.meta?.verified !== true) throw new Error(`verified:true 가 아닌 실거래 파일: ${f}`);
  months.add(j.meta.dealYmd);
  for (const t of j.trades || []) if (!t.canceled) rows.push(t);
}
const ms = [...months].sort();
const period = `${ms[0].slice(0, 4)}.${ms[0].slice(4)}~${ms.at(-1).slice(4)}`;

// ── 2. 허가구역 집합 ─────────────────────────────────────────────────
const th = J("data/datasets/tohuh-2026.json");
const hitSgg = new Set([...th.seoul.areas, ...th.newly.areas, ...th.existing.areas].map((a) => a.geoName));

// ── 3. 학군지별 국평 중위가 ─────────────────────────────────────────
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const ds = J("data/datasets/hakgun-districts-2026.json");
const calc = ds.areas.map((a) => {
  const sel = rows.filter(
    (r) => r.sggCd === a.sggCd && a.dongs.includes(r.umdNm) && r.area >= AREA_MIN && r.area <= AREA_MAX,
  );
  if (sel.length < MIN_TRADES)
    throw new Error(`${a.name}: 국평 거래가 ${sel.length}건뿐입니다(최소 ${MIN_TRADES}건). 중위값을 낼 수 없습니다.`);
  return { ...a, n: sel.length, med: median(sel.map((r) => r.priceManwon)), tohuh: hitSgg.has(a.geoName) };
});

// ── 4. 급지별로 나누고, 급지 안에서 값 순으로 번호를 새로 매긴다 ────
const GRADES = [1, 2, 3];
const groups = GRADES.map((g) => {
  const list = calc.filter((a) => a.grade === g).sort((x, y) => y.med - x.med);
  if (!list.length) throw new Error(`${g}급지에 학군지가 하나도 없습니다 — 데이터셋을 확인하세요.`);
  return {
    grade: g,
    label: `${g}급지`,
    rows: list.map((a, i) => ({
      n: i + 1,
      key: a.name,
      name: a.name,
      grade: g,
      price: (a.med / 10000).toFixed(2),
      trades: a.n.toLocaleString("ko-KR"),
      tohuh: a.tohuh,
    })),
  };
});
const flat = groups.flatMap((g) => g.rows);
if (flat.length !== calc.length) throw new Error("급지로 나눈 뒤 개수가 달라졌습니다 — 급지 값을 확인하세요.");

// ── 5. 지도 ──────────────────────────────────────────────────────────
// NUDGE = 핀이 실제로 붙어 있어 번호를 못 읽는 쌍만 라벨을 밀어 준다(지도 viewBox 좌표).
// 위치를 지어내는 게 아니라 겹침만 푼다 — 평촌(안양 호계)과 산본(군포)은 실제로 2km 거리다.
const NUDGE = { 평촌: { dx: 17 }, 산본: { dx: -17 } };
const { svg: mapSvg, resolved, pinsXY, viewBox } = sudogwonMapSvg({
  pins: flat.map((r) => {
    const a = calc.find((x) => x.name === r.key);
    return { n: r.n, key: r.key, label: r.name, geoName: a.geoName, pinDong: a.pinDong, grade: r.grade, ...(NUDGE[r.key] || {}) };
  }),
  hitSgg,
});
for (const r of resolved) if (r.by === "sgg") console.log(`  ⚠️ ${r.label} — 동(${r.dong})을 못 찾아 시군구 중심에 찍었습니다.`);

// ── 6. 표 행 ↔ 지도 핀 연결선(꺾은 선) ──────────────────────────────
// 표 행의 세로 위치와 지도 핀의 카드 픽셀 위치를 **둘 다 계산해서** 잇는다.
const s = LAYOUT.mapW / viewBox.w;                 // 지도 viewBox → 카드 픽셀 배율
const mapH = viewBox.h * s;
const mapY = Math.max(0, (LAYOUT.bodyH - mapH) / 2);
LAYOUT.mapY = Math.round(mapY * 10) / 10;
LAYOUT.mapH = Math.round(mapH * 10) / 10;

let offset = 0;
const rowY = new Map();
for (const g of groups) {
  offset += LAYOUT.hdrH;
  g.rows.forEach((r, i) => rowY.set(r.key, offset + (i + 0.5) * LAYOUT.rowH));
  offset += g.rows.length * LAYOUT.rowH + LAYOUT.grpGap;
}
const usedH = offset - LAYOUT.grpGap;
if (usedH > LAYOUT.bodyH)
  throw new Error(`표가 본문보다 깁니다(${usedH}px > ${LAYOUT.bodyH}px). rowH/hdrH 를 줄이세요.`);

const PIN_R = 22 * s;
// 핀을 카드 좌표로 한 벌 더 만든다 — 연결선 판본에서 **선 위에** 다시 그리기 위해서다.
// 지도 안의 핀과 좌표가 같으므로 겹쳐도 어긋나 보이지 않는다. 안 그러면 선이 번호를 덮는다.
const pinsCard = flat.map((r) => {
  const p = pinsXY.find((x) => x.key === r.key);
  return { n: r.n, grade: r.grade, x: (LAYOUT.mapX + p.x * s).toFixed(1), y: (LAYOUT.mapY + p.y * s).toFixed(1) };
});
// 겹쳐 그리는 핀은 지도 안의 핀과 **완전히 같은 치수**여야 한다 — 지도는 viewBox 단위(반지름 22,
// 흰 테두리 3.5, 글자 24)로 그리므로 배율 s 를 곱해 카드 단위로 옮긴다. 안 맞추면 흰 링만 두꺼워져
// 핀이 두 개 겹친 것처럼 보인다(2026-09-01 실제로 그렇게 보였다).
const r1 = (v) => Math.round(v * 100) / 100;
LAYOUT.pinR = r1(PIN_R);
LAYOUT.pinStroke = r1(3.5 * s);
LAYOUT.pinFont = r1(24 * s);

const leaders = flat.map((r) => {
  const p = pinsXY.find((x) => x.key === r.key);
  if (!p) throw new Error(`핀을 못 찾았습니다: ${r.key}`);
  const y0 = rowY.get(r.key);
  const x0 = LAYOUT.tableW + 3;
  const x1 = LAYOUT.tableW + 13;          // 표에서 나오는 짧은 가로 토막
  const px2 = LAYOUT.mapX + p.x * s;
  const py2 = LAYOUT.mapY + p.y * s;
  const dx = px2 - x1, dy = py2 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const ex = px2 - (dx / len) * (PIN_R + 2);   // 핀 테두리에서 멈춘다
  const ey = py2 - (dy / len) * (PIN_R + 2);
  return {
    grade: r.grade,
    d: `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y0.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`,
    dotX: x0.toFixed(1), dotY: y0.toFixed(1),
  };
});

// ── 7. 카드 두 판본 ──────────────────────────────────────────────────
const base = {
  template: "hakgun-map@1",
  date,
  title: "수도권 학군지 19곳 34평 시세",
  subtitle: "『대한민국 학군지도』 급지분류 · 국토부 실거래 전용 84㎡ 중위값",
  mapSvg,
  groups,
  rows: flat,
  layout: LAYOUT,
  legend: { hit: "토지거래허가구역", off: "미지정", g1: "1급지", g2: "2급지", g3: "3급지" },
  caveat:
    `인천·지방 학군지는 실거래 수집 범위 밖이라 뺐습니다. 급지는 『대한민국 학군지도』 분류이고, ` +
    `값은 국토부 실거래 ${period}(전용 ${AREA_MIN}~${AREA_MAX}㎡)을 코드가 집계한 중위값입니다. 번호는 급지별로 새로 매겼습니다.`,
  source: { name: "국토부 실거래가 · 『대한민국 학군지도』", period, verified: false },
  provenance: {
    trades: rows.length,
    months: ms,
    areaFilter: `전용 ${AREA_MIN}~${AREA_MAX}㎡`,
    stat: "median",
    numbering: "급지별 1부터",
    pinResolution: resolved,
  },
};

const outDir = publish ? join(ROOT, `data/content/${date}`) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
const variants = [
  ["hakgun-map", { ...base, leaders: null, pinsCard: null }],
  ["hakgun-map-lines", { ...base, leaders, pinsCard }],
];
for (const [name, doc] of variants)
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(doc, null, 2) + "\n", "utf8");

const outCnt = flat.filter((r) => !r.tohuh).length;
console.log(`✅ hakgun-map — 급지 ${groups.map((g) => `${g.label} ${g.rows.length}곳`).join(" · ")}`);
console.log(`   실거래 ${rows.length.toLocaleString("ko-KR")}건 · ${period} · 비규제 ${outCnt}곳 · 표 높이 ${usedH}/${LAYOUT.bodyH}px`);
console.log(`   → ${outDir}/hakgun-map.json (선 없음) · hakgun-map-lines.json (선 있음)${publish ? "" : "  ※ --publish 없이 스파이크"}`);
