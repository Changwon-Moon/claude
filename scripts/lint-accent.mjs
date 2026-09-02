/**
 * 강조색 린트 — **브랜드 빨강·파랑을 흉내 낸 다른 색**을 찾아낸다.
 *
 * ── 왜 이 린트인가 (2026-09-02 오너 "블루, 레드 폰트 컬러들이 조금 기준하고 다른것 같은데")
 * 학군지 카드가 1급지 강조에 `#c8102e` 를 쓰고 있었다. 브랜드 레드는 `#E5484D` 다.
 * 나란히 놓으면 다른 색인데, 카드 한 장만 보면 "빨강이네" 하고 지나간다 —
 * 상단 캡션 20px 사고와 정확히 같은 종류다. 사람 눈이 못 잡는 자리는 자가 잡아야 한다.
 *
 * ── 무엇을 잡고 무엇을 봐주나
 * 팔레트 밖 색을 전부 잡으면 소용이 없다 — 41개 템플릿 중 33개가 걸린다.
 * 지하철 노선색(4호선 #00A5DE), 지도 면 색, 회색 계조는 **정당한 색**이다.
 * 그래서 **색상환에서 빨강·파랑 자리에 앉은 진한 색만** 본다. 즉
 * "강조색인 척하는 다른 빨강/파랑"만 잡고, 노선색·면색·회색은 건드리지 않는다.
 *
 * ── 이 린트와 렌더 검사의 관계 (둘 다 있어야 한다)
 * 이 린트는 **소스에 적힌 hex** 를 본다 — 카드를 만들기 전, 템플릿을 쓰는 자리에서 잡는다.
 * 실제로 나가는 색은 `audit-head` 가 **렌더된 픽셀**에서 전수로 다시 잰다(빌더가 넣는 색·
 * SVG 안의 색·계산된 색까지). 발행을 막는 쪽은 audit-head 이고, 이 린트는 그 앞의 빗자루다.
 *
 * 실행: node scripts/lint-accent.mjs [--strict]
 *   --strict 를 주면 위반이 있을 때 종료코드 1. 기본은 보고만 한다
 *   (옛 카드들은 픽셀 불변이라 못 고친다 — 새 카드가 따라가지 않게 보여 주는 것이 목적이다).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RED = "#e5484d", COBALT = "#2e6bff";

/** 팔레트를 손으로 적지 않는다 — 공용 CSS 에서 읽는다. */
function palette() {
  const css = readFileSync(join(ROOT, "templates/_shared/base.css"), "utf8");
  const get = (name) => (css.match(new RegExp(`--wirit-${name}:\\s*(#[0-9a-fA-F]{3,8})`)) || [])[1]?.toLowerCase();
  const red = get("red"), cobalt = get("cobalt");
  if (!red || !cobalt) throw new Error("_shared/base.css 에서 --wirit-red/--wirit-cobalt 를 못 읽었습니다.");
  if (red !== RED || cobalt !== COBALT)
    console.log(`ℹ️ 팔레트가 바뀌었습니다 — 레드 ${red} · 코발트 ${cobalt} (이 파일 상단 주석도 고치세요)`);
  return { red, cobalt };
}

const hex2rgb = (h) => {
  const s = h.slice(1);
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};

/** 색상(0~360)·채도·명도. 강조색인지 가리는 데만 쓴다. */
function hsl(hexStr) {
  const [r, g, b] = hex2rgb(hexStr).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  const l = (mx + mn) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return { h, s, l };
}

/** 강조색 자리에 앉은 진한 색인가 — 빨강(345~15°) / 파랑(215~245°) + 채도 0.45 이상 + 중간 명도 */
function accentKind(hexStr) {
  const { h, s, l } = hsl(hexStr);
  if (s < 0.45 || l < 0.18 || l > 0.78) return null;
  if (h >= 345 || h <= 15) return "레드";
  if (h >= 215 && h <= 245) return "코발트";
  return null;
}

const { red, cobalt } = palette();
const WANT = { 레드: red, 코발트: cobalt };

const targets = [];
for (const d of readdirSync(join(ROOT, "templates"))) {
  try { targets.push([`templates/${d}/template.html`, readFileSync(join(ROOT, "templates", d, "template.html"), "utf8")]); } catch { /* 템플릿 없음 */ }
}
for (const f of readdirSync(join(ROOT, "scripts/lib"))) {
  if (f.endsWith(".mjs")) targets.push([`scripts/lib/${f}`, readFileSync(join(ROOT, "scripts/lib", f), "utf8")]);
}

/** 주석은 색이 아니다 — 「예전에 #c8102e 였다」는 설명을 위반으로 세면 린트가 스스로를 잡는다. */
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

let bad = 0;
const rows = [];
for (const [path, raw] of targets) {
  const src = stripComments(raw);
  const hits = new Map();
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const h = m[0].toLowerCase();
    const kind = accentKind(h);
    if (!kind) continue;
    if (h === WANT[kind]) continue;                 // 규격 그대로면 통과
    hits.set(h, (hits.get(h) ?? 0) + 1);
  }
  if (hits.size) {
    bad += hits.size;
    rows.push([path, [...hits].map(([h, n]) => `${h}×${n} → ${WANT[accentKind(h)]}`).join(" · ")]);
  }
}

console.log(`\n🎨 강조색 린트 — 브랜드 레드 ${red} · 코발트 ${cobalt}`);
console.log("   (빨강·파랑 자리의 진한 색만 봅니다. 노선색·면색·회색은 대상이 아닙니다)\n");
if (!rows.length) console.log("   ✅ 흉내 낸 강조색 없음");
for (const [p, s] of rows) console.log(`   ❌ ${p}\n      ${s}`);
console.log(`\n대상 ${targets.length}개 · 위반 ${rows.length}개 파일 · 색 ${bad}가지\n`);
if (process.argv.includes("--strict") && rows.length) process.exit(1);
