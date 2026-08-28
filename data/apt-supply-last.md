# 단지 공급면적 — 마지막 실행

- 성공 5건 · 실패 11건
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
::error::6029 11쪽 실패 — {
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
::error::248 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
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
   지번 248 (0248-0000) → 줄 800개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) → 줄 0개
::error::지번 후보 271-1 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A15678103 전용 84.61

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15678103 --area 84.61

▶ 힐스테이트상도센트럴파크 (A15678103) · 전용 84.61㎡ · 11590-10200 · 지번 후보 531
   지번 531 (0531-0000) → 줄 0개
::error::지번 후보 531 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15678103 --area 84.61`
Exit status 1
── A15178201 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15178201 --area 84.99

▶ 관악벽산블루밍 (A15178201) · 전용 84.99㎡ · 11620-10100 · 지번 후보 1102, 1718, 271-3
   지번 1102 (1102-0000) → 줄 0개
   지번 1718 (1718-0000) → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15178201-84.json
   전유 84.99 + 주거공용 17.19 = 공급 102.18㎡ = 30.91평 → **31평**
   표본: 106동 303 (같은 전용 호 15개) · 전용률 83.2%
     · 부대시설 / 계단실,복도 [각층 각층] 17.19
── A13613007 전용 84.59

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13613007 --area 84.59

▶ 래미안월곡 (A13613007) · 전용 84.59㎡ · 11290-13600 · 지번 후보 225
   지번 225 (0225-0000) → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13613007-84.json
   전유 84.589 + 주거공용 22.634 = 공급 107.22㎡ = 32.43평 → **32평**
   표본: 120동 201 (같은 전용 호 8개) · 전용률 78.9%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 22.634
── A13615003 전용 84.90

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13615003 --area 84.90

▶ 석관두산 (A13615003) · 전용 84.9㎡ · 11290-13900 · 지번 후보 769, 10
   지번 769 (0769-0000) → 줄 0개
   지번 10 (0010-0000) → 줄 0개
::error::지번 후보 769, 10 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13615003 --area 84.90`
Exit status 1
── A43174208 전용 59.74

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43174208 --area 59.74

▶ 초원대림 (A43174208) · 전용 59.74㎡ · 41173-10300 · 지번 후보 898-2
   지번 898-2 (0898-0002) → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43174208-59.json
   전유 59.742 + 주거공용 23.703 = 공급 83.44㎡ = 25.24평 → **25평**
   표본: 201동 303호 (같은 전용 호 4개) · 전용률 71.6%
     · 부대시설 / 복도,계단 [각층] 16.541
     · 부대시설 / 지하대피소 [지하 지층] 5.241
     · 아파트 / 경비실,승강기 [각층] 1.921
── A47170801 전용 84.57

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A47170801 --area 84.57

▶ 구리덕현 (A47170801) · 전용 84.57㎡ · 41310-10400 · 지번 후보 808
::error::808 3쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A47170801 --area 84.57`
Exit status 1
── A13987306 전용 84.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13987306 --area 84.85

▶ 하계극동건영벽산 (A13987306) · 전용 84.85㎡ · 11350-10400 · 지번 후보 271-3
   지번 271-3 (0271-0003) → 줄 0개
::error::지번 후보 271-3 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13987306 --area 84.85`
Exit status 1
── A10027281 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027281 --area 59.99

▶ 동탄2신도시 하우스디 더 레이크 (A10027281) · 전용 59.99㎡ · 41597-11200 · 지번 후보 693
   지번 693 (0693-0000) → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027281-59.json
   전유 59.99 + 주거공용 22.776 = 공급 82.77㎡ = 25.04평 → **25평**
   표본: 2624동 1802 (같은 전용 호 15개) · 전용률 72.5%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 21.2482
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 1.5281
── A14210002 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14210002 --area 59.76

▶ 삼각산아이원 (A14210002) · 전용 59.76㎡ · 11305-10100 · 지번 후보 1357
::error::1357 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A14210002 --area 59.76`
Exit status 1
```
