/**
 * KOSIS(국가통계포털) OpenAPI 호출 — **Actions 전용**.
 *
 * 작업 세션은 외부망이 막혀 있어 여기서 못 부른다(2026-08-01 실측: apis.data.go.kr HTTP 000).
 * 그래서 이 파일은 워크플로 안에서만 실행된다. 세션에서는 `--dry` 로 표본을 흘려 배관만 본다.
 *
 * ── 왜 행안부 주민등록 오픈API 가 아니라 KOSIS 인가 (2026-08-03 오너 결정)
 * 두 가지를 실측하고 갈아탔다.
 *   ① **코드 체계**: 우리 지도(`data/geo/korea-municipalities.geojson`)는 통계청 행정구역코드다
 *      (동작구 11200 · 부산 21xxx · 경기 31xxx). 행안부 주민등록은 법정동코드라 동작구가 11590,
 *      경기가 41xxx 다. 그대로 조인하면 **엉뚱한 구에 색이 칠해진다.** KOSIS 는 통계청 체계라
 *      우리 지도에 그대로 붙는다.
 *   ② **규격 검증 가능성**: data.go.kr 상세 화면은 세션에서 열리지 않아 행안부 API 의 요청
 *      파라미터·응답 필드를 한 글자도 확인하지 못했다. KOSIS 는 엔드포인트·파라미터·응답 필드가
 *      공개 문서로 확인된다.
 *
 * ⚠️ 그래도 **첫 실제 실행 전까지는 필드 이름이 맞는지 알 수 없다.** 그래서 파서가 던진다.
 *    (packages/collectors/src/parse/kosis.ts 참고 — 빈 결과와 실패를 구분한다)
 *
 * 문서: https://kosis.kr/openapi/
 */
import { fetchText } from "../http.js";

const BASE = "https://kosis.kr/openapi/Param/statisticsParameterData.do";

/**
 * 우리가 받는 통계표.
 *
 * ⚠️ `tblId` 는 **세션에서 원문 대조를 못 했다.** DT_1B040A3 은 KOSIS statHtml 화면 제목이
 *    「행정구역(시군구)별, 성별 인구수」인 것까지만 확인됐다. 첫 실행에서 응답 헤더의
 *    통계표명을 그대로 데이터셋 meta 에 적어 두고, 오너가 눈으로 한 번 대조한다.
 *    그 전까지 이 데이터로 만든 카드는 `verified:false` 다.
 */
export const TABLES = {
  population: {
    orgId: "101",
    tblId: "DT_1B040A3",
    label: "행정구역(시군구)별 성별 인구수",
    /** 총인구 항목. 성별 분리가 필요해지면 여기만 늘린다. */
    itmId: "T20",
    /** objL1 = 행정구역, objL2 = 성별(총계) */
    objL1: "ALL",
    objL2: "",
  },
} as const;

export type TableKey = keyof typeof TABLES;

/**
 * KOSIS 인증키는 발급 화면에서 그대로 복사한 평문이다(청약홈처럼 인코딩 두 벌이 아니다).
 * 그래도 `+`·`=` 가 섞이면 쿼리에서 깨지므로 한 번만 인코딩한다.
 * 이미 `%XX` 가 보이면 인코딩된 것이므로 다시 인코딩하지 않는다 — 국토부에서 밟았던 함정.
 */
export function encKey(key: string): string {
  return /%[0-9A-Fa-f]{2}/.test(key) ? key : encodeURIComponent(key);
}

/**
 * 조회 URL. `prdSe=Y`(연간) 또는 `M`(월간)에 따라 기간 파라미터가 달라진다.
 * 주민등록 인구는 월 단위로 공표되므로 기본은 월간이다.
 */
export function buildUrl(
  table: TableKey,
  key: string,
  opts: { prdSe?: "M" | "Y"; startPrdDe: string; endPrdDe: string },
): string {
  const t = TABLES[table];
  const p = new URLSearchParams({
    method: "getList",
    apiKey: "__KEY__", // 아래에서 직접 갈아끼운다(URLSearchParams 가 키를 이중 인코딩하지 않도록)
    itmId: t.itmId,
    objL1: t.objL1,
    format: "json",
    jsonVD: "Y",
    prdSe: opts.prdSe ?? "M",
    startPrdDe: opts.startPrdDe,
    endPrdDe: opts.endPrdDe,
    orgId: t.orgId,
    tblId: t.tblId,
  });
  return `${BASE}?${p.toString()}`.replace("__KEY__", encKey(key));
}

/** KOSIS 한 표를 통째로 읽는다. 페이지 개념이 없고 기간으로 자른다. */
export async function fetchTable(
  table: TableKey,
  key: string,
  opts: { prdSe?: "M" | "Y"; startPrdDe: string; endPrdDe: string },
): Promise<unknown> {
  const url = buildUrl(table, key, opts);
  const text = await fetchText(url, { timeoutMs: 30000 });

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    /* KOSIS 는 키가 틀리거나 표가 없으면 HTML·XML 을 돌려주기도 한다.
       "JSON 파싱 실패"만 적으면 다음 사람이 원인을 다시 파야 한다 — 앞부분을 그대로 보여 준다. */
    throw new Error(`KOSIS 응답이 JSON 이 아니다(${table}): ${text.slice(0, 300)}`);
  }

  /* KOSIS 는 오류도 200 으로 준다. `{ err: "...", errMsg: "..." }` 꼴이면 실패다.
     이걸 안 보면 빈 배열이 "그 달에 인구가 없었다"로 둔갑한다. */
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const o = json as Record<string, unknown>;
    if (o.err || o.errMsg || o.ERR || o.errCd) {
      throw new Error(`KOSIS API 오류(${table}): ${String(o.errMsg ?? o.err ?? o.errCd ?? "")}`);
    }
  }
  return json;
}
