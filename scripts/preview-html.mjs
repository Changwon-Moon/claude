/**
 * 카드를 **PNG 전에 HTML 로** 한 장에 모아 본다 (오너 2026-08-31 "작업은 html로 먼저 할수 있나?").
 *
 *   node scripts/preview-html.mjs --set singo-daily-2026-08-31
 *   node scripts/preview-html.mjs --cards data/content/2026-08-31/singo-대림1-59.json ...
 *   node scripts/preview-html.mjs --set <라벨> --out /절대경로/preview.html
 *
 * ── 왜 필요한가
 * 카드는 원래 HTML/CSS 로 그려지고 그걸 Playwright 가 스크린샷 찍는다. 그러니 **렌더 직전
 * HTML 이 곧 카드**다. 열다섯 장을 PNG 로 받아 하나씩 여는 것보다, 같은 화면에 세로로 놓고
 * 훑는 편이 「이 카드만 라벨이 곡선을 뚫었다」 같은 것을 훨씬 빨리 잡는다.
 *
 * ── ⚠️ 이것은 검수를 대신하지 않는다
 * 발행되는 것은 PNG 이고, `designQa` 는 그 PNG 를 만든 페이지의 좌표를 실측한다.
 * 이 미리보기는 **눈으로 먼저 보는 자리**지 통과·불통과를 정하는 자리가 아니다.
 * 절차는 그대로다: 빌드 → 캡션 → `produce-card`(렌더+검수) → 오너 확정.
 *
 * ── 자족(self-contained) 한 파일로 만든다
 * 오너는 이 파일 하나를 브라우저로 연다. 그래서 폰트(woff2)**와 그림(사진·로고·국기)**을
 * data: URI 로 박아 넣는다. 그림을 빠뜨리면 카드가 망가진 것처럼 보인다 —
 * 2026-09-01 에 m2-gov 미리보기에서 대통령 사진 6장이 빈칸으로 나가 실제로 그렇게 읽혔다.
 * 폰트가 없으면 글자 폭이 달라져 **실물과 다른 그림**을 보게 되는데, 그러면 미리보기가
 * 거짓말을 하는 셈이라 미리보기가 아니라 함정이 된다.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ── ⓪ tsx 로 다시 띄운다
 * 이 스크립트는 렌더러의 **TypeScript 원본**(loadTemplate·renderHtml)을 직접 부른다.
 * 그 파일들은 서로를 `./paths.js` 처럼 부르는데(TS 규약), 맨 node 는 그 `.js` 를 못 찾는다.
 * 그래서 tsx 로 한 번 갈아탄다 — 오너·다음 세션은 `node scripts/preview-html.mjs` 만 치면 된다.
 * 경로는 여기서 **절대경로로 바꿔** 넘긴다(tsx 는 renderer 폴더에서 돌아 cwd 가 달라진다). */
if (!process.env.WIRIT_PREVIEW_TSX) {
  const passed = process.argv.slice(2).map((a) => {
    if (a.startsWith("--")) return a;
    return /\.(json|html)$/i.test(a) ? resolve(process.cwd(), a) : a;
  });
  const r = spawnSync(
    "pnpm",
    ["-s", "--filter", "@wirit/renderer", "exec", "tsx", fileURLToPath(import.meta.url), ...passed],
    { cwd: ROOT, stdio: "inherit", env: { ...process.env, WIRIT_PREVIEW_TSX: "1" } },
  );
  process.exit(r.status ?? 1);
}
const R = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const argList = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  if (i < 0) return [];
  const out = [];
  for (let j = i + 1; j < process.argv.length && !process.argv[j].startsWith("--"); j++)
    out.push(process.argv[j]);
  return out;
};

/* ── ① 어떤 카드를 볼 것인가 ────────────────────────────────────────── */

const setLabel = arg("set");
let cardPaths = argList("cards").map((p) => resolve(process.cwd(), p));

if (setLabel) {
  const raw = JSON.parse(readFileSync(R("data/review/sets.json"), "utf8"));
  const sets = Array.isArray(raw.sets) ? raw.sets : raw;
  const set = sets.find((s) => s.label === setLabel);
  if (!set) {
    console.error(`⛔ 세트를 찾을 수 없습니다: ${setLabel}`);
    process.exit(1);
  }
  /* 카드 슬러그 → 가장 최근 날짜 폴더의 JSON. `data/content/` 는 gitignore 대상이라
     세션마다 다시 만들어지고, 같은 슬러그가 여러 날짜 폴더에 있을 수 있다. */
  const days = readdirSync(R("data/content")).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse();
  for (const slug of set.cards ?? []) {
    const day = days.find((d) => existsSync(R(`data/content/${d}/${slug}.json`)));
    if (!day) {
      console.warn(`   ⓘ ${slug} — 카드 파일이 없어 건너뜁니다 (빌더를 먼저 돌리세요)`);
      continue;
    }
    cardPaths.push(R(`data/content/${day}/${slug}.json`));
  }
}

if (!cardPaths.length) {
  console.error(
    "⛔ 볼 카드가 없습니다.\n" +
      "   node scripts/preview-html.mjs --set <세트라벨>\n" +
      "   node scripts/preview-html.mjs --cards <카드.json> [<카드.json> ...]",
  );
  process.exit(1);
}

/* ── ② 카드마다 렌더 직전 HTML 을 만든다 ─────────────────────────────── */

const { loadTemplate } = await import("../packages/renderer/src/loadTemplate.ts");
const { renderPageHtml } = await import("../packages/renderer/src/renderHtml.ts");
const { validateAgainstTemplate } = await import("../packages/renderer/src/validate.ts");
const { getBrowser, closeBrowser, findChromiumExecutable } = await import(
  "../packages/renderer/src/screenshot.ts"
);
const { pathToFileURL } = await import("node:url");
const { unlinkSync } = await import("node:fs");

/** 문서 공통 필드 + 페이지 필드 (renderContent.ts 의 mergePageContext 와 같은 규칙) */
const mergePage = (doc, page) => {
  if (page === doc) return doc;
  const { pages: _p, ...common } = doc;
  return { ...common, ...page };
};

const styles = []; // 중복 없이 모은 <style> 내용
const seenStyle = new Set();
const cards = []; // { name, body, w, h }

/* ⚠️ 판형의 `__wiritFit` 을 **반드시 돌린 뒤** 마크업을 떠 온다.
 *
 * 제목·제원은 고정 크기가 아니다 — 폰트가 다 온 뒤 실제 글자폭으로 크기를 다시 재는
 * 스크립트가 판형 안에 들어 있고, 렌더러(screenshot.ts)도 캡처 직전에 그걸 부른다.
 * 그 스크립트를 안 돌리고 마크업만 떠 오면 **긴 단지명이 카드 밖으로 잘려 보인다** —
 * 실물 PNG 는 멀쩡한데 미리보기만 깨지는 것이라, 있지도 않은 사고를 고치러 가게 된다
 * (2026-08-31 에 실제로 「수원하늘채더퍼스트2단지」·「e편한세상반월나노시티역」 두 장에서 겪었다).
 *
 * 그래서 카드마다 렌더러와 **같은 방식으로** 브라우저에 띄우고(템플릿 폴더 안 임시 파일 →
 * file:// · 상대경로 자산이 살아야 폰트 폭이 실물과 같다), 폰트를 기다리고, `__wiritFit` 을
 * 부른 다음, 그 결과가 인라인 style 로 박힌 DOM 을 떠 온다. 그러면 미리보기는 스크립트가
 * 필요 없고 — 스크립트 없이도 실물과 같은 그림이 된다. */
const browser = await getBrowser();

for (const p of cardPaths) {
  const doc = JSON.parse(readFileSync(p, "utf8"));
  const template = loadTemplate(doc.template);
  const pages = Array.isArray(doc.pages) && doc.pages.length ? doc.pages : [doc];
  for (let i = 0; i < pages.length; i++) {
    const pageData = mergePage(doc, pages[i]);
    validateAgainstTemplate(pageData, template); // 미리보기도 계약을 지킨다
    const html = renderPageHtml(template, pageData);

    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
      const css = m[1];
      if (!seenStyle.has(css)) {
        seenStyle.add(css);
        styles.push(css);
      }
    }

    const ctx = await browser.newContext({
      viewport: { width: template.config.width, height: template.config.height },
      deviceScaleFactor: 1, // 폭 계산에만 쓰므로 2배로 그릴 필요가 없다
    });
    const page = await ctx.newPage();
    const tmpPath = join(template.dir, `.preview-tmp-${process.pid}-${cards.length}.html`);
    writeFileSync(tmpPath, html, "utf8");
    let body;
    try {
      await page.goto(pathToFileURL(tmpPath).href, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts?.ready);
      await page.evaluate(() => window.__wiritFit && window.__wiritFit());
      body = await page.evaluate(() => {
        for (const s of document.querySelectorAll("script")) s.remove();
        return document.body.innerHTML;
      });
    } finally {
      await ctx.close();
      try {
        unlinkSync(tmpPath);
      } catch {
        /* 이미 지워졌으면 무시 */
      }
    }

    cards.push({
      name: p.split("/").pop().replace(/\.json$/, "") + (pages.length > 1 ? ` (${i + 1}쪽)` : ""),
      body,
      w: template.config.width,
      h: template.config.height,
    });
  }
}

await closeBrowser();

/* ── ③ 폰트를 data: URI 로 박는다 ────────────────────────────────────── */

let css = styles.join("\n\n");
const fontDir = R("templates/_shared/fonts");
let inlined = 0;
css = css.replace(/url\(\s*["']?\.\.\/_shared\/fonts\/([^"')]+)["']?\s*\)/g, (whole, file) => {
  const fp = join(fontDir, file);
  if (!existsSync(fp)) {
    console.warn(`   ⚠️ 폰트를 못 찾았습니다: ${file} — 이 서체는 실물과 다르게 보입니다`);
    return whole;
  }
  const mime = file.endsWith(".woff2") ? "font/woff2" : file.endsWith(".otf") ? "font/otf" : "font/woff";
  inlined++;
  return `url(data:${mime};base64,${readFileSync(fp).toString("base64")})`;
});

/* 남은 상대경로 자산(국기·로고·사진)이 있으면 미리보기에서 깨진다 — 조용히 넘기지 않는다. */
const leftovers = [...css.matchAll(/url\(\s*["']?(\.\.\/_shared\/[^"')]+)["']?\s*\)/g)].map((m) => m[1]);
for (const l of new Set(leftovers)) console.warn(`   ⚠️ 인라인하지 못한 자산: ${l}`);

/* ── ③-2 **본문의 이미지**도 data: URI 로 박는다 (2026-09-01) ────────────
 * 여기가 조용히 깨지던 자리다. 폰트는 CSS `url()` 이라 위에서 잡혔는데,
 * 판형이 `<img src="../_shared/photos/…">` 로 거는 사진은 **손대지도 경고하지도 않았다.**
 * 그래서 오너가 연 m2-gov 미리보기에서 **대통령 사진 6장이 통째로 빈칸**이 됐고,
 * 카드가 망가진 것처럼 보였다(실제 렌더 PNG 는 멀쩡했다).
 * danji-cover 계열(조감도)·국기 판형도 같은 방식이라 같이 살아난다.
 * 상대경로는 `templates/` 안 자산만 허용한다 — 바깥 파일을 미리보기에 담지 않는다. */
const TPL = R("templates");
const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml", gif: "image/gif" };
let imgInlined = 0;
const missing = new Set();
const inlineAttrs = (markup) =>
  markup.replace(/(\b(?:src|href|xlink:href)=)"(\.\.\/_shared\/[^"]+)"/g, (whole, attr, rel) => {
    const fp = join(TPL, rel.replace(/^\.\.\//, ""));
    const ext = (rel.split(".").pop() || "").toLowerCase();
    if (!existsSync(fp) || !MIME[ext]) { missing.add(rel); return whole; }
    imgInlined++;
    return `${attr}"data:${MIME[ext]};base64,${readFileSync(fp).toString("base64")}"`;
  });
for (const c of cards) c.body = inlineAttrs(c.body);
for (const m of missing) console.warn(`   ⚠️ 인라인하지 못한 그림: ${m} — 미리보기에서 빈칸으로 보입니다`);

/* ── ④ 한 장으로 조립 ───────────────────────────────────────────────── */

const out = arg("out") ?? R(`data/out/preview-${setLabel ?? "cards"}.html`);
mkdirSync(dirname(out), { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const page = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>위릿 카드 미리보기 — ${esc(setLabel ?? "cards")} (${cards.length}장)</title>
<style>
${css}
</style>
<style>
  /* ── 미리보기 껍데기. 카드 안쪽 CSS 와 겹치지 않게 pv- 접두사만 쓴다. */
  html,body{margin:0;background:#20242e;color:#e7ebf2;
    font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Pretendard,sans-serif;}
  .pv-head{padding:20px 24px 8px;}
  .pv-head h1{margin:0 0 4px;font-size:18px;font-weight:700;}
  .pv-head p{margin:0;opacity:.65;font-size:13px;}
  .pv-grid{display:flex;flex-wrap:wrap;gap:28px;padding:20px 24px 60px;align-items:flex-start;}
  .pv-item{width:var(--pv-w);}
  .pv-cap{display:flex;gap:8px;align-items:baseline;margin:0 0 8px;font-size:12px;opacity:.75;}
  .pv-cap b{font-size:15px;opacity:1;font-weight:700;}
  /* 카드는 1080×1350 원본 크기 그대로 그리고 **화면에서만** 축소한다.
     원본 크기로 그려야 폰트 힌팅·줄바꿈이 실물 PNG 와 같아진다. */
  .pv-frame{width:var(--pv-w);height:var(--pv-h);overflow:hidden;border-radius:10px;
    box-shadow:0 8px 28px rgba(0,0,0,.45);}
  .pv-scale{transform:scale(var(--pv-s));transform-origin:top left;}
</style>
</head><body>
<div class="pv-head">
  <h1>위릿 카드 미리보기 — ${esc(setLabel ?? "카드")} · ${cards.length}장</h1>
  <p>렌더 직전 HTML 그대로입니다(폰트 포함). 발행본은 이 화면을 1080×1350 으로 스크린샷 찍은 PNG 입니다.</p>
</div>
<div class="pv-grid">
${cards
  .map((c, i) => {
    const s = 0.36; // 화면 축소율 — 1080 → 389px
    return `  <div class="pv-item" style="--pv-w:${Math.round(c.w * s)}px;--pv-h:${Math.round(c.h * s)}px;--pv-s:${s}">
    <p class="pv-cap"><b>${i + 1}</b> ${esc(c.name)}</p>
    <div class="pv-frame"><div class="pv-scale" style="width:${c.w}px;height:${c.h}px">${c.body}</div></div>
  </div>`;
  })
  .join("\n")}
</div>
</body></html>
`;

writeFileSync(out, page);
console.log(`✅ 미리보기 ${cards.length}장 → ${out.replace(ROOT + "/", "")}`);
console.log(`   폰트 ${inlined}개 · 그림 ${imgInlined}개 인라인 · 파일 ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(1)}MB`);
if (missing.size) console.warn(`   ⛔ 그림 ${missing.size}종이 빠졌습니다 — 이 미리보기로는 확정하지 마세요`);
console.log(`\n⚠️ 이것은 눈으로 먼저 보는 자리입니다. 검수는 node scripts/produce-card.mjs <세트라벨> 가 합니다.`);
