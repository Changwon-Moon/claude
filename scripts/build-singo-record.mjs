/**
 * 「오늘의 신고가」 단지 한 곳 카드 빌더 — singo-record@1
 *
 *   node scripts/build-singo-record.mjs --apt "상록마을(라이프2차)" --type 84 [--date 2026-08-13] [--publish]
 *
 * ── 읽는 것 (전부 코드가 받아 둔 1차 자료)
 * · `data/datasets/singo-log/{YYYY-MM}.json`      — 그 거래의 판정 결과(직전 최고가·갱신폭·돌파선)
 * · `data/datasets/singo-history/{구}-{단지}-{타입}.json` — 월별 최고가 곡선
 *
 * ── 이 파일이 지키는 것
 * ① **수치를 여기서 만들지 않는다.** 전부 위 두 파일에서 읽어 계산만 한다.
 * ② **"역대"라고 쓰지 않는다.** 기준선은 2020-01 이후다 — 문구는 데이터의 `from` 에서 뽑는다.
 * ③ 곡선의 x 는 **달을 균등하게** 놓는다. 거래가 있던 달만 촘촘히 놓으면 2년 공백이 사라져
 *    "쉬지 않고 올랐다"는 그림이 된다.
 * ④ 수집을 못 한 달(ok=false)이 사이에 있으면 **선을 끊는다.** 이어 버리면 모르는 구간을
 *    아는 것처럼 그리게 된다.
 * ⑤ SVG 안 글자는 디자인 검수가 재지 못한다(designQa 는 Range 로 재는데 SVG text 는 대상이
 *    아니다). 그래서 라벨이 판을 넘지 않는지 **여기서 계산해 확인하고, 넘으면 던진다.**
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const flag = (n) => process.argv.includes(`--${n}`);

/* ── 이름 정규화 — 수집기(parse/singo.ts)의 fullAptName 과 같은 규칙이어야 한다.
      괄호 안까지 살린다: 상록마을(라이프2차) → 상록마을라이프2차 */
const full = (s) =>
  String(s ?? "")
    .replace(/[()[\]]/g, "")
    .replace(/[\s·.\-_,]/g, "")
    .trim();

const eok = (manwon) => {
  const v = manwon / 10000;
  return `${v.toFixed(2).replace(/\.?0+$/, "")}억`;
};

const APT = arg("apt");
const TYPE = arg("type") ?? "84";
if (!APT) {
  console.error('사용법: node scripts/build-singo-record.mjs --apt "상록마을(라이프2차)" --type 84');
  process.exit(1);
}
const DATE = arg("date") ?? new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

/* ── 단지 개요를 실을 때 쓰는 대장 열쇠 (--kapt A46378521)
   ⚠️ 이름으로 자동 매칭하지 않는다. 그러다 `상록마을(라이프2차)` 가 남의 단지
      `정자상록마을우성(1,762세대)` 에 붙어 세대수가 그대로 알림에 나갔다(2026-08-13).
      대장 항목은 **사람이 짚어 준 kaptCode 로만** 물린다 — 어느 단지인지 카드 meta 에 남는다. */
const KAPT = arg("kapt");
let kapt = null;
if (KAPT) {
  const hp = P("data/datasets/apt-hhld.json");
  if (!existsSync(hp)) throw new Error("data/datasets/apt-hhld.json 이 없습니다 — 대장 세대수를 물릴 수 없습니다.");
  kapt = JSON.parse(readFileSync(hp, "utf8")).byKapt[KAPT];
  if (!kapt) throw new Error(`공동주택 대장에 ${KAPT} 가 없습니다.`);
}

/* ── ① 판정 결과 찾기 — 누적 로그에서 그 단지·그 타입의 건 */
const logDir = P("data/datasets/singo-log");
let hit = null;
if (existsSync(logDir)) {
  for (const f of readdirSync(logDir).sort().reverse()) {
    if (!f.endsWith(".json")) continue;
    const log = JSON.parse(readFileSync(join(logDir, f), "utf8"));
    for (const h of log.hits) {
      if (full(h.aptNm) === full(APT) && String(h.type) === String(TYPE)) {
        if (!hit || h.date > hit.date) hit = h;
      }
    }
    if (hit) break;
  }
}
if (!hit) {
  throw new Error(`신고가 로그에서 "${APT}" 전용 ${TYPE}타입 건을 못 찾았습니다 — data/datasets/singo-log 를 확인하세요.`);
}

/* ── ② 곡선 자료 */
const histPath = P(`data/datasets/singo-history/${hit.lawdCd}-${full(APT)}-${TYPE}.json`);
if (!existsSync(histPath)) {
  throw new Error(
    `곡선 자료가 없습니다: ${histPath}\n` +
      `→ data/singo-history-queue.txt 에 아래 한 줄을 쓰고 푸시하세요\n` +
      `   lawd=${hit.lawdCd} umd=${hit.umdNm} type=${TYPE} apt="${APT}"`,
  );
}
const hist = JSON.parse(readFileSync(histPath, "utf8"));

/* 판정 결과와 곡선이 서로 다른 이야기를 하면 그대로 오보다 — 여기서 맞춰 본다. */
if (hist.meta.peak.manwon !== hit.priceManwon) {
  throw new Error(
    `곡선의 최고가(${eok(hist.meta.peak.manwon)})와 신고가 판정(${eok(hit.priceManwon)})이 다릅니다 — 곡선을 다시 받으세요.`,
  );
}

const pts = hist.points;
const traded = pts.filter((p) => p.maxManwon != null);
if (traded.length < 3) throw new Error(`거래가 있던 달이 ${traded.length}개뿐이라 곡선을 그릴 수 없습니다.`);

/* ── ③ 좌표 계산 */
const VB_W = 936; // 카드 안쪽 폭(1080 - 좌우 여백 72×2)
const VB_H = 320;
const PAD_T = 46; // 위 — 점 라벨이 앉을 자리
const PAD_B = 46; // 아래 — 연도 축
const X0 = 12;
const X1 = VB_W - 12;
const plotTop = PAD_T;
const plotBot = VB_H - PAD_B;

const lo = Math.min(...traded.map((p) => p.maxManwon));
const hi = Math.max(...traded.map((p) => p.maxManwon));
const head = (hi - lo) * 0.16 || hi * 0.05; // 위아래 여유 — 곡선이 판에 붙지 않게
const yMax = hi + head;
const yMin = Math.max(0, lo - head);
const xOf = (i) => X0 + ((X1 - X0) * i) / (pts.length - 1);
const yOf = (m) => plotBot - ((plotBot - plotTop) * (m - yMin)) / (yMax - yMin);
const r2 = (v) => Math.round(v * 10) / 10;

/* 선 — 수집을 못 한 달(ok=false)에서 끊는다 */
const paths = [];
let seg = [];
pts.forEach((p, i) => {
  if (!p.ok) {
    if (seg.length > 1) paths.push(seg);
    seg = [];
    return;
  }
  if (p.maxManwon != null) seg.push([r2(xOf(i)), r2(yOf(p.maxManwon))]);
});
if (seg.length > 1) paths.push(seg);
const chartPaths = paths.map((s) => ({ d: s.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ") }));

const dots = pts
  .map((p, i) => (p.maxManwon != null && p.ok ? { x: r2(xOf(i)), y: r2(yOf(p.maxManwon)), r: 6 } : null))
  .filter(Boolean);

/* 가로 눈금 — 옅게 3줄. 숫자는 붙이지 않는다(곡선 카드에 축 숫자를 두 벌 두면 시끄럽다) */
const grid = [0.25, 0.5, 0.75].map((t) => ({
  x1: X0,
  x2: X1,
  y: r2(plotTop + (plotBot - plotTop) * t),
}));

/* 넘어선 선 — 10억 단위 돌파가 있을 때만 */
let threshold = null;
if (hit.milestone) {
  const ty = r2(yOf(hit.milestone * 10000));
  threshold = { x1: X0, x2: X1, y: ty, tx: X0 + 4, ty: r2(ty - 12), text: `${hit.milestone}억` };
}

/* 이번 거래 점 */
const lastIdx = pts.findIndex((p) => p.ym === hit.date.slice(0, 4) + hit.date.slice(5, 7));
const dx = r2(xOf(lastIdx >= 0 ? lastIdx : pts.length - 1));
const dy = r2(yOf(hit.priceManwon));
const dot = {
  x: dx,
  y: dy,
  r: 11,
  rOuter: 18,
  tx: r2(dx - 20),
  ty: r2(dy - 22),
  anchor: "end",
  text: eok(hit.priceManwon),
};

/* 연도 축 — 1월이 있는 달에만 */
const axis = pts
  .map((p, i) => (p.ym.slice(4) === "01" ? { i, y: p.ym.slice(0, 4) } : null))
  .filter(Boolean)
  .map(({ i, y }) => ({ x: r2(xOf(i)), y: VB_H - 12, anchor: "middle", text: y }));

/* ⚠️ SVG 글자는 디자인 검수가 못 잰다 — 판을 넘지 않는지 여기서 확인한다.
   태백/Wanted 실측 대신 넉넉한 상한(글자당 0.62em)으로 잡는다. 넘으면 던진다. */
const widthOf = (text, size) => text.length * size * 0.62;
const dotLabW = widthOf(dot.text, 34);
if (dot.tx - dotLabW < X0) {
  throw new Error(`이번 거래 라벨("${dot.text}")이 판 왼쪽을 넘습니다 — 라벨 위치를 다시 잡으세요.`);
}
if (dot.ty - 34 < 0) throw new Error(`이번 거래 라벨이 판 위로 넘칩니다.`);
if (threshold && Math.abs(threshold.ty - dot.ty) < 30 && threshold.tx + widthOf(threshold.text, 26) > dot.tx - dotLabW) {
  throw new Error(`돌파선 라벨과 거래 라벨이 겹칩니다 — 판 높이를 키우세요.`);
}
// 판 끝의 연도(2020·2026)는 가운데 정렬로 두면 판을 넘는다 — 그때만 끝을 물려 세운다.
for (const a of axis) {
  const w = widthOf(a.text, 24) / 2;
  if (a.x - w < 0) {
    a.anchor = "start";
    a.x = 0;
  } else if (a.x + w > VB_W) {
    a.anchor = "end";
    a.x = VB_W;
  }
}
for (const a of axis) {
  const w = widthOf(a.text, 24);
  const left = a.anchor === "start" ? a.x : a.anchor === "end" ? a.x - w : a.x - w / 2;
  if (left < 0 || left + w > VB_W) throw new Error(`연도 축 "${a.text}" 이 판을 넘습니다.`);
}

/* ── ④ 문구 — 전부 위 수치에서 나온다 */
const days = Math.round(
  (Date.parse(hit.date + "T00:00:00Z") - Date.parse(hit.prevPeakDate + "T00:00:00Z")) / 86400000,
);
const gap = hit.priceManwon - hit.prevPeakManwon;
const first = traded[0];
const vsFirstPct = ((hit.priceManwon - first.maxManwon) / first.maxManwon) * 100;
const [fy, fm] = [first.ym.slice(0, 4), String(Number(first.ym.slice(4)))];
const fromLabel = `${hist.meta.from.slice(0, 4)}년${hist.meta.from.slice(4) === "01" ? "" : ` ${Number(hist.meta.from.slice(4))}월`}`;
const dot2 = (d) => `${d.slice(0, 4)}.${d.slice(5, 7)}.${d.slice(8, 10)}`;

/* 제목에 쓸 지역 이름 — "성남시분당구 정자동"은 제목에 길다.
   시 이름을 떼고, 남는 글자가 2자 이상일 때만 "구"까지 뗀다.
   ⚠️ 중구·서구처럼 한 글자만 남는 곳은 그대로 둔다("중 필동"은 말이 안 된다). */
const guRaw = hit.gu.replace(/^[가-힣]+시(?=[가-힣]+구$)/, "");
const guShort = /구$/.test(guRaw) && guRaw.length >= 3 ? guRaw.slice(0, -1) : guRaw;
const region = `${guShort} ${hit.umdNm}`;
/* 킥커는 공식 지명 그대로 — 다만 "성남시분당구"는 붙어 있어 읽기 어렵다 */
const guFull = hit.gu.replace(/^([가-힣]+시)(?=[가-힣]+구$)/, "$1 ");

const card = {
  template: "singo-record@1",
  date: DATE,
  kicker: `${dot2(hit.date)} 계약 · ${guFull} ${hit.umdNm}`,
  title: hit.milestone
    ? `${region} ${hit.pyeong}이<br /><span class="hi">${hit.milestone}억</span>을 넘었다`
    : `${region} ${hit.pyeong}<br />${eok(hit.priceManwon)} 신고가`,
  apt:
    `<b>${hit.aptNm}</b> · ${hit.umdNm}` +
    (hit.buildYear ? ` · ${hit.buildYear}년 준공` : "") +
    (kapt ? ` · ${kapt.hhld.toLocaleString("ko-KR")}세대` : ""),
  deal: `이번 거래 · 전용 ${hit.area}㎡ · ${hit.floor}층 · ${hit.dealingGbn} · ${dot2(hit.date)}`,
  price: eok(hit.priceManwon),
  delta: `▲ ${eok(gap)} (+${hit.gainPct.toFixed(1)}%)`,
  chart: { vb: `0 0 ${VB_W} ${VB_H}`, grid, threshold, paths: chartPaths, dots, axis, dot },
  facts: [
    { l: "직전 최고가", v: eok(hit.prevPeakManwon), s: dot2(hit.prevPeakDate) },
    { l: "기록을 넘기까지", v: `${days}일`, s: `${eok(gap)} 위로` },
    { l: `${fy}년 ${fm}월 대비`, v: `+${Math.round(vsFirstPct)}%`, s: `${eok(first.maxManwon)} → ${eok(hit.priceManwon)}` },
  ],
  note:
    `${fromLabel} 이후 이 단지 전용 ${TYPE}타입 매매 실거래 기준(직거래 제외). ` +
    `곡선은 <b>거래가 있던 ${traded.length}개월</b>의 그달 최고가를 이은 것이다. 날짜는 계약일(신고일 아님).`,
  source: { name: "국토교통부 아파트 매매 실거래가", asOf: DATE },
  meta: {
    verified: true,
    provenance: [
      `singo-log: ${hit.foundOn ?? DATE} 판정`,
      `singo-history: ${histPath.replace(ROOT + "/", "")} (${hist.meta.monthsTried}개월 · 실패 ${hist.meta.monthsFailed})`,
    ],
    baselineFrom: hist.meta.from,
    /* 곡선이 그리는 값을 **글자로도** 남긴다.
       chart 에는 픽셀 좌표뿐이라, 이게 없으면 그림이 자료와 맞는지 아무도 대조할 수 없다.
       (캡션 검수도 이 풀과 대조해 "카드에 없는 금액"을 잡는다.) */
    curve: traded.map((p) => ({ ym: p.ym, eok: eok(p.maxManwon), date: p.date, floor: p.floor })),
    hhld: kapt
      ? {
          kaptCode: KAPT,
          kaptName: kapt.name,
          hhld: kapt.hhld,
          addr: kapt.addr,
          note:
            "공동주택 대장 값. 실거래 표기(" +
            hit.aptNm +
            ")와 대장 표기가 달라 **이름으로 자동 매칭하지 않고 kaptCode 로 짚었다** — " +
            "오너가 2026-08-13 같은 단지임을 확인했다.",
        }
      : { note: "세대수는 싣지 않는다 — 대장 항목을 짚지 않았다(--kapt 미지정)." },
  },
};

const slug = `singo-${full(APT)}-${TYPE}`;
const outDir = flag("publish") ? P(join("data/content", DATE)) : P("data/out/_spike");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${slug}.json`);
writeFileSync(outPath, JSON.stringify(card, null, 2) + "\n");

console.log(
  `${outPath}\n` +
    `${hit.aptNm} ${hit.pyeong} ${eok(hit.priceManwon)} · 직전 ${eok(hit.prevPeakManwon)} (${days}일 전)\n` +
    `곡선 ${traded.length}개월 / ${pts.length}개월 · 끊긴 구간 ${chartPaths.length - 1}곳`,
);
