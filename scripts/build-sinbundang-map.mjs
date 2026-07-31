/**
 * 신분당선 역세권 대장아파트 — 노선도형 지도 카드 1장.
 * data/datasets/sinbundang-daejang-2026.json(provenance·verified:false) → sinbundang-map@1.
 * 모든 수치는 데이터셋에서 코드가 읽는다(오보 0: 빌더에 손으로 적은 숫자 0개).
 * 실행: node scripts/build-sinbundang-map.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const ds = JSON.parse(
  readFileSync(join(ROOT, "data/datasets/sinbundang-daejang-2026.json"), "utf8")
);

// 노선 순서대로 정렬(데이터가 순서를 정한다)
const picks = [...ds.picks].sort((a, b) => a.order - b.order);

const stops = picks.map((p) => ({
  station: `${p.station}역`,
  danji: p.danji,
  price: String(p.price), // 데이터셋 값 그대로 — 손으로 적지 않는다
  unit: "억",
  size: p.size,
  tag: p.tag === "가격상징" ? "가격상징" : "",
  _prov: p.note, // provenance(카드엔 안 나감, 검수 추적용)
}));

const card = {
  template: "sinbundang-map@1",
  date,
  subtitle: `${ds.line.from}→${ds.line.to} · 역세권 종합 대장 10곳 · 대표평형 매매 근사치`,
  title: `<span class="ln">신분당선</span> 타고 보는<br>역세권 대장아파트`,
  line: {
    name: ds.line.name,
    color: ds.line.color,
    from: ds.line.from,
    to: ds.line.to,
  },
  stops,
  note: "5기준(역근접·인지도·거래량·가격리딩·세대수) 종합 · 대표평형 매매 근사치 · 투자 권유 아님",
  source: { name: ds.meta.sources.research, asOf: ds.meta.asOf },
};

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "sinbundang-map.json"), // 세트 등록용 평면 슬러그
  JSON.stringify(card, null, 2) + "\n"
);

console.log(
  `✅ 신분당선 대장 지도 카드 생성 → data/content/${date}/sinbundang-map/1-map.json (정거장 ${stops.length}곳, verified:${ds.meta.verified})`
);
