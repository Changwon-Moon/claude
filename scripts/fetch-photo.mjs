/**
 * 무료 사진 자동 취득 (다중 소스) — GitHub Actions에서 실행(세션은 이미지 다운로드 차단).
 * 지원: pexels · pixabay · wikimedia. 키워드 검색 → 안전 라이선스 확인 → 세로형 우선 → 다운로드.
 * → templates/_shared/photos/<slug>.jpg + catalog.json 기록.
 * 실행:
 *   node scripts/fetch-photo.mjs --source auto --query "seoul subway" --slug subway-pexels
 *   node scripts/fetch-photo.mjs --source wikimedia --title "File:...jpg" --slug subway-x
 * 키: PEXELS_API_KEY / PIXABAY_API_KEY (env). source=auto면 가진 키로 자동 선택.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
let source = arg("source", "auto");
const query = arg("query", "seoul subway");
const slug = arg("slug");
const title = arg("title");
if (!slug) { console.error("--slug 필요"); process.exit(1); }

const PEX = process.env.PEXELS_API_KEY || "";
const PIX = process.env.PIXABAY_API_KEY || "";
if (source === "auto") source = PEX ? "pexels" : PIX ? "pixabay" : "wikimedia";

async function fromPexels() {
  if (!PEX) throw new Error("PEXELS_API_KEY 없음");
  const u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=portrait`;
  const r = await fetch(u, { headers: { Authorization: PEX } });
  if (!r.ok) throw new Error(`Pexels HTTP ${r.status}`);
  const j = await r.json();
  const p = (j.photos || [])[0];
  if (!p) throw new Error("Pexels 결과 없음");
  return { url: p.src.portrait || p.src.large2x || p.src.original, license: "Pexels License (상업이용·표기불요)", author: p.photographer, page: p.url };
}
async function fromPixabay() {
  if (!PIX) throw new Error("PIXABAY_API_KEY 없음");
  const u = `https://pixabay.com/api/?key=${PIX}&q=${encodeURIComponent(query)}&image_type=photo&orientation=vertical&per_page=20&safesearch=true`;
  const r = await fetch(u);
  if (!r.ok) throw new Error(`Pixabay HTTP ${r.status}`);
  const j = await r.json();
  const h = (j.hits || [])[0];
  if (!h) throw new Error("Pixabay 결과 없음");
  return { url: h.largeImageURL, license: "Pixabay Content License (상업이용·표기불요)", author: h.user, page: h.pageURL };
}
async function fromWikimedia() {
  const api = "https://commons.wikimedia.org/w/api.php";
  const u = `${api}?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata%7Cmime&titles=${encodeURIComponent(title)}`;
  const r = await fetch(u, { headers: { "User-Agent": "wirit-collector/0.1" } });
  const j = await r.json();
  const ii = Object.values(j.query.pages)[0].imageinfo[0];
  const m = ii.extmetadata || {};
  const lic = (m.LicenseShortName || {}).value || "";
  if (!/public domain|cc0|creative commons|\bcc[ -]/i.test(lic)) throw new Error(`위키미디어 라이선스 비안전: ${lic}`);
  return { url: ii.url, license: lic, author: ((m.Artist || {}).value || "").replace(/<[^>]+>/g, "").trim(), page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}` };
}

const main = async () => {
  const pick = source === "pexels" ? await fromPexels() : source === "pixabay" ? await fromPixabay() : await fromWikimedia();
  const bin = await fetch(pick.url, { headers: { "User-Agent": "wirit-collector/0.1" } });
  if (!bin.ok) throw new Error(`다운로드 HTTP ${bin.status}`);
  const buf = Buffer.from(await bin.arrayBuffer());
  const photosDir = join(ROOT, "templates/_shared/photos");
  mkdirSync(photosDir, { recursive: true });
  const file = `${slug}.jpg`;
  writeFileSync(join(photosDir, file), buf);
  const catPath = join(photosDir, "catalog.json");
  const cat = existsSync(catPath) ? JSON.parse(readFileSync(catPath, "utf8")) : {};
  cat[slug] = { file, source: source, query, license: pick.license, author: pick.author || source, url: pick.page, fetchedFor: "wirit card" };
  writeFileSync(catPath, JSON.stringify(cat, null, 2) + "\n");
  console.log(`✅ ${file} (${(buf.length / 1024).toFixed(0)}KB) · ${source} · ${pick.license} · ⓒ${cat[slug].author}`);
  console.log(`   ${pick.page}`);
};
main().catch((e) => { console.error(`⛔ 실패: ${e.message}`); process.exit(1); });
