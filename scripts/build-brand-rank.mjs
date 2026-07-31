/**
 * 🧪 시안 — 아파트 브랜드 순위, 조사 5곳을 한 표에. brand-rank-grid@1.
 *
 * ⚠️ 오너 확정 전 **시안**이다. sets.json·builders.json 에 등록하지 않는다.
 *
 * ── 무엇을 말하는 카드인가
 * "아파트 브랜드 1위"는 조사마다 다르다. 2026년만 봐도 래미안·자이·힐스테이트가 각각 1위다.
 * 한 조사만 보여주면 그 조사가 진실처럼 읽힌다. **다섯을 겹쳐 놓으면** 순위를 만드는 것이
 * 실력 차가 아니라 조사 성격이라는 게 보인다 — 그게 이 카드의 문장이다.
 *
 * ── 수치는 어디서 오나
 * data/datasets/apt-brand-rankings-2026.json 하나만 읽는다. 그 파일은 원 발표를 직접 열어
 * 확인한 것만 담고, 못 본 자리는 null 이다. **이 스크립트는 null 을 채우지 않는다** —
 * '발표 없음'이라고 카드에 적는다. 빈칸은 "못 찾았다"로 읽히지만 적어 두면 사실이 된다.
 *
 * ── 색과 로고
 * 브랜드색은 로고 픽셀에서 뽑은 값(brand-colors.json + overrides)을 쓴다.
 * 로고가 없는 브랜드는 이름만 적는다 — **회사 로고로 대신하지 않는다**
 * (2026-07-31 '압구정 현대'에 힐스테이트가 붙었던 사고와 같은 규칙).
 *
 * 실행: node scripts/build-brand-rank.mjs [date=2026-07-31]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPalette } from "./lib/brand-palette.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/apt-brand-rankings-2026.json"), "utf8"));
const { byName: BRAND } = loadPalette();

/* 브랜드 → 로고 파일. 허브에 **실제로 있는 것만** 쓴다.
 * 없는 브랜드(아이파크·위브)는 이름만 나간다 — 회사 로고를 끌어다 쓰지 않는다. */
const SLUG = {
  래미안: "raemian-symbol", 힐스테이트: "hillstate", 자이: "xi", 롯데캐슬: "lottecastle",
  푸르지오: "prugio", 더샵: "thesharp", e편한세상: "epyeonhansesang", SK뷰: "skview",
  아크로: "acro", 디에이치: "theh", 르엘: "leel", 오티에르: "hauterre", 써밋: "summit",
  드파인: "define",
  // 아직 못 받은 것 — 오너에게 요청 중(2026-07-31)
  아이파크: "ipark", 위브: "weve", 포레나: "forena",
};
const fileOf = (brand) => {
  const slug = SLUG[brand];
  if (!slug) return null;
  for (const ext of ["svg", "png"]) {
    if (existsSync(join(ROOT, `templates/_shared/logos/${slug}.${ext}`))) return `${slug}.${ext}`;
  }
  return null;
};
const colorOf = (brand) => BRAND.get(brand)?.hex || "#5B6B7F";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
const N = 5;
const cols = Array.from({ length: N }, (_, i) =>
  MEDAL[i + 1] ? `<span class="md">${MEDAL[i + 1]}</span>` : String(i + 1),
);

const missingLogos = new Set();
const rows = doc.surveys.map((s) => ({
  label: s.name,
  /* 발표 주체는 한 줄에 들어가야 한다 — 두 줄이 되면 조사명과 어깨가 어긋난다.
     기관이 둘인 조사는 앞의 것(의뢰처)만 적고, 전체는 데이터셋과 캡션이 갖고 있다. */
  by: `${s.by.split(" · ")[0]} · ${s.asOf.split(" · ")[0]}`,
  kind: s.kind,
  cells: s.ranks.slice(0, N).map((r) => {
    if (!r.brand) return { empty: "발표\n없음" };
    const logo = fileOf(r.brand);
    if (!logo) missingLogos.add(r.brand);
    const cell = { brand: r.brand, color: colorOf(r.brand) };
    if (logo) cell.logo = logo;
    if (r.score) cell.score = r.score;
    /* 공동 순위 — 한 칸에 둘. 둘 중 하나만 적으면 그 조사를 잘못 옮기는 것이다. */
    if (r.tie) {
      cell.brand2 = r.tie;
      const l2 = fileOf(r.tie);
      if (l2) cell.logo2 = l2; else missingLogos.add(r.tie);
    }
    return cell;
  }),
}));

/* 1위가 몇 종류인지 세어 부제에 쓴다 — 손으로 적으면 데이터가 바뀔 때 거짓이 된다. */
const firsts = [...new Set(doc.surveys.map((s) => s.ranks[0]?.brand).filter(Boolean))];

const card = {
  template: "brand-rank-grid@1",
  date,
  title: `아파트 브랜드 1위, <span class="hi">조사마다 다르다</span>`,
  subtitle: `아파트 브랜드 순위 조사 ${doc.surveys.length}곳 · 1~5위 비교`,
  cols,
  rows,
  note:
    `같은 브랜드를 재는데 1위가 ${firsts.length}곳으로 갈립니다 — ${firsts.join("·")}.\n` +
    `무엇을 재는 조사인지(회색 표)를 함께 보세요.`,
  source: { name: "각 조사기관 발표", asOf: doc.verifiedAt },
};

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "brand-rank.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`🧪 시안 brand-rank — 조사 ${rows.length}곳 × 1~${N}위`);
console.log(`   1위 종류: ${firsts.join(", ")}`);
const cells = rows.flatMap((r) => r.cells);
console.log(`   칸 ${cells.length}개 · 로고 ${cells.filter((c) => c.logo).length} · 발표 없음 ${cells.filter((c) => c.empty).length}`);
if (missingLogos.size) console.log(`   ⚠ 로고 없음(이름만 표기): ${[...missingLogos].join(", ")}`);
console.log(`   → data/out/_spike/brand-rank.json`);
