/**
 * 완성본 저장소 — **실제로 인스타에 올라간 물건**을 저장소에 영구 보관한다.
 *
 * ── 왜 필요한가 (2026-07-27 오너 지시)
 * 오너는 카드를 직접 인스타에 올리고 계신데, 저장소에는 그 사실이 어디에도 없었다.
 * 그래서 시스템은 "아직 발행 0건"이라고 말했고 그건 **사실과 달랐다**.
 * 원인은 하나다 — **"내가 올렸다"를 기록할 자리가 없었다.**
 *
 * 이제 관제탑에서 [✅ 인스타에 올렸습니다]를 누르면
 *   ① data/publish-queue.md 의 그 줄이 `- [x]` 로 바뀌고
 *   ② 이 스크립트가 그 세트의 **실물(JPEG) + 캡션 + 근거**를 published/ 로 옮긴다.
 *
 * ── 왜 '색인'이 아니라 '실물'을 넣는가
 * data/out(PNG)·data/content(카드 JSON)는 용량 때문에 gitignore다 — 매 배포마다 다시 그린다.
 * 다시 그린 그림은 **오늘의 데이터**로 그려진 그림이지, 그때 올린 그림이 아니다.
 * 실거래가 갱신되면 지난달 카드의 숫자가 바뀐다. 그러면 "우리가 뭘 발행했는지"를
 * 영영 확인할 수 없다. 그래서 발행된 것만은 **그날의 픽셀 그대로** 커밋한다.
 *
 * ── 폴더 구조
 *   published/index.json                 발행 이력 색인 (관제탑이 읽는다)
 *   published/{발행일}-{label}/
 *     1.jpg 2.jpg …                      실제 올린 이미지(원본 해상도)
 *     caption.txt                        실제 올린 캡션
 *     meta.json                          제목·발행일·출처·검수 판정·카드 slug
 *
 * ── 결정성
 * 날짜는 **발행 대기열 줄에 적힌 오너의 발행일**에서 읽는다. 실행 시각을 쓰지 않는다.
 * 이미 있는 폴더는 건드리지 않는다(한 번 나간 물건은 다시 그리지 않는다).
 *
 * 실행: node scripts/archive-published.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "data/publish-queue.md");
const SETS = join(ROOT, "data/review/sets.json");
const REVIEW = join(ROOT, "data/review");
const RENDERS = join(ROOT, "data/out");
const PUB = join(ROOT, "published");

const norm = (s) => String(s || "").replace(/\s+/g, "").replace(/[·—\-*'"'()[\]🔥💸🏢⚠️🗺📉🚇🏆🎰👶🎓☕🧓🍗⏰🚶🏪]/gu, "").toLowerCase();

if (!existsSync(QUEUE) || !existsSync(SETS)) {
  console.log("발행 대기열 또는 세트 정의가 없습니다 — 건너뜁니다.");
  process.exit(0);
}
const sets = JSON.parse(readFileSync(SETS, "utf8")).sets || [];

/** `- [x] [26.07.27(월) 관제탑] **제목** · fmt · 원본 …` → {title, date} */
function parseDone(line) {
  const m = line.match(/^\s*-\s*\[[xX]\]\s*(.+)$/);
  if (!m) return null;
  const rest = m[1];
  const title = (rest.match(/\*\*(.+?)\*\*/) || [])[1];
  if (!title) return null;
  // 날짜 도장: 26.07.27(월) → 2026-07-27. 없으면 카드 렌더 날짜로 대체한다.
  const d = rest.match(/(\d{2})\.(\d{2})\.(\d{2})\(/);
  const date = d ? `20${d[1]}-${d[2]}-${d[3]}` : "";
  return { title: title.trim(), date };
}

const done = readFileSync(QUEUE, "utf8").split(/\r?\n/).map(parseDone).filter(Boolean);
if (!done.length) {
  // 옮길 건 없어도 색인은 갱신한다 — published/ 에 옛 꾸러미가 있으면 그것도 보여야 한다
  console.log("발행 완료로 체크된 줄이 없습니다 — 색인만 갱신합니다.");
  writeIndex();
  process.exit(0);
}

/** slug → 렌더된 PNG 경로들(장 순서). 날짜 폴더도 함께 돌려준다. */
function pagesOf(slug) {
  if (!existsSync(RENDERS)) return [];
  const out = [];
  for (const d of readdirSync(RENDERS).sort()) {
    let list = [];
    try {
      list = readdirSync(join(RENDERS, d));
    } catch {
      continue;
    }
    const pages = list
      .filter((f) => new RegExp(`^${slug}-p\\d+\\.png$`).test(f))
      .sort((a, b) => Number(a.match(/-p(\d+)/)[1]) - Number(b.match(/-p(\d+)/)[1]));
    for (const f of pages) out.push({ path: join(RENDERS, d, f), date: d });
  }
  return out;
}

/* 옮길 대상만 먼저 추린다 — 브라우저는 정말 필요할 때만 띄운다 */
const todo = [];
for (const row of done) {
  const set = sets.find((s) => norm(s.title).includes(norm(row.title)) || norm(row.title).includes(norm(s.title)));
  if (!set) {
    console.log(`::warning::세트 정의를 못 찾음 — "${row.title}" (data/review/sets.json 확인)`);
    continue;
  }
  const pages = set.cards.flatMap((slug) => pagesOf(slug));
  const date = row.date || pages[0]?.date || "";
  if (!date) {
    console.log(`::warning::발행일을 알 수 없음 — ${set.label}`);
    continue;
  }
  const dir = join(PUB, `${date}-${set.label}`);
  if (existsSync(join(dir, "meta.json"))) continue; // 이미 나간 물건은 다시 그리지 않는다
  if (!pages.length) {
    console.log(`::warning::렌더가 없어 보관 못 함 — ${set.label} (카드 재생성 필요)`);
    continue;
  }
  todo.push({ set, date, dir, pages });
}

if (!todo.length) {
  console.log(`✅ 완성본 저장소가 최신입니다 — 발행 ${done.length}건 모두 보관돼 있습니다.`);
  writeIndex();
  process.exit(0);
}

/* ── PNG → JPEG (렌더러의 Chromium 재사용 — 인스타가 받는 형식과 같게) ── */
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const { chromium } = require("playwright-core");
const PINNED = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const browser = await chromium.launch(existsSync(PINNED) ? { executablePath: PINNED } : {});
const page = await browser.newPage();

const TO_JPEG = `(src) => new Promise((resolve) => {
  const im = new Image();
  im.onload = () => {
    const c = document.createElement("canvas");
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext("2d");
    if (!g) return resolve("");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(im, 0, 0);
    resolve(c.toDataURL("image/jpeg", 0.92));
  };
  im.onerror = () => resolve("");
  im.src = src;
})`;

for (const { set, date, dir, pages } of todo) {
  mkdirSync(dir, { recursive: true });
  const files = [];
  for (let i = 0; i < pages.length; i++) {
    const b64 = readFileSync(pages[i].path).toString("base64");
    const jpeg = await page.evaluate(`(${TO_JPEG})(${JSON.stringify("data:image/png;base64," + b64)})`);
    if (!jpeg) {
      console.log(`::warning::JPEG 변환 실패 — ${pages[i].path}`);
      continue;
    }
    writeFileSync(join(dir, `${i + 1}.jpg`), Buffer.from(jpeg.split(",")[1], "base64"));
    files.push(`${i + 1}.jpg`);
  }

  const capName = set.caption || set.label;
  const capPath = join(REVIEW, "captions", `${capName}.txt`);
  const caption = existsSync(capPath) ? readFileSync(capPath, "utf8").trim() : "";
  if (caption) writeFileSync(join(dir, "caption.txt"), caption + "\n", "utf8");

  const revPath = join(REVIEW, `${set.review || set.label}.json`);
  let review = null;
  try {
    const r = JSON.parse(readFileSync(revPath, "utf8"));
    review = { verdict: r.verdict || "", summary: r.summary || "" };
  } catch {
    /* 검수 리포트가 없으면 비운다 */
  }

  writeFileSync(
    join(dir, "meta.json"),
    JSON.stringify(
      {
        _: "실제로 인스타에 올라간 물건의 사본. 손으로 고치지 말 것 — 이게 '무엇을 발행했는가'의 유일한 증거다.",
        label: set.label,
        title: set.title,
        publishedAt: date,
        pages: files.length,
        files,
        caption,
        captionChars: caption.length,
        cards: set.cards,
        review,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(`📦 보관 — ${date} · ${set.title} (${files.length}장${caption ? ` · 캡션 ${caption.length}자` : ""})`);
}

await browser.close();
writeIndex();

/**
 * published/index.json — 관제탑이 "무엇을 언제 발행했나"를 읽는 자리.
 *
 * ⚠️ published/ 에는 **두 종류**가 섞여 있다. 섞어서 세면 또 거짓말이 된다:
 *   ① meta.json 이 있는 폴더 = 오너가 [✅ 올렸습니다]를 눌러 만든 것 → **발행 확인됨**
 *   ② meta.json 이 없는 옛 폴더 = 이전 세션이 **업로드용으로 손수 만들어 둔 것**.
 *      README 에 "발행 시: 인스타 자르기…" 같은 안내가 있는, 넘겨주기 위한 꾸러미다.
 *      실제로 올라갔는지는 **오너만 안다** → confirmed:false 로 정직하게 표시한다.
 */
function writeIndex() {
  mkdirSync(PUB, { recursive: true });
  const posts = [];
  for (const d of readdirSync(PUB).sort().reverse()) {
    let stat;
    try {
      stat = statSync(join(PUB, d));
    } catch {
      continue;
    }
    if (!stat.isDirectory()) continue;

    const metaPath = join(PUB, d, "meta.json");
    if (existsSync(metaPath)) {
      try {
        const m = JSON.parse(readFileSync(metaPath, "utf8"));
        posts.push({
          dir: d,
          label: m.label,
          title: m.title,
          publishedAt: m.publishedAt,
          pages: m.pages,
          captionChars: m.captionChars || 0,
          verdict: m.review?.verdict || "",
          confirmed: true,
        });
        continue;
      } catch {
        console.log(`::warning::meta.json 을 못 읽음 — ${d}`);
      }
    }

    // 옛 꾸러미 — 폴더 이름의 날짜와 README 첫 제목으로 최소 정보만 읽는다
    let files = [];
    try {
      files = readdirSync(join(PUB, d));
    } catch {
      continue;
    }
    const imgs = files.filter((f) => /\.(png|jpe?g)$/i.test(f) && !f.startsWith("_"));
    if (!imgs.length) continue;
    let title = d;
    const readme = join(PUB, d, "README.md");
    if (existsSync(readme)) {
      const h = readFileSync(readme, "utf8").split(/\r?\n/).find((l) => l.startsWith("# "));
      if (h) title = h.replace(/^#\s*/, "").replace(/^\d{4}-\d{2}-\d{2}\s*·\s*/, "").trim();
    }
    const dm = d.match(/^(\d{4}-\d{2}-\d{2})/);
    posts.push({
      dir: d,
      label: "",
      title,
      publishedAt: dm ? dm[1] : "",
      pages: imgs.length,
      captionChars: 0,
      verdict: "",
      confirmed: false, // 업로드용으로 만들어 둔 것 — 실제 발행 여부는 오너만 안다
    });
  }
  const yes = posts.filter((p) => p.confirmed).length;
  writeFileSync(
    join(PUB, "index.json"),
    JSON.stringify(
      {
        _: "발행 이력 — scripts/archive-published.mjs 가 만든다. 손으로 고치지 말 것.",
        _confirmed: "confirmed:true = 오너가 [✅ 올렸습니다]를 누른 건. false = 업로드용으로 만들어만 둔 옛 꾸러미.",
        total: posts.length,
        confirmed: yes,
        posts,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(`🗂  완성본 저장소 — 발행 확인 ${yes}건 · 업로드용 꾸러미 ${posts.length - yes}건`);
}
