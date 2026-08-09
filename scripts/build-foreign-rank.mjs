/**
 * 서울 자치구별 등록외국인 거주비율 — 1줄 제목 + 밴드(전체비율·국적도넛·국기범례) + 인원 순위표. 2장.
 *   p1: 인원 1~13위 · p2: 14~25위
 * 데이터:
 *   data/datasets/seoul-foreign-2023.json  (법무부 등록외국인 2023, 국적별 — 남+여 합산)
 *   data/datasets/population/*.json         (KOSIS 주민등록인구 — 외국인비율 분모)
 * 오너 결정(2026-08-08): 한국계중국인 → 중국에 합산(국적 기준). 표는 인원(수) 순, 단위 천명.
 * ⚠️ 외국인은 2023.12 기준, 인구 분모는 근접 시점(POP_PERIOD)으로 고정 → 결정적 렌더.
 * 실행: node scripts/build-foreign-rank.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-09";
const POP_PERIOD = "2024-07"; // 등록외국인 2023.12 에 가장 근접한, 캐시에 존재하는 인구 시점(고정 → 결정성)

// ── 등록외국인 2023 ──
const src = JSON.parse(readFileSync(join(ROOT, "data/datasets/seoul-foreign-2023.json"), "utf8"));
const gu = JSON.parse(JSON.stringify(src.gu)); // 원본 불변
let hanguke = 0, forTotal = 0;
for (const g in gu) {
  const nat = gu[g].nat;
  if (nat["한국계중국인"]) { hanguke += nat["한국계중국인"]; nat["중국"] = (nat["중국"] || 0) + nat["한국계중국인"]; delete nat["한국계중국인"]; }
}

// ── 인구 분모(주민등록, 고정 시점) ──
const pop = JSON.parse(readFileSync(join(ROOT, "data/datasets/population/2026-06.json"), "utf8"));
const popSeries = (pop.metrics && pop.metrics["인구"]) || pop.series;
const popByName = {};
for (const s of popSeries) {
  const pt = (s.points || []).find((p) => p.period === POP_PERIOD) || (s.points || [])[0];
  if (pt) popByName[s.name] = pt.value;
}

// ── 국기(flag-icons, 인라인 SVG) ──
const CODE = { "중국": "cn", "미국": "us", "베트남": "vn", "몽골": "mn", "일본": "jp", "우즈베키스탄": "uz", "네팔": "np", "필리핀": "ph", "프랑스": "fr", "타이완": "tw", "캄보디아": "kh", "인도네시아": "id", "타이": "th", "미얀마": "mm", "방글라데시": "bd", "카자흐스탄": "kz", "러시아(연방)": "ru", "스리랑카": "lk", "인도": "in", "영국": "gb", "캐나다": "ca", "독일": "de", "오스트레일리아": "au", "말레이시아": "my" };
const FLAGDIR = join(ROOT, "node_modules/.pnpm/flag-icons@7.5.0/node_modules/flag-icons/flags/4x3");
const rawFlag = {}, dataFlag = {};
const inlFlag = (n) => { const c = CODE[n]; if (!c) return ""; if (!(c in rawFlag)) { try { rawFlag[c] = readFileSync(join(FLAGDIR, `${c}.svg`), "utf8").replace(/<\?xml[^>]*\?>/i, "").trim(); } catch { rawFlag[c] = ""; } } return rawFlag[c]; };
const dataUri = (n) => { const c = CODE[n]; if (!c) return ""; if (!(c in dataFlag)) { const s = inlFlag(n); dataFlag[c] = s ? "data:image/svg+xml;base64," + Buffer.from(s, "utf8").toString("base64") : ""; } return dataFlag[c]; };

// ── 구별 지표(인원 순) ──
let rows = [], seoulPop = 0;
for (const g in gu) {
  const d = gu[g], pp = popByName[g] || 0; seoulPop += pp; forTotal += d.total;
  const denom = pp + d.total;
  const top = Object.entries(d.nat).sort((a, b) => b[1] - a[1]).slice(0, 3);
  rows.push({ gu: g, tot: d.total, ratio: denom ? d.total / denom * 100 : 0, top });
}
rows.sort((a, b) => b.tot - a.tot);
const seoulRatio = forTotal / (seoulPop + forTotal) * 100;
const per100 = seoulRatio.toFixed(1);
const hangukePct = (hanguke / forTotal * 100).toFixed(1);
let chinaCombN = 0; for (const g in gu) chinaCombN += gu[g].nat["중국"] || 0;
const chinaComb = (chinaCombN / forTotal * 100).toFixed(1);

// ── 도넛 국적(상위4 + 기타) ──
const allNat = {}; for (const g in gu) for (const [n, c] of Object.entries(gu[g].nat)) allNat[n] = (allNat[n] || 0) + c;
const allTot = Object.values(allNat).reduce((a, b) => a + b, 0);
const t4 = Object.entries(allNat).sort((a, b) => b[1] - a[1]).slice(0, 4);
const NAT = [...t4.map(([n, c]) => [n, +(c / allTot * 100).toFixed(1)]), ["기타", +((allTot - t4.reduce((s, [, c]) => s + c, 0)) / allTot * 100).toFixed(1)]];
const FCOL = { "중국": "#de2910", "미국": "#1f3a93", "베트남": "#f4c400", "일본": "#8a1f2b", "몽골": "#0f7ab5", "기타": "#9aa3ad" };

// ── 서울 엠블럼 ──
const emblem = readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg"), "utf8")
  .replace(/<\?xml[^>]*\?>/i, "").replace(/<metadata>[\s\S]*?<\/metadata>/i, "")
  .replace(/<svg\s/i, '<svg class="em" preserveAspectRatio="xMidYMid meet" ')
  .replace(/\swidth="[^"]*"/i, "").replace(/\sheight="[^"]*"/i, "").replace(/\senable-background="[^"]*"/i, "").trim();

// ── 밴드 클러스터(도넛+범례+120° 리더선) ──
function cluster() {
  const cx = 150, cy = 150, r = 100, sw = 46, C = 2 * Math.PI * r; let cum = 0, segs = "";
  for (const [n, v] of NAT) { const f = v / 100, L = C * f;
    segs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${FCOL[n] || "#999"}" stroke-width="${sw}" stroke-dasharray="${L.toFixed(2)} ${(C - L).toFixed(2)}" stroke-dashoffset="${(-C * cum).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`; cum += f; }
  const hole = `<circle cx="${cx}" cy="${cy}" r="${r - sw / 2 - 2}" fill="#fafaf8"/>`;
  const mid = `<text x="${cx}" y="${cy + 11}" text-anchor="middle" font-family="Pretendard" font-weight="900" font-size="33" fill="#141821">국적 비율</text>`;
  const lx = 404, nameX = 456, pctX = 624, ys = [46, 96, 146, 196, 246]; let leg = "";
  NAT.forEach(([n, v], i) => { const y = ys[i];
    if (CODE[n] && dataUri(n)) leg += `<image href="${dataUri(n)}" x="${lx}" y="${y - 16}" width="46" height="32" preserveAspectRatio="xMidYMid slice"/>`;
    else leg += `<rect x="${lx}" y="${y - 16}" width="46" height="32" rx="5" fill="${FCOL[n] || "#9aa3ad"}"/>`;
    leg += `<rect x="${lx}" y="${y - 16}" width="46" height="32" rx="5" fill="none" stroke="rgba(20,24,33,.12)"/>`;
    leg += `<text x="${nameX}" y="${y + 9}" font-family="Pretendard" font-weight="700" font-size="28" fill="#2c3440">${n}</text>`;
    leg += `<text x="${pctX}" y="${y + 9}" text-anchor="end" font-family="Pretendard" font-weight="900" font-size="28" fill="#141821">${v}%</text>`; });
  const tt = (NAT[0][1] / 100) / 2, ang = (tt * 360 - 90) * Math.PI / 180, R = r + sw / 2;
  const sx = cx + R * Math.cos(ang), sy = cy + R * Math.sin(ang), bendX = 360;
  const lead = `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5" fill="${FCOL["중국"]}"/><polyline points="${sx.toFixed(1)},${sy.toFixed(1)} ${bendX},${sy.toFixed(1)} ${lx - 8},${ys[0]}" fill="none" stroke="#8a93a0" stroke-width="2.4" stroke-dasharray="3 5" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 640 300" preserveAspectRatio="xMaxYMid meet" xmlns="http://www.w3.org/2000/svg">${segs}${hole}${mid}${lead}${leg}</svg>`;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const flagCell = (n) => (CODE[n] && inlFlag(n)) ? inlFlag(n) : `<div style="width:100%;height:100%;background:#c4c9d0"></div>`;
const k = (v) => (v / 1000).toFixed(1);
const rowsAll = rows.map((r, i) => ({
  rank: i + 1, gu: r.gu, count: k(r.tot), ratioPct: r.ratio.toFixed(1),
  cls: i < 3 ? `r${i + 1}` : "", medal: MEDALS[i] || "",
  n1flag: flagCell(r.top[0][0]), n1pct: k(r.top[0][1]),
  n2flag: flagCell(r.top[1][0]), n2pct: k(r.top[1][1]),
  n3flag: flagCell(r.top[2][0]), n3pct: k(r.top[2][1]),
}));

const base = {
  template: "foreign-rank@1", date, emblem, perHundred: per100, clusterSvg: cluster(),
  subtitle: `출처 · 법무부 등록외국인 2023 · 인구 ${POP_PERIOD} 대비`,
  chinaNote: `💡 '중국 ${chinaComb}%'에는 한국계중국인 ${hangukePct}% 포함`,
  footerLeft: "서울 25개 자치구 · 국적별 등록외국인",
};
const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "foreign-rank-p1.json"), JSON.stringify({ ...base, rows: rowsAll.slice(0, 13) }, null, 2) + "\n");
writeFileSync(join(outDir, "foreign-rank-p2.json"), JSON.stringify({ ...base, rows: rowsAll.slice(13) }, null, 2) + "\n");

// ── 캡션 ──
const top3 = rowsAll.slice(0, 3);
const caption =
`서울에 사는 외국인, 어느 구에 가장 많을까? 🌏

법무부 등록외국인 통계(2023) 기준,
서울 25개 자치구를 인원 순으로 정리했습니다.
서울시민 100명 중 ${per100}명이 등록외국인입니다.

🥇 ${top3[0].gu} ${top3[0].count}천명 (${top3[0].ratioPct}%)
🥈 ${top3[1].gu} ${top3[1].count}천명 (${top3[1].ratioPct}%)
🥉 ${top3[2].gu} ${top3[2].count}천명 (${top3[2].ratioPct}%)
…
25위 ${rowsAll[24].gu} ${rowsAll[24].count}천명

국적으로 보면 중국이 ${NAT[0][1]}%로 가장 많고,
그다음 ${NAT[1][0]}(${NAT[1][1]}%) · ${NAT[2][0]}(${NAT[2][1]}%) · ${NAT[3][0]}(${NAT[3][1]}%) 순입니다.
💡 '중국 ${chinaComb}%'에는 한국계중국인 ${hangukePct}%가 포함됩니다(국적 기준).

👀 함께 보기 — '비율'과 '인원'은 다릅니다
인원은 구로·영등포가 압도적이지만,
인구 대비 '비율'로는 종로구가 가장 높습니다
(인구가 적은 구는 비율이 높게 잡히는 착시가 있어요).

📌 저장 필수

—
📊 출처 : 법무부 등록외국인 통계 (2023, 공공데이터포털 15108413)
※ 외국인비율은 주민등록인구(${POP_PERIOD}) 대비 산출 · '중국'은 한국계중국인 포함(국적 기준)

· · ·
부동산·경제·트렌드를 한 눈에, 위릿.
매일 한 장, 내 맘속에 저장. 🫶

#서울 #외국인 #등록외국인 #인구통계 #국적 #구로구 #대림동 #부동산`;
mkdirSync(join(ROOT, "data/review/captions"), { recursive: true });
writeFileSync(join(ROOT, "data/review/captions/foreign-rank.txt"), caption + "\n");

console.log(`✅ foreign-rank 2장 — 서울 ${per100}% · 중국 ${chinaComb}%(한국계 ${hangukePct}%) · 인원1위 ${rowsAll[0].gu} ${rowsAll[0].count}천명 · 인구 ${POP_PERIOD}`);
console.log(`   → data/content/${date}/foreign-rank-p1.json,p2.json · 캡션 data/review/captions/foreign-rank.txt`);
