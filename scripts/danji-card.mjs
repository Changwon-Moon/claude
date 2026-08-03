/**
 * 원커맨드 — "새 조감도 사진과 함께 [단지명] 청약 위릿 카드 만들어줘" 한 방에.
 *
 * 오너가 자연어로 시키면 새 세션은 이 스크립트 하나만 돌리면 된다:
 *   청약홈 수집분에서 단지 찾기 → 데이터셋 항목 만들기/갱신 → 조감도 설치(원본 보존)
 *   → 카드 빌드 → 렌더 → 디자인 QA → **아직 사람이 채워야 할 칸** 보고.
 *
 * 실행:
 *   node scripts/danji-card.mjs "한강 푸르지오 리버프론트"
 *   node scripts/danji-card.mjs "한강 푸르지오" --photo ~/uploads/riverfront.jpg
 *   node scripts/danji-card.mjs 2026000367 --photo shot.jpg --hook "한강뷰"
 *   node scripts/danji-card.mjs "상동역 롯데캐슬" --no-render      # JSON 까지만
 *
 * ── 이 스크립트가 **하지 않는** 것 (오보 0)
 * 전용면적 구성·타입·분양가·동수·층수는 청약홈 API 가 주지 않는다. 지어내지 않고
 * **입주자모집공고문에서 사람이 채우도록 자리를 만들고 알려 준다.** 평형이 없으면 카드는
 * 나오지 않는다 — 빈 표를 조용히 그리는 것보다 못 그리는 편이 낫다.
 *
 * 기준 문서: docs/guides/청약분양-카드-기준.md (읽지 않고 손대지 말 것)
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const getArg = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const flag = (f) => argv.includes(f);
const VALUE_FLAGS = new Set(["--photo", "--hook", "--id", "--slug", "--date"]);
const query = argv.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.has(argv[i - 1])).join(" ").trim();

if (!query) {
  console.log(`사용법: node scripts/danji-card.mjs "<단지명 또는 공고번호>" [--photo <이미지>] [--hook "한강뷰"] [--id <슬러그>] [--no-render]`);
  process.exit(2);
}

const P = (p) => join(ROOT, p);
const readJson = (p) => JSON.parse(readFileSync(P(p), "utf8"));
const norm = (s) => String(s || "").replace(/[\s()]/g, "");
const die = (msg, hint) => { console.log(`\n❌ ${msg}${hint ? `\n   → ${hint}` : ""}\n`); process.exit(1); };

/* ── 1. 청약홈 수집분에서 단지를 찾는다 ─────────────────────────────
 * 사람이 이름을 정확히 칠 리 없으므로 공고번호 → 완전일치 → 부분일치 순으로 좁힌다.
 * 후보가 여럿이면 **고르지 않고 물어본다** — 잘못 고르면 남의 단지 숫자가 카드에 실린다. */
const LATEST = "data/datasets/applyhome-latest.json";
if (!existsSync(P(LATEST)))
  die("청약홈 수집 결과가 없습니다", "data/applyhome-queue.txt 에 한 줄 push 해서 수집을 먼저 돌리세요");
const notices = readJson(LATEST).notices || [];

const q = norm(query);
let hits = notices.filter((n) => n.pblancNo === query.trim());
if (!hits.length) hits = notices.filter((n) => norm(n.name) === q);
if (!hits.length) hits = notices.filter((n) => norm(n.name).includes(q) || q.includes(norm(n.name)));
if (!hits.length)
  die(
    `청약홈 최신 수집분(${notices.length}건)에 "${query}" 가 없습니다`,
    "접수가 끝나 목록에서 빠졌거나 아직 공고 전일 수 있습니다. data/applyhome-alert.txt 보드에서 이름을 확인하세요",
  );
if (hits.length > 1)
  die(
    `"${query}" 로 ${hits.length}곳이 잡힙니다 — 공고번호로 콕 집어 주세요`,
    hits.map((h) => `${h.pblancNo}  ${h.name}`).join("\n     "),
  );
const ah = hits[0];
console.log(`\n🏢 ${ah.name} (공고 ${ah.pblancNo})\n`);

/* ── 2. 데이터셋 항목 — 없으면 청약홈이 주는 것만으로 골격을 만든다 ── */
const DS = "data/datasets/bunyang-danji-2026.json";
const doc = readJson(DS);
let d = doc.danji.find((x) => x.applyhomeNo === ah.pblancNo);
const isNew = !d;

/** "경기도 김포시 고촌읍 향산리 588-45번지 일원" → "경기 김포시 고촌읍" (읍면동까지, 시도는 약칭) */
function shortAddr(addr) {
  const SIDO = { 서울특별시: "서울", 부산광역시: "부산", 대구광역시: "대구", 인천광역시: "인천", 광주광역시: "광주", 대전광역시: "대전", 울산광역시: "울산", 세종특별자치시: "세종", 경기도: "경기", 강원특별자치도: "강원", 강원도: "강원", 충청북도: "충북", 충청남도: "충남", 전북특별자치도: "전북", 전라북도: "전북", 전라남도: "전남", 경상북도: "경북", 경상남도: "경남", 제주특별자치도: "제주" };
  const t = String(addr || "").split(/\s+/).filter(Boolean);
  if (!t.length) return "";
  const head = SIDO[t[0]] || t[0];
  /* 읍·면·동까지만. 리·번지는 카드가 말할 일이 아니다. */
  const rest = t.slice(1).filter((x) => /(시|군|구|읍|면|동)$/.test(x)).slice(0, 2);
  return [head, ...rest].join(" ");
}

if (isNew) {
  const id = getArg("--id") || `ah-${ah.pblancNo}`;
  const slug = getArg("--slug") || `ah${ah.pblancNo}`;
  d = {
    id,
    slug,
    kind: "presale",
    name: ah.name,
    location: shortAddr(ah.address),
    applyhomeNo: ah.pblancNo,
    total: ah.supply,
    moveIn: ah.moveInYm || null,
    /* ── 아래는 청약홈이 주지 않는다. 입주자모집공고문에서 사람이 채운다 ── */
    buildings: null,
    topFloor: null,
    areas: [],
    company: ah.builder || undefined,
    source: {
      name: "한국부동산원 청약홈 입주자모집공고",
      via: "청약홈 API",
      url: ah.noticeUrl || undefined,
    },
  };
  doc.danji.push(d);
  console.log(`＋ 데이터셋에 새 항목을 만들었습니다 — id: ${id} (슬러그 ${slug})`);
} else {
  console.log(`· 데이터셋에 이미 있습니다 — id: ${d.id}`);
}
if (getArg("--hook")) d.hook = getArg("--hook");

/* ── 3. 조감도 설치 — 원본은 보존한다 ──
 * 크롭 위치는 여기서 정하지 않는다. 빌더가 **원본 크기에서 매번 다시 계산**한다(heroShift).
 * 사진마다 값이 다르므로, 손으로 옮겨 적는 순간 다음 사진에서 틀어진다. */
const photoArg = getArg("--photo");
if (photoArg) {
  const src = resolve(process.cwd(), photoArg);
  if (!existsSync(src)) die(`사진을 못 찾습니다: ${src}`);
  const ext = (extname(src) || ".jpg").toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) die(`JPEG/PNG 만 됩니다: ${ext}`);
  const file = `${d.id}${ext === ".jpeg" ? ".jpg" : ext}`;
  mkdirSync(P("templates/_shared/photos/_source"), { recursive: true });
  copyFileSync(src, P(`templates/_shared/photos/${file}`));
  copyFileSync(src, P(`templates/_shared/photos/_source/${file}`)); // 오너가 준 원본 보존
  d.photo = {
    file,
    credit: d.photo?.credit || `출처. ${(ah.builder || "").replace(/^\(주\)/, "") || "시공사"} 홈페이지`,
    provided: `${new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)} 오너 제공 · 원본은 templates/_shared/photos/_source/`,
  };
  console.log(`🖼  조감도 설치 — templates/_shared/photos/${file} (원본은 _source/ 에 보존)`);
} else if (!d.photo) {
  console.log("🖼  조감도 없음 — 대체 이미지로 그립니다. **카드에 노란 경고 뱃지가 뜨고, 그 상태로는 발행 금지입니다.**");
}

writeFileSync(P(DS), JSON.stringify(doc, null, 2) + "\n", "utf8");

/* ── 4. 아직 사람이 채워야 할 칸 ── */
const todo = [];
if (!d.areas?.length) todo.push("areas — 전용면적별 타입 구성 (예: [{\"m2\":84,\"types\":[\"A\",\"B\"]}, …])");
if (d.buildings == null) todo.push("buildings — 동수");
if (d.topFloor == null) todo.push("topFloor — 최고 층수");
if (!d.price?.byArea?.length) todo.push("price.byArea — 면적별 분양가 (예: [{\"m2\":84,\"won\":773000000}, …])");
if (!d.hook) todo.push('hook — 제목의 훅 한 단어 (예: "한강뷰") · --hook 으로도 줄 수 있습니다');

if (todo.length) {
  console.log(`\n📝 입주자모집공고문에서 채워야 할 칸 — data/datasets/bunyang-danji-2026.json 의 "${d.id}"`);
  for (const t of todo) console.log(`   · ${t}`);
  if (d.source?.url) console.log(`   공고문: ${d.source.url}`);
}

/* ── 5. 빌드 → 렌더 → 검수 ── */
const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", encoding: "utf8" });
const date = getArg("--date") || new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

console.log(`\n▶ 카드 빌드 (${date})`);
const built = spawnSync("node", [P("scripts/build-danji.mjs"), date, "--only", d.id], {
  cwd: ROOT, encoding: "utf8",
});
process.stdout.write(built.stdout || "");
if (built.status !== 0) {
  /* 빌더의 스택 대신 **왜 못 만드는지 한 줄**만 보여 준다 — 오너는 비개발자다. */
  const why = String(built.stderr || "").match(/Error: (.+)/);
  console.log(`\n⏸  아직 카드를 못 만듭니다${why ? ` — ${why[1]}` : ""}`);
  console.log(`   위 칸을 채운 뒤 다시 실행하세요:  node scripts/danji-card.mjs "${query}"\n`);
  process.exit(1);
}

const slug = d.slug || d.id.split("-")[0];
const cardJson = `data/out/_spike/danji-${slug}.json`;
if (flag("--no-render")) {
  console.log(`\n✅ 카드 JSON 까지 완료 — ${cardJson}\n`);
  process.exit(0);
}

console.log("\n▶ 렌더");
/* 렌더러는 자기 패키지 폴더에서 돌아 경로가 상대다 — 죽이지 않는다(로그를 죽이면 실패를 못 본다). */
if (sh("pnpm", ["--filter", "@wirit/renderer", "render", "--", "--data", `../../${cardJson}`, "--out", "../../data/out/_spike"]).status !== 0)
  die("렌더 실패 — 위 로그를 보세요");

console.log("\n▶ 디자인 검수");
if (sh("pnpm", ["-s", "--filter", "@wirit/renderer", "qa", cardJson]).status !== 0)
  die("디자인 검수 실패 — 위 항목을 고치세요");

console.log(`\n🎉 완료 — data/out/_spike/danji-${slug}-p1.png`);
console.log("\n발행 전 게이트(docs/guides/청약분양-카드-기준.md §5):");
console.log("   □ 분양가를 입주자모집공고문으로 대조했다 (청약홈 API 는 분양가를 주지 않습니다)");
console.log("   □ 조감도 미확보 경고 뱃지가 없다");
console.log("   □ pnpm --filter @wirit/renderer audit-head → 위반 0장");
console.log("   □ node scripts/doctor.mjs → 확정본 픽셀 동일\n");
