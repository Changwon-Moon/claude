import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

/** 저장소 루트 (packages/collectors/src → ../../../) */
export const REPO_ROOT = path.resolve(here, "..", "..", "..");

/** raw 데이터 디렉터리 data/raw/{date} */
export function rawDir(date: string): string {
  return path.join(REPO_ROOT, "data", "raw", date);
}
