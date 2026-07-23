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

## 기본 업무 기준 (07-21 확정)
- **사진 자동 취득(다중 소스)**: `scripts/fetch-photo.mjs` + `photo-fetch.yml`(Actions). source=auto/pexels/pixabay/wikimedia, 키워드 검색→라이선스 확인→세로형 우선 다운로드→catalog 기록. 세션은 이미지 다운로드 차단이라 **Actions 전용**
- **무료 사진 소스·라이선스**: Pexels(상업OK·표기불요) · Pixabay(상업OK·표기불요) · Wikimedia(CC/PD, **CC BY-SA는 저작자 표기 필수**). 감성 커버엔 Pexels 우선
- 로고 3티어(simple-icons→Wikimedia→Brandfetch) + **수도권 노선 뱃지 카탈로그**(`metro-lines.json`)
- 모든 취득 자산은 catalog에 출처·라이선스·저자 기록(무결성 검사 CI)

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
| 07-20 | **사진 자동 취득 파이프라인 가동**: `scripts/fetch-wikimedia-photo.mjs` + `photo-fetch.yml`(Actions). Commons API로 라이선스·저자 확인 후 CC/PD만 다운로드→catalog 기록. 세션은 이미지 다운로드 차단이라 Actions 전용. 첫 취득: 종로3가역 플랫폼(CC BY-SA 4.0, ⓒLERK) | 오너 "사진 위키미디어에서 취득" |
| 07-20 | **CC BY-SA 사진은 저작자 표시 필수** → 카드에 "사진 ⓒ작가·CC BY-SA" 크레딧 노출(또는 캡션). SA(동일조건변경허락)도 준수 대상 | 라이선스 규정 |
| 07-22 | **공식 로고 SVG는 MediaWiki API로 실제 URL 해석 후 다운로드**(파일명 추측 URL은 404 남발). `action=query&titles=File:…&iiprop=url`→`upload.wikimedia` 직접 URL→curl·SVG검증·커밋. `svg-asset-fetch.yml` 신설. 서울 심볼마크(Logo of Seoul) 확보→디자인이 결정적 인라인 | 로고 취득 |
| 07-22 | **커버 사진**: `photo-fetch.yml`(Pexels) query 취득. '서울 아파트 야경'=`seoul-apart-night`(Pexels License·표기불요, ⓒEthan Brooke), 세로형이라 4:5 커버에 적합 | 커버 제작 |
| 07-22 | **워크플로 작성 주의**: Actions `run:` 블록 스칼라에 여러 줄 인라인 파이썬은 **들여쓰기 붕괴로 YAML 파손** → `jq` 한 줄로. 입력 목록에 콤마 포함 값(파일명)이 있으면 콤마 대신 `|` 구분자 | 취득 워크플로 디버깅 |
| 07-23 | **폰트는 OTF 직접 참조 금지 → WOFF2 변환 필수**: CFF+세로메트릭(vhea/vmtx) OTF는 Chromium OTS가 거부해 렌더에서 폴백됨. `scripts/font_pipeline.py`(opentype-sanitizer 정화·otf2ttf CFF→TTF)+`font-convert.yml`(Actions)로 **WOFF2 생성** 후 base.css 참조. 단일 웨이트는 @font-face `font-weight:100 900`으로 선언 | 태백체 도입 |
| 07-23 | **폰트 로딩 검증은 `file://` HTML을 goto**로(렌더러와 동일). `setContent`는 about:blank라 로컬 폰트/이미지 차단 → "font error"로 오판하기 쉬움 | 태백 로딩 디버깅 |
| 07-23 | **사진 다장 취득 모드**: `photo-fetch.yml` `count`>1 → `cand/<slug>-i.jpg` 여러 장 취득 → **눈검증 후 1장 승격**(정식 파일명+카탈로그 등록, cand/ 정리). 어떤 사진이 맞을지 미리보기 못 하는 세션 제약 우회 | 커버 사진 교체 |
| 07-23 | **커버 사진 = 추상·한국 우선, 외국어 텍스트/손·기기 없는 컷 선호**(일본 전광판 회피). 예 `stock-crash.jpg`(추상 캔들차트) | 오너 "한국·추상 주식 사진으로" |

**KPI**: 자산 재사용률, 카탈로그 무결성(CI 통과 유지) | **자동화**: 검증 R3, 수집 R0
