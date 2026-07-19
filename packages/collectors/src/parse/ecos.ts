/**
 * 한국은행 ECOS OpenAPI 응답 파서 (순수 함수).
 * StatisticSearch 응답 형태:
 * { "StatisticSearch": { "list_total_count": N,
 *     "row": [ { "TIME": "20260717", "DATA_VALUE": "1495.2", ... }, ... ] } }
 * TIME 은 일(YYYYMMDD)/월(YYYYMM) 등 주기별 포맷. 오래된 → 최신 순으로 가정하고 정렬 보정.
 */
export interface EcosPoint {
  time: string; // 원본 TIME (YYYYMMDD or YYYYMM)
  value: number;
}

export function parseEcosJson(jsonText: string): EcosPoint[] {
  const data = JSON.parse(jsonText);

  // 에러 응답: { "RESULT": { "CODE": "...", "MESSAGE": "..." } }
  if (data.RESULT?.CODE) {
    throw new Error(`ECOS 오류 ${data.RESULT.CODE}: ${data.RESULT.MESSAGE}`);
  }

  const rows = data?.StatisticSearch?.row;
  if (!Array.isArray(rows)) {
    throw new Error("ECOS 응답에 StatisticSearch.row 배열이 없음");
  }

  const points: EcosPoint[] = [];
  for (const r of rows) {
    const time = String(r.TIME ?? "").trim();
    const value = Number(r.DATA_VALUE);
    if (!time || Number.isNaN(value)) continue;
    points.push({ time, value });
  }
  // TIME 문자열 오름차순 정렬 → 마지막이 최신
  points.sort((a, b) => a.time.localeCompare(b.time));
  return points;
}

/** ECOS TIME(YYYYMMDD/YYYYMM) → YYYY-MM-DD 표기 */
export function ecosTimeToDate(time: string): string {
  if (time.length === 8) return `${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}`;
  if (time.length === 6) return `${time.slice(0, 4)}-${time.slice(4, 6)}-01`;
  return time;
}
