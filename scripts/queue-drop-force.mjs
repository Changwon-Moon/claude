/**
 * 받아 온 줄에서 `force=1` 을 **수집기 스스로 지운다.**
 *
 *   node scripts/queue-drop-force.mjs <대기열파일> "<그 줄 전체>"
 *
 * ── 왜 이 파일인가 (2026-09-15 오너 "진행해줘")
 *
 * `force=1` 은 「파일이 이미 있어도 다시 받아라」는 뜻이다. 한 번 쓰고 나면 **지워야 하는데**,
 * 지금까지 그 일을 사람이 했다. 그리고 안 지켜졌다 — 09-14 에 「손으로 지우는 규칙은
 * 안 지켜진다」고 적어 두고 **그 다음 날 또 안 지켜졌다.**
 *
 * 09-15 실측:
 *   · 곡선 대기열 239줄 중 **40줄**에 force=1 이 남아 있었다. 수집기가 돌 때마다 그 40건을
 *     처음부터 다시 받는다. 한 건에 6분이니 그것만으로 네 시간이다.
 *     그날 카드에 필요한 7줄이 맨 아래에 있어 **한 시간을 돌고도 못 닿았다.**
 *   · 공급면적에서도 같은 것이 났다. 09-14 에 손으로 건 두 줄이 파일이 있는데도 매일
 *     호출을 태우다가 「fetch failed」로 **하루 몫을 그대로 날렸다.**
 *
 * **규칙을 문서에 적는 것으로는 안 된다. 코드가 하게 한다.**
 *
 * ── 무엇을 하나
 * 그 줄에서 `force=1` **토큰 하나만** 떼고 나머지는 글자 그대로 둔다(주석·간격 포함).
 * 줄을 지우지 않는다 — 대기열은 「무엇을 받았는가」의 기록이기도 하다.
 *
 * ── 안 하는 것
 * · 실패한 줄은 건드리지 않는다 — 다시 받아야 하니 force 가 남아 있어야 한다.
 *   (부르는 쪽이 **성공했을 때만** 이 스크립트를 부른다.)
 * · 여러 줄을 한꺼번에 고치지 않는다. 같은 글자의 줄이 둘이면 **맨 위 하나만** 고친다 —
 *   수집기는 위에서 아래로 한 줄씩 지나가므로, 다음 판에 나머지가 차례로 지워진다.
 * · 파일이 없거나 그 줄이 없으면 **조용히 0 으로 끝낸다.** 수집은 이미 끝났고,
 *   대기열 손질 하나 때문에 워크플로를 빨간불로 만들 이유가 없다(다만 무슨 일인지는 찍는다).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const [path, line] = process.argv.slice(2);
if (!path || !line) {
  console.error('사용법: node scripts/queue-drop-force.mjs <대기열파일> "<그 줄 전체>"');
  process.exit(2);
}
if (!existsSync(path)) {
  console.log(`ⓘ force 정리 건너뜀 — 대기열이 없습니다: ${path}`);
  process.exit(0);
}

const src = readFileSync(path, "utf8");
const eol = src.includes("\r\n") ? "\r\n" : "\n";
const lines = src.split(/\r?\n/);
const want = line.trim();

/* `force=1` 토큰만 뗀다 — 앞뒤 공백 하나까지 같이 걷어 두 칸이 남지 않게 한다. */
const strip = (s) => s.replace(/\s*\bforce=1\b/, "").replace(/[ \t]+$/, "");

const i = lines.findIndex((l) => l.trim() === want);
if (i < 0) {
  /* 대기열이 그새 바뀐 경우다(다른 워크플로가 밀었거나 사람이 고쳤거나).
     조용히 넘기지 않고 말한다 — 「지운 줄 알았는데 안 지워진」 상태가 가장 나쁘다. */
  console.log(`ⓘ force 정리 건너뜀 — 그 줄을 대기열에서 못 찾았습니다: ${want.slice(0, 60)}`);
  process.exit(0);
}
if (!/\bforce=1\b/.test(lines[i])) {
  process.exit(0); // 애초에 force 가 없던 줄 — 할 일이 없다
}

lines[i] = strip(lines[i]);
writeFileSync(path, lines.join(eol), "utf8");
console.log(`🧹 force=1 을 지웠습니다 — ${lines[i].trim().slice(0, 60)}`);
