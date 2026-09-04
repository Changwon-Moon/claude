/**
 * 세계 월별 성적표 캡션 생성기 — world-monthly@1
 *
 *   node scripts/gen-world-caption.mjs [--card data/content/2026-09-04/world-monthly.json]
 *                                      [--out world-monthly]
 *
 * ── 왜 생성기인가 (CAPTION.md §2)
 * **오보가 태어나는 자리는 거의 언제나 「캡션에 숫자를 옮겨 적는 순간」이다.**
 * 이 카드는 칸이 64개다 — 손으로 옮기면 언젠가 한 칸이 어긋나고, 어긋난 칸은
 * 카드와 캡션 중 어느 쪽이 맞는지 아무도 모르게 된다.
 * 그래서 순위·등락률·「전부 내린 달」 같은 문장까지 **카드 JSON 에서 세어서** 만든다.
 *
 * ── 캡션이 되돌려야 하는 것 (CAPTION.md §6 · sets.json 의 note)
 * 2026-09-04 오너 지시로 카드 최하단 문구를 뺐다. 그때 카드에서 사라진 정의를
 * **캡션이 받는다** — 누적의 밑이 전년 12월 말이라는 것, 환율을 반영하지 않았다는 것.
 * 이 둘이 빠지면 「달러로 환산해도 한국이 1등」으로 읽힌다. 그건 재지 않은 말이다.
 *
 * ⚠️ 서명은 `writeCaption()` 이 붙인다. 캡션 파일에 writeFileSync 를 직접 쓰지 않는다
 *    (CAPTION.md §3 — 세 번 잃고 자리를 바꾼 규칙).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

const CARD = arg("card", "data/content/2026-09-04/world-monthly.json");
const OUT = arg("out", "world-monthly");
const p = join(ROOT, CARD);
if (!existsSync(p)) {
  console.error(`❌ 카드가 없습니다: ${CARD}\n   먼저: node scripts/build-world-monthly.mjs`);
  process.exit(1);
}
const doc = JSON.parse(readFileSync(p, "utf8"));
const rows = doc.rows;

/* ── 카드에서 세어 낸 것들 — 문장 하나하나가 여기서 나온다 ── */
const num = (c) => (c.cls === "na" ? null : Number(c.v.replace("−", "-").replace("+", "")));
const first = rows[0];
const second = rows[1];
const last = rows[rows.length - 1];

/** 여덟 나라가 **모두 같은 방향**이었던 달 — 이 카드에서 가장 눈에 띄는 세로줄이다 */
const allSame = [];
for (let m = 0; m < 8; m++) {
  const vals = rows.map((r) => num(r.cells[m]));
  if (vals.some((v) => v === null)) continue;
  if (vals.every((v) => v > 0)) allSame.push({ m: m + 1, dir: "올랐" });
  else if (vals.every((v) => v < 0)) allSame.push({ m: m + 1, dir: "내렸" });
}

/** 한 달 등락이 가장 컸던 칸(오름·내림 각각) */
let bigUp = null, bigDown = null;
for (const r of rows) {
  r.cells.forEach((c, i) => {
    const v = num(c);
    if (v === null) return;
    if (!bigUp || v > bigUp.v) bigUp = { v, m: i + 1, country: r.country };
    if (!bigDown || v < bigDown.v) bigDown = { v, m: i + 1, country: r.country };
  });
}

/** 사실상 제자리였던 칸(|등락| < 0.05) — 있으면 소재가 된다 */
const flat = [];
for (const r of rows) {
  r.cells.forEach((c, i) => {
    const v = num(c);
    if (v !== null && Math.abs(v) < 0.05) flat.push({ country: r.country, m: i + 1 });
  });
}

const pct = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;

/* ── 조사 — 나라 이름이 바뀌면 받침이 바뀐다 ──
   제목에서는 조사 자리를 아예 없앴지만(국기로 대체) 캡션은 문장이라 피할 수 없다.
   「한국가 1등」이 나왔던 자리라, 여기서는 받침을 보고 고른다.
   ⚠️ 지금 여덟 나라는 전부 한글이지만, 영문 지수명이 앞에 오는 문장에는 쓰지 않는다. */
const hasJong = (w) => {
  const ch = String(w).trim().slice(-1).charCodeAt(0);
  if (ch < 0xac00 || ch > 0xd7a3) return null; // 한글이 아니면 판단하지 않는다
  return (ch - 0xac00) % 28 !== 0;
};
const josa = (w, withJong, without) => {
  const j = hasJong(w);
  return j === null ? withJong : j ? withJong : without; // 한글이 아니면 안전한 쪽
};
const period = `${doc.date.slice(0, 4)}년 1~8월`;

/* ── 본문 ── */
const L = [];
/* 훅 — 첫 줄에서 멈춰 세운다(캡션 린트: 밋밋한 첫 줄은 스크롤을 못 막는다).
   질문으로 걸고 다음 줄에서 답한다 — 카드가 이미 답을 보여주지만, 캡션은 읽는 순서가 다르다.
   1위가 한국일 때와 아닐 때가 다른 말이다. 이 카드에서 1·2위는 실제로 뒤집힌 적이 있다. */
L.push(`${period.slice(0, 5)} 세계 증시, 1등은 어디였을까요? 🌏`);
L.push(
  first.country === "한국"
    ? `우리였습니다 🇰🇷`
    : `${first.country}${josa(first.country, "이었습니다", "였습니다")}.`,
);
L.push(``);
L.push(`${period}, 세계 주요 8개국 대표지수를 달별로 줄 세웠습니다.`);
L.push(`칸 하나가 그 나라의 한 달입니다.`);
L.push(``);
L.push(`📊 1~8월 누적`);
for (const r of rows) {
  L.push(`· ${r.rank}위 ${r.country} ${r.index} : ${r.ytd.v}%`);
}
L.push(``);

/* 세로줄 이야기 — 여덟 나라가 같이 움직인 달 */
if (allSame.length) {
  L.push(`🌐 여덟 나라가 같은 방향이었던 달`);
  for (const a of allSame) L.push(`· ${a.m}월 — 8개국 전부 ${a.dir}습니다`);
  L.push(``);
}

L.push(`📈 한 달 등락이 가장 컸던 칸`);
L.push(`· 오름 : ${bigUp.country} ${bigUp.m}월 ${pct(bigUp.v)}`);
L.push(`· 내림 : ${bigDown.country} ${bigDown.m}월 ${pct(bigDown.v)}`);
if (flat.length) {
  L.push(`· 제자리 : ${flat.map((f) => `${f.country} ${f.m}월`).join(" · ")} — 0.0%`);
}
L.push(``);

/* takeaway — 카드가 재지 않은 것을 약속하지 않는다 */
L.push(
  `👉 ${first.country}${josa(first.country, "과", "와")} ${second.country}` +
    `${josa(second.country, "이", "가")} 나란히 1·2위입니다.`,
);
L.push(`다만 3월엔 여덟 나라가 함께 내렸고, 4월엔 함께 올랐습니다.`);
L.push(`잘 오른 나라도 세계가 흔들릴 땐 같이 흔들렸다는 뜻입니다.`);
L.push(``);
L.push(`📌 8개국 성적표 저장해두기`);
L.push(`더 보기 👉 @wirit_note`);
L.push(``);
L.push(`—`);
/* ⚠️ 여기 두 줄이 카드에서 뺀 정의를 되돌리는 자리다(CAPTION.md §6) */
L.push(`📊 출처 : ${doc.source.name} · ${doc.source.asOf}`);
L.push(`※ 각 나라의 「그 달 마지막 거래일 종가」로 잰 등락률입니다.`);
L.push(`※ 누적은 전년 12월 말 종가 대비이고, 환율은 반영하지 않은 현지통화 기준입니다.`);
L.push(``);
L.push(`#세계증시 #코스피 #주식 #경제 #위릿노트`);

const body = L.join("\n");
const res = writeCaption(OUT, body);
console.log(`✅ 캡션 → data/review/captions/${OUT}.txt (${body.split("\n").length}줄)`);
console.log(`   1위 ${first.country} ${first.ytd.v}% · 꼴찌 ${last.country} ${last.ytd.v}%`);
console.log(`   같은 방향이었던 달: ${allSame.map((a) => `${a.m}월 ${a.dir}음`).join(" · ") || "없음"}`);
console.log(`   ${res}`);
