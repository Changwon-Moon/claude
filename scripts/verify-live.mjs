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
 *
 * ⚠️ 이 결과는 워크플로가 `docs/_health/verify-live-last.md` 에 적는다(2026-08-12).
 * 작업 세션은 Actions 로그·아티팩트를 못 읽는다(egress 차단) — 저장소가 유일한 통로다.
 * "관제탑 배포가 빨간불"이면 **그 파일부터 열어 본다.** 추측하지 않는다.
 *
 * ⚠️ 커밋 메시지에 "skip ci" 를 뜻하는 문구를 **설명으로라도 쓰지 않는다**(2026-08-12 자책).
 * GitHub 은 커밋 메시지 어디에 있든 그 문구를 명령으로 읽는다 — 워크플로를 왜 그렇게
 * 만들었는지 설명하려고 적었더니 그 푸시의 모든 검사가 통째로 안 돌았다.
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
  /* ── 새 판이 실제로 퍼질 때까지 기다린다 ──
   * ⚠️ version.txt 를 따로 보면 안 된다 — 엣지에서 version.txt 는 새 판인데
   * index.html 은 옛 판을 주는 시차가 실제로 있었다(2026-07-27 run 실패).
   * 검사할 대상은 페이지 자체이므로, **페이지 안의 판번호**(<!--build:sha-->)가
   * 기대한 커밋이 될 때까지 최대 2분 페이지를 다시 받는다. */
  const wantSha = (process.env.GITHUB_SHA || "").trim();
  for (let i = 0; i < 12; i++) {
    const page = await fetch(URL_BASE + "/?v=" + Date.now(), { headers: { Cookie: cookie, "Cache-Control": "no-cache" } });
    html = await page.text();
    if (!wantSha || html.includes("<!--build:" + wantSha + "-->")) break;
    await new Promise((r) => setTimeout(r, 10000));
  }
  if (wantSha) {
    const seen = (html.match(/<!--build:([0-9a-f]+|dev)-->/) || [])[1] || "";
    check("새 판이 전파됨(페이지 판번호 일치)", seen === wantSha,
      `기대 ${wantSha.slice(0, 7)} · 실제 ${String(seen).slice(0, 7) || "없음"}`);
  }
}

const kb = Math.round(html.length / 1024);
console.log(`  · 받은 화면 ${kb}KB`);

// ── 4. 최신 화면이 맞는가 — 이번 개편의 결과물이 실제로 올라갔는지
const has = (re, name, hint) => check(name, re.test(html), hint);

/* 2026-07-30 표준 축소(오너 승인) — 탭 5종. 지운 화면이 배포본에 되살아나면 축소가 무효다. */
has(/data-v="publish"[\s\S]*data-v="ideas"[\s\S]*data-v="archive"[\s\S]*data-v="company"[\s\S]*data-v="assets"/,
  "탭 5종(발행·소재·보관함·회사·자산)");
check("지운 화면 없음(결정함·칸반·지시함·성과·요청 대장)",
  !/id="view-today"/.test(html) && !/id="view-board"/.test(html) && !/id="view-perf"/.test(html)
  && !/id="ask"/.test(html) && !/id="reqsec"/.test(html));
has(/id="view-publish"/, "발행 화면(결재·업로드·이력)");
has(/id="approveBody"/, "결재 대기 칸");
has(/id="uploadBody"/, "올릴 차례 칸");
has(/class="onode ceo"/, "조직도 정점 = CEO 노드");
has(/class="odivs"/, "조직도 5개 본부(계통도)");
has(/id="view-archive"/, "보관함 화면");
has(/id="jobbar"/, "작업 표시줄");
has(/id="connbtn"/, "상단 연결 뱃지");
has(/결재 대기/, "지표 명칭 '결재 대기'");
has(/올릴 차례/, "지표 명칭 '올릴 차례'");
has(/data-ia="delete"/, "소재 삭제 버튼");
/* 만들다 만 카드를 오너가 직접 내리는 자리(2026-08-12). 시안이 없는 날엔 보관함 버튼이
   안 그려지므로, 항상 존재하는 결재 드로어 쪽 배선을 본다. */
has(/data-drop=/, "시안 내리기 버튼(만들다 만 카드 정리)");
check("소재 보드에 승인·보류 버튼 없음(간소화 반영)",
  !/data-ia="approve"/.test(html) && !/data-ia="hold"/.test(html));
check("칸 나눈 입력 폼 제거(제목·이유·출처)",
  !/id="na-t"/.test(html) && !/id="na-w"/.test(html) && !/id="na-s"/.test(html));
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

check("읽기 캐시를 우회해 최신본을 읽는다(409 재발 방지)",
  /git\/ref\/heads/.test(html) && /nocache=/.test(html));
check("브라우저 옛 상태가 저장소를 덮지 않음",
  !/localStorage\.getItem\(KEY\)\);\s*if\(s&&s\.tickets&&s\.tickets\.length/.test(html));

// 완성 카드가 오너 손에 닿는가 (2026-07-26 "제작된 카드는 어딨는거야?")
has(/download\//, "결재 화면에 원본 내려받기 링크");
check("'만드는 중' 거짓 문구 없음", !/카드를 만드는 중입니다/.test(html));

// 내려받기 원본이 실제로 열리는가 — 링크만 있고 파일이 없으면 또 "안 열리는 링크"다
if (PW) {
  try {
    const loginBody = new URLSearchParams({ pw: PW });
    const lg = await fetch(URL_BASE + "/__login", { method: "POST", body: loginBody, redirect: "manual" });
    const ck = (lg.headers.get("set-cookie") || "").split(";")[0];
    const dl = await fetch(URL_BASE + "/download/index.json", { headers: { Cookie: ck } });
    const dj = await dl.json().catch(() => ({}));
    const first = ((dj.sets || [])[0] || {}).files?.[0];
    check("내려받기 색인이 열림", dl.status === 200 && Array.isArray(dj.sets) && dj.sets.length > 0,
      `HTTP ${dl.status}`);
    if (first) {
      const img0 = await fetch(URL_BASE + "/" + first, { headers: { Cookie: ck } });
      check("내려받기 원본 JPG가 실제로 열림", img0.status === 200
        && (img0.headers.get("content-type") || "").includes("image"), `HTTP ${img0.status} · ${first}`);
    }
    const open = await fetch(URL_BASE + "/download/index.json");
    check("내려받기는 문 안쪽(비번 없인 안 열림)", /비밀번호/.test(await open.text()));
  } catch (e) {
    check("내려받기 확인", false, String(e).slice(0, 100));
  }
}

// 관제탑 단독 제작 (클로드 없이) — 버튼과 배선이 실사이트에 있는가
has(/data-remake=/, "[다시 제작] 버튼(관제탑 단독 제작)");
has(/produce-card\.yml/, "제작 워크플로 배선");

// 연결 안내가 실제로 필요한 권한을 말하는가 (2026-07-27 모바일 연결)
check("연결 안내에 Actions 권한 포함(실행 버튼의 전제)",
  /Actions<\/b> = Read and write/.test(html) || /Actions/.test(html) && /connsteps/.test(html));
has(/connsteps/, "휴대폰 연결 단계 안내");
check("연결 시 권한을 실제로 확인", /actions\/workflows\?per_page=1/.test(html));

// 소재 보드가 발행 주기로 정리됐는가 (2026-07-27 오너 지시)
has(/정기 · 월간/, "소재 칸이 발행 주기로 서 있음(정기·월간)");
has(/일회성/, "일회성 칸");
has(/🆕 분류 대기/, "새로 들어온 소재가 갈 '분류 대기' 칸");
has(/class="ifeed/, "소재마다 자료 자동갱신 여부 뱃지");
has(/class="e-c"/, "✎ 수정에서 발행 주기를 바꿀 수 있음");
check("새 소재가 엉뚱한 칸에 처박히지 않음(첫/마지막 칸 기본값 금지)",
  !/ICATS\[ICATS\.length-1\]/.test(html) && /c\.key==="todo"/.test(html));

// 발행은 사람이 한다 — 그 사실이 실사이트에 반영됐는가 (2026-07-27)
has(/data-act="posted"/, "[✅ 인스타에 올렸습니다] 버튼");
has(/publish-archive\.yml/, "완성본 보관 워크플로 배선");
has(/class="pubnote"/, "결재 화면이 '오너가 직접 올린다'고 안내");
has(/발행 이력/, "발행 화면의 발행 이력 칸");
check("자동 업로드를 하는 척하는 문구 없음",
  !/인스타에 자동으로 올라갑|자동 발행됩니다/.test(html));

/* 자동 발행을 접었으니 공개 예외도 닫혀 있어야 한다 — 쓸 데 없이 열린 문은 위험이다.
 *
 * ⚠️ 옛 워커는 /cards/ 응답에 `public, max-age=600` 을 붙였다 → 엣지에 남아 있을 수 있다.
 *    캐시를 우회해 **지금 워커가 무엇을 주는지**를 본다. 그리고 실패하면 무엇을 받았는지
 *    반드시 적는다 — 판정만 있고 근거가 없으면 다음 사람이 또 추측해야 한다. */
if (PW) {
  for (const p of ["/cards/tohuh-rank-1.jpg", "/published/index.json"]) {
    const r = await fetch(`${URL_BASE}${p}?nocache=${Date.now()}`, { headers: { "Cache-Control": "no-cache" } });
    const ct = r.headers.get("content-type") || "";
    const body = await r.text();
    // 닫혀 있다 = 비밀번호 화면을 주거나, 내용을 아예 안 준다(4xx·비이미지)
    const closed = /비밀번호/.test(body) || (r.status >= 400 && !ct.includes("image"));
    check(`비번 없이 안 열림 — ${p}`, closed,
      `HTTP ${r.status} · ${ct} · ${body.slice(0, 70).replace(/\s+/g, " ")}`);
  }
}

// ── 카드 실물이 들어갔는지 — CI가 렌더한 썸네일
//
// ⚠️ 2026-08-12 이전엔 `data:image/…;base64` 개수를 셌다. 그런데 썸네일을 별도 파일로
//    빼면서(화면 무게 2MB 초과가 2주간 빨간불이었다) 그 개수가 0이 됐다. 개수 세기는
//    **어디에 있느냐**를 잰 것이지 **열리느냐**를 잰 게 아니었다.
//    이제 `/download/` 검사와 같은 방식으로 **실제로 한 장을 받아 본다.**
const thumbRefs = [...html.matchAll(/["'(](thumbs\/img\d+\.(?:jpg|png|webp))["')]/g)].map((m) => m[1]);
const inlineImgs = (html.match(/data:image\/(jpeg|png);base64/g) || []).length;
check("카드 썸네일 포함", thumbRefs.length > 0 || inlineImgs > 0,
  `파일 참조 ${thumbRefs.length}장 · 인라인 ${inlineImgs}장`);

if (PW && thumbRefs.length) {
  try {
    const loginBody = new URLSearchParams({ pw: PW });
    const lg = await fetch(URL_BASE + "/__login", { method: "POST", body: loginBody, redirect: "manual" });
    const ck = (lg.headers.get("set-cookie") || "").split(";")[0];
    const t0 = await fetch(URL_BASE + "/" + thumbRefs[0], { headers: { Cookie: ck } });
    check("썸네일 파일이 실제로 열림", t0.status === 200
      && (t0.headers.get("content-type") || "").includes("image"),
      `HTTP ${t0.status} · ${thumbRefs[0]}`);
    const open = await fetch(URL_BASE + "/" + thumbRefs[0]);
    check("썸네일도 문 안쪽(비번 없인 안 열림)", /비밀번호/.test(await open.text()));
  } catch (e) {
    check("썸네일 확인", false, String(e).slice(0, 100));
  }
}

check("화면 무게 적정(2MB 미만)", kb < 2048, `${kb}KB`);

console.log(`\n${fail ? "❌" : "✅"} 실제 사이트 ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
