/**
 * 외국인 주택소유통계(한국부동산원) 국적별 시계열 수집 — **Actions 전용**.
 *
 *   KOSIS_API_KEY=xxx tsx src/foreignHouseCli.ts --out <절대경로>/data/datasets/foreign-house-nat.json
 *
 * ── 이 수집기가 존재하는 이유
 * 「국적별 외국인 집주인이 어떻게 늘어왔나」 카드의 재료다. 보도자료 숫자를 옮겨 적는 대신
 * 원자료(KOSIS)에서 국적×시점을 통째로 받아 카드가 스스로 세게 한다.
 *
 * ── 반드시 두 표를 더한다 (2026-09-08 probe 로 확인)
 * 이 통계의 「주택수」는 **공동주택(DT_408004_007) + 단독주택(DT_408004_008)** 이다.
 * 한쪽만 쓰면 총계가 보도자료와 안 맞는데, **틀린 숫자도 그럴듯해 보인다** — 그래서
 * 총괄표(DT_408004_001)와 대조하는 검산을 넣었고, 어긋나면 던진다.
 *   실측 대조(2025년 하반기): 공동 59,082 + 단독 2,357 = 61,439호(중국) — 국토부 보도자료와 일치.
 *
 * ── 축·항목 (probe 실측, data/kosis-probe.md 2026-09-08)
 *   C1 = 국적: A01 중국 · A02 미국 · A03 캐나다 · A04 일본 · A05 대만 · A06 호주 ·
 *              A07 베트남 · A08 뉴질랜드 · A09 영/프/독 · A10 기타아시아 ·
 *              A11 기타유럽 · A12 기타국가 · A13 기타
 *   항목: T001 주택수 · T002 지분반영 주택수 · T003 소유자수 ·
 *         T004 1인당 평균소유주택수 · T005 지분반영 1인당 평균소유주택수
 *   시점: PRD_SE="S"(반기) · PRD_DE="202502" = 2025년 하반기(=2025년 12월 31일 기준)
 *
 * ⚠️ **T001 과 T002 를 섞지 않는다.** 지분반영은 공유지분을 쪼갠 값이라 총계가 다르다.
 *    보도자료가 말하는 「10만 8,231호」는 T001 이다.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fetchTable, TABLES } from "./sources/kosis.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** 국적 코드 → 이름. probe 가 준 그대로다(추측 금지). */
const NAT: Record<string, string> = {
  A01: "중국", A02: "미국", A03: "캐나다", A04: "일본", A05: "대만", A06: "호주",
  A07: "베트남", A08: "뉴질랜드", A09: "영/프/독", A10: "기타아시아",
  A11: "기타유럽", A12: "기타국가", A13: "기타",
};

type Row = {
  C1?: string; C1_NM?: string; ITM_ID?: string; PRD_DE?: string; PRD_SE?: string;
  DT?: string; UNIT_NM?: string; TBL_ID?: string;
};

/** 응답이 배열인지 확인한다. KOSIS 는 실패해도 200 을 주므로 모양을 직접 본다. */
function rowsOf(json: unknown, what: string): Row[] {
  if (!Array.isArray(json)) throw new Error(`${what}: 응답이 배열이 아니다 — ${JSON.stringify(json).slice(0, 300)}`);
  if (json.length === 0) throw new Error(`${what}: 응답이 비었다. 빈 배열은 '자료 없음'이 아니라 요청이 틀린 것일 수 있다`);
  return json as Row[];
}

/** 숫자만 통과시킨다. KOSIS 는 결측을 "-"·""·"…" 로 준다 — 그걸 0 으로 읽으면 그래프가 바닥으로 꺾인다. */
function num(dt: string | undefined, where: string): number {
  const s = String(dt ?? "").replace(/,/g, "").trim();
  if (!/^-?\d+(\.\d+)?$/.test(s)) throw new Error(`${where}: 숫자가 아닌 값 "${dt}"`);
  return Number(s);
}

/** "202502" → { year: 2025, half: 2, label: "2025년 하반기", asOf: "2025-12-31" } */
function period(prdDe: string) {
  const m = /^(\d{4})(0[12])$/.exec(prdDe);
  if (!m) throw new Error(`시점 표기가 예상과 다르다: "${prdDe}" (기대: YYYY01 또는 YYYY02)`);
  const year = Number(m[1]);
  const half = Number(m[2]);
  return {
    prdDe,
    year,
    half,
    label: `${year}년 ${half === 1 ? "상" : "하"}반기`,
    asOf: half === 1 ? `${year}-06-30` : `${year}-12-31`,
  };
}

async function main() {
  const key = process.env.KOSIS_API_KEY;
  if (!key) {
    console.error("KOSIS_API_KEY 가 없습니다 — 이 수집기는 GitHub Actions 에서만 돕니다.");
    process.exit(1);
  }
  const out = resolve(CWD, arg("out") ?? "data/datasets/foreign-house-nat.json");
  /* 반기 표라 시점 수가 적다. 넉넉히 20개를 부르고 **오는 만큼** 쓴다.
     기간 범위(startPrdDe~endPrdDe)를 쓰지 않는 이유: 반기 표기를 추측하지 않기 위해서다. */
  const CNT = 20;

  const grab = async (table: "foreignHouseNatApt" | "foreignHouseNatHouse" | "foreignHouseTotal", itmId: string) => {
    const json = await fetchTable(table, key, { newEstPrdCnt: CNT, itmId, objL1: "ALL" });
    return rowsOf(json, `${TABLES[table].label}(${itmId})`);
  };

  const [apt, house, aptOwner, houseOwner, total] = [
    await grab("foreignHouseNatApt", "T001"),
    await grab("foreignHouseNatHouse", "T001"),
    await grab("foreignHouseNatApt", "T003"),
    await grab("foreignHouseNatHouse", "T003"),
    await grab("foreignHouseTotal", "T001"),
  ];

  /* ── 국적×시점 격자를 만든다. 두 표를 **더한 값**이 이 통계의 '주택수'다. ── */
  const byPeriod = new Map<string, Map<string, { houses: number; owners: number }>>();
  const put = (rows: Row[], field: "houses" | "owners") => {
    for (const r of rows) {
      const code = String(r.C1 ?? "");
      if (!(code in NAT)) throw new Error(`모르는 국적 코드 ${code}(${r.C1_NM}) — probe 로 축을 다시 본다`);
      /* 이름까지 대조한다. 코드 체계가 바뀌면 조용히 다른 나라가 된다. */
      if (r.C1_NM && r.C1_NM !== NAT[code]) throw new Error(`국적 코드 ${code} 이름이 바뀌었다: "${r.C1_NM}" ≠ "${NAT[code]}"`);
      const p = String(r.PRD_DE ?? "");
      period(p); // 표기 검증
      if (!byPeriod.has(p)) byPeriod.set(p, new Map());
      const g = byPeriod.get(p)!;
      if (!g.has(code)) g.set(code, { houses: 0, owners: 0 });
      g.get(code)![field] += num(r.DT, `${p}/${code}/${field}`);
    }
  };
  put(apt, "houses");
  put(house, "houses");
  put(aptOwner, "owners");
  put(houseOwner, "owners");

  /* ── 총괄표와 대조한다. 두 표를 더한 값이 총괄과 다르면 우리가 뭔가 잘못 더한 것이다. ── */
  /* ⚠️ 총괄표의 C1 은 국적이 아니라 **주택종류**다(A01 전체주택 · A02 공동 · A03 단독).
     그대로 다 더하면 전체를 두 번 세어 216,462호가 된다 — 그럴듯한 숫자라 눈으로는 안 잡힌다.
     A01(전체주택) 한 줄만 쓰고, A02+A03 이 A01 과 맞는지도 함께 잰다. */
  const totalByPeriod = new Map<string, number>();
  const partsByPeriod = new Map<string, number>();
  for (const r of total) {
    const p = String(r.PRD_DE ?? "");
    const kind = String(r.C1 ?? "");
    const v = num(r.DT, `총괄/${p}/${kind}`);
    if (kind === "A01") totalByPeriod.set(p, v);
    else if (kind === "A02" || kind === "A03") partsByPeriod.set(p, (partsByPeriod.get(p) ?? 0) + v);
    else throw new Error(`총괄표에 모르는 주택종류 코드 ${kind}(${r.C1_NM}) — 축을 다시 본다`);
  }
  for (const [p, whole] of totalByPeriod) {
    const parts = partsByPeriod.get(p);
    if (parts !== undefined && parts !== whole) {
      throw new Error(`${p}: 총괄표의 공동+단독(${parts})이 전체주택(${whole})과 다르다 — 주택종류 축을 다시 본다`);
    }
  }

  const periods = [...byPeriod.keys()].sort();
  if (periods.length === 0) throw new Error("시점이 하나도 없다");

  const series = periods.map((p) => {
    const g = byPeriod.get(p)!;
    const nat: Record<string, { houses: number; owners: number }> = {};
    let sumHouses = 0;
    let sumOwners = 0;
    for (const [code, v] of g) {
      nat[NAT[code]] = v;
      sumHouses += v.houses;
      sumOwners += v.owners;
    }
    const declared = totalByPeriod.get(p);
    /* 총괄표는 국적축이 없어 한 시점에 한 줄이다. 있으면 반드시 맞아야 한다. */
    if (declared !== undefined && declared !== sumHouses) {
      throw new Error(
        `${p}: 국적별 합(${sumHouses})이 총괄표(${declared})와 다르다 — ` +
        `공동+단독을 더하는 방식이나 항목코드를 다시 본다`,
      );
    }
    return { ...period(p), totalHouses: sumHouses, totalOwners: sumOwners, nat };
  });

  const latest = series[series.length - 1];
  const payload = {
    _: "국적별 외국인 주택소유 현황(반기). 공동주택+단독주택 합산. KOSIS 원자료를 코드가 집계.",
    meta: {
      name: "국적별 외국인주택소유현황",
      source: "KOSIS 한국부동산원(orgId 408) — DT_408004_007(공동주택)·DT_408004_008(단독주택)·DT_408004_001(총괄)",
      asOf: latest.asOf,
      provenance: "KOSIS OpenAPI statisticsParameterData.do · itmId T001(주택수)·T003(소유자수) · objL1=ALL(국적) · newEstPrdCnt=" + CNT,
      verified: true,
      verificationNote:
        "축·항목은 2026-09-08 probe 실측(data/kosis-probe.md). 공동+단독 합을 총괄표(DT_408004_001)와 " +
        "시점마다 대조해 어긋나면 수집이 던진다. 2025년 하반기 중국 61,439호가 국토부 보도자료와 일치.",
      unit: "호",
      collectedAt: new Date().toISOString().slice(0, 10),
    },
    natCodes: NAT,
    series,
  };

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(payload, null, 1) + "\n");
  console.log(`✅ ${out}`);
  console.log(`   시점 ${series.length}개: ${series[0].label} ~ ${latest.label}`);
  console.log(`   최신 총계 ${latest.totalHouses.toLocaleString()}호 · 소유자 ${latest.totalOwners.toLocaleString()}명`);
  for (const k of ["중국", "미국", "캐나다", "대만", "호주"]) {
    console.log(`   ${k}: ${latest.nat[k]?.houses.toLocaleString()}호`);
  }
}

main().catch((e) => {
  console.error(`❌ ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
