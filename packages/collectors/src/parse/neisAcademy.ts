/**
 * 나이스 학원 원장의 주소를 쪼갠다 — 네트워크 없이 셀프테스트로 검증되는 순수 함수.
 *
 * 원장에는 법정동 칸이 없다. 있는 건 ADMST_ZONE_NM(경기는 '가평군'처럼 시군 단위라
 * '성남시 분당구'를 못 가린다) · 도로명주소 · 도로명 상세뿐이다. 그래서
 *   · 시군구 = 도로명주소(FA_RDNMA) 앞머리에서 '시/군/구'로 끝나는 토큰
 *   · 법정동 = 도로명 상세(FA_RDNDA)의 괄호 참고항목 — 표기법이 여기 법정동을 적게 되어 있다
 * 로 뽑는다. 못 뽑은 행은 버리되 **몇 건인지 세어** 남긴다(커버리지를 모르면 숫자를 못 믿는다).
 */

/** 도로명주소에서 시군구를 뽑는다. '시/군/구'로 끝나는 토큰만 이어 붙인다(읍·면에서 끊긴다). */
export function sggOf(rdnma: string): string {
  const t = String(rdnma || "").trim().split(/\s+/);
  if (t.length < 2) return "";
  const parts: string[] = [];
  for (let i = 1; i < t.length; i++) {
    if (/(시|군|구)$/.test(t[i])) parts.push(t[i]);
    else break;
  }
  // 세종은 단층제라 **시도가 곧 시군구**다 — 뒤에 붙는 시군구 토큰이 없다.
  // 실제 응답: "세종특별자치시 한누리대로 2236" (2026-09-01 표본 확인).
  if (!parts.length && t[0] === "세종특별자치시") return t[0];
  return parts.join("");
}

/** 도로명 상세의 **마지막 괄호** 안 첫 항목에서 법정동을 뽑는다. 동·가·리만 인정한다. */
export function dongOf(rdnda: string): string {
  const s = String(rdnda || "");
  let found = "";
  for (const m of s.matchAll(/\(([^()]*)\)/g)) {
    const first = m[1].split(",")[0].trim();
    if (/^[가-힣0-9]+(동|가|리)$/.test(first)) found = first;   // 뒤쪽 괄호가 이기게 둔다
  }
  return found;
}
