/**
 * 「오늘의 신고가」 배관 자가점검 — `node scripts/verify-singo-pipe.mjs`
 *
 * ── 왜 이 파일이 있나 (2026-08-16b 오너 "다음번 새로 제작할때 배관 설정 다 제대로 바뀌어있는지 확인해줘")
 * 이 판형은 하루 사이에 배관을 여러 군데 고쳤다. 고친 것들이 **다음 제작 때 실제로 살아 있는지**는
 * 카드를 한 장 만들어 봐야 알 수 있었는데, 그때는 이미 늦다 — 2026-08-16 에 실제로
 * "검수 통과"라고 말하면서 **옛 판본을 검수하고 있었다.**
 *
 * 그래서 배관의 약속을 **파일에서 직접 확인한다.** 주석이나 기억이 아니라 코드가 근거다.
 * 카드 만들기 전에 한 번 돌리면 된다(수집 키·네트워크가 필요 없다).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : "");
let fail = 0;
const check = (name, pass, why = "") => {
  console.log(`  ${pass ? "✅" : "❌"} ${name}${pass || !why ? "" : ` — ${why}`}`);
  if (!pass) fail++;
};
const head = (t) => console.log(`\n${t}`);

/* ① 빌더가 발행 폴더에 쓰는가.
   `--publish` 가 없으면 결과가 data/out/_spike 로 가는데, 재생산·확정은
   data/content/<날짜>/ 를 렌더한다 → **옛 판본을 확정하게 된다**(실제로 겪었다). */
head("① 빌더가 발행 폴더에 쓰는가");
{
  const b = JSON.parse(read("data/review/builders.json") || "{}").builders ?? [];
  const e = b.find((x) => x.cmd?.includes("build-singo-record"));
  check("builders.json 의 singo 항목에 --publish", !!e && (e.args ?? []).includes("--publish"),
    "없으면 옛 판본을 확정한다");
}

/* ② 대기열이 모든 줄을 도는가. 예전엔 마지막 줄만 읽어 카드 5장이면 15번을 순차로 밀어야 했다. */
head("② 대기열이 모든 줄을 도는가");
for (const w of ["singo-history", "apt-station", "apt-detail"]) {
  const y = read(`.github/workflows/${w}.yml`);
  check(`${w}: 전 줄 루프`, y.includes("while IFS= read -r LINE") && !y.includes("tail -1"),
    y.includes("tail -1") ? "아직 마지막 줄만 읽는다" : "루프를 못 찾음");
  check(`${w}: 한 줄이 실패해도 계속 간다`, y.includes("FAILED=1"), "첫 실패에서 멈춘다");
}

/* ③ 이미 받아 둔 것을 다시 안 받는가(그리고 force=1 로 다시 받을 수 있는가).
   곡선은 한 단지가 80회 호출이라 이게 없으면 실행이 몇 배로 늘어난다. */
head("③ 이미 받은 것 건너뛰기 · force=1 재수집");
for (const w of ["apt-station", "apt-detail"]) {
  const y = read(`.github/workflows/${w}.yml`);
  check(`${w}: skip + force`, y.includes("이미 있음") && y.includes("force=1"));
}
check("singo-history: CLI 가 --force 를 받는다", read("packages/collectors/src/molitHistoryCli.ts").includes('includes("--force")'));

/* ④ 검수·재생산이 **방금 만든 것**을 보는가. */
head("④ 검수가 무엇을 검수하는가");
check("produce-card: 옛 판본이면 멈춘다", read("scripts/produce-card.mjs").includes("assertFreshest"));
check("rebuild-cards: 새로 쓰인 쪽을 검수한다", read("scripts/rebuild-cards.mjs").includes("_spike"));

/* ⑤ 확정 §0 순서. 서명 검사가 재생성보다 앞이면 아무 의미가 없다
   (몇몇 빌더가 캡션을 다시 쓰면서 고정 서명을 날린다). */
head("⑤ 확정 §0 순서");
{
  const order = [...read("scripts/confirm.mjs").matchAll(/\["(전 카드 재생성·검수|캡션 고정 서명 반영|캡션 고정 서명 확인)"/g)].map((m) => m[1]);
  console.log(`     ${order.join(" → ") || "(못 찾음)"}`);
  check("재생성 → 서명 반영 → 서명 확인",
    JSON.stringify(order) === JSON.stringify(["전 카드 재생성·검수", "캡션 고정 서명 반영", "캡션 고정 서명 확인"]));
}

/* ⑥ 이 판형에 안 맞는 단지를 빌더가 실제로 막는가 — 문구가 아니라 **돌려서** 확인한다. */
head("⑥ 판형에 안 맞는 단지를 막는가 (실제 실행)");
{
  const hist = "data/datasets/singo-history/41595-반정아이파크캐슬5단지-59.json";
  if (!existsSync(join(ROOT, hist))) {
    console.log("  ⏭ 표본(반정아이파크캐슬5단지 곡선)이 없어 건너뜁니다");
  } else {
    const r = spawnSync("node", ["scripts/build-singo-record.mjs", "--apt", "반정아이파크캐슬5단지", "--type", "59", "--kapt", "A10023451"],
      { cwd: ROOT, encoding: "utf8" });
    check("관측 15개월 미만이면 던진다", r.status !== 0 && /15개월/.test(r.stderr ?? ""));
  }
}

/* ⑦ 카드에 붙는 값은 **자료가 있을 때만** 붙는가. */
head("⑦ 자료가 없으면 그 줄을 안 붙이는가");
{
  const b = read("scripts/build-singo-record.mjs");
  check("주차: 파일 없으면 줄 생략", b.includes("apt-detail/") && b.includes("주차대수 자료가 없어"));
  check("역: 1,000m 넘으면 뱃지 생략", b.includes("MAX_BADGE_M"));
  check("세대수: --kapt 로 사람이 짚어야만", b.includes("이름으로 자동 매칭하지 않고"));
}

/* ⑧ 라벨이 곡선을 피하는가 (2026-08-16c) — 자리가 고정이던 시절 서초포레스타2단지에서
   저점 라벨 한가운데를 곡선이 뚫었다. designQa 는 SVG 안을 못 재므로 여기가 유일한 그물이다. */
head("⑧ 라벨이 곡선을 피하는가");
{
  const b = read("scripts/build-singo-record.mjs");
  check("곡선 구간 사각형을 잰다", b.includes("segBoxes"));
  check("연도 축을 장애물로 넣는다", b.includes("const half = widthOf(a.text, 24)"));
  check("빈 자리가 없어도 던지지 않는다", b.includes("판에 빈 자리가 없습니다"), "던지면 카드가 아예 안 나온다");
  /* 오늘 값 기준선은 조건 없이 늘 있어야 한다 — `if (hit.milestone)` 로 돌아가면
     돌파 카드에만 선이 생기고 나머지는 견줄 대상이 없는 그림이 된다(2026-08-16c). */
  check("오늘 값 기준선이 조건 없이 그려진다", /const threshold = \{/.test(b) && !/if \(hit\.milestone\) \{\s*\n\s*const ty/.test(b),
    "milestone 일 때만 그리면 대부분의 카드에 오늘 선이 없다");
}

/* ⑨ 캡션 생성기 규칙 — 전부 실제 결함을 보고 넣은 것이라, 지워지면 그 결함이 돌아온다. */
head("⑨ 캡션 생성기");
{
  const g = read("scripts/gen-singo-caption.mjs");
  check("걸어온 길을 날짜로 정렬한다", g.includes("mid.sort"), "최저점이 사이클 고점보다 나중이면 시간이 거슬러 간다");
  check("사이클 고점 == 직전 최고가면 한 번만 말한다", g.includes("sameAsCycle"));
  check("시+구 지명은 시를 쓴다", g.includes("guSplit"), "#수원시영통아파트 로 나간다");
  check("확정된 캡션을 덮지 않는다", g.includes("오너 확정") && g.includes("--force"));
}

/* ⑩ 확정 카드의 픽셀이 그대로인가 — 배관을 손보면서 제일 쉽게 깨뜨리는 약속이다.
   sets.json 의 확정 md5 와 지금 그림을 대조한다(그림이 로컬에 없으면 건너뛴다).

   ⚠️ **정기물은 다르면 알리기만 한다.** 정기물의 약속은 "픽셀이 안 바뀐다"가 아니라
      "같은 데이터면 같은 픽셀"이다 — 주간 시세물은 자료가 갱신되면 당연히 다시 그려진다.
      그걸 실패로 세면 이 점검이 늘 빨간불이라 아무도 안 보게 된다. */
head("⑩ 확정 카드 픽셀");
{
  const raw = JSON.parse(read("data/review/sets.json") || "{}");
  const sets = Array.isArray(raw) ? raw : raw.sets ?? [];
  /* 정기물이 아닌 카드는 `pixel-baselines.json` 이 더 최신일 수 있다 — 재확정은 그쪽을 갱신하는데
     sets.json 을 안 고치고 지나간 적이 있다(sinbundang-loop, 08-06 재확정). 있으면 그쪽을 믿는다. */
  const base = JSON.parse(read("data/review/pixel-baselines.json") || "{}").cards ?? [];
  const wantOf = (slug, fallback) => (base.find((c) => c.png === `${slug}-p1.png`)?.md5 ?? "").slice(0, 12) || fallback;
  const outRoot = join(ROOT, "data/out");
  const dirs = existsSync(outRoot) ? readdirSync(outRoot) : [];
  let seen = 0;
  const moved = [];
  for (const s of sets.filter((x) => x.state === "오너 확정" && (x.confirmedMd5 ?? []).length)) {
    const periodic = /정기물/.test(s.pixelPolicy ?? "");
    for (const sig of s.confirmedMd5) {
      const [slug, recorded] = sig.split(":");
      const want = periodic ? recorded : wantOf(slug, recorded);
      const hit = dirs.map((d) => `data/out/${d}/${slug}-p1.png`).find((p) => existsSync(join(ROOT, p)));
      if (!hit) continue;
      seen++;
      const got = createHash("md5").update(readFileSync(join(ROOT, hit))).digest("hex").slice(0, 12);
      if (got === want) { check(slug, true); continue; }
      if (periodic) { moved.push(`${slug}(${s.label})`); console.log(`  ℹ️  ${slug} — 확정 ${want} → 지금 ${got} · 정기물이라 자료가 바뀌면 다시 그려집니다`); }
      else check(slug, false, `확정 ${want} → 지금 ${got} (${s.label})`);
    }
  }
  if (!seen) console.log("  ⏭ 대조할 확정 그림이 로컬에 없습니다");
  if (moved.length) console.log(`     → 다시 낼 거면 확정을 다시 받으세요: ${moved.join(", ")}`);
}

/* ⑪ 문서가 코드와 같은 말을 하는가 (2026-08-16c 감사)
 *
 * 새 세션은 **문서만 읽고** 카드를 만든다. 그래서 문서가 낡으면 배관이 멀쩡해도 사고가 난다.
 * 실제로 감사에서 나온 것들: 세트 등록 절차가 어디에도 없어 `produce-card` 가 즉시 죽었고,
 * 렌더 명령이 존재하지 않는 인자를 쓰고 있었고, 세션이 제일 먼저 읽는 STATUS.md 가
 * **폐기된 제목 규칙**을 가르치고 있었다.
 *
 * 그래서 "문서에 이 말이 있는가"를 여기서 본다 — 사람 기억이 아니라 파일이 근거다. */
head("⑪ 문서가 코드와 같은 말을 하는가");
{
  const std = read("docs/guides/신고가-카드-기준.md");
  const claude = read("CLAUDE.md");
  const status = read("STATUS.md");
  const chk = read("docs/CARD_CHECKLIST.md");

  check("기준 문서에 세트·빌더 등록 절차가 있다", std.includes("sets.json") && std.includes("builders.json"),
    "없으면 새 세션이 produce-card 에서 즉시 막힌다");
  check("기준 문서에 kaptCode 찾는 법이 있다", std.includes("apt-hhld.json") && std.includes("byKapt"),
    "규칙만 있고 방법이 없으면 --kapt 를 못 채운다");
  check("기준 문서에 Actions 결과 확인 파일이 있다", std.includes("singo-history-last.md"),
    "세션은 Actions 로그를 못 읽는다 — 저장소 파일로 봐야 한다");
  check("기준 문서에 재확정 절차가 있다", /재확정/.test(std) && std.includes("confirmedMd5"));
  /* 명령 블록(```) 안만 본다 — "그 인자는 무시된다"는 **경고 문장**까지 걸리면
     경고를 적을수록 검사가 화내는 이상한 그물이 된다. */
  const codeBlocks = (t) => [...t.matchAll(/```[\s\S]*?```/g)].map((m) => m[0]).join("\n");
  check("명령 예시가 없는 렌더 인자를 안 쓴다", !/--outdir|--qa\b/.test(codeBlocks(std) + codeBlocks(claude)),
    "렌더러 CLI 는 --data/--out 둘뿐이라 나머지는 조용히 무시된다");
  check("STATUS.md 가 폐기된 제목 규칙을 안 가르친다",
    !/단지명이 이미 지역을 품으면 지역 라벨/.test(status),
    "세션이 제일 먼저 읽는 파일이다 — 여기가 낡으면 나머지를 다 읽어도 소용없다");
  check("체크리스트 §0 이 재생성 → 서명 순서다",
    chk.indexOf("scripts/rebuild-cards.mjs") < chk.indexOf("scripts/apply-signature.mjs"),
    "서명이 앞이면 재생성이 다시 날린다");
  /* 확정 md5 는 두 곳에 적히면 반드시 어긋난다 — 문서에 12자리 md5 를 박아 두지 않았는지 본다.
     (§7 표처럼 '어느 파일이 정본인가'를 적는 건 괜찮다. 값 자체를 베끼는 게 문제다.) */
  const stale = [...std.matchAll(/`([0-9a-f]{12})`/g)].map((m) => m[1])
    .filter((h) => !read("data/review/sets.json").includes(h) && !read("data/review/pixel-baselines.json").includes(h));
  check("기준 문서에 어디에도 없는 md5 가 박혀 있지 않다", stale.length === 0,
    stale.length ? `${stale.join(", ")} — 확정 기록과 안 맞는다` : "");
}

console.log(
  fail === 0
    ? "\n✅ 배관 이상 없음 — 다음 카드 제작을 이대로 진행해도 됩니다.\n"
    : `\n❌ ${fail}건이 어긋납니다 — 위 항목을 고치고 다시 도세요.\n`,
);
process.exit(fail === 0 ? 0 : 1);
