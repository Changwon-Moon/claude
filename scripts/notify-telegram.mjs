/**
 * 텔레그램 알림 — "결정할 일 생겼어요" 를 폰으로.
 *
 * 관제탑을 열어보러 가는 게 아니라, 결정할 일이 생기면 관제탑이 부른다.
 *
 * ── 왜 텔레그램인가 (2026-07-31 오너 결정, 카카오톡에서 전환)
 * 카카오톡 "나에게 보내기"도 무료였지만, 쓰려면 개발자 앱 → 카카오 로그인 활성화 →
 * 동의항목 설정 → 주소창으로 인가코드 받기 → refresh token 변환까지 다섯 단계를 거쳐야 했고,
 * 그 refresh token 은 **2개월마다 갱신**이 필요해 손이 계속 갔다.
 * 텔레그램은 봇 하나 만들면 토큰이 나오고 **만료가 없다.** 준비 3분, 이후 무보수.
 * 게다가 원래 설계(`CLAUDE.md` 기술 결정: 승인 게이트 = Telegram/Slack 봇)로 돌아가는 것이기도 하다.
 *
 * 지금은 **알림 + [관제탑 열기] 버튼**까지만 한다 — 카카오와 같은 범위다.
 * 승인은 카드 실물·캡션을 봐야 하므로 관제탑 웹에서 한다.
 * (텔레그램은 메신저 안에서 버튼 응답을 받을 수 있어 나중에 '바로 승인'을 붙일 여지가 있다.
 *  다만 그건 응답을 받아줄 서버가 필요해 별개 작업이다.)
 *
 * 필요한 시크릿 (GitHub Secrets):
 *   TELEGRAM_BOT_TOKEN   @BotFather 에게 받은 봇 토큰 (만료 없음)
 *   TELEGRAM_CHAT_ID     알림을 받을 대화 id (오너 본인과의 1:1 대화)
 *   TOWER_URL            관제탑 주소 (버튼이 열 곳). 없으면 기본값 사용
 * 발급 절차: docs/guides/telegram-notify.md
 *
 * 시크릿이 없으면 **조용히 건너뛴다**(exit 0). 알림이 없다고 배포가 깨지면 안 된다.
 *
 * 실행:
 *   node scripts/notify-telegram.mjs                 # 관제탑 상태를 읽어 자동 작성
 *   node scripts/notify-telegram.mjs "직접 쓴 문구"   # 문구를 직접 지정
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOWER_URL = process.env.TOWER_URL || "https://wirit-tower.engineerest0.workers.dev/";
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

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

async function sendMessage(text) {
  // 본문 + [관제탑 열기] 버튼 하나. 텔레그램 본문 상한은 4096자라 카카오(200자)처럼 자를 일이 거의 없다.
  const body = {
    chat_id: CHAT_ID,
    text: text.slice(0, 4000),
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: [[{ text: "관제탑 열기", url: TOWER_URL }]] },
  };
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  // 텔레그램은 실패해도 HTTP 200 에 ok:false 로 답하는 경우가 있어 둘 다 본다
  if (!r.ok || j.ok === false) {
    throw new Error(`전송 실패 ${r.status} · ${String(j.description || JSON.stringify(j)).slice(0, 200)}`);
  }
  return j;
}

// ── 실행
const manual = process.argv.slice(2).join(" ").trim();
const text = manual || composeText(readPending());

if (!text) {
  console.log("✔ 결정할 일이 없어 알림을 보내지 않습니다.");
  process.exit(0);
}
if (!TOKEN || !CHAT_ID) {
  console.log("⏭ 텔레그램 시크릿(TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)이 없어 알림을 건너뜁니다.");
  console.log("  설정 방법: docs/guides/telegram-notify.md");
  console.log("── 보냈다면 이런 내용이었습니다 ──");
  console.log(text);
  process.exit(0);
}

try {
  await sendMessage(text);
  console.log("📨 텔레그램 알림 전송 완료");
  console.log(text);
} catch (e) {
  // 알림 실패로 배포를 깨뜨리지 않는다 — 경고만 남긴다
  console.log(`::warning::텔레그램 알림 실패 — ${e.message}`);
  process.exit(0);
}
