#!/usr/bin/env node
/**
 * 수도권 예정 철도 — 역명 맞히기 시험지 (A4 · 3장) + 정답지 (3장)
 *
 * 오너 2026-10-25:
 *   "A4 사이즈로 시험문제를 만들고자 해. 모든 사진은 지금 실제 지도 위 노선카드 만든것을
 *    기반으로 해줘. 제목이나 공정률 등 다른 내용은 다 삭제하고, 첨부한 시험 문제처럼
 *    역명에 구멍이 뚫리도록 만들어줘."
 *     · GTX-A·B·C 세 노선을 하나의 지도 위에 → 1장
 *     · 신분당선 + 대장홍대선 → 1장
 *     · 월판선 + 신안산선 + 인동선 → 1장
 *
 * ── 🔴 지도는 **카드와 같은 계산**에서 나온다
 *   선형 잇기·역 배치는 build-rail-geomap.mjs 안에 수백 줄로 들어 있다(OSM 토막 잇기,
 *   닻 우선순위, 실좌표 대조 가드). 여기서 다시 짜면 시험지와 카드가 **서로 다른 지도**를
 *   그리게 된다. 그래서 빌더를 `--geo-out` 으로 한 번 돌려 경위도만 받아 쓴다 —
 *   그 모드는 카드 JSON·캡션을 하나도 쓰지 않는다(확정본을 건드릴 길이 없다).
 *
 * ── 카드에서 뺀 것 (오너 "다른 내용은 다 삭제")
 *   제목 · 부제 · 공정률 · 정보표 · 각주 · 출처 · 워터마크 · 환승 뱃지 · 가칭 점선 표시.
 *   환승 뱃지는 답의 힌트이고(「1·4·경의중앙·공항철도」면 서울역이다), 가칭 점선은 범례가
 *   있어야 읽힌다. 남긴 것: 실제 선형 · 시군구 면색 · 물 · 노선 이름표(어느 선인지는 알아야
 *   문제가 된다 — 첨부 예시도 「A노선」 꼬리표를 단다).
 *
 * ── ⚠️ 시군구 이름은 **역 이름과 겹치면 안 적는다**
 *   카드에서는 「의정부」 지명이 의정부역 옆에 있어도 문제없지만, 시험지에서는 그게 정답이다.
 *   그래서 지명 토막(「안산 상록구」→ 안산·상록)이 그 장의 어느 역 이름과 앞머리가 겹치면 뺀다.
 *
 * 쓰는 법:
 *   node scripts/build-rail-quiz.mjs            # → data/out/rail-quiz/ (PDF 2벌 + 쪽별 JPG)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { hanRiverPoints } from "./lib/han-river.mjs";
import { rings, ringCentroid, pointInGeom } from "./lib/rail-geo.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data/out/rail-quiz");
mkdirSync(OUT, { recursive: true });
const GEO_P = join(OUT, "_geo.json");

/* ① 카드와 같은 계산으로 기하를 받는다 */
execFileSync("node", [join(ROOT, "scripts/build-rail-geomap.mjs"), "--geo-out", GEO_P],
  { stdio: ["ignore", "ignore", "inherit"] });
const GEO = JSON.parse(readFileSync(GEO_P, "utf8"));
const byId = new Map(GEO.lines.map((L) => [L.key + (L.sub || ""), L]));
const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"));
const CAT = JSON.parse(readFileSync(join(ROOT, "templates/_shared/metro-lines.json"), "utf8"));
let WATER = [];
try { WATER = JSON.parse(readFileSync(join(ROOT, "data/geo/_water-osm.json"), "utf8")).물 || []; }
catch { console.log("ⓘ 물 자료가 없어 한강만 그립니다"); }
const HAN = hanRiverPoints(sgg.features.map((f) => ({ name: f.properties.name, rings: rings(f.geometry) })));

/* ── 카드와 같은 색 (build-rail-geomap SIDO_FILL · 물 · 경계선) */
const SIDO_FILL = { 서울특별시: "#e8e2d6", 경기도: "#f2efe8", 인천광역시: "#e3e0dc" };
const FILL_ETC = "#edeae3", WATER_FILL = "#cfe0ee", EDGE = "#dcd8cf";
const INK = "#141821", LEAD = "#9aa1ac", GRAY_LINE = "#c2c7cf";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const colorOf = (L) => CAT[L.lineKey]?.color || INK;

/* ── A4 @96dpi CSS px */
const PW = 794, PH = 1123, MG = 34;
const CW = PW - 2 * MG, CH = PH - 2 * MG, GAP = 14;

/* 노선 이름표 — 첨부 예시의 「A노선」 꼬리표 자리. 노선 이름만 적는다. */
const TAG = { gtxa: "GTX-A", gtxb: "GTX-B", gtxc: "GTX-C", daejang: "대장홍대선",
  "sinbundang-b0": "신분당선 · 북부 연장", "sinbundang-b1": "신분당선 · 남부 연장",
  wolpan: "월곶~판교선", indong: "인덕원~동탄선", sinansan: "신안산선" };

/* ── 쪽 구성. 패널 높이는 노선 모양(가로/세로 비)으로 나눈다. */
function natural(ids) {            // km 단위 가로·세로
  const pts = ids.flatMap((id) => { const L = byId.get(id);
    return [...L.chain, ...L.branch, ...L.through, ...L.stations]; });
  const la = pts.map((p) => p.lat), lo = pts.map((p) => p.lon);
  const k = Math.cos(((Math.min(...la) + Math.max(...la)) / 2) * Math.PI / 180);
  return { w: (Math.max(...lo) - Math.min(...lo)) * 111.32 * k, h: (Math.max(...la) - Math.min(...la)) * 110.57 };
}
function stack(idsList, x, y, w, h, minShare = 0.2) {
  const want = idsList.map((ids) => { const n = natural(ids); return (w - 90) * n.h / n.w + 90; });
  const avail = h - GAP * (idsList.length - 1);
  let hs = want.map((v) => Math.max(v, avail * minShare));
  const sum = hs.reduce((a, b) => a + b, 0);
  hs = hs.map((v) => Math.round(v * avail / sum));
  hs[hs.length - 1] = avail - hs.slice(0, -1).reduce((a, b) => a + b, 0);
  let cy = y;
  return idsList.map((ids, i) => { const p = { ids, x, y: cy, w, h: hs[i] }; cy += hs[i] + GAP; return p; });
}
const PAGES = [
  { id: "1_GTX", box: { w: 72, h: 25 }, panels: [{ ids: ["gtxa", "gtxb", "gtxc"], x: 0, y: 0, w: CW, h: CH, legend: true }] },
  { id: "2_대장홍대선_신분당선", box: { w: 78, h: 27 },
    panels: stack([["daejang"], ["sinbundang-b0"], ["sinbundang-b1"]], 0, 0, CW, CH, 0.24) },
  { id: "3_월판선_인동선_신안산선", box: { w: 70, h: 24 }, panels: (() => {
    const top = stack([["wolpan"]], 0, 0, CW, CH)[0];
    const n = natural(["wolpan"]);
    top.h = Math.round(Math.min(Math.max((CW - 90) * n.h / n.w + 110, CH * 0.27), CH * 0.36));
    /* 신안산선은 26역(서해선 직결 7역 포함)이라 인동선(17역)보다 자리가 더 든다 — 첫 판에서
       반반으로 나눴더니 국제테마파크·원시 빈칸이 서로 겹쳤다(2026-10-25). 폭을 47:53 으로 준다. */
    const by = top.h + GAP, bh = CH - by, half = Math.round((CW - GAP) * 0.47);
    return [top, { ids: ["indong"], x: 0, y: by, w: half, h: bh },
                 { ids: ["sinansan"], x: half + GAP, y: by, w: CW - half - GAP, h: bh,
                   /* 서해선 직결 끝(원시·국제테마파크)이 판 왼쪽 끝에 붙어 빈칸 둘 데가 없었다 */
                   padx: 0.8 }];
  })() },
];

/* ── 기하 도우미 */
const segX = (ax, ay, bx, by, cx, cy, dx, dy) => {
  const o = (px, py, qx, qy, rx, ry) => Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
  return o(ax, ay, bx, by, cx, cy) !== o(ax, ay, bx, by, dx, dy) && o(cx, cy, dx, dy, ax, ay) !== o(cx, cy, dx, dy, bx, by);
};
function segHitsRect(s, r) {
  const [x1, y1, x2, y2] = s;
  if (Math.max(x1, x2) < r.x0 || Math.min(x1, x2) > r.x1 || Math.max(y1, y2) < r.y0 || Math.min(y1, y2) > r.y1) return false;
  const inR = (x, y) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
  if (inR(x1, y1) || inR(x2, y2)) return true;
  return segX(x1, y1, x2, y2, r.x0, r.y0, r.x1, r.y0) || segX(x1, y1, x2, y2, r.x1, r.y0, r.x1, r.y1)
      || segX(x1, y1, x2, y2, r.x1, r.y1, r.x0, r.y1) || segX(x1, y1, x2, y2, r.x0, r.y1, r.x0, r.y0);
}
const grow = (r, g) => ({ x0: r.x0 - g, y0: r.y0 - g, x1: r.x1 + g, y1: r.y1 + g });
const rectsHit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
const circleHitsRect = (cx, cy, rad, r) => {
  const nx = Math.max(r.x0, Math.min(cx, r.x1)), ny = Math.max(r.y0, Math.min(cy, r.y1));
  return (nx - cx) ** 2 + (ny - cy) ** 2 < rad * rad;
};
const units = (t) => [...t].reduce((a, c) => a + (/[\x00-\x7F]/.test(c) ? 0.56 : 0.96), 0);

/* ── 패널 하나를 배치한다 (시험지·정답지가 같은 배치를 쓴다) */
function layoutPanel(P, BOX, pageNames) {
  const lines = P.ids.map((id) => ({ id, L: byId.get(id) }));
  const pts = lines.flatMap(({ L }) => [...L.chain, ...L.branch, ...L.through, ...L.stations]);
  const lat0 = Math.min(...pts.map((p) => p.lat)), lat1 = Math.max(...pts.map((p) => p.lat));
  const lon0 = Math.min(...pts.map((p) => p.lon)), lon1 = Math.max(...pts.map((p) => p.lon));
  const kx = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180);
  /* 빈칸이 들어갈 자리만큼 테두리 안쪽을 비운다. 위쪽은 이름표 자리까지. */
  const PADX = BOX.w * (P.padx ?? 0.5) + 10, PADT = BOX.h * 1.6 + 30, PADB = BOX.h * 1.4 + 14;
  const s = Math.min((P.w - 2 * PADX) / ((lon1 - lon0) * kx), (P.h - PADT - PADB) / (lat1 - lat0));
  const offX = P.x + (P.w - (lon1 - lon0) * kx * s) / 2;
  const offY = P.y + PADT + (P.h - PADT - PADB - (lat1 - lat0) * s) / 2;
  const X = (lon) => offX + (lon - lon0) * kx * s;
  const Y = (lat) => offY + (lat1 - lat) * s;
  const inv = (x, y) => [lon0 + (x - offX) / (kx * s), lat1 - (y - offY) / s];
  const kmPx = s / 110.57;
  const frame = { x0: P.x, y0: P.y, x1: P.x + P.w, y1: P.y + P.h };
  const xy = (q) => [X(q.lon), Y(q.lat)];

  /* 선 — 본선 > 지선 > 직결 > 기존 회색 (카드와 같은 위계) */
  const strokes = [];
  for (const { id, L } of lines) {
    const c = colorOf(L);
    for (const g of L.gray) strokes.push({ g: g.map(xy), c: GRAY_LINE, w: 3.6, gray: true });
    strokes.push({ g: L.chain.map(xy), c, w: 5.2 });
    if (L.branch.length) strokes.push({ g: L.branch.map(xy), c, w: 4.2 });
    if (L.through.length) strokes.push({ g: L.through.map(xy), c, w: 3.6 });
  }
  const segs = [];
  for (const st of strokes)
    for (let i = 1; i < st.g.length; i++) {
      const [x1, y1] = st.g[i - 1], [x2, y2] = st.g[i];
      if (!segHitsRect([x1, y1, x2, y2], frame)) continue;
      segs.push([x1, y1, x2, y2]);
    }

  /* 역 — 같은 이름은 한 점으로 (서울역·삼성·청량리는 두 노선이 만난다) */
  const nodes = new Map();
  for (const { id, L } of lines)
    for (const st of L.stations) {
      const n = nodes.get(st.name) || { name: st.name, xs: [], ys: [], ids: new Set(), colors: new Set() };
      n.xs.push(X(st.lon)); n.ys.push(Y(st.lat)); n.ids.add(id); n.colors.add(colorOf(L));
      nodes.set(st.name, n);
    }
  const N = [...nodes.values()].map((n) => ({
    name: n.name, x: n.xs.reduce((a, b) => a + b, 0) / n.xs.length, y: n.ys.reduce((a, b) => a + b, 0) / n.ys.length,
    shared: n.ids.size > 1, color: n.ids.size > 1 ? INK : [...n.colors][0],
  }));
  const MR = 5.4;                                   // 마커 반지름
  const markerR = (n) => (n.shared ? MR + 1.3 : MR);

  /* 이름표 · 범례 — 빈칸이 피해야 할 자리 */
  const labels = [];
  const pill = (text, color, x, y) => {
    const w = Math.round(units(text) * 13 + 22), h = 24;
    labels.push({ text, color, x0: x, y0: y, x1: x + w, y1: y + h });
    return w;
  };
  if (P.legend) {
    /* 범례는 **선이 가장 적게 지나는 모서리**에 둔다 */
    const tags = lines.map(({ id, L }) => ({ t: TAG[id], c: colorOf(L) }));
    const lw = tags.reduce((a, t) => a + units(t.t) * 13 + 22 + 6, 0), lh = 24;
    const corners = [[P.x + 12, P.y + 12], [P.x + P.w - 12 - lw, P.y + 12],
                     [P.x + 12, P.y + P.h - 12 - lh], [P.x + P.w - 12 - lw, P.y + P.h - 12 - lh]];
    const cost = ([cx, cy]) => { const r = grow({ x0: cx, y0: cy, x1: cx + lw, y1: cy + lh }, 40);
      return segs.filter((sg) => segHitsRect(sg, r)).length + N.filter((n) => circleHitsRect(n.x, n.y, 60, r)).length * 20; };
    const [lx, ly] = corners.sort((a, b) => cost(a) - cost(b))[0];
    let cx = lx;
    for (const t of tags) cx += pill(t.t, t.c, cx, ly) + 6;
  } else {
    const { id, L } = lines[0];
    pill(TAG[id], colorOf(L), P.x + 12, P.y + 12);
  }

  /* ── 빈칸 배치 — 가장 붐비는 역부터 */
  const placed = [];                                  // {n, r(rect), lead: [x1,y1,x2,y2]|null}
  const crowd = (n) => N.filter((m) => m !== n && Math.hypot(m.x - n.x, m.y - n.y) < 90).length;
  const order = [...N].sort((a, b) => crowd(b) - crowd(a) || a.name.localeCompare(b.name, "ko"));
  const inner = grow(frame, -5);
  const leadOf = (n, r) => {
    const nx = Math.max(r.x0, Math.min(n.x, r.x1)), ny = Math.max(r.y0, Math.min(n.y, r.y1));
    const d = Math.hypot(nx - n.x, ny - n.y);
    if (d < markerR(n) + 4) return null;             // 거의 닿아 있을 때만 선을 생략한다
    const ux = (nx - n.x) / d, uy = (ny - n.y) / d, r0 = markerR(n) + 1.5;
    return [n.x + ux * r0, n.y + uy * r0, nx, ny];
  };
  const rectDist = (m, r) => Math.hypot(Math.max(r.x0 - m.x, 0, m.x - r.x1), Math.max(r.y0 - m.y, 0, m.y - r.y1));
  const distSeg = (px, py, [x1, y1, x2, y2]) => {
    const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / L2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };
  /* 한 자리가 되는가 — 안 되면 null, 되면 그 자리의 흠(선 가림·지시선 건넘·헷갈림) */
  const fits = (n, r, lead, others, allowLine) => {
    if (r.x0 < inner.x0 || r.y0 < inner.y0 || r.x1 > inner.x1 || r.y1 > inner.y1) return null;
    const rg = grow(r, 3);
    if (labels.some((l) => rectsHit(grow(l, 4), r))) return null;
    if (others.some((p) => rectsHit(grow(p.r, 4), r))) return null;
    if (N.some((m) => circleHitsRect(m.x, m.y, markerR(m) + 3, r))) return null;
    if (others.some((p) => p.lead && segHitsRect(p.lead, rg))) return null;
    if (lead) {
      if (others.some((p) => segHitsRect(lead, grow(p.r, 2)))) return null;
      if (N.some((m) => m !== n && distSeg(m.x, m.y, lead) < markerR(m) + 2.5)) return null;
      if (others.some((p) => p.lead && segX(...lead, ...p.lead))) return null;
    }
    const lineHits = segs.filter((sg) => segHitsRect(sg, rg)).length;
    if (lineHits && !allowLine) return null;
    const leadHits = lead ? segs.filter((sg) => segX(...lead, ...sg)).length : 0;
    /* 🔴 **헷갈림** — 빈칸에서 가장 가까운 점이 제 역이 아니면, 시험지에서는 오답을 부른다.
       첫 판에서 월판선 「광명」 빈칸이 광명·만안 두 점 사이에 떠 있었다(2026-10-25). */
    const own = rectDist(n, r);
    const near = Math.min(...N.filter((m) => m !== n).map((m) => rectDist(m, r)), 1e9);
    const amb = near < own + 12 ? (own + 12 - near) : 0;
    return { lineHits, leadHits, amb };
  };
  const RADII = [4, 8, 13, 19, 26, 35, 46, 59, 74, 92, 114, 140, 170, 205, 245];
  const ANG = [...Array(32)].map((_, k) => (k * Math.PI) / 16);
  const bestFor = (n, others) => {
    for (const allowLine of [false, true]) {
      let best = null;
      for (const rr of RADII)
        for (const th of ANG) {
          const c = Math.cos(th), sn = Math.sin(th);
          const cx = n.x + c * (rr + markerR(n) + BOX.w / 2 * Math.abs(c) ** 0.6);
          const cy = n.y + sn * (rr + markerR(n) + BOX.h / 2 * Math.abs(sn) ** 0.6);
          const r = { x0: cx - BOX.w / 2, y0: cy - BOX.h / 2, x1: cx + BOX.w / 2, y1: cy + BOX.h / 2 };
          const lead = leadOf(n, r);
          const ok = fits(n, r, lead, others, allowLine);
          if (!ok) continue;
          /* 점수: 가깝게 · 지시선이 노선을 건너지 않게 · 다른 역과 안 헷갈리게 · 선을 안 가리게 */
          const score = rectDist(n, r) * 1.2 + (Math.abs(c) > 0.35 && Math.abs(sn) > 0.35 ? 3 : 0)
            /* 헷갈림은 **지시선이 없을 때** 무겁다. 지시선이 있으면 선이 어느 역인지 말해 준다 —
               둘을 똑같이 매겼더니 붐비는 곳의 빈칸이 멀리 쫓겨나 지시선만 길어졌다. */
            + ok.leadHits * 90 + ok.amb * (lead ? 1.5 : 9) + ok.lineHits * 400;
          if (!best || score < best.score) best = { r, lead, score, ok };
        }
      if (best) return best;
    }
    return null;
  };
  let forced = 0;
  for (const n of order) {
    let best = bestFor(n, placed);
    if (!best) {                                       // 최후 — 그래도 놓는다(검수가 잡는다)
      forced++;
      const r = { x0: n.x + 8, y0: n.y - BOX.h / 2, x1: n.x + 8 + BOX.w, y1: n.y + BOX.h / 2 };
      best = { r, lead: null, score: 1e6, ok: { lineHits: 99, leadHits: 0, amb: 0 } };
    }
    placed.push({ n, r: best.r, lead: best.lead, score: best.score, ok: best.ok });
  }
  /* 욕심쟁이 배치는 **먼저 놓은 빈칸이 뒤에 올 역의 좋은 자리를 뺏는다.**
     그래서 하나씩 빼서 다시 놓아 보고, 나아지면 바꾼다 — 더 안 바뀔 때까지(최대 6바퀴). */
  for (let pass = 0; pass < 6; pass++) {
    let moved = 0;
    for (let i = 0; i < placed.length; i++) {
      const others = placed.filter((_, j) => j !== i);
      const b = bestFor(placed[i].n, others);
      if (b && b.score < placed[i].score - 0.5) { placed[i] = { n: placed[i].n, r: b.r, lead: b.lead, score: b.score, ok: b.ok }; moved++; }
    }
    if (!moved) break;
  }
  /* 🔴 **비켜 주기** — 자리를 못 찾은(또는 선을 가린) 빈칸은, 가까운 이웃 하나를 빼고 자기를
     먼저 놓은 뒤 그 이웃을 다시 놓아 본다. 둘의 점수 합이 줄면 바꾼다.
     첫 판에서 신안산선 원시가 시우·국제테마파크 빈칸과 그 지시선에 둘러싸여 갈 곳이 없었다. */
  for (let round = 0; round < 3; round++) {
    const bad = placed.filter((p) => p.score >= 400);
    if (!bad.length) break;
    for (const p of bad) {
      const i = placed.indexOf(p);
      const nb = placed.filter((q) => q !== p)
        .sort((a, b) => Math.hypot(a.n.x - p.n.x, a.n.y - p.n.y) - Math.hypot(b.n.x - p.n.x, b.n.y - p.n.y)).slice(0, 8);
      for (const q of nb) {
        const rest = placed.filter((z) => z !== p && z !== q);
        const b1 = bestFor(p.n, rest);
        if (!b1) continue;
        const np = { n: p.n, r: b1.r, lead: b1.lead, score: b1.score, ok: b1.ok };
        const b2 = bestFor(q.n, [...rest, np]);
        if (!b2 || b1.score + b2.score >= p.score + q.score - 1) continue;
        placed[i] = np;
        placed[placed.indexOf(q)] = { n: q.n, r: b2.r, lead: b2.lead, score: b2.score, ok: b2.ok };
        break;
      }
    }
  }
  forced = placed.filter((p) => p.score >= 1e6).length;
  if (process.env.RQ_DEBUG) for (const p of placed) if (p.score >= 1e6 || p.ok.lineHits || p.ok.leadHits || p.ok.amb)
    console.log(`   · ${P.ids.join('+')} ${p.n.name} score=${p.score.toFixed(0)} 가림=${p.ok.lineHits} 건넘=${p.ok.leadHits} 헷갈림=${p.ok.amb.toFixed(0)}`);
  for (const p of placed) p.lineHits = p.ok.lineHits;

  /* ── 시군구 이름 — 빈칸·선·점을 피해서, 그 장의 역 이름과 겹치면 안 적는다 */
  const hint = (nm) => {
    const parts = nm.split(" ").map((p) => p.replace(/(시|구|군)$/, "")).filter((p) => p.length >= 2);
    return parts.some((p) => pageNames.some((sn) => sn.startsWith(p) || p.startsWith(sn)));
  };
  const sggTexts = [], nameBoxes = [];
  const vis = (q) => q[0] > inv(frame.x0, 0)[0] - 0.02 && q[0] < inv(frame.x1, 0)[0] + 0.02
    && q[1] < inv(0, frame.y0)[1] + 0.02 && q[1] > inv(0, frame.y1)[1] - 0.02;
  for (const f of sgg.features) {
    if (!rings(f.geometry).some((r) => r.some(vis))) continue;
    const nm = f.properties.name.replace(/^(.+?)시(.+?구)$/, "$1 $2").replace(/시$/, "");
    if (hint(nm)) continue;
    let c0 = ringCentroid(f.geometry); if (!c0) continue;
    /* 확대한 판에서는 시군구 중심이 판 밖일 때가 흔하다(신분당 북부 — 강남·서초가 빠졌다).
       그럴 땐 **판 안에 든 경계점들의 평균**에서 찾기 시작한다(카드의 토막 지도와 같은 처방). */
    {
      const [cx0, cy0] = [X(c0[0]), Y(c0[1])];
      if (cx0 < inner.x0 || cx0 > inner.x1 || cy0 < inner.y0 || cy0 > inner.y1) {
        const inb = rings(f.geometry).flat().map((q) => [X(q[0]), Y(q[1])])
          .filter(([x, y]) => x > inner.x0 + 20 && x < inner.x1 - 20 && y > inner.y0 + 20 && y < inner.y1 - 20);
        if (inb.length >= 3) c0 = inv(inb.reduce((a, q) => a + q[0], 0) / inb.length, inb.reduce((a, q) => a + q[1], 0) / inb.length);
      }
    }
    const fs = 10.5, nw = units(nm) * fs + 6, nh = fs + 4;
    const cand = [[X(c0[0]), Y(c0[1])]];
    for (const r of [20, 34, 50, 68, 90]) for (let k = 0; k < 8; k++)
      cand.push([X(c0[0]) + Math.cos(k * Math.PI / 4) * r * 1.4, Y(c0[1]) + Math.sin(k * Math.PI / 4) * r]);
    const ok = cand.find(([x, y]) => {
      const r = { x0: x - nw / 2, y0: y - nh / 2, x1: x + nw / 2, y1: y + nh / 2 };
      if (r.x0 < inner.x0 + 4 || r.x1 > inner.x1 - 4 || r.y0 < inner.y0 + 4 || r.y1 > inner.y1 - 4) return false;
      const rg = grow(r, 5);
      if (segs.some((sg) => segHitsRect(sg, rg))) return false;
      if (N.some((m) => circleHitsRect(m.x, m.y, markerR(m) + 6, r))) return false;
      if (placed.some((p) => rectsHit(grow(p.r, 6), r) || (p.lead && segHitsRect(p.lead, rg)))) return false;
      if (labels.some((l) => rectsHit(grow(l, 6), r)) || nameBoxes.some((b) => rectsHit(grow(b, 8), r))) return false;
      return pointInGeom(inv(x, y), f.geometry);
    });
    if (!ok) continue;
    nameBoxes.push({ x0: ok[0] - nw / 2, y0: ok[1] - nh / 2, x1: ok[0] + nw / 2, y1: ok[1] + nh / 2 });
    sggTexts.push({ x: ok[0], y: ok[1], nm, fs });
  }

  return { P, X, Y, vis, kmPx, frame, strokes, N, markerR, labels, placed, sggTexts, forced };
}

/* ── 그리기 */
function renderPanel(lay, mode, BOX, uid) {
  const { P, X, Y, vis, kmPx, frame, strokes, N, markerR, labels, placed, sggTexts } = lay;
  const d = (g) => g.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const dl = (g) => g.map((q, i) => `${i ? "L" : "M"}${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`).join("");
  let o = `<clipPath id="c${uid}"><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="12"/></clipPath>`;
  o += `<g clip-path="url(#c${uid})"><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="${FILL_ETC}"/>`;
  for (const f of sgg.features)
    for (const r of rings(f.geometry)) {
      if (!r.some(vis)) continue;
      o += `<path d="${dl(r)}Z" fill="${SIDO_FILL[f.properties?.sido] || FILL_ETC}" stroke="${EDGE}" stroke-width="0.8"/>`;
    }
  for (const w of WATER) {
    if (w.kind === "coastline" || !w.g.some((q) => vis([q.lon, q.lat]))) continue;
    o += `<path d="${dl(w.g.map((q) => [q.lon, q.lat]))}Z" fill="${WATER_FILL}"/>`;
  }
  o += `<path d="${dl(HAN)}" fill="none" stroke="${WATER_FILL}" stroke-width="${Math.max(3, Math.min(11, kmPx * 0.75)).toFixed(1)}" stroke-linecap="round"/>`;
  for (const t of sggTexts)
    o += `<text x="${t.x.toFixed(1)}" y="${t.y.toFixed(1)}" font-size="${t.fs}" font-weight="700" fill="#b2b7bf" text-anchor="middle" dominant-baseline="central" letter-spacing="0.3">${esc(t.nm)}</text>`;
  for (const st of strokes)
    o += `<path d="${d(st.g)}" fill="none" stroke="${st.c}" stroke-width="${st.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (const p of placed)
    if (p.lead) o += `<path d="M${p.lead[0].toFixed(1)},${p.lead[1].toFixed(1)}L${p.lead[2].toFixed(1)},${p.lead[3].toFixed(1)}" stroke="${LEAD}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  for (const n of N)
    o += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${markerR(n)}" fill="#ffffff" stroke="${n.color}" stroke-width="${n.shared ? 2.8 : 2.4}"/>`;
  for (const p of placed) {
    const { r, n } = p;
    o += `<rect x="${r.x0.toFixed(1)}" y="${r.y0.toFixed(1)}" width="${BOX.w}" height="${BOX.h}" rx="5" fill="#ffffff" stroke="${n.color}" stroke-width="1.5"/>`;
    if (mode === "answer") {
      const fs = Math.min(12.5, (BOX.w - 8) / units(n.name));
      o += `<text x="${((r.x0 + r.x1) / 2).toFixed(1)}" y="${((r.y0 + r.y1) / 2 + 0.5).toFixed(1)}" font-size="${fs.toFixed(2)}" font-weight="700" fill="${INK}" text-anchor="middle" dominant-baseline="central" letter-spacing="-0.3">${esc(n.name)}</text>`;
    }
  }
  for (const l of labels)
    o += `<rect x="${l.x0}" y="${l.y0}" width="${l.x1 - l.x0}" height="${l.y1 - l.y0}" rx="12" fill="${l.color}"/>`
      + `<text x="${((l.x0 + l.x1) / 2).toFixed(1)}" y="${((l.y0 + l.y1) / 2 + 0.5).toFixed(1)}" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${esc(l.text)}</text>`;
  o += `</g><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="12" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
  return o;
}

/* ── 쪽마다 배치 → 시험지·정답지 */
const report = [];
const pagesSvg = { quiz: [], answer: [] };
for (const pg of PAGES) {
  const pageNames = [...new Set(pg.panels.flatMap((P) => P.ids.flatMap((id) => byId.get(id).stations.map((s) => s.name))))];
  const lays = pg.panels.map((P) => layoutPanel(P, pg.box, pageNames));
  for (const mode of ["quiz", "answer"]) {
    let body = lays.map((lay, i) => renderPanel(lay, mode, pg.box, `${pg.id.slice(0, 1)}${i}${mode[0]}`)).join("");
    if (mode === "answer")
      body += `<text x="${CW}" y="-12" font-size="12" font-weight="800" fill="#c8102e" text-anchor="end">정답</text>`;
    pagesSvg[mode].push(`<section class="page"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}">`
      + `<rect width="${PW}" height="${PH}" fill="#ffffff"/><g transform="translate(${MG},${MG})">${body}</g></svg></section>`);
  }
  /* 가드 — 패널마다 **카드에 그려진 역이 빠짐없이 한 번씩** 빈칸이 됐는가 */
  for (const [i, P] of pg.panels.entries()) {
    const want = [...new Set(P.ids.flatMap((id) => byId.get(id).stations.map((s) => s.name)))].sort();
    const got = lays[i].placed.map((p) => p.n.name).sort();
    if (JSON.stringify(want) !== JSON.stringify(got))
      throw new Error(`${pg.id} ${P.ids.join("+")}: 빈칸 ${got.length}개 ≠ 역 ${want.length}개`);
  }
  const boxes = lays.reduce((a, l) => a + l.placed.length, 0);
  const lineCover = lays.reduce((a, l) => a + l.placed.filter((p) => p.lineHits).length, 0);
  const forced = lays.reduce((a, l) => a + l.forced, 0);
  report.push({ page: pg.id, boxes, lineCover, forced, names: lays.flatMap((l) => l.placed.map((p) => p.n.name)) });
  console.log(`${forced || lineCover ? "⚠️ " : "✅"} ${pg.id} — 빈칸 ${boxes}개 · 노선을 가린 빈칸 ${lineCover} · 강제 배치 ${forced}`);
}
writeFileSync(join(OUT, "_report.json"), JSON.stringify(report, null, 1));

/* ── HTML → PDF · 쪽별 JPG */
const FONT = pathToFileURL(join(ROOT, "templates/_shared/fonts/PretendardVariable.woff2")).href;
const html = (pages) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@font-face{font-family:"Pretendard";src:url("${FONT}") format("woff2-variations");font-weight:45 920;}
@page{size:A4;margin:0} html,body{margin:0;padding:0;background:#fff}
.page{width:210mm;height:297mm;overflow:hidden;break-after:page} .page:last-child{break-after:auto}
svg{display:block;width:210mm;height:297mm;font-family:"Pretendard",sans-serif}
</style></head><body>${pages.join("")}</body></html>`;
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const { chromium } = require("playwright-core");
const PINNED = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const browser = await chromium.launch(existsSync(PINNED) ? { executablePath: PINNED } : {});
const NAME = { quiz: "수도권철도_역명시험지", answer: "수도권철도_역명시험지_정답" };
for (const mode of ["quiz", "answer"]) {
  const hp = join(OUT, `${NAME[mode]}.html`);
  writeFileSync(hp, html(pagesSvg[mode]));
  const page = await browser.newPage({ viewport: { width: PW, height: PH }, deviceScaleFactor: 2480 / PW });
  await page.goto(pathToFileURL(hp).href);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: join(OUT, `${NAME[mode]}.pdf`), preferCSSPageSize: true, printBackground: true });
  const secs = page.locator("section.page");
  for (let i = 0; i < PAGES.length; i++)
    await secs.nth(i).screenshot({ path: join(OUT, `${NAME[mode]}_${PAGES[i].id}.jpg`), type: "jpeg", quality: 92 });
  await page.close();
}
await browser.close();
console.log(`\n📝 시험지 ${PAGES.length}장 + 정답지 ${PAGES.length}장 → data/out/rail-quiz/`);
