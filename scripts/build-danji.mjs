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
/* ⚠️ 위치로 읽지 않는다. `--only <id>` 를 앞에 쓰면 argv[2] 가 "--only" 가 되어
   카드 머리에 "오늘의 주요 청약 이슈 (..only)" 가 찍혔다(2026-08-04 실제 사고).
   날짜처럼 생긴 인자만 날짜로 받는다. */
const dateArg = process.argv.slice(2).find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const date =
  dateArg || new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/bunyang-danji-2026.json"), "utf8"));

/* ── 조감도 크롭은 **계산한다** ──
 * 표지 사진 칸은 446px 이고, 그림은 카드 폭(1080)에 맞춰 비율대로 그려진다.
 * 남는 세로(slack)의 42.5% 만큼 위에서 걷어내면 하늘이 적당히 남는다 —
 * 오너가 승인한 한강 카드(1200×660 → 렌더 594 → slack 148 → 63px)가 이 값이다.
 * **사진이 바뀌면 이 값도 바뀐다.** 그래서 CSS 에 박지 않고 매 빌드마다 원본에서 다시 잰다.
 * (docs/guides/청약분양-카드-기준.md "사진 위치는 계산한다") */
const PHOTO_BOX_H = 446;
const CARD_W = 1080;
const SKY_KEEP = 0.425;

/** JPEG/PNG 헤더에서 가로·세로를 읽는다. 외부 의존성 없이 — 빌드는 네트워크를 타지 않는다. */
function imageSize(file) {
  const b = readFileSync(file);
  if (b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  throw new Error(`이미지 크기를 못 읽는다(JPEG/PNG 만 지원): ${file}`);
}

/** 표지 사진의 끌어올림 px. 원본이 세로로 짧으면 칸을 못 채우므로 던진다. */
function heroShift(fileName) {
  const p = join(ROOT, "templates/_shared/photos", fileName);
  if (!existsSync(p)) throw new Error(`조감도 파일이 없다: templates/_shared/photos/${fileName}`);
  const { w, h } = imageSize(p);
  const renderH = Math.round((CARD_W * h) / w);
  if (renderH < PHOTO_BOX_H)
    throw new Error(
      `조감도가 가로로 너무 길다 — 1080px 폭에 맞추면 세로가 ${renderH}px 라 표지 칸(${PHOTO_BOX_H}px)을 못 채운다: ${fileName}`,
    );
  const shift = Math.round((renderH - PHOTO_BOX_H) * SKY_KEEP);
  /* 건설사 고지문은 원본 맨 아래에 박힌다 — 보이는 창이 하단 5% 를 건드리면 알려 준다. */
  if (shift + PHOTO_BOX_H > renderH * 0.95)
    console.log(`   ⚠ ${fileName}: 크롭 하단이 원본 아래 5% 에 닿는다 — 건설사 고지문이 보일 수 있다`);
  return shift;
}

const byId = (id) => {
  const d = doc.danji.find((x) => x.id === id);
  if (!d) throw new Error(`단지 없음: ${id}`);
  return d;
};

const n = (v) => Number(v).toLocaleString("ko-KR");
/** 요일은 코드가 날짜에서 계산한다 — 손으로 적으면 다음 카드에서 틀린다. */
const WD = "일월화수목금토";

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
const NEED_AREAS = (id) =>
  `${id}: 전용면적 구성(areas)이 비어 있다 — 청약홈은 평형을 주지 않으므로 입주자모집공고문에서 채워야 카드가 나온다`;

function repArea(d) {
  if (!d.areas?.length) throw new Error(NEED_AREAS(d.id));
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
  if (!d.areas?.length) throw new Error(NEED_AREAS(d.id));
  /* ── 무순위(줍줍) ──
   * 같은 밴드가 다른 것을 말한다. 청약홈은 무순위 분양가를 "사업주체 문의"로 감추므로
   * 분양가를 못 쓴다 — 대신 **면적대별 잔여 세대**를 얹는다. 줍줍에서 독자가 가장 먼저
   * 묻는 것도 "어떤 평형이 얼마나 남았나"다.
   * 칸의 뜻은 **데이터가 정하고** 템플릿은 배치만 한다(TEMPLATES.md §11). */
  if (d.kind === "remndr") {
    /* 여기서는 주력 면적대를 칠하지 않는다 — 이 카드의 강조는 제원의 '150세대' 하나다.
       밴드와 제원 양쪽을 칠하면 강조가 둘이 되어 어느 쪽도 강조가 아니게 된다(BRAND 규칙). */
    const rows = d.areas.map((a) => ({ area: `${a.m2}㎡`, price: `${n(a.units)}세대` }));
    const sum = d.areas.reduce((s, a) => s + a.units, 0);
    if (sum !== total)
      throw new Error(`${d.id}: 면적대별 잔여 세대 합 ${sum} ≠ 총 공급 ${total} — 어느 쪽이 틀렸는지 확인할 것`);
    if (rows.length > 6) throw new Error(`${d.id}: 면적대가 ${rows.length}개다 — 판이 카드를 넘긴다`);
    /* 잔여 세대 값("68세대")은 분양가("11.9억")보다 짧아 한 줄에 다섯까지 들어간다.
       두 줄로 접히면 종이 단이 길어져 푸터를 민다(검수가 잡았다) — 열 수는 값의 길이가 정한다. */
    return { head: ["전용면적별 잔여 세대"], cols: rows.length <= 5 ? rows.length : 3, rows };
  }
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
    : [`<span class="hi">${hook}</span> 아파트 <span class="hi">${n(total)}세대</span>`];
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
    /* 동수·층수는 청약홈이 주지 않는다 — 아직 못 채운 단지는 '미고지'로 남긴다. 지어내지 않는다. */
    d.buildings != null
      ? { label: "동수", value: String(d.buildings), unit: "개동" }
      : { label: "동수", value: "미고지", tbd: true },
    /* "최고"는 숫자를 수식하는 말이라 값 앞에 붙는다 — 라벨 줄을 지운 판형에서
       "38층"만 남으면 그게 최고층인지 평균층인지 카드가 말하지 못한다. */
    d.topFloor != null
      ? { label: "최고 층수", pre: "최고", value: String(d.topFloor), unit: "층" }
      : { label: "최고 층수", value: "미고지", tbd: true },
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
  /* 날짜에는 요일을 붙인다(오너 지시 2026-08-03) — 청약은 평일 하루짜리라 요일이 곧 일정이다.
     요일은 **코드가 날짜에서 계산한다.** 손으로 적으면 다음 카드에서 틀린다. */
  const md = (iso) => {
    const [, m, dd] = iso.split("-");
    return `${Number(m)}/${Number(dd)}(${WD[new Date(`${iso}T00:00:00Z`).getUTCDay()]})`;
  };
  const ymKo = (ym) => (ym ? `${ym.split("-")[0]}년 ${Number(ym.split("-")[1])}월` : "미고지");
  const moveInYm = ah?.moveInYm ?? d.moveIn ?? null;

  /* 특이사항 — 규제·조건 중 **확인된 것만** 적는다. 없으면 그 자리는 비운다. */
  /* 특이사항 앞의 아이콘(오너 지시 2026-08-03) — 규제 항목마다 성격이 다른 그림 하나.
     💡 = 상한제(알아 두면 이득), 🔒 = 전매제한(묶여 있는 것), ⚠️ = 투기과열지구(주의).
     크기는 본문보다 작게, 투명도를 낮춰 **글자를 이기지 않게** 둔다(.dcv-note .em). */
  const flags = [];
  if (ah?.priceCap ?? d.price?.capApplied)
    flags.push(`<i class="em">💡</i><span class="tag">분양가상한제</span> 적용`);
  if (d.price?.resaleBanYears) flags.push(`<i class="em">🔒</i>전매제한 ${d.price.resaleBanYears}년`);
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
      ? { photo: d.photo.file, credit: d.photo.credit, shift: heroShift(d.photo.file) }
      : { photo: "seoul-apart-night.jpg", credit: "조감도 미확보", placeholder: true, shift: heroShift("seoul-apart-night.jpg") },
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
 * 무순위(줍줍) 카드 — 자리는 같고 세 칸의 뜻이 바뀐다
 *   머리 밴드: 분양가 → **면적대별 잔여 세대**(청약홈이 무순위 분양가를 주지 않는다)
 *   제원      : 총 세대수 → **잔여 세대 · 블록 수**
 *   일정      : 특공·1순위 → **접수 · 당첨자 발표 · 입주**(접수가 하루면 칸이 셋)
 * ──────────────────────────────────────────────────────────────── */
function remndr(d) {
  const ah = applyhome(d);
  if (!ah) throw new Error(`${d.id}: 무순위 카드는 청약홈 공고(applyhomeNo)가 있어야 한다`);
  const total = ah.supply;
  /* 무순위는 **접수가 하루**다. 그 하루가 무슨 요일인지가 곧 "내일 넣을 수 있나"라
     날짜만큼 중요하다 — 그래서 무순위 일정에는 요일을 붙인다(오너 지시 2026-08-03).
     분양 예정 카드는 특공·1순위·당발이 며칠에 걸쳐 있어 요일 가치가 낮고, 일정이 4칸이라
     요일을 붙이면 가장 긴 칸이 공통 수치 크기를 통째로 끌어내린다 — 거기는 붙이지 않는다.
     요일은 **코드가 날짜에서 계산한다.** 손으로 적으면 다음 카드에서 틀린다. */
  const md = (iso) => {
    const [, m, dd] = iso.split("-");
    return `${Number(m)}/${Number(dd)}(${WD[new Date(`${iso}T00:00:00Z`).getUTCDay()]})`;
  };
  const ymKo = (ym) => (ym ? `${ym.split("-")[0]}년 ${Number(ym.split("-")[1])}월` : "미고지");

  /* 접수가 하루면 '시작·마감' 두 칸이 같은 날을 두 번 말한다 — 데이터가 칸 수를 정한다. */
  const oneDay = !ah.receiptTo || ah.receiptFrom === ah.receiptTo;
  const schedule = oneDay
    ? [
        { label: "무순위 접수", date: ah.receiptFrom ? md(ah.receiptFrom) : "미고지", tbd: !ah.receiptFrom, hi: true },
        { label: "당첨자 발표", date: ah.announceDate ? md(ah.announceDate) : "미고지", tbd: !ah.announceDate },
        { label: "입주 예정", date: ymKo(ah.moveInYm ?? d.moveIn), tbd: !(ah.moveInYm ?? d.moveIn) },
      ]
    : [
        { label: "무순위 접수", date: md(ah.receiptFrom), hi: true },
        { label: "접수 마감", date: md(ah.receiptTo) },
        { label: "당첨자 발표", date: ah.announceDate ? md(ah.announceDate) : "미고지", tbd: !ah.announceDate },
        { label: "입주 예정", date: ymKo(ah.moveInYm ?? d.moveIn), tbd: !(ah.moveInYm ?? d.moveIn) },
      ];

  const blocks = d.blocks ?? ah.blocks ?? null;
  const flags = [];
  /* 블록별로 공고가 따로 난다 — 무순위에서 이건 '몇 곳을 한 번에 넣을 수 있나'라 실용 정보다.
     이름을 그대로 나열하면 한 줄을 넘겨 푸터를 민다(검수가 잡았다). 접두어가 같으면 묶는다:
     ["G5-1블록","G5-3블록",…] → "G5-1·3·4·5·11블록" */
  const blockLabel = (names) => {
    const m = names.map((x) => String(x).match(/^(.+?)-(\d+)블록$/));
    if (!m.every(Boolean) || new Set(m.map((x) => x[1])).size !== 1) return names.join(" · ");
    return `${m[0][1]}-${m.map((x) => x[2]).join("·")}블록`;
  };
  if (blocks && d.blockNames?.length)
    flags.push(`<i class="em">💡</i>${blocks}개 블록(${blockLabel(d.blockNames)}) 동시 접수`);
  if (ah.priceCap) flags.push(`<i class="em">💡</i><span class="tag">분양가상한제</span> 적용`);
  /* 무순위는 접수→발표→계약이 며칠 안에 끝난다. 계약일은 '돈이 실제로 나가는 날'인데
     일정 칸 3개에는 안 들어간다 — 알면 아래 한 줄로 적는다. 모르면 적지 않는다. */
  if (d.contractDate) flags.push(`<i class="em">💡</i>계약 ${md(d.contractDate)}`);

  const hook = d.hook || d.location.split(" ").slice(2, 3).join("") || d.location;

  /* ── 분양가를 아는 무순위 카드 (오너 지시 2026-08-06) ──
   * 무순위는 대개 공급금액이 '사업주체 문의'로만 적혀 카드가 규모밖에 말할 게 없다.
   * 그런데 **본청약 때 이미 값이 매겨진 단지**는 타입별 금액을 안다 — 그러면 그게 소식이다.
   * 그때만 판을 바꾼다: 위 단은 단지 규모 4칸, 아래 단은 타입별 세대수·최고 분양가.
   * price.byType 이 없으면 예전 판 그대로 — 확정된 카드(송도)의 픽셀은 건드리지 않는다. */
  const byType = d.price?.byType;
  const scaleFirst = Array.isArray(byType) && byType.length > 0;

  /* 회색 안내 머리글은 넣지 않는다(오너 지시 2026-08-06 "안내글씨는 다 지워줘").
     각 칸이 이미 자기 이름표를 달고 있어 머리글은 같은 말을 두 번 하는 셈이었다. */
  const scaleGrid = () => ({
    head: [],
    cols: 4,
    rows: [
      { area: "총 세대수", price: `${n(d.totalComplex ?? total)}세대` },
      { area: "동수", price: d.buildings != null ? `${d.buildings}개동` : "미고지" },
      { area: "최고 층수", price: d.topFloor != null ? `${d.topFloor}층` : "미고지" },
      { area: "잔여", price: `${n(total)}세대`, main: true },
    ],
  });
  /* 타입 칸: 회색 한 줄에 '타입 · 세대수', 그 아래 큰 글씨로 최고 분양가.
     오너가 부른 순서(타입/세대수/분양가)를 위에서 아래로 그대로 지킨다. */
  const typeCells = () =>
    byType.map((t) => {
      if (t.won == null) throw new Error(`${d.id}: ${t.type} 의 분양가(won)가 없다 — 지어내지 않는다`);
      return { above: `${t.type} · ${n(t.units)}세대`, value: eok1(t.won), hi: !!t.main };
    });
  if (scaleFirst) {
    const sum = byType.reduce((a, b) => a + (b.units || 0), 0);
    if (sum !== total)
      throw new Error(`${d.id}: 타입별 세대수 합 ${sum} ≠ 잔여 총 ${total} — 표가 공고와 다르다`);
  }

  return {
    template: "danji-cover@1",
    date,
    kind: "remndr",
    topcap: `오늘의 주요 청약 이슈 (${date.replace(/-/g, ".")})`,
    /* 무순위 문형(오너 확정): "{훅} 무순위 줍줍 {N}세대" — 분양가를 못 쓰니 규모가 제목을 진다.
       단지마다 제목이 달라야 할 때가 있다(오너가 직접 쓴 제목). 그때는 데이터셋이 이긴다. */
    titleLines: [
      d.titleHtml || `<span class="hi">${hook}</span> 무순위 줍줍 <span class="hi">${n(total)}세대</span>`,
    ],
    hero: d.photo
      ? { photo: d.photo.file, credit: d.photo.credit, shift: heroShift(d.photo.file) }
      : { photo: "seoul-apart-night.jpg", credit: "조감도 미확보", placeholder: true, shift: heroShift("seoul-apart-night.jpg") },
    danji: { name: d.name, ...(d.logo ? { logo: d.logo } : {}), ...(d.company ? { company: d.company } : {}) },
    address: addressOf(d),
    ...(scaleFirst ? { specFour: byType.length === 4 } : {}),
    spec: scaleFirst
      ? typeCells()
      : [
          {
            label: "잔여 세대",
            /* 잔여 세대는 **전체 대비 얼마인지**가 있어야 크기가 읽힌다(오너 지시).
               전체 세대수는 청약홈에 없으므로 데이터셋(totalComplex)에 있을 때만 얹는다. */
            ...(d.totalComplex ? { above: `총 ${n(d.totalComplex)}세대 중` } : {}),
            value: n(total),
            unit: "세대",
            hi: true,
          },
          /* 동수를 알면 동수가 낫다 — '5개 블록'은 공고 편의상의 구분이고 독자가 궁금한 건 단지 규모다. */
          d.buildings != null
            ? { label: "동수", pre: "총", value: String(d.buildings), unit: "개동" }
            : blocks
              ? { label: "블록", value: String(blocks), unit: "개 블록" }
              : { label: "동수", value: "미고지", tbd: true },
          d.topFloor != null
            ? { label: "최고 층수", pre: "최고", value: String(d.topFloor), unit: "층" }
            : { label: "최고 층수", value: "미고지", tbd: true },
        ],
    priceTable: scaleFirst ? scaleGrid() : priceTable(d, total),
    schedule,
    /* 한줄평이 있으면 그게 아래 한 줄이다 — 특이사항 나열보다 한 문장이 오래 남는다. */
    notice: d.oneLiner ? `<i class="em">💡</i>${d.oneLiner}` : flags.join(" · "),
    source: { name: d.source.name.replace(/^한국부동산원\s+/, "") },
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
  const md = (iso) => {
    const [, m, dd] = iso.split("-");
    return `${Number(m)}/${Number(dd)}(${WD[new Date(`${iso}T00:00:00Z`).getUTCDay()]})`;
  };
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
      ? { photo: d.photo.file, credit: d.photo.credit, shift: heroShift(d.photo.file) }
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
/* 시안은 `data/out/_spike`, **확정본은 `data/content/{날짜}/`** 에 쓴다(--publish).
   확정본은 produce-card.mjs 가 그 자리에서 찾아 다시 그리므로 자리가 곧 계약이다. */
const PUBLISH = process.argv.includes("--publish");
const outDir = PUBLISH ? join(ROOT, "data/content", date) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });

/* 데이터셋에 있는 단지를 **전부** 만든다. 목록을 손으로 적지 않는다 —
   새 단지를 데이터셋에 넣으면 그 순간 카드가 나온다(원커맨드 자동화의 전제). */
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;
const targets = doc.danji.filter((d) => !only || d.id === only);
if (only && !targets.length) throw new Error(`단지 없음: ${only}`);

let made = 0;
const skipped = [];
for (const d of targets) {
  let card;
  try {
    card = d.kind === "result" ? result(d) : d.kind === "remndr" ? remndr(d) : presale(d);
  } catch (e) {
    /* --only 로 그 단지를 콕 집었으면 실패는 실패다. 전체 빌드에서는 남은 것을 계속 만든다. */
    if (only) throw e;
    skipped.push([d.id, e.message]);
    continue;
  }
  /* 출력 파일명은 데이터가 정한다 — slug 가 있으면 그것, 없으면 id 앞머리 */
  const slug = `danji-${d.slug || d.id.split("-")[0]}`;
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");
  made++;
  console.log(`${slug} — ${card.danji.name}`);
  console.log(`   ${card.topcap} · ${card.titleLines.join(" ").replace(/<[^>]+>/g, "")}`);
  console.log(`   ${card.spec.map((c) => `${c.label} ${c.value}${c.unit || ""}`).join(" · ")}`);
  if (card.address) console.log(`   ${card.address}`);
  console.log(`   평형 ${card.priceTable.rows.map((r) => `${r.area} ${r.price}`).join(" · ")}`);
  console.log(`   일정 ${card.schedule.map((s) => `${s.label} ${s.date}`).join(" · ")}`);
}

if (skipped.length) {
  console.log(`\n⏭  아직 못 만드는 단지 ${skipped.length}곳 — 데이터가 덜 찼습니다:`);
  for (const [id, msg] of skipped) console.log(`   · ${id}: ${msg}`);
}
console.log(`\n✅ ${made}장 생성 → ${PUBLISH ? `data/content/${date}/` : "data/out/_spike/"}`);
console.log("⚠ 분양가는 보도값이다 — 입주자모집공고문 대조 전까지 발행 금지.");
