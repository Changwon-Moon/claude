/**
 * Stooq 일간 시세 CSV 파서 (순수 함수 — 네트워크 없이 테스트 가능).
 * 형식: 헤더 "Date,Open,High,Low,Close,Volume" + 일별 행 (오래된 → 최신).
 * 미국 지수: ^spx(S&P500), ^ndq(나스닥종합), ^dji(다우).
 */
export interface DailyRow {
  date: string; // YYYY-MM-DD
  close: number;
}

export function parseStooqDailyCsv(csv: string): DailyRow[] {
  const lines = csv
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const dateIdx = header.indexOf("date");
  const closeIdx = header.indexOf("close");
  if (dateIdx === -1 || closeIdx === -1) {
    throw new Error(`Stooq CSV 헤더에 Date/Close 없음: ${lines[0]}`);
  }

  const rows: DailyRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const date = cols[dateIdx]?.trim();
    const close = Number(cols[closeIdx]);
    if (!date || Number.isNaN(close)) continue; // "N/D" 등 결측 스킵
    rows.push({ date, close });
  }
  return rows;
}

/** 월 1회 샘플링해 시계열을 ~13포인트로 축약 (1년 차트용). 항상 최신 포인트 포함. */
export function monthlySample(rows: DailyRow[], maxPoints = 13): DailyRow[] {
  if (rows.length <= maxPoints) return rows;
  const byMonth = new Map<string, DailyRow>();
  for (const r of rows) {
    byMonth.set(r.date.slice(0, 7), r); // 각 월의 마지막(최신) 행이 남음
  }
  const sampled = [...byMonth.values()];
  const last = rows[rows.length - 1];
  if (sampled[sampled.length - 1]?.date !== last.date) sampled.push(last);
  return sampled.slice(-maxPoints);
}
