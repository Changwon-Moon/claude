# 단지 공급면적 — 마지막 실행

- 성공 11건 · 실패 14건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 46개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 · 지번 후보 6029, 5869-2
::error::6029 3쪽 실패 — {
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
   지번 248 (0248-0000) → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A10023833 전용 84.9264

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264

▶ 지제역 더샵 센트럴시티 (A10023833) · 전용 84.9264㎡ · 41220-12100 · 지번 후보 가-
   지번 가- (0000-0000) → 줄 0개
::error::지번 후보 가- 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
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
── A10024974 전용 84.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024974 --area 84.93

▶ 마포 아이파크 포레 아파트 (A10024974) · 전용 84.93㎡ · 11440-11100 · 지번 후보 462
   지번 462 (0462-0000) → 줄 2000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024974-84.json
   전유 84.932 + 주거공용 30.355 = 공급 115.29㎡ = 34.87평 → **35평**
   표본: 105동 2502 (같은 전용 호 142개) · 전용률 73.7%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 23.636
     · 아파트 / 벽체 [지상 25층] 6.719
── A14003106 전용 59.12

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14003106 --area 59.12

▶ 이촌강촌아파트 (A14003106) · 전용 59.12㎡ · 11170-12900 · 지번 후보 402
::error::402 2쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A14003106 --area 59.12`
Exit status 1
── A13778204 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13778204 --area 59.97

▶ 서초힐스 (A13778204) · 전용 59.97㎡ · 11650-10300 · 지번 후보 773
::error::773 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13778204 --area 59.97`
Exit status 1
── A15605103 전용 59.67

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15605103 --area 59.67

▶ 신동아리버파크 (A15605103) · 전용 59.67㎡ · 11590-10100 · 지번 후보 325
   지번 325 (0325-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15605103-59.json
   전유 59.67 + 주거공용 25.35 = 공급 85.02㎡ = 25.72평 → **26평**
   표본: 706동 710호 (같은 전용 호 120개) · 전용률 70.2%
     · 아파트 / 복도.계단 [각층 각층] 19.36
     · 부대시설 / 지하대피소 [지하 지1층] 5.99
── A15205513 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15205513 --area 84.87

▶ 신도림태영타운 (A15205513) · 전용 84.87㎡ · 11530-10200 · 지번 후보 1267
   지번 1267 (1267-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15205513-84.json
   전유 84.87 + 주거공용 16.03 = 공급 100.9㎡ = 30.52평 → **31평**
   표본: 109동 503호 (같은 전용 호 239개) · 전용률 84.1%
     · 아파트 / 계단,복도,ELEV [1층∼24층] 16.03
── A43174208 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43174208 --area 84.92

▶ 초원대림 (A43174208) · 전용 84.92㎡ · 41173-10300 · 지번 후보 898-2
   지번 898-2 (0898-0002) → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43174208-84.json
   전유 84.92 + 주거공용 21.859 = 공급 106.78㎡ = 32.3평 → **32평**
   표본: 209동 2001호 (같은 전용 호 9개) · 전용률 79.5%
     · 부대시설 / 계단실,경비실 [지상 20층] 9.259
     · 부대시설 / 지하대피소 [지하 지] 7.45
     · 부대시설 / 승강기 [지상 20층] 5.15
── A15703204 전용 85.00

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15703204 --area 85.00

▶ 등촌IPARK (A15703204) · 전용 85㎡ · 11500-10200 · 지번 후보 715
   지번 715 (0715-0000) → 줄 0개
::error::지번 후보 715 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15703204 --area 85.00`
Exit status 1
── A13187702 전용 84.03

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13187702 --area 84.03

▶ 중화한신아파트 (A13187702) · 전용 84.03㎡ · 11260-10300 · 지번 후보 450
   지번 450 (0450-0000) → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13187702-84.json
   전유 84.03 + 주거공용 42.18 = 공급 126.21㎡ = 38.18평 → **38평**
   표본: 108 603 (같은 전용 호 4개) · 전용률 66.6%
     · 주차장 / 지하주차장 [복수층(하층) 지1~지2층] 17.4
     · 아파트 / 계단및복도 [각층 각층] 16.8
     · 대피소 / 지하대피소 [복수층(하층) 지1~지2층] 4.68
     · 대피소 / 지하대피소및복리시설 [지하 지1층] 3.09
     · 아파트 / 전기실 [지하 지1층] 0.21
   ⚠️ 전용률 66.6% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10026388 전용 82.20

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026388 --area 82.20

▶ 다산반도유보라메이플타운 (A10026388) · 전용 82.2㎡ · 41360-11200 · 지번 후보 6014
   지번 6014 (6014-0000) → 줄 0개
::error::지번 후보 6014 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026388 --area 82.20`
Exit status 1
── A10024040 전용 84.55

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024040 --area 84.55

▶ 광주역 자연앤자이 아파트 (A10024040) · 전용 84.55㎡ · 41610-11200 · 지번 후보 364, 169-15
   지번 364 (0364-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024040-84.json
   전유 84.552 + 주거공용 28.088 = 공급 112.64㎡ = 34.07평 → **34평**
   표본: 104동 2502 (같은 전용 호 354개) · 전용률 75.1%
     · 아파트 / 계단실 [지상 각층] 19.8039
     · 아파트 / 벽체 [지상 25층] 6.7224
     · 아파트 / 지하계단 [각층 지2~지1] 1.5616
── A10025331 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025331 --area 59.98

▶ 다산자연&e편한세상 3차아파트 (A10025331) · 전용 59.98㎡ · 41360-11200 · 지번 후보 6132
   지번 6132 (6132-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025331-59.json
   전유 59.981 + 주거공용 26.438 = 공급 86.42㎡ = 26.14평 → **26평**
   표본: 5306동 1003 (같은 전용 호 229개) · 전용률 69.4%
     · 아파트 / 계단실 [지상 각층] 18.0848
     · 아파트 / 벽체 [지상 10층] 7.411
     · 아파트 / 지하층 계단실 [지하 지1] 0.942
   ⚠️ 전용률 69.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13612002 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13612002 --area 59.95

▶ 성북동아에코빌 (A13612002) · 전용 59.95㎡ · 11290-13700 · 지번 후보 101
   지번 101 (0101-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13612002-59.json
   전유 59.95 + 주거공용 28.01 = 공급 87.96㎡ = 26.61평 → **27평**
   표본: 112동 1602 (같은 전용 호 148개) · 전용률 68.2%
     · 아파트 / 계단실,승강기 [각층 각층] 21.93
     · 아파트 / 대피소 [지하 지1층] 6.08
   ⚠️ 전용률 68.2% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13987304 전용 59.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13987304 --area 59.22

▶ 하계 6단지 장미아파트 (A13987304) · 전용 59.22㎡ · 11350-10400 · 지번 후보 273
::error::273 24쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13987304 --area 59.22`
Exit status 1
── A15209305 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15209305 --area 84.96

▶ 개봉한진 (A15209305) · 전용 84.96㎡ · 11530-10700 · 지번 후보 478
   지번 478 (0478-0000) → 줄 0개
::error::지번 후보 478 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
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
── A10026380 전용 59.64

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026380 --area 59.64

▶ 동탄호수자이파밀리에 (A10026380) · 전용 59.64㎡ · 41597-11100 · 지번 후보 963, 4-1
   지번 963 (0963-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026380-59.json
   전유 59.64 + 주거공용 20.903 = 공급 80.54㎡ = 24.36평 → **24평**
   표본: 3208동 1801 (같은 전용 호 110개) · 전용률 74.1%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 20.5271
     · 아파트 / 지하주차장연결통로,지하주출입구연결통로 [지하 지1] 0.3758
── A10027267 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027267 --area 59.98

▶ 이스트힐아파트 (A10027267) · 전용 59.98㎡ · 41310-10100 · 지번 후보 569
   지번 569 (0569-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027267-59.json
   전유 59.98 + 주거공용 27.758 = 공급 87.74㎡ = 26.54평 → **27평**
   표본: 207동 102 (같은 전용 호 222개) · 전용률 68.4%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 26.4789
     · 아파트 / 지하주차장연결통로,주출입구연결통로 [각층 지2-지1] 1.2789
   ⚠️ 전용률 68.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) → 줄 1700개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 271-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A42084908 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42084908 --area 59.98

▶ 중동덕유마을주공4단지 (A42084908) · 전용 59.98㎡ · 41192-10800 · 지번 후보 1041
::error::1041 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42084908 --area 59.98`
Exit status 1
```
