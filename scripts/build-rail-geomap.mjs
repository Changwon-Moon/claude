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
/* ── 지도 안 워터마크(오너 2026-09-09 "다양하게 제안해줘").
   카드만 잘려 돌아다닐 때 푸터 워드마크가 같이 안 따라간다 — 지도 안에도 한 번 남긴다.
   none(기본) · soft(흐린 글자) · badge(잉크 알약) · outline(테두리 알약) · tile(대각 반복) */
const wi = argv.indexOf("--wm");
const WM = wi >= 0 ? argv[wi + 1] : "soft";   /* 오너가 2026-09-09 에 soft 를 두 곳으로 골랐다 */
if (!["none", "soft", "badge", "outline", "tile"].includes(WM))
  throw new Error(`--wm 은 none|soft|badge|outline|tile 이다 (받은 값: ${WM})`);

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
/* 「학온는」 같은 조사 오류를 막는다 — 받침이 있으면 은/이, 없으면 는/가. */
const josa = (w, withJong, withoutJong) => {
  const c = [...String(w)].pop().charCodeAt(0);
  const jong = c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 !== 0 : false;
  return jong ? withJong : withoutJong;
};
const HALO_S = ' stroke="#fbfaf7" stroke-width="4.5" paint-order="stroke" stroke-linejoin="round"';
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
const BODY_H_BY_V = { a: 820, b: 986, c: 820, d: 930 };
const TITLE_FS_BY_V = { a: 62, b: 62, c: 62, d: 93 };
/* ⚠️ 제목 크기를 **노선 이름 길이에 맞춰 줄인다**. 93px 은 「신안산선 언제 개통하지?」(10.5칸)에
   맞춘 값이라, 「인덕원~동탄선 …」(14칸)에서는 두 줄이 되고 카드 아래로 25px 넘쳤다
   (2026-09-09 designQa overflow). 한글 1칸 · 라틴/기호/공백 0.5칸으로 세고 자간(-0.045em)을 반영한다.
   ⚠️ 신안산선은 10.5칸이라 이 계산이 93 을 그대로 돌려준다 — 확정본 픽셀이 안 바뀐다(확인함). */
const titleUnits = (t) => [...t].reduce((a, c) => a + (/[\x00-\x7F~∼]/.test(c) ? 0.5 : 1), 0);
/* 기준점은 **잰 것**이다 — 「신안산선 언제 개통하지?」(11.5칸)가 93px 에서 한 줄에 딱 맞는다.
   글자 폭을 추정하는 계수를 짐작하면 그 기준이 93 이 아니게 되어 확정본 픽셀이 깨진다. */
const TITLE_BASE_UNITS = 11.5;
const fitTitleFs = (t, max) =>
  Math.max(52, Math.min(max, Math.floor((max * TITLE_BASE_UNITS) / titleUnits(t))));
const BODY_H = BODY_H_BY_V[VARIANT];
/* 정보 패널이 지도 위에서 차지하는 자리. **빌더가 이 값을 알아야** 그 자리에 걸리는 역 이름을
   반대쪽으로 보낼 수 있다(오너 2026-09-09: "시흥사거리를 우측으로 옮기면 정보 카드가 더
   내려갈 수 있다"). 손으로 역을 지정하는 대신 **패널 자리로 규칙을 만든다** — 그래야 다른
   노선에서도, 패널을 옮겨도 저절로 맞는다.
   ⚠️ 템플릿의 .v-b/.v-d 치수와 **같아야 한다.** 갈라지면 라벨은 비켰는데 패널은 딴 데 있다.

   시안 d (오너 2026-09-09 2차): 공정률·개통예상만 좌상단에 **크게** 남기고, 나머지 정보는
   노선 우하단 빈 자리에 **작고 흐리게** 흘린다. 그래서 패널이 **두 개**다 —
   한 개짜리 규칙을 그대로 두면 우하단 패널이 역 이름을 덮는다. */
const PANELS_FN = (v, H, diag = "nwse") => ({
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
  /* 정보 상자 두 개는 **비는 대각선**에 놓는다. 신안산선은 노선이 북동→남서라 북서·남동이
     비지만, 인동선은 북서→남동이라 그 두 자리가 정확히 노선 위다 — 실제로 좌상단 패널이
     「인덕원·호계·오전·의왕시청」을, 우하단 상자가 「동탄」을 덮었다(2026-09-09). */
  d: diag === "nesw"
    ? [{ x0: MAP_W - 334, x1: MAP_W - 14, y0: 22, y1: 330 },   // 공정률 패널 = 오른쪽 위
       { x0: 14, x1: 286, y0: H - 207, y1: H - 22 }]           // 정보 표   = 왼쪽 아래
    : [{ x0: 14, x1: 334, y0: 22, y1: 330 },
       { x0: MAP_W - 286, x1: MAP_W - 14, y0: H - 207, y1: H - 22 }],
}[v]);
const SPLIT_INFO = VARIANT === "d";

function buildOne(L) {
  /* 제목 크기와 지도 높이는 **노선 이름 길이에 따라 달라진다.** 제목이 두 줄이 되면
     카드 아래로 넘치고(2026-09-09 인동선 25px 넘침), 짧아지면 그만큼 지도를 키운다. */
  const titleFs = fitTitleFs(`${L.name} ${L.titleAsk || "언제 개통하지?"}`, TITLE_FS_BY_V[VARIANT]);
  let BH = BODY_H + (VARIANT === "d" ? Math.round(93 * 1.06) - Math.round(titleFs * 1.06) : 0);
  let PANELS = PANELS_FN(VARIANT, BH);
  let panelDiag = "nwse";

  const A = anchorsDoc[L.key];
  if (!A) throw new Error(`${L.name}: rail-station-anchors.json 에 닻 정의가 없다`);
  const O = probe.결과?.find((x) => x.key === L.key);
  if (!O?.좌표?.length) throw new Error(`${L.name}: OSM 탐사 결과에 선형이 없다 — rail-geo.yml 을 먼저 돌린다`);

  /* 본선 선형 — construction 중 가장 긴 길 하나가 전 구간이다. 토막을 이어 붙이려면
     이음 순서를 우리가 정해야 하는데, 그건 지금 정하려는 것이라 순환이다. */
  /* OSM 실좌표 — 있으면 그게 닻이다. */
  const truth = new Map();
  for (const h of O.역점?.표본 || []) {
    const n = (h.name || "").replace(/역$/, "");
    if (!truth.has(n)) truth.set(n, { lat: h.lat, lon: h.lon });
  }

  /* ── 어떤 OSM 태그를 선형으로 볼 것인가 (데이터셋 osmTags, 기본 construction)
     🔴 2026-09-10 에 네 노선을 받아 보고 알았다 — **노선마다 태그가 다르다.**
        · 신안산·월판·인동·GTX-B → railway=construction (공사중)
        · GTX-A → 개통 구간이 **railway=rail** 이고 미개통 구간만 construction 이다.
          construction 만 보면 55점(13.9km)짜리 토막만 잡혀 82.3km 노선이 무너진다.
        · GTX-C·대장홍대 → **railway=proposed**. construction 은 28점짜리 부스러기뿐이다.
     ⚠️ proposed 는 「아직 안 지었다」는 뜻이지 「지어낸 선」이 아니다 — 기본계획 노선을
        OSM 기여자가 옮겨 그린 실제 자료다. 다만 **공사중보다 덜 굳었다**. 그래서
        데이터셋이 노선마다 **명시적으로** 고르게 하고(기본값은 가장 굳은 construction),
        캡션이 그 사실을 진다. 코드가 알아서 태그를 넓히지 않는다 —
        그러면 어느 노선이 어느 단계의 자료로 그려졌는지 아무도 모르게 된다. */
  const OSM_TAGS = L.osmTags?.length ? L.osmTags : ["construction"];
  const conWays = O.좌표.filter((w) => OSM_TAGS.includes(w.railway));
  if (!conWays.length) {
    const have = [...new Set(O.좌표.map((w) => w.railway))].join(", ") || "없음";
    throw new Error(`${L.name}: railway=${OSM_TAGS.join("/")} 길이 없다 (받아 온 태그: ${have})`);
  }
  let mainWay = [...conWays].sort((a, b) => b.g.length - a.g.length)[0];

  /* ── 토막 잇기 (데이터셋의 osmStitch: true 인 노선만)
     OSM 은 한 노선을 여러 길로 쪼개 놓는다. 신안산선은 운 좋게 **가장 긴 길 하나가 본선 전체**라
     그걸 그대로 썼지만(30.7km ≈ 본선 29.7km), 월판선은 광명~판교 24.4km 만 한 덩이고
     월곶~광명은 따로 놀아서 그대로 쓰면 **앞 세 역이 선 밖에 뜬다**(실측: 닻 5 · 등분 6).

     잇는 규칙은 두 줄이다:
       ① 첫 역(실좌표)에 가장 가까운 끝을 가진 길에서 출발한다.
       ② 다음 길은 **지금 끝에서 가장 가깝고, 반대쪽 끝이 출발점에서 더 먼** 것 —
          이 「더 멀어져야 한다」가 핵심이다. 없으면 나란히 놓인 **반대 방향 선로**를 집어
          왔던 길을 되돌아간다(월판선에서 5m 차이로 실제로 그럴 뻔했다).

     ⚠️ 신안산선에는 쓰지 않는다. 이미 확정된 카드라 픽셀을 못 바꾸고, 그 노선은 가장 긴 길이
        이미 본선 전체라 이어 붙이면 오히려 **지선 토막이 본선에 붙는다.** 새 노선만 켠다. */
  if (L.osmStitch) {
    const first = truth.get(L.stations[0].name);
    if (!first) throw new Error(`${L.name}: 첫 역 ${L.stations[0].name} 의 실좌표가 없어 토막을 이을 기준이 없다`);
    /* 300m 로 뒀다가 **3m 차이로** 끊겼다(월판선 실측 간격 303m — 시흥시청 구내에서 길이 갈린다).
       OSM 은 역 구내·분기점에서 길을 끊고 그 사이를 안 그려 두기도 한다. 600m 까지 잇는다 —
       그보다 멀면 정말로 자료가 없는 것이고, 그건 아래 길이 가드가 잡는다. */
    /* 기존선을 함께 쓰는 노선은 **역 구내에서 길이 더 크게 끊긴다**(환승 배선·분기).
       노선이 osmJoin 으로 넓힐 수 있게 한다 — 넓히면 엉뚱한 선을 물 위험도 같이 커지므로
       기본값은 그대로 600m 이고, 넓힌 노선은 아래 「놓은 자리 vs 실좌표」 가드가 지킨다. */
    const JOIN = L.osmJoin || 600;                    // m — 이 안에 붙어 있으면 같은 선로로 본다
    const pool = conWays.map((w) => ({ ...w, g: [...w.g] }));
    let bi2 = -1, bd = Infinity;
    pool.forEach((w, i) => {
      const d = Math.min(metres(w.g[0], first), metres(w.g[w.g.length - 1], first));
      if (d < bd) { bd = d; bi2 = i; }
    });
    /* 🔴 씨앗은 **첫 역에 가까운 길**이 아니라 **가장 긴 길**이다 (2026-09-10).
       기존선 이름까지 넣고 받으면 길이 582개가 된다(GTX-C). 그중 첫 역 옆에 우연히 놓인
       6.6km 짜리 부스러기에서 출발하면 거기서 체인이 죽는다 — 실제로 그랬다.
       가장 긴 길은 그 노선의 **몸통**이라 양쪽으로 자라날 여지가 가장 크다.
       ⚠️ 그래서 **양 끝으로 자란다.** 한쪽으로만 자라던 앞 판은 몸통 뒤쪽(덕정 방향)을
          통째로 놓쳤다. 머리에 붙일 때와 꼬리에 붙일 때 「되돌아가지 않는다」의 기준점이
          서로 반대편 끝이 된다 — 그게 이 규칙의 원래 뜻이다(전체 뻗음이 늘어야 한다). */
    /* ⚠️ **새 규칙은 노선이 켜야 켜진다**(osmStitchBoth). 월판선은 이미 확정된 카드라
       씨앗을 바꾸면 선형이 39.5→40.5km 로 움직여 픽셀이 깨진다(2026-09-10 실측).
       고른 규칙이 더 낫다고 해서 이미 결재된 그림을 조용히 바꾸지 않는다. */
    const BOTH = L.osmStitchBoth === true;
    const seedIdx = BOTH
      ? pool.reduce((bIdx, w, i, a) => (w.g.length > a[bIdx].g.length ? i : bIdx), 0)
      : bi2;
    const cur = pool.splice(seedIdx, 1)[0];
    if (metres(cur.g[cur.g.length - 1], first) < metres(cur.g[0], first)) cur.g.reverse();
    const chain = [...cur.g];
    for (;;) {
      const head = chain[0], tail = chain[chain.length - 1];
      let best = null;
      pool.forEach((w, i) => {
        const ends = [[w.g[0], w.g[w.g.length - 1], false], [w.g[w.g.length - 1], w.g[0], true]];
        for (const [near, far, flip] of ends) {
          /* 꼬리에 붙이기 — 붙인 뒤 끝이 **머리에서 더 멀어야** 한다 */
          const dT = metres(near, tail);
          if (dT <= JOIN && metres(far, head) > metres(tail, head) &&
              (!best || dT < best.d)) best = { i, d: dT, flip, at: "tail" };
          /* 머리에 붙이기 — 옛 규칙(한쪽으로만 자람)에서는 하지 않는다 */
          if (!BOTH) continue;
          const dH = metres(near, head);
          if (dH <= JOIN && metres(far, tail) > metres(head, tail) &&
              (!best || dH < best.d)) best = { i, d: dH, flip, at: "head" };
        }
      });
      if (!best) break;
      const w = pool.splice(best.i, 1)[0];
      if (best.at === "tail") {
        /* near → far 방향으로 눕혀 꼬리에 잇는다. 첫 점은 꼬리와 겹치므로 뺀다. */
        const g = best.flip ? [...w.g].reverse() : w.g;
        chain.push(...g.slice(1));
      } else {
        /* far → near 방향으로 눕혀 머리 앞에 붙인다. 마지막 점이 머리와 겹치므로 뺀다. */
        const g = best.flip ? w.g : [...w.g].reverse();
        chain.unshift(...g.slice(0, -1));
      }
    }
    /* ── ③ **양 끝을 역에서 자른다** (2026-09-10)
       기존선을 함께 쓰는 노선은 그 기존선이 우리 노선보다 **더 멀리 간다.** GTX-A 는
       수서~동탄을 수서평택고속선과 함께 쓰는데, 그 선은 평택까지 내려간다 —
       이름으로 받으면 동탄 아래 17km 가 딸려 와 이은 길이가 99.2km 가 됐다(공표 82.3km).
       그대로 그리면 **동탄 아래로 노선이 계속 뻗은 그림**이 된다. 사실이 아니다.
       그래서 첫 역·끝 역의 실좌표를 선형에 투영해 **그 바깥을 잘라낸다.**
       ⚠️ 자를 기준이 되는 역의 실좌표가 없으면 자르지 않는다 — 모르면 손대지 않는다. */
    {
      const tk = buildTrack(chain);
      const ends = [L.stations[0], L.stations[L.stations.length - 1]].map((st) => truth.get(st.name));
      if (ends[0] && ends[1]) {
        const ts = ends.map((g) => projectOnTrack(tk, g).t).sort((a, b) => a - b);
        const MARGIN = 400;                       // m — 역이 선형 끝점보다 살짝 밖일 수 있다
        const lo = Math.max(0, ts[0] - MARGIN), hi = Math.min(tk[tk.length - 1].d, ts[1] + MARGIN);
        const cut = chain.filter((_, i) => tk[i].d >= lo && tk[i].d <= hi);
        if (cut.length >= 50 && cut.length < chain.length) {
          console.log(`   ✂️ ${L.name} 양 끝 자름 — 점 ${chain.length} → ${cut.length}`);
          chain.length = 0; chain.push(...cut);
        }
      }
    }
    let chainLen = 0;
    for (let i = 1; i < chain.length; i++) chainLen += metres(chain[i - 1], chain[i]);
    /* ⚠️ 공표 총연장(L.km)에는 **지선이 들어 있다.** GTX-C 86.5km 는 본선 덕정~수원 74.9km 와
       금정~상록수 지선을 합한 값이다. 본선 선형을 그 값에 견주면 늘 모자라 보인다.
       역별 km 이 있으면 **본선 마지막 역의 km** 이 본선 길이다. */
    const kmMainMax = Math.max(0, ...L.stations.map((st) => (typeof st.km === "number" ? st.km : 0)));
    const want = (kmMainMax || parseFloat(String(L.km).replace(/[^\d.]/g, ""))) * 1000;
    if (want && chainLen < want * 0.7)
      throw new Error(`${L.name}: 토막을 이었는데 ${(chainLen / 1000).toFixed(1)}km 뿐이다 (공표 ${L.km}) — 아직 토막이 더 있다`);
    mainWay = { ...mainWay, g: chain };
    console.log(`   🔗 ${L.name} 선형 토막 잇기 — ${(chainLen / 1000).toFixed(1)}km · 점 ${chain.length}개`);
  }
  if (mainWay.g.length < 50)
    throw new Error(`${L.name}: 선형 점이 ${mainWay.g.length}개뿐이다 — 토막만 받았다. 그리면 안 된다`); // ②
  /* ── 선형의 **방향**을 역 순서에 맞춘다.
     OSM 은 길을 어느 쪽으로든 그려 놓는다 — 인동선은 동탄에서 인덕원 쪽으로 그려져 있어
     그대로 쓰면 첫 역의 진행거리가 끝값이 되고 단조 가드가 즉시 던진다(2026-09-09).
     첫 역·끝 역 중 **실좌표를 아는 쪽**에 가까운 끝을 시작으로 삼는다.
     ⚠️ 신안산선은 이미 여의도→한양대 순이라 이 블록이 아무것도 안 바꾼다(확정본 픽셀 보호). */
  {
    const g0 = mainWay.g[0], g1 = mainWay.g[mainWay.g.length - 1];
    const head = L.stations.map((x) => truth.get(x.name)).find(Boolean);
    const tail = [...L.stations].reverse().map((x) => truth.get(x.name)).find(Boolean);
    if (head && tail && metres(g0, head) > metres(g1, head) && metres(g1, tail) > metres(g0, tail))
      mainWay = { ...mainWay, g: [...mainWay.g].reverse() };
  }
  const track = buildTrack(mainWay.g);
  const trackLen = track[track.length - 1].d;

  /* ⚠️ 계획 구간(proposed)은 **그리지 않는다**(오너 2026-09-09).
     여의도 위로 뻗은 서울역 연장 점선이 상자를 북동쪽으로 늘려 정작 노선이 작아졌다.
     아직 착공도 안 한 구간이라 「공사 현황」 카드의 주제도 아니다. */

  const names = L.stations.map((s) => s.name);
  /* ── 공표 영업거리(km)가 있으면 **그게 1순위 닻**이다 (2026-09-09, 인동선).
     닻(동 중심)은 몇 백 m 씩 흔들리지만 영업거리는 선형 위 진행거리를 그대로 준다.
     ⚠️ 공표 총연장과 OSM 선형 길이는 다르다(인동선 33.7km vs OSM 35.1km — 곡선·접속선 차이).
        그래서 **비율로 늘려** 얹는다. 그대로 쓰면 끝 역이 선형 끝에서 1.4km 모자란다.
     ⚠️ km 이 하나라도 빠지면 섞어 쓰지 않는다 — 두 잣대가 섞이면 순서가 뒤집힌다. */
  /* ── 닻 우선순위 ① 공표 영업거리 ② OSM 실좌표 ③ 소재 동 중심 ④ 이웃 등분
     (data/datasets/rail-station-anchors.json 의 `_배치_우선순위` 가 정본이다)
     🔴 예전에는 **전 역에 km 이 있을 때만** ①을 썼다(kmAll). 그러면 한 역만 비어도
        노선 전체가 ②로 떨어진다 — GTX-A 는 삼성 하나(출처끼리 0.5km 어긋나 못 적었다),
        GTX-B 는 청학 하나(2025.12 신설이라 영업거리표에 행이 없다) 때문에 10~14개 역의
        공표 거리를 통째로 버리게 된다. 그래서 **역마다 따로 고른다.**
     ⚠️ 섞어 쓰려면 km 스케일과 선형 길이가 같은 자를 써야 한다. kmMax 는
        「km 이 적힌 역 중 가장 먼 역」이고, 그 역의 실제 위치(②)로 스케일을 맞춘다 —
        마지막 역에 km 이 없으면 km/kmMax × trackLen 이 선형 끝을 넘겨 버린다. */
  const kmSt = L.stations.filter((st) => typeof st.km === "number");
  const kmAny = kmSt.length >= 2;
  const kmMax = kmAny ? Math.max(...kmSt.map((st) => st.km)) : 0;
  if (kmAny && !(kmMax > 0)) throw new Error(`${L.name}: 영업거리가 전부 0 이다`);
  /* km 자 ↔ 선형 자 환산계수. km 이 가장 먼 역의 실좌표가 있으면 거기서 재고,
     없으면 선형 전체를 kmMax 로 나눈다(예전과 같은 셈). */
  let kmScale = trackLen / (kmMax || 1);
  {
    const far = kmSt.reduce((a, b) => (b.km > a.km ? b : a), kmSt[0] || { km: 0 });
    const gt = far && truth.get(far.name);
    if (gt && far.km > 0) {
      const tFar = projectOnTrack(track, gt).t;
      if (tFar > trackLen * 0.5) kmScale = tFar / far.km;   /* 절반도 안 가는 값이면 못 믿는다 */
    }
  }

  const anchors = names.map((name, i) => {
    if (kmAny && typeof L.stations[i].km === "number")
      return { name, t: Math.min(L.stations[i].km * kmScale, trackLen), src: `공표 ${L.stations[i].km}km` };
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

  /* ── 🔴 **놓은 자리와 실좌표를 대조한다** (2026-09-10 · GTX-B 에서 데인 자리)
     공표 km 배치는 「선형이 그 노선 전체」임을 전제한다. 선형이 짧으면(토막이 덜 이어졌으면)
     km/kmMax 비율이 전 역을 시작 쪽으로 당긴다 — GTX-B 는 이은 선형이 68.2km 뿐이라
     **서울역이 여의도 자리에** 놓였다. 지도 카드에서 그건 오보다.
     그런데 designQa 도, 단조 가드도 이걸 못 잡는다. 순서는 맞고 겹치지도 않기 때문이다.
     그래서 **실좌표를 아는 역**만 골라 놓은 자리와 견준다. 자료가 자료를 검사하는 자리다.
     ⚠️ 1.5km 는 「지도에서 눈에 띄게 틀린」 거리다(카드 한 장이 대략 40~90km 를 담는다).
        역 위치가 개략이라는 고지와도 어긋나지 않는다 — 개략은 몇 백 m 지 몇 km 가 아니다. */
  {
    const TOL = 1500;
    const bad = [];
    pos.forEach((q) => {
      const gt = truth.get(q.name);
      if (!gt) return;
      const d = metres(gt, q);
      if (process.env.RGM_DEV) console.log(`      · ${q.name} ${Math.round(d)}m`);
      if (d > TOL) bad.push(`${q.name} ${(d / 1000).toFixed(1)}km`);
    });
    if (bad.length)
      throw new Error(`${L.name}: 놓은 자리가 실좌표와 어긋난다 — ${bad.join(" · ")}\n` +
        `   선형이 노선 전체를 못 덮고 있을 가능성이 크다(선형 ${(trackLen / 1000).toFixed(1)}km / 공표 ${L.km}).` +
        ` rail-geo.yml 로 그 노선을 다시 받거나, 빠진 공용 구간의 노선 이름을 OSM_NAMES 에 더한다.`);
  }

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

  /* ── 공용 구간의 **남의 노선 역** (오너 2026-09-09: "시흥시청부터 광명 사이에 신안산선과
     공유하는 노선들이 있고 그 역들이 지금 누락되어 있어")
     월판선 광명~시흥시청 9.8km 는 신안산선 지선과 선로를 공용하고, 그 구간에 신안산선 역
     두 개(매화·학온)가 있다. 신안산선 카드에서 서해선 공용 구간 역을 함께 그린 것과 **같은 취급**이다 —
     지도에만 얹고 **정거장 수는 그대로 둔다**(월판선 11개역).
     ⚠️ L.stations 에 넣으면 안 된다 — 그러면 확정된 도식형 카드(rail-wolpan)의 픽셀이 바뀐다.
     ⚠️ 놓인 자리가 지정한 두 역 **사이**가 아니면 던진다. 공용 구간 밖에 찍히면 거짓말이다. */
  let sharedPos = [];
  if (L.sharedOn?.stations?.length) {
    const [n0, n1] = L.sharedOn.between || [];
    const i0 = names.indexOf(n0), i1 = names.indexOf(n1);
    if (i0 < 0 || i1 < 0) throw new Error(`${L.name}: 공용 구간 기준역(${n0}·${n1})을 본선에서 못 찾았다`);
    const [tLo, tHi] = [placed[i0].t, placed[i1].t].sort((x, y2) => x - y2);
    sharedPos = L.sharedOn.stations.map((st) => {
      const gt = truth.get(st.name);
      let t;
      if (gt) t = projectOnTrack(track, gt).t;
      else {
        const a2 = A[st.name];
        if (!a2?.dong) throw new Error(`${L.name} 공용역 ${st.name}: 닻(시군구+동)이 없다`);
        const g2 = sggGeom(a2.sgg);
        if (!g2) throw new Error(`${L.name} 공용역 ${st.name}: 시군구 '${a2.sgg}' 가 경계 자료에 없다`);
        const c2 = dongCentre(dong, g2, a2.dong);
        if (!c2) throw new Error(`${L.name} 공용역 ${st.name}: 동 '${a2.dong}' 을 ${a2.sgg} 안에서 못 찾았다`);
        t = projectOnTrack(track, c2).t;
      }
      if (t < tLo || t > tHi)
        throw new Error(`${L.name} 공용역 ${st.name}: ${n0}~${n1} 구간 밖에 놓였다 — 공용 구간이 아니다`);
      return { ...pointAt(track, t), name: st.name, st, src: "공용 구간" };
    }).sort((a2, b2) => projectOnTrack(track, a2).t - projectOnTrack(track, b2).t);
  }

  /* ── 화면 좌표계 — 위도 보정을 넣어 가로세로 비율을 지킨다(지도는 늘리면 거짓말이다). */
  const all = [...track, ...branchPts, ...thruPts];
  const lat0 = Math.min(...all.map((p) => p.lat)), lat1 = Math.max(...all.map((p) => p.lat));
  const lon0 = Math.min(...all.map((p) => p.lon)), lon1 = Math.max(...all.map((p) => p.lon));
  const kx = Math.cos(((lat0 + lat1) / 2 * Math.PI) / 180);
  /* ── 🔴 가로로 누운 노선인가 (오너 2026-09-09 "1번으로 가자")
     세로로 긴 카드에 가로 노선을 넣으면 노선이 가운데 얇은 띠가 되고 위아래가 통째로 빈다.
     실측 — 신안산 0.3:1 · 인동 0.5:1 · **월판 5.6:1**. 월판선은 32km × 5.7km 다.
     비율이 1.6 을 넘으면 **지도를 가로로 눕히고**(높이를 줄이고) 정보를 지도 **아래 띠**로 내린다.
     이름표도 좌우가 아니라 **위아래**로 놓는다 — 가로 노선에서 좌우는 서로를 밟는다. */
  const aspect = ((lon1 - lon0) * kx) / (lat1 - lat0 || 1e-9);
  const WIDE = VARIANT === "d" && aspect > 1.6;
  if (process.env.RGM_DEV) console.log();
  if (WIDE) {
    /* 430 → 764. 430 은 노선 띠(90px)+이름표 자리만 남긴 값이라 지도는 딱 맞았는데
       **카드 아래가 360px 비었다.** 가로 노선은 가로가 병목이라 상자를 키워도 노선이
       더 커지지는 않는다 — 대신 남·북 배경이 더 보이고 카드가 채워진다(오너 "지도 확대").
       띠·각주·푸터가 쓰는 236px 을 뺀 나머지를 지도에 준다.
       764 → 742: 각주를 지도 **아래**로 내리면서(오너 2026-09-09) 각주 22px 만큼 양보했다.
       세로 판형과 **같은 틈**이 되도록 잰 값이다 — 지도↔각주 18px · 각주↔푸터 33px
       (packages/renderer/src/_measure.ts 로 세 장을 나란히 재서 맞췄다). */
    BH = 742; PANELS = [];
  }
  /* 오른쪽에 역 이름이 붙으므로 지도를 왼쪽으로 몰고 이름 자리를 비워 둔다. */
  /* 오른쪽 이름 자리는 **가장 긴 역 이름에서 계산한다.** 고정값으로 두면 짧은 노선에서는
     지도가 쓸데없이 작아지고(세로 여백이 남고), 긴 이름 노선에서는 이름이 잘린다. */
  /* ⚠️ 「가칭」을 역마다 붙이면 16역 중 10역에 반복되고, 그만큼(44px) 라벨 폭이 늘어
     **지도가 작아진다**(가로가 병목이라 라벨 폭이 곧 지도 크기다). 범례 한 줄로 옮긴다. */
  const LBL_FS = 23;   /* 21 → 23 (오너 2026-09-09 "조금만 더 크게") */
  /* ── 「가칭」 표시 (오너 2026-09-09: "별도로 가칭 표시를 써주자")
     점선 링만으로는 「이 이름이 확정인 줄 알았다」를 못 막는다. 이름 뒤에 작고 흐린 글자로 붙인다.
     🔴 그런데 **오너가 같은 날 되물렀다** — "가칭은 역명 말고 푸터 위에 몰아서 살짝 표시해줘".
        역이 10개 넘게 가칭이면 「가칭」이 열 번 반복돼 눈이 그것만 읽는다. 그래서
        provTag 는 인동선·월판선 모두 **false** 로 내렸고, 그 사실은 각주 한 줄이 진다
        (「◌ 점선 = 역명 미확정(가칭)」). 코드는 남겨 둔다 — 가칭이 한두 역뿐인 노선에서는
        각주보다 역 옆에 붙이는 쪽이 정확하다. 다시 켤 때는 그 기준으로 판단할 것. */
  /*
     ⚠️ **노선별로 켠다**(provTag). 신안산선 실지도 카드는 이미 확정·발행돼 픽셀을 못 바꾼다.
     ⚠️ 한때 「가칭」을 이름에 섞어 넣었다가 16역 중 10역에 반복돼 라벨 폭이 44px 씩 늘고
        지도가 작아져 뺐던 자리다. 이번엔 **작은 글자(15px)** 로 붙여 32px 만 쓴다. */
  const PROV_TAG = L.provTag === true;
  const PROV_FS = 15, PROV_GAP = 5;
  const PROV_W = PROV_TAG ? 2 * PROV_FS + PROV_GAP : 0;
  /* ⚠️ 「가칭」은 **가칭 이름이 붙은 역**에만 단다. 「107정거장」처럼 역명미정인 곳은
     그 번호가 곧 공식 표기라 「107정거장 가칭」은 말이 안 된다(점선 링은 그대로 붙는다). */
  const provW = (st) => (PROV_TAG && st.state === "가칭" ? PROV_W : 0);
  const provSvg = (x, y, anchor) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${PROV_FS}" font-weight="700" fill="#9aa1ac" letter-spacing="-0.3" dominant-baseline="middle" text-anchor="${anchor}"${HALO_S}>가칭</text>`;
  /* ⚠️ 이름 길이·뱃지 폭·환승 키 대조는 **본선만 보면 안 된다.** 지선·직결 구간 역이
     더 길거나 뱃지가 더 많으면 그만큼 잘리거나 카드 밖으로 나간다. */
  const everySt = [...L.stations, ...(L.branch?.stations || []), ...(L.through?.stations || []),
                   ...(L.sharedOn?.stations || [])];
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
  /* 가로 노선은 이름표가 위아래로 서므로 그쪽에 자리가 필요하다(지시선 26 + 뱃지 23 + 이름 23 + 여유). */
  const PADT = WIDE ? 104 : 34, PADB = WIDE ? 104 : 34;
  /* a·b·d 는 좌우 교차 → 양쪽에 자리. c 는 현행(오른쪽 한 열). */
  const TWO_SIDED = VARIANT !== "c";
  let PADL = WIDE ? 70 : TWO_SIDED ? SIDE_W : 22;
  let PADR = WIDE ? 70 : TWO_SIDED ? SIDE_W : Math.round(30 + ROW_W + 8);
  const spanX = (lon1 - lon0) * kx, spanY = lat1 - lat0;
  /* ⚠️ 좌우 여백을 **최악값(가장 긴 이름 + 가장 많은 뱃지)** 으로 잡으면 지도가 확 줄어든다.
     신안산선 실측(2026-09-09): 최악값 344px × 2 = 688px 을 이름 자리로 떼어 주니 지도에 남는
     가로가 280px 뿐이라 **가로가 병목**이 되고, 세로로는 386px 이 빈 채로 남았다 —
     오너가 "여의도 윗부분과 아랫부분 여백을 날려 달라"고 한 게 이 여백이다.
     실제로는 뱃지 있는 역은 오른쪽에 몰리므로 왼쪽은 그만큼 필요 없다. 그래서 **두 번 잰다** —
     한 번 놓아 보고, 그 배치가 실제로 쓰는 폭으로 여백을 다시 잡아 더 크게 그린다. */
  let s, offX, offY;
  /* 🔴 남는 자리를 **가운데로 나누지 않는다** (오너 2026-09-10: GTX-A "불필요한 왼쪽을 자르고
     노선/지도 확대해줘"). GTX-A 는 세로로 길어 배율이 **높이**에 걸린다 — 그러면 가로가 남고,
     남는 것을 반씩 나누면 이름표가 하나도 없는 왼쪽(강화·김포 앞바다)에 200px 이 그냥 간다.
     남는 자리는 **이름표가 필요하다고 말한 만큼**(PADL:PADR) 나눈다. 한쪽이 24px 만 달라고 하면
     그쪽에는 거의 안 주고 노선이 그리로 붙는다 — 잘라 낸 것과 같은 효과다.
     ⚠️ 양쪽이 비슷하면(신안산·인동선처럼 좌우 교차 배치) 이 식은 가운데 나누기와 같아진다. */
  const fit = () => {
    s = Math.min((MAP_W - PADL - PADR) / spanX, (BH - PADT - PADB) / spanY);
    offX = PADL + (MAP_W - PADL - PADR - spanX * s) / 2;
    offY = PADT + (BH - PADT - PADB - spanY * s) / 2;
  };
  fit();
  const X = (lon) => offX + (lon - lon0) * kx * s;
  const Y = (lat) => BH - (offY + (lat - lat0) * s);
  /* ── 어느 대각선이 비는가. 노선 점들의 (x,y) 공분산 부호 하나면 된다 —
     양수면 북서→남동(그 대각선이 노선 위)이므로 상자는 북동·남서로 간다. */
  if (VARIANT === "d" && !WIDE) {
    const pts = mainWay.g.map((q) => ({ x: X(q.lon), y: Y(q.lat) }));
    const mx = pts.reduce((a, q) => a + q.x, 0) / pts.length;
    const my = pts.reduce((a, q) => a + q.y, 0) / pts.length;
    const cov = pts.reduce((a, q) => a + (q.x - mx) * (q.y - my), 0);
    panelDiag = cov > 0 ? "nesw" : "nwse";
    PANELS = PANELS_FN(VARIANT, BH, panelDiag);
  }
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
    return (k.length ? badgeRowWidth(k) + BDG_PAD : 0) + [...p2name(st)].length * LBL_FS * 0.98 + provW(st);
  };
  function p2name(st) { return st.name; }

  /* 어느 갈래에 속한 역인지 표를 붙인다 — ⑤ 에서 **제 선은 빼고** 남의 선만 재기 위해서다. */
  const allPos = [...pos.map((p) => ({ ...p, cid: 0 })),
                  ...branchPos.map((p) => ({ ...p, cid: 1 })),
                  ...thruPos.map((p) => ({ ...p, cid: 2 })),
                  ...sharedPos.map((p) => ({ ...p, cid: 0 }))];   // 공용역은 본선 위에 있다
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
        for (const q of g) {
          /* 제 선은 **제 역 언저리만** 뺀다. 통째로 빼면 노선이 굽은 자리에서
             라벨이 제 노선을 타고 넘는다(인동선 「원천」이 마커와 12% 겹쳤다, 2026-09-09).
             55px 은 역 표시(반지름 12)와 지시선 출발 구간을 덮는 값이다. */
          if (ci === p.cid && Math.hypot(q.x - x, q.y - y) < 55) continue;
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
    /* ⓐ 노선이 한쪽을 지정하면 그게 기본이다(labelSideDefault).
       🔴 왜 필요한가: **비워 둔 쪽이 곧 지도에 더 보이는 땅**이다. 이름표에 왼쪽 370px 을
          떼어 주면 그 370px 이 빈 여백이 아니라 **강화·김포 앞바다**로 채워진다(GTX-A, 세로로
          길어 배율이 높이에 걸리는 노선). 이름표를 한쪽으로 모으면 반대쪽 여백이 24px 로 줄고,
          그만큼 지도 창이 좁아져 **필요 없는 땅이 잘려 나간다.** 오너 2026-09-10:
          "gtx a는 불필요한 왼쪽을 자르고 노선/지도 확대해줘". */
    let side = L.labelSideDefault === "right" ? 1
             : L.labelSideDefault === "left" ? -1
             : i % 2 === 0 ? 1 : -1;                       // ①
    /* ③ 뱃지가 있는 역은 오른쪽 — 로고를 이름 **앞**에서 읽게 하려는 규칙이다.
       🔴 그런데 **대부분의 역에 뱃지가 있으면 이 규칙이 스스로를 무너뜨린다**(2026-09-10).
          GTX-B 는 15역 중 14역이 환승역이라 라벨이 전부 오른쪽 한 줄에 쌓였고, 세로 겹침
          해소가 그것들을 200px 씩 밀어내 **서울역 이름이 송파 위에, 왕숙이 하남 위에** 놓였다.
          지시선이 이어 주긴 하지만 지도 카드에서 그건 「역이 거기 있다」로 읽힌다.
          한쪽에 몰릴 바에는 **번갈아 놓는 편이 정확하다** — 읽는 순서보다 자리가 먼저다. */
    const badgeShare = allPos.filter((q) => (q.st.xfer || []).length).length / (allPos.length || 1);
    if ((p.st.xfer || []).length && badgeShare <= 0.6) side = 1;   // ③
    if (!fitsCard(side) && fitsCard(-side)) side = -side;     // ②
    if (crossesLine(side) && !crossesLine(-side) && fitsCard(-side)) side = -side;  // ⑤
    if (hitsPanel(side) && !hitsPanel(-side) && fitsCard(-side)) side = -side;      // ④
    /* ⓪ 오너 지정이 **모든 규칙을 이긴다** (2026-09-09: "메타폴리스와 능동은 역명 위치를
       바꿔야 보기가 좋을것 같아"). 규칙 ①~⑤ 는 「부딪히지 않는 자리」까지만 안다 —
       부딪히지 않는 자리가 여럿일 때 어느 쪽이 읽기 좋은지는 사람이 본다.
       ⚠️ 카드 밖으로 나가는 쪽은 지정이어도 안 따른다. 그건 취향이 아니라 사고다.
       가로 판형(is-wide)은 위/아래라 같은 키에 "up"/"down" 을 쓴다(assignUpDown ⓪). */
    if (p.st.labelSide === "left"  && fitsCard(-1)) side = -1;
    if (p.st.labelSide === "right" && fitsCard(1))  side = 1;
    /* ⓠ **위/아래 놓기** (오너 2026-09-09: "메타폴리스 노선과 겹치잖아 … 굳이 직선으로
       연결하지 않아도 되는 역명들은 그냥 적당히 가까이 붙여도 될것같아").
       좌우가 둘 다 막힌 역이 있다 — 메타폴리스는 오른쪽이면 제 노선(동탄 방향)을 깔고 앉고,
       왼쪽이면 능동과 부딪힌다. 그런 자리에서는 **마커 바로 위/아래**가 유일하게 빈 곳이다.
       지시선 없이 붙이므로 어느 점인지도 헷갈리지 않는다.
       ⚠️ 세로 판형에서만 쓴다. 가로 판형은 위/아래가 기본 배치라 같은 키가 다른 뜻이다. */
    const vert = p.st.labelSide === "up" ? -1 : p.st.labelSide === "down" ? 1 : 0;
    return { ...p, x, y, ly: y, side, vert };
  });
  };

  /* ── 2패스: 실제 배치가 쓰는 폭으로 좌우 여백을 다시 잡고 지도를 키운다.
     한쪽에 아무것도 없으면 그 쪽은 24px 만 남긴다. 여백을 줄이면 배율이 커지고,
     배율이 커지면 역 위치가 달라져 쪽이 바뀔 수 있다 — 그래서 **몇 번 돌려 안정될 때까지** 본다.
     ⚠️ 마지막에 한 번 더 확인한다. 배치를 바꾼 뒤 여백이 모자라면 그때는 **여백을 넓히고
        쪽은 그대로 둔다** — 여기서 또 쪽을 바꾸면 두 상태를 오갈 수 있다. */
  const needSide = (g, sd) => {
    /* 위/아래로 놓은 라벨은 **좌우 여백을 안 쓴다** — 세면 지도가 공연히 좁아진다. */
    const q = g.filter((p) => p.side === sd && !p.vert);
    return q.length ? Math.round(Math.max(...q.map((p) => rowW(p.st))) + LEAD_W + 8) : 24;
  };
  /* ── 가로 노선: 이름표를 **위아래로 번갈아** 놓는다.
     같은 쪽 이웃 간격이 두 배가 되어 밀어내는 양이 절반으로 준다 — 세로 배치와 같은 원리다.
     ⚠️ 뱃지는 이름 **안쪽(노선 쪽)** 에 둔다. 위아래에서는 좌우 읽기 순서가 없으므로
        「이름 앞 로고」가 성립하지 않는다 — 대신 **양쪽이 대칭**인 게 낫다. */
  /* 🔴 38 이어야 한다 — 뱃지·이름이 **한 줄**이 되면서 줄 높이가 40px 이 됐다(반 20px).
     역 표시는 반지름 12px 이므로 26 이나 32 로 두면 마커 바로 위/아래의 뱃지가 마커를 문다
     (GTX-B 인천시청의 「인천2」가 20% 겹쳤다 — designQa svglabel 이 잡았다).
     12(마커) + 20(줄 반) + 6(숨) = 38. */
  /* 🔴 이름표가 마커에서 떨어지는 거리는 **역마다 다르다** (오너 2026-09-10 "가까이 붙여줘").
     한 줄 배치에서 줄 높이는 뱃지가 있으면 40px, 없으면 글자 23px 이다. 그런데 38 을
     한 값으로 쓰면 **뱃지 없는 역까지 뱃지 있는 역만큼 밀려난다** — 대장홍대선에서 그게
     오정·고강·신월·덕은·상암·성산 여섯 역이었다.
     필요한 만큼만 띄운다: 마커 반지름 12 + 줄 높이의 반 + 숨 6. */
  const LEAD_V_BASE = L.oneRowLabel === true ? 38 : 26;
  /* 🔴 역 하나만 더 붙이거나 더 띄우고 싶을 때가 있다(오너 2026-09-10 "청학 짧게 ·
     용산 좀 더 위로 길게"). 규칙을 비틀지 않고 데이터셋에 숫자 한 개로 적는다. */
  const leadVOf = (st) => (typeof st.leadV === "number" ? st.leadV
    : L.oneRowLabel === true
    ? 12 + ((st.xfer || []).length ? BDG_R : LBL_FS / 2) + 6
    : LEAD_V_BASE);
  const LEAD_V = LEAD_V_BASE, BDG_H = BDG_R * 2, BDG_VGAP = 6;
  /* 한 줄 배치이므로 폭은 **더하기**다(앞 판은 쌓아 놓아 max 였다). 이 값이 겹침 해소의 자다 —
     안 맞추면 뱃지 있는 역이 이웃 이름을 파고든다. */
  /* 🔴 **한 줄로 놓기는 노선이 켠다**(oneRowLabel).
     뱃지와 이름을 한 줄로 놓으면 라벨이 마커에 26px 더 붙는다(대장홍대선 가양이 한강 위에
     떠 있던 것을 이걸로 고쳤다). 그런데 **줄이 그만큼 넓어진다** — 역이 많고 이름이 긴
     월판선(11역)에서는 넓어진 줄끼리 부딪혀 designQa error 4건이 났다.
     확정된 카드의 픽셀을 지키면서 필요한 노선만 켜는 쪽을 고른다. */
  const ONE_ROW = L.oneRowLabel === true;
  const rowWv = (st) => {
    const keys = st.xfer || [];
    const bw = keys.length ? badgeRowWidth(keys) : 0;
    const nm = [...st.name].length * LBL_FS * 0.98 + provW(st);
    /* 세로로 쌓으면 폭은 **가장 넓은 뱃지 하나**다 — 겹침 해소가 이 값을 자로 쓴다. */
    if (st.badgeStack === true && keys.length > 1)
      return Math.max(nm, Math.max(...keys.map((k) => badgeWidth(k))));
    return ONE_ROW ? (bw ? bw + BDG_PAD : 0) + nm : Math.max(nm, bw);
  };
  /* 🔴 **옆으로 비켜 세우기**(labelAlign)의 자 — 그리기와 겹침 해소가 같은 값을 봐야 한다.
     "left" 는 줄의 오른쪽 끝을 마커 왼쪽 14px 에 붙인다(그 반대가 "right").
     지정이 없으면 0 이라 확정된 카드의 픽셀은 그대로다. */
  const alignOff = (st) => (st.labelAlign === "left" ? -(rowWv(st) / 2 + 14)
    : st.labelAlign === "right" ? rowWv(st) / 2 + 14 : 0);
  /* labelDx — 겹침 해소가 **다 끝난 뒤에** 얹는 손끝 밀기(px). 자동 배치로는 못 가는 빈자리가
     지도마다 한두 곳 있다. ⚠️ alignOff 에 넣으면 밀어내기가 도로 제자리로 돌려놓는다 —
     그래서 그리기에서만 더한다. */
  const dxOf = (st) => (typeof st.labelDx === "number" ? st.labelDx : 0);
  const assignUpDown = () => allPos.map((p, i) => {
    const x = X(p.lon), y = Y(p.lat);
    const stackN = (p.st.badgeStack === true && (p.st.xfer || []).length > 1) ? (p.st.xfer || []).length : 0;
    const need = leadVOf(p.st) + (stackN ? stackN * BDG_H + (stackN - 1) * 5 + 6 + LBL_FS
      : ONE_ROW ? Math.max(BDG_H, LBL_FS)
      : ((p.st.xfer || []).length ? BDG_H + BDG_VGAP : 0) + LBL_FS) + 8;
    let side = i % 2 === 0 ? 1 : -1;                 // ① 번갈아 (+1 = 아래)
    /* ⓪ 데이터셋이 쪽을 지정했으면 그게 우선이다(오너가 눈으로 보고 정한 자리).
       규칙으로 못 잡는 자리가 가끔 있다 — 그럴 때 코드를 비틀지 말고 여기 한 줄로 적는다. */
    if (p.st.labelSide === "up") side = -1;
    else if (p.st.labelSide === "down") side = 1;
    if (side > 0 && y + need > BH - 6) side = -1;    // ② 카드 밖이면 반대쪽
    if (side < 0 && y - need < 6) side = 1;
    return { ...p, x, y, lx: x, side };
  });

  let lbl = WIDE ? assignUpDown() : assignSides();
  if (TWO_SIDED && !WIDE) {
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
    /* ── 🔴 **실제로 쓴 만큼까지 조인다** (오너 2026-09-10 "불필요한 왼쪽을 자르고 지도 확대")
       needSide 는 그 쪽에서 **가장 넓은 줄**을 기준으로 여백을 잡는다. 그런데 노선은 곧지 않다 —
       GTX-A 는 마커 x 가 387~724 로 337px 을 오간다. 가장 넓은 줄이 가장 왼쪽 마커에 붙어 있지
       않으면, 그 차이만큼 **아무도 안 쓰는 띠**가 생기고 그 띠가 지도에서는 강화·김포가 된다
       (실측 123px). 그래서 놓아 본 뒤 **진짜 왼쪽 끝·오른쪽 끝**을 재서 여백을 다시 잡고,
       남는 만큼 배율을 올린다. 두 번이면 안정된다(배율이 바뀌면 자리도 조금 바뀌므로 다시 잰다).
       ⚠️ 8px 은 카드 테두리에서 떼어 놓는 최소 숨이다. */
    for (let pass = 0; pass < 3; pass++) {
      const edge = (p, sd) => (sd > 0 ? p.x + LEAD_W + rowW(p.st) + 8 : p.x - LEAD_W - rowW(p.st) - 8);
      const leftMost = Math.min(...lbl.filter((p) => p.side < 0).map((q) => edge(q, -1)), MAP_W);
      const rightMost = Math.max(...lbl.filter((p) => p.side > 0).map((q) => edge(q, 1)), 0);
      const slackL = Math.max(0, leftMost - 8), slackR = Math.max(0, MAP_W - 8 - rightMost);
      if (process.env.RGM_DEV) console.log("      · 조이기 pass" + pass + " leftMost=" + leftMost.toFixed(0) + " rightMost=" + rightMost.toFixed(0) + " PADL=" + PADL.toFixed(0) + " PADR=" + PADR.toFixed(0));
      if (slackL < 6 && slackR < 6) break;
      /* ⚠️ 여기서 needSide 로 되돌리면 안 된다 — needSide 는 **가장 넓은 줄**을 다시 불러와
         방금 조인 것을 그대로 물린다(2026-09-10 에 그렇게 세 번 헛돌았다).
         조인 뒤에는 **실제 끝**을 다시 재서, 카드 밖으로 나간 만큼만 되돌린다. */
      const prevL = PADL, prevR = PADR;
      PADL = Math.max(24, PADL - slackL); PADR = Math.max(24, PADR - slackR);
      fit(); lbl = assignSides();
      const outL = 8 - Math.min(...lbl.filter((p) => p.side < 0).map((q) => edge(q, -1)), MAP_W);
      const outR = Math.max(...lbl.filter((p) => p.side > 0).map((q) => edge(q, 1)), 0) - (MAP_W - 8);
      if (outL > 0 || outR > 0) {
        PADL = Math.min(prevL, PADL + Math.max(0, outL));
        PADR = Math.min(prevR, PADR + Math.max(0, outR));
        fit(); lbl = assignSides();
      }
    }
  }

  /* ── 배경: 시군구 면 + 바다 + 한강
     ⚠️ 그릴 시군구를 고르는 상자는 **노선 상자 ±0.05°** 였다. 바다를 파랑으로 칠하기 전에는
        안 그려진 땅이 바탕색으로 남아 티가 안 났지만, 이제는 **안 그려진 땅이 바다로 보인다.**
        그래서 상자를 **화면에 실제로 보이는 범위**로 잡는다(배율이 정해진 뒤라 역산할 수 있다). */
  const visLon0 = lon0 - offX / (kx * s), visLon1 = lon0 + (MAP_W - offX) / (kx * s);
  const visLat0 = lat0 - offY / s, visLat1 = lat0 + (BH - offY) / s;
  const PADD = 0.02;
  const inBox = (r) => r.some(([lon, lat]) =>
    lat > visLat0 - PADD && lat < visLat1 + PADD && lon > visLon0 - PADD && lon < visLon1 + PADD);
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
    /* 인천은 **회색 계열**로 뺀다(오너 2026-09-09). 앞 판의 #e4e8e5 는 초록빛이 돌아
       물빛과 헷갈렸다 — 바다를 파랑으로 칠하면서 더 그랬다.
       🔴 그 다음 판 #e2e3e6 도 **파랑기가 남아 바다처럼 읽혔다**(오너 2026-09-10:
          "인천을 회색빛 나는 바탕으로 표기해야, 파랑빛으로 바다를 표현하지 않을까?").
          GTX-B·월판선처럼 인천이 넓게 나오는 카드에서 왼쪽이 통째로 물로 보였다.
          이제 **파랑기를 0 으로** 둔다 — R>G>B 로 살짝 따뜻한 중립 회색이다.
          이 색은 「파랑 = 물」을 카드 안에서 유일하게 만들기 위한 것이다. */
    인천광역시: "#e3e0dc",
  };
  const FILL_ETC = "#edeae3";
  /* 🔴 판 바탕을 **바다색으로 칠하지 않는다** (2026-09-09, 오너가 잡았다 — "국제테마파크역은
     왜 바다로 나와?").
     한 판 바다색으로 깔아 봤다. 「시군구 면이 안 덮은 곳 = 물」이라는 전제였는데 **그 전제가 틀렸다.**
     실측: 안산시단원구의 남쪽 끝이 37.289 이고 화성시만세구가 그 아래에서 다시 시작하는데,
     그 사이 37.26~37.29 · 126.74~126.79 가 통째로 비어 있다. 서해선 원시~서화성 구간이
     정확히 거기를 지나고, 국제테마파크역이 그 위에 놓였다 — 지도에서 **역이 물 위에 떴다.**
     그 빈자리가 시화호인지 송산그린시티 매립지인지 우리 자료로는 **가릴 수 없다**(대부도·영종도
     같은 섬은 들어 있으니 단순 누락도 아니다. 경계 자료는 육지/바다 마스크가 아니다).
     world-countries.geojson 은 남한 전체가 19점이라 마스크로 못 쓴다.
     → **모르는 것을 색으로 단정하지 않는다.** 물은 출처가 있는 것(한강)만 파랑으로 그린다.
     제대로 칠하려면 OSM natural=water·coastline 을 따로 받아야 한다(rail-geo.yml 확장 지점). */
  let land = `<rect x="0" y="0" width="${MAP_W}" height="${BH}" fill="${FILL_ETC}"/>`;
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

  /* ── 물 — **출처가 있는 것만 파랑으로 칠한다** (오너 2026-09-10 "바다는 전체 카드 다
     파랑기 있게 통일 해줘").
     🔴 2026-09-09 에 「시군구 면이 안 덮은 곳 = 물」로 칠했다가 국제테마파크역이 물 위에 떴다.
        경계 자료는 육지/바다 마스크가 아니다 — 안산단원구와 화성시 사이의 빈자리는 바다가
        아니라 매립지(송산그린시티)였다. 그래서 **모르는 곳은 여전히 안 칠한다.**
     이제는 OSM 이 물이라고 적어 둔 곳만 칠한다(data/geo/_water-osm.json —
     natural=water · waterway=riverbank). 시화호·저수지·하천이 여기 들어 있다.
     ⚠️ **바다(coastline 바깥)는 아직 안 칠한다.** coastline 은 선이라 면이 되려면 화면
        가장자리를 따라 닫아야 하고, 그 닫는 방향을 잘못 잡으면 육지가 통째로 파래진다.
        받아는 뒀으니(kind: coastline) 다음에 그 방법으로 채운다.
     한강은 sudogwon-map 과 같은 부품으로 한 번 더 그린다 — 좁은 구간에서 면이 끊겨 보이는 것을
     굵은 선이 이어 준다. 두 곳에서 그리는 게 아니라 **면 위에 선을 겹쳐** 두께를 보장하는 것이다. */
  let river = "";
  {
    const WATER_FILL = "#cfe0ee";
    let poly = "";
    try {
      const wj = JSON.parse(readFileSync(join(ROOT, "data/geo/_water-osm.json"), "utf8"));
      for (const w of wj.물 || []) {
        if (w.kind === "coastline") continue;                       // 선이라 면이 안 된다
        const g = w.g;
        /* 화면 밖은 그리지 않는다 — 2,900개를 다 그리면 SVG 가 수 MB 가 된다. */
        if (!g.some((q) => q.lat > visLat0 - 0.02 && q.lat < visLat1 + 0.02 &&
                           q.lon > visLon0 - 0.02 && q.lon < visLon1 + 0.02)) continue;
        poly += `<path d="${g.map((q, i) => `${i ? "L" : "M"}${X(q.lon).toFixed(1)},${Y(q.lat).toFixed(1)}`).join("")}Z" fill="${WATER_FILL}" stroke="none"/>`;
      }
    } catch (e) {
      /* 물 자료가 아직 없는 세션도 있다(rail-geo.yml 대기열 키 water). 그때는 한강만 그린다. */
      console.log(`   ⓘ ${L.name} — 물 자료가 없어 한강만 그립니다 (${e.code || e.message})`);
    }
    try {
      const named = sgg.features.map((f) => ({ name: f.properties.name, rings: rings(f.geometry) }));
      const hr = hanRiverPoints(named);
      river = poly + `<path d="${hr.map(([lon, lat], i) => `${i ? "L" : "M"}${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join("")}" fill="none" stroke="${WATER_FILL}" stroke-width="13" stroke-linecap="round"/>`;
    } catch (e) { throw new Error(`${L.name}: 한강을 못 그렸다 — ${e.message}`); }
  }

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
  const HALO = TWO_SIDED ? HALO_S : "";
  const LBL_GAP = 32;  /* 글자 23px + 여유 9px. 폰트를 키웠으면 간격도 같이 키운다 */
  /* 이름표가 실제로 먹는 상자 — 좌우판과 위아래판 두 모양. 자리 다툼은 이 상자로만 잰다. */
  const sideBox = (p) => {
    const w = rowW(p.st) + LEAD_W + 12;
    return p.side > 0
      ? { x0: p.x, x1: p.x + w, y0: p.ly - 17, y1: p.ly + 17 }
      : { x0: p.x - w, x1: p.x, y0: p.ly - 17, y1: p.ly + 17 };
  };
  const vertBox = (p) => {
    const w = rowW(p.st) + 10;
    const cy = p.y + p.vert * (13 + 9 + LBL_FS / 2);
    return { x0: p.x - w / 2, x1: p.x + w / 2, y0: Math.min(p.y, cy) - 15, y1: Math.max(p.y, cy) + 15 };
  };
  /* 자동 위/아래 옮기기는 **노선이 켠다**(autoVert). 확정된 카드의 픽셀을 건드리지 않기 위해서다. */
  const AUTO_VERT = L.autoVert === true;
  /* 노선(과 그 위의 역 표시)의 화면 좌표 — 자리 다툼을 재는 데 두 곳에서 쓴다. */
  const corrAll = [mainWay.g, branchPts, thruPts].flatMap((g) => g.map((q) => ({ x: X(q.lon), y: Y(q.lat) })));
  if (WIDE) {
    /* 가로 배치의 겹침 해소 — 세로판의 거울이다. 쪽마다 x 순으로 훑어 밀고, 끝에서 되민다. */
    for (const sd of [1, -1]) {
      const g = lbl.filter((p) => p.side === sd).sort((a2, b2) => a2.x - b2.x);
      const half = (p) => rowWv(p.st) / 2;
      /* 밀고 되미는 자는 **줄의 가운데**다 — 비켜 세운 역은 lx 가 아니라 비킨 자리가 가운데다. */
      const ctr = (p) => p.lx + alignOff(p.st);
      const put = (p, c) => { p.lx = c - alignOff(p.st); };
      /* 🔴 **같은 쪽이라고 다 부딪히는 것은 아니다** (2026-09-10).
         지시선 길이(leadV)와 줄 높이는 역마다 다르다 — 용산은 마커에서 62px 위, 청량리는 26px
         위에 놓인다. 두 줄의 **세로 띠가 겹치지 않으면** 가로로 밀 이유가 없다.
         앞 판은 x 순으로 무조건 밀어서, 용산의 세 뱃지 줄(177px)이 청량리를 117px 오른쪽으로
         밀어 왕숙 마커 위에 올려놓았다(designQa svglabel 이 잡았다).
         오너가 "그 공간을 파고들어"라고 부른 것이 바로 이 빈 띠다. */
      const blockH = (st) => {
        const ks = st.xfer || [];
        if (st.badgeStack === true && ks.length > 1)
          return ks.length * BDG_H + (ks.length - 1) * 5 + 6 + LBL_FS;
        return ONE_ROW ? Math.max(BDG_H, LBL_FS) : (ks.length ? BDG_H + BDG_VGAP : 0) + LBL_FS;
      };
      const band = (p) => {
        const a = p.y + sd * leadVOf(p.st), b = a + sd * blockH(p.st);
        return [Math.min(a, b) - 4, Math.max(a, b) + 4];
      };
      const hits = (a2, b2) => { const A = band(a2), B = band(b2); return A[0] < B[1] && B[0] < A[1]; };
      for (let i = 1; i < g.length; i++) {
        let min = -Infinity;
        for (let j = 0; j < i; j++) {
          if (!hits(g[j], g[i])) continue;
          min = Math.max(min, ctr(g[j]) + half(g[j]) + half(g[i]) + 12);
        }
        if (min > -Infinity && ctr(g[i]) < min) put(g[i], min);
      }
      if (g.length) {
        const last = g[g.length - 1], R = MAP_W - 8 - half(last);
        if (ctr(last) > R) put(last, R);
      }
      for (let i = g.length - 2; i >= 0; i--) {
        let max = Infinity;
        for (let j = i + 1; j < g.length; j++) {
          if (!hits(g[j], g[i])) continue;
          max = Math.min(max, ctr(g[j]) - half(g[j]) - half(g[i]) - 12);
        }
        if (max < Infinity && ctr(g[i]) > max) put(g[i], max);
      }
      for (const p of g) { const Lm = 8 + half(p); if (ctr(p) < Lm) put(p, Lm); }
    }
    /* ── 🔴 밀어낸 뒤 **남의 마커를 물었는지** 본다 (2026-09-10)
       가로 판형은 [뱃지][이름]을 한 줄로 놓으면서 줄이 넓어졌다. 가로로 밀어내는 규칙은
       이름표끼리만 보고 **역 표시는 안 본다** — 그래서 밀려난 줄이 옆 역의 동그라미를
       덮었다(GTX-B 인천시청의 「인천2」 20%, 월판선 「만안」 25%. designQa svglabel 이 잡았다).
       걸리면 위/아래를 뒤집는다. 뒤집어도 걸리면 그냥 둔다 — 어느 쪽이든 걸리는 자리다. */
    const markers = allPos.map((q) => ({ x: X(q.lon), y: Y(q.lat) }));
    const rowBox = (p, sd) => {
      const hw = rowWv(p.st) / 2 + 6, cy = p.y + sd * leadVOf(p.st) + sd * Math.max(BDG_H, LBL_FS) / 2;
      const c = p.lx + alignOff(p.st);
      return { x0: c - hw, x1: c + hw, y0: cy - 22, y1: cy + 22 };
    };
    const bites = (p, sd) => {
      const b = rowBox(p, sd);
      return markers.some((m) => Math.hypot(m.x - p.x, m.y - p.y) > 6 &&
        m.x > b.x0 - 13 && m.x < b.x1 + 13 && m.y > b.y0 - 13 && m.y < b.y1 + 13);
    };
    /* ⚠️ 한 줄 배치를 켠 노선에서만 돈다 — 줄이 넓어진 것이 이 규칙이 필요해진 이유이고,
       옛 배치(월판선 확정본)에서는 이미 designQa 0 이라 손댈 이유가 없다. */
    if (ONE_ROW) for (const p of lbl) {
      if (p.st.labelSide) continue;              // 오너가 정한 자리는 안 건드린다
      if (!bites(p, p.side)) continue;
      if (!bites(p, -p.side)) p.side = -p.side;
    }
  } else
  /* ⚠️ 겹침 해소는 **배열 순서가 아니라 y 순서**로 돌아야 한다. 본선 뒤에 지선을 이어 붙였더니
     지선 역들이 본선 마지막 역 뒤로 정렬돼 카드 아래로 밀리고, 지시선이 지도를 가로질렀다
     (2026-09-09). 아래로 미는 규칙은 "위에서 아래로 훑는다"를 전제하므로 정렬이 먼저다. */
  /* ── 🔴 **멀어진 이름표는 마커 위/아래로 옮긴다** (오너 2026-09-10)
     "노선 위 아래로 역명 적절히 배치해서 가까이 옮겨줘. 지금 멀어지니까 직선이 길어져 어지럽잖아"
     좌우 배치는 같은 쪽 이웃끼리 세로로 밀어내며 자리를 만든다. 역이 촘촘한 구간(GTX-A 의
     대곡·창릉·연신내·서울역)에서는 그 밀어냄이 100px 을 넘고, 그만큼 지시선이 길어져
     **어느 선이 어느 역인지 눈으로 따라가야 하는 그림**이 된다.
     그런 이름표는 제 마커 바로 위나 아래로 옮긴다 — 거기가 비어 있다면. 지시선이 사라진다.
     ⚠️ 옮기기 전에 **네 가지를 다 본다**: 이미 놓인 이름표 · 노선(제 선 포함) · 정보 패널 · 카드 밖.
        하나라도 걸리면 옮기지 않는다. 좌우에 있던 편이 낫다 — 겹치는 것보다는 먼 게 낫다. */
  if (!WIDE && AUTO_VERT) {
    const taken = lbl.filter((p) => p.vert).map((p) => vertBox(p));
    lbl.filter((p) => !p.vert).forEach((p) => {
      /* 좌우 배치가 쓰는 상자도 「이미 놓인 것」에 넣는다 — 옮긴 뒤 그 자리를 다시 밟으면 안 된다. */
      taken.push(sideBox(p));
    });
    for (const p of lbl) {
      if (p.vert) continue;
      if (p.st.labelSide) continue;                      // 오너가 지정한 자리는 코드가 안 건드린다
      /* 문턱값은 노선이 정한다(autoVertAt, 기본 45px).
         🔴 낮출수록 이름표가 위/아래로 많이 가고, 그만큼 **좌우 여백(PADL·PADR)이 줄어**
            지도가 커진다 — 세로로 긴 노선에서 배율을 잡고 있는 것은 가로이고, 그 가로를
            먹는 것이 이름표 자리이기 때문이다(GTX-A 는 왼쪽에만 370px). 오너 "지도 확대해줘". */
      if (Math.abs(p.ly - p.y) <= (L.autoVertAt ?? 45)) continue;
      const mine = sideBox(p);
      const others = taken.filter((b) => b !== mine);
      for (const dir of [-1, 1]) {                        // 위 먼저(지도에서 위가 덜 붐빈다)
        const b = vertBox({ ...p, vert: dir });
        if (b.x0 < 8 || b.x1 > MAP_W - 8 || b.y0 < 8 || b.y1 > BH - 8) continue;
        if (others.some((o) => b.x1 > o.x0 && b.x0 < o.x1 && b.y1 > o.y0 && b.y0 < o.y1)) continue;
        if (PANELS.some((P) => b.x1 > P.x0 - 8 && b.x0 < P.x1 + 8 && b.y1 > P.y0 - 8 && b.y0 < P.y1 + 8)) continue;
        /* 여유 4px 은 모자랐다 — 역 표시는 반지름 9.5 에 테두리 5 라 **12px 짜리 원**이다.
           4px 로 재면 뱃지가 남의 마커를 20% 물고도 통과한다(GTX-B 인천시청, designQa 가 잡았다). */
        if (corrAll.some((q) => q.x > b.x0 - 16 && q.x < b.x1 + 16 && q.y > b.y0 - 16 && q.y < b.y1 + 16)) continue;
        p.vert = dir; p.ly = p.y;
        taken.splice(taken.indexOf(mine), 1);
        taken.push(b);
        break;
      }
    }
  }

  /* ── 패널을 **세로로** 피한다 (2026-09-10)
     쪽 고르기 ④ 는 「반대쪽이 비었으면 그리로」까지만 한다. 양쪽이 다 막힌 역이 있다 —
     GTX-A 서울역은 뱃지가 다섯이라 왼쪽으로 보내면 카드 밖이고, 오른쪽은 공정률 패널이다.
     그래서 **이름이 패널 뒤로 통째로 사라졌다.**
     패널은 불투명하니 그 위에 얹힌 이름은 없는 것과 같다 — 그때는 **위나 아래로 비킨다.**
     지시선이 따라 붙어 어느 점인지는 그대로 알 수 있다(지시선이 있는 이유가 이것이다).
     ⚠️ 패널 밖으로 나가는 데 필요한 거리가 더 짧은 쪽으로 민다. 카드 밖으로는 안 민다. */
  if (!WIDE && PANELS.length) {
    for (const p of lbl) {
      if (p.vert) continue;
      const a0 = p.side > 0 ? p.x : p.x - LEAD_W - rowW(p.st);
      const a1 = p.side > 0 ? p.x + LEAD_W + rowW(p.st) : p.x;
      for (const P of PANELS) {
        if (!(a1 > P.x0 - 10 && a0 < P.x1 + 10)) continue;
        if (!(p.ly > P.y0 - 22 && p.ly < P.y1 + 22)) continue;
        const up = P.y0 - 34 - p.ly, down = P.y1 + 34 - p.ly;   // 각각 필요한 이동량(부호 포함)
        const pick = Math.abs(up) <= Math.abs(down) ? up : down;
        const want = p.ly + pick;
        if (want > 16 && want < BH - 20) p.ly = want;
      }
    }
  }
  for (const sd of [1, -1]) {
    /* 위/아래 라벨은 이 줄세우기에 끼지 않는다 — 제 마커에 붙어 있어야 뜻이 있다. */
    const g = lbl.filter((p) => p.side === sd && !p.vert).sort((x, y2) => x.y - y2.y);
    for (let i = 1; i < g.length; i++)
      if (g[i].ly - g[i - 1].ly < LBL_GAP) g[i].ly = g[i - 1].ly + LBL_GAP;
    const BOT = BH - 20;
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

    if (WIDE) {
      /* ── 가로 노선: [점] │지시선│ [뱃지] [이름]  (위아래 대칭)
         지시선은 세로로 빠져나와 45°로 꺾고 라벨 앞 10px 은 다시 세로 — 세로판의 거울이다. */
      /* 🔴 뱃지와 이름을 **한 줄로** 놓는다 (오너 2026-09-10: "역명 적절히 배치해서 가까이
         옮겨줘. 지금 멀어지니까 직선이 길어져 어지럽잖아").
         앞 판은 뱃지 줄 아래에 이름 줄을 쌓아 라벨이 마커에서 **66px** 떨어졌다 —
         가로 판형에서 그만큼 떨어지면 지시선이 길어지고, 대장홍대선 가양은 그 66px 때문에
         이름이 한강 위에 떠 있었다. 한 줄로 놓으면 **40px** 로 줄어 마커 옆에 붙는다.
         ⚠️ 좌우 읽기 순서는 세로판과 같게 [뱃지][이름] 이다. 가운데 맞춤은 그대로. */
      const bwRawV = keys.length ? badgeRowWidth(keys) : 0;
      const endY = p.y + p.side * leadVOf(p.st);
      const bcy = ONE_ROW ? endY + p.side * (Math.max(BDG_H, LBL_FS) / 2)
                          : endY + p.side * (BDG_H / 2);
      const ncy = ONE_ROW ? bcy
                          : endY + p.side * ((bwRawV ? BDG_H + BDG_VGAP : 0) + LBL_FS / 2);
      const dx = p.lx - p.x, syV = p.y + p.side * 13, runV = Math.abs(endY - syV), STUBV = 10;
      let leadV;
      /* ── 지시선을 아예 안 그리는 역 (오너 2026-09-10 "직선 없이")
         이름표가 제 마커 바로 위/아래에 붙어 있으면 그 사이 16px 짜리 선은 아무것도
         더하지 않는다 — 오히려 열두 개가 모이면 지도가 빗금처럼 보인다.
         ⚠️ 밀려난 이름표(lx ≠ x)에서는 여전히 그린다. 그때는 어느 점인지 알려 주는 장치다. */
      if (p.st.labelPin === true) {
        leadV = "";
      } else if (Math.abs(dx) < 1.5) {
        leadV = `<path d="M${p.x.toFixed(1)},${syV.toFixed(1)}V${endY.toFixed(1)}"`;
      } else {
        const diagV = Math.min(Math.abs(dx), runV - STUBV - 4);
        const outV = runV - STUBV - diagV;
        if (outV >= 6) {
          const k1 = syV + p.side * outV, k2 = endY - p.side * STUBV;
          leadV = `<path d="M${p.x.toFixed(1)},${syV.toFixed(1)}V${k1.toFixed(1)}L${p.lx.toFixed(1)},${k2.toFixed(1)}V${endY.toFixed(1)}"`;
        } else {
          const vL = Math.hypot(dx, endY - p.y) || 1;
          leadV = `<path d="M${(p.x + (dx / vL) * 13).toFixed(1)},${(p.y + ((endY - p.y) / vL) * 13).toFixed(1)}L${p.lx.toFixed(1)},${endY.toFixed(1)}"`;
        }
      }
      if (leadV) leadV += ` stroke="#9aa1ac" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      let bdV = "";
      if (keys.length) {
        /* 한 줄이므로 뱃지와 이름의 **가로 폭을 합쳐** 가운데를 잡는다. bxx 는 아래에서 다시 센다. */
      }
      inMap += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="9.5" fill="${prov ? "#f0eee9" : "#ffffff"}" stroke="${lc}" stroke-width="5"${prov ? ' stroke-dasharray="3.2 2.4"' : ""}/>`;
      const nmW = [...p.name].length * LBL_FS * 0.98, pwV = provW(p.st);
      /* ── 가로 정렬 지정(labelAlign). 기본은 마커에 가운데 맞춤이고,
         "left" 는 **줄의 오른쪽 끝을 마커 왼쪽에** 붙인다(그 반대가 "right").
         오너 2026-09-10: "가양, 고강은 왼편으로 붙여줘" — 마커 위아래가 붐비는 자리에서는
         옆으로 비켜 세우는 편이 읽힌다. */
      const rowAll = ONE_ROW ? (bwRawV ? bwRawV + BDG_PAD : 0) + nmW + pwV : 0;
      /* 비켜 세운 자리를 **가운데 하나(cx)** 로 모은다 — 한 줄이든 두 줄이든 쌓았든 같은 자다.
         (앞 판은 한 줄 배치에서만 먹어서 GTX-B 의 신도림·서울역을 옮길 수 없었다.) */
      const cx = p.lx + alignOff(p.st) + dxOf(p.st);
      const rowL = cx - rowAll / 2;
      /* ⚠️ 뱃지를 **세로로 쌓는다**(badgeStack). 환승이 셋이면 한 줄이 260px 이 되어
         옆 역을 덮는다 — 홍대입구(2·경의중앙·공항철도)가 그랬다.
         세로로 쌓으면 폭이 가장 넓은 뱃지 하나로 줄고, 이름은 그 아래(위)에 붙는다. */
      const STACK = p.st.badgeStack === true && keys.length > 1;
      let stackH = 0, nameCy = ncy, nameLeft = 0;
      if (STACK) {
        const bwMax = Math.max(...keys.map((k) => badgeWidth(k)));
        stackH = keys.length * BDG_H + (keys.length - 1) * 5;
        /* 쌓은 더미의 **바깥 끝**이 이름 쪽이다 — 위쪽 역이면 이름이 더미 위로 간다. */
        const top = p.side > 0 ? endY + 4 : endY - 4 - stackH;
        keys.forEach((k, ki) => { bdV += badgeSvg(k, cx - badgeWidth(k) / 2, top + ki * (BDG_H + 5) + BDG_H / 2); });
        nameCy = p.side > 0 ? top + stackH + 6 + LBL_FS / 2 : top - 6 - LBL_FS / 2;
        nameLeft = cx - (nmW + pwV) / 2;
        void bwMax;
      } else if (keys.length) {
        let bxx = ONE_ROW ? rowL : cx - bwRawV / 2;
        for (const k of keys) { bdV += badgeSvg(k, bxx, bcy); bxx += badgeWidth(k) + BDG_GAP; }
      }
      const left = STACK ? nameLeft
        : ONE_ROW ? rowL + (bwRawV ? bwRawV + BDG_PAD : 0)
        : cx - (nmW + pwV) / 2;
      const nY = STACK ? nameCy : ncy;
      outMap += leadV + bdV +
        `<text x="${left.toFixed(1)}" y="${nY.toFixed(1)}" font-size="${LBL_FS}" font-weight="800" fill="#141821" letter-spacing="-0.6" dominant-baseline="middle" text-anchor="start"${HALO_S}>${esc(p.name)}</text>` +
        (pwV ? provSvg(left + nmW + PROV_GAP, nY, "start") : "");
      continue;
    }

    /* 양쪽 모두 **읽는 순서로 [뱃지][이름]** 이다 (오너 2026-09-09: "역이름 왼쪽(앞)에 로고").
       ⚠️ 앞 판은 왼쪽에서 [이름][뱃지][지시선] 이었다 — 안쪽(노선쪽)에 뱃지를 두면 대칭이라는
          생각이었는데, 그러면 왼쪽 역만 로고가 이름 **뒤**로 가서 오너 지시가 깨진다.
          대칭보다 **읽는 순서**가 먼저다.
       오른쪽: [지시선][뱃지][이름] · 왼쪽: [뱃지][이름][지시선] */
    const nameW = [...p.name].length * LBL_FS * 0.98;
    const pw = provW(p.st);
    const bwRaw = keys.length ? badgeRowWidth(keys) : 0;

    /* ── 위/아래 놓기 (ⓠ) — 마커 바로 위/아래에 가운데 맞춰 붙인다. 지시선은 없다.
       [뱃지][이름] 한 줄을 p.x 에 가운데 맞춘다 — 위아래에서는 좌우 읽기 순서가 없으므로
       가로 판형과 같은 규칙을 쓴다. */
    if (p.vert) {
      const rowWidth = bwRaw + (bwRaw ? BDG_PAD : 0) + nameW + pw;
      let left = p.x - rowWidth / 2;
      /* 카드 밖으로 나가면 안으로 당긴다 — 위/아래는 좌우 여백을 안 쓰기 때문에 여기서 막는다. */
      left = Math.max(8, Math.min(left, MAP_W - 8 - rowWidth));
      const cy = p.y + p.vert * (13 + 9 + LBL_FS / 2);
      let bxv = left, bdv = "";
      for (const k of keys) { bdv += badgeSvg(k, bxv, cy); bxv += badgeWidth(k) + BDG_GAP; }
      const nx = left + bwRaw + (bwRaw ? BDG_PAD : 0);
      inMap += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="9.5" fill="${prov ? "#f0eee9" : "#ffffff"}" stroke="${lc}" stroke-width="5"${prov ? ' stroke-dasharray="3.2 2.4"' : ""}/>`;
      outMap += bdv +
        `<text x="${nx.toFixed(1)}" y="${cy.toFixed(1)}" font-size="${LBL_FS}" font-weight="800" fill="#141821" letter-spacing="-0.6" dominant-baseline="middle" text-anchor="start"${HALO}>${esc(p.name)}</text>` +
        (pw ? provSvg(nx + nameW + PROV_GAP, cy, "start") : "");
      p.ly = cy; p.rowLeft = left; p.rowWidth = rowWidth;
      continue;
    }

    /* ── 지시선을 뺄 수 있는가 (오너 2026-09-09: "굳이 직선으로 연결하지 않아도 되는
       역명들은 그냥 적당히 가까이 붙여도 될것같아")
       지시선은 **라벨이 제 마커에서 세로로 밀렸을 때** 어느 점인지 알려주는 장치다.
       안 밀린 라벨(ly ≈ y)에서는 36px 짜리 수평선이 정보를 하나도 더하지 않으면서
       라벨을 노선 쪽에서 36px 밀어내 — 그 36px 이 다른 라벨·노선과 부딪히는 원인이 된다.
       그래서 **안 밀린 라벨은 마커 바로 옆(NEAR_LEAD)에 붙이고 선을 그리지 않는다.** */
    const NEAR_LEAD = 15;                       // 마커 반지름 12 를 막 벗어나는 값
    /* ⚠️ 붙이기 전에 **그 자리가 비었는지** 본다. 이웃 역이 대각선으로 40px 옆에 있으면
       마커에 바짝 붙인 뱃지가 그 이웃 마커를 문다(GTX-B 인천시청, designQa svglabel 20%).
       걸리면 36px 로 물리고 지시선을 그린다 — 그게 지시선이 있는 이유다. */
    const nearBox = (() => {
      const w = rowW(p.st) + NEAR_LEAD + 6;
      return p.side > 0
        ? { x0: p.x + 12, x1: p.x + w, y0: p.ly - 16, y1: p.ly + 16 }
        : { x0: p.x - w, x1: p.x - 12, y0: p.ly - 16, y1: p.ly + 16 };
    })();
    const nearBlocked = !WIDE && corrAll.some((q) =>
      Math.hypot(q.x - p.x, q.y - p.y) > 22 &&                 // 제 마커 언저리는 뺀다
      q.x > nearBox.x0 && q.x < nearBox.x1 && q.y > nearBox.y0 && q.y < nearBox.y1);
    const nudged = Math.abs(p.ly - p.y) >= 1.5 || nearBlocked;
    const lead = nudged ? LEAD_W : NEAR_LEAD;
    let bx, nameX, anchor, endX, provX;
    if (p.side > 0) {
      endX = p.x + lead;
      bx = endX + 9;
      nameX = bx + bw;
      anchor = "start";
      provX = nameX + nameW + PROV_GAP;          // 이름 뒤
    } else {
      endX = p.x - lead;
      provX = endX - 9;                          // 오른쪽 끝(지시선 쪽)에 「가칭」
      nameX = endX - 9 - pw;                     // text-anchor=end 라 이 x 가 이름의 오른쪽 끝
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
    let leadSvg = "";
    if (!nudged) {
      /* 안 밀렸다 — 선을 그리지 않는다(위 NEAR_LEAD 주석). */
    } else {
      const diag = Math.min(Math.abs(dy), run - STUB - 4);
      const leadOut = run - STUB - diag;          // 점에서 곧게 빠져나오는 길이
      if (leadOut >= 10) {
        /* 자리가 넉넉하다 — 곧게 빠져나와 45°로 꺾고 라벨 앞 10px 은 수평으로 (오너가 고른 모양) */
        const k1 = sxH + p.side * leadOut, k2 = endX - p.side * STUB;
        leadSvg = `<path d="M${sxH.toFixed(1)},${p.y.toFixed(1)}H${k1.toFixed(1)}L${k2.toFixed(1)},${p.ly.toFixed(1)}H${endX.toFixed(1)}"`;
      } else {
        /* 자리가 없다 — 한 줄로 곧장 잇는다.
           ⚠️ 이때 출발점을 **가로 테두리(sxH)** 에 두면 안 된다. 「중앙」은 그렇게 나가다
              바로 위 「성포」의 역 표시를 뚫고 지나가 성포에서 뻗은 선처럼 보였다(2026-09-09).
              **가는 방향의 테두리**에서 출발시키면 이웃 역을 비껴간다. */
        const vx = endX - p.x, vy = p.ly - p.y, vL = Math.hypot(vx, vy) || 1;
        const sx = p.x + (vx / vL) * 13, sy = p.y + (vy / vL) * 13;
        leadSvg = `<path d="M${sx.toFixed(1)},${sy.toFixed(1)}L${endX.toFixed(1)},${p.ly.toFixed(1)}"`;
      }
    }
    if (leadSvg) leadSvg += ` stroke="#9aa1ac" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

    let bd = "";
    if (keys.length) {
      let bxx = bx;
      for (const k of keys) { bd += badgeSvg(k, bxx, p.ly); bxx += badgeWidth(k) + BDG_GAP; }
    }

    inMap += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="9.5" fill="${prov ? "#f0eee9" : "#ffffff"}" stroke="${lc}" stroke-width="5"${prov ? ' stroke-dasharray="3.2 2.4"' : ""}/>`;
    outMap += leadSvg + bd +
      `<text x="${nameX.toFixed(1)}" y="${p.ly.toFixed(1)}" font-size="${LBL_FS}" font-weight="800" fill="#141821" letter-spacing="-0.6" dominant-baseline="middle" text-anchor="${anchor}"${HALO}>${esc(p.name)}</text>` +
      (pw ? provSvg(provX, p.ly, p.side > 0 ? "start" : "end") : "");
  }
  /* 가칭 역은 **점 모양**으로 구분한다 — 이름 옆 글자 대신. 범례는 아래 한 줄. */

  /* 역 이름·뱃지가 차지한 상자들 — 지명은 여기도 피한다. */
  const lblBoxes = lbl.map((p) => {
    if (WIDE) {
      const hw = rowWv(p.st) / 2 + 8;
      const far = p.y + p.side * (leadVOf(p.st) + (ONE_ROW ? Math.max(BDG_H, LBL_FS)
        : ((p.st.xfer || []).length ? BDG_H + BDG_VGAP : 0) + LBL_FS) + 6);
      return { x0: Math.min(p.lx, p.x) - hw, x1: Math.max(p.lx, p.x) + hw,
               y0: Math.min(p.y, far) - 6, y1: Math.max(p.y, far) + 6 };
    }
    /* 위/아래로 붙인 라벨은 좌우로 안 뻗는다 — 실제 쓴 폭(rowWidth)으로 잰다.
       LEAD_W 를 더한 상자로 재면 있지도 않은 자리를 막아 지명이 통째로 사라진다. */
    if (p.vert) {
      const left = p.rowLeft ?? (p.x - rowW(p.st) / 2), wv = p.rowWidth ?? rowW(p.st);
      return { x0: left - 8, x1: left + wv + 8, y0: Math.min(p.y, p.ly) - 19, y1: Math.max(p.y, p.ly) + 19 };
    }
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
     halo 때문에 눈으로는 넘어갔다 — 눈이 아니라 좌표가 판정한다.

     ── 후보를 여러 개 본다 (오너 2026-09-09: "누락된 행정구역명들 잘 피해서 표기해줘")
     앞 판은 **중심 한 곳만** 보고, 거기가 막히면 그 구 이름을 통째로 포기했다. 그래서
     영등포·동작·금천·광명·시흥·안산처럼 **노선이 지나가는 구가 오히려 이름을 잃었다** —
     정작 독자가 찾는 곳들이다.
     이제 중심에서 시작해 사방으로 후보를 넓혀 가며 **처음 비는 자리**에 적는다.
     ⚠️ 후보는 반드시 **그 시군구 폴리곤 안**이어야 한다. 그 조건이 없으면 밀려난 이름이
        옆 구 위에 앉아 「엉뚱한 구에 이름이 붙는」 옛 문제로 돌아간다. */
  const trackPx = [...mainWay.g, ...branchPts, ...thruPts].map((p) => ({ x: X(p.lon), y: Y(p.lat) }));
  const dotPx = lbl.map((p) => ({ x: p.x, y: p.y }));
  const far = (x, y, pts, min) => pts.every((q) => Math.hypot(q.x - x, q.y - y) > min);
  /* 화면 좌표 → 경위도 (배율이 정해진 뒤라 역산할 수 있다) */
  const invLon = (x) => lon0 + (x - offX) / (kx * s);
  const invLat = (y) => lat0 + (BH - y - offY) / s;

  const placedNm = [];                       // 이미 적은 지명 상자 — 지명끼리도 안 겹치게
  let sggNm = "";
  for (const f of sgg.features) {
    const c = ringCentroid(f.geometry);
    if (!c) continue;
    const cx = X(c[0]), cy = Y(c[1]);
    /* 「안산시상록구」처럼 붙여 쓴 이름은 읽기 어렵다 — 시와 구를 띄우고, 시로 끝나면 시를 뗀다. */
    const nm = f.properties.name.replace(/^(.+?)시(.+?구)$/, "$1 $2").replace(/시$/, "");
    const nw = [...nm].length * 15 + 8;

    /* 후보: 중심 → 반경을 넓혀 가며 8방향. 가까운 자리부터 본다. */
    const cand = [{ x: cx, y: cy }];
    for (const r of [34, 58, 84, 112, 145])
      for (let k = 0; k < 8; k++) {
        const th = (k * Math.PI) / 4;
        cand.push({ x: cx + Math.cos(th) * r * 1.35, y: cy + Math.sin(th) * r });
      }

    const ok = cand.find(({ x, y }) => {
      if (x - nw / 2 < SAFE_L || x + nw / 2 > SAFE_R || y < 26 || y > BH - 26) return false;
      if (!far(x, y, trackPx, 30) || !far(x, y, dotPx, 46)) return false;
      if (hitsLabel(x, y, nw + 10, 24)) return false;
      /* 지명은 **정보 패널 자리도 피한다.** 패널이 반투명이라 밑에 깔린 지명이 비쳐 보인다
         (2026-09-09 시안 d — 우하단 정보 뒤로 「수원 장안구」가 비쳤다). */
      if (PANELS.some((P) => x + nw / 2 > P.x0 - 6 && x - nw / 2 < P.x1 + 6 && y + 12 > P.y0 - 6 && y - 12 < P.y1 + 6)) return false;
      if (placedNm.some((b2) => x + nw / 2 > b2.x0 - 8 && x - nw / 2 < b2.x1 + 8 && y + 12 > b2.y0 && y - 12 < b2.y1)) return false;
      /* ⭐ 그 구 안인가 — 이 한 줄이 「밀어내면 엉뚱한 구에 붙는다」를 막는다. */
      return pointInGeom([invLon(x), invLat(y)], f.geometry);
    });
    if (!ok) continue;

    placedNm.push({ x0: ok.x - nw / 2, x1: ok.x + nw / 2, y0: ok.y - 12, y1: ok.y + 12 });
    sggNm += `<text x="${ok.x.toFixed(1)}" y="${ok.y.toFixed(1)}" font-size="15" font-weight="700" fill="#aeb3bb" text-anchor="middle" letter-spacing="0.4">${esc(nm)}</text>`;
  }

  /* ── 지도 안 워터마크.
     ⚠️ 자리를 **고정하지 않는다.** 노선마다 비는 구석이 다르다 — 신안산선은 왼쪽 아래가 비지만
        가로로 누운 노선(GTX-B)은 거기가 꽉 찬다. 역 이름·정보 패널·노선·지명을 다 피해
        **처음 비는 구석**에 놓는다. 아무 데도 없으면 **안 그린다** — 워터마크가 정보를 덮으면
        그건 워터마크가 아니라 사고다. */
  let wmSvg = "";
  if (WM === "tile") {
    /* 대각 반복 — 자리를 찾을 필요가 없다. 대신 아주 흐려야 한다(지도가 주인공이다). */
    let t = "";
    for (let row = -1; row * 150 < BH + 300; row++)
      for (let col = -1; col * 320 < MAP_W + 320; col++)
        t += `<text x="${(col * 320 + (row % 2 ? 160 : 0)).toFixed(0)}" y="${(row * 150).toFixed(0)}" font-size="34" font-weight="900" fill="#141821" opacity="0.055" letter-spacing="-0.5">@wirit_note</text>`;
    wmSvg = `<g transform="rotate(-26 ${(MAP_W / 2).toFixed(0)} ${(BH / 2).toFixed(0)})">${t}</g>`;
  } else if (WM !== "none") {
    const WMW = WM === "soft" ? 210 : 196, WMH = WM === "soft" ? 34 : 40;
    /* 구석 다섯 곳을 먼저 보고, 다 막혔으면 **판 전체를 훑는다.**
       ⚠️ 구석만 보다가 신안산선에서 두 번째 자리를 못 찾았다(왼쪽 위=패널, 오른쪽 위=여의도,
          왼쪽 아래=국제테마파크, 오른쪽 아래=정보 상자). 이 노선은 서해·의왕 쪽이 훤히 비는데
          후보 목록에 그런 자리가 없었던 것뿐이다. 격자는 **가장자리부터** 본다 —
          워터마크는 한가운데보다 변두리가 맞다. */
    const spots = [
      { x: 18 + WMW / 2, y: BH - 18 - WMH / 2 },              // 왼쪽 아래
      { x: MAP_W - 18 - WMW / 2, y: 18 + WMH / 2 },               // 오른쪽 위
      { x: 18 + WMW / 2, y: 18 + WMH / 2 },                       // 왼쪽 위
      { x: MAP_W - 18 - WMW / 2, y: BH - 18 - WMH / 2 },      // 오른쪽 아래
      { x: MAP_W / 2, y: BH - 18 - WMH / 2 },                 // 아래 가운데
    ];
    {
      const gx0 = 18 + WMW / 2, gx1 = MAP_W - 18 - WMW / 2;
      const gy0 = 18 + WMH / 2, gy1 = BH - 18 - WMH / 2;
      const grid = [];
      for (let gx = gx0; gx <= gx1; gx += 44)
        for (let gy = gy0; gy <= gy1; gy += 38) grid.push({ x: gx, y: gy });
      const cxm = MAP_W / 2, cym = BH / 2;
      grid.sort((a2, b2) => Math.hypot(b2.x - cxm, b2.y - cym) - Math.hypot(a2.x - cxm, a2.y - cym));
      spots.push(...grid);
    }
    const clear = (c) => {
      const b2 = { x0: c.x - WMW / 2, x1: c.x + WMW / 2, y0: c.y - WMH / 2, y1: c.y + WMH / 2 };
      const hit = (o) => b2.x1 > o.x0 - 10 && b2.x0 < o.x1 + 10 && b2.y1 > o.y0 - 8 && b2.y0 < o.y1 + 8;
      if (PANELS.some(hit) || lblBoxes.some(hit) || placedNm.some(hit)) return false;
      return [...trackPx, ...dotPx].every((q) =>
        !(q.x > b2.x0 - 12 && q.x < b2.x1 + 12 && q.y > b2.y0 - 12 && q.y < b2.y1 + 12));
    };
    /* soft 는 **두 곳**에 넣는다(오너 2026-09-09). 흐린 글자는 한 곳만 두면 잘려 나갔을 때
       같이 사라진다. 대신 둘이 몰려 있으면 안 되므로 **300px 넘게 떨어진 자리**만 짝으로 쓴다.
       빈 구석이 하나뿐이면 하나만 넣는다 — 억지로 두 번째를 밀어 넣지 않는다. */
    const want = WM === "soft" ? 2 : 1;
    const chosen = [];
    for (const c of spots) {
      if (chosen.length >= want) break;
      if (!clear(c)) continue;
      if (chosen.some((q) => Math.hypot(q.x - c.x, q.y - c.y) < 300)) continue;
      chosen.push(c);
    }
    for (const at of chosen) {
      if (WM === "soft") {
        wmSvg += `<text x="${at.x.toFixed(1)}" y="${at.y.toFixed(1)}" font-size="30" font-weight="900" fill="#141821" opacity="0.15" letter-spacing="-0.6" text-anchor="middle" dominant-baseline="middle">@wirit_note</text>`;
      } else if (WM === "badge") {
        wmSvg += `<rect x="${(at.x - WMW / 2).toFixed(1)}" y="${(at.y - WMH / 2).toFixed(1)}" width="${WMW}" height="${WMH}" rx="${(WMH / 2).toFixed(1)}" fill="#141821" opacity="0.92"/>` +
          `<text x="${at.x.toFixed(1)}" y="${at.y.toFixed(1)}" font-size="20" font-weight="800" fill="#ffffff" letter-spacing="-0.3" text-anchor="middle" dominant-baseline="central">@wirit_note<tspan fill="#2E6BFF">.</tspan></text>`;
      } else {
        wmSvg += `<rect x="${(at.x - WMW / 2).toFixed(1)}" y="${(at.y - WMH / 2).toFixed(1)}" width="${WMW}" height="${WMH}" rx="${(WMH / 2).toFixed(1)}" fill="#fbfaf7" opacity="0.9" stroke="#141821" stroke-width="1.6"/>` +
          `<text x="${at.x.toFixed(1)}" y="${at.y.toFixed(1)}" font-size="20" font-weight="800" fill="#141821" letter-spacing="-0.3" text-anchor="middle" dominant-baseline="central">@wirit_note<tspan fill="#2E6BFF">.</tspan></text>`;
      }
    }
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
  let mapSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${BH}" width="${MAP_W}" height="${BH}">` +
    `<defs><clipPath id="${clipId}"><rect x="${clipL.toFixed(1)}" y="0" width="${(clipR - clipL).toFixed(1)}" height="${BH}" rx="13"/></clipPath></defs>` +
    `<g clip-path="url(#${clipId})">${land}${sidoLine}${river}${ctx}${sggNm}${line}${inMap}</g>${outMap}${wmSvg}` +
    /* 테두리는 **맨 위에, 클립 밖에서** 긋는다 — 클립 안에서 그으면 자기 자신이 반쯤 잘린다. */
    `<rect x="1.5" y="1.5" width="${(MAP_W - 3).toFixed(1)}" height="${(BH - 3).toFixed(1)}" rx="13" fill="none" stroke="#141821" stroke-width="3"/></svg>`;

  /* ── 강조색 전수(auditHead)에 대한 표시.
     ⚠️ 앞 판은 템플릿의 **.rgm-map 한 상자**에 wirit-linecolor 를 붙였다. 그게 편했지만
        auditHead 가 정확히 그걸 잡아냈다 — 「wirit-linecolor 가 큰 덩어리를 통째로 면제하고
        있습니다: DIV.rgm-map 안 187개」. 상자 하나로 187개를 면제하면, 언젠가 그 안에서
        규격 밖 빨강이 나도 조용히 지나간다. 이 공장이 세 번 겪은 「조용한 초록불」이다.
     → 표시를 **색을 입은 요소 하나하나**에 붙인다. 잎에 붙으면 면제 덩어리가 0개가 된다.
        클래스에 스타일이 없으므로 픽셀은 안 바뀐다(확인함). */
  mapSvg = mapSvg.replace(/<(path|circle|rect|text)\b/g, '<$1 class="wirit-linecolor"');

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
    template: "rail-geomap@1", date, lc, variant: VARIANT, splitInfo: SPLIT_INFO && !WIDE,
    panelSide: panelDiag, wideCls: WIDE ? "is-wide" : "",
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
      /* 역명이 대부분 미확정인 노선은 **그 사실을 각주가 말한다.** 점선 링만으로는
         「이 이름이 확정인 줄 알았다」를 막지 못한다(인동선 17역 중 확정은 셋뿐이다). */
      provCount ? [PROV_TAG ? "◌ 점선·「가칭」 = 역명 미확정" : "◌ 점선 = 역명 미확정(가칭)", L.nameNote].filter(Boolean).join(" · ") : "",
      /* ⚠️ 「지선·공용 구간은 잇는 선이 개략」 한 줄은 오너 지시로 뺐다(2026-09-09).
         고지가 사라진 게 아니다 — 캡션의 「※ 노선 선형은 실제 좌표(OpenStreetMap),
         역 위치는 개략 표기입니다.」가 그대로 지고 있고, 그 줄은 가드 ⑤ 가 지킨다.
         여기 다시 넣지 말 것. */
      /* 각주는 **한 줄**이 목표다 — 두 줄로 넘어가면 마지막 줄에 두 글자만 남아 지저분해진다.
         긴 설명(L.shared)은 캡션이 지고, 카드에는 줄인 판(sharedShort)을 쓴다. */
      L.sharedShort || L.shared || "",
      /* 공용 구간에 남의 노선 역을 그렸으면 **그게 남의 역이라고 적는다.** 안 적으면 독자가
         정거장 수를 세다가 카드의 「11개역」과 안 맞아 어느 쪽이 틀렸는지 알 수 없다. */
      sharedPos.length ? (() => { const nm = sharedPos.map((x) => x.name).join("·");
          return `${nm}${josa(nm, "은", "는")} ${L.sharedOn.label.replace(/ 구간$/, "")} 역`; })() : "",
    ].filter(Boolean).join("  ·  "),
    layout: { titleFs, titleGap: 16, barGap: 18, bodyGap: 16, bodyH: BH, mapW: MAP_W },
    source: { name: L.src },
  };

  return { card, placed, anchors, trackLen, mainWay };
}

const outDir = publish ? join(ROOT, `data/content/${date}`) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });

let made = 0;
const skipped = [];   /* 못 그린 노선 — 끝에서 한 번 더 크게 말한다 */
for (const L of rail.lines) {
  if (ONLY && L.key !== ONLY) continue;
  if (!probe.결과?.some((x) => x.key === L.key && x.좌표?.length)) {
    console.log(`⏭ ${L.name} — OSM 선형이 아직 없다 (rail-geo.yml 을 그 노선으로 돌리세요)`);
    continue;
  }
  /* ⚠️ **한 노선이 못 그려진다고 나머지를 못 만들면 안 된다.**
     GTX-C 는 기존선 공용 구간이 아직 안 이어져 「놓은 자리 vs 실좌표」 가드에 걸린다.
     전체 빌드에서 그게 예외로 튀면 인동선·월판선·대장홍대선까지 같이 안 나온다.
     그래서 **--only 로 그 노선을 콕 집었을 때만 던지고**, 전체 빌드에서는 **크게 적고 건너뛴다.**
     조용히 넘어가는 것이 아니다 — ⛔ 와 이유가 그대로 찍히고, 그 카드는 만들어지지 않는다. */
  let built;
  try {
    built = buildOne(L);
  } catch (e) {
    if (ONLY) throw e;
    console.log(`⛔ ${L.name} — 카드를 만들지 않았습니다: ${String(e.message).split("\n")[0]}`);
    skipped.push(L.name);
    continue;
  }
  const { card, placed, anchors, trackLen } = built;
  writeFileSync(join(outDir, `railmap-${L.key}.json`), JSON.stringify(card, null, 2) + "\n");

  /* ⑤ 개략 고지는 **캡션이 유일한 자리**다(오너 2026-09-09 선택). 그래서 코드가 넣는다. */
  const 개략고지 = "※ 노선 선형은 실제 좌표(OpenStreetMap), 역 위치는 개략 표기입니다.";
  const cap = [
    /* 첫 줄은 **멈춰 세우는 줄**이다 — 서술형이면 그냥 넘긴다(docs/CAPTION.md · caption-lint). */
    `🗺️ ${L.name}, 지도 위에 그리면 우리 동네를 지날까?`, "",
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
if (skipped.length) console.log(`\n⛔ 못 만든 노선 ${skipped.length}개 — ${skipped.join(", ")}`);
if (!made) throw new Error("만든 카드가 0장이다 — 조용히 넘어가지 않는다");
console.log(`\n✅ rail-geomap ${made}장 → ${publish ? `data/content/${date}/` : "data/out/_spike/"}`);
