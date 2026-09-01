/**
 * 학군지 지도 카드 캡션 생성기 — 숫자를 옮겨 적지 않는다.
 *
 * 캡션의 모든 수치(순위·급지·금액·집계·기간)는 카드 JSON 에서 꺼낸다.
 * '1급지인데 몇 위' 같은 반전 문장도 **여기서 계산**한다 — 손으로 적으면
 * 다음 갱신 때 카드와 캡션이 어긋난다(CAPTION.md §2).
 *
 * 실행: node scripts/gen-hakgun-caption.mjs data/content/{날짜}/hakgun-map.json --out hakgun-map
 */
import { readFileSync } from "node:fs";
import { writeCaption } from "./lib/caption-signature.mjs";

const cardPath = process.argv[2];
const outIdx = process.argv.indexOf("--out");
const out = outIdx >= 0 ? process.argv[outIdx + 1] : "hakgun-map";
if (!cardPath) throw new Error("사용법: node scripts/gen-hakgun-caption.mjs <카드.json> [--out 라벨]");

const c = JSON.parse(readFileSync(cardPath, "utf8"));
const rows = c.rows;
const period = c.source.period;

// ── 급지별 순위 폭 — 계산이 확인한 것만 문장이 된다 ──────────────────
const byGrade = (g) => rows.filter((r) => r.grade === g);
const worstOf = (g) => byGrade(g).at(-1);
const bestOf = (g) => byGrade(g)[0];

const g1worst = worstOf(1);   // 1급지 중 가장 아래
const g2best = bestOf(2);     // 2급지 중 가장 위
const g2worst = worstOf(2);
const g3best = bestOf(3);

// 1급지인데 2급지 최상위보다 아래인 것들 — 있을 때만 문장이 나간다
const flipped1 = byGrade(1).filter((r) => r.n > g2best.n);
const flipped2 = byGrade(2).filter((r) => r.n > g3best.n);

const out3 = rows.filter((r) => !r.tohuh);

const lines = [];
lines.push(`학군 1급지가 집값 1위는 아니었습니다 🏫`);
lines.push("");
lines.push(
  `『대한민국 학군지도』가 나눈 학군지 가운데 수도권 ${rows.length}곳을 골라,`,
);
lines.push(`34평(전용 79~86㎡) 실거래를 ${period} 전부 세어 중위값을 냈습니다.`);
lines.push("");
lines.push("[수도권 학군지 34평 중위 실거래가]");
for (const r of rows) lines.push(`${r.n}. ${r.name} (${r.grade}급지) — ${r.price}억`);
lines.push("");

if (flipped1.length) {
  lines.push("[급지와 값이 어긋난 곳]");
  lines.push(
    `· 1급지 ${flipped1.map((r) => `${r.name} ${r.n}위`).join(" · ")} — 2급지 최상위 ${g2best.name}(${g2best.n}위)보다 아래입니다`,
  );
  if (flipped2.length)
    lines.push(
      `· 2급지 ${flipped2.map((r) => `${r.name} ${r.n}위`).join(" · ")} — 3급지 최상위 ${g3best.name}(${g3best.n}위)보다 아래입니다`,
    );
  lines.push(
    `· 값의 폭은 ${rows[0].name} ${rows[0].price}억 ~ ${rows.at(-1).name} ${rows.at(-1).price}억입니다`,
  );
  lines.push("");
}

lines.push("[토지거래허가구역과 겹쳐 보면]");
lines.push(
  `· ${rows.length}곳 중 ${rows.length - out3.length}곳이 허가구역 안입니다`,
);
lines.push(
  `· 밖은 ${out3.map((r) => `${r.name}(${r.n}위)`).join(" · ")} ${out3.length}곳뿐입니다`,
);
lines.push("");
lines.push(
  `👉 급지는 학교와 학원가를 보고 나눈 것이고, 값은 시장이 매긴 것입니다. 둘이 늘 같이 가지는 않습니다.`,
);
lines.push("");
lines.push(`※ 출처 — 급지 분류는 『대한민국 학군지도』, 값은 국토교통부 아파트 매매 실거래가 ${period}입니다.`);
lines.push(`※ 인천(송도·부평·청라)과 지방 학군지는 실거래 수집 범위 밖이라 뺐습니다.`);
lines.push(`※ 학군지 경계는 행정구역이 아니라 생활권이라, 포함한 법정동을 데이터셋에 공개합니다.`);
lines.push("");
lines.push("더 보기 👉 @wirit_note");
lines.push("");
lines.push("#학군지 #대치동 #목동 #서울아파트 #위릿");

const p = writeCaption(out, lines.join("\n"));
console.log(`✅ 캡션 — ${p}`);
console.log(`   반전 ${flipped1.length + flipped2.length}건 · 허가구역 밖 ${out3.length}곳 · 전부 카드에서 계산`);
