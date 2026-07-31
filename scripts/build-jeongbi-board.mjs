/**
 * 🧪 시안 — 상 제목 / 중 지도(번호 점) / 하 시공사 카드 8장. map-board@1.
 *
 * ⚠️ 오너 확정 전 **시안**이다. sets.json·builders.json 에 등록하지 않는다.
 *
 * ── 오너 지시 (2026-07-31, 최신)
 *   ① 지도 위 표식은 **번호가 든 원**. 색은 브랜드(=시공사) 색
 *   ② 지도에서 꺾은선과 단지명을 없앤다 — 번호만 남는다
 *   ③ 단지명은 하단 카드 안에 번호와 함께 나열한다
 *   ④ 단지명 글씨색은 그 단지의 브랜드 색
 *   ⑤ 카드 색은 그 회사의 **일반 브랜드** 로고 메인 컬러로 통일
 *   ⑥ 하이엔드 브랜드가 있으면 카드 안에 일반/하이엔드 로고를 위아래로 둘 다
 *   ⑦ 카드를 키운다
 *
 * ── 왜 지도에서 이름을 걷어내는가
 * 24곳에 라벨을 붙이면 강남·서초에서 라벨끼리 밀려 꺾은선이 길어지고, 결국 선이
 * 지도를 가로지른다. 번호만 남기면 지도는 **위치만** 말하고 이름은 카드가 말한다 —
 * 원본 뉴시스 인포그래픽이 아니라, 정보를 두 층으로 나누는 편집이다.
 *
 * ── 번호는 왜 직접 그리나
 * 유니코드 원문자(①)는 번들 폰트에 ⑳까지만 있다(Wanted Sans 는 ⑨). 사업지가 24곳이라
 * 21번부터 글자가 깨진다. 그래서 원을 그리고 그 안에 숫자를 넣는다 — 개수 제한이 없다.
 *
 * 실행: node scripts/build-jeongbi-board.mjs [date=2026-07-31]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPalette } from "./lib/brand-palette.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/jeongbi-order-2026-07.json"), "utf8"));
const sites = doc.seoulSites.items;

const { byName: BRAND, companyColor } = loadPalette();
const GRAY = "#B4BAC2";
const ABBR = {
  현대건설: "현대", GS건설: "GS", 삼성물산: "삼성", 대우건설: "대우", 롯데건설: "롯데",
  포스코이앤씨: "포스코", DL이앤씨: "DL", HDC현대산업개발: "HDC", SK에코플랜트: "SK",
};

/* HDC현대산업개발만 뺀다 — 서울 사업지가 없어(성남태평3구역) 지도에 점이 하나도 안 찍힌다. */
const EXCLUDE = new Set(["HDC현대산업개발"]);
const order = [...doc.items].filter((c) => !EXCLUDE.has(c.name)).sort((a, b) => b.amount - a.amount);

/* ── 단지명 → 브랜드 ──
 * 긴 이름이 앞이어야 'e편한세상'이 '편한'에 걸려 엉뚱하게 잡히지 않는다. */
const BRAND_WORDS = [
  ["e편한세상", "e편한세상"], ["힐스테이트", "힐스테이트"], ["롯데캐슬", "롯데캐슬"],
  ["오티에르", "오티에르"], ["디에이치", "디에이치"], ["푸르지오", "푸르지오"],
  ["드파인", "드파인"], ["래미안", "래미안"], ["아크로", "아크로"], ["더샵", "더샵"],
  ["써밋", "써밋"], ["SK뷰", "SK뷰"], ["자이", "자이"], ["르엘", "르엘"],
];

/* 번호는 카드 순서(수주액 내림차순 → 회사 안에서 데이터 순)를 따른다.
 * 그래야 한 카드의 번호가 ①②③ 처럼 연속으로 붙어 눈이 지도와 카드를 왔다갔다 하기 쉽다. */
const numbered = [];
for (const co of order) {
  for (const s of sites.filter((x) => x.builder === co.name)) {
    const key = s.brandOverride || s.brand || "";
    const hit = BRAND_WORDS.find(([w]) => key.includes(w));
    const brandName = hit ? hit[1] : null;
    numbered.push({
      ...s,
      no: numbered.length + 1,
      brandName,
      /* 단지명 색 = 그 단지의 브랜드 색. 브랜드를 못 고른 곳(단지명 미정)은 시공사 색을 쓴다 —
       * 하이엔드가 일반 브랜드 색을 물려받은 뒤로는 어차피 회사당 색이 하나라 어긋나지 않는다. */
      color: (brandName && BRAND.get(brandName)?.hex) || companyColor[co.name] || GRAY,
      brandKnown: !!brandName,
    });
  }
}
const unmatched = sites.filter((x) => !x.builder);
const dropped = sites.filter((x) => x.builder && EXCLUDE.has(x.builder));
if (numbered.length + dropped.length + unmatched.length !== sites.length)
  throw new Error(`집계 불일치: ${numbered.length}+${dropped.length}+${unmatched.length}/${sites.length}`);

const fileOf = (slug) => {
  for (const ext of ["svg", "png"]) {
    if (existsSync(join(ROOT, `templates/_shared/logos/${slug}.${ext}`))) return `${slug}.${ext}`;
  }
  return null;
};
/* 카드에 올릴 브랜드 로고 — 위(일반) / 아래(하이엔드). 하이엔드가 없는 회사는 한 장만. */
const CARD_LOGOS = {
  현대건설: ["hillstate", "theh"],
  GS건설: ["xi"],
  삼성물산: ["raemian-symbol"],
  대우건설: ["prugio", "summit"],
  롯데건설: ["lottecastle", "leel"],
  포스코이앤씨: ["thesharp", "hauterre"],
  DL이앤씨: ["epyeonhansesang", "acro"],
  SK에코플랜트: ["skview", "define"],
};

// ── 서울 경계 ──
const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
const guWithSites = new Set(sites.map((s) => s.gu));

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

const MAPW = 1000, GUT = 24;
const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const scale = MAPW / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale);
const W = MAPW + GUT * 2;
const px = (lo) => GUT + (lo - minLon) * kx * scale;
const py = (la) => (maxLat - la) * scale;

/* ── 한강 ── 이북·이남 구가 공유하는 경계 정점을 이으면 선이 구 경계 위에 정확히 놓인다. */
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
if (riverCore.length < 8) throw new Error(`한강 경계 정점 부족(${riverCore.length})`);
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

/* ── 좌표 ── data 의 lon/lat(카카오 지오코딩). 없으면 구 무게중심 주위 임시 자리. */
const byGu = {};
for (const s of numbered) (byGu[s.gu] ||= []).push(s);
let realCoords = 0;
const noCoord = [];
for (const [gu, arr] of Object.entries(byGu)) {
  const [cx, cy] = cen[gu] || [W / 2, H / 2];
  const R = arr.length === 1 ? 0 : 15 + arr.length * 4.5;
  arr.forEach((s, i) => {
    if (Number.isFinite(s.lon) && Number.isFinite(s.lat)) { s.x = px(s.lon); s.y = py(s.lat); realCoords++; }
    else {
      const th = -Math.PI / 2 + (i * 2 * Math.PI) / arr.length;
      s.x = cx + R * Math.cos(th); s.y = cy + R * Math.sin(th); noCoord.push(s.name);
    }
  });
}

/* ── 번호 원이 서로를 덮지 않게 ──
 * 라벨이 사라져 지도가 훨씬 한산해졌으므로 원을 키울 수 있다(R=19).
 * 원이 커진 만큼 최소 간격도 키운다 — 안 그러면 강남에서 숫자가 겹쳐 못 읽는다.
 * 미는 방향은 인덱스 순서로만 정한다(랜덤 금지 — 같은 입력이면 같은 그림). */
const MR = 16, MIND = MR * 2 + 3;
const drawn = [];
for (const s of numbered) { s.x0 = s.x; s.y0 = s.y; }   // 밀기 전 자리 — 얼마나 밀렸는지 재려고 남긴다
for (const s of [...numbered].sort((a, b) => a.y - b.y || a.x - b.x)) {
  let guard = 0;
  while (guard++ < 80) {
    const hit = drawn.find((q) => Math.hypot(q.x - s.x, q.y - s.y) < MIND);
    if (!hit) break;
    const dx = s.x - hit.x, dy = s.y - hit.y;
    const d = Math.hypot(dx, dy) || 0.001;
    s.x += (dx / d) * (MIND - d + 1);
    s.y += (dy / d) * (MIND - d + 1);
  }
  drawn.push(s);
}

let marks = "";
for (const s of numbered) {
  marks +=
    `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${MR}" fill="${s.color}" stroke="#fff" stroke-width="3"/>` +
    `<text class="mn" x="${s.x.toFixed(1)}" y="${s.y.toFixed(1)}">${s.no}</text>`;
}

/* ── viewBox 를 내용에 맞춰 자른다 ──
 * 구 도형으로 잡으면 사업지 없는 구로·금천·관악이 지도 아래를 차지해 빈 띠가 생긴다.
 * 손으로 자르면 마커가 잘린다. 그래서 **마커를 모두 감싸는 최소 사각형**에 여백만 더한다. */
/* 여백을 넉넉히 둔다. 마커에 딱 붙여 자르면 카드가 꽉 차긴 하는데
 * **서울 모양이 안 보인다** — 어느 동네인지 못 읽는 지도는 점 그림일 뿐이다. */
const CROP = 58;
let cx0 = Infinity, cy0 = Infinity, cx1 = -Infinity, cy1 = -Infinity;
for (const s of numbered) {
  cx0 = Math.min(cx0, s.x - MR); cy0 = Math.min(cy0, s.y - MR);
  cx1 = Math.max(cx1, s.x + MR); cy1 = Math.max(cy1, s.y + MR);
}
cx0 = Math.max(0, cx0 - CROP); cy0 = Math.max(0, cy0 - CROP);
cx1 = Math.min(W, cx1 + CROP); cy1 = Math.min(H, cy1 + CROP);
const VW = Math.round(cx1 - cx0), VH = Math.round(cy1 - cy0);

/* ── 워터마크 2개 ──
 * '적정한 곳'을 손으로 찍지 않는다. 마커 상자를 피해 **비어 있는 자리**를 찾고,
 * 그중 가장자리에 가까운 두 곳을 고른다. 자리가 없으면 안 그린다 — 겹쳐 놓느니 없는 편이 낫다. */
const WM_W = 200, WM_H = 36;
const hitBox = (a, b) => !(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0);
const markBoxes = numbered.map((s) => ({ x0: s.x - MR - 4, x1: s.x + MR + 4, y0: s.y - MR - 4, y1: s.y + MR + 4 }));
const cands = [];
for (const fx of [0.01, 0.1, 0.42, 0.7, 0.88]) {
  for (const fy of [0.02, 0.15, 0.5, 0.83, 0.97]) {
    const x0 = cx0 + fx * (VW - WM_W), y0 = cy0 + fy * (VH - WM_H);
    cands.push({ x0, x1: x0 + WM_W, y0, y1: y0 + WM_H, edge: Math.min(fx, 1 - fx) + Math.min(fy, 1 - fy) });
  }
}
const wmPicked = [];
for (const b of cands.filter((b) => !markBoxes.some((q) => hitBox(b, q))).sort((a, b) => a.edge - b.edge)) {
  if (wmPicked.length >= 2) break;
  if (wmPicked.some((p) => Math.hypot(p.x0 - b.x0, p.y0 - b.y0) < 340)) continue;  // 붙어 있으면 한 덩어리로 보인다
  wmPicked.push(b);
}
const watermarks = wmPicked
  .map((b) => `<text class="wm" x="${(b.x0 + WM_W / 2).toFixed(0)}" y="${(b.y0 + WM_H / 2).toFixed(0)}">@wirit_note<tspan class="wmd">.</tspan></text>`)
  .join("");

const mapSvg =
  `<svg viewBox="${cx0.toFixed(0)} ${cy0.toFixed(0)} ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.river{fill:none;stroke:#8fbfe0;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}` +
  `.mn{font-family:'Pretendard',sans-serif;font-size:22px;font-weight:800;fill:#fff;text-anchor:middle;dominant-baseline:central}` +
  `.wm{font-family:'Pretendard',sans-serif;font-size:28px;font-weight:800;fill:#26303d;opacity:.16;text-anchor:middle;dominant-baseline:central}` +
  `.wmd{fill:#F04E3E}</style>` +
  `${paths}<path class="river" d="${riverD}"/>${watermarks}${marks}</svg>`;

// ── 하단 시공사 카드 ──
function won(억) {
  const jo = Math.floor(억 / 10000), rest = 억 % 10000;
  return jo ? `${jo}조${rest.toLocaleString("ko-KR")}` : `${rest.toLocaleString("ko-KR")}`;
}
const SHORT = { HDC현대산업개발: "HDC현산", SK에코플랜트: "SK에코" };
const rows = order.map((co) => {
  const mine = numbered.filter((s) => s.builder === co.name);
  return {
    name: SHORT[co.name] || co.name,
    value: won(co.amount),
    unit: "억",
    color: companyColor[co.name] || GRAY,
    abbr: ABBR[co.name] || co.name.slice(0, 2),
    logos: (CARD_LOGOS[co.name] || []).map(fileOf).filter(Boolean),
    /* 단지명 색은 그 단지의 브랜드 색이다. 회사 색과 같아 보여도 계산 경로가 다르다 —
     * 나중에 하이엔드에 따로 색을 주기로 하면 여기만 갈라진다. */
    sites: mine.map((s) => ({ no: s.no, name: s.name, color: s.color })),
  };
});

const approx = numbered.filter((s) => /근사/.test(s.geo?.method || "")).map((s) => s.name);
const noBrand = numbered.filter((s) => !s.brandKnown).map((s) => s.name);

const card = {
  template: "map-board@1",
  date,
  title: "올해 서울 정비사업, 누가 어디를",
  subtitle: `주요 건설사 서울 수주 ${numbered.length}곳 · ${doc.seoulSites.asOf.replace(/-/g, ".").slice(2)} 기준`,
  mapSvg,
  rows,
  footnote:
    `번호는 아래 카드의 사업지와 이어집니다. 색은 그 단지의 아파트 브랜드 색입니다.\n` +
    `수주액은 서울 외 사업지를 포함한 전국 누적입니다.` +
    (approx.length ? `\n${approx.join("·")}는 구역 중심이 아니라 동 중심으로 찍은 근사 위치입니다.` : ""),
  source: { name: "각 사 · 뉴시스 정리", asOf: doc.seoulSites.asOf },
};

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "jeongbi-board.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`🧪 시안 board — 사업지 ${numbered.length}곳 · 카드 ${rows.length}장`);
console.log(`   카드 로고: ${rows.map((r) => `${r.name} ${r.logos.length}장`).join(" · ")}`);
console.log(`   브랜드 확정: ${numbered.length - noBrand.length}/${numbered.length}` + (noBrand.length ? ` — 미정(시공사 색): ${noBrand.join(", ")}` : ""));
console.log(`   좌표: 실제 ${realCoords} / ${numbered.length}` + (noCoord.length ? ` — 임시: ${noCoord.join(", ")}` : ""));
const moved = numbered.map((s) => Math.hypot(s.x - s.x0, s.y - s.y0));
const worst = numbered[moved.indexOf(Math.max(...moved))];
console.log(`   마커 겹침 벌리기: 평균 ${(moved.reduce((a, b) => a + b, 0) / moved.length).toFixed(0)}px · 최대 ${Math.max(...moved).toFixed(0)}px (${worst.name})`);
console.log(`   지도 자르기: ${W}×${H} → ${VW}×${VH} (비율 ${(VW / VH).toFixed(2)}) · 워터마크 ${wmPicked.length}/2`);
console.log(`   → data/out/_spike/jeongbi-board.json`);
