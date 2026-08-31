/**
 * 🩺 환경 자가진단 — "이 환경에서 공장이 실제로 돌아가는가"
 *
 * ── 왜 이 스크립트가 있나 (2026-07-30 오너 질문: "Cowork로 넘길 수 있니?")
 * 새 환경(다른 기기·다른 Claude 창구·새 클론)에 저장소를 붙였을 때,
 * **문서를 읽어서는 알 수 없는 것**이 딱 하나 있다: 카드를 진짜로 그릴 수 있는가.
 * 렌더는 Chromium 을 띄우고 폰트를 로드해 픽셀을 찍는 일이라, 환경이 반쪽이면
 * "설명은 다 되는데 카드가 안 나오는" 상태가 된다. 그 상태로 작업하면
 * 검수가 사람 눈으로 돌아가고 — 그게 오보 0 규칙이 깨지는 지점이다.
 *
 * 그래서 이 스크립트는 **말로 확인하지 않고 실제로 한 장 만들어 본다**:
 *   빌더 실행 → 카드 JSON → 렌더 → md5 대조 → 자동 검수
 * 이 사슬이 끝까지 가면 그 환경은 공장이 맞다.
 *
 * 등급:
 *   A 필수  — 카드를 만들 수 있는가 (여기서 실패하면 카드 작업 금지)
 *   B 선택  — 데이터를 새로 수집할 수 있는가 (API 키. 없어도 기존 데이터로 카드는 나온다)
 *   C 선택  — 배포·발행 자동화 (없어도 로컬 제작은 된다)
 *
 * 실행: node scripts/doctor.mjs [--quick]
 *   --quick : 렌더 1장만(기본은 기준값 있는 카드 전부)
 */
import { existsSync, readFileSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUICK = process.argv.includes("--quick");

let pass = 0;
let fail = 0;
let warn = 0;
const blockers = [];

const ok = (name, detail) => { pass++; console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ""}`); };
const bad = (name, detail, fix) => {
  fail++;
  console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  if (fix) console.log(`     └ ${fix}`);
  blockers.push({ name, fix });
};
const soft = (name, detail) => { warn++; console.log(`  ⚠️  ${name}${detail ? ` — ${detail}` : ""}`); };
const check = (name, cond, detail, fix) => (cond ? ok(name, detail) : bad(name, detail, fix));

const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
const sh = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: "pipe", ...opts });

console.log("🩺 wirit 환경 자가진단\n");

/* ═══════════════ A. 필수 — 카드를 만들 수 있는가 ═══════════════ */
console.log("[A. 필수 — 카드 제작 능력]");

// A1. 런타임
const nodeMajor = Number(process.versions.node.split(".")[0]);
check("Node.js ≥ 20", nodeMajor >= 20, `v${process.versions.node}`,
  "Node 20 이상을 설치하세요 (package.json engines)");

let pnpmV = "";
try { pnpmV = sh("pnpm", ["-v"]).trim(); } catch { /* 없음 */ }
check("pnpm 사용 가능", !!pnpmV, pnpmV ? `v${pnpmV}` : "명령 없음",
  "npm i -g pnpm  (이 저장소는 pnpm workspace 입니다)");

// A2. 의존성 설치 여부 — 여기가 비면 아래가 전부 실패하므로 먼저 본다
const hasNM = existsSync(join(ROOT, "node_modules"))
  && existsSync(join(ROOT, "packages/renderer/node_modules"));
check("의존성 설치됨(node_modules)", hasNM, hasNM ? "" : "없음",
  "pnpm install --frozen-lockfile");

/* A3. Chromium — 렌더의 심장. 없으면 카드가 한 장도 안 나온다.
 * ⚠️ playwright-core 는 **renderer 패키지의 의존성**이다. pnpm 엄격 트리라
 *    저장소 루트에서 그냥 import 하면 못 찾는다 → renderer 기준으로 해석한다.
 *    (이 스크립트를 처음 돌렸을 때 여기서 '못 찾음'이 나와, 멀쩡한 환경을
 *     불합격으로 판정했다. 진단기의 오진은 환경 문제보다 나쁘다.) */
let chromiumPath = "";
let chromiumWhy = "";
if (hasNM) {
  try {
    const req = createRequire(join(ROOT, "packages/renderer/package.json"));
    const { chromium } = req("playwright-core");
    const pinned = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
    // 사전 설치본이 있으면 그걸 쓴다(로컬), 없으면 playwright 기본 탐색(CI)
    chromiumPath = existsSync(pinned) ? pinned : chromium.executablePath();
  } catch (e) {
    chromiumWhy = String(e.message || e).split("\n")[0].slice(0, 90);
  }
}
check("Chromium 실행 파일", !!chromiumPath && existsSync(chromiumPath),
  chromiumPath || chromiumWhy || "못 찾음",
  "pnpm exec playwright install chromium  또는 CHROMIUM_PATH 로 경로 지정");

// A4. 폰트 — 조용히 폴백되면 '통과처럼 보이는 다른 서체' 카드가 나온다
const FONTS = ["templates/_shared/fonts/TAEBAEK.woff2"];
const fontsOk = FONTS.every((f) => existsSync(join(ROOT, f)));
check("번들 폰트(태백체)", fontsOk, fontsOk ? "" : FONTS.join(", "),
  "저장소에 포함돼 있어야 합니다 — 클론이 온전한지 확인하세요");

// A5. 계약 파일 — 이게 없으면 무엇을 만들지 알 수 없다
for (const f of ["data/review/builders.json", "data/review/sets.json", "data/review/pixel-baselines.json"]) {
  check(`명세 파일 — ${f.split("/").pop()}`, existsSync(join(ROOT, f)), "", "클론이 온전한지 확인하세요");
}

// A6. 데이터셋 — 카드의 재료. verified=true 인 것만 카드가 될 수 있다
let verifiedN = 0;
let datasetN = 0;
const dsDir = join(ROOT, "data/datasets");
if (existsSync(dsDir)) {
  for (const f of readdirSync(dsDir).filter((x) => x.endsWith(".json"))) {
    datasetN++;
    try {
      if (JSON.parse(readFileSync(join(dsDir, f), "utf8"))?.meta?.verified === true) verifiedN++;
    } catch { /* 깨진 파일은 아래 카운트에서 빠진다 */ }
  }
}
check("데이터셋 존재", datasetN > 0, `${datasetN}개 (검증됨 ${verifiedN}개)`,
  "data/datasets 가 비어 있습니다 — 수집기를 먼저 돌려야 합니다");

/* ── A7. 진짜 시험: 빌더 → 렌더 → md5 → 검수 ────────────────────
 * 여기까지 통과하면 이 환경은 카드를 만들 수 있다. 말이 아니라 산출물로 증명한다. */
const baselines = existsSync(join(ROOT, "data/review/pixel-baselines.json"))
  ? JSON.parse(readFileSync(join(ROOT, "data/review/pixel-baselines.json"), "utf8")).cards || []
  : [];
const targets = QUICK ? baselines.slice(0, 1) : baselines;

if (fail > 0) {
  console.log("\n  ⏭  위 항목이 막혀 있어 렌더 시험을 건너뜁니다 — 먼저 고쳐 주세요");
} else if (!targets.length) {
  soft("픽셀 기준값 없음", "pixel-baselines.json 에 카드가 없습니다");
} else {
  console.log(`\n  ── 실제 제작 시험 (${targets.length}장) ──`);
  const out = mkdtempSync(join(tmpdir(), "wirit-doctor-"));
  try {
    for (const c of targets) {
      // ① 빌더: 데이터 → 카드 JSON (data/content 는 gitignore라 새 클론엔 없다. 그래서 매번 만든다)
      const bspec = JSON.parse(readFileSync(join(ROOT, "data/review/builders.json"), "utf8"))
        .builders.find((b) => b.label === c.builder);
      if (!bspec) { soft(`빌더 없음 — ${c.label}`, "builders.json 에 미등록"); continue; }
      try {
        sh("node", [join(ROOT, bspec.cmd), ...(bspec.args || [])]);
        ok(`빌더 실행 — ${c.label}`, bspec.cmd);
      } catch (e) {
        bad(`빌더 실행 — ${c.label}`, String(e.stderr || e.message).split("\n")[0].slice(0, 120),
          "데이터셋·API 키를 확인하세요");
        continue;
      }

      // ② 렌더: 카드 JSON → PNG
      const cpath = join(ROOT, c.content);
      if (!existsSync(cpath)) { bad(`카드 JSON 생성 — ${c.label}`, c.content, "빌더가 만드는 경로가 바뀌었는지 확인"); continue; }
      const dest = join(out, c.label);
      try {
        sh("pnpm", ["-s", "--filter", "@wirit/renderer", "render", "--data", cpath, "--out", dest]);
      } catch (e) {
        bad(`렌더 — ${c.label}`, String(e.stderr || e.message).split("\n").filter(Boolean).pop()?.slice(0, 140),
          "Chromium·폰트 문제일 가능성이 큽니다");
        continue;
      }
      const png = join(dest, c.png);
      if (!existsSync(png)) { bad(`PNG 생성 — ${c.label}`, c.png); continue; }

      // ③ md5 대조 — 발행본·확정본은 픽셀이 변하면 안 된다
      const got = md5(png);
      check(`픽셀 동일 — ${c.label} (${c.state})`, got === c.md5,
        got === c.md5 ? got.slice(0, 12) : `기대 ${c.md5.slice(0, 12)} · 실제 ${got.slice(0, 12)}`,
        "공용 템플릿이 바뀌었을 수 있습니다 — docs/CARD_CHECKLIST.md §5 참고");
    }

    // ④ 자동 검수 — 좌표 실측이 도는가
    try {
      const cs = targets.map((c) => join(ROOT, c.content)).filter(existsSync);
      if (cs.length) {
        const r = sh("pnpm", ["-s", "--filter", "@wirit/renderer", "qa", ...cs]);
        const errN = (r.match(/error (\d+)건/) || [])[1] ?? "?";
        check("자동 디자인 검수(designQa) 동작", /검수 통과/.test(r), `error ${errN}건`,
          "검수가 실패했습니다 — 위 항목을 고치세요");
      }
    } catch (e) {
      bad("자동 디자인 검수(designQa) 동작",
        String(e.stdout || e.message).split("\n").filter((l) => /❌/.test(l))[0]?.slice(0, 140) || "실행 실패");
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

/* ═══════════════ B. 선택 — 데이터 수집 ═══════════════ */
console.log("\n[B. 선택 — 새 데이터 수집 (없어도 기존 데이터로 카드는 나옵니다)]");
const KEYS = [
  ["RONE_API_KEY", "한국부동산원 R-ONE — 전세·월세 지수/평균금액"],
  ["MOLIT_API_KEY", "국토부 실거래가"],
  ["DART_API_KEY", "DART 평균연봉"],
  ["ECOS_API_KEY", "한국은행 ECOS"],
  ["ANTHROPIC_API_KEY", "LLM 검수(없으면 코드 검수만 — 카드 제작엔 지장 없음)"],
];
let keyN = 0;
for (const [k, why] of KEYS) {
  if (process.env[k]) { keyN++; ok(`${k}`, why); }
  else soft(`${k} 없음`, why);
}
if (!keyN) console.log("     └ 키는 GitHub Secrets 또는 .env(gitignore)에 둡니다 — 저장소에 커밋 금지");

/* ═══════════════ C. 선택 — 배포·발행 ═══════════════ */
console.log("\n[C. 선택 — 관제탑 배포·발행 기록]");
let gitOk = false;
try { sh("git", ["rev-parse", "--is-inside-work-tree"]); gitOk = true; } catch { /* noop */ }
check("git 저장소", gitOk, gitOk ? sh("git", ["branch", "--show-current"]).trim() : "",
  "커밋·푸시가 안 되면 작업이 세션과 함께 사라집니다");
const remote = gitOk ? (() => { try { return sh("git", ["remote", "get-url", "origin"]).trim(); } catch { return ""; } })() : "";
check("원격 저장소 연결", !!remote, remote.replace(/https?:\/\/[^@]*@/, ""), "git remote add origin …");
if (!process.env.CLOUDFLARE_API_TOKEN) soft("CLOUDFLARE_API_TOKEN 없음", "관제탑 배포는 GitHub Actions 가 합니다 — 로컬엔 불필요");

/* ═══════════════ D. 워크플로 무결성 ═══════════════ */
/* 깨진 워크플로는 GitHub 에 등록조차 안 돼 실행 목록에 안 뜬다 — 빨간불도 없다.
   2026-08-03 에 kosis-probe.yml 이 이 결함으로 한 번도 안 돌았다. 그래서 상시 검사한다. */
console.log("\n[D. 자동화 워크플로]");
let wfOk = true, wfOut = "";
try {
  wfOut = sh("node", ["scripts/lint-workflows.mjs"]).trim();
} catch (e) {
  wfOk = false;
  wfOut = (e.stdout || e.message || "").toString().trim();
}
check("워크플로 YAML", wfOk, wfOk ? wfOut.replace(/^✅\s*/, "") : "깨진 워크플로가 있습니다",
  "node scripts/lint-workflows.mjs 로 어느 줄인지 확인하세요 — 깨진 워크플로는 조용히 안 돕니다");
if (!wfOk) console.log(wfOut.split("\n").map((l) => "     " + l).join("\n"));

/* 문서 정합 — 2026-08-30 신설, 2026-08-31 **경고 → 필수**로 승격.
   처음엔 성공하면 check(), 실패하면 soft() 로 짰다. 그러면 **깨졌을 때 필수 목록에서
   아예 사라지고** 「✅ 카드를 만들 수 있습니다」가 그대로 뜬다 — 필수 28항이 27항으로
   줄 뿐이고 아무도 그 숫자를 세지 않는다. 일부러 링크를 깨뜨려 확인했다.
   이 저장소 규칙은 "초록불은 일을 했다는 뜻이어야지 죽지 않고 끝났다는 뜻이면 안 된다"이다.
   ① 살아있는 문서가 없는 파일을 가리키면 세션이 지시를 따라갔다가 벽에 부딪힌다.
   ② 계정 스킬과 저장소본이 갈라지면, 계정 스킬을 읽고 시작한 세션이 **옛말을 배운다**.
      실제로 65줄 갈라진 채였고 그 세션이 오너에게 이미 있는 API 키를 물었다.
   둘 다 카드 제작은 막지 않으므로 경고로 둔다 — 다만 조용히 넘기지는 않는다. */
let linkOk = true, linkOut = "";
try { linkOut = sh("node", ["scripts/check-doc-links.mjs"]).trim(); }
catch (e) { linkOk = false; linkOut = (e.stdout || e.message || "").toString().trim(); }
check("문서 링크", linkOk, linkOk ? "깨진 링크 없음" : "살아있는 문서가 없는 파일을 가리킵니다",
  "node scripts/check-doc-links.mjs — 옮긴 문서라면 새 주소로, 없앤 문서라면 링크를 지웁니다");

/* 고아 스크립트 — 2026-08-30 신설. 132개 중 18개(2,006줄)가 아무도 안 부르는 상태였다.
   원인은 '빌더는 쓰고 builders.json 등록은 잊는다'로 모인다. 등록을 안 하면 실사이트에도
   안 뜨고 아무도 다시 안 본다 — 「대장 도감」 25편 시리즈가 그렇게 1화에서 멈춰 있었다.
   고아 자체는 죄가 아니고, 고아인 줄 모르는 게 문제라 **세기만** 한다. */
let orphOut = "", orphOk = true;
try { orphOut = sh("node", ["scripts/check-orphan-scripts.mjs", "--strict"]).trim(); }
catch (e) { orphOk = false; orphOut = (e.stdout || e.message || "").toString().trim(); }
{
  const n = (orphOut.match(/안 부르는 스크립트 (\d+)개/) || [, "?"])[1];
  check("고아 스크립트", orphOk, orphOk ? "모두 어딘가에서 불립니다" : `아무도 안 부르는 스크립트 ${n}개`,
    "node scripts/check-orphan-scripts.mjs — 살릴 것은 builders.json 에 등록, 끝난 것은 삭제");
}

/* STATUS 부피 — 2026-08-08 에 비웠는데 3주 만에 578줄이 다시 쌓였다.
   문서가 자기 규칙("여기엔 지금 상태만 둔다")을 어기는데 아무도 재지 않았다. */
/* ⚠️ 판정은 **종료코드**로 한다. 출력에 "✅ 가 있으면 통과"로 읽었더니, 넘친 블록 목록에
   딸려 나온 제목의 ✅ 를 성공으로 오인해 **초록불이 났다**(2026-08-31 시험에서 잡음). */
/* 문서가 없는 예약을 가르치는가 — 배관을 바꿀 때 설명을 같이 안 고치면 생긴다.
   2026-08-31 에 예약을 16→4개로 줄였는데 문서 12곳이 옛 시각을 가르치고 있었다. */
let schedOk = true;
try { sh("node", ["scripts/check-schedule-docs.mjs"]); }
catch { schedOk = false; }
check("문서 ↔ 배관 정합", schedOk,
  schedOk ? "문서가 없는 예약을 가르치지 않습니다" : "문서가 없는 예약을 가르치고 있습니다",
  "node scripts/check-schedule-docs.mjs — 배관을 바꿨으면 설명도 같이 바꿉니다");

let stOk = true;
try { sh("node", ["scripts/prune-status.mjs"]); }
catch { stOk = false; }
{
  check("STATUS 부피", stOk, stOk ? "'지금 상태'로 유지되고 있습니다" : "다시 서사 창고가 되고 있습니다",
    "node scripts/prune-status.mjs — 굳은 규칙을 정본으로 승격한 뒤 서사를 archive 로");
}

/* 소재 보드 — 고르는 속도보다 빨리 쌓이는가.
   ⚠️ **경고로 둔다.** 무엇을 지울지는 오너 판단이고, 세션이 스스로 못 고친다.
      필수로 막으면 소재가 많다는 이유로 카드를 못 만들게 된다 — 말이 안 된다. */
try { sh("node", ["scripts/ideas-health.mjs", "--strict"]); }
catch { soft("소재가 고르는 속도보다 빨리 쌓이고 있습니다",
  "node scripts/ideas-health.mjs — 지우기 전에 먼저 보이게 만듭니다"); }

/* 이번 달 회고를 했나 — 2026-08-31 신설.
   기록은 쌓기만 하면 일기다. 실제로 자동 수집의 증시 편식(278건 중 131건)을
   6주간 아무도 안 셌다. **경고로 둔다** — 회고는 판단이라 세션이 대신 못 하고,
   카드 제작과도 무관하다. */
{
  const ym = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 7);
  const f = join(ROOT, `data/review-${ym}.md`);
  if (!existsSync(f)) {
    soft(`이번 달(${ym}) 회고를 아직 안 했습니다`,
      "node scripts/monthly-review.mjs --write — 쌓인 판단을 되읽습니다");
  } else check("월간 회고", true, `${ym} 작성됨`);
}

let skillOut = "";try { skillOut = sh("node", ["scripts/check-skill-sync.mjs"]).trim(); }
catch (e) { skillOut = (e.stdout || e.message || "").toString().trim(); }
if (skillOut.startsWith("✅")) check("스킬 동기", true, skillOut.replace(/^✅\s*/, ""));
else if (skillOut.startsWith("⏭")) { /* 계정 스킬이 없는 환경(Actions 러너) — 잴 수 없다 */ }
/* ⚠️ 이것만 경고로 둔다. 나머지 셋(링크·고아·STATUS)은 **세션이 스스로 고칠 수 있어서**
   필수다 — 고치라고 막는 것이 말이 된다. 스킬 갈라짐은 **오너만 고칠 수 있고**
   (계정 파일이라 저장소가 못 건드린다) 카드 제작 능력과도 무관하다.
   필수로 두면 오너가 교체할 때까지 모든 세션이 "카드 만들지 마라"를 듣는다 —
   그러면 그 말이 무뎌져서 진짜 막아야 할 때 안 읽힌다. */
else soft("계정 스킬이 저장소본과 갈라졌습니다 — 오너가 교체해야 합니다",
  "node scripts/check-skill-sync.mjs · 교체본은 docs/WIRIT_CARDS_SKILL.md");

/* 푸시 길 — 막혀 있으면 **작업 전에** 안다. 2026-08-06 에 카드 하나를 네 번 고쳐 확정까지
   끝낸 뒤에야 알았고, 커밋 6건이 컨테이너 안에만 남았다. 컨테이너는 세션이 끝나면 회수된다.
   카드 제작 자체는 막지 않으므로 **경고**로 둔다 — 다만 조용히 넘기지는 않는다.
   워크플로 27개 중 19개가 푸시를 방아쇠로 쓴다(관제탑 배포·수집 대기열·발행 보관). */
let pushOk = true, pushOut = "";
try {
  pushOut = sh("node", ["scripts/check-push.mjs"]).trim();
} catch (e) {
  pushOk = false;
  pushOut = (e.stdout || e.message || "").toString().trim();
}
/* ⚠️ **"토큰 미지정"과 "차단"은 다르다** (2026-08-12).
   doctor 를 그냥 돌리면 `WIRIT_GH_PAT` 이 없어 "Username 을 못 읽는다"로 실패하는데,
   이걸 "푸시가 막혔다"고 찍으면 새 세션이 있지도 않은 차단을 상대로 패닉한다.
   실제로 08-06~08-11 내내 "막혔다"고 보고돼 온 것 중 일부가 이 혼동이었다. */
const noTok = /could not read Username|terminal prompts disabled/i.test(pushOut);
if (pushOk) ok("푸시 길", pushOut.split("\n")[0].replace(/^✅\s*/, ""));
else if (noTok) {
  soft("푸시 길 — 아직 확인 못 함(토큰 미지정)", "**차단이 아닙니다.** 토큰을 주고 다시 보세요");
  console.log("     WIRIT_GH_PAT='<프로젝트 문서의 github_pat_...>' node scripts/check-push.mjs");
  console.log("     (프로젝트 「위릿노트」 → `[Fine-grained tokens].txt`)");
} else {
  soft("푸시가 막혀 있습니다", "작업분이 컨테이너에 갇힙니다 — 오너에게 **지금** 알리세요");
  console.log(pushOut.split("\n").map((l) => "     " + l).join("\n"));
}

/* ═══════════════ 판정 ═══════════════ */
console.log("\n" + "─".repeat(58));
if (!fail) {
  console.log("✅ 이 환경은 카드를 만들 수 있습니다.");
  console.log(`   필수 ${pass}항 통과 · 선택 경고 ${warn}건`);
  console.log("\n   다음: CLAUDE.md 를 읽고 시작하세요.");
  console.log("   카드 작업 전에는 docs/CARD_CHECKLIST.md §2 를 훑습니다.");
} else {
  console.log("❌ 이 환경에서는 카드를 만들 수 없습니다 — 아래를 먼저 고쳐야 합니다.\n");
  blockers.forEach((b, i) => console.log(`   ${i + 1}. ${b.name}${b.fix ? `\n      → ${b.fix}` : ""}`));
  console.log("\n   ⚠️ 이 상태로 카드를 만들면 렌더·검수가 안 돌아, 오보 0 규칙이 깨집니다.");
  console.log("      문서 작업(기준·기획·캡션)은 가능하지만, 카드 픽셀은 건드리지 마세요.");
}
console.log("─".repeat(58));
process.exit(fail ? 1 : 0);
