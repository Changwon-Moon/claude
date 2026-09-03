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
 *      node scripts/rebuild-cards.mjs --only "카드슬러그,카드슬러그"
 *
 * ── ⚠️ `--only` — **판정만** 좁힌다. 만드는 것도 검수하는 것도 여전히 전부다 (2026-09-03)
 *
 * 이 단계는 `confirm.mjs` 안에서도 돈다. 그런데 전수라서 **남의 카드 한 장이 내 세트의
 * 확정을 통째로 막았다.** 09-03 실측 두 건:
 *   · 다른 세션이 `danji-cover` 판형을 고치자 `danji-songpa`·`danji-guri` 가 푸터 넘침으로
 *     빨간불 → 신고가 11장 확정이 막혔다
 *   · 같은 세션의 `danji-mokdong` 이 강조색 전수에 걸려 → 또 막혔다
 * 둘 다 **남이 확정한/검토 중인 카드**라 이쪽에서 고칠 수 없다(저장소 규칙). 그래서
 * 손으로 커밋했는데, **손으로 커밋한다는 것은 그 뒤 검사를 아무도 안 돌린다는 뜻**이다.
 * 문지기가 사람을 우회하게 만들면 그 문지기는 이미 진 것이다.
 *
 * → 그래서 판정 범위만 좁힌다:
 *   · 내 세트 카드가 깨지면 → ❌ 막는다 (예전과 똑같다)
 *   · 남의 카드가 깨지면    → ⚠️ **이름을 적어 알린다.** 막지는 않는다.
 *     그 카드는 자기 확정 차례와 세션 마감(`--only` 없이 도는 자리)에서 막힌다.
 *   · `--only` 없이 돌리면 예전 그대로 **전부** 막는다 — 공장 전체를 보는 자리는 거기다.
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

/** `--only a,b,c` — 판정 대상 카드 슬러그. 없으면 전부가 판정 대상이다(예전 동작). */
const ONLY = (() => {
  const i = process.argv.indexOf("--only");
  const v = i >= 0 ? process.argv[i + 1] : undefined;
  if (!v || v.startsWith("--")) return null;
  const s = new Set(v.split(",").map((x) => x.trim()).filter(Boolean));
  return s.size ? s : null;
})();
/** 이 빌더가 내 판정 범위 안인가 — `produces` 에 적힌 카드로 본다(이름 규칙을 추측하지 않는다). */
const builderInScope = (b) =>
  !ONLY || (Array.isArray(b.produces) ? b.produces.some((c) => ONLY.has(c)) : ONLY.has(b.label));
const slugOfPath = (p) => p.split("/").pop().replace(/\.json$/, "");

const { builders } = JSON.parse(readFileSync(MANIFEST, "utf8"));
let ok = 0;
let bad = 0;
let qaBad = false;
/** 판정 밖(다른 세트)에서 깨진 것들 — 막지는 않지만 **반드시 이름을 적는다** */
const otherBad = [];
for (const b of Array.isArray(builders) ? builders : []) {
  /* ── 굳힌 카드는 **다시 그리지 않는다** (2026-08-28)
   *
   * 신고가 카드는 정기물이라 자료가 갱신되면 다시 그려진다. 그런데 **이미 발행한 날의
   * 캐러셀**은 그러면 안 된다 — 08-27 에 힐스테이트푸르지오수원 9.58억으로 내보냈는데
   * 08-28 에 같은 단지·타입이 **9.80억**으로 또 신고가를 썼다. 곡선을 새로 받아 다시
   * 그리면 카드는 9.80억이 되는데 **그날 캡션은 9.58억**이라 — 캡션과 카드가 어긋난다.
   * 그게 곧 오보다.
   *
   * 그렇다고 두면 빌더가 「곡선의 최고가와 신고가 판정이 다릅니다」로 죽어 재생성이
   * 통째로 빨간불이 된다(그 가드는 옳다 — 08-25 에 오보 두 건을 막았다).
   *
   * → `frozen` 한 줄로 **그날의 판본을 그대로 둔다.** 빌더 항목은 남으므로 세트 정합
   *   검사(`setFullyCovered`)도 그대로 통과하고, 카드 JSON·PNG 도 그 자리에 남는다.
   *
   * ⚠️ 굳히는 이유를 반드시 적는다. 이유 없는 `frozen` 은 몇 주 뒤에 「왜 이건 안 그리지」가
   *    되고, 그러면 누군가 무심코 지운다.
   * ⚠️ 같은 단지의 **새 기록**을 싣고 싶으면 굳힌 것을 푸는 게 아니라 **새 카드**로 만든다 —
   *    발행한 과거는 고치는 것이 아니라 쌓는 것이다. */
  if (b.frozen) {
    console.log(`⏸ 굳힘 — ${b.label}: ${b.frozen}`);
    ok++;
    continue;
  }
  const cmd = join(ROOT, b.cmd);
  if (!existsSync(cmd)) {
    console.log(`::warning::빌더 파일 없음 — ${b.label}: ${b.cmd}`);
    if (builderInScope(b)) bad++; else otherBad.push(`${b.label} (빌더 파일 없음)`);
    continue;
  }
  console.log(`▶ ${b.label} — node ${b.cmd} ${(b.args || []).join(" ")}`);
  const r = spawnSync("node", [cmd, ...(b.args || [])], { cwd: ROOT, stdio: "inherit" });
  if (r.status === 0) ok++;
  else {
    console.log(`::warning::빌더 실패 — ${b.label} (exit ${r.status})`);
    if (builderInScope(b)) bad++; else otherBad.push(`${b.label} (빌더 실패)`);
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
      if (!ONLY) qaBad = true;
      else {
        /* ⚠️ 검수는 **전수로 이미 돌았다**(위 표에 다 찍혔다). 여기서는 「내 카드도 깨졌나」만
           다시 잰다 — 내 카드만 놓고 한 번 더 돌린다. 실패했을 때만 도는 두 번째 판이다.
           남의 카드가 깨진 것은 아래에서 이름을 적어 알린다 — 조용히 넘기지 않는다. */
        const mine = targets.filter((p) => ONLY.has(slugOfPath(p)));
        if (mine.length) {
          console.log(`\n🧐 디자인 검수(판정 범위만) ${mine.length}장`);
          const r2 = spawnSync("pnpm", ["-s", "--filter", "@wirit/renderer", "qa", ...mine], {
            cwd: ROOT,
            stdio: "inherit",
          });
          if (r2.status !== 0) qaBad = true;
          else otherBad.push("디자인 검수 — 판정 밖 카드에서 실패(위 표 참고)");
        } else {
          /* 넘긴 슬러그가 검수 대상에 하나도 없다 = 판정할 것이 없다. 그건 초록불이 아니다. */
          console.log("::warning::--only 로 넘긴 카드가 검수 대상에 없습니다 — 판정할 것이 없어 실패로 봅니다");
          qaBad = true;
        }
      }
    }
  }
}

/* ── 캡션 고정 서명을 **여기서 다시 붙인다** (2026-08-25)
 *
 * 몇몇 빌더(`build-jeongbi-map` · `build-tohuh-rent-map` · `build-wolse-flip` ·
 * `build-foreign-rank`)는 캡션 파일을 **통째로 새로 쓴다**. 그래서 재생성이 돌 때마다
 * 맨 아래 위릿노트 3줄이 **조용히 사라진다**.
 *
 * 「`apply-signature` 는 `rebuild-cards` 뒤」라는 규칙은 체크리스트에도 `confirm.mjs`
 * 에도 적혀 있었다. 그런데 2026-08-25 에 배포 순서를 **손으로** 재현하면서
 * (rebuild → build-archive → build-tower-site → stage → smoke) 그 한 단계를 빼먹었고,
 * 캡션 4개가 서명을 잃은 채 커밋됐다(`dfd5c89`). 사람이 diff 를 세다 발견했다.
 *
 * **순서를 문서로만 지키면 언젠가 빠진다.** 서명 붙이기는 멱등이므로 재생성이 끝나는
 * 자리에서 스스로 붙인다 — 뒤에 `apply-signature --check` 가 또 와도 그대로 통과한다.
 *
 * ⚠️ 진짜 고침은 **한 층 아래**에 있다: 빌더는 이제 `scripts/lib/caption-signature.mjs`
 *    의 `writeCaption()` 으로 캡션을 써서 **쓰는 순간 서명이 붙는다.** 여기 남긴 이 단계는
 *    그걸 안 쓰고 `writeFileSync` 로 직접 쓰는 빌더가 새로 생겼을 때를 위한 **그물**이다.
 *    평소엔 「61개 전부 제자리」만 찍고 지나간다 — 무언가 반영됐다고 나오면 그 빌더를 찾아
 *    `writeCaption` 으로 옮긴다.
 * ⚠️ `--check` 는 마감 절차에 남겨 둔다. 여기서 붙이는 것은 **재생성이 지운 것의 복구**이고,
 *    `--check` 는 손으로 고친 캡션까지 포함해 61개 전수를 **증명**하는 자리다. */
{
  const sig = spawnSync("node", ["scripts/apply-signature.mjs"], { cwd: ROOT, stdio: "inherit" });
  if (sig.status !== 0) {
    console.log("::warning::캡션 고정 서명을 붙이지 못했습니다 — apply-signature 를 직접 확인하세요");
    qaBad = true;
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
/* 판정 밖에서 깨진 것은 **반드시 적는다.** 안 보이게 하는 순간 이 예외는 구멍이 된다. */
if (otherBad.length) {
  console.log(
    `\n⚠️ 판정 밖(다른 세트)에서 ${otherBad.length}건 깨졌습니다 — 여기서는 막지 않습니다:\n` +
      otherBad.map((x) => `   · ${x}`).join("\n") +
      `\n   그 카드는 자기 확정 차례와 세션 마감(--only 없이 도는 자리)에서 막힙니다.`,
  );
}
if (bad > 0 || qaBad) {
  console.log(
    `\n⛔ 재생성 실패 ${bad}건${qaBad ? " · 디자인 검수 실패" : ""} — 종료코드 1 로 끝냅니다.\n` +
      `   빌더가 죽으면 **옛 판본이 그대로 렌더된다.** 초록불로 넘기면 어제 카드가 오늘 배치에 섞인다.\n` +
      `   접수 종료 등으로 다시 안 만들어지는 카드는 은퇴시키세요: node scripts/retire-danji.mjs <라벨>`,
  );
  process.exit(1);
}
process.exit(0);
