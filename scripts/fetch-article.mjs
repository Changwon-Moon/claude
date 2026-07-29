/**
 * 기사 URL을 열어 본문을 저장소에 남긴다.
 *
 * ── 왜 필요한가 (2026-07-29)
 * 오너가 기사 링크를 주시는데 작업 세션은 네이버·다음을 못 읽는다(차단).
 * 그때마다 "못 읽습니다"라고 답하면 오너가 본문을 손으로 옮겨야 한다.
 * Actions 안에서는 네트워크가 열려 있으니 **여기서 읽어 저장소에 남긴다.**
 * 한 번 저장하면 다음 세션도 그 기사를 읽을 수 있다 — 회사의 기억이 된다.
 *
 * ── ⚠️ 기사는 2차 출처다
 * 여기서 받은 숫자를 **카드에 그대로 쓰지 않는다.** 기사는 두 가지에만 쓴다:
 *   ① 시의성 훅 — "오늘 이런 기사가 났다"
 *   ② 검증 대상 — 기사가 말한 수치를 우리가 1차 출처로 다시 확인한다
 * 카드의 숫자는 언제나 원자료에서 코드로 뽑는다(ARCHITECTURE.md §2).
 *
 * ── 왜 브라우저로 여는가
 * 네이버·다음 기사는 JS로 본문을 채운다. 단순 fetch 로는 껍데기만 온다.
 * 렌더러의 Chromium 을 재사용해 실제로 그려진 글을 읽는다.
 *
 * 실행: node scripts/fetch-article.mjs <url> [url…]
 * 산출: research/articles/{YYYY-MM-DD}-{슬러그}.md
 */
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "research/articles");

const urls = process.argv.slice(2).filter((a) => /^https?:\/\//.test(a));
if (!urls.length) {
  console.error("사용법: node scripts/fetch-article.mjs <기사 URL> [URL…]");
  process.exit(1);
}

const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const { chromium } = require("playwright-core");
const PINNED = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const browser = await chromium.launch(existsSync(PINNED) ? { executablePath: PINNED } : {});
const ctx = await browser.newContext({
  // 봇으로 보이면 막힌다. 실제 브라우저와 같은 신원으로 요청한다.
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
  locale: "ko-KR",
  viewport: { width: 1280, height: 900 },
});

/** 파일명에 쓸 수 있게 제목을 줄인다(한글은 살린다) */
const slug = (s) =>
  String(s || "article")
    .replace(/\s+/g, "-")
    .replace(/[^0-9A-Za-z가-힣\-]/g, "")
    .slice(0, 50) || "article";

/** 기사 본문 후보 — 언론사마다 컨테이너가 다르다. 넓게 훑고 가장 긴 것을 쓴다. */
const EXTRACT = `() => {
  const pick = (sel) => [...document.querySelectorAll(sel)].map(e => e.innerText || "");
  const cands = [
    ...pick("#dic_area"),               // 네이버 뉴스
    ...pick("#newsct_article"),         // 네이버 뉴스(신)
    ...pick("[data-article-body]"),
    ...pick(".article_view"),           // 다음
    ...pick("#harmonyContainer"),       // 다음(신)
    ...pick("article"),
    ...pick(".news_end, .article-body, .art_txt, #articleBody, .news_view"),
  ].map(t => (t || "").trim()).filter(t => t.length > 200);
  cands.sort((a, b) => b.length - a.length);
  const body = cands[0] || (document.body ? document.body.innerText : "");
  const metaOf = (n) => {
    const el = document.querySelector('meta[property="' + n + '"], meta[name="' + n + '"]');
    return el ? el.getAttribute("content") || "" : "";
  };
  return {
    title: (metaOf("og:title") || document.title || "").trim(),
    outlet: (metaOf("og:site_name") || metaOf("dable:author") || "").trim(),
    published: (metaOf("article:published_time") || metaOf("dable:item_id") || "").trim(),
    desc: metaOf("og:description").trim(),
    body: body.trim(),
    finalUrl: location.href,
  };
}`;

mkdirSync(OUT, { recursive: true });
let ok = 0;
const results = [];

for (const url of urls) {
  const page = await ctx.newPage();
  let got = null;
  let err = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(1500); // JS가 본문을 채울 틈
      got = await page.evaluate(EXTRACT);
      if (got && got.body && got.body.length > 200) break;
      /* ⚠️ 판정만 남기면 다음 사람이 또 추측한다. **무엇을 받았는지** 적는다.
       * (2026-07-29: 네이버·다음이 본문 0자로 왔는데 원인이 봇 차단인지 선택자
       *  문제인지 구분할 근거가 로그에 없었다) */
      const html = await page.content().catch(() => "");
      err =
        `본문 ${got?.body?.length || 0}자 · HTTP ${res?.status() || "?"} · HTML ${html.length}자 · ` +
        `제목 "${(got?.title || "").slice(0, 40)}" · 최종URL ${(got?.finalUrl || "").slice(0, 80)}`;
    } catch (e) {
      err = String(e?.message || e).slice(0, 140);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  await page.close();

  if (!got || !got.body || got.body.length < 200) {
    console.log(`::warning::못 읽음 — ${url} (${err})`);
    results.push({ url, ok: false, err });
    continue;
  }

  /* 날짜는 **기사가 말하는 발행일**을 쓴다. 없으면 파일명에서 유추하지 않고 'unknown' 을 쓴다 —
   * 실행 시각을 발행일로 적으면 나중에 그게 사실인 줄 알고 인용하게 된다. */
  const pub = (got.published || "").slice(0, 10);
  const datePart = /^\d{4}-\d{2}-\d{2}$/.test(pub) ? pub : "unknown";
  const file = join(OUT, `${datePart}-${slug(got.title)}.md`);

  const md = [
    `# ${got.title || "(제목 없음)"}`,
    ``,
    `- 원문: ${got.finalUrl || url}`,
    `- 언론사: ${got.outlet || "(확인 필요)"}`,
    `- 기사 발행일: ${datePart === "unknown" ? "(메타에 없음 — 본문에서 확인)" : datePart}`,
    `- 요약(og:description): ${got.desc || "—"}`,
    ``,
    `> ⚠️ **2차 출처다.** 여기 있는 숫자를 카드에 그대로 쓰지 않는다.`,
    `> 훅(시의성)으로 쓰거나, 1차 출처로 다시 확인한 뒤에만 쓴다.`,
    ``,
    `---`,
    ``,
    got.body,
    ``,
  ].join("\n");

  writeFileSync(file, md, "utf8");
  console.log(`📄 ${file.replace(ROOT + "/", "")}  (${got.body.length}자)`);
  results.push({ url, ok: true, file, title: got.title, chars: got.body.length });
  ok++;
}

await browser.close();

console.log(`\n${ok}/${urls.length}건 저장`);
if (existsSync(OUT)) console.log(`보관된 기사 총 ${readdirSync(OUT).filter((f) => f.endsWith(".md")).length}건`);
// 하나도 못 읽었으면 실패로 끝낸다 — 조용히 넘어가면 오너는 저장된 줄 안다
if (!ok) {
  console.log(
    "\n한 건도 못 읽었습니다. 위 진단(HTTP·HTML 길이·제목)을 보고 원인을 가리세요:\n" +
      "  · HTML 이 짧다 → 봇 차단 화면일 가능성. 그 사이트는 이 통로로 못 읽는다\n" +
      "  · HTML 은 긴데 본문 0자 → 본문 선택자를 추가해야 한다(EXTRACT)\n" +
      "  어느 쪽이든 우회를 억지로 시도하지 않는다 — 오너에게 본문을 받는 편이 빠르고 정직하다.",
  );
  process.exit(1);
}
