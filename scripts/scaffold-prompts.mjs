/**
 * company/teams/*.md 의 가치관·책임을 시드로 prompts/{slug}.md 시스템 프롬프트 초안을 생성한다.
 * 1회성 스캐폴딩 — 생성 후 파일은 손으로(또는 관제탑에서) 수정보완한다. 기존 파일은 덮어쓰지 않는다.
 * 실행: node scripts/scaffold-prompts.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEAMS = join(ROOT, "company/teams");
const OUT = join(ROOT, "prompts");
mkdirSync(OUT, { recursive: true });

function field(md, label) {
  const m = md.match(new RegExp("\\*\\*" + label + "\\*\\*\\s*[:：]\\s*([^\\n]+)"));
  return m ? m[1].trim() : "";
}
function title(md) {
  const l = md.split(/\r?\n/).find((x) => /^#\s+/.test(x)) || "";
  return l.replace(/^#\s+/, "").trim();
}
function autonomy(md) {
  const m = md.match(/\*\*자동화\*\*\s*[:：]\s*([^\n|]+)/);
  return m ? m[1].trim() : "R0";
}

let made = 0,
  skipped = 0;
for (const f of readdirSync(TEAMS).filter((x) => x.endsWith(".md"))) {
  const slug = f.replace(/\.md$/, "");
  const dest = join(OUT, `${slug}.md`);
  if (existsSync(dest)) {
    skipped++;
    continue;
  }
  const md = readFileSync(join(TEAMS, f), "utf8");
  const t = title(md);
  const values = field(md, "가치관") || "(가치관 — 채워넣기)";
  const resp = field(md, "책임") || "(책임 — 채워넣기)";
  const auto = autonomy(md);

  const body = `# ${t} — 시스템 프롬프트 (초안 v0)

> M6~ 런타임 에이전트가 이 프롬프트로 동작한다. 지금은 **초안**이며, 운영자가 [관제탑] 또는 GitHub에서 직접 수정보완한다.
> 작업 시작 시 [CEO 원칙](../company/CEO.md)이 주입된다. 팀 상세: [사원카드](../company/teams/${slug}.md)

## 역할
${resp}

## 가치관 (판단의 최종 기준)
${values}

## 반드시 지키는 원칙
- **오보 0건**: 모든 수치는 1차 출처에서 코드로 추출하고 provenance 경로를 남긴다. 수치를 창작하지 않는다.
- **구조화 판단 기록**: 모든 결정은 \`{agent, ticketId, decision, reasons[], rubric, confidence, needsHuman, artifacts[]}\` 형태로 남긴다(관제탑에 자동 표출).
- **의심되면 사람에게**: 확신이 낮거나 오너의 취향·전략이 걸리면 \`needsHuman=true\`로 승인 요청한다.
- **CEO 원칙 우선**: [company/CEO.md](../company/CEO.md)의 관련 원칙을 먼저 따른다 — 오너가 같은 말을 두 번 하게 하지 않는다.

## 입력 → 출력
- **입력**: (이 팀이 받는 것 — 채워넣기)
- **출력**: (이 팀이 내놓는 산출물·경로 — 채워넣기)

## 자동화 수위
${auto} — 수위 상향은 결정 로그가 충분히 쌓인 뒤 오너 승인으로.

<!-- 이 아래에 팀 고유의 세부 지침·예시·금지사항을 자유롭게 추가한다. -->
`;
  writeFileSync(dest, body, "utf8");
  made++;
}
console.log(`✅ 프롬프트 초안 ${made}개 생성, ${skipped}개 건너뜀(이미 존재) → prompts/`);
