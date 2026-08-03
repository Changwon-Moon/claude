/**
 * 주간 매매·전세 지수 한 줄 브리핑 — 텔레그램 알림 본문(오보 0: 전부 원자료 계산).
 *
 * data/datasets/reb-weekly-index.json(부동산원 R-ONE 주간 지수)만 읽어
 * 서울·전국의 최신 주 **전주比 변동률**(=지수/전주지수−1)과 서울 매매 **연속 상승/하락 주수**를
 * 계산해 문구로 찍는다. 손으로 적은 숫자 0개. 시점키 YYYYWW → 그 주 월요일(부동산원 기준일).
 *
 * 실행: node scripts/reb-weekly-brief.mjs           # 문구를 stdout 으로
 *   → 워크플로에서  MSG=$(node scripts/reb-weekly-brief.mjs); node scripts/notify-telegram.mjs "$MSG"
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
const names = d.regionNames || {};
const NATION = "50001", SEOUL = d.meta.seoulCode || "50008";

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
  const a = series[ks[ks.length - 2]], b = series[ks[ks.length - 1]];
  return (b / a - 1) * 100;
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

const fmt = (p) => {
  const r = Math.round(p * 100) / 100;
  if (r === 0) return "보합 0.00%";
  return `${r > 0 ? "▲" : "▼"} ${Math.abs(r).toFixed(2)}%`;
};

const seoulMae = wow(d.mae[SEOUL]);
const seoulJeon = wow(d.jeonse[SEOUL]);
const nationMae = wow(d.mae[NATION]);
const nationJeon = wow(d.jeonse[NATION]);
const st = streak(d.mae[SEOUL]);
const stTxt = st.n >= 2 ? `  ·  ${st.n}주 연속 ${st.dir}` : "";

const msg = [
  `📊 [위릿 · 주간 부동산 지수] ${baseDate} 기준`,
  ``,
  `🏙️ 서울 아파트 (전주比)`,
  `· 매매  ${fmt(seoulMae)}${stTxt}`,
  `· 전세  ${fmt(seoulJeon)}`,
  ``,
  `🇰🇷 전국 아파트 (전주比)`,
  `· 매매  ${fmt(nationMae)}`,
  `· 전세  ${fmt(nationJeon)}`,
  ``,
  `출처 · 한국부동산원 주간 아파트가격동향`,
].join("\n");

process.stdout.write(msg + "\n");
