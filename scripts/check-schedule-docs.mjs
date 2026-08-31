#!/usr/bin/env node
/**
 * 문서 ↔ 배관 정합 검사 — 문서가 **없는 예약**을 가르치고 있지 않은가.
 *
 * 왜 필요한가 (2026-08-31):
 *   예약을 16개에서 4개로 줄이고 신고가 시각을 07:03 → 04:55 로 옮겼는데,
 *   **문서 9곳이 여전히 "매일 07:00 자동 실행"이라고 가르치고 있었다.**
 *   다음 세션은 그 문서를 읽고 "자동으로 돈다"고 믿는다. 그리고 안 돌아도 모른다.
 *
 *   배관을 고치는 것과 배관 설명을 고치는 것은 **다른 일**이다.
 *   사람이 둘을 같이 하리라 기대하면 안 된다 — 오늘 나도 못 했다.
 *
 * 무엇을 재나:
 *   ① 문서가 적은 `xx:xx KST 예약/자동` 시각이 실제 cron 과 맞는가
 *   ② 문서가 "매일 자동"이라 말하는 워크플로에 **활성 cron 이 실제로 있는가**
 *      (주석 처리된 cron 은 예약이 아니다)
 *
 * 무엇을 안 재나:
 *   과거 서사(`docs/archive/`·`docs/history/`)와 「2026-08-31 변경」처럼 **날짜를 밝힌 기록**.
 *   사료는 그때의 사실을 적은 것이라 고치면 역사가 왜곡된다.
 *
 * 쓰는 법: node scripts/check-schedule-docs.mjs   (어긋나면 종료코드 1)
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = ["node_modules", ".git"];
const SKIP_PATHS = [`docs${"/"}archive`, `docs${"/"}history`, "published", "research/work-orders"];

/* ── 1. 실제 활성 예약을 읽는다 (주석 처리된 cron 은 예약이 아니다) ── */
const WF = join(ROOT, ".github/workflows");
const live = new Map(); // 파일명 → [KST "HH:MM", …]
for (const f of readdirSync(WF).filter((x) => x.endsWith(".yml"))) {
  const times = [];
  for (const line of readFileSync(join(WF, f), "utf8").split("\n")) {
    if (/^\s*#/.test(line)) continue;
    const m = line.match(/-\s*cron:\s*['"]([^'"]+)['"]/);
    if (!m) continue;
    const [mi, hh] = m[1].split(" ");
    if (mi.includes("*") || hh.includes("*") || hh.includes("/")) { times.push("*"); continue; }
    times.push(`${String((Number(hh) + 9) % 24).padStart(2, "0")}:${mi.padStart(2, "0")}`);
  }
  if (times.length) live.set(f, times);
}
const liveTimes = new Set([...live.values()].flat());

/* ── 2. 문서를 훑는다 ── */
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP.includes(e)) continue;
    const p = join(dir, e);
    const rel = relative(ROOT, p);
    if (SKIP_PATHS.some((s) => rel === s || rel.startsWith(s + "/"))) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".md")) out.push(p);
  }
  return out;
}

const problems = [];
for (const f of walk(ROOT)) {
  const rel = relative(ROOT, f);
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    /* 날짜를 밝힌 기록·취소선은 사료다 */
    if (/20\d\d-\d\d-\d\d|~~/.test(line)) return;

    // ① "매일 HH:MM" · "HH:MM KST 예약/자동" 형태
    for (const m of line.matchAll(/(?:매일\s*)?(\d{1,2}):(\d{2})\s*(?:KST)?\s*(?:예약|자동|에 자동)/g)) {
      const t = `${m[1].padStart(2, "0")}:${m[2]}`;
      if (!liveTimes.has(t)) {
        problems.push({ rel, line: i + 1, what: `${t} — 그 시각에 도는 예약이 없다`, text: line.trim().slice(0, 80) });
      }
    }
    // ② "매일 자동으로 실행" 이라 적힌 워크플로에 활성 cron 이 있는가
    for (const m of line.matchAll(/([a-z0-9-]+\.yml)/g)) {
      if (!/매일|자동 실행|정기 실행/.test(line)) continue;
      if (!live.has(m[1]) && existsSync(join(WF, m[1]))) {
        problems.push({ rel, line: i + 1, what: `${m[1]} — 활성 cron 이 없는데 '매일/자동'이라 적혀 있다`, text: line.trim().slice(0, 80) });
      }
    }
  });
}

console.log(`\n문서 ↔ 배관 정합 — 활성 예약 ${live.size}개 (${[...liveTimes].filter((t) => t !== "*").sort().join(" · ")})`);
if (!problems.length) {
  console.log("✅ 문서가 없는 예약을 가르치지 않습니다\n");
  process.exit(0);
}
for (const p of problems) console.log(`  ❌ ${p.rel}:${p.line} — ${p.what}\n     ${p.text}`);
console.log(`
❌ ${problems.length}건. 배관을 바꿨으면 **설명도 같이 바꾼다.**
   다음 세션은 이 문서를 읽고 "자동으로 돈다"고 믿는다 — 그리고 안 돌아도 모른다.
   지난 사실을 남기려면 날짜를 밝히거나(~2026-08-31 변경~) 취소선을 쓴다.
`);
process.exit(1);
