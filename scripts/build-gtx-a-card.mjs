/**
 * 시리즈 '지하철이 온다' EP.1 — GTX-A.
 * data/datasets/gtx-a-2026.json(검증·provenance) → 4장 캐러셀.
 *  1) 커버(후킹, 집값 정반대 티저)  2) GTX-A 현황·일정  3) 집값 정반대  4) 인사이트·마무리
 * 실행: node scripts/build-gtx-a-card.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-21";
const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/gtx-a-2026.json"), "utf8"));
const src = { name: "GTX-A 공식·보도 + 국토부 공개 실거래", asOf: ds.meta.asOf };

const outDir = join(ROOT, `data/content/${date}/gtx-a`);
mkdirSync(outDir, { recursive: true });
const write = (f, o) => writeFileSync(join(outDir, f), JSON.stringify(o, null, 2) + "\n");

// 1) 커버 — 집값 정반대 티저
write("1-cover.json", {
  template: "metro-cover-photo@1", date,
  photo: "subway-pexels.jpg",
  hook: 'GTX-A 개통 임박\n동탄→강남 <span class="pt">19분</span>\n그럼 내 집값은?! 🤔',
  top: { line: "GTX-A", seg: "동탄역 대장 단지", value: "17.5", unit: "억", tag: "최고가", emoji: "🔥" },
  bottom: { line: "GTX-A", seg: "파주 운정", value: "제자리", noUnit: true, tag: "선반영?", emoji: "😶" },
  cta: "→ 같은 GTX인데 왜 갈렸나 (다음 장)",
  source: src,
});

// 2) GTX-A 현황·일정 (표정속도 부제)
write("2-status.json", {
  template: "ranking-table@1", date, hideRank: true,
  title: "GTX-A, 지금 어디까지",
  subtitle: "표정속도 90km/h(지하철 3배) · 개통일정 변동 가능",
  logoLabel: "노선", nameLabel: "구간·일정", valueLabel: "소요·시점",
  items: [
    { line: "GTX-A", name: "수서–동탄", value: "19분" },
    { line: "GTX-A", name: "운정중앙–서울역", value: "22분" },
    { line: "GTX-A", name: "서울역~수서 연결", value: "2026.8" },
    { line: "GTX-A", name: "삼성역 개통", value: "2027.6" },
    { line: "GTX-A", name: "창릉역 개통", value: "2030" },
  ],
  source: src,
});

// 3) 집값 정반대 (동탄 상승 vs 운정 정체)
write("3-price.json", {
  template: "ranking-table@1", date, hideRank: true,
  title: "같은 GTX-A, 집값은 정반대",
  subtitle: "동탄 롯데캐슬 vs 파주 운정 · 2025.11 공개 실거래",
  logoLabel: "노선", nameLabel: "단지·구간", valueLabel: "실거래",
  items: [
    { line: "GTX-A", name: "동탄역 84㎡", value: "17.5억", hl: "fast" },
    { line: "GTX-A", name: "동탄역 65㎡", value: "14.6억", hl: "fast" },
    { line: "GTX-A", name: "파주 운정 84㎡", value: "6~7억", hl: "slow" },
  ],
  source: src,
});

// 4) 인사이트·마무리 (정직 원칙)
write("4-insight.json", {
  template: "insight-points@1", date,
  subtitle: "GTX-A 개통과 역세권 · 시리즈 '지하철이 온다' EP.1",
  title: "GTX 호재, 이것만 기억",
  points: [
    { n: "1", head: '개통 <em>전</em>에 먼저 오른다', body: "호재는 착공·발표 때 선반영 — 개통 시점엔 이미 반영됐을 수 있음" },
    { n: "2", head: '<em>강남 직결</em>이 진짜 변수', body: "동탄(수서·강남 직결)은 강세, 파주 운정(강남 미직결)은 정체 — 단축시간보다 '어디에 닿나'" },
    { n: "3", head: '일정은 <em>변동</em>된다', body: "서울역~수서 연결도 6월→8월 지연 — 개통일은 계획일 뿐" },
  ],
  note: "공공데이터·공개 실거래 정리입니다 · 투자 권유가 아닙니다",
  source: src,
});

console.log("✅ GTX-A EP.1 4장 생성 → data/content/" + date + "/gtx-a/");
