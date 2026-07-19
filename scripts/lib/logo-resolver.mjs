/**
 * 로고 자동 해결기 (Tier A: simple-icons, 오프라인·무키).
 * 회사명 → simple-icons 매칭 → templates/_shared/logos/{slug}.svg 생성 + 카탈로그 등록.
 * 네트워크 없이 이 세션/CI 어디서나 동작. 못 찾으면 null → 상위 티어(B/C, Actions) 또는 사람.
 *
 * 사용:
 *   import { resolveLogo } from "./lib/logo-resolver.mjs";
 *   const r = resolveLogo("현대자동차");  // → { slug:"hyundai" } 또는 null
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as simpleIcons from "simple-icons";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const LOGО_DIR = join(ROOT, "templates/_shared/logos");
const CATALOG = join(LOGО_DIR, "catalog.json");

const ICONS = Object.values(simpleIcons).filter((x) => x && x.title && x.slug);

/** 회사명 정규화: 그룹/계열 접미사·법인격 제거, 핵심 토큰 추출 */
function normalize(name) {
  return name
    .replace(/\s*(주식회사|㈜|\(주\)|그룹|계열|holdings?|inc\.?|corp\.?|co\.?,?\s*ltd\.?)\s*/gi, "")
    .trim()
    .toLowerCase();
}

/** 한국 대기업 별칭 → simple-icons 후보 검색어 (있는 것만 매칭됨) */
const ALIASES = {
  현대자동차: "hyundai",
  현대차: "hyundai",
  기아: "kia",
  삼성전자: "samsung",
  삼성: "samsung",
  엘지: "lg",
  네이버: "naver",
  카카오: "kakao",
};

/** name → simple-icons icon 객체 (없으면 null) */
export function matchIcon(name) {
  const norm = normalize(name);
  const alias = ALIASES[name.trim()] || ALIASES[norm];
  if (alias) {
    const byAlias = ICONS.find((i) => i.slug === alias);
    if (byAlias) return byAlias;
  }
  // 제목 완전일치 → 부분일치(라틴 이름만)
  const exact = ICONS.find((i) => i.title.toLowerCase() === norm);
  if (exact) return exact;
  if (/^[a-z0-9 .&-]+$/.test(norm) && norm.length >= 3) {
    const partial = ICONS.find((i) => i.title.toLowerCase() === norm.replace(/\s+/g, ""));
    if (partial) return partial;
  }
  return null;
}

function readCatalog() {
  return JSON.parse(readFileSync(CATALOG, "utf8"));
}
function addCatalogEntry(slug, title, hex) {
  const cat = readCatalog();
  if (cat.items.some((i) => i.slug === slug)) return;
  cat.items.push({
    slug,
    name: title,
    kind: "logo",
    source: "simple-icons (https://simpleicons.org)",
    license: "trademark-nominative",
    note: `브랜드색 #${hex} 적용 (자동 해결)`,
    added: new Date().toISOString().slice(0, 10),
  });
  writeFileSync(CATALOG, JSON.stringify(cat, null, 2) + "\n");
}

/**
 * 회사명 → 로고 확보 시도.
 * 성공: { slug } (svg·카탈로그 생성됨). 실패: null.
 * opts.write=false 면 파일 안 쓰고 매칭만 확인.
 */
export function resolveLogo(name, opts = {}) {
  const icon = matchIcon(name);
  if (!icon) return null;
  const dest = join(LOGО_DIR, `${icon.slug}.svg`);
  if (opts.write !== false && !existsSync(dest)) {
    const svg = icon.svg.replace(/^<svg /, `<svg fill="#${icon.hex}" `);
    writeFileSync(dest, svg);
    addCatalogEntry(icon.slug, icon.title, icon.hex);
  }
  return { slug: icon.slug, title: icon.title, hex: icon.hex };
}
