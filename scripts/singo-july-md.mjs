/**
 * 2026-07 신고가(2020년 이후 최고가 경신) 목록 → md.
 *
 * ── 어디서 뽑나
 * `data/datasets/molit-peak/*.json` 의 **최고가 기록 날짜**가 곧 그 칸이 마지막으로 경신된 날이다.
 * 날짜가 2026-07 인 칸 = 그달에 2020년 이후 최고가를 새로 쓴 것. 명부(1,000세대 이상)로 걸러
 * 남은 것이 이 목록이다. **수치는 전부 인덱스에서 코드가 읽는다.**
 *
 * ── ⚠️ 이 목록으로 '10억 돌파'를 세지 않는다
 * 인덱스는 최고가 한 줄만 남기고 **직전 기록은 안 남긴다**(저장소를 키우지 않으려고).
 * 그래서 뒤돌아보는 돌파 판정은 확정이 안 된다 — 매일 도는 알림은 판정 시점의 인덱스 값이
 * 곧 직전 최고가라 정확히 계산한다.
 *
 * 실행: node scripts/singo-july-md.mjs [--ym 2026-07] [--out docs/guides/신고가-2026-07.md]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const ym = arg("ym") ?? "2026-07";
const outPath = join(ROOT, arg("out") ?? `docs/guides/신고가-${ym}.md`);

const D = join(ROOT, "data/datasets");
const uniAll = JSON.parse(readFileSync(join(D, "apt-universe.json"), "utf8"));
const byGu = new Map();
for (const u of uniAll.items) {
  if (!byGu.has(u.lawdCd)) byGu.set(u.lawdCd, []);
  byGu.get(u.lawdCd).push(u);
}
const norm = (s) => String(s).replace(/\([^)]*\)/g, "").replace(/[\s·.\-_]/g, "").trim();
/** 명부에 있나 — 같은 법정동 완전일치 → 없으면 포함 후보가 하나뿐일 때만. 애매하면 안 붙인다. */
function inUni(lawdCd, umd, apt) {
  const list = byGu.get(lawdCd);
  if (!list) return null;
  const w = norm(apt);
  if (!w) return null;
  const same = list.filter((a) => a.umd === umd);
  const pool = same.length ? same : list;
  const exact = pool.filter((a) => a.norm === w);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null;
  const part = pool.filter((a) => a.norm.length > 1 && (a.norm.includes(w) || w.includes(a.norm)));
  return part.length === 1 ? part[0] : null;
}

const rows = [];
for (const f of readdirSync(join(D, "molit-peak"))) {
  if (!f.endsWith(".json") || f.startsWith("_")) continue;
  const idx = JSON.parse(readFileSync(join(D, "molit-peak", f), "utf8"));
  const { gu, lawdCd } = idx.meta;
  for (const v of Object.values(idx.peaks)) {
    if (String(v.date).slice(0, 7) !== ym) continue;
    const u = inUni(lawdCd, v.umdNm, v.aptNm);
    if (!u) continue;
    rows.push({
      gu,
      umd: v.umdNm,
      apt: v.aptNm,
      pyeong: v.type === "84" ? "34평" : "25평",
      area: v.area,
      floor: v.floor,
      eok: v.priceManwon / 10000,
      manwon: v.priceManwon,
      date: v.date,
      hhld: u.hhld,
    });
  }
}
rows.sort((a, b) => b.manwon - a.manwon || a.gu.localeCompare(b.gu));

const guCount = new Map();
for (const r of rows) guCount.set(r.gu, (guCount.get(r.gu) ?? 0) + 1);
const n = (v) => Number(v).toLocaleString("ko-KR");
const [Y, M] = ym.split("-");
const isGg = (r) => /시(장안구|권선구|팔달구|영통구|수정구|중원구|분당구|만안구|동안구|상록구|단원구|덕양구|일산동구|일산서구|처인구|기흥구|수지구|원미구|소사구|오정구|만세구|효행구|병점구|동탄구)?$/.test(r.gu) && r.gu.includes("시");

/** 금액대 = 10억 단위 구간. 45억 → 40, 9.8억 → 0 */
const band = (manwon) => Math.floor(manwon / 100_000) * 10;
const bandLabel = (b) => (b === 0 ? "10억 미만" : `${b}억대`);
const bands = new Map();
for (const r of rows) {
  const b = band(r.manwon);
  if (!bands.has(b)) bands.set(b, []);
  bands.get(b).push(r);
}
const bandKeys = [...bands.keys()].sort((a, b) => b - a);

const L = [];
L.push(`# 🔥 ${Y}년 ${Number(M)}월 신고가 — ${n(rows.length)}건 (금액대별)`);
L.push("");
L.push(`> **1,000세대 이상 ${n(uniAll.items.length)}개 단지 명부 안에서**, 전용 59타입(25평)·84타입(34평) 중개거래 중`);
L.push(`> **2020년 이후 최고가를 새로 쓴 것**만. 직거래·해제거래 제외.`);
L.push("");
L.push(`| | |`);
L.push(`|---|---|`);
L.push(`| 기준선 | 2020-01 ~ 2026-07 (61개 지역 × 79개월) |`);
L.push(`| 대상 단지 | 1,000세대 이상 ${n(uniAll.items.length)}개 (명부) |`);
L.push(`| 평형 | 전용 59타입 = 25평 · 전용 84타입 = 34평 |`);
L.push(`| 건수 | **${n(rows.length)}건** (서울 ${n(rows.filter((r) => !isGg(r)).length)} · 경기 ${n(rows.filter(isGg).length)}) |`);
L.push(`| 출처 | 국토교통부 아파트 매매 실거래가 상세자료 |`);
L.push("");
L.push("⚠️ **실거래가는 억 단위 소수 첫째자리로 반올림했다.** 원값(만원 단위)은");
L.push("`data/datasets/molit-peak/{지역코드}.json` 에 그대로 있다 — 카드에 쓸 때는 원값을 쓴다.");
L.push("(예: 리센츠 34평 36.95억 → 이 표에서는 `37.0`. 금액대 구분은 **반올림 전 원값**으로 갈랐다)");
L.push("");
L.push("---");
L.push("");

/* ── 금액대 요약 */
L.push("## 1. 금액대별 건수");
L.push("");
L.push("| 금액대 | 건수 | 비중 | 서울 | 경기 |");
L.push("|---|---:|---:|---:|---:|");
for (const b of bandKeys) {
  const list = bands.get(b);
  const se = list.filter((r) => !isGg(r)).length;
  L.push(`| **${bandLabel(b)}** | ${list.length} | ${((list.length / rows.length) * 100).toFixed(1)}% | ${se} | ${list.length - se} |`);
}
L.push(`| **합계** | **${n(rows.length)}** | 100% | ${n(rows.filter((r) => !isGg(r)).length)} | ${n(rows.filter(isGg).length)} |`);
L.push("");
L.push("---");
L.push("");

/* ── 금액대별 목록 */
L.push("## 2. 금액대별 전체 목록");
L.push("");
for (const b of bandKeys) {
  const list = bands.get(b).slice().sort((a, x) => x.manwon - a.manwon || a.gu.localeCompare(x.gu));
  L.push(`### ${bandLabel(b)} — ${list.length}건`);
  L.push("");
  L.push("| # | 행정구 | 단지명 | 평수 | 실거래가(억) | 거래일 |");
  L.push("|---:|---|---|---|---:|---|");
  list.forEach((r, i) => {
    L.push(`| ${i + 1} | ${r.gu} | ${r.apt} | ${r.pyeong} | ${r.eok.toFixed(1)} | ${r.date} |`);
  });
  L.push("");
}
L.push("---");
L.push("");

/* ── 지역별 */
L.push("## 3. 지역별 건수");
L.push("");
L.push("| 지역 | 건수 |");
L.push("|---|---:|");
for (const [gu, c] of [...guCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  L.push(`| ${gu} | ${c} |`);
}
L.push(`| **합계** | **${n(rows.length)}** |`);
L.push("");
L.push("---");
L.push("");
L.push("## 읽을 때 알아둘 것");
L.push("");
L.push("- **거래일은 계약일**이다(신고일이 아니다). 실거래 신고기한이 계약 후 30일이라, 7월 계약분은");
L.push("  8월까지 더 들어올 수 있다 — 이 표는 지금 시점에 신고된 것까지다.");
L.push("- **금액대는 그 거래가 속한 구간**이다. **10억 선을 이번에 넘었다는 뜻이 아니다** —");
L.push("  인덱스는 최고가 한 줄만 남기고 직전 기록은 안 남겨서, 뒤돌아보는 돌파 판정은 확정이 안 된다.");
L.push("  매일 도는 알림은 판정 시점의 인덱스 값이 곧 직전 최고가라 `🎉 N억 돌파`를 정확히 계산한다.");
L.push("- **단지명은 실거래 신고 표기**다. 명부(관리대장)의 이름과 조금 다를 수 있다.");
L.push("- **한 단지에 25평·34평이 각각 오를 수 있다.** 서로 다른 칸으로 세기 때문이다.");
L.push('- **"2020년 이후" 최고가다.** 2006~2019 기록은 보지 않으므로 "역대"라고 쓰지 않는다.');
L.push("");
L.push("이 문서는 `node scripts/singo-july-md.mjs --ym " + ym + "` 로 다시 만든다.");
L.push("");

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, L.join("\n"));
console.log(`${outPath}\n${rows.length}건 · 금액대 ${bandKeys.length}구간 · 지역 ${guCount.size}곳`);
