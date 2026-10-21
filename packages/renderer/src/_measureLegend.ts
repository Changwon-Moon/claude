/**
 * 📏 범례 한 줄이 **판 밖으로 나갔는지 실제로 잰다** (2026-10-22 신설)
 *
 *   pnpm -s --filter @wirit/renderer exec tsx src/_measureLegend.ts <카드.json> [...]
 *
 * ── 왜 필요했나
 * `designQa` 는 **SVG 안의 글자를 재지 않는다.** 그래서 범례가 길어 잘려 나가도 검수는 초록이고,
 * 눈으로 보기 전에는 아무도 모른다. 실제로 세 번 나왔다:
 *   · 14호 안산 메트로타운푸르지오힐스테이트 — `)` 가 패널 가장자리에 붙어 발행됐다
 *   · 17호 금천 금천롯데캐슬골드파크1차 — 넘쳐서 이름을 줄여 고쳤다(2026-10-21)
 *   · 21호 동탄 그린힐 반도유보라 아이비파크 10 — **`(1.08` 에서 잘렸다**
 *
 * 글자 폭을 손으로 추정하면 글립 섞임(숫자·물결표·영문)에 따라 10% 넘게 틀린다 —
 * 실제로 추정식은 23호(잘림)를 통과시키고 14호(멀쩡)를 잡았다. 그래서 **브라우저가 재게** 한다.
 *
 * 출력: 줄마다 오른쪽 끝 x(카드 좌표)와 판 오른쪽 끝. 넘치면 ⛔.
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { loadTemplate } from "./loadTemplate.js";
import { renderPageHtml } from "./renderHtml.js";
import { getBrowser, closeBrowser } from "./screenshot.js";

async function main() {
  const files = process.argv.slice(2);
  if (!files.length) { console.error("카드 JSON 경로를 주세요"); process.exit(1); }
  const b = await getBrowser();
  let bad = 0;
  for (const file of files) {
    const doc = JSON.parse(readFileSync(file, "utf8"));
    const t = loadTemplate(doc.template);
    const html = renderPageHtml(t, doc);
    const tmp = path.join(t.dir, `.measure-legend-${process.pid}.html`);
    writeFileSync(tmp, html, "utf8");
    const ctx = await b.newContext({ viewport: { width: t.config.width, height: t.config.height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
    await page.evaluate("document.fonts && document.fonts.ready");
    await page.evaluate("window.__wiritFit && window.__wiritFit()");
    const out: any = await page.evaluate(`(() => {
      var svg = document.querySelector("svg");
      if (!svg) return null;
      var sb = svg.getBoundingClientRect();
      /* 판(패널)의 오른쪽 끝 — 범례와 같은 좌표계로 잰다 */
      var rect = svg.querySelector("rect");
      var pr = rect ? rect.getBoundingClientRect().right - sb.left : sb.width;
      var rows = [];
      svg.querySelectorAll("text").forEach(function (el) {
        var tx = (el.textContent || "").trim();
        if (!tx || tx.indexOf("배)") < 0 && tx.indexOf("평") < 0) return;
        var r = el.getBoundingClientRect();
        rows.push({ t: tx, right: Math.round(r.right - sb.left), top: Math.round(r.top - sb.top) });
      });
      return { panelRight: Math.round(pr), width: Math.round(sb.width), rows: rows };
    })()`);
    await ctx.close();
    unlinkSync(tmp);
    const name = path.basename(file, ".json");
    if (!out) { console.log(`${name} — SVG 를 못 찾았습니다`); continue; }
    /* 같은 줄의 이름과 배수는 따로 그려진다 — 세로 위치로 묶어 줄의 오른쪽 끝을 낸다 */
    const byRow = new Map<number, { t: string[]; right: number }>();
    for (const r of out.rows) {
      const k = Math.round(r.top / 10);
      const cur = byRow.get(k) ?? { t: [], right: 0 };
      cur.t.push(r.t); cur.right = Math.max(cur.right, r.right);
      byRow.set(k, cur);
    }
    for (const [, r] of [...byRow].sort((a, b2) => a[0] - b2[0])) {
      const over = r.right > out.panelRight;
      if (over) bad++;
      console.log(`${over ? "⛔" : "  "} ${name} | 끝 ${String(r.right).padStart(4)} / 판 ${out.panelRight} | ${r.t.join(" ")}`);
    }
  }
  await closeBrowser();
  if (bad) { console.log(`\n⛔ 판을 넘은 줄 ${bad}개 — 이름을 줄이거나 다른 묶음을 고르세요`); process.exit(1); }
  console.log("\n✅ 범례가 전부 판 안에 있습니다");
}
main();
