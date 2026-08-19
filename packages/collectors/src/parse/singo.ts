/**
 * 신고가(역대 최고가 경신) 판별 — 공통 규칙.
 *
 * ── 무엇을 재나 (2026-08-12 오너 결정, 같은 날 한 번 좁혔다)
 * 처음엔 평형대(20·30·40평대)로 묶었는데, 오너가 레퍼런스 카드(theflow.daily「잠실 리센츠 33평
 * 36.95억」)를 보여주며 **"평형대 말고 평형. 전용 59·84 두 타입만"** 으로 좁혔다.
 * 그래서 판정 단위는 **단지 + 전용 59타입 / 전용 84타입** 둘뿐이다.
 *
 * ── 왜 이 둘인가
 * 이 둘이 아파트 시장의 표준 단위다. 같은 단지·같은 타입끼리 비교해야 "얼마나 올랐나"가
 * 뜻을 갖고, 다른 단지와도 견줄 수 있다. 나머지 평형은 단지마다 구성이 제각각이라
 * 매일 나가는 알림의 기준으로 삼기 어렵다.
 *
 * ── 단지 키에 지번을 안 넣는 이유
 * 큰 단지는 동에 따라 지번이 갈려 신고된다. 지번까지 키에 넣으면 한 단지가 둘로 쪼개져
 * **가짜 신고가**가 난다(작은 쪽 지번의 최고가만 넘어도 신고가가 되어버린다).
 * 구 + 법정동 + 단지명으로 묶으면 쪼개지지 않는다. 같은 동에 같은 이름의 다른 단지가 있으면
 * 둘이 합쳐지는데, 그건 문턱이 높아지는 방향(=보수적)이라 오보를 만들지 않는다.
 */

/** 인덱스 스키마 판번호. 판정 단위가 바뀌면 올린다 — 옛 인덱스는 자동으로 다시 채워진다. */
export const PEAK_SCHEMA = 2;

/**
 * 기준선 시작월 (2026-08-12 오너: **"모든 신고가는 2020년 1월 이후로만 보자"**).
 *
 * ── 왜 2006 이 아닌가
 * 실거래 공개 시작인 2006-01 부터 채우면 61곳 × 247개월 = 15,067회 호출이라 며칠~몇 주가 걸린다.
 * 2020-01 부터면 **79개월 × 61곳 = 4,819회** — 하루면 찬다. 2021년 고점이 안에 들어와 있어
 * 실질적으로 지금 시장의 최고가를 거의 다 담는다.
 *
 * ── ⚠️ 그래서 "역대"라고 부르지 않는다
 * 2006~2008 고점이 아직 안 깨진 단지가 남아 있을 수 있다. 그 단지에서 이 기준으로 잡힌 것을
 * "역대 최고가"라 부르면 그게 오보다. 알림·데이터의 문구는 아래 `baselineLabel()` 이
 * **이 값에서 자동으로 만든다** — 사람이 문구를 따로 적으면 기간을 바꾼 날 조용히 어긋난다.
 * 나중에 과거를 더 채우면 이 값만 내리면 되고, 문구는 저절로 따라온다.
 */
export const BASELINE_FROM = "202001";

/** 기준선 시작월 → 알림·문서에 쓰는 말. "2020년 이후" */
export function baselineLabel(from: string = BASELINE_FROM): string {
  const y = from.slice(0, 4);
  const m = Number(from.slice(4, 6));
  return m === 1 ? `${y}년 이후` : `${y}년 ${m}월 이후`;
}

/**
 * 전용면적(㎡) → 타입. 우리가 보는 건 59타입·84타입 둘뿐이고, 나머지는 null(판정 대상 아님).
 *
 * 폭을 둔 이유: 같은 "84타입"이라도 신고 값이 84.97·84.99·83.53 처럼 흔들린다(A/B/C 타입).
 * 한 단지 안에서 이들은 같은 평형으로 거래·호가되므로 한 칸으로 묶는다.
 * 묶으면 문턱이 올라가는 쪽(=보수적)이라 오보를 만들지 않는다.
 *
 * ── ⚠️ 이 폭 때문에 다른 서비스와 답이 갈린다 (2026-08-19 오너 재확인 · **묶기 유지**)
 * 오너가 실까(silgga.com)의 카드를 들고 물었다 —
 * *"래미안안양메가트리아 10억 500만이 신고가라는데, 왜 우리 알림엔 없나?"*
 *
 * 배관이 맞았다. 메가트리아 59타입의 최고가는 이미 **10억 1,800만**(59.75㎡·2026-07-21)이라
 * 8/14 의 10억 500만은 **1,300만원 모자랐다.** 실까는 **전용 59.65㎡ 하나만** 놓고 재서
 * 직전 최고를 9.5억으로 봤고(+5,500만), 우리는 59.65·59.75·59.94 를 **한 칸으로 묶는다.**
 *
 * 오너는 **묶는 쪽을 유지**하기로 했다. 가르면 소재는 눈에 띄게 늘지만,
 *   · 같은 단지가 같은 달에 서브면적 수만큼 뜬다 → "신고가"라는 말의 무게가 가벼워진다
 *   · 59.65 는 신고가인데 59.75 는 아닌 상태가 흔해져 **카드가 반드시 단서를 달아야 한다**
 *     ("59.65㎡ 기준") — 단서가 붙는 순간 한 장으로 읽히는 소식이 아니게 된다
 *   · 무엇보다 묶기는 **문턱이 높아지는 쪽**이라 틀려도 '못 잡는' 쪽으로 틀린다.
 *     놓친 소재는 손실이지만 **잘못 나간 신고가는 사고**다.
 *
 * ⚠️ 그러니 **다른 서비스에 뜬 신고가가 우리에 없는 것은 정상일 수 있다.** 되묻기 전에
 *    `node scripts/singo-why.mjs <단지명> --type 59 --price <만원>` 을 돌린다 —
 *    명부·문턱·서브면적별 최고가·알림 이력을 그 자리에서 보여 준다. 파일을 손으로 뒤지지 않는다.
 */
export function areaType(area: number): "59" | "84" | null {
  if (!Number.isFinite(area) || area <= 0) return null;
  if (area >= 56 && area <= 62) return "59";
  if (area >= 82 && area <= 85.5) return "84";
  return null;
}

/**
 * 타입 → **분류 라벨**. 알림·리포트에서 "어느 평형대인가"를 한 눈에 보이려는 용도다.
 *
 * ⛔ **이것은 카드에 찍는 평이 아니다** (2026-08-16d 오너 지시로 갈라졌다)
 *
 * 오너: *"전용 59, 84로만 단지서칭은 하되, 카드를 만들때에는 실제 공급평수를 적어줘야지."*
 * 카드의 평은 **건축물대장에서 실측**한다 — `sources/supplyArea.ts` 가 정본이고,
 * `공급면적 = 전유 + 「주건축물」 공용` 을 3.305785 로 나눠 반올림한다.
 * 실제로 이 표는 틀렸다: 늘푸른벽산·래미안크리시엘·광명한진은 34평이 아니라 **33평**,
 * 화서역푸르지오는 25평이 아니라 **26평**이었다(네이버부동산 표기와 대조 확인).
 *
 * 그런데 왜 이 표가 남아 있나 — **알림과 판정은 전용면적으로 돈다.** 아침 알림이 뜨는
 * 시점에는 아직 그 단지의 공급면적을 안 받았을 수 있고(대기열·API 문 닫힘), 알림은
 * "84타입 급이 신고가"만 말하면 된다. 실측을 기다리느라 알림이 안 뜨는 쪽이 더 나쁘다.
 *
 * ⚠️ 그러니 **알림의 34평과 카드의 33평이 다를 수 있다.** 그건 어긋난 게 아니라
 *    서로 다른 것을 말하는 것이다 — 알림은 평형대 분류, 카드는 그 단지의 실제 공급평수.
 *    카드를 이 표로 되돌리지 않는다. 되돌리면 오보 0 규칙이 깨진다.
 */
export const PYEONG_LABEL: Record<"59" | "84", string> = {
  "59": "25평",
  "84": "34평",
};

/** 전용면적 → "25평"/"34평". 대상 타입이 아니면 "" */
export function pyeongLabel(area: number): string {
  const t = areaType(area);
  return t ? PYEONG_LABEL[t] : "";
}

/**
 * 단지명 정규화 — 같은 단지가 신고 표기에 따라 갈라지지 않게 한다.
 * 공백·괄호주석·구분기호 흔들림을 흡수하되, **이름 자체는 지우지 않는다**(다른 단지가 합쳐지면 안 된다).
 */
export function normAptName(raw: string): string {
  return String(raw ?? "")
    .replace(/\([^)]*\)/g, "") // "(101동)" 같은 동 표기 제거 — 같은 단지가 동별로 갈리는 것을 막는다
    .replace(/[\s·.\-_]/g, "")
    .trim();
}

/**
 * 괄호 **안까지 살린** 이름 — 형제 단지를 가르는 데 쓴다.
 *
 * ⚠️ `normAptName` 은 괄호를 통째로 지운다. "(101동)" 같은 동 표기를 흡수하려는 설계인데,
 * 분당 정자동처럼 **괄호가 단지를 가르는 곳**에서는 그게 곧 사고다 —
 * `상록마을(라이프2차)` · `상록마을(임광)` 이 전부 `상록마을` 한 칸으로 합쳐진다.
 * (2026-08-13 실제로 확인: 명부 매칭이 `상록마을(라이프2차)` 를 남의 단지
 *  `정자상록마을우성 1,762세대` 에 붙였고, 세대수가 그대로 알림에 실렸다.)
 * 그래서 **판정 키는 normAptName 을 그대로 두되**(인덱스를 통째로 다시 받아야 하므로),
 * "같은 단지가 맞나"를 되묻는 자리에는 이 함수를 쓴다.
 */
export function fullAptName(raw: string): string {
  return String(raw ?? "")
    .replace(/[()[\]]/g, "") // 괄호 기호만 벗기고 **안의 글자는 남긴다**
    .replace(/[\s·.\-_,]/g, "")
    .trim();
}

/**
 * 두 이름이 **같은 단지를 가리키나**.
 *
 * 실거래 표기(`가락쌍용(2차)`)와 관리대장 표기(`가락쌍용1차`)는 서로 다른 방식으로 적힌다.
 * 한쪽이 다른 쪽을 온전히 품을 때만 같은 단지로 본다 — 명부는 앞에 동 이름을 붙이는
 * 버릇이 있어서(`개봉한마을` ⊃ `한마을`) 포함관계는 필요하다.
 * 다만 **차수·단지번호가 서로 어긋나면 무조건 거절**한다. `가락쌍용2차` 와 `가락쌍용1차` 는
 * 포함관계가 없어 이미 걸리지만, `주공10` 과 `주공10단지` 처럼 붙는 경우를 위해 숫자를 따로 본다.
 */
export function sameApt(a: string, b: string): boolean {
  const x = fullAptName(a);
  const y = fullAptName(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (!(x.includes(y) || y.includes(x))) return false;
  // 숫자(차수·단지번호)가 양쪽에 다 있는데 다르면 다른 단지다.
  const nums = (s: string) => (s.match(/\d+/g) ?? []).join(",");
  const nx = nums(x);
  const ny = nums(y);
  if (nx && ny && nx !== ny) return false;
  return true;
}

/** 단지 키 — 구 + 법정동 + 정규화 단지명. */
export function aptKey(sggCd: string, umdNm: string, aptNm: string): string {
  return `${sggCd}|${String(umdNm ?? "").trim()}|${normAptName(aptNm)}`;
}

/** 최고가 인덱스의 칸 키 — 단지 키 + 타입(59/84). 대상 타입이 아니면 null. */
export function peakKey(sggCd: string, umdNm: string, aptNm: string, area: number): string | null {
  const t = areaType(area);
  return t ? `${aptKey(sggCd, umdNm, aptNm)}|${t}` : null;
}

export interface PeakEntry {
  aptNm: string;
  umdNm: string;
  type: "59" | "84";
  priceManwon: number;
  area: number;
  floor: number;
  date: string; // YYYY-MM-DD
}

export interface PeakIndex {
  meta: {
    lawdCd: string;
    gu: string;
    schemaVersion: number;
    doneMonths: string[];
    updatedAt: string;
    source: string;
  };
  peaks: Record<string, PeakEntry>;
}

export interface TradeLike {
  aptNm: string;
  umdNm: string;
  priceManwon: number;
  area: number;
  floor: number;
  date: string;
  sggCd?: string;
}

/**
 * 거래 목록을 최고가 인덱스에 접어 넣는다(파괴적 갱신).
 * 같은 금액이면 **먼저 있던 기록을 유지**한다 — "최초로 그 값에 닿은 거래"가 기록이기 때문이다.
 * 그래서 같은 값의 재거래는 신고가로 잡히지 않는다.
 */
export function foldPeaks(peaks: Record<string, PeakEntry>, lawdCd: string, trades: TradeLike[]): number {
  let updated = 0;
  for (const t of trades) {
    const type = areaType(t.area);
    if (!type) continue;
    const k = `${aptKey(lawdCd, t.umdNm, t.aptNm)}|${type}`;
    const cur = peaks[k];
    if (!cur || t.priceManwon > cur.priceManwon) {
      peaks[k] = {
        aptNm: t.aptNm,
        umdNm: t.umdNm,
        type,
        priceManwon: t.priceManwon,
        area: t.area,
        floor: t.floor,
        date: t.date,
      };
      updated++;
    }
  }
  return updated;
}

/**
 * **10억 단위 돌파** — 직전 최고가가 못 넘던 10억 선을 이번 거래가 넘었나 (2026-08-12 오너).
 * 넘었으면 그 선(억 단위, 예: 30), 아니면 null.
 *
 * 왜 따로 재나: "신고가"는 1만원만 높아도 신고가다. 그런데 **"처음으로 30억을 넘었다"**는
 * 사람이 기억하는 사건이다. 같은 신고가라도 소식의 크기가 다르다.
 * 실측(2026-07): 신고가 1,098건 중 돌파는 58건 — 20분의 1로 걸러진다.
 * 1000세대 이상 명부까지 걸면 8건(전부 10억선)이었다.
 *
 * ⚠️ 선을 [10, 20, 30 …] 목록으로 두지 않는다. **몫으로 재면** 100억이든 그 위든 저절로
 * 잡히고, 목록은 언젠가 빠뜨린다(오너: "10억, 20억… 100억까지를 말한 거야").
 */
export function milestoneCrossed(prevManwon: number, nowManwon: number): number | null {
  const line = (m: number) => Math.floor(m / 100_000); // 10억 = 100,000만원
  return line(nowManwon) > line(prevManwon) ? line(nowManwon) * 10 : null;
}

export interface SingoHit extends TradeLike {
  type: "59" | "84";
  pyeong: string; // "25평" · "34평"
  lawdCd: string;
  gu: string;
  prevPeakManwon: number;
  prevPeakDate: string;
  gainPct: number | null; // 직전 최고가 대비 상승률(%)
  milestone: number | null; // 넘어선 10억 선(억). 안 넘었으면 null
}

/**
 * 거래 목록 중 **직전까지의 최고가를 넘어선 것**만 고른다.
 *
 * ⚠️ 인덱스를 훑는 동안 함께 갱신한다. 같은 칸에서 두 건이 연달아 신고가면 더 높은 쪽만
 * 남기기 위해서다(둘 다 알리면 "신고가 두 번"이 되어 사실과 어긋난다).
 * 그래서 **거래를 시간·금액 순으로 정렬해 넣어야** 한다.
 *
 * `peaks` 에 아예 기록이 없는 칸은 신고가로 치지 않는다 — 역대 자료가 안 채워진 구간일 수
 * 있고, 그때 "첫 거래 = 신고가"라고 부르면 그게 곧 오보다.
 */
export function findSingo(
  peaks: Record<string, PeakEntry>,
  lawdCd: string,
  gu: string,
  trades: TradeLike[],
): SingoHit[] {
  const sorted = [...trades].sort((a, b) =>
    a.date === b.date ? a.priceManwon - b.priceManwon : a.date < b.date ? -1 : 1,
  );

  // 같은 칸에서 여러 건이 연달아 경신될 수 있다. 그때 **직전 최고가는 이번 묶음이 들어오기 전의
  // 기록**이어야 한다 — 중간값을 기준으로 잡으면 사실과 다른 상승률이 나온다.
  const before = new Map<string, PeakEntry>();
  const best = new Map<string, { t: TradeLike; type: "59" | "84" }>();

  for (const t of sorted) {
    const type = areaType(t.area);
    if (!type) continue;
    const k = `${aptKey(lawdCd, t.umdNm, t.aptNm)}|${type}`;
    const cur = peaks[k];
    if (!cur) continue; // 역대 기록이 없는 칸 — 판정하지 않는다
    // ⚠️ 칸 키는 괄호를 지운 이름이라 **형제 단지가 한 칸에 합쳐질 수 있다**
    //    (`상록마을(라이프2차)` 와 `상록마을(임광)` → 둘 다 `상록마을`).
    //    그 상태로 비교하면 남의 단지 기록을 넘은 것을 "신고가"라 부르게 된다.
    //    이름이 다르면 **그 칸은 기록이 없는 것으로 친다** — 놓치는 편이 지어내는 편보다 낫다.
    if (!sameApt(cur.aptNm, t.aptNm)) continue;
    if (!before.has(k)) before.set(k, cur);
    if (t.priceManwon <= cur.priceManwon) continue;
    peaks[k] = { aptNm: t.aptNm, umdNm: t.umdNm, type, priceManwon: t.priceManwon, area: t.area, floor: t.floor, date: t.date };
    const prev = best.get(k);
    if (!prev || t.priceManwon > prev.t.priceManwon) best.set(k, { t, type });
  }

  const hits: SingoHit[] = [];
  for (const [k, { t, type }] of best) {
    const base = before.get(k)!;
    hits.push({
      ...t,
      type,
      pyeong: PYEONG_LABEL[type],
      lawdCd,
      gu,
      prevPeakManwon: base.priceManwon,
      prevPeakDate: base.date,
      gainPct: base.priceManwon > 0 ? ((t.priceManwon - base.priceManwon) / base.priceManwon) * 100 : null,
      milestone: milestoneCrossed(base.priceManwon, t.priceManwon),
    });
  }
  return hits;
}

/**
 * 만원 → 알림 표기. 레퍼런스 카드가 "36.95억" 꼴이라 **억 소수 둘째 자리**로 맞춘다.
 * (369,500만원 → "36.95억", 300,000만원 → "30억")
 */
export function manwonToEok(manwon: number): string {
  const eok = manwon / 10000;
  const s = eok.toFixed(2).replace(/\.?0+$/, "");
  return `${s}억`;
}

/**
 * 텔레그램 본문 만들기 — **돌파 먼저, 신고가 전체는 뒤에** (2026-08-13 오너 지정).
 *
 * ⚠️ 여기서 **돌파는 "이번에 그 선을 처음 넘었다"**는 뜻이다.
 *    직전 9.8억 → 이번 10.3억 = 10억 돌파. **14억 거래는 이미 예전에 10억을 넘긴 단지라
 *    돌파 블록에 오면 안 된다.**
 *    금액대(그 거래가 속한 구간)로 묶어 내보냈다가 오너가 바로 잡아냈다 —
 *    "왜 14억 11억 이런게 왜나오냐고". 금액대와 돌파는 다른 말이고, 섞으면 그게 곧 오보다.
 *    그래서 돌파 판정은 오직 `h.milestone`(= milestoneCrossed) 만 쓰고,
 *    전체 목록에는 **금액대 제목을 붙이지 않는다.**
 *
 * 돌파 줄에 직전 최고가를 함께 적는다 — 톡 안에서 "왜 돌파인지"가 스스로 증명돼야 한다.
 *
 * `today` 를 주면 거래일을 **같은 해면 `07.24`, 해가 다르면 `25.12.30`** 으로 줄여 적는다.
 * (2026-08-13 오너 "톡에 거래일도 포함해줘")
 */
export function alertBody(hits: SingoHit[], topN = 0, today?: string): string[] {
  const lines: string[] = [];
  const milestones = hits.filter((h) => h.milestone);
  // ⚠️ 거래일은 **계약일**이다(신고일이 아니다). 그래서 오늘 알림에 7월 날짜가 섞여 있는 게 정상이다.
  //    해가 넘어간 거래를 "07.24"로만 적으면 올해 일인 줄 읽힌다 — 그때는 연도를 붙인다.
  const dateLabel = (d: string) => {
    const [y, m, dd] = d.split("-");
    if (today && y === today.slice(0, 4)) return `${m}.${dd}`;
    return `${y.slice(2)}.${m}.${dd}`;
  };

  if (milestones.length) {
    lines.push(`🎉 오늘의 돌파 ${milestones.length}건`);
    const byLine = new Map<number, SingoHit[]>();
    for (const h of milestones) {
      const m = h.milestone as number;
      if (!byLine.has(m)) byLine.set(m, []);
      byLine.get(m)!.push(h);
    }
    for (const m of [...byLine.keys()].sort((a, c) => c - a)) {
      const list = byLine.get(m)!.slice().sort((a, c) => c.priceManwon - a.priceManwon);
      lines.push("");
      lines.push(`${m}억 돌파`);
      for (const h of list) {
        lines.push(
          `${h.gu} / ${h.aptNm} / ${h.pyeong} / ${manwonToEok(h.priceManwon)} / ${dateLabel(h.date)} (직전 ${manwonToEok(h.prevPeakManwon)})`,
        );
      }
    }
    lines.push("");
    lines.push("─────────────────");
    lines.push("");
  }

  const n = topN > 0 ? topN : hits.length;
  lines.push(`📋 신고가 전체 ${hits.length}건 (거래가 큰 순 · 날짜는 계약일)`);
  for (const h of hits.slice(0, n)) {
    lines.push(
      `${h.gu} / ${h.aptNm} / ${h.pyeong} / ${manwonToEok(h.priceManwon)} / ${dateLabel(h.date)}` +
        (h.milestone ? ` 🎉 ${h.milestone}억 돌파` : ""),
    );
  }
  if (hits.length > n) lines.push(`… 외 ${hits.length - n}건`);
  return lines;
}
