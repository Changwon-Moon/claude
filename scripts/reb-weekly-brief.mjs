/**
 * 주간 부동산 지수 브리핑 — 텔레그램 알림 본문(오보 0: 전부 원자료 계산).
 *
 * 구성(오너 지정 2026-08-03):
 *   ① 서울 아파트 매매/전세 (전주比 + 연속 주수)
 *   ② 전국 아파트 매매/전세 (전주比)
 *   ③ 토허구역 지역별 매매/전세 (전주比 랭킹 · 40곳)
 *   ④ 소재 인사이트 — 이번 주 수치에서 뽑은 카드 소재 후보(값은 계산, 주장은 조건부로만)
 *
 * data/datasets/reb-weekly-index.json(부동산원 R-ONE 주간 지수)만 읽는다. 손으로 적은 숫자 0개.
 * 시점키 YYYYWW → 그 주 월요일(부동산원 기준일).
 *
 * ⚠️ 토허 지역은 코드로 지목하되 실행 시 regionNames 로 **이름 검증**(불일치 시 제외·경고) — 07-25 교훈.
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

/* ── 토허구역 40곳 = 2025.10.15 대책(서울 25구+경기 12곳) + 추가 3곳(기흥·구리·동탄) ── */
const TOHEO = [
  // 서울 25개구 (전역)
  ["50043", "종로구"], ["50044", "중구"], ["50045", "용산구"], ["50047", "성동구"], ["50048", "광진구"],
  ["50049", "동대문구"], ["50050", "중랑구"], ["50051", "성북구"], ["50052", "강북구"], ["50053", "도봉구"],
  ["50054", "노원구"], ["50056", "은평구"], ["50057", "서대문구"], ["50058", "마포구"], ["50060", "양천구"],
  ["50061", "강서구"], ["50062", "구로구"], ["50063", "금천구"], ["50064", "영등포구"], ["50065", "동작구"],
  ["50066", "관악구"], ["50067", "서초구"], ["50068", "강남구"], ["50069", "송파구"], ["50070", "강동구"],
  // 경기 12곳(10.15)
  ["50071", "과천시"], ["50097", "광명시"], ["50076", "의왕시"], ["50108", "하남시"],
  ["50078", "수정구", "성남 수정구"], ["50079", "중원구", "성남 중원구"], ["50080", "분당구", "성남 분당구"],
  ["50084", "장안구", "수원 장안구"], ["50086", "팔달구", "수원 팔달구"], ["50087", "영통구", "수원 영통구"],
  ["50074", "동안구", "안양 동안구"], ["50091", "수지구", "용인 수지구"],
  // 추가 3곳
  ["50090", "기흥구", "용인 기흥구"], ["50106", "구리시"], ["50259", "동탄구", "화성 동탄구"],
];

const mondayOf = (key) => {
  const y = +key.slice(0, 4), w = +key.slice(4);
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  const mon = new Date(simple); mon.setUTCDate(simple.getUTCDate() - dow + 1);
  return mon;
};
const asOf = d.meta.asOf || Object.keys(d.mae[SEOUL]).sort().pop();
const baseDate = mondayOf(asOf).toISOString().slice(0, 10).replace(/-/g, ".");

const wow = (series) => {
  const ks = Object.keys(series).sort();
  return (series[ks[ks.length - 1]] / series[ks[ks.length - 2]] - 1) * 100;
};
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
  return `${r > 0 ? "▲" : "▼"}${Math.abs(r).toFixed(2)}%`;
};

/* ── 토허 40곳: 코드↔이름 검증 후 매매·전세 전주比, 매매 내림차순 ── */
const rows = [];
const badCodes = [];
for (const [code, expect, disp] of TOHEO) {
  if (!d.mae[code] || !d.jeonse[code] || names[code] !== expect) {
    badCodes.push(`${code}(${names[code] || "없음"}≠${expect})`); continue;
  }
  rows.push({ name: disp || expect, mae: wow(d.mae[code]), jeonse: wow(d.jeonse[code]) });
}
rows.sort((a, b) => b.mae - a.mae);
const toheoLines = rows.map((r) => `· ${r.name}  매 ${fmt(r.mae)} / 전 ${fmt(r.jeonse)}`);
const avgMae = rows.reduce((s, r) => s + r.mae, 0) / (rows.length || 1);
const avgJeon = rows.reduce((s, r) => s + r.jeonse, 0) / (rows.length || 1);

/* ── 소재 인사이트: 값은 계산, 주장은 조건이 맞을 때만 ── */
const smSt = streak(d.mae[SEOUL]), sjSt = streak(d.jeonse[SEOUL]);
const seoulMae = wow(d.mae[SEOUL]), seoulJeon = wow(d.jeonse[SEOUL]);
const nationMae = wow(d.mae[NATION]);
const insights = [];
// A) 매매·전세 동반 흐름
if (smSt.dir === "상승" && sjSt.dir === "상승") {
  const both = Math.min(smSt.n, sjSt.n);
  const who = seoulJeon >= seoulMae ? "전세가 매매만큼·이상 오르는 중" : "매매가 전세를 앞서는 중";
  insights.push(`· 서울 매매·전세 동반 ${both}주 연속 상승 — ${who}(전세도 오르는 국면)`);
}
// B) 토허 역설: 최고 상승 vs 규제 원조(강남·서초) 위치
if (rows.length) {
  const top = rows[0];
  const rankOf = (nm) => rows.findIndex((r) => r.name === nm) + 1;
  const rG = rankOf("강남구"), rS = rankOf("서초구");
  const bottomCut = Math.ceil(rows.length * 2 / 3);
  const paradox = rG && rS && rG >= bottomCut && rS >= bottomCut;
  insights.push(
    paradox
      ? `· 토허 최고 상승은 ${top.name}(매 ${fmt(top.mae)}) — 규제 원조 강남(${rG}위)·서초(${rS}위)는 하위권(갭메우기·'규제의 역설' 소재)`
      : `· 토허 최고 상승 ${top.name}(매 ${fmt(top.mae)}) / 강남 ${rG}위·서초 ${rS}위`
  );
}
// C) 서울 vs 전국 온도차
if (nationMae > 0.001) {
  const ratio = seoulMae / nationMae;
  if (ratio >= 1.5) insights.push(`· 서울 매매 상승폭이 전국의 ${ratio.toFixed(1)}배 — 상승이 서울에 쏠림`);
}

const msg = [
  `📊 [위릿 · 주간 부동산 지수] ${baseDate} 기준`,
  ``,
  `🏙️ 서울 아파트 (전주比)`,
  `· 매매  ${fmt(seoulMae)}${streakTxt(d.mae[SEOUL])}`,
  `· 전세  ${fmt(seoulJeon)}${streakTxt(d.jeonse[SEOUL])}`,
  ``,
  `🇰🇷 전국 아파트 (전주比)`,
  `· 매매  ${fmt(nationMae)}`,
  `· 전세  ${fmt(wow(d.jeonse[NATION]))}`,
  ``,
  `🏘️ 토허구역 지역별 (전주比 · ${rows.length}곳)`,
  `평균  매 ${fmt(avgMae)} / 전 ${fmt(avgJeon)}`,
  ...toheoLines,
  ``,
  `💡 소재 인사이트`,
  ...insights,
  ``,
  `출처 · 한국부동산원 주간 아파트가격동향`,
  `※ 토허구역 = 서울 전역·경기 15곳(지수는 시군구 단위)`,
].join("\n");

if (badCodes.length) process.stderr.write(`⚠️ 토허 코드↔이름 불일치(제외): ${badCodes.join(", ")}\n`);
process.stdout.write(msg + "\n");
