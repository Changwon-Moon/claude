# @wirit/pipeline

오케스트레이터 — 수집 데이터(raw)를 콘텐츠 JSON으로 변환하고 렌더까지 연결한다. **수치 변환은 결정적 코드**(LLM 미사용, 절대 규칙 준수).

## 무엇을 하나

```
raw 수집물(data/raw)  →  [generate: 코드 변환]  →  콘텐츠 JSON(data/content)  →  [renderer]  →  카드 PNG(data/out)
```

현재 구현: **"간밤의 미국 증시"** 카드 (us-market 수집물 → market-daily 카드).

## 실행

```bash
# raw → 콘텐츠 JSON → 카드 PNG 한 번에
pnpm --filter @wirit/pipeline build-market-us -- --raw data/raw/2026-07-17/us-market.json

# 변환 로직 셀프테스트 (네트워크 불필요)
pnpm --filter @wirit/pipeline selftest
```

## 구조

```
src/
├── cli.ts                # build-market-us 진입점
├── buildMarket.ts        # raw → 콘텐츠 JSON 저장 → 렌더 호출
├── generate/marketUs.ts  # 미국지수 raw → market-daily 콘텐츠 (결정적)
├── format.ts             # 수치·날짜 포맷 (천단위, 등락, 날짜)
├── types.ts              # raw/콘텐츠 계약 타입
└── selftest.ts           # 변환 검증 (15 케이스)
```

## 설계 원칙

- **수치는 raw에서 코드로만** 추출·포맷. LLM은 이 단계에 관여하지 않음.
- generate 함수는 순수 변환이라 네트워크 없이 셀프테스트로 검증 가능.
- 콘텐츠 JSON은 템플릿 `schema.json`으로 렌더 시 재검증(계약 이중 안전장치).

## 다음 확장

- **간밤의 미국 증시**: ✅ 구현 (us-market)
- 오늘의 한국 증시: KRX(코스피/코스닥) 수집기 추가 후 `generate/marketKr.ts`
- 랭킹/비교 등: 편집 에이전트(M6)가 raw + 기획안 → 콘텐츠 JSON 생성 (수치는 여전히 코드 도구로)
- 발행: 생성된 PNG를 Instagram Graph API로 자동 게시 (M0의 IG 토큰 필요)
