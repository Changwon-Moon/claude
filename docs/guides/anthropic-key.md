# 검수 에이전트 켜기 — Anthropic API 키 등록 (오너용, 약 5분)

> 이 키 하나만 등록하면, 지금까지 오너가 눈으로 잡던 **디자인·카피 검수**를 AI 에이전트가 대신합니다.
> 키가 없어도 **코드 검수(결정성·레이아웃·캡션 규칙·수치 대조)는 이미 자동으로 동작**합니다. 이 키는 "감각 검수"를 추가로 켜는 스위치입니다.

## 왜 필요한가

- 검수 에이전트가 완성된 카드 이미지를 **직접 보고** 채점합니다: 여백이 어색한지, 폰트 대비가 약한지, 후킹이 약한지 등 (루브릭: `docs/REVIEW_RUBRIC.md`).
- GitHub Actions(무인 서버)에서 돌리므로, 오너 컴퓨터가 꺼져 있어도 검수가 진행됩니다.

## 1단계 — Anthropic API 키 발급

1. https://console.anthropic.com 접속 → 로그인(구글 계정 가능)
2. 왼쪽 메뉴 **API Keys** → **Create Key** → 이름(예: `wirit-review`) → 생성
3. 나타난 키(`sk-ant-...`)를 **복사** — 이 화면을 벗어나면 다시 못 봅니다.
4. (결제) **Billing**에서 소액 크레딧 충전($5면 검수 수백 건). 사용량은 콘솔에서 확인.

## 2단계 — GitHub Secrets에 등록

1. 저장소 페이지 → 상단 **Settings**
2. 왼쪽 **Secrets and variables → Actions**
3. **New repository secret**
   - Name: `ANTHROPIC_API_KEY`
   - Secret: 복사한 `sk-ant-...` 붙여넣기 → **Add secret**

> ⚠️ 키는 절대 코드·채팅·캡션에 붙여넣지 마세요. 오직 이 Secrets 칸에만.

## 3단계 (선택) — 검수 모델 지정

같은 화면의 **Variables** 탭 → **New repository variable**
- Name: `WIRIT_REVIEW_MODEL`
- Value: 사용할 Claude 모델 ID (미설정 시 기본값이 쓰입니다)

## 4단계 — 확인

1. 저장소 **Actions** 탭 → **콘텐츠 검수 (에이전트)** → **Run workflow**
2. 카드 경로·캡션·이름을 넣고 실행
3. 끝나면 `data/review/<이름>.json` 리포트가 커밋됩니다. `llm.available: true`면 검수 에이전트가 켜진 것.

## 비용 감각

- 검수 1세트(카드 3장 × 렌즈 2~3개) ≈ 수 센트. 하루 몇 건이면 월 몇 달러 수준.
- 걱정되면 콘솔 Billing에서 **월 사용 한도(Usage limit)** 를 걸어두세요.

---
문제가 생기면 Claude 세션에 "검수 에이전트 안 켜진다"고 말씀 주시면 로그를 보고 잡아드립니다.
