/**
 * 로고 대조표 — **붙이기 전에 오너가 눈으로 확인**하는 한 장.
 *
 * ── 왜 필요한가 (2026-07-31 오너 지시 "작업 전에 먼저 로고체크 요청해")
 * 자동 취득은 오탐한다. 실제로 '더샵'을 찾다가 포스코이앤씨 **회사** 로고를 집었고,
 * '오티에르'도 같은 파일을 집었다. 이름만 보면 성공(✅ 취득 7건)이라 로그로는 안 걸린다.
 * 로고는 좌표가 아니라 **그림**이라 designQa 가 못 잡는다 — 사람 눈이 유일한 검수다.
 *
 * ── 무엇을 보여주나
 * 요청한 브랜드명 / 실제 파일 / 그림 / 판정칸을 한 줄로 늘어놓는다.
 * 못 받은 것도 같은 표에 회색으로 남긴다 — 빠진 것을 표에서 지우면
 * "12개 중 7개"라는 사실이 보이지 않는다.
 *
 * 실행: node scripts/logo-check-sheet.mjs
 * 산출: data/out/_spike/logo-check-brands.png
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const LOGOS = join(ROOT, "templates/_shared/logos");

/* 요청 목록은 오너가 준 순서 그대로 둔다 — 대조는 순서가 같아야 빠르다.
 * file 은 취득 결과, verdict 는 **내가 눈으로 본 소견**이다(오너 판정을 대신하지 않는다). */
const ROWS = [
  { brand: "래미안", owner: "삼성물산", file: "raemian-symbol.png", src: "자동", note: "워드마크에서 심볼만 잘라냄(원본 raemian.png 도 보관)" },
  { brand: "자이", owner: "GS건설", file: "xi.png", src: "자동", note: "" },
  { brand: "아크로", owner: "DL이앤씨", file: "acro.png", src: "자동", note: "" },
  { brand: "푸르지오", owner: "대우건설", file: "prugio.png", src: "오너", note: "" },
  { brand: "써밋", owner: "대우건설", file: "summit.png", src: "오너", note: "" },
  { brand: "더샵", owner: "포스코이앤씨", file: "thesharp.png", src: "오너", note: "심볼+글자 세로 조합" },
  { brand: "오티에르", owner: "포스코이앤씨", file: "hauterre.png", src: "오너", note: "심볼+글자 세로 조합" },
  { brand: "e편한세상", owner: "DL이앤씨", file: "epyeonhansesang.png", src: "오너", note: "" },
  { brand: "롯데캐슬", owner: "롯데건설", file: "lottecastle.png", src: "오너", note: "심볼+글자 세로 조합" },
  { brand: "르엘", owner: "롯데건설", file: "leel.png", src: "오너", note: "" },
  { brand: "힐스테이트", owner: "현대건설", file: "hillstate.png", src: "오너", note: "심볼+글자 세로 조합" },
  { brand: "디에이치", owner: "현대건설", file: "theh.png", src: "오너", note: "여백 94% 잘라냄" },
];

const cell = (r) => {
  const p = r.file ? join(LOGOS, r.file) : null;
  const ok = p && existsSync(p);
  return `
  <div class="row${ok ? "" : " miss"}">
    <div class="b">${r.brand}<span class="o">${r.owner}</span></div>
    <div class="img">${ok ? `<img src="file://${p}" />` : `<span class="x">파일 없음</span>`}</div>
    <div class="f"><span class="tag ${r.src === "오너" ? "own" : "auto"}">${r.src}</span>${ok ? r.file : "—"}</div>
    <div class="n">${r.note || ""}</div>
  </div>`;
};

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
  @font-face { font-family: "Pretendard"; src: url("file://${ROOT}/templates/_shared/fonts/PretendardVariable.woff2") format("woff2-variations"); font-weight: 100 900; }
  body { margin: 0; background: #fff; font-family: "Pretendard", system-ui, sans-serif; color: #26303d; }
  .wrap { padding: 26px 30px; width: 980px; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  .sub { font-size: 15px; color: #6b7683; margin: 0 0 18px; }
  .row { display: grid; grid-template-columns: 190px 220px 170px 1fr; align-items: center;
         gap: 14px; padding: 10px 12px; border-bottom: 1px solid #eceff3; min-height: 62px; }
  .row.miss { background: #fbfbfc; }
  .b { font-size: 19px; font-weight: 700; }
  .b .o { display: block; font-size: 13px; font-weight: 500; color: #8b96a3; margin-top: 2px; }
  .img { display: flex; align-items: center; justify-content: center; height: 48px;
         background: #f5f7f9; border-radius: 5px; }
  .img img { max-width: 200px; max-height: 42px; object-fit: contain; }
  .x { font-size: 13px; color: #b9c0c9; }
  .f { font-size: 14px; color: #5b6672; font-family: ui-monospace, monospace; word-break: break-all; }
  .tag { display: inline-block; font-family: "Pretendard", sans-serif; font-size: 11px; font-weight: 700;
         padding: 2px 6px; border-radius: 3px; margin-right: 6px; vertical-align: 1px; }
  .tag.own { background: #e6f0fb; color: #1f5fa8; }
  .tag.auto { background: #eef3ee; color: #4a7a52; }
  .n { font-size: 14px; color: #8a5b1f; line-height: 1.35; }
  .row.miss .n { color: #a0a8b2; }
</style></head><body><div class="wrap">
  <h1>브랜드 로고 대조표 — 12종 전부 확보</h1>
  <p class="sub">파란 «오너»는 직접 주신 파일, 초록 «자동»은 자동 취득분입니다. 그림이 브랜드와 맞는지 확인 부탁드립니다.</p>
  ${ROWS.map(cell).join("")}
</div></body></html>`;

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
const htmlPath = join(outDir, "logo-check-brands.html");
writeFileSync(htmlPath, html, "utf8");

const { chromium } = require("playwright-core");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 980, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(`file://${htmlPath}`);
await page.waitForTimeout(400);
await page.locator(".wrap").screenshot({ path: join(outDir, "logo-check-brands.png") });
await browser.close();

const got = ROWS.filter((r) => r.file && existsSync(join(LOGOS, r.file))).length;
console.log(`🔍 로고 대조표 — ${got}/${ROWS.length} 줄에 그림 있음`);
console.log(`   → data/out/_spike/logo-check-brands.png`);
