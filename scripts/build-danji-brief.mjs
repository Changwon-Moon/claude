/**
 * 청약단지 브리핑 카드 — danji-brief@2.
 * 🧪 시안. 분양가는 보도값이라 아직 verified 가 아니다(청약홈 API 는 분양가를 주지 않는다).
 *
 * ── @2 에서 오너가 지시한 판형 (2026-08-03)
 *   최상단 고정 부제 "오늘의 주요 청약 이슈 (날짜)" — 날짜 자동
 *   → 제목 **한 줄, 폰트 최대**
 *   → 조감도
 *   → 단지명 (주소·시공사 줄 삭제)
 *   → [세대수 | 최고층]
 *   → [대표평형 | 분양가]
 *   → [특공 | 1순위 | 입주예정월]
 *   → 특이사항 한 줄(분상제·전매제한 등)
 *
 * ── 사실의 원천
 *  · `applyhomeNo` 가 있으면 세대수·특공일·1순위일·입주예정월·분양가상한제를
 *    **청약홈 수집분(applyhome-latest.json)에서 코드가 직접 읽는다.** 손으로 옮기지 않는다.
 *    데이터셋에 같은 값이 적혀 있고 다르면 던진다 — 사람이 눈으로 고르게 두지 않는다.
 *  · 청약홈에 없는 것(동수·층수·전용면적 구성·분양가)만 데이터셋에 둔다.
 *
 * ── 대표평형 (오너 지시)
 * 84A~D 가 여러 개여도 카드에는 **하나만** 적는다. 주력 면적대(mainArea)가 있으면 그것,
 * 없으면 국민평형(84㎡), 그것도 없으면 타입이 가장 많은 면적대를 고른다.
 * 어느 쪽이든 **코드가 고른다** — "이 칸"이라고 손으로 박지 않는다(CARD_CHECKLIST §3).
 *
 * 실행: node scripts/build-danji-brief.mjs [date=오늘] [WIRIT_TITLE=a|b|c|…]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
/* 날짜는 인자로 받되 기본값은 오늘(KST)이다 — 오너 "날짜는 자동 연동".
   렌더 결정성을 위해 재생산 시에는 인자로 그날 날짜를 넘긴다. */
const date =
  process.argv[2] ||
  new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/bunyang-danji-2026.json"), "utf8"));

const byId = (id) => {
  const d = doc.danji.find((x) => x.id === id);
  if (!d) throw new Error(`단지 없음: ${id}`);
  return d;
};

const n = (v) => Number(v).toLocaleString("ko-KR");

/** 억 단위 한글 표기 — 1,860,000,000 → "18억 6,000만원" */
function won(v) {
  if (!Number.isInteger(v)) throw new Error(`won(): 정수 원단위만 받는다 — ${v}`);
  const eok = Math.floor(v / 100000000);
  const man = Math.floor((v % 100000000) / 10000);
  if (!eok) return `${n(man)}만원`;
  return man ? `${n(eok)}억 ${n(man)}만원` : `${n(eok)}억원`;
}
/** 스트립용 짧은 표기 — 773,000,000 → "7.73억" (오너 지정 형식 0.00억) */
const eok2 = (v) => `${(v / 100000000).toFixed(2)}억`;

/** 경쟁률은 받아 적지 않고 계산한다. 보도값과 벌어지면 던진다. */
function ratio(row) {
  const shown = Math.floor(row.received / row.supply);
  if (row.reported != null && Math.abs(shown - row.reported) > 1)
    throw new Error(
      `경쟁률 불일치 — ${row.label}: 계산 ${shown}대 1 vs 보도 ${row.reported}대 1 (${n(row.received)}건 ÷ ${row.supply}가구)`,
    );
  return shown;
}

/* ── 청약홈 1차 출처 병합 ── */
function applyhome(d) {
  if (!d.applyhomeNo) return null;
  const p = join(ROOT, "data/datasets/applyhome-latest.json");
  if (!existsSync(p))
    throw new Error(`청약홈 수집 결과가 없다 — data/applyhome-queue.txt 로 수집을 먼저 건다 (${d.id})`);
  const hit = (JSON.parse(readFileSync(p, "utf8")).notices || []).find((x) => x.pblancNo === d.applyhomeNo);
  if (!hit)
    throw new Error(
      `청약홈 최신 수집분에 공고번호 ${d.applyhomeNo} 가 없다 (${d.id}) — 접수가 끝나 목록에서 빠졌을 수 있다`,
    );
  if (d.total != null && d.total !== hit.supply)
    throw new Error(`총 세대수 불일치 — 데이터셋 ${d.total} vs 청약홈 ${hit.supply} (${d.id})`);
  return hit;
}

/**
 * 대표평형 하나를 **코드가 고른다**. 84A~D 를 다 적지 않는다(오너 지시 2026-08-03).
 * 고르는 순서: ① 주력 면적대(mainArea) ② 국민평형 84㎡ ③ 타입이 가장 많은 면적대.
 */
function repArea(d) {
  const pick =
    (d.mainArea && d.areas.find((a) => a.m2 === d.mainArea.m2)) ||
    d.areas.find((a) => a.m2 === 84) ||
    d.areas.reduce((a, b) => (b.types.length > a.types.length ? b : a));
  const t = (pick.types || []).find((x) => x && x !== "-") || "";
  return { m2: pick.m2, label: `${pick.m2}${t}`, units: d.mainArea?.m2 === pick.m2 ? d.mainArea.units : null };
}

/** 대표평형의 분양가. byArea 에 그 면적이 없으면 null — 없는 값을 지어내지 않는다. */
function repPrice(d, rep) {
  const hit = d.price?.byArea?.find((x) => x.m2 === rep.m2);
  return hit ? hit.won : null;
}

/* ── 제목 안 ──
 * 어느 안이든 **숫자는 전부 데이터에서** 온다. 손으로 적은 수치는 없다.
 * 한 줄이 기본이다(오너 "한 줄로 제목 폰트는 최대로"). */
const TITLE_VARIANT = process.env.WIRIT_TITLE || "a";
function titleFor(d, { total, rep, repWon, ah }) {
  const eokRound = repWon ? Math.floor(repWon / 100000000) : null;
  /* hook = 그 단지의 한 마디(데이터에 적는다). 없으면 지역명으로 떨어진다 —
     "한강뷰" 같은 말을 코드에 박으면 다음 단지에서 거짓말이 된다. */
  const hook = d.hook || d.location.split(" ").slice(1, 2).join("") || d.location;
  /* "경기 김포시 고촌읍" → "김포". 시·군·구 접미사를 떼야 말이 자연스럽다("김포시인데" ✕) */
  const city = (d.location.split(" ")[1] || d.location).replace(/(특별시|광역시|시|군|구)$/, "");
  const pctMain = d.mainArea ? Math.round((d.mainArea.units / total) * 10) : null;

  /* 값이 없는 안은 null 을 돌려주고 규모 안으로 떨어진다 — 없는 수치로 제목을 짓지 않는다. */
  const V = {
    a: () => (eokRound ? [`${hook} 분양가 <span class="hi">${eokRound}억대</span>?`] : null),
    b: () => (repWon ? [`${city}인데 <span class="hi">${eok2(repWon)}</span>, 비싼가`] : null),
    c: () => [`${hook} <span class="hi">${n(total)}가구</span> 나온다`],
    d: () => (repWon && (ah?.priceCap ?? d.price?.capApplied) ? [`상한제 걸고도 <span class="hi">${eok2(repWon)}</span>`] : null),
    e: () =>
      ah?.rank1From && eokRound
        ? [`${Number(ah.rank1From.split("-")[1])}/${Number(ah.rank1From.split("-")[2])} 1순위, <span class="hi">${eokRound}억대</span>`]
        : null,
    f: () => (pctMain ? [`10집 중 ${pctMain}집이 <span class="hi">${rep.m2}㎡</span>`] : null),
  };
  return (V[TITLE_VARIANT] || V.a)() || V.c();
}

/* ────────────────────────────────────────────────────────────────
 * 분양 예정 카드
 * ──────────────────────────────────────────────────────────────── */
function presale(d) {
  if (d.kind !== "presale") throw new Error(`${d.id} 는 presale 이 아니다`);
  const ah = applyhome(d);
  const total = ah ? ah.supply : d.total;
  const rep = repArea(d);
  const repWon = repPrice(d, rep);
  const md = (iso) => { const [, m, dd] = iso.split("-"); return `${Number(m)}/${Number(dd)}`; };
  const ymKo = (ym) => (ym ? `${ym.split("-")[0]}년 ${Number(ym.split("-")[1])}월` : "미고지");
  const moveInYm = ah?.moveInYm ?? d.moveIn ?? null;

  /* 특이사항 — 규제·조건 중 **확인된 것만** 적는다. 없으면 그 자리는 비운다. */
  const flags = [];
  if (ah?.priceCap ?? d.price?.capApplied) flags.push(`<span class="tag">분양가상한제</span> 적용`);
  if (d.price?.resaleBanYears) flags.push(`전매제한 ${d.price.resaleBanYears}년`);
  if (ah?.speculative) flags.push("투기과열지구");
  if (d.extra?.officetel) flags.push(`오피스텔 ${n(d.extra.officetel)}실 별도`);

  return {
    template: "danji-brief@2",
    date,
    kind: "presale",
    /* 고정 부제 + 날짜. 손으로 적지 않는다 — 적는 순간 다음 카드에서 날짜가 굳는다. */
    topcap: `오늘의 주요 청약 이슈 (${date.replace(/-/g, ".")})`,
    titleLines: titleFor(d, { total, rep, repWon, ah }),
    hero: d.photo
      ? { photo: d.photo.file, credit: d.photo.credit }
      : { photo: "seoul-apart-night.jpg", credit: "조감도 미확보", placeholder: true },
    danji: { name: d.name, ...(d.logo ? { logo: d.logo } : {}), ...(d.company ? { company: d.company } : {}) },
    strips: [
      [
        { label: "총 세대수", value: n(total), unit: "가구" },
        { label: "최고 층수", value: String(d.topFloor), unit: "층" },
      ],
      [
        { label: "대표평형", value: rep.label },
        repWon
          ? { label: "분양가", value: eok2(repWon), key: true }
          : { label: "분양가", value: "미고지" },
      ],
    ],
    schedule: [
      { label: "특별공급", date: ah?.specialFrom ? md(ah.specialFrom) : "미고지", tbd: !ah?.specialFrom },
      { label: "1순위", date: ah?.rank1From ? md(ah.rank1From) : "미고지", tbd: !ah?.rank1From },
      { label: "입주 예정", date: ymKo(moveInYm), tbd: !moveInYm },
    ],
    notice: flags.join(" · "),
    source: { name: `${d.source.name} · ${d.source.via.split(" · ")[0]}` },
  };
}

/* ────────────────────────────────────────────────────────────────
 * 청약 결과 카드 — 자리는 같고 두 칸의 뜻만 바뀐다
 * ──────────────────────────────────────────────────────────────── */
function result(d) {
  if (d.kind !== "result") throw new Error(`${d.id} 는 result 가 아니다`);
  const rows = d.apply.map((r) => ({ ...r, shown: ratio(r) }));
  const first = rows.find((r) => r.label === "1순위");
  if (!first) throw new Error("1순위 행이 있어야 한다");
  const rep = repArea(d);
  const repWon = d.price?.unit59Won ?? null;
  const md = (iso) => { const [, m, dd] = iso.split("-"); return `${Number(m)}/${Number(dd)}`; };
  const ymKo = (ym) => (ym ? `${ym.split("-")[0]}년 ${Number(ym.split("-")[1])}월` : "미고지");

  const flags = [];
  if (d.price?.capApplied) flags.push(`<span class="tag">분양가상한제</span> 적용`);
  if (d.record) flags.push(d.record.claim);

  return {
    template: "danji-brief@2",
    date,
    kind: "result",
    topcap: `오늘의 주요 청약 이슈 (${date.replace(/-/g, ".")})`,
    titleLines: [`1순위 <span class="up">${n(first.shown)}대 1</span>`],
    hero: d.photo
      ? { photo: d.photo.file, credit: d.photo.credit }
      : { fallbackColor: "#101418", fallbackWord: "ACRO" },
    danji: { name: d.name, ...(d.logo ? { logo: d.logo } : {}) },
    strips: [
      [
        { label: "총 세대수", value: n(d.total), unit: "가구" },
        { label: "1순위 경쟁률", value: `${n(first.shown)}대 1`, hi: true },
      ],
      [
        { label: "대표평형", value: rep.label },
        repWon ? { label: "분양가", value: eok2(repWon) } : { label: "분양가", value: "미고지" },
      ],
    ],
    schedule: [
      { label: "특별공급", date: md(d.schedule.special) },
      { label: "1순위", date: md(d.schedule.first) },
      { label: "입주 예정", date: ymKo(d.moveIn) },
    ],
    notice: flags.join(" · "),
    source: { name: `${d.source.name} · ${d.source.via.split(" · ")[0]}` },
  };
}

/* ── 산출 ── 시안이므로 data/out/_spike. 확정되면 data/content/{날짜}/ 로 옮기고 세트에 등록한다. */
const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });

const cards = [
  ["danji-brief-hangang", presale(byId("hangang-prugio-riverfront"))],
  ["danji-brief-sangdong", presale(byId("sangdong-lotte-castle"))],
  ["danji-brief-presale", presale(byId("sangok-xi-hillstate"))],
  ["danji-brief-result", result(byId("acro-de-seocho"))],
];

for (const [slug, card] of cards) {
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");
  console.log(`${slug} — ${card.danji.name}`);
  console.log(`   ${card.topcap} · ${card.titleLines.join(" ").replace(/<[^>]+>/g, "")}`);
  console.log(`   ${card.strips.flat().map((c) => `${c.label} ${c.value}${c.unit || ""}`).join(" · ")}`);
  console.log(`   일정 ${card.schedule.map((s) => `${s.label} ${s.date}`).join(" · ")}`);
}
console.log("\n⚠ 분양가는 보도값이다 — 입주자모집공고문 대조 전까지 발행 금지.");
