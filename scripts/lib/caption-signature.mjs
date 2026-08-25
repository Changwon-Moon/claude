/**
 * 캡션 고정 서명 — **붙이는 법의 정본 하나**.
 *
 * ── 왜 이 파일인가 (2026-08-25)
 * 「캡션 맨 아래 위릿노트 3줄」이 **세 번** 사라졌다:
 *   · 2026-08-16c — 재생성이 캡션 2건의 서명을 날렸다
 *   · 2026-08-16d — `doctor` 도 카드를 다시 만든다는 걸 몰라 tohuh-rent-map·wolse-flip 이
 *                   **매번** 서명을 잃은 채 남아 있었다
 *   · 2026-08-25 — 배포 순서를 손으로 재현하다 `apply-signature` 단계를 빼먹어
 *                  캡션 4개가 서명 없이 커밋됐다(`dfd5c89`)
 *
 * 매번 원인이 달랐지만 **모양은 같다**: 캡션을 통째로 새로 쓰는 곳은 여럿인데,
 * 서명을 붙이는 곳은 **뒤에 따로** 있었다. 그 사이가 벌어질 때마다 서명이 없어진다.
 * → 캡션을 쓰는 자리에서 **쓰면서 붙인다**. `writeCaption()` 을 쓰면 잊을 수가 없다.
 *
 * `apply-signature.mjs` 는 없어지지 않는다 — 손으로 고친 캡션까지 포함해
 * **전수 증명**(`--check`)하는 자리는 따로 필요하다. 둘은 이 파일의 `applySignature()`
 * 하나를 같이 쓴다.
 *
 * 서명 문구의 원천은 `data/review/captions/_signature.txt` 한 곳이다.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CAPTION_DIR = join(ROOT, "data/review/captions");
const SIG_FILE = join(CAPTION_DIR, "_signature.txt");

/** 서명 원문(줄바꿈 포함, 끝 공백 없음) */
export function signatureText() {
  return readFileSync(SIG_FILE, "utf8").trim();
}

/**
 * 캡션 본문에 서명을 **제자리에** 붙인 결과를 돌려준다(멱등).
 *
 * 자리: 출처 블록 다음, **해시태그 바로 위**.
 *   해시태그는 항상 마지막이어야 한다 — 인스타에서 접힘 아래로 밀어 넣는 자리다.
 *   서명이 태그 아래로 가면 접혀서 안 보인다.
 *
 * 이미 서명이 있으면 그 자리에서 **최신 문구로 갈아끼운다**. 문구가 바뀌어도 자리를
 * 잡을 수 있게, 찾는 열쇠는 서명 **첫 줄(구분자 `· · ·`)** 이다.
 */
export function applySignature(text) {
  const SIG = signatureText();
  const MARK = SIG.split("\n")[0];
  const lines = String(text ?? "").replace(/\s+$/, "").split("\n");

  // ① 기존 서명 블록 제거 (구분자 줄부터 서명 줄 수만큼)
  const at = lines.findIndex((l) => l.trim() === MARK);
  if (at >= 0) lines.splice(at, SIG.split("\n").length);

  // ② 해시태그 줄 찾기 — 없으면 맨 끝
  const tagAt = lines.findIndex((l) => /^\s*#\S/.test(l));
  const body = (tagAt >= 0 ? lines.slice(0, tagAt) : lines).join("\n").replace(/\s+$/, "");
  const tags = tagAt >= 0 ? lines.slice(tagAt).join("\n").trim() : "";

  return `${body}\n\n${SIG}\n${tags ? "\n" + tags + "\n" : ""}`;
}

/**
 * 캡션 파일을 쓴다 — **서명을 붙여서**. 빌더는 `writeFileSync` 대신 이걸 쓴다.
 *
 * @param {string} name  파일 이름(`wolse-flip` 또는 `wolse-flip.txt`) 또는 절대경로
 * @param {string} text  캡션 본문(서명 없이 써도 된다 — 여기서 붙는다)
 * @returns {string} 실제로 쓴 경로
 */
export function writeCaption(name, text) {
  const p = name.startsWith("/")
    ? name
    : join(CAPTION_DIR, name.endsWith(".txt") ? name : `${name}.txt`);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, applySignature(text), "utf8");
  return p;
}
