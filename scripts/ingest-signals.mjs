/**
 * 수집한 신호 → 소재 보드에 실제로 꽂아 넣는다.
 *
 * ── 왜 필요한가 (2026-07-26에 발견한 구멍)
 * 관제탑에서 [새 소재 발굴]을 누르면 `research-digest.yml`이 돌았지만,
 * 그 결과는 `research/briefs/{날짜}-auto.md` 파일로만 떨어졌다.
 * 소재 보드는 `research/ideas.json`을 보므로 **화면에는 아무것도 안 생겼다.**
 * 오너 입장에선 "눌러도 안 먹는" 버튼이었다.
 *
 * 이 스크립트가 그 사이를 잇는다: 최신 보드 파일을 읽어 새 후보를 ideas.json에 넣고,
 * `isNew` 표시를 붙여 관제탑 '오늘' 탭이 "새로 발굴된 소재 N건"으로 부르게 한다.
 *
 * ── 중복은 넣지 않는다
 * 이미 있는 소재(제목이 겹치는 것)와, 오너가 지운 소재(삭제 사유가 남은 것)는 건너뛴다.
 * 지운 걸 다음 날 또 가져오면 그건 학습이 아니라 소음이다.
 *
 * 실행: node scripts/ingest-signals.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IDEAS = join(ROOT, "research/ideas.json");
const BRIEFS = join(ROOT, "research/briefs");

const norm = (s) => String(s || "").replace(/\s+/g, "").replace(/[·—\-'"'()[\]]/g, "").toLowerCase();

/** 소재 제목은 사람이 읽는 한 줄이다 — 마크다운·번호·따옴표를 걷어낸다 */
const clean = (s) =>
  String(s || "")
    .replace(/\*\*/g, "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

if (!existsSync(IDEAS)) {
  console.log("research/ideas.json 없음 — 건너뜁니다.");
  process.exit(0);
}
let doc;
try {
  doc = JSON.parse(readFileSync(IDEAS, "utf8"));
} catch (e) {
  console.log(`::warning::ideas.json 파싱 실패 — ${e.message}`);
  process.exit(0);
}
const items = Array.isArray(doc.ideas) ? doc.ideas : [];
const cats = Array.isArray(doc.cats) ? doc.cats : [];

// 최신 보드 파일
if (!existsSync(BRIEFS)) {
  console.log("research/briefs 없음 — 수집 결과가 없습니다.");
  process.exit(0);
}
const files = readdirSync(BRIEFS).filter((f) => f.endsWith(".md")).sort();
if (!files.length) {
  console.log("보드 파일 없음.");
  process.exit(0);
}
const latest = files[files.length - 1];
const md = readFileSync(join(BRIEFS, latest), "utf8");

/**
 * 보드에서 후보를 뽑는다. 수집기가 만드는 두 형식을 모두 받는다.
 *   ① 표:      | 소재 | 신호 | Tier | 포맷 | …
 *   ② 체크박스: - [ ] 헤드라인 - 매체 — 매체 🔥      (research-digest 가 만드는 형식)
 *
 * ②는 뉴스 헤드라인이라 그대로 쓰면 소재 제목으로 길고 지저분하다 →
 * 매체명·이모지를 떼고, **🔥(숫자·순위 레버) 표시가 붙은 것만** 올린다.
 * 표시가 없는 일반 기사까지 다 넣으면 보드가 수십 건으로 불어나 오너가 못 본다.
 */
const MAX_INGEST = 8;
function parseCandidates(text) {
  const out = [];
  let section = "";
  for (const line of text.split(/\r?\n/)) {
    const h = line.match(/^#{2,3}\s+(.+)$/);
    if (h) { section = h[1].replace(/[🎯📌]/g, "").trim(); continue; }

    const cells = line.split("|").map((c) => c.trim());
    if (cells.length >= 5 && /^\s*\|/.test(line)) {
      const [, title, signal, tier] = cells;
      if (!title || title === "소재" || /^-{3,}/.test(title) || /\(예시\)/.test(title)) continue;
      out.push({ title, why: signal || "", tier: tier || "", section });
      continue;
    }

    // - [ ] 헤드라인 - 매체 — 매체 🔥
    const c = line.match(/^\s*[-*]\s*\[[ xX]\]\s*(.+)$/);
    if (c) {
      const raw = c[1];
      if (!/🔥/.test(raw)) continue;             // 레버 있는 것만
      const clean = raw
        .replace(/🔥|📈/g, "")
        .replace(/\s+[—–]\s+[^—–]*$/, "")        // 끝의 " — 매체" 제거
        .replace(/\s+-\s+[^-]{2,20}$/, "")       // 끝의 " - 매체" 제거
        .replace(/^\[[^\]]*\]\s*/, "")           // 앞의 "[특집]" 같은 말머리 제거
        .trim();
      if (clean.length < 6) continue;
      out.push({ title: clean, why: `자동 수집 신호${section ? " · " + section : ""}`, tier: "", section });
      continue;
    }

    // - 제목 — 이유
    const m = line.match(/^\s*[-*]\s+([^[].+?)(?:\s+[—-]\s+(.+))?$/);
    if (m && m[1].length > 6 && !/^https?:/.test(m[1])) {
      out.push({ title: m[1], why: m[2] || "", tier: "", section });
    }
  }
  return out.slice(0, MAX_INGEST * 3); // 아래에서 중복을 걸러 최대 MAX_INGEST 건만 남는다
}

/** 신호 텍스트에서 분류를 고른다 — 없으면 첫 카테고리 */
function pickCat(c) {
  const t = `${c.title} ${c.why} ${c.tier} ${c.section || ""}`;
  const RULES = [
    [/부동산|아파트|전세|월세|분양|재건축|토허|실거래/, "부동산"],
    [/증시|코스피|코스닥|주식|환율|금리|경제/, "경제"],
    [/연봉|월급|초봉|자산|저축|투자/, "돈"],
    [/지하철|교통|철도|GTX|버스/, "생활"],
  ];
  for (const [re, key] of RULES) {
    if (!re.test(t)) continue;
    const hit = cats.find((x) => x.key.includes(key) || x.label.includes(key));
    if (hit) return hit.key;
  }
  return cats[0]?.key || "misc";
}

// 이미 있는 것 + 오너가 지운 것은 다시 넣지 않는다
const known = new Set(items.map((i) => norm(i.title)));
const droppedTitles = new Set();
for (const f of ["research/decisions-inbox.md", "research/DECISION_LOG.md"]) {
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/(?:소재 삭제|중단|반려):\s*(.+?)(?:\s+—|$)/);
    if (m) droppedTitles.add(norm(m[1]));
  }
}

const cands = parseCandidates(md);
const added = [];
let n = 0;
for (const c of cands) {
  if (added.length >= MAX_INGEST) break; // 한 번에 쏟아붓지 않는다 — 오너가 볼 수 있는 양만
  const key = norm(clean(c.title));
  if (!key || key.length < 4 || known.has(key)) continue;
  if ([...droppedTitles].some((d) => d && (d.includes(key) || key.includes(d)))) continue;
  known.add(key);
  const id = `sig-${latest.slice(0, 10)}-${++n}`;
  const item = {
    id,
    cat: pickCat(c),
    title: clean(c.title).slice(0, 90),
    why: clean(c.why).slice(0, 140),
    source: `자동 수집 · ${latest}`,
    state: "",
    status: "",
    isNew: true, // 관제탑 '오늘' 탭이 이걸 보고 "새로 발굴된 소재"로 부른다
  };
  items.push(item);
  added.push(item);
}

if (!added.length) {
  console.log(`새로 넣을 소재 없음 (후보 ${cands.length}건은 모두 기존/삭제 이력과 중복).`);
  process.exit(0);
}

doc.ideas = items;
writeFileSync(IDEAS, JSON.stringify(doc, null, 2) + "\n", "utf8");
console.log(`💡 소재 보드에 ${added.length}건 추가 (출처: ${latest})`);
for (const a of added) console.log(`   · ${a.title}`);
