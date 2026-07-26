/**
 * 발행 승인된 카드를 **인스타가 가져갈 수 있는 자리**에 옮긴다.
 *
 * ── 왜 필요한가
 * 인스타그램 Graph API는 이미지를 파일 업로드로 받지 않는다. **공개 URL을 주면 서버가 직접 가져간다.**
 * 우리 카드 PNG는 저장소에도 없고(gitignore) 관제탑은 비밀번호로 잠겨 있어서,
 * 승인을 눌러도 인스타가 가져갈 그림이 인터넷 어디에도 없었다 — 발행이 물리적으로 불가능했다.
 *
 * 이 스크립트가 그 자리를 만든다:
 *   data/out/{날짜}/{slug}-p{n}.png  →  packages/tower-worker/_site/cards/{label}-{n}.jpg
 * 워커는 /cards/ 만 문 밖에서 서빙한다(worker.js). 어차피 곧 공개될 그림이다.
 *
 * ── JPEG 로 바꾸는 이유
 * Graph API는 JPEG만 받는다(PNG 거부). 카드 렌더러가 쓰는 Chromium 으로 변환한다.
 *
 * 실행: node scripts/stage-public-cards.mjs
 * 대상: data/publish-queue.md 에서 아직 [ ] 인 줄 + data/review/sets.json 의 세트 정의
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "data/publish-queue.md");
const SETS = join(ROOT, "data/review/sets.json");
const OUT = join(ROOT, "packages/tower-worker/_site/cards");
const CONTENT = join(ROOT, "data/content");
const RENDERS = join(ROOT, "data/out");

const norm = (s) => String(s || "").replace(/\s+/g, "").replace(/[·—\-*'"'()[\]🔥💸🏢⚠️]/g, "").toLowerCase();

if (!existsSync(QUEUE) || !existsSync(SETS)) {
  console.log("발행 대기열 또는 세트 정의가 없습니다 — 건너뜁니다.");
  process.exit(0);
}

const sets = JSON.parse(readFileSync(SETS, "utf8")).sets || [];

/** 대기열에서 아직 안 올린 줄의 제목을 뽑는다 */
const pending = [];
for (const line of readFileSync(QUEUE, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*-\s*\[( |x|X)\]\s*(.+)$/);
  if (!m || m[1] !== " ") continue;
  const title = (m[2].match(/\*\*(.+?)\*\*/) || [])[1] || m[2];
  pending.push(title.trim());
}
if (!pending.length) {
  console.log("올릴 대기 항목이 없습니다.");
  process.exit(0);
}

/** 제목 → 세트 */
const matched = [];
for (const title of pending) {
  const hit = sets.find((s) => norm(s.title).includes(norm(title)) || norm(title).includes(norm(s.title)));
  if (!hit) {
    console.log(`::warning::세트 정의를 못 찾음 — "${title}" (data/review/sets.json 에 등록 필요)`);
    continue;
  }
  matched.push(hit);
}
if (!matched.length) {
  console.log("세트와 짝지어진 대기 항목이 없습니다.");
  process.exit(0);
}

/** slug → 렌더된 PNG 경로들(장 순서) */
function pagesOf(slug) {
  if (!existsSync(RENDERS)) return [];
  const out = [];
  for (const d of readdirSync(RENDERS).sort()) {
    const dir = join(RENDERS, d);
    let fs2 = [];
    try {
      fs2 = readdirSync(dir);
    } catch {
      continue;
    }
    const pages = fs2
      .filter((f) => new RegExp(`^${slug}-p\\d+\\.png$`).test(f))
      .sort((a, b) => Number(a.match(/-p(\d+)/)[1]) - Number(b.match(/-p(\d+)/)[1]));
    if (pages.length) out.push(...pages.map((f) => join(dir, f)));
  }
  return out;
}

/* ── PNG → JPEG (렌더러의 Chromium 재사용) ── */
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const { chromium } = require("playwright-core");
const PINNED = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const browser = await chromium.launch(existsSync(PINNED) ? { executablePath: PINNED } : {});
const page = await browser.newPage();

const TO_JPEG = `(src) => new Promise((resolve) => {
  const im = new Image();
  im.onload = () => {
    const c = document.createElement("canvas");
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext("2d");
    if (!g) return resolve("");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(im, 0, 0);
    resolve(c.toDataURL("image/jpeg", 0.92));
  };
  im.onerror = () => resolve("");
  im.src = src;
})`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const manifest = [];
for (const set of matched) {
  const files = [];
  for (const slug of set.cards) {
    const found = pagesOf(slug);
    if (!found.length) console.log(`::warning::렌더가 없습니다 — ${slug} (카드 재생성 필요)`);
    files.push(...found);
  }
  if (!files.length) continue;

  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const b64 = readFileSync(files[i]).toString("base64");
    const jpeg = await page.evaluate(`(${TO_JPEG})(${JSON.stringify("data:image/png;base64," + b64)})`);
    if (!jpeg) {
      console.log(`::warning::JPEG 변환 실패 — ${files[i]}`);
      continue;
    }
    const name = `${set.label}-${i + 1}.jpg`;
    writeFileSync(join(OUT, name), Buffer.from(jpeg.split(",")[1], "base64"));
    urls.push(`cards/${name}`);
  }

  const capName = set.caption || set.label;
  const capPath = join(ROOT, "data/review/captions", `${capName}.txt`);
  manifest.push({
    label: set.label,
    title: set.title,
    files: urls,
    caption: existsSync(capPath) ? readFileSync(capPath, "utf8").trim() : "",
  });
}

await browser.close();

writeFileSync(join(OUT, "index.json"), JSON.stringify({ sets: manifest }, null, 2) + "\n", "utf8");
console.log(`🖼  발행용 이미지 ${manifest.reduce((n, m) => n + m.files.length, 0)}장 준비 (${OUT})`);
for (const m of manifest) console.log(`   · ${m.label} — ${m.files.length}장 · 캡션 ${m.caption ? m.caption.length + "자" : "없음"}`);
