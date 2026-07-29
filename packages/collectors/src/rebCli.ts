/**
 * 한국부동산원 R-ONE 전세·월세 가격지수 수집 CLI (Actions에서 실행 — 네트워크·키 필요).
 *
 *   탐색: REB_API_KEY=xxx tsx src/rebCli.ts --discover 전세
 *   수집: REB_API_KEY=xxx tsx src/rebCli.ts --collect [--from 2011] [--out data/datasets/reb-rent-index.json]
 *
 * ── 왜 '탐색' 모드가 따로 있나
 * 통계표 ID는 통계 개편 때 바뀐다. 처음 붙일 때·안 맞을 때 이름으로 찾아보고,
 * 찾은 ID를 --jeonse / --wolse 로 못 박아 쓴다. 못 박은 ID는 산출물에도 남겨
 * "이 숫자가 어느 표에서 왔는지"를 나중에 되짚을 수 있게 한다(오보 0).
 *
 * ── 산출물
 *   data/datasets/reb-rent-index.json
 *     meta   : 출처·통계표 ID·기준시점·마지막 관측월(= asOf)
 *     jeonse : { 지역명: { "YYYY-MM": 지수 } }
 *     wolse  : 같은 형태
 *   묶음(권역)은 여기서 만들지 않는다 — 빌더가 코드로 만든다.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { listTables, fetchMonthly, toSeries, latestMonth, type RebTable } from "./sources/rebIndex.js";

const CWD = process.env.INIT_CWD || process.cwd();
const fromCwd = (p: string): string => resolve(CWD, p);

function arg(name: string, fallback = ""): string {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : fallback;
}

const key = process.env.REB_API_KEY || "";
if (!key) {
  console.error("REB_API_KEY 환경변수가 없습니다 — 발급 안내: docs/guides/reb-key.md (무료, 5분)");
  process.exit(1);
}

/** 후보 표 중 우리가 원하는 것을 고른다: 아파트 · 매매가 아닌 전세/월세 · 지수 */
function chooseTable(tables: RebTable[], want: "전세" | "월세"): RebTable | null {
  const scored = tables
    .filter((t) => t.name.includes(want) && t.name.includes("지수"))
    .map((t) => {
      let s = 0;
      if (t.name.includes("아파트")) s += 3; // 우리 카드는 아파트 기준으로 통일
      if (t.name.includes("매매")) s -= 5; // 매매 지수는 다른 이야기다
      if (t.cycle === "MM") s += 2; // 월간 계열
      if (t.name.includes("종합")) s += 1;
      return { t, s };
    })
    .sort((a, b) => b.s - a.s);
  return scored.length ? scored[0].t : null;
}

async function main(): Promise<void> {
  /* ── 탐색 모드 — 이름으로 통계표를 찾아 ID를 보여준다 ── */
  if (process.argv.includes("--discover")) {
    const kw = arg("--discover") || "지수";
    const tables = await listTables(key, kw);
    console.log(`🔎 "${kw}" 가 이름에 들어간 통계표 ${tables.length}개`);
    for (const t of tables) console.log(`   ${t.id}  [${t.cycle}]  ${t.name}`);
    if (!tables.length) console.log("   (하나도 없으면 키 권한 또는 R-ONE 응답 형식을 확인하세요)");
    return;
  }

  /* ── 수집 모드 ── */
  const fromYear = Number(arg("--from", "2011"));
  const toYear = Number(arg("--to", "")) || new Date().getUTCFullYear();
  const outPath = fromCwd(arg("--out", "data/datasets/reb-rent-index.json"));

  // ID를 직접 못 박았으면 이름으로 찾는다
  let jeonseId = arg("--jeonse");
  let wolseId = arg("--wolse");
  const picked: Record<string, string> = {};
  if (!jeonseId || !wolseId) {
    const tables = await listTables(key, "지수");
    console.log(`통계표 후보 ${tables.length}개에서 고릅니다.`);
    if (!jeonseId) {
      const t = chooseTable(tables, "전세");
      if (t) {
        jeonseId = t.id;
        picked.jeonse = t.name;
      }
    }
    if (!wolseId) {
      const t = chooseTable(tables, "월세");
      if (t) {
        wolseId = t.id;
        picked.wolse = t.name;
      }
    }
  }
  if (!jeonseId || !wolseId) {
    console.error(
      "전세/월세 지수 통계표를 못 찾았습니다.\n" +
        "  → `--discover 전세` 로 목록을 본 뒤 `--jeonse <ID> --wolse <ID>` 로 지정하세요.",
    );
    process.exit(1);
  }
  console.log(`전세 표 ${jeonseId}${picked.jeonse ? ` (${picked.jeonse})` : ""}`);
  console.log(`월세 표 ${wolseId}${picked.wolse ? ` (${picked.wolse})` : ""}`);

  const j = await fetchMonthly(key, jeonseId, fromYear, toYear);
  const w = await fetchMonthly(key, wolseId, fromYear, toYear);
  const jeonse = toSeries(j.points);
  const wolse = toSeries(w.points);

  const regions = new Set([...Object.keys(jeonse), ...Object.keys(wolse)]);
  if (!regions.size) {
    console.error("받은 데이터가 없습니다 — 키 권한 또는 통계표 ID를 확인하세요.");
    process.exit(1);
  }

  // ⚠️ 시각이 아니라 **데이터가 말하는 시점**을 asOf 로 쓴다(같은 입력 = 같은 파일).
  const asOf = [latestMonth(jeonse), latestMonth(wolse)].filter(Boolean).sort().pop() || "";

  const doc = {
    meta: {
      title: "전국 주택가격동향 — 전세·월세 가격지수 (한국부동산원)",
      source: "한국부동산원 R-ONE 통계 OpenAPI",
      provenance: [
        `https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do?STATBL_ID=${jeonseId}&DTACYCLE_CD=MM`,
        `https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do?STATBL_ID=${wolseId}&DTACYCLE_CD=MM`,
      ],
      tables: { jeonse: { id: jeonseId, name: picked.jeonse || "" }, wolse: { id: wolseId, name: picked.wolse || "" } },
      asOf,
      range: { from: fromYear, to: toYear },
      regions: regions.size,
      notes: [j.note, w.note].filter(Boolean),
      verified: false,
      verificationNote:
        "발행 전 부동산원 공표 보도자료(월간 주택가격동향)와 서울 지수 1~2개 값을 눈으로 대조한 뒤 verified=true 로 올린다.",
    },
    jeonse,
    wolse,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(doc, null, 2) + "\n", "utf8");

  const months = (s: Record<string, Record<string, number>>): number =>
    Math.max(0, ...Object.values(s).map((v) => Object.keys(v).length));
  console.log(`✅ ${outPath}`);
  console.log(`   지역 ${regions.size}개 · 전세 최장 ${months(jeonse)}개월 · 월세 최장 ${months(wolse)}개월 · 최신 ${asOf}`);
  for (const n of doc.meta.notes) console.log(`   ⚠️ ${n}`);
}

main().catch((e) => {
  console.error(`실패 — ${e?.message || e}`);
  process.exit(1);
});
