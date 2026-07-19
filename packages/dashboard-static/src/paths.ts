/** 저장소 루트 기준 경로 헬퍼. dashboard-static/src 에서 두 단계 위가 repo 루트. */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(here, "../../..");

export const P = {
  briefs: resolve(REPO_ROOT, "research/briefs"),
  ideas: resolve(REPO_ROOT, "research/IDEAS.md"),
  decisionLog: resolve(REPO_ROOT, "research/DECISION_LOG.md"),
  ceo: resolve(REPO_ROOT, "company/CEO.md"),
  teams: resolve(REPO_ROOT, "company/teams"),
  prompts: resolve(REPO_ROOT, "prompts"),
  content: resolve(REPO_ROOT, "data/content"),
  out: resolve(REPO_ROOT, "data/out"),
  datasetCatalog: resolve(REPO_ROOT, "data/datasets/catalog.json"),
  logoCatalog: resolve(REPO_ROOT, "templates/_shared/logos/catalog.json"),
  photoCatalog: resolve(REPO_ROOT, "templates/_shared/photos/catalog.json"),
  logosDir: resolve(REPO_ROOT, "templates/_shared/logos"),
  photosDir: resolve(REPO_ROOT, "templates/_shared/photos"),
  stateOut: resolve(REPO_ROOT, "packages/dashboard/tower-state.json"),
  htmlOut: resolve(REPO_ROOT, "packages/dashboard/index.html"),
} as const;
