/** 재시도 포함 HTTP 텍스트 GET (지수 백오프). Node 20+ 내장 fetch 사용. */

/**
 * 오류 메시지에 URL 을 실을 때 **인증키를 지운다.**
 *
 * 2026-08-03 사고: KOSIS 가 응답하지 않던 날, 실패한 URL 이 오류 메시지에 그대로 실렸고
 * probe 가 그 메시지를 결과 파일에 적어 **저장소에 커밋했다.** 인증키가 통째로 남았다.
 * 로그는 사람이 읽으라고 남기는 것이고, 저장소는 공개될 수 있다.
 * 키가 필요한 디버깅은 없다 — 어느 표·어느 파라미터였는지만 있으면 된다.
 */
export function redactUrl(url: string): string {
  return String(url).replace(
    /([?&](?:apiKey|serviceKey|key|api_key|authKey|crtfcKey)=)[^&\s]*/gi,
    "$1***",
  );
}

export async function fetchText(
  url: string,
  opts: { retries?: number; timeoutMs?: number; headers?: Record<string, string> } = {},
): Promise<string> {
  const retries = opts.retries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 15000;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { "User-Agent": "wirit-collector/0.1", ...(opts.headers ?? {}) },
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${redactUrl(url)}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const wait = 2 ** attempt * 1000; // 1s, 2s, 4s...
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  /* ── 왜 원인(cause)까지 적나 (2026-08-12)
     Node 의 fetch 는 연결이 끊기든, TLS 가 틀리든, 호스트를 못 찾든 **전부 "fetch failed"** 한 줄로만
     말한다. 그 한 줄만 결과 파일에 남으면 다음 사람이 "망이 죽었나 / 주소가 틀렸나"를 구별하지 못하고
     시간을 버린다 — 실제로 KOSIS 표 찾기가 실패했을 때 그랬다. 같은 실행에서 같은 호스트의 다른
     호출(표 검증)은 성공했는데도 왜 검색만 실패했는지 알 수 없었다.
     진짜 이유는 err.cause 에 있다(ENOTFOUND · ECONNRESET · UNABLE_TO_VERIFY_LEAF_SIGNATURE …). */
  const detail = (e: unknown): string => {
    if (!(e instanceof Error)) return String(e);
    const c = (e as { cause?: unknown }).cause;
    const cm = c instanceof Error
      ? `${c.name}: ${c.message}${(c as { code?: string }).code ? ` (code=${(c as { code?: string }).code})` : ""}`
      : c ? String(c) : "";
    return cm ? `${e.message} — 원인: ${cm}` : e.message;
  };
  throw new Error(`GET 실패(${retries + 1}회 시도): ${redactUrl(url)}\n${detail(lastErr)}`);
}
