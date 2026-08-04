/**
 * KOSIS 표의 행정구역 코드를 **우리 지도 코드로** 옮기는 대조표 만들기.
 *
 * ══════════════════════════════════════════════════════════════════
 * ── 왜 필요한가 (2026-08-04, 실측으로 방향을 바로잡았다)
 *
 * KOSIS 안에서도 표마다 행정구역 코드 체계가 다르다. 그리고 **우리 지도는 그중
 * 어느 쪽과도 자동으로 맞지 않는다.** 종로구를 세 곳이 다르게 부른다:
 *
 *     우리 지도            11010
 *     인구·세대·이동·연령    11110   (통계청 행정구역코드)
 *     출생·사망            11010   (인구동향 계열)
 *
 * 지도 코드 255개와 인구표 코드가 **겹치는 것이 9개뿐이다.** 더 나쁜 것은
 * 그 9개가 "맞아서" 겹친 게 아니라 **우연히 같은 숫자**라는 점이다.
 * 그냥 조인하면 9곳에 엉뚱한 숫자가 들어가고 나머지 246곳은 빈다.
 * 빈 지도는 "데이터가 없다"로 보이고, 채워진 9곳은 아무도 의심하지 않는다.
 *
 * ⚠️ 한동안 문서에는 "우리 지도는 통계청 코드" 라고 적혀 있었다. **틀렸다.**
 *    지도(`korea-sgg-2026.geojson`·`sgg-codes.json`)는 인구동향 계열 체계를 쓴다.
 *    그래서 대조표의 기준을 **지도**로 잡는다 — 지도가 최종 목적지이기 때문이다.
 *
 * ── 어떻게 묶나: 숫자를 안 믿고 이름으로
 * '중구'는 여섯 곳에 있다. 시도를 먼저 맞추고 그 안에서 시군구 이름을 맞춘다.
 * 세 가지를 흡수해야 한다:
 *
 *   ① 시도 이름이 표마다 다르다
 *      사망표 '강원도' · 출생표 '강원특별자치도' · 인구표 '강원특별자치도'
 *      → canonSido() 로 접미사를 떼고 전라북→전북 식으로 맞춘다
 *
 *   ② 일반구를 KOSIS 는 나눠 주고 우리 지도는 붙여 쓴다
 *      KOSIS: 41110=수원시 · 41111=장안구 · 41113=권선구
 *      지도 : 수원시장안구 · 수원시권선구
 *      → 코드 앞 4자리가 같은 '…시' 행을 찾아 이름을 앞에 붙여 본다
 *
 *   ③ 세종은 이름 꼴이 다르다 — KOSIS '세종특별자치시' vs 지도 '세종시'
 *
 * ── 안 맞는 것은 지우지 않고 남긴다
 * 폐지된 행정구역(청원군·마산시·북제주군…), 출장소(영종·검단·송탄),
 * 그리고 **일반구의 부모 시 행**(41110=수원시)이 남는다. 부모 시가 안 맞는 것은
 * 정상이다 — 그 데이터는 구 단위 행에 이미 들어 있다.
 * 조용히 버리면 다음 사람이 "왜 277이 255가 됐지" 를 다시 판다. 목록으로 남긴다.
 *
 * ── 무엇을 기준으로 통과·실패를 가르나
 * KOSIS 행 중 몇 %가 맞았는지가 아니라 **우리 지도 255곳 중 몇 곳이 채워지는지**로
 * 판단한다. 전자는 출장소·부모시 때문에 늘 낮게 나오고, 정작 중요한 건 후자다.
 *
 * 쓰는 법:  node scripts/build-kosis-region-map.mjs
 * 재료:     data/kosis-probe-raw.json   (Actions 의 kosis-probe 가 떨군다)
 *           data/geo/sgg-codes.json     (우리 지도의 코드·이름)
 * 결과:     data/geo/kosis-region-map.json
 */
import { readFileSync, writeFileSync } from "node:fs";

const RAW = "data/kosis-probe-raw.json";
const GEO = "data/geo/sgg-codes.json";
const OUT = "data/geo/kosis-region-map.json";

/** 지도 코드 몇 %가 채워져야 통과인가 */
const MIN_COVERAGE = 90;

/**
 * 구조적으로 지도를 다 못 채우는 표 — **버그가 아니라 그 표의 굵기**다.
 * 여기 적어 두면 그 값을 문턱으로 쓴다. 적지 않으면 MIN_COVERAGE 를 쓴다.
 *
 * 문턱을 그냥 낮추지 않고 표마다 적는 이유: 낮춘 문턱은 다음에 진짜로 깨졌을 때도
 * 통과시킨다. 이유를 아는 표만, 아는 만큼만 열어 준다.
 */
const KNOWN_COARSE = {
  migration: {
    floor: 80,
    why: "인구이동 표는 일반시를 구로 안 나눈다 — 수원시·성남시·고양시·용인시 등이 " +
      "시 단위 한 행으로만 온다. 우리 지도는 그 시들을 구로 쪼개 놓아 39곳이 빈다. " +
      "수원시 순이동을 4개 구에 나눠 넣는 것은 만들어 낸 숫자다 — 그래서 비워 둔다. " +
      "이 지표로 구 단위 지도 카드를 만들면 그 39곳이 구멍으로 남는다는 뜻이다.",
  },
};

const norm = (s) => String(s ?? "").replace(/\s+/g, "");

/** 시도 이름을 한 가지 꼴로. '강원도'·'강원특별자치도' → '강원' */
function canonSido(name) {
  const s = norm(name).replace(/(특별자치도|특별자치시|특별시|광역시|자치도|도|시)$/u, "");
  const alias = {
    전라북: "전북", 전라남: "전남",
    충청북: "충북", 충청남: "충남",
    경상북: "경북", 경상남: "경남",
  };
  return alias[s] ?? s;
}

function die(msg, hint) {
  console.error(`❌ ${msg}`);
  if (hint) console.error(`   ${hint}`);
  process.exit(1);
}

let raw, geo;
try {
  raw = JSON.parse(readFileSync(RAW, "utf8"));
} catch {
  die(`${RAW} 를 못 읽었습니다.`, "Actions 의 kosis-probe 를 먼저 돌리세요 — data/kosis-probe-queue.txt 를 고쳐 푸시하면 돕니다.");
}
try {
  geo = JSON.parse(readFileSync(GEO, "utf8")).sgg;
} catch {
  die(`${GEO} 를 못 읽었습니다.`, "node scripts/build-sgg-geo.mjs 로 지도를 먼저 만드세요.");
}
if (!Array.isArray(geo) || !geo.length) die(`${GEO} 에 시군구가 없습니다.`);

/* 지도 기준: (시도canon, 이름) → 지도코드 */
const mapByName = new Map();
for (const x of geo) mapByName.set(`${canonSido(x.sido)}|${norm(x.name)}`, x.code);
const allMapCodes = new Set(geo.map((x) => x.code));

const out = {
  _: [
    "KOSIS 표의 행정구역 코드를 우리 지도 코드로 옮기는 대조표.",
    "표마다 체계가 다르고, 지도는 그중 어느 쪽과도 자동으로 맞지 않는다.",
    "종로구: 지도 11010 · 인구표 11110 · 출생표 11010.",
    "지도 코드와 인구표 코드가 겹치는 것은 9개뿐이고 그것도 우연이다 —",
    "절대 숫자로 조인하지 말 것. 이 표를 거쳐야 한다.",
    "만든 법: scripts/build-kosis-region-map.mjs",
  ],
  base: "map(data/geo/sgg-codes.json)",
  mapCodeCount: allMapCodes.size,
  builtFrom: raw.generatedAt ?? null,
  maps: {},
  unmatched: {},
  coverage: {},
};

let hardFail = false;
const tables = Object.keys(raw.tables ?? {});
if (!tables.length) die("probe 결과에 표가 없습니다.");

for (const key of tables) {
  const t = raw.tables[key];
  if (!t?.ok || !Object.keys(t.regions ?? {}).length) {
    console.log(`⏸ ${key}: probe 가 아직 지역 목록을 못 받았습니다 — 건너뜁니다.`);
    continue;
  }

  const regions = t.regions;
  const sidoByCode = new Map();
  for (const [code, name] of Object.entries(regions)) {
    if (code.length === 2) sidoByCode.set(code, canonSido(name));
  }
  /* 일반구의 부모 시 — 코드 앞 4자리가 같고 이름이 '시' 로 끝나는 행 */
  const parentByPrefix = new Map();
  for (const [code, name] of Object.entries(regions)) {
    if (code.length === 5 && norm(name).endsWith("시")) parentByPrefix.set(code.slice(0, 4), norm(name));
  }

  const map = {};
  const miss = [];
  let sggTotal = 0;

  for (const [code, name] of Object.entries(regions)) {
    if (code.length !== 5) continue;
    sggTotal++;
    const sido = sidoByCode.get(code.slice(0, 2)) ?? "";
    const nm = norm(name);

    /* 후보를 순서대로 시도한다 — 그대로 · 부모시+이름(수원시+장안구) · 세종특별자치시→세종시 */
    const parent = parentByPrefix.get(code.slice(0, 4));
    const candidates = [nm];
    if (parent && parent !== nm) candidates.push(parent + nm);
    const asSi = nm.replace(/(특별자치시|특별시|광역시)$/u, "시");
    if (asSi !== nm) candidates.push(asSi);

    const hit = candidates.map((c) => mapByName.get(`${sido}|${c}`)).find(Boolean);
    if (hit) map[code] = hit;
    else miss.push({ code, name, sido: sido || "(시도 미상)" });
  }

  out.maps[key] = map;
  out.unmatched[key] = miss;

  /* 판단 기준: 지도 255곳 중 몇 곳이 이 표로 채워지는가 */
  const covered = new Set(Object.values(map).filter((c) => allMapCodes.has(c)));
  const coverage = (covered.size / allMapCodes.size) * 100;
  out.coverage[key] = { mapCovered: covered.size, mapTotal: allMapCodes.size, kosisRows: sggTotal };

  console.log(`\n── ${key} (${t.tblId})`);
  console.log(`   지도 ${allMapCodes.size}곳 중 **${covered.size}곳** 채움 (${coverage.toFixed(1)}%) · KOSIS 행 ${sggTotal}개 중 ${Object.keys(map).filter((k) => k.length === 5).length}개 대응`);
  if (miss.length) {
    const head = miss.slice(0, 10).map((m) => `${m.code}=${m.name}`).join(", ");
    console.log(`   안 맞은 KOSIS 행 ${miss.length}개(폐지 행정구역·출장소·일반구의 부모 시): ${head}${miss.length > 10 ? " …" : ""}`);
  }
  const coarse = KNOWN_COARSE[key];
  const floor = coarse?.floor ?? MIN_COVERAGE;
  if (coarse) {
    console.log(`   ℹ️ 이 표는 구조적으로 지도를 다 못 채웁니다(문턱 ${floor}%): ${coarse.why}`);
    out.coverage[key].knownCoarse = coarse.why;
  }
  if (coverage < floor) {
    console.error(`   ❌ ${key} 지도 커버리지 ${coverage.toFixed(1)}% — 문턱 ${floor}% 미만입니다.`);
    console.error("      이름 규칙이 바뀌었거나, 표가 우리 지도보다 굵은 단위로 나오는 것입니다.");
    console.error("      후자가 확실하면 KNOWN_COARSE 에 이유와 함께 적으세요 — 문턱만 낮추지 마세요.");
    hardFail = true;
  }
}

if (!Object.keys(out.maps).length) die("만들어진 대조표가 없습니다.");

writeFileSync(OUT, JSON.stringify(out, null, 1), "utf8");
console.log(`\n✅ ${OUT}`);
for (const [k, c] of Object.entries(out.coverage)) {
  console.log(`   ${k}: 지도 ${c.mapCovered}/${c.mapTotal}곳`);
}
process.exit(hardFail ? 1 : 0);
