/**
 * TowerState → 정적 관제탑 HTML(자체 완결). 목업과 동일한 룩, 데이터는 주입.
 * 썸네일은 data-uri로 임베드되어 파일 하나로 열린다(아티팩트/오프라인 모두).
 */
import type { TowerState } from "./types.js";

const CSS = String.raw`
:root{
  --ink:#141821; --paper:#FAFAF8; --cobalt:#2E6BFF; --red:#E5484D;
  --gray:#5B6B7F; --line:rgba(20,24,33,.12); --band:rgba(20,24,33,.05);
  --card:#FFFFFF; --text:#141821; --ok:#1B9E6B; --warn:#C77D00;
}
@media (prefers-color-scheme: dark){
  :root{ --ink:#0E1116; --paper:#12151C; --card:#1A1F29; --text:#ECEEF2;
    --gray:#93A1B3; --line:rgba(236,238,242,.14); --band:rgba(236,238,242,.06); }
}
:root[data-theme="dark"]{ --ink:#0E1116; --paper:#12151C; --card:#1A1F29; --text:#ECEEF2;
  --gray:#93A1B3; --line:rgba(236,238,242,.14); --band:rgba(236,238,242,.06); }
:root[data-theme="light"]{ --ink:#141821; --paper:#FAFAF8; --card:#FFFFFF; --text:#141821;
  --gray:#5B6B7F; --line:rgba(20,24,33,.12); --band:rgba(20,24,33,.05); }
*{box-sizing:border-box;margin:0}
html,body{height:100%}
body{font-family:"Apple SD Gothic Neo","Noto Sans KR","Pretendard",system-ui,sans-serif;
  background:var(--paper); color:var(--text); -webkit-font-smoothing:antialiased;}
button{font:inherit;cursor:pointer;border:none;background:none;color:inherit}
button:focus-visible{outline:2px solid var(--cobalt);outline-offset:2px;border-radius:6px}

.topbar{position:sticky;top:0;z-index:30;background:var(--ink);color:#fff;
  display:flex;align-items:center;gap:14px;padding:12px 18px;}
.mark{font-weight:800;font-size:21px;letter-spacing:-.03em}
.mark .dot{color:var(--cobalt)}
.topbar .sub{font-size:13px;color:#AEB8C4;font-weight:600}
.topbar .date{margin-left:auto;font-size:13px;color:#AEB8C4;font-variant-numeric:tabular-nums}
.badge-live{font-size:11px;font-weight:800;letter-spacing:.06em;background:var(--cobalt);color:#fff;border-radius:999px;padding:4px 10px;}

/* 연결 뱃지 — 제목 행 맨 오른쪽. 한 번 연결하면 볼 일이 없으므로 최소 크기로. */
.conn{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;
  border-radius:999px;padding:5px 11px;border:1px solid rgba(255,255,255,.22);color:#AEB8C4;background:rgba(255,255,255,.06)}
.conn:hover{border-color:rgba(255,255,255,.45);color:#fff}
.conn .led{width:7px;height:7px;border-radius:50%;background:var(--warn);flex:none}
.conn.on{color:#8FE3BE;border-color:rgba(143,227,190,.4)}
.conn.on .led{background:#3DDC97}
/* 연결 팝오버 */
.connpop{position:fixed;top:52px;right:12px;z-index:70;width:min(400px,calc(100vw - 24px));
  background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:14px;
  padding:14px;box-shadow:0 12px 40px rgba(10,12,16,.28);display:none;flex-direction:column;gap:9px}
.connpop.on{display:flex}
.connpop h3{font-size:14px;font-weight:800;display:flex;align-items:center;gap:7px}
.connpop .who{font-size:12px;color:var(--gray);word-break:break-all}
.connpop input{font:inherit;font-size:12.5px;border:1.5px solid var(--line);border-radius:9px;
  background:var(--paper);color:var(--text);padding:9px 11px;width:100%}
.connpop .hint{font-size:11px;color:var(--gray);line-height:1.6}
.connpop .hint a{color:var(--cobalt)}
.connpop .row{display:flex;gap:7px;flex-wrap:wrap}
.connpop .row button{flex:1;min-width:110px;font:inherit;font-size:12.5px;font-weight:800;
  border-radius:9px;padding:9px;border:1.5px solid var(--line);background:transparent;color:var(--text);cursor:pointer}
.connpop .row button.prim{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.connpop .row button.dgr{color:var(--red);border-color:var(--red)}

/* KPI 스트립 */
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border-bottom:1px solid var(--line)}
.kpi{background:var(--paper);padding:11px 14px;display:flex;flex-direction:column;gap:2px}
.kpi .v{font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.kpi .l{font-size:11.5px;color:var(--gray);font-weight:700}
.kpi .n{font-size:10.5px;color:var(--gray)}

/* 탭 */
.tabs{display:flex;gap:4px;padding:10px 16px 0;border-bottom:1px solid var(--line);background:var(--paper);position:sticky;top:45px;z-index:20}
.tab{font-size:13.5px;font-weight:800;color:var(--gray);padding:9px 14px;border-radius:9px 9px 0 0}
.tab.on{color:var(--text);background:var(--band)}
.view{display:none}
.view.on{display:block}

/* 안내 */
.notice{font-size:12.5px;color:var(--gray);padding:9px 18px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}

/* 칸반 */
.board{display:flex;gap:14px;align-items:flex-start;padding:14px 18px;overflow-x:auto;min-height:60vh}
.col{flex:0 0 258px;background:var(--band);border-radius:14px;padding:10px}
.col h2{font-size:12.5px;font-weight:800;letter-spacing:.05em;color:var(--gray);display:flex;align-items:center;gap:6px;padding:4px 6px 10px}
.col h2 .n{margin-left:auto;font-variant-numeric:tabular-nums;background:var(--card);border:1px solid var(--line);border-radius:999px;min-width:22px;text-align:center;padding:1px 6px;font-size:11.5px;color:var(--text)}
.col.hot h2{color:var(--cobalt)}
.tickets{display:flex;flex-direction:column;gap:8px;min-height:8px}
.tk{width:100%;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:11px 12px;display:flex;flex-direction:column;gap:7px;transition:transform .12s,box-shadow .12s}
.tk:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(20,24,33,.10)}
.tk .row1{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.chip{font-size:10.5px;font-weight:800;border-radius:6px;padding:2.5px 7px;letter-spacing:.02em}
.chip.t1{background:var(--cobalt);color:#fff}
.chip.t2{background:var(--band);color:var(--gray);border:1px solid var(--line)}
.chip.auto{background:var(--ink);color:#fff}
.chip.hold{background:var(--band);color:var(--warn);border:1px solid var(--warn)}
.chip.edit{background:var(--band);color:var(--cobalt);border:1px solid var(--cobalt)}
.tk .topic{font-size:11px;color:var(--gray);font-weight:700}
.tk .tt{font-size:14px;font-weight:800;line-height:1.35;letter-spacing:-.01em}
.tk .meta{display:flex;gap:8px;align-items:center;font-size:11.5px;color:var(--gray)}
.tk .score{font-variant-numeric:tabular-nums;font-weight:800;color:var(--cobalt)}
.tk .mini{width:100%;border-radius:8px;border:1px solid var(--line);display:block;margin-top:2px}
.empty{font-size:12px;color:var(--gray);text-align:center;padding:14px 4px}

/* ══ 결정함 — 첫 화면. "오늘 내가 결정할 것"만 모아 보여준다 ══ */
.inbox{padding:14px 18px 4px}
.inbox h2{font-size:15px;font-weight:800;display:flex;align-items:center;gap:8px;margin-bottom:10px}
.inbox h2 .n{font-size:11.5px;font-weight:800;color:#fff;background:var(--red);border-radius:999px;padding:2px 9px;font-variant-numeric:tabular-nums}
.dlist{display:flex;flex-direction:column;gap:8px}
.dcard{width:100%;text-align:left;display:flex;align-items:center;gap:12px;background:var(--card);
  border:1px solid var(--line);border-left:4px solid var(--cobalt);border-radius:12px;padding:11px 13px;
  transition:transform .12s,box-shadow .12s}
.dcard:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(20,24,33,.10)}
.dcard.pub{border-left-color:var(--red)}
.dcard.idea{border-left-color:var(--cobalt)}
.dcard.rev{border-left-color:var(--warn)}
.dcard .dth{width:44px;height:55px;border-radius:7px;border:1px solid var(--line);object-fit:cover;flex:none;background:var(--band)}
.dcard .dm{min-width:0;flex:1}
.dcard .dk{font-size:10.5px;font-weight:800;letter-spacing:.05em;color:var(--gray)}
.dcard.pub .dk{color:var(--red)}
.dcard .dt{font-size:14px;font-weight:800;line-height:1.35;letter-spacing:-.01em;
  overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.dcard .dw{font-size:11.5px;color:var(--gray);margin-top:2px}
.dcard .go{font-size:18px;color:var(--gray);flex:none}
.allclear{display:flex;flex-direction:column;gap:5px;background:color-mix(in srgb,var(--ok) 9%,var(--card));
  border:1px solid color-mix(in srgb,var(--ok) 32%,transparent);border-radius:12px;padding:15px 16px}
.allclear .t{font-size:15px;font-weight:800;color:var(--ok)}
.allclear .w{font-size:12.5px;color:var(--gray);line-height:1.6}

/* ══ 발행 승인 — 실물 카드를 넘겨보고 결정한다 ══ */
.pv{display:flex;flex-direction:column;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.pv .ph{font-size:11px;font-weight:800;letter-spacing:.06em;color:var(--gray);display:flex;align-items:center;gap:8px}
.pv .ph .pn{margin-left:auto;font-variant-numeric:tabular-nums}
.pvframe{position:relative;background:var(--band);border-radius:10px;overflow:hidden}
.pvframe img{width:100%;display:block;border-radius:10px}
.pvnav{display:flex;gap:6px;align-items:center;justify-content:center}
.pvnav button{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--line);color:var(--text);font-weight:900}
.pvnav button[disabled]{opacity:.3}
.pvdots{display:flex;gap:5px}
.pvdots i{width:7px;height:7px;border-radius:50%;background:var(--line);display:block}
.pvdots i.on{background:var(--cobalt)}
.cap{font-size:12.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;
  background:var(--band);border-radius:10px;padding:11px 12px;max-height:230px;overflow-y:auto}
.cap.empty{color:var(--gray);white-space:normal}
.rvw{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;border-radius:10px;padding:9px 11px;border:1px solid var(--line)}
.rvw.pass{background:color-mix(in srgb,var(--ok) 10%,transparent);border-color:color-mix(in srgb,var(--ok) 34%,transparent);color:var(--ok)}
.rvw.block{background:color-mix(in srgb,var(--red) 10%,transparent);border-color:color-mix(in srgb,var(--red) 34%,transparent);color:var(--red)}
.rvw.none{color:var(--gray)}

/* 이유 입력 — 반려·보류의 "왜"를 받아 회사가 학습한다 */
.rsn{display:none;flex-direction:column;gap:8px;width:100%;background:var(--band);border-radius:11px;padding:11px}
.rsn.on{display:flex}
.rsn .q{font-size:12.5px;font-weight:800}
.rsn .chips{display:flex;gap:5px;flex-wrap:wrap}
.rsn .chips button{font-size:11.5px;font-weight:700;border:1.5px solid var(--line);border-radius:999px;padding:5px 11px;color:var(--gray)}
.rsn .chips button.on{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.rsn input{font:inherit;font-size:12.5px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);color:var(--text);padding:8px 10px;width:100%}
.rsn .row{display:flex;gap:7px}
.rsn .row button{flex:1;font-size:12.5px;font-weight:800;border-radius:9px;padding:9px;border:1.5px solid var(--line);color:var(--gray)}
.rsn .row button.sv{background:var(--cobalt);border-color:var(--cobalt);color:#fff}

/* 회사 탭 */
.wrap{padding:16px 18px 90px;max-width:900px}
.sect{font-size:12px;font-weight:800;letter-spacing:.06em;color:var(--gray);margin:18px 2px 10px}
.pcat{margin-bottom:14px}
.pcat h3{font-size:13.5px;font-weight:800;margin-bottom:7px}
.pr{display:flex;gap:9px;font-size:13px;line-height:1.5;padding:6px 0;border-bottom:1px solid var(--line)}
.pr .d{color:var(--gray);font-variant-numeric:tabular-nums;flex:0 0 42px;font-weight:700}
.teams{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.team{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 13px;display:flex;flex-direction:column;gap:6px}
.team .h{font-size:14.5px;font-weight:800;display:flex;align-items:center;gap:7px}
.team .v{font-size:12.5px;color:var(--text);line-height:1.45;font-weight:600}
.team .resp{font-size:11.5px;color:var(--gray);line-height:1.4}
.team .f{display:flex;gap:8px;align-items:center;font-size:11px;color:var(--gray);margin-top:2px}
.team .lv{background:var(--band);border:1px solid var(--line);border-radius:6px;padding:2px 7px;font-weight:800;color:var(--cobalt)}
/* 편집 컨트롤 (CEO·팀 공통) */
.secttools{display:inline-flex;gap:6px;margin-left:8px;vertical-align:middle}
.teamtools{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
.ebtn{font-size:11px;font-weight:800;border-radius:7px;padding:4px 9px;background:var(--band);border:1px solid var(--line);color:var(--cobalt);text-decoration:none;display:inline-block}
.ebtn.gh{color:var(--gray)}
.ebtn.save{background:var(--cobalt);color:#fff;border-color:var(--cobalt);align-self:flex-start;cursor:pointer}
.edarea{display:none;flex-direction:column;gap:7px;margin:8px 0 2px}
.edarea.on{display:flex}
.edarea textarea{font:inherit;font-size:12.5px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);color:var(--text);padding:8px;min-height:58px;resize:vertical}
.edhint{font-size:11px;color:var(--gray);line-height:1.4}

/* 자산 탭 */
.agrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.agroup{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 14px}
.agroup h3{font-size:14px;font-weight:800;display:flex;align-items:center;gap:8px;margin-bottom:9px}
.agroup h3 .n{margin-left:auto;background:var(--band);border-radius:999px;padding:1px 9px;font-size:12px;color:var(--cobalt)}
.aitem{font-size:12.5px;padding:6px 0;border-bottom:1px solid var(--line);line-height:1.4}
.aitem b{font-weight:700}
.aitem .m{color:var(--gray);font-size:11.5px}

/* 드로어 */
.scrim{position:fixed;inset:0;background:rgba(10,12,16,.45);z-index:40;opacity:0;pointer-events:none;transition:opacity .18s}
.scrim.on{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(520px,100vw);z-index:50;background:var(--paper);border-left:1px solid var(--line);transform:translateX(102%);transition:transform .22s;display:flex;flex-direction:column}
.drawer.on{transform:none}
@media (prefers-reduced-motion: reduce){.drawer,.scrim,.tk{transition:none}}
.dhead{background:var(--ink);color:#fff;padding:16px 18px 14px;display:flex;flex-direction:column;gap:8px;position:relative}
.dhead .close{position:absolute;top:10px;right:12px;color:#AEB8C4;font-size:22px;padding:6px}
.dhead .tt{font-size:19px;font-weight:800;line-height:1.3;padding-right:34px}
.dhead .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12px;color:#AEB8C4}
.dbody{flex:1;min-height:0;overflow-y:auto;padding:16px 18px 20px;display:flex;flex-direction:column;gap:14px}
.tl{display:flex;flex-direction:column;gap:14px}
.entry{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 14px;display:flex;flex-direction:column;gap:9px}
.entry .who{font-size:11px;font-weight:800;letter-spacing:.06em;color:var(--gray);display:flex;align-items:center;gap:6px}
.entry .who .t{color:var(--cobalt)}
.entry .say{font-size:14px;font-weight:700;line-height:1.45}
.entry .why{font-size:13px;color:var(--gray);line-height:1.55}
.entry .src{font-size:12.5px;color:var(--gray);line-height:1.5}
.entry .src b{color:var(--text);font-weight:700}
.entry.op{border-color:var(--cobalt)}
.rub{display:flex;flex-direction:column;gap:5px}
.rub .r{display:grid;grid-template-columns:64px 1fr 18px;gap:8px;align-items:center;font-size:12px}
.rub .lbl{color:var(--gray);font-weight:700}
.rub .bar{height:7px;border-radius:99px;background:var(--band);overflow:hidden}
.rub .bar i{display:block;height:100%;background:var(--cobalt);border-radius:99px}
.rub .v{font-variant-numeric:tabular-nums;font-weight:800;text-align:right}
.rub .sum{font-size:12px;font-weight:800;color:var(--cobalt);margin-top:2px}
.thumb{width:180px;border-radius:10px;border:1px solid var(--line);display:block}
/* 액션 바는 스크롤 영역 밖의 진짜 하단 바다 — 본문이 길어져도 절대 겹치지 않는다 */
.acts{flex:none;padding:12px 18px calc(14px + env(safe-area-inset-bottom));background:var(--paper);
  border-top:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap;max-height:60vh;overflow-y:auto}
.btn{flex:1;min-width:110px;text-align:center;font-size:14px;font-weight:800;border-radius:10px;padding:12px 10px}
.btn.primary{background:var(--cobalt);color:#fff}
.btn.ghost{background:var(--card);border:1.5px solid var(--line);color:var(--text)}
.btn.danger{background:var(--card);border:1.5px solid var(--red);color:var(--red)}
.editbox{display:none;flex-direction:column;gap:8px;width:100%}
.editbox.on{display:flex}
.editbox textarea{font:inherit;font-size:13.5px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);color:var(--text);padding:10px;min-height:74px;resize:vertical}
.toast{position:fixed;left:50%;bottom:74px;transform:translateX(-50%) translateY(8px);background:var(--ink);color:#fff;font-size:13px;font-weight:700;border:1px solid rgba(255,255,255,.2);border-radius:99px;padding:9px 16px;opacity:0;pointer-events:none;transition:.2s;z-index:60}
.toast.on{opacity:1;transform:translateX(-50%)}
/* 읽기 전용 잠금 — 미연결일 때 조작 버튼을 아예 못 누르게 한다.
   (눌렸다가 실패하는 것보다, 애초에 안 눌리고 이유를 말해주는 편이 낫다) */
.locked{opacity:.45;pointer-events:none}

/* ══ 소재 보드 (관제탑 통합) ══ */
.ideas{padding:14px;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:14px;align-items:start}
@media (max-width:900px){.ideas{grid-template-columns:1fr}}
.ipanel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px}
.ih{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;margin-bottom:10px;flex-wrap:wrap}
.ih .n{margin-left:auto;font-size:11px;font-weight:800;color:var(--gray);font-variant-numeric:tabular-nums}
.itools{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.itool{font:inherit;font-size:12px;font-weight:800;padding:7px 11px;border-radius:9px;border:1.5px solid var(--line);background:transparent;color:var(--text);cursor:pointer}
.itool:hover{border-color:var(--gray)}
.itool.prim{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.igrp{margin-bottom:14px}
.igrp h4{margin:0 0 6px;font-size:12px;font-weight:800;color:var(--gray);display:flex;align-items:center;gap:6px}
.igrp h4 .c{font-size:10.5px;font-weight:800;color:var(--gray);font-variant-numeric:tabular-nums}
.idea{display:flex;gap:10px;align-items:center;justify-content:space-between;background:var(--bg);
 border:1px solid var(--line);border-left:4px solid var(--line);border-radius:10px;padding:8px 10px;margin-bottom:6px}
.idea[data-st="approve"]{border-left-color:var(--ok)}
.idea[data-st="hold"]{border-left-color:var(--warn)}
.idea.done{border-left-color:var(--cobalt);background:color-mix(in srgb,var(--cobalt) 6%,var(--bg))}
.idea[hidden]{display:none}
.imain{min-width:0;flex:1}
.it{font-size:13px;font-weight:800;letter-spacing:-.01em}
.iw{font-size:11.5px;color:var(--gray);margin-top:2px}
.iflag{font-size:10px;font-weight:800;color:var(--cobalt);margin-left:5px;vertical-align:1px}
.iside{display:flex;align-items:center;gap:6px;flex:none}
.isrc{font-size:10.5px;color:var(--gray);font-weight:700;background:var(--chip,rgba(120,130,150,.12));padding:2px 7px;border-radius:999px;white-space:nowrap}
.isrc.ok{background:color-mix(in srgb,var(--cobalt) 16%,transparent);color:var(--cobalt)}
@media (max-width:720px){.isrc{display:none}}
.ibtns{display:flex;gap:3px}
.ib{width:28px;height:28px;border-radius:8px;border:1.5px solid var(--line);background:transparent;color:var(--gray);
 font-size:12px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center}
.ib:hover{border-color:var(--gray);color:var(--text)}
.ib.sm{width:26px;height:26px;font-size:11px}
.idea[data-st="approve"] .ib.ap{background:var(--ok);border-color:var(--ok);color:#fff}
.idea[data-st="hold"] .ib.hd{background:var(--warn);border-color:var(--warn);color:#fff}
.iedit{display:none;flex-direction:column;gap:5px;width:100%}
.idea.editing .iedit{display:flex}
.idea.editing .imain,.idea.editing .iside{display:none}
.iedit input{font:inherit;font-size:12.5px;padding:6px 9px;border-radius:7px;border:1.5px solid var(--line);background:var(--card);color:var(--text);width:100%}
.iedit .row{display:flex;gap:5px;justify-content:flex-end}
.iedit .row button{font:inherit;font-size:11.5px;font-weight:800;padding:6px 11px;border-radius:7px;border:1.5px solid var(--line);background:transparent;color:var(--gray);cursor:pointer}
.iedit .row button.sv{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.iadd{display:none;flex-direction:column;gap:6px;border:1.5px dashed var(--cobalt);border-radius:10px;padding:10px;margin-bottom:10px}
.iadd.on{display:flex}
.iadd input,.iadd select{font:inherit;font-size:12.5px;padding:7px 9px;border-radius:7px;border:1.5px solid var(--line);background:var(--bg);color:var(--text);width:100%}
.iadd .row{display:flex;gap:5px;justify-content:flex-end}
.iadd .row button{font:inherit;font-size:11.5px;font-weight:800;padding:7px 13px;border-radius:7px;border:1.5px solid var(--line);background:transparent;color:var(--gray);cursor:pointer}
.iadd .row button.sv{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.itray{margin:0 0 10px;font-size:11.5px;color:var(--gray)}
.itray summary{cursor:pointer;font-weight:800;padding:4px 0}
.itray ul{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}
.itray li{display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:5px 9px}
.itray button{font:inherit;font-size:10.5px;font-weight:800;padding:4px 9px;border-radius:6px;border:1.5px solid var(--line);background:transparent;color:var(--gray);cursor:pointer}

/* ══ 저장 상태 바 — 모든 조작이 저장소에 바로 기록된다 ══ */
.savebar{position:sticky;bottom:0;z-index:20;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
 padding:9px 14px;background:color-mix(in srgb,var(--card) 94%,transparent);backdrop-filter:blur(10px);border-top:1px solid var(--line);font-size:12px}
.savebar .s{font-weight:800;display:inline-flex;align-items:center;gap:6px}
.savebar .s.ok{color:var(--ok)} .savebar .s.saving{color:var(--warn)} .savebar .s.bad{color:var(--red)} .savebar .s.off{color:var(--gray)}
.savebar .path{color:var(--gray);font-size:11px}
.savebar .sp{flex:1}
.savebar .gate{font-weight:800;color:var(--red)}
.igate{font-size:11.5px;line-height:1.6;color:var(--text);background:color-mix(in srgb,var(--warn) 12%,transparent);
 border:1px solid color-mix(in srgb,var(--warn) 40%,transparent);border-radius:9px;padding:8px 11px;margin-bottom:10px}
.igate code{font-size:11px}

/* ══ 폰 ══ 오너는 대부분 폰으로 본다. 칸반을 세로로 접고, 버튼을 엄지 크기로. */
@media (max-width:720px){
  .topbar{gap:9px;padding:11px 13px}
  .topbar .sub,.badge-live{display:none}
  .topbar .date{font-size:12px}
  .kpis{grid-template-columns:repeat(2,1fr)}
  .tabs{padding:8px 10px 0;gap:2px;overflow-x:auto;scrollbar-width:none}
  .tabs::-webkit-scrollbar{display:none}
  .tab{padding:9px 11px;font-size:12.5px;white-space:nowrap}
  .inbox{padding:12px 13px 4px}
  .dcard{padding:12px}
  /* 칸반: 가로 스크롤 → 세로 아코디언. 비어있는 단계는 접힌 채로 둔다. */
  .board{flex-direction:column;padding:12px 13px;gap:8px;overflow-x:visible}
  .col{flex:1 1 auto;width:100%;padding:9px 11px}
  .col h2{padding-bottom:6px;font-size:13px}
  .col.fold .tickets{display:none}
  .col.fold h2::after{content:"▾";margin-left:4px;color:var(--gray)}
  .wrap{padding:14px 13px 90px}
  .ideas{padding:12px 11px;gap:11px}
  .drawer{width:100vw}
  .btn{min-width:0;padding:14px 10px;font-size:14.5px}
  .ib{width:34px;height:34px;font-size:14px}
  .ib.sm{width:32px;height:32px;font-size:13px}
  .itool{padding:9px 13px;font-size:12.5px}
  .connpop{right:8px;left:8px;width:auto}
}
`;

const APP_JS = String.raw`
const STAGES = STATE.stages, RLBL = STATE.rubricLabels;
function img(k){ return k ? (STATE.images[k] || k) : ""; }
const KEY = "wirit-tower-" + STATE.generatedFrom;
let S = load();
function load(){
  try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.tickets&&s.tickets.length===STATE.tickets.length) return s; }catch(e){}
  return { tickets: STATE.tickets.map(t=>({...t, comments: []})) };
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
  async getFile(path){ try{ const d=await this.api("/repos/"+this.owner+"/"+this.repo+"/contents/"+path+"?ref="+encodeURIComponent(this.branch));
      return {sha:d.sha, text:decodeURIComponent(escape(atob((d.content||"").replace(/\s/g,""))))}; }catch(e){ return {sha:null,text:""}; } },
  putFile(path,text,message,sha){ const b64=btoa(unescape(encodeURIComponent(text)));
    return this.api("/repos/"+this.owner+"/"+this.repo+"/contents/"+path,{method:"PUT",body:{message:message,content:b64,branch:this.branch,sha:sha||undefined}}); },
  /** 쓰기 직후 GitHub이 옛 sha를 돌려줘 409가 나는 경우가 있다 → 다시 읽어 재시도 */
  isConflict(e){ return /\b409\b|\b422\b|does not match/i.test(e&&e.message||""); },
  async append(path,addition,message){
    for(let i=0;i<3;i++){
      const cur=await this.getFile(path);
      const text=(cur.text?cur.text.replace(/\s*$/,"")+"\n\n":"")+addition+"\n";
      try{ return await this.putFile(path,text,message,cur.sha); }
      catch(e){ if(!this.isConflict(e)||i===2) throw e;
        await new Promise(r=>setTimeout(r,350*(i+1))); }
    }
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
      +'<div class="hint">이 저장소 전용 <b>Fine-grained 토큰</b>이 필요합니다(권한: Contents = Read/Write). '
      +'토큰은 <b>이 브라우저에만</b> 저장되고 GitHub 외 어디로도 전송되지 않습니다. → '
      +'<a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener">토큰 만들기 ↗</a></div>'
      +'<input type="password" id="conntok" placeholder="ghp_... 또는 github_pat_...">'
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
    try{ const me=await GH.me(); document.getElementById("connpop").classList.remove("on"); afterConnChange("연결 성공 — "+(me.login||"")); }
    catch(e){ GH.setToken(""); toast("연결 실패: "+shortErr(e)); }
  };
}
/** 연결 상태가 바뀌면 화면 전체(잠금·결정함·보드·소재)를 다시 맞춘다 */
function afterConnChange(msg){
  renderConn(); applyLock(); setSave(GH.connected()?"ok":"off");
  renderInbox(); renderBoard(); renderIdeas();
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
wireCompany();

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
  // ② 아직 고르지 않은 소재 — 오너가 골라줘야 회사가 움직인다
  const open=IDEAS.filter(i=>!i.state && i.status!=="done" && !Number(i.stage||0));
  if(open.length){
    out.push({ kind:"idea", label:"소재 선택", title:open.length+"건이 오너 결정을 기다립니다",
      note:open.slice(0,2).map(i=>i.title).join(" · ")+(open.length>2?" 외 "+(open.length-2)+"건":""),
      thumb:null, go:()=>openTab("ideas") });
  }
  // ③ 수정지시를 내린 뒤 결과를 확인해야 하는 것
  S.tickets.forEach(t=>{
    if(!(t.flags||[]).includes("수정요청")) return;
    if(t.stage===4) return; // 이미 ①에 잡힘
    out.push({ kind:"rev", label:"수정 확인", title:t.title, note:"재작업 지시 후 대기 중",
      thumb:t.thumb||null, go:()=>{ openTab("board"); openDrawer(t.id); } });
  });
  return out;
}
/** 한 화면에 보여줄 상한 — 이보다 많으면 접어서 "더 보기"로 연다 */
const INBOX_CAP=6;
let inboxAll=false;
function renderInbox(){
  const box=document.getElementById("inboxBody"); if(!box) return;
  const list=pendingDecisions();
  const n=document.getElementById("inboxN");
  if(n){ n.textContent=list.length+"건"; n.hidden=list.length===0; }
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

/* 칸반 */
const board=document.getElementById("board");
/** 칸반은 '기획안'부터 그린다 — 소재 고르기는 💡소재 탭이 단일 창구다(2026-07-26 통합). */
const FIRST_STAGE = 1;
function renderBoard(){
  if(!board) return;
  board.innerHTML="";
  STAGES.forEach((name,si)=>{
    if(si<FIRST_STAGE) return;
    const list=S.tickets.filter(t=>t.stage===si && !(t.flags||[]).includes("버림"));
    const col=document.createElement("section");
    // 폰에서는 빈 단계를 접어 스크롤을 줄인다
    col.className="col"+(list.length?"":" fold");
    col.innerHTML='<h2>'+name+'<span class="n">'+list.length+'</span></h2>';
    const wrap=document.createElement("div"); wrap.className="tickets";
    if(!list.length){ wrap.innerHTML='<div class="empty">비어 있음</div>'; }
    list.forEach(t=>{
      const b=document.createElement("button"); b.className="tk"; b.onclick=()=>openDrawer(t.id);
      const sum=t.rubric&&t.rubric.sum?t.rubric.sum:null;
      b.innerHTML=
        '<div class="row1">'
        +'<span class="chip '+(t.tier==="T1"?"t1":"t2")+'">'+(t.tier==="T1"?"주":"부")+'</span>'
        +(t.auto?'<span class="chip auto">자동</span>':"")
        +((t.flags||[]).includes("보류")?'<span class="chip hold">⏸ 보류</span>':"")
        +((t.flags||[]).includes("수정요청")?'<span class="chip edit">✏️ 수정요청</span>':"")
        +((t.flags||[]).includes("실험")?'<span class="chip t2">실험</span>':"")
        +'<span class="topic">'+esc(t.topic)+'</span></div>'
        +'<div class="tt">'+(t.fire?"🔥 ":"")+esc(t.title)+'</div>'
        +'<div class="meta"><span>'+esc(t.fmt)+'</span>'
        +(si===4&&!t.caption?'<span style="color:var(--warn);font-weight:800">캡션 없음</span>':"")
        +(sum?'<span class="score">'+sum+'점</span>':"")+'</div>'
        +(t.thumb?'<img class="mini" src="'+img(t.thumb)+'" alt="">':"");
      wrap.appendChild(b);
    });
    col.appendChild(wrap); board.appendChild(col);
  });
}
/* 드로어 */
const drawer=document.getElementById("drawer"), scrim=document.getElementById("scrim");
let cur=null;
function openDrawer(id){ cur=id; const t=tk(id); if(!t) return;
  drawer.innerHTML=buildDetail(t);
  drawer.classList.add("on"); scrim.classList.add("on");
  drawer.querySelector(".close").onclick=closeDrawer;
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
  }

  let acts="";
  if(t.stage===0 && !(t.flags||[]).includes("버림")){
    acts='<button class="btn primary" data-act="go">✅ 이 소재 진행</button>'
      +'<button class="btn ghost" data-act="hold">⏸ 보류</button>'
      +'<button class="btn danger" data-act="drop">🗑 버림</button>'+reasonBox();
  } else if(t.stage===4){
    acts='<button class="btn primary" data-act="publish">🚀 발행 승인</button>'
      +'<button class="btn ghost" data-act="edit">✏️ 수정지시</button>'
      +'<button class="btn danger" data-act="reject">❌ 반려</button>'
      +'<div class="editbox" id="editbox"><textarea id="edittext" placeholder="예) 제목 폰트 키우고 2·3위 재확인해줘"></textarea>'
      +'<button class="btn primary" data-act="editsave">코멘트 남기기</button></div>'+reasonBox();
  } else if(t.auto){
    acts='<div class="why">자동 슬롯 — 사후 통보만. 무인 해제는 설정에서.</div>';
  } else {
    acts='<div class="btn ghost" style="flex:1 0 100%;cursor:default">진행 중 — 이 단계에선 오너 액션이 없습니다</div>'
      +'<button class="btn danger" data-act="drop">🗑 이 건 중단</button>'+reasonBox();
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
      // 미연결이면 기록이 남지 않으므로 아예 진행하지 않는다
      if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }

      if(a==="go"){ t.stage=1; t.flags=(t.flags||[]).filter(f=>f!=="보류");
        promoteIdea(t,1); pushDecision("진행: "+t.title+" → 기획안","진행 기록됨"); done(ttl+" 기획으로"); }
      if(a==="hold"){ ask("왜 보류하시나요? (회사가 학습합니다)", (why)=>{
        t.flags=t.flags||[]; if(!t.flags.includes("보류")) t.flags.push("보류");
        pushDecision("보류: "+t.title+(why?" — 이유: "+why:""),"보류 기록됨"); done(ttl+" 보류"); }); }
      if(a==="drop"){ ask("왜 접으시나요? (회사가 학습합니다)", (why)=>{
        t.flags=t.flags||[]; t.flags.push("버림");
        pushDecision("버림: "+t.title+(why?" — 이유: "+why:""),"제외 기록됨"); done(ttl+" 제외"); }); }
      if(a==="publish"){
        if(t.review && t.review.verdict!=="pass"
          && !confirm("자동검수가 통과가 아닙니다("+t.review.verdict+").\n그래도 발행 승인할까요?")) return;
        t.stage=5; queuePublish(t); done(ttl+" 발행 승인"); }
      if(a==="reject"){ ask("왜 반려하시나요? (해당 팀이 이 이유로 다시 만듭니다)", (why)=>{
        t.stage=2; t.flags=t.flags||[]; if(!t.flags.includes("수정요청")) t.flags.push("수정요청");
        pushDecision("반려: "+t.title+" → 재작업"+(why?" — 이유: "+why:""),"반려 기록됨"); done(ttl+" 반려"); }); }
      if(a==="edit"){ drawer.querySelector("#editbox").classList.toggle("on"); return; }
      if(a==="editsave"){ const v=drawer.querySelector("#edittext").value.trim(); if(!v){ toast("코멘트를 입력하세요"); return; }
        t.comments=t.comments||[]; t.comments.push(v); t.flags=t.flags||[]; if(!t.flags.includes("수정요청")) t.flags.push("수정요청");
        pushDecision('수정지시('+t.title+'): "'+v+'"',"수정지시 기록됨"); done("수정지시 기록됨"); }
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


/* ══════════ 소재 보드 — research/ideas.json 을 직접 되쓴다 ══════════
 * 복사-붙여넣기 우회 없음. 오너가 누르는 즉시 저장소에 커밋된다.
 * 저장은 800ms 디바운스로 묶어 연타 시 커밋이 쏟아지지 않게 한다. */
let IDEAS = JSON.parse(JSON.stringify((STATE.ideas||{}).items||[]));
const ICATS = ((STATE.ideas||{}).cats)||[];
const IPATH = (STATE.ideas||{}).path || "research/ideas.json";
let saveTimer=null, saveReason="";

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
    // 저장 직전에 원격을 다시 읽어 sha를 맞춘다(다른 기기·세션과의 충돌 방지).
    // 그래도 409가 나면 sha가 잠시 어긋난 것이므로 다시 읽어 재시도한다.
    for(let i=0;i<3;i++){
      const cur=await GH.getFile(IPATH);
      let doc;
      try{ doc=JSON.parse(cur.text); }catch(e){ doc={meta:{},cats:ICATS,ideas:[]}; }
      doc.cats=doc.cats&&doc.cats.length?doc.cats:ICATS;
      doc.ideas=IDEAS;
      doc.meta=doc.meta||{};
      doc.meta.updated=STATE.generatedFrom;
      try{ await GH.putFile(IPATH, JSON.stringify(doc,null,2)+"\n", "관제탑: "+reason, cur.sha); break; }
      catch(e){ if(!GH.isConflict(e)||i===2) throw e;
        await new Promise(r=>setTimeout(r,350*(i+1))); }
    }
    setSave("ok");
  }catch(e){ setSave("bad", shortErr(e)); }
}

function ideaById(id){ return IDEAS.find(x=>x.id===id); }
function hiddenIdea(i){ return i.state==="reject"; }

function ideaCard(i){
  const done=i.status==="done";
  const inPipe=Number(i.stage||0)>=1;
  // 파이프라인에 올라간 소재·이미 만든 소재는 '진행' 버튼 대신 현재 위치를 보여준다
  const goBtn = (done||inPipe)
    ? '<span class="isrc ok">'+(done?"제작완료":"▶ "+esc(STAGES[Math.min(Number(i.stage),STAGES.length-1)]))+'</span>'
    : '<button class="ib go" data-ia="go" title="이 소재로 진행 — 파이프라인 기획안으로">▶</button>';
  return '<div class="idea'+(done?" done":"")+(inPipe?" inpipe":"")+'" data-iid="'+esc(i.id)+'" data-st="'+esc(i.state||"")+'"'+(hiddenIdea(i)?" hidden":"")+'>'
    +'<div class="imain"><div class="it">'+esc(i.title)+(i.isNew?'<span class="iflag">NEW</span>':"")+'</div>'
    +'<div class="iw">'+esc(i.why||"")+(i.reason?' <span style="color:var(--red)">· 이유: '+esc(i.reason)+'</span>':"")+'</div></div>'
    +'<div class="iside"><span class="isrc">'+esc(i.source||"출처 미정")+'</span>'
    +'<div class="ibtns">'
    + goBtn
    +'<button class="ib ap" data-ia="approve" title="승인 — 좋은 소재로 표시">✓</button>'
    +'<button class="ib hd" data-ia="hold" title="보류">⏸</button>'
    +'<button class="ib rj" data-ia="reject" title="반려 — 이유를 남기면 회사가 학습합니다">✕</button>'
    +'<button class="ib sm ed" data-ia="edit" title="수정">✎</button>'
    +'<button class="ib sm dl" data-ia="delete" title="삭제">🗑</button>'
    +'</div></div>'
    +'<div class="iedit">'
    +'<input class="e-t" value="'+esc(i.title)+'" aria-label="제목">'
    +'<input class="e-w" value="'+esc(i.why||"")+'" aria-label="한 줄 이유">'
    +'<input class="e-s" value="'+esc(i.source||"")+'" aria-label="출처">'
    +'<div class="row"><button data-ia="cancel">취소</button><button class="sv" data-ia="save">저장</button></div>'
    +'</div></div>';
}

/** 반려·보류의 "왜"를 짧게 받는다. 취소하면 null — 상태를 바꾸지 않는다. */
function askReason(kind, title){
  const v=prompt(
    (kind==="reject"?"왜 반려하시나요?":"왜 보류하시나요?")
    +"\n\n「"+title+"」\n\n한 줄이면 충분합니다 — 회사가 이 이유를 학습해 다음 발굴에 반영합니다."
    +"\n(예: "+REASONS.join(" / ")+")","");
  if(v===null) return null;
  return v.trim();
}

function renderIdeas(){
  applyLock();
  const box=document.getElementById("ideaBody"); if(!box) return;
  const visible=IDEAS.filter(i=>!hiddenIdea(i));
  let html="";
  ICATS.forEach(c=>{
    const list=IDEAS.filter(i=>i.cat===c.key);
    if(!list.length) return;
    const vis=list.filter(i=>!hiddenIdea(i)).length;
    html+='<div class="igrp"><h4>'+esc(c.label)+'<span class="c">'+vis+'건</span></h4>'
      +list.map(ideaCard).join("")+'</div>';
  });
  box.innerHTML=html||'<div class="empty">소재가 없습니다</div>';
  const n=document.getElementById("icount"); if(n) n.textContent=visible.length+"건";
  renderTray();
  wireIdeas();
}

function renderTray(){
  const t=document.getElementById("itray"); if(!t) return;
  const hid=IDEAS.filter(hiddenIdea);
  t.hidden=hid.length===0;
  const n=document.getElementById("itrayn"); if(n) n.textContent=hid.length;
  const ul=document.getElementById("itraylist"); if(!ul) return;
  ul.textContent="";
  hid.forEach(i=>{
    const li=document.createElement("li");
    const sp=document.createElement("span"); sp.textContent="✕ "+i.title;
    const b=document.createElement("button"); b.type="button"; b.textContent="되돌리기";
    b.onclick=()=>{ i.state=""; queueSave("소재 거부 해제 — "+i.title); renderIdeas(); };
    li.append(sp,b); ul.appendChild(li);
  });
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
      // ▶ 진행 — 소재를 파이프라인 '기획안'으로 올린다. 이게 소재↔파이프라인 단일 배관.
      if(act==="go"){
        i.stage=1; i.state="approve"; i.at=STATE.dateLabel; i.reason="";
        queueSave("소재 진행 — "+i.title);
        pushDecision("▶ 진행: "+i.title+" → 기획안"+(i.why?" (사유: "+i.why+")":""), "진행 기록됨 — 기획안으로");
        renderIdeas(); renderInbox();
        toast("파이프라인 기획안으로 올렸습니다 — 🗂 탭에서 확인");
        return;
      }
      if(act==="save"){
        const t=(card.querySelector(".e-t").value||"").trim();
        if(!t){ toast("제목은 비울 수 없습니다"); return; }
        i.title=t; i.why=(card.querySelector(".e-w").value||"").trim(); i.source=(card.querySelector(".e-s").value||"").trim();
        queueSave("소재 수정 — "+t); renderIdeas(); toast("수정됨");
        return;
      }
      if(act==="delete"){
        if(!confirm("'"+i.title+"' 을(를) 목록에서 완전히 지울까요?\n(저장소 이력에는 남으므로 되살릴 수 있습니다)")) return;
        IDEAS=IDEAS.filter(x=>x.id!==i.id);
        queueSave("소재 삭제 — "+i.title); renderIdeas(); toast("삭제됨");
        return;
      }
      // 승인 / 보류 / 반려 — 같은 버튼 다시 누르면 해제
      const next = (i.state===act ? "" : act);
      // 반려·보류에는 이유를 받는다. 이유 없는 거절은 회사를 학습시키지 못한다.
      if(next==="reject"||next==="hold"){
        const why=askReason(next, i.title);
        if(why===null) return; // 취소 — 상태를 건드리지 않는다
        i.reason=why;
        pushDecision((next==="reject"?"❌ 반려":"⏸ 보류")+": "+i.title
          +(why?" — 이유: "+why:" — 이유 미기재"), (next==="reject"?"반려":"보류")+" 기록됨");
      } else {
        i.reason="";
      }
      i.state=next; i.at=STATE.dateLabel;
      queueSave("소재 결정("+(i.state||"해제")+") — "+i.title);
      renderIdeas(); renderInbox();
      if(i.state==="reject") toast("반려됨 — 위 '숨긴 항목'에서 되돌릴 수 있어요");
    });
  });
}

function wireIdeaTools(){
  const add=document.getElementById("iaddBtn"), box=document.getElementById("iaddBox");
  if(add) add.onclick=()=>{ box.classList.toggle("on"); if(box.classList.contains("on")) document.getElementById("na-t").focus(); };
  const cancel=document.getElementById("iaddCancel");
  if(cancel) cancel.onclick=()=>box.classList.remove("on");
  const save=document.getElementById("iaddSave");
  if(save) save.onclick=()=>{
    if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 상단 [연결하기]"); return; }
    const t=(document.getElementById("na-t").value||"").trim();
    if(!t){ toast("제목을 입력해주세요"); return; }
    const item={ id:"new-"+Date.now().toString(36), cat:document.getElementById("na-c").value,
      title:t, why:(document.getElementById("na-w").value||"").trim(),
      source:(document.getElementById("na-s").value||"").trim(), state:"", status:"", isNew:true };
    IDEAS.push(item);
    queueSave("소재 추가 — "+t);
    document.getElementById("na-t").value=""; document.getElementById("na-w").value=""; document.getElementById("na-s").value="";
    box.classList.remove("on"); renderIdeas(); toast("추가됨 — 저장소에 기록됩니다");
  };

  // 새 소재 발굴 — 방향을 저장소에 남기고, 수집 워크플로도 같이 돌린다(버튼 하나로 통합)
  const dig=document.getElementById("imineBtn");
  if(dig) dig.onclick=async()=>{
    if(!GH.connected()){ setSave("off"); toast("GitHub 연결이 필요합니다 — 우상단 [연결 필요]"); return; }
    const v=prompt("어떤 방향으로 새 소재를 찾을까요?\n(예: 8월 시의성 부동산 / 20~30대 공감 통계 / 지도 엔진 재사용)\n\n비워도 됩니다 — 그러면 최근 반려 이유를 참고해 알아서 찾습니다.","");
    if(v===null) return;
    const t=(v||"").trim();
    // 최근 반려 이유를 같이 실어 보낸다 — 같은 걸 또 들고 오지 않도록
    const avoid=IDEAS.filter(x=>x.state==="reject"&&x.reason).slice(-5).map(x=>x.reason);
    pushDecision("🔎 신규 소재 발굴 요청"+(t?" — "+t:" — 방향 지정 없음")
      +(avoid.length?" [피할 것: "+avoid.join(" / ")+"]":""), "발굴 요청 기록됨");
    try{ await GH.dispatch("research-digest.yml",{}); toast("발굴 요청 기록 + 수집 워크플로 시작 ✓"); }
    catch(e){ toast("기록됨 — 수집 워크플로는 수동 실행이 필요합니다"); }
  };

  // 자료 인박스 — research/INBOX.md 에 바로 커밋
  const kb=document.getElementById("kadd2");
  if(kb) kb.onclick=async()=>{
    const ta=document.getElementById("ktext2"); const v=(ta.value||"").trim();
    if(!v){ toast("붙여넣은 내용이 없습니다"); return; }
    if(!GH.connected()){ setSave("off"); toast("GitHub에 연결해야 저장됩니다 — 상단 [연결하기]"); return; }
    setSave("saving");
    try{
      await GH.append("research/INBOX.md", "## "+ghStamp()+"\n\n"+v, "관제탑: 지식 자료 추가");
      setSave("ok"); ta.value=""; toast("research/INBOX.md에 커밋됨 ✓");
    }catch(e){ const t=shortErr(e); setSave("bad", "INBOX.md · "+t); toast("저장 실패: "+t); }
  };

  // 새로고침 — 재배포된 최신 관제탑을 받는다
  const rl=document.getElementById("ireload");
  if(rl) rl.onclick=()=>location.reload();
}

/* 연결 뱃지 토글 — 바깥을 누르면 닫힌다 */
const connBtn=document.getElementById("connbtn");
if(connBtn) connBtn.onclick=(e)=>{ e.stopPropagation(); document.getElementById("connpop").classList.toggle("on"); };
document.addEventListener("click",(e)=>{
  const pop=document.getElementById("connpop");
  if(pop&&pop.classList.contains("on")&&!pop.contains(e.target)) pop.classList.remove("on");
});

renderConn();
renderBoard();
renderIdeas();
renderInbox();
wireIdeaTools();
applyLock();
if(location.hash) openTab(location.hash.slice(1));
setSave(GH.connected()?"ok":"off");
`;

function esc(s: unknown): string {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 소재 탭 — 마이닝(요청·자료 인박스)과 아이디어 보드를 한 화면에. */
function ideasHtml(state: TowerState): string {
  const cats = state.ideas.cats;
  const items = state.ideas.items;
  const done = items.filter((i) => i.status === "done").length;
  const visible = items.filter((i) => i.state !== "reject").length;
  const opts = cats.map((c) => `<option value="${esc(c.key)}">${esc(c.label)}</option>`).join("");
  const weights = state.mining.weights
    .map((w) => `<span class="isrc">${esc(w.label)} ${w.pct}%</span>`)
    .join("");

  return `<div class="ideas">
  <section class="ipanel">
    <div class="ih">💡 소재 보드<span class="n" id="icount">${visible}건</span></div>
    <div class="igate" id="igate" hidden></div>
    <div class="itools" data-lock>
      <button class="itool prim" id="iaddBtn">➕ 새 소재</button>
      <button class="itool" id="imineBtn">🔎 새 소재 발굴</button>
      <button class="itool" id="ireload">🔄 새로고침</button>
      <span class="path" style="margin-left:auto;font-size:11px;color:var(--gray)">제작 완료 ${done}건</span>
    </div>
    <div class="iadd" id="iaddBox">
      <input id="na-t" placeholder="제목 — 예: 🏫 학군지 프리미엄 지도">
      <input id="na-w" placeholder="한 줄 이유 — 왜 터질 것 같은지">
      <input id="na-s" placeholder="데이터 출처 — 예: 국토부 실거래 + 학교알리미">
      <select id="na-c" aria-label="분류">${opts}</select>
      <div class="row"><button id="iaddCancel">취소</button><button class="sv" id="iaddSave">추가</button></div>
    </div>
    <details class="itray" id="itray" hidden>
      <summary>숨긴 항목 <span id="itrayn">0</span>건 — 되돌리기</summary>
      <ul id="itraylist"></ul>
    </details>
    <div id="ideaBody"></div>
  </section>

  <aside class="ipanel">
    <div class="ih">🔎 소재 발굴</div>
    <div style="font-size:11.5px;color:var(--gray);line-height:1.6;margin-bottom:10px">
      왼쪽 <b>[새 소재 발굴]</b>을 누르면 방향을 적을 수 있고, 그 방향으로 수집이 <b>바로 시작</b>됩니다.
      최근 <b>반려 이유</b>를 같이 보내서 같은 소재가 또 올라오지 않게 합니다.
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:4px">${weights}</div>
    <div class="ih" style="margin-top:16px">💬 자료 인박스</div>
    <div style="font-size:11.5px;color:var(--gray);line-height:1.6;margin-bottom:8px">
      기사·수치·메모를 붙여넣으면 <code>research/INBOX.md</code>에 바로 커밋됩니다.
    </div>
    <textarea id="ktext2" style="width:100%;height:110px;font:inherit;font-size:12px;padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--bg);color:var(--text)" placeholder="여기에 붙여넣기(Ctrl+V)"></textarea>
    <button class="itool" id="kadd2" style="width:100%;margin-top:6px">지식 추가</button>
  </aside>
</div>`;
}

/** esc 후 **볼드** 마크다운만 <b>로 변환 */
function fmt(s: unknown): string {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}

function kpiHtml(state: TowerState): string {
  return state.kpi
    .map(
      (k) =>
        `<div class="kpi"><span class="v">${esc(k.value)}</span><span class="l">${esc(k.label)}</span><span class="n">${esc(k.note)}</span></div>`
    )
    .join("");
}

function companyHtml(state: TowerState): string {
  const { owner, name, branch } = state.repo;
  const ghEdit = (path: string): string =>
    owner && name ? `https://github.com/${owner}/${name}/edit/${branch}/${path}` : "";
  const ghLink = (path: string, label: string): string => {
    const u = ghEdit(path);
    return u ? `<a class="ebtn gh" href="${esc(u)}" target="_blank" rel="noopener">${esc(label)}↗</a>` : "";
  };

  const cats = Object.entries(state.company.principles)
    .map(
      ([cat, list]) =>
        `<div class="pcat"><h3>${esc(cat)}</h3>${list
          .map((p) => `<div class="pr"><span class="d">${esc(p.date)}</span><span>${fmt(p.text)}</span></div>`)
          .join("")}</div>`
    )
    .join("");

  const ceoTools =
    `<span class="secttools"><button class="ebtn" data-ce>✏️ 원칙 추가·수정</button>${ghLink(
      state.company.ceoPath,
      "GitHub"
    )}</span>` +
    `<div class="edarea" id="ed-ceo"><div class="edhint">추가하거나 고칠 원칙을 적으세요. [기록하기]를 누르면 저장소 결정 로그에 바로 남고, 다음 세션에서 CEO.md에 반영됩니다.</div>` +
    `<textarea placeholder="예) 디자인 원칙 추가: 표 헤더는 잉크 배경에 흰 글씨로 / 또는 기존 원칙 수정 내용"></textarea>` +
    `<button class="ebtn save" data-ce-save>기록하기</button></div>`;

  const teams = state.company.teams
    .map(
      (t) =>
        `<div class="team"><div class="h">${esc(t.emoji)} ${esc(t.name)}</div>` +
        `<div class="v">${esc(t.values)}</div>` +
        (t.responsibility ? `<div class="resp">책임 · ${esc(t.responsibility)}</div>` : "") +
        `<div class="f"><span class="lv">${esc(t.autonomy)}</span><span>학습 ${t.logCount}건</span></div>` +
        `<div class="teamtools"><button class="ebtn" data-te="${esc(t.slug)}|${esc(t.name)}">✏️ 수정지시</button>` +
        ghLink(t.path, "사원카드") +
        (t.hasPrompt ? ghLink(t.promptPath, "프롬프트") : "") +
        `</div>` +
        `<div class="edarea" data-te-area="${esc(t.slug)}"><div class="edhint">이 팀의 원칙·프롬프트를 어떻게 바꿀까요?</div>` +
        `<textarea placeholder="예) 데이터 가용성 2점 미만 소재는 후보에서 자동 제외"></textarea>` +
        `<button class="ebtn save" data-te-save="${esc(t.slug)}|${esc(t.name)}">기록하기</button></div>` +
        `</div>`
    )
    .join("");

  return (
    `<div class="wrap">` +
    `<div class="sect">🧠 CEO — 오너 판단 누적 (${state.company.principlesCount}개 원칙)${ceoTools}</div>${cats}` +
    `<div class="sect">👥 팀 (${state.company.teams.length}) — 각 직원의 원칙·프롬프트를 직접 수정보완</div><div class="teams">${teams}</div>` +
    `</div>`
  );
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
  <button class="tab on" data-v="today">🔔 오늘</button>
  <button class="tab" data-v="board">🗂 파이프라인</button>
  <button class="tab" data-v="ideas">💡 소재</button>
  <button class="tab" data-v="company">🏢 회사</button>
  <button class="tab" data-v="assets">📦 자산</button>
</nav>

<section id="view-today" class="view on">
  <div class="inbox">
    <h2>🔔 오늘 결정할 일<span class="n" id="inboxN" hidden>0건</span></h2>
    <div id="inboxBody"></div>
  </div>
</section>

<section id="view-board" class="view">
  <div class="notice"><span>티켓을 눌러 <b>판단·근거</b>를 보고 <b>승인/보류/수정지시</b>를 내립니다.</span><span>결정은 <b>저장소에 바로 기록</b>됩니다(하단 저장 상태 확인).</span></div>
  <main class="board" id="board"></main>
</section>
<section id="view-ideas" class="view">${ideasHtml(state)}</section>
<section id="view-company" class="view">${companyHtml(state)}</section>
<section id="view-assets" class="view">${assetsHtml(state)}</section>

<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="티켓 상세"></aside>

<footer class="savebar">
  <span class="s off" id="savestate">🔌 연결 필요</span>
  <span class="path">${esc(state.ideas.path)}</span>
  <span class="sp"></span>
  <span class="path" id="savehint">누르는 즉시 저장소에 기록됩니다</span>
</footer>
<div class="toast" id="toast"></div>

<script>
const STATE = ${stateJson};
${APP_JS}
</script>`;
}
