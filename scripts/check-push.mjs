/**
 * 푸시 길이 열려 있는지 **작업 전에** 확인한다.
 *
 * ── 왜 만들었나 (2026-08-06)
 * 카드 한 장을 네 번 고쳐 확정까지 마치고 나서야 푸시가 막힌 걸 알았다.
 * 커밋 6건이 컨테이너 안에만 남았고, 컨테이너는 세션이 끝나면 회수된다.
 * **컨테이너 안에만 있는 커밋은 없는 것과 같다.**
 *
 * 막히는 방식이 고약하다 — clone 은 세션 시작에 이미 끝나 있어서 성공했고,
 * 커밋도 로컬이라 전부 성공한다. 실패는 **맨 마지막 한 번**에 몰려서 나타난다.
 * 그래서 작업을 시작하기 전에 한 번, 손으로 물어봐야 한다.
 *
 * ── 무엇을 보나
 * `git ls-remote` 한 번. 원격을 **읽을 수 있으면** 자격증명이 주입된 것이고,
 * 그러면 푸시도 열려 있다. 쓰기를 실제로 시도하지는 않는다(빈 커밋을 남기지 않는다).
 *
 * ── 어떻게 쓰나
 *     node scripts/check-push.mjs
 * 막혀 있으면 exit 1 과 함께 무엇을 해야 하는지 찍는다.
 */
import { execFileSync } from "node:child_process";

function run(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 45000 });
}

let ahead = "?";
try {
  const br = run(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
  ahead = run(["rev-list", "--count", `origin/${br}..HEAD`]).trim();
} catch {
  /* 원격 추적이 없으면 셈이 안 된다 — 그건 이 검사의 관심사가 아니다 */
}

try {
  run(["ls-remote", "--heads", "origin"]);
  console.log("✅ 푸시 길 열려 있음 — 원격을 읽고 쓸 수 있습니다.");
  if (ahead !== "0" && ahead !== "?") console.log(`   ⓘ 아직 안 올린 커밋 ${ahead}건 — 지금 밀어 두세요.`);
  process.exit(0);
} catch (e) {
  const msg = String(e.stderr || e.message || "");
  console.log("⛔ 푸시가 막혀 있습니다. **작업을 시작하기 전에** 풀어야 합니다.\n");
  console.log(msg.split("\n").filter(Boolean).slice(0, 3).map((l) => `   ${l}`).join("\n"));
  console.log("");
  if (/authorized repository set|add_repo|not in this session/i.test(msg)) {
    console.log("   원인: 이 세션의 '소스'에 저장소가 붙어 있지 않습니다.");
    console.log("   오너가 대화창 [+] → Add from GitHub → Changwon-Moon/claude 를 고르면 열립니다.");
    console.log("   (자격증명 문제가 아니라 호스트 접근 문제라 개인 토큰으로는 못 풉니다.)");
  } else if (/could not read Username|terminal prompts disabled/i.test(msg)) {
    console.log("   원인: 자격증명이 주입되지 않았습니다 — 위와 같은 이유일 가능성이 큽니다.");
  }
  console.log("");
  console.log("   그전까지의 작업은 반드시 패치로 뽑아 오너에게 보냅니다:");
  console.log("     git format-patch origin/<브랜치>..HEAD --stdout > /tmp/wirit.patch");
  console.log("   컨테이너 안에만 있는 커밋은 없는 것과 같습니다.");
  if (ahead !== "0" && ahead !== "?") console.log(`\n   ⚠️ 지금 이미 ${ahead}건이 로컬에만 있습니다.`);
  process.exit(1);
}
