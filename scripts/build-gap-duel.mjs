#!/usr/bin/env node
/**
 * ⚖️ 「같은 값에서 출발한 단지들」 — 격차 맞대결 카드 (판형 `streak-line@1` 재사용)
 *
 *   node scripts/build-gap-duel.mjs --set gap-ep1 --pick 1 [--label gap-bundang-ansan] [--date YYYY-MM-DD]
 *
 * ── 왜 새 판형을 안 만들었나
 * `streak-line@1` 은 이미 **곡선 여러 개 + 범례 + 끝점 라벨 + 축**을 빌더가 계산해 넘기는
 * 일반 선그래프 판이다. 이 카드가 필요로 하는 것이 정확히 그 계약이다. 새 판형을 세우면
 * `designQa` 의 `LEAF`·`footerGap` 등록, SVG 글자 넘침 책임, 여백 규격을 **처음부터 다시**
 * 지어야 하고(CARD_CHECKLIST §2 「새 판형을 만들 때」), 무엇보다 **네 번째 사본**이 된다
 * (2026-09-02 인수인계 ⑫ — 「이 세트를 만드는 빌더는 무엇인가」의 답은 정본 하나뿐이어야 한다).
 *
 * ── 데이터
 * `data/datasets/gap-ep{n}.json`(묶음 목록)과 `data/datasets/molit-monthly/`(곡선)만 읽는다.
 * **국토부를 부르지 않는다.** 캐시에 없는 달이 곡선 구간 안에 있으면 **그리지 않고 던진다** —
 * 「거래가 없던 달」과 「안 받아 온 달」이 같은 얼굴이 되면 그건 오보다.
 *
 * ── ⚠️ 평형을 반드시 적는다
 * 이 카드는 평형을 섞어 묶는다(오너 2026-09-02). 그래서 「같은 집끼리의 비교」가 아니라
 * **「그때 같은 돈이면 살 수 있던 집들」**이다. 범례에 평형이 빠지면 그 순간 오보가 된다 —
 * 이 빌더는 평형이 없으면 던진다. 정본은 `docs/GAP_CARDS.md`.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => join(ROOT, p);
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

const SET = arg("set", "gap-ep1");
const PICK = Number(arg("pick", 1)) - 1;
const CURVE_FROM = arg("from", "202001");
const CURVE_TO = arg("to", "202607");
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const DATE = arg("date", kstToday);

/* BRAND — 레드 = 가장 많이 오른 쪽, 코발트 = 가장 덜 오른 쪽, 슬레이트 = 가운데.
   색이 방향(오름/내림)이 아니라 **순위**를 말한다. 곡선 셋이 부채로 벌어지는 그림이라
   양 끝에 두 강조색을 두고 가운데는 무채색으로 물러난다. */
const RED = "#e5484d", COBALT = "#2f5bd7", SLATE = "#5b6b7f";
const INK = "#141821", MUTE = "#9aa3af";
const SERIES_COLORS = [RED, SLATE, COBALT];

const r1 = (v) => Math.round(v * 10) / 10;
const eok = (m) => m / 10000;
const fmtEok = (m) => `${eok(m).toFixed(1)}억`;

function monthRange(from, to) {
  const out = [];
  let y = +from.slice(0, 4), m = +from.slice(4);
  const ey = +to.slice(0, 4), em = +to.slice(4);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}${String(m).padStart(2, "0")}`);
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}

/** 그 칸의 월별 최고가 계열. 캐시에 **없는 달이 하나라도 있으면 던진다.** */
function series(unit, months) {
  const pts = [];
  const holes = [];
  for (const ym of months) {
    const p = R(`data/datasets/molit-monthly/${unit.lawd}/${ym}.json`);
    if (!existsSync(p)) { holes.push(ym); continue; }
    const cell = JSON.parse(readFileSync(p, "utf8"));
    if (cell.scope !== "universe") { holes.push(ym); continue; }
    const row = (cell.rows ?? []).find((r) => r.umd === unit.umd && r.apt === unit.apt && r.type === unit.type);
    if (row) pts.push({ ym, v: row.max });
  }
  if (holes.length) {
    throw new Error(
      `${unit.gu} ${unit.apt} — 곡선 구간에 캐시가 없는 달 ${holes.length}개 (${holes[0]}~${holes[holes.length - 1]}).\n` +
        `   거래가 없던 달과 안 받아 온 달을 같게 그릴 수 없습니다. 먼저 채우세요:\n` +
        `   data/month-backfill-queue.txt →  lawd=${unit.lawd} from=${holes[0]} to=${holes[holes.length - 1]} budget=400`,
    );
  }
  if (pts.length < 12) throw new Error(`${unit.gu} ${unit.apt} — 거래가 있던 달이 ${pts.length}개뿐입니다(12개 미만이면 곡선이 아니라 점입니다)`);
  return pts;
}

const setPath = R(`data/datasets/${SET}.json`);
if (!existsSync(setPath)) throw new Error(`${SET}.json 이 없습니다 — 먼저 node scripts/find-gap-pairs.mjs --out ${SET}`);
const data = JSON.parse(readFileSync(setPath, "utf8"));
const group = data.picks[PICK];
if (!group) throw new Error(`${SET} 에 ${PICK + 1}번 묶음이 없습니다 (${data.picks.length}개 있음)`);

const months = monthRange(CURVE_FROM, CURVE_TO);
const members = group.members.map((m, i) => {
  if (!m.pyeong) throw new Error(`${m.apt} 에 평형이 없습니다 — 평형을 섞는 카드라 평형 없이는 만들지 않습니다`);
  return { ...m, color: SERIES_COLORS[i === group.members.length - 1 ? 2 : i], pts: series(m, months) };
});

/* ── 좌표 (streak-line 과 같은 뷰박스·자) ── */
const VB_H = 715, AXIS_X = 118, RIGHT = 915, TOP = 300, BASE = 640;
const allV = members.flatMap((m) => m.pts.map((p) => p.v));
const vmaxRaw = Math.max(...allV), vminRaw = Math.min(...allV);
/* 축 눈금은 억 단위로 떨어지게 — 5억 이상 폭이면 5억, 아니면 2억 간격 */
const step = (eok(vmaxRaw) - eok(vminRaw)) > 14 ? 100000 : 50000;
const YMAX = Math.ceil(vmaxRaw / step) * step;
const YMIN = Math.floor(vminRaw / step) * step;
const xi = (ym) => r1(AXIS_X + (months.indexOf(ym) / (months.length - 1)) * (RIGHT - AXIS_X));
const yv = (v) => r1(BASE - ((v - YMIN) / (YMAX - YMIN)) * (BASE - TOP));

const ticks = [];
for (let v = YMIN; v <= YMAX + 1; v += step) ticks.push(v);
const grid = ticks.filter((v) => v > YMIN).map((v) => ({ x1: AXIS_X, x2: RIGHT, y: yv(v) }));
const ylabels = ticks.map((v) => ({ x: AXIS_X - 16, y: yv(v) + 9, text: `${eok(v).toFixed(0)}` }));
const yunit = { x: AXIS_X - 16, y: TOP - 8, text: "(억)" };

const polylines = members.map((m) => ({
  points: m.pts.map((p) => `${xi(p.ym)},${yv(p.v)}`).join(" "),
  color: m.color,
  width: m.color === SLATE ? 6 : 8,
}));

/* 끝점 — 지금 값. 라벨은 곡선 위에 올린다(겹치면 아래 §라벨 밀기가 민다). */
const ends = members.map((m) => {
  const last = m.pts[m.pts.length - 1];
  return { m, x: xi(last.ym), y: yv(last.v), v: last.v };
});
const dots = ends.map((e) => ({ x: e.x, y: e.y, r: e.m.color === SLATE ? 13 : 15, color: e.m.color }));

/* ⚠️ 끝점 라벨이 서로 겹치는 것을 **코드가 막는다.** 손으로 자리를 정하면 사람이 놓친 겹침이
   그대로 나간다(CARD_CHECKLIST 2026-09-01 학군지 사고). 위에서부터 최소 간격을 강제한다. */
const LABEL_GAP = 62;
const sorted = [...ends].sort((a, b) => a.y - b.y);
let prevY = -Infinity;
for (const e of sorted) {
  let ly = e.y - 30;
  if (ly - prevY < LABEL_GAP) ly = prevY + LABEL_GAP;
  e.ly = ly;
  prevY = ly;
}
const vlabels = ends.map((e) => ({ x: e.x + 10, y: e.ly, text: fmtEok(e.v), fill: e.m.color, anchor: "end" }));

const xlabels = [
  { x: AXIS_X, y: BASE + 46, text: `${CURVE_FROM.slice(0, 4)}.${+CURVE_FROM.slice(4)}`, fill: MUTE, anchor: "start" },
  { x: r1((AXIS_X + RIGHT) / 2), y: BASE + 46, text: "2023.1", fill: MUTE, anchor: "middle" },
  { x: RIGHT, y: BASE + 46, text: `${CURVE_TO.slice(0, 4)}.${+CURVE_TO.slice(4)}`, fill: MUTE, anchor: "end" },
];

/* 출발점 — 곡선들이 붙어 있던 자리에 세로 눈금 하나. 「여기서 같이 출발했다」가 이 카드의 축이다. */
const startX = xi(months[0]);
const vmarks = [{ x: startX, y1: TOP - 10, y2: BASE, color: INK }];

/* 범례 — 단지명 + **평형**(필수) · 지역과 그때 값은 sub 로 */
const legend = members.map((m, i) => ({
  sx1: 118, sx2: 196, sy: 92 + i * 68,
  color: m.color,
  tx: 214, ty: 82 + i * 68,
  text: `${m.apt} ${m.pyeong}`,
  fill: INK,
  sub: `${m.gu} ${m.umd} · 그때 ${fmtEok(m.base)} → ${m.ratio.toFixed(2)}배`,
  sty: 124 + i * 68,
}));

const hi = members[0], lo = members[members.length - 1];
const baseLabel = fmtEok(Math.round((group.baseFrom + group.baseTo) / 2));

const card = {
  template: "streak-line@1",
  date: DATE,
  badge: `같은 값에서 출발한 집들 (${DATE.replace(/-/g, ".")})`,
  title:
    `<span class="tl">2020년 초, 셋 다 <span class="hi">${baseLabel}</span>이었다</span>`.replace(
      "셋",
      members.length === 2 ? "둘" : "셋",
    ) + `<span class="tl">지금은 <span class="hi">${group.gapEok.toFixed(1)}억</span> 벌어졌다</span>`,
  chart: {
    vb: `0 0 1000 ${VB_H}`,
    base: { y: BASE, x1: AXIS_X, x2: RIGHT },
    grid, ylabels, yunit, vmarks, polylines, dots, vlabels, xlabels, legend,
  },
  note: `${hi.apt} <b>${hi.ratio.toFixed(2)}배</b> · ${lo.apt} <b>${lo.ratio.toFixed(2)}배</b>`,
  source: { name: "국토교통부 아파트 매매 실거래가", asOf: `${CURVE_FROM.slice(0, 4)}.${+CURVE_FROM.slice(4)}~${CURVE_TO.slice(0, 4)}.${+CURVE_TO.slice(4)} 월별 최고가` },
  meta: {
    set: SET, pick: PICK + 1,
    /* 캡션 쓰는 사람이 다시 찾지 않게 남긴다 — 신고가 카드의 meta.region 과 같은 취지 */
    members: members.map((m) => ({ gu: m.gu, umd: m.umd, apt: m.apt, pyeong: m.pyeong, hhld: m.hhld, base: m.base, now: m.now, ratio: +m.ratio.toFixed(3) })),
    gapEok: group.gapEok, typeMix: group.typeMix,
  },
};

const label = arg("label", `${SET}-${PICK + 1}`);
const outDir = R(join("data/content", DATE));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${label}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`⚖️ ${label} — ${SET} ${PICK + 1}번 묶음 · 곡선 ${members.length}개 (${months.length}개월)`);
members.forEach((m) => console.log(`   ${m.color === RED ? "🔺" : m.color === COBALT ? "🔻" : "· "} ${m.gu} ${m.apt} ${m.pyeong} — ${fmtEok(m.base)} → ${fmtEok(m.now)} (${m.ratio.toFixed(2)}배) · 관측 ${m.pts.length}개월`));
console.log(`   → ${join("data/content", DATE, `${label}.json`)}`);
