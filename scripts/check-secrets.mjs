/**
 * 시크릿 이름 점검 — 워크플로가 요구하는 이름과 코드가 읽는 이름을 대조한다.
 *
 * ── 왜 이 파일인가 (2026-07-31, 코워크에서 시크릿 대조 중 발견)
 * 카카오 알림이 **조용히** 안 가고 있었다. 등록된 이름은 `KAKAO_REST_KEY` 인데
 * 코드가 읽는 이름은 `KAKAO_REST_API_KEY` — `API` 세 글자 차이였다.
 * 이런 어긋남은 에러를 내지 않는다. 스크립트가 "키가 없으니 건너뜁니다" 하고
 * 정상 종료하기 때문에, **켜 둔 줄 알았는데 안 켜져 있는 상태**가 오래 간다.
 *
 * GitHub Secrets 의 값은 물론이고 **등록된 이름조차** 저장소에서는 읽을 수 없다
 * (Actions 러너 안에서만 주입된다 — 그게 "키를 커밋하지 않는다"의 실현 방식이다).
 * 그래서 이 스크립트는 "정답 목록"을 저장소에서 뽑아 보여 주는 데까지만 한다.
 * 오너가 GitHub Secrets 화면과 눈으로 대조하면 어긋남이 드러난다.
 *
 * 손으로 적은 표는 반드시 코드와 어긋나므로(그게 이 사건의 교훈이다)
 * 목록은 항상 워크플로·소스에서 **그때그때 다시 뽑는다.**
 *
 * 실행: node scripts/check-secrets.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WF_DIR = join(ROOT, ".github/workflows");

/** 디렉터리를 훑어 조건에 맞는 파일 경로를 모은다 */
function walk(dir, ok, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "dist") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ok, out);
    else if (ok(p)) out.push(p);
  }
  return out;
}

// ── 1) 워크플로가 요구하는 이름: secrets.NAME
const wfFiles = walk(WF_DIR, (p) => p.endsWith(".yml") || p.endsWith(".yaml"));
const required = new Map(); // NAME -> Set(워크플로 파일명)
for (const f of wfFiles) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/secrets\.([A-Z0-9_]+)/g)) {
    if (!required.has(m[1])) required.set(m[1], new Set());
    required.get(m[1]).add(f.split("/").pop());
  }
}

// ── 2) 코드가 읽는 이름: process.env.NAME
const srcFiles = [
  ...walk(join(ROOT, "scripts"), (p) => p.endsWith(".mjs") || p.endsWith(".js")),
  ...walk(join(ROOT, "packages"), (p) => p.endsWith(".ts") || p.endsWith(".mjs")),
];
const read = new Map(); // NAME -> Set(경로)
for (const f of srcFiles) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
    const n = m[1];
    if (!/KEY|TOKEN|SECRET|PASSWORD|_ID$/.test(n)) continue; // 비밀로 보이는 것만
    if (!read.has(n)) read.set(n, new Set());
    read.get(n).add(relative(ROOT, f));
  }
}

const all = [...new Set([...required.keys(), ...read.keys()])].sort();

console.log("🔑 시크릿 이름 점검 — GitHub Secrets 화면과 대조하세요\n");
console.log("   Settings → Secrets and variables → Actions → Repository secrets\n");
console.log("   ⚠️ 이름이 한 글자라도 다르면 에러 없이 조용히 건너뜁니다.");
console.log("      (2026-07-31: KAKAO_REST_KEY ↔ KAKAO_REST_API_KEY 로 알림이 안 가고 있었다)\n");
console.log("─".repeat(74));
console.log("이름".padEnd(24) + "쓰는 곳");
console.log("─".repeat(74));

for (const n of all) {
  const wf = required.get(n);
  const src = read.get(n);
  const where = wf ? [...wf].join(", ") : "(워크플로에서는 안 씀)";
  console.log(n.padEnd(24) + where);
  // 코드가 process.env 로 직접 읽지 않는다고 해서 곧바로 오타는 아니다 —
  // wrangler 같은 외부 CLI 가 환경변수를 직접 집어가는 경우가 있다.
  // 그래서 "확인해 보라"까지만 말한다. 오탐을 단정으로 말하면 점검기를 안 믿게 된다.
  if (!src) console.log("".padEnd(24) + "   ↳ ℹ️ 코드가 직접 읽지는 않음 — 외부 CLI(wrangler 등)가 쓰거나 아직 미사용");
  if (!wf) console.log("".padEnd(24) + "   ↳ ℹ️ 코드만 읽음(로컬 .env 용): " + [...src].join(", "));
}

console.log("─".repeat(74));
console.log(`\n총 ${all.length}개. 워크플로 요구 ${required.size}개 · 코드 참조 ${read.size}개\n`);
console.log("등록 안 해도 되는 것:");
console.log("  · IG_ACCESS_TOKEN · IG_USER_ID — 자동 발행 폐지(2026-07-27)로 불필요");
console.log("  · REB_API_KEY — RONE_API_KEY 와 둘 중 하나만 있으면 된다(reb-collect.yml 이 방어)");
console.log("  · CLOUDFLARE_ACCOUNT_ID — wrangler 가 직접 집어간다(우리 코드가 안 읽는 게 정상)");
console.log("  · DATA_GO_KR_API_KEY — collect.yml 이 넘기지만 수집기가 아직 안 쓴다(예약분)\n");
