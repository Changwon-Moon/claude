#!/usr/bin/env node
/**
 * ⚖️ 「같은 값에서 출발한 단지들」 — 격차 맞대결 카드 (판형 `streak-line@1` 재사용)
 *
 *   node scripts/build-gap-duel.mjs --set gap-ep1 --pick 1 [--label gap-bundang-ansan] [--date YYYY-MM-DD]
 *
 * ── 왜 새 판형을 안 만들었나
 * `streak-line@1` 은 이미 **곡선 여러 개 + 범례 + 끝점 라벨 + 축**을 빌더가 계산해 넘기는
 * 일반 선그래프 판이다. 이 카드가 필요로 하는 것이 정확히 그 계약이다. 새 판형을 세우면
 * `designQa` 의 `LEAF`·`footerGap` 등록, SVG 글자 넘침 책임, 여백 규격을 **처음부터 다시**
 * 지어야 하고(CARD_CHECKLIST §2 「새 판형을 만들 때」), 무엇보다 **네 번째 사본**이 된다
 * (2026-09-02 인수인계 ⑫ — 「이 세트를 만드는 빌더는 무엇인가」의 답은 정본 하나뿐이어야 한다).
 *
 * ── 데이터
 * `data/datasets/gap-ep{n}.json`(묶음 목록)과 `data/datasets/molit-monthly/`(곡선)만 읽는다.
 * **국토부를 부르지 않는다.** 캐시에 없는 달이 곡선 구간 안에 있으면 **그리지 않고 던진다** —
 * 「거래가 없던 달」과 「안 받아 온 달」이 같은 얼굴이 되면 그건 오보다.
 *
 * ── ⚠️ 평형을 반드시 적는다
 * 이 카드는 평형을 섞어 묶는다(오너 2026-09-02). 그래서 「같은 집끼리의 비교」가 아니라
 * **「그때 같은 돈이면 살 수 있던 집들」**이다. 범례에 평형이 빠지면 그 순간 오보가 된다 —
 * 이 빌더는 평형이 없으면 던진다. 정본은 `docs/GAP_CARDS.md`.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => join(ROOT, p);
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

const SET = arg("set", "gap-ep1");
const PICK = Number(arg("pick", 1)) - 1;
const CURVE_FROM = arg("from", "202001");
const CURVE_TO = arg("to", "202607");
const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const DATE = arg("date", kstToday);

/**
 * 시리즈명 (오너 2026-09-02 확정) — 상단 회색 줄에 **이것과 번호만** 나간다.
 *
 * 왜 이 이름인가: 전제(「같은 값에서 출발했다」)가 이름 안에 다 들어가 첫 장이 그것을
 * 또 설명하지 않아도 된다. 그리고 **카드가 재지 않은 것을 약속하지 않는다** —
 * 후보였던 「입지의 중요성」·「가격 차이가 나는 이유」는 값이 왜 갈렸는지를 약속하는데,
 * 이 카드가 재는 것은 **갈렸다는 사실**뿐이라 그 이름은 지킬 수 없는 약속이 된다.
 *
 * ⚠️ 시리즈명에 숫자를 넣지 않는다. 기준창을 2021-10 으로 바꾼 편이 나오는 순간
 *    「벌어진 6년」 같은 이름은 그날로 틀린 말이 된다.
 */
const SERIES = "출발선은 같았다";
/** 연재 번호 — 편이 갈려도 **계정 전체에서 하나로** 이어간다(기본은 묶음 순번). */
const NO = Number(arg("no", PICK + 1));
/* 표기는 `#1` (오너 2026-09-02). 원문자(①)는 20까지밖에 없어 41장짜리 연재에 안 맞는다. */
const numeral = (n) => `#${n}`;

/* BRAND — 레드 = 가장 많이 오른 쪽, 코발트 = 가장 덜 오른 쪽, 슬레이트 = 가운데.
   색이 방향(오름/내림)이 아니라 **순위**를 말한다. 곡선 셋이 부채로 벌어지는 그림이라
   양 끝에 두 강조색을 두고 가운데는 무채색으로 물러난다. */
/* ── 두 벌의 판면 (오너 2026-09-02: 다크·연회색 두 안을 놓고 고른다)
   `--theme dark`(기본) / `--theme light`. BRAND 가 「다크 카드 변형(잉크네이비 배경 +
   웜화이트 텍스트)은 허용하되 **시리즈 단위로 통일**」이라 했으므로, 한 시리즈 안에서
   섞어 쓰지 않는다 — 고른 쪽 하나로 41장을 간다.

   ⚠️ 가운데 계열만 테마를 탄다. 블루그레이(#5B6B7F)는 잉크 위에서 거의 사라지고,
   웜화이트는 연회색 위에서 사라진다. **레드·코발트는 양쪽 다 토큰 그대로** 쓴다
   (BRAND: 비슷한 빨강·파랑을 새로 만들지 않는다). */
const RED = "#e5484d", COBALT = "#2e6bff";
const INK = "#141821", PAPER = "#fafaf8";
/* ⚠️ **연회색이 기본이다** — 오너가 2026-09-02 에 두 안을 나란히 보고 B안(연회색)으로 확정했다.
   BRAND: 「다크 변형은 허용하되 **시리즈 단위로 통일**」 — 이 시리즈 41장은 전부 연회색이다.
   `--theme dark` 는 남겨 두지만 **이 시리즈에서는 쓰지 않는다**(다른 시리즈가 쓸 수 있게 둔다). */
const THEME = arg("theme", "light") === "dark" ? "dark" : "light";
const T = THEME === "dark"
  ? { panel: INK, text: PAPER, mid: PAPER, mute: "#9aa3af",
      grid: "rgba(255,255,255,0.10)", wm: "#ffffff", wmOp: 0.13,
      halo: "#ffffff", haloOp: 0.16, glowOp: 0.26, glowBlur: 9 }
  : { panel: "#edeff2", text: INK, mid: "#5b6b7f", mute: "#7c8794",
      grid: "rgba(20,24,33,0.09)", wm: INK, wmOp: 0.09,
      halo: INK, haloOp: 0.10, glowOp: 0.20, glowBlur: 8 };
const MUTE = T.mute;
const SERIES_COLORS = [RED, T.mid, COBALT];
const SLATE = T.mid;

const r1 = (v) => Math.round(v * 10) / 10;
const eok = (m) => m / 10000;
const fmtEok = (m) => `${eok(m).toFixed(1)}억`;
/** 배수 표기 — 오너가 범례 문안으로 「(2.52배)」를 적어 줬다(2026-09-02).
   곡선 끝의 회색 배수를 지우면서 배수를 말하는 자리가 **범례 하나**로 줄었으므로,
   한 카드 안에서 자릿수가 갈릴 일은 없다. */
const fmtX = (r) => `${r.toFixed(2)}배`;

function monthRange(from, to) {
  const out = [];
  let y = +from.slice(0, 4), m = +from.slice(4);
  const ey = +to.slice(0, 4), em = +to.slice(4);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}${String(m).padStart(2, "0")}`);
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}

/** 그 칸의 월별 최고가 계열. 캐시에 **없는 달이 하나라도 있으면 던진다.** */
function series(unit, months) {
  const pts = [];
  const holes = [];
  for (const ym of months) {
    const p = R(`data/datasets/molit-monthly/${unit.lawd}/${ym}.json`);
    if (!existsSync(p)) { holes.push(ym); continue; }
    const cell = JSON.parse(readFileSync(p, "utf8"));
    if (cell.scope !== "universe") { holes.push(ym); continue; }
    const row = (cell.rows ?? []).find((r) => r.umd === unit.umd && r.apt === unit.apt && r.type === unit.type);
    if (row) pts.push({ ym, v: row.max });
  }
  if (holes.length) {
    throw new Error(
      `${unit.gu} ${unit.apt} — 곡선 구간에 캐시가 없는 달 ${holes.length}개 (${holes[0]}~${holes[holes.length - 1]}).\n` +
        `   거래가 없던 달과 안 받아 온 달을 같게 그릴 수 없습니다. 먼저 채우세요:\n` +
        `   data/month-backfill-queue.txt →  lawd=${unit.lawd} from=${holes[0]} to=${holes[holes.length - 1]} budget=400`,
    );
  }
  if (pts.length < 12) throw new Error(`${unit.gu} ${unit.apt} — 거래가 있던 달이 ${pts.length}개뿐입니다(12개 미만이면 곡선이 아니라 점입니다)`);
  return pts;
}

const setPath = R(`data/datasets/${SET}.json`);
if (!existsSync(setPath)) throw new Error(`${SET}.json 이 없습니다 — 먼저 node scripts/find-gap-pairs.mjs --out ${SET}`);
const data = JSON.parse(readFileSync(setPath, "utf8"));
const group = data.picks[PICK];
if (!group) throw new Error(`${SET} 에 ${PICK + 1}번 묶음이 없습니다 (${data.picks.length}개 있음)`);

const months = monthRange(CURVE_FROM, CURVE_TO);
const members = group.members.map((m, i) => {
  if (!m.pyeong) throw new Error(`${m.apt} 에 평형이 없습니다 — 평형을 섞는 카드라 평형 없이는 만들지 않습니다`);
  return { ...m, color: SERIES_COLORS[i === group.members.length - 1 ? 2 : i], pts: series(m, months) };
});

/* ── 좌표
   ⚠️ 범례가 세 줄이라 streak-line 의 두 줄 자를 그대로 쓰면 안 된다(2026-09-02 실측).
   한 줄이 이름(40px)+지역(31px) 두 층이라 92px 를 먹는다 — 68px 로 뒀더니 아랫줄 이름이
   윗줄 지역 위에 얹혔다. 범례가 끝나는 자리(y≈340) 아래에서 그래프를 시작한다.

   그리고 **끝값 라벨은 판 밖 오른쪽 여백에 세운다.** 곡선 위에 얹으면 마지막 급등 구간과
   겹친다(첫 렌더에서 12.5억·8.0억이 회색·파랑 곡선을 가로질렀다). 판을 800 에서 끊고
   남는 200px 를 라벨 자리로 준다 — 세로로만 서로 밀면 되므로 겹침 계산이 단순해진다. */
/* 하단 마무리 문구를 뺐다(오너 2026-09-02) → 그 높이를 **그래프가 가져간다**.
   범례가 한 줄씩으로 줄어(세 줄 × 92px → 세 줄 × 62px) 위쪽도 함께 벌었다. */
/* ⚠️ VB_H 는 **검수가 정한 값**이다. 960 으로 키웠더니 푸터가 카드 아래로 30px 넘쳤다
   (`designQa` overflow). 920 이 이 판형에서 넘치지 않는 최대치다 — 임의로 올리지 않는다. */
/* ⚠️ 여백은 **판 안쪽**에서 준다(오너 2026-09-02 「우측·하단 여백이 너무 없다」).
   패널을 카드 폭 끝까지 붙이지 않고 좌우 18 씩 물리고, 끝값 라벨이 패널 오른쪽 안에
   들어오도록 판을 776 에서 끊는다. 아래로도 가로축 라벨 밑에 숨 쉴 자리를 남긴다.
   VB_H 는 검수가 정한다 — 960 은 푸터를 카드 밖으로 30px 밀었다(designQa overflow). */
const VB_H = 900, AXIS_X = 132, RIGHT = 776, TOP = 250, BASE = 796;
const PANEL = { x: 18, y: 14, w: 964, h: 858, r: 36 };
const allV = members.flatMap((m) => m.pts.map((p) => p.v));
const vmaxRaw = Math.max(...allV), vminRaw = Math.min(...allV);
/* 축 눈금은 억 단위로 떨어지게 — 5억 이상 폭이면 5억, 아니면 2억 간격 */
const step = (eok(vmaxRaw) - eok(vminRaw)) > 14 ? 100000 : 50000;
const YMAX = Math.ceil(vmaxRaw / step) * step;
const YMIN = Math.floor(vminRaw / step) * step;
const xi = (ym) => r1(AXIS_X + (months.indexOf(ym) / (months.length - 1)) * (RIGHT - AXIS_X));
const yv = (v) => r1(BASE - ((v - YMIN) / (YMAX - YMIN)) * (BASE - TOP));

const ticks = [];
for (let v = YMIN; v <= YMAX + 1; v += step) ticks.push(v);
/* 격자 기본값은 잉크 6% 라 다크 패널에서 안 보인다 → 흰색 10% 로 덮는다 */
/* ⚠️ **맨 위 눈금선은 안 그린다.** 그 선이 「20」과 「(억)」을 가로지른다(2026-09-02 실측,
   연회색 안에서 특히 두드러졌다). 위아래 끝선이 없어도 눈금 숫자가 높이를 말한다. */
const grid = ticks.filter((v) => v > YMIN && v < YMAX).map((v) => ({ x1: AXIS_X, x2: RIGHT, y: yv(v), stroke: T.grid }));
/* 축 숫자는 작게(오너 2026-09-02) — 판형 기본 32px 는 곡선보다 눈에 먼저 들어왔다.
   `size` 는 이 판형에 새로 연 선택 키라 안 주는 카드는 32px 그대로다. */
const ylabels = ticks.map((v) => ({ x: AXIS_X - 14, y: yv(v) + 7, text: `${eok(v).toFixed(0)}`, size: 24 }));
/* 단위는 맨 위 눈금과 **같은 줄, 축 오른쪽**에 둔다. 세 번 옮긴 끝의 자리다:
   판 안 아래쪽은 「7.0억」과 붙었고, 눈금 위는 「20」과 붙었고, 더 올리면 범례에 닿는다.
   맨 위 눈금 오른쪽은 곡선이 닿지 않는 데다 「20」과 나란히 읽혀 뜻도 맞다. */
const yunit = { x: AXIS_X + 46, y: TOP + 7, text: "(억)", fill: MUTE };

const polylines = members.map((m) => ({
  points: m.pts.map((p) => `${xi(p.ym)},${yv(p.v)}`).join(" "),
  color: m.color,
  width: m.color === SLATE ? 6 : 8,
}));
/* 빛나는 효과(오너 2026-09-02) — 같은 선을 **두껍게·흐리게** 한 벌 더 깔고 그 위에 본선을 얹는다.
   SVG 필터(feGaussianBlur) 한 개만 쓴다. 값이 아니라 **선의 존재감**을 키우는 장치라
   숫자를 바꾸지 않는다 — 곡선 좌표는 그대로다. */
const glowlines = polylines.map((l) => ({ ...l, width: l.width + 16, opacity: T.glowOp }));

/* 끝점 — 지금 값. 라벨은 곡선 위에 올린다(겹치면 아래 §라벨 밀기가 민다). */
const ends = members.map((m) => {
  const last = m.pts[m.pts.length - 1];
  return { m, x: xi(last.ym), y: yv(last.v), v: last.v };
});
const dots = ends.map((e) => ({ x: e.x, y: e.y, r: e.m.color === SLATE ? 13 : 15, color: e.m.color }));

/* ⚠️ 끝값 라벨은 **판 밖 오른쪽 여백**에 세로로 세운다. 곡선 위에 얹으면 마지막 급등
   구간과 겹친다(2026-09-02 첫 렌더에서 실제로 겹쳤다). 서로 겹치는 것은 **코드가 막는다** —
   손으로 자리를 정하면 사람이 놓친 겹침이 그대로 나간다(09-01 학군지 사고). */
/* 한 줄로 돌아왔으므로 최소 간격도 줄인다 */
const LABEL_GAP = 68;
const sorted = [...ends].sort((a, b) => a.y - b.y);
let prevY = -Infinity;
for (const e of sorted) {
  let ly = e.y + 14;                                    // 점 높이에 맞춘다(윗줄 기준)
  if (ly - prevY < LABEL_GAP) ly = prevY + LABEL_GAP;
  e.ly = ly;
  prevY = ly;
}
/* ⚠️ 배수는 **범례로 옮겼다**(오너 2026-09-02). 곡선 끝에는 값 하나만 둔다 —
   같은 숫자를 두 곳에서 말하면 어느 쪽이 주인공인지 흐려진다. */
/* 가격 폰트를 판형 기본 54 에서 46 으로 줄였다 — 오른쪽 여백을 만드는 가장 확실한 손잡이다 */
const vlabels = ends.map((e) => ({ x: RIGHT + 20, y: e.ly, text: fmtEok(e.v), fill: e.m.color, anchor: "start", size: 46 }));

const xlabels = [
  { x: AXIS_X, y: BASE + 44, text: `${CURVE_FROM.slice(0, 4)}.${+CURVE_FROM.slice(4)}`, fill: MUTE, anchor: "start", size: 24 },
  { x: r1((AXIS_X + RIGHT) / 2), y: BASE + 44, text: "2023.1", fill: MUTE, anchor: "middle", size: 24 },
  { x: RIGHT, y: BASE + 44, text: `${CURVE_TO.slice(0, 4)}.${+CURVE_TO.slice(4)}`, fill: MUTE, anchor: "end", size: 24 },
];

/* 출발점 세로선은 두지 않는다 — 곡선 셋이 모두 좌축에서 시작하므로 축선과 겹쳐 아무 말도 안 한다 */
const vmarks = [];

/* 세 곡선이 붙어 있던 자리에 **반투명 원**을 얹는다(오너 2026-09-02).
   이 카드의 축은 「여기서 같이 출발했다」이고, 그 사실은 그림에서 한 점으로 보여야 한다.
   원의 자리·크기는 실제 시작값 셋의 위·아래 끝에서 잰다 — 손으로 찍지 않는다. */
const startYs = members.map((m) => yv(m.pts[0].v));
const startX = xi(months[0]);
const startR = Math.max(34, r1((Math.max(...startYs) - Math.min(...startYs)) / 2 + 26));
const startCy = r1((Math.max(...startYs) + Math.min(...startYs)) / 2);
const halos = [{ x: startX, y: startCy, r: startR, fill: T.halo, opacity: T.haloOp }];

/* 출발점 값 — 원 바로 위. 이 카드에서 가장 먼저 읽혀야 하는 숫자라 크게 두되
   곡선보다는 물러나게 잉크로 둔다(레드는 「가장 많이 오른 쪽」의 자리다). */
/* 출발점 값 라벨 — **곡선 위로 올리고 원과 점선으로 잇는다**(오너 2026-09-02).
   자리를 세 번 옮겨 본 끝의 답이다: 원 위 가운데정렬은 축 왼쪽으로 넘어가 눈금 「10」과
   겹쳤고, 원 위 왼쪽정렬은 2020년 상반기 상승 곡선을 가로질렀고, 원 옆은 그림이 답답했다.
   **위로 충분히 올리면** 그 높이(첫 달 x 자리)에는 아무 곡선도 없다 — 곡선은 오른쪽으로만
   간다. 대신 값과 원이 멀어지므로 점선이 그 둘을 묶는다. */
const startLabelY = r1(TOP + 150);   // 오너 2026-09-02: 조금 더 내린다
vlabels.push({
  x: r1(startX + 10), y: startLabelY,
  text: fmtEok(members[0].base), fill: T.text, anchor: "start", size: 44,
});
vmarks.push({ x: startX, y1: r1(startLabelY + 16), y2: r1(startCy - startR - 4), color: T.text });

/* 범례 — 단지명 + **평형**(필수) · 옆에 배수.
   ⚠️ 이름의 괄호 별칭은 뗀다 — 「길음뉴타운1단지(래미안길음1차)」는 판 폭을 넘어
   다음 줄을 밀어낸다. 지역이 sub 에 있으므로 어느 단지인지는 흐려지지 않는다. */
const shortName = (s) => s.replace(/\s*\([^)]*\)\s*$/, "").trim() || s;
/* ⚠️ 지역은 **이름 앞에 짧게** 붙인다 — 「성남시분당구」가 아니라 「분당」.
   한 줄에 다 넣기로 했으므로(오너 2026-09-02) 행정구역 정식명칭을 그대로 쓰면 줄이 넘친다.
   어느 동인지는 캡션이 말한다. 짧은 이름표는 **읽는 사람이 실제로 쓰는 말**이기도 하다. */
const SHORT_GU = { 성남시분당구: "분당", 성남시중원구: "성남 중원", 성남시수정구: "성남 수정",
  안산시상록구: "안산", 안산시단원구: "안산", 안양시동안구: "평촌", 안양시만안구: "안양",
  고양시일산동구: "일산", 고양시일산서구: "일산", 고양시덕양구: "덕양",
  수원시영통구: "수원 영통", 수원시장안구: "수원 장안", 수원시권선구: "수원 권선", 수원시팔달구: "수원 팔달",
  용인시수지구: "수지", 용인시기흥구: "기흥", 용인시처인구: "처인",
  화성시동탄구: "동탄", 화성시병점구: "병점", 화성시만세구: "화성", 화성시효행구: "화성",
  부천시원미구: "부천", 부천시소사구: "부천", 부천시오정구: "부천" };
const shortGu = (g) => SHORT_GU[g] ?? g.replace(/시$/, "");
const legend = members.map((m, i) => ({
  inline: true,
  sx1: 118, sx2: 190, sy: 72 + i * 62,
  color: m.color,
  tx: 208, ty: 84 + i * 62,
  text: `${shortGu(m.gu)} ${shortName(m.apt)} ${m.pyeong}`,
  fill: T.text, size: 38,
  /* 배수를 이름 옆에 **같은 크기·회색**으로(오너 2026-09-02). 「그때 → 지금」 두 값은
     곡선 양 끝이 이미 말하므로 여기서 되풀이하지 않는다. */
  sub: `(${fmtX(m.ratio)})`,
  subDx: 18, subSize: 38, subFill: MUTE,
}));

const hi = members[0], lo = members[members.length - 1];
const baseLabel = fmtEok(Math.round((group.baseFrom + group.baseTo) / 2));

const card = {
  template: "streak-line@1",
  date: DATE,
  /* 상단은 **시리즈명과 번호만**(오너 2026-09-02). 측정 정의는 푸터로 내렸다 */
  badge: `${SERIES} ${numeral(NO)}`,
  badgeInk: true,
  /* 두 줄 제목 (오너 2026-09-02 문안 지정):
     윗줄은 **회색으로 물리고**(전제) 아랫줄을 잉크로 세운다(결과). 강조는 두 줄 다 레드 숫자. */
  title:
    `<span class="tl tg">2020년 초, 똑같은 <span class="ti">${baseLabel}</span>에서</span>` +
    `<span class="tl">지금은 무려 <span class="hi">${group.gapEok.toFixed(1)}억</span> 격차</span>`,
  chart: {
    vb: `0 0 1000 ${VB_H}`,
    base: { y: BASE, x1: AXIS_X, x2: RIGHT },
    /* 판 안 워터마크 — BRAND §4b 슬롯 C. 곡선이 지나지 않는 왼쪽 가운데에 옅게 */
    /* 다크 배경의 워터마크는 **흰색 opacity .26** — BRAND §슬롯 규격. 크기는 오너 지시로 키웠다. */
    wm: { x: AXIS_X + 70, y: TOP + 250, size: 50, text: "@wirit_note", fill: T.wm, opacity: T.wmOp, anchor: "start" },
    /* 다크 패널 — 범례부터 가로축까지 한 덩어리로 감싼다(오너 2026-09-02).
       BRAND 가 허용한 「잉크네이비 배경 + 웜화이트 텍스트」 변형이고, **시리즈 단위로 통일**한다. */
    panel: { ...PANEL, fill: T.panel },
    glow: T.glowBlur,
    grid, ylabels, yunit, vmarks, halos, glowlines, polylines, dots, vlabels, xlabels, legend,
  },
  /* 하단 마무리 문구는 두지 않는다(오너 2026-09-02) — 그 높이를 그래프가 가져갔다.
     ⚠️ 평형을 섞었다는 사실은 **범례의 평형 표기**와 **캡션**이 계속 말한다. */
  /* 측정 정의(월별 최고가)가 여기 산다 — 상단은 시리즈명과 번호만 두기로 했다(오너 09-02).
     ⚠️ **기간은 안 적는다.** 기간·정의를 둘 다 넣으면 푸터가 두 줄로 넘쳐 워터마크를 민다
     (09-02 실측). 기간은 이미 가로축이 양 끝에 적고 있다 — 같은 말을 두 번 하지 않는다. */
  /* ⚠️ 기간은 **실제 곡선 구간**을 그대로 적는다. 오너는 2026.8 로 적어 달라고 했지만
     캐시에 든 마지막 달은 2026.7 이다 — 카드에 적힌 기간이 그린 기간과 다르면 그게 오보다.
     2026.8 이 채워지면 `--to 202608` 로 다시 그리면 이 줄도 함께 바뀐다(코드가 쓴다). */
  source: {
    /* ⚠️ 푸터는 **한 줄**이어야 한다 — 넘치면 두 줄이 되어 워터마크를 민다(09-02 실측).
       기간까지 넣으라는 지시를 지키려고 이름에서 「아파트」를 뺐다. 정확한 출처 전체 이름은
       캡션의 ※ 줄이 적는다(「국토교통부 아파트 매매 실거래가」). */
    name: "국토교통부 실거래가",
    asOf: `${CURVE_FROM.slice(0, 4)}.${+CURVE_FROM.slice(4)}~${CURVE_TO.slice(0, 4)}.${+CURVE_TO.slice(4)} 월별 최고가`,
  },
  meta: {
    set: SET, pick: PICK + 1,
    /* 캡션 쓰는 사람이 다시 찾지 않게 남긴다 — 신고가 카드의 meta.region 과 같은 취지 */
    members: members.map((m) => ({ gu: m.gu, umd: m.umd, apt: m.apt, pyeong: m.pyeong, hhld: m.hhld, base: m.base, now: m.now, ratio: +m.ratio.toFixed(3), ratioLabel: fmtX(m.ratio) })),
    gapEok: group.gapEok, typeMix: group.typeMix,
  },
};

/* 라벨에 테마를 붙이지 않는다 — 연회색이 기본이 됐으므로 `gap-ep1-1` 이 곧 확정본이다.
   두 안을 나란히 볼 때만 `--label ...-dark` 처럼 손으로 갈라 부른다. */
const label = arg("label", `${SET}-${PICK + 1}`);
const outDir = R(join("data/content", DATE));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${label}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`⚖️ ${label} — ${SET} ${PICK + 1}번 묶음 · 곡선 ${members.length}개 (${months.length}개월)`);
members.forEach((m) => console.log(`   ${m.color === RED ? "🔺" : m.color === COBALT ? "🔻" : "· "} ${m.gu} ${m.apt} ${m.pyeong} — ${fmtEok(m.base)} → ${fmtEok(m.now)} (${m.ratio.toFixed(2)}배) · 관측 ${m.pts.length}개월`));
console.log(`   → ${join("data/content", DATE, `${label}.json`)}`);
