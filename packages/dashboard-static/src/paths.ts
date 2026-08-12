/** 저장소 루트 기준 경로 헬퍼. dashboard-static/src 에서 두 단계 위가 repo 루트. */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(here, "../../..");

export const P = {
  briefs: resolve(REPO_ROOT, "research/briefs"),
  ideas: resolve(REPO_ROOT, "research/IDEAS.md"),
  ideasJson: resolve(REPO_ROOT, "research/ideas.json"),
  decisionLog: resolve(REPO_ROOT, "research/DECISION_LOG.md"),
  ceo: resolve(REPO_ROOT, "company/CEO.md"),
  teams: resolve(REPO_ROOT, "company/teams"),
  prompts: resolve(REPO_ROOT, "prompts"),
  content: resolve(REPO_ROOT, "data/content"),
  out: resolve(REPO_ROOT, "data/out"),
  review: resolve(REPO_ROOT, "data/review"),
  datasetCatalog: resolve(REPO_ROOT, "data/datasets/catalog.json"),
  logoCatalog: resolve(REPO_ROOT, "templates/_shared/logos/catalog.json"),
  photoCatalog: resolve(REPO_ROOT, "templates/_shared/photos/catalog.json"),
  logosDir: resolve(REPO_ROOT, "templates/_shared/logos"),
  photosDir: resolve(REPO_ROOT, "templates/_shared/photos"),
  stateOut: resolve(REPO_ROOT, "packages/dashboard/tower-state.json"),
  htmlOut: resolve(REPO_ROOT, "packages/dashboard/index.html"),
  /* 썸네일을 HTML 밖으로 뺀 자리(2026-08-12). build-tower-site 가 _site/thumbs 로 복사한다.
     경로가 index.html 과 같은 폴더 기준이라 상대 참조 `thumbs/imgN.jpg` 가 그대로 맞는다. */
  thumbsOut: resolve(REPO_ROOT, "packages/dashboard/thumbs"),
} as const;
