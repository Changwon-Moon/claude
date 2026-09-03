/**
 * ✏️ 단지 이름 사전에 한 줄 넣거나 뺀다 — `data/review/apt-names.json`
 *
 *   node scripts/rename-danji.mjs --kapt A46571103 --name "하남 꿈동산신안" --why "어느 하남인지 안 보여서"
 *   node scripts/rename-danji.mjs --apt "꿈동산신안" --name "하남 꿈동산신안" --why "…"   ← 코드를 로그에서 찾아 준다
 *   node scripts/rename-danji.mjs --kapt A46571103 --remove
 *   node scripts/rename-danji.mjs --list
 *
 * ── 왜 (2026-09-03 오너 "안그래도 단지명을 내가 수정해야 하는 상황들도 생길 것 같고")
 * 오너가 고친 제목이 빌더 한 줄에만 붙어 있으면, 같은 단지가 다음 달에 다른 평형으로
 * 신고가를 쓸 때 **원래 신고명으로 되돌아간다.** 오너가 같은 지적을 두 번 하게 되는 자리다.
 * 사전에 넣으면 그 단지의 카드는 앞으로 전부 그 이름으로 나온다.
 *
 * ── ⚠️ 이 도구가 지키는 것
 * ① **대장 코드로 짚는다.** 이름으로 짚으면 남의 단지에 붙는다(상록마을 2026-08-13).
 *    `--apt` 를 주면 신고가 로그에서 코드를 찾아 주고, **후보가 둘 이상이면 멈춘다.**
 * ② **코드가 대장에 있는지 확인한다.** 오타 하나면 영영 안 듣는 항목이 된다.
 * ③ **왜 고쳤는지를 받는다.** 이유 없는 항목은 몇 주 뒤 「이거 왜 이러지」가 되고,
 *    그러면 누군가 무심코 지운다.
 * ④ 넣은 뒤 **그 단지의 카드를 다시 만들라고 알려 준다** — 사전만 고치면 이미 만든 카드는 안 바뀐다.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const flag = (n) => process.argv.includes(`--${n}`);

const BOOK = "data/review/apt-names.json";
if (!existsSync(P(BOOK))) {
  console.error(`::error::${BOOK} 이 없습니다`);
  process.exit(1);
}
const book = JSON.parse(readFileSync(P(BOOK), "utf8"));
book.names = book.names ?? {};

const hhldPath = P("data/datasets/apt-hhld.json");
const byKapt = existsSync(hhldPath) ? JSON.parse(readFileSync(hhldPath, "utf8")).byKapt ?? {} : {};

if (flag("list") || process.argv.length <= 2) {
  const e = Object.entries(book.names);
  console.log(`✏️ 단지 이름 사전 — ${e.length}건\n`);
  for (const [k, v] of e)
    console.log(`  ${k}  ${byKapt[k]?.name ?? "(대장에 없음)"} → 「${v.name}」\n     ${v.why ?? "(이유 미기재)"} · ${v.by ?? "?"} ${v.at ?? ""}`);
  if (!e.length) console.log("  (비어 있습니다)");
  process.exit(0);
}

/* ── 코드 정하기 ── */
let KAPT = arg("kapt");
if (!KAPT && arg("apt")) {
  const want = arg("apt");
  const dir = P("data/datasets/singo-log");
  const codes = new Set();
  if (existsSync(dir))
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")))
      for (const h of JSON.parse(readFileSync(join(dir, f), "utf8")).hits ?? [])
        if (h.aptNm === want && h.kaptCode) codes.add(h.kaptCode);
  const list = [...codes];
  /* ⚠️ 둘 이상이면 **멈춘다.** 하나를 골라 주면 그게 곧 이름 매칭이다 —
     「관악」·「두산」처럼 짧은 신고명은 전국에 여럿이다. */
  if (list.length > 1) {
    console.error(`::error::"${want}" 로 찾은 단지가 ${list.length}곳입니다 — --kapt 로 짚어 주세요:`);
    for (const c of list) console.error(`   ${c}  ${byKapt[c]?.name ?? "?"}  ${byKapt[c]?.addr ?? ""}`);
    process.exit(1);
  }
  if (!list.length) {
    console.error(`::error::신고가 로그에서 "${want}" 의 대장 코드를 못 찾았습니다 — --kapt 로 직접 주세요`);
    process.exit(1);
  }
  KAPT = list[0];
  console.log(`ⓘ "${want}" → ${KAPT} (${byKapt[KAPT]?.name ?? "?"} · ${byKapt[KAPT]?.addr ?? ""})`);
}
if (!KAPT) {
  console.error("사용법: node scripts/rename-danji.mjs --kapt <코드> --name \"<카드에 적을 이름>\" --why \"<왜>\"");
  process.exit(2);
}

if (flag("remove")) {
  if (!book.names[KAPT]) {
    console.log(`ⓘ 사전에 ${KAPT} 가 없습니다 — 뺄 것이 없습니다`);
    process.exit(0);
  }
  const gone = book.names[KAPT];
  delete book.names[KAPT];
  writeFileSync(P(BOOK), JSON.stringify(book, null, 2) + "\n", "utf8");
  console.log(`🗑 뺐습니다 — ${KAPT} 「${gone.name}」\n   이 단지 카드는 이제 실거래 신고명으로 나옵니다. 다시 만들어야 반영됩니다.`);
  process.exit(0);
}

const NAME = arg("name");
const WHY = arg("why");
if (!NAME) {
  console.error("::error::--name 이 없습니다 (카드 제목에 적을 이름)");
  process.exit(2);
}
/* ⚠️ 이유를 안 받으면 몇 주 뒤에 아무도 못 되짚는다. 여기서 막는 편이 낫다. */
if (!WHY) {
  console.error("::error::--why 가 없습니다 — **왜 고쳤는지**를 적어야 합니다.\n   이유 없는 항목은 나중에 누군가 무심코 지웁니다.");
  process.exit(2);
}
/* ⚠️ 대장에 없는 코드면 **영영 안 듣는 항목**이 된다. 오타를 여기서 잡는다. */
if (!byKapt[KAPT]) {
  console.error(`::error::공동주택 대장에 ${KAPT} 가 없습니다 — 코드를 다시 보세요(오타면 영영 안 듣는 항목이 됩니다)`);
  process.exit(1);
}

const before = book.names[KAPT];
book.names[KAPT] = {
  name: NAME,
  why: WHY,
  by: arg("by") ?? "오너",
  at: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10),
};
writeFileSync(P(BOOK), JSON.stringify(book, null, 2) + "\n", "utf8");

console.log(
  `${before ? "✏️ 고쳤습니다" : "✅ 넣었습니다"} — ${KAPT}\n` +
    `   대장 이름: ${byKapt[KAPT].name}  (${byKapt[KAPT].addr ?? ""})\n` +
    `   카드 제목: 「${NAME}」${before ? `  (전: 「${before.name}」)` : ""}\n` +
    `   이유: ${WHY}\n\n` +
    `→ 사전만 고치면 **이미 만든 카드는 안 바뀝니다.** 그 단지 카드를 다시 만드세요:\n` +
    `   node scripts/rebuild-cards.mjs   (또는 그 빌더 하나만 다시 돌립니다)\n` +
    `⚠️ 이미 확정된 카드는 픽셀이 바뀌므로 **재확정**을 받아야 합니다(기준 §7).`,
);
