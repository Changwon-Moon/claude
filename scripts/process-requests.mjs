/**
 * 요청 대장 처리기 — 접수된 요청을 "실제로 진행"시킨다.
 *
 * ── 왜 필요한가 (2026-07-26 오너 보고)
 * 관제탑 버튼은 요청을 저장소에 **적기만** 했다. 그 뒤에 일하는 주체가 없어서
 * 오너는 "언제까지 기다려?"라고 물을 수밖에 없었다.
 * 이 스크립트가 그 자리를 메운다:
 *
 *   수정 지시  → research/work-orders/{id}.md 에 '재작업' 지시서를 만든다
 *   자료 조사  → 수집 결과(브리핑·소재)가 실제로 생겼는지 확인해 완료 처리
 *   소재 등록  → 소재 보드에 들어갔는지 확인해 완료 처리
 *
 * ── 완료는 '말'이 아니라 '사실'로 판정한다
 * done 을 코드가 임의로 켜지 않는다. 지시서 파일이 있는가, 소재가 보드에 있는가 —
 * 눈으로 확인 가능한 산출물이 있을 때만 완료로 적는다.
 * (그래야 화면의 '처리됨'이 거짓말이 되지 않는다)
 *
 * 실행: node scripts/process-requests.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REQ = join(ROOT, "data/requests.json");
const IDEAS = join(ROOT, "research/ideas.json");
const PSTATE = join(ROOT, "data/pipeline-state.json");
const ORDERS = join(ROOT, "research/work-orders");

const readJson = (p, fallback) => {
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    console.log(`::warning::${p} 파싱 실패 — ${e.message}`);
    return fallback;
  }
};

const norm = (s) =>
  String(s || "")
    .replace(/\s+/g, "")
    .replace(/[·—\-'"'()[\]⚠️🏢🔥📈]/g, "")
    .toLowerCase();

/** 파일명으로 쓸 수 있게 — 결정적(같은 제목 = 같은 파일) */
const slug = (s) =>
  String(s || "")
    .replace(/[^0-9A-Za-z가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "req";

const doc = readJson(REQ, null);
if (!doc) {
  console.log("data/requests.json 없음 — 건너뜁니다.");
  process.exit(0);
}
if (!Array.isArray(doc.items)) doc.items = [];

const ideasDoc = readJson(IDEAS, { ideas: [] });
const ideas = Array.isArray(ideasDoc.ideas) ? ideasDoc.ideas : [];
const pstate = readJson(PSTATE, { dropped: [], revise: [] });
const revise = Array.isArray(pstate.revise) ? pstate.revise : [];

mkdirSync(ORDERS, { recursive: true });
const orderFiles = new Set(readdirSync(ORDERS).filter((f) => f.endsWith(".md")));

/* ── ① 수정 지시는 대장에 없더라도 반드시 지시서가 있어야 한다 ──
 * pipeline-state.json 의 revise[] 는 오너가 "이렇게 고쳐줘"라고 남긴 것이다.
 * 지시서가 없으면 다음 작업 세션이 그걸 못 보고 지나친다 → 여기서 만든다. */
const made = [];
for (const r of revise) {
  const name = `${slug(r.title)}-revise.md`;
  if (orderFiles.has(name)) continue;
  const md = `# 재작업 지시 — ${r.title}

> 오너가 관제탑에서 남긴 수정 지시입니다. 이 문서가 재작업의 출발점입니다.
> 생성: 자동 (scripts/process-requests.mjs)${r.at ? ` · 지시 ${r.at}` : ""}

## 오너가 시킨 것

> ${String(r.note || "(내용 없음)").replace(/\n+/g, "\n> ")}

## 해야 할 일

- [ ] 위 지시를 그대로 반영한다. 해석이 갈리면 **묻지 말고 둘 다 만들어 보여준다**(CEO.md §C)
- [ ] 수치는 raw 데이터에서 코드로 추출하고 provenance 를 남긴다 (오보 0)
- [ ] 렌더 → \`review\` 통과 → 관제탑 결재 대기로 올린다
- [ ] 끝나면 \`data/pipeline-state.json\` 의 revise 에서 이 항목을 지운다 (안 지우면 화면에 계속 남는다)

## 참고

- 대상 티켓: \`${r.title}\`
- 회사 기준: [company/CEO.md](../../company/CEO.md) · [docs/TEMPLATES.md](../../docs/TEMPLATES.md)
`;
  writeFileSync(join(ORDERS, name), md, "utf8");
  orderFiles.add(name);
  made.push(name);
}

/* ── ② 대장의 각 요청이 실제로 처리됐는지 '사실'로 판정 ── */
const ideaTitles = new Set(ideas.map((i) => norm(i.title)));

/** 두 문장이 같은 것을 가리키는가 — 뜻있는 낱말이 2개 이상 겹치면 그렇다고 본다 */
const STOP = new Set(["찾아줘", "찾아", "모아줘", "모아", "관련된", "관련", "다양한", "여러가지", "정도", "자료", "자료들", "데이터", "소재", "소재들", "등"]);
function words(s) {
  return String(s || "")
    .replace(/[^0-9A-Za-z가-힣\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/(으로|에서|에게|에는|을|를|이|가|은|는|의|와|과|도|만|들)$/, ""))
    .filter((w) => w.length >= 2 && !STOP.has(w));
}
function overlaps(a, b) {
  const A = new Set(words(a));
  let n = 0;
  for (const w of words(b)) if (A.has(w)) n++;
  return n >= 2;
}

let closed = 0;
for (const it of doc.items) {
  if (it.done) continue;
  let ok = false;

  if (it.kind === "수정 지시") {
    // 지시서가 생겼으면 "다음 작업이 집을 수 있는 상태"까지 온 것이다.
    // 재작업 자체가 끝나는 건 revise 에서 빠질 때다.
    const name = `${slug(it.about || it.what)}-revise.md`;
    if (orderFiles.has(name)) {
      it.order = `research/work-orders/${name}`;
      ok = !revise.some((r) => norm(r.title) === norm(it.about));
      it.result = ok ? "재작업 완료 — 파이프라인에서 확인하세요" : "작업지시서 생성됨 — 제작 대기";
    }
  } else if (it.kind === "자료 조사") {
    // 그 지시로 찾아낸 소재가 보드에 실제로 올라왔는가.
    // 지시문("전세가율 지도, 전세난 정도 등 … 찾아줘")과 검색어("전세가율 전세난 전세 시장")는
    // 글자가 다르다 → 통째로 비교하지 말고 **낱말이 겹치는지**로 본다.
    const found = ideas.filter((i) => i.ask && overlaps(it.what, i.ask));
    if (found.length) {
      ok = true;
      it.result = `수집 완료 — 소재 보드에 ${found.length}건 올라왔습니다`;
    }
  } else if (it.kind === "소재 등록") {
    if (ideaTitles.has(norm(it.what))) {
      ok = true;
      it.result = "소재 보드에 등록됨";
    }
  }

  if (ok) {
    it.done = true;
    it.doneAt = new Date().toISOString().slice(0, 10);
    closed++;
  }
}

/* ── ③ 오래 묵은 요청은 소리 내어 알린다 ──
 * 조용히 쌓이면 그게 바로 오너가 겪은 문제다. */
const stale = doc.items.filter((it) => !it.done && it.ts && Date.now() - Date.parse(it.ts) > 3 * 864e5);

writeFileSync(REQ, JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`📋 요청 대장 — 전체 ${doc.items.length}건 · 이번에 완료 ${closed}건 · 남은 것 ${doc.items.filter((i) => !i.done).length}건`);
if (made.length) {
  console.log(`✍️  재작업 지시서 ${made.length}건 생성:`);
  for (const m of made) console.log(`   · research/work-orders/${m}`);
}
for (const s of stale) console.log(`::warning::3일 넘게 처리 안 된 요청 — ${s.kind}: ${String(s.what).slice(0, 60)}`);
