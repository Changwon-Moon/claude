# 이미지 자동취득 — "사진 요청 → 자동으로 카드에" 절차

> 오너 질문(2026-08-05): "어떤 이미지든 요청하면 자동으로 불러오게 세팅해줘."
> 원칙: **세션은 이미지 다운로드가 막혀 있다(프록시).** 취득은 항상 GitHub Actions(개방망)가 한다.
> 핵심: 세션은 **Run 버튼은 못 누르지만(api.github.com 403) push 는 된다.** 그래서 push 트리거로 자동화한다.

## 흐름 (사람이 버튼 안 눌러도 됨)

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

## 라이선스 게이트 (자동취득은 자유 라이선스만)

`fetch-photo.mjs` 는 **자유 라이선스만** 통과시킨다 — 무단 전재를 원천 차단(자산허브 규칙 §2).

- 통과: `public domain` · `CC0` · `CC-BY(-SA)` · **KOGL 제1유형(공공누리 1유형)**.
  - KOGL 제1유형은 2026-08-05 에 추가했다(정부·기관·국회 공개 사진 다수가 이 라이선스라, 안 넣으면 정치인·기관 사진이 통째로 걸러진다). 제2~4유형(상업·변형 제한)은 **불통과**.
- ⛔ 불통과: 언론사 사진, 라이선스 불명 → 자동취득 불가. 이때는 **오너가 파일을 직접 주면** 허브에 등록한다.
- 통과분도 catalog 에 저자·출처가 남고, 카드 하단 출처에 표기한다(KOGL·CC 는 출처표시 조건).

## 지금 매니페스트에 들어 있는 것

- `chumiae` (추미애) · `lee-jaemyung` (이재명) — Commons File 지정 완료(라이선스는 Actions 가 최종 판정).
- 김동연·남경필·김문수 — Commons 카테고리는 확인했으나 **자유 라이선스 File 을 아직 확정 못 함**.
  각 카테고리에서 CC/KOGL-1 File 을 골라 매니페스트 주석을 해제하면 자동취득된다.
  (Category:Kim Dong-yeon / Category:Nam Kyung-pil / Category:Kim Moon-soo)

## 정당 로고·기관 엠블럼은 다른 경로

- **정당 로고**: 상표라 위키미디어 자동취득(CC/PD/KOGL) 게이트에 안 걸린다 → 오너가 공식 로고 파일 제공 → 허브 등록.
  없으면 카드에서는 **정당색+명칭 칩**으로 대체(현행).
- **경기도 엠블럼 등 공개 SVG**: `svg-asset-fetch.yml`(공개 SVG 취득) 로 URL 지정해 받는다.
  예: `File:Emblem of Gyeonggi Province (2021).svg` → upload.wikimedia URL → `data/assets/gyeonggi/`.

## 실패했을 때

Actions 로그에 `FAILED: <slug>` 로 남는다(라이선스 비안전 또는 파일없음).
→ 다른 File 을 고르거나, 자유 라이선스가 없으면 **오너가 직접 업로드**(그 뒤부턴 자산으로 재사용).
