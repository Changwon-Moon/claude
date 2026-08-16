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
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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

/* ── 지역 해시태그
 * "수원시영통구"를 그대로 쓰면 `#수원시영통아파트` 가 되는데 **아무도 그렇게 검색하지 않는다**
 * (2026-08-16 늘푸른벽산·화서역푸르지오에서 실제로 그렇게 나갔다).
 *
 * 시와 구가 붙어 있으면 **시를 쓴다**(수원시영통구 → `#수원아파트`).
 * 둘 다 내고 싶지만 캡션 검수가 해시태그를 5개로 제한한다 — 지역 태그는 한 자리뿐이고,
 * 그 한 자리에는 사람들이 실제로 검색하는 넓은 이름이 들어가는 게 맞다.
 * (서울은 시가 특별시 하나라 지금처럼 구를 쓴다 — 성북구 → `#성북아파트`.) */
const gu = m.region?.gu ?? "";
const guSplit = gu.match(/^(.+?시)(.+?구)$/);
const guTag = (guSplit ? guSplit[1] : gu).replace(/[시군구]$/, "") || "수도권";
const station = card.station?.name;

/* "2021.09월" → 정렬용 "202109". 앞의 0 을 살려야 문자열 비교가 맞는다. */
const cycYm = cyc ? cyc.when.replace(/^(\d{4})\.(\d+)월$/, (_, y, mm) => y + String(mm).padStart(2, "0")) : "";

/* ── 걸어온 길 — 카드 곡선에서 뽑은 마디만 적는다(없는 마디를 만들지 않는다).
 *
 * ⚠️ 마디는 **반드시 시간순**이어야 한다 (2026-08-16b).
 * 예전엔 시작 → 최저점 → 사이클고점 순서로 못박아 넣었는데, **최저점이 사이클 고점보다
 * 나중인 단지가 흔하다**(2021년 고점 → 2023년 바닥 → 지금 신고가). 그러면 "걸어온 길"이
 * 2023년 다음에 2021년을 말하며 시간을 거슬러 간다 — 그날 만든 5장 중 3장이 그랬다.
 * 양 끝(시작·이번 신고가)은 고정이고 **가운데 마디만 날짜로 정렬**해서 넣는다. */
const mid = [];
if (low && low.ym !== first.ym) mid.push({ ym: low.ym, t: `· ${ym(low.ym)} ${low.eok} — 2020년 이후 최저점` });
if (cyc) mid.push({ ym: cycYm, t: `· ${ym(cycYm)} ${cyc.peak} — 지난 사이클 고점` });
mid.sort((a, b) => a.ym.localeCompare(b.ym));

const road = [];
/* 시작점이 곧 최저점이면 그 자리에 라벨을 붙인다 — 아래에서 "최저점"을 견주는데
   걸어온 길에 그 마디가 없으면 근거가 붕 뜬다. */
road.push(`· ${ym(first.ym)} ${first.eok}` + (low && low.ym === first.ym ? " — 2020년 이후 최저점" : ""));
road.push(...mid.map((x) => x.t));
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
  /* 지난 사이클 고점과 **같은 거래**면 한 번만 말한다.
     같은 사건을 두 이름으로 말하면 읽는 사람은 서로 다른 두 거래로 읽는다
     (2026-08-16 늘푸른벽산: 2021.09 5.8억이 사이클 고점이자 직전 최고가였다). */
  const sameAsCycle = cyc && cycYm === `${py}${pm}` && cyc.peak === m.prevPeak.eok;
  /* 연도는 **앞에** 붙인다. 뒤에 괄호로 달면 "11월 22일 …이었습니다. (2025년)" 처럼
     날짜를 다 읽고 나서야 연도를 알게 된다. */
  const yPre = py !== last.ym.slice(0, 4) ? `${py}년 ` : "";
  if (!sameAsCycle) lines.push(`직전 최고가는 ${yPre}${Number(pm)}월 ${Number(pd)}일 ${m.prevPeak.eok}이었습니다.`);
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
/* 📐 평 각주 — **실측이면 실측이라고 말한다** (오너 2026-08-16d)
   예전엔 "관용 환산 (단지에 따라 ±1평)"이라 적었다. 그 각주가 사실이어서 적은 것인데,
   뒤집어 보면 **카드가 스스로 "이 값은 정확하지 않다"고 자백**하고 있었다는 뜻이다.
   이제 공급면적을 건축물대장에서 실측하므로 그 변명이 필요 없다 —
   근거(공급 ㎡)를 적고 '환산'이라는 말을 쓰지 않는다.
   실측이 없는 옛 카드는 종전 문구 그대로 둔다(없는 근거를 적지 않는다). */
{
  const sa = m.supplyArea;
  lines.push(
    sa?.supply
      ? `📐 ${pyeong} = 공급면적 ${sa.supply}㎡ · 전용 ${area}㎡ (건축물대장 기준)`
      : `📐 ${pyeong} = 전용 ${String(area).startsWith("5") ? "59" : "84"}타입 관용 환산 (단지에 따라 ±1평)`,
  );
}
lines.push("");
lines.push(`#${guTag}아파트 #${apt.replace(/[()\s]/g, "")} #신고가 #아파트실거래가 #위릿노트`);

const label = arg("out") ?? basename(src, ".json");
const outDir = join(ROOT, "data/review/captions");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${label}.txt`);

/* ── ⛔ 이미 확정된 캡션은 덮지 않는다 (2026-08-16b 사고)
 * 이 생성기는 **초안**을 만든다. 확정된 캡션은 그 뒤에 사람이 문장을 다듬고
 * 고정 서명까지 붙인 결과물이라, 여기서 다시 쓰면 **그 손질이 통째로 날아간다.**
 * 실제로 광명한진타운(확정본)을 이 스크립트로 덮어써서 되살려야 했다.
 * 그래서 sets.json 의 `state` 가 "오너 확정"이면 멈춘다 — 정말 다시 쓸 거면 --force. */
const setsPath = join(ROOT, "data/review/sets.json");
if (existsSync(setsPath) && !argv.includes("--force")) {
  const raw = JSON.parse(readFileSync(setsPath, "utf8"));
  const sets = Array.isArray(raw) ? raw : raw.sets ?? [];
  const owner = sets.find((s) => s.caption === label && s.state === "오너 확정");
  if (owner) {
    console.error(
      `⛔ '${label}' 은 이미 확정된 캡션입니다 (세트: ${owner.label}, ${owner.confirmedAt ?? "확정일 미상"}).\n` +
        `   확정본에는 사람이 다듬은 문장과 고정 서명이 들어 있어 다시 쓰면 사라집니다.\n` +
        `   정말 다시 만들 거면 --force 를 붙이고, 만든 뒤 서명을 다시 붙이세요.`,
    );
    process.exit(1);
  }
}

writeFileSync(outPath, lines.join("\n").replace(/\n{3,}/g, "\n\n") + "\n", "utf8");

console.log(
  `${outPath.replace(ROOT + "/", "")}\n` +
    `  ${apt} ${pyeong} ${card.price} · 걸어온 길 ${road.length}마디 · 지역태그 #${guTag}아파트\n` +
    `  ⚠️ 초안입니다 — 카드에 없는 사실을 덧붙이지 마세요. 서명은 apply-signature 가 붙입니다.` +
    (dealDate ? `\n  판정 근거: ${dealDate}` : ""),
);
