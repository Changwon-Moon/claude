# KOSIS 통계표 찾기 결과

> 표 ID 를 **추측하지 않기 위한** 파일이다. 키워드로 KOSIS 통계표를 훑어 적었다.
> 쓸 표를 고르면 `packages/collectors/src/sources/kosis.ts` 의 `TABLES` 에
> **`enabled: false` · `confidence: "표명확실"`** 로 넣고 → `data/kosis-probe-queue.txt` 푸시(probe) → 켠다.

- 실행 시각(KST): 2026. 8. 12. PM 3:56:03
- 키워드: 품목별 소비자물가지수 · 지출목적별 소비자물가지수 · 소비자물가지수

## 연결 확인

❌ **kosis.kr 이 8번(약 7분) 동안 계속 거부했다** — 요청 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T20&objL1=11&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B040A3&newEstPrdCnt=1
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: kosis.kr:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
> 아래 실패는 주소 문제가 **아니다.** 검색을 아예 시도하지 않았다. **대기열에 한 줄 더 밀어 다시 돌린다.**

검색을 시도하지 않았다(연결 확인 실패). 다시 돌리면 된다.
