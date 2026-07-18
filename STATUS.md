# STATUS — 프로젝트 진행 상황 보드

> 모든 세션은 시작할 때 이 파일을 읽고, 끝낼 때 갱신한다. (CLAUDE.md 참조)
> 마일스톤 정의와 발주 프롬프트: [docs/EXECUTION_PLAN.md](./docs/EXECUTION_PLAN.md) §4

**최종 갱신**: 2026-07-18 (설계 세션)

## 마일스톤 현황

| # | 마일스톤 | 상태 | 비고 |
|---|---|---|---|
| — | 설계 문서 작성 (로드맵, 아키텍처, 에이전트, 템플릿, 소스, 운영, 실행전략) | ✅ 완료 | 2026-07-18 |
| M0 | 준비 — 계정·API 키 발급 | 🟡 가이드 완료·운영자 수행 대기 | 가이드: [docs/guides/M0-setup.md](./docs/guides/M0-setup.md). 운영자가 키 6종 발급 후 M1 |
| M1 | 레포 스캐폴딩 + 렌더러 코어 | ✅ 완료 | JSON→PNG 렌더러 동작. 결정성·스키마검증 확인. 미리보기: templates/dummy-card/preview.png |
| M2 | 템플릿 1호 ranking-table | 🟡 제작완료·시안선택 대기 | Pretendard 번들 완료, 템플릿 동작(5/10/15행·긴이름 검증). **운영자가 시안 A/B/C 선택 필요** → 확정 후 default 고정 |
| M3 | 템플릿 2·3호 (market-daily, vs-compare) | ⬜ 대기 | M4와 병렬 가능 |
| M4 | 수집기 P0 (증시·환율·금리) + Actions cron | ⬜ 대기 | M3과 병렬 가능 |
| M5 | 첫 무인 콘텐츠: 증시 데일리 E2E 자동 발행 | ⬜ 대기 | 최초의 가시적 성과 |
| M6 | 편집 에이전트 + 팩트체크 | ⬜ 대기 | |
| M7 | 리서치·기획 에이전트 | ⬜ 대기 | |
| M8 | 오케스트레이터 + 모바일 승인 게이트 | ⬜ 대기 | |
| M9 | 운영 대시보드 | ⬜ 대기 | M10과 병렬 가능 |
| M10 | 디자인 QA + 콘텐츠 뱅크 | ⬜ 대기 | M9와 병렬 가능 |
| M11 | 인사이트 수집 + 주간 성과 리포트 | ⬜ 대기 | |
| M12 | 운영 안정화 + 자동화 수위(L0~L3) | ⬜ 대기 | |

## Phase 0 결정 대기 항목 (운영자 결정 필요)

- [x] **니치 확정** (2026-07-18): **부동산·주식·경제 코어(60~70%) + 범용 통계·랭킹 트래픽(25~35%) 하이브리드** — 상세는 [docs/CONTENT_STRATEGY.md](./docs/CONTENT_STRATEGY.md)
- [x] **주간 발행 캘린더 초안** (2026-07-18): CONTENT_STRATEGY.md §4 — 아침/저녁 증시 무인 슬롯 + 낮 메인 슬롯
- [x] **계정명·브랜드 확정** (2026-07-18): **wirit (위릿), @wirit_note** — 로고·잉크네이비 팔레트 확정, 상세는 [docs/BRAND.md](./docs/BRAND.md). 계정 개설 완료 (프로페셔널 전환은 M0에서)
  - 남은 소작업: 로고 원본 `assets/brand/logo.png` 업로드 ([방법](./assets/brand/README.md)), 하락 색상(코발트 제안) M3 시안에서 확정

**→ Phase 0 결정 사항 전부 완료. 다음 작업: M0 발주.**

## 발급된 키/계정 (이름만 기록 — 값은 절대 기록 금지)

| 항목 | 상태 |
|---|---|
| Instagram 프로페셔널 계정 (@wirit_note 전환) | ⬜ M0 1단계 |
| Meta 개발자 앱 + 인스타 토큰 (`IG_ACCESS_TOKEN`, `IG_USER_ID`) | ⬜ M0 2단계 |
| 공공데이터포털 API 키 (`DATA_GO_KR_API_KEY`) | ⬜ M0 3단계 |
| 한국은행 ECOS API 키 (`ECOS_API_KEY`) | ⬜ M0 4단계 |
| Anthropic API 키 (`ANTHROPIC_API_KEY`) | ⬜ M0 5단계 |
| GitHub Secrets 5종 등록 | ⬜ M0 6단계 |
| Telegram 봇 토큰 (`TELEGRAM_BOT_TOKEN`) | ⬜ M8에서 |

> 방식 결정: 인스타 발행은 **"Instagram API with Instagram Login"**(2024.7~) 사용 — 페이스북 페이지 불필요, 내 계정만 대상이라 앱 심사 없이 개발 모드로 동작. 토큰 60일 유효 + M5에서 자동 갱신 구현 예정.

## 세션 로그

| 날짜 | 세션 작업 | 결과 |
|---|---|---|
| 2026-07-18 | 설계 문서 일체 작성, 실행 전략(세션 운영 방식) 수립 | 문서 9종 커밋 |
| 2026-07-18 | 니치 확정(코어+트래픽 하이브리드), 콘텐츠 전략 문서화 | CONTENT_STRATEGY.md 추가 |
| 2026-07-18 | 브랜드 확정: wirit(@wirit_note), 잉크네이비 팔레트 | BRAND.md, assets/brand/ 추가 |
| 2026-07-18 | M0 셋업 가이드 작성 (계정·키 발급), 발행 방식 확정, .gitignore | M0-setup.md 추가, 운영자 수행 대기 |
| 2026-07-18 | M1 렌더러 구축: 모노레포 + JSON→PNG(Playwright) + 스키마검증 + dummy-card | 렌더 성공, 해시 동일(결정성), 불량데이터 반려 확인 |
| 2026-07-18 | M2 ranking-table 템플릿 3시안(A/B/C) + Pretendard 폰트 번들 | 5/10/15행·긴이름 렌더 검증. 시안 선택 대기 |

## 다음 세션이 알아야 할 메모

- 운영자는 비개발자. 완료 확인은 항상 "눈으로 볼 수 있는 결과물"로 제시할 것
- **M1 완료**: 렌더러(`packages/renderer`)가 `pnpm --filter @wirit/renderer render -- --data <json> --out <dir>` 로 동작. 새 템플릿은 `templates/{이름}/`에 html+schema+sample+config 4종.
- **M2 진행중**: Pretendard 번들 완료(base.css @font-face). ranking-table 템플릿에 시안 A/B/C 3종을 `variant` 값으로 전환. 미리보기: `templates/ranking-table/previews/`.
  - **대기: 운영자 시안 선택.** 선택 후 할 일: (1) sample.json의 variant를 확정값으로, (2) 선택 안 된 variant CSS 정리(또는 특집용으로 유지 결정 시 보존), (3) 템플릿 default variant 주석 갱신.
  - 밀도 자동조절: d-sparse(≤6)/d-mid(7~11)/d-dense(≥12)로 행수에 맞춰 폰트·여백 자동 축소. 긴 이름은 말줄임(…).
  - 로고: 현재 이름 첫 글자 모노그램(임시). 로고 라이브러리는 별도 구축 예정(교체 시 items[].logo slug 사용).
- 하락 색상(코발트) 확정은 M3(market-daily) 시안에서.
- 아직 미완: 로고 원본 `assets/brand/logo.png` 업로드(운영자), M0 키 발급(운영자).
