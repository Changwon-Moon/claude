/**
 * 신고가 경신 리포트 — 국토부 실거래(캐시)에서 '올해 최고가 경신' 단지를 코드로 산출.
 * 판정: (구|단지|법정동|전용면적 반올림) 그룹에서 시간순 누적 최고가를 갱신한 거래 중,
 *       갱신 시점이 최신월(기본 2026-06)이고 직전 최고가(비교대상)가 존재하는 것 = '경신'.
 *       → 상승률(직전 최고 대비) 순 TOP N. 모든 수치 raw 데이터에서 추출(창작 금지·provenance).
 * ⚠️ 보유 캐시가 2026 상반기(1~6월)뿐 → '역대 신고가'가 아니라 '올해 최고 실거래 경신'으로 라벨.
 *    진짜 주간 신고가는 최신 주 수집 + 장기 이력 백필(Actions) 후 같은 엔진으로.
 * 실행: node scripts/build-weekly-high.mjs [latestMonth=202606] [date=2026-07-23] [topN=10]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const latest = process.argv[2] || "202606";
const date = process.argv[3] || "2026-07-23";
const topN = parseInt(process.argv[4] || "10", 10);
const latestPrefix = `${latest.slice(0, 4)}-${latest.slice(4, 6)}`; // 2026-06

const eok = (won) => Math.round((won / 1e8) * 10) / 10; // 억, 소수1
const pyeong = (m2) => Math.round(m2 / 3.3058);

const dir = join(ROOT, "data/datasets/molit");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const groups = new Map();
let srcVerified = true;
for (const f of files) {
  const d = JSON.parse(readFileSync(join(dir, f), "utf8"));
  if (d.meta && d.meta.verified === false) srcVerified = false;
  const gu = d.meta.gu;
  for (const t of d.trades) {
    if (t.canceled) continue;
    const key = `${gu}|${t.aptNm}|${t.umdNm}|${Math.round(t.area)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ p: t.priceWon, d: t.date, area: t.area, floor: t.floor, gu, apt: t.aptNm, umd: t.umdNm });
  }
}

// 그룹별 누적최고 갱신 판정 → 최신월 경신 추출.
// 신뢰: 비교 이력이 최소 2건(그룹 3건+) 있어야 단일 저가 이상치로 인한 과대 상승률 방지.
const hits = [];
for (const [, arr] of groups) {
  if (arr.length < 3) continue;
  arr.sort((a, b) => (a.d < b.d ? -1 : 1));
  let prevMax = -1, prevRec = null;
  for (let i = 0; i < arr.length; i++) {
    const r = arr[i];
    if (i >= 2 && r.p > prevMax && r.d >= `${latestPrefix}-01`) {
      hits.push({ ...r, prevMax, prevDate: prevRec.d, gainPct: Math.round((r.p / prevMax - 1) * 1000) / 10 });
    }
    if (r.p > prevMax) { prevMax = r.p; prevRec = r; }
  }
}

// 신뢰 필터: 현재가 ≥ 10억, 단지명이 실제 이름(숫자·괄호 시작 제외), 전용 ≥ 40㎡
const CUR_FLOOR = 10e8, AREA_MIN = 40;
const clean = hits.filter((h) => h.p >= CUR_FLOOR && h.area >= AREA_MIN && /^[가-힣A-Za-z]/.test(h.apt));
// 단지(구|단지)별 1건(최대 상승률)만
const best = new Map();
for (const h of clean) {
  const k = `${h.gu}|${h.apt}`;
  if (!best.has(k) || h.gainPct > best.get(k).gainPct) best.set(k, h);
}
const ranked = [...best.values()].sort((a, b) => b.gainPct - a.gainPct).slice(0, topN);
if (!ranked.length) throw new Error("경신 후보 없음");

// 표시용 단지명 정리: 괄호(동범위)·블록코드·꼬리 동번호 제거
const cleanApt = (s) => s.replace(/\(.*?\)/g, "").replace(/\s*BL\S*/gi, "").replace(/\s+/g, " ").trim();

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
const f1 = (v) => v.toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const rows = ranked.map((h, i) => ({
  rank: i + 1,
  medal: MEDAL[i + 1] || "",
  top: i < 3,
  gu: h.gu,
  apt: cleanApt(h.apt),
  area: Math.round(h.area),
  pyeong: pyeong(h.area),
  floor: h.floor,
  prev: f1(eok(h.prevMax)),
  now: f1(eok(h.p)),
  gain: `+${h.gainPct.toFixed(1)}`,
}));

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "weekly-high@1",
  date,
  title: `<span class="up">신고가</span>, 이만큼 뛰었다`,
  subtitle: `${latestPrefix.replace("-", "년 ")}월 · 올해 최고 실거래 경신 TOP${topN}`,
  note: "직전 최고 실거래가 대비 상승률 순",
  rows,
  source: {
    name: "국토부 아파트 실거래가",
    period: "2026 상반기(1~6월)",
    verified: srcVerified,
  },
};
writeFileSync(join(outDir, `weekly-high.json`), JSON.stringify(doc, null, 2) + "\n");
console.log(`✅ weekly-high — ${latestPrefix} 경신 TOP${topN} (검증데이터=${srcVerified})`);
for (const r of rows) console.log(`  ${r.rank}. ${r.gu} ${r.apt} ${r.area}㎡ · ${r.prev}→${r.now}억 (${r.gain}%)`);
