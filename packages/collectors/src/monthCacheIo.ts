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

export function readMonth(lawd: string, ym: string): MonthRow[] | null {
  const p = monthPath(lawd, ym);
  if (!existsSync(p)) return null;
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
