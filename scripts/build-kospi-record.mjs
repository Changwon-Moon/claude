/**
 * 2026-07-31 국내증시 하루 기록. record-grid@1.
 * ✅ 오너 확정 2026-07-31 — builders.json·sets.json·pixel-baselines.json 등록 완료.
 * ⚠️ 다만 데이터셋은 verified=false 다(보도 출처). **KRX 대조 전에는 발행하지 않는다.**
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
/* ⚠️ **카드가 말하는 날 이후의 데이터를 읽지 않는다** (CARD_CHECKLIST §4 — 같은 병 재발).
 * 이 카드 제목은 "오늘(=인자로 받은 날) 국내 증시가 세운 기록들" 이다. 그런데 시계열을
 * 통째로 읽고 있어서, 수집기가 다음 날을 채우는 순간 **이미 확정한 카드의 그래프가 조용히
 * 뒤로 늘어났다** — 2026-08-06 에 보니 8/4 종가까지 그리고 있었다. 제목과 그림이 다른 말을
 * 하는 것이고 픽셀 불변도 함께 깨진다. 대상일로 잘라야 몇 년 뒤에도 같은 그림이 나온다. */
const base = mk.indices.kospi.series.filter((p) => p.d <= date).map((p) => ({ d: p.d, c: p.c }));
if (!base.length) throw new Error(`${date} 이전의 코스피 시계열이 없다 — kr-market-2026.json 을 확인할 것`);
const baseLast = base[base.length - 1].d;
const byDate = new Map(base.map((p) => [p.d, p.c]));

/* ── 보도값 ↔ 수집값 교차 확인 ──
 * 수집기가 갱신되면서 보도로 적어 둔 날(7/29·7/30)이 야후 종가와 겹친다.
 * 겹치는 날은 **두 출처가 같은 값을 말하는지 확인**한다. 이건 공짜로 얻는 검증이다 —
 * 다르면 보도를 잘못 옮겼거나 수집이 잘못된 것이고, 어느 쪽이든 카드를 내면 안 된다. */
const crossChecked = [];
for (const p of d.recentCloses.known) {
  if (!byDate.has(p.d)) continue;
  const got = byDate.get(p.d);
  if (r2(got) !== r2(p.c))
    throw new Error(`${p.d}: 보도값 ${p.c} 와 수집값 ${got} 이 다르다 — 카드를 내기 전에 원인을 밝힌다`);
  crossChecked.push(p.d);
}

/* 수집이 아직 닿지 않은 날만 이어 붙인다(오늘 종가는 장 마감 직후라 수집에 없다).
   보도로 받아 둔 날도 **대상일까지만** 붙인다 — 위와 같은 이유다. */
const tail = d.recentCloses.known
  .filter((p) => p.d > baseLast && p.d <= date)
  .map((p) => ({ d: p.d, c: p.c }));
const series = [...base, ...tail];

/* 빈 구간이 남았을 때만 점선을 긋는다. 수집이 채워졌으면 실선으로 이어야 한다 —
 * "없는 날은 잇지 않는다"의 반대편 규칙이다: **있는 날을 끊어 놓지도 않는다.** */
const gapDays = tail.length
  ? (Date.parse(tail[0].d) - Date.parse(baseLast)) / 86400000
  : 0;
const hasGap = gapDays > 4;   // 주말(최대 3일)보다 크면 진짜 결측이다
const lastP = series[series.length - 1];
const spark = {
  points: series,
  ...(hasGap ? { gapAfter: baseLast, gapUntil: tail[0].d, gapLabel: "수집 미갱신 구간" } : {}),
  last: { d: lastP.d, c: lastP.c, label: fmt(K.close) },
  from: series[0].d,
};

const card = {
  template: "record-grid@1",
  date,
  badge: date.replace(/-/g, ".").slice(2),      // 26.07.31 (오너 지시 2026-07-31)
  title: `<span class="hi">오늘</span> 국내 증시가 세운 기록들`,   // '오늘' 빨강(오너 지시 2026-07-31)
  spark,
  /* 템플릿 안 자바스크립트가 읽을 수 있게 문자열로도 넣는다 —
     Handlebars 는 객체를 속성에 못 박는다. 렌더러가 JSON 을 그대로 넘겨준 것과 같다. */
  sparkJson: JSON.stringify(spark),
  lead: {
    flag: "🇰🇷",
    label: "KOSPI",
    /* 등락률과 '역사상 최대 상승'을 한 줄로 — 숫자만 두면 오늘이 특별한 줄 모르고,
       말만 두면 얼마나 특별한지 모른다. */
    delta: `+${K.changePct}%`,
    deltaNote: "역사상 최대 상승",
    value: fmt(K.close),
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

/* 확정 후 산출 위치를 data/content/{날짜}/ 로 옮겼다 — _spike 는 배포 파이프라인이 안 본다. */
const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "kospi-record.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`kospi-record — 기록 ${card.cells.length}칸`);
console.log(`   코스피 ${fmt(K.close)} ▲${fmt(K.change)} (+${K.changePct}%) — 정합성 검사 통과`);
console.log(`   ⚠ 데이터셋 verified=${d.verified} — 발행 전 KRX 대조 필요`);
console.log(`   → data/content/${date}/kospi-record.json`);
