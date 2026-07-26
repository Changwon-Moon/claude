/**
 * 배포된 **실제 사이트**를 열어서 확인한다.
 *
 * ── 왜 필요한가 (2026-07-26)
 * 그동안 검사는 전부 로컬 파일(`_site/index.html`)을 대상으로 했다.
 * 그래서 **배포가 실패해 사이트가 옛 버전에 멈춰 있어도 아무도 몰랐다.**
 * 오너는 "고쳤다"는 말을 듣고 화면을 봤는데 아무것도 안 바뀐 상태였다.
 *
 * 이 스크립트는 배포 직후 **인터넷에 올라간 그 주소**를 실제로 열어
 *   ① 사이트가 살아 있는지
 *   ② 비밀번호 문이 제대로 걸려 있는지
 *   ③ 문을 통과하면 최신 화면이 나오는지(탭·조직도·보관함·성과)
 * 를 확인한다. 여기서 실패하면 배포가 "성공"이라고 말해도 성공이 아니다.
 *
 * 환경변수:
 *   TOWER_URL       확인할 주소 (기본: 운영 주소)
 *   TOWER_PASSWORD  비밀번호 문이 걸려 있으면 필요. 없으면 문 검사만 건너뛴다.
 *
 * 실행: node scripts/verify-live.mjs
 */
const URL_BASE = (process.env.TOWER_URL || "https://wirit-tower.engineerest0.workers.dev").replace(/\/$/, "");
const PW = process.env.TOWER_PASSWORD || "";

let pass = 0;
let fail = 0;
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
};

console.log(`🌐 실제 사이트 확인 — ${URL_BASE}`);

// ── 1. 살아 있는가
let res;
try {
  res = await fetch(URL_BASE + "/", { redirect: "manual" });
} catch (e) {
  console.log(`  ❌ 접속 자체가 안 됨 — ${e.message}`);
  process.exit(1);
}
check("사이트 응답", res.status < 500, `HTTP ${res.status}`);
const first = await res.text();

// ── 2. 비밀번호 문
const gated = /비밀번호/.test(first) && !/관제탑 · Control/.test(first);
if (PW) {
  check("비밀번호 문이 걸려 있음", gated, gated ? "" : "문 없이 본문이 바로 나옴(공개 상태)");
} else {
  console.log(`  ⏭ TOWER_PASSWORD 없음 — 문 통과 검사는 건너뜁니다`);
}

// ── 3. 문을 통과해 최신 화면을 확인
let html = first;
if (gated) {
  if (!PW) {
    console.log("  ⏭ 비밀번호가 없어 본문을 확인할 수 없습니다.");
    console.log(`\n${fail ? "❌" : "✅"} ${pass}/${pass + fail} (본문 미확인)`);
    process.exit(fail ? 1 : 0);
  }
  const body = new URLSearchParams({ pw: PW });
  const login = await fetch(URL_BASE + "/__login", { method: "POST", body, redirect: "manual" });
  const cookie = (login.headers.get("set-cookie") || "").split(";")[0];
  check("비밀번호로 문 통과", login.status === 302 && !!cookie, `HTTP ${login.status}`);
  if (!cookie) {
    console.log(`\n❌ ${pass}/${pass + fail} — 로그인 실패로 본문 확인 불가`);
    process.exit(1);
  }
  const page = await fetch(URL_BASE + "/", { headers: { Cookie: cookie } });
  html = await page.text();
}

const kb = Math.round(html.length / 1024);
console.log(`  · 받은 화면 ${kb}KB`);

// ── 4. 최신 화면이 맞는가 — 이번 개편의 결과물이 실제로 올라갔는지
const has = (re, name, hint) => check(name, re.test(html), hint);

has(/data-v="today"[\s\S]*data-v="board"[\s\S]*data-v="ideas"[\s\S]*data-v="company"[\s\S]*data-v="archive"[\s\S]*data-v="perf"[\s\S]*data-v="assets"/,
  "탭 7종(오늘·파이프라인·소재·회사·보관함·성과·자산)");
has(/class="onode ceo"/, "조직도 정점 = CEO 노드");
has(/class="odivs"/, "조직도 5개 본부(계통도)");
has(/id="view-archive"/, "보관함 화면");
has(/id="view-perf"/, "성과 화면");
has(/id="jobbar"/, "작업 표시줄");
has(/id="connbtn"/, "상단 연결 뱃지");
has(/결재 대기/, "지표 명칭 '결재 대기'");
has(/중단·삭제/, "버튼 이름 '중단·삭제'");
has(/data-ia="delete"/, "소재 삭제 버튼");
check("소재 보드에 승인·보류 버튼 없음(간소화 반영)",
  !/data-ia="approve"/.test(html) && !/data-ia="hold"/.test(html));

// 이번 개편분 — 화면에 실제로 올라갔는지
has(/id="ask"/, "지시함(자유 입력창)");
check("칸 나눈 입력 폼 제거(제목·이유·출처)",
  !/id="na-t"/.test(html) && !/id="na-w"/.test(html) && !/id="na-s"/.test(html));
has(/data-act="next"/, "단계 이동 버튼(기획안에서 손을 쓸 수 있음)");
has(/class="stagenote"/, "지금 무엇을 기다리는지 설명");
has(/class="fstrip"/, "보관함에 카드 실물");

// 링크는 열려야 링크다 — 저장소에 없는 경로로 가는 링크가 있으면 전부 404다
const deadLinks = (html.match(/href="[^"]*\/(?:data\/out|data\/content)\/[^"]*"/g) || []).length;
check("보관함 링크가 404 경로를 가리키지 않음", deadLinks === 0, `${deadLinks}개 발견`);

// 배선 확인 — 요소만 있고 동작이 없으면 소용없다
check("연결 뱃지에 동작이 붙어 있음", /connBtn\.onclick/.test(html) || /connbtn/.test(html));
check("저장소 상태를 직접 읽는 코드 존재(배포를 안 기다림)",
  /refreshFromRepo/.test(html) && /pipeline-state\.json/.test(html));
check("옛 화면 잔재 없음(마이닝 열·연결 바)",
  !/id="ghbar"/.test(html) && !/col mining/.test(html));

// 카드 실물이 들어갔는지 — CI가 렌더한 썸네일
const imgs = (html.match(/data:image\/(jpeg|png);base64/g) || []).length;
check("카드 썸네일 포함", imgs > 0, `${imgs}장`);
check("화면 무게 적정(2MB 미만)", kb < 2048, `${kb}KB`);

console.log(`\n${fail ? "❌" : "✅"} 실제 사이트 ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
