/**
 * LLM 검수 에이전트 — 렌더 PNG(+캡션)를 루브릭 렌즈별로 채점.
 * ANTHROPIC_API_KEY 없거나 SDK 미설치면 우아하게 스킵(코드 검수는 그대로 진행).
 * 모델은 WIRIT_REVIEW_MODEL 환경변수로 지정(가이드 참조). 하드코딩하지 않는다.
 */
import { readFileSync } from "node:fs";
import { LLM_LENSES } from "./rubric.js";
import type { Finding } from "./types.js";

export interface LensResult {
  lens: string;
  score: number;
  findings: Finding[];
}

const REVIEW_MODEL = process.env.WIRIT_REVIEW_MODEL || "claude-sonnet-5";

export function llmAvailability(): { ok: boolean; note: string } {
  if (!process.env.ANTHROPIC_API_KEY)
    return { ok: false, note: "ANTHROPIC_API_KEY 없음 — LLM 검수 건너뜀(코드 검수만). 키 등록: docs/guides/anthropic-key.md" };
  return { ok: true, note: `LLM 검수 활성 (모델: ${REVIEW_MODEL})` };
}

function safeJson(t: string): any {
  try {
    const m = t.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch {
    return null;
  }
}

/** 한 장의 PNG를 지정 렌즈들로 채점. 실패(네트워크·SDK)해도 예외 대신 note 반환 */
export async function reviewImage(
  pngPath: string,
  captionText: string | undefined,
  lensKeys: string[],
): Promise<{ results: LensResult[]; note: string }> {
  let Anthropic: any;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch {
    return { results: [], note: "@anthropic-ai/sdk 미설치 — pnpm install 후 사용" };
  }
  const client = new Anthropic();
  const img = readFileSync(pngPath).toString("base64");
  const results: LensResult[] = [];

  for (const key of lensKeys) {
    const lens = LLM_LENSES[key];
    if (!lens) continue;
    const system =
      `당신은 wirit(@wirit_note) 인스타 데이터 인포그래픽 계정의 ${lens.title}입니다. ` +
      `${lens.guide} ` +
      `반드시 아래 JSON만 출력하세요(다른 말 금지): ` +
      `{"score": 0~10 정수, "findings": [{"level":"error|warn|info","msg":"지적과 구체적 수정지시"}]}`;
    const content: any[] = [
      { type: "image", source: { type: "base64", media_type: "image/png", data: img } },
    ];
    if (captionText) content.push({ type: "text", text: `[캡션]\n${captionText}` });
    content.push({ type: "text", text: "이 카드를 루브릭으로 채점하고 JSON만 출력하세요." });

    try {
      const msg = await client.messages.create({
        model: REVIEW_MODEL,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content }],
      });
      const txt = (msg.content || [])
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("");
      const parsed = safeJson(txt);
      const score = typeof parsed?.score === "number" ? parsed.score : 5;
      const findings: Finding[] = (parsed?.findings || []).map((x: any) => ({
        reviewer: `llm:${key}`,
        level: x.level === "error" || x.level === "info" ? x.level : "warn",
        code: "llm",
        msg: String(x.msg || "").slice(0, 300),
      }));
      if (score < lens.pass && !findings.some((f) => f.level !== "info"))
        findings.push({ reviewer: `llm:${key}`, level: "warn", code: "below-pass", msg: `${lens.title} 점수 ${score}/${lens.pass} 미만` });
      results.push({ lens: key, score, findings });
    } catch (e: any) {
      return { results, note: `LLM 호출 실패: ${e?.message || e}` };
    }
  }
  return { results, note: "ok" };
}
