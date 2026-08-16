/**
 * 확정 처리 한 방 — 오너가 "확정할게" 라고 하면 이 스크립트 하나로 끝낸다.
 *
 * ── 왜 이 파일인가 (2026-07-31 오너 "확정안이 나오고 학습/기준변경/커밋/푸시를 단축어로 못 해?")
 * 확정 뒤에 해야 할 일이 매번 같은데 **매번 손으로** 했다: 재생산 → 검수 → 기록 → 기준값 →
 * 전수 점검 → 커밋. 순서가 같고 판단이 없으면 그건 스크립트가 할 일이다.
 * 빠뜨리기 쉬운 것도 여기 묶는다 — 특히 `pixel-baselines` 등록 여부 판단.
 *
 * 실행:
 *   node scripts/confirm.mjs estate-84 estate-59 metro-speed
 *   node scripts/confirm.mjs estate-84 --note "커버 없이 재업로드"
 *   node scripts/confirm.mjs estate-84 --no-commit      (커밋까지는 안 함)
 *
 * 푸시는 토큰이 필요하므로 이 스크립트가 하지 않는다 — 끝에 명령을 찍어 준다.
 *
 * ── 고정물 / 정기물 (이 스크립트의 핵심 판단)
 * 「픽셀 불변」은 **한 번 만들고 마는 카드**를 전제로 만든 규칙이다.
 * 실거래·증시처럼 **정기 수집으로 매달 다시 그려지는 카드**를 `pixel-baselines.json` 에 넣으면
 * 다음 수집일에 doctor 가 통째로 빨간불이 된다 — 데이터가 바뀌었으니 픽셀도 당연히 바뀐다.
 * 그래서 세트가 읽는 데이터셋이 **워크플로가 갱신하는 것**이면 기준값을 넣지 않고,
 * 확정 사실과 그 판본의 md5 만 `sets.json` 에 증거로 남긴다.
 * 정기물의 약속은 "픽셀이 안 바뀐다"가 아니라 **"같은 데이터면 같은 픽셀"**(결정성)이다.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
// --note 는 값을 하나 먹는다 — 그 값이 라벨로 오해되지 않게 건너뛴다(처음에 그렇게 죽었다)
const VALUE_FLAGS = new Set(["--note"]);
const labels = argv.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.has(argv[i - 1]));
const noCommit = argv.includes("--no-commit");
const noteIdx = argv.indexOf("--note");
const note = noteIdx >= 0 ? argv[noteIdx + 1] : "";
if (!labels.length) {
  console.log("사용법: node scripts/confirm.mjs <세트라벨...> [--note \"메모\"] [--no-commit]");
  process.exit(2);
}

const P = (p) => join(ROOT, p);
const readJson = (p) => JSON.parse(readFileSync(P(p), "utf8"));
const writeJson = (p, o) => writeFileSync(P(p), JSON.stringify(o, null, 2) + "\n");
const sh = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: opts.quiet ? "pipe" : "inherit", encoding: "utf8" });
  return r;
};
const die = (msg) => { console.log(`\n❌ ${msg}\n`); process.exit(1); };

/* ── 정기 갱신 데이터셋 목록: 워크플로가 손대는 경로를 **워크플로에서 읽어** 정한다.
 *    손으로 적으면 새 수집기가 생겼을 때 낡는다(affected-sets.mjs 와 같은 원칙). */
function autoRefreshedDatasets() {
  const dir = P(".github/workflows");
  const out = new Set();
  for (const f of readdirSync(dir)) {
    if (!/\.ya?ml$/.test(f)) continue;
    const src = readFileSync(join(dir, f), "utf8");
    // "git add data/datasets/..." 또는 --out ".../data/datasets/..." 처럼 **쓰는** 자리만 본다
    for (const m of src.matchAll(/(?:git add|--out)[^\n]*?(data\/datasets\/[A-Za-z0-9_./*-]+)/g)) {
      // 와일드카드 앞까지만 접두사로 쓴다. 단 `data/datasets/*.json` 처럼 **폴더 전체를 쓸어 담는**
      // 표현은 버린다 — 남기면 손으로 만든 데이터셋까지 '정기물'로 오인한다(지하철이 그랬다).
      const pre = m[1].split("*")[0].replace(/["'\\]/g, "");
      if (pre.length > "data/datasets/".length) out.add(pre);
    }
  }
  return [...out];
}
/** 빌더 소스에서 읽는 데이터 경로 (affected-sets.mjs 와 같은 방식) */
function depsOf(builder) {
  const p = P(builder.cmd);
  if (!existsSync(p)) return [];
  const hits = readFileSync(p, "utf8").match(/data\/(?:datasets|geo)\/[A-Za-z0-9_./-]*/g) || [];
  return [...new Set(hits)].filter((h) => (h.split("/")[2] || "").length > 0);
}

const sets = readJson("data/review/sets.json");
const builders = readJson("data/review/builders.json").builders || [];
const baselines = readJson("data/review/pixel-baselines.json");
const REFRESHED = autoRefreshedDatasets();
console.log(`🔁 정기 갱신 데이터셋: ${REFRESHED.join(", ") || "(없음)"}\n`);

const today = new Date().toISOString().slice(0, 10);
const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
const base = (c) => c.replace(/-p\d+$/, "");

const summary = [];
for (const label of labels) {
  const set = (sets.sets || []).find((s) => s.label === label);
  if (!set) die(`세트를 찾을 수 없습니다 — "${label}"`);
  const capName = set.caption || set.label;
  if (!existsSync(P(join("data/review/captions", capName + ".txt"))))
    die(`캡션이 없습니다 — ${capName}.txt. 올릴 글이 없으면 확정할 것도 없습니다`);

  console.log(`\n══════ ${label} 재생산·검수 ══════`);
  const r = sh("node", ["scripts/produce-card.mjs", label]);
  if (r.status !== 0) die(`${label} 재생산·검수 실패 — 확정하지 않습니다`);

  // 렌더 산출물의 md5 (render-sets 가 data/out 에 남긴 것을 쓴다)
  const mine = builders.filter(
    (b) => b.label === label || set.cards.some((c) => c.startsWith(b.label) || b.label.startsWith(base(c)))
  );
  const deps = [...new Set(mine.flatMap(depsOf))];
  const rolling = deps.filter((d) => REFRESHED.some((rf) => d.startsWith(rf) || rf.startsWith(d)));
  const isPeriodic = rolling.length > 0;

  const pngs = [];
  for (const slug of set.cards) {
    const days = readdirSync(P("data/out")).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse();
    for (const d of days) {
      const p = P(join("data/out", d, `${slug}-p1.png`));
      if (existsSync(p)) { pngs.push({ slug, path: p, md5: md5(p) }); break; }
    }
  }

  set.state = "오너 확정";
  set.confirmedAt = today;
  set.confirmedMd5 = pngs.map((x) => `${x.slug}:${x.md5.slice(0, 12)}`);
  /* 같은 메모를 두 번 붙이지 않는다 — 확정을 다시 돌리면 note 가 그대로 길어져
     다음 세션이 읽을 수 없는 줄이 된다(2026-08-16 에 같은 문장이 세 번 붙었다). */
  if (note && !(set.note ?? "").includes(note)) set.note = (set.note ? set.note + " / " : "") + note;

  if (isPeriodic) {
    set.pixelPolicy = `정기물 — ${rolling.join(",")} 갱신 시 다시 그려진다. pixel-baselines 에 넣지 않는다(같은 데이터면 같은 픽셀이라는 결정성으로 보증)`;
    console.log(`\n📌 ${label}: **정기물** (${rolling.join(", ")}) → 픽셀 기준값에 넣지 않습니다`);
    console.log(`   확정 판본 md5 는 sets.json 에 증거로 남겼습니다: ${set.confirmedMd5.join(" · ")}`);
  } else {
    for (const x of pngs) {
      const content = (readdirSync(P("data/content")).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse()
        .map((d) => `data/content/${d}/${x.slug}.json`).find((p) => existsSync(P(p)))) || "";
      const exist = baselines.cards.find((c) => c.png === `${x.slug}-p1.png`);
      const row = { label, title: set.title || label, state: "오너 확정", at: today,
        builder: mine[0]?.label ?? null, content, png: `${x.slug}-p1.png`, md5: x.md5 };
      if (exist) Object.assign(exist, row); else baselines.cards.push(row);
    }
    console.log(`\n📌 ${label}: **고정물** → 픽셀 기준값 ${pngs.length}건 등록(이후 md5 회귀 검사 대상)`);
  }
  summary.push({ label, isPeriodic, cards: pngs.length });
}

writeJson("data/review/sets.json", sets);
writeJson("data/review/pixel-baselines.json", baselines);

console.log("\n══════ 내보내기 전 검사(§0) ══════");
for (const [name, cmd, args] of [
  /* ⚠️ 순서가 중요하다 — 서명 검사가 **재생성보다 앞이면** 아무 의미가 없다.
     `build-foreign-rank`·`build-jeongbi-map` 등 몇몇 빌더가 캡션을 **통째로 다시 쓰는데**,
     그때 고정 서명이 딸려 나가지 않는다. 그래서 재생성 전에 통과한 검사가 재생성 직후
     깨지고, **다음 확정 시도가 매번 같은 자리에서 막혔다**(2026-08-16 실제로 두 번 막혔다).
     → 재생성을 먼저 하고, 그 뒤에 **붙이고(멱등)**, 그 다음에 **붙었는지 검사한다.** */
  ["전 카드 재생성·검수", "node", ["scripts/rebuild-cards.mjs"]],
  ["캡션 고정 서명 반영", "node", ["scripts/apply-signature.mjs"]],
  ["캡션 고정 서명 확인", "node", ["scripts/apply-signature.mjs", "--check"]],
  ["관제탑 화면 생성", "node", ["scripts/build-tower-site.mjs"]],
  ["관제탑 스모크", "node", ["scripts/smoke-tower.mjs"]],
  ["머리 규격 전수", "pnpm", ["-s", "--filter", "@wirit/renderer", "audit-head"]],
  ["픽셀 회귀·자가진단", "node", ["scripts/doctor.mjs"]],
]) {
  const r = sh(cmd, args, { quiet: true });
  const tail = (r.stdout || "").trim().split("\n").slice(-3).join("\n");
  console.log(`${r.status === 0 ? "✅" : "❌"} ${name}`);
  if (r.status !== 0) { console.log(tail); die(`${name} 실패 — 확정 기록은 남았지만 커밋하지 않습니다`); }
}

if (noCommit) { console.log("\n(--no-commit) 커밋하지 않았습니다."); process.exit(0); }

const msg = `확정: ${labels.join(", ")}${note ? ` (${note})` : ""}

${summary.map((s) => `- ${s.label}: ${s.isPeriodic ? "정기물 — 픽셀 기준값 제외(데이터 갱신 시 다시 그려짐)" : `고정물 — 픽셀 기준값 ${s.cards}건 등록`}`).join("\n")}

검사: rebuild-cards · smoke-tower · audit-head · doctor 전부 통과`;
sh("git", ["add", "-A"]);
const c = sh("git", ["-c", "commit.gpgsign=false", "commit", "-m", msg], { quiet: true });
console.log(c.status === 0 ? "\n✅ 커밋 완료" : `\n· 커밋할 변경 없음`);
console.log(`\n다음 — 푸시(토큰 필요):
  git push "https://x-access-token:$TOK@github.com/Changwon-Moon/claude.git" HEAD:$(git rev-parse --abbrev-ref HEAD)\n`);
