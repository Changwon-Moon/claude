/**
 * 전국 시(市) 인구 순위 TOP N → ranking-table@1 카드 + 캡션.
 *
 * 오너 결정(2026-09-15, 질문 두 번으로 확정):
 *   범위 = 전국 시 · 단위 = 일반구를 둔 시는 합쳐 시 하나 · 특별시·광역시(와 그 구·군)는 제외
 *   세종시·제주시(행정시) 포함 · 지표 = 인구수 순위 + 1년 증감률 · 기준 2026년 6월 · TOP 20 · 순위표
 *
 * ── 왜 6월인가
 *   2026-07-01 인천 행정구역 개편(제물포·영종·검단구)과 전남광주통합특별시 출범으로 KOSIS 코드가
 *   바뀌어 7월분은 30곳이 비어 있다(전남 22개 시군 전부). 6월분은 전국 공표치와 0.0% 일치한다.
 *
 * ── 시 합산은 코드가 한다
 *   지도 코드 → KOSIS 코드(kosis-region-map.json 역방향) → 앞 4자리+'0' 이 대조표의 「시 전체」 코드면
 *   그 시에 합친다. 사람이 「장안구=수원시」를 적지 않는다.
 *   공표 시 전체 행(cityTotals, 2026-09-15 수집기 추가)이 있으면 **구 합계와 1명까지 같아야** 한다.
 *
 * ── 화성시
 *   2026-02 에 4개 구가 생겨 구 단위 시계열은 2026-02 부터다. 1년 전 값은 cityTotals 의
 *   KOSIS 41590(화성시) 행에서만 나온다. 없으면 **던진다** — 화성시 증감률을 비워 두고
 *   조용히 나가지 않는다(오너 선택: 전년값을 따로 확보).
 *
 * 실행: node scripts/build-pop-city-rank.mjs [date=2026-09-15] [--publish]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const date = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || "2026-09-15";
const PUBLISH = args.includes("--publish");
const LABEL = "pop-city-rank";
const PERIOD = "2026-06";
const TOP = 20;

const prevPeriod = `${Number(PERIOD.slice(0, 4)) - 1}${PERIOD.slice(4)}`;
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

/* 시군구 시계열은 기준월 스냅숏에서, 공표 시 전체 행은 그것을 가진 가장 최근 파일에서. */
const snap = read(`data/datasets/population/${PERIOD}.json`);
const latest = read("data/datasets/population-latest.json");
const withTotals = [latest, snap].find((d) => Array.isArray(d.cityTotals) && d.cityTotals.length);
if (!withTotals) throw new Error("cityTotals(시 전체 행)가 아직 없다 — 인구 재수집(population-queue) 결과를 먼저 받아야 한다.");
const cityTotals = withTotals.cityTotals;

if (snap.meta?.unit?.value !== "명") throw new Error(`단위가 명이 아니다: ${snap.meta?.unit?.value}`);

/* ── 전국 대조: 기준월·전년월 모두 공표치와 맞아야 순위를 말할 수 있다 ── */
const sumAt = (p) => snap.series.reduce((a, s) => a + (s.points.find((x) => x.period === p)?.value ?? 0), 0);
const missingAt = (p) => snap.series.filter((s) => !s.points.find((x) => x.period === p)).map((s) => s.name);

/* ── 코드 사다리: 지도 코드 → KOSIS 코드 → 시 전체 코드 ── */
const rm = read("data/geo/kosis-region-map.json");
const toKosis = Object.fromEntries(Object.entries(rm.maps.population).map(([k, g]) => [g, k]));
const parents = new Map(
  rm.unmatched.population
    .filter((u) => /시$/.test(u.name) && !/출장소/.test(u.name))
    .map((u) => [u.code, u]),
);
/* KOSIS 주민등록 체계 시도 앞 2자리 — 특별시·광역시는 제외한다. 이름은 대조표의 sido 를 쓴다. */
const METRO_KOSIS = new Set(["11", "26", "27", "28", "29", "30", "31"]); // 서울·부산·대구·인천·광주·대전·울산
const sidoOf = Object.fromEntries(
  Object.entries(rm.maps.population).map(([k]) => [k, null]),
);
const geoSido = Object.fromEntries(read("data/geo/sgg-codes.json").sgg.map((x) => [x.code, x.sido]));
const SIDO_SHORT = {
  세종특별자치시: "세종", 경기도: "경기", 강원특별자치도: "강원", 충청북도: "충북", 충청남도: "충남",
  전북특별자치도: "전북", 전라남도: "전남", 경상북도: "경북", 경상남도: "경남", 제주특별자치도: "제주",
};

const groups = new Map();
for (const s of snap.series) {
  const k = toKosis[s.code];
  if (!k) throw new Error(`대조표에 없는 지도 코드: ${s.code} ${s.name}`);
  if (METRO_KOSIS.has(k.slice(0, 2))) continue;
  const sido = SIDO_SHORT[geoSido[s.code]];
  if (!sido) throw new Error(`시도 약칭이 없다: ${s.code} ${geoSido[s.code]}`);
  const pk = k.slice(0, 4) + "0";
  const parent = k !== pk && parents.has(pk) ? parents.get(pk) : null;
  const name = parent ? parent.name : s.name;
  const key = parent ? pk : k;
  if (!groups.has(key)) groups.set(key, { key, sido, name, parts: [] });
  groups.get(key).parts.push(s);
}

const rows = [];
for (const g of groups.values()) {
  if (!/시$/.test(g.name)) continue; // 군 제외 — 오너 결정 「시 단위」
  const at = (p) => {
    const vs = g.parts.map((s) => s.points.find((x) => x.period === p)?.value);
    return vs.every((v) => typeof v === "number") ? vs.reduce((a, b) => a + b, 0) : null;
  };
  let cur = at(PERIOD);
  let prev = at(prevPeriod);
  const official = cityTotals.find((c) => c.code === g.key);
  if (g.parts.length > 1 || parents.has(g.key)) {
    if (!official) throw new Error(`${g.name}: 공표 시 전체 행이 없다(${g.key})`);
    const oc = official.points.find((x) => x.period === PERIOD)?.value;
    if (oc !== cur) throw new Error(`${g.name} ${PERIOD}: 구 합계 ${cur} ≠ 공표 시 전체 ${oc}`);
    const op = official.points.find((x) => x.period === prevPeriod)?.value;
    if (prev === null) prev = op ?? null; // 화성시 — 구 신설 전
    else if (op !== undefined && op !== prev) throw new Error(`${g.name} ${prevPeriod}: 구 합계 ${prev} ≠ 공표 ${op}`);
  }
  if (cur === null) throw new Error(`${g.name}: ${PERIOD} 값이 비었다`);
  rows.push({ ...g, cur, prev });
}
rows.sort((a, b) => b.cur - a.cur);
const top = rows.slice(0, TOP);
for (const r of top) if (r.prev === null) throw new Error(`${r.name}: ${prevPeriod} 값이 없어 증감률을 못 낸다`);

/* ── 표기 ── */
const fmt = (n) => n.toLocaleString("en-US");
const pct = (r) => ((r.cur / r.prev - 1) * 100);
const pctTxt = (v) => `${v > 0 ? "▲" : v < 0 ? "▼" : ""}${Math.abs(v).toFixed(2)}%`;

const items = top.map((r, i) => ({
  rank: String(i + 1),
  name: `${r.name} (${r.sido})`,
  value: fmt(r.cur),
  sub: pctTxt(pct(r)),
}));

const [y, m] = PERIOD.split("-");
const content = {
  template: "ranking-table@1",
  date,
  title: "전국 인구 많은 도시 TOP20",
  nameLabel: "도시",
  valueLabel: "인구(명)",
  subLabel: "1년 증감",
  font: "taebaek-pretendard",
  colW: { name: 260, val: 190, sub: 160 },
  hideMark: true,
  plainRank: true,
  items,
  source: { name: "행정안전부 주민등록인구(KOSIS)", asOf: `${y}년 ${Number(m)}월 말` },
  meta: {
    provenance: "data/datasets/population/" + PERIOD + ".json · cityTotals",
    period: PERIOD, prevPeriod,
    universe: `특별·광역시 제외 전국 ${rows.length}개 시(세종·제주시 포함)`,
    nationalSum: sumAt(PERIOD), nationalMissing: missingAt(PERIOD),
  },
};

const outDir = PUBLISH ? join(ROOT, `data/content/${date}`) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${LABEL}.json`), JSON.stringify(content, null, 2) + "\n");

const up = top.filter((r) => pct(r) > 0);
const million = top.filter((r) => r.cur >= 1_000_000);
const nearMillion = top.find((r) => r.cur < 1_000_000);
const josa = (w, a, b2) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? a : b2; };
const man = (n) => `${(n / 10000).toFixed(1)}만`;
const topGain = [...up].sort((a, b) => pct(b) - pct(a)).slice(0, 3);
const hwaseong = top.find((r) => r.name === "화성시");
const caption = [
  `🏙️ 우리나라에서 사람이 가장 많이 사는 '시'는 어디일까?`,
  ``,
  `1위 ${top[0].name} ${man(top[0].cur)}명`,
  `100만 넘는 곳은 ${million.map((r) => r.name).join("·")} ${million.length}곳뿐`,
  nearMillion ? `${nearMillion.name}${josa(nearMillion.name, "은", "는")} ${man(nearMillion.cur)}명으로 ${million.length + 1}위 👀` : null,
  ``,
  `📈 1년 새 인구가 는 곳은 ${top.length}곳 중 ${up.length}곳`,
  ...topGain.map((r) => `· ${r.name} ${pctTxt(pct(r))}`),
  ``,
  `📌 저장해두고 우리 도시 몇 위인지 확인하기`,
  `—`,
  `📊 출처 : 행정안전부 주민등록인구(KOSIS) · ${y}년 ${Number(m)}월 말`,
  `※ 서울·광역시는 빼고 세종·제주시를 포함한 전국 ${rows.length}개 시 비교입니다.`,
  `※ 구가 있는 시(${top.filter((r) => r.parts.length > 1).slice(0, 3).map((r) => r.name.replace(/시$/, "")).join("·")} 등)는 구를 합친 시 전체 인구입니다.`,
  `※ 1년 증감은 ${prevPeriod.replace("-", "년 ").replace(/ 0?(\d+)$/, " $1월")} 말 대비입니다.`,
  hwaseong ? `※ 화성시는 2026년 2월 4개 구가 생기기 전의 시 전체 값과 비교했습니다.` : null,
  ``,
  `#인구순위 #전국인구 #수원시 #화성시 #부동산`,
].filter((l) => l !== null).join("\n");
if (PUBLISH) writeFileSync(join(ROOT, `data/review/captions/${LABEL}.txt`), caption + "\n");
else writeFileSync(join(outDir, `${LABEL}.caption.txt`), caption + "\n");
const best = [...top].sort((a, b) => pct(b) - pct(a))[0];
const worst = [...top].sort((a, b) => pct(a) - pct(b))[0];
console.log(`✅ ${LABEL}.json → ${outDir}`);
console.log(`   대상 ${rows.length}개 시 · 전국합 ${fmt(sumAt(PERIOD))} · 빠진 곳 ${missingAt(PERIOD).length}`);
top.forEach((r, i) => console.log(`   ${i + 1}. ${r.sido} ${r.name} ${fmt(r.cur)} (${fmt(r.prev)}) ${pctTxt(pct(r))} 구${r.parts.length}`));
console.log(`   늘어난 곳 ${up.length}/${top.length} · 최고 ${best.name} ${pctTxt(pct(best))} · 최저 ${worst.name} ${pctTxt(pct(worst))}`);
