/**
 * 수도권 예정 철도망 노선 카드 8장 (`rail-line@1`).
 *
 * ── 이 카드가 지키는 것
 * ① **공정률은 한 기준일로만 말한다.** 전부 국가철도공단 「주요사업현황」 '26.6월 값이다.
 *    언론 보도치와 섞으면 사업 간 비교가 깨진다 — 실제로 공단 6월 값이 더 **이른**
 *    보도치보다 낮은 사업이 셋 있다(월판·인동·신분당 남부. 산정 범위가 다르다).
 *    그래서 `progressAsOf` 가 없으면 던진다.
 * ② **환승 표기는 카탈로그에서만 나온다.** `templates/_shared/metro-lines.json` 에 없는
 *    키를 쓰면 metroBadge 가 조용히 회색 글자로 폴백한다 — 그게 카드로 나가면 오보다.
 *    그래서 빌더가 먼저 전수 대조하고, 없으면 **던진다**.
 * ③ **노선 표시색을 손으로 정하지 않는다.** 카탈로그의 그 노선 색을 그대로 쓴다.
 *    임의색을 칠하면 같은 노선이 카드마다 다른 색이 된다.
 * ④ **개통 예정은 목표치다.** '확정'·'개통일' 같은 단정 표현이 문구에 섞이면 던진다.
 *    GTX-C 는 실시협약에서 준공 연도가 삭제돼(「착수일부터 60개월」) 연도를 쓰지 않는다.
 * ⑤ **세로가 넘치지 않게 행 수를 잰다.** 노선도는 행마다 flex:1 이라 역이 많을수록
 *    행이 얇아진다. 뱃지 지름(--mono)보다 얇아지면 환승 뱃지가 위아래로 삐져나온다.
 *    designQa 가 잡기 전에 여기서 먼저 던진다.
 *
 * 실행: node scripts/build-rail-line.mjs [날짜] [--publish]
 *   --publish 없이 돌리면 data/out/_spike 로 간다(확정·재생산은 data/content 를 본다).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const date = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 10);
const publish = argv.includes("--publish");

const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/sudo-rail-2026-09.json"), "utf8"));
if (doc.meta?.verified !== true) throw new Error("데이터셋이 verified:true 가 아니다 — 카드로 못 만든다 (CLAUDE.md §8)");
if (!doc.meta.asOf) throw new Error("meta.asOf 가 없다 — 공정률 기준일 없이 카드를 만들지 않는다");

const CAT = JSON.parse(readFileSync(join(ROOT, "templates/_shared/metro-lines.json"), "utf8"));

/* ── ③ 노선 표시색: 카탈로그 키를 노선마다 못박는다 (임의색 금지) ── */
const SELF = {
  sinansan: "신안산", gtxa: "GTX-A", gtxb: "GTX-B", gtxc: "GTX-C",
  indong: "인동", wolpan: "월판", sinbundang: "신분당", daejang: "대홍",
};

/* ── ④ 단정 표현 금지어 — 개통 예정은 전부 목표치다 ── */
const BAN = /개통일\s*확정|확정\s*개통|개통\s*확정|준공\s*확정/;

/* ── ⑤ 세로 한계 — 본문 높이를 실제 CSS 로 셈한다 ──────────────
 * 카드 1350 − 상단 72 − topcap 32 − 머리(제목 76×1.04 + 구간 27 + 여백·괘선 ≈ 62)
 *        − 본문 위 여백 24 − 각주 19+38 − 푸터(24×1.4 + 34×2 ≈ 102)
 * ≈ 900px. 뱃지 지름 40 + 위아래 숨 4 = 44px 가 한 행의 하한이다. */
const BODY_H = 900, ROW_MIN = 44;

const MAP_CLS = { 개통: "s-open", 미개통: "", 가칭: "s-prov", 역명미정: "s-prov", 추가역: "" };
const PROV = { 가칭: "가칭", 역명미정: "역명 미정", 추가역: "추가역" };

const outDir = publish ? join(ROOT, `data/content/${date}`) : join(ROOT, "data/out/_spike");
mkdirSync(outDir, { recursive: true });

const missing = new Set();
let made = 0;

for (const L of doc.lines) {
  /* ① 기준일 */
  if (!L.progressAsOf) throw new Error(`${L.name}: progressAsOf 가 없다 — 기준일 없는 공정률은 카드에 못 쓴다`);
  if (L.progressAsOf !== doc.meta.asOf)
    throw new Error(`${L.name}: 공정률 기준일이 데이터셋과 다르다(${L.progressAsOf} ≠ ${doc.meta.asOf}) — 한 기준일로만 비교한다`);
  if (!(L.progress >= 0 && L.progress <= 100)) throw new Error(`${L.name}: 공정률이 0~100 밖이다: ${L.progress}`);

  /* ② 환승 키 전수 대조 */
  for (const s of L.stations) for (const k of s.xfer || []) if (!CAT[k]) missing.add(`${L.name}/${s.name}: ${k}`);

  /* ③ 표시색 */
  const selfKey = SELF[L.key];
  if (!selfKey || !CAT[selfKey]) throw new Error(`${L.name}: 카탈로그에 자기 노선(${selfKey}) 이 없다 — 색을 지어내지 않는다`);
  const lc = CAT[selfKey].color;

  /* ④ 단정 표현 */
  const prose = [L.keyline, L.note || "", ...L.facts.map((f) => `${f.value} ${f.note}`)].join(" ");
  if (BAN.test(prose)) throw new Error(`${L.name}: 개통을 단정하는 표현이 있다 — 개통 예정은 목표치다`);
  if (L.key === "gtxc" && /\b20[23]\d년?\s*개통/.test(prose))
    throw new Error("GTX-C 는 준공 연도가 실시협약에서 삭제됐다 — 개통 연도를 쓰지 않는다");

  /* ⑤ 개통·준공 시점에는 반드시 근거를 붙인다 (2026-09-07 사고)
   * 신안산선 개통을 '2028.12' 라고만 적었는데, 국토부가 **승인**한 마지막 목표는 2026.12 이고
   * 2028.12 는 실시계획 변경 '신청안'이자 전동차 납품 시한이었다. 숫자만 적으면 승인된
   * 사실로 읽힌다 — 개통·준공 줄은 note(당초 목표·승인 상태·산정 근거)가 없으면 던진다. */
  for (const f of L.facts) {
    if (!/개통|준공/.test(f.label)) continue;
    if (!f.note || !f.note.trim())
      throw new Error(`${L.name}: '${f.label}' 에 근거(note) 가 없다 — 개통 시점은 당초 목표·승인 상태·산정 근거를 반드시 병기한다`);
  }

  /* ⑥ 세로 */
  const n = L.stations.length;
  const rowH = BODY_H / n;
  if (rowH < ROW_MIN)
    throw new Error(`${L.name}: 역이 ${n}개라 행 높이가 ${rowH.toFixed(1)}px — 환승 뱃지(40px)가 삐져나온다. 상한은 ${Math.floor(BODY_H / ROW_MIN)}행`);

  const stations = L.stations.map((s) =>
    s.type === "gap"
      ? { gap: s.text }
      : { name: s.name, cls: MAP_CLS[s.state] ?? "", prov: PROV[s.state] || "", xfer: s.xfer || [] });

  const card = {
    template: "rail-line@1", date, lc, n,
    subtitle: `공정률 = 국가철도공단 「주요사업현황」 2026년 6월 기준`,
    title: `<span class="ln">${L.name}</span> 어디까지 왔나`,
    seg: L.seg, badge: L.badge, tone: L.tone,
    prog: {
      value: String(L.progress), asOf: L.progressNote || "'26.6월 · 국가철도공단",
      width: `${L.progress}%`, zero: L.progress === 0,
    },
    facts: L.facts, keyline: L.keyline, note: L.note || "", stations,
    source: { name: L.src },
  };
  writeFileSync(join(outDir, `rail-${L.key}.json`), JSON.stringify(card, null, 2) + "\n");

  const opened = L.facts.find((f) => /개통|준공/.test(f.label));
  writeCaption(`rail-${L.key}`, [
    `${L.name} — 공정률 ${L.progress}%`, "",
    L.keyline, "",
    `· 구간 ${L.seg.split(" · ")[0]}`,
    `· ${opened ? `${opened.label} ${opened.value}` : "개통 예정 미정"}`,
    L.note ? `· ${L.note}` : "", "",
    "개통 예정은 목표치이며 확정 고시가 아닙니다.",
    `출처 · ${L.src} · ${doc.meta.asOf} 기준`, "",
    "#수도권철도 #부동산 #교통호재 #위릿노트 #부동산공부",
  ].filter((x) => x !== undefined).join("\n"));
  made++;
}

if (missing.size)
  throw new Error(`환승 키가 카탈로그(templates/_shared/metro-lines.json)에 없다 — 뱃지가 회색 글자로 조용히 폴백한다:\n  ${[...missing].join("\n  ")}`);

console.log(`✅ rail-line ${made}장 → ${publish ? `data/content/${date}/` : "data/out/_spike/"}`);
console.log(`   기준일 ${doc.meta.asOf} · 환승 키 전수 대조 통과 · 표시색은 카탈로그 값`);
