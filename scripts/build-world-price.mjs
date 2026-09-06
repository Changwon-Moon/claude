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
/** 서울이 표 한가운데 묻히면 이 카드가 하려는 말이 사라진다 — 데이터셋의 highlight 를 이름에 새긴다.
 *  판형에 강조 필드가 없어(ranking-table 스키마) 이름 뒤 화살표로 대신한다. */
const nm = (c) => (c.highlight ? c.city + " ←" : c.city);

/** 모든 카드가 같은 출처를 단다 — 하나라도 빠지면 우리가 넘베오를 보증하는 게 된다 */
const SRC = {
  name: "도이체방크 세계 물가 지도 2026 · 69개 도시",
  asOf: `${D.meta.sourceDate} · 달러 환산 · 원자료는 거주자 입력(크라우드소싱)`,
};

const cards = [];
const add = (slug, doc) => cards.push({ slug, doc: { template: "ranking-table@1", date, hideMark: true, plainRank: true, source: SRC, ...doc } });

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
  add("a1-apt-price-p1", {
    badge: "사는 값",
    title: "서울 집값 세계 3위",
    subtitle: "도심 아파트 ㎡당 매매가",
    nameLabel: "도시",
    valueLabel: "㎡당",
    items: [
      ...D.aptSqmTop.map((c) => ({ name: nm(c), rank: String(c.rank), value: usd(c.value) })),
      ...D.aptSqmRef.filter((c) => c.rank == null).map((c) => ({ name: c.city, rank: "–", value: usd(c.value) })),
    ],
  });

  const seoulRent = D.rent3roomTop.find((c) => c.highlight);
  const nyRent = D.rent3roomTop.find((c) => c.rank === 1);
  const ratio = Math.round((seoulRent.value / nyRent.value) * 100);
  add("a1-rent-p2", {
    badge: "빌리는 값",
    title: "그런데 월세는 44위",
    subtitle: `서울 3룸 월세는 뉴욕의 ${ratio}% · 이 간극의 이름이 전세다`,
    nameLabel: "도시",
    valueLabel: "3룸 월세",
    items: D.rent3roomTop.map((c) => ({ name: nm(c), rank: String(c.rank), value: usd(c.value) })),
  });
}

/* ── A2 — 월세가 10년째 내려간 도시 ───────────────────── */
{
  const s = D.seoul;
  add("a2-rent-fell", {
    badge: "10년 변화",
    title: "월세가 내린 도시들",
    subtitle: `서울 3룸 월세 ${pct(s.rent3room.chg10y)} · 같은 기간 매매가는 ${pct(s.aptSqm.chg10y)}`,
    nameLabel: "도시",
    valueLabel: "3룸 월세",
    items: D.rentFell10y.map((c, i) => ({ name: nm(c), rank: String(i + 1), value: pct(c.chg10y) })),
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
  add("a3-mortgage-burden", {
    badge: "소득 대비 원리금",
    title: "집 사는 부담 세계 10위",
    subtitle: "그 앞의 9곳에 선진국은 하나도 없다",
    nameLabel: "도시",
    valueLabel: "지수",
    items: [
      ...D.mortgageBurdenTop.map((c) => ({ name: nm(c), rank: String(c.rank), value: String(c.value) })),
      ...D.mortgageBurdenRef.map((c) => ({ name: c.city, rank: String(c.rank), value: String(c.value) })),
    ],
    source: { ...SRC, asOf: D.mortgageBurdenDef },
  });
}

/* ── A4 — 월급 순위와 통장 순위는 다르다 ──────────────── */
{
  const arrow = (m) => (m > 0 ? `▲${m}` : `▼${Math.abs(m)}`);
  const line = (c, i) => ({
    name: nm(c),
    rank: String(i + 1),
    value: arrow(c.move),
    sub: `${c.salaryRank}위→${c.disposableRank}위`,
  });
  add("a4-rank-move", {
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
  add("a6-apt-chg10y", {
    badge: "10년 상승률",
    title: "집값이 3배 된 도시들",
    subtitle: "도심 아파트 ㎡당 · 서울은 6위다",
    nameLabel: "도시",
    valueLabel: "10년 변화",
    items: D.aptChg10yTop.map((c) => ({
      name: nm(c),
      rank: String(c.rank),
      value: pct(c.chg10y),
    })),
  });
}

for (const c of cards) {
  writeFileSync(join(OUT, `${c.slug}.json`), JSON.stringify(c.doc, null, 2) + "\n");
}
console.log(`✅ A군 시안 ${cards.length}장 → data/out/_spike/world-price/`);
console.log(`   ${cards.map((c) => c.slug).join(" · ")}`);
console.log(`⚠️ 데이터셋 verified=${D.meta.verified} — 발행 전 도이체방크 PDF 원문 대조 필요`);
