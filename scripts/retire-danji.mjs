/**
 * 청약 단지 카드를 **은퇴**시킨다 — 접수가 끝나 청약홈 목록에서 빠진 공고를 굳힌다.
 *
 * ── 왜 필요한가 (2026-08-12)
 * 청약홈 수집분은 "지금 접수 중인 것"만 담는다. 접수가 끝나면 공고가 목록에서 사라지고,
 * 그 순간 **이미 발행까지 한 카드가 재생산할 때마다 죽는다.** 더샵 송도그란테르가 그랬고,
 * 그 예외 하나가 `rebuild-cards` 를 통째로 빨간불로 만들어 두고 있었다.
 *
 * 사람이 손으로 숫자를 옮겨 적으면 오보 0 규칙이 깨진다. 그래서 이 스크립트가
 * **수집분(또는 git 이력)에서 그 공고 레코드를 통째로 떠서** 데이터셋에 박는다.
 * 수치의 출처는 여전히 코드고, 어느 판본을 굳혔는지도 함께 남는다.
 *
 * ── 무엇을 하나
 *   data/datasets/bunyang-danji-2026.json 의 해당 단지에
 *     _applyhomeSnapshot : 청약홈 공고 레코드 그대로
 *     _retiredAt         : 굳힌 날(수집분의 기준일 — 오늘이 아니다. 결정성)
 *     _retiredFrom       : 어디서 떴는지(latest | git:<sha>)
 *   를 추가한다. 이미 있으면 덮지 않는다(한 번 굳힌 판본은 안 흔든다).
 *
 * ── 어떻게 쓰나
 *     node scripts/retire-danji.mjs songdo-granter-remndr
 *     node scripts/retire-danji.mjs songdo-granter-remndr --force   # 다시 굳히기
 *
 * 굳힌 뒤에는 `build-danji.mjs` 가 접수 종료를 알아서 감지해 이 판본으로 그린다.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DS = join(ROOT, "data/datasets/bunyang-danji-2026.json");
const AH = "data/datasets/applyhome-latest.json";

const id = process.argv.slice(2).find((a) => !a.startsWith("--"));
const force = process.argv.includes("--force");
if (!id) {
  console.error("❌ 어느 단지인지 알려주세요:  node scripts/retire-danji.mjs <단지 id>");
  process.exit(1);
}

const doc = JSON.parse(readFileSync(DS, "utf8"));
const list = doc.danji || doc.items || [];
const d = list.find((x) => x.id === id);
if (!d) {
  console.error(`❌ 데이터셋에 그런 단지가 없습니다: ${id}`);
  console.error(`   있는 것: ${list.map((x) => x.id).join(", ")}`);
  process.exit(1);
}
if (!d.applyhomeNo) {
  console.error(`❌ ${id} 에는 공고번호(applyhomeNo)가 없습니다 — 은퇴시킬 대상이 아닙니다.`);
  process.exit(1);
}
if (d._applyhomeSnapshot && !force) {
  console.log(`⏸ 이미 굳혀져 있습니다 (${d._retiredAt || "?"} · ${d._retiredFrom || "?"}). 다시 굳히려면 --force`);
  process.exit(0);
}

/** 주어진 JSON 본문에서 그 공고를 찾는다 */
const findIn = (text) => {
  try {
    return (JSON.parse(text).notices || []).find((x) => x.pblancNo === d.applyhomeNo) || null;
  } catch {
    return null;
  }
};
/** 수집분의 기준일 — 오늘 날짜를 쓰지 않는다(같은 입력이면 같은 결과여야 한다) */
const collectedOf = (text) => {
  try {
    const j = JSON.parse(text);
    return j.meta?.collectedFor || j.meta?.collectedAt || "";
  } catch {
    return "";
  }
};

let hit = null;
let from = "";
let when = "";

// ① 지금 수집분에 아직 있으면 그걸 쓴다(접수 마지막 날 미리 굳히는 경우)
if (existsSync(join(ROOT, AH))) {
  const cur = readFileSync(join(ROOT, AH), "utf8");
  hit = findIn(cur);
  if (hit) { from = "latest"; when = collectedOf(cur); }
}

// ② 이미 빠졌으면 git 이력을 거슬러 **마지막으로 담겨 있던 판본**을 찾는다
if (!hit) {
  let shas = [];
  try {
    shas = execFileSync("git", ["log", "--format=%H", "-60", "--", AH], { cwd: ROOT, encoding: "utf8" })
      .split("\n").filter(Boolean);
  } catch {
    /* git 이 없으면 아래에서 안내하고 끝낸다 */
  }
  for (const sha of shas) {
    let text = "";
    try { text = execFileSync("git", ["show", `${sha}:${AH}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); }
    catch { continue; }
    const h = findIn(text);
    if (h) { hit = h; from = `git:${sha.slice(0, 8)}`; when = collectedOf(text); break; }
  }
}

if (!hit) {
  console.error(`❌ 공고번호 ${d.applyhomeNo} 를 수집분에서도 git 이력(최근 60판)에서도 못 찾았습니다.`);
  console.error(`   손으로 숫자를 적어 넣지 마세요 — 그건 오보 0 규칙을 깨는 길입니다.`);
  console.error(`   대신 이 카드를 세트에서 내리는 것을 검토하세요(관제탑 🗑 시안 내리기).`);
  process.exit(1);
}

if (d.total != null && d.total !== hit.supply) {
  console.error(`❌ 총 세대수가 어긋납니다 — 데이터셋 ${d.total} vs 청약홈 ${hit.supply}`);
  console.error(`   어긋난 채로 굳히면 그 오보가 영구히 박힙니다. 먼저 맞추세요.`);
  process.exit(1);
}

d._applyhomeSnapshot = hit;
d._retiredAt = when || "";
d._retiredFrom = from;
writeFileSync(DS, JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`✅ ${id} 은퇴 처리 — 마지막 판본을 굳혔습니다`);
console.log(`   출처: ${from}${when ? ` · 수집 기준일 ${when}` : ""}`);
console.log(`   공고: ${hit.name} · 공급 ${hit.supply}세대 · 접수 ${hit.receiptFrom}~${hit.receiptTo}`);
console.log(`   이제 build-danji 가 접수 종료를 알아서 감지해 이 판본으로 그립니다.`);
