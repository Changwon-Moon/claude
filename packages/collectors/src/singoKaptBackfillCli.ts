/**
 * 🔑 지난 신고가 로그에 **대장 열쇠(kaptCode)를 채워 넣는다** — 한 번 쓰고 끝나는 도구.
 *
 *   tsx src/singoKaptBackfillCli.ts [--dry]
 *
 * ── 왜 (2026-09-03 오너 지시)
 * 아침 판정기는 명부 항목을 **이름과 지번이 서로를 검사하게** 해서 물려 놓고(`pickUniverse`),
 * 세대수만 베낀 뒤 `kaptCode` 는 버리고 있었다. 그래서 카드를 만들 때 사람이 대장을 원라이너로
 * 뒤져 **매일 열댓 번 같은 답을 다시 찾았다.** 판정기는 오늘 고쳤지만, 그건 **내일 것부터** 남는다.
 * 이미 쌓인 로그에는 열쇠가 없어서 오늘 만들 카드는 여전히 손으로 찾아야 한다.
 *
 * → 그래서 **같은 함수로 한 번 되돌려 채운다.** 새로 판단하는 것이 아니라
 *   그때 이미 내려졌던 판단을 **다시 계산해 적는 것**이다.
 *
 * ── ⚠️ 안전 규칙
 * ① **`pickUniverse` 를 그대로 쓴다.** 여기서 이름만 보고 갖다 붙이면 그게 상록마을 사고다.
 * ② **못 물린 건은 비워 둔다.** 억지로 채우지 않는다 — 「모른다」와 「없다」는 다른 뜻이다.
 * ③ **다른 칸은 손대지 않는다.** 가격·날짜·세대수는 그때 기록 그대로 둔다.
 * ④ 채운 뒤 **세대수가 그때 기록과 다르면 채우지 않고 말한다** — 다르다는 것은 명부가
 *    그새 바뀌었다는 뜻이고, 그러면 그 건은 사람이 봐야 한다.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildUniverseLookup } from "./universeIndex.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DIR = join(ROOT, "data/datasets/singo-log");
const DRY = process.argv.includes("--dry");

const lookup = buildUniverseLookup();
if (!lookup) {
  console.error("::error::명부 조회판을 못 만들었습니다 — 채우지 않고 멈춥니다");
  process.exit(1);
}
if (!existsSync(DIR)) {
  console.error("::error::신고가 로그 폴더가 없습니다");
  process.exit(1);
}

let filled = 0;
let already = 0;
let missed = 0;
let hhldMismatch = 0;
const misses: string[] = [];

for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json")).sort()) {
  const p = join(DIR, f);
  const j = JSON.parse(readFileSync(p, "utf8"));
  const rows = j.hits ?? j.items ?? [];
  let touched = 0;
  for (const h of rows) {
    if (h.kaptCode) { already++; continue; }
    const u = lookup(h.lawdCd, h.umdNm, h.aptNm, h.jibun);
    if (!u) {
      missed++;
      if (misses.length < 12) misses.push(`${f} ${h.gu} ${h.aptNm} ${h.type} (${h.umdNm} ${h.jibun ?? "지번없음"})`);
      continue;
    }
    /* ⚠️ 그때 적힌 세대수와 지금 명부가 다르면 **채우지 않는다.** 명부가 바뀐 것이므로
       그 건은 사람이 봐야 한다 — 조용히 새 열쇠를 박으면 그때 카드와 어긋난다. */
    if (typeof h.hhld === "number" && h.hhld > 0 && h.hhld !== u.hhld) {
      hhldMismatch++;
      if (misses.length < 12) misses.push(`${f} ${h.gu} ${h.aptNm} — 세대수 그때 ${h.hhld} ↔ 지금 ${u.hhld}`);
      continue;
    }
    h.kaptCode = u.kaptCode;
    filled++;
    touched++;
  }
  if (touched && !DRY) {
    j.meta = j.meta ?? {};
    const notes: string[] = j.meta.backfills ?? [];
    notes.push(
      `2026-09-03: kaptCode ${touched}건을 되돌려 채웠다. 새 판단이 아니라 그때와 같은 함수(pickUniverse)로 다시 계산한 값이다. 못 물린 건과 세대수가 달라진 건은 비워 뒀다.`,
    );
    j.meta.backfills = notes;
    writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
  }
  console.log(`${DRY ? "(시험) " : ""}${f} — 채움 ${touched} / 전체 ${rows.length}`);
}

console.log(
  `\n🔑 채움 ${filled}건 · 이미 있던 것 ${already}건 · 못 물림 ${missed}건 · 세대수 달라 보류 ${hhldMismatch}건`,
);
if (misses.length) {
  console.log("   비워 둔 것(앞 12건):");
  for (const m of misses) console.log(`   · ${m}`);
  console.log("   → 이 건들은 카드 만들 때 --kapt 로 사람이 짚습니다. 그게 맞습니다.");
}
if (DRY) console.log("\n(--dry) 파일은 안 고쳤습니다.");
