/**
 * 「같은 현금, 세 번의 규제」 → tax-matrix@1 카드 + 캡션.
 *
 * 소재: 오너 발제(2026-09-10) — "1억으로 살 수 있는 집이 규제로 완전히 다운그레이드됐다".
 * 기획 정본은 프로젝트 문서 `claude/소재-1억으로-살수있는집-LTV규제-2026-09-10.md`.
 *
 * ── 왜 열이 3+1 개인가 (CARD_CHECKLIST §2 「표」)
 * `tax-matrix@1` 은 주석에 **2~4열·짧은 숫자**를 전제로 치수가 박혀 있다. 실제로 world-price
 * 카드가 열을 늘렸다가 designQa 에서 겹침 51건을 맞았다. 규제 국면은 7개지만 이 카드는
 * **오너가 물은 두 대책(6.27·10.15)의 전·후 3국면 + 총 감소율** 4열로 자른다.
 * 7국면 전체 흐름은 꺾은선 카드(`ltv-power`)가 맡는다 — 한 카드는 한 가지만 말한다.
 *
 * ── 카드에 없는 것
 * 생애최초 우대선은 이 카드에 넣지 않는다. 요건(소득·주택가격 상한)이 국면마다 달라
 * 한 칸에 담으면 각주가 표보다 길어진다. 꺾은선 카드의 보조선이 맡는다.
 *
 * ── 손으로 적은 숫자 0개
 * 모든 칸은 `scripts/lib/ltv-calc.mjs` 가 규칙표에서 계산한다. 감소율도 계산값이다.
 *
 * 실행: node scripts/build-ltv-matrix.mjs [date=2026-09-10]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { maxPrice } from "./lib/ltv-calc.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-09-10";
const LABEL = "ltv-matrix";

const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/ltv-rules-2026-09.json"), "utf8"));

/* ── 가드 ── 규칙표가 우리가 믿는 모양이 아니면 카드를 만들지 않는다. */
if (ds.meta.unit !== "억원 / %") throw new Error(`단위가 다르다: ${ds.meta.unit}`);
const P = Object.fromEntries(ds.phases.map((p) => [p.key, p]));
for (const k of ["2023-01", "2025-06", "2025-10"])
  if (!P[k]) throw new Error(`국면 없음: ${k}`);

/* 열은 「느슨했던 마지막 국면 → 6.27 → 10.15」 세 개 + 총 감소율. */
const COLS = ["2023-01", "2025-06", "2025-10"];
const CASH = [2, 4, 7, 10, 20];   // 오너 2026-09-13 — 다섯 줄만

/** 억 → "3.3" / "15.0". 소수 첫째까지. 정수여도 자리를 지킨다(칸 폭이 흔들리지 않게). */
const f1 = (n) => n.toFixed(1);

const rows = CASH.map((E) => {
  const vals = COLS.map((k) => maxPrice(P[k].gen, E));
  const drop = (vals[2] / vals[0] - 1) * 100;
  return {
    label: `${E}억`,
    cells: [
      ...vals.map((v, i) => ({ v: f1(v), unit: "억", cls: i === 2 ? "up" : "" })),
      { v: `${drop.toFixed(0)}%`, cls: "down" },
    ],
    _E: E,
    _vals: vals,
    _drop: drop,
  };
});

/* ── 계산이 확인한 것만 문구로 쓴다 (CARD_CHECKLIST §2 「문구」) ──
 * 6.27 은 현금이 많을수록, 10.15 는 현금이 적을수록 세게 때린다 — 이 방향이 실제로
 * 성립하는지 **재고** 문장을 만든다. 성립하지 않으면 문장을 비운다. */
const hit627 = rows.map((r) => (maxPrice(P["2025-06"].gen, r._E) / maxPrice(P["2023-01"].gen, r._E) - 1) * 100);
const hit1015 = rows.map((r) => (maxPrice(P["2025-10"].gen, r._E) / maxPrice(P["2025-06"].gen, r._E) - 1) * 100);
const mono = (arr, dir) => arr.every((v, i) => i === 0 || (dir < 0 ? v <= arr[i - 1] + 1e-9 : v >= arr[i - 1] - 1e-9));
/** 6.27: 현금이 커질수록 타격이 커진다 — 단조성이 실제로 성립한다. */
const shape627 = mono(hit627, -1);
/** 10.15: 단조는 **아니다**(10억 −6.2% → 15억 −9.5% 로 다시 커진다). 그래서 단조성이 아니라
 *  「아래쪽이 위쪽보다 압도적으로 크다」만 잰다 — 현금 1억 타격이 현금 10억 이상 최대 타격의
 *  2배를 넘는가. 이게 성립할 때만 "아래를 때렸다"고 쓴다. */
const lowHit = Math.abs(hit1015[0]);
const highHit = Math.max(...CASH.map((E, i) => (E >= 10 ? Math.abs(hit1015[i]) : 0)));
const shape1015 = lowHit >= highHit * 2;

/* 캡션이 이름으로 집는 행들. 현금 구간을 바꾸면 여기서 먼저 터지게 둔다 —
   조용히 undefined 가 되어 캡션에 "undefined억"이 나가는 것보다 낫다. */
const pick = (E) => {
  const r = rows.find((x) => x._E === E);
  if (!r) throw new Error(`캡션이 현금 ${E}억 행을 찾는데 CASH 에 없다: [${CASH.join(",")}]`);
  return r;
};
const one = pick(2);
const ten = pick(10);

const halved = rows.filter((r) => Math.abs(hit1015[rows.indexOf(r)] + 50) < 0.5).map((r) => r._E);
const untouched = rows.filter((r) => Math.abs(hit627[rows.indexOf(r)]) < 0.05).map((r) => r._E);

/* 하단 문구 상자(`foot`)와 적용 줄(`applyAt`)은 **오너 2026-09-13 지시로 뺐다.**
 * 판형은 둘 다 선택 필드라 안 주면 그 자리가 아예 없다. 기준(무주택·서울·소득 가정)은
 * 머리의 뱃지 두 개와 캡션이 계속 말하므로 오보 위험이 늘지 않는다.
 * ⚠️ 다시 넣을 일이 생기면 §2 「제목이 데이터와 모순되면」을 먼저 읽을 것 —
 *    이 표의 마지막 열은 두 대책의 **합산** 감소라 대책별 문장을 여기 쓰면 자기 모순이 된다. */
const worst = rows.reduce((a, r) => (r._drop < a._drop ? r : a));

/* ── 제목 ── 두 줄. 1줄은 누구의 무엇인지, 2줄은 이 카드가 재는 값.
 * BRAND.md 「제목의 두 색 강조」 예외를 따른다: 코발트(hb)는 주제, 레드(hi)는 크기.
 *
 * ⚠️ 길이를 **코드가 잰다.** 인물 사진(112px)+틈(22px)이 936px 중 134px 을 먹어
 * 남는 폭이 802px 이고, 54px 글자로 한 줄에 들어가는 한글은 약 15자다.
 * 처음에 16자로 넣었다가 designQa 가 「오른쪽 75px 넘침」을 냈다(2026-09-13).
 * 손으로 세지 말고 여기서 막는다 — 다음에 제목을 바꿀 때도 같은 자리에서 걸린다. */
const FACE = "lee-jaemyung-face.png";
/** 글자 수가 아니라 **폭**을 센다 — 공백과 한글의 폭이 다르다.
 *  한글/한자 1.0 · 공백 0.4 · 영숫자·기호 0.55 (54px·letter-spacing −0.035em 기준 실측 근사).
 *  802px ÷ (54px × 0.965) ≈ 15.4 단위 → 여유를 두고 15.0 으로 막는다. */
const widthOf = (t) =>
  [...t].reduce((w, ch) =>
    w + (ch === " " ? 0.4 : /[\u3131-\uD79D\u4E00-\u9FFF]/.test(ch) ? 1 : 0.55), 0);
/* 실측으로 잡은 계수: 글자 한 단위가 글자크기의 약 1.18배 폭을 먹는다(Wanted Sans 900 한글).
 * 킥커 줄(40px, 인물 96+틈 18 = 114px 사용) · 본제목(58px, 936px 전부 사용). */
const KICK_MAX = (936 - 114) / (40 * 1.18);   // ≈ 17.4
const TITLE_MAX = 936 / (58 * 1.18) - 0.4;    // ≈ 13.3 (여유 0.4)
const KICKER = { text: "李정부 대출규제 효과", html: `李정부 <span class="hb">대출규제</span> 효과` };
const TITLE = { text: "같은 돈으로 살 수 있는 집값", html: `같은 돈으로 살 수 있는 <span class="hi">집값</span>` };
for (const [l, max, who] of [[KICKER, KICK_MAX, "킥커"], [TITLE, TITLE_MAX, "제목"]]) {
  const w = widthOf(l.text);
  if (w > max) throw new Error(`${who} 폭 ${w.toFixed(1)} 단위(최대 ${max.toFixed(1)}): "${l.text}"`);
  if (l.html.replace(/<[^>]+>/g, "") !== l.text)
    throw new Error(`${who}의 text 와 html 이 다르다: "${l.text}"`);
}

const content = {
  template: "tax-matrix@1",
  date,
  who: "무주택 세대주 · 서울 아파트",
  status: "가정 계산",
  /* 두 줄 제목 — 1줄은 누구의 무엇인지, 2줄은 이 카드가 재는 값.
     BRAND.md 「제목의 두 색 강조」 예외를 따른다: 코발트는 주제, 레드는 크기. */
  face: FACE,
  kicker: KICKER.html,
  title: TITLE.html,
  lead: "가진 현금",
  n: 4,
  labw: 210,
  /* 열 이름이 **무엇이 바뀌었는지**를 말한다(오너 2026-09-13). 날짜만 적으면
     독자가 두 대책의 내용을 모른 채 숫자만 본다 — 이 카드의 요점은 그 내용이다.
     ⚠️ 낱말 가운데가 잘리지 않게 띄어쓰기가 있는 토큰으로만 쓴다(2026-09-10 육안 검수). */
  cols: [
    { t: "규제 전" },
    { t: "6.27 한도 6·4·2억" },
    { t: "10.15 LTV 70→40%" },
    { t: "총 감소" },
  ],
  rows: rows.map(({ label, cells }) => ({ label, cells })),
  source: { name: "정책브리핑 · 금융위원회 · 국토교통부", asOf: ds.meta.asOf },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${LABEL}.json`), JSON.stringify(content, null, 2) + "\n");

/* ── 캡션 ── 카드에 없는 국면·요건·대책 내용은 여기서 받는다.
 * 행 이름은 CASH 에서 그대로 가져온다 — 손으로 [1,4,10,30] 을 적어 두었다가
 * 현금 구간이 바뀌자 undefined 로 터졌다(2026-09-13). 다시 적지 않는다. */
const line = (r) =>
  `· 현금 ${r._E}억 → ${f1(r._vals[0])}억 → ${f1(r._vals[1])}억 → ${f1(r._vals[2])}억`;

const big = rows[rows.length - 1];

const caption = [
  `대출 규제가 두 번 지나갔습니다. 같은 돈으로 살 수 있는 집이 이렇게 바뀌었습니다 🏦`,
  ``,
  `소득은 충분하다고 치겠습니다. 그래도 살 수 있는 집은 <가진 현금 × 그때의 규제>가 정합니다.`,
  ``,
  `🔹 6.27대책 (2025.6.28~)`,
  `주택담보대출에 <한도>가 생겼습니다. LTV는 그대로 두고, 빌릴 수 있는 절대 금액을 6억으로 잘랐습니다.`,
  `→ 10.15대책으로 이 한도는 집값에 따라 15억 이하 6억 · 15~25억 4억 · 25억 초과 2억으로 다시 쪼개졌습니다.`,
  ``,
  `🔹 10.15대책 (2025.10.16~)`,
  `서울 전역과 경기 12곳이 규제지역이 됐습니다. 무주택자 LTV가 70%에서 <40%>로 내려갔습니다.`,
  ``,
  `💰 가진 현금 → 살 수 있는 최대 집값`,
  `(규제 전 2023.1 → 6.27 이후 → 10.15 이후)`,
  ...rows.map(line),
  ``,
  `두 대책은 때린 곳이 달랐습니다.`,
  ``,
  untouched.length
    ? `6.27의 한도는 현금 ${untouched.join("·")}억엔 아무 변화가 없었습니다. LTV를 그대로 뒀으니, 한도 금액에 닿는 사람부터 걸립니다.`
    : null,
  halved.length
    ? `10.15의 LTV는 현금 ${halved.join("·")}억을 정확히 반토막 냈습니다. 비율을 내리면 현금이 적은 쪽이 그대로 절반이 됩니다.`
    : null,
  shape1015 ? `같은 10.15가 현금 10억 이상에서는 ${highHit.toFixed(0)}% 안쪽에 그쳤습니다.` : null,
  ``,
  `현금 ${ten._E}억도 지금은 ${f1(ten._vals[2])}억이 최대입니다 — 15억을 넘는 순간 한도가 6억에서 4억으로 떨어지기 때문입니다.`,
  `현금 ${big._E}억이면 규제 전 ${f1(big._vals[0])}억까지 갔지만 지금은 ${f1(big._vals[2])}억, ${Math.abs(big._drop).toFixed(0)}%입니다.`,
  ``,
  `📌 저장해두고 내 현금으로 어디까지 가능한지 확인하기`,
  ``,
  `—`,
  `📊 출처 : 정책브리핑 · 금융위원회 · 국토교통부 (${ds.meta.asOf} 기준)`,
  `🧮 기준 : 무주택 세대주 · 서울 아파트 · 소득 충분 가정 · 취득세·중개보수 별도`,
  `ℹ️ 대출 = min(집값×LTV, 가격구간별 한도)`,
  ``,
  `#부동산대출 #LTV #627대책 #1015대책 #내집마련`,
]
  .filter((l) => l !== null)
  .join("\n");

writeFileSync(join(ROOT, `data/review/captions/${LABEL}.txt`), caption + "\n");

console.log(`✅ ${LABEL}.json — 현금 ${CASH.length}구간 × 국면 ${COLS.length} (규칙표에서 계산)`);
console.log(`   현금 ${one._E}억: ${f1(one._vals[0])}억 → ${f1(one._vals[2])}억 (${one._drop.toFixed(0)}%)`);
console.log(`   최대 감소 ${Math.abs(worst._drop).toFixed(0)}% (현금 ${worst._E}억)`);
console.log(`   6.27 무영향 현금: ${untouched.join("·") || "없음"}억 / 10.15 정확히 반토막: ${halved.join("·") || "없음"}억`);
console.log(`   방향성 검증 — 6.27 단조(현금↑타격↑): ${shape627} / 10.15 저현금 타격이 고현금의 2배↑: ${shape1015} (${lowHit.toFixed(0)}% vs ${highHit.toFixed(0)}%)`);
console.log(`   ⚠️ verified=${ds.meta.verified} — 2014.8·2023.1 국면은 언론 확인분. 발행 전 원문 승격 필요`);
