#!/usr/bin/env node
/**
 * 📱 모바일용 **묶음 JPG** — 카드 여러 장을 한 장에 모은다 (오너 2026-09-23)
 *
 * > 오너: *"jpg로 보여줘야 모바일에서 볼수있어. 여러장 한 사진에, 알지?"*
 *
 * ── 왜 만드나
 * 초안을 HTML 한 장으로 보내던 방식(§0-A)은 **데스크톱 기준**이었다. 오너는 폰에서 본다.
 * 폰에서 HTML 첨부는 열기 번거롭고, 낱장 JPG 열댓 장은 넘기다 지친다.
 * **4장을 한 장에** 붙이면 한 화면에서 제목·금액·곡선이 다 보이고, 서너 번만 넘기면 끝난다.
 *
 * ⚠️ 이건 **보기용**이다. 발행본은 여전히 확정된 PNG → `deliver-set` 의 낱장 JPG 다.
 *    묶음 JPG 로 인스타에 올리지 않는다(카드 한 장이 게시물 한 장이다).
 *
 * ── 쓰는 법
 *   node scripts/sheet-jpg.mjs --set singo-daily-2026-09-23
 *   node scripts/sheet-jpg.mjs --set <라벨> --per 4 --out /mnt/user-data/outputs --tag 초안
 *
 * `--per` 는 한 장에 넣을 카드 수(기본 4 · 2열로 깐다). `--tag` 는 파일 이름에 붙는 꼬리표.
 *
 * ⚠️ **확정 전에 보낼 때는 `--tag 초안`** 처럼 표시를 남긴다. 확정 전 그림이 표시 없이
 *    돌아다니면 오너 손에 두 판본이 생긴다(`deliver-set --draft` 가 `_draft` 를 박는 것과 같은 이유).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const P = (...p) => join(ROOT, ...p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const LABEL = arg("set");
const PER = Number(arg("per") ?? 4);
const OUT = arg("out") ?? P("data/out/_sheet");
const TAG = arg("tag") ?? "";

if (!LABEL) {
  console.error("사용법: node scripts/sheet-jpg.mjs --set <세트라벨> [--per 4] [--out <폴더>] [--tag 초안]");
  process.exit(1);
}

const S = JSON.parse(readFileSync(P("data/review/sets.json"), "utf8"));
const sets = S.sets ?? S;
const set = sets.find((x) => x.label === LABEL);
if (!set) {
  console.error(`⛔ sets.json 에 ${LABEL} 이 없습니다.`);
  process.exit(1);
}
const cards = set.cards ?? [];
if (!cards.length) {
  console.error(`⛔ ${LABEL} 에 카드가 없습니다.`);
  process.exit(1);
}

/* 카드마다 **가장 최근에 그린 PNG** 를 찾는다 — 날짜 폴더를 최신부터 훑는다.
   (deliver-set 과 같은 규칙이다. 다른 규칙을 쓰면 둘이 다른 그림을 넘기게 된다.) */
const days = existsSync(P("data/out"))
  ? readdirSync(P("data/out")).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse()
  : [];
const pngOf = (slug) => {
  for (const d of days) {
    const p = P("data/out", d, `${slug}-p1.png`);
    if (existsSync(p)) return p;
  }
  return null;
};

const missing = cards.filter((c) => !pngOf(c));
if (missing.length) {
  console.error(`⛔ 아직 안 그린 카드가 있습니다: ${missing.join(", ")}\n   먼저: node scripts/produce-card.mjs ${LABEL}`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

/* 붙이는 일은 파이썬(Pillow)이 한다 — 저장소에 이미 있고, 렌더러(Playwright)를 또 띄우지 않는다. */
const py = `
import sys, json
from PIL import Image
paths = json.loads(sys.argv[1]); out = sys.argv[2]; per = int(sys.argv[3]); tag = sys.argv[4]; label = sys.argv[5]
W, gap = 1000, 24
made = []
for i in range(0, len(paths), per):
    chunk = paths[i:i+per]
    ims = []
    for p in chunk:
        im = Image.open(p).convert("RGB")
        ims.append(im.resize((W, int(im.size[1] * W / im.size[0]))))
    ch = max(im.size[1] for im in ims)
    cols = 1 if per == 1 else 2
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (W*cols + gap*(cols+1), ch*rows + gap*(rows+1)), "#ffffff")
    for k, im in enumerate(ims):
        r, c = divmod(k, cols)
        sheet.paste(im, (gap + c*(W+gap), gap + r*(ch+gap)))
    name = f"{label}{'-' + tag if tag else ''}-{i//per+1}.jpg"
    fp = f"{out}/{name}"
    sheet.save(fp, "JPEG", quality=88, optimize=True)
    made.append(fp)
print("\\n".join(made))
`;

const files = execFileSync("python3", ["-c", py, JSON.stringify(cards.map(pngOf)), OUT, String(PER), TAG, LABEL], {
  encoding: "utf8",
}).trim().split("\n");

console.log(`📱 묶음 JPG ${files.length}장 (카드 ${cards.length}장 · 한 장에 ${PER}장)`);
for (const f of files) console.log(`   ${f}`);
if (!TAG && !String(set.state ?? "").includes("확정")) {
  console.log(`\n⚠️ 이 세트는 아직 확정이 아닙니다 — 오너에게 보낼 때는 --tag 초안 으로 표시를 남기세요.`);
}
