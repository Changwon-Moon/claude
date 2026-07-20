# 🗄️ 자료허브팀

**가치관**: 한 번 쓴 자료는 자산으로. 두 번째부터는 공짜다.
**책임**: 비주얼 자산(로고·국기·사진·지도) 카탈로그 관리, 데이터셋 캐시 운영, 라이선스 통제

## 도구 (구현됨)
- 무결성 검증기: `scripts/validate-assets.mjs` (CI 편입 — 미등록·라이선스 누락 자동 적발)
- 카탈로그: `templates/_shared/{logos,photos,maps,flags}/catalog.json`, `data/datasets/catalog.json`
- **로고 자동 해결기 A**: `scripts/lib/logo-resolver.mjs` (회사명→simple-icons, 오프라인·무키)
- **로고 자동 취득기 B**: `packages/collectors/src/sources/logoFetch.ts`+`logoCli.ts` (Wikimedia, 라이선스 검증, Actions) / 워크플로 `asset-fetch.yml`
- **로고 자동 취득기 C(구현·가동)**: `packages/collectors/src/sources/brandfetchLogo.ts` (Brandfetch Brand API, 도메인 후보 배열 순차 시도, 키=`BRANDFETCH_API_KEY`) — logoCli가 B 실패 시 C로 폴백. 평균연봉 카드 로고 **10/10 실로고 확보**(포스코인터·삼성바이오·HD한국조선 등)
- 로고 해결 우선순위: 허브(취득분 포함) → simple-icons → 모노그램. png/svg 확장자 모두 지원(`logoExt`)
- **수도권 전철 노선 뱃지 카탈로그(구현)**: `templates/_shared/metro-lines.json` — 공식 노선색+표기(번호 1~9, 명칭형 신분당·수인분당·경의중앙·공항철도·GTX-A/B/C·서해·신안산·경춘·김포골드·우이신설·인천1/2·경강). 렌더러 `metroBadge` 헬퍼가 wirit 스타일 원형 뱃지로 출력(밝은 노선색은 진한 글자로 가독성). 저작권 프리(색+숫자)
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
| 07-19 | **자동 취득 로고는 발행 전 반드시 눈으로 대조** — 오탐 실사례(삼성전자→SamsungApps 앱아이콘 오취득) 걸러냄 | 오너 검증 |
| 07-19 | Tier B는 큐레이션 회사만(한글명 slug 뭉개짐 방지), 이미 있으면 재취득 금지. 로고 png/svg 확장자 모두 지원(logoExt) | 자동취득 버그 수정 |
| 07-20 | **Tier C(Brandfetch) 가동**: 도메인 조회→Brand API. 도메인 후보를 배열로 여러 개 시도(1개 실패해도 다음 도메인). 결과: 초봉카드 대상 3개사(포스코인터·삼성바이오·HD한국조선) 전부 실로고 확보 → 카드 로고 완주 10/10 | 오너 요청(4·7·10위 로고 반영) |
| 07-20 | 회사명에서 뽑은 영문 slug(예: "HD한국조선해양"→"hd")가 지나치게 일반적이면 충돌 위험 — 취득 직후 사람이 slug 구체화(hd→hd-ksoe) | 눈 검증 |

**KPI**: 자산 재사용률, 카탈로그 무결성(CI 통과 유지) | **자동화**: 검증 R3, 수집 R0
