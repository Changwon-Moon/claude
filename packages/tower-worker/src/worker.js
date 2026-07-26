/**
 * 관제탑 게이트 워커 (Cloudflare Workers)
 *
 * 정적 사이트(_site/)를 서빙하되, 그 앞에 **서버 측 비밀번호 문**을 세운다.
 * 브라우저에 심는 자바스크립트 비번(누구나 소스보기로 뚫림)이 아니라,
 * 워커가 요청을 받아 쿠키를 검사한 뒤에만 파일을 내보내므로 실제로 막힌다.
 *
 * - 비밀번호는 Cloudflare 시크릿 `TOWER_PASSWORD`. 저장소에는 없다.
 * - 시크릿이 없으면 문을 열어둔다(최초 배포·설정 전 상태에서 잠기는 사고 방지).
 * - 쿠키에는 비번이 아니라 비번의 해시를 넣는다(쿠키가 새도 비번은 복원 불가).
 */

const COOKIE = "wt";
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

async function tokenOf(pw) {
  const data = new TextEncoder().encode(`wirit-tower::${pw}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** 길이·내용 비교 시간을 일정하게 유지(타이밍 공격 방지) */
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function loginPage(message) {
  const msg = message
    ? `<p class="err">${message}</p>`
    : `<p class="hint">이 관제탑은 오너 전용입니다.</p>`;
  return new Response(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>wirit 관제탑</title>
<style>
:root{--ink:#141821;--cobalt:#2e6bff;--red:#e5484d;--bg:#f3f4f2;--card:#fff;--line:#e6e8e8;--muted:#5b6b7f}
@media (prefers-color-scheme:dark){:root{--bg:#0d1016;--card:#151a22;--line:#242b37;--ink:#eef2f7;--muted:#9aa7b6}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;
 background:var(--bg);color:var(--ink);font-family:"Pretendard","Apple SD Gothic Neo",system-ui,sans-serif}
.box{width:100%;max-width:360px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:28px 24px}
.brand{font-size:26px;font-weight:900;letter-spacing:-.02em;margin-bottom:4px}
.brand .dot{color:var(--cobalt)}
.hint{font-size:13px;color:var(--muted);margin:0 0 20px}
.err{font-size:13px;color:var(--red);font-weight:700;margin:0 0 20px}
input{width:100%;font:inherit;font-size:16px;padding:12px 14px;border-radius:10px;
 border:1.5px solid var(--line);background:var(--bg);color:var(--ink)}
input:focus{outline:3px solid color-mix(in srgb,var(--cobalt) 45%,transparent);outline-offset:1px;border-color:var(--cobalt)}
button{width:100%;margin-top:10px;font:inherit;font-size:15px;font-weight:800;padding:12px;border:none;
 border-radius:10px;background:var(--cobalt);color:#fff;cursor:pointer}
button:hover{filter:brightness(1.07)}
</style></head><body>
<form class="box" method="POST" action="/__login">
 <div class="brand">wirit<span class="dot">.</span> 관제탑</div>
 ${msg}
 <input type="password" name="pw" autocomplete="current-password" autofocus
        aria-label="비밀번호" placeholder="비밀번호" />
 <button type="submit">들어가기</button>
</form></body></html>`,
    { status: message ? 401 : 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export default {
  async fetch(request, env) {
    const pw = env.TOWER_PASSWORD;

    // 비번 미설정 = 문 없음. 설정 전 배포에서 스스로 잠기지 않게.
    if (!pw) return env.ASSETS.fetch(request);

    const expected = await tokenOf(pw);
    const url = new URL(request.url);

    if (url.pathname === "/__login") {
      if (request.method !== "POST") return loginPage();
      const form = await request.formData();
      if (safeEqual(String(form.get("pw") ?? ""), pw)) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": `${COOKIE}=${expected}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`,
          },
        });
      }
      return loginPage("비밀번호가 맞지 않습니다. 다시 입력해주세요.");
    }

    if (url.pathname === "/__logout") {
      return new Response(null, {
        status: 302,
        headers: { Location: "/", "Set-Cookie": `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0` },
      });
    }

    const cookie = request.headers.get("Cookie") || "";
    const found = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
    if (found && safeEqual(found[1], expected)) {
      const res = await env.ASSETS.fetch(request);
      const out = new Response(res.body, res);
      out.headers.set("X-Robots-Tag", "noindex, nofollow");
      return out;
    }

    return loginPage();
  },
};
