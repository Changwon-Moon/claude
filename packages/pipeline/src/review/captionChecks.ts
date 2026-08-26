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

  /* 첫 줄 = 피드에서 '더보기' 앞에 보이는 유일한 줄이다. 여기서 멈춰 세우지 못하면 끝이다.
   * ⚠️ 예전엔 **물음표만** 후킹으로 쳤다. 그런데 오너가 실제로 올린 캡션을 세어 보니(2026-08-08)
   * 서술 + 이모지 하나로 끝나는 첫 줄이 더 많다 — "완판된 단지에 67세대가 다시 나왔습니다 🏢".
   * 질문형이 아니라고 매번 잔소리하면 **맞는 캡션이 계속 걸린다**. 진짜 조건은 '멈춰 세우는가',
   * 그 신호는 물음표 / 감탄 / 끝 이모지 셋 중 하나다. */
  const first = text.split("\n").map((s) => s.trim()).find(Boolean) || "";
  const EMOJI_END = /[\p{Extended_Pictographic}](?:️)?\s*$/u;
  if (!/[?!]/.test(first) && !EMOJI_END.test(first))
    f.push({ reviewer: R, level: "info", code: "hook", msg: "첫 줄이 밋밋합니다 — 질문(?)·감탄(!)이나 끝 이모지 하나로 멈춰 세우세요" });

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

/**
 * 캡션의 '억' 금액이 카드 수치에 존재하는지 대조 → 없으면 오보 위험(error)
 *
 * ── 예외 통로 `allow` (2026-08-26 신설, 구리역)
 * 원래 이 검사는 "캡션은 카드가 말한 숫자만 다시 말한다"를 전제로 했다. 안전마진 판형이
 * 그 전제를 깼다 — 카드가 **호가**를 기준으로 안전마진을 말하면, 캡션은 카드가 일부러
 * 안 실은 **실거래** 기준을 함께 실어야 한다(그게 오보를 막는 장치다). 그 숫자는 정의상
 * 카드에 없다. 그렇다고 검사를 끄면 진짜 오타가 같이 통과한다.
 *
 * 그래서 **관제탑(sets.json)의 `captionCrossCheck` 에 값과 이유를 적어야만** 통과한다.
 * 이유 없는 값은 여기까지 오지 않는다(reviewCli 가 거른다). 통과한 값은 info 로 찍혀
 * 리포트에 남는다 — 조용히 넘어가는 예외는 만들지 않는다.
 */
export function captionNumberMatch(text: string, cardDocs: unknown[], allow: string[] = []): Finding[] {
  const pool = collectNumbers(cardDocs);
  const allowed = new Set(allow.map((a) => String(a)));
  const capVals = [...text.matchAll(/(\d+(?:\.\d+)?)\s*억/g)].map((m) => m[1]);
  const missing = [...new Set(capVals)].filter((v) => !pool.has(v) && !allowed.has(v));
  if (missing.length)
    return [{
      reviewer: "caption-number",
      level: "error",
      code: "number-mismatch",
      msg: `캡션 금액 ${missing.map((v) => v + "억").join(", ")}이(가) 카드 수치에 없습니다 — 오보 위험, 카드와 대조 필요`,
    }];
  return [];
}
