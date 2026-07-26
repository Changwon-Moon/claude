/**
 * 관제탑 전 버튼 시뮬레이션 — 화면의 모든 조작을 실제로 눌러보고 결과를 확인한다.
 * 스모크가 "핵심 경로가 도는가"를 보는 것이라면, 이건 "아무거나 눌렀을 때 깨지는가"를 본다.
 */
import { createRequire } from "node:module";
const require = createRequire(new URL("../packages/renderer/package.json", import.meta.url));
const { chromium } = require("playwright-core");

import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = "file://" + resolve(process.argv[2] || join(ROOT, "packages/tower-worker/_site/index.html"));
import { existsSync } from "node:fs";
const PINNED = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const browser = await chromium.launch(existsSync(PINNED) ? { executablePath: PINNED } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });

const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + String(e).slice(0, 140)));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE " + m.text().slice(0, 140)); });
page.on("dialog", (d) => d.accept(d.type() === "prompt" ? "시뮬 사유" : undefined));

await page.goto(PAGE);
await page.waitForTimeout(700);

// GitHub 호출을 가로채 실제 커밋 없이 요청만 기록
await page.evaluate(`
  window.__puts=[]; window.__disp=[];
  localStorage.setItem("wirit-gh-token","sim");
  GH.api = async (path, opts) => {
    opts = opts || {};
    if (opts.method === "PUT") { window.__puts.push(path.split("/contents/")[1]||path); return {}; }
    if (path.indexOf("/dispatches")>-1) { window.__disp.push(path); return {}; }
    if (path === "/user") return { login: "sim" };
    if (path.indexOf("/actions/runs")>-1) return { workflow_runs: [] };
    if (path.indexOf("/contents/")>-1) {
      const isJson = path.indexOf(".json")>-1;
      const body = isJson
        ? (path.indexOf("pipeline-state")>-1 ? JSON.stringify({dropped:[]})
           : JSON.stringify({meta:{},cats:STATE.ideas.cats,ideas:STATE.ideas.items}))
        : "# 기존";
      return { sha:"sha", content: btoa(unescape(encodeURIComponent(body))) };
    }
    return {};
  };
  afterConnChange("");
`);
await page.waitForTimeout(400);

const findings = [];
const note = (where, what) => { findings.push(`${where} — ${what}`); };

/** 한 버튼을 눌러보고 새 오류가 생겼는지 본다 */
async function press(label, selector, opts = {}) {
  const before = errors.length;
  const el = await page.$(selector);
  if (!el) { note(label, `버튼을 찾을 수 없음 (${selector})`); return false; }
  const disabled = await el.evaluate((n) => n.disabled === true);
  if (disabled && !opts.allowDisabled) { note(label, "비활성 상태라 못 누름"); return false; }
  try { await el.click({ timeout: 3000, force: !!opts.force }); }
  catch (e) { note(label, "클릭 실패: " + String(e.message).slice(0, 70)); return false; }
  await page.waitForTimeout(opts.wait || 500);
  if (errors.length > before) note(label, "누른 뒤 오류: " + errors[before]);
  return true;
}

const TABS = ["today", "board", "ideas", "company", "archive", "assets"];

// ── 1. 모든 탭을 돌면서 눌리는 것을 다 눌러본다
for (const t of TABS) {
  await page.click(`.tab[data-v="${t}"]`);
  await page.waitForTimeout(350);
  const shown = await page.evaluate(`document.getElementById("view-${t}").classList.contains("on")`);
  if (!shown) note(`탭:${t}`, "탭을 눌러도 화면이 안 바뀜");
  // 이 화면에서 보이는 버튼 개수
  const n = await page.evaluate(`
    [...document.querySelectorAll("#view-${t} button")].filter(b=>b.offsetParent!==null).length`);
  if (n === 0 && t !== "assets") note(`탭:${t}`, "누를 수 있는 게 아무것도 없음");
}

// ── 2. 지표 4칸
await page.click('.tab[data-v="today"]');
for (let i = 0; i < 4; i++) {
  await press(`지표 ${i + 1}`, `.kpi:nth-child(${i + 1})`);
}

// ── 3. 결정함 카드
await page.click('.tab[data-v="today"]');
await page.waitForTimeout(300);
const inboxN = await page.evaluate(`document.querySelectorAll("#inboxBody .dcard").length`);
if (inboxN) {
  await press("결정함 첫 카드", "#inboxBody .dcard");
  const open = await page.evaluate(`document.getElementById("drawer").classList.contains("on")
    || document.getElementById("view-ideas").classList.contains("on")`);
  if (!open) note("결정함 카드", "눌러도 아무 데도 안 감");
  // 드로어가 열렸으면 액션 전부 눌러본다
  if (await page.evaluate(`document.getElementById("drawer").classList.contains("on")`)) {
    const acts = await page.evaluate(`[...drawer.querySelectorAll("[data-act]")].map(b=>b.dataset.act)`);
    for (const a of acts) {
      if (["rsnok", "rsncancel"].includes(a)) continue;
      const ok = await press(`드로어:${a}`, `#drawer [data-act="${a}"]`, { wait: 700 });
      // 이유 상자가 열렸으면 기록하고 진행까지
      if (ok && (await page.evaluate(`!!document.querySelector("#rsnbox.on")`))) {
        await press(`드로어:${a}→기록`, `#drawer [data-act="rsnok"]`, { wait: 1600 });
      }
      if (!(await page.evaluate(`document.getElementById("drawer").classList.contains("on")`))) break;
    }
  }
}
await page.evaluate(`closeDrawer()`);

// ── 4. 파이프라인: 그룹 접기/펴기 + 흐름 레일 + 행 클릭
await page.click('.tab[data-v="board"]');
await page.waitForTimeout(350);
await press("흐름 레일 첫 칸", "#flow .fseg");
await press("그룹 헤더(접기)", "#board .grph");
await press("그룹 헤더(펴기)", "#board .grph");
if (await page.$("#board .row")) {
  await press("파이프라인 행", "#board .row", { wait: 600 });
  const opened = await page.evaluate(`document.getElementById("drawer").classList.contains("on")`);
  if (!opened) note("파이프라인 행", "눌러도 상세가 안 열림");
  await press("드로어 닫기", "#drawer .close");
}

// ── 5. 소재 탭 전 버튼
await page.click('.tab[data-v="ideas"]');
await page.waitForTimeout(350);
await press("새 소재 열기", "#iaddBtn");
await press("새 소재 취소", "#iaddCancel");
await press("새 소재 열기2", "#iaddBtn");
await page.fill("#na-t", "시뮬 소재");
await press("새 소재 저장", "#iaddSave", { wait: 1300 });
await press("소재 수정 열기", "#ideaBody .idea .ib.ed");
await press("소재 수정 취소", "#ideaBody .idea .iedit [data-ia='cancel']");
await press("소재 수정 열기2", "#ideaBody .idea .ib.ed");
await press("소재 수정 저장", "#ideaBody .idea .iedit .sv", { wait: 1300 });
await press("자료 저장(빈 입력)", "#kadd2", { wait: 400 });
await page.fill("#ktext2", "시뮬 자료");
await press("자료 저장", "#kadd2", { wait: 1200 });
await press("새 소재 발굴", "#imineBtn", { wait: 1600 });

// ── 6. 회사: CEO / 팀 노드 / 원칙 편집
await page.click('.tab[data-v="company"]');
await page.waitForTimeout(350);
await press("CEO 노드", ".onode.ceo", { wait: 500 });
const teamNodes = await page.evaluate(`document.querySelectorAll(".onode[data-team]").length`);
if (!teamNodes) note("조직도", "팀 노드가 없음");
for (let i = 0; i < Math.min(teamNodes, 3); i++) {
  await press(`팀 노드 ${i + 1}`, `.onode[data-team]:nth-of-type(1)`, { wait: 350 });
}
const panelOpen = await page.evaluate(`document.querySelectorAll(".tpanel:not([hidden])").length`);
if (panelOpen !== 1) note("조직도", `팀을 눌렀는데 열린 상세가 ${panelOpen}개(1개여야 함)`);
await press("업무기준 수정지시", ".tpanel:not([hidden]) [data-te]", { wait: 300 });
await page.evaluate(`
  const ta=document.querySelector(".tpanel:not([hidden]) textarea"); if(ta) ta.value="시뮬 지시";`);
await press("업무기준 기록", ".tpanel:not([hidden]) [data-te-save]", { wait: 1200 });
await press("팀 상세 닫기", ".tpanel:not([hidden]) [data-teamclose]");

// ── 7. 보관함
await page.click('.tab[data-v="archive"]');
await page.waitForTimeout(350);
const items = await page.evaluate(`document.querySelectorAll(".folder .fitem").length`);
if (!items) note("보관함", "항목이 하나도 없음");
await press("보관함 항목 펼치기", ".folder .fitem .fsum", { wait: 400 });
const bodyShown = await page.evaluate(`!!document.querySelector(".fitem[open] .fbody")`);
if (!bodyShown) note("보관함", "펼쳐도 내용이 안 나옴");
const hasCap = await page.evaluate(`!!document.querySelector(".fitem[open] .cap")`);
const hasFiles = await page.evaluate(`document.querySelectorAll(".fitem[open] .flink").length`);
if (!hasCap) note("보관함", "캡션 전문이 안 보임");
if (!hasFiles) note("보관함", "저장소 원본 링크가 없음");

// ── 8. 연결 팝오버
await press("연결 뱃지", "#connbtn");
const popOpen = await page.evaluate(`document.getElementById("connpop").classList.contains("on")`);
if (!popOpen) note("연결 뱃지", "눌러도 팝오버가 안 열림");
await press("연결 해제", "#conndisc", { wait: 400 });
const off = await page.evaluate(`!GH.connected()`);
if (!off) note("연결 해제", "눌러도 해제되지 않음");

// 결과
const puts = await page.evaluate(`window.__puts`);
console.log("\n■ 저장소 쓰기 시도:", [...new Set(puts)].join(", ") || "(없음)");
console.log("■ 워크플로 실행:", (await page.evaluate(`window.__disp.length`)) + "건");
console.log("\n■ 발견된 문제", findings.length + "건");
for (const f of findings) console.log("  ·", f);
console.log("\n■ 콘솔/페이지 오류", errors.length + "건");
for (const e of [...new Set(errors)].slice(0, 8)) console.log("  ·", e);

await browser.close();
process.exit(findings.length || errors.length ? 1 : 0);
