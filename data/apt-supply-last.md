# 단지 공급면적 — 마지막 실행

- 성공 11건 · 실패 14건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) · 대지 → 줄 1400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 26개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 · 지번 후보 6029, 5869-2
::error::6029 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
::error::248 2쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) · 대지 → 줄 100개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
::error::271-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A15701003 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 84.97

▶ 우장산아이파크이편한세상 (A15701003) · 전용 84.97㎡ · 11500-10300 · 지번 후보 1159
   지번 1159 (1159-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15701003-84.json
   전유 84.97 + 주거공용 23.93 = 공급 108.9㎡ = 32.94평 → **33평**
   표본: 129동 501호 (같은 전용 호 211개) · 전용률 78.0%
     · 아파트 / 계단실,승강기 [각층 각층] 18.7
     · 아파트 / 벽체 [지상 5층] 5.23
── A10024000 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024000 --area 84.96

▶ 수원하늘채더퍼스트1단지 (A10024000) · 전용 84.96㎡ · 41113-13600 · 지번 후보 652
   지번 652 (0652-0000) · 대지 → 줄 2100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024000-84.json
   전유 84.96 + 주거공용 28.741 = 공급 113.7㎡ = 34.39평 → **34평**
   표본: 110동 1304 (같은 전용 호 99개) · 전용률 74.7%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 18.8515
     · 아파트 / 벽체 [지상 13층] 6.69
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 3.1993
── A10027920 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027920 --area 84.96

▶ 텐즈힐1단지 (A10027920) · 전용 84.96㎡ · 11200-10200 · 지번 후보 1066
   지번 1066 (1066-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027920-84.json
   전유 84.96 + 주거공용 22.254 = 공급 107.21㎡ = 32.43평 → **32평**
   표본: 107동 1402 (같은 전용 호 14개) · 전용률 79.2%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 14.844
     · 아파트 / 벽체 [지상 14층] 7.41
── A13380703 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13380703 --area 84.99

▶ 금호두산 (A13380703) · 전용 84.99㎡ · 11200-11100 · 지번 후보 769, 10, 1331
::error::769 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13380703 --area 84.99`
Exit status 1
── A10027692 전용 85.4621

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027692 --area 85.4621

▶ 위례더힐55 (A10027692) · 전용 85.4621㎡ · 41131-10800 · 지번 후보 521, 2-10
   지번 521 (0521-0000) · 대지 → 줄 500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027692-84.json
   전유 85.462 + 주거공용 32.045 = 공급 117.51㎡ = 35.55평 → **36평**
   표본: 5502동 1004 (같은 전용 호 44개) · 전용률 72.7%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 20.9347
     · 아파트 / 벽체 [지상 10층] 7.0391
     · 아파트 / 지하주차장연결통로,주출입구연결통로 [각층 지3-지1] 4.0716
── A10024426 전용 59.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024426 --area 59.86

▶ 마곡엠밸리9단지 (A10024426) · 전용 59.86㎡ · 11500-10500 · 지번 후보 744
::error::744 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024426 --area 59.86`
Exit status 1
── A10022845 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022845 --area 59.98

▶ 산성역자이푸르지오1단지 (A10022845) · 전용 59.98㎡ · 41131-10100 · 지번 후보 6961
   지번 6961 (6961-0000) · 대지 → 줄 0개
::error::6961 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022845 --area 59.98`
Exit status 1
── A42385005 전용 84.79

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385005 --area 84.79

▶ 하안12단지 (A42385005) · 전용 84.79㎡ · 41210-10300 · 지번 후보 110
::error::110 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42385005 --area 84.79`
Exit status 1
── A42374402 전용 59.982

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42374402 --area 59.982

▶ e편한세상센트레빌 (A42374402) · 전용 59.982㎡ · 41210-10300 · 지번 후보 864
   지번 864 (0864-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42374402-59.json
   전유 59.982 + 주거공용 24.668 = 공급 84.65㎡ = 25.61평 → **26평**
   표본: 305동 1104 (같은 전용 호 3개) · 전용률 70.9%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 19.505
     · 아파트 / 벽체 [각층 각층] 5.163
── A10025621 전용 59.83

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025621 --area 59.83

▶ 영통아이파크캐슬1단지 (A10025621) · 전용 59.83㎡ · 41117-10700 · 지번 후보 766
   지번 766 (0766-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025621-59.json
   전유 59.83 + 주거공용 19.82 = 공급 79.65㎡ = 24.09평 → **24평**
   표본: 116동 2206 (같은 전용 호 82개) · 전용률 75.1%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 13.51
     · 아파트 / 벽체 [지상 22층] 6.31
── A13009002 전용 84.75

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13009002 --area 84.75

▶ 휘경리오포레1단지 (A13009002) · 전용 84.75㎡ · 11230-10900 · 지번 후보 57
   지번 57 (0057-0000) · 대지 → 줄 1400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13009002-84.json
   전유 84.75 + 주거공용 25.622 = 공급 110.37㎡ = 33.39평 → **33평**
   표본: 113동 1604호 (같은 전용 호 95개) · 전용률 76.8%
     · 아파트 / 계단,승강기 [각층] 17.4644
     · 부대시설 / 지하대피소 [지하 지하1층] 8.1578
── A10022677 전용 84.35

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022677 --area 84.35

▶ 북수원자이렉스비아 (A10022677) · 전용 84.35㎡ · 41111-13000 · 지번 후보 964, 530-6
   지번 964 (0964-0000) · 대지 → 줄 0개
::error::964 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022677 --area 84.35`
Exit status 1
── A10026215 전용 84.755

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026215 --area 84.755

▶ 기흥역센트럴푸르지오 (A10026215) · 전용 84.755㎡ · 41463-10200 · 지번 후보 662
   지번 662 (0662-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026215-84.json
   전유 84.762 + 주거공용 32.741 = 공급 117.5㎡ = 35.54평 → **36평**
   표본: 202동 3904 (같은 전용 호 9개) · 전용률 72.1%
     · 아파트 / 계단실 [지상 각층] 25.677
     · 아파트 / 벽체 [지상 39층] 7.064
── A44878309 전용 60.03

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44878309 --area 60.03

▶ 수지현대아파트 (A44878309) · 전용 60.03㎡ · 41465-10100 · 지번 후보 1932-6, 481, 700-1
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
::error::1932-6 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44878309 --area 60.03`
Exit status 1
── A10027928 전용 59.4313

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027928 --area 59.4313

▶ 동탄역센트럴푸르지오 (A10027928) · 전용 59.4313㎡ · 41597-10500 · 지번 후보 538, 510-889
::error::538 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027928 --area 59.4313`
Exit status 1
── A43181606 전용 84.945

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43181606 --area 84.945

▶ 평촌관악타운 (A43181606) · 전용 84.945㎡ · 41173-10100 · 지번 후보 1102
::error::1102 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43181606 --area 84.945`
Exit status 1
── A10027643 전용 59.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027643 --area 59.82

▶ 광명철산도덕파크타운 (A10027643) · 전용 59.82㎡ · 41210-10200 · 지번 후보 625
   지번 625 (0625-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027643-59.json
   전유 59.82 + 주거공용 18.504 = 공급 78.32㎡ = 23.69평 → **24평**
   표본: 101동 803호 (같은 전용 호 3개) · 전용률 76.4%
     · 아파트 / 계단실,승강기,복도등 [각층] 15.4914
     · 아파트 / 지하대피소 [지하 지1] 3.0125
── A44851612 전용 84.7831

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44851612 --area 84.7831

▶ 상현엘지자이 (A44851612) · 전용 84.7831㎡ · 41465-10700 · 지번 후보 869
   지번 869 (0869-0000) · 대지 → 줄 0개
::error::869 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44851612 --area 84.7831`
Exit status 1
── A10022404 전용 84.9868

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022404 --area 84.9868

▶ 힐스테이트용인고진역2단지아파트 (A10022404) · 전용 84.9868㎡ · 41461-10600 · 지번 후보 1028
   지번 1028 (1028-0000) · 대지 → 줄 2300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022404-84.json
   전유 84.987 + 주거공용 30.968 = 공급 115.95㎡ = 35.08평 → **35평**
   표본: 208동 901 (같은 전용 호 150개) · 전용률 73.3%
     · 아파트 / 계단실,ELEV.홀 [각층 각층] 30.9679
── A10026125 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026125 --area 59.92

▶ 네이처포레 아파트 (A10026125) · 전용 59.92㎡ · 41390-10600 · 지번 후보 632
::error::632 2쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026125 --area 59.92`
Exit status 1
```
