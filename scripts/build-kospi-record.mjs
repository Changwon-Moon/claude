/**
 * 🧪 시안 — 2026-07-31 국내증시 하루 기록. record-grid@1.
 *
 * ⚠️ 오너 확정 전 **시안**이다. sets.json·builders.json 에 등록하지 않는다.
 *
 * ── 무엇을 말하는 카드인가
 * 이 날 코스피는 하루에 1,001.89포인트(+17.91%) 올랐다. 상승률·상승폭 둘 다 역대 1위다.
 * 그런데 "역대 1위"라는 말만으로는 크기를 모른다. **직전 기록을 옆에 놓아야** 보인다 —
 * 2008년 금융위기 때의 11.95% 옆에 두면 17.91%가 얼마나 이상한 숫자인지 드러난다.
 * 그래서 모든 줄이 '무엇의 어떤 기록'을 한 행으로 적고, 수치는 오른쪽 증거 자리에 둔다.
 *
 * ── 제목 아래 주가 추이
 * 기록만 나열하면 "그래서 지금 어디쯤인가"가 안 보인다. 연초부터의 궤적을 얹어
 * 오늘의 급등이 **무엇에서 튀어 오른 것인지**를 같은 화면에서 보게 한다.
 *
 * ── 수치는 어디서 오나
 * data/datasets/kospi-record-2026-07-31.json 하나만 읽는다.
 * **이 스크립트에는 숫자가 하나도 박혀 있지 않다** — 데이터셋을 고치면 카드가 따라 바뀐다.
 * 그 데이터셋은 verified:false 다(보도 출처). 발행 전 KRX 대조가 필요하다.
 *
 * ── 맥락 한 줄
 * 오늘 급등이 왜 놀라운지는 어제까지를 알아야 나온다. 다만 길게 쓰면 기록 목록이 묻히므로
 * 한 줄만 둔다(오너 선택 2026-07-31 — '한 줄만 넣는다').
 *
 * 실행: node scripts/build-kospi-record.mjs [date=2026-07-31]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/kospi-record-2026-07-31.json"), "utf8"));

/* ── 내부 정합성 검사 ──
 * 종가 − 등락폭 = 전일 종가가 맞는지 **매번** 확인한다. 보도에서 옮긴 값은 한 자리만
 * 잘못 적혀도 눈으로는 안 보인다. 산수로 걸리는 것은 산수로 건다. */
const r2 = (v) => Math.round(v * 100) / 100;
for (const [k, ix] of Object.entries(d.index)) {
  const calc = r2(ix.close - ix.change);
  if (calc !== r2(ix.prevClose))
    throw new Error(`${k}: 종가 ${ix.close} − 등락 ${ix.change} = ${calc} 인데 전일 종가는 ${ix.prevClose} 다`);
  const pct = r2((ix.change / ix.prevClose) * 100);
  if (Math.abs(pct - ix.changePct) > 0.02)
    throw new Error(`${k}: 등락률 계산값 ${pct}% 와 적힌 값 ${ix.changePct}% 가 다르다`);
}
/* 줄 수는 4~6. 아래는 스키마 한계이고, 위는 세로가 감당하는 한계다.
 * 오너가 삼성전자 줄을 뺐다(2026-07-31) → 지금 5줄. */
if (d.records.length < 4 || d.records.length > 6)
  throw new Error(`기록 줄은 4~6개여야 한다 — 지금 ${d.records.length}개`);

const K = d.index.kospi;
const fmt = (n) => n.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 억 단위 정수 → "n조 n,nnn억". 손으로 적으면 원 수치가 바뀔 때 조용히 거짓이 된다. */
const jo = (eok) => {
  const j = Math.floor(eok / 10000), e = eok % 10000;
  return j ? `${j}조 ${e.toLocaleString("ko-KR")}억` : `${e.toLocaleString("ko-KR")}억`;
};

/* 보조 문구(prev)는 **있는 줄에만** 붙인다.
 * 오너가 외국인·개인 두 줄의 보조 문구를 지웠다(2026-07-31) — 기록 문구만으로 충분한 줄에
 * 설명을 덧대면 다섯 줄의 높이가 들쭉날쭉해지고 목록이 산만해진다. */
function fillPrev(r) {
  return r.prev || null;
}

/* ── 주가 추이 ──
 * 연초부터의 일간 종가에 최근 확인분을 이어 붙인다.
 * **비어 있는 구간(7/23~28)은 이어 붙이지 않고 표시만 한다** — 실선으로 이으면
 * 서킷브레이커 두 번이 매끈한 미끄럼틀로 보인다. 없는 날을 그럴듯하게 메우지 않는다.
 * 실선 = 실측 / 점선 = 미수집(CEO.md 07-30 "박스를 둘 이상 쓰면 그 차이가 정보를 담는다"). */
const mk = JSON.parse(readFileSync(join(ROOT, "data/datasets/kr-market-2026.json"), "utf8"));
const base = mk.indices.kospi.series.map((p) => ({ d: p.d, c: p.c }));
const known = d.recentCloses.known.map((p) => ({ d: p.d, c: p.c }));
const series = [...base, ...known];
const gapAfter = base[base.length - 1].d;      // 이 날 뒤부터 점선
const spark = {
  points: series,
  gapAfter,
  gapUntil: known[0].d,
  gapLabel: `${d.recentCloses.gap.from.slice(5).replace("-", "/")}~${d.recentCloses.gap.to.slice(5).replace("-", "/")} 미수집`,
  last: { d: known[known.length - 1].d, c: known[known.length - 1].c, label: fmt(K.close) },
  from: series[0].d,
};

const card = {
  template: "record-grid@1",
  date,
  badge: date.replace(/-/g, ".").slice(2),      // 26.07.31 (오너 지시 2026-07-31)
  title: `오늘 국내 증시가 세운 기록들`,
  spark,
  /* 템플릿 안 자바스크립트가 읽을 수 있게 문자열로도 넣는다 —
     Handlebars 는 객체를 속성에 못 박는다. 렌더러가 JSON 을 그대로 넘겨준 것과 같다. */
  sparkJson: JSON.stringify(spark),
  lead: {
    label: "KOSPI",
    cap: "코스피 역대 최대 상승률 기록",
    value: fmt(K.close),
    delta: `▲${fmt(K.change)} (+${K.changePct}%)`,
  },
  /* 한 줄 = 한 기록. **claim(어떤 기록인가)이 주인공**이고 value 는 증거다(오너 지시 2026-07-31).
   * prev 가 비어 있으면 빌더가 계산해 채운다 — 아래 fillPrev 참고. */
  /* 한 줄에 '무엇의 + 어떤 기록'을 붙여 쓴다(오너 지시 2026-07-31 — 2줄짜리를 모두 1행으로).
   * label 을 따로 위에 얹으면 다섯 줄이 전부 2행이 되어 목록이 두 배로 길어 보인다. */
  cells: d.records.map((r) => ({
    claim: `${r.label} ${r.claim}`, value: r.value, ...(fillPrev(r) ? { prev: fillPrev(r) } : {}),
  })),
  /* 맥락 한 줄 — 오너가 문구를 직접 지정했다(2026-07-31). 그대로 쓴다. */
  note: d.context.noteLine,
  /* 기준일을 적는다 — 이 카드는 **하루치 스냅숏**이라 시점이 하나뿐이다.
   * (여러 시점이 섞인 카드에서는 기준일을 적지 않는다 — CEO.md 출처 원칙) */
  source: { name: d.meta.source, asOf: d.meta.asOf },
};

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "kospi-record.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`🧪 시안 kospi-record — 기록 ${card.cells.length}칸`);
console.log(`   코스피 ${fmt(K.close)} ▲${fmt(K.change)} (+${K.changePct}%) — 정합성 검사 통과`);
console.log(`   ⚠ 데이터셋 verified=${d.verified} — 발행 전 KRX 대조 필요`);
console.log(`   → data/out/_spike/kospi-record.json`);
