/* ⚠️ **밀기 전에 여기서 한 번 돌린다** — `node scripts/collect-rail-geo.mjs --probe --only sinansan`.
 *    이 컨테이너는 Overpass 가 막혀 있어 "전부 실패"로 끝나지만, **그 뒤 파일 쓰기까지 도달**한다.
 *    2026-09-08 에 이걸 건너뛰어 OVERPASS→MIRRORS 개명 뒤 남은 참조 하나로 Actions 런이 죽었다.
 *    네트워크가 없어도 잡히는 사고가 대부분이다. */
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
const CONTEXT = argv.includes("--context");
const WATER = argv.includes("--water");
const EXTRA = argv.includes("--extra");
if ([PROBE, BUILD, CONTEXT, WATER].filter(Boolean).length !== 1) {
  console.error("--probe / --context / --water / --build 중 **하나만** 준다.");
  process.exit(2);
}
const onlyIdx = argv.indexOf("--only");
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;

/* 수도권 상자 — 좌표가 여기 밖이면 무언가 잘못 잡힌 것이다. */
const BOX = { minLat: 36.8, maxLat: 38.1, minLon: 126.3, maxLon: 127.7 };

/** OSM 에서 노선을 찾을 이름들. 한 노선이 여러 이름으로 들어가 있을 수 있어 배열로 둔다. */
/* 부분 일치용 열쇠말 — 정확 이름이 아니라 **들어 있으면 잡히는** 조각으로 둔다.
   (정확 일치 판본은 신안산선에서 0건이었다 — run 34176303760) */
/* ⚠️ 이름은 **OSM 이 실제로 쓰는 이름**이어야 한다. 「월곶」·「인덕원」·「GTX-A」로 물었더니
   전부 0건이었다(2026-09-09). 신안산선 탐사가 긁어 온 역 상자 안에 답이 있었다 —
   OSM 은 이렇게 부른다: 동탄인덕원선 · 경강선 · 수도권광역급행철도에이선/비선/씨선 ·
   신분당선 · 대장홍대선. **모르는 이름을 짐작하지 말고 긁어 온 목록에서 읽는다.** */
const OSM_NAMES = {
  sinansan: ["신안산"],
  /* ── 🔴 GTX 세 노선은 **제 이름만으로는 선형이 안 이어진다**(2026-09-10 실측).
     기존선을 함께 쓰는 구간이 OSM 에는 **그 기존선 이름**으로 올라와 있기 때문이다.
     받아 보고 잰 것:
       · GTX-A — 제 이름으로 51.6km (공표 82.3km). 빠진 곳은 **수서~동탄**, 수서평택고속선 공용.
       · GTX-B — 제 이름으로 58.0km (마석 80.7km). 빠진 곳은 **상봉~마석 22.9km**, 경춘선 공용.
                 58.0 + 22.9 = 80.9 로 딱 맞는다.
       · GTX-C — 제 이름으로 38.2km (공표 86.5km). 신설 전용선 37.95km 와 맞는다.
                 빠진 곳은 경원선(덕정~도봉산 16.71) · 과천선(정부과천청사~금정 5.95) ·
                 경부선(금정~수원 14.15) · 안산선(금정~상록수 11.70).
     ⚠️ 이름을 넓히면 **상자가 유일한 안전장치**가 된다 — 경부선은 부산까지, 경춘선은 춘천까지,
        경원선은 연천까지 간다. OSM_BOX 를 반드시 함께 본다. */
  gtxa: ["수도권광역급행철도에이선", "광역급행철도 A", "GTX-A", "수서평택고속선"],
  gtxb: ["수도권광역급행철도비선", "광역급행철도 B", "GTX-B", "경춘선"],
  gtxc: ["수도권광역급행철도씨선", "광역급행철도 C", "GTX-C",
         "경원선", "과천선", "경부선", "안산선"],
  indong: ["동탄인덕원선", "인덕원~동탄", "인덕원∼동탄"],
  wolpan: ["경강선", "월곶판교", "월곶∼판교", "월곶~판교"],
  sinbundang: ["신분당선"],
  daejang: ["대장홍대", "서부광역철도"],
  "gongyong-seohae": ["서해선"],
};

/* 노선별 탐사 상자 — 이름이 넓게 걸리는 노선만 좁힌다.
   「경강선」은 여주까지 가는 노선이라 수도권 상자로 물으면 동쪽 꼬리가 통째로 딸려 와
   역 상자가 강원도까지 커지고, 그 상자로 역을 긁으면 수천 건이 나와 Overpass 가 죽는다. */
const OSM_BOX = {
  wolpan: { minLat: 37.20, maxLat: 37.55, minLon: 126.65, maxLon: 127.15 },
  indong: { minLat: 37.10, maxLat: 37.45, minLon: 126.90, maxLon: 127.20 },
  /* ── 2026-09-09 에 미리 재 둔 상자들. 아직 한 번도 안 돌렸다(컨테이너에서 Overpass 가 막혀
        Actions 로만 돌 수 있는데, 이 세션은 저장소 push 가 막혀 있었다).
        상자는 **각 노선 양 끝 역을 넉넉히 감싸되 그 이상은 안 넣는 크기**로 잡았다 —
        너무 넓으면 역을 긁을 때 수천 건이 나와 Overpass 가 죽는다(경강선에서 겪었다). */
  /* 운정중앙(파주 37.72) ~ 동탄(화성 37.20) · 킨텍스(126.74) ~ 동탄(127.10) */
  gtxa: { minLat: 37.15, maxLat: 37.78, minLon: 126.70, maxLon: 127.15 },
  /* 인천대입구(37.39/126.65) ~ 마석(남양주 37.65/127.31). 「경춘선」이 춘천까지 가므로
     동쪽을 마석에서 끊는다 — 안 끊으면 강원도가 딸려 온다. */
  /* 경춘선을 이름에 넣었으므로 **동쪽을 마석(127.31)에서 끊는 것**이 곧 안전장치다.
     안 끊으면 춘천(127.73)까지 딸려 온다. */
  gtxb: { minLat: 37.32, maxLat: 37.72, minLon: 126.58, maxLon: 127.36 },
  /* 덕정(양주 37.84) ~ 수원(37.27) · 상록수(안산 126.87) ~ 왕십리(127.04).
     「경원선」이 연천까지, 「경부선」이 부산까지 가므로 위아래를 끊는다. */
  gtxc: { minLat: 37.22, maxLat: 37.90, minLon: 126.82, maxLon: 127.10 },
  /* 용산(37.53) ~ 호매실(수원 37.27) · 호매실(126.95) ~ 광교(127.06).
     신분당선은 이미 개통 구간이 길어 이름만으로도 잡히지만, 상자로 한 번 더 조인다. */
  sinbundang: { minLat: 37.22, maxLat: 37.56, minLon: 126.93, maxLon: 127.12 },
  /* 대장(부천 37.53/126.79) ~ 홍대입구(마포 37.56/126.92). 20km 짜리라 상자가 작다. */
  daejang: { minLat: 37.48, maxLat: 37.62, minLon: 126.74, maxLon: 126.97 },
};

/* ── 우리 데이터셋의 노선이 **아니지만** 카드에 그려야 하는 구간.
 *
 * 신안산선 지선은 시흥시청에서 끝나지 않는다 — 거기서 서해선 선로로 **직결**해 원시까지 간다
 * (나무위키 「수도권 전철 신안산선/역 목록」 본선 2구간: 시흥시청 9.7km → 원시 19.6km).
 * 오너 2026-09-09: "누락된 역들도 표기해줘 (서해선 공통)".
 *
 * ⚠️ 이 구간은 **이미 운행중**이라 railway=rail 이다. 건설중(construction) 만 받던
 *    탐사로는 안 잡힌다. 그래서 여기에 따로 적는다.
 * ⚠️ **상자를 따로 준다.** 서해선은 홍성까지 내려가는 노선이라 수도권 상자로 물으면
 *    남쪽 꼬리가 통째로 딸려 와 역 상자가 충청도까지 커진다.
 * ⚠️ 키를 신안산선과 **분리**한다 — 같은 키로 받으면 이미 받아 둔 신안산선 선형을
 *    이번 탐사가 덮는다(2026-09-09 에 --only 로 한 번 잃었다). */
const EXTRA_LINES = [{
  key: "gongyong-seohae",
  name: "서해선 공용구간(시흥시청~원시)",
  box: { minLat: 37.28, maxLat: 37.46, minLon: 126.70, maxLon: 126.85 },
  stations: [
    { name: "시흥시청" }, { name: "시흥능곡" }, { name: "달미" },
    { name: "선부" }, { name: "초지" }, { name: "시우" }, { name: "원시" },
  ],
}];

/* 거울 여러 곳 — 한 곳이 504 를 뱉어도 탐사가 통째로 죽지 않게 한다.
   (2026-09-08: overpass-api.de 가 504 Gateway Timeout 을 내 2차 탐사가 빈손으로 끝났다.) */
const MIRRORS = process.env.OVERPASS_URL
  ? [process.env.OVERPASS_URL]
  : ["https://overpass-api.de/api/interpreter",
     "https://overpass.kumi.systems/api/interpreter",
     "https://overpass.osm.jp/api/interpreter"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function overpass(query) {
  let last;
  for (let round = 0; round < 2; round++)
    for (const url of MIRRORS) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "wirit-note-card-factory/1.0" },
          body: "data=" + encodeURIComponent(query),
        });
        if (!res.ok) { last = new Error(`${url} → ${res.status} ${res.statusText}`); await sleep(3000); continue; }
        return await res.json();
      } catch (e) { last = e; await sleep(3000); }
    }
  throw new Error(`Overpass 전부 실패 — ${last?.message}`);
}

/** ① 이름으로 관계·길을 찾는다. **정확 일치는 0건이었다**(run 34176303760) —
    OSM 이 "수도권 전철 신안산선" 처럼 다르게 부를 수 있어 **부분 일치**로 넓힌다. */
const bx = (b) => `${b.minLat},${b.minLon},${b.maxLat},${b.maxLon}`;
const B = bx(BOX);
const qFind = (keys, b = B) => `[out:json][timeout:120];
(${keys.map((k) => `relation["name"~"${k}"](${b});way["name"~"${k}"](${b});`).join("")});
out tags;`;

/** ② **노선 길의 형상**을 받는다 — railway=construction|proposed 이고 이름이 맞는 길만.
    (1차 탐사에서 신안산선은 railway=construction 길 13개로 들어 있었다. run 34176451359) */
const qLines = (keys, b = B) => `[out:json][timeout:180];
(${keys.map((k) => `way["railway"~"^(construction|proposed|rail|subway|light_rail)$"]["name"~"${k}"](${b});`).join("")});
out geom tags;`;

/** ③ 역 점 — 이름으로 딱 찍어 묻는 건 **0건이었다**(run 34176451359). 이름 규칙을 모르는 채
    묻고 있었던 것이다. 그래서 **노선 주변 상자 안의 철도역스러운 것을 전부 긁어** 이름을 본다.
    이 순서가 맞다 — 모르는 것을 물을 땐 좁게 묻지 말고 넓게 긁어 무엇이 있는지부터 본다. */
const qStationsInBox = (b) => `[out:json][timeout:180];
(
  node["railway"~"^(station|halt|construction|proposed)$"](${b.s},${b.w},${b.n},${b.e});
  way["railway"~"^(station|halt|construction|proposed)$"]["name"](${b.s},${b.w},${b.n},${b.e});
  node["public_transport"="station"](${b.s},${b.w},${b.n},${b.e});
);
out center tags;`;

/** ④ **배경 노선** — 이 노선이 지나가며 만나는 기존 철도. 오너 요청(2026-09-09):
    "기존 노선들 지나가는 것 다 표현". 이름이 있는 운행선만 받는다 —
    construction·proposed 를 같이 받으면 우리 노선이 배경에 회색으로 한 번 더 그려진다. */
const qContext = (b) => `[out:json][timeout:180];
way["railway"~"^(subway|rail|light_rail|narrow_gauge)$"]["name"]
   ["usage"!="industrial"]["service"!~"."](${b.s},${b.w},${b.n},${b.e});
out geom tags;`;

/** ⑤ **물** — 바다·호수·하천. 오너 2026-09-10: "바다는 전체 카드 다 파랑기 있게 통일 해줘".
 *
 * 🔴 왜 따로 받아야 하나: 시군구 경계 자료는 **육지/바다 마스크가 아니다.**
 *    2026-09-09 에 「시군구 면이 안 덮은 곳 = 물」로 칠했다가 국제테마파크역이 물 위에 떴다 —
 *    안산단원구 남쪽 끝(37.289)과 화성시 사이가 통째로 비어 있는데 그건 바다가 아니라
 *    매립지(송산그린시티)였다. **모르는 것을 색으로 단정하지 않는다**가 그때 세운 규칙이고,
 *    이건 그 규칙을 지키면서 오너 요청을 들어주는 유일한 길이다 — 물의 출처를 받아 온다.
 *
 * ⚠️ `natural=coastline` 은 **선**이라 그것만으로는 면을 못 칠한다. 그래서 두 가지를 받는다:
 *    ① coastline 선 — 해안선의 실제 모양
 *    ② `natural=water` / `waterway=riverbank` **면** — 시화호·한강·저수지
 *    카드는 ②를 칠하고, ①은 바다 쪽을 판별하는 데 쓴다(빌더가 판단).
 * ⚠️ 상자는 수도권 전체(BOX)다. 노선마다 받으면 같은 바다를 여덟 번 받는다. */
const qWater = (b) => `[out:json][timeout:240];
(
  way["natural"="water"](${b.s},${b.w},${b.n},${b.e});
  relation["natural"="water"](${b.s},${b.w},${b.n},${b.e});
  way["waterway"="riverbank"](${b.s},${b.w},${b.n},${b.e});
  way["natural"="coastline"](${b.s},${b.w},${b.n},${b.e});
);
out geom tags;`;

async function water() {
  const b = { s: BOX.minLat, n: BOX.maxLat, w: BOX.minLon, e: BOX.maxLon };
  console.log(`🌊 물 탐사 — 수도권 상자 ${b.s}~${b.n} / ${b.w}~${b.e}`);
  const j = await overpass(qWater(b));
  const keep = [];
  for (const el of j.elements || []) {
    const g = (el.geometry || []).filter((p) => p && typeof p.lat === "number");
    if (g.length < 4) continue;                       // 점 3개짜리 웅덩이는 카드에 안 보인다
    const t = el.tags || {};
    const kind = t.natural === "coastline" ? "coastline"
      : (t.water === "river" || t.waterway === "riverbank") ? "river" : "water";
    /* 이름 없는 자잘한 것까지 다 담으면 파일이 수십 MB 가 된다 — **면적으로 거른다.**
       위경도 사각 넓이가 대략 0.0000004 (≈ 4천 ㎡) 이상만. 해안선은 길이로 거른다. */
    const lats = g.map((p) => p.lat), lons = g.map((p) => p.lon);
    const area = (Math.max(...lats) - Math.min(...lats)) * (Math.max(...lons) - Math.min(...lons));
    if (kind === "coastline" ? g.length < 8 : area < 0.0000004) continue;
    keep.push({ id: el.id, kind, name: t.name || "",
      g: g.map((p) => ({ lat: +p.lat.toFixed(6), lon: +p.lon.toFixed(6) })) });
  }
  const by = {};
  for (const w of keep) by[w.kind] = (by[w.kind] || 0) + 1;
  mkdirSync(join(ROOT, "data/geo"), { recursive: true });
  const path = join(ROOT, "data/geo/_water-osm.json");
  writeFileSync(path, JSON.stringify({ 받은날: new Date().toISOString().slice(0, 10),
    상자: BOX, 거울: MIRRORS, 종류: by, 물: keep }, null, 2) + "\n");
  console.log(`📄 ${path}`);
  console.log(`   ${keep.length}개 — ${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
}

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/sudo-rail-2026-09.json"), "utf8"));
const pool = EXTRA ? [...doc.lines, ...EXTRA_LINES] : doc.lines;
const lines = pool.filter((L) => (ONLY ? L.key === ONLY : true));
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
    const LB = L.box ? bx(L.box) : OSM_BOX[L.key] ? bx(OSM_BOX[L.key]) : B;
    try { found = await overpass(qFind(names, LB)); }
    catch (e) { out.push({ key: L.key, name: L.name, error: String(e.message) }); continue; }

    const rels = (found.elements || []).map((e) => ({
      id: e.id, kind: e.type, type: e.tags?.type, route: e.tags?.route, railway: e.tags?.railway,
      state: e.tags?.state || e.tags?.construction, name: e.tags?.name,
    }));
    const ours0 = ourStations(L);

    /* 노선 길의 형상 — 이게 지도에 그릴 선이다. */
    let lineWays = [], bbox = null, geomErr = null;
    try {
      const lj = await overpass(qLines(names, LB));
      lineWays = (lj.elements || [])
        .filter((e) => e.type === "way" && e.geometry && e.tags?.name && names.some((k) => e.tags.name.includes(k)))
        .map((e) => ({ id: e.id, name: e.tags.name, railway: e.tags.railway, pts: e.geometry.length,
                       geometry: e.geometry }));
      const all = lineWays.flatMap((w) => w.geometry);
      if (all.length) bbox = {
        s: Math.min(...all.map((p) => p.lat)), n: Math.max(...all.map((p) => p.lat)),
        w: Math.min(...all.map((p) => p.lon)), e: Math.max(...all.map((p) => p.lon)),
      };
    } catch (e) { lineWays = []; geomErr = String(e.message); }
    await sleep(1500);

    /* 그 상자 안의 철도역스러운 것 전부 — 이름 규칙을 눈으로 보려는 것이다. */
    let stationHits = [];
    if (bbox) {
      const pad = 0.02;
      try {
        const sj = await overpass(qStationsInBox({ s: bbox.s - pad, n: bbox.n + pad, w: bbox.w - pad, e: bbox.e + pad }));
        stationHits = (sj.elements || [])
          .filter((e) => e.tags?.name)
          .map((e) => ({ name: e.tags.name, railway: e.tags.railway, pt: e.tags.public_transport,
                         lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon, type: e.type, id: e.id }))
          .filter((x) => x.lat != null);
      } catch (e) { stationHits = [{ error: String(e.message) }]; }
      await sleep(1500);
    }

    const hitNames = new Set(stationHits.flatMap((h) => { const n2 = h.name || ""; return [n2, n2.replace(/역$/, "")]; }));
    out.push({
      key: L.key, name: L.name, 우리역수: ours0.length, 관계: rels,
      /* ⚠️ 선형 질의가 **실패했는데도 결과가 그럴듯해 보이던** 자리다(2026-09-10 신분당선).
         앞 판은 오류를 `길:[{error}]` 로 넣어 「길 1개·점 0개」로 적었다 — 자료가 없는 것과
         받아오다 실패한 것이 같은 모양으로 남았다. 오류는 오류라고 적는다. */
      선형: { 길수: lineWays.length, 점수: lineWays.reduce((a2, w) => a2 + (w.pts || 0), 0), 상자: bbox,
             ...(geomErr ? { 오류: geomErr } : {}),
             길: lineWays.map((w) => ({ id: w.id, name: w.name, railway: w.railway, pts: w.pts })) },
      좌표: lineWays.filter((w) => w.geometry).map((w) => ({ id: w.id, railway: w.railway, g: w.geometry })),
      역점: { 찾음: stationHits.length, 우리역중일치: ours0.filter((n) => hitNames.has(n)).length,
             놓친역: ours0.filter((n) => !hitNames.has(n)), 표본: stationHits },
    });
    await sleep(1500);
  }

  mkdirSync(join(ROOT, "data/geo"), { recursive: true });
  const path = join(ROOT, "data/geo/_probe-rail-osm.json");
  /* ⚠️ **덮어쓰지 않고 합친다.** `--only wolpan` 이 파일을 통째로 다시 쓰면 이미 받아 둔
     신안산선 선형이 통째로 사라진다(2026-09-09 발견 — 안 지워진 건 운이었다).
     한 노선만 다시 받는 것은 흔한 일이고, 그때마다 나머지를 잃으면 못 쓴다. */
  let prev = { 결과: [] };
  try { prev = JSON.parse(readFileSync(path, "utf8")); } catch { /* 첫 실행 */ }
  const merged = new Map((prev.결과 || []).map((x) => [x.key, x]));
  for (const o of out) merged.set(o.key, o);
  writeFileSync(path, JSON.stringify(
    { 잰날: new Date().toISOString().slice(0, 10), 거울: MIRRORS, 결과: [...merged.values()] }, null, 2) + "\n");
  console.log(`   (합침 — 파일에 든 노선: ${[...merged.keys()].join(", ")})`);

  console.log("── OSM 탐사 결과 ──");
  for (const o of out) {
    if (o.error) { console.log(`❌ ${o.name} — ${o.error}`); continue; }
    console.log(`\n${o.name} (우리 역 ${o.우리역수}개) — 관계 ${o.관계.length}건`);
    for (const r of o.관계) console.log(`   rel ${r.id} · type=${r.type} route=${r.route} railway=${r.railway} state=${r.state ?? "-"} · ${r.name}`);
    if (o.선형) {
      if (o.선형.오류) console.log(`   ❌ [선형] 받아오기 실패 — ${o.선형.오류}`);
      console.log(`   [선형] 길 ${o.선형.길수}개 · 점 ${o.선형.점수}개` + (o.선형.상자 ? ` · 상자 ${o.선형.상자.s.toFixed(3)}~${o.선형.상자.n.toFixed(3)}N ${o.선형.상자.w.toFixed(3)}~${o.선형.상자.e.toFixed(3)}E` : " · 상자 없음"));
      for (const w of o.선형.길.slice(0, 20)) console.log(`      way ${w.id} railway=${w.railway} 점${w.pts} · ${w.name}`);
    }
    if (o.역점) {
      console.log(`   [역 점] OSM 에서 ${o.역점.찾음}건 찾음 · 우리 역과 일치 ${o.역점.우리역중일치}/${o.우리역수}`);
      if (o.역점.놓친역.length) console.log(`      못 찾은 역: ${o.역점.놓친역.join(", ")}`);
      for (const h of (o.역점.표본 || []).slice(0, 25))
        console.log(`      ${h.name} ${h.lat?.toFixed(5)},${h.lon?.toFixed(5)} railway=${h.railway ?? "-"} constr=${h.construction ?? "-"}`);
    }
  }
  console.log(`\n📄 ${path}`);
  console.log("⚠️ 이건 재기만 한 것이다. 이 결과를 보고 --build 를 짠다.");
}

/* ── 배경 노선 받기. 탐사 결과의 상자를 그대로 쓴다 — 지도에 그릴 범위와 같아야 한다. */
async function context() {
  const prev = JSON.parse(readFileSync(join(ROOT, "data/geo/_probe-rail-osm.json"), "utf8"));
  const out = {};
  for (const L of lines) {
    const O = prev.결과?.find((x) => x.key === L.key);
    const bb = O?.선형?.상자;
    if (!bb) { console.log(`⏭ ${L.name} — 탐사 상자가 없다. --probe 를 먼저 돌린다`); continue; }
    const pad = 0.03;
    let j;
    try { j = await overpass(qContext({ s: bb.s - pad, n: bb.n + pad, w: bb.w - pad, e: bb.e + pad })); }
    catch (e) { console.log(`❌ ${L.name} — ${e.message}`); continue; }
    /* 이름별로 묶는다 — OSM 은 한 노선을 수백 개 토막으로 쪼개 놓는다. */
    const byName = new Map();
    for (const e of j.elements || []) {
      if (e.type !== "way" || !e.geometry || !e.tags?.name) continue;
      if (!byName.has(e.tags.name)) byName.set(e.tags.name, []);
      byName.get(e.tags.name).push(e.geometry);
    }
    out[L.key] = [...byName].map(([name, segs]) => ({ name, segs }));
    const tot = out[L.key].reduce((a, x) => a + x.segs.length, 0);
    console.log(`✅ ${L.name} — 배경 노선 ${out[L.key].length}종 · 토막 ${tot}개`);
    for (const x of out[L.key].slice(0, 30)) console.log(`     ${x.name} (${x.segs.length})`);
    await sleep(1500);
  }
  mkdirSync(join(ROOT, "data/geo"), { recursive: true });
  const path = join(ROOT, "data/geo/rail-context.json");
  /* 여기도 합친다 — 위와 같은 이유다. */
  let prevC = { 노선: {} };
  try { prevC = JSON.parse(readFileSync(path, "utf8")); } catch { /* 첫 실행 */ }
  writeFileSync(path, JSON.stringify(
    { 받은날: new Date().toISOString().slice(0, 10), 노선: { ...(prevC.노선 || {}), ...out } }, null, 2) + "\n");
  console.log(`\n📄 ${path}`);
}

async function build() {
  throw new Error(
    "--build 는 아직 없다. --probe 결과를 보고 짠다 — OSM 이 어떤 모양으로 담고 있는지\n" +
    "모르는 채로 빌더를 짜면 '0건을 재고 통과'하는 자리가 또 생긴다."
  );
}

await (PROBE ? probe() : CONTEXT ? context() : WATER ? water() : build());
