#!/usr/bin/env node
/**
 * 전수 검사 — 저장소 **전체**를 한 번에 훑는다.
 *
 * 왜 필요한가 (2026-08-31 오너 지적):
 *   "요청할 때마다 정리되지 않은 오류가 계속 튀어나온다."
 *   맞는 말이었다. 지금까지의 검사는 **요청받은 영역만** 봤다 —
 *   문서를 물으면 문서를, 배관을 물으면 배관을. 그래서 다음 질문에서 또 새로 나왔다.
 *
 *   개별 검사(check-doc-links·check-orphan-scripts 등)는 각자 자기 구역만 본다.
 *   이 스크립트는 **구역을 나누지 않고 전부 본다.** 느려도 된다 — 자주 도는 게 아니다.
 *
 * 무엇을 보나 — 개별 검사가 안 보는 자리들:
 *   ① 워크플로가 부르는 스크립트가 실재하나
 *   ② 빌더 명세(builders.json)의 스크립트·인자가 유효한가
 *   ③ 세트(sets.json)에 빌더와 캡션이 다 있나
 *   ④ 템플릿에 schema.json·config.json 이 갖춰져 있나
 *   ⑤ 데이터셋에 meta.verified 가 있나
 *   ⑥ 워크플로에 실패를 알릴 입이 있나
 *   ⑦ package.json 스크립트가 실재하는 파일을 가리키나
 *   ⑧ 문서가 없는 스크립트를 가리키나
 *
 * 쓰는 법: node scripts/audit-all.mjs [--strict]
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildersForSet } from "./lib/builders-for-set.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => join(ROOT, p);
const has = (p) => existsSync(R(p));
const read = (p) => (has(p) ? readFileSync(R(p), "utf8") : "");
const json = (p) => { try { return JSON.parse(read(p)); } catch { return null; } };

const found = [];          // {area, level, what, hint}
const bad = (area, what, hint = "") => found.push({ area, level: "❌", what, hint });
const warn = (area, what, hint = "") => found.push({ area, level: "⚠️", what, hint });
let checked = 0;

/* ── ① 워크플로가 부르는 스크립트가 실재하나 ── */
for (const f of readdirSync(R(".github/workflows")).filter((x) => x.endsWith(".yml"))) {
  const t = read(`.github/workflows/${f}`);
  for (const m of t.matchAll(/node\s+(scripts\/[A-Za-z0-9_\-./가-힣]+\.mjs)/g)) {
    checked++;
    if (!has(m[1])) bad("워크플로", `${f} → ${m[1]} 없음`, "이름이 바뀌었거나 지워졌습니다");
  }
  for (const m of t.matchAll(/uses:\s*\.\/(\.github\/workflows\/[a-z0-9-]+\.yml)/g)) {
    checked++;
    if (!has(m[1])) bad("워크플로", `${f} → ${m[1]} 없음(workflow_call)`);
  }
}

/* ── ② 빌더 명세가 유효한가 ── */
const builders = json("data/review/builders.json")?.builders || [];
for (const b of builders) {
  checked++;
  if (!has(b.cmd)) bad("빌더 명세", `${b.label} → ${b.cmd} 없음`, "은퇴시켰다면 builders.json 에서도 빼야 합니다");
}

/* ── ③ 세트에 빌더와 캡션이 다 있나 ── */
const setsDoc = json("data/review/sets.json");
const sets = setsDoc?.sets || setsDoc || [];
const builderLabels = new Set(builders.map((b) => b.label));
for (const s of sets) {
  checked += 2;
  /* ⚠️ 「이 세트를 만드는 빌더는 무엇인가」는 **정본 하나**에서만 판단한다 —
     scripts/lib/builders-for-set.mjs. 여기 따로 적혀 있던 좁은 판정(라벨 일치 또는
     produces 만) 때문에 2026-09-02 에 tohuh-price-map 이 「빌더가 없다」로 잡혔다.
     produce-card·confirm 은 정본을 써서 멀쩡히 돌고 있었다 — 전수 검사만 다른 말을 했다.
     (같은 판단이 두 곳에 있으면 언젠가 갈라진다 — 08-25 에 셋이 갈라진 그 자리다.) */
  const mine = buildersForSet(s, builders);
  if (!mine.length) warn("세트", `${s.label} — 이 세트를 만드는 빌더가 없다`, "재생산이 안 됩니다(수동 제작본일 수 있음)");
  const cap = `data/review/captions/${s.caption || s.label}.txt`;
  if (!has(cap)) bad("세트", `${s.label} — 캡션 없음(${cap})`, "캡션이 없으면 검수도 확정도 못 합니다");

  /* ── 「출발선은 같았다」 세트는 **묶음이 못 박혀 있어야** 한다 (2026-09-04 사고 뒤)
     이 시리즈의 후보 묶음은 캐시가 자라면 **판이 다시 깔린다** — 매일 도는 실거래 수집이
     최근 달을 갱신하므로 하루만 지나도 묶음 구성이 달라진다.
     그래서 `--pick`(줄번호)도 `--danji`(단지 이름)도 발행본을 못 붙든다:
     2026-09-04 에 3·4·10호가 「그 묶음이 없습니다」로 **다시 그릴 수 없게** 됐다.
     data/content 와 data/out 은 둘 다 gitignore 라, 새로 clone 하면 남는 것이 없었다.

     → 발행본은 `data/datasets/gap-published/{라벨}.json` 에 묶음을 통째로 적고
       빌더를 `--group` 으로 건다. 그 파일은 저장소에 커밋된다. */
  if (/^gap-ep\d+-\d+$/.test(s.label)) {
    checked += 2;
    const pin = `data/datasets/gap-published/${s.label}.json`;
    if (!has(pin)) {
      bad("세트", `${s.label} — 묶음이 못 박혀 있지 않다(${pin})`,
        "후보 목록은 캐시가 자라면 다시 깔립니다 — 핀이 없으면 발행본을 다시 못 그립니다(GAP_CARDS §19)");
    } else if (mine.length && !mine.some((b) => (b.args || []).includes("--group"))) {
      bad("세트", `${s.label} — 빌더가 --group 을 안 씁니다`,
        `--pick·--danji 는 후보 목록이 바뀌면 어긋납니다. --group ${pin} 으로 거세요(GAP_CARDS §19)`);
    }
  }
}

/* ── ④ 템플릿이 갖춰져 있나 ──
 * ⚠️ schema.json·config.json 은 **선택**이다(loadTemplate 의 readJsonIfExists, config 엔 기본값).
 *    없다고 고장이 아니라서 처음엔 29건이 경고로 쏟아졌다 — 그러면 진짜 문제가 묻힌다.
 *    **반드시 있어야 하는 것만 본다: template.html.**
 *    다만 `sets.json` 이 실제로 쓰는 판형에 schema 가 없으면 그건 말해준다 —
 *    발행까지 가는 판형은 입력 계약이 있어야 오타가 렌더 전에 걸린다. */
/* 원커맨드로만 만들어지는 판형 — 사람이 JSON 을 손으로 쓰지 않으니 오타가 들어올 입구가 없다.
   노선 카드는 `line-card.mjs` 하나가 리프레시→빌드→렌더→QA 를 전부 돌린다.
   스키마를 억지로 붙이면 데이터가 늘 때마다 스키마도 고쳐야 해서 오히려 갈라진다. */
const ONE_COMMAND = /^(line\d-loop|sinbundang-loop|metro-2col)$/;
const usedTpl = new Set();
for (const d of (has("data/content") ? readdirSync(R("data/content")) : [])) {
  if (!statSync(R(`data/content/${d}`)).isDirectory()) continue;
  for (const f of readdirSync(R(`data/content/${d}`))) {
    if (!f.endsWith(".json")) continue;
    const j = json(`data/content/${d}/${f}`);
    const name = String(j?.template || "").split("@")[0];
    const label = f.replace(/\.json$/, "");
    if (name && sets.some((s) => (s.cards || []).includes(label))) usedTpl.add(name);
  }
}
for (const t of readdirSync(R("templates")).filter((x) => !x.startsWith("_"))) {
  checked++;
  if (!has(`templates/${t}/template.html`)) bad("템플릿", `${t} — template.html 없음`, "렌더할 것이 없습니다");
  else if (usedTpl.has(t) && !has(`templates/${t}/schema.json`) && !ONE_COMMAND.test(t)) {
    warn("템플릿", `${t} — 확정 세트가 쓰는데 schema.json 이 없다`, "입력 계약이 없으면 오타가 렌더까지 갑니다");
  }
}

/* ── ⑤ 데이터셋에 meta.verified 가 있나 ── */
for (const f of readdirSync(R("data/datasets")).filter((x) => x.endsWith(".json"))) {
  const j = json(`data/datasets/${f}`);
  if (!j || Array.isArray(j)) continue;
  checked++;
  if (j.meta && j.meta.verified === undefined) {
    warn("데이터셋", `${f} — meta.verified 가 없다`, "검증 여부를 알 수 없으면 카드에 쓰면 안 됩니다");
  }
}

/* ── ⑥ 실패를 알릴 입이 있나 (매일 도는 것만) ── */
for (const f of readdirSync(R(".github/workflows")).filter((x) => x.endsWith(".yml"))) {
  const t = read(`.github/workflows/${f}`);
  const cron = t.split("\n").some((l) => !/^\s*#/.test(l) && /-\s*cron:/.test(l));
  if (!cron) continue;
  checked++;
  if (!t.includes("notify-telegram")) {
    warn("알림", `${f} — 예약인데 실패를 알릴 입이 없다`, "silent-pipes 가 하루 한 번 모아서 알립니다");
  }
}

/* ── ⑦ package.json 스크립트가 실재하나 ── */
for (const p of ["package.json", ...readdirSync(R("packages")).map((d) => `packages/${d}/package.json`)]) {
  const j = json(p);
  if (!j?.scripts) continue;
  for (const [k, v] of Object.entries(j.scripts)) {
    const m = String(v).match(/(?:node|tsx)\s+([A-Za-z0-9_\-./]+\.(?:mjs|ts|js))/);
    if (!m) continue;
    checked++;
    const base = dirname(p) === "." ? "" : dirname(p);
    if (!has(join(base, m[1])) && !has(m[1])) {
      bad("package.json", `${p} · ${k} → ${m[1]} 없음`);
    }
  }
}

/* ── ⑧ 문서가 없는 스크립트를 가리키나 ── */
const docFiles = [];
const walk = (d) => {
  for (const e of readdirSync(R(d))) {
    const rel = `${d}/${e}`;
    if (/node_modules|\.git|docs\/archive|docs\/history/.test(rel)) continue;
    if (statSync(R(rel)).isDirectory()) walk(rel);
    else if (e.endsWith(".md")) docFiles.push(rel);
  }
};
for (const d of ["docs", "company", "research"]) if (has(d)) walk(d);
docFiles.push("CLAUDE.md", "STATUS.md", "README.md");
for (const f of docFiles) {
  const t = read(f);
  for (const m of t.matchAll(/`?(scripts\/[a-z0-9_\-]+\.mjs)`?/gi)) {
    checked++;
    if (!has(m[1])) bad("문서", `${f} → ${m[1]} 없음`, "옮겼거나 지운 스크립트를 아직 가리킵니다");
  }
}

/* ── 보고 ── */
console.log(`\n전수 검사 — ${checked}개 항목을 훑었습니다\n`);
if (!found.length) {
  console.log("✅ 어긋난 곳 없음\n");
  process.exit(0);
}
const byArea = {};
for (const f of found) (byArea[f.area] ||= []).push(f);
for (const [area, list] of Object.entries(byArea)) {
  console.log(`▸ ${area} — ${list.length}건`);
  for (const f of list.slice(0, 10)) {
    console.log(`   ${f.level} ${f.what}`);
    if (f.hint) console.log(`      ${f.hint}`);
  }
  if (list.length > 10) console.log(`   … 외 ${list.length - 10}건`);
  console.log("");
}
const errs = found.filter((f) => f.level === "❌").length;
console.log(`❌ ${errs}건 · ⚠️ ${found.length - errs}건\n`);
process.exit(process.argv.includes("--strict") && errs ? 1 : 0);
