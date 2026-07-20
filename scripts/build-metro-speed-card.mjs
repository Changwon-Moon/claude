/**
 * data/datasets/metro-speed-2026.json → 표정속도 카드들.
 * 출력:
 *  1) metro-speed.json        — 전 구간, 표정속도 내림차순, 순위 없음, 짝수행 음영(정보표)
 *  2) metro-speed-cover.json  — 캐러셀 1p 커버: 제일 빠른/느린 구간 대비(하이라이트) + 후킹 제목
 *  3) metro-speed-hl.json     — 캐러셀 2p: 전체 표 + 제일 빠른(fast)/느린(slow) 하이라이트
 * 표정속도는 거리÷시간으로 재계산해 표기값과 내부정합 검증(오차>2km/h면 경고).
 * 실행: node scripts/build-metro-speed-card.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-20";
const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/metro-speed-2026.json"), "utf8"));

// 내부정합 검증
let maxDiff = 0;
for (const r of ds.rows) {
  if (r.km && r.min) {
    const diff = Math.abs(r.km / (r.min / 60) - r.kmh);
    maxDiff = Math.max(maxDiff, diff);
    if (diff > 2) console.warn(`⚠️ ${r.line} ${r.seg} 표정속도 불일치: 표기 ${r.kmh} vs 재계산 ${(r.km / (r.min / 60)).toFixed(1)}`);
  }
}

// 표정속도 내림차순 정렬
const sorted = [...ds.rows].sort((a, b) => b.kmh - a.kmh);
const segName = (r) => (r.gu ? `${r.seg}(${r.gu})` : r.seg);
const toItem = (r, hl) => ({ line: r.key, name: segName(r), value: r.kmh.toFixed(1), ...(hl ? { hl } : {}) });

const fast = sorted[0];
const slow = sorted[sorted.length - 1];
const src = { name: "각 노선 운영사 영업거리·소요시간 기준 표정속도 산출", asOf: ds.meta.asOf };
const subtitleShort = "표정속도 = 정차·가감속까지 포함한 실제 평균 시속";
const labels = { logoLabel: "노선", nameLabel: "구간", valueLabel: "표정속도(km/h)" };

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
const write = (file, obj) => writeFileSync(join(outDir, file), JSON.stringify(obj, null, 2) + "\n");

// 1) 정보표(순위없음, 표정속도순, 짝수행 음영) — 하이라이트 없음
write("metro-speed.json", {
  template: "ranking-table@1", date, hideRank: true, subtitle: subtitleShort,
  title: "수도권 전철 운행속도", ...labels,
  items: sorted.map((r) => toItem(r)), source: src,
});

// 2) 캐러셀 1p 커버: 제일 빠른 vs 제일 느린 (하이라이트)
write("metro-speed-cover.json", {
  template: "ranking-table@1", date, hideRank: true, hlTag: true,
  subtitle: subtitleShort,
  title: "출근길 지하철, 실제 시속은?", ...labels,
  items: [toItem(fast, "fast"), toItem(slow, "slow")], source: src,
});

// 3) 캐러셀 2p: 전체 표 + 극단값 하이라이트
write("metro-speed-hl.json", {
  template: "ranking-table@1", date, hideRank: true, subtitle: subtitleShort,
  title: "노선별 전 구간 표정속도", ...labels,
  items: sorted.map((r) => toItem(r, r === fast ? "fast" : r === slow ? "slow" : undefined)),
  source: src,
});

// 4) 2단 정보표 — 좌우 2열, km/h는 셀 안, 극단 하이라이트
const half = Math.ceil(sorted.length / 2);
const col = (r) => ({ line: r.key, seg: segName(r), value: r.kmh.toFixed(1), ...(r === fast ? { hl: "fast" } : r === slow ? { hl: "slow" } : {}) });
write("metro-2col.json", {
  template: "metro-2col@1", date,
  subtitle: subtitleShort,
  title: "수도권 노선·구간별 운행속도",
  colHead: { line: "노선", seg: "구간", val: "속도" },
  left: sorted.slice(0, half).map(col),
  right: sorted.slice(half).map(col),
  source: src,
});

// 5) 캐러셀 후킹 커버(실사진) — A안
write("metro-cover-photo.json", {
  template: "metro-cover-photo@1", date,
  photo: "subway-jongno3ga.jpg",
  subtitle: "수도권 전철 표정속도 · 실제 평균 시속",
  photoCredit: "사진 ⓒ LERK · Wikimedia Commons · CC BY-SA 4.0",
  hook: '출근길 지하철 속도,\n1등과 꼴등이\n<span class="pt">같은 노선</span>이라고?',
  top: { line: fast.key, seg: segName(fast), value: fast.kmh.toFixed(1), tag: "최고" },
  bottom: { line: slow.key, seg: segName(slow), value: slow.kmh.toFixed(1), tag: "최저" },
  source: src,
});

console.log(`✅ 5종 생성 — metro-speed · metro-speed-cover · metro-speed-hl · metro-2col · metro-cover-photo(A안)`);
console.log(`   제일 빠름: ${fast.line} ${segName(fast)} ${fast.kmh} / 제일 느림: ${slow.line} ${segName(slow)} ${slow.kmh}`);
console.log(`   내부정합 최대오차 ${maxDiff.toFixed(1)}km/h · ${ds.meta.verified ? "verified ✓" : "verified=false"}`);
