/**
 * 한국은행 ECOS — M2(광의통화) 월별 시계열 수집 + 통계표/항목 검증(probe).
 *
 * ── 왜 별도 CLI 인가
 * 세션 컨테이너에서는 `ecos.bok.or.kr` 이 egress 허용목록 밖이라 아예 열리지 않는다.
 * 그래서 **Actions(망 개방 + ECOS_API_KEY 시크릿)** 에서만 돌린다.
 *
 * ── 무엇을 남기나 (세션의 유일한 눈은 커밋된 파일이다)
 *  1) `data/ecos-m2-probe.md`     — 어떤 통계표·항목을 골랐는지, 후보들이 뭐라 답했는지
 *  2) `data/datasets/m2-monthly.json` — M2 월별 원자료(정규화, provenance 포함)
 *
 * ── 통계표 후보
 * 사람이 "이게 그 표다"라고 못박지 않는다. 통계표 목록 API 로 **훑어서 코드가 고른다**.
 * 확인 순서: 101 하위 통계표 목록 → 후보별 항목 목록 → M2 항목 → 월별 데이터.
 */
import fs from "node:fs";
import path from "node:path";
import { fetchText, redactUrl } from "./http.js";
import { parseEcosJson } from "./parse/ecos.js";
import { REPO_ROOT } from "./paths.js";

const BASE = "https://ecos.bok.or.kr/api";

const KEY = process.env.ECOS_API_KEY ?? "";
if (!KEY) {
  console.error("ECOS_API_KEY 가 없습니다. (GitHub Secrets)");
  process.exit(1);
}

/** 관측 시작월 — 노무현 정부 취임(2003-02) 직전월까지 포함해야 증가폭을 잴 수 있다 */
const START = "199801";

const log: string[] = [];
function say(s: string) {
  console.log(s);
  log.push(s);
}

async function getJson(url: string): Promise<any> {
  const text = await fetchText(url, { retries: 3, timeoutMs: 30000 });
  const data = JSON.parse(text);
  if (data?.RESULT?.CODE) {
    throw new Error(`ECOS ${data.RESULT.CODE}: ${data.RESULT.MESSAGE} — ${redactUrl(url)}`);
  }
  return data;
}

function nowYm(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** 통계표 목록: 101(통화/유동성) 하위 */
async function listTables(): Promise<Array<{ code: string; name: string; cycle: string }>> {
  const url = `${BASE}/StatisticTableList/${KEY}/json/kr/1/500/101`;
  const data = await getJson(url);
  const rows = data?.StatisticTableList?.row ?? [];
  return rows.map((r: any) => ({
    code: String(r.STAT_CODE ?? ""),
    name: String(r.STAT_NAME ?? ""),
    cycle: String(r.CYCLE ?? ""),
  }));
}

/** 항목 목록 */
async function listItems(statCode: string): Promise<Array<{ code: string; name: string; unit: string }>> {
  const url = `${BASE}/StatisticItemList/${KEY}/json/kr/1/500/${statCode}`;
  const data = await getJson(url);
  const rows = data?.StatisticItemList?.row ?? [];
  return rows.map((r: any) => ({
    code: String(r.ITEM_CODE ?? ""),
    name: String(r.ITEM_NAME ?? ""),
    unit: String(r.UNIT_NAME ?? ""),
  }));
}

async function fetchSeries(statCode: string, itemCode: string, end: string) {
  const url = `${BASE}/StatisticSearch/${KEY}/json/kr/1/1000/${statCode}/M/${START}/${end}/${itemCode}`;
  const text = await fetchText(url, { retries: 3, timeoutMs: 40000 });
  const raw = JSON.parse(text);
  const points = parseEcosJson(text);
  const unit = String(raw?.StatisticSearch?.row?.[0]?.UNIT_NAME ?? "");
  return { points, unit };
}

async function main() {
  const end = nowYm();
  say(`# ECOS M2 수집 · 검증`);
  say("");
  say(`- 실행(KST): ${new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ")}`);
  say(`- 조회 구간: ${START} ~ ${end} (월)`);
  say("");

  // 1) 통계표 훑기
  say("## 1. 101(통화/유동성) 하위 통계표");
  say("");
  let tables: Array<{ code: string; name: string; cycle: string }> = [];
  try {
    tables = await listTables();
    for (const t of tables) say(`- \`${t.code}\` ${t.name} (주기 ${t.cycle})`);
  } catch (e) {
    say(`- ❌ 통계표 목록 실패: ${(e as Error).message}`);
  }
  say("");

  // 2) 후보 통계표: 이름에 M2 가 들어가고 '평잔' 이 있으며 '계절조정' 이 아닌 것 우선
  const scored = tables
    .filter((t) => /M2/i.test(t.name))
    .map((t) => {
      let s = 0;
      if (/평잔/.test(t.name)) s += 10;
      if (/계절조정/.test(t.name)) s -= 20;
      if (/원계열/.test(t.name)) s += 5;
      if (/말잔/.test(t.name)) s -= 5;
      return { ...t, score: s };
    })
    .sort((a, b) => b.score - a.score);

  // 훑기가 실패했을 때만 쓰는 예비 후보(코드가 고르는 원칙은 유지 — 순서대로 시도해 데이터가 나오는 것을 쓴다)
  const fallback = ["101Y003", "101Y004", "101Y002", "101Y001"];
  const candidates = scored.length ? scored.map((t) => t.code) : fallback;

  say("## 2. 후보 통계표(점수순)");
  say("");
  if (scored.length) for (const t of scored) say(`- \`${t.code}\` ${t.name} — 점수 ${t.score}`);
  else say(`- (목록 훑기 실패 → 예비 후보 사용) ${fallback.join(", ")}`);
  say("");

  // 3) 후보별 항목 훑고 M2 항목 찾기
  say("## 3. 항목 목록 · M2 항목 선택");
  say("");
  let chosen: { statCode: string; statName: string; itemCode: string; itemName: string; unit: string } | null = null;
  const itemDump: Record<string, Array<{ code: string; name: string; unit: string }>> = {};

  for (const code of candidates.slice(0, 6)) {
    let items: Array<{ code: string; name: string; unit: string }> = [];
    try {
      items = await listItems(code);
    } catch (e) {
      say(`- \`${code}\` 항목 목록 실패: ${(e as Error).message}`);
      continue;
    }
    itemDump[code] = items;
    say(`- \`${code}\` 항목 ${items.length}개 — 앞 12개:`);
    for (const it of items.slice(0, 12)) say(`    - \`${it.code}\` ${it.name} (${it.unit})`);

    // M2 총액 항목: 이름이 정확히 'M2' 이거나 'M2(광의통화)' 꼴
    const hit =
      items.find((it) => /^M2\s*\(?광의통화\)?$/.test(it.name.trim())) ??
      items.find((it) => /^M2$/.test(it.name.trim())) ??
      items.find((it) => /^M2/.test(it.name.trim()));
    if (hit && !chosen) {
      const t = tables.find((x) => x.code === code);
      chosen = {
        statCode: code,
        statName: t?.name ?? "(목록 미확인)",
        itemCode: hit.code,
        itemName: hit.name,
        unit: hit.unit,
      };
      say(`  → ✅ 선택: \`${code}\` / \`${hit.code}\` ${hit.name} (${hit.unit})`);
    }
  }
  say("");

  fs.mkdirSync(path.join(REPO_ROOT, "data"), { recursive: true });
  fs.writeFileSync(
    path.join(REPO_ROOT, "data", "ecos-m2-items.json"),
    JSON.stringify({ tables, items: itemDump }, null, 2),
    "utf8",
  );

  if (!chosen) {
    say("## 4. 결과");
    say("");
    say("❌ M2 항목을 못 찾았다. 위 항목 목록을 보고 다음 실행에서 좁힌다.");
    writeLog();
    process.exit(1);
  }

  // 4) 시계열 수집
  say("## 4. 월별 시계열");
  say("");
  const { points, unit } = await fetchSeries(chosen.statCode, chosen.itemCode, end);
  say(`- 통계표 \`${chosen.statCode}\` ${chosen.statName}`);
  say(`- 항목 \`${chosen.itemCode}\` ${chosen.itemName}`);
  say(`- 단위(응답) ${unit || chosen.unit || "(미표기)"}`);
  say(`- 포인트 ${points.length}개 · 첫 ${points[0]?.time} · 끝 ${points[points.length - 1]?.time}`);
  say(`- 마지막 값 ${points[points.length - 1]?.value}`);
  say("");

  const dataset = {
    meta: {
      label: "M2(광의통화) 월별",
      source: "한국은행 ECOS OpenAPI",
      statCode: chosen.statCode,
      statName: chosen.statName,
      itemCode: chosen.itemCode,
      itemName: chosen.itemName,
      unit: unit || chosen.unit || "",
      cycle: "M",
      range: { start: points[0]?.time ?? START, end: points[points.length - 1]?.time ?? end },
      collectedAt: new Date().toISOString(),
      verified: true,
      provenance: `ECOS StatisticSearch ${chosen.statCode}/M/${chosen.itemCode}`,
    },
    series: points.map((p) => ({ ym: p.time, value: p.value })),
  };
  fs.mkdirSync(path.join(REPO_ROOT, "data", "datasets"), { recursive: true });
  fs.writeFileSync(
    path.join(REPO_ROOT, "data", "datasets", "m2-monthly.json"),
    JSON.stringify(dataset, null, 2),
    "utf8",
  );
  say("✅ `data/datasets/m2-monthly.json` 갱신");
  writeLog();
}

function writeLog() {
  fs.writeFileSync(path.join(REPO_ROOT, "data", "ecos-m2-probe.md"), log.join("\n") + "\n", "utf8");
}

main().catch((e) => {
  say("");
  say(`❌ 실패: ${(e as Error).message}`);
  writeLog();
  process.exit(1);
});
