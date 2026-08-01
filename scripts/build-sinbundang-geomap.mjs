/**
 * 신분당선 역세권 대장아파트 — 실좌표 노선지도 카드 1장(지도 래스터를 위릿 프레임에 얹음).
 * 지도 이미지는 scripts/spike-sinbundang-geomap.py(WIRIT_BARE=1) 가 데이터셋에서 생성한다
 * (수치=코드 추출, 오보 0). 이 빌더는 파이썬을 실행해 지도를 재생성한 뒤 카드 JSON을 쓴다.
 * 실행: node scripts/build-sinbundang-geomap.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const ds = JSON.parse(
  readFileSync(join(ROOT, "data/datasets/sinbundang-daejang-2026.json"), "utf8")
);

// 지도 이미지 재생성(결정적 — 같은 데이터셋 = 같은 그림). 파이썬/의존성이 없으면 기존 파일을 쓴다.
const mapPath = join(ROOT, "templates/_shared/maps/sinbundang-route.png");
const r = spawnSync("python3", [join(ROOT, "scripts/spike-sinbundang-geomap.py")], {
  cwd: ROOT,
  env: { ...process.env, WIRIT_BARE: "1" },
  stdio: "inherit",
});
if (r.status !== 0 && !existsSync(mapPath)) {
  console.log("::warning::지도 이미지 생성 실패 + 기존 파일 없음 — 카드 생략");
  process.exit(1);
}
if (r.status !== 0) {
  console.log("::warning::지도 재생성 실패 — 기존 sinbundang-route.png 를 사용");
}

const card = {
  template: "sinbundang-geomap@1",
  date,
  subtitle: "신사→광교 · 역세권 종합 대장 10곳 · 대표평형 매매 근사치",
  title: `<span class="ln">신분당선</span> 역세권 대장아파트 지도`,
  map: "sinbundang-route.png",
  note: "역 위치=실좌표 근사 · 5기준(역근접·인지도·거래량·가격리딩·세대수) 종합 · 시세=대표평형 매매 근사치 · 투자 권유 아님",
  source: { name: ds.meta.sources.research, asOf: ds.meta.asOf },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "sinbundang-geomap.json"),
  JSON.stringify(card, null, 2) + "\n"
);
console.log(`✅ 신분당선 지도 카드 생성 → data/content/${date}/sinbundang-geomap.json`);
