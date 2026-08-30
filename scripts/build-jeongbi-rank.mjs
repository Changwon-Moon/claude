/**
 * 건설사 도시정비사업 누적 수주 순위 — ranking-table@1 재사용.
 *
 * ── 소재 (2026-07-31 오너 제공)
 * 뉴시스 인포그래픽 '주요 건설사 정비사업 누적 수주 현황'(2026-07-31, 안지혜 기자).
 * 오너 지시는 "기사 내 인포그래픽을 따라 그린다" — **정보 구성**을 따르되
 * 그래픽을 모사하지 않는다. 남의 톤으로 나가면 브랜드 일관성이 깨진다.
 *
 * ── 왜 메달(🥇)을 빼는가
 * `research/ideas.json` 의 '브랜드 계급도' 소재에 **⚠️민감 · "서열 아님" 프레임 필수**
 * 라고 적혀 있다. 수주액은 회사의 우열이 아니라 그 해 무엇을 따냈는가의 기록이다.
 * `plainRank: true` 로 숫자만 쓴다.
 *
 * ── 왜 로고를 안 붙이는가
 * 허브에 현대건설·삼성물산 로고가 없다. 있는 `hyundai.svg` 는 **현대자동차** 마크다.
 * 비슷하다고 갖다 쓰면 그 자체가 오보다. `hideMark: true` 로 표식을 지운다.
 *
 * 실행: node scripts/build-jeongbi-rank.mjs [date=2026-07-31]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const DS = join(ROOT, "data/datasets/jeongbi-order-2026-07.json");

const doc = JSON.parse(readFileSync(DS, "utf8"));

/* ── 단위 가드 ──
 * 천원→만원 오용으로 송파 월세가 23만원이 된 사고가 있었다(CARD_CHECKLIST §2).
 * 기대와 다르면 계산하지 말고 던진다. */
if (doc.meta?.unit !== "억원") {
  throw new Error(`단위가 '억원'이 아니다: ${doc.meta?.unit} — 환산식을 다시 확인하라`);
}

const items = doc.items;
if (!Array.isArray(items) || items.length < 2) throw new Error("items 가 비었다");

/* ── 정합성 가드 ──
 * 데이터셋 meta 에 적어 둔 합계와 실제 합계가 어긋나면, 둘 중 하나는 손으로 고쳐진 것이다.
 * 그대로 카드를 만들면 오보가 된다. */
const sum = items.reduce((a, r) => a + r.amount, 0);
if (sum !== doc.meta.crosscheck.sumOfItems) {
  throw new Error(`합계 불일치: 계산 ${sum} vs meta ${doc.meta.crosscheck.sumOfItems}`);
}

const sorted = [...items].sort((a, b) => b.amount - a.amount);

/** 억원 → "N조 N,NNN억" (조 단위가 0이면 억만) */
function won(억) {
  const jo = Math.floor(억 / 10000);
  const rest = 억 % 10000;
  if (!jo) return `${rest.toLocaleString("ko-KR")}억`;
  return `${jo}조 ${rest.toLocaleString("ko-KR")}억`;
}

/* ── 제목 문구는 계산이 확인했을 때만 나간다 ──
 * "역사상 최고"·"N조씩" 같은 말을 손으로 적으면 다음 갱신에 거짓이 된다(CARD_CHECKLIST §2).
 * 1·2위가 둘 다 7조를 넘을 때만 '나란히 7조'라고 쓴다. */
const [a, b] = sorted;
const bothOver7jo = a.amount >= 70000 && b.amount >= 70000;
const gap = a.amount - b.amount;
const title = bothOver7jo ? "1·2위가 나란히 7조를 넘겼다" : `${a.name}이 올해 정비사업 1위`;

/* 상위 몇 곳이 전체의 얼마를 가져갔는지 — 표만 있으면 독자가 직접 더해야 한다 */
const top3 = sorted.slice(0, 3).reduce((s, r) => s + r.amount, 0);
const top3Share = Math.round((top3 / sum) * 1000) / 10;

const card = {
  template: "ranking-table@1",
  date,
  badge: "도시정비 수주",
  title,
  subtitle: `2026년 누적 · ${doc.meta.asOf.replace(/-/g, ".").slice(2)} 기준 · 9개사 합계 ${won(sum)}`,
  nameLabel: "건설사",
  valueLabel: "누적 수주액",
  /* ⚠️ 보조 열(sub)을 쓰지 않는다 — 이 카드는 값이 길어서 4열이 안 들어간다.
   * 두 번 시도해 보고 접었다(2026-07-31):
   *   ① 사업지("압구정3구역 외 3곳") → 188px 칸을 넘쳐 수주액을 통째로 덮었다
   *   ② 비중("24.8%")     → 이번엔 반대로 값("7조 6,946억")이 176px(--val-w)를
   *                          넘쳐 비중을 덮었다. 값이 긴 게 근본 원인이다
   * 그래서 3열(순위·건설사·수주액)로 간다. 값을 "7.69조"처럼 줄이면 4열도 되지만,
   * 억 단위를 버리면 "6,946억"이 주는 실감이 사라진다 — 인스타에서는 큰 숫자가 훅이다.
   * 사업지와 비중은 캡션이 갖는다. 카드는 한 가지만 또렷하게 말한다. */
  // 로고 없음 + 서열 프레임 회피 (파일 상단 주석 참고)
  hideMark: true,
  plainRank: true,
  items: sorted.map((r) => ({
    name: r.name,
    value: won(r.amount),
  })),
  source: {
    name: "각 사 · 뉴시스 정리",
    // 템플릿이 "기준"을 붙인다 — 여기서 또 붙이면 "기준 기준"이 된다(2026-07-31 실수)
    asOf: doc.meta.asOf,
  },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "jeongbi-rank.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

/* ── 캡션도 코드가 만든다 ──
 * 손으로 적으면 다음 갱신에 카드와 어긋난다(CLAUDE.md §4). */
const capDir = join(ROOT, "data/review/captions");
mkdirSync(capDir, { recursive: true });
const caption = [
  `${title}`,
  ``,
  `올해 도시정비사업 누적 수주(${doc.meta.asOf.replace(/-/g, ".")} 기준)입니다.`,
  `${a.name} ${won(a.amount)}, ${b.name} ${won(b.amount)}.`,
  `두 곳의 차이는 ${gap.toLocaleString("ko-KR")}억원입니다.`,
  ``,
  `9개사를 합치면 ${won(sum)}이고, 상위 3곳이 그중 ${top3Share}%를 가져갔습니다.`,
  `하반기에는 목동 재건축과 성수전략정비구역이 남아 있습니다.`,
  ``,
  `[주요 사업지 · 전체 비중]`,
  ...sorted.map(
    (r) =>
      `· ${r.name} (${(Math.round((r.amount / sum) * 1000) / 10).toFixed(1)}%) — ${r.sites.join(", ")}`,
  ),
  ``,
  `※ 순위는 회사의 우열이 아니라 올해 무엇을 수주했는지의 기록입니다.`,
  `※ 자료: 각 사 (뉴시스 2026-07-31 정리). 1차 출처 대조 전입니다.`,
  ``,
  `#부동산 #재건축 #재개발 #도시정비사업 #건설사 #압구정 #성수동 #목동재건축 #부동산정보 #위릿`,
].join("\n");
writeCaption("jeongbi-rank", caption); // ⚠️ 서명은 writeCaption 이 붙인다 (lib/caption-signature.mjs)

console.log(`🃏 jeongbi-rank — ${sorted.length}개사`);
console.log(`   제목: ${title}`);
console.log(`   1·2위 격차 ${gap.toLocaleString("ko-KR")}억원 · 합계 ${won(sum)} · 상위3 비중 ${top3Share}%`);
console.log(`   → data/content/${date}/jeongbi-rank.json`);
console.log(`   → data/review/captions/jeongbi-rank.txt`);
