/**
 * KOSIS 표 사이 행정구역 코드 대조표 만들기.
 *
 * ── 왜 필요한가 (2026-08-03, 실측)
 * KOSIS 안에서도 표마다 행정구역 코드 체계가 **다르다.**
 * 주민등록 계열(인구·세대·이동)은 통계청 행정구역코드를 쓰고,
 * 인구동향 계열(출생·사망)은 별도 체계를 쓴다.
 *
 *     종로구 : 인구표 11110 · 출생표 11010
 *
 * 시군구만 다른 게 아니라 **시도부터 다르고, 하필 겹친다:**
 *
 *     코드 26 → 출생표 울산광역시 · 인구표 부산광역시
 *     코드 29 → 출생표 세종특별자치시 · 인구표 광주광역시
 *     코드 31 → 출생표 경기도       · 인구표 울산광역시
 *     코드 36 → 출생표 전라남도      · 인구표 세종특별자치시
 *
 * 숫자로 그냥 조인하면 **울산 출생아가 부산에, 경기 출생아가 울산에 얹힌다.**
 * 응답도 정상이고 숫자도 그럴싸해서 검수로도 안 걸리고, 지도는 예쁘게 그려진다.
 * 이 배관에서 가장 위험한 사고다.
 *
 * ── 어떻게 묶나
 * 숫자를 믿지 않고 **이름으로** 묶는다. 다만 '중구'는 여섯 곳에 있으므로
 * 시도를 먼저 이름으로 맞추고, 그 안에서 시군구 이름을 맞춘다.
 *
 * ── 안 맞는 것은 지우지 않고 남긴다
 * 출생표는 1990년대부터의 시계열이라 **폐지된 행정구역이 그대로 남아 있다**
 * (청원군·마산시·인천 남구·일산구…). 이건 버그가 아니라 과거다.
 * 조용히 버리면 다음 사람이 "왜 366개가 349개가 됐지" 를 다시 판다. 목록으로 남긴다.
 *
 * 쓰는 법:  node scripts/build-kosis-region-map.mjs
 * 재료:     data/kosis-probe-raw.json  (Actions 의 kosis-probe 가 떨군다)
 * 결과:     data/geo/kosis-region-map.json
 */
import { readFileSync, writeFileSync } from "node:fs";

const RAW = "data/kosis-probe-raw.json";
const OUT = "data/geo/kosis-region-map.json";

/** 기준이 되는 표 — 이 표의 코드 체계로 통일한다(우리 지도가 쓰는 통계청 코드). */
const BASE = "population";
/** 다른 체계를 쓰는 표들 */
const ALT = ["births", "deaths"];

const norm = (s) => String(s ?? "").replace(/\s+/g, "");

/**
 * 시도 이름을 **한 가지 꼴로 맞춘다.**
 *
 * 같은 도를 표마다 다르게 부른다. 실측(2026-08-03):
 *   사망표 32=강원도      · 출생표 32=강원특별자치도   · 인구표 51=강원특별자치도
 *   사망표 35=전라북도     · 출생표 35=전북특별자치도   · 인구표 52=전북특별자치도
 *   사망표 39=제주도      · 출생표 39=제주특별자치도   · 인구표 50=제주특별자치도
 *
 * 사망 표는 1998년부터의 시계열이라 **개편 전 이름과 개편 후 이름이 함께** 들어 있다
 * (32310=홍천군 과 32510=홍천군 이 둘 다 있다). 옛 코드도 같은 곳을 가리키므로 함께 옮긴다.
 *
 * 이름 그대로 맞추면 강원·전북·제주가 통째로 떨어져 나가고, 그러면 그 세 도의
 * 시군구가 지도에서 조용히 빈다. 빈 지도는 "데이터가 없다" 로 보이지 성능 문제로 안 보인다.
 */
function canonSido(name) {
  let s = norm(name);
  s = s.replace(/(특별자치도|특별자치시|특별시|광역시|자치도|도|시)$/u, "");
  const alias = {
    전라북: "전북", 전라남: "전남",
    충청북: "충북", 충청남: "충남",
    경상북: "경북", 경상남: "경남",
  };
  return alias[s] ?? s;
}

let raw;
try {
  raw = JSON.parse(readFileSync(RAW, "utf8"));
} catch {
  console.error(`❌ ${RAW} 를 못 읽었습니다.`);
  console.error("   Actions 의 kosis-probe 를 먼저 돌려야 합니다 —");
  console.error("   data/kosis-probe-queue.txt 를 한 줄 고쳐 푸시하면 돕니다.");
  process.exit(1);
}

const base = raw.tables?.[BASE];
if (!base?.ok || !Object.keys(base.regions ?? {}).length) {
  console.error(`❌ 기준 표(${BASE})의 지역 목록이 비어 있습니다 — probe 결과를 확인하세요.`);
  process.exit(1);
}

/* 기준 체계: 시도 이름→코드, (시도코드, 시군구이름)→코드 */
const baseSidoByName = new Map();
const baseSggByKey = new Map();
for (const [code, name] of Object.entries(base.regions)) {
  if (code.length === 2) baseSidoByName.set(canonSido(name), code);
  else if (code.length === 5) baseSggByKey.set(`${code.slice(0, 2)}|${norm(name)}`, code);
}

const out = {
  _: [
    "KOSIS 표 사이 행정구역 코드 대조표.",
    "인구동향 계열(출생·사망)의 코드를 우리 지도가 쓰는 통계청 코드로 옮긴다.",
    "숫자가 겹치므로(26=울산/부산, 29=세종/광주, 31=경기/울산, 36=전남/세종)",
    "절대 숫자로 조인하지 말 것. 이 표를 거쳐야 한다.",
    "만든 법: scripts/build-kosis-region-map.mjs (재료 data/kosis-probe-raw.json)",
  ],
  base: BASE,
  builtFrom: raw.generatedAt ?? null,
  maps: {},
  /** 기준 표에 없는 코드 — 대부분 폐지된 행정구역이다. 버리지 않고 남긴다. */
  unmatched: {},
};

let hardFail = false;

for (const key of ALT) {
  const t = raw.tables?.[key];
  if (!t?.ok || !Object.keys(t.regions ?? {}).length) {
    console.log(`⏸ ${key}: probe 가 아직 지역 목록을 못 받았습니다 — 건너뜁니다.`);
    continue;
  }

  const sidoByCode = new Map();
  for (const [code, name] of Object.entries(t.regions)) {
    if (code.length === 2) sidoByCode.set(code, canonSido(name));
  }

  const map = {};
  const miss = [];
  let sggTotal = 0;

  for (const [code, name] of Object.entries(t.regions)) {
    if (code.length !== 5) continue;
    sggTotal++;
    const sidoName = sidoByCode.get(code.slice(0, 2));
    const baseSido = sidoName ? baseSidoByName.get(sidoName) : undefined;
    const hit = baseSido ? baseSggByKey.get(`${baseSido}|${norm(name)}`) : undefined;
    if (hit) map[code] = hit;
    else miss.push({ code, name, sido: sidoName ?? "(시도 미상)" });
  }

  /* 시도도 옮길 수 있어야 한다 — 시도 단위 카드를 만들 때 쓴다. */
  for (const [code, name] of sidoByCode) {
    const hit = baseSidoByName.get(name);
    if (hit) map[code] = hit;
  }

  out.maps[key] = map;
  out.unmatched[key] = miss;

  const rate = sggTotal ? ((sggTotal - miss.length) / sggTotal) * 100 : 0;
  console.log(`\n── ${key} (${t.tblId})`);
  console.log(`   시군구 ${sggTotal}개 → 매칭 ${sggTotal - miss.length} · 미매칭 ${miss.length} (${rate.toFixed(1)}%)`);
  if (miss.length) {
    console.log(`   미매칭(대부분 폐지된 행정구역): ${miss.map((m) => `${m.code}=${m.name}`).join(", ")}`);
  }
  /* 매칭률이 크게 떨어지면 이름 규칙이 바뀐 것이다 — 조용히 넘기면 지도가 비어 버린다. */
  if (rate < 90) {
    console.error(`   ❌ ${key} 매칭률 ${rate.toFixed(1)}% — 90% 미만입니다. 이름 규칙이 바뀌었는지 확인하세요.`);
    hardFail = true;
  }
}

if (!Object.keys(out.maps).length) {
  console.error("\n❌ 만들어진 대조표가 없습니다.");
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify(out, null, 1), "utf8");
console.log(`\n✅ ${OUT}`);
for (const [k, m] of Object.entries(out.maps)) console.log(`   ${k}: ${Object.keys(m).length}개 코드`);
process.exit(hardFail ? 1 : 0);
