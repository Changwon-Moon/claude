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
import { mkdirSync, rmSync, copyFileSync, writeFileSync, existsSync, statSync, cpSync, readdirSync } from "node:fs";
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

// 1-a) 목록 썸네일 — HTML 에 base64 로 박지 않고 별도 파일로 나른다(2026-08-12).
//      박아 넣던 시절 62장이 1.3MB 였고, 그 탓에 화면이 2MB 를 넘어 verify-live 의
//      「화면 무게 적정」이 2주간 빨간불이었다. 카드가 늘수록 나빠지는 구조였다.
//      파일로 두면 브라우저가 보이는 것만(loading="lazy") 받고 다음부터는 캐시한다.
//      결재 캐러셀 큰 판본이 `download/` 를 참조하는 것과 같은 원리다.
const thumbsSrc = join(ROOT, "packages/dashboard/thumbs");
if (existsSync(thumbsSrc)) {
  cpSync(thumbsSrc, join(SITE, "thumbs"), { recursive: true });
  console.log(`   썸네일 ${readdirSync(join(SITE, "thumbs")).length}장 → _site/thumbs/`);
}

// ⚠️ 판번호는 **페이지 자체에도** 박는다. version.txt 만 보면, 엣지에서
// version.txt 는 새 판인데 index.html 은 옛 판을 주는 시차에 속는다
// (2026-07-27 run 실패 — 같은 배포에서 스모크는 통과했는데 실사이트만 옛 화면).
import("node:fs").then(({ appendFileSync }) =>
  appendFileSync(join(SITE, "index.html"), "\n<!--build:" + (process.env.GITHUB_SHA || "dev") + "-->\n")
);

// 배포 확인용 판번호 — 어느 커밋의 화면인지.
// 왜: Cloudflare 게시 후 전 세계 전파가 몇 초~수십 초 걸린다. "12초 대기"처럼
// 시간을 어림잡으면 옛 화면을 검사하고 실패한다(2026-07-26 run #실패).
// verify-live 는 이 파일이 기대한 커밋과 같아질 때까지 기다렸다가 검사한다.
writeFileSync(join(SITE, "version.txt"), (process.env.GITHUB_SHA || "dev") + "\n", "utf8");

// 1-b) 본문 폰트 — 카드와 같은 Pretendard를 쓰되 HTML에 박아 넣지 않는다.
//      Variable 폰트가 2MB라 임베드하면 관제탑이 다시 무거워진다.
//      같은 출처의 별도 파일로 두면 브라우저가 한 번만 받아 캐시한다.
const font = join(ROOT, "templates/_shared/fonts/PretendardVariable.woff2");
if (existsSync(font)) {
  mkdirSync(join(SITE, "fonts"), { recursive: true });
  copyFileSync(font, join(SITE, "fonts/PretendardVariable.woff2"));
  // 로컬에서 packages/dashboard/index.html 를 직접 열 때도 같은 상대경로가 맞도록
  mkdirSync(join(ROOT, "packages/dashboard/fonts"), { recursive: true });
  copyFileSync(font, join(ROOT, "packages/dashboard/fonts/PretendardVariable.woff2"));
}

// 2) 소재 보드는 관제탑 '💡 소재' 탭으로 흡수됐다(2026-07-26).
//    기존 북마크(/ideas.html)가 죽지 않도록 리다이렉트 페이지만 남긴다.
writeFileSync(
  join(SITE, "ideas.html"),
  `<!doctype html><meta charset="utf-8"><title>소재 보드 → 관제탑</title>
<meta http-equiv="refresh" content="0; url=/#ideas">
<p style="font-family:system-ui;padding:24px">소재 보드는 관제탑 <b>💡 소재</b> 탭으로 통합됐습니다.
<a href="/#ideas">관제탑으로 이동</a></p>`,
);

// 3) 세션 보드 — 지금 어느 코워크 세션이 무엇을 하고 있나.
//    관제탑 본체(dashboard-static)는 스모크 130항이 걸린 큰 앱이라 건드리지 않는다.
//    탭 하나 넣자고 그걸 흔들면 "공용 자산 건드려 깨뜨리는" 사고를 내가 반복한다.
//    별도 페이지로 붙이고 링크만 건다. 자리 잡으면 그때 흡수해도 늦지 않다.
run("node", ["scripts/build-session-board.mjs"]);

const kb = (p) => Math.round(statSync(p).size / 1024);
console.log(`\n✅ _site 조립 완료`);
console.log(`   index.html  ${kb(join(SITE, "index.html"))}KB`);
console.log(`   ideas.html  ${kb(join(SITE, "ideas.html"))}KB`);
if (existsSync(join(SITE, "sessions.html"))) {
  console.log(`   sessions.html ${kb(join(SITE, "sessions.html"))}KB`);
}
