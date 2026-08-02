/**
 * 텔레그램 연결 자가진단 — "됐나 안 됐나"를 사람이 추측하지 않게 한다.
 *
 * ── 왜 필요한가
 * 알림은 **안 오는 것이 정상인 날**이 있다(결정할 일이 없으면 안 보낸다).
 * 그래서 "조용하다"는 신호로는 **연결이 끊긴 것**과 **오늘 조용한 것**을 구분할 수 없다.
 * 2026-07-31 에 이 회사는 알림 키가 등록된 적 없이 몇 주가 지난 것을 뒤늦게 발견했다.
 * 이 스크립트는 그 구분을 한 번에 짓는다.
 *
 * ── 무엇을 보나 (실패 지점마다 다른 답을 준다)
 *   1) 시크릿이 둘 다 있나            → 없으면 어느 것이 없는지 이름을 댄다
 *   2) 토큰이 살아 있나 (getMe)       → 죽었으면 BotFather 재발급
 *   3) 그 대화로 보낼 수 있나 (send)  → 안 되면 chat_id 문제인지 '봇에게 말 안 걺'인지 가른다
 *
 * ⚠️ 토큰은 **절대 그대로 찍지 않는다.** 앞 6자리 + 길이만 남긴다.
 *
 * 실행: TELEGRAM_BOT_TOKEN=… TELEGRAM_CHAT_ID=… node scripts/telegram-doctor.mjs [--out data/telegram-last.md]
 * 결과: 표준출력 + (--out 이 있으면) 그 파일. 세션은 Actions 로그를 못 보므로 파일이 유일한 눈이다.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const OUT = arg("out", "");
const STAMP = arg("stamp", ""); // 워크플로가 KST 날짜를 넘긴다(러너는 UTC라 하루가 밀린다)

const TOKEN = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
const CHAT_ID = (process.env.TELEGRAM_CHAT_ID || "").trim();

/** 토큰을 로그에 남길 수 있는 형태로만 — 앞 6자리와 길이. */
const mask = (t) => (t ? `${t.slice(0, 6)}…(${t.length}자)` : "(없음)");

const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

say("# 텔레그램 연결 진단");
say("");
say(`- 시각: ${STAMP || "(미지정)"}`);
say(`- TELEGRAM_BOT_TOKEN: ${mask(TOKEN)}`);
say(`- TELEGRAM_CHAT_ID: ${CHAT_ID ? CHAT_ID : "(없음)"}`);
say("");

let ok = false;
let verdict = "";

async function main() {
  /* ① 시크릿 존재 — 이름이 한 글자만 달라도 여기서 걸린다 */
  if (!TOKEN || !CHAT_ID) {
    const miss = [!TOKEN && "TELEGRAM_BOT_TOKEN", !CHAT_ID && "TELEGRAM_CHAT_ID"].filter(Boolean);
    verdict = `❌ 시크릿이 없습니다 — ${miss.join(", ")}`;
    say(verdict);
    say("");
    say("GitHub → Settings → Secrets and variables → Actions → New repository secret");
    say("이름을 **한 글자도 틀리지 않게** 넣으세요. 틀리면 에러 없이 조용히 건너뜁니다.");
    say("절차: docs/guides/telegram-notify.md");
    return;
  }

  /* ② 토큰이 살아 있나 — getMe 는 대화 상대가 없어도 답한다 */
  let botName = "";
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/getMe`);
    const j = await r.json().catch(() => ({}));
    if (!j.ok) {
      /* 텔레그램이 답을 준 것과, 답에 닿지도 못한 것을 가른다.
         텔레그램은 실패해도 description 을 준다 — 그게 없으면 중간에서 막힌 것이다
         (작업 세션에서는 api.telegram.org 가 프록시에 막혀 이 갈래로 떨어진다). */
      if (j.description) {
        verdict = `❌ 봇 토큰이 유효하지 않습니다 — ${j.description}`;
        say(verdict);
        say("");
        say("@BotFather → /mybots → 해당 봇 → API Token 에서 다시 발급받아 시크릿을 갱신하세요.");
      } else {
        verdict = `❌ 텔레그램 응답을 못 읽었습니다 — HTTP ${r.status} (본문 없음)`;
        say(verdict);
        say("");
        say("→ 텔레그램이 준 답이 아니라 **중간에서 막힌 것**으로 보입니다.");
        say("   작업 세션은 외부망이 막혀 있어 항상 이렇게 나옵니다 — 이 진단은 Actions 에서 돌려야 합니다.");
        say("   (`data/telegram-test.txt` 에 한 줄 밀어 넣고 푸시하면 워크플로가 깹니다)");
      }
      return;
    }
    botName = `@${j.result.username} (${j.result.first_name})`;
    say(`✅ 봇 토큰 유효 — ${botName}`);
  } catch (e) {
    verdict = `❌ 텔레그램에 닿지 못했습니다 — ${e.message}`;
    say(verdict);
    return;
  }

  /* ③ 그 대화로 실제로 보낼 수 있나 — 여기까지 돼야 '연결됨'이다 */
  const text =
    `✅ wirit 알림 연결 확인\n\n` +
    `봇: ${botName}\n` +
    `대화 id: ${CHAT_ID}\n` +
    `시각: ${STAMP || "(미지정)"}\n\n` +
    `이 메시지가 보이면 설정이 끝난 것입니다.`;
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, disable_web_page_preview: true }),
    });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) {
      const d = String(j.description || `HTTP ${r.status}`);
      verdict = `❌ 전송 실패 — ${d}`;
      say(verdict);
      say("");
      /* 텔레그램의 에러 문구는 원인이 뚜렷하다. 사람 말로 바꿔 준다. */
      if (/chat not found/i.test(d)) {
        say("→ **chat_id 가 틀렸거나, 봇에게 아직 말을 걸지 않았습니다.**");
        say("   봇은 먼저 말 걸어준 사람에게만 보낼 수 있습니다.");
        say("   ① 텔레그램에서 그 봇과 대화를 열고 아무 말이나 보내기");
        say("   ② 브라우저에 `https://api.telegram.org/bot<토큰>/getUpdates` 를 열어");
        say("      `\"chat\":{\"id\":…` 의 숫자를 다시 확인 → 시크릿 갱신");
      } else if (/bot was blocked/i.test(d)) {
        say("→ 봇을 차단한 상태입니다. 대화방에서 차단을 풀어 주세요.");
      } else if (/Unauthorized/i.test(d)) {
        say("→ 토큰이 폐기됐습니다. BotFather 에서 재발급하세요.");
      } else {
        say("→ 위 문구를 그대로 검색하거나 세션에 알려 주세요.");
      }
      return;
    }
    ok = true;
    verdict = "✅ 연결 정상 — 텔레그램으로 확인 메시지를 보냈습니다.";
    say(verdict);
    say("");
    say("폰에서 메시지가 보이면 끝입니다. 안 보이면 다른 대화방으로 갔다는 뜻이니 chat_id 를 확인하세요.");
  } catch (e) {
    verdict = `❌ 전송 중 오류 — ${e.message}`;
    say(verdict);
  }
}

await main();

if (OUT) {
  const p = join(ROOT, OUT);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, lines.join("\n") + "\n", "utf8");
  console.log(`\n→ ${OUT} 에 기록했습니다.`);
}

/* 진단은 **실패해도 워크플로를 깨뜨리지 않는다** — 결과는 파일에 남고, 오너가 그것을 읽는다.
   여기서 exit 1 을 내면 "실패했다"는 사실만 알고 **왜인지는 로그를 열어야** 알게 된다. */
process.exit(0);
