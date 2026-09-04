/**
 * 세계 주요국 월별 성적표 — world-monthly@1
 *
 *   node scripts/build-world-monthly.mjs [--year 2026] [--through 8] [--date 2026-09-04]
 *
 * ── 읽는 것 (전부 코드가 받아 둔 1차 자료)
 * · `data/datasets/world-market-{year}.json` — worldMarketCli 가 야후에서 받아 월말·등락률까지
 *   계산해 둔 캐시. **이 빌더는 새 수치를 만들지 않는다** — 고르고, 줄 세우고, 칠할 뿐이다.
 *
 * ── 이 파일이 지키는 것
 * ① **누적(YTD)을 데이터셋의 `ytdPct` 로 쓰지 않는다.** 그 값은 series 마지막 날 기준이라
 *    9월이 섞인다. 1~8월 카드의 누적은 **8월 말 종가 ÷ 전년 12월 말**로 여기서 다시 센다.
 *    표는 8월까지를 말하는데 마지막 칸만 9월을 품으면, 칸끼리 더해도 안 맞는다.
 * ② **자료가 없는 달은 '—' 다.** 0.0% 로 그리지 않는다 —
 *    이 카드에는 **진짜 0.0% 인 칸이 있다**(한국 6월: 8476.15 → 8476.48).
 *    빈 칸과 안 움직인 칸이 같은 얼굴이면 그게 오보다.
 * ③ **부호는 글자가 말한다.** 색은 거들 뿐이다(흑백 캡처·색맹·압축 어디서도 안 뒤집히게).
 * ④ **색은 토큰뿐이다.** 농도만 정하고, 섞는 것은 템플릿의 color-mix 가 한다.
 *    비슷한 빨강·파랑을 새로 만들지 않는다(BRAND · lint-accent).
 * ⑤ **달이 여덟 개 다 안 차면 던진다.** 조용히 일곱 칸짜리 표를 그리지 않는다.
 *
 * 기준 문서: docs/BRAND.md(색) · docs/CARD_CHECKLIST.md §2(표·제목) · docs/TEMPLATES.md
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(ROOT, p);
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

const YEAR = arg("year", "2026");
const THROUGH = Number(arg("through", "8")); // 몇 월까지 그릴지(칸 수는 8 고정)
const DATE = arg("date", new Date().toISOString().slice(0, 10));
const LABEL = "world-monthly";

const SRC = `data/datasets/world-market-${YEAR}.json`;
if (!existsSync(P(SRC))) {
  console.error(
    `❌ ${SRC} 가 없습니다.\n` +
      `   세션은 야후에 못 닿습니다(외부망 차단). data/world-market-queue.txt 에 한 줄 push 해\n` +
      `   world-market.yml 을 깨우고, 받아 온 뒤 다시 돌리세요.`,
  );
  process.exit(1);
}
const ds = JSON.parse(readFileSync(P(SRC), "utf8"));

/* ── 국기 — flag-icons 인라인 SVG 를 data URI 로 (런타임 외부 fetch 금지 = 결정성) ── */
const FLAGDIR = P("node_modules/.pnpm/flag-icons@7.5.0/node_modules/flag-icons/flags/4x3");
const flagUri = (code) => {
  const f = join(FLAGDIR, `${code}.svg`);
  if (!existsSync(f)) throw new Error(`국기 SVG 가 없습니다: ${code} (${f})`);
  const svg = readFileSync(f, "utf8").replace(/<\?xml[^>]*\?>/i, "").trim();
  return "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");
};

/* ── 표시 문자열 — 부호를 반드시 글자로 (위 ③) ──
   소수 한 자리로 통일한다(CARD_CHECKLIST 「한 카드 안에서 소수 자릿수를 통일」).
   음수 기호는 U+2212 다 — 하이픈(-)은 고정폭 숫자와 폭이 안 맞아 열이 흔들린다. */
const sign1 = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);

/* ── 히트맵 농도 ──
   |등락률| 20% 에서 가장 진하다. 그 위는 더 진해지지 않는다 — 한국 4월(+30.6)까지 눈금을
   늘리면 나머지 예순 칸이 전부 옅어져 "다 비슷하다"로 읽힌다. 상한을 두어 **대부분의 칸이
   서로 구별되게** 한다. 상한을 넘은 칸은 어차피 숫자가 두 자리라 눈에 먼저 든다. */
const CAP = 20;
const alphaOf = (v) => Math.round(8 + 62 * Math.min(1, Math.abs(v) / CAP)); // 8~70%
const cellOf = (pct) => {
  if (pct === null || pct === undefined) return { v: "—", cls: "na", a: 0 };
  const a = alphaOf(pct);
  return { v: sign1(pct), cls: pct >= 0 ? "up" : "down", a, ink: a >= 52 };
};

/* ── 나라별 행 만들기 ── */
const rows = [];
for (const key of ds.countries) {
  const c = ds.indices[key];
  if (!c) throw new Error(`데이터셋에 ${key} 가 없습니다`);

  const byMonth = new Map(c.monthly.map((m) => [m.m, m]));
  const cells = [];
  for (let mo = 1; mo <= 8; mo++) {
    const k = `${YEAR}-${String(mo).padStart(2, "0")}`;
    cells.push(cellOf(mo <= THROUGH ? byMonth.get(k)?.pct ?? null : null));
  }

  /* 누적은 여기서 다시 센다 (위 ①) — 마지막 달 종가 ÷ 전년 12월 말 */
  const lastK = `${YEAR}-${String(THROUGH).padStart(2, "0")}`;
  const last = byMonth.get(lastK);
  const base = c.prevYearEnd;
  if (!last) throw new Error(`${c.label}: ${lastK} 월말 값이 없습니다 — 표를 그릴 수 없습니다`);
  if (!base) throw new Error(`${c.label}: 전년 12월 말이 없어 누적을 셀 수 없습니다`);
  /* ⚠️ 두 값의 필드 이름이 다르다 — `monthly[]` 는 `close`, `prevYearEnd` 는 `c` 다
     (앞은 카드가 읽는 표, 뒤는 월말 계산기의 산출물이라 모양이 갈렸다).
     `last.c` 로 쓰면 undefined 라 NaN 이 되는데, NaN 은 조용히 "—" 처럼 보이지 않고
     그냥 이상한 숫자로 나간다 — 실제로 첫 실행에서 밟았다. */
  const ytdPct = Math.round(((last.close - base.c) / base.c) * 1000) / 10;

  rows.push({
    key,
    country: c.label,
    index: c.index,
    flag: flagUri(c.flag),
    cells,
    ytdNum: ytdPct,
    ytd: { ...cellOf(ytdPct), a: alphaOf(ytdPct), ink: alphaOf(ytdPct) >= 52 },
    asOf: last.asOf,
  });
}

/* 자료가 빈 칸이 하나라도 있으면 알린다 — 조용히 넘어가지 않는다(위 ⑤ · 「no silent caps」) */
const holes = rows.flatMap((r) =>
  r.cells.map((c, i) => (c.cls === "na" ? `${r.country} ${i + 1}월` : null)).filter(Boolean),
);
if (holes.length) console.warn(`⚠️ 자료가 없는 칸 ${holes.length}개 — ${holes.join(", ")}`);

/* ── 줄 세우기: 누적 큰 순. 표가 곧 순위표가 된다 ── */
rows.sort((a, b) => b.ytdNum - a.ytdNum);

const top = rows[0];
const second = rows[1];
const worst = rows[rows.length - 1];

/* 제목 — 수치는 **카드가 그린 값 그대로** 쓴다(사람이 옮겨 적지 않는다).
   오너 확정 문안(2026-09-04): 「26년 세계 증시 1등, <국기> +61.8%」
   나라는 **글자가 아니라 국기**다 — 이름을 읽는 것보다 깃발을 알아보는 게 빠르고,
   1등이 바뀌면 깃발만 바뀐다.

   BRAND: 제목 한 줄 안에서만 코발트+레드. 나라 자리가 국기로 바뀌면서 코발트 덩어리가
   없어졌고, 남은 강조는 **레드 하나 = 그 카드가 말하는 수치**뿐이다.

   ⚠️ 1위가 바뀔 수 있는 제목이다. 누적을 **8월 말 기준으로 다시 세자 1·2위가 뒤집혔다**
      (오늘까지로 재면 대만이 앞선다). 그래서 국기도 수치도 여기서 계산한다 —
      손으로 박아 두면 다음 달에 표와 제목이 갈린다.
   ⚠️ 나라 이름을 글자로 안 쓰니 조사(이/가) 문제도 같이 사라졌다.
      첫 판에서 「한국가 1등」이 나왔던 자리다. */
const title =
  `${YEAR.slice(2)}년 세계 증시 1등, ` +
  `<span class="flag"><img src="${top.flag}" alt="${top.country}" /></span> ` +
  `<span class="hi">${sign1(top.ytdNum)}%</span>`;

const asOf = rows.map((r) => r.asOf).sort().at(-1);
const doc = {
  template: "world-monthly@1",
  date: DATE,
  /* 최하단 문구를 뺐다(오너 2026-09-04). 그런데 「월말 종가로 잰다」는 **버릴 수 없는 정의**다 —
     같은 달을 일평균으로 재면 숫자가 통째로 달라진다. 그래서 상단 캡션이 받는다.
     카드에서 뺀 나머지(누적의 밑이 전년 12월 말이라는 것)는 캡션이 적는다
     — 「카드는 한 가지만 또렷하게 말하고 나머지는 캡션으로 내린다」(CARD_CHECKLIST §2). */
  subtitle: `각국 대표지수 · 현지통화 · 월말 종가 · ${YEAR}.01~${String(THROUGH).padStart(2, "0")}`,
  title,
  lead: "나라",
  cols: Array.from({ length: 8 }, (_, i) => `${i + 1}월`),
  ytdLabel: `1~${THROUGH}월 누적`,
  /* 순위는 여기서 매긴다 — 줄 세운 순서 그대로다(오너 2026-09-04 「나라 앞에 순위 열」).
     손으로 적지 않는다: 누적을 재는 기준이 바뀌면 순서가 바뀌고, 실제로 이 카드에서
     한 번 바뀌었다(오늘까지로 재면 대만이 1위, 8월 말로 재면 한국이 1위). */
  rows: rows.map(({ key, ytdNum, asOf, ...r }, i) => ({ rank: i + 1, top: i === 0, ...r })),
  source: { name: ds.meta.source, asOf: `${asOf} 기준` },
};

const outDir = P(`data/content/${DATE}`);
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${LABEL}.json`);
writeFileSync(out, JSON.stringify(doc, null, 2) + "\n");

console.log(`✅ ${LABEL} — ${rows.length}개국 × 8달 = ${rows.length * 8}칸`);
console.log(`   1위 ${top.country} ${sign1(top.ytdNum)}% · 꼴찌 ${worst.country} ${sign1(worst.ytdNum)}%`);
console.log(`   ${out}`);
