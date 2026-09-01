/**
 * 수도권 학군지 19곳 — 좌: 급지·34평 중위가 표 / 우: 시군구 지도(토허제 면 + 학군지 번호 핀). (1장 완결)
 *
 * 소재: claude/소재-학군지도-2026-09-01.md
 * 급지 분류: data/datasets/hakgun-districts-2026.json (『대한민국 학군지도』 인용 · verified:false)
 * 가격     : data/datasets/molit/*.json (국토부 실거래 · verified:true) — **여기서 코드가 계산한다**
 * 허가구역 : data/datasets/tohuh-2026.json
 *
 * ⚠️ 손으로 적은 숫자 0개. 중위가·거래건수·허가구역 여부·핀 좌표 전부 계산값이다.
 *
 * 실행: node scripts/build-hakgun-map.mjs [date=오늘] [--publish]
 * 출력: data/content/{date}/hakgun-map.json  (--publish 없으면 data/out/_spike/)
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sudogwonMapSvg } from "./lib/sudogwon-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || kstToday;
const publish = process.argv.includes("--publish");

const AREA_MIN = 79, AREA_MAX = 86; // 전용 84㎡대 = 통칭 34평
const MIN_TRADES = 20;              // 이보다 적으면 중위값이 흔들린다 — 던진다

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

// ── 3. 학군지별 34평 중위가 ─────────────────────────────────────────
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
    throw new Error(`${a.name}: 34평 거래가 ${sel.length}건뿐입니다(최소 ${MIN_TRADES}건). 중위값을 낼 수 없습니다.`);
  return { ...a, n: sel.length, med: median(sel.map((r) => r.priceManwon)), tohuh: hitSgg.has(a.geoName) };
});
calc.sort((x, y) => y.med - x.med);

// ── 4. 지도 ──────────────────────────────────────────────────────────
// NUDGE = 핀이 실제로 붙어 있어 번호를 못 읽는 쌍만 라벨을 밀어 준다(SVG 좌표, 폭 1000 기준).
// 위치를 지어내는 게 아니라 겹침만 푼다 — 평촌(안양 호계)과 산본(군포)은 실제로 2km 거리다.
const NUDGE = { 평촌: { dx: 17 }, 산본: { dx: -17 } };
const { svg: mapSvg, resolved } = sudogwonMapSvg({
  pins: calc.map((a, i) => ({
    n: i + 1, label: a.name, geoName: a.geoName, pinDong: a.pinDong, grade: a.grade, ...(NUDGE[a.name] || {}),
  })),
  hitSgg,
});
for (const r of resolved) if (r.by === "sgg") console.log(`  ⚠️ ${r.label} — 동(${r.dong})을 못 찾아 시군구 중심에 찍었습니다.`);

// ── 5. 계산이 확인한 것만 문장으로 나간다 ────────────────────────────
const out = calc.filter((a) => !a.tohuh);
const outNames = out.map((a) => a.name);
const outRanks = out.map((a) => calc.indexOf(a) + 1);
const insight =
  `학군지 ${calc.length}곳 중 ${calc.length - out.length}곳이 토지거래허가구역 안입니다. ` +
  `밖은 ${outNames.join("·")} ${out.length}곳뿐인데, 값으로는 ${outRanks.join("·")}위입니다.`;

const rowsOut = calc.map((a, i) => ({
  n: i + 1,
  name: a.name,
  grade: a.grade,
  price: (a.med / 10000).toFixed(2),
  trades: a.n.toLocaleString("ko-KR"),
  tohuh: a.tohuh,
}));

const doc = {
  template: "hakgun-map@1",
  date,
  note: "학군지 지도 • 2026",
  title: `수도권 <span class="hi">학군지 19곳</span>,<br/>34평은 얼마인가`,
  subtitle: `『대한민국 학군지도』 급지 분류 · 국토부 실거래 34평(전용 ${AREA_MIN}~${AREA_MAX}㎡) 중위값`,
  mapSvg,
  rows: rowsOut,
  insight,
  caveat:
    `인천(송도·부평·청라)과 지방 학군지는 실거래 수집 범위 밖이라 뺐습니다. ` +
    `급지는 『대한민국 학군지도』 분류이고, 가격은 국토부 실거래 ${period}을 코드가 집계한 중위값입니다. ` +
    `학군지 경계는 행정구역이 아니라 생활권이라 포함 법정동을 데이터셋에 공개합니다.`,
  legend: { hit: "토지거래허가구역", off: "미지정", g1: "1급지", g2: "2급지", g3: "3급지" },
  source: { name: "국토교통부 아파트 매매 실거래가 · 『대한민국 학군지도』", period, verified: false },
  provenance: {
    trades: rows.length,
    months: ms,
    areaFilter: `전용 ${AREA_MIN}~${AREA_MAX}㎡`,
    stat: "median",
    pinResolution: resolved,
  },
};

const outDir = publish ? join(ROOT, `data/content/${date}`) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "hakgun-map.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");
console.log(`✅ hakgun-map — 학군지 ${calc.length}곳 · 실거래 ${rows.length.toLocaleString("ko-KR")}건 · ${period}`);
console.log(`   ${insight}`);
console.log(`   → ${join(outDir, "hakgun-map.json")}${publish ? "" : "  (--publish 없이 스파이크)"}`);
