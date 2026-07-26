/**
 * 관제탑 배포용 사이트 조립기.
 *
 * 저장소 산출물 → `packages/tower-worker/_site/` 한 폴더로 모은다.
 *   /            관제탑 본체 (packages/dashboard/index.html)
 *   /ideas.html  소재 보드 (scripts/build-idea-board.mjs)
 *
 * ⚠️ 썸네일 주의: 카드 PNG(data/out)와 콘텐츠 JSON(data/content)은 저장소에 없다(gitignore).
 *    CI는 이 스크립트를 부르기 **전에** 빌더+렌더러를 돌려 둘을 되살린다.
 *    그래야 관제탑에 카드 썸네일이 들어간다. 로컬에서 그냥 돌리면 썸네일만 빠진 채로 조립된다.
 *
 * 실행: node scripts/build-tower-site.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, copyFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "packages/tower-worker/_site");

const run = (cmd, args) => {
  console.log(`▶ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
};

rmSync(SITE, { recursive: true, force: true });
mkdirSync(SITE, { recursive: true });

// 1) 관제탑 본체 — 저장소 산출물을 집계해 index.html 생성
run("pnpm", ["--filter", "@wirit/dashboard-static", "all"]);
const tower = join(ROOT, "packages/dashboard/index.html");
if (!existsSync(tower)) throw new Error("관제탑 index.html 생성 실패 — dashboard-static 확인");
copyFileSync(tower, join(SITE, "index.html"));

// 2) 소재 보드
run("node", ["scripts/build-idea-board.mjs", join(SITE, "ideas.html")]);

const kb = (p) => Math.round(statSync(p).size / 1024);
console.log(`\n✅ _site 조립 완료`);
console.log(`   index.html  ${kb(join(SITE, "index.html"))}KB`);
console.log(`   ideas.html  ${kb(join(SITE, "ideas.html"))}KB`);
