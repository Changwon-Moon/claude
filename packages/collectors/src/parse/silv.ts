/**
 * 국토부 **아파트 분양권전매 실거래가** 파서 (getRTMSDataSvcSilvTrade) XML → 정규화 거래 배열.
 * 1차 출처(국토교통부). 오보 0: 수치는 여기서 코드가 뽑고 provenance 를 남긴다.
 *
 * 왜 매매 파서(`parse/molit.ts`)를 그대로 못 쓰나 —
 *   ① 이 API 에는 매매에 없는 칸이 하나 있다: **구분(분양권 / 입주권)**.
 *      둘은 다른 물건이다. 분양권은 준공 전 청약 당첨분, 입주권은 재개발·재건축 조합원분이라
 *      **분양가 기준이 아예 다르다.** 섞어서 세면 프리미엄이 통째로 틀어진다.
 *   ② 준공 전 단지라 `건축년도`가 비어 오는 경우가 있다 — 매매 파서는 이걸 전제하지 않는다.
 *
 * ⚠️ **태그 이름을 확정해서 박지 않는다.** 국토부는 같은 서비스라도 판올림마다
 * 한글 태그(`거래금액`)와 영문 태그(`dealAmount`)를 오간다(매매에서 이미 겪었다).
 * 그래서 후보를 나열해 먼저 잡히는 것을 쓰고, **첫 수집 때 원본 item 한 건을 그대로
 * 기록해**(`silvCli` 의 probe) 사람이 눈으로 대조한다. 추측한 것을 조용히 통과시키지 않는다.
 */

/** <tag>값</tag> 중 names 후보의 첫 매치 텍스트(트림). 없으면 "" */
function tag(block: string, ...names: string[]): string {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}>\\s*([\\s\\S]*?)\\s*</${n}>`));
    if (m) return m[1].trim();
  }
  return "";
}

/** 콤마·공백 제거 숫자화 (실패 시 NaN) */
function num(s: unknown): number {
  if (s == null) return NaN;
  const n = Number(String(s).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

/** 분양권과 입주권은 다른 물건이다 — 절대 섞지 않는다. */
export type SilvKind = "분양권" | "입주권" | "미상";

/**
 * 구분 칸의 태그 후보.
 *
 * ⚠️ **2026-08-28 실측으로 한 번 틀렸다.** 매매 API 에서 유추해 `dealTypeNm`·`구분` 을 걸었는데
 * 실제 응답에는 그런 태그가 없었다(평택 171건 전부 '미상'). 실제 항목은 이렇다:
 *
 *   aptNm · buyerGbn · cdealDay · cdealType · dealAmount · dealDay · dealMonth · dealYear ·
 *   dealingGbn · estateAgentSggNm · excluUseAr · floor · jibun · **ownershipGbn** ·
 *   sggCd · sggNm · slerGbn · umdNm
 *
 * 분양권/입주권을 담을 수 있는 칸은 `ownershipGbn` 하나다. 다만 표본에서는 **공백**이었다 —
 * 그래서 이번에는 **원값을 `kindRaw` 에 그대로 남겨** 무엇이 들어오는지 눈으로 본다.
 * 또 유추하지 않는다: 값이 비면 `미상`이고, 미상은 카드에 못 쓴다.
 */
const KIND_TAGS = ["ownershipGbn", "dealTypeNm", "구분", "분양입주권구분", "소유권구분"] as const;

export interface SilvTrade {
  aptNm: string; // 단지명
  umdNm: string; // 법정동
  jibun: string; // 지번
  priceManwon: number; // 거래금액(만원)
  priceWon: number; // 거래금액(원)
  area: number; // 전용면적(㎡)
  floor: number; // 층
  date: string; // YYYY-MM-DD 계약일
  kind: SilvKind; // 분양권 / 입주권
  kindRaw: string; // 구분 칸의 원값(공백이면 ""). 태그를 다시 짚을 때의 증거
  dealingGbn: string; // 거래유형(중개/직거래)
  sellerGbn: string; // 매도자 구분(개인/법인 등)
  buyerGbn: string; // 매수자 구분
  canceled: boolean; // 해제여부(cdealType='O')
  sggCd: string; // 시군구코드
  sggNm: string; // 시군구명
}

/** 구분 칸의 값을 두 갈래로 정규화. 모르는 값은 "미상" — 임의로 분양권에 넣지 않는다. */
export function toKind(raw: string): SilvKind {
  const s = raw.replace(/\s/g, "");
  if (!s) return "미상";
  if (s.includes("입주권")) return "입주권";
  if (s.includes("분양권")) return "분양권";
  return "미상";
}

/** 국토부 분양권전매 실거래 응답 XML → 거래 배열. 해제 거래도 포함(canceled=true) */
export function parseSilvTrades(xml: string): SilvTrade[] {
  const out: SilvTrade[] = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const it of items) {
    const priceManwon = num(tag(it, "dealAmount", "거래금액"));
    const y = tag(it, "dealYear", "년");
    const mo = tag(it, "dealMonth", "월");
    const d = tag(it, "dealDay", "일");
    if (!Number.isFinite(priceManwon) || !y) continue;
    const pad = (s: string) => s.padStart(2, "0");
    const kindRaw = tag(it, ...KIND_TAGS);
    out.push({
      aptNm: tag(it, "aptNm", "단지", "아파트"),
      umdNm: tag(it, "umdNm", "법정동"),
      jibun: tag(it, "jibun", "지번"),
      priceManwon,
      priceWon: priceManwon * 10000,
      area: num(tag(it, "excluUseAr", "전용면적")),
      floor: num(tag(it, "floor", "층")),
      date: `${y}-${pad(mo)}-${pad(d)}`,
      kind: toKind(kindRaw),
      kindRaw,
      dealingGbn: tag(it, "dealingGbn", "거래유형"),
      sellerGbn: tag(it, "slerGbn"),
      buyerGbn: tag(it, "buyerGbn"),
      canceled: tag(it, "cdealType", "해제여부") === "O",
      sggCd: tag(it, "sggCd", "지역코드"),
      sggNm: tag(it, "sggNm"),
    });
  }
  return out;
}

/** 해제·0원·이름없음 제외 */
export function validSilvTrades(txs: SilvTrade[]): SilvTrade[] {
  return txs.filter((t) => !t.canceled && t.priceWon > 0 && t.aptNm);
}

/** 전용면적을 0.1㎡ 단위로 접은 키 — 같은 타입끼리 묶기 위한 것 */
const typeKey = (t: SilvTrade) => `${t.aptNm}|${t.umdNm}|${t.area.toFixed(1)}`;

/**
 * 단지·법정동·전용면적별 **가장 최근 1건**.
 * 프리미엄은 "지금 얼마에 팔리나"라서 최고가가 아니라 **최신 거래**가 기준이다.
 * 같은 날 두 건이면 비싼 쪽을 남긴다(동률을 임의 순서로 두면 결정성이 깨진다).
 */
export function latestPerAptType(txs: SilvTrade[]): SilvTrade[] {
  const best = new Map<string, SilvTrade>();
  for (const t of validSilvTrades(txs)) {
    const k = typeKey(t);
    const cur = best.get(k);
    if (!cur || t.date > cur.date || (t.date === cur.date && t.priceWon > cur.priceWon)) best.set(k, t);
  }
  return [...best.values()].sort((a, b) => b.priceWon - a.priceWon);
}

/** 구분별 건수 — 분양권/입주권/미상이 각각 몇 건인지. '미상'이 많으면 태그를 잘못 짚은 것이다. */
export function countByKind(txs: SilvTrade[]): Record<SilvKind, number> {
  const c: Record<SilvKind, number> = { 분양권: 0, 입주권: 0, 미상: 0 };
  for (const t of validSilvTrades(txs)) c[t.kind]++;
  return c;
}

/**
 * 구분 칸 **원값**의 분포. 공백은 `(빈칸)` 으로 센다.
 * 태그를 다시 짚어야 할 때 "무엇이 들어오는가"에 답하는 유일한 근거다.
 */
export function censusKindRaw(txs: SilvTrade[]): [string, number][] {
  const c = new Map<string, number>();
  for (const t of validSilvTrades(txs)) {
    const k = t.kindRaw.trim() || "(빈칸)";
    c.set(k, (c.get(k) ?? 0) + 1);
  }
  return [...c.entries()].sort((a, b) => b[1] - a[1]);
}

/**
 * 첫 `<item>` 원본 그대로. 태그 이름을 사람이 대조하기 위한 것 —
 * **추측한 파서를 조용히 통과시키지 않으려고** 첫 수집 결과에 이걸 남긴다.
 */
export function firstItemRaw(xml: string): string {
  const m = xml.match(/<item>[\s\S]*?<\/item>/);
  return m ? m[0] : "";
}

/** 응답에 실제로 있던 태그 이름 전부(첫 item 기준). 유추가 틀렸을 때 답을 찾는 자리. */
export function tagNames(xml: string): string[] {
  const item = firstItemRaw(xml);
  const names = [...item.matchAll(/<([A-Za-z가-힣_][^>\s/]*)>/g)].map((m) => m[1]);
  return [...new Set(names)].sort();
}
