/**
 * 소재 관제탑(아이디어 보드) 생성기 — v3
 *
 * research/IDEAS.md 백로그를 "승인/보류/거부 + 수정/삭제/추가"가 가능한 한 장 보드로 만든다.
 * 오너의 모든 조작은 브라우저 localStorage에 쌓이고, 하단 '결정 요약 복사'로 한 번에 회수한다.
 *  - 결정(승인·보류·거부) / 수정(제목·이유·출처) / 삭제 / 신규 추가 / 소재 발굴 요청
 * 발행 페이지는 네트워크를 못 쓰므로(아티팩트 CSP) '발굴'은 페이지가 직접 하지 않고
 * **요청 문장을 요약에 실어 보내는** 방식이다. 실제 발굴은 Claude 세션에서 수행한다.
 *
 * 항목 스키마: [id, cat, 제목, 한줄이유, 출처/상태칩, 기결정상태, 배지종류]
 * 실행: node scripts/build-idea-board.mjs [출력경로]
 */
import { writeFileSync } from "node:fs";

const OUT = process.argv[2] || "idea-board.html";
const DATE = "2026-07-25";

const CATS = [
  { key: "done", label: "✅ 제작 완료 · 발행 대기" },
  { key: "now", label: "🔥 시의성 대응 (지금 아니면 김빠짐)" },
  { key: "rhythm", label: "📅 발행 리듬 (데일리·주간·월간·분기 고정물)" },
  { key: "viral", label: "🧨 부동산 바이럴 시리즈" },
  { key: "auto", label: "🤖 실거래 자동화 심화 (엔진 재활용)" },
  { key: "novel", label: "💡 참신 통계 (범용 트래픽축)" },
  { key: "metro", label: "🚇 지하철 시리즈" },
];

// 2026-07-23 트리아지에서 ❌거부된 13건은 목록에서 제외(오너 지시 07-25).
const I = [
  // ── 제작 완료 ──
  ["tohuh", "done", "🗺 [월간] 토허제 신고가 지도", "수도권 토허제 40곳 신고가 경신 건수(지도+순위). 매월 재생산", "발행 대기 · 재사용 오더", "", "done"],
  ["seoulmap", "done", "🗺 서울 신고가 지도 '강남이 아니었다'", "서울 25구 신고가 경신 건수 코로플레스", "제작 완료(픽셀 고정)", "", "done"],
  ["index2026", "done", "📉 국장 성적표 (코스피·코스닥 고점대비)", "커버+차트 2장. 캡션 확정", "발행 대기", "", "done"],
  ["metrospeed", "done", "🚇 지하철 운행속도 (1등·꼴등 둘 다 1호선)", "커버+2단표 2장. 1차 출처 검증 완료", "발행 대기 2호", "", "done"],
  ["gtxa", "done", "🚄 지하철이 온다 EP.1 · GTX-A", "커버+현황일정+집값+인사이트 4장", "제작·검증 완료", "", "done"],
  ["daejang8459", "done", "🏢 서울 34평·25평 대장 APT", "지도+순위. 신폰트·테두리 반영 완료", "제작 완료", "", "done"],
  ["dogam01", "done", "🏆 대장 도감 No.01 강남구", "구별 대장 아파트 콜렉션 파일럿 3장", "제작 완료", "", "done"],
  ["salary", "done", "💰 2026 대기업 평균연봉 TOP10", "DART 공시 정밀값 + 실로고 10/10", "승인 대기", "", "done"],
  // ── 시의성 ──
  ["choron", "now", "부동산 대토론회 · 3대 쟁점", "7/23 대국민 토론회 공급·금융·세제를 숫자로", "국토부·금융위·국세청", "hold", ""],
  ["minwage", "now", "2027 최저임금 10,700원", "7/14 확정. 역대 타임라인 + '최저임금으로 국평 몇 년'", "최저임금위 공식", "approve", ""],
  ["rate", "now", "기준금리 3년6개월 만에 인상", "7/16 2.50→2.75%. 추이 + '0.25%p면 이자 얼마'", "한국은행 공표", "approve", ""],
  ["polhist", "now", "규제의 역사 타임라인", "대책 발표일 vs 집값 흐름. 발표 당일 대응용", "국토부·보도", "approve", ""],
  // ── 발행 리듬 ──
  ["krclose", "rhythm", "[데일리] 오늘의 국내 증시 마감", "코스피·코스닥 마감+고점대비(국장 엔진 재활용)", "야후/KRX", "approve", ""],
  ["usopen", "rhythm", "[데일리] 간밤의 미국 증시", "M5 완성, IG 토큰 대기. 아침 습관 슬롯", "Stooq", "approve", ""],
  ["metroseries", "rhythm", "[주간·금] 지하철이 온다", "개통 로드맵×부동산. 파일럿 GTX-A 완료", "공식 로드맵·실거래", "approve", ""],
  ["club10", "rhythm", "[월간] 국평 10억 클럽", "이달의 입성/이탈 동네", "국토부 실거래", "approve", ""],
  ["chungyak", "rhythm", "[월간] 월간 청약 성적표", "경쟁률 TOP·미달 단지 정직 공개", "청약홈 API", "approve", ""],
  ["payslip", "rhythm", "[월간] 월급 실수령액 표", "최저임금·세법 갱신 시 재발행(저장 킬러)", "최저임금·세법", "approve", ""],
  ["daejangq", "rhythm", "[분기] 대장 84·59 지도+순위 갱신", "같은 템플릿·새 데이터 + 순위 변동", "국토부 실거래", "approve", ""],
  // ── 바이럴 ──
  ["years", "viral", "💸 월급으로 사는 데 몇 년? 🥇", "아파트값÷평균연봉(DART×실거래, 남들 못 하는 조합)", "DART+국토부", "approve", ""],
  ["lotto", "viral", "🎰 청약 로또 판독기", "분양가 vs 주변 실거래 안전마진(차익보장 아님)", "청약홈+실거래", "approve", ""],
  ["shoulda", "viral", "⏰ 그때 살걸 계산기", "10년 전 vs 지금. 고점 매수도 정직하게", "국토부 실거래", "approve", ""],
  ["commuteprice", "viral", "🚇 출근 30분의 가격", "통근시간×집값, '강남까지 1분당 N천만원'", "실거래+좌표", "approve", ""],
  ["unsold", "viral", "📉 미분양의 역설", "그때 미분양, 지금은? 성공·실패 양면", "국토부 미분양", "approve", ""],
  ["samedon", "viral", "🆚 같은 돈으로", "10억: 강남 15평 vs 마포 25평 vs 일산 40평", "국토부 실거래", "approve", ""],
  ["brand", "viral", "🏢 브랜드 계급도 ⚠️민감", "브랜드별 평균 평당가('서열 아님' 프레임 필수)", "국토부 실거래", "approve", ""],
  // ── 자동화 심화 ──
  ["dong", "auto", "동별 대장 ×25", "구 심화(반포/서초/방배…) 엔진 파라미터만 교체", "국토부 실거래", "approve", ""],
  ["station", "auto", "노선별 역세권 대장", "역 좌표+반경 500m, 노선당 1편", "실거래+좌표", "approve", ""],
  ["gyeonggi", "auto", "경기·신도시 대장", "분당·일산·동탄·위례·광교…", "국토부 실거래", "approve", ""],
  ["budget", "auto", "예산 지도 '15억이면 어디?'", "구별 국평 중위가로 가능/불가 지도(5·10·15·20억)", "국토부 실거래", "approve", ""],
  ["heatmap", "auto", "구별 평당가 히트맵", "지도 엔진 재사용", "국토부 실거래", "approve", ""],
  ["floor", "auto", "층수 프리미엄", "같은 단지 로얄층 vs 저층 '1층의 할인율'", "실거래 층 필드", "approve", ""],
  // ── 참신 통계 ──
  ["chicken", "novel", "🍗 치킨으로 환산한 물가", "'월급=치킨 N마리' 연도별", "통계청 외식물가", "approve", ""],
  ["day", "novel", "⏰ 한국인의 평균 하루", "수면·노동·여가 분 단위", "통계청 생활시간", "approve", ""],
  ["babyname", "novel", "👶 신생아 이름 TOP10", "매년 자동 재활용, '내 이름은?'", "행안부 공개", "approve", ""],
  ["cvs", "novel", "🏪 편의점 밀도 지도", "구별 편의점 수(지도 엔진 보유)", "localdata", "approve", ""],
  ["cafe", "novel", "☕ 카페 창업 vs 폐업", "구별 개폐업(자영업 공감)", "localdata", "approve", ""],
  ["nightstn", "novel", "🚇 잠들지 않는 역", "첫차·막차로 본 서울", "공식 시간표", "approve", ""],
  ["tuition", "novel", "🎓 등록금 vs 초봉", "대학 4년 비용과 첫 연봉", "공시×DART", "approve", ""],
  ["pension", "novel", "🧓 국민연금 세대 격차 ⚠️", "낸 돈 vs 받는 돈(정치 프레임 주의)", "공단 통계", "approve", ""],
  ["commutemap", "novel", "🚶 통근시간 지도", "시군구별 평균 통근", "통계청 총조사", "approve", ""],
  ["pop", "novel", "📉 우리 구 인구가 줄고 있다", "주민등록 증감 히트맵", "주민등록 API", "approve", ""],
  // ── 지하철 ──
  ["congest", "metro", "노선별 혼잡도 순위", "출퇴근 공감, 2단 표", "공공데이터", "approve", ""],
  ["transfer", "metro", "환승 많은 역 순위", "한 역에 노선 뱃지 여러 개", "공공데이터", "approve", ""],
  ["aptchange", "metro", "노선별 평균 아파트값 5년 변화", "부동산×지하철 교차 before/after", "실거래+역", "approve", ""],
  ["gtxspeed", "metro", "GTX 개통되면 표정속도 몇 배?", "표정속도 후속·화제성", "공식 속도", "approve", ""],
];

const style = `<style>
:root{--ink:#141821;--cobalt:#2e6bff;--red:#e5484d;--green:#1f9d55;--amber:#c98a12;
 --bg:#f3f4f2;--card:#fff;--line:#e6e8e8;--txt:#141821;--muted:#5b6b7f;--soft:#93a0af;--chip:#eef1f4;}
@media (prefers-color-scheme:dark){:root{--bg:#0d1016;--card:#151a22;--line:#242b37;--txt:#eef2f7;--muted:#9aa7b6;--soft:#6f7d8d;--chip:#1d242f;}}
:root[data-theme="light"]{--bg:#f3f4f2;--card:#fff;--line:#e6e8e8;--txt:#141821;--muted:#5b6b7f;--soft:#93a0af;--chip:#eef1f4;}
:root[data-theme="dark"]{--bg:#0d1016;--card:#151a22;--line:#242b37;--txt:#eef2f7;--muted:#9aa7b6;--soft:#6f7d8d;--chip:#1d242f;}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font-family:"Pretendard","Apple SD Gothic Neo",system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.45;padding-bottom:250px;}
.wrap{max-width:840px;margin:0 auto;padding:26px 18px 0;}
header.top{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.brand{font-size:24px;font-weight:900;letter-spacing:-.02em}.brand .dot{color:var(--cobalt)}
.brand small{display:block;font-size:12.5px;font-weight:700;color:var(--muted);margin-top:2px}
.date{font-size:12.5px;color:var(--soft);font-weight:700;font-variant-numeric:tabular-nums}
.lead{font-size:13.5px;color:var(--muted);margin:8px 0 14px}

/* 상단 도구 막대 */
.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 20px;padding-bottom:16px;border-bottom:1px solid var(--line)}
.tool{font:inherit;font-size:13px;font-weight:800;padding:9px 14px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);color:var(--txt);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.tool:hover{border-color:var(--soft)}
.tool.primary{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.tool.primary:hover{filter:brightness(1.07)}
.tool:focus-visible,.b:focus-visible,.copy:focus-visible,.ghost:focus-visible{outline:3px solid color-mix(in srgb,var(--cobalt) 45%,transparent);outline-offset:2px}
.toolnote{font-size:11.5px;color:var(--soft);font-weight:700;margin-left:auto}

.grp{margin-bottom:20px}
.grp h2{position:sticky;top:0;background:var(--bg);z-index:2;font-size:14.5px;font-weight:800;letter-spacing:-.01em;margin:0 0 8px;padding:8px 2px 6px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px}
.gc{font-size:11px;font-weight:800;color:var(--soft);font-variant-numeric:tabular-nums}
.idea{display:flex;gap:12px;align-items:center;justify-content:space-between;background:var(--card);border:1px solid var(--line);border-left:4px solid var(--line);border-radius:12px;padding:9px 12px;margin-bottom:7px}
.idea[data-state="approve"]{border-left-color:var(--green)}
.idea[data-state="hold"]{border-left-color:var(--amber)}
.idea.is-done{border-left-color:var(--cobalt);background:color-mix(in srgb,var(--cobalt) 5%,var(--card))}
.idea.is-new{border-left-color:var(--cobalt);border-style:dashed}
.idea[hidden]{display:none}
.imain{min-width:0;flex:1}
.ttl{font-size:14.5px;font-weight:800;letter-spacing:-.01em}
.why{font-size:12.5px;color:var(--muted);margin-top:2px}
.flag{font-size:10.5px;font-weight:800;color:var(--cobalt);margin-left:6px;vertical-align:1px}
.iside{display:flex;align-items:center;gap:8px;flex:none}
.src{font-size:11px;color:var(--soft);font-weight:700;background:var(--chip);padding:3px 8px;border-radius:999px;white-space:nowrap}
.src.ok{background:color-mix(in srgb,var(--cobalt) 16%,transparent);color:var(--cobalt)}
.btns{display:flex;gap:4px}
.b{width:32px;height:32px;border-radius:9px;border:1.5px solid var(--line);background:transparent;color:var(--muted);font-size:13px;font-weight:900;cursor:pointer;transition:.1s;display:flex;align-items:center;justify-content:center}
.b:hover{border-color:var(--soft);color:var(--txt)}
.b.sm{width:29px;height:29px;font-size:12px}
.idea[data-state="approve"] .b.ap{background:var(--green);border-color:var(--green);color:#fff}
.idea[data-state="hold"] .b.hd{background:var(--amber);border-color:var(--amber);color:#fff}

/* 인라인 편집 */
.edit{display:none;flex-direction:column;gap:6px;width:100%}
.idea.editing .edit{display:flex}
.idea.editing .imain,.idea.editing .iside{display:none}
.edit input{font:inherit;font-size:13.5px;padding:7px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--bg);color:var(--txt);width:100%}
.edit input.t{font-weight:800}
.edit .erow{display:flex;gap:6px;justify-content:flex-end}
.edit .erow button{font:inherit;font-size:12.5px;font-weight:800;padding:7px 13px;border-radius:8px;border:1.5px solid var(--line);background:transparent;color:var(--muted);cursor:pointer}
.edit .erow button.save{background:var(--cobalt);border-color:var(--cobalt);color:#fff}

/* 새 소재 추가 폼 */
.addbox{display:none;background:var(--card);border:1.5px dashed var(--cobalt);border-radius:12px;padding:14px;margin-bottom:18px}
.addbox.on{display:block}
.addbox h3{margin:0 0 10px;font-size:13.5px;font-weight:800}
.addbox .fields{display:flex;flex-direction:column;gap:7px}
.addbox input,.addbox select{font:inherit;font-size:13.5px;padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--bg);color:var(--txt);width:100%}
.addbox .erow{display:flex;gap:6px;justify-content:flex-end;margin-top:10px}
.addbox .erow button{font:inherit;font-size:12.5px;font-weight:800;padding:8px 15px;border-radius:8px;border:1.5px solid var(--line);background:transparent;color:var(--muted);cursor:pointer}
.addbox .erow button.save{background:var(--cobalt);border-color:var(--cobalt);color:#fff}

/* 되돌리기 트레이 */
.tray{margin:0 0 20px;font-size:12.5px;color:var(--muted)}
.tray summary{cursor:pointer;font-weight:800;color:var(--soft);padding:6px 0}
.tray ul{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-direction:column;gap:5px}
.tray li{display:flex;align-items:center;gap:10px;justify-content:space-between;background:var(--card);border:1px solid var(--line);border-radius:9px;padding:7px 11px}
.tray button{font:inherit;font-size:11.5px;font-weight:800;padding:5px 11px;border-radius:7px;border:1.5px solid var(--line);background:transparent;color:var(--muted);cursor:pointer}
.tray button:hover{border-color:var(--soft);color:var(--txt)}

.dock{position:fixed;left:0;right:0;bottom:0;background:color-mix(in srgb,var(--card) 93%,transparent);backdrop-filter:blur(10px);border-top:1px solid var(--line)}
.din{max-width:840px;margin:0 auto;padding:11px 18px 15px}
.dsum{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}
.tally{font-size:13px;font-weight:800;color:var(--muted);display:flex;gap:11px;flex-wrap:wrap}
.tally b{font-variant-numeric:tabular-nums}.tally .g{color:var(--green)}.tally .a{color:var(--amber)}.tally .r{color:var(--red)}.tally .c{color:var(--cobalt)}
.spacer{flex:1}
.copy{font:inherit;font-size:13.5px;font-weight:800;padding:9px 18px;border-radius:10px;border:none;background:var(--cobalt);color:#fff;cursor:pointer}
.copy:hover{filter:brightness(1.07)}
.ghost{background:transparent;border:1.5px solid var(--line);color:var(--muted);font:inherit;font-size:12.5px;font-weight:700;padding:9px 13px;border-radius:10px;cursor:pointer}
.out{width:100%;height:70px;resize:vertical;font:inherit;font-size:12px;line-height:1.4;padding:9px 11px;border-radius:9px;border:1px solid var(--line);background:var(--bg);color:var(--txt);white-space:pre}
.hint{font-size:11px;color:var(--soft);margin-top:5px}
.toast{position:fixed;left:50%;bottom:150px;transform:translateX(-50%) translateY(10px);background:var(--ink);color:#fff;padding:9px 17px;border-radius:10px;font-size:13px;font-weight:700;opacity:0;pointer-events:none;transition:.2s;z-index:9;max-width:88vw;text-align:center}
.toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
@media (prefers-color-scheme:dark){.toast{background:#2b3442}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
@media (max-width:560px){.iside{flex-wrap:wrap;justify-content:flex-end}.src{display:none}}
</style>`;

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const BTNS =
  `<div class="btns">` +
  `<button class="b ap" data-act="approve" title="승인">✓</button>` +
  `<button class="b hd" data-act="hold" title="보류">⏸</button>` +
  `<button class="b rj" data-act="reject" title="거부 — 목록에서 숨김">✕</button>` +
  `<button class="b sm ed" data-act="edit" title="수정">✎</button>` +
  `<button class="b sm dl" data-act="delete" title="삭제">🗑</button>` +
  `</div>`;

const row = (it) => `<div class="idea${it[6] === "done" ? " is-done" : ""}" data-id="${it[0]}" data-cat="${it[1]}" data-seed="${it[5] || ""}" data-state="">
 <div class="imain"><div class="ttl">${it[2]}</div><div class="why">${it[3]}</div></div>
 <div class="iside"><span class="src${it[6] === "done" ? " ok" : ""}">${it[4]}</span>${BTNS}</div>
 <div class="edit">
  <input class="t" value="${esc(it[2])}" aria-label="제목" />
  <input class="w" value="${esc(it[3])}" aria-label="한 줄 이유" />
  <input class="s" value="${esc(it[4])}" aria-label="출처 또는 상태" />
  <div class="erow"><button data-act="cancel">취소</button><button class="save" data-act="save">저장</button></div>
 </div>
</div>`;

const groups = CATS.map((c) => {
  const items = I.filter((x) => x[1] === c.key);
  return `<section class="grp" data-cat="${c.key}"><h2>${c.label}<span class="gc" data-gc="${c.key}"></span></h2><div class="glist">${items.map(row).join("")}</div></section>`;
}).join("");

const catOptions = CATS.map((c) => `<option value="${c.key}">${c.label}</option>`).join("");

const body = `<div class="wrap">
 <header class="top">
  <div class="brand">wirit<span class="dot">.</span> 소재 관제탑<small>아이디어 승인 · 수정 · 추가</small></div>
  <div class="date">${DATE} · 총 <span id="tot">${I.length}</span>건</div>
 </header>
 <p class="lead">지금까지 모아둔 <b>콘텐츠 소재</b>입니다. 이전에 거부한 13건은 목록에서 뺐습니다.
  각 항목은 <b>✓승인 · ⏸보류 · ✕거부 · ✎수정 · 🗑삭제</b> 할 수 있고, <b>제작 완료</b> 묶음도 똑같이 다룰 수 있습니다.
  다 고른 뒤 아래 <b>결정 요약 복사</b>를 눌러 Claude에게 붙여넣으면 그대로 반영합니다.</p>

 <div class="tools">
  <button class="tool primary" id="btnAdd">➕ 새 소재 추가</button>
  <button class="tool" id="btnDig">🔎 신규 소재 발굴 요청</button>
  <button class="tool" id="btnReload">🔄 새로고침</button>
  <span class="toolnote">조작 내용은 이 브라우저에 저장됩니다</span>
 </div>

 <div class="addbox" id="addbox">
  <h3>새 소재 추가</h3>
  <div class="fields">
   <input id="naTitle" placeholder="제목 — 예: 🏫 학군지 프리미엄 지도" />
   <input id="naWhy" placeholder="한 줄 이유 — 왜 터질 것 같은지" />
   <input id="naSrc" placeholder="데이터 출처 — 예: 국토부 실거래 + 학교알리미" />
   <select id="naCat" aria-label="분류">${catOptions}</select>
  </div>
  <div class="erow"><button id="naCancel">취소</button><button class="save" id="naSave">추가</button></div>
 </div>

 <details class="tray" id="tray" hidden>
  <summary>숨긴 항목 <span id="trayN">0</span>건 — 되돌리기</summary>
  <ul id="trayList"></ul>
 </details>

 ${groups}
</div>
<div class="dock"><div class="din">
 <div class="dsum"><div class="tally">결정 <b id="dn">0</b>/<b id="dt">0</b><span class="g">✓ <b id="cg">0</b></span><span class="a">⏸ <b id="ca">0</b></span><span class="r">✕ <b id="cr">0</b></span><span class="c">✎ <b id="ce">0</b></span></div>
  <div class="spacer"></div><button class="ghost" id="reset">전체 초기화</button><button class="copy" id="copy">결정 요약 복사</button></div>
 <textarea class="out" id="out" readonly onclick="this.select()" placeholder="아직 바꾼 게 없습니다 — 위에서 ✓/⏸/✕/✎/🗑 를 눌러보세요."></textarea>
 <div class="hint">복사가 막히면 이 창을 눌러 전체 선택 후 길게 눌러 복사하세요.</div>
</div></div><div class="toast" id="toast"></div>`;

const META = Object.fromEntries(I.map((x) => [x[0], { t: x[2], c: x[1] }]));
const CATLABEL = Object.fromEntries(CATS.map((c) => [c.key, c.label.replace(/^\S+\s/, "").replace(/\s*\(.*\)$/, "")]));

const script = `<script>
const KEY = "wirit-ideas-v3";
const META = ${JSON.stringify(META)}, CATL = ${JSON.stringify(CATLABEL)}, DATE = ${JSON.stringify(DATE)};
const ORIG = ${JSON.stringify(Object.fromEntries(I.map((x) => [x[0], x[2]])))};
const blank = () => ({ d:{}, del:[], edit:{}, add:[], ask:"" });
let S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "null") || {});
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const $ = (id) => document.getElementById(id);
let tmr; function toast(m){ const t = $("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tmr); tmr = setTimeout(() => t.classList.remove("on"), 2400); }

/* 처음 열거나 새 항목이 배포되면 기결정 상태를 시드로 채운다(기존 결정은 건드리지 않음) */
function seed(){
  let n = 0;
  document.querySelectorAll(".idea").forEach(c => {
    const id = c.dataset.id;
    if (c.dataset.seed && !(id in S.d) && !S.del.includes(id)) { S.d[id] = c.dataset.seed; n++; }
  });
  if (n) save();
}

function addCard(a){
  const g = document.querySelector('.grp[data-cat="' + a.cat + '"] .glist') || document.querySelector(".glist");
  const el = document.createElement("div");
  el.className = "idea is-new"; el.dataset.id = a.id; el.dataset.cat = a.cat; el.dataset.seed = ""; el.dataset.state = "";
  el.innerHTML = '<div class="imain"><div class="ttl"></div><div class="why"></div></div>' +
    '<div class="iside"><span class="src"></span>' + ${JSON.stringify(BTNS)} + '</div>' +
    '<div class="edit"><input class="t" aria-label="제목"/><input class="w" aria-label="한 줄 이유"/><input class="s" aria-label="출처"/>' +
    '<div class="erow"><button data-act="cancel">취소</button><button class="save" data-act="save">저장</button></div></div>';
  el.querySelector(".why").textContent = a.w;
  el.querySelector(".src").textContent = a.s || "출처 미정";
  el.querySelector(".edit .t").value = a.t; el.querySelector(".edit .w").value = a.w; el.querySelector(".edit .s").value = a.s;
  g.appendChild(el);
  META[a.id] = { t: a.t, c: a.cat };
  paintTitle(el, a.t, "NEW");
  wire(el);
}

function paintTitle(c, text, flag){
  const h = c.querySelector(".ttl");
  h.textContent = text;
  if (flag) { const s = document.createElement("span"); s.className = "flag"; s.textContent = flag; h.appendChild(s); }
}

function apply(){
  document.querySelectorAll(".idea").forEach(c => {
    const id = c.dataset.id;
    const e = S.edit[id];
    if (e) {
      paintTitle(c, e.t, c.classList.contains("is-new") ? "NEW" : "수정");
      c.querySelector(".why").textContent = e.w;
      c.querySelector(".src").textContent = e.s || "출처 미정";
      if (META[id]) META[id].t = e.t;
    }
    const st = S.d[id] || "";
    c.dataset.state = st;
    c.hidden = st === "reject" || S.del.includes(id);
  });
  document.querySelectorAll("[data-gc]").forEach(g => {
    const k = g.dataset.gc;
    const vis = [...document.querySelectorAll('.grp[data-cat="' + k + '"] .idea')].filter(c => !c.hidden);
    g.textContent = vis.length + "건";
  });
  const hid = [...document.querySelectorAll(".idea")].filter(c => c.hidden);
  $("tray").hidden = hid.length === 0;
  $("trayN").textContent = hid.length;
  $("trayList").textContent = "";
  hid.forEach(c => {
    const id = c.dataset.id;
    const li = document.createElement("li");
    const sp = document.createElement("span");
    sp.textContent = (S.del.includes(id) ? "🗑 삭제 · " : "✕ 거부 · ") + (META[id] ? META[id].t : id);
    const bt = document.createElement("button"); bt.type = "button"; bt.textContent = "되돌리기";
    bt.onclick = () => { delete S.d[id]; S.del = S.del.filter(x => x !== id); save(); apply(); toast("되돌렸습니다"); };
    li.append(sp, bt); $("trayList").appendChild(li);
  });
  $("tot").textContent = [...document.querySelectorAll(".idea")].filter(c => !c.hidden).length;
  render();
}

function render(){
  const ids = Object.keys(META);
  let g = 0, a = 0, r = 0;
  const by = { approve: [], hold: [], reject: [] };
  ids.forEach(i => {
    if (S.del.includes(i)) return;
    const s = S.d[i]; if (!s) return;
    if (s === "approve") g++; else if (s === "hold") a++; else r++;
    by[s].push("- " + META[i].t + " (" + (CATL[META[i].c] || META[i].c) + ")");
  });
  const ed = Object.keys(S.edit).filter(i => !S.del.includes(i));
  const live = ids.filter(i => !S.del.includes(i)).length;
  $("dn").textContent = g + a + r; $("dt").textContent = live;
  $("cg").textContent = g; $("ca").textContent = a; $("cr").textContent = r; $("ce").textContent = ed.length;

  let t = "[wirit 소재 관제탑 · " + DATE + "]\\n";
  let any = false;
  if (S.add.length) { any = true; t += "\\n➕ 새 소재 추가:\\n" + S.add.map(x => "- " + x.t + " | " + (x.w || "이유 미기재") + " | 출처: " + (x.s || "미정") + " | 분류: " + (CATL[x.cat] || x.cat)).join("\\n") + "\\n"; }
  if (ed.length) { any = true; t += "\\n✏️ 수정:\\n" + ed.map(i => "- " + (ORIG[i] || i) + " → " + S.edit[i].t + " | " + S.edit[i].w + " | " + S.edit[i].s).join("\\n") + "\\n"; }
  if (by.approve.length) { any = true; t += "\\n✅ 승인(제작 대기열):\\n" + by.approve.join("\\n") + "\\n"; }
  if (by.hold.length) { any = true; t += "\\n⏸ 보류:\\n" + by.hold.join("\\n") + "\\n"; }
  if (by.reject.length) { any = true; t += "\\n❌ 거부:\\n" + by.reject.join("\\n") + "\\n"; }
  if (S.del.length) { any = true; t += "\\n🗑 삭제(목록에서 완전히 빼기):\\n" + S.del.map(i => "- " + (META[i] ? META[i].t : i)).join("\\n") + "\\n"; }
  if (S.ask) { any = true; t += "\\n🔎 신규 소재 발굴 요청:\\n" + S.ask + "\\n"; }
  $("out").value = any ? t + "\\n위 내용대로 IDEAS.md와 제작 대기열을 갱신해줘." : "";
}

function setState(id, act){
  S.d[id] = (S.d[id] === act ? "" : act);
  if (!S.d[id]) delete S.d[id];
  save(); apply();
  if (S.d[id] === "reject") { $("tray").open = true; toast("목록에서 숨겼습니다 — 위 '숨긴 항목'에서 되돌릴 수 있어요"); }
}

function wire(c){
  c.querySelectorAll(".b").forEach(b => b.onclick = () => {
    const act = b.dataset.act, id = c.dataset.id;
    if (act === "edit") { c.classList.add("editing"); c.querySelector(".edit .t").focus(); return; }
    if (act === "delete") { if (!S.del.includes(id)) S.del.push(id); save(); apply(); $("tray").open = true; toast("삭제했습니다 — 되돌릴 수 있어요"); return; }
    setState(id, act);
  });
  c.querySelectorAll(".edit button").forEach(b => b.onclick = () => {
    if (b.dataset.act === "cancel") { c.classList.remove("editing"); return; }
    const id = c.dataset.id;
    const v = { t: c.querySelector(".edit .t").value.trim(), w: c.querySelector(".edit .w").value.trim(), s: c.querySelector(".edit .s").value.trim() };
    if (!v.t) { toast("제목은 비울 수 없습니다"); return; }
    const a = S.add.find(x => x.id === id);
    if (a) { a.t = v.t; a.w = v.w; a.s = v.s; } else { S.edit[id] = v; }
    if (a) { META[id].t = v.t; paintTitle(c, v.t, "NEW"); c.querySelector(".why").textContent = v.w; c.querySelector(".src").textContent = v.s || "출처 미정"; }
    save(); c.classList.remove("editing"); apply(); toast("수정했습니다");
  });
}

/* 도구 막대 */
$("btnAdd").onclick = () => { $("addbox").classList.toggle("on"); if ($("addbox").classList.contains("on")) $("naTitle").focus(); };
$("naCancel").onclick = () => $("addbox").classList.remove("on");
$("naSave").onclick = () => {
  const t = $("naTitle").value.trim();
  if (!t) { toast("제목을 입력해주세요"); return; }
  const a = { id: "new-" + (S.add.length + 1) + "-" + Object.keys(META).length, cat: $("naCat").value, t: t, w: $("naWhy").value.trim(), s: $("naSrc").value.trim() };
  S.add.push(a); save(); addCard(a); apply();
  $("naTitle").value = ""; $("naWhy").value = ""; $("naSrc").value = "";
  $("addbox").classList.remove("on");
  toast("추가했습니다 — 요약을 복사해 보내면 IDEAS.md에 등록됩니다");
};
$("btnDig").onclick = () => {
  const v = prompt("어떤 방향으로 새 소재를 찾을까요?\\n(예: 8월 시의성 부동산 / 20~30대 공감 통계 / 지도 엔진 재사용)", S.ask || "");
  if (v === null) return;
  S.ask = v.trim(); save(); render();
  toast(S.ask ? "요청을 담았습니다 — 요약을 복사해 보내주세요" : "발굴 요청을 지웠습니다");
};
$("btnReload").onclick = () => location.reload();
$("copy").onclick = async () => {
  if (!$("out").value) { toast("아직 바꾼 게 없습니다"); return; }
  let ok = 0;
  try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText($("out").value); ok = 1; } } catch(e) {}
  if (!ok) { try { $("out").focus(); $("out").select(); if (document.execCommand && document.execCommand("copy")) ok = 1; } catch(e) {} }
  if (ok) toast("복사 완료 — Claude에게 붙여넣으세요");
  else { $("out").focus(); $("out").select(); toast("요약창을 길게 눌러 복사하세요"); }
};
$("reset").onclick = () => {
  if (confirm("모든 조작(결정·수정·추가·삭제)을 지우고 처음 상태로 되돌릴까요?")) {
    localStorage.removeItem(KEY); location.reload();
  }
};

document.querySelectorAll(".idea").forEach(wire);
S.add.forEach(addCard);
seed();
apply();
</script>`;

writeFileSync(OUT, `<title>wirit 소재 관제탑 — 아이디어 보드</title>\n` + style + body + script);
console.log("built " + OUT, Math.round((style + body + script).length / 1024) + "KB", "· 항목", I.length);
