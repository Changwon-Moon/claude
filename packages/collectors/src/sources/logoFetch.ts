/**
 * 로고 자동 취득 (Tier B) — Wikimedia Commons.
 * 키 불필요. GitHub Actions(네트워크 개방)에서 실행. 라이선스가 명시된 로고만 취득한다.
 *
 * 흐름: 검색(list=search, 파일 네임스페이스) → 최적 파일 선택(svg·logo 우선)
 *      → imageinfo+extmetadata(URL·라이선스) → 라이선스 안전성 검사 → 다운로드.
 *
 * 파서(parse*)는 순수 함수라 네트워크 없이 셀프테스트한다. 네트워크는 fetchCompanyLogo에만.
 * 법적: 로고는 상표(nominative use). Commons의 라이선스 태그(PD-textlogo·CC·PD 등)를 catalog에 기록.
 */
import { fetchText } from "../http.js";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

/** 회사명 → Commons 검색어(정확도↑)와 저장 slug. 여기 없으면 이름 그대로 검색 */
export const COMPANY_QUERIES: Record<string, { query: string; slug: string }> = {
  "SK하이닉스": { query: "SK hynix logo", slug: "skhynix" },
  "한화에어로스페이스": { query: "Hanwha Aerospace logo", slug: "hanwha-aerospace" },
  HMM: { query: "HMM company logo", slug: "hmm" },
  "포스코인터내셔널": { query: "POSCO International logo", slug: "posco-international" },
  "삼성바이오로직스": { query: "Samsung Biologics logo", slug: "samsung-biologics" },
  "HD현대일렉트릭": { query: "HD Hyundai Electric logo", slug: "hd-hyundai-electric" },
  "HD한국조선해양": { query: "Korea Shipbuilding Offshore Engineering logo", slug: "hd-ksoe" },
};

/** 라이선스 안전 판정: 로고 파일에 흔한 자유/퍼블릭/텍스트로고만 허용. 불명·비자유는 거부. */
export function isLicenseSafe(license: string): boolean {
  const s = (license || "").toLowerCase();
  if (!s) return false;
  // 명백히 비자유면 거부
  if (/non-?free|fair use|copyright(ed)?\b(?!.*text)/.test(s)) return false;
  return /public domain|pd-?textlogo|pd-?text|creative commons|\bcc[ -]|cc0|trademark/.test(s);
}

/** list=search 응답 → File: 제목 배열 */
export function parseCommonsSearch(json: string): string[] {
  const data = JSON.parse(json);
  const hits = data?.query?.search ?? [];
  return hits.map((h: any) => h.title as string).filter(Boolean);
}

/** 후보 파일 중 최적 선택: svg > png, 파일명에 'logo' 포함 우선, 'icon'·사진류 회피 */
export function pickBestFile(titles: string[]): string | null {
  const scored = titles
    .filter((t) => /\.(svg|png)$/i.test(t))
    .map((t) => {
      const lower = t.toLowerCase();
      let score = 0;
      if (lower.endsWith(".svg")) score += 10;
      if (lower.includes("logo")) score += 5;
      if (lower.includes("wordmark")) score += 3;
      if (/photo|building|headquarter|ceo|store/.test(lower)) score -= 20;
      return { t, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.length ? scored[0].t : null;
}

/** imageinfo 응답 → {url, mime, license} (없으면 null) */
export function parseImageInfo(json: string): { url: string; mime: string; license: string } | null {
  const data = JSON.parse(json);
  const pages = data?.query?.pages ?? {};
  const page: any = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url) return null;
  const meta = info.extmetadata ?? {};
  const license =
    meta.LicenseShortName?.value ||
    meta.License?.value ||
    meta.UsageTerms?.value ||
    meta.Permission?.value ||
    "";
  return { url: info.url, mime: info.mime || "", license: String(license) };
}

function slugify(name: string): string {
  return name.replace(/\s+/g, "-").replace(/[^\w-]/g, "").toLowerCase() || "logo";
}

export interface FetchedLogo {
  company: string;
  slug: string;
  ext: "svg" | "png";
  bytes: Uint8Array;
  license: string;
  sourceUrl: string;
}

/**
 * 한 회사의 로고를 Commons에서 취득. 네트워크 필요(Actions).
 * 실패(미검색·라이선스 불명·다운로드 실패)면 null → 상위(Brandfetch/사람)로.
 */
export async function fetchCompanyLogo(company: string): Promise<FetchedLogo | null> {
  const cfg = COMPANY_QUERIES[company];
  const query = cfg?.query ?? `${company} logo`;
  const slug = cfg?.slug ?? slugify(company);

  const searchUrl =
    `${COMMONS_API}?action=query&list=search&srnamespace=6&srlimit=15` +
    `&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const titles = parseCommonsSearch(await fetchText(searchUrl));
  const best = pickBestFile(titles);
  if (!best) return null;

  const infoUrl =
    `${COMMONS_API}?action=query&prop=imageinfo&iiprop=url|mime|extmetadata` +
    `&titles=${encodeURIComponent(best)}&format=json&origin=*`;
  const info = parseImageInfo(await fetchText(infoUrl));
  if (!info) return null;
  if (!isLicenseSafe(info.license)) return null; // 안전 라이선스만

  // 바이너리 다운로드 (fetch 직접 — 이미지)
  const res = await fetch(info.url, { headers: { "User-Agent": "wirit-collector/0.1" } });
  if (!res.ok) return null;
  const bytes = new Uint8Array(await res.arrayBuffer());
  const ext: "svg" | "png" = /\.svg$/i.test(info.url) ? "svg" : "png";

  return { company, slug, ext, bytes, license: info.license, sourceUrl: info.url };
}
