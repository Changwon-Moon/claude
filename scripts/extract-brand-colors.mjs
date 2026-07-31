/**
 * 로고 이미지에서 **메인 컬러**를 뽑는다.
 *
 * ── 왜 (2026-07-31 오너 지시)
 * "브랜드 로고에 있는 메인 컬러대로 단지명 폰트색·카드 색을 맞춰줘".
 * 색을 손으로 찍으면 로고가 바뀔 때 색만 옛것으로 남고, 무엇보다 "이 색이 왜 이 색인가"에
 * 답할 수 없다. 로고 픽셀에서 뽑으면 근거가 파일 안에 있다.
 *
 * ── 어떻게 뽑나
 * ① 투명·흰색·거의 검정은 뺀다 — 배경과 먹선은 브랜드색이 아니다.
 * ② 남은 픽셀을 색상(Hue) 12도 칸에 모아 **가장 넓은 칸**을 고른다.
 *    가장 흔한 RGB 하나를 고르면 그라데이션이 있는 로고(대우 D)에서 엉뚱한 밝기가 잡힌다.
 *    같은 색 계열을 모아서 세는 편이 사람이 보는 '이 로고의 색'에 가깝다.
 * ③ 그 칸 안에서 **채도가 충분한 픽셀들의 중앙값**을 대표색으로 쓴다.
 * ④ 유채색 픽셀이 거의 없으면(검정 워드마크) 무채색 중앙값을 쓰고 achromatic 로 표시한다 —
 *    이런 로고는 색으로 구분이 안 되므로 오너에게 물어야 한다.
 *
 * 글자색으로도 쓰이므로 너무 밝으면 안 읽힌다. 그래서 **읽기 밝기 상한**을 두고
 * 넘으면 어둡게 눌러 적는다(원색은 raw 에 남긴다 — 무엇을 건드렸는지 보이게).
 *
 * 실행: node scripts/extract-brand-colors.mjs
 * 산출: data/datasets/brand-colors.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const LOGOS = join(ROOT, "templates/_shared/logos");

/* 브랜드는 '일반/하이엔드'로 짝지어 둔다 — 카드가 둘 다 보여야 하고(오너 지시),
 * 카드 색은 **일반 브랜드** 색으로 통일하기 때문이다. */
const BRANDS = [
  { company: "현대건설",     tier: "일반",     name: "힐스테이트",  file: "hillstate.png" },
  { company: "현대건설",     tier: "하이엔드", name: "디에이치",    file: "theh.png" },
  { company: "GS건설",       tier: "일반",     name: "자이",        file: "xi.png" },
  { company: "삼성물산",     tier: "일반",     name: "래미안",      file: "raemian-symbol.png" },
  { company: "대우건설",     tier: "일반",     name: "푸르지오",    file: "prugio.png" },
  { company: "대우건설",     tier: "하이엔드", name: "써밋",        file: "summit.png" },
  { company: "롯데건설",     tier: "일반",     name: "롯데캐슬",    file: "lottecastle.png" },
  { company: "롯데건설",     tier: "하이엔드", name: "르엘",        file: "leel.png" },
  { company: "포스코이앤씨", tier: "일반",     name: "더샵",        file: "thesharp.png" },
  { company: "포스코이앤씨", tier: "하이엔드", name: "오티에르",    file: "hauterre.png" },
  { company: "DL이앤씨",     tier: "일반",     name: "e편한세상",   file: "epyeonhansesang.png" },
  { company: "DL이앤씨",     tier: "하이엔드", name: "아크로",      file: "acro.png" },
  { company: "SK에코플랜트", tier: "일반",     name: "SK뷰",        file: "skview.png" },
  { company: "SK에코플랜트", tier: "하이엔드", name: "드파인",      file: "define.png" },
  /* 순위 카드용 — 정비사업 카드에는 안 나오지만 브랜드 순위 조사에는 4·5위로 등장한다.
   * 색을 뽑아 두지 않으면 카드에서 이름이 회색으로 나가 다른 브랜드와 위계가 어긋난다. */
  { company: "HDC현대산업개발", tier: "일반",    name: "아이파크",    file: "ipark.png" },
  { company: "두산건설",       tier: "일반",     name: "위브",        file: "weve.png" },
];

const { chromium } = require("playwright-core");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const page = await browser.newPage();

const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
/* 상대 밝기(WCAG) — 글자색으로 쓸 수 있는지 판단한다. 흰 배경 위 글씨는 어두워야 읽힌다. */
const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const out = [];
for (const b of BRANDS) {
  const p = join(LOGOS, b.file);
  if (!existsSync(p)) { console.log(`::warning::로고 없음 — ${b.name}`); continue; }
  const b64 = readFileSync(p).toString("base64");
  const r = await page.evaluate(async (u) => {
    const img = new Image(); img.src = u; await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const bins = new Map();          // 색상 12도 칸 → 픽셀들
    const grays = [];
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a < 200) continue;                                   // 반투명 가장자리는 색이 섞여 있다
      const R = d[i], G = d[i + 1], B = d[i + 2];
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      /* 흰 배경은 **세 채널이 모두** 밝은 픽셀이다. 가장 밝은 채널만 보고 걸렀더니
       * e편한세상 주황(R=255)이 통째로 배경 취급돼 '무채색 로고'로 나왔다 — 2026-07-31. */
      if (mn > 240) continue;
      const sat = mx === 0 ? 0 : (mx - mn) / mx;
      if (sat < 0.18 || mx < 40) { grays.push([R, G, B]); continue; }  // 무채색·먹선
      let h;
      const dd = mx - mn;
      if (mx === R) h = ((G - B) / dd + 6) % 6;
      else if (mx === G) h = (B - R) / dd + 2;
      else h = (R - G) / dd + 4;
      h *= 60;
      const k = Math.floor(h / 12);
      if (!bins.has(k)) bins.set(k, []);
      bins.get(k).push([R, G, B]);
    }
    const mid = (arr) => {
      const m = [0, 1, 2].map((j) => {
        const v = arr.map((q) => q[j]).sort((x, y) => x - y);
        return v[Math.floor(v.length / 2)];
      });
      return m;
    };
    let best = null, bestN = 0;
    for (const [, arr] of bins) if (arr.length > bestN) { bestN = arr.length; best = arr; }
    const colored = [...bins.values()].reduce((s, a) => s + a.length, 0);
    if (!best || colored < grays.length * 0.06) {
      return { rgb: grays.length ? mid(grays) : [38, 48, 61], achromatic: true, share: 0 };
    }
    return { rgb: mid(best), achromatic: false, share: Math.round((bestN / (colored + grays.length)) * 100) };
  }, `data:image/png;base64,${b64}`);

  /* 글자색으로 쓸 것이라 너무 밝으면 흰 배경에서 안 읽힌다. 상대 밝기 0.36 을 넘으면
   * 색상(계열)은 그대로 두고 밝기만 눌러 적는다. 원색은 raw 에 남겨 무엇을 바꿨는지 보이게 한다. */
  let rgb = r.rgb.slice();
  const raw = hex(rgb);
  let dimmed = false;
  let guard = 0;
  while (lum(rgb) > 0.36 && guard++ < 24) { rgb = rgb.map((v) => v * 0.92); dimmed = true; }

  out.push({
    company: b.company, tier: b.tier, name: b.name, file: b.file,
    hex: hex(rgb), raw, dimmed, achromatic: r.achromatic, share: r.share,
  });
  console.log(
    `${b.name.padEnd(10)} ${b.tier.padEnd(5)} ${hex(rgb)}` +
    `${dimmed ? ` (원색 ${raw} 에서 낮춤)` : ""}${r.achromatic ? " ⚠ 무채색 로고" : ` · 계열 점유 ${r.share}%`}`,
  );
}
await browser.close();

/* ── 서로 헷갈리는 색 찾기 ──
 * 오너 지시: "비슷한 컬러가 있으면 나한테 질문해줘". 눈으로 훑지 않는다 — 재어서 찾는다.
 * 카드 8장에 나란히 놓이는 것은 **일반 브랜드** 색이므로 그들끼리만 비교한다.
 * 거리는 단순 RGB 유클리드가 아니라 사람 눈에 가깝게 가중치를 준다(초록에 민감하다). */
const dist = (a, b) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return Math.sqrt(2 * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + 3 * (b1 - b2) ** 2);
};
const mains = out.filter((o) => o.tier === "일반");
const clashes = [];
for (let i = 0; i < mains.length; i++)
  for (let j = i + 1; j < mains.length; j++) {
    const d = dist(mains[i].hex, mains[j].hex);
    if (d < 110) clashes.push({ a: mains[i], b: mains[j], d: Math.round(d) });
  }
clashes.sort((x, y) => x.d - y.d);

const doc = {
  _: [
    "로고 이미지에서 뽑은 브랜드 메인 컬러. scripts/extract-brand-colors.mjs 가 만든다 — 손으로 고치지 않는다.",
    "hex 는 흰 배경에서 글자색으로 쓸 수 있게 밝기를 누른 값이고, raw 는 로고에서 그대로 뽑은 색이다.",
    "achromatic=true 는 로고가 검정·회색이라 색으로 구별이 안 된다는 뜻이다 — 오너 판단이 필요하다.",
    "clashes 는 카드 8장에 나란히 놓일 일반 브랜드 색 중 서로 헷갈리는 짝이다.",
  ],
  extractedAt: "2026-07-31",
  brands: out,
  clashes: clashes.map((c) => ({ a: c.a.name, aHex: c.a.hex, b: c.b.name, bHex: c.b.hex, distance: c.d })),
};
writeFileSync(join(ROOT, "data/datasets/brand-colors.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`\n🎨 ${out.length}종 추출 · 무채색 ${out.filter((o) => o.achromatic).length}종`);
if (clashes.length) {
  console.log(`⚠ 서로 헷갈리는 일반 브랜드 색 ${clashes.length}쌍:`);
  for (const c of clashes) console.log(`   ${c.a.name}(${c.a.hex}) ↔ ${c.b.name}(${c.b.hex}) — 거리 ${c.d}`);
} else {
  console.log("✅ 카드에 나란히 놓일 색끼리 충분히 다릅니다");
}
console.log("   → data/datasets/brand-colors.json");
