/**
 * 성수전략정비구역 1~4지구 시공사 지도 카드 (`seongsu-zones@1`).
 *
 * ── 이 카드가 지키는 것
 * ① **좌표는 전부 지오코딩**이다. 손으로 찍은 위치가 0개라는 것을 빌더가 확인하고,
 *    하나라도 좌표가 없으면 던진다.
 * ② **확정과 미확정을 갈라 놓는다.** 오너가 "유력으로 적는다"고 했지만(2026-09-06),
 *    유력을 확정과 같은 모양으로 그리면 카드가 거짓말이 된다. 실선/점선 배지로 가른다.
 * ③ **공사비의 성격이 지구마다 다르다** — 1·4지구는 계약, 2·3지구는 입찰 예정가.
 *    한 열에 섞어 놓고 아무 말 안 하면 그게 오보다. 칸마다 꼬리표를 달고 각주에 적는다.
 * ④ **매체가 갈린 값(세대수·최고층·구역면적)은 카드에 쓰지 않는다.** 데이터셋의
 *    `meta.conflicts` 에 왜 뺐는지가 적혀 있다.
 *
 * 실행: node scripts/build-seongsu-zones.mjs [날짜] [--publish]
 *   --publish 없이 돌리면 결과가 data/out/_spike 로 간다(확정은 data/content 를 본다).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { seongsuMapSvg } from "./lib/seongsu-map.mjs";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 10);

const DS = join(ROOT, "data/datasets/seongsu-jeongbi-2026.json");
const doc = JSON.parse(readFileSync(DS, "utf8"));
if (doc.meta?.verified !== true) throw new Error("데이터셋이 verified:true 가 아니다 — 카드로 못 만든다 (CLAUDE.md §8)");

const COLORS = JSON.parse(readFileSync(join(ROOT, "data/datasets/builder-colors.json"), "utf8")).colors;

const zones = [...doc.zones].sort((a, b) => a.id - b.id);
const landmarks = doc.landmarks || [];
if (zones.length !== 4) throw new Error(`지구가 4개가 아니다: ${zones.length}`);

/* ① 좌표가 전부 지오코딩으로 들어왔는지 — 하나라도 비면 지도를 그리지 않는다. */
for (const p of [...zones, ...landmarks]) {
  if (!Number.isFinite(p.lon) || !Number.isFinite(p.lat))
    throw new Error(`${p.name} 좌표 없음 — data/geocode-queue.txt 에 줄을 밀고 푸시한다`);
  if (!p.geo?.method) throw new Error(`${p.name} 지오코딩 방법이 안 적혀 있다`);
}
const byAddr = [...zones, ...landmarks].filter((p) => p.geo.method === "확인 주소").length;

const colorOf = (b) => COLORS[b]?.hex || (() => { throw new Error(`시공사 색이 없다: ${b} — data/datasets/builder-colors.json`); })();

/* 공사비 — 억원 단위 정수를 "N조 N,NNN억" 으로. 손으로 적지 않는다. */
function won(eok) {
  if (!Number.isInteger(eok)) throw new Error(`공사비가 정수(억원)가 아니다: ${eok}`);
  const jo = Math.floor(eok / 10000), rest = eok % 10000;
  return jo ? `${jo}조 ${rest.toLocaleString("ko-KR")}억` : `${rest.toLocaleString("ko-KR")}억`;
}

/* 조감도 — 네 칸 **전부** 있을 때만 띠를 그린다. 한 칸만 비면 줄이 어긋난다. */
const photoDir = join(ROOT, "templates/_shared/photos");
const photoOf = (z) => (z.photo && existsSync(join(photoDir, z.photo)) ? z.photo : null);
const allPhotos = zones.every((z) => photoOf(z));

const fixedN = zones.filter((z) => z.statusKind === "fixed").length;
const totalCost = zones.reduce((a, z) => a + z.cost, 0);

const { svg: mapSvg, scale } = seongsuMapSvg({
  zones: zones.map((z) => ({ ...z, color: colorOf(z.builder) })),
  landmarks,
  /* 지도 왼쪽 위 빈 자리를 데이터로 채운다 — 문구가 아니라 합계다(코드가 더한 값). */
  headline: { top: `한강변 네 개 구역, 합쳐서`, big: `공사비 ${won(totalCost)}` },
});

const card = {
  template: "seongsu-zones@1",
  date,
  /* 제목은 한 줄. 두 줄 제목은 이 계정에서 titlegap 으로 떨어진다(2026-09-06 A군 경험). */
  title: `성수 1~4지구, <span class="hi">누가 짓나</span>`,
  mapSvg,
  zones: zones.map((z) => ({
    no: z.id,
    name: z.short,
    builder: z.builder,
    brand: z.brand || null,
    status: z.status,
    fixed: z.statusKind === "fixed",
    cost: won(z.cost),
    costKind: z.costKind,
    color: colorOf(z.builder),
    photo: allPhotos ? photoOf(z) : null,
  })),
  note:
    `실선 = 시공사 확정 · 점선 = 아직 미확정 · 공사비는 확정 구역만 계약액(나머지는 입찰 예정가) · ` +
    `구역·다리·역 위치는 실제 좌표, 강안선은 개념도`,
  source: { name: "각 조합·건설사 발표 및 업계 보도 종합", asOf: doc.meta.asOf },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "seongsu-zones.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

/* ── 캡션 — 수치는 전부 카드/데이터셋에서 꺼낸다. 보고 옮겨 적지 않는다. ── */
const line = (z) =>
  `· ${z.short} — ${z.builder}${z.brand ? `(${z.brand})` : ""} · ${z.status} · 공사비 ${won(z.cost)}(${z.costKind})` +
  `\n   ${z.statusDetail}`;

const caption = [
  `성수 1~4지구, 누가 짓나?`,
  ``,
  `한강변 성수전략정비구역 네 곳의 시공사 현황을 지도 한 장에 올렸습니다.`,
  `네 곳 중 ${fixedN}곳은 시공사가 확정됐고, 나머지 ${zones.length - fixedN}곳은 아직 선정 절차가 진행 중입니다.`,
  `합치면 공사비만 ${won(totalCost)} 규모입니다.`,
  ``,
  ...zones.map(line),
  ``,
  `※ '유력'은 확정이 아닙니다. 단독 응찰·수의계약 수순으로 그 회사가 유력하다는 뜻이고,`,
  `   조합 총회에서 뒤집힐 수 있습니다. ${doc.meta.asOf} 기준입니다.`,
  `※ 공사비는 시공사가 정해진 곳은 계약액, 아직인 곳은 조합이 내건 입찰 예정가입니다.`,
  `※ 세대수·최고층수는 매체마다 값이 갈려 카드에 넣지 않았습니다.`,
  `※ 지도의 구역·다리·역 위치는 실제 주소 좌표로 찍었고, 강안선은 개념도입니다.`,
  `※ 출처: 각 조합·건설사 발표 및 업계 보도 종합 — 2026년 4월 1지구 선정부터 ${doc.meta.asOf} 까지의 진행 상황입니다.`,
  ``,
  /* 해시태그는 5개까지(CAPTION_MAX_TAGS). 늘리려면 기준을 먼저 바꾼다. */
  `#성수동 #성수전략정비구역 #재개발 #서울부동산 #위릿`,
].join("\n");
writeCaption("seongsu-zones", caption); // ⚠️ 서명은 writeCaption 이 붙인다

console.log(`🗺  seongsu-zones — 지구 ${zones.length} · 확정 ${fixedN} · 공사비 합 ${won(totalCost)}`);
console.log(`   좌표: 확인 주소로 잡은 것 ${byAddr}/${zones.length + landmarks.length} · 축척 ${scale}`);
console.log(`   조감도: ${allPhotos ? "네 칸 모두 있음" : `아직 없음(${zones.filter((z) => !photoOf(z)).map((z) => z.short).join(", ")}) — 사진 띠 없이 그린다`}`);
