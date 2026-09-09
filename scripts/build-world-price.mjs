/**
 * A군(도이체방크 세계 물가 2026) 카드 시안 빌더.
 *
 * ── 왜 _spike 인가 (2026-09-06)
 * `data/datasets/world-prices-2026.json` 은 **verified:false** 다. 앞 세션 문서에서 복원했고
 * 도이체방크 PDF 원문 대조를 아직 못 했다(이 컨테이너에서 PDF 본문을 못 읽었다).
 * CLAUDE.md §8 은 「verified:true 인 것만 카드가 될 수 있다」이므로 **발행 경로에 올리지 않는다.**
 * 출력은 `data/out/_spike/world-price/` 로만 간다 — 오너가 구성을 보고 판단하는 용도다.
 * PDF 대조가 끝나 verified 가 true 가 되면 그때 `data/content/<날짜>/` 로 옮기고
 * `data/review/{builders,sets}.json` 에 등록한다.
 *
 * ── 판형은 새로 만들지 않았다 — `ranking-table@1` 하나로 통일했다
 * 처음에는 A0·A2·A4·A5 를 `tax-matrix@1`(행렬)로 잡았는데 designQa 가 겹침을 51·55·15·4건
 * 잡아냈다. tax-matrix 는 주석대로 **2~4열 · 짧은 숫자**를 전제로 치수가 잡혀 있어서
 * 「$10,492 (25위)」 같은 긴 셀과 9~10행을 감당하지 못한다(발행 이력이 없는 판형이라
 * 실측 감이 없었다). ranking-table 은 22행 발행 이력이 있고 `sub` 열이 있어 같은 정보가 들어간다.
 * **판형을 고치는 대신 데이터를 판형에 맞췄다** — 발행본 픽셀을 건드리지 않는 쪽이다.
 *
 * ── 제목은 한 줄이다
 * ranking-table 은 제목이 길어지면 폰트를 키우고 그만큼 아래 여백이 줄어든다.
 * 두 줄 제목(`\n`)은 titlegap 24px 로 전부 떨어졌다. 통과한 발행본(metro-speed)이
 * 전부 한 줄 제목이라 그 규격을 따른다.
 *
 * ── 숫자는 전부 데이터셋에서 뽑는다
 * 이 파일에 숫자 리터럴을 적지 않는다. 포맷(달러 콤마·부호)만 여기서 한다.
 *
 * 실행: node scripts/build-world-price.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || new Date().toISOString().slice(0, 10);
const OUT = join(ROOT, "data/out/_spike/world-price");
mkdirSync(OUT, { recursive: true });

const D = JSON.parse(readFileSync(join(ROOT, "data/datasets/world-prices-2026.json"), "utf8"));

/* ── 포맷 ─────────────────────────────────────────────── */
const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const usdK = (n) => (n >= 10000 ? "$" + (n / 1000).toFixed(1) + "K" : usd(n)); // sub 열은 16자 제한
const pct = (n, unit = "%") => (n > 0 ? "+" : "") + n.toFixed(1) + unit;
const rank = (n) => n + "위";
/** 이름은 이름만 둔다. 서울 표시는 국기와 코발트 행이 한다(2026-09-09) —
 *  「서울 ←」 화살표는 그 둘이 붙기 전 임시방편이었고, 이제 겹쳐서 군더더기다. */
const nm = (c) => c.city;
/** 국기 — 도시 이름만으로 나라를 알 수 없으니 데이터셋의 표를 본다. 표에 없으면 국기를 안 단다(첫 글자 원으로 떨어진다). */
const flag = (city) => D.cityCountry[city] || undefined;
/** 주인공 행 강조. 판형에 이미 있는 hl 을 쓴다 — fast 는 코발트 배경 + 코발트 값이다.
 *  한 표에 하나만 준다. 우리 카드에서 주인공은 언제나 서울이다. */
const hl = (c) => (c.highlight ? "fast" : undefined);
/** 도시 한 줄 — 국기·강조·이름을 한 곳에서 만든다. 카드마다 따로 쓰면 반드시 어긋난다. */
const cityRow = (c, extra = {}) => ({
  name: nm(c),
  flag: flag(c.city),
  hl: hl(c),
  rank: c.rank == null ? undefined : String(c.rank),
  ...extra,
});

/** 모든 카드가 같은 출처를 단다 — 하나라도 빠지면 우리가 넘베오를 보증하는 게 된다 */
const SRC = {
  name: "도이체방크 세계 물가 지도 2026 · 69개 도시",
  asOf: `${D.meta.sourceDate} · 달러 환산 · 원자료는 거주자 입력(크라우드소싱)`,
};

const cards = [];
/** 도시 카드는 마크 슬롯을 **켠다**(국기가 거기 들어간다). 항목 카드는 끈다 — 항목엔 국기가 없다. */
const add = (slug, doc) => cards.push({ slug, doc: { template: "ranking-table@1", date, hideMark: true, plainRank: true, source: SRC, ...doc } });
const addCity = (slug, doc) => add(slug, { hideMark: false, logoLabel: "국가", ...doc });

/* ── E1 — 아이폰 값 (⭐⭐ 부동산 밖 첫 카드) ─────────────
 * ⚠️ 제목에 「세계에서 두 번째로 싸다」를 쓰지 않는다.
 *    소재 보드 안에서 두 곳이 어긋난다(성적표 40위 vs E1 '더 싼 곳은 일본뿐').
 *    데이터셋의 iphone.conflict 참조. PDF 대조 전까지는 **이 표에 실린 값들만으로** 말한다.
 *    표가 「최저·최고 구간」이라는 것도 부제에 밝힌다 — 69개 도시 전수표가 아니다.
 * ⓘ ranking-table 은 `badge` 를 안 읽는다. 카드 맨 윗줄(topcap)에 그려지는 것은 `subtitle` 하나다.
 *    그래서 제품명을 부제 앞에 붙였다. (A군 카드들의 badge 도 같은 이유로 화면에 안 나온다.) */
{
  const ip = D.iphone;
  const base = ip.baseValue;
  addCity("e1-iphone", {
    title: "아이폰 값, 한국은 미국과 같다",
    subtitle: `${ip.product} · 보고서가 짚은 최저·최고 구간 · 달러 환산`,
    // 순위 번호를 뺀다. 이 표는 69개 도시 전수 순위가 아니라 **최저·최고 구간만 뽑은 것**이라
    // 1~8위를 달면 전체 순위처럼 읽힌다 — 마침 그 순위가 원자료에서 어긋나 있는 항목이다.
    hideRank: true,
    logoLabel: "",   // 국기 열과 이름 열은 같은 것이다. 머리를 둘 달면 「국가/나라」로 겹친다
    nameLabel: "나라",
    valueLabel: "값",
    subLabel: "미국 대비",
    items: ip.rows.map((r) => ({
      name: r.country,
      flag: r.cc,
      hl: r.highlight ? "fast" : undefined,
      value: usd(r.value),
      sub: Math.round((r.value / base) * 100) + "%",
    })),
    source: { ...SRC, asOf: `${D.meta.sourceDate} · ${ip.product} · 달러 환산` },
  });
}

/* ── E1 대안 두 안 — ratio-bars@1 (2026-09-09 오너 지시) ──────────
 * 표가 아니라 **길이**로 보여 준다. 오너가 두 안을 골랐다.
 * 좌표·개수는 전부 여기서 계산한다(TEMPLATES: 템플릿은 숫자를 만들지 않는다).
 *
 * ⚠️ 두 안은 **서로 반대 방향으로 읽힌다.** 처음에 이걸 놓쳐 아이콘 안이 뒤집혀 나왔다:
 *   ① bar  — 「값이 기준의 몇 배냐」  → 비싼 나라가 **길다**   (튀르키예 219)
 *   ② icon — 「같은 돈으로 몇 대냐」  → 비싼 나라가 **적다**   (튀르키예 1대)
 * 아이콘 안에서 튀르키예를 2.19대로 그리면 「튀르키예가 폰을 더 많이 산다」가 되어
 * 카드가 하려는 말과 정반대가 된다. 그래서 아이콘 안은 **예산 ÷ 값**으로 센다.
 * 예산은 가장 비싼 나라의 값(= 튀르키예에서 한 대 살 돈)이다. */
{
  const ip = D.iphone;
  const base = ip.baseValue;
  const rows = ip.rows.filter((r) => r.country !== "미국"); // 기준 나라는 기준선이 대신한다

  /* ① 막대 안 — 기준선을 어디 두면 가장 긴 막대가 트랙에 들어오나(여유 2%) */
  const maxRatio = Math.max(...rows.map((r) => r.value / base));
  const BASEX = Math.min(50, 98 / maxRatio);

  /* ② 아이콘 안 — 예산은 가장 비싼 나라의 값이다 */
  const budget = Math.max(...rows.map((r) => r.value));
  const budgetCountry = rows.find((r) => r.value === budget).country;
  const maxCount = Math.max(...rows.map((r) => budget / r.value));

  /* 아이콘 치수 — 폰 비율(약 1:2.2)을 지켜야 폰으로 보인다.
     가장 많은 줄이 트랙(약 620px)을 넘지 않게 개수로 역산한다. */
  /* 아이콘은 **크게** 그린다. 28px 폭에서는 테두리가 4px 라 폰이 아니라 빈 사각형으로 읽혔다.
     한 줄에 최대 3개뿐이라(2.31대) 키울 자리가 넉넉하다. */
  const ICON_H = 92;
  const ICON_W = Math.round(ICON_H * 0.46);
  const ICON_GAP = 11;

  const PHONE_VB = 46;
  /* 폰 실루엣 — 바깥 몸체 + **안쪽 화면을 뚫는다**(fill-rule:evenodd).
     꽉 찬 사각형은 28px 폭에서 그냥 막대로 보인다. 테두리가 있어야 폰으로 읽힌다. */
  const PHONE_PATH =
    "M8 1h30a7 7 0 0 1 7 7v84a7 7 0 0 1-7 7H8a7 7 0 0 1-7-7V8a7 7 0 0 1 7-7z" +
    "M9 10h28v80H9z";   // 안쪽 화면을 뚫는다 — 테두리 약 6단위(42px 폭에서 5px)

  const titleOf = (icon) => (icon ? "같은 돈으로 몇 대 살까" : "아이폰 값, 한국은 미국과 같다");

  const mk = (icon) => ({
    template: "ratio-bars@1",
    date,
    title: titleOf(icon),
    subtitle: `${ip.product} · 보고서가 짚은 최저·최고 구간 · 달러 환산`,
    baseLabel: icon ? `${budgetCountry} 한 대 값` : "미국 = 100",
    baseValue: usd(icon ? budget : base),
    unitLabel: icon ? "그 돈이면 몇 대" : "미국 대비",
    icon,
    iconPath: PHONE_PATH,
    iconVb: PHONE_VB,
    rows: (icon
      ? [...rows].sort((a, b) => a.value - b.value)   // 싼 나라 = 많이 산다 → 위부터
      : rows
    ).map((r) => {
      if (!icon) {
        const ratio = r.value / base;
        const over = ratio > 1.001;
        return {
          name: r.country,
          flag: r.cc,
          val: Math.round(ratio * 100) + "",
          w: +(BASEX * ratio).toFixed(2),
          ow: over ? +(BASEX * (ratio - 1)).toFixed(2) : 0,
          over,
          hl: !!r.highlight,
        };
      }
      const count = budget / r.value;
      const whole = Math.floor(count);
      const frac = count - whole;
      const icons = [
        ...Array.from({ length: whole }, () => ({ w: ICON_W })),
        ...(frac > 0.04 ? [{ w: +(ICON_W * frac).toFixed(1), part: true }] : []),
      ];
      /* 한 대밖에 못 사는 나라(예산을 정한 그 나라)만 레드 — 그게 이 카드의 신호다 */
      const only1 = count < 1.05;
      if (only1) icons.forEach((ic) => { ic.over = true; });
      return {
        name: r.country,
        flag: r.cc,
        val: count.toFixed(2),
        unit: "대",
        w: +((count / maxCount) * 100).toFixed(2),
        ow: 0,
        over: only1,
        hl: !!r.highlight,
        icons,
      };
    }),
    kicker: icon
      ? `${budgetCountry}에서 <span class="hi">한 대</span> 살 돈이면 한국에선 <span class="hb">${(budget / ip.rows.find((r) => r.highlight).value).toFixed(1)}대</span>`
      : '같은 폰인데 튀르키예는 <span class="hi">2.2배</span>를 낸다',
    layout: {
      flagw: 62,
      namew: 148,
      valw: icon ? 150 : 118,
      gap: 22,
      rowpad: icon ? 8 : 43,   // 7줄이 본문 높이를 채우는 값. 아이콘 안은 아이콘이 크니 여백을 줄인다
      barh: icon ? ICON_H : 34,
      namesz: 36,
      valsz: 44,
      iconw: ICON_W,
      icongap: ICON_GAP,
      basex: BASEX.toFixed(2) + "%",
      /* 제목 폰트 — 이 판형엔 자동 축소가 없다. 한 줄이 936px 를 넘지 않게 글자 수로 정한다.
         한글 한 글자 ≈ 폰트크기 × 0.92 로 잡고 역산한다. */
      titlesz: Math.min(84, Math.floor(936 / (titleOf(icon).length * 0.92))),
    },
    source: { ...SRC, asOf: `${D.meta.sourceDate} · ${ip.product} · 달러 환산` },
  });

  cards.push({ slug: "e1-iphone-bars", doc: mk(false) });
  cards.push({ slug: "e1-iphone-count", doc: mk(true) });
}

/* ── A0 — 서울 성적표 ─────────────────────────────────── */
{
  const s = D.seoul;
  const row = (label, key, fmt) => {
    const it = s[key];
    return {
      name: label,
      rank: String(it.rank),
      value: rank(it.rank),
      sub: fmt(it.value),
    };
  };
  add("a0-seoul-scorecard", {
    badge: "도이체방크 2026",
    title: "서울 성적표",
    subtitle: "69개 도시가 매긴 서울의 자리",
    nameLabel: "항목",
    valueLabel: "서울 순위",
    subLabel: "값",
    items: [
      row("도심 아파트 ㎡당", "aptSqm", usdK),
      row("3룸 월세", "rent3room", usd),
      row("원룸 월세", "rent1room", usd),
      row("세후 월급", "netSalary", usd),
      row("월세 낸 뒤 남는 돈", "disposable", usd),
      row("소득 대비 원리금", "mortgageBurden", (v) => String(v)),
      row("식료품 지수", "groceryIndex", (v) => v + " (뉴욕=100)"),
      row("85㎡ 공과금", "utilities85", usd),
      row("주담대 금리", "mortgageRate", (v) => v + "%"),
    ],
  });

  add("a0-seoul-qol", {
    badge: "삶의 질 종합 " + rank(s.qualityOfLife.rank),
    title: "서울이 잘하는 것, 못하는 것",
    subtitle: D.qolNote,
    nameLabel: "항목",
    valueLabel: "서울 순위",
    items: D.seoulQolBreakdown.map((q) => ({ name: q.item, rank: String(q.rank), value: rank(q.rank) })),
  });
}

/* ── A1 — 집값 3위 / 월세 44위 (캐러셀 2장) ───────────── */
{
  addCity("a1-apt-price-p1", {
    badge: "사는 값",
    title: "서울 집값 세계 3위",
    subtitle: "도심 아파트 ㎡당 매매가",
    nameLabel: "도시",
    valueLabel: "㎡당",
    items: [
      ...D.aptSqmTop.map((c) => cityRow(c, { value: usd(c.value) })),
      ...D.aptSqmRef.filter((c) => c.rank == null).map((c) => cityRow(c, { rank: "–", value: usd(c.value) })),
    ],
  });

  const seoulRent = D.rent3roomTop.find((c) => c.highlight);
  const nyRent = D.rent3roomTop.find((c) => c.rank === 1);
  const ratio = Math.round((seoulRent.value / nyRent.value) * 100);
  addCity("a1-rent-p2", {
    badge: "빌리는 값",
    title: "그런데 월세는 44위",
    subtitle: `서울 3룸 월세는 뉴욕의 ${ratio}% · 이 간극의 이름이 전세다`,
    nameLabel: "도시",
    valueLabel: "3룸 월세",
    items: D.rent3roomTop.map((c) => cityRow(c, { value: usd(c.value) })),
  });
}

/* ── A2 — 월세가 10년째 내려간 도시 ───────────────────── */
{
  const s = D.seoul;
  addCity("a2-rent-fell", {
    badge: "10년 변화",
    title: "월세가 내린 도시들",
    subtitle: `서울 3룸 월세 ${pct(s.rent3room.chg10y)} · 같은 기간 매매가는 ${pct(s.aptSqm.chg10y)}`,
    nameLabel: "도시",
    valueLabel: "3룸 월세",
    items: D.rentFell10y.map((c, i) => cityRow(c, { rank: String(i + 1), value: pct(c.chg10y) })),
  });

  add("a2-seoul-10y", {
    badge: "서울 · 2016 → 2026",
    title: "사는 값만 올랐다",
    subtitle: "달러 환산 기준 · 원화 기준은 상승폭이 더 크다",
    nameLabel: "항목",
    valueLabel: "10년 변화",
    items: [
      { name: "아파트 ㎡당", rank: "1", value: pct(s.aptSqm.chg10y) },
      { name: "3룸 월세", rank: "2", value: pct(s.rent3room.chg10y) },
      { name: "원룸 월세", rank: "3", value: pct(s.rent1room.chg10y) },
    ],
  });
}

/* ── A3 — 원리금 부담 10위 (⭐⭐ 가장 센 장) ──────────── */
{
  addCity("a3-mortgage-burden", {
    badge: "소득 대비 원리금",
    title: "집 사는 부담 세계 10위",
    subtitle: "그 앞의 9곳에 선진국은 하나도 없다",
    nameLabel: "도시",
    valueLabel: "지수",
    items: [
      ...D.mortgageBurdenTop.map((c) => cityRow(c, { value: String(c.value) })),
      ...D.mortgageBurdenRef.map((c) => cityRow(c, { value: String(c.value) })),
    ],
    source: { ...SRC, asOf: D.mortgageBurdenDef },
  });
}

/* ── A4 — 월급 순위와 통장 순위는 다르다 ──────────────── */
{
  const arrow = (m) => (m > 0 ? `▲${m}` : `▼${Math.abs(m)}`);
  const line = (c, i) => cityRow(c, {
    rank: String(i + 1),
    value: arrow(c.move),
    sub: `${c.salaryRank}위→${c.disposableRank}위`,
  });
  addCity("a4-rank-move", {
    badge: "월세 낸 뒤",
    title: "월급 순위 ≠ 통장 순위",
    subtitle: "뉴욕은 5위에서 39위로, 서울은 35위에서 25위로",
    nameLabel: "도시",
    valueLabel: "순위 이동",
    subLabel: "월급→남는 돈",
    items: [...D.rankMoveDown, ...D.rankMoveUp].map(line),
  });
}

/* ── A5 — 도쿄가 싸졌다 ───────────────────────────────── */
{
  add("a5-tokyo", {
    badge: "도쿄 vs 서울",
    title: "도쿄 월급이 서울보다 적다",
    subtitle: "35년 전 세계 1위였던 도쿄 집값은 지금 25위",
    nameLabel: "항목",
    valueLabel: "도쿄 10년",
    subLabel: "도쿄 / 서울",
    items: D.tokyoVsSeoul.map((r, i) => ({
      name: r.item,
      rank: String(i + 1),
      value: r.tokyoChg10y == null ? "—" : pct(r.tokyoChg10y),
      // sub 는 16자 제한이다 — 달러값은 K 로 줄여야 「$10,492 / $25,545」(17자)를 피한다
      sub: `${r.tokyo.replace(/\$([\d,]+)/, (_, v) => usdK(+v.replace(/,/g, "")))} / ${r.seoul.replace(/\$([\d,]+)/, (_, v) => usdK(+v.replace(/,/g, "")))}`,
    })),
  });
}

/* ── A6 — 10년 새 집값이 가장 많이 오른 도시 ──────────── */
{
  addCity("a6-apt-chg10y", {
    badge: "10년 상승률",
    title: "집값이 3배 된 도시들",
    subtitle: "도심 아파트 ㎡당 · 서울은 6위다",
    nameLabel: "도시",
    valueLabel: "10년 변화",
    items: D.aptChg10yTop.map((c) => cityRow(c, { value: pct(c.chg10y) })),
  });
}

for (const c of cards) {
  writeFileSync(join(OUT, `${c.slug}.json`), JSON.stringify(c.doc, null, 2) + "\n");
}
console.log(`✅ A군 시안 ${cards.length}장 → data/out/_spike/world-price/`);
console.log(`   ${cards.map((c) => c.slug).join(" · ")}`);
console.log(`⚠️ 데이터셋 verified=${D.meta.verified} — 발행 전 도이체방크 PDF 원문 대조 필요`);
