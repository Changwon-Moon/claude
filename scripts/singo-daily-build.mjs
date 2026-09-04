/**
 * 🏭 「오늘의 신고가」 **하루치 한 번에** — 재료 확인 → 빌드 → 등록 → 캡션 → 묶음 → 미리보기
 *
 *   node scripts/singo-daily-build.mjs [--date 2026-09-03]
 *                                      [--also singo-어느단지-84 …]   지난날 못 낸 장 붙이기
 *                                      [--max 20]                     캐러셀 상한
 *                                      [--dry]                        재료만 재고 아무것도 안 고친다
 *
 * ── 왜 이 파일인가 (2026-09-03 오너 "최종적으로는 제작까지 자동화 예약작업으로")
 *
 * 하루 11장을 내는 데 **사람 손이 44번** 갔다:
 *   대장 열쇠 찾기 11 · builders.json 항목 11 · sets.json 항목 11 · 캡션 11 · 그 밖에 대여섯.
 * 그리고 그 손길마다 조용히 틀릴 자리가 있었다 — 09-03 하루에만 두 번 밟았다:
 *   · `produces` 를 빠뜨려 묶음 세트의 확정이 통째로 막혔다
 *   · 세트 제목의 평을 손으로 적어 카드와 갈릴 뻔했다(배관 점검 ⑫ 가 보는 값이다)
 * **손이 가는 횟수와 오보 확률은 같이 움직인다.** 그래서 손을 줄이는 것이 곧 검수다.
 *
 * 이 저장소는 이미 노선 카드(`line-card.mjs`)와 청약 카드(`danji-card.mjs`)를
 * 원커맨드로 돌리고 있었다. **신고가만 없었다.**
 *
 * ── 이 스크립트가 지키는 것
 * ① **숫자를 만들지 않는다.** 전부 `singo-log` 와 빌더가 계산한 값을 읽어 옮긴다.
 *    세트 제목의 평·가격도 **만들어진 카드에서** 뽑는다 — 사람이 옮겨 적지 않는다.
 * ② **조용히 빠뜨리지 않는다.** 못 만든 장은 이유와 함께 끝에 다시 나온다.
 *    (「no silent caps」 — CARD_CHECKLIST)
 * ③ **멱등이다.** 두 번 돌려도 같은 결과다. 이미 있는 빌더는 `produces` 로 찾아 고쳐 쓴다.
 * ④ **확정은 안 한다.** 미리보기까지가 끝이다 — 확정은 오너가 그림을 보고 하는 일이다.
 *
 * ── 두 번 돌리는 것이 정상이다
 * 재료(공급면적·곡선·역·주차)가 없으면 **대기열에 줄을 쓰고 거기서 멈춘다.**
 * Actions 가 받아 오면 같은 명령을 한 번 더 돌린다. 두 번째 판에서 카드가 나온다.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(ROOT, p);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const flag = (n) => process.argv.includes(`--${n}`);
const list = (n) => {
  const out = [];
  for (let i = 0; i < process.argv.length; i++)
    if (process.argv[i] === `--${n}`)
      for (let j = i + 1; j < process.argv.length && !process.argv[j].startsWith("--"); j++) out.push(process.argv[j]);
  return out;
};

const DATE = arg("date") ?? new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const MAX = arg("max");
const ALSO = list("also");
const DRY = flag("dry");
/* ── ⏱️ `--enqueue-only` — 재료만 걸고 멈춘다 (2026-09-04 오너 "오전 중에 제작 완료")
 *
 * 지금까지 재료 수집은 **세션이 대기열을 밀어야** 시작됐다. 그래서 아침이 이렇게 흘렀다:
 *   07:10 신고가 판정 → (30분 빈다) → 07:40 세션 시작 → 07:43 재료 부족을 발견하고 그제야 푸시
 * 수집이 늦게 시작하니 카드도 늦다. **재료는 사람을 기다릴 이유가 없다.**
 * 판정이 끝나면 Actions 가 이 모드로 돌려 대기열만 채우고, 수집기들이 바로 움직인다.
 * 세션은 재료가 다 찬 뒤에 와서 만들기만 하면 된다. */
const ENQUEUE_ONLY = flag("enqueue-only");

/* 이름 정규화 — 빌더(`build-singo-record.mjs` 의 `full`)와 **같은 규칙**이어야 한다.
   여기서 다르게 만들면 슬러그가 갈려 「만든 카드를 못 찾는」 일이 난다. */
const full = (s) =>
  String(s ?? "")
    .replace(/[()[\]]/g, "")
    .replace(/[\s·.\-_,]/g, "")
    .trim();

const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: opts.inherit ? "inherit" : "pipe" });

/* ── ⓪ **이미 확정한 날은 다시 묶지 않는다** ───────────────────────────────
 *
 * ⚠️ 이 문지기가 없을 때 실제로 벌어진 일 (2026-09-03, 이 스크립트를 만들며 시험하다 겪었다):
 * 오늘치를 이미 오너가 확정해 ZIP 까지 냈는데 같은 명령을 한 번 더 돌렸더니,
 * `singo-daily-set` 이 묶음을 새로 만들면서 **`state: 오너 확정` 과 확정 md5 11건이
 * 통째로 사라졌다.** 화면엔 초록불만 떴다 — 아무도 안 알려 줬다.
 *
 * 확정은 **오너가 그림을 보고 준 승인**이고 md5 는 그 증거다. 기계가 조용히 지울 것이 아니다.
 * 예약으로 매일 돌 스크립트라 이 사고는 **언젠가 반드시 난다** — 재시도든, 두 번 눌림이든.
 *
 * → 이미 확정된 날은 여기서 멈춘다. 정말 다시 만들 거면 `--force` 로 사람이 뜻을 밝힌다.
 *   (그때도 확정이 사라진다는 것을 화면에 적어 준다 — 모르고 지우는 일이 없게.) */
const dailyLabel = `singo-daily-${DATE}`;
{
  const sp = P("data/review/sets.json");
  if (existsSync(sp)) {
    const S0 = JSON.parse(readFileSync(sp, "utf8"));
    const prev = (S0.sets ?? S0).find((s) => s.label === dailyLabel);
    /* `--dry` 는 아무것도 안 고치므로 막을 이유가 없다 — 확정된 날도 재료는 재 볼 수 있어야 한다 */
    if (prev && String(prev.state ?? "").includes("확정") && !flag("force") && !DRY) {
      console.error(
        `⛔ ${dailyLabel} 은 이미 **${prev.state}** 입니다(${prev.confirmedAt ?? "날짜 미기재"} · 확정 md5 ${prev.confirmedMd5?.length ?? 0}건).\n` +
          `   여기서 다시 묶으면 그 확정과 md5 증거가 **사라집니다.**\n` +
          `   · 카드 한 장만 고칠 거면 → 그 빌더만 다시 돌리고 node scripts/confirm.mjs ${dailyLabel} 로 재확정합니다\n` +
          `   · 정말 하루치를 새로 만들 거면 → --force 를 붙이세요(확정이 지워지는 것을 아신다는 뜻입니다)`,
      );
      process.exit(3);
    }
    if (prev && String(prev.state ?? "").includes("확정") && flag("force"))
      console.log(`⚠️ --force — 이미 확정된 ${dailyLabel} 을 새로 만듭니다. 확정 md5 ${prev.confirmedMd5?.length ?? 0}건이 사라집니다.\n`);
  }
}

/* ── ① 그날 드러난 신고가를 읽는다 ─────────────────────────────────────────── */
const logDir = P("data/datasets/singo-log");
if (!existsSync(logDir)) {
  console.error("::error::신고가 로그가 없습니다 — 아침 수집이 아직 안 돌았습니다");
  process.exit(1);
}
const hits = [];
for (const f of readdirSync(logDir).filter((x) => x.endsWith(".json")))
  for (const h of JSON.parse(readFileSync(join(logDir, f), "utf8")).hits ?? [])
    if (h.foundOn === DATE) hits.push(h);

if (!hits.length) {
  console.log(`ⓘ ${DATE} 에 드러난 신고가가 없습니다 — 만들 카드가 없습니다.`);
  process.exit(0);
}
/* 거래가 큰 순 — 캐러셀 첫 장이 표지다 */
hits.sort((a, b) => b.priceManwon - a.priceManwon);
console.log(`📋 ${DATE} 신고가 ${hits.length}건\n`);

/* ── ② 재료가 다 있나 — 없으면 대기열에 줄을 쓴다 ──────────────────────────── */
const areaType = (a) => (a >= 82 ? "84" : a >= 56 ? "59" : String(Math.round(a)));
const need = { supply: [], hist: [], station: [], detail: [] };
const noKey = [];
const targets = [];

/* ── 🔖 이미 발행한 이름표는 다시 쓰지 않는다 (오너 2026-09-04 "동아에코빌은 새 카드로 만들어")
 *
 * 카드 이름표에는 날짜가 없다(`singo-<단지>-<타입>`). 그래서 같은 단지·같은 타입이 **또**
 * 신고가를 쓰면 새 카드가 **지난 카드를 덮는다.** 09-04 에 실제로 났다 —
 * 성북 동아에코빌 59 는 08-26 에 8.82억으로 발행됐는데, 08-13 계약 9.4억이 9월에 신고되자
 * 그날 카드의 캡션이 9.4억으로 덮였다. **인스타에 올라간 그림과 저장소가 갈렸다.**
 *
 * → 이름표가 **이미 「오너 확정」 세트에 들어 있으면** 날짜를 붙여 **새 카드**로 만든다.
 *   지난 카드는 건드리지 않는다(그 빌더는 `frozen` 으로 굳힌다).
 * ⚠️ 「확정」이라는 사실 하나로만 가른다 — 그 사실은 `confirm.mjs` 만 만들고 md5 가 함께 박힌다. */
const confirmedSlugs = (() => {
  try {
    const S = JSON.parse(readFileSync(P("data/review/sets.json"), "utf8"));
    const out = new Set();
    for (const s of S.sets ?? []) if (s.state === "오너 확정") for (const c of s.cards ?? []) out.add(c);
    return out;
  } catch {
    return new Set();
  }
})();

for (const h of hits) {
  const type = String(h.type);
  const base = `singo-${full(h.aptNm)}-${type}`;
  const slug = confirmedSlugs.has(base) ? `${base}-${DATE.slice(5).replace("-", "")}` : base;
  if (slug !== base)
    console.log(`🔖 ${h.aptNm} 전용${type} — 「${base}」는 이미 발행한 카드라 새 이름표로 만듭니다: ${slug}`);
  /* 대장 열쇠가 없는 건은 **사람이 짚어야 한다.** 여기서 이름으로 갖다 붙이지 않는다
     — 그게 상록마을 사고(2026-08-13)의 경로다. 명령을 찍어 주고 넘어간다. */
  if (!h.kaptCode) {
    noKey.push({ h, slug, type });
    continue;
  }
  const t = { h, slug, type, kapt: h.kaptCode };
  targets.push(t);

  const sup = `data/datasets/apt-supply/${h.kaptCode}-${areaType(h.area)}.json`;
  if (!existsSync(P(sup))) {
    need.supply.push(`kapt=${h.kaptCode} area=${h.area}   # ${h.aptNm} 전용${type}`);
    t.short = true;
  }

  const hp = `data/datasets/singo-history/${h.lawdCd}-${full(h.aptNm)}-${type}.json`;
  if (!existsSync(P(hp))) {
    need.hist.push(`lawd=${h.lawdCd} umd=${h.umdNm} type=${type} apt="${h.aptNm}"`);
    t.short = true;
  }

  if (!existsSync(P(`data/datasets/apt-station/${h.kaptCode}.json`)))
    need.station.push(`kapt=${h.kaptCode}   # ${h.aptNm}`);
  if (!existsSync(P(`data/datasets/apt-detail/${h.kaptCode}.json`)))
    need.detail.push(`kapt=${h.kaptCode}   # ${h.aptNm}`);
}

const QUEUES = [
  ["공급면적", "data/apt-supply-queue.txt", need.supply, true],
  ["곡선", "data/singo-history-queue.txt", need.hist, true],
  ["가까운 역", "data/apt-station-queue.txt", need.station, false],
  ["주차", "data/apt-detail-queue.txt", need.detail, false],
];
let blocked = false;
for (const [name, path, lines, required] of QUEUES) {
  if (!lines.length) {
    console.log(`✅ ${name} — 다 있습니다`);
    continue;
  }
  console.log(`${required ? "⛔" : "⚠️"} ${name} — ${lines.length}건 없음${required ? " (이게 없으면 카드를 못 만듭니다)" : " (없어도 카드는 나옵니다 — 그 줄만 빠집니다)"}`);
  if (required) blocked = true;
  if (!DRY) {
    /* ⚠️ **이미 있는 줄은 다시 쓰지 않는다** (2026-09-04).
       재료가 안 와 exit 2 로 멈출 때마다 같은 줄을 또 붙였다 — 세 번 돌리면 42줄이 됐고
       09-04 에는 세션이 매번 `git checkout --` 로 지웠다. 사람이 없는 예약에서는
       그 손이 없으니 대기열이 끝없이 부푼다. 수집기는 대기열 **전체**를 훑으므로
       부푼 대기열은 곧 느린 아침이다. */
    const have = new Set(
      (existsSync(P(path)) ? readFileSync(P(path), "utf8") : "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#")),
    );
    const fresh = lines.filter((l) => !have.has(l.trim()));
    if (!fresh.length) {
      console.log(`   → ${path} — 이미 걸려 있는 줄뿐이라 더 쓰지 않았습니다`);
    } else {
      appendFileSync(P(path), `\n# ${DATE} singo-daily-build 가 채운 줄\n${fresh.join("\n")}\n`, "utf8");
      console.log(`   → ${path} 에 ${fresh.length}줄 썼습니다${fresh.length < lines.length ? ` (${lines.length - fresh.length}줄은 이미 있었습니다)` : ""}`);
    }
  }
}
if (noKey.length) {
  console.log(`\n⚠️ 대장 열쇠를 못 물린 ${noKey.length}건 — **사람이 짚어야 합니다**(이름으로 붙이지 않습니다)`);
  for (const n of noKey)
    console.log(`   · ${n.h.gu} ${n.h.aptNm} 전용${n.type} — kaptCode 를 찾아 이렇게 만드세요:\n     node scripts/build-singo-record.mjs --apt "${n.h.aptNm}" --type ${n.type} --kapt <코드> --publish`);
}

if (ENQUEUE_ONLY) {
  /* ⚠️ **단지 수로 센다.** 예전엔 대기열 줄 수를 뺐는데, 공급면적과 곡선이 **둘 다** 없는
     단지는 두 번 빠져 「만들 수 있는 것 -4장」 같은 음수가 나왔다(2026-09-05 실제로 봤다).
     화면에 음수가 나오면 읽는 사람은 그 줄 전체를 안 믿게 된다. */
  const short = targets.filter((t) => t.short).length;
  console.log(
    `\n(--enqueue-only) 대기열까지만 채웠습니다. 만들 수 있는 것 ${targets.length - short}장 / 대상 ${targets.length}장\n` +
      (short ? `   재료 ${short}건이 오면 세션이 만듭니다.` : `   재료가 이미 다 있습니다 — 세션이 바로 만들 수 있습니다.`),
  );
  process.exit(0);
}
if (DRY) {
  console.log(
    `\n(--dry) 아무것도 안 고쳤습니다. 만들 수 있는 것 ${targets.filter((t) => !t.short).length}장 / 대상 ${targets.length}장`,
  );
  process.exit(0);
}
if (blocked) {
  console.log(
    `\n⛔ 재료가 덜 왔습니다 — 대기열에 줄을 썼습니다.\n` +
      `   커밋·푸시하면 GitHub Actions 가 받아 옵니다. 받아 온 뒤 **같은 명령을 한 번 더** 돌리세요.\n` +
      `   (결과는 Actions 로그가 아니라 data/apt-supply-last.md · data/singo-history-last.md 에서 봅니다)`,
  );
  process.exit(2);
}

/* ── ③ 카드 만들기 ────────────────────────────────────────────────────────── */
const made = [];
const skipped = [];
for (const t of targets) {
  const r = sh("node", [
    "scripts/build-singo-record.mjs",
    "--apt", t.h.aptNm, "--type", t.type, "--kapt", t.kapt,
    /* 이름표를 가른 건만 `--slug` 를 넘긴다 — 안 가른 건은 빌더 기본값 그대로다 */
    ...(t.slug === `singo-${full(t.h.aptNm)}-${t.type}` ? [] : ["--slug", t.slug]),
    "--publish",
  ]);
  if (r.status === 0) {
    made.push(t);
    console.log(`✅ ${t.h.aptNm} 전용${t.type}`);
  } else {
    /* ⚠️ 빌더가 멈추는 것은 대개 **옳은 일**이다(이력이 짧다 · 지난 고점과 붙었다 ·
       공급면적에 경고가 있다). 이유를 그대로 들고 나와 끝에서 다시 말한다. */
    const why = (r.stderr || r.stdout || "").split("\n").find((l) => /^Error:/.test(l)) ?? `종료코드 ${r.status}`;
    skipped.push({ ...t, why: why.replace(/^Error:\s*/, "").slice(0, 160) });
    console.log(`⏭ ${t.h.aptNm} 전용${t.type} — ${why.replace(/^Error:\s*/, "").slice(0, 90)}`);
  }
}
if (!made.length) {
  console.error("\n::error::한 장도 못 만들었습니다 — 위 이유를 보세요");
  process.exit(1);
}

/* ── ④ 빌더·세트 등록 (멱등) ──────────────────────────────────────────────── */
const bPath = "data/review/builders.json", sPath = "data/review/sets.json";
const B = JSON.parse(readFileSync(P(bPath), "utf8"));
const S = JSON.parse(readFileSync(P(sPath), "utf8"));
const barr = B.builders ?? B, sarr = S.sets ?? S;

for (const t of made) {
  const card = JSON.parse(readFileSync(P(`data/content/${DATE}/${t.slug}.json`), "utf8"));
  /* 제목·가격은 **카드에서** 뽑는다. 손으로 옮겨 적으면 배관 점검 ⑫ 가 잡는 그 어긋남이 난다. */
  const plain = card.title.replace(/<[^>]+>/g, "");
  const args = [
    "--apt", t.h.aptNm, "--type", t.type, "--kapt", t.kapt,
    ...(t.slug === `singo-${full(t.h.aptNm)}-${t.type}` ? [] : ["--slug", t.slug]),
    "--publish",
  ];

  /* 이미 있는 빌더는 **`produces` 로 찾는다** — 라벨은 사람이 지은 것이 이미 있을 수 있다.
     찾으면 인자만 갱신하고 라벨은 그대로 둔다(세트가 그 라벨을 가리키고 있을 수 있다). */
  let b = barr.find((x) => Array.isArray(x.produces) && x.produces.includes(t.slug));
  if (b) {
    /* ⚠️ **사람이 붙여 둔 손잡이는 지우지 않는다.**
       `--name`(오너가 고친 제목) · `--accept-supply-warn`(사람이 대조하고 통과시킨 것) ·
       `--merge-blocks`(한 단지가 맞다고 확인한 것) — 셋 다 **사람의 판단**이다.
       기계가 다시 쓰면서 이걸 날리면 오너가 고친 제목이 다음 날 조용히 되돌아간다. */
    const old = b.args ?? [];
    const nameIdx = old.indexOf("--name");
    const carry = [];
    if (nameIdx >= 0 && old[nameIdx + 1]) carry.push("--name", old[nameIdx + 1]);
    for (const f of ["--accept-supply-warn", "--merge-blocks"]) if (old.includes(f)) carry.push(f);
    b.args = [...args.slice(0, -1), ...carry, "--publish"];
  } else {
    /* 새 빌더의 라벨은 **대장 열쇠로 짓는다** — 기계가 지어도 겹치지 않고, 한글 카드 이름과
       달리 로마자라 파일·URL 어디에 놔도 안전하다. 읽기 좋은 이름은 사람이 나중에 바꿔도 된다
       (`produces` 가 짝을 들고 있으므로 라벨을 바꿔도 안 깨진다). */
    b = {
      label: `singo-${t.kapt}-${t.type}`,
      cmd: "scripts/build-singo-record.mjs",
      args,
      produces: [t.slug],
      note: "⚠️ --publish 필수 — 빼면 재생산·확정이 옛 판본을 본다(2026-08-16). ⚠️ produces 필수 — 빼면 묶음 세트가 이 빌더를 못 찾는다(2026-09-03).",
    };
    barr.push(b);
  }

  let st = sarr.find((x) => (x.cards ?? []).length === 1 && x.cards[0] === t.slug);
  if (!st) {
    st = { label: b.label, cards: [t.slug], caption: b.label };
    sarr.push(st);
  }
  st.title = `🔥 ${plain}, ${card.price} 신고가`;
  st.caption = st.caption ?? b.label;
  st.state = st.state ?? "시안";
  st.note = `${t.h.foundOn} 판정 신고가. 대장 열쇠 ${t.kapt} (${card.meta?.hhld?.keyFrom ?? "출처 미기재"}). 기준은 docs/guides/신고가-카드-기준.md`;
  /* ⚠️ "정기물" 이라는 **문자열**이 반드시 들어가야 한다 — 배관 점검 ⑩ 이 이 글자를 보고
     픽셀 차이를 실패로 셀지 알림으로 넘길지 정한다. 빠뜨리면 수집일마다 빨간불이 뜬다. */
  st.pixelPolicy =
    "정기물 — singo-history·molit·apt-station·apt-detail·apt-supply 갱신 시 다시 그려진다. pixel-baselines 에 넣지 않는다";
}
writeJson(bPath, B);
writeJson(sPath, S);
console.log(`\n📝 빌더·세트 등록 ${made.length}건 (produces·pixelPolicy 포함)`);

function writeJson(rel, obj) {
  writeFileSync(P(rel), JSON.stringify(obj, null, 2) + "\n", "utf8");
}

/* ── ⑤ 캡션 → 렌더·검수 ──────────────────────────────────────────────────── */
for (const t of made) {
  const b = barr.find((x) => Array.isArray(x.produces) && x.produces.includes(t.slug));
  const r = sh("node", ["scripts/gen-singo-caption.mjs", `data/content/${DATE}/${t.slug}.json`, "--out", b.label]);
  if (r.status !== 0) {
    console.error(`::error::캡션 생성 실패 — ${t.slug}\n${(r.stderr || r.stdout || "").slice(-400)}`);
    process.exit(1);
  }
}
sh("node", ["scripts/apply-signature.mjs"]);
console.log(`💬 캡션 ${made.length}건`);

for (const t of made) {
  const b = barr.find((x) => Array.isArray(x.produces) && x.produces.includes(t.slug));
  const r = sh("node", ["scripts/produce-card.mjs", b.label]);
  if (r.status !== 0) {
    console.error(`::error::렌더·검수 실패 — ${b.label}\n${(r.stdout || "").slice(-1200)}`);
    process.exit(1);
  }
}
console.log(`🖼  렌더·검수 ${made.length}장`);

/* ── ⑥ 하루 묶음 → 미리보기 ──────────────────────────────────────────────── */
const setArgs = ["scripts/singo-daily-set.mjs", "--date", DATE];
if (MAX) setArgs.push("--max", MAX);
if (ALSO.length) setArgs.push("--also", ...ALSO);
const grouped = sh("node", setArgs, { inherit: true });
if (grouped.status !== 0) process.exit(grouped.status ?? 1);


const prevRun = sh("node", ["scripts/preview-html.mjs", "--set", dailyLabel], { inherit: true });

/* ── ⑦ 못 만든 것을 **다시** 말한다 ─────────────────────────────────────────
   화면을 위로 스크롤해야 보이는 경고는 안 읽힌다. 끝에서 한 번 더 모아 준다. */
console.log("\n────────────────────────────────────────");
console.log(`🏭 ${DATE} — 만든 카드 ${made.length}장`);
if (skipped.length || noKey.length) {
  console.log(`\n⚠️ 못 만든 ${skipped.length + noKey.length}건 — **조용히 빠뜨리지 않습니다**`);
  for (const s of skipped) console.log(`   · ${s.h.gu} ${s.h.aptNm} 전용${s.type} — ${s.why}`);
  for (const n of noKey) console.log(`   · ${n.h.gu} ${n.h.aptNm} 전용${n.type} — 대장 열쇠를 못 물렸습니다(사람이 짚어야 합니다)`);
}
console.log(
  `\n다음: 미리보기를 오너에게 보내 확정을 받습니다.\n` +
    `  · 제목을 고치면 → 그 빌더 args 에 --name 을 넣고 다시 돌립니다\n` +
    `  · 확정되면    → node scripts/confirm.mjs ${dailyLabel} --note "..."\n` +
    `  · 그 다음     → node scripts/deliver-set.mjs --set ${dailyLabel}\n` +
    `  · 카톡 문구   → node scripts/gen-kakao-caption.mjs --set ${dailyLabel} --areas "…"`,
);
process.exit(prevRun.status ?? 0);
