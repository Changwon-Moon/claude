/**
 * 수도권 학군지 — 좌: 급지별 3개 표(급지 안에서 국평 시세 순, 번호는 표마다 1번부터)
 *                 우: 수도권 시군구 지도(토허제 면 + 급지색 번호 핀).
 *
 * 오너가 2026-09-01 에 **연결선 없는 판본**으로 확정했다(19줄이 흩어진 핀으로 가느라 선이 엇갈렸다).
 * 연결선 판본과 그 좌표 계산 코드는 이 커밋에서 지웠다 — git 이 보관한다.
 *
 * 소재: claude/소재-학군지도-2026-09-01.md
 * 급지 분류: data/datasets/hakgun-districts-2026.json (『대한민국 학군지도』 인용 · verified:false)
 * 가격     : data/datasets/molit/*.json (국토부 실거래 · verified:true) — **여기서 코드가 계산한다**
 * 허가구역 : data/datasets/tohuh-2026.json
 *
 * ⚠️ 손으로 적은 숫자 0개. 중위가·거래건수·허가구역 여부·핀 좌표 전부 계산값이다.
 *
 * ⚠️ 판형 치수(LAYOUT)는 **여기 한 곳**에만 있다. 템플릿은 이 값을 CSS 변수로 받아 쓴다.
 *    표가 본문보다 길어지면 빌더가 던진다 — 안 던지면 표가 아래 요소를 조용히 밟는다.
 *
 * 실행: node scripts/build-hakgun-map.mjs [date=오늘] [--publish]
 * 출력: data/content/{date}/hakgun-map.json
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
// bodyH 는 1350 에서 머리(여백 72 + 로고 라인 32 + 제목 85 + 부제 53) · 본문 위 여백 14 ·
// 푸터 94 를 뺀 나머지다. 이 계산이 어긋나면 표가 아래 요소를 밟는다(2026-09-01 실제로 밟았다).
const LAYOUT = {
  bodyW: 936, bodyH: 975,
  tableW: 372, gutter: 26,
  rowH: 43, hdrH: 36, grpGap: 16,
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

// ── 6. 표가 본문에 들어가는지 잰다 ──────────────────────────────────
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

// ── 7. 카드 ──────────────────────────────────────────────────────────
const base = {
  template: "hakgun-map@1",
  date,
  title: '수도권 <span class="hi">학군지</span> 등급 &amp; 국평 시세',
  subtitle: "『대한민국 학군지도』 급지분류 · 국토부 실거래 전용 84㎡ 중위값",
  mapSvg,
  groups,
  rows: flat,
  layout: LAYOUT,
  legend: { hit: "토지거래허가구역", off: "미지정", g1: "1급지", g2: "2급지", g3: "3급지" },
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
writeFileSync(join(outDir, "hakgun-map.json"), JSON.stringify(base, null, 2) + "\n", "utf8");

const outCnt = flat.filter((r) => !r.tohuh).length;
console.log(`✅ hakgun-map — 급지 ${groups.map((g) => `${g.label} ${g.rows.length}곳`).join(" · ")}`);
console.log(`   실거래 ${rows.length.toLocaleString("ko-KR")}건 · ${period} · 비규제 ${outCnt}곳 · 표 높이 ${usedH}/${LAYOUT.bodyH}px`);
console.log(`   → ${outDir}/hakgun-map.json${publish ? "" : "  ※ --publish 없이 스파이크"}`);
