/**
 * 범위 정합 검사 — "제목이 말하는 지역"과 "표에 실린 지역"이 어긋나면 막는다.
 *
 * ── 왜 (2026-07-27 오너 발견)
 * 「서울 아파트 실거래 랭킹」 카드에 과천시·성남시분당구·화성시동탄구가 섞여 있었다.
 * 원인은 빌더가 실거래 캐시를 지역 구분 없이 전부 읽은 것 —
 * 7/21 만들 땐 서울 캐시뿐이라 맞았는데, 7/22 경기 캐시를 수집한 순간
 * **같은 코드가 조용히 다른 결과를 냈다.** 카드는 그대로인데 재생산하면 오염되는 종류다.
 *
 * 사람 눈으로는 "구가 36개네?"를 알아채기 어렵다. 기계가 잡아야 한다.
 * 제목·부제에 지역이 명시돼 있으면, 항목 이름이 그 지역 밖인지 본다.
 *
 * 지금은 서울만 규칙이 있다(우리 카드의 대부분). 다른 광역이 생기면 REGIONS 에 추가한다.
 */
import type { Finding } from "./types.js";

const R = "scope";

/** 서울 25개 자치구 — 이 밖의 이름이 '서울' 카드에 있으면 오염이다 */
const SEOUL_GU = new Set([
  "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구",
  "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구",
  "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구", "강동구",
]);

const REGIONS = [
  {
    key: "서울",
    // 제목에 이 말이 있으면 이 규칙을 적용한다. '수도권'은 경기 포함이라 제외.
    titleRe: /서울/,
    excludeRe: /수도권|전국|경기|광역/,
    isInside: (name: string) => SEOUL_GU.has(name.trim()),
    hint: "서울 25개 자치구",
  },
];

/** 카드 문서에서 '지역 이름으로 쓰이는 값'을 모은다 (rows[].gu, items[].name) */
function regionNames(docs: unknown[]): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    for (const k of ["gu", "name", "region", "area"]) {
      if (typeof o[k] === "string") out.push(o[k] as string);
    }
    for (const [k, val] of Object.entries(o)) {
      if (k === "mapSvg" || k === "emblem") continue; // 좌표·경로 덩어리는 볼 필요 없다
      walk(val);
    }
  };
  docs.forEach(walk);
  return out;
}

function titleOf(docs: unknown[]): string {
  return docs
    .map((d) => {
      const o = (d || {}) as Record<string, unknown>;
      return [o.title, o.subtitle, (o.meta as Record<string, unknown>)?.title]
        .filter((x) => typeof x === "string")
        .join(" ");
    })
    .join(" ");
}

/** 제목이 특정 지역을 말하는데 항목에 그 밖이 섞였으면 error */
export function scopeMatch(cardDocs: unknown[]): Finding[] {
  const title = titleOf(cardDocs);
  const names = regionNames(cardDocs);
  if (!title || !names.length) return [];

  for (const reg of REGIONS) {
    if (!reg.titleRe.test(title) || reg.excludeRe.test(title)) continue;
    // 지역명처럼 보이는 것만 검사 대상(구/시/군으로 끝나는 값)
    const candidates = [...new Set(names.filter((n) => /(구|시|군)$/.test(n.trim())))];
    if (!candidates.length) continue;
    const outside = candidates.filter((n) => !reg.isInside(n));
    if (outside.length) {
      return [{
        reviewer: R,
        level: "error",
        code: "scope-mismatch",
        msg: `제목은 '${reg.key}'인데 ${reg.hint} 밖이 ${outside.length}건 섞였습니다 — ${outside.slice(0, 5).join(", ")}${outside.length > 5 ? " 외" : ""} (빌더의 지역 필터 확인)`,
      }];
    }
  }
  return [];
}
