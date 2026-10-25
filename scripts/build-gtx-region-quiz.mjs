#!/usr/bin/env node
/**
 * 수도권 백지도 위 GTX-A·B·C — 역명 + 시·군·구 이름 맞히기 (A4 2쪽) + 정답지
 *
 * 오너 2026-10-25: "서울, 수도권 지도 위에 gtx-abc를 올린 지도를 만들어서 문제로 만들어줄 수 있니?"
 *   → 빈칸: 역명 + 시·구 이름 (오너 선택) · 범위: GTX 가 지나는 범위 (오너 선택)
 *
 * ── 두 쪽 (오너 2026-10-25 2차로 바뀌었다)
 *     ① 수도권(A4 세로) — GTX 37역 **전부** + 경기 시·군. 서울은 구 경계만 긋고 이름은 안 묻는다.
 *     ② 서울(A4 가로) — 서울 25구만. 노선·역·이웃 시·도 경계·범례 없이.
 *   인천은 시험 범위가 아니다 — 면색만 깔고 구 경계도 빈칸도 없다.
 *   (1차는 서울 안 역 13개를 ②로 뺐는데, 오너가 「노선 문제는 모두 1번에서」로 정리했다.)
 *
 * ── 무엇을 다시 쓰나
 *   선형·역 경위도: build-rail-geomap.mjs --geo-out (카드와 같은 계산 · 카드 출력은 안 건드린다)
 *   경계선 분류: build-blank-map.mjs 의 「짝 없는 변은 양옆을 찔러 본다」 규칙
 *   빈칸 배치: build-rail-quiz.mjs 의 점수(거리·지시선 건넘·헷갈림·노선 가림) + 다시 놓기 + 비켜 세우기
 *   ⚠️ 세 스크립트에 비슷한 도우미가 나뉘어 있다. 넷째가 생기면 scripts/lib 로 뽑는다.
 *
 * ── 빈칸 두 가지
 *   역 = 노선색 실선 빈칸(역 점 옆) · 시·군·구 = 회색 점선 빈칸(그 구역 안쪽 가장 넓은 자리)
 *
 * 쓰는 법:
 *   node scripts/build-gtx-region-quiz.mjs   # → data/out/gtx-region-quiz/
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { hanRiverPoints } from "./lib/han-river.mjs";
import { rings, pointInGeom } from "./lib/rail-geo.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data/out/gtx-region-quiz");
mkdirSync(OUT, { recursive: true });
const GEO_P = join(OUT, "_geo.json");
execFileSync("node", [join(ROOT, "scripts/build-rail-geomap.mjs"), "--geo-out", GEO_P], { stdio: ["ignore", "ignore", "inherit"] });
const GEO = JSON.parse(readFileSync(GEO_P, "utf8"));
const LINES = ["gtxa", "gtxb", "gtxc"].map((k) => GEO.lines.find((L) => L.key === k && !L.sub));
const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"));
const CAT = JSON.parse(readFileSync(join(ROOT, "templates/_shared/metro-lines.json"), "utf8"));
let WATER = [];
try { WATER = JSON.parse(readFileSync(join(ROOT, "data/geo/_water-osm.json"), "utf8")).물 || []; } catch {}
const HAN = hanRiverPoints(sgg.features.map((f) => ({ name: f.properties.name, rings: rings(f.geometry) })));

/* ── 톤 — 철도 시험지 · 백지도와 같다 */
const SIDO_FILL = { 서울특별시: "#e8e2d6", 경기도: "#f2efe8", 인천광역시: "#e3e0dc" };
const FILL_ETC = "#edeae3", WATER_FILL = "#cfe0ee", CTX_EDGE = "#d6d1c6";
const INK = "#141821", INNER = "#9aa0a9", LEAD = "#9aa1ac", UNIT_BOX = "#7d838c";
/* 경계선을 칸칸이 긋는 시·도(주인공). 쪽마다 다르다 — 아래 PAGES 의 focus.
   인천은 시험 범위가 아니다(오너 2026-10-25 2차) — 어느 쪽에서도 주인공이 아니다. */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const units = (t) => [...t].reduce((a, c) => a + (/[\x00-\x7F]/.test(c) ? 0.56 : 0.96), 0);
const cityOf = (n) => n.match(/^(.+?시)(.+구)$/)?.[1] || n;
const groupOf = (f) => (f.properties.sido === "경기도" ? cityOf(f.properties.name) : f.properties.name);
const colorOf = (L) => CAT[L.lineKey]?.color || INK;
const TAG = { gtxa: "GTX-A", gtxb: "GTX-B", gtxc: "GTX-C" };
const SEOUL = sgg.features.filter((f) => f.properties.sido === "서울특별시");
const inSeoul = (q) => SEOUL.some((f) => pointInGeom([q.lon, q.lat], f.geometry));

/* ── 기하 도우미 */
const segX = (ax, ay, bx, by, cx, cy, dx, dy) => {
  const o = (px, py, qx, qy, rx, ry) => Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
  return o(ax, ay, bx, by, cx, cy) !== o(ax, ay, bx, by, dx, dy) && o(cx, cy, dx, dy, ax, ay) !== o(cx, cy, dx, dy, bx, by);
};
function segHitsRect([x1, y1, x2, y2], r) {
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
const distSeg = (px, py, [x1, y1, x2, y2]) => {
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / L2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};
const pip = (x, y, r) => { let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; }
  return c; };
const polysOf = (f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates);

/* ── 한 쪽 */
function buildPage(pg) {
  const FOCUS = pg.focus;
  const [PW, PH] = pg.orient === "landscape" ? [1123, 794] : [794, 1123];
  const MG = 34, P = { x: MG, y: MG, w: PW - 2 * MG, h: PH - 2 * MG };
  const BOX = pg.box, UBOX = pg.ubox;
  /* 투영 */
  const { lon0, lon1, lat0, lat1 } = pg.bbox;
  const kx = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180);
  const padl = pg.padl ?? pg.padx, padr = pg.padr ?? pg.padx;
  const s = Math.min((P.w - padl - padr) / ((lon1 - lon0) * kx), (P.h - pg.padt - pg.padb) / (lat1 - lat0));
  const offX = P.x + padl + (P.w - padl - padr - (lon1 - lon0) * kx * s) / 2;
  const offY = P.y + pg.padt + (P.h - pg.padt - pg.padb - (lat1 - lat0) * s) / 2;
  const X = (lon) => offX + (lon - lon0) * kx * s, Y = (lat) => offY + (lat1 - lat) * s;
  const inv = (x, y) => [lon0 + (x - offX) / (kx * s), lat1 - (y - offY) / s];
  const kmPx = s / 110.57;
  const [vl0, vt0] = inv(P.x, P.y), [vl1, vt1] = inv(P.x + P.w, P.y + P.h);
  const vis = (q) => q[0] > vl0 - 0.05 && q[0] < vl1 + 0.05 && q[1] < vt0 + 0.05 && q[1] > vt1 - 0.05;
  const feats = sgg.features.filter((f) => rings(f.geometry).some((r) => r.some(vis)));
  const frame = { x0: P.x, y0: P.y, x1: P.x + P.w, y1: P.y + P.h }, inner = grow(frame, -5);

  /* ── 경계선 분류 (build-blank-map 과 같은 규칙, 주인공 = 수도권 세 시·도) */
  const K = (q) => `${q[0].toFixed(7)},${q[1].toFixed(7)}`;
  const own = (f) => ({ sido: f.properties.sido, grp: FOCUS.has(f.properties.sido) ? f.properties.sido + "/" + groupOf(f) : f.properties.sido });
  const edges = new Map();
  for (const f of feats) for (const r of rings(f.geometry)) for (let i = 1; i < r.length; i++) {
    const a = r[i - 1], b = r[i]; if (a[0] === b[0] && a[1] === b[1]) continue;
    const ka = K(a), kb = K(b), key = ka < kb ? ka + "|" + kb : kb + "|" + ka;
    const e = edges.get(key) || { owners: [] }; e.owners.push(own(f)); edges.set(key, e);
  }
  const bbOf = (f) => { const q = rings(f.geometry).flat();
    return [Math.min(...q.map((v) => v[0])), Math.min(...q.map((v) => v[1])), Math.max(...q.map((v) => v[0])), Math.max(...q.map((v) => v[1]))]; };
  const FB = feats.map((f) => ({ f, bb: bbOf(f), ...own(f) }));
  const whoAt = (x, y, not) => FB.find((o) => o !== not && x >= o.bb[0] && x <= o.bb[2] && y >= o.bb[1] && y <= o.bb[3]
    && polysOf(o.f).some((p) => pip(x, y, p[0]) && !p.slice(1).some((h) => pip(x, y, h)))) || null;
  const EPS = 0.75 / s;                                       // 화면 약 0.75px
  const ringPxArea = (r) => Math.abs(r.reduce((acc, q, i) => { const n = r[(i + 1) % r.length];
    return acc + X(q[0]) * Y(n[1]) - X(n[0]) * Y(q[1]); }, 0) / 2);
  const cls = { outer: [], sido: [], inner: [], ctx: [] }, seen = new Set();
  for (const o of FB)
    for (const r of polysOf(o.f).map((p) => p[0]).filter((r2) => ringPxArea(r2) >= 6))
      for (let i = 1; i < r.length; i++) {
        const a = r[i - 1], b = r[i]; if (a[0] === b[0] && a[1] === b[1]) continue;
        const ka = K(a), kb = K(b), key = ka < kb ? ka + "|" + kb : kb + "|" + ka;
        const e = edges.get(key); let other;
        if (e.owners.length >= 2) {
          if (seen.has(key)) continue; seen.add(key);
          const rest = e.owners.filter((w) => !(w.sido === o.sido && w.grp === o.grp));
          other = rest[0] || { sido: o.sido, grp: o.grp };
          if (!FOCUS.has(o.sido) && FOCUS.has(other.sido)) { seen.delete(key); continue; }
        } else {
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          const dx = (b[0] - a[0]) * kx, dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
          const nx = (-dy / L) / kx * EPS, ny = (dx / L) * EPS;
          other = whoAt(mx + nx, my + ny, o) || whoAt(mx - nx, my - ny, o);
          if (other && !(other.sido === o.sido && other.grp === o.grp)) {
            const oF = FOCUS.has(o.sido), tF = FOCUS.has(other.sido);
            if (oF !== tF) { if (!oF) continue; }
            else if (`${o.grp}` > `${other.grp}`) continue;
          }
        }
        const fa = FOCUS.has(o.sido), fb = other && FOCUS.has(other.sido), ed = [a, b];
        if (fa && fb) { if (o.grp !== other.grp) (o.sido !== other.sido ? cls.sido : cls.inner).push(ed); }
        else if (fa || fb) cls.outer.push(ed);
        else if (!other || other.sido !== o.sido) cls.ctx.push(ed);
      }
  const P2 = (q) => [X(q[0]), Y(q[1])];
  const segsOf = (list) => list.map(([a, b]) => [...P2(a), ...P2(b)]);
  const borderSegs = segsOf([...cls.outer, ...cls.sido, ...cls.inner]);

  /* ── 노선 */
  const strokes = [], railSegs = [];
  for (const L of pg.rail ? LINES : []) {
    const c = colorOf(L), xy = (q) => [X(q.lon), Y(q.lat)];
    strokes.push({ g: L.chain.map(xy), c, w: 5.2 });
    if (L.branch.length) strokes.push({ g: L.branch.map(xy), c, w: 4.2 });
  }
  for (const st of strokes) for (let i = 1; i < st.g.length; i++) {
    const sg = [...st.g[i - 1], ...st.g[i]];
    if (segHitsRect(sg, frame)) railSegs.push(sg);
  }

  /* ── 역 — 같은 이름은 한 점(서울역·삼성·청량리) */
  const nodes = new Map();
  for (const L of pg.rail ? LINES : []) for (const st of L.stations) {
    const n = nodes.get(st.name) || { name: st.name, xs: [], ys: [], lines: new Set(), colors: new Set(), seoul: inSeoul(st) };
    n.xs.push(X(st.lon)); n.ys.push(Y(st.lat)); n.lines.add(L.key); n.colors.add(colorOf(L)); nodes.set(st.name, n);
  }
  const MR = 5.4;
  const ST = [...nodes.values()].map((n) => ({ kind: "st", name: n.name, seoul: n.seoul,
    x: n.xs.reduce((a, b) => a + b, 0) / n.xs.length, y: n.ys.reduce((a, b) => a + b, 0) / n.ys.length,
    shared: n.lines.size > 1, color: n.lines.size > 1 ? INK : [...n.colors][0] }))
    .filter((n) => n.x > frame.x0 - 20 && n.x < frame.x1 + 20 && n.y > frame.y0 - 20 && n.y < frame.y1 + 20);
  const markerR = (n) => (n.shared ? MR + 1.3 : MR);
  const askSt = ST.filter((n) => pg.askStation(n) && n.x > inner.x0 && n.x < inner.x1 && n.y > inner.y0 && n.y < inner.y1);

  /* ── 시·군·구 — 그 구역 안(화면 안)에서 경계와 가장 먼 점 */
  const groups = new Map();
  for (const f of feats) if (FOCUS.has(f.properties.sido) && pg.askUnit(f)) {
    const g = f.properties.sido + "/" + groupOf(f);
    if (!groups.has(g)) groups.set(g, { name: groupOf(f), sido: f.properties.sido, fs: [] });
    groups.get(g).fs.push(f);
  }
  const frameSegs = [[inner.x0, inner.y0, inner.x1, inner.y0], [inner.x1, inner.y0, inner.x1, inner.y1],
                     [inner.x1, inner.y1, inner.x0, inner.y1], [inner.x0, inner.y1, inner.x0, inner.y0]];
  const UN = [];
  for (const [, g] of groups) {
    const polys = g.fs.flatMap(polysOf).map((p) => p.map((r) => r.map(P2)));
    const inside = (x, y) => polys.some((p) => pip(x, y, p[0]) && !p.slice(1).some((h) => pip(x, y, h)));
    const all = polys.flatMap((p) => p[0]);
    const bx0 = Math.max(inner.x0, Math.min(...all.map((q) => q[0]))), bx1 = Math.min(inner.x1, Math.max(...all.map((q) => q[0])));
    const by0 = Math.max(inner.y0, Math.min(...all.map((q) => q[1]))), by1 = Math.min(inner.y1, Math.max(...all.map((q) => q[1])));
    if (bx1 - bx0 < 8 || by1 - by0 < 8) continue;
    const near = [...borderSegs, ...frameSegs].filter(([x1, y1, x2, y2]) => Math.max(x1, x2) > bx0 - 40 && Math.min(x1, x2) < bx1 + 40
      && Math.max(y1, y2) > by0 - 40 && Math.min(y1, y2) < by1 + 40);
    const step = Math.max(1.5, Math.max(bx1 - bx0, by1 - by0) / 44);
    let best = null;
    const spots = [];
    for (let x = bx0 + step / 2; x < bx1; x += step) for (let y = by0 + step / 2; y < by1; y += step) {
      if (!inside(x, y)) continue;
      const d = Math.min(...near.map((sg) => distSeg(x, y, sg)));
      spots.push({ x, y, d });
      if (!best || d > best.d) best = { x, y, d };
    }
    /* 화면에 조금만 걸친 구역(가장자리)은 묻지 않는다 — 빈칸 하나 들어갈 자리도 없다 */
    if (!best || best.d < pg.minUnitD) continue;
    /* 🔴 **자리 후보는 구역 안 여러 곳**이다. 가장 넓은 한 점만 닻으로 두면, 그 점을 역 빈칸이 먼저
       덮었을 때 갈 곳이 없다 — 남양주시 한가운데를 평내호평 빈칸이 차지해, 넓은 북쪽이 비어 있는데도
       자리를 못 찾았다(3판). 그래서 경계에서 충분히 떨어진 안쪽 점들을 모두 후보로 둔다. */
    const roomy = spots.filter((q) => q.d >= Math.min(best.d, UBOX.h * 0.55)).sort((a, b) => b.d - a.d);
    UN.push({ kind: "unit", name: g.name, sido: g.sido, x: best.x, y: best.y, d: best.d, inside, spots: roomy });
  }

  /* ── 범례 · 이름표 — 빈칸이 피할 자리 */
  const labels = [];
  const pillW = (t) => Math.round(units(t) * 13 + 22);
  if (pg.legend) {
    const items = LINES.map((L) => ({ t: TAG[L.key], c: colorOf(L) }));
    const lw = items.reduce((a, it) => a + pillW(it.t) + 6, 0) + 150, lh = 24;
    /* 빈칸 범례는 역·구역 두 종류가 한 쪽에 같이 나올 때만 뜻이 있다(②는 구역뿐이라 안 단다). */
    const corners = [[P.x + 12, P.y + 12], [P.x + P.w - 12 - lw, P.y + 12], [P.x + 12, P.y + P.h - 12 - lh], [P.x + P.w - 12 - lw, P.y + P.h - 12 - lh]];
    const cost = ([cx, cy]) => { const r = grow({ x0: cx, y0: cy, x1: cx + lw, y1: cy + lh }, 30);
      return railSegs.filter((sg) => segHitsRect(sg, r)).length + ST.filter((n) => circleHitsRect(n.x, n.y, 50, r)).length * 20
        + UN.filter((u) => circleHitsRect(u.x, u.y, 30, r)).length * 8; };
    const [lx, ly] = corners.sort((a, b) => cost(a) - cost(b))[0];
    let cx = lx;
    for (const it of items) { const w = pillW(it.t); labels.push({ kind: "pill", text: it.t, color: it.c, x0: cx, y0: ly, x1: cx + w, y1: ly + lh }); cx += w + 6; }
    labels.push({ kind: "key", x0: cx + 4, y0: ly, x1: cx + 150, y1: ly + lh });
  }
  if (pg.zoomRect) labels.push({ kind: "zoom", ...pg.zoomRect(X, Y), noBlock: true });

  /* ── 빈칸 배치 */
  const NODES = [...askSt, ...UN];
  const placed = [];
  const sizeOf = (n) => (n.kind === "st" ? BOX : UBOX);
  const leadOf = (n, r) => {
    const nx = Math.max(r.x0, Math.min(n.x, r.x1)), ny = Math.max(r.y0, Math.min(n.y, r.y1));
    const d = Math.hypot(nx - n.x, ny - n.y);
    if (n.kind === "unit") return d < 1 ? null : [n.x, n.y, nx, ny];
    if (d < markerR(n) + 4) return null;
    const ux = (nx - n.x) / d, uy = (ny - n.y) / d, r0 = markerR(n) + 1.5;
    return [n.x + ux * r0, n.y + uy * r0, nx, ny];
  };
  const rectDist = (m, r) => Math.hypot(Math.max(r.x0 - m.x, 0, m.x - r.x1), Math.max(r.y0 - m.y, 0, m.y - r.y1));
  const fits = (n, r, lead, others, allowLine) => {
    if (r.x0 < inner.x0 || r.y0 < inner.y0 || r.x1 > inner.x1 || r.y1 > inner.y1) return null;
    const rg = grow(r, 3);
    if (labels.some((l) => !l.noBlock && rectsHit(grow(l, 4), r))) return null;
    if (others.some((p) => rectsHit(grow(p.r, 4), r))) return null;
    if (ST.some((m) => circleHitsRect(m.x, m.y, markerR(m) + 3, r))) return null;
    if (others.some((p) => p.lead && segHitsRect(p.lead, rg))) return null;
    if (others.some((p) => p.n.kind === "unit" && p.lead && circleHitsRect((p.anchor || p.n).x, (p.anchor || p.n).y, 4, r))) return null;
    if (lead) {
      if (others.some((p) => segHitsRect(lead, grow(p.r, 2)))) return null;
      if (ST.some((m) => m !== n && distSeg(m.x, m.y, lead) < markerR(m) + 2.5)) return null;
      if (others.some((p) => p.lead && segX(...lead, ...p.lead))) return null;
    }
    const lineHits = railSegs.filter((sg) => segHitsRect(sg, rg)).length;
    if (lineHits && !allowLine) return null;
    const leadHits = lead ? railSegs.filter((sg) => segX(...lead, ...sg)).length : 0;
    let amb = 0, out = 0;
    /* 지시선 없는 구역 빈칸은 **가운데가 그 구역 안**이어야 한다 — 4판에서 「부평구」 빈칸이 닻만
       살짝 물고 몸통은 부천 땅에 앉아, 부천을 부평구로 읽게 만들었다. */
    if (n.kind === "unit" && !lead && !n.inside((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)) return null;
    if (n.kind === "st") {
      const me = rectDist(n, r), near = Math.min(...ST.filter((m) => m !== n).map((m) => rectDist(m, r)), 1e9);
      amb = near < me + 12 ? me + 12 - near : 0;
    } else {
      out = [[r.x0, r.y0], [r.x1, r.y0], [r.x0, r.y1], [r.x1, r.y1], [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2]]
        .filter(([x, y]) => !n.inside(x, y)).length;
    }
    return { lineHits, leadHits, amb, out };
  };
  const RADII = [0, 4, 8, 13, 19, 26, 35, 46, 59, 74, 92, 114, 140, 170, 205, 245];
  const ANG = [...Array(32)].map((_, k) => (k * Math.PI) / 16);
  const bestFor = (n, others) => {
    const B = sizeOf(n);
    /* 구역 빈칸 — 먼저 **구역 안 넓은 자리**에 지시선 없이 */
    if (n.kind === "unit") {
      let best = null;
      for (const q of n.spots) {
        const r = { x0: q.x - B.w / 2, y0: q.y - B.h / 2, x1: q.x + B.w / 2, y1: q.y + B.h / 2 };
        const ok = fits(n, r, null, others, false);
        if (!ok) continue;
        const score = (n.d - q.d) * 0.6 + ok.out * 8;
        if (!best || score < best.score) best = { r, lead: null, score, ok };
      }
      if (best) return best;
    }
    /* 지시선을 쓸 때의 닻 — 구역은 **남의 빈칸에 안 덮인** 넓은 점에서 끈다(덮인 점에서 끌면 지시선이
       그 빈칸을 뚫는다 — 동대문구·부평구가 그래서 갈 곳을 잃었다). 역은 제 점 그대로. */
    const anchors = n.kind === "st" ? [n]
      : [...n.spots.filter((q) => !others.some((p) => q.x > p.r.x0 - 4 && q.x < p.r.x1 + 4 && q.y > p.r.y0 - 4 && q.y < p.r.y1 + 4)
          && !ST.some((m) => Math.hypot(m.x - q.x, m.y - q.y) < markerR(m) + 5)).slice(0, 4), n];
    for (const allowLine of [false, true]) {
      let best = null;
      for (const an of anchors) {
      const n0 = n; n = an === n0 ? n0 : { ...n0, x: an.x, y: an.y };
      for (const rr of RADII) for (const th of (rr === 0 ? [0] : ANG)) {
        if (n.kind === "st" && rr === 0) continue;
        const c = Math.cos(th), sn = Math.sin(th);
        const cx = n.kind === "st" ? n.x + c * (rr + markerR(n) + B.w / 2 * Math.abs(c) ** 0.6) : n.x + c * rr * 1.4;
        const cy = n.kind === "st" ? n.y + sn * (rr + markerR(n) + B.h / 2 * Math.abs(sn) ** 0.6) : n.y + sn * rr;
        const r = { x0: cx - B.w / 2, y0: cy - B.h / 2, x1: cx + B.w / 2, y1: cy + B.h / 2 };
        const lead = leadOf(n, r);
        const ok = fits(n, r, lead, others, allowLine);
        if (!ok) continue;
        const score = n.kind === "st"
          ? rectDist(n, r) * 1.2 + Math.max(0, rectDist(n, r) - 40) * 6
            + (Math.abs(c) > 0.35 && Math.abs(sn) > 0.35 ? 3 : 0) + ok.leadHits * 90 + ok.amb * (lead ? 1.5 : 9) + ok.lineHits * 400
          /* 구역 빈칸은 **조금 삐져나오는 쪽**이 지시선보다 낫다 — 1판에서 군포·안산 빈칸이 멀리 나가
             점 하나와 긴 선으로 이어지니 어느 구역 이름인지 오히려 헷갈렸다. */
          : rr * 0.7 + ok.out * 8 + (lead ? 48 + rectDist(n, r) * 0.8 : 0) + ok.leadHits * 90 + ok.lineHits * 400;
        if (!best || score < best.score) best = { r, lead, score, ok, anchor: n === n0 ? null : { x: n.x, y: n.y } };
      }
      n = n0;
      }
      if (best) return best;
    }
    return null;
  };
  const crowd = (n) => NODES.filter((m) => m !== n && Math.hypot(m.x - n.x, m.y - n.y) < 90).length;
  for (const n of [...NODES].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "st" ? -1 : 1) || crowd(b) - crowd(a) || a.name.localeCompare(b.name, "ko"))) {
    const b = bestFor(n, placed);
    if (b) placed.push({ n, ...b });
    else { const B = sizeOf(n); placed.push({ n, r: { x0: n.x + 8, y0: n.y - B.h / 2, x1: n.x + 8 + B.w, y1: n.y + B.h / 2 }, lead: null, score: 1e6, ok: { lineHits: 99 } }); }
  }
  for (let pass = 0; pass < 6; pass++) {
    let moved = 0;
    for (let i = 0; i < placed.length; i++) {
      const b = bestFor(placed[i].n, placed.filter((_, j) => j !== i));
      if (b && b.score < placed[i].score - 0.5) { placed[i] = { n: placed[i].n, ...b }; moved++; }
    }
    if (!moved) break;
  }
  for (let round = 0; round < 4; round++) {
    /* 지시선을 단 구역 빈칸도 「나쁜 자리」로 친다 — 구역 이름은 그 땅 안에 있어야 바로 읽힌다
       (부평구 빈칸이 지시선을 달고 부천 땅에 가 있었다 · 4판). */
    const bad = placed.filter((p) => p.score >= 400 || (p.n.kind === "unit" && p.lead)); if (!bad.length) break;
    for (const p of bad) {
      const nb = placed.filter((q) => q !== p).sort((a, b) => Math.hypot(a.n.x - p.n.x, a.n.y - p.n.y) - Math.hypot(b.n.x - p.n.x, b.n.y - p.n.y)).slice(0, 8);
      /* 이웃 여덟을 **다 재 보고** 합이 가장 작은 쪽을 고른다. 처음 되는 쪽을 고르니 인천시청 빈칸이
         부평구에게 자리를 내주고 멀리 쫓겨나 긴 지시선이 인천 땅을 가로질렀다(2판). */
      let pick = null;
      for (const q of nb) {
        const rest = placed.filter((z) => z !== p && z !== q);
        const b1 = bestFor(p.n, rest); if (!b1) continue;
        const np = { n: p.n, ...b1 }, b2 = bestFor(q.n, [...rest, np]);
        if (!b2) continue;
        /* 역 빈칸은 비켜 주더라도 **제 역에서 멀리 가면 안 된다** — 구역 이름표에 밀려 인천시청 빈칸이
           신도림 옆까지 쫓겨났다(3판). 역 이름은 위치가 곧 답이라, 멀어지면 문제가 틀린다. */
        if (q.n.kind === "st" && rectDist(q.n, b2.r) > 30) continue;
        const tot = b1.score + b2.score;
        if (tot < p.score + q.score - 1 && (!pick || tot < pick.tot)) pick = { q, np, nq: { n: q.n, ...b2 }, tot };
      }
      if (pick) { placed[placed.indexOf(p)] = pick.np; placed[placed.indexOf(pick.q)] = pick.nq; }
    }
  }

  /* ── 그리기 */
  const dl = (g) => g.map((q, i) => `${i ? "L" : "M"}${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`).join("");
  const dp = (g) => g.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const edgePath = (list) => list.map(([a, b]) => `M${X(a[0]).toFixed(1)},${Y(a[1]).toFixed(1)}L${X(b[0]).toFixed(1)},${Y(b[1]).toFixed(1)}`).join("");
  const body = (mode) => {
    let o = `<clipPath id="k${pg.id}"><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="12"/></clipPath>`;
    o += `<g clip-path="url(#k${pg.id})"><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="${FILL_ETC}"/>`;
    for (const f of feats) { const fill = SIDO_FILL[f.properties.sido] || FILL_ETC;
      for (const r of rings(f.geometry)) o += `<path d="${dl(r)}Z" fill="${fill}" stroke="${fill}" stroke-width="0.7" stroke-linejoin="round"/>`; }
    if (pg.ctx !== false) o += `<path d="${edgePath(cls.ctx)}" fill="none" stroke="${CTX_EDGE}" stroke-width="1" stroke-linecap="round"/>`;
    o += `<path d="${edgePath(cls.inner)}" fill="none" stroke="${INNER}" stroke-width="1" stroke-linecap="round"/>`;
    o += `<path d="${edgePath(cls.sido)}" fill="none" stroke="#5b616b" stroke-width="1.4" stroke-linecap="round"/>`;
    o += `<path d="${edgePath(cls.outer)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
    for (const w of WATER) {
      if (w.kind === "coastline") continue;
      const g = w.g.map((q) => [X(q.lon), Y(q.lat)]);
      if (!g.some(([x, y]) => x > P.x && x < P.x + P.w && y > P.y && y < P.y + P.h)) continue;
      const a = Math.abs(g.reduce((acc, q, i) => { const n = g[(i + 1) % g.length]; return acc + q[0] * n[1] - n[0] * q[1]; }, 0) / 2);
      if (a < 40) continue;
      o += `<path d="${dp(g)}Z" fill="${WATER_FILL}"/>`;
    }
    o += `<path d="${dl(HAN)}" fill="none" stroke="${WATER_FILL}" stroke-width="${Math.max(3, Math.min(16, kmPx * 0.6)).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (const l of labels) if (l.kind === "zoom")
      o += `<rect x="${l.x0.toFixed(1)}" y="${l.y0.toFixed(1)}" width="${(l.x1 - l.x0).toFixed(1)}" height="${(l.y1 - l.y0).toFixed(1)}" rx="6" fill="none" stroke="${INK}" stroke-width="1.2" stroke-dasharray="5 4"/>`
        + `<rect x="${(l.x1 - 46).toFixed(1)}" y="${(l.y0 - 11).toFixed(1)}" width="46" height="20" rx="10" fill="${INK}"/>`
        + `<text x="${(l.x1 - 23).toFixed(1)}" y="${(l.y0 - 0.5).toFixed(1)}" font-size="11" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">확대 ②</text>`;
    for (const st of strokes) o += `<path d="${dp(st.g)}" fill="none" stroke="${st.c}" stroke-width="${st.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (const p of placed) if (p.lead) {
      if (p.n.kind === "unit") { const a = p.anchor || p.n; o += `<circle cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="2.6" fill="${UNIT_BOX}"/>`; }
      o += `<path d="M${p.lead.map((v) => v.toFixed(1)).slice(0, 2).join(",")}L${p.lead.map((v) => v.toFixed(1)).slice(2).join(",")}" stroke="${LEAD}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
    }
    for (const n of ST) o += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${markerR(n)}" fill="#fff" stroke="${n.color}" stroke-width="${n.shared ? 2.8 : 2.4}"/>`;
    for (const p of placed) {
      const { r, n } = p, B = sizeOf(n), st = n.kind === "st";
      o += `<rect x="${r.x0.toFixed(1)}" y="${r.y0.toFixed(1)}" width="${B.w}" height="${B.h}" rx="${st ? 5 : 4}" fill="#fff" stroke="${st ? n.color : UNIT_BOX}" stroke-width="${st ? 1.5 : 1.2}"${st ? "" : ' stroke-dasharray="3.2 2.2"'}/>`;
      if (mode === "answer") {
        const fs = Math.min(st ? 12.5 : 11.5, (B.w - 7) / units(n.name));
        o += `<text x="${((r.x0 + r.x1) / 2).toFixed(1)}" y="${((r.y0 + r.y1) / 2 + 0.5).toFixed(1)}" font-size="${fs.toFixed(2)}" font-weight="700" fill="${st ? INK : "#4b5160"}" text-anchor="middle" dominant-baseline="central" letter-spacing="-0.3">${esc(n.name)}</text>`;
      }
    }
    for (const l of labels) {
      if (l.kind === "pill") o += `<rect x="${l.x0}" y="${l.y0}" width="${l.x1 - l.x0}" height="${l.y1 - l.y0}" rx="12" fill="${l.color}"/>`
        + `<text x="${((l.x0 + l.x1) / 2).toFixed(1)}" y="${((l.y0 + l.y1) / 2 + 0.5).toFixed(1)}" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${esc(l.text)}</text>`;
      if (l.kind === "key") {
        const y = (l.y0 + l.y1) / 2;
        o += `<rect x="${l.x0 - 2}" y="${l.y0}" width="${l.x1 - l.x0 + 6}" height="${l.y1 - l.y0}" rx="6" fill="#fff" fill-opacity="0.85"/>`
          + `<rect x="${l.x0 + 4}" y="${y - 6}" width="18" height="12" rx="3" fill="#fff" stroke="${INK}" stroke-width="1.3"/>`
          + `<text x="${l.x0 + 26}" y="${y + 0.5}" font-size="11" font-weight="700" fill="${INK}" dominant-baseline="central">역</text>`
          + `<rect x="${l.x0 + 50}" y="${y - 6}" width="18" height="12" rx="3" fill="#fff" stroke="${UNIT_BOX}" stroke-width="1.2" stroke-dasharray="3.2 2.2"/>`
          + `<text x="${l.x0 + 72}" y="${y + 0.5}" font-size="11" font-weight="700" fill="${INK}" dominant-baseline="central">시·군·구</text>`;
      }
    }
    o += `</g><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="12" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
    if (mode === "answer") o += `<text x="${P.x + P.w}" y="${P.y - 12}" font-size="12" font-weight="800" fill="#c8102e" text-anchor="end">정답</text>`;
    return `<section class="page ${pg.orient}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}"><rect width="${PW}" height="${PH}" fill="#fff"/>${o}</svg></section>`;
  };
  const bad = placed.filter((p) => p.score >= 400);
  if (process.env.GQ_DEBUG) for (const p of bad) {
    const others = placed.filter((q) => q !== p), B = sizeOf(p.n), why = {};
    for (const rr of RADII) for (const th of ANG) {
      const cx = p.n.x + Math.cos(th) * rr * 1.4, cy = p.n.y + Math.sin(th) * rr;
      const r = { x0: cx - B.w / 2, y0: cy - B.h / 2, x1: cx + B.w / 2, y1: cy + B.h / 2 };
      const lead = leadOf(p.n, r), rg = grow(r, 3);
      const k = (r.x0 < inner.x0 || r.y0 < inner.y0 || r.x1 > inner.x1 || r.y1 > inner.y1) ? "판밖"
        : labels.some((l) => !l.noBlock && rectsHit(grow(l, 4), r)) ? "범례"
        : others.some((q) => rectsHit(grow(q.r, 4), r)) ? "빈칸"
        : ST.some((m) => circleHitsRect(m.x, m.y, markerR(m) + 3, r)) ? "역점"
        : others.some((q) => q.lead && segHitsRect(q.lead, rg)) ? "남의지시선"
        : lead && others.some((q) => segHitsRect(lead, grow(q.r, 2))) ? "내지시선-빈칸"
        : lead && ST.some((m) => m !== p.n && distSeg(m.x, m.y, lead) < markerR(m) + 2.5) ? "내지시선-역점"
        : lead && others.some((q) => q.lead && segX(...lead, ...q.lead)) ? "지시선교차"
        : railSegs.some((sg) => segHitsRect(sg, rg)) ? "노선" : "OK";
      why[k] = (why[k] || 0) + 1;
    }
    console.log(`   · ${p.n.name} @${p.n.x.toFixed(0)},${p.n.y.toFixed(0)}`, JSON.stringify(why));
    { const r = { x0: p.n.x - B.w / 2, y0: p.n.y - B.h / 2, x1: p.n.x + B.w / 2, y1: p.n.y + B.h / 2 };
      console.log("      중심에서 부딪히는 빈칸:", others.filter((q) => rectsHit(grow(q.r, 4), r)).map((q) => `${q.n.name}[${q.r.x0.toFixed(0)},${q.r.y0.toFixed(0)},${(q.r.x1-q.r.x0).toFixed(0)}x${(q.r.y1-q.r.y0).toFixed(0)}]`).join(" ")); }
  }
  console.log(`${bad.length ? "⚠️ " : "✅"} ${pg.id} — 역 빈칸 ${askSt.length} · 시·군·구 빈칸 ${UN.length} · 노선 가림/강제 ${bad.length}`
    + (bad.length ? ` (${bad.map((p) => p.n.name).join(", ")})` : ""));
  return { quiz: body("quiz"), answer: body("answer"), askSt, UN, placed, bad };
}

/* ── 쪽 정의 */
const allSt = LINES.flatMap((L) => [...L.stations, ...L.chain, ...L.branch]);
const bbOfPts = (pts) => ({ lon0: Math.min(...pts.map((p) => p.lon)), lon1: Math.max(...pts.map((p) => p.lon)),
                            lat0: Math.min(...pts.map((p) => p.lat)), lat1: Math.max(...pts.map((p) => p.lat)) });
const seoulPts = SEOUL.flatMap((f) => rings(f.geometry).flat().map((q) => ({ lon: q[0], lat: q[1] })));
const SEOUL_BB = bbOfPts(seoulPts);
/* 오너 2026-10-25 2차: "인천 행정구역은 시험범위 아니니 전체 지워줘. GTX 노선 문제는 모두 1번
   수도권 사진에서 작성하게 해주고, 2번에서는 서울 행정구역만 나오게 해줘."
   → ① 역 37칸 전부 + 경기 시·군 · 서울은 구 경계만(이름은 ②에서) · 인천은 면색만(경계·빈칸 없음)
   → ② 서울 25구만 — 노선·역·이웃 시·도 경계·범례 없이 */
const PAGES = [
  { id: "1_수도권", orient: "portrait", bbox: bbOfPts(allSt), padx: 46, padt: 64, padb: 40,
    /* 인천대입구~부평 역 빈칸이 판 왼쪽 끝에 몰린다 — 여백을 왼쪽으로(합은 거의 같아 축척 4% 남짓) */
    padl: 104, padr: 22,
    focus: new Set(["서울특별시", "경기도"]), rail: true, legend: true,
    box: { w: 66, h: 22 }, ubox: { w: 48, h: 18 }, minUnitD: 9,
    askStation: () => true, askUnit: (f) => f.properties.sido === "경기도" },
  { id: "2_서울", orient: "landscape", bbox: SEOUL_BB, padx: 30, padt: 30, padb: 30,
    focus: new Set(["서울특별시"]), rail: false, legend: false, ctx: false,
    box: { w: 74, h: 25 }, ubox: { w: 70, h: 25 }, minUnitD: 12,
    askStation: () => false, askUnit: (f) => f.properties.sido === "서울특별시" },
];
const built = PAGES.map(buildPage);

/* ── 가드 — 묻는 것이 빠지거나 두 번 나오지 않는가 */
const stAsked = built.flatMap((b) => b.askSt.map((n) => n.name)).sort();
const stAll = [...new Set(LINES.flatMap((L) => L.stations.map((s) => s.name)))].sort();
if (JSON.stringify(stAsked) !== JSON.stringify(stAll))
  throw new Error(`역 빈칸 ${stAsked.length}개 ≠ GTX 역 ${stAll.length}개 — 빠졌거나 두 번 물었다`);
if (built[1].UN.length !== 25) throw new Error(`서울 확대도의 구 빈칸이 ${built[1].UN.length}개다 — 25개여야 한다`);
if (built[1].askSt.length) throw new Error("② 서울 쪽에 역 빈칸이 있다 — 역은 ①에서만 묻는다");
if (built[0].UN.some((u) => u.sido !== "경기도")) throw new Error("① 에 경기 밖 구역 빈칸이 있다 — 인천은 시험 범위가 아니다");
if (built.some((b) => b.bad.length)) console.log("⚠️ 노선을 가리거나 자리를 못 찾은 빈칸이 있다 — 눈으로 확인할 것");

/* ── PDF · JPG */
const FONT = pathToFileURL(join(ROOT, "templates/_shared/fonts/PretendardVariable.woff2")).href;
const html = (secs) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@font-face{font-family:"Pretendard";src:url("${FONT}") format("woff2-variations");font-weight:45 920;}
@page{size:A4 portrait;margin:0} @page land{size:A4 landscape;margin:0}
html,body{margin:0;padding:0;background:#fff}
.page{overflow:hidden;break-after:page} .page:last-child{break-after:auto}
.page.portrait{width:210mm;height:297mm} .page.landscape{width:297mm;height:210mm;page:land}
svg{display:block;width:100%;height:100%;font-family:"Pretendard",sans-serif}
</style></head><body>${secs.join("")}</body></html>`;
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const { chromium } = require("playwright-core");
const PINNED = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const browser = await chromium.launch(existsSync(PINNED) ? { executablePath: PINNED } : {});
const NAME = { quiz: "수도권_GTX_지도문제", answer: "수도권_GTX_지도문제_정답" };
for (const mode of ["quiz", "answer"]) {
  const hp = join(OUT, `${NAME[mode]}.html`);
  writeFileSync(hp, html(built.map((b) => b[mode])));
  const page = await browser.newPage({ viewport: { width: 1123, height: 1123 }, deviceScaleFactor: 3508 / 1123 });
  await page.goto(pathToFileURL(hp).href);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: join(OUT, `${NAME[mode]}.pdf`), preferCSSPageSize: true, printBackground: true });
  const secs = page.locator("section.page");
  for (let i = 0; i < PAGES.length; i++)
    await secs.nth(i).screenshot({ path: join(OUT, `${NAME[mode]}_${PAGES[i].id}.jpg`), type: "jpeg", quality: 92 });
  await page.close();
}
await browser.close();
console.log(`\n🗺️ 문제 ${PAGES.length}쪽 + 정답 ${PAGES.length}쪽 → data/out/gtx-region-quiz/`);
