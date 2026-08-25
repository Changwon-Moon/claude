/**
 * 「오늘의 신고가」 하루치를 **캐러셀 한 게시물**로 묶는다.
 *
 *   node scripts/singo-daily-set.mjs [--date 2026-08-25] [--max 20]
 *
 * ── 왜 (2026-08-25 오너)
 * *"지금은 관제탑에 각각의 컨텐츠로 표기되는데, 하루에 제작되는 카드들은 1개로 묶어서 올리도록."*
 *
 * 그날 15장을 만들면 관제탑 결재함에 **티켓이 15개** 뜬다. 오너는 같은 소재를 열다섯 번
 * 결재하게 되고, 인스타에도 열다섯 번 올려야 한다. 하루치 신고가는 **한 편의 소식**이다.
 *
 * ── 무엇이 바뀌나
 * 관제탑의 묶음 단위는 원래부터 `sets.json` 의 **세트**다(`setLead` 만 티켓이 된다).
 * 그러니 판형도 관제탑 코드도 손댈 필요가 없다 — **세트를 어떻게 짜느냐**의 문제였다.
 *   · 전:  카드 1장 = 세트 1개 = 티켓 1개  (15장 → 티켓 15개)
 *   · 후:  하루 = 세트 1개 = 티켓 1개      (15장 → 티켓 1개, 캐러셀 15장)
 *
 * ── 순서 = 캐러셀 장 번호
 * **거래가 큰 순.** 첫 장이 표지가 되므로 그날 가장 센 소식이 앞에 서야 한다.
 *
 * ── ⚠️ 캐러셀 상한
 * 인스타그램 캐러셀은 **20장**이다. 넘치면 상위 20장만 싣고 **뺀 것을 반드시 말한다** —
 * 조용히 자르면 "다 실었다"로 읽힌다(CARD_CHECKLIST: 「no silent caps」).
 *
 * ── ⚠️ 캡션도 하나로 합친다
 * 개별 캡션 15개는 그대로 두되(카드별 사실 확인에 쓰인다) 세트가 읽는 것은 묶음 캡션이다.
 * 캡션 검수(`captionNumberMatch`)는 **세트의 모든 카드**를 놓고 금액을 대조하므로,
 * 묶음 캡션에 열다섯 단지의 값을 적어도 그대로 검증된다.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const DATE = arg("date") ?? new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
/** 인스타 캐러셀 상한. 넘으면 상위 N 장만 싣고 뺀 것을 말한다. */
const MAX = Number(arg("max") ?? 20);

const contentDir = R(`data/content/${DATE}`);
if (!existsSync(contentDir)) {
  console.error(`⛔ ${DATE} 에 만든 카드가 없습니다: data/content/${DATE}/`);
  process.exit(1);
}

/* ── ① 그날 **새로 드러난** 신고가 카드를 모은다
 *
 * ⚠️ `data/content/{날짜}/` 를 그대로 쓰면 안 된다. 그 폴더에는 **그날 재생산된 모든 카드**가
 *    있다 — 지난주에 확정한 광명한진타운·서초포레스타2도 매일 다시 그려져 거기 앉아 있다.
 *    처음에 그렇게 짰다가 8/16·8/14 소재까지 오늘 캐러셀에 실렸다(2026-08-25 실측).
 *
 * 옳은 열쇠는 **판정일**이다 — `meta.provenance` 의 `singo-log: {날짜} 판정`.
 * 그게 이 카드가 **그날 새로 드러난 건**임을 말하는 유일한 값이다.
 *
 * ⚠️ 그리고 **세트가 없는 카드는 뺀다.** 중계주공5·가산두산위브처럼 그림이 안 돼 세트에서
 *    내린 카드도 파일은 남아 있다. 세트에서 내린 것은 "안 내보낸다"는 뜻이므로 여기서도 뺀다. */
const setsPathEarly = R("data/review/sets.json");
const setsRawEarly = JSON.parse(readFileSync(setsPathEarly, "utf8"));
const setsEarly = Array.isArray(setsRawEarly.sets) ? setsRawEarly.sets : setsRawEarly;
const inSomeSet = new Set(setsEarly.flatMap((s) => s.cards ?? []));

const cards = [];
for (const f of readdirSync(contentDir).filter((f) => f.endsWith(".json"))) {
  const j = JSON.parse(readFileSync(join(contentDir, f), "utf8"));
  if (j.template !== "singo-record@1") continue;
  const slug = f.replace(/\.json$/, "");
  const foundOn = (j.meta?.provenance ?? [])
    .map((x) => /singo-log:\s*(\d{4}-\d{2}-\d{2})/.exec(String(x))?.[1])
    .find(Boolean);
  if (foundOn !== DATE) continue; // 그날 드러난 건이 아니다
  if (!inSomeSet.has(slug)) {
    console.warn(`   ⓘ ${slug} — 세트에 없어 뺍니다(내려진 카드)`);
    continue;
  }
  /* 정렬 열쇠는 **만원 단위 원값**이다. "15.95억" 같은 표시값을 파싱해 정렬하면
     10억과 9.9억이 문자열로 뒤집힌다. meta 에 원값이 있으면 그걸 쓴다. */
  const manwon =
    j.meta?.prevPeak && j.price
      ? Math.round(Number(String(j.price).replace(/[^\d.]/g, "")) * 10000)
      : 0;
  cards.push({ slug, doc: j, manwon });
}
if (!cards.length) {
  console.error(
    `⛔ ${DATE} 에 **그날 드러난** 신고가 카드가 없습니다.\n` +
      `   (판정일은 카드의 meta.provenance 의 "singo-log: 날짜 판정" 입니다 —\n` +
      `    그날 폴더에 있는 것과 그날 드러난 것은 다릅니다.)`,
  );
  process.exit(1);
}
cards.sort((a, b) => b.manwon - a.manwon);

const kept = cards.slice(0, MAX);
const dropped = cards.slice(MAX);
if (dropped.length) {
  console.warn(
    `⚠️ 캐러셀 상한 ${MAX}장을 넘어 ${dropped.length}장을 뺐습니다 — ` +
      dropped.map((c) => c.slug.replace(/^singo-/, "")).join(", "),
  );
}

/* ── ② 묶음 캡션 */
const strip = (s) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const label = `singo-daily-${DATE}`;
const md = Number(DATE.slice(5, 7));
const dd = Number(DATE.slice(8, 10));

const rows = kept.map((c, i) => {
  const t = strip(c.doc.title); // "태릉해링턴플레이스 33평"
  const addr = strip((c.doc.spec ?? [])[0]); // "서울 노원구 공릉동"
  return `${i + 1}. ${t} ${c.doc.price}${addr ? ` (${addr})` : ""}`;
});

const cap = [];
cap.push(`${md}월 ${dd}일, 신고가 ${kept.length}곳 🔥`);
cap.push("");
cap.push("오늘 새로 확인된 신고가입니다.");
cap.push("한 장씩 넘겨 보세요 →");
cap.push("");
cap.push(...rows);
cap.push("");
/* ⚠️ 이 두 줄은 알림 본문과 **같은 말**이어야 한다(2026-08-25). 계약일이 흩어져 보이는
   이유를 카드도 캡션도 안 적으면 읽는 사람은 매번 되묻는다. */
cap.push("※ 계약일 기준이 아니라 「오늘 새로 드러난」 건입니다.");
cap.push("   실거래 신고까지 최대 30일 걸려 지난달 계약이 섞입니다.");
cap.push("");
cap.push("출처 · 국토교통부 아파트 매매 실거래가 · 2020년 이후 기준");

/* 해시태그 — 검수가 5개로 제한한다. 지역은 그날 가장 많이 나온 시·구 하나만. */
const guCount = new Map();
for (const c of kept) {
  const gu = c.doc.meta?.region?.gu ?? "";
  const g = (gu.match(/^(.+?시)(.+?구)$/)?.[1] ?? gu).replace(/[시군구]$/, "");
  if (g) guCount.set(g, (guCount.get(g) ?? 0) + 1);
}
const topGu = [...guCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "수도권";
cap.push("");
cap.push(`#${topGu}아파트 #신고가 #아파트실거래가 #부동산 #위릿노트`);

const capDir = R("data/review/captions");
mkdirSync(capDir, { recursive: true });
const capPath = join(capDir, `${label}.txt`);
writeFileSync(capPath, cap.join("\n") + "\n");

/* ── ③ 세트 — 그날의 개별 신고가 세트를 내리고 하루 세트 하나로 */
const setsPath = setsPathEarly;
const setsRaw = setsRawEarly;
const sets = setsEarly;

const keptSlugs = new Set(kept.map((c) => c.slug));
/** 이 카드들을 담고 있던 개별 세트 — 확정 증거(md5)를 하루 세트로 옮겨 담는다 */
const absorbed = sets.filter(
  (s) => Array.isArray(s.cards) && s.cards.length === 1 && keptSlugs.has(s.cards[0]),
);
const md5s = absorbed.flatMap((s) => s.confirmedMd5 ?? []);
const anyConfirmed = absorbed.some((s) => s.state === "오너 확정");

const daily = {
  label,
  title: `🔥 ${md}월 ${dd}일 신고가 ${kept.length}곳`,
  cards: kept.map((c) => c.slug),
  caption: label,
  state: anyConfirmed ? "오너 확정" : "검수 대기",
  note:
    `하루치 신고가를 **캐러셀 한 게시물**로 묶은 세트(오너 2026-08-25 "하루에 제작되는 카드들은 1개로 묶어서"). ` +
    `장 순서는 **거래가 큰 순** — 첫 장이 표지다. 캐러셀 상한 ${MAX}장.` +
    (dropped.length ? ` ⚠️ 상한을 넘어 ${dropped.length}장을 뺐다: ${dropped.map((c) => c.slug).join(", ")}.` : "") +
    ` 흡수한 개별 세트 ${absorbed.length}개의 확정 md5 를 그대로 옮겨 담았다 — 확정 증거는 사라지지 않는다.` +
    ` 개별 캡션 파일은 지우지 않는다(카드별 사실 확인에 쓴다). 정기물이라 픽셀 기준값 미등록.`,
  pixelPolicy: "정기물 — apt-station/apt-detail/apt-supply/molit 갱신 시 다시 그려진다",
  ...(md5s.length ? { confirmedMd5: md5s } : {}),
  ...(absorbed.find((s) => s.confirmedAt) ? { confirmedAt: absorbed.find((s) => s.confirmedAt).confirmedAt } : {}),
};

const absorbedLabels = new Set(absorbed.map((s) => s.label));
const next = sets.filter((s) => !absorbedLabels.has(s.label) && s.label !== label);
next.push(daily);
if (Array.isArray(setsRaw.sets)) setsRaw.sets = next;
writeFileSync(setsPath, JSON.stringify(Array.isArray(setsRaw.sets) ? setsRaw : next, null, 2) + "\n");

console.log(`✅ ${label} — 캐러셀 ${kept.length}장 (티켓 1개)`);
console.log(`   내린 개별 세트 ${absorbed.length}개 · 옮겨 담은 확정 md5 ${md5s.length}건`);
console.log(`   캡션: ${capPath.replace(ROOT + "/", "")}`);
for (const [i, c] of kept.entries()) console.log(`   ${String(i + 1).padStart(2)}. ${c.slug}`);
console.log(`\n다음: node scripts/rebuild-cards.mjs && node scripts/render-sets.mjs`);
