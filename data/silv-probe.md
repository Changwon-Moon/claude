# 분양권전매 API — 수집 보고

- 실행: 2026-08-28
- 결과: 수집 0 · 스킵 0 · 실패 231 · 유효거래 0건

## 실패한 것과 그 이유

### 231건 — 종로구 202608, 종로구 202607, 종로구 202606, 중구 202608 외

```
분양권전매 엔드포인트 실패 — getRTMSDataSvcSilvTrade: HTTP 403 · <?xml version="1.0" encoding="UTF-8"?> <OpenAPI_ServiceResponse> <cmmMsgHeader> <errMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</errMsg> <returnAuthMsg>등록되지 않은 서비스키
```

> **한 건도 못 받았다.** 사유가 전부 403 이면 키 문제가 아니라 **활용신청**을 본다 —
> '아파트 분양권전매 실거래가 자료'(data.go.kr 15126471)는 매매·전월세와 **별도 승인**이다.
> 공공데이터포털 마이페이지에서 이 API 의 승인 상태를 확인해야 한다.
