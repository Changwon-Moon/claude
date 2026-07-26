/**
 * 게이트 워커 셀프테스트 — 배포 전에 "문이 실제로 잠기는지" 확인한다.
 * 실행: pnpm --filter @wirit/tower-worker selftest
 */
import worker from "./worker.js";

const ASSETS = { fetch: async () => new Response("SECRET-CONTENT", { headers: { "content-type": "text/html" } }) };
const env = { TOWER_PASSWORD: "hunter2", ASSETS };

let pass = 0;
let fail = 0;
const check = (name, ok) => {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}`); }
};

const post = (pw) => {
  const fd = new FormData();
  fd.set("pw", pw);
  return new Request("https://x/__login", { method: "POST", body: fd });
};

console.log("🔐 관제탑 게이트 검사");

let r = await worker.fetch(new Request("https://x/"), env);
check("비인증 접근은 로그인 화면", r.status === 200 && (await r.text()).includes("비밀번호"));

r = await worker.fetch(post("wrong"), env);
check("틀린 비번은 401 거부", r.status === 401);

r = await worker.fetch(post("hunter2"), env);
const setCookie = r.headers.get("Set-Cookie") || "";
check("맞는 비번은 쿠키 발급", r.status === 302 && setCookie.includes("HttpOnly") && setCookie.includes("Secure"));
check("쿠키에 평문 비번이 들어가지 않음", !setCookie.includes("hunter2"));

const cookie = setCookie.split(";")[0];
r = await worker.fetch(new Request("https://x/", { headers: { Cookie: cookie } }), env);
check("유효 쿠키는 콘텐츠 통과", r.status === 200 && (await r.text()) === "SECRET-CONTENT");
check("검색엔진 색인 차단 헤더", r.headers.get("X-Robots-Tag") === "noindex, nofollow");

r = await worker.fetch(new Request("https://x/", { headers: { Cookie: "wt=deadbeef" } }), env);
check("위조 쿠키 차단", (await r.text()).includes("비밀번호"));

r = await worker.fetch(new Request("https://x/ideas.html"), env);
check("하위 경로도 문을 못 지나침", (await r.text()).includes("비밀번호"));

/* /cards/ 만 문 밖 — 인스타가 이미지를 가져가야 발행이 된다.
 * 딱 그 경로만 열려야 하므로 비슷한 이름(/cardsx, /card/)까지 새는지 확인한다. */
r = await worker.fetch(new Request("https://x/cards/tohuh-rank-1.jpg"), env);
check("발행용 이미지는 문 없이 통과(인스타가 가져갈 수 있어야 함)", (await r.text()) === "SECRET-CONTENT");
r = await worker.fetch(new Request("https://x/cards/x.jpg"), env);
check("발행용 이미지도 색인은 차단", r.headers.get("X-Robots-Tag") === "noindex, nofollow");
for (const p of ["/cardsx.html", "/card/x.jpg", "/Cards/x.jpg"]) {
  r = await worker.fetch(new Request("https://x" + p), env);
  check(`비슷한 경로는 안 열림 — ${p}`, (await r.text()).includes("비밀번호"));
}

r = await worker.fetch(new Request("https://x/"), { ASSETS });
check("비번 미설정 시에는 통과(자물쇠 사고 방지)", (await r.text()) === "SECRET-CONTENT");

console.log(`\n${fail ? "❌" : "✅"} ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
