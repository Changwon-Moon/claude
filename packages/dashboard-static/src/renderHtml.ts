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

/* ── 컨텐츠 마이닝 패널 (칸반 첫 열, 화면 1/3 폭) ── */
.col.mining{flex:0 0 min(660px,84vw);display:flex;flex-direction:column;max-height:calc(100vh - 205px);background:var(--band)}
.mine-h{font-size:13.5px;font-weight:800;color:var(--cobalt);display:flex;align-items:center;gap:6px;padding:4px 6px 8px}
.mine-h .n{margin-left:auto;font-variant-numeric:tabular-nums;background:var(--card);border:1px solid var(--line);border-radius:999px;min-width:22px;text-align:center;padding:1px 7px;font-size:11.5px;color:var(--text)}
.mine-h .lrn{font-size:10.5px;font-weight:800;color:var(--gray);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:2px 8px}
.weights{display:flex;gap:6px;flex-wrap:wrap;padding:0 4px 8px}
.wt{display:flex;align-items:center;gap:3px;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:4px 8px;font-size:11.5px;font-weight:700;color:var(--gray)}
.wt input{width:34px;border:none;background:transparent;color:var(--cobalt);font-weight:800;font:inherit;font-size:12.5px;text-align:right;padding:0}
.wt input:focus{outline:none}
.wt .pc{color:var(--gray);font-weight:700}
.wsum{font-size:10.5px;color:var(--gray);align-self:center;margin-left:2px}
.wsum.bad{color:var(--red);font-weight:800}
.mine-btn{width:100%;background:var(--cobalt);color:#fff;font-size:13.5px;font-weight:800;border-radius:10px;padding:11px;margin:0 0 4px;display:flex;align-items:center;justify-content:center;gap:7px}
.mine-note{font-size:10.5px;color:var(--gray);line-height:1.4;padding:0 2px 6px}
.cands{flex:1 1 auto;min-height:90px;overflow-y:auto;display:flex;flex-direction:column;gap:7px;padding:2px 2px 4px}
.cand{background:var(--card);border:1px solid var(--line);border-radius:11px;padding:10px 11px;display:flex;flex-direction:column;gap:5px}
.cand.picked{border-color:var(--ok);opacity:.7}
.cand.dropped{border-color:var(--line);opacity:.4}
.cand .ctop{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.cand .ct{font-size:14px;font-weight:800;line-height:1.32;letter-spacing:-.01em}
.cand .cmeta{font-size:11px;color:var(--gray);display:flex;gap:8px;flex-wrap:wrap}
.cand .cmeta b{color:var(--text);font-weight:700}
.cand .cr{font-size:12px;color:var(--text);line-height:1.45}
.cand .cr .lbl{color:var(--gray);font-weight:700}
.cand .cbtns{display:flex;gap:6px;margin-top:2px}
.cbtn{font-size:12px;font-weight:800;border-radius:8px;padding:6px 12px;border:1px solid var(--line)}
.cbtn.pick{background:var(--cobalt);color:#fff;border-color:var(--cobalt)}
.cbtn.drop{background:var(--card);color:var(--red);border-color:var(--red)}
.cbtn.detail{background:var(--card);color:var(--gray)}
/* 지식 인풋 (마이닝 패널 하단 채팅창) */
.kbox{border-top:1px solid var(--line);margin-top:6px;padding:9px 3px 2px;display:flex;flex-direction:column;gap:7px}
.kbox .kh{font-size:11.5px;font-weight:800;color:var(--gray)}
.kbox textarea{font:inherit;font-size:12.5px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);color:var(--text);padding:9px;min-height:56px;resize:vertical}
.kprev{display:flex;gap:6px;flex-wrap:wrap}
.kprev .kp{position:relative}
.kprev img{width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid var(--line);display:block}
.kprev .kx{position:absolute;top:-6px;right:-6px;background:var(--ink);color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;line-height:18px;text-align:center}
.kbox .krow{display:flex;gap:7px;align-items:center}
.kbox .kadd{background:var(--cobalt);color:#fff;font-size:12.5px;font-weight:800;border-radius:9px;padding:8px 14px}
.kbox .khint{font-size:10.5px;color:var(--gray);line-height:1.4}

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
.dbody{flex:1;overflow-y:auto;padding:16px 18px 120px}
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
.acts{position:sticky;bottom:0;margin:14px -18px -120px;padding:14px 18px 18px;background:var(--paper);border-top:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap}
.btn{flex:1;min-width:110px;text-align:center;font-size:14px;font-weight:800;border-radius:10px;padding:12px 10px}
.btn.primary{background:var(--cobalt);color:#fff}
.btn.ghost{background:var(--card);border:1.5px solid var(--line);color:var(--text)}
.btn.danger{background:var(--card);border:1.5px solid var(--red);color:var(--red)}
.editbox{display:none;flex-direction:column;gap:8px;width:100%}
.editbox.on{display:flex}
.editbox textarea{font:inherit;font-size:13.5px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);color:var(--text);padding:10px;min-height:74px;resize:vertical}
.outbox{position:fixed;left:0;right:0;bottom:0;z-index:35;background:var(--ink);color:#fff;display:flex;gap:10px;align-items:center;padding:11px 16px}
.outbox .cnt{font-size:13px;color:#AEB8C4}
.outbox .cnt b{color:#fff;font-variant-numeric:tabular-nums}
.outbox .sp{margin-left:auto}
.obtn{font-size:13px;font-weight:800;border-radius:9px;padding:9px 14px}
.obtn.copy{background:var(--cobalt);color:#fff}
.obtn.reset{color:#AEB8C4;border:1px solid rgba(255,255,255,.25)}
.toast{position:fixed;left:50%;bottom:74px;transform:translateX(-50%) translateY(8px);background:var(--ink);color:#fff;font-size:13px;font-weight:700;border:1px solid rgba(255,255,255,.2);border-radius:99px;padding:9px 16px;opacity:0;pointer-events:none;transition:.2s;z-index:60}
.toast.on{opacity:1;transform:translateX(-50%)}
/* GitHub 연결 바 (관제탑을 실제로 동작시키는 백엔드) */
.ghbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:9px 18px;font-size:12.5px;border-bottom:1px solid var(--line);background:var(--band)}
.ghbar.on{background:rgba(27,158,107,.10)}
.ghbar .st{font-weight:800}
.ghbar .st.ok{color:var(--ok)} .ghbar .st.off{color:var(--warn)}
.ghbar .sp{margin-left:auto}
.ghbtn{font-size:12px;font-weight:800;border-radius:8px;padding:6px 11px;border:1px solid var(--line);background:var(--card);color:var(--text);cursor:pointer}
.ghbtn.prim{background:var(--cobalt);color:#fff;border-color:var(--cobalt)}
.ghbtn.wf{color:var(--cobalt)}
.ghform{display:none;gap:8px;align-items:center;width:100%;margin-top:8px;flex-wrap:wrap}
.ghform.on{display:flex}
.ghform input{flex:1;min-width:220px;font:inherit;font-size:12.5px;border:1.5px solid var(--line);border-radius:8px;background:var(--card);color:var(--text);padding:8px 10px}
.ghform .hint{font-size:11px;color:var(--gray);width:100%;line-height:1.5}
.ghform .hint a{color:var(--cobalt)}
.runs{display:flex;gap:8px;flex-wrap:wrap;width:100%;margin-top:6px}
.run{font-size:11px;border:1px solid var(--line);border-radius:7px;padding:3px 8px;background:var(--card);text-decoration:none;color:var(--text)}
.run .dot{font-weight:900}
.run .dot.ok{color:var(--ok)} .run .dot.bad{color:var(--red)} .run .dot.run{color:var(--warn)}
@media (max-width:640px){.board{padding:12px;gap:10px}.col{flex-basis:240px}.kpis{grid-template-columns:repeat(2,1fr)}}
`;

const APP_JS = String.raw`
const STAGES = STATE.stages, RLBL = STATE.rubricLabels;
function img(k){ return k ? (STATE.images[k] || k) : ""; }
const KEY = "wirit-tower-" + STATE.generatedFrom;
let S = load();
function load(){
  try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.tickets&&s.tickets.length===STATE.tickets.length){ if(!s.weights) s.weights=STATE.mining.weights.map(w=>({...w})); if(!s.learning) s.learning=[]; return s; } }catch(e){}
  return { tickets: STATE.tickets.map(t=>({...t, comments: []})), decisions: [], weights: STATE.mining.weights.map(w=>({...w})), learning: [] };
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
  async append(path,addition,message){ const cur=await this.getFile(path);
    const text=(cur.text?cur.text.replace(/\s*$/,"")+"\n\n":"")+addition+"\n";
    return this.putFile(path,text,message,cur.sha); },
  async runs(){ const d=await this.api("/repos/"+this.owner+"/"+this.repo+"/actions/runs?per_page=6&branch="+encodeURIComponent(this.branch));
    return (d.workflow_runs||[]).map(r=>({name:r.name,status:r.status,conclusion:r.conclusion,url:r.html_url})); },
};
function ghStamp(){ return "[" + STATE.dateLabel + " 관제탑]"; }

/* 워크플로 빠른 실행 정의 */
const GH_WF=[
  {file:"research-digest.yml", label:"⛏ 마이닝", inputs:{}, msg:"소재 마이닝(RSS) 워크플로를 시작했습니다"},
  {file:"asset-fetch.yml", label:"🖼 로고 취득", inputs:{target:"data/datasets/salary-freshman-2026-07.json"}, msg:"로고 자동취득 워크플로를 시작했습니다"},
  {file:"dart-salary.yml", label:"💰 평균연봉", inputs:{year:"2025",companies:"data/datasets/salary-freshman-2026-07.json"}, msg:"평균연봉(DART) 워크플로를 시작했습니다"},
];
async function runWf(wf){
  if(!GH.connected()){ toast("먼저 GitHub에 연결하세요"); return; }
  try{ await GH.dispatch(wf.file, wf.inputs); toast(wf.msg+" — 잠시 후 [상태]로 확인"); setTimeout(refreshRuns, 3000); }
  catch(e){ toast("실행 실패: "+e.message); }
}
async function refreshRuns(){
  const box=document.getElementById("ghruns"); if(!box||!GH.connected()) return;
  try{ const rs=await GH.runs();
    box.innerHTML=rs.map(r=>{ const cls=r.status!=="completed"?"run":(r.conclusion==="success"?"ok":"bad");
      const mark=r.status!=="completed"?"●":(r.conclusion==="success"?"✔":"✕");
      return '<a class="run" href="'+r.url+'" target="_blank" rel="noopener"><span class="dot '+cls+'">'+mark+'</span> '+esc(r.name)+'</a>'; }).join("")||'<span class="run">최근 실행 없음</span>';
  }catch(e){ box.innerHTML='<span class="run">상태 조회 실패: '+esc(e.message)+'</span>'; }
}
function renderGhBar(){
  const bar=document.getElementById("ghbar"); if(!bar) return;
  const on=GH.connected();
  bar.className="ghbar"+(on?" on":"");
  const wfBtns=on?GH_WF.map((w,i)=>'<button class="ghbtn wf" data-wf="'+i+'">'+w.label+'</button>').join(""):"";
  bar.innerHTML=
    '<span class="st '+(on?"ok":"off")+'">'+(on?"🟢 GitHub 연결됨":"🔌 GitHub 연결 안 됨")+'</span>'
    +(on?'<span style="color:var(--gray)">'+esc(GH.owner)+"/"+esc(GH.repo)+' · '+esc(GH.branch)+'</span>':'<span style="color:var(--gray)">연결하면 관제탑에서 직접 마이닝·업로드·워크플로 실행이 됩니다</span>')
    +wfBtns
    +'<span class="sp"></span>'
    +(on?'<button class="ghbtn" id="ghrefresh">↻ 상태</button><button class="ghbtn" id="ghdisc">연결 해제</button>':'<button class="ghbtn prim" id="ghconn">연결하기</button>')
    +'<div class="ghform" id="ghform"><input type="password" id="ghtok" placeholder="GitHub 토큰 붙여넣기 (ghp_... 또는 github_pat_...)"><button class="ghbtn prim" id="ghsave">저장·연결</button>'
    +'<div class="hint">이 저장소 전용 <b>Fine-grained 토큰</b>을 만드세요(권한: Contents=Read/Write, Actions=Read/Write). 토큰은 이 브라우저에만 저장되고 GitHub 외 어디로도 전송되지 않습니다. → <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener">토큰 만들기</a></div></div>'
    +(on?'<div class="runs" id="ghruns"></div>':"");
  wireGhBar();
  if(on) refreshRuns();
}
function wireGhBar(){
  const conn=document.getElementById("ghconn");
  if(conn) conn.onclick=()=>document.getElementById("ghform").classList.toggle("on");
  const save=document.getElementById("ghsave");
  if(save) save.onclick=async()=>{
    const t=(document.getElementById("ghtok").value||"").trim(); if(!t){ toast("토큰을 붙여넣으세요"); return; }
    GH.setToken(t);
    try{ const me=await GH.me(); toast("연결 성공 — "+(me.login||"")); renderGhBar(); }
    catch(e){ GH.setToken(""); toast("연결 실패: "+e.message); }
  };
  const disc=document.getElementById("ghdisc");
  if(disc) disc.onclick=()=>{ GH.setToken(""); renderGhBar(); toast("연결 해제됨"); };
  const rf=document.getElementById("ghrefresh"); if(rf) rf.onclick=refreshRuns;
  document.querySelectorAll("[data-wf]").forEach(b=>b.onclick=()=>runWf(GH_WF[+b.dataset.wf]));
}

/* 탭 전환 */
document.querySelectorAll(".tab").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===b));
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id==="view-"+b.dataset.v));
  };
});

/* 결정 1건을 지시 전달함에 담기 */
function pushDecision(text, msg){
  S.decisions.push(text); save();
  document.getElementById("dcnt").textContent=S.decisions.length;
  toast(msg||"지시 전달함에 담김");
}

/* 회사 탭 편집 배선 — CEO 원칙 + 팀별 원칙·프롬프트 */
function wireCompany(){
  const ceoBtn=document.querySelector("[data-ce]");
  if(ceoBtn){
    ceoBtn.onclick=()=>document.getElementById("ed-ceo").classList.toggle("on");
    document.querySelector("[data-ce-save]").onclick=()=>{
      const ta=document.querySelector("#ed-ceo textarea"), v=ta.value.trim();
      if(!v){ toast("내용을 입력하세요"); return; }
      pushDecision("CEO 원칙 수정·추가: "+v, "CEO 원칙 지시 담김"); ta.value=""; document.getElementById("ed-ceo").classList.remove("on");
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
      pushDecision("「"+name+"」 원칙·프롬프트 수정: "+v, name+" 지시 담김"); ta.value=""; area.classList.remove("on");
    };
  });
}
wireCompany();

/* 칸반 */
const board=document.getElementById("board");
function candReason(t){
  var ev=t.evidence||[];
  var e=ev.find(x=>x[0]==="선정 사유")||ev.find(x=>x[0]==="기획 판단");
  if(e) return e[1];
  return (t.fire?"숫자·순위 레버 뚜렷":"관심 소재")+" · "+t.topic+" 코어 연결";
}
function candSource(t){
  var ev=t.evidence||[];
  var e=ev.find(x=>x[0]==="출처")||ev.find(x=>x[0]==="신호");
  if(e) return (e[1]||"").split(" — ")[0]||e[1];
  return "소재보드 신호";
}
function buildMiningPanel(list){
  const col=document.createElement("section"); col.className="col mining";
  // 헤더
  let h='<div class="mine-h">🔎 컨텐츠 마이닝<span class="lrn">학습 '+S.learning.length+'건</span><span class="n">'+list.length+'</span></div>';
  // 비중 설정
  let wt='<div class="weights">';
  S.weights.forEach((w,i)=>{ wt+='<span class="wt">'+esc(w.label)+' <input type="number" min="0" max="100" data-w="'+i+'" value="'+w.pct+'"><span class="pc">%</span></span>'; });
  const sum=S.weights.reduce((a,w)=>a+(+w.pct||0),0);
  wt+='<span class="wsum'+(sum===100?"":" bad")+'" id="wsum">합 '+sum+'%</span></div>';
  // 마이닝 버튼 + 안내
  const btn='<button class="mine-btn" id="mineBtn">⛏ 마이닝 실행 — 새 후보 10건 요청</button>'
    +'<div class="mine-note"><b>GitHub 연결 시</b>: 누르면 마이닝 워크플로가 <b>바로 실행</b>됩니다(상단 바에서 상태 확인). <b>미연결 시</b>: 요청이 지시 전달함에 담깁니다 → [요약 복사] → Claude. 아래는 현재 수집된 후보입니다.</div>';
  // 후보 목록 (스크롤)
  let cands='<div class="cands" id="cands">';
  if(!list.length) cands+='<div class="empty">후보 없음 — [마이닝 실행]으로 수집 요청</div>';
  list.forEach(t=>{ cands+=candRow(t); });
  cands+='</div>';
  // 지식 인풋 (채팅창)
  const kbox='<div class="kbox"><div class="kh">💬 자료 인박스 — 기사·메모·대량 자료를 붙여넣으세요</div>'
    +'<div class="kprev" id="kprev"></div>'
    +'<textarea id="ktext" placeholder="기사 본문·수치·아이디어를 붙여넣기(Ctrl+V). 길어도 됩니다 — 연결 시 저장소 research/INBOX.md에 바로 커밋됩니다."></textarea>'
    +'<div class="krow"><button class="kadd" id="kadd">지식 추가</button>'
    +'<span class="khint"><b>연결 시</b> 저장소에 바로 저장됩니다(대량 OK). 이미지는 세션에 직접 올려야 실제로 반영됩니다(여기선 첨부 표시만).</span></div></div>';
  col.innerHTML=h+wt+btn+cands+kbox;
  return col;
}
function candRow(t){
  const picked=(t.flags||[]).includes("선정"), dropped=(t.flags||[]).includes("버림");
  const sum=t.rubric&&t.rubric.sum?t.rubric.sum:null;
  return '<div class="cand'+(picked?" picked":"")+(dropped?" dropped":"")+'" data-cid="'+t.id+'">'
    +'<div class="ctop"><span class="chip '+(t.tier==="T1"?"t1":"t2")+'">'+(t.tier==="T1"?"주":"부")+'</span>'
    +'<span class="topic">'+esc(t.topic)+'</span>'+(sum?'<span class="score" style="margin-left:auto">'+sum+'점</span>':"")+'</div>'
    +'<div class="ct">'+(t.fire?"🔥 ":"")+esc(t.title)+'</div>'
    +'<div class="cmeta"><span><b>출처</b> '+esc(candSource(t))+'</span><span><b>포맷</b> '+esc(t.fmt)+'</span></div>'
    +'<div class="cr"><span class="lbl">선정 사유 · </span>'+esc(candReason(t))+'</div>'
    +(picked?'<div class="cr" style="color:var(--ok);font-weight:800">✅ 선정됨 → 기획으로 이동</div>':dropped?'<div class="cr" style="color:var(--gray)">❌ 탈락</div>'
      :'<div class="cbtns"><button class="cbtn pick" data-pick="'+t.id+'">✅ 선정</button><button class="cbtn drop" data-drop="'+t.id+'">❌ 탈락</button><button class="cbtn detail" data-detail="'+t.id+'">상세</button></div>')
    +'</div>';
}
function renderBoard(){
  board.innerHTML="";
  STAGES.forEach((name,si)=>{
    const list=S.tickets.filter(t=>t.stage===si && !(t.flags||[]).includes("버림"));
    if(si===0){ board.appendChild(buildMiningPanel(list)); return; }
    const col=document.createElement("section");
    col.className="col";
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
        +'<span class="topic">'+esc(t.topic)+'</span></div>'
        +'<div class="tt">'+(t.fire?"🔥 ":"")+esc(t.title)+'</div>'
        +'<div class="meta"><span>'+esc(t.fmt)+'</span>'+(sum?'<span class="score">'+sum+'점</span>':"")+'</div>'
        +(t.thumb?'<img class="mini" src="'+img(t.thumb)+'" alt="">':"");
      wrap.appendChild(b);
    });
    col.appendChild(wrap); board.appendChild(col);
  });
  wireMining();
  document.getElementById("dcnt").textContent=S.decisions.length;
}

/* 마이닝 패널 상호작용 */
let pendingImgs=0;
function wireMining(){
  // 비중 입력
  document.querySelectorAll("[data-w]").forEach(inp=>{
    inp.onchange=()=>{ const i=+inp.dataset.w; S.weights[i].pct=Math.max(0,Math.min(100,+inp.value||0)); save();
      const sum=S.weights.reduce((a,w)=>a+(+w.pct||0),0); const el=document.getElementById("wsum"); if(el){ el.textContent="합 "+sum+"%"; el.className="wsum"+(sum===100?"":" bad"); } };
  });
  // 마이닝 실행
  const mb=document.getElementById("mineBtn");
  if(mb) mb.onclick=async()=>{
    const w=S.weights.map(x=>x.label+" "+x.pct+"%").join(" · ");
    if(GH.connected()){
      // 비중을 저장소에 기록하고 실제 마이닝 워크플로 실행
      try{ await GH.append("research/mining-requests.md", "- "+ghStamp()+" 비중["+w+"] 마이닝 요청", "관제탑: 마이닝 요청 "+STATE.dateLabel); }catch(e){}
      runWf(GH_WF[0]);
    } else {
      pushDecision("🔎 컨텐츠 마이닝 실행 요청 — 비중["+w+"] → 새 후보 10건을 SNS·뉴스·통계에서 수집해줘",
        "마이닝 요청 담김 — [요약 복사]로 저에게 보내세요");
    }
  };
  // 후보 선정/탈락/상세
  document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>candAction(b.dataset.pick,"pick"));
  document.querySelectorAll("[data-drop]").forEach(b=>b.onclick=()=>candAction(b.dataset.drop,"drop"));
  document.querySelectorAll("[data-detail]").forEach(b=>b.onclick=()=>openDrawer(b.dataset.detail));
  // 지식 인풋: 붙여넣기(이미지) + 추가
  const ta=document.getElementById("ktext"), prev=document.getElementById("kprev");
  if(ta){
    ta.onpaste=(e)=>{
      const items=(e.clipboardData||{}).items||[];
      for(const it of items){ if(it.type&&it.type.indexOf("image")===0){ const f=it.getAsFile(); if(f){ const r=new FileReader(); r.onload=()=>addImgPrev(prev,r.result); r.readAsDataURL(f); pendingImgs++; } } }
    };
    const ka=document.getElementById("kadd");
    if(ka) ka.onclick=async()=>{
      const v=ta.value.trim(); const imgs=prev?prev.querySelectorAll("img").length:0;
      if(!v&&!imgs){ toast("기사·메모를 입력하거나 이미지를 붙여넣으세요"); return; }
      if(GH.connected()){
        // 대량 자료를 저장소 인박스에 바로 커밋 (복사-붙여넣기 없이)
        ka.disabled=true; ka.textContent="저장 중…";
        const block="## "+ghStamp()+"\n\n"+(v||"(텍스트 없음)")+(imgs?"\n\n> 사진 "+imgs+"장은 세션에 직접 업로드해야 실제로 반영됩니다.":"");
        try{ await GH.append("research/INBOX.md", block, "관제탑: 지식 자료 추가 "+STATE.dateLabel);
          toast("저장소 research/INBOX.md에 커밋됨 ✓"); ta.value=""; if(prev) prev.innerHTML=""; pendingImgs=0;
        }catch(e){ toast("커밋 실패: "+e.message); }
        ka.disabled=false; ka.textContent="지식 추가";
      } else {
        let msg="💬 지식 입력: "+(v||"(텍스트 없음)"); if(imgs) msg+=" [사진 "+imgs+"장 첨부 — 세션에 직접 업로드 필요]";
        pushDecision(msg, "지식 담김 — [요약 복사]로 전달");
        ta.value=""; if(prev) prev.innerHTML=""; pendingImgs=0;
      }
    };
  }
}
function addImgPrev(prev,src){
  if(!prev) return; const d=document.createElement("span"); d.className="kp";
  d.innerHTML='<img src="'+src+'" alt=""><span class="kx">✕</span>';
  d.querySelector(".kx").onclick=()=>d.remove(); prev.appendChild(d);
}
function candAction(id,kind){
  const t=tk(id); if(!t) return;
  t.flags=t.flags||[];
  let line;
  if(kind==="pick"){ t.stage=1; if(!t.flags.includes("선정")) t.flags.push("선정");
    S.learning.push({t:t.title,a:"선정",topic:t.topic,fire:!!t.fire});
    line="✅ 선정: "+t.title+" ("+t.topic+"/"+t.fmt+")";
    if(!GH.connected()) pushDecision(line+" — 트렌드분석·리서치 학습신호(선호)", t.title.split(" — ")[0]+" 선정"); }
  else { t.flags.push("버림");
    S.learning.push({t:t.title,a:"탈락",topic:t.topic,fire:!!t.fire});
    line="❌ 탈락: "+t.title+" ("+t.topic+")";
    if(!GH.connected()) pushDecision(line+" — 트렌드분석·리서치 학습신호(비선호)", t.title.split(" — ")[0]+" 탈락"); }
  // 연결됐으면 선택을 저장소 결정 인박스에 바로 기록(트렌드분석·리서치 학습 데이터)
  if(GH.connected()){
    GH.append("research/decisions-inbox.md","- "+ghStamp()+" "+line,"관제탑: 소재 결정 "+STATE.dateLabel)
      .then(()=>toast("결정을 저장소에 기록했습니다 ✓")).catch(e=>toast("기록 실패: "+e.message));
  }
  save(); renderBoard();
}

/* 드로어 */
const drawer=document.getElementById("drawer"), scrim=document.getElementById("scrim");
let cur=null;
function openDrawer(id){ cur=id; const t=tk(id); drawer.innerHTML=buildDetail(t);
  drawer.classList.add("on"); scrim.classList.add("on");
  drawer.querySelector(".close").onclick=closeDrawer; wireActions(t);
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
      +'<div class="why">해당 팀이 이 코멘트로 재작업합니다(지시 전달함에 기록됨).</div></div>';
  });

  let acts="";
  if(t.stage===0 && !(t.flags||[]).includes("버림")){
    acts='<button class="btn primary" data-act="go">✅ 이 소재 진행</button>'
      +'<button class="btn ghost" data-act="hold">⏸ 보류</button>'
      +'<button class="btn danger" data-act="drop">🗑 버림</button>';
  } else if(t.stage===4){
    acts='<button class="btn primary" data-act="publish">🚀 발행 승인</button>'
      +'<button class="btn ghost" data-act="edit">✏️ 수정지시</button>'
      +'<button class="btn danger" data-act="reject">❌ 반려</button>'
      +'<div class="editbox" id="editbox"><textarea id="edittext" placeholder="예) 제목 폰트 키우고 2·3위 재확인해줘"></textarea>'
      +'<button class="btn primary" data-act="editsave">코멘트 남기기</button></div>';
  } else if(t.auto){
    acts='<div class="why">자동 슬롯 — 사후 통보만. 무인 해제는 설정에서.</div>';
  } else {
    acts='<div class="why">이 단계에선 오너 액션이 없습니다. 다음 검수·승인 단계에서 다시 알림.</div>';
  }

  return '<div class="dhead"><button class="close" aria-label="닫기">✕</button>'
    +'<div class="tt">'+(t.fire?"🔥 ":"")+esc(t.title)+'</div>'
    +'<div class="row"><span class="chip '+(t.tier==="T1"?"t1":"t2")+'">'+(t.tier==="T1"?"주 콘텐츠":"부 콘텐츠")+'</span>'
    +'<span>'+esc(t.topic)+'</span><span>·</span><span>'+esc(t.fmt)+'</span><span>·</span><span>'+STAGES[t.stage]+'</span>'
    +(sum?'<span>·</span><span>리서치 '+sum+'점</span>':"")+'</div></div>'
    +'<div class="dbody"><div class="tl">'+tl+'</div><div class="acts">'+acts+'</div></div>';
}

function wireActions(t){
  drawer.querySelectorAll("[data-act]").forEach(b=>{
    b.onclick=()=>{
      const a=b.dataset.act, ttl=short(t);
      if(a==="go"){ t.stage=1; t.flags=(t.flags||[]).filter(f=>f!=="보류"); S.decisions.push("진행: "+t.title+" → 기획안"); done(ttl+" 기획으로"); }
      if(a==="hold"){ t.flags=t.flags||[]; if(!t.flags.includes("보류")) t.flags.push("보류"); S.decisions.push("보류: "+t.title); done(ttl+" 보류"); }
      if(a==="drop"){ t.flags=t.flags||[]; t.flags.push("버림"); S.decisions.push("버림: "+t.title); done(ttl+" 제외"); }
      if(a==="publish"){ t.stage=5; S.decisions.push("발행 승인: "+t.title); done(ttl+" 발행 승인"); }
      if(a==="reject"){ t.stage=2; t.flags=t.flags||[]; t.flags.push("수정요청"); S.decisions.push("반려: "+t.title+" → 재작업"); done(ttl+" 반려"); }
      if(a==="edit"){ drawer.querySelector("#editbox").classList.toggle("on"); return; }
      if(a==="editsave"){ const v=drawer.querySelector("#edittext").value.trim(); if(!v){ toast("코멘트를 입력하세요"); return; }
        t.comments=t.comments||[]; t.comments.push(v); t.flags=t.flags||[]; if(!t.flags.includes("수정요청")) t.flags.push("수정요청");
        S.decisions.push('수정지시('+t.title+'): "'+v+'"'); done("수정지시 기록됨"); }
    };
  });
}
function short(t){ return t.title.split(" — ")[0]; }
function done(msg){ save(); renderBoard(); closeDrawer(); toast(msg); }

async function copyText(txt){
  // 1) 표준 API (보안 컨텍스트에서만 동작 — 아티팩트 샌드박스에선 막힘)
  try{ if(navigator.clipboard&&navigator.clipboard.writeText){ await navigator.clipboard.writeText(txt); return true; } }catch(e){}
  // 2) 폴백: 임시 textarea + execCommand
  try{ const ta=document.createElement("textarea"); ta.value=txt; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.focus(); ta.select();
    const ok=document.execCommand("copy"); document.body.removeChild(ta); if(ok) return true; }catch(e){}
  return false;
}
document.getElementById("bcopy").onclick=async()=>{
  if(!S.decisions.length){ toast("아직 결정이 없습니다 — 티켓을 눌러보세요"); return; }
  const txt="[wirit 관제탑 결정 · "+STATE.dateLabel+"]\n"+S.decisions.map(d=>"- "+d).join("\n")+"\n\n이대로 진행해줘.";
  if(await copyText(txt)) toast("복사 완료 — Claude에게 붙여넣으세요");
  else window.prompt("아래를 길게 눌러 복사하세요:", txt);
};
document.getElementById("breset").onclick=()=>{ localStorage.removeItem(KEY); S=load(); renderBoard(); toast("초기 상태로"); };

let tmr=null;
function toast(m){ const el=document.getElementById("toast"); el.textContent=m; el.classList.add("on"); clearTimeout(tmr); tmr=setTimeout(()=>el.classList.remove("on"),2400); }
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmt(s){ return esc(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>"); }

renderGhBar();
renderBoard();
`;

function esc(s: unknown): string {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
    `<div class="edarea" id="ed-ceo"><div class="edhint">추가하거나 고칠 원칙을 적으세요. [지시 전달함에 담기] → 하단 [요약 복사] → Claude에게 붙여넣으면 CEO.md에 반영됩니다.</div>` +
    `<textarea placeholder="예) 디자인 원칙 추가: 표 헤더는 잉크 배경에 흰 글씨로 / 또는 기존 원칙 수정 내용"></textarea>` +
    `<button class="ebtn save" data-ce-save>지시 전달함에 담기</button></div>`;

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
        `<button class="ebtn save" data-te-save="${esc(t.slug)}|${esc(t.name)}">지시 전달함에 담기</button></div>` +
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
</header>

<div class="kpis">${kpiHtml(state)}</div>

<div class="ghbar" id="ghbar"></div>

<nav class="tabs">
  <button class="tab on" data-v="board">🗂 파이프라인</button>
  <button class="tab" data-v="company">🏢 회사</button>
  <button class="tab" data-v="assets">📦 자산</button>
</nav>

<section id="view-board" class="view on">
  <div class="notice"><span>티켓을 눌러 <b>판단·근거</b>를 보고 <b>승인/보류/수정지시</b>를 내립니다.</span><span>결정은 아래 <b>지시 전달함</b>에 모입니다 → [요약 복사] 후 Claude에게 붙여넣으면 실행됩니다.</span></div>
  <main class="board" id="board"></main>
</section>
<section id="view-company" class="view">${companyHtml(state)}</section>
<section id="view-assets" class="view">${assetsHtml(state)}</section>

<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="티켓 상세"></aside>

<footer class="outbox">
  <span class="cnt">지시 전달함 · <b id="dcnt">0</b>건</span>
  <span class="sp"></span>
  <button class="obtn reset" id="breset">초기화</button>
  <button class="obtn copy" id="bcopy">요약 복사</button>
</footer>
<div class="toast" id="toast"></div>

<script>
const STATE = ${stateJson};
${APP_JS}
</script>`;
}
