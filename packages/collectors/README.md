# @wirit/collectors

데이터 수집기 — 공공/공개 소스에서 증시·환율·금리를 **결정적 코드**로 수집·정규화한다. 파이프라인의 "리서치팀 이전" 원료 공급 장치이며, **LLM을 쓰지 않는다**(수치 창작 금지 규칙).

## 무엇을 하나

각 소스에서 데이터를 받아 정규화 스키마([types.ts](./src/types.ts))로 변환 → `data/raw/{date}/{source}.json` 저장. 하나가 실패해도 나머지는 진행(부분 수집 허용).

## 현재 소스 (P0)

| 소스 파일 | 내용 | 출처 | 키 |
|---|---|---|---|
| `us-market.json` | S&P500·나스닥·다우 지수 + 1년 시계열 | Stooq | 불필요 |
| `kr-rates.json` | 기준금리 + 원/달러 환율 | 한국은행 ECOS | `ECOS_API_KEY` |

P1(국토부 실거래가·청약), P2(DART·KOSIS)는 이후 마일스톤에서 추가. 소스 카탈로그: [../../docs/DATA_SOURCES.md](../../docs/DATA_SOURCES.md).

## 실행

```bash
# 로컬 (키는 .env 또는 환경변수)
ECOS_API_KEY=xxx pnpm --filter @wirit/collectors collect
pnpm --filter @wirit/collectors collect -- --date 2026-07-18   # 특정 날짜

# 파서 셀프테스트 (네트워크 불필요)
pnpm --filter @wirit/collectors selftest
```

## 구조

```
src/
├── cli.ts            # 진입점 (--date)
├── run.ts            # 수집기 등록·실행·부분실패 리포트
├── types.ts          # 정규화 스키마 (Quote/Series/CollectionResult)
├── http.ts           # 재시도 fetch (지수 백오프)
├── parse/
│   ├── stooq.ts      # Stooq CSV 파서 (순수함수)
│   └── ecos.ts       # ECOS JSON 파서 (순수함수)
├── sources/
│   ├── usMarket.ts   # 미국 지수
│   └── krRates.ts    # ECOS 기준금리·환율
├── __fixtures__/     # 테스트용 고정 샘플
└── selftest.ts       # 파서 검증 (15 케이스)
```

**설계 원칙**: 네트워크 fetch(`sources/`)와 데이터 해석(`parse/`)을 분리. 파서는 순수함수라 네트워크 없이 테스트 가능 — 이 저장소 빌드 환경처럼 외부 API가 막혀 있어도 로직 정확성을 검증한다.

## 자동 실행 (GitHub Actions)

[.github/workflows/collect.yml](../../.github/workflows/collect.yml) 은 **수동·푸시 방아쇠**로 실행한다(2026-08-31 예약 해제 — 매일 도는 예약은 알림 2건과 그 재료 4개만 남겼다). 키는 GitHub Secrets(`ECOS_API_KEY` 등)에서 주입. 수집 결과는 workflow 아티팩트(`raw-data`)로 업로드.

## 알아둘 것

- **빌드 환경(이 저장소 세션)에선 외부 API가 프록시로 차단**되어 실제 수집이 안 된다(403). 파서 셀프테스트로 로직만 검증하고, 실제 수집은 Actions에서 확인.
- ECOS 통계표 코드(기준금리 722Y001, 환율 731Y001 등)는 `sources/krRates.ts` 상단 상수. ECOS가 코드를 바꾸면 여기만 수정.
- Stooq가 막히거나 포맷이 바뀌면 `sources/usMarket.ts`의 URL/파서를 조정(대체 소스: Yahoo Finance 등).
