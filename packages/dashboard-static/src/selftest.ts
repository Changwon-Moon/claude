/**
 * 파서 셀프테스트 (네트워크·파일시스템 불필요).
 * 실행: pnpm --filter @wirit/dashboard-static selftest
 */
import { parseBrief } from "./parse/brief.js";
import { parseDecisionLog } from "./parse/decisionLog.js";
import { parseCeoPrinciples, parseTeamCard } from "./parse/company.js";

let pass = 0,
  fail = 0;
function check(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}${detail ? " — " + detail : ""}`);
  }
}

// ── 소재보드 파서 ──
const BRIEF = `# 소재 보드
## 🎯 주 콘텐츠
### 부동산
- [ ] **2. 실거래 신고가 랭킹 — 아크로 98억** (국토부) 🔥
  포맷: ranking-table · 데이터: 국토부 실거래가
- [x] **9. 이미 고른 소재** (어딘가)
  포맷: info-grid
## 📎 부 콘텐츠
### 기업
- [ ] **1. 실적시즌 캘린더**
  포맷: info-grid · 데이터: DART
`;
const bt = parseBrief(BRIEF, "2026-07-19-auto");
check("브리핑: 체크 안 된 항목만(2건)", bt.length === 2, `got ${bt.length}`);
check("브리핑: 🔥 감지", bt[0].fire === true);
check("브리핑: 포맷 추출", bt[0].fmt === "ranking-table", bt[0].fmt);
check("브리핑: 토픽=부동산", bt[0].topic === "부동산", bt[0].topic);
check("브리핑: 주(T1)/부(T2) 구분", bt[0].tier === "T1" && bt[1].tier === "T2");
check("브리핑: 신호 출처 근거화", bt[0].evidence.some((e) => e[0].includes("국토부")));
check("브리핑: id에 번호 반영", bt[0].id.endsWith("c2"), bt[0].id);

// ── 결정로그 파서 ──
const LOG = `| 날짜 | 소재 | 신호 | Tier | 포맷 | 점수 | 결정 | 이유 | 성과 |
|---|---|---|---|---|---|---|---|---|
| 2026-07-19 | (예시) 무언가 | x | T2 | ranking-table | 12 | ✅제작 | y | — |
| 2026-07-19 | 서울 초고가 아파트 신고가 TOP 3 | 소재보드 2번 🔥 | T1 부동산 | ranking-table | 14 | ✅제작 | 저장가치 높음 | (발행 후) |
| 2026-07-19 | 자동 증시 | 데일리 | T1 증시 | market-daily | — | ✅자동 | 고정물 | — |
| 2026-07-19 | 버릴 소재 | 실검 | — | — | 4 | ❌버림 | 데이터 없음 | — |
`;
const lt = parseDecisionLog(LOG);
check("결정로그: 예시 제외(3건)", lt.length === 3, `got ${lt.length}`);
const apt = lt.find((t) => t.title.includes("초고가"))!;
check("결정로그: 점수=14", apt?.rubric?.sum === 14, String(apt?.rubric?.sum));
check("결정로그: 토픽=부동산", apt?.topic === "부동산", apt?.topic);
check("결정로그: 🔥 신호 감지", apt?.fire === true);
check("결정로그: 제작→stage2", apt?.stage === 2, String(apt?.stage));
const auto = lt.find((t) => t.title.includes("자동"))!;
check("결정로그: 자동→stage5·auto", auto?.stage === 5 && auto?.auto === true);
const drop = lt.find((t) => t.title.includes("버릴"))!;
check("결정로그: 버림 플래그", drop?.flags.includes("버림"));

// ── CEO 원칙 파서 ──
const CEO = `# CEO
### A. 전략 — 무엇을 하는 회사인가
| 날짜 | 원칙 | 출처 |
|---|---|---|
| 07-18 | 원칙 하나 | "말" |
| 07-19 | 원칙 둘 | "말2" |
### C. 디자인 — 룩
| 날짜 | 원칙 | 출처 |
|---|---|---|
| 07-19 | 잉크 테두리 | "잉크로" |
`;
const ceo = parseCeoPrinciples(CEO);
check("CEO: 총 원칙 3개", ceo.count === 3, String(ceo.count));
check("CEO: 카테고리 2개", Object.keys(ceo.byCategory).length === 2);
check("CEO: A전략 2건", ceo.byCategory["A. 전략 — 무엇을 하는 회사인가"]?.length === 2);

// ── 팀 카드 파서 ──
const TEAM = `# 🔎 리서치팀

**가치관**: 데이터 없는 아이디어는 소재가 아니다.
**책임**: 신호 수집

## 학습 로그
| 날짜 | 배운 것 | 출처 |
|---|---|---|
| 07-19 | 카테고리 확정 | 오너 |
| 07-19 | 아이디어 경로 | 오너 |

**KPI**: 채택률 | **자동화**: R1
`;
const team = parseTeamCard(TEAM, "research")!;
check("팀: 이모지 분리", team.emoji === "🔎", team.emoji);
check("팀: 이름", team.name === "리서치팀", team.name);
check("팀: 가치관", team.values.startsWith("데이터 없는"));
check("팀: 자동화 R1", team.autonomy === "R1", team.autonomy);
check("팀: 학습로그 2건", team.logCount === 2, String(team.logCount));

// 변형 선택자 포함 이모지
const team2 = parseTeamCard(`# 🗄️ 자료허브팀\n**가치관**: 재사용.\n**자동화**: R3`, "asset-hub")!;
check("팀: 변형선택자 이모지 이름 분리", team2.name === "자료허브팀", team2.name);

console.log(`\n${fail === 0 ? "✅ 전체 통과" : "❌ 실패 있음"} — ${pass} pass / ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
