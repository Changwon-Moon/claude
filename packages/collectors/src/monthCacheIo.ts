/**
 * 「구 × 월」 최고가 캐시의 **파일 쪽** — 접는 규칙은 `parse/monthCache.ts` 가 정본이다.
 *
 * 경로: `data/datasets/molit-monthly/{구코드}/{연월}.json`
 *
 * 구별 폴더로 나누는 이유: 61구 × 81개월 = 4,941 칸이라 한 폴더에 몰면 열어 보기 어렵다.
 * 그리고 한 칸이 수 KB 라 git 이 바뀐 칸만 담는다 — 통 파일이면 매일 전체가 다시 쓰인다.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { MonthCache, MonthRow } from "./parse/monthCache.js";

/* ⚠️ `process.cwd()` 를 쓰지 않는다 — `pnpm --filter` 로 부르면 작업 폴더가 바뀐다
   (이 저장소의 알려진 함정: supplyAreaCli 머리말 참고). */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const MONTH_DIR = join(ROOT, "data/datasets/molit-monthly");

export const monthPath = (lawd: string, ym: string) => join(MONTH_DIR, lawd, `${ym}.json`);
export const hasMonth = (lawd: string, ym: string) => existsSync(monthPath(lawd, ym));

/* ── ⚠️⚠️ **최근 달은 캐시를 믿지 않는다** (2026-09-04 실측)
 *
 * 이 캐시는 「과거 달의 값은 변하지 않는다」는 가정 위에 서 있었다. **그게 틀렸다.**
 * 실거래 신고는 **최대 30일** 늦다 — 지난 달·지지난 달 값은 계속 자란다.
 *
 * 09-04 에 이것 하나로 카드 **7장**이 막혔다:
 *   캐시 41117/202608(savedAt 2026-09-02) 은 벽적골9단지주공 59 의 8월 최고를 6.9억이라 했는데,
 *   그날 신고가 판정은 **8월 22일 계약 7.18억**을 집었다. 9월에 신고된 8월 계약이라
 *   09-02 에 접어 둔 캐시에는 있을 수가 없었다. 곡선이 신고가보다 낮으니 빌더가 멈췄다.
 *   대기열의 `force=1` 로 다시 받아도 **월 캐시를 먼저 읽어** 숫자가 그대로였다.
 *   캐시 17칸을 손으로 지우자 8장이 14장이 됐다.
 *
 * → **오늘로부터 RECENT_MONTHS 안쪽 달은 캐시가 있어도 없는 것으로 본다**(다시 받는다).
 *   호출 절감 효과는 거의 그대로다 — 바뀌는 것은 최근 몇 달뿐이고, 나머지 70여 달은 캐시가 받는다.
 * ⚠️ 이 값을 줄이려면 「신고 지연이 30일」이라는 사실부터 뒤집어야 한다. 함부로 줄이지 않는다. */
export const RECENT_MONTHS = 3;

/** 오늘 기준 `RECENT_MONTHS` 안쪽 달인가 — 그렇다면 캐시를 안 믿는다. */
export function isRecentMonth(ym: string, today = new Date(Date.now() + 9 * 3600 * 1000)): boolean {
  const cur = today.getUTCFullYear() * 12 + today.getUTCMonth();
  const m = Number(ym.slice(0, 4)) * 12 + Number(ym.slice(4, 6)) - 1;
  return cur - m < RECENT_MONTHS;
}

export function readMonth(lawd: string, ym: string): MonthRow[] | null {
  const p = monthPath(lawd, ym);
  if (!existsSync(p)) return null;
  if (isRecentMonth(ym)) return null; // ← 최근 달은 캐시를 건너뛰고 API 에서 새로 받는다
  try {
    const j = JSON.parse(readFileSync(p, "utf8")) as MonthCache;
    /* ⚠️ scope 가 안 적힌 옛 파일은 **믿지 않는다.** 무엇을 걸러 담았는지 모르는 캐시로
       곡선을 그리면 「거래가 없던 달」과 「안 담긴 달」이 같은 얼굴이 된다 — 그건 오보다. */
    if (j.scope !== "universe") return null;
    return Array.isArray(j.rows) ? j.rows : null;
  } catch {
    return null; // 깨진 칸은 없는 것으로 본다 — 다시 받으면 된다
  }
}

/** 칸을 쓴다. **내용이 같으면 안 쓴다** — 매일 같은 파일을 다시 커밋하지 않기 위해서다. */
export function writeMonth(lawd: string, ym: string, rows: MonthRow[]): boolean {
  const p = monthPath(lawd, ym);
  const body =
    JSON.stringify(
      { lawd, ym, savedAt: new Date().toISOString().slice(0, 10), scope: "universe", rows } satisfies MonthCache,
      null,
      0,
    ) + "\n";
  if (existsSync(p)) {
    try {
      const old = JSON.parse(readFileSync(p, "utf8")) as MonthCache;
      if (JSON.stringify(old.rows) === JSON.stringify(rows)) return false;
    } catch { /* 깨졌으면 새로 쓴다 */ }
  }
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
  return true;
}

/** 그 구에 채워진 달 목록 — 백필이 어디까지 왔는지 볼 때 쓴다 */
export function monthsOf(lawd: string): Set<string> {
  const d = join(MONTH_DIR, lawd);
  if (!existsSync(d)) return new Set();
  return new Set(readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")));
}
