/**
 * 워크플로 YAML 파수꾼 — 깨진 워크플로는 **조용히** 안 돈다.
 *
 * ── 왜 만들었나 (2026-08-03)
 * `kosis-probe.yml` 이 한 달 가까이 한 번도 안 돌았는데 아무도 몰랐다.
 * 원인은 `run: |` 블록 안에 여러 줄짜리 셸 문자열을 쓰면서
 * 이어지는 줄을 **1열에 붙여 쓴 것**이었다:
 *
 *     run: |
 *       node scripts/notify-telegram.mjs "첫 줄
 *   $SUM"                                   ← 1열. 여기서 블록이 끊긴다
 *
 * YAML 은 여기서 파싱이 깨지고, GitHub 은 그 워크플로를 **등록조차 하지 않는다.**
 * 푸시해도 실행 목록에 아무것도 안 뜬다 — 빨간불조차 없다. 실패보다 나쁘다.
 * 실패는 보이지만 이건 안 보인다.
 *
 * 같은 결함이 `auto-produce.yml` 에도 있었다. 한 번 저지른 실수는 반복된다.
 *
 * ── 무엇을 잡나
 * 1. YAML 파싱 자체가 깨지는가 (들여쓰기 탈출)
 * 2. 워크플로에 필수 키(name·on·jobs)가 있는가
 *
 * ── 어떻게 쓰나
 *     node scripts/lint-workflows.mjs
 * 하나라도 깨져 있으면 exit 1. `scripts/doctor.mjs` 가 이걸 부른다.
 *
 * ── 여러 줄 알림을 쓰고 싶으면
 * 1열에 붙이지 말고 printf 로 만든다:
 *     MSG=$(printf '첫 줄\n%s' "$SUM")
 *     node scripts/notify-telegram.mjs "$MSG"
 */
import { readdirSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const DIR = ".github/workflows";

/** 최상위에 올 수 있는 키 — 이것 말고 1열에 오는 글자는 블록을 깨뜨린 것이다. */
const TOP_KEYS = new Set([
  "name", "on", "jobs", "permissions", "concurrency",
  "env", "defaults", "run-name",
]);

/** 진짜 파서 없이 "1열 탈출"만 정확히 잡는다 — 이게 실제로 우리를 문 결함이다. */
function lint(file, text) {
  const problems = [];
  const lines = text.split("\n");
  const seen = new Set();

  lines.forEach((line, i) => {
    if (!line.trim()) return;                    // 빈 줄
    if (/^\s/.test(line)) return;                // 들여쓰기 있음 — 정상
    if (line.startsWith("#") || line.startsWith("---")) return;

    const key = line.match(/^([A-Za-z_][\w-]*)\s*:/);
    if (key && TOP_KEYS.has(key[1])) {
      seen.add(key[1]);
      return;
    }
    problems.push({
      line: i + 1,
      text: line.length > 60 ? line.slice(0, 60) + "…" : line,
      why: key
        ? `최상위에 올 수 없는 키 '${key[1]}'`
        : "1열에 붙은 줄 — 위 블록(run: | 등)이 여기서 끊긴다",
    });
  });

  for (const need of ["name", "on", "jobs"]) {
    // `on:` 은 YAML 이 true 로 읽는 일이 있어 원문에서 확인한다.
    if (!seen.has(need)) problems.push({ line: 0, text: "", why: `필수 키 '${need}:' 가 없다` });
  }
  return problems;
}

let files;
try {
  files = readdirSync(DIR).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml")).sort();
} catch {
  console.log("워크플로 폴더가 없습니다 — 건너뜁니다.");
  process.exit(0);
}

/* ── 예약(schedule)은 기본 브랜치에서만 깬다 (2026-08-04 사고) ──
 * GitHub Actions 의 cron 은 **기본 브랜치에 있는 워크플로만** 실행한다.
 * 작업 브랜치에만 올려두면 파일은 멀쩡한데 한 번도 안 돈다 — 빨간불조차 없다.
 * 실제로 청약홈 수집을 포함해 7개 예약이 그렇게 죽어 있었고,
 * 오너가 "오늘 텔레그램이 안 왔다"고 말하기 전까지 아무도 몰랐다.
 * origin/HEAD 를 못 읽는 환경(막 clone 한 컨테이너 등)에서는 조용히 건너뛴다 —
 * 검사가 없어서 못 잡는 것과, 검사가 작업을 막는 것은 다른 문제다. */
function checkScheduleOnDefaultBranch() {
  let head;
  try {
    head = execSync("git symbolic-ref --short refs/remotes/origin/HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim(); // 예: origin/claude/xxx
  } catch {
    return null; // 기본 브랜치를 모른다 — 검사 생략
  }
  let onDefault;
  try {
    onDefault = new Set(
      execSync(`git ls-tree --name-only ${head} ${DIR}/`, { stdio: ["ignore", "pipe", "ignore"] })
        .toString().trim().split("\n").filter(Boolean).map((p) => p.split("/").pop()),
    );
  } catch {
    return null;
  }
  const orphans = files.filter(
    (f) => /^\s*schedule:/m.test(readFileSync(join(DIR, f), "utf8")) && !onDefault.has(f),
  );
  return { head, orphans };
}

let bad = 0;
for (const f of files) {
  const problems = lint(f, readFileSync(join(DIR, f), "utf8"));
  if (!problems.length) continue;
  bad++;
  console.log(`\n❌ ${DIR}/${f}`);
  for (const p of problems) {
    console.log(`   ${p.line ? `${p.line}행: ` : ""}${p.why}`);
    if (p.text) console.log(`      │ ${p.text}`);
  }
}

if (bad) {
  console.log(`\n${bad}/${files.length} 워크플로가 깨져 있습니다.`);
  console.log("깨진 워크플로는 GitHub 에 등록되지 않아 **실행 목록에 뜨지도 않습니다** — 빨간불조차 없습니다.");
  console.log("여러 줄 메시지는 1열에 붙이지 말고 printf 로 만드세요:");
  console.log("   MSG=$(printf '첫 줄\\n%s' \"$SUM\") && node scripts/notify-telegram.mjs \"$MSG\"");
  process.exit(1);
}

const sched = checkScheduleOnDefaultBranch();
if (sched?.orphans.length) {
  console.log(`\n⚠️ 예약이 안 도는 워크플로 ${sched.orphans.length}개 — 기본 브랜치(${sched.head})에 없습니다.`);
  for (const f of sched.orphans) console.log(`   · ${f}`);
  console.log("   cron 은 기본 브랜치의 워크플로만 깨웁니다. 파일은 멀쩡한데 한 번도 안 돕니다.");
  console.log("   → 기본 브랜치를 바꾸거나(Settings → General → Default branch), 그 브랜치에도 올리세요.");
}

console.log(`✅ 워크플로 ${files.length}개 모두 정상`);
