# 역대 최고가 인덱스 — 마지막 실행

- 실행: 2026-08-12 (KST) · 방아쇠 `push`
- 예산: 4000회 · 시작월 200601
- 결과: **성공**
- 커밋: `0872e09660f4b454bdf2407c152eae7e6077314a`

```

> @wirit/collectors@0.1.0 collect-molit-peak /home/runner/work/claude/claude/packages/collectors
> tsx src/molitPeakCli.ts -- --from 200601 --budget 4000

역대 최고가 인덱스 — 지역 61곳 × 247개월, 이번 실행 예산 4000회
· 종로구 인덱스 판번호 1 → 2 · 처음부터 다시 채웁니다
· 종로구 247/247개월 · 칸 93
· 중구 인덱스 판번호 1 → 2 · 처음부터 다시 채웁니다
⛔ 중구 201002 — 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: HTTP 403 · <?xml version="1.0" encoding="UTF-8"?> <OpenAPI_ServiceResponse> <cmmMsgHeader> <errMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</errMsg> <returnAuthMsg>등록되지 않은 서비스키 | getRTMSDataSvcAptTrade: This operation was aborted
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인. · 이번 실행 중단
· 중구 49/247개월 · 칸 70

호출 4000회 · 갱신된 칸 1351 · 손댄 지역 2곳
완료 지역 1/61 · 남은 월 14771 · ⏳ 이어서 진행 필요

실패 1건 (다음 실행에서 다시 시도합니다):
  · 중구 201002: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: HTTP 403 · <?xml version="1.0" encoding="UTF-8"?> <OpenAPI_ServiceResponse> <cmmMsgHeader> <errMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</errMsg> <returnAuthMsg>등록되지 않은 서비스키 | getRTMSDataSvcAptTrade: This operation was aborted
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
```
