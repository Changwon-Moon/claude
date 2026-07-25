/**
 * 소재 관제탑(아이디어 승인 보드) 생성기.
 * research/IDEAS.md 의 백로그를 승인/보류/거부 가능한 한 장 보드로 만든다.
 * 항목 5번째 값 = 기결정 상태("approve"|"hold"|"reject"|""), 6번째 = 진행 배지.
 * 실행: node scripts/build-idea-board.mjs [출력경로]
 */
import { writeFileSync } from "node:fs";
const OUT = process.argv[2] || "idea-board.html";
const CATS=[
 {key:"done",  label:"✅ 제작 완료 · 발행 대기 (재사용 오더 가능)"},
 {key:"now",   label:"🔥 시의성 대응 (지금 아니면 김빠짐)"},
 {key:"rhythm",label:"📅 발행 리듬 (데일리·주간·월간·분기 고정물)"},
 {key:"viral", label:"🧨 부동산 바이럴 시리즈"},
 {key:"auto",  label:"🤖 실거래 자동화 심화 (엔진 재활용)"},
 {key:"novel", label:"💡 참신 통계 (범용 트래픽축)"},
 {key:"metro", label:"🚇 지하철 시리즈"},
];
const I=[
 ["tohuh","done","🗺 [월간] 토허제 신고가 지도","수도권 토허제 40곳 신고가 경신 건수(지도+순위). 매월 재생산","발행 대기 · 재사용 오더","","done"],
 ["seoulmap","done","🗺 서울 신고가 지도 '강남이 아니었다'","서울 25구 신고가 경신 건수 코로플레스","제작 완료(픽셀 고정)","","done"],
 ["index2026","done","📉 국장 성적표 (코스피·코스닥 고점대비)","커버+차트 2장. 캡션 확정","발행 대기","","done"],
 ["metrospeed","done","🚇 지하철 운행속도 (1등·꼴등 둘 다 1호선)","커버+2단표 2장. 1차 출처 검증 완료","발행 대기 2호","","done"],
 ["gtxa","done","🚄 지하철이 온다 EP.1 · GTX-A","커버+현황일정+집값+인사이트 4장","제작·검증 완료","","done"],
 ["daejang8459","done","🏢 서울 34평·25평 대장 APT","지도+순위. 신폰트·테두리 반영 완료","제작 완료","","done"],
 ["dogam01","done","🏆 대장 도감 No.01 강남구","구별 대장 아파트 콜렉션 파일럿 3장","제작 완료","","done"],
 ["salary","done","💰 2026 대기업 평균연봉 TOP10","DART 공시 정밀값 + 실로고 10/10","승인 대기","","done"],
 // ── 백로그(2026-07-23 트리아지 반영) ──
 // now
 ["choron","now","부동산 대토론회 · 3대 쟁점","오늘 7/23 대국민 토론회 공급·금융·세제를 숫자로","국토부·금융위·국세청","hold",""],
 ["minwage","now","2027 최저임금 10,700원","7/14 확정. 역대 타임라인 + '최저임금으로 국평 몇 년'","최저임금위 공식","approve",""],
 ["rate","now","기준금리 3년6개월 만에 인상","7/16 2.50→2.75%. 추이 + '0.25%p면 이자 얼마'","한국은행 공표","approve",""],
 ["polhist","now","규제의 역사 타임라인","대책 발표일 vs 집값 흐름. 발표 당일 대응용","국토부·보도","approve",""],
 // rhythm
 ["krclose","rhythm","[데일리] 오늘의 국내 증시 마감","코스피·코스닥 마감+고점대비(국장 엔진 재활용)","야후/KRX","approve",""],
 ["usopen","rhythm","[데일리] 간밤의 미국 증시","M5 완성, IG 토큰 대기. 아침 습관 슬롯","Stooq","approve",""],
 ["dogam","rhythm","[주간·수] 대장 도감 연재","25개 구 = 25주 시즌제·도감 넘버링","국토부 실거래","reject",""],
 ["metroseries","rhythm","[주간·금] 지하철이 온다","개통 로드맵×부동산. 파일럿 GTX-A 완료","공식 로드맵·실거래","approve",""],
 ["temp","rhythm","[주간·일] 주간 시장 온도계","거래량·신고가 건수·중위가 한 주 정리","국토부 실거래","reject",""],
 ["club10","rhythm","[월간] 국평 10억 클럽","이달의 입성/이탈 동네","국토부 실거래","approve",""],
 ["chungyak","rhythm","[월간] 월간 청약 성적표","경쟁률 TOP·미달 단지 정직 공개","청약홈 API","approve",""],
 ["payslip","rhythm","[월간] 월급 실수령액 표","최저임금·세법 갱신 시 재발행(저장 킬러)","최저임금·세법","approve",""],
 ["daejangq","rhythm","[분기] 대장 84·59 지도+순위 갱신","이번 세트를 분기 정기화 + 순위 변동","국토부 실거래","approve",""],
 ["droptop","rhythm","[분기] 하락 TOP 정직 공개","상승만 다루는 계정과 차별화(신뢰)","국토부 실거래","reject",""],
 // viral
 ["years","viral","💸 월급으로 사는 데 몇 년? 🥇","아파트값÷평균연봉(DART×실거래, 남들 못 하는 조합)","DART+국토부","approve",""],
 ["lotto","viral","🎰 청약 로또 판독기","분양가 vs 주변 실거래 안전마진(차익보장 아님)","청약홈+실거래","approve",""],
 ["shoulda","viral","⏰ 그때 살걸 계산기","10년 전 vs 지금. 고점 매수도 정직하게","국토부 실거래","approve",""],
 ["commuteprice","viral","🚇 출근 30분의 가격","통근시간×집값, '강남까지 1분당 N천만원'","실거래+좌표","approve",""],
 ["name","viral","🏷 아파트 이름의 비밀","센트럴·포레 이름별 평균가·길이 상관","국토부 실거래","reject",""],
 ["receipt","viral","🧾 아파트 영수증","매매가+취득세+수수료+30년 이자=총액","실거래+세제","reject",""],
 ["unsold","viral","📉 미분양의 역설","그때 미분양, 지금은? 성공·실패 양면","국토부 미분양","approve",""],
 ["samedon","viral","🆚 같은 돈으로","10억: 강남 15평 vs 마포 25평 vs 일산 40평","국토부 실거래","approve",""],
 ["meme","viral","🗣 부동산 밈 팩트체크","벼락거지·영끌·국평·몸테크 데이터 검증","공공·실거래","reject",""],
 ["brand","viral","🏢 브랜드 계급도 ⚠️민감","브랜드별 평균 평당가('서열 아님' 프레임 필수)","국토부 실거래","approve",""],
 // auto
 ["dong","auto","동별 대장 ×25","구 심화(반포/서초/방배…) 엔진 파라미터만 교체","국토부 실거래","approve",""],
 ["station","auto","노선별 역세권 대장","역 좌표+반경 500m, 노선당 1편","실거래+좌표","approve",""],
 ["gyeonggi","auto","경기·신도시 대장","분당·일산·동탄·위례·광교…","국토부 실거래","approve",""],
 ["budget","auto","예산 지도 '15억이면 어디?'","구별 국평 중위가로 가능/불가 지도(5·10·15·20억)","국토부 실거래","approve",""],
 ["heatmap","auto","구별 평당가 히트맵","지도 엔진 재사용","국토부 실거래","approve",""],
 ["floor","auto","층수 프리미엄","같은 단지 로얄층 vs 저층 '1층의 할인율'","실거래 층 필드","approve",""],
 ["cancel","auto","신고가 후 취소 거래 통계","'집값 띄우기 의심'(단지 비난 금지, 제도 설명)","실거래 해제여부","reject",""],
 ["direct","auto","직거래 vs 중개거래 가격차","증여성 저가 직거래 통계","실거래 거래유형","reject",""],
 ["newold","auto","신축 vs 구축 프리미엄","연식 5년 단위 가격 곡선","실거래 건축년도","reject",""],
 ["rebuild","auto","재건축 연한 카운트다운","'내년에 30살 되는 아파트' 지도","건축년도+대장","reject",""],
 ["jeonse","auto","전세가율 갭 주의보","강북 79~80% 급등, 전세난 지수 최고","전월세 API","reject",""],
 ["notapt","auto","'아파트 말고' 시리즈","오피스텔·빌라·단독 동네별 시세(무주공산)","실거래 4유형","reject",""],
 // novel
 ["chicken","novel","🍗 치킨으로 환산한 물가","'월급=치킨 N마리' 연도별","통계청 외식물가","approve",""],
 ["day","novel","⏰ 한국인의 평균 하루","수면·노동·여가 분 단위","통계청 생활시간","approve",""],
 ["babyname","novel","👶 신생아 이름 TOP10","매년 자동 재활용, '내 이름은?'","행안부 공개","approve",""],
 ["cvs","novel","🏪 편의점 밀도 지도","구별 편의점 수(지도 엔진 보유)","localdata","approve",""],
 ["cafe","novel","☕ 카페 창업 vs 폐업","구별 개폐업(자영업 공감)","localdata","approve",""],
 ["nightstn","novel","🚇 잠들지 않는 역","첫차·막차로 본 서울","공식 시간표","approve",""],
 ["tuition","novel","🎓 등록금 vs 초봉","대학 4년 비용과 첫 연봉","공시×DART","approve",""],
 ["pension","novel","🧓 국민연금 세대 격차 ⚠️","낸 돈 vs 받는 돈(정치 프레임 주의)","공단 통계","approve",""],
 ["commutemap","novel","🚶 통근시간 지도","시군구별 평균 통근","통계청 총조사","approve",""],
 ["pop","novel","📉 우리 구 인구가 줄고 있다","주민등록 증감 히트맵","주민등록 API","approve",""],
 // metro
 ["congest","metro","노선별 혼잡도 순위","출퇴근 공감, 2단 표","공공데이터","approve",""],
 ["transfer","metro","환승 많은 역 순위","한 역에 노선 뱃지 여러 개","공공데이터","approve",""],
 ["lasttrain","metro","노선별 막차·심야 속도","실생활 저장가치","공식 시간표","reject",""],
 ["aptchange","metro","노선별 평균 아파트값 5년 변화","부동산×지하철 교차 before/after","실거래+역","approve",""],
 ["gtxspeed","metro","GTX 개통되면 표정속도 몇 배?","표정속도 후속·화제성","공식 속도","approve",""],
];
const BTNS=`<div class="btns"><button class="b ap" data-act="approve" title="승인">\u2713</button><button class="b hd" data-act="hold" title="보류">\u23f8</button><button class="b rj" data-act="reject" title="거부">\u2715</button></div>`;
const row=(it)=>`<div class="idea${it[6]==="done"?" is-done":""}" data-id="${it[0]}" data-seed="${it[5]||""}" data-state="">
 <div class="imain"><div class="ttl">${it[2]}</div><div class="why">${it[3]}</div></div>
 <div class="iside"><span class="src${it[6]==="done"?" ok":""}">${it[4]}</span>
  ${it[6]==="done"?"":BTNS}</div>
</div>`;
const groups=CATS.map(c=>{const items=I.filter(x=>x[1]===c.key);
 return `<section class="grp" data-cat="${c.key}"><h2>${c.label}<span class="gc" data-gc="${c.key}"></span></h2>${items.map(row).join("")}</section>`;}).join("");
const style=`<style>
:root{--ink:#141821;--cobalt:#2e6bff;--red:#e5484d;--green:#1f9d55;--amber:#c98a12;
 --bg:#f3f4f2;--card:#fff;--line:#e6e8e8;--txt:#141821;--muted:#5b6b7f;--soft:#93a0af;--chip:#eef1f4;}
@media (prefers-color-scheme:dark){:root{--bg:#0d1016;--card:#151a22;--line:#242b37;--txt:#eef2f7;--muted:#9aa7b6;--soft:#66748699;--chip:#1d242f;}}
:root[data-theme="light"]{--bg:#f3f4f2;--card:#fff;--line:#e6e8e8;--txt:#141821;--muted:#5b6b7f;--soft:#93a0af;--chip:#eef1f4;}
:root[data-theme="dark"]{--bg:#0d1016;--card:#151a22;--line:#242b37;--txt:#eef2f7;--muted:#9aa7b6;--soft:#6f7d8d;--chip:#1d242f;}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font-family:"Pretendard","Apple SD Gothic Neo",system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.45;padding-bottom:212px;}
.wrap{max-width:820px;margin:0 auto;padding:26px 18px 0;}
header.top{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.brand{font-size:24px;font-weight:900;letter-spacing:-.02em}.brand .dot{color:var(--cobalt)}
.brand small{display:block;font-size:12.5px;font-weight:700;color:var(--muted);margin-top:2px}
.date{font-size:12.5px;color:var(--soft);font-weight:700}
.lead{font-size:13.5px;color:var(--muted);margin:8px 0 18px}
.grp{margin-bottom:20px}
.grp h2{position:sticky;top:0;background:var(--bg);z-index:2;font-size:14.5px;font-weight:800;letter-spacing:-.01em;color:var(--txt);margin:0 0 8px;padding:8px 2px 6px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px}
.gc{font-size:11px;font-weight:800;color:var(--soft);font-variant-numeric:tabular-nums}
.idea{display:flex;gap:12px;align-items:center;justify-content:space-between;background:var(--card);border:1px solid var(--line);border-left:4px solid var(--line);border-radius:12px;padding:9px 12px;margin-bottom:7px}
.idea[data-state="approve"]{border-left-color:var(--green)}
.idea[data-state="hold"]{border-left-color:var(--amber)}
.idea[data-state="reject"]{border-left-color:var(--red);opacity:.6}
.imain{min-width:0}.ttl{font-size:14.5px;font-weight:800;letter-spacing:-.01em}
.why{font-size:12.5px;color:var(--muted);margin-top:2px}
.iside{display:flex;align-items:center;gap:10px;flex:none}
.idea.is-done{border-left-color:var(--cobalt);background:color-mix(in srgb,var(--cobalt) 5%,var(--card))}\n.src.ok{background:color-mix(in srgb,var(--cobalt) 16%,transparent);color:var(--cobalt)}\n.src{font-size:11px;color:var(--soft);font-weight:700;background:var(--chip);padding:3px 8px;border-radius:999px;white-space:nowrap}
.btns{display:flex;gap:4px}
.b{width:34px;height:34px;border-radius:9px;border:1.5px solid var(--line);background:transparent;color:var(--muted);font-size:14px;font-weight:900;cursor:pointer;transition:.1s}
.b:hover{border-color:var(--soft);color:var(--txt)}
.b:focus-visible{outline:3px solid color-mix(in srgb,var(--cobalt) 45%,transparent);outline-offset:1px}
.idea[data-state="approve"] .b.ap{background:var(--green);border-color:var(--green);color:#fff}
.idea[data-state="hold"] .b.hd{background:var(--amber);border-color:var(--amber);color:#fff}
.idea[data-state="reject"] .b.rj{background:var(--red);border-color:var(--red);color:#fff}
.dock{position:fixed;left:0;right:0;bottom:0;background:color-mix(in srgb,var(--card) 93%,transparent);backdrop-filter:blur(10px);border-top:1px solid var(--line)}
.din{max-width:820px;margin:0 auto;padding:11px 18px 15px}
.dsum{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}
.tally{font-size:13px;font-weight:800;color:var(--muted);display:flex;gap:11px;flex-wrap:wrap}
.tally b{font-variant-numeric:tabular-nums}.tally .g{color:var(--green)}.tally .a{color:var(--amber)}.tally .r{color:var(--red)}
.spacer{flex:1}
.copy{font:inherit;font-size:13.5px;font-weight:800;padding:9px 18px;border-radius:10px;border:none;background:var(--cobalt);color:#fff;cursor:pointer}
.copy:hover{filter:brightness(1.07)}.copy:focus-visible{outline:3px solid color-mix(in srgb,var(--cobalt) 45%,transparent);outline-offset:2px}
.ghost{background:transparent;border:1.5px solid var(--line);color:var(--muted);font:inherit;font-size:12.5px;font-weight:700;padding:9px 13px;border-radius:10px;cursor:pointer}
.out{width:100%;height:64px;resize:vertical;font:inherit;font-size:12px;line-height:1.4;padding:9px 11px;border-radius:9px;border:1px solid var(--line);background:var(--bg);color:var(--txt);white-space:pre}
.hint{font-size:11px;color:var(--soft);margin-top:5px}
.toast{position:fixed;left:50%;bottom:140px;transform:translateX(-50%) translateY(10px);background:var(--ink);color:#fff;padding:9px 17px;border-radius:10px;font-size:13px;font-weight:700;opacity:0;pointer-events:none;transition:.2s;z-index:9}
.toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>`;
const total=I.length;
const body=`<div class="wrap">
 <header class="top"><div class="brand">wirit<span class="dot">.</span> 소재 승인 보드<small>백로그 아이디어 · 승인 / 보류 / 거부</small></div><div class="date">2026-07-25 · 총 ${total}건</div></header>
 <p class="lead">지금까지 모아둔 <b>콘텐츠 소재</b> 전부입니다. 맨 위 <b>제작 완료</b> 묶음은 이미 만들어진 카드(결정 불필요)이고, 그 아래가 백로그입니다.
 <b>2026-07-23 트리아지 결정이 미리 반영</b>돼 있으니 <b>바꾸고 싶은 것만</b> ✓승인 · ⏸보류 · ✕거부로 다시 누르세요.
 하단 요약을 <b>복사</b>해 Claude에게 붙여넣으면 그대로 반영합니다.</p>
 ${groups}
</div>
<div class="dock"><div class="din">
 <div class="dsum"><div class="tally">결정 <b id="dn">0</b>/${total}<span class="g">✓ <b id="cg">0</b></span><span class="a">⏸ <b id="ca">0</b></span><span class="r">✕ <b id="cr">0</b></span></div>
  <div class="spacer"></div><button class="ghost" id="reset">초기화</button><button class="copy" id="copy">결정 요약 복사</button></div>
 <textarea class="out" id="out" readonly onclick="this.select()" placeholder="아직 결정이 없습니다 — 위에서 ✓/⏸/✕ 를 눌러보세요."></textarea>
 <div class="hint">복사가 막히면 이 창을 눌러 전체 선택 후 길게 눌러 복사하세요. 결정은 브라우저에 저장돼 다시 열어도 유지됩니다.</div>
</div></div><div class="toast" id="toast"></div>`;
const META=Object.fromEntries(I.map(x=>[x[0],{t:x[2],c:x[1]}]));
const CATLABEL=Object.fromEntries(CATS.map(c=>[c.key,c.label.replace(/^\S+\s/,"").replace(/\s*\(.*\)$/,"")]));
const script=`<script>
const KEY="wirit-ideas-2026-07-25";
const LAB={approve:"✅ 승인",hold:"⏸ 보류",reject:"❌ 거부"};
const META=${JSON.stringify(META)},CATL=${JSON.stringify(CATLABEL)};
let S=JSON.parse(localStorage.getItem(KEY)||"null");
if(!S){S={};document.querySelectorAll(".idea").forEach(c=>{if(c.dataset.seed)S[c.dataset.id]=c.dataset.seed;});localStorage.setItem(KEY,JSON.stringify(S));}
function apply(){document.querySelectorAll(".idea").forEach(c=>{c.dataset.state=(S[c.dataset.id]||"")});
 document.querySelectorAll("[data-gc]").forEach(g=>{const k=g.dataset.gc;const ids=Object.keys(META).filter(i=>META[i].c===k);const dn=ids.filter(i=>S[i]).length;g.textContent=(k==="done"?ids.length+"건":dn+"/"+ids.length);});render();}
function render(){const ids=Object.keys(META);let g=0,a=0,r=0;const by={approve:[],hold:[],reject:[]};
 ids.forEach(i=>{const s=S[i];if(!s)return;if(s==="approve")g++;else if(s==="hold")a++;else r++;by[s].push("- "+META[i].t+" ("+CATL[META[i].c]+")");});
 const done=g+a+r;dn.textContent=done;cg.textContent=g;ca.textContent=a;cr.textContent=r;
 let txt="";if(done){txt="[wirit 소재 승인 · 2026-07-25]\\n";
  if(by.approve.length)txt+="\\n✅ 승인(제작 대기열):\\n"+by.approve.join("\\n")+"\\n";
  if(by.hold.length)txt+="\\n⏸ 보류:\\n"+by.hold.join("\\n")+"\\n";
  if(by.reject.length)txt+="\\n❌ 거부:\\n"+by.reject.join("\\n")+"\\n";
  txt+="\\n승인 건은 제작 착수, 거부 건은 백로그에서 정리해줘.";}
 out.value=txt;}
function set(id,act){S[id]=(S[id]===act?"":act);if(!S[id])delete S[id];localStorage.setItem(KEY,JSON.stringify(S));apply();}
document.querySelectorAll(".idea").forEach(c=>c.querySelectorAll(".b").forEach(b=>b.onclick=()=>set(c.dataset.id,b.dataset.act)));
let tmr;function toast(m){const t=document.getElementById("toast");t.textContent=m;t.classList.add("on");clearTimeout(tmr);tmr=setTimeout(()=>t.classList.remove("on"),1900);}
async function copyText(t){try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(t);return 1;}}catch(e){}try{out.focus();out.select();if(document.execCommand&&document.execCommand("copy"))return 1;}catch(e){}return 0;}
document.getElementById("copy").onclick=async()=>{if(!out.value){toast("아직 결정이 없습니다");return;}if(await copyText(out.value))toast("복사 완료 — Claude에게 붙여넣으세요");else{out.focus();out.select();toast("요약창을 길게 눌러 복사하세요");}};
document.getElementById("reset").onclick=()=>{if(confirm("모든 결정을 지울까요?")){S={};localStorage.removeItem(KEY);apply();toast("초기화됨");}};
apply();
</script>`;
writeFileSync(OUT, style+body+script);
console.log("built " + OUT, Math.round((style+body+script).length/1024)+"KB", "· 항목", total);
