/**
 * 주간 매매·전세 지수 브리핑 — 텔레그램 알림 본문(오보 0: 전부 원자료 계산).
 *
 * data/datasets/reb-weekly-index.json(부동산원 R-ONE 주간 지수)만 읽어
 *   ① 서울·전국 최신 주 **전주比 변동률**(=지수/전주지수−1)
 *   ② 서울 매매·전세 **연속 상승/하락 주수**
 *   ③ 수도권 토지거래허가구역(2025.10.15 대책: 서울 25개구+경기 12곳=37곳) **구별 매매 전주比 상승률** 랭킹
 * 을 계산해 문구로 찍는다. 손으로 적은 숫자 0개. 시점키 YYYYWW → 그 주 월요일(부동산원 기준일).
 *
 * ⚠️ 토허 지역은 코드로 지목하되, 실행 시 regionNames 로 **이름이 맞는지 검증**한다(코드 드리프트 방지).
 *    이름이 어긋나면 그 지역은 빼고 경고를 남긴다 — 조용히 엉뚱한 구를 보고하지 않는다.
 *
 * 실행: node scripts/reb-weekly-brief.mjs
 *   → 워크플로:  MSG=$(node scripts/reb-weekly-brief.mjs); node scripts/notify-telegram.mjs "$MSG"
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const names = d.regionNames || {};
const NATION = "50001", SEOUL = d.meta.seoulCode || "50008";

/* ── 토허구역 37곳 (2025.10.15 대책) — {코드: 기대이름, 표시명}. 코드↔이름은 런타임 검증한다 ── */
const TOHEO = [
  // 서울 25개구 (전역)
  ["50043", "종로구"], ["50044", "중구"], ["50045", "용산구"], ["50047", "성동구"], ["50048", "광진구"],
  ["50049", "동대문구"], ["50050", "중랑구"], ["50051", "성북구"], ["50052", "강북구"], ["50053", "도봉구"],
  ["50054", "노원구"], ["50056", "은평구"], ["50057", "서대문구"], ["50058", "마포구"], ["50060", "양천구"],
  ["50061", "강서구"], ["50062", "구로구"], ["50063", "금천구"], ["50064", "영등포구"], ["50065", "동작구"],
  ["50066", "관악구"], ["50067", "서초구"], ["50068", "강남구"], ["50069", "송파구"], ["50070", "강동구"],
  // 경기 12곳
  ["50071", "과천시"], ["50097", "광명시"], ["50076", "의왕시"], ["50108", "하남시"],
  ["50078", "수정구", "성남 수정구"], ["50079", "중원구", "성남 중원구"], ["50080", "분당구", "성남 분당구"],
  ["50084", "장안구", "수원 장안구"], ["50086", "팔달구", "수원 팔달구"], ["50087", "영통구", "수원 영통구"],
  ["50074", "동안구", "안양 동안구"], ["50091", "수지구", "용인 수지구"],
];

/* 시점키(YYYYWW, ISO 연차주) → 그 주 월요일 = 부동산원 '기준일' */
const mondayOf = (key) => {
  const y = +key.slice(0, 4), w = +key.slice(4);
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  const mon = new Date(simple); mon.setUTCDate(simple.getUTCDate() - dow + 1);
  return mon;
};
const asOf = d.meta.asOf || Object.keys(d.mae[SEOUL]).sort().pop();
const baseDate = mondayOf(asOf).toISOString().slice(0, 10).replace(/-/g, ".");

/* 전주比 변동률(%) — 최신 주 vs 직전 주 */
const wow = (series) => {
  const ks = Object.keys(series).sort();
  return (series[ks[ks.length - 1]] / series[ks[ks.length - 2]] - 1) * 100;
};
/* 연속 상승/하락 주수 — 마지막 주까지 이어진 같은 방향의 길이 */
const streak = (series) => {
  const ks = Object.keys(series).sort();
  const v = ks.map((k) => series[k]);
  const last = v.length - 1;
  const up = v[last] > v[last - 1], down = v[last] < v[last - 1];
  if (!up && !down) return { dir: "보합", n: 0 };
  let n = 0;
  for (let i = last; i > 0; i--) {
    if (up && v[i] > v[i - 1]) n++;
    else if (down && v[i] < v[i - 1]) n++;
    else break;
  }
  return { dir: up ? "상승" : "하락", n };
};
const streakTxt = (series) => {
  const s = streak(series);
  return s.n >= 2 ? `  ·  ${s.n}주 연속 ${s.dir}` : "";
};
const fmt = (p) => {
  const r = Math.round(p * 100) / 100;
  if (r === 0) return "보합 0.00%";
  return `${r > 0 ? "▲" : "▼"} ${Math.abs(r).toFixed(2)}%`;
};

/* ── 토허 37곳 구별 매매 전주比: 코드↔이름 검증 후 랭킹 ── */
const rows = [];
const badCodes = [];
for (const [code, expect, disp] of TOHEO) {
  if (!d.mae[code] || names[code] !== expect) { badCodes.push(`${code}(${names[code] || "없음"}≠${expect})`); continue; }
  rows.push({ name: disp || expect, wow: wow(d.mae[code]) });
}
rows.sort((a, b) => b.wow - a.wow);
const toheoLines = rows.map((r) => `· ${r.name}  ${fmt(r.wow)}`);
const toheoAvg = rows.length ? rows.reduce((s, r) => s + r.wow, 0) / rows.length : 0;
const upCnt = rows.filter((r) => r.wow > 0).length;

const msg = [
  `📊 [위릿 · 주간 부동산 지수] ${baseDate} 기준`,
  ``,
  `🏙️ 서울 아파트 (전주比)`,
  `· 매매  ${fmt(wow(d.mae[SEOUL]))}${streakTxt(d.mae[SEOUL])}`,
  `· 전세  ${fmt(wow(d.jeonse[SEOUL]))}${streakTxt(d.jeonse[SEOUL])}`,
  ``,
  `🇰🇷 전국 아파트 (전주比)`,
  `· 매매  ${fmt(wow(d.mae[NATION]))}`,
  `· 전세  ${fmt(wow(d.jeonse[NATION]))}`,
  ``,
  `🏘️ 토허구역 매매 상승률 (전주比 · ${rows.length}곳)`,
  `평균 ${fmt(toheoAvg)}  ·  ${upCnt}곳 상승 / ${rows.length - upCnt}곳 하락·보합`,
  ...toheoLines,
  ``,
  `출처 · 한국부동산원 주간 아파트가격동향`,
  `※ 토허구역 = 2025.10.15 대책 서울 전역·경기 12곳(지수는 시군구 단위)`,
].join("\n");

if (badCodes.length) process.stderr.write(`⚠️ 토허 코드↔이름 불일치(제외): ${badCodes.join(", ")}\n`);
process.stdout.write(msg + "\n");
