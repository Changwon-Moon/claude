/**
 * 정비사업 구역 → 좌표 (카카오 로컬 API).
 *
 * ── 왜 필요한가 (2026-07-31 오너 지시 "마커 위치 실제 위치로")
 * 지금까지 지도 마커는 구 무게중심 주위에 흩뿌린 **임시 좌표**였다. 위치가 틀렸다.
 * 손으로 찍는 것은 CARD_CHECKLIST §2 가 금지한다. 그러면 남는 길은 지오코딩뿐이다.
 * KAKAO_REST_KEY 가 이 용도로 진작 등록돼 있었다(docs/guides/realestate-data-apis.md §2).
 *
 * ── 정비사업 구역명은 주소가 아니다
 * "압구정3구역"은 행정 주소가 아니라 조합이 쓰는 이름이다. 주소 검색으로 안 나올 수 있다.
 * 그래서 **여러 갈래로 찾고, 어느 갈래로 찾았는지를 함께 적는다**:
 *   ① 구역명 그대로            (가장 정확 — 조합·현장이 그 이름으로 등록돼 있으면)
 *   ② "{구} {구역명}"          (동명이인 방지)
 *   ③ 브랜드(단지)명            (예: "래미안 도곡뮬리스")
 *   ④ 구역명에서 뽑은 동 이름   (예: 압구정3구역 → 압구정동)
 * 어느 갈래도 못 찾으면 좌표를 **비워 둔다**. 지어내지 않는다 —
 * 틀린 좌표는 없는 좌표보다 나쁘다. 지도에서 엉뚱한 동네를 가리키기 때문이다.
 *
 * method 를 데이터에 남기는 이유: ④(동 이름)로 찾은 것은 구역 중심이 아니라 동 중심이다.
 * 다음 사람이 "이 점이 얼마나 정확한가"를 물을 때 답이 파일 안에 있어야 한다.
 *
 * 실행: KAKAO_REST_KEY=... node scripts/geocode-sites.mjs
 * 갱신: data/datasets/jeongbi-order-2026-07.json 의 seoulSites.items[].lon/lat/geo
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* 구 경계 — 검증에 쓴다. 주소 문자열은 표기가 흔들리지만 도형은 흔들리지 않는다. */
const GEO = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../data/geo/seoul-districts.geojson"), "utf8"));
const ringsOf = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
const GU_RINGS = Object.fromEntries(GEO.features.map((f) => [f.properties.name, ringsOf(f.geometry)]));
const KEY = process.env.KAKAO_REST_KEY || process.env.KAKAO_REST_API_KEY || "";
/* 키가 안 들어왔을 때 **왜**인지 알 수 있게 진단을 남긴다.
 * 값은 절대 찍지 않는다 — 이름과 길이만. 로그는 저장소에 커밋되기 때문이다.
 * (2026-07-31: 시크릿이 분명히 등록돼 있는데 "없음"으로 끝나 원인을 못 가렸다) */
if (!KEY) {
  const seen = Object.keys(process.env).filter((k) => /KAKAO|REST_KEY/i.test(k));
  console.log("⏭ 카카오 키가 비어 지오코딩을 건너뜁니다.");
  console.log(`  워크플로가 넘긴 KAKAO* 환경변수: ${seen.length ? seen.map((k) => `${k}(${(process.env[k] || "").length}자)`).join(", ") : "없음"}`);
  console.log("  → 0자로 보이면 시크릿 이름이 다르거나 값이 비어 있습니다.");
  console.log("     `node scripts/check-secrets.mjs` 로 이름을 대조하세요.");
  process.exit(0);
}
console.log(`🔑 카카오 키 확인 (${KEY.length}자)`);

const FILE = join(ROOT, "data/datasets/jeongbi-order-2026-07.json");
const doc = JSON.parse(readFileSync(FILE, "utf8"));
const sites = doc.seoulSites.items;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 주소 검색 — 키워드 검색보다 정밀하다. 오너가 확인해 준 주소는 이쪽으로 간다.
 * 키워드 검색은 '서초진흥'을 '한국전파진흥협회'로 집는 식의 사고가 나지만,
 * 주소는 그런 흔들림이 없다. */
async function searchAddr(query) {
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}&size=5`;
  const r = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
  if (!r.ok) throw new Error(`카카오(주소) ${r.status} — ${(await r.text()).slice(0, 120)}`);
  return (await r.json()).documents || [];
}

async function search(query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
  const r = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
  if (!r.ok) throw new Error(`카카오 ${r.status} — ${(await r.text()).slice(0, 120)}`);
  const j = await r.json();
  return j.documents || [];
}

/* ── 결과 검증: 기대한 **구 안에 있는 것만** 받는다 ──
 * 2026-07-31 사고: "서울이면 통과"라는 폴백을 뒀더니 동대문구의 신이문역세권이
 * **마포**래미안푸르지오로 잡혔다. 브랜드명("푸르지오 아파트라")으로 검색하다
 * 다른 구의 같은 브랜드 단지를 집은 것이다. 지도가 통째로 거짓말이 된다.
 * 폴백을 없애고, 주소 문자열만 믿지 않고 **좌표가 그 구 도형 안에 있는지 실측**한다.
 * 못 찾으면 비워 둔다 — 틀린 좌표는 없는 좌표보다 나쁘다. */
function pointInRings(lon, lat, ringList) {
  let inside = false;
  for (const ring of ringList) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}
function pick(docs, gu, guRings) {
  for (const d of docs) {
    const addr = `${d.address_name || ""} ${d.road_address_name || ""}`;
    if (!addr.includes(gu)) continue;                       // ① 주소에 구 이름
    const lon = Number(d.x), lat = Number(d.y);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (guRings && !pointInRings(lon, lat, guRings)) continue; // ② 좌표가 실제로 그 구 안
    return d;
  }
  return null; // 폴백 없음
}

/** "압구정3구역" → "압구정동" — 숫자·'구역'·'지구'·'차'·'번지'를 떼고 동을 만든다.
 *  '중림동398번지'처럼 이미 '동'으로 끝나면 '동'을 또 붙이지 않는다
 *  ('중림동동'이 되어 아무 데도 안 걸렸다 — 2026-07-31). */
function dongOf(name) {
  const base = name
    .replace(/[0-9·\-]+\s*(구역|지구|차|단지|번지).*$/, "")
    .replace(/역세권$/, "")
    .trim();
  if (!base) return null;
  return base.endsWith("동") ? base : `${base}동`;
}

let ok = 0, failed = 0;
for (const s of sites) {
  /* 순서가 곧 신뢰도다. 브랜드명은 **맨 뒤**로 민다 —
   * '푸르지오'·'래미안'은 서울에 수십 개라 다른 구의 같은 브랜드를 집기 쉽다.
   * 구 검증이 걸러 주긴 하지만, 애초에 덜 위험한 것부터 시도하는 게 맞다. */
  const tries = [
    [s.name, "구역명"],
    [`${s.gu} ${s.name}`, "구+구역명"],
    ...(s.brand && s.brand !== "미정" && s.brand !== "리모델링" ? [[`${s.gu} ${s.brand}`, "구+브랜드명"]] : []),
    ...(dongOf(s.name) ? [[`서울 ${s.gu} ${dongOf(s.name)}`, "동 이름(근사)"]] : []),
  ];
  let hit = null, how = null;
  /* ① 오너가 확인해 준 주소가 있으면 그것부터. 사람이 끊어 준 것이 가장 세다. */
  if (s.addrOverride) {
    try {
      /* '서울특별시'를 '서울'로 줄여서도 시도한다 — 주소 검색이 정식 명칭에
       * 오히려 걸리는 경우가 있다(서초대로 387 이 그랬다). */
      const cands = [s.addrOverride, s.addrOverride.replace("서울특별시", "서울")];
      for (const a of [...new Set(cands)]) {
        const d = pick(await searchAddr(a), s.gu, GU_RINGS[s.gu]);
        if (d) { hit = d; how = "확인 주소"; break; }
        await sleep(120);
      }
    } catch (e) {
      console.log(`::warning::주소 검색 실패 — ${s.name} / ${s.addrOverride} — ${e.message}`);
    }
    await sleep(120);
  }
  for (const [q, label] of tries) {
    if (hit) break;
    try {
      const d = pick(await search(q), s.gu, GU_RINGS[s.gu]);
      if (d) { hit = d; how = label; break; }
    } catch (e) {
      console.log(`::warning::검색 실패 — ${s.name} / ${q} — ${e.message}`);
    }
    await sleep(120); // 무료 쿼터 배려
  }
  if (hit) {
    s.lon = Number(hit.x);
    s.lat = Number(hit.y);
    s.geo = { method: how, matched: hit.place_name || hit.address_name, addr: hit.road_address_name || hit.address_name };
    ok++;
    console.log(`  ✅ ${s.name.padEnd(14)} ${how.padEnd(12)} ${s.geo.matched}`);
  } else {
    delete s.lon; delete s.lat;
    s.geo = { method: null, note: "지오코딩 실패 — 좌표 없음" };
    failed++;
    console.log(`  ❌ ${s.name} — 못 찾음(좌표 비움)`);
  }
}

/* ── 좌표가 겹친 것 분산 ──
 * 압구정3구역과 4구역이 둘 다 '압구정로데오거리'로 떨어져 **같은 점**이 됐다.
 * 서로 다른 두 사업이 한 점으로 보이면 그건 지도가 아니라 오독 장치다.
 * 정확한 구역 중심을 모르는 상태이므로 **결정적으로 조금 벌리고, 그 사실을 표시**한다.
 * 숨기고 겹쳐 두는 것보다 "이 둘은 근사 위치"라고 말하는 편이 정직하다. */
const at = new Map();
for (const s of sites) {
  if (!Number.isFinite(s.lon)) continue;
  const k = `${s.lon.toFixed(5)},${s.lat.toFixed(5)}`;
  if (!at.has(k)) at.set(k, []);
  at.get(k).push(s);
}
for (const [, group] of at) {
  if (group.length < 2) continue;
  const R = 0.0016; // 약 140m — 같은 동 안에서 구분되는 최소 거리
  group.forEach((s, i) => {
    const th = (-Math.PI / 2) + (i * 2 * Math.PI) / group.length;
    s.lon += R * Math.cos(th) / Math.cos((s.lat * Math.PI) / 180);
    s.lat += R * Math.sin(th);
    s.geo.method = `${s.geo.method} · 중복 분산`;
    s.geo.spread = true;
  });
  console.log(`  ⚠ 좌표 겹침 분산: ${group.map((s) => s.name).join(" / ")}`);
}

doc.seoulSites.geocodedAt = new Date().toISOString().slice(0, 10);
/* 같은 문장을 매 실행마다 밀어 넣어 다섯 줄이 됐다(2026-09-06 발견). 없을 때만 넣는다. */
const NOTE = "lon/lat 은 카카오 로컬 검색 결과다. geo.method 가 '동 이름(근사)'인 것은 구역 중심이 아니라 동 중심이므로 정확도가 낮다.";
doc.seoulSites._ = [...new Set([...doc.seoulSites._, NOTE])];
writeFileSync(FILE, JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`\n📍 지오코딩 — 성공 ${ok} · 실패 ${failed} / ${sites.length}`);
const byMethod = {};
for (const s of sites) byMethod[s.geo?.method || "실패"] = (byMethod[s.geo?.method || "실패"] || 0) + 1;
console.log("   방법별:", JSON.stringify(byMethod, null, 0));
