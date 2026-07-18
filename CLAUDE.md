# CLAUDE.md — 이 저장소에서 작업하는 모든 Claude 세션을 위한 지침

## 프로젝트 개요

@flow, APT_LAP 스타일의 데이터 인포그래픽 카드뉴스를 AI 파이프라인으로 매일 자동 생산·발행하는 인스타그램 계정 시스템. **운영자는 비개발자다** — 모든 커뮤니케이션은 한국어로, 기술 용어는 쉽게 풀어서 설명한다.

## 세션 시작 시 반드시 할 일

1. **STATUS.md를 읽는다** — 현재 어느 마일스톤까지 완료됐고, 지금 세션이 무엇을 해야 하는지 확인
2. **docs/EXECUTION_PLAN.md의 해당 마일스톤 발주 내용**과 완료 확인 기준을 확인
3. 관련 설계 문서(ARCHITECTURE.md, AGENTS.md, TEMPLATES.md, DATA_SOURCES.md)의 **계약을 따른다** — 계약을 바꿔야 한다면 임의로 바꾸지 말고 운영자에게 이유와 함께 제안한다

## 세션 종료 시 반드시 할 일

1. **STATUS.md 갱신** — 완료 항목 체크, 진행 중 이슈, 다음 세션이 알아야 할 메모
2. **커밋 & 푸시** — 커밋되지 않은 작업은 세션 종료와 함께 사라진다
3. 운영자에게 **완료 확인 기준을 눈으로 검증할 방법**을 제시 (렌더 이미지 전송, 실행 결과 화면 등)

## 절대 규칙

- **수치를 LLM이 창작하게 하는 코드를 쓰지 않는다.** 모든 수치는 raw 데이터에서 코드로 추출하고 `provenance` 경로를 남긴다 (ARCHITECTURE.md §2)
- **API 키·토큰을 저장소에 커밋하지 않는다.** GitHub Secrets 또는 `.env`(gitignore) 사용
- **렌더링은 결정적이어야 한다.** 동일 입력 = 동일 픽셀. 타임스탬프·랜덤 요소 금지
- **템플릿은 버전을 포함해 참조한다** (`ranking-table@1`). 기존 버전의 스키마를 깨는 변경은 새 버전으로
- 운영자가 직접 해야 하는 작업(계정, 키 발급, 결제)은 단계별 가이드를 `docs/guides/`에 작성해 안내한다
- 운영자에게 선택지를 제시할 때는 **렌더된 이미지·실행 결과 등 눈으로 비교 가능한 형태**로

## 저장소 구조 (목표 상태)

```
├── CLAUDE.md, STATUS.md, README.md, ROADMAP.md
├── docs/               # 설계 문서 (계약의 원천) + guides/ (비개발자용 가이드)
├── packages/
│   ├── renderer/       # JSON → PNG (Playwright)
│   ├── collectors/     # 데이터 수집기 (결정적 코드)
│   ├── pipeline/       # 오케스트레이터, 에이전트 러너
│   └── dashboard/      # 승인 대시보드 (Next.js)
├── templates/          # 디자인 템플릿 (TEMPLATES.md 참고)
├── prompts/            # 런타임 에이전트 시스템 프롬프트 (버전 관리)
└── data/               # raw / briefs / plans / content / out (gitignore 대상 판단은 M1에서)
```

## 기술 결정 사항 (이미 확정 — 재논의하지 말 것)

- TypeScript + Node.js, pnpm workspace 모노레포
- 렌더링: HTML/CSS + Playwright 스크린샷 (이미지 생성 AI 사용 금지)
- LLM: Claude API (에이전트별 모델 등급은 AGENTS.md 표 참고)
- 스케줄 실행: 1단계 GitHub Actions cron → 규모 확장 시 서버 이전
- 발행: Instagram Graph API (캐러셀)
- 승인 게이트: Telegram/Slack 봇 (M8) + 웹 대시보드 (M9)
