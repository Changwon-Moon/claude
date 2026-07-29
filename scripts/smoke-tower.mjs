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

/* ── 0. 배관 정합 (브라우저 밖, 파일끼리) ──
 * "세션에서 만든 카드가 실사이트에 없다"(2026-07-26)의 재발 방지.
 * 카드 PNG는 저장소에 없으므로, 배포가 다시 그릴 수 있어야 화면에 뜬다.
 * = 캡션이 있는 발행 세트는 반드시 빌더(builders.json)가 있어야 한다. */
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
      // 세트의 각 카드 slug 를 어떤 빌더가 만들어 주는가 — 라벨 대응 또는 접두 일치로 본다
      const covered = bLabels.has(st.label)
        || st.cards.every((c) => [...bLabels].some((b) => c.startsWith(b) || b.startsWith(c.replace(/-p\d+$/, ""))));
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

console.log("\n[구조]");
const tabs = await q(`[...document.querySelectorAll(".tab")].map(t=>t.dataset.v).join(",")`);
check("탭 7종(오늘·파이프라인·소재·회사·보관함·성과·자산)",
  tabs === "today,board,ideas,company,archive,perf,assets", tabs);
check("첫 화면 = 결정함", await q(`document.getElementById("view-today").classList.contains("on")`));
check("연결 뱃지가 제목 행 안에 있음", await q(`!!document.querySelector(".topbar #connbtn")`));
check("탭에 이모지 없음(활자만)", await q(`
  [...document.querySelectorAll(".tab")].every(t=>!/\\p{Extended_Pictographic}/u.test(t.textContent))`));
check("지표 명칭(결재 대기·작업중·소재 풀·데이터 자산)", await q(`
  [...document.querySelectorAll(".kpi .l")].map(e=>e.textContent).join(",")`)
  === "결재 대기,작업중,소재 풀,데이터 자산");
check("지표를 누르면 해당 화면으로", await q(`!!document.querySelector(".kpi[data-go]")`));
check("연결 바(ghbar) 제거", await q(`!document.getElementById("ghbar")`));
// "평균연봉"은 실제 소재 제목이라 본문에 남아 있는 게 정상 → 실행 버튼만 없는지 본다
check("워크플로 실행 버튼(마이닝·로고 취득·평균연봉) 제거", await q(`
  !document.querySelector("[data-wf], #imineRun, .ghbtn.wf, #ghruns")
  && [...document.querySelectorAll(".itool, .ghbtn")].every(b=>!/로고 취득|평균연봉|마이닝 실행/.test(b.textContent))`));
check("복사-붙여넣기 우회 제거(요약복사·초기화·지시전달함)",
  (await q(`[!!document.getElementById("bcopy"),!!document.getElementById("breset"),!!document.getElementById("dcnt")].join()`)) === "false,false,false");
check("저장 상태 바 존재", await q(`!!document.getElementById("savestate")`));
// ⚠️ 화면에 버튼이 있어도 배선이 빠지면 아무 일도 안 일어난다.
//    (2026-07-26: 소재 탭을 갈아끼우다 연결 뱃지 배선이 통째로 사라진 적이 있다)
//    "있는가"가 아니라 "눌리는가"를 본다.
await page.click("#connbtn");
await page.waitForTimeout(200);
check("연결 뱃지를 누르면 팝오버가 열림",
  await q(`document.getElementById("connpop").classList.contains("on")`));
await page.keyboard.press("Escape");
await q(`document.getElementById("connpop").classList.remove("on")`);
await page.click('.kpi[data-go="board"]');
await page.waitForTimeout(250);
check("지표를 누르면 실제로 화면이 바뀜",
  await q(`document.getElementById("view-board").classList.contains("on")`));
await page.click('.tab[data-v="today"]');
await page.waitForTimeout(200);

// 파이프라인 = 흐름 레일 + 단계별 목록 (가로 스크롤 칸반 폐지)
await page.click('.tab[data-v="board"]');
await page.waitForTimeout(250);
check("가로 스크롤 칸반 제거", await q(`!document.querySelector(".col, .col.mining")`));
check("흐름 레일 표시", (await q(`document.querySelectorAll("#flow .fseg").length`)) >= 5);
const firstGrp = await q(`(document.querySelector("#board .grph .gt")||{}).textContent||""`);
check("첫 그룹 = 결재 대기(급한 것부터)", firstGrp === "결재 대기", firstGrp);
// ⚠️ 중단된(버림) 실험 렌더는 서랍에도 안 나온다 → 셀 때도 빼야 한다.
//    (안 빼면 "실험은 있는데 서랍이 없다"고 잘못 잡는다 — CI에서만 터졌던 오탐)
check("실험 렌더는 별도 서랍으로 분리", await q(`
  !![...document.querySelectorAll("#board .grph .gt")].find(e=>e.textContent.indexOf("실험")>-1)
  || S.tickets.filter(t=>(t.flags||[]).includes("실험") && !(t.flags||[]).includes("버림")).length===0`));
// 지표·레일·목록이 같은 숫자를 말해야 도구를 믿을 수 있다
const kpiN = await q(`document.querySelector(".kpi .v").textContent`);
const railN = await q(`(document.querySelector("#flow .fseg.act .fv")||{}).textContent||"0"`);
const grpN = await q(`(document.querySelector("#board .grph .gn")||{}).textContent||"0"`);
check("지표·흐름레일·그룹 숫자 일치", kpiN === railN && railN === grpN, `${kpiN}/${railN}/${grpN}`);
check("제목에 마크다운·HTML 잔재 없음", await q(`
  S.tickets.every(t=>!/\\*\\*|<[a-z/]/i.test(t.title))`));

await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(250);
const cards = await q(`document.querySelectorAll("#ideaBody .idea").length`);
check("소재 보드 렌더", cards > 0, `카드 ${cards}건`);
check("카테고리 그룹 표시", (await q(`document.querySelectorAll("#ideaBody .igrp").length`)) > 0);
// 간소화: 승인(✓)·보류(⏸)·반려(✕) 폐지 → 진행/수정/삭제 3개만
check("소재 버튼 3종만(진행·수정·삭제)", await q(`
  [...document.querySelectorAll("#ideaBody .idea")].every(c=>{
    const a=[...c.querySelectorAll(".ibtns [data-ia]")].map(b=>b.dataset.ia).join(",");
    return a==="go,edit,delete"; })`));
check("소재 수정 폼에 항목 이름", await q(`
  [...document.querySelectorAll("#ideaBody .idea .iedit .elab")].length >= 3`));
check("진행·완료 소재는 보드에서 분리", await q(`
  [...document.querySelectorAll("#ideaBody .idea")].every(c=>{
    const i=IDEAS.find(x=>x.id===c.dataset.iid);
    return i && i.status!=="done" && !Number(i.stage||0); })`));
check("수동 새로고침 버튼 제거", await q(`!document.getElementById("ireload")`));
check("칸 나눈 입력 폼 제거(제목·이유·출처)", await q(`
  !document.getElementById("na-t") && !document.getElementById("na-w") && !document.getElementById("na-s")`));
check("작업 표시줄 존재(평소엔 숨김)", await q(`
  !!document.getElementById("jobbar") && document.getElementById("jobbar").offsetParent===null`));

// 회사 = 조직도 먼저, 팀을 눌러야 원칙이 열린다
await page.click('.tab[data-v="company"]');
await page.waitForTimeout(250);
check("조직도 정점 = CEO", await q(`!!document.querySelector(".org .onode.ceo")`));
check("CEO 아래 총괄 → 5개 본부", (await q(`document.querySelectorAll(".odivs .odiv").length`)) >= 5
  && (await q(`!!document.querySelector(".org .onode.lead")`)));
check("보고 계통선 표시", (await q(`document.querySelectorAll(".org .ostem").length`)) >= 2);
// [hidden] 은 CSS display 지정에 덮이기 쉽다 → '보이는가'로 확인한다
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
// 실제 데이터가 보여야 한다 — 목록만 있으면 보관함이 아니다
await page.click(".folder .fitem .fsum");
await page.waitForTimeout(300);
check("보관함 항목을 펴면 캡션 전문", await q(`!!document.querySelector(".fitem[open] .cap")`));
check("보관함에 저장소 원본 링크", (await q(`document.querySelectorAll(".fitem[open] .flink").length`)) > 0);
check("보관함에 카드 실물 썸네일", (await q(`document.querySelectorAll(".folder img.fthumb").length`)) > 0);

// 성과 — 데이터가 없어도 '왜 없는지'와 '어떻게 채우는지'가 있어야 한다
await page.click('.tab[data-v="perf"]');
await page.waitForTimeout(250);
check("성과 탭 내용 표시", await q(`
  document.querySelectorAll("#view-perf .prow").length > 0
  || !!document.querySelector("#view-perf .allclear")`));
check("성과가 비면 채우는 방법 안내", await q(`
  document.querySelectorAll("#view-perf .prow").length > 0
  || /직접 입력|IG_ACCESS_TOKEN/.test(document.getElementById("view-perf").textContent)`));

await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(200);

console.log("\n[A. 미연결 — 읽기 전용]");
check("저장바가 연결 필요 표시", (await q(`document.getElementById("savestate").textContent`)).includes("연결 필요"));
check("읽기 전용 안내 노출", await q(`!document.getElementById("igate").hidden`));
check("조작 도구가 잠김", await q(`document.querySelector(".askpanel").classList.contains("locked")`));
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
check("조작 잠금 해제", await q(`!document.querySelector(".askpanel").classList.contains("locked")`));

const idA = await q(`document.querySelector("#ideaBody .idea").dataset.iid`);
await page.click(`.idea[data-iid="${idA}"] .ib.ed`);
await page.waitForTimeout(150);
await page.fill(`.idea[data-iid="${idA}"] .e-t`, "스모크 수정본");
await page.click(`.idea[data-iid="${idA}"] .iedit .sv`);
await page.waitForTimeout(1100);
check("수정 → 화면 반영", (await q(`document.querySelector('.idea[data-iid="${idA}"] .it').textContent`)).includes("스모크 수정본"));

// 지시함 — 칸을 나누지 않고 한 곳에 적으면 알아서 접수한다
check("지시함이 자유 입력창 하나", await q(`
  !!document.getElementById("ask") && !document.getElementById("na-t")`));
await page.fill("#ask", "스모크 신규 소재");
await page.click("#asksend");
await page.waitForTimeout(1400);
check("짧은 한 줄 → 소재로 등록", (await q(`document.querySelectorAll("#ideaBody .idea").length`)) === cards + 1);
check("접수 결과를 그 자리에서 알려줌", (await q(`document.getElementById("askhint").textContent`)).length > 3);
check("보낸 것 기록에 남음", (await q(`document.querySelectorAll("#asklog .askitem").length`)) > 0);

await page.fill("#ask", "https://example.com/news 이 기사로 카드 만들어줘");
await page.click("#asksend");
await page.waitForTimeout(1300);

await page.click("#askmine");
await page.waitForTimeout(1400);
// 진행 중에는 같은 버튼을 다시 못 누른다 — 중복 요청이 쌓이지 않게
check("작업 중 버튼 잠금·표시줄 노출", await q(`
  (function(){ jobStart("t1","테스트 작업");
    const b=document.querySelector('[data-job="mine"]');
    const locked=!!b && b.disabled;
    const bar=!document.getElementById("jobbar").hidden;
    jobEnd("t1"); return locked===false ? bar : (locked && bar); })()`));
const puts = await q(`window.__puts.map(p=>p.path.split("/contents/")[1]||p.path)`);
const wrote = (f) => puts.some((p) => p.startsWith(f));
check("소재 변경이 ideas.json에 기록", wrote("research/ideas.json"), puts.join(" "));
check("발굴·지시가 결정 로그에 기록", wrote("research/decisions-inbox.md"));
check("링크·자료가 INBOX.md에 기록", wrote("research/INBOX.md"));
check("저장 성공 표시", (await q(`document.getElementById("savestate").textContent`)).includes("저장됨"));

// ── 소재 → 파이프라인 배관 (이번 개편의 핵심)
console.log("\n[D. 소재 → 파이프라인 배관]");
const idG = await q(`document.querySelector("#ideaBody .idea .ib.go").closest(".idea").dataset.iid`);
await page.click(`.idea[data-iid="${idG}"] .ib.go`);
await page.waitForTimeout(1300);
check("진행 → 소재에 stage가 붙는다", (await q(`(IDEAS.find(x=>x.id==="${idG}")||{}).stage`)) >= 1);
check("진행하면 소재 보드에서 빠진다(파이프라인으로 이동)",
  !(await q(`!!document.querySelector('.idea[data-iid="${idG}"]')`)));
const goPut = await q(`
  (function(){ const p=window.__puts.filter(x=>x.path.indexOf("ideas.json")>-1).pop();
    if(!p) return ""; try{ return decodeURIComponent(escape(atob(p.body))); }catch(e){ return ""; } })()`);
check("진행이 ideas.json 본문에 실제로 반영", /"stage":\s*1/.test(goPut), goPut.slice(0, 60));

// ── 학습 루프: 삭제 사유가 곧 학습 신호 (승인·보류·반려 폐지 후의 단일 경로)
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
const idC = await q(`document.querySelector("#ideaBody .idea").dataset.iid`);
await page.click(`.idea[data-iid="${idC}"] .ib.dl`); // prompt 자동 응답
await page.waitForTimeout(1900);
check("첫 PUT이 409여도 재시도로 저장 성공",
  (await q(`document.getElementById("savestate").textContent`)).includes("저장됨"),
  await q(`document.getElementById("savestate").textContent`));
check("재시도가 실제로 일어남", (await q(`window.__try`)) >= 2, `시도 ${await q(`window.__try`)}회`);

/* ⚠️ 오너가 실제로 본 실패(2026-07-26): "저장 실패 · decisions-inbox.md · 409 · 재시도 5회 실패"
 * 원인은 GitHub의 읽기 캐시다 — 브랜치 이름으로 읽으면 방금 바뀐 파일도 몇 초간 **옛 sha**를 준다.
 * 그 옛 sha로 저장하면 계속 409. 아래는 그 상황 그대로를 흉내내 재현한다:
 *   브랜치로 읽으면 STALE, 지금 커밋(git/ref)으로 읽으면 FRESH, PUT은 FRESH만 받는다.
 * 브랜치로 읽는 구현이면 100% 실패하고, 커밋으로 읽는 구현만 통과한다. */
// 앞 절에서 걸어둔 저장이 아직 날아다닐 수 있다 → 가라앉힌 뒤에 측정한다(검사끼리 오염 금지)
await page.waitForTimeout(700);
await q(`
  window.__putOk = 0; window.__usedStale = 0;
  GH._chain = Promise.resolve();
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") {
      const mine = path.indexOf("cachecheck.md") > -1;      // 이 검사가 건 저장만 센다
      if ((opts.body||{}).sha !== "FRESH") { if(mine) window.__usedStale++; throw new Error('GitHub 409 · { "message": "does not match" }'); }
      if(mine) window.__putOk++;
      return {};
    }
    if (path.indexOf("/git/ref/heads/") > -1) return { object: { sha: "HEAD9" } };
    if (path.indexOf("/contents/") > -1) {
      const fresh = path.indexOf("ref=HEAD9") > -1;   // 커밋으로 읽었나
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

// ── 결정함: 결정할 일이 실제로 모이는가
console.log("\n[F. 결정함]");
await page.click('.tab[data-v="today"]');
await page.waitForTimeout(300);
const inboxN = await q(`document.querySelectorAll("#inboxBody .dcard").length`);
/* 배지는 **전체 건수**를 말해야 한다 — 화면은 6건까지만 펼치고 나머지는 '더 보기'로 접힌다.
 * (보이는 카드 수와 배지를 비교하면 7건째부터 항상 틀린다) */
check("결정함 탭 배지 = 결정할 일 전체 건수", await q(`
  document.getElementById("tabN").hidden
  || document.getElementById("tabN").textContent === String(pendingDecisions().length)`),
  await q(`document.getElementById("tabN").textContent + " vs " + pendingDecisions().length`));
check("결정함은 상한(6)까지만 펼친다", await q(`
  document.querySelectorAll("#inboxBody .dcard").length === Math.min(6, pendingDecisions().length)`));
check("같은 카드가 결정함에 두 번 뜨지 않음", await q(`
  (function(){ const k=(s)=>String(s||"").replace(/\\s+/g,"").toLowerCase();
    const ts=pendingDecisions().map(d=>d.label+"|"+k(d.title));
    return new Set(ts).size === ts.length; })()`));
const allClear = await q(`!!document.querySelector("#inboxBody .allclear")`);
check("결정함이 결정 대기를 모으거나 '없음'을 명시", inboxN > 0 || allClear, `카드 ${inboxN}건`);
if (inboxN > 0) {
  await page.click("#inboxBody .dcard");
  await page.waitForTimeout(300);
  check("결정함 카드를 누르면 해당 화면으로 이동", await q(`
    document.getElementById("view-board").classList.contains("on")
    || document.getElementById("view-ideas").classList.contains("on")`));
}

// ── 왕복 검사 (2026-07-26 신설)
// 이번 사태의 근본 원인: 나는 "저장소에 요청이 갔나"만 봤고,
// **그걸 다시 읽었을 때 화면에 반영되는가**는 한 번도 안 봤다.
// 그래서 오너는 [중단]을 눌러도 새로고침하면 되살아나는 화면을 봤다.
console.log("\n[G. 왕복 — 쓴 것이 다시 읽어도 반영되는가]");
await q(`closeDrawer && closeDrawer()`);
await page.waitForTimeout(300);
await q(`
  // 저장소에 '중단' 기록이 이미 있는 상태를 흉내낸다
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
const dropTitle = await q(`window.__dropped.title`);
await q(`refreshFromRepo()`);
await page.waitForTimeout(900);
check("저장소의 '중단' 기록이 화면에 반영됨(배포를 안 기다림)", await q(`
  (S.tickets.find(t=>t.title===window.__dropped.title)||{}).flags.includes("버림")`), dropTitle);
await page.click('.tab[data-v="board"]');
await page.waitForTimeout(300);
check("중단된 건은 파이프라인 목록에서 사라짐", await q(`
  ![...document.querySelectorAll("#board .row .rt")].some(e=>e.textContent.indexOf(window.__dropped.title)>-1)`));

// 보관함 링크는 '있는 파일'만 걸려 있어야 한다 — 없는 파일에 링크하면 전부 404다
await page.click('.tab[data-v="archive"]');
await page.waitForTimeout(250);
check("보관함 링크가 저장소에 없는 파일을 가리키지 않음", await q(`
  [...document.querySelectorAll(".flink")].every(a =>
    !/\\/data\\/(out|content)\\//.test(a.getAttribute("href")||""))`));

/* ── H. "언제까지 기다려?"가 다시 안 나오게 (2026-07-26 오너 질문 3건)
 * 근원은 화면이 '대기 중'이라고만 쓰고 **누가·언제**를 말하지 않은 것이었다.
 * 그러니 여기서 검사할 것은 "칸이 있는가"가 아니라 **말이 구체적인가**다. */
console.log("\n[H. 시킨 일이 어디까지 왔는지 말하는가]");
await page.click('.tab[data-v="today"]');
await page.waitForTimeout(300);
const hasReq = await q(`(STATE.requests||[]).length > 0`);
check("요청 대장을 화면이 읽는다", await q(`typeof REQS !== "undefined"`));
if (hasReq) {
  check("'내가 시킨 일' 칸이 보인다", await q(`document.getElementById("reqsec").offsetParent !== null`));
  check("각 줄에 담당(누가)이 적혀 있다", await q(`
    [...document.querySelectorAll("#reqBody .reqrow")].length > 0 &&
    [...document.querySelectorAll("#reqBody .reqrow")].every(r=>(r.querySelector(".rwho")||{}).textContent)`));
  check("각 줄에 언제 되는지가 적혀 있다", await q(`
    [...document.querySelectorAll("#reqBody .reqrow")].every(r=>((r.querySelector(".rwhen")||{}).textContent||"").length > 6)`));
  check("사람이 해야 하는 일엔 넘길 방법을 준다", await q(`
    [...document.querySelectorAll("#reqBody .reqrow.hand")].every(r=>
      [...r.querySelectorAll(".ract .itool")].some(b=>/넘길|지시서/.test(b.textContent)))`));
}
// 화면 어디에도 "그냥 기다리라"는 말은 없어야 한다 — 그게 이 사태의 원인이었다
check("'대기 중'처럼 주체 없는 말이 결정함·요청함에 없다", await q(`
  !/재작업 지시 후 대기 중/.test(
    (document.getElementById("inboxBody")||{}).textContent + (document.getElementById("reqBody")||{}).textContent)`));

// 지시함에 "자료 찾아줘"라고 적으면 → 검색어를 뽑아 **수집을 실제로 실행**해야 한다
await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(250);
await q(`
  window.__disp=[]; window.__reqPut=0;
  GH._chain = Promise.resolve();
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (path.indexOf("/dispatches") > -1) { window.__disp.push(opts.body||{}); return {}; }
    if (opts.method === "PUT") { if(path.indexOf("requests.json")>-1) window.__reqPut++; return {}; }
    if (path.indexOf("/git/ref/heads/") > -1) return { object: { sha: "H" } };
    if (path.indexOf("/contents/") > -1) {
      const isReq = path.indexOf("requests.json") > -1;
      const body = isReq ? JSON.stringify({items:[]}) : "# 기존";
      return { sha:"s", content: btoa(unescape(encodeURIComponent(body))) };
    }
    return {};
  };
  document.getElementById("ask").value = "전세가율 지도, 전세난 정도 등 전세 관련 데이터 찾아줘";
`);
await page.click("#asksend");
await page.waitForTimeout(1400);
check("'자료 찾아줘'가 실제 수집 실행으로 이어진다", await q(`
  window.__disp.some(d=>(d.inputs||{}).query)`), await q(`JSON.stringify(window.__disp)`));
check("뽑아낸 검색어에 지시 동사가 안 섞인다", await q(`
  window.__disp.every(d=>!/찾아|모아|해줘/.test(((d.inputs||{}).query)||""))`),
  await q(`(window.__disp[0]||{inputs:{}}).inputs.query||""`));
check("시킨 일이 요청 대장에 기록된다", (await q(`window.__reqPut`)) >= 1);

/* ── I. 완성 카드가 오너 손에 닿는가 (2026-07-26 "제작된 카드는 어딨는거야?") ── */
console.log("\n[I. 완성 카드 전달]");
await q(`closeDrawer && closeDrawer()`);
await page.click('.tab[data-v="board"]');
await page.waitForTimeout(300);
const dlTicket = await q(`(S.tickets.find(t=>t.stage===4 && t.caption && t.setLabel)||{}).id||""`);
if (dlTicket) {
  await q(`openDrawer(${JSON.stringify(dlTicket)})`);
  await page.waitForTimeout(300);
  check("결재 화면에 원본 내려받기 링크(수동 업로드용)", await q(`
    [...document.querySelectorAll("#drawer .dlrow a.dl")].length >= 1
    && [...document.querySelectorAll("#drawer .dlrow a.dl")].every(a=>(a.getAttribute("href")||"").indexOf("download/")===0)`));
  check("캡션 복사 버튼", await q(`!!document.querySelector('#drawer [data-act="copycap"]')`));
  await q(`closeDrawer()`);
}
const wkTicket = await q(`(S.tickets.find(t=>t.stage>=1&&t.stage<=2&&!(t.flags||[]).includes("버림"))||{}).id||""`);
if (wkTicket) {
  await q(`openDrawer(${JSON.stringify(wkTicket)})`);
  await page.waitForTimeout(300);
  check("제작 단계에 [제작 지시문 복사] — 사람이 시켜야 함을 화면이 말한다", await q(`
    !!document.querySelector('#drawer [data-act="copywork"]')`));
  check("'만드는 중'이라는 거짓 문구 없음", await q(`
    !/카드를 만드는 중입니다/.test(document.querySelector("#drawer .stagenote").textContent)`));
  await q(`closeDrawer()`);
}

/* ── J. 관제탑 단독 제작 (2026-07-26 "대시보드에서 제작 명령을 못 내리잖아") ──
 * 빌더 있는 세트 = 버튼이 있고, 누르면 제작 워크플로가 실제로 걸린다.
 * 빌더 없는 것 = 거짓 버튼 대신 "작업 세션 필요"를 말한다. */
console.log("\n[J. 관제탑 단독 제작]");
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
await page.click(".fremake[data-remake]");
await page.waitForTimeout(900);
check("버튼을 누르면 제작 워크플로가 실제로 걸림", await q(`
  window.__made.some(p=>p.indexOf("produce-card.yml")>-1)`), await q(`JSON.stringify(window.__made)`));

/* ── K. 연결 안내가 실제로 필요한 권한을 말하는가 (2026-07-27 모바일 연결) ──
 * Contents만 안내하면 토큰을 그대로 만든 오너는 "연결됐는데 제작·발굴 버튼이 안 먹는" 상태가 된다.
 * 관제탑이 워크플로를 dispatch 하므로 Actions 권한이 반드시 필요하다. */
console.log("\n[K. 연결 안내·검사]");
await q(`GH.setToken(""); renderConn(); document.getElementById("connpop").classList.add("on");`);
await page.waitForTimeout(200);
const popTxt = await q(`document.getElementById("connpop").textContent`);
check("필요한 권한 2개를 모두 안내(Contents·Actions)",
  /Contents/.test(popTxt) && /Actions/.test(popTxt), popTxt.slice(0, 80));
check("기기마다 붙여넣어야 함을 안내(모바일 연동)", /기기마다/.test(popTxt));
check("휴대폰 단계 안내 존재", await q(`!!document.querySelector("#connpop .connsteps")`));
// 권한이 모자란 토큰이면 '연결됨'으로 끝내지 않고 알려주는가
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

/* ── L. 밀린 일 한번에 넘기기 (2026-07-27 오너 요청) ──
 * 건마다 복사하면 채팅을 여러 번 열어야 한다. 하루 한 번으로 끝나야 한다. */
console.log("\n[L. 밀린 일 묶음]");
await q(`closeDrawer && closeDrawer()`);
await page.click('.tab[data-v="today"]');
await page.waitForTimeout(300);
const backlog = await q(`pendingWork().length`);
check("밀린 일을 세어서 알려준다", backlog >= 0 && typeof backlog === "number", `${backlog}건`);
if (backlog > 0) {
  check("밀린 일 묶음 칸이 보인다", await q(`document.getElementById("handoff").offsetParent !== null`));
  check("개수를 화면에 적는다", (await q(`document.getElementById("handoffN").textContent`)).includes(String(backlog)));
  const txt = await q(`allHandoffText()`);
  check("지시문에 모든 건이 번호로 들어간다",
    txt.includes("1)") && (backlog < 2 || txt.includes("2)")), txt.split("\n")[0]);
  check("지시문에 오보 0 규칙이 들어간다", txt.includes("코드로 추출"));
  check("지시문에 등록 규칙이 들어간다", txt.includes("builders.json"));
  // 눌러서 실제로 복사되는가 (클립보드를 가로채 확인)
  await q(`window.__copied=""; navigator.clipboard.writeText = async (t) => { window.__copied = t; };`);
  await page.click("#handoffBtn");
  await page.waitForTimeout(400);
  check("버튼을 누르면 지시문 전체가 복사된다",
    (await q(`window.__copied.length`)) > 50 && (await q(`window.__copied.indexOf("관제탑에 밀려 있는 일")`)) > -1);
}

/* 소재 보드는 2026-07-27부터 **주제가 아니라 발행 주기**로 묶인다.
 * 여기서 지키려는 것: ① 칸이 주기로 서 있고 ② 오너가 화면에서 주기를 바꿀 수 있고
 * ③ 새로 들어온 소재가 엉뚱한 칸(정기·데일리, 제작 완료)에 처박히지 않는다. */
console.log("\n[M. 소재 정리 — 정기/일회 주기별]");
await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(300);
const catKeys = await q(`ICATS.map(c=>c.key).join(",")`);
check("칸이 발행 주기로 서 있다", ["daily", "weekly", "monthly", "quarter", "yearly", "once", "todo"]
  .every((k) => catKeys.split(",").includes(k)), catKeys);
check("칸마다 무슨 뜻인지 한 줄 설명", (await q(`document.querySelectorAll("#ideaBody .igrp .gnote").length`)) > 0);
check("소재마다 자료가 자동 갱신되는지 표시", (await q(`document.querySelectorAll("#ideaBody .ifeed").length`)) > 0);
check("새로 들어온 소재는 '분류 대기'로 간다(데일리·제작완료 칸에 처박히지 않음)",
  (await q(`pickCat("아무 말이나 던진 소재")`)) === "todo");
check("주기를 말하면 알아듣는다", (await q(`pickCat("이거 매달 낼 거야")`)) === "monthly"
  && (await q(`pickCat("이번 한 번만이면 돼")`)) === "once");
// 화면에서 주기를 바꿀 수 있어야 '분류 대기'를 비울 수 있다
const idCad = await q(`document.querySelector("#ideaBody .idea").dataset.iid`);
await page.click(`.idea[data-iid="${idCad}"] .ib.ed`);
await page.waitForTimeout(200);
check("✎ 수정에 발행 주기 선택칸이 있다",
  await q(`!!document.querySelector('.idea[data-iid="${idCad}"] .e-c')`));
// 앞 절들이 GH.api를 갈아끼워 왔다 → 여기서 쓰기를 다시 받아 적는 판을 깐다
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

/* 발행은 **오너가 직접** 한다(2026-07-27). 그러면 시스템이 발행 사실을 아는 길은
 * 오너가 눌러 주는 버튼 하나뿐이다. 그 버튼이 없어서 "발행 0건"이라는 거짓 보고가 나왔다.
 * 여기서 지키는 것: ① 버튼이 있고 ② 눌리면 대기열이 체크되고 ③ 완성본 보관이 실제로 걸린다. */
console.log("\n[N. 발행 완료 — 수동 업로드 기록]");
await q(`closeDrawer && closeDrawer()`);
await page.click('.tab[data-v="board"]');
await page.waitForTimeout(300);
/* ⚠️ 대기 중인 건이 0일 수도 있다 — 오너가 다 올렸으면 그게 정상이다.
 *    "항상 하나는 있다"고 가정하면, 일을 다 끝낸 날 검사가 빨간불이 된다(2026-07-29 실제). */
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

  // 눌렀을 때 저장소에 무엇이 쓰이는지 — 요소가 아니라 결과를 본다
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
// 버튼 자체는 대기 건 유무와 무관하게 화면에 심어져 있어야 한다
check("[✅ 올렸습니다] 배선이 화면에 있다", await q(`
  typeof markUploaded === "function" && document.documentElement.innerHTML.indexOf('data-act="posted"') > -1`));
check("자동 업로드를 하는 척하지 않는다", await q(`
  !/인스타에 자동으로 올라갑|자동 발행됩니다|업로드 중입니다/.test(document.body.innerText)`));
check("성과 화면이 발행 이력을 따로 말한다",
  (await q(`document.getElementById("view-perf").innerHTML`)).includes("발행 이력"));
if (postedN > 0) {
  // 올린 건은 '발행됨'으로 굳어 보여야 한다 — 다시 올리라고 재촉하면 안 된다
  check("발행 확인된 건은 결정함에 '올릴 차례'로 다시 뜨지 않는다", await q(`
    (function(){ const labels=(STATE.published||[]).filter(p=>p.confirmed).map(p=>p.label);
      return !S.tickets.some(t=>labels.indexOf(t.setLabel)>-1
        && pendingDecisions().some(d=>d.label==="올릴 차례" && d.title===t.title)); })()`));
  check("성과 화면에 발행 건수가 적힌다",
    (await q(`document.getElementById("view-perf").innerHTML`)).includes(`${postedN}건`), `${postedN}건`);
}

check("콘솔·페이지 오류 없음", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${fail ? "❌" : "✅"} ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
