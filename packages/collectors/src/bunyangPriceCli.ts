/**
 * 청약홈 **APT 주택형별 분양가** — CSV 를 읽어 데이터셋으로 접는다.
 *   tsx src/bunyangPriceCli.ts --csv data/raw/bunyang-price.csv [--out data/datasets]
 *
 * 산출: data/datasets/bunyang-price-by-type.json — 공고별·주택형별 분양최고금액(만원)
 *
 * ── 왜 API 가 아니라 CSV 인가 (2026-08-28 오너 지적으로 갈아탐)
 * 15101047 은 **파일데이터(CSV)** 로 등록된 데이터셋이다. 포털이 파일데이터를 오픈API 로
 * 자동변환해 주기는 하지만 승인이 따로고 실제로 401 이 났다. 그런데 이 파일은 **연 1회**
 * 갱신된다(마지막 2025-11-28 · 차기 2026-11-28). 1년에 한 번 바뀌는 정지된 파일에
 * 키·승인·재시도·실패알림이 달린 배관을 붙이는 것은 과하다 — 고장날 자리만 늘린다.
 *
 * 그래서 **CSV 를 저장소에 두고 코드가 읽는다.** 키도 승인도 네트워크도 필요 없고,
 * 세션에서 바로 돌려 결과를 눈으로 확인할 수 있다. 오보 0 은 그대로다 —
 * 1차 출처 파일에서 코드가 뽑고, 원본은 `data/raw/` 에 그대로 남아 언제든 대조된다.
 *
 * 갱신은 1년에 한 번. 오너가 새 CSV 를 같은 자리에 두고 이 명령을 다시 돌리면 된다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseCsv, decodeKoreanCsv, parseTypePrices, rowKeys } from "./parse/bunyangPrice.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function main() {
  const rel = arg("csv") ?? "data/raw/bunyang-price.csv";
  const csvPath = resolve(CWD, rel);
  const outDir = resolve(CWD, arg("out") ?? "data/datasets");
  const probePath = resolve(CWD, arg("probe") ?? "data/bunyang-price-probe.md");

  if (!existsSync(csvPath)) {
    console.error(`❌ CSV 가 없습니다: ${csvPath}`);
    console.error("   공공데이터포털에서 내려받아 그 자리에 두세요 (로그인 불필요):");
    console.error("   https://www.data.go.kr/data/15101047/fileData.do → 파일데이터 탭 → 다운로드");
    process.exit(1);
  }

  const { text, encoding } = decodeKoreanCsv(readFileSync(csvPath));
  const rows = parseCsv(text);
  const types = parseTypePrices(rows);
  const keys = rowKeys(rows);

  const verdict = rows.length === 0
    ? "🔴 행이 하나도 안 읽혔다 — CSV 가 비었거나 구분자가 다르다"
    : types.length === 0
      ? "🔴 한 행도 못 읽었다 — 컬럼 이름이 틀렸다. 아래 목록에서 실제 이름을 찾아 parse/bunyangPrice.ts 의 후보에 넣을 것"
      : types.length < rows.length * 0.9
        ? `🟠 ${rows.length}행 중 ${types.length}행만 읽혔다 — 일부 행의 컬럼이 다르거나 금액이 비어 있다`
        : "🟢 컬럼을 읽고 있다";

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    probePath,
    [
      "# 청약홈 주택형별 분양가 — 읽기 보고",
      "",
      `- 원본: \`${rel}\` (인코딩 **${encoding}**)`,
      `- 읽은 행: ${rows.length.toLocaleString()} · 파싱된 타입: ${types.length.toLocaleString()}`,
      `- 판정: ${verdict}`,
      "",
      "> 이 파일이 있는 이유: 컬럼 이름은 유추다(포털 항목표에 영문명 칸이 비어 있다).",
      "> 분양권 수집기에서 `dealTypeNm` 유추가 한 번 틀렸고, 그때 파서는 조용히 빈 값을",
      "> 채우며 '성공'했다. 같은 자리를 반복하지 않으려고 무엇을 읽었는지 남긴다.",
      "",
      "## CSV 컬럼 이름 전부",
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
    ].join("\n"),
  );
  console.log(`🔎 읽기 보고 → ${probePath}`);
  console.log(`   인코딩 ${encoding} · ${rows.length.toLocaleString()}행 → 타입 ${types.length.toLocaleString()}건`);
  console.log(`   판정: ${verdict}`);

  // 공고번호별로 접는다 — 카드가 묻는 단위가 "이 공고의 이 타입"이라서다.
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
          "공공데이터포털 CSV 에서 코드가 그대로 읽은 것 — 손으로 넣은 값 0개.",
          "원본 CSV 는 data/raw/ 에 그대로 있다(언제든 대조 가능).",
          "금액은 **분양최고금액**(그 타입에서 가장 비싼 층)이다. 프리미엄을 여기서 빼면",
          "실제보다 작게 나온다 — 하한이다. 카드에는 그 사실을 적는다.",
        ],
        meta: {
          name: "청약홈 APT 주택형별 분양가",
          verified: true,
          source: "한국부동산원 청약홈 APT 주택형별 분양정보 (공공데이터포털 15101047 · 파일데이터 CSV)",
          sourceUrl: "https://www.data.go.kr/data/15101047/fileData.do",
          collectedAt: new Date().toISOString().slice(0, 10),
          rows: rows.length,
          parsed: types.length,
          notices: Object.keys(byNotice).length,
          encoding,
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

  if (types.length === 0) process.exit(1);
}

main();
