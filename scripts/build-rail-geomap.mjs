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
  buildTrack, projectOnTrack, pointAt, monotonicPositions,
} from "./lib/rail-geo.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 10);
const publish = argv.includes("--publish");
const oi = argv.indexOf("--only");
const ONLY = oi >= 0 ? argv[oi + 1] : null;

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
const BDG_R = 12.5, BDG_FS = 15, BDG_GAP = 4;
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
const MAP_W = 968, BODY_H = 820;

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

  /* ── 화면 좌표계 — 위도 보정을 넣어 가로세로 비율을 지킨다(지도는 늘리면 거짓말이다). */
  const all = track;
  const lat0 = Math.min(...all.map((p) => p.lat)), lat1 = Math.max(...all.map((p) => p.lat));
  const lon0 = Math.min(...all.map((p) => p.lon)), lon1 = Math.max(...all.map((p) => p.lon));
  const kx = Math.cos(((lat0 + lat1) / 2 * Math.PI) / 180);
  /* 오른쪽에 역 이름이 붙으므로 지도를 왼쪽으로 몰고 이름 자리를 비워 둔다. */
  /* 오른쪽 이름 자리는 **가장 긴 역 이름에서 계산한다.** 고정값으로 두면 짧은 노선에서는
     지도가 쓸데없이 작아지고(세로 여백이 남고), 긴 이름 노선에서는 이름이 잘린다. */
  const LBL_FS = 23;
  const maxNm = Math.max(...names.map((n) => n.length));
  const anyProv = L.stations.some((st) => st.state === "가칭" || st.state === "역명미정");
  /* 환승 키 전수 대조 — 카탈로그에 없으면 뱃지가 조용히 안 그려진다(rail-line 과 같은 규칙). */
  for (const st of L.stations)
    for (const k of st.xfer || [])
      if (!CAT[k]) throw new Error(`${L.name} ${st.name}: 환승 키 '${k}' 가 카탈로그에 없다`); // ④
  /* 뱃지 자리는 **가장 뱃지가 많은 역**이 정한다. 이름은 그 오른쪽에서 전부 같은 x 로 시작한다 —
     뱃지 뒤에 바로 붙이면 역마다 이름 시작점이 들쭉날쭉해 읽는 눈이 계속 좌우로 흔들린다. */
  const BDG_W = Math.max(0, ...L.stations.map((st) => badgeRowWidth(st.xfer || [])));
  const BDG_PAD = BDG_W ? 10 : 0;
  const PADL = 22, PADT = 20, PADB = 20;
  const PADR = Math.round(30 + BDG_W + BDG_PAD + maxNm * LBL_FS * 0.98 + (anyProv ? 44 : 0) + 8);
  const spanX = (lon1 - lon0) * kx, spanY = lat1 - lat0;
  const s = Math.min((MAP_W - PADL - PADR) / spanX, (BODY_H - PADT - PADB) / spanY);
  const offX = PADL + (MAP_W - PADL - PADR - spanX * s) / 2;
  const offY = PADT + (BODY_H - PADT - PADB - spanY * s) / 2;
  const X = (lon) => offX + (lon - lon0) * kx * s;
  const Y = (lat) => BODY_H - (offY + (lat - lat0) * s);
  const d = (g) => g.map((p, i) => `${i ? "L" : "M"}${X(p.lon).toFixed(1)},${Y(p.lat).toFixed(1)}`).join("");

  /* ── 배경: 시군구 경계 + 한강 */
  const PADD = 0.05;
  const inBox = (r) => r.some(([lon, lat]) =>
    lat > lat0 - PADD && lat < lat1 + PADD && lon > lon0 - PADD && lon < lon1 + PADD);
  let land = "";
  for (const f of sgg.features)
    for (const r of rings(f.geometry)) {
      if (!inBox(r)) continue;
      land += `<path d="${r.map(([lon, lat], i) => `${i ? "L" : "M"}${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join("")}Z" fill="#efece5" stroke="#dcd8cf" stroke-width="1.1"/>`;
    }

  /* 이름 열의 x — 지명 배치도 이 값을 쓰므로 **쓰는 곳들보다 먼저** 정한다(const 는 TDZ 다). */
  const LBL_X = Math.max(...pos.map((p) => X(p.lon))) + 26;   // 뱃지 구역 왼쪽 끝
  const NAME_X = LBL_X + BDG_W + BDG_PAD;                    // 이름은 모두 여기서 시작

  /* ── 한강. sudogwon-map 과 같은 부품을 쓴다 — 강을 두 곳에서 그리면 갈라진다. */
  let river = "";
  try {
    const named = sgg.features.map((f) => ({ name: f.properties.name, rings: rings(f.geometry) }));
    const hr = hanRiverPoints(named);
    river = `<path d="${hr.map(([lon, lat], i) => `${i ? "L" : "M"}${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join("")}" fill="none" stroke="#c3d9e9" stroke-width="13" stroke-linecap="round"/>`;
  } catch (e) { throw new Error(`${L.name}: 한강을 못 그렸다 — ${e.message}`); }

  /* ── 시군구 이름. **화면 안에 중심이 들어오는 것만** 적는다 — 가장자리에 걸친 구의
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
    if (x < 40 || x > LBL_X - 46 || y < 30 || y > BODY_H - 34) continue;
    if (!far(x, y, trackPx, 34) || !far(x, y, dotPx, 52)) continue;
    /* 「안산시상록구」처럼 붙여 쓴 이름은 읽기 어렵다 — 시와 구를 띄우고, 시로 끝나면 시를 뗀다. */
    const nm = f.properties.name.replace(/^(.+?)시(.+?구)$/, "$1 $2").replace(/시$/, "");
    sggNm += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="15" font-weight="700" fill="#aeb3bb" text-anchor="middle" letter-spacing="0.4">${esc(nm)}</text>`;
  }

  /* ── 배경(기존) 노선 — 오너 요청 2026-09-09. 회색 가는 선으로 뒤에 깐다.
     ⚠️ 자료가 없으면 **조용히 넘어가지 않는다.** 이 판형의 요청 사항이라 없으면 그렇게 말한다. */
  let ctx = "";
  if (CTX?.노선?.[L.key]) {
    for (const line2 of CTX.노선[L.key])
      for (const seg of line2.segs)
        ctx += `<path d="${d(seg)}" fill="none" stroke="#c7cbd2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else {
    console.log(`   ⚠️ ${L.name} — 배경 노선 자료 없음(rail-geo.yml mode=context 로 받으세요)`);
  }

  /* 노선색은 rail-line 과 **같은 자리에서 같은 규칙으로** 온다 — 두 판형이 다른 색을 쓰면
     같은 노선이 두 색으로 나간다. SELF 표도 rail-line 에서 그대로 가져온다. */
  const selfKey = SELF[L.key];
  if (!selfKey || !CAT[selfKey]) throw new Error(`${L.name}: 카탈로그에 자기 노선(${selfKey}) 이 없다`); // ④
  const lc = CAT[selfKey].color;

  const line = `<path d="${d(mainWay.g)}" fill="none" stroke="${lc}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;

  /* ── 역 점·이름.
     ⚠️ 도심 구간은 역간 1km 라 화면에서 20px 도 안 떨어진다 — 이름을 점 옆에 그냥 붙이면
        여의도~구로디지털단지 다섯 개가 겹쳐 뭉갠다(2026-09-09 첫 렌더에서 실제로 그랬다).
        그래서 이름은 **고정된 세로 열**에 놓고, 겹치지 않게 아래로 밀고, 점과는 지시선으로 잇는다.
        미는 순간 이름과 점의 높이가 달라지므로 지시선이 없으면 어느 점의 이름인지 모른다.
     개통 예정이라 점 모양은 전부 같게 둔다 — 상태를 색으로 나누면 「어디는 열려 있다」로 읽힌다. */
  const LBL_GAP = 30;                                        // 글자 24px + 여백
  const lbl = pos.map((p) => ({ ...p, x: X(p.lon), y: Y(p.lat), ly: Y(p.lat) }));

  /* 위에서 아래로 훑으며 최소 간격을 지키게 민다. 그다음 아래에서 위로 한 번 더 훑어
     카드 밖으로 밀린 것을 되끌어 올린다 — 한 방향만 하면 마지막 몇 개가 밖으로 나간다. */
  for (let i = 1; i < lbl.length; i++)
    if (lbl[i].ly - lbl[i - 1].ly < LBL_GAP) lbl[i].ly = lbl[i - 1].ly + LBL_GAP;
  /* ⚠️ 아래 여백을 14px 로 뒀더니 마지막 역 이름이 **각주 위로 올라앉았다**(2026-09-09).
     지도 상자 안이라 designQa 의 겹침 검사에도 안 잡힌다 — SVG 안 글자는 그쪽 소관이 아니다.
     그래서 여백을 넉넉히 주고, 되끌어 올리는 패스를 **조건 없이** 돌린다. */
  const BOT = BODY_H - 46;
  if (lbl[lbl.length - 1].ly > BOT) lbl[lbl.length - 1].ly = BOT;
  for (let i = lbl.length - 2; i >= 0; i--)
    if (lbl[i + 1].ly - lbl[i].ly < LBL_GAP) lbl[i].ly = lbl[i + 1].ly - LBL_GAP;

  let inMap = "", outMap = "";
  for (const p of lbl) {
    const prov = p.st.state === "가칭" || p.st.state === "역명미정";
    const keys = p.st.xfer || [];
    /* ⚠️ 지시선은 **지도 자르기 밖에서** 그린다. 안쪽에서 그리면 지도 가장자리에서 잘려
       점과 이름 사이가 끊긴 채로 보인다(2026-09-09). 끝점은 그 행의 **가장 왼쪽 요소**
       (뱃지가 있으면 뱃지, 없으면 이름) 바로 앞이다 — 행마다 다르므로 여기서 계산한다. */
    const rowLeft = NAME_X - (keys.length ? BDG_PAD + badgeRowWidth(keys) : 0);
    const endX = rowLeft - 9;
    const near = Math.abs(p.ly - p.y) < 1.5;
    const lead = near
      ? `<path d="M${(p.x + 13).toFixed(1)},${p.y.toFixed(1)}H${endX.toFixed(1)}" stroke="#b3b8c1" stroke-width="1.8" fill="none"/>`
      : `<path d="M${(p.x + 13).toFixed(1)},${p.y.toFixed(1)}H${(endX - 16).toFixed(1)}L${endX.toFixed(1)},${p.ly.toFixed(1)}" stroke="#b3b8c1" stroke-width="1.8" fill="none"/>`;

    /* 뱃지는 이름 바로 왼쪽에 **오른쪽 맞춤** — 이름 시작점(NAME_X)을 흔들지 않으면서
       "이 역은 무슨 노선과 만나나"가 이름 앞에서 먼저 읽힌다(오너 2026-09-09). */
    let bd = "", bx = rowLeft;
    for (const k of keys) { bd += badgeSvg(k, bx, p.ly); bx += badgeWidth(k) + BDG_GAP; }

    inMap += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="9.5" fill="#ffffff" stroke="${lc}" stroke-width="5"/>`;
    outMap += lead + bd +
      `<text x="${NAME_X.toFixed(1)}" y="${p.ly.toFixed(1)}" font-size="${LBL_FS}" font-weight="800" fill="#141821" letter-spacing="-0.6" dominant-baseline="middle">${esc(p.name)}` +
      (prov ? `<tspan font-size="16" font-weight="700" fill="#8a8f98" dx="6">가칭</tspan>` : "") +
      `</text>`;
  }

  /* ⚠️ 지도 그림을 **이름 열 왼쪽에서 자른다.** 안 자르면 시군구 면색과 한강이 이름·뱃지
     뒤까지 깔려, 여의도·영등포 뱃지가 파란 강 위에 앉는다(2026-09-09).
     자르는 선은 지시선이 닿는 곳(LBL_X − 8)보다 살짝 오른쪽이어야 선이 안 잘린다. */
  const clipId = `rgmclip-${L.key}`;
  const mapSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${BODY_H}" width="${MAP_W}" height="${BODY_H}">` +
    `<defs><clipPath id="${clipId}"><rect x="0" y="0" width="${(LBL_X - 4).toFixed(1)}" height="${BODY_H}"/></clipPath></defs>` +
    `<g clip-path="url(#${clipId})">${land}${river}${ctx}${sggNm}${line}${inMap}</g>${outMap}</svg>`;

  const facts = [
    { k: "착공", v: L.start },
    { k: "연장", v: L.km },
    { k: "정거장", v: L.stationNote },
    { k: "총사업비", v: L.cost },
    { k: "시행자", v: L.operator },
  ].filter((f) => f.v);

  const card = {
    template: "rail-geomap@1", date, lc,
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
    note: [L.branch ? `지도는 본선만 — ${L.branch.label}은 선형 자료 미비` : "",
           L.shared ? `선로 공용 · ${L.shared}` : ""].filter(Boolean).join("  ·  "),
    layout: { titleFs: 62, titleGap: 16, barGap: 18, bodyGap: 16, bodyH: BODY_H, mapW: MAP_W },
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
    L.shared ? `🔗 선로 공용 — ${L.shared}` : null, "",
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
