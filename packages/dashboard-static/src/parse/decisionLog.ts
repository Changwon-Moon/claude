/**
 * research/DECISION_LOG.md 표 파서 → 결정된 소재 티켓.
 * 표 컬럼: 날짜 | 소재 | 신호 | Tier | 포맷 | 점수 | 결정 | 이유 | 성과
 * (예시) 행은 건너뛴다. 결정 기호: ✅제작 / ✅자동 / ⏸보류 / ❌버림
 */
import type { Ticket, Evidence, Rubric } from "../types.js";
import { RUBRIC_LABELS } from "../types.js";

function slugFromTitle(title: string, idx: number): string {
  // 한글 제목 → 안정적 id (인덱스 기반, 결정적)
  return `d${idx}`;
}

function tierOf(cell: string): "T1" | "T2" {
  return /T2/i.test(cell) ? "T2" : "T1";
}
function topicOf(tierCell: string): string {
  // "T1 부동산" → "부동산"
  const m = tierCell.match(/T[12]\s*(.*)$/i);
  const rest = m ? m[1].trim() : "";
  return rest || "일반";
}

/** 결정 기호 → {stage, flags, auto} */
function mapDecision(decision: string): { stage: number; flags: string[]; auto: boolean; dropped: boolean } {
  if (/자동/.test(decision)) return { stage: 5, flags: [], auto: true, dropped: false };
  if (/버림/.test(decision) || /❌/.test(decision)) return { stage: 0, flags: ["버림"], auto: false, dropped: true };
  if (/보류/.test(decision) || /⏸/.test(decision)) return { stage: 0, flags: ["보류"], auto: false, dropped: false };
  // ✅제작 등 — 제작 파이프라인 진입 (렌더 산출물 있으면 뒤에서 승인대기로 승격)
  return { stage: 2, flags: [], auto: false, dropped: false };
}

export function parseDecisionLog(md: string): Ticket[] {
  const lines = md.split(/\r?\n/);
  const tickets: Ticket[] = [];
  let idx = 0;

  for (const line of lines) {
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split("|").map((c) => c.trim());
    // 앞뒤 빈 셀 제거
    const c = cells.filter((_, i) => i > 0 && i < cells.length - 1);
    if (c.length < 8) continue;

    const [date, material, signal, tierCell, fmt, scoreRaw, decision, reason] = c;
    // 헤더/구분선/예시 스킵
    if (date === "날짜" || /^-+$/.test(date.replace(/[:\s]/g, ""))) continue;
    if (/^-{3,}/.test(material)) continue;
    if (/\(예시\)/.test(material)) continue;
    if (!material || material.startsWith("<!--")) continue;

    idx++;
    const { stage, flags, auto } = mapDecision(decision);
    const fire = /🔥/.test(signal) || /🔥/.test(material);

    const scoreNum = parseInt((scoreRaw || "").replace(/[^\d]/g, ""), 10);
    const rubric: Rubric | null = Number.isFinite(scoreNum)
      ? { labels: RUBRIC_LABELS, values: [], sum: scoreNum, max: 18 }
      : null;

    const evidence: Evidence[] = [];
    if (signal && signal !== "—") evidence.push(["신호", signal]);
    if (reason && reason !== "—") evidence.push(["기획 판단", reason]);

    tickets.push({
      id: slugFromTitle(material, idx),
      title: material,
      topic: topicOf(tierCell),
      tier: tierOf(tierCell),
      fire,
      fmt: fmt || "미정",
      stage,
      rubric,
      evidence,
      timeline: [],
      thumb: null,
      flags,
      auto,
      origin: "decision",
      provenance: "research/DECISION_LOG.md",
    });
  }

  return tickets;
}
