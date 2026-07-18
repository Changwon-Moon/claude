import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Handlebars from "handlebars";
import { SHARED_DIR } from "./paths.js";
import type { LoadedTemplate } from "./types.js";

/** 공통 CSS를 삽입할 자리 표시. 없으면 </head> 앞에 자동 삽입한다. */
const SHARED_CSS_MARKER = "<!--WIRIT_SHARED_CSS-->";

// 자주 쓰는 안전한 헬퍼만 등록. 수치 포맷은 편집 단계(코드)에서 끝내는 것이 원칙이라
// 템플릿은 '이미 완성된 문자열'을 표시만 한다 (TEMPLATES.md).
Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper("inc", (n: unknown) => Number(n) + 1);

function readSharedCss(): string {
  const p = path.join(SHARED_DIR, "base.css");
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

/**
 * 한 페이지(카드 1장)의 데이터를 최종 HTML 문자열로 만든다.
 * - Handlebars 로 template.html 에 데이터 바인딩
 * - 상대경로 자산(로고 등) 해석을 위해 <base href> 주입 (템플릿 폴더 기준)
 * - 공통 base.css 를 인라인 <style> 로 주입 (네트워크 요청 없이 결정적 렌더)
 */
export function renderPageHtml(
  template: LoadedTemplate,
  pageData: Record<string, unknown>,
): string {
  const compile = Handlebars.compile(template.html, { noEscape: false });
  let html = compile(pageData);

  const baseHref = pathToFileURL(template.dir + path.sep).href;
  const baseTag = `<base href="${baseHref}">`;
  const styleTag = `<style>\n${readSharedCss()}\n</style>`;

  const injection = `${baseTag}\n${styleTag}`;

  if (html.includes(SHARED_CSS_MARKER)) {
    html = html.replace(SHARED_CSS_MARKER, injection);
  } else if (html.includes("</head>")) {
    html = html.replace("</head>", `${injection}\n</head>`);
  } else {
    // <head> 가 없는 템플릿이면 맨 앞에 붙인다.
    html = `${injection}\n${html}`;
  }

  return html;
}
