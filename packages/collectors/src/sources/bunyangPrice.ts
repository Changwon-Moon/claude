/**
 * 청약홈 **APT 주택형별 분양정보** 수집 — 분양가(공급금액)의 1차 출처.
 *
 * 우리가 매일 쓰는 `ApplyhomeInfoDetailSvc`(15098547)에는 **분양가가 없다.**
 * 실제 오퍼레이션은 다섯 개(APT·오피스텔·무순위·공공지원민간임대·도시형)뿐이고
 * 주택형별 금액을 주는 갈래가 없다. 분양가는 **별도 데이터셋 두 개**에 있다:
 *
 *   · 15101047 「APT 주택형별 분양정보」 — 주택관리번호 · 주택형 · 공급면적 · **공급금액(만원)**
 *   · 15101046 「APT 분양정보」        — 주택관리번호 · 주택명 · 공급위치 (이름을 붙이는 쪽)
 *
 * 둘 다 **파일데이터를 오픈API 로 자동변환**한 것이라 주소 모양이 다르다(`/api/{id}/v1/uddi:...`).
 * 활용신청도 따로다 — 청약홈 조회 서비스가 승인돼 있어도 이 둘은 별개다.
 *
 * ⚠️ **연 1회 갱신이다**(마지막 2025-11-28, 차기 2026-11-28). 즉 2026년 공고의 분양가는
 * 여기 없다. 2025년 이전 분양분(=지금 입주가 남은 분양권 대부분)에는 쓸 수 있다.
 * 최신 공고의 분양가는 여전히 입주자모집공고문 대조가 정본이다.
 *
 * ⚠️ 그리고 이 값은 **「분양최고금액」**이다 — 그 타입에서 가장 비싼 층의 값.
 * 프리미엄을 여기서 빼면 **실제보다 작게** 나온다. 그게 오히려 안전한 방향이고
 * (오너 판단 08-26 「최저호가를 쓰는 게 더 강한 말」과 같은 결), 카드에는 그 사실을 적는다.
 */
import { fetchText } from "../http.js";

const BASE = "https://api.odcloud.kr/api";

/** 파일데이터 오픈API 는 데이터셋마다 uddi 가 붙는다. 추측하지 않는다 — 포털 화면에서 확인한 값. */
export const DATASETS = {
  /** 주택형별: 주택관리번호·주택형·공급면적·공급금액(만원) */
  price: { id: "15101047", uddi: "uddi:69236f4f-13ff-4ecb-a429-ed5398f2b459", label: "APT 주택형별 분양정보" },
} as const;

export type DatasetKey = keyof typeof DATASETS;

/** `%XX` 를 되돌린 디코딩 키 — 헤더 인증(`Authorization: Infuser`)은 인코딩된 값을 안 받는다. */
export function decKey(key: string): string {
  if (!/%[0-9A-Fa-f]{2}/.test(key)) return key;
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}

/** 이미 인코딩된 키를 다시 인코딩하지 않는다. */
export function encKey(key: string): string {
  return /%[0-9A-Fa-f]{2}/.test(key) ? key : encodeURIComponent(key);
}

export type AuthMode = "header" | "query";
export const AUTH_MODES: AuthMode[] = ["header", "query"];

export function requestFor(
  mode: AuthMode,
  ds: DatasetKey,
  key: string,
  page: number,
  perPage: number,
): { url: string; headers?: Record<string, string> } {
  const { id, uddi } = DATASETS[ds];
  const path = `${BASE}/${id}/v1/${uddi}?page=${page}&perPage=${perPage}`;
  return mode === "header"
    ? { url: path, headers: { Authorization: `Infuser ${decKey(key)}` } }
    : { url: `${path}&serviceKey=${encKey(key)}` };
}

export interface OdcloudEnvelope {
  currentCount?: number;
  data?: Record<string, unknown>[];
  page?: number;
  perPage?: number;
  totalCount?: number;
  code?: string;
  msg?: string;
}

/**
 * 한 데이터셋을 페이지 끝까지 읽는다.
 * 인증 방식은 **첫 페이지에서 한 번만** 정한다(청약홈 수집기와 같은 이유 — 호출이 배로 늘지 않게).
 */
export async function fetchDataset(
  ds: DatasetKey,
  key: string,
  opts: { perPage?: number; maxPages?: number; mode?: AuthMode } = {},
): Promise<{ rows: Record<string, unknown>[]; mode: AuthMode; totalCount: number }> {
  const perPage = opts.perPage ?? 1000;
  const maxPages = opts.maxPages ?? 40;
  const rows: Record<string, unknown>[] = [];

  let mode: AuthMode | null = opts.mode ?? null;
  if (!mode) {
    const errs: string[] = [];
    for (const m of AUTH_MODES) {
      const r = requestFor(m, ds, key, 1, 1);
      try {
        await fetchText(r.url, { timeoutMs: 20000, retries: 0, headers: r.headers });
        mode = m;
        console.log(`   🔑 ${DATASETS[ds].label} 인증: ${m === "header" ? "Authorization 헤더" : "serviceKey 쿼리"}`);
        break;
      } catch (e) {
        errs.push(`${m}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    if (!mode) {
      throw new Error(
        `${DATASETS[ds].label} 인증이 두 방식 모두 거부됐습니다 — ${errs.join(" | ")}\n` +
          `   ↳ 401/403 이면 키가 아니라 **활용신청**을 먼저 보세요.\n` +
          `      https://www.data.go.kr/data/${DATASETS[ds].id}/fileData.do 는 청약홈 조회 서비스(15098547)와 **별개 승인**입니다.`,
      );
    }
  }

  let totalCount = 0;
  for (let page = 1; page <= maxPages; page++) {
    const req = requestFor(mode, ds, key, page, perPage);
    const text = await fetchText(req.url, { timeoutMs: 20000, headers: req.headers });
    let env: OdcloudEnvelope;
    try {
      env = JSON.parse(text);
    } catch {
      throw new Error(`${DATASETS[ds].label} 응답이 JSON 이 아니다(page ${page}): ${text.slice(0, 200)}`);
    }
    if (env.code || env.msg) throw new Error(`${DATASETS[ds].label} API 오류: ${env.code ?? ""} ${env.msg ?? ""}`);
    const data = Array.isArray(env.data) ? env.data : [];
    rows.push(...data);
    totalCount = Number(env.totalCount ?? 0);
    if (!data.length || rows.length >= totalCount) break;
  }
  return { rows, mode, totalCount };
}
