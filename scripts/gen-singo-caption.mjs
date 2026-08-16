/**
 * 「오늘의 신고가」 캡션 생성 — `node scripts/gen-singo-caption.mjs <카드.json> [--out <라벨>]`
 *
 * ── 왜 코드가 쓰나 (2026-08-16b)
 * 캡션 검수는 **캡션의 '억' 금액이 카드 수치에 있는지** 대조한다(captionNumberMatch).
 * 사람이 쓰면 카드를 보며 옮겨 적게 되고, 그 옮겨 적기가 곧 오보의 자리다.
 * 그래서 **카드 자신의 `meta` 에서만** 숫자를 꺼내 문장을 만든다 — 카드와 캡션이
 * 어긋날 수가 없다. 노선 카드(`gen-line-captions.mjs`)와 같은 원리다.
 *
 * ⚠️ 문장은 자동이지만 **글은 사람이 다듬으라고 만든 초안**이다.
 *    카드에 없는 사실(재건축·학군·호재)은 여기서 절대 만들지 않는다.
 *
 * 결과: `data/review/captions/{라벨}.txt` (없으면 카드 slug 로)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const src = argv.find((a) => !a.startsWith("--"));
const arg = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
if (!src) {
  console.error("사용법: node scripts/gen-singo-caption.mjs data/content/<날짜>/<카드>.json [--out <라벨>]");
  process.exit(2);
}

const card = JSON.parse(readFileSync(join(ROOT, src), "utf8"));
if (card.template !== "singo-record@1") {
  console.error(`이 생성기는 singo-record@1 전용입니다 — 받은 판형: ${card.template}`);
  process.exit(1);
}
const m = card.meta ?? {};
const curve = m.curve ?? [];
if (!curve.length) {
  console.error("meta.curve 가 없습니다 — 캡션 숫자를 꺼낼 곳이 없습니다.");
  process.exit(1);
}

/* ── 카드 글자에서 이름·평형을 되꺼낸다(제목은 HTML 이라 태그를 걷는다) */
const plainTitle = String(card.title).replace(/<[^>]+>/g, "").trim();
const pyeong = plainTitle.split(/\s+/).pop();
const apt = plainTitle.slice(0, plainTitle.length - pyeong.length).trim();

const ym = (s) => `${s.slice(0, 4)}년 ${Number(s.slice(4))}월`;
const first = curve[0];
const last = curve[curve.length - 1];
const cyc = m.cycle;
const low = [...curve].sort((a, b) => parseFloat(a.eok) - parseFloat(b.eok))[0];

/* 저점 대비 — 카드 그림이 쓴 것과 같은 값이어야 한다. 카드가 안 그렸으면 캡션도 안 쓴다. */
const lowLine = card.chart?.lowLine;
const lowPct = lowLine ? lowLine.text2.replace(/^저점대비\s*/, "") : null;

const specPlain = (card.spec ?? []).map((x) => x.replace(/<[^>]+>/g, " | "));
const hhld = m.hhld?.hhld ? `${m.hhld.hhld.toLocaleString("ko-KR")}세대 단지입니다.` : "";
const buildYear = (specPlain[0] ?? "").match(/(\d{4})년 준공/)?.[1];
const area = (specPlain[1] ?? "").match(/전용 ([\d.]+)/)?.[1];
const floor = (specPlain[1] ?? "").match(/(\d+)층/)?.[1];
const park = (specPlain[2] ?? "").match(/([\d.]+)대/)?.[1];

const dealDate = m.provenance?.[0] ?? "";
const contract = card.kicker.match(/(\d{4})\.(\d{2})\.(\d{2})/);
const contractLab = contract ? `${Number(contract[2])}월 ${Number(contract[3])}일` : "";

const gu = m.region?.gu ?? "";
const guTag = gu.replace(/[시군구]$/, "") || "수도권";
const station = card.station?.name;

/* ── 걸어온 길 — 카드 곡선에서 뽑은 마디만 적는다(없는 마디를 만들지 않는다) */
const road = [];
road.push(`· ${ym(first.ym)} ${first.eok}`);
if (low && low.ym !== first.ym) road.push(`· ${ym(low.ym)} ${low.eok} — 2020년 이후 최저점`);
/* "2021.09월" → "2021년 9월". 앞의 0 을 남기면 다른 줄과 표기가 어긋난다. */
const cycWhen = cyc ? cyc.when.replace(/^(\d{4})\.0?(\d+)월$/, (_, y, mm) => `${y}년 ${Number(mm)}월`) : "";
if (cyc) road.push(`· ${cycWhen} ${cyc.peak} — 지난 사이클 고점`);
road.push(`· ${ym(last.ym)} ${last.eok} — 이번 신고가`);

const lines = [];
lines.push(`${apt} ${pyeong}, ${card.price} 신고가입니다 🔥`);
lines.push("");
lines.push(
  `${contractLab}, ${apt} 전용 ${area}㎡ ${floor}층이` +
    `\n${card.price}에 팔렸습니다.` +
    (buildYear ? ` ${buildYear}년 준공, ` : " ") +
    hhld,
);
if (park) lines.push(`세대당 주차는 ${park}대입니다.`);
if (station) lines.push(`가장 가까운 역은 ${station}입니다.`);
lines.push("");
lines.push("📈 이 집이 걸어온 길");
lines.push(...road);
lines.push("");
if (cyc) lines.push(`지난 사이클 고점 ${cyc.peak}과 견주면 ${cyc.vs}입니다.`);
if (lowPct && low) lines.push(`2020년 이후 최저점 ${low.eok}과 견주면 ${lowPct}입니다.`);
if (m.prevPeak?.date) {
  const [py, pm, pd] = m.prevPeak.date.split("-");
  lines.push(`직전 최고가는 ${Number(pm)}월 ${Number(pd)}일 ${m.prevPeak.eok}이었습니다.` + (py !== last.ym.slice(0, 4) ? ` (${py}년)` : ""));
}
lines.push("");
lines.push(`곡선은 거래가 있던 ${curve.length}개월의 그달 최고가를 이은 것입니다.`);
lines.push("같은 평형도 층·향에 따라 값이 다릅니다.");
lines.push("");
lines.push("📌 저장해두고 우리 동네 신고가 확인하기");
lines.push("");
lines.push("—");
lines.push("📊 출처 : 국토교통부 아파트 매매 실거래가 (상세자료)");
lines.push(`📅 기간 : 2020.01 ~ ${last.ym.slice(0, 4)}.${last.ym.slice(4)} (계약일 기준, 직거래 제외)`);
lines.push(`📐 ${pyeong} = 전용 ${String(area).startsWith("5") ? "59" : "84"}타입 관용 환산 (단지에 따라 ±1평)`);
lines.push("");
lines.push(`#${guTag}아파트 #${apt.replace(/[()\s]/g, "")} #신고가 #아파트실거래가 #위릿노트`);

const label = arg("out") ?? basename(src, ".json");
const outDir = join(ROOT, "data/review/captions");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${label}.txt`);
writeFileSync(outPath, lines.join("\n").replace(/\n{3,}/g, "\n\n") + "\n", "utf8");

console.log(
  `${outPath.replace(ROOT + "/", "")}\n` +
    `  ${apt} ${pyeong} ${card.price} · 걸어온 길 ${road.length}마디 · 해시태그 5개\n` +
    `  ⚠️ 초안입니다 — 카드에 없는 사실을 덧붙이지 마세요. 서명은 apply-signature 가 붙입니다.` +
    (dealDate ? `\n  판정 근거: ${dealDate}` : ""),
);
