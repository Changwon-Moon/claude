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

async function search(query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
  const r = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
  if (!r.ok) throw new Error(`카카오 ${r.status} — ${(await r.text()).slice(0, 120)}`);
  const j = await r.json();
  return j.documents || [];
}

/** 서울 안이고, 기대한 구와 맞는 결과만 고른다. 엉뚱한 지역을 집으면 오보다. */
function pick(docs, gu) {
  const inGu = docs.find((d) => (d.address_name || "").includes(gu) || (d.road_address_name || "").includes(gu));
  if (inGu) return inGu;
  return docs.find((d) => (d.address_name || "").startsWith("서울")) || null;
}

/** "압구정3구역" → "압구정동" — 숫자·'구역'·'지구'·'차'를 떼고 동을 만든다 */
function dongOf(name) {
  const base = name.replace(/[0-9·\-]+\s*(구역|지구|차|단지).*$/, "").replace(/역세권$/, "").trim();
  return base ? `${base}동` : null;
}

let ok = 0, failed = 0;
for (const s of sites) {
  const tries = [
    [s.name, "구역명"],
    [`${s.gu} ${s.name}`, "구+구역명"],
    ...(s.brand && s.brand !== "미정" && s.brand !== "리모델링" ? [[s.brand, "브랜드명"]] : []),
    ...(dongOf(s.name) ? [[`서울 ${s.gu} ${dongOf(s.name)}`, "동 이름(근사)"]] : []),
  ];
  let hit = null, how = null;
  for (const [q, label] of tries) {
    try {
      const d = pick(await search(q), s.gu);
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

doc.seoulSites.geocodedAt = new Date().toISOString().slice(0, 10);
doc.seoulSites._.push(
  "lon/lat 은 카카오 로컬 검색 결과다. geo.method 가 '동 이름(근사)'인 것은 구역 중심이 아니라 동 중심이므로 정확도가 낮다.",
);
writeFileSync(FILE, JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`\n📍 지오코딩 — 성공 ${ok} · 실패 ${failed} / ${sites.length}`);
const byMethod = {};
for (const s of sites) byMethod[s.geo?.method || "실패"] = (byMethod[s.geo?.method || "실패"] || 0) + 1;
console.log("   방법별:", JSON.stringify(byMethod, null, 0));
