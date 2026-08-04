/**
 * 글로벌 자본의 국내 임대시장 진출 — 세계지도(출자국→서울) + 투자자 표. (A안)
 * 소재: claude/소재-글로벌자본-국내임대시장-2026.md (각 사 발표·언론 보도 종합).
 *
 * ⚠️ 뉴스 소재 = verified:false. 금액은 발표·약정·목표가 섞여 있어 발행 전 1차 출처 재대조(오보 0).
 *    카드에는 발표 헤드라인 수치를, 세부·상충치는 캡션이 갖는다(jeongbi-board 선례).
 *
 * 실행: node scripts/build-world-capital.mjs [date=오늘]
 * 출력: data/content/{date}/world-capital.json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { seoulInvestSvg } from "./lib/seoul-invest-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[2] || kstToday;

// ── 투자 위치(서울 25구) — 핀 좌표는 seoul-invest-map.mjs 가 지오데이터에서 계산(손 좌표 없음) ──
// 동을 주면 해당 동 중심, 없으면 구 중심. dx/dy 는 라벨 겹침 미세조정.
const spots = [
  { gu: "강동구", label: "강동" },
  { gu: "성북구", dong: "안암", label: "안암" },
  { gu: "동대문구", dong: "회기", label: "회기" },
  { gu: "영등포구", dong: "양평", label: "양평" },
  { gu: "강남구", label: "강남" },
  { gu: "금천구", dong: "독산", label: "독산", dx: -56, dy: 2 },
  { gu: "금천구", dong: "가산", label: "가산", dx: 40, dy: 52 },
  { gu: "중구", dong: "명동", label: "명동", dx: -20 },
  { gu: "중구", dong: "신당", label: "신당", dx: 24, dy: 8 },
  { gu: "서대문구", dong: "신촌", label: "신촌" },
  { gu: "강북구", dong: "수유", label: "수유" },
  { gu: "서초구", dong: "방배", label: "방배" },
];
const mapSvg = seoulInvestSvg({ spots });

// ── 투자자 표(9곳) — 뉴스 소재값. cash=코발트, 자산규모=회색(muted) ──
const rows = [
  { flag: "🇳🇱", investor: "APG 연기금", partner: "티시먼스파이어·바우인베스트", amount: "4,600", unit: "억" },
  { flag: "🇨🇦", investor: "CPPIB 캐나다연금", partner: "MGRV", amount: "5,000", unit: "억" },
  { flag: "🇬🇧", investor: "ICG", partner: "홈즈컴퍼니", amount: "3,000", unit: "억" },
  { flag: "🇺🇸", investor: "모건스탠리", partner: "SK디앤디", amount: "700", unit: "억" },
  { flag: "🇸🇬", investor: "GIC 싱가포르투자청", partner: "SK디앤디", amount: "600", unit: "억" },
  { flag: "🇺🇸", investor: "KKR", partner: "위브리빙", amount: "1,200실", muted: true },
  { flag: "🇺🇸", investor: "워버그핀커스", partner: "SK디앤디", amount: "방배 시니어", muted: true },
  { flag: "🇬🇧", investor: "M&G", partner: "SK디앤디", amount: "신당 97세대", muted: true },
  { flag: "🇺🇸", investor: "하인즈", partner: "직접 매입", amount: "신촌 106세대", muted: true },
];

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "world-capital@1",
  date,
  note: "해외 자본의 국내 임대시장 진출 · 2026",
  title: `당신 건물주가<br/><span class="co">네덜란드 연기금</span>? 🌍`,
  subtitle: "글로벌 자본이 사들이는 서울 곳곳 — 큰손 9곳",
  mapSvg,
  legend: [
    { cls: "pin", label: "글로벌 자본 투자 위치" },
    { cls: "gu", label: "투자 유입 구" },
  ],
  // insight 는 공간상 생략(부제가 메시지를 가진다) — 9행 표를 온전히 넣기 위함
  rows,
  source: { name: "각 사 발표·언론 보도 종합", period: "2026", verified: false },
};
writeFileSync(join(outDir, "world-capital.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");
console.log(`✅ world-capital — 서울 투자 위치 ${spots.length}곳 · 투자자 ${rows.length}곳 · ${date}`);
