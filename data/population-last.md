# 인구 수집 마지막 실행

- 실행: 2026-09-15 (KST) · 방아쇠 `push`
- 조건: 최근 25개월 · 신호 문턱 45점 · 상위 8건
- 보드 자동 등록: 끔(오너가 직접 고릅니다)
- 결과: **실패**
- 커밋: `08b4ab0fac950f2b8ee1748c979e7bd7601dcce8`

## 수집 로그
```

> @wirit/collectors@0.1.0 collect-population /home/runner/work/claude/claude/packages/collectors
> tsx src/kosisCli.ts -- --today 2026-09-15 --months 25 --min 45

::error::인구(DT_1B040A3) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T20&objL1=ALL&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B040A3&startPrdDe=202408&endPrdDe=202608
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: kosis.kr:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::세대수(DT_1B040B3) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=ALL&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B040B3&startPrdDe=202408&endPrdDe=202608
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: kosis.kr:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::이동(DT_1B26001_A01) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T25&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B26001_A01&startPrdDe=2023&endPrdDe=2026
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: kosis.kr:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
· 고령인구(DT_1B04006) — 202508~202608(14시점) · 지역 250곳을 23개씩 11번에 나눠 받습니다(4만 셀 한도)
::error::고령인구(DT_1B04006) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T2&objL1=11110%2B11140%2B11170%2B11200%2B11215%2B11230%2B11260%2B11290%2B11305%2B11320%2B11350%2B11380%2B11410%2B11440%2B11470%2B11500%2B11530%2B11545%2B11560%2B11590%2B11620%2B11650%2B11680&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B04006&objL2=ALL&startPrdDe=202508&endPrdDe=202608
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: kosis.kr:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::출생(DT_1B81A03) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B81A03&objL2=00&startPrdDe=2023&endPrdDe=2026
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: kosis.kr:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::사망(DT_1B34E13) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=0&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B34E13&objL2=ALL&objL3=0&startPrdDe=2023&endPrdDe=2026
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: kosis.kr:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
· 검증 대기 중인 표 8개: foreignHouseTotal(DT_408004_001), foreignHouseNatApt(DT_408004_007), foreignHouseNatHouse(DT_408004_008), houseOwnHh(DT_1LC0033), houseOwnHhSido(DT_1LC0034), wageYearEnd(TX_13301_A035), wageBracket(DT_133N_427), populationYear(DT_1B040A3)
  → pnpm --filter @wirit/collectors probe-kosis 로 규격을 확인한 뒤 enabled 를 켭니다.
❌ 수집 실패: 인구 시계열이 비었다 — 표 ID·기간·인증키를 확인해야 한다.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-population: `tsx src/kosisCli.ts -- --today 2026-09-15 --months 25 --min 45`
Exit status 1
```

## 신호 정리
```
(등록 단계가 실행되지 못했습니다)
```

> 지도 조인에 "지도에 없는 시군구" 가 뜨면 행정구역이 바뀐 것입니다 —
> `scripts/build-sgg-geo.mjs` 로 경계를 다시 만들어야 합니다.
