/**
 * 오너가 **직접 올릴** 원본과 **이미 올린** 완성본을 관제탑 문 안쪽에 깐다.
 *
 * ── 왜 필요한가
 * 카드 PNG는 용량 때문에 저장소에 없다(gitignore) — 매 배포마다 다시 그린다.
 * 그러면 오너가 업로드할 실물을 받을 자리가 없다. 화면의 이미지는 900px 축소본이라
 * 인스타에 올릴 물건이 못 된다. 여기서 **원본 해상도 JPEG**를 깔아 준다.
 *
 *   data/out/{날짜}/{slug}-p{n}.png  →  _site/download/{label}-{n}.jpg   (올릴 물건)
 *   published/{발행일}-{label}/*.jpg →  _site/published/…                (이미 올린 물건)
 *
 * ── ⚠️ 공개 경로(/cards/)는 없앴다 (2026-07-27)
 * 그건 인스타 Graph API가 **공개 URL로만** 이미지를 가져가기 때문에 있던 통로다.
 * 오너 결정으로 자동 발행을 접었으니 그 통로를 찾아올 상대가 없다.
 * 쓸 데 없이 열린 문은 닫는다 — 이제 전부 비밀번호 뒤에 있다.
 * 자동 발행을 다시 켤 땐 이 스크립트의 공개 스테이징과 worker.js 예외를 함께 되살린다.
 *
 * ── JPEG 로 바꾸는 이유
 * 인스타가 받는 형식이고, PNG보다 훨씬 가볍다. 카드 렌더러의 Chromium 으로 변환한다.
 *
 * 실행: node scripts/stage-public-cards.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SETS = join(ROOT, "data/review/sets.json");
/* 오너가 수동 업로드할 원본 — 비밀번호 문 **안쪽**이라 공개되지 않는다.
 * (2026-07-26 오너: "인스타는 당분간 내가 수동으로 올릴거야" — 그런데 원본을
 *  받을 통로가 없었다. 관제탑 화면의 이미지는 900px 축소본이라 업로드용이 아니다.) */
const DL = join(ROOT, "packages/tower-worker/_site/download");
/* 이미 올린 물건 — published/ 를 그대로 문 안쪽에 복사한다(이미 JPEG라 변환 불필요) */
const PUB_SRC = join(ROOT, "published");
const PUB_DST = join(ROOT, "packages/tower-worker/_site/published");
const CONTENT = join(ROOT, "data/content");
const RENDERS = join(ROOT, "data/out");

const norm = (s) => String(s || "").replace(/\s+/g, "").replace(/[·—\-*'"'()[\]🔥💸🏢⚠️]/g, "").toLowerCase();

if (!existsSync(SETS)) {
  console.log("세트 정의가 없습니다 — 건너뜁니다.");
  process.exit(0);
}

const sets = JSON.parse(readFileSync(SETS, "utf8")).sets || [];

/** slug → 렌더된 PNG 경로들(장 순서) */
function pagesOf(slug) {
  if (!existsSync(RENDERS)) return [];
  const out = [];
  for (const d of readdirSync(RENDERS).sort()) {
    /* ⚠️ `_spike` 는 **작업용 스크래치**다 — `--publish` 없이 돌린 빌더의 산출이 거기 떨어진다.
       그걸 날짜 폴더와 똑같이 훑으면 같은 카드가 두 번 잡혀 **1장짜리가 2장으로 나간다**
       (2026-09-03 실측: danji-mokdong 이 2장으로 찍히고 결재 화면에 없는 2번째 장 링크가 걸렸다).
       밑줄로 시작하는 폴더는 날짜가 아니다 — 건너뛴다. */
    if (d.startsWith("_")) continue;
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

/* ① 내려받기용(문 안쪽, /download/) — 렌더가 있는 **모든** 세트.
 * 오너가 수동 업로드·검토용으로 원본을 받아가는 자리다. */
const dlManifest = [];
for (const set of sets) {
  const m = await stageSet(set, DL, "download");
  if (m) dlManifest.push(m);
}

await browser.close();
writeFileSync(join(DL, "index.json"), JSON.stringify({ sets: dlManifest }, null, 2) + "\n", "utf8");

/* ② 완성본(문 안쪽, /published/) — 이미 올린 물건. 저장소에 커밋된 실물을 그대로 복사한다.
 * 다시 그리지 않는다 — 그때 나간 픽셀이어야 '무엇을 발행했는가'의 증거가 된다. */
let pubN = 0;
if (existsSync(PUB_SRC)) {
  rmSync(PUB_DST, { recursive: true, force: true });
  cpSync(PUB_SRC, PUB_DST, { recursive: true });
  for (const d of readdirSync(PUB_DST)) {
    try {
      pubN += readdirSync(join(PUB_DST, d)).filter((f) => /\.(jpg|png)$/i.test(f)).length;
    } catch {
      /* index.json 같은 파일은 폴더가 아니다 */
    }
  }
}

/* ③ 완성본을 **폰에서 볼 수 있게** 한다 — 폴더마다 index.html, 그리고 전체 목록 페이지.
 *
 * ── 왜 (2026-08-01 오너 "모바일에서 완성된 카드 모아둔 곳 어떻게 보지?" + 404 스크린샷)
 * 관제탑 보관함의 [실물 열기] 는 `/published/{폴더}/` 를 여는데, 그 폴더에는 JPEG·캡션·meta 만
 * 있고 **index.html 이 없었다.** Cloudflare 정적 자산은 index 없는 폴더를 목록으로 보여주지
 * 않으므로 **11개 발행본 전부 404** 였다. 링크가 있는데 열리지 않는 것은 없는 것보다 나쁘다.
 * 다시 그리지 않는다 — 저장소에 커밋된 그때 그 JPEG 를 그대로 감싸 보여주기만 한다. */
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SHELL = (title, body) => `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · wirit.</title><style>
:root{--ink:#141821;--paper:#FAFAF8;--gray:#5B6B7F;--cobalt:#2E6BFF}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--paper);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard",sans-serif;-webkit-text-size-adjust:100%}
header{background:var(--ink);color:#fff;padding:18px 20px;position:sticky;top:0;z-index:9}
header a{color:#aeb8c4;text-decoration:none;font-size:14px}
header .wm{font-weight:800;letter-spacing:-.02em}header .wm i{color:var(--cobalt);font-style:normal}
h1{font-size:20px;font-weight:800;letter-spacing:-.02em;margin:6px 0 2px;line-height:1.3}
.sub{color:var(--gray);font-size:13px}
main{padding:16px 14px 60px;max-width:720px;margin:0 auto}
.card{display:block;width:100%;border-radius:10px;margin:0 0 14px;box-shadow:0 2px 10px rgba(20,24,33,.12)}
.cap{background:#fff;border:1px solid rgba(20,24,33,.12);border-radius:10px;padding:14px;margin-top:8px}
.cap pre{white-space:pre-wrap;word-break:break-word;font:15px/1.65 inherit}
button{appearance:none;border:0;background:var(--cobalt);color:#fff;font-weight:700;font-size:15px;
 padding:12px 16px;border-radius:10px;width:100%;margin-top:10px}
ul{list-style:none}li{margin-bottom:12px}
.row{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid rgba(20,24,33,.12);
 border-radius:12px;padding:10px;text-decoration:none;color:inherit}
.row img{width:76px;height:95px;object-fit:cover;border-radius:8px;flex:none;background:#eee}
.row .t{font-weight:700;font-size:15px;line-height:1.35;letter-spacing:-.01em}
.row .m{color:var(--gray);font-size:13px;margin-top:3px}
</style></head><body>${body}
<script>function cp(id){var t=document.getElementById(id).textContent;
navigator.clipboard.writeText(t).then(function(){var b=event.target;var o=b.textContent;b.textContent='복사됐습니다 ✓';setTimeout(function(){b.textContent=o},1500)})}</script>
</body></html>`;

let pages = 0;
if (existsSync(PUB_DST)) {
  const dirs = readdirSync(PUB_DST).filter((d) => { try { return readdirSync(join(PUB_DST, d)).length > 0; } catch { return false; } });
  const rows = [];
  for (const d of dirs) {
    const dir = join(PUB_DST, d);
    const jpgs = readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f))
      .sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0) || a.localeCompare(b));
    if (!jpgs.length) continue;
    let meta = {};
    try { meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8")); } catch { /* 예전 발행분엔 meta 가 없다 */ }
    let caption = meta.caption || "";
    if (!caption) { try { caption = readFileSync(join(dir, "caption.txt"), "utf8"); } catch { /* 없으면 없는 대로 */ } }
    const title = meta.title || d;
    const at = meta.publishedAt || (d.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || "";
    const body = `<header><a href="../">← 완성본 전체</a><h1>${esc(title)}</h1>
<div class="sub">${esc(at)}${at ? " 발행 · " : ""}${jpgs.length}장</div></header>
<main>${jpgs.map((f) => `<img class="card" src="${encodeURIComponent(f)}" alt="">`).join("\n")}
${caption ? `<div class="cap"><pre id="cap">${esc(caption.trim())}</pre>
<button onclick="cp('cap')">캡션 복사</button></div>` : ""}</main>`;
    writeFileSync(join(dir, "index.html"), SHELL(title, body), "utf8");
    pages++;
    rows.push({ d, title, at, n: jpgs.length, thumb: jpgs[0] });
  }
  rows.sort((a, b) => (b.at || "").localeCompare(a.at || "") || b.d.localeCompare(a.d));
  const list = `<header><a href="../">← 관제탑</a><h1>완성본 보관함</h1>
<div class="sub">인스타에 올린 그대로 · ${rows.length}건</div></header>
<main><ul>${rows.map((r) => `<li><a class="row" href="${encodeURIComponent(r.d)}/">
<img src="${encodeURIComponent(r.d)}/${encodeURIComponent(r.thumb)}" alt="">
<div><div class="t">${esc(r.title)}</div><div class="m">${esc(r.at || "발행일 미상")} · ${r.n}장</div></div></a></li>`).join("\n")}</ul></main>`;
  writeFileSync(join(PUB_DST, "index.html"), SHELL("완성본 보관함", list), "utf8");
}

console.log(`🖼  내려받기(문 안) ${dlManifest.reduce((n, m) => n + m.files.length, 0)}장 · 완성본 ${pubN}장 · 완성본 페이지 ${pages}개(+목록 1)`);
for (const m of dlManifest) console.log(`   · ${m.label} — ${m.files.length}장 · 캡션 ${m.caption ? m.caption.length + "자" : "없음"}`);
