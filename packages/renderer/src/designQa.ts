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
  /** 머리글 ↔ 데이터 행의 열 상자 어긋남 — {tag, col, dx}(px) */
  colSkew: { tag: string; col: number; dx: number }[];
  /** 푸터 바로 위 요소와 푸터 사이 간격(px). null = 해당 요소 없음 */
  footerGap: number | null;
  /** 말줄임으로 잘린 글자 — {sel, text, need, has} */
  clipped: { sel: string; text: string; need: number; has: number }[];
  /** 우상단 뱃지 아래 제목까지 세로 간격(px). 0~29 = 너무 붙음. null = 해당없음/겹침(별도) */
  badgeClear: number | null;
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
  /* ── 뱃지 ↔ 제목 클리어런스(badgeclear) ──
   * 오너 반복 지적(고질병): 제목이 우상단 로고 뱃지에 **붙어 보인다.** 겹침(overlap)만 재면
   * "닿기 직전"은 통과한다 — CARD_CHECKLIST 는 "겹치지 않는 것만으론 부족, 세로 30px 이상"이라 못박았는데
   * 검사는 그 30px 를 안 재고 있었다(2026-07-31 승격). 뱃지와 가로로 겹치는 제목 글자가 뱃지 아래
   * 30px 안으로 들어오면 잡는다. */
  var badgeClear=null;
  if(badge){
    Array.prototype.forEach.call(card.querySelectorAll(".wirit-title,.wirit-subtitle,.wirit-topcap,.sm-sub,.yc-card,.yc-side"), function(el){
      /* 글자도 배경도 없는 빈 상자는 겹쳐도 눈에 안 보인다 — 자리만 잡아 두는 껍데기다.
         2026-07-31: 상단 회색 캡션을 안 쓰기로 하자 .wirit-topcap 이 빈 상자로 남았고,
         Range 가 잡을 글자가 없어 **상자 전체**로 재는 바람에 뱃지와 74px 겹친 것으로 나왔다.
         (그림 요소 .yc-card·.yc-side 는 글자가 없어도 보이므로 대상으로 남긴다) */
      var blank = !(el.textContent||"").trim() && /wirit-(title|subtitle|topcap)|sm-sub/.test(el.className||"");
      if(blank) return;
      var o=overlapOf(badge,el);
      if(o) collisions.push({a:".wirit-corner",b:name(el),x:o.x,y:o.y});
    });
    var brb=badge.getBoundingClientRect();
    var tEl=card.querySelector(".wirit-title");
    if(tEl){
      var tr=contentRect(tEl);
      var xov=Math.min(brb.right,tr.right)-Math.max(brb.left,tr.left);
      if(xov>1){ var gap=tr.top-brb.bottom; if(gap>=0) badgeClear=Math.round(gap); }
    }
  }
  /* ── 글자끼리 겹침 ──
   * 뱃지만 검사하면 **카드 안에서 설명 글이 큰 숫자에 깔리는** 불량을 놓친다
   * (2026-07-30: 추정 배지의 "6개월 실측 +4.6% × 2" 가 "+9.2%" 아래로 들어갔다).
   * 값·라벨류 글자 상자를 서로 대조한다. 조상-자손 관계는 건너뛴다(당연히 겹친다). */
  /* ⚠️ 하단 설명(.sm-total)·푸터 글자도 넣는다. 표가 길어져 이들을 덮는 것이
   * 가장 흔한 불량인데, 처음엔 목록에 없어서 검수가 놓쳤다(2026-07-30).
   * ⚠️ .rt-sub (순위표 보조 열)도 넣는다 — 목록에 없어서 **수주액이 비중을 통째로
   *    덮은 카드가 "문제 없음"으로 통과했다**(2026-07-31). 열 폭(--val-w 176px)보다
   *    긴 값("7조 6,946억")이 옆 칸으로 넘친 것인데, 대조 대상이 아니면 검수는 눈을 감는다.
   *    **검사 목록에서 빠진 요소는 없는 것과 같다.** 순위표에 열을 더하면 여기도 더한다.
   *    (이 주석 안에서는 역따옴표를 쓰지 않는다 — 이 블록 전체가 템플릿 리터럴이다) */
  var LEAF = ".yc-val,.yc-solid-val,.yc-tag,.yc-card .l,.yc-card .v," +
             ".yc-axis span,.yc-lidx,.sm-asof," +
             ".sm-gu,.sm-val .h,.sm-val .r,.sm-total,.sm-insight,.sm-tailnote .tx," +
             ".wirit-footer span,.rt-name,.rt-val,.rt-sub,.mc-fn," +
             /* record-grid — 새 템플릿을 만들고 여기 추가하지 않아 이 카드의 글자가
                통째로 겹침 검사 밖에 있었다(AS팀 지적 2026-07-31). 템플릿을 만들면 여기도 만진다. */
             ".rg-r .claim,.rg-r .fig .v,.rg-r .fig .p,.rg-note,.rg-lead .lb,.rg-lead .dt,.rg-lead .vl," +
             /* map-rank·metro-2col — 2026-07-31. 두 템플릿의 글자가 통째로 검사 밖에 있었다.
                제목을 칸에 꽉 차게 키우는 변경을 하면서 올린다 — 커진 제목이 평형 뱃지·지도와
                부딪히는지는 사람 눈이 아니라 좌표가 판정해야 한다.
                (.mr-wm·.m2-wm 워터마크는 일부러 뒤에 깔린 장식이라 넣지 않는다) */
             ".mr-title .tx,.mr-pyeong b,.mr-hr span,.mr-rank,.mr-gu,.mr-apt,.mr-price," +
             ".m2-hr span,.m2-seg,.m2-val," +
             /* sinbundang-map — 노선도형 지도 카드(2026-07-31). 새 템플릿을 만들면 글자 요소를
                여기 등록해야 겹침 검사가 실제로 잰다(빠뜨리면 검사받지 않은 것). */
             ".sbm-stn,.sbm-danji,.sbm-price .v,.sbm-price .sz,.sbm-note," +
             /* danji-brief — 청약단지 브리핑(2026-08-01). */
             ".db-title .ln,.db-credit,.db-fb .w,.db-fb .sub," +
             ".db-nm .n,.db-nm .loc,.db-nm .lgtx," +
             ".db-s .l,.db-s .v,.db-hr span,.db-row span," +
             ".db-sc .l,.db-sc .d,.db-tnote,.db-note," +
             /* sinbundang-loop — 노선 접이형 정보카드(2026-07-31). */
             ".slp-stn,.slp-danji,.slp-meta,.slp-priceB,.slp-name,.slp-gu,.slp-top";
  var leaves = Array.prototype.slice.call(card.querySelectorAll(LEAF));
  for (var i=0;i<leaves.length;i++) for (var j=i+1;j<leaves.length;j++) {
    var a=leaves[i], b=leaves[j];
    if(a.contains(b)||b.contains(a)) continue;
    var o=overlapOf(a,b);
    if(o) collisions.push({a:name(a),b:name(b),x:o.x,y:o.y});
  }
  /* ── 지수 뱃지 ↔ 막대 겹침 (barclip) ──
   * 오너 규칙(2026-07-30): 지수 원형 뱃지는 **막대와 겹치지 않는다.**
   * 두 축(수준 vs 변화율)이 겹쳐 보이면 독자가 어느 축의 숫자인지 알 수 없다.
   * ⚠️ 막대 안에 **일부러** 넣는 글자(.yc-solid-val, .yc-tag, .yc-val.inside)는 대상이 아니다. */
  Array.prototype.forEach.call(card.querySelectorAll(".yc-lidx"), function(lb){
    Array.prototype.forEach.call(card.querySelectorAll(".yc-bar"), function(br){
      var o=overlapOf(lb,br);
      if(o) collisions.push({a:".yc-bar",b:".yc-lidx",x:o.x,y:o.y});
    });
  });
  /* ── 머리글 ↔ 데이터 행 열 정렬 (colalign) ──
   * 오너가 **두 번** 지적한 항목이다(07-20 순위표, 07-30 토허제 표).
   * 머리글 행과 데이터 행은 각자 다른 grid 다. 열을 둘 다 \`auto\` 로 두면
   * 머리글은 라벨 폭("월세 상승분"), 행은 값 폭("+38만원")으로 **각자** 계산해 어긋난다.
   * 눈으로는 "조금 오른쪽" 정도로 보여 넘어가기 쉬우므로 좌표로 못박는다.
   * 재는 것은 **글자가 아니라 열 상자**다 — 상자 안 정렬(가운데/왼쪽/오른쪽)은 별개 결정이다. */
  var colSkew=[];
  [["표 머리글", ".sm-rank .rh3", ".sm-rank .sm-row"],
   ["순위표 머리글", ".rt-colheadrow", ".rt-row:not(.rt-colheadrow)"],
   /* danji-brief — 머리글과 행이 같은 grid 변수(--c)를 보게 만들어 뒀지만,
      "그렇게 만들었다"와 "실제로 맞는다"는 다르다. 재는 쪽에도 올린다. */
   ["단지표 머리글", ".db-hr", ".db-row"]].forEach(function(pair){
    var head=card.querySelector(pair[1]);
    var row=card.querySelector(pair[2]);
    if(!head||!row) return;
    var hc=head.children, rc=row.children;
    var n=Math.min(hc.length, rc.length);
    for(var i=0;i<n;i++){
      var a=hc[i].getBoundingClientRect(), b=rc[i].getBoundingClientRect();
      if(!a.width||!b.width) continue;
      var dx=Math.max(Math.abs(a.left-b.left), Math.abs(a.right-b.right));
      if(dx>2) colSkew.push({tag:pair[0], col:i+1, dx:Math.round(dx)});
    }
  });
  /* ── 잘린 글자(말줄임) ──
   * 2026-07-31: 표 열 폭을 조정하다 "현대14차(203,204,205,206동)" 이 조용히 "…" 로 잘렸다.
   * 기존 truncate 검사는 .rt-name 만 봐서 map-rank 의 단지명은 아무도 재지 않았다.
   * (이 주석 안에서는 역따옴표를 쓰지 않는다 — 이 블록 전체가 템플릿 리터럴이다)
   * text-overflow:ellipsis 를 쓰는 칸은 **잘렸는지 좌표로** 확인한다 — 눈으로는 그럴듯해 보인다. */
  var clipped=[];
  Array.prototype.forEach.call(card.querySelectorAll(".mr-apt,.mr-gu,.m2-seg,.rt-name,.sm-gu,.db-nm .n,.db-nm .loc,.db-row span"), function(el){
    if(el.scrollWidth - el.clientWidth > 1)
      clipped.push({sel:name(el), text:(el.textContent||"").trim().slice(0,24), need:Math.ceil(el.scrollWidth), has:Math.ceil(el.clientWidth)});
  });
  var footer=card.querySelector(".wirit-footer");
  /* 푸터 바로 위 요소와의 간격 — 붙어 있으면 답답해 보인다(오너 반복 지적).
   * 흐름 배치라 '겹침'은 안 생기므로 기존 rowclip 이 못 잡는다. */
  var footerGap=null;
  if(footer){
    /* .rg-note 를 빠뜨려 record-grid 에서는 이 검사가 아무것도 안 재고 있었다(AS팀 지적 2026-07-31).
       "최하단 문구 여백"은 오너가 두 번 말한 항목인데 새 템플릿에 적용되지 않은 상태였다. */
    var above=card.querySelectorAll(".sm-total,.sm-insight,.yc-axis,.rt-cap,.rg-note,.mr-row:last-child,.m2-r:last-child,.sbm-note,.db-note,.slp-note");
    var ft=footer.getBoundingClientRect().top, bot=null;
    Array.prototype.forEach.call(above, function(el){
      var r=el.getBoundingClientRect();
      if(!r.height) return;
      if(bot===null||r.bottom>bot) bot=r.bottom;
    });
    if(bot!==null) footerGap=Math.round(ft-bot);
  }
  /* ── 머리 부분(아이덴티티) 규격 ──
   * 2026-07-31: 지도를 키우려고 map-board 가 카드 패딩 72→44, 코너 뱃지를
   * 검은 판에서 투명 글자로 바꿔 놨다. **다른 발행본과 윗부분이 눈에 띄게 달라졌고**
   * 오너가 나란히 놓고서야 알아챘다. 좌표로 잴 수 있는 것은 사람 눈에 맡기지 않는다.
   * 배경색·뱃지 글자 크기·카드 위 패딩 셋을 재서 공용 기본값과 대조한다. */
  var head=null;
  if(badge){
    var bcs=getComputedStyle(badge);
    var markEl=badge.querySelector(".mark");
    head={
      badgeBg: bcs.backgroundColor,
      badgeMarkPx: markEl ? Math.round(parseFloat(getComputedStyle(markEl).fontSize)) : null,
      cardPadTop: Math.round(parseFloat(cs.paddingTop)||0)
    };
  }
  /* ── 제목 아래 숨 ──
   * 2026-07-31 오너 지적 "제목과 표 헤드라인이 너무 붙어있어".
   * 제목은 카드 폭을 채우도록 자동으로 커지는데(fitTitle), 글자가 커지면 **그 아래 여백이
   * 함께 줄어든다** — 여백을 건드린 적이 없어도 붙는다. 제목만 보면 문제가 안 보이고,
   * 제목과 다음 덩어리를 같이 봐야 보인다. 그래서 사람 눈이 놓치기 쉬운 자리다.
   * 제목 상자 아래끝과 그 다음 형제 요소의 윗끝 사이를 잰다. */
  var titleGap=null, titlePx=null;
  var tEl=card.querySelector(".wirit-title");
  if(tEl){
    titlePx=Math.round(parseFloat(getComputedStyle(tEl).fontSize)||0);
    /* 제목이 감싸개(.bg-head 등) 안에 있으면 그 감싸개가 흐름상의 형제 단위다. */
    var block=tEl.parentElement && tEl.parentElement!==card ? tEl.parentElement : tEl;
    var next=block.nextElementSibling;
    while(next && !next.getBoundingClientRect().height) next=next.nextElementSibling;
    if(next && !next.classList.contains("wirit-footer")){
      titleGap=Math.round(next.getBoundingClientRect().top - block.getBoundingClientRect().bottom);
    }
  }
  /* ── 'AI티' 타일 ──
   * 오너 지적 2회(2026-07-30 jeongbi-board, 2026-07-31 record-grid).
   * 07-30 에 CEO.md 에 원칙을 적어 두고도 07-31 에 같은 걸 또 만들었다 —
   * 글로 적은 기준은 내가 안 읽으면 없는 것과 같아서, 재는 쪽으로 내린다.
   * 무엇을 재나: **큰 라운드(≥20px) + 옅은 회색 채움**을 가진 덩어리가 3개 이상 반복되는가.
   * 셋이 모여야 '어느 서비스에나 있는 UI 카드'가 된다 — 하나짜리 강조 상자는 문제가 아니다.
   * 흰색·투명·짙은 배경(잉크 띠, 검은 뱃지)은 제외한다. 회색 채움만 본다. */
  var tiles=[];
  Array.prototype.forEach.call(card.querySelectorAll("*"), function(el){
    var s=getComputedStyle(el), r=el.getBoundingClientRect();
    if(r.width<120||r.height<60) return;
    var rad=parseFloat(s.borderTopLeftRadius)||0;
    if(rad<20) return;
    /* getComputedStyle 의 backgroundColor 는 항상 "rgb(r, g, b)" / "rgba(r, g, b, a)" 다.
       정규식을 쓰지 않는 이유: 이 스크립트는 템플릿 문자열 안에 들어가 브라우저로 넘어가는데
       거기서 역슬래시가 한 번 먹혀 패턴이 깨진다(2026-07-31 실제로 깨졌다). 잘라 쓴다. */
    var bg=s.backgroundColor||"";
    var open=bg.indexOf("("), close=bg.indexOf(")");
    if(open<0||close<0) return;
    var parts=bg.slice(open+1, close).split(",").map(function(x){return parseFloat(x);});
    if(parts.length<3||parts.some(isNaN)) return;
    var a=parts.length>3?parts[3]:1;
    if(a<0.02) return;                       // 투명 — 채움이 아니다
    var R=parts[0],G=parts[1],B=parts[2];
    /* 반투명 잉크(rgba(20,24,33,0.06))는 종이 위에서 옅은 회색으로 보인다 → 종이와 합성해서 판단 */
    var pr=250,pg=250,pb=248;
    var er=R*a+pr*(1-a), eg=G*a+pg*(1-a), eb=B*a+pb*(1-a);
    var mx=Math.max(er,eg,eb), mn=Math.min(er,eg,eb);
    if(mx-mn>18) return;                     // 색이 있다 — 브랜드 강조 상자로 본다
    if(mx>246) return;                       // 종이와 같다 — 채움이 아니다
    if(mx<170) return;                       // 짙다 — 잉크 띠/뱃지
    tiles.push(Math.round(rad));
  });
  /* ── 문구 ↔ 수치 위계 ──
   * 오너 지시(2026-07-31): "중요한 건 숫자가 아니라 '역대 1위' 같은 내용이야."
   * 이건 취향이 아니라 **재서 지킬 수 있는 규칙**이다 — 기록 문구가 수치보다 작아지면
   * 카드가 다시 숫자 자랑이 된다. 두 글자 크기를 재서 뒤집힘을 잡는다. */
  var hier=null;
  var claimEl=card.querySelector(".rg-r .claim"), figEl=card.querySelector(".rg-r .fig .v");
  if(claimEl&&figEl){
    hier={
      claimPx: Math.round(parseFloat(getComputedStyle(claimEl).fontSize)||0),
      figPx:   Math.round(parseFloat(getComputedStyle(figEl).fontSize)||0)
    };
  }
  var lastRow=rows.length?rows[rows.length-1]:null;
  return {
    head:head, titleGap:titleGap, titlePx:titlePx, aiTiles:tiles, hier:hier,
    card:{left:cb.left,right:cb.right,top:cb.top,bottom:cb.bottom,width:cb.width},
    innerW:cb.width-padL-padR, innerLeft:cb.left+padL, innerRight:cb.right-padR,
    rows:rows, overflow:overflow, collisions:collisions,
    footerTop:footer?footer.getBoundingClientRect().top:null,
    lastRowBottom:(lastRow&&lastRow.name)?lastRow.name.bottom:null,
    colSkew:colSkew, footerGap:footerGap, clipped:clipped, badgeClear:badgeClear
  };
})()`;

/** 측정 결과 → 문제 목록 */
function analyze(g: Geo): Finding[] {
  const out: Finding[] = [];

  /* 0-a) 머리 부분이 공용 규격인가 — 계정의 카드는 윗부분이 같아야 시리즈로 읽힌다.
   * 기준값은 templates/_shared/base.css: 뱃지 배경 = 잉크네이비(불투명),
   * 뱃지 글자 36px, .wirit-card 위 패딩 72px. */
  /* 수준을 warn 으로 둔 이유: 이 검수를 켠 날(2026-07-31) 이미 나가 있던 카드
   * 여러 장(index-2026·maprank·estate-cover)이 같은 방식으로 어긋나 있었다.
   * error 로 두면 **손대면 안 되는 발행본** 때문에 내보내기가 통째로 막힌다.
   * 새 카드·고치는 카드는 이 warn 이 뜨면 반드시 맞춘다 — 표지형(전면 사진)은 예외다. */
  /* 0-b) 제목과 그 아래 덩어리가 붙지 않았는가 (오너 지적 2026-07-31) —
   * 제목을 키우면 여백을 건드리지 않아도 아래가 좁아진다.
   * 문턱 28px: 이 지적이 나온 판이 20px 이었고 고친 판이 60px 이다. 그 사이에서
   * '확실히 좁다'는 쪽만 잡도록 낮게 잡았다 — 여백은 디자인 선택의 폭이 넓어
   * 문턱을 높이면 멀쩡한 카드까지 시끄러워진다.
   * warn 인 이유는 brandhead 와 같다: 이미 나간 카드를 막지 않기 위해서다. */
  const tg = (g as any).titleGap, tpx = (g as any).titlePx;
  if (tg !== null && tg !== undefined && tg < 28)
    out.push({ level: "warn", code: "titlegap",
      msg: `제목과 바로 아래 요소의 간격이 ${tg}px 입니다${tpx ? ` (제목 ${tpx}px)` : ""} — 제목을 키우면 아래 여백이 함께 줄어듭니다. 28px 이상을 권합니다` });

  /* 0-b2) 뱃지 ↔ 제목 클리어런스 (badgeclear) — 오너 반복 지적한 "제목이 로고에 붙는" 고질병.
   * error 로 둔다: overlap(badgeclip)은 이미 error 인데, "닿기 직전"만 통과하던 구멍을 막는 것이므로
   * 같은 급으로 취급한다. 제목 폭을 꽉 채우면 우측이 뱃지 아래로 오므로 세로 30px 는 반드시 띄운다. */
  const bc = (g as any).badgeClear;
  if (bc !== null && bc !== undefined && bc < 30)
    out.push({ level: "error", code: "badgeclear",
      msg: `제목이 우상단 로고 뱃지 아래 ${bc}px 로 붙어 있습니다 — 세로 30px 이상 띄우세요(제목 블록 위 여백↑ 또는 제목 축소). CARD_CHECKLIST §2` });

  /* 0-c) 'AI티' 타일 (오너 지적 2026-07-30 · 2026-07-31 — 두 번째라 검수로 내렸다)
   * 문턱 3개: 하나짜리 강조 상자는 디자인이고, 셋이 나란히 반복되면 UI 카드가 된다.
   * warn 인 이유는 brandhead·titlegap 과 같다 — 이미 나간 카드를 막지 않는다. */
  const tiles = (g as any).aiTiles as number[] | undefined;
  if (tiles && tiles.length >= 3)
    out.push({ level: "warn", code: "aicard",
      msg: `큰 라운드(${Math.min(...tiles)}~${Math.max(...tiles)}px) + 옅은 회색 채움 덩어리가 ${tiles.length}개 반복됩니다 — 어느 서비스에나 있는 UI 카드로 읽힙니다(CEO.md "AI티 금지"). 채움을 걷고 괘선·여백으로 나누세요` });

  /* 0-d) 기록 문구가 수치보다 작아지지 않았는가 (오너 지시 2026-07-31)
   * 문턱을 '같거나 크다'로 두지 않고 **1.15배**로 잡았다 — 비슷한 크기면 둘 다 주인공이 되어
   * 위계가 사라진다. 주인공은 하나여야 한다. */
  const hr = (g as any).hier;
  if (hr && hr.claimPx && hr.figPx && hr.claimPx < hr.figPx * 1.15)
    out.push({ level: "warn", code: "hierarchy",
      msg: `기록 문구 ${hr.claimPx}px 가 수치 ${hr.figPx}px 에 비해 작습니다 — 이 카드의 주인공은 '역대 1위' 같은 문구이고 수치는 증거입니다(CEO.md). 문구를 수치의 1.15배 이상으로 두세요` });

  const h = (g as any).head;
  if (h) {
    const transparent = !h.badgeBg || /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)|transparent/.test(h.badgeBg);
    if (transparent)
      out.push({ level: "warn", code: "brandhead",
        msg: "우상단 wirit 뱃지 배경이 비었습니다 — 공용 규격은 잉크네이비 판입니다(base.css .wirit-corner). 템플릿에서 재정의했는지 확인하세요" });
    if (h.badgeMarkPx !== null && Math.abs(h.badgeMarkPx - 36) > 2)
      out.push({ level: "warn", code: "brandhead",
        msg: `우상단 뱃지 글자 ${h.badgeMarkPx}px — 공용 규격 36px 과 다릅니다` });
    /* 위 여백은 **줄이는 쪽만** 잡는다. 더 넉넉히 두는 것은 디자인 선택이고
     * (발행본 tohuh-rent-map 이 92px 이다), 문제는 그래픽 자리를 벌려고 머리를
     * 깎아 다른 카드보다 좁아지는 경우다. */
    if (h.cardPadTop < 70)
      out.push({ level: "warn", code: "brandhead",
        msg: `카드 위 여백 ${h.cardPadTop}px — 공용 규격 72px 보다 좁습니다. 그래픽을 키우려고 머리를 줄이지 않습니다` });
  }

  // 0) 넘침·겹침 — 템플릿 종류와 무관하게 항상 검사한다
  g.overflow.forEach((o) =>
    out.push({ level: "error", code: "overflow", msg: `요소가 카드 ${o.side==="right"?"오른쪽":"아래"}로 ${o.by}px 넘침 (.${String(o.sel).split(" ")[0]})` })
  );
  (g.collisions || []).forEach((c) =>
    out.push({
      level: "error",
      code: c.a === ".wirit-corner" ? "badgeclip" : c.a === ".yc-bar" ? "barclip" : "textclip",
      msg: `${c.b} 가 ${c.a} 와 겹침 (가로 ${c.x}px · 세로 ${c.y}px) — 여백을 늘리거나 글자를 줄이세요`,
    })
  );

  /* 1) 머리글 ↔ 데이터 열 어긋남 — 오너가 두 번 지적한 항목이라 error 로 둔다.
   *    고치는 법: 두 grid 의 열 정의를 **같게** 하고, `auto` 열은 고정 폭으로 못박는다. */
  /* 잘린 글자는 **error**. warn 으로 두면 흘러가고, 흘러가면 카드에 "…" 가 나간다.
   * 고치는 법은 칸을 넓히거나 글자를 줄이는 것 — 둘 다 5분이면 된다. */
  (g.clipped || []).forEach((c) =>
    out.push({
      level: "error",
      code: "clipped",
      msg: `${c.sel} 글자가 잘렸습니다 — "${c.text}" (필요 ${c.need}px · 칸 ${c.has}px). 칸을 넓히거나 글자를 줄이세요`,
    })
  );

  (g.colSkew || []).forEach((c) =>
    out.push({
      level: "error",
      code: "colalign",
      msg: `${c.tag} ${c.col}번째 열이 데이터 행과 ${c.dx}px 어긋남 — 머리글과 행의 grid 열 정의를 같게 하고 auto 열은 고정 폭으로 (auto 는 각자 내용 폭으로 계산돼 어긋납니다)`,
    })
  );

  /* 2) 푸터 바로 위 요소가 푸터에 붙음 — 겹치진 않지만 답답해 보인다(오너 반복 지적).
   *    흐름 배치라 rowclip 이 못 잡는 자리다. 미학 항목이므로 warn. */
  const FOOTER_GAP_MIN = 14;
  if (g.footerGap != null && g.footerGap < FOOTER_GAP_MIN)
    out.push({
      level: "warn",
      code: "footergap",
      msg: `푸터 바로 위 요소와의 간격이 ${g.footerGap}px (최소 ${FOOTER_GAP_MIN}px) — 하단 주석·축에 margin-bottom 을 주세요`,
    });

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
