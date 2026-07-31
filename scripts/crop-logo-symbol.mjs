/**
 * 워드마크 로고에서 **심볼만** 잘라낸다.
 *
 * ── 왜 필요한가 (2026-07-31 오너 지시 "래미안 글씨 앞 로고만 추출")
 * 지도 라벨은 자리가 좁다. 'RAEMIAN' 같은 가로 워드마크를 통째로 넣으면
 * 글자가 뭉개지거나 라벨이 너무 길어진다. 심볼(‖)만 있으면 정사각에 가깝고
 * 작게 넣어도 알아본다.
 *
 * ── 자르는 자리를 손으로 찍지 않는다
 * "x=40 에서 자른다"고 적으면 로고가 갱신될 때 엉뚱한 데를 자른다.
 * 대신 **열마다 잉크(배경이 아닌 픽셀)를 세어** 심볼과 글자 사이의 가장 넓은
 * 빈 골짜기를 찾는다. 워드마크는 심볼과 글자 사이가 가장 크게 벌어져 있다.
 * 근거를 로그에 남겨 다음 사람이 판단을 되짚을 수 있게 한다.
 *
 * 실행: node scripts/crop-logo-symbol.mjs <입력.png> <출력.png>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "packages/renderer/package.json"));

const [src, dst] = process.argv.slice(2);
if (!src || !dst) {
  console.error("사용법: node scripts/crop-logo-symbol.mjs <입력.png> <출력.png>");
  process.exit(1);
}

/* PNG 디코딩은 브라우저에 맡긴다 — 별도 이미지 라이브러리를 들이지 않는다.
 * 렌더러가 이미 Chromium 을 쓰고 있으므로 의존성이 늘지 않는다. */
const { chromium } = require("playwright-core");
const PINNED = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const browser = await chromium.launch({ executablePath: PINNED });
const page = await browser.newPage();

const b64 = readFileSync(src).toString("base64");
const result = await page.evaluate(async (dataUrl) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const { data } = g.getImageData(0, 0, c.width, c.height);

  // 열마다 잉크 픽셀 수 — 배경(투명 또는 흰색)이 아닌 것
  const ink = [];
  for (let x = 0; x < c.width; x++) {
    let n = 0;
    for (let y = 0; y < c.height; y++) {
      const i = (y * c.width + x) * 4;
      const [r, gg, bb, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a > 24 && !(r > 240 && gg > 240 && bb > 240)) n++;
    }
    ink.push(n);
  }
  return { w: c.width, h: c.height, ink };
}, `data:image/png;base64,${b64}`);

const { w, h, ink } = result;
// 잉크가 있는 구간(런)을 모으고, 그 사이 빈 골짜기 중 가장 넓은 곳을 경계로 삼는다
const runs = [];
let s = -1;
for (let x = 0; x < w; x++) {
  if (ink[x] > 0 && s < 0) s = x;
  if ((ink[x] === 0 || x === w - 1) && s >= 0) { runs.push([s, ink[x] === 0 ? x - 1 : x]); s = -1; }
}
if (runs.length < 2) {
  console.log(`⏭ 심볼과 글자를 가를 빈 구간이 없습니다(런 ${runs.length}개) — 원본을 그대로 씁니다.`);
  await browser.close();
  writeFileSync(dst, readFileSync(src));
  process.exit(0);
}
let best = 0, bestGap = -1;
for (let i = 0; i < runs.length - 1; i++) {
  const gap = runs[i + 1][0] - runs[i][1];
  if (gap > bestGap) { bestGap = gap; best = i; }
}
const cutX = runs[best][1] + 1;
console.log(`📐 폭 ${w}px · 잉크 구간 ${runs.length}개 · 가장 넓은 골짜기 ${bestGap}px → x=${cutX} 에서 자릅니다`);
console.log(`   (구간: ${runs.map(([a, b]) => `${a}-${b}`).join(", ")})`);
if (cutX > w * 0.6) {
  console.log(`::warning::자를 자리가 폭의 60%를 넘습니다 — 심볼이 아니라 글자를 자를 수 있습니다. 눈으로 확인하세요.`);
}

const out = await page.evaluate(async ([dataUrl, cx, hh]) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = cx; c.height = hh;
  c.getContext("2d").drawImage(img, 0, 0);
  return c.toDataURL("image/png").split(",")[1];
}, [`data:image/png;base64,${b64}`, cutX, h]);

await browser.close();
writeFileSync(dst, Buffer.from(out, "base64"));
console.log(`✅ ${dst.replace(ROOT + "/", "")} (${cutX}×${h})`);
