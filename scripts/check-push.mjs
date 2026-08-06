/**
 * 푸시 길이 열려 있는지 **작업 전에** 확인한다.
 *
 * ⚠️ **읽기가 된다고 쓰기가 되는 게 아니다** (2026-08-06 실측).
 * 프록시는 fetch/ls-remote 는 통과시키면서 push 만 403 으로 막을 수 있다.
 * 그래서 `ls-remote` 로는 부족하고 **`push --dry-run`** 까지 봐야 한다.
 * dry-run 은 원격에 아무것도 남기지 않는다 — 협상만 하고 끊는다.
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
 * `git push --dry-run` 한 번. 자격증명은 인라인으로 넘긴다(프로젝트 문서의 PAT) —
 * 이 저장소는 자격증명을 디스크에 남기지 않는 게 규칙이라 셸에 저장돼 있지 않다.
 * 토큰은 `WIRIT_GH_PAT` 환경변수로 준다. 없으면 자격증명 없이 시도하고,
 * "Username 을 못 읽는다"는 **차단이 아니라 토큰 미지정**이라고 구분해 말한다.
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

const PAT = process.env.WIRIT_GH_PAT || "";
const withCred = PAT
  ? ["-c", `credential.helper=!f(){ echo username=x-access-token; echo password=${PAT}; };f`]
  : [];

try {
  run([...withCred, "push", "--dry-run"]);
  console.log("✅ 푸시 길 열려 있음 — 원격에 쓸 수 있습니다.");
  if (ahead !== "0" && ahead !== "?") console.log(`   ⓘ 아직 안 올린 커밋 ${ahead}건 — 지금 밀어 두세요.`);
  process.exit(0);
} catch (e) {
  const msg = String(e.stderr || e.message || "");
  console.log("⛔ 푸시가 막혀 있습니다. **작업을 시작하기 전에** 풀어야 합니다.\n");
  console.log(msg.split("\n").filter(Boolean).slice(0, 3).map((l) => `   ${l}`).join("\n"));
  console.log("");
  if (/authorized repository set|add_repo|not in this session/i.test(msg)) {
    console.log("   원인: 이 세션의 **인가 저장소 목록**에 이 저장소가 없습니다.");
    console.log("   ⚠️ 읽기(fetch·clone)는 되면서 쓰기만 막히는 상태일 수 있습니다 — 실제로 그랬다(2026-08-06).");
    console.log("      그래서 clone 이 됐다고 안심하면 안 되고, 커밋도 전부 로컬이라 마지막까지 성공한다.");
    console.log("   ⚠️ 코워크 대화창 [+] 메뉴에는 저장소를 붙이는 항목이 없다(2026-08-06 확인 —");
    console.log("      파일/스킬/커넥터/플러그인 뿐. 'Add from GitHub' 는 claude.ai 채팅·프로젝트 쪽 UI다).");
    console.log("   인가 목록은 **세션이 만들어질 때** 잡힌다. 그러니 풀리는 길은 둘뿐이다:");
    console.log("     ① 저장소를 붙인 새 코워크 세션을 시작한다(이 세션의 작업분은 패치로 넘긴다)");
    console.log("     ② 오너가 자기 컴퓨터에서 패치를 적용하고 직접 푸시한다");
    console.log("   자격증명 문제가 아니라 **호스트 접근** 문제다 — 개인 토큰(PAT)으로는 안 풀린다.");
    console.log("   프록시가 막은 것을 다른 인증 경로로 돌아가려 하지 않는다.");
  } else if (/could not read Username|terminal prompts disabled/i.test(msg)) {
    console.log("   원인: 토큰을 안 넘겼습니다 — 차단이 아닙니다.");
    console.log("   프로젝트 문서의 PAT 를 넘겨 다시 보세요:");
    console.log("     WIRIT_GH_PAT=github_pat_... node scripts/check-push.mjs");
  }
  console.log("");
  console.log("   그전까지의 작업은 반드시 패치로 뽑아 오너에게 보냅니다:");
  console.log("     git format-patch origin/<브랜치>..HEAD --stdout > /tmp/wirit.patch");
  console.log("   컨테이너 안에만 있는 커밋은 없는 것과 같습니다.");
  if (ahead !== "0" && ahead !== "?") console.log(`\n   ⚠️ 지금 이미 ${ahead}건이 로컬에만 있습니다.`);
  process.exit(1);
}
