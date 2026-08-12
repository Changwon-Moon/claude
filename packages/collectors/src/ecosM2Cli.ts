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

/* 통계표 목록 — 부모코드 `101` 을 주면 INFO-200(데이터 없음)이 온다(2026-08-12 실측).
   그래서 **전체 목록**을 받아 이름으로 거른다. */
async function listTables(): Promise<Array<{ code: string; name: string; cycle: string }>> {
  const url = `${BASE}/StatisticTableList/${KEY}/json/kr/1/3000`;
  const data = await getJson(url);
  const rows = data?.StatisticTableList?.row ?? [];
  return rows.map((r: any) => ({
    code: String(r.STAT_CODE ?? ""),
    name: String(r.STAT_NAME ?? ""),
    cycle: String(r.CYCLE ?? ""),
  }));
}

/** 항목 목록 */
async function listItems(
  statCode: string,
): Promise<Array<{ code: string; name: string; unit: string; cycle: string; start: string; end: string }>> {
  const url = `${BASE}/StatisticItemList/${KEY}/json/kr/1/500/${statCode}`;
  const data = await getJson(url);
  const rows = data?.StatisticItemList?.row ?? [];
  /* START_TIME·END_TIME 을 같이 받는다 — "이 표에 언제부터 언제까지 있나"를
     창을 찔러 보며 알아내려다 헛돌았다(2026-08-12). ECOS 가 애초에 알려 준다. */
  return rows.map((r: any) => ({
    code: String(r.ITEM_CODE ?? ""),
    name: String(r.ITEM_NAME ?? ""),
    unit: String(r.UNIT_NAME ?? ""),
    cycle: String(r.CYCLE ?? ""),
    start: String(r.START_TIME ?? ""),
    end: String(r.END_TIME ?? ""),
  }));
}

/* 한 TIME 에 행이 여러 개 온다 (2026-08-12 실측).
   통계표에 하위 분류축이 있어 같은 ITEM_CODE1 로도 행이 여러 벌 실린다 —
   1차 실행에서 1000행 상한을 그 중복이 다 먹어 **81개월치만** 받아왔다(199801~200409).
   그래서 ① 상한을 크게 잡고 ② TIME 으로 묶어 접는다. 묶었는데 값이 갈리면 **던진다** —
   어느 쪽이 M2 인지 코드가 모르는 채로 숫자를 고르면 그게 오보다. */
/** YYYYMM 에 n개월 더하기 */
function addMonths(ym: string, n: number): string {
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(4, 6));
  const t = y * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}${String((t % 12) + 1).padStart(2, "0")}`;
}

async function fetchWindow(statCode: string, itemCode: string, s: string, e: string) {
  const url = `${BASE}/StatisticSearch/${KEY}/json/kr/1/10000/${statCode}/M/${s}/${e}/${itemCode}`;
  const text = await fetchText(url, { retries: 3, timeoutMs: 60000 });
  const raw = JSON.parse(text);
  if (raw?.RESULT?.CODE) return { rows: [] as any[], total: 0, note: `${raw.RESULT.CODE}: ${raw.RESULT.MESSAGE}` };
  return {
    rows: (raw?.StatisticSearch?.row ?? []) as any[],
    total: Number(raw?.StatisticSearch?.list_total_count ?? 0),
    note: "",
  };
}

/* 한 번에 긴 구간을 달라고 하면 앞쪽 81개월(199801~200409)만 오고 서버 집계도 81 이라고 답한다
   (2026-08-12 실측). 왜인지는 API 가 말해 주지 않는다 — 그래서 **1년씩 잘라 여러 번 물어 붙인다.**
   구간을 잘라 물으면 각 창이 온전히 온다. 창 경계는 겹치게 잡아 빠진 달이 있으면 드러나게 한다. */
async function fetchSeries(statCode: string, itemCode: string, end: string, start = START) {
  const rows: any[] = [];
  const windows: string[] = [];
  let s = start;
  while (s <= end) {
    const e = addMonths(s, 11) > end ? end : addMonths(s, 11);
    const r = await fetchWindow(statCode, itemCode, s, e);
    windows.push(`${s}~${e}: ${r.rows.length}행${r.note ? ` (${r.note})` : ""}`);
    rows.push(...r.rows);
    if (e === end) break;
    s = addMonths(e, 1);
  }
  const total = rows.length;
  const unit = String(rows[0]?.UNIT_NAME ?? "");
  log.push(...windows.map((w) => `    - ${w}`));

  const byTime = new Map<string, Set<number>>();
  for (const r of rows) {
    const t = String(r.TIME ?? "").trim();
    const v = Number(r.DATA_VALUE);
    if (!t || Number.isNaN(v)) continue;
    if (!byTime.has(t)) byTime.set(t, new Set());
    byTime.get(t)!.add(v);
  }
  const conflicts = [...byTime.entries()].filter(([, s]) => s.size > 1);
  if (conflicts.length) {
    throw new Error(
      `같은 월에 서로 다른 값이 왔다(${conflicts.length}개월). 예: ${conflicts[0][0]} → ${[...conflicts[0][1]].join(" / ")}`,
    );
  }
  const points = [...byTime.entries()]
    .map(([time, s]) => ({ time, value: [...s][0] }))
    .sort((a, b) => a.time.localeCompare(b.time));

  return { points, unit, rawRows: rows.length, total, sample: rows.slice(0, 2) };
}

function tableName(tables: Array<{ code: string; name: string }>, code: string): string {
  return tables.find((t) => t.code === code)?.name ?? "";
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
      if (/말잔/.test(t.name)) s -= 1; // 비교용으로 목록엔 남긴다
      return { ...t, score: s };
    })
    .sort((a, b) => b.score - a.score);

  // 훑기가 실패했을 때만 쓰는 예비 후보(코드가 고르는 원칙은 유지 — 순서대로 시도해 데이터가 나오는 것을 쓴다)
  const fallback = ["101Y003", "101Y004", "101Y002", "101Y001"];
  const candidates = scored.length ? scored.map((t) => t.code) : fallback;
  // 표가 여럿 걸리므로 최근 데이터 비교 대상은 넉넉히 본다

  say("## 2. 후보 통계표(점수순)");
  say("");
  if (scored.length) for (const t of scored) say(`- \`${t.code}\` ${t.name} — 점수 ${t.score}`);
  else say(`- (목록 훑기 실패 → 예비 후보 사용) ${fallback.join(", ")}`);
  say("");

  // 3) 후보별 항목 훑고 M2 항목 찾기
  say("## 3. 항목 목록 · M2 항목 선택");
  say("");
  let chosen: { statCode: string; statName: string; itemCode: string; itemName: string; unit: string; lastYm: string; start: string; end: string } | null = null;
  const itemDump: Record<string, any[]> = {};
  /* M2(평잔·원계열) 항목을 가진 표를 **전부** 담는다.
     현행 표(161Y006)는 2003-10 부터라 노무현 정부 취임(2003-02) 시점 값이 없다.
     그 이전은 구계열 표(101Y004, 1986~2003)에 있으므로 **둘 다 받아 두고**
     겹치는 달의 값이 같은지 확인한 뒤에야 이어 붙일지 판단한다 — 몰래 잇지 않는다. */
  const found: Array<{ statCode: string; statName: string; itemCode: string; itemName: string; unit: string; start: string; end: string }> = [];

  for (const code of candidates.slice(0, 12)) {
    let items: Array<{ code: string; name: string; unit: string; cycle: string; start: string; end: string }> = [];
    try {
      items = await listItems(code);
    } catch (e) {
      say(`- \`${code}\` 항목 목록 실패: ${(e as Error).message}`);
      continue;
    }
    itemDump[code] = items;
    say(`- \`${code}\` 항목 ${items.length}개 — 앞 12개:`);
    for (const it of items.slice(0, 8)) say(`    - \`${it.code}\` ${it.name} (${it.unit}) [주기 ${it.cycle} · ${it.start}~${it.end}]`);

    /* M2 총액 항목 고르기 — **평잔·원계열**을 명시적으로 고른다.
       (2026-08-12 1차 실행에서 `BBHS00 M2(평잔, 계절조정계열)` 을 집어왔다.
        카드 표기가 "평잔·원계열"이므로 계절조정계열은 다른 숫자다 — 이름으로 못박는다.) */
    const m2s = items.filter((it) => /^M2/.test(it.name.trim()));
    /* 항목은 **그 표의 이름과 같은 계열**을 고른다(평잔 표면 평잔, 말잔 표면 말잔).
       원계열이 아닌 것(계절조정)은 어느 표에서도 고르지 않는다 — 카드 표기가 원계열이다. */
    const wantMal = /말잔/.test(tableName(tables, code));
    const rank = (name: string) => {
      let s = 0;
      if (/원계열/.test(name)) s += 10;
      if (/계절조정/.test(name)) s -= 50;
      if (wantMal ? /말잔/.test(name) : /평잔/.test(name)) s += 10;
      else s -= 10;
      return s;
    };
    const hit = [...m2s].sort((a, b) => rank(b.name) - rank(a.name))[0];
    if (!hit || rank(hit.name) < 20) {
      if (hit) say(`  ⚠️ \`${code}\` 의 최선 항목이 원계열 총액이 아니다 — \`${hit.code}\` ${hit.name} (건너뛴다)`);
      continue;
    }
    /* ⚠️ 이름만으로 고르면 **은퇴한 표**를 집는다 (2026-08-12 실측).
       `101Y004`(1.7.3.1.2) 와 `161Y006`(1.1.3.1.2) 는 이름이 글자까지 같은데
       앞의 것은 2003.10~2026.05 에서 멈춘 구계열이고, 살아 있는 표는 뒤의 것이다.
       그래서 **최근 24개월을 실제로 찔러 보고 마지막 달이 늦은 표**를 고른다 — 재서 고른다. */
    const t = tables.find((x) => x.code === code);
    const probeStart = addMonths(end, -23);
    let lastYm = "";
    try {
      const r = await fetchWindow(code, hit.code, probeStart, end);
      const times = r.rows.map((x: any) => String(x.TIME ?? "")).filter(Boolean).sort();
      lastYm = times[times.length - 1] ?? "";
    } catch (e) {
      say(`  ⚠️ \`${code}\` 최근 구간 조회 실패: ${(e as Error).message}`);
    }
    say(`  · \`${code}\` ${t?.name ?? ""} — 항목 \`${hit.code}\` ${hit.name} · 수록 ${hit.start}~${hit.end}(주기 ${hit.cycle}) · 실제 최근 ${lastYm || "없음"}`);
    /* 최근 데이터가 없어도 **목록에는 담는다** — 구계열 표가 바로 그 모습이다.
       (첫 시도에서 이 줄 아래에 담았다가 구계열이 통째로 빠졌다.) */
    found.push({
      statCode: code,
      statName: t?.name ?? "",
      itemCode: hit.code,
      itemName: hit.name,
      unit: hit.unit,
      start: hit.start,
      end: hit.end,
    });
    if (!lastYm) continue;
    const isPyeong = /평잔/.test(hit.name) && /원계열/.test(hit.name);
    if (isPyeong && (!chosen || lastYm > chosen.lastYm)) {
      chosen = {
        statCode: code,
        statName: t?.name ?? "(목록 미확인)",
        itemCode: hit.code,
        itemName: hit.name,
        unit: hit.unit,
        lastYm,
        start: hit.start,
        end: hit.end,
      };
    }
  }
  say("");
  if (chosen) say(`→ ✅ 선택: \`${chosen.statCode}\` ${chosen.statName} / \`${chosen.itemCode}\` ${chosen.itemName} (최근 ${chosen.lastYm})`);
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
  const itemStart = /^\d{6}$/.test(chosen.start) && chosen.start > START ? chosen.start : START;
  const { points, unit, rawRows, total, sample } = await fetchSeries(chosen.statCode, chosen.itemCode, end, itemStart);
  say(`- 통계표 \`${chosen.statCode}\` ${chosen.statName}`);
  say(`- 항목 \`${chosen.itemCode}\` ${chosen.itemName}`);
  say(`- 단위(응답) ${unit || chosen.unit || "(미표기)"}`);
  say(`- 원본 행 ${rawRows}개(창별 합계 ${total}) → 월로 접어 ${points.length}개월`);
  say("");
  say("<details><summary>원본 행 샘플 2개</summary>");
  say("");
  say("```json");
  say(JSON.stringify(sample, null, 2));
  say("```");
  say("</details>");
  say("");
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
    /** 다른 표(구계열 포함)에서 받은 같은 항목의 시계열 — 접합 판단은 빌더가 아니라 사람이 본 뒤 결정한다 */
    others: {} as Record<string, { statName: string; itemCode: string; unit: string; series: Array<{ ym: string; value: number }> }>,
  };

  /* ── 개편 전 기준(구 M2) — 카드가 쓰는 기준 (2026-08-12 오너 지시)
     한국은행이 2025-12-30 통화지표를 개편해 **수익증권(펀드·ETF)을 M2 에서 뺐다**(약 -409조).
     신·구를 1년간 병행 발표하는데, ECOS 는 같은 통계표 안에 `[참고] 구 M2` 항목으로 실어 둔다.
     역대 정부를 한 자로 재려면 **개편 전 기준으로 통일**해야 한다 — 신 기준은 현 정부만
     작아 보이게 만든다. 그래서 이 항목을 따로 받아 `legacyM2` 로 적는다. */
  say("## 4b. 개편 전 기준 — [참고] 구 M2");
  say("");
  const legacyItem = (itemDump[chosen.statCode] ?? []).find((it: any) => /구\s*M2/.test(String(it.name)) && /평잔/.test(String(it.name)) && /원계열/.test(String(it.name)));
  let legacy: { itemCode: string; itemName: string; series: Array<{ ym: string; value: number }> } | null = null;
  if (!legacyItem) {
    say("- ⚠️ `[참고] 구 M2` 항목을 못 찾았다 — 개편 전 기준 카드는 만들 수 없다");
  } else {
    const r = await fetchSeries(chosen.statCode, legacyItem.code, end, "200301");
    legacy = {
      itemCode: legacyItem.code,
      itemName: legacyItem.name,
      series: r.points.map((p) => ({ ym: p.time, value: p.value })),
    };
    say(`- \`${legacyItem.code}\` ${legacyItem.name} — ${r.points.length}개월 (${r.points[0]?.time}~${r.points[r.points.length - 1]?.time})`);
    const lastNew = points[points.length - 1];
    const lastOld = r.points[r.points.length - 1];
    if (lastNew && lastOld && lastNew.time === lastOld.time) {
      say(`- 같은 달(${lastNew.time}) 신 ${(lastNew.value / 1000).toFixed(1)}조 vs 구 ${(lastOld.value / 1000).toFixed(1)}조 — 차이 ${((lastOld.value - lastNew.value) / 1000).toFixed(1)}조`);
    }
  }
  (dataset as any).legacyM2 = legacy;
  say("");

  say("## 5. 다른 표(구계열 포함)도 함께 받는다");
  say("");
  for (const f of found) {
    if (f.statCode === chosen.statCode) continue;
    const s0 = /^\d{4}$/.test(f.start) ? `${f.start}01` : /^\d{6}$/.test(f.start) ? f.start : START;
    /* ⚠️ END_TIME 을 믿고 자르지 않는다 (2026-08-12).
       구지표 표(101Y004)의 항목 메타는 `1986~2003` 이라고 답하는데 실제로는 지금도 발표된다
       — 그 말을 믿고 잘랐다가 **구M2 계열이 2003년에서 끊긴 채로** 저장됐다.
       한국은행이 2025년 말 통화지표를 개편(수익증권 제외 등)해 신·구 두 계열이 함께 도는 중이라
       구계열은 카드의 기준 그 자체다. 끝은 **언제나 지금**까지 물어본다. */
    try {
      const r = await fetchSeries(f.statCode, f.itemCode, end, s0);
      dataset.others[f.statCode] = {
        statName: f.statName,
        itemCode: f.itemCode,
        unit: r.unit || f.unit,
        series: r.points.map((p) => ({ ym: p.time, value: p.value })),
      };
      say(`- \`${f.statCode}\` ${f.statName} — ${r.points.length}개월 (${r.points[0]?.time}~${r.points[r.points.length - 1]?.time})`);
      // 겹치는 달 비교
      const mine = new Map(points.map((p) => [p.time, p.value]));
      const ov = r.points.filter((p) => mine.has(p.time));
      if (ov.length) {
        const diffs = ov.map((p) => Math.abs(p.value - (mine.get(p.time) as number)));
        say(`  · 겹치는 달 ${ov.length}개 — 최대 차이 ${Math.max(...diffs).toFixed(1)} ${unit}`);
      } else {
        say(`  · 겹치는 달 없음 — 이어 붙이려면 단절을 감수해야 한다`);
      }
    } catch (e) {
      say(`- \`${f.statCode}\` 실패: ${(e as Error).message}`);
    }
  }
  say("");
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
