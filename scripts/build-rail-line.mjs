/**
 * 서울 수도권 주요 노선 공사 현황 카드 8장 (`rail-line@1`).
 *
 * ── 이 카드가 지키는 것
 * ① **공정률은 한 기준일로만 말한다.** 전부 국가철도공단 「주요사업현황」 '26.6월 값이다.
 *    `progressAsOf` 가 없거나 데이터셋 기준일과 다르면 던진다.
 * ② **환승 표기는 카탈로그에서만 나온다.** `templates/_shared/metro-lines.json` 에 없는
 *    키를 쓰면 metroBadge 가 조용히 회색 글자로 폴백한다 — 그게 카드로 나가면 오보다.
 * ③ **노선 표시색을 손으로 정하지 않는다.** 카탈로그의 그 노선 색을 코드가 집는다.
 * ④ **개통 목표는 목표치다.** '확정' 같은 단정 표현이 문구에 섞이면 던진다.
 *    GTX-C 는 협약에서 준공 연도가 삭제돼 연도를 쓰지 않는다.
 * ⑤ **개통 줄에는 근거를 병기한다**(2026-09-07 사고). 숫자만 적으면 승인된 사실로 읽힌다.
 * ⑥ **예상 공사기간은 코드가 센다.** 착공(YYYY.MM)과 개통 목표에서 계산하고,
 *    개통이 '미정'이면 **산정하지 않는다** — 없는 값을 지어내지 않는다.
 * ⑦ **세로가 넘치지 않게 행 수를 잰다.** 지선 블록이 있으면 그만큼 본문이 줄어든다.
 *
 * ⚠️ **현실 전망 연도를 만들지 않는다.** 8개 중 지연 전망을 실제로 말한 자료가 있는 것은
 *    신안산선·GTX-B·GTX-C 셋뿐이다. 공정률로 역산해 연도를 적으면 추정이 사실이 된다.
 *    화살표 오른쪽은 **현재 공식 목표**이고, 그것만으로도 당초 대비 3~7년 지연이 드러난다.
 *
 * 실행: node scripts/build-rail-line.mjs [날짜] [--publish]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 10);
const publish = argv.includes("--publish");

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/sudo-rail-2026-09.json"), "utf8"));
if (doc.meta?.verified !== true) throw new Error("데이터셋이 verified:true 가 아니다 — 카드로 못 만든다 (CLAUDE.md §8)");
if (!doc.meta.asOf || !doc.meta.asOfLabel) throw new Error("meta.asOf / asOfLabel 이 없다 — 기준일 없이 카드를 만들지 않는다");

const CAT = JSON.parse(readFileSync(join(ROOT, "templates/_shared/metro-lines.json"), "utf8"));
const SELF = { sinansan: "신안산", gtxa: "GTX-A", gtxb: "GTX-B", gtxc: "GTX-C",
               indong: "인동", wolpan: "월판", sinbundang: "신분당", daejang: "대홍" };
const BAN = /개통일\s*확정|확정\s*개통|개통\s*확정|준공\s*확정/;

/* 세로 예산 — 카드 1350 − 상단 72 − topcap − 머리(제목·구간·괘선) − 각주 − 푸터 ≈ 880px */
const BODY_H = 880, ROW_MIN = 44, BRANCH_H = 108, NOTE_H = 62;

const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgba = (h, a) => { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; };

const MAP_CLS = { 개통: "s-open", 미개통: "", 가칭: "s-prov", 역명미정: "s-prov", 추가역: "" };
/* 🔴 「가칭」·「역명 미정」 꼬리표는 **역 옆에서 뺐다**(오너 2026-09-09:
   "가칭은 역명 말고 푸터 위에 몰아서 살짝 표시해줘"). 인동선은 17역 중 14역,
   신안산선은 12역이 가칭이라 같은 두 글자가 열 번 넘게 반복돼 눈이 그것만 읽었고,
   열 폭도 역마다 44px 씩 부풀어 있었다. 이제 **회색 점·회색 이름**이 그 뜻을 지고,
   푸터 위 각주 한 줄이 그 규칙을 설명한다(PROV_NOTE).
   ⚠️ 「추가역」은 남긴다 — 가칭이 아니라 **나중에 추가된 역**이라는 다른 사실이고,
      GTX-B 2역·GTX-C 4역뿐이라 반복되지 않는다. 회색으로 칠하지도 않는다. */
const PROV = { 가칭: "", 역명미정: "", 추가역: "추가역" };
const PROV_NOTE = "회색 = 역명 미확정(가칭)";

/* ⑥ 예상 공사기간 — 착공 YYYY.MM 과 개통 목표에서 센다. 개통이 미정이면 산정하지 않는다. */
function buildPeriod(start, openNow) {
  const s = /^(\d{4})\.(\d{2})$/.exec(start || "");
  if (!s) throw new Error(`착공 표기가 YYYY.MM 이 아니다: ${start}`);
  const y = /(\d{4})\s*년/.exec(openNow || "");
  if (!y) return { value: "산정 불가", note: "개통 목표가 정해지지 않았다" };
  const endM = /말/.test(openNow) ? 12 : /(\d{1,2})\s*월/.exec(openNow) ? +/(\d{1,2})\s*월/.exec(openNow)[1] : 12;
  const months = (+y[1] - +s[1]) * 12 + (endM - +s[2]);
  if (months <= 0) throw new Error(`공사기간이 0 이하다: ${start} → ${openNow}`);
  const yy = Math.floor(months / 12), mm = months % 12;
  return { value: `약 ${yy}년${mm ? ` ${mm}개월` : ""}`, note: `${start.replace(".", "년 ")}월 착공 ~ ${openNow}` };
}

/* 당초 목표 → 현재 목표가 **얼마나 밀렸는지**도 코드가 센다. 캡션 문장에 손으로
   "3년 밀렸다"고 적으면 데이터가 바뀔 때 문장만 남는다(§2 가 오보가 나는 자리라 부르는 곳).
   양쪽 다 월(또는 '말')이 있으면 개월로, 한쪽이라도 연도뿐이면 **연 단위로만** 센다 —
   없는 정밀도를 지어내지 않는다. 개통이 '미정'이면 null 이고 캡션이 문장을 바꾼다. */
function buildDelay(openWas, openNow) {
  const parse = (t) => {
    const y = /(\d{4})\s*년/.exec(t || "");
    if (!y) return null;
    const m = /말/.test(t) ? 12 : /(\d{1,2})\s*월/.exec(t) ? +/(\d{1,2})\s*월/.exec(t)[1] : null;
    return { y: +y[1], m };
  };
  const a = parse(openWas), b = parse(openNow);
  if (!a || !b) return null;
  if (a.m == null || b.m == null) {
    const yy = b.y - a.y;
    return yy > 0 ? `${yy}년` : null;
  }
  const months = (b.y - a.y) * 12 + (b.m - a.m);
  if (months <= 0) return null;
  const yy = Math.floor(months / 12), mm = months % 12;
  return yy ? `${yy}년${mm ? ` ${mm}개월` : ""}` : `${mm}개월`;
}

/* ⑧ 캡션 가드 (2026-09-07). 캡션을 사람 말투로 바꾸면서 **손글씨가 들어올 자리**가 생겼다.
   - capPoint(👉 한 줄)에는 숫자를 못 쓴다. 숫자가 필요하면 코드가 끼우는 자리로 간다.
   - capLines 의 숫자는 그 노선 데이터 또는 meta.flags(검증 기록)에 **그대로 있어야** 한다.
     '61.94' 를 '61.9' 로 옮겨 적는 식의 조용한 변형이 여기서 걸린다. */
const FLAGTEXT = JSON.stringify(doc.meta.flags || []);
function guardCaption(L) {
  if (!L.capPoint) throw new Error(`${L.name}: capPoint 가 없다 — 👉 한 줄은 필수다`);
  const d = L.capPoint.match(/\d/);
  if (d) throw new Error(`${L.name}: capPoint 에 숫자가 있다("${L.capPoint}") — 숫자는 코드가 넣는다`);
  /* ⚠️ 포함(includes)으로 대조하면 **61.9 가 61.94 안에 들어 있어 통과한다** —
     실제로 이 가드를 처음 짜고 일부러 61.94 를 61.9 로 바꿔봤더니 조용히 넘어갔다.
     그래서 양쪽을 **숫자 토큰 집합**으로 만들어 정확히 같은 값만 인정한다. */
  const NUM = /\d+(?:\.\d+)?/g;
  /* ⚠️ 그리고 **검사 대상을 대조표에 넣으면 안 된다** — JSON.stringify(L) 에 capLines 가
     그대로 들어 있어서, 61.9 로 고쳐 놓으면 그 61.9 가 스스로를 증명했다. 두 번째로 조용히
     통과했다. 캡션 필드를 뺀 나머지만 대조표로 쓴다. */
  const { capLines: _cl, capPoint: _cp, ...rest } = L;
  const pool = new Set((JSON.stringify(rest) + FLAGTEXT).match(NUM) || []);
  /* 날짜만 쪼갠다 — 착공이 "2024.01" 로 적혀 있으면 캡션의 "2024년 1월" 도 같은 사실이다.
     여기서 **모든** 소수를 쪼개면 61.94 가 61 과 94 를 통과시켜 검사가 헐거워지므로
     YYYY.MM 모양에만 적용한다. */
  for (const t of [...pool]) {
    const m = /^(\d{4})\.(\d{2})$/.exec(t);
    if (m) { pool.add(m[1]); pool.add(String(+m[2])); pool.add(m[2]); }
  }
  for (const line of L.capLines || [])
    for (const n of line.match(NUM) || [])
      if (!pool.has(n))
        throw new Error(`${L.name}: capLines 의 숫자 ${n} 이 데이터셋·검증기록 어디에도 없다 — 옮겨 적힌 값이다`);
}

const outDir = publish ? join(ROOT, `data/content/${date}`) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });
const missing = new Set();
let made = 0;

for (const L of doc.lines) {
  if (!L.progressAsOf) throw new Error(`${L.name}: progressAsOf 가 없다`);
  if (L.progressAsOf !== doc.meta.asOf) throw new Error(`${L.name}: 공정률 기준일이 데이터셋과 다르다`);
  if (!(L.progress >= 0 && L.progress <= 100)) throw new Error(`${L.name}: 공정률이 0~100 밖이다: ${L.progress}`);
  /* 카드에 찍는 것은 **공단 표기 그대로의 문자열**이다 — JSON 이 18.0 을 18 로 저장해
   * 월판선만 소수 자리가 사라졌다(2026-09-07). 값이 어긋나면 던진다. */
  if (!L.progressText) throw new Error(`${L.name}: progressText 가 없다`);
  if (Math.abs(Number(L.progressText) - L.progress) > 1e-9)
    throw new Error(`${L.name}: progressText(${L.progressText}) 와 progress(${L.progress}) 가 다르다`);

  const all = [...L.stations, ...(L.branch?.stations || [])];
  for (const s of all) for (const k of s.xfer || []) if (!CAT[k]) missing.add(`${L.name}/${s.name}: ${k}`);

  const selfKey = SELF[L.key];
  if (!selfKey || !CAT[selfKey]) throw new Error(`${L.name}: 카탈로그에 자기 노선(${selfKey}) 이 없다`);
  const lc = CAT[selfKey].color;

  const prose = [L.shared || "", L.badge || ""].join(" ");
  if (BAN.test(prose)) throw new Error(`${L.name}: 개통을 단정하는 표현이 있다 — 개통 목표는 목표치다`);
  if (L.key === "gtxc" && /\b20[23]\d/.test(L.openNow))
    throw new Error("GTX-C 는 준공 연도가 협약에서 삭제됐다 — 개통 연도를 쓰지 않는다");


  const mapSt = (s) => s.type === "gap"
    ? { gap: s.text }
    : { name: s.name, cls: MAP_CLS[s.state] ?? "", prov: PROV[s.state] || "", xfer: s.xfer || [] };

  /* 지선 — 분기점 이후 **좌우 두 갈래**로 갈라진다(오너 지시 2026-09-07, 첨부 노선도 방식).
   * 왼쪽이 본선 잔여, 오른쪽이 지선. 두 열의 역 수가 달라도 행 높이는 같아야 하므로
   * 전체 행 수 N = 분기 전 행 + max(본선 잔여, 지선) 으로 잡고, 분할 영역에
   * flex 를 그 max 만큼 준다. 레일 위치는 각 열 안의 (i+0.5)/n 으로 % 계산한다. */
  const pct = (v) => `${(v * 100).toFixed(3)}%`;
  const cen = (i, n) => (i + 0.5) / n;
  let head, split = null, NROW;
  if (L.branch) {
    const j = L.stations.findIndex((s) => s.name === L.branchAfter);
    if (j < 0) throw new Error(`${L.name}: branchAfter 「${L.branchAfter}」 가 본선에 없다`);
    head = L.stations.slice(0, j + 1).map((s) => mapSt(s));
    const main = L.stations.slice(j + 1).map((s) => mapSt(s));
    const branch = L.branch.stations.map((s) => mapSt(s));
    const rowsInSplit = Math.max(main.length, branch.length);
    NROW = head.length + rowsInSplit;
    /* 열 폭은 내용이 정한다 — 역명 글자수 × 26 + 뱃지 46 + 가칭 꼬리표 44 (실측 근사) */
    /* 열 폭은 내용이 정한다 — 역명 글자수 × 26 + 뱃지 46 + 꼬리표 44(추가역만 남았다) */
    const need = (rows) => Math.max(...rows.map((r) =>
      r.gap ? 200 : r.name.length * 26 + (r.xfer?.length || 0) * 46 + (r.prov ? 44 : 0)), 120);
    const wl = need(main), wr = need(branch);
    split = {
      flex: rowsInSplit, main, branch,
      cols: `${Math.round(wl)}fr ${Math.round(wr)}fr`,
      mainRail: main.length
        ? { top: "0%", h: pct(cen(main.length - 1, rowsInSplit)) }
        : null,
      /* 지선 레일은 **분할 영역 맨 위**(커넥터가 건너온 지점)에서 시작해 마지막 역까지 */
      brRail: { top: "0%", h: pct(cen(branch.length - 1, rowsInSplit)) },
      /* 커넥터: 분기역 점(왼쪽 열 x)에서 오른쪽 열 첫 점까지. 분할 영역 기준 좌표라
       * top 은 음수(분기역은 분할 영역 위쪽 행에 있다) — 열 폭의 절반만큼 가로로 건넌다. */
      /* 커넥터: 분기역 점(분할 영역 위로 반 행)에서 오른쪽 열 첫 점(아래로 반 행)까지 = 정확히 한 행 */
      /* 커넥터: 분기역 점(분할 영역 위로 반 행)에서 내려와 분할 상단에서 오른쪽으로 건넌다.
       * 거기서부터는 지선 레일(top:0%)이 그대로 이어받아 꺾임이 끊기지 않는다. */
      ...(main.length ? { conMain: true } : { conBranch: true }),
      con: main.length
        ? { left: `calc(var(--dotc) / 2 - var(--rail) / 2)`, top: pct(-0.5 / rowsInSplit),
            w: `calc(100% + 10px + var(--rail) / 2 + var(--dotc) / 2 - var(--dotc) / 2)`, h: pct(0.5 / rowsInSplit) }
        : { left: `calc(-44px + var(--dotc) / 2 - var(--rail) / 2)`, top: pct(-0.5 / rowsInSplit),
            w: "44px", h: pct(0.5 / rowsInSplit) },
    };
  } else {
    head = L.stations.map((s) => mapSt(s));
    NROW = head.length;
  }
  /* 분기가 있으면 본선 레일을 **분할 영역 상단까지** 잇는다 — 거기서 왼쪽 갈래 레일이 이어받는다.
   * 분기역에서 끊으면 광명↔목감·금정↔의왕이 끊어져 보인다(2026-09-07 오너 지적). */
  const rail = L.branch
    ? { top: pct(cen(0, NROW)), h: `calc(${pct(head.length / NROW - cen(0, NROW))} + 2px)` }
    : { top: pct(cen(0, NROW)), h: pct(cen(NROW - 1, NROW) - cen(0, NROW)) };

  /* 각주 한 줄 = 「회색 = 역명 미확정(가칭)」 + 「선로 공용 · …」. 둘 중 하나라도 있으면
     노선도 열이 그만큼 짧아진다 — 예산에서 먼저 빼지 않으면 행이 푸터를 밟는다. */
  const provAny = [...L.stations, ...(L.branch?.stations || [])]
    .some((st) => st.state === "가칭" || st.state === "역명미정");
  /* 가칭 범례가 앞에 붙는 노선은 각주가 한 줄 더 길어진다 — 그런 노선에서는
     공용 설명을 **줄인 판(sharedShort)** 으로 바꿔 문장이 어색하게 끊기는 걸 막는다.
     sharedShort 는 제 앞에 「선로 공용 — 」을 달고 있으므로 겹치지 않게 떼어낸다. */
  const sharedTxt = provAny && L.sharedShort
    ? L.sharedShort.replace(/^선로\s*공용\s*[—·-]\s*/, "")
    : L.shared;
  const note = [provAny ? `<b>◌</b> ${PROV_NOTE}` : "",
                sharedTxt ? `<b>선로 공용</b> · ${sharedTxt}` : ""].filter(Boolean).join("  ·  ");
  const avail = BODY_H - (note ? NOTE_H : 0);
  const rowH = avail / NROW;
  if (rowH < ROW_MIN)
    throw new Error(`${L.name}: 행이 ${NROW}개라 행 높이가 ${rowH.toFixed(1)}px — 환승 뱃지(40px)가 삐져나온다. 상한 ${Math.floor(avail / ROW_MIN)}행`);

  const period = buildPeriod(L.start, L.openNow);
  const facts = [
    { label: "착공", value: L.start },
    { label: "예상 공사기간", value: period.value },
    { label: "연장", value: L.km },
    { label: "정거장", value: L.stationNote },
    { label: "총사업비", value: L.cost },
    { label: "시행자", value: L.operator },
  ];

  const card = {
    template: "rail-line@1", date, lc, n: NROW, rail,
    subtitle: `서울 수도권 주요 노선 · 공사 현황 · ${doc.meta.asOfLabel} 기준`,
    title: `<span class="ln wirit-linecolor">${L.name}</span> ${L.titleAsk || "언제 개통하지?"}`,
    badge: L.badge, tone: L.tone,
    prog: { value: L.progressText, asOf: L.progressNote || `${doc.meta.asOfLabel} · 국가철도공단`,
            width: `${L.progress}%`, zero: L.progress === 0 },
    eta: { was: L.openWas, now: L.openNow },
    etaBg: `linear-gradient(180deg,#ffffff 0%,${rgba(lc, 0.09)} 100%)`,
    etaGlow: rgba(lc, 0.34),
    facts, shared: L.shared || "", note, head, ...(split ? { split } : {}),
    source: { name: L.src },
  };
  writeFileSync(join(outDir, `rail-${L.key}.json`), JSON.stringify(card, null, 2) + "\n");

  guardCaption(L);
  const delay = buildDelay(L.openWas, L.openNow);

  /* 캡션은 **카톡으로 보내는 말투**로 쓴다 (오너 지시 2026-09-07).
     그전 판본은 이모지도 후킹도 CTA 도 없는 평서문 나열이라 docs/CAPTION.md §4 형식과
     아예 갈라져 있었다 — 문서가 있는데도 이 판형만 제 형식을 안 따르고 있었다.
     ⚠️ **말투만 사람 몫이고 숫자는 여전히 코드 몫이다**(§2). 밀린 기간은 buildDelay 가 세고,
     capPoint 에는 숫자를 못 쓰게 막고, capLines 의 숫자는 데이터셋·검증기록과 대조한다.
     ⚠️ null 은 '이 줄 없음', "" 는 **빈 줄**이다. 예전 판본은 ""를 전부 걸러내서
     문단 구분이 통째로 사라진 채 벽글이 나갔다 — 그래서 두 값을 나눠 쓴다. */
  writeCaption(`rail-${L.key}`, [
    `🚇 ${L.name}, 지금 어디까지 왔을까요?`, "",
    `공정률 ${L.progressText}%`,
    `📅 당초 ${L.openWas} → 지금 ${L.openNow}`,
    delay ? `⏳ 당초 목표보다 ${delay} 밀렸습니다.` : "⏳ 새 개통 목표는 아직 없습니다.",
    ...(L.capLines ? ["", ...L.capLines] : []), "",
    `📍 ${L.start.replace(/^(\d{4})\.0?(\d{1,2})$/, "$1년 $2")}월 착공 · ${L.km} · ${L.stationNote}`,
    L.shared ? `🔗 선로 공용 — ${L.shared}` : null, "",
    `👉 ${L.capPoint}`, "",
    /* 맺음 블록은 **세트 전체가 같은 모양**이다 (오너 지시 2026-09-07).
       저장 유도 한 줄 → 구분선 → 출처 → 기준·주의(※). metro-speed 가 쓰던 형태이고,
       rail-line 만 출처 한 줄로 짧게 끝내고 있었다. 기준일은 데이터셋에서 꺼낸다. */
    "📌 저장해두고 우리 집 지나는 노선 언제 열리는지 확인하기",
    "—",
    `📊 출처 : ${L.src}`,
    `※ 공정률은 국가철도공단 「주요사업현황」 ${doc.meta.asOfLabel} 기준입니다.`,
    "※ 개통 시점은 목표치이며 확정 고시가 아닙니다.", "",
    "#수도권철도 #교통호재 #부동산 #위릿노트 #부동산공부",
  ].filter((x) => x !== null).join("\n"));
  made++;
}

if (missing.size)
  throw new Error(`환승 키가 카탈로그에 없다 — 뱃지가 회색 글자로 조용히 폴백한다:\n  ${[...missing].join("\n  ")}`);

console.log(`✅ rail-line ${made}장 → ${publish ? `data/content/${date}/` : "data/out/_spike/"}`);
console.log(`   기준일 ${doc.meta.asOfLabel} · 환승 키 전수 대조 통과 · 공사기간은 코드가 계산`);
