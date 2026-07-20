/**
 * 디자인 검수 에이전트 — 렌더된 카드의 실제 좌표를 측정해 레이아웃 문제를 자동 검출한다.
 * "눈으로 보고 넘어가던" 정렬·여백·넘침 검수를 코드로 강제한다(품질검수·디자인팀 도구).
 *
 * 검출 항목:
 *  - overflow: 요소가 카드 밖으로 삐져나감(텍스트 넘침 등)
 *  - numalign: 숫자 열(값/보조)의 우측 정렬이 행마다 어긋남
 *  - rightskew: 숫자 블록이 우측에 치우쳐 이름과의 중앙 빈 띠가 큼
 *  - rowclip: 마지막 행이 푸터/카드와 겹침
 *
 * 사용: renderer 패키지에서 tsx src/qaCli.ts <content.json>
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadTemplate } from "./loadTemplate.js";
import { renderPageHtml } from "./renderHtml.js";
import { getBrowser } from "./screenshot.js";
import type { ContentDoc } from "./types.js";

export interface Finding {
  level: "error" | "warn";
  code: string;
  msg: string;
}

interface Geo {
  card: Rect;
  innerW: number;
  innerLeft: number;
  innerRight: number;
  rows: {
    name: Rect | null;
    nameTextRight: number | null;
    nameTrunc: boolean;
    val: Rect | null;
    sub: Rect | null;
  }[];
  overflow: { sel: string; by: number; side: string }[];
  footerTop: number | null;
  lastRowBottom: number | null;
}
interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
}

/** 콘텐츠 1건을 렌더 HTML로 만들고 브라우저에서 기하를 측정해 문제를 반환 */
export async function runDesignQa(contentPath: string): Promise<Finding[]> {
  const doc = JSON.parse(fs.readFileSync(contentPath, "utf8")) as ContentDoc;
  const template = loadTemplate(doc.template);
  const html = renderPageHtml(template, doc as Record<string, unknown>);

  const browser = await getBrowser();
  const ctx = await browser.newContext({
    viewport: { width: template.config.width, height: template.config.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const tmp = path.join(template.dir, `.qa-tmp-${process.pid}.html`);
  fs.writeFileSync(tmp, html, "utf8");
  let geo: Geo;
  try {
    await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
    await page.evaluate("document.fonts && document.fonts.ready");
    // 측정 코드는 문자열로 전달(tsx의 __name 헬퍼가 직렬화되며 깨지는 것 회피)
    geo = (await page.evaluate(MEASURE_JS)) as Geo;
  } finally {
    await ctx.close();
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* noop */
    }
  }
  return analyze(geo);
}

/** 브라우저에서 실행되는 측정 코드(문자열 IIFE) — DOM 좌표를 읽어 Geo를 반환 */
const MEASURE_JS = `(() => {
  var card = document.querySelector(".wirit-card");
  var cb = card.getBoundingClientRect();
  var cs = getComputedStyle(card);
  var padL = parseFloat(cs.paddingLeft) || 0, padR = parseFloat(cs.paddingRight) || 0;
  function rect(el){ if(!el) return null; var r=el.getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width}; }
  function textRight(el){ if(!el) return null; var rg=document.createRange(); rg.selectNodeContents(el); var r=rg.getBoundingClientRect(); return r.right; }
  function truncated(el){ return el ? (el.scrollWidth - el.clientWidth > 1) : false; }
  var rows = Array.prototype.map.call(document.querySelectorAll(".rt-row:not(.rt-colheadrow)"), function(r){
    var nm=r.querySelector(".rt-name");
    return { name:rect(nm), nameTextRight:textRight(nm), nameTrunc:truncated(nm), val:rect(r.querySelector(".rt-val")), sub:rect(r.querySelector(".rt-sub")) };
  });
  var overflow=[];
  Array.prototype.forEach.call(card.querySelectorAll(".rt-name,.rt-val,.rt-sub,.wirit-title,.rt-cap,.wirit-watermark"), function(el){
    var r=el.getBoundingClientRect(); if(!r.width) return;
    if(r.right>cb.right+1) overflow.push({sel:el.className,by:Math.round(r.right-cb.right),side:"right"});
    if(r.bottom>cb.bottom+1) overflow.push({sel:el.className,by:Math.round(r.bottom-cb.bottom),side:"bottom"});
  });
  var footer=card.querySelector(".wirit-footer");
  var lastRow=rows.length?rows[rows.length-1]:null;
  return {
    card:{left:cb.left,right:cb.right,top:cb.top,bottom:cb.bottom,width:cb.width},
    innerW:cb.width-padL-padR, innerLeft:cb.left+padL, innerRight:cb.right-padR,
    rows:rows, overflow:overflow,
    footerTop:footer?footer.getBoundingClientRect().top:null,
    lastRowBottom:(lastRow&&lastRow.name)?lastRow.name.bottom:null
  };
})()`;

/** 측정 결과 → 문제 목록 */
function analyze(g: Geo): Finding[] {
  const out: Finding[] = [];
  const rows = g.rows.filter((r) => r.val || r.name);
  if (!rows.length) return out;

  // 1) 넘침
  g.overflow.forEach((o) =>
    out.push({ level: "error", code: "overflow", msg: `요소가 카드 ${o.side==="right"?"오른쪽":"아래"}로 ${o.by}px 넘침 (.${String(o.sel).split(" ")[0]})` })
  );

  // 2) 숫자열 우측 정렬 일관성 (값/보조 각각 우측 끝이 행마다 같아야)
  const alignCheck = (key: "val" | "sub", label: string) => {
    const xs = rows.map((r) => r[key]?.right).filter((x): x is number => x != null);
    if (xs.length < 2) return;
    const spread = Math.max(...xs) - Math.min(...xs);
    if (spread > 2)
      out.push({ level: "error", code: "numalign", msg: `${label} 열 우측 정렬 어긋남: 행별 우측 끝이 최대 ${Math.round(spread)}px 차이` });
  };
  alignCheck("val", "값(평균연봉 등)");
  alignCheck("sub", "보조(직원수 등)");

  // 3) 우측 치우침 / 중앙 빈 띠 — 값 열 시작이 너무 오른쪽이고, 이름 텍스트 끝과
  //    값 사이의 실제 빈 띠(셀이 아닌 글자 기준)가 크면 경고
  const valLefts = rows.map((r) => r.val?.left).filter((x): x is number => x != null);
  if (valLefts.length) {
    const valColLeft = Math.min(...valLefts);
    const startFrac = (valColLeft - g.innerLeft) / g.innerW;
    const textGaps = rows.map((r) =>
      r.val && r.nameTextRight != null ? r.val.left - r.nameTextRight : 0,
    );
    const maxTextGap = Math.max(...textGaps);
    const gapFrac = maxTextGap / g.innerW;
    if (startFrac > 0.62 && gapFrac > 0.34)
      out.push({
        level: "warn",
        code: "rightskew",
        msg: `숫자 블록이 우측 치우침 — 값 열이 ${Math.round(startFrac * 100)}% 지점에서 시작, 이름 글자 끝과의 빈 띠 최대 ${Math.round(gapFrac * 100)}% (중앙이 비어 보임). 이름 열 폭(--name-w)을 줄이거나 값을 좌측으로.`,
      });
  }

  // 4) 이름 잘림(말줄임 …) — 이름 열 폭 부족
  const trunc = rows.filter((r) => r.nameTrunc).length;
  if (trunc)
    out.push({ level: "warn", code: "truncate", msg: `이름 ${trunc}건이 잘림(…) — 이름 열 폭(--name-w) 부족` });

  // 5) 마지막 행이 푸터와 겹침
  if (g.footerTop != null && g.lastRowBottom != null && g.lastRowBottom > g.footerTop + 1)
    out.push({ level: "error", code: "rowclip", msg: `마지막 행이 푸터와 ${Math.round(g.lastRowBottom - g.footerTop)}px 겹침` });

  return out;
}
