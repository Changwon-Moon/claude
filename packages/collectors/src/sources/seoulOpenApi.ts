/**
 * 서울 열린데이터광장 Open API — **Actions 전용**.
 *
 * 작업 세션은 외부망이 막혀 있어 여기서 못 부른다(2026-08-06 실측: openapi.seoul.go.kr HTTP 000).
 * KOSIS 와 같은 구조다 — 세션은 배관만 짜고, 실제 호출은 워크플로가 한다.
 *
 * ── 이 API 가 KOSIS 와 다른 점 셋
 * ① **경로에 인증키가 들어간다.** 쿼리스트링이 아니라 URL 경로다:
 *      http://openapi.seoul.go.kr:8088/{KEY}/json/{서비스명}/{시작}/{끝}/{인자…}
 *    → 오류 메시지에 URL 을 실으면 키가 통째로 노출된다. http.ts 의 redactUrl 은
 *      쿼리스트링만 지우므로 **여기서 따로 지운다**(redactSeoulUrl).
 * ② **한 번에 1,000행까지.** 시작·끝 인덱스로 나눠 받아야 한다.
 * ③ **Open API 는 최근 2개월만** 준다. 그 이전은 사이트에서 ZIP 을 받아야 한다.
 *
 * 문서: https://data.seoul.go.kr/together/guide/useGuide.do
 */
import { fetchText } from "../http.js";

const BASE = "http://openapi.seoul.go.kr:8088";

/** 한 번에 받을 수 있는 최대 행 수 (서울시 문서값) */
export const MAX_ROWS = 1000;

export type SeoulService = {
  /** API 서비스명(영문). 데이터셋 페이지의 'Open API' 탭에 적혀 있다. */
  service: string;
  label: string;
  /** 무엇을 뽑나 */
  metric: string;
  /**
   * 위치 인자 순서. 서비스마다 다르다.
   *   date  — 기준일 YYYYMMDD
   *   dong  — 행정동코드
   * 예: ["date"] → /{시작}/{끝}/{기준일}
   */
  args: ("date" | "dong")[];
  /**
   * 얼마나 확인됐나.
   *   확실   — 서비스명·응답 컬럼까지 실호출로 확인
   *   이름확실 — 서비스명은 공식 샘플 URL 에서 확인, **컬럼은 미확인**
   *   추정   — 서비스명도 미확인
   */
  confidence: "확실" | "이름확실" | "추정";
  /** 정기 수집에 낄 것인가. 검증 전 서비스는 false 로 둔다. */
  enabled: boolean;
  note: string;
};

export const SERVICES: Record<string, SeoulService> = {
  foreignLong: {
    service: "SPOP_FORN_LONG_RESD_DONG",
    label: "행정동별 서울생활인구(장기체류 외국인)",
    metric: "장기체류외국인",
    args: ["date"],
    confidence: "이름확실",
    enabled: false,
    note:
      "오너가 데이터셋 페이지의 공식 샘플 URL 에서 확인해 준 서비스명이다.\n" +
      "  http://openapi.seoul.go.kr:8088/(인증키)/xml/SPOP_FORN_LONG_RESD_DONG/1/5/20200617//11110515\n" +
      "**컬럼명은 아직 미확인.** 중국/중국외 구분 컬럼이 무엇인지 probe 로 확정한다.\n" +
      "샘플 URL 세 번째 인자가 행정동코드다(11110515). 기준일만 주면 전 행정동이 온다.",
  },

  /* ⚠️ 아래 둘은 **서비스명을 아직 모른다.** 지어내지 않는다 —
     KOSIS 에서 표 ID 를 추측했다가 겪은 일을 여기서 반복하지 않는다.
     데이터셋 페이지의 'Open API [열기]' 탭에서 확인해 채운다. */
  foreignShort: {
    service: "SPOP_FORN_TEMP_RESD_DONG",
    label: "행정동별 서울생활인구(단기체류 외국인)",
    metric: "단기체류외국인",
    args: ["date"],
    confidence: "이름확실",
    enabled: false,
    note:
      "오너가 OA-14993 데이터셋 페이지의 공식 샘플 URL 에서 확인해 준 서비스명이다(2026-08-08).\n" +
      "  http://openapi.seoul.go.kr:8088/(인증키)/xml/SPOP_FORN_TEMP_RESD_DONG/1/5/20200617//11110515\n" +
      "장기체류가 …_LONG_… 인 것과 달리 단기체류는 …_TEMP_… 다(SHORT 아님 — 짐작 안 하길 잘했다).\n" +
      "**컬럼명은 아직 미확인.** probe 로 확정한 뒤 enabled 를 켠다.",
  },
  local: {
    service: "SPOP_LOCAL_RESD_DONG",
    label: "행정동별 서울생활인구(내국인)",
    metric: "내국인",
    args: ["date"],
    confidence: "이름확실",
    enabled: false,
    note:
      "오너가 OA-14991 데이터셋 페이지의 공식 샘플 URL 에서 확인해 준 서비스명이다(2026-08-08).\n" +
      "  http://openapi.seoul.go.kr:8088/(인증키)/xml/SPOP_LOCAL_RESD_DONG/1/5/20200617//11110515\n" +
      "**비율(%)을 만들려면 이게 분모로 반드시 필요하다.** 외국인 데이터만으로는 % 가 안 나온다.\n" +
      "⚠️ 외국인 표의 '총생활인구수' 가 전체 인구인지 외국인 합계인지도 probe 로 확인해야 한다 —\n" +
      "   이걸 착각하면 분모가 바뀌어 비율이 통째로 달라진다. **컬럼 확정 전 enabled 금지.**",
  },
};

export type ServiceKey = keyof typeof SERVICES;

export const enabledServices = (): ServiceKey[] =>
  Object.keys(SERVICES).filter((k) => SERVICES[k].enabled && SERVICES[k].service);

/**
 * **경로에 박힌 인증키를 지운다.**
 *
 * 이 API 는 키가 쿼리스트링이 아니라 경로에 들어가서, http.ts 의 redactUrl 로는 안 지워진다.
 * 2026-08-03 에 KOSIS 키가 오류 메시지를 타고 저장소에 커밋된 사고가 있었다.
 * 같은 사고를 여기서 반복하지 않는다.
 */
export function redactSeoulUrl(url: string): string {
  return String(url).replace(
    /(openapi\.seoul\.go\.kr:\d+\/)[^/]+/i,
    "$1***",
  );
}

function ymd(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Open API 는 최근 2개월만 준다. 공개 지연이 데이터마다 다르다 —
 * 내국인은 3~4일, 외국인 생활인구는 몇 주씩 늦기도 한다(2026-08-08 첫 probe 가
 * 6일 전 날짜로 INFO-200 "데이터 없음"을 맞았다). 그래서 한 날짜만 보지 않고
 * 점점 더 과거로 물러나며 데이터가 있는 첫 날짜를 쓴다. 60일(2개월) 안에서만 고른다. */
export function candidateDates(nowMs: number = Date.now()): string[] {
  return [4, 7, 11, 18, 25, 35, 50].map((days) => ymd(nowMs - days * 86400000));
}

/** 호출 URL. 인자 순서는 서비스마다 다르므로 args 를 따라 붙인다. */
export function buildUrl(
  key: ServiceKey,
  apiKey: string,
  opts: { start: number; end: number; date?: string; dong?: string },
): string {
  const s = SERVICES[key];
  if (!s.service) {
    throw new Error(
      `${key}: 서비스명이 비어 있다. 데이터셋 페이지의 'Open API' 탭에서 확인해 SERVICES 에 채우세요.\n` +
      "   추측한 서비스명을 넣으면 조용히 빈 결과가 오거나 다른 데이터가 온다.",
    );
  }
  if (opts.end - opts.start + 1 > MAX_ROWS) {
    throw new Error(
      `${key}: 한 번에 ${opts.end - opts.start + 1}행을 요청했다. 서울시 API 는 최대 ${MAX_ROWS}행이다.`,
    );
  }
  const tail: string[] = [];
  for (const a of s.args) {
    if (a === "date") tail.push(opts.date ?? "");
    if (a === "dong") tail.push(opts.dong ?? "");
  }
  /* 샘플 URL 이 `/20200617//11110515` 처럼 빈 칸을 남기므로 빈 인자도 그대로 둔다. */
  return `${BASE}/${apiKey}/json/${s.service}/${opts.start}/${opts.end}/${tail.join("/")}`;
}

/**
 * 한 번 호출해 행 배열을 돌려준다.
 *
 * 서울시 API 는 오류도 200 으로 주고 `RESULT.CODE` 에 담는다.
 * `INFO-000` 이 정상이고 나머지는 실패다. 이걸 안 보면 **빈 배열이 "그날 인구가 없었다"로 둔갑한다.**
 */
export async function fetchRows(
  key: ServiceKey,
  apiKey: string,
  opts: { start: number; end: number; date?: string; dong?: string },
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  const url = buildUrl(key, apiKey, opts);
  let text: string;
  try {
    text = await fetchText(url, { timeoutMs: 30000 });
  } catch (e) {
    /* http.ts 가 던지는 메시지에는 경로형 키가 그대로 들어 있다 — 여기서 지운다. */
    throw new Error(redactSeoulUrl(e instanceof Error ? e.message : String(e)));
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`서울시 응답이 JSON 이 아니다(${key}): ${redactSeoulUrl(text.slice(0, 300))}`);
  }

  const o = json as Record<string, unknown>;
  /* 응답 최상위 키가 곧 서비스명이다. 못 찾으면 오류 봉투를 본다. */
  const body = o[SERVICES[key].service] as
    | { list_total_count?: number; RESULT?: { CODE?: string; MESSAGE?: string }; row?: Record<string, unknown>[] }
    | undefined;

  const result = body?.RESULT ?? (o.RESULT as { CODE?: string; MESSAGE?: string } | undefined);
  if (result?.CODE && result.CODE !== "INFO-000") {
    throw new Error(`서울시 API 오류(${key}): ${result.CODE} ${result.MESSAGE ?? ""}`);
  }
  if (!body?.row) {
    throw new Error(
      `서울시 응답에 row 가 없다(${key}). 서비스명이 틀렸거나 그 날짜에 데이터가 없다.\n` +
      `   응답 최상위 키: ${Object.keys(o).join(", ")}`,
    );
  }
  return { rows: body.row, total: Number(body.list_total_count ?? body.row.length) };
}

/**
 * 하루치를 나눠 받아 전부 이어 붙인다.
 *
 * 행정동 약 425개 × 24시간 ≈ 1만 행이라 1,000행 제한에 반드시 걸린다.
 * 한 덩어리라도 실패하면 **던진다** — 일부만 받고 성공한 척하면 그게 곧 오보다.
 */
export async function fetchDay(
  key: ServiceKey,
  apiKey: string,
  date: string,
  onProgress?: (got: number, total: number) => void,
): Promise<Record<string, unknown>[]> {
  const first = await fetchRows(key, apiKey, { start: 1, end: MAX_ROWS, date });
  const all = [...first.rows];
  const total = first.total;
  onProgress?.(all.length, total);

  for (let s = MAX_ROWS + 1; s <= total; s += MAX_ROWS) {
    const e = Math.min(s + MAX_ROWS - 1, total);
    const part = await fetchRows(key, apiKey, { start: s, end: e, date });
    all.push(...part.rows);
    onProgress?.(all.length, total);
  }

  if (all.length !== total) {
    throw new Error(
      `${key} ${date}: ${total}행이라 했는데 ${all.length}행만 받았다. 부분 수집은 순위·합계를 거짓으로 만든다.`,
    );
  }
  return all;
}
