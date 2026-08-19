/**
 * API 키를 **재고 다듬는다** — 값은 절대 찍지 않는다.
 *
 * ── 왜 (2026-08-19)
 * 청약홈이 08-17 부터 100% HTTP 401 이었다. 키 값·인증 방식·활용신청·연결을 다 의심하고
 * 실측으로 하나씩 죽였는데, **정작 키 자체를 한 번도 재보지 않았다.**
 * GitHub Secrets 에 붙여넣을 때 딸려 들어가는 **줄바꿈·앞뒤 공백은 화면에서 안 보인다.**
 * 그리고 이 저장소의 수집기들은 `process.env.X` 를 **그대로** URL 에 실었다 —
 * 끝에 `\n` 이 하나 붙으면 `%0A` 가 되어 서버는 "모르는 키"라고 답한다.
 *
 * 값을 로그에 찍으면 안 되지만, **값의 모양**은 찍어도 안전하다:
 * 길이 · 공백 유무 · `%XX` 유무 · 해시 앞 8자.
 * 해시 앞자리가 있으면 **두 Secret 이 같은 키인지**도 값을 안 보고 알 수 있다
 * (이번에 DATA_GO_KR_API_KEY 와 MOLIT_API_KEY 를 비교해야 했다).
 */
import { createHash } from "node:crypto";

export interface KeyReport {
  key: string;
  /** 원본에 앞뒤 공백·줄바꿈이 있었나 — 있었으면 그게 401 의 범인일 수 있다 */
  trimmed: boolean;
  len: number;
  /** 가운데 공백. 이건 다듬어도 못 고친다 — 붙여넣기가 끊긴 것이다 */
  innerSpace: boolean;
  percentEncoded: boolean;
  fingerprint: string;
  /** 앞 4자. **어느 키인지 가르는 용도**다 — 포털의 「인증키 발급현황」 화면과 눈으로 맞춘다.
   *  64자 hex 중 4자라 값이 새는 것과는 거리가 멀고, 이게 없으면 '옛 키냐 새 키냐'를
   *  판정할 방법이 없어 매번 오너에게 다시 물어야 한다(2026-08-19 재발급 추적). */
  head4: string;
}

/**
 * 앞뒤 공백을 떼고, 모양을 잰다. **값은 반환 객체 안에만 있고 로그로 나가지 않는다.**
 */
export function inspectKey(raw: string | undefined): KeyReport {
  const original = raw ?? "";
  const key = original.trim();
  return {
    key,
    trimmed: key !== original,
    len: key.length,
    innerSpace: /\s/.test(key),
    percentEncoded: /%[0-9A-Fa-f]{2}/.test(key),
    fingerprint: key ? createHash("sha256").update(key).digest("hex").slice(0, 8) : "(빈값)",
    head4: key.slice(0, 4),
  };
}

/** 한 줄 요약. 값이 아니라 **모양**만 나간다 — 로그·커밋에 남아도 안전하다. */
export function describeKey(name: string, r: KeyReport): string {
  const flags = [
    r.trimmed ? "⚠️ 앞뒤 공백/줄바꿈이 있어 떼어냈다" : null,
    r.innerSpace ? "⚠️ 가운데 공백이 있다(붙여넣기가 끊겼을 수 있다)" : null,
    r.percentEncoded ? "%XX 인코딩됨" : "인코딩 안 됨",
  ].filter(Boolean);
  return `   🔑 ${name}: ${r.head4}… (${r.len}자) · 지문 ${r.fingerprint} · ${flags.join(" · ")}`;
}
