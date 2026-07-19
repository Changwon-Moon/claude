/**
 * company/CEO.md · company/teams/*.md 파서 → 회사 탭 데이터.
 * CEO.md: "### A. 전략 …" 섹션별 표(| 날짜 | 원칙 | 출처 |) → 카테고리별 원칙 목록.
 * 팀 카드: 제목(이모지+이름) · 가치관 · 학습로그 수 · 자동화 수위.
 */
import type { Principle, TeamCard } from "../types.js";

/** CEO.md → { "A. 전략 — …": [{date,text}, …], … } */
export function parseCeoPrinciples(md: string): {
  count: number;
  byCategory: Record<string, Principle[]>;
} {
  const lines = md.split(/\r?\n/);
  const byCategory: Record<string, Principle[]> = {};
  let cat: string | null = null;
  let count = 0;

  for (const line of lines) {
    const h = line.match(/^###\s+([A-Z]\.\s+.+?)\s*$/);
    if (h) {
      cat = h[1].trim();
      byCategory[cat] = [];
      continue;
    }
    if (!cat) continue;
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split("|").map((c) => c.trim());
    const c = cells.filter((_, i) => i > 0 && i < cells.length - 1);
    if (c.length < 2) continue;
    const [date, text] = c;
    if (date === "날짜" || /^-+$/.test(date.replace(/[:\s]/g, ""))) continue;
    if (!date || !text) continue;
    byCategory[cat].push({ date, text });
    count++;
  }

  // 빈 카테고리 제거
  for (const k of Object.keys(byCategory)) if (!byCategory[k].length) delete byCategory[k];
  return { count, byCategory };
}

/** 팀 카드 1장 파싱 */
export function parseTeamCard(md: string, slug: string): TeamCard | null {
  const lines = md.split(/\r?\n/);
  const titleM = lines.find((l) => /^#\s+/.test(l));
  if (!titleM) return null;
  const raw = titleM.replace(/^#\s+/, "").trim();
  // 이모지 분리 (선두 픽토그램 + 변형 선택자·ZWJ 시퀀스까지 포함)
  const emojiM = raw.match(/^([\p{Extended_Pictographic}‍️]+)\s*(.+)$/u);
  const emoji = emojiM ? emojiM[1].trim() : "🏷️";
  const name = emojiM ? emojiM[2].trim() : raw;

  const valuesM = md.match(/\*\*가치관\*\*\s*[:：]\s*([^\n]+)/);
  const values = valuesM ? valuesM[1].trim() : "";

  const respM = md.match(/\*\*책임\*\*\s*[:：]\s*([^\n]+)/);
  const responsibility = respM ? respM[1].trim() : "";

  const autoM = md.match(/\*\*자동화\*\*\s*[:：]\s*([^\n|]+)/);
  const autonomy = autoM ? autoM[1].trim() : "—";

  // 학습 로그 표의 데이터 행 수
  let inLog = false;
  let logCount = 0;
  for (const line of lines) {
    if (/^##\s+.*학습\s*로그/.test(line)) {
      inLog = true;
      continue;
    }
    if (inLog && /^##\s+/.test(line)) break; // 다음 섹션
    if (inLog && /^\s*\|/.test(line)) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      const first = cells[0] || "";
      if (first === "날짜" || /^-+$/.test(first.replace(/[:\s]/g, ""))) continue;
      logCount++;
    }
  }

  return {
    slug,
    emoji,
    name,
    values,
    responsibility,
    autonomy,
    logCount,
    path: `company/teams/${slug}.md`,
    promptPath: `prompts/${slug}.md`,
    hasPrompt: false, // buildState에서 파일 존재 확인 후 채움
  };
}
