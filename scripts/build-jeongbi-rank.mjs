/**
 * 시공능력평가 상위 건설사 도시정비사업 수주액 → ranking-table@1 카드 + 캡션.
 *
 * 2026-07-31 의 `jeongbi-board`(지도 판형)와 **같은 소재의 다음 판**이지만 판형이 다르다.
 * 이번 자료(2026-09-07)는 회사당 주요 사업지 2곳만 주고 그중 절반이 수도권(안산·광명·
 * 의정부·성남·용인)이라 **서울 지도에 점을 찍을 수 없다.** 지도 판형을 억지로 재활용하면
 * 서울 24곳(7월 뉴시스 지도)과 9월 수주액이 한 카드에 섞여 출처가 둘이 된다 → 순위표로 간다.
 *
 * ── 값을 억원으로 두는 이유 (CARD_CHECKLIST §2 「표」)
 * ranking-table 의 값 열은 `--val-w: 176px` 다. "8조 3,605억" 은 그 폭을 넘겨 옆 칸을 덮는다
 * (2026-07-31 에 같은 자리에서 한 번 걸렸다). 그래서 카드는 `83,605` + 머리글 「수주액(억원)」
 * 로 쓰고, 조 단위 표기는 **캡션**이 맡는다. 열을 넓히는 것은 공용 CSS 라 확정본 51개가 흔들린다.
 *
 * ── 사업지가 카드에 없는 이유
 * 같은 §2: 보조 열(`sub`)은 짧은 수치 전용이고 지명은 길이를 예측할 수 없다.
 * 사업지는 캡션으로 내린다 — 카드는 한 가지(순위와 액수)만 또렷하게 말한다.
 *
 * ── 7월 카드와 증감을 비교하지 않는다
 * 두 자료는 집계 기준이 다르다(데이터셋 meta.compareWarning). GS건설이 7조4,694억 →
 * 5조5,477억으로 **줄어드는데 누적 수주는 줄 수 없다.** 이 빌더는 증감 문장을 만들지 않는다.
 *
 * 실행: node scripts/build-jeongbi-rank.mjs [date=2026-09-09]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-09-09";
const LABEL = "jeongbi-rank";

const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/jeongbi-order-2026-09.json"), "utf8"));

/* ── 가드 ── 자료가 우리가 믿는 모양이 아니면 카드를 만들지 않는다. */
if (ds.meta.unit !== "억원") throw new Error(`단위가 억원이 아니다: ${ds.meta.unit}`);

const scored = ds.items.filter((r) => typeof r.amount === "number");
const blank = ds.items.filter((r) => typeof r.amount !== "number");
if (scored.length + blank.length !== ds.items.length) throw new Error("집계 불일치");

/* 원문 순위가 수주액 내림차순과 어긋나면 옮겨 적다 틀린 것이다. */
const byAmount = [...scored].sort((a, b) => b.amount - a.amount);
byAmount.forEach((r, i) => {
  if (r.rank !== i + 1) throw new Error(`순위 어긋남: ${r.name} 원문 ${r.rank}위 / 금액순 ${i + 1}위`);
});

/* 합계는 데이터셋이 미리 적어 둔 값과 맞아야 한다 — 한 줄을 잘못 옮기면 여기서 걸린다. */
const sum = scored.reduce((a, r) => a + r.amount, 0);
if (sum !== ds.meta.crosscheck.sumOfItems)
  throw new Error(`합계 불일치: 계산 ${sum} / 기재 ${ds.meta.crosscheck.sumOfItems}`);
if (scored.length !== ds.meta.crosscheck.itemsWithAmount)
  throw new Error(`수치 보유 개수 불일치: ${scored.length} / ${ds.meta.crosscheck.itemsWithAmount}`);

const gap = byAmount[0].amount - byAmount[1].amount;
if (gap !== ds.meta.crosscheck.gapTop2) throw new Error(`1·2위 격차 불일치: ${gap}`);

/* ── 표기 ── */
const fmt = (n) => n.toLocaleString("en-US");
/** 억원 정수 → "8조 3,605억" / "4조 110억" / "4,096억". 조 자리가 없으면 조를 안 쓴다. */
const won = (n) => {
  const jo = Math.floor(n / 10000);
  const eok = n % 10000;
  if (!jo) return `${fmt(eok)}억`;
  return eok ? `${jo}조 ${fmt(eok)}억` : `${jo}조`;
};

const items = byAmount.map((r) => ({
  name: r.shortName || r.name,
  rank: String(r.rank),
  logo: r.logo,
  logoExt: "png",
  value: fmt(r.amount),
}));

const content = {
  template: "ranking-table@1",
  date,
  subtitle: `시공능력평가 상위 10개사 · 2026년 1월~9월 7일 누적`,
  title: "올해 정비사업 수주 1위는?",
  nameLabel: "건설사",
  valueLabel: "수주액(억원)",
  items,
  source: { name: "취재 종합", asOf: ds.meta.asOf },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${LABEL}.json`), JSON.stringify(content, null, 2) + "\n");

/* ── 캡션 ── 카드에 없는 것(조 단위 액수·주요 사업지)을 캡션이 맡는다.
 * 문장의 수치는 전부 위에서 계산한 값이다. 손으로 적는 숫자는 없다. */
const top = byAmount[0];
const rankLines = byAmount.map((r) => `${r.rank}위 ${r.name} ${won(r.amount)}`).join("\n");
const siteLines = byAmount
  .filter((r) => r.sites.length)
  .map((r) => `· ${r.name} — ${r.sites.join(", ")}`)
  .join("\n");
const overTen = byAmount.filter((r) => r.amount >= 10000).length;

/** 받침이 있으면 첫 조사, 없으면 둘째. 이름을 손으로 이어 붙이면 언젠가 "현대엔지니어링는" 이 된다. */
const josa = (word, withBatchim, without) => {
  const last = word.charCodeAt(word.length - 1);
  const hasBatchim = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return hasBatchim ? withBatchim : without;
};
const blankNames = blank.map((r) => r.name).join("·");
const blankNote = blank.length
  ? `시공능력평가 ${blank.map((r) => r.rank).join("·")}위 ${blankNames}${josa(
      blankNames,
      "은",
      "는",
    )} 원문에 수주액이 '–'로 비어 있어 뺐습니다.`
  : "";

/** 같은 동네에 몰린 회사들의 순위를 **사업지 목록에서 세어** 문장을 만든다.
 * 손으로 "1·3위가 압구정" 이라고 적으면 다음 갱신 때 순위가 바뀌어도 문장이 안 바뀐다. */
const clusterOf = (word) =>
  byAmount.filter((r) => r.sites.some((s) => s.includes(word))).map((r) => r.rank);
const clusters = ["압구정", "성수"]
  .map((w) => ({ w, ranks: clusterOf(w) }))
  .filter((c) => c.ranks.length >= 2)
  .map((c) => `${c.w}에 ${c.ranks.join("·")}위`);
const clusterLine = clusters.length ? `${clusters.join(", ")}가 붙어 있습니다.` : null;

const caption = [
  `올해 정비사업 수주 1위, ${top.name}이 ${won(top.amount)}을 따냈습니다 🏗️`,
  ``,
  `2위와 격차가 ${won(gap)}. 수치가 나온 ${scored.length}개사 중 ${overTen}곳이 1조를 넘겼습니다.`,
  ``,
  `🏅 도시정비 누적 수주 (1~9월 7일)`,
  rankLines,
  ``,
  `그런데 어디서 따낸 걸까요?`,
  ``,
  `📍 회사별 주요 사업지`,
  siteLines,
  ``,
  clusterLine,
  clusterLine ? `` : null,
  `📌 저장해두고 우리 동네에 누가 들어오는지 확인하기`,
  ``,
  `—`,
  `📊 출처 : 취재 종합 · 2026년 1월~9월 7일 누적`,
  `🏢 대상 : 시공능력평가 상위 10개 건설사`,
  blankNote ? `ℹ️ ${blankNote}` : null,
  ``,
  `#정비사업 #재건축 #재개발 #건설사순위 #압구정재건축`,
]
  .filter((l) => l !== null)
  .join("\n");

writeFileSync(join(ROOT, `data/review/captions/${LABEL}.txt`), caption + "\n");

console.log(`✅ ${LABEL}.json — ${items.length}개사 (${ds.meta.asOf} 기준). 수치는 데이터셋에서 추출.`);
console.log(`   합계 ${won(sum)} · 1·2위 격차 ${won(gap)} · 1조 이상 ${overTen}곳`);
console.log(`   ⚠️ verified=${ds.meta.verified} — 1차 출처 대조 전`);
console.log(`   ⚠️ 7월 데이터셋과 집계 기준이 달라 증감 비교는 만들지 않았다`);
