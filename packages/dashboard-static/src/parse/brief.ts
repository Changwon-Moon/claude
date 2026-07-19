/**
 * 소재보드(research/briefs/*.md) 파서 → 소재후보 티켓.
 * 보드 형식:
 *   ## 🎯 주 콘텐츠 ...   /  ## 📎 부 콘텐츠 ...
 *   ### 부동산
 *   - [ ] **2. 제목 — 부제** (신호출처) 🔥
 *     포맷: ranking-table · 데이터: 국토부 ...
 * 체크박스 [x]는 "제작 결정됨"으로 간주(결정로그에서 다시 상세화되므로 후보에선 제외).
 */
import type { Ticket, Evidence } from "../types.js";

/** "포맷: A · 데이터: B" 줄에서 포맷명 추출 */
function extractFormat(detail: string): string {
  const m = detail.match(/포맷\s*[:：]\s*([^·\n]+)/);
  return m ? m[1].trim() : "미정";
}
function extractDataNote(detail: string): string {
  const m = detail.match(/데이터\s*[:：]\s*([^\n]+)/);
  return m ? m[1].trim() : "";
}

/** 주/부 판정: 섹션 헤더 문맥으로 tier 결정 */
export function parseBrief(md: string, briefId: string): Ticket[] {
  const lines = md.split(/\r?\n/);
  const tickets: Ticket[] = [];
  let tier: "T1" | "T2" = "T1";
  let topic = "일반";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 대분류: 주/부 콘텐츠
    if (/^##\s+🎯/.test(line)) tier = "T1";
    else if (/^##\s+📎/.test(line)) tier = "T2";

    // 소분류: 토픽 (### 부동산)
    const topicM = line.match(/^###\s+(.+?)\s*$/);
    if (topicM) {
      topic = topicM[1].replace(/\/.*$/, "").trim();
      continue;
    }

    // 소재 항목: - [ ] **N. ...**  (체크 안 된 것만 후보)
    const itemM = line.match(/^\s*-\s*\[( |x|X)\]\s*\*\*(.+?)\*\*(.*)$/);
    if (!itemM) continue;
    const checked = itemM[1].toLowerCase() === "x";
    if (checked) continue; // 이미 고른 소재는 결정로그가 담당

    const boldInner = itemM[2].trim(); // "2. 제목 — 부제"
    const tail = itemM[3] || ""; // " (신호출처) 🔥"
    const fire = /🔥/.test(tail) || /🔥/.test(line);

    // 번호 분리
    const numM = boldInner.match(/^(\d+)\.\s*(.+)$/);
    const num = numM ? numM[1] : String(tickets.length + 1);
    const title = (numM ? numM[2] : boldInner).trim();

    // 다음 줄(들)에서 포맷·데이터 힌트
    let detail = "";
    if (i + 1 < lines.length && !/^\s*-\s*\[/.test(lines[i + 1]) && lines[i + 1].trim()) {
      detail = lines[i + 1].trim();
    }
    const fmt = extractFormat(detail);
    const dataNote = extractDataNote(detail);

    // 신호 출처: 괄호 안
    const srcM = tail.match(/\(([^)]+)\)/);
    const evidence: Evidence[] = [];
    if (srcM) evidence.push([srcM[1].trim(), "소재보드 신호 — 1차 출처 재확인 필요"]);
    if (dataNote) evidence.push(["데이터 경로", dataNote]);

    tickets.push({
      id: `${briefId}-c${num}`,
      title,
      topic,
      tier,
      fire,
      fmt,
      stage: 0,
      rubric: null,
      evidence,
      timeline: [],
      thumb: null,
      flags: [],
      origin: "brief",
      provenance: `research/briefs/${briefId}.md`,
    });
  }

  return tickets;
}
