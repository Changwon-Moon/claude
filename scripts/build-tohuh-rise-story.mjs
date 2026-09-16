/**
 * 📈 「언제부터 셌느냐에 따라 1등이 바뀐다」 — 토허제 40곳 매매가 상승률 9장 중 이야기 카드 5장. (rise-story@1)
 *
 * 오너 2026-09-16: 구성안 v2(9장) → *"9장 카드 만들어줘"*.
 *   1 표지(cover) · 2 읽는 법(method) · 3~6 지도 4장(build-tohuh-rise-map) ·
 *   7 순위 이동(bump) · 8 40곳 전체 표(grid) · 9 읽기 전에 알아둘 것(notes)
 * 계산은 scripts/lib/tohuh-rise-data.mjs 한 곳 — 지도 4장과 순위·반올림이 같다.
 * 손으로 적은 숫자 0개. 문장 속 수치·지역도 전부 계산값에서 꺼낸다.
 *
 * 읽는 자료(확정 스크립트가 정기물 판정에 쓰는 경로 — lib 안이라 여기 적어 둔다):
 *   data/datasets/reb-weekly-index.json · data/datasets/tohuh-2026.json
 *
 * 실행: node scripts/build-tohuh-rise-story.mjs [--end 202637] [--date 2026-09-16]
 * 출력: data/content/{date}/tohuh-rise-{cover,method,bump,grid,notes}.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";
import {
  loadTohuhRise, SERIES_BASES, pctTxt, r1, mondayOf, dateKo, dateDot, tableName, shortName,
} from "./lib/tohuh-rise-data.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (k, dflt) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const END = arg("end", "202637");
const date = arg("date", "2026-09-16");
const R = loadTohuhRise(ROOT, END);
const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
const endKo = dateKo(R.endDate);
const endDot = dateDot(R.endDate);
const YS = SERIES_BASES;
const B = (y) => R.byBase.get(y);
const SOURCE = { name: "한국부동산원 주간 아파트가격동향 · 서울시·경기도 허가구역 고시" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fallbacks = R.AREAS.filter((a) => a.fallback);
const cards = {};
/* 공통 킥커(오너 2026-09-16) — 숫자는 명단·끝점에서 센다 */
const nSeoul = R.AREAS.filter((a) => a.region === "서울").length;
const nGg = R.AREAS.filter((a) => a.region === "경기").length;
const KICKER = `수도권 토허구역 ${R.AREAS.length}곳 (서울${nSeoul}•경기${nGg}) | ${endDot.slice(0, 7)} 기준`;
/* 경기 이름을 코발트로 칠한 카드(1·3장)는 킥커의 「경기15」도 같은 색 — 따로 범례 줄 없이 색의 뜻을 말한다 */
const KICKER_GG = `수도권 토허구역 ${R.AREAS.length}곳 (서울${nSeoul}•<span class="gg">경기${nGg}</span>) | ${endDot.slice(0, 7)} 기준`;
/** 제목 줄 — 줄마다 템플릿이 폭을 따로 잰다 */
const lines = (...ls) => ls.map((l) => `<span class="ln">${l}</span>`).join("");

/* SVG 글자 폭 어림(Pretendard) — SVG 안 글자는 designQa 가 못 잰다 → 빌더가 폭을 책임진다 */
const textW = (s, px) => [...String(s)].reduce((w, ch) => w + (/[가-힣]/.test(ch) ? 0.96 : /[0-9]/.test(ch) ? 0.6 : ch === " " ? 0.28 : 0.55), 0) * px;
const FONT = `font-family="Pretendard, sans-serif"`;
const INK = "var(--wirit-ink)", GRAY = "var(--wirit-gray)", RED = "var(--wirit-red)", CO = "var(--wirit-cobalt)";

/* ───────── 1. 표지 ───────── */
{
  const maxV = Math.max(...YS.map((y) => B(y).coTop[0].v));
  const rows = YS.map((y) => {
    const b = B(y);
    return {
      yr: `${y}년부터`,
      nm: b.coTop.map(shortName).join("·"),
      sub: `서울 평균 ${pctTxt(b.seoulV)}%`,
      v: pctTxt(b.coTop[0].v),
      w: `${((b.coTop[0].v / maxV) * 100).toFixed(1)}%`,
    };
  });
  cards.cover = {
    template: "rise-story@1", date, kind: "cover",
    note: "수도권 토지거래허가구역 40곳 · 아파트 매매가",
    title: lines(`언제부터 셌느냐에 따라`, `<span class="hi">1등</span>이 바뀐다`),
    rows,
    source: SOURCE,
  };
}

/* ───────── 2. 읽는 법 — 서울 지수 곡선 위에 출발점 넷 ───────── */
{
  const s = R.mae[R.SEOUL];
  const FROM = `${+YS[0] - 1}40`; // 첫 기준점 약 석 달 전(전년 40주)부터
  const keys = Object.keys(s).filter((k) => k >= FROM && k <= END).sort();
  const t = (k) => mondayOf(k).getTime();
  const W = 936, H = 650, L = 8, Rr = 150, T = 70, Bt = 60;
  const t0 = t(keys[0]), t1 = t(END);
  const vals = keys.map((k) => s[k]);
  /* 아래에 저점 라벨 자리를 남긴다(바닥선과 곡선 사이) */
  const vmin = Math.min(...vals), vmax = Math.max(...vals);
  const lo = vmin - (vmax - vmin) * 0.16, hi = vmax;
  const X = (k) => L + ((t(k) - t0) / (t1 - t0)) * (W - L - Rr);
  const Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - Bt);
  const path = keys.map((k, i) => `${i ? "L" : "M"}${X(k).toFixed(1)},${Y(s[k]).toFixed(1)}`).join("");
  const minK = keys.reduce((a, k) => (s[k] < s[a] ? k : a));
  let g = "";
  /* 가로 기준선(바닥)과 연도 눈금 */
  g += `<line x1="${L}" y1="${H - Bt}" x2="${W - Rr}" y2="${H - Bt}" stroke="${INK}" stroke-width="2"/>`;
  const endX = X(END), endY = Y(s[END]);
  YS.forEach((y, i) => {
    const k = `${y}01`, x = X(k), yy = Y(s[k]);
    g += `<line x1="${x.toFixed(1)}" y1="${yy.toFixed(1)}" x2="${x.toFixed(1)}" y2="${H - Bt}" stroke="${GRAY}" stroke-width="2" stroke-dasharray="5 5" opacity="0.7"/>`;
    g += `<text x="${x.toFixed(1)}" y="${H - Bt + 34}" ${FONT} font-size="24" font-weight="800" fill="${INK}" text-anchor="middle">${y.slice(2)}년 초</text>`;
    /* 출발점 → 끝점 서울 상승률: 출발점 위에 */
    /* 라벨은 곡선이 비어 있는 쪽으로 — 앞이 높으면(내려오는 중) 오른쪽 위, 뒤가 높으면 왼쪽 위 */
    const ix = keys.indexOf(k);
    const before = s[keys[Math.max(0, ix - 4)]], after = s[keys[Math.min(keys.length - 1, ix + 4)]];
    const slope = after - before;
    const anchor = slope < -0.4 ? "start" : slope > 0.4 ? "end" : "middle";
    const lx = anchor === "start" ? x + 14 : anchor === "end" ? x - 14 : x;
    g += `<text x="${lx.toFixed(1)}" y="${(yy - 22).toFixed(1)}" ${FONT} font-size="28" font-weight="900" fill="${RED}" text-anchor="${anchor}" stroke="var(--wirit-paper)" stroke-width="7" paint-order="stroke">${pctTxt(B(y).seoulV)}%</text>`;
  });
  g += `<path d="${path}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  YS.forEach((y) => {
    const k = `${y}01`;
    g += `<circle cx="${X(k).toFixed(1)}" cy="${Y(s[k]).toFixed(1)}" r="9" fill="var(--wirit-paper)" stroke="${INK}" stroke-width="4"/>`;
  });
  g += `<circle cx="${endX.toFixed(1)}" cy="${endY.toFixed(1)}" r="11" fill="${RED}"/>`;
  g += `<text x="${(endX + 18).toFixed(1)}" y="${(endY + 2).toFixed(1)}" ${FONT} font-size="24" font-weight="800" fill="${INK}">도착점</text>`;
  g += `<text x="${(endX + 18).toFixed(1)}" y="${(endY + 32).toFixed(1)}" ${FONT} font-size="22" font-weight="600" fill="${GRAY}">${endDot.slice(2)}</text>`;
  /* 저점 표시 — 계산이 찾은 달만 */
  const md = mondayOf(minK);
  g += `<text x="${X(minK).toFixed(1)}" y="${(Y(s[minK]) + 34).toFixed(1)}" ${FONT} font-size="21" font-weight="700" fill="${GRAY}" text-anchor="middle" stroke="var(--wirit-paper)" stroke-width="6" paint-order="stroke">저점 ${String(md.getUTCFullYear()).slice(2)}.${String(md.getUTCMonth() + 1).padStart(2, "0")}</text>`;
  g += `<text x="${L}" y="24" ${FONT} font-size="22" font-weight="700" fill="${GRAY}">서울 아파트 매매가격지수 · 빨간 숫자 = 그때부터 지금까지 서울 상승률</text>`;
  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;

  /* 부동산원 발표와 대조한 값(2025 연간 8.71%) — 문장도 계산값으로 */
  const yr25 = (R.mae[R.SEOUL]["202601"] / R.mae[R.SEOUL]["202501"] - 1) * 100;
  cards.method = {
    template: "rise-story@1", date, kind: "method",
    note: "이 시리즈를 읽는 법",
    title: lines(`출발점은 넷, <span class="co">도착점은 하나</span>`),
    svg,
    lede: `출발점이 낮을수록 상승률은 커집니다. 순위가 바뀌는 이유이기도 합니다.`,
    items: [
      { k: "대상", d: `토지거래허가구역 40곳 — 서울 ${R.AREAS.filter((a) => a.region === "서울").length}개 구 + 경기 ${R.AREAS.filter((a) => a.region === "경기").length}곳` },
      { k: "지표", d: `한국부동산원 주간 아파트 매매가격지수 (${endDot} 조사까지)` },
      { k: "시작점", d: `각 연도 첫 주 조사 — 이 방식의 2025년 서울 상승률 ${yr25.toFixed(2)}%` },
    ],
    source: SOURCE,
  };
}

/* ───────── 7. 순위 이동 (범프) ─────────
 * 오너 2026-09-16: 누적(「23년 초부터」)이 아니라 **그해 한 해 상승률**로 해마다 순위를 다시 매긴다.
 * 23년 = 23년 첫 주 → 24년 첫 주 … 26년 = 26년 첫 주 → 끝점(연중). 계산은 lib 의 byYear. */
{
  const first = YS[0], last = YS.at(-1);
  const Y1 = (y) => R.byYear.get(y);
  const order = (y) => Y1(y).ranked; // 같은 순위도 자리는 따로(겹치지 않게), 적는 숫자는 공동 순위
  const pos = new Map(); // geoName → [index per year]
  YS.forEach((y, j) => order(y).forEach((a, i) => {
    if (!pos.has(a.geoName)) pos.set(a.geoName, []);
    pos.get(a.geoName)[j] = i;
  }));
  const rk = (y, a) => Y1(y).rankOf.get(a.geoName);
  const cur = (a) => Y1(last).stat.find((x) => x.geoName === a.geoName).v;
  const delta = R.AREAS.map((a) => ({ a, d: rk(first, a) - rk(last, a) })); // +면 올라옴
  /* 5곳씩(오너 2026-09-16: 「5개씩으로 맞춰줘」). 순위 변화가 같으면 **올해 상승률**로 가른다
   * (올라온 쪽은 올해 더 오른 곳, 내려간 쪽은 올해 덜 오른 곳 먼저) — 이름순보다 이야기에 맞는 기준. */
  const N5 = 5;
  const up = [...delta].filter((p) => p.d > 0).sort((p, q) => q.d - p.d || cur(q.a) - cur(p.a)).slice(0, N5);
  const down = [...delta].filter((p) => p.d < 0).sort((p, q) => p.d - q.d || cur(p.a) - cur(q.a)).slice(0, N5);
  if (up.length < N5 || down.length < N5) throw new Error(`강조 지역이 5곳씩 안 나온다 (올라옴 ${up.length} · 내려감 ${down.length})`);
  const color = new Map([...up.map((p) => [p.a.geoName, RED]), ...down.map((p) => [p.a.geoName, CO])]);

  const W = 936, H = 852, top = 46, bot = 12; // 푸터 위 회색 문구가 빠진 자리만큼 늘림(오너 2026-09-16)
  const NAME_PX = 16;
  const name = (a, y) => `${rk(y, a)} ${tableName(a)}`;
  const leftW = Math.ceil(Math.max(...R.AREAS.map((a) => textW(name(a, first), NAME_PX)))) + 10;
  const rightW = Math.ceil(Math.max(...R.AREAS.map((a) => textW(name(a, last), NAME_PX)))) + 10;
  const x0 = leftW + 8, x1 = W - rightW - 8;
  const colX = YS.map((_, j) => x0 + ((x1 - x0) * j) / (YS.length - 1));
  const step = (H - top - bot) / (R.AREAS.length - 1);
  const Y = (i) => top + i * step;
  let g = "";
  YS.forEach((y, j) => {
    const lab = Y1(y).partial ? `${y.slice(2)}년(~${+endDot.slice(5, 7)}월)` : `${y.slice(2)}년`;
    g += `<text x="${colX[j].toFixed(1)}" y="22" ${FONT} font-size="22" font-weight="800" fill="${INK}" text-anchor="middle">${lab}</text>`;
  });
  const drawLine = (a, hl) => {
    const p = pos.get(a.geoName);
    const d = p.map((i, j) => `${j ? "L" : "M"}${colX[j].toFixed(1)},${Y(i).toFixed(1)}`).join("");
    const c = hl ? color.get(a.geoName) : GRAY;
    let s = `<path d="${d}" fill="none" stroke="${c}" stroke-width="${hl ? 4.5 : 1.6}" opacity="${hl ? 1 : 0.28}" stroke-linejoin="round"/>`;
    if (hl) p.forEach((i, j) => (s += `<circle cx="${colX[j].toFixed(1)}" cy="${Y(i).toFixed(1)}" r="6" fill="${c}"/>`));
    return s;
  };
  R.AREAS.filter((a) => !color.has(a.geoName)).forEach((a) => (g += drawLine(a, false)));
  R.AREAS.filter((a) => color.has(a.geoName)).forEach((a) => (g += drawLine(a, true)));
  /* 가운데 두 열은 이름표가 없다 → 강조 선의 그해 순위를 점 옆에 적는다(검수 2026-09-16: 24·25년 순위를 읽을 수 없었다).
   * 자리: 나가는 선의 반대쪽(내려가면 점 위, 올라가면 점 아래)을 먼저 잡고,
   * 같은 열 안에서 위에서부터 LABEL_GAP 보다 가까우면 아래로 민다 — 한쪽에 고정했더니
   * 24년 열의 7·8·9·11 이 포개졌다(designQa 가 「11」·「9」 43% 겹침으로 막았다). */
  const LABEL_GAP = 19;
  for (let j = 1; j < YS.length - 1; j++) {
    const labs = R.AREAS.filter((a) => color.has(a.geoName)).map((a) => {
      const p = pos.get(a.geoName), i = p[j];
      /* 맨 위 줄은 점 위에 자리가 없다(머리글 「25년」과 겹쳤다) → 아래로 */
      const above = p[j + 1] > i && Y(i) - 8 - 17 > 30;
      return { a, y: above ? Y(i) - 8 : Y(i) + 20, c: color.get(a.geoName) };
    }).sort((p, q) => p.y - q.y);
    labs.forEach((l, k) => { if (k && l.y < labs[k - 1].y + LABEL_GAP) l.y = labs[k - 1].y + LABEL_GAP; });
    /* 맨 아래가 판 밖으로 나가면(24년 열 기흥 40위 — 숫자가 잘렸다) 뒤에서부터 위로 당긴다 */
    const YMAX = H - 2;
    for (let k = labs.length - 1; k >= 0; k--) {
      const lim = k === labs.length - 1 ? YMAX : labs[k + 1].y - LABEL_GAP;
      if (labs[k].y > lim) labs[k].y = lim;
    }
    for (const l of labs)
      g += `<text x="${(colX[j] + 12).toFixed(1)}" y="${l.y.toFixed(1)}" ${FONT} font-size="17" font-weight="900" fill="${l.c}" stroke="var(--wirit-paper)" stroke-width="6" paint-order="stroke">${rk(YS[j], l.a)}</text>`;
  }
  R.AREAS.forEach((a) => {
    const p = pos.get(a.geoName), hl = color.has(a.geoName);
    const c = hl ? color.get(a.geoName) : GRAY, fw = hl ? 900 : 600;
    g += `<text x="${leftW}" y="${(Y(p[0]) + 6).toFixed(1)}" ${FONT} font-size="${NAME_PX}" font-weight="${fw}" fill="${c}" text-anchor="end">${esc(name(a, first))}</text>`;
    g += `<text x="${W - rightW + 10}" y="${(Y(p.at(-1)) + 6).toFixed(1)}" ${FONT} font-size="${NAME_PX}" font-weight="${fw}" fill="${c}">${esc(name(a, last))}</text>`;
  });
  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;

  cards.bump = {
    template: "rise-story@1", date, kind: "bump",
    note: KICKER,
    title: lines(`'${first.slice(2)}~'${last.slice(2)} 연도별 <span class="hi">집값 상승 순위</span>`),
    /* 강조 선 설명은 좌우 두 카드(오너 2026-09-16) — 올라온 쪽 왼쪽, 내려간 쪽 오른쪽 */
    legs: [
      { cls: "up", t: `순위가 가장 많이 올라온 ${up.length}곳`, d: up.map((p) => shortName(p.a)).join(" · ") },
      { cls: "down", t: `순위가 가장 많이 내려간 ${down.length}곳`, d: down.map((p) => shortName(p.a)).join(" · ") },
    ],
    svg,
    source: SOURCE,
  };
}

/* ───────── (시안) 해마다 쌓인 몫 — 누적 막대(오너 2026-09-16) ─────────
 * 1차 시안(점 도표)은 26년 점이 맨 왼쪽에 와서 「26→23」 순으로 읽혔다(오너: 잘 안 읽힌다).
 * → 23년 초 가격을 기준(0)으로, 해마다 더해진 몫을 23·24·25·26 순서로 쌓는다.
 *   칸 k = (k+1년 초 지수 − k년 초 지수) ÷ 23년 초 지수   (마지막 칸은 끝점까지)
 *   칸을 다 더하면 정확히 23년 초부터의 상승률이 된다(곱셈 효과가 칸 안에 들어간다).
 * 내린 해는 0 왼쪽으로 쌓는다 — 오른 몫은 0 오른쪽에서 해 순서대로 이어 붙인다.
 * 3차(오너 2026-09-16): 막대(stack)와 점(dots) 두 시안을 같은 계산으로 나란히 만든다.
 *   점 = 해마다 끝난 자리(누적)에 찍는다 → 0 → 24년 말 → 25년 말 → 지금, 왼쪽에서 오른쪽으로 해 순서.
 * 2차(오너 2026-09-16): 23년은 내린 곳이 많아 막대가 0 양쪽으로 갈라져 읽기 어렵다 →
 *   **24년 초를 기준(0)으로 24·25·26 세 칸만** 쌓는다. 시작 연도는 STACK_FROM 한 곳에서 바꾼다.
 * 오른쪽 숫자 = 23년 초부터 합계. */
const buildStack = (mode) => {
  const STACK_FROM = "2024";
  const SYS = YS.slice(YS.indexOf(STACK_FROM));
  const first = SYS[0], last = SYS.at(-1);
  const HL = new Set(); // 설명 줄이 빠져 강조 색도 뺐다(2026-09-16)
  const s0 = (a) => R.mae[a.code];
  const segs = (a) => {
    const s = s0(a), b = s[`${first}01`];
    const pts = [...SYS.map((y) => `${y}01`), END].map((k) => (s[k] / b - 1) * 100);
    return SYS.map((y, i) => ({ y, v: pts[i + 1] - pts[i] }));
  };
  const total = (a) => B(first).stat.find((x) => x.geoName === a.geoName).v;
  const rows = [...B(first).ranked];
  /* 칸 합 = 합계 검산 — 어긋나면 그림이 거짓이다 */
  for (const a of rows) {
    const sum = segs(a).reduce((t, x) => t + x.v, 0);
    if (Math.abs(sum - total(a)) > 1e-9) throw new Error(`${a.label} 칸 합 ${sum} ≠ 합계 ${total(a)}`);
  }
  /* 색은 연도에 붙인다(칸 순번이 아니라) — 시작 연도를 바꿔도 같은 해는 같은 색 */
  const COLOR_BY_Y = { 2023: ["var(--wirit-gray)", 0.28], 2024: ["var(--wirit-gray)", 0.6], 2025: [INK, 0.9], 2026: [RED, 1] };
  const COLORS = SYS.map((y) => COLOR_BY_Y[y][0]);
  const OPAC = SYS.map((y) => COLOR_BY_Y[y][1]);
  const W = 936, top = 70, rowH = 22.5, H = top + rowH * rows.length + 8;
  const NAME_PX = 17, nameW = Math.ceil(Math.max(...rows.map((a) => textW(tableName(a), NAME_PX)))) + 6;
  const valW = 80;
  const x0 = nameW + 14, x1 = W - valW - 10;
  const negMax = Math.max(...rows.map((a) => -segs(a).filter((x) => x.v < 0).reduce((t, x) => t + x.v, 0)));
  const posMax = Math.max(...rows.map((a) => segs(a).filter((x) => x.v > 0).reduce((t, x) => t + x.v, 0)));
  /* 내린 몫이 한 칸(10%) 에 못 미치면 −10% 눈금까지 비워 두지 않는다 — 그만큼만 왼쪽을 연다(24년 기준: 기흥 −0.2%p 하나) */
  const axMin = negMax >= 5 ? -Math.ceil(negMax / 10) * 10 : negMax > 0 ? -(negMax + 0.6) : 0, axMax = Math.ceil(posMax / 10) * 10;
  const X = (v) => x0 + ((v - axMin) / (axMax - axMin)) * (x1 - x0);
  let g = "";
  /* 범례 — 해 순서 그대로 */
  let lx = 0;
  SYS.forEach((y, i) => {
    const isLast = i === SYS.length - 1;
    const lab = mode === "dots" ? (isLast ? `지금(${endDot.slice(2, 7)})` : `${y.slice(2)}년 말`) : isLast ? `${y.slice(2)}년(올해)` : `${y.slice(2)}년`;
    g += mode === "dots"
      ? `<circle cx="${lx + 12}" cy="14" r="8" fill="${COLORS[i]}" opacity="${OPAC[i]}"/>`
      : `<rect x="${lx}" y="6" width="26" height="16" fill="${COLORS[i]}" opacity="${OPAC[i]}"/>`;
    g += `<text x="${lx + 34}" y="21" ${FONT} font-size="20" font-weight="800" fill="${i === SYS.length - 1 ? RED : INK}">${lab}</text>`;
    lx += 34 + textW(lab, 20) + 30;
  });
  g += `<text x="${lx + 4}" y="21" ${FONT} font-size="18" font-weight="600" fill="${GRAY}">${mode === "dots" ? "까지 오른 폭" : "에 더해진 몫"}</text>`;
  if (mode === "stack") g += `<line x1="${W - 150}" y1="6" x2="${W - 150}" y2="24" stroke="${INK}" stroke-width="2.5"/><text x="${W - 140}" y="21" ${FONT} font-size="18" font-weight="600" fill="${GRAY}">합계 자리</text>`;
  for (let t = Math.ceil(axMin / 10) * 10; t <= axMax; t += 10) {
    g += `<line x1="${X(t).toFixed(1)}" y1="${top - 12}" x2="${X(t).toFixed(1)}" y2="${H - 4}" stroke="${t === 0 ? INK : "var(--wirit-ink-06)"}" stroke-width="${t === 0 ? 2 : 2}" opacity="${t === 0 ? 0.5 : 1}"/>`;
    g += `<text x="${X(t).toFixed(1)}" y="${top - 18}" ${FONT} font-size="17" font-weight="700" fill="${GRAY}" text-anchor="middle">${t > 0 ? "+" : t < 0 ? "−" : ""}${Math.abs(t)}%</text>`;
  }
  g += `<text x="${W - 4}" y="${top - 18}" ${FONT} font-size="16" font-weight="800" fill="${INK}" text-anchor="end">합계</text>`;
  rows.forEach((a, r) => {
    const cy = top + rowH * r + rowH / 2, bh = 13;
    const hl = HL.has(a.label);
    if (r % 2 === 0) g += `<rect x="0" y="${(cy - rowH / 2).toFixed(1)}" width="${W}" height="${rowH}" fill="var(--wirit-ink-06)" opacity="0.5"/>`;
    g += `<text x="${nameW}" y="${(cy + 6).toFixed(1)}" ${FONT} font-size="${NAME_PX}" font-weight="${hl ? 900 : 600}" fill="${hl || a.region === "경기" ? CO : INK}" text-anchor="end">${esc(tableName(a))}</text>`;
    if (mode === "dots") {
      /* 누적 자리: 해마다 끝난 곳 */
      let c = 0;
      const cum = segs(a).map((sg) => (c += sg.v));
      const lo = Math.min(0, ...cum), hi = Math.max(0, ...cum);
      g += `<line x1="${X(lo).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${X(hi).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${GRAY}" stroke-width="3" opacity="0.4"/>`;
      cum.forEach((v, i) => {
        const last = i === cum.length - 1;
        g += `<circle cx="${X(v).toFixed(1)}" cy="${cy.toFixed(1)}" r="${last ? 7.5 : 6.5}" fill="${COLORS[i]}" opacity="${OPAC[i]}" stroke="var(--wirit-paper)" stroke-width="1.5"/>`;
      });
    } else {
      let pos = 0, neg = 0;
      segs(a).forEach((sg, i) => {
        if (Math.abs(sg.v) < 1e-9) return;
        let from, to;
        if (sg.v > 0) { from = pos; to = pos + sg.v; pos = to; } else { from = neg + sg.v; to = neg; neg = from; }
        g += `<rect x="${X(from).toFixed(1)}" y="${(cy - bh / 2).toFixed(1)}" width="${Math.max(0.8, X(to) - X(from)).toFixed(1)}" height="${bh}" fill="${COLORS[i]}" opacity="${OPAC[i]}"/>`;
      });
      /* 내린 해가 있으면 막대 오른쪽 끝 ≠ 합계다 → 합계 자리에 세로 눈금을 찍어 둔다(오독 방지) */
      if (neg < 0) g += `<line x1="${X(total(a)).toFixed(1)}" y1="${(cy - 9).toFixed(1)}" x2="${X(total(a)).toFixed(1)}" y2="${(cy + 9).toFixed(1)}" stroke="var(--wirit-paper)" stroke-width="5"/><line x1="${X(total(a)).toFixed(1)}" y1="${(cy - 9).toFixed(1)}" x2="${X(total(a)).toFixed(1)}" y2="${(cy + 9).toFixed(1)}" stroke="${INK}" stroke-width="2.5"/>`;
    }
    g += `<text x="${W - 4}" y="${(cy + 6).toFixed(1)}" ${FONT} font-size="17" font-weight="800" fill="${INK}" text-anchor="end">${pctTxt(total(a))}</text>`;
  });
  const svg = `<svg viewBox="0 0 ${W} ${H.toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
  /* 제목: 올해 몫이 가장 큰 곳 — 계산이 고른다 */
  const lastShare = (a) => segs(a).at(-1).v;
  const topLast = [...rows].sort((p, q) => lastShare(q) - lastShare(p))[0];
  cards[mode] = {
    template: "rise-story@1", date, kind: "bump",
    note: mode === "dots" ? KICKER_GG : `시안 · 누적 막대 · ${KICKER_GG}`,
    title: lines(`${first.slice(2)}년부터 <span class="hi">해마다</span> 얼마씩 올랐나`),
    svg,
    source: SOURCE,
  };
  if (mode === "stack") console.log(`   누적 막대: 올해 몫 최대 ${topLast.label} ${lastShare(topLast).toFixed(1)}%p`);
};
buildStack("stack");
buildStack("dots");

/* ───────── 3. 출발점별 순위표 넷 — 지도 4장을 한 장으로(오너 2026-09-16) ─────────
 * 「상위 1위~N위 … 38~40위」 — 위는 N곳, 아래는 마지막 세 자리. N 은 판 높이에 맞춘 값이다.
 * 서울 평균은 머리글 아래가 아니라 **표 안 그 값의 자리**에 회색 타원으로 끼운다(오너 2026-09-16).
 *   자리가 생략 구간(N+1 ~ 끝−3)이면 「⋮ 서울 ⋮」 로 반 칸씩 나눠 끼운다 — 네 열의 줄 수를 같게 두려고. */
{
  const TOPN = 20, TAIL = 3;
  /* 강남 3구 파랑 강조는 뺐다 — 「파랑 = 강남 3구」 설명 줄(푸터 위 회색 문구)이 오너 지시로 빠져 설명 없는 색이 됐다(2026-09-16) */
  const HL = new Set();
  const row = (y, a) => ({ t: "row", r: B(y).rankOf.get(a.geoName), nm: tableName(a), v: pctTxt(a.v), hl: HL.has(a.label), gg: a.region === "경기", first: B(y).rankOf.get(a.geoName) === 1 });
  const N = R.AREAS.length;
  const cols = YS.map((y) => {
    const b = B(y), rk = b.ranked;
    const pill = { t: "pill", nm: "서울 평균", v: `${pctTxt(b.seoulV)}%` };
    const at = rk.filter((a) => a.v > b.seoulV).length; // 서울보다 높은 곳의 수 = 끼울 자리
    const top = rk.slice(0, TOPN).map((a) => row(y, a));
    const tail = rk.slice(-TAIL).map((a) => row(y, a));
    let items;
    if (at <= TOPN) items = [...top.slice(0, at), pill, ...top.slice(at), { t: "gap" }, ...tail];
    else if (at >= N - TAIL) items = [...top, { t: "gap" }, ...tail.slice(0, at - (N - TAIL)), pill, ...tail.slice(at - (N - TAIL))];
    else items = [...top, { t: "gaphalf" }, pill, { t: "gaphalf" }, ...tail];
    return { yr: `${y.slice(2)}년 초~현재`, items };
  });
  cards.ranks = {
    template: "rise-story@1", date, kind: "ranks",
    note: KICKER_GG,
    title: lines(`'${YS[0].slice(2)}~'${YS.at(-1).slice(2)} 연도별 <span class="hi">누적 집값 상승률</span>`),
    cols,
    source: SOURCE,
  };
}

/* ───────── 8. 40곳 전체 표 ───────── */
{
  const maxV = Math.max(...YS.map((y) => B(y).ranked[0].v));
  const cell = (y, a) => {
    const v = B(y).stat.find((s) => s.geoName === a.geoName).v;
    const pct = Math.round(Math.max(0, v / maxV) * 78 + 4); // 4~82% 농도
    return {
      t: pctTxt(v),
      bg: `color-mix(in srgb, var(--wirit-red) ${pct}%, var(--wirit-paper))`,
      dk: pct >= 50,
      top: B(y).rankOf.get(a.geoName) === 1,
    };
  };
  const panel = (region, key) => ({
    name: `${region} ${R.AREAS.filter((a) => a.region === region).length}곳`,
    rows: R.AREAS.filter((a) => a.region === region).map((a) => ({ nm: tableName(a), cells: YS.map((y) => cell(y, a)) })),
    key,
  });
  const gg = panel("경기",
    `<span class="sw"></span>각 열 1위 · 색이 진할수록 많이 오름<br>` +
      `단위 % · 각 연도 초 → ${endDot}` +
      (fallbacks.length ? `<br>${fallbacks.map((a) => tableName(a)).join("·")}은 화성시 전체 기준` : ""));
  /* 경기 표는 행이 적다 — 서울 표와 같은 행 순서 규칙(데이터셋 순서 = 고시 순서) */
  cards.grid = {
    template: "rise-story@1", date, kind: "grid",
    note: "저장해 두고 우리 동네 찾기",
    title: lines(`토허제 <span class="hi">40곳</span> 상승률 전체 표`),
    grid: { cols: YS.map((y) => `${y.slice(2)}년~`), panels: [panel("서울"), gg] },
    source: SOURCE,
  };
}

/* ───────── 9. 읽기 전에 알아둘 것 ───────── */
{
  const ymd = (s) => { const [y, m, d] = s.split("-"); return `${y}년 ${+m}월 ${+d}일`; };
  const items = [
    { t: "실거래가가 아니라 가격지수입니다", d: "거래된 단지 구성의 영향을 걸러낸 값이라, 기사 속 실거래 평균·중위가격 상승률과 다를 수 있습니다." },
    { t: "규제 효과를 잰 것이 아닙니다", d: `지금 허가구역인 40곳을 묶어 본 것입니다. 서울은 ${ymd(tohuh.seoul.effectiveFrom)}, 경기 신규 3곳은 ${ymd(tohuh.newly.effectiveFrom)}부터 지정됐습니다.` },
    { t: "같은 숫자는 같은 순위", d: "소수 첫째 자리까지 같으면 공동 순위로 적었습니다." },
    { t: "시·군·구 경계 기준", d: "실제 허가구역이 행정구역 일부인 곳이 있습니다." },
  ];
  if (fallbacks.length)
    items.splice(3, 0, { t: `${fallbacks.map(tableName).join("·")}은 화성시 전체 기준`, d: "동탄구 지수는 2026년 분구 이후치뿐이라 연초 기준점이 없습니다." });
  cards.notes = {
    template: "rise-story@1", date, kind: "notes",
    note: "이 시리즈를 볼 때",
    title: lines(`읽기 전에 <span class="co">알아둘 것</span>`),
    items,
    source: SOURCE,
  };
}

/* ───────── 세트 캡션(9장 한 게시물) ── 숫자·지역은 전부 위 계산값 ───────── */
{
  const top3 = (y) => B(y).ranked.slice(0, 3).map((a) => `${B(y).rankOf.get(a.geoName)}위 ${tableName(a)} ${pctTxt(a.v)}%`).join(" · ");
  const bottom = (y) => { const a = B(y).ranked.at(-1); return `${tableName(a)} ${pctTxt(a.v)}%`; };
  const first = YS[0], last = YS.at(-1);
  const t1 = B(first).coTop;
  const caption = [
    `같은 날 기준인데, 언제부터 세느냐에 따라 1등이 바뀝니다 📈`,
    `${first}년 초부터 1위 ${t1.map(tableName).join("·")}, 올해 초부터 세면 ${B(last).rankOf.get(t1[0].geoName)}위.`,
    ``,
    `서울 25개 구 + 경기 15곳, 토지거래허가구역 40곳의`,
    `아파트 매매가격지수를 네 출발점(${YS.join("·")}년 초)에서`,
    `${endKo}까지 비교했습니다.`,
    ``,
    ...YS.flatMap((y) => [`[${y}년 초부터] 서울 평균 ${pctTxt(B(y).seoulV)}%`, `${top3(y)}`, `꼴찌 ${bottom(y)}`, ``]),
    `👉 1장: 연도별 누적 상승률 · 2장: 해마다 매긴 상승 순위 · 3장: 해마다 오른 폭`,
    ``,
    `📌 저장해두고 우리 동네가 몇 위인지 확인하기`,
    ``,
    `—`,
    `📊 출처 · 한국부동산원 주간 아파트가격동향 (매매가격지수, ${endKo} 조사)`,
    `🗂 허가구역 : 서울시·경기도 토지거래허가구역 지정 고시`,
    ``,
    ...(fallbacks.length ? [`※ 동탄구는 화성시 전체 기준입니다 (동탄구 지수는 2026년 분구 이후치뿐)`] : []),
    `※ 지수는 거래된 단지 구성의 영향을 걸러낸 값이라 실거래 평균·중위가격 상승률과 다를 수 있습니다`,
    `※ 지금의 허가구역 40곳을 묶어 본 것이며, 규제 효과를 잰 것이 아닙니다`,
    `※ 소수 첫째 자리까지 같으면 공동 순위입니다`,
    ``,
    `#부동산 #아파트값 #토지거래허가구역 #집값 #데이터시각화`,
  ].join("\n");
  writeCaption("tohuh-rise", caption);
  writeCaption("tohuh-rise-dots", `(시안) 누적 막대·점 도표 — 캡션은 확정 후 손질\n\n${caption}`);
}

/* ───────── 카톡 공유용 짧은 글(docs/CAPTION.md §9) ─────────
 * gen-kakao-caption 은 신고가 전용(세트 라벨에서 날짜를 읽는다)이라 이 세트는 여기서 만든다.
 * 틀은 §9 그대로: 제목 한 줄 · 하이픈 줄머리 · 접는 줄 끝 👆 · 📊 출처 두 줄. 숫자는 전부 계산값. */
{
  const bumpCard = cards.bump;
  const upNames = bumpCard.legs.find((l) => l.cls === "up").d;
  const downNames = bumpCard.legs.find((l) => l.cls === "down").d;
  const kakao = [
    `📈 토허구역 ${R.AREAS.length}곳, 언제부터 세느냐에 따라 1등이 바뀐다`,
    ``,
    ...YS.map((y) => `- '${y.slice(2)}년 초~ 1위 ${B(y).coTop.map(shortName).join("·")} ${pctTxt(B(y).coTop[0].v)}%`),
    ``,
    `해마다 순위 오른 곳 ${upNames}`,
    `해마다 순위 내린 곳 ${downNames} 👆`,
    ``,
    `📊 서울 ${nSeoul}개 구 + 경기 ${nGg}곳 토지거래허가구역`,
    `   한국부동산원 주간 매매가격지수 · ${endDot} 기준`,
  ].join("\n");
  mkdirSync(join(ROOT, "data/review/captions/_kakao"), { recursive: true });
  writeFileSync(join(ROOT, "data/review/captions/_kakao/tohuh-rise.txt"), kakao + "\n", "utf8");
}

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
for (const [k, c] of Object.entries(cards)) {
  writeFileSync(join(outDir, `tohuh-rise-${k}.json`), JSON.stringify(c, null, 2) + "\n", "utf8");
}
console.log(`✅ 이야기 카드 ${Object.keys(cards).length}장 — ${Object.keys(cards).map((k) => `tohuh-rise-${k}`).join(", ")}`);
console.log(`   순위 이동 제목: ${cards.bump.title.replace(/<[^>]+>/g, "")}`);
