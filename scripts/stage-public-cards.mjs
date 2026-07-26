/**
 * 완성 카드를 두 자리로 옮긴다 — ① 발행용(공개) ② 오너 내려받기용(문 안쪽).
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
/* 오너가 수동 업로드할 원본 — 비밀번호 문 **안쪽**이라 공개되지 않는다.
 * (2026-07-26 오너: "인스타는 당분간 내가 수동으로 올릴거야" — 그런데 원본을
 *  받을 통로가 없었다. 관제탑 화면의 이미지는 900px 축소본이라 업로드용이 아니다.) */
const DL = join(ROOT, "packages/tower-worker/_site/download");
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

/** 발행용(공개) = 승인된 것만 */
const matched = [];
for (const title of pending) {
  const hit = sets.find((s) => norm(s.title).includes(norm(title)) || norm(title).includes(norm(s.title)));
  if (!hit) {
    console.log(`::warning::세트 정의를 못 찾음 — "${title}" (data/review/sets.json 에 등록 필요)`);
    continue;
  }
  matched.push(hit);
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
rmSync(DL, { recursive: true, force: true });
mkdirSync(DL, { recursive: true });

/** 세트 하나를 dir 로 옮긴다(원본 해상도 JPEG + 캡션 txt). 옮긴 파일 목록을 돌려준다. */
async function stageSet(set, dir, rel) {
  const files = [];
  for (const slug of set.cards) {
    const found = pagesOf(slug);
    if (!found.length) console.log(`::warning::렌더가 없습니다 — ${slug} (카드 재생성 필요)`);
    files.push(...found);
  }
  if (!files.length) return null;

  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const b64 = readFileSync(files[i]).toString("base64");
    const jpeg = await page.evaluate(`(${TO_JPEG})(${JSON.stringify("data:image/png;base64," + b64)})`);
    if (!jpeg) {
      console.log(`::warning::JPEG 변환 실패 — ${files[i]}`);
      continue;
    }
    const name = `${set.label}-${i + 1}.jpg`;
    writeFileSync(join(dir, name), Buffer.from(jpeg.split(",")[1], "base64"));
    urls.push(`${rel}/${name}`);
  }

  const capName = set.caption || set.label;
  const capPath = join(ROOT, "data/review/captions", `${capName}.txt`);
  const caption = existsSync(capPath) ? readFileSync(capPath, "utf8").trim() : "";
  if (caption) writeFileSync(join(dir, `${set.label}-caption.txt`), caption + "\n", "utf8");
  return { label: set.label, title: set.title, files: urls, caption };
}

/* ① 발행용(공개, /cards/) — 오너가 승인해 대기열에 오른 세트만 */
const manifest = [];
for (const set of matched) {
  const m = await stageSet(set, OUT, "cards");
  if (m) manifest.push(m);
}

/* ② 내려받기용(문 안쪽, /download/) — 렌더가 있는 **모든** 세트.
 * 오너가 수동 업로드·검토용으로 원본을 받아가는 자리다. 승인 전 카드도 문 안쪽이니 안전하다. */
const dlManifest = [];
for (const set of sets) {
  const m = await stageSet(set, DL, "download");
  if (m) dlManifest.push(m);
}

await browser.close();

writeFileSync(join(OUT, "index.json"), JSON.stringify({ sets: manifest }, null, 2) + "\n", "utf8");
writeFileSync(join(DL, "index.json"), JSON.stringify({ sets: dlManifest }, null, 2) + "\n", "utf8");
console.log(`🖼  발행용(공개) ${manifest.reduce((n, m) => n + m.files.length, 0)}장 · 내려받기(문 안) ${dlManifest.reduce((n, m) => n + m.files.length, 0)}장`);
for (const m of dlManifest) console.log(`   · ${m.label} — ${m.files.length}장 · 캡션 ${m.caption ? m.caption.length + "자" : "없음"}`);
