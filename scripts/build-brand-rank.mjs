/**
 * 아파트 브랜드 순위, 조사 5곳을 한 표에. brand-rank-grid@1.
 * ✅ 오너 확정 2026-07-31 — builders.json·sets.json·pixel-baselines.json 등록 완료.
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
/* 머리줄은 '메달 + n위'다(오너 지시 2026-07-31). 메달만 두면 4·5위와 표기 규칙이 갈라져
 * 눈이 한 번 더 멈춘다. 메달은 1~3위의 장식이고, 순위 이름은 다섯 칸 모두 같은 말로 적는다. */
const cols = Array.from({ length: N }, (_, i) =>
  (MEDAL[i + 1] ? `<span class="md">${MEDAL[i + 1]}</span>` : "") + `${i + 1}위`,
);

const missingLogos = new Set();
/* K-BPI 를 맨 아래로 내린다(오너 지시 2026-07-31).
 * 1~3위만 발표하는 조사라 4·5위가 '발표 없음'으로 비는데, 그게 표 맨 위에 오면
 * 표 전체가 비어 보인다. 채워진 줄이 먼저 읽히고 예외가 아래에 놓이는 편이 낫다. */
const ordered = [...doc.surveys].sort((a, b) => (a.id === "A1" ? 1 : 0) - (b.id === "A1" ? 1 : 0));
const rows = ordered.map((s) => ({
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
    /* 공동 순위 — 한 칸을 좌우로 나눠 각자 로고와 이름을 준다.
     * 둘 중 하나만 적으면 그 조사를 잘못 옮기는 것이고,
     * 로고 둘에 이름 한 덩어리를 붙이면 어느 이름이 어느 로고인지 모른다. */
    if (r.tie) {
      const mk = (b) => {
        const f = fileOf(b);
        if (!f) missingLogos.add(b);
        return { brand: b, color: colorOf(b), ...(f ? { logo: f } : {}) };
      };
      return { pair: [mk(r.tie), mk(r.brand)] };   // 데이터의 tie 가 먼저(래미안) — 오너 지정 순서
    }
    return cell;
  }),
}));

/* 1위가 몇 종류인지 세어 부제에 쓴다 — 손으로 적으면 데이터가 바뀔 때 거짓이 된다. */
const firsts = [...new Set(ordered.map((s) => s.ranks[0]?.brand).filter(Boolean))];

const card = {
  template: "brand-rank-grid@1",
  date,
  title: `당신이 아는 아파트 1위, <span class="hi">맞나요?</span>`,   // E안(2026-07-31 오너 선택)
  subtitle: `아파트 브랜드 순위 조사 ${doc.surveys.length}곳 · 1~5위 비교`,
  cols,
  rows,
  /* 기준일을 빼는 이유(오너 지시 2026-07-31): 이 카드의 다섯 줄은 각자 발표 시점이 다르다
   * (2025.3 ~ 2026.7). 카드 아래에 날짜 하나를 적으면 "다섯 조사가 다 그 날짜"로 읽힌다.
   * 각 조사의 시점은 표 왼쪽 칸에 이미 줄마다 적혀 있다 — 거기가 맞는 자리다. */
  source: { name: "각 조사기관 발표" },
};

/* 확정 후 산출 위치를 data/content/{날짜}/ 로 옮겼다(2026-07-31).
 * _spike 는 시안 서랍이라 배포 파이프라인이 쳐다보지 않는다 —
 * 거기 둔 채 sets.json 에만 올리면 '실사이트에 카드가 영영 안 뜬다'(builders.json 주석의 그 사고). */
const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "brand-rank.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`brand-rank — 조사 ${rows.length}곳 × 1~${N}위`);
console.log(`   1위 종류: ${firsts.join(", ")}`);
const cells = rows.flatMap((r) => r.cells);
console.log(`   칸 ${cells.length}개 · 로고 ${cells.filter((c) => c.logo).length} · 발표 없음 ${cells.filter((c) => c.empty).length}`);
if (missingLogos.size) console.log(`   ⚠ 로고 없음(이름만 표기): ${[...missingLogos].join(", ")}`);
console.log(`   → data/content/${date}/brand-rank.json`);
