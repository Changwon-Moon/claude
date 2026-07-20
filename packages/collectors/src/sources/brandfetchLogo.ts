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

/** 회사명 → 공식 도메인. Tier B(Wikimedia)에서 못 찾은 큐레이션 대상만 등록. */
export const DOMAIN_MAP: Record<string, string> = {
  "포스코인터내셔널": "poscointl.com",
  "삼성바이오로직스": "samsungbiologics.com",
  "HD한국조선해양": "ksoe.co.kr",
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

function slugify(name: string): string {
  return name.replace(/\s+/g, "-").replace(/[^\w-]/g, "").toLowerCase() || "logo";
}

export interface FetchedBrandLogo {
  slug: string;
  ext: "svg" | "png";
  bytes: Uint8Array;
  domain: string;
}

/** 회사명 → Brandfetch 로고 취득(성공 시). 큐레이션 도메인 없거나 실패하면 null. */
export async function fetchBrandfetchLogo(
  company: string,
  apiKey: string,
  domainOverride?: string
): Promise<FetchedBrandLogo | null> {
  const domain = domainOverride ?? DOMAIN_MAP[company];
  if (!domain) return null;

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
  const logos = parseBrandLogos(json);
  const best = pickBestLogoFormat(logos);
  if (!best) return null;

  const res = await fetch(best.src, { headers: { "User-Agent": "wirit-collector/0.1" } });
  if (!res.ok) return null;
  const bytes = new Uint8Array(await res.arrayBuffer());
  const ext: "svg" | "png" = best.format.toLowerCase() === "svg" ? "svg" : "png";
  return { slug: slugify(company), ext, bytes, domain };
}
