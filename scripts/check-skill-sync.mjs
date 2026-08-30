#!/usr/bin/env node
/**
 * 스킬 동기화 검사 — 계정 스킬과 저장소본이 갈라졌는지 본다.
 *
 * 왜 이 검사가 필요한가 (2026-08-30):
 *   `docs/WIRIT_CARDS_SKILL.md`(저장소본)와 계정 스킬은 **같은 문서의 원본과 배포본**이다.
 *   저장소본은 세션이 git 으로 고칠 수 있지만, 계정 스킬은 오너만 바꿀 수 있다.
 *   그래서 세션이 저장소본만 고치고 끝내면 **배포본은 옛말을 계속 가르친다.**
 *
 *   실제로 그렇게 됐다 — 2026-08-30 에 둘이 **65줄** 갈라져 있는 것을 발견했다.
 *   저장소본에만 있던 API 연결표·KOSIS 표 찾는 법·검사 7종 순서를 계정 스킬은 모르고 있었고,
 *   그 계정 스킬을 읽고 시작한 세션은 오너에게 "KOSIS 키를 주세요"라고 물었다.
 *
 * 왜 문지기(guard)가 아니라 세션이 도는가:
 *   계정 스킬은 **세션 컨테이너 안에만** 존재한다(`/mnt/skills/user/…`).
 *   GitHub Actions 러너에는 없다. 그래서 이 검사는 세션만 할 수 있다.
 *   → `doctor.mjs` 가 부르고, 계정 스킬이 안 보이면 조용히 건너뛴다.
 *
 * 쓰는 법: node scripts/check-skill-sync.mjs
 *   갈라져 있으면 종료코드 1 + 무엇이 다른지 줄 단위로 보여준다.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_COPY = join(ROOT, "docs/WIRIT_CARDS_SKILL.md");

/** 계정 스킬이 있을 만한 자리 — 창구마다 경로가 다르다 */
const ACCOUNT_PATHS = [
  "/mnt/skills/user/wirit-cards/SKILL.md",
  "/mnt/skills/public/wirit-cards/SKILL.md",
];

const norm = (t) => t.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();

if (!existsSync(REPO_COPY)) {
  console.log("⏭  저장소본(docs/WIRIT_CARDS_SKILL.md)이 없습니다 — 검사 건너뜀");
  process.exit(0);
}

const account = ACCOUNT_PATHS.find((p) => existsSync(p));
if (!account) {
  console.log("⏭  이 환경에는 계정 스킬이 없습니다 — 검사 건너뜀(Actions 러너 등에서는 정상)");
  process.exit(0);
}

const a = norm(readFileSync(account, "utf8")).split("\n");
const b = norm(readFileSync(REPO_COPY, "utf8")).split("\n");

if (a.join("\n") === b.join("\n")) {
  console.log(`✅ 스킬 동기 — 계정본과 저장소본이 같습니다 (${b.length}줄)`);
  process.exit(0);
}

/* 어느 쪽에만 있는 줄인지 보여준다. 빈 줄·표 구분선은 잡음이라 뺀다. */
const noise = (l) => !l.trim() || /^[|\-: ]+$/.test(l.trim());
const setA = new Set(a.filter((l) => !noise(l)));
const setB = new Set(b.filter((l) => !noise(l)));
const onlyRepo = [...setB].filter((l) => !setA.has(l));
const onlyAcct = [...setA].filter((l) => !setB.has(l));

console.log(`\n❌ 스킬이 갈라져 있습니다 — 계정본 ${a.length}줄 / 저장소본 ${b.length}줄`);
console.log(`   계정 스킬 자리: ${account}\n`);

const show = (title, arr) => {
  if (!arr.length) return;
  console.log(`  ▸ ${title} (${arr.length}줄)`);
  for (const l of arr.slice(0, 12)) console.log(`      ${l.slice(0, 100)}`);
  if (arr.length > 12) console.log(`      … 외 ${arr.length - 12}줄`);
  console.log("");
};
show("저장소본에만 있음 — 계정 스킬이 이걸 모른다", onlyRepo);
show("계정본에만 있음 — 저장소가 이걸 잃어버렸다", onlyAcct);

console.log("  고치는 법:");
console.log("   · 저장소본이 최신이면 → 오너가 계정 스킬을 docs/WIRIT_CARDS_SKILL.md 내용으로 교체");
console.log("   · 계정본이 최신이면  → 세션이 저장소본에 반영하고 커밋\n");
process.exit(1);
