import fs from "node:fs";
import path from "node:path";
import { chromium, type Browser } from "playwright-core";

/**
 * 사전 설치된 Chromium 실행 파일을 찾는다.
 * 이 환경은 PLAYWRIGHT_BROWSERS_PATH 아래에 chromium-{빌드}/chrome-linux/chrome 형태로 있다.
 * 못 찾으면 playwright-core 기본 탐색(executablePath 미지정)에 맡긴다.
 */
export function findChromiumExecutable(): string | undefined {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !fs.existsSync(base)) return undefined;

  const candidates: string[] = [];
  for (const entry of fs.readdirSync(base)) {
    if (entry.startsWith("chromium-")) {
      candidates.push(path.join(base, entry, "chrome-linux", "chrome"));
    }
  }
  // 빌드 번호 내림차순으로 정렬해 최신 우선
  candidates.sort().reverse();
  return candidates.find((p) => fs.existsSync(p));
}

let sharedBrowser: Browser | null = null;

/** 브라우저를 한 번만 띄워 재사용한다(여러 카드 렌더 시 성능). */
export async function getBrowser(): Promise<Browser> {
  if (sharedBrowser) return sharedBrowser;
  const executablePath = findChromiumExecutable();
  sharedBrowser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  return sharedBrowser;
}

export async function closeBrowser(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

/**
 * HTML 문자열을 지정 크기 카드 PNG 로 캡처한다.
 * 결정적 렌더: 애니메이션 정지, 폰트 로딩 완료 대기 후 캡처.
 */
export async function screenshotHtml(
  html: string,
  outPath: string,
  opts: { width: number; height: number; scale: number },
): Promise<void> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: opts.width, height: opts.height },
    deviceScaleFactor: opts.scale,
  });
  const page = await context.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle" });
    // 폰트가 다 로드된 뒤 캡처(글자 밀림 방지)
    await page.evaluate(() => (document as any).fonts?.ready);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, type: "png" });
  } finally {
    await context.close();
  }
}
