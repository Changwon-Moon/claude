/**
 * 수도권 토허구역 40곳 '월세 비중' 지도 + 순위. singoga-map@1 재사용(토허 지도 = tohuh-map.mjs 상속).
 *
 * ── 데이터: 국토부 아파트 전월세 실거래 집계(오보 0·verified)
 * data/datasets/molit-rent/{LAWD}-{YYYYMM}.json (서울 25구 + 경기 토허 15곳) 만 읽는다.
 * 지역 정의·지도 경계는 data/datasets/tohuh-2026.json + scripts/lib/tohuh-map.mjs (토허 카드 공용).
 * 월세비중 = 월세건수/전체 (월세금액 0=전세, >0=월세로 수집기가 분류). 손으로 적은 숫자 0개.
 *
 * 실행: node scripts/build-jeonwolse-map.mjs [latestMonth=202606] [date=오늘]
 * 출력: data/content/{date}/jeonwolse-map.json
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tohuhParts, tohuhMapSvg } from "./lib/tohuh-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const latest = process.argv[2] || "202606";
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[3] || kstToday;
const latestPrefix = `${latest.slice(0, 4)}년 ${latest.slice(4, 6)}월`;

// ── 토허 40곳 정의(지도·이름의 원천) ──
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const AREAS = [
  ...tohuh.seoul.areas.map((a) => ({ ...a, region: "서울" })),
  ...tohuh.newly.areas.map((a) => ({ ...a, isNew: true, region: "경기" })),
  ...tohuh.existing.areas.map((a) => ({ ...a, region: "경기" })),
];
if (AREAS.length !== 40) throw new Error(`토허 지역이 40곳이 아니다: ${AREAS.length}`);

// ── 전월세 집계 로드 ──
// 전체·지도·순위 = 해당 월(latest). 신규 계약 비중 = 최근 3개월(latest 포함 3개) 합산(안정).
const dir = join(ROOT, "data/datasets/molit-rent");
const recent3 = (() => {
  const y = +latest.slice(0, 4), m = +latest.slice(4);
  return [0, 1, 2].map((i) => { const mm = m - i; const yy = y + Math.floor((mm - 1) / 12); const mo = ((mm - 1 + 1200) % 12) + 1; return `${yy}${String(mo).padStart(2, "0")}`; });
})();
const byGu = {};                 // latest 월 agg
const new3 = {};                 // geoName → {nT, nW} 최근 3개월 합
for (const f of readdirSync(dir)) {
  const m = f.match(/-(\d{6})\.json$/); if (!m) continue;
  const ym = m[1];
  const d = JSON.parse(readFileSync(join(dir, f), "utf8"));
  const gu = d.meta.gu;
  if (ym === latest) byGu[gu] = { ...d.agg, verified: d.meta?.verified };
  if (recent3.includes(ym)) {
    new3[gu] = new3[gu] || { nT: 0, nW: 0 };
    new3[gu].nT += d.agg.newTotal; new3[gu].nW += d.agg.newWolse;
  }
}
const missing = AREAS.filter((a) => !byGu[a.geoName]);
if (missing.length) throw new Error(`${latest} 전월세 집계 없는 토허 지역: ${missing.map((a) => a.geoName).join(", ")} — 수집 확대 필요`);

let T = 0, W = 0, verified = true, n3T = 0, n3W = 0;
for (const a of AREAS) {
  const g = byGu[a.geoName];
  T += g.total; W += g.wolse;
  if (g.verified === false) verified = false;
  const nn = new3[a.geoName] || { nT: 0, nW: 0 };
  n3T += nn.nT; n3W += nn.nW;
}
const r1 = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const allWolse = r1(W, T);         // 40곳 전체 월세비중(해당 월)
const newWolse = r1(n3W, n3T);     // 40곳 신규 월세비중(최근 3개월)
const ratioOf = (geoName) => byGu[geoName].wolseRatio;

/* CTA 막대그래프: 전체·신규 계약 [전세(코발트) | 월세(빨강)] 가로 누적 막대. 막대 안엔 %만,
   전세/월세는 막대 위 좌우 바깥 라벨. .sm-cta(잉크 배경) 안, 흰 글자. 아래에 '신규: 최근 3개월'. */
function ctaBars(allW, newW) {
  const COB = "rgba(46,107,255,0.72)", RED = "rgba(229,72,77,0.72)"; // 연하게(투명도↑)
  const seg = (pct, bg) =>
    `<div style="width:${pct}%;background:${bg};display:flex;align-items:center;justify-content:center;color:#fff;` +
    `font-family:var(--font-num);font-weight:900;font-size:24px">${pct}%</div>`;
  const bar = (rowLabel, wolse) => {
    const je = Math.round((100 - wolse) * 10) / 10;
    return `<div style="display:flex;align-items:center;gap:16px;margin-top:12px">` +
      `<div style="width:104px;font-size:25px;font-weight:800;color:#141821;letter-spacing:-0.01em">${rowLabel}</div>` +
      `<div style="flex:1;display:flex;height:46px;border-radius:10px;overflow:hidden">` +
      seg(je, COB) + seg(wolse, RED) +
      `</div></div>`;
  };
  return `<div>` +
    `<div style="display:flex;align-items:center;gap:16px">` +
      `<div style="width:104px"></div>` +
      `<div style="flex:1;display:flex;justify-content:space-between;font-size:24px;font-weight:800">` +
        `<span style="color:#2e6bff">전세</span><span style="color:#e5484d">월세</span></div></div>` +
    bar("전체 계약", allW) + bar("신규 계약", newW) +
    `</div>`;
}

// ── 지도: 토허 40곳 코로플레스(월세비중), 라벨 = 지역/비중% 2줄 ──
// 색: 꼴찌(최소 비중)=옅은 회색 → 1위(최대 비중)=빨강. 실제 [min,max] 정규화로 대비를 준다.
const ratios = AREAS.map((a) => ratioOf(a.geoName));
const parts = tohuhParts(AREAS);
const mapSvg = tohuhMapSvg({
  parts,
  valueOf: (info) => ratioOf(info.geoName),
  textOf: (p) => `${p.v}%`,
  minValue: Math.min(...ratios),
  maxValue: Math.max(...ratios),
  colorLo: [233, 236, 239], // 옅은 회색(전세 많음)
  colorHi: [224, 96, 100],  // 빨강(월세 많음) — 잉크 글자가 읽히도록 톤 조절
  textThreshold: 9,         // 글자 전체 잉크색 통일(흰 글자 안 씀)
  twoLine: true,
  labelWidth: 118,
  placement: "nearest",
});

// ── 순위: 1~17위 + ··· + 38~40위 ──
const ranked = [...AREAS].sort((a, b) => ratioOf(b.geoName) - ratioOf(a.geoName));
const MEDALS = ["🥇", "🥈", "🥉"];
const rows = ranked.slice(0, 17).map((a, i) => ({
  rank: i + 1, medal: MEDALS[i] || "", top: i < 3,
  gu: a.label, hits: ratioOf(a.geoName).toFixed(1),
}));
// 하위 3곳(38~40위) — 전세가 가장 많은 지역
const bottom = ranked.slice(-3);
const tail = {
  rows: bottom.map((a, idx) => ({
    rank: AREAS.length - 2 + idx, gu: a.label, hits: ratioOf(a.geoName).toFixed(1),
  })),
  // 주석 괄호는 CTA 박스와 겹쳐 생략(note 없음 → 템플릿이 미표시)
};
const last = bottom[bottom.length - 1];

// 그래픽 안 서울 로고를 제목 앞에 얹는다(저장소 자산 상속)
const seoulLogo = "data:image/svg+xml;base64," + readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg")).toString("base64");

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "singoga-map@1",
  compact: true,
  fitTitle: true,
  ctaRight: true,
  centerBody: true,
  hideFooterId: true, // 아이디는 지도 안 스탬프에 있다 — 푸터 중복 제거(BRAND: 카드당 1개)
  date,
  note: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
  title: `<img class="tlogo" src="${seoulLogo}" alt="" /><span class="hi">월세</span>가 전세를 넘어섰다`,
  head: { l: "지역", r: "월세 비중" },
  unit: "%",
  mapSvg,
  rows,
  tail,
  cta: { barsHtml: ctaBars(allWolse, newWolse), footNote: "※ 신규 : 최근 3개월" },
  source: { name: "국토부 아파트 전월세 실거래 · 서울시 행정경계", period: latestPrefix, verified },
};
writeFileSync(join(outDir, "jeonwolse-map.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`✅ 월세비중 토허지도 40곳 — 전체 월세 ${allWolse}%(신규 ${newWolse}%) · 1위 ${ranked[0].label} ${ratioOf(ranked[0].geoName)}% · 40위 ${last.label} ${ratioOf(last.geoName)}% · 검증=${verified}`);
