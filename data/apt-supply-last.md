# 단지 공급면적 — 마지막 실행

- 성공 9건 · 실패 15건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) · 대지 → 줄 2800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 41개) · 전용률 67.9%
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
   지번 248 (0248-0000) · 대지 → 줄 200개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
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
── A10024426 전용 59.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024426 --area 59.86

▶ 마곡엠밸리9단지 (A10024426) · 전용 59.86㎡ · 11500-10500 · 지번 후보 744
   지번 744 (0744-0000) · 대지 → 줄 0개
::error::지번 후보 744 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024426 --area 59.86`
Exit status 1
── A10022845 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022845 --area 59.98

▶ 산성역자이푸르지오1단지 (A10022845) · 전용 59.98㎡ · 41131-10100 · 지번 후보 6961
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
   지번 110 (0110-0000) · 대지 → 줄 2500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42385005-84.json
   전유 84.79 + 주거공용 19.66 = 공급 104.45㎡ = 31.6평 → **32평**
   표본: 1223동 301호 (같은 전용 호 215개) · 전용률 81.2%
     · 아파트 / [지상 3층] 19.66
── A10022677 전용 84.35

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022677 --area 84.35

▶ 북수원자이렉스비아 (A10022677) · 전용 84.35㎡ · 41111-13000 · 지번 후보 964, 530-6
::error::964 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022677 --area 84.35`
Exit status 1
── A44878309 전용 60.03

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44878309 --area 60.03

▶ 수지현대아파트 (A44878309) · 전용 60.03㎡ · 41465-10100 · 지번 후보 1932-6, 481, 700-1
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
   지번 538 (0538-0000) · 대지 → 줄 0개
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
── A44851612 전용 84.7831

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44851612 --area 84.7831

▶ 상현엘지자이 (A44851612) · 전용 84.7831㎡ · 41465-10700 · 지번 후보 869
::error::869 22쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44851612 --area 84.7831`
Exit status 1
── A10026125 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026125 --area 59.92

▶ 네이처포레 아파트 (A10026125) · 전용 59.92㎡ · 41390-10600 · 지번 후보 632
   지번 632 (0632-0000) · 대지 → 줄 0개
::error::지번 후보 632 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026125 --area 59.92`
Exit status 1
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
── A10024426 전용 59.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024426 --area 59.86

▶ 마곡엠밸리9단지 (A10024426) · 전용 59.86㎡ · 11500-10500 · 지번 후보 744
   지번 744 (0744-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024426-59.json
   전유 59.86 + 주거공용 24.07 = 공급 83.93㎡ = 25.39평 → **25평**
   표본: 905동 1202 (같은 전용 호 1개) · 전용률 71.3%
     · 아파트 / 계단실,승강기,홀,복도 [지상 각층] 19.77
     · 아파트 / 벽체 [지상 12층] 4.3
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
── A10022677 전용 84.35

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022677 --area 84.35

▶ 북수원자이렉스비아 (A10022677) · 전용 84.35㎡ · 41111-13000 · 지번 후보 964, 530-6
   지번 964 (0964-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022677-84.json
   전유 84.35 + 주거공용 24.33 = 공급 108.68㎡ = 32.88평 → **33평**
   표본: 109동 2904 (같은 전용 호 10개) · 전용률 77.6%
     · 아파트 / 계단실 [지상 각층] 17.68
     · 아파트 / 벽체 [지상 29층] 6.65
── A44878309 전용 60.03

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44878309 --area 60.03

▶ 수지현대아파트 (A44878309) · 전용 60.03㎡ · 41465-10100 · 지번 후보 1932-6, 481, 700-1
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44878309-59.json
   전유 60.03 + 주거공용 14.214 = 공급 74.24㎡ = 22.46평 → **22평**
   표본: 101동 1402호 (같은 전용 호 74개) · 전용률 80.9%
     · 아파트 / 복도.계단 [지상 14층] 9.67
     · 아파트 / 대피소 [지하 지1층] 4.544
── A10027928 전용 59.4313

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027928 --area 59.4313

▶ 동탄역센트럴푸르지오 (A10027928) · 전용 59.4313㎡ · 41597-10500 · 지번 후보 538, 510-889
   지번 538 (0538-0000) · 대지 → 줄 800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027928-59.json
   전유 59.431 + 주거공용 23.36 = 공급 82.79㎡ = 25.04평 → **25평**
   표본: 1329동 605 (같은 전용 호 89개) · 전용률 71.8%
     · 아파트 / 계단,벽체 [지상 각층] 23.3602
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
── A44851612 전용 84.7831

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44851612 --area 84.7831

▶ 상현엘지자이 (A44851612) · 전용 84.7831㎡ · 41465-10700 · 지번 후보 869
   지번 869 (0869-0000) · 대지 → 줄 400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44851612-84.json
   전유 84.783 + 주거공용 29.691 = 공급 114.47㎡ = 34.63평 → **35평**
   표본: 910동 1101호 (같은 전용 호 28개) · 전용률 74.1%
     · 아파트 / 계단실,승강기,벽체,전실 [각층] 29.6907
── A10026125 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026125 --area 59.92

▶ 네이처포레 아파트 (A10026125) · 전용 59.92㎡ · 41390-10600 · 지번 후보 632
   지번 632 (0632-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026125-59.json
   전유 59.92 + 주거공용 24.257 = 공급 84.18㎡ = 25.46평 → **25평**
   표본: 1111동 902 (같은 전용 호 3개) · 전용률 71.2%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 23.0002
     · 아파트 / 지하주차장연결통로,피트연결통로 [각층 지2-지1] 1.2571
```
