/**
 * rail-geomap@1 — **실제 지도 위 예정 노선** 카드.
 *
 * rail-line@1(도식형)의 짝이다. 같은 데이터셋을 쓰고 같은 숫자를 보여 주되,
 * 역을 세로 목록이 아니라 **실제 지리 위**에 놓는다.
 *
 * ── 무엇이 실제이고 무엇이 개략인가 (이 구분이 이 판형의 전부다)
 *   · **선형은 실제다** — OSM railway=construction. 신안산선 401점.
 *   · **역 위치는 개략이다** — 신설역은 좌표 자료가 없어 소재 동 중심을 닻으로 쓴다.
 *     2026-09-09 눈가림 실측: 중앙값 535m · 최대 1,335m (n=8).
 *   · **역 순서는 절대 안 뒤집힌다** — 진행거리 t 를 단조증가로 강제한다(lib/rail-geo.mjs).
 *     이게 없으면 도심 구간(역간 1km)에서 순서가 뒤집혀 개략이 아니라 틀린 그림이 된다.
 *     오너 지시(2026-09-09)로 정확도는 낮춰도 되지만 **순서는 못 낮춘다.**
 *
 * ── 가드 (일부러 깨뜨려 확인한다)
 *   ① 역 순서가 단조가 아니면 던진다
 *   ② 선형 점이 너무 적으면(<50) 던진다 — 토막만 받아 놓고 그린 줄 모르는 일을 막는다
 *   ③ 데이터셋 역 수와 배치된 역 수가 다르면 던진다
 *   ④ 환승 키가 카탈로그에 없으면 던진다 (rail-line 과 같은 규칙)
 *   ⑤ 개략 표기를 캡션에서 빠뜨리면 던진다 — 오너가 '캡션에만 쓴다'를 골랐으므로
 *      캡션이 유일한 고지 자리다. 유일한 자리는 코드가 지킨다.
 *
 * 실행: node scripts/build-rail-geomap.mjs [날짜] [--only sinansan] [--publish]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";
import { hanRiverPoints } from "./lib/han-river.mjs";
import {
  metres, rings, ringCentroid, pointInGeom, dongCentre,
  buildTrack, projectOnTrack, pointAt, monotonicPositions, buildPeriod,
} from "./lib/rail-geo.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 10);
const publish = argv.includes("--publish");
const oi = argv.indexOf("--only");
const ONLY = oi >= 0 ? argv[oi + 1] : null;
/* ── 시안(variant). 오너 요청 2026-09-09: 라벨 좌우 배치·여백·크롭·정보 배치를 달리한 안을
      여러 개 만들어 비교한다. 기본은 a(현행 개선). 시안은 --publish 없이 뽑아 눈으로 고른다. */
const vi = argv.indexOf("--variant");
const VARIANT = vi >= 0 ? argv[vi + 1] : "d";   /* 오너가 2026-09-09 에 d(정보 두 덩이)를 골랐다 */
if (!["a", "b", "c", "d"].includes(VARIANT)) throw new Error(`--variant 는 a|b|c|d 다 (받은 값: ${VARIANT})`);

const rail = JSON.parse(readFileSync(join(ROOT, "data/datasets/sudo-rail-2026-09.json"), "utf8"));
if (rail.meta?.verified !== true) throw new Error("데이터셋이 verified:true 가 아니다 (CLAUDE.md §8)");
const anchorsDoc = JSON.parse(readFileSync(join(ROOT, "data/datasets/rail-station-anchors.json"), "utf8"));
const probe = JSON.parse(readFileSync(join(ROOT, "data/geo/_probe-rail-osm.json"), "utf8"));
const sgg = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-sgg-2026.geojson"), "utf8"));
const dong = JSON.parse(readFileSync(join(ROOT, "data/geo/korea-submunicipalities.geojson"), "utf8"));
const CAT = JSON.parse(readFileSync(join(ROOT, "templates/_shared/metro-lines.json"), "utf8"));
const CTXP = join(ROOT, "data/geo/rail-context.json");
const CTX = existsSync(CTXP) ? JSON.parse(readFileSync(CTXP, "utf8")) : null;
/* ⚠️ rail-line@1 의 SELF 와 **같은 값이어야 한다.** 갈라지면 같은 노선이 두 색으로 나간다.
   (지금은 두 벌이다 — 셋째 판형이 생기면 lib 으로 뽑는다. 둘까지는 눈으로 지킨다.) */
const SELF = { sinansan: "신안산", gtxa: "GTX-A", gtxb: "GTX-B", gtxc: "GTX-C",
               indong: "인동", wolpan: "월판", sinbundang: "신분당", daejang: "대홍" };

const sggGeom = (nm) => sgg.features.find((x) => x.properties.name === nm)?.geometry || null;

/* ── 환승 뱃지를 **SVG 로 직접 그린다** (오너 2026-09-09: "역이름 왼쪽에 노선 로고").
 * 지도는 SVG 라 renderHtml 의 metroBadge/metroWide 헬퍼(HTML+CSS)를 못 쓴다.
 * 그래서 **모양 규칙만 옮기고 색·표기는 카탈로그 정본에서 그대로 읽는다** —
 * 색을 여기 적어 두면 카탈로그와 갈라져 같은 노선이 두 색으로 나간다.
 *   · num 있으면 원형 심볼(1·2·4·5·7·9)
 *   · 그 외는 알약 — lines 배열은 붙여서(수인분당), label 은 그대로(KTX·서해·월판)
 *   · text:"dark" 면 글자를 잉크색으로 (9호선·수인분당·서해처럼 밝은 바탕) */
const BDG_R = 11.5, BDG_FS = 14, BDG_GAP = 4;
function badgeText(m, k) {
  if (m.num) return m.num;
  if (m.gtx) return `GTX-${m.gtx}`;
  if (Array.isArray(m.lines)) return m.lines.join("");
  return m.label || k;
}
function badgeWidth(k) {
  const m = CAT[k];
  if (!m) return 0;
  if (m.num) return BDG_R * 2;
  const t = badgeText(m, k);
  /* 한글은 폭이 거의 정폭, 라틴은 좁다 — 글자별로 재야 KTX 알약이 헐렁해지지 않는다. */
  const w = [...t].reduce((a, ch) => a + (/[\x00-\x7F]/.test(ch) ? BDG_FS * 0.62 : BDG_FS * 1.0), 0);
  return Math.round(w + 16);
}
function badgeSvg(k, x, cy) {
  const m = CAT[k];
  if (!m) return "";
  const ink = m.text === "dark" ? "#141821" : "#ffffff";
  const t = badgeText(m, k);
  if (m.num)
    return `<circle cx="${(x + BDG_R).toFixed(1)}" cy="${cy.toFixed(1)}" r="${BDG_R}" fill="${m.color}"/>` +
      `<text x="${(x + BDG_R).toFixed(1)}" y="${cy.toFixed(1)}" font-size="${BDG_FS}" font-weight="800" fill="${ink}" text-anchor="middle" dominant-baseline="central">${esc(t)}</text>`;
  const w = badgeWidth(k), h = BDG_R * 2;
  return `<rect x="${x.toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="${(h / 2).toFixed(1)}" fill="${m.color}"/>` +
    `<text x="${(x + w / 2).toFixed(1)}" y="${cy.toFixed(1)}" font-size="${BDG_FS}" font-weight="800" fill="${ink}" text-anchor="middle" dominant-baseline="central">${esc(t)}</text>`;
}
const badgeRowWidth = (keys) =>
  keys.length ? keys.reduce((a, k) => a + badgeWidth(k), 0) + BDG_GAP * (keys.length - 1) : 0;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ── 지도 판 크기. 정보를 위 띠로 올렸으므로 **카드 폭을 다 쓴다**(2026-09-09 개편).
   968 = 1080 − 좌우 패딩 56×2. 세로는 제목·정보띠·각주·푸터를 뺀 나머지다. */
/* 🔴 968 이 아니라 **936** 이다(2026-09-09 실측). 카드 좌우 패딩은 56 이 아니라 72 였다 —
   1080 − 72×2 = 936. 968 로 두면 뷰박스가 상자보다 넓어 SVG 가 96.7% 로 줄고 **위아래 14px 씩
   레터박스**가 생긴다. 그 14px 때문에 지도 테두리가 상자보다 안쪽에 그려져 좌상단 패널이
   테두리 밖으로 나간 것처럼 보였다(오너 지적). 잰 값으로 고친다 — 눈으로 맞추지 않는다. */
const MAP_W = 936;
/* 시안마다 지도 높이가 다르다 — 정보를 어디에 두느냐가 곧 지도에 남는 세로다.
   a: 위 띠(정보가 세로를 먹음) · b: 지도 위에 겹침(세로를 안 먹음) · c: 우측 열(현행) */
/* d 는 제목을 1.5배(62→93px)로 키우면서 두 줄이 됐다(오너 2026-09-09). 늘어난 131px 을
   지도에서 뺀다 — "그것에 맞게 지도는 조금 줄여줘". */
const BODY_H_BY_V = { a: 820, b: 986, c: 820, d: 946 };
const TITLE_FS_BY_V = { a: 62, b: 62, c: 62, d: 93 };
const BODY_H = BODY_H_BY_V[VARIANT];
/* 정보 패널이 지도 위에서 차지하는 자리. **빌더가 이 값을 알아야** 그 자리에 걸리는 역 이름을
   반대쪽으로 보낼 수 있다(오너 2026-09-09: "시흥사거리를 우측으로 옮기면 정보 카드가 더
   내려갈 수 있다"). 손으로 역을 지정하는 대신 **패널 자리로 규칙을 만든다** — 그래야 다른
   노선에서도, 패널을 옮겨도 저절로 맞는다.
   ⚠️ 템플릿의 .v-b/.v-d 치수와 **같아야 한다.** 갈라지면 라벨은 비켰는데 패널은 딴 데 있다.

   시안 d (오너 2026-09-09 2차): 공정률·개통예상만 좌상단에 **크게** 남기고, 나머지 정보는
   노선 우하단 빈 자리에 **작고 흐리게** 흘린다. 그래서 패널이 **두 개**다 —
   한 개짜리 규칙을 그대로 두면 우하단 패널이 역 이름을 덮는다. */
const PANELS_BY_V = {
  a: [], c: [],
  b: [{ x0: 0, x1: 478, y0: 30, y1: 350 }],
  /* ⚠️ 두 상자 모두 **지도 안쪽**에 있어야 한다(오너 2026-09-09: "좌상단 카드가 지도 바깥으로
     벗어나지 않게"). 지도가 이제 테두리를 가진 상자라 조금만 나가도 눈에 띈다.
     y0=14 는 템플릿의 top: calc(var(--bodyGap) + 14px) 과 같은 값이다. */
  /* 실측값(packages/renderer/src/_measure.ts)으로 적는다 — 눈대중으로 적었다가 두 번 어긋났다.
     bar : left 18 · top calc(--bodyGap + 22px) · 폭 312 · 높이 304
     side: right 18 · 폭 264 · 높이 177 · bottom 26  → 아래에서부터 잰다
     ⚠️ 두 상자는 **좌우 테두리에서도** 떨어져 있어야 한다(오너 2026-09-09 2차). 0 으로 두면
        모서리가 둥근 테두리와 맞물려 상자가 테두리를 뚫고 나간 것처럼 보인다. */
  d: [{ x0: 14, x1: 334, y0: 22, y1: 330 },
      { x0: MAP_W - 286, x1: MAP_W - 14, y0: BODY_H - 207, y1: BODY_H - 22 }],
};
const PANELS = PANELS_BY_V[VARIANT];
const SPLIT_INFO = VARIANT === "d";

function buildOne(L) {
  const A = anchorsDoc[L.key];
  if (!A) throw new Error(`${L.name}: rail-station-anchors.json 에 닻 정의가 없다`);
  const O = probe.결과?.find((x) => x.key === L.key);
  if (!O?.좌표?.length) throw new Error(`${L.name}: OSM 탐사 결과에 선형이 없다 — rail-geo.yml 을 먼저 돌린다`);

  /* 본선 선형 — construction 중 가장 긴 길 하나가 전 구간이다. 토막을 이어 붙이려면
     이음 순서를 우리가 정해야 하는데, 그건 지금 정하려는 것이라 순환이다. */
  const mainWay = O.좌표.filter((w) => w.railway === "construction").sort((a, b) => b.g.length - a.g.length)[0];
  if (!mainWay) throw new Error(`${L.name}: railway=construction 길이 없다`);
  if (mainWay.g.length < 50)
    throw new Error(`${L.name}: 선형 점이 ${mainWay.g.length}개뿐이다 — 토막만 받았다. 그리면 안 된다`); // ②
  const track = buildTrack(mainWay.g);
  const trackLen = track[track.length - 1].d;

  /* ⚠️ 계획 구간(proposed)은 **그리지 않는다**(오너 2026-09-09).
     여의도 위로 뻗은 서울역 연장 점선이 상자를 북동쪽으로 늘려 정작 노선이 작아졌다.
     아직 착공도 안 한 구간이라 「공사 현황」 카드의 주제도 아니다. */

  /* OSM 실좌표 — 있으면 그게 닻이다. */
  const truth = new Map();
  for (const h of O.역점?.표본 || []) {
    const n = (h.name || "").replace(/역$/, "");
    if (!truth.has(n)) truth.set(n, { lat: h.lat, lon: h.lon });
  }

  const names = L.stations.map((s) => s.name);
  const anchors = names.map((name) => {
    const gt = truth.get(name);
    if (gt) return { name, t: projectOnTrack(track, gt).t, src: "OSM 실좌표" };
    const a = A[name];
    if (!a?.dong) return { name, t: null, src: "이웃 등분" };
    const g = sggGeom(a.sgg);
    if (!g) throw new Error(`${L.name} ${name}: 시군구 '${a.sgg}' 가 경계 자료에 없다`);
    const c = dongCentre(dong, g, a.dong);
    return c ? { name, t: projectOnTrack(track, c).t, src: `${a.dong} 중심` } : { name, t: null, src: "이웃 등분" };
  });

  const placed = monotonicPositions(anchors, trackLen);
  if (placed.length !== names.length)
    throw new Error(`${L.name}: 역 ${names.length}개인데 ${placed.length}개만 배치됐다`); // ③
  for (let i = 1; i < placed.length; i++)
    if (placed[i].t < placed[i - 1].t)
      throw new Error(`${L.name}: 역 순서가 뒤집혔다 — ${placed[i - 1].name} → ${placed[i].name}`); // ①

  const pos = placed.map((p, i) => ({ ...pointAt(track, p.t), name: p.name, st: L.stations[i] }));

  /* ── Y자 지선 (오너 2026-09-09 "아직 반영되지 않은 Y자 분기는 진행해줘")
     ⚠️ **본선과 다른 자료다.** 본선 선형은 OSM 실측 401점이지만, 지선은 OSM 에 1km 토막뿐이고
        선로를 함께 쓰는 월곶~판교선도 OSM 선형이 0건이었다(2026-09-09 탐사 두 번).
        그래서 지선은 **역 점 네 개를 이은 개략선**이다 — 점은 전부 자료 기반(분기역·시흥시청은
        OSM 실좌표, 학온·매화는 소재 동 중심)이지만 **잇는 선은 실제 선형이 아니다.**
        처음엔 **점선**으로 그려 모양으로 구분했는데, 오너가 2026-09-09 에 "지선도 점선 아닌
        실선으로" 를 지시했다 — 점선이 "아직 계획"으로 읽혀 이미 착공한 구간을 깎아 보였다.
        그래서 **고지 자리를 옮긴다**: 선 모양이 아니라 각주 한 줄과 캡션이 말한다.
        굵기만 본선보다 얇게 두어 위계는 남긴다(본선 8 / 지선 6). */
  let branchPts = [], branchPos = [];
  if (L.branch?.stations?.length && L.branchAfter) {
    const from = pos.find((p) => p.name === L.branchAfter);
    if (!from) throw new Error(`${L.name}: 분기역 '${L.branchAfter}' 을 본선에서 못 찾았다`);
    branchPos = L.branch.stations.map((st) => {
      const gt = truth.get(st.name);
      if (gt) return { lat: gt.lat, lon: gt.lon, name: st.name, st, src: "OSM 실좌표" };
      const a2 = A[st.name];
      if (!a2?.dong) throw new Error(`${L.name} 지선 ${st.name}: 닻(시군구+동)이 없다 — 개략선도 못 그린다`);
      const g2 = sggGeom(a2.sgg);
      if (!g2) throw new Error(`${L.name} 지선 ${st.name}: 시군구 '${a2.sgg}' 가 경계 자료에 없다`);
      const c2 = dongCentre(dong, g2, a2.dong);
      if (!c2) throw new Error(`${L.name} 지선 ${st.name}: 동 '${a2.dong}' 을 ${a2.sgg} 안에서 못 찾았다`);
      return { lat: c2.lat, lon: c2.lon, name: st.name, st, src: `${a2.dong} 중심` };
    });
    branchPts = [{ lat: from.lat, lon: from.lon }, ...branchPos];
  }

  /* ── 직결 구간 (오너 2026-09-09 "누락된 역들도 표기해줘 (서해선 공통)")
     신안산선 지선은 시흥시청에서 **끝나지 않는다.** 거기서 서해선 선로로 직결해 원시까지 간다.
     이 6역은 2018.06 에 이미 열린 서해선 역이라 **우리 노선이 짓는 역이 아니다** —
     그래서 「정거장 본선 16역 + 지선 3역」 숫자는 그대로 두고, 지도에만 잇는다.
     ⚠️ 이 구간은 운행중이라 railway=rail 이다. construction 만 받던 탐사에 안 잡혔고,
        그래서 **따로 탐사해**(collect-rail-geo.mjs --extra) 실좌표 7개를 받아 왔다.
     ⑥ 여기 역은 **전부 OSM 실좌표여야 한다.** 이미 열린 역인데 좌표를 못 찾았다면
        이름을 잘못 적은 것이지 자료가 없는 게 아니다 — 그럴 땐 던진다. */
  let thruPts = [], thruPos = [];
  if (L.through?.stations?.length) {
    const OT = probe.결과?.find((x) => x.key === L.through.probeKey);
    if (!OT?.역점?.표본?.length)
      throw new Error(`${L.name}: 직결 구간 탐사(${L.through.probeKey})가 없다 — rail-geo.yml 을 --extra 로 돌린다`);
    const tmap = new Map();
    for (const h of OT.역점.표본) {
      const n = (h.name || "").replace(/역$/, "");
      if (h.railway === "station" && !tmap.has(n)) tmap.set(n, { lat: h.lat, lon: h.lon });
    }
    const from = [...pos, ...branchPos].find((p) => p.name === L.through.after);
    if (!from) throw new Error(`${L.name}: 직결 시작역 '${L.through.after}' 을 못 찾았다`);
    thruPos = L.through.stations.map((st) => {
      const c = tmap.get(st.name);
      if (c) return { lat: c.lat, lon: c.lon, name: st.name, st, src: "OSM 실좌표" };
      /* ⑦ **아직 안 지은 역**은 OSM 에 점이 없다(국제테마파크 — 2026-09-09 탐사에서 상자 안에
         그 이름이 아예 없었다). 그럴 때는 **양옆 실좌표 두 개와 공표된 역간거리**로 내분한다.
         닻(동 중심)보다 낫다 — 두 끝이 실좌표이고 사이 거리가 공표값이라 오차가 선형 구간의
         굽이만큼밖에 안 생긴다. 대신 근거가 없으면 **던진다** — 지어내지 않는다. */
      const bt = st.between;
      if (!bt) throw new Error(`${L.name} 직결 ${st.name}: OSM 실좌표도 between 근거도 없다`); // ⑥
      const a = tmap.get(bt.from), b = tmap.get(bt.to);
      if (!a || !b) throw new Error(`${L.name} 직결 ${st.name}: 기준역(${bt.from}·${bt.to}) 실좌표가 없다`);
      if (!(bt.kmFrom > 0) || !(bt.kmTo > 0)) throw new Error(`${L.name} 직결 ${st.name}: 역간거리가 없다`);
      const f = bt.kmFrom / (bt.kmFrom + bt.kmTo);
      return { lat: a.lat + (b.lat - a.lat) * f, lon: a.lon + (b.lon - a.lon) * f,
               name: st.name, st, src: `${bt.from}~${bt.to} ${bt.kmFrom}:${bt.kmTo} 내분` };
    });
    thruPts = [{ lat: from.lat, lon: from.lon }, ...thruPos];
  }

  /* ── 화면 좌표계 — 위도 보정을 넣어 가로세로 비율을 지킨다(지도는 늘리면 거짓말이다). */
  const all = [...track, ...branchPts, ...thruPts];
  const lat0 = Math.min(...all.map((p) => p.lat)), lat1 = Math.max(...all.map((p) => p.lat));
  const lon0 = Math.min(...all.map((p) => p.lon)), lon1 = Math.max(...all.map((p) => p.lon));
  const kx = Math.cos(((lat0 + lat1) / 2 * Math.PI) / 180);
  /* 오른쪽에 역 이름이 붙으므로 지도를 왼쪽으로 몰고 이름 자리를 비워 둔다. */
  /* 오른쪽 이름 자리는 **가장 긴 역 이름에서 계산한다.** 고정값으로 두면 짧은 노선에서는
     지도가 쓸데없이 작아지고(세로 여백이 남고), 긴 이름 노선에서는 이름이 잘린다. */
  /* ⚠️ 「가칭」을 역마다 붙이면 16역 중 10역에 반복되고, 그만큼(44px) 라벨 폭이 늘어
     **지도가 작아진다**(가로가 병목이라 라벨 폭이 곧 지도 크기다). 범례 한 줄로 옮긴다. */
  const LBL_FS = 23;   /* 21 → 23 (오너 2026-09-09 "조금만 더 크게") */
  /* ⚠️ 이름 길이·뱃지 폭·환승 키 대조는 **본선만 보면 안 된다.** 지선·직결 구간 역이
     더 길거나 뱃지가 더 많으면 그만큼 잘리거나 카드 밖으로 나간다. */
  const everySt = [...L.stations, ...(L.branch?.stations || []), ...(L.through?.stations || [])];
  const maxNm = Math.max(...everySt.map((st) => [...st.name].length));
  const provCount = L.stations.filter((st) => st.state === "가칭" || st.state === "역명미정").length;
  /* 환승 키 전수 대조 — 카탈로그에 없으면 뱃지가 조용히 안 그려진다(rail-line 과 같은 규칙). */
  for (const st of everySt)
    for (const k of st.xfer || [])
      if (!CAT[k]) throw new Error(`${L.name} ${st.name}: 환승 키 '${k}' 가 카탈로그에 없다`); // ④
  /* 뱃지 자리는 **가장 뱃지가 많은 역**이 정한다. 이름은 그 오른쪽에서 전부 같은 x 로 시작한다 —
     뱃지 뒤에 바로 붙이면 역마다 이름 시작점이 들쭉날쭉해 읽는 눈이 계속 좌우로 흔들린다. */
  const BDG_W = Math.max(0, ...everySt.map((st) => badgeRowWidth(st.xfer || [])));
  const BDG_PAD = BDG_W ? 10 : 0;
  /* 한 행의 최대 폭 = 뱃지 구역 + 이름 + (가칭). 좌우 배치는 이 폭을 **양쪽에** 둔다. */
  const ROW_W = Math.round(BDG_W + BDG_PAD + maxNm * LBL_FS * 0.98);
  /* 30 → 36 (오너 2026-09-09 "호수·중앙 지시선 위치 보정"). 30 이면 점 테두리(13)를 빼고
     남는 가로가 17px 뿐이라, 라벨이 22px 아래로 밀린 역(중앙·호수)에서 지시선이
     **17×22 짜리 급경사 토막**이 되어 어디를 가리키는지 안 보였다.
     지금 지도는 세로가 병목이라 좌우를 조금 더 써도 지도가 안 줄어든다 — 공짜로 넓힌다. */
  const LEAD_W = 36;                       // 지시선이 최소한 이만큼은 보여야 어느 점인지 안다
  const SIDE_W = ROW_W + LEAD_W;
  /* 위아래 여백 10 → 34 (오너 2026-09-09 "역 위아래 여백이 너무 없어졌네"). 끝 역의 이름이
     테두리에 붙어 숨이 막혔다. 지도가 그만큼 작아지지만 읽는 쪽이 편한 게 먼저다. */
  const PADT = 34, PADB = 34;
  /* a·b·d 는 좌우 교차 → 양쪽에 자리. c 는 현행(오른쪽 한 열). */
  const TWO_SIDED = VARIANT !== "c";
  let PADL = TWO_SIDED ? SIDE_W : 22;
  let PADR = TWO_SIDED ? SIDE_W : Math.round(30 + ROW_W + 8);
  const spanX = (lon1 - lon0) * kx, spanY = lat1 - lat0;
  /* ⚠️ 좌우 여백을 **최악값(가장 긴 이름 + 가장 많은 뱃지)** 으로 잡으면 지도가 확 줄어든다.
     신안산선 실측(2026-09-09): 최악값 344px × 2 = 688px 을 이름 자리로 떼어 주니 지도에 남는
     가로가 280px 뿐이라 **가로가 병목**이 되고, 세로로는 386px 이 빈 채로 남았다 —
     오너가 "여의도 윗부분과 아랫부분 여백을 날려 달라"고 한 게 이 여백이다.
     실제로는 뱃지 있는 역은 오른쪽에 몰리므로 왼쪽은 그만큼 필요 없다. 그래서 **두 번 잰다** —
     한 번 놓아 보고, 그 배치가 실제로 쓰는 폭으로 여백을 다시 잡아 더 크게 그린다. */
  let s, offX, offY;
  const fit = () => {
    s = Math.min((MAP_W - PADL - PADR) / spanX, (BODY_H - PADT - PADB) / spanY);
    offX = PADL + (MAP_W - PADL - PADR - spanX * s) / 2;
    offY = PADT + (BODY_H - PADT - PADB - spanY * s) / 2;
  };
  fit();
  const X = (lon) => offX + (lon - lon0) * kx * s;
  const Y = (lat) => BODY_H - (offY + (lat - lat0) * s);
  const d = (g) => g.map((p, i) => `${i ? "L" : "M"}${X(p.lon).toFixed(1)},${Y(p.lat).toFixed(1)}`).join("");

  /* ── 역 점·이름.
     ⚠️ 도심 구간은 역간 1km 라 화면에서 20px 도 안 떨어진다. 한쪽에 몰면 다섯 개가 겹친다.

     ── 좌우 교차 (오너 2026-09-09 "노선의 좌, 우로 겹치지 않게")
     한쪽 열에 다 몰던 것을 **양쪽으로 나눈다.** 나누면 같은 쪽 이웃 간격이 두 배가 되어
     밀어내는 양이 절반으로 준다 — 라벨이 제 점 가까이 남고 지시선이 짧아진다.
     쪽을 정하는 규칙:
       ① 번갈아 놓는 것을 기본으로 하되,
       ② 그 쪽으로 놓으면 카드 밖으로 나가는 역은 반대쪽으로 (가장자리 역이 잘리는 걸 막는다)
       ③ 뱃지가 있는 역은 **오른쪽을 우선**한다 — 왼쪽에 놓으면 뱃지가 이름보다 더 왼쪽에
          가서 이름·뱃지 순서가 좌우로 뒤집힌다(오너가 원한 "이름 앞 로고"가 깨진다).
     그다음 **쪽마다 따로** 세로 겹침을 푼다. */
  const rowW = (st) => {
    const k = st.xfer || [];
    return (k.length ? badgeRowWidth(k) + BDG_PAD : 0) + [...p2name(st)].length * LBL_FS * 0.98;
  };
  function p2name(st) { return st.name; }

  /* 어느 갈래에 속한 역인지 표를 붙인다 — ⑤ 에서 **제 선은 빼고** 남의 선만 재기 위해서다. */
  const allPos = [...pos.map((p) => ({ ...p, cid: 0 })),
                  ...branchPos.map((p) => ({ ...p, cid: 1 })),
                  ...thruPos.map((p) => ({ ...p, cid: 2 }))];
  /* 배치는 **여러 번 돈다**(아래 2패스). 그래서 화면 좌표에 매달린 것은 전부 이 안에서 새로 잰다. */
  const assignSides = () => {
  /* ⑤ 를 재려면 **그려질 선들의 화면 좌표**가 필요하다. 본선·지선·직결 세 갈래다. */
  const corridorPx = [mainWay.g, branchPts, thruPts]
    .map((g) => g.map((q) => ({ x: X(q.lon), y: Y(q.lat) })));
  return allPos.map((p, i) => {
    const x = X(p.lon), y = Y(p.lat);
    const w = rowW(p.st);
    /* 카드 밖으로 안 나가는가 */
    const fitsCard = (sd) => (sd > 0 ? x + LEAD_W + w <= MAP_W - 6 : x - LEAD_W - w >= 6);
    /* ⑤ 그쪽에 **남의 선이 있는가** — 있으면 반대쪽(바깥)으로 보낸다.
       ⚠️ 나란한 두 선(신안산선 본선 ↔ 서해선 직결 구간, 화면에서 95px)에서 두 선 **사이**로
          라벨을 뻗으면 양쪽에서 마주 뻗어 정면 충돌한다 — 「장하」와 「달미」가 70% 겹쳤다
          (2026-09-09 실측). 처음엔 "선을 실제로 넘는가"만 봤는데, 두 라벨은 선을 넘지 않고
          **사이에서** 부딪혔다. 그래서 **닿기 전에** 비킨다 — 라벨 길이에 여유(CLEAR)를 더해
          그 안에 남의 선이 들어오면 반대쪽이다.
       ⚠️ 제 선은 뺀다(cid). 안 빼면 곡선 구간에서 자기 선이 걸려 아무 쪽도 못 고른다. */
    /* 규칙 한 줄: **두 선 사이의 틈은 반씩 나눠 쓴다.**
       내 라벨이 그 절반을 넘겨야 들어가면 그쪽은 내 자리가 아니다 — 바깥으로 나간다.
       (처음엔 "남의 선을 실제로 넘는가"로 쟀다. 「달미」의 라벨 끝이 본선에서 **1px** 모자라
        통과했고, 마주 뻗은 「장하」와 70% 겹쳤다. 닿았는지가 아니라 **나눠 쓸 수 있는지**를
        묻는 게 맞다.) */
    const gapTo = (sd) => {
      let best = Infinity;
      corridorPx.forEach((g, ci) => {
        if (ci === p.cid) return;              // 제 선은 안 센다
        for (const q of g) {
          if (Math.abs(q.y - y) >= 13) continue;
          const dx = sd > 0 ? q.x - x : x - q.x;
          if (dx > 12 && dx < best) best = dx;
        }
      });
      return best;
    };
    /* ⚠️ 「내 라벨이 쓰는 폭」을 LEAD_W + w 로 쟀다가 **14px 모자랐다** — 실제 글자는 지시선 끝에서
       9px 더 떨어져 시작한다(뱃지·이름 앞 틈). 「달미」와 「장하」가 154px 틈을 사이에 두고
       서로 84px 씩 뻗어 겹쳤다(2026-09-09). 재는 폭에 그 9px 과 여유 8px 을 넣는다. */
    const reach = 9 + LEAD_W + w + 8;
    const crossesLine = (sd) => reach > gapTo(sd) / 2;
    /* ④ 정보 패널 자리에 걸리는가 — 패널은 불투명이라 걸리면 이름이 통째로 사라진다.
       ⚠️ 처음엔 "왼쪽 패널 하나"를 전제로 짰다(side<0 일 때만 검사). 시안 d 는 패널이
          우하단에도 있어 그 규칙으로는 안 잡힌다. **양쪽 다 재고 비는 쪽으로 보낸다.** */
    const hitsPanel = (sd) => {
      const a0 = sd > 0 ? x : x - LEAD_W - w, a1 = sd > 0 ? x + LEAD_W + w : x;
      return PANELS.some((P) => a1 > P.x0 - 10 && a0 < P.x1 + 10 && y > P.y0 - 22 && y < P.y1 + 22);
    };
    /* 순서에 뜻이 있다 — 뒤로 갈수록 **못 참는 것**이다.
       ① 번갈아(기본) → ③ 뱃지는 오른쪽 → ② 카드 밖 → ⑤ 선 가로지름 → ④ 패널에 먹힘.
       ②는 매번 다시 본다 — 뒤 규칙이 뒤집은 쪽이 카드 밖이면 그건 더 나쁘다. */
    let side = i % 2 === 0 ? 1 : -1;                          // ①
    if ((p.st.xfer || []).length) side = 1;                   // ③
    if (!fitsCard(side) && fitsCard(-side)) side = -side;     // ②
    if (crossesLine(side) && !crossesLine(-side) && fitsCard(-side)) side = -side;  // ⑤
    if (hitsPanel(side) && !hitsPanel(-side) && fitsCard(-side)) side = -side;      // ④
    return { ...p, x, y, ly: y, side };
  });
  };

  /* ── 2패스: 실제 배치가 쓰는 폭으로 좌우 여백을 다시 잡고 지도를 키운다.
     한쪽에 아무것도 없으면 그 쪽은 24px 만 남긴다. 여백을 줄이면 배율이 커지고,
     배율이 커지면 역 위치가 달라져 쪽이 바뀔 수 있다 — 그래서 **몇 번 돌려 안정될 때까지** 본다.
     ⚠️ 마지막에 한 번 더 확인한다. 배치를 바꾼 뒤 여백이 모자라면 그때는 **여백을 넓히고
        쪽은 그대로 둔다** — 여기서 또 쪽을 바꾸면 두 상태를 오갈 수 있다. */
  const needSide = (g, sd) => {
    const q = g.filter((p) => p.side === sd);
    return q.length ? Math.round(Math.max(...q.map((p) => rowW(p.st))) + LEAD_W + 8) : 24;
  };
  let lbl = assignSides();
  if (TWO_SIDED) {
    for (let pass = 0; pass < 3; pass++) {
      const nL = needSide(lbl, -1), nR = needSide(lbl, 1);
      if (Math.abs(nL - PADL) < 4 && Math.abs(nR - PADR) < 4) break;
      PADL = nL; PADR = nR; fit(); lbl = assignSides();
    }
    const fL = needSide(lbl, -1), fR = needSide(lbl, 1);
    if (fL > PADL || fR > PADR) {
      PADL = Math.max(PADL, fL); PADR = Math.max(PADR, fR); fit();
      for (const p of lbl) { p.x = X(p.lon); p.y = Y(p.lat); p.ly = p.y; }
    }
  }

  /* ── 배경: 시군구 경계 + 한강 */
  const PADD = 0.05;
  const inBox = (r) => r.some(([lon, lat]) =>
    lat > lat0 - PADD && lat < lat1 + PADD && lon > lon0 - PADD && lon < lon1 + PADD);
  /* ⚠️ 예전에는 시군구 폴리곤만 칠했다. 그러면 바다·경계 밖이 **카드 바탕(흰색)** 으로 남아
     지도가 어디서 시작해 어디서 끝나는지 모호했고, 좌상단 정보 패널이 지도 밖에 뜬 것처럼 보였다
     (오너 2026-09-09). 판 전체를 같은 색으로 깔고 잉크 테두리를 두른다. */
  /* ── 시·도를 **면색**으로 나눈다 (오너 2026-09-09 3차)
     경계선을 진하게 긋는 방식을 두 판 시도했는데, 선이 굵으면 지도가 어지럽고 얇으면 안 보였다.
     오너 제안대로 **선은 전부 같은 연회색으로 두고, 서울·경기·인천의 바탕색만 조금씩 달리한다.**
     차이는 작아야 한다 — 이건 배경이지 정보가 아니다. 주인공은 빨간 노선이다.
     판 바탕(바다·경계 밖)은 세 색 어디와도 겹치지 않는 중간 톤으로 둔다. */
  const SIDO_FILL = {
    서울특별시: "#e8e2d6",
    경기도: "#f2efe8",
    인천광역시: "#e4e8e5",
  };
  const FILL_ETC = "#edeae3";
  let land = `<rect x="0" y="0" width="${MAP_W}" height="${BODY_H}" fill="${FILL_ETC}"/>`;
  for (const f of sgg.features) {
    const fill = SIDO_FILL[f.properties?.sido] || FILL_ETC;
    for (const r of rings(f.geometry)) {
      if (!inBox(r)) continue;
      land += `<path d="${r.map(([lon, lat], i) => `${i ? "L" : "M"}${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join("")}Z" fill="${fill}" stroke="#dcd8cf" stroke-width="1.1"/>`;
    }
  }

  /* ⚠️ 시·도 경계를 **선으로** 긋던 블록은 걷어냈다(오너 2026-09-09 3차).
     두 판을 시도했다 — ① 시도별 바깥선(인천 해안선·경기 외곽까지 진해짐) ② 시도 상호 경계만.
     ②는 정확했지만 결국 "선이 하나 더 있는" 지도였다. 지금은 **면색**이 그 일을 한다(위 SIDO_FILL).
     되살릴 일이 생기면 git 이력에 있다 — 여기에 주석으로 남겨 두지 않는다. */
  const sidoLine = "";

  /* 지명을 적을 수 있는 가로 범위 — 좌우 교차에서는 이름이 양쪽에 있으므로
     "노선 주변"만 비워 두면 된다. 아래 far() 가 점·선과의 거리로 다시 거른다. */
  const SAFE_L = TWO_SIDED ? 26 : 40;
  const SAFE_R = TWO_SIDED ? MAP_W - 26 : Math.max(...pos.map((p) => X(p.lon))) - 20;

  /* ── 한강. sudogwon-map 과 같은 부품을 쓴다 — 강을 두 곳에서 그리면 갈라진다. */
  let river = "";
  try {
    const named = sgg.features.map((f) => ({ name: f.properties.name, rings: rings(f.geometry) }));
    const hr = hanRiverPoints(named);
    river = `<path d="${hr.map(([lon, lat], i) => `${i ? "L" : "M"}${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join("")}" fill="none" stroke="#c3d9e9" stroke-width="13" stroke-linecap="round"/>`;
  } catch (e) { throw new Error(`${L.name}: 한강을 못 그렸다 — ${e.message}`); }

  /* ⚠️ 배경 철도선(경부·경인·안산선 등)은 **그리지 않는다**(오너 2026-09-09 "어지럽다").
     한 번 넣었다가 뺀 자리다 — 34종 회색 선이 깔리니 지도가 지저분해지고, 정작 우리 노선의
     빨간 선이 그 속에 묻혔다. 어느 노선과 만나는지는 **역 이름 앞 환승 뱃지**가 이미 말한다.
     자료(data/geo/rail-context.json)는 그대로 둔다 — 되살릴 일이 생기면 받아 놓은 걸 쓴다. */
  const ctx = "";

  /* 노선색은 rail-line 과 **같은 자리에서 같은 규칙으로** 온다 — 두 판형이 다른 색을 쓰면
     같은 노선이 두 색으로 나간다. SELF 표도 rail-line 에서 그대로 가져온다. */
  const selfKey = SELF[L.key];
  if (!selfKey || !CAT[selfKey]) throw new Error(`${L.name}: 카탈로그에 자기 노선(${selfKey}) 이 없다`); // ④
  const lc = CAT[selfKey].color;

  const line = `<path d="${d(mainWay.g)}" fill="none" stroke="${lc}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
    /* 지선 — **실선**(오너 2026-09-09). 개략이라는 고지는 각주·캡션이 진다. */
    + (branchPts.length
      ? `<path d="${d(branchPts)}" fill="none" stroke="${lc}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
      : "")
    /* 직결 구간 — 더 얇게. 본선 8 > 지선 6 > 직결 5 로 위계를 굵기 하나로만 준다
       (색을 바꾸면 노선색이 두 개가 되고, 점선은 오너가 물렸다). */
    + (thruPts.length
      ? `<path d="${d(thruPts)}" fill="none" stroke="${lc}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
      : "");


  /* 지도 위에 글자를 얹을 때의 유일한 방법 — 글자 테두리를 먼저 칠하고 그 위에 글자를 칠한다.
     paint-order 없이 stroke 를 주면 획이 글자 안쪽까지 먹어 굵고 뭉개져 보인다. */
  const HALO = TWO_SIDED ? ' stroke="#fbfaf7" stroke-width="4.5" paint-order="stroke" stroke-linejoin="round"' : "";
  const LBL_GAP = 32;  /* 글자 23px + 여유 9px. 폰트를 키웠으면 간격도 같이 키운다 */
  /* ⚠️ 겹침 해소는 **배열 순서가 아니라 y 순서**로 돌아야 한다. 본선 뒤에 지선을 이어 붙였더니
     지선 역들이 본선 마지막 역 뒤로 정렬돼 카드 아래로 밀리고, 지시선이 지도를 가로질렀다
     (2026-09-09). 아래로 미는 규칙은 "위에서 아래로 훑는다"를 전제하므로 정렬이 먼저다. */
  for (const sd of [1, -1]) {
    const g = lbl.filter((p) => p.side === sd).sort((x, y2) => x.y - y2.y);
    for (let i = 1; i < g.length; i++)
      if (g[i].ly - g[i - 1].ly < LBL_GAP) g[i].ly = g[i - 1].ly + LBL_GAP;
    const BOT = BODY_H - 20;
    if (g.length && g[g.length - 1].ly > BOT) g[g.length - 1].ly = BOT;
    for (let i = g.length - 2; i >= 0; i--)
      if (g[i + 1].ly - g[i].ly < LBL_GAP) g[i].ly = g[i + 1].ly - LBL_GAP;
    for (const p of g) if (p.ly < 16) p.ly = 16;
  }

  let inMap = "", outMap = "";
  for (const p of lbl) {
    const prov = p.st.state === "가칭" || p.st.state === "역명미정";
    const keys = p.st.xfer || [];
    const bw = keys.length ? badgeRowWidth(keys) + BDG_PAD : 0;

    /* 양쪽 모두 **읽는 순서로 [뱃지][이름]** 이다 (오너 2026-09-09: "역이름 왼쪽(앞)에 로고").
       ⚠️ 앞 판은 왼쪽에서 [이름][뱃지][지시선] 이었다 — 안쪽(노선쪽)에 뱃지를 두면 대칭이라는
          생각이었는데, 그러면 왼쪽 역만 로고가 이름 **뒤**로 가서 오너 지시가 깨진다.
          대칭보다 **읽는 순서**가 먼저다.
       오른쪽: [지시선][뱃지][이름] · 왼쪽: [뱃지][이름][지시선] */
    const nameW = [...p.name].length * LBL_FS * 0.98;
    const bwRaw = keys.length ? badgeRowWidth(keys) : 0;
    let bx, nameX, anchor, endX;
    if (p.side > 0) {
      endX = p.x + LEAD_W;
      bx = endX + 9;
      nameX = bx + bw;
      anchor = "start";
    } else {
      endX = p.x - LEAD_W;
      nameX = endX - 9;               // text-anchor=end 라 이 x 가 이름의 오른쪽 끝
      bx = nameX - nameW - BDG_PAD - bwRaw;
      anchor = "end";
    }

    /* ── 지시선 (오너 2026-09-09 "위치나 간격 등을 신경써서 검수해줘")
       ⚠️ 앞 판에서는 꺾는 자리를 **끝에서 14px** 로 고정했다. 그러면 라벨이 60px 밀린 역에서
          꺾인 뒤 구간이 14:60 — 거의 수직으로 서서 지시선이 아니라 **막대**로 보였다.
       고쳐 쓴 규칙: 대각은 **45°**로 두고(가로 이동량 = 세로 이동량), 자리가 모자라면
       있는 만큼만 눕힌다. 라벨 바로 앞 10px 은 **항상 수평**으로 남겨 글자에 곧게 닿는다.
         [점] ──수평── ╲45° ──10px── [뱃지·이름]
       가로 여유가 없으면(짧은 지시선) 그냥 대각 하나로 잇는다 — 억지로 세 토막을 만들면
       10px 짜리 조각이 생겨 지저분하다. */
    const dy = p.ly - p.y;
    const sxH = p.x + p.side * 13;                // 가로로 나갈 때의 출발점(점 테두리)
    const run = Math.abs(endX - sxH);
    const STUB = 10;
    let lead;
    if (Math.abs(dy) < 1.5) {
      lead = `<path d="M${sxH.toFixed(1)},${p.y.toFixed(1)}H${endX.toFixed(1)}"`;
    } else {
      const diag = Math.min(Math.abs(dy), run - STUB - 4);
      const leadOut = run - STUB - diag;          // 점에서 곧게 빠져나오는 길이
      if (leadOut >= 10) {
        /* 자리가 넉넉하다 — 곧게 빠져나와 45°로 꺾고 라벨 앞 10px 은 수평으로 (오너가 고른 모양) */
        const k1 = sxH + p.side * leadOut, k2 = endX - p.side * STUB;
        lead = `<path d="M${sxH.toFixed(1)},${p.y.toFixed(1)}H${k1.toFixed(1)}L${k2.toFixed(1)},${p.ly.toFixed(1)}H${endX.toFixed(1)}"`;
      } else {
        /* 자리가 없다 — 한 줄로 곧장 잇는다.
           ⚠️ 이때 출발점을 **가로 테두리(sxH)** 에 두면 안 된다. 「중앙」은 그렇게 나가다
              바로 위 「성포」의 역 표시를 뚫고 지나가 성포에서 뻗은 선처럼 보였다(2026-09-09).
              **가는 방향의 테두리**에서 출발시키면 이웃 역을 비껴간다. */
        const vx = endX - p.x, vy = p.ly - p.y, vL = Math.hypot(vx, vy) || 1;
        const sx = p.x + (vx / vL) * 13, sy = p.y + (vy / vL) * 13;
        lead = `<path d="M${sx.toFixed(1)},${sy.toFixed(1)}L${endX.toFixed(1)},${p.ly.toFixed(1)}"`;
      }
    }
    lead += ` stroke="#9aa1ac" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

    let bd = "";
    if (keys.length) {
      let bxx = bx;
      for (const k of keys) { bd += badgeSvg(k, bxx, p.ly); bxx += badgeWidth(k) + BDG_GAP; }
    }

    inMap += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="9.5" fill="${prov ? "#f0eee9" : "#ffffff"}" stroke="${lc}" stroke-width="5"${prov ? ' stroke-dasharray="3.2 2.4"' : ""}/>`;
    outMap += lead + bd +
      `<text x="${nameX.toFixed(1)}" y="${p.ly.toFixed(1)}" font-size="${LBL_FS}" font-weight="800" fill="#141821" letter-spacing="-0.6" dominant-baseline="middle" text-anchor="${anchor}"${HALO}>${esc(p.name)}` +
      `</text>`;
  }
  /* 가칭 역은 **점 모양**으로 구분한다 — 이름 옆 글자 대신. 범례는 아래 한 줄. */

  /* 역 이름·뱃지가 차지한 상자들 — 지명은 여기도 피한다. */
  const lblBoxes = lbl.map((p) => {
    const w = rowW(p.st) + LEAD_W + 22;
    return p.side > 0
      ? { x0: p.x, x1: p.x + w, y0: p.ly - 19, y1: p.ly + 19 }
      : { x0: p.x - w, x1: p.x, y0: p.ly - 19, y1: p.ly + 19 };
  });
  /* ⚠️ 처음엔 **지명의 중심 한 점**만 라벨 상자 안인지 봤다. 그러면 「동작구」처럼 3글자짜리
     지명은 중심만 살짝 비켜도 통과하면서 글자 왼쪽이 역 이름을 파고든다
     (designQa svglabel 12% 겹침, 2026-09-09). 점이 아니라 **상자 대 상자**로 잰다. */
  const hitsLabel = (x, y, w, h) => lblBoxes.some((b2) =>
    x + w / 2 > b2.x0 && x - w / 2 < b2.x1 && y + h / 2 > b2.y0 && y - h / 2 < b2.y1);

  /* ── 시군구 이름. **라벨을 다 놓은 뒤에** 정한다 — 남은 자리에만 적기 때문이다.
     처음엔 라벨보다 먼저 계산했다가 「광명」이 「시흥사거리」와 100% 겹쳤다(designQa 가 잡음).
     halo 때문에 눈으로는 넘어갔다 — 눈이 아니라 좌표가 판정한다. **화면 안에 중심이 들어오는 것만** 적는다 — 가장자리에 걸친 구의
     이름을 중심에 찍으면 화면 밖이나 엉뚱한 자리에 뜬다. */
  /* ⚠️ 중심에 그냥 찍으면 **노선과 역 위에 올라앉는다**(2026-09-09 — 금천구가 독산역을,
     안산시상록구가 성포역을 덮었다). 지명은 배경이지 정보가 아니므로, 자리가 없으면
     **안 적는다.** 밀어내면 엉뚱한 구에 이름이 붙어 그게 더 나쁘다. */
  const trackPx = track.map((p) => ({ x: X(p.lon), y: Y(p.lat) }));
  const dotPx = pos.map((p) => ({ x: X(p.lon), y: Y(p.lat) }));
  const far = (x, y, pts, min) => pts.every((q) => Math.hypot(q.x - x, q.y - y) > min);
  let sggNm = "";
  for (const f of sgg.features) {
    const c = ringCentroid(f.geometry);
    if (!c) continue;
    const x = X(c[0]), y = Y(c[1]);
    if (x < SAFE_L || x > SAFE_R || y < 30 || y > BODY_H - 34) continue;
    if (!far(x, y, trackPx, 34) || !far(x, y, dotPx, 52)) continue;
    /* 「안산시상록구」처럼 붙여 쓴 이름은 읽기 어렵다 — 시와 구를 띄우고, 시로 끝나면 시를 뗀다. */
    const nm = f.properties.name.replace(/^(.+?)시(.+?구)$/, "$1 $2").replace(/시$/, "");
    const nw = [...nm].length * 15 + 8;
    if (hitsLabel(x, y, nw, 22)) continue;
    /* 지명은 **정보 패널 자리도 피한다.** 패널이 반투명이라 밑에 깔린 지명이 비쳐 보인다
       (2026-09-09 시안 d — 우하단 정보 뒤로 「수원 장안구」가 비쳤다). */
    if (PANELS.some((P) => x + nw / 2 > P.x0 && x - nw / 2 < P.x1 && y + 11 > P.y0 && y - 11 < P.y1)) continue;
    sggNm += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="15" font-weight="700" fill="#aeb3bb" text-anchor="middle" letter-spacing="0.4">${esc(nm)}</text>`;
  }


  /* ── 지도를 어디서 자를 것인가 (오너 질문 2026-09-09)
     좌우 교차에서는 이름이 양쪽에 있으므로 **노선 주변만 남기고 양옆을 자른다.**
     자르는 폭은 노선의 실제 가로 범위 + 여유다 — 고정값이면 노선마다 여백이 달라진다.
     안 자르면 면색·한강이 이름·뱃지 뒤까지 깔려 뱃지가 강 위에 앉는다(2026-09-09 실측). */
  const dotXs = pos.map((p) => X(p.lon));
  /* ⚠️ 처음엔 좌우 교차에서 **노선 주변만 남기고 잘랐다.** 그랬더니 지도가 세로 띠가 되고
     양옆 흰 바탕에 이름이 떠서 「지도 위 노선」이 아니라 「목록 옆 그림」이 됐다(2026-09-09).
     자르는 대신 **이름에 흰 테두리(halo)** 를 둘러 지도 위에서 읽히게 한다 —
     자르면 정보(지리)가 사라지고, halo 는 안 사라진다.
     한 열짜리(c)만 예전처럼 이름 열 왼쪽에서 자른다. */
  const clipL = TWO_SIDED ? 0 : 0;
  const clipR = TWO_SIDED ? MAP_W : Math.max(...dotXs) + 22;
  const clipId = `rgmclip-${L.key}-${VARIANT}`;
  const mapSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${BODY_H}" width="${MAP_W}" height="${BODY_H}">` +
    `<defs><clipPath id="${clipId}"><rect x="${clipL.toFixed(1)}" y="0" width="${(clipR - clipL).toFixed(1)}" height="${BODY_H}" rx="13"/></clipPath></defs>` +
    `<g clip-path="url(#${clipId})">${land}${sidoLine}${river}${ctx}${sggNm}${line}${inMap}</g>${outMap}` +
    /* 테두리는 **맨 위에, 클립 밖에서** 긋는다 — 클립 안에서 그으면 자기 자신이 반쯤 잘린다. */
    `<rect x="1.5" y="1.5" width="${(MAP_W - 3).toFixed(1)}" height="${(BODY_H - 3).toFixed(1)}" rx="13" fill="none" stroke="#141821" stroke-width="3"/></svg>`;

  /* ⚠️ rail-line@1 은 6항목인데 여기 옮길 때 **「예상 공사기간」이 빠졌다**(2026-09-09 대조).
     같은 소재의 두 판형이 다른 정보를 보이면 어느 쪽이 맞는지 독자가 알 수 없다. */
  const facts = [
    { k: "착공", v: L.start },
    { k: "예상 공사기간", v: buildPeriod(L.start, L.openNow) },
    { k: "연장", v: L.km },
    { k: "정거장", v: L.stationNote },
    { k: "총사업비", v: L.cost },
    { k: "시행자", v: L.operator },
  ].filter((f) => f.v);

  const card = {
    template: "rail-geomap@1", date, lc, variant: VARIANT, splitInfo: SPLIT_INFO,
    subtitle: `서울 수도권 주요 노선 · 공사 현황 · ${rail.meta.asOfLabel} 기준`,
    title: `<span class="ln wirit-linecolor">${L.name}</span> ${L.titleAsk || "언제 개통하지?"}`,
    mapSvg,
    prog: { value: L.progressText, asOf: L.progressNote || `${rail.meta.asOfLabel} · 국가철도공단`,
            width: `${L.progress}%`, zero: L.progress === 0 },
    eta: { was: L.openWas, now: L.openNow },
    facts,
    /* ⚠️ 지도에 **안 그린 것**을 카드가 말한다. 우측에는 「본선 16역 + 지선 3역」이라 적히는데
       지도에는 본선만 있다 — 말하지 않으면 지선 3역이 어디 갔는지 아무도 모른다.
       지선을 억지로 그리지 않는 이유: OSM 에 광명 지선은 1km 토막뿐이라 선형이 없다.
       양 끝만 알고 가운데를 직선으로 이으면 그건 실제 선형이 아니고, 이 판형이 내세우는
       「선형은 실제다」가 그 순간 거짓이 된다. 안 그리고 밝히는 쪽을 고른다. */
    /* 각주가 **지도의 표기 규칙**을 말한다. 카드만 캡처돼 돌 때 캡션이 안 따라가므로,
       모양으로 구분한 것(점선 지선·점선 링 가칭)은 여기서 한 번 설명한다. */
    note: [
      provCount ? "◌ 점선 = 가칭역" : "",
      /* ⚠️ 「지선·공용 구간은 잇는 선이 개략」 한 줄은 오너 지시로 뺐다(2026-09-09).
         고지가 사라진 게 아니다 — 캡션의 「※ 노선 선형은 실제 좌표(OpenStreetMap),
         역 위치는 개략 표기입니다.」가 그대로 지고 있고, 그 줄은 가드 ⑤ 가 지킨다.
         여기 다시 넣지 말 것. */
      /* 각주는 **한 줄**이 목표다 — 두 줄로 넘어가면 마지막 줄에 두 글자만 남아 지저분해진다.
         긴 설명(L.shared)은 캡션이 지고, 카드에는 줄인 판(sharedShort)을 쓴다. */
      L.sharedShort || L.shared || "",
    ].filter(Boolean).join("  ·  "),
    layout: { titleFs: TITLE_FS_BY_V[VARIANT], titleGap: 16, barGap: 18, bodyGap: 16, bodyH: BODY_H, mapW: MAP_W },
    source: { name: L.src },
  };

  return { card, placed, anchors, trackLen, mainWay };
}

const outDir = publish ? join(ROOT, `data/content/${date}`) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });

let made = 0;
for (const L of rail.lines) {
  if (ONLY && L.key !== ONLY) continue;
  if (!probe.결과?.some((x) => x.key === L.key && x.좌표?.length)) {
    console.log(`⏭ ${L.name} — OSM 선형이 아직 없다 (rail-geo.yml 을 그 노선으로 돌리세요)`);
    continue;
  }
  const { card, placed, anchors, trackLen } = buildOne(L);
  writeFileSync(join(outDir, `railmap-${L.key}.json`), JSON.stringify(card, null, 2) + "\n");

  /* ⑤ 개략 고지는 **캡션이 유일한 자리**다(오너 2026-09-09 선택). 그래서 코드가 넣는다. */
  const 개략고지 = "※ 노선 선형은 실제 좌표(OpenStreetMap), 역 위치는 개략 표기입니다.";
  const cap = [
    `🗺️ ${L.name}, 지도 위에 그려 보면 이렇게 지나갑니다`, "",
    `공정률 ${L.progressText}%`,
    `📅 당초 ${L.openWas} → 지금 ${L.openNow}`, "",
    `📍 ${L.start.replace(/^(\d{4})\.0?(\d{1,2})$/, "$1년 $2")}월 착공 · ${L.km} · ${L.stationNote}`,
    /* ⚠️ 앞 판은 `🔗 선로 공용 — ${L.shared}` 였는데 L.shared 안에 이미 「선로 공용」이 들어 있어
       「선로 공용 — … 선로 공용 …」이 됐다. 데이터에 든 말을 앞에 또 붙이지 않는다. */
    L.shared ? `🔗 ${L.shared}` : null,
    L.through?.stations?.length
      ? `🚉 지도의 ${L.through.after}~${L.through.stations[L.through.stations.length - 1].name} 구간은 서해선과 함께 쓰는 선로입니다`
      : null, "",
    `👉 ${L.capPoint}`, "",
    "📌 저장해두고 우리 집 지나는 노선 언제 열리는지 확인하기",
    "—",
    `📊 출처 : ${L.src} · 선형 OpenStreetMap`,
    `※ 공정률은 국가철도공단 「주요사업현황」 ${rail.meta.asOfLabel} 기준입니다.`,
    개략고지,
    "※ 개통 시점은 목표치이며 확정 고시가 아닙니다.", "",
    "#수도권철도 #교통호재 #부동산 #위릿노트 #부동산공부",
  ].filter((x) => x !== null).join("\n");
  if (!cap.includes(개략고지)) throw new Error(`${L.name}: 캡션에 개략 고지가 없다`); // ⑤
  writeCaption(`railmap-${L.key}`, cap);

  const byAnchor = placed.filter((p) => p.from === "anchor").length;
  console.log(`✅ ${L.name} — 역 ${placed.length}개(닻 ${byAnchor} · 등분 ${placed.length - byAnchor}) · 선형 ${(trackLen / 1000).toFixed(1)}km`);
  made++;
}
if (!made) throw new Error("만든 카드가 0장이다 — 조용히 넘어가지 않는다");
console.log(`\n✅ rail-geomap ${made}장 → ${publish ? `data/content/${date}/` : "data/out/_spike/"}`);
