# 자산 자동취득 — 로고·사진을 "요청하면 자동으로 카드에"

> 오너 질문(2026-08-05): "어떤 이미지든 요청하면 자동으로 불러오게 세팅해줘."
> 원칙: **세션은 이미지 다운로드가 막혀 있다(프록시).** 취득은 항상 GitHub Actions(개방망)가 한다.
> 세션은 **Run 버튼은 못 누르지만(api.github.com 403) push 는 된다.** 그래서 push 트리거로 자동화한다.
>
> 자산의 **등록·카탈로그·라이선스 분류 규칙은 [ASSET_HUB.md](./ASSET_HUB.md)가 정본**이다. 이 문서는 "어떻게 자동으로 가져오나"만 다룬다.

## 사진 — 흐름 (사람이 버튼 안 눌러도 됨)

1. 이미지가 필요하면 위릿(세션)이 **`data/photo-batch.tsv` 에 한 줄 추가**하고 push 한다.
   ```
   slug<TAB>source<TAB>title_or_query
   예)  chumiae   wikimedia   File:Choo Mi-ae (Chopped).png
   ```
2. push 되면 **`.github/workflows/photo-batch.yml` 이 자동 실행** → 매니페스트를 읽어
   `scripts/fetch-photo.mjs` 로 취득 → `templates/_shared/photos/<slug>.jpg` 저장 +
   `photos/catalog.json` 에 출처·라이선스 기록 → 봇이 커밋·push.
3. 세션은 `git pull` 로 받아 카드 JSON 에 `figure.photo` / `predecessors[].photo = "<slug>.jpg"` 만 지정.
   - 봇 커밋은 `photos/` 만 건드리므로 매니페스트 paths 필터에 안 걸려 **재실행 루프가 없다.**

## 로고 — 3단계 자동 해결기 (거의 무개입)

| 티어 | 소스 | 키 | 어디서 | 커버리지 |
|---|---|---|---|---|
| **A** | **simple-icons** (npm) | 불필요 | 이 세션·Actions 어디서나 | 글로벌·대형 소비 브랜드(현대·기아·삼성·LG·네이버·카카오…) |
| **B** | **Wikimedia Commons** API | 불필요 | Actions | 한국 대기업 상당수(SK하이닉스·한화·포스코·HMM·삼성바이오·HD현대 등) — 라이선스 태그 있는 파일만 |
| **C** | Brandfetch/Clearbit (도메인→로고) | 무료키 1개 | Actions | B에서 빠진 잔여(웹사이트 있는 거의 모든 회사) |
| 사람 | 오너가 파일 업로드 | — | — | 잔여 극소수 |

- **A**: `scripts/lib/logo-resolver.mjs` — 회사명→simple-icons 매칭→`_shared/logos/{slug}.svg` 생성+카탈로그.
- **B**: `packages/collectors/src/sources/logoFetch.ts` + `logoCli.ts` — 검색→최적 파일 선택→라이선스 안전성 검사→다운로드→카탈로그 기록. 워크플로 `.github/workflows/asset-fetch.yml`.
- **법적**: 로고는 상표. 사실 식별용 **nominative use**는 허용. Commons 라이선스 태그를 그대로 기록해 근거를 남긴다.

## 라이선스 게이트 (자동취득은 자유 라이선스만)

취득 스크립트는 **자유 라이선스만** 통과시킨다 — 무단 전재를 원천 차단. **분류 정의는 `ASSET_HUB.md`가 정본**이고, 여기선 통과/불통과만 요약한다.

- 통과: `public domain` · `CC0` · `CC-BY(-SA)` · **KOGL 제1유형(공공누리 1유형)**.
  - KOGL 제1유형은 2026-08-05 추가(정부·기관·국회 공개 사진 다수가 이 라이선스). 제2~4유형은 **불통과**.
- ⛔ 불통과: 언론사 사진, 라이선스 불명 → 자동취득 불가. 이때는 **오너가 파일을 직접 주면** 허브에 등록한다.
- 통과분도 catalog 에 저자·출처가 남고, 카드 하단 출처에 표기한다(KOGL·CC 는 출처표시 조건).

## 정당 로고·기관 엠블럼은 다른 경로

- **정당 로고**: 상표라 위키미디어 자동취득 게이트에 안 걸린다 → 오너가 공식 로고 파일 제공 → 허브 등록. 없으면 **정당색+명칭 칩**으로 대체(현행).
- **공개 SVG(경기도 엠블럼 등)**: `svg-asset-fetch.yml` 로 URL 지정해 받는다. 예: `File:Emblem of Gyeonggi Province (2021).svg` → `data/assets/gyeonggi/`.

## 배경 — 왜 세션은 못 긁나 · 자동화 수위

이 세션의 아웃바운드는 **정책 프록시**를 거친다. npm·pypi 등 패키지 레지스트리와 Anthropic만 허용되고, 일반 웹/구글/위키미디어 이미지 다운로드는 403 차단이다(WebFetch는 텍스트만). **유일하게 되는 자동 소스 = npm 패키지(simple-icons) + 오너가 올린 파일.** 그래서 진짜 취득은 네트워크가 열린 GitHub Actions에서 돌린다.

자동화 수위: **로고 R2~R3**(소싱이 결정적·법적으로 깨끗 → 거의 무인, 잔여만 사람) · **범용 스톡 사진 R1~R2**(자동 후보 → 사람이 택1) · **특정 실물 사진 R0~R1**(저작권 위험 커 오너 제공/승인). 범용 스톡은 Unsplash·Pexels·Pixabay(무료 키), 공공 이미지는 공공누리, 랜드마크는 Wikimedia.

## 실패했을 때

Actions 로그에 `FAILED: <slug>` 로 남는다(라이선스 비안전 또는 파일없음).
→ 다른 File 을 고르거나, 자유 라이선스가 없으면 **오너가 직접 업로드**(그 뒤부턴 자산으로 재사용).
