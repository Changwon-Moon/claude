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
const count = Math.max(1, parseInt(arg("count", "1"), 10) || 1); // >1이면 후보 여러 장(cand/) 취득
if (!slug) { console.error("--slug 필요"); process.exit(1); }

const category = arg("category", source === "category" ? title : "");
const PEX = process.env.PEXELS_API_KEY || "";
const PIX = process.env.PIXABAY_API_KEY || "";
if (source === "auto") source = PEX ? "pexels" : PIX ? "pixabay" : "wikimedia";

const WM_API = "https://commons.wikimedia.org/w/api.php";
const WM_UA = { "User-Agent": "wirit-collector/0.1 (contact: operator)" };
// 자유 라이선스만 통과 — CC/PD/CC0 + KOGL 제1유형(공공누리 1유형: 상업이용·변형 허용).
function licenseSafe(lic) {
  const s = (lic || "").toLowerCase();
  if (!s || /non-?free|fair use/.test(s)) return false;
  if (/public domain|cc0|creative commons|\bcc[ -]/.test(s)) return true;
  return /kogl[^0-9]*(type)?[^0-9]*(1|i)\b|korea open government license[^0-9]*(type)?[^0-9]*(1|i)|공공누리[^0-9]*제?1유형/.test(s);
}
async function wmImageInfo(fileTitle) {
  const u = `${WM_API}?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata%7Cmime&titles=${encodeURIComponent(fileTitle)}`;
  const r = await fetch(u, { headers: WM_UA });
  const j = await r.json();
  const page = Object.values(j.query.pages)[0];
  const ii = page && page.imageinfo && page.imageinfo[0];
  if (!ii) return null;
  const m = ii.extmetadata || {};
  return { url: ii.url, mime: ii.mime || "", license: (m.LicenseShortName || {}).value || "",
    author: ((m.Artist || {}).value || "").replace(/<[^>]+>/g, "").trim(),
    page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}` };
}
/* 인물 카테고리 → 자유 라이선스 '정면 공식 사진'을 코드가 고른다.
 * 우선순위: 제목에 portrait/official/공식/증명 이 있는 사진 > 그 외 사진. 서명·로고·엠블럼·차트는 제외.
 * 각 후보의 라이선스를 실제로 조회해 자유 라이선스인 첫 장을 취한다. */
async function fromWikimediaCategory() {
  if (!category) throw new Error("--category 필요(예: Category:Choo Mi-ae)");
  const u = `${WM_API}?action=query&format=json&list=categorymembers&cmtype=file&cmlimit=200&cmtitle=${encodeURIComponent(category)}`;
  const r = await fetch(u, { headers: WM_UA });
  const j = await r.json();
  const files = (j.query?.categorymembers || []).map((m) => m.title)
    .filter((t) => /\.(jpe?g|png)$/i.test(t))
    .filter((t) => !/signature|logo|emblem|symbol|sign\b|flag|chart|graph|building|공천|명함/i.test(t));
  // 정면 공식사진 우선: portrait/official/직함(장관·지사·의원·대표·minister·governor) 있으면 가점,
  // 얼굴 위주(cropped/head)면 추가 가점, 행사·연설·측면(speech·rally·forum) 이면 감점.
  const score = (t) => {
    let s = 2;
    if (/portrait|official|공식|증명|정부|국회|profile|minister|governor|장관|지사|의원|대표/i.test(t)) s -= 1.2;
    if (/cropped|head|face/i.test(t)) s -= 0.5;
    if (/speech|rally|forum|meeting|visit|campaign|debate|연설|행사|유세|회의/i.test(t)) s += 0.7;
    return s;
  };
  files.sort((a, b) => score(a) - score(b));
  const tried = [];
  for (const t of files) {
    let info;
    try { info = await wmImageInfo(t); } catch { continue; }
    if (!info) continue;
    if (!licenseSafe(info.license)) { tried.push(`${t} [${info.license || "?"}]`); continue; }
    console.log(`  ▶ 선택: ${t} · ${info.license}`);
    return info;
  }
  throw new Error(`카테고리에 자유 라이선스 사진 없음: ${category}\n  검토: ${tried.slice(0, 8).join(" / ")}`);
}

async function pexelsList() {
  if (!PEX) throw new Error("PEXELS_API_KEY 없음");
  const u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&orientation=portrait`;
  const r = await fetch(u, { headers: { Authorization: PEX } });
  if (!r.ok) throw new Error(`Pexels HTTP ${r.status}`);
  const j = await r.json();
  return (j.photos || []).map((p) => ({
    url: p.src.portrait || p.src.large2x || p.src.original,
    license: "Pexels License (상업이용·표기불요)", author: p.photographer, page: p.url,
  }));
}
async function fromPexels() {
  const list = await pexelsList();
  if (!list[0]) throw new Error("Pexels 결과 없음");
  return list[0];
}
async function pixabayList() {
  if (!PIX) throw new Error("PIXABAY_API_KEY 없음");
  const u = `https://pixabay.com/api/?key=${PIX}&q=${encodeURIComponent(query)}&image_type=photo&orientation=vertical&per_page=30&safesearch=true`;
  const r = await fetch(u);
  if (!r.ok) throw new Error(`Pixabay HTTP ${r.status}`);
  const j = await r.json();
  return (j.hits || []).map((h) => ({
    url: h.largeImageURL, license: "Pixabay Content License (상업이용·표기불요)", author: h.user, page: h.pageURL,
  }));
}
async function fromPixabay() {
  const list = await pixabayList();
  if (!list[0]) throw new Error("Pixabay 결과 없음");
  return list[0];
}
/* 위키백과 대표사진(lead image) → 파일 취득. 생존 인물 문서의 대표사진은 사실상 자유 라이선스다.
 * source=wikipedia, title="문서 제목"(예: "Kim Moon-soo (politician)"). lang 는 --lang(기본 en). */
async function fromWikipediaLead() {
  const lang = arg("lang", "en");
  const art = title;
  if (!art) throw new Error("--title 에 위키백과 문서 제목 필요");
  const api = `https://${lang}.wikipedia.org/w/api.php`;
  const u = `${api}?action=query&format=json&prop=pageimages&piprop=name&titles=${encodeURIComponent(art)}`;
  const r = await fetch(u, { headers: WM_UA });
  const j = await r.json();
  const page = Object.values(j.query.pages)[0];
  const name = page && page.pageimage;
  if (!name) throw new Error(`위키백과 대표사진 없음: ${art}`);
  const info = await wmImageInfo("File:" + name);   // 대개 커먼즈에 있다
  if (!info) throw new Error(`대표사진 파일 정보 없음: File:${name}`);
  if (!licenseSafe(info.license)) throw new Error(`대표사진 라이선스 비안전: ${info.license} (File:${name})`);
  console.log(`  ▶ 위키백과 대표사진: File:${name} · ${info.license}`);
  return info;
}
async function fromWikimedia() {
  const api = "https://commons.wikimedia.org/w/api.php";
  const u = `${api}?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata%7Cmime&titles=${encodeURIComponent(title)}`;
  const r = await fetch(u, { headers: { "User-Agent": "wirit-collector/0.1" } });
  const j = await r.json();
  const ii = Object.values(j.query.pages)[0].imageinfo[0];
  const m = ii.extmetadata || {};
  const lic = (m.LicenseShortName || {}).value || "";
  const _lic=(lic||"").toLowerCase();
  const _safe=/public domain|cc0|creative commons|\bcc[ -]/.test(_lic) || /kogl[^0-9]*(type)?[^0-9]*(1|i)\b|korea open government license[^0-9]*(type)?[^0-9]*(1|i)|공공누리[^0-9]*제?1유형/.test(_lic);
  if (!_safe) throw new Error(`위키미디어 라이선스 비안전: ${lic}`);
  return { url: ii.url, license: lic, author: ((m.Artist || {}).value || "").replace(/<[^>]+>/g, "").trim(), page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}` };
}

// 후보 여러 장 취득(cand/<slug>-i.jpg) — 세션이 미리보기 후 1장을 승격하도록.
const fetchCandidates = async () => {
  let list;
  if (source === "pexels") list = await pexelsList();
  else if (source === "pixabay") list = await pixabayList();
  else throw new Error("후보 모드는 pexels/pixabay만 지원");
  const picks = list.slice(0, count);
  if (!picks.length) throw new Error("결과 없음");
  const candDir = join(ROOT, "templates/_shared/photos/cand");
  mkdirSync(candDir, { recursive: true });
  const meta = [];
  for (let i = 0; i < picks.length; i++) {
    const p = picks[i];
    const bin = await fetch(p.url, { headers: { "User-Agent": "wirit-collector/0.1" } });
    if (!bin.ok) { console.warn(`  ⚠︎ ${i} 다운로드 실패 HTTP ${bin.status}`); continue; }
    const buf = Buffer.from(await bin.arrayBuffer());
    const file = `${slug}-${i}.jpg`;
    writeFileSync(join(candDir, file), buf);
    meta.push({ i, file, source, query, license: p.license, author: p.author || source, url: p.page });
    console.log(`  ✅ cand/${file} (${(buf.length / 1024).toFixed(0)}KB) · ⓒ${p.author} · ${p.page}`);
  }
  writeFileSync(join(candDir, `${slug}.candidates.json`), JSON.stringify(meta, null, 2) + "\n");
  console.log(`💾 후보 ${meta.length}장 · cand/${slug}.candidates.json`);
};

const main = async () => {
  if (count > 1) return fetchCandidates();
  const pick = source === "pexels" ? await fromPexels()
    : source === "pixabay" ? await fromPixabay()
    : source === "category" ? await fromWikimediaCategory()
    : source === "wikipedia" ? await fromWikipediaLead()
    : await fromWikimedia();
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
