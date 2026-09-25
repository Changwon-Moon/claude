# 분양권전매 API — 수집 보고

- 실행: 2026-09-25
- 결과: 수집 6 · 스킵 0 · 실패 0 · 유효거래 4건

- 표본: 광진구 202608
- 구분 집계: 분양권 0 · 입주권 0 · 미상 4
- 태그 판정: 🔴 구분 칸을 **하나도 못 읽었다** — 태그 이름이 틀렸다. 아래 원본에서 실제 이름을 찾아 parse/silv.ts 의 toKind 후보에 넣을 것

> 이 대조표가 있는 이유: 세션 컨테이너는 data.go.kr 이 막혀 있어 이 API 를 한 번도
> 직접 불러 본 적이 없다. 파서의 태그 이름은 **유추로 시작했고 실제로 한 번 틀렸다**
> (2026-08-28: `dealTypeNm` 을 찾았는데 실제 칸은 `ownershipGbn` 이었다).
> 그래서 무엇이 왔는지를 코드가 아니라 **응답이** 말하게 한다.

## 구분 칸에 실제로 들어온 값

| 원값 | 건수 |
|---|---|
| `입` | 2 |
| `(빈칸)` | 2 |

## 응답에 있던 태그 이름 전부

```
aptNm · buyerGbn · cdealDay · cdealType · dealAmount · dealDay · dealMonth · dealYear · dealingGbn · estateAgentSggNm · excluUseAr · floor · item · jibun · ownershipGbn · sggCd · sggNm · slerGbn · umdNm
```

## 원본 item 한 건

```xml
<item><aptNm>강변역 센트럴 아이파크</aptNm><buyerGbn>개인</buyerGbn><cdealDay> </cdealDay><cdealType> </cdealType><dealAmount>220,000</dealAmount><dealDay>18</dealDay><dealMonth>8</dealMonth><dealYear>2026</dealYear><dealingGbn>중개거래</dealingGbn><estateAgentSggNm>경기 하남시, 서울 광진구</estateAgentSggNm><excluUseAr>84.9811</excluUseAr><floor>14</floor><jibun>592-39</jibun><ownershipGbn>입</ownershipGbn><sggCd>11215</sggCd><sggNm>광진구</sggNm><slerGbn>개인</slerGbn><umdNm>구의동</umdNm></item>
```
