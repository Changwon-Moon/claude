/**
 * 학군지 지도 카드 캡션 생성기 — 숫자를 옮겨 적지 않는다.
 *
 * 캡션의 모든 수치(급지·번호·금액·집계·기간)와 비교 문장은 카드 JSON 에서 **계산**한다.
 * 카드는 급지별로 번호를 새로 매기므로(1급지 1~6 · 2급지 1~7 · 3급지 1~6),
 * 캡션도 **카드에 없는 전체 순위를 쓰지 않는다** — 카드가 근거를 못 대는 숫자는 안 쓴다(CAPTION.md §2·§6).
 *
 * 실행: node scripts/gen-hakgun-caption.mjs data/content/{날짜}/hakgun-map.json --out hakgun-map
 */
import { readFileSync } from "node:fs";
import { writeCaption } from "./lib/caption-signature.mjs";

const cardPath = process.argv[2];
const acaIdx = process.argv.indexOf("--academy");
const acaPath = acaIdx >= 0 ? process.argv[acaIdx + 1] : null;
const outIdx = process.argv.indexOf("--out");
const out = outIdx >= 0 ? process.argv[outIdx + 1] : "hakgun-map";
if (!cardPath) throw new Error("사용법: node scripts/gen-hakgun-caption.mjs <카드.json> [--out 라벨]");

const c = JSON.parse(readFileSync(cardPath, "utf8"));
const groups = c.groups;
const flat = c.rows;
const period = c.source.period;
const num2 = (r) => Number(r.price);
const byPrice = new Map(flat.map((r) => [r.name, r]));

const lines = [];
lines.push("학군 1급지가 값도 1등은 아니었습니다 🏫");
lines.push("");
lines.push(`『대한민국 학군지도』가 나눈 학군지 가운데 수도권 ${flat.length}곳을 골라,`);
lines.push(`국민평형(전용 84㎡) 실거래를 ${period} 전부 세어 중위값을 냈습니다.`);
lines.push("");

for (const g of groups) {
  lines.push(`[${g.label} ${g.rows.length}곳]`);
  for (const r of g.rows) lines.push(`${r.n}. ${r.name} — ${r.price}억${r.tohuh ? "" : " (비규제)"}`);
  lines.push("");
}

// ── 급지 경계에서 값이 뒤집히는 곳 — 계산이 확인했을 때만 나간다 ──────
const flips = [];
for (let i = 0; i < groups.length - 1; i++) {
  const lo = groups[i].rows.at(-1);      // 위 급지의 맨 아래
  const hi = groups[i + 1].rows[0];      // 아래 급지의 맨 위
  if (num2(lo) < num2(hi))
    flips.push(
      `· ${groups[i].label} 맨 아래 ${lo.name} ${lo.price}억 < ${groups[i + 1].label} 맨 위 ${hi.name} ${hi.price}억`,
    );
}
if (flips.length) {
  lines.push("[급지 경계가 뒤집히는 곳]");
  lines.push(...flips);
  lines.push(`· 폭은 ${flat[0].name} ${flat[0].price}억부터 ${flat.at(-1).name} ${flat.at(-1).price}억까지입니다`);
  lines.push("");
}

// ── 토지거래허가구역과 겹쳐 보면 ────────────────────────────────────
const outside = flat.filter((r) => !r.tohuh);
if (outside.length) {
  const cap = Math.ceil(Math.max(...outside.map(num2)));
  lines.push("[토지거래허가구역과 겹쳐 보면]");
  lines.push(`· ${flat.length}곳 중 ${flat.length - outside.length}곳이 허가구역 안입니다`);
  lines.push(`· 밖은 ${outside.map((r) => r.name).join(" · ")} ${outside.length}곳뿐이고, 전부 ${cap}억 미만입니다`);
  lines.push("");
}

// 지방은 지도에 못 얹으므로 카드에서도 별도 블록이다 — 캡션도 같은 순서로 적는다.
if (c.jibang && c.jibang.rows && c.jibang.rows.length) {
  lines.push(`[${c.jibang.label}]`);
  for (const r of c.jibang.rows) lines.push(`· ${r.name} (${r.grade}급지) — ${r.price}억`);
  lines.push("");
}

// ── 2장째(학원 수) — 카드 JSON 에서 그대로 읽는다. 캡션이 숫자를 다시 세지 않는다.
if (acaPath) {
  const A = JSON.parse(readFileSync(acaPath, "utf8"));
  lines.push(`[2장째 — 입시·보습 학원 수 (${A.rows.length + A.jibang.rows.length}곳)]`);
  for (const g of A.groups) {
    lines.push(`· ${g.label} — ${g.rows.map((r) => `${r.name} ${r.aca}`).join(" · ")}`);
  }
  lines.push(`· 지방 — ${A.jibang.rows.map((r) => `${r.name} ${r.aca}`).join(" · ")}`);
  lines.push("");

  // 값 순위와 학원 순위가 가장 크게 어긋난 곳을 **계산해서** 고른다.
  // 두 카드에 다 있는 곳만 본다 — 봉선은 실거래가 없어 1장에 없다.
  const num = (t) => Number(String(t).replace(/,/g, ""));
  const aFlat = A.rows;
  const both = aFlat.filter((r) => byPrice.has(r.name));
  const priceRank = new Map(
    [...flat].sort((x, y) => Number(y.price) - Number(x.price)).map((r, i) => [r.name, i + 1]),
  );
  const acaRank = new Map(
    [...both].sort((x, y) => num(y.aca) - num(x.aca)).map((r, i) => [r.name, i + 1]),
  );
  const gap = both.map((r) => ({
    name: r.name,
    aca: acaRank.get(r.name),
    price: priceRank.get(r.name),
    d: priceRank.get(r.name) - acaRank.get(r.name),
  }));
  const up = [...gap].sort((x, y) => y.d - x.d)[0];
  const down = [...gap].sort((x, y) => x.d - y.d)[0];
  lines.push("[값 순위와 학원 순위가 어긋나는 곳]");
  lines.push(`· ${up.name} — 값 ${up.price}위인데 학원은 ${up.aca}위 (${byPrice.get(up.name).price}억)`);
  lines.push(`· ${down.name} — 값 ${down.price}위인데 학원은 ${down.aca}위 (${byPrice.get(down.name).price}억)`);
  lines.push("");
}

lines.push("👉 급지는 학교와 학원가를 보고 나눈 것이고, 값은 시장이 매긴 것입니다. 둘이 늘 같이 가지는 않습니다.");
lines.push("");
lines.push(`※ 출처 — 급지 분류는 『대한민국 학군지도』, 값은 국토교통부 아파트 매매 실거래가 ${period}입니다.`);
if (acaPath)
  lines.push(
    "※ 학원 수는 나이스 교육정보 개방 포털의 학원·교습소 원장에서 분야가 「입시·검정 및 보습」인 **학원**만 센 것입니다. " +
      "교습소(1인 운영·일시수용 9명)는 뺐습니다. 정원은 신고 편차가 커 쓰지 않았습니다.",
  );
// ⚠️ 봉선은 **1장에만** 빠진다(실거래 0건). 2장에는 있다 — 이 구분을 뭉개면 캡션이 오보가 된다.
lines.push(
  "※ 청라(인천 서구)는 행정구역 개편 예고로 코드표에 없어 뺐습니다." +
    (acaPath
      ? " 봉선(광주)은 실거래가 올해 내내 0건이라 1장(시세)에는 없고 2장(학원)에만 있습니다."
      : " 봉선(광주)은 실거래 API 가 올해 내내 0건을 돌려줘 이번 판에서 뺐습니다."),
);
lines.push("※ 번호는 급지별로 새로 매겼습니다. 학군지 경계는 행정구역이 아니라 생활권이라, 넣은 법정동을 데이터셋에 공개합니다.");
lines.push("");
lines.push("더 보기 👉 @wirit_note");
lines.push("");
lines.push(acaPath ? "#학군지 #학원가 #대치동 #목동 #위릿" : "#학군지 #대치동 #목동 #서울아파트 #위릿");

const p = writeCaption(out, lines.join("\n"));
console.log(`✅ 캡션 — ${p}`);
console.log(`   급지 경계 뒤집힘 ${flips.length}건 · 비규제 ${outside.length}곳 · 전부 카드에서 계산`);
