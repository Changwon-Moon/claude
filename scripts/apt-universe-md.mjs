/**
 * 1,000세대 이상 단지 명부 → 사람이 읽는 md.
 *
 * ── 왜 스크립트로 만드나 (2026-08-12 오너 "대상 1147개 단지 목록만 먼저 정리해줘 md로")
 * 손으로 옮겨 적으면 명부가 바뀔 때마다 문서가 조용히 낡는다. 명부는 세대수 문턱을 바꾸거나
 * 지역을 넓히면 그날 바뀐다 — 그때 이 스크립트를 다시 돌리면 문서가 따라온다.
 * **수치는 사람이 옮기지 않는다.**
 *
 * 실행: node scripts/apt-universe-md.mjs [--out docs/guides/명부-1000세대.md]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const outPath = join(ROOT, arg("out") ?? "docs/guides/명부-1000세대.md");

const uni = JSON.parse(readFileSync(join(ROOT, "data/datasets/apt-universe.json"), "utf8"));
const { meta, items } = uni;
const n = (v) => Number(v).toLocaleString("ko-KR");

/** 서울 먼저, 그 다음 경기 — 코드 앞자리가 11 이면 서울 */
const isSeoul = (it) => String(it.lawdCd).startsWith("11");
const byGu = new Map();
for (const it of items) {
  if (!byGu.has(it.gu)) byGu.set(it.gu, []);
  byGu.get(it.gu).push(it);
}
const gus = [...byGu.keys()].sort((a, b) => {
  const sa = isSeoul(byGu.get(a)[0]) ? 0 : 1;
  const sb = isSeoul(byGu.get(b)[0]) ? 0 : 1;
  return sa - sb || byGu.get(b).length - byGu.get(a).length;
});

const seoulItems = items.filter(isSeoul);
const ggItems = items.filter((it) => !isSeoul(it));

const L = [];
L.push(`# 📒 신고가 트래킹 대상 명부 — 1,000세대 이상 ${n(items.length)}개 단지`);
L.push("");
L.push(`> **이 명부 안에서만 신고가를 찾는다** (2026-08-12 오너: "1000세대 이상 단지만 먼저`);
L.push(`> 리스트업 해놓고 그 안에서 신고가 발생하는지만 트래킹하자").`);
L.push(`> 명부에 없는 단지는 판정 자체를 하지 않는다.`);
L.push("");
L.push(`| | |`);
L.push(`|---|---|`);
L.push(`| 집계일 | ${meta.updatedAt} |`);
L.push(`| 문턱 | **${n(meta.minHhld)}세대 이상** |`);
L.push(`| 대상 지역 | ${meta.regions}곳 (서울 25개구 전역 + 경기 20개 시) |`);
L.push(`| 전수 조사한 단지 | ${n(meta.aptChecked)} / ${n(meta.aptTotal)}곳 — **빠짐없이 확인** |`);
L.push(`| 명부에 오른 단지 | **${n(items.length)}개** (서울 ${n(seoulItems.length)} · 경기 ${n(ggItems.length)}) |`);
L.push(`| 출처 | 국토교통부 공동주택 단지 목록제공 서비스 · 공동주택 기본 정보제공 서비스(세대수) |`);
L.push("");
L.push(`세대수는 **코드가 API 에서 받아 적은 값**이다(사람이 옮기지 않았다). 원본은`);
L.push("`data/datasets/apt-universe.json`. 이 문서는 `node scripts/apt-universe-md.mjs` 로 다시 만든다.");
L.push("");
L.push("---");
L.push("");

/* ── 지역별 요약 */
L.push("## 1. 지역별 단지 수");
L.push("");
L.push("| 지역 | 단지 | 최다 세대 단지 |");
L.push("|---|---:|---|");
for (const gu of gus) {
  const list = byGu.get(gu).slice().sort((a, b) => b.hhld - a.hhld);
  L.push(`| ${gu} | ${list.length} | ${list[0].kaptName} (${n(list[0].hhld)}) |`);
}
L.push(`| **합계** | **${n(items.length)}** | |`);
L.push("");
L.push("---");
L.push("");

/* ── 세대수 상위 */
L.push("## 2. 세대수 상위 30개 단지");
L.push("");
L.push("| # | 지역 | 법정동 | 단지 | 세대수 |");
L.push("|---:|---|---|---|---:|");
items.slice(0, 30).forEach((it, i) => {
  L.push(`| ${i + 1} | ${it.gu} | ${it.umd} | ${it.kaptName} | ${n(it.hhld)} |`);
});
L.push("");
L.push("---");
L.push("");

/* ── 전체 목록 */
L.push("## 3. 전체 목록 (지역별 · 세대수 내림차순)");
L.push("");
for (const gu of gus) {
  const list = byGu.get(gu).slice().sort((a, b) => b.hhld - a.hhld);
  L.push(`### ${gu} — ${list.length}개`);
  L.push("");
  L.push("| 법정동 | 단지 | 세대수 |");
  L.push("|---|---|---:|");
  for (const it of list) L.push(`| ${it.umd} | ${it.kaptName} | ${n(it.hhld)} |`);
  L.push("");
}

L.push("---");
L.push("");
L.push("## 읽을 때 알아둘 것");
L.push("");
L.push("- **단지명은 공동주택 관리 대장의 이름**이라 실거래 신고 표기와 조금 다를 수 있다");
L.push("  (예: `신당남산타운(분양)` / `신당남산타운임대`). 판정할 때는 괄호·공백을 지우고 맞추되,");
L.push("  **애매하면 붙이지 않는다** — 잘못 붙이면 1,000세대 미만 단지가 알림에 섞인다.");
L.push("- **임대 단지가 분양 단지와 따로 잡히는 경우가 있다.** 둘 다 1,000세대를 넘으면 둘 다 오른다.");
L.push("- 문턱을 바꾸려면 `data/apt-universe-queue.txt` 에 `min=1500` 한 줄을 밀어 넣는다 —");
L.push("  **세대수는 이미 전수 조사돼 있어 다시 수집하지 않는다.**");
L.push("");

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, L.join("\n"));
console.log(`${outPath}\n단지 ${items.length}개 · 지역 ${gus.length}곳 · ${L.length}줄`);
