#!/usr/bin/env node
/**
 * 자산 허브 무결성 검사 (자료허브팀 · 품질검수 4항의 기계 검사)
 * - 카탈로그에 없는 자산 파일 / 파일이 없는 카탈로그 항목 탐지
 * - 라이선스 누락·허용값 위반 탐지
 * - 데이터셋 meta 필수 필드(출처·기준시점·verified) 검사
 * 사용: node scripts/validate-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LICENSES = ["public-domain", "open-license", "press-release", "trademark-nominative", "licensed"];
let errors = 0;
const fail = (msg) => { errors++; console.error(`  ❌ ${msg}`); };
const ok = (msg) => console.log(`  ✅ ${msg}`);

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { fail(`${path.relative(ROOT, p)} JSON 파싱 실패: ${e.message}`); return null; }
}

/** 개별 항목형 카탈로그 폴더 검사 (logos/photos/maps) */
function checkVisualDir(rel, exts) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) return;
  console.log(`[${rel}]`);
  const cat = readJson(path.join(dir, "catalog.json"));
  if (!cat) return;
  const items = cat.items ?? [];
  const slugs = new Set(items.map((i) => i.slug));

  const files = fs.readdirSync(dir).filter((f) => exts.some((e) => f.endsWith(e)));
  for (const f of files) {
    const slug = f.replace(/\.[^.]+$/, "");
    if (!slugs.has(slug)) fail(`카탈로그에 없는 파일: ${rel}/${f} — catalog.json에 등록 필요`);
  }
  for (const it of items) {
    const exists = exts.some((e) => fs.existsSync(path.join(dir, it.slug + e)));
    if (!exists) fail(`파일이 없는 카탈로그 항목: ${it.slug}`);
    if (!it.license) fail(`라이선스 누락: ${it.slug}`);
    else if (!LICENSES.includes(it.license)) fail(`허용되지 않는 라이선스 값: ${it.slug} → "${it.license}"`);
    if (!it.source) fail(`출처(source) 누락: ${it.slug}`);
  }
  if (!errors) ok(`파일 ${files.length}개 · 카탈로그 ${items.length}건 정합`);
}

/** 일괄 등록형(flags) 검사 */
function checkBulkDir(rel) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) return;
  console.log(`[${rel}]`);
  const cat = readJson(path.join(dir, "catalog.json"));
  if (!cat) return;
  if (!cat.bulk) fail("bulk 카탈로그가 아님");
  if (!cat.license || !LICENSES.includes(cat.license)) fail(`일괄 라이선스 누락/위반: "${cat.license}"`);
  if (!cat.source) fail("일괄 출처 누락");
  if (!errors) ok(`일괄 등록 (${cat.licenseDetail ?? cat.license})`);
}

/** 데이터셋 캐시 검사 */
function checkDatasets() {
  const dir = path.join(ROOT, "data", "datasets");
  if (!fs.existsSync(dir)) return;
  console.log("[data/datasets]");
  const cat = readJson(path.join(dir, "catalog.json"));
  if (!cat) return;
  const listed = new Set((cat.items ?? []).map((i) => i.file));

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "catalog.json");
  for (const f of files) {
    if (!listed.has(f)) fail(`카탈로그에 없는 데이터셋: ${f}`);
    const ds = readJson(path.join(dir, f));
    if (!ds) continue;
    const m = ds.meta ?? {};
    for (const field of ["title", "source", "asOf"]) {
      if (!m[field]) fail(`${f}: meta.${field} 누락`);
    }
    if (typeof m.verified !== "boolean") fail(`${f}: meta.verified(불리언) 누락`);
  }
  for (const it of cat.items ?? []) {
    if (!fs.existsSync(path.join(dir, it.file))) fail(`파일이 없는 카탈로그 항목: ${it.file}`);
  }
  if (!errors) ok(`데이터셋 ${files.length}건 정합`);
}

console.log("🗄️  자산 허브 무결성 검사\n");
checkVisualDir("templates/_shared/logos", [".svg", ".png"]);
checkVisualDir("templates/_shared/photos", [".jpg", ".jpeg", ".png", ".webp"]);
checkVisualDir("templates/_shared/maps", [".svg"]);
checkBulkDir("templates/_shared/flags");
checkDatasets();

console.log(errors ? `\n결과: ❌ 문제 ${errors}건 — 위 항목을 고쳐주세요` : "\n결과: ✅ 허브 무결성 이상 없음");
process.exit(errors ? 1 : 0);
