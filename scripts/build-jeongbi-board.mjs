/**
 * 🧪 시안 — 상 제목 / 중 지도 / 하 표. map-board@1.
 *
 * ⚠️ 오너 확정 전 **시안**이다. sets.json·builders.json 에 등록하지 않는다.
 *
 * ── 오너 지시 (2026-07-31)
 *   ① 사업지를 번호(①②…)로 표기, 폰트는 유지
 *   ② 서울 북부 불필요 지역은 잘라낸다
 *   ③ 지도를 제목 바로 아래로
 *   ④ 인포그래픽 2번의 표를 위릿 형태로 하단에 붙인다
 *   ⑤ 범례는 없앤다 — 표의 번호와 지도 표식의 글꼴을 맞춰 눈이 잇게 한다
 *   ⑥ 회사명 앞에 로고
 *
 * ── 왜 유니코드 원문자(①)를 안 쓰나
 * 번들 폰트를 열어 확인했다: Pretendard 는 ⑳(20)까지만 있고 ㉑㉒㉓㉔ 가 없다.
 * Wanted Sans 는 ⑨(9)까지다. 사업지가 24곳이라 21번부터 글자가 깨진다.
 * 그래서 **원을 그리고 그 안에 숫자를 넣는다** — 겉모습은 원문자 그대로이고
 * 숫자는 Pretendard 로 찍히니 "폰트는 유지"라는 지시도 지켜진다. 개수 제한도 없다.
 *
 * ── 번호 순서
 * 표의 행 순서(수주액 내림차순)를 따라 1번부터 매긴다. 그래야 한 회사의 번호가
 * 표에서 연속으로 붙어 읽힌다. 회사를 못 가린 2곳은 맨 뒤 회색.
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

const COLOR = {
  현대건설: "#12356B", GS건설: "#1E8A4C", 삼성물산: "#4FA8DC", 대우건설: "#E07B21",
  롯데건설: "#D4232E", 포스코이앤씨: "#7A4BB5", DL이앤씨: "#C2367F",
  HDC현대산업개발: "#0F8A8F", SK에코플랜트: "#8A8F98",
};
const ABBR = {
  현대건설: "현대", GS건설: "GS", 삼성물산: "삼성", 대우건설: "대우", 롯데건설: "롯데",
  포스코이앤씨: "포스코", DL이앤씨: "DL", HDC현대산업개발: "HDC", SK에코플랜트: "SK",
};
const GRAY = "#B4BAC2";

/* 오너 지시(2026-07-31): HDC현대산업개발·SK에코플랜트는 뺀다.
 * HDC 는 서울 사업지가 없고(성남태평3구역), SK 는 신반포20차 한 곳뿐이다.
 * 표에서 빼면 그 회사의 사업지도 지도에서 함께 빠져야 한다 — 표에 없는 번호가
 * 지도에만 떠 있으면 독자는 그 점이 무엇인지 알 방법이 없다. */
const EXCLUDE = new Set(["HDC현대산업개발", "SK에코플랜트"]);

// ── 번호 매기기: 표 순서(수주액 내림차순) → 회사별 사업지 → 미확정은 맨 뒤 ──
const order = [...doc.items].filter((c) => !EXCLUDE.has(c.name)).sort((a, b) => b.amount - a.amount);
const numbered = [];
for (const co of order) {
  for (const s of sites.filter((x) => x.builder === co.name)) {
    numbered.push({ ...s, no: numbered.length + 1, color: COLOR[co.name] || GRAY });
  }
}
for (const s of sites.filter((x) => !x.builder)) {
  numbered.push({ ...s, no: numbered.length + 1, color: GRAY });
}
// 제외 회사의 사업지는 지도에서도 빠진다 — 표에 없는 번호를 지도에 남기지 않는다
const dropped = sites.filter((x) => x.builder && EXCLUDE.has(x.builder));
if (numbered.length + dropped.length !== sites.length)
  throw new Error(`번호 누락: ${numbered.length}+${dropped.length}/${sites.length}`);

// ── 서울 경계 ──
const geo = JSON.parse(readFileSync(join(ROOT, "data/geo/seoul-districts.geojson"), "utf8"));
const rings = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
const guWithSites = new Set(sites.map((s) => s.gu));

/* ── 북부 잘라내기 ──
 * bbox 를 **사업지가 있는 구**로만 잡는다. 배경(다른 구)은 그려지다가 viewBox 밖으로
 * 잘린다 — seoul-map.mjs 의 방침 그대로다: "잘려도 되는 건 맥락이고, 잘리면 안 되는 건 대상이다".
 * 구를 아예 안 그리면 서울이 이상한 모양이 되므로 **그리되 자른다.** */
let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
for (const f of geo.features) {
  if (!guWithSites.has(f.properties.name)) continue;
  for (const r of rings(f.geometry)) for (const [lo, la] of r) {
    minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
    minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
  }
}
/* 여백은 최소로. 크게 주면 사업지 없는 북부가 다시 들어와 지도가 세로로 길어지고,
 * 그만큼 표가 밀린다. 대상이 화면을 채우게 두는 게 이 지도의 목적이다. */
const mx = (maxLon - minLon) * 0.03, my = (maxLat - minLat) * 0.03;
minLon -= mx; maxLon += mx; minLat -= my; maxLat += my;

/* ── 여백 앵커 레이아웃 (2026-07-31 오너 지시) ──
 * 라벨을 마커 옆에 두지 않고 **카드 좌우 여백에 세로로 정렬**한다.
 * 마커 y 순서와 슬롯 순서를 같게 두면 지시선이 서로 교차하지 않는다 —
 * 이게 겹침을 '피하는' 게 아니라 '생길 수 없게' 만드는 방법이다.
 * 앞서 마커 주위 8방향을 시도하던 방식은 밀집 구간에서 결국 자리가 모자랐다. */
const MAPW = 1000;          // 지도 자체 폭
const GUT = 330;            // 좌우 여백(라벨 자리)
const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const scale = MAPW / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale);
const W = MAPW + GUT * 2;   // 전체 뷰박스 폭
const px = (lo) => GUT + (lo - minLon) * kx * scale;
const py = (la) => (maxLat - la) * scale;

/* ── 한강 ──
 * 손으로 그리지 않는다. **이북 구와 이남 구가 공유하는 경계 정점**을 경도순으로 이으면
 * 선이 정확히 구 경계 위에 놓인다(scripts/lib/tohuh-map.mjs 가 확립한 방법).
 * 좌표를 베껴 적으면 경계 데이터가 바뀔 때 강만 어긋난 지도가 남는다. */
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

/* 행정구역명은 넣지 않는다(2026-07-31 오너 지시).
 * 구역명 라벨이 붙는 지도에서 구 이름까지 있으면 글자가 두 겹이 된다.
 * 어느 동네인지는 구역명(압구정·성수·목동…)이 이미 말해 준다. */
const guLabels = "";

/* ── 마커 좌표 ──
 * 데이터에 lon/lat 이 있으면 **실제 위치**를 쓴다(카카오 로컬 지오코딩, geocode-sites.mjs).
 * 아직 없으면 구 무게중심 주위에 결정적으로 흩뿌린 임시 좌표로 떨어진다 —
 * 어느 쪽인지 로그에 찍어 둔다. 임시 좌표인 채로 발행하면 위치가 거짓말이 된다. */
const byGu = {};
for (const s of numbered) (byGu[s.gu] ||= []).push(s);
let realCoords = 0;
for (const [gu, arr] of Object.entries(byGu)) {
  const [cx, cy] = cen[gu] || [W / 2, H / 2];
  const R = arr.length === 1 ? 0 : 15 + arr.length * 4.5;
  arr.forEach((s, i) => {
    if (Number.isFinite(s.lon) && Number.isFinite(s.lat)) {
      s.x = px(s.lon); s.y = py(s.lat); realCoords++;
    } else {
      const th = -Math.PI / 2 + (i * 2 * Math.PI) / arr.length;
      s.x = cx + R * Math.cos(th); s.y = cy + R * Math.sin(th);
    }
  });
}

/* ── 마커가 시각적으로 뭉친 것 벌리기 ──
 * 압구정3·4·5구역처럼 수백 미터 안에 몰린 곳은 원(r=17)이 서로를 덮어 숫자를 못 읽는다.
 * 좌표를 버리는 게 아니라 **그리는 자리만** 최소 간격까지 민다. 데이터는 그대로다.
 * 결정적이어야 하므로 y·x 순으로 정렬해 앞에서부터 민다(랜덤 없음). */
const MIND = 40;
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

/* ── 지시선 + 여백 라벨 ──
 * ① 마커 x 로 좌/우를 가른다(왼쪽 절반은 왼쪽 여백으로)
 * ② 각 쪽에서 마커 y 순으로 정렬해 슬롯을 위에서부터 순서대로 준다
 *    → 순서가 같으므로 선이 교차하지 않는다
 * ③ 지시선은 마커 → 가로 → 세로 → 라벨의 꺾은선
 * 슬롯 간격은 라벨 높이보다 넓게 잡아 라벨끼리도 절대 안 닿는다. */
const SLOT = 40;            // 슬롯 간격(라벨 높이 30보다 넓게)
/* 좌우를 지도 중앙선으로 가르면 대상이 한쪽에 몰릴 때 8:15 처럼 치우친다.
 * **마커 x 의 중앙값**으로 가르면 언제나 반씩 나뉜다 — 슬롯이 남는 쪽 없이 고르게 쓰인다. */
const sides = { L: [], R: [] };
const xsSorted = numbered.map((s) => s.x).sort((a, b) => a - b);
const medianX = xsSorted[Math.floor(xsSorted.length / 2)];
for (const s of [...numbered].sort((a, b) => a.x - b.x)) (sides.L.length < Math.ceil(numbered.length / 2) ? sides.L : sides.R).push(s);
void medianX;
// 한쪽에 너무 몰리면 슬롯이 지도 높이를 넘는다 → 넘치는 만큼 반대쪽으로 넘긴다
const cap = Math.floor((H - 20) / SLOT);
for (const [from, to] of [["L", "R"], ["R", "L"]]) {
  while (sides[from].length > cap && sides[to].length < cap) {
    // 반대쪽에 가장 가까운 것부터 넘긴다
    sides[from].sort((a, b) => (from === "L" ? b.x - a.x : a.x - b.x));
    sides[to].push(sides[from].shift());
  }
}

let leaders = "", siteLabels = "", unplaced = 0;
for (const key of ["L", "R"]) {
  const arr = sides[key].sort((a, b) => a.y - b.y);
  if (!arr.length) continue;
  const span = (arr.length - 1) * SLOT;
  let top = Math.max(14, Math.min(...arr.map((s) => s.y)) - span / 2);
  if (top + span > H - 14) top = Math.max(14, H - 14 - span);
  const dir = key === "L" ? -1 : 1;
  const elbowX = key === "L" ? GUT - 46 : GUT + MAPW + 46;
  const labelX = key === "L" ? GUT - 62 : GUT + MAPW + 62;
  arr.forEach((s, i) => {
    const ly = top + i * SLOT;
    leaders +=
      `<path class="ld" stroke="${s.color}" d="M${s.x.toFixed(1)},${s.y.toFixed(1)}` +
      `L${(s.x + dir * 16).toFixed(1)},${s.y.toFixed(1)}` +
      `L${elbowX},${s.y.toFixed(1)}L${elbowX},${ly.toFixed(1)}L${labelX},${ly.toFixed(1)}"/>`;
    siteLabels +=
      `<circle cx="${labelX + dir * 16}" cy="${ly.toFixed(1)}" r="15" fill="${s.color}"/>` +
      `<text class="ln" x="${labelX + dir * 16}" y="${ly.toFixed(1)}">${s.no}</text>` +
      `<text class="sl" x="${(labelX + dir * 36).toFixed(1)}" y="${(ly + 9).toFixed(1)}" ` +
      `fill="#26303d" text-anchor="${key === "L" ? "end" : "start"}">${s.name}</text>`;
  });
}

let marks = "";
for (const s of numbered) {
  marks +=
    `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="17" fill="${s.color}" stroke="#fff" stroke-width="3"/>` +
    `<text class="no" x="${s.x.toFixed(1)}" y="${s.y.toFixed(1)}">${s.no}</text>`;
}

const mapSvg =
  `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.river{fill:none;stroke:#8fbfe0;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}` +
  `.sl{font-family:'Pretendard',sans-serif;font-size:27px;font-weight:800}` +
  `.ln{font-family:'Pretendard',sans-serif;font-size:19px;font-weight:800;fill:#fff;text-anchor:middle;dominant-baseline:central}` +
  `.ld{fill:none;stroke-width:2;opacity:.55}` +
  `.no{font-family:'Pretendard',sans-serif;font-size:20px;font-weight:800;fill:#fff;text-anchor:middle;dominant-baseline:central}</style>` +
  `${paths}<path class="river" d="${riverD}"/>${guLabels}${leaders}${marks}${siteLabels}</svg>`;

// ── 표 ──
function won(억) {
  const jo = Math.floor(억 / 10000), rest = 억 % 10000;
  return jo ? `${jo}조 ${rest.toLocaleString("ko-KR")}` : `${rest.toLocaleString("ko-KR")}`;
}
const logoOf = (name) => {
  // 허브에 실제 파일이 있을 때만 쓴다. 없는 파일을 가리키면 렌더에 빈칸이 남는다.
  for (const ext of ["svg", "png"]) {
    const slug = { 현대건설: "hyundai-ec", GS건설: "gs-en-c", 삼성물산: "samsung-cnt" }[name];
    if (slug && existsSync(join(ROOT, `templates/_shared/logos/${slug}.${ext}`))) return `${slug}.${ext}`;
  }
  return null;
};
const rows = order.map((co) => ({
  name: co.name,
  value: won(co.amount),
  unit: "억",
  color: COLOR[co.name] || GRAY,
  abbr: ABBR[co.name] || co.name.slice(0, 2),
  // null 을 넣으면 스키마가 "string 이어야 한다"고 반려한다 — 없으면 키 자체를 뺀다
  ...(logoOf(co.name) ? { logo: logoOf(co.name) } : {}),
  nos: numbered.filter((s) => s.builder === co.name).map((s) => String(s.no)),
}));

const unknown = numbered.filter((s) => !s.builder);
const card = {
  template: "map-board@1",
  date,
  title: "올해 서울 정비사업, 누가 어디를",
  subtitle: `주요 건설사 서울 수주 ${sites.length}곳 · ${doc.seoulSites.asOf.replace(/-/g, ".").slice(2)} 기준`,
  mapSvg,
  rows,
  footnote:
    `번호는 표의 순서와 같습니다. 수주액은 서울 외 사업지를 포함한 전국 누적입니다.` +
    (unknown.length ? `\n회색 ${unknown.map((s) => s.no).join("·")}번은 시공사가 확정되지 않은 곳입니다.` : ""),
  source: { name: "각 사 · 뉴시스 정리", asOf: doc.seoulSites.asOf },
};

const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "jeongbi-board.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`🧪 시안 board — 사업지 ${numbered.length}곳 · 표 ${rows.length}행`);
console.log(`   로고 확보: ${rows.filter((r) => r.logo).length}/${rows.length} (나머지는 색칩 약칭)`);
console.log(`   좌표: 실제 ${realCoords} · 임시 ${numbered.length - realCoords} / ${numbered.length}`);
console.log(`   여백 라벨: 좌 ${sides.L.length} · 우 ${sides.R.length} (슬롯 여유 ${cap}칸/쪽)`);
console.log(`   제외: ${[...EXCLUDE].join(", ")} (사업지 ${dropped.length}곳 함께 빠짐)`);
console.log(`   → data/out/_spike/jeongbi-board.json`);
