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

// ── 전월세 집계 로드(구별 월세비중) ──
const dir = join(ROOT, "data/datasets/molit-rent");
const byGu = {};
for (const f of readdirSync(dir).filter((f) => f.endsWith(`-${latest}.json`))) {
  const d = JSON.parse(readFileSync(join(dir, f), "utf8"));
  byGu[d.meta.gu] = { ...d.agg, verified: d.meta?.verified };
}
const missing = AREAS.filter((a) => !byGu[a.geoName]);
if (missing.length) throw new Error(`전월세 집계 없는 토허 지역: ${missing.map((a) => a.geoName).join(", ")} — 수집 확대 필요`);

let T = 0, W = 0, nT = 0, nW = 0, verified = true;
for (const a of AREAS) {
  const g = byGu[a.geoName];
  T += g.total; W += g.wolse; nT += g.newTotal; nW += g.newWolse;
  if (g.verified === false) verified = false;
}
const r1 = (a, b) => Math.round((a / b) * 1000) / 10;
const allWolse = r1(W, T);        // 40곳 전체 월세비중
const newWolse = r1(nW, nT);      // 40곳 신규 월세비중
const ratioOf = (geoName) => byGu[geoName].wolseRatio;

// ── 지도: 토허 40곳 코로플레스(월세비중), 라벨 = 지역/비중% 2줄 ──
const parts = tohuhParts(AREAS);
const mapSvg = tohuhMapSvg({
  parts,
  valueOf: (info) => ratioOf(info.geoName),
  textOf: (p) => `${p.v}%`,
  twoLine: true,
  labelWidth: 118,
  placement: "nearest",
});

// ── 순위: 1~12위 + ··· + 40위(꼴찌 하나) ──
const ranked = [...AREAS].sort((a, b) => ratioOf(b.geoName) - ratioOf(a.geoName));
const MEDALS = ["🥇", "🥈", "🥉"];
const rows = ranked.slice(0, 12).map((a, i) => ({
  rank: i + 1, medal: MEDALS[i] || "", top: i < 3,
  gu: a.label, hits: ratioOf(a.geoName).toFixed(1),
}));
const last = ranked[ranked.length - 1];
const tail = {
  rows: [{ rank: AREAS.length, gu: last.label, hits: ratioOf(last.geoName).toFixed(1) }],
  note: `<b>전세가 가장 많은 곳</b>${last.mapLabel ? "" : ""}`,
};

// 그래픽 안 서울 로고를 제목 앞에 얹는다(저장소 자산 상속)
const seoulLogo = "data:image/svg+xml;base64," + readFileSync(join(ROOT, "data/assets/seoul/seoul-logo.svg")).toString("base64");

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "singoga-map@1",
  compact: true,
  fitTitle: true,
  ctaRight: true,
  hideFooterId: true, // 아이디는 지도 안 스탬프에 있다 — 푸터 중복 제거(BRAND: 카드당 1개)
  date,
  note: `오늘의 주요 부동산 이슈 (${date.replace(/-/g, ".")})`,
  title: `<img class="tlogo" src="${seoulLogo}" alt="" /><span class="hi">월세</span>가 전세를 넘어섰다`,
  subtitle: `수도권 토허구역 40곳 · ${latestPrefix} · 구별 월세 비중 (아파트 전월세 실거래)`,
  head: { l: "지역", r: "월세 비중" },
  unit: "%",
  mapSvg,
  rows,
  tail,
  cta: {
    title: `새로 맺는 계약, <b>절반 넘게</b> 월세 🏠`,
    rows: [
      { k: "전체 계약", v: `월세 ${allWolse}%`, n: "" },
      { k: "신규 계약", v: `월세 ${newWolse}%`, n: "" },
    ],
  },
  footnote: `${latestPrefix} 토허 40곳 아파트 전월세 <b>${T.toLocaleString()}건</b> 중 월세 <b>${allWolse}%</b> · 신규계약은 <b>${newWolse}%</b>`,
  source: { name: "국토부 아파트 전월세 실거래 · 서울시 행정경계", period: latestPrefix, verified },
};
writeFileSync(join(outDir, "jeonwolse-map.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`✅ 월세비중 토허지도 40곳 — 전체 월세 ${allWolse}%(신규 ${newWolse}%) · 1위 ${ranked[0].label} ${ratioOf(ranked[0].geoName)}% · 40위 ${last.label} ${ratioOf(last.geoName)}% · 검증=${verified}`);
