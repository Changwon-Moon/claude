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
// 메달 없이 숫자만. 1위가 '잘한 것'이 아닌 순위(집값 비싼 순 등)에 쓴다.
// 사용: {{rankNo this.rank @index}}
Handlebars.registerHelper("rankNo", (rank: unknown, index: unknown) => effRank(rank, index));
// 1·2·3위 기업명 색상 클래스(금/은/동). 사용: {{rankClass this.rank @index}}
Handlebars.registerHelper("rankClass", (rank: unknown, index: unknown) => {
  const r = effRank(rank, index);
  return r === "1" ? "r-gold" : r === "2" ? "r-silver" : r === "3" ? "r-bronze" : "";
});

// 수도권 전철 노선 뱃지 — 공식 노선색 원형 심볼(번호/명칭/GTX). wirit 스타일.
// 카탈로그: templates/_shared/metro-lines.json. 사용: {{{metroBadge this.line}}}
let METRO_LINES: Record<string, any> = {};
try {
  METRO_LINES = JSON.parse(
    fs.readFileSync(path.join(SHARED_DIR, "metro-lines.json"), "utf8"),
  );
} catch {
  /* 카탈로그 없으면 폴백(아래 helper가 키 텍스트 표기) */
}
Handlebars.registerHelper("metroBadge", (key: unknown) => {
  const k = String(key);
  const m = METRO_LINES[k];
  if (!m) return new Handlebars.SafeString(`<span class="rt-mono">${k}</span>`);
  const cls = m.text === "dark" ? "ln-dark" : "ln-white";
  let inner: string;
  if (m.num) inner = `<span class="num">${m.num}</span>`;
  else if (m.gtx) inner = `<span class="gtx"><i>GTX</i><b>${m.gtx}</b></span>`;
  else if (Array.isArray(m.lines))
    inner = `<span class="nm two">${m.lines[0]}<br>${m.lines[1]}</span>`;
  else inner = `<span class="nm">${m.label || k}</span>`;
  return new Handlebars.SafeString(
    `<span class="rt-line ${cls}" style="background:${m.color}">${inner}</span>`,
  );
});

/* ── 노선색 글자(metroInk) ─────────────────────────────────────────────
 * 오너 지시(2026-07-31): "구간들은 노선 색깔과 동일한 폰트로." → 이어서 "테두리가 이상하다.
 * 알아서 두께 조절해서 가독성 높여봐."
 *
 * 1차 시도는 노선색을 그대로 칠하고 밝은 색에만 `-webkit-text-stroke` 로 테두리를 둘렀다.
 * **실패였다** — 한글 27px 에서 테두리가 획을 뚱뚱하게 만들어 스티커처럼 보이고,
 * 테두리 있는 줄과 없는 줄의 **글자 굵기가 달라져** 표가 들쭉날쭉해졌다.
 * 획 두께는 폰트가 정하는 것이지 테두리가 정할 게 아니다.
 *
 * 2차(현재): **테두리를 걷어내고 색 자체를 읽히는 밝기까지 낮춘다.**
 * HSL 로 바꿔 **색상(H)·채도(S)는 그대로 두고 밝기(L)만** 이분탐색으로 내려
 * 종이 바탕(#FAFAF8) 대비 목표치를 만족시킨다 — 노선 정체성은 유지하면서 읽힌다.
 * 원래 어두운 노선(1·8·신분당…)은 계산이 통과하므로 손대지 않는다.
 * 눈이 아니라 계산이 기준이라 노선이 추가돼도 자동으로 맞는다.
 * 굵기는 템플릿에서 **모든 줄 동일**(800)하게 둔다 — 색이 달라도 획은 같아야 표가 고르다. */
function hexRgb(h: string): [number, number, number] {
  const s = h.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}
function relLum(hex: string): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hexRgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(a: string, b: string): number {
  const la = relLum(a), lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function rgbToHsl(hex: string): [number, number, number] {
  const [r0, g0, b0] = hexRgb(hex).map((v) => v / 255) as [number, number, number];
  const mx = Math.max(r0, g0, b0), mn = Math.min(r0, g0, b0);
  const l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r0) h = (g0 - b0) / d + (g0 < b0 ? 6 : 0);
    else if (mx === g0) h = (b0 - r0) / d + 2;
    else h = (r0 - g0) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hslToHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * v).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
const PAPER_BG = "#FAFAF8";
/** 대비 목표를 만족할 때까지 **밝기만** 낮춘다(색상·채도 유지). 이미 만족하면 원색 그대로. */
function inkFor(color: string, target = 4.2): string {
  if (contrastRatio(color, PAPER_BG) >= target) return color;
  const [h, s, l0] = rgbToHsl(color);
  let lo = 0, hi = l0, best = 0;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(hslToHex(h, s, mid), PAPER_BG) >= target) { best = mid; lo = mid; }
    else hi = mid;
  }
  return hslToHex(h, s, best);
}
/** 사용: <span class="m2-seg" {{{metroInk this.line}}}> — style 속성을 통째로 반환 */
Handlebars.registerHelper("metroInk", (key: unknown) => {
  const m = METRO_LINES[String(key)];
  if (!m || !m.color) return new Handlebars.SafeString("");
  return new Handlebars.SafeString(`style="color:${inkFor(String(m.color))}"`);
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
