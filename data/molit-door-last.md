# 실거래 문 — 마지막 두드림

- 시각(UTC): 2026-11-28T06:18:02Z
- 실행: `46115930288`

```
🚪 실거래 API — ⚠️ 응답은 왔는데 **LAWD 11470 는 전 기간 0건**입니다
🔑 MOLIT_API_KEY 모양: 64자 · 지문 4e34245e · 인코딩 안 됨
· 11470 202607 [정규화·날것 모두 0(날것 HTTP 403)] — HTTP 403 · resultCode ?  · totalCount ? · item 0건
    본문: <?xml version=1.0 encoding=UTF-8?><OpenAPI_ServiceResponse><cmmMsgHeader>  <errMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</errMsg>  <returnAuthMsg>등록되지 않은 서비스키</returnAuthMsg>  <r
· 11470 202608 [정규화·날것 모두 0(날것 HTTP 403)] — HTTP 403 · resultCode ?  · totalCount ? · item 0건
    본문: <?xml version=1.0 encoding=UTF-8?><OpenAPI_ServiceResponse><cmmMsgHeader>  <errMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</errMsg>  <returnAuthMsg>등록되지 않은 서비스키</returnAuthMsg>  <r

resultCode 가 00 인데 0건이면 그 구역·기간에 신고된 거래가 없다는 뜻입니다.

🔀 같은 키로 다른 서비스:
· 실거래 상세(지금 막힌 곳) — HTTP 403 · resultCode ? · item 0건 SERVICE_KEY_IS_NOT_REGISTERED_ERROR 등록되지 않은 서비스키 
· 실거래 기본(비상세) — HTTP 200 · resultCode ? · item 0건 HTTP_ERROR HTTP 에러 
· 전월세 실거래 — HTTP 200 · resultCode ? · item 0건 HTTP_ERROR HTTP 에러 
· 건축물대장 — HTTP 200 · resultCode ? · item 0건 
```
