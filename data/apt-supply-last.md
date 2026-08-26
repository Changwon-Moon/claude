# 단지 공급면적 — 마지막 실행

- 성공 6건 · 실패 9건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) → 줄 900개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 17개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 · 지번 후보 6029, 5869-2
::error::6029 2쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99`
Exit status 1
── A10023833 전용 84.9264

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264

▶ 지제역 더샵 센트럴시티 (A10023833) · 전용 84.9264㎡ · 41220-12100 · 지번 후보 가-
::error::가- 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) → 줄 100개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A10023833 전용 84.9264

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264

▶ 지제역 더샵 센트럴시티 (A10023833) · 전용 84.9264㎡ · 41220-12100 · 지번 후보 가-
::error::가- 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A14003106 전용 59.12

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14003106 --area 59.12

▶ 이촌강촌아파트 (A14003106) · 전용 59.12㎡ · 11170-12900 · 지번 후보 402
   지번 402 (0402-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14003106-59.json
   전유 59.12 + 주거공용 24.946 = 공급 84.07㎡ = 25.43평 → **25평**
   표본: 109동 501호 (같은 전용 호 112개) · 전용률 70.3%
     · 아파트 / 계단,복도,승강기 [각층 각층] 18.48
     · 부대시설 / 지하대피소 [지하 지층] 6.466
── A13778204 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13778204 --area 59.97

▶ 서초힐스 (A13778204) · 전용 59.97㎡ · 11650-10300 · 지번 후보 773
   지번 773 (0773-0000) → 줄 2200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13778204-59.json
   전유 59.97 + 주거공용 23.145 = 공급 83.12㎡ = 25.14평 → **25평**
   표본: 205동 901 (같은 전용 호 80개) · 전용률 72.2%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 22.1014
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 1.0439
── A15703204 전용 85.00

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15703204 --area 85.00

▶ 등촌IPARK (A15703204) · 전용 85㎡ · 11500-10200 · 지번 후보 715
   지번 715 (0715-0000) → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15703204-84.json
   전유 84.996 + 주거공용 20.263 = 공급 105.26㎡ = 31.84평 → **32평**
   표본: 104동 303 (같은 전용 호 19개) · 전용률 80.8%
     · 아파트 / 계단실,승강기홀 [각층 각층] 14.6311
     · 아파트 / 벽체 [각층 각층] 5.6316
── A10026388 전용 82.20

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026388 --area 82.20

▶ 다산반도유보라메이플타운 (A10026388) · 전용 82.2㎡ · 41360-11200 · 지번 후보 6014
   지번 6014 (6014-0000) → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026388-84.json
   전유 82.197 + 주거공용 24.962 = 공급 107.16㎡ = 32.42평 → **32평**
   표본: 2107동 1703 (같은 전용 호 15개) · 전용률 76.7%
     · 아파트 / 계단실 [지상 각층] 19.2664
     · 아파트 / 벽체 [지상 17층] 5.6953
── A13987304 전용 59.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13987304 --area 59.22

▶ 하계 6단지 장미아파트 (A13987304) · 전용 59.22㎡ · 11350-10400 · 지번 후보 273
   지번 273 (0273-0000) → 줄 0개
::error::지번 후보 273 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13987304 --area 59.22`
Exit status 1
── A15209305 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15209305 --area 84.96

▶ 개봉한진 (A15209305) · 전용 84.96㎡ · 11530-10700 · 지번 후보 478
::error::478 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15209305 --area 84.96`
Exit status 1
── A43176406 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43176406 --area 59.98

▶ 호계2차현대홈타운 (A43176406) · 전용 59.98㎡ · 41173-10400 · 지번 후보 1932-6, 481, 811
::error::1932-6 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43176406 --area 59.98`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
::error::271-1 2쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A42084908 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42084908 --area 59.98

▶ 중동덕유마을주공4단지 (A42084908) · 전용 59.98㎡ · 41192-10800 · 지번 후보 1041
   지번 1041 (1041-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42084908-59.json
   전유 59.98 + 주거공용 24.86 = 공급 84.84㎡ = 25.66평 → **26평**
   표본: 208동 605호 (같은 전용 호 162개) · 전용률 70.7%
     · 아파트 / 복도,계단,승강기등 [] 18.58
     · 부대시설 / 지하주차장(대피소) [] 3.2
     · 부대시설 / 지하(대피소) [] 3.08
```
