# 단지 공급면적 — 마지막 실행

- 성공 7건 · 실패 7건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) · 대지 → 줄 3000개
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
   지번 6029 (6029-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026600-84.json
   전유 84.99 + 주거공용 29.086 = 공급 114.08㎡ = 34.51평 → **35평**
   표본: 2206동 1403 (같은 전용 호 16개) · 전용률 74.5%
     · 아파트 / 코아 [지상 각층] 21.6163
     · 아파트 / 외벽 [지상 14층] 6.14
     · 부대시설 / 지하코아 [지하 지1] 1.3295
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
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
   지번 271-1 (0271-0001) · 대지 → 줄 1814개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 271-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A10027375 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027375 --area 59.95

▶ 목동힐스테이트 (A10027375) · 전용 59.95㎡ · 11470-10100 · 지번 후보 1323
   지번 1323 (1323-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027375-59.json
   전유 59.95 + 주거공용 17.25 = 공급 77.2㎡ = 23.35평 → **23평**
   표본: 110동 1404 (같은 전용 호 2개) · 전용률 77.7%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 12.64
     · 아파트 / 벽체 [지상 14층] 4.59
     · 아파트 / MDF실 [지상 1층] 0.02
── A15701003 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 84.97

▶ 우장산아이파크이편한세상 (A15701003) · 전용 84.97㎡ · 11500-10300 · 지번 후보 1159
   지번 1159 (1159-0000) · 대지 → 줄 0개
::error::1159 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 84.97`
Exit status 1
── A42383508 전용 84.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42383508 --area 84.77

▶ 철산주공13단지 (A42383508) · 전용 84.77㎡ · 41210-10200 · 지번 후보 241
   지번 241 (0241-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42383508-84.json
   전유 84.77 + 주거공용 23.4 = 공급 108.17㎡ = 32.72평 → **33평**
   표본: 1305동 508호 (같은 전용 호 321개) · 전용률 78.4%
     · 아파트 / [] 23.4
── A10022907 전용 59.997

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022907 --area 59.997

▶ 평촌 센텀퍼스트 (A10022907) · 전용 59.997㎡ · 41173-10400 · 지번 후보 1327, 992
   지번 1327 (1327-0000) · 대지 → 줄 2600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022907-59.json
   전유 59.997 + 주거공용 22.769 = 공급 82.77㎡ = 25.04평 → **25평**
   표본: 121동 304 (같은 전용 호 175개) · 전용률 72.5%
     · 아파트 / 계단실,ELEV [지상 각층] 17.4214
     · 아파트 / 벽체 [지상 3층] 5.3477
── A44573621 전용 84.68

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44573621 --area 84.68

▶ 시범다은마을월드반도 (A44573621) · 전용 84.68㎡ · 41597-10200 · 지번 후보 80
   지번 80 (0080-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44573621-84.json
   전유 84.68 + 주거공용 31.58 = 공급 116.26㎡ = 35.17평 → **35평**
   표본: 343동 1703 (같은 전용 호 9개) · 전용률 72.8%
     · 아파트 / 계단실,ELEV. [각층 각층] 24.1
     · 아파트 / 벽체면적 [각층 각층] 7.48
── A10024000 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024000 --area 84.96

▶ 수원하늘채더퍼스트1단지 (A10024000) · 전용 84.96㎡ · 41113-13600 · 지번 후보 652
::error::652 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024000 --area 84.96`
Exit status 1
── A10024000 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024000 --area 59.96

▶ 수원하늘채더퍼스트1단지 (A10024000) · 전용 59.96㎡ · 41113-13600 · 지번 후보 652
   지번 652 (0652-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024000-59.json
   전유 59.96 + 주거공용 26.825 = 공급 86.79㎡ = 26.25평 → **26평**
   표본: 116동 505 (같은 전용 호 92개) · 전용률 69.1%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 17.8565
     · 아파트 / 벽체 [지상 5층] 5.49
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 3.4786
   ⚠️ 전용률 69.1% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A15701003 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 84.97

▶ 우장산아이파크이편한세상 (A15701003) · 전용 84.97㎡ · 11500-10300 · 지번 후보 1159
::error::1159 4쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 84.97`
Exit status 1
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
```
