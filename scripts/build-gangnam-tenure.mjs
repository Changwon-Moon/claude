/**
 * 강남권 자가점유율 카드 — record-grid@1.
 *
 * ── 무엇을 말하는 카드인가
 * "가장 비싼 동네에 자기 집으로 사는 사람은 열에 넷도 안 된다."
 * 강남구 36.6% 는 그 자체로는 크기를 모른다. **서울 43.5% · 전국 57.3% 를 옆에 놓아야**
 * 비로소 보인다. 그래서 이 카드는 강남구 하나가 아니라 **세 개의 기준선**을 함께 세운다.
 *
 * 그리고 수준(레벨)만으로는 "원래 그런 동네" 로 읽힌다. 그래서 30년 변화를 함께 놓는다 —
 * 강남구는 1995년 이후 **-11.7%p**, 서울 자치구 중 하락폭이 가장 크다.
 * 원래 그랬던 게 아니라 **그렇게 되어 온 것**이라는 게 이 카드의 인사이트다.
 *
 * ── 왜 '자가보유율' 이 아니라 '자가점유율' 인가
 * 둘은 다르다. 자가보유율은 '집을 가졌나', 자가점유율은 '자기 집에 사나' 다.
 * 강남에 집을 가지고 다른 데 사는 사람은 보유율에는 들어가고 점유율에는 안 들어간다.
 * 이 카드가 말하려는 것은 후자다 — 그래서 정의를 카드 각주에 반드시 적는다.
 *
 * ── 숫자는 어디서 오나
 * data/datasets/gangnam-tenure-2020.json 하나만 읽는다.
 * **이 스크립트에 박힌 숫자는 없다.** 데이터셋을 고치면 카드가 따라 바뀐다.
 *
 * ⚠️ 그 데이터셋은 verified=false 다(2차 출처). KOSIS 원표 대조 전에는 발행하지 않는다.
 * ⚠️ 2020년 기준이다. 2025년 총조사 결과가 2026년 11월에 나오면 그때 갱신한다.
 *    카드에 연도를 크게 박는 이유가 이것이다 — 6년 전 숫자를 오늘 숫자로 읽히면 오보다.
 *
 * 실행: node scripts/build-gangnam-tenure.mjs [date=오늘]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || new Date().toISOString().slice(0, 10);
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/gangnam-tenure-2020.json"), "utf8"));

const pick = (area) => {
  const r = d.level2020.find((x) => x.area === area);
  if (!r) throw new Error(`데이터셋에 '${area}' 가 없다 — 카드에 숫자를 손으로 적지 않는다.`);
  return r;
};
const chg = (area) => {
  const r = d.change1995to2020.find((x) => x.area === area);
  if (!r) throw new Error(`데이터셋에 '${area}' 변화값이 없다.`);
  return r;
};

const gangnam = pick("강남구");
const seoul = pick("서울");
const korea = pick("전국");

/* ── 내부 정합성 검사 ──
 * 강남이 서울보다, 서울이 전국보다 낮다는 것이 이 카드의 뼈대다.
 * 데이터가 갱신되면서 그 관계가 뒤집히면 제목이 거짓이 된다 — 산수로 건다. */
if (!(gangnam.rate < seoul.rate && seoul.rate < korea.rate)) {
  throw new Error(
    `카드의 전제가 깨졌다: 강남 ${gangnam.rate} < 서울 ${seoul.rate} < 전국 ${korea.rate} 이어야 한다.\n` +
    "   데이터가 바뀌었다면 제목과 구성을 다시 짜야 한다 — 숫자만 갈아 끼우면 안 된다.",
  );
}

/* 열에 몇 명인가 — 반올림 한 자리. 제목에 쓰는 표현이라 여기서 계산한다. */
const perTen = (gangnam.rate / 10).toFixed(1);

const gap = (a, b) => `${(b - a).toFixed(1)}%p`;

const card = {
  template: "record-grid@1",
  date,
  badge: `${d.meta.asOf}년 기준`,
  title: `강남구, <span class="hi">자기 집</span>에 사는 가구는 10곳 중 ${perTen}곳`,
  /* ⚠️ record-grid 의 lead 블록은 템플릿에서 {{#if spark}} 안에 들어 있다.
     추이 그래프가 없는 이 카드에서는 **lead 를 써도 렌더에 안 나온다.**
     그래서 핵심 숫자(강남구 36.6%)를 첫 셀로 올린다 — 카드의 존재 이유인 숫자가
     화면에 없으면 그건 카드가 아니다. (첫 렌더에서 실제로 빠졌다.) */
  cells: [
    {
      claim: "<em>강남구</em> 자가점유율",
      value: `${gangnam.rate}%`,
      prev: "서울에서 가장 낮은 축",
    },
    {
      claim: "서울 평균",
      value: `${seoul.rate}%`,
      prev: `강남구와 ${gap(gangnam.rate, seoul.rate)} 차이`,
    },
    {
      claim: "전국 평균",
      value: `${korea.rate}%`,
      prev: `강남구와 ${gap(gangnam.rate, korea.rate)} 차이`,
    },
    /* 라벨이 길면 값과 겹친다 — 첫 렌더에서 '(1995→2020)' 이 값 위로 올라탔다.
       긴 설명은 라벨이 아니라 prev(작은 글씨) 자리로 내린다. */
    {
      claim: "강남구 <em>30년</em> 하락폭",
      value: `${chg("강남구").deltaPp}%p`,
      prev: `1995→2020 · ${chg("강남구").note}`,
    },
    /* 값 칸은 스키마상 12자까지다(검수가 잡아 준다). 두 구를 한 칸에 넣으면 넘친다 —
       값에는 서초구만 두고 송파구는 작은 글씨로 내린다. */
    {
      claim: "서초구 하락폭",
      value: `${chg("서초구").deltaPp}%p`,
      prev: `송파구는 ${chg("송파구").deltaPp}%p · 같은 기간`,
    },
  ],
  /* 정의를 안 적으면 '집 가진 사람이 36.6%' 로 읽힌다. 그건 다른 숫자다. */
  note: "자가점유율 = 자기 소유 집에 실제로 사는 가구 비율. 집을 가졌는지(자가보유율)와 다르다.",
  source: {
    /* sourceLabel 에 이미 연도가 들어 있어 asOf 와 겹친다 — 이름은 연도 없이 준다. */
    name: d.meta.source,
    asOf: `${d.meta.asOf}년`,
  },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
const out = join(outDir, "gangnam-tenure.json");
writeFileSync(out, JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`✅ 강남 자가점유율 → ${out}`);
console.log(`   강남 ${gangnam.rate}% < 서울 ${seoul.rate}% < 전국 ${korea.rate}%`);
if (!d.meta.verified) {
  console.log("   ⚠️ 데이터셋 verified=false — KOSIS 원표 대조 전에는 발행 금지");
}
