/**
 * TowerState → 정적 관제탑 HTML(자체 완결).
 * 데이터는 주입되고, 이 파일은 그 데이터를 보는 방식(디자인 시스템 + 화면)을 정의한다.
 */
import type { TowerState } from "./types.js";

const CSS = String.raw`
/* ══════════════════════════════════════════════════════════════
   wirit 관제탑 — 디자인 시스템
   ──────────────────────────────────────────────────────────────
   원칙 1. 색은 신호다. 화면의 95%는 잉크·종이·회색이고,
           코발트는 "당신의 결정이 필요하다"에만, 빨강은 "막혔다"에만 쓴다.
   원칙 2. 무게는 주의력을 따라간다. 결재가 필요한 항목만 크고,
           진행 상황은 한 줄로 조용히 흐른다.
   원칙 3. 화면은 자라지 않는다. 목록은 접히고, 스크롤은 각자의 상자 안에서.
   ══════════════════════════════════════════════════════════════ */

/* 카드와 같은 Pretendard. 파일이 없으면 시스템 폰트로 조용히 내려앉는다. */
@font-face{
  font-family:"Pretendard"; font-weight:45 920; font-style:normal; font-display:swap;
  src:url("fonts/PretendardVariable.woff2") format("woff2-variations");
}

:root{
  --ink:#12151B; --paper:#F6F7F9; --card:#FFFFFF; --text:#12151B;
  --muted:#66707E; --faint:#98A2B0;
  --line:rgba(18,21,27,.11); --hair:rgba(18,21,27,.07); --band:rgba(18,21,27,.045);
  --cobalt:#2E6BFF; --red:#E5484D; --ok:#12855C; --warn:#B27400;
  --r:10px; --r-lg:14px;
  --shadow:0 1px 2px rgba(18,21,27,.05), 0 8px 24px -12px rgba(18,21,27,.16);
}
@media (prefers-color-scheme: dark){
  :root{ --ink:#0C0F14; --paper:#0F1218; --card:#161A22; --text:#E9ECF1;
    --muted:#98A4B4; --faint:#6C7788;
    --line:rgba(233,236,241,.13); --hair:rgba(233,236,241,.08); --band:rgba(233,236,241,.05);
    --shadow:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -12px rgba(0,0,0,.6); }
}
:root[data-theme="dark"]{ --ink:#0C0F14; --paper:#0F1218; --card:#161A22; --text:#E9ECF1;
  --muted:#98A4B4; --faint:#6C7788;
  --line:rgba(233,236,241,.13); --hair:rgba(233,236,241,.08); --band:rgba(233,236,241,.05); }
:root[data-theme="light"]{ --ink:#12151B; --paper:#F6F7F9; --card:#FFFFFF; --text:#12151B;
  --muted:#66707E; --faint:#98A2B0;
  --line:rgba(18,21,27,.11); --hair:rgba(18,21,27,.07); --band:rgba(18,21,27,.045); }

*{box-sizing:border-box;margin:0}
html,body{height:100%}
body{
  font-family:"Pretendard","Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif;
  background:var(--paper); color:var(--text);
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  font-feature-settings:"tnum" 1; /* 숫자 폭 고정 — 표가 흔들리지 않게 */
  letter-spacing:-.011em;
}
button{font:inherit;cursor:pointer;border:none;background:none;color:inherit;letter-spacing:inherit}
button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{
  outline:2px solid var(--cobalt);outline-offset:2px;border-radius:6px}
input,textarea,select{font-family:inherit}
.num{font-variant-numeric:tabular-nums;letter-spacing:-.02em}
/* 섹션 라벨 — 신문 섹션 표기처럼 작게, 넓게 */
.eyebrow{font-size:10.5px;font-weight:700;letter-spacing:.11em;color:var(--faint);text-transform:uppercase}

/* ── 상단 바 ── */
.topbar{position:sticky;top:0;z-index:40;background:var(--ink);color:#fff;
  display:flex;align-items:center;gap:12px;padding:0 20px;height:52px}
.mark{font-weight:800;font-size:19px;letter-spacing:-.035em}
.mark .dot{color:var(--cobalt)}
.topbar .sub{font-size:12px;color:rgba(255,255,255,.5);font-weight:600;letter-spacing:0}
.topbar .date{margin-left:auto;font-size:12.5px;color:rgba(255,255,255,.6);font-variant-numeric:tabular-nums}
.badge-live{font-size:9.5px;font-weight:800;letter-spacing:.1em;
  border:1px solid rgba(255,255,255,.24);color:rgba(255,255,255,.7);border-radius:4px;padding:2px 6px}

/* 연결 뱃지 — 한 번 연결하면 볼 일이 없으므로 최소 크기 */
.conn{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;
  border-radius:999px;padding:5px 11px;border:1px solid rgba(255,255,255,.16);
  color:rgba(255,255,255,.62);background:rgba(255,255,255,.05);transition:.15s}
.conn:hover{border-color:rgba(255,255,255,.4);color:#fff}
.conn .led{width:6px;height:6px;border-radius:50%;background:#E5A000;flex:none}
.conn.on .led{background:#31C48D}
.connpop{position:fixed;top:58px;right:14px;z-index:70;width:min(392px,calc(100vw - 28px));
  background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:var(--r-lg);
  padding:16px;box-shadow:var(--shadow);display:none;flex-direction:column;gap:10px}
.connpop.on{display:flex}
.connpop h3{font-size:14px;font-weight:800}
.connpop .who{font-size:12px;color:var(--muted);word-break:break-all;font-variant-numeric:tabular-nums}
.connpop input{font:inherit;font-size:13px;border:1px solid var(--line);border-radius:var(--r);
  background:var(--paper);color:var(--text);padding:10px 12px;width:100%}
.connpop .hint{font-size:11.5px;color:var(--muted);line-height:1.65}
.connpop .hint a{color:var(--cobalt)}
.connpop .dim{color:var(--faint)}
.connpop .connsteps{border:1px solid var(--line);border-radius:var(--r);padding:9px 11px;font-size:12px}
.connpop .connsteps summary{cursor:pointer;font-weight:800;font-size:12.5px}
.connpop .connsteps ol{margin:8px 0 6px;padding-left:18px;line-height:1.85;color:var(--muted)}
.connpop .connsteps b{color:var(--text)}
.connpop .row{display:flex;gap:8px}
.connpop .row button{flex:1;font-size:12.5px;font-weight:700;border-radius:var(--r);padding:9px;
  border:1px solid var(--line);color:var(--text)}
.connpop .row button.prim{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.connpop .row button.dgr{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}

/* ── 지표 레일 ── 4칸 박스가 아니라 한 줄의 활자. 필요한 것만 색을 얻는다. */
.kpis{display:flex;align-items:stretch;background:var(--card);border-bottom:1px solid var(--line)}
.kpi{flex:1;padding:13px 20px;display:flex;flex-direction:column;gap:1px;
  border-right:1px solid var(--hair);text-align:left;transition:background .15s}
.kpi:last-child{border-right:none}
.kpi:hover{background:var(--band)}
.kpi .v{font-size:25px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.035em;line-height:1.05}
.kpi.hot .v{color:var(--cobalt)}
.kpi .l{font-size:11.5px;color:var(--text);font-weight:700;margin-top:3px}
.kpi .n{font-size:10.5px;color:var(--faint);font-weight:500}

/* ── 탭 ── 이모지 없이 활자로. 숫자는 옆에 조용히. */
.tabs{display:flex;gap:2px;padding:0 14px;background:var(--card);
  border-bottom:1px solid var(--line);position:sticky;top:52px;z-index:30}
.tab{font-size:13px;font-weight:700;color:var(--muted);padding:12px 13px 11px;
  border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
.tab:hover{color:var(--text)}
.tab.on{color:var(--text);border-bottom-color:var(--ink)}
.tab .c{font-size:10.5px;font-weight:800;color:#fff;background:var(--cobalt);
  border-radius:999px;padding:1px 6px;margin-left:5px;font-variant-numeric:tabular-nums}
.view{display:none}
.view.on{display:block}
.notice{font-size:12px;color:var(--muted);padding:10px 20px 0;display:flex;gap:10px;flex-wrap:wrap}

/* ══ 결정함 — 첫 화면 ══ */
.inbox{padding:18px 20px 24px;max-width:1040px}
.inbox h2{font-size:16px;font-weight:800;letter-spacing:-.02em;display:flex;align-items:center;gap:9px;margin-bottom:12px}
.inbox h2 .n{font-size:11px;font-weight:800;color:#fff;background:var(--cobalt);
  border-radius:999px;padding:2px 8px;font-variant-numeric:tabular-nums}
.dlist{display:flex;flex-direction:column;gap:7px}
/* 결정 행 — 왼쪽 거터에 종류 표기, 신문 기사 배열처럼 */
.dcard{width:100%;text-align:left;display:grid;grid-template-columns:auto 1fr auto;
  align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);
  border-radius:var(--r-lg);padding:12px 14px;transition:border-color .15s,transform .15s,box-shadow .15s}
.dcard:hover{border-color:color-mix(in srgb,var(--cobalt) 40%,var(--line));transform:translateY(-1px);box-shadow:var(--shadow)}
.dcard .dth{width:42px;height:53px;border-radius:6px;border:1px solid var(--hair);
  object-fit:cover;object-position:top;flex:none;background:var(--band)}
.dcard .dm{min-width:0}
.dcard .dk{font-size:10px;font-weight:800;letter-spacing:.1em;color:var(--faint);display:block;margin-bottom:3px}
.dcard.pub .dk{color:var(--cobalt)}
.dcard .dt{font-size:14.5px;font-weight:700;line-height:1.4;letter-spacing:-.018em;
  overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.dcard .dw{font-size:11.5px;color:var(--muted);margin-top:3px;font-variant-numeric:tabular-nums}
.dcard .go{font-size:17px;color:var(--faint);flex:none}
.allclear{display:flex;flex-direction:column;gap:6px;background:var(--card);
  border:1px solid var(--line);border-radius:var(--r-lg);padding:22px 20px}
.allclear .t{font-size:15px;font-weight:800;letter-spacing:-.02em}
.allclear .w{font-size:12.5px;color:var(--muted);line-height:1.7}

/* ══ 내가 시킨 일 ══
   왼쪽 색 띠 하나로 "지금 누구 손에 있는지"를 말한다.
     파랑 = 기계가 돌고 있다 · 노랑 = 사람 차례다 · 초록 = 끝났다
   글로 다 읽지 않아도 색만 보고 알 수 있어야 한다. */
.reqlead{font-size:12.5px;color:var(--muted);line-height:1.7;margin:-6px 0 12px}
#reqBody{display:flex;flex-direction:column;gap:8px}
.reqrow{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--faint);
  border-radius:var(--r-lg);padding:12px 14px}
.reqrow.run{border-left-color:var(--cobalt)}
.reqrow.hand{border-left-color:var(--warn)}
.reqrow.ok{border-left-color:var(--ok);opacity:.72}
.reqrow .rhead{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:5px}
.reqrow .rkind{font-size:10px;font-weight:800;letter-spacing:.1em;color:var(--faint)}
.reqrow .rwho{font-size:11.5px;font-weight:800}
.reqrow.run .rwho{color:var(--cobalt)}
.reqrow.hand .rwho{color:var(--warn)}
.reqrow.ok .rwho{color:var(--ok)}
.reqrow .rat{font-size:11.5px;color:var(--muted);margin-left:auto;font-variant-numeric:tabular-nums}
.reqrow .rabout{font-size:13.5px;font-weight:700;letter-spacing:-.015em;margin-bottom:2px}
.reqrow .rwhat{font-size:13px;line-height:1.65;color:var(--text)}
.reqrow .rwhen{font-size:12px;color:var(--muted);line-height:1.65;margin-top:5px}
.reqrow .ract{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
/* 밀린 일 묶음 — 하루 한 번 여기만 누르면 되게 눈에 띄는 자리에 */
.handoff{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;
  background:color-mix(in srgb,var(--cobalt) 7%,var(--card));
  border:1px solid color-mix(in srgb,var(--cobalt) 30%,var(--line));
  border-radius:var(--r-lg);padding:12px 14px}
.handoff[hidden]{display:none}
.handoff .hmain{flex:1 1 240px;font-size:13px;line-height:1.6}
.handoff .dim{color:var(--muted)}
.itool.prim{background:var(--cobalt);border-color:var(--cobalt);color:#fff;font-weight:800}

/* ══ 파이프라인 ══
   7열 칸반은 여러 사람이 카드를 옮길 때 쓰는 도구다. 여기선 한 사람이,
   두 지점에서만 움직인다 → 단계별 그룹의 세로 목록이 정직하다.
   흐름은 위쪽 레일 한 줄로 보여준다. */
.pipe{padding:16px 20px 28px;max-width:1040px}
.flow{display:flex;align-items:stretch;background:var(--card);border:1px solid var(--line);
  border-radius:var(--r-lg);overflow:hidden;margin-bottom:16px}
.fseg{flex:1;padding:11px 12px;border-right:1px solid var(--hair);text-align:left;position:relative}
.fseg:last-child{border-right:none}
.fseg .fv{display:block;font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.03em;line-height:1.1}
.fseg .fl{display:block;font-size:10.5px;color:var(--muted);font-weight:600;margin-top:2px}
.fseg.zero .fv{color:var(--faint);font-weight:600}
.fseg.act{background:color-mix(in srgb,var(--cobalt) 6%,transparent)}
.fseg.act .fv{color:var(--cobalt)}
.fseg.act::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--cobalt)}

.grp{margin-bottom:20px}
.grph{width:100%;display:flex;align-items:baseline;gap:8px;text-align:left;padding:0 2px 8px;border-bottom:1px solid var(--line);margin-bottom:8px}
.grph .gt{font-size:12px;font-weight:800;letter-spacing:.02em}
.grph .gn{font-size:11px;color:var(--faint);font-weight:700;font-variant-numeric:tabular-nums}
.grph .gd{margin-left:auto;font-size:11px;color:var(--faint)}
.rows{display:flex;flex-direction:column;gap:4px}
/* 상태 행 — 한 줄. 아무 행동도 요구하지 않으므로 조용하다. */
.row{width:100%;text-align:left;display:grid;grid-template-columns:1fr auto;align-items:center;
  gap:12px;padding:9px 12px;border-radius:var(--r);border:1px solid transparent;transition:.13s}
.row:hover{background:var(--card);border-color:var(--line)}
.row .rt{font-size:13.5px;font-weight:600;line-height:1.4;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.row .rm{font-size:11.5px;color:var(--faint);display:flex;gap:8px;align-items:center;flex:none;font-variant-numeric:tabular-nums}
/* 결재 행 — 유일하게 그림과 무게를 갖는다 */
.rows.act .row{grid-template-columns:auto 1fr auto;background:var(--card);border-color:var(--line);
  padding:11px 13px;border-radius:var(--r-lg)}
.rows.act .row:hover{border-color:color-mix(in srgb,var(--cobalt) 40%,var(--line));box-shadow:var(--shadow)}
.rows.act .rt{font-size:14.5px;font-weight:700;white-space:normal;letter-spacing:-.018em}
.rowthumb{width:38px;height:48px;border-radius:5px;border:1px solid var(--hair);
  object-fit:cover;object-position:top;background:var(--band);flex:none}
.tagx{font-size:10.5px;font-weight:700;border-radius:5px;padding:2px 6px;
  border:1px solid var(--line);color:var(--muted);white-space:nowrap}
.tagx.warn{color:var(--warn);border-color:color-mix(in srgb,var(--warn) 40%,transparent)}
.tagx.ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 35%,transparent)}
.tagx.hot{color:var(--cobalt);border-color:color-mix(in srgb,var(--cobalt) 40%,transparent)}
.empty{font-size:12px;color:var(--faint);padding:10px 12px}

/* ── 칩(티켓 메타) ── */
.chip{font-size:10px;font-weight:700;border-radius:4px;padding:2px 6px;letter-spacing:.02em;white-space:nowrap}
.chip.t1{background:var(--band);color:var(--muted)}
.chip.t2{background:var(--band);color:var(--faint)}
.chip.auto{background:var(--band);color:var(--muted)}
.chip.hold{color:var(--warn);border:1px solid color-mix(in srgb,var(--warn) 38%,transparent)}
.chip.edit{color:var(--cobalt);border:1px solid color-mix(in srgb,var(--cobalt) 38%,transparent)}

/* ══ 소재 보드 ══ */
.ideas{padding:16px 20px 28px;display:grid;grid-template-columns:minmax(0,1fr) 316px;gap:18px;align-items:start;max-width:1240px}
@media (max-width:940px){.ideas{grid-template-columns:1fr}}
.ipanel{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:14px 16px}
.ih{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;letter-spacing:-.01em;margin-bottom:12px}
.ih .n{margin-left:auto;font-size:11px;font-weight:700;color:var(--faint);font-variant-numeric:tabular-nums}
.itools{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.itool{font:inherit;font-size:12px;font-weight:700;padding:7px 12px;border-radius:var(--r);
  border:1px solid var(--line);background:transparent;color:var(--text)}
.itool:hover{border-color:var(--muted)}
.itool.prim{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.igrp{margin-bottom:16px}
.igrp h4{margin:0 0 6px;font-size:10.5px;font-weight:800;letter-spacing:.09em;color:var(--faint);
  display:flex;align-items:center;gap:7px;text-transform:uppercase}
.igrp h4 .c{font-weight:700;font-variant-numeric:tabular-nums}
.idea{display:flex;gap:10px;align-items:center;justify-content:space-between;
  border-bottom:1px solid var(--hair);padding:9px 4px 9px 10px;position:relative}
.idea::before{content:"";position:absolute;left:0;top:9px;bottom:9px;width:2px;border-radius:2px;background:transparent}
.idea[data-st="approve"]::before{background:var(--ok)}
.idea[data-st="hold"]::before{background:var(--warn)}
.idea[data-st="reject"]::before{background:var(--red)}
.idea.inpipe::before{background:var(--cobalt)}
.idea[hidden]{display:none}
.imain{min-width:0;flex:1}
.it{font-size:13px;font-weight:700;letter-spacing:-.012em;line-height:1.4}
.idea.done .it{color:var(--muted)}
.iw{font-size:11.5px;color:var(--faint);margin-top:2px;line-height:1.45}
.iflag{font-size:9px;font-weight:800;letter-spacing:.08em;color:var(--cobalt);margin-left:6px;vertical-align:1px}
.iside{display:flex;align-items:center;gap:8px;flex:none}
.isrc{font-size:10.5px;color:var(--faint);font-weight:600;white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis}
.isrc.ok{color:var(--cobalt);font-weight:700}
@media (max-width:820px){.isrc{display:none}}
.ibtns{display:flex;gap:2px}
.ib{width:27px;height:27px;border-radius:7px;border:1px solid transparent;background:transparent;
  color:var(--faint);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;transition:.12s}
.ib:hover{border-color:var(--line);color:var(--text);background:var(--band)}
.ib.sm{width:25px;height:25px;font-size:11px}
.ib.go{color:var(--cobalt)}
.idea[data-st="approve"] .ib.ap{background:var(--ok);border-color:var(--ok);color:#fff}
.idea[data-st="hold"] .ib.hd{background:var(--warn);border-color:var(--warn);color:#fff}
.iedit{display:none;flex-direction:column;gap:6px;width:100%}
.idea.editing .iedit{display:flex}
.idea.editing .imain,.idea.editing .iside{display:none}
.iedit input{font:inherit;font-size:12.5px;padding:7px 10px;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:var(--text);width:100%}
.iedit .row{display:flex;gap:6px;justify-content:flex-end}
.iedit .row button{font:inherit;font-size:11.5px;font-weight:700;padding:6px 12px;border-radius:8px;border:1px solid var(--line);color:var(--muted)}
.iedit .row button.sv{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.iadd{display:none;flex-direction:column;gap:7px;border:1px dashed var(--line);border-radius:var(--r);padding:12px;margin-bottom:12px;background:var(--band)}
.iadd.on{display:flex}
.iadd input,.iadd select{font:inherit;font-size:12.5px;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--text);width:100%}
.iadd .row{display:flex;gap:6px;justify-content:flex-end}
.iadd .row button{font:inherit;font-size:11.5px;font-weight:700;padding:7px 14px;border-radius:8px;border:1px solid var(--line);color:var(--muted)}
.iadd .row button.sv{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.itray{margin:0 0 12px;font-size:11.5px;color:var(--muted)}
.itray summary{cursor:pointer;font-weight:700;padding:5px 0;color:var(--faint)}
.itray ul{list-style:none;margin:5px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}
.itray li{display:flex;align-items:center;justify-content:space-between;gap:8px;
  background:var(--band);border-radius:8px;padding:6px 10px}
.itray button{font:inherit;font-size:10.5px;font-weight:700;padding:4px 9px;border-radius:6px;border:1px solid var(--line);color:var(--muted)}
.igate{font-size:11.5px;line-height:1.65;color:var(--text);background:var(--band);
  border:1px solid var(--line);border-radius:var(--r);padding:10px 12px;margin-bottom:12px}
.igate code{font-size:11px;color:var(--muted)}

/* ══ 회사 · 자산 ══ */
.wrap{padding:18px 20px 80px;max-width:960px}
.sect{font-size:10.5px;font-weight:800;letter-spacing:.1em;color:var(--faint);
  margin:24px 2px 12px;text-transform:uppercase;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sect:first-child{margin-top:4px}
.pcat{margin-bottom:18px}
.pcat h3{font-size:13px;font-weight:800;margin-bottom:8px;letter-spacing:-.015em}
.pr{display:flex;gap:12px;font-size:12.5px;line-height:1.6;padding:8px 0;border-bottom:1px solid var(--hair)}
.pr .d{color:var(--faint);font-variant-numeric:tabular-nums;flex:0 0 40px;font-weight:600}
.teams{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:10px}
.team{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:13px 15px;display:flex;flex-direction:column;gap:6px}
.team .h{font-size:14px;font-weight:800;display:flex;align-items:center;gap:7px;letter-spacing:-.015em}
.team .v{font-size:12.5px;color:var(--text);line-height:1.55;font-weight:500}
.team .resp{font-size:11.5px;color:var(--muted);line-height:1.5}
.team .f{display:flex;gap:8px;align-items:center;font-size:11px;color:var(--faint);margin-top:2px}
.team .lv{background:var(--band);border-radius:5px;padding:2px 7px;font-weight:700;color:var(--muted)}
.secttools{display:inline-flex;gap:6px;margin-left:auto;vertical-align:middle}
.teamtools{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
.ebtn{font-size:10.5px;font-weight:700;border-radius:6px;padding:4px 9px;background:transparent;
  border:1px solid var(--line);color:var(--muted);text-decoration:none;display:inline-block;letter-spacing:0}
.ebtn:hover{color:var(--text);border-color:var(--muted)}
.ebtn.save{background:var(--ink);color:var(--paper);border-color:var(--ink);align-self:flex-start}
.edarea{display:none;flex-direction:column;gap:7px;margin:8px 0 2px}
.edarea.on{display:flex}
.edarea textarea{font:inherit;font-size:12.5px;border:1px solid var(--line);border-radius:var(--r);background:var(--paper);color:var(--text);padding:9px;min-height:60px;resize:vertical}
.edhint{font-size:11px;color:var(--muted);line-height:1.55}
.agrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(266px,1fr));gap:10px}
.agroup{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:14px 15px}
.agroup h3{font-size:13.5px;font-weight:800;display:flex;align-items:center;gap:8px;margin-bottom:9px;letter-spacing:-.015em}
.agroup h3 .n{margin-left:auto;font-size:11.5px;color:var(--faint);font-variant-numeric:tabular-nums;font-weight:700}
.aitem{font-size:12.5px;padding:7px 0;border-bottom:1px solid var(--hair);line-height:1.45}
.aitem:last-child{border-bottom:none}
.aitem b{font-weight:600}
.aitem .m{color:var(--faint);font-size:11.5px;margin-top:1px}

/* ══ 상세 드로어 ══ */
.scrim{position:fixed;inset:0;background:rgba(10,12,16,.5);z-index:50;opacity:0;pointer-events:none;transition:opacity .18s;backdrop-filter:blur(2px)}
.scrim.on{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(560px,100vw);z-index:60;background:var(--paper);
  border-left:1px solid var(--line);transform:translateX(102%);transition:transform .24s cubic-bezier(.32,.72,0,1);
  display:flex;flex-direction:column}
.drawer.on{transform:none}
@media (prefers-reduced-motion: reduce){.drawer,.scrim,.dcard,.row{transition:none}}
.dhead{background:var(--ink);color:#fff;padding:18px 20px 15px;display:flex;flex-direction:column;gap:9px;position:relative;flex:none}
.dhead .close{position:absolute;top:12px;right:14px;color:rgba(255,255,255,.55);font-size:20px;padding:6px;line-height:1}
.dhead .close:hover{color:#fff}
.dhead .tt{font-size:19px;font-weight:800;line-height:1.35;padding-right:36px;letter-spacing:-.028em}
.dhead .row{display:flex;gap:7px;align-items:center;flex-wrap:wrap;font-size:11.5px;color:rgba(255,255,255,.55)}
.dhead .chip{background:rgba(255,255,255,.13);color:#fff}
.dbody{flex:1;min-height:0;overflow-y:auto;padding:16px 20px 22px;display:flex;flex-direction:column;gap:14px}
.tl{display:flex;flex-direction:column;gap:10px}
.entry{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:13px 15px;display:flex;flex-direction:column;gap:8px}
.entry .who{font-size:10px;font-weight:800;letter-spacing:.09em;color:var(--faint);display:flex;align-items:center;gap:6px}
.entry .who .t{color:var(--muted)}
.entry .say{font-size:13.5px;font-weight:600;line-height:1.55}
.entry .why{font-size:12.5px;color:var(--muted);line-height:1.65}
.entry .src{font-size:12px;color:var(--muted);line-height:1.6}
.entry .src b{color:var(--text);font-weight:600}
.entry.op{border-color:color-mix(in srgb,var(--cobalt) 45%,transparent)}
.rub{display:flex;flex-direction:column;gap:5px}
.rub .r{display:grid;grid-template-columns:58px 1fr 18px;gap:9px;align-items:center;font-size:11.5px}
.rub .lbl{color:var(--faint);font-weight:600}
.rub .bar{height:5px;border-radius:99px;background:var(--band);overflow:hidden}
.rub .bar i{display:block;height:100%;background:var(--muted);border-radius:99px}
.rub .v{font-variant-numeric:tabular-nums;font-weight:700;text-align:right;color:var(--muted)}
.rub .sum{font-size:11.5px;font-weight:700;color:var(--muted);margin-top:2px}
.thumb{width:150px;border-radius:8px;border:1px solid var(--line);display:block}

.dlrow{display:flex;gap:6px;flex-wrap:wrap;padding:10px 12px}
/* 좁은 화면에서 버튼 5개가 한 줄에 끼면 글자가 "중단·삭 제"처럼 세로로 깨진다.
   줄바꿈을 막고 최소폭을 줘서, 안 들어가면 아래 줄로 내려가게 한다. */
.acts .btn{white-space:nowrap;min-width:max-content}
.itool.dl{text-decoration:none}
/* 발행 승인 — 나갈 물건을 본다 */
.pv{display:flex;flex-direction:column;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:13px 14px}
.pv .ph{font-size:10px;font-weight:800;letter-spacing:.1em;color:var(--faint);display:flex;align-items:center;gap:8px}
.pv .ph .pn{margin-left:auto;font-variant-numeric:tabular-nums;letter-spacing:0}
.pvframe{background:var(--band);border-radius:var(--r);overflow:hidden}
.pvframe img{width:100%;display:block}
.pvnav{display:flex;gap:8px;align-items:center;justify-content:center}
.pvnav button{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);color:var(--text);font-weight:800}
.pvnav button:hover:not([disabled]){background:var(--band)}
.pvnav button[disabled]{opacity:.25}
.pvdots{display:flex;gap:5px}
.pvdots i{width:5px;height:5px;border-radius:50%;background:var(--line);display:block}
.pvdots i.on{background:var(--ink)}
.cap{font-size:12.5px;line-height:1.75;white-space:pre-wrap;word-break:break-word;
  background:var(--band);border-radius:var(--r);padding:12px 13px;max-height:220px;overflow-y:auto;color:var(--text)}
.cap.empty{color:var(--faint);white-space:normal}
.rvw{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;
  border-radius:var(--r);padding:10px 12px;border:1px solid var(--line);color:var(--muted);line-height:1.5}
.rvw.pass{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 32%,transparent)}
.rvw.block{color:var(--red);border-color:color-mix(in srgb,var(--red) 32%,transparent)}

/* 액션 바 — 스크롤 밖의 진짜 하단 바. 본문이 길어도 겹치지 않는다. */
.acts{flex:none;padding:13px 20px calc(15px + env(safe-area-inset-bottom));background:var(--card);
  border-top:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap;max-height:62vh;overflow-y:auto}
.btn{flex:1;min-width:104px;text-align:center;font-size:13.5px;font-weight:700;border-radius:var(--r);
  padding:12px 10px;border:1px solid var(--line);color:var(--text);transition:.13s}
.btn:hover{border-color:var(--muted)}
.btn.primary{background:var(--cobalt);color:#fff;border-color:var(--cobalt)}
.btn.primary:hover{filter:brightness(1.06)}
.btn.ghost{background:transparent}
.btn.danger{color:var(--red);border-color:color-mix(in srgb,var(--red) 40%,transparent)}
.editbox{display:none;flex-direction:column;gap:8px;width:100%}
.editbox.on{display:flex}
.editbox textarea{font:inherit;font-size:13px;border:1px solid var(--line);border-radius:var(--r);background:var(--paper);color:var(--text);padding:10px;min-height:72px;resize:vertical}
/* 이유 입력 — 반려·보류의 "왜"를 받아 회사가 학습한다 */
.stagenote{flex:1 0 100%;font-size:12.5px;color:var(--muted);line-height:1.6;margin-bottom:2px}
.stagenote b{color:var(--text)}
.rsn{display:none;flex-direction:column;gap:9px;width:100%;background:var(--band);border-radius:var(--r);padding:12px}
.rsn.on{display:flex}
.rsn .q{font-size:12.5px;font-weight:700}
.rsn .chips{display:flex;gap:5px;flex-wrap:wrap}
.rsn .chips button{font-size:11.5px;font-weight:600;border:1px solid var(--line);border-radius:999px;padding:5px 11px;color:var(--muted);background:var(--card)}
.rsn .chips button.on{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.rsn input{font:inherit;font-size:12.5px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--text);padding:8px 10px;width:100%}
.rsn .row{display:flex;gap:7px}
.rsn .row button{flex:1;font-size:12.5px;font-weight:700;border-radius:8px;padding:9px;border:1px solid var(--line);color:var(--muted);background:var(--card)}
.rsn .row button.sv{background:var(--cobalt);border-color:var(--cobalt);color:#fff}

/* ══ 저장 상태 바 ══ */
.savebar{position:sticky;bottom:0;z-index:35;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:8px 20px;background:color-mix(in srgb,var(--card) 92%,transparent);backdrop-filter:blur(12px);
  border-top:1px solid var(--line);font-size:11.5px}
.savebar .s{font-weight:700;display:inline-flex;align-items:center;gap:6px}
.savebar .s.ok{color:var(--ok)} .savebar .s.saving{color:var(--warn)} .savebar .s.bad{color:var(--red)} .savebar .s.off{color:var(--faint)}
.savebar .path{color:var(--faint);font-size:11px}
.savebar .sp{flex:1}
.toast{position:fixed;left:50%;bottom:70px;transform:translateX(-50%) translateY(8px);
  background:var(--ink);color:#fff;font-size:12.5px;font-weight:600;border-radius:999px;padding:10px 18px;
  opacity:0;pointer-events:none;transition:.2s;z-index:80;box-shadow:var(--shadow);max-width:88vw;text-align:center}
.toast.on{opacity:1;transform:translateX(-50%)}

/* 미연결 = 읽기 전용 */
.locked{opacity:.4;pointer-events:none}

/* ══ 작업 표시줄 ══ 눌렀는데 반응이 없으면 또 누른다 → 지금 도는 일을 항상 보여준다 */
.spin{width:11px;height:11px;border-radius:50%;border:2px solid var(--line);
  border-top-color:var(--cobalt);display:inline-block;animation:sp .7s linear infinite;flex:none}
@keyframes sp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){.spin{animation-duration:2s}}
.jobbar{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:var(--muted)}
.jobbar[hidden]{display:none}  /* display 지정이 [hidden]을 덮지 않도록 */
.jobbar .jt{font-weight:700;color:var(--text)}
.jobbar .jchip{font-size:10.5px;border:1px solid var(--line);border-radius:5px;padding:2px 7px;color:var(--muted)}
button[disabled]{opacity:.6;cursor:progress}
button[disabled] .spin{margin-right:5px}

/* ══ 소재 보드 보조 ══ */
.moved{font-size:11.5px;color:var(--muted);line-height:1.6;margin-bottom:12px}
.lnk{font:inherit;font-size:inherit;font-weight:700;color:var(--cobalt);text-decoration:underline;padding:0}
.elab{display:flex;flex-direction:column;gap:3px;font-size:10.5px;font-weight:700;
  letter-spacing:.06em;color:var(--faint);text-transform:uppercase}
.elab input,.elab select{font-size:12.5px;font-weight:500;letter-spacing:normal;text-transform:none;color:var(--text)}
.howto{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:9px;
  font-size:11.5px;color:var(--muted);line-height:1.65}
.howto b{color:var(--text)}
.howto-note{font-size:11.5px;color:var(--muted);line-height:1.65}
.wchips{display:flex;gap:5px;flex-wrap:wrap}
.wchip{font-size:10.5px;font-weight:600;color:var(--muted);background:var(--band);border-radius:999px;padding:3px 9px}
.kbox2{width:100%;height:104px;font:inherit;font-size:12px;padding:9px 11px;border-radius:var(--r);
  border:1px solid var(--line);background:var(--paper);color:var(--text);resize:vertical}

/* ══ 조직도 ══ CEO를 정점으로 한 보고 계통 + 일의 흐름 */
.wrap.wide{max-width:1180px}
.org{display:flex;flex-direction:column;align-items:center;margin-bottom:22px}
.onode{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 16px;
  border:1px solid var(--line);border-radius:var(--r);background:var(--card);
  min-width:132px;transition:.13s;text-align:center}
.onode:hover{border-color:var(--muted);transform:translateY(-1px);box-shadow:var(--shadow)}
.onode.on{border-color:var(--cobalt);background:color-mix(in srgb,var(--cobalt) 7%,var(--card))}
.onode .oe{font-size:16px;line-height:1.1}
.onode .on{font-size:12.5px;font-weight:800;letter-spacing:-.015em}
.onode .olv{font-size:9.5px;font-weight:700;color:var(--faint);letter-spacing:.04em}
.onode .osub{font-size:10.5px;color:var(--muted);font-weight:500}
.onode.ceo{background:var(--ink);border-color:var(--ink);color:#fff;padding:13px 26px;min-width:210px}
.onode.ceo .osub{color:rgba(255,255,255,.6)}
.onode.ceo:hover{filter:brightness(1.15)}
.onode.lead{border-color:var(--muted)}
/* 계통선 — 위 노드에서 아래로 내려오는 줄기 */
.ostem{width:1px;height:20px;background:var(--line);display:block;flex:none}
.orow{display:flex;gap:10px}
/* 5개 본부 — 가로로 흐르고, 위쪽 가로선으로 한 부모에 매달린다 */
.odivs{display:flex;align-items:stretch;gap:6px;width:100%;position:relative;padding-top:14px}
.odivs::before{content:"";position:absolute;top:0;left:9%;right:9%;height:1px;background:var(--line)}
.odiv{flex:1;position:relative;background:var(--card);border:1px solid var(--line);
  border-radius:var(--r-lg);padding:10px 11px;display:flex;flex-direction:column;gap:8px}
.odiv::before{content:"";position:absolute;top:-14px;left:50%;width:1px;height:14px;background:var(--line)}
.odiv.solo{margin-top:14px;flex:0 0 auto;align-self:center;min-width:240px}
.odiv.solo::before{display:none}
.odivh{display:flex;align-items:baseline;gap:6px;justify-content:center}
.odivl{font-size:11.5px;font-weight:800;letter-spacing:-.01em}
.odivn{font-size:10px;color:var(--faint)}
.odivb{display:flex;flex-direction:column;gap:6px}
.odivb .onode{min-width:0;width:100%;padding:9px 8px}
.oarrow{align-self:center;color:var(--faint);font-size:13px;flex:none;padding-top:14px}
@media (max-width:900px){
  .odivs{flex-direction:column;padding-top:0}
  .odivs::before{display:none}
  .odiv::before{display:none}
  .oarrow{transform:rotate(90deg);padding:0}
}
/* ⚠️ display를 주면 [hidden]을 덮어써서 전부 펼쳐진다 → 숨김 규칙을 명시한다 */
.tpanel{background:var(--card);border:1px solid var(--cobalt);border-radius:var(--r-lg);
  padding:14px 16px;margin-bottom:16px;display:flex;flex-direction:column;gap:8px}
.tpanel[hidden]{display:none}
.tphead{display:flex;align-items:center;gap:8px;font-size:14.5px;letter-spacing:-.02em}
.tphead .ebtn{margin-left:auto}
.tprow{display:flex;gap:12px;font-size:12.5px;line-height:1.6}
.tprow .k{flex:0 0 58px;font-size:10.5px;font-weight:800;letter-spacing:.07em;color:var(--faint);
  text-transform:uppercase;padding-top:3px}
.ceo-box{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--card);padding:12px 16px}
.ceo-box>summary{cursor:pointer;font-size:12.5px;font-weight:800;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.ceo-box>summary::-webkit-details-marker{display:none}
.ceo-box>summary::before{content:"▸";color:var(--faint);font-size:11px}
.ceo-box[open]>summary::before{content:"▾"}
.ceo-box .pcat{margin-top:14px}

/* ══ 보관함 ══ */
.folders{display:flex;flex-direction:column;gap:12px}
.folder{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:13px 15px}
.fhead{display:flex;align-items:baseline;gap:8px;padding-bottom:9px;margin-bottom:4px;border-bottom:1px solid var(--line)}
.fname{font-size:13px;font-weight:800;letter-spacing:-.015em}
.fn{font-size:11px;color:var(--faint);font-weight:700}
.fitem{border-bottom:1px solid var(--hair)}
.fitem:last-child{border-bottom:none}
.fsum{display:flex;align-items:center;gap:12px;padding:10px 0;cursor:pointer;list-style:none}
.fsum::-webkit-details-marker{display:none}
.fsum:hover .ft{color:var(--cobalt)}
.fthumb{width:36px;height:45px;border-radius:5px;border:1px solid var(--hair);object-fit:cover;
  object-position:top;background:var(--band);flex:none;display:block}
.fmain{min-width:0;flex:1;display:flex;flex-direction:column}
.ft{font-size:13px;font-weight:600;line-height:1.4}
.fmeta{font-size:11px;color:var(--faint);margin-top:2px}
.fside{flex:none}
.fbody{padding:4px 0 14px 48px;display:flex;flex-direction:column;gap:12px}
@media (max-width:640px){.fbody{padding-left:0}}
.fcap .cap{margin-top:5px;font-family:inherit}
.fcards .fstrip{display:flex;gap:8px;overflow-x:auto;padding:6px 2px 2px;scrollbar-width:thin}
.fcards .fstrip img{height:230px;width:auto;border-radius:8px;border:1px solid var(--line);flex:none;background:var(--band)}
.fcopy{margin-top:7px}
.frv{font-size:11.5px;color:var(--muted);border-left:2px solid var(--line);padding-left:9px}
.ffiles .flinks{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px}
.flink{font-size:10.5px;font-weight:700;border:1px solid var(--line);border-radius:5px;
  padding:3px 8px;color:var(--muted);text-decoration:none}
.flink:hover{color:var(--text);border-color:var(--muted)}

/* ══ 지시함 ══ 칸을 나누지 않는다. 그냥 적으면 알아서 접수한다 */
.askpanel{position:sticky;top:112px}
.askbox{width:100%;font:inherit;font-size:13px;line-height:1.65;padding:11px 12px;border-radius:var(--r);
  border:1px solid var(--line);background:var(--paper);color:var(--text);resize:vertical;min-height:132px}
.askbox:focus{border-color:var(--cobalt);outline:none}
.askrow{display:flex;gap:6px;margin-top:8px}
.askrow .itool{flex:1}
.askhint{font-size:11.5px;color:var(--ok);line-height:1.6;margin-top:8px;min-height:1px}
.asklog{display:flex;flex-direction:column;gap:6px;max-height:230px;overflow-y:auto}
.askitem{background:var(--band);border-radius:9px;padding:8px 10px}
.asktxt{font-size:11.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
.askmeta{font-size:10px;color:var(--faint);margin-top:3px;font-variant-numeric:tabular-nums}
@media (max-width:940px){.askpanel{position:static}}

/* ══ 성과 ══ 저장 수를 막대로 — 한눈에 무엇이 터졌는지 */
.pstat{display:flex;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden}
.pcell{flex:1;background:var(--card);padding:12px 15px;display:flex;flex-direction:column;gap:2px}
.pcell.wide{flex:2}
.pcell .v{font-size:22px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.pcell .v.s{font-size:13.5px;font-weight:700;letter-spacing:-.015em;line-height:1.35;
  overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.pcell .l{font-size:11px;color:var(--faint);font-weight:600}
.plist{display:flex;flex-direction:column;gap:6px}
.prow{display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,300px);gap:16px;align-items:center;
  background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:12px 14px}
@media (max-width:720px){.prow{grid-template-columns:1fr;gap:8px}}
.pmain{min-width:0}
.pt{font-size:13.5px;font-weight:700;line-height:1.4}
.pmeta{font-size:11px;color:var(--faint);margin-top:2px}
.pbars{display:flex;flex-direction:column;gap:4px}
.pbar{display:grid;grid-template-columns:30px 1fr auto;gap:8px;align-items:center}
.pk{font-size:10px;font-weight:800;color:var(--faint);letter-spacing:.05em}
.ptrack{height:6px;border-radius:99px;background:var(--band);overflow:hidden}
.ptrack i{display:block;height:100%;background:var(--cobalt);border-radius:99px}
.pv{font-size:12.5px;font-weight:800}
.psub{font-size:10.5px;color:var(--faint);padding-left:38px}

/* ══ 폰 ══ 오너는 대부분 폰으로 본다 */
@media (max-width:760px){
  .topbar{gap:9px;padding:0 13px;height:50px}
  .topbar .sub,.badge-live{display:none}
  .kpis{flex-wrap:wrap}
  .kpi{flex:1 1 50%;padding:11px 14px;border-bottom:1px solid var(--hair)}
  .kpi:nth-child(2n){border-right:none}
  .kpi .v{font-size:22px}
  .tabs{top:50px;padding:0 8px;overflow-x:auto;scrollbar-width:none}
  .tabs::-webkit-scrollbar{display:none}
  .tab{padding:11px 10px 10px;font-size:12.5px}
  .inbox,.pipe{padding:14px 13px 22px}
  .flow{overflow-x:auto;scrollbar-width:none}
  .flow::-webkit-scrollbar{display:none}
  .fseg{flex:0 0 96px}
  .dcard{gap:11px;padding:11px 12px}
  .wrap{padding:16px 13px 70px}
  .ideas{padding:14px 12px 24px;gap:14px}
  .ipanel{padding:12px 13px}
  .drawer{width:100vw}
  .dbody{padding:14px 15px 20px}
  .acts{padding:12px 15px calc(14px + env(safe-area-inset-bottom))}
  .btn{min-width:0;padding:13px 8px}
  .ib{width:32px;height:32px;font-size:14px}
  .ib.sm{width:30px;height:30px;font-size:13px}
  .itool{padding:8px 12px}
  .connpop{right:8px;left:8px;width:auto;top:56px}
  .savebar{padding:8px 13px}
}

`;

const APP_JS = String.raw`
const STAGES = STATE.stages, RLBL = STATE.rubricLabels;
function img(k){ return k ? (STATE.images[k] || k) : ""; }
const KEY = "wirit-tower-" + STATE.generatedFrom;
let S = load();
/**
 * ⚠️ 브라우저의 옛 기억이 저장소의 사실을 덮어쓰지 않게 한다.
 *
 * 예전엔 화면 상태를 통째로 localStorage 에 저장하고 다음 방문에 **그걸 먼저** 복원했다.
 * 그래서 이런 일이 생겼다(2026-07-26 오너 보고 "삭제했는데 왜 남아있지?"):
 *   중단·삭제를 눌러 저장소에는 지워졌는데, 브라우저에 남은 옛 깃발이 되살아나
 *   결정함에 계속 떴다. 저장소 동기화는 깃발을 **더하기만** 하고 빼지 않으니 영영 안 사라진다.
 *
 * 이제 상태(단계·깃발)의 유일한 사실은 **저장소와 빌드 결과**다.
 * localStorage 에는 오너가 적은 메모(comments)만 남긴다 — 그건 저장소에 없는 것이라 잃으면 안 된다.
 */
function load(){
  let memo={};
  try{
    const s=JSON.parse(localStorage.getItem(KEY));
    if(s&&Array.isArray(s.tickets)) for(const t of s.tickets) if(t&&t.id&&(t.comments||[]).length) memo[t.id]=t.comments;
  }catch(e){}
  return { tickets: STATE.tickets.map(t=>({...t, flags:(t.flags||[]).slice(), comments: memo[t.id]||[] })) };
}
function save(){ localStorage.setItem(KEY, JSON.stringify(S)); }
function tk(id){ return S.tickets.find(t=>t.id===id); }

/* ══ GitHub 연결 — 관제탑을 실제로 동작시키는 백엔드 ══ */
const GHKEY="wirit-gh-token";
const GH={
  owner:(STATE.repo||{}).owner, repo:(STATE.repo||{}).name, branch:(STATE.repo||{}).branch,
  token(){ try{ return localStorage.getItem(GHKEY)||""; }catch(e){ return ""; } },
  setToken(t){ try{ if(t) localStorage.setItem(GHKEY,t); else localStorage.removeItem(GHKEY); }catch(e){} },
  connected(){ return !!this.token() && !!this.owner; },
  async api(path,opts){ opts=opts||{};
    const res=await fetch("https://api.github.com"+path,{ method:opts.method||"GET",
      headers:Object.assign({Authorization:"Bearer "+this.token(),Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},opts.headers||{}),
      body:opts.body?JSON.stringify(opts.body):undefined });
    if(!res.ok){ const t=await res.text(); throw new Error("GitHub "+res.status+" · "+t.slice(0,160)); }
    const txt=await res.text(); return txt?JSON.parse(txt):{}; },
  me(){ return this.api("/user"); },
  dispatch(wf,inputs){ return this.api("/repos/"+this.owner+"/"+this.repo+"/actions/workflows/"+wf+"/dispatches",{method:"POST",body:{ref:this.branch,inputs:inputs||{}}}); },
  /**
   * 파일 읽기 — **반드시 최신본**을 읽는다.
   *
   * ⚠️ 여기가 409의 진짜 원인이었다(2026-07-26 오너 재보고).
   *   contents/{경로}?ref={브랜치} 로 읽으면 CDN 캐시를 타서, 방금 저장한 뒤에도
   *   몇 초 동안 **옛 sha**를 돌려준다. 그 옛 sha로 저장하면 GitHub이 409로 거절한다.
   *   재시도해도 계속 옛 sha를 받으니 5번 다 실패했다.
   *
   * 해법: 브랜치 이름 대신 **지금 이 순간의 커밋 sha**로 읽는다.
   *   ① git/ref 로 브랜치의 머리 커밋을 확인 (캐시 무력화 파라미터 포함)
   *   ② 그 커밋을 ref 로 지정해 파일을 읽는다 — 커밋은 불변이라 캐시가 있어도 정확하다
   * 실패하면 예전 방식으로 물러난다(읽기 자체를 못 하는 것보다 낫다).
   */
  async head(){
    try{
      const r=await this.api("/repos/"+this.owner+"/"+this.repo+"/git/ref/heads/"+encodeURIComponent(this.branch)+"?nocache="+Date.now());
      return (r&&r.object&&r.object.sha)||"";
    }catch(e){ return ""; }
  },
  async getFile(path){
    const at=await this.head();
    const ref=at||this.branch;
    try{
      const d=await this.api("/repos/"+this.owner+"/"+this.repo+"/contents/"+path
        +"?ref="+encodeURIComponent(ref)+"&nocache="+Date.now());
      return {sha:d.sha, text:decodeURIComponent(escape(atob((d.content||"").replace(/\s/g,"")))), at:ref};
    }catch(e){ return {sha:null,text:"",at:ref}; } },
  putFile(path,text,message,sha){ const b64=btoa(unescape(encodeURIComponent(text)));
    return this.api("/repos/"+this.owner+"/"+this.repo+"/contents/"+path,{method:"PUT",body:{message:message,content:b64,branch:this.branch,sha:sha||undefined}}); },
  /** 쓰기 직후 GitHub이 옛 sha를 돌려줘 409가 나는 경우가 있다 → 다시 읽어 재시도 */
  isConflict(e){ return /\b409\b|\b422\b|does not match/i.test(e&&e.message||""); },
  /**
   * 쓰기 직렬화 — 같은 파일에 두 번 연달아 쓰면(승인 2건 연타) 앞 쓰기의 sha를 모른 채
   * 뒤 쓰기가 출발해 반드시 409가 난다. 재시도만으로는 부족해서(GitHub의 읽기 지연이
   * 몇 초까지 간다) **모든 쓰기를 한 줄로 세운다.** 느려 보여도 유실보다 낫다.
   */
  _chain: Promise.resolve(),
  serial(fn){
    const run=this._chain.then(fn,fn);
    this._chain=run.then(()=>{},()=>{}); // 실패해도 줄이 끊기지 않게
    return run;
  },
  append(path,addition,message){
    return this.serial(async()=>{
      let last="";
      for(let i=0;i<6;i++){
        const cur=await this.getFile(path);
        // ⚠️ 예전엔 "sha가 안 바뀌었으면 저장을 건너뛴다"고 짰다.
        //    캐시 때문에 sha가 계속 그대로면 **한 번도 저장을 시도하지 않고** 5번을 다 써버렸다.
        //    → 매 회 반드시 저장을 시도한다. 기다리기만 하는 회차는 없다.
        const text=(cur.text?cur.text.replace(/\s*$/,"")+"\n":"")+addition+"\n";
        try{ return await this.putFile(path,text,message,cur.sha); }
        catch(e){
          if(!this.isConflict(e)) throw e;
          last=shortErr(e);
          if(i===5) break;
          await new Promise(r=>setTimeout(r,500*Math.pow(2,i))); // 0.5→1→2→4→8초
        }
      }
      throw new Error("저장 충돌이 계속됩니다 — 자동 정리가 같은 파일을 쓰는 중일 수 있습니다. 1분 뒤 다시 눌러주세요. ("+last+")");
    });
  },
};
function ghStamp(){ return "[" + STATE.dateLabel + " 관제탑]"; }

/* ══ 연결 뱃지 — 제목 행 우측. 한 번 연결하면 볼 일이 없으므로 작게. ══ */
function renderConn(){
  const b=document.getElementById("connbtn"); if(!b) return;
  const on=GH.connected();
  b.className="conn"+(on?" on":"");
  b.innerHTML='<span class="led"></span>'+(on?"연결됨":"연결 필요");
  b.setAttribute("aria-label", on?"GitHub 연결됨 — 누르면 설정":"GitHub 연결하기");
  const pop=document.getElementById("connpop"); if(!pop) return;
  pop.innerHTML = on
    ? '<h3>🟢 GitHub에 연결됨</h3>'
      +'<div class="who">'+esc(GH.owner)+"/"+esc(GH.repo)+' · '+esc(GH.branch)+'</div>'
      +'<div class="hint">관제탑에서 누르는 모든 결정이 이 저장소에 바로 기록됩니다.</div>'
      +'<div class="row"><button id="conndisc" class="dgr">연결 해제</button><button id="connclose">닫기</button></div>'
    : '<h3>🔌 GitHub 연결</h3>'
      // ⚠️ 권한을 하나라도 빠뜨리면 "연결은 됐는데 버튼이 안 먹는" 상태가 된다.
      //    Contents = 결정 기록(승인·삭제·지시), Actions = 실행 버튼(소재 발굴·카드 제작).
      +'<div class="hint">이 저장소 전용 <b>Fine-grained 토큰</b>이 필요합니다. 권한 <b>2개</b>를 켜세요 —'
      +'<br>· <b>Contents</b> = Read and write <span class="dim">(승인·삭제·지시 기록)</span>'
      +'<br>· <b>Actions</b> = Read and write <span class="dim">(소재 발굴·카드 제작 실행)</span>'
      +'<br>토큰은 <b>이 기기의 이 브라우저에만</b> 저장됩니다 — 그래서 <b>기기마다 한 번씩</b> 붙여넣어야 합니다(같은 토큰 재사용 가능). → '
      +'<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">토큰 만들기 ↗</a></div>'
      +'<details class="connsteps"><summary>📱 휴대폰에서 만드는 순서</summary>'
      +'<ol><li>위 [토큰 만들기] → GitHub 로그인</li>'
      +'<li><b>Token name</b>: wirit 관제탑 · <b>Expiration</b>: 90 days 이상</li>'
      +'<li><b>Repository access</b> → Only select repositories → <b>'+esc(GH.owner||"내 계정")+"/"+esc(GH.repo||"claude")+'</b></li>'
      +'<li><b>Permissions</b> → Repository permissions에서 <b>Contents</b>와 <b>Actions</b>를 각각 <b>Read and write</b>로</li>'
      +'<li>맨 아래 <b>Generate token</b> → 나온 문자열 복사(<b>이 화면을 벗어나면 다시 못 봅니다</b>)</li>'
      +'<li>아래 칸에 붙여넣고 [연결하기]</li></ol>'
      +'<div class="dim">화면이 PC용으로 보이면 브라우저 메뉴에서 «데스크톱 사이트»를 켜면 편합니다.</div></details>'
      +'<input type="password" id="conntok" placeholder="github_pat_... (붙여넣기)" autocomplete="off" autocapitalize="off" spellcheck="false">'
      +'<div class="row"><button id="connsave" class="prim">연결하기</button><button id="connclose">닫기</button></div>';
  wireConn();
}
function wireConn(){
  const close=document.getElementById("connclose");
  if(close) close.onclick=()=>document.getElementById("connpop").classList.remove("on");
  const disc=document.getElementById("conndisc");
  if(disc) disc.onclick=()=>{ GH.setToken(""); document.getElementById("connpop").classList.remove("on"); afterConnChange("연결 해제됨"); };
  const save=document.getElementById("connsave");
  if(save) save.onclick=async()=>{
    const t=(document.getElementById("conntok").value||"").trim();
    if(!t){ toast("토큰을 붙여넣으세요"); return; }
    GH.setToken(t);
    save.disabled=true; save.textContent="확인 중…";
    try{
      // ⚠️ /user 만 물어보면 어떤 토큰이든 통과한다 → "연결됨"인데 버튼은 안 먹는 상태가 된다.
      //    실제로 쓰는 두 가지를 여기서 직접 확인한다: 저장소 읽기·쓰기(Contents), 워크플로(Actions).
      const me=await GH.me();
      const cur=await GH.getFile("data/requests.json");
      if(cur.sha===null) throw new Error("이 저장소에 접근할 수 없습니다 — 토큰의 Repository access에 "+GH.owner+"/"+GH.repo+"가 있는지 확인하세요");
      let acts=true;
      try{ await GH.api("/repos/"+GH.owner+"/"+GH.repo+"/actions/workflows?per_page=1"); }catch(e){ acts=false; }
      document.getElementById("connpop").classList.remove("on");
      afterConnChange("연결 성공 — "+(me.login||""));
      if(!acts) toast("연결됐지만 Actions 권한이 없습니다 — 소재 발굴·카드 제작 버튼이 안 먹습니다. 토큰 권한에 Actions=Read and write를 추가하세요");
    }
    catch(e){ GH.setToken(""); toast("연결 실패: "+shortErr(e)); }
    finally{ if(save){ save.disabled=false; save.textContent="연결하기"; } }
  };
}
/** 연결 상태가 바뀌면 화면 전체(잠금·결정함·보드·소재)를 다시 맞춘다 */
function afterConnChange(msg){
  renderConn(); applyLock(); setSave(GH.connected()?"ok":"off");
  renderInbox(); renderReqs(); renderBoard(); renderIdeas();
  if(GH.connected()){ startWatching(); refreshFromRepo(); } // 저장소 상태를 먼저 맞춘다
  if(msg) toast(msg);
}
/** 미연결이면 조작 UI를 아예 못 누르게 잠근다 */
function applyLock(){
  const on=GH.connected();
  document.querySelectorAll("[data-lock]").forEach(el=>el.classList.toggle("locked", !on));
  const g=document.getElementById("igate");
  if(g){ g.hidden=on;
    if(!on) g.innerHTML='🔌 <b>읽기 전용</b> — 우상단 <b>[연결 필요]</b>를 눌러 GitHub 토큰을 넣으면, '
      +'승인·수정·추가가 누르는 즉시 <code>'+esc(IPATH)+'</code>에 기록됩니다.'; }
}

/* 탭 전환 — 주소 해시(#ideas 등)로도 열 수 있게 한다(구 /ideas.html 북마크 호환) */
function openTab(name){
  const b=document.querySelector('.tab[data-v="'+name+'"]'); if(!b) return false;
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===b));
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id==="view-"+name));
  return true;
}
document.querySelectorAll(".tab").forEach(b=>{
  b.onclick=()=>{ openTab(b.dataset.v); history.replaceState(null,"","#"+b.dataset.v); };
});
window.addEventListener("hashchange",()=>openTab(location.hash.slice(1)));

/* ══════════ 작업 표시줄 ══════════
 * "눌렀는데 아무 반응이 없다"가 가장 나쁜 상태다. 그러면 또 누르고, 중복이 쌓인다.
 * 여기서 하는 일:
 *   1) 누른 즉시 그 버튼을 잠그고 "진행 중"으로 바꾼다 (중복 클릭 차단)
 *   2) 하단 표시줄에 지금 도는 일을 모아 보여준다 (내 브라우저 작업 + 저장소 작업)
 *   3) 저장소 작업(Actions)이 끝나면 알려주고, 결과를 자동으로 가져온다 (새로고침 불필요)
 */
const JOBS=new Map();   // 내 브라우저에서 도는 일: id → {label, at}
let RUNS=[];            // 저장소(Actions)에서 도는 일
let runTimer=null, runSeen=new Set(), watching=false;

function jobStart(id,label){
  JOBS.set(id,{label:label});
  document.querySelectorAll('[data-job="'+id+'"]').forEach(b=>{
    b.disabled=true; b.dataset.was=b.textContent; b.innerHTML='<span class="spin"></span>'+label+"…";
  });
  renderJobs();
}
function jobEnd(id,okMsg,bad){
  JOBS.delete(id);
  document.querySelectorAll('[data-job="'+id+'"]').forEach(b=>{
    b.disabled=false; if(b.dataset.was) b.textContent=b.dataset.was;
  });
  renderJobs();
  if(okMsg) toast(bad?("실패: "+okMsg):okMsg);
}
/** 하단 표시줄 — 지금 무슨 일이 돌고 있는지 */
function renderJobs(){
  const el=document.getElementById("jobbar"); if(!el) return;
  const mine=[...JOBS.values()].map(j=>({t:j.label,k:"me"}));
  const repo=RUNS.filter(r=>r.status!=="completed").map(r=>({t:r.name,k:"repo",url:r.url}));
  const all=mine.concat(repo);
  el.hidden=all.length===0;
  if(!all.length){ el.textContent=""; return; }
  el.innerHTML='<span class="spin"></span>'
    +'<span class="jt">진행 중 '+all.length+'건</span>'
    +all.slice(0,3).map(j=>'<span class="jchip">'+esc(j.t)+'</span>').join("")
    +(all.length>3?'<span class="jchip">외 '+(all.length-3)+'건</span>':"");
}

/** 저장소 작업 상태를 주기적으로 확인 → 끝나면 알리고 결과를 반영한다 */
async function pollRuns(){
  if(!GH.connected()) return;
  try{
    const next=await GH.runs();
    // 방금 끝난 작업 찾기
    for(const r of next){
      if(r.status!=="completed") { runSeen.add(r.id); continue; }
      if(!runSeen.has(r.id)) continue;      // 원래부터 끝나 있던 건 알리지 않는다
      runSeen.delete(r.id);
      if(r.conclusion==="success"){ toast("완료: "+r.name+" — 결과를 가져옵니다"); refreshFromRepo(); }
      else toast("실패: "+r.name+" (자세히 보려면 GitHub Actions 확인)");
    }
    RUNS=next;
  }catch(e){ /* 조회 실패는 조용히 넘긴다 — 표시줄이 없다고 일이 막히면 안 된다 */ }
  renderJobs();
  scheduleRuns();
}
function scheduleRuns(){
  clearTimeout(runTimer);
  // 도는 일이 있으면 자주, 없으면 느긋하게 — 불필요한 API 호출을 줄인다
  const busy=RUNS.some(r=>r.status!=="completed") || JOBS.size>0;
  runTimer=setTimeout(pollRuns, busy?7000:45000);
}
function startWatching(){ if(watching) return; watching=true; pollRuns(); }

/**
 * 저장소에서 최신 상태를 읽어 화면에 반영한다.
 *
 * ⚠️ 이게 없으면 이런 일이 생긴다(2026-07-26 오너 보고):
 *   [중단·삭제]를 누른다 → 저장소에는 기록된다 → 그런데 **화면은 배포 시점의 사진**이라
 *   새로고침하면 그 건이 되살아나 보인다. 오너는 "안 먹는다"고 판단한다.
 * 화면을 열 때(그리고 작업이 끝날 때마다) 저장소를 직접 읽어 덮어쓰면,
 * **배포를 기다릴 필요가 없다.**
 */
async function refreshFromRepo(){
  if(!GH.connected()) return;
  let changed=false;
  // ① 소재
  try{
    const cur=await GH.getFile(IPATH);
    const doc=JSON.parse(cur.text);
    if(Array.isArray(doc.ideas)){ IDEAS=doc.ideas; changed=true; }
  }catch(e){ /* 못 읽으면 그냥 둔다 */ }
  // ② 파이프라인 결정(중단·수정지시) — 배포 전에도 화면에 즉시 반영
  try{
    const cur=await GH.getFile("data/pipeline-state.json");
    const doc=JSON.parse(cur.text);
    const key=(x)=>String(x||"").replace(/\s+/g,"").replace(/[·—-]/g,"").toLowerCase();
    const mark=(list,flag)=>{
      for(const d of (Array.isArray(list)?list:[])){
        const n=key(d.title); if(!n) continue;
        for(const t of S.tickets){
          const m=key(t.title);
          if(!(m.indexOf(n)>-1 || n.indexOf(m)>-1)) continue;
          t.flags=t.flags||[];
          if(!t.flags.includes(flag)){ t.flags.push(flag); changed=true; }
        }
      }
    };
    mark(doc.dropped,"버림");
    mark(doc.revise,"수정요청");
  }catch(e){ /* 파일이 없을 수도 있다 */ }
  // ③ 요청 대장 — "내가 시킨 일"이 지금 어디까지 왔는지도 배포를 안 기다리고 최신으로
  try{
    const cur=await GH.getFile("data/requests.json");
    const doc=JSON.parse(cur.text);
    if(Array.isArray(doc.items)){ REQS=doc.items.slice(); changed=true; }
  }catch(e){ /* 없으면 그대로 */ }
  if(changed){ save(); renderIdeas(); renderInbox(); renderReqs(); renderBoard(); }
}

/* ══ 발행 대기열 ══
 * "발행 승인"이 기록으로만 끝나면 아무 일도 안 일어난다.
 * 승인을 저장소의 발행 큐에 넣어 두면, 발행 워크플로가 이 큐만 보고 올린다.
 * (오너 승인 없이는 큐에 아무것도 안 들어가므로 승인 게이트는 그대로 유지된다) */
function queuePublish(t){
  if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
  setSave("saving");
  const line="- [ ] "+ghStamp()+" **"+t.title+"** · "+t.fmt
    +" · 원본 "+(t.provenance||"미상")
    +(t.caption?"":"  ⚠️ 캡션 없음 — 발행 전 작성 필요");
  GH.append("data/publish-queue.md", line, "관제탑: 발행 승인 — "+short(t))
    .then(()=>GH.append("research/decisions-inbox.md", "- "+ghStamp()+" 🚀 발행 승인: "+t.title, "관제탑: 발행 승인 기록"))
    .then(()=>{ setSave("ok"); toast("발행 대기열에 올렸습니다 ✓"); })
    .catch(e=>{ const m=shortErr(e); setSave("bad","publish-queue.md · "+m); toast("승인 실패: "+m); });
}

/**
 * 중단·삭제를 **저장소에** 남긴다.
 * 브라우저에만 남기면 관제탑이 다시 만들어질 때 그 건이 되살아난다.
 * (발행 승인이 publish-queue.md 에 남는 것과 같은 이유)
 */
function dropTicket(t, why){
  if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
  setSave("saving"); jobStart("drop","중단 기록");
  editPipelineState((doc)=>{
    if(!doc.dropped.some(d=>d.title===t.title)){
      doc.dropped.push({title:t.title, at:STATE.dateLabel, why:(why||"").trim()});
    }
  }, "관제탑: 중단 — "+short(t))
  .then(()=>GH.append("research/decisions-inbox.md",
      "- "+ghStamp()+" ⏹ 중단: "+t.title+(why?" — 이유: "+why:""), "관제탑: 중단 기록"))
  .then(()=>{ setSave("ok"); jobEnd("drop","중단 처리됨 — 다시 올라오지 않습니다"); })
  .catch(e=>{ const m=shortErr(e); setSave("bad","pipeline-state.json · "+m); jobEnd("drop", m, true); });
}

/**
 * 파이프라인 상태 파일을 안전하게 고친다(읽기 → 수정 → 쓰기, 충돌 재시도).
 * mutate(doc) 안에서 doc 을 바꾸면 된다. 파일의 주석(_) 등 나머지는 그대로 보존된다.
 */
function editPipelineState(mutate, message){
  const PATH="data/pipeline-state.json";
  return GH.serial(async()=>{
    for(let i=0;i<6;i++){
      const cur=await GH.getFile(PATH);
      let doc; try{ doc=JSON.parse(cur.text); }catch(e){ doc={}; }
      if(!Array.isArray(doc.dropped)) doc.dropped=[];
      if(!Array.isArray(doc.revise)) doc.revise=[];
      mutate(doc);
      try{ return await GH.putFile(PATH, JSON.stringify(doc,null,2)+"\n", message, cur.sha); }
      catch(e){ if(!GH.isConflict(e)||i===5) throw e;
        await new Promise(r=>setTimeout(r,500*Math.pow(2,i))); }
    }
  });
}

/**
 * 수정지시를 **저장소에** 남긴다.
 * 결정 로그에 글만 남기면 관제탑이 다시 만들어질 때 '수정요청' 표시가 사라져,
 * 무엇이 재작업 대기인지 알 수 없게 된다.
 */
function reviseTicket(t, note){
  if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
  setSave("saving"); jobStart("revise","수정지시 기록");
  // 지시가 "자료를 모아달라"면 그건 수집으로 바로 돌릴 수 있다.
  // 제목을 검색어의 뼈대로 쓴다 — 지시문에서 뽑는 것보다 정확하다.
  const wantsData=/찾아|모아|조사|자료|데이터|순위|통계/.test(note);
  const year=(note.match(/20\d{2}/)||[])[0]||"";
  const q=wantsData ? (keywordsOf(plain(t.title))+(year?" "+year:"")).trim() : "";
  editPipelineState((doc)=>{
    doc.revise=doc.revise.filter(r=>r.title!==t.title);
    doc.revise.push({title:t.title, at:STATE.dateLabel, note:note});
  }, "관제탑: 수정지시 — "+short(t))
    .then(()=>GH.append("research/decisions-inbox.md",
        "- "+ghStamp()+" ✏️ 수정지시("+t.title+"): \""+note+"\"", "관제탑: 수정지시"))
    .then(()=>logRequest("수정 지시", note, t.title, "order"))
    .then(()=>q ? GH.dispatch("research-digest.yml",{query:q}).then(()=>{ startWatching(); }, ()=>{}) : null)
    .then(()=>{ setSave("ok");
      jobEnd("revise", q ? "수정지시 기록 + «"+q+"» 자료 수집 시작(2~3분)" : "수정지시가 기록됐습니다 — '내가 시킨 일'에서 진행 상황을 보세요"); })
    .catch(e=>{ const m=shortErr(e); setSave("bad","pipeline-state.json · "+m); jobEnd("revise", m, true); });
}
/** 제목에서 이모지·기호를 걷어낸다(검색어로 쓸 때 필요) */
function plain(s){ return String(s||"").replace(/[^0-9A-Za-z가-힣\s]/g," ").replace(/\s+/g," ").trim(); }

/** 발행 취소 — 대기열 파일에서 그 줄을 실제로 지운다(안 지우면 다음 빌드에 되살아난다) */
function unqueuePublish(t, why){
  if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
  const PATH="data/publish-queue.md";
  const key=t.title.replace(/\s+/g,"").toLowerCase();
  setSave("saving"); jobStart("unq","발행 취소");
  GH.serial(async()=>{
    for(let i=0;i<5;i++){
      const cur=await GH.getFile(PATH);
      const kept=cur.text.split("\n").filter(line=>{
        if(!/^\s*-\s*\[[ xX]\]/.test(line)) return true;
        const m=line.match(/\*\*(.+?)\*\*/);
        const tt=(m?m[1]:line).replace(/\s+/g,"").toLowerCase();
        return !(tt.indexOf(key)>-1 || key.indexOf(tt)>-1);
      }).join("\n");
      try{ return await GH.putFile(PATH, kept, "관제탑: 발행 취소 — "+short(t), cur.sha); }
      catch(e){ if(!GH.isConflict(e)||i===4) throw e;
        await new Promise(r=>setTimeout(r,400*Math.pow(2,i))); }
    }
  })
    .then(()=>GH.append("research/decisions-inbox.md",
        "- "+ghStamp()+" ↩ 발행 취소: "+t.title+(why?" — 이유: "+why:""), "관제탑: 발행 취소"))
    .then(()=>{ setSave("ok"); jobEnd("unq","대기열에서 내렸습니다"); })
    .catch(e=>{ const m=shortErr(e); setSave("bad","publish-queue.md · "+m); jobEnd("unq", m, true); });
}

/* 결정 1건을 저장소 결정 로그에 바로 기록 */
function pushDecision(text, msg){
  // 연결돼 있으면 저장소 결정 로그에 바로 남긴다(복사-붙여넣기 우회 없음).
  if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
  setSave("saving");
  GH.append("research/decisions-inbox.md", "- " + ghStamp() + " " + text, "관제탑: " + (msg||"결정 기록"))
    .then(()=>{ setSave("ok"); toast(msg||"저장소에 기록됨 ✓"); })
    .catch(e=>{ const t=shortErr(e); setSave("bad", "decisions-inbox.md · "+t); toast("기록 실패: "+t); });
}

/* 회사 탭 편집 배선 — CEO 원칙 + 팀별 원칙·프롬프트 */
function wireCompany(){
  const ceoBtn=document.querySelector("[data-ce]");
  if(ceoBtn){
    ceoBtn.onclick=()=>document.getElementById("ed-ceo").classList.toggle("on");
    document.querySelector("[data-ce-save]").onclick=()=>{
      const ta=document.querySelector("#ed-ceo textarea"), v=ta.value.trim();
      if(!v){ toast("내용을 입력하세요"); return; }
      pushDecision("CEO 원칙 수정·추가: "+v, "CEO 원칙 기록됨"); ta.value=""; document.getElementById("ed-ceo").classList.remove("on");
    };
  }
  document.querySelectorAll("[data-te]").forEach(b=>{
    const slug=b.dataset.te.split("|")[0];
    b.onclick=()=>document.querySelector('[data-te-area="'+slug+'"]').classList.toggle("on");
  });
  document.querySelectorAll("[data-te-save]").forEach(b=>{
    const [slug,name]=b.dataset.teSave.split("|");
    b.onclick=()=>{
      const area=document.querySelector('[data-te-area="'+slug+'"]'), ta=area.querySelector("textarea"), v=ta.value.trim();
      if(!v){ toast("내용을 입력하세요"); return; }
      pushDecision("「"+name+"」 원칙·프롬프트 수정: "+v, name+" 기록됨"); ta.value=""; area.classList.remove("on");
    };
  });
}
/** 조직도에서 팀을 누르면 그 팀의 원칙·업무기준이 열린다(한 번에 하나만) */
function wireOrg(){
  document.querySelectorAll("[data-team]").forEach(chip=>{
    chip.onclick=()=>{
      const slug=chip.dataset.team;
      const panel=document.getElementById("team-"+slug);
      const open=panel && panel.hidden;
      document.querySelectorAll(".tpanel").forEach(p=>p.hidden=true);
      document.querySelectorAll(".tchip").forEach(c=>c.classList.remove("on"));
      if(open){ panel.hidden=false; chip.classList.add("on");
        panel.scrollIntoView({block:"nearest",behavior:"smooth"}); }
    };
  });
  document.querySelectorAll("[data-teamclose]").forEach(b=>b.onclick=(e)=>{
    e.stopPropagation();
    b.closest(".tpanel").hidden=true;
    document.querySelectorAll(".tchip").forEach(c=>c.classList.remove("on"));
  });
}
wireCompany();
wireOrg();

/* ══════════ 결정함 — 첫 화면. "오늘 내가 결정할 것"만 모은다 ══════════
 * 관제탑을 열었을 때 할 일이 없으면 "없다"고 분명히 말해준다.
 * 그게 보이면 앱을 닫아도 된다는 뜻 — 매일 5분 운영의 핵심. */
function pendingDecisions(){
  const out=[];
  // ① 발행 승인 대기 — 카드 + 캡션이 다 준비돼 오너 확인만 남은 것.
  //    캡션이 없으면 올릴 글 자체가 없으므로 '결정할 일'이 아니다(파이프라인 목록에는 남는다).
  //    실험·중간 렌더(발행 세트 미등록)도 제외 — 안 그러면 결정함이 수십 건으로 불어난다.
  S.tickets.forEach(t=>{
    if(t.stage!==4) return;
    const fl=t.flags||[];
    if(fl.includes("버림")||fl.includes("실험")) return;
    if(!t.caption) return;
    out.push({ kind:"pub", label:"발행 승인", title:t.title,
      note:(t.pages&&t.pages.length?t.pages.length+"장 · ":"")+t.fmt
        +(t.review?" · 자동검수 "+(t.review.verdict==="pass"?"통과":t.review.verdict):" · 자동검수 없음"),
      thumb:t.thumb||null, go:()=>{ openTab("board"); openDrawer(t.id); } });
  });
  // ② 소재 — 쌓여 있다고 매일 알리면 그건 영구 알림이지 '오늘 할 일'이 아니다.
  //    정말 결정이 필요한 두 경우에만 올린다:
  //      (a) 새로 발굴돼 아직 안 본 소재가 있다
  //      (b) 파이프라인이 비었다 = 만들 게 없다 → 지금 골라야 회사가 움직인다
  const open=IDEAS.filter(i=>i.status!=="done" && !Number(i.stage||0));
  const fresh=open.filter(i=>i.isNew);
  const working=S.tickets.filter(t=>t.stage>=1&&t.stage<=3&&!(t.flags||[]).includes("버림")).length;
  if(fresh.length){
    out.push({ kind:"idea", label:"새 소재", title:"새로 발굴된 소재 "+fresh.length+"건",
      note:fresh.slice(0,2).map(i=>i.title).join(" · ")+(fresh.length>2?" 외 "+(fresh.length-2)+"건":""),
      thumb:null, go:()=>openTab("ideas") });
  } else if(!working && open.length){
    out.push({ kind:"idea", label:"소재 선택", title:"만들고 있는 게 없습니다 — 소재를 골라주세요",
      note:"소재 풀 "+open.length+"건 대기 중", thumb:null, go:()=>openTab("ideas") });
  }
  // ③ 재작업이 끝나 오너가 결과를 봐야 하는 것.
  //    ⚠️ '중단·삭제'한 건과 실험 렌더는 결정 대상이 아니다 — 이걸 안 걸러서
  //       지운 항목이 결정함에 계속 떴다(2026-07-26 오너 보고).
  //    ⚠️ 아직 재작업 중인 것도 여기 올리지 않는다. 결정함은 "내가 지금 결정할 것"만 담는다.
  //       진행 상황은 아래 '요청 처리 현황'이 따로 보여준다.
  S.tickets.forEach(t=>{
    const fl=t.flags||[];
    if(!fl.includes("수정요청")) return;
    if(fl.includes("버림")||fl.includes("실험")) return;
    if(t.stage===4) return; // 이미 ①에 잡힘
    if(openRequests().some(r=>r.kind==="수정 지시" && sameTitle(r.about, t.title))) return;
    out.push({ kind:"rev", label:"수정 확인", title:t.title, note:"재작업이 끝났습니다 — 결과를 확인하세요",
      thumb:t.thumb||null, go:()=>{ openTab("board"); openDrawer(t.id); } });
  });
  return out;
}

/* ══════════ 요청 처리 현황 ══════════
 * 오너 질문의 근원: "시켰는데 언제까지 기다려야 해?"
 * 원인은 화면이 **누가 · 언제**를 말하지 않고 '대기 중'이라고만 썼던 것.
 * 여기서는 모든 요청에 대해 반드시 세 가지를 말한다 —
 *   ① 언제 시켰나(경과)  ② 누가 하나(자동/사람)  ③ 언제 되나(다음 처리 시각)
 * 모르면 "모른다"고 쓴다. 아는 척하지 않는다. */
let REQS=(STATE.requests||[]).slice();
function sameTitle(a,b){
  const k=(x)=>String(x||"").replace(/\s+/g,"").replace(/[·—-]/g,"").toLowerCase();
  const x=k(a), y=k(b);
  return !!x && !!y && (x.indexOf(y)>-1 || y.indexOf(x)>-1);
}
function openRequests(){ return REQS.filter(r=>!r.done); }
/** 접수 후 얼마나 지났나 — 사람이 읽는 말로. 시각을 모르면 빈 문자열(추측하지 않는다). */
function since(ts){
  if(!ts) return "";
  const ms=Date.now()-Date.parse(ts);
  if(!isFinite(ms)||ms<0) return "";
  const m=Math.floor(ms/60000);
  if(m<1) return "방금";
  if(m<60) return m+"분째";
  const h=Math.floor(m/60);
  if(h<24) return h+"시간째";
  return Math.floor(h/24)+"일째";
}
/** 누가 처리하나 · 언제 되나 — 요청 종류가 아니라 **자동화 여부**로 갈린다 */
function whoWhen(r){
  if(r.done) return { who:"완료", when:r.result||"처리됨", tone:"ok" };
  if(r.auto==="digest") return { who:"자동 수집", when:"보통 2~3분 · 끝나면 소재 보드에 자동으로 뜹니다", tone:"run" };
  if(r.auto==="machine") return { who:"자동 제작", when:"보통 5~8분 · 끝나면 결재 대기·보관함에 새 카드가 뜹니다", tone:"run" };
  if(r.auto==="order") return r.order
    ? { who:"오너가 시켜야 함", when:"지시서까지는 준비됐습니다. <b>여기서 저절로 진행되지는 않습니다</b> — [작업 세션에 넘길 지시문 복사]를 눌러 채팅에 붙여넣으면 그때 제작이 시작됩니다", tone:"hand" }
    : { who:"자동 정리", when:"매일 07:00 정리 때 작업지시서가 만들어집니다 · [지금 처리 돌리기] 가능", tone:"run" };
  return { who:"작업 세션(사람)", when:"자동으로는 처리되지 않습니다 — 작업 세션에 넘겨야 합니다", tone:"hand" };
}
/** 한 화면에 보여줄 상한 — 이보다 많으면 접어서 "더 보기"로 연다 */
const INBOX_CAP=6;
let inboxAll=false;
function renderInbox(){
  const box=document.getElementById("inboxBody"); if(!box) return;
  const list=pendingDecisions();
  const n=document.getElementById("inboxN");
  if(n){ n.textContent=String(list.length); n.hidden=list.length===0; }
  const tn=document.getElementById("tabN");
  if(tn){ tn.textContent=String(list.length); tn.hidden=list.length===0; }
  box.textContent="";
  if(!list.length){
    const d=document.createElement("div"); d.className="allclear";
    d.innerHTML='<div class="t">✓ 오늘 결정할 것 없음</div>'
      +'<div class="w">파이프라인이 알아서 돌고 있습니다. 새 소재가 올라오거나 카드가 완성되면 여기에 뜹니다.</div>';
    box.appendChild(d); return;
  }
  const shown=inboxAll?list:list.slice(0,INBOX_CAP);
  const wrap=document.createElement("div"); wrap.className="dlist";
  shown.forEach(d=>{
    const b=document.createElement("button"); b.className="dcard "+d.kind; b.type="button";
    b.innerHTML=(d.thumb?'<img class="dth" src="'+img(d.thumb)+'" alt="">':'<span class="dth"></span>')
      +'<span class="dm"><span class="dk">'+esc(d.label)+'</span>'
      +'<span class="dt">'+esc(d.title)+'</span>'
      +'<span class="dw">'+esc(d.note||"")+'</span></span>'
      +'<span class="go">›</span>';
    b.onclick=d.go; wrap.appendChild(b);
  });
  if(list.length>INBOX_CAP){
    const more=document.createElement("button");
    more.className="itool"; more.type="button"; more.style.cssText="width:100%;margin-top:8px";
    more.textContent=inboxAll?"접기":"그 외 "+(list.length-INBOX_CAP)+"건 더 보기";
    more.onclick=()=>{ inboxAll=!inboxAll; renderInbox(); };
    wrap.appendChild(more);
  }
  box.appendChild(wrap);
}

/** 요청 처리 현황 — 시킨 일이 지금 어디까지 왔는지. 비어 있으면 칸 자체를 감춘다. */
function renderReqs(){
  const sec=document.getElementById("reqsec"), box=document.getElementById("reqBody");
  if(!sec||!box) return;
  const open=openRequests();
  const recent=REQS.filter(r=>r.done).slice(-3);
  const list=open.concat(recent);
  const backlog=pendingWork().length;
  sec.hidden=list.length===0 && backlog===0;
  renderHandoff();
  if(!list.length) return;
  const cnt=document.getElementById("reqN");
  if(cnt){ cnt.textContent=String(open.length); cnt.hidden=open.length===0; }
  box.textContent="";
  list.forEach(r=>{
    const w=whoWhen(r), el=document.createElement("div");
    el.className="reqrow "+w.tone;
    const ago=since(r.ts), when=r.at?esc(r.at)+(ago?" · "+esc(ago):""):(ago?esc(ago):"접수 시각 미기록");
    el.innerHTML='<div class="rhead"><span class="rkind">'+esc(r.kind)+'</span>'
      +'<span class="rwho">'+esc(w.who)+'</span>'
      +'<span class="rat">'+when+'</span></div>'
      +(r.about?'<div class="rabout">'+esc(r.about)+'</div>':'')
      +'<div class="rwhat">'+esc(r.what||"")+'</div>'
      +'<div class="rwhen">'+(r.done?"✓ ":"")+w.when+'</div>'; // when 은 우리가 만든 문구(HTML 허용)
    const bar=document.createElement("div"); bar.className="ract";
    if(r.order){
      const a=document.createElement("a"); a.className="itool"; a.target="_blank"; a.rel="noopener";
      a.href=ghLink(r.order); a.textContent="작업지시서 보기 ↗"; bar.appendChild(a);
    }
    // ⚠️ 이미 지시서가 만들어진 요청에 '지금 처리 돌리기'를 눌러도 아무 일도 안 일어난다.
    //    (정리 워크플로는 지시서를 만드는 일까지만 한다 — 제작은 사람 몫)
    //    효과가 없는 버튼을 두면 오너는 눌러보고 "또 안 되네"를 겪는다. 그래서 뺀다.
    if(!r.done && r.auto!=="digest" && !r.order){
      const b=document.createElement("button"); b.className="itool"; b.type="button";
      b.textContent="지금 처리 돌리기";
      b.onclick=()=>runTick(b);
      bar.appendChild(b);
    }
    if(!r.done && w.tone==="hand"){
      const c=document.createElement("button"); c.className="itool"; c.type="button";
      c.textContent="작업 세션에 넘길 지시문 복사";
      c.onclick=()=>copyText(handoffText(r), c, "복사됨 ✓");
      bar.appendChild(c);
    }
    if(bar.children.length) el.appendChild(bar);
    box.appendChild(el);
  });
}

/**
 * 카드 재생산 — 관제탑 버튼만으로 제작이 돈다(클로드 세션 불필요).
 * 빌더(builders.json)가 있는 세트만 이 버튼이 붙는다. 새 소재의 첫 제작은
 * 데이터 소스 판단·코드 작성이 필요해서 작업 세션 몫이다 — 화면이 그렇게 말한다.
 */
async function runProduce(label, title){
  if(!label) return;
  if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
  jobStart("make-"+label,"카드 제작 중 — "+label);
  try{
    await GH.dispatch("produce-card.yml",{label:label});
    await logRequest("카드 재생산", (title||label)+" — 최신 데이터로 다시 제작", title||label, "machine");
    jobEnd("make-"+label,"제작을 시작했습니다 — 5~8분 뒤 자동 반영");
    startWatching();
  }catch(e){ const m=shortErr(e); jobEnd("make-"+label, m, true); }
}
document.addEventListener("click",(e)=>{
  const b=e.target.closest&&e.target.closest(".fremake");
  if(b) runProduce(b.dataset.remake, b.dataset.remake);
});

/** 밀린 일 묶음 — 개수를 세어 보여주고, 누르면 지시문 전체를 복사한다 */
function renderHandoff(){
  const box=document.getElementById("handoff"); if(!box) return;
  const n=pendingWork().length;
  box.hidden=n===0;
  if(!n) return;
  const label=document.getElementById("handoffN");
  if(label) label.textContent=n+"건";
  const b=document.getElementById("handoffBtn");
  if(b) b.onclick=()=>copyText(allHandoffText(), b, "복사됨 ✓ — 채팅에 붙여넣으세요");
}

/** 파이프라인 정리를 지금 돌린다 — 매일 07:00까지 기다리지 않아도 된다 */
async function runTick(btn){
  if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
  jobStart("tick","요청 처리 중");
  try{
    await GH.dispatch("pipeline-tick.yml",{});
    jobEnd("tick","처리를 시작했습니다 — 끝나면 자동 반영");
    startWatching();
  }catch(e){ const m=shortErr(e); jobEnd("tick", m, true); }
}

/**
 * 지금 사람(작업 세션)을 기다리는 일을 전부 모은다.
 *
 * ── 왜 (2026-07-27 오너)
 * 관제탑은 요청을 받아 두지만, 새 카드 제작·코드 수정은 작업 세션이 해야 한다.
 * 건마다 [지시문 복사]를 누르면 오너가 채팅을 여러 번 열어야 한다.
 * → 밀린 걸 한 덩어리로 묶어 **하루 한 번 붙여넣기**로 끝내게 한다.
 */
function pendingWork(){
  const out=[];
  // ① 요청 대장에서 사람 몫으로 남은 것
  openRequests().forEach(r=>{
    if(r.auto==="digest") return;              // 수집은 기계가 한다
    out.push({ kind:r.kind, title:r.about||r.what, what:r.what, order:r.order||"" });
  });
  // ② 파이프라인에서 제작을 기다리는 티켓(기획안·제작중·검수대기)
  S.tickets.forEach(t=>{
    const fl=t.flags||[];
    if(t.stage<1||t.stage>3) return;
    if(fl.includes("버림")||fl.includes("실험")) return;
    if(out.some(o=>sameTitle(o.title,t.title))) return;   // 요청 대장과 겹치면 한 번만
    out.push({ kind:"카드 제작", title:t.title, what:(t.comments||[]).join(" / ")||"작업지시서대로 제작",
      order:t.ideaId?"research/work-orders/"+t.ideaId+".md":"" });
  });
  // ③ 카드는 있는데 캡션이 없어 결재로 못 올라가는 것
  S.tickets.forEach(t=>{
    const fl=t.flags||[];
    if(t.stage!==4||t.caption||fl.includes("버림")||fl.includes("실험")) return;
    if(!t.setLabel) return;                    // 발행 세트에 등록된 것만
    out.push({ kind:"캡션 작성", title:t.title, what:"카드는 나왔는데 캡션이 없어 결재로 못 올라갑니다",
      order:"data/review/captions/"+t.setLabel+".txt" });
  });
  return out;
}

/** 밀린 일 전부를 한 번에 시키는 지시문 — 채팅에 붙여넣으면 그날 치가 끝난다 */
function allHandoffText(){
  const list=pendingWork();
  const L=["wirit 관제탑에 밀려 있는 일입니다. 아래를 순서대로 처리해주세요.",""];
  list.forEach((w,i)=>{
    L.push((i+1)+") ["+w.kind+"] "+w.title);
    if(w.what && w.what!==w.title) L.push("   요청: "+w.what);
    if(w.order) L.push("   참고: "+w.order);
  });
  L.push("", "공통 규칙:",
    "· 수치는 raw 데이터에서 코드로 추출한다(LLM이 만들지 않는다) · provenance 기록",
    "· 렌더 결정성·designQa 통과 → 캡션 → 자동검수 PASS",
    "· 새 카드는 data/review/sets.json 과 builders.json 에 등록한다(등록해야 관제탑에 뜬다)",
    "· 끝나면 data/pipeline-state.json 의 revise 와 data/requests.json 을 정리한다",
    "· 커밋·푸시하면 배포가 카드까지 다시 그린다");
  return L.join("\n");
}

/** 티켓 하나를 작업 세션에 시키는 지시문 — 붙여넣으면 바로 제작이 시작되게 필요한 걸 다 담는다 */
function workOrderText(t){
  const lines=["wirit 관제탑에서 넘긴 제작 지시입니다.","",
    "카드: "+t.title,
    "현재 단계: "+(STAGES[t.stage]||t.stage),
    t.ideaId?"작업지시서: research/work-orders/"+t.ideaId+".md":"",
    t.provenance?"원본: "+t.provenance:"", "",
    "해야 할 일:",
    "1. 데이터를 raw에서 코드로 추출한다 (LLM이 수치를 만들지 않는다 · provenance 기록)",
    "2. 카드 렌더 → 결정성·designQa 통과",
    "3. 캡션 작성(data/review/captions/) → 자동검수(review) PASS",
    "4. data/review/sets.json 과 builders.json 에 등록 — 등록해야 관제탑 결재 대기에 뜬다",
    "5. 커밋·푸시하면 배포가 카드까지 다시 그린다"];
  (t.comments||[]).forEach(c=>lines.push("","오너 코멘트: \""+c+"\""));
  return lines.filter(x=>x!==null).join("\n");
}

/** 사람(작업 세션)이 해야 하는 요청 — 그대로 붙여넣으면 되는 지시문을 만든다 */
function handoffText(r){
  return "wirit 관제탑에서 넘긴 "+r.kind+"입니다.\n\n"
    +(r.about?"대상: "+r.about+"\n":"")
    +"접수: "+(r.at||"미상")+"\n\n"
    +"지시 내용:\n"+(r.what||"")+"\n\n"
    +(r.order?"작업지시서: "+r.order+"\n":"")
    +"끝나면 data/pipeline-state.json 의 revise 에서 이 항목을 지우고, 결과를 관제탑 결재 대기로 올려주세요.";
}

/* ══════════ 파이프라인 ══════════
 * 7열 칸반은 여러 사람이 카드를 옮길 때 쓰는 도구다.
 * 여기선 한 사람이, 두 지점(소재 선택·발행 승인)에서만 움직인다.
 * → 흐름은 위쪽 레일 한 줄로 보여주고, 내용은 단계별 세로 목록으로 쌓는다.
 *   · 가로 스크롤 없음 · 무한 세로 스크롤 없음(상태 행은 한 줄, 그룹은 접힌다)
 *   · 그림은 '결재 대기'에만 — 그때만 어느 카드인지 눈으로 확인할 필요가 있다 */
const board=document.getElementById("board");
const FIRST_STAGE=1;                 // 소재 고르기는 💡소재 탭이 단일 창구
const ACT_STAGE=4;                   // 오너의 결재가 필요한 단계
/* 급한 것부터 — 왼→오른쪽 단계 순서보다 '무엇을 먼저 봐야 하나'가 중요하다.
 * 4번(승인대기)은 두 갈래로 나눈다: 결재할 수 있는 것 / 캡션이 없어 아직 못 하는 것.
 * 안 나누면 지표의 '결재 대기 5'와 목록의 '승인대기 9'가 어긋나 도구를 못 믿게 된다. */
const GROUP_ORDER=["ready","nocap",2,3,1,5,6];
const GROUP_NOTE={1:"소재 승인 후 기획 대기",2:"데이터·카드 제작 중",3:"자동 검수 진행",
  5:"승인 완료 — 업로드 대기/완료",6:"발행 후 성과",
  ready:"카드+캡션 준비 완료 — 오너 확인만 남음",
  nocap:"캡션을 써야 결재 목록으로 올라옵니다"};
const GROUP_TITLE={ready:"결재 대기",nocap:"캡션 대기"};
const FOLDED=new Set();              // 접어둔 그룹(기본은 다 펼침, 빈 그룹은 자동으로 접힘)

/** 실험·중간 렌더는 어느 단계에도 끼우지 않는다 — 맨 아래 접힌 서랍에 따로 모은다.
 *  (안 그러면 '승인대기'가 22건이 되고, 그중 17건은 아무도 승인할 생각이 없는 것들이다) */
function isLab(t){ return (t.flags||[]).includes("실험"); }
function stageList(si){
  return S.tickets.filter(t=>t.stage===si && !(t.flags||[]).includes("버림") && !isLab(t));
}
function labList(){
  return S.tickets.filter(t=>isLab(t) && !(t.flags||[]).includes("버림"));
}
/** 그룹 키(단계 번호 또는 ready/nocap) → 티켓 목록 */
function groupList(key){
  if(key==="ready") return stageList(ACT_STAGE).filter(t=>!!t.caption);
  if(key==="nocap") return stageList(ACT_STAGE).filter(t=>!t.caption);
  return stageList(key);
}
function groupTitle(key){ return GROUP_TITLE[key] || STAGES[key]; }
/** 흐름 레일 — 어디에 몇 건이 있는지 한 줄로. 누르면 그 그룹으로 간다. */
function renderFlow(){
  const el=document.getElementById("flow"); if(!el) return;
  el.textContent="";
  for(let si=FIRST_STAGE; si<STAGES.length; si++){
    // 승인대기 칸은 '결재할 수 있는 것'만 센다 — 지표·목록·레일이 같은 숫자를 말해야 한다
    const key=(si===ACT_STAGE)?"ready":si;
    const n=groupList(key).length;
    const b=document.createElement("button");
    b.type="button";
    b.className="fseg"+(n?"":" zero")+(si===ACT_STAGE&&n?" act":"");
    b.innerHTML='<span class="fv num">'+n+'</span><span class="fl">'+esc(si===ACT_STAGE?"결재 대기":STAGES[si])+'</span>';
    b.onclick=()=>{ const g=document.getElementById("grp"+key); if(g) g.scrollIntoView({block:"start",behavior:"smooth"}); };
    el.appendChild(b);
  }
}
/** 결재 행에 붙는 상태 꼬리표 — 왜 아직 못 나가는지 한눈에 */
function rowTags(t){
  const out=[];
  const fl=t.flags||[];
  if(fl.includes("보류")) out.push(['warn','보류']);
  if(fl.includes("수정요청")) out.push(['hot','수정요청']);
  if(fl.includes("실험")) out.push(['','실험']);
  if(t.stage===ACT_STAGE){
    if(!t.caption) out.push(['warn','캡션 없음']);
    if(t.review) out.push([t.review.verdict==="pass"?'ok':'warn', t.review.verdict==="pass"?'검수 통과':'검수 '+t.review.verdict]);
    else if(t.caption) out.push(['','검수 없음']);
    if((t.pages||[]).length>1) out.push(['', (t.pages.length)+'장']);
  }
  return out.map(([k,v])=>'<span class="tagx'+(k?" "+k:"")+'">'+esc(v)+'</span>').join("");
}
function renderBoard(){
  if(!board) return;
  renderFlow();
  board.textContent="";
  GROUP_ORDER.forEach(si=>{
    if(typeof si==="number" && si<FIRST_STAGE) return;
    const list=groupList(si);
    const act=si==="ready"; // 그림과 무게를 갖는 유일한 그룹
    // 빈 그룹은 자리만 차지하므로 접어 둔다(결재 대기는 비어도 '없음'을 보여준다)
    const fold=FOLDED.has(si) || (!list.length && !act);
    const g=document.createElement("section");
    g.className="grp"; g.id="grp"+si;

    const h=document.createElement("button");
    h.type="button"; h.className="grph";
    h.innerHTML='<span class="gt">'+esc(groupTitle(si))+'</span><span class="gn num">'+list.length+'</span>'
      +'<span class="gd">'+(fold?"펼치기":esc(GROUP_NOTE[si]||""))+'</span>';
    h.onclick=()=>{ FOLDED.has(si)?FOLDED.delete(si):FOLDED.add(si); renderBoard(); };
    g.appendChild(h);

    if(!fold){
      const rows=document.createElement("div");
      rows.className="rows"+(act?" act":"");
      if(!list.length){ rows.innerHTML='<div class="empty">'+(act?"결재할 것 없음 — 다 처리하셨습니다":"비어 있음")+'</div>'; }
      list.forEach(t=>{
        const b=document.createElement("button");
        b.type="button"; b.className="row"; b.onclick=()=>openDrawer(t.id);
        const tags=rowTags(t);
        const thumb=(act&&t.thumb)?'<img class="rowthumb" src="'+img(t.thumb)+'" alt="">':(act?'<span class="rowthumb"></span>':"");
        b.innerHTML=thumb
          +'<span class="rt">'+(t.fire?"🔥 ":"")+esc(t.title)+'</span>'
          +'<span class="rm">'+(tags||'<span class="tagx">'+esc(t.fmt)+'</span>')+'</span>';
        rows.appendChild(b);
      });
      g.appendChild(rows);
    }
    board.appendChild(g);
  });

  // 실험 서랍 — 디자인 시안·중간 렌더. 기본은 접혀 있고, 볼 사람만 편다.
  const lab=labList();
  if(lab.length){
    const g=document.createElement("section"); g.className="grp"; g.id="grpLab";
    const open=FOLDED.has("lab") === false && FOLDED.has("labOpen");
    const h=document.createElement("button"); h.type="button"; h.className="grph";
    h.innerHTML='<span class="gt">실험 · 중간 렌더</span><span class="gn num">'+lab.length+'</span>'
      +'<span class="gd">'+(open?"디자인 시안·미등록 렌더":"펼치기")+'</span>';
    h.onclick=()=>{ FOLDED.has("labOpen")?FOLDED.delete("labOpen"):FOLDED.add("labOpen"); renderBoard(); };
    g.appendChild(h);
    if(open){
      const rows=document.createElement("div"); rows.className="rows";
      lab.forEach(t=>{
        const b=document.createElement("button"); b.type="button"; b.className="row";
        b.onclick=()=>openDrawer(t.id);
        b.innerHTML='<span class="rt">'+esc(t.title)+'</span>'
          +'<span class="rm"><span class="tagx">'+esc(t.fmt)+'</span></span>';
        rows.appendChild(b);
      });
      g.appendChild(rows);
    }
    board.appendChild(g);
  }
}

/* 드로어 */
const drawer=document.getElementById("drawer"), scrim=document.getElementById("scrim");
let cur=null;
function openDrawer(id){ cur=id; const t=tk(id); if(!t) return;
  drawer.innerHTML=buildDetail(t);
  drawer.classList.add("on"); scrim.classList.add("on");
  drawer.querySelector(".close").onclick=closeDrawer;
  const cc=drawer.querySelector('[data-act="copycap"]');
  if(cc) cc.onclick=()=>copyText(t.caption||"", cc, "복사됨 ✓");
  wireCarousel(t); wireActions(t); applyLock();
  drawer.querySelector(".dbody").scrollTop=0; }
function closeDrawer(){ drawer.classList.remove("on"); scrim.classList.remove("on"); cur=null; }
scrim.onclick=closeDrawer;
addEventListener("keydown",e=>{ if(e.key==="Escape") closeDrawer(); });

function rubricHtml(r){
  if(!r) return "";
  let bars="";
  if(r.values&&r.values.length){
    bars=r.values.map((v,i)=>'<div class="r"><span class="lbl">'+RLBL[i]+'</span><span class="bar"><i style="width:'+(v/3*100)+'%"></i></span><span class="v">'+v+'</span></div>').join("");
  }
  const sum=r.sum?'<div class="sum">리서치 점수 '+r.sum+' / '+r.max+'</div>':"";
  return '<div class="rub">'+bars+sum+'</div>';
}
function evHtml(ev){ return (ev||[]).map(e=>'<div class="src">· <b>'+esc(e[0])+'</b> — '+fmt(e[1])+'</div>').join(""); }

function buildDetail(t){
  const sum=t.rubric&&t.rubric.sum?t.rubric.sum:null;
  let tl="";
  if(!t.auto){
    tl+='<div class="entry"><div class="who">🔎 리서치팀 <span class="t">소재 판단</span></div>'
      +'<div class="say">'+esc(t.title)+' — '+esc(t.fmt)+' 추천</div>'
      +evHtml(t.evidence)+rubricHtml(t.rubric)+'</div>';
  }
  (t.timeline||[]).forEach(e=>{
    tl+='<div class="entry"><div class="who">'+esc(e.team)+' <span class="t">'+esc(e.tag)+'</span></div>'
      +'<div class="say">'+esc(e.say)+'</div>'
      +(e.why?'<div class="why">'+esc(e.why)+'</div>':"")
      +evHtml(e.evidence)
      +(e.thumb?'<img class="thumb" src="'+img(e.thumb)+'" alt="">':"")+'</div>';
  });
  (t.comments||[]).forEach(c=>{
    tl+='<div class="entry op"><div class="who">🧑‍💼 운영자 <span class="t">수정지시</span></div>'
      +'<div class="say">"'+esc(c)+'"</div>'
      +'<div class="why">해당 팀이 이 코멘트로 재작업합니다(저장소 결정 로그에 기록됨).</div></div>';
  });

  // ── 발행 승인 화면 — 실제로 나갈 실물(카드 전 장 + 캡션 + 자동검수)을 한 화면에.
  //    "타임라인을 읽고 짐작"이 아니라 "나갈 물건을 보고 결정"하게 한다.
  let proof="";
  if(t.stage>=4){
    const pages=(t.pages&&t.pages.length)?t.pages:(t.thumb?[t.thumb]:[]);
    if(pages.length){
      proof+='<div class="pv"><div class="ph">📱 나갈 카드<span class="pn" id="pvn">1 / '+pages.length+'</span></div>'
        +'<div class="pvframe"><img id="pvimg" src="'+img(pages[0])+'" alt="카드 1장"></div>';
      if(pages.length>1){
        proof+='<div class="pvnav"><button id="pvprev" aria-label="이전 장" disabled>‹</button>'
          +'<span class="pvdots" id="pvdots">'+pages.map((_,k)=>'<i'+(k?"":' class="on"')+'></i>').join("")+'</span>'
          +'<button id="pvnext" aria-label="다음 장">›</button></div>';
      }
      proof+='</div>';
    }
    const rv=t.review;
    proof+='<div class="rvw '+(rv?(rv.verdict==="pass"?"pass":"block"):"none")+'">'
      +(rv?(rv.verdict==="pass"?"✓ 자동검수 통과":"⚠ 자동검수 "+esc(rv.verdict))
           +" — "+esc(rv.summary||("오류 "+rv.errors+" · 경고 "+rv.warns))
         :"자동검수 리포트 없음 — 수치·레이아웃 확인을 오너가 직접 해야 합니다")+'</div>';
    proof+='<div class="pv"><div class="ph">✍️ 업로드 캡션</div>'
      +(t.caption?'<div class="cap">'+esc(t.caption)+'</div>'
                 :'<div class="cap empty">캡션이 아직 없습니다 — 발행 전에 작성이 필요합니다.</div>')+'</div>';
    // 수동 업로드 통로 — 화면 이미지는 축소본이라, 올릴 때는 반드시 이 원본을 쓴다.
    // (2026-07-26 오너: "인스타는 당분간 내가 수동으로 올릴거야" — 원본 받을 곳이 없었다)
    if(t.setLabel){
      const n=(t.pages&&t.pages.length)||1;
      proof+='<div class="pv"><div class="ph">⬇️ 원본 내려받기 <span class="pn">수동 업로드용 · 원본 해상도</span></div><div class="dlrow">';
      for(let k=1;k<=n;k++)
        proof+='<a class="itool dl" download href="download/'+esc(t.setLabel)+'-'+k+'.jpg">'+k+'장 JPG</a>';
      if(t.caption) proof+='<button class="itool" data-act="copycap">캡션 복사</button>';
      if((STATE.builders||[]).indexOf(t.setLabel)>-1)
        proof+='<button class="itool" data-act="remake" data-remake="'+esc(t.setLabel)+'">🔁 최신 데이터로 다시 제작</button>';
      proof+='</div></div>';
    }
  }

  let acts="";
  if(t.stage===0 && !(t.flags||[]).includes("버림")){
    acts='<button class="btn primary" data-act="go">✅ 이 소재 진행</button>'
      +'<button class="btn ghost" data-act="hold">⏸ 보류</button>'
      +'<button class="btn danger" data-act="drop">중단·삭제</button>'+reasonBox();
  } else if(t.stage===4){
    acts='<button class="btn primary" data-act="publish">🚀 발행 승인</button>'
      +'<button class="btn ghost" data-act="edit">✏️ 수정지시</button>'
      +'<button class="btn danger" data-act="reject">❌ 반려</button>'
      +'<div class="editbox" id="editbox"><textarea id="edittext" placeholder="예) 제목 폰트 키우고 2·3위 재확인해줘"></textarea>'
      +'<button class="btn primary" data-act="editsave">코멘트 남기기</button></div>'+reasonBox();
  } else if(t.stage===5){
    // 이미 오너의 손을 떠난 건 — 되돌릴 길만 열어 둔다
    const waiting=(t.flags||[]).includes("업로드 대기");
    acts='<div class="btn ghost" style="flex:1 0 100%;cursor:default">'
      +(waiting?"발행 대기열에 올라 있습니다 — 업로드 대기 중":"업로드 완료")+'</div>'
      +(waiting?'<button class="btn danger" data-act="unqueue">↩ 대기열에서 내리기</button>'+reasonBox():"");
  } else if(t.auto){
    acts='<div class="why">자동 슬롯 — 사후 통보만. 무인 해제는 설정에서.</div>';
  } else {
    // 기획안·제작중·검수대기 — "아무 액션 없음"으로 두면 오너가 손을 못 쓴다.
    // 여기서 할 수 있는 일은 세 가지다: 지시를 더 주거나, 다 됐다고 넘기거나, 접거나.
    const wo = t.ideaId ? "research/work-orders/"+t.ideaId+".md" : "";
    const woLink = (wo && STATE.repo.owner)
      ? '<a class="btn ghost" style="text-decoration:none" target="_blank" rel="noopener" href="https://github.com/'
        +esc(STATE.repo.owner)+"/"+esc(STATE.repo.name)+"/blob/"+esc(STATE.repo.branch)+"/"+esc(wo)+'">작업지시서 보기 ↗</a>'
      : "";
    // ⚠️ "만드는 중입니다"라고 쓰면 거짓말이다 — 제작은 자동이 아니라 **작업 세션(사람)** 몫이고,
    //    시키지 않으면 아무 일도 일어나지 않는다. 화면은 그 사실을 그대로 말한다.
    //    (2026-07-26 오너: "제작중으로 분류된 컨텐츠들 아무것도 작성을 안 하고 있는데?")
    acts='<div class="stagenote">'
      +(t.stage===1 ? "오너가 승인한 소재입니다. <b>작업지시서까지는 자동</b>, 실제 제작은 <b>작업 세션(사람)</b> 몫입니다 — [제작 지시문 복사]를 눌러 채팅에 붙여넣으면 그 자리에서 제작이 시작됩니다."
        : t.stage===2 ? "<b>자동으로 진행되지 않습니다.</b> 제작(데이터 추출·카드 렌더)은 작업 세션(사람)이 합니다 — [제작 지시문 복사]로 채팅에 붙여넣어 시키세요."
        : "<b>지금은 아무도 손대고 있지 않습니다.</b> 검수는 카드가 만들어질 때 함께 돌고, 그 제작을 시키는 건 오너입니다 — 아래 [제작 지시문 복사].")
      +'</div>'
      +'<button class="btn primary" data-act="push">지시 추가</button>'
      +'<button class="btn ghost" data-act="copywork">제작 지시문 복사</button>'
      + woLink
      +'<button class="btn ghost" data-act="next">다음 단계로</button>'
      +'<button class="btn danger" data-act="drop">중단·삭제</button>'
      +'<div class="editbox" id="editbox"><textarea id="edittext" placeholder="예) 7월 데이터로 다시 뽑아줘 / 제목을 더 세게"></textarea>'
      +'<button class="btn primary" data-act="editsave">지시 기록</button></div>'
      +reasonBox();
  }

  return '<div class="dhead"><button class="close" aria-label="닫기">✕</button>'
    +'<div class="tt">'+(t.fire?"🔥 ":"")+esc(t.title)+'</div>'
    +'<div class="row"><span class="chip '+(t.tier==="T1"?"t1":"t2")+'">'+(t.tier==="T1"?"주 콘텐츠":"부 콘텐츠")+'</span>'
    +'<span>'+esc(t.topic)+'</span><span>·</span><span>'+esc(t.fmt)+'</span><span>·</span><span>'+STAGES[t.stage]+'</span>'
    +(sum?'<span>·</span><span>리서치 '+sum+'점</span>':"")+'</div></div>'
    +'<div class="dbody">'+proof+'<div class="tl">'+tl+'</div></div>'
    +'<div class="acts" data-lock>'+acts+'</div>';
}

/* ── 이유 입력 ──
 * 반려·보류·중단에는 반드시 "왜"를 붙인다. 이유 없는 거절은 회사를 학습시키지 못하고,
 * 다음에 똑같은 소재가 또 올라온다 (CEO.md §C — 같은 말을 두 번 하게 하지 않는다). */
const REASONS=["시의성 없음","이미 다룬 주제","숫자가 약함","우리답지 않음","데이터 부족"];
function reasonBox(){
  return '<div class="rsn" id="rsnbox"><div class="q" id="rsnq">왜 그렇게 결정하셨나요?</div>'
    +'<div class="chips">'+REASONS.map(r=>'<button type="button" data-rsn="'+esc(r)+'">'+esc(r)+'</button>').join("")+'</div>'
    +'<input id="rsntext" placeholder="직접 입력 (선택) — 회사가 이 이유를 학습합니다">'
    +'<div class="row"><button type="button" data-act="rsncancel">취소</button>'
    +'<button type="button" class="sv" data-act="rsnok">기록하고 진행</button></div></div>';
}

function wireCarousel(t){
  const pages=(t.pages&&t.pages.length)?t.pages:(t.thumb?[t.thumb]:[]);
  if(pages.length<2) return;
  const im=drawer.querySelector("#pvimg"), nEl=drawer.querySelector("#pvn"),
        pv=drawer.querySelector("#pvprev"), nx=drawer.querySelector("#pvnext"),
        dots=drawer.querySelector("#pvdots");
  let k=0;
  const paint=()=>{
    im.src=img(pages[k]); im.alt="카드 "+(k+1)+"장";
    nEl.textContent=(k+1)+" / "+pages.length;
    pv.disabled=k===0; nx.disabled=k===pages.length-1;
    [...dots.children].forEach((d,i)=>d.className=i===k?"on":"");
  };
  pv.onclick=()=>{ if(k>0){ k--; paint(); } };
  nx.onclick=()=>{ if(k<pages.length-1){ k++; paint(); } };
}

function wireActions(t){
  const box=()=>drawer.querySelector("#rsnbox");
  let picked="", pending=null;
  // 이유를 먼저 받고, [기록하고 진행]을 눌렀을 때 실제 동작을 실행한다
  function ask(question, run){
    const b=box(); if(!b){ run(""); return; }
    picked=""; pending=run;
    b.querySelector("#rsnq").textContent=question;
    b.querySelectorAll("[data-rsn]").forEach(x=>x.classList.remove("on"));
    b.querySelector("#rsntext").value="";
    b.classList.add("on");
    b.scrollIntoView({block:"nearest"});
  }
  drawer.querySelectorAll("[data-rsn]").forEach(b=>b.onclick=()=>{
    picked=(picked===b.dataset.rsn?"":b.dataset.rsn);
    drawer.querySelectorAll("[data-rsn]").forEach(x=>x.classList.toggle("on",x.dataset.rsn===picked));
  });

  drawer.querySelectorAll("[data-act]").forEach(b=>{
    b.onclick=()=>{
      const a=b.dataset.act, ttl=short(t);
      if(a==="rsncancel"){ box().classList.remove("on"); pending=null; return; }
      if(a==="rsnok"){
        const free=(drawer.querySelector("#rsntext").value||"").trim();
        const why=[picked,free].filter(Boolean).join(" · ");
        box().classList.remove("on");
        const run=pending; pending=null; if(run) run(why);
        return;
      }
      // 복사는 기록이 아니다 — 연결 없이도 된다
      if(a==="copywork"){ copyText(workOrderText(t), b, "복사됨 ✓ — 채팅에 붙여넣으세요"); return; }
      if(a==="remake"){ runProduce(b.dataset.remake, t.title); return; }
      // 미연결이면 기록이 남지 않으므로 아예 진행하지 않는다
      if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }

      if(a==="go"){ t.stage=1; t.flags=(t.flags||[]).filter(f=>f!=="보류");
        promoteIdea(t,1); pushDecision("진행: "+t.title+" → 기획안","진행 기록됨"); done(ttl+" 기획으로"); }
      if(a==="hold"){ ask("왜 보류하시나요? (회사가 학습합니다)", (why)=>{
        t.flags=t.flags||[]; if(!t.flags.includes("보류")) t.flags.push("보류");
        pushDecision("보류: "+t.title+(why?" — 이유: "+why:""),"보류 기록됨"); done(ttl+" 보류"); }); }
      if(a==="drop"){ ask("왜 중단하시나요? (비워도 됩니다 — 적으면 회사가 학습합니다)", (why)=>{
        t.flags=t.flags||[]; if(!t.flags.includes("버림")) t.flags.push("버림");
        dropTicket(t, why);
        // 소재에서 올라온 티켓이면 소재도 같이 내린다(양쪽에 유령이 남지 않게)
        if(t.ideaId){ const i=ideaById(t.ideaId); if(i){ i.stage=0; queueSave("소재 되돌림 — "+i.title); } }
        done(ttl+" 중단"); }); }
      if(a==="publish"){
        if(t.review && t.review.verdict!=="pass"
          && !confirm("자동검수가 통과가 아닙니다("+t.review.verdict+").\n그래도 발행 승인할까요?")) return;
        t.stage=5; queuePublish(t); done(ttl+" 발행 승인"); }
      if(a==="reject"){ ask("왜 반려하시나요? (해당 팀이 이 이유로 다시 만듭니다)", (why)=>{
        t.stage=2; t.flags=t.flags||[]; if(!t.flags.includes("수정요청")) t.flags.push("수정요청");
        pushDecision("반려: "+t.title+" → 재작업"+(why?" — 이유: "+why:""),"반려 기록됨"); done(ttl+" 반려"); }); }
      if(a==="unqueue"){ ask("왜 내리시나요? (기록에 남습니다)", (why)=>{
        t.stage=4; t.flags=(t.flags||[]).filter(f=>f!=="업로드 대기");
        unqueuePublish(t, why); done(ttl+" 대기열에서 내림"); }); }
      if(a==="edit"||a==="push"){ drawer.querySelector("#editbox").classList.toggle("on"); return; }
      // 다음 단계로 — 오너가 "이건 끝났다"고 손으로 밀어 올린다(저장소에 남는다)
      if(a==="next"){
        const to=Math.min(t.stage+1, STAGES.length-1);
        t.stage=to;
        if(t.ideaId){ const i=ideaById(t.ideaId); if(i){ i.stage=to; queueSave("소재 단계 이동 — "+i.title); } }
        pushDecision("▶ 단계 이동: "+t.title+" → "+STAGES[to], STAGES[to]+"로 이동");
        done(ttl+" → "+STAGES[to]);
      }
      if(a==="editsave"){ const v=drawer.querySelector("#edittext").value.trim(); if(!v){ toast("코멘트를 입력하세요"); return; }
        t.comments=t.comments||[]; t.comments.push(v); t.flags=t.flags||[]; if(!t.flags.includes("수정요청")) t.flags.push("수정요청");
        reviseTicket(t, v); done("수정지시 기록됨"); }
    };
  });
}
/** 파이프라인에서 단계를 옮기면, 소재에서 승격된 티켓은 소재 원본(ideas.json)도 같이 옮긴다 */
function promoteIdea(t,stage){
  if(!t.ideaId) return;
  const i=ideaById(t.ideaId); if(!i) return;
  i.stage=stage; i.at=STATE.dateLabel;
  queueSave("소재 단계 이동("+STAGES[stage]+") — "+i.title);
}
function short(t){ return t.title.split(" — ")[0]; }
function done(msg){ save(); renderBoard(); renderInbox(); closeDrawer(); toast(msg); }


let tmr=null;
function toast(m){ const el=document.getElementById("toast"); el.textContent=m; el.classList.add("on"); clearTimeout(tmr); tmr=setTimeout(()=>el.classList.remove("on"),2400); }
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmt(s){ return esc(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>"); }
/** 저장소 파일 주소 — 관제탑에서 실물을 바로 열어보게 한다 */
function ghLink(path){
  const r=STATE.repo||{};
  return r.owner&&r.name ? "https://github.com/"+r.owner+"/"+r.name+"/blob/"+r.branch+"/"+path : "#";
}
/** 복사 — 누른 버튼에 결과를 그 자리에서 보여준다(어디로 갔는지 모르게 두지 않는다) */
async function copyText(text, btn, okLabel){
  try{
    await navigator.clipboard.writeText(text);
    if(btn){ const old=btn.textContent; btn.textContent=okLabel||"복사됨 ✓"; setTimeout(()=>{ btn.textContent=old; },1600); }
    else toast("복사했습니다");
  }catch(e){ toast("복사 실패 — 직접 선택해 복사해주세요"); }
}


/* ══════════ 소재 보드 — research/ideas.json 을 직접 되쓴다 ══════════
 * 복사-붙여넣기 우회 없음. 오너가 누르는 즉시 저장소에 커밋된다.
 * 저장은 800ms 디바운스로 묶어 연타 시 커밋이 쏟아지지 않게 한다. */
let IDEAS = JSON.parse(JSON.stringify((STATE.ideas||{}).items||[]));
const ICATS = ((STATE.ideas||{}).cats)||[];
const IPATH = (STATE.ideas||{}).path || "research/ideas.json";
let saveTimer=null, saveReason="";
/** 최근 삭제 사유 — 저장소에 쌓인 것 + 이번 화면에서 추가한 것 */
const RECENT_DROPS=((STATE.recentDrops)||[]).slice();

/** GitHub 오류를 사람이 읽을 수 있게 줄인다(원문 JSON은 너무 길다) */
function shortErr(e){
  const m=String(e&&e.message||e);
  const j=m.match(/"message"\s*:\s*"([^"]+)"/);
  return (j?j[1]:m).slice(0,80);
}

function setSave(kind, extra){
  const el=document.getElementById("savestate"); if(!el) return;
  const map={ok:["ok","✔ 저장됨"],saving:["saving","● 저장 중…"],bad:["bad","✕ 저장 실패"],off:["off","🔌 연결 필요"]};
  const [cls,txt]=map[kind]||map.off;
  el.className="s "+cls;
  el.textContent=txt+(kind==="ok"?" · "+new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"}):"")+(extra?" · "+extra:"");
}

/** 저장 예약 — 연타를 한 커밋으로 묶는다 */
function queueSave(reason){
  saveReason=reason||saveReason||"소재 보드 갱신";
  if(!GH.connected()){ setSave("off"); return; }
  setSave("saving");
  clearTimeout(saveTimer);
  saveTimer=setTimeout(flushSave, 800);
}

async function flushSave(){
  if(!GH.connected()){ setSave("off"); return; }
  const reason=saveReason; saveReason="";
  try{
    // 소재 저장도 같은 줄에 세운다 — 발행 승인과 겹쳐도 충돌하지 않게
    await GH.serial(async()=>{
    // 저장 직전에 원격을 다시 읽어 sha를 맞춘다(다른 기기·세션과의 충돌 방지).
    // 그래도 409가 나면 sha가 잠시 어긋난 것이므로 다시 읽어 재시도한다.
    for(let i=0;i<5;i++){
      const cur=await GH.getFile(IPATH);
      let doc;
      try{ doc=JSON.parse(cur.text); }catch(e){ doc={meta:{},cats:ICATS,ideas:[]}; }
      doc.cats=doc.cats&&doc.cats.length?doc.cats:ICATS;
      doc.ideas=IDEAS;
      doc.meta=doc.meta||{};
      doc.meta.updated=STATE.generatedFrom;
      try{ await GH.putFile(IPATH, JSON.stringify(doc,null,2)+"\n", "관제탑: "+reason, cur.sha); break; }
      catch(e){ if(!GH.isConflict(e)||i===4) throw e;
        await new Promise(r=>setTimeout(r,400*Math.pow(2,i))); }
    }
    });
    setSave("ok");
  }catch(e){ setSave("bad", shortErr(e)); }
}

function ideaById(id){ return IDEAS.find(x=>x.id===id); }

/* ══ 소재 보드 ══
 * 2026-07-26 간소화. 이전엔 승인(✓)·보류(⏸)·반려(✕)·삭제(🗑)가 다 있었는데
 * 실제로 오너가 하는 일은 두 가지뿐이다: **이걸 만들자** 아니면 **이건 아니다**.
 *   ▶ 진행 → 파이프라인 기획안으로 (= 승인)
 *   ✎ 수정 → 제목·이유·출처 다듬기
 *   🗑 삭제 → 목록에서 뺀다. 사유를 적으면 회사가 학습하고, 비우면 그냥 지운다
 * '보류'는 결정을 미루는 버튼인데, 안 누르고 두는 것과 같아서 없앴다.
 * '반려'는 삭제와 결과가 같아서 삭제 하나로 합쳤다(사유 입력이 곧 반려 사유). */

/** 소재 보드에 남는 것 = 아직 안 고른 것. 진행·제작완료는 파이프라인/보관함이 맡는다. */
function isOpenIdea(i){ return !(i.status==="done") && !(Number(i.stage||0)>=1); }

function ideaCard(i){
  return '<div class="idea" data-iid="'+esc(i.id)+'">'
    +'<div class="imain"><div class="it">'+esc(i.title)+(i.isNew?'<span class="iflag">NEW</span>':"")+'</div>'
    +'<div class="iw">'+esc(i.why||"")+'</div></div>'
    +'<div class="iside"><span class="isrc">'+esc(i.source||"출처 미정")+'</span>'
    +'<div class="ibtns">'
    +'<button class="ib go" data-ia="go" title="이 소재로 진행 — 파이프라인 기획안으로 올립니다">▶</button>'
    +'<button class="ib sm ed" data-ia="edit" title="수정">✎</button>'
    +'<button class="ib sm dl" data-ia="delete" title="삭제 — 사유를 적으면 회사가 학습합니다">🗑</button>'
    +'</div></div>'
    +'<div class="iedit">'
    +'<label class="elab">제목<input class="e-t" value="'+esc(i.title)+'" placeholder="예: 서울 25구 신고가 지도"></label>'
    +'<label class="elab">왜 이 소재인가<input class="e-w" value="'+esc(i.why||"")+'" placeholder="터질 것 같은 이유 한 줄"></label>'
    +'<label class="elab">데이터 출처<input class="e-s" value="'+esc(i.source||"")+'" placeholder="예: 국토부 실거래 + 서울시 행정경계"></label>'
    +'<div class="row"><button data-ia="cancel">취소</button><button class="sv" data-ia="save">저장</button></div>'
    +'</div></div>';
}

/** 삭제 사유 — 적으면 학습 신호, 비우면 그냥 삭제. 취소하면 아무 일도 없다. */
function askDeleteReason(title){
  return prompt(
    "「"+title+"」 을(를) 목록에서 지웁니다.\n\n"
    +"왜 지우는지 한 줄 적으면 회사가 학습해 비슷한 소재를 다시 안 가져옵니다.\n"
    +"(예: "+REASONS.join(" / ")+")\n\n"
    +"그냥 지우려면 비워 두고 확인을 누르세요.", "");
}

function renderIdeas(){
  applyLock();
  const box=document.getElementById("ideaBody"); if(!box) return;
  const open=IDEAS.filter(isOpenIdea);
  let html="";
  ICATS.forEach(c=>{
    const list=open.filter(i=>i.cat===c.key);
    if(!list.length) return;
    html+='<div class="igrp"><h4>'+esc(c.label)+'<span class="c">'+list.length+'</span></h4>'
      +list.map(ideaCard).join("")+'</div>';
  });
  box.innerHTML=html||'<div class="empty">고를 소재가 없습니다 — [새 소재 발굴]을 눌러보세요</div>';
  const n=document.getElementById("icount"); if(n) n.textContent=open.length+"건";
  // 진행·완료로 넘어간 것은 여기 두지 않는다. 어디로 갔는지만 알려준다.
  const mv=document.getElementById("imoved");
  if(mv){
    const inPipe=IDEAS.filter(i=>Number(i.stage||0)>=1 && i.status!=="done").length;
    const done=IDEAS.filter(i=>i.status==="done").length;
    mv.innerHTML=(inPipe||done)
      ? '진행 중 <b>'+inPipe+'</b>건은 <button class="lnk" data-go="board">파이프라인</button>에, '
        +'완료 <b>'+done+'</b>건은 <button class="lnk" data-go="archive">보관함</button>에 있습니다.'
      : "";
    mv.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{
      openTab(b.dataset.go); history.replaceState(null,"","#"+b.dataset.go); });
  }
  wireIdeas();
}

function wireIdeas(){
  document.querySelectorAll("[data-iid]").forEach(card=>{
    const i=ideaById(card.dataset.iid); if(!i) return;
    card.querySelectorAll("[data-ia]").forEach(b=>b.onclick=()=>{
      const act=b.dataset.ia;
      if(act==="cancel"){ card.classList.remove("editing"); return; }
      // 미연결 상태에서 바꾸면 새로고침 시 사라진다 → 아예 바꾸지 않고 연결을 요구한다
      if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
      if(act==="edit"){ card.classList.add("editing"); card.querySelector(".e-t").focus(); return; }

      // ▶ 진행 — 소재를 파이프라인 '기획안'으로. 소재↔파이프라인 단일 배관.
      if(act==="go"){
        i.stage=1; i.at=STATE.dateLabel;
        queueSave("소재 진행 — "+i.title);
        pushDecision("▶ 진행: "+i.title+" → 기획안"+(i.why?" (사유: "+i.why+")":""), "기획안으로 올림");
        renderIdeas(); renderInbox(); renderBoard();
        toast("파이프라인 기획안으로 올렸습니다");
        return;
      }
      if(act==="save"){
        const t=(card.querySelector(".e-t").value||"").trim();
        if(!t){ toast("제목은 비울 수 없습니다"); return; }
        i.title=t; i.why=(card.querySelector(".e-w").value||"").trim(); i.source=(card.querySelector(".e-s").value||"").trim();
        queueSave("소재 수정 — "+t); renderIdeas(); toast("수정됨");
        return;
      }
      // 🗑 삭제 — 사유를 적으면 학습 신호로 남기고, 비우면 그냥 지운다.
      if(act==="delete"){
        const why=askDeleteReason(i.title);
        if(why===null) return;            // 취소 — 아무 일도 안 일어난다
        const w=why.trim();
        IDEAS=IDEAS.filter(x=>x.id!==i.id);
        queueSave("소재 삭제 — "+i.title);
        // 사유가 있을 때만 결정 로그에 남긴다(빈 삭제까지 로그를 채우면 신호가 묻힌다)
        if(w){ RECENT_DROPS.push(w); pushDecision("🗑 소재 삭제: "+i.title+" — 이유: "+w, "삭제 사유 기록됨"); }
        else toast("삭제됨 (저장소 이력에는 남습니다)");
        renderIdeas(); renderInbox();
        return;
      }
    });
  });
}

/* ══════════ 지시함 ══════════
 * 오너가 칸을 나눠 채우게 하지 않는다. 기사 링크든 메모든 지시문이든
 * **그냥 한 칸에 적으면** 저장소에 쌓이고, 다음 작업이 그걸 읽고 처리한다.
 * (브라우저에서 LLM을 돌릴 수는 없으므로 "즉답"은 안 된다 — 대신 무엇이 접수됐고
 *  어떻게 처리될지를 그 자리에서 분명히 말해준다. 말없이 삼키지 않는다.) */
const ASKLOG_KEY="wirit-asklog";
function askLog(){ try{ return JSON.parse(localStorage.getItem(ASKLOG_KEY)||"[]"); }catch(e){ return []; } }
function askLogPush(e){ const l=askLog(); l.unshift(e); localStorage.setItem(ASKLOG_KEY, JSON.stringify(l.slice(0,20))); renderAskLog(); }
function renderAskLog(){
  const el=document.getElementById("asklog"); if(!el) return;
  const l=askLog();
  if(!l.length){ el.innerHTML='<span class="howto-note">아직 없습니다.</span>'; return; }
  el.innerHTML=l.map(e=>'<div class="askitem"><div class="asktxt">'+esc(e.text)+'</div>'
    +'<div class="askmeta">'+esc(e.at)+' · '+esc(e.kind)+'</div></div>').join("");
}

/* 검색어를 뽑는다 — "전세가율 지도, 전세난 정도 등 전세 관련 데이터 시각화 소재들 찾아줘"
 * 를 그대로 뉴스에 넣으면 아무것도 안 나온다. 지시하는 말(찾아줘·모아줘)과 조사를 걷어내고
 * 남은 낱말만 검색어로 쓴다. 결정적 코드다 — LLM 안 쓴다. */
const ASK_STOP=/^(찾아줘|찾아|찾기|모아줘|모아|모아서|만들어줘|만들어|만들|해줘|해봐|해서|알아봐|알아|정리해줘|정리해|정리|주세요|관련된|관련|다양한|여러가지|여러|일단|다시|좀|정도|자료들|자료|데이터|소재들|소재|기사나|기사|언론사들|언론사|있을거야|있을|발표한|발표|매기는|카드|뽑아|보여줘|필요해|같은|것들|이런|그런|저런|우리|지금|오늘|내일)$/;
function keywordsOf(text){
  const toks=String(text||"").replace(/[^0-9A-Za-z가-힣\s]/g," ").split(/\s+/).filter(Boolean);
  const out=[];
  for(let w of toks){
    w=w.replace(/(으로|로서|에서|에게|에는|에|을|를|이|가|은|는|의|와|과|도|만|들)$/,"");
    if(w.length<2 || ASK_STOP.test(w) || out.indexOf(w)>-1) continue;
    out.push(w);
    if(out.length>=5) break;
  }
  return out.join(" ");
}

/** 적어 넣은 내용을 보고 무엇으로 접수할지 판단한다 — 오너가 고르게 하지 않는다.
 *  ⚠️ note 에는 **실제로 일어날 일**만 적는다. "다음 작업 때"처럼 언제인지 모르는 말은
 *     그 자체가 오너를 기다리게 만든 원인이었다(2026-07-26). */
function classifyAsk(text){
  const t=text.trim();
  if(/https?:\/\//.test(t)) return { kind:"자료(링크)", to:"research/INBOX.md", auto:"none",
    note:"링크를 자료로 접수했습니다. 아래 '내가 시킨 일'에서 처리 상태를 볼 수 있습니다." };
  // 자료를 찾아달라 = 지금 바로 수집을 돌릴 수 있다. 이게 가장 흔한 지시다.
  if(/찾아|모아|조사|알아봐|검색|수집|자료|데이터/.test(t) && !/만들어|제작|카드로/.test(t))
    return { kind:"자료 조사", to:"digest", auto:"digest",
      note:"수집을 시작했습니다 — 2~3분 뒤 왼쪽 보드에 새 소재로 뜹니다." };
  if(/만들|뽑아|해줘|해봐|카드|제작|수정|바꿔|다시/.test(t)) return { kind:"작업 지시", to:"research/decisions-inbox.md", auto:"none",
    note:"작업 지시로 접수했습니다. 이건 자동으로는 안 되고 작업 세션이 처리합니다 — 상태는 '내가 시킨 일'에서 보세요." };
  if(t.length<=60) return { kind:"소재 등록", to:"ideas", auto:"none",
    note:"소재로 등록했습니다 — 왼쪽 보드에서 바로 확인하세요." };
  return { kind:"자료(메모)", to:"research/INBOX.md", auto:"none",
    note:"자료로 접수했습니다. 상태는 '내가 시킨 일'에서 보세요." };
}

/**
 * 요청 대장에 한 줄 남긴다 — 오너가 시킨 일이 **어디에도 안 남는** 일이 없게.
 * 이 대장이 화면의 '내가 시킨 일'을 만든다.
 */
function logRequest(kind, what, about, auto, run){
  if(!GH.connected()) return Promise.resolve();
  const PATH="data/requests.json";
  return GH.serial(async()=>{
    for(let i=0;i<6;i++){
      const cur=await GH.getFile(PATH);
      let doc; try{ doc=JSON.parse(cur.text); }catch(e){ doc={}; }
      if(!Array.isArray(doc.items)) doc.items=[];
      const row={ id:"req-"+Date.now().toString(36), at:STATE.dateLabel, ts:new Date().toISOString(),
        kind:kind, what:String(what||"").slice(0,400), about:about||"", auto:auto||"none",
        run:run||"", done:false };
      doc.items.push(row);
      try{
        await GH.putFile(PATH, JSON.stringify(doc,null,2)+"\n", "관제탑: 요청 접수 — "+kind, cur.sha);
        REQS.push(row); renderReqs();
        return row;
      }catch(e){ if(!GH.isConflict(e)||i===5) throw e;
        await new Promise(r=>setTimeout(r,500*Math.pow(2,i))); }
    }
  });
}

/** 소재 분류를 내용으로 고른다 — 예전엔 첫 카테고리를 그냥 써서
 *  새로 넣은 소재가 '✅ 제작 완료' 칸에 들어갔다(2026-07-26 오너 화면). */
function pickCat(text){
  const t=String(text||"");
  const R=[[/부동산|아파트|전세|월세|분양|재건축|토허|실거래|집값/,"부동산"],
    [/증시|코스피|코스닥|주식|환율|금리|경제/,"경제"],
    [/연봉|월급|초봉|자산|저축|투자|소득/,"돈"],
    [/지하철|교통|철도|GTX|버스/,"지하철"]];
  for(const [re,key] of R){ if(!re.test(t)) continue;
    const hit=ICATS.find(c=>c.key.indexOf(key)>-1||c.label.indexOf(key)>-1);
    if(hit) return hit.key; }
  const novel=ICATS.find(c=>/참신|통계|novel/.test(c.key+c.label));
  return (novel||ICATS[ICATS.length-1]||{}).key||"misc";
}

function wireIdeaTools(){
  renderAskLog();

  const send=document.getElementById("asksend");
  if(send) send.onclick=async()=>{
    const ta=document.getElementById("ask");
    const v=(ta.value||"").trim();
    const hint=document.getElementById("askhint");
    if(!v){ toast("무엇을 할지 적어주세요"); ta.focus(); return; }
    if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }

    const c=classifyAsk(v);
    jobStart("ask","보내는 중"); setSave("saving");
    try{
      if(c.to==="ideas"){
        // 짧은 한 줄은 소재로 바로 등록한다 — 화면에서 즉시 보인다
        IDEAS.push({ id:"ask-"+Date.now().toString(36), cat:pickCat(v),
          title:v.slice(0,90), why:"오너 직접 입력", source:"지시함", state:"", status:"", isNew:true });
        await new Promise(r=>{ queueSave("소재 추가 — "+v.slice(0,40)); setTimeout(r,900); });
        renderIdeas();
      } else if(c.to==="digest"){
        // "OO 자료 찾아줘" → 그 말에서 검색어를 뽑아 **지금 수집을 돌린다**.
        // 예전엔 여기서 기록만 하고 끝나 아무 일도 안 일어났다.
        const q=keywordsOf(v);
        await GH.append("research/decisions-inbox.md",
          "- "+ghStamp()+" 🔎 자료 조사: "+v.replace(/\n+/g," / ")+(q?"  [검색어: "+q+"]":""), "관제탑: 자료 조사 요청");
        await GH.dispatch("research-digest.yml", q?{query:q}:{});
        c.note="검색어 «"+(q||"기본 주제")+"» 로 수집을 시작했습니다 — 2~3분 뒤 왼쪽 보드에 뜹니다.";
        startWatching();
      } else {
        await GH.append(c.to, "- "+ghStamp()+" "+v.replace(/\n+/g," / "), "관제탑: "+c.kind);
      }
      await logRequest(c.kind, v, "", c.auto);
      setSave("ok");
      askLogPush({ text:v.slice(0,160), at:STATE.dateLabel, kind:c.kind });
      ta.value="";
      if(hint) hint.textContent="✔ "+c.note;
      jobEnd("ask", c.kind+"로 접수했습니다");
      renderInbox();
    }catch(e){ const m=shortErr(e); setSave("bad", m); jobEnd("ask", m, true); }
  };
  // Ctrl/⌘+Enter 로도 보낸다 — 채팅창처럼
  const ta=document.getElementById("ask");
  if(ta) ta.onkeydown=(e)=>{ if((e.metaKey||e.ctrlKey)&&e.key==="Enter"){ e.preventDefault(); send&&send.click(); } };

  // 새 소재 찾아줘 — 수집을 돌리고, 끝나면 자동으로 보드에 반영된다
  const dig=document.getElementById("askmine");
  if(dig) dig.onclick=async()=>{
    if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
    const dir=(document.getElementById("ask").value||"").trim();
    jobStart("mine","소재 찾는 중");
    try{
      const avoid=RECENT_DROPS.slice(-5);
      await GH.append("research/decisions-inbox.md",
        "- "+ghStamp()+" 🔎 새 소재 발굴"+(dir?" — "+dir.replace(/\n+/g," / "):"")
        +(avoid.length?" [피할 것: "+avoid.join(" / ")+"]":""), "관제탑: 소재 발굴 요청");
      await GH.dispatch("research-digest.yml",{});
      const hint=document.getElementById("askhint");
      if(hint) hint.textContent="✔ 수집을 시작했습니다 — 끝나면 왼쪽 보드에 새 소재가 자동으로 뜹니다(2~3분).";
      askLogPush({ text:dir||"(방향 지정 없음)", at:STATE.dateLabel, kind:"소재 발굴" });
      document.getElementById("ask").value="";
      jobEnd("mine","수집 시작 — 끝나면 자동 반영");
      startWatching();
    }catch(e){ const m=shortErr(e); jobEnd("mine", m, true); }
  };
}

/* 연결 뱃지 토글 — 바깥을 누르면 닫힌다 */
const connBtn=document.getElementById("connbtn");
if(connBtn) connBtn.onclick=(e)=>{ e.stopPropagation(); document.getElementById("connpop").classList.toggle("on"); };
document.addEventListener("click",(e)=>{
  const pop=document.getElementById("connpop");
  if(pop&&pop.classList.contains("on")&&!pop.contains(e.target)) pop.classList.remove("on");
});

/* 보관함 — 캡션 복사 */
document.querySelectorAll(".fcopy").forEach(b=>{
  b.onclick=async(e)=>{
    e.preventDefault(); e.stopPropagation();
    const src=document.querySelector('.capsrc[data-for="'+b.dataset.cap+'"]');
    if(!src) return;
    try{ await navigator.clipboard.writeText(JSON.parse(src.textContent)); toast("캡션을 복사했습니다"); }
    catch(err){ toast("복사 실패 — 캡션을 직접 선택해 복사해주세요"); }
  };
});

/* 지표 클릭 → 해당 화면 */
document.querySelectorAll("[data-go]").forEach(b=>{
  b.onclick=()=>{ openTab(b.dataset.go); history.replaceState(null,"","#"+b.dataset.go); };
});

renderConn();
renderBoard();
renderIdeas();
renderInbox();
renderReqs();
wireIdeaTools();
applyLock();
if(location.hash) openTab(location.hash.slice(1));
setSave(GH.connected()?"ok":"off");
if(GH.connected()){ startWatching(); refreshFromRepo(); }
// 탭을 다시 보면 그동안 바뀐 게 있는지 확인한다 — 새로고침을 누를 일이 없게
document.addEventListener("visibilitychange",()=>{
  if(document.hidden||!GH.connected()) return;
  pollRuns(); refreshFromRepo();
});
`;

function esc(s: unknown): string {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 소재 탭 — 마이닝(요청·자료 인박스)과 아이디어 보드를 한 화면에. */
function ideasHtml(state: TowerState): string {
  const items = state.ideas.items;
  const open = items.filter((i) => i.status !== "done" && !Number(i.stage || 0)).length;
  const weights = state.mining.weights.map((w) => `<span class="wchip">${esc(w.label)} ${w.pct}%</span>`).join("");

  return `<div class="ideas">
  <section class="ipanel">
    <div class="ih">소재 보드<span class="n num" id="icount">${open}건</span></div>
    <div class="igate" id="igate" hidden></div>
    <div class="moved" id="imoved"></div>
    <div id="ideaBody"></div>
  </section>

  <aside class="ipanel askpanel" data-lock>
    <div class="ih">지시함</div>
    <div class="howto-note" style="margin-bottom:9px">
      기사 링크·수치·메모·작업 지시… <b>아무거나 그냥 적으세요.</b>
      칸을 나눠 채울 필요 없습니다 — 읽고 알아서 처리합니다.
    </div>
    <textarea id="ask" class="askbox" rows="6"
      placeholder="예)
https://n.news.naver.com/... 이 기사로 카드 하나 만들어줘

전세가율 지도 만들면 재밌을 듯

토허제 지도 7월 데이터로 다시 뽑아줘"></textarea>
    <div class="askrow">
      <button class="itool prim" id="asksend" data-job="ask">보내기</button>
      <button class="itool" id="askmine" data-job="mine">새 소재 찾아줘</button>
    </div>
    <div class="askhint" id="askhint"></div>

    <div class="ih" style="margin-top:18px">보낸 것</div>
    <div class="asklog" id="asklog"><span class="howto-note">아직 없습니다.</span></div>

    <div class="ih" style="margin-top:18px">수집 비중</div>
    <div class="wchips">${weights}</div>
  </aside>
</div>`;
}

/** esc 후 **볼드** 마크다운만 <b>로 변환 */
function fmt(s: unknown): string {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}

/** 지표 레일 — 4칸 박스가 아니라 한 줄의 활자. 누르면 그 화면으로 간다. */
function kpiHtml(state: TowerState): string {
  const go = ["today", "board", "ideas", "assets"];
  return state.kpi
    .map((k, i) => {
      // '결재 대기'만 0보다 클 때 색을 얻는다 — 색은 신호이지 장식이 아니다
      const hot = i === 0 && k.value !== "0" ? " hot" : "";
      return `<button type="button" class="kpi${hot}" data-go="${go[i] || "today"}">` +
        `<span class="v">${esc(k.value)}</span>` +
        `<span class="l">${esc(k.label)}</span>` +
        `<span class="n">${esc(k.note)}</span></button>`;
    })
    .join("");
}

/**
 * 회사 — CEO를 정점으로 한 실제 조직도.
 * 카드를 늘어놓는 게 아니라 **보고 계통과 일의 흐름**을 그린다.
 *   CEO (오너 판단의 누적)
 *    └ 오케스트레이터 (실장 — 파이프라인을 굴린다)
 *       └ 발굴 → 기획 → 제작 → 검수 → 발행  (5개 본부)
 * 팀을 누르면 그 팀의 가치관·책임·업무기준이 열린다.
 */
function companyHtml(state: TowerState): string {
  const { owner, name, branch } = state.repo;
  const ghEdit = (path: string): string =>
    owner && name ? `https://github.com/${owner}/${name}/edit/${branch}/${path}` : "";
  const ghLink = (path: string, label: string): string => {
    const u = ghEdit(path);
    return u ? `<a class="ebtn gh" href="${esc(u)}" target="_blank" rel="noopener">${esc(label)} ↗</a>` : "";
  };

  const bySlug = new Map(state.company.teams.map((t) => [t.slug, t]));
  const placed = new Set<string>();
  const node = (slug: string, cls = ""): string => {
    const t = bySlug.get(slug);
    if (!t) return "";
    placed.add(slug);
    return `<button type="button" class="onode ${cls}" data-team="${esc(t.slug)}">
      <span class="oe">${esc(t.emoji)}</span>
      <span class="on">${esc(t.name)}</span>
      <span class="olv">${esc(t.autonomy.split(/[(,]/)[0].trim())}</span>
    </button>`;
  };

  // 5개 본부 — 일이 흐르는 순서 그대로
  const DIV: { label: string; note: string; slugs: string[] }[] = [
    { label: "발굴", note: "무엇을 만들지", slugs: ["trend-analysis", "research"] },
    { label: "기획", note: "어떻게 만들지", slugs: ["planning", "asset-hub"] },
    { label: "제작", note: "실제로 만든다", slugs: ["editing", "design"] },
    { label: "검수", note: "틀린 게 없는지", slugs: ["qa"] },
    { label: "발행·운영", note: "내보내고 굴린다", slugs: ["marketing"] },
  ];
  const divisions = DIV.map(
    (d) => `<div class="odiv">
      <div class="odivh"><span class="odivl">${esc(d.label)}</span><span class="odivn">${esc(d.note)}</span></div>
      <div class="odivb">${d.slugs.map((s) => node(s)).join("")}</div>
    </div>`
  ).join('<span class="oarrow" aria-hidden="true">→</span>');

  const orch = node("orchestrator", "lead");
  const rest = state.company.teams.filter((t) => !placed.has(t.slug));

  // 팀 상세 — 기본 숨김. 조직도에서 누르면 열린다.
  const panels = state.company.teams
    .map(
      (t) => `<section class="tpanel" id="team-${esc(t.slug)}" hidden>
      <div class="tphead"><span class="te">${esc(t.emoji)}</span><b>${esc(t.name)}</b>
        <button class="ebtn" data-teamclose>닫기</button></div>
      <div class="tprow"><span class="k">가치관</span><span>${esc(t.values)}</span></div>
      ${t.responsibility ? `<div class="tprow"><span class="k">책임</span><span>${esc(t.responsibility)}</span></div>` : ""}
      <div class="tprow"><span class="k">자동화</span><span>${esc(t.autonomy)} · 학습 기록 ${t.logCount}건</span></div>
      <div class="teamtools">
        <button class="ebtn" data-te="${esc(t.slug)}|${esc(t.name)}">업무기준 수정지시</button>
        ${ghLink(t.path, "사원카드")}${t.hasPrompt ? ghLink(t.promptPath, "프롬프트") : ""}
      </div>
      <div class="edarea" data-te-area="${esc(t.slug)}">
        <div class="edhint">이 팀의 원칙·업무기준을 어떻게 바꿀까요? 기록하면 저장소에 남고 다음 작업부터 반영됩니다.</div>
        <textarea placeholder="예) 데이터 가용성 2점 미만 소재는 후보에서 자동 제외"></textarea>
        <button class="ebtn save" data-te-save="${esc(t.slug)}|${esc(t.name)}">기록하기</button>
      </div>
    </section>`
    )
    .join("");

  const cats = Object.entries(state.company.principles)
    .map(
      ([cat, list]) =>
        `<div class="pcat"><h3>${esc(cat)}</h3>${list
          .map((p) => `<div class="pr"><span class="d">${esc(p.date)}</span><span>${fmt(p.text)}</span></div>`)
          .join("")}</div>`
    )
    .join("");

  return (
    `<div class="wrap wide">` +
    `<div class="sect">조직도</div>` +
    `<div class="org">` +
      // 정점 — CEO
      `<button type="button" class="onode ceo" data-ceo>` +
        `<span class="oe">🧠</span><span class="on">CEO</span>` +
        `<span class="osub">오너 판단의 누적 · 원칙 ${state.company.principlesCount}개</span>` +
      `</button>` +
      `<span class="ostem" aria-hidden="true"></span>` +
      // 실장 — 파이프라인을 굴린다
      `<div class="orow">${orch}</div>` +
      `<span class="ostem" aria-hidden="true"></span>` +
      // 5개 본부
      `<div class="odivs">${divisions}</div>` +
      (rest.length
        ? `<div class="odiv solo"><div class="odivh"><span class="odivl">기타</span></div>
           <div class="odivb">${rest.map((t) => node(t.slug)).join("")}</div></div>`
        : "") +
    `</div>` +
    panels +
    `<details class="ceo-box" id="ceoBox"><summary>CEO 판단 원칙 ${state.company.principlesCount}개 — 회사 전체에 적용되는 기준` +
    `<span class="secttools"><button class="ebtn" data-ce>원칙 추가·수정</button>${ghLink(state.company.ceoPath, "GitHub")}</span></summary>` +
    `<div class="edarea" id="ed-ceo"><div class="edhint">추가하거나 고칠 원칙을 적으세요. 기록하면 저장소 결정 로그에 남고 다음 세션에서 CEO.md에 반영됩니다.</div>` +
    `<textarea placeholder="예) 표 헤더는 잉크 배경에 흰 글씨로"></textarea>` +
    `<button class="ebtn save" data-ce-save>기록하기</button></div>` +
    cats +
    `</details>` +
    `</div>`
  );
}

/**
 * 보관함 — 완성 작업물이 주제별로 자동 정리돼 모인다.
 * 목록에서 바로 실물(카드 그림)을 보고, 눌러서 캡션 전문·원본 파일까지 연다.
 */
function archiveHtml(state: TowerState): string {
  const fold = state.archive || [];
  const { owner, name, branch } = state.repo;
  const gh = (path: string): string =>
    owner && name ? `https://github.com/${owner}/${name}/blob/${branch}/${path}` : "";

  if (!fold.length) {
    return `<div class="wrap"><div class="sect">보관함</div>
      <div class="allclear"><div class="t">아직 완성된 작업물이 없습니다</div>
      <div class="w">카드를 만들고 <code>data/review/sets.json</code>에 등록하면 여기 주제별로 쌓입니다.</div></div></div>`;
  }
  const total = fold.reduce((a, f) => a + f.count, 0);
  const badge = (st: string): string =>
    st === "발행됨" ? '<span class="tagx ok">발행됨</span>'
    : st === "발행 대기" ? '<span class="tagx hot">발행 대기</span>'
    : '<span class="tagx">미승인</span>';

  const fileLink = (p: string, label: string): string => {
    const u = gh(p);
    return u ? `<a class="flink" href="${esc(u)}" target="_blank" rel="noopener">${esc(label)} ↗</a>` : "";
  };

  const folders = fold
    .map(
      (f) => `<section class="folder">
      <div class="fhead"><span class="fname">${esc(f.topic)}</span><span class="fn num">${f.count}</span></div>
      ${f.items
        .map((w) => {
          // 저장소에 실제로 있는 것만 링크한다(없는 파일에 링크를 걸면 전부 404다)
          const files =
            (w.files.caption ? fileLink(w.files.caption, "캡션 원본") : "") +
            (w.files.review ? fileLink(w.files.review, "검수 리포트") : "") +
            w.files.content.map((p, i) => fileLink(p, `카드 ${i + 1}`)).join("") +
            w.files.png.map((p, i) => fileLink(p, `PNG ${i + 1}`)).join("");
          const rebuilt = (w.rebuilt?.content.length || 0) + (w.rebuilt?.png.length || 0);
          const shots = w.shots || [];
          return `<details class="fitem">
          <summary class="fsum">
            ${w.thumb ? `<img class="fthumb" src="${esc(state.images[w.thumb] || "")}" alt="">`
                      : '<span class="fthumb"></span>'}
            <span class="fmain"><span class="ft">${esc(w.title)}</span>
              <span class="fmeta num">${esc(w.date || "-")} · 카드 ${w.cards}장${
                w.pages ? ` · 렌더 ${w.pages}장` : " · 렌더 없음"
              }${w.captionChars ? ` · 캡션 ${w.captionChars}자` : " · 캡션 없음"}${
                w.verdict ? ` · 검수 ${esc(w.verdict)}` : ""
              }</span></span>
            <span class="fside">${badge(w.state)}</span>
          </summary>
          <div class="fbody">
            ${shots.length
              ? `<div class="fcards"><div class="eyebrow">완성 카드 ${shots.length}장 — 누르면 원본이 열립니다(수동 업로드용)</div>
                 <div class="fstrip">${shots
                   .map((k, i) => `<a href="${esc(state.images[k] || k)}" target="_blank" rel="noopener"><img src="${esc(
                     state.images[k] || k
                   )}" alt="${i + 1}장" loading="lazy"></a>`)
                   .join("")}</div></div>`
              : `<div class="howto-note">완성 카드 이미지가 아직 없습니다(다음 배포에서 다시 그려집니다).</div>`}
            ${state.builders.includes(w.label)
              ? `<div class="ract" style="margin:10px 0 2px"><button class="itool fremake" data-remake="${esc(w.label)}">🔁 최신 데이터로 다시 제작</button>
                 <span class="howto-note" style="align-self:center">클로드 없이 돕니다 — 데이터 다시 계산 → 렌더 → 자동검수 → 화면 반영(5~8분)</span></div>`
              : `<div class="howto-note" style="margin-top:8px">이 카드는 자동 재생산 빌더가 아직 없습니다 — 첫 제작은 작업 세션이 합니다.</div>`}
            ${w.caption
              ? `<div class="fcap"><div class="eyebrow">업로드 캡션</div><pre class="cap">${esc(w.caption)}</pre>
                 <button class="ebtn fcopy" data-cap="${esc(w.label)}">캡션 복사</button></div>`
              : `<div class="howto-note">캡션이 아직 없습니다 — 발행하려면 <code>data/review/captions/${esc(w.label)}.txt</code>가 필요합니다.</div>`}
            ${w.reviewSummary ? `<div class="frv">${esc(w.reviewSummary)}</div>` : ""}
            <div class="ffiles"><div class="eyebrow">저장소 원본</div>
              <div class="flinks">${files || '<span class="howto-note">저장소에 남는 파일 없음</span>'}</div>
              ${rebuilt ? `<div class="howto-note" style="margin-top:6px">
                카드 JSON·PNG ${rebuilt}개는 용량 때문에 저장소에 두지 않습니다 —
                재료(<code>data/datasets</code>)에서 <b>매번 다시 그립니다</b>. 그래서 링크 대신 위에 실물을 띄웁니다.
              </div>` : ""}
            </div>
          </div>
        </details>`;
        })
        .join("")}
    </section>`
    )
    .join("");

  // 캡션 복사를 위해 원문을 숨겨 둔다(클릭 시 클립보드로)
  const capData = fold
    .flatMap((f) => f.items)
    .filter((w) => w.caption)
    .map((w) => `<script type="application/json" class="capsrc" data-for="${esc(w.label)}">${JSON.stringify(w.caption)}</script>`)
    .join("");

  return `<div class="wrap">
    <div class="sect">보관함 — 완성 작업물 ${total}건 · 주제 ${fold.length}개</div>
    <div class="howto-note" style="margin:-4px 2px 14px">
      만들 때 정한 분류대로 <b>자동으로 묶입니다</b>. 항목을 누르면 <b>캡션 전문</b>과
      <b>저장소 원본</b>(카드 JSON·PNG·검수 리포트) 링크가 열립니다.
    </div>
    <div class="folders">${folders}</div>${capData}
  </div>`;
}

/**
 * 성과 — 발행한 카드가 실제로 어떻게 됐나.
 * **저장 수**가 우리 계정의 핵심 지표다(저장해두고 다시 볼 카드를 만드는 계정이니까).
 */
function perfHtml(state: TowerState): string {
  const rows = state.perf?.rows || [];
  const { owner, name, branch } = state.repo;
  const edit = owner && name
    ? `https://github.com/${owner}/${name}/edit/${branch}/${state.perf.path}` : "";

  if (!rows.length) {
    return `<div class="wrap"><div class="sect">성과</div>
      <div class="allclear"><div class="t">아직 성과 데이터가 없습니다</div>
      <div class="w">첫 카드를 발행하면 여기에 <b>도달 · 저장 · 좋아요 · 댓글</b>이 쌓입니다.<br>
      인스타 토큰(<code>IG_ACCESS_TOKEN</code>)이 붙으면 <b>매일 아침 자동으로</b> 채워지고,
      그 전에는 아래 버튼으로 직접 적으시면 됩니다 — 한 줄이라도 적는 편이 훨씬 낫습니다.</div>
      ${edit ? `<div style="margin-top:10px"><a class="ebtn" href="${esc(edit)}" target="_blank" rel="noopener">성과 직접 입력 ↗</a></div>` : ""}
      </div></div>`;
  }

  const num = (v: string): number => {
    const n = parseInt(String(v).replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? n : 0;
  };
  const saved = rows.map((r) => num(r.saved)).filter((n) => n > 0);
  const avg = saved.length ? Math.round(saved.reduce((a, b) => a + b, 0) / saved.length) : 0;
  const best = rows.slice().sort((a, b) => num(b.saved) - num(a.saved))[0];
  const maxSaved = Math.max(1, ...saved);

  const body = rows
    .map((r) => {
      const s = num(r.saved);
      const pct = Math.round((s / maxSaved) * 100);
      return `<div class="prow">
        <div class="pmain"><div class="pt">${esc(r.card)}</div>
          <div class="pmeta num">${esc(r.date)}${r.memo ? ` · ${esc(r.memo)}` : ""}</div></div>
        <div class="pbars">
          <div class="pbar"><span class="pk">저장</span>
            <span class="ptrack"><i style="width:${pct}%"></i></span>
            <span class="pv num">${esc(r.saved || "-")}</span></div>
          <div class="psub num">도달 ${esc(r.reach || "-")} · 좋아요 ${esc(r.likes || "-")} · 댓글 ${esc(r.comments || "-")}</div>
        </div>
      </div>`;
    })
    .join("");

  return `<div class="wrap">
    <div class="sect">성과 — 발행 ${rows.length}건</div>
    <div class="pstat">
      <div class="pcell"><span class="v num">${avg}</span><span class="l">평균 저장</span></div>
      <div class="pcell"><span class="v num">${best ? esc(best.saved || "-") : "-"}</span><span class="l">최고 저장</span></div>
      <div class="pcell wide"><span class="v s">${best ? esc(best.card) : "-"}</span><span class="l">가장 많이 저장된 카드</span></div>
    </div>
    <div class="howto-note" style="margin:12px 2px 14px">
      <b>저장 수</b>가 우리 계정의 핵심 지표입니다 — 저장해두고 다시 볼 카드를 만드는 계정이니까요.
      여기서 배운 것은 <code>research/PATTERN_LIBRARY.md</code>로 올라가 다음 소재 선택에 반영됩니다.
      ${edit ? `<a class="ebtn" style="margin-left:6px" href="${esc(edit)}" target="_blank" rel="noopener">직접 입력 ↗</a>` : ""}
    </div>
    <div class="plist">${body}</div>
  </div>`;
}

function assetsHtml(state: TowerState): string {
  const groups = state.assets.groups
    .map(
      (g) =>
        `<div class="agroup"><h3>${esc(g.label)}<span class="n">${g.count}</span></h3>` +
        (g.items.length
          ? g.items
              .map((it) => `<div class="aitem"><b>${esc(it.title)}</b>${it.meta ? `<div class="m">${esc(it.meta)}</div>` : ""}</div>`)
              .join("")
          : `<div class="aitem m">항목 목록 없음</div>`) +
        `</div>`
    )
    .join("");
  return `<div class="wrap"><div class="sect">📦 자산 허브 — 재사용 자산 현황</div><div class="agrid">${groups}</div><div class="notice" style="padding-left:2px">${esc(state.assets.reuseNote)}</div></div>`;
}

export function renderTowerHtml(state: TowerState): string {
  const body = renderTowerBody(state);
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>wirit 관제탑</title>
</head>
<body>
${body}
</body>
</html>
`;
}

/**
 * 아티팩트/임베드용 본문(문서 스켈레톤 없이 style+마크업+script).
 * claude.ai 아티팩트는 <head>를 제공하므로 doctype/html/head/body를 넣지 않는다.
 */
export function renderTowerBody(state: TowerState): string {
  const stateJson = JSON.stringify(state).replace(/</g, "\\u003c");
  return `<style>${CSS}</style>
<header class="topbar">
  <span class="mark">wirit<span class="dot">.</span></span>
  <span class="sub">관제탑 · Control&nbsp;Tower</span>
  <span class="badge-live">LIVE</span>
  <span class="date">${esc(state.dateLabel)}</span>
  <button class="conn" id="connbtn" type="button"><span class="led"></span>연결 필요</button>
</header>
<div class="connpop" id="connpop"></div>

<div class="kpis">${kpiHtml(state)}</div>

<nav class="tabs">
  <button class="tab on" data-v="today">오늘<span class="c" id="tabN" hidden>0</span></button>
  <button class="tab" data-v="board">파이프라인</button>
  <button class="tab" data-v="ideas">소재</button>
  <button class="tab" data-v="company">회사</button>
  <button class="tab" data-v="archive">보관함</button>
  <button class="tab" data-v="perf">성과</button>
  <button class="tab" data-v="assets">자산</button>
</nav>

<section id="view-today" class="view on">
  <div class="inbox">
    <h2>오늘 결정할 일<span class="n num" id="inboxN" hidden>0</span></h2>
    <div id="inboxBody"></div>
  </div>
  <div class="inbox" id="reqsec" hidden>
    <h2>내가 시킨 일<span class="n num" id="reqN" hidden>0</span></h2>
    <p class="reqlead">시킨 일이 지금 어디까지 왔는지, <b>누가 하고 언제 되는지</b>를 그대로 적습니다.</p>
    <div class="handoff" id="handoff" hidden>
      <div class="hmain"><b id="handoffN">0건</b>이 작업 세션을 기다리고 있습니다
        <span class="dim">— 한 번에 복사해 채팅에 붙여넣으면 그날 치가 끝납니다</span></div>
      <button class="itool prim" id="handoffBtn">📋 밀린 일 한번에 넘기기</button>
    </div>
    <div id="reqBody"></div>
  </div>
</section>

<section id="view-board" class="view">
  <div class="pipe">
    <div class="flow" id="flow"></div>
    <main id="board"></main>
  </div>
</section>
<section id="view-ideas" class="view">${ideasHtml(state)}</section>
<section id="view-company" class="view">${companyHtml(state)}</section>
<section id="view-archive" class="view">${archiveHtml(state)}</section>
<section id="view-perf" class="view">${perfHtml(state)}</section>
<section id="view-assets" class="view">${assetsHtml(state)}</section>

<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="티켓 상세"></aside>

<footer class="savebar">
  <span class="s off" id="savestate">연결 필요</span>
  <span class="jobbar" id="jobbar" hidden></span>
  <span class="sp"></span>
  <span class="path">누르는 즉시 저장소에 기록됩니다</span>
</footer>
<div class="toast" id="toast"></div>

<script>
const STATE = ${stateJson};
${APP_JS}
</script>`;
}
