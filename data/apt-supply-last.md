# 단지 공급면적 — 마지막 실행

- 성공 7건 · 실패 4건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 3개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 · 지번 후보 6029, 5869-2
   지번 6029 (6029-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026600-84.json
   전유 84.99 + 주거공용 29.086 = 공급 114.08㎡ = 34.51평 → **35평**
   표본: 2206동 1403 (같은 전용 호 7개) · 전용률 74.5%
     · 아파트 / 코아 [지상 각층] 21.6163
     · 아파트 / 외벽 [지상 14층] 6.14
     · 부대시설 / 지하코아 [지하 지1] 1.3295
── A10023833 전용 84.9264

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264

▶ 지제역 더샵 센트럴시티 (A10023833) · 전용 84.9264㎡ · 41220-12100 · 지번 후보 가-
   지번 가- (0000-0000) · 대지 → 줄 0개
   지번 가- (0000-0000) · 블록 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023833-84.json
   전유 84.926 + 주거공용 25.659 = 공급 110.59㎡ = 33.45평 → **33평**
   표본: 113 1804 (같은 전용 호 20개) · 전용률 76.8%
     · 아파트 / 계단실 [지상 각층] 19.7594
     · 아파트 / 벽체 [지상 18층] 5.8996
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
   지번 248 (0248-0000) · 대지 → 줄 0개
::error::지번 후보 248 × 대지구분(대지·산·블록) 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) · 대지 → 줄 0개
::error::271-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A15678103 전용 84.61

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15678103 --area 84.61

▶ 힐스테이트상도센트럴파크 (A15678103) · 전용 84.61㎡ · 11590-10200 · 지번 후보 531
   지번 531 (0531-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15678103-84.json
   전유 84.61 + 주거공용 24.582 = 공급 109.19㎡ = 33.03평 → **33평**
   표본: 102동 301 (같은 전용 호 18개) · 전용률 77.5%
     · 아파트 / 벽체,계단,복도 [지상 각층] 24.5823
── A13615003 전용 84.90

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13615003 --area 84.90

▶ 석관두산 (A13615003) · 전용 84.9㎡ · 11290-13900 · 지번 후보 769, 10
::error::769 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13615003 --area 84.90`
Exit status 1
── A47170801 전용 84.57

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A47170801 --area 84.57

▶ 구리덕현 (A47170801) · 전용 84.57㎡ · 41310-10400 · 지번 후보 808
   지번 808 (0808-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A47170801-84.json
   전유 84.57 + 주거공용 18.576 = 공급 103.15㎡ = 31.2평 → **31평**
   표본: 104동 1102호 (같은 전용 호 177개) · 전용률 82.0%
     · 부대시설 / 계단,복도 [각층] 13.169
     · 부대시설 / 지하대피소 [지하 지층] 5.407
── A13987306 전용 84.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13987306 --area 84.85

▶ 하계극동건영벽산 (A13987306) · 전용 84.85㎡ · 11350-10400 · 지번 후보 271-3
   지번 271-3 (0271-0003) · 대지 → 줄 2100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13987306-84.json
   전유 84.85 + 주거공용 15.96 = 공급 100.81㎡ = 30.5평 → **30평**
   표본: 9동 1205 (같은 전용 호 96개) · 전용률 84.2%
     · 아파트 / 계단,복도 [각층 각층] 9.82
     · 아파트 / 대피소 [지하 지층] 6.14
── A14210002 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14210002 --area 59.76

▶ 삼각산아이원 (A14210002) · 전용 59.76㎡ · 11305-10100 · 지번 후보 1357
   지번 1357 (1357-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14210002-59.json
   전유 59.758 + 주거공용 20.276 = 공급 80.03㎡ = 24.21평 → **24평**
   표본: 105동 903호 (같은 전용 호 6개) · 전용률 74.7%
     · 아파트 / 계단실,승강기 [각층 각층] 15.449
     · 아파트 / 벽체 [각층 각층] 4.199
     · 아파트 / 주민공동시설 [지하 지1] 0.628
```
