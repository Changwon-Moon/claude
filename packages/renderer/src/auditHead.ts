/**
 * 머리 규격 전수 점검 — 우상단 wirit 뱃지 · 카드 위 여백 · 최외곽 흰 테두리.
 *
 * 왜 이 파일인가 (2026-07-31 오너 "위릿뱃지와 카드 흰색테두리 등 기준에 안맞는거 전체 수정"):
 * 템플릿마다 `.wirit-corner`·카드 패딩을 제 맘대로 재정의해 놓아서 **같은 계정의 카드인데
 * 머리 모양이 제각각**이었다. designQa 는 카드 한 장씩만 보고 warn 을 흘려서, 여러 장을
 * 나란히 놓고서야 보이는 이 문제를 아무도 못 잡았다. 전수 표로 한눈에 비교한다.
 *
 * 실행: pnpm --filter @wirit/renderer audit-head
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadTemplate } from "./loadTemplate.js";
import { renderPageHtml } from "./renderHtml.js";
import { getBrowser, closeBrowser } from "./screenshot.js";

const ROOT = path.resolve(process.cwd(), "../..");
const CONTENT = path.join(ROOT, "data/content");

const MEASURE = `(() => {
  var card = document.querySelector(".wirit-card");
  var cs = getComputedStyle(card);
  var af = getComputedStyle(card, "::after");
  var b = card.querySelector(".wirit-corner");
  var m = b && b.querySelector(".mark");
  return {
    padTop: Math.round(parseFloat(cs.paddingTop) || 0),
    padSide: Math.round(parseFloat(cs.paddingLeft) || 0),
    badgeBg: b ? getComputedStyle(b).backgroundColor : "(뱃지 없음)",
    badgeRadius: b ? getComputedStyle(b).borderTopLeftRadius : "-",
    markPx: m ? Math.round(parseFloat(getComputedStyle(m).fontSize)) : null,
    markColor: m ? getComputedStyle(m).color : "-",
    afterBorder: af.borderTopWidth + " " + af.borderTopColor,
    afterShadow: (af.boxShadow || "").slice(0, 60),
  };
})()`;

function findCards(): { slug: string; file: string }[] {
  const out: { slug: string; file: string }[] = [];
  if (!fs.existsSync(CONTENT)) return out;
  const days = fs.readdirSync(CONTENT).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse();
  const seen = new Set<string>();
  for (const d of days)
    for (const f of fs.readdirSync(path.join(CONTENT, d))) {
      if (!f.endsWith(".json") || f === "index.json") continue;
      const slug = f.replace(/\.json$/, "");
      if (seen.has(slug)) continue;
      seen.add(slug);
      out.push({ slug, file: path.join(CONTENT, d, f) });
    }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

async function main() {
  const cards = findCards();
  const browser = await getBrowser();
  const rows: any[] = [];
  for (const c of cards) {
    const doc = JSON.parse(fs.readFileSync(c.file, "utf8"));
    if (!doc.template) continue;
    let tpl;
    try { tpl = loadTemplate(doc.template); } catch { continue; }
    const html = renderPageHtml(tpl, doc);
    const ctx = await browser.newContext({
      viewport: { width: tpl.config.width, height: tpl.config.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const tmp = path.join(tpl.dir, `.audit-tmp-${process.pid}.html`);
    fs.writeFileSync(tmp, html, "utf8");
    try {
      await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
      await page.evaluate("document.fonts && document.fonts.ready");
      const g: any = await page.evaluate(MEASURE);
      rows.push({ slug: c.slug, template: String(doc.template), ...g });
    } finally {
      await ctx.close();
      try { fs.unlinkSync(tmp); } catch { /* noop */ }
    }
  }
  await closeBrowser();

  const INK = "rgb(20, 24, 33)";
  /* 표지형(전면 사진) 카드는 예외다 — 사진 위에서는 잉크네이비 판이 안 보여 흰 판을 쓰고,
     제목이 사진 전체를 덮으므로 카드 패딩이 0 이다. BRAND.md·CARD_CHECKLIST §2 에 명시된 예외. */
  const isCover = (r: any) => /cover/.test(r.template);
  const okBadge = (r: any) => r.badgeBg === INK;
  const okMark = (r: any) => r.markPx === 36;
  /* 기준보다 **좁은** 것만 위반이다. 더 준 것(예: singoga-map compact 92px — 제목이 뱃지에
     붙지 않게 일부러 내림)은 머리를 깎은 게 아니므로 허용하고 ⬆ 로 표시한다. */
  const okPad = (r: any) => r.padTop >= 72;
  const okBorder = (r: any) => r.afterBorder.startsWith("3px") && r.afterBorder.includes("255, 255, 255");

  console.log("\n📐 머리 규격 전수 점검 — 공용 기준: 위 여백 ≥72px · 뱃지 잉크네이비 · 글자 36px · 흰 테두리 3px");
  console.log("   (표지형 전면 사진 카드는 예외 — 흰 판 뱃지·패딩 0 이 정상)\n");
  console.log("카드".padEnd(24) + "템플릿".padEnd(22) + "위여백  뱃지판   글자   흰테두리");
  console.log("─".repeat(88));
  let bad = 0;
  for (const r of rows) {
    const cover = isCover(r);
    const violated = !cover && [okPad(r), okBadge(r), okMark(r), okBorder(r)].some((f) => !f);
    if (violated) bad++;
    const pad = cover ? " 표지 " : okPad(r) ? (r.padTop === 72 ? "  ✅  " : ` ⬆${String(r.padTop).padStart(3)} `) : ` ❌${String(r.padTop).padStart(3)} `;
    console.log(
      r.slug.padEnd(24) +
        r.template.padEnd(22) +
        pad +
        (cover ? " 표지  " : okBadge(r) ? "  ✅   " : "  ❌   ") +
        (okMark(r) ? " ✅  " : ` ❌${String(r.markPx ?? "-").padStart(3)}`) +
        (okBorder(r) ? "   ✅" : "   ❌ " + r.afterBorder),
    );
  }
  console.log("─".repeat(88));
  console.log(`총 ${rows.length}장 · 규격 위반 ${bad}장 (표지형 예외 ${rows.filter(isCover).length}장 제외)\n`);
  process.exit(bad > 0 ? 1 : 0);
}
main();
