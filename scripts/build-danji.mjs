/**
 * 청약·분양 카드 빌더 — 표준 판형 `danji-cover@1` (오너 확정 2026-08-03).
 *
 * 이 스크립트가 청약·분양 카드의 **유일한** 빌더다. 판형도 하나뿐이다.
 * 기준 문서: docs/guides/청약분양-카드-기준.md (읽지 않고 손대지 말 것)
 *
 * ── 카드가 말하는 것 (순서 고정)
 *   고정 부제 "오늘의 주요 청약 이슈 (날짜)" — 날짜 자동
 *   → 조감도(표지) → 제목 한 줄 → 단지명 → 주소
 *   → 타입별 분양가(최고가 기준) — 면적대마다 대표타입 하나씩 전부
 *   → 세대수 / 동수 / 최고 층수
 *   → 특공 / 1순위 / 당첨자 발표 / 입주 예정
 *   → 특이사항 한 줄(분상제·전매제한 등)
 *
 * ── 사실의 원천 (오보 0)
 *  · `applyhomeNo` 가 있으면 세대수·특공일·1순위일·당첨자발표일·입주예정월·분양가상한제를
 *    **청약홈 수집분(applyhome-latest.json)에서 코드가 직접 읽는다.** 손으로 옮기지 않는다.
 *    데이터셋에 같은 값이 적혀 있고 다르면 **던진다** — 사람이 눈으로 고르게 두지 않는다.
 *  · 청약홈에 없는 것(동수·층수·전용면적 구성·분양가)만 데이터셋에 둔다.
 *  · ⚠️ 분양가는 청약홈 API 가 주지 않는다. 보도값으로 만들어 두더라도
 *    **입주자모집공고문 대조 전까지 발행 금지**다.
 *
 * ── 대표평형 (오너 지시)
 * 84A~D 가 여러 개여도 면적대마다 **하나만** 적는다. 주력 면적대(mainArea)가 있으면 그것,
 * 없으면 국민평형(84㎡), 그것도 없으면 타입이 가장 많은 면적대를 고른다.
 * 어느 쪽이든 **코드가 고른다** — "이 칸"이라고 손으로 박지 않는다(CARD_CHECKLIST §3).
 *
 * 실행: node scripts/build-danji.mjs [날짜=오늘]
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
/** 짧은 표기 — 773,000,000 → "7.7억" (오너 지정 형식 00.0억, 2026-08-03).
 *  소수 1자리로 반올림한다. 표시 정밀도가 0.1억이므로 그 아래는 카드가 말하지 않는다 —
 *  정확한 금액은 캡션·모집공고가 갖고 있다. */
const eok1 = (v) => `${(v / 100000000).toFixed(1)}억`;

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

/**
 * 평형별 대표타입 표 (오너 지시 2026-08-03).
 * "평형이 여러 개인데 왜 84만 했어. **평형별 대표타입만을 쓰되, 여러 평형은 다 넣어야지.**"
 * → 면적대마다 타입 하나(A·P 등 첫 실제 타입)만 뽑아 **전부** 적는다. 84A~D 를 네 줄로 늘리지 않는다.
 * 분양가가 없는 면적은 '미고지'로 남긴다 — 줄을 지우면 그 평형이 없는 줄 안다.
 */
function priceTable(d, total) {
  const rows = d.areas.map((a) => {
    const t = (a.types || []).find((x) => x && x !== "-") || "";
    const hit = d.price?.byArea?.find((x) => x.m2 === a.m2);
    return {
      area: `${a.m2}${t}`,
      price: hit ? eok1(hit.won) : "미고지",
      /* 주력 면적대 한 줄만 코발트로. 강조가 둘이면 강조가 아니다. */
      main: d.mainArea?.m2 === a.m2,
    };
  });
  if (rows.length > 6)
    throw new Error(`${d.id}: 면적대가 ${rows.length}개다 — 판이 카드를 넘긴다. 데이터에서 묶을 것`);
  /* 머리글은 한 덩어리로 쓴다(오너 지시 2026-08-03): "타입별 분양가(최고가 기준)".
     이전엔 왼쪽 라벨과 오른쪽 단서를 갈라 놨는데, 둘은 한 문장이라 붙여 읽어야 뜻이 산다. */
  const basis = d.price?.headline?.note || (d.price?.byArea ? "최고가 기준" : "");
  return {
    head: [basis ? `타입별 분양가(${basis})` : "타입별 분양가"],
    /* 열 수는 개수가 정한다 — 4 이하면 한 줄로 펴고, 5~6이면 3열 두 줄.
       손으로 "2열"이라 박으면 평형이 셋인 단지에서 한 칸이 빈다. */
    cols: rows.length <= 4 ? rows.length : 3,
    rows,
  };
}

/* ── 제목 ──
 * 오너가 안을 골랐다(2026-08-03): **"{hook} 분양가 N억대?"**.
 * 변형 실험은 끝났으므로 그 형태 하나만 남긴다 — 선택지를 코드에 남겨 두면 다음 사람이
 * 무엇이 정답인지 다시 고민한다(CEO 07-23 "승인된 구성은 임의로 바꾸지 않는다").
 * 숫자·훅은 전부 데이터에서 온다. 값이 없으면 규모 문장으로 떨어진다. */
function titleFor(d, { total, repWon }) {
  const hook = d.hook || d.location.split(" ").slice(1, 2).join("") || d.location;
  const eokRound = repWon ? Math.floor(repWon / 100000000) : null;
  /* 오너 확정 문형(2026-08-03): "{훅} 아파트 분양가 {N}억대?" — 훅과 금액 **둘 다** 파랑.
     강조가 둘이지만 같은 문장의 주어와 술어라 초점이 갈리지 않는다. */
  return eokRound
    ? [`<span class="hi">${hook}</span> 아파트 분양가 <span class="hi">${eokRound}억대</span>?`]
    : [`<span class="hi">${hook}</span> 아파트 <span class="hi">${n(total)}가구</span>`];
}

/**
 * 왼쪽 단 — 단지의 몸집(오너 지시 2026-08-03).
 *   ① 세대수 합계 + (APT n | OT n) 작은 회색 내역
 *   ② 0개동 | 최고 00층
 *   ③ 주소(읍면동까지)
 * 오피스텔이 없으면 내역 줄을 만들지 않는다 — "OT 0" 은 0실 공급으로 읽힌다.
 */
/**
 * 제원 3분할 — **전부 순수 수치**로 맞춘다(2026-08-03 재구성).
 * @2 에서는 "12개동 | 최고 38층"을 한 칸에 넣었는데, 문장형 값과 큰 숫자를 같은 자로 재니
 * 긴 쪽이 짧은 쪽을 끌어내려 세대수까지 작아졌다. 칸을 쪼개면 셋 다 크게 앉는다.
 */
function specCells(d, aptTotal) {
  const ot = d.extra?.officetel ?? 0;
  return [
    {
      label: "세대수",
      value: n(aptTotal + ot),
      unit: "세대",
      /* 내역은 값 바로 아래 회색 한 줄(오너 지정 표기 2026-08-03: "(APT 0000세대, OT 000실)").
         오피스텔이 없으면 만들지 않는다 — "OT 0실"은 0실 공급으로 읽힌다. */
      ...(ot ? { breakdown: `(APT ${n(aptTotal)}세대, OT ${n(ot)}실)` } : {}),
    },
    { label: "동수", value: String(d.buildings), unit: "개동" },
    /* "최고"는 숫자를 수식하는 말이라 값 앞에 붙는다 — 라벨 줄을 지운 판형(danji-c)에서
       "38층"만 남으면 그게 최고층인지 평균층인지 카드가 말하지 못한다. */
    { label: "최고 층수", pre: "최고", value: String(d.topFloor), unit: "층" },
  ];
}

/**
 * 수치를 뒷받침하는 한 줄 — 내역과 주소.
 * 오피스텔이 없으면 그 조각을 만들지 않는다("OT 0" 은 0실 공급으로 읽힌다).
 * 주소는 읍면동까지(오너 지정).
 */
/* 주소는 조감도 바로 아래에 붙는다(오너 지시). 사진이 "어디"를 보여주면
   다음 줄이 그 "어디"를 글로 못박는다 — 떨어뜨리면 두 요소가 남남이 된다. */
const addressOf = (d) => d.location || "";

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
  /* 특이사항 앞의 아이콘(오너 지시 2026-08-03) — 규제 항목마다 성격이 다른 그림 하나.
     💡 = 상한제(알아 두면 이득), 🚫 = 전매제한(못 하는 것), ⚠️ = 투기과열지구(주의).
     크기는 본문보다 작게, 투명도를 낮춰 **글자를 이기지 않게** 둔다(.dcv-note .em). */
  const flags = [];
  if (ah?.priceCap ?? d.price?.capApplied)
    flags.push(`<i class="em">💡</i><span class="tag">분양가상한제</span> 적용`);
  if (d.price?.resaleBanYears) flags.push(`<i class="em">🚫</i>전매제한 ${d.price.resaleBanYears}년`);
  if (ah?.speculative) flags.push(`<i class="em">⚠️</i>투기과열지구`);
  /* 오피스텔은 이제 위 스트립이 말한다 — 한 카드에서 같은 말을 두 번 하지 않는다 */

  return {
    template: "danji-cover@1",
    date,
    kind: "presale",
    /* 고정 부제 + 날짜. 손으로 적지 않는다 — 적는 순간 다음 카드에서 날짜가 굳는다. */
    topcap: `오늘의 주요 청약 이슈 (${date.replace(/-/g, ".")})`,
    titleLines: titleFor(d, { total, repWon }),
    hero: d.photo
      ? { photo: d.photo.file, credit: d.photo.credit }
      : { photo: "seoul-apart-night.jpg", credit: "조감도 미확보", placeholder: true },
    danji: { name: d.name, ...(d.logo ? { logo: d.logo } : {}), ...(d.company ? { company: d.company } : {}) },
    address: addressOf(d),
    spec: specCells(d, total),
    priceTable: priceTable(d, total),
    /* 일정 4칸(오너 지시 2026-08-03) — 특공·1순위·당첨자 발표·입주 예정.
       당첨자 발표일은 청약홈 PRZWNER_PRESNATN_DE 에서 수집기가 이미 읽어 둔다(announceDate). */
    schedule: [
      { label: "특별공급", date: ah?.specialFrom ? md(ah.specialFrom) : "미고지", tbd: !ah?.specialFrom },
      { label: "1순위", date: ah?.rank1From ? md(ah.rank1From) : "미고지", tbd: !ah?.rank1From },
      { label: "당첨자 발표", date: ah?.announceDate ? md(ah.announceDate) : "미고지", tbd: !ah?.announceDate },
      { label: "입주 예정", date: ymKo(moveInYm), tbd: !moveInYm },
    ],
    notice: flags.join(" · "),
    source: {
      /* 푸터 출처 줄 = **1차 출처만**. 오너 지시(2026-08-03)로 보도(파이낸셜뉴스)를 뺐다.
         ⚠️ 전제: 분양가를 입주자모집공고문으로 확정한 뒤에야 이 줄이 참이 된다.
            보도값을 그대로 두고 보도 출처만 지우면 출처 없는 숫자가 된다 — 발행 게이트에서 막는다.
         '한국부동산원'도 뺀다 — 청약홈은 한국부동산원이 운영하는 자체 브랜드라
         함께 적으면 같은 기관을 두 번 말하는 것이다. */
      name: d.source.name.replace(/^한국부동산원\s+/, ""),
      /* 조감도 출처. 사진 위 표기는 오너 지시로 지웠지만(2026-08-03) 표기 자체를 없애지는
         않는다 — 건설사 저작물이다. "출처." 접두는 푸터 줄이 이미 갖고 있으므로 벗긴다. */
      ...(d.photo?.credit ? { photo: d.photo.credit.replace(/^\s*출처[.·:]?\s*/, "") } : {}),
    },
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
  const repWon = d.price?.unit59Won ?? null;
  const md = (iso) => { const [, m, dd] = iso.split("-"); return `${Number(m)}/${Number(dd)}`; };
  const ymKo = (ym) => (ym ? `${ym.split("-")[0]}년 ${Number(ym.split("-")[1])}월` : "미고지");

  const flags = [];
  if (d.price?.capApplied) flags.push(`<i class="em">💡</i><span class="tag">분양가상한제</span> 적용`);
  if (d.record) flags.push(d.record.claim);

  return {
    template: "danji-cover@1",
    date,
    kind: "result",
    topcap: `오늘의 주요 청약 이슈 (${date.replace(/-/g, ".")})`,
    titleLines: [`1순위 <span class="up">${n(first.shown)}대 1</span>`],
    hero: d.photo
      ? { photo: d.photo.file, credit: d.photo.credit }
      : { fallbackColor: "#101418", fallbackWord: "ACRO" },
    danji: { name: d.name, ...(d.logo ? { logo: d.logo } : {}) },
    spec: [
      { label: "세대수", value: n(d.total), unit: "세대" },
      { label: "동수", value: String(d.buildings), unit: "개동" },
      /* 결과 카드의 세 번째 칸은 경쟁률이다 — 이 카드의 주인공이 층수는 아니다.
         표준 판형은 제원 라벨을 그리지 않으므로 "1순위"를 값 앞에 붙여 뜻을 지킨다. */
      { label: "1순위 경쟁률", pre: "1순위", value: n(first.shown), unit: "대 1" },
    ],
    address: addressOf(d),
    priceTable: priceTable(d, d.total),
    schedule: [
      { label: "특별공급", date: md(d.schedule.special) },
      { label: "1순위", date: md(d.schedule.first) },
      { label: "입주 예정", date: ymKo(d.moveIn) },
    ],
    notice: flags.join(" · "),
    /* 결과 카드의 경쟁률은 청약홈 집계 + 보도에서 온다 — 분양 예정 카드와 달리 보도를 남긴다.
       숫자가 실제로 어디서 왔는지가 푸터의 유일한 기준이다. */
    source: { name: `${d.source.name.replace(/^한국부동산원\s+/, "")} · ${d.source.via.split(" · ")[0]}` },
  };
}

/* ── 산출 ── 시안이므로 data/out/_spike. 확정되면 data/content/{날짜}/ 로 옮기고 세트에 등록한다. */
const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });

const cards = [
  ["danji-hangang", presale(byId("hangang-prugio-riverfront"))],
  ["danji-sangdong", presale(byId("sangdong-lotte-castle"))],
  ["danji-sangok", presale(byId("sangok-xi-hillstate"))],
  ["danji-acro", result(byId("acro-de-seocho"))],
];

for (const [slug, card] of cards) {
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");
  console.log(`${slug} — ${card.danji.name}`);
  console.log(`   ${card.topcap} · ${card.titleLines.join(" ").replace(/<[^>]+>/g, "")}`);
  console.log(`   ${card.spec.map((c) => `${c.label} ${c.value}${c.unit || ""}`).join(" · ")}`);
  if (card.address) console.log(`   ${card.address}`);
  console.log(`   평형 ${card.priceTable.rows.map((r) => `${r.area} ${r.price}`).join(" · ")}`);
  console.log(`   일정 ${card.schedule.map((s) => `${s.label} ${s.date}`).join(" · ")}`);
}
console.log("\n⚠ 분양가는 보도값이다 — 입주자모집공고문 대조 전까지 발행 금지.");
