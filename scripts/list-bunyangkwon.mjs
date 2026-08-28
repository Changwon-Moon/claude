#!/usr/bin/env node
/**
 * 준공 전(=분양권이 거래되는) 단지 목록을 **코드가** 뽑는다.
 *
 *   node scripts/list-bunyangkwon.mjs [--region 서울,경기] [--min 500] [--since 2026-09] [--json out.json]
 *
 * 왜 스크립트인가: 목록을 사람이 추리면 그게 곧 2026-08-28 에 반려한 그 커뮤니티 캡처와
 * 같아진다(번호가 빠지고 단위가 섞이고 기준이 없는 것). 기준을 인자로 못박고 코드가 거른다.
 *
 * 원천: `data/datasets/bunyang-notices.json`
 *   ← 청약홈 CSV 두 장(공공데이터포털 15101046 · 15101047), 원본은 `data/raw/` 에 그대로 있다.
 *
 * ⚠️ **`공급규모`는 단지 총세대수가 아니다 — 그 공고로 분양한 세대수다.**
 * 재개발·재건축은 조합원분이 빠져 훨씬 작게 나온다. 마포자이힐스테이트 라첼스는
 * 총 1,100세대급인데 여기서는 **463**이다. "500세대 이상"을 이 칸으로 자르면
 * 정비사업 단지가 통째로 잘려 나간다. 그래서 표에 `정비` 칸을 같이 세우고,
 * 컷 근처에서 걸러진 정비사업 단지를 **따로 보여 준다** — 조용히 사라지지 않게.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const DS = join(ROOT, "data/datasets/bunyang-notices.json");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

if (!existsSync(DS)) {
  console.error(`❌ ${DS} 가 없습니다.`);
  console.error("   먼저: pnpm --filter @wirit/collectors read-bunyang-csv");
  process.exit(1);
}

const regions = arg("region", "서울,경기").split(",").map((s) => s.trim());
const min = Number(arg("min", "500"));
// 기본 하한은 '이번 달 다음' — 이미 입주한 단지는 분양권이 아니라 매매다.
const now = new Date();
const defaultSince = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 2).padStart(2, "0")}`;
const since = arg("since", defaultSince);

const ds = JSON.parse(readFileSync(DS, "utf8"));
const all = ds.notices;

/* 보유한 분양권 실거래 — 어느 단지에 실제 거래가 잡혔는지 표시하려는 것.
   "데이터가 있다"와 "카드로 쓸 수 있다"는 다르다. */
const silvDir = join(ROOT, "data/datasets/silv");
const dealt = new Map();
if (existsSync(silvDir)) {
  for (const f of readdirSync(silvDir)) {
    for (const t of JSON.parse(readFileSync(join(silvDir, f), "utf8")).trades) {
      if (t.canceled) continue;
      const k = t.aptNm.replace(/[\s()（）·・,]/g, "");
      dealt.set(k, (dealt.get(k) ?? 0) + 1);
    }
  }
}
const norm = (s) => s.replace(/[\s()（）·・,]/g, "");

const preCompletion = all.filter(
  (n) => regions.includes(n.areaName) && n.moveInYm && n.moveInYm >= since,
);
const hit = preCompletion.filter((n) => n.supply >= min).sort((a, b) => b.supply - a.supply);

/* 컷 바로 아래에서 걸린 정비사업 단지 — 총세대수로는 컷을 넘었을 수 있다.
   조용히 버리면 "왜 그 단지가 없냐"는 질문에 답할 수 없다. */
const nearMiss = preCompletion
  .filter((n) => n.supply < min && n.supply >= min * 0.5 && n.redevelopment === true)
  .sort((a, b) => b.supply - a.supply);

const fmt = (n) => n.toLocaleString("ko-KR");
console.log(`\n# 준공 전 분양권 단지 — ${regions.join("·")} · 공급 ${fmt(min)}세대 이상 · 입주 ${since} 이후\n`);
console.log(`원천: 청약홈 공공데이터(15101046·15101047) · 기준일 ${ds.meta.collectedAt}`);
console.log(`전체 ${fmt(all.length)}건 → ${regions.join("·")} 준공 전 ${fmt(preCompletion.length)}건 → 컷 통과 **${fmt(hit.length)}건**\n`);

console.log("| # | 단지 | 지역 | 공급 | 입주예정 | 정비 | 상한제 | 분양권 실거래 |");
console.log("|---|---|---|---|---|---|---|---|");
hit.forEach((n, i) => {
  const d = dealt.get(norm(n.name)) ?? 0;
  console.log(
    `| ${i + 1} | ${n.name} | ${n.areaName} | ${fmt(n.supply)} | ${n.moveInYm} | ` +
      `${n.redevelopment === true ? "○" : n.redevelopment === null ? "?" : ""} | ` +
      `${n.priceCap === true ? "○" : n.priceCap === null ? "?" : ""} | ${d ? `${d}건` : "—"} |`,
  );
});

if (nearMiss.length) {
  console.log(`\n## ⚠️ 컷 아래지만 버리기 전에 볼 것 — 정비사업 ${nearMiss.length}건\n`);
  console.log("`공급규모`는 그 공고로 분양한 세대수다. 정비사업은 조합원분이 빠져 작게 나온다 —");
  console.log("아래 단지들은 **총세대수로는 컷을 넘을 수 있다**. 컷을 총세대수로 걸려면 다른 원자료가 필요하다.\n");
  console.log("| 단지 | 지역 | 공급 | 입주예정 |");
  console.log("|---|---|---|---|");
  for (const n of nearMiss) console.log(`| ${n.name} | ${n.areaName} | ${fmt(n.supply)} | ${n.moveInYm} |`);
}

const withDeal = hit.filter((n) => dealt.get(norm(n.name))).length;
console.log(`\n분양권 실거래가 잡힌 단지: ${withDeal} / ${hit.length}`);
console.log("(전 지역 수집이 아직 도는 중이라 이 숫자는 늘어납니다)");

const jsonPath = arg("json", null);
if (jsonPath) {
  writeFileSync(
    resolve(ROOT, jsonPath),
    JSON.stringify(
      {
        _: "코드가 거른 것 — 손으로 고른 단지 0개. 기준은 아래 criteria 에 그대로 있다.",
        criteria: { regions, minSupply: min, moveInSince: since },
        source: ds.meta,
        caveat: "공급규모는 단지 총세대수가 아니라 그 공고로 분양한 세대수다. 정비사업은 조합원분이 빠진다.",
        items: hit,
        nearMissRedevelopment: nearMiss,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`\n→ ${jsonPath}`);
}
