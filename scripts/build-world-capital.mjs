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
import { worldFlowSvg } from "./lib/world-map.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = process.argv[2] || kstToday;

// ── 출자국(자본 국적) — 지도 강조. name 은 world-countries.geojson properties.name ──
const sources = [
  { name: "Canada", flag: "🇨🇦" },
  { name: "United States of America", flag: "🇺🇸" },
  { name: "United Kingdom", flag: "🇬🇧", dx: -30, dy: -6 }, // 네덜란드와 붙어 라벨 살짝 벌림
  { name: "Netherlands", flag: "🇳🇱", dx: 30 },
  { name: "Singapore", flag: "🇸🇬", lon: 103.8, lat: 1.35 }, // 110m 지도엔 폴리곤 없음 → 점 표시
];
const mapSvg = worldFlowSvg({ sources, dest: { name: "South Korea", lon: 126.98, lat: 37.57, label: "서울" } });

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
  subtitle: "서울 임대주택 사 모으는 글로벌 큰손 9곳",
  mapSvg,
  rows,
  insight: `전세가 사라진 자리, <b>글로벌 자본</b>이 들어온다`,
  source: { name: "각 사 발표·언론 보도 종합", period: "2026", verified: false },
};
writeFileSync(join(outDir, "world-capital.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");
console.log(`✅ world-capital — 출자국 ${sources.length}개국 · 투자자 ${rows.length}곳 · ${date}`);
