/**
 * 야후 파이낸스 차트 JSON 파서 — 일간 종가만 뽑는다.
 *
 * ── 왜 따로 떼어 냈나 (2026-09-04)
 * 원래 `krMarketCli.ts` 안에 있었는데, 그 파일은 맨 아래에서 `main()` 을 무조건 부른다.
 * 즉 **함수 하나를 쓰려고 import 하면 수집기가 통째로 돌아 버린다.**
 * 세계 지수 수집기(`worldMarketCli.ts`)가 같은 파서를 써야 해서 여기로 옮겼다.
 * `krMarketCli` 는 이 파일을 재수출(re-export)해 기존 이름을 그대로 유지한다.
 */

export interface Day {
  date: string;
  close: number;
}

/**
 * 야후 차트 JSON → 일간 종가 배열.
 *
 * ⚠️ 날짜는 **거래소 현지 시간대**로 찍는다(`meta.exchangeTimezoneName`).
 *    UTC 로 자르면 도쿄·뭄바이 종가가 하루씩 밀린다 — 월말 종가를 쓰는 카드에서
 *    그 하루가 곧 다른 달의 값이 된다.
 * ⚠️ 종가가 null 인 날(휴장·데이터 결측)은 **버린다.** 0 으로 채우면 폭락으로 읽힌다.
 */
export function parseYahooChart(json: string): Day[] {
  const doc = JSON.parse(json);
  const res = doc?.chart?.result?.[0];
  if (!res) throw new Error(`야후 응답에 chart.result 없음: ${json.slice(0, 200)}`);
  const ts: number[] = res.timestamp || [];
  const closes: (number | null)[] = res.indicators?.quote?.[0]?.close || [];
  const tz: string = res.meta?.exchangeTimezoneName || "Asia/Seoul";
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const rows: Day[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c == null || Number.isNaN(c)) continue;
    rows.push({ date: fmt.format(new Date(ts[i] * 1000)), close: c });
  }
  return rows;
}
