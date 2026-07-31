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
    ...pick("._article_content"),       // 네이버 모바일 (naver.me 단축링크가 여기로 온다)
    ...pick("#comp_news_article"),      // 네이버 모바일(구)
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

/* ── 실패했을 때 **무엇이 거기 있었는지** 통째로 남긴다 (2026-07-31)
 * "본문 0자"만 알면 선택자 문제인지 렌더 타이밍인지 차단 화면인지 못 가른다.
 * 세션은 Actions 로그 말고는 볼 방법이 없으므로, 판별에 필요한 것을 한 번에 적는다. */
const PROBE = `() => {
  const sels = ["#dic_area","#newsct_article","._article_content","#comp_news_article",
    "[data-article-body]",".article_view","#harmonyContainer","article",
    ".news_end",".article-body",".art_txt","#articleBody",".news_view",".newsct_article","#ct","#contents"];
  const hits = sels.map(s => {
    const els = [...document.querySelectorAll(s)];
    const len = els.reduce((a,e) => a + ((e.innerText||"").trim().length), 0);
    return els.length ? (s + " ×" + els.length + " (" + len + "자)") : null;
  }).filter(Boolean);
  const metas = [...document.querySelectorAll("meta")]
    .map(m => (m.getAttribute("property")||m.getAttribute("name")||""))
    .filter(n => /og:|title|article/i.test(n)).slice(0, 12);
  const b = document.body;
  return {
    href: location.href, readyState: document.readyState, title: document.title,
    bodyText: (b ? (b.innerText||"").trim().length : -1),
    bodyChildren: b ? b.childElementCount : -1,
    iframes: document.querySelectorAll("iframe").length,
    hits, metas,
    head: (b ? (b.innerText||"").trim().slice(0, 600) : ""),
  };
}`;


/* ── HTML 문자열에서 직접 뽑기 (2026-07-31)
 * 페이지 **안**에서 읽은 값이 전부 비어 오는 일이 있었다 —
 * title 도 body.innerText 도 심지어 location.href 까지 빈 문자열인데,
 * page.content() 는 337KB 를 멀쩡히 돌려줬다. 실행 컨텍스트가 깨진 것이지
 * 페이지가 없는 게 아니다. 그러면 컨텍스트를 쓰지 않으면 된다 —
 * 받아 둔 HTML 을 Node 에서 직접 파싱한다. 브라우저 안 상태에 기대지 않는 길이다. */
/* ── 모바일 주소를 PC 주소로 바꾼다 (2026-07-31)
 * 이 스크립트의 1순위 선택자 `#dic_area` 는 네이버 **PC판** 본문 id 다.
 * 그런데 naver.me 단축링크는 `n.news.naver.com`(**모바일판**)으로 떨어지고,
 * 모바일판은 클라이언트 렌더라 초기 HTML 에 본문이 없다.
 * 즉 "모바일로 들어가서 PC용 선택자로 찾고 있었다" — 다섯 번 실패한 진짜 이유다.
 * (research/articles 의 기존 두 건도 전부 오너가 본문을 붙여 준 것이었다.
 *  이 통로로 네이버를 읽어낸 적은 한 번도 없었다.)
 *
 * 기사 번호(oid/aid)만 알면 PC 주소를 만들 수 있다. PC판은 서버 렌더라 본문이 HTML 에 있다.
 * 원본 주소도 함께 돌려줘서, PC 주소가 실패하면 원본으로 한 번 더 시도한다.
 */
function urlCandidates(url) {
  const out = [];
  // https://n.news.naver.com/mnews/article/003/0014099900  (?sid=101 등 뒤에 붙어도 됨)
  // https://n.news.naver.com/article/003/0014099900
  const m = url.match(/n\.news\.naver\.com\/(?:mnews\/)?article\/(\d+)\/(\d+)/);
  if (m) {
    out.push(`https://news.naver.com/main/read.naver?mode=LSD&mid=shm&oid=${m[1]}&aid=${m[2]}`);
    out.push(`https://news.naver.com/mnews/article/${m[1]}/${m[2]}`);
  }
  // 다음 모바일 → PC
  const d = url.match(/v\.daum\.net\/v\/(\w+)/);
  if (d) out.push(`https://news.v.daum.net/v/${d[1]}`);
  out.push(url); // 원본은 언제나 마지막 후보
  return [...new Set(out)];
}

function fromHtml(html) {
  if (!html || html.length < 500) return null;
  const meta = (n) => {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${n}["'][^>]*content=["']([^"']*)["']`, "i");
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${n}["']`, "i");
    const m = html.match(re) || html.match(re2);
    return m ? m[1].trim() : "";
  };
  // 본문 컨테이너 후보를 열어 그 안의 텍스트를 뽑는다. 가장 긴 것을 쓴다.
  const IDS = ["dic_area", "newsct_article", "articleBody", "harmonyContainer", "comp_news_article"];
  const CLS = ["_article_content", "article_view", "news_end", "article-body", "art_txt", "newsct_article"];
  const chunks = [];
  for (const id of IDS) {
    const m = html.match(new RegExp(`<[a-z]+[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/(?:div|article|section)>`, "i"));
    if (m) chunks.push(m[1]);
  }
  for (const c of CLS) {
    const m = html.match(new RegExp(`<[a-z]+[^>]*class=["'][^"']*${c}[^"']*["'][^>]*>([\\s\\S]*?)<\\/(?:div|article|section)>`, "i"));
    if (m) chunks.push(m[1]);
  }
  const strip = (s) =>
    s
      .replace(/<script[\\s\\S]*?<\/script>/gi, " ")
      .replace(/<style[\\s\\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  const texts = chunks.map(strip).filter((s) => s.length > 200);
  texts.sort((a, b) => b.length - a.length);
  const titleTag = (html.match(/<title[^>]*>([\\s\\S]*?)<\/title>/i) || [])[1] || "";
  return {
    title: meta("og:title") || strip(titleTag),
    outlet: meta("og:site_name"),
    published: meta("article:published_time"),
    desc: meta("og:description"),
    body: texts[0] || "",
    finalUrl: meta("og:url"),
  };
}

mkdirSync(OUT, { recursive: true });
let ok = 0;
const results = [];
const probes = [];

for (const url of urls) {
  const page = await ctx.newPage();
  let got = null;
  let err = "";
  let probe = null;
  /* 단축·모바일 주소는 PC 주소로 바꿔 먼저 시도한다(위 urlCandidates 주석 참고).
   * naver.me 처럼 한 번 튕기는 주소는 먼저 열어 최종 주소를 알아낸 뒤 후보를 다시 만든다. */
  let candidates = urlCandidates(url);
  if (/naver\.me|url\.kr|bit\.ly/.test(url)) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(2500);
      const landed = page.url();
      if (landed && landed !== url) {
        console.log(`   ↳ 단축주소 해석: ${landed}`);
        candidates = urlCandidates(landed);
      }
    } catch { /* 못 풀면 원래 후보로 간다 */ }
  }
  console.log(`   ↳ 시도할 주소 ${candidates.length}개: ${candidates.join(" · ")}`);

  for (let attempt = 0; attempt < candidates.length; attempt++) {
    const tryUrl = candidates[attempt];
    const last = attempt === candidates.length - 1;
    try {
      const res = await page.goto(tryUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      /* ⚠️ 단축 URL(naver.me 등)은 **도착한 뒤 한 번 더 이동한다.**
       * 이동 중에 읽으면 빈 문서를 읽는다 — 2026-07-31 에 실제로 그랬다:
       * HTTP 200 · HTML 362KB 인데 제목도 location.href 도 빈 문자열이었다.
       * 그래서 주소가 **멎을 때까지** 기다린 뒤에 읽는다. */
      let seen = "";
      for (let w = 0; w < 12; w++) {
        await page.waitForTimeout(700);
        const now = page.url();
        if (now === seen && now && now !== "about:blank") break;
        seen = now;
      }
      await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1200); // JS가 본문을 채울 틈
      got = await page.evaluate(EXTRACT);
      /* finalUrl 은 Node 쪽에서도 잡는다 — 페이지 안에서 읽은 값이 비는 경우가 있다 */
      if (got && !got.finalUrl) got.finalUrl = page.url();
      if (got && got.body && got.body.length > 200) break;
      /* ⚠️ 판정만 남기면 다음 사람이 또 추측한다. **무엇을 받았는지** 적는다.
       * (2026-07-29: 네이버·다음이 본문 0자로 왔는데 원인이 봇 차단인지 선택자
       *  문제인지 구분할 근거가 로그에 없었다) */
      const html = await page.content().catch(() => "");
      /* 페이지 안 읽기가 빈손이면 HTML 을 직접 판다 — 실행 컨텍스트에 기대지 않는 길 */
      if (!got || !got.body || got.body.length < 200) {
        const alt = fromHtml(html);
        if (alt && alt.body && alt.body.length > 200) {
          if (!alt.finalUrl) alt.finalUrl = page.url();
          got = alt;
          console.log(`   ↳ HTML 직접 파싱으로 회수 (${alt.body.length}자)`);
          break;
        }
      }
      err =
        `본문 ${got?.body?.length || 0}자 · HTTP ${res?.status() || "?"} · HTML ${html.length}자 · ` +
        `제목 "${(got?.title || "").slice(0, 40)}" · 최종URL ${(got?.finalUrl || page.url() || "").slice(0, 100)}`;
      /* 마지막 시도까지 못 읽었으면 **거기 무엇이 있었는지**를 통째로 남긴다.
       * 페이지를 닫기 전에만 찍을 수 있으므로 여기서 찍는다. */
      if (last) probe = await page.evaluate(PROBE).catch((e) => ({ probeError: String(e?.message || e) }));
    } catch (e) {
      err = String(e?.message || e).slice(0, 140);
    }
    /* 재시도는 **전략을 바꿔서** 한다. 같은 방식으로 세 번 하면 세 번 같은 결과다.
     * 2차부터는 네트워크가 잠잠해질 때까지(networkidle) 기다린 뒤 읽는다. */
    if (!last) {
      await new Promise((r) => setTimeout(r, 1500));
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    }
  }
  if (probe) {
    console.log(`\n── 진단: ${url} 에 실제로 있던 것 ──`);
    console.log(JSON.stringify(probe, null, 1).slice(0, 2500));
    console.log("──────────────────────────────\n");
  }
  await page.close();

  if (!got || !got.body || got.body.length < 200) {
    console.log(`::warning::못 읽음 — ${url} (${err})`);
    results.push({ url, ok: false, err });
    continue;
  }
  void probes;

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
