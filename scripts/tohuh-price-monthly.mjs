/**
 * 🗓 「토허제 40곳 가격 지도」 **월간 정기물** — 4장을 캐러셀 한 게시물로 만드는 정본.
 *
 *   node scripts/tohuh-price-monthly.mjs                 ← 자료가 있는 최신 두 달로
 *   node scripts/tohuh-price-monthly.mjs --month 2026-08 ← 그 달을 끝으로 두 달
 *   node scripts/tohuh-price-monthly.mjs --queue         ← 자료가 없을 때 수집만 걸고 끝
 *   node scripts/tohuh-price-monthly.mjs --dry           ← 무엇을 할지만 보고 안 만든다
 *
 * ── 왜 이 파일인가 (오너 2026-09-02 "월간으로 만들 수 있도록 기준화해줘")
 * 09-01~02 에 이 4장을 만들면서 손으로 한 일이 이만큼이다:
 *   ① 어느 두 달을 쓸지 정하고 ② 40곳 × 2달 × 2종 자료가 다 있는지 확인하고
 *   ③ 없으면 대기열에 줄을 밀고 ④ builders.json 의 `--months` 를 고치고
 *   ⑤ 빌더 4개를 돌리고 ⑥ 검수하고 ⑦ 4장을 한 세트로 묶고 ⑧ 묶음 캡션을 쓴다.
 * 판단이 없고 순서가 같다. 그러면 **그건 스크립트가 할 일이다**(confirm.mjs 와 같은 이유).
 *
 * 손으로 하면 매달 같은 자리에서 틀린다. 실제로 이번에 두 개를 찾았다 —
 * 캡션 본문에 「2026년 6~7월」이, 출처 줄에 「2025년 10월 / 2026년 7월 신규 3곳」이
 * **문자로 박혀** 있었다. 카드 위 회색 줄은 달에서 만드는데 캡션만 손글씨라, 다음 달이면
 * 카드와 캡션이 다른 기간을 말한다. 둘 다 빌더에서 계산으로 바꿨다.
 *
 * ── 이 정기물의 기준 (docs/guides/토허제-가격지도-기준.md 가 사람용 정본)
 *   · **두 달**을 합친다. 한 달이면 표본이 얇은 구가 크게 흔들린다 —
 *     실측(2026-09-01) 종로 전용59 는 06월 9건 7.41억 / 07월 11건 5.63억로 1.8억 벌어졌다.
 *   · **40곳 전부**가 두 달 다 있어야 만든다. 한 곳이라도 빠지면 그 지역만 기간이 짧은
 *     지도가 되는데 그건 오보다 — 여기서 멈추고 대기열에 줄을 민다.
 *   · **캐러셀 순서는 34평 매매 → 34평 전세 → 25평 매매 → 25평 전세.**
 *     첫 장이 표지라 가장 큰 숫자가 앞에 서고, 같은 평형의 「사는 값 / 빌리는 값」이
 *     붙어 있어야 넘길 때 비교가 된다. 평형이 섞이면 두 번 되돌아가야 한다.
 *   · 색은 **매매 빨강 · 전세 파랑**(오너 2026-09-02). 빌더의 `--kind` 가 정한다.
 *
 * ── 왜 세트가 하나인가
 * 관제탑의 묶음 단위는 `sets.json` 의 세트다. 카드 1장 = 세트 1개로 두면 결재함에 티켓이
 * 4개 뜨고 인스타에도 4번 올려야 한다 — 이 4장은 **한 편의 소식**이다
 * (신고가 하루치를 묶은 것과 같은 판단, singo-daily-set.mjs 2026-08-25).
 * 그래서 개별 세트 4개를 **흡수해 없애고** `tohuh-price-map` 하나로 만든다.
 *
 * ⚠️ 세트 라벨에 달을 붙이지 않는다. 카드 slug 가 매달 같아서(`mae84-map` …) 달마다
 *    새 라벨을 만들면 **한 카드를 두 세트가 주장**하고 관제탑이 먼저 찾은 쪽에 붙인다.
 *    이건 매달 다시 그리는 정기물이므로 라벨 하나를 갱신한다(jeonwolse-map 과 같은 꼴).
 *    지난달 판본은 `data/out/<날짜>/` 와 아카이브에 남는다.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { writeCaption } from "./lib/caption-signature.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const has = (n) => process.argv.includes(`--${n}`);
const DRY = has("dry");
const QUEUE_ONLY = has("queue");
const SET_LABEL = "tohuh-price-map";

/** 캐러셀 순서 — 위 머리말의 「기준」 그대로. 바꾸려면 기준 문서를 함께 고친다. */
const ORDER = [
  { slug: "mae84-map", kind: "mae", type: "84" },
  { slug: "jeonse84-map", kind: "jeonse", type: "84" },
  { slug: "mae59-map", kind: "mae", type: "59" },
  { slug: "jeonse59-map", kind: "jeonse", type: "59" },
];

/* ══ ① 어느 두 달인가 ══════════════════════════════════════════════
 * 기본은 **매매·전세 양쪽에 다 있는** 가장 최근 두 달이다. 한쪽에만 있는 달을 고르면
 * 네 장 중 두 장이 다른 기간을 말하게 된다 — 같은 게시물 안에서 그건 오보다. */
const monthsIn = (dir) => {
  const d = P(`data/datasets/${dir}`);
  if (!existsSync(d)) return [];
  return [...new Set(readdirSync(d).map((f) => /-(\d{6})\.json$/.exec(f)?.[1]).filter(Boolean))].sort();
};
const bothMonths = monthsIn("molit").filter((m) => monthsIn("molit-rent").includes(m));

const endArg = arg("month"); // "2026-08"
const END = endArg ? endArg.replace("-", "") : bothMonths.at(-1);
if (!END) {
  console.error(`⛔ data/datasets/molit · molit-rent 양쪽에 있는 달이 없습니다. 먼저 수집하세요.`);
  process.exit(1);
}
/** END 의 한 달 전 */
const prevOf = (ym) => {
  const y = Number(ym.slice(0, 4)), m = Number(ym.slice(4, 6));
  return m === 1 ? `${y - 1}12` : `${y}${String(m - 1).padStart(2, "0")}`;
};
const MONTHS = [prevOf(END), END];
console.log(`🗓 집계할 두 달: ${MONTHS.join(", ")}${endArg ? " (--month 지정)" : " (자료가 있는 최신)"}`);

/* ══ ② 허가구역 지정이 아직 살아 있나 ═══════════════════════════════
 * 이 카드의 전제는 「토허제 40곳」이다. 지정이 만료되면 카드가 없는 제도를 말하게 된다.
 * 서울은 `until` 이 있고(현재 2026-12-31), 그 날이 지나면 **자료가 아니라 전제가 틀린다.** */
const tohuh = JSON.parse(readFileSync(P("data/datasets/tohuh-2026.json"), "utf8"));
const AREAS = [
  ...tohuh.seoul.areas.map((a) => ({ ...a, region: "서울" })),
  ...tohuh.newly.areas.map((a) => ({ ...a, region: "경기" })),
  ...tohuh.existing.areas.map((a) => ({ ...a, region: "경기" })),
];
if (AREAS.length !== 40) {
  console.error(`⛔ 토허제 지역이 40곳이 아닙니다: ${AREAS.length}곳 — data/datasets/tohuh-2026.json 을 보세요.`);
  process.exit(1);
}
const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
for (const [who, blk] of [["서울", tohuh.seoul], ["경기 신규", tohuh.newly]]) {
  if (!blk.until) continue;
  if (blk.until < today) {
    console.error(`⛔ ${who} 허가구역 지정이 ${blk.until} 로 **만료**됐습니다.`);
    console.error(`   카드 제목·최상단 줄이 「토지거래허가구역 40곳」이라 그대로 내면 없는 제도를 말합니다.`);
    console.error(`   data/datasets/tohuh-2026.json 을 갱신하고 기준 문서를 다시 보세요.`);
    process.exit(1);
  }
  const daysLeft = Math.round((new Date(blk.until) - new Date(today)) / 86400000);
  if (daysLeft <= 60)
    console.warn(`⚠️ ${who} 허가구역 지정 만료가 ${daysLeft}일 남았습니다(${blk.until}) — 연장·해제 고시를 확인하세요.`);
}

/* ══ ③ 40곳 × 2달 × 2종 자료가 다 있나 ══════════════════════════════
 * 빌더도 없는 파일에서 던지지만, 그때는 **첫 번째 빠진 곳**만 알려 준다.
 * 여기서 전부 세어 두면 대기열 줄을 한 번에 만들 수 있다(수집 왕복이 한 번으로 끝난다). */
const LAWD = {
  ...JSON.parse(readFileSync(P("packages/collectors/src/data/lawd-seoul.json"), "utf8")).codes,
  ...JSON.parse(readFileSync(P("packages/collectors/src/data/lawd-gyeonggi.json"), "utf8")).codes,
};
const missing = { mae: new Set(), jeonse: new Set() };
for (const a of AREAS) {
  const code = LAWD[a.geoName];
  if (!code) {
    console.error(`⛔ 법정동코드를 못 찾았습니다: ${a.geoName}`);
    process.exit(1);
  }
  for (const ym of MONTHS) {
    for (const [kind, dir] of [["mae", "molit"], ["jeonse", "molit-rent"]]) {
      const f = P(`data/datasets/${dir}/${code}-${ym}.json`);
      let ok = existsSync(f);
      if (ok) {
        try { ok = JSON.parse(readFileSync(f, "utf8")).meta?.verified === true; } catch { ok = false; }
      }
      if (!ok) missing[kind].add(a.geoName);
    }
  }
}

const nMissing = missing.mae.size + missing.jeonse.size;
if (nMissing) {
  console.log(`\n⛔ 자료가 모자랍니다 — 매매 ${missing.mae.size}곳 · 전세 ${missing.jeonse.size}곳 (${MONTHS.join(",")})`);
  /* 대기열에 줄을 민다. 워크플로는 **마지막 비주석 줄 하나**만 읽으므로 매매·전세를
     따로 푸시해야 한다 — 그래서 여기서 파일 두 개에 각각 쓰고, 푸시는 사람이 나눠서 한다. */
  const stamp = `# ${today}: 토허제 가격지도 월간 — ${MONTHS.join(",")}`;
  for (const [kind, qf] of [["mae", "data/molit-queue.txt"], ["jeonse", "data/molit-rent-queue.txt"]]) {
    if (!missing[kind].size) continue;
    const line = `region=all gu=${[...missing[kind]].join(",")} months=${MONTHS.join(",")} force=false`;
    if (DRY) { console.log(`   [dry] ${qf} ← ${line.slice(0, 90)}…`); continue; }
    writeFileSync(P(qf), readFileSync(P(qf), "utf8").replace(/\n*$/, "\n") + `\n${stamp}\n${line}\n`);
    console.log(`   ✍️  ${qf} 에 ${missing[kind].size}곳 줄을 밀었습니다`);
  }
  console.log(`\n   다음 (CLAUDE.md §6) — 워크플로가 마지막 줄 하나만 읽으므로 **따로** 푸시합니다:`);
  console.log(`     git add data/molit-queue.txt && git commit -m "수집: 토허제 매매 ${MONTHS.join(",")}" && git push`);
  console.log(`     git add data/molit-rent-queue.txt && git commit -m "수집: 토허제 전세 ${MONTHS.join(",")}" && git push`);
  console.log(`   수집이 끝나면 이 스크립트를 다시 돌리세요.\n`);
  process.exit(2);
}
console.log(`✅ 자료 확인 — 40곳 × ${MONTHS.length}달 × 매매·전세 전부 있습니다(verified)`);
if (QUEUE_ONLY) { console.log(`   --queue 라 여기서 멈춥니다.`); process.exit(0); }

/* ══ ④ builders.json 의 `--months` 를 이 달로 맞춘다 ══════════════════
 * 빌더 인자는 관제탑이 재생산에 그대로 쓴다. 여기가 안 맞으면 `produce-card` 가
 * **지난달 카드를 다시 그린다** — 검수는 통과하고 숫자만 옛것이라 아무도 못 잡는다. */
const DATE = arg("date") ?? today;
const bPath = P("data/review/builders.json");
const bDoc = JSON.parse(readFileSync(bPath, "utf8"));
for (const { slug, kind, type } of ORDER) {
  const b = bDoc.builders.find((x) => x.label === slug);
  if (!b) {
    console.error(`⛔ builders.json 에 ${slug} 이 없습니다 — 정기물이 등록돼 있어야 합니다.`);
    process.exit(1);
  }
  b.cmd = "scripts/build-band-map.mjs";
  b.args = ["--kind", kind, "--type", type, "--months", MONTHS.join(","), "--date", DATE];
}
if (!DRY) writeFileSync(bPath, JSON.stringify(bDoc, null, 2) + "\n");
console.log(`✅ builders.json — 4개 빌더의 --months 를 ${MONTHS.join(",")} 로, --date 를 ${DATE} 로 맞췄습니다`);

/* ══ ⑤ 세트 — 개별 4개를 흡수해 캐러셀 하나로 ══════════════════════ */
const sPath = P("data/review/sets.json");
const sDoc = JSON.parse(readFileSync(sPath, "utf8"));
const slugs = ORDER.map((o) => o.slug);
const prior = sDoc.sets.filter((s) => (s.cards ?? []).length === 1 && slugs.includes(s.cards[0]));
const existing = sDoc.sets.find((s) => s.label === SET_LABEL);

/* 경기 15곳 명단은 **데이터셋에서 만든다.** 손으로 적으면 지정이 바뀔 때 어긋나고,
 * 그러면 범위 검사가 「명단에 없는 이름」이라며 막는다 — 막히는 건 옳지만 이유가 엉뚱해진다. */
const scopeAck = {
  why:
    `오너 확정(2026-09-01): 제목의 주어는 서울이고 값도 서울 25구 평균이다. 표·지도는 수도권 ` +
    `토지거래허가구역 40곳을 함께 보여 주며, 카드 맨 위 회색 줄이 그 범위를 밝힌다. 아래는 그 ` +
    `경기 지역이며, 명단에 없는 이름이 새로 끼면 검사가 그대로 막는다(07-27 캐시 오염 사고 방어는 유지).`,
  outside: AREAS.filter((a) => a.region === "경기").map((a) => a.label),
};

const setEntry = {
  label: SET_LABEL,
  title: `🗺 토허제 40곳 가격 지도 — 매매·전세 × 34평·25평 (${MONTHS[0].slice(0, 4)}.${MONTHS[0].slice(4)}~${MONTHS[1].slice(4)})`,
  cards: slugs,
  caption: SET_LABEL,
  state: "검수 대기",
  note:
    `**월간 정기물.** 만드는 법은 \`node scripts/tohuh-price-monthly.mjs\` 하나다 — 달 고르기·` +
    `자료 점검·대기열·빌더 인자·검수·묶음까지 그 스크립트가 한다. 사람용 정본은 ` +
    `docs/guides/토허제-가격지도-기준.md.\n` +
    `집계 ${MONTHS.join(",")} · 국토부 아파트 매매/전월세 실거래 · 전용 82~86㎡(34평) · 57~61㎡(25평).\n` +
    `**두 달을 합친다** — 한 달이면 표본이 얇은 구가 흔들린다(종로 전용59: 06월 9건 7.41억 / 07월 11건 5.63억).\n` +
    `**매매는 직거래·해제거래를 뺀다** — 신고가 카드와 같은 모집단이어야 두 카드가 같은 세계를 말한다.\n` +
    `색은 **매매 빨강 · 전세 파랑**(오너 2026-09-02) — 표 값과 지도 램프가 한 축이고 제목만 예외다(평형 파랑·금액 빨강).\n` +
    `캐러셀 순서는 34평 매매 → 34평 전세 → 25평 매매 → 25평 전세 — 첫 장이 표지라 큰 숫자가 앞에 서고, ` +
    `같은 평형의 사는 값/빌리는 값이 붙어 있어야 넘기며 비교된다.\n` +
    `머리글은 **2열**이어야 한다 — 3열(head.c)이면 값 칸이 176px 로 고정돼 「성남시 분당구」가 접히고 표가 236px 넘친다.\n` +
    `정기물이라 픽셀 기준값(pixel-baselines)에 넣지 않는다.`,
  pixelPolicy: "정기물 — data/datasets/molit·molit-rent 갱신 시 다시 그려진다. pixel-baselines 에 넣지 않는다",
  scopeAck,
};

if (!DRY) {
  const drop = new Set([...prior.map((s) => s.label), SET_LABEL]);
  sDoc.sets = sDoc.sets.filter((s) => !drop.has(s.label));
  sDoc.sets.push(setEntry);
  writeFileSync(sPath, JSON.stringify(sDoc, null, 2) + "\n");
}
console.log(
  `✅ 세트 ${SET_LABEL} — 카드 4장${prior.length ? ` (개별 세트 ${prior.length}개 흡수: ${prior.map((s) => s.label).join(", ")})` : ""}` +
    `${existing ? " · 지난달 세트를 이 달 것으로 갱신" : ""}`,
);

/* ══ ⑥ 빌더 4개를 **먼저** 돌린다 (묶음 캡션의 재료) ══════════════
 *
 * ⚠️ 순서가 이래야 하는 이유: `produce-card` 는 **캡션이 없으면 검수를 거부한다**
 *    ("캡션은 카드의 두 반쪽 중 하나" — docs/CAPTION.md §1). 그런데 묶음 캡션의 숫자는
 *    카드에서 읽어 만든다. 그래서 빌더 → 캡션 → produce-card 순이다.
 *    (produce-card 가 빌더를 한 번 더 돌리는 것은 낭비가 아니다 — 결정성 덕분에 같은
 *     결과가 나오고, 그게 「관제탑이 부르는 명령으로도 같은 카드가 나온다」는 증명이다.) */
if (DRY) { console.log(`\n[dry] 여기서 멈춥니다 — 빌더 4개 → 묶음 캡션 → produce-card ${SET_LABEL} 차례였습니다.\n`); process.exit(0); }
for (const { slug, kind, type } of ORDER) {
  const b = spawnSync(
    "node",
    ["scripts/build-band-map.mjs", "--kind", kind, "--type", type, "--months", MONTHS.join(","), "--date", DATE],
    { cwd: ROOT, stdio: "inherit" },
  );
  if (b.status !== 0) { console.error(`\n⛔ 빌더 실패 — ${slug}`); process.exit(1); }
}

/* ══ ⑦ 묶음 캡션 ══════════════════════════════════════════════════
 * 개별 캡션 4개는 그대로 둔다(카드별 사실 확인에 쓴다). 세트가 읽는 것은 이 파일이다.
 *
 * ⚠️ 개별 캡션을 이어 붙이지 않는다. 한 장짜리 캡션이 이미 40줄 순위표를 싣고 있어
 *    넷을 합치면 인스타 상한(2,200자)을 훌쩍 넘는다. 묶음은 **네 장의 머릿수와 관계**만
 *    말하고, 40곳 전체는 표지 장(34평 매매)의 순위표만 싣는다.
 * ⚠️ 캡션의 「N억」은 전부 **네 장 중 어딘가에 찍혀 있어야** 한다(caption-number 게이트).
 *    그래서 숫자는 방금 만든 카드 JSON 에서 읽는다 — 손으로 옮겨 적지 않는다. */
const docOf = (slug) => JSON.parse(readFileSync(P(`data/content/${DATE}/${slug}.json`), "utf8"));
const plain = (s) => String(s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const eokOf = (doc) => Number(/([\d.]+)억/.exec(plain(doc.title))?.[1]);
const docs = Object.fromEntries(ORDER.map((o) => [o.slug, docOf(o.slug)]));
const V = Object.fromEntries(ORDER.map((o) => [o.slug, eokOf(docs[o.slug])]));

/** 표지 장(34평 매매)의 40곳 순위.
 *
 * ⚠️ 카드 JSON 의 `rows`+`tail` 에서 뽑으면 **1~16위와 38~40위밖에 없다** — 표는 40곳을
 *    다 싣지 않는다(가운데를 `···` 로 접는다). 40곳 전체는 지도 위 라벨과 **그 장의 개별
 *    캡션**에만 있다. 그래서 개별 캡션의 「[40곳 전체 …]」 토막을 그대로 가져온다.
 *    (그 캡션의 숫자도 빌더가 계산한 값이다 — 손으로 옮겨 적는 자리가 여기에도 없다.)
 * ⓘ 캡션 검수가 이 40줄을 통과시키는 이유: 지도 `<text>` 의 40개 값이 숫자 풀에 들어간다. */
const leadCap = readFileSync(P(`data/review/captions/mae84-map.txt`), "utf8").split("\n");
const rkStart = leadCap.findIndex((l) => /^\[40곳 전체/.test(l));
const rankLines = rkStart < 0 ? [] : leadCap.slice(rkStart + 1).filter((l) => /^\d+\.\s/.test(l));
if (rankLines.length !== 40) {
  console.error(`⛔ 표지 장 캡션에서 40곳 순위를 ${rankLines.length}줄만 찾았습니다 —`);
  console.error(`   data/review/captions/mae84-map.txt 의 「[40곳 전체 …]」 토막을 확인하세요.`);
  process.exit(1);
}
/** 매매 1위/40위 — 위 순위 줄에서 읽는다 */
const eokIn = (l) => Number(/([\d.]+)억/.exec(l)?.[1]);
const maeGap = eokIn(rankLines[0]) / eokIn(rankLines[39]);

const yy = MONTHS[0].slice(0, 4);
const mmA = Number(MONTHS[0].slice(4, 6));
const mmB = Number(MONTHS[1].slice(4, 6));
const periodKo = `${yy}년 ${mmA}~${mmB}월`;
const periodDot = `${yy}.${MONTHS[0].slice(4, 6)}~${MONTHS[1].slice(4, 6)}월`;
/** 전세가율 — 억 값이 아니라 % 라 caption-number 게이트에 안 걸린다 */
const ratio = (a, b) => Math.round((V[a] / V[b]) * 100);

const cap = [
  `우리 동네 34평, 사면 ${V["mae84-map"].toFixed(1)}억 · 빌리면 ${V["jeonse84-map"].toFixed(1)}억 🏠`,
  ``,
  `토지거래허가구역 40곳(서울 25개 자치구 전역 + 경기 15곳)의`,
  `아파트 실거래를 전용면적대별로 평균했습니다.`,
  `(${periodKo} 신고분)`,
  ``,
  `1️⃣ 34평(전용 84㎡) 매매 — 서울 평균 ${V["mae84-map"].toFixed(1)}억`,
  `2️⃣ 34평(전용 84㎡) 전세 — 서울 평균 ${V["jeonse84-map"].toFixed(1)}억`,
  `3️⃣ 25평(전용 59㎡) 매매 — 서울 평균 ${V["mae59-map"].toFixed(1)}억`,
  `4️⃣ 25평(전용 59㎡) 전세 — 서울 평균 ${V["jeonse59-map"].toFixed(1)}억`,
  ``,
  `· 34평 전세가율 ${ratio("jeonse84-map", "mae84-map")}% · 25평 전세가율 ${ratio("jeonse59-map", "mae59-map")}%`,
  `· 34평 매매는 1위와 40위가 ${maeGap.toFixed(1)}배 벌어집니다`,
  ``,
  `[34평 매매 · 40곳 전체]`,
  ...rankLines,
  ``,
  `📌 저장해두고 우리 동네가 몇 위인지 확인하기`,
  ``,
  `—`,
  `📊 출처 · 국토교통부 아파트 매매·전월세 실거래가 (${periodDot} 신고분)`,
  `   매매는 직거래·해제거래 제외 · 전세는 월세 0원 계약만`,
  `🗂 허가구역 : 서울시·경기도 토지거래허가구역 지정 고시`,
  ``,
  `※ 면적은 전부 전용면적입니다. 실거래 신고에는 공급면적이 없습니다`,
  `   — '34평'·'25평'으로 부르는 그 평형이지만, 평(공급) 기준으로 곱한 값이 아닙니다`,
  `※ 두 달을 합쳤습니다 — 실거래 신고기한이 30일이라 한 달만 보면 거래가 적은 곳이 크게 흔들립니다`,
  `※ 평균은 그 두 달에 계약된 단지 구성에 흔들립니다`,
  `※ 전세는 신규·갱신이 섞여 있습니다 (갱신은 5% 상한이 걸린 건이 있습니다)`,
  `※ 시·군·구 경계 기준이며, 실제 허가구역이 일부인 곳이 있습니다`,
  ``,
  `#부동산 #아파트 #매매가 #전세가 #토지거래허가구역`,
].join("\n");

mkdirSync(P("data/review/captions"), { recursive: true });
writeCaption(SET_LABEL, cap);
console.log(`✅ 묶음 캡션 — data/review/captions/${SET_LABEL}.txt (${cap.length.toLocaleString()}자)`);
if (cap.length > 2200)
  console.warn(`⚠️ 인스타 캡션 상한 2,200자를 넘습니다(${cap.length}자) — 40곳 순위표를 줄이세요.`);

/* ══ ⑧ 공식 제작 경로로 한 번 더 — 렌더·검수까지 ═══════════════════
 * 빌더를 직접 돌린 것은 캡션 재료를 얻기 위해서였다. **넘길 물건은 `produce-card` 가
 * 만든 것**이어야 한다 — 관제탑이 재생산에 쓰는 것과 같은 명령이라야 "이 카드는 언제든
 * 다시 나온다"가 참이 된다(2026-09-01 에 이 걸음을 건너뛰었다가 오너에게 지적받았다). */
const r = spawnSync("node", ["scripts/produce-card.mjs", SET_LABEL], { cwd: ROOT, stdio: "inherit" });
if (r.status !== 0) {
  console.error(`\n⛔ ${SET_LABEL} 재생산·검수 실패 — 넘기지 마세요.`);
  process.exit(1);
}

console.log(`
──────────────────────────────────────────────────────────
✅ ${SET_LABEL} — 4장 준비 완료 (${MONTHS.join(",")})
   34평 매매 ${V["mae84-map"].toFixed(1)}억 · 전세 ${V["jeonse84-map"].toFixed(1)}억
   25평 매매 ${V["mae59-map"].toFixed(1)}억 · 전세 ${V["jeonse59-map"].toFixed(1)}억

   다음:
     1) 오너가 4장을 눈으로 본다  (data/out/${DATE}/*-map-p1.png)
     2) node scripts/confirm.mjs ${SET_LABEL}
     3) node scripts/deliver-set.mjs --set ${SET_LABEL}   ← 캐러셀 ZIP 1개
──────────────────────────────────────────────────────────
`);
