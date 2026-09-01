/**
 * 카톡 공유용 짧은 캡션 — 인스타 캡션과 **다른 물건**이다 (오너 2026-09-01 확정 B안).
 *
 *   node scripts/gen-kakao-caption.mjs --set singo-daily-2026-09-01
 *   node scripts/gen-kakao-caption.mjs --set <라벨> --areas "신도림,화곡,평촌,안양,동탄,병점,수원,부천중동"
 *
 * ── 왜 따로 만드나
 * 인스타 캡션은 **열다섯 줄 전부**를 싣는다(카드 한 장 한 장이 사실 확인 대상이라).
 * 카톡은 링크 미리보기 없이 **글자만으로** 눈에 들어와야 하고, 이미지가 글 **위**에 붙는다.
 * 그래서 앞 세 줄만 숫자로 세우고 나머지는 지역 이름으로 접는다. 화살표가 👆 인 이유도 그것이다.
 *
 * ── 확정된 틀 (오너 2026-09-01)
 *
 *   🔥 9/1 오늘의 신고가
 *
 *   1️⃣ 목동힐스테이트 23평 · 18.6억
 *   2️⃣ 철산주공13 33평 · 15.8억
 *   3️⃣ 광교호반베르디움 35평 · 15억
 *
 *   그 외 신도림 · 화곡 · 평촌 · 안양
 *   동탄 · 병점 · 수원 · 부천중동 👆
 *
 *   📊 1,000세대 이상 대단지 · 전용 59·84
 *      국토부 실거래 · 2020년 이후 기준
 *
 * ── ⚠️ 숫자는 코드가, **지역 이름은 사람이** 고른다
 * 앞 세 줄(단지명·평·금액)과 날짜·장수는 **카드 자신의 `meta` 에서** 꺼낸다 — 옮겨 적지 않는다.
 * 그런데 「그 외」 줄의 지역 이름은 행정구역으로 기계적으로 못 만든다. 오너가 고른 이름을 보면
 * 근거가 제각각이다:
 *
 *   신도림(구로구 구로동 — 단지명·역 쪽) · 화곡(강서구 화곡동 — 법정동) ·
 *   평촌(안양시동안구 관양·호계동 — 생활권 이름, 행정구역에 없다) ·
 *   동탄(화성시동탄구 반송동 — 구) · 부천중동(부천시 원미구 중동 — 시+동)
 *
 * **읽는 사람이 아는 이름**을 고른 것이지 자료에서 나온 이름이 아니다. 그래서 코드는
 * **후보를 나란히 찍어 주고**(법정동·구·시·역) 기본값 하나를 제안할 뿐이다.
 * 다르면 `--areas` 로 넘긴다 — 지어내지 않는다.
 *
 * 기본값 규칙(문서화해 둔다, 추측이 아니다):
 *   · 역 자료가 있으면 **역 이름에서 '역'을 뗀 것** — 사람들이 가장 많이 쓰는 이름이다
 *   · 없으면 **법정동에서 '동'을 뗀 것**
 * 이 규칙이 오너의 선택과 늘 같지는 않다. 그래서 **후보를 같이 찍는다.**
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const LABEL = arg("set");
const TOPN = Number(arg("top") ?? 3);
if (!LABEL) {
  console.error(`사용법: node scripts/gen-kakao-caption.mjs --set <세트라벨> [--areas "가,나,다"] [--top 3]`);
  process.exit(1);
}

const setsRaw = JSON.parse(readFileSync(P("data/review/sets.json"), "utf8"));
const sets = Array.isArray(setsRaw) ? setsRaw : setsRaw.sets;
const set = sets.find((s) => s.label === LABEL);
if (!set) {
  console.error(`⛔ 세트를 찾을 수 없습니다: ${LABEL}`);
  process.exit(1);
}

/** 카드 JSON 을 찾는다 — 가장 최근 날짜 폴더부터 */
const days = readdirSync(P("data/content"))
  .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
  .sort()
  .reverse();
const cards = [];
for (const slug of set.cards) {
  let found = null;
  for (const d of days) {
    const p = P(join("data/content", d, `${slug}.json`));
    if (existsSync(p)) {
      found = JSON.parse(readFileSync(p, "utf8"));
      break;
    }
  }
  if (!found) {
    console.error(`⛔ 카드 JSON 이 없습니다: ${slug} — 먼저 빌드하세요`);
    process.exit(1);
  }
  cards.push({ slug, doc: found });
}

const strip = (s) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* ── 날짜: 세트 라벨이 정본이다(카드 파일 날짜는 재생산일이라 다를 수 있다) */
const dm = /(\d{4})-(\d{2})-(\d{2})$/.exec(LABEL);
if (!dm) {
  console.error(`⛔ 세트 라벨에서 날짜를 못 읽었습니다: ${LABEL}`);
  process.exit(1);
}
const dateKo = `${Number(dm[2])}/${Number(dm[3])}`;

/* ── 앞 N 줄: 카드 meta 그대로 */
const NUM = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
/* 단지명만으로 어디인지 안 보이는 것이 있다 — 「주공13」은 철산·상계·둔촌 어디든 될 수 있다.
   카드 제목에는 지역을 안 붙이는 게 판형 규칙이지만(오너 2026-08-16b), 카톡은 카드가 아니라
   **한 줄로 읽히는 글**이라 지역이 붙어야 뜻이 선다. 오너가 09-01 에 「철산주공13」으로 고쳤다.
   ⚠️ 금액·평은 못 바꾼다 — 바꿀 수 있는 것은 **이름뿐**이다. */
const RENAME = new Map(
  (arg("rename") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const i = s.indexOf("=");
      return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
    }),
);
const top = cards.slice(0, TOPN).map((c, i) => {
  const t = strip(c.doc.title); // "주공13 33평"
  const m = /^(.+?)\s(\S*평)$/.exec(t);
  const name = m ? m[1] : t;
  const pyeong = m ? ` ${m[2]}` : "";
  return `${NUM[i]} ${RENAME.get(name) ?? name}${pyeong} · ${strip(c.doc.price)}`;
});

/* ── 「그 외」 지역 이름: 기본값 + 후보 */
const rest = cards.slice(TOPN);
const cand = rest.map((c) => {
  const r = c.doc.meta?.region ?? {};
  const stn = c.doc.meta?.station?.name ?? "";
  return {
    slug: c.slug,
    byStation: stn ? stn.replace(/역$/, "") : "",
    byUmd: (r.umd ?? "").replace(/동$/, ""),
    gu: r.gu ?? "",
    umd: r.umd ?? "",
    station: stn || "-",
  };
});
const dedupe = (xs) => [...new Set(xs.filter(Boolean))];
const auto = dedupe(cand.map((c) => c.byStation || c.byUmd));
const areas = arg("areas") ? arg("areas").split(",").map((s) => s.trim()).filter(Boolean) : auto;

/* 두 줄로 접는다 — 카톡에서 한 줄이 길면 가운데서 잘려 읽힌다 */
const half = Math.ceil(areas.length / 2);
const line1 = areas.slice(0, half).join(" · ");
const line2 = areas.slice(half).join(" · ");

const out = [
  `🔥 ${dateKo} 오늘의 신고가`,
  ``,
  ...top,
  ``,
  `그 외 ${line1}`,
  `${line2} 👆`,
  ``,
  `📊 1,000세대 이상 대단지 · 전용 59·84`,
  `   국토부 실거래 · 2020년 이후 기준`,
].join("\n");

const dir = P("data/review/captions/_kakao");
mkdirSync(dir, { recursive: true });
const outPath = join(dir, `${LABEL}.txt`);
writeFileSync(outPath, out + "\n");

console.log(out);
console.log(`\n→ ${outPath}`);

if (!arg("areas")) {
  console.log(`\n⚠️ 「그 외」 지역 이름은 **기본값**입니다(역 이름 → 없으면 법정동).`);
  console.log(`   읽는 사람이 아는 이름과 다르면 --areas 로 넘기세요. 후보:`);
  for (const c of cand)
    console.log(
      `   · ${c.slug.replace(/^singo-/, "").padEnd(34)} 역 ${String(c.station).padEnd(12)} 동 ${String(c.umd).padEnd(8)} 구/시 ${c.gu}`,
    );
}
