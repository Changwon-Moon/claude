/**
 * 「이 세트를 만드는 빌더는 무엇인가」 — **정본 하나**.
 *
 * ── 왜 이 파일인가 (2026-08-25)
 * 같은 판단이 **세 곳**에 각각 적혀 있었다: `produce-card.mjs`(재생산) ·
 * `confirm.mjs`(고정물/정기물 판정) · `smoke-tower.mjs`(세트↔빌더 정합).
 * 하루치를 캐러셀 한 세트로 묶자(오너 2026-08-25) 셋이 나란히 어긋났다:
 *   ① produce-card — 「빌더가 없습니다」로 재생산이 막혔다
 *   ② confirm      — 빌더를 못 찾아 `deps` 가 비었고, **정기물을 고정물로 판정해**
 *                    pixel-baselines 에 15건을 넣었다(다음 수집일에 doctor 가 통째로 빨간불)
 *   ③ smoke-tower  — 「빌더가 없다」로 191/192
 * 하나를 고치면 다음이 걸렸다. **같은 판단이 두 곳에 있으면 언젠가 갈라진다**
 * (CEO.md 2026-08-17 ③ — 마감 절차가 네 군데에 다르게 적혀 있던 그 사고와 같은 자리다).
 *
 * ── 세 갈래로 찾는다
 *   ⑴ 세트 라벨 = 빌더 라벨            (카드 1장 = 세트 1개인 옛 구조)
 *   ⑵ 빌더의 `produces` 에 적힌 카드   ← **이름 규칙을 추측하지 않고 적힌 것을 읽는다**
 *   ⑶ 카드 slug 와 빌더 라벨의 접두 대응 (옛 빌더 호환)
 *
 * ⑵ 가 없으면 **한 세트에 여러 빌더**를 못 묶는다. 신고가 빌더는 라벨이 로마자
 * (`singo-taereung-harrington`)이고 카드 slug 는 한글(`singo-태릉해링턴플레이스-84`)이라
 * ⑴·⑶ 어느 쪽으로도 안 걸린다.
 */

/** `estate-84-p2` → `estate-84` (캐러셀 장 번호를 뗀다) */
const base = (c) => String(c).replace(/-p\d+$/, "");

/**
 * @param {{label:string, cards:string[]}} set   세트 정의
 * @param {{label:string, produces?:string[]}[]} builders  builders.json 의 목록
 * @returns {object[]} 이 세트를 만드는 빌더들
 */
export function buildersForSet(set, builders) {
  const cards = Array.isArray(set?.cards) ? set.cards : [];
  return (builders ?? []).filter(
    (b) =>
      b.label === set.label ||
      (Array.isArray(b.produces) && b.produces.some((x) => cards.includes(x))) ||
      cards.some((c) => c.startsWith(b.label) || b.label.startsWith(base(c))),
  );
}

/**
 * 세트의 **모든 카드**가 어떤 빌더에든 덮이나 — 관제탑 정합 검사용.
 * 한 장이라도 안 덮이면 실사이트에서 그 장이 안 뜬다.
 */
export function setFullyCovered(set, builders) {
  const cards = Array.isArray(set?.cards) ? set.cards : [];
  if (builders?.some((b) => b.label === set.label)) return true;
  return cards.every((c) =>
    (builders ?? []).some(
      (b) =>
        (Array.isArray(b.produces) && b.produces.includes(c)) ||
        c.startsWith(b.label) ||
        b.label.startsWith(base(c)),
    ),
  );
}
