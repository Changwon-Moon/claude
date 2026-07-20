/** 재시도 포함 HTTP 텍스트 GET (지수 백오프). Node 20+ 내장 fetch 사용. */
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
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const wait = 2 ** attempt * 1000; // 1s, 2s, 4s...
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw new Error(
    `GET 실패(${retries + 1}회 시도): ${url}\n${lastErr instanceof Error ? lastErr.message : lastErr}`,
  );
}
