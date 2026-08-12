/**
 * 국토교통부 공동주택 단지 목록 · 기본 정보 수집 (네트워크·키 필요 → GitHub Actions).
 *
 * 두 서비스를 쓴다(공공데이터포털, 무료 — 각각 활용신청 필요. 2026-08-12 오너 확인 완료):
 *   · 공동주택 단지 목록제공 서비스   (시군구 → 단지 목록)
 *   · 공동주택 기본 정보제공 서비스   (단지 → 세대수)
 *
 * ── ⚠️ 오퍼레이션 이름을 못박지 않는다 (2026-08-12 사고)
 * `AptListService3/getSigunguAptList` 로 못박았다가 61개 지역 전부
 * **`NO_OPENAPI_SERVICE_ERROR`(해당 오픈API 서비스가 없거나 폐기됨)** 를 맞았다.
 * 이 서비스는 판올림 때 **서비스명과 오퍼레이션명에 붙는 숫자·V 표기가 같이 바뀐다**
 * (getSigunguAptList → getSigunguAptList3 …). 세션은 data.go.kr 이 egress 허용목록 밖이라
 * 어느 이름이 사는지 **여기서 찔러볼 수 없다.**
 *
 * 그래서 후보를 순서대로 시도해 **처음으로 살아 있는 이름을 골라 그 뒤로 계속 쓴다.**
 * 실거래 수집기가 상세→기본 엔드포인트를 자동 선택하는 것과 같은 방식이다.
 * 어느 이름이 살았는지는 로그에 찍어 남긴다 — 다음 사람이 추측하지 않게.
 */
import { encKey } from "./molit.js";
import { apiError } from "../parse/molit.js";
import { parseAptList, parseAptBasis, type AptListItem, type AptBasis } from "../parse/aptInfo.js";

const HOST = "https://apis.data.go.kr/1613000";

/**
 * 시군구 단지목록 후보 — 새 판부터 옛 판 순.
 * 서비스 경로는 오너가 포털에서 확인해 줬다(2026-08-12): `.../1613000/AptListService3`.
 * 남은 미지는 **오퍼레이션 이름**뿐이라 그 후보만 돈다.
 */
const LIST_OPS = [
  "AptListService3/getSigunguAptList3",
  "AptListService3/getSigunguAptList",
  "AptListService3/getTotalAptList3",
  "AptListService2/getSigunguAptList",
];

/**
 * 단지 기본정보(세대수) 후보 — 오너 확인: `.../1613000/AptBasisInfoServiceV4` (**V4**).
 * 처음에 V3 로 찍었다가 61개 지역 전부 "해당 오픈API 서비스가 없거나 폐기됨"을 맞았다.
 */
const BASIS_OPS = [
  "AptBasisInfoServiceV4/getAphusBassInfoV4",
  "AptBasisInfoServiceV4/getAphusBassInfoV3",
  "AptBasisInfoServiceV3/getAphusBassInfoV3",
  "AptBasisInfoServiceV2/getAphusBassInfoV2",
];

/** 한 번 고른 살아 있는 이름은 기억해 다시 안 뒤진다 */
let listOp = "";
let basisOp = "";

/** 이 실행에서 실제로 쓴 오퍼레이션 이름 — 로그에 남기려고 밖에서 읽는다 */
export function chosenOps(): { list: string; basis: string } {
  return { list: listOp, basis: basisOp };
}

async function get(url: string, timeoutMs = 15000): Promise<{ status: number; body: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "wirit-collector/0.1" } });
    return { status: res.status, body: await res.text() };
  } finally {
    clearTimeout(t);
  }
}

/** 이 응답이 "그런 서비스 없음"인가 — 이때만 다음 후보로 넘어간다(키·한도 문제와 구분) */
function noSuchService(body: string): boolean {
  return /NO_OPENAPI_SERVICE_ERROR|폐기/.test(body);
}

async function getXml(url: string): Promise<string> {
  let last = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const { status, body } = await get(url);
    if (status === 200) {
      const err = apiError(body);
      if (err) throw new Error(`API본문오류: ${err}`);
      return body;
    }
    last = `HTTP ${status}${body ? " · " + body.replace(/\s+/g, " ").slice(0, 160) : ""}`;
    if (status === 400 || status === 401 || status === 403) break; // 재시도해도 같다
    await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
  }
  throw new Error(last || "요청 실패");
}

/**
 * 후보를 돌며 살아 있는 오퍼레이션을 고른다.
 * "그런 서비스 없음"일 때만 다음 후보로 넘어가고, 키·한도 오류는 **그대로 던진다**
 * (그건 이름 문제가 아니라 권한 문제인데, 후보를 계속 돌면 원인이 가려진다).
 */
async function pickOp(ops: string[], build: (op: string) => string, remember: (op: string) => void): Promise<string> {
  const tried: string[] = [];
  for (const op of ops) {
    const { status, body } = await get(build(op));
    if (status === 200 && !apiError(body)) { remember(op); return body; }
    if (status === 200 || !noSuchService(body)) {
      const err = apiError(body) || `HTTP ${status} · ${body.replace(/\s+/g, " ").slice(0, 160)}`;
      throw new Error(`${op}: ${err}`);
    }
    tried.push(op);
  }
  throw new Error(`살아 있는 오퍼레이션이 없습니다 — 시도: ${tried.join(", ")} · 공공데이터포털에서 서비스 URL 을 확인하세요`);
}

/** 시군구코드(5자리) → 그 시군구의 공동주택 단지 목록 전건 */
export async function fetchAptList(sigunguCode: string, key: string): Promise<AptListItem[]> {
  const url = (op: string, page: number) =>
    `${HOST}/${op}?serviceKey=${encKey(key)}&sigunguCode=${sigunguCode}&pageNo=${page}&numOfRows=500&_type=json`;

  const out: AptListItem[] = [];
  let first: string;
  if (listOp) first = await getXml(url(listOp, 1));
  else first = await pickOp(LIST_OPS, (op) => url(op, 1), (op) => { listOp = op; });

  out.push(...parseAptList(first));
  if (out.length < 500) return out;
  for (let page = 2; page <= 20; page++) {
    const items = parseAptList(await getXml(url(listOp, page)));
    out.push(...items);
    if (items.length < 500) break;
  }
  return out;
}

/** 단지코드 → 기본 정보(세대수). 응답이 비면 null */
export async function fetchAptBasis(kaptCode: string, key: string): Promise<AptBasis | null> {
  const url = (op: string) => `${HOST}/${op}?serviceKey=${encKey(key)}&kaptCode=${kaptCode}&_type=json`;
  const xml = basisOp
    ? await getXml(url(basisOp))
    : await pickOp(BASIS_OPS, url, (op) => { basisOp = op; });
  return parseAptBasis(xml);
}
