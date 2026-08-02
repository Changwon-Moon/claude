/**
 * 한국부동산원 R-ONE **주간** 아파트 매매·전세 가격지수 수집 CLI (Actions에서 실행 — 네트워크·키 필요).
 *
 *   탐색: RONE_API_KEY=xxx tsx src/rebWeeklyCli.ts --discover 매매
 *   진단: RONE_API_KEY=xxx tsx src/rebWeeklyCli.ts --probe <STATBL_ID>
 *   수집: RONE_API_KEY=xxx tsx src/rebWeeklyCli.ts --collect [--mae <ID> --jeonse <ID>] [--out data/datasets/reb-weekly-index.json]
 *
 * ── 표 ID를 하드코딩하지 않는다(rebIndex 와 같은 이유)
 * 통계표 ID는 개편 때 바뀐다. --collect 는 이름으로 자동 선택을 시도하고, 못 고르면 멈춘다 —
 * 그때 --discover 로 목록을 보고 --mae/--jeonse 로 못 박는다. 고른 ID는 산출물 meta 에 남긴다.
 *
 * ── 산출물: data/datasets/reb-weekly-index.json
 *   meta.cycle="WK" · tables{mae,jeonse} · asOf(최신 주 t) · verified(사람 확인 이어받기)
 *   mae/jeonse : { 지역코드: { "YYYYMMDD": 지수 } }  (누적%·연속구간은 빌더가 t 순서로 계산)
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { listTables, type RebTable, SEOUL_GU_CODES } from "./sources/rebIndex.js";
import {
  fetchWeekly, chooseWeeklyTable, probeWeekly, toWeekSeries, weekRegionNames, latestT,
} from "./sources/rebWeekly.js";

const CWD = process.env.INIT_CWD || process.cwd();
const fromCwd = (p: string): string => resolve(CWD, p);
const arg = (name: string, fb = ""): string => {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : fb;
};

const key = process.env.RONE_API_KEY || process.env.REB_API_KEY || "";
if (!key) {
  console.error("RONE_API_KEY(또는 REB_API_KEY) 환경변수가 없습니다 — 발급 안내: docs/guides/reb-key.md");
  process.exit(1);
}

/** 사람이 확인한 verified 기록은 최신 주가 그대로일 때만 이어받는다(수집 성공이 카드 제작을 막지 않게). */
function carryVerification(outPath: string, asOf: string): { verified: boolean; verificationNote: string } {
  const TODO = "발행 전: 부동산원 주간 아파트가격동향 보도자료의 서울 누적 상승률과 이 계열로 계산한 값을 대조한 뒤 verified=true 로 올린다.";
  if (!existsSync(outPath)) return { verified: false, verificationNote: TODO };
  try {
    const prev = JSON.parse(readFileSync(outPath, "utf8"));
    if (prev?.meta?.asOf === asOf && prev?.meta?.verified === true)
      return { verified: true, verificationNote: String(prev.meta.verificationNote || "") };
  } catch { /* 깨진 파일이면 확인 못 믿는다 */ }
  return { verified: false, verificationNote: TODO };
}

async function main(): Promise<void> {
  if (process.argv.includes("--discover")) {
    const kw = arg("--discover") || "지수";
    const tables = await listTables(key, kw);
    console.log(`🔎 "${kw}" 가 이름에 든 통계표 ${tables.length}개 (주간 후보는 [WK] 표시)`);
    for (const t of tables) console.log(`   ${t.id}  [${t.cycle}]  ${t.name}`);
    return;
  }
  if (process.argv.includes("--probe")) {
    const id = arg("--probe");
    if (!id) { console.error("--probe <STATBL_ID> 가 필요합니다"); process.exit(1); }
    console.log(`🔬 주간 데이터 조회 형태 실측 — ${id}`);
    for (const r of await probeWeekly(key, id)) {
      const mark = r.rows > 0 ? "✅" : r.rows === 0 ? "⬜" : "❌";
      console.log(`\n${mark} ${r.label} — 행 ${r.rows}\n   ${r.url}\n   ${r.head}`);
    }
    return;
  }

  /* ── 수집 ── */
  const outPath = fromCwd(arg("--out", "data/datasets/reb-weekly-index.json"));
  let maeId = arg("--mae");
  let jeonseId = arg("--jeonse");
  const picked: Record<string, string> = {};

  if (!maeId || !jeonseId) {
    // 이름으로 자동 선택 시도 — 매매/전세 각각 후보를 훑는다
    const tabsMae = await listTables(key, "매매");
    const tabsJeonse = await listTables(key, "전세");
    if (!maeId) { const t = chooseWeeklyTable(tabsMae, "매매"); if (t) { maeId = t.id; picked.mae = t.name; } }
    if (!jeonseId) { const t = chooseWeeklyTable(tabsJeonse, "전세"); if (t) { jeonseId = t.id; picked.jeonse = t.name; } }
  }
  if (!maeId || !jeonseId) {
    console.error(
      "주간 매매/전세 지수 표를 자동으로 못 골랐습니다.\n" +
        "  → `--discover 매매` · `--discover 전세` 로 목록(그 [WK] 표)을 보고,\n" +
        "     `--collect --mae <ID> --jeonse <ID>` 로 못 박으세요.",
    );
    process.exit(1);
  }
  console.log(`매매(주간) 표 ${maeId}${picked.mae ? ` (${picked.mae})` : ""}`);
  console.log(`전세(주간) 표 ${jeonseId}${picked.jeonse ? ` (${picked.jeonse})` : ""}`);

  const onlyIndex = (n: string): boolean => n.includes("지수");
  const m = await fetchWeekly(key, maeId, onlyIndex);
  const j = await fetchWeekly(key, jeonseId, onlyIndex);
  const mae = toWeekSeries(m.points);
  const jeonse = toWeekSeries(j.points);
  const names = { ...weekRegionNames(j.points), ...weekRegionNames(m.points) };

  /* ── 쓰기 전 온전성 검사 (반쪽 데이터로 카드 만들면 오보) ── */
  const fail: string[] = [];
  if (!Object.keys(mae).length) fail.push("매매 주간 계열이 비어 있다");
  if (!Object.keys(jeonse).length) fail.push("전세 주간 계열이 비어 있다");
  // 서울특별시 코드를 이름으로 찾는다(코드 대역은 개편으로 바뀔 수 있어 하드코딩하지 않는다)
  const seoulCode = Object.entries(names).find(([, n]) => n === "서울특별시" || /^서울/.test(n))?.[0];
  if (!seoulCode) fail.push("서울특별시 계열을 못 찾았다(지역명 확인 필요)");
  else {
    for (const [lbl, s] of [["매매", mae], ["전세", jeonse]] as const) {
      const seoul = s[seoulCode];
      if (!seoul || Object.keys(seoul).length < 40) fail.push(`${lbl} 서울 주간 계열이 없거나 너무 짧다(${seoul ? Object.keys(seoul).length : 0}주)`);
    }
    const mLast = latestT(mae), jLast = latestT(jeonse);
    if (mLast && jLast && mLast.slice(0, 6) !== jLast.slice(0, 6)) fail.push(`매매(${mLast})와 전세(${jLast})의 최신 주가 어긋난다`);
  }
  if (fail.length) {
    console.error("❌ 온전하지 않아 저장하지 않습니다:");
    for (const f of fail) console.error(`   · ${f}`);
    process.exit(1);
  }

  const asOf = [latestT(mae), latestT(jeonse)].filter(Boolean).sort().pop() || "";
  const doc = {
    meta: {
      title: "서울 등 주간 아파트 매매·전세 가격지수 (한국부동산원 주간아파트가격동향)",
      source: "한국부동산원 R-ONE 통계 OpenAPI (주간)",
      cycle: "WK",
      provenance: [
        `https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do?STATBL_ID=${maeId}&DTACYCLE_CD=WK`,
        `https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do?STATBL_ID=${jeonseId}&DTACYCLE_CD=WK`,
      ],
      tables: { mae: { id: maeId, name: picked.mae || "" }, jeonse: { id: jeonseId, name: picked.jeonse || "" } },
      asOf,
      regions: new Set([...Object.keys(mae), ...Object.keys(jeonse)]).size,
      seoulCode,
      groups: { seoulGu: [...SEOUL_GU_CODES] },
      notes: [m.note, j.note].filter(Boolean),
      ...carryVerification(outPath, asOf),
    },
    regionNames: names,
    mae,
    jeonse,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(doc, null, 2) + "\n", "utf8");
  const weeks = (s: Record<string, Record<string, number>>): number => Math.max(0, ...Object.values(s).map((v) => Object.keys(v).length));
  console.log(`✅ ${outPath}`);
  console.log(`   지역 ${doc.meta.regions}개 · 최신 주 ${asOf} · 서울 ${seoulCode}`);
  console.log(`   매매: 최장 ${weeks(mae)}주 · 전세: 최장 ${weeks(jeonse)}주`);
  for (const n of doc.meta.notes) console.log(`   ⚠️ ${n}`);
}

main().catch((e) => { console.error(`실패 — ${e?.message || e}`); process.exit(1); });
