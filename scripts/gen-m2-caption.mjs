/**
 * M2 카드 4종 캡션 생성기 — **숫자는 옮겨 적지 않는다**(CAPTION.md §2).
 *
 * 문장 틀만 여기 있고, 모든 수치는 두 곳에서만 온다:
 *   ① 카드 JSON 의 `meta` — 카드 얼굴에 찍힌 값과 **같은 값**이어야 하는 것
 *   ② `scripts/lib/m2.mjs` — 카드가 안 그린 보조 계열(카드와 같은 원자료·같은 접합 규칙)
 * 둘 다 같은 데이터셋에서 나오므로 캡션과 카드가 갈라질 수 없다.
 *
 * 서명은 `writeCaption()` 이 쓰면서 붙인다 — 손으로 적지 않는다(CAPTION.md §3).
 *
 * 실행:
 *   node scripts/gen-m2-caption.mjs [--date YYYY-MM-DD] [--only m2-gap,m2-rate]
 *   (--date 를 안 주면 오늘 KST. 카드는 data/content/<날짜>/ 에서 찾고, 없으면 data/out/_spike)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";
import { loadM2, ymLabel, jo, r1 } from "./lib/m2.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const argOf = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const date = argOf("--date") || kstToday;
const only = (argOf("--only") || "").split(",").filter(Boolean);

const TAGS = "#통화량 #M2 #한국은행 #유동성 #경제상식";
const { M2, NEW, months: ALL } = loadM2();
const firstYm = ALL[0];   // 한 달 증가폭 1위의 비교 범위 — "집계 이후"가 어디부터인지 밝힌다

/**
 * 표시정수 → 천단위 쉼표. **meta 의 `shown` 값에만 쓴다.**
 * ⚠️ 소수(`r1` 을 거친 값)에 `jo()` 를 걸면 이중 반올림으로 카드와 1 씩 어긋난다 —
 * 2026-09-01 에 캡션이 4,832조, 카드가 4,831조를 찍는 사고가 실제로 났다.
 */
const num = (n) => Number(n).toLocaleString("ko-KR");

/**
 * **카드 얼굴의 숫자는 캡션에도 같은 모양으로 있어야 한다.**
 * 제목·마무리 문구에서 숫자 토큰을 뽑아 캡션에 다 있는지 확인하고, 없으면 던진다.
 * 위의 이중 반올림 사고를 검수가 아니라 **생성 시점**에 막는 게이트다.
 */
function assertNumbersMatch(label, card, caption) {
  const strip = (h) => String(h ?? "").replace(/<[^>]*>/g, "");
  /* 제목·마무리 문구 + **좌상단 강조 블록(level)**. 2026-09-01 에 연말 예상치(5,143조)가
     level 에 들어갔는데 게이트는 제목만 보고 있어서 캡션이 그 숫자를 빠뜨려도 통과할 뻔했다.
     막대 라벨까지 다 넣으면 캡션이 비대해지므로 **얼굴로 읽히는 블록**까지만 본다. */
  const levelText = (card.chart?.level?.lines ?? []).map((l) => l.t).join(" ");
  const src = `${strip(card.title)} ${strip(card.note)} ${levelText}`;
  const want = [...new Set(src.match(/\d[\d,]*(?:\.\d+)?/g) ?? [])].filter((t) => t.length > 1);
  const missing = want.filter((t) => !caption.includes(t));
  if (missing.length) {
    throw new Error(`${label}: 카드 얼굴의 숫자 ${missing.join(", ")} 가 캡션에 없다 — 캡션이 카드와 다른 값을 말하고 있다`);
  }
}

function readCard(label) {
  for (const p of [join(ROOT, "data/content", date, `${label}.json`), join(ROOT, "data/out/_spike", `${label}.json`)]) {
    if (existsSync(p)) return { path: p, card: JSON.parse(readFileSync(p, "utf8")) };
  }
  throw new Error(`${label} 카드 JSON 이 없다 — 빌더를 먼저 돌린다`);
}
/** "202606" → "2026년 6월" */
const kor = (ym) => `${ym.slice(0, 4)}년 ${+ym.slice(4)}월`;

/* ─────────────────────────────────────────────── m2-gap */
function capGap(m) {
  const to = m.window.to, from = m.window.from, sh = m.shown;
  return `같은 달 통화량이 두 개입니다 💵

2025년 12월 30일, 한국은행이 통화·유동성 통계를 개편했습니다.
M2(광의통화)에서 펀드·ETF 같은 수익증권이 빠졌습니다.

📊 ${kor(to)} M2
· 개편 전 기준 ${num(sh.old)}조
· 개편 후 기준 ${num(sh.new)}조
· 차이 ${sh.gap}조

둘 다 한국은행이 발표한 공식 숫자입니다.
어느 하나가 틀린 게 아니라, 무엇을 '통화'로 볼지가 달라진 것입니다.

📈 차이는 계속 벌어지고 있습니다.
${from.slice(0, 4)}년 이후 가장 작았을 때가 ${sh.gapMin}조였는데,
${kor(to)}에는 ${sh.gap}조가 됐습니다.

👉 어느 기준으로 보느냐에 따라 통화량 이야기가 달라집니다.

📌 신·구 두 계열은 2026년 12월까지만 함께 발표됩니다.

—
📊 출처 : 한국은행 ECOS (M2 평잔·원계열, 신·구 병행 공표분)
📅 기간 : ${ymLabel(from)} ~ ${ymLabel(to)} (월별)
※ 개편 내용 : 수익증권(펀드·ETF) 제외, 초대형 IB 발행어음·일부 CMA 포함, 경제주체 분류 개편
※ 카드의 ${sh.gap}조는 카드에 적힌 두 값(${num(sh.old)} − ${num(sh.new)})의 차이입니다. 원값끼리 빼면 ${m.gapTrue}조입니다.
※ 개편 기준은 2026년 1월 공표분(2025년 11월 통계)부터 적용됐습니다.

${TAGS}`;
}

/* ─────────────────────────────────────────────── m2-rate */
function capRate(m) {
  const cur = m.current, prev = m.prevHigher, nb = m.currentNewBasis;
  const bullets = m.series
    .map((r) => `· ${r.ym.slice(0, 4)}년 +${r.yoy.toFixed(1)}%`)
    .join("\n");
  const mult = r1(cur.yoy / m.low.yoy);
  return `통화량 증가율이 ${cur.yoy.toFixed(1)}%까지 올라왔습니다 💵

${kor(cur.ym)} M2(광의통화)는 1년 전보다 ${cur.yoy.toFixed(1)}% 늘었습니다.
${kor(prev.ym)}(${prev.yoy.toFixed(1)}%) 이후 ${prev.sinceMonths}개월 만에 가장 높습니다.

📊 각 해 ${+cur.ym.slice(4)}월 전년동월비
${bullets}

바닥은 ${kor(m.low.ym)}의 ${m.low.yoy.toFixed(1)}%였습니다.
3년 사이 증가율이 ${mult.toFixed(1)}배가 됐습니다(통화량이 아니라 증가 속도입니다).

💰 1년 사이 늘어난 돈은 ${num(cur.yearAdd)}조입니다.

👉 통화량이 다시 빠르게 늘고 있습니다.

📌 저장해두고 통화량 흐름 확인하기

—
📊 출처 : 한국은행 ECOS (M2 평잔·원계열, 개편 전 기준)
📅 기간 : ${m.series[0].ym.slice(0, 4)}.${m.series[0].ym.slice(4)} ~ ${ymLabel(cur.ym)} (각 해 ${+cur.ym.slice(4)}월 전년동월비)
※ 모든 해를 ${+cur.ym.slice(4)}월로 맞췄습니다. 최신 자료가 ${kor(cur.ym)}이라 12월 기준과 섞으면 비교가 어긋납니다.
※ 한국은행이 2025년 12월 M2에서 수익증권을 제외했습니다. 이 카드는 개편 전 기준이고,${nb ? `\n   개편 후 기준으로 같은 달을 재면 ${nb.yoy.toFixed(1)}%입니다.` : ""}
※ ${kor(cur.ym)} M2 총량은 ${num(cur.level)}조입니다(개편 전 기준).

${TAGS}`;
}

/* ─────────────────────────────────────────────── m2-trend */
function capTrend(m) {
  const dec = m.decades
    /* '년말'을 붙인다 — 본문은 1986년 **1월**(43조), 이 표는 1986년 **말**(54조)이라
       그냥 "1986"이라고만 쓰면 같은 해에 두 값이 나온 것처럼 읽힌다(2026-09-01 실측).
       배수는 소수 한 자리로 통일한다 — 한 줄만 "2배"면 독자가 정밀도를 의심한다. */
    .map((d) => `· ${d.from}년말 → ${d.partialTo ? `${d.to}년 ${+d.partialTo.slice(4)}월` : `${d.to}년말`} : ${num(d.fromV)}조 → ${num(d.toV)}조 (${d.times.toFixed(1)}배)`)
    .join("\n");
  const first = m.decades[0], ly = m.lastFullYearAdd, sh = m.shown;
  return `40년 동안 통화량은 ${sh.times}배가 됐습니다 💵

${kor(m.range.from)} ${num(sh.first)}조였던 대한민국 M2(광의통화)는
${kor(m.range.to)} ${num(sh.last)}조가 됐습니다.

📊 10년 단위로 보면
${dec}

증가율은 계단처럼 낮아졌는데, 늘어나는 금액은 오히려 커졌습니다.${ly ? `
${first.from}~${first.to}년 10년 동안 늘어난 돈이 ${num(first.add)}조,
${ly.year}년 한 해에 늘어난 돈이 ${num(ly.add)}조입니다.` : ""}

👉 같은 비율이라도 모수가 커지면 금액은 훨씬 커집니다.

📌 저장해두고 통화량 흐름 확인하기

—
📊 출처 : 한국은행 ECOS (M2 평잔·원계열, 개편 전 기준)
📅 기간 : ${ymLabel(m.range.from)} ~ ${ymLabel(m.range.to)} (${m.range.months}개월)
※ ${ymLabel(m.range.from)}~${ymLabel(m.joinAt)} 구간은 한국은행 구지표 통계표, 그 뒤는 ECOS '[참고] 구 M2'입니다.
   겹치는 12개월의 값이 소수점까지 같아 이어 붙였습니다(최대 차이 ${m.overlapCheckMaxDiff.toFixed(2)}조).
※ 10년 단위 비교는 각 해 12월 평잔 기준이고, 마지막 마디만 ${kor(m.range.to)}까지입니다.
※ 한국은행이 2025년 12월 M2에서 수익증권을 제외했습니다. 이 카드는 전 구간을 개편 전 기준으로 통일했습니다.

${TAGS}`;
}

/* ─────────────────────────────────────────────── m2-gov */
function capGov(m) {
  const seg = m.segments;
  const top = seg.reduce((a, b) => (b.delta > a.delta ? b : a));
  const cur = seg[seg.length - 1];
  const moon = seg.find((s) => s.name === "문재인");
  const bullets = seg
    .map((s) => `· ${s.name} 월평균 ${s.rate.toFixed(1)}조 (총 ${num(s.delta)}조${s === top ? " — 총액 1위" : ""}${s === cur ? " — 재임 중" : ""})`)
    .join("\n");
  const pk = m.peakMonth, est = m.yearEndEstimate;
  return `돈이 가장 빨리 풀린 정부는 지금입니다 💵

역대 정부의 통화량(M2) 증가 규모를 세어봤습니다.

📊 정부별 M2 증가폭
${bullets}

총액은 ${top.name} 정부가 가장 큽니다. ${num(top.delta)}조가 늘었습니다.

그런데 속도로 보면 이야기가 달라집니다.
현 정부는 ${cur.months}개월 만에 ${num(cur.delta)}조가 늘었습니다.
월평균 ${cur.rate.toFixed(1)}조 — ${moon.name} 정부(${moon.rate.toFixed(1)}조)의 ${r1(cur.rate / moon.rate)}배입니다.

임기 길이가 제각각이라 총액보다 월평균이 더 정확한 비교입니다.

⚡ ${pk.inCurrentTerm ? `특히 ${kor(pk.ym)} 한 달에만 ${pk.delta.toFixed(1)}조가 늘었습니다.\n${firstYm.slice(0, 4)}년 집계 이후 한 달 증가폭 1위입니다.` : `한 달 증가폭 1위는 ${kor(pk.ym)}의 ${pk.delta.toFixed(1)}조입니다.`}

${est ? `📈 '${est.ym.slice(2, 4)}년 말 예상 약 ${num(est.shown)}조
올해 들어 ${num(est.ytd)}조가 늘었습니다(${est.monthsDone}개월, 월평균 ${est.perMonth}조).
그 속도가 남은 ${est.remMonths}개월에도 이어진다고 본 값입니다.\n` : ""}
📌 저장해두고 통화량 흐름 확인하기

—
📊 출처 : 한국은행 ECOS (M2 평잔·원계열, 개편 전 기준)
📅 기간 : ${ymLabel(seg[0].start)} ~ ${ymLabel(cur.end)} (월별)
※ 각 정부 구간은 '전임 정부 퇴임월 → 자기 퇴임월'로 끊었습니다.
   겹치는 달이 없어 막대를 다 더하면 전체 증가와 정확히 맞습니다.
※ 한국은행이 2025년 12월 통화지표를 개편해 수익증권 등을 M2에서 제외했습니다.
   이 카드는 정부 간 비교를 위해 전 구간을 개편 전 기준으로 통일했습니다.
※ 얼굴 아래 개월 수는 실제 재임 기간, 월평균은 데이터 구간 기준입니다.
※ ${ymLabel(cur.end)} 기준 M2 총량은 ${num(m.shown.level)}조입니다(개편 전 기준, 개편 후 기준은 ${num(m.shown.levelNewBasis)}조).${est ? `
※ 카드 왼쪽 회색 글씨 약 ${num(est.shown)}조는 예상치입니다 — 한국은행이 발표한 값이 아닙니다.
   ${ymLabel(cur.end)}까지의 실적 ${num(est.ytd)}조 ÷ ${est.monthsDone}개월 = 월 ${est.perMonth}조를 남은 ${est.remMonths}개월에 그대로 더하면 ${num(est.exact)}조이고,
   카드에는 ${est.roundTo}조 단위로 반올림해 적었습니다. 통화정책·자금흐름이 바뀌면 달라집니다.` : ""}

${TAGS}`;
}

const MAKERS = { "m2-gap": capGap, "m2-rate": capRate, "m2-trend": capTrend, "m2-gov": capGov };

const labels = only.length ? only : Object.keys(MAKERS);
for (const label of labels) {
  const make = MAKERS[label];
  if (!make) throw new Error(`${label} 은 이 생성기가 모르는 라벨이다 (${Object.keys(MAKERS).join(", ")})`);
  const { path, card } = readCard(label);
  if (!card.meta) throw new Error(`${label} 카드에 meta 가 없다 — 빌더를 확인한다`);
  const text = make(card.meta);
  assertNumbersMatch(label, card, text);
  const out = writeCaption(label, text);
  console.log(`✅ ${label} — ${out}  (카드 ${path.includes("/_spike/") ? "시안" : "확정본"} 기준)`);
}
