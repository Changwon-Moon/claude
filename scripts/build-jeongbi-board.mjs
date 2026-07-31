/**
 * 🧪 시안 — 상 제목 / 중 지도 / 하 시공사 카드. map-board@1.
 *
 * ⚠️ 오너 확정 전 **시안**이다. sets.json·builders.json 에 등록하지 않는다.
 *
 * ── 오너 지시 (2026-07-31, 최신)
 *   ① 지도 위 표식은 점, 라벨은 「브랜드 로고 + 사업지명」, 짧은 꺾은선
 *   ② 로고는 **인포그래픽의 단지명**에서 정한다 (시공사가 아니라 브랜드)
 *   ③ 신반포20차(단지명 미정)는 드파인
 *   ④ 하단 시공사 카드는 8장 2행 — SK에코플랜트 포함
 *   ⑤ 마커·카드 색은 시공사 브랜드 컬러로 통일
 *   ⑥ 지도를 내리고 지도·카드가 카드 면을 꽉 채우게
 *   ⑦ 워터마크를 지도 여백에 2개
 *
 * ── 왜 '단지명 → 브랜드 로고'인가
 * 앞선 시안은 라벨에 **시공사** 로고를 붙였다. 그런데 독자가 지도에서 알고 싶은 것은
 * "여기 뭐가 들어서나"이지 "누가 짓나"가 아니다(누가 짓나는 색과 하단 카드가 답한다).
 * 단지명이 '래미안일루체'면 래미안 로고가 붙는 게 맞다.
 * 단지명이 미정이라 브랜드를 못 고르는 곳은 **시공사 로고로 물러서고, 그 사실을 센다.**
 * 짐작으로 하이엔드 로고를 붙이지 않는다 — 그 순간 지도가 없는 사실을 말한다.
 *
 * 실행: node scripts/build-jeongbi-board.mjs [date=2026-07-31]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/jeongbi-order-2026-07.json"), "utf8"));
const sites = doc.seoulSites.items;

/* 색은 데이터셋에서 읽는다 — 코드에 흩어 두면 마커와 카드가 어긋난다(같은 회사, 두 색). */
const PAL = JSON.parse(readFileSync(join(ROOT, "data/datasets/builder-colors.json"), "utf8"));
const COLOR = Object.fromEntries(Object.entries(PAL.colors).map(([k, v]) => [k, v.hex]));
const GRAY = PAL.unknown.hex;
const ABBR = {
  현대건설: "현대", GS건설: "GS", 삼성물산: "삼성", 대우건설: "대우", 롯데건설: "롯데",
  포스코이앤씨: "포스코", DL이앤씨: "DL", HDC현대산업개발: "HDC", SK에코플랜트: "SK",
};

/* HDC현대산업개발만 뺀다. 서울 사업지가 없어(성남태평3구역) 지도에 점이 하나도 안 찍히는데
 * 카드만 놓이면 "이 회사는 어디에?"라는 답 없는 질문이 남는다.
 * SK에코플랜트는 오너 지시로 되살렸다 — 신반포20차(드파인)가 지도에 있다. */
const EXCLUDE = new Set(["HDC현대산업개발"]);

const order = [...doc.items].filter((c) => !EXCLUDE.has(c.name)).sort((a, b) => b.amount - a.amount);
const numbered = [];
for (const co of order) {
  for (const s of sites.filter((x) => x.builder === co.name)) {
    numbered.push({ ...s, no: numbered.length + 1, color: COLOR[co.name] || GRAY });
  }
}
const unmatched = sites.filter((x) => !x.builder);
const dropped = sites.filter((x) => x.builder && EXCLUDE.has(x.builder));
if (numbered.length + dropped.length + unmatched.length !== sites.length)
  throw new Error(`집계 불일치: ${numbered.length}+${dropped.length}+${unmatched.length}/${sites.length}`);

/* ── 단지명 → 브랜드 로고 ──
 * 단지명 안에 브랜드 이름이 들어 있으면 그 로고를 쓴다. 목록 순서가 곧 우선순위다:
 * 긴 이름을 앞에 둬야 'e편한세상'이 '편한'에 걸려 엉뚱하게 잡히지 않는다. */
const BRAND_LOGO = [
  ["e편한세상", "epyeonhansesang"],
  ["힐스테이트", "hillstate"],
  ["롯데캐슬", "lottecastle"],
  ["오티에르", "hauterre"],
  ["디에이치", "theh"],
  ["푸르지오", "prugio"],
  ["드파인", "define"],
  ["래미안", "raemian-symbol"],
  ["아크로", "acro"],
  ["더샵", "thesharp"],
  ["써밋", "summit"],
  ["SK뷰", "skview"],
  ["자이", "xi"],
  ["르엘", "leel"],
];
/* ── 시공사 **회사** 로고 ──
 * 여기에는 브랜드 로고를 넣지 않는다. 지도 라벨에서 브랜드를 못 고른 곳(단지명 미정)의
 * 대타로 쓰이는데, 대타로 브랜드 로고가 들어가면 **없는 사실을 말한다**:
 * '압구정 현대'(단지명 미정)에 힐스테이트 로고가 붙는 식이다. 첫 렌더에서 실제로 그랬다.
 * 회사 로고가 없으면 로고를 안 붙인다 — 색 점이 시공사를 이미 말하고 있다. */
const COMPANY_SLUG = {
  현대건설: ["hdec"],
  GS건설: ["gs", "gsconst"],
  삼성물산: ["samsungcnt"],
  대우건설: ["daewooenc"],
  롯데건설: ["lottecon"],
  포스코이앤씨: ["poscoenc"],
  DL이앤씨: ["dl", "dlenc"],
  SK에코플랜트: ["skecoplant", "sk-eco"],
};
/* 하단 카드는 사정이 다르다. 카드는 '이 회사가 얼마를 수주했나'를 말하는 자리라
 * 회사를 알아볼 수만 있으면 된다. 회사 로고가 없으면 그 회사의 대표 브랜드 로고를 쓴다 —
 * 빈 색칩보다 롯데캐슬·SK뷰가 훨씬 잘 읽힌다(오너가 그 로고들을 직접 줬다). */
const CARD_FALLBACK = { 롯데건설: "lottecastle", SK에코플랜트: "skview" };
const fileOf = (slug) => {
  for (const ext of ["svg", "png"]) {
    if (existsSync(join(ROOT, `templates/_shared/logos/${slug}.${ext}`))) return `${slug}.${ext}`;
  }
  return null;
};
const companyLogo = (name) => {
  for (const slug of COMPANY_SLUG[name] || []) { const f = fileOf(slug); if (f) return f; }
  return null;
};
const cardLogo = (name) => companyLogo(name) || (CARD_FALLBACK[name] ? fileOf(CARD_FALLBACK[name]) : null);
/* brandOverride: 단지명이 미정이지만 오너가 직접 정해 준 것(신반포20차 → 드파인).
 * 데이터에 남겨야 다음 사람이 "왜 미정인데 로고가 있지?"를 되짚을 수 있다. */
let brandHit = 0, brandFallback = 0;
for (const s of numbered) {
  const key = s.brandOverride || s.brand || "";
  const m = BRAND_LOGO.find(([word]) => key.includes(word));
  if (m) { s.logo = fileOf(m[1]); s.logoKind = "브랜드"; if (s.logo) brandHit++; }
  if (!s.logo) { s.logo = companyLogo(s.builder); s.logoKind = "시공사(단지명 미정)"; if (s.logo) brandFallback++; }
}

// ── 서울 경계 ──
const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
const guWithSites = new Set(sites.map((s) => s.gu));

/* ── 북부 잘라내기 ──
 * bbox 를 **사업지가 있는 구**로만 잡는다. 배경(다른 구)은 그려지다가 viewBox 밖으로
 * 잘린다 — seoul-map.mjs 의 방침 그대로: "잘려도 되는 건 맥락이고, 잘리면 안 되는 건 대상이다". */
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of geo.features) {
  if (!guWithSites.has(f.properties.name)) continue;
  for (const r of rings(f.geometry)) for (const [lo, la] of r) {
    minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
    minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
  }
}
const mx = (maxLon - minLon) * 0.03, my = (maxLat - minLat) * 0.03;
minLon -= mx; maxLon += mx; minLat -= my; maxLat += my;

const MAPW = 1000;
const GUT = 40;             // 라벨이 카드 밖으로 안 나가게 하는 최소 여백
const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const scale = MAPW / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale);
const W = MAPW + GUT * 2;
const px = (lo) => GUT + (lo - minLon) * kx * scale;
const py = (la) => (maxLat - la) * scale;

/* ── 한강 ──
 * 손으로 그리지 않는다. **이북 구와 이남 구가 공유하는 경계 정점**을 경도순으로 이으면
 * 선이 정확히 구 경계 위에 놓인다(scripts/lib/tohuh-map.mjs 가 확립한 방법). */
const NORTH = new Set(["종로구","중구","용산구","성동구","광진구","동대문구","중랑구","성북구","강북구","도봉구","노원구","은평구","서대문구","마포구"]);
const SOUTH = new Set(["양천구","강서구","구로구","금천구","영등포구","동작구","관악구","서초구","강남구","송파구","강동구"]);
const vkey = (q) => `${q[0].toFixed(6)},${q[1].toFixed(6)}`;
const nPts = new Map(), sPts = new Map();
for (const f of geo.features) {
  const bag = NORTH.has(f.properties.name) ? nPts : SOUTH.has(f.properties.name) ? sPts : null;
  if (!bag) continue;
  for (const r of rings(f.geometry)) for (const q of r) bag.set(vkey(q), q);
}
const riverCore = [...nPts.keys()].filter((k) => sPts.has(k)).map((k) => nPts.get(k)).sort((a, b) => a[0] - b[0]);
if (riverCore.length < 8) throw new Error(`한강 경계 정점 부족(${riverCore.length}) — 경계 데이터 확인`);
const riverD = "M" + riverCore.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L");

const cen = {};
let paths = "";
for (const f of geo.features) {
  let d = "", big = null, bl = 0;
  for (const ring of rings(f.geometry)) {
    d += "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z";
    if (ring.length > bl) { bl = ring.length; big = ring; }
  }
  const on = guWithSites.has(f.properties.name);
  paths += `<path d="${d}" fill="${on ? "#E7EAEF" : "#F1F3F6"}" stroke="#fff" stroke-width="2"/>`;
  const pts = big.map(([lo, la]) => [px(lo), py(la)]);
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
  }
  if (Math.abs(A) < 1e-6) { cx = pts.reduce((s, q) => s + q[0], 0) / pts.length; cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; }
  else { A *= 0.5; cx /= 6 * A; cy /= 6 * A; }
  cen[f.properties.name] = [cx, cy];
}

/* ── 마커 좌표 ── 데이터에 lon/lat 이 있으면 실제 위치(카카오 지오코딩). */
const byGu = {};
for (const s of numbered) (byGu[s.gu] ||= []).push(s);
let realCoords = 0;
const noCoord = [];
for (const [gu, arr] of Object.entries(byGu)) {
  const [cx, cy] = cen[gu] || [W / 2, H / 2];
  const R = arr.length === 1 ? 0 : 15 + arr.length * 4.5;
  arr.forEach((s, i) => {
    if (Number.isFinite(s.lon) && Number.isFinite(s.lat)) {
      s.x = px(s.lon); s.y = py(s.lat); realCoords++;
    } else {
      const th = -Math.PI / 2 + (i * 2 * Math.PI) / arr.length;
      s.x = cx + R * Math.cos(th); s.y = cy + R * Math.sin(th);
      noCoord.push(s.name);
    }
  });
}

/* ── 시각적으로 뭉친 마커 벌리기 ── 그리는 자리만 최소 간격까지 민다(결정적). */
const MIND = 22;
const drawn = [];
for (const s of [...numbered].sort((a, b) => a.y - b.y || a.x - b.x)) {
  let guard = 0;
  while (guard++ < 60) {
    const hitOne = drawn.find((q) => Math.hypot(q.x - s.x, q.y - s.y) < MIND);
    if (!hitOne) break;
    const dx = s.x - hitOne.x, dy = s.y - hitOne.y;
    const d = Math.hypot(dx, dy) || 0.001;
    s.x += (dx / d) * (MIND - d + 1);
    s.y += (dy / d) * (MIND - d + 1);
  }
  drawn.push(s);
}

/* ── 라벨: 로고 + 사업지명, 짧은 꺾은선 ──
 * 로고는 이제 **정사각 규격**이다(normalize-logos.mjs 가 모두 320² 로 맞췄다).
 * 가로 워드마크를 가정하던 64×22 상자는 더 이상 맞지 않는다 — 정사각으로 바꾼다.
 * ⚠️ 한글 굵은 글씨의 한 글자 폭은 글자 크기와 거의 같다(26px → 약 26).
 *    상자가 실제 글자보다 작으면 "겹침 0"이라 보고하고도 눈으로는 겹쳐 보인다. */
/* 브랜드 로고는 정사각 규격(normalize-logos.mjs)이라 30×30 이면 충분하다.
 * 회사 로고는 'SAMSUNG C&T' 같은 **가로 워드마크**라 정사각에 넣으면 높이에 맞춰 줄어
 * 글자가 3px 가 된다 — 첫 렌더의 압구정4구역이 그랬다. 종류에 따라 상자를 달리 준다. */
const LOGO = 30, LOGO_WM_W = 66, LOGO_WM_H = 24, LH = 34, CH = 26;
const RINGS = [16, 26, 38, 52, 70, 92, 118, 150];
const DIRS = [[1, 0], [-1, 0], [1, -1], [-1, -1], [1, 1], [-1, 1], [0, -1], [0, 1]];
const boxes = numbered.map((s) => ({ x0: s.x - 13, x1: s.x + 13, y0: s.y - 13, y1: s.y + 13 }));
const hitBox = (a, b) => !(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0);
let leaders = "", siteLabels = "", unplaced = 0;
const unplacedNames = [];
for (const s of [...numbered].sort((a, b) => a.y - b.y)) {
  const wm = s.logoKind !== "브랜드";              // 회사 워드마크인가
  const lw0 = s.logo ? (wm ? LOGO_WM_W : LOGO) : 22;
  const w = lw0 + 7 + s.name.length * CH;
  let put = null;
  outer: for (const R of RINGS) {
    for (const [dx, dy] of DIRS) {
      const dir = dx >= 0 ? 1 : -1;
      const cx = s.x + dx * (R + w / 2);
      const cy = s.y + dy * (dy === 0 ? 0 : R + LH / 2);
      const x0 = cx - w / 2, x1 = cx + w / 2;
      if (x0 < GUT || x1 > W - GUT) continue;
      if (cy - LH / 2 < 6 || cy + LH / 2 > H - 6) continue;
      const b = { x0, x1, y0: cy - LH / 2, y1: cy + LH / 2, cx, cy, dir };
      if (boxes.some((q) => hitBox(b, q))) continue;
      put = b; break outer;
    }
  }
  if (!put) { unplaced++; unplacedNames.push(s.name); continue; }
  boxes.push(put);
  const anchorX = put.dir > 0 ? put.x0 : put.x1;
  leaders +=
    `<path class="ld" stroke="${s.color}" d="M${s.x.toFixed(1)},${s.y.toFixed(1)}` +
    `L${((s.x + anchorX) / 2).toFixed(1)},${s.y.toFixed(1)}` +
    `L${((s.x + anchorX) / 2).toFixed(1)},${put.cy.toFixed(1)}L${anchorX.toFixed(1)},${put.cy.toFixed(1)}"/>`;
  const lx = put.x0;
  const lw = lw0;
  const lh = wm ? LOGO_WM_H : LOGO;
  siteLabels +=
    (s.logo
      ? `<image href="../_shared/logos/${s.logo}" x="${lx}" y="${(put.cy - lh / 2).toFixed(1)}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMid meet"/>`
      : `<circle cx="${lx + 11}" cy="${put.cy.toFixed(1)}" r="10" fill="${s.color}"/>`) +
    `<text class="sl" x="${(lx + lw + 7).toFixed(1)}" y="${(put.cy + 9).toFixed(1)}" fill="#26303d">${s.name}</text>`;
}

let marks = "";
for (const s of numbered) {
  marks += `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="9" fill="${s.color}" stroke="#fff" stroke-width="2.5"/>`;
}

/* ── viewBox 를 **내용에 맞춰 자른다** (2026-07-31 오너 지시 "꽉 차게") ──
 * bbox 를 구 도형으로 잡으면 사업지가 하나도 없는 구로/금천/관악이 지도 아래쪽을
 * 통째로 차지해 카드 면에 빈 띠가 생긴다. 첫 렌더에서 지도 아래가 그렇게 비었다.
 * 그렇다고 지도를 손으로 자르면 마커나 라벨이 잘려 나간다.
 * 그래서 **배치가 끝난 뒤** 마커·라벨·워터마크 상자를 모두 감싸는 최소 사각형을 구해
 * 거기에 여백만 더해 viewBox 로 쓴다 — 잘릴 것이 남아 있을 수 없다. */
const CROP_PAD = 16;
let cx0 = Infinity, cy0 = Infinity, cx1 = -Infinity, cy1 = -Infinity;
for (const b of boxes) {
  cx0 = Math.min(cx0, b.x0); cy0 = Math.min(cy0, b.y0);
  cx1 = Math.max(cx1, b.x1); cy1 = Math.max(cy1, b.y1);
}
cx0 = Math.max(0, cx0 - CROP_PAD); cy0 = Math.max(0, cy0 - CROP_PAD);
cx1 = Math.min(W, cx1 + CROP_PAD); cy1 = Math.min(H, cy1 + CROP_PAD);
const VW = Math.round(cx1 - cx0), VH = Math.round(cy1 - cy0);


/* ── 워터마크 2개 (2026-07-31 오너 지시 "지도 주위 적정한 곳에 여백 신경써서") ──
 * '적정한 곳'을 손으로 찍지 않는다. 라벨·마커 상자가 이미 다 모여 있으므로
 * **비어 있는 자리를 찾아** 놓는다. 후보를 훑어 아무것과도 겹치지 않는 것 중
 * 가장 가장자리에 가까운 두 곳을 고른다 — 가운데에 놓이면 지도를 가린다.
 * 자리가 없으면 안 그린다. 겹쳐 놓느니 없는 편이 낫다. */
const WM_W = 190, WM_H = 34;
const wmCands = [];
/* 후보는 **잘라낸 지도 안**에서만 고른다. 바깥에 놓으면 워터마크가 크롭을 끌어당겨
 * 빈 하늘까지 지도에 딸려 들어온다 — 첫 렌더에서 지도 위아래에 흰 띠가 그래서 남았다. */
for (const fx of [0.02, 0.12, 0.5, 0.72, 0.86]) {
  for (const fy of [0.02, 0.14, 0.5, 0.84, 0.96]) {
    const x0 = cx0 + fx * (VW - WM_W), y0 = cy0 + fy * (VH - WM_H);
    wmCands.push({ x0, x1: x0 + WM_W, y0, y1: y0 + WM_H, edge: Math.min(fx, 1 - fx) + Math.min(fy, 1 - fy) });
  }
}
const wmFree = wmCands
  .filter((b) => !boxes.some((q) => hitBox(b, q)))
  .sort((a, b) => a.edge - b.edge);
const wmPicked = [];
for (const b of wmFree) {
  if (wmPicked.length >= 2) break;
  // 둘이 붙어 있으면 워터마크가 두 개로 안 보이고 한 덩어리로 보인다 — 충분히 떨어뜨린다
  if (wmPicked.some((p) => Math.hypot(p.x0 - b.x0, p.y0 - b.y0) < 320)) continue;
  wmPicked.push(b);
}
const watermarks = wmPicked
  .map((b) => `<text class="wm" x="${(b.x0 + WM_W / 2).toFixed(0)}" y="${(b.y0 + WM_H / 2).toFixed(0)}">@wirit_note<tspan class="wmd">.</tspan></text>`)
  .join("");

const mapSvg =
  `<svg viewBox="${cx0.toFixed(0)} ${cy0.toFixed(0)} ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.river{fill:none;stroke:#8fbfe0;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}` +
  `.sl{font-family:'Pretendard',sans-serif;font-size:26px;font-weight:800}` +
  `.ld{fill:none;stroke-width:2;opacity:.55}` +
  `.wm{font-family:'Pretendard',sans-serif;font-size:27px;font-weight:800;fill:#26303d;opacity:.17;text-anchor:middle;dominant-baseline:central}` +
  `.wmd{fill:#F04E3E}</style>` +
  `${paths}<path class="river" d="${riverD}"/>${watermarks}${leaders}${marks}${siteLabels}</svg>`;

// ── 하단 시공사 카드 ──
function won(억) {
  const jo = Math.floor(억 / 10000), rest = 억 % 10000;
  /* '7조 6,946' 의 공백 한 칸이 카드 폭을 넘겨 숫자 끝자리가 잘렸다.
   칸이 좁을 때 가장 먼저 버릴 것은 공백이다 — 숫자는 못 버린다. */
  return jo ? `${jo}조${rest.toLocaleString("ko-KR")}` : `${rest.toLocaleString("ko-KR")}`;
}
/* 카드 폭(약 259px)에서 로고·여백을 빼면 회사명이 쓸 수 있는 폭은 165px 남짓이다.
 * 'SK에코플랜트'(7자)는 24px 글씨로 168px 라 한 글자가 다음 줄로 넘어가며 카드가 어긋났다.
 * 업계 통용 약칭으로 줄인다 — 글씨만 줄이면 다른 카드와 크기가 달라져 더 눈에 띈다. */
const SHORT = { HDC현대산업개발: "HDC현산", SK에코플랜트: "SK에코" };
const rows = order.map((co) => ({
  name: SHORT[co.name] || co.name,
  value: won(co.amount),
  unit: "억",
  color: COLOR[co.name] || GRAY,
  abbr: ABBR[co.name] || co.name.slice(0, 2),
  ...(cardLogo(co.name) ? { logo: cardLogo(co.name) } : {}),
  nos: numbered.filter((s) => s.builder === co.name).map((s) => String(s.no)),
}));

const card = {
  template: "map-board@1",
  date,
  title: "올해 서울 정비사업, 누가 어디를",
  subtitle: `주요 건설사 서울 수주 ${numbered.length}곳 · ${doc.seoulSites.asOf.replace(/-/g, ".").slice(2)} 기준`,
  mapSvg,
  rows,
  footnote:
    `점 색은 시공사입니다. 로고는 단지명 기준이며, 단지명이 정해지지 않은 곳은 시공사 로고를 넣었습니다.\n` +
    `수주액은 서울 외 사업지를 포함한 전국 누적입니다.`,
  source: { name: "각 사 · 뉴시스 정리", asOf: doc.seoulSites.asOf },
};

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "jeongbi-board.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`🧪 시안 board — 사업지 ${numbered.length}곳 · 카드 ${rows.length}장(2행)`);
console.log(`   라벨 로고: 브랜드 ${brandHit} · 시공사 대타 ${brandFallback} · 없음 ${numbered.filter((s) => !s.logo).length}`);
console.log(`   카드 로고: ${rows.filter((r) => r.logo).length}/${rows.length}` +
  (rows.filter((r) => !r.logo).length ? ` — 없음: ${rows.filter((r) => !r.logo).map((r) => r.name).join(", ")}` : ""));
console.log(`   좌표: 실제 ${realCoords} / ${numbered.length}` + (noCoord.length ? ` — 임시: ${noCoord.join(", ")}` : ""));
console.log(`   라벨 배치 실패: ${unplaced}건${unplacedNames.length ? `(${unplacedNames.join(", ")})` : ""} · 워터마크: ${wmPicked.length}/2`);
console.log(`   지도 자르기: ${W}×${H} → ${VW}×${VH} (세로 ${Math.round((1 - VH / H) * 100)}% 덜어냄)`);
console.log(`   제외: ${[...EXCLUDE].join(", ")} (사업지 ${dropped.length}곳 함께 빠짐)`);
console.log(`   → data/out/_spike/jeongbi-board.json`);
