/**
 * 로고 자동 취득 CLI (Actions에서 실행 — 네트워크 필요).
 *   tsx src/logoCli.ts <content.json ...>
 * 콘텐츠의 items 중 `logo`가 없는(=컬러칩 대체 중인) 회사를 Wikimedia에서 찾아
 * templates/_shared/logos/{slug}.{svg|png} 로 저장하고 catalog.json에 라이선스와 함께 등록한다.
 * 못 찾은 회사는 목록으로 보고 → Brandfetch(키) 또는 사람 업로드로.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchCompanyLogo, COMPANY_QUERIES } from "./sources/logoFetch.js";
import { fetchBrandfetchLogo, DOMAIN_MAP } from "./sources/brandfetchLogo.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const LOGO_DIR = resolve(ROOT, "templates/_shared/logos");
const CATALOG = resolve(LOGO_DIR, "catalog.json");
// 입력 경로는 명령을 부른 위치(pnpm은 INIT_CWD=호출 디렉터리) 기준으로 푼다
const CWD = process.env.INIT_CWD || process.cwd();
const fromCwd = (p: string): string => resolve(CWD, p);

/** Wikimedia 라이선스 문자열 → 자산 허브 허용 어휘(validate-assets.mjs와 일치) */
function normalizeLicense(raw: string): string {
  const s = (raw || "").toLowerCase();
  if (/public domain|pd-|cc0/.test(s)) return "public-domain";
  if (/creative commons|\bcc[ -]/.test(s)) return "open-license";
  if (/trademark/.test(s)) return "trademark-nominative";
  return "trademark-nominative"; // isLicenseSafe 통과분 — 상표 nominative로 분류, 원문은 note에
}

function addCatalog(slug: string, name: string, license: string, source: string, note: string): void {
  const cat = JSON.parse(readFileSync(CATALOG, "utf8"));
  if (cat.items.some((i: any) => i.slug === slug)) return;
  cat.items.push({
    slug,
    name,
    kind: "logo",
    source,
    license,
    note,
    added: new Date().toISOString().slice(0, 10),
  });
  writeFileSync(CATALOG, JSON.stringify(cat, null, 2) + "\n");
}

async function run(paths: string[]): Promise<void> {
  // 대상 회사 수집: 콘텐츠 items 중 logo 없는 것
  const companies = new Set<string>();
  for (const p of paths) {
    const json = JSON.parse(readFileSync(fromCwd(p), "utf8"));
    // 콘텐츠(items[]): logo 없는 것만. 데이터셋(rows[]): 전체 이름.
    for (const it of json.items ?? []) {
      if (!it.logo && it.name) companies.add(it.name);
    }
    for (const r of json.rows ?? []) {
      if (r.name) companies.add(r.name);
    }
  }
  if (!companies.size) {
    console.log("대상 없음 (모든 항목이 이미 로고 보유).");
    return;
  }

  const got: string[] = [];
  const missed: string[] = [];
  const skipped: string[] = [];
  for (const name of companies) {
    const cfg = COMPANY_QUERIES[name];
    // Tier B는 큐레이션된 회사(COMPANY_QUERIES)만. 나머지는 Tier A(simple-icons)/수동 소관 → 건너뜀.
    if (!cfg) {
      skipped.push(`${name} (Tier A/수동 대상)`);
      continue;
    }
    const slug = cfg.slug;
    // 이미 허브에 있으면(svg·png 무관) 건너뜀
    if (existsSync(resolve(LOGO_DIR, `${slug}.svg`)) || existsSync(resolve(LOGO_DIR, `${slug}.png`))) {
      got.push(`${name} (이미 있음)`);
      continue;
    }
    try {
      const logo = await fetchCompanyLogo(name);
      if (!logo) {
        missed.push(name);
        continue;
      }
      const dest = resolve(LOGO_DIR, `${logo.slug}.${logo.ext}`);
      writeFileSync(dest, logo.bytes);
      addCatalog(
        logo.slug,
        name,
        normalizeLicense(logo.license),
        `Wikimedia Commons (${logo.sourceUrl})`,
        `자동 취득 · 원 라이선스 "${logo.license}" · 상표 nominative use`
      );
      got.push(`${name} → ${logo.slug}.${logo.ext} (${logo.license})`);
    } catch (e) {
      missed.push(`${name} (오류: ${e instanceof Error ? e.message : e})`);
    }
  }

  // Tier C: Wikimedia에서 못 찾은 회사 중 도메인이 알려진 것 → Brandfetch
  const brandfetchKey = process.env.BRANDFETCH_API_KEY;
  if (brandfetchKey) {
    const stillMissing = [...missed];
    missed.length = 0;
    for (const entry of stillMissing) {
      const name = entry.split(" (")[0];
      if (!DOMAIN_MAP[name]) {
        missed.push(entry);
        continue;
      }
      try {
        const logo = await fetchBrandfetchLogo(name, brandfetchKey);
        if (!logo) {
          missed.push(`${entry} · Brandfetch도 실패`);
          continue;
        }
        const dest = resolve(LOGO_DIR, `${logo.slug}.${logo.ext}`);
        writeFileSync(dest, logo.bytes);
        addCatalog(
          logo.slug,
          name,
          "trademark-nominative",
          `Brandfetch (${logo.domain})`,
          "자동 취득(Tier C) · 회사 공식 자산 · 상표 nominative use"
        );
        got.push(`${name} → ${logo.slug}.${logo.ext} (Brandfetch)`);
      } catch (e) {
        missed.push(`${entry} · Brandfetch 오류: ${e instanceof Error ? e.message : e}`);
      }
    }
  } else if (missed.some((m) => DOMAIN_MAP[m.split(" (")[0]])) {
    missed.push("(BRANDFETCH_API_KEY 없음 — Tier C 생략)");
  }

  console.log(`\n✅ 취득 ${got.length}건:`);
  got.forEach((g) => console.log("  ·", g));
  if (missed.length) {
    console.log(`\n⚠️ 미취득 ${missed.length}건 (Brandfetch 키 또는 사람 업로드 필요):`);
    missed.forEach((m) => console.log("  ·", m));
  }
  if (skipped.length) {
    console.log(`\n↷ 건너뜀 ${skipped.length}건 (Tier A/수동 소관):`);
    skipped.forEach((s) => console.log("  ·", s));
  }
  console.log("\n⚠️ 취득 로고는 발행 전 반드시 눈으로 대조하세요(자동 취득은 오탐 가능).");
}

const paths = process.argv.slice(2);
if (!paths.length) {
  console.error("사용법: tsx src/logoCli.ts <content.json ...>");
  process.exit(1);
}
run(paths).catch((e) => {
  console.error(e);
  process.exit(1);
});
