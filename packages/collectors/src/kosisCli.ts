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
import {
  fetchTable, fetchTableChunked, TABLES, enabledTables, chunkSizeFor, rangeForTable, type TableKey,
} from "./sources/kosis.js";
import {
  normalize, seniorPoints, nationalByPeriod, coverageGap, toSeries, milestones, streaks, topMovers, rank, joinReport,
  type Series, type Signal, type Point,
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


/* ── 코드 대조표 읽기 ──
   없으면 조용히 넘어가지 않는다. vital 체계 표를 켜 놓고 대조표가 없으면
   숫자가 엉뚱한 지역에 얹히는데, 지도는 정상으로 보인다. */
type RegionMap = { maps?: Record<string, Record<string, string>>; unmatched?: Record<string, unknown[]> };

function loadRegionMap(cwd: string): RegionMap {
  const p = resolve(cwd, "data/geo/kosis-region-map.json");
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf8")) as RegionMap;
  } catch {
    return {};
  }
}

/**
 * 나눠 부를 때 쓸 지역 코드 목록 — **그 표의 코드 체계로** 준다.
 * 지도 코드를 그대로 넘기면 KOSIS 가 못 알아듣거나(11010 은 인구표에 없다)
 * 더 나쁘게는 **다른 지역으로 알아듣는다.** 대조표의 열쇠가 곧 그 표의 코드다.
 */
function regionCodesFor(t: TableKey, rm: RegionMap): string[] {
  const keys = Object.keys(rm.maps?.[t] ?? {}).filter((c) => c.length === 5);
  if (!keys.length) {
    throw new Error(`${t}: 대조표가 없어 나눠 부를 지역 코드를 못 만든다 — build-kosis-region-map.mjs 를 돌리세요.`);
  }
  return keys;
}

/**
 * KOSIS 코드를 **지도 코드**로 옮긴다.
 * 대조표에 없는 코드는 버린다 — 폐지된 행정구역·출장소·일반구의 부모 시 행이다.
 * (부모 시 행을 남기면 수원시 값이 수원시장안구 자리에 들어갈 수 있다.)
 */
function remapRegions(
  points: Point[],
  map: Record<string, string>,
): { points: Point[]; collisions: string[] } {
  if (!Object.keys(map).length) return { points, collisions: [] };

  /* ── 여러 KOSIS 코드가 한 지역으로 모인다 ──
     출생·사망 표는 광역시 산하 군을 **두 코드로** 준다 — 편입 전 코드와 현재 코드다.
     울주군 26310(옛) + 26510(현) · 달성군 22310 + 22510 · 강화군 23310 + 23510 …
     83곳이 이렇다. 옛 코드 행은 값이 0 이고 현재 코드에 실제 값이 있다.

     그냥 덮어쓰면 **어느 쪽이 살아남는지가 응답 순서에 달린다.**
     실제로 울주군·달성군·강화군의 2024년 출생아가 0명으로 들어와 있었다.
     0명은 "그 해 아이가 한 명도 안 태어났다" 로 읽히고, 자연감소 순위에서 1위가 된다.

     그래서 덮어쓰지 않고 **더한다.** 한쪽이 0 이므로 합이 곧 실제 값이다.
     다만 **둘 다 값이 있으면 더하는 것이 틀린다** — 그때는 목록에 담아 경고한다. */
  const acc = new Map<string, Point>();
  const nonZero = new Map<string, number>();
  const collisions = new Set<string>();

  for (const pt of points) {
    const to = map[pt.code];
    if (!to) continue;
    const k = `${to}|${pt.period}`;
    const cur = acc.get(k);
    if (cur) {
      cur.value += pt.value;
      if (pt.value !== 0 && (nonZero.get(k) ?? 0) >= 1) collisions.add(`${cur.name}(${pt.period})`);
    } else {
      acc.set(k, { ...pt, code: to });
    }
    if (pt.value !== 0) nonZero.set(k, (nonZero.get(k) ?? 0) + 1);
  }
  return { points: [...acc.values()], collisions: [...collisions] };
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

  /* ── 켜져 있는 표만 받는다 ──
     `enabled: false` 인 표는 아직 규격이 확인되지 않은 것이다(sources/kosis.ts 의 note 참고).
     `kosisProbeCli.ts` 로 검증하고 오너가 확인한 뒤에 켠다.
     **확인 안 된 표에서 뽑은 숫자가 카드에 올라가는 것이 이 회사에서 가장 위험한 일이다.** */
  const tables = DRY ? (["population"] as TableKey[]) : enabledTables();
  const waiting = (Object.keys(TABLES) as TableKey[]).filter((k) => !TABLES[k].enabled);

  /* ── 행정구역 코드 대조표 ──
     KOSIS 안에서도 표마다 코드 체계가 다르다. 인구동향 계열(출생·사망)은
     26=울산인데 주민등록 계열은 26=부산이다. 숫자로 조인하면 조용히 뒤바뀐다.
     대조표는 scripts/build-kosis-region-map.mjs 가 probe 원자료로 만든다. */
  const regionMap = loadRegionMap(CWD);

  const metrics: Record<string, Series[]> = {};
  /* ── 한 표가 넘어져도 나머지는 간다 ──
     표 하나에서 던지면 수집 전체가 멈춘다. 새로 켠 표(연령·출생)가 넘어졌다고
     잘 돌던 인구·세대수까지 못 받는 것은 손해가 크다.
     다만 **조용히 넘어가지는 않는다** — 실패를 모아 두었다가 보고서에 적고,
     산출물을 다 쓴 뒤에 빨간불로 끝낸다. 데이터는 남기고 실패는 보이게 한다.
     인구는 예외다. 모든 신호의 기준선이라 없으면 아래에서 어차피 멈춘다. */
  const failures: { table: string; why: string }[] = [];
  const coverageWarnings: string[] = [];
  for (const t of tables) {
    const spec = TABLES[t];
    try {
      const rng = rangeForTable(spec, today, months);
      const periods = rng.periods;

      let payload: unknown;
      if (DRY) {
        payload = synthesize(geo.codes, geo.names, months);
      } else if ((spec.cellsPerRegionPeriod ?? 1) > 1) {
        /* 축이 큰 표(연령 1세별·사망원인)는 4만 셀 한도에 걸린다 — 지역을 나눠 부른다.
           나눌 코드는 그 표의 코드 체계로 줘야 한다. */
        const codes = regionCodesFor(t, regionMap);
        const size = chunkSizeFor(t, periods);
        console.log(`· ${spec.metric}(${spec.tblId}) — ${rng.start}~${rng.end}(${periods}시점) · 지역 ${codes.length}곳을 ${size}개씩 ${Math.ceil(codes.length / size)}번에 나눠 받습니다(4만 셀 한도)`);
        payload = await fetchTableChunked(
          t, key!,
          { startPrdDe: rng.start, endPrdDe: rng.end, prdSe: spec.prdSe },
          codes, periods,
          (d, n) => { if (d === n || d % 5 === 0) console.log(`   ${d}/${n}`); },
        );
      } else {
        payload = await fetchTable(t, key!, { startPrdDe: rng.start, endPrdDe: rng.end, prdSe: spec.prdSe, extraObjL: spec.extraObjL });
      }

      /* 1세별처럼 한 지역에 여러 줄이 오는 표는 그대로 시계열로 못 쓴다 — 먼저 접는다. */
      let points = spec.derive === "senior65"
        ? seniorPoints(payload, spec.regionAxis ?? "C1")
        : normalize(payload, spec.regionAxis ?? "C1");

      /* ── 코드 변환은 **모든 표**에 건다 ──
         2026-08-04 실측: 우리 지도(11010=종로구)는 인구·세대·이동·연령 표(11110=종로구)와
         체계가 다르다. 겹치는 코드가 255개 중 9개뿐이고 그 9개는 **우연히 같은 숫자**다.
         변환을 안 걸면 9곳에 엉뚱한 숫자가 들어가고 246곳이 빈다 —
         빈 지도는 "데이터가 없다"로 보이고, 채워진 9곳은 아무도 의심하지 않는다.
         출생·사망만 변환하던 때가 있었는데, 방향이 반대였다. */
      const codeMap = regionMap.maps?.[t] ?? {};
      if (!Object.keys(codeMap).length) {
        throw new Error(
          `${t}: 코드 대조표가 없다. data/geo/kosis-region-map.json 에 '${t}' 항목이 있어야 한다.\n` +
          "   → Actions 로 kosis-probe 를 돌린 뒤 node scripts/build-kosis-region-map.mjs 로 다시 만드세요.\n" +
          "   대조표 없이 코드를 그대로 쓰면 엉뚱한 시군구에 숫자가 얹힙니다.",
        );
      }
      const before = points.length;
      const mapped = remapRegions(points, codeMap);
      points = mapped.points;
      console.log(`· ${spec.metric} 코드 변환 → 지도 코드: ${points.length}/${before}행`);
      if (mapped.collisions.length) {
        console.log(`::warning::${spec.metric} — 한 지역에 값이 둘 이상 들어온 곳 ${mapped.collisions.length}건: ${mapped.collisions.slice(0, 6).join(", ")}`);
        console.log("   옛 코드와 현재 코드가 둘 다 값을 가진 경우입니다. 더하면 이중 계산이 됩니다 — 확인이 필요합니다.");
      }
      if (!points.length && before) {
        throw new Error(`${t}: 대조표가 한 행도 못 옮겼다 — 대조표를 다시 만들어야 한다.`);
      }
      /* ── 얼마나 놓쳤는지 같은 응답 안의 전국 값과 대 본다 ──
         빠진 시군구는 지도에서 빈 칸으로 보이고, 빈 칸은 "데이터 없는 곳" 으로 읽힌다.
         전국 순위 카드를 만들면 그 도시가 없는 순위가 된다. 조용히 넘어가면 안 된다. */
      const nat = nationalByPeriod(payload, spec.regionAxis ?? "C1");
      const gap = spec.derive ? null : coverageGap(points, nat);
      if (gap) {
        const line = `· ${spec.metric} 전국 대조 ${gap.period}: 우리 합계 ${gap.ours.toLocaleString()} / 전국 ${gap.national.toLocaleString()} — 차이 ${gap.gapPct.toFixed(1)}%`;
        if (Math.abs(gap.gapPct) >= 3) {
          console.log(`::warning::${line}`);
          console.log("   → 빠진 시군구가 있습니다. 이 지표로 전국 순위·합계 카드를 만들면 그만큼 틀립니다.");
          coverageWarnings.push(`${spec.metric} ${gap.gapPct.toFixed(1)}% 부족(${gap.period})`);
        } else {
          console.log(line);
        }
      }

      metrics[spec.metric] = toSeries(points);
      console.log(`· ${spec.metric}(${spec.tblId}) — 시군구 ${metrics[spec.metric].length}곳 · 시점 ${metrics[spec.metric][0]?.points.length ?? 0}개`);
    } catch (e) {
      const why = e instanceof Error ? e.message : String(e);
      failures.push({ table: `${t}(${spec.tblId})`, why });
      console.log(`::error::${spec.metric}(${spec.tblId}) 수집 실패 — ${why}`);
      console.log(`  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.`);
    }
  }
  if (waiting.length) {
    console.log(`· 검증 대기 중인 표 ${waiting.length}개: ${waiting.map((k) => `${k}(${TABLES[k].tblId})`).join(", ")}`);
    console.log("  → pnpm --filter @wirit/collectors probe-kosis 로 규격을 확인한 뒤 enabled 를 켭니다.");
  }

  /* 인구는 모든 신호의 기준선이다 — 없으면 소재를 만들 수 없다. */
  const series: Series[] = metrics["인구"] ?? [];
  if (!series.length) throw new Error("인구 시계열이 비었다 — 표 ID·기간·인증키를 확인해야 한다.");
  console.log(`· 기준 인구 시계열 ${series.length}곳 (${start}~${end})`);

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
      source: `KOSIS 국가통계포털 · ${tables.map((t) => `${TABLES[t].orgId}/${TABLES[t].tblId}(${TABLES[t].label})`).join(" · ")}`,
      sourceUrl: `https://kosis.kr/statHtml/statHtml.do?orgId=${TABLES.population.orgId}&tblId=${TABLES.population.tblId}`,
      collectedFor: today,
      latestPeriod,
      periodRange: { start, end },
      unit: { value: "명" },
      /* 어떤 표를 실제로 받았고, 무엇이 아직 검증 대기인지 데이터셋에 남긴다 —
         카드를 만들 때 "왜 이 지표는 없나"를 다시 파지 않도록. */
      tables: tables.map((t) => ({ key: t, tblId: TABLES[t].tblId, metric: TABLES[t].metric, confidence: TABLES[t].confidence })),
      tablesWaiting: waiting.map((t) => ({ key: t, tblId: TABLES[t].tblId, metric: TABLES[t].metric, note: TABLES[t].note })),
      geoJoin: {
        matched: jr.matched.length,
        missingInGeo: jr.missingInGeo,
        missingInData: jr.missingInData,
      },
    },
    signals,
    series,
    /* 인구 말고 다른 지표(세대수·이동·연령·출생·사망)는 검증되어 켜지는 대로 여기 쌓인다. */
    metrics,
  };

  if (!DRY) writeFileSync(join(outDir, "population-latest.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");
  writeFileSync(join(snapDir, `${DRY ? "dry" : latestPeriod}.json`), JSON.stringify(doc, null, 2) + "\n", "utf8");

  if (DRY) console.log("\n⚠️  --dry 모드 — 합성 숫자입니다. 실제 인구가 아닙니다(산출도 _dry/ 로 갈라 뒀습니다).");
  console.log(`\n✅ ${latestPeriod} 기준 · 문턱 ${minScore}점 넘은 소재 ${signals.length}건`);
  for (const s of signals.slice(0, 10)) {
    console.log(`   ${String(s.score).padStart(3)}점  [${s.kind}] ${s.title}  — ${s.reasons.join("·")}`);
  }
  if (!signals.length) console.log("   (이달에 새로 뜬 소재 없음 — 이것도 사실이다. 빈 결과와 실패는 다르다)");

  /* 산출물을 다 쓴 뒤에 실패를 알린다 — 데이터는 남기고 실패는 보이게 한다. */
  if (coverageWarnings.length) {
    console.log(`\n⚠️ 전국 대조에서 벌어진 지표 ${coverageWarnings.length}개: ${coverageWarnings.join(" · ")}`);
    console.log("   빠진 시군구가 있다는 뜻입니다 — 그 지표로 전국 순위·합계를 말하면 그만큼 틀립니다.");
  }
  reportFailures(failures);
  if (failures.length) process.exit(1);
}

/* 실패한 표가 있으면 **산출물을 다 쓴 뒤에** 빨간불로 끝낸다.
   조용히 성공으로 끝내면 "이번 달은 이게 다" 로 읽히고, 빠진 지표를 아무도 못 챙긴다. */
function reportFailures(failures: { table: string; why: string }[]): void {
  if (!failures.length) return;
  console.log(`\n⚠️ 표 ${failures.length}개가 이번 회차에서 빠졌습니다:`);
  for (const f of failures) console.log(`   · ${f.table} — ${f.why}`);
  console.log("   나머지 표의 산출물은 정상적으로 기록됐습니다.");
}

main().catch((e) => {
  console.error(`❌ 수집 실패: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
