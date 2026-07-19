/** 수치·날짜 포맷 헬퍼 (결정적). 콘텐츠 JSON의 표시 문자열을 코드로 생성한다. */

/** 6820.5 → "6,820.50" (천단위 콤마 + 소수 2자리) */
export function formatNum(n: number, digits = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** 등락 표시 문자열: "10.50 (0.15%)" — 부호는 화살표(dir)가 표현하므로 절대값 */
export function formatDelta(changeAbs: number, changePct: number): string {
  return `${formatNum(Math.abs(changeAbs))} (${Math.abs(changePct).toFixed(2)}%)`;
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-07-17" → "26.07.17(금)" (UTC 기준, 결정적) */
export function formatDateShort(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  const dow = WEEKDAY[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
  return `${y.slice(2)}.${m}.${d}(${dow})`;
}

/** "2026-07-17" → "2026.07" (차트 축 라벨) */
export function formatYearMonth(isoDate: string): string {
  const [y, m] = isoDate.split("-");
  return `${y}.${m}`;
}
