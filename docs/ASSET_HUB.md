# 자산 허브 — 자료허브팀 운영 규칙

> 미션: **"한 번 쓴 자료는 자산으로. 두 번째부터는 공짜다."** (AGENTS.md §4)
> 다작의 물리 법칙은 재사용이다. 모든 비주얼 자산과 데이터셋은 여기 규칙대로 등록해야 카드에 쓸 수 있다. 품질검수 6항 중 4번(저작권)이 이 등록 여부를 기계로 검사한다.

## 1. 허브 구조

```
templates/_shared/          # 비주얼 자산 (렌더러가 상대경로로 참조)
├── logos/    + catalog.json   # 기업·기관 로고
├── flags/                     # 국기 271종 (일괄 라이선스: flag-icons MIT)
├── photos/   + catalog.json   # 실물 사진 (항공·현장·인물·제품)
├── maps/     + catalog.json   # 지도 SVG (향후 map-region용)
└── fonts/                     # 폰트 (Pretendard·Wanted Sans·Black Han Sans, OFL)

data/datasets/ + catalog.json  # 데이터셋 캐시 (git 커밋 대상 — 재사용 자산)
```

- `data/raw`(일일 수집물)와 달리 **`data/datasets`는 커밋한다** — 정제·검증을 거친 재사용 데이터이기 때문.
- 검증: `node scripts/validate-assets.mjs` — 카탈로그 없는 파일, 라이선스 빠진 항목을 잡아낸다.

## 2. 비주얼 자산 메타데이터 (catalog.json 스키마)

폴더마다 `catalog.json` 하나. 파일을 추가하면 **반드시 항목도 추가**:

```jsonc
{
  "slug": "samsung",             // 파일명(확장자 제외). 소문자-하이픈
  "name": "삼성",                 // 사람이 읽는 이름
  "kind": "logo",                // logo | photo | map
  "source": "simple-icons v16",  // 어디서 왔나 (URL 권장)
  "license": "trademark-nominative", // 아래 라이선스 분류 중 하나
  "note": "브랜드색 #1428A0 적용", // 선택
  "added": "2026-07-18"
}
```

### 라이선스 분류 (license 필드 허용값)

| 값 | 의미 | 사용 조건 |
|---|---|---|
| `public-domain` | 퍼블릭 도메인 (정부 발표자료 등) | 자유 |
| `open-license` | MIT·CC-BY·OFL 등 명시적 오픈 라이선스 | 출처 표기 규정 준수 |
| `press-release` | 보도자료·기관 제공 사진 | 출처 표기 필수, 맥락 왜곡 금지 |
| `trademark-nominative` | 기업 로고 (지명적 사용) | 식별 목적만, 왜곡 금지, 이의 시 즉시 교체 |
| `licensed` | 구매·계약한 자산 | 계약 범위 내 |
| ⛔ 등록 불가 | 언론사 사진, 출처 불명 이미지 | **무단 전재 금지 — 허브에 넣지 않는다** |

### 사진 조달 3순위 (재확인)
1순위 자체 렌더 그래픽 → 2순위 위 표의 합법 소스(등록 후 사용) → 3순위 없으면 표/차트로 우회.

## 3. 데이터셋 캐시 (data/datasets/)

**"한 번 수집·검증한 숫자는 다시 수집하지 않는다."** 편집팀은 새 콘텐츠 제작 시 **캐시 먼저 확인 → 없으면 수집 → 수집한 것을 캐시에 등록**.

### 파일 규칙
- 파일명: `{주제}-{기준시점}.json` (예: `construction-salary-2025.json`, `apt-trade-seoul-2026-07.json`)
- 내용: 정규화 데이터 + **메타 필수**:

```jsonc
{
  "meta": {
    "title": "10대 건설사 평균연봉",
    "source": "DART 각사 2025 사업보고서",   // 1차 출처
    "sourceUrl": "https://dart.fss.or.kr",
    "asOf": "2025-12-31",                    // 데이터 기준 시점
    "collectedAt": "2026-07-19",
    "verified": true,                        // 원본 대조 완료 여부
    "usedIn": ["2026-07-19-001"]             // 사용한 콘텐츠 티켓 (재사용 추적)
  },
  "rows": [ { "name": "삼성물산", "salary": 128340000, "tenure": 12.4 } ]
}
```

- `verified: false`인 데이터셋은 카드에 못 쓴다(검수 1항에서 차단).
- 카탈로그(`data/datasets/catalog.json`)에 한 줄 등록 — 편집팀이 여길 먼저 훑는다.
- **시효 주의**: `asOf`가 오래된 데이터는 재사용 시 "OO 기준" 표기를 강제. 시세류(실거래가·주가)는 캐시 재사용 금지 항목으로 표시(`perishable: true`).

## 4. 등록 절차 (운영자/세션 공통)

1. 파일을 폴더에 넣는다 (또는 세션에 "이 로고 추가해줘" + 파일)
2. `catalog.json`에 항목 추가 (세션이 대신 함)
3. `node scripts/validate-assets.mjs` 통과 확인 (세션이 실행)
4. 커밋 — 이후 모든 콘텐츠가 slug로 참조 가능

## 5. KPI

- **자산 재사용률**: 신규 콘텐츠 중 허브 자산·캐시로만 만든 비율 (높을수록 제작 단가↓)
- 카탈로그 무결성: validate-assets 통과 상태 유지 (CI에서 검사)
