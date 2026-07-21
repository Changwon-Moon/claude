/**
 * 시리즈 '대장 도감' — 구별 데이터셋(data/datasets/dogam-*.json) → 3장 캐러셀.
 *  1) 도감 커버(넘버링·정답 가리기)  2) 신고가 TOP(순위표·메달)  3) 왜 대장인가(인사이트)
 * 실행: node scripts/build-dogam-card.mjs <데이터셋파일명> [date]
 *   예: node scripts/build-dogam-card.mjs dogam-gangnam-2026.json 2026-07-21
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const dsFile = process.argv[2] || "dogam-gangnam-2026.json";
const date = process.argv[3] || "2026-07-21";
const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets", dsFile), "utf8"));
const m = ds.meta;
const boss = ds.rows.find((r) => r.boss) || ds.rows[0];
const src = { name: "국토부 공개 실거래 신고가 + 정비사업 공시·보도", asOf: m.asOf };

const outDir = join(ROOT, `data/content/${date}/dogam-${m.no}`);
mkdirSync(outDir, { recursive: true });
const write = (f, o) => writeFileSync(join(outDir, f), JSON.stringify(o, null, 2) + "\n");

// 1) 도감 커버 — 대장 신고가 티저(정답 가리기)
write("1-cover.json", {
  template: "dogam-cover@1", date,
  subtitle: `서울 대장 아파트 도감 · 매주 한 구씩`,
  no: m.no, total: "25", gu: m.gu,
  teaser: "이 동네 대장, 신고가",
  price: `${boss.priceLabel.replace("억", '<em>억</em>')}`,
  priceNote: `${boss.area} · ${boss.date} 실거래 — 어느 아파트일까?`,
  cta: "👉 대장의 정체는 다음 장에서",
  source: src,
});

// 2) 신고가 TOP — 메달 순위표 + 브랜드 컬러칩 (전용면적 상이 주의 명시)
write("2-top.json", {
  template: "ranking-table@1", date,
  title: `${m.gu} 신고가 TOP3`,
  subtitle: "단지별 최고 실거래(신고가) · 전용면적 상이 · 절대가 단순비교 주의",
  nameLabel: "단지", valueLabel: "신고가", subLabel: "전용·시점",
  items: ds.rows.map((r) => ({
    rank: r.rank,
    name: r.name,
    ...(r.logoColor ? { logoColor: r.logoColor, logoText: r.logoText } : {}),
    value: r.priceLabel,
    sub: `${r.area} ${r.date.replace("2026.", "26.")}`,
  })),
  source: src,
});

// 3) 왜 대장인가 — 재건축 스토리 + 다음 편 예고
write("3-why.json", {
  template: "insight-points@1", date,
  subtitle: `대장 도감 No.${m.no} ${m.gu} · 왜 대장인가`,
  title: `${m.gu}, 지금 무슨 일이`,
  points: ds.story.map((s, i) => ({ n: String(i + 1), head: s.head, body: s.body })),
  note: "공개 실거래·정비사업 공시 정리입니다 · 투자 권유가 아닙니다",
  source: src,
});

console.log(`✅ 대장 도감 No.${m.no} ${m.gu} — 3장 생성 → data/content/${date}/dogam-${m.no}/`);
console.log(`   대장: ${boss.name} ${boss.area} ${boss.priceLabel}(${boss.date})`);
