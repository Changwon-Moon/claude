/**
 * 금주의 신고가 — 주간 콘텐츠 재료 만들기 (네트워크 불필요, 누적 로그만 읽는다).
 *
 * ── 왜 (2026-08-12 오너 "매주 발행 컨텐츠로 쓸거야. 금주의 신고가 컨텐츠로 가자")
 * 두 가지를 만든다:
 *   **컨셉 A — 금주의 돌파 단지**   10억·20억…100억 선을 이번 주에 넘은 단지를 한 장에.
 *   **컨셉 B — 개별 카드 후보**     오너가 몇 개 골라 각각 1장으로 만들 목록.
 *
 * ── 주간을 '계약일'로 자르지 않는 이유
 * 실거래 신고기한이 계약 후 30일이다. 계약일로 자르면 지난주 계약분이 아직 안 들어와
 * **주간이 텅 빈다.** 그래서 `foundOn`(우리가 확인한 날)으로 자른다 — 그주에 새로 드러난
 * 소식이 그주의 콘텐츠다. 계약일은 카드에 그대로 싣는다.
 *
 * ── 돌파는 일간이 이미 정확히 계산해 뒀다
 * 주간은 **다시 판정하지 않는다.** 일간이 판정 시점의 인덱스(=직전 최고가)로 계산한
 * `milestone` 을 그대로 모은다. 여기서 다시 재면 인덱스가 이미 갱신돼 있어 틀린다.
 *
 * 실행: node scripts/singo-weekly.mjs [--today 2026-08-14] [--days 7]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const today = arg("today") || new Date().toISOString().slice(0, 10);
const days = Number(arg("days") ?? 7);
const topB = Number(arg("top-b") ?? 15);

const D = join(ROOT, "data/datasets");
const eok = (manwon) => {
  const s = (manwon / 10000).toFixed(2).replace(/\.?0+$/, "");
  return `${s}억`;
};
const n = (v) => Number(v).toLocaleString("ko-KR");

/** today 에서 days 일 전까지(오늘 포함) 의 날짜 문자열 집합 */
const dayBack = (d, k) => {
  const t = Date.parse(`${d}T00:00:00Z`) - k * 86400000;
  return new Date(t).toISOString().slice(0, 10);
};
const from = dayBack(today, days - 1);

/* ── 누적 로그에서 창 안의 히트를 모은다 (월이 걸쳐도 되게 월별 파일을 전부 훑는다) */
const logDir = join(D, "singo-log");
const hits = [];
if (existsSync(logDir)) {
  for (const f of readdirSync(logDir)) {
    if (!f.endsWith(".json")) continue;
    const j = JSON.parse(readFileSync(join(logDir, f), "utf8"));
    for (const h of j.hits ?? []) {
      if (h.foundOn >= from && h.foundOn <= today) hits.push(h);
    }
  }
}
/* 같은 칸이 여러 날 잡혔으면 **가장 높은 값 한 건**만 남긴다 — 주간에 같은 단지가 두 번 뜨면
   "이번 주에 두 번 신고가"로 읽혀 사실과 어긋난다. */
const best = new Map();
for (const h of hits) {
  const k = `${h.lawdCd}|${h.umdNm}|${h.aptNm}|${h.type}`;
  const cur = best.get(k);
  if (!cur || h.priceManwon > cur.priceManwon) best.set(k, h);
}
const week = [...best.values()];

/** 컨셉 A — 돌파만. 선이 높은 순 → 같은 선이면 거래가 큰 순 */
const crossed = week
  .filter((h) => h.milestone)
  .sort((a, b) => b.milestone - a.milestone || b.priceManwon - a.priceManwon);

/** 컨셉 B — 개별 카드 후보. 돌파 먼저, 그다음 거래가 큰 순 */
const cand = [...week].sort(
  (a, b) => (a.milestone ? 0 : 1) - (b.milestone ? 0 : 1) || b.priceManwon - a.priceManwon,
);

/* ── 카드 빌더가 읽을 산출물 */
const out = {
  meta: {
    today,
    from,
    days,
    weekLabel: `${from} ~ ${today}`,
    note:
      "foundOn(확인한 날) 기준 주간. milestone 은 일간이 판정 시점의 직전 최고가로 계산한 값을 그대로 옮긴 것 — 여기서 다시 재지 않는다.",
    baselineLabel: "2020년 이후",
    types: ["전용 59타입 = 25평", "전용 84타입 = 34평"],
    minHhld: 1000,
    verified: true,
    source: "국토교통부 아파트 매매 실거래가 상세자료 · 공동주택 기본 정보(세대수)",
  },
  conceptA: { title: "금주의 돌파 단지", count: crossed.length, items: crossed },
  conceptB: { title: "개별 카드 후보", count: cand.length, items: cand },
};
mkdirSync(D, { recursive: true });
writeFileSync(join(D, "singo-weekly.json"), JSON.stringify(out, null, 2) + "\n");

/* ── 텔레그램 문구 */
const T = [];
T.push(`📅 금주의 신고가 (${from} ~ ${today})`);
T.push("");
if (crossed.length) {
  T.push(`🎉 돌파 ${crossed.length}건 — 컨셉A 카드 재료`);
  for (const h of crossed) T.push(`· ${h.aptNm} ${h.pyeong} ${eok(h.priceManwon)} → ${h.milestone}억 돌파`);
} else {
  T.push(`🎉 돌파 0건 — 이번 주는 10억 단위를 넘은 단지가 없습니다`);
}
T.push("");
if (cand.length) {
  T.push(`📋 개별 카드 후보 ${cand.length}건 중 상위 ${Math.min(topB, cand.length)} (돌파 먼저 · 그다음 거래가 순)`);
  for (const h of cand.slice(0, topB)) {
    T.push(`· ${h.gu} ${h.aptNm} ${h.pyeong} ${eok(h.priceManwon)}${h.milestone ? ` 🎉${h.milestone}억` : ""}`);
  }
  if (cand.length > topB) T.push(`… 외 ${cand.length - topB}건`);
  T.push("");
  T.push(`전체 목록은 저장소 docs/weekly/금주의신고가-${today}.md`);
} else {
  T.push(`📋 이번 주 신고가 0건 — data/singo-last.md 로 수집이 돌았는지 확인하세요`);
}
writeFileSync(join(ROOT, "data/singo-weekly-alert.txt"), T.join("\n") + "\n");

/* ── 오너가 고를 md */
const L = [];
L.push(`# 📅 금주의 신고가 — ${from} ~ ${today}`);
L.push("");
L.push(`> 1,000세대 이상 1,147개 단지 명부 안에서, 전용 59타입(25평)·84타입(34평) 중개거래 중`);
L.push(`> **2020년 이후 최고가를 새로 쓴 것**. 직거래·해제거래 제외.`);
L.push(`> 주간은 **확인한 날(foundOn) 기준**이다 — 실거래 신고기한이 30일이라 계약일로 자르면 주간이 빈다.`);
L.push("");
L.push(`| | |`);
L.push(`|---|---|`);
L.push(`| 기간 | ${from} ~ ${today} (${days}일) |`);
L.push(`| 신고가 | ${n(week.length)}건 |`);
L.push(`| **10억 단위 돌파** | **${n(crossed.length)}건** |`);
L.push("");
L.push("---");
L.push("");
L.push(`## 컨셉 A — 금주의 돌파 단지 (${n(crossed.length)}건)`);
L.push("");
if (crossed.length) {
  L.push("| 넘은 선 | 행정구 | 단지명 | 평수 | 실거래가 | 직전 최고가 | 거래일 | 세대수 |");
  L.push("|---:|---|---|---|---:|---:|---|---:|");
  for (const h of crossed) {
    L.push(
      `| **${h.milestone}억** | ${h.gu} | ${h.aptNm} | ${h.pyeong} | ${eok(h.priceManwon)} | ${eok(h.prevPeakManwon)} | ${h.date} | ${n(h.hhld)} |`,
    );
  }
} else {
  L.push("이번 주는 10억 단위를 넘은 단지가 없습니다.");
  L.push("");
  L.push("> 10억 돌파는 실측상 **주 1~2건**입니다(2026-07 기준). 빈 주가 생기는 것이 정상이고,");
  L.push("> 그런 주에는 아래 컨셉 B 후보에서 골라 개별 카드로 가거나 격주로 묶는 편이 낫습니다.");
}
L.push("");
L.push("---");
L.push("");
L.push(`## 컨셉 B — 개별 카드 후보 (${n(cand.length)}건 · 돌파 먼저, 그다음 거래가 큰 순)`);
L.push("");
L.push("여기서 몇 개 골라 주시면 각각 1장 카드로 만듭니다. 🎉 는 10억 단위 돌파 건입니다.");
L.push("");
if (cand.length) {
  L.push("| # | | 행정구 | 단지명 | 평수 | 실거래가 | 직전 최고가 | 갱신폭 | 거래일 | 세대수 |");
  L.push("|---:|---|---|---|---|---:|---:|---:|---|---:|");
  cand.forEach((h, i) => {
    L.push(
      `| ${i + 1} | ${h.milestone ? `🎉${h.milestone}억` : ""} | ${h.gu} | ${h.aptNm} | ${h.pyeong} | ${eok(h.priceManwon)} | ${eok(h.prevPeakManwon)} | +${(h.gainPct ?? 0).toFixed(1)}% | ${h.date} | ${n(h.hhld)} |`,
    );
  });
} else {
  L.push("이번 주 신고가가 0건입니다. `data/singo-last.md` 로 일간 수집이 돌았는지 확인하세요.");
}
L.push("");
L.push("---");
L.push("");
L.push("## 카드로 옮길 때");
L.push("");
L.push("- **실거래가는 원값을 쓴다.** 이 표는 억 단위 표기지만 원값(만원)은");
L.push("  `data/datasets/singo-weekly.json` 에 `priceManwon` 으로 있다.");
L.push("- **'00평'은 관용 환산값**이다(실거래엔 전용면적만 있다). 단지에 따라 ±1평 어긋난다 —");
L.push("  전용면적 원값은 같은 파일의 `area` 에 있다.");
L.push('- **"2020년 이후" 최고가**다. 2006~2019 기록은 보지 않으므로 카드에 "역대"라고 쓰지 않는다.');
L.push("- **거래일은 계약일**이다(신고일 아님).");
L.push("");
L.push(`이 문서는 \`node scripts/singo-weekly.mjs --today ${today}\` 로 다시 만든다.`);
L.push("");

const mdPath = join(ROOT, `docs/weekly/금주의신고가-${today}.md`);
mkdirSync(dirname(mdPath), { recursive: true });
writeFileSync(mdPath, L.join("\n"));

console.log(
  `기간 ${from} ~ ${today}\n` +
    `신고가 ${week.length}건 · 돌파 ${crossed.length}건\n` +
    `→ ${mdPath}\n→ data/datasets/singo-weekly.json\n→ data/singo-weekly-alert.txt`,
);
