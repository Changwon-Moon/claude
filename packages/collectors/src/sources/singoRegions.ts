/**
 * 신고가 알림이 볼 지역 — 서울 25개구 전체 + 경기 주요시 (2026-08-12 오너 결정).
 *
 * ── "주요시"를 코드로 못박은 이유
 * 매일 도는 수집기의 대상이 말로만 정해져 있으면, 어느 날 목록이 조용히 달라져도 아무도 모른다.
 * 여기 적힌 것이 정본이고, 바꾸려면 이 파일을 고친다.
 *
 * ── 왜 일부 시·군을 뺐나
 * 역대 최고가 인덱스를 채우려면 지역 하나당 2006년부터 240개월을 긁어야 한다(=API 호출).
 * 아파트 거래가 드문 군 지역까지 넣으면 초기 수집만 길어지고, 1000세대 이상 단지도 거의 없다.
 * 뺀 곳이 필요해지면 `GYEONGGI_EXCLUDE` 에서 지우면 그날부터 채워진다.
 */
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = resolve(fileURLToPath(import.meta.url), "../..");

/**
 * 경기에서 **볼 시**(2026-08-12 오너가 직접 고름). 20개 시.
 * `lawd-gyeonggi.json` 은 구 단위(수원시영통구 등)라 여기 적힌 시 이름으로 **시작하는** 항목을 전부 담는다.
 * 뺀 곳: 의정부·파주·이천·안성·양주·포천·동두천·여주 + 군 지역(연천·가평·양평).
 */
export const GYEONGGI_CITIES = [
  "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시",
  "부천시", "성남시", "수원시", "시흥시", "안산시", "안양시", "오산시", "용인시",
  "의왕시", "평택시", "하남시", "화성시",
];

export interface Region {
  gu: string;
  lawdCd: string;
}

const load = (f: string): Record<string, string> =>
  JSON.parse(readFileSync(join(HERE, "data", f), "utf8")).codes;

/** 신고가 대상 지역 목록 — 서울 25개구 전역 → 경기 20개 시 순 (초기 수집이 서울부터 차오르게) */
export function singoRegions(): Region[] {
  const seoul = load("lawd-seoul.json");
  const gg = load("lawd-gyeonggi.json");
  const out: Region[] = [];
  for (const [gu, lawdCd] of Object.entries(seoul)) out.push({ gu, lawdCd });
  for (const [gu, lawdCd] of Object.entries(gg)) {
    if (!GYEONGGI_CITIES.some((c) => gu.startsWith(c))) continue;
    out.push({ gu, lawdCd });
  }
  return out;
}

/** from(YYYYMM) 부터 to(YYYYMM) 까지 월 문자열 — 오름차순 */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  let y = Number(from.slice(0, 4));
  let m = Number(from.slice(4, 6));
  const ey = Number(to.slice(0, 4));
  const em = Number(to.slice(4, 6));
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return out;
}
