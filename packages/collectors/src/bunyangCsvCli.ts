/**
 * 청약홈 **CSV 두 장**을 읽어 데이터셋으로 접는다 (키·승인·네트워크 불필요).
 *
 *   tsx src/bunyangCsvCli.ts [--notice data/raw/bunyang-notice.csv]
 *                            [--price  data/raw/bunyang-price.csv]
 *                            [--out data/datasets]
 *
 * 두 장은 **한 쌍**이다. 포털이 그렇게 안내한다 — `주택관리번호` 로 잇는다.
 *   · 15101046 「APT 분양정보」      → 주택명 · 공급위치 · **입주예정월** · 시공사
 *   · 15101047 「APT 주택형별 분양정보」 → 주택형 · 공급면적 · **분양최고금액(만원)**
 *
 * 한 장만 있어도 돈다. 없는 쪽은 없는 대로 두고, 무엇이 없는지 보고한다 —
 * 반쪽짜리를 온전한 것처럼 내보내지 않는다.
 *
 * 왜 API 가 아닌가: 원천이 파일데이터고 **연 1회** 갱신된다(2026-08-28 오너 지적).
 * 1년에 한 번 바뀌는 파일에 키·승인·재시도·알림이 달린 배관을 붙이면 고장날 자리만 는다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseCsv, decodeKoreanCsv, parseTypePrices, rowKeys } from "./parse/bunyangPrice.js";
import { parseBunyangNotices, movingInSince } from "./parse/bunyangNotice.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function readCsv(rel: string): { rows: Record<string, string>[]; encoding: string } | null {
  const p = resolve(CWD, rel);
  if (!existsSync(p)) return null;
  const { text, encoding } = decodeKoreanCsv(readFileSync(p));
  return { rows: parseCsv(text), encoding };
}

function main() {
  const noticeRel = arg("notice") ?? "data/raw/bunyang-notice.csv";
  const priceRel = arg("price") ?? "data/raw/bunyang-price.csv";
  const outDir = resolve(CWD, arg("out") ?? "data/datasets");
  const probePath = resolve(CWD, arg("probe") ?? "data/bunyang-csv-probe.md");
  mkdirSync(outDir, { recursive: true });

  const noticeCsv = readCsv(noticeRel);
  const priceCsv = readCsv(priceRel);

  if (!noticeCsv && !priceCsv) {
    console.error("❌ CSV 가 한 장도 없습니다.");
    console.error(`   공고:   ${noticeRel}  ← https://www.data.go.kr/data/15101046/fileData.do`);
    console.error(`   분양가: ${priceRel}   ← https://www.data.go.kr/data/15101047/fileData.do`);
    console.error("   둘 다 파일데이터 탭에서 로그인 없이 내려받습니다.");
    process.exit(1);
  }

  const report: string[] = ["# 청약홈 CSV — 읽기 보고", "", `- 실행: ${new Date().toISOString().slice(0, 10)}`, ""];

  /* ── ① 공고 (뼈대) ─────────────────────────────────── */
  const notices = noticeCsv ? parseBunyangNotices(noticeCsv.rows) : [];
  if (noticeCsv) {
    const verdict = notices.length === 0
      ? "🔴 한 행도 못 읽었다 — 컬럼 이름이 틀렸다"
      : notices.length < noticeCsv.rows.length * 0.9
        ? `🟠 ${noticeCsv.rows.length}행 중 ${notices.length}행만`
        : "🟢 컬럼을 읽고 있다";
    const since27 = movingInSince(notices, "2027-01");
    report.push(
      `## 공고 (15101046) — \`${noticeRel}\``,
      "",
      `- 인코딩 **${noticeCsv.encoding}** · ${noticeCsv.rows.length.toLocaleString()}행 → ${notices.length.toLocaleString()}건`,
      `- **2027년 이후 입주: ${since27.length.toLocaleString()}건**`,
      `- 판정: ${verdict}`,
      "",
      "```", rowKeys(noticeCsv.rows).join(" · "), "```", "",
    );
    console.log(`📄 공고 — ${noticeCsv.encoding} · ${notices.length}건 (2027년 이후 입주 ${since27.length}건) · ${verdict}`);
  } else {
    report.push(`## 공고 (15101046) — ⚪ 없음 (\`${noticeRel}\`)`, "");
    console.log("⚪ 공고 CSV 없음");
  }

  /* ── ② 주택형별 분양가 ─────────────────────────────── */
  const types = priceCsv ? parseTypePrices(priceCsv.rows) : [];
  if (priceCsv) {
    const verdict = types.length === 0
      ? "🔴 한 행도 못 읽었다 — 컬럼 이름이 틀렸다"
      : types.length < priceCsv.rows.length * 0.9
        ? `🟠 ${priceCsv.rows.length}행 중 ${types.length}행만`
        : "🟢 컬럼을 읽고 있다";
    report.push(
      `## 주택형별 분양가 (15101047) — \`${priceRel}\``,
      "",
      `- 인코딩 **${priceCsv.encoding}** · ${priceCsv.rows.length.toLocaleString()}행 → ${types.length.toLocaleString()}건`,
      `- 판정: ${verdict}`,
      "",
      "```", rowKeys(priceCsv.rows).join(" · "), "```", "",
    );
    console.log(`💰 분양가 — ${priceCsv.encoding} · ${types.length}건 · ${verdict}`);
  } else {
    report.push(
      `## 주택형별 분양가 (15101047) — ⚪ **없음** (\`${priceRel}\`)`,
      "",
      "> 이게 없으면 **프리미엄을 못 만든다.** 프리미엄 = 분양권 실거래가 − 같은 타입 분양가.",
      "> 공고 CSV 만으로는 「분양권이 얼마에 팔렸나」까지다.",
      "",
    );
    console.log("⚪ 분양가 CSV 없음 — 프리미엄은 못 만든다(실거래가까지만)");
  }

  /* ── ③ 두 장을 잇는다 ──────────────────────────────── */
  const byNotice: Record<string, ReturnType<typeof parseTypePrices>> = {};
  for (const t of types) {
    const k = t.houseManageNo || t.pblancNo;
    if (k) (byNotice[k] ??= []).push(t);
  }
  const linked = notices.filter((n) => byNotice[n.houseManageNo]?.length).length;
  if (noticeCsv && priceCsv) {
    report.push(
      "## 두 장을 이었나",
      "",
      `- 공고 ${notices.length.toLocaleString()}건 중 **${linked.toLocaleString()}건**에 주택형별 분양가가 붙었다`,
      "",
    );
    console.log(`🔗 공고 ${notices.length}건 중 ${linked}건에 분양가가 붙었다`);
  }

  writeFileSync(probePath, report.join("\n"));
  console.log(`🔎 읽기 보고 → ${probePath}`);

  writeFileSync(
    join(outDir, "bunyang-notices.json"),
    JSON.stringify(
      {
        _: [
          "공공데이터포털 CSV 에서 코드가 그대로 읽은 것 — 손으로 넣은 값 0개.",
          "원본 CSV 는 data/raw/ 에 그대로 있다(언제든 대조 가능).",
          "분양가는 **분양최고금액**(그 타입에서 가장 비싼 층)이다. 프리미엄을 여기서 빼면",
          "실제보다 작게 나온다 — 하한이다. 카드에는 그 사실을 적는다.",
        ],
        meta: {
          name: "청약홈 APT 분양정보 + 주택형별 분양가",
          verified: true,
          source: "한국부동산원 청약홈 (공공데이터포털 15101046 · 15101047 · 파일데이터 CSV)",
          sourceUrl: "https://www.data.go.kr/data/15101046/fileData.do",
          collectedAt: new Date().toISOString().slice(0, 10),
          notices: notices.length,
          types: types.length,
          noticesWithPrice: linked,
          unit: { price: "만원(분양최고금액)", area: "㎡", supply: "가구" },
          note: "연 1회 갱신(마지막 2025-11-28 · 차기 2026-11-28). 2026년 공고는 여기 없다 — 최신 공고는 입주자모집공고문 대조가 정본이다.",
        },
        notices,
        priceByNotice: byNotice,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`✅ → ${join(outDir, "bunyang-notices.json")}`);

  if (notices.length === 0 && types.length === 0) process.exit(1);
}

main();
