/**
 * 카카오톡 "나에게 보내기" 알림.
 *
 * 관제탑을 열어보러 가는 게 아니라, 결정할 일이 생기면 관제탑이 부른다.
 *
 * 왜 카카오톡인가 (텔레그램 대신):
 *   - 오너가 이미 매일 쓰는 앱이라 알림을 놓치지 않는다
 *   - "나에게 보내기"(memo/default/send)는 **무료**다. 알림톡(비즈메시지)과 달리
 *     사업자등록·템플릿 심사·건당 과금이 없다
 *   - 단방향(메신저에서 승인 불가)이지만, 승인은 카드 실물·캡션을 봐야 하므로
 *     어차피 관제탑 웹에서 한다. 알림은 "가서 봐라" 한 줄이면 충분하다
 *
 * 필요한 시크릿 (GitHub Secrets):
 *   KAKAO_REST_API_KEY     카카오 개발자 앱의 REST API 키
 *   KAKAO_REFRESH_TOKEN    "나에게 보내기(talk_message)" 동의를 마친 refresh token
 *   TOWER_URL              관제탑 주소 (버튼이 열 곳). 없으면 기본값 사용
 * 발급 절차: docs/guides/kakao-notify.md
 *
 * 시크릿이 없으면 **조용히 건너뛴다**(exit 0). 알림이 없다고 배포가 깨지면 안 된다.
 *
 * 실행:
 *   node scripts/notify-kakao.mjs                 # 관제탑 상태를 읽어 자동 작성
 *   node scripts/notify-kakao.mjs "직접 쓴 문구"   # 문구를 직접 지정
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOWER_URL = process.env.TOWER_URL || "https://wirit-tower.engineerest0.workers.dev/";
const KEY = process.env.KAKAO_REST_API_KEY || "";
const REFRESH = process.env.KAKAO_REFRESH_TOKEN || "";

/** 관제탑 상태에서 "지금 결정할 일"을 센다 — 화면과 같은 기준(캡션 있는 발행 후보 + 미결 소재). */
function readPending() {
  const p = join(ROOT, "packages/dashboard/tower-state.json");
  if (!existsSync(p)) return null;
  let s;
  try {
    s = JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
  const tickets = Array.isArray(s.tickets) ? s.tickets : [];
  const pub = tickets.filter(
    (t) => t.stage === 4 && t.caption && !(t.flags || []).includes("실험") && !(t.flags || []).includes("버림")
  );
  const ideas = Array.isArray(s.ideas?.items) ? s.ideas.items : [];
  const undecided = ideas.filter((i) => !i.state && i.status !== "done" && !Number(i.stage || 0));
  return { pub, undecided, dateLabel: s.dateLabel || "" };
}

function composeText(st) {
  if (!st) return null;
  const parts = [];
  if (st.pub.length) {
    parts.push(`🚀 발행 승인 대기 ${st.pub.length}건`);
    for (const t of st.pub.slice(0, 3)) parts.push(`  · ${t.title}`);
    if (st.pub.length > 3) parts.push(`  · 외 ${st.pub.length - 3}건`);
  }
  if (st.undecided.length) parts.push(`💡 고를 소재 ${st.undecided.length}건`);
  if (!parts.length) return null; // 결정할 게 없으면 알림을 보내지 않는다(알림 피로 방지)
  return `[wirit 관제탑] ${st.dateLabel}\n\n${parts.join("\n")}`;
}

/** refresh token으로 access token을 새로 받는다(access는 6시간이라 매번 새로 받는 게 맞다) */
async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: KEY,
    refresh_token: REFRESH,
  });
  const r = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`토큰 갱신 실패 ${r.status} · ${JSON.stringify(j).slice(0, 200)}`);
  // 카카오는 refresh token 유효기간이 1개월 미만으로 남으면 새 것을 같이 준다
  if (j.refresh_token) {
    console.log("::warning::카카오 refresh token이 갱신됐습니다. GitHub 시크릿 KAKAO_REFRESH_TOKEN을 새 값으로 바꾸세요.");
    console.log(`새 refresh token 앞 8자: ${String(j.refresh_token).slice(0, 8)}… (전체 값은 로그에 남기지 않습니다)`);
  }
  return j.access_token;
}

async function sendMemo(accessToken, text) {
  // 텍스트 템플릿 — 본문 + [관제탑 열기] 버튼 하나
  const template = {
    object_type: "text",
    text: text.slice(0, 200), // 카카오 텍스트 템플릿 상한
    link: { web_url: TOWER_URL, mobile_web_url: TOWER_URL },
    button_title: "관제탑 열기",
  };
  const r = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams({ template_object: JSON.stringify(template) }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`전송 실패 ${r.status} · ${JSON.stringify(j).slice(0, 200)}`);
  return j;
}

// ── 실행
const manual = process.argv.slice(2).join(" ").trim();
const text = manual || composeText(readPending());

if (!text) {
  console.log("✔ 결정할 일이 없어 알림을 보내지 않습니다.");
  process.exit(0);
}
if (!KEY || !REFRESH) {
  console.log("⏭ 카카오 시크릿(KAKAO_REST_API_KEY / KAKAO_REFRESH_TOKEN)이 없어 알림을 건너뜁니다.");
  console.log("  설정 방법: docs/guides/kakao-notify.md");
  console.log("── 보냈다면 이런 내용이었습니다 ──");
  console.log(text);
  process.exit(0);
}

try {
  const at = await getAccessToken();
  await sendMemo(at, text);
  console.log("📨 카카오톡 알림 전송 완료");
  console.log(text);
} catch (e) {
  // 알림 실패로 배포를 깨뜨리지 않는다 — 경고만 남긴다
  console.log(`::warning::카카오 알림 실패 — ${e.message}`);
  process.exit(0);
}
