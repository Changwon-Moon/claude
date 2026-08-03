/**
 * 청약단지 브리핑 카드 — danji-brief@1.
 * 🧪 시안(2026-08-01). **발행 금지** — 데이터가 verified:false 다(청약홈 공고문 미대조).
 *
 * ── 이 카드가 하는 말
 * "그 단지, 어떻게 생겼고 몇 세대고 얼마고 언제 넣나." 한 장에 그 넷을 담는다.
 * 위(조감도)가 '어떻게 생겼나'를, 아래(표)가 나머지를 맡는다.
 *
 * ── 한 템플릿, 두 변형
 *   presale — 분양 예정 소개. 숫자칸 = 총 세대수 / 일반분양 / 최고 층수
 *   result  — 청약 결과.     숫자칸 = 총 세대수 / 일반분양 / 1순위 경쟁률(강조)
 * 오너가 고른 고정 항목(단지명·시공사·위치 / 총세대·일반분양·최고층 / 평형·분양가 / 청약일정)은
 * 두 변형에서 자리가 같다. 바뀌는 것은 **세 번째 숫자칸과 표의 뜻**뿐이다.
 *
 * ── 오보 0 장치 (손으로 적은 숫자 0개)
 *  1) 경쟁률은 데이터의 reported 를 쓰지 않고 **received/supply 로 다시 계산**한다.
 *     보도값과 1.0 넘게 벌어지면 던진다 — 받아 적으면 그게 오보다(CEO 07-30).
 *  2) 일반분양 합계도 마찬가지다. 특공+1순위를 코드가 더한다.
 *  3) 공급평형은 **환산하지 않는다.** 전용→공급은 단지마다 다른 관행값이라 계산이 아니다.
 *     오너 원칙은 "㎡가 아닌 공급평형"이지만, 모집공고가 평형을 밝히지 않은 단지에서
 *     34평이라고 적는 건 지어낸 숫자다. pyeongDisclosed:false 면 전용㎡로 적고
 *     표 아래에 그 사실을 밝힌다 — 원칙과 오보 0이 부딪히면 오보 0이 이긴다.
 *  4) 모르는 값(분양가·청약일)은 칸을 지우지 않고 '미고지'라고 적는다.
 *     칸이 사라지면 독자는 그런 정보가 없는 줄 안다.
 *
 * ── 사진
 * 조감도는 건설사 보도자료 이미지다. 저장소에 정식으로 들인 것만 쓰고 출처를 카드에 적는다.
 * 아직 없으므로 시안은 ①오픈라이선스 대체 사진(카드에 '시안용 대체 이미지'라고 밝힘)
 * ②사진 없는 그래픽 폴백 — 두 상태를 다 보여준다.
 *
 * 실행: node scripts/build-danji-brief.mjs [date=2026-08-01]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-01";
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/bunyang-danji-2026.json"), "utf8"));

/* ── 청약홈 1차 출처 병합 (2026-08-03) ──
 * 매일 도는 수집기가 받아 놓은 `applyhome-latest.json` 에서 그 공고를 찾아 쓴다.
 * **여기 손으로 옮겨 적지 않는다** — 옮겨 적는 순간 두 곳이 어긋나고, 어긋난 쪽이
 * 카드에 나가면 그게 오보다. 데이터셋에는 API 에 없는 것(동수·층수·분양가)만 둔다.
 *
 * ⚠️ 데이터셋에도 같은 값이 적혀 있고 청약홈과 다르면 **던진다.**
 *    "둘 중 뭐가 맞지?" 를 사람이 눈으로 고르게 두지 않는다. */
function applyhome(d) {
  if (!d.applyhomeNo) return null;
  const p = join(ROOT, "data/datasets/applyhome-latest.json");
  if (!existsSync(p))
    throw new Error(`청약홈 수집 결과가 없다 — 대기열(data/applyhome-queue.txt)로 수집을 먼저 건다 (${d.id})`);
  const doc = JSON.parse(readFileSync(p, "utf8"));
  const hit = (doc.notices || []).find((x) => x.pblancNo === d.applyhomeNo);
  if (!hit)
    throw new Error(
      `청약홈 최신 수집분에 공고번호 ${d.applyhomeNo} 가 없다 (${d.id}). ` +
        `접수가 끝나 목록에서 빠졌을 수 있다 — data/datasets/applyhome/{날짜}.json 을 확인할 것.`,
    );
  if (d.total != null && d.total !== hit.supply)
    throw new Error(`총 세대수 불일치 — 데이터셋 ${d.total} vs 청약홈 ${hit.supply} (${d.id})`);
  return hit;
}

const byId = (id) => {
  const d = doc.danji.find((x) => x.id === id);
  if (!d) throw new Error(`단지 없음: ${id}`);
  return d;
};

/** 1,234 — 천단위 구분. 표기는 한 곳에서만 만든다. */
const n = (v) => Number(v).toLocaleString("ko-KR");

/** 억 단위 한글 표기. 1,860,000,000 → "18억 6,000만원" (원단위 정수만 받는다) */
function won(v) {
  if (!Number.isInteger(v)) throw new Error(`won(): 정수 원단위만 받는다 — ${v}`);
  const eok = Math.floor(v / 100000000);
  const man = Math.floor((v % 100000000) / 10000);
  if (!eok) return `${n(man)}만원`;
  return man ? `${n(eok)}억 ${n(man)}만원` : `${n(eok)}억원`;
}

/** 경쟁률은 세지 않고 **계산한다**. 보도값과 벌어지면 던진다. */
function ratio(row) {
  const calc = row.received / row.supply;
  const shown = Math.floor(calc); // 보도 관행: 내림
  if (row.reported != null && Math.abs(shown - row.reported) > 1) {
    throw new Error(
      `경쟁률 불일치 — ${row.label}: 계산 ${shown}대 1 vs 보도 ${row.reported}대 1 ` +
        `(${n(row.received)}건 ÷ ${row.supply}가구). 원자료를 확인할 것.`,
    );
  }
  return { shown, calc };
}

/** 전용면적 목록. 길면 최소~최대 범위로 줄인다.
 *  ⚠️ 개수만으로 자르면 안 된다 — "84·106·122·180" 은 네 개인데도 칸(425px)을 넘겼다
 *  (2026-08-03 designQa clipped 가 잡았다). 세 자리 숫자가 섞이면 글자 수로 재야 맞는다. */
const areaList = (areas) => {
  const ms = areas.map((a) => a.m2);
  const joined = ms.join("·");
  return (ms.length > 4 || joined.length > 12 ? `${Math.min(...ms)}~${Math.max(...ms)}` : joined) + "㎡";
};
const typeCount = (areas) => areas.reduce((s, a) => s + a.types.length, 0);

/** 주력 면적대 — 세대수가 가장 많은 전용면적과 그 비중. units 가 다 적혀 있을 때만.
 *  합계가 총 세대수와 다르면 던진다. 데이터가 스스로 검산하지 않으면 표가 조용히 틀린다. */
function mainArea(d, total) {
  /* 주력 면적대만 따로 알려진 단지가 있다(전체 타입별 세대수는 공고문에만 있다).
     그때는 그 하나만 받되 **총 세대수를 넘지 않는지** 확인한다. */
  if (d.mainArea) {
    const { m2, units } = d.mainArea;
    if (!(units > 0 && units <= total))
      throw new Error(`주력 면적 세대수 ${units} 가 총 세대수 ${total} 범위 밖이다 (${d.id})`);
    return { m2, units, pct: Math.round((units / total) * 1000) / 10 };
  }
  if (!d.areas.every((a) => Number.isInteger(a.units))) return null;
  const sum = d.areas.reduce((s, a) => s + a.units, 0);
  if (sum !== total)
    throw new Error(`주택형 세대수 합 ${sum} ≠ 총 세대수 ${total} — 원자료를 확인할 것 (${d.id})`);
  const top = d.areas.reduce((a, b) => (b.units > a.units ? b : a));
  return { m2: top.m2, units: top.units, pct: Math.round((top.units / total) * 1000) / 10 };
}

/* 제목 안 — 오너가 고를 수 있게 변형으로 둔다(CEO 07-31 "선택지는 렌더해서 보여준다").
 * 어느 안이든 **숫자는 전부 데이터에서** 온다. 손으로 적은 문구는 없다. */
const TITLE_VARIANT = process.env.WIRIT_TITLE || "a";
function titleFor(d, { total, ah }) {
  const v = TITLE_VARIANT;
  if (d.price?.headline && v === "a")
    // 가격이 곧 반전 — "한강 보는 84㎡가 7억대"
    return [`한강 보는 ${d.price.headline.label.replace("전용 ", "")}가`, `<span class="hi">${won(d.price.headline.won)}</span>`];
  if (v === "b")
    // 규모가 훅 — 지역은 위치에서 뽑는다(highlight 를 쓰면 "한강과 맞닿은 한강변"처럼 말이 겹친다)
    return [`${d.location.split(" ").slice(0, 2).join(" ")} 한강변에`, `<span class="hi">${n(total)}가구</span> 들어선다`];
  if (v === "c" && ah?.priceCap)
    return [`분양가상한제 한강변`, `<span class="hi">${n(total)}가구</span>`];
  if (d.site)
    return [`${d.site.replace(/ 부지$/, "")}에`, `<span class="hi">${d.topFloor}층 ${n(total)}가구</span>`];
  return [`${d.nearest.line} ${d.nearest.station} ${d.nearest.desc}`, `<span class="hi">${n(total)}가구</span> 들어선다`];
}

/* ────────────────────────────────────────────────────────────────
 * ① 분양 예정 — 산곡역자이힐스테이트&하늘채
 * ──────────────────────────────────────────────────────────────── */
function presale(d) {
  if (d.kind !== "presale") throw new Error(`${d.id} 는 presale 이 아니다`);
  /* 청약홈 공고가 붙어 있으면 그쪽이 사실의 원천이다. 없으면 데이터셋 값으로 간다
     (모집공고 전 단지는 아직 청약홈에 없다 — 그건 정상이다). */
  const ah = applyhome(d);
  const total = ah ? ah.supply : d.total;
  /* ⚠️ '일반분양'은 확인된 단지에서만 말한다.
   * 청약홈의 총공급세대수(TOT_SUPLY_HSHLDCO)는 '공급 세대수'이지 '조합원 몫이 없다'는 뜻이 아니다.
   * 데이터셋이 general 을 명시하지 않았는데 total 을 그대로 넣으면, 카드에 같은 숫자가 두 번
   * 찍히면서 **확인하지 않은 사실(전량 일반분양)을 단정**하게 된다(2026-08-03 한강 카드에서 발견).
   * 그때는 그 칸을 주력 면적대로 바꾼다 — 정보량도 그쪽이 크다. */
  const general = d.general ?? null;
  const moveInYm = ah?.moveInYm ?? d.moveIn ?? null;
  const [saleY, saleM] = (ah?.noticeDate ?? d.saleMonth).split("-");
  /* 모르는 날짜는 지어내지 않고 '미고지'로 적는다 — 칸을 지우면 그런 정보가 없는 줄 안다. */
  const ymLabel = (iso) => (iso ? `${iso.split("-")[0]}.${Number(iso.split("-")[1])}` : "미고지");
  /* 3.31 로 적으면 소수처럼 읽힌다. 날짜는 슬래시로 — 8/10. */
  const md = (iso) => { const [, m, dd] = iso.split("-"); return `${Number(m)}/${Number(dd)}`; };

  /* 일반분양 비율은 '얼마나 살 수 있나'를 말한다 — 조합원 몫이 큰 단지와 구분된다. */
  const main = mainArea(d, total);
  if (d.general == null && !main)
    throw new Error(`${d.id}: general(일반분양)도 mainArea(주력 면적대)도 없다 — 숫자칸 하나를 채울 수 없다`);
  const ratioPct = general === null ? null : Math.round((general / total) * 1000) / 10;
  const allGeneral = general !== null && general === total;   // 조합원·임대 물량이 없다고 **확인된** 단지

  return {
    template: "danji-brief@1",
    date,
    kind: "presale",
    /* 제목은 데이터가 쓴다. "인천 최대어" 같은 최상급은 우리 데이터로 확인할 수 없어 쓰지 않는다
     * — 8월 인천 분양 단지 전체가 데이터셋에 없는데 '최대'라고 적으면 그건 추측이다
     * (CARD_CHECKLIST §2 문구 규칙).
     * 부지 내력(site)이 있으면 그게 가장 센 훅이다 —
     * "옛 홈플러스 자리"는 독자가 아는 장소라 세대수보다 먼저 걸린다.
     * 없으면 역 이름으로 간다. 둘 다 데이터에 있는 값이고, 최상급은 쓰지 않는다. */
    titleLines: titleFor(d, { total, ah }),
    hero: {
      photo: "seoul-apart-night.jpg",
      credit: "조감도 미확보",
      placeholder: true,
    },
    danji: {
      name: d.name,
      location: d.location,
      company: d.company,
      ...(d.logo ? { logo: d.logo } : {}),
    },
    stats: [
      { label: "총 세대수", value: n(total), unit: "가구" },
      general !== null
        ? { label: "일반분양", value: n(general), unit: "가구" }
        : { label: `주력 전용 ${main.m2}㎡`, value: n(main.units), unit: "가구" },
      { label: "최고 층수", value: String(d.topFloor), unit: "층" },
    ],
    table: {
      cols: 2,
      rows: [
        ["전용면적", `${areaList(d.areas)} · ${typeCount(d.areas)}개 타입`],
        /* 주력 면적대는 '이 단지가 누구를 위한 곳인가'를 한 줄로 말한다.
           units 가 다 적혀 있고 합이 총 세대수와 맞을 때만 나간다(mainArea 가 검산한다). */
        /* 숫자칸이 이미 주력 면적대를 말하고 있으면 표에서는 뺀다 — 같은 말을 두 번 하지 않는다 */
        ...(main && general !== null ? [[`주력 전용 ${main.m2}㎡`, `${n(main.units)}가구 · ${main.pct}%`]] : []),
        ["규모", `${d.buildings}개동 · 지하${d.underFloor}~지상${d.topFloor}층`],
        ["분양가", d.priceDisclosed ? `${d.price.headline.label} ${won(d.price.headline.won)}` : "모집공고 시 공개"],
        /* 입주 예정은 아래 일정칸이 이미 말한다 — 한 카드에서 같은 말을 두 번 하지 않는다 */
      ],
      note: d.pyeongDisclosed ? undefined : "공급평형 미고지 — 전용면적으로 표기",
    },
    /* 청약 일정 3칸은 오너가 고른 고정 항목이다(2026-08-01).
       청약홈이 세 날짜를 다 주면 그대로 쓰고, 없으면 '미고지'로 칸을 남긴다. */
    schedule: ah?.specialFrom
      ? [
          { label: "특별공급", date: md(ah.specialFrom) },
          { label: "1순위", date: md(ah.rank1From ?? ah.receiptFrom) },
          { label: "당첨자 발표", date: md(ah.announceDate) },
        ]
      : [
          { label: "분양 시기", date: `${saleY}.${Number(saleM)}` },
          { label: "청약 일정", date: d.schedule?.first ? ymLabel(d.schedule.first) : "미고지", tbd: !d.schedule?.first },
          { label: "입주 예정", date: ymLabel(moveInYm), tbd: !moveInYm },
        ],
    /* 하단 한 줄은 제목이 **하지 않은 말**을 한다. 제목이 이미 역과 세대수를 말했으니
     * 여기서 다시 '산곡역 초역세권'이라고 쓰면 같은 말이 두 번이다.
     * 두 값 모두 계산이다 — 최대 전용면적은 areas 에서 뽑고, 비율은 나눗셈이다. */
    /* 하단 한 줄은 제목·표·일정칸이 **하지 않은 말**을 한다.
       청약홈 일정 3칸을 쓰는 카드는 입주예정이 어디에도 안 나오므로 여기서 말한다. */
    note: ah?.specialFrom
      ? `입주 예정 ${ymLabel(moveInYm)}` +
        (ah.priceCap ? ` · 분양가상한제 적용${d.price?.resaleBanYears ? ` · 전매제한 ${d.price.resaleBanYears}년` : ""}` : "")
      : allGeneral
        ? `${n(total)}가구 전부 일반분양` + (d.nearest ? ` · ${d.nearest.line} ${d.nearest.station} ${d.nearest.desc}` : "")
        : ratioPct !== null
          ? `전용 ${Math.max(...d.areas.map((a) => a.m2))}㎡ 이하로만 구성 · 일반분양이 전체의 ${ratioPct}%`
          : `주력 전용 ${main.m2}㎡ 가 전체의 ${main.pct}%`,
    /* 푸터는 한 줄이다 — 매체를 둘 이상 적으면 워드마크에 닿는다.
       전체 경로는 데이터셋의 source.via 가 갖고 있어 추적은 그대로 된다. */
    source: { name: `${d.source.name} · ${d.source.via.split(" · ")[0]}` },
  };
}

/* ────────────────────────────────────────────────────────────────
 * ② 청약 결과 — 아크로 드 서초
 * ──────────────────────────────────────────────────────────────── */
function result(d) {
  if (d.kind !== "result") throw new Error(`${d.id} 는 result 가 아니다`);
  const rows = d.apply.map((r) => ({ ...r, ...ratio(r) }));
  const first = rows.find((r) => r.label === "1순위");
  const special = rows.find((r) => r.label === "특별공급");
  if (!first || !special) throw new Error("특별공급·1순위 행이 있어야 한다");

  /* 일반분양 총량은 적혀 있지 않다 — 특공 + 1순위를 코드가 더한다. */
  const general = special.supply + first.supply;
  /* '최고 경쟁률'은 계산이 확인했을 때만 그렇게 부른다(CARD_CHECKLIST §2 문구 규칙). */
  const top = rows.reduce((a, b) => (b.shown > a.shown ? b : a));

  const [inY, inM] = d.moveIn.split("-");
  /* 3.31 로 적으면 소수처럼 읽힌다. 날짜는 슬래시로 — 3/31. */
  const md = (iso) => {
    const [, m, dd] = iso.split("-");
    return `${Number(m)}/${Number(dd)}`;
  };

  /* 시세차익은 **계산값**이다. 카드에 적는 숫자를 손으로 옮기지 않는다. */
  const gap = d.price.nearbyMarketWon - d.price.unit59Won;

  return {
    template: "danji-brief@1",
    date,
    kind: "result",
    /* '역대 최고'는 우리 데이터가 확인할 수 없는 말이다(과거 경쟁률이 데이터셋에 없다).
     * 그래서 근거를 함께 적은 record 필드가 **있을 때만** 쓴다 — 없으면 문구도 없다.
     * 손으로 적는 대신 데이터에 열쇠를 두는 방식이라, 근거 없는 단지에서는 자동으로 빠진다. */
    titleLines: d.record
      ? [`서울 청약 <span class="up">역대 최고</span>`, `${n(first.shown)}대 1`]
      : [`1순위 경쟁률`, `<span class="up">${n(first.shown)}대 1</span>`],
    hero: {
      fallbackColor: "#101418",
      fallbackWord: "ACRO",
    },
    danji: {
      name: d.name,
      location: d.location,
      company: d.company,
      ...(d.logo ? { logo: d.logo } : {}),
    },
    stats: [
      { label: "총 세대수", value: n(d.total), unit: "가구" },
      { label: "일반분양", value: n(general), unit: "가구" },
      { label: "1순위 경쟁률", value: `${n(first.shown)}대 1`, hi: true },
    ],
    table: {
      cols: 4,
      head: ["구분", "모집", "접수", "경쟁률"],
      rows: rows.map((r) => [r.label, `${r.supply}가구`, `${n(r.received)}건`, `${n(r.shown)}대 1`]),
      note: `최고 경쟁률 ${top.label} · ${n(top.shown)}대 1`,
    },
    schedule: [
      { label: "특별공급", date: md(d.schedule.special) },
      { label: "1순위", date: md(d.schedule.first) },
      { label: "입주 예정", date: `${inY}.${Number(inM)}` },
    ],
    note:
      `전용 59㎡ 분양가 ${won(d.price.unit59Won)}` +
      (d.price.capApplied ? ` · 인근 시세와 약 ${won(gap)} 차이(분양가상한제)` : ""),
    /* 푸터는 한 줄이다 — 매체를 둘 이상 적으면 워드마크에 닿는다.
       전체 경로는 데이터셋의 source.via 가 갖고 있어 추적은 그대로 된다. */
    source: { name: `${d.source.name} · ${d.source.via.split(" · ")[0]}` },
  };
}

/* ── 산출 ──
 * 시안이므로 data/out/_spike 에 둔다. 오너가 확정하면 data/content/{날짜}/ 로 옮기고
 * sets.json·builders.json 에 등록한다(그 전에 올리면 검사 없는 세트가 된다). */
const outDir = join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });

const cards = [
  ["danji-brief-presale", presale(byId("sangok-xi-hillstate"))],
  ["danji-brief-result", result(byId("acro-de-seocho"))],
  ["danji-brief-sangdong", presale(byId("sangdong-lotte-castle"))],
  ["danji-brief-hangang", presale(byId("hangang-prugio-riverfront"))],
];

for (const [slug, card] of cards) {
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");
  console.log(`${slug} — ${card.danji.name} (${card.kind})`);
  console.log(`   숫자칸: ${card.stats.map((s) => `${s.label} ${s.value}${s.unit || ""}`).join(" · ")}`);
  console.log(`   → data/out/_spike/${slug}.json`);
}

console.log("");
console.log("⚠ 데이터가 verified:false 다 — 청약홈 공고문 대조 전까지 발행 금지.");
