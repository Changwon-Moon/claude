/**
 * 캡션 코드 검수 — 오너가 손으로 잡던 규칙을 자동화(키 불필요).
 *  1) lintCaption: 해시태그 수·금지어·기간 표기·출처·후킹
 *  2) captionNumberMatch: 캡션의 억 단위 금액이 카드 수치와 일치하는지(오보 방지)
 */
import {
  CAPTION_MAX_TAGS,
  CAPTION_BANNED,
  PERIOD_SPECIFIC,
  VAGUE_PERIOD,
  NUMBER_POOL_SKIP_KEYS,
} from "./rubric.js";
import type { Finding } from "./types.js";

const R = "caption-lint";

export function lintCaption(text: string): Finding[] {
  const f: Finding[] = [];
  const tags = (text.match(/(^|\s)#[^\s#]+/g) || []).length;
  if (tags > CAPTION_MAX_TAGS)
    f.push({ reviewer: R, level: "error", code: "too-many-tags", msg: `해시태그 ${tags}개 — 최대 ${CAPTION_MAX_TAGS}개로 줄이세요` });
  if (tags === 0)
    f.push({ reviewer: R, level: "warn", code: "no-tags", msg: "해시태그가 없습니다(1~5개 권장)" });

  for (const w of CAPTION_BANNED)
    if (text.includes(w))
      f.push({ reviewer: R, level: "error", code: "banned-word", msg: `금지어 '${w}' 포함 — 투자판단·면책 문구는 캡션에서 제외` });

  if (!PERIOD_SPECIFIC.test(text))
    f.push({ reviewer: R, level: "warn", code: "period-vague", msg: "집계 기간 구체 표기(예: 2026년 1~6월)가 없습니다" });
  else if (VAGUE_PERIOD.test(text) && !/20\d{2}/.test(text))
    f.push({ reviewer: R, level: "warn", code: "period-vague", msg: "'최근 N개월'은 연도 병기 권장(예: 2026년 1~6월)" });

  if (!text.includes("출처"))
    f.push({ reviewer: R, level: "warn", code: "no-source", msg: "출처 표기가 없습니다(예: 국토부 실거래가)" });

  const first = text.split("\n").map((s) => s.trim()).find(Boolean) || "";
  if (!first.includes("?"))
    f.push({ reviewer: R, level: "info", code: "hook", msg: "첫 줄 후킹 질문(?) 권장 — 피드 '더보기' 전 노출 구간" });

  return f;
}

/** 카드 문서들에서 의미 있는 숫자 풀을 모은다(SVG 좌표·문구 제외) */
function collectNumbers(docs: unknown[]): Set<string> {
  const pool = new Set<string>();
  const walk = (v: unknown) => {
    if (v == null) return;
    if (typeof v === "number") {
      pool.add(String(v));
    } else if (typeof v === "string") {
      const m = v.match(/\d+(?:\.\d+)?/g);
      if (m) m.forEach((x) => pool.add(x));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (typeof v === "object") {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (NUMBER_POOL_SKIP_KEYS.has(k)) continue;
        walk(val);
      }
    }
  };
  docs.forEach(walk);
  return pool;
}

/** 캡션의 '억' 금액이 카드 수치에 존재하는지 대조 → 없으면 오보 위험(error) */
export function captionNumberMatch(text: string, cardDocs: unknown[]): Finding[] {
  const pool = collectNumbers(cardDocs);
  const capVals = [...text.matchAll(/(\d+(?:\.\d+)?)\s*억/g)].map((m) => m[1]);
  const missing = [...new Set(capVals)].filter((v) => !pool.has(v));
  if (missing.length)
    return [{
      reviewer: "caption-number",
      level: "error",
      code: "number-mismatch",
      msg: `캡션 금액 ${missing.map((v) => v + "억").join(", ")}이(가) 카드 수치에 없습니다 — 오보 위험, 카드와 대조 필요`,
    }];
  return [];
}
