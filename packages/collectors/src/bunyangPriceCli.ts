/**
 * 청약홈 **APT 주택형별 분양가** 수집 CLI (Actions 전용 — 네트워크·키 필요).
 *   DATA_GO_KR_API_KEY=xxx tsx src/bunyangPriceCli.ts [--out data/datasets] [--probe data/bunyang-price-probe.md]
 *
 * 산출: data/datasets/bunyang-price-by-type.json — 공고번호·주택형별 분양최고금액(만원)
 *
 * 이게 있어야 **프리미엄을 코드가 뺄 수 있다**:
 *   프리미엄 = 분양권 실거래가(국토부) − 같은 타입 분양가(여기)
 * 둘 중 하나라도 사람이 옮겨 적으면 오보 0 이 깨진다.
 *
 * ⚠️ 컬럼 이름은 유추다. 첫 수집이 **원본 한 행과 키 목록**을 probe 에 남긴다 —
 *    분양권 수집기에서 `dealTypeNm` 유추가 틀렸던 그 자리를 반복하지 않으려는 것이다.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchDataset, DATASETS } from "./sources/bunyangPrice.js";
import { parseTypePrices, rowKeys } from "./parse/bunyangPrice.js";
import { inspectKey, describeKey } from "./keyHygiene.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const kr = inspectKey(process.env.DATA_GO_KR_API_KEY);
  const key = kr.key;
  if (key) console.log(describeKey("DATA_GO_KR_API_KEY", kr));
  if (!key) {
    console.error("❌ DATA_GO_KR_API_KEY 가 없습니다 (GitHub Secrets).");
    process.exit(1);
  }

  const outDir = resolve(CWD, arg("out") ?? "data/datasets");
  const probePath = resolve(CWD, arg("probe") ?? "data/bunyang-price-probe.md");
  mkdirSync(outDir, { recursive: true });

  const lines: string[] = [
    "# 청약홈 주택형별 분양가 — 수집 보고",
    "",
    `- 실행: ${new Date().toISOString().slice(0, 10)}`,
    `- 데이터셋: ${DATASETS.price.label} (data.go.kr ${DATASETS.price.id})`,
    "",
  ];

  let rows: Record<string, unknown>[] = [];
  let totalCount = 0;
  try {
    const got = await fetchDataset("price", key);
    rows = got.rows;
    totalCount = got.totalCount;
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    console.error(`❌ ${reason}`);
    lines.push("## 실패", "", "```", reason, "```", "");
    writeFileSync(probePath, lines.join("\n"));
    process.exit(1);
  }

  const types = parseTypePrices(rows);
  const keys = rowKeys(rows);

  // ── 컬럼 이름이 맞았는지 스스로 판정한다
  const verdict = rows.length === 0
    ? "⚪ 행이 없다 — 판정 불가"
    : types.length === 0
      ? "🔴 한 행도 못 읽었다 — 컬럼 이름이 틀렸다. 아래 키 목록에서 실제 이름을 찾아 parse/bunyangPrice.ts 의 후보에 넣을 것"
      : types.length < rows.length * 0.9
        ? `🟠 ${rows.length}행 중 ${types.length}행만 읽혔다 — 일부 컬럼이 다르다`
        : "🟢 컬럼을 읽고 있다";

  lines.push(
    `- 받은 행: ${rows.length.toLocaleString()} / 전체 ${totalCount.toLocaleString()}`,
    `- 파싱된 타입: ${types.length.toLocaleString()}`,
    `- 판정: ${verdict}`,
    "",
    "## 응답에 있던 키 이름 전부",
    "",
    "```",
    keys.join(" · ") || "(행 없음)",
    "```",
    "",
    "## 원본 한 행",
    "",
    "```json",
    rows.length ? JSON.stringify(rows[0], null, 1) : "(행 없음)",
    "```",
    "",
  );
  writeFileSync(probePath, lines.join("\n"));
  console.log(`🔎 수집 보고 → ${probePath}`);
  console.log(`   판정: ${verdict}`);

  // 공고번호별로 접어 둔다 — 카드가 묻는 단위가 "이 공고의 이 타입"이라서다.
  const byNotice: Record<string, typeof types> = {};
  for (const t of types) {
    const k = t.houseManageNo || t.pblancNo;
    if (!k) continue;
    (byNotice[k] ??= []).push(t);
  }

  writeFileSync(
    join(outDir, "bunyang-price-by-type.json"),
    JSON.stringify(
      {
        _: [
          "청약홈 공공데이터에서 코드가 그대로 받아 적은 것 — 손으로 넣은 값 0개.",
          "금액은 **분양최고금액**(그 타입에서 가장 비싼 층)이다. 프리미엄을 여기서 빼면",
          "실제보다 작게 나온다 — 하한이다. 카드에는 그 사실을 적는다.",
        ],
        meta: {
          name: "청약홈 APT 주택형별 분양가",
          verified: true,
          source: `한국부동산원 청약홈 APT 주택형별 분양정보 (공공데이터포털 ${DATASETS.price.id})`,
          sourceUrl: `https://www.data.go.kr/data/${DATASETS.price.id}/fileData.do`,
          collectedAt: new Date().toISOString().slice(0, 10),
          totalCount,
          parsed: types.length,
          notices: Object.keys(byNotice).length,
          unit: { price: "만원(분양최고금액)", area: "㎡" },
          note: "연 1회 갱신(마지막 2025-11-28 · 차기 2026-11-28). 2026년 공고의 분양가는 여기 없다 — 최신 공고는 입주자모집공고문 대조가 정본이다.",
        },
        byNotice,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`✅ 공고 ${Object.keys(byNotice).length}건 · 타입 ${types.length}건 → bunyang-price-by-type.json`);

  if (types.length === 0 && rows.length > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
