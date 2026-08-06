/**
 * 위키미디어 커먼즈 사진 자동 취득 — GitHub Actions(네트워크 개방)에서 실행.
 * 세션은 외부 이미지 다운로드가 막혀 있어(프록시) Actions로만 취득한다.
 * 흐름: Commons API imageinfo(url·라이선스·저자) → 라이선스 안전성 검사(CC/PD만)
 *      → 원본 다운로드 → templates/_shared/photos/<slug>.<ext> 저장 + catalog.json 기록.
 * 실행: node scripts/fetch-wikimedia-photo.mjs --title "File:...jpg" --slug subway-xxx
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://commons.wikimedia.org/w/api.php";

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const title = arg("title");
const slug = arg("slug");
if (!title || !slug) {
  console.error("사용법: node scripts/fetch-wikimedia-photo.mjs --title \"File:...jpg\" --slug <slug>");
  process.exit(1);
}

// 라이선스 안전 판정: 자유/퍼블릭만 허용(로고 취득기와 동일 기준)
function isSafe(license) {
  const s = (license || "").toLowerCase();
  if (!s) return false;
  if (/non-?free|fair use/.test(s)) return false;
  if (/public domain|cc0|creative commons|\bcc[ -]/.test(s)) return true;
  // KOGL 제1유형(공공누리 1유형): 상업이용·변형 허용, 출처표시 조건 — 자유 이용 가능(정부·기관 사진 다수)
  return /kogl[^0-9]*(type)?[^0-9]*(1|i)\b|korea open government license[^0-9]*(type)?[^0-9]*(1|i)|공공누리[^0-9]*제?1유형/.test(s);
}

const strip = (h) => (h || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function main() {
  const u = `${API}?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata%7Cmime&titles=${encodeURIComponent(title)}`;
  const res = await fetch(u, { headers: { "User-Agent": "wirit-collector/0.1 (contact: operator)" } });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  if (!page || !page.imageinfo) throw new Error(`파일 없음: ${title}`);
  const ii = page.imageinfo[0];
  const m = ii.extmetadata || {};
  const license = (m.LicenseShortName || {}).value || "";
  const author = strip((m.Artist || {}).value);
  const credit = strip((m.Credit || {}).value);

  if (!isSafe(license)) {
    throw new Error(`라이선스 비안전/불명: "${license}" — 다른 파일을 선택하세요.`);
  }

  const ext = (ii.mime || "image/jpeg").split("/")[1].replace("jpeg", "jpg");
  const bin = await fetch(ii.url, { headers: { "User-Agent": "wirit-collector/0.1" } });
  if (!bin.ok) throw new Error(`이미지 다운로드 HTTP ${bin.status}`);
  const buf = Buffer.from(await bin.arrayBuffer());

  const photosDir = join(ROOT, "templates/_shared/photos");
  mkdirSync(photosDir, { recursive: true });
  const file = `${slug}.${ext}`;
  writeFileSync(join(photosDir, file), buf);

  const catPath = join(photosDir, "catalog.json");
  const cat = existsSync(catPath) ? JSON.parse(readFileSync(catPath, "utf8")) : {};
  cat[slug] = {
    file,
    source: "Wikimedia Commons",
    title,
    license,
    author: author || credit || "Wikimedia Commons",
    url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
    fetchedFor: "wirit card",
  };
  writeFileSync(catPath, JSON.stringify(cat, null, 2) + "\n");

  console.log(`✅ ${file} (${(buf.length / 1024).toFixed(0)}KB) · 라이선스 ${license} · 저자 ${cat[slug].author}`);
  console.log(`   ${ii.width}×${ii.height} · ${cat[slug].url}`);
}
main().catch((e) => {
  console.error(`⛔ 실패: ${e.message}`);
  process.exit(1);
});
