#!/usr/bin/env node
/**
 * 판형 사용 현황 — 어느 템플릿이 실제로 카드가 되고 있나.
 *
 * 왜 스크립트로 만드나 (2026-08-31):
 *   템플릿이 40종인데 **확정 세트가 쓰는 것은 23종**이고 17종은 안 쓰인다.
 *   그런데 문서에는 그 구분이 없어서, 새 카드를 만들 때 세션이
 *   **이미 있는 판형을 못 찾고 새로 만든다.** 판형은 하나 늘 때마다 검수·유지 대상이 는다.
 *
 *   손으로 표를 적으면 세트가 늘 때마다 낡는다 — 이 저장소가 오늘 하루에
 *   같은 실수를 세 번 확인했다. **수치는 사람이 옮기지 않는다.**
 *
 * 무엇을 세나:
 *   `data/review/sets.json` 의 각 세트가 참조하는 카드 JSON 을 열어 `template` 을 읽는다.
 *   빌더만 있고 세트가 없는 것은 "빌더 있음"으로 따로 표시한다 — 죽은 것이 아니라
 *   **아직 발행 단위로 등록되지 않은 것**이다(대장 도감이 그렇게 멈춰 있었다).
 *
 * 쓰는 법:
 *   node scripts/template-usage.mjs            # 화면에만
 *   node scripts/template-usage.mjs --write    # docs/TEMPLATES.md 의 표를 갱신
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");
const MARK = "<!-- template-usage -->";

const sets = (() => {
  const j = JSON.parse(readFileSync(join(ROOT, "data/review/sets.json"), "utf8"));
  return j.sets || j;
})();
const builders = JSON.parse(readFileSync(join(ROOT, "data/review/builders.json"), "utf8")).builders;

/* 카드 이름 → 템플릿 (날짜 폴더를 통째로 훑는다. 같은 이름이면 최신이 이긴다) */
const cardTpl = new Map();
const contentRoot = join(ROOT, "data/content");
if (existsSync(contentRoot)) {
  for (const d of readdirSync(contentRoot).sort()) {
    const dir = join(contentRoot, d);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const j = JSON.parse(readFileSync(join(dir, f), "utf8"));
        const t = String(j.template || "").split("@")[0];
        if (t) cardTpl.set(f.replace(/\.json$/, ""), t);
      } catch { /* 깨진 카드는 건너뛴다 */ }
    }
  }
}

const bySet = new Map();          // 템플릿 → 세트 라벨 집합
for (const s of sets) {
  for (const c of s.cards || []) {
    const t = cardTpl.get(c);
    if (!t) continue;
    if (!bySet.has(t)) bySet.set(t, new Set());
    bySet.get(t).add(s.label);
  }
}

/* 빌더가 이름을 언급하는 템플릿 — 세트는 없어도 만들 준비는 된 것들 */
const hasBuilder = new Set();
for (const b of builders) {
  const src = existsSync(join(ROOT, b.cmd)) ? readFileSync(join(ROOT, b.cmd), "utf8") : "";
  for (const t of readdirSync(join(ROOT, "templates"))) {
    if (t.startsWith("_")) continue;
    if (src.includes(`"${t}`) || (b.cmd || "").includes(t)) hasBuilder.add(t);
  }
}

const all = readdirSync(join(ROOT, "templates")).filter((t) => !t.startsWith("_")).sort();
const live = all.filter((t) => bySet.has(t));
const ready = all.filter((t) => !bySet.has(t) && hasBuilder.has(t));
const idle = all.filter((t) => !bySet.has(t) && !hasBuilder.has(t));

const rows = [
  `${MARK}`,
  `> 이 표는 \`node scripts/template-usage.mjs --write\` 가 **실측해서 씁니다.**`,
  `> 손으로 고치지 마세요 — 세트가 늘면 다음 실행 때 덮어씁니다.`,
  ``,
  `**템플릿 ${all.length}종** · 🟢 카드가 나오는 것 ${live.length} · 🟡 빌더는 있음 ${ready.length} · ⚪ 잠자는 것 ${idle.length}`,
  ``,
  `| 판형 | 상태 | 쓰는 세트 |`,
  `|---|---|---|`,
];
for (const t of live) {
  const s = [...bySet.get(t)];
  rows.push(`| \`${t}\` | 🟢 ${s.length}세트 | ${s.slice(0, 3).join(", ")}${s.length > 3 ? ` 외 ${s.length - 3}` : ""} |`);
}
for (const t of ready) rows.push(`| \`${t}\` | 🟡 빌더 있음·세트 없음 | — |`);
for (const t of idle) rows.push(`| \`${t}\` | ⚪ 잠자는 중 | — |`);
rows.push(
  ``,
  `> 🟡 는 **죽은 것이 아니라 발행 단위로 등록되지 않은 것**이다. 「대장 도감」이 그렇게`,
  `> 1화에서 멈춰 있었다 — 빌더는 있는데 \`builders.json\`·\`sets.json\` 에 없어서`,
  `> 시스템이 그 시리즈의 존재를 몰랐다.`,
  ``,
  `> ⚪ 를 함부로 지우지 않는다. 판형은 HTML·CSS·schema·config 한 벌이고,`,
  `> 지우면 그 판형으로 낸 발행본을 **다시 그릴 수 없다**. 읽는 부담도 없다(이 표만 보면 된다).`,
  `${MARK}`,
);
const block = rows.join("\n");

if (!WRITE) { console.log("\n" + block + "\n"); process.exit(0); }

const p = join(ROOT, "docs/TEMPLATES.md");
let doc = readFileSync(p, "utf8");
const re = new RegExp(`${MARK}[\\s\\S]*?${MARK}`);
if (re.test(doc)) doc = doc.replace(re, block);
else {
  const anchor = "## 1. 렌더링 방식";
  doc = doc.replace(anchor, `## 0. 지금 어느 판형이 쓰이고 있나\n\n${block}\n\n---\n\n${anchor}`);
}
writeFileSync(p, doc);
console.log(`✅ docs/TEMPLATES.md 갱신 — 🟢${live.length} 🟡${ready.length} ⚪${idle.length}`);
