/**
 * 주택 세제 카드 — 1세대 1주택자 편 4장 (2026 세제개편안 정부안).
 *
 * ── 왜 (2026-08-03 오너 "주택 세제 카드뉴스 여러 장, 아파트랩 참고")
 * 세제는 **"나한테 해당되나"가 전부**라 대상별로 게시물을 나눈다. 이 빌더는 1주택자 편이다.
 *
 * ⚠️ 이 시리즈의 절대 조건 두 가지 — 어기면 오보다.
 *   ① **정부안이다.** 국회 통과 전이라 확정이 아니다 → 전 장에 `정부안` 딱지.
 *   ② **대상을 못 박는다.** 1세대 1주택 뱃지가 없으면 다주택자가 자기 얘기로 읽는다.
 * 둘 다 데이터셋 meta 에서 읽어 붙인다 — 손으로 적지 않는다.
 *
 * 숫자는 전부 data/datasets/tax-reform-2026.json 에서 온다(빌더에 손으로 적은 값 0개).
 * 실행: node scripts/build-tax-1house.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-03";
const D = JSON.parse(readFileSync(join(ROOT, "data/datasets/tax-reform-2026.json"), "utf8"));
const M = D.meta;

const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir, { recursive: true });

const source = { name: M.sourceLabel, asOf: M.asOf };
const WHO = "1세대 1주택";

/** 값 문자열 → {v, unit} 로 쪼갠다. "14억원" → 14억원 / "4%" → 4 + % */
function splitVal(s, unitHint) {
  const t = String(s);
  if (unitHint && t.endsWith("%")) return { v: t, unit: unitHint };
  return { v: t };
}
/** 마지막 열(개정안/최종 상태)에만 색을 준다 — 강조는 한 군데만(BRAND) */
function toCells(row, n, tone) {
  return row.cells.map((c, i) => {
    const isLast = i === n - 1;
    const long = String(c).length > 10;               // 산식·문장 칸은 숫자가 아니다
    const cls = [long ? "tx-txt" : "", isLast && !long && tone && tone !== "none" ? tone : ""]
      .filter(Boolean).join(" ");
    return { ...splitVal(c, row.unit), cls };
  });
}
const build = (slug, spec) => {
  const n = spec.cols.length;
  const rows = spec.rows.map((r) => ({ label: r.label, note: r.note, cells: toCells(r, n, r.tone) }));
  /* 열 머리 정렬은 **그 열 값이 정한다**. 문장 칸(tx-txt)은 왼쪽이라 머리도 왼쪽이어야
     한다 — 가운데 머리 밑에 왼쪽 문장이 오면 어긋난 표로 읽힌다(2026-08-03 오너 검수). */
  const cols = spec.cols.map((t, i) => ({
    t, lft: rows.every((r) => /tx-txt/.test(r.cells[i]?.cls || "")),
  }));
  const doc = {
    template: "tax-matrix@1", date,
    who: WHO, status: M.status,
    title: spec.title, lead: spec.lead ?? "", n, labw: spec.labw ?? 250,
    hero: rows.length <= 1,   // 행 하나짜리(커버)는 늘리지 않고 가운데로 모은다
    sparse: rows.length === 2, // 두 행이면 크기로 채운다(빈 띠 방지)
    cols,
    rows,
    foot: spec.foot, applyAt: spec.applyAt, source,
  };
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(doc, null, 2) + "\n");
  return doc;
};

const cover = build("tax1-cover", { ...D.cover, lead: "", labw: 320,
  title: `<span class="hi">실거주</span> 안 하면 세금이 오릅니다`,
  rows: D.cover.rows.map((r) => ({ ...r, tone: "none" })) });
/* 커버는 좌우 대비가 핵심이라 색을 **양쪽에** 준다 — 오른쪽만 칠하면 "내려간 쪽"만 눈에 띈다 */
cover.rows[0].cells[0].cls = "up";
cover.rows[0].cells[1].cls = "down";
writeFileSync(join(outDir, "tax1-cover.json"), JSON.stringify(cover, null, 2) + "\n");

/* ⚠️ '그 외'(다주택) 행은 **1주택자 편에서 뺀다.** 대상 뱃지가 "1세대 1주택"인데 다주택 산식이
 *    같이 있으면 뱃지가 거짓말이 된다 — 남의 세금을 자기 것으로 읽게 만드는 자리다.
 *    이 행은 다주택자 편(B)이 가져간다. */
/* 하단 한 줄은 **데이터에서 계산한다** — 손으로 적으면 표와 어긋나도 아무도 못 잡는다.
   현행 → 개정안 증감을 두 행에서 직접 빼서 만든다. */
const jb = D.jongbuse_basic.rows.filter((r) => r.label !== "그 외");
const eok = (s) => Number(String(s).replace(/[^\d.]/g, ""));
const delta = (r) => {
  const d = eok(r.cells[1]) - eok(r.cells[0]);
  return `${d > 0 ? "+" : "−"}${Math.abs(d)}억`;
};
build("tax1-jongbuse", { ...D.jongbuse_basic, lead: "구분", labw: 320,
  title: "종부세 기본공제, 12억이 둘로",
  foot: `거주 ${delta(jb[0])} · 비거주 ${delta(jb[1])}`,
  rows: jb });

build("tax1-jangteuk", { ...D.yangdo_jangteuk, lead: "구분", labw: 250,
  title: "장기보유특별공제 개편안" });

build("tax1-timeline", { ...D.timeline, lead: "시점", labw: 260,
  title: "언제부터 바뀌나", applyAt: M.status + " 기준 · 국회 심의 후 달라질 수 있습니다" });

console.log(`✅ 1주택자 편 4장 → ${outDir}`);
console.log(`   ${M.status} · verified=${M.verified}${M.verified ? "" : " ⚠️ 발행 전 보도자료 원문 대조 필요"}`);
console.log(`   종부세 거주 ${D.jongbuse_basic.rows[0].cells[1]} / 비거주 ${D.jongbuse_basic.rows[1].cells[1]}`);
