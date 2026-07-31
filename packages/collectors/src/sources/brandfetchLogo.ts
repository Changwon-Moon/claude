/**
 * 로고 자동 취득 Tier C — Brandfetch Brand API.
 * Wikimedia(Tier B)에 없는 회사(비상장·계열사 등)를 도메인으로 조회해 공식 로고를 받는다.
 * BRANDFETCH_API_KEY 필요(GitHub Secrets). Actions에서만 실행(네트워크 필요).
 *
 * 흐름: 회사명 → 알려진 도메인(DOMAIN_MAP) → GET /v2/brands/{domain}
 *      → logos[] 중 최적 자산 선택(logo 타입 · svg · light 테마 우선) → 다운로드.
 * 로고 자체는 해당 회사의 공식 자산이므로 상표 nominative use로 분류한다.
 */
import { fetchText } from "../http.js";

const API = "https://api.brandfetch.io/v2/brands";

/** 회사명 → 공식 도메인 후보(우선순위 순). Tier B(Wikimedia)에서 못 찾은 큐레이션 대상만 등록. */
export const DOMAIN_MAP: Record<string, string[]> = {
  /* 건설사 — Tier A(simple-icons)에도 Tier B(Wikimedia 큐레이션)에도 없어 여기서 받는다.
   * 2026-07-31: 정비사업 카드에 로고가 필요했는데 세 티어가 서로를 미뤄 아무 데서도 안 나왔다.
   * 도메인을 잘못 적으면 **다른 회사 로고가 붙는다** — 취득 후 반드시 눈으로 대조한다. */
  /* 아파트 브랜드 — 카드에는 회사 로고보다 브랜드 로고가 낫다(래미안·자이는 그 자체로 읽힌다).
   * ⚠️ 도메인이 틀리면 **다른 회사 로고가 붙는다.** 취득 후 반드시 눈으로 대조한다.
   *    후보를 여러 개 두는 이유도 그것이다 — 첫 도메인이 빗나가면 다음을 시도한다. */
  "래미안": ["raemian.co.kr"],
  "자이": ["xi.co.kr", "gsconst.co.kr"],
  "푸르지오": ["prugio.com", "prugio.co.kr"],
  "써밋": ["prugiosummit.com", "summit.prugio.com", "daewooenc.com"],
  "더샵": ["thesharp.co.kr", "the-sharp.co.kr"],
  "오티에르": ["oteille.co.kr", "poscoenc.com"],
  "e편한세상": ["pcshomes.com", "eplace.co.kr", "dlenc.co.kr"],
  "아크로": ["acro.co.kr", "acro.dlenc.co.kr"],
  "롯데캐슬": ["lottecastle.co.kr"],
  "르엘": ["leel.co.kr", "le-el.co.kr", "lottecastle.co.kr"],
  "힐스테이트": ["hillstate.co.kr", "hdc-hillstate.co.kr"],
  "디에이치": ["thedh.co.kr", "dh.hdec.co.kr", "hdec.co.kr"],
  "현대건설": ["hdec.co.kr", "hdec.kr"],
  "GS건설": ["gsconst.co.kr", "xi.co.kr"],
  "삼성물산": ["samsungcnt.com", "secc.co.kr"],
  "대우건설": ["daewooenc.com"],
  "롯데건설": ["lottecon.co.kr"],
  "포스코이앤씨": ["poscoenc.com"],
  "DL이앤씨": ["dlenc.co.kr"],
  "SK에코플랜트": ["skecoplant.com", "sk-eco.com"],
  "포스코인터내셔널": ["poscointl.com"],
  "삼성바이오로직스": ["samsungbiologics.com"],
  "HD한국조선해양": ["ksoe.co.kr", "hd-ksoe.co.kr", "hdksoe.co.kr", "hyundai-ksoe.co.kr"],
};

interface LogoFormat {
  src: string;
  format: string; // "svg" | "png" | ...
  width?: number;
  height?: number;
}
interface LogoAsset {
  type: string; // "logo" | "icon" | "symbol"
  theme?: string; // "light" | "dark"
  formats: LogoFormat[];
}

/** Brand API 응답 JSON → 로고 자산 배열(없으면 빈 배열) */
export function parseBrandLogos(json: string): LogoAsset[] {
  const data = JSON.parse(json);
  return Array.isArray(data.logos) ? data.logos : [];
}

/** 로고 자산 목록 중 최적 1개 선택: logo>symbol>icon, svg>png, light>dark(무테마 포함) */
export function pickBestLogoFormat(logos: LogoAsset[]): LogoFormat | null {
  const typeScore = (t: string): number => (t === "logo" ? 3 : t === "symbol" ? 2 : t === "icon" ? 1 : 0);
  const themeScore = (t?: string): number => (t === "light" || !t ? 2 : t === "dark" ? 1 : 0);

  let best: { fmt: LogoFormat; score: number } | null = null;
  for (const asset of logos) {
    for (const fmt of asset.formats ?? []) {
      if (!/^(svg|png)$/i.test(fmt.format)) continue;
      let score = typeScore(asset.type) * 10 + themeScore(asset.theme) * 3;
      if (fmt.format.toLowerCase() === "svg") score += 5;
      if (!best || score > best.score) best = { fmt, score };
    }
  }
  return best ? best.fmt : null;
}

/* ⚠️ JS 정규식의 `\w` 는 [A-Za-z0-9_] 라 **한글이 통째로 지워진다.**
 * 그래서 '래미안'·'자이'·'푸르지오'가 전부 빈 문자열 → 기본값 "logo" 가 되어
 * 6개 로고가 같은 파일명으로 **서로를 덮어썼다**(2026-07-31).
 * 래미안 자리에 아크로가 붙는 사고는 오보와 다르지 않다.
 *
 * 그래서 도메인을 슬러그의 근간으로 쓴다 — raemian.co.kr → raemian.
 * 도메인은 회사마다 유일하고 영문이라 안전하며, 사람이 봐도 어느 회사인지 읽힌다. */
function slugFromDomain(domain: string): string {
  return domain.split(".")[0].replace(/[^a-z0-9-]/gi, "").toLowerCase();
}
function slugify(name: string, domain?: string): string {
  const ascii = name.replace(/\s+/g, "-").replace(/[^A-Za-z0-9-]/g, "").toLowerCase();
  if (ascii) return ascii;
  if (domain) return slugFromDomain(domain);
  throw new Error(`슬러그를 만들 수 없습니다: "${name}" — 도메인이 필요합니다`);
}

export interface FetchedBrandLogo {
  slug: string;
  ext: "svg" | "png";
  bytes: Uint8Array;
  domain: string;
}

/** 도메인 하나에 대해 Brand API 조회 + 최적 로고 다운로드 시도. 실패하면 null. */
async function tryDomain(domain: string, apiKey: string): Promise<{ bytes: Uint8Array; ext: "svg" | "png" } | null> {
  const url = `${API}/${encodeURIComponent(domain)}`;
  let json: string;
  try {
    json = await fetchText(url, {
      retries: 1,
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch {
    return null;
  }
  const best = pickBestLogoFormat(parseBrandLogos(json));
  if (!best) return null;

  const res = await fetch(best.src, { headers: { "User-Agent": "wirit-collector/0.1" } });
  if (!res.ok) return null;
  const bytes = new Uint8Array(await res.arrayBuffer());
  const ext: "svg" | "png" = best.format.toLowerCase() === "svg" ? "svg" : "png";
  return { bytes, ext };
}

/** 회사명 → Brandfetch 로고 취득(성공 시). 도메인 후보를 순서대로 시도, 큐레이션 없거나 전부 실패하면 null. */
export async function fetchBrandfetchLogo(
  company: string,
  apiKey: string,
  domainOverrides?: string[]
): Promise<FetchedBrandLogo | null> {
  const domains = domainOverrides ?? DOMAIN_MAP[company];
  if (!domains?.length) return null;

  for (const domain of domains) {
    const found = await tryDomain(domain, apiKey);
    if (found) return { slug: slugify(company, domain), ext: found.ext, bytes: found.bytes, domain };
  }
  return null;
}
