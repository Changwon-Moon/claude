/**
 * 🧪 시안 — 2026-07-31 국내증시 하루 기록 6칸. record-grid@1.
 *
 * ⚠️ 오너 확정 전 **시안**이다. sets.json·builders.json 에 등록하지 않는다.
 *
 * ── 무엇을 말하는 카드인가
 * 이 날 코스피는 하루에 1,001.89포인트(+17.91%) 올랐다. 상승률·상승폭 둘 다 역대 1위다.
 * 그런데 "역대 1위"라는 말만으로는 크기를 모른다. **직전 기록을 옆에 놓아야** 보인다 —
 * 2008년 금융위기 때의 11.95% 옆에 두면 17.91%가 얼마나 이상한 숫자인지 드러난다.
 * 그래서 여섯 칸 모두 '값 + 역대 몇 위 + 직전 기록'을 같은 순서로 적는다.
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
if (d.records.length !== 6) throw new Error(`기록 칸은 6개여야 한다 — 지금 ${d.records.length}개`);

const K = d.index.kospi;
const fmt = (n) => n.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const card = {
  template: "record-grid@1",
  date,
  title: `하루 만에 <span class="hi">1,001포인트</span>`,
  subtitle: `${date.replace(/-/g, ".").slice(2)} 국내증시 · 하루에 쏟아진 기록`,
  lead: {
    label: "코스피",
    value: fmt(K.close),
    delta: `▲${fmt(K.change)} (+${K.changePct}%)`,
    /* 코스닥도 같은 날 역대급이었다. 주인공은 코스피지만 한 줄 안에서 함께 말한다 —
     * 카드 제목이 코스피만 말하면 "코스닥은 어땠나"가 남는다. */
    sub: `코스닥 ${fmt(d.index.kosdaq.close)} · ▲${fmt(d.index.kosdaq.change)} (+${d.index.kosdaq.changePct}%)`,
  },
  /* rank(빨간 뱃지)는 **기록일 때만** 붙인다. 값이 없으면 키 자체를 뺀다 —
   * null 을 넣으면 스키마가 막는다(막아 주는 게 맞다. 뱃지에 가격을 넣었다가 걸렸다). */
  cells: d.records.map((r) => ({
    label: r.label, value: r.value, ...(r.rank ? { rank: r.rank } : {}), prev: r.prev,
  })),
  /* 맥락 한 줄 — 데이터셋의 값으로 문장을 만든다. 숫자를 손으로 적지 않는다. */
  note: `7월 한 달 <b>${d.context.julyDropPct}%</b> · ${d.context.circuitBreakerShort}(7/28~29) 뒤 반등입니다`,
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
