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

/* ── 괄호를 **지우는** 쪽 — 수집기의 normAptName 과 같은 규칙.
      DMC센트럴자이(2단지) → DMC센트럴자이. `--merge-blocks` 일 때만 쓴다. */
const norm = (s) =>
  String(s ?? "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[\s·.\-_]/g, "")
    .trim();

/* ── `--merge-blocks` — 한 단지가 블록별로 나뉘어 신고될 때 합쳐서 한 장으로 그린다
 *
 * ── 왜 (2026-08-24 오너 "DMC 통합으로 해서")
 * DMC센트럴자이는 **1~4단지가 전부 같은 지번(증산동 258)·같은 준공(2023)의 한 단지**인데
 * 실거래만 블록별로 나뉘어 신고된다. 명부에도 `DMC센트럴자이` 1,256세대 **한 건**이다.
 * 판정(최고가 인덱스)은 이미 `normAptName` 으로 넷을 합쳐서 보고 있었다 — 그런데 이 빌더만
 * `fullAptName` 으로 엄격히 봐서 "로그에 없다"고 멈췄다. **판정과 그림이 다른 자를 쓰고 있었다.**
 *
 * ── 그런데 왜 기본값으로 켜지 않나
 * 괄호를 지우면 **다른 단지가 합쳐질 수 있다.** 분당 상록마을이 그 사고였다(2026-08-13):
 * 라이프1차·라이프2차·보성·우성1·임광이 전부 `상록마을` 한 칸이 된다. 실제로 지번이
 * 124·125·181·121 로 **다 다르다** — 남남이다. 합치면 가짜 신고가가 난다.
 *
 * ── 그래서 두 겹으로 막는다
 *   ① **사람이 켜야 한다**(기본 꺼짐). 어느 카드에서 합쳤는지가 `builders.json` 에 남는다.
 *   ② 켜도 **자료가 반대하면 거부한다** — 합칠 신고명들의 지번이 하나가 아니면 던진다.
 *      상록마을을 `--merge-blocks` 로 부르면 여기서 멈춘다(지번 4종).
 * 사람의 의도만 믿지 않고, **자료로 한 번 더 되묻는다.** */
const MERGE = flag("merge-blocks");

/* ── `--name` — 카드에 찍을 이름만 바꾼다 (2026-08-25 오너 "영통에듀파크(331~7동) 33평으로")
 *
 * 실거래 신고명이 `영통에듀파크(331동~337동)` 처럼 길어 제목이 답답할 때 쓴다.
 * ⚠️ **판정·조회는 신고명 그대로** 돌고, 바뀌는 것은 제목 글자뿐이다.
 *    원래 이름은 `meta.provenance` 에 남는다 — 카드에서 이름을 줄였다는 사실 자체가
 *    자료에 남아야, 나중에 "이 단지 맞나"를 되물을 수 있다.
 * ⚠️ 이걸로 **다른 단지 이름을 적지 않는다.** 줄여 쓰는 자리이지 고쳐 쓰는 자리가 아니다. */
const NAME_OVERRIDE = arg("name") || null;
const nameEq = (a, b) => (MERGE ? norm(a) === norm(b) : full(a) === full(b));

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
const merged = [];
if (existsSync(logDir)) {
  for (const f of readdirSync(logDir).sort().reverse()) {
    if (!f.endsWith(".json")) continue;
    const log = JSON.parse(readFileSync(join(logDir, f), "utf8"));
    for (const h of log.hits) {
      if (nameEq(h.aptNm, APT) && String(h.type) === String(TYPE)) {
        merged.push(h);
        /* ⚠️ **가장 비싼 건**을 고른다. 예전엔 계약일이 가장 늦은 건을 골랐는데 그건 틀렸다
           (2026-08-25). 이 카드가 그리는 것은 「최고가 기록」이고, 기록은 **값**으로 정해진다.
           신고 순서와 계약 순서가 어긋나기 때문에 늦게 드러난 건이 더 **이른** 계약일 수 있다:
             · 성복역롯데캐슬클라시엘 — 08-23 확인 14.5억(계약 08-13) vs 08-25 확인 14.9억(계약 07-22)
             · 꿈의숲아이파크        — 08-22 확인 14.6억(계약 08-07) vs 08-25 확인 14.7억(계약 07-30)
           계약일로 고르면 둘 다 **기록이 아닌 건**을 카드에 싣는다.
           값이 같으면 늦게 계약된 쪽을 쓴다(더 최근 소식). */
        if (!hit || h.priceManwon > hit.priceManwon || (h.priceManwon === hit.priceManwon && h.date > hit.date)) {
          hit = h;
        }
      }
    }
    if (hit) break;
  }
}
if (!hit) {
  throw new Error(
    `신고가 로그에서 "${APT}" 전용 ${TYPE}타입 건을 못 찾았습니다 — data/datasets/singo-log 를 확인하세요.` +
      (MERGE ? "" : `\n→ 한 단지가 (2단지)처럼 블록별로 신고된 곳이면 --merge-blocks 를 붙여 보세요.`),
  );
}

/* ── ①-b 합쳤다면 **정말 한 단지가 맞는지 자료에 되묻는다**
   사람이 --merge-blocks 를 켰다는 것만으로는 부족하다. 신고명이 갈린 건들이 **같은 지번**을
   가리켜야 한 단지다. 지번이 갈리면 남남이다(상록마을: 124·125·181·121). */
if (MERGE) {
  /* ⚠️ **신고가 로그가 아니라 원자료 전체**를 본다.
     로그에는 그날 문턱을 넘은 건만 있어서, 다섯 단지 중 하나만 신고가를 찍은 날이면
     지번이 1종으로 보인다 — 통과시켜 놓고 곡선은 다섯 단지를 섞어 그리게 된다.
     합쳐질 **모든 거래**를 세야 진짜 답이 나온다. */
  const dir = P("data/datasets/molit");
  const seen = new Map(); // 지번 → 신고명 집합
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((f) => f.startsWith(`${hit.lawdCd}-`))) {
      for (const t of JSON.parse(readFileSync(join(dir, f), "utf8")).trades) {
        if (norm(t.aptNm) !== norm(APT)) continue;
        if (String(t.umdNm) !== String(hit.umdNm)) continue;
        const j = String(t.jibun ?? "");
        if (!seen.has(j)) seen.set(j, new Set());
        seen.get(j).add(t.aptNm);
      }
    }
  }
  const jibuns = [...seen.keys()].filter(Boolean);
  const names = [...new Set([...seen.values()].flatMap((s) => [...s]))];
  if (!jibuns.length) {
    throw new Error(`⛔ --merge-blocks 검증 실패 — ${hit.lawdCd} 원자료에서 "${APT}" 거래를 못 찾았습니다.`);
  }
  if (jibuns.length > 1) {
    throw new Error(
      `⛔ --merge-blocks 를 켰지만 **한 단지가 아닙니다.**\n` +
        `   합쳐질 신고명: ${names.join(" · ")}\n` +
        `   지번이 ${jibuns.length}종입니다: ${jibuns.join(", ")}\n` +
        `   지번이 다르면 다른 단지입니다(분당 상록마을 사고 2026-08-13 — 라이프1차·라이프2차·\n` +
        `   보성·우성1·임광이 지번 124·125·181·121 로 남남이다). 블록 이름을 그대로 지정하세요.`,
    );
  }
  console.log(
    `↔︎ 블록 통합 확인: ${names.join(" + ")} → "${APT}" · 지번 ${jibuns[0]} 하나 (원자료 대조)`,
  );
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
/* ⚠️ **이 판형에 맞지 않는 단지를 거른다** (2026-08-16b).
   판은 2020-01 부터 6년을 그린다. 그런데 새 단지는 관측이 맨 오른쪽 끝에만 몰려
   판의 80%가 텅 빈 채로 나간다 — 반정아이파크캐슬5단지는 첫 거래가 2025-11 이라
   80개월 판에 점이 6개였다. 그림이 거짓말을 하는 건 아니지만 **할 말이 없는 그림**이고,
   그 상태로도 "지난 사이클 고점"을 4개월 전 값으로 적게 된다(아래 가드가 그걸 막는다).
   → 이런 단지는 이 판형으로 만들지 않는다. 다른 판형이 필요하다는 뜻이다. */
const MIN_MONTHS = 15;
if (traded.length < MIN_MONTHS) {
  throw new Error(
    `거래가 있던 달이 ${traded.length}개월뿐입니다(첫 거래 ${traded[0].ym}) — ` +
      `이 판형은 2020년부터 6년을 그리므로 최소 ${MIN_MONTHS}개월이 필요합니다.\n` +
      `→ 새 단지라 이력이 짧습니다. 이 소재는 다른 판형으로 다루세요.`,
  );
}

/* ── ③ 좌표 계산 */
const VB_W = 936; // 카드 안쪽 폭(1080 - 좌우 여백 72×2)
/* ⚠️ SVG 는 width:100% + viewBox 비율로 높이가 정해진다 — **판이 남는 높이를 못 먹는다.**
   제목이 한 줄로 낮아지면서(2026-08-13 개편) 곡선 위에 250px 짜리 빈 칸이 생겼다.
   판 높이를 키워 그 자리를 곡선이 쓰게 한다. 여기 숫자를 바꾸면 곡선의 세로 크기가 바뀐다. */
/* ⚠️ 이 값이 곧 곡선의 세로 크기다. 위에 줄이 늘면(역 뱃지 등) **여기를 줄여야** 한다 —
   SVG 는 flex 로 안 줄어들어 자리가 모자라면 아랫줄을 그대로 덮는다.
   덮은 것은 designQa 의 `svgspill` 이 error 로 잡는다(2026-08-16 에 실제로 45px 밟았다). */
/* ⚠️ 775 였을 때 판이 담는 칸(`.sr-chart`, 760px)을 **7px 넘쳐** designQa 가 error 를 냈다
   (2026-08-16b 검수). 제원이 세 줄이 되면서 히어로가 커져 칸이 그만큼 줄어든 것이다.
   **위에 줄이 늘면 여기를 줄여야 한다** — SVG 는 flex 로 안 줄어들어 그냥 아랫줄을 덮는다. */
/* ⚠️ 2026-08-25 — 제원에 **주소 줄**이 붙어 위가 한 줄 더 늘었다(오너 지시).
   그래서 위 경고대로 여기를 줄인다. 안 줄였더니 designQa `svgspill` 이 8장에서
   최대 15px 넘침을 잡았다 — 넘친 만큼 아랫줄(연도 축)을 덮는다.
   768 → 738 으로 내렸다가, 같은 날 오후 오너가 제원을 **세 줄**로 다시 잡으면서
   (주차가 제 줄을 버리고 세대수 줄로 올라갔다) 위가 한 줄 줄어 **768 로 되돌렸다.**
   ⚠️ 이 값은 위의 줄 수와 한 몸이다 — 제원 줄이 늘면 여기를 줄이고, 줄면 되돌린다.
   ⚠️ 이 값은 singo-record 전 카드에 걸린다. 바꾸면 확정본 픽셀도 같이 움직인다 —
      이번에는 주소 줄 자체가 전 카드에 걸리는 변경이라 어차피 함께 다시 확정해야 한다. */
const VB_H = 768;
/* 위 — 돌파선 라벨이 앉을 자리만 남긴다. 62 였을 때 판 위쪽에 빈 띠가 남았다
   (오너 2026-08-16b "그래프 위쪽 여백이 과해"). 아래 `yMax` 여유와 **둘이 합쳐** 그 띠를 만든다.
   ⚠️ 라벨(28px)이 y-20 에 앉으므로 48px 아래로는 못 내린다 — 그 아래는 라벨이 판을 넘는다. */
const PAD_T = 44;
/* 아래 — 연도 축이 앉을 자리. 62 였을 때 곡선 바닥과 연도 사이가 통째로 비어 보였다
   (오너 2026-08-16 "연도축과 그래프 하단 사이 여백 좀 줄여줘").
   아래 `yMin` 여유와 **둘이 합쳐** 그 빈칸을 만든다 — 한쪽만 줄이면 티가 안 난다. */
const PAD_B = 40;
/* ⚠️ 좌우 여백을 두는 이유: 2020·2026 연도 라벨이 판 끝에서 잘려 나가 **간격이 어긋나 보였다**
   (오너 2026-08-13 "연도들끼리 간격이 안맞아"). 예전엔 끝 라벨만 왼쪽/오른쪽 정렬로 물려
   붙였는데, 그러면 라벨이 자기 눈금에서 벗어나 더 어긋나 보인다. 여백으로 푼다. */
const X0 = 46;
const X1 = VB_W - 46;
const plotTop = PAD_T;
const plotBot = VB_H - PAD_B;

const lo = Math.min(...traded.map((p) => p.maxManwon));
const hi = Math.max(...traded.map((p) => p.maxManwon));
/* 위아래 여유는 **다르게** 준다.
   위쪽은 '오늘 값 기준선'이 곧 최고가라 여유가 크면 판 위쪽이 통째로 빈 칸이 된다
   (2026-08-16: 가격과 곡선 사이에 130px 짜리 죽은 자리가 생겼다).
   아래쪽은 곡선이 바닥에 붙지 않게 넉넉히 둔다. */
const span = hi - lo || hi * 0.1;
const yMax = hi + span * 0.04;
const yMin = Math.max(0, lo - span * 0.05);
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

/**
 * 점을 **부드럽게** 잇는다 (오너 2026-08-16 "딱딱 꺾이지 않게").
 *
 * ⚠️ 아무 스플라인이나 쓰면 안 된다. 보통의 Catmull-Rom 은 두 점 사이에서 **양쪽 값보다
 *    높이 솟거나 낮게 파인다**(오버슈트). 이 카드에서 그건 "그달에 더 비싸게 팔렸다"는
 *    말이 되어 **그림이 하는 거짓말**이 된다.
 *    그래서 **단조 3차 보간(Fritsch–Carlson)** 을 쓴다 — 구간 안에서 값이 두 끝점을
 *    절대 벗어나지 않는 방법이다. 아래에서 실제로 벗어나지 않는지 다시 재고, 벗어나면 던진다.
 */
function smoothPath(pts) {
  const n = pts.length;
  if (n < 3) return pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const dx = [];
  const dy = [];
  const d = []; // 구간 기울기
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    dy.push(pts[i + 1][1] - pts[i][1]);
    d.push(dy[i] / dx[i]);
  }
  const m = [d[0]];
  for (let i = 1; i < n - 1; i++) {
    // 꺾이는 지점(부호가 바뀌는 곳)에서는 기울기를 0 으로 — 여기가 오버슈트의 발원지다
    m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  }
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  let out = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    const c1x = r2(pts[i][0] + h);
    const c1y = r2(pts[i][1] + m[i] * h);
    const c2x = r2(pts[i + 1][0] - h);
    const c2y = r2(pts[i + 1][1] - m[i + 1] * h);
    out += ` C${c1x} ${c1y} ${c2x} ${c2y} ${pts[i + 1][0]} ${pts[i + 1][1]}`;
  }
  return out;
}

/** 곡선이 두 끝점 사이를 벗어나는지 실제로 재 본다 — 벗어나면 그림이 거짓말을 하는 것이다. */
function assertNoOvershoot(pts) {
  const n = pts.length;
  if (n < 3) return;
  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const dxs = [];
  const ds = [];
  for (let i = 0; i < n - 1; i++) {
    dxs.push(pts[i + 1][0] - pts[i][0]);
    ds.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
  }
  const m = [ds[0]];
  for (let i = 1; i < n - 1; i++) m.push(ds[i - 1] * ds[i] <= 0 ? 0 : (ds[i - 1] + ds[i]) / 2);
  m.push(ds[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (ds[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / ds[i], b = m[i + 1] / ds[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * ds[i]; m[i + 1] = t * b * ds[i]; }
  }
  for (let i = 0; i < n - 1; i++) {
    const h = dxs[i] / 3;
    const y0 = pts[i][1], y3 = pts[i + 1][1];
    const y1 = y0 + m[i] * h, y2 = y3 - m[i + 1] * h;
    const lo2 = Math.min(y0, y3) - 0.5;
    const hi2 = Math.max(y0, y3) + 0.5;
    for (let k = 1; k < 12; k++) {
      const v = bez(y0, y1, y2, y3, k / 12);
      if (v < lo2 || v > hi2) {
        throw new Error(`곡선이 구간 ${i} 에서 값을 벗어납니다(오버슈트) — 부드럽게 그리는 방식을 확인하세요.`);
      }
    }
  }
}

for (const sg of paths) assertNoOvershoot(sg);
const chartPaths = paths.map((sg) => ({ d: smoothPath(sg) }));

/* ⚠️ 달마다 찍던 관측 점(`.sr-obs`)을 걷어냈다 (2026-08-16b 검수).
   65개월치 점이 14px 간격으로 5px 굵기 곡선 **위에** 찍히면서, "그달에 거래가 있었다"를
   말해 주기는커녕 선 양옆에 회색 털이 붙은 것처럼 보였다. 오늘 점 자리에도 하나가 겹쳐
   **속을 비운 링 한가운데에 회색 점이 박혔다**(오너 지시와 정반대).
   ⚠️ 그래도 "선은 관측 사이를 이은 것"이라는 정직함은 버리지 않는다 — 수집을 못 한 달에서
      path 를 끊는 규칙과 `meta.curve`(모든 관측을 글자로 남김)가 그 몫을 그대로 한다. */
const dots = [];

/* 판 바탕 — 옅은 회색(오너 2026-08-16). 곡선이 놓인 '자리'를 만들어 준다.
   ⚠️ 아주 옅게. 진해지면 카드에 회색 덩어리가 앉은 것처럼 보인다(한 번 겪었다). */
/* 모서리는 4px. CARD_CHECKLIST 의 "AI티 금지"가 "각을 세우고(≤4px)"라고 못박는다 —
   크게 둥근 옅은 회색 판이 정확히 그 'AI티'의 표본이다(2026-08-16b 검수). */
const bg = { x: 0, y: 0, w: VB_W, h: VB_H, r: 4 };
const floor = null;
const band = null;

/* ── 오늘 값 기준선 — **모든 카드에 그린다** (오너 2026-08-16c "현재 가격에 대한 기준선 살려주고")
 *
 * 예전엔 `hit.milestone` 이 있을 때(10억 클럽 돌파)만 그렸다. 그러다 보니 아래 두 기준선
 * (지난 고점·저점)은 늘 있는데 **정작 오늘 값에는 선이 없는** 카드가 대부분이었다.
 * 두 기준선이 "무엇과 견줬는지"를 말하려면 **견주는 대상인 오늘 값에도 선이 있어야** 한다.
 *
 * 돌파 카드도 같은 규칙을 쓴다. `milestone*10000` 대신 **오늘 값**에 긋는다 —
 * 정기물에 조건부 예외를 두지 않는다(CEO.md 08-16). 돌파했다는 이야기는 킥커("10억 클럽")와
 * 가격 옆 "달성!" 이 이미 하고 있고, 광명한진타운처럼 값이 곧 문턱이면 어차피 같은 자리다.
 *
 * 라벨은 **오른쪽 끝(오늘 자리)** 에 둔다 — 왼쪽에 두면 6년 전 자리에서 오늘 값을 말하게 된다.
 * ⚠️ 오른쪽 끝에 딱 붙이지 않는다: 저점 대비 파랑 직선이 판 맨 오른쪽에 서면서 그 눈금(±12px)과
 *    같은 자리를 놓고 다툰다(오너 2026-08-16). 34px 만 물린다. */
const thrTy = r2(yOf(hit.priceManwon));
const threshold = {
  x1: X0,
  x2: X1,
  y: thrTy,
  tx: X1 - 34,
  ty: r2(thrTy - 20),
  anchor: "end",
  text: eok(hit.priceManwon),
};

/* 이번 거래 점 */
const lastIdx = pts.findIndex((p) => p.ym === hit.date.slice(0, 4) + hit.date.slice(5, 7));
const dx = r2(xOf(lastIdx >= 0 ? lastIdx : pts.length - 1));
const dy = r2(yOf(hit.priceManwon));
/* ⚠️ 점 옆 "10억" 라벨은 걷어냈다 — 바로 위 큰 숫자가 이미 그 말을 한다.
   같은 말을 두 번 하면 그게 곧 '군더더기'고, 카드가 템플릿처럼 보이는 이유다. */
/* 오늘 점은 **채우기 없이 잉크 테두리**(오너 2026-08-16b). 빨강으로 채웠더니 고점 점과
   같은 색이라 어느 쪽이 오늘인지 흐렸다 — 속이 빈 원 하나면 오늘만 다르게 읽힌다. */
const dot = { x: dx, y: dy, r: 13, rOuter: 20 };

/* 연도 축 — 1월이 있는 달에만 */
const axis = pts
  .map((p, i) => (p.ym.slice(4) === "01" ? { i, y: p.ym.slice(0, 4) } : null))
  .filter(Boolean)
  .map(({ i, y }) => ({ x: r2(xOf(i)), y: VB_H - 14, anchor: "middle", text: y }));

/* ⚠️ SVG 글자는 디자인 검수가 못 잰다 — 판을 넘지 않는지 여기서 확인한다.
   태백/Wanted 실측 대신 넉넉한 상한(글자당 0.62em)으로 잡는다. 넘으면 던진다. */
const widthOf = (text, size) => text.length * size * 0.62;
/* 연도는 **전부 가운데 정렬**이라 간격이 눈금 간격과 같다. 하나라도 판을 넘으면 여백이
   모자란 것이니 던진다 — 끝만 슬쩍 밀어 붙이면 간격이 어긋나 보인다(오너가 바로 알아봤다). */
for (const a of axis) {
  const w = widthOf(a.text, 24) / 2;
  if (a.x - w < 0 || a.x + w > VB_W) {
    throw new Error(`연도 축 "${a.text}" 이 판을 넘습니다 — X0/X1 여백을 키우세요.`);
  }
}
/* 눈금 간격이 실제로 고른지 확인한다(달 수가 12로 안 떨어지면 어긋난다) */
for (let i = 2; i < axis.length; i++) {
  const d1 = axis[i].x - axis[i - 1].x;
  const d0 = axis[i - 1].x - axis[i - 2].x;
  if (Math.abs(d1 - d0) > 1) throw new Error(`연도 간격이 고르지 않습니다: ${d0} vs ${d1}`);
}

/* ── ④ 지난 사이클 고점 — 사람이 눈으로 고르지 않는다
   낙폭(drawdown)이 가장 깊었던 골을 찾고, **그 골 이전의 최고가**를 지난 사이클 고점으로 본다.
   (이 단지: 2021-03 14.8억 → 2023-04 10.9억 으로 -26% 가 최대 낙폭 → 지난 고점 14.8억)
   ⚠️ "지난 고점"을 손으로 찍으면 단지가 바뀔 때마다 사람이 다시 골라야 하고, 그때 틀린다. */
let runMax = -1;
let runMaxIdx = -1;
let worst = { dd: 0, atMaxIdx: -1 };
traded.forEach((p, i) => {
  if (p.maxManwon > runMax) {
    runMax = p.maxManwon;
    runMaxIdx = i;
  }
  const dd = p.maxManwon / runMax - 1;
  if (dd < worst.dd) worst = { dd, atMaxIdx: runMaxIdx };
});
let cycle = null;
let cycleDropped = null;
if (worst.atMaxIdx >= 0) {
  const pk = traded[worst.atMaxIdx];
  /* ⚠️ **몇 달 전 값을 "지난 사이클 고점"이라 부르지 않는다** (2026-08-16b).
     낙폭 계산은 관측이 몇 개든 답을 내놓는다 — 반정아이파크캐슬5단지는 4개월 전(2026.04)
     값을 지난 사이클 고점으로 집었다. 넉 달은 사이클이 아니다. 그 말이 카드에 나가면
     독자는 한 번의 오르내림을 시장 사이클로 읽는다. */
  const MIN_CYCLE_MONTHS = 12;
  const monthsApart = (a, b) =>
    (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + (Number(b.slice(4)) - Number(a.slice(4)));
  const gap = monthsApart(pk.ym, `${hit.date.slice(0, 4)}${hit.date.slice(5, 7)}`);
  if (gap < MIN_CYCLE_MONTHS) {
    throw new Error(
      `지난 사이클 고점으로 집힌 ${pk.ym} 이 이번 거래(${hit.date})에서 ${gap}개월밖에 안 됐습니다 — ` +
        `그건 사이클이 아닙니다(최소 ${MIN_CYCLE_MONTHS}개월).\n` +
        `→ 오르내림이 한 번뿐인 단지입니다. 이 소재는 다른 판형으로 다루세요.`,
    );
  }
  /* ── ⚠️ **골이 얕으면 사이클이 아니다** (2026-08-24 오너 제기 → 08-25 승인)
   *
   * 위 검사는 **시간**만 본다(12개월). 그런데 신축은 시간은 충분해도 **2021~22 사이클을
   * 겪지 않았다.** 그러면 낙폭 계산이 준공 직후의 잔물결 꼭대기를 "지난 사이클 고점"으로 집는다.
   *
   * 실측(2026-08-24): 확정본 6장은 지난 고점이 전부 2021~22 정점이고 최대 낙폭이 −27~−43% 다.
   * 그런데 DMC센트럴자이(2023년 준공)는 2024.03 꼭대기에 낙폭 **−7.6%** 였다.
   * 같은 「지난 고점대비」 문구가 카드마다 **다른 것**을 가리키게 된다 — 정기물에서 이건 사고다.
   *
   * 그래서 **낙폭이 얕으면 그 줄을 아예 뺀다.** 던지지 않는다 —
   * 곡선도 신고가도 저점 대비도 다 멀쩡하고, **말할 수 없는 것 하나만 안 말하면 된다.**
   * (위 시간 검사가 던지는 것은 곡선 자체가 너무 짧은 경우라 사정이 다르다.) */
  const MIN_CYCLE_DROP = 0.15;
  if (Math.abs(worst.dd) < MIN_CYCLE_DROP) {
    console.warn(
      `   ⓘ 최대 낙폭이 ${(Math.abs(worst.dd) * 100).toFixed(1)}% 라 「지난 고점대비」 줄을 뺍니다 ` +
        `(사이클이라 부를 골이 없습니다 · 기준 ${MIN_CYCLE_DROP * 100}%).`,
    );
    cycleDropped = { maxDrawdownPct: Number((worst.dd * 100).toFixed(2)), minPct: MIN_CYCLE_DROP * 100 };
    worst.atMaxIdx = -1;
  }
}
if (worst.atMaxIdx >= 0) {
  const pk = traded[worst.atMaxIdx];
  const vs = ((hit.priceManwon - pk.maxManwon) / pk.maxManwon) * 100;
  /* ── ⛔ 신고가와 지난 고점이 **같은 높이면 만들지 않는다** (2026-08-27)
   *
   * 기준 문서 §9 가 08-25 부터 이렇게 적고 있었는데 **코드가 안 지켰다.**
   * 그날은 검수(`linecross`)가 대신 잡아 줬다 — 중계주공5(+0.3%)·가산두산위브(+1.4%)·
   * 동탄호수자이(+2.2%)가 그렇게 걸렸다. 그래서 코드에 안 넣어도 되는 줄 알았다.
   *
   * 08-27 수원아이파크시티7단지(**+0.2%**)가 그 착각을 깼다 — **검수를 통과했다.**
   * `linecross` 는 「남의 선이 글자를 뚫었나」를 보는데, 두 기준선이 같은 높이면
   * 그 선은 **자기 선이기도 하다.** 「자기 선은 장애물이 아니다」는 옳은 규칙인데
   * 두 선이 겹치는 순간 그 예외가 구멍이 된다.
   * 판에는 「지난 고점대비 +0.2%」가 점선 위에 그대로 얹혀 나왔다.
   *
   * **검수는 그림을 보고, 빌더는 소재를 본다.** 그림으로 못 가리는 것은 소재에서 자른다.
   * 빌더 쪽이 더 앞이고 더 싸다 — 렌더도 안 돌린다.
   *
   * ⚠️ 이 줄만 빼고 카드를 내는 선택지는 여기선 안 맞는다. 낙폭이 얕은 신축(위 15% 규칙)은
   *    「사이클이 없었다」라 말할 것이 없는 경우지만, 이쪽은 **사이클이 있었는데 이제 막
   *    되돌아온** 경우다. 그 사실이 곧 소식인데 판이 그것을 못 그린다 → 소재를 접는다. */
  const MIN_VS_CYCLE = 3;
  if (Math.abs(vs) < MIN_VS_CYCLE) {
    throw new Error(
      `신고가(${eok(hit.priceManwon)})와 지난 사이클 고점(${eok(pk.maxManwon)} · ` +
        `${pk.ym.slice(0, 4)}.${pk.ym.slice(4)}월)이 ${Math.abs(vs).toFixed(1)}% 차이입니다 — ` +
        `두 기준선이 같은 높이라 라벨이 선 위에 얹힙니다(기준 ${MIN_VS_CYCLE}%).\n` +
        `→ 이 소재는 이 판형으로 만들지 않습니다 (docs/guides/신고가-카드-기준.md §9).\n` +
        `   자리가 없는 판은 배치로 못 풉니다 — 08-25 에 회피 띠를 넓혀 봤다가 세 장이 더 나빠졌습니다.`,
    );
  }
  cycle = {
    peak: eok(pk.maxManwon),
    when: `${pk.ym.slice(0, 4)}.${pk.ym.slice(4)}월`,
    vs: `${vs >= 0 ? "+" : "−"}${Math.abs(vs).toFixed(1)}%`,
    dir: vs >= 0 ? "up" : "down",
  };
}

/* ── 기준선 두 줄 + 폭 표시 직선 (오너 2026-08-16)
   · 지난 사이클 고점 : 왼쪽에 2행 `9억(21.10월)` / 빨강 `고점대비 +11.1%`
   · 기준선 이후 최저점 : **최우측**에 2행 `6.15억(20.01월)` / 파랑 `저점대비 +62.6%`
   · 두 선과 오늘 선 사이를 **세로 직선**으로 잇는다 — 그 길이가 곧 퍼센트다
     (빨강 = 고점 대비, 파랑 = 저점 대비)

   색 기준은 방향이 아니라 **무엇과 견주는가**로 고정했다(오너 지시).

   ⚠️ 직선 자리는 훑어 고르지 않는다. 예전에 곡선 빈 자리를 찾게 했더니 단지에 따라
      자리가 없어 표시가 통째로 사라졌다(상록마을 라이프2차).
      **각자 제 라벨 옆에 고정으로 세우고, 곡선 뒤에 깐다** — 늘 나온다. */
const ymLab = (ym) => `${ym.slice(2, 4)}.${ym.slice(4)}월`;
const thrY = threshold ? threshold.y : r2(yOf(hit.priceManwon));
const LAB_FS = 27;

let prevLine = null;
let old = null;
let brkHi = null;
if (cycle && worst.atMaxIdx >= 0) {
  const pk = traded[worst.atMaxIdx];
  const py = r2(yOf(pk.maxManwon));
  const bx = r2(X0 + 26);
  prevLine = {
    x1: X0,
    x2: X1,
    y: py,
    tx: r2(bx + 26),
    anchor: "start",
    ty1: r2(py - 52),
    ty2: r2(py - 16),
    text1: `${eok(pk.maxManwon)}(${ymLab(pk.ym)})`,
    /* ⚠️ "고점대비" 만 쓰면 **역대 고점 대비**로 읽힌다(2026-08-16b 검수).
       여기 고점은 지난 사이클 고점(9억·2021.10)이고, 직전 최고가는 9.5억(2026-07-14)로 따로 있다.
       윗줄이 값과 연월을 박아 두지만, 단어 자체가 기준을 말하게 한다. */
    text2: `지난 고점대비 ${cycle.vs}`,
    tone: "hi",
  };
  brkHi = { x: bx, y1: thrY, y2: py, tickX1: r2(bx - 12), tickX2: r2(bx + 12), tone: "hi" };
  const idx = pts.findIndex((p) => p.ym === pk.ym);
  /* 고점 점은 **빨강 채움**(오너 2026-08-16) — 빈 원 두 개는 어느 쪽이 고점인지 말해 주지 않았다.
     색이 라벨과 같으니 그림에서 숫자를 찾는 데 한 걸음이 준다. */
  if (idx >= 0) old = { x: r2(xOf(idx)), y: py, r: 10, tone: "hi" };
}

/* 기준선 이후 최저점. 최저점이 곧 오늘이면(내내 내림) 그릴 것이 없다. */
let lowLine = null;
let lowDot = null;
let brkLo = null;
const lowPt = traded.reduce((a, b) => (b.maxManwon < a.maxManwon ? b : a));
if (lowPt.maxManwon < hit.priceManwon) {
  const ly = r2(yOf(lowPt.maxManwon));
  const vsLow = ((hit.priceManwon - lowPt.maxManwon) / lowPt.maxManwon) * 100;
  const t1 = `${eok(lowPt.maxManwon)}(${ymLab(lowPt.ym)})`;
  const t2 = `저점대비 +${vsLow.toFixed(1)}%`;
  /* 파랑 직선은 **판 맨 오른쪽**에 세운다(오너 2026-08-16).
     오늘 자리가 곧 오른쪽 끝이라, 여기 서야 "오늘 값에서 저점까지"라는 말이 그림과 맞는다.
     그래서 라벨은 그 왼쪽으로 물린다 — 안 물리면 글자를 직선이 관통한다. */
  /* ⚠️ X1(판 끝)에 세웠더니 오늘 점(x=879)을 11px 비껴 지나가, 파랑 눈금이 링 옆구리로
     삐져나오고 세로선이 곡선과 나란히 어긋났다(2026-08-16b 검수).
     **오늘 점 바로 그 자리**에 세운다 — "오늘 값에서 저점까지"라는 말이 그림과 맞아야 한다. */
  const bx = dx;
  const LOW_LAB_TX = r2(X1 - 34);
  lowLine = {
    x1: X0,
    x2: X1,
    y: ly,
    tx: LOW_LAB_TX,
    anchor: "end",
    ty1: r2(ly - 52),
    ty2: r2(ly - 16),
    text1: t1,
    text2: t2,
    tone: "lo",
  };
  brkLo = { x: bx, y1: thrY, y2: ly, tickX1: r2(bx - 12), tickX2: r2(bx + 12), tone: "lo" };
  const li = pts.findIndex((p) => p.ym === lowPt.ym);
  /* 저점 점은 **파랑 채움** — 저점 라벨과 같은 색이라 눈이 바로 잇는다. */
  if (li >= 0) lowDot = { x: r2(xOf(li)), y: ly, r: 10, tone: "lo" };
}

/* ── ⚠️ 곡선이 라벨을 관통하지 않게 (2026-08-16c 검수)
 *
 * 라벨 자리를 고정해 두면 "늘 나온다"는 장점이 있지만, **곡선이 그 자리를 지나가면
 * 글자를 가로지른다.** 서초포레스타2단지에서 저점 라벨 "12.2억(24.10월)" 한가운데를
 * 곡선이 뚫고 지나갔다 — 저점이 2024년 10월이라 라벨을 둔 오른쪽 아래가 곧 곡선 자리였다.
 * 곡선 아래에 깔아도 글자가 잘리는 건 마찬가지고, designQa 는 SVG 안을 못 잰다.
 *
 * 다만 **훑되 반드시 하나를 고른다** — 예전에 빈 자리를 찾게 했더니 자리가 없는
 * 단지에서 표시가 통째로 사라졌다(상록마을 라이프2차). 지금은 판을 격자로 훑고,
 * 빈 자리가 없으면 **가장 덜 겹치는 칸**에 두고 경고를 남긴다 —
 * 어긋나게 겹치는 것이 사라지는 것보다는 낫다.
 *
 * 곡선은 구간마다 단조다(위 assertNoOvershoot 가 실측으로 보장한다). 그래서 두 점 사이
 * y 는 양 끝값을 벗어나지 않고, **구간 사각형만 재면 정확하다** — 곡선을 다시 풀 필요가 없다. */
const segBoxes = [];
for (const sg of paths) {
  for (let i = 0; i < sg.length - 1; i++) {
    segBoxes.push({
      x0: Math.min(sg[i][0], sg[i + 1][0]),
      x1: Math.max(sg[i][0], sg[i + 1][0]),
      y0: Math.min(sg[i][1], sg[i + 1][1]),
      y1: Math.max(sg[i][1], sg[i + 1][1]),
    });
  }
}
/** 두 사각형이 겹치는 넓이(px²) */
const overlap = (a, b) => {
  const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  return ox > 0 && oy > 0 ? ox * oy : 0;
};
/** 곡선과 겹치는 넓이(px²). 0 이면 깨끗하다. */
function curveClash(box) {
  let area = 0;
  for (const g of segBoxes) area += overlap(box, g);
  return area;
}
/** 곡선 말고 피해야 할 것들(눈금·점·먼저 놓인 라벨)과 겹치는 넓이 */
curveClash.extra = (box) => extraBoxes.reduce((s, g) => s + overlap(box, g), 0);
/* 곡선 말고도 피해야 할 것들 — 브래킷 세로선, 점, 그리고 먼저 자리를 잡은 다른 라벨.
   이것들을 안 넣으면 라벨이 곡선을 피해 가서 눈금 위에 앉는다. */
const extraBoxes = [];
for (const b of [brkHi, brkLo]) {
  if (b) extraBoxes.push({ x0: b.tickX1, x1: b.tickX2, y0: Math.min(b.y1, b.y2), y1: Math.max(b.y1, b.y2) });
}
/* 오늘 점(링)만 넣는다. **고점 점·저점 점은 넣지 않는다** — 그 점은 제 라벨 바로 아래
   기준선 위에 앉으라고 찍은 것이라, 장애물로 세면 모든 카드에서 라벨이 까닭 없이 도망간다
   (실제로 6장 전부 고점 라벨이 움직였다). 곡선은 이미 segBoxes 가 잡는다. */
if (dot) extraBoxes.push({ x0: dot.x - dot.rOuter, x1: dot.x + dot.rOuter, y0: dot.y - dot.rOuter, y1: dot.y + dot.rOuter });
/* 연도 축도 피한다. 저점 라벨을 기준선 **아래**로 내리는 길을 열자마자, 둘째 줄이
   "2021" 위에 그대로 겹쳐 앉았다(2026-08-16c 서초포레스타2단지). 축은 판 맨 아래 한 줄이라
   x 를 아무리 옮겨도 못 피하는 자리가 있고, 그럴 땐 위쪽 후보가 이겨야 한다. */
for (const a of axis) {
  const half = widthOf(a.text, 24) / 2 + 6;
  extraBoxes.push({ x0: a.x - half, x1: a.x + half, y0: a.y - 24, y1: a.y + 8 });
}
/* ── 기준선 — **자기 선은 빼고, 남의 선만** 장애물로 센다 (2026-08-25 정정)
 *
 * 예전 판단은 "기준선은 장애물로 세지 않는다"였고, 근거가 분명했다:
 *   한 번 전부 넣어 봤더니 곡선을 피해 내려온 라벨이 점선 위에 앉는다는 이유로 다시
 *   곡선 쪽으로 되돌아갔다(서초포레스타2단지). 그리고 **그 점선은 이 라벨이 가리키는
 *   바로 그 선**이라 붙어 있는 편이 오히려 읽힌다. 그 판단은 지금도 맞다.
 *
 * 틀린 것은 **전부-아니면-전무**였다. 라벨이 제 선에 붙는 것은 읽히지만,
 * **남의 선**(특히 진한 돌파선)이 글자를 가로지르는 것은 그냥 사고다.
 * 2026-08-17 에 서초포레스타2 저점 라벨이 기준선에 걸치는 것을 사람 눈으로 찾았고,
 * 08-25 에 중계주공5·영통센트럴파크뷰·영통에듀파크에서 같은 것이 재발했다.
 * 셋 다 **자기 선이 아니라 남의 선**에 걸렸다.
 *
 * 그래서 아래 `otherLines` 로, 라벨마다 **자기 선을 뺀 나머지**만 장애물로 넣는다.
 * 옛 판단(자기 선은 봐준다)은 그대로 살아 있다. */
const lineBands = [];
/* ⚠️ 띠를 넓히지 않는다. 가산두산위브가 돌파선에 스치길래 20px 로 넓혀 봤더니, 라벨이
   그걸 피하느라 **제 기준선 한가운데로** 밀려 12px 관통했다(2026-08-25 실측, 세 장에서).
   피할 자리가 없는 판에서 한쪽을 더 세게 밀면 반대쪽이 깨진다 —
   **자리가 없는 것은 배치로 못 푼다.** 그런 소재는 카드로 만들지 않는 것이 답이다. */
if (threshold) lineBands.push({ y: threshold.y, w: 4 });
if (prevLine) lineBands.push({ y: prevLine.y, w: 3 });
if (lowLine) lineBands.push({ y: lowLine.y, w: 3 });

/* 후보 자리: 판 가로 41칸 × 세로 9단(아래 STEPS·dy 목록이 실제 값이다).
   **훑어 고르되 반드시 하나를 고른다** —
   빈 자리가 없으면 가장 덜 겹치는 칸을 쓴다. 예전처럼 표시가 사라지는 일은 없다.
   같은 점수면 **원래 자리에 가까운 쪽**을 골라, 데이터가 조금 바뀌었다고 라벨이
   판을 가로질러 튀지 않게 한다(정기물은 매번 비슷해 보여야 한다). */
for (const [L, name] of [[prevLine, "고점"], [lowLine, "저점"]]) {
  if (!L) continue;
  const w = Math.max(widthOf(L.text1, LAB_FS), widthOf(L.text2, LAB_FS));
  const homeX0 = L.anchor === "end" ? L.tx - w : L.tx;
  const minX = X0 + 34;
  const maxX = X1 - 34 - w;
  /* 가로 41칸(STEPS=40 → k=0..40. 9칸은 성긴 빈 자리를 놓쳤다) × 세로 9단(dy 목록).
     세로로도 조금 올려 본다 — 서초포레스타2단지는 기준선 바로 위 띠 전체를 곡선이 훑고 지나가
     가로로는 어디에 둬도 걸렸다. 라벨은 선 위 어디에 있든 그 선을 가리키므로,
     **한 칸 올리는 것**이 글자가 잘리는 것보다 낫다. */
  const STEPS = 40;
  const cands = [];
  /* dy 후보에 **아래쪽(+52)** 이 있는 게 중요하다. 저점 기준선 아래로는 곡선이 절대 안 내려간다
     (그 선이 곧 최저값이다) — 그래서 저점 라벨에게는 아래가 거의 언제나 비어 있는 자리다.
     서초포레스타2단지는 선 위 띠를 곡선이 전부 훑어, 위로는 어디에 둬도 글자가 잘렸다. */
  for (const dy of [0, -23, -46, -69, -92, -115, -138, 26, 52]) {
    for (let k = 0; k <= STEPS; k++) {
      const x0 = maxX <= minX ? minX : minX + ((maxX - minX) * k) / STEPS;
      cands.push({ x0, dy, dist: Math.abs(x0 - homeX0) });
    }
  }
  /* 원래 자리도 후보에 넣는다 — 안 겹치면 dy·dist 가 0 이라 반드시 이겨서,
     지금까지 확정한 카드의 픽셀이 안 바뀐다. */
  cands.push({ x0: homeX0, dy: 0, dist: 0 });

  /* 이 라벨이 가리키는 선은 빼고, 남의 선만 피한다(위 주석). */
  const otherLines = lineBands
    .filter((b) => Math.abs(b.y - L.y) > 0.5)
    .map((b) => ({ x0: X0, x1: X1, y0: b.y - b.w, y1: b.y + b.w }));
  const lineClash = (box) => otherLines.reduce((t, g) => t + overlap(box, g), 0);

  const scored = cands.map((c) => {
    const box = { x0: c.x0, x1: c.x0 + w, y0: L.ty1 + c.dy - LAB_FS, y1: L.ty2 + c.dy + 8 };
    /* 곡선은 3배 — 검은 5px 실선이 글자를 뚫는 건 연도 축을 스치는 것과 다른 사고다.
       경고에는 **가중치 없는 실제 겹침**을 적는다(점수를 px² 처럼 읽으면 사람이 오판한다). */
    const raw = curveClash(box) + curveClash.extra(box) + lineClash(box);
    /* 남의 기준선은 곡선(×3)과 눈금(×1) 사이 무게로 둔다 — 글자를 가로지르는 건 사고지만,
       곡선이 글자를 뚫는 것보다는 덜 나쁘다. 그래야 둘 다 피할 수 없을 때 곡선을 먼저 피한다. */
    return {
      ...c,
      ok: box.y0 >= 0,
      raw,
      clash: curveClash(box) * 3 + curveClash.extra(box) + lineClash(box) * 2,
    };
  });
  /* 판 위로 넘치는 후보는 제쳐 둔다(뒤의 넘침 검사가 던진다) */
  const usable = scored.filter((c) => c.ok);
  usable.sort((a, b) => a.clash - b.clash || Math.abs(a.dy) - Math.abs(b.dy) || a.dist - b.dist);
  const best = usable[0] ?? scored[0];

  if (Math.abs(best.x0 - homeX0) > 0.5 || best.dy !== 0) {
    L.tx = r2(best.x0);
    L.anchor = "start";
    L.ty1 = r2(L.ty1 + best.dy);
    L.ty2 = r2(L.ty2 + best.dy);
    console.warn(`   ↔ ${name} 라벨을 옮겼습니다 — 원래 자리를 곡선·눈금이 지나갑니다`);
  }
  if (best.raw > 0) {
    console.warn(`   ⚠️ ${name} 라벨이 ${Math.round(best.raw)}px² 겹칩니다 — 판에 빈 자리가 없습니다. 눈으로 확인하세요`);
  }
  /* 자리를 잡았으면 다음 라벨은 이 자리도 피한다. */
  extraBoxes.push({ x0: best.x0 - 8, x1: best.x0 + w + 8, y0: L.ty1 - LAB_FS - 8, y1: L.ty2 + 16 });
}

/* ⚠️ SVG 글자는 designQa 가 못 잰다 — 판을 넘는지 여기서 재고, 넘으면 던진다. */
for (const L of [prevLine, lowLine]) {
  if (!L) continue;
  const w = Math.max(widthOf(L.text1, LAB_FS), widthOf(L.text2, LAB_FS));
  const left = L.anchor === "end" ? L.tx - w : L.tx;
  if (left < 0 || left + w > VB_W) throw new Error(`기준선 라벨("${L.text1}")이 판을 넘습니다.`);
  if (L.ty1 - LAB_FS < 0) throw new Error(`기준선 라벨이 판 위로 넘칩니다.`);
  if (L.ty2 + 8 > VB_H) throw new Error(`기준선 라벨이 판 아래로 넘칩니다.`);
}
/* 두 기준선이 붙어 있으면 라벨 두 벌이 겹친다 — 그때는 고점 라벨을 더 위로 올린다. */
if (prevLine && lowLine && Math.abs(prevLine.y - lowLine.y) < 110) {
  prevLine.ty1 = r2(prevLine.ty1 - 44);
  prevLine.ty2 = r2(prevLine.ty2 - 44);
}
/* ── 돌파선 라벨(오늘 값) × 고점 라벨이 **실제로** 겹치나 (2026-08-25 정정)
 *
 * 예전엔 **세로 간격만** 봤다. 그런데 두 라벨은 가로로도 멀리 떨어져 있다 —
 * 돌파선 라벨은 오른쪽 끝(`X1-34`, end 앵커)이고, 고점 라벨은 자리를 재서 대개 왼쪽에 선다.
 * 그래서 신고가와 직전 최고가가 거의 같은 단지에서 **겹치지도 않는데 던졌다**:
 *   · 중계주공5        8.97억 → 9억   (+0.3%)
 *   · 가산두산위브      7.45억 → 7.5억 (+0.67%)
 *   · 영통센트럴파크뷰   5.95억 → 6억   (+0.84%)
 * 셋 다 그림에는 아무 문제가 없었고, **오탐 때문에 카드가 안 나왔다.**
 *
 * 이제 **두 축이 다 겹칠 때만** 던진다. 이 가드는 자리를 옮기지 않고 판정만 하므로
 * **통과하던 카드의 픽셀은 한 픽셀도 안 움직인다** — 막히던 카드만 풀린다.
 * (VB_H 를 738 로 줄이며 세로가 좁아져 영통센트럴파크뷰가 새로 걸렸고,
 *  그 덕에 옛 가드가 가로를 안 본다는 사실이 드러났다.) */
if (threshold && prevLine) {
  const THR_FS = 24; // .sr-thrlab
  const thrW = widthOf(threshold.text, THR_FS);
  const thrBox = { x0: threshold.tx - thrW, x1: threshold.tx, y0: threshold.ty - THR_FS, y1: threshold.ty + 8 };
  const prvW = Math.max(widthOf(prevLine.text1, LAB_FS), widthOf(prevLine.text2, LAB_FS));
  const prvX0 = prevLine.anchor === "end" ? prevLine.tx - prvW : prevLine.tx;
  const prvBox = { x0: prvX0, x1: prvX0 + prvW, y0: prevLine.ty1 - LAB_FS, y1: prevLine.ty2 + 8 };
  const GAP = 16;
  const overlapX = prvBox.x0 < thrBox.x1 + GAP && thrBox.x0 < prvBox.x1 + GAP;
  const overlapY = prvBox.y0 < thrBox.y1 + GAP && thrBox.y0 < prvBox.y1 + GAP;
  if (overlapX && overlapY) {
    throw new Error(
      `돌파선 라벨("${threshold.text}")과 고점 라벨("${prevLine.text1}")이 겹칩니다 — 판 높이(VB_H)를 줄이거나 고점 라벨 자리를 옮기세요.`,
    );
  }
}

/* ── 판 안쪽 워터마크 (오너 2026-08-16b "더 키워서 대각선으로 기울여서 중앙배치")
   BRAND.md 슬롯 C. 이 카드는 곡선 판이 카드 높이의 절반을 넘어(775/1350 ≈ 57%)
   **판만 잘라 재업로드**가 실제로 되는 모양이라 슬롯 C 조건을 만족한다.

   ⚠️ 처음엔 "빈 곳을 재서" 고르게 했는데(BRAND.md 원칙), 오너가 **중앙 고정**으로 바꿨다.
      자리를 재면 단지마다 워터마크가 다른 데 앉아 카드가 매번 달라 보인다 — 정기물에는
      그게 더 나쁘다. 대신 **흰색 + 모든 데이터 아래**라 무엇을 밟아도 가려지지 않는다.

   기울기는 손으로 찍지 않는다. **판 자신의 대각선 각도**를 쓰고, 크기는 그 각도로
   돌린 글자 상자가 판 안에 들어가는 **최대치**를 계산해 쓴다 — 판 비율이 바뀌어도 따라온다. */
function centerStamp(text) {
  const MARGIN = 24;
  const deg = (Math.atan2(VB_H, VB_W) * 180) / Math.PI; // 판 대각선
  const th = (deg * Math.PI) / 180;
  const availW = VB_W - MARGIN * 2;
  const availH = VB_H - MARGIN * 2;
  /* 돌린 글자 상자의 외접 크기:  W' = w·cosθ + h·sinθ ,  H' = w·sinθ + h·cosθ
     (w = 글자 폭 = len·size·0.62, h = size) → size 에 대해 1차식이라 바로 풀린다. */
  const k = text.length * 0.62;
  const perW = k * Math.cos(th) + Math.sin(th);
  const perH = k * Math.sin(th) + Math.cos(th);
  const size = Math.floor(Math.min(availW / perW, availH / perH));
  if (size < 40) return null; // 이만큼도 안 들어가면 안 붙인다
  return {
    x: r2(VB_W / 2),
    y: r2(VB_H / 2 + size * 0.34), // 가운데 정렬 → 베이스라인
    cx: r2(VB_W / 2),
    cy: r2(VB_H / 2),
    size,
    text,
    rotate: -r2(deg), // 오른쪽 위로 올라가는 대각선
  };
}
const stamp = centerStamp("@wirit_note");
if (!stamp) console.warn("ⓘ 판이 작아 워터마크를 생략합니다.");

/* ── 가까운 역 (오너 2026-08-16 "가까운 역을 뱃지로")
   파일이 없으면 **뱃지를 붙이지 않는다.** 내가 아는 역 이름을 적는 건 오보다 —
   `data/apt-station-queue.txt` 에 `kapt=...` 한 줄을 밀어 코드가 재게 한다.
   ⚠️ 거리는 카드에서 뺐다(오너 2026-08-16) — 노선과 역 이름만 알약 하나에 담는다. */
let station = null;
let stationRaw = null; // 뱃지를 생략하더라도 **잰 값은 meta 에 남긴다**
if (KAPT) {
  const sp = P(`data/datasets/apt-station/${KAPT}.json`);
  /* ⚠️ station 이 null 인 파일은 **반경 안에 역이 없다고 확인한 기록**이다(2026-08-31 신설).
     그전엔 그런 단지에 파일을 안 남겨 매번 다시 조회했고, 수집기가 종료코드 1 로 끝나
     워크플로 전체가 빨간불이 됐다(30일 실패 7회). 여기서는 없는 것처럼 지나간다 —
     뱃지를 안 붙이는 것이 정답이고, 아래 블록은 역이 있을 때만 돌면 된다. */
  const stationKnownMissing = existsSync(sp)
    && (JSON.parse(readFileSync(sp, "utf8")).station == null);
  if (stationKnownMissing) {
    console.log(`ⓘ ${KAPT} — 반경 안에 역이 없다고 확인된 단지입니다. 뱃지 생략.`);
  } else if (existsSync(sp)) {
    const st = JSON.parse(readFileSync(sp, "utf8"));
    /* ⚠️ 거리를 카드에서 뺐기 때문에(오너 2026-08-16) 뱃지는 **"가깝다"는 말**이 된다.
       그러면 먼 역을 붙이는 순간 그 자체가 과장이다 — 반정아이파크캐슬5단지는
       가장 가까운 역이 1,614m 였다(걸어서 20분 이상). 그건 역세권이라 부를 거리가 아니다.
       그래서 **직선 1,000m 를 넘으면 뱃지를 안 붙인다.** 수집은 그대로 남는다(meta 에 기록). */
    const MAX_BADGE_M = 1000;

    /* ── 같은 역이 노선별로 쪼개져 오면 **노선을 합친다** (2026-08-24)
     *
     * 카카오는 환승역을 노선별 POI 로 준다: `디지털미디어시티역 경의중앙선`(386m) 과
     * `디지털미디어시티역 공항철도`(576m) 가 **다른 항목**으로 온다. 가장 가까운 하나만
     * 쓰면 뱃지가 「경의중앙 · 디지털미디어시티역」이 되어 **환승역이 단일 노선역으로 읽힌다.**
     * 환승 뱃지 누락은 오너의 반복 지적이다(노선 카드 2026-08-02).
     *
     * ⚠️ **없는 노선을 채워 넣지 않는다.** DMC역은 6호선도 지나지만 카카오 응답에 그 항목이
     *    없어 여기서도 싣지 않는다 — 아는 것을 적는 게 아니라 **받은 것을 적는다**(오보 0).
     *    빠진 노선이 문제면 고칠 곳은 이 빌더가 아니라 **수집기**다.
     *
     * 합치는 조건은 **이름이 같은 역**뿐이다(공백 앞 첫 토막 대조). 증산역처럼 이름이 다른
     * 역은 다른 역이므로 절대 합치지 않는다 — 합치면 그게 곧 가짜 환승역이다. */
    const stem = (s) => String(s ?? "").split(/\s+/)[0];
    const sameStation = (st.others ?? []).filter((o) => stem(o.station) === stem(st.station));
    const lines = [...new Set([...(st.lines ?? []), ...sameStation.flatMap((o) => o.lines ?? [])])];
    if (lines.length > (st.lines ?? []).length) {
      console.log(
        `↔︎ 환승역 노선 합침: ${stem(st.station)} · ${lines.join("+")} ` +
          `(카카오가 노선별로 나눠 준 ${1 + sameStation.length}개 항목)`,
      );
    }

    stationRaw = { name: st.station, lines, distanceM: st.distanceM };
    if (st.distanceM != null && st.distanceM > MAX_BADGE_M) {
      console.warn(
        `ⓘ 가장 가까운 역이 ${st.station} ${st.distanceM}m — ${MAX_BADGE_M}m 를 넘어 뱃지를 생략합니다.`,
      );
      station = null;
    } else {
      /* ── 역 이름이 길면 뱃지를 한 치수 줄인다 (2026-08-24)
       *
       * 최상단 줄은 `[킥커] [역 뱃지]` 이고 그 오른쪽 끝에 `wirit.` 로고가 절대위치로 앉아 있다.
       * 「디지털미디어시티역」(9자)이 오자 줄이 로고를 **가로 21px 침범**했다(designQa `badgeclip`).
       * 판형이 「광명사거리역」·「길음역」 같은 짧은 이름을 전제로 잡혀 있었던 것이다.
       *
       * 글자 수로 가른다 — 폭을 em 으로 어림하는 방식은 실측과 30px 씩 어긋나 믿을 수 없었다.
       * 8자 이상이면 줄인다. 지금 확정본들의 역 이름은 전부 6자 이하라(광명사거리역·청계산입구역
       * 6자 · 길음역·화서역·다산역·망포역 3자) **한 장도 픽셀이 변하지 않는다.**
       * 새 CSS 는 `.sr-stn.compact` 로 가둬 이 플래그가 없으면 아예 안 켜진다(픽셀 불변). */
      const compact = String(st.station ?? "").length >= 8;
      if (compact) console.log(`ⓘ 역 이름이 길어(${st.station}) 뱃지를 compact 로 그립니다.`);
      station = { name: st.station, lines, distanceM: st.distanceM, compact };
    }
  } else {
    console.warn(
      `ⓘ 가까운 역 자료가 없어 뱃지를 생략합니다. 붙이려면:\n` +
        `   data/apt-station-queue.txt 에  kapt=${KAPT}  한 줄을 쓰고 푸시`,
    );
  }
}

/* ── ⑤ 문구 — 전부 위 수치에서 나온다 */
const first = traded[0];
const fromLabel = `${hist.meta.from.slice(0, 4)}년${hist.meta.from.slice(4) === "01" ? "" : ` ${Number(hist.meta.from.slice(4))}월`}`;
const dot2 = (d) => `${d.slice(0, 4)}.${d.slice(5, 7)}.${d.slice(8, 10)}`;

/* ── 제목에 **지역을 붙이지 않는다** (오너 2026-08-16b "이름 앞에 지역은 빼는걸로 전체 세팅")
   예전엔 "영통 늘푸른벽산 34평"처럼 회색 지역 라벨을 앞에 뒀고, 단지명이 이미 지역을
   품으면(광명한진타운) 생략하는 예외까지 있었다. 그 예외가 곧 카드마다 제목 모양이
   달라지는 이유였다 — 정기물은 **한 가지 모양**이어야 한다.
   지금 제목은 언제나 `단지명 + 평형` 두 토막이다.

   ⚠️ 지역이 카드에서 사라지는 게 아니다 — 역 뱃지(길음역·다산역)와 캡션이 말한다.
      지역을 다시 싣게 되면 제목이 아니라 **킥커 쪽**에 두는 것이 이 판형에 맞는다
      (제목은 주인공 하나만 세우는 자리다). */
const gu = hit.gu; // meta 에만 남긴다

/* ── 제원 **세 줄** (오너 2026-08-25 지정 형식)
 *
 *   서울 노원구 공릉동
 *   1,308세대 / '22년 준공 / 주차 1.2대
 *   전용 84.98㎡ / 4층
 *
 * 바뀐 것 셋 — 오너가 준 모양 그대로다:
 *   ① 구분자 `|` → `/`
 *   ② 준공 `2022년 준공` → `'22년 준공` (두 자리 + 어깨따옴표)
 *   ③ 주차가 **제 줄을 버리고** 세대수 줄로 올라왔다: `세대당 주차 1.2대` → `주차 1.2대`
 *
 * ⚠️ ③ 때문에 줄 수가 4 → 3 으로 **줄었다.** 위가 줄면 곡선 판(VB_H)을 **키울 수 있다** —
 *    같은 날 오전 주소 줄이 늘면서 768→738 로 내렸던 것을 되돌린다(VB_H 주석 참고).
 * ⚠️ `주차 1.2대` 는 여전히 **세대당** 값이다(총 대수 아님). 라벨에서 '세대당'이 빠졌지만
 *    0.6·1.2 같은 값이라 총 대수로 읽힐 수 없다. 총 대수는 meta.parking 에 그대로 남는다.
 * ⚠️ 세 값이 한 줄에 서므로 이 줄이 제일 길다. 넘치면 designQa 가 잡는다 — 그때는 글자를
 *    줄이지 말고 **무엇을 뺄지**를 정한다(한 행의 폭은 제로섬이다). */
const SEP = '<span class="sep">/</span>';
const yy = hit.buildYear ? String(hit.buildYear).slice(2) : null;

/* ── 주소 — 제원의 **맨 윗줄** (오너 2026-08-25)
 *   "서울 송파구 잠실동" · "수원시 영통구 이의동"
 *
 * ⚠️ 이것은 2026-08-16b「제목에 지역을 붙이지 않는다」를 뒤집는 게 아니다.
 *    그때 정한 것은 **제목은 주인공(단지명+평형) 하나만 세운다**였고, 지역은 역 뱃지·캡션·
 *    meta.region 이 말하기로 했다. 그 문서에 이미 적혀 있다 —
 *    *"다시 싣게 되면 제목이 아니라 킥커 쪽에 둔다."* 제원 맨 윗줄이 그 자리다.
 *    제목은 여전히 두 토막이고, 카드마다 모양이 달라지지 않는다.
 *
 * 표기 규칙 — 오너가 준 두 예시에서 그대로 뽑았다:
 *   · 서울(lawdCd 11xxx) → `서울 은평구 증산동`   ← 시도 이름을 붙인다
 *   · 경기(41xxx)        → `수원시 영통구 이의동` ← 시도(경기)는 안 붙이고 시·구를 띄운다
 *     (`gu` 가 `수원시영통구` 처럼 붙어 오므로 '시' 뒤에서 한 번만 끊는다.
 *      `하남시` 처럼 구가 없는 곳은 그대로 `하남시 선동`)
 * ⚠️ 코드가 `gu`·`umdNm` 에서 만든다. 사람이 손으로 적지 않는다 — 15장을 손으로 적으면
 *    한 장은 반드시 틀린다. */
function addressLine(lawdCd, guName, umd) {
  const g = String(guName ?? "").trim();
  const u = String(umd ?? "").trim();
  if (!g || !u) return null;
  if (String(lawdCd).startsWith("11")) return `서울 ${g} ${u}`;
  // 「수원시영통구」→「수원시 영통구」. '시' 뒤에 글자가 더 있을 때만 끊는다.
  const m = g.match(/^(.+?시)(.+구)$/);
  return m ? `${m[1]} ${m[2]} ${u}` : `${g} ${u}`;
}
const specAddr = addressLine(hit.lawdCd, hit.gu, hit.umdNm);

/* 카드에 찍을 이름 — `--name` 이 있으면 그것, `--merge-blocks` 면 합친 이름, 없으면 신고명. */
const DISPLAY_NAME = NAME_OVERRIDE || (MERGE ? APT : hit.aptNm);
/* 주차대수 — **세대당 몇 대**로 적는다(오너 2026-08-16 "주차대수 0.0대").
   ⚠️ 총 대수만 적으면 큰 단지가 무조건 좋아 보인다. 사람이 궁금한 건 "내 차 댈 데 있나"다.
   ⚠️ 자료가 없으면 **줄을 안 붙인다.** 짐작해 적는 순간 오보다 —
      `data/apt-detail-queue.txt` 에 `kapt=...` 한 줄을 밀어 코드가 받게 한다. */
let parking = null;
if (KAPT && kapt?.hhld > 0) {
  const dp = P(`data/datasets/apt-detail/${KAPT}.json`);
  if (existsSync(dp)) {
    const d = JSON.parse(readFileSync(dp, "utf8"));
    if (d.parkTotal > 0) parking = { ...d, perHhld: d.parkTotal / kapt.hhld };
  } else {
    console.warn(
      `ⓘ 주차대수 자료가 없어 그 줄을 생략합니다. 붙이려면:\n` +
        `   data/apt-detail-queue.txt 에  kapt=${KAPT}  한 줄을 쓰고 푸시`,
    );
  }
}
/* ── 제목의 평 = **실측 공급평수** (오너 2026-08-16d)
   "전용 59, 84로만 단지서칭은 하되, 카드를 만들때에는 실제 공급평수를 적어줘야지."

   예전엔 전용 84 → 34평, 59 → 25평 **고정 대응표**였다(`parse/singo.ts` 의 `PYEONG_LABEL`).
   단지가 뭐든 같은 값이 나오니 오보 0 규칙 위반이고, 실제로 틀렸다 —
   늘푸른벽산·래미안크리시엘·광명한진은 34평이 아니라 **33평**이었다
   (네이버부동산 표기 109.94㎡(84.92) 와 소수점까지 대조 확인).

   공급면적 = 전유 + 「주건축물」 공용. 건축물대장에서 코드가 뽑는다.
   ⚠️ 자료가 없으면 **멈춘다.** 고정표로 되돌아가지 않는다 — 그 표가 틀려서 고친 것이다.
      대기열에 쓸 한 줄을 찍어 주니 사람은 그걸 밀기만 하면 된다. */
let supply = null;
if (KAPT) {
  const type = hit.area >= 82 ? "84" : hit.area >= 56 ? "59" : String(Math.round(hit.area));
  const sp = P(`data/datasets/apt-supply/${KAPT}-${type}.json`);
  if (existsSync(sp)) {
    supply = JSON.parse(readFileSync(sp, "utf8"));
    /* ── ⚠️ **수집기가 스스로 단 경고는 카드까지 따라와야 한다** (2026-09-03)
     *
     * 금호두산 전용 84.99 의 공급면적이 97.52㎡(29평)로 왔다. 수집기는 그때 이미
     * `warn: 전용률 87.2% — 흔한 범위(70~85%) 밖이다` 를 파일에 적어 뒀는데,
     * **빌더가 그 줄을 읽지 않아** 29평이 그대로 제목에 실릴 뻔했다.
     * 자료가 스스로 "이건 이상하다"고 말하는데 그 말이 카드까지 못 오면, 그 경고는 없는 것이다.
     *
     * 그래서 **멈춘다.** 정말 그런 단지라면 사람이 확인하고 `--accept-supply-warn` 로 통과시키고,
     * 그 사실은 meta 에 남는다 — 나중에 "왜 29평이지?" 를 되짚을 수 있어야 한다.
     *
     * ── ⚠️⚠️ **새 기준은 앞으로 만들 카드에만 적용한다** (오너 2026-09-03)
     *
     * *"기존에 이미 발행한 카드를 왜 소급해? 확정된 카드는 이미 인스타 올라간 거야.
     *   기준 바꾸면 새롭게 만들어지는 것에 대해서만 적용해야지."*
     *
     * 이 문지기를 단 날, **이미 오너가 확정해 인스타에 올라간 카드 9장**이 소급해서 막혔다
     * (서초포레스타2단지·꿈의숲아이파크·개봉 한마을 등 — 전용률 58~70%). 그 카드들은
     * **그때 기준으로 오너가 그 평 표기를 보고 확정한 것**이다. 나중에 생긴 잣대로 되짚어
     * 「너는 틀렸다」고 하는 것은 문지기가 할 일이 아니다 — 이미 나간 것은 고칠 수도 없다.
     *
     * → 그래서 `sets.json` 에서 **이 카드가 이미 「오너 확정」인지** 보고, 그렇다면 통과시킨다.
     *   대신 ⓘ 로 한 줄 적는다 — 조용히 넘기지는 않는다.
     * ⚠️ **아직 확정 안 된 카드에는 그대로 막는다.** 그게 이 문지기의 자리다.
     * ⚠️ 이 예외는 「확정됐다」는 사실 하나로만 열린다. 그 사실은 사람이 못 위조한다 —
     *    확정은 `confirm.mjs` 만 쓰고, 그때 md5 증거가 함께 박힌다. */
    const publishedSlug = `singo-${full(APT)}-${TYPE}`;
    const alreadyConfirmed = (() => {
      try {
        const S = JSON.parse(readFileSync(P("data/review/sets.json"), "utf8"));
        return (S.sets ?? []).some((s) => s.state === "오너 확정" && (s.cards ?? []).includes(publishedSlug));
      } catch {
        return false;
      }
    })();
    if (supply.warn && alreadyConfirmed) {
      console.log(
        `ⓘ 공급면적 경고가 있지만 **이미 오너가 확정·발행한 카드**라 그대로 그립니다 — ${publishedSlug}\n` +
          `   (${supply.warn})\n` +
          `   새 기준은 앞으로 만들 카드에만 적용합니다(오너 2026-09-03).`,
      );
    }
    if (supply.warn && !alreadyConfirmed && !flag("accept-supply-warn")) {
      throw new Error(
        `공급면적 자료에 경고가 붙어 있습니다: ${sp}\n` +
          `   ⚠️ ${supply.warn}\n` +
          `   전유 ${supply.exclusive}㎡ + 주건축물공용 ${supply.commonResidential}㎡ = ${supply.supply}㎡ (${supply.pyeongLabel})\n` +
          `   parts: ${(supply.parts ?? []).map((p) => `${p.purpose} ${p.area}㎡`).join(" · ")}\n` +
          `→ 사람이 실제 분양 평형과 대조한 뒤에만 --accept-supply-warn 로 통과시킵니다.\n` +
          `   대조 없이 통과시키면 제목에 틀린 평이 박힙니다 — 그게 오보 0 이 깨지는 지점입니다.`,
      );
    }
    if (supply.pyeongLabel) hit.pyeong = supply.pyeongLabel;
  } else {
    throw new Error(
      `공급면적 자료가 없습니다: data/datasets/apt-supply/${KAPT}-${type}.json\n` +
        `→ data/apt-supply-queue.txt 에 아래 한 줄을 쓰고 푸시하세요\n` +
        `   kapt=${KAPT} area=${hit.area}\n` +
        `   전용 ${hit.area}㎡ 로 서칭하되 카드에는 **실제 공급평수**를 적습니다(오너 2026-08-16d).\n` +
        `   고정 환산표로 되돌아가지 않습니다 — 그 표가 틀려서 고친 것입니다.`,
    );
  }
}

/* 전용면적은 소수 둘째 자리까지. 실거래 원본이 84.925 처럼 셋째 자리를 주는 단지가 있어
   카드마다 자릿수가 달라 보였다(2026-08-16b: 84.95 · 84.48 옆에 84.925). */
const areaLab = Number(hit.area).toFixed(2).replace(/\.?0+$/, "");
const specBot = [`전용 ${areaLab}㎡`, `${hit.floor}층`];
/* 세대수 / 준공 / 주차 — 셋이 한 줄. 없는 값은 자리를 안 차지한다(구분자도 같이 사라진다).
   ⚠️ 주차는 **세대당**이다. 총 대수는 meta.parking 에 남는다 — 라벨만 짧아졌다. */
const specMid = [
  kapt ? `${kapt.hhld.toLocaleString("ko-KR")}세대` : null,
  yy ? `'${yy}년 준공` : null,
  parking ? `주차 ${parking.perHhld.toFixed(1)}대` : null,
].filter(Boolean);
const spec = [specAddr, specMid.join(SEP), specBot.join(SEP)].filter((x) => x);

const card = {
  template: "singo-record@1",
  date: DATE,
  /* 킥커 — 오너 지정 문구(2026-08-13). 돌파가 아니면 '클럽 가입'이라 부를 수 없다. */
  /* ⚠️ 날짜는 **계약일**이다(오너 2026-08-16b 지시). 발행일을 적었더니 "오늘 팔린 값"으로
     읽혔는데, 실제 계약은 2026-07-19 였다 — 실거래는 계약 후 신고까지 시차가 있어
     발행일과 늘 어긋난다. '계약' 두 글자를 앞에 붙여 무슨 날짜인지 자체가 말하게 한다. */
  kicker: hit.milestone
    ? `오늘의 ${hit.milestone}억 클럽 (계약 ${dot2(hit.date)})`
    : `오늘의 신고가 (계약 ${dot2(hit.date)})`,
  /* 제목 = **단지명(잉크) + 평형(코발트)**. 지역은 붙이지 않는다(오너 2026-08-16b).
     두 토막이라 어느 단지든 같은 모양으로 읽힌다.

     ⚠️ `--merge-blocks` 면 **합친 이름**을 쓴다(hit.aptNm 이 아니라 APT).
        DMC센트럴자이는 1~4단지를 합쳐 판정했으므로 제목에 「(2단지)」를 달면 안 된다 —
        아래 제원의 세대수 1,256 이 **단지 전체 값**이라, 2단지라고 적으면 그 순간 오보가 된다.
        무엇을 합쳐 셌는지와 무엇이라 부르는지가 같아야 한다. */
  title: `${DISPLAY_NAME} <span class="py">${hit.pyeong}</span>`,
  station,
  price: eok(hit.priceManwon),
  /* 가격 옆 한 마디 — 오너 지시(2026-08-16b, 자리에 있던 워터마크를 이걸로 바꿨다).
     ⚠️ **돌파일 때만 붙인다.** 선을 넘지 않은 그냥 신고가에 "달성!"은 말이 안 된다. */
  priceSuffix: hit.milestone ? "달성!" : null,
  spec,
  chart: { vb: `0 0 ${VB_W} ${VB_H}`, bg, stamp, threshold, prevLine, lowLine, brkHi, brkLo, paths: chartPaths, dots, axis, old, lowDot, dot },
  /* ⚠️ 하단 기준 문구를 걷어냈다(오너 2026-08-16). 다만 **"역대가 아니라 2020년 이후"** 라는
     단서는 오보를 막는 장치라 버릴 수 없어 **푸터 출처 줄로 옮겼다.** 카드 어딘가에는 있어야 한다. */
  /* 푸터는 한 줄이어야 한다 — asOf 까지 넣었더니 두 줄로 넘쳤다(2026-08-16).
     날짜는 킥커가 이미 말하므로 여기서는 **무엇을 기준으로 재는가**만 남긴다. */
  source: { name: `국토교통부 아파트 매매 실거래가 · ${fromLabel} 이후 기준` },
  meta: {
    verified: true,
    provenance: [
      `singo-log: ${hit.foundOn ?? DATE} 판정`,
      `singo-history: ${histPath.replace(ROOT + "/", "")} (${hist.meta.monthsTried}개월 · 실패 ${hist.meta.monthsFailed})`,
      ...(NAME_OVERRIDE
        ? [`⚠️ 카드 이름을 줄여 적었다: 실거래 신고명 "${hit.aptNm}" → 카드 "${NAME_OVERRIDE}" (--name, 오너 지시)`]
        : []),
    ],
    baselineFrom: hist.meta.from,
    /* 지역은 **카드 제목에서 뺐다**(오너 2026-08-16b). 그렇다고 자료에서까지 지우면
       캡션 쓰는 사람이 어디 단지인지 다시 찾아야 한다 — 여기에 남긴다. */
    region: {
      gu,
      umd: hit.umdNm,
      jibun: hit.jibun ?? null,
      note: "카드 제목에는 싣지 않는다. 지역은 역 뱃지와 캡션이 말한다.",
    },
    /* 곡선이 그리는 값을 **글자로도** 남긴다.
       chart 에는 픽셀 좌표뿐이라, 이게 없으면 그림이 자료와 맞는지 아무도 대조할 수 없다.
       (캡션 검수도 이 풀과 대조해 "카드에 없는 금액"을 잡는다.) */
    curve: traded.map((p) => ({ ym: p.ym, eok: eok(p.maxManwon), date: p.date, floor: p.floor })),
    prevPeak: { eok: eok(hit.prevPeakManwon), date: hit.prevPeakDate, gainPct: Number(hit.gainPct.toFixed(2)) },
    cycle,
    cycleCalc: {
      maxDrawdownPct: Number((worst.dd * 100).toFixed(2)),
      note: "지난 사이클 고점 = 최대 낙폭이 난 골 직전의 최고가. 코드가 계산한다(사람이 고르지 않는다).",
      ...(cycleDropped
        ? {
            dropped: true,
            why:
              `최대 낙폭 ${cycleDropped.maxDrawdownPct}% 로 기준 ${cycleDropped.minPct}% 에 못 미쳐 ` +
              `「지난 고점대비」 줄을 뺐다(2026-08-25 오너 승인). 사이클이라 부를 골이 없는 단지다 — ` +
              `대개 2021~22 사이클 뒤에 준공한 신축이다.`,
          }
        : {}),
    },
    firstPoint: { ym: first.ym, eok: eok(first.maxManwon) },
    station: station
      ? { ...station, note: "카카오 로컬이 잰 **직선거리**. 걸어간 거리가 아니다." }
      : stationRaw
        ? {
            ...stationRaw,
            note: `가장 가까운 역이 직선 ${stationRaw.distanceM}m 로 1,000m 를 넘어 **뱃지를 붙이지 않았다.** 거리를 안 싣는 판형이라 먼 역을 붙이면 그 자체가 과장이 된다.`,
          }
        : { note: "가까운 역 자료 없음 — 뱃지를 붙이지 않았다." },
    hhld: kapt
      ? {
          kaptCode: KAPT,
          kaptName: kapt.name,
          hhld: kapt.hhld,
          addr: kapt.addr,
          /* ⚠️ 예전엔 여기에 "오너가 2026-08-13 확인했다"가 **단지와 무관하게 박혀** 있었다.
             그 카드에서만 참인 말이 모든 카드에 붙으면, 다음 검수가 있지도 않은 확인을
             근거로 삼는다(2026-08-16b 검수가 잡았다). **이 실행에서 참인 것만 적는다.** */
          note:
            `공동주택 대장 값. 실거래 표기(${hit.aptNm})와 대장 표기(${kapt.name})가 달라 ` +
            `**이름으로 자동 매칭하지 않고 --kapt ${KAPT} 로 사람이 짚었다.** ` +
            `대조 근거: 실거래 지번 ${hit.umdNm} ${hit.jibun ?? "(지번 없음)"} ↔ 대장 주소 ${kapt.addr}`,
        }
      : { note: "세대수는 싣지 않는다 — 대장 항목을 짚지 않았다(--kapt 미지정)." },
    parking: parking
      ? {
          ground: parking.parkGround,
          under: parking.parkUnder,
          total: parking.parkTotal,
          hhld: kapt.hhld,
          perHhld: Number(parking.perHhld.toFixed(3)),
          note: "국토교통부 공동주택 **상세**정보(지상+지하). 세대당 = 총 대수 ÷ 대장 세대수.",
        }
      : { note: "주차대수 자료 없음 — 그 줄을 붙이지 않았다(data/apt-detail-queue.txt 에 kapt 를 밀면 받는다)." },
    /* 제목의 평이 어디서 왔는지 남긴다 — 고정 환산표가 아니라 실측이라는 증거다.
       다음 세션이 "34평 아니었나?" 하고 되돌리지 않게, 근거를 카드가 스스로 들고 있는다. */
    supplyArea: supply
      ? {
          exclusive: supply.exclusive,
          commonResidential: supply.commonResidential,
          supply: supply.supply,
          pyeong: supply.pyeong,
          label: supply.pyeongLabel,
          sample: `${supply.sampleDong} ${supply.sampleHo}`,
          /* 경고를 달고도 통과시켰다면 **카드가 그 사실을 들고 있는다** — 나중에 되짚을 수 있어야 한다 */
          ...(supply.warn
            ? { warn: supply.warn, warnAccepted: "사람이 실제 분양 평형과 대조한 뒤 --accept-supply-warn 로 통과시켰다" }
            : {}),
          note:
            "국토교통부 **건축물대장** 전유공용면적. 공급면적 = 전유 + 「주건축물」 공용. " +
            "부속건축물 공용(지하주차장·관리·경비·기계전기)은 기타공용이라 뺀다. " +
            "평은 3.305785㎡ 로 나눠 반올림(오너 2026-08-16d). " +
            "제목의 평은 전용 84→34평 같은 관용 환산표가 **아니다** — 단지마다 실제로 다르다.",
        }
      : { note: "공급면적 자료 없음 — --kapt 를 안 짚었다(짚으면 빌더가 대기열 줄을 찍어 준다)." },
    /* 워터마크 자리를 남긴다 — 손으로 찍지 않았다는 증거이자, 다음에 곡선이 바뀌어
       자리가 옮겨졌을 때 "왜 옮겼나"를 대조할 수 있는 값이다. */
    stamp: stamp
      ? { ...stamp, note: "BRAND.md 슬롯 C. 판을 격자로 훑어 잉크에서 가장 먼 칸을 골랐다(clear = 잉크까지 거리 px)." }
      : { note: "판에 빈 자리가 없어 워터마크를 붙이지 않았다(BRAND.md 슬롯 C 조건 ③)." },
  },
};

const slug = `singo-${full(APT)}-${TYPE}`;
const outDir = flag("publish") ? P(join("data/content", DATE)) : P("data/out/_spike");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${slug}.json`);
writeFileSync(outPath, JSON.stringify(card, null, 2) + "\n");

console.log(
  `${outPath}\n` +
    `${hit.aptNm} ${hit.pyeong} ${eok(hit.priceManwon)} · 직전 ${eok(hit.prevPeakManwon)} ${hit.prevPeakDate}\n` +
    (cycle ? `지난 사이클 고점 ${cycle.peak} (${cycle.when}) · 고점 대비 ${cycle.vs}\n` : "지난 사이클 고점 없음(내림 구간이 없었다)\n") +
    `곡선 ${traded.length}개월 / ${pts.length}개월 · 끊긴 구간 ${chartPaths.length - 1}곳`,
);
