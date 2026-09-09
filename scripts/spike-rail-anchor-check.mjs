/**
 * 검증 — 「동 중심 닻 + 순서 강제 스냅」이 쓸 만한가.
 *
 * 방법: **좌표를 아는 역까지 일부러 모른 척한다.** 그 역들도 동 중심으로만 닻을 잡아
 * 전체를 다시 배치한 뒤, 진짜 OSM 좌표와 몇 미터 차이 나는지 잰다.
 * 이게 신설역 10개에서 벌어질 일의 대리 측정이다.
 *
 * ⚠️ 2026-09-08 에 스냅을 순서 없이 했더니 중앙값 508m, 7개 중 3개는 오히려 나빠졌다.
 *    순서 강제가 그걸 고치는지 **재서** 확인한다. 좋아 보이는 방법을 안 재고 쓰지 않는다.
 *
 * 실행: node scripts/spike-rail-anchor-check.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { metres, rings, ringCentroid, pointInGeom, dongCentre, buildTrack, projectOnTrack, pointAt, monotonicPositions } from "./lib/rail-geo.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const probe = JSON.parse(readFileSync(join(ROOT, "data/geo/_probe-rail-osm.json"), "utf8"));
const anchorsDoc = JSON.parse(readFileSync(join(ROOT, "data/datasets/rail-station-anchors.json"), "utf8"));
const rail = JSON.parse(readFileSync(join(ROOT, "data/datasets/sudo-rail-2026-09.json"), "utf8"));
const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"));
const dong = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-submunicipalities.geojson"), "utf8"));

const O = probe.결과.find((x) => x.key === "sinansan");
const L = rail.lines.find((x) => x.key === "sinansan");
const A = anchorsDoc.sinansan;

/* 본선 선형 — construction 길 중 가장 긴 것 하나가 전 구간이다(188점). 토막들을 이어 붙이면
   순서를 우리가 정해야 하는데, 그 순서를 정하는 것이 바로 지금 검증하려는 것이라 순환이다. */
const mainWay = O.좌표.filter((w) => w.railway === "construction").sort((a, b) => b.g.length - a.g.length)[0];
const track = buildTrack(mainWay.g);
const trackLen = track[track.length - 1].d;
console.log(`선형: ${track.length}점 · 길이 ${(trackLen / 1000).toFixed(1)}km`);

/* OSM 실좌표(정답지) */
const truth = new Map();
for (const h of O.역점.표본 || []) {
  const n = (h.name || "").replace(/역$/, "");
  if (!truth.has(n)) truth.set(n, { lat: h.lat, lon: h.lon });
}

const sggGeom = (nm) => {
  const f = sgg.features.find((x) => x.properties.name === nm);
  return f ? f.geometry : null;
};

/* 본선만 검증한다 — 지선은 OSM 에 토막밖에 없다. */
const names = L.stations.map((s) => s.name);

/* ── 닻을 **전부 동 중심으로만** 잡는다 (좌표를 아는 역도 모른 척) */
const anchors = names.map((name) => {
  const a = A[name];
  if (!a) return { name, t: null, why: "닻 정의 없음" };
  const g = sggGeom(a.sgg);
  if (!g) return { name, t: null, why: `시군구 '${a.sgg}' 못 찾음` };
  if (!a.dong) return { name, t: null, why: "동 미기재(원래 OSM 좌표를 쓰는 역)" };
  const c = dongCentre(dong, g, a.dong);
  if (!c) return { name, t: null, why: `동 '${a.dong}' 을 ${a.sgg} 안에서 못 찾음` };
  const p = projectOnTrack(track, c);
  return { name, t: p.t, c, proj: p, why: `${a.dong}(${c.parts}개 평균)` };
});

const placed = monotonicPositions(anchors, trackLen);

console.log("\n── 닻 잡힌 상태 ──");
placed.forEach((p, i) => {
  const a = anchors[i];
  console.log(`${String(i + 1).padStart(2)} ${p.name.padEnd(10)} ${p.from.padEnd(16)} ${(p.t / 1000).toFixed(2)}km  ${a.why || ""}`);
});

/* ── 정답이 있는 역만 오차를 잰다 */
console.log("\n── 오차 (정답이 있는 역만) ──");
const errs = [];
placed.forEach((p) => {
  const gt = truth.get(p.name);
  if (!gt) return;
  const got = pointAt(track, p.t);
  const e = metres(gt, got);
  errs.push({ n: p.name, e });
  console.log(`   ${p.name.padEnd(10)} ${Math.round(e)}m`);
});
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return Math.round(s[Math.floor(s.length / 2)]); };
if (errs.length) {
  const v = errs.map((x) => x.e);
  console.log(`\n   중앙값 ${med(v)}m · 최대 ${Math.round(Math.max(...v))}m · n=${v.length}`);
}

/* ── 순서가 실제로 지켜졌는가 — 이게 이 방식의 존재 이유다 */
let mono = true;
for (let i = 1; i < placed.length; i++) if (placed[i].t < placed[i - 1].t) { mono = false; console.log(`❌ 순서 뒤집힘: ${placed[i - 1].name} → ${placed[i].name}`); }
console.log(mono ? "\n✅ 역 순서 단조 — 뒤집힌 곳 없음" : "\n❌ 순서가 뒤집혔다");

/* ── 역간 간격이 말이 되는가 (0m 로 겹치면 지도에서 점이 뭉친다) */
const gaps = [];
for (let i = 1; i < placed.length; i++) gaps.push((placed[i].t - placed[i - 1].t) / 1000);
console.log(`역간 간격 최소 ${Math.min(...gaps).toFixed(2)}km · 최대 ${Math.max(...gaps).toFixed(2)}km`);

/* ══════════════════════════════════════════════════════════════
   실제 배치 — 아는 역은 OSM 실좌표, 모르는 역만 동 중심.
   그리고 **하나씩 눈을 가려**(leave-one-out) 그 역이 동 중심으로만 놓였을 때
   실제와 얼마나 벌어지는지 잰다. 이것이 신설역 10개에서 벌어질 일의 정직한 추정이다.
   ══════════════════════════════════════════════════════════════ */
function place(blind) {
  const an = names.map((name) => {
    const a = A[name];
    const gt = truth.get(name);
    if (gt && name !== blind) return { name, t: projectOnTrack(track, gt).t, why: "OSM 실좌표" };
    if (!a?.dong) return { name, t: null, why: "닻 없음" };
    const g = sggGeom(a.sgg); if (!g) return { name, t: null, why: "시군구 없음" };
    const c = dongCentre(dong, g, a.dong);
    if (!c) return { name, t: null, why: "동 못 찾음" };
    return { name, t: projectOnTrack(track, c).t, why: `${a.dong} 중심` };
  });
  return { placed: monotonicPositions(an, trackLen), an };
}

console.log("\n══ 실제 배치 (아는 역은 실좌표) ══");
const real = place(null);
real.placed.forEach((p, i) => console.log(`${String(i + 1).padStart(2)} ${p.name.padEnd(10)} ${p.from.padEnd(8)} ${(p.t / 1000).toFixed(2)}km  ${real.an[i].why}`));
let mono2 = true;
for (let i = 1; i < real.placed.length; i++) if (real.placed[i].t < real.placed[i - 1].t) { mono2 = false; console.log(`❌ 뒤집힘 ${real.placed[i - 1].name}→${real.placed[i].name}`); }
console.log(mono2 ? "✅ 순서 단조" : "❌ 순서 깨짐");

console.log("\n══ 눈가림 검증 — '이 역만 동 중심으로 놓았다면?' ══");
const loo = [];
for (const [n2, gt] of truth) {
  if (!names.includes(n2)) continue;
  if (!A[n2]?.dong) continue; // 동 닻이 없으면 시험할 수 없다
  const r = place(n2);
  const p = r.placed.find((x) => x.name === n2);
  const e = metres(gt, pointAt(track, p.t));
  loo.push({ n: n2, e });
  console.log(`   ${n2.padEnd(10)} ${Math.round(e)}m  (${p.from})`);
}
if (loo.length) {
  const v = loo.map((x) => x.e);
  console.log(`\n   중앙값 ${med(v)}m · 최대 ${Math.round(Math.max(...v))}m · n=${v.length}`);
} else console.log("   시험 가능한 역이 없다 — 동 닻이 있는 역 중 정답이 있는 역이 없다");

/* 표본이 1개면 아무것도 말할 수 없다. 그래서 **아는 역 전부**에 대해 눈가림을 돌린다 —
   그 역의 닻은 '실좌표가 들어 있는 동'의 중심으로 잡는다. 문서에서 소재 동을 찾아 적었을 때
   벌어지는 일과 같은 상황이다. */
function dongOf(pt) {
  for (const f of dong.features) if (pointInGeom([pt.lon, pt.lat], f.geometry)) return f.properties.name;
  return null;
}
function centreOfDongName(nm) {
  const hits = dong.features.filter((f) => f.properties.name === nm).map((f) => ringCentroid(f.geometry)).filter(Boolean);
  if (!hits.length) return null;
  return { lat: hits.reduce((a, c) => a + c[1], 0) / hits.length, lon: hits.reduce((a, c) => a + c[0], 0) / hits.length };
}
console.log("\n══ 눈가림 확대 — 아는 역 전부를 '소재 동 중심'으로만 놓아 본다 ══");
const loo2 = [];
for (const [n2, gt] of truth) {
  if (!names.includes(n2)) continue;
  const dn = dongOf(gt); if (!dn) { console.log(`   ${n2} — 동 못 찾음`); continue; }
  const c = centreOfDongName(dn); if (!c) continue;
  const an = names.map((name) => {
    const g2 = truth.get(name);
    if (name === n2) return { name, t: projectOnTrack(track, c).t };
    if (g2) return { name, t: projectOnTrack(track, g2).t };
    const a = A[name]; if (!a?.dong) return { name, t: null };
    const sg = sggGeom(a.sgg); if (!sg) return { name, t: null };
    const cc = dongCentre(dong, sg, a.dong);
    return { name, t: cc ? projectOnTrack(track, cc).t : null };
  });
  const pl = monotonicPositions(an, trackLen);
  const p = pl.find((x) => x.name === n2);
  const e = metres(gt, pointAt(track, p.t));
  loo2.push(e);
  console.log(`   ${n2.padEnd(10)} ${dn.padEnd(8)} → ${Math.round(e)}m  (${p.from})`);
}
if (loo2.length) console.log(`\n   중앙값 ${med(loo2)}m · 최대 ${Math.round(Math.max(...loo2))}m · n=${loo2.length}`);
