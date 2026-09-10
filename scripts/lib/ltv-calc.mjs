/**
 * LTV·한도 규제 계산 엔진 — 「1억으로 살 수 있는 집」 시리즈 공용
 *
 * 규칙은 data/datasets/ltv-rules-2026-09.json 이 정본이다. 이 파일은 **계산만** 한다.
 * 단위는 전부 억원. 손으로 적은 숫자는 하나도 없다 — 전부 규칙에서 나온다.
 *
 * 대출  = min(집값 × LTV, 한도)     ※ 12.16 국면은 구간 합산(9억 이하분·초과분)
 * 필요현금 = 집값 − 대출
 * 최대 집값(현금 E) = 필요현금(P) ≤ E 를 만족하는 최대 P — **해석적으로** 푼다(격자 탐색 금지:
 *   0.01 격자로 풀면 1/0.6 = 1.6666… 이 1.66 으로 잘려 카드에 1.67 대신 1.66 이 나간다)
 */

/** 가격구간별 한도. cap 이 단일값이면 그대로, capTiers 면 구간에서 고른다. */
export function capOf(rule, P) {
  if (rule.capTiers) {
    for (const [upto, cap] of rule.capTiers) if (upto === null || P <= upto) return cap;
  }
  return rule.cap ?? null;
}

/** 집값 P(억)에 대한 대출 가능액(억). */
export function loanOf(rule, P) {
  if (rule.kind === 'tier') {
    if (rule.banAbove != null && P > rule.banAbove) return 0;
    const lo = Math.min(rule.t1, P);
    const hi = Math.max(0, P - rule.t1);
    return lo * rule.ltv1 + hi * rule.ltv2;
  }
  const byLtv = rule.ltv * P;
  const cap = capOf(rule, P);
  return cap == null ? byLtv : Math.min(byLtv, cap);
}

export const cashOf = (rule, P) => P - loanOf(rule, P);
export const effLtv = (rule, P) => (P === 0 ? 0 : (loanOf(rule, P) / P) * 100);

/**
 * 현금 E 로 살 수 있는 최대 집값. 필요현금 함수는 구간마다 기울기가 다른 조각별 1차식이라
 * **후보를 모두 세워 유효한 것 중 최대**를 고른다. 어느 조각에도 해가 없으면 경계값이 답이다
 * (그게 「현금 절벽」이다 — 10억 현금으로도 15억이 최대인 이유).
 */
export function maxPrice(rule, E) {
  if (E <= 0) return 0;
  const cands = [];
  const push = (P) => { if (P > 0 && Math.abs(cashOf(rule, P) - E) < 1e-9) cands.push(P); };

  if (rule.kind === 'tier') {
    // 조각 ①: P ≤ t1  → E = P(1−ltv1)
    let P = E / (1 - rule.ltv1);
    if (P <= rule.t1 + 1e-9) push(P);
    // 조각 ②: t1 < P ≤ banAbove → E = P(1−ltv2) − t1(ltv1−ltv2)
    P = (E + rule.t1 * (rule.ltv1 - rule.ltv2)) / (1 - rule.ltv2);
    if (P > rule.t1 - 1e-9 && (rule.banAbove == null || P <= rule.banAbove + 1e-9)) push(P);
    // 조각 ③: P > banAbove → 대출 0 → E = P
    if (rule.banAbove != null && E > rule.banAbove) push(E);
  } else {
    // 조각 ①: LTV 가 무는 구간 → E = P(1−ltv)
    const P = E / (1 - rule.ltv);
    if (capOf(rule, P) == null || rule.ltv * P <= capOf(rule, P) + 1e-9) push(P);
    // 조각 ②: 한도가 무는 구간 → E = P − cap  (구간마다 cap 이 다르므로 전부 시도)
    const tiers = rule.capTiers ?? (rule.cap != null ? [[null, rule.cap]] : []);
    for (const [upto, cap] of tiers) {
      const Pc = E + cap;
      const lower = tiers.findIndex((t) => t[0] === upto) === 0 ? 0 : tiers[tiers.findIndex((t) => t[0] === upto) - 1][0];
      const okBand = Pc > lower + 1e-9 && (upto === null || Pc <= upto + 1e-9);
      const okCap = rule.ltv * Pc >= cap - 1e-9; // 한도가 실제로 무는가
      if (okBand && okCap) push(Pc);
    }
  }
  if (cands.length) return Math.max(...cands);

  // 어느 조각에도 해가 없다 = 현금 절벽. 필요현금이 E 를 넘지 않는 최대 경계값을 고른다.
  const edges = [];
  if (rule.capTiers) for (const [upto] of rule.capTiers) if (upto != null) edges.push(upto);
  if (rule.banAbove != null) edges.push(rule.banAbove);
  const ok = edges.filter((P) => cashOf(rule, P) <= E + 1e-9);
  return ok.length ? Math.max(...ok) : 0;
}

/** 규칙표를 읽어 국면 배열로 — 빌더는 이 함수만 부른다. */
export function loadPhases(ds) {
  return ds.phases.map((p) => ({ ...p }));
}
