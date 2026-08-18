/**
 * 청약홈(한국부동산원) 분양정보 API 호출 — **Actions 전용**.
 *
 * 작업 세션은 외부망이 막혀 있어 여기서 못 부른다(2026-08-01 확인: apis.data.go.kr HTTP 000).
 * 그래서 이 파일은 워크플로 안에서만 실행된다.
 *
 * 공공데이터포털: 한국부동산원_청약홈 분양정보 조회 서비스 (data.go.kr/data/15098547)
 * 게이트웨이는 odcloud — 응답이 JSON 이고 페이지 파라미터가 page/perPage 다.
 *
 * ⚠️ 키는 **인코딩된 것과 디코딩된 것 두 벌**이 발급된다. 포털에서 복사한 값이
 *    %2B·%3D 를 포함하면 이미 인코딩된 것이므로 다시 encodeURIComponent 하면 안 된다.
 *    (국토부 수집기에서 같은 함정을 한 번 밟았다 — sources/molit.ts 의 encKey 참고)
 */
import { fetchText } from "../http.js";
import type { Envelope, Kind } from "../parse/applyhome.js";

const BASE = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";

/** 오퍼레이션 — 오너 선택(2026-08-01): APT 신규 분양 + 무순위/잔여세대 두 갈래만. */
export const OPERATIONS: Record<Kind, { path: string; label: string }> = {
  apt: { path: "getAPTLttotPblancDetail", label: "APT 분양정보" },
  remndr: { path: "getRemndrLttotPblancDetail", label: "APT 무순위/잔여세대" },
};

/** 이미 인코딩된 키를 다시 인코딩하지 않는다. %XX 가 보이면 그대로 쓴다. */
export function encKey(key: string): string {
  return /%[0-9A-Fa-f]{2}/.test(key) ? key : encodeURIComponent(key);
}

export function buildUrl(kind: Kind, key: string, page: number, perPage: number): string {
  const op = OPERATIONS[kind];
  return `${BASE}/${op.path}?page=${page}&perPage=${perPage}&serviceKey=${encKey(key)}`;
}

/** 쿼리에 키를 안 싣는 주소. 헤더 인증(`Authorization: Infuser`)일 때 쓴다. */
export function buildUrlNoKey(kind: Kind, page: number, perPage: number): string {
  const op = OPERATIONS[kind];
  return `${BASE}/${op.path}?page=${page}&perPage=${perPage}`;
}

/** `%XX` 를 되돌린 **디코딩 키**. 헤더 인증은 인코딩된 값을 받지 않는다. */
export function decKey(key: string): string {
  if (!/%[0-9A-Fa-f]{2}/.test(key)) return key;
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}

/**
 * 인증 방식 두 가지 — **쿼리(`serviceKey=`)와 헤더(`Authorization: Infuser`)**.
 *
 * ⚠️ 2026-08-19: 08-17 부터 청약홈이 **키와 무관하게 100% HTTP 401** 이 됐다.
 * 서로 다른 두 Secret(DATA_GO_KR_API_KEY · MOLIT_API_KEY)으로 같은 API 를 불러 **둘 다 401**
 * 인 것을 실측했으므로 키 값 문제가 아니다. 포털 화면의 활용신청도 '승인 · 2026-07-22 ~' 로
 * 살아 있다. 남는 설명은 **odcloud 가 쿼리 파라미터 인증을 더 이상 안 받는다**는 것이다
 * (odcloud 공식 안내는 헤더 방식이다).
 *
 * 그래서 **한 방식만 믿지 않는다.** 순서대로 시도해 되는 쪽을 그 실행 내내 쓰고,
 * 어느 쪽으로 붙었는지 로그에 남긴다 — 다음 사람이 같은 것을 다시 파지 않도록.
 */
export type AuthMode = "header" | "query";
export const AUTH_MODES: AuthMode[] = ["header", "query"];

export function requestFor(
  mode: AuthMode,
  kind: Kind,
  key: string,
  page: number,
  perPage: number,
): { url: string; headers?: Record<string, string> } {
  return mode === "header"
    ? { url: buildUrlNoKey(kind, page, perPage), headers: { Authorization: `Infuser ${decKey(key)}` } }
    : { url: buildUrl(kind, key, page, perPage) };
}

/**
 * 한 오퍼레이션을 페이지 끝까지 읽는다.
 * odcloud 는 totalCount 를 주므로 그것으로 멈춘다 — 무한 루프 방지로 maxPages 도 둔다.
 */
export async function fetchNotices(
  kind: Kind,
  key: string,
  opts: { perPage?: number; maxPages?: number; mode?: AuthMode } = {},
): Promise<Envelope["data"]> {
  const perPage = opts.perPage ?? 500;
  const maxPages = opts.maxPages ?? 20;
  const rows: NonNullable<Envelope["data"]> = [];

  /* 첫 페이지에서 **되는 인증 방식을 한 번만 찾고**, 그 뒤로는 그것만 쓴다.
     페이지마다 두 방식을 다 두드리면 호출이 배로 늘고 로그가 시끄러워진다. */
  let mode: AuthMode | null = opts.mode ?? null;
  if (!mode) {
    const errs: string[] = [];
    for (const m of AUTH_MODES) {
      const r = requestFor(m, kind, key, 1, 1);
      try {
        await fetchText(r.url, { timeoutMs: 20000, retries: 0, headers: r.headers });
        mode = m;
        console.log(`   🔑 청약홈 인증 방식: ${m === "header" ? "Authorization 헤더" : "serviceKey 쿼리"}`);
        break;
      } catch (e) {
        errs.push(`${m}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    if (!mode)
      throw new Error(
        `청약홈 인증이 두 방식 모두 거부됐습니다 — ${errs.join(" | ")}\n` +
          `   ↳ 401 이면 키가 아니라 **활용신청/게이트웨이** 문제일 수 있습니다` +
          ` (2026-08-19 에 서로 다른 두 키가 똑같이 401 이었습니다).`,
      );
  }

  for (let page = 1; page <= maxPages; page++) {
    const req = requestFor(mode, kind, key, page, perPage);
    const text = await fetchText(req.url, { timeoutMs: 20000, headers: req.headers });
    let env: Envelope & { code?: string; msg?: string };
    try {
      env = JSON.parse(text);
    } catch {
      /* 포털은 키가 틀리면 XML 에러를 돌려주기도 한다 — 앞부분을 그대로 보여 준다.
         "JSON 파싱 실패"만 적으면 다음 사람이 원인을 다시 파야 한다. */
      throw new Error(`청약홈 응답이 JSON 이 아니다(${kind}, page ${page}): ${text.slice(0, 200)}`);
    }
    if (env.code || env.msg) throw new Error(`청약홈 API 오류(${kind}): ${env.code ?? ""} ${env.msg ?? ""}`);
    const data = Array.isArray(env.data) ? env.data : [];
    rows.push(...data);
    const total = Number(env.totalCount ?? 0);
    if (!data.length || rows.length >= total) break;
  }
  return rows;
}
