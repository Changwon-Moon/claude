/**
 * 서울 아파트 주간 매매가격 '연속 상승' — 현재 국면 vs 역대 최장. streak-bars@1 (막대 비교).
 * 제목: "서울 아파트 77주 연속 상승" ('77주 연속 상승'만 레드)
 *
 * ── 무엇을 말하는 카드인가
 * 두 국면을 두 지표 막대로 나란히 둔다.
 *   · 연속 상승 주수: 현재 77주 < 역대 최장 85주  → 주수로는 2위
 *   · 누적 상승률:   현재 +15.55% > 역대 최장 +7.71% → 오름폭은 오히려 1위
 * "짧은데 더 올랐다"를 막대 높이 대비로 한눈에 보여준다.
 *
 * ── 왜 꺾은선이 아니라 막대인가
 * '주간 매매가격지수'의 주별 시계열 원자료가 저장소에 아직 없다. 없는 궤적을 지어내지
 * 않는다(오보 0). 확정된 네 수치만으로 그리는 정직한 비교 그래프가 막대다.
 *
 * ── 수치·좌표는 어디서 오나
 * data/datasets/mae-streak-2026-08.json 하나만 읽는다. **숫자는 데이터셋에만** 있고,
 * 막대 높이·라벨 위치는 아래에서 코드가 계산한다(템플릿은 숫자를 만들지 않는다).
 * ⚠️ 데이터셋 verified=false — R-ONE 주간 매매지수 수집·재계산 대조 전에는 발행하지 않는다.
 *
 * 실행: node scripts/build-mae-streak.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-01";
const d = JSON.parse(readFileSync(join(ROOT, "data/datasets/mae-streak-2026-08.json"), "utf8"));
const cur = d.current, rec = d.record;

const r1 = (v) => Math.round(v * 10) / 10;

/* ── 내부 정합성 검사 (보도에서 옮긴 값은 산수로 건다) ── */
if (!(cur.weeks < rec.weeks)) throw new Error(`현재 ${cur.weeks}주가 역대 최장 ${rec.weeks}주보다 짧아야 '역대 2위'가 성립한다`);
if (cur.rankByWeeks !== 2) throw new Error(`rankByWeeks 는 2여야 한다 — 지금 ${cur.rankByWeeks}`);
const gap = rec.weeks - cur.weeks;
if (gap <= 0) throw new Error(`gap 이 0 이하다(${gap})`);
if (!(cur.cumPct > rec.cumPct)) throw new Error(`현재 누적 ${cur.cumPct}% 가 역대 최장기 ${rec.cumPct}% 보다 커야 '오름폭 역전'이 성립한다`);
const speed = r1(cur.avgWeeklyPct / rec.avgWeeklyPct);

/* ── 막대 좌표 계산 (뷰박스 1000×680, 픽셀=산수라 결정적) ── */
const RED = "#e5484d", SLATE = "#93a0ae", INK = "#141821", GRAY = "#5b6b7f";
const baseY = 560, plotH = 400, barW = 150;
const panels = [
  { x0: 20,  title: "연속 상승 (주)",
    bars: [
      { v: cur.weeks, disp: `${cur.weeks}주`, cur: true,  sub: "2025.2~ 진행 중" },
      { v: rec.weeks, disp: `${rec.weeks}주`, cur: false, sub: "2020.6~22.1" },
    ] },
  { x0: 520, title: "누적 상승률 (%)",
    bars: [
      { v: cur.cumPct, disp: `+${cur.cumPct}%`, cur: true,  sub: `주평균 +${cur.avgWeeklyPct}%` },
      { v: rec.cumPct, disp: `+${rec.cumPct}%`, cur: false, sub: `주평균 +${rec.avgWeeklyPct}%` },
    ] },
];

const bars = [], vlabels = [], xlabels = [], xsubs = [], ptitles = [];
for (const p of panels) {
  const pmax = Math.max(...p.bars.map((b) => b.v));
  ptitles.push({ x: p.x0 + 230, y: 104, text: p.title, fill: GRAY });
  p.bars.forEach((b, i) => {
    const bx = p.x0 + (i === 0 ? 60 : 250);
    const cx = bx + barW / 2;
    const h = Math.round((b.v / pmax) * plotH);
    const y = baseY - h;
    const fill = b.cur ? RED : SLATE;
    bars.push({ x: bx, y, w: barW, h, fill });
    vlabels.push({ x: cx, y: y - 20, text: b.disp, fill });
    xlabels.push({ x: cx, y: 608, text: b.cur ? "현재" : "역대 최장", fill: INK });
    xsubs.push({ x: cx, y: 646, text: b.sub, fill: GRAY });
  });
}

const card = {
  template: "streak-bars@1",
  date,
  badge: date.replace(/-/g, ".").slice(2),   // 26.08.01
  title: `서울 아파트 <span class="hi">${cur.weeks}주 연속 상승</span>`,
  chart: {
    vb: "0 0 1000 680",
    baseline: { y: baseY, x1: 20, x2: 980 },
    bars, ptitles, vlabels, xlabels, xsubs,
  },
  note: `연속 주수는 역대 <b>${cur.rankByWeeks}위</b>지만(최장 ${rec.weeks}주까지 ${gap}주), 오름폭은 이미 <b>${speed.toFixed(1)}배</b>.`,
  source: { name: d.meta.source, asOf: d.meta.asOf },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "mae-streak.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`mae-streak (streak-bars) — 막대 ${bars.length}개`);
console.log(`   연속: 현재 ${cur.weeks}주 vs 역대 ${rec.weeks}주 (gap ${gap}) · 누적: +${cur.cumPct}% vs +${rec.cumPct}% · 속도 ${speed.toFixed(1)}배`);
console.log(`   ⚠ 데이터셋 verified=${d.verified} — R-ONE 주간 매매지수 대조 전 발행 금지`);
console.log(`   → data/content/${date}/mae-streak.json`);
