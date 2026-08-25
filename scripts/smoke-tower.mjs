/**
 * 관제탑 스모크 테스트 — 배포 전에 "화면이 실제로 동작하는지" 확인한다.
 *
 * ── 2026-07-30 표준 축소(오너 승인) 이후의 관제탑
 * 탭 5종: 발행(기본) · 소재 · 보관함 · 회사 · 자산.
 * 결정함·파이프라인 칸반·지시함·요청 대장·성과 탭은 **일부러 없다** — 지시·제작은
 * 채팅(작업 세션)이 하고, 관제탑은 ①발행 결재·기록 ②소재 조망 ③보관함 열람만 한다.
 * 그래서 여기서는 "없어야 할 것이 없는가"도 검사한다(되살아나면 축소가 무효가 된다).
 *
 * 검사하는 것:
 *   구조   탭 5종 · 지운 화면(결정함·칸반·지시함·성과)이 되살아나지 않았는가
 *   발행   결재 대기·올릴 차례가 실제로 모이고, 눌러서 결재 화면(실물·캡션·다운로드)이 열린다
 *   A      미연결(읽기 전용): 조작해도 상태가 안 바뀌고 연결을 요구한다
 *   B      연결됨: 소재 수정·진행·삭제가 **실제로 저장소 쓰기**를 일으킨다(호출 가로채기)
 *   C      충돌 재시도: 첫 PUT이 409여도 재시도로 저장에 성공한다
 *   G      왕복: 저장소의 기록(중단 등)을 다시 읽어 화면에 반영한다
 *   N      발행 완료: [✅ 올렸습니다] → 대기열 체크 + 완성본 보관 워크플로
 *
 * 실행: node scripts/smoke-tower.mjs [관제탑.html]
 */
import { existsSync } from "node:fs";
import { setFullyCovered } from "./lib/builders-for-set.mjs";
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
page.on("console", (m) => {
  if (m.type() !== "error") return;
  /* "Failed to load resource" 는 어느 파일인지 안 적혀 있다 — requestfailed 가 URL과 함께 잡는다 */
  if (/Failed to load resource/.test(m.text())) return;
  errors.push(m.text().slice(0, 160));
});
const localOnlyMissing = [];
page.on("requestfailed", (r) => {
  const u = r.url().replace(/^file:\/\//, "");
  /* /download/ 완성본 이미지는 Actions 에서만 만들어진다 — 로컬에 없는 게 정상.
     /thumbs/ 는 dashboard-static 이 만들지만 카드 PNG(data/out, gitignore)가 있어야
     생긴다 — 갓 clone 한 환경에선 없는 게 정상이다(2026-08-12 썸네일 파일 분리). */
  if (/\/(download|thumbs)\//.test(u)) { localOnlyMissing.push(u.split("/").pop()); return; }
  errors.push(`요청 실패 ${r.failure()?.errorText || "?"} · ${u.slice(-90)}`);
});
// prompt는 소재 삭제 사유 입력에 쓰인다 → 스모크에서는 항상 값을 준다
page.on("dialog", (d) => d.accept(d.type() === "prompt" ? "스모크 이유" : undefined));

/* ── 0. 배관 정합 (브라우저 밖, 파일끼리) ──
 * "세션에서 만든 카드가 실사이트에 없다"(2026-07-26)의 재발 방지.
 * 캡션이 있는 발행 세트는 반드시 빌더(builders.json)가 있어야 한다. */
{
  const { readFileSync: rf, existsSync: ex } = await import("node:fs");
  console.log("🗼 관제탑 스모크\n\n[0. 세트 ↔ 빌더 정합]");
  try {
    const sets = JSON.parse(rf(join(ROOT, "data/review/sets.json"), "utf8")).sets || [];
    const builders = JSON.parse(rf(join(ROOT, "data/review/builders.json"), "utf8")).builders || [];
    const bLabels = new Set(builders.map((b) => b.label));
    for (const st of sets) {
      const capName = st.caption || st.label;
      const hasCap = ex(join(ROOT, "data/review/captions", capName + ".txt"));
      if (!hasCap) continue; // 캡션 없는 세트는 아직 발행 후보가 아니다
      /* 판단은 정본 하나에 있다 — scripts/lib/builders-for-set.mjs
         (여기 따로 적혀 있어서 2026-08-25 에 세 곳이 나란히 어긋났다) */
      const covered = setFullyCovered(st, builders);
      check(`발행 세트 '${st.label}' 에 카드 재생성 빌더가 있다`, covered,
        "builders.json 에 등록하세요 — 없으면 실사이트에 카드가 안 뜹니다");
    }
    for (const b of builders) {
      check(`빌더 스크립트 존재 — ${b.cmd}`, ex(join(ROOT, b.cmd)));
    }
  } catch (e) {
    check("세트·빌더 명세 읽기", false, String(e).slice(0, 120));
  }
}

const q = (js) => page.evaluate(js);
await page.goto("file://" + PAGE);
await page.waitForTimeout(600);

console.log("\n[구조 — 5탭 + 지운 것이 되살아나지 않았는가]");
const tabs = await q(`[...document.querySelectorAll(".tab")].map(t=>t.dataset.v).join(",")`);
check("탭 5종(발행·소재·보관함·회사·자산)", tabs === "publish,ideas,archive,company,assets", tabs);
check("첫 화면 = 발행", await q(`document.getElementById("view-publish").classList.contains("on")`));
check("연결 뱃지가 제목 행 안에 있음", await q(`!!document.querySelector(".topbar #connbtn")`));
/* 축소로 **지운 화면이 되살아나면 안 된다** — 지시·제작의 단일 입구는 채팅이다 */
check("결정함(오늘) 화면 없음", await q(`!document.getElementById("view-today") && !document.getElementById("inboxBody")`));
check("파이프라인 칸반 없음", await q(`!document.getElementById("view-board") && !document.getElementById("board") && !document.getElementById("flow")`));
check("지시함(자유 입력창) 없음", await q(`!document.getElementById("ask") && !document.getElementById("asksend")`));
check("요청 대장 화면 없음", await q(`!document.getElementById("reqsec") && !document.getElementById("reqBody")`));
check("성과 탭 없음(발행 이력으로 흡수)", await q(`!document.getElementById("view-perf")`));
check("지표 명칭(결재 대기·올릴 차례·소재 풀·데이터 자산)", await q(`
  [...document.querySelectorAll(".kpi .l")].map(e=>e.textContent).join(",")`)
  === "결재 대기,올릴 차례,소재 풀,데이터 자산");
check("저장 상태 바 존재", await q(`!!document.getElementById("savestate")`));
// "있는가"가 아니라 "눌리는가"를 본다 (2026-07-26 배선 소실 사고)
await page.click("#connbtn");
await page.waitForTimeout(200);
check("연결 뱃지를 누르면 팝오버가 열림",
  await q(`document.getElementById("connpop").classList.contains("on")`));
await q(`document.getElementById("connpop").classList.remove("on")`);
await page.click('.kpi[data-go="ideas"]');
await page.waitForTimeout(250);
check("지표를 누르면 실제로 화면이 바뀜",
  await q(`document.getElementById("view-ideas").classList.contains("on")`));

console.log("\n[발행 탭 — 결재·업로드·이력]");
await page.click('.tab[data-v="publish"]');
await page.waitForTimeout(250);
check("결재 대기 칸 렌더(목록 또는 '없음' 명시)", await q(`
  document.querySelectorAll("#approveBody .dcard").length > 0
  || !!document.querySelector("#approveBody .allclear")`));
check("올릴 차례 칸 렌더(목록 또는 '다 올렸음' 명시)", await q(`
  document.querySelectorAll("#uploadBody .dcard").length > 0
  || !!document.querySelector("#uploadBody .allclear")`));
check("발행 이력이 같은 화면에 있다", await q(`
  document.getElementById("view-publish").textContent.indexOf("발행 이력") > -1`));
// 지표와 화면이 같은 숫자를 말해야 도구를 믿을 수 있다
check("지표 '결재 대기' = 결재 목록 건수", await q(`
  document.querySelector(".kpi .v").textContent === String(approveList().length)`),
  await q(`document.querySelector(".kpi .v").textContent + " vs " + approveList().length`));
check("지표 '올릴 차례' = 업로드 목록 건수", await q(`
  document.querySelectorAll(".kpi")[1].querySelector(".v").textContent === String(uploadList().length)`));
check("탭 배지 = 결재+업로드 전체 건수", await q(`
  document.getElementById("tabN").hidden
  || document.getElementById("tabN").textContent === String(approveList().length + uploadList().length)`));
check("같은 카드가 두 번 뜨지 않음", await q(`
  (function(){ const k=(s)=>String(s||"").replace(/\\s+/g,"").toLowerCase();
    const ts=[...document.querySelectorAll("#approveBody .dcard .dt, #uploadBody .dcard .dt")].map(e=>k(e.textContent));
    return new Set(ts).size === ts.length; })()`));
check("자동 업로드를 하는 척하지 않는다", await q(`
  !/인스타에 자동으로 올라갑|자동 발행됩니다|업로드 중입니다/.test(document.body.innerText)`));

// 소재 보드
await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(250);
const cards = await q(`document.querySelectorAll("#ideaBody .idea").length`);
check("소재 보드 렌더", cards > 0, `카드 ${cards}건`);
check("카테고리 그룹 표시", (await q(`document.querySelectorAll("#ideaBody .igrp").length`)) > 0);
check("소재 버튼 3종만(진행·수정·삭제)", await q(`
  [...document.querySelectorAll("#ideaBody .idea")].every(c=>{
    const a=[...c.querySelectorAll(".ibtns [data-ia]")].map(b=>b.dataset.ia).join(",");
    return a==="go,edit,delete"; })`));
check("진행·완료 소재는 보드에서 분리", await q(`
  [...document.querySelectorAll("#ideaBody .idea")].every(c=>{
    const i=IDEAS.find(x=>x.id===c.dataset.iid);
    return i && i.status!=="done" && !Number(i.stage||0); })`));
check("채팅이 단일 입구임을 화면이 말한다", await q(`
  /채팅에 .*붙여/.test(document.getElementById("view-ideas").textContent)`));
check("작업 표시줄 존재(평소엔 숨김)", await q(`
  !!document.getElementById("jobbar") && document.getElementById("jobbar").offsetParent===null`));

// 회사 = 조직도 먼저, 팀을 눌러야 원칙이 열린다
await page.click('.tab[data-v="company"]');
await page.waitForTimeout(250);
check("조직도 정점 = CEO", await q(`!!document.querySelector(".org .onode.ceo")`));
check("CEO 아래 총괄 → 5개 본부", (await q(`document.querySelectorAll(".odivs .odiv").length`)) >= 5
  && (await q(`!!document.querySelector(".org .onode.lead")`)));
check("팀 상세는 기본 숨김(실제로 안 보임)", await q(`
  [...document.querySelectorAll(".tpanel")].every(p=>p.offsetParent===null)`));
await page.click(".onode[data-team]");
await page.waitForTimeout(300);
check("팀을 누르면 원칙·업무기준이 열림", (await q(`
  [...document.querySelectorAll(".tpanel")].filter(p=>p.offsetParent!==null).length`)) === 1);

// 보관함 = 완성 작업물이 주제별로
await page.click('.tab[data-v="archive"]');
await page.waitForTimeout(250);
check("보관함 주제별 폴더", (await q(`document.querySelectorAll(".folders .folder").length`)) > 0);
check("보관함 항목에 상태 표시", (await q(`document.querySelectorAll(".folder .fitem .tagx").length`)) > 0);
await page.click(".folder .fitem .fsum");
await page.waitForTimeout(300);
check("보관함 항목을 펴면 캡션 전문", await q(`!!document.querySelector(".fitem[open] .cap")`));
check("보관함에 저장소 원본 링크", (await q(`document.querySelectorAll(".fitem[open] .flink").length`)) > 0);
check("보관함에 카드 실물 썸네일", (await q(`document.querySelectorAll(".folder img.fthumb").length`)) > 0);
check("보관함 링크가 저장소에 없는 파일을 가리키지 않음", await q(`
  [...document.querySelectorAll(".flink")].every(a =>
    !/\\/data\\/(out|content)\\//.test(a.getAttribute("href")||""))`));

await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(200);

console.log("\n[A. 미연결 — 읽기 전용]");
check("저장바가 연결 필요 표시", (await q(`document.getElementById("savestate").textContent`)).includes("연결 필요"));
check("읽기 전용 안내 노출", await q(`!document.getElementById("igate").hidden`));
const id0 = await q(`document.querySelectorAll("#ideaBody .idea")[0].dataset.iid`);
await page.click(`.idea[data-iid="${id0}"] .ib.go`, { force: true });
await page.waitForTimeout(250);
check("미연결 클릭은 소재를 옮기지 않음",
  !(await q(`Number((IDEAS.find(x=>x.id==="${id0}")||{}).stage||0)`)));

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

const idA = await q(`document.querySelector("#ideaBody .idea").dataset.iid`);
await page.click(`.idea[data-iid="${idA}"] .ib.ed`);
await page.waitForTimeout(150);
await page.fill(`.idea[data-iid="${idA}"] .e-t`, "스모크 수정본");
await page.click(`.idea[data-iid="${idA}"] .iedit .sv`);
await page.waitForTimeout(1100);
check("수정 → 화면 반영", (await q(`document.querySelector('.idea[data-iid="${idA}"] .it').textContent`)).includes("스모크 수정본"));
check("소재 변경이 ideas.json에 기록", await q(`window.__puts.some(p=>p.path.indexOf("research/ideas.json")>-1)`));
check("저장 성공 표시", (await q(`document.getElementById("savestate").textContent`)).includes("저장됨"));

// ── 소재 [▶ 진행] — 골랐다는 사실이 저장소에 남는다 (제작은 채팅 몫)
console.log("\n[D. 소재 진행 배관]");
const idG = await q(`document.querySelector("#ideaBody .idea .ib.go").closest(".idea").dataset.iid`);
await page.click(`.idea[data-iid="${idG}"] .ib.go`);
await page.waitForTimeout(1300);
check("진행 → 소재에 stage가 붙는다", (await q(`(IDEAS.find(x=>x.id==="${idG}")||{}).stage`)) >= 1);
check("진행하면 소재 보드에서 빠진다", !(await q(`!!document.querySelector('.idea[data-iid="${idG}"]')`)));
const goPut = await q(`
  (function(){ const p=window.__puts.filter(x=>x.path.indexOf("ideas.json")>-1).pop();
    if(!p) return ""; try{ return decodeURIComponent(escape(atob(p.body))); }catch(e){ return ""; } })()`);
check("진행이 ideas.json 본문에 실제로 반영", /"stage":\s*1/.test(goPut), goPut.slice(0, 60));
check("진행이 결정 로그에 기록", await q(`window.__puts.some(p=>p.path.indexOf("decisions-inbox")>-1)`));
check("제작은 채팅에 시키라고 안내한다", (await q(`document.getElementById("toast").textContent`)).includes("채팅"));

// ── 학습 루프: 삭제 사유가 곧 학습 신호
console.log("\n[E. 삭제 사유 학습]");
await q(`window.__puts=[]`);
const idR = await q(`document.querySelector("#ideaBody .idea").dataset.iid`);
const nBefore = await q(`document.querySelectorAll("#ideaBody .idea").length`);
await page.click(`.idea[data-iid="${idR}"] .ib.dl`); // prompt는 "스모크 이유"로 자동 응답
await page.waitForTimeout(1300);
check("삭제되면 목록에서 사라진다",
  (await q(`document.querySelectorAll("#ideaBody .idea").length`)) === nBefore - 1);
const decPut = await q(`
  (function(){ const p=window.__puts.filter(x=>x.path.indexOf("decisions-inbox")>-1).pop();
    if(!p) return ""; try{ return decodeURIComponent(escape(atob(p.body))); }catch(e){ return ""; } })()`);
check("삭제 사유가 결정 로그에 기록", decPut.includes("스모크 이유"), decPut.slice(-70));
check("삭제 사유가 다음 발굴의 '피할 것'에 쌓임", await q(`RECENT_DROPS.indexOf("스모크 이유") > -1`));

// 409(sha 불일치)는 실제로 발생한다 → 재시도로 넘겨야 한다
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
const idC = await q(`document.querySelector("#ideaBody .idea").dataset.iid`);
await page.click(`.idea[data-iid="${idC}"] .ib.dl`); // prompt 자동 응답
await page.waitForTimeout(1900);
check("첫 PUT이 409여도 재시도로 저장 성공",
  (await q(`document.getElementById("savestate").textContent`)).includes("저장됨"),
  await q(`document.getElementById("savestate").textContent`));
check("재시도가 실제로 일어남", (await q(`window.__try`)) >= 2, `시도 ${await q(`window.__try`)}회`);

/* GitHub 읽기 캐시가 옛 sha를 줘도 저장에 성공해야 한다(커밋 sha로 읽는 구현 검증) */
await page.waitForTimeout(700);
await q(`
  window.__putOk = 0; window.__usedStale = 0;
  GH._chain = Promise.resolve();
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") {
      const mine = path.indexOf("cachecheck.md") > -1;
      if ((opts.body||{}).sha !== "FRESH") { if(mine) window.__usedStale++; throw new Error('GitHub 409 · { "message": "does not match" }'); }
      if(mine) window.__putOk++;
      return {};
    }
    if (path.indexOf("/git/ref/heads/") > -1) return { object: { sha: "HEAD9" } };
    if (path.indexOf("/contents/") > -1) {
      const fresh = path.indexOf("ref=HEAD9") > -1;
      return { sha: fresh ? "FRESH" : "STALE", content: btoa(unescape(encodeURIComponent("# 기존"))) };
    }
    return {};
  };
  GH.append("research/cachecheck.md", "- 캐시 검사", "smoke").then(()=>{}, ()=>{});
`);
await page.waitForTimeout(1500);
check("읽기 캐시가 옛 sha를 줘도 저장 성공(브랜치가 아니라 커밋으로 읽는다)",
  (await q(`window.__putOk`)) >= 1, `저장 ${await q(`window.__putOk`)}회 · 옛sha사용 ${await q(`window.__usedStale`)}회`);
check("옛 sha로는 아예 저장을 시도하지 않는다", (await q(`window.__usedStale`)) === 0);

// ── 왕복: 저장소의 기록을 다시 읽어 화면에 반영하는가
console.log("\n[G. 왕복 — 쓴 것이 다시 읽어도 반영되는가]");
await q(`closeDrawer && closeDrawer()`);
await page.waitForTimeout(300);
await q(`
  window.__dropped = S.tickets.find(t=>t.stage>=1 && !(t.flags||[]).includes("버림"));
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") return {};
    if (path === "/user") return { login: "smoke" };
    if (path.indexOf("/actions/runs") > -1) return { workflow_runs: [] };
    if (path.indexOf("pipeline-state") > -1) {
      const body = JSON.stringify({ dropped: [{ title: window.__dropped.title }], revise: [] });
      return { sha: "sha", content: btoa(unescape(encodeURIComponent(body))) };
    }
    if (path.indexOf("/contents/") > -1) {
      const body = JSON.stringify({ meta:{}, cats: STATE.ideas.cats, ideas: IDEAS });
      return { sha: "sha", content: btoa(unescape(encodeURIComponent(body))) };
    }
    return {};
  };
`);
await q(`refreshFromRepo()`);
await page.waitForTimeout(900);
check("저장소의 '중단' 기록이 화면 상태에 반영됨(배포를 안 기다림)", await q(`
  (S.tickets.find(t=>t.title===window.__dropped.title)||{}).flags.includes("버림")`));
check("중단된 건은 결재 대기에 올라오지 않음", await q(`
  !approveList().some(t=>t.title===window.__dropped.title)`));

/* ── I. 완성 카드가 오너 손에 닿는가 ── */
console.log("\n[I. 결재 화면 — 실물·캡션·다운로드]");
await page.click('.tab[data-v="publish"]');
await page.waitForTimeout(300);
const dlTicket = await q(`(S.tickets.find(t=>t.stage===4 && t.caption && t.setLabel)||{}).id||""`);
if (dlTicket) {
  await q(`openDrawer(${JSON.stringify(dlTicket)})`);
  await page.waitForTimeout(300);
  check("결재 화면에 나갈 카드 실물", await q(`!!document.querySelector("#drawer .pvframe img")`));
  check("결재 화면에 캡션 전문", await q(`!!document.querySelector("#drawer .cap")`));
  check("결재 화면에 원본 내려받기 링크(수동 업로드용)", await q(`
    [...document.querySelectorAll("#drawer .dlrow a.dl")].length >= 1
    && [...document.querySelectorAll("#drawer .dlrow a.dl")].every(a=>(a.getAttribute("href")||"").indexOf("download/")===0)`));
  check("캡션 복사 버튼", await q(`!!document.querySelector('#drawer [data-act="copycap"]')`));
  check("[🚀 발행 승인] 버튼", await q(`!!document.querySelector('#drawer [data-act="publish"]')`));
  /* 결재 대기의 **삭제 버튼**(2026-08-13 오너: "삭제하고 싶은데 기능이 없네?").
     처음엔 시안 상태에만 달려 있어 정작 쌓여 있던 확정·승인대기 건을 화면에서 못 치웠다.
     세트 라벨이 있는 건이면 상태와 무관하게 떠야 한다 — 없으면 대기열이 장부 구실을 못 한다. */
  /* 완전 삭제(2026-08-13 오너: "관제탑에서 완전 삭제 가능하도록").
     목록에서 내리는 것과 파일까지 지우는 것은 뜻이 다르다 — 버튼도 둘이어야 한다. */
  check("결재 대기에 [🧨 완전 삭제] 버튼", await q(`(function(){
    var b=document.querySelector('#drawer .fpurge');
    return !!b && !!b.dataset.purge && /완전 삭제/.test(b.textContent||"");
  })()`));
  check("완전 삭제는 파일 목록을 알고 있다(STATE.archive)", await q(`(function(){
    var b=document.querySelector('#drawer .fpurge'); if(!b) return false;
    var lb=b.dataset.purge, w=null;
    (STATE.archive||[]).forEach(function(f){ (f.items||[]).forEach(function(x){ if(x.label===lb) w=x; }); });
    if(!w||!w.files) return false;
    var n=(w.files.content||[]).length+(w.files.png||[]).length
      +(w.files.caption?1:0)+(w.files.review?1:0);
    return n>0;
  })()`));
  check("결재 대기에 [🗑 내리기] 버튼(상태 무관)", await q(`(function(){
    var b=document.querySelector('#drawer .fdrop');
    if(!b) return false;
    return !!b.dataset.drop && /내리기|삭제/.test(b.textContent||"");
  })()`));
  check("수정·반려는 채팅으로 안내(버튼 없음)", await q(`
    !document.querySelector('#drawer [data-act="edit"], #drawer [data-act="reject"]')
    && /채팅/.test((document.querySelector("#drawer .pubnote")||{}).textContent||"")`));
  await q(`closeDrawer()`);
}

/* ── J. 관제탑 단독 재제작 — 빌더 있는 세트는 버튼 한 번 ── */
console.log("\n[J. 관제탑 단독 재제작]");
check("기계 재생산 목록이 상태에 실림", await q(`Array.isArray(STATE.builders) && STATE.builders.length >= 5`));
await page.click('.tab[data-v="archive"]');
await page.waitForTimeout(300);
check("보관함에 [다시 제작] 버튼(빌더 있는 세트)", await q(`
  document.querySelectorAll(".fremake[data-remake]").length >= 3`));
check("빌더 없는 세트엔 버튼 대신 '작업 세션 필요' 안내", await q(`
  [...document.querySelectorAll(".folder .fitem")].every(el=>
    el.querySelector(".fremake") || /작업 세션/.test(el.textContent))`));
await q(`
  window.__made=[];
  GH._chain=Promise.resolve();
  GH.api = async (path, opts) => {
    opts=opts||{};
    if (path.indexOf("/dispatches") > -1) { window.__made.push(path); return {}; }
    if (opts.method === "PUT") return {};
    if (path.indexOf("/git/ref/heads/") > -1) return { object:{sha:"H"} };
    if (path.indexOf("/contents/") > -1) return { sha:"s", content: btoa(unescape(encodeURIComponent(JSON.stringify({items:[]})))) };
    return {};
  };
`);
/* ⚠️ **보이는 버튼**을 누른다. 예전엔 첫 DOM 요소를 눌렀는데, 보관함 폴더는 접혀 있을 수
   있어서 첫 버튼이 안 보이면 그대로 시간 초과가 난다 — 2026-08-25 에 하루치를 한 세트로
   묶으며 목록 차례가 바뀌자 바로 물렸다(로컬 192/192 인데 배포에서만 실패했다).
   이 시험이 알고 싶은 것은 "어떤 재제작 버튼이든 눌리면 워크플로가 걸리나"이지
   "첫 번째 요소가 눌리나"가 아니다. */
/* ⚠️ 보관함 항목은 `<details class="fitem">` 라 **접혀 있으면 버튼이 안 보인다.**
   예전엔 첫 DOM 요소를 그냥 눌렀는데, 2026-08-25 에 하루치를 한 세트로 묶어 목록 차례가
   바뀌자 첫 버튼이 접힌 항목 안으로 들어가 **시간 초과**가 났다
   (로컬 192/192 인데 배포에서만 실패 — 그때 `build-archive` 를 안 돌렸던 탓에 로컬에선 안 보였다).
   이 시험이 알고 싶은 것은 "재제작 버튼을 누르면 워크플로가 걸리나"이지
   "첫 번째 요소가 눌리나"가 아니다. **펼쳐 놓고 누른다.** */
await q(`document.querySelectorAll("details.fitem").forEach(d=>d.open=true)`);
await page.waitForTimeout(200);
await page.click(".fremake[data-remake] >> visible=true");
await page.waitForTimeout(900);
check("버튼을 누르면 제작 워크플로가 실제로 걸림", await q(`
  window.__made.some(p=>p.indexOf("produce-card.yml")>-1)`), await q(`JSON.stringify(window.__made)`));

/* ── K. 연결 안내가 실제로 필요한 권한을 말하는가 ── */
console.log("\n[K. 연결 안내·검사]");
await q(`GH.setToken(""); renderConn(); document.getElementById("connpop").classList.add("on");`);
await page.waitForTimeout(200);
const popTxt = await q(`document.getElementById("connpop").textContent`);
check("필요한 권한 2개를 모두 안내(Contents·Actions)",
  /Contents/.test(popTxt) && /Actions/.test(popTxt), popTxt.slice(0, 80));
check("기기마다 붙여넣어야 함을 안내(모바일 연동)", /기기마다/.test(popTxt));
await q(`
  window.__warned="";
  GH.api = async (path) => {
    if (path === "/user") return { login: "smoke" };
    if (path.indexOf("/actions/workflows") > -1) throw new Error("GitHub 403 · Resource not accessible");
    if (path.indexOf("/git/ref/heads/") > -1) return { object:{sha:"H"} };
    if (path.indexOf("/contents/") > -1) return { sha:"s", content: btoa("{}") };
    return {};
  };
  const _t = window.toast; window.toast = (m) => { window.__warned += m; _t && _t(m); };
  document.getElementById("conntok").value = "github_pat_smoke";
`);
await page.click("#connsave");
await page.waitForTimeout(900);
check("Actions 권한이 없으면 그 사실을 알려준다", await q(`/Actions 권한/.test(window.__warned)`),
  await q(`window.__warned`));

/* ── M. 소재 정리 — 발행 주기별 ── */
console.log("\n[M. 소재 정리 — 정기/일회 주기별]");
await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(300);
const catKeys = await q(`ICATS.map(c=>c.key).join(",")`);
check("칸이 발행 주기로 서 있다", ["daily", "weekly", "monthly", "quarter", "yearly", "once", "todo"]
  .every((k) => catKeys.split(",").includes(k)), catKeys);
check("소재마다 자료가 자동 갱신되는지 표시", (await q(`document.querySelectorAll("#ideaBody .ifeed").length`)) > 0);
const idCad = await q(`document.querySelector("#ideaBody .idea").dataset.iid`);
await page.click(`.idea[data-iid="${idCad}"] .ib.ed`);
await page.waitForTimeout(200);
check("✎ 수정에 발행 주기 선택칸이 있다",
  await q(`!!document.querySelector('.idea[data-iid="${idCad}"] .e-c')`));
await q(`
  window.__puts=[];
  GH._chain = Promise.resolve();
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") { window.__puts.push({path, body:(opts.body||{}).content}); return {}; }
    if (path.indexOf("/git/ref/heads/") > -1) return { object: { sha: "HEAD1" } };
    if (path.indexOf("/contents/") > -1) {
      const isJson = path.indexOf(".json") > -1;
      const body = isJson ? JSON.stringify({ meta:{}, cats: STATE.ideas.cats, ideas: IDEAS }) : "# 기존";
      return { sha: "sha", content: btoa(unescape(encodeURIComponent(body))) };
    }
    return {};
  };
  (function(){ const s=document.querySelector('.idea[data-iid="${idCad}"] .e-c');
    s.value = s.value==="once" ? "monthly" : "once"; })()`);
await page.click(`.idea[data-iid="${idCad}"] [data-ia="save"]`);
await page.waitForTimeout(1300);
const catPut = await q(`
  (function(){ const p=window.__puts.filter(x=>x.path.indexOf("ideas.json")>-1).pop();
    if(!p) return ""; try{ return decodeURIComponent(escape(atob(p.body))); }catch(e){ return ""; } })()`);
check("주기를 바꾸면 ideas.json에 실제로 저장된다", catPut.includes(`"id": "${idCad}"`), catPut.slice(0, 40));

/* ── N. 발행 완료 — 수동 업로드 기록 ──
 * 발행은 오너가 직접 한다(2026-07-27). 시스템이 발행 사실을 아는 길은 이 버튼뿐이다. */
console.log("\n[N. 발행 완료 — 수동 업로드 기록]");
await q(`closeDrawer && closeDrawer()`);
await page.click('.tab[data-v="publish"]');
await page.waitForTimeout(300);
/* 대기 0건 = 오너가 다 올렸다는 뜻일 수 있다 — 그날 검사가 빨간불이면 안 된다(2026-07-29) */
const waitId = await q(`
  (S.tickets.find(t=>t.stage===5 && (t.flags||[]).includes("업로드 대기"))||{}).id || ""`);
const postedN = await q(`(STATE.published||[]).filter(p=>p.confirmed).length`);
check("발행 흐름의 상태가 둘 중 하나로 분명함(올릴 게 있거나 · 다 올렸거나)",
  !!waitId || postedN > 0, `대기 ${waitId ? 1 : 0}건 · 발행 확인 ${postedN}건`);
if (waitId) {
  await q(`openDrawer(${JSON.stringify(waitId)})`);
  await page.waitForTimeout(400);
  check("결재 화면이 '오너가 직접 올린다'고 말한다",
    (await q(`(document.querySelector("#drawer .pubnote")||{}).textContent||""`)).includes("직접"));
  check("[✅ 인스타에 올렸습니다] 버튼 존재",
    await q(`!!document.querySelector('#drawer [data-act="posted"]')`));
  await q(`
    window.__puts=[]; window.__wf=[];
    GH._chain = Promise.resolve();
    GH.api = async (path, opts) => {
      opts = opts || {};
      if (opts.method === "PUT") { window.__puts.push({path, body:(opts.body||{}).content}); return {}; }
      if (path.indexOf("/dispatches") > -1) { window.__wf.push(path); return {}; }
      if (path.indexOf("/git/ref/heads/") > -1) return { object: { sha: "HEAD1" } };
      if (path.indexOf("/contents/") > -1) {
        const body = "- [ ] [26.07.26(일) 관제탑] **" + S.tickets.find(t=>t.id===${JSON.stringify(waitId)}).title + "** · 카드";
        return { sha: "sha", content: btoa(unescape(encodeURIComponent(body))) };
      }
      return {};
    };`);
  await page.click('#drawer [data-act="posted"]'); // confirm 은 dialog 핸들러가 수락
  await page.waitForTimeout(1600);
  const qput = await q(`
    (function(){ const p=window.__puts.filter(x=>x.path.indexOf("publish-queue")>-1).pop();
      if(!p) return ""; try{ return decodeURIComponent(escape(atob(p.body))); }catch(e){ return ""; } })()`);
  check("누르면 발행 대기열이 완료로 체크된다", /^\s*-\s*\[x\]/m.test(qput), qput.slice(0, 60));
  check("발행 사실이 결정 로그에도 남는다", await q(`
    window.__puts.some(p=>p.path.indexOf("decisions-inbox")>-1)`));
  check("완성본 보관 워크플로가 실제로 걸린다", await q(`
    window.__wf.some(p=>p.indexOf("publish-archive.yml")>-1)`), (await q(`window.__wf.join(",")`)) || "없음");
}
check("[✅ 올렸습니다] 배선이 화면에 있다", await q(`
  typeof markUploaded === "function" && document.documentElement.innerHTML.indexOf('data-act="posted"') > -1`));
if (postedN > 0) {
  check("발행 확인된 건은 '올릴 차례'에 다시 뜨지 않는다", await q(`
    (function(){ const labels=(STATE.published||[]).filter(p=>p.confirmed).map(p=>p.label);
      return !uploadList().some(t=>labels.indexOf(t.setLabel)>-1); })()`));
  check("발행 이력에 건수가 적힌다",
    (await q(`document.getElementById("view-publish").innerHTML`)).includes(`${postedN}건`), `${postedN}건`);
}

check("콘솔·페이지 오류 없음", errors.length === 0, errors.slice(0, 3).join(" | "));
if (localOnlyMissing.length) {
  console.log(
    `  ℹ️  완성본 이미지 ${localOnlyMissing.length}개는 로컬에 없습니다(Actions 에서 생성) — ` +
      `${localOnlyMissing.slice(0, 3).join(", ")}${localOnlyMissing.length > 3 ? " …" : ""}`,
  );
}

await browser.close();
console.log(`\n${fail ? "❌" : "✅"} ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
