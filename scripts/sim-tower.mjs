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

/* ⚠️ 아래 두 개는 **직접 page.click/page.fill 을 쓰지 않기 위한** 안전 wrapper 다.
 * 화면이 바뀌어 선택자가 낡으면 playwright 기본 30초 대기 뒤 예외로 죽는데,
 * 그러면 시뮬이 **첫 번째 낡은 선택자에서 멈춰** 나머지를 하나도 못 본다.
 * 더 나쁜 건 그게 배포를 통째로 막는다는 것 — 2026-08-01 에 탭 이름이 today→publish 로
 * 바뀐 뒤 이 스크립트가 죽어 **관제탑이 배포되지 않고 있었고, 그래서 완성본 링크가 404 였다.**
 * 없는 것은 '없다'고 **보고**하고 계속 간다. 판정(종료코드)은 마지막에 한 번에 내린다. */
async function tap(label, selector, wait = 350) {
  try { await page.click(selector, { timeout: 2500 }); await page.waitForTimeout(wait); return true; }
  catch { note(label, `요소를 못 찾음 (${selector}) — 화면이 바뀌었는지 확인`); return false; }
}
async function type(label, selector, text) {
  try { await page.fill(selector, text, { timeout: 2500 }); return true; }
  catch { note(label, `입력칸을 못 찾음 (${selector}) — 화면이 바뀌었는지 확인`); return false; }
}

/** 한 버튼을 눌러보고 새 오류가 생겼는지 본다 */
async function press(label, selector, opts = {}) {
  const before = errors.length;
  const el = await page.$(selector);
  if (!el) {
    /* 데이터가 있어야만 그려지는 것(파이프라인 행·그룹 헤더 등)은 '없음'이 정상 상태다.
       그걸 결함으로 세면 조용한 날마다 배포가 막힌다 — 옵션 표시가 있으면 알리고 넘어간다. */
    if (opts.optional) { console.log(`  · (없음, 정상) ${label}`); return false; }
    note(label, `버튼을 찾을 수 없음 (${selector})`);
    return false;
  }
  const disabled = await el.evaluate((n) => n.disabled === true);
  if (disabled && !opts.allowDisabled) { note(label, "비활성 상태라 못 누름"); return false; }
  try { await el.click({ timeout: 3000, force: !!opts.force }); }
  catch (e) { note(label, "클릭 실패: " + String(e.message).slice(0, 70)); return false; }
  await page.waitForTimeout(opts.wait || 500);
  if (errors.length > before) note(label, "누른 뒤 오류: " + errors[before]);
  return true;
}

/* ⚠️ 탭 목록을 손으로 적어 두면 **검사가 스스로 낡아 배포를 막는다.**
 * 2026-08-01 발견: 관제탑이 '오늘(today)'·'파이프라인(board)' 을 '발행(publish)' 하나로 합쳤는데
 * 이 목록은 옛 이름을 그대로 들고 있었다 → 시뮬이 30초 기다리다 죽고,
 * 그 단계가 tower-deploy 를 막고 있어서 **관제탑이 배포되지 않고 있었다.**
 * (그래서 완성본 링크가 404 였다 — 화면은 고쳤는데 나가질 않았다)
 * 화면에 있는 탭을 **화면에서 읽는다.** 이름이 바뀌어도 따라간다. */
const TABS = await page.evaluate(`[...document.querySelectorAll(".tab")].map(t => t.dataset.v)`);
if (!TABS.length) { console.log("::error::탭을 하나도 찾지 못했습니다 — 화면 구조가 바뀌었는지 확인하세요"); process.exit(1); }
/** 첫 화면(지표·결정함이 있는 탭) — 이름이 today→publish 로 바뀐 적이 있어 고정하지 않는다 */
const HOME = TABS[0];

// ── 1. 모든 탭을 돌면서 눌리는 것을 다 눌러본다
for (const t of TABS) {
  await tap(`탭:${t}`, `.tab[data-v="${t}"]`);
  await page.waitForTimeout(350);
  const shown = await page.evaluate(`document.getElementById("view-${t}").classList.contains("on")`);
  if (!shown) note(`탭:${t}`, "탭을 눌러도 화면이 안 바뀜");
  // 이 화면에 아무것도 없으면 최소한 "왜 비었는지"는 말해줘야 한다.
  // (결정함이 비는 건 정상이다 — 대신 "오늘 결정할 것 없음"이 떠 있어야 한다)
  const alive = await page.evaluate(`
    [...document.querySelectorAll("#view-${t} button")].filter(b=>b.offsetParent!==null).length
    + document.querySelectorAll("#view-${t} .allclear, #view-${t} .empty").length`);
  if (alive === 0 && t !== "assets") note(`탭:${t}`, "아무것도 없고 왜 비었는지 설명도 없음");
}

// ── 2. 지표 4칸
await tap("탭:홈", `.tab[data-v="${HOME}"]`);
for (let i = 0; i < 4; i++) {
  await press(`지표 ${i + 1}`, `.kpi:nth-child(${i + 1})`);
}

// ── 3. 결정함 카드
await tap("탭:홈", `.tab[data-v="${HOME}"]`);
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
await tap("탭:홈", `.tab[data-v="${HOME}"]`); // 파이프라인은 발행 탭 안으로 합쳐졌다
await page.waitForTimeout(350);
await press("흐름 레일 첫 칸", ".fseg", { optional: true });
await press("그룹 헤더(접기)", ".grph", { optional: true });
await press("그룹 헤더(펴기)", ".grph", { optional: true });
if (await page.$(".rows .row", { optional: true })) {
  await press("파이프라인 행", ".rows .row", { optional: true }, { wait: 600 });
  const opened = await page.evaluate(`document.getElementById("drawer").classList.contains("on")`);
  if (!opened) note("파이프라인 행", "눌러도 상세가 안 열림");
  const acts2 = await page.evaluate(`[...drawer.querySelectorAll("[data-act]")].map(b=>b.dataset.act)`);
  if (!acts2.length) note("파이프라인 행", "상세에 아무 액션도 없음(오너가 손을 못 씀)");
  await press("드로어 닫기", "#drawer .close");
}

// ── 5. 소재 탭 전 버튼
await tap("탭:ideas", '.tab[data-v="ideas"]');
await page.waitForTimeout(350);
/* 지시함(#ask/#asksend/#askmine)은 화면에서 사라진 기능이다 — 검사도 함께 걷는다.
 * 없는 기능을 계속 두드리면 결함 9건이 매번 뜨고, 그러면 진짜 결함이 그 속에 묻힌다. */
await press("소재 수정 열기", "#ideaBody .idea .ib.ed", { optional: true });
await press("소재 수정 취소", "#ideaBody .idea .iedit [data-ia='cancel']", { optional: true });
await press("소재 수정 열기2", "#ideaBody .idea .ib.ed", { optional: true });
await press("소재 수정 저장", "#ideaBody .idea .iedit .sv", { wait: 1300, optional: true });

// ── 6. 회사: CEO / 팀 노드 / 원칙 편집
await tap("탭:company", '.tab[data-v="company"]');
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
await tap("탭:archive", '.tab[data-v="archive"]');
await page.waitForTimeout(350);
const items = await page.evaluate(`document.querySelectorAll(".folder .fitem").length`);
if (!items) note("보관함", "항목이 하나도 없음");
await press("보관함 항목 펼치기", ".folder .fitem .fsum", { wait: 400 });
const bodyShown = await page.evaluate(`!!document.querySelector(".fitem[open] .fbody")`);
if (!bodyShown) note("보관함", "펼쳐도 내용이 안 나옴");
const hasCap = await page.evaluate(`!!document.querySelector(".fitem[open] .cap")`);
const hasFiles = await page.evaluate(`document.querySelectorAll(".fitem[open] .flink").length`);
const deadLinks = await page.evaluate(`
  [...document.querySelectorAll(".flink")].filter(a=>/\\/data\\/(out|content)\\//.test(a.getAttribute("href")||"")).length`);
if (deadLinks) note("보관함", `저장소에 없는 파일로 가는 링크 ${deadLinks}개(404)`);
const shots = await page.evaluate(`document.querySelectorAll(".fitem[open] .fstrip img").length`);
if (!shots && !hasFiles) note("보관함", "펼쳐도 실물도 링크도 없음");
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
