# 검수 루브릭 — 에이전트끼리 완성본을 판정하는 기준

> 목적: 오너의 "눈" 역할을 **코드 + LLM 에이전트**가 대신하도록, 판정 기준을 명문화한다.
> 이 문서가 `packages/pipeline/src/review/`(코드)와 LLM 검수 프롬프트의 **단일 원천**이다.
> 원칙이 바뀌면 여기 · `rubric.ts` · `company/CEO.md`를 함께 갱신한다.

## 판정 체계

| 판정 | 의미 | 발행 |
|---|---|---|
| **pass** | 지적 없음 | 승인 게이트로 |
| **revise** | warn만 있음(치명적 아님) | 수정 권장 후 재검수 or 오너 판단 |
| **block** | error 1개↑ | 발행 차단, 반드시 수정 |

산정: error 하나라도 → block, warn만 → revise, 없음 → pass. (`decideVerdict`)

## 1) 코드 검수 (키 불필요·항상 동작)

### 결정성
- 이중 렌더 md5 동일. 다르면 **error**(타임스탬프·랜덤 요소 의심).

### 레이아웃 (`designQa`)
- 정렬·여백·넘침·행겹침·**패딩 침범(padcross)**. error면 block.

### 캡션 린트 (`lintCaption`)
| 항목 | 기준 | 레벨 |
|---|---|---|
| 해시태그 수 | **최대 5개** | 초과=error |
| 금지어 | 투자판단·매수 권유·수익률·원금·손실 보장 등 **면책/투자권유 문구** | 포함=error |
| 집계 기간 | 연도 포함 **구체 표기**(2026년 1~6월·상반기). 모호한 '최근 N개월' 지양 | 누락=warn |
| 출처 | '출처' 표기(예: 국토부 실거래가) | 누락=warn |
| 후킹 | 첫 줄 질문(?) | 없으면=info |

### 캡션↔카드 수치 대조 (`captionNumberMatch`)
- 캡션의 **억 단위 금액**이 카드 수치 풀에 존재해야 함. 없으면 **error**(오보 위험).
- 예: 캡션 "70억"인데 카드가 71.5억 → 자동 차단.

## 2) LLM 검수 (ANTHROPIC_API_KEY 있을 때)

렌더 PNG(+캡션)를 렌즈별로 0~10 채점 + 지적 + 수정지시(JSON). 점수 < pass면 warn.

| 렌즈 | 관점 | pass | 핵심 체크 |
|---|---|---|---|
| **design** | 디자이너 | 7 | 여백·정렬 균형 / 폰트 대비·가독성(밝은 배경 밝은 글씨 금지) / 핵심 수치 크기 / 빈 공간 / 브랜드 요소 잘림. 어두운 글씨=잉크(#141821), 지역·기관 로고=실제 공식 로고 |
| **copy** | 카피라이터 | 7 | 첫 줄 후킹 / '정답 가리기' 성립 / 비유·표현이 사실과 일치(틀린 비교=error) / 저장·공유 유도 / 신뢰 톤 |
| **adversarial** | 적대적 검수 | 7 | "반드시 반려" 관점으로 결함 3개↑ 적극 발굴. 근거 없이 통과 금지 |

> LLM 검수는 초기에 **advisory(revise)** 로 둔다 — 오너 취향 데이터가 얇은 동안 자동 block 지양(오너 어드바이스). 시리즈별 결정 로그가 쌓이면 특정 렌즈를 block으로 승격.

## 실행

```bash
# 코드 검수만 (키 불필요)
pnpm --filter @wirit/pipeline review -- <card.json ...> --caption cap.txt --label 이름 --out data/review

# LLM 포함 (Actions에서 ANTHROPIC_API_KEY 주입, 또는 로컬 env)
ANTHROPIC_API_KEY=... WIRIT_REVIEW_MODEL=<모델ID> pnpm --filter @wirit/pipeline review -- ...
```

리포트 JSON(`data/review/<label>.json`)은 관제탑이 소비하고, block이면 종료코드 1로 발행 차단.
