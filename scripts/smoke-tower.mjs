/**
 * 관제탑 스모크 테스트 — 배포 전에 "화면이 실제로 동작하는지" 확인한다.
 *
 * 검사하는 것:
 *   구조   화면이 설계대로 조립됐는가 (탭 5종·연결 뱃지·결정함·마이닝 잔재 제거)
 *   A      미연결(읽기 전용): 조작해도 상태가 안 바뀌고 연결을 요구한다
 *          → 새로고침 시 사라질 변경을 만들지 않는 것이 핵심
 *   B      연결됨: 승인·수정·추가·발굴요청·자료인박스가 **실제로 저장소 쓰기**를 일으킨다
 *          (GitHub 호출은 가로채서 실제 커밋 없이 요청만 확인)
 *   D      배관: 소재 [▶ 진행] → ideas.json에 stage가 붙고 결정 로그에도 남는다
 *   E      학습: 반려에 이유를 받아 결정 로그에 남긴다
 *   C      충돌 재시도: 첫 PUT이 409여도 재시도로 저장에 성공한다
 *   F      결정함: 오늘 결정할 일이 실제로 모이고, 눌러서 이동된다
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
// prompt는 반려 이유·발굴 방향 입력에 쓰인다 → 스모크에서는 항상 값을 준다
page.on("dialog", (d) => d.accept(d.type() === "prompt" ? "스모크 이유" : undefined));

const q = (js) => page.evaluate(js);
await page.goto("file://" + PAGE);
await page.waitForTimeout(600);

console.log("🗼 관제탑 스모크");
console.log("\n[구조]");
const tabs = await q(`[...document.querySelectorAll(".tab")].map(t=>t.dataset.v).join(",")`);
check("탭 5종(오늘·파이프라인·소재·회사·자산)", tabs === "today,board,ideas,company,assets", tabs);
check("첫 화면 = 결정함", await q(`document.getElementById("view-today").classList.contains("on")`));
check("연결 뱃지가 제목 행 안에 있음", await q(`!!document.querySelector(".topbar #connbtn")`));
check("연결 바(ghbar) 제거", await q(`!document.getElementById("ghbar")`));
// "평균연봉"은 실제 소재 제목이라 본문에 남아 있는 게 정상 → 실행 버튼만 없는지 본다
check("워크플로 실행 버튼(마이닝·로고 취득·평균연봉) 제거", await q(`
  !document.querySelector("[data-wf], #imineRun, .ghbtn.wf, #ghruns")
  && [...document.querySelectorAll(".itool, .ghbtn")].every(b=>!/로고 취득|평균연봉|마이닝 실행/.test(b.textContent))`));
check("복사-붙여넣기 우회 제거(요약복사·초기화·지시전달함)",
  (await q(`[!!document.getElementById("bcopy"),!!document.getElementById("breset"),!!document.getElementById("dcnt")].join()`)) === "false,false,false");
check("저장 상태 바 존재", await q(`!!document.getElementById("savestate")`));

// 칸반은 '기획안'부터 — 소재 고르기는 소재 탭이 단일 창구
await page.click('.tab[data-v="board"]');
await page.waitForTimeout(200);
const firstCol = await q(`(document.querySelector("#board .col h2")||{}).textContent||""`);
check("칸반 첫 열 = 기획안(마이닝 열 제거)", firstCol.startsWith("기획안"), firstCol);
check("칸반에 마이닝 패널 없음", await q(`!document.querySelector(".col.mining")`));

await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(250);
const cards = await q(`document.querySelectorAll("#ideaBody .idea").length`);
check("소재 보드 렌더", cards > 0, `카드 ${cards}건`);
check("카테고리 그룹 표시", (await q(`document.querySelectorAll("#ideaBody .igrp").length`)) > 0);

console.log("\n[A. 미연결 — 읽기 전용]");
check("저장바가 연결 필요 표시", (await q(`document.getElementById("savestate").textContent`)).includes("연결 필요"));
check("읽기 전용 안내 노출", await q(`!document.getElementById("igate").hidden`));
check("조작 도구가 잠김", await q(`document.querySelector(".itools").classList.contains("locked")`));
const id0 = await q(`document.querySelectorAll("#ideaBody .idea")[0].dataset.iid`);
const before = await q(`document.querySelector('.idea[data-iid="${id0}"]').dataset.st`);
await page.click(`.idea[data-iid="${id0}"] .ib.ap`, { force: true });
await page.waitForTimeout(200);
check("미연결 클릭은 상태를 바꾸지 않음",
  (await q(`document.querySelector('.idea[data-iid="${id0}"]').dataset.st`)) === before);

console.log("\n[B. 연결됨 — 저장소 직접 기록]");
await q(`
  window.__puts=[];
  localStorage.setItem("wirit-gh-token","smoke");
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") { window.__puts.push({ path: path, msg: opts.body.message, body: opts.body.content }); return {}; }
    if (path.indexOf("/dispatches") > -1) return {};
    if (path === "/user") return { login: "smoke" };
    if (path.indexOf("/contents/") > -1) {
      const isJson = path.indexOf(".json") > -1;
      const body = isJson ? JSON.stringify({ meta:{}, cats: STATE.ideas.cats, ideas: STATE.ideas.items }) : "# 기존";
      return { sha: "sha", content: btoa(unescape(encodeURIComponent(body))) };
    }
    return {};
  };
  afterConnChange("");
`);
await page.waitForTimeout(300);
await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(200);
check("연결 시 읽기 전용 안내 사라짐", await q(`document.getElementById("igate").hidden`));
check("연결 뱃지가 '연결됨'", (await q(`document.getElementById("connbtn").textContent`)).includes("연결됨"));
check("조작 잠금 해제", await q(`!document.querySelector(".itools").classList.contains("locked")`));

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

await page.click("#imineBtn"); // prompt 자동 응답
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

// ── 소재 → 파이프라인 배관 (이번 개편의 핵심)
console.log("\n[D. 소재 → 파이프라인 배관]");
const idG = await q(`[...document.querySelectorAll("#ideaBody .idea")].find(c=>c.querySelector(".ib.go")).dataset.iid`);
await page.click(`.idea[data-iid="${idG}"] .ib.go`);
await page.waitForTimeout(1300);
check("진행 → 소재에 stage가 붙는다", (await q(`(IDEAS.find(x=>x.id==="${idG}")||{}).stage`)) >= 1);
check("진행 → 카드가 '기획안'으로 표시",
  (await q(`document.querySelector('.idea[data-iid="${idG}"]').textContent`)).includes("기획안"));
const goPut = await q(`
  (function(){ const p=window.__puts.filter(x=>x.path.indexOf("ideas.json")>-1).pop();
    if(!p) return ""; try{ return decodeURIComponent(escape(atob(p.body))); }catch(e){ return ""; } })()`);
check("진행이 ideas.json 본문에 실제로 반영", /"stage":\s*1/.test(goPut), goPut.slice(0, 60));

// ── 학습 루프: 반려에는 이유가 붙는다
console.log("\n[E. 반려 이유 학습]");
await q(`window.__puts=[]`);
const idR = await q(`[...document.querySelectorAll("#ideaBody .idea")].find(c=>c.dataset.st!=="reject"&&c.querySelector(".ib.rj")).dataset.iid`);
await page.click(`.idea[data-iid="${idR}"] .ib.rj`); // prompt는 "스모크 이유"로 자동 응답
await page.waitForTimeout(1300);
const decPut = await q(`
  (function(){ const p=window.__puts.filter(x=>x.path.indexOf("decisions-inbox")>-1).pop();
    if(!p) return ""; try{ return decodeURIComponent(escape(atob(p.body))); }catch(e){ return ""; } })()`);
check("반려 이유가 결정 로그에 기록", decPut.includes("스모크 이유"), decPut.slice(-70));
check("반려 이유가 소재에 저장", (await q(`(IDEAS.find(x=>x.id==="${idR}")||{}).reason`)) === "스모크 이유");

// 409(sha 불일치)는 GitHub이 쓰기 직후 옛 sha를 돌려줄 때 실제로 발생한다 → 재시도로 넘겨야 한다
console.log("\n[C. 충돌 재시도]");
await q(`
  window.__try = 0;
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") {
      window.__try++;
      if (window.__try === 1) { throw new Error('GitHub 409 · { "message": "does not match" }'); }
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
const idC = await q(`[...document.querySelectorAll("#ideaBody .idea")].find(c=>c.dataset.st!=="hold"&&c.dataset.st!=="reject").dataset.iid`);
await page.click(`.idea[data-iid="${idC}"] .ib.hd`); // prompt 자동 응답
await page.waitForTimeout(1900);
check("첫 PUT이 409여도 재시도로 저장 성공",
  (await q(`document.getElementById("savestate").textContent`)).includes("저장됨"),
  await q(`document.getElementById("savestate").textContent`));
check("재시도가 실제로 일어남", (await q(`window.__try`)) >= 2, `시도 ${await q(`window.__try`)}회`);

// ── 결정함: 결정할 일이 실제로 모이는가
console.log("\n[F. 결정함]");
await page.click('.tab[data-v="today"]');
await page.waitForTimeout(300);
const inboxN = await q(`document.querySelectorAll("#inboxBody .dcard").length`);
const allClear = await q(`!!document.querySelector("#inboxBody .allclear")`);
check("결정함이 결정 대기를 모으거나 '없음'을 명시", inboxN > 0 || allClear, `카드 ${inboxN}건`);
if (inboxN > 0) {
  await page.click("#inboxBody .dcard");
  await page.waitForTimeout(300);
  check("결정함 카드를 누르면 해당 화면으로 이동", await q(`
    document.getElementById("view-board").classList.contains("on")
    || document.getElementById("view-ideas").classList.contains("on")`));
}

check("콘솔·페이지 오류 없음", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${fail ? "❌" : "✅"} ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
