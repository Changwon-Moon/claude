# 🗄️ 자료허브팀

**가치관**: 한 번 쓴 자료는 자산으로. 두 번째부터는 공짜다.
**책임**: 비주얼 자산(로고·국기·사진·지도) 카탈로그 관리, 데이터셋 캐시 운영, 라이선스 통제

## 도구 (구현됨)
- 무결성 검증기: `scripts/validate-assets.mjs` (CI 편입 — 미등록·라이선스 누락 자동 적발)
- 카탈로그: `templates/_shared/{logos,photos,maps,flags}/catalog.json`, `data/datasets/catalog.json`
- **로고 자동 해결기 A**: `scripts/lib/logo-resolver.mjs` (회사명→simple-icons, 오프라인·무키)
- **로고 자동 취득기 B**: `packages/collectors/src/sources/logoFetch.ts`+`logoCli.ts` (Wikimedia, 라이선스 검증, Actions) / 워크플로 `asset-fetch.yml`
- 설계: `docs/ASSET_AUTOMATION.md` (로고 3티어 + 사진 반자동 + 법적 가드레일)

## 지식
- `docs/ASSET_HUB.md` — 메타데이터 스키마, 라이선스 5분류, 사진 3순위, perishable 규칙
- 보유: 로고 5종(브랜드색), 국기 271종(MIT), 폰트 3종

## 학습 로그
| 날짜 | 배운 것 | 출처 |
|---|---|---|
| 07-18 | 웹 로고 자동수집 불가(프록시) → 컬러칩 폴백 + 수동 수집 체계 | 환경 제약 |
| 07-19 | 데이터셋은 raw와 달리 커밋 자산 — verified 없으면 사용 불가 | 조직 v2 |
| 07-19 | 로고 자동화 = 3티어(simple-icons 오프라인 → Wikimedia 무키·Actions → Brandfetch 키). 웹 직접 다운로드는 세션서 불가, Actions서 가능 | 오너 "로고 자동 확보" |
| 07-19 | 사진은 라이선스 안전소스(Unsplash·Wikimedia·공공누리)만, 관련성은 사람 확인 유지. 뉴스·출처불명 자동 차단 | 저작권 가드레일 |

**KPI**: 자산 재사용률, 카탈로그 무결성(CI 통과 유지) | **자동화**: 검증 R3, 수집 R0
