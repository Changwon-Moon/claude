#!/usr/bin/env node
/**
 * 시군구 경계 GeoJSON 만들기 — 행정동 경계를 합쳐 시군구 한 장으로.
 *
 *   node scripts/build-sgg-geo.mjs --in <행정동.geojson> [--out data/geo/korea-sgg-2026.geojson]
 *
 * ── 왜 이걸 만드나 (2026-08-03)
 * 기존 `data/geo/korea-municipalities.geojson` 은 **통계청 2013년판**이다. 실측해 보니
 *   · 청원군(2014 청주 통합으로 소멸)이 아직 살아 있고
 *   · 인천 미추홀구가 아직 '남구'이고
 *   · 화성 4구 분구(2026-02)가 없다
 * 전국 인구 히트맵은 시군구를 **전수로** 칠하는 카드라 이 어긋남이 그대로 화면에 보인다.
 * (기존 부동산 카드는 서울·경기 일부만 써서 안 드러났을 뿐이다.)
 *
 * ── 원본
 * vuski/admdongkor 의 행정동 경계(2026-04-01 기준). 이 파일 하나가 **두 코드 체계를 다 준다**:
 *   adm_cd(8자리, 통계청 행정구역코드) 앞 5자리 → KOSIS·기존 지도와 붙는다
 *   sgg(5자리, 법정동코드)              → 국토부 실거래와 붙는다
 * 그래서 인구(KOSIS)와 실거래(국토부)를 같은 지도 위에 얹을 수 있다. 이 대조표를 함께 뱉는다.
 *
 * ── 어떻게 합치나 — 좌표를 새로 만들지 않는다
 * 폴리곤 합집합(union)을 계산하지 않는다. 대신 **맞닿은 변을 지운다**:
 * 같은 시군구 안의 두 행정동이 맞닿아 있으면 그 경계선은 한쪽에서 a→b, 다른 쪽에서 b→a 로
 * 정확히 한 번씩 나타난다(원본이 같은 파일이라 좌표가 글자 그대로 같다). 쌍이 되는 변을 지우면
 * 남는 것이 바깥 테두리다. 이러면 **원본에 없던 좌표가 단 하나도 생기지 않는다** — 부동소수점
 * 합집합 연산이 만드는 미세한 틈·자기교차가 원천적으로 없다.
 *
 * 남은 변이 닫힌 고리로 이어지지 않으면 **던진다.** 깨진 도형을 조용히 내보내면 카드에
 * 구멍이 뚫린 채 발행된다.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

function arg(name, dflt) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : dflt;
}

const IN = resolve(arg("in", ""));
const OUT = resolve(arg("out", "data/geo/korea-sgg-2026.geojson"));
const OUT_CODES = resolve(arg("codes", "data/geo/sgg-codes.json"));
/* 단순화 허용오차(도 단위). 0.0004° ≈ 40m — 1080px 카드에서 전국을 그리면 1px 이 약 400m 라
   40m 는 눈에 보이지 않는다. 값을 바꾸면 픽셀이 바뀌므로 **여기가 곧 픽셀 기준값**이다. */
const TOLERANCE = Number(arg("tolerance", "0.0004"));

if (!IN || IN === process.cwd()) {
  console.error("❌ --in <행정동 geojson 경로> 가 필요합니다.");
  console.error("   원본: https://raw.githubusercontent.com/vuski/admdongkor/master/ver20260401/HangJeongDong_ver20260401.geojson");
  process.exit(1);
}

/* ── 좌표를 문자열 열쇠로 ──
   맞닿은 변을 찾으려면 좌표가 글자 그대로 같아야 한다. 원본이 한 파일이라 같지만,
   지수표기(1e-7)와 소수표기가 섞이면 다른 열쇠가 되므로 자릿수를 고정해 정규화한다. */
const K = (p) => `${p[0].toFixed(7)},${p[1].toFixed(7)}`;

/** 폴리곤 좌표 배열(고리들)을 모두 꺼낸다 — Polygon 과 MultiPolygon 을 한 갈래로. */
function ringsOf(geom) {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates;
  if (geom.type === "MultiPolygon") return geom.coordinates.flat();
  throw new Error(`처리할 수 없는 geometry 종류: ${geom.type}`);
}

/**
 * 맞닿은 변을 지우고 남은 변들을 닫힌 고리로 이어 붙인다.
 * 반환: 고리 배열(각 고리는 [[x,y],…] 이고 첫 점 = 끝 점)
 */
function dissolve(rings, label) {
  /* ① 모든 변을 방향 있는 채로 센다. 같은 변이 반대 방향으로 한 번 더 나오면 내부선이다. */
  const edges = new Map(); // "a|b" -> {a, b, n}
  for (const ring of rings) {
    for (let i = 0; i + 1 < ring.length; i++) {
      const a = K(ring[i]);
      const b = K(ring[i + 1]);
      if (a === b) continue; // 길이 0 변은 버린다
      const fwd = `${a}|${b}`;
      const rev = `${b}|${a}`;
      if (edges.has(rev)) {
        /* 반대 방향 변이 이미 있다 = 두 행정동이 맞닿은 경계선 → 둘 다 지운다 */
        const e = edges.get(rev);
        if (--e.n === 0) edges.delete(rev);
      } else {
        const e = edges.get(fwd);
        if (e) e.n++;
        else edges.set(fwd, { a, b, n: 1, pa: ring[i], pb: ring[i + 1] });
      }
    }
  }

  /* ② 남은 변을 시작점 기준으로 모아 고리를 따라간다. */
  const byStart = new Map();
  for (const e of edges.values()) {
    for (let i = 0; i < e.n; i++) {
      if (!byStart.has(e.a)) byStart.set(e.a, []);
      byStart.get(e.a).push(e);
    }
  }

  const out = [];
  /* 결정성: 시작점을 정렬해 같은 입력이면 항상 같은 순서로 고리가 나온다. */
  const starts = [...byStart.keys()].sort();
  for (const s of starts) {
    while ((byStart.get(s) ?? []).length) {
      const ring = [];
      let cur = s;
      let guard = 0;
      for (;;) {
        const bucket = byStart.get(cur);
        if (!bucket || !bucket.length) {
          throw new Error(
            `${label}: 테두리가 닫히지 않는다 — ${cur} 에서 이어지는 변이 없다. ` +
            `원본 행정동 경계에 틈이 있거나 좌표 정밀도가 어긋났다.`,
          );
        }
        const e = bucket.shift();
        if (!bucket.length) byStart.delete(cur);
        ring.push(e.pa);
        cur = e.b;
        if (cur === s) break;
        if (++guard > 2_000_000) throw new Error(`${label}: 고리 추적이 끝나지 않는다`);
      }
      ring.push(ring[0]); // 닫는다
      if (ring.length >= 4) out.push(ring);
    }
  }
  if (!out.length) throw new Error(`${label}: 남은 테두리가 없다`);
  return out;
}

/* ── 단순화 (Douglas–Peucker) ──
   고리마다 따로 돌린다. 시군구를 합친 **뒤에** 하므로 이웃과 틈이 벌어지지 않는다
   (합치기 전에 단순화하면 맞닿은 변이 서로 다르게 줄어 실밥 같은 틈이 생긴다). */
function simplify(ring, tol) {
  if (ring.length <= 4) return ring;
  const pts = ring.slice(0, -1); // 닫는 점 제외하고 계산
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;

  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    if (j <= i + 1) continue;
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[j];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const den = Math.hypot(dx, dy);
    let best = -1;
    let bestD = tol;
    for (let k = i + 1; k < j; k++) {
      const [x, y] = pts[k];
      const d = den === 0
        ? Math.hypot(x - x1, y - y1)
        : Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / den;
      if (d > bestD) { bestD = d; best = k; }
    }
    if (best > 0) {
      keep[best] = 1;
      stack.push([i, best], [best, j]);
    }
  }
  const out = [];
  for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
  /* 너무 줄어 삼각형도 안 되면 원본을 둔다 — 섬 하나가 통째로 사라지는 것보다 낫다. */
  if (out.length < 3) return ring;
  out.push(out[0]);
  return out;
}

/** 고리의 부호 있는 면적 — 바깥 고리와 구멍을 가른다. */
function area(ring) {
  let s = 0;
  for (let i = 0; i + 1 < ring.length; i++) {
    s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return s / 2;
}

/** 점이 고리 안에 있나 (구멍을 바깥 고리에 배정할 때 쓴다) */
function inside(pt, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 2; i < ring.length - 1; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// ─────────────────────────────────────────────────────────────

console.log(`📖 읽는 중: ${IN}`);
const src = JSON.parse(readFileSync(IN, "utf8"));
const feats = src.features ?? [];
if (!feats.length) throw new Error("원본에 features 가 없다");

/* 필수 필드 확인 — 이름이 바뀌면 **던진다.**
   빈 결과로 넘어가면 "시군구가 없는 나라"가 되어 조용히 이상한 지도가 나온다. */
const p0 = feats[0].properties ?? {};
for (const need of ["adm_cd", "sgg", "sidonm", "sggnm"]) {
  if (!(need in p0)) {
    throw new Error(
      `원본 properties 에 '${need}' 가 없다(있는 것: ${Object.keys(p0).join(", ")}). ` +
      `admdongkor 판본이 바뀌었을 수 있다 — 필드 이름을 다시 맞춰야 한다.`,
    );
  }
}

const groups = new Map();
for (const f of feats) {
  const p = f.properties;
  const stat = String(p.adm_cd).slice(0, 5); // 통계청 행정구역코드 시군구 5자리
  if (!groups.has(stat)) {
    groups.set(stat, {
      stat,
      lawd: String(p.sgg), // 법정동코드 시군구 5자리(국토부 실거래 파라미터)
      sido: p.sidonm,
      name: p.sggnm,
      dongs: 0,
      rings: [],
    });
  }
  const g = groups.get(stat);
  g.dongs++;
  g.rings.push(...ringsOf(f.geometry));
}

console.log(`   행정동 ${feats.length}개 → 시군구 ${groups.size}개`);

const outFeats = [];
const codes = [];
let ringsBefore = 0;
let ringsAfter = 0;
let ptsBefore = 0;
let ptsAfter = 0;

/* 결정성: 코드순으로 처리한다. */
for (const stat of [...groups.keys()].sort()) {
  const g = groups.get(stat);
  const label = `${g.sido} ${g.name}(${stat})`;
  ringsBefore += g.rings.length;
  g.rings.forEach((r) => (ptsBefore += r.length));

  const merged = dissolve(g.rings, label);
  const simplified = merged.map((r) => simplify(r, TOLERANCE));
  ringsAfter += simplified.length;
  simplified.forEach((r) => (ptsAfter += r.length));

  /* ── 바깥 고리와 구멍 가르기 ──
     ⚠️ 고리의 **회전 방향으로 판정하지 않는다.** 원본(admdongkor)의 바깥 고리는 시계방향이라
     부호로 가르면 전부 구멍이 된다(2026-08-03 에 실제로 여기서 한 번 막혔다).
     대신 **포함 깊이**로 가른다: 자기를 감싸는 고리가 짝수 개면 바깥, 홀수 개면 구멍이다.
     이 판정은 회전 방향과 무관하므로 원본 규약이 바뀌어도 견딘다. */
  const depth = simplified.map((r, i) =>
    simplified.reduce((d, other, j) => (i !== j && inside(r[0], other) ? d + 1 : d), 0),
  );
  const big = (r) => Math.abs(area(r));
  const outers = simplified.filter((_, i) => depth[i] % 2 === 0).sort((a, b) => big(b) - big(a));
  const holes = simplified.filter((_, i) => depth[i] % 2 === 1);
  if (!outers.length) throw new Error(`${label}: 바깥 고리가 없다`);

  /* GeoJSON 규약대로 방향을 맞춘다 — 바깥은 반시계(양수), 구멍은 시계(음수).
     렌더러가 규약을 따르는 경우 방향이 틀리면 구멍이 안 뚫린다. */
  const ccw = (r) => (area(r) > 0 ? r : [...r].reverse());
  const cw = (r) => (area(r) < 0 ? r : [...r].reverse());

  const polys = outers.map((o) => [ccw(o)]);
  for (const h of holes) {
    /* 구멍은 자기를 감싸는 **가장 작은** 바깥 고리에 붙인다 — 큰 것부터 보면 잘못 붙는다.
       outers 는 큰 것부터 정렬돼 있으니 뒤에서부터 찾는다. */
    let idx = -1;
    for (let i = polys.length - 1; i >= 0; i--) {
      if (inside(h[0], polys[i][0])) { idx = i; break; }
    }
    if (idx >= 0) polys[idx].push(cw(h));
    // 어디에도 안 들어가는 구멍은 버린다 — 붙일 곳이 없으면 그건 구멍이 아니다
  }

  outFeats.push({
    type: "Feature",
    properties: {
      code: stat,          // 통계청 행정구역코드 — 기존 지도·KOSIS 와 같은 열쇠
      lawd: g.lawd,        // 법정동코드 — 국토부 실거래와 같은 열쇠
      name: g.name,
      sido: g.sido,
      base_year: "2026",
    },
    geometry: polys.length === 1
      ? { type: "Polygon", coordinates: polys[0] }
      : { type: "MultiPolygon", coordinates: polys },
  });

  codes.push({ code: stat, lawd: g.lawd, sido: g.sido, name: g.name, dongs: g.dongs });
}

/* ── 자체 검산 — 조용히 틀리느니 시끄럽게 멈춘다 ── */
const dupStat = codes.map((c) => c.code).filter((c, i, a) => a.indexOf(c) !== i);
if (dupStat.length) throw new Error(`통계청 코드가 겹친다: ${dupStat.join(", ")}`);
const dupLawd = codes.map((c) => c.lawd).filter((c, i, a) => a.indexOf(c) !== i);
if (dupLawd.length) throw new Error(`법정동 코드가 겹친다: ${dupLawd.join(", ")}`);

const doc = {
  type: "FeatureCollection",
  _: [
    "행정동 경계를 시군구로 합친 것 — 좌표는 원본 그대로이고 새로 만든 점이 없다.",
    "code = 통계청 행정구역코드(KOSIS·기존 지도와 조인), lawd = 법정동코드(국토부 실거래와 조인).",
    `원본: vuski/admdongkor ver20260401 · 단순화 허용오차 ${TOLERANCE}°`,
  ],
  features: outFeats,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(doc), "utf8");
mkdirSync(dirname(OUT_CODES), { recursive: true });
writeFileSync(
  OUT_CODES,
  JSON.stringify(
    {
      _: [
        "시군구 코드 대조표 — 통계청 행정구역코드 ↔ 법정동코드 ↔ 이름.",
        "인구(KOSIS)와 실거래(국토부)를 같은 지도에 얹으려면 이 표를 거친다.",
        "원본: vuski/admdongkor ver20260401 (행정동 경계에서 코드를 그대로 읽었다)",
      ],
      baseDate: "2026-04-01",
      count: codes.length,
      sgg: codes,
    },
    null,
    1,
  ) + "\n",
  "utf8",
);

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
console.log(`\n✅ 시군구 ${outFeats.length}개`);
console.log(`   테두리 ${ringsBefore} → ${ringsAfter}개 · 좌표 ${ptsBefore.toLocaleString()} → ${ptsAfter.toLocaleString()}점`);
console.log(`   ${OUT} (${kb(JSON.stringify(doc).length)})`);
console.log(`   ${OUT_CODES}`);
