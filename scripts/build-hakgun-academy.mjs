/**
 * 학군지 학원 지도 — 「급지 카드」의 2장째(오너 2026-09-02 "2장 세트로").
 *
 * 1장(hakgun-map)은 **값**을, 이 장은 **학원 수**를 같은 21곳·같은 지도에 얹는다.
 * 두 장을 나란히 놓으면 「급지 ≠ 값 ≠ 학원」이 한눈에 보인다.
 *
 * ⚠️ 1장과 달리 **학원 수 순으로 새로 번호를 매긴다.** 핀 색은 급지 그대로다 —
 *    2번 자리에 회색(3급지) 핀이 서는 것이 이 카드의 전부다(동탄).
 *
 * 세는 기준: 분야 「입시·검정 및 보습」의 **학원**만. 교습소는 뺀다(오너 2026-09-02).
 *   교습소는 1인 운영·일시수용 9명 상한이라 대형 학원과 한 줄로 세면 동네마다 다른 것을 센다
 *   — 실측으로 교습소 비중이 대치 24% · 목동 50% · 수성 52% 로 갈렸다.
 * 정원(TOFOR_SMTOT)은 **쓰지 않는다.** 곳당 61~660명으로 11배 벌어져 규모로 못 읽는다.
 *
 * 소재: claude/자료-학원수집-NEIS-2026-09-02.md
 * 데이터: data/datasets/neis-academy/*.json (나이스 · verified:true)
 *         data/datasets/hakgun-districts-2026.json (급지·법정동 정의)
 *
 * 실행: node scripts/build-hakgun-academy.mjs [date=오늘] [--publish]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sudogwonMapSvg } from "./lib/sudogwon-map.mjs";
import { loadAcademyRows, countArea, lawdNameTable } from "./lib/hakgun-academy.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;
const publish = process.argv.includes("--publish");

// ── 판형 — 1장과 같은 머리·푸터 규격. 표는 한 덩어리(급지별로 나누지 않는다) ──
const CARD_H = 1350;
const HEAD = { padTop: 72, topcap: 32, titleGap: 24, titleFs: 76, bodyGap: 56 };
HEAD.titleH = Math.round(HEAD.titleFs * 1.08);
const FOOTER_H = 94;
const LEGEND_H = 32, LEGEND_GAP = 10;
const MIN_BOTTOM_GAP = 40;

const LAYOUT = {
  bodyW: 936,
  tableW: 272, gutter: 16,
  legendH: LEGEND_H, legendGap: LEGEND_GAP,
  titleFs: HEAD.titleFs, titleGap: HEAD.titleGap, bodyGap: HEAD.bodyGap,
};
LAYOUT.mapX = LAYOUT.tableW + LAYOUT.gutter;

const J = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const ds = J("data/datasets/hakgun-districts-2026.json");
const th = J("data/datasets/tohuh-2026.json");
const hitSgg = new Set([...th.seoul.areas, ...th.newly.areas, ...th.existing.areas].map((a) => a.geoName));

// ── 1. 학원 수 ───────────────────────────────────────────────────────
const { rows: acaRows, sido } = loadAcademyRows(ROOT);
const nameOfLawd = lawdNameTable(ROOT);

const count = (a) => {
  const c = countArea(a, acaRows, nameOfLawd);
  if (c.aca === 0)
    throw new Error(
      `${a.name}: 입시·보습 학원이 0곳입니다. 시군구 이름이 안 맞거나(주소 표기), ` +
        `법정동 목록에 행정동이 섞였을 수 있습니다 — 잡힌 동: ${c.dongsHit.join(",") || "없음"}`,
    );
  // 학군지 정의의 동 중 원장에 하나도 없는 동은 알린다. 행정동이 섞여 있다는 신호다.
  const missing = a.dongs.filter((d) => !c.dongsHit.includes(d));
  if (missing.length) console.log(`  ⚠️ ${a.name} — 원장에 없는 동: ${missing.join(", ")} (행정동일 수 있습니다)`);
  return { ...a, ...c };
};

const calc = ds.areas.map(count);
const jibangCalc = (ds.jibangAreas || []).map(count);

// 학원 수 내림차순. 같으면 이름순으로 못박아 **다시 돌려도 같은 그림**이 나오게 한다.
calc.sort((x, y) => y.aca - x.aca || x.name.localeCompare(y.name, "ko"));
jibangCalc.sort((x, y) => y.aca - x.aca || x.name.localeCompare(y.name, "ko"));

const flat = calc.map((a, i) => ({
  n: i + 1,
  key: a.name,
  name: a.name,
  grade: a.grade,
  aca: a.aca.toLocaleString("ko-KR"),
  tohuh: hitSgg.has(a.geoName),
}));

// 1장과 같은 규칙 — 「광역시 + 학군지」. full 을 뒤집어 만든다(손으로 다시 적지 않는다).
const jibangName = (a) => {
  const m = /^(.+?)\((.+)\)$/.exec(a.full || "");
  if (!m) return a.name;
  if (m[1] !== a.name) throw new Error(`지방 학군지 이름이 어긋납니다: name=${a.name} · full=${a.full}`);
  return `${m[2]} ${m[1]}`;
};
const jibangRows = jibangCalc.map((a) => ({ name: jibangName(a), grade: a.grade, aca: a.aca.toLocaleString("ko-KR") }));

// ── 2. 지도 ─────────────────────────────────────────────────────────
// 핀 위치·이름표 배치·워터마크는 1장과 **같은 모듈**이 한다. 번호만 다르다.
const NUDGE = { 평촌: { dx: 17 }, 산본: { dx: -17 } };
const { svg: mapSvg, resolved, collisions, viewBox, labBoxes, pinsXY, pinR, hitMinXInBand } = sudogwonMapSvg({
  pins: flat.map((r) => {
    const a = calc.find((x) => x.name === r.key);
    return { n: r.n, key: r.key, label: r.name, geoName: a.geoName, pinDong: a.pinDong, grade: r.grade, ...(NUDGE[r.key] || {}) };
  }),
  hitSgg,
  showLabels: true,
  focusPadX: 0.03,
  wm2LeftOf: "산본",
});
for (const r of resolved) if (r.by === "sgg") console.log(`  ⚠️ ${r.label} — 동(${r.dong})을 못 찾아 시군구 중심에 찍었습니다.`);
if (collisions.length)
  throw new Error(`지도 이름표 배치에 실패했습니다 (${collisions.length}건):\n  · ${collisions.join("\n  · ")}`);

// ── 3. 치수 ─────────────────────────────────────────────────────────
const mapW = LAYOUT.bodyW - LAYOUT.mapX;
const mapH = (mapW * viewBox.h) / viewBox.w;
LAYOUT.mapW = Math.round(mapW * 10) / 10;
LAYOUT.mapH = Math.round(mapH * 10) / 10;
LAYOUT.mapY = 0;
LAYOUT.bodyH = Math.round(mapH + LEGEND_GAP + LEGEND_H);

// 표는 머리줄 하나 + 21행. 급지로 나누지 않으므로 행이 넉넉하다.
LAYOUT.hdrH = 36;
LAYOUT.rowH = Math.floor((mapH - LAYOUT.hdrH) / flat.length);
if (LAYOUT.rowH < 30) throw new Error(`행 높이가 ${LAYOUT.rowH}px 로 너무 낮습니다.`);
const usedH = LAYOUT.hdrH + LAYOUT.rowH * flat.length;
if (usedH > LAYOUT.mapH + 4) throw new Error(`표(${usedH}px)가 지도(${LAYOUT.mapH}px)보다 깁니다.`);

// 지방 블록 — 1장과 같은 자리·같은 방식(빈 바다 한가운데). 폭은 가장 긴 행을 재서 정한다.
{
  const NM_FS = 17, VAL_FS = 17;
  const tw = (t, fs) => [...t].reduce((w, ch) => w + (ch === "·" ? 0.45 : /[ ]/.test(ch) ? 0.32 : /[0-9.,]/.test(ch) ? 0.58 : 1), 0) * fs * 0.97 * 1.06;
  const rowW = (r) => 9 + 5 + tw(r.name, NM_FS) + 8 + tw(r.aca, VAL_FS) + tw("곳", 12);
  const colOf = (k) => jibangRows.filter((_, i) => i % 2 === k).map(rowW);
  const col1 = Math.max(...colOf(0)), col2 = Math.max(...colOf(1));
  LAYOUT.jbW = Math.ceil(col1 + col2 + 14 + 11 * 2 + 4);
  if (LAYOUT.jbW > mapW * 0.72) throw new Error(`지방 블록이 너무 넓습니다(${LAYOUT.jbW}px).`);
}
LAYOUT.jbY = Math.round(mapH * 0.79);
{
  const sc = mapW / viewBox.w;
  const jbH = 30 + Math.ceil(jibangRows.length / 2) * 21 + 19;
  LAYOUT.jbH = jbH;
  const hitLeftVb = hitMinXInBand(LAYOUT.jbY / sc, (LAYOUT.jbY + jbH) / sc);
  if (hitLeftVb == null) throw new Error("블록이 앉을 세로 띠에 토허제 면이 없습니다 — jbY 를 확인하세요.");
  LAYOUT.jbCx = Math.round((LAYOUT.mapX + (LAYOUT.mapX + hitLeftVb * sc)) / 2);
  LAYOUT.jbX = Math.round(LAYOUT.jbCx - LAYOUT.jbW / 2);
  if (LAYOUT.jbX < LAYOUT.mapX) throw new Error(`지방 블록이 지도 왼쪽으로 넘칩니다(${LAYOUT.jbX} < ${LAYOUT.mapX}).`);
  const jb = { x0: LAYOUT.jbX, x1: LAYOUT.jbX + LAYOUT.jbW, y0: LAYOUT.jbY, y1: LAYOUT.jbY + jbH };
  const toCard = (b) => ({ x0: LAYOUT.mapX + b.x0 * sc, x1: LAYOUT.mapX + b.x1 * sc, y0: b.y0 * sc, y1: b.y1 * sc });
  const hit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  const hits = [];
  for (const b of labBoxes) if (hit(jb, toCard(b))) hits.push(`이름표 ${b.key}`);
  for (const p of pinsXY) if (hit(jb, toCard({ x0: p.x - pinR, x1: p.x + pinR, y0: p.y - pinR, y1: p.y + pinR }))) hits.push(`핀 ${p.key}`);
  if (hits.length) throw new Error(`지방 블록이 지도를 덮습니다 (${hits.length}건): ${hits.join(" · ")}`);
}

const headH = HEAD.padTop + HEAD.topcap + HEAD.titleGap + HEAD.titleH + HEAD.bodyGap;
const bottomGap = CARD_H - (headH + LAYOUT.bodyH + FOOTER_H);
if (Math.abs(bottomGap - HEAD.bodyGap) > 12)
  console.log(`  ⚠️ 본문 위 여백 ${HEAD.bodyGap}px · 아래 여백 ${bottomGap}px — 어긋납니다.`);
if (bottomGap < MIN_BOTTOM_GAP) throw new Error(`본문이 푸터에 붙습니다(아래 여백 ${bottomGap}px).`);

// ── 4. 카드 ─────────────────────────────────────────────────────────
const collectedAt = [...new Set(sido.map((s) => s.collectedAt))].sort().at(-1);
const minCov = Math.min(...sido.map((s) => s.coverage));

/* 상단 캡션은 **한 줄**이어야 한다. 공용 규격 28px 에 로고 자리를 뺀 746px 가 전부다.
   첫 판이 두 줄로 접혀 머리가 통째로 내려앉았다(2026-09-02) — designQa 는 넘침이 아니라
   줄바꿈이라 못 잡는다. 그래서 **빌더가 글자 폭을 재서** 넘치면 던진다. */
const CAP_BUDGET = 746, CAP_FS = 28;
const capW = (t) =>
  [...t].reduce((w, ch) => w + (/[ ·.]/.test(ch) ? 0.36 : /[0-9A-Za-z()]/.test(ch) ? 0.55 : 1), 0) * CAP_FS * 0.97;
const subtitle = "나이스 학원 원장 · 입시·보습 분야 학원(교습소 제외)";
if (capW(subtitle) > CAP_BUDGET)
  throw new Error(`상단 캡션이 한 줄에 안 들어갑니다(${Math.round(capW(subtitle))}px > ${CAP_BUDGET}px): "${subtitle}"`);

const base = {
  template: "hakgun-academy@1",
  date,
  // 「21곳」은 **학군지 수**다. 학원 수(937곳)와 같은 단위가 카드에 둘 있으므로
  // 제목에서 순서를 바꿔 「학군지 21곳」이 먼저 읽히게 둔다.
  title: `대표 학군지 <span class="hot">${flat.length}곳</span>, <span class="hi">입시학원 수</span>`,
  subtitle,
  mapSvg,
  rows: flat,
  layout: LAYOUT,
  head: { rank: "순위", name: "학군지", val: "학원" },
  legend: { hit: "토지거래허가구역", off: "미지정", g1: "1급지", g2: "2급지", g3: "3급지" },
  jibang: { label: `지방 학군지 ${jibangRows.length}곳`, rows: jibangRows },
  source: { name: "나이스 교육정보 개방 포털 · 『대한민국 학군지도』", period: collectedAt, verified: false },
  provenance: {
    metric: "REALM_SC_NM='입시.검정 및 보습' AND ACA_INSTI_SC_NM='학원'",
    excluded: "교습소(1인 운영·일시수용 9명 상한) 제외",
    jeongwonNote: "정원(TOFOR_SMTOT)은 쓰지 않았다 — 곳당 61~660명으로 신고 편차가 커 규모로 못 읽는다",
    dongCoverageMin: `${minCov}%`,
    sido,
    counts: calc.map((a) => `${a.name} 학원 ${a.aca} · 교습소 ${a.gyoseup} · 정원적힘 ${a.jeongwonPct}%`),
    jibang: jibangCalc.map((a) => `${a.name} 학원 ${a.aca} · 교습소 ${a.gyoseup}`),
    pinResolution: resolved,
    numbering: "학원 수 내림차순 1부터(동수는 이름순)",
  },
};

const outDir = publish ? join(ROOT, `data/content/${date}`) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "hakgun-academy.json"), JSON.stringify(base, null, 2) + "\n", "utf8");

const top = flat[0], bot = flat.at(-1);
console.log(`✅ hakgun-academy — ${flat.length}곳 · ${top.name} ${top.aca}곳 → ${bot.name} ${bot.aca}곳`);
console.log(`   교습소 제외 · 법정동 커버리지 최저 ${minCov}% · 표 높이 ${usedH}/${LAYOUT.bodyH}px · 행 ${LAYOUT.rowH}px`);
console.log(`   → ${outDir}/hakgun-academy.json${publish ? "" : "  ※ --publish 없이 스파이크"}`);
