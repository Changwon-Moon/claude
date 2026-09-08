/**
 * 수도권 건설중 철도 8개 노선의 **선형·역 좌표**를 OSM 에서 받아 온다.
 *
 * ── 왜 OSM 인가 (2026-09-08)
 * 이 8개는 아직 안 열린 노선이라 운영중 역 데이터셋에 없다. 오너가 올려 준 서울시·
 * 신안산선 노선도는 **그림**이라 좌표가 없고, 그림에서 위치를 읽어 옮기면 (1) 남의 지도를
 * 베끼는 것이고 (2) 점이 1km 옆에 찍혀도 아무도 모른다. `kakao-geo.mjs` 가 폴백을 없앤
 * 것과 같은 이유로, **좌표는 좌표 자료에서만** 온다.
 * OSM 은 건설중 노선을 railway=construction 으로 담고 라이선스도 쓸 수 있다.
 *
 * ── 이 스크립트는 두 걸음이다. 순서를 지킨다.
 *   ① --probe : OSM 에 **무엇이 있는지 재기만** 한다. 파일을 만들지 않는다.
 *   ② --build : 잰 것을 data/geo/rail-lines-2026.geojson 으로 굳힌다.
 *
 * ⚠️ 곧장 --build 로 가지 않는다. 이 공장은 「조용히 0건 재고 초록불」을 세 번 겪었다
 *    (designQa 미등록 · 픽셀 기준값 자료형 · auditHead 를 루트에서 실행).
 *    OSM 에 신안산선이 어떤 모양으로 들어 있는지 **보고 나서** 빌더를 짠다.
 *
 * ── 가드 (--build 에서만)
 *   · 역 수·역명이 sudo-rail-2026-09.json 과 다르면 **던진다.** 우리 데이터셋이 대조표다.
 *     (2026-09-08 에 신안산선 장하역 누락이 이 대조로 잡혔을 자리다.)
 *   · 좌표를 못 얻은 역이 하나라도 있으면 던진다. 못 찍은 역을 조용히 빼지 않는다.
 *   · 좌표가 수도권 상자 밖이면 던진다.
 *
 * 실행: node scripts/collect-rail-geo.mjs --probe [--only sinansan]
 *       node scripts/collect-rail-geo.mjs --build
 *
 * ⚠️ 이 세션(코워크 컨테이너)에서는 Overpass 가 막혀 있다. **GitHub Actions 에서 돈다** —
 *    collect.yml 이 스스로 적어 둔 대로 "실제 외부 API 호출은 그 환경에서 이뤄진다".
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const PROBE = argv.includes("--probe");
const BUILD = argv.includes("--build");
if (PROBE === BUILD) {
  console.error("--probe 또는 --build 중 하나를 준다 (둘 다/둘 다 아님은 거부).");
  process.exit(2);
}
const onlyIdx = argv.indexOf("--only");
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;

/* 수도권 상자 — 좌표가 여기 밖이면 무언가 잘못 잡힌 것이다. */
const BOX = { minLat: 36.8, maxLat: 38.1, minLon: 126.3, maxLon: 127.7 };

/** OSM 에서 노선을 찾을 이름들. 한 노선이 여러 이름으로 들어가 있을 수 있어 배열로 둔다. */
/* 부분 일치용 열쇠말 — 정확 이름이 아니라 **들어 있으면 잡히는** 조각으로 둔다.
   (정확 일치 판본은 신안산선에서 0건이었다 — run 34176303760) */
const OSM_NAMES = {
  sinansan: ["신안산"],
  gtxa: ["광역급행철도 A", "GTX-A", "GTX A"],
  gtxb: ["광역급행철도 B", "GTX-B", "GTX B"],
  gtxc: ["광역급행철도 C", "GTX-C", "GTX C"],
  indong: ["인덕원"],
  wolpan: ["월곶"],
  sinbundang: ["신분당선"],
  daejang: ["대장홍대", "서부광역철도"],
};

const OVERPASS = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";

async function overpass(query) {
  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "wirit-note-card-factory/1.0" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status} ${res.statusText}`);
  return res.json();
}

/** ① 이름으로 관계·길을 찾는다. **정확 일치는 0건이었다**(run 34176303760) —
    OSM 이 "수도권 전철 신안산선" 처럼 다르게 부를 수 있어 **부분 일치**로 넓힌다. */
const qFind = (keys) => `[out:json][timeout:120];
(${keys.map((k) => `relation["name"~"${k}"];way["name"~"${k}"];`).join("")});
out tags;`;

/** ② 역 이름으로 **점을 직접** 찾는다 — 사실 카드가 필요한 건 선형보다 이 좌표다.
    수도권 상자 안에서 "○○역" 이라는 이름의 철도 관련 점/면을 본다. */
const qStations = (names) => `[out:json][timeout:180];
(${names.map((n) => `node["name"~"^${n}역$"](${BOX.minLat},${BOX.minLon},${BOX.maxLat},${BOX.maxLon});` +
                    `way["name"~"^${n}역$"](${BOX.minLat},${BOX.minLon},${BOX.maxLat},${BOX.maxLon});`).join("")});
out center tags;`;

/** 관계 하나의 멤버와 형상을 통째로 받는다. */
const qGeom = (id) => `[out:json][timeout:180];
relation(${id});
out body geom;`;

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/sudo-rail-2026-09.json"), "utf8"));
const lines = doc.lines.filter((L) => (ONLY ? L.key === ONLY : true));
if (!lines.length) throw new Error(`--only ${ONLY} 에 맞는 노선이 데이터셋에 없다`);

/* 우리 데이터셋이 아는 역 이름 — OSM 결과를 여기에 맞춰 본다. */
const ourStations = (L) =>
  [...(L.stations || []), ...((L.branch && L.branch.stations) || [])].map((s) => s.name);

async function probe() {
  const out = [];
  for (const L of lines) {
    const names = OSM_NAMES[L.key];
    if (!names) { out.push({ key: L.key, name: L.name, error: "OSM_NAMES 에 이름이 없다" }); continue; }
    let found;
    try { found = await overpass(qFind(names)); }
    catch (e) { out.push({ key: L.key, name: L.name, error: String(e.message) }); continue; }

    /* 역 점을 직접 찾아 본다 — 우리 역 이름 그대로. */
    const ours0 = ourStations(L);
    let stationHits = [];
    try {
      const sj = await overpass(qStations(ours0));
      stationHits = (sj.elements || []).map((e) => ({
        name: e.tags?.name,
        railway: e.tags?.railway, construction: e.tags?.construction || e.tags?.["construction:railway"],
        lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon,
        type: e.type, id: e.id,
      })).filter((x) => x.lat != null);
    } catch (e) { stationHits = [{ error: String(e.message) }]; }
    await new Promise((r2) => setTimeout(r2, 1500));

    const rels = (found.elements || []).map((e) => ({
      id: e.id, type: e.tags?.type, route: e.tags?.route, railway: e.tags?.railway,
      state: e.tags?.state || e.tags?.construction, name: e.tags?.name,
    }));

    /* 관계마다 역 이름을 세어 본다 — 우리 목록과 몇 개나 맞는지가 판단의 전부다. */
    const detail = [];
    for (const r of rels.slice(0, 6)) {
      let g;
      try { g = await overpass(qGeom(r.id)); }
      catch (e) { detail.push({ id: r.id, error: String(e.message) }); continue; }
      const rel = (g.elements || []).find((e) => e.type === "relation" && e.id === r.id);
      const members = rel?.members || [];
      const stops = members
        .filter((m) => m.type === "node" && /stop|station|halt/.test(m.role || ""))
        .length;
      const nodeNames = (g.elements || [])
        .filter((e) => e.type === "node" && e.tags?.name)
        .map((e) => e.tags.name);
      const ways = members.filter((m) => m.type === "way").length;
      const pts = members.filter((m) => m.type === "way" && m.geometry).reduce((a, m) => a + m.geometry.length, 0);
      const ours = ourStations(L);
      const matched = ours.filter((n) => nodeNames.some((x) => x.replace(/역$/, "") === n));
      detail.push({
        id: r.id, ways, pts, stopRoles: stops,
        namedNodes: nodeNames.length,
        우리역: ours.length, 일치: matched.length,
        놓친역: ours.filter((n) => !matched.includes(n)),
      });
      await new Promise((r2) => setTimeout(r2, 1500)); // Overpass 예의
    }
    const hitNames = new Set(stationHits.map((h) => (h.name || "").replace(/역$/, "")));
    out.push({
      key: L.key, name: L.name, 우리역수: ours0.length, 관계: rels, 상세: detail,
      역점: { 찾음: stationHits.length, 우리역중일치: ours0.filter((n) => hitNames.has(n)).length,
             놓친역: ours0.filter((n) => !hitNames.has(n)), 표본: stationHits.slice(0, 40) },
    });
    await new Promise((r2) => setTimeout(r2, 1500));
  }

  mkdirSync(join(ROOT, "data/geo"), { recursive: true });
  const path = join(ROOT, "data/geo/_probe-rail-osm.json");
  writeFileSync(path, JSON.stringify({ 잰날: new Date().toISOString().slice(0, 10), overpass: OVERPASS, 결과: out }, null, 2) + "\n");

  console.log("── OSM 탐사 결과 ──");
  for (const o of out) {
    if (o.error) { console.log(`❌ ${o.name} — ${o.error}`); continue; }
    console.log(`\n${o.name} (우리 역 ${o.우리역수}개) — 관계 ${o.관계.length}건`);
    for (const r of o.관계) console.log(`   rel ${r.id} · type=${r.type} route=${r.route} railway=${r.railway} state=${r.state ?? "-"} · ${r.name}`);
    if (o.역점) {
      console.log(`   [역 점] OSM 에서 ${o.역점.찾음}건 찾음 · 우리 역과 일치 ${o.역점.우리역중일치}/${o.우리역수}`);
      if (o.역점.놓친역.length) console.log(`      못 찾은 역: ${o.역점.놓친역.join(", ")}`);
      for (const h of (o.역점.표본 || []).slice(0, 25))
        console.log(`      ${h.name} ${h.lat?.toFixed(5)},${h.lon?.toFixed(5)} railway=${h.railway ?? "-"} constr=${h.construction ?? "-"}`);
    }
    for (const d of o.상세) {
      if (d.error) { console.log(`   rel ${d.id} → ${d.error}`); continue; }
      console.log(`   rel ${d.id} → way ${d.ways}개(점 ${d.pts}) · 이름있는 노드 ${d.namedNodes} · 우리역 ${d.일치}/${d.우리역}`);
      if (d.놓친역?.length) console.log(`      놓친 역: ${d.놓친역.join(", ")}`);
    }
  }
  console.log(`\n📄 ${path}`);
  console.log("⚠️ 이건 재기만 한 것이다. 이 결과를 보고 --build 를 짠다.");
}

async function build() {
  throw new Error(
    "--build 는 아직 없다. --probe 결과를 보고 짠다 — OSM 이 어떤 모양으로 담고 있는지\n" +
    "모르는 채로 빌더를 짜면 '0건을 재고 통과'하는 자리가 또 생긴다."
  );
}

await (PROBE ? probe() : build());
