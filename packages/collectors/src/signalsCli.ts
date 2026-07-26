#!/usr/bin/env node
/**
 * 소재 보드 생성 CLI.
 * 사용: collect-signals [--date YYYY-MM-DD] [--query "전세가율 전세난"]
 *
 *   (기본)    고정 주제 11개를 훑는다 → research/briefs/{date}-auto.md
 *   --query   오너가 지시한 말 그대로 뉴스를 검색한다 → research/briefs/{date}-ask-{n}.md
 *
 * --query 가 왜 있나: "전세 자료 찾아줘" 같은 지시가 접수만 되고 아무 일도
 * 안 일어나던 문제(2026-07-26 오너 보고)를 없애기 위해. 지시가 곧 검색어가 된다.
 *
 * 출력: research/briefs/*.md + data/raw/{date}/research-signals*.json
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT, rawDir } from "./paths.js";
import { collectResearchSignals, renderBoard, queryFeeds } from "./sources/researchSignals.js";

function parseArgs(argv: string[]): { date: string; query: string } {
  let date = new Date().toISOString().slice(0, 10);
  let query = "";
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--date") date = argv[++i];
    else if (argv[i] === "--query") query = argv[++i] || "";
  }
  return { date, query: query.trim() };
}

/** 파일명에 쓸 수 있게 키워드를 줄인다 — 결정적(같은 지시 = 같은 파일). */
function slugOf(q: string): string {
  const s = q.replace(/[^0-9A-Za-z가-힣]+/g, "-").replace(/^-+|-+$/g, "");
  return (s || "ask").slice(0, 24);
}

async function main(): Promise<void> {
  const { date, query } = parseArgs(process.argv.slice(2));
  console.log(query ? `🔎 지시 수집 (${date}) — "${query}"` : `🔎 소재 신호 수집 (${date})`);

  const feeds = query ? queryFeeds(query) : undefined;
  if (query && (!feeds || feeds.length === 0)) {
    console.log("검색어가 비어 있습니다 — 건너뜁니다.");
    return;
  }
  const { signals, trendKeywords } = await collectResearchSignals(feeds);
  const ok = signals.filter((s) => !s.error);
  const failed = signals.filter((s) => s.error);
  const total = ok.reduce((n, s) => n + s.items.length, 0);
  const demandHits = ok.reduce(
    (n, s) => n + s.items.filter((i) => i.demand).length,
    0,
  );

  // JSON 원본 저장 (추후 R2 기획 에이전트의 입력)
  const jdir = rawDir(date);
  fs.mkdirSync(jdir, { recursive: true });
  const tag = query ? `-ask-${slugOf(query)}` : "";
  fs.writeFileSync(
    path.join(jdir, `research-signals${tag}.json`),
    JSON.stringify({ date, query, trendKeywords, signals }, null, 2),
    "utf8",
  );

  // 소재 보드 마크다운
  const bdir = path.join(REPO_ROOT, "research", "briefs");
  fs.mkdirSync(bdir, { recursive: true });
  const boardPath = path.join(bdir, `${date}${tag || "-auto"}.md`);
  fs.writeFileSync(boardPath, renderBoard(date, signals, trendKeywords, query), "utf8");

  console.log(`✅ 소재 보드: ${boardPath}`);
  console.log(
    `   주제 ${ok.length}개(항목 ${total}건, 수요신호📈 ${demandHits}건, 트렌드 키워드 ${trendKeywords.length}개), 실패 ${failed.length}개`,
  );
  for (const f of failed) console.log(`   ⚠️ ${f.topic}: ${f.error}`);
  if (ok.length === 0) process.exit(1); // 전부 실패 시 알림 트리거
}

main().catch((err) => {
  console.error(`실패: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
