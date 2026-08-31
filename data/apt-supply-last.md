# 단지 공급면적 — 마지막 실행

- 성공 11건 · 실패 12건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) · 대지 → 줄 1500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 27개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 · 지번 후보 6029, 5869-2
   지번 6029 (6029-0000) · 대지 → 줄 0개
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
   지번 248 (0248-0000) · 대지 → 줄 0개
::error::248 1쪽 실패 — {
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
   지번 248 (0248-0000) · 대지 → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) · 대지 → 줄 1800개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 271-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A44656712 전용 84.7616

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44656712 --area 84.7616

▶ 죽현마을아이파크1차 (A44656712) · 전용 84.7616㎡ · 41463-11800 · 지번 후보 1267
::error::1267 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44656712 --area 84.7616`
Exit status 1
── A44656712 전용 84.7616

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44656712 --area 84.7616

▶ 죽현마을아이파크1차 (A44656712) · 전용 84.7616㎡ · 41463-11800 · 지번 후보 1267
   지번 1267 (1267-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44656712-84.json
   전유 84.762 + 주거공용 22.34 = 공급 107.1㎡ = 32.4평 → **32평**
   표본: 206동 1404 (같은 전용 호 428개) · 전용률 79.1%
     · 아파트 / 벽체,계단실,승강기홀 [각층 각층] 21.2285
     · 아파트 / 지하계단실 [지하 지1층] 1.1118
── A10027375 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027375 --area 59.95

▶ 목동힐스테이트 (A10027375) · 전용 59.95㎡ · 11470-10100 · 지번 후보 1323
::error::1323 22쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027375 --area 59.95`
Exit status 1
── A15701003 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 84.97

▶ 우장산아이파크이편한세상 (A15701003) · 전용 84.97㎡ · 11500-10300 · 지번 후보 1159
   지번 1159 (1159-0000) · 대지 → 줄 0개
::error::지번 후보 1159 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 84.97`
Exit status 1
── A42383508 전용 84.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42383508 --area 84.77

▶ 철산주공13단지 (A42383508) · 전용 84.77㎡ · 41210-10200 · 지번 후보 241
   지번 241 (0241-0000) · 대지 → 줄 0개
::error::241 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42383508 --area 84.77`
Exit status 1
── A44377204 전용 84.9424

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44377204 --area 84.9424

▶ 광교호반베르디움 (A44377204) · 전용 84.9424㎡ · 41117-10200 · 지번 후보 606
   지번 606 (0606-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44377204-84.json
   전유 84.942 + 주거공용 30.118 = 공급 115.06㎡ = 34.81평 → **35평**
   표본: 1005동 1901 (같은 전용 호 84개) · 전용률 73.8%
     · 아파트 / 벽체,계단실 [지상 각층] 27.8833
     · 복리시설 / 경로당/보육시설/작은도서관/MDF실/아파트지하층 [각층 1층] 2.2345
── A15701007 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701007 --area 59.99

▶ 강서힐스테이트아파트 (A15701007) · 전용 59.99㎡ · 11500-10300 · 지번 후보 1165, 1025-33
   지번 1165 (1165-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15701007-59.json
   전유 59.99 + 주거공용 22.14 = 공급 82.13㎡ = 24.84평 → **25평**
   표본: 123동 602 (같은 전용 호 60개) · 전용률 73.0%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 17.04
     · 아파트 / 벽체 [지상 6층] 5.1
── A10027233 전용 59.997

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027233 --area 59.997

▶ 평촌더샵센트럴시티 (A10027233) · 전용 59.997㎡ · 41173-10200 · 지번 후보 1815
   지번 1815 (1815-0000) · 대지 → 줄 500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027233-59.json
   전유 59.997 + 주거공용 21.484 = 공급 81.48㎡ = 24.65평 → **25평**
   표본: 105동 903 (같은 전용 호 13개) · 전용률 73.6%
     · 아파트 / 계단실,복도,ELEV. [지상 각층] 15.623
     · 아파트 / 벽체 [지상 각층] 5.8608
── A10022907 전용 59.997

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022907 --area 59.997

▶ 평촌 센텀퍼스트 (A10022907) · 전용 59.997㎡ · 41173-10400 · 지번 후보 1327, 992
::error::1327 3쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022907 --area 59.997`
Exit status 1
── A10025336 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025336 --area 59.94

▶ 평촌더샵아이파크아파트 (A10025336) · 전용 59.94㎡ · 41173-10400 · 지번 후보 1287
   지번 1287 (1287-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025336-59.json
   전유 59.94 + 주거공용 22.215 = 공급 82.15㎡ = 24.85평 → **25평**
   표본: 105동 201 (같은 전용 호 7개) · 전용률 73.0%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 16.9248
     · 아파트 / 벽체 [지상 2층] 5.29
── A44573621 전용 84.68

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44573621 --area 84.68

▶ 시범다은마을월드반도 (A44573621) · 전용 84.68㎡ · 41597-10200 · 지번 후보 80
   지번 80 (0080-0000) · 대지 → 줄 0개
::error::80 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44573621 --area 84.68`
Exit status 1
── A10023451 전용 84.73

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023451 --area 84.73

▶ 반정아이파크캐슬5단지 (A10023451) · 전용 84.73㎡ · 41595-10600 · 지번 후보 637
   지번 637 (0637-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023451-84.json
   전유 84.73 + 주거공용 27.06 = 공급 111.79㎡ = 33.82평 → **34평**
   표본: 511동 401 (같은 전용 호 172개) · 전용률 75.8%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 20.22
     · 아파트 / 벽체 [지상 4층] 6.84
── A10024349 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024349 --area 84.98

▶ 병점역아이파크캐슬 (A10024349) · 전용 84.98㎡ · 41595-10200 · 지번 후보 881
   지번 881 (0881-0000) · 대지 → 줄 2000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024349-84.json
   전유 84.98 + 주거공용 25.709 = 공급 110.69㎡ = 33.48평 → **33평**
   표본: 127동 103 (같은 전용 호 143개) · 전용률 76.8%
     · 아파트 / 계단실 [지상 각층] 18.5292
     · 아파트 / 벽체 [지상 1층] 7.18
── A10024000 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024000 --area 84.96

▶ 수원하늘채더퍼스트1단지 (A10024000) · 전용 84.96㎡ · 41113-13600 · 지번 후보 652
   지번 652 (0652-0000) · 대지 → 줄 0개
::error::652 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024000 --area 84.96`
Exit status 1
── A10023653 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023653 --area 59.97

▶ 아르테자이 (A10023653) · 전용 59.97㎡ · 41171-10100 · 지번 후보 1448, 18-1
   지번 1448 (1448-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023653-59.json
   전유 59.97 + 주거공용 23.05 = 공급 83.02㎡ = 25.11평 → **25평**
   표본: 101동 1103 (같은 전용 호 223개) · 전용률 72.2%
     · 아파트 / 계단실 [지상 각층] 17.59
     · 아파트 / 벽체 [지상 11층] 5.46
── A43176406 전용 84.973

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43176406 --area 84.973

▶ 호계2차현대홈타운 (A43176406) · 전용 84.973㎡ · 41173-10400 · 지번 후보 1932-6, 481, 811
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 811 (0811-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43176406-84.json
   전유 84.973 + 주거공용 26.645 = 공급 111.62㎡ = 33.76평 → **34평**
   표본: 220동 1101 (같은 전용 호 159개) · 전용률 76.1%
     · 부대시설 / 계단실, 복도 [각층 각층] 19.943
     · 부대시설 / 벽체면적 [각층 각층] 6.702
── A10024000 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024000 --area 59.96

▶ 수원하늘채더퍼스트1단지 (A10024000) · 전용 59.96㎡ · 41113-13600 · 지번 후보 652
::error::652 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024000 --area 59.96`
Exit status 1
── A42085309 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42085309 --area 59.94

▶ 중동보람마을아주 (A42085309) · 전용 59.94㎡ · 41192-10800 · 지번 후보 1172
   지번 1172 (1172-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42085309-59.json
   전유 59.94 + 주거공용 16.393 = 공급 76.33㎡ = 23.09평 → **23평**
   표본: 1108동 1002호 (같은 전용 호 83개) · 전용률 78.5%
     · 부대시설 / 계단,ELEV [각층] 12.6495
     · 부대시설 / 지하대피소 [지하 지층] 3.573
     · 부대시설 / 홀 [] 0.171
```
