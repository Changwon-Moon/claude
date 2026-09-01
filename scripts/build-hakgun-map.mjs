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

// ── 판형 치수 — 카드 세로 1350 을 여기서 전부 나눈다 ────────────────
// 머리(여백·로고라인·제목)와 푸터를 뺀 나머지가 본문이고, 본문 높이는 **지도 높이가 정한다**
// (오너 2026-09-01: 표 세로를 지도에 맞추고, 범례는 지도 바로 밑에).
// 남는 아래 여백이 MIN_BOTTOM_GAP 보다 좁으면 던진다 — 푸터에 붙는 사고를 두 번 냈다.
const CARD_H = 1350;
const HEAD = { padTop: 72, topcap: 32, titleGap: 24, titleFs: 76, bodyGap: 22 };
HEAD.titleH = Math.round(HEAD.titleFs * 1.08);
const FOOTER_H = 94;
const LEGEND_H = 32, LEGEND_GAP = 10;
const MIN_BOTTOM_GAP = 40;

const LAYOUT = {
  bodyW: 936,
  tableW: 272, gutter: 16,        // 표는 내용 폭까지만. 남는 폭은 전부 지도가 가져간다
  hdrH: 36, grpGap: 16,
  legendH: LEGEND_H, legendGap: LEGEND_GAP,
  titleFs: HEAD.titleFs, titleGap: HEAD.titleGap, bodyGap: HEAD.bodyGap,
};
LAYOUT.mapX = LAYOUT.tableW + LAYOUT.gutter;

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

// ── 3-b. 지방 학군지 10곳 — 지도에는 안 찍고 값만 낸다 ─────────────
// 지도는 수도권만 그린다(토허제·한강이 얹힌 판이라 전국으로 못 바꾼다).
// 그래서 지방은 핀 없이 **지도 좌하단 별도 블록**에 값만 적는다(오너 2026-09-01).
const jibangCalc = (ds.jibangAreas || []).map((a) => {
  const codes = [a.sggCd, ...(a.alsoSggCd || [])];
  const sel = rows.filter(
    (r) => codes.includes(r.sggCd) && a.dongs.includes(r.umdNm) && r.area >= AREA_MIN && r.area <= AREA_MAX,
  );
  if (sel.length < MIN_TRADES)
    throw new Error(`${a.name}(지방): 국평 거래가 ${sel.length}건뿐입니다(최소 ${MIN_TRADES}건). 수집이 끝났는지 확인하세요.`);
  return { ...a, n: sel.length, med: median(sel.map((r) => r.priceManwon)) };
});
jibangCalc.sort((x, y) => x.grade - y.grade || y.med - x.med);

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
// NUDGE = 핀이 실제로 붙어 있어 번호를 못 읽는 쌍만 **핀**을 밀어 준다(지도 viewBox 좌표).
// 위치를 지어내는 게 아니라 겹침만 푼다 — 평촌(안양 호계)과 산본(군포)은 실제로 2km 거리다.
const NUDGE = { 평촌: { dx: 17 }, 산본: { dx: -17 } };
// ⚠️ 이름표 자리는 **손으로 정하지 않는다.** sudogwonMapSvg 가 핀 둘레 후보 중
//    아무것과도 안 겹치는 자리를 골라 놓고, 놓은 뒤 전수로 다시 잰다.
//    손으로 정하던 시절에 사람이 놓친 겹침이 세 번 나갔다(2026-09-01).
const { svg: mapSvg, resolved, collisions, viewBox } = sudogwonMapSvg({
  pins: flat.map((r) => {
    const a = calc.find((x) => x.name === r.key);
    return { n: r.n, key: r.key, label: r.name, geoName: a.geoName, pinDong: a.pinDong, grade: r.grade, ...(NUDGE[r.key] || {}) };
  }),
  hitSgg,
  showLabels: true,
  // 가로 여백을 좁게 — 인천을 넣으며 동서로 넓어진 지도를 다시 세로로 세운다.
  // 지도가 납작하면 옆 표의 행 높이가 눌린다(빌더가 rowH 26px 로 던졌다).
  focusPadX: 0.03,
});
for (const r of resolved) if (r.by === "sgg") console.log(`  ⚠️ ${r.label} — 동(${r.dong})을 못 찾아 시군구 중심에 찍었습니다.`);
// 배치기가 자리를 못 찾았거나, 놓고 나서 잰 결과가 겹치면 여기서 멈춘다.
// 겹친 이름표는 그림에서 '사라진 것'처럼 보이므로 조용한 실패다.
if (collisions.length)
  throw new Error(
    `지도 이름표 배치에 실패했습니다 (${collisions.length}건):\n  · ${collisions.join("\n  · ")}\n` +
      `  → 후보 자리를 넓히거나(sudogwon-map.mjs candidates/ring), 지도를 키우거나, 핀을 NUDGE 로 벌리세요.`,
  );

// ── 6. 표가 본문에 들어가는지 잰다 ──────────────────────────────────
// 지도는 남은 폭을 전부 쓴다. 본문 높이는 지도 + 범례로 정해진다.
const mapW = LAYOUT.bodyW - LAYOUT.mapX;
const mapH = (mapW * viewBox.h) / viewBox.w;
LAYOUT.mapW = Math.round(mapW * 10) / 10;
LAYOUT.mapH = Math.round(mapH * 10) / 10;
LAYOUT.mapY = 0;                       // 지도와 표를 같은 높이에서 시작한다
// 지방 블록 — 지도 좌하단의 빈 바다 자리(오너가 그 자리를 지정했다).
// 치수도 여기서 정해 템플릿이 CSS 변수로 받는다.
LAYOUT.jbW = Math.round(mapW * 0.46);
LAYOUT.jbX = Math.round(LAYOUT.mapX + mapW * 0.105);   // 살짝 우측으로(오너 2026-09-01)
LAYOUT.jbY = Math.round(mapH * 0.70);                  // 더 아래로 — 빈 바다 한가운데에 앉힌다
LAYOUT.bodyH = Math.round(mapH + LEGEND_GAP + LEGEND_H);

// 표 세로를 지도 세로에 맞춘다 — 행 높이를 거기서 역산한다.
LAYOUT.rowH = Math.floor((mapH - 3 * LAYOUT.hdrH - 2 * LAYOUT.grpGap) / flat.length);
if (LAYOUT.rowH < 30) throw new Error(`행 높이가 ${LAYOUT.rowH}px 로 너무 낮습니다 — 지도가 작거나 학군지가 너무 많습니다.`);

const headH = HEAD.padTop + HEAD.topcap + HEAD.titleGap + HEAD.titleH + HEAD.bodyGap;
const bottomGap = CARD_H - (headH + LAYOUT.bodyH + FOOTER_H);
if (bottomGap < MIN_BOTTOM_GAP)
  throw new Error(
    `본문이 푸터에 붙습니다(아래 여백 ${bottomGap}px < ${MIN_BOTTOM_GAP}px). ` +
      `머리 ${headH} + 본문 ${LAYOUT.bodyH} + 푸터 ${FOOTER_H} = ${headH + LAYOUT.bodyH + FOOTER_H} / ${CARD_H}. ` +
      `표 폭을 넓혀 지도를 줄이거나 제목을 줄이세요.`,
  );

let offset = 0;
const rowY = new Map();
for (const g of groups) {
  offset += LAYOUT.hdrH;
  g.rows.forEach((r, i) => rowY.set(r.key, offset + (i + 0.5) * LAYOUT.rowH));
  offset += g.rows.length * LAYOUT.rowH + LAYOUT.grpGap;
}
const usedH = offset - LAYOUT.grpGap;
if (usedH > LAYOUT.mapH + 4)
  throw new Error(`표(${usedH}px)가 지도(${LAYOUT.mapH}px)보다 깁니다. 행 높이 역산을 확인하세요.`);

// ── 7. 카드 ──────────────────────────────────────────────────────────
const base = {
  template: "hakgun-map@1",
  date,
  title: `수도권 <span class="hi">학군지 ${flat.length}곳</span>, 국평 시세`,   // 곳 수는 데이터에서 — 손으로 적으면 어긋난다
  subtitle: "『대한민국 학군지도』 급지분류 · 국토부 실거래 전용 84㎡ 중위값",
  mapSvg,
  groups,
  rows: flat,
  layout: LAYOUT,
  legend: { hit: "토지거래허가구역", off: "미지정", g1: "1급지", g2: "2급지", g3: "3급지" },
  jibang: {
    label: `지방 학군지 ${jibangCalc.length}곳`,
    note: "지도에는 수도권만",
    rows: jibangCalc.map((a) => ({ name: a.name, grade: a.grade, price: (a.med / 10000).toFixed(2), trades: a.n.toLocaleString("ko-KR") })),
  },
  source: { name: "국토부 실거래가 · 『대한민국 학군지도』", period, verified: false },
  provenance: {
    trades: rows.length,
    jibang: jibangCalc.map((a) => `${a.name} ${a.n}건`),
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
