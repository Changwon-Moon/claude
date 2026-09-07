# 단지 공급면적 — 마지막 실행

- 성공 40건 · 실패 83건 · 미룸 711줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 110/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
 84.99`
Exit status 1
── A10027754 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027754 --area 59.99

▶ 힐스테이트황금산아파트 (A10027754) · 전용 59.99㎡ · 41360-11200 · 지번 후보 3129-65
   지번 3129-65 (3129-0065) · 대지 → 줄 0개
::error::지번 후보 3129-65 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027754 --area 59.99`
Exit status 1
── A10024059 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024059 --area 59.95

▶ 과천자이아파트 (A10024059) · 전용 59.95㎡ · 41290-10900 · 지번 후보 52
   지번 52 (0052-0000) · 대지 → 줄 0개
::error::지번 후보 52 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024059 --area 59.95`
Exit status 1
── A10024059 전용 84.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024059 --area 84.93

▶ 과천자이아파트 (A10024059) · 전용 84.93㎡ · 41290-10900 · 지번 후보 52
   지번 52 (0052-0000) · 대지 → 줄 0개
::error::지번 후보 52 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024059 --area 84.93`
Exit status 1
── A10024935 전용 84.9499

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024935 --area 84.9499

▶ 과천푸르지오써밋 (A10024935) · 전용 84.9499㎡ · 41290-10700 · 지번 후보 37
   지번 37 (0037-0000) · 대지 → 줄 0개
::error::지번 후보 37 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024935 --area 84.9499`
Exit status 1
── A10024935 전용 59.934

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024935 --area 59.934

▶ 과천푸르지오써밋 (A10024935) · 전용 59.934㎡ · 41290-10700 · 지번 후보 37
   지번 37 (0037-0000) · 대지 → 줄 0개
::error::지번 후보 37 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024935 --area 59.934`
Exit status 1
── A10024952 전용 84.982

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024952 --area 84.982

::error::A10024952 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024952 --area 84.982`
Exit status 1
── A41202001 전용 84.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41202001 --area 84.86

▶ 원당e-편한세상 (A41202001) · 전용 84.86㎡ · 41281-10600 · 지번 후보 869
   지번 869 (0869-0000) · 대지 → 줄 2400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41202001-84.json
   전유 84.86 + 주거공용 27.266 = 공급 112.13㎡ = 33.92평 → **34평**
   표본: 116동 2603 (같은 전용 호 164개) · 전용률 75.7%
     · 아파트 / 벽체,계단,복도 [각층 각층] 27.266
── A10027815 전용 84.739

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027815 --area 84.739

▶ 삼송2차 아이파크 (A10027815) · 전용 84.739㎡ · 41281-11100 · 지번 후보 311
   지번 311 (0311-0000) · 대지 → 줄 0개
::error::지번 후보 311 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027815 --area 84.739`
Exit status 1
── A41206003 전용 84.38

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41206003 --area 84.38

▶ 도래울파크뷰 (A41206003) · 전용 84.38㎡ · 41281-10500 · 지번 후보 1103
   지번 1103 (1103-0000) · 대지 → 줄 0개
::error::1103 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A41206003 --area 84.38`
Exit status 1
── A41280403 전용 84.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41280403 --area 84.8

▶ 관산주공그린빌 (A41280403) · 전용 84.8㎡ · 41281-11800 · 지번 후보 996
   지번 996 (0996-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41280403-84.json
   전유 84.8 + 주거공용 26.208 = 공급 111.01㎡ = 33.58평 → **34평**
   표본: 101동 1301 (같은 전용 호 215개) · 전용률 76.4%
     · 아파트 / 계단,승강기 [각층 각층] 25.4745
     · 아파트 / 지하계단실 [지하 지1층] 0.7338
── A10023355 전용 84.6097

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023355 --area 84.6097

▶ 안산푸르지오브리파크 (A10023355) · 전용 84.6097㎡ · 41273-10800 · 지번 후보 830
   지번 830 (0830-0000) · 대지 → 줄 0개
::error::지번 후보 830 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023355 --area 84.6097`
Exit status 1
── A10023355 전용 59.9692

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023355 --area 59.9692

▶ 안산푸르지오브리파크 (A10023355) · 전용 59.9692㎡ · 41273-10800 · 지번 후보 830
::error::830 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023355 --area 59.9692`
Exit status 1
── A10025458 전용 84.8438

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025458 --area 84.8438

▶ 초지역메이저타운푸르지오파크단지(초지역메이저타운푸르지오파크단지) (A10025458) · 전용 84.8438㎡ · 41273-10700 · 지번 후보 605-3
   지번 605-3 (0605-0003) · 대지 → 줄 0개
::error::지번 후보 605-3 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025458 --area 84.8438`
Exit status 1
── A10025039 전용 84.9673

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025039 --area 84.9673

▶ 안산 라프리모 (A10025039) · 전용 84.9673㎡ · 41273-10900 · 지번 후보 1188
   지번 1188 (1188-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025039-84.json
   전유 84.967 + 주거공용 24.66 = 공급 109.63㎡ = 33.16평 → **33평**
   표본: 107동 2201 (같은 전용 호 148개) · 전용률 77.5%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 17.4152
     · 아파트 / 벽체 [지상 22층] 7.245
── A10025963 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025963 --area 84.96

▶ 고잔롯데캐슬골드파크아파트 (A10025963) · 전용 84.96㎡ · 41273-10100 · 지번 후보 586
   지번 586 (0586-0000) · 대지 → 줄 0개
::error::지번 후보 586 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025963 --area 84.96`
Exit status 1
── A10025963 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025963 --area 59.98

▶ 고잔롯데캐슬골드파크아파트 (A10025963) · 전용 59.98㎡ · 41273-10100 · 지번 후보 586
   지번 586 (0586-0000) · 대지 → 줄 0개
::error::지번 후보 586 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025963 --area 59.98`
Exit status 1
── A10025458 전용 59.863

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025458 --area 59.863

▶ 초지역메이저타운푸르지오파크단지(초지역메이저타운푸르지오파크단지) (A10025458) · 전용 59.863㎡ · 41273-10700 · 지번 후보 605-3
   지번 605-3 (0605-0003) · 대지 → 줄 0개
::error::지번 후보 605-3 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025458 --area 59.863`
Exit status 1
── A42513202 전용 59.9624

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42513202 --area 59.9624

▶ 안산8차푸르지오 (A42513202) · 전용 59.9624㎡ · 41273-10800 · 지번 후보 937
   지번 937 (0937-0000) · 대지 → 줄 900개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42513202-59.json
   전유 59.962 + 주거공용 18.467 = 공급 78.43㎡ = 23.73평 → **24평**
   표본: 806동 803호 (같은 전용 호 28개) · 전용률 76.4%
     · 아파트 / 계단실,승강기 [각층 각층] 14.1339
     · 아파트 / 벽체 [지상 8층] 4.3335
── A42514303 전용 84.975

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42514303 --area 84.975

▶ 수정한양 (A42514303) · 전용 84.975㎡ · 41273-10900 · 지번 후보 1086
   지번 1086 (1086-0000) · 대지 → 줄 100개
::error::전용 84.975㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1086) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42514303 --area 84.975`
Exit status 1
── A42583104 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42583104 --area 84.88

▶ 공작한양(고층) (A42583104) · 전용 84.88㎡ · 41273-10900 · 지번 후보 1085
   지번 1085 (1085-0000) · 대지 → 줄 3000개
::error::전용 84.88㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1085) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42583104 --area 84.88`
Exit status 1
── A42580506 전용 61.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42580506 --area 61.77

▶ 중앙주공5단지 (A42580506) · 전용 61.77㎡ · 41273-10100 · 지번 후보 359-1, 674
   지번 359-1 (0359-0001) · 대지 → 줄 0개
   지번 674 (0674-0000) · 대지 → 줄 0개
::error::지번 후보 359-1, 674 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42580506 --area 61.77`
Exit status 1
── A10027619 전용 59.5637

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027619 --area 59.5637

▶ 안산레이크타운 푸르지오 아파트 (A10027619) · 전용 59.5637㎡ · 41273-10100 · 지번 후보 782
   지번 782 (0782-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027619-59.json
   전유 59.564 + 주거공용 25.976 = 공급 85.54㎡ = 25.88평 → **26평**
   표본: 103동 2402 (같은 전용 호 1개) · 전용률 69.6%
     · 아파트 / 계단,복도,ELEV. [지상 각층] 20.3299
     · 아파트 / 벽체 [지상 각층] 5.6462
   ⚠️ 전용률 69.6% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10025014 전용 59.9068

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025014 --area 59.9068

▶ 그랑시티자이아파트 (A10025014) · 전용 59.9068㎡ · 41271-10300 · 지번 후보 1639-7
   지번 1639-7 (1639-0007) · 대지 → 줄 0개
::error::지번 후보 1639-7 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025014 --area 59.9068`
Exit status 1
── A42683705 전용 61.65

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42683705 --area 61.65

▶ 성포예술인 (A42683705) · 전용 61.65㎡ · 41271-10800 · 지번 후보 583
   지번 583 (0583-0000) · 대지 → 줄 0개
::error::지번 후보 583 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42683705 --area 61.65`
Exit status 1
── A42681504 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42681504 --area 59.94

▶ 안산월드1단지 (A42681504) · 전용 59.94㎡ · 41271-10400 · 지번 후보 872
   지번 872 (0872-0000) · 대지 → 줄 2790개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42681504-59.json
   전유 59.94 + 주거공용 18.51 = 공급 78.45㎡ = 23.73평 → **24평**
   표본: 122동 1층106호 (같은 전용 호 60개) · 전용률 76.4%
     · 아파트 / [] 18.51
── A42683704 전용 61.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42683704 --area 61.52

▶ 성포주공10단지 (A42683704) · 전용 61.52㎡ · 41271-10800 · 지번 후보 30, 584
   지번 30 (0030-0000) · 대지 → 줄 0개
   지번 584 (0584-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42683704-59.json
   전유 61.52 + 주거공용 22.56 = 공급 84.08㎡ = 25.43평 → **25평**
   표본: 1001동 1005호 (같은 전용 호 37개) · 전용률 73.2%
     · 아파트 / [] 22.56
── A42681505 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42681505 --area 84.91

▶ 상림 우성 (A42681505) · 전용 84.91㎡ · 41271-10400 · 지번 후보 872-20
   지번 872-20 (0872-0020) · 대지 → 줄 0개
::error::지번 후보 872-20 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42681505 --area 84.91`
Exit status 1
── A42618201 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42618201 --area 84.92

▶ 신안1단지 (A42618201) · 전용 84.92㎡ · 41271-10400 · 지번 후보 871
   지번 871 (0871-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42618201-84.json
   전유 84.92 + 주거공용 23.286 = 공급 108.21㎡ = 32.73평 → **33평**
   표본: 103동 1408호 (같은 전용 호 8개) · 전용률 78.5%
     · 아파트 / 지하층,복도,계단 [지상] 23.286
── A42672901 전용 58.5439

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42672901 --area 58.5439

▶ 상록수한양 (A42672901) · 전용 58.5439㎡ · 41271-10400 · 지번 후보 880
   지번 880 (0880-0000) · 대지 → 줄 300개
::error::전용 58.5439㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 880) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42672901 --area 58.5439`
Exit status 1
── A42621003 전용 59.9713

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42621003 --area 59.9713

▶ 건건이편한세상 (A42621003) · 전용 59.9713㎡ · 41271-11100 · 지번 후보 987
   지번 987 (0987-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42621003-59.json
   전유 59.971 + 주거공용 20.976 = 공급 80.95㎡ = 24.49평 → **24평**
   표본: 118동 704 (같은 전용 호 235개) · 전용률 74.1%
     · 아파트 / 계단,승강기,벽체 [각층 각층] 20.9762
── A10023196 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023196 --area 59.98

::error::A10023196 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023196 --area 59.98`
Exit status 1
── A10024071 전용 84.8441

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024071 --area 84.8441

::error::A10024071 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024071 --area 84.8441`
Exit status 1
── A10024174 전용 59.9701

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024174 --area 59.9701

▶ 동문굿모닝힐맘시티3단지 (A10024174) · 전용 59.9701㎡ · 41220-10500 · 지번 후보 613
   지번 613 (0613-0000) · 대지 → 줄 1500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024174-59.json
   전유 59.97 + 주거공용 20.343 = 공급 80.31㎡ = 24.29평 → **24평**
   표본: 305동 503 (같은 전용 호 118개) · 전용률 74.7%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 13.0085
     · 아파트 / 벽체 [지상 5층] 7.3348
── A10024484 전용 59.8696

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024484 --area 59.8696

::error::A10024484 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024484 --area 59.8696`
Exit status 1
── A10024484 전용 84.9974

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024484 --area 84.9974

::error::A10024484 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024484 --area 84.9974`
Exit status 1
── A10024656 전용 84.7982

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024656 --area 84.7982

▶ 더샵 지제역 센트럴파크 2BL (A10024656) · 전용 84.7982㎡ · 41220-11900 · 지번 후보 388-13
   지번 388-13 (0388-0013) · 대지 → 줄 0개
::error::388-13 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024656 --area 84.7982`
Exit status 1
── A10024656 전용 59.7656

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024656 --area 59.7656

▶ 더샵 지제역 센트럴파크 2BL (A10024656) · 전용 59.7656㎡ · 41220-11900 · 지번 후보 388-13
   지번 388-13 (0388-0013) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024656-59.json
   전유 59.766 + 주거공용 19.694 = 공급 79.46㎡ = 24.04평 → **24평**
   표본: 202동 1002 (같은 전용 호 171개) · 전용률 75.2%
     · 아파트 / 계단,복도 [지상 각층] 13.1039
     · 아파트 / 벽체 [지상 10층] 6.5904
── A10025440 전용 84.772

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025440 --area 84.772

::error::A10025440 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025440 --area 84.772`
Exit status 1
── A10025311 전용 84.9718

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025311 --area 84.9718

▶ 평택지제역동문디이스트2단지 (A10025311) · 전용 84.9718㎡ · 41220-10500 · 지번 후보 559
   지번 559 (0559-0000) · 대지 → 줄 1300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025311-84.json
   전유 84.972 + 주거공용 29.716 = 공급 114.69㎡ = 34.69평 → **35평**
   표본: 201동 402 (같은 전용 호 30개) · 전용률 74.1%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 22.6579
     · 아파트 / 벽체 [지상 4층] 7.058
── A10025440 전용 59.875

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025440 --area 59.875

::error::A10025440 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025440 --area 59.875`
Exit status 1
── A10026324 전용 84.73

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026324 --area 84.73

▶ 힐스테이트평택2차 (A10026324) · 전용 84.73㎡ · 41220-12000 · 지번 후보 1002-1
::error::1002-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026324 --area 84.73`
Exit status 1
── A10022961 전용 84.8825

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022961 --area 84.8825

▶ 광명푸르지오포레나 (A10022961) · 전용 84.8825㎡ · 41210-10100 · 지번 후보 42-42
   지번 42-42 (0042-0042) · 대지 → 줄 0개
::error::지번 후보 42-42 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022961 --area 84.8825`
Exit status 1
── A10022961 전용 59.994

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022961 --area 59.994

▶ 광명푸르지오포레나 (A10022961) · 전용 59.994㎡ · 41210-10100 · 지번 후보 42-42
   지번 42-42 (0042-0042) · 대지 → 줄 0개
::error::지번 후보 42-42 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022961 --area 59.994`
Exit status 1
── A10023884 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023884 --area 59.98

▶ 철산역 롯데캐슬 & SK VIEW 클래스티지 (A10023884) · 전용 59.98㎡ · 41210-10200 · 지번 후보 639-1
   지번 639-1 (0639-0001) · 대지 → 줄 1900개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023884-59.json
   전유 59.98 + 주거공용 23.83 = 공급 83.81㎡ = 25.35평 → **25평**
   표본: 112동 1902 (같은 전용 호 132개) · 전용률 71.6%
     · 아파트 / 계단실 [지상 각층] 17.04
     · 아파트 / 벽체 [지상 19층] 6.79
── A10024531 전용 59.9915

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024531 --area 59.9915

▶ 광명아크포레자이위브아파트 (A10024531) · 전용 59.9915㎡ · 41210-10100 · 지번 후보 787-4
   지번 787-4 (0787-0004) · 대지 → 줄 0개
::error::787-4 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024531 --area 59.9915`
Exit status 1
── A10025825 전용 59.9968

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025825 --area 59.9968

▶ 광명역센트럴자이아파트 (A10025825) · 전용 59.9968㎡ · 41210-10600 · 지번 후보 517
   지번 517 (0517-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025825-59.json
   전유 59.997 + 주거공용 27.747 = 공급 87.74㎡ = 26.54평 → **27평**
   표본: 204동 2104 (같은 전용 호 5개) · 전용률 68.4%
     · 아파트 / 계단실 [지상 각층] 21.6973
     · 아파트 / 벽체 [지상 21층] 6.0495
   ⚠️ 전용률 68.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10025825 전용 84.9933

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025825 --area 84.9933

▶ 광명역센트럴자이아파트 (A10025825) · 전용 84.9933㎡ · 41210-10600 · 지번 후보 517
   지번 517 (0517-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025825-84.json
   전유 84.993 + 주거공용 32.079 = 공급 117.07㎡ = 35.41평 → **35평**
   표본: 206동 3001 (같은 전용 호 11개) · 전용률 72.6%
     · 아파트 / 계단실 [지상 각층] 24.8106
     · 아파트 / 벽체 [지상 30층] 7.268
── A42385203 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385203 --area 84.41

▶ 하안주공8단지 (A42385203) · 전용 84.41㎡ · 41210-10300 · 지번 후보 260
   지번 260 (0260-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42385203-84.json
   전유 84.41 + 주거공용 16.31 = 공급 100.72㎡ = 30.47평 → **30평**
   표본: 816동 204호 (같은 전용 호 5개) · 전용률 83.8%
     · 아파트 / [] 16.31
── A42381904 전용 56.49

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42381904 --area 56.49

▶ 광명중앙하이츠 (A42381904) · 전용 56.49㎡ · 41210-10100 · 지번 후보 713
   지번 713 (0713-0000) · 대지 → 줄 0개
::error::지번 후보 713 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42381904 --area 56.49`
Exit status 1
── A42385203 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385203 --area 58.01

▶ 하안주공8단지 (A42385203) · 전용 58.01㎡ · 41210-10300 · 지번 후보 260
   지번 260 (0260-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42385203-59.json
   전유 58.01 + 주거공용 22.16 = 공급 80.17㎡ = 24.25평 → **24평**
   표본: 803동 1504호 (같은 전용 호 393개) · 전용률 72.4%
     · 아파트 / [] 22.16
── A42385302 전용 59.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385302 --area 59.39

▶ 하안주공7단지 (A42385302) · 전용 59.39㎡ · 41210-10300 · 지번 후보 295
   지번 295 (0295-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42385302-59.json
   전유 59.39 + 주거공용 23.18 = 공급 82.57㎡ = 24.98평 → **25평**
   표본: 711동 904호 (같은 전용 호 35개) · 전용률 71.9%
     · 아파트 / [] 23.18
── A42385402 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385402 --area 58.01

▶ 하안주공5단지 (A42385402) · 전용 58.01㎡ · 41210-10300 · 지번 후보 359-1, 702
   지번 359-1 (0359-0001) · 대지 → 줄 0개
   지번 702 (0702-0000) · 대지 → 줄 0개
::error::702 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42385402 --area 58.01`
Exit status 1
── A42384702 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42384702 --area 58.01

▶ 하안주공4단지 (A42384702) · 전용 58.01㎡ · 41210-10300 · 지번 후보 651
   지번 651 (0651-0000) · 대지 → 줄 0개
::error::지번 후보 651 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42384702 --area 58.01`
Exit status 1
── A42385005 전용 59.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385005 --area 59.22

▶ 하안12단지 (A42385005) · 전용 59.22㎡ · 41210-10300 · 지번 후보 110
   지번 110 (0110-0000) · 대지 → 줄 2100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42385005-59.json
   전유 59.22 + 주거공용 18.67 = 공급 77.89㎡ = 23.56평 → **24평**
   표본: 1221동 704호 (같은 전용 호 276개) · 전용률 76.0%
     · / [] 18.67
── A42384503 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42384503 --area 58.01

▶ 하안주공10단지 (A42384503) · 전용 58.01㎡ · 41210-10300 · 지번 후보 30
   지번 30 (0030-0000) · 대지 → 줄 0개
::error::30 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42384503 --area 58.01`
Exit status 1
── A42374402 전용 84.975

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42374402 --area 84.975

▶ e편한세상센트레빌 (A42374402) · 전용 84.975㎡ · 41210-10300 · 지번 후보 864
   지번 864 (0864-0000) · 대지 → 줄 0개
::error::지번 후보 864 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42374402 --area 84.975`
Exit status 1
── A42374401 전용 84.9962

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42374401 --area 84.9962

▶ 광명두산위브트레지움 (A42374401) · 전용 84.9962㎡ · 41210-10300 · 지번 후보 769, 10, 1331, 863, 1708
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 863 (0863-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42374401-84.json
   전유 84.996 + 주거공용 33.234 = 공급 118.23㎡ = 35.76평 → **36평**
   표본: 107동 2604 (같은 전용 호 180개) · 전용률 71.9%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 33.2339
── A42370302 전용 84.993

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42370302 --area 84.993

▶ 철산푸르지오하늘채 (A42370302) · 전용 84.993㎡ · 41210-10200 · 지번 후보 637
   지번 637 (0637-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42370302-84.json
   전유 84.993 + 주거공용 27.168 = 공급 112.16㎡ = 33.93평 → **34평**
   표본: 107동 602 (같은 전용 호 19개) · 전용률 75.8%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 27.168
── A42370302 전용 59.985

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42370302 --area 59.985

▶ 철산푸르지오하늘채 (A42370302) · 전용 59.985㎡ · 41210-10200 · 지번 후보 637
   지번 637 (0637-0000) · 대지 → 줄 0개
::error::637 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42370302 --area 59.985`
Exit status 1
── A42370301 전용 84.35

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42370301 --area 84.35

▶ 철산래미안자이 (A42370301) · 전용 84.35㎡ · 41210-10200 · 지번 후보 634
   지번 634 (0634-0000) · 대지 → 줄 0개
::error::지번 후보 634 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42370301 --area 84.35`
Exit status 1
── A42370301 전용 59.67

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42370301 --area 59.67

▶ 철산래미안자이 (A42370301) · 전용 59.67㎡ · 41210-10200 · 지번 후보 634
   지번 634 (0634-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42370301-59.json
   전유 59.67 + 주거공용 24.533 = 공급 84.2㎡ = 25.47평 → **25평**
   표본: 105동 301 (같은 전용 호 101개) · 전용률 70.9%
     · 아파트 / 계단실,승강기 [각층 각층] 19.623
     · 아파트 / 벽체 [각층 각층] 4.91
── A42383806 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42383806 --area 84.97

▶ 철산주공12단지 (A42383806) · 전용 84.97㎡ · 41210-10200 · 지번 후보 110, 449-6
   지번 110 (0110-0000) · 대지 → 줄 0개
   지번 449-6 (0449-0006) · 대지 → 줄 0개
::error::지번 후보 110, 449-6 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42383806 --area 84.97`
Exit status 1
── A42383806 전용 60.21

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42383806 --area 60.21

▶ 철산주공12단지 (A42383806) · 전용 60.21㎡ · 41210-10200 · 지번 후보 110, 449-6
   지번 110 (0110-0000) · 대지 → 줄 0개
   지번 449-6 (0449-0006) · 대지 → 줄 0개
::error::지번 후보 110, 449-6 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42383806 --area 60.21`
Exit status 1
── A10027643 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027643 --area 84.98

▶ 광명철산도덕파크타운 (A10027643) · 전용 84.98㎡ · 41210-10200 · 지번 후보 625
   지번 625 (0625-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027643-84.json
   전유 84.98 + 주거공용 22.007 = 공급 106.99㎡ = 32.36평 → **32평**
   표본: 102동 2302호 (같은 전용 호 3개) · 전용률 79.4%
     · 아파트 / 계단실,승강기,복도등 [각층] 22.0071
── A10026455 전용 84.9663

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026455 --area 84.9663

▶ 광명역써밋플레이스 (A10026455) · 전용 84.9663㎡ · 41210-10600 · 지번 후보 513
   지번 513 (0513-0000) · 대지 → 줄 0개
::error::지번 후보 513 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026455 --area 84.9663`
Exit status 1
── A10026455 전용 59.6827

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026455 --area 59.6827

▶ 광명역써밋플레이스 (A10026455) · 전용 59.6827㎡ · 41210-10600 · 지번 후보 513
   지번 513 (0513-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026455-59.json
   전유 59.683 + 주거공용 29.187 = 공급 88.87㎡ = 26.88평 → **27평**
   표본: 106동 2804 (같은 전용 호 69개) · 전용률 67.2%
     · 아파트 / 벽체,계단실,복도 [지상 각층] 26.8783
     · 아파트 / 주동출입구 [각층 지3~지1] 2.3087
   ⚠️ 전용률 67.2% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A42381904 전용 84.79

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42381904 --area 84.79

▶ 광명중앙하이츠 (A42381904) · 전용 84.79㎡ · 41210-10100 · 지번 후보 713
   지번 713 (0713-0000) · 대지 → 줄 1200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42381904-84.json
   전유 84.79 + 주거공용 22.15 = 공급 106.94㎡ = 32.35평 → **32평**
   표본: 제202동 107호 (같은 전용 호 61개) · 전용률 79.3%
     · 아파트 / 계단,복도 [1층] 11.64
     · 아파트 / 지하 [지1] 10.51
── A42376401 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42376401 --area 84.99

▶ 광명해모로이연 (A42376401) · 전용 84.99㎡ · 41210-10100 · 지번 후보 785
   지번 785 (0785-0000) · 대지 → 줄 0개
::error::785 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42376401 --area 84.99`
Exit status 1
── A42376401 전용 59.993

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42376401 --area 59.993

▶ 광명해모로이연 (A42376401) · 전용 59.993㎡ · 41210-10100 · 지번 후보 785
   지번 785 (0785-0000) · 대지 → 줄 0개
::error::지번 후보 785 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42376401 --area 59.993`
Exit status 1
── A42280406 전용 84.49

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42280406 --area 84.49

▶ 부천범박힐스테이트1단지 (A42280406) · 전용 84.49㎡ · 41194-10300 · 지번 후보 154-2
   지번 154-2 (0154-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42280406-84.json
   전유 84.49 + 주거공용 24.69 = 공급 109.18㎡ = 33.03평 → **33평**
   표본: 108동 302 (같은 전용 호 64개) · 전용률 77.4%
     · 아파트 / 계단실,벽체,승강기홀 [각층 각층] 24.69
── A10026648 전용 84.9942

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026648 --area 84.9942

▶ 옥길호반베르디움아파트 (A10026648) · 전용 84.9942㎡ · 41194-10600 · 지번 후보 780-1
   지번 780-1 (0780-0001) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026648-84.json
   전유 84.994 + 주거공용 28.727 = 공급 113.72㎡ = 34.4평 → **34평**
   표본: 114동 2101 (같은 전용 호 2개) · 전용률 74.7%
     · 아파트 / 벽체,계단실 [지상 각층] 27.5379
     · 아파트 / 주동출입구 [각층 지2~지1] 1.1893
── A10026570 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026570 --area 84.88

▶ 옥길센트리뷰 (A10026570) · 전용 84.88㎡ · 41194-10600 · 지번 후보 771-1
   지번 771-1 (0771-0001) · 대지 → 줄 0개
::error::지번 후보 771-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026570 --area 84.88`
Exit status 1
── A10026570 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026570 --area 59.97

▶ 옥길센트리뷰 (A10026570) · 전용 59.97㎡ · 41194-10600 · 지번 후보 771-1
   지번 771-1 (0771-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026570-59.json
   전유 59.97 + 주거공용 18.897 = 공급 78.87㎡ = 23.86평 → **24평**
   표본: 714동 302 (같은 전용 호 73개) · 전용률 76.0%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 18.8967
── A10027437 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027437 --area 84.91

▶ 옥길브리즈힐 (A10027437) · 전용 84.91㎡ · 41194-10600 · 지번 후보 751-1
   지번 751-1 (0751-0001) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027437-84.json
   전유 84.91 + 주거공용 27.486 = 공급 112.4㎡ = 34평 → **34평**
   표본: 608동 302 (같은 전용 호 9개) · 전용률 75.5%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 27.4857
── A42204005 전용 84.874

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42204005 --area 84.874

▶ 중동역푸르지오 (A42204005) · 전용 84.874㎡ · 41194-10500 · 지번 후보 372
   지번 372 (0372-0000) · 대지 → 줄 0개
::error::지번 후보 372 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42204005 --area 84.874`
Exit status 1
── A42204005 전용 59.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42204005 --area 59.8

▶ 중동역푸르지오 (A42204005) · 전용 59.8㎡ · 41194-10500 · 지번 후보 372
   지번 372 (0372-0000) · 대지 → 줄 100개
::error::전용 59.8㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 372) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42204005 --area 59.8`
Exit status 1
── A42204005 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42204005 --area 84.96

▶ 중동역푸르지오 (A42204005) · 전용 84.96㎡ · 41194-10500 · 지번 후보 372
   지번 372 (0372-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42204005-84.json
   전유 84.874 + 주거공용 24.516 = 공급 109.39㎡ = 33.09평 → **33평**
   표본: 103동 1503 (같은 전용 호 18개) · 전용률 77.6%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 13.905
     · 아파트 / 벽체 [각층 각층] 10.611
── A42204005 전용 59.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42204005 --area 59.82

▶ 중동역푸르지오 (A42204005) · 전용 59.82㎡ · 41194-10500 · 지번 후보 372
   지번 372 (0372-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42204005-59.json
   전유 59.8 + 주거공용 20.324 = 공급 80.12㎡ = 24.24평 → **24평**
   표본: 102동 1102 (같은 전용 호 88개) · 전용률 74.6%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 14.438
     · 아파트 / 벽체 [각층 각층] 5.886
── A42281205 전용 59.45

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42281205 --area 59.45

▶ 소사주공 (A42281205) · 전용 59.45㎡ · 41194-10100 · 지번 후보 400-8
   지번 400-8 (0400-0008) · 대지 → 줄 700개
::error::전용 59.45㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 400-8) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42281205 --area 59.45`
Exit status 1
── A42270608 전용 84.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42270608 --area 84.85

▶ 소새울역중흥S클래스 (A42270608) · 전용 84.85㎡ · 41194-10100 · 지번 후보 411-1
   지번 411-1 (0411-0001) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42270608-84.json
   전유 84.85 + 주거공용 26.482 = 공급 111.33㎡ = 33.68평 → **34평**
   표본: 404동 1002 (같은 전용 호 9개) · 전용률 76.2%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 25.611
     · 아파트 / 피트통로 [지하 지1] 0.871
⏳ 시간 예산(1200초)에 닿아 711줄은 다음 칸으로 미룹니다
```
