/**
 * 1000세대 이상 단지 명부(universe) 구축 CLI — 네트워크·키 필요 → GitHub Actions.
 *
 *   MOLIT_API_KEY=xxx tsx src/aptUniverseCli.ts --min-hhld 1000 --budget 6000
 *
 * ── 왜 명부를 먼저 만드나 (2026-08-12 오너)
 * "1000세대 이상 단지만 먼저 리스트업 해놓고 **그 안에서** 신고가 발생하는지만 트래킹하자."
 * 매일 아침 세대수를 그때그때 조회하면 (1) 조회가 실패한 날 알림이 통째로 비고
 * (2) 어떤 단지가 대상인지 아무도 미리 볼 수 없다. 명부를 파일로 굳혀 두면 둘 다 사라진다 —
 * **오늘 무엇을 보고 있는지 오너가 눈으로 확인할 수 있다.**
 *
 * ── 어떻게
 * ① 시군구별 공동주택 단지 목록 (61회)
 * ② 단지별 기본 정보에서 세대수 (단지 수만큼 — 수도권 1만 건대라 며칠 나눠 받는다)
 * `--budget` 만큼만 하고 멈춘다. 어디까지 했는지는 `apt-hhld.json` 이 안다(진실은 한 곳).
 * 다시 실행하면 이어서 하고, 다 끝나면 아무것도 안 하고 끝난다(멱등).
 *
 * ⚠️ 실거래(1613000/RTMSDataSvc…)와 **다른 서비스**라 트래픽 한도도 따로 센다.
 *    그래서 역대 최고가 수집과 같은 날 돌려도 서로 잡아먹지 않는다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchAptList, fetchAptBasis, chosenOps } from "./sources/aptInfo.js";
import type { AptListItem } from "./parse/aptInfo.js";
import { normAptName } from "./parse/singo.js";
import { singoRegions } from "./sources/singoRegions.js";

const CWD = process.env.INIT_CWD || process.cwd();
const R = (p: string) => resolve(CWD, p);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

interface HhldCache {
  updatedAt: string;
  note: string;
  /** 단지코드 → 세대수. 조회했는데 값이 없으면 0 으로 남겨 **매일 다시 두드리지 않는다** */
  byKapt: Record<string, { name: string; hhld: number; addr: string }>;
}

async function main() {
  const key = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_API_KEY;
  if (!key) {
    console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }
  const minHhld = Number(arg("min-hhld") ?? 1000);
  const budget = Number(arg("budget") ?? 6000);
  const listDir = R("data/datasets/apt-list");
  mkdirSync(listDir, { recursive: true });

  const hhldPath = R("data/datasets/apt-hhld.json");
  const hhld: HhldCache = existsSync(hhldPath)
    ? JSON.parse(readFileSync(hhldPath, "utf8"))
    : {
        updatedAt: "",
        note: "국토교통부 공동주택 기본 정보(getAphusBassInfoV3)의 세대수(kaptdaCnt). 코드가 받아 적는다. hhld=0 은 '조회했으나 값이 없음'.",
        byKapt: {},
      };

  const regions = singoRegions();
  let used = 0;
  const errors: string[] = [];

  // ── ① 시군구별 단지 목록
  for (const { gu, lawdCd } of regions) {
    if (used >= budget) break;
    const p = join(listDir, `${lawdCd}.json`);
    if (existsSync(p)) continue;
    try {
      const items = await fetchAptList(lawdCd, key);
      used++;
      writeFileSync(
        p,
        JSON.stringify({ meta: { lawdCd, gu, count: items.length, updatedAt: new Date().toISOString().slice(0, 10), source: "국토교통부 공동주택 단지 목록제공 서비스" }, items }, null, 0) + "\n",
      );
      console.log(`· 단지목록 ${gu} ${items.length}곳`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`목록 ${gu}: ${msg}`);
      if (/SERVICE_KEY|HTTP 40[13]|살아 있는 오퍼레이션이 없습니다/i.test(msg)) {
        console.error(`⛔ ${msg}\n   → 활용신청 여부 또는 서비스 URL(오퍼레이션 이름)을 확인하세요.`);
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  // ── ② 단지별 세대수
  for (const { gu, lawdCd } of regions) {
    if (used >= budget) break;
    const p = join(listDir, `${lawdCd}.json`);
    if (!existsSync(p)) continue;
    const items: AptListItem[] = JSON.parse(readFileSync(p, "utf8")).items;
    for (const it of items) {
      if (used >= budget) break;
      if (hhld.byKapt[it.kaptCode]) continue;
      try {
        const b = await fetchAptBasis(it.kaptCode, key);
        used++;
        hhld.byKapt[it.kaptCode] = b
          ? { name: b.kaptName, hhld: b.hhldCnt, addr: b.addr }
          : { name: it.kaptName, hhld: 0, addr: "" }; // 조회했으나 값 없음 — 다시 안 두드린다
      } catch (e) {
        used++;
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`세대수 ${gu} ${it.kaptName}: ${msg}`);
        if (/SERVICE_KEY|LIMITED_NUMBER|HTTP 40[13]/i.test(msg)) {
          console.error(`⛔ ${msg}\n   → '공동주택 기본 정보제공 서비스' 활용신청 또는 일일 한도를 확인하세요.`);
          used = budget;
          break;
        }
      }
      if (used % 200 === 0) writeFileSync(hhldPath, JSON.stringify(hhld, null, 0) + "\n"); // 중간 저장
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  hhld.updatedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(hhldPath, JSON.stringify(hhld, null, 0) + "\n");

  // ── ③ 명부 굳히기 — 지금까지 확인된 것으로 다시 쓴다(멱등)
  const universe: any[] = [];
  let known = 0;
  let total = 0;
  let listed = 0;
  for (const { gu, lawdCd } of regions) {
    const p = join(listDir, `${lawdCd}.json`);
    if (!existsSync(p)) continue;
    listed++;
    const items: AptListItem[] = JSON.parse(readFileSync(p, "utf8")).items;
    total += items.length;
    for (const it of items) {
      const rec = hhld.byKapt[it.kaptCode];
      if (!rec) continue;
      known++;
      if (rec.hhld < minHhld) continue;
      universe.push({
        lawdCd,
        gu,
        umd: it.umd,
        kaptCode: it.kaptCode,
        kaptName: it.kaptName,
        norm: normAptName(it.kaptName),
        hhld: rec.hhld,
      });
    }
  }
  universe.sort((a, b) => b.hhld - a.hhld);

  const complete = listed === regions.length && known === total;
  writeFileSync(
    R("data/datasets/apt-universe.json"),
    JSON.stringify(
      {
        meta: {
          minHhld,
          regions: regions.length,
          regionsListed: listed,
          aptTotal: total,
          aptChecked: known,
          count: universe.length,
          complete,
          updatedAt: hhld.updatedAt,
          verified: true,
          source: "국토교통부 공동주택 단지 목록제공 서비스 · 공동주택 기본 정보제공 서비스(세대수)",
          note: "신고가 트래킹 대상 명부. 세대수는 코드가 API 에서 받아 적는다.",
        },
        items: universe,
      },
      null,
      2,
    ) + "\n",
  );

  const ops = chosenOps();
  if (ops.list || ops.basis) console.log(`\n쓴 오퍼레이션 — 목록: ${ops.list || "(미정)"} · 기본정보: ${ops.basis || "(미정)"}`);
  console.log(
    `호출 ${used}회 · 목록 ${listed}/${regions.length}개 지역 · 세대수 확인 ${known}/${total}곳\n` +
      `→ ${minHhld.toLocaleString("ko-KR")}세대 이상 **${universe.length}개 단지** · ${complete ? "✅ 명부 완성" : "⏳ 이어서 진행 필요"}`,
  );
  if (universe.length) {
    console.log("\n세대수 상위 10:");
    for (const u of universe.slice(0, 10)) console.log(`  · ${u.gu} ${u.umd} ${u.kaptName} — ${u.hhld.toLocaleString("ko-KR")}세대`);
  }
  if (errors.length) {
    console.log(`\n실패 ${errors.length}건 (다음 실행에서 다시 시도):`);
    for (const e of errors.slice(0, 15)) console.log(`  · ${e}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
