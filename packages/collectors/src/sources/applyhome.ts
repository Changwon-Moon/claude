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

/**
 * 한 오퍼레이션을 페이지 끝까지 읽는다.
 * odcloud 는 totalCount 를 주므로 그것으로 멈춘다 — 무한 루프 방지로 maxPages 도 둔다.
 */
export async function fetchNotices(
  kind: Kind,
  key: string,
  opts: { perPage?: number; maxPages?: number } = {},
): Promise<Envelope["data"]> {
  const perPage = opts.perPage ?? 500;
  const maxPages = opts.maxPages ?? 20;
  const rows: NonNullable<Envelope["data"]> = [];

  for (let page = 1; page <= maxPages; page++) {
    const text = await fetchText(buildUrl(kind, key, page, perPage), { timeoutMs: 20000 });
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
