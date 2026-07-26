/**
 * 관제탑 정적 생성 CLI.
 *   tsx src/cli.ts state   → tower-state.json 만 생성
 *   tsx src/cli.ts html    → 기존 state로 index.html 생성
 *   tsx src/cli.ts all     → state + html (기본)
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { resolve } from "node:path";
import { P, REPO_ROOT } from "./paths.js";
import { buildState } from "./buildState.js";
import { renderTowerHtml, renderTowerBody } from "./renderHtml.js";
import type { TowerState } from "./types.js";

async function writeState(): Promise<TowerState> {
  const state = await buildState();
  mkdirSync(dirname(P.stateOut), { recursive: true });
  writeFileSync(P.stateOut, JSON.stringify(state, null, 2) + "\n", "utf8");
  const t = state.tickets.length;
  console.log(`✅ tower-state.json — 티켓 ${t}건, 팀 ${state.company.teams.length}, 원칙 ${state.company.principlesCount} (기준일 ${state.generatedFrom})`);
  console.log(`   단계별: 후보 ${state.counts.candidates} · 진행 ${state.counts.inProgress} · 승인대기 ${state.counts.awaiting} · 발행 ${state.counts.published}`);
  return state;
}

function writeHtml(state: TowerState): void {
  const html = renderTowerHtml(state);
  mkdirSync(dirname(P.htmlOut), { recursive: true });
  writeFileSync(P.htmlOut, html, "utf8");
  const kb = Math.round(Buffer.byteLength(html, "utf8") / 1024);
  console.log(`✅ index.html — ${kb}KB (packages/dashboard/index.html)`);
}

function writeArtifact(state: TowerState): void {
  const dest = resolve(REPO_ROOT, "packages/dashboard/artifact-body.html");
  writeFileSync(dest, renderTowerBody(state), "utf8");
  const kb = Math.round(Buffer.byteLength(renderTowerBody(state), "utf8") / 1024);
  console.log(`✅ artifact-body.html — ${kb}KB (아티팩트 발행용 body-only)`);
}

const cmd = process.argv[2] || "all";
if (cmd === "state") {
  await writeState();
} else if (cmd === "html") {
  const state = JSON.parse(readFileSync(P.stateOut, "utf8")) as TowerState;
  writeHtml(state);
} else if (cmd === "artifact") {
  writeArtifact(await buildState());
} else if (cmd === "all") {
  const state = await writeState();
  writeHtml(state);
  writeArtifact(state);
} else {
  console.error(`알 수 없는 명령: ${cmd} (state|html|artifact|all)`);
  process.exit(1);
}
