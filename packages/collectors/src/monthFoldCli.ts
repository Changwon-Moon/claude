/**
 * 📦 「구 × 월」 캐시를 **이미 받아 둔 원본에서** 접는다 — 호출 0회
 *
 *   tsx src/monthFoldCli.ts [--from 202601] [--to 202608] [--lawd 41210] [--force]
 *
 * ── 왜 (2026-09-02)
 * `data/datasets/molit/{구}-{연월}.json` 에는 이미 받아 둔 **원본 거래**가 있다.
 * 백필(`monthBackfillCli`)은 같은 달을 **다시 받는다** — 캐시 칸이 비어 있다는 것만 보고,
 * 원본이 저장소에 있는지는 안 보기 때문이다.
 *
 * 2026-09-02 실측: 명부 61구 × 2026-01~07 중 **416칸**의 원본이 이미 저장소에 있었다.
 * 그걸 다시 받으면 416회 — 아침 신고가 알림 사흘치다. **받아 둔 것은 다시 받지 않는다.**
 *
 * ── 접는 규칙은 여기 없다
 * `parse/monthCache.ts` 의 `foldMonth` 하나가 정본이다. 백필이 API 응답에 쓰는 것과
 * **똑같은 함수**를 원본 파일에 쓴다 — 그래야 「원본에서 접은 칸」과 「받아서 접은 칸」이
 * 같은 얼굴이 된다. 갈라지면 같은 입력이 다른 픽셀을 낳는다.
 *
 * ── ⚠️ 최근 두 달은 접지 않는다
 * 실거래 신고기한이 30일이라 이번 달·지난달 원본은 아직 덜 찬 상태다. 그걸 캐시에 굳히면
 * 「그 달은 원래 그만큼이었다」로 읽힌다. 최근 두 달은 아침 알림이 매일 덮어쓰는 몫이다.
 * (`--force` 로 굳이 덮을 수는 있지만, 정기 배관에서는 쓰지 않는다.)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { foldMonth } from "./parse/monthCache.js";
import { hasMonth, writeMonth } from "./monthCacheIo.js";
import { buildUniverseLookup, type UniverseItem } from "./universeIndex.js";
import type { AptTrade } from "./parse/molit.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const R = (p: string) => join(ROOT, p);
const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const RAW_DIR = R("data/datasets/molit");
const FROM = arg("from") ?? "200601";
const TO = arg("to") ?? "999912";
const ONLY = arg("lawd");
const FORCE = process.argv.includes("force") || process.argv.includes("--force");

/** 최근 두 달(KST 기준) — 신고가 덜 들어와 있어 굳히지 않는다 */
function recentTwo(): Set<string> {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  const out = new Set<string>();
  for (let i = 0; i < 2; i++) {
    const d = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth() - i, 1));
    out.add(`${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

function main() {
  if (!existsSync(RAW_DIR)) {
    console.error("::error::원본 폴더(data/datasets/molit)가 없습니다");
    process.exit(1);
  }
  const uniPath = R("data/datasets/apt-universe.json");
  if (!existsSync(uniPath)) {
    console.error("::error::명부(apt-universe.json)가 없습니다 — 캐시는 명부 단지만 담습니다");
    process.exit(1);
  }
  const lookup = buildUniverseLookup();
  if (!lookup) {
    console.error("::error::명부 조회판을 못 만들었습니다 — 덜 담긴 캐시는 오보가 됩니다. 여기서 멈춥니다");
    process.exit(1);
  }
  const items: UniverseItem[] = JSON.parse(readFileSync(uniPath, "utf8")).items ?? [];
  const inUniverse = new Set(items.map((x) => x.lawdCd));

  const skipYm = FORCE ? new Set<string>() : recentTwo();
  let seen = 0, folded = 0, already = 0, skippedRecent = 0, offUniverse = 0, broken = 0;

  const files = readdirSync(RAW_DIR).filter((f) => /^\d+-\d{6}\.json$/.test(f)).sort();
  for (const f of files) {
    const [lawdCd, ym] = f.replace(/\.json$/, "").split("-");
    if (ONLY && lawdCd !== ONLY) continue;
    if (ym < FROM || ym > TO) continue;
    /* ⚠️ 명부 밖 구의 원본도 저장소에 있다(인천·지방 학군지 카드가 받아 둔 것).
       캐시는 명부 61곳의 것이라 그 구를 담으면 `scope: "universe"` 가 거짓이 된다. */
    if (!inUniverse.has(lawdCd)) { offUniverse++; continue; }
    seen++;
    if (skipYm.has(ym)) { skippedRecent++; continue; }
    if (hasMonth(lawdCd, ym) && !FORCE) { already++; continue; }
    let trades: AptTrade[];
    try {
      trades = JSON.parse(readFileSync(join(RAW_DIR, f), "utf8")).trades ?? [];
    } catch {
      broken++;
      continue;
    }
    writeMonth(lawdCd, ym, foldMonth(trades, (umd, apt, jb) => !!lookup(lawdCd, umd, apt, jb)));
    folded++;
  }

  const line =
    `- 원본 파일 ${files.length}개 중 명부 구 ${seen}개 확인\n` +
    `- **새로 접은 칸: ${folded}개** (호출 0회)\n` +
    `- 이미 있던 칸 ${already}개 · 최근 두 달이라 건너뜀 ${skippedRecent}개 · 명부 밖 구 ${offUniverse}개` +
    (broken ? ` · 깨진 원본 ${broken}개` : "");
  writeFileSync(
    R("data/molit-fold-last.md"),
    `# 「구 × 월」 캐시 접기(원본에서) — 마지막 실행\n\n` +
      `- 실행: ${new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)} (KST)\n` +
      `${line}\n\n` +
      `> 최근 두 달은 실거래 신고기한(30일) 때문에 굳히지 않습니다 — 아침 신고가 알림의 몫입니다.\n`,
  );
  console.log(`📦 원본에서 접기\n${line}`);
}

main();
