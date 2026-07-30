/**
 * 한국부동산원 R-ONE 전세·월세 가격지수 수집 CLI (Actions에서 실행 — 네트워크·키 필요).
 *
 *   탐색: RONE_API_KEY=xxx tsx src/rebCli.ts --discover 전세
 *   수집: RONE_API_KEY=xxx tsx src/rebCli.ts --collect [--from 2011] [--out data/datasets/reb-rent-index.json]
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
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import {
  listTables, fetchMonthly, toSeries, regionNames, ambiguousNames, latestMonth, probeData,
  SEOUL_GU_CODES,
  type RebTable,
} from "./sources/rebIndex.js";

const CWD = process.env.INIT_CWD || process.cwd();
const fromCwd = (p: string): string => resolve(CWD, p);

/**
 * 앞선 파일에서 **사람이 확인한 기록**을 이어받는다.
 *
 * 왜: 확인(verified)은 수집기가 아니라 사람이 기사·보도자료와 대조해 얻은 사실이다.
 * 매 실행마다 false 로 되돌리면 그 노동이 매번 사라지고, 카드 빌더가 verified 를 요구하므로
 * **수집이 성공할 때마다 카드 제작이 막힌다**(2026-07-30 실제로 그랬다).
 *
 * 이어받는 조건: 최신 관측월이 같을 때만. 새 달이 들어오면 그 달은 확인 전이므로 내린다.
 */
function carryVerification(
  outPath: string,
  asOf: string,
): { verified: boolean; verificationNote: string; unit?: unknown } {
  const TODO =
    "발행 전 부동산원 공표 보도자료(월간 주택가격동향)와 서울 지수 1~2개 값을 대조한 뒤 verified=true 로 올린다. " +
    "scripts/article-crosscheck.mjs 가 기계 대조를 대신해 준다.";
  if (!existsSync(outPath)) return { verified: false, verificationNote: TODO };
  let prev: any;
  try {
    prev = JSON.parse(readFileSync(outPath, "utf8"));
  } catch {
    return { verified: false, verificationNote: TODO }; // 깨진 파일이면 확인 기록도 못 믿는다
  }
  const prevAsOf = prev?.meta?.asOf;
  // 단위는 특정 달의 성질이 아니라 API 자체의 성질이다 — 항상 이어받는다
  const unit = prev?.meta?.unit ? { unit: prev.meta.unit } : {};
  if (prevAsOf && prevAsOf === asOf && prev?.meta?.verified === true) {
    console.log(`   ↩︎ 확인 기록 유지 — 최신월이 그대로다(${asOf})`);
    return { verified: true, verificationNote: String(prev.meta.verificationNote || ""), ...unit };
  }
  if (prevAsOf && prevAsOf !== asOf && prev?.meta?.verified === true) {
    console.log(`   ⚠️ 새 달이 들어왔다(${prevAsOf} → ${asOf}) — verified 를 내립니다`);
    return {
      verified: false,
      verificationNote:
        `${prevAsOf} 까지는 확인됐으나 ${asOf} 자료가 새로 들어왔다. 새 달을 다시 대조한 뒤 올린다. ` +
        `이전 확인 기록: ${String(prev.meta.verificationNote || "").slice(0, 300)}`,
      ...unit,
    };
  }
  return { verified: false, verificationNote: TODO, ...unit };
}

function arg(name: string, fallback = ""): string {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : fallback;
}

/* 시크릿 이름을 하나로 못 박지 않는다 — 오너가 이미 `RONE_API_KEY` 로 등록해 두셨다.
 * 이름이 달라서 "키가 없다"고 멈추는 건 도구 잘못이다(2026-07-29). 둘 다 받는다. */
const key = process.env.RONE_API_KEY || process.env.REB_API_KEY || "";
if (!key) {
  console.error("RONE_API_KEY(또는 REB_API_KEY) 환경변수가 없습니다 — 발급 안내: docs/guides/reb-key.md");
  process.exit(1);
}

/**
 * 후보 표 중 우리가 원하는 것을 고른다.
 *
 * 실측(2026-07-29 discover): "전세"만 78개가 걸린다. 이름이 비슷한 함정이 많다 —
 *   오피스텔(다른 자산) · 규모별/연령별(지역별이 아닌 쪼갠 표) · 계절조정(보정치) ·
 *   준전세/준월세(중간 형태) · 수급동향(지수가 아님) · 평균/중위가격(지수가 아님) · 주간(WK)
 * 그래서 **떨어뜨릴 것을 명시**한다. 애매하면 아무것도 고르지 않고 사람에게 넘긴다.
 */
const EXCLUDE = /오피스텔|규모별|연령별|계절조정|준전세|준월세|수급동향|평균|중위|대비/;

function chooseTable(tables: RebTable[], want: "전세" | "월세"): RebTable | null {
  const scored = tables
    .filter((t) => t.cycle === "MM") // 월간 계열만 (주간은 다른 표본·기준)
    .filter((t) => t.name.includes(want) && t.name.includes("지수"))
    .filter((t) => !EXCLUDE.test(t.name))
    .map((t) => {
      let s = 0;
      if (t.name.includes("아파트")) s += 5; // 우리 카드는 아파트 기준으로 통일
      if (t.name.includes("매매")) s -= 9; // 매매 지수는 다른 이야기다
      // "(월) 전세가격지수_아파트" 처럼 군더더기 없는 이름이 지역별 본표다
      if (new RegExp(`\\(월\\)\\s*${want}(가격)?지수_아파트$`).test(t.name)) s += 4;
      return { t, s };
    })
    .sort((a, b) => b.s - a.s);
  return scored.length && scored[0].s > 0 ? scored[0].t : null;
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

  /* ── 진단 모드 — 데이터 조회 파라미터를 실측으로 찾는다 ──
   * 표 ID는 맞는데 0건이 오면 기간·페이지 파라미터가 다른 것이다. 짐작을 고쳐 다시
   * 던지길 반복하지 않고, 여러 형태를 한 번에 던져 **무엇이 행을 주는지** 본다. */
  if (process.argv.includes("--probe")) {
    const id = arg("--probe") || "A_2024_00050";
    console.log(`🔬 데이터 조회 형태 실측 — 통계표 ${id}`);
    for (const r of await probeData(key, id)) {
      const mark = r.rows > 0 ? "✅" : r.rows === 0 ? "⬜" : "❌";
      console.log(`\n${mark} ${r.label} — HTTP ${r.status} · 행 ${r.rows}`);
      console.log(`   ${r.url}`);
      console.log(`   ${r.head}`);
    }
    return;
  }

  /* ── 수집 모드 ── */
  const fromYear = Number(arg("--from", "2003")); // 통계 시작부터 — "통계 이래" 를 우리 수치로 말하려면 필요하다
  const toYear = Number(arg("--to", "")) || new Date().getUTCFullYear();
  const outPath = fromCwd(arg("--out", "data/datasets/reb-rent-index.json"));

  /* 실측으로 확정한 표(2026-07-29 discover). 매번 78개를 훑지 않고 이걸 먼저 쓴다.
   *
   * 왜 이 둘인가 — 부동산원은 보증금 크기로 임대차를 넷으로 나눈다:
   *   월세(보증금 ≤ 12개월치) · 준월세(12~240) · 준전세(>240) · 그리고 그 통합.
   * 우리가 말하는 "월세"는 **순수 월세**라 `월세가격지수_아파트` 를 쓴다.
   * (`월세통합가격지수` 는 준전세까지 섞여 전세와 겹쳐 읽힌다 — 두 지수를 나란히 놓는
   *  카드에서는 그게 이야기를 흐린다)
   * 아파트로 통일하는 이유: 우리 부동산 카드 전부가 아파트 기준이다. 섞으면 비교가 깨진다.
   *
   * 개편으로 ID가 죽으면 --jeonse/--wolse 로 덮어쓰거나 --discover 로 다시 찾는다. */
  const PINNED = {
    jeonse: { id: "A_2024_00050", name: "(월) 전세가격지수_아파트" },
    wolse: { id: "A_2024_00055", name: "(월) 월세가격지수_아파트" },
    /* 순수 월세지수는 **2015년 6월부터**다(실측). "통계 이래 안 올랐다"를 말하려면
     * 더 긴 계열이 필요해서 월세통합지수도 함께 받는다. 통합은 월세+준월세+준전세다.
     * 어느 쪽을 카드에 쓸지는 데이터를 보고 정하고, 쓴 쪽을 캡션에 밝힌다. */
    wolseAll: { id: "A_2024_00054", name: "(월) 월세통합가격지수_아파트" },
    /* ⚠️ 지수와 **실제 금액**은 다른 이야기를 한다(2026-07-29 발견).
     * 월세가격지수는 품질조정된 표본 지수라 서울 아파트가 2015-06~2026-06 에 +12% 남짓인데,
     * 언론이 말하는 "서울 월세 150만원 시대"는 **평균 월세가격(원)** 기준이다.
     * 어느 쪽도 틀리지 않았고 **재는 것이 다르다.** 둘 다 받아 두고, 카드에 쓴 쪽을 캡션에 밝힌다.
     * 금액 계열은 사람이 체감하는 숫자라 카드로는 대개 이쪽이 세다. */
    avgWolse: { id: "A_2024_00069", name: "(월) 평균월세가격_아파트" },
    avgJeonse: { id: "A_2024_00064", name: "(월) 평균전세가격_아파트" },
  };

  let jeonseId = arg("--jeonse");
  let wolseId = arg("--wolse");
  const picked: Record<string, string> = {};
  if (!jeonseId) {
    jeonseId = PINNED.jeonse.id;
    picked.jeonse = PINNED.jeonse.name;
  }
  if (!wolseId) {
    wolseId = PINNED.wolse.id;
    picked.wolse = PINNED.wolse.name;
  }
  // 이름으로 다시 찾아야 할 때(개편)만 목록을 훑는다
  if (process.argv.includes("--find")) {
    const tables = await listTables(key, "지수");
    console.log(`통계표 후보 ${tables.length}개에서 고릅니다.`);
    for (const [k, want] of [["jeonse", "전세"], ["wolse", "월세"]] as const) {
      const t = chooseTable(tables, want);
      if (!t) continue;
      if (k === "jeonse") jeonseId = t.id;
      else wolseId = t.id;
      picked[k] = t.name;
      console.log(`  ${want} → ${t.id} (${t.name})`);
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

  /* 지수 표는 항목이 여럿(지수·전월비…)이라 '지수'만 고른다.
   * 금액 표는 항목이 금액 하나뿐이라 조건을 주지 않는다 — 조건을 주면 통째로 걸러진다. */
  const onlyIndex = (n: string): boolean => n.includes("지수");
  const j = await fetchMonthly(key, jeonseId, fromYear, toYear, onlyIndex);
  const w = await fetchMonthly(key, wolseId, fromYear, toYear, onlyIndex);
  const wa = await fetchMonthly(key, PINNED.wolseAll.id, fromYear, toYear, onlyIndex);
  const aw = await fetchMonthly(key, PINNED.avgWolse.id, fromYear, toYear);
  const aj = await fetchMonthly(key, PINNED.avgJeonse.id, fromYear, toYear);
  const jeonse = toSeries(j.points);
  const wolse = toSeries(w.points);
  const wolseAll = toSeries(wa.points);
  const avgWolse = toSeries(aw.points);
  const avgJeonse = toSeries(aj.points);
  /* 계열은 **코드**로 키를 잡고 이름은 따로 둔다 — 중구·동구·남구·북구·서구는
   * 여러 광역시에 다 있어서 이름으로 접으면 서로 덮어쓴다(2026-07-29 실측). */
  const names = {
    ...regionNames(aj.points), ...regionNames(aw.points),
    ...regionNames(wa.points), ...regionNames(w.points), ...regionNames(j.points),
  };
  const dup = ambiguousNames(names);

  const regions = new Set([...Object.keys(jeonse), ...Object.keys(wolse)]);

  /* ── 쓰기 전 온전성 검사 ──
   * 반쪽 데이터를 파일로 쓰면 그대로 커밋되고, 그걸로 만든 카드는 오보가 된다.
   * 실제로 그렇게 됐다(2026-07-29): 월세 1페이지가 끊겨 **월세가 0건인 파일**이
   * "수집 성공"으로 커밋됐다. 그래서 여기서 막는다 — 의심스러우면 쓰지 않는다. */
  const fail: string[] = [];
  if (!Object.keys(jeonse).length) fail.push("전세 계열이 비어 있다");
  if (!Object.keys(wolse).length) fail.push("월세 계열이 비어 있다");
  // 두 계열의 최신 달이 크게 어긋나면 한쪽만 덜 받은 것이다
  const jLast = latestMonth(jeonse);
  const wLast = latestMonth(wolse);
  if (jLast && wLast) {
    const gap = Math.abs(Number(jLast.replace("-", "")) - Number(wLast.replace("-", "")));
    if (gap > 3) fail.push(`전세(${jLast})와 월세(${wLast})의 최신 달이 어긋난다`);
  }
  // 서울(500008)은 반드시 있어야 한다 — 우리 카드의 기준 지역이다
  for (const [label, s] of [["전세", jeonse], ["월세", wolse]] as const) {
    const seoul = s["500008"];
    if (!seoul || Object.keys(seoul).length < 24) {
      fail.push(`${label} 서울 계열이 없거나 너무 짧다(${seoul ? Object.keys(seoul).length : 0}개월)`);
    }
  }
  /* 서울 25개 자치구가 다 있는지 본다.
   * 자치구 순위 카드는 **25곳 전부**를 전제로 한다. 23곳만 있으면 순위가 조용히 달라진다. */
  const guMissing = SEOUL_GU_CODES.filter((c) => !wolse[c] || Object.keys(wolse[c]).length < 24);
  if (guMissing.length) {
    fail.push(
      `서울 자치구 ${guMissing.length}곳의 월세 계열이 없거나 짧다: ` +
        guMissing.map((c) => `${names[c] || "?"}(${c})`).join(", "),
    );
  }
  if (fail.length) {
    console.error("❌ 온전하지 않아 저장하지 않습니다:");
    for (const f of fail) console.error(`   · ${f}`);
    console.error("   (네트워크가 끊겼다면 다시 실행하세요. 반쪽 데이터로는 카드를 만들 수 없습니다)");
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
      tables: {
        jeonse: { id: jeonseId, name: picked.jeonse || "" },
        wolse: { id: wolseId, name: picked.wolse || "", note: "순수 월세(보증금 12개월치 이하) · 2015-06 시작" },
        wolseAll: { id: PINNED.wolseAll.id, name: PINNED.wolseAll.name, note: "월세+준월세+준전세 통합 · 더 긴 계열" },
        avgWolse: { id: PINNED.avgWolse.id, name: PINNED.avgWolse.name, note: "실제 평균 금액(원) — 지수와 다른 이야기를 한다" },
        avgJeonse: { id: PINNED.avgJeonse.id, name: PINNED.avgJeonse.name, note: "실제 평균 금액(원)" },
      },
      asOf,
      range: { from: fromYear, to: toYear },
      regions: regions.size,
      /* 같은 이름이 여러 코드에 걸린 목록. 빌더가 이름으로 지역을 집으려 할 때
       * 여기 있는 이름이면 **코드로 집어야 한다**는 경고다. */
      ambiguousNames: dup,
      /* 지역 묶음. **빌더는 코드 접두사로 지역을 자르지 말고 여기서 가져간다.**
       * "530 으로 시작하면 서울"이라고 자르면 분당·영통·일산 등 경기 24곳이 섞인다
       * (2026-07-30 실제로 서울 순위표 1위가 경기 수원 영통구로 나왔다). */
      groups: { seoulGu: [...SEOUL_GU_CODES] },
      notes: [j.note, w.note, wa.note, aw.note, aj.note].filter(Boolean),
      /* ── 사람이 확인한 기록은 덮지 않는다 ──
       * 2026-07-30: 예정 실행이 한 번 돌면서 `verified: true`·교차확인 메모·단위 확정 기록을
       * 전부 지워 버렸다. 그 세 줄은 **기사와 대조해 사람이 얻은 사실**이고, 수집기가
       * 매달 지우면 매달 다시 확인해야 한다. 게다가 카드 빌더는 verified 를 요구하므로
       * 수집이 성공할 때마다 카드 제작이 막히는 꼴이 된다.
       *
       * 규칙: 최신 관측월(asOf)이 그대로면 확인 기록을 **이어받는다.**
       *       새 달이 들어왔으면 그 달은 아직 확인 전이므로 false 로 내리고 이유를 남긴다.
       * 단위(unit)는 특정 달의 성질이 아니라 API 자체의 성질이라 항상 이어받는다. */
      ...carryVerification(outPath, asOf),
    },
    /** 코드 → 지역명 (표시용). 계열의 정체성은 코드다. */
    regionNames: names,
    jeonse,
    wolse,
    wolseAll,
    avgWolse,
    avgJeonse,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(doc, null, 2) + "\n", "utf8");

  const months = (s: Record<string, Record<string, number>>): number =>
    Math.max(0, ...Object.values(s).map((v) => Object.keys(v).length));
  console.log(`✅ ${outPath}`);
  console.log(`   지역 ${regions.size}개 · 최신 ${asOf}`);
  for (const [lbl, s2] of [["전세지수", jeonse], ["월세지수", wolse], ["월세통합지수", wolseAll],
    ["평균월세액", avgWolse], ["평균전세액", avgJeonse]] as const) {
    const seoul = s2["500008"] || {};
    const ks = Object.keys(seoul).sort();
    console.log(`   ${lbl}: 최장 ${months(s2)}개월 · 서울 ${ks.length}개월 (${ks[0] || "-"} → ${ks[ks.length - 1] || "-"})`);
  }
  const dupN = Object.keys(dup).length;
  if (dupN) {
    console.log(`   ⓘ 이름이 겹치는 지역 ${dupN}종 — 코드로 구분해야 한다:`);
    for (const [name, codes] of Object.entries(dup)) console.log(`      ${name} → ${codes.join(", ")}`);
  }
  // 서울 자치구를 코드로 집을 수 있게, 서울 계열 코드를 한 번 찍어 둔다(빌더가 참고)
  const seoulish = Object.entries(names).filter(([, n]) => /^서울/.test(n));
  for (const [code, n] of seoulish) console.log(`   서울 계열: ${code} = ${n}`);
  for (const n of doc.meta.notes) console.log(`   ⚠️ ${n}`);
}

main().catch((e) => {
  console.error(`실패 — ${e?.message || e}`);
  process.exit(1);
});
