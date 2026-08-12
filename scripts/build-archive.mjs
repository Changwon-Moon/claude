/**
 * 보관함 인덱스 — 완성된 작업물을 한 곳에 모으고 주제별로 자동 정리한다.
 *
 * ── 왜 필요한가
 * 완성된 카드가 data/content, data/out, data/review/captions, data/review/sets.json 에
 * 흩어져 있다. "지난번 지하철 카드 캡션 어디 있지?"를 매번 뒤져야 했다.
 * 여기서 하나의 색인(data/archive/index.json)으로 묶어 관제탑 보관함 탭이 그걸 읽는다.
 *
 * ── 폴더링 기준: 주제
 * 소재 보드의 주제(research/ideas.json 의 topic)를 1순위로 쓰고,
 * 매칭되는 소재가 없으면 세트 label 앞자락에서 계열을 유추한다(estate-*, metro-*, index-* …).
 * 사람이 새 주제를 만들 필요 없이, 만들던 대로 만들면 알아서 모인다.
 *
 * ── 파일을 옮기지 않는 이유
 * data/out(PNG)·data/content(JSON)는 용량 때문에 저장소에 없다(gitignore).
 * 실물을 복사해봐야 커밋되지 않으므로, **어디에 무엇이 있는지의 색인**을 만드는 게
 * 저장소에 남는 유일하게 정직한 정리다. 색인만 있으면 언제든 다시 그릴 수 있다.
 *
 * 실행: node scripts/build-archive.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REVIEW = join(ROOT, "data/review");
const CONTENT = join(ROOT, "data/content");
const OUT = join(ROOT, "data/out");
const ARCHIVE = join(ROOT, "data/archive");

/**
 * 저장소(git)에 실제로 들어 있는 파일 목록.
 *
 * ⚠️ 이걸 안 보면 안 되는 이유(2026-07-26 오너 보고: "눌러도 안 뜨네"):
 * data/content(카드 JSON)·data/out(PNG)은 용량 때문에 gitignore다 → GitHub에 없다.
 * 그런데도 보관함이 그 경로로 링크를 걸어서 전부 404였다.
 * **없는 파일에는 링크를 걸지 않는다** — 링크가 있으면 열려야 한다.
 */
let TRACKED = new Set();
try {
  const out = execFileSync("git", ["ls-files", "data", "research"], { cwd: ROOT, encoding: "utf8" });
  TRACKED = new Set(out.split("\n").filter(Boolean));
} catch {
  /* git이 없으면 링크를 보수적으로 비운다 */
}
const inRepo = (p) => TRACKED.has(p);

const read = (p, fb = null) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};

const sets = (read(join(REVIEW, "sets.json"), { sets: [] }) || { sets: [] }).sets || [];
const ideasDoc = read(join(ROOT, "research/ideas.json"), { cats: [], ideas: [] }) || { cats: [], ideas: [] };
const ideas = ideasDoc.ideas || [];

/** 계열 접두사 → 주제. 소재 분류로 못 찾을 때의 안전망. */
const FAMILY = [
  [/^estate|^maprank|^tohuh|^singoga|^apt/, "부동산"],
  [/^metro/, "교통·생활"],
  [/^index|^market/, "증시·경제"],
  [/^salary|^avg-salary|^years-to-buy|^payslip/, "돈·연봉"],
];

const norm = (s) => String(s || "").replace(/\s+/g, "").replace(/[·—\-'"']/g, "").toLowerCase();

/** 세트 → 주제. ① 제목이 겹치는 소재의 topic ② 계열 접두사 ③ 기타
 *
 * ⚠️ 소재의 cat(분류)을 쓰면 안 된다. 2026-07-27부터 cat은 **주제가 아니라 발행 주기**다
 *    (데일리/주간/월간…). 그걸 폴더 이름으로 쓰면 보관함이 '🔁 정기 · 월간' 같은
 *    쓸모없는 칸으로 묶인다. 주제는 소재의 topic 필드가 맡는다. */
function topicOf(set) {
  const n = norm(set.title);
  for (const i of ideas) {
    const m = norm(i.title);
    if (!m) continue;
    if ((n.includes(m) || m.includes(n)) && i.topic) return i.topic;
  }
  for (const [re, label] of FAMILY) if (re.test(set.label)) return label;
  return "기타";
}

/** 카드 JSON이 실제로 어느 날짜 폴더에 있는지 찾는다(없으면 null) */
function locate(slug) {
  if (!existsSync(CONTENT)) return null;
  for (const d of readdirSync(CONTENT)) {
    try {
      if (!statSync(join(CONTENT, d)).isDirectory()) continue;
    } catch {
      continue;
    }
    const f = join(CONTENT, d, `${slug}.json`);
    if (existsSync(f)) {
      const pngs = [];
      for (let i = 1; i <= 10; i++) {
        const p = join(OUT, d, `${slug}-p${i}.png`);
        if (!existsSync(p)) break;
        pngs.push(`data/out/${d}/${slug}-p${i}.png`);
      }
      return { date: d, content: `data/content/${d}/${slug}.json`, pngs };
    }
  }
  return null;
}

/** 발행 대기열에서 이 세트의 상태를 읽는다: 대기/발행됨/미승인 */
function publishState(title) {
  const q = join(ROOT, "data/publish-queue.md");
  if (!existsSync(q)) return "미승인";
  const n = norm(title);
  for (const line of readFileSync(q, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*\[([ xX])\]\s*(.+)$/);
    if (!m) continue;
    const t = norm((m[2].match(/\*\*(.+?)\*\*/) || [, m[2]])[1]);
    if (t.includes(n) || n.includes(t)) return m[1].toLowerCase() === "x" ? "발행됨" : "발행 대기";
  }
  return "미승인";
}

const works = [];
for (const set of sets) {
  const locs = set.cards.map(locate).filter(Boolean);
  const capName = set.caption || set.label;
  const capPath = join(REVIEW, "captions", `${capName}.txt`);
  const revPath = join(REVIEW, `${set.review || set.label}.json`);
  const rev = existsSync(revPath) ? read(revPath) : null;

  works.push({
    label: set.label,
    title: set.title,
    topic: topicOf(set),
    date: locs.length ? locs.map((l) => l.date).sort().pop() : "",
    cards: set.cards.length,
    pages: locs.reduce((a, l) => a + l.pngs.length, 0),
    state: publishState(set.title),
    /* sets.json 의 제작 상태(시안·오너 확정·발행 승인…). 위 state 는 **발행** 상태라
       뜻이 다르다 — 둘을 합치면 "그림이 됐나"와 "올렸나"가 섞인다(2026-08-12).
       관제탑은 이 값으로 시안을 가려내 삭제 버튼을 붙인다. */
    setState: set.state || "",
    // 링크로 걸 파일 = 저장소에 실제로 있는 것만. 나머지는 경로만 안내한다.
    files: {
      content: locs.map((l) => l.content).filter(inRepo),
      png: locs.flatMap((l) => l.pngs).filter(inRepo),
      caption: existsSync(capPath) && inRepo(`data/review/captions/${capName}.txt`)
        ? `data/review/captions/${capName}.txt` : "",
      review: existsSync(revPath) && inRepo(`data/review/${set.review || set.label}.json`)
        ? `data/review/${set.review || set.label}.json` : "",
    },
    // 저장소에 없는(=매번 다시 그리는) 산출물의 경로 — 링크가 아니라 정보로 보여준다
    rebuilt: {
      content: locs.map((l) => l.content).filter((p) => !inRepo(p)),
      png: locs.flatMap((l) => l.pngs).filter((p) => !inRepo(p)),
    },
    verdict: rev?.verdict || "",
    reviewSummary: rev?.summary || "",
    // 캡션 전문 — 보관함에서 바로 읽고 복사해 쓸 수 있어야 한다
    caption: existsSync(capPath) ? readFileSync(capPath, "utf8").trim() : "",
    captionChars: existsSync(capPath) ? readFileSync(capPath, "utf8").trim().length : 0,
  });
}

// 주제별로 묶고, 각 주제 안에서는 최근 것부터
const byTopic = new Map();
for (const w of works) {
  if (!byTopic.has(w.topic)) byTopic.set(w.topic, []);
  byTopic.get(w.topic).push(w);
}
const folders = [...byTopic.entries()]
  .map(([topic, items]) => ({
    topic,
    count: items.length,
    items: items.sort((a, b) => (a.date < b.date ? 1 : -1)),
  }))
  .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic, "ko"));

mkdirSync(ARCHIVE, { recursive: true });
const index = {
  _: "완성 작업물 색인 — scripts/build-archive.mjs 가 만든다. 손으로 고치지 말 것(다음 실행에 덮어씀).",
  total: works.length,
  folders,
};
writeFileSync(join(ARCHIVE, "index.json"), JSON.stringify(index, null, 2) + "\n", "utf8");

console.log(`🗄 보관함 색인 — 작업물 ${works.length}건 / 주제 ${folders.length}개`);
for (const f of folders) {
  console.log(`   ${f.topic} (${f.count})`);
  for (const it of f.items) console.log(`     · ${it.title} — ${it.state}${it.pages ? ` · ${it.pages}장` : ""}`);
}
