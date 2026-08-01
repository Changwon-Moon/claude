/**
 * 바뀐 데이터 파일 → 다시 만들어야 하는 발행 세트 목록.
 *
 * ── 왜 이 파일인가 (2026-07-31 오너 "매번 눌러야 돼? 알아서 해줘")
 * 수집기가 새 데이터를 커밋해도, 그 데이터로 만든 카드는 **아무도 다시 만들지 않았다.**
 * 오너가 관제탑에서 [제작 실행]을 눌러야 반영됐다. 데이터가 바뀌면 카드도 바뀌어야 한다는 건
 * 판단이 아니라 사실이므로, 사람이 누를 일이 아니다.
 *
 * ── 의존 관계를 손으로 적지 않는 이유
 * `builders.json` 에 `deps: ["data/datasets/molit"]` 같은 칸을 두는 방법도 있었다.
 * 하지만 그 칸은 **반드시 낡는다** — 빌더가 새 데이터셋을 읽기 시작해도 아무도 칸을 고치지 않는다.
 * 그래서 **빌더 스크립트 소스를 읽어** `data/datasets/…`·`data/geo/…` 경로를 직접 뽑는다.
 * 코드가 곧 의존 관계다. 두 곳에 적으면 반드시 어긋난다(이 저장소가 여러 번 겪은 실패다).
 *
 * 실행: node scripts/affected-sets.mjs <바뀐경로> [<바뀐경로> ...]
 * 출력: 세트 라벨 한 줄에 하나 (없으면 아무것도 출력하지 않고 정상 종료)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const changed = process.argv.slice(2).map((s) => s.trim()).filter(Boolean);
if (!changed.length) process.exit(0);

const sets = JSON.parse(readFileSync(join(ROOT, "data/review/sets.json"), "utf8")).sets || [];
const builders = JSON.parse(readFileSync(join(ROOT, "data/review/builders.json"), "utf8")).builders || [];

/** 빌더 스크립트가 읽는 데이터 경로 접두사들 — 소스에서 직접 뽑는다 */
function depsOf(builder) {
  const p = join(ROOT, builder.cmd);
  if (!existsSync(p)) return [];
  const src = readFileSync(p, "utf8");
  const hits = src.match(/data\/(?:datasets|geo)\/[A-Za-z0-9_./-]*/g) || [];
  // 뽑은 문자열을 **그대로** 접두사로 쓴다(startsWith 비교).
  //   "data/datasets/molit"              → 그 폴더 아래 전부
  //   "data/datasets/reb-rent-index.json" → 그 파일만
  //   "data/datasets/avg-salary-"         → 템플릿 리터럴 조각도 접두사로 잘 맞는다
  // ⚠️ 파일명을 잘라 폴더로 만들면 안 된다 — "data/datasets" 가 되어 **모든 빌더가 걸린다**
  //    (처음에 그렇게 짰다가 실거래 한 파일 변경에 12개 세트가 딸려 나왔다).
  return [...new Set(hits)].filter((h) => (h.split("/")[2] || "").length > 0);
}

const affected = new Set();
for (const b of builders) {
  const deps = depsOf(b);
  if (!deps.length) continue;
  if (!changed.some((c) => deps.some((d) => c.startsWith(d)))) continue;

  // 이 빌더가 들어가는 세트를 찾는다 — produce-card.mjs 와 **같은 규칙**을 쓴다
  const base = (c) => c.replace(/-p\d+$/, "");
  for (const s of sets) {
    const mine =
      s.label === b.label ||
      (s.cards || []).some((c) => c.startsWith(b.label) || b.label.startsWith(base(c)));
    if (!mine) continue;
    // 캡션 없는 세트는 아직 발행 후보가 아니다 — 기계가 먼저 만들 이유가 없다
    const capName = s.caption || s.label;
    if (!existsSync(join(ROOT, "data/review/captions", capName + ".txt"))) continue;
    affected.add(s.label);
  }
}

for (const l of [...affected].sort()) console.log(l);
