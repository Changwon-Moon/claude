# 분양권전매 API — 수집 보고

- 실행: 2026-08-28
- 결과: 수집 6 · 스킵 0 · 실패 0 · 유효거래 171건

- 표본: 평택시 202607
- 구분 집계: 분양권 0 · 입주권 0 · 미상 171
- 태그 판정: 🔴 구분 칸을 **하나도 못 읽었다** — 태그 이름이 틀렸다. 아래 원본에서 실제 이름을 찾아 parse/silv.ts 의 toKind 후보에 넣을 것

> 이 대조표가 있는 이유: 세션 컨테이너는 data.go.kr 이 막혀 있어 이 API 를 한 번도
> 직접 불러 본 적이 없다. 파서의 태그 이름은 **매매 API 에서 유추한 것**이고,
> 유추가 맞았는지는 응답을 봐야 안다. 파서가 빈 값을 채우고 조용히 통과하는 것을 막는다.

## 원본 item 한 건

```xml
<item><aptNm>평택화양 서희스타힐스 센트럴파크</aptNm><buyerGbn>개인</buyerGbn><cdealDay> </cdealDay><cdealType> </cdealType><dealAmount>37,400</dealAmount><dealDay>20</dealDay><dealMonth>7</dealMonth><dealYear>2026</dealYear><dealingGbn>직거래</dealingGbn><estateAgentSggNm> </estateAgentSggNm><excluUseAr>84.6048</excluUseAr><floor>12</floor><jibun>산184-2</jibun><ownershipGbn> </ownershipGbn><sggCd>41220</sggCd><sggNm>평택시</sggNm><slerGbn>개인</slerGbn><umdNm>현덕면 화양리</umdNm></item>
```
