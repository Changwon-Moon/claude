#!/usr/bin/env node
/**
 * 🚪 세션 마감 점검 — 닫기 전에 빠진 것을 **재서** 알려준다
 *
 * 세션이 끝나면 컨테이너가 사라진다. 커밋하지 않은 것은 없던 일이 되고,
 * 원천에 안 적은 배움은 다음 세션이 같은 지적을 또 받는다(= 문서화 실패).
 *
 * 그런데 마감 절차는 **순서가 늘 같고 판단이 없다** — 그건 사람이 외울 일이 아니다.
 * 이 스크립트가 기계적인 부분을 대신 밟고, **판단이 필요한 것만 사람에게 남긴다.**
 *
 * ── 무엇을 하나
 *   ① 내보내기 전 검사를 순서대로 — **tower-deploy.yml 과 같은 순서**로, 서명은 맨 뒤
 *   ② 학습이 **원천에 적혔는지** 확인 (STATUS · CEO · teams · 체크리스트 · 결정로그)
 *   ③ 커밋 안 된 것 · 안 밀린 것 세기
 *   ④ 푸시 명령을 찍어 준다 (토큰이 필요해 이 스크립트가 쥐지 않는다)
 *
 * ── 무엇을 하지 않나
 *   **판단하지 않는다.** "무엇을 배웠나 · 어느 팀 문서인가 · 반복된 지적인가"는
 *   사람(세션)이 정한다. 이 스크립트는 **빈칸을 가리킬 뿐** 채우지 않는다.
 *   푸시도 하지 않는다 — 토큰은 프로젝트 문서에 있고 명령에만 실린다.
 *
 * 실행: node scripts/close-session.mjs [--skip-checks]
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const SKIP = process.argv.includes("--skip-checks");
const sh = (c) => execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const tryShell = (c) => { try { return { ok: true, out: execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: "/bin/bash" }).trim() }; } catch (e) { return { ok: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}` }; } };

const today = new Date().toISOString().slice(0, 10);           // UTC 기준
const kst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const DATES = [...new Set([today, kst])];                        // 자정 근처를 흘리지 않는다

const bad = [];   // 닫으면 안 되는 것
const warn = [];  // 이유를 대면 넘길 수 있는 것
const ok = [];

console.log("🚪 세션 마감 점검\n");

/* ─────────────────────────────────────────────────────────────
   ① 내보내기 전 검사 — **순서가 곧 규칙이다**

   ⚠️ 서명은 **맨 마지막**이다 (2026-08-16d 실측으로 고침)
   체크리스트 §0 은 `rebuild-cards` → `apply-signature` 순서만 못박고 있었다.
   그런데 **`doctor.mjs` 도 카드를 다시 만든다** — 진단이 말로 확인하지 않고 실제로
   찍어 보기 때문이다. 그래서 §0 순서대로 밟으면 서명을 붙인 뒤 doctor 가 다시 날린다.
   실측: `tohuh-rent-map` · `wolse-flip` 두 캡션이 매번 서명을 잃었다.
   → **생성하는 것들을 먼저 다 돌리고, 서명을 마지막에 붙이고, `--check` 로 증명한다.**

   ⚠️ 관제탑 순서는 **`tower-deploy.yml` 과 같아야 한다** (2026-08-16d 실측으로 고침)
   여기서 스모크가 통과해도 배포에서 깨지면 소용이 없다. 그래서 배포 워크플로가 밟는
   순서를 그대로 밟는다. 특히 두 가지를 빠뜨리면 **스모크가 172/174 로 떨어지는데,
   코드 문제가 아니라 생성물이 없는 것**이다:
     · `data/out/` 은 gitignore 라 갓 clone 한 환경엔 없다 → 렌더를 먼저 돌린다
     · 썸네일·원본은 `stage-public-cards` 가 깐다 →
       **`build-tower-site` 가 `_site` 를 통째로 지우므로 반드시 그 뒤에** 온다
   ───────────────────────────────────────────────────────────── */
const RENDER_ALL = `set +e; shopt -s nullglob
for f in data/content/*/*.json; do
  d="$(basename "$(dirname "$f")")"
  pnpm --filter @wirit/renderer render -- --data "$PWD/$f" --out "$PWD/data/out/$d" >/dev/null 2>&1
done
exit 0`;

const CHECKS = [
  ["전 카드 재생성 + 자동 검수", "node scripts/rebuild-cards.mjs"],
  ["카드 렌더 (PNG · 썸네일 원천)", RENDER_ALL],
  ["보관함 색인", "node scripts/build-archive.mjs"],
  ["관제탑 화면 조립", "node scripts/build-tower-site.mjs"],
  ["내려받기·완성본 깔기 (조립 뒤여야 한다)", "node scripts/stage-public-cards.mjs"],
  ["관제탑 스모크", "node scripts/smoke-tower.mjs packages/tower-worker/_site/index.html"],
  ["전 버튼 시뮬레이션", "node scripts/sim-tower.mjs packages/tower-worker/_site/index.html"],
  ["머리 규격 전수", "pnpm --filter @wirit/renderer audit-head"],
  ["발행본 픽셀 회귀 · 자가진단", "node scripts/doctor.mjs"],
  ["캡션 고정 서명 반영 (반드시 맨 뒤)", "node scripts/apply-signature.mjs"],
  ["서명이 제자리인지 증명", "node scripts/apply-signature.mjs --check"],
];

if (SKIP) {
  warn.push("검사를 건너뛰었다(--skip-checks). 픽셀을 건드렸다면 반드시 돌린다");
} else {
  console.log("── ① 내보내기 전 검사 (서명은 맨 뒤 — doctor 가 다시 날린다)\n");
  for (const [name, cmd] of CHECKS) {
    process.stdout.write(`   ${name} … `);
    const r = tryShell(cmd);
    if (r.ok) { console.log("✅"); ok.push(name); }
    else {
      console.log("❌");
      const tail = r.out.split("\n").filter(Boolean).slice(-4).join("\n      ");
      bad.push(`${name} 실패 — \`${cmd}\`\n      ${tail}`);
    }
  }
  console.log("");
}

/* ─────────────────────────────────────────────────────────────
   ② 배움이 원천에 적혔나 — 같은 지적을 두 번 받으면 문서화 실패다
   여기서 "적혔다"의 기준은 **오늘 날짜가 그 파일에 있다**로 잡는다.
   느슨하지만, 없으면 확실히 안 적은 것이다(빈칸을 가리키는 것이 목적).
   ───────────────────────────────────────────────────────────── */
console.log("── ② 배움이 원천에 적혔나\n");

const hasToday = (p) => existsSync(p) && DATES.some((d) => readFileSync(p, "utf8").includes(d));
const mark = (cond, label, why) => {
  console.log(`   ${cond ? "✅" : "⬜"} ${label}`);
  if (!cond) warn.push(`${label} — ${why}`);
};

mark(hasToday("STATUS.md"), "STATUS.md 에 오늘 항목", "지금 상태·막힌 것·다음 할 일을 적는다");
mark(hasToday("company/CEO.md"), "company/CEO.md 에 오늘 항목",
  "오너의 **판단 원칙**이 새로 나왔으면 적는다. 없었으면 넘겨도 된다");

const teams = existsSync("company/teams") ? readdirSync("company/teams").filter((f) => f.endsWith(".md")) : [];
const touched = teams.filter((f) => hasToday(`company/teams/${f}`));
console.log(`   ${touched.length ? "✅" : "⬜"} company/teams — 오늘 적은 팀: ${touched.join(", ") || "없음"}`);
if (!touched.length) warn.push("company/teams/*.md 에 오늘 학습 로그가 없다 — 일하는 방식이 바뀌었으면 적는다");

mark(hasToday("docs/CARD_CHECKLIST.md"), "docs/CARD_CHECKLIST.md 에 오늘 항목",
  "**두 번 받은 지적**이 있었으면 §2 에 항목을 넣는다");
mark(hasToday("research/DECISION_LOG.md"), "research/DECISION_LOG.md 에 오늘 항목",
  "소재·게시물 단위 결정이 있었으면 적는다");
console.log("");

/* ─────────────────────────────────────────────────────────────
   ③ 컨테이너 안에만 있는 것 — 세션과 함께 사라진다
   ───────────────────────────────────────────────────────────── */
console.log("── ③ 컨테이너 안에만 있는 것\n");

const dirty = tryShell("git status --porcelain").out.split("\n").filter(Boolean);
console.log(`   ${dirty.length ? "⚠️ " : "✅"} 커밋 안 된 파일 ${dirty.length}개`);
if (dirty.length) {
  for (const l of dirty.slice(0, 12)) console.log(`      ${l}`);
  if (dirty.length > 12) console.log(`      … 외 ${dirty.length - 12}개`);
  bad.push(`커밋 안 된 파일 ${dirty.length}개 — 컨테이너 안에만 있는 커밋은 없는 것과 같다`);
}

const br = tryShell("git rev-parse --abbrev-ref HEAD").out;
const ahead = tryShell(`git rev-list --count origin/${br}..HEAD`);
const n = Number(ahead.out) || 0;
console.log(`   ${n ? "⚠️ " : "✅"} 안 밀린 커밋 ${ahead.ok ? n : "?"}개  (브랜치 ${br})`);
if (n) {
  for (const l of tryShell(`git log --oneline origin/${br}..HEAD`).out.split("\n").filter(Boolean)) {
    console.log(`      ${l}`);
  }
}
console.log("");

/* ─────────────────────────────────────────────────────────────
   판정
   ───────────────────────────────────────────────────────────── */
console.log("─".repeat(74));
if (bad.length) {
  console.log(`\n❌ 아직 닫으면 안 됩니다 — ${bad.length}건\n`);
  for (const b of bad) console.log(`   · ${b}`);
} else {
  console.log("\n✅ 기계 점검 통과 — 남은 것은 사람이 판단할 것뿐입니다\n");
}
if (warn.length) {
  console.log(`\n⬜ 확인이 필요한 것 — ${warn.length}건 (이유를 대면 넘길 수 있다)\n`);
  for (const w of warn) console.log(`   · ${w}`);
}

/* ── 푸시 — 토큰이 필요해 스크립트가 쥐지 않는다 ── */
console.log(`
─${"─".repeat(73)}

📤 푸시 (토큰은 클로드 프로젝트 「위릿노트」의 \`[Fine-grained tokens].txt\`)

   TOK='<github_pat_...>'
   AUTH=$(printf 'x-access-token:%s' "$TOK" | base64 -w0)
   BR=${br}
   git -c http.proxy= -c https.proxy= -c http.extraheader="Authorization: Basic $AUTH" \\
     fetch https://github.com/Changwon-Moon/claude.git "$BR:refs/remotes/origin/$BR"
   git rebase "origin/$BR"
   git -c http.proxy= -c https.proxy= -c http.extraheader="Authorization: Basic $AUTH" \\
     push https://github.com/Changwon-Moon/claude.git "HEAD:refs/heads/$BR"

   ⚠️ 프록시 우회 옵션(-c http.proxy= -c https.proxy=)을 fetch 에도 붙인다.
      빠뜨리면 원격 추적 ref 가 안 갱신돼 non-fast-forward 로 헛짚는다.

🗼 관제탑 — **조립과 배포는 다르다**
   여기서 한 것은 조립(_site)까지다. Cloudflare 로 올리는 건 tower-deploy.yml 이
   한다(토큰이 GitHub Secrets 에 있다). **푸시해야 올라간다.**
   올라갔는지는 Actions 실행 기록으로 확인한다 — 추측해서 보고하지 않는다.

📓 마지막 — 클로드 프로젝트에 인수인계 문서를 남긴다
   project_write → claude/위릿-인수인계-${kst}.md
   (한 줄 요약 · 이번에 한 일 · 막힌 것과 그 이유 · 다음 세션이 할 일 · 최종 커밋 sha)
`);

process.exit(bad.length ? 1 : 0);
