/**
 * data/datasets/metro-speed-2026.json → 노선별 최고 표정속도 ranking-table 콘텐츠.
 * 수치는 데이터셋(1차/2차 출처)에서 코드로 추출. 거리·시간이 있으면 표정속도를
 * km÷(min/60)로 재계산해 표기값과 내부정합을 검증(오차>2km/h면 경고).
 * 실행: node scripts/build-metro-speed-card.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-20";

const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/metro-speed-2026.json"), "utf8"));

// 내부정합 검증: 표기 표정속도 vs 거리/시간 재계산
let maxDiff = 0;
for (const l of ds.lines) {
  if (l.km && l.min) {
    const calc = l.km / (l.min / 60);
    const diff = Math.abs(calc - l.kmh);
    maxDiff = Math.max(maxDiff, diff);
    if (diff > 2) console.warn(`⚠️ ${l.line} 표정속도 불일치: 표기 ${l.kmh} vs 재계산 ${calc.toFixed(1)} (차 ${diff.toFixed(1)})`);
  }
}

const sorted = [...ds.lines].sort((a, b) => b.kmh - a.kmh);
const items = sorted.map((l, i) => ({
  name: l.line,
  rank: String(i + 1),
  logoColor: l.color,
  logoText: l.chip,
  value: l.kmh.toFixed(1),
}));

const content = {
  template: "ranking-table@1",
  date,
  subtitle: "각 노선 가장 빠른 구간 기준 · 1·9호선 급행 · 신분당선 강남–정자",
  title: "수도권 전철 표정속도 순위",
  nameLabel: "노선",
  valueLabel: "표정속도(km/h)",
  items,
  source: { name: "한우진 표정속도표 · 신분당선 나무위키(2차)", asOf: ds.meta.asOf },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "metro-speed.json"), JSON.stringify(content, null, 2) + "\n");
console.log(`✅ metro-speed.json — ${items.length}개 노선. 표정속도순 정렬. 내부정합 최대오차 ${maxDiff.toFixed(1)}km/h.`);
console.log(`   ${ds.meta.verified ? "verified ✓" : "⚠️ verified=false — 발행 전 1차(운영사 거리·소요) 재확인 / 신분당선 2차출처"}`);
