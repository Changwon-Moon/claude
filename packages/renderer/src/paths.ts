import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

/** 저장소 루트 (packages/renderer/src → ../../../) */
export const REPO_ROOT = path.resolve(here, "..", "..", "..");

/** templates/ 디렉터리 */
export const TEMPLATES_DIR = path.join(REPO_ROOT, "templates");

/** templates/_shared/ 공통 자산 */
export const SHARED_DIR = path.join(TEMPLATES_DIR, "_shared");

/** 기본 출력 디렉터리 data/out */
export const DEFAULT_OUT_DIR = path.join(REPO_ROOT, "data", "out");
