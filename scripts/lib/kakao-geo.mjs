/**
 * 카카오 로컬(지오코딩) 공용 부품 — **주소·구역명 → 좌표**.
 *
 * ── 왜 이 파일인가 (2026-09-06)
 * 이 논리는 `scripts/geocode-sites.mjs` 안에만 있었다. 성수전략정비구역 지도를 그리려고
 * 두 번째 데이터셋을 지오코딩해야 했는데, 복사하면 **구 검증(폴백 없음)과 좌표 겹침 분산**
 * 이라는 두 개의 사고 방지책이 두 곳으로 갈라진다. `han-river.mjs` 를 뽑아낸 것과 같은 이유로
 * 여기로 뽑았다. 여기 있는 것은 *판단*이고, 각 스크립트가 가진 것은 *어느 파일을 고치나*다.
 *
 * ── 여기 담긴 사고 방지책 둘 (지우지 말 것)
 * ① **폴백 없음.** 2026-07-31 에 "서울이면 통과"라는 폴백 때문에 동대문구 신이문역세권이
 *    마포래미안푸르지오로 잡혔다. 주소 문자열만 믿지 않고 **좌표가 그 구 도형 안에 있는지
 *    실측**한다. 못 찾으면 비워 둔다 — 틀린 좌표는 없는 좌표보다 나쁘다.
 * ② **겹친 좌표는 결정적으로 벌리고 그 사실을 표시한다.** 압구정3·4구역이 한 점이 됐다.
 *    숨기고 겹쳐 두는 것보다 "이 둘은 근사 위치"라고 말하는 편이 정직하다.
 */
import { readFileSync } from "node:fs";

/** 카카오 키 — 워크플로가 넘기는 이름 두 가지를 다 본다. */
export const kakaoKey = () => process.env.KAKAO_REST_KEY || process.env.KAKAO_REST_API_KEY || "";

/** 키가 없을 때 **왜**인지 남긴다. 값은 절대 찍지 않는다 — 이름과 길이만(로그가 커밋된다). */
export function reportMissingKey() {
  const seen = Object.keys(process.env).filter((k) => /KAKAO|REST_KEY/i.test(k));
  console.log("⏭ 카카오 키가 비어 지오코딩을 건너뜁니다.");
  console.log(`  워크플로가 넘긴 KAKAO* 환경변수: ${seen.length ? seen.map((k) => `${k}(${(process.env[k] || "").length}자)`).join(", ") : "없음"}`);
  console.log("  → 0자로 보이면 시크릿 이름이 다르거나 값이 비어 있습니다.");
  console.log("     `node scripts/check-secrets.mjs` 로 이름을 대조하세요.");
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ringsOf = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);

/** 서울 자치구 도형 — 이름 → 링 목록. 좌표가 그 구 안에 있는지 재는 데 쓴다. */
export function guRings(geojsonPath) {
  const geo = JSON.parse(readFileSync(geojsonPath, "utf8"));
  return Object.fromEntries(geo.features.map((f) => [f.properties.name, ringsOf(f.geometry)]));
}

export function pointInRings(lon, lat, ringList) {
  let inside = false;
  for (const ring of ringList) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/** 결과 고르기 — ① 주소에 구 이름 ② 좌표가 실제로 그 구 도형 안. **폴백 없음.** */
export function pick(docs, gu, rings) {
  for (const d of docs) {
    const addr = `${d.address_name || ""} ${d.road_address_name || ""}`;
    if (!addr.includes(gu)) continue;
    const lon = Number(d.x), lat = Number(d.y);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (rings && !pointInRings(lon, lat, rings)) continue;
    return d;
  }
  return null;
}

/** 주소 검색 — 키워드보다 정밀하다. 사람이 확인해 준 주소는 이쪽으로 간다. */
export async function searchAddr(key, query) {
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}&size=5`;
  const r = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
  if (!r.ok) throw new Error(`카카오(주소) ${r.status} — ${(await r.text()).slice(0, 120)}`);
  return (await r.json()).documents || [];
}

/** 키워드 검색 — 구역명·브랜드명처럼 주소가 아닌 이름용. */
export async function searchKeyword(key, query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
  const r = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
  if (!r.ok) throw new Error(`카카오 ${r.status} — ${(await r.text()).slice(0, 120)}`);
  return (await r.json()).documents || [];
}

/**
 * 같은 점에 떨어진 것들을 결정적으로 벌린다(약 140m 원 위에 균등 배치).
 * 정확한 구역 중심을 모르는 상태이므로 **벌리고, 벌렸다고 표시**한다.
 */
export function spreadOverlaps(items, log = console.log) {
  const at = new Map();
  for (const s of items) {
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
    log(`  ⚠ 좌표 겹침 분산: ${group.map((s) => s.name).join(" / ")}`);
  }
}
