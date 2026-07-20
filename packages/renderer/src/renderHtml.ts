import fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";
import { SHARED_DIR } from "./paths.js";
import type { LoadedTemplate } from "./types.js";

/** 공통 CSS를 삽입할 자리 표시. 없으면 </head> 앞에 자동 삽입한다. */
const SHARED_CSS_MARKER = "<!--WIRIT_SHARED_CSS-->";

// 자주 쓰는 안전한 헬퍼만 등록. 수치 포맷은 편집 단계(코드)에서 끝내는 것이 원칙이라
// 템플릿은 '이미 완성된 문자열'을 표시만 한다 (TEMPLATES.md).
Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper("lt", (a: unknown, b: unknown) => Number(a) < Number(b));
Handlebars.registerHelper("inc", (n: unknown) => Number(n) + 1);

// 항목 수에 따른 밀도 클래스: 표가 카드 높이에 맞게 자동으로 촘촘/느슨해진다.
// (정밀한 오버플로 대응은 M10 디자인 QA 루프에서 보강)
Handlebars.registerHelper("densityClass", (arr: unknown) => {
  const n = Array.isArray(arr) ? arr.length : 0;
  if (n <= 6) return "d-sparse";
  if (n <= 11) return "d-mid";
  return "d-dense";
});

// 로고 미보유 시 임시 모노그램(이름 첫 글자). 실제 로고는 로고 라이브러리 구축 후 교체.
Handlebars.registerHelper("initial", (name: unknown) =>
  typeof name === "string" && name.length > 0 ? name.trim()[0] : "·",
);

// 등락 방향 화살표. 수치는 데이터가 제공, 화살표만 방향으로 표기.
Handlebars.registerHelper("arrow", (dir: unknown) =>
  dir === "up" ? "▲" : dir === "down" ? "▼" : "·",
);

// 유효 순위 계산: rank 필드가 있으면 그 값(공동순위 반영), 없으면 표시 순번(@index+1).
function effRank(rank: unknown, index: unknown): string {
  return rank != null && rank !== "" ? String(rank) : String(Number(index) + 1);
}
// 1·2·3위는 금·은·동 메달, 그 외는 숫자. 사용: {{medal this.rank @index}}
Handlebars.registerHelper("medal", (rank: unknown, index: unknown) => {
  const r = effRank(rank, index);
  return r === "1" ? "🥇" : r === "2" ? "🥈" : r === "3" ? "🥉" : r;
});
// 1·2·3위 기업명 색상 클래스(금/은/동). 사용: {{rankClass this.rank @index}}
Handlebars.registerHelper("rankClass", (rank: unknown, index: unknown) => {
  const r = effRank(rank, index);
  return r === "1" ? "r-gold" : r === "2" ? "r-silver" : r === "3" ? "r-bronze" : "";
});

/**
 * 결정적 라인 차트 SVG 생성 (1년 추이 등).
 * 사용: {{{lineChart series width=984 height=240}}}
 * - 강조선=코발트, 하단 면=옅은 코발트, 마지막 점 강조
 * - 수치는 데이터(series)에서만 옴 (LLM 창작 없음)
 */
Handlebars.registerHelper("lineChart", (series: unknown, options: any) => {
  const hash = (options && options.hash) || {};
  const w = Number(hash.width ?? 984);
  const h = Number(hash.height ?? 240);
  const pad = Number(hash.pad ?? 8);
  const color = String(hash.color ?? "#2e6bff");
  const fill = String(hash.fill ?? "rgba(46,107,255,0.10)");
  const data = Array.isArray(series)
    ? series.map(Number).filter((n) => !Number.isNaN(n))
    : [];
  if (data.length < 2) return new Handlebars.SafeString("");

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const n = data.length;
  const px = (i: number) => pad + (i / (n - 1)) * (w - 2 * pad);
  const py = (v: number) => pad + (1 - (v - min) / range) * (h - 2 * pad);
  const pts = data.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`);
  const line = "M" + pts.join(" L");
  const area =
    `M${px(0).toFixed(1)},${(h - pad).toFixed(1)} L` +
    pts.join(" L") +
    ` L${px(n - 1).toFixed(1)},${(h - pad).toFixed(1)} Z`;
  const svg =
    `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="${area}" fill="${fill}"/>` +
    `<path d="${line}" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<circle cx="${px(n - 1).toFixed(1)}" cy="${py(data[n - 1]).toFixed(1)}" r="8" fill="${color}"/>` +
    `</svg>`;
  return new Handlebars.SafeString(svg);
});

function readSharedCss(): string {
  const p = path.join(SHARED_DIR, "base.css");
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

/**
 * 한 페이지(카드 1장)의 데이터를 최종 HTML 문자열로 만든다.
 * - Handlebars 로 template.html 에 데이터 바인딩
 * - 공통 base.css 를 인라인 <style> 로 주입
 * 주의: 상대경로 자산(폰트·국기·로고·사진)은 렌더 단계에서 템플릿 폴더 안에
 *       임시 HTML 파일을 써서 file:// 로 로드하므로(screenshot.ts), 여기서
 *       <base href> 를 넣지 않는다. (setContent 방식은 file:// 하위자산이 차단됨)
 */
export function renderPageHtml(
  template: LoadedTemplate,
  pageData: Record<string, unknown>,
): string {
  const compile = Handlebars.compile(template.html, { noEscape: false });
  let html = compile(pageData);

  const styleTag = `<style>\n${readSharedCss()}\n</style>`;

  if (html.includes(SHARED_CSS_MARKER)) {
    html = html.replace(SHARED_CSS_MARKER, styleTag);
  } else if (html.includes("</head>")) {
    html = html.replace("</head>", `${styleTag}\n</head>`);
  } else {
    html = `${styleTag}\n${html}`;
  }

  // 모든 카드에 우상단 원형 로고(wirit.)를 자동 삽입 — 카드 여는 태그 바로 뒤.
  html = html.replace(
    /(<div class="wirit-card[^>]*>)/,
    `$1${CORNER_LOGO}`,
  );

  return html;
}

/** 우상단 원형 로고 마크업 (스타일은 base.css .wirit-corner) */
const CORNER_LOGO =
  '<div class="wirit-corner"><span class="mark">wirit<span class="dot">.</span></span></div>';
