/**
 * 대기열에 적힌 **아무 데이터셋이나** 지오코딩한다 (카카오 로컬).
 *
 * ── 왜 따로 있나 (2026-09-06)
 * `geocode-sites.mjs` 는 `jeongbi-order-2026-07.json` **한 파일에 붙박이**다. 그 파일은
 * 확정본 카드(`jeongbi-board`)의 재료라 **항목을 하나만 늘려도 그 카드가 바뀐다** —
 * 「픽셀 불변」이 막는다. 그래서 새 데이터셋을 지오코딩할 길이 따로 필요했다.
 * 판단(구 검증·겹침 분산)은 `lib/kakao-geo.mjs` 하나에 있고 두 스크립트가 같이 쓴다.
 *
 * ── 대기열 형식 (`data/geocode-queue.txt`)
 *   data/datasets/seongsu-jeongbi-2026.json#zones
 *   └ 파일경로 # 좌표를 넣을 배열의 키. `#키` 를 생략하면 `items` 로 본다.
 *   `#` 로 시작하는 줄과 빈 줄은 건너뛴다. **쓰고 나면 워크플로가 비운다.**
 *
 * ── 배열 항목이 가져야 하는 것
 *   name          표시용 이름 (로그·겹침 분산 메시지에 쓴다)
 *   gu            "성동구" — 결과 검증용. 이 구 도형 밖 좌표는 **버린다**
 *   addrOverride  사람이 확인해 준 지번 주소. 있으면 이것부터 (가장 정확)
 *   query         (선택) 키워드 검색용 이름. 없으면 name 을 쓴다
 *
 * 결과: 항목에 `lon`/`lat`/`geo{method,matched,addr}` 를 넣고 파일을 다시 쓴다.
 * 못 찾으면 좌표를 **비운다.** 지어내지 않는다 — 틀린 좌표는 없는 좌표보다 나쁘다.
 *
 * 실행: KAKAO_REST_KEY=... node scripts/geocode-extra.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  kakaoKey, reportMissingKey, sleep, guRings, pick,
  searchAddr, searchKeyword, spreadOverlaps,
} from "./lib/kakao-geo.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "data/geocode-queue.txt");

const lines = existsSync(QUEUE)
  ? readFileSync(QUEUE, "utf8").split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#"))
  : [];

if (!lines.length) {
  console.log("⏭ data/geocode-queue.txt 가 비어 있습니다 — 할 일이 없습니다.");
  process.exit(0);
}

const KEY = kakaoKey();
if (!KEY) { reportMissingKey(); process.exit(0); }
console.log(`🔑 카카오 키 확인 (${KEY.length}자)`);

const RINGS = guRings(join(ROOT, "data/geo/seoul-districts.geojson"));

let filesDone = 0;
for (const line of lines) {
  const [relPath, key = "items"] = line.split("#");
  const file = join(ROOT, relPath.trim());
  if (!existsSync(file)) { console.log(`::warning::대기열의 파일이 없습니다 — ${relPath}`); continue; }

  const doc = JSON.parse(readFileSync(file, "utf8"));
  const items = doc[key.trim()];
  if (!Array.isArray(items) || !items.length) {
    console.log(`::warning::${relPath} 의 '${key}' 가 배열이 아니거나 비었습니다 — 건너뜁니다.`);
    continue;
  }
  console.log(`\n📄 ${relPath} (${key}) — ${items.length}건`);

  let ok = 0, failed = 0;
  for (const s of items) {
    let hit = null, how = null;

    /* ① 사람이 확인해 준 지번 주소부터. 사람이 끊어 준 것이 가장 세다.
     *    '서울특별시' 를 '서울' 로 줄여서도 시도한다 — 주소 검색이 정식 명칭에 오히려 걸린다. */
    if (s.addrOverride) {
      const cands = [...new Set([s.addrOverride, s.addrOverride.replace("서울특별시", "서울")])];
      for (const a of cands) {
        try {
          const d = pick(await searchAddr(KEY, a), s.gu, RINGS[s.gu]);
          if (d) { hit = d; how = "확인 주소"; break; }
        } catch (e) { console.log(`::warning::주소 검색 실패 — ${s.name} / ${a} — ${e.message}`); }
        await sleep(120);
      }
    }

    /* ② 이름으로. 구 이름을 붙인 쪽이 동명이인에 강하다. */
    const q = s.query || s.name;
    for (const [query, label] of hit ? [] : [[q, "구역명"], [`${s.gu} ${q}`, "구+구역명"]]) {
      try {
        const d = pick(await searchKeyword(KEY, query), s.gu, RINGS[s.gu]);
        if (d) { hit = d; how = label; break; }
      } catch (e) { console.log(`::warning::검색 실패 — ${s.name} / ${query} — ${e.message}`); }
      await sleep(120);
    }

    if (hit) {
      s.lon = Number(hit.x);
      s.lat = Number(hit.y);
      s.geo = { method: how, matched: hit.place_name || hit.address_name, addr: hit.road_address_name || hit.address_name };
      ok++;
      console.log(`  ✅ ${String(s.name).padEnd(14)} ${how.padEnd(10)} ${s.geo.matched}`);
    } else {
      delete s.lon; delete s.lat;
      s.geo = { method: null, note: "지오코딩 실패 — 좌표 없음" };
      failed++;
      console.log(`  ❌ ${s.name} — 못 찾음(좌표 비움)`);
    }
  }

  spreadOverlaps(items);
  doc.geocodedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(file, JSON.stringify(doc, null, 2) + "\n", "utf8");
  console.log(`  📍 성공 ${ok} · 실패 ${failed} / ${items.length}`);
  filesDone++;
}

console.log(`\n✅ 지오코딩 완료 — 파일 ${filesDone}개`);
