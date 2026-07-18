import fs from "node:fs";
import path from "node:path";
import { loadTemplate } from "./loadTemplate.js";
import { validateAgainstTemplate } from "./validate.js";
import { renderPageHtml } from "./renderHtml.js";
import { screenshotHtml } from "./screenshot.js";
import type { ContentDoc, RenderResult } from "./types.js";

/**
 * 콘텐츠 JSON 파일 1개를 카드 PNG(들)로 렌더한다.
 * - pages[] 가 있으면 각 페이지를 한 장씩(캐러셀)
 * - 없으면 문서 전체를 한 장으로
 * 출력 파일명: {콘텐츠파일이름}-p{페이지번호}.png
 */
export async function renderContentFile(
  contentPath: string,
  outDir: string,
): Promise<RenderResult> {
  const raw = fs.readFileSync(contentPath, "utf8");
  const doc = JSON.parse(raw) as ContentDoc;

  if (!doc.template) {
    throw new Error(
      `콘텐츠 JSON 에 "template" 필드가 없습니다: ${contentPath}`,
    );
  }

  const template = loadTemplate(doc.template);

  // 페이지 분해: pages 배열 우선, 없으면 문서 자체가 1페이지
  const pages: Record<string, unknown>[] =
    Array.isArray(doc.pages) && doc.pages.length > 0
      ? doc.pages
      : [doc as Record<string, unknown>];

  const stem = path.basename(contentPath).replace(/\.json$/i, "");
  const outputs: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    // 각 페이지 데이터에 문서 공통 필드(제목/출처/날짜 등)를 병합해 넘긴다.
    const pageData = mergePageContext(doc, pages[i]);

    // 검증: 페이지 단위 스키마가 원칙. 단일 카드는 문서=페이지라 그대로 검증됨.
    validateAgainstTemplate(pageData, template);

    const html = renderPageHtml(template, pageData);
    const outPath = path.join(outDir, `${stem}-p${i + 1}.png`);
    await screenshotHtml(html, outPath, template.config);
    outputs.push(outPath);
  }

  return { contentPath, template: doc.template, outputs };
}

/**
 * 문서 공통 필드와 페이지별 필드를 병합.
 * 페이지가 곧 문서면(단일 카드) 그대로 반환.
 * 캐러셀이면 문서의 top-level(단, pages 제외)을 밑에 깔고 페이지 필드로 덮어쓴다.
 */
function mergePageContext(
  doc: ContentDoc,
  page: Record<string, unknown>,
): Record<string, unknown> {
  if (page === (doc as unknown)) return doc as Record<string, unknown>;
  const { pages: _pages, ...common } = doc;
  return { ...common, ...page };
}
