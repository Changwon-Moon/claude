/**
 * 브랜드 로고를 **같은 규격**으로 다듬는다 — 누끼(흰 배경 제거) + 크기 정규화.
 *
 * ── 왜 필요한가 (2026-07-31 오너 지시)
 * ① "오티에르처럼 배경이 흰색이 되지 않도록 누끼 잘 따줘"
 *    JPG 로 받은 로고는 배경이 투명이 아니라 **흰 사각형**이다. 카드 배경이
 *    회색이면 로고 자리만 흰 판때기가 떠 보인다.
 * ② "이편한세상과 르엘은 크기를 다른 것과 비슷한 수준으로 줄여줘"
 *    로고마다 가로세로 비가 제각각이라 같은 높이로 맞추면 **넓적한 것이 훨씬 커 보인다**.
 *    르엘(4:1)은 자이(1:1)보다 면적이 네 배다.
 *
 * ── 크기를 어떻게 맞추나: 높이도 폭도 아닌 **잉크 면적**
 * 사람 눈이 '크다'고 느끼는 것은 높이가 아니라 차지한 넓이다. 그래서
 * 각 로고를 잉크가 덮은 면적이 같아지도록 배율을 계산해 정사각 캔버스 가운데 놓는다.
 * 파일마다 다른 값을 손으로 찍지 않는다 — 픽셀을 세서 정한다(다음 사람이 되짚을 수 있게).
 * 결과가 모두 같은 정사각형이므로 CSS 는 한 가지 규칙만 쓰면 된다.
 *
 * ── 원본은 지우지 않는다
 * templates/_shared/logos/_source/ 에 받은 그대로 둔다. 규격을 다시 잡고 싶을 때
 * 오너에게 파일을 또 달라고 하지 않기 위해서다.
 *
 * 실행: node scripts/normalize-logos.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const LOGOS = join(ROOT, "templates/_shared/logos");
const SRC = join(LOGOS, "_source");
mkdirSync(SRC, { recursive: true });

/** 캔버스 한 변. 지도 라벨은 이보다 훨씬 작게 쓰지만 원본은 넉넉히 남긴다. */
const CANVAS = 320;
/** 잉크가 캔버스에서 차지할 목표 면적 비율. 0.22 는 눈으로 맞춰 고른 값이 아니라,
 *  가장 정사각에 가까운 로고(자이)가 원래 보이던 크기에 맞춘 기준이다. */
const TARGET_INK = 0.22;
/** 아무리 가늘어도 캔버스를 넘지 않게 하는 상한 — 르엘처럼 극단적으로 납작한 것 대비 */
const MAX_FILL = 0.94;

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

/* 다듬을 대상 = 아파트 브랜드 로고. 회사 로고(하단 카드용)는 가로 워드마크가 자연스러우므로
 * 여기서 건드리지 않는다 — 정사각으로 만들면 오히려 글자가 작아진다. */
const BRANDS = [
  "raemian-symbol", "xi", "acro", "prugio", "summit", "thesharp",
  "hauterre", "epyeonhansesang", "lottecastle", "leel", "hillstate", "theh",
  "skview", "define",
];

const { chromium } = require("playwright-core");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const page = await browser.newPage();

for (const slug of BRANDS) {
  const file = join(LOGOS, `${slug}.png`);
  if (!existsSync(file)) { console.log(`::warning::없음 — ${slug}.png`); continue; }
  /* 원본 보관: 이미 보관돼 있으면 그것을 입력으로 쓴다.
   * 그래야 이 스크립트를 두 번 돌려도 결과가 같다(정규화한 것을 또 정규화하면 계속 줄어든다). */
  const keep = join(SRC, `${slug}.png`);
  if (!existsSync(keep)) copyFileSync(file, keep);

  const b64 = readFileSync(keep).toString("base64");
  const r = await page.evaluate(async ([u, CANVAS, TARGET_INK, MAX_FILL]) => {
    const img = new Image();
    img.src = u;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const im = g.getImageData(0, 0, c.width, c.height);
    const d = im.data;

    /* ── 누끼 ──
     * 흰 배경을 투명으로 바꾼다. 문턱을 하나로 딱 자르면 로고 가장자리(안티에일리어싱)가
     * 톱니처럼 남는다. 그래서 **흰색에 가까울수록 서서히 투명**해지게 한다:
     *   밝기 246 이상 → 완전 투명, 230 이하 → 그대로, 사이는 선형.
     * 원래 투명한 PNG 는 이 과정이 아무 영향을 주지 않는다(흰 픽셀이 없으므로). */
    let ink = 0, x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (d[i + 3] === 0) continue;
      const lum = Math.min(d[i], d[i + 1], d[i + 2]);
      let a = d[i + 3];
      if (lum >= 246) a = 0;
      else if (lum > 230) a = Math.round(a * (246 - lum) / 16);
      d[i + 3] = a;
      if (a > 24) {
        ink++;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return null;
    g.putImageData(im, 0, 0);

    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    /* 배율: 잉크 면적이 목표치가 되도록. 잉크는 배율의 제곱으로 늘어난다. */
    let s = Math.sqrt((CANVAS * CANVAS * TARGET_INK) / ink);
    s = Math.min(s, (CANVAS * MAX_FILL) / w, (CANVAS * MAX_FILL) / h);

    const o = document.createElement("canvas");
    o.width = CANVAS; o.height = CANVAS;
    const og = o.getContext("2d");
    og.imageSmoothingQuality = "high";
    const dw = w * s, dh = h * s;
    og.drawImage(c, x0, y0, w, h, (CANVAS - dw) / 2, (CANVAS - dh) / 2, dw, dh);
    return { png: o.toDataURL("image/png").split(",")[1], w, h, ink, s: Number(s.toFixed(3)), fill: Math.round((dw * dh) / (CANVAS * CANVAS) * 100) };
  }, [`data:${MIME[extname(keep).toLowerCase()] || "image/png"};base64,${b64}`, CANVAS, TARGET_INK, MAX_FILL]);

  if (!r) { console.log(`::warning::잉크 없음 — ${slug}`); continue; }
  writeFileSync(file, Buffer.from(r.png, "base64"));
  console.log(`✅ ${slug.padEnd(16)} ${String(r.w).padStart(4)}×${String(r.h).padEnd(4)} → ${CANVAS}² · 배율 ${String(r.s).padStart(6)} · 상자점유 ${String(r.fill).padStart(2)}%`);
}
await browser.close();
console.log(`\n📦 원본 보관: templates/_shared/logos/_source/ (다시 규격을 잡을 때 여기서 시작한다)`);
