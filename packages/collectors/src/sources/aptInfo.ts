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
import {
  parseAptList,
  parseAptBasis,
  parseAptDetail,
  type AptListItem,
  type AptBasis,
  type AptDetail,
} from "../parse/aptInfo.js";

const HOST = "https://apis.data.go.kr/1613000";

/**
 * 시군구 단지목록 — **`AptListService3/getSigunguAptList3` 로 확정**(2026-08-12 실측 성공,
 * 서울·경기 61곳 8,062 단지 수신). 아래 후보는 포털이 판을 올릴 때를 위한 대비다.
 */
const LIST_OPS = [
  "AptListService3/getSigunguAptList3",
  "AptListService3/getSigunguAptList",
  "AptListService3/getTotalAptList3",
  "AptListService2/getSigunguAptList",
];

/**
 * 단지 기본정보(세대수) — **`AptBasisInfoServiceV4/getAphusBassInfoV4` 로 확정**(2026-08-12 실측).
 * 처음에 V3 로 찍었다가 61개 지역 전부 "해당 오픈API 서비스가 없거나 폐기됨"을 맞았다.
 */
const BASIS_OPS = [
  "AptBasisInfoServiceV4/getAphusBassInfoV4",
  "AptBasisInfoServiceV4/getAphusBassInfoV3",
  "AptBasisInfoServiceV3/getAphusBassInfoV3",
  "AptBasisInfoServiceV2/getAphusBassInfoV2",
];

/**
 * 단지 **상세**정보(주차대수) — 기본정보와 **다른 오퍼레이션**이다.
 * `kaptdPcnt`(지상)·`kaptdPcntu`(지하) 는 기본정보에 없다(2026-08-16 확인).
 * 이름 규칙은 기본정보와 같은 판올림을 타므로 후보를 같은 방식으로 둔다.
 */
const DTL_OPS = [
  "AptBasisInfoServiceV4/getAphusDtlInfoV4",
  "AptBasisInfoServiceV4/getAphusDtlInfoV3",
  "AptBasisInfoServiceV3/getAphusDtlInfoV3",
  "AptBasisInfoServiceV2/getAphusDtlInfoV2",
];

/** 한 번 고른 살아 있는 이름은 기억해 다시 안 뒤진다 */
let listOp = "";
let basisOp = "";
let dtlOp = "";

/** 이 실행에서 실제로 쓴 오퍼레이션 이름 — 로그에 남기려고 밖에서 읽는다 */
export function chosenOps(): { list: string; basis: string; dtl: string } {
  return { list: listOp, basis: basisOp, dtl: dtlOp };
}

/**
 * ⚠️ `fetch failed` 는 **아무것도 말해 주지 않는다.**
 * 2026-08-12 에 61개 지역 전부 이 한 줄만 남기고 죽었는데, undici 는 진짜 이유를
 * `err.cause` 에 숨겨 둔다(ECONNRESET·ENOTFOUND·TLS…). 그래서 여기서 꺼내 붙인다 —
 * **로그가 원인을 안 말하면 다음 사람이 추측으로 고치게 된다.**
 * 망 오류는 잠깐 그런 것일 수 있어 짧게 두 번 더 시도한다(400·403 은 재시도해도 같다).
 */
/**
 * ── 실측으로 확정된 것 (2026-08-12)
 * 실패는 `UND_ERR_CONNECT_TIMEOUT · apis.data.go.kr:443` — **연결 자체가 안 열린다.**
 * 응답이 늦은 게 아니라 문이 닫혀 있는 것이고, **초 단위 재시도로는 못 넘는다.**
 * (같은 실행에서 실거래 수집은 같은 호스트로 잘 붙고 있었다 — 서비스별·시간대별로 닫힌다.)
 *
 * 그래서 **분 단위로 기다린다.** KOSIS 에서 같은 성질을 먼저 겪고 같은 처방을 썼다
 * (`kosisSearchCli` 의 "문이 열릴 때까지 최대 8회 × 60초").
 *
 * 그리고 **`fetch failed` 한 줄로는 아무것도 못 가른다.** undici 는 연결 끊김·TLS·DNS 를
 * 전부 그 한 줄로 말하므로 `err.cause` 를 꺼내 붙인다 — 로그가 원인을 안 말하면
 * 다음 사람이 추측으로 고치게 된다.
 */
const NET_TRIES = 6;
const NET_WAIT_MS = 60_000;

async function get(url: string, timeoutMs = 20000): Promise<{ status: number; body: string }> {
  let last = "";
  for (let attempt = 0; attempt < NET_TRIES; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "wirit-collector/0.1" } });
      return { status: res.status, body: await res.text() };
    } catch (e) {
      const cause = (e as any)?.cause;
      const why = [cause?.code, cause?.message, (e as Error)?.message].filter(Boolean).join(" · ");
      last = `망 오류: ${why || String(e)}`;
      if (attempt < NET_TRIES - 1) {
        console.warn(`   ⏸ ${last}\n     문이 닫힌 것으로 보고 ${NET_WAIT_MS / 1000}초 기다립니다 (${attempt + 1}/${NET_TRIES - 1})`);
        await new Promise((r) => setTimeout(r, NET_WAIT_MS));
      }
    } finally {
      clearTimeout(t);
    }
  }
  throw new Error(`${last} — ${NET_TRIES}번(약 ${Math.round(((NET_TRIES - 1) * NET_WAIT_MS) / 60000)}분) 시도했습니다`);
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

/** 단지코드 → 상세 정보(주차대수). 지상·지하가 둘 다 0이면 null(0대는 있을 수 없다) */
export async function fetchAptDetail(kaptCode: string, key: string): Promise<AptDetail | null> {
  const url = (op: string) => `${HOST}/${op}?serviceKey=${encKey(key)}&kaptCode=${kaptCode}&_type=json`;
  const xml = dtlOp
    ? await getXml(url(dtlOp))
    : await pickOp(DTL_OPS, url, (op) => { dtlOp = op; });
  return parseAptDetail(xml);
}
