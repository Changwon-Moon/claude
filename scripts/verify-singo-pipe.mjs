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
import { readFileSync, existsSync } from "node:fs";
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

console.log(
  fail === 0
    ? "\n✅ 배관 이상 없음 — 다음 카드 제작을 이대로 진행해도 됩니다.\n"
    : `\n❌ ${fail}건이 어긋납니다 — 위 항목을 고치고 다시 도세요.\n`,
);
process.exit(fail === 0 ? 0 : 1);
