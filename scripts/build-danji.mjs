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

/** 표지 사진의 끌어올림 px. 원본이 세로로 짧으면 칸을 못 채우므로 던진다.
 *  `boxH` 는 표지 사진 칸 높이다 — 기본 446, 카드가 키우면(오너 지시 2026-08-08) 그 값. */
function heroShift(fileName, boxH = PHOTO_BOX_H) {
  const p = join(ROOT, "templates/_shared/photos", fileName);
  if (!existsSync(p)) throw new Error(`조감도 파일이 없다: templates/_shared/photos/${fileName}`);
  const { w, h } = imageSize(p);
  const renderH = Math.round((CARD_W * h) / w);
  if (renderH < boxH)
    throw new Error(
      `조감도가 가로로 너무 길다 — 1080px 폭에 맞추면 세로가 ${renderH}px 라 표지 칸(${boxH}px)을 못 채운다: ${fileName}`,
    );
  return renderH;
}

/** 표지(사진+잉크 밴드) 한 벌. 칸을 키우면 밴드와 번짐 시작점이 같이 내려간다. */
const BAND_H = 690 - PHOTO_BOX_H; // 244 — 사진 아래 잉크 밴드(제목이 앉는 자리)의 기본 높이
function heroOf(d) {
  /* ── 표지는 **늘어난다**(오너 지시 2026-09-03: "내용이 적을수록 사진이 더 크게") ──
   * 종전에는 카드마다 `photo.boxH` 를 손으로 정해 사진 칸을 키웠다. 그 방식의 문제는 늘 같았다:
   * 종이가 얼마나 남기는지는 **그려 봐야 알고**, 손으로 정한 값은 다음 카드에서 다시 틀린다
   * (목동 카드에서 105px 을 재고도 102px 을 올리자 특이사항이 2px 겹쳐 검수가 막았다).
   *
   * 그래서 판형이 스스로 하게 바꿨다. 표지는 `flex:1` 로 남는 세로를 먹고, 사진 칸은 표지에서
   * 잉크 밴드를 뺀 나머지 전부다. 빌더가 주는 것은 **상한 하나**뿐이다 —
   * 원본이 폭 1080 에서 갖는 높이(+밴드). 그 위로 늘리면 사진을 잡아 늘이는 셈이다.
   *
   * `boxH`/`shift`/`fadeTop` 은 더 이상 보내지 않는다. 끌어올림(남는 세로의 42.5%)은
   * 템플릿의 `object-position: 50% 42.5%` 가 레이아웃 시점에 같은 규칙으로 한다. */
  const band = d.photo?.band ?? BAND_H;
  const minCover = (d.photo?.boxH ?? PHOTO_BOX_H) + band;
  const file = d.photo?.photo ?? d.photo?.file ?? null;
  const name = file ?? "seoul-apart-night.jpg";
  /* heroShift 는 이제 원본이 폭 1080 에서 갖는 높이를 돌려준다 — 이름은 옛것이지만
     하는 일은 "이 사진을 늘리지 않고 쓸 수 있는 최대 높이"를 재는 것이다.
     가로로 너무 긴 사진(기본 칸도 못 채우는)은 여기서 여전히 던진다. */
  const renderH = heroShift(name, d.photo?.boxH ?? PHOTO_BOX_H);
  const extra = { coverH: minCover, coverMax: renderH + band, ...(d.photo?.band ? { band } : {}) };
  return d.photo
    ? { photo: d.photo.file, credit: d.photo.credit, ...extra }
    : { photo: "seoul-apart-night.jpg", credit: "조감도 미확보", placeholder: true, ...extra };
}

/**
 * 아래 한 줄. 데이터가 이모지를 데리고 오면(`<i class="em">`) 그대로 쓴다 —
 * 💡 가 늘 맞는 건 아니다. 규제 안내에는 ⚠️ 가 맞다(오너 지시 2026-08-08).
 *
 * `carried` 는 **카드가 표에서 뺀 정보를 받아 주는 줄**이다(희소 면적대 등). 오너가 쓴
 * 한줄평(`oneLiner`)이 있어도 사라지면 안 된다 — 사라지면 "지운 정보가 어디로 갔는지 정한다"가
 * 깨지고, 그 3세대 47.5~60.4억이 카드 어디에도 안 남는다.
 * ⚠️ 처음엔 `flags` 안에서 문자열("펜트하우스")로 되찾았는데, 생산 쪽 문구만 바꿔도 줄이
 * 조용히 증발했다(AS팀 2026-08-14 실험). 그래서 **인자를 갈라** 계약을 코드로 만든다.
 */
function noticeOf(d, flags, carried = []) {
  const all = [...flags, ...carried];
  if (!d.oneLiner) return all.join(" · ");
  const head = d.oneLiner.includes('<i class="em">') ? d.oneLiner : `<i class="em">💡</i>${d.oneLiner}`;
  return carried.length ? `${head}<br>${carried.join(" · ")}` : head;
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

/* ── 청약홈 1차 출처 병합 ──
 *
 * ⚠️ **접수가 끝난 공고는 목록에서 사라진다** — 그게 정상이다(2026-08-12).
 * 청약홈 수집분은 "지금 접수 중인 것"만 담는다. 그래서 접수가 끝나는 순간
 * 이미 만들어 발행까지 한 카드가 **재생산할 때마다 죽는다**. 실제로 더샵 송도그란테르가
 * 그랬고, 그 예외 하나가 `rebuild-cards` 를 통째로 빨간불로 만들고 있었다.
 *
 * 카드를 못 그리게 두면 관제탑에서 그 카드가 사라진다(산출물은 gitignore 라 매번 다시 그린다).
 * 그렇다고 검증 없이 넘어가면 오보 0 이 깨진다. 그래서 **은퇴**라는 상태를 만든다:
 *
 *   접수 중  → 청약홈 수집분에서 읽는다(지금까지와 같다)
 *   접수 종료 → 데이터셋에 굳혀 둔 **마지막 판본**(`_applyhomeSnapshot`)에서 읽는다
 *
 * 스냅샷은 사람이 손으로 적지 않는다 — `node scripts/retire-danji.mjs <id>` 가
 * 수집분(또는 git 이력)에서 그대로 떠서 박는다. 그래야 수치의 출처가 여전히 코드다.
 * 스냅샷도 없이 공고가 사라졌으면 **그때는 던진다** — 조용히 넘어가지 않는다.
 */
function applyhome(d) {
  if (!d.applyhomeNo) return null;
  const p = join(ROOT, "data/datasets/applyhome-latest.json");
  if (!existsSync(p))
    throw new Error(`청약홈 수집 결과가 없다 — data/applyhome-queue.txt 로 수집을 먼저 건다 (${d.id})`);
  const hit = (JSON.parse(readFileSync(p, "utf8")).notices || []).find((x) => x.pblancNo === d.applyhomeNo);
  if (!hit) {
    const snap = d._applyhomeSnapshot;
    if (snap && snap.pblancNo === d.applyhomeNo) {
      console.log(
        `   ⏸ 접수 종료 — 청약홈 목록에서 빠졌습니다. 굳혀 둔 마지막 판본으로 그립니다` +
          ` (${d.id} · 접수 ${snap.receiptTo || "?"} 종료 · 굳힌 날 ${d._retiredAt || "?"})`,
      );
      return snap;
    }
    throw new Error(
      `청약홈 최신 수집분에 공고번호 ${d.applyhomeNo} 가 없다 (${d.id}) — 접수가 끝나 목록에서 빠졌을 수 있다.\n` +
        `   접수가 끝난 게 맞으면 마지막 판본을 굳혀 은퇴시킵니다: node scripts/retire-danji.mjs ${d.id}`,
    );
  }
  if (d.total != null && d.total !== hit.supply)
    throw new Error(`총 세대수 불일치 — 데이터셋 ${d.total} vs 청약홈 ${hit.supply} (${d.id})`);
  return hit;
}

/**
 * 1차 출처 한 벌 — 세대수·일정·입주예정·규제.
 *
 * 기본은 청약홈 수집분이다(위 `applyhome`). 그런데 **공고 당일에는 청약홈 API 에 아직
 * 안 실린다** — 상동역 롯데캐슬 시그니처(공고일 2026-08-14)가 그랬다. 그날 API 만 보고
 * "일정 미고지"라고 적으면, 손에 **입주자모집공고문 원본**을 들고서 모른다고 쓰는 셈이다.
 *
 * 1차 출처는 **입주자모집공고문 그 자체**이고 청약홈 API 는 그 출처의 한 화면일 뿐이다
 * (기준 문서 §5 "API 가 안 주는 값도 같은 1차 출처의 다른 화면에는 있다").
 * 그래서 공고문에서 읽은 일정이 데이터셋에 있으면 그것을 쓴다 — 단 조건이 둘이다:
 *
 *   ① `scheduleSource` 로 **어디서 읽었는지 밝힌 것만** 받는다. 출처 없는 날짜는 안 받는다.
 *   ② `applyhomeNo` 가 있으면 이 길로 오지 않는다 — 청약홈이 이기고, 어긋나면 위에서 던진다.
 *      (공고가 API 에 실리는 순간 자동으로 그쪽으로 넘어가고, 값이 다르면 그때 잡힌다)
 */
function noticeFacts(d) {
  const ah = applyhome(d);
  if (ah) return ah;
  if (!d.scheduleSource) return null;
  const s = d.schedule || {};
  return {
    _fromNotice: true,
    supply: d.total,
    specialFrom: s.special ?? null,
    rank1From: s.first ?? null,
    announceDate: s.announce ?? null,
    /* 오피스텔은 특별공급·순위가 없고 접수가 하루다 — 그 하루를 `receipt` 로 따로 받는다.
       `first`(1순위)에 실어 보내면 APT 의 순위 개념이 오피스텔 카드에 묻는다. */
    receiptFrom: s.receipt ?? s.first ?? null,
    receiptTo: s.second ?? s.receipt ?? s.first ?? null,
    /* 계약체결일 — APT 카드는 안 쓰지만 오피스텔은 일정 넷째 칸이 이것이다(§오피스텔). */
    contractFrom: s.contract ?? null,
    moveInYm: d.moveIn ?? null,
    priceCap: d.price?.capApplied ?? false,
    speculative: d.speculative ?? false,
  };
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
/**
 * 규모 우선 판 (오너 확정 2026-08-06 장위 → 2026-08-08 분양 예정까지 확장).
 *
 * 위 단 = 총 세대수 / 동수 / 최고 층수 / 이번에 공급하는 물량(코발트)
 * 아래 단 = 타입별 **세대수 · 최고 분양가** — 회색 한 줄에 '타입 · N세대', 그 아래 큰 글씨로 금액.
 *          오너가 부른 순서(타입/세대수/분양가)를 위에서 아래로 그대로 지킨다.
 *
 * 켜지는 조건은 **데이터**다: `price.byType` 이 있으면 이 판, 없으면 예전 판.
 * 사람이 "이번엔 이 판형" 하고 켜지 않는다(CARD_CHECKLIST §3).
 *
 * ⚠️ 마지막 칸 라벨은 카드가 무엇을 파는지에 따라 다르다 — 줍줍은 '잔여',
 *    조합원 취소분은 '취소분', 일반 분양은 '일반분양'. `supplyLabel` 이 정한다.
 * ⚠️ 타입별 세대수 합이 이번 공급 물량과 다를 수 있다(더샵 취소분: 표는 본청약 477세대인데
 *    이번 물량은 67세대). 그때는 `typeSumIsSupply: false` 로 검산을 끄고 **머리글이 기준을
 *    말하게** 한다. 끄는 것을 데이터에 적어 두는 이유는, 조용히 안 세면 다음 사람이 모른다.
 */
function scalePlan(d, total) {
  const byType = d.price?.byType;
  if (!Array.isArray(byType) || !byType.length) return { on: false };
  /* ⚠️ 장위형은 **아래 단이 타입 칸**이라 판형 스키마가 요구하는 3칸을 못 채우면 성립하지 않는다
     (`spec` minItems 3). 구리역 롯데캐슬(잔여 1세대·타입 1개)에서 렌더가
     "/spec must NOT have fewer than 3 items" 로 죽었다(2026-08-26).
     타입이 한둘이면 **송도형으로 떨어뜨린다** — 그쪽 아래 단은 잔여/동수/최고층수 3칸이라 찬다.
     분양가를 아는 카드라면 그 값은 아래 `priceTable` 밴드가 받는다(정보는 안 사라진다). */
  if (byType.length < 3) return { on: false };

  const label = d.supplyLabel || (d.kind === "remndr" ? "잔여" : "일반분양");
  const sum = byType.reduce((a, b) => a + (b.units || 0), 0);
  const anyUnits = byType.some((t) => t.units != null);
  if (anyUnits && d.typeSumIsSupply !== false && sum !== total)
    throw new Error(
      `${d.id}: 타입별 세대수 합 ${sum} ≠ 이번 공급 ${total} — 표가 공고와 다르다.` +
        ` 표가 본청약 기준이라 일부러 다른 것이면 데이터에 typeSumIsSupply:false 를 적을 것`,
    );

  return {
    on: true,
    four: byType.length === 4,
    /* 회색 안내 머리글은 넣지 않는다(오너 지시 2026-08-06 "안내글씨는 다 지워줘").
       각 칸이 이미 자기 이름표를 달고 있어 머리글은 같은 말을 두 번 하는 셈이었다. */
    grid: {
      head: [],
      cols: 4,
      rows: [
        { area: "총 세대수", price: `${n(d.totalComplex ?? total)}세대` },
        { area: "동수", price: d.buildings != null ? `${d.buildings}개동` : "미고지" },
        { area: "최고 층수", price: d.topFloor != null ? `${d.topFloor}층` : "미고지" },
        { area: label, price: `${n(total)}세대`, main: true },
      ],
    },
    cells: byType.map((t) => {
      if (t.won == null) throw new Error(`${d.id}: ${t.type} 의 분양가(won)가 없다 — 지어내지 않는다`);
      /* 세대수를 **모르는** 카드가 있다. 더샵 취소분이 그렇다 — 공고가 타입별 물량을 안 줬다.
         그때 본청약 세대수를 얹으면 "취소분 67세대"와 "51㎡ 150세대"가 한 카드에서 싸운다.
         모르면 **비운다.** 타입과 금액만 말하는 것이 틀린 수를 말하는 것보다 낫다. */
      const head = t.units != null ? `${t.type} · ${n(t.units)}세대` : t.type;
      return { above: head, value: eok1(t.won), hi: !!t.main };
    }),
  };
}

/**
 * 표에 들어갈 면적대와, 표에서 빼 아래 한 줄로 보낼 **희소 면적대**를 가른다.
 *
 * 상동역 롯데캐슬 시그니처(2026-08-14)에서 실측: 면적대가 6개면 밴드가 3열 두 줄이 되고
 * 종이 단이 길어져 **푸터가 카드 밖으로 89px 밀려 나간다**(검수가 잡았다).
 * 그런데 그 6개 중 셋은 펜트하우스로 **각 1세대** — 1,859세대 중 3세대(0.16%)가
 * 밴드의 절반을 차지하는 셈이었다. 그건 자리 문제이기 전에 **카드가 파는 것을 잘못 말하는 것**이다.
 *
 * 그래서 표는 실제로 파는 면적대만 말하고, 뺀 것은 아래 한 줄이 받는다
 * (기준 문서: "지운 정보가 어디로 갔는지 정한다"). **어느 칸을 뺄지는 손이 아니라 데이터가 정한다** —
 * 총 공급의 0.5% 미만인 면적대만, 그것도 표가 한 줄에 안 들어갈 때(5개 이상)만 뺀다.
 * 면적대가 4개 이하로 이미 한 줄에 들어가면 아무것도 빼지 않는다.
 */
/**
 * 밴드에 적을 **타입 꼬리표**를 고른다 — 라벨과 금액이 같은 타입을 가리키게.
 *
 * 밴드가 보여 주는 금액은 그 면적대의 **최고가**다. 그런데 라벨을 `types[0]` 로 찍으면
 * 최고가를 낸 타입이 따로 있을 때 카드가 거짓말을 한다(롯데캐슬 84㎡: 최고 16.38억은 84E 인데
 * 라벨은 84A — 84A 의 최고는 16.30억이다). 그래서 타입별 값(`price.byTypeAll`)이 있으면
 * **최고가를 낸 타입**을 쓰고, 없으면 종전대로 첫 타입을 쓴다.
 * 같은 값을 낸 타입이 여럿이면 표에 먼저 나온 것을 쓴다(순서는 공고문 순서다).
 */
function repTypeOf(d, area) {
  const all = (d.price?.byTypeAll || []).filter((t) => t.m2 === area.m2);
  if (all.length) {
    const best = all.reduce((a, b) => (b.won > a.won ? b : a));
    const hit = d.price?.byArea?.find((x) => x.m2 === area.m2);
    if (hit && hit.won !== best.won)
      throw new Error(
        `${d.id}: ${area.m2}㎡ 의 byArea(${hit.won}) 와 byTypeAll 최고가(${best.won})가 다르다 — 어느 쪽이 틀렸는지 확인할 것`,
      );
    /* `replace` 는 문자열 **첫 일치**를 지운다 — 청약홈 정식 표기(`084.7402A`)를 넣는 날
       m2=84 가 "084." 안의 84 를 먹어 라벨이 `840.7402A` 로 나간다(AS팀 2026-08-14).
       앞머리에 붙어 있을 때만 벗긴다. */
    const t = best.type;
    return (t.startsWith(String(area.m2)) ? t.slice(String(area.m2).length) : t) || "";
  }
  return (area.types || []).find((x) => x && x !== "-") || "";
}

const RARE_SHARE = 0.005;
function splitRareAreas(d, total) {
  const areas = d.areas || [];
  if (areas.length <= 4 || !total) return { keep: areas, drop: [] };
  const rare = areas.filter((a) => a.units != null && a.units / total < RARE_SHARE);
  if (!rare.length || areas.length - rare.length < 1) return { keep: areas, drop: [] };
  return { keep: areas.filter((a) => !rare.includes(a)), drop: rare };
}

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
    /* ── 밴드가 무엇을 말하나 (2026-08-26) ──
     * 무순위는 보통 분양가를 청약홈이 감춰서("사업주체 문의") 밴드가 **잔여 세대**를 말한다.
     * 그런데 **공급금액이 공고에 찍혀 나오는 줍줍**이 있다(구리역 롯데캐슬: 82B 1세대 8억7,710만원).
     * 그런 카드에서 밴드가 "82㎡ 1세대"를 말하면, 바로 아래 제원 줄이 같은 '1세대'를 또 말해
     * **한 카드가 같은 수를 두 번** 하게 된다. 독자가 먼저 묻는 것도 "얼마냐"다.
     * → 타입별 금액을 알면 밴드는 **금액**을 말하고, 잔여 세대는 아래 제원 줄이 맡는다.
     * 금액을 모르면(송도) 지금까지처럼 잔여 세대를 말한다 — 확정본 픽셀은 그대로다. */
    const priced = (d.price?.byType || []).filter((t) => t.won != null);
    if (priced.length) {
      const sumP = priced.reduce((a, b) => a + (b.units || 0), 0);
      if (priced.some((t) => t.units != null) && sumP !== total)
        throw new Error(`${d.id}: 타입별 세대수 합 ${sumP} ≠ 총 공급 ${total} — 표가 공고와 다르다`);
      return {
        head: ["타입별 공급금액"],
        cols: Math.min(priced.length, 4),
        rows: priced.map((t) => ({ area: t.type, price: eok1(t.won), main: !!t.main })),
      };
    }
    const rows = d.areas.map((a) => ({ area: `${a.m2}㎡`, price: `${n(a.units)}세대` }));
    const sum = d.areas.reduce((s, a) => s + a.units, 0);
    if (sum !== total)
      throw new Error(`${d.id}: 면적대별 잔여 세대 합 ${sum} ≠ 총 공급 ${total} — 어느 쪽이 틀렸는지 확인할 것`);
    if (rows.length > 6) throw new Error(`${d.id}: 면적대가 ${rows.length}개다 — 판이 카드를 넘긴다`);
    /* 잔여 세대 값("68세대")은 분양가("11.9억")보다 짧아 한 줄에 다섯까지 들어간다.
       두 줄로 접히면 종이 단이 길어져 푸터를 민다(검수가 잡았다) — 열 수는 값의 길이가 정한다. */
    return { head: ["전용면적별 잔여 세대"], cols: rows.length <= 5 ? rows.length : 3, rows };
  }
  /* 면적대별 세대수 합 = 총 공급. 무순위에는 있던 검산이 분양 예정에는 없었다(AS팀 2026-08-14) —
     `applyhomeNo` 가 없는 카드는 `총 세대수 불일치` 가드까지 죽어 검산이 하나도 안 남는다.
     게다가 `total` 은 희소 면적대 판정의 **분모**라, 틀린 total 은 어느 칸을 뺄지까지 조용히 바꾼다. */
  if (d.areas.every((a) => a.units != null)) {
    const sum = d.areas.reduce((s, a) => s + a.units, 0);
    if (sum !== total)
      throw new Error(`${d.id}: 면적대별 세대수 합 ${sum} ≠ 총 공급 ${total} — 어느 쪽이 틀렸는지 확인할 것`);
  }
  const { keep, drop } = splitRareAreas(d, total);
  const rows = keep.map((a) => {
    const hit = d.price?.byArea?.find((x) => x.m2 === a.m2);
    /* 검산은 라벨을 안 쓰는 칸에서도 돌린다 — 아래 `m2To` 가 있는 칸은 라벨로 쓰지 않지만,
       byArea 와 byTypeAll 최고가가 어긋나면 여기서 던져야 한다(그게 이 함수의 안전장치다). */
    const repType = repTypeOf(d, a);
    return {
      /* ⚠️ 라벨과 금액은 **같은 타입**의 것이어야 한다(2026-08-14 실측 사고).
         롯데캐슬 84㎡ 는 A~F 여섯 타입이고 최고가는 84E(16.38억)인데, 라벨은 첫 타입 84A 를
         찍고 있었다 — 카드가 "84A 가 16.4억"이라고 **없는 말**을 하는 셈이다(84A 최고는 16.3억).
         타입별 값이 있으면 **최고가를 낸 그 타입**을 라벨로 쓴다. 손으로 고르지 않는다. */
      /* ⚠️ 오피스텔은 한 '군' 안에 전용면적이 조금씩 다른 타입이 섞인다(4군: 117·118·119·120㎡).
         그걸 대표타입 하나로 찍으면 카드가 나머지 세 면적을 없는 것으로 만든다. 면적대에
         `m2To` 가 있으면 **범위**로 말한다 — 범위도 코드가 데이터에서 만든다(손으로 안 적는다). */
      area: a.m2To && a.m2To !== a.m2 ? `${a.m2}~${a.m2To}㎡` : `${a.m2}${repType}`,
      /* 범위 라벨(`114~115㎡`)은 대표타입 라벨(`84A`)의 두 배 길이다. 금액과 같은 크기로 두면
         이 칸 하나가 공통 수치 크기를 통째로 끌어내린다 — 그래서 범위일 때만 작게 찍는다
         (오너 지시 2026-09-03). 판단은 데이터가 한다: 범위인가 아닌가. */
      ...(a.m2To && a.m2To !== a.m2 ? { small: true } : {}),
      /* 면적대에 붙는 꼬리표 — `114~115㎡ (국평)`. 데이터가 준 말만 붙인다(코드가 짓지 않는다). */
      ...(a.note ? { note: a.note } : {}),
      price: hit ? eok1(hit.won) : "미고지",
      /* 주력 면적대 한 줄만 코발트로. 강조가 둘이면 강조가 아니다. */
      main: d.mainArea?.m2 === a.m2,
      /* ⚠️ 강조는 **금액에만** 준다 — 꼬리표(`(국평)`)가 붙어도 라벨은 회색이다.
         2026-09-03 에 라벨까지 칠해 봤다가 오너가 되돌렸다("가격은 파랑 컬러로"):
         한 칸 안에 강조가 둘이면 어느 쪽도 강조가 아니게 된다. */
    };
  });
  /* ⚠️ 방어선이 `> 6` 하나였는데, **5칸이면 이미 푸터가 47px 밀린다**(AS팀 2026-08-14 실측:
     5칸 → error 6건). 6칸은 89px. 즉 6까지 통과시키던 옛 문턱은 렌더에서 깨지는 값을 통과시켰다.
     밴드가 한 줄에 담는 한계는 **4칸**이다 — 그 위는 만들지 않는다. */
  if (rows.length > 4)
    throw new Error(
      `${d.id}: 밴드에 넣을 면적대가 ${rows.length}개다 — 5칸부터 종이 단이 길어져 푸터를 민다(실측).` +
        ` 데이터에서 묶거나, 희소 면적대(총 공급의 ${RARE_SHARE * 100}% 미만)로 갈라 아래 한 줄로 보낼 것`,
    );
  /* 머리글은 한 덩어리로 쓴다(오너 지시 2026-08-03): "타입별 분양가(최고가 기준)".
     이전엔 왼쪽 라벨과 오른쪽 단서를 갈라 놨는데, 둘은 한 문장이라 붙여 읽어야 뜻이 산다. */
  const basis = d.price?.headline?.note || (d.price?.byArea ? "최고가 기준" : "");
  return {
    head: [basis ? `타입별 분양가(${basis})` : "타입별 분양가"],
    /* 열 수는 개수가 정한다. 위에서 4칸을 넘기지 않으므로 늘 한 줄이다 —
       손으로 "2열"이라 박으면 평형이 셋인 단지에서 한 칸이 빈다. */
    cols: rows.length,
    rows,
    /* 표에서 뺀 희소 면적대. presale 이 받아 아래 한 줄로 넘긴다 — 정보는 사라지지 않는다. */
    drop,
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
  /* 단위는 '세대'로 통일한다(오너 지시) — 단, 그건 **주택** 카드의 규칙이다.
     오피스텔은 공고문도 법도 '실'로 센다. 651실을 '651세대'라 적으면 카드가 틀린 말을 한다.
     그래서 오피스텔에서만 '실'이고, 그 판단은 propertyType 이 한다 — 손으로 적지 않는다. */
  const unit = isOfficetel(d) ? "실" : "세대";
  return [
    {
      label: unit === "실" ? "실수" : "세대수",
      /* '651실' 만으로는 이번 공급분인지 단지 전체인지 카드가 말하지 못한다 — 층수의 `최고`
         와 같은 자리에 `총` 을 붙인다(오너 지시 2026-09-03). 아파트는 종전 그대로 둔다:
         확정본 픽셀이 걸려 있고, 거기서는 '2,432세대'가 이미 전체로 읽힌다. */
      ...(unit === "실" ? { pre: "총" } : {}),
      value: n(aptTotal + ot),
      unit,
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
/* 오피스텔인가 — 판형은 그대로 두고 **칸의 뜻만** 바뀐다(무순위 카드가 이미 쓰는 방식).
   손으로 "이번엔 오피스텔 판" 하고 켜지 않는다. 데이터의 propertyType 하나가 정한다. */
const isOfficetel = (d) => d.propertyType === "officetel";

function presale(d) {
  if (d.kind !== "presale") throw new Error(`${d.id} 는 presale 이 아니다`);
  /* 오피스텔에는 특별공급도 순위도 없다(「건축물의 분양에 관한 법률」). 데이터에 그 값이 들어와
     있으면 APT 공고를 오피스텔로 잘못 표시한 것이다 — 조용히 무시하지 않고 던진다. */
  if (isOfficetel(d) && (d.schedule?.special || d.schedule?.first))
    throw new Error(`${d.id}: 오피스텔에는 특별공급·1순위가 없다 — schedule.receipt 로 접수일 하루를 적을 것`);
  const ah = noticeFacts(d);
  const total = ah ? ah.supply : d.total;
  /* 규모 우선 판은 kind 가 아니라 **데이터**가 켠다 — price.byType 이 있으면 이 판이다.
     분양 예정 카드도 2026-08-08 오너 지시로 이 판을 쓴다(장위 카드와 같은 배치). */
  const plan = scalePlan(d, total);
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

  /* 밴드를 한 번만 만든다 — 표에서 빠진 희소 면적대(펜트하우스 등)를 아래 한 줄이 받아야 하므로
     결과를 들고 있어야 한다. 두 번 부르면 계산이 두 벌이 되고 언젠가 둘이 어긋난다. */
  const band = plan.on ? plan.grid : priceTable(d, total);
  const rare = band.drop || [];
  /* 표에서 뺀 정보를 받아 주는 줄. flags 와 **섞지 않는다** — 섞으면 되찾을 때 문자열에 기대게 되고,
     그러면 문구 한 낱말만 바꿔도 줄이 조용히 사라진다(AS팀 2026-08-14). */
  const carried = [];
  if (rare.length) {
    /* 문구는 데이터가 만든다 — 타입·금액을 손으로 적지 않는다.
       표기는 **`타입(가격), 타입(가격)`** (오너 지시 2026-08-14). 범위(`47.5억~60.4억`)로 접으면
       어느 타입이 얼마인지 사라지고, 면적만 나열하면 그 사이에 다른 면적이 더 있는 것처럼 읽힌다.
       세 형뿐이라 하나씩 다 적는 것이 가장 정확하고 가장 짧다. */
    const parts = rare.map((a) => {
      const label = `${a.m2}${repTypeOf(d, a)}`;
      const won =
        (d.price?.byTypeAll || []).filter((t) => t.m2 === a.m2).reduce((m, t) => Math.max(m, t.won), 0) ||
        d.price?.byArea?.find((x) => x.m2 === a.m2)?.won;
      return won ? `${label}(${eok1(won)})` : label;
    });
    carried.push(`<i class="em">💎</i>펜트하우스 ${parts.join(", ")}`);
  }

  return {
    /* 판형은 둘이다(오너 확정 2026-09-03): 표지형 `danji-cover@1` 과 좌우형 `danji-cover-split@1`.
       고르는 것은 데이터이고, 안 고르면 표지형이다 — 기존 확정본이 전부 그 판이기 때문이다. */
    template: d.template || "danji-cover@1",
    date,
    kind: "presale",
    /* 고정 부제 + 날짜. 손으로 적지 않는다 — 적는 순간 다음 카드에서 날짜가 굳는다. */
    topcap: `오늘의 주요 청약 이슈 (${date.replace(/-/g, ".")})`,
    /* 단지마다 제목을 오너가 직접 쓸 때가 있다 — 그때는 데이터셋이 문형을 이긴다.
       셋 중 위에서부터 이긴다: 줄까지 나눈 `titleLines`(좌우 판형은 세 줄이다) →
       한 줄 `titleHtml` → 코드가 만드는 문형. */
    titleLines: d.titleLines?.length ? d.titleLines : d.titleHtml ? [d.titleHtml] : titleFor(d, { total, repWon }),
    hero: heroOf(d),
    /* 카드에 적는 이름 — 공고상의 정식 명칭이 길면 `displayName` 이 이긴다(오너 지시 2026-09-03:
       "목동윤슬자이 오피스텔" → "목동윤슬자이"). 데이터의 `name` 은 공고와 대조하는 열쇠라
       그대로 두고, **보이는 이름만** 바꾼다 — 둘을 한 필드로 합치면 대조가 헐거워진다. */
    danji: { name: d.displayName || d.name, ...(d.logo ? { logo: d.logo } : {}), ...(d.company ? { company: d.company } : {}) },
    address: addressOf(d),
    ...(plan.on ? { scale: true, specFour: plan.four } : {}),
    spec: plan.on ? plan.cells : specCells(d, total),
    /* `drop` 은 아래 한 줄이 이미 받아 갔다 — 카드 계약(priceTable)에 남기지 않는다.
       템플릿이 안 쓰는 필드를 실어 보내면 판형 회귀 기준(sample.json)과 어긋날 소지가 있다. */
    priceTable: (({ drop: _drop, ...rest }) => rest)(band),
    /* 일정 4칸(오너 지시 2026-08-03) — 특공·1순위·당첨자 발표·입주 예정.
       당첨자 발표일은 청약홈 PRZWNER_PRESNATN_DE 에서 수집기가 이미 읽어 둔다(announceDate). */
    /* 오피스텔은 앞의 두 칸이 다른 것을 말한다(오너 확정 2026-09-03).
       특별공급·1순위가 없는 대신 **접수 하루**와 **계약체결**이 독자의 실제 일정이다 —
       오피스텔 계약금은 청약 나흘 뒤에 걸리므로 계약일이 카드에 있어야 한다. */
    schedule: isOfficetel(d)
      ? [
          { label: "청약접수", date: ah?.receiptFrom ? md(ah.receiptFrom) : "미고지", tbd: !ah?.receiptFrom },
          { label: "당첨자 발표", date: ah?.announceDate ? md(ah.announceDate) : "미고지", tbd: !ah?.announceDate },
          { label: "계약체결", date: ah?.contractFrom ? md(ah.contractFrom) : "미고지", tbd: !ah?.contractFrom },
          { label: "입주 예정", date: ymKo(moveInYm), tbd: !moveInYm },
        ]
      : [
          { label: "특별공급", date: ah?.specialFrom ? md(ah.specialFrom) : "미고지", tbd: !ah?.specialFrom },
          { label: "1순위", date: ah?.rank1From ? md(ah.rank1From) : "미고지", tbd: !ah?.rank1From },
          { label: "당첨자 발표", date: ah?.announceDate ? md(ah.announceDate) : "미고지", tbd: !ah?.announceDate },
          { label: "입주 예정", date: ymKo(moveInYm), tbd: !moveInYm },
        ],
    /* 한줄평이 있으면 그게 아래 한 줄이다 — 특이사항 나열보다 한 문장이 오래 남는다. */
    notice: noticeOf(d, flags, carried),
    /* 최하단 문구를 한 급 작게(오너 지시 2026-09-03). 기본 34px 는 두 줄이 되면 무게가 커서
       종이의 마지막 말이 표보다 세진다. 옵트인이라 기존 확정본 픽셀은 그대로다. */
    ...(d.noteSmall ? { noteSmall: true } : {}),
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
/**
 * 줍줍 **기본 판형** — 분양가 · 시세 · 안전마진 세 칸 (오너 확정 2026-08-26).
 *
 * 정본은 송파 시그니처 롯데캐슬 카드(2026-08-11)다. 그 카드는 손으로 만들었고,
 * 오너가 그걸 "줍줍 기본 템플릿"으로 승격시켰다 — 그래서 여기로 옮겨 코드가 만든다.
 * 손으로 만들면 안전마진을 손으로 빼게 되고, 빼기는 언젠가 틀린다.
 *
 * ── 이 함수가 지키는 것 (오보 0)
 * ① **안전마진은 코드가 뺀다.** 데이터셋에 안전마진을 적는 칸을 만들지 않았다.
 * ② **비교값의 이름을 반드시 받는다.** `margin.market.label` 이 없으면 던진다.
 *    "최근 실거래가"와 "최근 호가"는 다른 말이다 — 호가를 실거래라 적으면 그게 오보다.
 *    구리역(2026-08-26)에서 실제로 갈렸다: 호가 14억이면 5.2억, 같은 단지 분양권
 *    실거래 11.87억이면 3.1억. 카드가 어느 쪽인지 말하지 않으면 독자는 실거래로 읽는다.
 * ③ 안전마진이 0 이하면 던진다 — 마이너스 마진을 '안전마진'이라 부를 수는 없다.
 */
function marginBand(d) {
  const m = d.margin;
  if (!m) return null;
  const priceWon = m.priceWon ?? (d.price?.byType || []).find((t) => t.main)?.won;
  if (!priceWon)
    throw new Error(`${d.id}: 안전마진 판은 분양가가 있어야 한다 (margin.priceWon 또는 price.byType[].main)`);
  if (!m.market?.label || m.market?.won == null)
    throw new Error(
      `${d.id}: 안전마진 판은 비교값의 **이름과 금액**이 둘 다 있어야 한다 (margin.market.label / margin.market.won).` +
        ` '최근 실거래가'인지 '최근 호가'인지 카드가 스스로 말해야 한다 — 안 적으면 독자는 실거래로 읽는다.`,
    );
  if (!m.market.source)
    throw new Error(`${d.id}: 비교값의 출처(margin.market.source)가 있어야 한다 — 카드 밖에서라도 되짚을 수 있어야 한다`);
  const gap = m.market.won - priceWon;
  if (gap <= 0)
    throw new Error(`${d.id}: 안전마진이 0 이하다 (비교값 ${m.market.won} ≤ 분양가 ${priceWon}) — 이 판형을 쓸 수 없다`);
  /* 타입 칸(오너 지시 2026-08-26) — 값 셋이 전부 '억'이라 **무엇의 값인지**가 안 보였다.
     맨 왼쪽에 타입을 세우면 세 금액이 전부 그 타입의 것임이 한눈에 읽힌다.
     타입은 데이터가 주거나(margin.type) 주력 타입에서 온다 — 손으로 적지 않는다. */
  const type = m.type ?? (d.price?.byType || []).find((t) => t.main)?.type ?? null;
  const rows = [
    ...(type ? [{ area: "타입", price: type }] : []),
    { area: m.priceLabel || "분양가", price: eok1(priceWon), main: true },
    { area: m.market.label, price: eok1(m.market.won) },
    { area: "안전마진", price: eok1(gap), warn: true, glow: true },
  ];
  return { head: [], cols: rows.length, rows, gap };
}

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

  /* ── 규모 우선 판 (오너 확정 2026-08-06 장위, 2026-08-08 분양 예정까지 확장) ──
   * 위 단 = 단지 규모 4칸, 아래 단 = 타입별 세대수·최고 분양가. `scalePlan` 이 공통이다.
   * `price.byType` 이 없으면 예전 판 그대로 — 확정된 카드(한강·송도)의 픽셀을 건드리지 않는다. */
  const plan = scalePlan(d, total);

  /* 줍줍 기본 판형(분양가·시세·안전마진)이 있으면 그게 이긴다 — 오너가 정본으로 세운 판이다.
     없는 단지는 예전 판 그대로다(확정된 카드의 픽셀을 건드리지 않는다). */
  const margin = marginBand(d);

  return {
    /* 판형은 둘이다(오너 확정 2026-09-03): 표지형 `danji-cover@1` 과 좌우형 `danji-cover-split@1`.
       고르는 것은 데이터이고, 안 고르면 표지형이다 — 기존 확정본이 전부 그 판이기 때문이다. */
    template: d.template || "danji-cover@1",
    date,
    kind: "remndr",
    topcap: `오늘의 주요 청약 이슈 (${date.replace(/-/g, ".")})`,
    /* 무순위 문형(오너 확정): "{훅} 무순위 줍줍 {N}세대" — 분양가를 못 쓰니 규모가 제목을 진다.
       단지마다 제목이 달라야 할 때가 있다(오너가 직접 쓴 제목). 그때는 데이터셋이 이긴다. */
    titleLines: [
      d.titleHtml ||
        /* 안전마진 판이면 제목도 안전마진이 진다 — 표에서 빨간 칸이 말하는 것을 제목이 되받는다.
           금액은 `up`(빨강)이다. `hi`(코발트)로 적으면 표의 빨간 칸과 색이 어긋난다. */
        (margin
          ? `<span class="hi">${hook}</span> 안전마진 <span class="up">${eok1(margin.gap)}</span> 줍줍!`
          : `<span class="hi">${hook}</span> 무순위 줍줍 <span class="hi">${n(total)}세대</span>`),
    ],
    hero: heroOf(d),
    /* 카드에 적는 이름 — 공고상의 정식 명칭이 길면 `displayName` 이 이긴다(오너 지시 2026-09-03:
       "목동윤슬자이 오피스텔" → "목동윤슬자이"). 데이터의 `name` 은 공고와 대조하는 열쇠라
       그대로 두고, **보이는 이름만** 바꾼다 — 둘을 한 필드로 합치면 대조가 헐거워진다. */
    danji: { name: d.displayName || d.name, ...(d.logo ? { logo: d.logo } : {}), ...(d.company ? { company: d.company } : {}) },
    address: addressOf(d),
    ...(margin ? { specFour: true } : plan.on ? { scale: true, specFour: plan.four } : {}),
    /* 안전마진 판에서는 위 단이 이미 '돈' 세 칸이라, 아래 단은 **단지 규모**가 맡는다
       (송파 정본과 같은 자리). 잔여 세대수는 아래 한 줄이 받는다 — 카드에서 사라지지 않는다. */
    spec: margin
      ? [
          /* 잔여 세대 칸(오너 지시 2026-08-26). 처음엔 아래 한 줄로 내렸는데, 줍줍에서
             '몇 세대 남았나'는 규모와 나란히 읽혀야 하는 값이라 제원 줄 맨 앞으로 올렸다. */
          { label: "잔여", value: n(total), unit: "세대", pre: "잔여" },
          { label: "세대수", pre: "총", value: n(d.totalComplex ?? total), unit: "세대" },
          d.buildings != null
            ? { label: "동수", pre: "총", value: String(d.buildings), unit: "개동" }
            : { label: "동수", value: "미고지", tbd: true },
          d.topFloor != null
            ? { label: "최고 층수", pre: "최고", value: String(d.topFloor), unit: "층" }
            : { label: "최고 층수", value: "미고지", tbd: true },
        ]
      : plan.on
      ? plan.cells
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
    /* `gap` 은 제목이 이미 받아 갔다 — 카드 계약에 남기지 않는다(템플릿이 안 쓰는 필드). */
    priceTable: margin
      ? (({ gap: _gap, ...rest }) => rest)(margin)
      : plan.on
        ? plan.grid
        : priceTable(d, total),
    schedule,
    /* 한줄평이 있으면 그게 아래 한 줄이다 — 특이사항 나열보다 한 문장이 오래 남는다. */
    notice: noticeOf(d, flags),
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
    /* 판형은 둘이다(오너 확정 2026-09-03): 표지형 `danji-cover@1` 과 좌우형 `danji-cover-split@1`.
       고르는 것은 데이터이고, 안 고르면 표지형이다 — 기존 확정본이 전부 그 판이기 때문이다. */
    template: d.template || "danji-cover@1",
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
/* 발행 게이트는 카드마다 다르다 — 공고문으로 대조한 카드에까지 "보도값이다"라고 찍으면
   그 경고가 거짓이 되고, 거짓 경고는 곧 안 읽히는 경고가 된다(CARD_CHECKLIST: 맞는 것을
   매번 지적하면 지적을 안 읽게 된다). 그래서 **아직 대조 안 된 카드만** 이름을 부른다. */
const unverified = [];
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
  /* ⚠️ `byArea` 만 보면 **분양가를 `byType` 에만 담은 카드가 조건에서 통째로 빠진다** —
     장위·드파인·송파(모두 `verified:false`, sets.json 은 '발행 보류')에 초록불이 켜졌다
     (AS팀 2026-08-14). 과잉 경고를 고치려다 **거짓 안심**을 만든 것이라 더 나쁘다. */
  const hasPrice = d.price?.byArea?.length || d.price?.byType?.length || d.price?.byTypeAll?.length;
  if (hasPrice && !d.price?.verified) unverified.push(d.id);
  console.log(`${slug} — ${card.danji.name}`);
  console.log(`   ${card.topcap} · ${card.titleLines.join(" ").replace(/<[^>]+>/g, "")}`);
  /* 규모 우선 판에서는 아래의 '타입' 줄이 같은 것을 이미 찍는다 — 두 번 찍지 않는다. */
  if (!card.scale)
    console.log(`   ${card.spec.map((c) => `${c.label} ${c.value}${c.unit || ""}`).join(" · ")}`);
  if (card.address) console.log(`   ${card.address}`);
  /* 규모 우선 판에서는 위 단이 '단지 규모'(area/price)고 타입·분양가는 spec 쪽으로 간다.
     한쪽 모양만 알고 찍으면 "undefined 8.8억" 이 나온다 — 두 모양을 다 읽는다. */
  const band = card.priceTable.rows.map((r) => `${r.area} ${r.price}`).join(" · ");
  const types = card.scale ? card.spec.map((c) => `${c.above} ${c.value}`).join(" · ") : null;
  console.log(`   ${card.scale ? "규모" : "평형"} ${band}`);
  if (types) console.log(`   타입 ${types}`);
  console.log(`   일정 ${card.schedule.map((s) => `${s.label} ${s.date}`).join(" · ")}`);
}

if (skipped.length) {
  console.log(`\n⏭  아직 못 만드는 단지 ${skipped.length}곳 — 데이터가 덜 찼습니다:`);
  for (const [id, msg] of skipped) console.log(`   · ${id}: ${msg}`);
}
console.log(`\n✅ ${made}장 생성 → ${PUBLISH ? `data/content/${date}/` : "data/out/_spike/"}`);
if (unverified.length)
  console.log(
    `⚠ 분양가가 아직 보도값인 카드 ${unverified.length}곳 — 입주자모집공고문 대조 전까지 발행 금지: ${unverified.join(", ")}`,
  );
else console.log("✅ 이번에 만든 카드의 분양가는 모두 입주자모집공고문으로 대조된 값입니다(price.verified).");
