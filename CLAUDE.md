# CLAUDE.md — 이 저장소에서 작업하는 모든 Claude 세션을 위한 지침

## 프로젝트 개요

@flow, APT_LAP 스타일의 데이터 인포그래픽 카드뉴스를 AI 파이프라인으로 매일 자동 생산·발행하는 인스타그램 계정 시스템. **운영자는 비개발자다** — 모든 커뮤니케이션은 한국어로, 기술 용어는 쉽게 풀어서 설명한다.

> 🧳 **이 저장소를 처음 붙였다면 [docs/HANDOFF.md](docs/HANDOFF.md) 부터 읽는다.**
> 그리고 `node scripts/doctor.mjs` 로 **이 환경에서 카드가 실제로 나오는지** 먼저 확인한다 —
> 렌더가 안 되는 환경에서 카드를 고치면 검수가 사람 눈으로 돌아가고, 그게 오보 0이 깨지는 지점이다.

## 세션 시작 시 반드시 할 일

1. **STATUS.md를 읽는다** — 현재 어느 마일스톤까지 완료됐고, 지금 세션이 무엇을 해야 하는지 확인
2. **docs/EXECUTION_PLAN.md의 해당 마일스톤 발주 내용**과 완료 확인 기준을 확인
3. 관련 설계 문서(ARCHITECTURE.md, AGENTS.md, TEMPLATES.md, DATA_SOURCES.md)의 **계약을 따른다** — 계약을 바꿔야 한다면 임의로 바꾸지 말고 운영자에게 이유와 함께 제안한다
4. **카드를 만들거나 고치는 작업이면 [docs/CARD_CHECKLIST.md](docs/CARD_CHECKLIST.md) 를 먼저 읽는다.**
   이건 권장이 아니라 필수다 — 이 문서가 생긴 이유가 *이미 정해둔 기준을 오너가 다시 말하게 된 일*이다.
   §2(재발 금지 항목)를 훑고, 내보내기 전에 §0(재생성 + 자동 검수 + 발행본 md5)을 실행한다.

5. **캡션을 쓰기 전에 `data/review/captions/` 의 최근 발행본과 `_alt/README.md` 를 읽는다.**
   `_alt/README.md` 는 오너가 **무엇을 잘라냈는지**를 적어 둔 파일이다 —
   길게 쓴 뒤 잘리는 것보다 처음부터 그 길이로 쓰는 편이 빠르다.
   캡션은 **카드가 확정된 뒤에** 쓴다(CEO.md 원칙).

## ⚡ 트리거: "N호선/신분당 역세권 (대장) 아파트 시세" 요청

오너가 **"3호선 역세권 대장 아파트 시세 작업해줘"** 같은 문장(노선 시세 카드 시리즈)을 요청하면,
그 자리에서 **원커맨드 하나**로 데이터 리프레시→캡션→빌드→렌더→QA 를 전부 자동 실행한다.
손으로 숫자를 고치거나 단계를 나눠 묻지 않는다(오보 0, 판단 불필요 = 스크립트가 함).

```bash
node scripts/line-card.mjs 3호선            # 문장째 넘겨도 됨: "3호선 역세권 대장 아파트 시세"
```

- 나오면 **PNG·캡션을 오너에게 보여주고**, 확정 시 `node scripts/confirm.mjs`.
- 세부 기준·리프레시 원리·새 노선 추가는 **[docs/LINE_CARDS.md](docs/LINE_CARDS.md)**(특히 §8 리프레시·§9 원커맨드).
- 새 달을 포함하려면 먼저 `node scripts/line-card.mjs <노선> --collect 202608` → push→pull 후 다시 실행.
- **아직 없는 노선**(데이터셋 없음)은 자동 불가 — LINE_CARDS.md §7(큐레이션·에이전트 선정)을 먼저 밟는다.

## 학습 프로토콜 (회사의 기억 — 필수)

이 저장소는 "회사"다(`company/README.md`). **운영자의 피드백을 받으면 반드시 기록한다**:
- 판단·취향·전략 → `company/CEO.md` 판단 원칙에 추가 (일회성 지시는 제외, 애매하면 "확인 대기"에)
- 특정 팀의 일하는 방식 → `company/teams/{팀}.md` 학습 로그에 추가
- 소재 선택 이유 → `research/DECISION_LOG.md` / 터진 콘텐츠 → `research/PATTERN_LIBRARY.md`
- **작업 시작 전 CEO.md의 원칙을 확인**하고 따른다 (특히 디자인 §C — 오너가 같은 말을 두 번 하게 하지 않는다)
- **오너가 같은 지적을 두 번 하면 그건 문서화 실패다.** 그때는 세 곳을 함께 고친다:
  ① `docs/CARD_CHECKLIST.md` §2 에 항목 추가 ② 좌표로 잴 수 있으면 **`designQa` 검수항으로 승격**
  ③ 관련 팀(`company/teams/design.md`·`qa.md`) 학습 로그에 남긴다.
  검수항을 새로 넣었으면 **일부러 어긋나게 되돌려 실제로 잡히는지 확인**한다 — 통과만 보면 켜졌는지 알 수 없다

## 세션 종료 시 반드시 할 일

1. **STATUS.md 갱신** — 완료 항목 체크, 진행 중 이슈, 다음 세션이 알아야 할 메모
2. **커밋 & 푸시** — 커밋되지 않은 작업은 세션 종료와 함께 사라진다
3. 운영자에게 **완료 확인 기준을 눈으로 검증할 방법**을 제시 (렌더 이미지 전송, 실행 결과 화면 등)

## 절대 규칙

- **수치를 LLM이 창작하게 하는 코드를 쓰지 않는다.** 모든 수치는 raw 데이터에서 코드로 추출하고 `provenance` 경로를 남긴다 (ARCHITECTURE.md §2)
- **API 키·토큰을 저장소에 커밋하지 않는다.** GitHub Secrets 또는 `.env`(gitignore) 사용
- **렌더링은 결정적이어야 한다.** 동일 입력 = 동일 픽셀. 타임스탬프·랜덤 요소 금지
- **발행된 카드·오너가 '확정'한 카드의 픽셀은 바꾸지 않는다.** 공용 템플릿을 고치면 조용히 바뀐다 →
  새 스타일은 **카드가 요청할 때만 켜지는 variant**로 격리하고, 고친 뒤 md5 회귀를 확인한다
  (기준값: `docs/CARD_CHECKLIST.md` §5)
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
