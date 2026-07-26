/**
 * 관제탑 이미지 축소기.
 *
 * ── 왜 필요한가 (2026-07-26 실측)
 * 카드 PNG는 1080×1350 @2x = 2160×2700, 장당 약 870KB다. 원본 그대로 9장만 넣어도
 * 관제탑 HTML이 **7.85MB**가 됐다. 그런데 목록에 보이는 건 가로 40px짜리 썸네일이다.
 * 즉 화면 무게의 대부분이 **아무도 못 보는 픽셀**이었다.
 *
 * ── 원칙: 보이는 크기만큼만 싣는다
 *   · 목록 썸네일 → 가로 200px  (누가 어느 카드인지 알아보는 용도)
 *   · 상세 캐러셀 → 가로 900px  (수치·글자를 실제로 읽고 승인하는 용도)
 * 그리고 상세용 큰 이미지는 **발행 후보에만** 싣는다. 실험 렌더까지 다 실을 이유가 없다.
 *
 * ── 어떻게
 * 새 라이브러리를 넣지 않는다. 저장소에 이미 있는 Chromium(playwright-core)으로
 * 캔버스에 그려 JPEG로 다시 뽑는다. 브라우저가 없으면 **원본을 그대로 쓴다**(축소만 포기).
 * 같은 입력이면 같은 결과라 결정성도 유지된다.
 */
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT } from "../paths.js";

/** 목록용 / 상세용 목표 가로폭 */
export const THUMB_W = 200;
export const PAGE_W = 900;

type Job = { uri: string; width: number };

/** 같은 그림이라도 목록용·상세용은 크기가 다르다 → 캐시 키에 폭을 포함한다 */
export const shrinkKey = (uri: string, width: number): string => `${width}|${uri}`;

/** 페이지 안에서 실행될 축소 코드. [원본uri, 목표폭] 을 받아 JPEG data-uri 를 돌려준다. */
const SHRINK_JS = `([src, w]) => new Promise((resolve) => {
  const im = new Image();
  im.onload = () => {
    const scale = Math.min(1, w / im.naturalWidth);
    const c = document.createElement("canvas");
    c.width = Math.round(im.naturalWidth * scale);
    c.height = Math.round(im.naturalHeight * scale);
    const g = c.getContext("2d");
    if (!g) return resolve(src);
    g.imageSmoothingQuality = "high";
    g.drawImage(im, 0, 0, c.width, c.height);
    resolve(c.toDataURL("image/jpeg", 0.86));
  };
  im.onerror = () => resolve(src);
  im.src = src;
})`;

/** 브라우저를 못 찾으면 축소를 건너뛴다 — 관제탑이 안 만들어지는 것보다 무거운 게 낫다 */
function loadChromium(): any | null {
  try {
    const require = createRequire(join(REPO_ROOT, "packages/renderer/package.json"));
    return require("playwright-core").chromium;
  } catch {
    return null;
  }
}

/**
 * data-uri 여러 장을 한 번에 축소한다. 키는 shrinkKey(uri, width).
 * 축소할 수 없으면 입력을 그대로 돌려준다(호출부는 신경 쓸 필요 없다).
 */
export async function shrinkAll(jobs: Job[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const j of jobs) out.set(shrinkKey(j.uri, j.width), j.uri); // 기본값 = 원본
  if (!jobs.length) return out;

  const chromium = loadChromium();
  if (!chromium) {
    console.log("   (Chromium 없음 — 이미지 축소를 건너뜁니다. 관제탑이 무거워집니다)");
    return out;
  }

  const pinned = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
  let browser: any;
  try {
    browser = await chromium.launch(existsSync(pinned) ? { executablePath: pinned } : {});
  } catch (e) {
    console.log(`   (브라우저 실행 실패 — 이미지 축소 건너뜀: ${(e as Error).message.slice(0, 60)})`);
    return out;
  }

  try {
    const page = await browser.newPage();
    // 같은 uri가 여러 번 오면 한 번만 처리한다
    const seen = new Set<string>();
    let before = 0;
    let after = 0;

    for (const j of jobs) {
      const key = shrinkKey(j.uri, j.width);
      if (seen.has(key)) continue;
      seen.add(key);
      try {
        // ⚠️ 브라우저 안에서 도는 코드다. 함수로 넘기면 (a) Node 타입검사가 DOM을 모르고
        //    (b) tsx/esbuild 가 주입하는 __name 때문에 페이지에서 터진다 → 문자열로 넘긴다.
        //    인자도 문자열에 박아 넣는다 — 문자열+인자 조합은 Playwright가 undefined를 돌려준다.
        const small: string = await page.evaluate(
          `(${SHRINK_JS})(${JSON.stringify([j.uri, j.width])})`
        );
        if (!small || small.length >= j.uri.length) continue; // 안 줄면 원본 유지
        before += j.uri.length;
        after += small.length;
        out.set(key, small);
      } catch {
        /* 한 장 실패해도 나머지는 계속 — 실패한 장은 원본 유지 */
      }
    }
    if (before) {
      console.log(
        `   이미지 ${seen.size}장 축소: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`
      );
    }
  } finally {
    await browser.close().catch(() => {});
  }
  return out;
}
