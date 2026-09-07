/**
 * 수도권 공급대책 진행률 — 총량 진행바 + 연도별 목표 기둥 (`supply-progress@1`).
 *
 * ── 이 카드가 지키는 것
 * ① **수치를 손으로 적지 않는다.** 달성률·남은 물량·막대 높이·눈금 위치가 전부
 *    데이터셋의 호(戶) 단위 원수에서 계산된다. 카드 JSON 에 상수로 박힌 숫자는 없다.
 * ② **두 분모를 갈라 적는다.** 위 진행바는 총목표(9·7 + 8·13 = 146.9만호)가 분모이고
 *    아래 연도 막대의 합은 9·7 대책 배분(134.9만호)뿐이다. 각주가 그 차이를 말하지 않으면
 *    빌더가 던진다 — 없으면 독자가 막대 다섯 개를 더해 147만호로 읽는다.
 * ③ **없는 배분을 만들지 않는다.** 8·13 추가분은 연도별 배분이 발표된 적이 없다.
 *    5년에 균등 배분하면 2026년 목표가 없던 2.4만호만큼 늘어 달성률이 29.0% → 26.6% 로
 *    바뀐다 — 우리가 만든 숫자가 카드의 결론을 바꾸는 것이라 「오보 0」에 걸린다.
 *    그래서 별도 칸('연도 미정')으로 세우고 점선 윤곽으로 실측과 갈라 둔다.
 * ④ **막대 굵기는 칸 폭이 달라도 같다.** 콜아웃이 들어가는 칸만 넓히는데(콜아웃과 막대의
 *    중심선을 자동으로 맞추려고), 그러면 같은 % 폭이 더 굵어진다 → 빌더가 되계산한다.
 * ⑤ **제목 두 줄은 줄마다 폰트를 따로 준다.** 같은 크기로 두면 글자 수 차이만큼
 *    오른쪽 끝이 들쭉날쭉하다(CARD_CHECKLIST §2, 오너 2026-09-07).
 *
 * ⭐ 폰트: 카드 루트에 `font-taebaek-pretendard` (2026-09-07 오너 확정 · BRAND.md §4).
 *
 * 실행:
 *   node scripts/build-supply-progress.mjs [날짜] [--publish]
 *   --publish 없이 돌리면 결과가 data/out/_spike 로 간다(확정은 data/content 를 본다).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 10);
const publish = argv.includes("--publish");

/* ── 자료 ─────────────────────────────────────────────────── */
const DS = join(ROOT, "data/datasets/supply-plan-2026.json");
const doc = JSON.parse(readFileSync(DS, "utf8"));
if (doc.meta?.verified !== true) throw new Error("데이터셋이 verified:true 가 아니다 — 카드로 못 만든다 (CLAUDE.md §8)");
if (doc.meta.unit !== "ho") throw new Error(`단위가 호(ho)가 아니다: ${doc.meta.unit}`);

const BY_YEAR = doc.target.byYear;
const ADD = doc.addendum;
const ACT = doc.actual.ho;

if (!Array.isArray(BY_YEAR) || BY_YEAR.length < 3) throw new Error("연도별 목표가 3개 미만이다");
for (const y of BY_YEAR) if (!(y.ho > 0)) throw new Error(`${y.year} 목표가 0 이하다`);
if (!(ACT > 0)) throw new Error("착공 실적이 0 이하다");
if (ADD.byYear) throw new Error("8·13 추가분에 연도별 배분이 생겼다 — 별도 칸이 아니라 막대에 얹어야 한다. 빌더를 고칠 것");

/* ── 계산 — 여기서 나온 값만 카드에 들어간다 ───────────────── */
const planSum = BY_YEAR.reduce((a, y) => a + y.ho, 0);   // 9·7 연도별 합
const totalGoal = planSum + ADD.ho;                       // 총목표
const remain = totalGoal - ACT;
const rate = (ACT / totalGoal) * 100;                     // 총 달성률
const firstYear = BY_YEAR[0];
const firstRate = (ACT / firstYear.ho) * 100;             // 첫해 목표 대비

if (!(rate > 0 && rate < 100)) throw new Error(`총 달성률이 0~100 밖이다: ${rate}`);
if (!(firstRate > 0 && firstRate <= 100)) throw new Error(`첫해 달성률이 0~100 밖이다: ${firstRate}`);
if (ACT > firstYear.ho) throw new Error("실적이 첫해 목표를 넘었다 — 이 판형의 전제(첫 칸에 실적을 채운다)가 깨진다");

const man = (ho) => ho / 10000;                            // 호 → 만호
const f1 = (n) => n.toFixed(1);

/* ── 막대 높이 — 최대 막대를 MAX_H 로 두고 비례 배분.
 *    값 라벨이 막대 위에 서므로 100% 로 두면 라벨이 플롯을 넘는다. */
const MAX_H = 80;
const peak = Math.max(...BY_YEAR.map((y) => y.ho), ADD.ho);
const hOf = (ho) => Math.round((ho / peak) * MAX_H * 10) / 10;

/* ── 가로 눈금 — 10만호 간격. 최대 막대 아래까지만 긋는다. */
const STEP = 100000;
const grid = [];
for (let v = STEP; v < peak; v += STEP) grid.push({ label: String(man(v)), bottom: hOf(v) });
if (!grid.length) throw new Error("눈금이 하나도 안 생겼다 — 간격이 최대값보다 크다");

/* ── 칸 폭 — 콜아웃이 들어가는 칸만 넓히고, 막대 굵기는 되계산해 같게 맞춘다 ── */
const HERO_FLEX = 1.42;   // 콜아웃 폭 = 이 칸의 폭. 좌표를 박지 않으려고 칸 자체를 넓힌다
const BAR_PCT = 44;       // 보통 칸의 막대 폭(칸 대비 %)
const heroBarPct = Math.round((BAR_PCT / HERO_FLEX) * 10) / 10;

const years = BY_YEAR.map((y, i) => {
  const hero = i === 0;
  const row = {
    key: y.year,
    value: f1(man(y.ho)),
    unit: "만호",
    h: hOf(y.ho),
    barPct: hero ? heroBarPct : BAR_PCT,
  };
  if (hero) {
    row.wide = HERO_FLEX;
    row.fillPct = Math.round(firstRate * 10) / 10;
    /* 콜아웃은 실적 채움의 윗변에 살짝 걸치게 둔다 — 막대를 덮되 데이터를 가리지 않는다 */
    row.callout = { cap: "착공 달성률", value: `${f1(firstRate)}%`, bottom: Math.max(row.fillPct - 8, 4) };
  }
  return row;
});
years.push({
  key: "연도 미정",
  keyNote: `(${ADD.policy.replace("주택공급대책", "대책")})`,
  keyAlt: true,
  value: f1(man(ADD.ho)),
  unit: "만호",
  h: hOf(ADD.ho),
  barPct: BAR_PCT,
  dash: true,
});

/* ── 각주 — 두 분모를 갈라 적는다. 없으면 던진다(위 ②) ── */
const footnote =
  `※ 연도별 목표는 ${doc.target.policy.replace("주택공급 확대방안", "대책")} 배분(합 ${f1(man(planSum))}만호)` +
  ` · ${ADD.policy.replace("주택공급대책", "")} 추가 ${f1(man(ADD.ho))}만호는 연도별 배분 미발표`;
if (!footnote.includes(f1(man(planSum))) || !footnote.includes("미발표")) {
  throw new Error("각주가 두 분모의 차이를 말하지 않는다 — 독자가 막대를 더해 총목표로 읽는다");
}

/* ── 제목 — 두 줄의 좌우를 맞춘 계약값(2026-09-07 실측: 72 / 82px).
 *    템플릿의 __wiritFit 은 넘칠 때만 줄인다(키우지 않는다). */
const card = {
  template: "supply-progress@1",
  date,
  topcap: `수도권 연도별 착공 목표 및 현황 (${date.replace(/-/g, ".")})`,
  title: {
    l1: `李정부 <span class="hi">수도권 공급</span>정책, 1주년`,
    l2: `<span class="hi">2030년</span> ${Math.round(man(totalGoal))}만호 중 <span class="hot">${f1(rate)}%</span>`,
    fs1: 72,
    fs2: 82,
  },
  subtitle: `’25년 9.7대책 ${Math.round(man(planSum))}만호 + ’26년 8.13대책 +${Math.round(man(ADD.ho))}만호`,
  total: {
    label: `총 <b>${Math.round(man(totalGoal))}만호</b> 착공 목표`,
    rateCap: "달성률",
    rate: `${f1(rate)}%`,
    fillPct: Math.round(rate * 10) / 10,
    leftFoot: `착공 <b>${f1(man(ACT))}만호</b>`,
    rightFoot: `남은 물량 <b>${f1(man(remain))}만호</b>`,
  },
  grid,
  years,
  footnote,
  source: { name: doc.meta.source.name, asOf: `’${doc.actual.asOf.slice(2, 4)}.${Number(doc.actual.asOf.slice(5))}` },
  meta: {
    totalGoalHo: totalGoal,
    planSumHo: planSum,
    addendumHo: ADD.ho,
    actualHo: ACT,
    remainHo: remain,
    ratePct: Math.round(rate * 100) / 100,
    firstYearRatePct: Math.round(firstRate * 100) / 100,
    provenanceRole: doc.meta.provenance.map((p) => p.role).join(" · "),
  },
};

const outDir = publish ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike/supply-progress");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "supply-progress.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

/* ── 캡션 — 수치는 전부 위에서 계산한 값이다. 카드를 보고 옮겨 적지 않는다. ── */
const caption = [
  `1년 전 정부가 약속한 ${Math.round(man(totalGoal))}만호, 지금 얼마나 지어졌을까요?`,
  ``,
  `2025년 9월 7일, 정부는 「주택공급 확대방안」을 냈습니다.`,
  `2026년부터 2030년까지 수도권에 ${f1(man(planSum))}만호를 새로 착공하겠다는 계획이었습니다.`,
  `이 대책의 핵심은 물량보다 기준이었습니다 — 관리 잣대를 인허가가 아니라 '착공'으로 바꿨거든요.`,
  `짓겠다고 허가만 내주는 게 아니라 삽을 뜬 것만 세겠다는 뜻입니다.`,
  ``,
  `올해 8월 13일에는 ${f1(man(ADD.ho))}만호가 더 붙어 총 ${Math.round(man(totalGoal))}만호가 됐습니다.`,
  ``,
  `그래서 지금까지 얼마나 지어졌을까요.`,
  ``,
  `국토교통부 주택통계 기준, 올해 1~7월 수도권 착공은 ${f1(man(ACT))}만호입니다.`,
  `총목표 ${Math.round(man(totalGoal))}만호의 ${f1(rate)}%. 남은 물량이 ${f1(man(remain))}만호입니다.`,
  ``,
  `올해 목표만 떼어 봐도 ${f1(man(firstYear.ho))}만호 중 ${f1(firstRate)}%입니다.`,
  `1년의 7개월, 그러니까 시간은 58.3%가 지났는데 실적은 그 절반쯤에 서 있습니다.`,
  ``,
  `연도별 목표는 이렇습니다.`,
  ...BY_YEAR.map((y) => `· ${y.year}년 ${f1(man(y.ho))}만호`),
  `· 8·13 추가분 ${f1(man(ADD.ho))}만호 — 연도별 배분은 아직 발표되지 않았습니다`,
  ``,
  `${BY_YEAR[BY_YEAR.length - 1].year}년에 ${f1(man(BY_YEAR[BY_YEAR.length - 1].ho))}만호가 몰려 있습니다.`,
  `가장 큰 물량이 임기 마지막 해에 잡혀 있다는 뜻입니다.`,
  ``,
  `※ 카드 아래 막대 다섯 개의 합은 ${f1(man(planSum))}만호입니다. 위 진행바의 분모(${Math.round(man(totalGoal))}만호)와 다릅니다 —`,
  `   8·13 대책 ${f1(man(ADD.ho))}만호는 어느 해에 지을지가 아직 정해지지 않아 별도 칸으로 뒀습니다.`,
  `   5년에 고르게 나눠 그리면 올해 목표가 없던 물량만큼 늘어나 달성률이 달라집니다. 그건 정부가 발표한 배분표가 아닙니다.`,
  `※ 9·7 대책은 2025년 9월 발표지만 목표 기간은 2026~2030년입니다. '발표 1주년'과 '계획 1년차'는 다릅니다.`,
  `※ 대책의 착공 목표와 국토부 월간 통계의 착공 실적이 완전히 같은 집계 기준인지는 정부가 공식 확인한 바 없습니다.`,
  `   주요 매체가 쓰는 비교 방식을 따랐고, 카드에 '국토부 주택통계 기준'을 병기했습니다.`,
  `※ 출처: 국토교통부 「’26년 7월 주택통계」 · 9·7 주택공급 확대방안 · 8·13 주택공급대책.`,
  ``,
  `#부동산정책 #주택공급 #수도권 #착공 #위릿`,
].join("\n");
writeCaption("supply-progress", caption); // ⚠️ 서명은 writeCaption 이 붙인다

/* ── 카톡 공유용 — 인스타 캡션과 다른 물건이다(CAPTION.md §9) ──
 * 카톡은 링크 미리보기 없이 글자만으로 눈에 들어와야 하고 이미지가 글 위에 붙는다.
 * 그래서 앞은 숫자로 세우고 뒤는 접는다. 숫자는 전부 위에서 계산한 값이다 —
 * 카드를 보고 옮겨 적지 않는다. 서명은 붙이지 않는다(인스타 캡션 전용).
 * 오너에겐 **채팅 텍스트로** 드리고, 이 파일은 기록용이다. */
const kakao = [
  `🏗 이재명 정부 수도권 공급대책, 1주년 성적표`,
  ``,
  `1️⃣ 총목표 ${Math.round(man(totalGoal))}만호 중 착공 ${f1(man(ACT))}만호`,
  `2️⃣ 달성률 ${f1(rate)}% · 남은 물량 ${f1(man(remain))}만호`,
  `3️⃣ 올해 목표 ${f1(man(firstYear.ho))}만호 대비 ${f1(firstRate)}%`,
  ``,
  `’25년 9.7대책 ${Math.round(man(planSum))}만호`,
  `+ ’26년 8.13대책 ${Math.round(man(ADD.ho))}만호 👆`,
  ``,
  `📊 수도권 신규 착공 기준`,
  `   국토부 ’${doc.actual.asOf.slice(2, 4)}년 ${Number(doc.actual.asOf.slice(5))}월 주택통계 (1~7월 누계)`,
].join("\n");
const kakaoDir = join(ROOT, "data/review/captions/_kakao");
mkdirSync(kakaoDir, { recursive: true });
writeFileSync(join(kakaoDir, "supply-progress.txt"), kakao + "\n", "utf8");

console.log(`🏗  supply-progress — ${publish ? "data/content" : "_spike"}/${date}`);
console.log(`   총목표 ${f1(man(totalGoal))}만호 = 9·7 ${f1(man(planSum))} + 8·13 ${f1(man(ADD.ho))}`);
console.log(`   착공 ${f1(man(ACT))}만호 → 총 달성률 ${f1(rate)}% · 첫해(${firstYear.year}) 대비 ${f1(firstRate)}%`);
console.log(`   막대 ${years.length}칸(최대 ${MAX_H}%) · 눈금 ${grid.length}줄 · 각주 ✅ 두 분모 분리`);
console.log(`   ⚠️ 출처 등급: ${card.meta.provenanceRole}`);
