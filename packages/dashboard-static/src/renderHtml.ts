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
  if(t.evidence&&t.evidence.length){ var e=t.evidence.find(x=>!/데이터 경로/.test(x[0]))||t.evidence[0]; return e[1]; }
  return (t.fire?"숫자·순위 레버 뚜렷":"관심 소재")+" · "+t.topic+" 코어 연결";
}
function candSource(t){
  if(t.evidence&&t.evidence.length){ var e=t.evidence.find(x=>!/데이터 경로/.test(x[0])); if(e) return (e[0]||"").split(" — ")[0]||e[0]; }
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
    +'<div class="mine-note">누르면 위 비중으로 <b>실시간 수집 요청</b>이 지시 전달함에 담깁니다 → 하단 [요약 복사] → Claude가 SNS·뉴스·통계를 돌려 후보를 채웁니다. 아래는 현재 수집된 후보입니다.</div>';
  // 후보 목록 (스크롤)
  let cands='<div class="cands" id="cands">';
  if(!list.length) cands+='<div class="empty">후보 없음 — [마이닝 실행]으로 수집 요청</div>';
  list.forEach(t=>{ cands+=candRow(t); });
  cands+='</div>';
  // 지식 인풋 (채팅창)
  const kbox='<div class="kbox"><div class="kh">💬 내 지식 입력 — 기사·메모·사진을 붙여넣으세요</div>'
    +'<div class="kprev" id="kprev"></div>'
    +'<textarea id="ktext" placeholder="여기에 기사 본문·수치·아이디어를 붙여넣기(Ctrl+V). 이미지도 붙여넣으면 미리보기로 담깁니다."></textarea>'
    +'<div class="krow"><button class="kadd" id="kadd">지식 추가</button>'
    +'<span class="khint">텍스트는 그대로 전달됩니다. 이미지는 세션에 직접 올려야 제가 실제로 봅니다(여기선 첨부 표시만).</span></div></div>';
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
  if(mb) mb.onclick=()=>{
    const w=S.weights.map(x=>x.label+" "+x.pct+"%").join(" · ");
    pushDecision("🔎 컨텐츠 마이닝 실행 요청 — 비중["+w+"] → 새 후보 10건을 SNS·뉴스·통계에서 수집해줘",
      "마이닝 요청 담김 — [요약 복사]로 저에게 보내세요");
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
    if(ka) ka.onclick=()=>{
      const v=ta.value.trim(); const imgs=prev?prev.querySelectorAll("img").length:0;
      if(!v&&!imgs){ toast("기사·메모를 입력하거나 이미지를 붙여넣으세요"); return; }
      let msg="💬 지식 입력: "+(v||"(텍스트 없음)"); if(imgs) msg+=" [사진 "+imgs+"장 첨부 — 세션에 직접 업로드 필요]";
      pushDecision(msg, "지식 담김 — [요약 복사]로 전달");
      ta.value=""; if(prev) prev.innerHTML=""; pendingImgs=0;
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
  if(kind==="pick"){ t.stage=1; if(!t.flags.includes("선정")) t.flags.push("선정");
    S.learning.push({t:t.title,a:"선정",topic:t.topic,fire:!!t.fire});
    pushDecision("✅ 선정: "+t.title+" ("+t.topic+"/"+t.fmt+") — 트렌드분석·리서치 학습신호(선호)", t.title.split(" — ")[0]+" 선정"); }
  else { t.flags.push("버림");
    S.learning.push({t:t.title,a:"탈락",topic:t.topic,fire:!!t.fire});
    pushDecision("❌ 탈락: "+t.title+" ("+t.topic+") — 트렌드분석·리서치 학습신호(비선호)", t.title.split(" — ")[0]+" 탈락"); }
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

document.getElementById("bcopy").onclick=async()=>{
  if(!S.decisions.length){ toast("아직 결정이 없습니다 — 티켓을 눌러보세요"); return; }
  const txt="[wirit 관제탑 결정 · "+STATE.dateLabel+"]\n"+S.decisions.map(d=>"- "+d).join("\n")+"\n\n이대로 진행해줘.";
  try{ await navigator.clipboard.writeText(txt); toast("복사 완료 — Claude에게 붙여넣으세요"); }
  catch(e){ prompt("아래를 복사하세요:", txt); }
};
document.getElementById("breset").onclick=()=>{ localStorage.removeItem(KEY); S=load(); renderBoard(); toast("초기 상태로"); };

let tmr=null;
function toast(m){ const el=document.getElementById("toast"); el.textContent=m; el.classList.add("on"); clearTimeout(tmr); tmr=setTimeout(()=>el.classList.remove("on"),2400); }
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmt(s){ return esc(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>"); }

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
