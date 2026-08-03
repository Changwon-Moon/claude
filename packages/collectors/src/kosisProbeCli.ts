/**
 * KOSIS 표 검증(probe) — **표가 진짜 우리가 생각한 그 표인지** 한 번 찍어 본다.
 *   KOSIS_API_KEY=xxx tsx src/kosisProbeCli.ts [--out data/kosis-probe.md]
 *
 * ── 왜 이게 필요한가 (2026-08-03)
 * kosis.kr 본문이 세션에서 안 열려(robots) 표 ID 를 **검색결과에 뜬 제목까지만** 확인했다.
 * 항목코드(itmId)·분류축(objL)·수록주기는 대부분 미확인이다. 이 상태로 정기 수집을 돌리면
 * 첫 실행이 곧 첫 시험이 되고, 더 나쁘게는 **엉뚱한 항목의 숫자가 조용히 카드에 올라간다.**
 * (예: 사망 표는 '사망원인 50항목' 축이 있어서, '계'를 안 고르면 특정 사인의 숫자가 총사망자수로 나간다.)
 *
 * 그래서 정기 수집과 검증을 나눴다. 이 스크립트는 표마다 **최근 1개 시점만** 받아
 *   · 응답이 오는가(표 ID·키가 맞는가)
 *   · 통계표명(TBL_NM)이 우리가 적어 둔 label 과 같은가
 *   · 어떤 항목(ITM_ID/ITM_NM)이 있는가
 *   · 분류축(C1~C4)이 무엇이고 시군구 5자리 코드가 실제로 오는가
 * 를 마크다운 표로 적어 커밋한다. 세션은 Actions 로그를 못 보므로 **이 파일이 유일한 눈**이다.
 *
 * 오너가 그 파일을 보고 맞다고 하면 `sources/kosis.ts` 의 `enabled` 를 켠다.
 * **검증 전 표는 정기 수집에 끼지 않는다.**
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fetchTable, fetchMeta, TABLES, type TableKey } from "./sources/kosis.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

type Probe = {
  key: string;
  ok: boolean;
  error?: string;
  rows?: number;
  tblNm?: string;
  items?: string[];
  axes?: { axis: string; sample: string[] }[];
  periods?: string[];
  sggCodes?: number;
  sample?: Record<string, unknown>;
  /** 실패했을 때 — 표의 분류축 메타. objL 을 어떻게 채워야 하는지 여기 답이 있다. */
  meta?: { axes: string; items: string };
  /** 축을 몇 개까지 열어야 응답이 왔는가 — 이 표의 진짜 축 개수다. */
  objLUsed?: number;
  /** 시도한 조합과 각각의 결과 — 실패해도 다음 사람이 어디까지 해봤는지 안다. */
  attempts?: string[];
};

/** 응답에서 분류축 C1~C4 의 값을 몇 개만 뽑아 본다 — 무엇이 그 축인지 사람이 보면 안다. */
function axesOf(rows: Record<string, unknown>[]): { axis: string; sample: string[] }[] {
  const out: { axis: string; sample: string[] }[] = [];
  for (const n of [1, 2, 3, 4]) {
    const id = `C${n}`;
    const nm = `C${n}_NM`;
    if (rows[0]?.[id] === undefined) continue;
    const seen = new Map<string, string>();
    for (const r of rows) {
      const k = String(r[id] ?? "");
      if (k && !seen.has(k)) seen.set(k, String(r[nm] ?? ""));
      if (seen.size >= 6) break;
    }
    out.push({ axis: id, sample: [...seen].map(([k, v]) => `${k}=${v}`) });
  }
  return out;
}

async function probeOne(key: TableKey, apiKey: string): Promise<Probe> {
  const attempts: string[] = [];
  try {
    /* 최근 1개 시점만. 전 기간을 받으면 수십 MB 라 검증 목적에 맞지 않는다.
       ── 축 열기 ──
       어떤 표는 축이 여럿이라(연령·성·출산순위·사망원인) objL1 만 주면 거부한다.
       무엇이 '계' 인지 모르므로 축을 하나씩 ALL 로 열어 보며 **응답이 올 때까지** 시도하고,
       온 응답의 C2·C3 에 실제로 무슨 코드가 들어 있는지 눈으로 본다.
       코드를 추측해 박지 않는다 — 사망원인 표에서 그 실수는 특정 사인을 총사망자수로 만든다. */
    let json: unknown = null;
    let used = 0;
    let lastErr: unknown = null;
    for (const extra of [[], ["ALL"], ["ALL", "ALL"], ["ALL", "ALL", "ALL"]]) {
      try {
        json = await fetchTable(key, apiKey, { newEstPrdCnt: 1, extraObjL: extra });
        used = extra.length;
        attempts.push(`objL2..${extra.length + 1}=${extra.join(",") || "(없음)"} → 성공`);
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        const m = e instanceof Error ? e.message : String(e);
        attempts.push(`objL2..${extra.length + 1}=${extra.join(",") || "(없음)"} → ${m.slice(0, 80)}`);
        /* objL 부족이 아닌 다른 오류면 더 열어도 소용없다 — 바로 접는다. */
        if (!m.includes("objL")) break;
      }
    }
    if (lastErr) throw lastErr;
    const rows = (Array.isArray(json) ? json : []) as Record<string, unknown>[];
    if (!rows.length) return { key, ok: false, error: "행이 0개 — 표 ID 또는 분류축이 맞지 않을 수 있다" };

    const uniq = (f: string) => [...new Set(rows.map((r) => String(r[f] ?? "")).filter(Boolean))];
    const items = [...new Set(rows.map((r) => `${r.ITM_ID}=${r.ITM_NM}`))].slice(0, 12);

    return {
      key,
      ok: true,
      objLUsed: used,
      attempts,
      rows: rows.length,
      tblNm: String(rows[0].TBL_NM ?? "(응답에 TBL_NM 없음)"),
      items,
      axes: axesOf(rows),
      periods: uniq("PRD_DE").slice(0, 3),
      /* 시군구(5자리)가 실제로 오는가 — 이게 0 이면 그 표는 시도까지만 준다는 뜻이다. */
      sggCodes: new Set(rows.map((r) => String(r.C1 ?? "")).filter((c) => /^\d{5}$/.test(c))).size,
      sample: rows[0],
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    /* 실패했으면 **왜** 실패했는지까지 한 번에 가져온다.
       다음 세션이 같은 실패를 또 보고 또 메타를 따로 받는 왕복을 하지 않도록. */
    let meta: Probe["meta"];
    try {
      const [obj, itm] = await Promise.all([
        fetchMeta(key, apiKey, "OBJ").catch((x) => ({ 메타실패: String(x?.message ?? x) })),
        fetchMeta(key, apiKey, "ITM").catch((x) => ({ 메타실패: String(x?.message ?? x) })),
      ]);
      meta = {
        axes: JSON.stringify(obj, null, 1).slice(0, 6000),
        items: JSON.stringify(itm, null, 1).slice(0, 3000),
      };
    } catch { /* 메타까지 실패하면 그냥 없이 간다 */ }
    return { key, ok: false, error, meta, attempts };
  }
}

async function main() {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) {
    console.error("❌ KOSIS_API_KEY 가 없습니다.");
    console.error("   kosis.kr → 오픈API → 활용신청(즉시 발급) 후 Secrets 에 KOSIS_API_KEY 로 등록하세요.");
    process.exit(1);
  }

  const out = resolve(CWD, arg("out") ?? "data/kosis-probe.md");
  const keys = Object.keys(TABLES) as TableKey[];
  const results: Probe[] = [];

  for (const k of keys) {
    process.stdout.write(`· ${k} (${TABLES[k].tblId}) … `);
    const r = await probeOne(k, apiKey);
    results.push(r);
    console.log(r.ok
      ? `OK ${r.rows}행 · 시군구코드 ${r.sggCodes}개 · 추가축 ${r.objLUsed ?? 0}개`
      : `실패 — ${r.error?.slice(0, 120)}`);
  }

  const L: string[] = [];
  L.push("# KOSIS 표 검증 결과");
  L.push("");
  L.push("> 표가 **진짜 우리가 생각한 그 표인지** 최근 1개 시점만 받아 확인한 것이다.");
  L.push("> 세션은 Actions 로그를 못 보므로 이 파일이 유일한 눈이다.");
  L.push("> **맞다고 확인되면 `packages/collectors/src/sources/kosis.ts` 의 `enabled` 를 켠다.**");
  L.push("");
  L.push("| 표 | tblId | 결과 | 통계표명(응답) | 시군구코드 | 우리가 적어둔 확신도 |");
  L.push("|---|---|---|---|---|---|");
  for (const r of results) {
    const t = TABLES[r.key];
    L.push(
      `| ${r.key} | \`${t.tblId}\` | ${r.ok ? "✅" : "❌"} | ${r.ok ? r.tblNm : "—"} | ` +
      `${r.ok ? `${r.sggCodes}개` : "—"} | ${t.confidence}${t.enabled ? " · 수집중" : " · 대기"} |`,
    );
  }

  for (const r of results) {
    const t = TABLES[r.key];
    L.push("");
    L.push(`## ${r.key} — ${t.label}`);
    L.push("");
    L.push(`- tblId: \`${t.tblId}\` · 주기 \`${t.prdSe}\` · 우리가 뽑으려는 값: **${t.metric}**`);
    L.push(`- 메모: ${t.note}`);
    if (!r.ok) {
      L.push(`- ❌ **실패**: ${r.error}`);
      if (r.attempts?.length) {
        L.push("");
        L.push("**시도한 축 조합** — 다음 사람이 같은 것을 또 해보지 않도록");
        L.push("");
        for (const a of r.attempts) L.push(`- ${a}`);
      }
      if (r.meta) {
        L.push("");
        L.push("**분류축 메타(OBJ)** — `objL1`·`objL2`… 를 여기 코드로 채운다. 축이 여럿이면 행정구역이 아닌 축은 '계'를 고른다");
        L.push("");
        L.push("```json");
        L.push(r.meta.axes);
        L.push("```");
        L.push("");
        L.push("**항목 메타(ITM)**");
        L.push("");
        L.push("```json");
        L.push(r.meta.items);
        L.push("```");
      }
      continue;
    }
    L.push(`- 시점: ${r.periods?.join(", ")}`);
    L.push(`- **행정구역 외 축 ${r.objLUsed ?? 0}개**${r.objLUsed ? " — 아래 분류축에서 '계'에 해당하는 코드를 골라 박아야 한다" : " (행정구역 축 하나뿐 — 그대로 써도 된다)"}`);
    L.push(`- **시군구(5자리) 코드 ${r.sggCodes}개** ${r.sggCodes ? "" : "← 0 이면 이 표는 시도까지만 준다"}`);
    L.push("");
    L.push("**항목(itmId)** — 우리가 뽑을 항목을 여기서 고른다");
    L.push("");
    for (const it of r.items ?? []) L.push(`- \`${it}\``);
    L.push("");
    L.push("**분류축** — 행정구역이 아닌 축(성별·연령·사망원인 등)은 '계'를 골라야 한다");
    L.push("");
    for (const a of r.axes ?? []) L.push(`- \`${a.axis}\`: ${a.sample.join(" · ")}`);
    L.push("");
    L.push("<details><summary>응답 한 행 원본</summary>");
    L.push("");
    L.push("```json");
    L.push(JSON.stringify(r.sample, null, 2));
    L.push("```");
    L.push("");
    L.push("</details>");
  }

  L.push("");
  L.push("---");
  L.push("");
  L.push("⚠️ **이 파일을 보고 판단할 것**");
  L.push("");
  L.push("1. 통계표명이 우리가 적어 둔 label 과 같은가 (다르면 표 ID 가 틀린 것이다)");
  L.push("2. 시군구 5자리 코드가 충분히 오는가 (0 이면 그 표로는 시군구 카드를 못 만든다)");
  L.push("3. 항목 중 우리가 원하는 것이 있는가 (총인구·세대수·총전입·총전출·출생아수·사망자수 '계')");
  L.push("4. 행정구역 말고 다른 축이 있으면 **'계'에 해당하는 코드**를 찾아 `objL2` 에 박아야 한다");

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, L.join("\n") + "\n", "utf8");

  const ok = results.filter((r) => r.ok).length;
  console.log(`\n✅ ${ok}/${results.length} 표 응답 확인 → ${out}`);
  /* 하나라도 실패하면 빨갛게 만든다 — 검증이 조용히 반쪽만 되는 것이 가장 나쁘다. */
  if (ok < results.length) process.exit(1);
}

main().catch((e) => {
  console.error(`❌ 검증 실패: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
