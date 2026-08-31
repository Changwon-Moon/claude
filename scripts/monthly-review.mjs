#!/usr/bin/env node
/**
 * 월간 회고 — 쌓인 판단을 되읽어 **무엇이 헛돌고 있나**를 본다.
 *
 * 왜 필요한가 (2026-08-31):
 *   오너의 판단은 이미 네 곳에 쌓이고 있다 — 승인·삭제(`decisions-inbox.md`),
 *   소재 결정 이유(`DECISION_LOG.md`), 내려놓은 소재(`ideas-dropped.json`), 성과(`performance.md`).
 *   **그런데 아무도 되읽지 않는다.** 쌓기만 하는 기록은 일기지 학습이 아니다.
 *
 *   실제로 그래서 생긴 일: 자동 수집이 증시 뉴스를 절반 가까이 긁어오고 있었는데
 *   (안 고른 278건 중 131건) 아무도 그 편식을 세지 않아 6주간 그대로였다.
 *
 * 무엇을 답하나:
 *   ① 승인은 됐는데 발행이 안 된 것이 있나 — 있으면 거기가 병목이다
 *   ② 무엇이 버려졌나 — 발굴이 헛도는 방향이 보인다
 *   ③ 발굴이 편식하나 — 주제 쿼터(2026-08-31 신설)가 듣고 있는지 확인
 *
 * ⚠️ **규칙을 자동으로 바꾸지 않는다.** 보고서만 쓴다.
 *    기계가 발굴 규칙을 고치면 왜 바뀌었는지 아무도 모르게 되고,
 *    그때부터 보드에 뜨는 소재를 오너가 믿을 수 없다. 판단은 오너 몫이다.
 *
 * 쓰는 법:
 *   node scripts/monthly-review.mjs              # 화면에
 *   node scripts/monthly-review.mjs --write      # data/review-{YYYY-MM}.md 로
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");
const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const ym = today.slice(0, 7);

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : "");
const L = [];
const say = (s = "") => L.push(s);

say(`# 월간 회고 — ${ym}`);
say("");
say(`> \`node scripts/monthly-review.mjs\` 가 쌓인 판단을 되읽어 씁니다.`);
say(`> **규칙을 자동으로 바꾸지 않습니다** — 무엇을 고칠지는 오너가 정합니다.`);
say("");

/* ── ① 승인 → 발행 사이에 갇힌 것 ── */
const inbox = read("research/decisions-inbox.md");
const lines = inbox.split("\n").filter((l) => l.trim().startsWith("- ["));
/* 제목에 카드용 HTML 조각이 섞여 들어온다(`<span class="sub">7/22 기준</span>`) — 벗긴다 */
const titleOf = (l) => (l.split(":").slice(1).join(":") || "")
  .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")
  .trim().replace(/\s*\(.*?\)\s*$/, "").trim();
const approved = new Map();   // 제목 → 승인 줄
const posted = new Set();
for (const l of lines) {
  const t = titleOf(l);
  if (!t) continue;
  if (l.includes("발행 승인")) approved.set(t, l);
  if (l.includes("발행 완료")) posted.add(t);
}
/* ⚠️ 제목만으로 맞추면 틀린다 — 카드 제목은 갱신된다.
   "서울 아파트 78주 연속 상승"이 발행 뒤 "…연속 상승"으로 바뀌어 미발행으로 잡혔다.
   그래서 **published/ 폴더**(실제 올린 것의 증거)를 같이 본다. 두 눈이 한 눈보다 낫다. */
const publishedDirs = existsSync(join(ROOT, "published"))
  ? readdirSync(join(ROOT, "published")).join(" ")
  : "";
const looksPublished = (t) => {
  if (posted.has(t)) return true;
  /* 제목에서 뽑은 낱말이 발행 폴더 이름에 있으면 올린 것으로 본다 */
  const words = t.replace(/<[^>]*>/g, " ").split(/[\s·—(),]+/).filter((w) => w.length >= 2);
  return words.some((w) => publishedDirs.includes(w));
};
const stuck = [...approved].filter(([t]) => !looksPublished(t));

say(`## ① 승인했는데 아직 안 올린 것 — ${stuck.length}건`);
say("");
if (!stuck.length) say("없습니다. 승인한 것은 전부 인스타에 올라갔습니다.");
else {
  say("승인과 발행 사이가 병목입니다. 오래 갇혀 있으면 카드가 낡습니다.");
  say("");
  for (const [t, l] of stuck.slice(0, 12)) {
    const d = (l.match(/\[(\d\d\.\d\d\.\d\d)/) || [, "?"])[1];
    say(`- ${d} · ${t.slice(0, 60)}`);
  }
  if (stuck.length > 12) say(`- … 외 ${stuck.length - 12}건`);
}
say("");

/* ── ② 무엇이 버려졌나 ── */
const killed = lines.filter((l) => l.includes("완전 삭제"));
let droppedTotal = 0;
const droppedByTopic = {};
try {
  const dj = JSON.parse(read("research/ideas-dropped.json") || "{}");
  for (const b of dj.dropped || []) {
    for (const i of b.items || []) {
      droppedTotal++;
      const k = i.topic || "(없음)";
      droppedByTopic[k] = (droppedByTopic[k] || 0) + 1;
    }
  }
} catch { /* 보관함이 없으면 0 */ }

say(`## ② 버려진 것 — 카드 ${killed.length}건 · 소재 ${droppedTotal}건`);
say("");
if (droppedTotal) {
  say("내려놓은 소재의 주제별 분포 — **여기가 발굴이 헛돈 방향**입니다.");
  say("");
  for (const [k, v] of Object.entries(droppedByTopic).sort((a, b) => b[1] - a[1])) {
    say(`- ${k} — ${v}건`);
  }
  say("");
}
for (const l of killed.slice(-5)) say(`- ${l.replace(/^- /, "")}`);
say("");

/* ── ③ 발굴이 편식하나 ── */
const ideas = JSON.parse(read("research/ideas.json") || '{"ideas":[]}');
const open = (ideas.ideas || []).filter((i) => !(i.status === "done" || Number(i.stage || 0) > 0));
const byTopic = {};
for (const i of open) byTopic[i.topic || "(없음)"] = (byTopic[i.topic || "(없음)"] || 0) + 1;
/* 관제탑이 들고 있는 목표 비중 — 수집기 쿼터도 여기서 나왔다 */
const TARGET = { "부동산": 30, "증시·경제": 35, "돈·연봉": 10, "교통·생활": 10, "생활·통계": 15 };

say(`## ③ 지금 보드의 주제 배분 — 안 고른 것 ${open.length}건`);
say("");
say(`| 주제 | 지금 | 비중 | 목표 |`);
say(`|---|--:|--:|--:|`);
for (const [k, v] of Object.entries(byTopic).sort((a, b) => b[1] - a[1])) {
  const pct = Math.round((v / open.length) * 100);
  const tgt = TARGET[k];
  const mark = tgt && pct > tgt + 12 ? " ⚠️" : "";
  say(`| ${k} | ${v} | ${pct}%${mark} | ${tgt ? tgt + "%" : "—"} |`);
}
say("");
say(`> ⚠️ = 목표보다 12%p 넘게 많다. 2026-08-31 에 수집기 주제 쿼터를 넣었으니`);
say(`> **다음 달 회고에서 이 표가 목표에 가까워졌는지** 본다. 안 가까워졌으면 쿼터가 안 듣는 것이다.`);
say("");

/* ── 오너가 정할 것 ── */
say(`## 오너가 정할 것`);
say("");
if (stuck.length > 3) say(`- 승인 후 안 올린 것이 ${stuck.length}건이다. 발행 리듬을 어떻게 할까`);
if (droppedTotal > 30) say(`- 소재 ${droppedTotal}건을 내려놨다. 그 주제의 수집을 더 줄일까`);
const worst = Object.entries(byTopic).find(([k, v]) => TARGET[k] && (v / open.length) * 100 > TARGET[k] + 12);
if (worst) say(`- \`${worst[0]}\`가 목표보다 많다. 쿼터를 더 조일지, 목표 비중 자체를 바꿀지`);
say(`- 이 회고에서 정한 것은 \`company/CEO.md\` 판단 원칙에 남긴다 — 안 남기면 다음 달에 또 정한다`);
say("");

const out = L.join("\n");
if (!WRITE) { console.log("\n" + out); process.exit(0); }
const p = join(ROOT, `data/review-${ym}.md`);
writeFileSync(p, out + "\n");
console.log(`✅ 월간 회고 작성 — data/review-${ym}.md`);
console.log(`   승인 후 미발행 ${stuck.length}건 · 내려놓은 소재 ${droppedTotal}건 · 안 고른 것 ${open.length}건`);
