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

/** 회사명 → Commons 검색어 후보(위에서부터 시도)와 저장 slug. 없으면 이름 그대로 검색 */
export const COMPANY_QUERIES: Record<string, { queries: string[]; slug: string }> = {
  "SK하이닉스": { queries: ["SK hynix logo", "SK Hynix"], slug: "skhynix" },
  "한화에어로스페이스": { queries: ["Hanwha Aerospace logo", "Hanwha Aerospace"], slug: "hanwha-aerospace" },
  HMM: { queries: ["HMM Co logo", "HMM company logo", "HMM shipping logo", "HMM (company)"], slug: "hmm" },
  "포스코인터내셔널": { queries: ["POSCO International logo", "POSCO INTERNATIONAL", "Posco International"], slug: "posco-international" },
  "삼성바이오로직스": { queries: ["Samsung Biologics logo", "Samsung Biologics"], slug: "samsung-biologics" },
  "HD현대일렉트릭": { queries: ["HD Hyundai Electric logo", "Hyundai Electric logo", "HD Hyundai Electric"], slug: "hd-hyundai-electric" },
  "HD한국조선해양": {
    queries: ["HD Korea Shipbuilding Offshore Engineering logo", "Korea Shipbuilding & Offshore Engineering logo", "HD KSOE logo"],
    slug: "hd-ksoe",
  },
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

/** 후보 파일을 점수순으로 정렬: svg > png, 'logo'·'wordmark' 우선, 사진류 회피 */
export function pickBestFiles(titles: string[]): string[] {
  return titles
    .filter((t) => /\.(svg|png)$/i.test(t))
    .map((t) => {
      const lower = t.toLowerCase();
      let score = 0;
      if (lower.endsWith(".svg")) score += 10;
      if (lower.includes("logo")) score += 5;
      if (lower.includes("wordmark")) score += 3;
      if (/photo|building|headquarter|ceo|store|aircraft|ship\b|factory/.test(lower)) score -= 20;
      return { t, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.t);
}

/** 최적 1개(테스트·단순용) */
export function pickBestFile(titles: string[]): string | null {
  const list = pickBestFiles(titles);
  return list.length ? list[0] : null;
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
  const queries = cfg?.queries ?? [`${company} logo`];
  const slug = cfg?.slug ?? slugify(company);

  // 검색어 후보 × 파일 후보(상위 4개)를 돌며 라이선스 안전한 첫 로고를 취득
  for (const query of queries) {
    const searchUrl =
      `${COMMONS_API}?action=query&list=search&srnamespace=6&srlimit=20` +
      `&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    let titles: string[];
    try {
      titles = parseCommonsSearch(await fetchText(searchUrl));
    } catch {
      continue;
    }
    for (const file of pickBestFiles(titles).slice(0, 4)) {
      const infoUrl =
        `${COMMONS_API}?action=query&prop=imageinfo&iiprop=url|mime|extmetadata` +
        `&titles=${encodeURIComponent(file)}&format=json&origin=*`;
      let info: ReturnType<typeof parseImageInfo>;
      try {
        info = parseImageInfo(await fetchText(infoUrl));
      } catch {
        continue;
      }
      if (!info || !isLicenseSafe(info.license)) continue;

      const res = await fetch(info.url, { headers: { "User-Agent": "wirit-collector/0.1" } });
      if (!res.ok) continue;
      const bytes = new Uint8Array(await res.arrayBuffer());
      const ext: "svg" | "png" = /\.svg$/i.test(info.url) ? "svg" : "png";
      return { company, slug, ext, bytes, license: info.license, sourceUrl: info.url };
    }
  }
  return null;
}
