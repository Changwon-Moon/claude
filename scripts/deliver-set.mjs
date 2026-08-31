/**
 * 확정된 세트를 **JPG 로 바꿔 ZIP 한 개**로 묶는다 — 오너에게 넘기는 마지막 걸음.
 *
 *   node scripts/deliver-set.mjs --set singo-daily-2026-09-01
 *   node scripts/deliver-set.mjs --set <라벨> --out /절대경로/폴더
 *   node scripts/deliver-set.mjs --set <라벨> --draft      ← 확정 전에도 뽑는다(예외)
 *
 * ── 왜 (오너 2026-09-01)
 * *"작업은 항상 html로 먼저 만들고 확정 후 jpg로 작업해서 zip 파일로 올려주는 것으로
 *   작업 기준 변경해줘."*
 *
 * 그래서 한 세트의 걸음이 셋으로 굳었다:
 *   ① `preview-html.mjs` — PNG 전에 **HTML 한 장**으로 훑는다 (오너 2026-08-31)
 *   ② 오너 확정 → `confirm.mjs` — 이때 **PNG 의 md5 가 확정 증거**로 박힌다
 *   ③ 이 스크립트 — 그 **확정된 PNG 그대로** JPG 로 바꿔 ZIP 하나로 넘긴다
 *
 * ── ⚠️ PNG 를 버리지 않는다
 * 「픽셀 불변」의 증거는 PNG 의 md5 다(`sets.json` 의 `confirmedMd5`).
 * JPG 는 **전달용 사본**이고, 이 스크립트는 원본 PNG 를 건드리지 않는다.
 * 그래서 JPG 를 다시 뽑아도 확정 증거는 흔들리지 않는다.
 *
 * ── ⚠️ 확정 안 된 세트는 기본적으로 거절한다
 * 오너의 새 기준은 "확정 **후에** jpg" 다. 확정 전 JPG 가 돌아다니면 오너 손에
 * **두 판본**이 생기고, 인스타에 어느 것이 올라갔는지 아무도 모르게 된다.
 * 정말 필요하면 `--draft` 로 뽑되 파일명에 `_draft` 가 박힌다 — 조용히 섞이지 않는다.
 *
 * ── ⚠️ 확정 md5 와 다르면 멈춘다
 * `confirmedMd5` 가 있는데 지금 `data/out` 의 PNG 가 그것과 다르면 **그 사이에 카드가
 * 다시 그려진 것**이다. 그대로 넘기면 오너가 결재한 그림과 다른 것이 인스타에 올라간다.
 * 그래서 여기서 멈추고 무엇이 어긋났는지 말한다.
 *
 * ── 파일명 = 캐러셀 순서
 * `01_<슬러그>.jpg` · `02_…` — `sets.json` 의 `cards` 순서 그대로다(거래가 큰 순).
 * 오너는 ZIP 을 풀어 **번호 순서대로** 올리면 된다. 캡션은 같은 ZIP 안 `캡션.txt`.
 *
 * ── JPG 인코더는 사다리로 고른다
 * sharp → ImageMagick(convert) → 파이썬 PIL 순으로 있는 것을 쓴다. 셋 다 없으면 멈춘다.
 * **어느 것을 썼는지 매니페스트에 적는다** — 인코더가 다르면 JPG 바이트가 달라지는데,
 * 픽셀 증거는 PNG 쪽이라 문제가 되지 않지만 "왜 파일 크기가 다르지"에 답할 수 있어야 한다.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const has = (n) => process.argv.includes(`--${n}`);

const LABEL = arg("set");
const DRAFT = has("draft");
const QUALITY = Number(arg("quality") ?? 95);
if (!LABEL) {
  console.error(
    "사용법: node scripts/deliver-set.mjs --set <세트라벨> [--out <폴더>] [--draft] [--quality 95]",
  );
  process.exit(1);
}

const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");

/* ── ① 세트를 찾는다 */
const setsRaw = JSON.parse(readFileSync(P("data/review/sets.json"), "utf8"));
const sets = Array.isArray(setsRaw) ? setsRaw : setsRaw.sets;
const set = sets.find((s) => s.label === LABEL);
if (!set) {
  console.error(`⛔ 세트를 찾을 수 없습니다: ${LABEL}`);
  console.error(`   data/review/sets.json 에 등록된 라벨인지 보세요.`);
  process.exit(1);
}

/* ── ② 확정 게이트 — 오너의 새 기준이 여기 박혀 있다 */
const confirmed = String(set.state || "").includes("확정");
if (!confirmed && !DRAFT) {
  console.error(`⛔ 아직 오너 확정이 아닙니다 (state: ${set.state ?? "없음"}).`);
  console.error(`   새 작업 기준(오너 2026-09-01): **HTML 로 먼저 보고 → 확정 → 그다음 JPG**.`);
  console.error(`   먼저:  node scripts/preview-html.mjs --set ${LABEL}`);
  console.error(`   확정후: node scripts/confirm.mjs ${LABEL}`);
  console.error(`   그래도 지금 뽑아야 하면 --draft (파일명에 _draft 가 박힙니다).`);
  process.exit(1);
}

/* ── ③ 카드마다 가장 최근 렌더 PNG 를 찾는다 */
const days = existsSync(P("data/out"))
  ? readdirSync(P("data/out"))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse()
  : [];
const confirmedMap = new Map(
  (set.confirmedMd5 || []).map((s) => {
    const i = s.lastIndexOf(":");
    return [s.slice(0, i), s.slice(i + 1)];
  }),
);

const picked = [];
const missing = [];
const drifted = [];
for (const slug of set.cards) {
  let found = null;
  for (const d of days) {
    const p = P(join("data/out", d, `${slug}-p1.png`));
    if (existsSync(p)) {
      found = { slug, path: p, day: d, md5: md5(p) };
      break;
    }
  }
  if (!found) {
    missing.push(slug);
    continue;
  }
  const want = confirmedMap.get(slug);
  if (want && !found.md5.startsWith(want)) drifted.push({ slug, want, got: found.md5.slice(0, 12) });
  picked.push(found);
}

if (missing.length) {
  console.error(`⛔ 렌더된 PNG 가 없습니다 (${missing.length}장): ${missing.join(", ")}`);
  console.error(`   먼저 렌더하세요:  node scripts/produce-card.mjs ${LABEL}`);
  process.exit(1);
}
if (drifted.length) {
  console.error(`⛔ 확정된 그림과 지금 PNG 가 다릅니다 — 그 사이에 카드가 다시 그려졌습니다.`);
  for (const d of drifted) console.error(`   · ${d.slug}: 확정 ${d.want} → 지금 ${d.got}`);
  console.error(`   확정본을 그대로 내려면 그때의 자료로 다시 그리고,`);
  console.error(`   새 그림으로 낼 것이면 오너에게 **다시 확정을 받은 뒤** 이 명령을 부릅니다.`);
  process.exit(1);
}

/* ── ④ JPG 인코더 사다리 */
function pickEncoder() {
  try {
    req("sharp");
    return { name: "sharp", fn: sharpConvert };
  } catch {}
  if (spawnSync("convert", ["-version"], { stdio: "ignore" }).status === 0)
    return { name: "imagemagick", fn: imConvert };
  if (spawnSync("python3", ["-c", "import PIL"], { stdio: "ignore" }).status === 0)
    return { name: "pillow", fn: pilConvert };
  return null;
}

async function sharpConvert(src, dst) {
  const sharp = req("sharp");
  await sharp(src).jpeg({ quality: QUALITY, chromaSubsampling: "4:4:4" }).toFile(dst);
}
function imConvert(src, dst) {
  const r = spawnSync("convert", [src, "-quality", String(QUALITY), "-sampling-factor", "1x1", dst]);
  if (r.status !== 0) throw new Error(`convert 실패: ${r.stderr}`);
}
function pilConvert(src, dst) {
  const py = `from PIL import Image
im = Image.open(${JSON.stringify(src)}).convert("RGB")
im.save(${JSON.stringify(dst)}, "JPEG", quality=${QUALITY}, subsampling=0, optimize=True)`;
  const r = spawnSync("python3", ["-c", py]);
  if (r.status !== 0) throw new Error(`PIL 실패: ${r.stderr}`);
}

const enc = pickEncoder();
if (!enc) {
  console.error(`⛔ JPG 로 바꿀 도구가 하나도 없습니다 (sharp · ImageMagick · 파이썬 PIL).`);
  console.error(`   PNG 는 data/out/<날짜>/ 에 그대로 있으니 그걸 넘길 수는 있습니다.`);
  process.exit(1);
}

/* ── ⑤ 만든다 */
const OUTDIR = arg("out") ?? P("data/out/_deliver");
mkdirSync(OUTDIR, { recursive: true });
const stem = `${LABEL}${DRAFT ? "_draft" : ""}`;
const work = join(OUTDIR, stem);
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

const pad = (n) => String(n).padStart(2, "0");
const manifest = [];
for (let i = 0; i < picked.length; i++) {
  const c = picked[i];
  const name = `${pad(i + 1)}_${c.slug}.jpg`;
  await enc.fn(c.path, join(work, name));
  manifest.push({ n: i + 1, file: name, slug: c.slug, pngMd5: c.md5.slice(0, 12), renderedOn: c.day });
}

/* 캡션도 같이 넣는다 — 오너가 ZIP 하나만 열면 되게 */
const capName = set.caption || LABEL;
const capPath = P(`data/review/captions/${capName}.txt`);
if (existsSync(capPath)) writeFileSync(join(work, "캡션.txt"), readFileSync(capPath, "utf8"));
else console.log(`⚠️  캡션 파일이 없습니다: data/review/captions/${capName}.txt`);

/* 무엇을 넣었는지 적어 둔다 — 나중에 "이 ZIP 이 어느 확정본이었나"를 답할 수 있게 */
writeFileSync(
  join(work, "목록.txt"),
  [
    `${set.title || LABEL}`,
    `세트: ${LABEL} · 상태: ${set.state ?? "-"}${DRAFT ? " · ⚠️ 확정 전 초안" : ""}`,
    `장수: ${manifest.length}장 (캐러셀 순서 = 파일명 번호)`,
    `JPG 품질: ${QUALITY} · 인코더: ${enc.name}`,
    `원본 PNG 는 저장소 data/out/<날짜>/ 에 그대로 있습니다 — 픽셀 증거는 PNG 입니다.`,
    ``,
    ...manifest.map((m) => `${pad(m.n)}. ${m.file}   (PNG md5 ${m.pngMd5} · ${m.renderedOn})`),
  ].join("\n"),
);

const zipPath = join(OUTDIR, `${stem}.zip`);
rmSync(zipPath, { force: true });
const z = spawnSync("zip", ["-q", "-r", "-X", zipPath, stem], { cwd: OUTDIR });
if (z.status !== 0) {
  console.error(`⛔ zip 실패: ${z.stderr}`);
  process.exit(1);
}

console.log(`✅ ${manifest.length}장 → JPG(품질 ${QUALITY} · ${enc.name})`);
for (const m of manifest) console.log(`   ${pad(m.n)}. ${m.file}`);
console.log(`\n📦 ${zipPath}`);
console.log(`   (원본 PNG 는 그대로 둡니다 — 확정 증거는 PNG 의 md5 입니다)`);
