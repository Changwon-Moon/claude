/**
 * 서울 아파트 주간 매매가격 '연속 상승' — 현재 국면 vs 역대 최장. record-grid@1.
 * 제목: "서울 아파트 77주 연속 상승, 역대 2위"
 *
 * ── 무엇을 말하는 카드인가
 * 현재 상승기는 '주수'로는 역대 2위(77주, 역대 최장 85주 다음)지만,
 * '오름폭'으로는 역대 최장기를 두 배 넘게 앞선다. 두 기록을 한 장부에 나란히 올려
 * "기록까지 8주 남았는데 속도는 이미 두 배"라는 역설을 한 화면에서 보게 한다.
 *
 * ── 수치는 어디서 오나 (오보 0)
 * data/datasets/mae-streak-2026-08.json 하나만 읽는다. **이 스크립트엔 숫자가 하나도 없다.**
 * gap(=85−77) · 오름 속도비 · 순위 · 누적 역전은 모두 아래에서 코드가 계산·검증한다.
 * ⚠️ 데이터셋은 verified=false 다 — 값이 '주간 매매가격지수' 원자료가 아니라 보도 인용이다.
 *    저장소에 R-ONE 주간 매매지수가 수집되면 그 시계열에서 연속 구간을 코드로 재계산해
 *    대조한 뒤 verified 로 승격한다(data/market-queue.txt 로 수집 요청을 걸어 둔다).
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
if (!(cur.weeks < rec.weeks))
  throw new Error(`현재 ${cur.weeks}주가 역대 최장 ${rec.weeks}주보다 짧아야 '역대 2위'가 성립한다`);
if (cur.rankByWeeks !== 2)
  throw new Error(`rankByWeeks 는 2여야 한다 — 지금 ${cur.rankByWeeks}`);
const gap = rec.weeks - cur.weeks;                 // 역대 최장까지 남은 주 (85−77=8)
if (gap <= 0) throw new Error(`gap 이 0 이하다(${gap}) — 이미 최장 기록을 넘었다면 제목을 바꾼다`);
if (!(cur.cumPct > rec.cumPct))
  throw new Error(`현재 누적 ${cur.cumPct}% 가 역대 최장기 누적 ${rec.cumPct}% 보다 커야 '오름폭 역전'이 성립한다`);
const speed = r1(cur.avgWeeklyPct / rec.avgWeeklyPct);   // 오른 속도비 (0.18/0.09=2.0)
if (!(speed >= 1)) throw new Error(`속도비 계산값 ${speed} 가 1 미만이다`);

const pct = (v) => `+${v}%`;

const card = {
  template: "record-grid@1",
  date,
  badge: date.replace(/-/g, ".").slice(2),          // 26.08.01
  /* '역대 2위'를 빨강으로 — 순위(rank)도 데이터에서 온다(손으로 '2위'라 적지 않는다). */
  title: `서울 아파트 ${cur.weeks}주 연속 상승, <span class="hi">역대 ${cur.rankByWeeks}위</span>`,
  /* 한 줄 = 한 기록. claim(주인공) + value(증거) + prev(비교값). */
  cells: [
    { claim: `현재 <em>연속 상승</em>`,        value: `${cur.weeks}주`,   prev: cur.startLabel },
    { claim: `현재 <em>누적 상승률</em>`,      value: pct(cur.cumPct),   prev: `주평균 ${pct(cur.avgWeeklyPct)}` },
    { claim: `${rec.label} 기록`,              value: `${rec.weeks}주`,   prev: rec.periodLabel },
    { claim: `그때 <em>누적 상승률</em>`,      value: pct(rec.cumPct),   prev: `주평균 ${pct(rec.avgWeeklyPct)}` },
    { claim: `역대 최장까지`,                   value: `${gap}주`,         prev: "남았다" },
    { claim: `오른 <em>속도</em>는`,           value: `${speed.toFixed(1)}배`, prev: `${cur.avgWeeklyPct}% vs ${rec.avgWeeklyPct}%` },
  ],
  note: `역대 최장(${rec.weeks}주)까지 ${gap}주 — 그런데 오름폭은 이미 <b>${speed.toFixed(1)}배</b>.`,
  source: { name: d.meta.source, asOf: d.meta.asOf },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "mae-streak.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`mae-streak — 기록 ${card.cells.length}칸`);
console.log(`   현재 ${cur.weeks}주(누적 ${pct(cur.cumPct)}) vs 역대최장 ${rec.weeks}주(누적 ${pct(rec.cumPct)}) — gap ${gap}주 · 속도 ${speed.toFixed(1)}배`);
console.log(`   ⚠ 데이터셋 verified=${d.verified} — R-ONE 주간 매매지수 대조 전 발행 금지`);
console.log(`   → data/content/${date}/mae-streak.json`);
