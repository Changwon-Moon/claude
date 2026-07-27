/**
 * 소재 승인 → 작업지시서 자동 생성.
 *
 * 오너가 관제탑에서 [▶ 진행]을 누르면 research/ideas.json 의 그 소재에 stage:1 이 붙는다.
 * 이 스크립트는 stage:1 인데 아직 작업지시서가 없는 소재를 찾아
 * research/work-orders/{id}.md 를 만든다.
 *
 * 왜 필요한가: 승인이 "기록"으로만 끝나면 아무 일도 안 일어난다.
 * 작업지시서가 생기면 다음 세션(또는 기획 에이전트)이 그걸 집어 바로 제작에 들어간다.
 *
 * 지시서에는 오너의 판단 근거를 그대로 옮긴다 — 왜 이 소재인지, 출처는 어디인지.
 * 그리고 최근 반려 이유를 함께 실어, 같은 실수를 반복하지 않게 한다.
 *
 * 실행: node scripts/open-work-orders.mjs
 * 출력: 새로 만든 지시서 목록 (없으면 아무것도 안 만들고 종료)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IDEAS = join(ROOT, "research/ideas.json");
const ORDERS = join(ROOT, "research/work-orders");

if (!existsSync(IDEAS)) {
  console.log("research/ideas.json 없음 — 건너뜁니다.");
  process.exit(0);
}

let doc;
try {
  doc = JSON.parse(readFileSync(IDEAS, "utf8"));
} catch (e) {
  console.log(`::warning::ideas.json 파싱 실패 — ${e.message}`);
  process.exit(0);
}

const items = Array.isArray(doc.ideas) ? doc.ideas : [];
const cats = new Map((Array.isArray(doc.cats) ? doc.cats : []).map((c) => [c.key, c.label]));

mkdirSync(ORDERS, { recursive: true });
const existing = new Set(readdirSync(ORDERS).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")));

// 같은 실수를 반복하지 않도록 최근 반려 이유를 지시서에 실어 보낸다
const rejected = items.filter((i) => i.state === "reject" && i.reason).slice(-6);

const made = [];
for (const i of items) {
  if (Number(i.stage || 0) !== 1) continue; // 기획안 단계로 막 올라온 것만
  if (existing.has(i.id)) continue; // 이미 지시서가 있다

  const md = `# 작업지시 — ${i.title}

> 오너가 관제탑에서 승인한 소재입니다. 이 문서가 제작의 출발점입니다.
> 생성: 자동 (scripts/open-work-orders.mjs) · 소재 id \`${i.id}\`${i.at ? ` · 승인 ${i.at}` : ""}

## 소재

| | |
|---|---|
| 제목 | ${i.title} |
| 주제 | ${i.topic || "-"} |
| 발행 주기 | ${cats.get(i.cat) || i.cat || "-"} |
| 자료 갱신 | ${
    i.feed === "auto"
      ? "자동 — 수집기가 이미 돈다. **버튼 한 번으로 다시 뽑히게** 빌더로 만들 것"
      : i.feed === "manual"
        ? "수동 — 자료를 사람이 넣어야 한다. 정기물이면 수집기부터 만들 것"
        : "(미정)"
  } |
| 왜 이 소재인가 | ${i.why || "(미기재)"} |
| 데이터 출처 | ${i.source || "(미정 — 먼저 확정할 것)"} |

## 해야 할 일

- [ ] **출처 확정·수치 확보** — \`data/datasets/\` 에 원본을 남기고 코드로 추출한다
      (오보 0 원칙: LLM이 수치를 만들어내는 코드는 절대 쓰지 않는다 — ARCHITECTURE.md §2)
- [ ] **템플릿 선택** — 기존 템플릿 재사용이 원칙. 새로 만들 땐 \`docs/TEMPLATES.md\` 규약을 따른다
- [ ] **카드 렌더** — 결정성 확인(동일 입력 = 동일 픽셀) + \`designQa\` 통과
- [ ] **업로드 캡션 작성** — \`data/review/captions/{label}.txt\` (린트 통과 필요)
- [ ] **발행 세트 등록** — \`data/review/sets.json\` 에 추가 (등록해야 관제탑 발행 후보로 올라온다)
${
  ["daily", "weekly", "monthly", "quarter", "yearly"].includes(i.cat)
    ? `- [ ] **⚠️ 정기물 — 빌더 등록 필수** — \`data/review/builders.json\` 에 추가한다.
      등록해야 오너가 관제탑 [🔁 다시 제작]만 눌러 다음 회차를 뽑을 수 있다.
      등록하지 않으면 이 카드는 매번 작업 세션을 불러야 하는 일회성이 된다.`
    : `- [ ] (일회성 소재라 빌더 등록은 하지 않는다 — 정기로 바꾸려면 오너가 소재 보드에서 주기를 지정한다)`
}
- [ ] **자동 검수** — \`pnpm --filter @wirit/pipeline review\`

## 최근 오너가 반려한 이유 (같은 실수 반복 금지)

${rejected.length ? rejected.map((r) => `- ${r.reason}  ← 「${r.title}」`).join("\n") : "- (아직 기록된 반려 이유 없음)"}

## 진행 기록

<!-- 진행하면서 여기에 남긴다. 완료되면 관제탑 파이프라인에서 다음 단계로 이동한다. -->
`;

  writeFileSync(join(ORDERS, `${i.id}.md`), md, "utf8");
  made.push({ id: i.id, title: i.title });
}

if (!made.length) {
  console.log("새로 만들 작업지시서 없음.");
} else {
  console.log(`📋 작업지시서 ${made.length}건 생성`);
  for (const m of made) console.log(`   · research/work-orders/${m.id}.md — ${m.title}`);
}
