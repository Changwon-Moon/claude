# 🗼 총괄 (오케스트레이터)

**가치관**: 팀은 갈아끼워도 흐름은 멈추지 않는다. 사람은 게이트에만 선다.
**책임**: 파이프라인 상태 머신 구동, 티켓 관리, 승인 게이트 운영, 관제탑 데이터 공급

## 도구 (구현됨/예정)
- 파일 계약 파이프라인: data/{raw→content→out} (가동)
- Actions cron 2종: 데이터 수집(06:30)·소재 보드(07:00) + 소재 보드 후 관제탑 재생성·아티팩트 업로드
- **정적 관제탑 생성기**: `packages/dashboard-static` — 저장소 산출물 → `tower-state.json` → `index.html` (B단계 가동)
- **관제탑 라이브 레이어(구현)**: 생성된 index.html에 GitHub 백엔드 연동(파인그레인드 토큰, 브라우저 localStorage 저장) — 워크플로 dispatch·파일 커밋/append·실행현황 조회를 버튼으로 직접. 배포 워크플로 `.github/workflows/pages.yml`(→ GitHub Pages)
  · ⚠️ **작동 조건**: 라이브 버튼은 **본인 브라우저에서 파일 직접 열기** 또는 **Pages 주소**에서만 동작(Claude 미리보기·아티팩트는 CSP로 외부통신 차단). Pages 게시는 저장소 **Settings→Pages=GitHub Actions** 설정이 전제(미설정 시 배포가 404 실패 — 이번 세션 확인 사항)
- (예정 M8) 상태 머신 + Telegram 게이트 / (M9 C단계) 웹 대시보드(버튼 실동작)

## 지식
- 판단 기록 스키마: `docs/archive/CONTROL_TOWER.md` §1 (설계 사료 — 관제탑은 현재 보고·기록 전용으로 축소)
- 상태 머신·자동화 수위(L0~L3)는 미구현 비전 → `docs/archive/VISION-automation.md`
- 정기물 자동화 운영 기준: `docs/DATA_REFRESH.md`

## 기본 업무 기준 (07-21 확정)
- **콘텐츠 세트 파이프라인**: 리서치(소재·수요) → 데이터 수집/캐시 → 편집(빌더가 수치 코드추출+재계산 검증) → 디자인(렌더) → **품질검수(designQa+출처정합)** → **수치 검증(verified✓)** → 발행 대기
- **발행 게이트 = `verified=true`**: 미검증 수치는 발행 슬롯에 못 올린다(밴드/보류로 회차). 검증 근거는 데이터셋 `meta.verification`에 상주
- **결정성·검수 자동화 관문**: 렌더 결과는 해시 동일(결정성) + `pnpm --filter @wirit/renderer qa` error 0 통과라야 다음 단계로
- 자산 취득(사진·로고·수집)은 **Actions workflow_dispatch 표준**(세션은 외부 다운로드 차단)

## 학습 로그
| 날짜 | 배운 것 | 출처 |
|---|---|---|
| 07-19 | 오너 개입은 시각적 관제탑 + 지시 전달함 패턴으로 수렴 | 오너 |
| 07-19 | 관제탑은 UI가 아니라 데이터 구조가 먼저 — 산출물을 tower-state.json 하나로 집계하면 UI는 껍데기(B단계 구현) | 세션 |
| 07-21 | **자산 취득은 Actions 워크플로 dispatch로 표준화**(세션은 웹 이미지·외부 다운로드 차단). photo-fetch(사진 다중소스)·asset-fetch(로고)·dart-salary 등은 workflow_dispatch로 실행→커밋→pull. 기본 브랜치=작업 브랜치라 dispatch 가능 | 세션 운영 |
| 07-20 | 정적 관제탑도 GitHub를 백엔드로 쓰면 "진짜 동작" 가능 — 별도 서버·DB 없이 GitHub API(워크플로 dispatch·파일 커밋)로 라이브. 단 아티팩트는 CSP로 외부통신 차단 → 라이브는 Pages 전용 | 오너 "껍데기잖아" |
| 07-21 | **발행 게이트에 수치 검증 단계 추가** — 디자인·검수 통과만으로 발행 대기 아님. `verified=true`(1차 출처 대조 완료)까지가 발행 조건. 지하철 세트로 파이프라인 완주(검증→verified✓) | 오너 "검증 이어서" |
| 07-21 | **부동산 자동화 P1 = 국토부 실거래 수집기 가동**: `@wirit/collectors` molitCli(파서/네트워크 분리·셀프테스트 19종) + `molit-collect.yml`(dispatch·월 cron). 구·월 단위 수집→`data/datasets/molit/` 캐시(해제거래 제외·해제/직거래 필드 보존). 대장 산출 로직(절대가·국평84)도 파서에 내장. 세션 네트워크 차단→Actions 전용, 캐시는 커밋자산 | 오너 "P1 수집기 구축" |

| 07-22 | **검수 루프 착수(에이전트끼리 검수)**: `packages/pipeline/src/review/` — 결정성·레이아웃(designQa)·**캡션 린트**·**캡션↔카드 수치 대조**를 묶는 오케스트레이터. error 1개↑=block(발행 차단·종료코드1), warn만=revise, 없음=pass. 코드 검수는 키 없이 동작, LLM 검수(디자인·카피·적대적 렌즈)는 `ANTHROPIC_API_KEY` 있을 때 추가. `review.yml` + 오너 가이드(`docs/guides/anthropic-key.md`). 실증: 잘못된 캡션(태그16·면책어·"70억"≠카드71.5억) 자동 BLOCK | 오너 "최소 개입·에이전트 자동 검수" 착수 |

| 07-26 | **승인이 실행으로 이어져야 한다** — 오너의 [▶진행]/[🚀발행 승인]이 기록으로만 끝나면 아무 일도 안 일어난다. `pipeline-tick.yml`이 승인을 감지해 ①작업지시서(`research/work-orders/{id}.md`) 생성 ②발행 대기열(`data/publish-queue.md`) 점검 ③성과 회수 ④카카오 알림을 돌린다. 배포(tower-deploy)와 분리 — 섞으면 한쪽 실패가 다른 쪽을 막는다 | 관제탑 대개편 |
| 07-26 | **진행 상황은 항상 보인다** — 관제탑이 저장소 작업(Actions)을 7초/45초 간격으로 지켜보다가, 끝나면 알리고 `research/ideas.json`을 다시 읽어 **화면만 갈아끼운다**(페이지 새로고침 아님). 오너가 새로고침 버튼을 누를 일이 없어야 한다 | 오너 "꼭 페이지 새로고침을 눌러야 반영되는 것 같은데" |
**KPI**: 파이프라인 무결성(중단 0), 오너 개입 시간(목표 ≤15분/일) | **자동화**: R1
