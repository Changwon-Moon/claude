/**
 * 카드 전체 재생성 — data/review/builders.json 명세를 순서대로 실행한다.
 *
 * ── 왜 이 파일인가 (2026-07-26 오너 질문 "제작된 카드는 어딨는거야?")
 * 예전엔 배포 워크플로 YAML에 빌더 명령이 하드코딩돼 있었다.
 * 새 카드를 만들어도 그 목록에 손으로 추가하지 않으면, 카드 PNG는 저장소에 없으므로
 * (gitignore) 배포된 관제탑에는 **카드가 영영 안 뜬다.** '월급 34평'이 정확히 그랬다 —
 * 세션에서는 만들어졌는데 실사이트에는 없는 카드.
 *
 * 이제 빌더 목록은 builders.json 한 곳이고, 여기와 sets.json이 어긋나면
 * 스모크(smoke-tower)가 배포를 막는다. "만들었는데 화면에 없다"가 다시는 안 생기게.
 *
 * 개별 빌더가 실패해도 나머지는 계속 그린다(관제탑의 다른 정보는 정상 표시).
 * 다만 무엇이 실패했는지 ::warning 으로 소리 낸다 — 조용히 빠뜨리지 않는다.
 *
 * 실행: node scripts/rebuild-cards.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "data/review/builders.json");

if (!existsSync(MANIFEST)) {
  console.log("::warning::빌더 명세(data/review/builders.json)가 없습니다 — 카드 재생성을 건너뜁니다.");
  process.exit(0);
}

const { builders } = JSON.parse(readFileSync(MANIFEST, "utf8"));
let ok = 0;
let bad = 0;
for (const b of Array.isArray(builders) ? builders : []) {
  const cmd = join(ROOT, b.cmd);
  if (!existsSync(cmd)) {
    console.log(`::warning::빌더 파일 없음 — ${b.label}: ${b.cmd}`);
    bad++;
    continue;
  }
  console.log(`▶ ${b.label} — node ${b.cmd} ${(b.args || []).join(" ")}`);
  const r = spawnSync("node", [cmd, ...(b.args || [])], { cwd: ROOT, stdio: "inherit" });
  if (r.status === 0) ok++;
  else {
    console.log(`::warning::빌더 실패 — ${b.label} (exit ${r.status})`);
    bad++;
  }
}
console.log(`\n🃏 카드 재생성 — 성공 ${ok} · 실패 ${bad}`);
// 실패가 있어도 배포는 계속한다(나머지 카드·정보는 정상). 실패는 위 경고로 보인다.
process.exit(0);
