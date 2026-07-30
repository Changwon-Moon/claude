/**
 * 디자인 검수 에이전트 — 렌더된 카드의 실제 좌표를 측정해 레이아웃 문제를 자동 검출한다.
 * "눈으로 보고 넘어가던" 정렬·여백·넘침 검수를 코드로 강제한다(품질검수·디자인팀 도구).
 *
 * 검출 항목:
 *  - overflow: 요소가 카드 밖으로 삐져나감(텍스트 넘침 등)
 *  - numalign: 숫자 열(값/보조)의 우측 정렬이 행마다 어긋남
 *  - rightskew: 숫자 블록이 우측에 치우쳐 이름과의 중앙 빈 띠가 큼
 *  - rowclip: 마지막 행이 푸터/카드와 겹침
 *  - badgeclip: 제목·상단 요소가 **우상단 wirit 로고 뱃지와 겹침**
 *      (2026-07-30 추가: 오너가 "이건 자동 검수 했어야지"라고 지적한 항목.
 *       제목을 가운데 정렬하거나 길게 쓰면 뱃지 아래로 파고드는데, 카드 바깥으로
 *       나가지 않으니 overflow 검사에 안 걸렸다. 겹침은 넘침과 다른 종류의 불량이다.)
 *  - overlap: 서로 겹치면 안 되는 요소쌍이 겹침(제목↔플롯, 값 라벨↔축 등)
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
  /** 겹친 요소쌍 — {a, b, x, y} = 가로·세로 겹침량(px) */
  collisions: { a: string; b: string; x: number; y: number }[];
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
    // 렌더와 동일하게 폰트 로딩 후 레이아웃 훅(제목 폭 맞춤)을 적용한 상태를 측정
    await page.evaluate("window.__wiritFit && window.__wiritFit()");
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
  /* ── 겹침 검사 ──
   * 카드 밖으로 안 나가도 서로 덮으면 불량이다. 우상단 로고 뱃지가 대표적으로,
   * 제목이 그 아래로 파고들면 로고나 글자 중 하나가 반드시 상한다. */
  var collisions=[];
  /* ⚠️ 글자 요소는 **상자**가 아니라 **글자**로 재야 한다.
   * .wirit-topcap 은 뱃지 자리를 비우려고 padding-right:190px 를 두는데,
   * 상자로 재면 그 여백이 뱃지와 겹쳐 오탐이 난다(첫 실행에서 그랬다).
   * Range 로 실제 글리프 박스를 잡으면 "여백은 겹쳐도 글자는 안 겹친다"를 구분한다. */
  function contentRect(el){
    var r=el.getBoundingClientRect();
    var hasText=(el.textContent||"").trim().length>0;
    if(!hasText) return r;
    try{
      var rg=document.createRange(); rg.selectNodeContents(el);
      var tr=rg.getBoundingClientRect();
      return (tr.width>0&&tr.height>0)?tr:r;
    }catch(e){ return r; }
  }
  function overlapOf(a,b){
    if(!a||!b) return null;
    var ra=contentRect(a), rb=contentRect(b);
    if(!ra.width||!rb.width) return null;
    var x=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
    var y=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
    return (x>1&&y>1)?{x:Math.round(x),y:Math.round(y)}:null;
  }
  function name(el){ return "."+String(el.className||el.tagName).split(" ")[0]; }
  var badge=card.querySelector(".wirit-corner");
  if(badge){
    Array.prototype.forEach.call(card.querySelectorAll(".wirit-title,.wirit-subtitle,.wirit-topcap,.sm-sub,.yc-card,.yc-side"), function(el){
      var o=overlapOf(badge,el);
      if(o) collisions.push({a:".wirit-corner",b:name(el),x:o.x,y:o.y});
    });
  }
  /* ── 글자끼리 겹침 ──
   * 뱃지만 검사하면 **카드 안에서 설명 글이 큰 숫자에 깔리는** 불량을 놓친다
   * (2026-07-30: 추정 배지의 "6개월 실측 +4.6% × 2" 가 "+9.2%" 아래로 들어갔다).
   * 값·라벨류 글자 상자를 서로 대조한다. 조상-자손 관계는 건너뛴다(당연히 겹친다). */
  /* ⚠️ 하단 설명(.sm-total)·푸터 글자도 넣는다. 표가 길어져 이들을 덮는 것이
   * 가장 흔한 불량인데, 처음엔 목록에 없어서 검수가 놓쳤다(2026-07-30). */
  var LEAF = ".yc-val,.yc-solid-val,.yc-tag,.yc-card .t,.yc-card .n,.yc-card .v," +
             ".yc-idx .k,.yc-idx .ym,.yc-idx .v,.yc-axis span,.yc-lpt,.yc-lleg,.yc-snote," +
             ".sm-gu,.sm-val .h,.sm-val .r,.sm-total,.sm-insight,.sm-tailnote .tx," +
             ".wirit-footer span,.rt-name,.rt-val,.mc-fn";
  var leaves = Array.prototype.slice.call(card.querySelectorAll(LEAF));
  for (var i=0;i<leaves.length;i++) for (var j=i+1;j<leaves.length;j++) {
    var a=leaves[i], b=leaves[j];
    if(a.contains(b)||b.contains(a)) continue;
    var o=overlapOf(a,b);
    if(o) collisions.push({a:name(a),b:name(b),x:o.x,y:o.y});
  }
  var footer=card.querySelector(".wirit-footer");
  var lastRow=rows.length?rows[rows.length-1]:null;
  return {
    card:{left:cb.left,right:cb.right,top:cb.top,bottom:cb.bottom,width:cb.width},
    innerW:cb.width-padL-padR, innerLeft:cb.left+padL, innerRight:cb.right-padR,
    rows:rows, overflow:overflow, collisions:collisions,
    footerTop:footer?footer.getBoundingClientRect().top:null,
    lastRowBottom:(lastRow&&lastRow.name)?lastRow.name.bottom:null
  };
})()`;

/** 측정 결과 → 문제 목록 */
function analyze(g: Geo): Finding[] {
  const out: Finding[] = [];

  // 0) 넘침·겹침 — 템플릿 종류와 무관하게 항상 검사한다
  g.overflow.forEach((o) =>
    out.push({ level: "error", code: "overflow", msg: `요소가 카드 ${o.side==="right"?"오른쪽":"아래"}로 ${o.by}px 넘침 (.${String(o.sel).split(" ")[0]})` })
  );
  (g.collisions || []).forEach((c) =>
    out.push({
      level: "error",
      code: c.a === ".wirit-corner" ? "badgeclip" : "textclip",
      msg: `${c.b} 가 ${c.a} 와 겹침 (가로 ${c.x}px · 세로 ${c.y}px) — 여백을 늘리거나 글자를 줄이세요`,
    })
  );

  /* 아래 검사들은 순위표(ranking-table) 전용이다 — 행이 없으면 여기서 끝낸다.
   * ⚠️ 이 return 이 위쪽에 있었기 때문에 순위표가 아닌 카드는 **넘침 검사조차
   *    돌지 않았다**(2026-07-30 발견). 공통 검사는 return 앞으로 옮겼다. */
  const rows = g.rows.filter((r) => r.val || r.name);
  if (!rows.length) return out;

  // 1b) 안쪽 여백(패딩) 침범 — 카드 바깥으로 넘치진 않아도 내용이 좌우 안전 여백을
  //     넘어 테두리/여백 영역까지 밀고 들어가면(줄이 '선을 넘는' 상태) error.
  //     바깥 경계(overflow)보다 먼저 잡히는, 더 엄격한 검수항이다.
  const TOL = 1;
  const crosses = (r: Rect | null) =>
    r && (r.right > g.innerRight + TOL || r.left < g.innerLeft - TOL);
  const worst = { by: 0 };
  rows.forEach((r) => {
    ([r.val, r.sub, r.name] as (Rect | null)[]).forEach((c) => {
      if (crosses(c) && c) {
        const by = Math.max(c.right - g.innerRight, g.innerLeft - c.left);
        if (by > worst.by) worst.by = Math.round(by);
      }
    });
  });
  if (worst.by > TOL)
    out.push({
      level: "error",
      code: "padcross",
      msg: `내용이 카드 안쪽 여백(패딩 선)을 최대 ${worst.by}px 침범 — 열 폭(--name-w/--val-w/--sub-w)이나 열 간격(--col-gap)을 줄여 표가 안전 영역 안에 들어오게 하세요`,
    });

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
