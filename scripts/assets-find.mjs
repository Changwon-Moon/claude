/**
 * 자산 검색 — **취득하기 전에 먼저 여기서 찾는다.**
 *
 * ── 왜 (오너 지시 2026-08-12)
 * 「역대 정부 통화량」 카드를 만들며 대통령 초상 6장을 위키미디어에서 새로 받았다.
 * 그런데 그중 이재명 사진은 **저장소에 이미 있었다.** 사진 취득은 Actions 왕복이라
 * 한 장에 3~4분이 든다 — 있는 걸 또 받는 데 시간을 쓴 것이다.
 * 게다가 취득기가 카탈로그의 **엉뚱한 자리**에 적어 온 탓에(2026-08-12 수정) 검색해도
 * 안 잡히는 자산이 11건 있었다. 그래서 "먼저 찾는" 창구를 하나 만든다.
 *
 * 실행:
 *   node scripts/assets-find.mjs 대통령          # 이름·메모·출처를 통째로 훑는다
 *   node scripts/assets-find.mjs roh moon        # 여러 낱말은 OR
 *   node scripts/assets-find.mjs --all           # 전부 나열
 *
 * 찾는 곳: templates/_shared/{photos,logos,maps}/catalog.json + 실제 파일 목록.
 * 카탈로그에 없는 파일도 **파일명으로** 잡아 준다 — 등록 누락이 검색 실패로 이어지지 않게.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["templates/_shared/photos", "templates/_shared/logos", "templates/_shared/maps"];

const args = process.argv.slice(2);
const all = args.includes("--all");
const terms = args.filter((a) => !a.startsWith("--")).map((t) => t.toLowerCase());
if (!all && !terms.length) {
  console.log("사용법: node scripts/assets-find.mjs <낱말...> | --all");
  process.exit(1);
}

let found = 0;
for (const rel of DIRS) {
  const dir = join(ROOT, rel);
  if (!existsSync(dir)) continue;
  const catPath = join(dir, "catalog.json");
  const cat = existsSync(catPath) ? JSON.parse(readFileSync(catPath, "utf8")) : { items: [] };
  const items = cat.items ?? [];
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  const files = readdirSync(dir).filter((f) => !f.endsWith(".json") && !f.startsWith("_"));

  const rows = [];
  for (const f of files) {
    const slug = f.replace(/\.[^.]+$/, "");
    /* 파생본(-cut/-face/-source)은 원본 항목의 메타를 물려받는다 */
    const base = slug.replace(/-(cut|face|source)$/, "");
    const meta = bySlug.get(slug) ?? bySlug.get(base) ?? null;
    const hay = [f, slug, meta?.name, meta?.note, meta?.source].filter(Boolean).join(" ").toLowerCase();
    if (!all && !terms.some((t) => hay.includes(t))) continue;
    rows.push({ f, meta, registered: bySlug.has(slug) });
  }
  if (!rows.length) continue;
  console.log(`\n[${rel}]`);
  for (const r of rows) {
    found++;
    const mark = r.registered ? "✅" : "⚠️ 미등록";
    console.log(`  ${mark} ${r.f}`);
    if (r.meta) {
      console.log(`      ${r.meta.name} · ${r.meta.license ?? "?"}`);
      if (r.meta.note) console.log(`      ${r.meta.note}`);
      if (r.meta.source) console.log(`      ${r.meta.source}`);
    }
  }
}

console.log("");
if (!found) {
  console.log("찾은 자산 없음 — 새로 취득해야 합니다.");
  console.log("  사진: data/photo-batch.tsv 에 `slug<TAB>source<TAB>제목` 한 줄 추가 후 푸시");
  console.log("        source = wikipedia | category | wikimedia | pexels | pixabay");
  console.log("  로고: data/assets-queue.txt");
} else {
  console.log(`${found}건 — 카드에서는 templates/_shared/{폴더}/{파일} 로 참조합니다.`);
  console.log("⚠️ 미등록 표시가 있으면 node scripts/assets-sync-photos.mjs 로 카탈로그를 채웁니다.");
}
