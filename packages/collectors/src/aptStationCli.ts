/**
 * 단지 주소 → **가장 가까운 지하철역** (카카오 로컬 API · Actions 전용).
 *
 *   KAKAO_REST_KEY=xxx tsx src/aptStationCli.ts --kapt A42385801
 *   KAKAO_REST_KEY=xxx tsx src/aptStationCli.ts --addr "경기도 광명시 광명동 200-6" --name 광명한진
 *
 * ── 왜 코드가 재나
 * "광명한진타운 근처는 철산역" 은 내가 아는 말이지 **잰 값이 아니다.** 카드에 적는 순간
 * 그건 검증되지 않은 수치가 된다(오보 0). 그래서 주소를 좌표로 바꾸고, 그 좌표에서
 * 지하철역을 **거리순으로 받아** 가장 가까운 것을 적는다. 거리도 함께 남긴다.
 *
 * ── 거리는 **직선거리**다
 * 카카오가 주는 `distance` 는 직선(대권) 거리이지 걸어간 거리가 아니다.
 * 그래서 "도보 N분"으로 바꾸지 않는다 — 실제 보행거리는 더 길고, 환산하면 그게 곧 과장이다.
 * 카드에는 **직선 N m** 로 적는다.
 *
 * ── 못 찾으면 비워 둔다
 * 좌표를 못 잡거나 반경 안에 역이 없으면 **아무것도 적지 않는다.** 틀린 역은 없는 역보다 나쁘다.
 *
 * 결과: `data/datasets/apt-station/{키}.json`
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchText } from "./http.js";
import { cleanStationName, linesFromCategory } from "./parse/station.js";

const CWD = process.env.INIT_CWD || process.cwd();
const R = (p: string) => resolve(CWD, p);
const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const KEY = process.env.KAKAO_REST_KEY || process.env.KAKAO_REST_API_KEY || "";

async function kakao(path: string): Promise<any> {
  const text = await fetchText(`https://dapi.kakao.com/v2/local/${path}`, {
    timeoutMs: 15000,
    headers: { Authorization: `KakaoAK ${KEY}` },
  });
  return JSON.parse(text);
}

async function main() {
  if (!KEY) {
    console.error("KAKAO_REST_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }
  const kapt = arg("kapt");
  let addr = arg("addr");
  let name = arg("name");
  let outKey = kapt ?? arg("key");

  /* --kapt 하나로 끝나게 한다 — 대장에 주소와 이름이 이미 있다.
     사람이 주소를 다시 타이핑하면 그 자리에서 오타가 난다. */
  if (kapt) {
    const hp = R("data/datasets/apt-hhld.json");
    if (!existsSync(hp)) throw new Error("data/datasets/apt-hhld.json 이 없습니다.");
    const rec = JSON.parse(readFileSync(hp, "utf8")).byKapt[kapt];
    if (!rec) throw new Error(`공동주택 대장에 ${kapt} 가 없습니다.`);
    addr = addr ?? rec.addr;
    name = name ?? rec.name;
  }
  if (!addr || !outKey) {
    console.error('사용법: --kapt A42385801   또는   --addr "…" --key <파일이름>');
    process.exit(1);
  }

  /* ── ① 주소 → 좌표. 지번 주소가 안 잡히면 이름으로 한 번 더 찾는다. */
  let x: string | null = null;
  let y: string | null = null;
  let method = "";
  const a = await kakao(`search/address.json?query=${encodeURIComponent(addr)}&size=5`);
  if (a.documents?.length) {
    x = a.documents[0].x;
    y = a.documents[0].y;
    method = "주소";
  } else if (name) {
    const k = await kakao(`search/keyword.json?query=${encodeURIComponent(name)}&size=5`);
    if (k.documents?.length) {
      x = k.documents[0].x;
      y = k.documents[0].y;
      method = "이름";
    }
  }
  if (!x || !y) {
    // ⚠️ 좌표를 못 잡았으면 **아무것도 쓰지 않는다.** 틀린 역은 없는 역보다 나쁘다.
    console.error(`⛔ 좌표를 못 잡았습니다: ${addr}`);
    process.exit(1);
  }

  /* ── ② 그 좌표에서 지하철역을 **거리순**으로. SW8 = 지하철역 카테고리. */
  const RADIUS = 2000; // m. 이보다 멀면 '역세권'이라 부를 일이 없다.
  const s = await kakao(
    `search/category.json?category_group_code=SW8&x=${x}&y=${y}&radius=${RADIUS}&sort=distance&size=5`,
  );
  const docs: any[] = s.documents ?? [];
  if (!docs.length) {
    console.error(`⛔ 반경 ${RADIUS}m 안에 지하철역이 없습니다 — 뱃지를 붙이지 않습니다.`);
    process.exit(1);
  }

  /* 같은 역이 출입구별로 여러 건 오기도 한다. 이름으로 접어 **가장 가까운 한 건**만 남긴다. */
  const byName = new Map<string, any>();
  for (const d of docs) {
    const nm = cleanStationName(d.place_name);
    const prev = byName.get(nm);
    if (!prev || Number(d.distance) < Number(prev.distance)) byName.set(nm, d);
  }
  const near = [...byName.values()].sort((p, q) => Number(p.distance) - Number(q.distance));
  const best = near[0];

  const outDir = R("data/datasets/apt-station");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${outKey}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        _: [
          "단지에서 가장 가까운 지하철역. 카카오 로컬(주소→좌표, SW8 카테고리 거리순)이 잰 값이다.",
          "distanceM 은 **직선거리**다 — 걸어간 거리가 아니다. '도보 N분'으로 바꾸지 않는다.",
          "역을 못 찾으면 이 파일이 아예 없다. 카드는 그때 뱃지를 붙이지 않는다.",
        ],
        key: outKey,
        kaptCode: kapt ?? null,
        name: name ?? null,
        addr,
        x: Number(x),
        y: Number(y),
        geoMethod: method,
        station: cleanStationName(best.place_name),
        lines: linesFromCategory(best.category_name, best.place_name),
        distanceM: Number(best.distance),
        rawPlaceName: best.place_name,
        others: near.slice(1, 4).map((d) => ({
          station: cleanStationName(d.place_name),
          distanceM: Number(d.distance),
          lines: linesFromCategory(d.category_name, d.place_name),
        })),
        source: "카카오 로컬 API (주소 검색 · 카테고리 SW8)",
        collectedFor: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10),
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    `${outPath}\n` +
      `${name ?? outKey} (${method}로 좌표) → ${cleanStationName(best.place_name)} ` +
      `직선 ${best.distance}m · 노선 ${linesFromCategory(best.category_name, best.place_name).join("·") || "미상"}\n` +
      near
        .slice(1, 4)
        .map((d) => `   다음: ${cleanStationName(d.place_name)} ${d.distance}m`)
        .join("\n"),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
