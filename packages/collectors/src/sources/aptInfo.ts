/**
 * 국토교통부 공동주택 단지 목록 · 기본 정보 수집 (네트워크·키 필요 → GitHub Actions).
 *
 * 두 서비스를 쓴다(공공데이터포털, 무료 — 각각 활용신청 필요):
 *   · 공동주택 단지 목록제공 서비스   AptListService3/getSigunguAptList   (시군구 → 단지 목록)
 *   · 공동주택 기본 정보제공 서비스   AptBasisInfoServiceV3/getAphusBassInfoV3 (단지 → 세대수)
 *
 * 키는 실거래와 같은 공공데이터포털 인증키를 쓴다(MOLIT_API_KEY / DATA_GO_KR_API_KEY 중 있는 것).
 * 다만 **서비스별 활용신청은 따로**다 — 신청 안 하면 SERVICE_KEY_IS_NOT_REGISTERED 가 난다.
 */
import { encKey } from "./molit.js";
import { apiError } from "../parse/molit.js";
import { parseAptList, parseAptBasis, type AptListItem, type AptBasis } from "../parse/aptInfo.js";

const HOST = "https://apis.data.go.kr/1613000";
const LIST_URL = `${HOST}/AptListService3/getSigunguAptList`;
const BASIS_URL = `${HOST}/AptBasisInfoServiceV3/getAphusBassInfoV3`;

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
    if (status === 401 || status === 403) break;
    await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
  }
  throw new Error(last || "요청 실패");
}

/** 시군구코드(5자리) → 그 시군구의 공동주택 단지 목록 전건 */
export async function fetchAptList(sigunguCode: string, key: string): Promise<AptListItem[]> {
  const out: AptListItem[] = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${LIST_URL}?serviceKey=${encKey(key)}&sigunguCode=${sigunguCode}&pageNo=${page}&numOfRows=500&_type=xml`;
    const xml = await getXml(url);
    const items = parseAptList(xml);
    out.push(...items);
    if (items.length < 500) break;
  }
  return out;
}

/** 단지코드 → 기본 정보(세대수). 응답이 비면 null */
export async function fetchAptBasis(kaptCode: string, key: string): Promise<AptBasis | null> {
  const url = `${BASIS_URL}?serviceKey=${encKey(key)}&kaptCode=${kaptCode}&_type=xml`;
  return parseAptBasis(await getXml(url));
}
