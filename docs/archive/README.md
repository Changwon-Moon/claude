# 아카이브 — 보관 문서

여기 있는 문서들은 **한때 저장소의 기준이었으나 지금은 살아있는 기준이 아니다.**
지우지 않고 남겨 둔 이유는 "왜 그때 그렇게 결정했나"의 역사가 필요할 때가 있어서다.
**새 세션은 이 폴더를 작업 기준으로 삼지 않는다.** 살아있는 기준은 저장소 루트 `README.md`의 문서 지도를 따른다.

2026-08-08 기준 문서 전체 리뉴얼에서 이곳으로 옮겼다.

## 무엇이 왜 여기 있나

| 문서 | 원래 역할 | 왜 아카이브됐나 | 대신 볼 곳 |
|---|---|---|---|
| `ROADMAP.md` | Phase 0~4 자동화 로드맵 | 대부분 미구현·방향 변경 | `VISION-automation.md`, 루트 `README.md` |
| `EXECUTION_PLAN.md` | M0~M12 시스템 구축 발주서 | 대부분 완료·폐기·미착수 | `docs/HANDOFF.md` |
| `OPERATIONS.md` | 자동 발행 가정 일일 운영 매뉴얼 | 자동 발행 2026-07-27 폐지 | `docs/CARD_CHECKLIST.md`, `company/CEO.md` |
| `CONTROL_TOWER.md` | 관제탑 초기 설계(칸반·성과탭 등) | 작성자가 2026-07-30 대부분 폐지 선언 | `docs/DATA_REFRESH.md` |
| `prompts/` | 런타임 에이전트용 팀 프롬프트 초안 | 런타임이 도착한 적 없음(입력→출력 칸 공란). 팀 지침의 정본은 `company/teams/*.md` | `company/teams/*.md`, `docs/CARD_CHECKLIST.md` |
| `STATUS-history.md` | 세션별 진행 서사 로그 | `STATUS.md`를 '현재 상태'만 남기며 과거 서사를 이관 | `STATUS.md`(현재), `research/DECISION_LOG.md`(소재 결정) |
| `DECISION_LOG-production-notes.md` | 카드 판형 제작 후기(픽셀 조정 서사) | 소재 결정 로그와 성격이 달라 분리 | `research/DECISION_LOG.md`(소재 결정), `docs/TEMPLATES.md`(현재 판형 계약) |
| `VISION-automation.md` | — | 접어 둔 '자동 파이프라인' 비전의 요약 보존 | (이 폴더) |

## 되살리려면

`prompts/`는 `scripts/scaffold-prompts.mjs`가 `company/teams/*.md`에서 다시 생성한다.
계획 문서의 개념(빌드타임 vs 런타임, 계약 우선 등)은 이미 살아있는 문서로 옮겨 두었으니,
자동화를 다시 추진할 때는 `VISION-automation.md`부터 읽으면 된다.
