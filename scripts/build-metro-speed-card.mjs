/**
 * data/datasets/metro-speed-2026.json → 수도권 전철 운행속도(표정속도) 정보표 카드.
 * 순위 없이 노선순(1~9·분당·신분당)으로 전 구간 나열. 열: 노선(뱃지)/구간/표정속도.
 * 표정속도는 거리÷시간으로 재계산해 표기값과 내부정합 검증(오차>2km/h면 경고).
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
for (const r of ds.rows) {
  if (r.km && r.min) {
    const diff = Math.abs(r.km / (r.min / 60) - r.kmh);
    maxDiff = Math.max(maxDiff, diff);
    if (diff > 2) console.warn(`⚠️ ${r.line} ${r.seg} 표정속도 불일치: 표기 ${r.kmh} vs 재계산 ${(r.km / (r.min / 60)).toFixed(1)}`);
  }
}

// 노선 순서(meta.order) 유지, 순위 없음. 열: 노선(뱃지)=line, 구간=name, 표정속도=value.
// 같은 노선끼리 묶여 보이도록 노선이 바뀔 때마다 그룹 음영을 교차(grpAlt).
let grp = 0;
let prevKey = null;
const items = ds.rows.map((r) => {
  if (prevKey !== null && r.key !== prevKey) grp++;
  prevKey = r.key;
  return {
    line: r.key,
    name: r.gu ? `${r.seg}(${r.gu})` : r.seg,
    value: r.kmh.toFixed(1),
    grpAlt: grp % 2 === 1,
  };
});

const content = {
  template: "ranking-table@1",
  date,
  hideRank: true,
  subtitle: "표정속도 = 정차·가감속까지 포함한 실제 평균 시속(전체 거리 ÷ 총 소요시간) · 완=완행 급=급행",
  title: "수도권 전철 운행속도",
  logoLabel: "노선",
  nameLabel: "구간",
  valueLabel: "표정속도(km/h)",
  items,
  source: { name: "한우진 표정속도표 · 신분당선 나무위키(2차)", asOf: ds.meta.asOf },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "metro-speed.json"), JSON.stringify(content, null, 2) + "\n");
console.log(`✅ metro-speed.json — ${items.length}개 구간(노선순, 순위없음). 내부정합 최대오차 ${maxDiff.toFixed(1)}km/h.`);
console.log(`   ${ds.meta.verified ? "verified ✓" : "⚠️ verified=false — 발행 전 1차 재확인 / 신분당선 2차출처 / 경의·중앙선 제외"}`);
