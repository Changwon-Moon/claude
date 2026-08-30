#!/usr/bin/env node
/**
 * 자동생성 문서 가지치기 — 저장소가 스스로 줄어들게 한다.
 *
 * 왜 필요한가 (2026-08-30 실측):
 *   저장소 md 193개 중 45개가 **매일 자동으로 늘어나는** 일일 기록이었다.
 *   그중 research/briefs 는 관제탑이 `latestBrief()` 로 **가장 최근 하나만** 읽는다 —
 *   나머지 28개는 아무도 안 읽는데 저장소에만 쌓이고 있었다.
 *
 *   자동으로 늘어나는 것은 자동으로 줄어야 한다. 사람이 손으로 지우면 언젠가 멈추고,
 *   멈춘 뒤에는 아무도 눈치채지 못한다.
 *
 * 규칙:
 *   - 보존 기간은 **읽는 쪽이 정한다**. 관제탑이 1개만 읽는다고 1개만 남기지는 않는다 —
 *     사람이 "어제 뭐였지"를 되짚는 폭(기본 14일)을 남긴다.
 *   - 지우는 것은 **날짜가 이름에 박힌 자동 산출물뿐**이다. 사람이 쓴 문서는 손대지 않는다.
 *     그래서 대상을 정규식으로 좁히고, 목록에 없는 폴더는 아예 보지 않는다.
 *   - 기본은 **미리보기**다(`--apply` 를 줘야 실제로 지운다). 조용히 지우지 않는다.
 *
 * 쓰는 법:
 *   node scripts/prune-auto-docs.mjs            # 무엇이 지워질지만 보여준다
 *   node scripts/prune-auto-docs.mjs --apply    # 실제로 지운다
 *   node scripts/prune-auto-docs.mjs --keep 30  # 보존 기간을 바꾼다
 */
import { readdirSync, unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** 가지치기 대상 — 여기 없는 폴더는 절대 건드리지 않는다 */
const TARGETS = [
  {
    dir: "research/briefs",
    // 2026-08-30-auto.md · 2026-07-26-ask-전세가율.md · 2026-07-19-mining.md
    match: /^(\d{4}-\d{2}-\d{2})-(auto|ask-.*|mining)\.md$/,
    why: "소재 보드 — 관제탑은 가장 최근 하나만 읽는다(buildState.latestBrief)",
  },
  {
    dir: "docs/daily",
    // 신고가재료-2026-08-30.md
    match: /^신고가재료-(\d{4}-\d{2}-\d{2})\.md$/,
    why: "신고가 재료 — 텔레그램 요약이 그날 것만 가리킨다(singo-digest)",
  },
];

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const KEEP_DAYS = (() => {
  const i = args.indexOf("--keep");
  if (i > -1 && args[i + 1]) {
    const n = Number(args[i + 1]);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return 14;
})();

/** 오늘(KST) — 러너가 UTC 라 그냥 Date 를 쓰면 하루가 어긋난다 */
function todayKst() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
}

const today = todayKst();
let removed = 0;
let kept = 0;
const lines = [];

for (const t of TARGETS) {
  const dir = join(ROOT, t.dir);
  if (!existsSync(dir)) {
    lines.push(`  (없음) ${t.dir}`);
    continue;
  }
  const files = readdirSync(dir).filter((f) => t.match.test(f)).sort();
  const old = [];
  for (const f of files) {
    const date = f.match(t.match)[1];
    const age = daysBetween(date, today);
    if (age > KEEP_DAYS) old.push({ f, date, age });
    else kept++;
  }
  lines.push(`\n▸ ${t.dir} — 전체 ${files.length}개 / 지울 것 ${old.length}개`);
  lines.push(`  ${t.why}`);
  for (const o of old) {
    lines.push(`    ${APPLY ? "🗑" : "·"} ${o.f}  (${o.age}일 전)`);
    if (APPLY) {
      unlinkSync(join(dir, o.f));
      removed++;
    }
  }
  if (!old.length) lines.push("    (지울 것 없음)");
}

console.log(`\n자동생성 문서 가지치기 — 기준일 ${today}(KST) · 보존 ${KEEP_DAYS}일`);
console.log(lines.join("\n"));

if (APPLY) {
  console.log(`\n✅ ${removed}개를 지웠습니다. 남은 것 ${kept}개.`);
  console.log("   커밋해야 저장소에 반영됩니다.");
} else {
  const n = lines.filter((l) => l.trim().startsWith("·")).length;
  console.log(`\nⓘ 미리보기입니다 — 아무것도 지우지 않았습니다. (${n}개가 대상)`);
  console.log("   실제로 지우려면: node scripts/prune-auto-docs.mjs --apply");
}
