#!/usr/bin/env node
/**
 * 배관 계기판 재료 만들기 — Actions 실행 이력 → data/actions-health.json
 *
 * 왜 필요한가 (2026-08-31):
 *   예약 실행률을 "48시간"으로 쟀을 때 신고가는 **0%**로 보였다. 그래서 배관이 통째로
 *   죽은 줄 알았다. 30일로 늘려 **날짜별로 펼치자** 전혀 다른 그림이 나왔다 —
 *   08-14~08-26 은 13/13 도착에 지연 중앙값 9분으로 멀쩡했고, 08-27 부터 무너진 것이었다.
 *
 *   **평균은 거짓말을 한다.** 두 시기를 하나의 숫자로 뭉개면 원인이 사라진다.
 *   그래서 이 파일은 비율을 굽지 않고 **날짜별 점**을 굽는다. 모양을 봐야 원인이 보인다.
 *
 * 왜 브라우저가 직접 API 를 안 부르나:
 *   관제탑은 정적 사이트고, 브라우저에서 GitHub API 를 부르려면 **토큰을 연결한 상태**여야
 *   한다(라이브 모드). 토큰 없이 연 사람에게는 빈 화면이 된다.
 *   계기판은 "배관이 지금 어떤가"를 **아무 때나 폰으로 확인**하려고 만드는 것이라,
 *   미리 구워서 파일로 두는 쪽이 맞다.
 *
 * 갱신 시점:
 *   `tower-deploy.yml` 안에서 돈다. 그 워크플로는 2026-08-31 에 예약을 뗐고
 *   **푸시가 방아쇠**다 → 세션이 작업하고 밀 때마다 갱신된다.
 *   ⚠️ 그래서 이 파일은 **실시간이 아니라 마지막 배포 시점의 스냅샷**이다.
 *      화면에 기준 시각을 크게 적어야 오해가 없다.
 *
 * 토큰이 없으면(로컬 등) 조용히 건너뛴다 — 계기판이 없다고 배포가 막히면 안 된다.
 *
 * 쓰는 법: GITHUB_TOKEN=... node scripts/collect-actions-health.mjs
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data/actions-health.json");
const DAYS = 30;      // 얼마나 거슬러 볼지
const DOTS = 14;      // 화면에 그릴 날짜 점 개수

const TOKEN = process.env.GITHUB_TOKEN || process.env.WIRIT_GH_PAT || "";
const REPO = process.env.GITHUB_REPOSITORY || "Changwon-Moon/claude";

if (!TOKEN) {
  console.log("⏭  토큰이 없어 계기판을 건너뜁니다 (배포는 계속됩니다)");
  process.exit(0);
}

/** KST 로 바꾼 Date */
const kst = (iso) => new Date(Date.parse(iso) + 9 * 3600 * 1000);
const ymd = (d) => d.toISOString().slice(0, 10);
const hm = (d) => d.toISOString().slice(11, 16);

async function api(path) {
  const res = await fetch("https://api.github.com" + path, {
    headers: {
      Authorization: "Bearer " + TOKEN,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} ${path}`);
  return res.json();
}

/** 워크플로 파일에서 활성 cron 을 읽는다(주석 처리된 것은 예약이 아니다) */
function activeCron(file) {
  const t = readFileSync(join(ROOT, ".github/workflows", file), "utf8");
  const out = [];
  for (const line of t.split("\n")) {
    if (/^\s*#/.test(line)) continue;              // ← 주석은 예약이 아니다
    const m = line.match(/-\s*cron:\s*['"]([^'"]+)['"]/);
    if (m) out.push(m[1]);
  }
  return out;
}

/** 이 워크플로 파일이 마지막으로 바뀐 날 (KST, YYYY-MM-DD)
 *
 * ⚠️ 왜 필요한가: cron 을 바꾸면 **과거 실행을 새 시각 기준으로 재게 된다.**
 *    2026-08-31 에 신고가를 07:03 → 04:55 로 옮겼더니 그전 2주치가 전부
 *    「2시간 지연」으로 찍혔다. 실제로는 지연 9분으로 멀쩡했던 날들이다.
 *    파일이 바뀐 날 이전의 런은 **지연을 재지 않는다** — 모르면 모른다고 둔다.
 *    (파일 수정일이 곧 cron 변경일은 아니지만, 안전한 쪽으로 넉넉히 잡는 것이다) */
function fileChangedOn(file) {
  try {
    return execFileSync("git", ["log", "-1", "--format=%ad", "--date=short", "--",
      `.github/workflows/${file}`], { cwd: ROOT, encoding: "utf8" }).trim() || null;
  } catch { return null; }
}

/** cron 의 예정 시각(KST) — 분·시만 본다 */
function dueKst(cron) {
  const [mi, hh] = cron.split(" ");
  if (mi.includes("*") || hh.includes("*") || hh.includes("/")) return null;
  return { h: (Number(hh) + 9) % 24, m: Number(mi) };
}

const since = ymd(new Date(Date.now() - DAYS * 86400000));
const files = readdirSync(join(ROOT, ".github/workflows")).filter((f) => f.endsWith(".yml"));

const scheduled = [];
const manual = [];

for (const f of files) {
  const crons = activeCron(f);
  let runs = [];
  try {
    const d = await api(`/repos/${REPO}/actions/workflows/${f}/runs?per_page=100&created=>=${since}`);
    runs = d.workflow_runs || [];
  } catch {
    continue; // 등록 안 된 워크플로 등 — 조용히 넘긴다
  }
  const name = (readFileSync(join(ROOT, ".github/workflows", f), "utf8")
    .match(/^name:\s*(.+)$/m) || [, f])[1].trim();
  const last = runs.length
    ? runs.map((r) => r.created_at).sort().slice(-1)[0]
    : null;
  /* ⚠️ **실행 ≠ 성공** (2026-08-31 실측으로 알게 됐다).
     인구 수집의 lastRun 은 08-08 이었지만 그날 실패했고, 마지막 **성공**은 08-04 였다.
     계기판이 "22일 전"이라 보여줬는데 실제로 데이터가 안 들어온 것은 27일이었다 —
     KOSIS 키 만료를 그만큼 늦게 발견했다. 둘을 나눠 담는다. */
  const okRuns = runs.filter((r) => r.conclusion === "success");
  const lastOk = okRuns.length
    ? okRuns.map((r) => r.created_at).sort().slice(-1)[0]
    : null;

  if (!crons.length) {
    manual.push({
      file: f, name,
      lastRun: last ? ymd(kst(last)) : null,
      // 마지막 실행이 언제인지가 핵심 — "수동"이 "안 함"이 되는 것을 잡는다
      daysAgo: last ? Math.floor((Date.now() - Date.parse(last)) / 86400000) : null,
      // 그리고 **성공**이 언제인지가 더 중요하다 — 돌기만 하고 계속 실패할 수 있다
      lastOk: lastOk ? ymd(kst(lastOk)) : null,
      okDaysAgo: lastOk ? Math.floor((Date.now() - Date.parse(lastOk)) / 86400000) : null,
      fails30: runs.filter((r) => r.conclusion === "failure").length,
      runs30: runs.length,
    });
    continue;
  }

  /* 예약 워크플로 — 날짜별 점을 만든다 */
  const due = dueKst(crons[0]);
  const changedOn = fileChangedOn(f);   // 이 날 이전 런은 다른 cron 이었을 수 있다
  const byDay = new Map();
  for (const r of runs) {
    if (r.event !== "schedule") continue;
    const k = kst(r.created_at);
    const day = ymd(k);
    let delay = null;
    if (due && (!changedOn || day >= changedOn)) {
      const d0 = new Date(k); d0.setUTCHours(due.h, due.m, 0, 0);
      if (k < d0) d0.setUTCDate(d0.getUTCDate() - 1);
      delay = Math.round((k - d0) / 60000);
    }
    const prev = byDay.get(day);
    if (!prev || (prev.delay ?? 1e9) > (delay ?? 1e9)) {
      byDay.set(day, { at: hm(k), delay, ok: r.conclusion === "success" });
    }
  }

  const dots = [];
  for (let i = DOTS - 1; i >= 0; i--) {
    const day = ymd(new Date(Date.now() + 9 * 3600000 - i * 86400000));
    const v = byDay.get(day);
    dots.push({
      day: day.slice(5),
      // 정시(30분 이내) / 지연 / 실패 / 없음 — 비율이 아니라 모양을 남긴다
      // 지연을 모르는 날(cron 변경 이전)은 성공이면 ok — 함부로 '지연'이라 하지 않는다
      state: !v ? "none"
           : !v.ok ? "fail"
           : v.delay == null ? "ok"
           : v.delay <= 30 ? "ontime" : "late",
      at: v?.at ?? null,
      delay: v?.delay ?? null,
    });
  }
  const delays = [...byDay.values()].filter((v) => v.delay != null).map((v) => v.delay).sort((a, b) => a - b);
  scheduled.push({
    file: f, name, cron: crons[0],
    dueKst: due ? `${String(due.h).padStart(2, "0")}:${String(due.m).padStart(2, "0")}` : null,
    dots,
    medianDelay: delays.length ? delays[Math.floor(delays.length / 2)] : null,
    maxDelay: delays.length ? delays[delays.length - 1] : null,
    lastRun: last ? ymd(kst(last)) : null,
    lastOk: lastOk ? ymd(kst(lastOk)) : null,
    okDaysAgo: lastOk ? Math.floor((Date.now() - Date.parse(lastOk)) / 86400000) : null,
  });
}

scheduled.sort((a, b) => (a.dueKst || "").localeCompare(b.dueKst || ""));
manual.sort((a, b) => (b.daysAgo ?? 1e9) - (a.daysAgo ?? 1e9));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  windowDays: DAYS,
  scheduled,
  manual,
}, null, 2) + "\n");

console.log(`✅ 계기판 재료: 예약 ${scheduled.length}개 · 수동 ${manual.length}개 → data/actions-health.json`);
for (const s of scheduled) {
  const line = s.dots.map((d) => ({ ontime: "●", late: "◐", fail: "✕", ok: "○", none: "·" }[d.state])).join("");
  console.log(`   ${s.dueKst ?? "  —  "} ${line} ${s.name}`);
}
