/* 임시 측정기 — 템플릿 상자 좌표를 실제로 재서 빌더의 PANELS 와 맞춘다. */
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { loadTemplate } from "./loadTemplate.js";
import { renderPageHtml } from "./renderHtml.js";
import { getBrowser, closeBrowser } from "./screenshot.js";

async function main() {
  const doc = JSON.parse(readFileSync(process.argv[2], "utf8"));
  const t = loadTemplate(doc.template);
  const html = renderPageHtml(t, doc);
  const tmp = path.join(t.dir, `.measure-${process.pid}.html`);
  writeFileSync(tmp, html, "utf8");
  const b = await getBrowser();
  const ctx = await b.newContext({ viewport: { width: t.config.width, height: t.config.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
  await page.evaluate("document.fonts && document.fonts.ready");
  await page.evaluate("window.__wiritFit && window.__wiritFit()");
  const out = await page.evaluate(`(() => {
    var m = document.querySelector(".rgm-map");
    var mb = m.getBoundingClientRect();
    function rel(s){ var e=document.querySelector(s); if(!e) return null; var b=e.getBoundingClientRect();
      return { x:Math.round(b.x-mb.x), y:Math.round(b.y-mb.y), w:Math.round(b.width), h:Math.round(b.height) }; }
    function abs(s){ var e=document.querySelector(s); if(!e) return null; var b=e.getBoundingClientRect();
      return { x:Math.round(b.x), y:Math.round(b.y), w:Math.round(b.width), h:Math.round(b.height) }; }
    return { map: abs(".rgm-map"), bar_rel_map: rel(".rgm-bar"), side_rel_map: rel(".rgm-side"),
             title: abs(".rgm-title"), note: abs(".rgm-note"), footer: abs(".wirit-footer"), card: abs(".wirit-card") };
  })()`);
  console.log(JSON.stringify(out, null, 1));
  await ctx.close(); await closeBrowser();
  (await import("node:fs")).unlinkSync(tmp);
}
main();
