/**
 * 서울 25개 자치구 월세·전세 상승률 순위 — **카드용 확정 수치**.
 *
 * ── 왜 이 스크립트가 있나 (2026-07-30)
 * 자치구 순위는 우리만 만들 수 있는 카드다(스레드는 25행 표를 못 쓴다).
 * 그런데 손으로 계산하면 다음 세션에 사라지고, 카드 만들 때 또 계산한다.
 * 두 번 계산하면 두 값이 생기고, 어느 쪽이 맞는지 모르게 된다. 그래서 코드로 고정한다.
 *
 * ── 여기서 한 번 크게 틀렸다 (기록해 둔다)
 * 처음엔 "코드가 530 으로 시작하면 서울 자치구"라고 잘랐다. 그러자 R-ONE 530 대역에
 * 함께 들어 있는 **경기 시·구 24곳이 섞여** 1위가 영통구(수원)로 나왔다.
 * 지금은 meta.groups.seoulGu(25곳 명단)에서만 가져온다. 접두사로 자르지 않는다.
 *
 * ── 기준 시점을 왜 2020-07 로 잡나
 * 임대차 2법 시행월(2020-07-31)이 유일하게 **날짜가 확인된** 분기점이다.
 * 다른 제도(전세대출 규제 등)는 시행일이 아직 확인되지 않았다(research/policy-timeline.json).
 * 확인 안 된 날짜를 기준선으로 쓰면 카드 전체가 흔들린다.
 * ⚠️ 이 기준은 "그 법 때문"이라는 뜻이 아니다. **그 시점 전후로 숫자가 이렇다**는 뜻이다.
 *
 * 실행: node scripts/gu-rent-rank.mjs
 * 출력: data/review/gu-rent-rank.md
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-rent-index.json"), "utf8"));

const BASE = "2020-07"; // 임대차 2법 시행월
const SEOUL = "500008";
const asOf = doc.meta?.asOf;
if (!asOf) throw new Error("meta.asOf 가 없다 — 데이터셋이 온전하지 않다");

/* 명단은 데이터에서 가져온다. 여기서 다시 만들면 또 경기가 섞인다. */
const GU = doc.meta?.groups?.seoulGu;
if (!Array.isArray(GU) || GU.length !== 25) {
  throw new Error(
    `meta.groups.seoulGu 가 25곳이 아니다(${GU?.length ?? "없음"}). ` +
      `수집기를 다시 돌려 명단을 채우세요 — 코드 접두사로 자르면 경기가 섞입니다.`,
  );
}

const nm = (c) => doc.regionNames?.[c] || c;
const at = (s, ym) => (s && Number.isFinite(s[ym]) ? s[ym] : null);
const pct = (a, b) => (a == null || b == null ? null : ((b - a) / a) * 100);
const f1 = (v) => (v == null ? "—" : (v > 0 ? "+" : "") + v.toFixed(1) + "%");

const yearAgo = `${Number(asOf.slice(0, 4)) - 1}-${asOf.slice(5)}`;

const rows = GU.map((c) => {
  const w = doc.wolse?.[c];
  const j = doc.jeonse?.[c];
  const r = {
    code: c,
    name: nm(c),
    wolse: pct(at(w, BASE), at(w, asOf)),
    jeonse: pct(at(j, BASE), at(j, asOf)),
    wolseY1: pct(at(w, yearAgo), at(w, asOf)),
  };
  r.gap = r.wolse == null || r.jeonse == null ? null : r.wolse - r.jeonse;
  return r;
});

/* 값이 빈 자치구가 있으면 순위가 조용히 달라진다 — 세워 두고 알린다 */
const holes = rows.filter((r) => r.wolse == null || r.jeonse == null);

const md = [];
const p = (l = "") => {
  console.log(l);
  md.push(l);
};

p(`# 서울 25개 자치구 전·월세 상승률 (${BASE} → ${asOf})`);
p();
p(`- 출처: ${doc.meta?.source} · ${doc.meta?.tables?.wolse?.name} / ${doc.meta?.tables?.jeonse?.name}`);
p(`- 기준월: **${BASE}** (임대차 2법 시행월) → **${asOf}** (최신 공표월)`);
p(`- ⚠️ 기준월은 인과가 아니다. "그 법 때문"이 아니라 **"그 시점 전후로 이렇다"**는 뜻이다.`);
p(`- ⚠️ 지수는 2026-01 = 100 으로 기준이 개편돼 있다. 비율 비교는 유효하다(같은 계열 안이므로).`);
if (holes.length) p(`- ⚠️ 값이 빈 자치구: ${holes.map((h) => h.name).join(", ")} — 카드에 쓰기 전에 확인`);
p();

const seoulW = pct(at(doc.wolse?.[SEOUL], BASE), at(doc.wolse?.[SEOUL], asOf));
const seoulJ = pct(at(doc.jeonse?.[SEOUL], BASE), at(doc.jeonse?.[SEOUL], asOf));
p(`**서울 전체: 월세 ${f1(seoulW)} · 전세 ${f1(seoulJ)}**`);
p();

const table = (key, title, extra) => {
  const s = [...rows].filter((r) => r[key] != null).sort((a, b) => b[key] - a[key]);
  p(`## ${title}`);
  p();
  p(`| 순위 | 자치구 | ${extra.head} |`);
  p(`|---:|---|${extra.align}|`);
  s.forEach((r, i) => p(`| ${i + 1} | ${r.name} | ${extra.cell(r)} |`));
  p();
  return s;
};

const byWolse = table("wolse", `월세 상승률 순위 (${BASE} → ${asOf})`, {
  head: "월세 | 전세 | 격차",
  align: "---:|---:|---:",
  cell: (r) => `**${f1(r.wolse)}** | ${f1(r.jeonse)} | ${f1(r.gap)}`,
});

const byGap = table("gap", `월세 − 전세 격차 순위 — "전세는 그대로인데 월세만"이 가장 심한 곳`, {
  head: "월세 | 전세 | 격차",
  align: "---:|---:|---:",
  cell: (r) => `${f1(r.wolse)} | ${f1(r.jeonse)} | **${f1(r.gap)}**`,
});

table("wolseY1", `최근 1년 월세 상승률 (${yearAgo} → ${asOf})`, {
  head: "1년 상승률",
  align: "---:",
  cell: (r) => `**${f1(r.wolseY1)}**`,
});

p(`## 카드에 쓸 문장 (검증된 것만)`);
p();
const top = byWolse[0];
const bot = byWolse[byWolse.length - 1];
p(`- 월세가 가장 많이 오른 곳: **${top.name} ${f1(top.wolse)}** / 가장 적게: **${bot.name} ${f1(bot.wolse)}**`);
p(`- 25곳 중 월세가 내린 곳: **${rows.filter((r) => r.wolse != null && r.wolse < 0).length}곳**`);
p(`- 25곳 중 전세가 내린 곳: **${rows.filter((r) => r.jeonse != null && r.jeonse < 0).length}곳** ` +
  `(${rows.filter((r) => r.jeonse != null && r.jeonse < 0).map((r) => r.name).join(", ") || "없음"})`);
p(`- 월세 상승률이 전세보다 높은 곳: **${rows.filter((r) => r.gap != null && r.gap > 0).length}곳 / 25곳**`);
p(`- 격차가 가장 큰 곳: **${byGap[0].name}** — 월세 ${f1(byGap[0].wolse)} vs 전세 ${f1(byGap[0].jeonse)}`);
p();
p(`> 쓰지 말 것: "월세만 올랐다" — 25곳 중 전세도 오른 곳이 많다.`);
p(`> 쓸 것: "월세가 **더 빠르게**", "전세는 제자리인데 월세는" (해당 자치구에 한해)`);

mkdirSync(join(ROOT, "data/review"), { recursive: true });
writeFileSync(join(ROOT, "data/review/gu-rent-rank.md"), md.join("\n") + "\n", "utf8");
console.log(`\n🗂  data/review/gu-rent-rank.md`);
