# 🚇 지하철 노선 시세 카드 시리즈 — 제작 기준 (2026-08-01)

> 신분당·2~9호선 「역세권 34평 APT 시세」 카드 9종의 단일 기준.
> 새 노선을 추가하거나 기존 노선을 고칠 때 **이 문서 + `CARD_CHECKLIST.md` 를 먼저 읽는다.**

## 0. 한 줄 요약

각 노선의 대표 16개 역을 골라, 역별 **도보 10분 역세권 · 300세대 이상 단지 중 전용 84㎡(±2㎡) 매매 실거래 최고가(2026.01~07)** 를 U자(또는 순환 트랙) 노선도 위에 얹은 편집형 카드. 수치는 전부 국토부 실거래(molit 캐시)에서 **코드로 추출**한다(오보 0). LLM이 숫자를 지어내지 않는다.

## 1. 아키텍처 — 공용 렌더러 하나 + 얇은 설정 9개

- **`scripts/lib/wirit-line.mjs`** 가 SVG·카드·워터마크·환승뱃지·히트맵·구 칩을 전부 만든다. `renderLineCard(cfg)` 하나.
- 각 `scripts/build-{line}-loop.mjs` 는 **설정만** 넘긴다: `dsFile · template · color · form · capName · subtitle · title · XFER · DISP · GUC · (nameOnly)`.
- 전 노선 일괄 변경(워터마크·칩 스타일·뱃지 등)은 **라이브러리 한 곳만** 고치면 9종에 반영된다. 개별 빌더를 복붙 수정하지 않는다.
- 데이터셋 `data/datasets/{line}-daejang-2026.json`, 템플릿 `templates/{line}-loop/template.html`, 캡션 `data/review/captions/{line}-loop.txt`.

### form
- `caps` — 종단선(신분당·3~9호선). 상단 양끝 종점 캡(노선명) + 하단 U턴.
- `loop` — 순환선(2호선). 상·하단 U턴으로 닫고 상단 중앙에 노선명 필.

## 2. 데이터 — 오보 0

- 출처: 국토부 아파트 매매 실거래가 상세자료(getRTMSDataSvcAptTradeDev), `data/datasets/molit/{lawdCd}-{YYYYMM}.json` 캐시.
- **서울 밖(경기·인천)은 07월 미수집 → `data/collect-request.json` 을 고쳐 push** 하면 `collect-on-request.yml` 이 자동 수집한다(고양·과천·안양·군포·하남·성남 이렇게 수집함). 서울과 **2026.01~07 창을 통일**한다.
- 추출: `area 82~86`, `canceled=false` 필터 후 단지별 `priceManwon` 최댓값. 코드가 뽑고, 데이터셋 `picks[].price` 에 억 단위로 저장.
- 가격 표기 반올림은 **round-half-up** (부동소수점 과소표기 방지): `(Math.round((pr+1e-9)*10)/10).toFixed(1)`. 라이브러리가 처리.

## 3. 역·단지 선정 기준

1. 노선 전체 역 중 **대표 16개**만 큐레이션(역이 많으면 스킵). 좌열 8 + 우열 8, 노선 순서대로.
2. 서울 + **인접 수도권까지만**(고양·과천·안양·군포·하남·성남 등). 안산·인천 등 원거리는 제외.
3. 각 역: 도보 10분 역세권 + 300세대 이상 단지 중 84㎡ 최고가.
4. **중복 허용**(오너 지시): 반포·삼성·잠실 등 다른 노선과 겹치는 단지도 각 역 최고가면 그대로 쓴다. 단 "그 역 역세권·300세대↑"는 유지.
5. 조건 충족 단지가 없는 역은 **역명만 표기**(name-only). 데이터셋 `order` 에는 넣고 `picks` 에서 뺀 뒤, 빌더 config `nameOnly:{역:구}` 로 구를 준다. (예: 신분당 논현, 8호선 석촌)
6. 역세권·세대수 교차확인은 **코워크 세션 에이전트**가 클러스터별로 한다(호갱노노·리치고·KB·집품·나무위키 등). 판정·경계건은 데이터셋 `meta.flags` 에 남긴다.

## 4. 디자인 기준 (오너 지시 이력)

- **제목** 항상 폭 꽉 채움(`__wiritFit`). 부제목은 전 노선 **동일**: `국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준`.
- **단지명 줄바꿈은 단어(동네·건설사·브랜드) 단위** — `word-break: keep-all` + 빌더 DISP 의 ZWSP(`​`). 음절 중간 끊김 금지. (`CARD_CHECKLIST.md §4` 참조)
- **역명/단지/가격만** 크게(세대수·연식은 데이터셋 보관용, 카드 비표시). 단지명 필요시 2줄, `min-height:69px` 로 큰 가격(60억대)과 겹침 방지.
- **행정구역(구) 칩**: 색은 유지하되 투명도↑(`rgba …,0.16`) 연하게 + 글자 잉크(#141821). 시선 안 뺏게.
- **'최고가' 뱃지 없음**(삭제). 노선 내 최댓값은 가격 글자 색으로만 은은히.
- **@wirit_note 워터마크**: 중앙 채널에 가로 2곳(위·아래), font 30, `fill-opacity 0.09`.
- 히트맵: 단지 카드 배경을 노선색 rgba 로 가격에 비례해 농도(연함→진함). 선형.
- 색: 각 노선 공식색. 9호선은 가독 위해 rail `#C8A415`.

## 5. 예정·고속철도 환승 뱃지 (EXP)

라이브러리 `EXP` 맵에 정의, 빌더 XFER 에서 참조. 실제 정차역만 표기.

| 뱃지 | 반영 역(카드 기준) |
|---|---|
| GTX-A | 2호선 삼성 · 3호선 연신내·수서 |
| GTX-B | 5·9호선 여의도 · 7호선 상봉 |
| GTX-C | 신분당 양재 · 2호선 삼성 · 4호선 창동·인덕원·금정 |
| 월판(월곶판교) | 신분당 판교 · 4호선 인덕원 |
| 인동(인덕원동탄) | 4호선 인덕원 |
| 대홍(대장홍대) | 9호선 가양 |
| 신안산 | 5·9호선 여의도 · 7호선 신풍 |
| SRT | 3호선 수서 |
| 동북선 | 2호선 왕십리 · 4호선 미아사거리 · 6호선 고려대 |

- **뺀 것**: GTX-D(노선 미확정), 서부선·위례신사선(오너 지시로 제외), 강북횡단선(사업 보류).
- 한 역에 여러 개면 중앙 채널에 세로 스택(4개↑면 간격 축소). 텍스트 뱃지는 compact pill.

## 6. 캡션 포맷

`data/review/captions/{line}-loop.txt`, 데이터셋에서 코드 생성(가격 내림차순).

```
{노선} 역세권,
대장 APT 지금 얼마일까요? 🚇

📊 시세 순위 (전용 84㎡ 실거래 최고가)
1위. {역}역 : {가격}억 - {단지}({연식}년식)
...

저장해두고 확인해보세요 👀

—
📊 출처 · 국토부 실거래가
(2026년 1~7월 · 전용 84㎡)

· · ·
부동산·경제·트렌드를 한 눈에, 위릿.
정확한 데이터, 감각적인 카드.
매일 한 장, 내 맘속에 저장. 🫶

#{노선} #역세권 #대장아파트 #아파트시세 #부동산
```

- name-only 역(시세 없음)은 순위에서 제외 → 신분당·8호선은 15위까지.
- 해시태그 5개(첫 태그 = 노선명).

## 7. 새 노선 추가 절차

1. 대표 16개 역 큐레이션(위 §3). 필요 lawdCd 의 07월 없으면 `collect-request.json` push 수집.
2. 클러스터별 에이전트로 역별 대장 단지 선정·교차확인.
3. 코드로 84㎡ 최고가 추출 → `data/datasets/{line}-daejang-2026.json` (order·picks[station,gu,danji,umd,built,price,deal,note,(srcApt)]·meta.flags). 데이터셋 완성 후 `node scripts/enrich-line-src.mjs` 로 각 pick 에 molit 원본 키(umd·srcApt)를 심어 리프레시 자동매칭을 100%로 만든다(미해결로 뜨는 건만 손으로 확인).
4. `scripts/build-{line}-loop.mjs`(설정만) + `templates/{line}-loop/template.html`(line4 복사, 색만 변경).
5. `node scripts/build-{line}-loop.mjs` → 렌더 → `designQa` 에러 0 → 에이전트 검수.
6. `data/review/builders.json`·`sets.json`·캡션 등록.
7. 시안 전달 → 오너 확정 시 `confirm.mjs`.

## 8. 데이터 리프레시 (원할 때)

단지 선정은 데이터셋에 고정 → 갱신은 **같은 단지의 최고가만 다시 뽑는 일**. 3단계.

```bash
# ① 새 기간 molit 수집(서울 밖 포함). 구 목록 자동.
node scripts/refresh-line-cards.mjs --collect 202608
git add data/collect-request.json && git commit -m "수집: 202608" && git push ...   # Action 수집
git pull ...                                                                        # 캐시 받기

# ② 같은 단지 최고가 재추출 + 재빌드
node scripts/refresh-line-cards.mjs --to 202608     # 정확매칭(aptNm+umd)만 자동 갱신, 나머지는 표시

# ③ 캡션 재생성
node scripts/gen-line-captions.mjs
```

- 그 뒤 렌더·`designQa`·검수 → `confirm.mjs` 로 확정.
- **자동매칭 100%**: 각 pick 에 molit 원본 키(`umd`·이름 다르면 `srcApt`)를 1회 보강해 심어뒀다(`scripts/enrich-line-src.mjs`). 그래서 리프레시는 `${srcApt||danji}|${umd}` 정확 매칭으로 **미해결 0건**이다(예: 신사→`신동아(22)`, 옥수파크힐스, 성복→`성복역롯데캐슬골드타운`, 복정→`위례 래미안이편한세상`, 수지구청→`신정7단지(상록)공무원`). 새 pick 을 추가하면 `enrich-line-src.mjs` 를 다시 돌리고, 가격이 안 맞아 미해결로 뜨는 건만 molit 을 찾아 `srcApt`/`umd` 를 손으로 심는다.
- 점검만 하려면 `node scripts/refresh-line-cards.mjs --to 202608 --dry`(데이터셋 미기록).
- **기간 라벨**(빌더 subtitle `2026.01~07월`·데이터셋 disclaimer)은 창을 넓혔으면 함께 수정한다.

## 9. 원커맨드 — "N호선 시세 작업해줘" (권장 경로)

오너가 **"3호선 역세권 대장 아파트 시세 작업해줘"** 라고 하면, 새 세션은 이것 하나만 돌린다:

```bash
node scripts/line-card.mjs 3호선          # 문장/별칭 허용: "3호선 역세권 대장 아파트 시세", "신분당"
node scripts/line-card.mjs 5호선 --no-render   # JSON 까지만
node scripts/line-card.mjs 5호선 --collect 202608   # 새 달 수집부터(→ push→pull 후 --collect 없이 재실행)
```

`line-card.mjs` 가 순서대로: **① 리프레시(--only, 정확매칭) → ② 캡션 재생성 → ③ 카드 빌드 → ④ 렌더(PNG) → ⑤ designQa**. 자연어에서 노선 키를 뽑고(신분당/2~9호선), 데이터셋이 없으면 §7 절차를 안내하며 멈춘다. 결과 PNG·캡션을 오너에게 보여주고 **확정 시 `confirm.mjs`**. CLAUDE.md 상단 트리거 절이 이 경로를 가리킨다.
