# KOSIS 표 검증 결과

> 표가 **진짜 우리가 생각한 그 표인지** 최근 1개 시점만 받아 확인한 것이다.
> 세션은 Actions 로그를 못 보므로 이 파일이 유일한 눈이다.
> **맞다고 확인되면 `packages/collectors/src/sources/kosis.ts` 의 `enabled` 를 켠다.**

| 표 | tblId | 결과 | 통계표명(응답) | 시군구코드 | 우리가 적어둔 확신도 |
|---|---|---|---|---|---|
| population | `DT_1B040A3` | ✅ | 행정구역(시군구)별 성별 인구수 | 277개 | 확실 · 수집중 |
| households | `DT_1B040B3` | ✅ | 행정구역(시군구)별 주민등록세대수 | 277개 | 확실 · 수집중 |
| migration | `DT_1B26001_A01` | ✅ | 시군구별 이동자수 | 254개 | 확실 · 수집중 |
| age | `DT_1B04006` | ✅ | 행정구역(시군구)별/1세별 주민등록인구 | 1개 | 표명확실 · 대기 |
| births | `DT_1B81A03` | ✅ | 시군구/성/출산순위별 출생 | 366개 | 표명확실 · 대기 |
| deaths | `DT_1B34E13` | ❌ | — | — | 표명확실 · 대기 |

## population — 행정구역(시군구)별 성별 인구수

- tblId: `DT_1B040A3` · 주기 `M` · 우리가 뽑으려는 값: **인구**
- 메모: T20=총인구수 까지 실동작 사례로 확인. objL2=성별(계).
- 시점: 202606
- **행정구역 외 축 0개** (행정구역 축 하나뿐 — 그대로 써도 된다)
- **시군구(5자리) 코드 277개** 

**항목(itmId)** — 우리가 뽑을 항목을 여기서 고른다

- `T20=총인구수`

**분류축** — 행정구역이 아닌 축(성별·연령·사망원인 등)은 '계'를 골라야 한다

- `C1`: 00=전국 · 11=서울특별시 · 11110=종로구 · 11140=중구 · 11170=용산구 · 11200=성동구

<details><summary>응답 한 행 원본</summary>

```json
{
  "C1_OBJ_NM": "행정구역(시군구)별",
  "DT": "51091769",
  "C1": "00",
  "PRD_SE": "M",
  "UNIT_NM_ENG": "Person",
  "ITM_ID": "T20",
  "TBL_ID": "DT_1B040A3",
  "ITM_NM": "총인구수",
  "TBL_NM": "행정구역(시군구)별 성별 인구수",
  "PRD_DE": "202606",
  "LST_CHN_DE": "2026-07-02",
  "C1_NM_ENG": "Whole country",
  "C1_NM": "전국",
  "UNIT_NM": "명",
  "ITM_NM_ENG": "Koreans (Total)",
  "ORG_ID": "101",
  "C1_OBJ_NM_ENG": "By Administrative District"
}
```

</details>

## households — 행정구역(시군구)별 주민등록세대수

- tblId: `DT_1B040B3` · 주기 `M` · 우리가 뽑으려는 값: **세대수**
- 메모: probe 검증 완료(2026-08-03): 통계표명 일치 · T1=세대수 · 시군구 5자리 277개 · 202606. 세대당 인구는 이 표의 항목을 쓰지 않고 인구÷세대수로 우리가 계산한다(전용 항목이 없다).
- 시점: 202606
- **행정구역 외 축 0개** (행정구역 축 하나뿐 — 그대로 써도 된다)
- **시군구(5자리) 코드 277개** 

**항목(itmId)** — 우리가 뽑을 항목을 여기서 고른다

- `T1=세대수`

**분류축** — 행정구역이 아닌 축(성별·연령·사망원인 등)은 '계'를 골라야 한다

- `C1`: 00=전국 · 11=서울특별시 · 11110=종로구 · 11140=중구 · 11170=용산구 · 11200=성동구

<details><summary>응답 한 행 원본</summary>

```json
{
  "C1_OBJ_NM": "행정구역(시군구)별",
  "DT": "24471834",
  "C1": "00",
  "PRD_SE": "M",
  "UNIT_NM_ENG": "Household",
  "ITM_ID": "T1",
  "TBL_ID": "DT_1B040B3",
  "ITM_NM": "세대수",
  "TBL_NM": "행정구역(시군구)별 주민등록세대수",
  "PRD_DE": "202606",
  "LST_CHN_DE": "2026-07-02",
  "C1_NM_ENG": "Whole country",
  "C1_NM": "전국",
  "UNIT_NM": "세대",
  "ITM_NM_ENG": "Household",
  "ORG_ID": "101",
  "C1_OBJ_NM_ENG": "By Administrative District"
}
```

</details>

## migration — 시군구별 이동자수(국내인구이동)

- tblId: `DT_1B26001_A01` · 주기 `Y` · 우리가 뽑으려는 값: **이동**
- 메모: probe 검증 완료(2026-08-03): 통계표명 '시군구별 이동자수' · 시군구 5자리 254개 · 2025년. 항목 8개 확인 — T10=총전입 T20=총전출 T25=순이동 T30~T50=시도내외 분해. **T25(순이동) 하나만 받는다.** 파서(parse/kosis.ts)가 ITM_ID 를 구분하지 않아 여러 항목을 한꺼번에 받으면 한 지역에 값이 8개씩 겹쳐 시계열이 망가진다. 전입·전출 분해가 필요해지면 파서에 항목 축을 먼저 넣고 그 다음에 늘린다.
- 시점: 2025
- **행정구역 외 축 0개** (행정구역 축 하나뿐 — 그대로 써도 된다)
- **시군구(5자리) 코드 254개** 

**항목(itmId)** — 우리가 뽑을 항목을 여기서 고른다

- `T25=순이동`

**분류축** — 행정구역이 아닌 축(성별·연령·사망원인 등)은 '계'를 골라야 한다

- `C1`: 00=전국 · 11=서울특별시 · 11110=종로구 · 11140=중구 · 11170=용산구 · 11200=성동구

<details><summary>응답 한 행 원본</summary>

```json
{
  "C1_OBJ_NM": "행정구역(시군구)별",
  "DT": "0",
  "C1": "00",
  "PRD_SE": "A",
  "UNIT_NM_ENG": "Person",
  "ITM_ID": "T25",
  "TBL_ID": "DT_1B26001_A01",
  "ITM_NM": "순이동",
  "TBL_NM": "시군구별 이동자수",
  "PRD_DE": "2025",
  "LST_CHN_DE": "2026-01-18",
  "C1_NM_ENG": "Whole Country",
  "C1_NM": "전국",
  "UNIT_NM": "명",
  "ITM_NM_ENG": "Netmigration(Administrative reports)",
  "ORG_ID": "101",
  "C1_OBJ_NM_ENG": "By administrative divisions(si gun gu)"
}
```

</details>

## age — 행정구역(시군구)별/1세별 주민등록인구

- tblId: `DT_1B04006` · 주기 `M` · 우리가 뽑으려는 값: **연령**
- 메모: 1세 단위 원자료 → 65세이상 비율·중위연령을 우리가 직접 계산한다(지표표를 받아 적지 않는다). **분류축·항목코드·주기 미확인** → probe 로 확정. 응답이 크므로 확정 뒤 축을 좁힌다.
- 시점: 202606
- **행정구역 외 축 1개** — 아래 분류축에서 '계'에 해당하는 코드를 골라 박아야 한다
- **시군구(5자리) 코드 1개** 

**항목(itmId)** — 우리가 뽑을 항목을 여기서 고른다

- `T2=총인구수`
- `T3=남자인구수`
- `T4=여자인구수`

**분류축** — 행정구역이 아닌 축(성별·연령·사망원인 등)은 '계'를 골라야 한다

- `C1`: 11110=종로구
- `C2`: 000=계 · 0401=0세 · 0402=1세 · 0403=2세 · 0404=3세 · 0405=4세

<details><summary>응답 한 행 원본</summary>

```json
{
  "C1_OBJ_NM": "행정구역(시군구)별",
  "C2_NM": "계",
  "DT": "136318",
  "C2": "000",
  "C1": "11110",
  "PRD_SE": "M",
  "UNIT_NM_ENG": "Person",
  "ITM_ID": "T2",
  "TBL_ID": "DT_1B04006",
  "ITM_NM": "총인구수",
  "TBL_NM": "행정구역(시군구)별/1세별 주민등록인구",
  "PRD_DE": "202606",
  "LST_CHN_DE": "2026-07-02",
  "C1_NM_ENG": "Jongno-gu",
  "C1_NM": "종로구",
  "UNIT_NM": "명",
  "ITM_NM_ENG": "Population",
  "ORG_ID": "101",
  "C1_OBJ_NM_ENG": "By Administrative District",
  "C2_OBJ_NM": "연령별"
}
```

</details>

## births — 시군구/성/출산순위별 출생

- tblId: `DT_1B81A03` · 주기 `Y` · 우리가 뽑으려는 값: **출생**
- 메모: 인구동향조사(연간). **분류축·항목코드 미확인.** 월간 인구동향표(DT_1B8000G)는 시군구까지 내려가는지 확인 못 해 쓰지 않는다.
- 시점: 2024
- **행정구역 외 축 1개** — 아래 분류축에서 '계'에 해당하는 코드를 골라 박아야 한다
- **시군구(5자리) 코드 366개** 

**항목(itmId)** — 우리가 뽑을 항목을 여기서 고른다

- `T1=계`
- `T2=남자`
- `T3=여자`

**분류축** — 행정구역이 아닌 축(성별·연령·사망원인 등)은 '계'를 골라야 한다

- `C1`: 00=전국 · 11=서울특별시 · 11010=종로구 · 11020=중구 · 11030=용산구 · 11040=성동구
- `C2`: 00=총계 · 01=1아 · 02=2아 · 13=3아 이상 · 99=미상

<details><summary>응답 한 행 원본</summary>

```json
{
  "C1_OBJ_NM": "시군구별",
  "C2_NM": "총계",
  "DT": "238317",
  "C2": "00",
  "C1": "00",
  "PRD_SE": "A",
  "UNIT_NM_ENG": "Person",
  "ITM_ID": "T1",
  "TBL_ID": "DT_1B81A03",
  "ITM_NM": "계",
  "TBL_NM": "시군구/성/출산순위별 출생",
  "PRD_DE": "2024",
  "LST_CHN_DE": "2025-08-23",
  "C1_NM_ENG": "Whole country",
  "C1_NM": "전국",
  "UNIT_NM": "명",
  "ITM_NM_ENG": "Total",
  "C2_OBJ_NM_ENG": "By birth order",
  "C2_NM_ENG": "Total",
  "ORG_ID": "101",
  "C1_OBJ_NM_ENG": "By si(city) gun(county) and gu(borough)   ",
  "C2_OBJ_NM": "출산순위별"
}
```

</details>

## deaths — 시군구/사망원인별 사망자수

- tblId: `DT_1B34E13` · 주기 `Y` · 우리가 뽑으려는 값: **사망**
- 메모: 사망원인통계(연간). 사망원인 분류축의 '계'를 뽑아야 총사망자수가 된다 — **축 구성 미확인이라 probe 없이 쓰면 특정 사인의 숫자를 총사망자수로 낼 위험이 있다.** 시군구 단위 순수 사망자수 전용표는 찾지 못했다.
- ❌ **실패**: KOSIS API 오류(deaths):  40,000셀을 초과한 결과값은 요청하실 수 없습니다.

**시도한 축 조합** — 다음 사람이 같은 것을 또 해보지 않도록

- objL2..1=(없음) → KOSIS API 오류(deaths): 필수요청변수값이 누락되었습니다. (objL)
- objL2..2=ALL → KOSIS API 오류(deaths):  40,000셀을 초과한 결과값은 요청하실 수 없습니다.
- objL1=11110 + objL2..2=ALL → KOSIS API 오류(deaths): 잘못된 요청 변수를 호출 하였습니다.
- objL1=11110 + objL2..3=ALL → KOSIS API 오류(deaths): 잘못된 요청 변수를 호출 하였습니다.

**분류축 메타(OBJ)** — `objL1`·`objL2`… 를 여기 코드로 채운다. 축이 여럿이면 행정구역이 아닌 축은 '계'를 고른다

```json
{
 "메타실패": "KOSIS 메타 오류(deaths/OBJ): 데이터가 존재하지 않습니다."
}
```

**항목 메타(ITM)**

```json
[
 {
  "UNIT_ID": "14STD04553",
  "OBJ_NM_ENG": "Item code list",
  "UNIT_NM": "명",
  "ITM_NM_ENG": "Deaths",
  "ITM_ID": "T1",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "항목",
  "UNIT_ENG_NM": "Person",
  "ITM_NM": "사망자수",
  "ORG_ID": "101",
  "OBJ_ID": "ITEM"
 },
 {
  "UNIT_ID": "14STD05392",
  "OBJ_NM_ENG": "Item code list",
  "UNIT_NM": "십만명당",
  "ITM_NM_ENG": "mortality rate",
  "ITM_ID": "T4",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "항목",
  "UNIT_ENG_NM": "per 100 thousand person",
  "ITM_NM": "사망률",
  "ORG_ID": "101",
  "OBJ_ID": "ITEM"
 },
 {
  "UNIT_ID": "14STD05392",
  "OBJ_NM_ENG": "Item code list",
  "UNIT_NM": "십만명당",
  "ITM_NM_ENG": "Age-standardized death rate",
  "ITM_ID": "T7",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "항목",
  "UNIT_ENG_NM": "per 100 thousand person",
  "ITM_NM": "연령표준화 사망률",
  "ORG_ID": "101",
  "OBJ_ID": "ITEM"
 },
 {
  "OBJ_NM_ENG": "By the cause of death(50 items)",
  "ITM_NM_ENG": "Total",
  "ITM_ID": "0",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "사망원인별(50항목)",
  "ITM_NM": "계",
  "ORG_ID": "101",
  "OBJ_ID_SN": "1",
  "OBJ_ID": "A"
 },
 {
  "OBJ_NM_ENG": "By the cause of death(50 items)",
  "ITM_NM_ENG": "Certain infectious and parasitic diseases (A00-B99 U07.1 U07.2 U10)",
  "ITM_ID": "1",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "사망원인별(50항목)",
  "ITM_NM": "특정 감염성 및 기생충성 질환 (A00-B99 U07.1 U07.2 U10)",
  "ORG_ID": "101",
  "OBJ_ID_SN": "1",
  "OBJ_ID": "A"
 },
 {
  "OBJ_NM_ENG": "By the cause of death(50 items)",
  "UP_ITM_ID": "1",
  "ITM_NM_ENG": "Respiratory tuberculosis (A15-A16)",
  "ITM_ID": "11",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "사망원인별(50항목)",
  "ITM_NM": "호흡기 결핵 (A15-A16)",
  "ORG_ID": "101",
  "OBJ_ID_SN": "1",
  "OBJ_ID": "A"
 },
 {
  "OBJ_NM_ENG": "By the cause of death(50 items)",
  "UP_ITM_ID": "1",
  "ITM_NM_ENG": "Septicaemia (A40-A41)",
  "ITM_ID": "12",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "사망원인별(50항목)",
  "ITM_NM": "패혈증 (A40-A41)",
  "ORG_ID": "101",
  "OBJ_ID_SN": "1",
  "OBJ_ID": "A"
 },
 {
  "OBJ_NM_ENG": "By the cause of death(50 items)",
  "ITM_NM_ENG": "Neoplasms (C00-D48)",
  "ITM_ID": "2",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "사망원인별(50항목)",
  "ITM_NM": "신생물 (C00-D48)",
  "ORG_ID": "101",
  "OBJ_ID_SN": "1",
  "OBJ_ID": "A"
 },
 {
  "OBJ_NM_ENG": "By the cause of death(50 items)",
  "UP_ITM_ID": "2",
  "ITM_NM_ENG": "Malignant neoplasms (C00-C97)",
  "ITM_ID": "20",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "사망원인별(50항목)",
  "ITM_NM": "악성신생물(암) (C00-C97)",
  "ORG_ID": "101",
  "OBJ_ID_SN": "1",
  "OBJ_ID": "A"
 },
 {
  "OBJ_NM_ENG": "By the cause of death(50 items)",
  "UP_ITM_ID": "2",
  "ITM_NM_ENG": "Malignant neoplasm of oesophagus (C15)",
  "ITM_ID": "21",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "사망원인별(50항목)",
  "ITM_NM": "식도의 악성신생물 (C15)",
  "ORG_ID": "101",
  "OBJ_ID_SN": "1",
  "OBJ_ID": "A"
 },
 {
  "OBJ_NM_ENG": "By the cause of death(50 items)",
  "UP_ITM_ID": "2",
  "ITM_NM_ENG": "Malignant neoplasm of stomach (C16)",
  "ITM_ID": "22",
  "TBL_ID": "DT_1B34E13",
  "OBJ_NM": "사망원인별(50항목)",

```

---

⚠️ **이 파일을 보고 판단할 것**

1. 통계표명이 우리가 적어 둔 label 과 같은가 (다르면 표 ID 가 틀린 것이다)
2. 시군구 5자리 코드가 충분히 오는가 (0 이면 그 표로는 시군구 카드를 못 만든다)
3. 항목 중 우리가 원하는 것이 있는가 (총인구·세대수·총전입·총전출·출생아수·사망자수 '계')
4. 행정구역 말고 다른 축이 있으면 **'계'에 해당하는 코드**를 찾아 `objL2` 에 박아야 한다
