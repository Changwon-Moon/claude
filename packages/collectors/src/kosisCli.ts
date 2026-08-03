/**
 * KOSIS 주민등록 인구 수집 CLI — Actions 에서 매월 한 번 돈다.
 *   KOSIS_API_KEY=xxx tsx src/kosisCli.ts [--today 2026-08-03] [--months 25] [--out dir]
 *
 * 산출: data/datasets/population-latest.json      (최신 시계열 + 자동 추출된 소재 신호)
 *       data/datasets/population/{YYYY-MM}.json   (그달 스냅숏 — 되짚어 볼 수 있게)
 *
 * ── 키가 없으면 **실패한다**(조용히 건너뛰지 않는다)
 * 2026-07-31 에 이 회사는 "키가 없으면 스크립트가 조용히 넘어가 몇 주간 아무도 몰랐던" 사고를
 * 겪었다. 정기 수집기가 조용히 아무것도 안 하면 그건 없는 것과 같다 → exit 1 로 워크플로를 빨갛게.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchTable, TABLES } from "./sources/kosis.js";
import {
  normalize, toSeries, milestones, streaks, topMovers, rank, joinReport,
  type Series, type Signal,
} from "./parse/kosis.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/* --dry — 네트워크 없이 배관 전체를 돌려 본다.
 * 작업 세션은 외부망이 막혀 있어 실제 호출을 못 한다. 그렇다고 돌려보지도 않고 워크플로에
 * 올리면 첫 실행이 곧 첫 시험이 된다. 정규화→시계열→소재 추출→점수→지도 조인까지 여기서 다 본다.
 * **키가 맞는지·필드 이름이 맞는지는 확인되지 않는다** — 그건 실제 실행뿐이다. */
const DRY = process.argv.includes("--dry");

/** 지도의 시군구 코드 목록 — 조인이 되는지 매번 확인한다. */
function geoCodes(): { codes: string[]; names: Map<string, string> } {
  const p = resolve(CWD, "data/geo/sgg-codes.json");
  if (!existsSync(p)) return { codes: [], names: new Map() };
  const d = JSON.parse(readFileSync(p, "utf8")) as { sgg: { code: string; name: string; sido: string }[] };
  return {
    codes: d.sgg.map((x) => x.code),
    names: new Map(d.sgg.map((x) => [x.code, `${x.sido} ${x.name}`])),
  };
}

/** 최근 N개월의 YYYYMM 범위 */
function periodRange(today: string, months: number): { start: string; end: string } {
  const [y, m] = today.split("-").map(Number);
  /* 주민등록 인구는 **전월분**이 다음 달 초에 공표된다 — 이번 달을 끝으로 잡으면 빈다. */
  const end = new Date(Date.UTC(y, m - 2, 1));
  const start = new Date(Date.UTC(y, m - 1 - months, 1));
  const ym = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return { start: ym(start), end: ym(end) };
}

/**
 * --dry 전용 합성 데이터.
 * ⚠️ **가짜 숫자다.** 실제 인구가 아니다. 그래서 산출 경로도 `_dry/` 로 갈라 두고
 *    meta.dry=true 를 박는다 — 진짜 데이터셋과 절대 섞이지 않게.
 *    목적은 오직 하나: 규칙·조인·등록 배관이 실제로 도는지 보는 것.
 */
function synthesize(codes: string[], names: Map<string, string>, months: number): unknown[] {
  const rows: Record<string, string>[] = [];
  codes.forEach((code, i) => {
    const base = 30_000 + ((i * 7919) % 970_000);
    /* 코드로 결정되는 값만 쓴다 — 난수를 쓰면 돌릴 때마다 결과가 달라져 확인이 안 된다. */
    const drift = ((i % 7) - 3) * (base > 500_000 ? 900 : 220);
    for (let k = months; k >= 0; k--) {
      const d = new Date(Date.UTC(2026, 6 - k, 1));
      rows.push({
        C1: code,
        C1_NM: (names.get(code) ?? code).split(" ").pop()!,
        PRD_DE: `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
        DT: String(base + drift * (months - k)),
        ITM_ID: "T20",
        ITM_NM: "총인구수",
        UNIT_NM: "명",
      });
    }
  });
  return rows;
}

async function main() {
  const key = process.env.KOSIS_API_KEY;
  if (!key && !DRY) {
    console.error("❌ KOSIS_API_KEY 가 없습니다.");
    console.error("   kosis.kr → 오픈API → 활용신청(즉시 발급) 후");
    console.error("   GitHub Secrets 에 KOSIS_API_KEY 로 등록하세요(이름이 한 글자만 달라도 안 읽힙니다).");
    process.exit(1);
  }

  /* 오늘 날짜는 **인자로 받는다.** 워크플로가 KST 기준 날짜를 넘겨 주므로 UTC 러너에서
     하루가 밀리지 않는다(렌더 결정성과 같은 이유). */
  const today = arg("today") ?? new Date().toISOString().slice(0, 10);
  const months = Number(arg("months") ?? 25); // 1년 증감률을 보려면 최소 13, 여유 있게 25
  const minScore = Number(arg("min") ?? 45);
  const outDir = resolve(CWD, arg("out") ?? "data/datasets");
  const { start, end } = periodRange(today, months);
  const geo = geoCodes();

  const payload = DRY
    ? synthesize(geo.codes, geo.names, months)
    : await fetchTable("population", key!, { prdSe: "M", startPrdDe: start, endPrdDe: end });

  const points = normalize(payload);
  const series: Series[] = toSeries(points);
  console.log(`· 시군구 ${series.length}곳 · 시점 ${series[0]?.points.length ?? 0}개 (${start}~${end})`);

  /* ── 지도 조인 검사 ──
     행정구역이 바뀌면 여기서 먼저 드러난다. 조용히 빈 칸으로 그리면 그게 곧 오보다. */
  const jr = joinReport(series, geo.codes);
  if (geo.codes.length) {
    console.log(`· 지도 조인 — 맞음 ${jr.matched.length} · 지도에 없음 ${jr.missingInGeo.length} · 데이터에 없음 ${jr.missingInData.length}`);
    if (jr.missingInGeo.length) {
      console.log(`  ⚠️ 지도에 없는 시군구: ${jr.missingInGeo.slice(0, 12).join(", ")}${jr.missingInGeo.length > 12 ? " …" : ""}`);
      console.log("     → data/geo/korea-sgg-2026.geojson 을 다시 만들어야 할 수 있습니다(scripts/build-sgg-geo.mjs).");
    }
  }

  /* ── 소재 자동 추출 — 규칙은 전부 parse/kosis.ts 안에 있다. LLM 이 고르지 않는다. */
  const signals: Signal[] = rank(
    [...milestones(series), ...streaks(series), ...topMovers(series)],
    minScore,
  );

  const latestPeriod = series[0]?.points.at(-1)?.period ?? end;
  const snapDir = join(outDir, DRY ? "_dry" : "population");
  mkdirSync(snapDir, { recursive: true });

  const doc = {
    _: [
      DRY
        ? "⚠️ --dry 합성 데이터입니다. 실제 인구가 아닙니다. 카드에 절대 쓰지 마세요."
        : "KOSIS 에서 코드가 그대로 받아 적은 것 — 손으로 넣은 값 0개.",
      "signals 의 점수·이유는 packages/collectors/src/parse/kosis.ts 의 규칙이 계산한 것이다.",
      "code = 통계청 행정구역코드(지도 data/geo/korea-sgg-2026.geojson 의 code 와 같은 열쇠).",
    ],
    meta: {
      name: "시군구 주민등록 인구",
      /* ⚠️ 아직 false 다. KOSIS 표 ID·필드 이름을 실제 응답으로 대조하기 전까지는
         '1차 출처에서 받았다'고 말할 수 없다. 첫 실행 뒤 오너가 눈으로 대조하면 승격한다. */
      verified: false,
      dry: DRY,
      source: `KOSIS 국가통계포털 ${TABLES.population.orgId}/${TABLES.population.tblId} (${TABLES.population.label})`,
      sourceUrl: `https://kosis.kr/statHtml/statHtml.do?orgId=${TABLES.population.orgId}&tblId=${TABLES.population.tblId}`,
      collectedFor: today,
      latestPeriod,
      periodRange: { start, end },
      unit: { value: "명" },
      geoJoin: {
        matched: jr.matched.length,
        missingInGeo: jr.missingInGeo,
        missingInData: jr.missingInData,
      },
    },
    signals,
    series,
  };

  if (!DRY) writeFileSync(join(outDir, "population-latest.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");
  writeFileSync(join(snapDir, `${DRY ? "dry" : latestPeriod}.json`), JSON.stringify(doc, null, 2) + "\n", "utf8");

  if (DRY) console.log("\n⚠️  --dry 모드 — 합성 숫자입니다. 실제 인구가 아닙니다(산출도 _dry/ 로 갈라 뒀습니다).");
  console.log(`\n✅ ${latestPeriod} 기준 · 문턱 ${minScore}점 넘은 소재 ${signals.length}건`);
  for (const s of signals.slice(0, 10)) {
    console.log(`   ${String(s.score).padStart(3)}점  [${s.kind}] ${s.title}  — ${s.reasons.join("·")}`);
  }
  if (!signals.length) console.log("   (이달에 새로 뜬 소재 없음 — 이것도 사실이다. 빈 결과와 실패는 다르다)");
}

main().catch((e) => {
  console.error(`❌ 수집 실패: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
