/**
 * 공식 로고/엠블럼(공개 SVG·PNG) 취득 — GitHub Actions에서 실행(세션은 다운로드 차단).
 * Commons File 의 라이선스를 판정해 **자유 라이선스일 때만** templates/_shared/logos/ 에 저장·등록한다.
 * 자유가 아니면 다운로드하지 않고 **판정 결과(라이선스)를 로그로 남긴다** — "자유인지 아닌지" 확인용.
 * 실행: node scripts/fetch-logo.mjs --title "File:Emblem of Gyeonggi Province (2021).svg" --slug gyeonggi
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = { "User-Agent": "wirit-collector/0.1 (contact: operator)" };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const title = arg("title");
const slug = arg("slug");
if (!title || !slug) { console.error("--title \"File:...\" --slug <slug> 필요"); process.exit(1); }

function licenseSafe(lic) {
  const s = (lic || "").toLowerCase();
  if (!s || /non-?free|fair use/.test(s)) return false;
  if (/public domain|cc0|creative commons|\bcc[ -]|pd-|ineligible/.test(s)) return true;
  return /kogl[^0-9]*(type)?[^0-9]*(1|i)\b|공공누리[^0-9]*제?1유형/.test(s);
}

const u = `${API}?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata%7Cmime&titles=${encodeURIComponent(title)}`;
const r = await fetch(u, { headers: UA });
const j = await r.json();
const page = Object.values(j.query.pages)[0];
const ii = page && page.imageinfo && page.imageinfo[0];
if (!ii) { console.error(`⛔ 파일 없음: ${title}`); process.exit(1); }
const m = ii.extmetadata || {};
const license = (m.LicenseShortName || {}).value || "(불명)";
const author = ((m.Artist || {}).value || "").replace(/<[^>]+>/g, "").trim();
console.log(`🔎 ${title}\n   라이선스 판정: ${license}`);

if (!licenseSafe(license)) {
  console.log(`   ⚠️ 자유 라이선스가 아님 → 자동취득 안 함(상표/저작권일 수 있음). 공식 배포본을 오너가 등록 필요.`);
  process.exit(3);   // 판정만 하고 저장 안 함
}
const ext = (ii.mime || "image/svg+xml").split("/")[1].replace("svg+xml", "svg").replace("jpeg", "jpg");
const bin = await fetch(ii.url, { headers: UA });
if (!bin.ok) { console.error(`⛔ 다운로드 HTTP ${bin.status}`); process.exit(1); }
const buf = Buffer.from(await bin.arrayBuffer());
const dir = join(ROOT, "templates/_shared/logos");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, `${slug}.${ext}`), buf);
const catPath = join(dir, "catalog.json");
const cat = existsSync(catPath) ? JSON.parse(readFileSync(catPath, "utf8")) : { kind: "logo", items: [] };
cat.items = (cat.items || []).filter((i) => i.slug !== slug);
cat.items.push({ slug, name: title.replace(/^File:/, ""), kind: "logo",
  source: `Wikimedia Commons · ${title}`, license, author: author || "-", added: (arg("date", "auto")) });
writeFileSync(catPath, JSON.stringify(cat, null, 2) + "\n");
console.log(`   ✅ 자유 라이선스 — ${slug}.${ext} 저장 + 카탈로그 등록 (ⓒ${author || "-"})`);
