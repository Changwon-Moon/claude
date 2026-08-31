# 자산 허브 — 자료허브팀 운영 규칙

> 미션: **"한 번 쓴 자료는 자산으로. 두 번째부터는 공짜다."** (`company/teams/asset-hub.md`)
> 다작의 물리 법칙은 재사용이다. 모든 비주얼 자산과 데이터셋은 여기 규칙대로 등록해야 카드에 쓸 수 있다. 품질검수 6항 중 4번(저작권)이 이 등록 여부를 기계로 검사한다.

## 0. 취득하기 전에 **먼저 찾는다** (2026-08-12 오너 지시)

```bash
node scripts/assets-find.mjs 대통령        # 낱말로 훑는다(파일명·이름·메모·출처 전부)
node scripts/assets-find.mjs --all         # 전부 나열
```

**왜 이 절이 맨 앞인가.** 「역대 정부 통화량」 카드에서 대통령 초상 6장을 새로 받았는데
그중 **이재명 사진은 저장소에 이미 있었다.** 사진 취득은 Actions 왕복이라 한 장에 3~4분이 든다 —
있는 걸 또 받는 데 시간을 썼다.

그리고 더 나쁜 것: 취득기(`scripts/fetch-photo.mjs`)가 카탈로그의 **엉뚱한 자리**에 적고 있었다.
허브 스키마는 `{ $schema, kind, items: [...] }` 인데 `cat[slug] = {...}` 로 **최상위 키**에 써서,
`validate-assets.mjs`(= `items[]` 만 본다)에는 **없는 자산**이었다. 11건이 그렇게 새 있었다.
→ 취득기를 고쳤고, 예전 것도 `items[]` 로 옮겼다. **자산은 등록돼야 자산이다.**

### 파생본은 물려받는다
카드가 실제로 참조하는 건 대개 원본이 아니라 누끼(`-cut.png`)·얼굴 규격화본(`-face.png`)이다.
출처·라이선스는 원본과 같으므로 사람이 다시 적지 않는다:

```bash
node scripts/assets-sync-photos.mjs        # 파생본을 원본 메타에서 자동 등록
```

원본을 못 찾은 파일은 **건드리지 않고 이름만 보고**한다 — 출처를 모르는 것을 지어내지 않는다.

### 인물 사진은 규격화해서 쓴다
화각이 제각각인 초상(공식 초상~연단 발언)을 그대로 나란히 두면 얼굴 크기가 두 배까지 벌어진다.

```bash
python3 scripts/normalize-portraits.py <slug> [<slug> ...]   # → {slug}-face.png
```

OpenCV 로 **얼굴을 검출해** 크기·위치를 px 로 못박고(480×586), 아래끝을 가슴선에 맞춘다.
덤으로 누끼가 덜 지운 **반투명한 검은 배경 잔재**도 지운다(노무현 초상의 머리 위 뿔이 그것이었다).
검출이 안 되면 그 장은 **건너뛰고 보고**한다 — 눈대중으로 자르지 않는다.

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
