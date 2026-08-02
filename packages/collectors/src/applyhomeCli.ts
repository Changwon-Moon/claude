/**
 * 청약홈 신규 분양·무순위 수집 CLI — Actions 에서 매일 한 번 돈다.
 *   DATA_GO_KR_API_KEY=xxx tsx src/applyhomeCli.ts [--today 2026-08-01] [--within 7] [--out dir]
 *
 * 산출: data/datasets/applyhome-latest.json (오늘 잡힌 것, 점수순)
 *       data/datasets/applyhome/{YYYY-MM-DD}.json (그날의 스냅숏 — 되짚어 볼 수 있게)
 *
 * ── 키가 없으면 **실패한다**(조용히 건너뛰지 않는다)
 * 2026-07-31 에 이 회사는 "키가 없으면 스크립트가 조용히 넘어가 몇 주간 아무도 몰랐던" 사고를
 * 겪었다. 매일 도는 수집기가 조용히 아무것도 안 하면 그건 없는 것과 같다.
 * 그래서 키가 없으면 exit 1 로 워크플로를 빨갛게 만든다.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchNotices, OPERATIONS } from "./sources/applyhome.js";
import { normalize, recent, dedupe, rank, type Kind, type Notice } from "./parse/applyhome.js";
import { APPLYHOME_APT_JSON, APPLYHOME_REMNDR_JSON } from "./__fixtures__/fixtures.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/* --dry — 네트워크 없이 표본 응답으로 배관 전체를 돌려 본다.
 * 작업 세션은 외부망이 막혀 있어 실제 호출을 못 하는데, 그렇다고 "돌려보지도 않고" 워크플로에
 * 올리면 첫 실행이 곧 첫 시험이 된다. 수집 이후 단계(정규화→점수→소재 등록→알림 문구)는
 * 여기서 다 확인할 수 있다. **키가 맞는지·필드 이름이 맞는지는 확인되지 않는다** — 그건 실제 실행뿐이다. */
const DRY = process.argv.includes("--dry");

async function main() {
  const key = process.env.DATA_GO_KR_API_KEY;
  if (!key && !DRY) {
    console.error("❌ DATA_GO_KR_API_KEY 가 없습니다.");
    console.error("   공공데이터포털에서 '한국부동산원_청약홈 분양정보 조회 서비스' 활용신청 후");
    console.error("   GitHub Secrets 에 DATA_GO_KR_API_KEY 로 등록하세요(이름이 한 글자만 달라도 안 읽힙니다).");
    process.exit(1);
  }

  /* 오늘 날짜는 **인자로 받는다.** 렌더 결정성 원칙과 같은 이유이고,
     워크플로가 KST 기준 날짜를 넘겨 주므로 UTC 러너에서 하루가 밀리지 않는다. */
  const today = arg("today") ?? new Date().toISOString().slice(0, 10);
  const within = Number(arg("within") ?? 7);
  const outDir = resolve(CWD, arg("out") ?? "data/datasets");

  const all: Notice[] = [];
  const stat: Record<string, number> = {};
  for (const kind of Object.keys(OPERATIONS) as Kind[]) {
    const raw = DRY
      ? JSON.parse(kind === "apt" ? APPLYHOME_APT_JSON : APPLYHOME_REMNDR_JSON).data
      : await fetchNotices(kind, key!);
    const list = normalize({ data: raw }, kind);
    stat[OPERATIONS[kind].label] = list.length;
    all.push(...list);
    console.log(`· ${OPERATIONS[kind].label} — 전체 ${list.length}건`);
  }

  const picked = rank(dedupe(recent(all, today, within)), today);

  mkdirSync(join(outDir, "applyhome"), { recursive: true });
  const doc = {
    _: [
      "청약홈 공공데이터에서 코드가 그대로 받아 적은 것 — 손으로 넣은 값 0개.",
      "score/reasons 는 packages/collectors/src/parse/applyhome.ts 의 규칙이 계산한 것이다.",
      "meta.verified 는 true 다 — 1차 출처(한국부동산원 청약홈)에서 직접 받았기 때문이다.",
      "다만 '조감도·시공사 브랜드·분양가' 같이 이 API 에 없는 항목은 여기 없다. 없는 것은 없는 대로 둔다.",
    ],
    meta: {
      name: "청약홈 신규 분양·무순위 공고",
      verified: true,
      source: "한국부동산원 청약홈 분양정보 조회 서비스 (공공데이터포털 15098547)",
      sourceUrl: "https://www.data.go.kr/data/15098547/openapi.do",
      collectedFor: today,
      withinDays: within,
      totals: stat,
      unit: { supply: "가구" },
    },
    notices: picked,
  };

  writeFileSync(join(outDir, "applyhome-latest.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");
  writeFileSync(join(outDir, "applyhome", `${today}.json`), JSON.stringify(doc, null, 2) + "\n", "utf8");

  if (DRY) console.log("\n⚠️  --dry 모드 — 표본 응답입니다. 실제 청약홈 데이터가 아닙니다.");
  console.log(`\n✅ ${today} 기준 최근 ${within}일 이내·접수중 ${picked.length}건`);
  for (const p of picked.slice(0, 8)) {
    const tail = p.receiptTo ? ` ~${p.receiptTo}` : "";
    console.log(`   ${String(p.score).padStart(3)}점  [${p.kind === "remndr" ? "줍줍" : "신규"}] ${p.name} (${p.areaName})${tail}  ${p.reasons.join("·")}`);
  }
  if (!picked.length) console.log("   (오늘 새로 뜬 공고 없음 — 이것도 사실이다. 빈 결과와 실패는 다르다)");
}

main().catch((e) => {
  console.error(`❌ 수집 실패: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
