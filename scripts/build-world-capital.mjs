/**
 * 글로벌 자본의 국내 임대시장 진출 — 좌: 제목(세로) / 우: 서울 투자위치 지도 / 하: 투자자 표(위치·세대수). (A안)
 * 소재: claude/소재-글로벌자본-국내임대시장-2026.md (각 사 발표·언론 보도 종합).
 *
 * ⚠️ 뉴스 소재 = verified:false. 금액·세대수는 발표·약정·목표가 섞여 있어 발행 전 1차 출처 재대조(오보 0).
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

// ── 투자 위치(서울만) — 핀 좌표는 seoul-invest-map.mjs 가 지오데이터에서 계산(손 좌표 없음) ──
// 서울 외(이천·서울5곳 등 광역)는 지도에 안 찍고 표에만 담는다(오너 지시). dx/dy=라벨 겹침 미세조정.
const spots = [
  { gu: "강동구", label: "강동" },
  { gu: "금천구", dong: "독산", label: "독산", dx: -56, dy: 2 },
  { gu: "금천구", dong: "가산", label: "가산", dx: 40, dy: 52 },
  { gu: "성북구", dong: "안암", label: "안암" },
  { gu: "동대문구", dong: "회기", label: "회기" },
  { gu: "영등포구", dong: "양평", label: "양평" },
  { gu: "강남구", label: "강남" },
  { gu: "중구", dong: "명동", label: "명동", dx: -20 },
  { gu: "중구", dong: "신당", label: "신당", dx: 24, dy: 8 },
  { gu: "서대문구", dong: "신촌", label: "신촌" },
  { gu: "강북구", dong: "수유", label: "수유" },
  { gu: "서초구", dong: "방배", label: "방배" },
];
const mapSvg = seoulInvestSvg({ spots });

// ── 투자자 표(9곳): 국기 · 투자자(파트너) · 투자 위치 · 세대수·규모 ──
// amount = 세대수(있으면) 또는 발표 금액. muted=회색(비공개/정성 표기).
const rows = [
  { flag: "🇳🇱", investor: "APG 연기금", partner: "티시먼스파이어·바우인베스트", loc: "이천 외 수도권", amount: "4,600", unit: "억" },
  { flag: "🇨🇦", investor: "CPPIB 캐나다연금", partner: "MGRV", loc: "서울 5곳", amount: "약1,500", unit: "실" },
  { flag: "🇬🇧", investor: "ICG", partner: "홈즈컴퍼니", loc: "강남·가산·명동", amount: "3,000", unit: "억" },
  { flag: "🇺🇸", investor: "모건스탠리", partner: "SK디앤디", loc: "강동·독산·안암", amount: "388", unit: "실" },
  { flag: "🇸🇬", investor: "GIC 싱가포르투자청", partner: "SK디앤디", loc: "수유", amount: "600", unit: "억" },
  { flag: "🇺🇸", investor: "KKR", partner: "위브리빙", loc: "회기·양평", amount: "1,200", unit: "실" },
  { flag: "🇺🇸", investor: "워버그핀커스", partner: "SK디앤디", loc: "방배 시니어", amount: "비공개", muted: true },
  { flag: "🇬🇧", investor: "M&G", partner: "SK디앤디", loc: "신당", amount: "97", unit: "세대" },
  { flag: "🇺🇸", investor: "하인즈", partner: "직접 매입", loc: "신촌", amount: "106", unit: "세대" },
];

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const doc = {
  template: "world-capital@1",
  date,
  note: "주요 부동산 이슈 • 2026",
  title: `전세가<br/>사라진<br/>자리,<br/><span class="co">글로벌</span><br/><span class="co">자본</span>이<br/>들어온다`,
  mapSvg,
  rows,
  source: { name: "각 사 발표·언론 보도 종합", period: "2026", verified: false },
};
writeFileSync(join(outDir, "world-capital.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");
console.log(`✅ world-capital — 서울 투자 위치 ${spots.length}곳 · 투자자 ${rows.length}곳 · ${date}`);
