/**
 * 관제탑 스모크 테스트 — 배포 전에 "화면이 실제로 동작하는지" 확인한다.
 *
 * 두 시나리오를 검사한다.
 *   A. 미연결(읽기 전용): 조작해도 상태가 바뀌지 않고 연결을 요구한다
 *      → 새로고침 시 사라질 변경을 만들지 않는 것이 핵심
 *   B. 연결됨: 승인·수정·추가·발굴요청·자료인박스가 **실제로 저장소 쓰기**를 일으킨다
 *      (GitHub 호출은 가로채서 실제 커밋 없이 요청만 확인)
 *
 * 실행: node scripts/smoke-tower.mjs [관제탑.html]
 */
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = resolve(process.argv[2] || join(ROOT, "packages/dashboard/index.html"));
if (!existsSync(PAGE)) throw new Error(`관제탑 HTML 없음: ${PAGE} — 먼저 dashboard-static 생성`);

// playwright-core는 렌더러 패키지의 의존성이라 그쪽 기준으로 해석한다(pnpm 엄격 트리)
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const { chromium } = require("playwright-core");

let pass = 0;
let fail = 0;
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
};

// 사전 설치 경로가 있으면 그걸 쓰고(로컬), 없으면 playwright 기본 탐색(CI)
const PINNED = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const browser = await chromium.launch(existsSync(PINNED) ? { executablePath: PINNED } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
page.on("dialog", (d) => d.accept(d.type() === "prompt" ? "스모크 방향" : undefined));

const q = (js) => page.evaluate(js);
await page.goto("file://" + PAGE);
await page.waitForTimeout(600);

console.log("🗼 관제탑 스모크");
console.log("\n[구조]");
const tabs = await q(`[...document.querySelectorAll(".tab")].map(t=>t.dataset.v).join(",")`);
check("탭 4종(파이프라인·소재·회사·자산)", tabs === "board,ideas,company,assets", tabs);
check("복사-붙여넣기 우회 제거(요약복사·초기화·지시전달함)",
  (await q(`[!!document.getElementById("bcopy"),!!document.getElementById("breset"),!!document.getElementById("dcnt")].join()`)) === "false,false,false");
check("저장 상태 바 존재", await q(`!!document.getElementById("savestate")`));

await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(250);
const cards = await q(`document.querySelectorAll("#ideaBody .idea").length`);
check("소재 보드 렌더", cards > 0, `카드 ${cards}건`);
check("카테고리 그룹 표시", (await q(`document.querySelectorAll("#ideaBody .igrp").length`)) > 0);

console.log("\n[A. 미연결 — 읽기 전용]");
check("저장바가 연결 필요 표시", (await q(`document.getElementById("savestate").textContent`)).includes("연결 필요"));
check("읽기 전용 안내 노출", (await q(`!document.getElementById("igate").hidden`)));
const id0 = await q(`document.querySelectorAll("#ideaBody .idea")[0].dataset.iid`);
const before = await q(`document.querySelector('.idea[data-iid="${id0}"]').dataset.st`);
await page.click(`.idea[data-iid="${id0}"] .ib.ap`);
await page.waitForTimeout(200);
check("미연결 클릭은 상태를 바꾸지 않음",
  (await q(`document.querySelector('.idea[data-iid="${id0}"]').dataset.st`)) === before);

console.log("\n[B. 연결됨 — 저장소 직접 기록]");
await q(`
  window.__puts=[];
  localStorage.setItem("wirit-gh-token","smoke");
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") { window.__puts.push({ path: path, msg: opts.body.message }); return {}; }
    if (path.indexOf("/contents/") > -1) {
      const isJson = path.indexOf(".json") > -1;
      const body = isJson ? JSON.stringify({ meta:{}, cats: STATE.ideas.cats, ideas: STATE.ideas.items }) : "# 기존";
      return { sha: "sha", content: btoa(unescape(encodeURIComponent(body))) };
    }
    if (path.indexOf("/actions/runs") > -1) return { workflow_runs: [] };
    return {};
  };
  renderGhBar(); setSave("ok"); renderIdeas();
`);
await page.waitForTimeout(200);
check("연결 시 읽기 전용 안내 사라짐", await q(`document.getElementById("igate").hidden`));

const idA = await q(`[...document.querySelectorAll("#ideaBody .idea")].find(c=>!c.dataset.st).dataset.iid`);
await page.click(`.idea[data-iid="${idA}"] .ib.ap`);
await page.waitForTimeout(1100);
check("승인 → 화면 반영", (await q(`document.querySelector('.idea[data-iid="${idA}"]').dataset.st`)) === "approve");

await page.click(`.idea[data-iid="${idA}"] .ib.ed`);
await page.waitForTimeout(150);
await page.fill(`.idea[data-iid="${idA}"] .e-t`, "스모크 수정본");
await page.click(`.idea[data-iid="${idA}"] .iedit .sv`);
await page.waitForTimeout(1100);
check("수정 → 화면 반영", (await q(`document.querySelector('.idea[data-iid="${idA}"] .it').textContent`)).includes("스모크 수정본"));

await page.click("#iaddBtn");
await page.fill("#na-t", "스모크 신규 소재");
await page.click("#iaddSave");
await page.waitForTimeout(1100);
check("신규 추가 → 카드 증가", (await q(`document.querySelectorAll("#ideaBody .idea").length`)) === cards + 1);

await page.click("#imineBtn");
await page.waitForTimeout(900);
await page.fill("#ktext2", "스모크 자료");
await page.click("#kadd2");
await page.waitForTimeout(900);

const puts = await q(`window.__puts.map(p=>p.path.split("/contents/")[1]||p.path)`);
const wrote = (f) => puts.some((p) => p.startsWith(f));
check("소재 변경이 ideas.json에 기록", wrote("research/ideas.json"), puts.join(" "));
check("발굴 요청이 결정 로그에 기록", wrote("research/decisions-inbox.md"));
check("자료 인박스가 INBOX.md에 기록", wrote("research/INBOX.md"));
check("저장 성공 표시", (await q(`document.getElementById("savestate").textContent`)).includes("저장됨"));

// 409(sha 불일치)는 GitHub이 쓰기 직후 옛 sha를 돌려줄 때 실제로 발생한다 → 재시도로 넘겨야 한다
console.log("\n[C. 충돌 재시도]");
await q(`
  window.__try = 0;
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") {
      window.__try++;
      if (window.__try === 1) { const e = new Error('GitHub 409 · { "message": "does not match" }'); throw e; }
      return {};
    }
    if (path.indexOf("/contents/") > -1) {
      const isJson = path.indexOf(".json") > -1;
      const body = isJson ? JSON.stringify({ meta:{}, cats: STATE.ideas.cats, ideas: STATE.ideas.items }) : "# 기존";
      return { sha: "sha" + window.__try, content: btoa(unescape(encodeURIComponent(body))) };
    }
    return {};
  };
`);
const idC = await q(`[...document.querySelectorAll("#ideaBody .idea")].find(c=>c.dataset.st!=="hold").dataset.iid`);
await page.click(`.idea[data-iid="${idC}"] .ib.hd`);
await page.waitForTimeout(1800);
check("첫 PUT이 409여도 재시도로 저장 성공",
  (await q(`document.getElementById("savestate").textContent`)).includes("저장됨"),
  await q(`document.getElementById("savestate").textContent`));
check("재시도가 실제로 일어남", (await q(`window.__try`)) >= 2, `시도 ${await q(`window.__try`)}회`);

check("콘솔·페이지 오류 없음", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${fail ? "❌" : "✅"} ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
