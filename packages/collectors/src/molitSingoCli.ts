/**
 * 오늘의 신고가(역대 최고가 경신) 수집 CLI — 매일 아침 (네트워크·키 필요 → GitHub Actions).
 *
 *   MOLIT_API_KEY=xxx tsx src/molitSingoCli.ts --today 2026-08-13 [--min-hhld 1000] [--months 2]
 *
 * ── 하는 일
 * ① 대상 지역의 **최근 몇 달치 실거래**를 받는다(신고기한이 30일이라 어제 계약이 오늘 뜨진 않는다)
 * ② `data/datasets/molit-peak/` 의 **역대 최고가 인덱스**와 대조해 넘어선 거래만 고른다
 * ③ 단지 세대수를 붙여 **1000세대 이상**만 남긴다 (2026-08-12 오너 결정)
 * ④ 인덱스를 갱신한다 — 그래야 내일은 오늘 것이 기준이 된다
 *
 * ── 판정하지 않는 것
 * · **역대 인덱스가 아직 안 채워진 지역** — 반쪽 기준으로 "역대 최고가"라 부르면 그게 오보다.
 *   초기 수집(molitPeakCli)이 그 지역을 끝낼 때까지 그 지역은 조용히 건너뛴다(건너뛴 사실은 남긴다).
 * · **직거래** — 특수관계인 거래가 섞여 시세로 읽기 어렵다. 다만 인덱스에는 넣는다.
 *   기록에서 빼면 직거래로 세워진 고점을 모르고 "역대 최고가"라 부르게 되기 때문이다.
 * · **세대수를 못 붙인 단지** — 추측해서 붙이지 않는다. 놓친 이름은 파일로 남겨 다음에 고친다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchAptTradesMonth } from "./sources/molit.js";
import { fetchAptList, fetchAptBasis } from "./sources/aptInfo.js";
import { validTrades, type AptTrade } from "./parse/molit.js";
import { matchApt, type AptListItem } from "./parse/aptInfo.js";
import { foldPeaks, findSingo, manwonToKo, type PeakIndex, type SingoHit } from "./parse/singo.js";
import { singoRegions, monthRange } from "./sources/singoRegions.js";

const CWD = process.env.INIT_CWD || process.cwd();
const R = (p: string) => resolve(CWD, p);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** today(YYYY-MM-DD) 기준 최근 n개월의 YYYYMM (오래된 것부터) */
function recentMonths(today: string, n: number): string[] {
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  let sy = y;
  let sm = m - (n - 1);
  while (sm <= 0) { sm += 12; sy--; }
  return monthRange(`${sy}${String(sm).padStart(2, "0")}`, `${y}${String(m).padStart(2, "0")}`);
}

interface HhldCache {
  updatedAt: string;
  note: string;
  byKapt: Record<string, { name: string; hhld: number; addr: string }>;
  /** 실거래 표기(구|법정동|단지명) → 단지코드. 못 찾은 것은 "" 로 남겨 매일 다시 두드리지 않는다 */
  match: Record<string, string>;
}

async function main() {
  const key = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_API_KEY;
  if (!key) {
    console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }
  const today = arg("today") ?? new Date().toISOString().slice(0, 10);
  const minHhld = Number(arg("min-hhld") ?? 1000);
  const nMonths = Number(arg("months") ?? 2);
  const topN = Number(arg("top") ?? 10);
  const lookupBudget = Number(arg("lookup-budget") ?? 120);

  const peakDir = R("data/datasets/molit-peak");
  const listDir = R("data/datasets/apt-list");
  mkdirSync(listDir, { recursive: true });

  const hhldPath = R("data/datasets/apt-hhld.json");
  const hhld: HhldCache = existsSync(hhldPath)
    ? JSON.parse(readFileSync(hhldPath, "utf8"))
    : {
        updatedAt: "",
        note: "국토교통부 공동주택 기본 정보(getAphusBassInfoV3)의 세대수(kaptdaCnt). 코드가 받아 적는다.",
        byKapt: {},
        match: {},
      };

  const regions = singoRegions();
  const months = recentMonths(today, nMonths);
  const hits: SingoHit[] = [];
  const skipped: string[] = [];
  let fetched = 0;

  for (const { gu, lawdCd } of regions) {
    const peakPath = join(peakDir, `${lawdCd}.json`);
    if (!existsSync(peakPath)) {
      skipped.push(`${gu} (역대 인덱스 없음)`);
      continue;
    }
    const idx: PeakIndex = JSON.parse(readFileSync(peakPath, "utf8"));
    const done = new Set(idx.meta.doneMonths);

    // ── 이 지역의 역대 인덱스가 실제로 "역대"인지 본다.
    // 2006-01 부터 지난달까지가 다 차 있어야 신고가를 판정한다.
    const need = monthRange("200601", months[months.length - 2] ?? months[0]);
    const missing = need.filter((m) => !done.has(m));
    const judgeable = missing.length === 0;
    if (!judgeable) skipped.push(`${gu} (초기 수집 ${missing.length}개월 남음)`);

    const fresh: AptTrade[] = [];
    for (const ym of months) {
      try {
        const raw = await fetchAptTradesMonth(lawdCd, ym, key);
        fetched++;
        fresh.push(...raw);
        if (!done.has(ym)) { idx.meta.doneMonths.push(ym); done.add(ym); }
      } catch (e) {
        console.error(`⚠️ ${gu} ${ym} 수집 실패: ${e instanceof Error ? e.message : e}`);
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    const tx = validTrades(fresh);

    if (judgeable) {
      // 직거래는 알림 대상에서 뺀다(특수관계인 거래 위험). 다만 아래에서 인덱스에는 넣는다.
      const brokered = tx.filter((t) => t.dealingGbn !== "직거래");
      for (const h of findSingo(idx.peaks, lawdCd, gu, brokered)) hits.push(h);
    }
    // 직거래 포함 전건을 인덱스에 접어 넣는다 — 기록은 기록대로 남아야 한다
    foldPeaks(idx.peaks, lawdCd, tx);
    idx.meta.doneMonths.sort();
    idx.meta.updatedAt = today;
    writeFileSync(peakPath, JSON.stringify(idx, null, 0) + "\n");
  }

  // ── 세대수 붙이기 (필요한 단지만, 예산 안에서)
  let looked = 0;
  const unmatched: string[] = [];
  const withHhld: (SingoHit & { hhld: number })[] = [];
  const guOf = new Map(regions.map((r) => [r.lawdCd, r.gu]));

  for (const h of hits) {
    const mk = `${h.lawdCd}|${h.umdNm}|${h.aptNm}`;
    let kapt = hhld.match[mk];
    if (kapt === undefined && looked < lookupBudget) {
      const listPath = join(listDir, `${h.lawdCd}.json`);
      let list: AptListItem[] = [];
      if (existsSync(listPath)) {
        list = JSON.parse(readFileSync(listPath, "utf8")).items;
      } else {
        try {
          list = await fetchAptList(h.lawdCd, key);
          looked++;
          writeFileSync(
            listPath,
            JSON.stringify(
              { meta: { lawdCd: h.lawdCd, gu: guOf.get(h.lawdCd) ?? "", updatedAt: today, source: "국토교통부 공동주택 단지 목록제공 서비스" }, items: list },
              null,
              0,
            ) + "\n",
          );
        } catch (e) {
          console.error(`⚠️ ${h.lawdCd} 단지목록 실패: ${e instanceof Error ? e.message : e}`);
        }
      }
      const m = matchApt(list, h.umdNm, h.aptNm);
      kapt = m?.kaptCode ?? "";
      hhld.match[mk] = kapt;
    }
    if (!kapt) { unmatched.push(`${h.gu} ${h.umdNm} ${h.aptNm}`); continue; }

    if (!hhld.byKapt[kapt] && looked < lookupBudget) {
      try {
        const b = await fetchAptBasis(kapt, key);
        looked++;
        if (b) hhld.byKapt[kapt] = { name: b.kaptName, hhld: b.hhldCnt, addr: b.addr };
      } catch (e) {
        console.error(`⚠️ ${kapt} 기본정보 실패: ${e instanceof Error ? e.message : e}`);
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    const rec = hhld.byKapt[kapt];
    if (!rec) { unmatched.push(`${h.gu} ${h.umdNm} ${h.aptNm} (세대수 미확인)`); continue; }
    withHhld.push({ ...h, hhld: rec.hhld });
  }

  hhld.updatedAt = today;
  writeFileSync(hhldPath, JSON.stringify(hhld, null, 0) + "\n");

  const big = withHhld
    .filter((h) => h.hhld >= minHhld)
    .sort((a, b) => (b.gainPct ?? 0) - (a.gainPct ?? 0));

  // ── 산출물
  mkdirSync(R("data/datasets"), { recursive: true });
  writeFileSync(
    R("data/datasets/singo-latest.json"),
    JSON.stringify(
      {
        meta: {
          today,
          minHhld,
          months,
          regions: regions.length,
          judgedRegions: regions.length - skipped.length,
          skipped,
          verified: true,
          source: "국토교통부 아파트 매매 실거래가 상세자료 · 공동주택 기본 정보(세대수)",
          note:
            "단지+평형대(구·법정동·단지명 기준) 역대 최고가를 넘어선 중개거래만. 직거래 제외, 해제거래 제외.",
        },
        hits: big,
        belowThreshold: withHhld.filter((h) => h.hhld < minHhld).length,
        unmatched,
      },
      null,
      2,
    ) + "\n",
  );

  // 알림 문구 — 오너 요청: **단지명과 거래가격**. 평형대만 함께 적는다(그게 없으면
  // "무엇의 신고가"인지 확인할 수가 없어 오보 0 을 지킬 수 없다).
  const lines: string[] = [];
  if (big.length) {
    lines.push(`🔥 오늘의 신고가 ${big.length}건 (${today} · ${minHhld.toLocaleString("ko-KR")}세대 이상)`);
    lines.push("");
    for (const h of big.slice(0, topN)) {
      lines.push(`· ${h.aptNm} ${h.band} — ${manwonToKo(h.priceManwon)}`);
    }
    if (big.length > topN) lines.push(`… 외 ${big.length - topN}건`);
  }
  writeFileSync(R("data/singo-alert.txt"), lines.join("\n"));

  console.log(
    `신고가 후보 ${hits.length}건 → 세대수 확인 ${withHhld.length}건 → ${minHhld}세대 이상 ${big.length}건\n` +
      `수집 ${fetched}회 · 단지조회 ${looked}회 · 판정 제외 지역 ${skipped.length}곳 · 미매칭 ${unmatched.length}건`,
  );
  if (skipped.length) console.log(`  제외: ${skipped.slice(0, 10).join(", ")}${skipped.length > 10 ? " …" : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
