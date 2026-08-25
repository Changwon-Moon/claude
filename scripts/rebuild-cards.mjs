/**
 * 카드 전체 재생성 — data/review/builders.json 명세를 순서대로 실행한다.
 *
 * ── 왜 이 파일인가 (2026-07-26 오너 질문 "제작된 카드는 어딨는거야?")
 * 예전엔 배포 워크플로 YAML에 빌더 명령이 하드코딩돼 있었다.
 * 새 카드를 만들어도 그 목록에 손으로 추가하지 않으면, 카드 PNG는 저장소에 없으므로
 * (gitignore) 배포된 관제탑에는 **카드가 영영 안 뜬다.** '월급 34평'이 정확히 그랬다 —
 * 세션에서는 만들어졌는데 실사이트에는 없는 카드.
 *
 * 이제 빌더 목록은 builders.json 한 곳이고, 여기와 sets.json이 어긋나면
 * 스모크(smoke-tower)가 배포를 막는다. "만들었는데 화면에 없다"가 다시는 안 생기게.
 *
 * 개별 빌더가 실패해도 나머지는 계속 그린다(관제탑의 다른 정보는 정상 표시).
 * 다만 무엇이 실패했는지 ::warning 으로 소리 낸다 — 조용히 빠뜨리지 않는다.
 *
 * 실행: node scripts/rebuild-cards.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "data/review/builders.json");

if (!existsSync(MANIFEST)) {
  console.log("::warning::빌더 명세(data/review/builders.json)가 없습니다 — 카드 재생성을 건너뜁니다.");
  process.exit(0);
}

const { builders } = JSON.parse(readFileSync(MANIFEST, "utf8"));
let ok = 0;
let bad = 0;
let qaBad = false;
for (const b of Array.isArray(builders) ? builders : []) {
  const cmd = join(ROOT, b.cmd);
  if (!existsSync(cmd)) {
    console.log(`::warning::빌더 파일 없음 — ${b.label}: ${b.cmd}`);
    bad++;
    continue;
  }
  console.log(`▶ ${b.label} — node ${b.cmd} ${(b.args || []).join(" ")}`);
  const r = spawnSync("node", [cmd, ...(b.args || [])], { cwd: ROOT, stdio: "inherit" });
  if (r.status === 0) ok++;
  else {
    console.log(`::warning::빌더 실패 — ${b.label} (exit ${r.status})`);
    bad++;
  }
}
console.log(`\n🃏 카드 재생성 — 성공 ${ok} · 실패 ${bad}`);

/* ── 디자인 검수 자동 실행 (2026-07-30 오너 지시: "작업하면서 검수 자동으로 돌려줘") ──
 * 카드 JSON 을 다 만든 뒤, sets.json 에 실린 카드 전부를 렌더해 레이아웃을 실측한다.
 * 겹침·넘침은 눈으로 보면 놓친다 — 실제로 제목이 로고 뱃지에 파고든 채 나갔다.
 * ⚠️ 검수 실패는 배포를 막지 않는다(다른 카드·정보는 정상 표시해야 한다).
 *    대신 ::warning 으로 크게 소리 낸다. 조용히 넘기지 않는 게 이 단계의 목적이다.
 */
const SETS = join(ROOT, "data/review/sets.json");
if (existsSync(SETS)) {
  const { sets } = JSON.parse(readFileSync(SETS, "utf8"));
  const targets = [];
  for (const s of Array.isArray(sets) ? sets : []) {
    for (const slug of s.cards || []) {
      // 카드 JSON 은 날짜 폴더 아래 있다 — 가장 최근 것을 찾는다
      const days = existsSync(join(ROOT, "data/content"))
        ? readdirSync(join(ROOT, "data/content")).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse()
        : [];
      const published = days.map((d) => join(ROOT, `data/content/${d}/${slug}.json`)).find((p) => existsSync(p));
      /* ⚠️ 방금 돌린 빌더가 `--publish` 없이 만들면 결과는 `data/out/_spike` 에 떨어진다.
         그런데 검수는 `data/content/<날짜>/` 만 보고 있었다 — **옛 발행본을 검수하고
         "통과"라고 말했다**(2026-08-16 실제로 겪었다: 판이 칸을 7px 넘긴 카드가 초록으로 나갔다).
         둘 다 있으면 **새로 쓰인 쪽**을 검수한다. 검수는 지금 만든 것을 봐야 한다. */
      const spike = join(ROOT, `data/out/_spike/${slug}.json`);
      const mtime = (p) => (existsSync(p) ? statSync(p).mtimeMs : -1);
      const hit = mtime(spike) > mtime(published ?? "") ? spike : published;
      if (hit) targets.push(hit);
    }
  }
  if (targets.length) {
    console.log(`\n🧐 디자인 검수 ${targets.length}장`);
    const r = spawnSync("pnpm", ["-s", "--filter", "@wirit/renderer", "qa", ...targets], {
      cwd: ROOT,
      stdio: "inherit",
    });
    if (r.status !== 0) {
      console.log("::warning::디자인 검수에서 문제가 발견됐습니다 — 위 항목을 고치세요");
      qaBad = true;
    }
  }
}

/* ── 빌더가 죽으면 **빨간불**이다 (2026-08-25 오너 지시)
 *
 * 예전엔 실패해도 `::warning::` 만 남기고 종료코드 0 이었다. "나머지 카드는 정상이니
 * 배포는 계속한다"는 뜻이었는데, 실제로 생긴 일은 이랬다:
 *   빌더가 죽으면 **옛 판본 JSON 이 그대로 남고**, 렌더는 그걸 아무 일 없다는 듯 그린다.
 *   그래서 08-25 에 영통센트럴파크뷰가 조용히 실패한 채 **어제 판본이 오늘 배치에 섞일
 *   뻔했다** — 제원 줄 수를 세다가 사람이 우연히 발견했다.
 *
 * 08-19 에 신고가 워크플로에서 배운 것과 같은 자리다: **종료코드 0 이 "일했다"를 뜻하지
 * 않으면 그 배관은 며칠이고 조용히 멈춰 있을 수 있다.**
 *
 * ⚠️ 이 exit 은 **맨 마지막**이어야 한다. 위에 두면 뒤에 붙인 단계(디자인 검수)가
 *    조용히 안 돌아간다 — 실제로 검수 블록을 붙였는데 한 줄도 실행되지 않았다(2026-07-30).
 *    그래서 "빨간불"은 여기서 **한 번에** 낸다. 앞에서 던지지 않는다.
 * ⚠️ 접수가 끝난 청약 카드처럼 **다시는 안 만들어지는 것**은 고칠 게 아니라 은퇴시킨다:
 *    `node scripts/retire-danji.mjs <라벨>` — 그러면 목록에서 빠져 빨간불도 사라진다. */
if (bad > 0 || qaBad) {
  console.log(
    `\n⛔ 재생성 실패 ${bad}건${qaBad ? " · 디자인 검수 실패" : ""} — 종료코드 1 로 끝냅니다.\n` +
      `   빌더가 죽으면 **옛 판본이 그대로 렌더된다.** 초록불로 넘기면 어제 카드가 오늘 배치에 섞인다.\n` +
      `   접수 종료 등으로 다시 안 만들어지는 카드는 은퇴시키세요: node scripts/retire-danji.mjs <라벨>`,
  );
  process.exit(1);
}
process.exit(0);
