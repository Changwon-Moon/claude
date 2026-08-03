# 인구 수집 마지막 실행

- 실행: 2026-08-04 (KST) · 방아쇠 `push`
- 조건: 최근 25개월 · 신호 문턱 45점 · 상위 8건
- 보드 자동 등록: 끔(오너가 직접 고릅니다)
- 결과: **실패**
- 커밋: `4068a4e64b96894124d06bb62e19263022e51300`

## 수집 로그
```

> @wirit/collectors@0.1.0 collect-population /home/runner/work/claude/claude/packages/collectors
> tsx src/kosisCli.ts -- --today 2026-08-04 --months 25 --min 45

::error::인구(DT_1B040A3) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T20&objL1=ALL&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B040A3&startPrdDe=202407&endPrdDe=202607
fetch failed
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::세대수(DT_1B040B3) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=ALL&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B040B3&startPrdDe=202407&endPrdDe=202607
fetch failed
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::이동(DT_1B26001_A01) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T25&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B26001_A01&startPrdDe=202407&endPrdDe=202607
fetch failed
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
· 고령인구(DT_1B04006) — 지역 255곳을 23개씩 12번에 나눠 받습니다(4만 셀 한도)
::error::고령인구(DT_1B04006) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T2&objL1=11010%2B11020%2B11030%2B11040%2B11050%2B11060%2B11070%2B11080%2B11090%2B11100%2B11110%2B11120%2B11130%2B11140%2B11150%2B11160%2B11170%2B11180%2B11190%2B11200%2B11210%2B11220%2B11230&format=json&jsonVD=Y&prdSe=M&orgId=101&tblId=DT_1B04006&objL2=ALL&startPrdDe=202407&endPrdDe=202607
fetch failed
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::출생(DT_1B81A03) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B81A03&objL2=00&startPrdDe=202407&endPrdDe=202607
fetch failed
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::사망(DT_1B34E13) 수집 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=0&format=json&jsonVD=Y&prdSe=Y&orgId=101&tblId=DT_1B34E13&objL2=ALL&objL3=0&startPrdDe=202407&endPrdDe=202607
fetch failed
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
❌ 수집 실패: 인구 시계열이 비었다 — 표 ID·기간·인증키를 확인해야 한다.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-population: `tsx src/kosisCli.ts -- --today 2026-08-04 --months 25 --min 45`
Exit status 1
```

## 신호 정리
```
(등록 단계가 실행되지 못했습니다)
```

> 지도 조인에 "지도에 없는 시군구" 가 뜨면 행정구역이 바뀐 것입니다 —
> `scripts/build-sgg-geo.mjs` 로 경계를 다시 만들어야 합니다.
