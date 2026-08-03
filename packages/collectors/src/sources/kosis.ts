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
 * ⚠️ **표 ID 를 세션에서 원문 대조하지 못했다.** kosis.kr 본문이 robots 로 막혀 있어
 *    검색결과에 노출된 표 제목까지만 확인됐다. 그래서 표마다 `confidence` 를 적어 두고,
 *    `--probe` 로 **첫 실제 호출에서 스스로 검증**한다(응답의 통계표명·항목코드를 받아 적는다).
 *    `enabled: false` 인 표는 검증 전까지 정기 수집에 끼지 않는다 —
 *    확인 안 된 표에서 뽑은 숫자가 카드에 올라가는 것이 이 회사에서 가장 위험한 일이다.
 */

export type TableSpec = {
  orgId: string;
  tblId: string;
  label: string;
  /** 우리가 이 표에서 뽑는 값의 이름. 신호·카드가 이 이름으로 부른다. */
  metric: string;
  /** 항목 코드. "ALL" 이면 전부 받아 온다(어떤 항목이 있는지 모를 때). */
  itmId: string;
  objL1: string;
  objL2: string;
  /** 수록 주기 — 월간이 있으면 M, 연간뿐이면 Y */
  prdSe: "M" | "Y";
  /**
   * 얼마나 확인됐나.
   *   확실     — 표 제목 + 항목코드까지 실동작 사례로 확인
   *   표명확실 — 표 제목은 확인, 항목코드·분류축은 미확인
   *   추정     — 제목도 간접 확인
   */
  confidence: "확실" | "표명확실" | "추정";
  /** 정기 수집에 낄 것인가. 검증 전 표는 false 로 둔다. */
  enabled: boolean;
  /** 왜 이 표를 쓰나 / 무엇이 아직 확인 안 됐나 */
  note: string;
};

export const TABLES: Record<string, TableSpec> = {
  population: {
    orgId: "101", tblId: "DT_1B040A3", label: "행정구역(시군구)별 성별 인구수",
    metric: "인구", itmId: "T20", objL1: "ALL", objL2: "", prdSe: "M",
    confidence: "확실", enabled: true,
    note: "T20=총인구수 까지 실동작 사례로 확인. objL2=성별(계).",
  },
  households: {
    orgId: "101", tblId: "DT_1B040B3", label: "행정구역(시군구)별 주민등록세대수",
    metric: "세대수", itmId: "ALL", objL1: "ALL", objL2: "", prdSe: "M",
    confidence: "표명확실", enabled: false,
    note: "표 제목·수록주기(월·년, 1992~)는 확인. **항목코드 미확인** → probe 로 확정한다. " +
      "세대당 인구는 이 표의 항목을 쓰지 않고 인구÷세대수로 우리가 계산한다(전용 항목이 있는지 확인 못 했다).",
  },
  migration: {
    orgId: "101", tblId: "DT_1B26001_A01", label: "시군구별 이동자수(국내인구이동)",
    metric: "이동", itmId: "ALL", objL1: "ALL", objL2: "", prdSe: "Y",
    confidence: "표명확실", enabled: false,
    note: "시군구 5자리 코드로 실제 호출된 URL 이 확인됐다(objL1=11110+11140+…). " +
      "**항목코드 미확인**(T25 하나만 실물 관측, 라벨 모름). 월간 지원 여부도 미확인 → 연간으로 시작. " +
      "총전입·총전출·순이동 구성으로 추정되며, 순이동은 우리가 전입-전출로 다시 계산한다.",
  },
  age: {
    orgId: "101", tblId: "DT_1B04006", label: "행정구역(시군구)별/1세별 주민등록인구",
    metric: "연령", itmId: "ALL", objL1: "ALL", objL2: "", prdSe: "M",
    confidence: "표명확실", enabled: false,
    note: "1세 단위 원자료 → 65세이상 비율·중위연령을 우리가 직접 계산한다(지표표를 받아 적지 않는다). " +
      "**분류축·항목코드·주기 미확인** → probe 로 확정. 응답이 크므로 확정 뒤 축을 좁힌다.",
  },
  births: {
    orgId: "101", tblId: "DT_1B81A03", label: "시군구/성/출산순위별 출생",
    metric: "출생", itmId: "ALL", objL1: "ALL", objL2: "", prdSe: "Y",
    confidence: "표명확실", enabled: false,
    note: "인구동향조사(연간). **분류축·항목코드 미확인.** " +
      "월간 인구동향표(DT_1B8000G)는 시군구까지 내려가는지 확인 못 해 쓰지 않는다.",
  },
  deaths: {
    orgId: "101", tblId: "DT_1B34E13", label: "시군구/사망원인별 사망자수",
    metric: "사망", itmId: "ALL", objL1: "ALL", objL2: "", prdSe: "Y",
    confidence: "표명확실", enabled: false,
    note: "사망원인통계(연간). 사망원인 분류축의 '계'를 뽑아야 총사망자수가 된다 — " +
      "**축 구성 미확인이라 probe 없이 쓰면 특정 사인의 숫자를 총사망자수로 낼 위험이 있다.** " +
      "시군구 단위 순수 사망자수 전용표는 찾지 못했다.",
  },
};

export type TableKey = keyof typeof TABLES;

/** 정기 수집에 낄 표 */
export const enabledTables = (): TableKey[] =>
  Object.keys(TABLES).filter((k) => TABLES[k].enabled);

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
  opts: { prdSe?: "M" | "Y"; startPrdDe?: string; endPrdDe?: string; newEstPrdCnt?: number },
): string {
  const t = TABLES[table];
  const p = new URLSearchParams({
    method: "getList",
    apiKey: "__KEY__", // 아래에서 직접 갈아끼운다(URLSearchParams 가 키를 이중 인코딩하지 않도록)
    itmId: t.itmId,
    objL1: t.objL1,
    format: "json",
    jsonVD: "Y",
    prdSe: opts.prdSe ?? t.prdSe,
    orgId: t.orgId,
    tblId: t.tblId,
  });
  /* 기간은 둘 중 하나로 준다 — 범위(startPrdDe~endPrdDe) 또는 최근 N개(newEstPrdCnt).
     probe 는 최근 1개만 받아 응답 모양만 본다(전 기간을 받으면 수십 MB 가 된다). */
  if (opts.newEstPrdCnt) p.set("newEstPrdCnt", String(opts.newEstPrdCnt));
  else {
    p.set("startPrdDe", opts.startPrdDe ?? "");
    p.set("endPrdDe", opts.endPrdDe ?? "");
  }
  return `${BASE}?${p.toString()}`.replace("__KEY__", encKey(key));
}

/** KOSIS 한 표를 통째로 읽는다. 페이지 개념이 없고 기간으로 자른다. */
export async function fetchTable(
  table: TableKey,
  key: string,
  opts: { prdSe?: "M" | "Y"; startPrdDe?: string; endPrdDe?: string; newEstPrdCnt?: number },
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
