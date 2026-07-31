/**
 * 브랜드 색 한 곳 — 추출값 + 오너 수정 + 하이엔드 상속을 합쳐 최종 색을 낸다.
 *
 * ── 왜 별도 파일인가
 * 지도 마커·단지명 글씨·하단 카드가 모두 같은 색을 봐야 한다. 세 곳이 각자 계산하면
 * 언젠가 하나만 어긋나고, 그때 카드는 "같은 회사인데 색이 둘"이 된다.
 * 계산은 여기 한 번만 있다.
 *
 * 색의 출처는 세 겹이다:
 *   ① brand-colors.json      — 로고 픽셀에서 뽑은 값 (extract-brand-colors.mjs)
 *   ② brand-color-overrides  — 오너가 바꾼 것 (붙어 보이는 색을 갈라놓은 판단)
 *   ③ 하이엔드 상속          — 검정 로고라 뽑을 색이 없는 브랜드는 같은 회사의 일반 브랜드 색
 * 겹의 순서가 곧 우선순위다.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export function loadPalette() {
  const ex = JSON.parse(readFileSync(join(ROOT, "data/datasets/brand-colors.json"), "utf8"));
  const ov = JSON.parse(readFileSync(join(ROOT, "data/datasets/brand-color-overrides.json"), "utf8"));

  const byName = new Map();
  const mainOf = new Map();     // 회사 → 일반 브랜드 색
  for (const b of ex.brands) {
    const o = ov.overrides[b.name];
    const hex = o ? o.hex : b.hex;
    byName.set(b.name, { ...b, hex, overridden: !!o, why: o?.why });
    if (b.tier === "일반") mainOf.set(b.company, hex);
  }
  /* 하이엔드는 회사의 일반 브랜드 색을 물려받는다(오너 지시).
   * 이렇게 하면 결과적으로 **회사마다 색이 하나**가 되어 지도 점과 카드가 저절로 맞는다. */
  if (ov.highEndInheritsMain) {
    for (const [name, b] of byName) {
      if (b.tier !== "하이엔드" || b.overridden) continue;
      const m = mainOf.get(b.company);
      if (m) byName.set(name, { ...b, hex: m, inherited: true });
    }
  }

  const companyColor = Object.fromEntries(mainOf);
  return { byName, companyColor, brands: ex.brands, extracted: ex };
}
