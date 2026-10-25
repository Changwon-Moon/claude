#!/usr/bin/env node
/**
 * 서울 · 경기도 백지도 (A4) + 정답지 — 철도 역명 시험지와 **같은 톤앤매너**
 *
 * 오너 2026-10-25: "백지도도 새로 만들어줄래? 저기 이상한 제목들 제거하고 방금 만든 철도
 *   문제지와 같은 톤앤매너로 말야." (첨부: 「SEOUL MAP」 세로 회전본 · 「경기도지도」)
 *
 * ── 무엇이 같은가 (scripts/build-rail-quiz.mjs 와)
 *   A4 · 둥근 테두리 판 · 시·도 면색(서울 #e8e2d6 · 경기 #f2efe8 · 인천 #e3e0dc) · 물 #cfe0ee ·
 *   Pretendard · 정답지 우상단의 빨간 「정답」. 제목·워터마크는 없다.
 *
 * ── 무엇을 정했나
 *   · **서울은 가로(A4 가로)로 놓는다.** 첨부 예시는 세로 종이에 지도를 90° 돌려 넣었는데,
 *     돌린 지도는 북쪽이 옆을 본다 — 시험지에서 방향이 틀리면 그 자체가 오답을 부른다.
 *     서울은 동서 37km · 남북 30km 라 가로 종이에 그대로 놓아야 가장 크게 나온다.
 *   · **경기도는 31개 시·군으로 묶는다.** 경계 자료는 구 단위(47칸)라 수원·성남·화성 등의
 *     구 경계가 섞여 있다. 같은 시의 구끼리 **공유하는 변**을 지워 시 하나로 합친다
 *     (자료가 위상을 공유한다 — 이웃 구의 경계 정점이 정확히 같다. 2026-10-25 확인).
 *   · 서울·인천은 경기도 판에서 **안 쪼개고 한 덩어리**로 깔고 이름도 안 쓴다(배경이다).
 *   · 한강은 구 경계보다 **위에** 칠한다. 구 경계가 강 한가운데를 지나는데, 그 선이 강 위에
 *     보이면 강이 둘로 갈라진 것처럼 읽힌다.
 *
 * 쓰는 법:
 *   node scripts/build-blank-map.mjs     # → data/out/blank-map/ (백지도·정답 PDF + 쪽별 JPG)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { hanRiverPoints } from "./lib/han-river.mjs";
import { rings } from "./lib/rail-geo.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data/out/blank-map");
mkdirSync(OUT, { recursive: true });
const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"));
let WATER = [];
try { WATER = JSON.parse(readFileSync(join(ROOT, "data/geo/_water-osm.json"), "utf8")).물 || []; }
catch { console.log("ⓘ 물 자료가 없어 한강만 그립니다"); }
const HAN = hanRiverPoints(sgg.features.map((f) => ({ name: f.properties.name, rings: rings(f.geometry) })));

/* 철도 시험지와 같은 색 */
const SIDO_FILL = { 서울특별시: "#e8e2d6", 경기도: "#f2efe8", 인천광역시: "#e3e0dc" };
const FILL_ETC = "#edeae3", WATER_FILL = "#cfe0ee", CTX_EDGE = "#d6d1c6";
const INK = "#141821", INNER = "#8d939c";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const units = (t) => [...t].reduce((a, c) => a + (/[\x00-\x7F]/.test(c) ? 0.56 : 0.96), 0);
const cityOf = (n) => n.match(/^(.+?시)(.+구)$/)?.[1] || n;   // 수원시장안구 → 수원시

const MG = 34;
const PAGES = [
  { id: "1_서울", orient: "landscape", focus: "서울특별시", group: (f) => f.properties.name, fsMax: 17, pad: 30 },
  { id: "2_경기도", orient: "portrait", focus: "경기도", group: (f) => cityOf(f.properties.name), fsMax: 13.5, pad: 22 },
];

/* ── 한 쪽을 그린다 */
function buildPage(pg) {
  const [PW, PH] = pg.orient === "landscape" ? [1123, 794] : [794, 1123];
  const P = { x: MG, y: MG, w: PW - 2 * MG, h: PH - 2 * MG };
  const focusF = sgg.features.filter((f) => f.properties.sido === pg.focus);
  const pts = focusF.flatMap((f) => rings(f.geometry).flat());
  const lon0 = Math.min(...pts.map((q) => q[0])), lon1 = Math.max(...pts.map((q) => q[0]));
  const lat0 = Math.min(...pts.map((q) => q[1])), lat1 = Math.max(...pts.map((q) => q[1]));
  const kx = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180);
  const s = Math.min((P.w - 2 * pg.pad) / ((lon1 - lon0) * kx), (P.h - 2 * pg.pad) / (lat1 - lat0));
  const offX = P.x + (P.w - (lon1 - lon0) * kx * s) / 2, offY = P.y + (P.h - (lat1 - lat0) * s) / 2;
  const X = (lon) => offX + (lon - lon0) * kx * s, Y = (lat) => offY + (lat1 - lat) * s;
  const kmPx = s / 110.57;
  const vLon0 = lon0 - (offX - P.x) / (kx * s) - 0.05, vLon1 = lon1 + (P.x + P.w - (offX + (lon1 - lon0) * kx * s)) / (kx * s) + 0.05;
  const vLat0 = lat0 - 0.6 * (P.h / s) / 2, vLat1 = lat1 + 0.6 * (P.h / s) / 2;
  const vis = (q) => q[0] > vLon0 && q[0] < vLon1 && q[1] > vLat0 && q[1] < vLat1;
  const feats = sgg.features.filter((f) => rings(f.geometry).some((r) => r.some(vis)));

  /* ── 변 분류 — 같은 변을 가진 칸들이 누구인가로 선의 종류를 정한다 */
  const K = (q) => `${q[0].toFixed(7)},${q[1].toFixed(7)}`;
  const edges = new Map();                                   // key → {a,b,owners:[{sido,grp}]}
  for (const f of feats) {
    const sido = f.properties.sido, grp = sido === pg.focus ? pg.group(f) : sido;
    for (const r of rings(f.geometry))
      for (let i = 1; i < r.length; i++) {
        const a = r[i - 1], b = r[i]; if (a[0] === b[0] && a[1] === b[1]) continue;
        const ka = K(a), kb = K(b), key = ka < kb ? ka + "|" + kb : kb + "|" + ka;
        const e = edges.get(key) || { a, b, ka, kb, owners: [] };
        e.owners.push({ sido, grp }); edges.set(key, e);
      }
  }
  /* ⚠️ **위상이 다 맞지는 않는다.** 서울 1,047변 중 양쪽이 같은 정점을 공유하는 변은 388개뿐이라,
     「두 칸이 같은 변을 가졌나」만 보면 구 경계 상당수가 바깥 경계(굵은 잉크)로 잘못 분류됐다
     (첫 판 — 종로·성북, 강남·서초 사이에 굵은 선이 끊겨 보였다).
     그래서 짝이 없는 변은 **변의 양옆을 직접 찔러** 본다 — 변 가운데에서 바깥쪽으로 조금 나간 점이
     어느 칸 안에 있는지. 그 칸이 같은 시면 지우고, 다른 시면 안쪽 경계로 **한쪽 칸의 변만** 그린다
     (두 칸이 저마다 제 변을 갖고 있어 둘 다 그리면 겹선이 된다). */
  const bbOf = (f) => { const q = rings(f.geometry).flat();
    return [Math.min(...q.map((v) => v[0])), Math.min(...q.map((v) => v[1])), Math.max(...q.map((v) => v[0])), Math.max(...q.map((v) => v[1]))]; };
  const FB = feats.map((f) => ({ f, bb: bbOf(f), sido: f.properties.sido,
    grp: f.properties.sido === pg.focus ? pg.group(f) : f.properties.sido }));
  const pip = (x, y, r) => { let c = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; }
    return c; };
  const whoAt = (x, y, not) => FB.find((o) => o !== not && x >= o.bb[0] && x <= o.bb[2] && y >= o.bb[1] && y <= o.bb[3]
    && (o.f.geometry.type === "Polygon" ? [o.f.geometry.coordinates] : o.f.geometry.coordinates)
      .some((poly) => pip(x, y, poly[0]) && !poly.slice(1).some((h) => pip(x, y, h)))) || null;
  const EPS = pg.focus === "서울특별시" ? 0.0005 : 0.0009;          // 약 45m · 80m — 1px 안팎
  const cls = { outer: [], inner: [], ctx: [] };
  const seen = new Set();
  /* 바깥 고리만 경계선을 긋는다. 구멍(안쪽 고리)과 화면에서 티끌만 한 고리는 자료의 찌꺼기다 —
     첫 판에서 용산구 한가운데 잉크 점 하나가 찍혔다. */
  const ringPxArea = (r) => Math.abs(r.reduce((acc, q, i) => { const n = r[(i + 1) % r.length];
    return acc + X(q[0]) * Y(n[1]) - X(n[0]) * Y(q[1]); }, 0) / 2);
  const outerRings = (f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates)
    .map((p) => p[0]).filter((r) => ringPxArea(r) >= 6);
  for (const o of FB)
    for (const r of outerRings(o.f))
      for (let i = 1; i < r.length; i++) {
        const a = r[i - 1], b = r[i]; if (a[0] === b[0] && a[1] === b[1]) continue;
        const ka = K(a), kb = K(b), key = ka < kb ? ka + "|" + kb : kb + "|" + ka;
        const e = edges.get(key);
        let other;                                    // 이 변 건너편 칸
        if (e.owners.length >= 2) {
          if (seen.has(key)) continue;                // 공유 변은 한 번만
          seen.add(key);
          const own2 = e.owners.filter((w) => !(w.sido === o.sido && w.grp === o.grp));
          other = own2.length ? { sido: own2[0].sido, grp: own2[0].grp } : { sido: o.sido, grp: o.grp };
          if (o.sido !== pg.focus && other.sido === pg.focus) { seen.delete(key); continue; }   // 주인공 쪽에서 그린다
        } else {
          /* 짝 없는 변 — 양옆을 찔러 본다 */
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          const dx = (b[0] - a[0]) * kx, dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
          const nx = (-dy / L) / kx * EPS, ny = (dx / L) * EPS;
          const w1 = whoAt(mx + nx, my + ny, o), w2 = whoAt(mx - nx, my - ny, o);
          /* 제 칸이 아닌 쪽 — 한쪽은 대개 제 칸 안이다(그쪽은 whoAt 이 o 를 빼고 보므로 null) */
          other = w1 || w2;
          if (other && !(other.sido === o.sido && other.grp === o.grp)) {
            /* 겹선 막기 — 두 칸이 저마다 제 변을 가진 경계는 한쪽 변만 그린다.
               ⚠️ 주인공(서울·경기) 바깥 경계는 **언제나 주인공 쪽 변**을 쓴다. 이름순으로 고르니
                  성남 쪽 변이 뽑혀 서울 남쪽 경계에 꼬리가 삐져나왔다(2026-10-25 2판). */
            const oF = o.sido === pg.focus, tF = other.sido === pg.focus;
            if (oF !== tF) { if (!oF) continue; }
            else if (`${o.sido}/${o.grp}` > `${other.sido}/${other.grp}`) continue;
          } else if (!other && o.sido !== pg.focus) {
            /* 건너편이 빈 곳(바다·자료 밖) — 맥락 칸의 해안은 그대로 둔다 */
          }
        }
        const fa = o.sido === pg.focus, fb = other && other.sido === pg.focus;
        const ed = { a, b, ka, kb };
        if (fa || fb) {
          if (fa && fb) { if (o.grp !== other.grp) cls.inner.push(ed); }   // 같은 시의 구 경계는 지운다
          else cls.outer.push(ed);                                         // 도 경계 · 해안
        } else if (!other || other.sido !== o.sido) cls.ctx.push(ed);
      }
  /* 토막 변을 이어 긴 선으로 — 꺾이는 자리가 둥글게 이어진다 */
  const chains = (list) => {
    const adj = new Map(), used = new Set();
    list.forEach((e, i) => { for (const k of [e.ka, e.kb]) { if (!adj.has(k)) adj.set(k, []); adj.get(k).push(i); } });
    const out = [];
    list.forEach((e0, i0) => {
      if (used.has(i0)) return;
      used.add(i0);
      const line = [e0.a, e0.b]; let headK = e0.kb, tailK = e0.ka;
      const grow = (atEnd) => {
        for (;;) {
          const k = atEnd ? headK : tailK;
          const nxt = (adj.get(k) || []).find((j) => !used.has(j));
          if (nxt === undefined) return;
          used.add(nxt);
          const e = list[nxt], far = e.ka === k ? e.b : e.a, farK = e.ka === k ? e.kb : e.ka;
          if (atEnd) { line.push(far); headK = farK; } else { line.unshift(far); tailK = farK; }
        }
      };
      grow(true); grow(false);
      out.push(line);
    });
    return out;
  };
  const dl = (g) => g.map((q, i) => `${i ? "L" : "M"}${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`).join("");

  /* ── 정답 자리 — 그 시·구 안에서 경계와 가장 먼 점(가장 넓은 자리) */
  const groups = new Map();
  for (const f of focusF) { const g = pg.group(f); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(f); }
  const outlineSegs = [...cls.inner, ...cls.outer].map((e) => [X(e.a[0]), Y(e.a[1]), X(e.b[0]), Y(e.b[1])]);
  const segDist = (px, py, [x1, y1, x2, y2]) => {
    const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / L2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };
  const inPoly = (px, py, ring) => {
    let c = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const labels = [];
  for (const [name, fs] of groups) {
    /* 다각형마다 바깥 고리 하나 + 구멍들 — 가장 큰 덩어리에 이름을 쓴다(섬 말고 본토) */
    const polys = fs.flatMap((f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates))
      .map((p) => p.map((r) => r.map((q) => [X(q[0]), Y(q[1])])));
    const area = (r) => Math.abs(r.reduce((a, q, i) => { const n = r[(i + 1) % r.length]; return a + q[0] * n[1] - n[0] * q[1]; }, 0) / 2);
    const inside = (x, y) => polys.some((p) => inPoly(x, y, p[0]) && !p.slice(1).some((h) => inPoly(x, y, h)));
    const big = polys.sort((a, b) => area(b[0]) - area(a[0]))[0][0];
    const bx0 = Math.min(...big.map((q) => q[0])), bx1 = Math.max(...big.map((q) => q[0]));
    const by0 = Math.min(...big.map((q) => q[1])), by1 = Math.max(...big.map((q) => q[1]));
    const near = outlineSegs.filter(([x1, y1, x2, y2]) => Math.max(x1, x2) > bx0 - 60 && Math.min(x1, x2) < bx1 + 60
      && Math.max(y1, y2) > by0 - 60 && Math.min(y1, y2) < by1 + 60);
    let best = null;
    const step = Math.max(1.5, Math.max(bx1 - bx0, by1 - by0) / 48);
    for (let x = bx0 + step / 2; x < bx1; x += step)
      for (let y = by0 + step / 2; y < by1; y += step) {
        if (!inside(x, y)) continue;
        /* 가로로 긴 글자라 세로보다 가로 여유를 더 친다 */
        const d = Math.min(...near.map((sg) => segDist(x, y, sg)));
        if (!best || d > best.d) best = { x, y, d };
      }
    if (!best) continue;
    const fsz = Math.max(7.5, Math.min(pg.fsMax, (best.d * 2 * 0.92) / units(name), best.d * 1.15));
    labels.push({ name, x: best.x, y: best.y, fs: fsz });
  }

  /* ── 그리기 */
  const body = (mode) => {
    let o = `<clipPath id="clip${pg.id}"><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="12"/></clipPath>`;
    o += `<g clip-path="url(#clip${pg.id})"><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="${FILL_ETC}"/>`;
    /* 면 — 같은 색 얇은 선을 둘러 이웃 칸 사이 앤티에일리어싱 틈을 메운다 */
    for (const f of feats) {
      const fill = SIDO_FILL[f.properties.sido] || FILL_ETC;
      for (const r of rings(f.geometry))
        o += `<path d="${dl(r)}Z" fill="${fill}" stroke="${fill}" stroke-width="0.7" stroke-linejoin="round"/>`;
    }
    for (const l of chains(cls.ctx)) o += `<path d="${dl(l)}" fill="none" stroke="${CTX_EDGE}" stroke-width="1" stroke-linejoin="round"/>`;
    for (const l of chains(cls.inner)) o += `<path d="${dl(l)}" fill="none" stroke="${INNER}" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const l of chains(cls.outer)) o += `<path d="${dl(l)}" fill="none" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>`;
    /* 물 — 구 경계 위에. 너무 작은 웅덩이는 백지도에서 얼룩일 뿐이라 뺀다 */
    for (const w of WATER) {
      if (w.kind === "coastline") continue;
      const g = w.g.map((q) => [X(q.lon), Y(q.lat)]);
      if (!g.some(([x, y]) => x > P.x && x < P.x + P.w && y > P.y && y < P.y + P.h)) continue;
      const a = Math.abs(g.reduce((acc, q, i) => { const n = g[(i + 1) % g.length]; return acc + q[0] * n[1] - n[0] * q[1]; }, 0) / 2);
      if (a < (pg.focus === "서울특별시" ? 30 : 60)) continue;
      o += `<path d="${g.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("")}Z" fill="${WATER_FILL}"/>`;
    }
    o += `<path d="${dl(HAN)}" fill="none" stroke="${WATER_FILL}" stroke-width="${Math.max(3, Math.min(18, kmPx * 0.6)).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (mode === "answer")
      for (const l of labels)
        o += `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" font-size="${l.fs.toFixed(2)}" font-weight="700" fill="${INK}" text-anchor="middle" dominant-baseline="central" letter-spacing="-0.3" paint-order="stroke" stroke="${SIDO_FILL[pg.focus]}" stroke-width="3" stroke-linejoin="round">${esc(l.name)}</text>`;
    o += `</g><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="12" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
    if (mode === "answer")
      o += `<text x="${P.x + P.w}" y="${P.y - 12}" font-size="12" font-weight="800" fill="#c8102e" text-anchor="end">정답</text>`;
    return `<section class="page ${pg.orient}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}">`
      + `<rect width="${PW}" height="${PH}" fill="#ffffff"/>${o}</svg></section>`;
  };
  console.log(`✅ ${pg.id} — 칸 ${groups.size}개 · 경계선 ${cls.inner.length + cls.outer.length}변 · 축척 1px=${(1000 / kmPx).toFixed(0)}m`);
  return { quiz: body("quiz"), answer: body("answer"), n: groups.size };
}

const built = PAGES.map(buildPage);
if (built[0].n !== 25) throw new Error(`서울이 ${built[0].n}개 구다 — 25개여야 한다`);
if (built[1].n !== 31) throw new Error(`경기도가 ${built[1].n}개 시·군이다 — 31개여야 한다`);

/* ── HTML → PDF(쪽마다 방향이 다르다 — CSS 이름 붙은 쪽) · JPG */
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
const NAME = { quiz: "서울경기_백지도", answer: "서울경기_백지도_정답" };
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
console.log(`\n🗺️ 백지도 ${PAGES.length}장 + 정답 ${PAGES.length}장 → data/out/blank-map/`);
