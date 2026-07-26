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
import { mkdirSync, rmSync, copyFileSync, writeFileSync, existsSync, statSync } from "node:fs";
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

// 2) 소재 보드는 관제탑 '💡 소재' 탭으로 흡수됐다(2026-07-26).
//    기존 북마크(/ideas.html)가 죽지 않도록 리다이렉트 페이지만 남긴다.
writeFileSync(
  join(SITE, "ideas.html"),
  `<!doctype html><meta charset="utf-8"><title>소재 보드 → 관제탑</title>
<meta http-equiv="refresh" content="0; url=/#ideas">
<p style="font-family:system-ui;padding:24px">소재 보드는 관제탑 <b>💡 소재</b> 탭으로 통합됐습니다.
<a href="/#ideas">관제탑으로 이동</a></p>`,
);

const kb = (p) => Math.round(statSync(p).size / 1024);
console.log(`\n✅ _site 조립 완료`);
console.log(`   index.html  ${kb(join(SITE, "index.html"))}KB`);
console.log(`   ideas.html  ${kb(join(SITE, "ideas.html"))}KB`);
