/**
 * 1,000세대 이상 **명부 조회판** — 「이 거래가 명부 단지의 것인가」를 묻는 한 곳.
 *
 * 판단 규칙 자체는 `parse/singo.ts` 의 **`pickUniverse` 하나가 정본**이다(이름·지번이
 * 서로를 검사한다). 여기서는 그 규칙에 넘길 **재료를 모으는 일**만 한다 —
 * 같은 판단을 두 곳에 두면 갈라진다는 것을 이 공장은 세 번 배웠다
 * (08-13 상록마을 · 08-26 신동아 · 09-02 하계 청구).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pickUniverse } from "./parse/singo.js";
import { jibunFromAddr, normJibun } from "./parse/aptInfo.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export interface UniverseItem {
  lawdCd: string; gu: string; umd: string;
  kaptCode: string; kaptName: string; norm: string; hhld: number;
}

/**
 * 조회판을 만든다. 명부나 대장이 없으면 `null` 을 돌려준다 —
 * **없는 것을 「명부에 없다」로 읽지 않기 위해서다.** 그 둘은 다른 뜻이다.
 */
export function buildUniverseLookup():
  | ((lawdCd: string, umdNm: string, aptNm: string, jibun?: string | null) => UniverseItem | null)
  | null {
  const uniPath = join(ROOT, "data/datasets/apt-universe.json");
  if (!existsSync(uniPath)) return null;
  let items: UniverseItem[];
  try {
    items = JSON.parse(readFileSync(uniPath, "utf8")).items ?? [];
  } catch {
    return null;
  }
  if (!items.length) return null;

  const byGu = new Map<string, UniverseItem[]>();
  for (const it of items) {
    if (!byGu.has(it.lawdCd)) byGu.set(it.lawdCd, []);
    byGu.get(it.lawdCd)!.push(it);
  }

  /* 지번 조회판 — 대장 주소에서 뽑는다(명부에는 주소가 없다).
     ⚠️ 한 지번에 명부 단지가 둘이면 **버린다**(null). 어느 쪽인지 모르는 채로 붙이지 않는다. */
  const byJibun = new Map<string, UniverseItem | null>();
  const hhPath = join(ROOT, "data/datasets/apt-hhld.json");
  if (existsSync(hhPath)) {
    try {
      const byKapt = JSON.parse(readFileSync(hhPath, "utf8")).byKapt ?? {};
      for (const it of items) {
        const j = jibunFromAddr(byKapt[it.kaptCode]?.addr ?? "");
        if (!j) continue;
        const k = `${it.lawdCd}|${it.umd}|${j}`;
        byJibun.set(k, byJibun.has(k) ? null : it);
      }
    } catch { /* 대장이 없으면 이름만으로 간다 */ }
  }

  return (lawdCd, umdNm, aptNm, jibun) => {
    const list = byGu.get(lawdCd);
    if (!list) return null;
    const sameUmd = list.filter((a) => a.umd === umdNm);
    const j = normJibun(jibun ?? "");
    const byJ = j ? byJibun.get(`${lawdCd}|${umdNm}|${j}`) : null;
    return pickUniverse(aptNm, sameUmd, byJ);
  };
}
