# 위릿 카드 공장 (@wirit_note)

> 🗺 **문서가 어디 있는지 모르겠으면: [WIRIT.md](WIRIT.md)** — 규칙별 정본 지도
> 🧳 **새 세션은 여기부터: [CLAUDE.md](CLAUDE.md)** — 세션 규칙 정본
> 환경 확인: `pnpm install --frozen-lockfile && node scripts/doctor.mjs`

데이터 인포그래픽 카드뉴스(@flow·APT_LAP 스타일)를 **결정적으로**(같은 입력 = 같은 픽셀)
찍어내는 공장이다. 부동산·경제 데이터를 원자료에서 코드로 추출해 카드로 만든다.

## 지금 실제로 어떻게 도나

세션(코워크/클로드코드)이 이 저장소를 열어 기준을 상속받고 → 데이터 확인 → 템플릿으로 카드 렌더 →
자동 검수(designQa) → 오너에게 렌더 PNG 전송 → **오너가 직접 인스타에 올린다.**
정기물(실거래·증시·인구 등)의 데이터 수집·재생산은 GitHub Actions가 자동으로 한다.

> "AI 여러 팀이 자동 발행까지 하는" 초기 비전은 접었다(자동 발행 2026-07-27 폐지).
> 그 청사진 요약은 [docs/archive/VISION-automation.md](docs/archive/VISION-automation.md)에 보존.

## 문서 지도 — 각 주제의 정본(단일 기준)은 하나다

주제마다 **정본 문서 하나**만 두고 나머지는 그곳을 링크한다. 같은 규칙을 두 곳에 복사하지 않는다.

### 시작·규칙

| 문서 | 무엇의 정본인가 |
|---|---|
| [CLAUDE.md](CLAUDE.md) | **세션 규칙 정본.** 환경 자가진단·읽기 순서·공장 구조·자주 쓰는 명령·새 카드 흐름·트리거·데이터 수집·절대 규칙·학습 프로토콜·세션 종료 |
| [WIRIT.md](WIRIT.md) | **문서 지도.** 어느 규칙의 정본이 어디인지 |
| [STATUS.md](STATUS.md) | **현재 상태.** 지금 확정본·진행 중·다음 할 일 (과거 서사는 `docs/archive/STATUS-history.md`) |

### 카드 만들기

| 문서 | 무엇의 정본인가 |
|---|---|
| [docs/CARD_CHECKLIST.md](docs/CARD_CHECKLIST.md) | **작업·검수 절차, 재발 금지 항목** — 카드를 만들거나 고치면 필수 |
| [docs/TEMPLATES.md](docs/TEMPLATES.md) | **템플릿별 픽셀·필드 계약**(수치 규격의 정본) |
| [docs/BRAND.md](docs/BRAND.md) | **색·타이포·워터마크 슬롯**(브랜드 규격의 정본) |
| [docs/REVIEW_RUBRIC.md](docs/REVIEW_RUBRIC.md) | **검수 판정 등급·LLM 렌즈** (designQa 항목 목록의 정본은 `designQa.ts` 코드) |
| [docs/LINE_CARDS.md](docs/LINE_CARDS.md) | **지하철 노선 시세 카드 시리즈** |

### 자산·데이터

| 문서 | 무엇의 정본인가 |
|---|---|
| [docs/ASSET_HUB.md](docs/ASSET_HUB.md) | **자산 등록·카탈로그·라이선스 분류**(라이선스 규칙의 정본) |
| [docs/IMAGE_AUTOMATION.md](docs/IMAGE_AUTOMATION.md) | **자산 자동 취득**(로고·사진, push→Actions) |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | **데이터 소스 카탈로그**(무엇이 있고 어떻게 접근하나) |
| [docs/DATA_REFRESH.md](docs/DATA_REFRESH.md) | **정기물 자동 갱신 운영**(무엇을 기계가·무엇을 사람이) |

### 판단·조직·소재

| 문서 | 무엇의 정본인가 |
|---|---|
| [company/CEO.md](company/CEO.md) | **오너 판단 원칙**(전략·콘텐츠·디자인·프로세스) |
| [company/teams/](company/teams/) | **팀별 일하는 방식·도구·학습 역사**(레퍼런스) |
| [docs/AGENTS.md](docs/AGENTS.md) | **조직 개요·6축 소재 채점 기준·검수 6항** |
| [docs/RESEARCH_WORKFLOW.md](docs/RESEARCH_WORKFLOW.md) | **리서치 방향·소재 채점 rubric의 정본** |
| [research/DECISION_LOG.md](research/DECISION_LOG.md) | **소재 결정 로그**(왜 골랐/버렸나 — AI 교보재) |
| [research/PATTERN_LIBRARY.md](research/PATTERN_LIBRARY.md) | **터진 콘텐츠 재사용 공식** |
| [docs/CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md) | **콘텐츠 티어 믹스·시리즈·발행 리듬** |

지난 계획 문서(로드맵·발주서·자동 운영 매뉴얼 등)는 [docs/archive/](docs/archive/)에 보관돼 있다.

## 핵심 설계 원칙

1. **디자인은 템플릿, 데이터만 교체** — HTML/CSS 템플릿에 JSON 데이터를 바인딩해 스크린샷으로 뽑는다. 이미지 생성 AI는 쓰지 않는다(일관성·정확성).
2. **숫자는 코드가, 문장은 LLM이** — 수치·순위·날짜는 코드가 원자료에서 추출한다. LLM은 소재·제목·요약에만. 오보를 구조적으로 차단한다(**오보 0**).
3. **발행한 카드는 픽셀이 안 바뀐다** — 공용 템플릿을 고치면 이미 나간 카드가 조용히 바뀐다. 새 스타일은 variant로 격리한다(**픽셀 불변**).
4. **발행은 사람이 한다** — 세션은 승인 앞까지만 준비하고, 최종 인스타 업로드는 오너가 직접 한다.
5. **저장소가 유일한 진실 원천** — 세션은 오고 가지만 커밋된 것만 남는다. 새 세션은 이 문서 지도를 읽고 즉시 이어서 일한다.
