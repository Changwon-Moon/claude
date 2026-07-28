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

/* 공개 예외 없음 — 자동 발행을 접었으니 문 밖에 둘 이유가 사라졌다(2026-07-27).
 * 카드 이미지도, 완성본도, 내려받기도 전부 비밀번호 뒤에 있어야 한다. */
for (const p of ["/cards/tohuh-rank-1.jpg", "/cards/x.jpg", "/cardsx.html", "/card/x.jpg", "/Cards/x.jpg",
  "/download/index.json", "/published/index.json"]) {
  r = await worker.fetch(new Request("https://x" + p), env);
  check(`문 밖으로 새지 않음 — ${p}`, (await r.text()).includes("비밀번호"));
}

r = await worker.fetch(new Request("https://x/"), { ASSETS });
check("비번 미설정 시에는 통과(자물쇠 사고 방지)", (await r.text()) === "SECRET-CONTENT");

console.log(`\n${fail ? "❌" : "✅"} ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
