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

/**
 * ⚠️ 예전엔 "파일명 정렬 후 마지막 하나"만 읽었다. 그런데 지시 수집 파일
 * `{날짜}-ask-{키워드}.md` 는 `{날짜}-auto.md` 보다 **앞에** 정렬돼서
 * 오너가 시킨 수집 결과가 통째로 무시됐다.
 * → 가장 최근 날짜의 보드를 **전부** 읽는다(그날의 auto + 지시 수집 여러 건).
 */
const latestDate = files.map((f) => f.slice(0, 10)).sort().pop();
const targets = files.filter((f) => f.startsWith(latestDate));
const latest = () => readFrom.join(", ");

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
/**
 * 새로 수집한 신호를 어느 칸에 넣을 것인가.
 *
 * 분류 기준이 **주제 → 발행 주기**로 바뀌었다(2026-07-27 오너 지시).
 * 갓 수집된 뉴스 신호는 정기물인지 일회성인지 기계가 알 수 없다 — 그건 오너의 판단이다.
 * 그래서 전부 '🆕 분류 대기'로 보낸다. 오너가 소재 보드에서 ✎로 주기를 정하면 옮겨간다.
 *
 * ⚠️ cats[0]을 기본값으로 쓰지 않는다. 그러면 수집물이 전부 '정기 · 데일리' 칸에 쌓인다.
 */
function pickCat() {
  const todo = cats.find((x) => x.key === "todo");
  return todo ? todo.key : "todo";
}

/** 주제 — 보관함 폴더링용. 주기(cat)와 별개다. */
function pickTopic(c) {
  const t = `${c.title} ${c.why} ${c.tier} ${c.section || ""}`;
  const RULES = [
    [/부동산|아파트|전세|월세|분양|재건축|토허|실거래|집값/, "부동산"],
    [/증시|코스피|코스닥|주식|환율|금리|경제/, "증시·경제"],
    [/연봉|월급|초봉|자산|저축|투자|소득/, "돈·연봉"],
    [/지하철|교통|철도|GTX|버스/, "교통·생활"],
  ];
  for (const [re, label] of RULES) if (re.test(t)) return label;
  return "생활·통계";
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

/* 지시 수집이 있으면 **그것만** 올린다.
 * 오너가 "전세 자료 찾아줘"라고 시켰는데 그 결과 1건 + 무관한 일반 뉴스 7건이
 * 함께 올라오면, 시킨 것에 답한 게 아니라 보드만 불린 것이다.
 * 일반 수집은 매일 아침 자동 수집이 알아서 한다. */
const askFiles = targets.filter((f) => f.includes("-ask-"));
const readFrom = askFiles.length ? askFiles : targets;

const cands = [];
for (const f of readFrom) {
  const text = readFileSync(join(BRIEFS, f), "utf8");
  const ask = (text.match(/^>\s*오너 지시:\s*\*\*"(.+?)"\*\*/m) || [])[1] || "";
  for (const c of parseCandidates(text)) cands.push({ ...c, file: f, ask });
}

/**
 * 지시 수집 결과는 **시킨 것에 대한 답**이어야 한다.
 *
 * 뉴스 검색은 관련 없는 기사(특히 분양 광고성 기사)를 섞어 준다.
 * 실제로 "전세가율 전세난 전세 시장"을 시켰더니 김해 아파트 분양 기사가 딸려왔다.
 * → 지시 수집 항목은 **시킨 낱말 중 하나를 제목에 담고 있을 때만** 올린다.
 *   (자동 수집은 원래 넓게 훑는 것이 목적이라 이 규칙을 적용하지 않는다)
 */
function answersAsk(title, ask) {
  const words = String(ask || "")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2);
  if (!words.length) return true;
  const t = norm(title);
  return words.some((w) => t.includes(norm(w)));
}

const added = [];
const offTopic = [];
const overQuota = [];
let n = 0;

/* ── 주제 쿼터 (2026-08-31 신설) ──
 * 하루 8건 상한은 있었지만 **주제 배분이 없었다.** 8건이 전부 증시 뉴스여도 그대로 들어왔다.
 * 실측(08-31): 안 고른 소재 278건 중 증시·경제가 131건(47%) — 정리한 55건도 대부분
 * "잉글랜드은행 기준금리 동결" 같은 **지나간 기사 헤드라인**이었다. 카드가 될 일이 없다.
 *
 * 관제탑은 이미 목표 비중을 갖고 있었다(부동산30·경제20·주식15·기타35) — 수집기가 그걸
 * 몰랐을 뿐이다. **정해 둔 규칙을 코드가 모르면 없는 규칙이다.**
 *
 * ⚠️ 막지 않고 **뒤로 미룬다.** 쿼터를 넘은 후보는 버리는 게 아니라 이번 회차에서만 빠진다 —
 *    다음 날 자리가 있으면 들어온다. 좋은 소재를 주제 때문에 영영 잃으면 안 된다. */
const QUOTA = { "부동산": 3, "증시·경제": 2, "돈·연봉": 1, "교통·생활": 1, "생활·통계": 2 };
const perTopic = {};

for (const c of cands) {
  if (added.length >= MAX_INGEST) break; // 한 번에 쏟아붓지 않는다 — 오너가 볼 수 있는 양만
  const key = norm(clean(c.title));
  if (!key || key.length < 4 || known.has(key)) continue;
  if ([...droppedTitles].some((d) => d && (d.includes(key) || key.includes(d)))) continue;
  if (c.ask && !answersAsk(c.title, c.ask)) { offTopic.push(clean(c.title)); continue; }
  const topic = pickTopic(c);
  if (!c.ask && (perTopic[topic] || 0) >= (QUOTA[topic] ?? 2)) {
    overQuota.push(`${topic} · ${clean(c.title).slice(0, 40)}`);
    continue; // 지시로 찾은 것(c.ask)은 쿼터를 안 본다 — 오너가 콕 집어 시킨 것이다
  }
  perTopic[topic] = (perTopic[topic] || 0) + 1;
  known.add(key);
  const id = `sig-${latestDate}-${++n}`;
  const item = {
    id,
    cat: pickCat(),
    topic,   // 위에서 쿼터를 재며 이미 구했다 — 두 번 계산하지 않는다
    feed: "manual", // 뉴스에서 온 신호는 자료 갱신 통로가 없다 — 정기물로 만들려면 수집기부터
    title: clean(c.title).slice(0, 90),
    why: c.ask ? `지시 "${c.ask}"로 찾은 소재` : clean(c.why).slice(0, 140),
    source: c.ask ? `지시 수집 · ${c.file}` : `자동 수집 · ${c.file}`,
    state: "",
    status: "",
    // ⚠️ 들어온 날을 남긴다 (2026-08-31). 이걸 안 남겨서 소재 298건 중 **278건이 언제
    //    들어왔는지 모르는 상태**가 됐다 — 나이를 모르면 무엇을 지울지 정할 수가 없고,
    //    그래서 계속 쌓인다. `scripts/ideas-health.mjs` 가 이 비율을 잰다.
    at: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10),
    isNew: true, // 관제탑 '오늘' 탭이 이걸 보고 "새로 발굴된 소재"로 부른다
    ...(c.ask ? { ask: c.ask } : {}), // 어떤 지시에 대한 답인지 — 관제탑이 되짚어 보여준다
  };
  items.push(item);
  added.push(item);
}

if (!added.length) {
  console.log(`새로 넣을 소재 없음 (후보 ${cands.length}건 · 지시와 무관해 제외 ${offTopic.length}건 · 나머지는 기존/삭제 이력과 중복).`);
  process.exit(0);
}

doc.ideas = items;
writeFileSync(IDEAS, JSON.stringify(doc, null, 2) + "\n", "utf8");
console.log(`💡 소재 보드에 ${added.length}건 추가 (출처: ${latest()})`);
for (const a of added) console.log(`   · ${a.title}`);
// 걸러낸 것도 말한다 — 조용히 버리면 "왜 이것만 왔지"를 알 수 없다
if (offTopic.length) {
  console.log(`   (지시와 무관해 제외 ${offTopic.length}건: ${offTopic.slice(0, 3).join(" / ")})`);
}
if (overQuota.length) {
  console.log(`   (주제 쿼터로 다음 회차로 미룸 ${overQuota.length}건: ${overQuota.slice(0, 3).join(" / ")})`);
  console.log(`   쿼터: ${Object.entries(QUOTA).map(([k, v]) => `${k} ${v}`).join(" · ")} — 한 갈래가 보드를 차지하지 않게 합니다`);
}
console.log(`   이번 회차 주제 배분: ${Object.entries(perTopic).map(([k, v]) => `${k} ${v}`).join(" · ") || "(없음)"}`);
