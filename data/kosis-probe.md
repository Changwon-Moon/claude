# KOSIS 표 검증 결과

> 표가 **진짜 우리가 생각한 그 표인지** 최근 1개 시점만 받아 확인한 것이다.
> 세션은 Actions 로그를 못 보므로 이 파일이 유일한 눈이다.
> **맞다고 확인되면 `packages/collectors/src/sources/kosis.ts` 의 `enabled` 를 켠다.**

| 표 | tblId | 결과 | 통계표명(응답) | 시군구코드 | 우리가 적어둔 확신도 |
|---|---|---|---|---|---|
| population | `DT_1B040A3` | ❌ | — | — | 확실 · 수집중 |
| households | `DT_1B040B3` | ❌ | — | — | 확실 · 수집중 |
| migration | `DT_1B26001_A01` | ❌ | — | — | 확실 · 수집중 |
| age | `DT_1B04006` | ❌ | — | — | 확실 · 수집중 |
| births | `DT_1B81A03` | ❌ | — | — | 확실 · 수집중 |
| deaths | `DT_1B34E13` | ❌ | — | — | 표명확실 · 대기 |

## population — 행정구역(시군구)별 성별 인구수

- tblId: `DT_1B040A3` · 주기 `M` · 우리가 뽑으려는 값: **인구**
- 메모: T20=총인구수 까지 실동작 사례로 확인. objL2=성별(계).
- ❌ **실패**: GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T20&objL1=ALL&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B040A3&objL2=ALL&objL3=ALL&objL4=ALL&newEstPrdCnt=1
fetch failed

**시도한 축 조합** — 다음 사람이 같은 것을 또 해보지 않도록

- objL2..1=(없음) → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..2=ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..3=ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..4=ALL,ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=

**분류축 메타(OBJ)** — `objL1`·`objL2`… 를 여기 코드로 채운다. 축이 여럿이면 행정구역이 아닌 축은 '계'를 고른다

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B040A3&type=OBJ&format=json&jsonVD=Y\nfetch failed"
}
```

**항목 메타(ITM)**

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B040A3&type=ITM&format=json&jsonVD=Y\nfetch failed"
}
```

## households — 행정구역(시군구)별 주민등록세대수

- tblId: `DT_1B040B3` · 주기 `M` · 우리가 뽑으려는 값: **세대수**
- 메모: probe 검증 완료(2026-08-03): 통계표명 일치 · T1=세대수 · 시군구 5자리 277개 · 202606. 세대당 인구는 이 표의 항목을 쓰지 않고 인구÷세대수로 우리가 계산한다(전용 항목이 없다).
- ❌ **실패**: GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=ALL&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B040B3&objL2=ALL&objL3=ALL&objL4=ALL&newEstPrdCnt=1
fetch failed

**시도한 축 조합** — 다음 사람이 같은 것을 또 해보지 않도록

- objL2..1=(없음) → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..2=ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..3=ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..4=ALL,ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=

**분류축 메타(OBJ)** — `objL1`·`objL2`… 를 여기 코드로 채운다. 축이 여럿이면 행정구역이 아닌 축은 '계'를 고른다

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B040B3&type=OBJ&format=json&jsonVD=Y\nfetch failed"
}
```

**항목 메타(ITM)**

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B040B3&type=ITM&format=json&jsonVD=Y\nfetch failed"
}
```

## migration — 시군구별 이동자수(국내인구이동)

- tblId: `DT_1B26001_A01` · 주기 `Y` · 우리가 뽑으려는 값: **이동**
- 메모: probe 검증 완료(2026-08-03): 통계표명 '시군구별 이동자수' · 시군구 5자리 254개 · 2025년. 항목 8개 확인 — T10=총전입 T20=총전출 T25=순이동 T30~T50=시도내외 분해. **T25(순이동) 하나만 받는다.** 파서(parse/kosis.ts)가 ITM_ID 를 구분하지 않아 여러 항목을 한꺼번에 받으면 한 지역에 값이 8개씩 겹쳐 시계열이 망가진다. 전입·전출 분해가 필요해지면 파서에 항목 축을 먼저 넣고 그 다음에 늘린다.
- ❌ **실패**: GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T25&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B26001_A01&objL2=ALL&objL3=ALL&objL4=ALL&newEstPrdCnt=1
fetch failed

**시도한 축 조합** — 다음 사람이 같은 것을 또 해보지 않도록

- objL2..1=(없음) → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..2=ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..3=ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..4=ALL,ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=

**분류축 메타(OBJ)** — `objL1`·`objL2`… 를 여기 코드로 채운다. 축이 여럿이면 행정구역이 아닌 축은 '계'를 고른다

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B26001_A01&type=OBJ&format=json&jsonVD=Y\nfetch failed"
}
```

**항목 메타(ITM)**

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B26001_A01&type=ITM&format=json&jsonVD=Y\nfetch failed"
}
```

## age — 행정구역(시군구)별/1세별 주민등록인구

- tblId: `DT_1B04006` · 주기 `M` · 우리가 뽑으려는 값: **고령인구**
- 메모: probe 로 축 확인(2026-08-03): C2=연령(000=계, 0401=0세, 0402=1세 …) · 항목 T2=총인구수/T3=남/T4=여. 코드 체계는 통계청(11110=종로구)이라 지도에 그대로 붙는다. **1세별 101개 × 전국이라 4만 셀 한도를 넘는다** → 지역을 나눠 부른다(cellsPerRegionPeriod). 축 전체 확인: C2 102개(000=계 · 0401=0세 … 440=100세 이상). **5세 묶음 코드는 없다** — 1세별뿐이다.
그래서 한 지역·한 시점에 102줄이 온다. 그대로 두면 시계열이 겹쳐 망가지므로 **derive: senior65 로 65세 이상을 합쳐 한 줄로 접는다**(비율이 아니라 명수). 연령 코드는 규칙이 없어(07 다음이 10, 44는 세 자리) 코드가 아니라 **이름의 숫자를 읽는다.**
- ❌ **실패**: GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T2&objL1=ALL&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B04006&objL2=ALL&objL3=ALL&objL4=ALL&newEstPrdCnt=1
fetch failed

**시도한 축 조합** — 다음 사람이 같은 것을 또 해보지 않도록

- objL2..1=(없음) → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..2=ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..3=ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..4=ALL,ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=

**분류축 메타(OBJ)** — `objL1`·`objL2`… 를 여기 코드로 채운다. 축이 여럿이면 행정구역이 아닌 축은 '계'를 고른다

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B04006&type=OBJ&format=json&jsonVD=Y\nfetch failed"
}
```

**항목 메타(ITM)**

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B04006&type=ITM&format=json&jsonVD=Y\nfetch failed"
}
```

## births — 시군구/성/출산순위별 출생

- tblId: `DT_1B81A03` · 주기 `Y` · 우리가 뽑으려는 값: **출생**
- 메모: probe 검증 완료(2026-08-03): 통계표명 일치 · 항목 T1=계(T2 남/T3 여) · 축 C2=출산순위(00=총계, 01=1아, 02=2아, 13=3아이상, 99=미상) → **00=총계만 받는다** · 2024년.
⚠️ **코드 체계가 다르다.** 종로구가 11010(인구표는 11110)이고 시도부터 겹친다 — 26=울산(인구표는 부산) · 29=세종(광주) · 31=경기(울산) · 36=전남(세종). 숫자로 조인하면 울산 출생아가 부산에 얹히고 지도는 예쁘게 그려진다. data/geo/kosis-region-map.json 대조표를 반드시 거친다(이름으로 묶었고 349/366 매칭, 미매칭 17개는 청원군·마산시 등 폐지된 행정구역).
- ❌ **실패**: GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B81A03&objL2=ALL&objL3=ALL&objL4=ALL&newEstPrdCnt=1
fetch failed

**시도한 축 조합** — 다음 사람이 같은 것을 또 해보지 않도록

- objL2..1=(없음) → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..2=ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..3=ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..4=ALL,ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=

**분류축 메타(OBJ)** — `objL1`·`objL2`… 를 여기 코드로 채운다. 축이 여럿이면 행정구역이 아닌 축은 '계'를 고른다

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B81A03&type=OBJ&format=json&jsonVD=Y\nfetch failed"
}
```

**항목 메타(ITM)**

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B81A03&type=ITM&format=json&jsonVD=Y\nfetch failed"
}
```

## deaths — 시군구/사망원인별 사망자수

- tblId: `DT_1B34E13` · 주기 `Y` · 우리가 뽑으려는 값: **사망**
- 메모: 사망원인통계(연간). 사망원인 분류축의 '계'를 뽑아야 총사망자수가 된다 — **축 구성 미확인이라 probe 없이 쓰면 특정 사인의 숫자를 총사망자수로 낼 위험이 있다.** 시군구 단위 순수 사망자수 전용표는 찾지 못했다.
- ❌ **실패**: GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B34E13&objL2=ALL&objL3=ALL&objL4=ALL&newEstPrdCnt=1
fetch failed

**시도한 축 조합** — 다음 사람이 같은 것을 또 해보지 않도록

- 표가 지정한 조합 objL=ALL,11,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..1=(없음) → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..2=ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..3=ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=
- objL2..4=ALL,ALL,ALL → GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=

**분류축 메타(OBJ)** — `objL1`·`objL2`… 를 여기 코드로 채운다. 축이 여럿이면 행정구역이 아닌 축은 '계'를 고른다

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B34E13&type=OBJ&format=json&jsonVD=Y\nfetch failed"
}
```

**항목 메타(ITM)**

```json
{
 "메타실패": "GET 실패(4회 시도): https://kosis.kr/openapi/statisticsData.do?method=getMeta&apiKey=***&orgId=101&tblId=DT_1B34E13&type=ITM&format=json&jsonVD=Y\nfetch failed"
}
```

---

⚠️ **이 파일을 보고 판단할 것**

1. 통계표명이 우리가 적어 둔 label 과 같은가 (다르면 표 ID 가 틀린 것이다)
2. 시군구 5자리 코드가 충분히 오는가 (0 이면 그 표로는 시군구 카드를 못 만든다)
3. 항목 중 우리가 원하는 것이 있는가 (총인구·세대수·총전입·총전출·출생아수·사망자수 '계')
4. 행정구역 말고 다른 축이 있으면 **'계'에 해당하는 코드**를 찾아 `objL2` 에 박아야 한다
