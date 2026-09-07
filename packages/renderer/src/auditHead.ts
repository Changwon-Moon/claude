/**
 * 머리 규격 전수 점검 — 우상단 wirit 뱃지 · 카드 위 여백 · 최외곽 흰 테두리.
 *
 * 왜 이 파일인가 (2026-07-31 오너 "위릿뱃지와 카드 흰색테두리 등 기준에 안맞는거 전체 수정"):
 * 템플릿마다 `.wirit-corner`·카드 패딩을 제 맘대로 재정의해 놓아서 **같은 계정의 카드인데
 * 머리 모양이 제각각**이었다. designQa 는 카드 한 장씩만 보고 warn 을 흘려서, 여러 장을
 * 나란히 놓고서야 보이는 이 문제를 아무도 못 잡았다. 전수 표로 한눈에 비교한다.
 *
 * 실행: pnpm --filter @wirit/renderer audit-head
 *      pnpm --filter @wirit/renderer audit-head -- --only "카드슬러그,카드슬러그"
 *
 * ── ⚠️ `--only` — **판정만** 좁힌다. 표는 언제나 전수다 (2026-09-03 오너 지시)
 *
 * 이 검사는 `data/content` 의 **모든 카드**를 훑는다. 그게 맞다 — 여러 장을 나란히 놓고서야
 * 보이는 문제를 잡는 검사이기 때문이다. 그런데 `confirm.mjs` 가 이걸 그대로 쓰면서
 * **한 세트의 확정이 남의 카드 때문에 막히는** 일이 생겼다.
 *
 * 2026-09-03 실측: 신고가 11장을 확정하는데 `danji-mokdong` 한 장이 빨간불이었다.
 * 그 카드는 **다른 세션이 그날 만든, 아직 「오너 검토 대기」인 카드**다. 남이 확정한 카드는
 * 건드리지 않는다는 규칙 때문에 고칠 수도 없고, 그래서 내 세트는 손으로 커밋할 수밖에 없었다.
 * **손으로 커밋한다는 것은 그 뒤의 검사를 아무도 안 돌린다는 뜻이다** — 문지기가 사람을
 * 우회하게 만들면 그 문지기는 이미 진 것이다.
 *
 * 그래서 판정을 **확정하려는 세트의 카드로** 좁힌다. 규칙은 이렇다:
 *   · 내 세트 카드가 어긋나면 → ❌ 막는다 (예전과 똑같다)
 *   · 남의 카드가 어긋나면    → ⚠️ **크게 적어서 알린다.** 막지는 않는다.
 *     그 카드의 확정은 어차피 자기 차례에 이 검사에 걸린다.
 *   · `--only` 없이 돌리면(세션 마감 `close-session.mjs`) 예전 그대로 **전부** 막는다 —
 *     공장 전체가 깨끗한지 보는 자리는 거기다.
 *
 * ⚠️ 「알림으로 넘긴다」를 「없는 셈 친다」로 만들지 말 것. 남의 카드도 표에 그대로 찍히고
 *    끝에 이름이 다시 나온다. 안 보이게 하는 순간 이 예외는 구멍이 된다.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadTemplate } from "./loadTemplate.js";
import { renderPageHtml } from "./renderHtml.js";
import { getBrowser, closeBrowser } from "./screenshot.js";

const ROOT = path.resolve(process.cwd(), "../..");
const CONTENT = path.join(ROOT, "data/content");

/** `--only a,b,c` — 판정 대상 카드. 없으면 전부가 판정 대상이다(예전 동작). */
const ONLY: Set<string> | null = (() => {
  const i = process.argv.indexOf("--only");
  const v = i >= 0 ? process.argv[i + 1] : undefined;
  if (!v || v.startsWith("--")) return null;
  const s = new Set(v.split(",").map((x) => x.trim()).filter(Boolean));
  return s.size ? s : null;
})();
const inScope = (slug: string) => !ONLY || ONLY.has(slug);

const MEASURE = `(() => {
  var card = document.querySelector(".wirit-card");
  var cs = getComputedStyle(card);
  var af = getComputedStyle(card, "::after");
  var b = card.querySelector(".wirit-corner");
  var m = b && b.querySelector(".mark");
  /* 로고 라인의 상단 캡션(.wirit-topcap)도 '머리'다. 템플릿이 제 맘대로 줄여도
     카드 한 장만 보면 멀쩡해 보인다 — 61장을 나란히 놓고서야 hakgun-map 하나가
     20px 인 게 드러났다(오너 2026-09-01 지적). 그래서 전수 표에 넣는다. */
  var tc = card.querySelector(".wirit-topcap");
  var tcs = tc ? getComputedStyle(tc) : null;
  /* ── 강조색을 **렌더된 픽셀에서** 훑는다 (2026-09-02)
     정적 grep 은 템플릿에 적힌 hex 만 본다. 빌더가 SVG 에 넣는 색·계산해서 넣는 색은 못 본다.
     여기서는 카드 안 모든 요소의 color/배경/fill 을 실제 계산값으로 읽으므로 빠져나갈 자리가 없다.
     '빨강·파랑 자리에 앉은 진한 색'만 모은다 — 노선색·면색·회색은 대상이 아니다. */
  var accents = {};
  function hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (d) {
      if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    var l = (mx + mn) / 2;
    return { h: h, s: d ? d / (1 - Math.abs(2 * l - 1)) : 0, l: l };
  }
  function look(v) {
    if (!v) return;
    /* ⚠️ 이 문자열은 **템플릿 리터럴 안**이다. 정규식의 역슬래시를 한 번만 쓰면
       TS 가 컴파일 때 먹어 버려 브라우저에는 /rgba?((d+)...)/ 가 도착한다 — 아무것도 안 걸리고
       "위반 0장"이라는 **거짓 초록불**이 뜬다(2026-09-02 실제로 그랬다). 그래서 두 번 쓴다. */
    var m = String(v).match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
    if (!m) return;
    if (m[4] !== undefined && parseFloat(m[4]) < 0.5) return;   // 거의 투명한 것은 색이 아니다
    var r = +m[1], g = +m[2], b = +m[3], c = hsl(r, g, b);
    if (c.s < 0.45 || c.l < 0.18 || c.l > 0.78) return;
    var kind = (c.h >= 345 || c.h <= 15) ? "red" : (c.h >= 215 && c.h <= 245) ? "cobalt" : null;
    if (!kind) return;
    var key = kind + " rgb(" + r + ", " + g + ", " + b + ")";
    accents[key] = (accents[key] || 0) + 1;
  }
  /* ── 코로플레스 **면색**은 강조색이 아니다 (2026-09-02)
     이 검사의 대상은 머리말대로 「빨강·파랑 자리에 앉은 진한 색」이고, 지도의 면색은
     대상이 아니라고 이미 적혀 있었다. 그런데 코드가 실제로 거르지는 않아서, 전세 지도를
     파랑 램프로 바꾸자 **중간 톤 40칸이 전부 「규격 밖 코발트」로** 잡혔다.
     빨강 램프가 안 걸린 건 규칙이 맞아서가 아니라 중간 톤이 옅은 분홍이라 채도 문턱에
     못 미쳤을 뿐이다 — 즉 이 검사는 램프 색에 따라 우연히 통과하고 있었다.

     램프는 **정의상 규격색의 농담**이고, 양 끝은 규격색 그 자체다
     (전세 rgb(232,238,255)→rgb(46,107,255) · 매매 rgb(255,235,232)→rgb(229,72,77)).
     농담을 「규격 밖」이라 부르면 코로플레스를 아예 못 그린다.

     ⚠️ **면(fill)만** 뺀다. 같은 요소의 글자색·테두리는 그대로 본다 — 지도 위 라벨이
     규격 밖 빨강으로 새는 것은 여전히 잡혀야 한다. 램프의 양 끝이 규격색인지는
     빌더가 상수로 들고 있고 기준 문서(토허제-가격지도-기준 §2⑥)가 지킨다.

     ⚠️ 2026-09-07: 같은 일이 **배경색으로** 한 번 더 났다. 트리맵(daso-treemap)은 칸을
     SVG 가 아니라 div 로 그려서 램프가 fill 이 아니라 background-color 로 들어오는데,
     위 예외가 fill 만 빼고 있어 중간 톤 9개가 전부 「규격 밖 코발트」로 잡혔다.
     예외의 근거는 「지도」가 아니라 **「면색은 강조색이 아니다」** 이므로, 무엇으로 칠했는지가
     아니라 **그 요소가 램프 면인지**로 가른다 → 공용 표시 클래스 wirit-ramp.
     (⚠️ 이 블록은 브라우저로 넘어가는 문자열 안이다 — 주석에 역따옴표를 쓰면 통째로 깨진다)
     새 판형이 램프를 쓰면 이 클래스만 붙이면 된다(지도는 tk-geo 를 계속 쓴다). */
  var isRampSurface = function (el) {
    return el.classList && (el.classList.contains("tk-geo") || el.classList.contains("wirit-ramp"));
  };
  Array.prototype.forEach.call(card.querySelectorAll("*"), function (el) {
    var cs2 = getComputedStyle(el);
    /* 글자색·테두리는 **언제나** 본다 — 램프 면 위에 얹힌 라벨이 규격 밖 색으로
       새는 것은 여전히 잡혀야 한다. 빼는 것은 면(배경·fill)뿐이다. */
    look(cs2.color); look(cs2.borderTopColor);
    if (!isRampSurface(el)) { look(cs2.backgroundColor); look(cs2.fill); }
  });
  return {
    accents: accents,
    capPx: tc && tc.textContent.trim() ? Math.round(parseFloat(tcs.fontSize)) : null,
    capWeight: tc && tc.textContent.trim() ? String(tcs.fontWeight) : null,
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
  /* 상단 캡션은 _shared/base.css 의 28px/600 이 정본이다. 글자가 없는 카드는 검사 대상이 아니다.
     길다고 줄이지 않는다 — 자리는 746px 라 28px 로도 대부분 한 줄에 들어간다. 안 들어가면 문구를 줄인다. */
  const okCap = (r: any) => r.capPx === null || (r.capPx === 28 && r.capWeight === "600");

  console.log("\n📐 머리 규격 전수 점검 — 공용 기준: 위 여백 ≥72px · 뱃지 잉크네이비 · 글자 36px · 흰 테두리 3px · 상단 캡션 28px/600");
  console.log("   (표지형 전면 사진 카드는 예외 — 흰 판 뱃지·패딩 0 이 정상)\n");
  console.log("카드".padEnd(24) + "템플릿".padEnd(22) + "위여백  뱃지판   글자   흰테두리  상단캡션");
  console.log("─".repeat(100));
  let bad = 0;
  const badOther: string[] = [];
  for (const r of rows) {
    const cover = isCover(r);
    const violated = !cover && [okPad(r), okBadge(r), okMark(r), okBorder(r), okCap(r)].some((f) => !f);
    if (violated) { if (inScope(r.slug)) bad++; else badOther.push(r.slug); }
    const pad = cover ? " 표지 " : okPad(r) ? (r.padTop === 72 ? "  ✅  " : ` ⬆${String(r.padTop).padStart(3)} `) : ` ❌${String(r.padTop).padStart(3)} `;
    console.log(
      r.slug.padEnd(24) +
        r.template.padEnd(22) +
        pad +
        (cover ? " 표지  " : okBadge(r) ? "  ✅   " : "  ❌   ") +
        (okMark(r) ? " ✅  " : ` ❌${String(r.markPx ?? "-").padStart(3)}`) +
        (okBorder(r) ? "   ✅" : "   ❌ " + r.afterBorder) +
        (r.capPx === null ? "     ―" : okCap(r) ? "     ✅" : `     ❌${r.capPx}/${r.capWeight}`),
    );
  }
  console.log("─".repeat(100));
  console.log(`총 ${rows.length}장 · 규격 위반 ${bad}장 (표지형 예외 ${rows.filter(isCover).length}장 제외)\n`);
  if (badOther.length)
    console.log(
      `   ⚠️ 판정 밖(다른 세트) 규격 위반 ${badOther.length}장 — ${badOther.join(", ")}\n` +
        `      여기서는 막지 않습니다. 그 세트를 확정할 때 그쪽에서 막힙니다.\n`,
    );

  /* ── 강조색 전수 (2026-09-02 오너 "블루, 레드 폰트 컬러들이 조금 기준하고 다른것 같은데")
     렌더된 픽셀에서 읽었으므로 빌더가 넣은 색·SVG 안의 색도 다 걸린다.
     옛 카드는 픽셀 불변이라 못 고친다 → **기준선(baseline)** 에 적어 두고,
     기준선에 없는 카드가 새로 어긋나면 그때 빨간불이 켜진다. 새 드리프트만 막는 방식이다. */
  const RED = "rgb(229, 72, 77)", COBALT = "rgb(46, 107, 255)";
  /* ── 표지형 제목의 잉크용 틴트는 **규격색이다** (오너 확정 2026-09-03) ──
     `danji-cover@1` 의 제목은 어두운 잉크 밴드 위에 앉는다. 그 자리에서만 쓰는 이 두 값은
     2026-08-03 부터 청약 카드 11장이 써 온 판형의 색이고, 오너가 "청약은 원래 블루가 맞는
     컬러"라고 확정했다(브랜드 토큰으로 옮겼다가 되돌렸다).

     ⚠️ **기준선(accent-baseline)에 새 카드를 끼워 넣는 것과 다르다.** 기준선은 "이미 나가서
     못 고치는 옛 카드"를 적는 곳이고, 여기는 "이 판형에서는 이 색이 맞다"를 적는 곳이다.
     허용이 코드에 있으니 다음 사람이 이유를 찾을 수 있고, **판형 밖에서 같은 색이 새면
     여전히 걸린다.** 표지형 이외의 템플릿에는 적용되지 않는다. */
  const DANJI_TITLE_TINT = new Set(["cobalt rgb(122, 166, 255)", "red rgb(255, 138, 142)"]);
  const BASE = path.join(ROOT, "data/review/accent-baseline.json");
  const baseline: Record<string, string[]> = fs.existsSync(BASE)
    ? JSON.parse(fs.readFileSync(BASE, "utf8")).cards ?? {}
    : {};
  const offenders: Record<string, string[]> = {};
  for (const r of rows) {
    const coverTitle = String(r.template ?? "").startsWith("danji-cover");
    const bad2 = Object.keys(r.accents ?? {})
      .filter((k) => !(k === `red ${RED}` || k === `cobalt ${COBALT}`))
      .filter((k) => !(coverTitle && DANJI_TITLE_TINT.has(k)))
      .sort();
    if (bad2.length) offenders[r.slug] = bad2;
  }
  const freshAll = Object.entries(offenders).filter(([slug, list]) => {
    const known = baseline[slug] ?? [];
    return list.some((c) => !known.includes(c));
  });
  const fresh = freshAll.filter(([slug]) => inScope(slug));
  const freshOther = freshAll.filter(([slug]) => !inScope(slug));

  console.log(`🎨 강조색 전수 — 규격 레드 ${RED} · 코발트 ${COBALT}`);
  console.log("   (빨강·파랑 자리의 진한 색만 봅니다. 노선색·면색·회색은 대상이 아닙니다)");
  if (process.argv.includes("--write-accent-baseline")) {
    fs.writeFileSync(
      BASE,
      JSON.stringify(
        {
          _: "강조색 기준선 — 여기 적힌 카드·색은 '이미 나간 옛 판본'이라 픽셀 불변으로 못 고친다. 새로 어긋난 것만 잡으려고 둔다.",
          _만드는법: "pnpm --filter @wirit/renderer audit-head -- --write-accent-baseline",
          _주의: "새 카드를 여기 넣어 통과시키지 말 것. 새 카드는 var(--wirit-red)/var(--wirit-cobalt) 를 쓰면 된다.",
          updatedAt: new Date().toISOString().slice(0, 10),
          cards: offenders,
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );
    console.log(`   ✍️ 기준선을 다시 썼습니다 — ${Object.keys(offenders).length}장`);
  } else if (!fresh.length) {
    console.log(`   ✅ 새로 어긋난 카드 없음 (기준선에 옛 카드 ${Object.keys(baseline).length}장)`);
  } else {
    console.log(`   ❌ 새로 어긋난 카드 ${fresh.length}장 — 토큰(var(--wirit-red)/var(--wirit-cobalt))을 쓰세요`);
    for (const [slug, list] of fresh) console.log(`      ${slug} — ${list.join(" · ")}`);
  }
  /* 판정 밖이라도 **반드시 적는다.** 안 보이게 하는 순간 이 예외는 구멍이 된다. */
  if (freshOther.length) {
    console.log(`   ⚠️ 판정 밖(다른 세트) 새로 어긋난 카드 ${freshOther.length}장 — 여기서는 막지 않습니다`);
    for (const [slug, list] of freshOther) console.log(`      ${slug} — ${list.join(" · ")}`);
    console.log(`      그 카드를 확정할 때 그쪽에서 막힙니다. 세션 마감(--only 없이 도는 자리)에서도 막힙니다.`);
  }
  if (ONLY) {
    const seen = new Set(rows.map((r) => r.slug));
    const unknown = [...ONLY].filter((s) => !seen.has(s));
    /* 넘긴 슬러그가 하나도 안 맞으면 **판정할 것이 없다** — 그건 초록불이 아니라 사고다.
       (백필의 「명부에 없는 구 코드」와 같은 자리: 조용히 0건으로 도는 초록불이 제일 위험하다.) */
    if (unknown.length) console.log(`   ⚠️ --only 에 넘긴 카드 ${unknown.length}장이 data/content 에 없습니다: ${unknown.join(", ")}`);
    if (unknown.length === ONLY.size) {
      console.log(`   ⛔ --only 로 넘긴 카드가 하나도 없습니다 — 판정할 것이 없어 여기서 멈춥니다`);
      console.log("");
      process.exit(1);
    }
  }
  console.log("");
  process.exit(bad > 0 || fresh.length > 0 ? 1 : 0);
}
main();
