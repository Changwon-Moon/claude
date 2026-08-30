# 은퇴한 스크립트 — 되찾는 법

2026-08-30 에 **아무도 부르지 않는 스크립트 18개(2,006줄)**를 지웠다.
워크플로·`builders.json`·다른 코드·문서 어디에서도 참조되지 않는 것들이었다.

## 지웠다고 사라진 게 아니다

git 이 전부 보관한다. 삭제 직전 커밋이 **`385eae1`** 다.

```bash
# 하나 되살리기
git checkout 385eae1 -- scripts/build-dogam-card.mjs

# 내용만 보기(되살리지 않고)
git show 385eae1:scripts/build-dogam-card.mjs
```

> ⭐ 표시는 **되살릴 값어치가 있는 것**이다. 시리즈가 멈춰 있거나 진행 중 작업의 일부다.
> 되살릴 때는 스크립트만 꺼내면 안 되고 `data/review/builders.json` 에 한 줄을 넣어야
> 재생산 대상이 된다 — 안 넣으면 또 고아가 되고 실사이트에 안 뜬다.

## 목록

| 스크립트 | 마지막 수정 | 줄 | 무엇이었나 |
|---|---|--:|---|
| `scaffold-prompts.mjs` | 2026-07-19 | 72 | company/teams/*.md 의 가치관·책임을 시드로 prompts/{slug}.md 시스템 프롬프트 초안을 생성한다.<br>**생성 대상인 `prompts/` 폴더가 은퇴(→ `docs/archive/prompts/`). 만들 것이 없다** |
| `build-salary-card.mjs` | 2026-07-19 | 77 | data/datasets/salary-freshman-2026-07.json → data/content/2026-07-19/salary-freshman.json |
| `build-dogam-card.mjs` | 2026-07-21 | 62 | 시리즈 '대장 도감' — 구별 데이터셋(data/datasets/dogam-*.json) → 3장 캐러셀.<br>**⭐ **「대장 도감」 25편 시리즈 1화의 빌더.** 2화 이후를 만들려면 이걸 되살려 `builders.json` 에 등록해야 한다** |
| `build-gtx-a-card.mjs` | 2026-07-21 | 75 | 시리즈 '지하철이 온다' EP.1 — GTX-A.<br>**⭐ 「지하철이 온다」 EP.1 빌더. EP.2 를 만들려면 되살린다** |
| `build-index-cover.mjs` | 2026-07-23 | 30 | 국장 커버 — 시그니처 '1위(빨강·취소선) → 세계 꼴찌(블루·초대형)' 색 반전 타이포. |
| `build-tohuh-map.mjs` | 2026-07-25 | 188 | 경기 토허제 지도 — 토지거래허가구역(아파트) 지정 시·군·구 + 지정 직전 6개월 신고가 경신 건수.<br>**경기 토허제 지정 지도. 등록본은 `build-tohuh-rank`·`build-tohuh-rent-map` 이라 이건 미등록이었다** |
| `rent-table.mjs` | 2026-07-29 | 163 | 전월세 연도별 변화 표 — **지수와 실제 금액을 나란히** 놓는다. |
| `analyze-rent-index.mjs` | 2026-07-29 | 205 | 전세·월세 지수에서 **말이 되는 수치**를 뽑는다 (카드 만들기 전 단계). |
| `gu-rent-rank.mjs` | 2026-07-30 | 133 | 서울 25개 자치구 월세·전세 상승률 순위 — **카드용 확정 수치**. |
| `logo-check-sheet.mjs` | 2026-07-31 | 103 | 로고 대조표 — **붙이기 전에 오너가 눈으로 확인**하는 한 장. |
| `spike-jeongbi-pointmap.mjs` | 2026-07-31 | 155 | 🧪 실험 — 점 지도(사업지 위치 마커) 형태가 카드 안에서 성립하는가.<br>**점 지도 형태 실험(🧪). 결론 남** |
| `build-sinbundang-map.mjs` | 2026-07-31 | 55 | 신분당선 역세권 대장아파트 — 노선도형 지도 카드 1장. |
| `build-sinbundang-geomap.mjs` | 2026-08-01 | 49 | 신분당선 역세권 대장아파트 — 실좌표 노선지도 카드 1장(지도 래스터를 위릿 프레임에 얹음). |
| `apply-line-edits.mjs` | 2026-08-02 | 160 | 2026-08-02 오너 지시 — 4~8호선 역 추가/삭제/이름·단지 변경 일괄 반영.<br>**2026-08-02 오너 지시 일괄 반영용 **일회성**. 임무 완료** |
| `build-tax-1house.mjs` | 2026-08-03 | 100 | 주택 세제 카드 — 1세대 1주택자 편 4장 (2026 세제개편안 정부안). |
| `build-gangnam-tenure.mjs` | 2026-08-06 | 124 | 강남권 자가점유율 카드 — record-grid@1. |
| `list-bunyangkwon.mjs` | 2026-08-28 | 119 | 준공 전(=분양권이 거래되는) 단지 목록을 **코드가** 뽑는다.<br>**⭐ 분양권 파이프라인(2026-08-28)의 조사 도구. 그 작업을 이어가려면 되살린다** |
| `build-jeongbi-rank.mjs` | 2026-08-30 | 136 | 건설사 도시정비사업 누적 수주 순위 — ranking-table@1 재사용. |

## 왜 고아가 생겼나

카드를 만들 때 **빌더는 쓰고 `builders.json` 등록은 잊는** 일이 반복됐다.
등록을 안 하면 `rebuild-cards.mjs` 가 안 부르고, 실사이트에도 안 뜨고,
아무도 그 스크립트를 안 보게 된다 — 만든 사람도 다음 주면 잊는다.

`scripts/check-orphan-scripts.mjs` 를 신설해 **doctor 가 매번 센다.**
새 고아가 생기면 그 자리에서 보인다.
