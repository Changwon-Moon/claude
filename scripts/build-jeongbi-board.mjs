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

// ── 번호 매기기: 표 순서(수주액 내림차순) → 회사별 사업지 → 미확정은 맨 뒤 ──
const order = [...doc.items].sort((a, b) => b.amount - a.amount);
const numbered = [];
for (const co of order) {
  for (const s of sites.filter((x) => x.builder === co.name)) {
    numbered.push({ ...s, no: numbered.length + 1, color: COLOR[co.name] || GRAY });
  }
}
for (const s of sites.filter((x) => !x.builder)) {
  numbered.push({ ...s, no: numbered.length + 1, color: GRAY });
}
if (numbered.length !== sites.length) throw new Error(`번호 누락: ${numbered.length}/${sites.length}`);

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

const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const W = 1000, scale = W / ((maxLon - minLon) * kx), H = Math.round((maxLat - minLat) * scale);
const px = (lo) => (lo - minLon) * kx * scale;
const py = (la) => (maxLat - la) * scale;

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

/* 구 이름 — 마커 무리 **위**로 올린다.
 * 고정 오프셋(34px)으로는 강남 6곳·서초 4곳처럼 무리가 큰 구에서 여전히 가렸다.
 * 무리 반지름에 비례해 올려야 개수가 달라져도 안 가린다. */
const clusterR = {};
for (const s of numbered) clusterR[s.gu] = (clusterR[s.gu] || 0) + 1;
let guLabels = "";
for (const [g, [cx, cy]] of Object.entries(cen)) {
  if (cx < -20 || cx > W + 20 || cy < -20 || cy > H + 20) continue; // 잘려 나간 구는 건너뛴다
  // 마커가 있는 구는 이름을 위로 올린다 — 무게중심에 두면 번호에 가려 못 읽는다
  const cn = clusterR[g] || 0;
  const up = cn ? (cn === 1 ? 26 : 15 + cn * 4.5 + 20) : 0;
  guLabels += `<text class="gu${up ? " on" : ""}" x="${cx.toFixed(0)}" y="${(cy - up).toFixed(0)}">${g.replace(/구$/, "")}</text>`;
}

/* ── 번호 표식 배치 ──
 * 같은 구의 여러 곳은 무게중심 주위에 결정적으로 흩뿌린다(임시 좌표 — 진짜 좌표는
 * 카카오 로컬 지오코딩이 필요하고 수집기가 아직 없다). 표식은 원+숫자뿐이라
 * 라벨 시험 때처럼 겹쳐 뭉개지지 않는다 — 그게 번호 방식의 이점이다. */
const byGu = {};
for (const s of numbered) (byGu[s.gu] ||= []).push(s);
let marks = "";
for (const [gu, arr] of Object.entries(byGu)) {
  const [cx, cy] = cen[gu] || [W / 2, H / 2];
  const R = arr.length === 1 ? 0 : 15 + arr.length * 4.5;
  arr.forEach((s, i) => {
    const th = -Math.PI / 2 + (i * 2 * Math.PI) / arr.length;
    const x = cx + R * Math.cos(th), y = cy + R * Math.sin(th);
    marks +=
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="${s.color}" stroke="#fff" stroke-width="2.5"/>` +
      `<text class="no" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${s.no}</text>`;
  });
}

const mapSvg =
  `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">` +
  `<style>.gu{font-family:'Pretendard',sans-serif;font-size:21px;font-weight:700;fill:#98A0AB;text-anchor:middle}` +
  `.gu.on{fill:#5A6473;font-weight:800}` +
  `.no{font-family:'Pretendard',sans-serif;font-size:16px;font-weight:800;fill:#fff;text-anchor:middle;dominant-baseline:central}</style>` +
  `${paths}${guLabels}${marks}</svg>`;

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
console.log(`   지도 크롭: 사업지 있는 ${guWithSites.size}개 구 기준 · 북부 잘림`);
console.log(`   → data/out/_spike/jeongbi-board.json`);
