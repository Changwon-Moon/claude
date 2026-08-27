/**
 * 배관 상태 한 판 — 자동으로 도는 것들이 **실제로 일하고 있는지**를 한 화면에 보인다.
 *
 * ── 왜 (2026-08-19 오너 "현재 텔레그램에 연동된 작업들에 대해 전체 상태점검해줘")
 * 청약홈 수집이 3일, 실거래 수집이 2일 죽어 있었는데 아무도 몰랐다. 이유가 둘이었다:
 *   ① 신고가 워크플로는 **수집 0건이어도 초록불**이었다(그날 고쳤다).
 *   ② 그리고 무엇보다, "지금 뭐가 멈춰 있나"를 한 번에 보는 자리가 **없었다.**
 *      세션은 워크플로 30여 개를 하나씩 뒤져야 했고, 오너는 텔레그램 본문을 읽어야 했다.
 *
 * 이 스크립트는 GitHub API 를 쓰지 않는다 — 각 워크플로가 저장소에 남기는
 * `data/*-last.md` 기록과 데이터셋 파일의 나이만 읽는다. 그래서 **오프라인에서도** 돌고,
 * Actions 로그를 못 보는 세션도 같은 답을 얻는다.
 *
 * 실행:
 *   node scripts/pipeline-status.mjs            # 표 한 장
 *   node scripts/pipeline-status.mjs --json     # 기계용
 *   node scripts/pipeline-status.mjs --strict   # 하나라도 늦었으면 종료코드 1 (CI·알림용)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => join(ROOT, p);

/* 오늘(KST). 컨테이너 시계가 UTC 라 더해 준다 — 하루 경계가 어긋나면 '늦음' 판정이 통째로 틀린다. */
const todayKst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

/**
 * 배관 목록. 새 워크플로를 만들면 여기 한 줄 추가한다 — 안 적으면 표에서 빠지고, 빠진 것은 안 보인다.
 *
 * ⚠️ **모든 배관이 매일 결과를 내야 하는 게 아니다.** 첫 판에서 그걸 구분하지 않아
 * '1000세대 명부'·'최고가 인덱스'가 정상인데 경고로 떴다. 맞는 것을 매번 지적하면
 * 지적을 안 읽게 된다 — 그래서 **무엇이 정상인지**를 배관마다 적는다:
 *
 *   daily     매일 결과가 나와야 한다. 안 나오면 고장이다
 *   periodic  N일 주기. 주기의 두 배가 지나면 늦은 것으로 본다
 *   untilDone 다 채우면 쉰다. '실제 호출 0회'가 **정상**이다(전부 완료)
 *   onDemand  큐를 밀 때만 돈다. 조용한 게 기본값이다
 *   paused    **일부러 멈춰 둔 것**. 안 도는 게 정답이다 — `why` 에 이유를 적는다
 *
 * ⚠️ `paused` 는 2026-08-27 에 생겼다. 오너가 "오늘 청약 메시지를 못 받았다"고 물어
 * 이 표를 열었더니 **국내 증시가 '늦음'으로 10일째 빨간불**이었다. 고장이 아니었다 —
 * 08-16 에 그 수집기가 지난 거래일을 지워서(오너 확정 카드의 근거가 사라졌다)
 * **사람이 일부러 cron 을 주석 처리해 둔 것**이었다. 맞는 것을 매일 지적하면
 * 지적을 안 읽게 되고, 그러면 진짜 고장도 같이 안 읽힌다. 그래서 상태를 나눈다.
 */
const PIPES = [
  { name: "청약홈 수집", mode: "daily", everyDays: 1, last: "data/applyhome-last.md", data: "data/datasets/applyhome-latest.json", tg: true, key: "DATA_GO_KR_API_KEY" },
  { name: "오늘의 신고가", mode: "daily", everyDays: 1, last: "data/singo-last.md", data: "data/datasets/singo-latest.json", tg: true, key: "MOLIT_API_KEY" },
  { name: "소재 보드 수집", mode: "daily", everyDays: 1, last: null, data: "research/ideas.json", tg: false },
  { name: "국내 증시", mode: "paused", last: null, data: "data/datasets/kr-market-2026.json", tg: false,
    why: "2026-08-16 사람이 cron 을 껐다 — 수집기가 지난 거래일을 지워 kospi-record 카드의 근거가 사라졌다.\n           코드는 그날 고쳤지만(합치기), 지켜 내는지 사람이 눈으로 본 뒤 다시 켠다. .github/workflows/kr-market.yml" },
  { name: "주간 매매·전세 지수", mode: "periodic", everyDays: 7, last: null, data: "data/datasets/reb-weekly-index.json", tg: true, key: "RONE_API_KEY" },
  { name: "전세·월세 지수(월간)", mode: "periodic", everyDays: 31, last: null, data: "data/datasets/reb-rent-index.json", tg: false, key: "RONE_API_KEY" },
  { name: "인구 수집", mode: "paused", last: "data/population-last.md", data: null, tg: false,
    why: "2026-08-27 오너가 자동 예약을 껐다 — 08-08 부터 매달 실패해 온 배관이라, 안 고칠 것을\n           예약에 올려 두면 매달 실패 톡이 한 통씩 오고 그러면 진짜 고장 톡도 같이 안 읽힌다.\n           수집기·소재 규칙·문서는 그대로다. 손잡이(data/population-queue.txt 푸시 · Run workflow)로 언제든 돈다." },
  { name: "1000세대 명부", mode: "untilDone", last: "data/apt-universe-last.md", data: "data/datasets/apt-universe.json", tg: true, key: "MOLIT_API_KEY" },
  { name: "최고가 인덱스", mode: "untilDone", last: "data/molit-peak-last.md", data: null, tg: true, key: "MOLIT_API_KEY" },
  /* ⚠️ 이 둘은 `last` 가 null 이었다 — 읽을 기록이 없으니 표가 **볼 것이 없었고**,
     완료형이라 늦음도 안 재서 **8/5·8/20 두 번 연속 실패가 초록불로 지나갔다**(2026-08-27).
     워크플로가 이제 기록을 남긴다. 기록이 실패라고 하면 표가 빨간불을 켠다. */
  { name: "실거래 수집(국토부)", mode: "untilDone", last: "data/molit-last.md", data: "data/datasets/molit", tg: true, key: "MOLIT_API_KEY" },
  { name: "전월세 실거래", mode: "untilDone", last: "data/molit-rent-last.md", data: "data/datasets/molit-rent", tg: true, key: "MOLIT_API_KEY" },
  { name: "신고가 단지 이력", mode: "onDemand", last: "data/singo-history-last.md", data: null, tg: true, key: "MOLIT_API_KEY" },
];

/** 파일이 마지막으로 **커밋된** 날. 워크플로가 커밋으로만 결과를 남기므로 이게 곧 "언제 일했나"다. */
function lastCommitDay(rel) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", rel], { cwd: ROOT, encoding: "utf8" }).trim();
    return out ? out.slice(0, 10) : null;
  } catch {
    return null;
  }
}

/** `data/*-last.md` 머리에 워크플로가 적어 둔 실행일·성공여부. 없으면 null. */
function readLast(rel) {
  if (!rel || !existsSync(R(rel))) return null;
  const t = readFileSync(R(rel), "utf8");
  const day = (t.match(/^- 실행:\s*(\d{4}-\d{2}-\d{2})/m) || [])[1] || null;
  const okRaw = (t.match(/^- 결과:\s*\*\*(.+?)\*\*/m) || [])[1] || null;
  const ok = okRaw ? /성공|success/i.test(okRaw) : null;
  /* 초록불이어도 아무것도 못 받은 날이 있다 — 그 문장을 직접 찾는다. */
  const zero = /수집 성공 0회|실제 호출 0회|수집 0회/.test(t);
  const why = (t.match(/❌[^\n]*/) || t.match(/⛔[^\n]*/) || [])[0] || null;
  return { day, ok, zero, why };
}

const dayDiff = (a, b) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86400000);

const rows = PIPES.map((p) => {
  const last = readLast(p.last);
  const dataDay = p.data && existsSync(R(p.data)) ? lastCommitDay(p.data) : null;
  /* "언제 마지막으로 일했나" 는 기록과 데이터 중 **더 최근**을 본다 —
     결과가 안 바뀐 날은 커밋이 없고(데이터 날짜가 안 움직임), 반대로 기록만 남는 날도 있다. */
  const seen = [last?.day, dataDay].filter(Boolean).sort().pop() || null;
  const age = seen ? dayDiff(todayKst, seen) : null;

  let state = "ok";
  /* 일부러 멈춘 배관은 '늦음'을 재지 않는다 — 안 도는 게 정답이라 잴 것이 없다. */
  if (p.mode === "paused") return { ...p, seen, age, state: "paused", why: p.why || null };
  /* 늦음 판정은 **매일·주기물에만** 건다. 다 채우면 쉬는 배관과 큐로만 도는 배관은
     조용한 게 정상이라, 여기에 늦음을 걸면 늘 경고가 떠 있게 된다. */
  if (p.mode === "daily" || p.mode === "periodic") {
    if (age == null || age > p.everyDays * 2) state = "stale";
  }
  /* '실제 호출 0회'는 배관에 따라 뜻이 정반대다 —
     매일 도는 배관에선 **빈손**(고장), 다 채우면 쉬는 배관에선 **완료**(정상). */
  if (last?.zero && (p.mode === "daily" || p.mode === "periodic")) state = "empty";
  /* 실패는 무엇보다 세다 — 마지막에 덮어쓴다. */
  if (last && last.ok === false) state = "fail";
  return { ...p, seen, age, state, why: last?.why || null };
});

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ today: todayKst, rows }, null, 2));
} else {
  const MARK = { ok: "✅", stale: "⏳", fail: "❌", empty: "⚠️ ", paused: "⏸" };
  const WORD = { ok: "정상", stale: "늦음", fail: "실패", empty: "빈손", paused: "멈춤(의도)" };
  const MODE = { daily: "매일", periodic: "주기", untilDone: "완료형", onDemand: "요청형", paused: "멈춤" };
  console.log(`\n🔧 배관 상태 — ${todayKst} (KST)\n`);
  console.log(`   ${"".padEnd(2)} ${"배관".padEnd(22)} ${"마지막".padEnd(12)} ${"경과".padEnd(6)} ${"주기".padEnd(7)} 알림  키`);
  console.log(`   ${"─".repeat(76)}`);
  for (const r of rows) {
    console.log(
      `   ${MARK[r.state]} ${r.name.padEnd(22)} ${(r.seen || "기록 없음").padEnd(12)} ` +
        `${(r.age == null ? "?" : `${r.age}일`).padEnd(6)} ${MODE[r.mode].padEnd(7)} ${r.tg ? "TG " : "   "}  ${r.key || ""}`,
    );
    /* 이유는 여러 줄일 수 있다(멈춘 배관의 사유). 줄바꿈을 살려 들여쓴다 —
       한 줄로 자르면 "왜 멈췄나"가 딱 잘려 이유가 아니라 수수께끼가 된다. */
    if (r.why)
      for (const line of String(r.why).split("\n").map((x) => x.trim()).filter(Boolean))
        console.log(`      ↳ ${line}`);
  }
  /* ── 기준 드리프트 검사 (2026-08-24)
     배관이 **도는데도** 기준이 조용히 좁아져 있을 수 있다. 실제로 그랬다:
     08-19 진단용으로 대기열에 민 `months=1` 한 줄이 예약 런의 상시 설정이 되어
     5일간 알림이 1개월치만 봤고, 전월 계약분(신고기한 30일 안에 뒤늦게 드러나는 건)이
     매일 0건이 됐다. **그동안 초록불이었다** — 늦지도, 실패하지도, 빈손도 아니었으니까.
     그래서 '언제 돌았나' 옆에 **'무엇을 재고 돌았나'**를 같이 본다. */
  const singoLast = R("data/singo-last.md");
  if (existsSync(singoLast)) {
    const t = readFileSync(singoLast, "utf8");
    const m = t.match(/최근\s*(\d+)\s*개월/);
    const trig = t.match(/방아쇠\s*`([^`]+)`/)?.[1] ?? "?";
    const auto = trig === "schedule" || trig === "workflow_run"; // 예약·자동 재시도
    if (m && auto && m[1] !== "2") {
      console.log(
        `\n   🔎 오늘의 신고가 — 마지막 자동 런이 **${m[1]}개월**치로 돌았습니다 (기준은 2개월).\n` +
          `      신고기한이 계약 후 30일이라 1개월이면 **전월 계약분이 통째로 빠집니다.**\n` +
          `      정본은 docs/guides/신고가-알림-기준.md.`,
      );
    }
  }

  /* 일부러 멈춘 것은 "손봐야 할 것"이 아니다 — 아래에 따로 한 줄로 알린다. */
  const bad = rows.filter((r) => r.state !== "ok" && r.state !== "paused");
  console.log("");
  if (!bad.length) console.log("   ✅ 전부 제때 돌고 있습니다\n");
  else {
    console.log(`   ⚠️  손봐야 할 것 ${bad.length}건 — ${bad.map((b) => `${b.name}(${WORD[b.state]})`).join(" · ")}\n`);
    /* 같은 키를 쓰는 배관이 함께 죽으면 배관이 아니라 **키**가 원인이다. 그걸 대신 말해 준다. */
    const byKey = {};
    for (const b of bad) if (b.key) (byKey[b.key] ||= []).push(b.name);
    for (const [k, ns] of Object.entries(byKey))
      if (ns.length > 1) console.log(`   🔑 ${k} 를 쓰는 배관 ${ns.length}개가 함께 멎었습니다 — 배관이 아니라 키를 의심하세요 (${ns.join(", ")})\n`);
  }
}

if (process.argv.includes("--strict") && rows.some((r) => r.state !== "ok" && r.state !== "paused")) process.exit(1);
