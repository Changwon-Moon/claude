/**
 * 사진 카탈로그 채우기 — **파생본은 원본에서 물려받는다.**
 *
 * ── 왜 (2026-08-12)
 * 취득기가 받아 오는 것은 `{slug}.jpg` 하나인데, 실제 카드가 참조하는 것은 대개
 * 누끼(`-cut.png`)나 얼굴 규격화본(`-face.png`) 같은 **파생본**이다.
 * 그런데 `validate-assets.mjs` 는 폴더의 **모든 파일**이 카탈로그에 있어야 한다고 본다.
 * 그래서 사진을 받을 때마다 "카탈로그에 없는 파일" 이 두세 건씩 쌓여 왔다.
 *
 * 파생본의 출처·라이선스는 원본과 같다 — 사람이 다시 적을 정보가 없다. 코드가 물려주면 된다.
 * 원본이 없는 파일(손으로 올린 사진 등)은 **건드리지 않고 이름만 알려 준다** — 지어내지 않는다.
 *
 * 실행: node scripts/assets-sync-photos.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");
const DIR = join(ROOT, "templates/_shared/photos");
const CAT = join(DIR, "catalog.json");

const cat = JSON.parse(readFileSync(CAT, "utf8"));
cat.items ??= [];
const bySlug = new Map(cat.items.map((i) => [i.slug, i]));
const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

const SUFFIX = /-(cut|face|source)$/;
const LABEL = { cut: "배경 제거본", face: "얼굴 규격화본", source: "원본 보관본" };

const added = [];
const orphans = [];
for (const f of readdirSync(DIR)) {
  if (f.endsWith(".json") || f.startsWith("_")) continue;
  const slug = f.replace(/\.[^.]+$/, "");
  if (bySlug.has(slug)) continue;
  const m = slug.match(SUFFIX);
  const base = m ? slug.replace(SUFFIX, "") : null;
  const src = base ? bySlug.get(base) : null;
  if (!src) {
    orphans.push(f);
    continue;
  }
  const item = {
    slug,
    name: `${src.name} (${LABEL[m[1]]})`,
    kind: "photo",
    source: src.source,
    license: src.license,
    note: `${base} 에서 파생 · ${src.note ?? ""}`.trim(),
    added: today,
  };
  cat.items.push(item);
  bySlug.set(slug, item);
  added.push(slug);
}

cat.items.sort((a, b) => a.slug.localeCompare(b.slug));
if (!DRY && added.length) writeFileSync(CAT, JSON.stringify(cat, null, 2) + "\n", "utf8");

console.log(`파생본 등록 ${added.length}건${DRY ? " (미저장 — --dry)" : ""}`);
for (const s of added) console.log(`  + ${s}`);
if (orphans.length) {
  console.log(`\n⚠️ 원본을 못 찾은 파일 ${orphans.length}건 — 손으로 적어야 합니다(출처·라이선스를 모릅니다):`);
  for (const f of orphans) console.log(`  · ${f}`);
}
