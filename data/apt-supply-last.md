# 단지 공급면적 — 마지막 실행

- 성공 40건 · 실패 94건 · 미룸 656줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 240/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
�산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42681505 --area 84.91`
Exit status 1
── A42672901 전용 58.5439

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42672901 --area 58.5439

▶ 상록수한양 (A42672901) · 전용 58.5439㎡ · 41271-10400 · 지번 후보 880
   지번 880 (0880-0000) · 대지 → 줄 3000개
::error::전용 58.5439㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 880) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42672901 --area 58.5439`
Exit status 1
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
   지번 388-13 (0388-0013) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024656-84.json
   전유 84.798 + 주거공용 25.849 = 공급 110.65㎡ = 33.47평 → **33평**
   표본: 216동 501 (같은 전용 호 4개) · 전용률 76.6%
     · 아파트 / 계단,복도 [지상 각층] 18.5925
     · 아파트 / 벽체 [지상 5층] 7.2562
── A10025440 전용 84.772

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025440 --area 84.772

::error::A10025440 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025440 --area 84.772`
Exit status 1
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
   지번 1002-1 (1002-0001) · 대지 → 줄 0개
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
── A10024531 전용 59.9915

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024531 --area 59.9915

▶ 광명아크포레자이위브아파트 (A10024531) · 전용 59.9915㎡ · 41210-10100 · 지번 후보 787-4
   지번 787-4 (0787-0004) · 대지 → 줄 1400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024531-59.json
   전유 59.992 + 주거공용 19.061 = 공급 79.05㎡ = 23.91평 → **24평**
   표본: 1105동 1001 (같은 전용 호 93개) · 전용률 75.9%
     · 아파트 / 계단,복도 [각층 각층] 13.1101
     · 아파트 / 벽체 [지상 10층] 5.9507
── A42381904 전용 56.49

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42381904 --area 56.49

▶ 광명중앙하이츠 (A42381904) · 전용 56.49㎡ · 41210-10100 · 지번 후보 713
   지번 713 (0713-0000) · 대지 → 줄 2074개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42381904-59.json
   전유 56.49 + 주거공용 24.48 = 공급 80.97㎡ = 24.49평 → **24평**
   표본: 제202동 203호 (같은 전용 호 102개) · 전용률 69.8%
     · 아파트 / 계단,복도 [2층] 17.41
     · 아파트 / 지하 [지1] 7.07
   ⚠️ 전용률 69.8% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A42385402 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385402 --area 58.01

▶ 하안주공5단지 (A42385402) · 전용 58.01㎡ · 41210-10300 · 지번 후보 359-1, 702
   지번 359-1 (0359-0001) · 대지 → 줄 0개
   지번 702 (0702-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42385402-59.json
   전유 58.01 + 주거공용 22.16 = 공급 80.17㎡ = 24.25평 → **24평**
   표본: 509동 304호 (같은 전용 호 403개) · 전용률 72.4%
     · 아파트 / [] 22.16
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
── A42384503 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42384503 --area 58.01

▶ 하안주공10단지 (A42384503) · 전용 58.01㎡ · 41210-10300 · 지번 후보 30
   지번 30 (0030-0000) · 대지 → 줄 0개
::error::지번 후보 30 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42384503 --area 58.01`
Exit status 1
── A42374402 전용 84.975

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42374402 --area 84.975

▶ e편한세상센트레빌 (A42374402) · 전용 84.975㎡ · 41210-10300 · 지번 후보 864
   지번 864 (0864-0000) · 대지 → 줄 2600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42374402-84.json
   전유 84.975 + 주거공용 24.143 = 공급 109.12㎡ = 33.01평 → **33평**
   표본: 103동 1301 (같은 전용 호 134개) · 전용률 77.9%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 18.01
     · 아파트 / 벽체 [각층 각층] 6.133
── A42370302 전용 59.985

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42370302 --area 59.985

▶ 철산푸르지오하늘채 (A42370302) · 전용 59.985㎡ · 41210-10200 · 지번 후보 637
   지번 637 (0637-0000) · 대지 → 줄 2300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42370302-59.json
   전유 59.985 + 주거공용 20.602 = 공급 80.59㎡ = 24.38평 → **24평**
   표본: 103동 1903 (같은 전용 호 72개) · 전용률 74.4%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 20.602
── A42370301 전용 84.35

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42370301 --area 84.35

▶ 철산래미안자이 (A42370301) · 전용 84.35㎡ · 41210-10200 · 지번 후보 634
   지번 634 (0634-0000) · 대지 → 줄 0개
::error::634 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42370301 --area 84.35`
Exit status 1
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
── A10026455 전용 84.9663

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026455 --area 84.9663

▶ 광명역써밋플레이스 (A10026455) · 전용 84.9663㎡ · 41210-10600 · 지번 후보 513
   지번 513 (0513-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026455-84.json
   전유 84.966 + 주거공용 39.654 = 공급 124.62㎡ = 37.7평 → **38평**
   표본: 101동 1202 (같은 전용 호 146개) · 전용률 68.2%
     · 아파트 / 벽체,계단실,복도 [지상 각층] 36.3667
     · 아파트 / 주동출입구 [각층 지3~지1] 3.2868
   ⚠️ 전용률 68.2% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
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
   지번 785 (0785-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42376401-59.json
   전유 59.993 + 주거공용 21.201 = 공급 81.19㎡ = 24.56평 → **25평**
   표본: 114동 1602 (같은 전용 호 6개) · 전용률 73.9%
     · 아파트 / 계단실 [각층 각층] 16.125
     · 아파트 / 벽체 [각층 각층] 5.076
── A10026570 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026570 --area 84.88

▶ 옥길센트리뷰 (A10026570) · 전용 84.88㎡ · 41194-10600 · 지번 후보 771-1
   지번 771-1 (0771-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026570-84.json
   전유 84.88 + 주거공용 26.746 = 공급 111.63㎡ = 33.77평 → **34평**
   표본: 703동 1203 (같은 전용 호 183개) · 전용률 76.0%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 26.7459
── A42281205 전용 59.45

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42281205 --area 59.45

▶ 소사주공 (A42281205) · 전용 59.45㎡ · 41194-10100 · 지번 후보 400-8
   지번 400-8 (0400-0008) · 대지 → 줄 2500개
::error::전용 59.45㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 400-8) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42281205 --area 59.45`
Exit status 1
── A42270610 전용 84.9841

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42270610 --area 84.9841

▶ 소사SK-VIEW (A42270610) · 전용 84.9841㎡ · 41194-10100 · 지번 후보 135
   지번 135 (0135-0000) · 대지 → 줄 500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42270610-84.json
   전유 84.984 + 주거공용 22.87 = 공급 107.85㎡ = 32.63평 → **33평**
   표본: 110동 1601 (같은 전용 호 83개) · 전용률 78.8%
     · 아파트 / 계단실 [각층 각층] 17.4322
     · 아파트 / 벽체면적 [각층 각층] 5.4377
── A42280405 전용 84.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42280405 --area 84.39

▶ 부천범박힐스테이트4단지 (A42280405) · 전용 84.39㎡ · 41194-10300 · 지번 후보 152-2
   지번 152-2 (0152-0002) · 대지 → 줄 0개
::error::지번 후보 152-2 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42280405 --area 84.39`
Exit status 1
── A42280404 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42280404 --area 84.92

▶ 부천범박힐스테이트3단지 (A42280404) · 전용 84.92㎡ · 41194-10300 · 지번 후보 155-1
   지번 155-1 (0155-0001) · 대지 → 줄 0개
::error::지번 후보 155-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42280404 --area 84.92`
Exit status 1
── A42280406 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42280406 --area 59.95

▶ 부천범박힐스테이트1단지 (A42280406) · 전용 59.95㎡ · 41194-10300 · 지번 후보 154-2
   지번 154-2 (0154-0002) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42280406-59.json
   전유 59.95 + 주거공용 23.869 = 공급 83.82㎡ = 25.36평 → **25평**
   표본: 103동 403 (같은 전용 호 7개) · 전용률 71.5%
     · 아파트 / 계단실,벽체,승강기홀 [각층 각층] 23.8685
── A42085508 전용 84.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42085508 --area 84.93

▶ 중동금호한양한신아파트 (A42085508) · 전용 84.93㎡ · 41192-10800 · 지번 후보 1179
   지번 1179 (1179-0000) · 대지 → 줄 0개
::error::지번 후보 1179 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42085508 --area 84.93`
Exit status 1
── A42081209 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081209 --area 59.4

▶ 상동한아름2차 (A42081209) · 전용 59.4㎡ · 41192-10900 · 지번 후보 393
   지번 393 (0393-0000) · 대지 → 줄 2400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42081209-59.json
   전유 59.4 + 주거공용 17.598 = 공급 77㎡ = 23.29평 → **23평**
   표본: 1522동 1101호 (같은 전용 호 35개) · 전용률 77.1%
     · 부대시설 / 계단실,현관 [각층] 17.598
── A42084708 전용 84.81

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42084708 --area 84.81

▶ 중동금강마을주공 (A42084708) · 전용 84.81㎡ · 41192-10800 · 지번 후보 1029
   지번 1029 (1029-0000) · 대지 → 줄 0개
::error::지번 후보 1029 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42084708 --area 84.81`
Exit status 1
── A42084706 전용 59.56

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42084706 --area 59.56

▶ 중동한라마을주공3단지 (A42084706) · 전용 59.56㎡ · 41192-10800 · 지번 후보 1027
   지번 1027 (1027-0000) · 대지 → 줄 0개
::error::지번 후보 1027 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42084706 --area 59.56`
Exit status 1
── A42002001 전용 84.989

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42002001 --area 84.989

▶ 중동팰리스카운티 (A42002001) · 전용 84.989㎡ · 41192-10800 · 지번 후보 1288
   지번 1288 (1288-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42002001-84.json
   전유 84.989 + 주거공용 26.213 = 공급 111.2㎡ = 33.64평 → **34평**
   표본: 128동 401 (같은 전용 호 224개) · 전용률 76.4%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 20.3618
     · 아파트 / 벽체,발코니초과 [각층 각층] 5.851
── A42002001 전용 59.9798

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42002001 --area 59.9798

▶ 중동팰리스카운티 (A42002001) · 전용 59.9798㎡ · 41192-10800 · 지번 후보 1288
   지번 1288 (1288-0000) · 대지 → 줄 2200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42002001-59.json
   전유 59.98 + 주거공용 20.864 = 공급 80.84㎡ = 24.46평 → **24평**
   표본: 116동 1704 (같은 전용 호 75개) · 전용률 74.2%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 16.0976
     · 아파트 / 벽체 [각층 각층] 4.7669
── A42085309 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42085309 --area 84.94

▶ 중동보람마을아주 (A42085309) · 전용 84.94㎡ · 41192-10800 · 지번 후보 1172
   지번 1172 (1172-0000) · 대지 → 줄 400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42085309-84.json
   전유 84.94 + 주거공용 14.641 = 공급 99.58㎡ = 30.12평 → **30평**
   표본: 1102동 1003호 (같은 전용 호 26개) · 전용률 85.3%
     · 부대시설 / 계단,ELEV [각층] 14.445
     · 부대시설 / 홀 [] 0.196
   ⚠️ 전용률 85.3% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A42085508 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42085508 --area 84.9

▶ 중동금호한양한신아파트 (A42085508) · 전용 84.9㎡ · 41192-10800 · 지번 후보 1179
   지번 1179 (1179-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42085508-84.json
   전유 84.93 + 주거공용 14.108 = 공급 99.04㎡ = 29.96평 → **30평**
   표본: 916동 702호 (같은 전용 호 8개) · 전용률 85.8%
     · 부대시설 / 계단실 [각층] 14.108
   ⚠️ 전용률 85.8% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A42073301 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42073301 --area 84.98

▶ 부천두산위브트레지움2단지 (A42073301) · 전용 84.98㎡ · 41192-10500 · 지번 후보 769, 10, 1331, 1708, 209
::error::769 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42073301 --area 84.98`
Exit status 1
── A42073301 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42073301 --area 59.98

▶ 부천두산위브트레지움2단지 (A42073301) · 전용 59.98㎡ · 41192-10500 · 지번 후보 769, 10, 1331, 1708, 209
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 209 (0209-0000) · 대지 → 줄 1500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42073301-59.json
   전유 59.98 + 주거공용 24.3 = 공급 84.28㎡ = 25.49평 → **25평**
   표본: 202동 1002 (같은 전용 호 41개) · 전용률 71.2%
     · 아파트 / 계단,승강기 [각층 각층] 19.58
     · 아파트 / 벽체 [각층 각층] 4.72
── A42081207 전용 84.778

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081207 --area 84.778

▶ 한아름1차 아파트 (A42081207) · 전용 84.778㎡ · 41192-10900 · 지번 후보 392
   지번 392 (0392-0000) · 대지 → 줄 0개
::error::392 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42081207 --area 84.778`
Exit status 1
── A42081207 전용 59.58

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081207 --area 59.58

▶ 한아름1차 아파트 (A42081207) · 전용 59.58㎡ · 41192-10900 · 지번 후보 392
   지번 392 (0392-0000) · 대지 → 줄 0개
::error::지번 후보 392 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42081207 --area 59.58`
Exit status 1
── A42081209 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081209 --area 84.87

▶ 상동한아름2차 (A42081209) · 전용 84.87㎡ · 41192-10900 · 지번 후보 393
   지번 393 (0393-0000) · 대지 → 줄 2600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42081209-84.json
   전유 84.87 + 주거공용 14.311 = 공급 99.18㎡ = 30평 → **30평**
   표본: 1520동 1203호 (같은 전용 호 216개) · 전용률 85.6%
     · 부대시설 / 계단실,현관 [각층] 14.311
   ⚠️ 전용률 85.6% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A42081308 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081308 --area 84.91

▶ 반달마을극동아파트 (A42081308) · 전용 84.91㎡ · 41192-10900 · 지번 후보 399
   지번 399 (0399-0000) · 대지 → 줄 0개
::error::지번 후보 399 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42081308 --area 84.91`
Exit status 1
── A42081308 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081308 --area 59.76

▶ 반달마을극동아파트 (A42081308) · 전용 59.76㎡ · 41192-10900 · 지번 후보 399
   지번 399 (0399-0000) · 대지 → 줄 1100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42081308-59.json
   전유 59.76 + 주거공용 14.814 = 공급 74.57㎡ = 22.56평 → **23평**
   표본: 1839동 1604호 (같은 전용 호 35개) · 전용률 80.1%
     · 아파트 / 계단, 복도 [각층] 14.814
── A10022268 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022268 --area 59.99

▶ 평촌트리지아 아파트 (A10022268) · 전용 59.99㎡ · 41173-10400 · 지번 후보 1338
   지번 1338 (1338-0000) · 대지 → 줄 900개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022268-59.json
   전유 59.99 + 주거공용 23.905 = 공급 83.89㎡ = 25.38평 → **25평**
   표본: 301동 904 (같은 전용 호 60개) · 전용률 71.5%
     · 아파트 / 계단실 [지상 각층] 18.4447
     · 아파트 / 벽체공유 [지상 9층] 5.46
── A10022268 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022268 --area 84.98

▶ 평촌트리지아 아파트 (A10022268) · 전용 84.98㎡ · 41173-10400 · 지번 후보 1338
   지번 1338 (1338-0000) · 대지 → 줄 0개
::error::1338 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022268 --area 84.98`
Exit status 1
── A10022907 전용 84.9122

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022907 --area 84.9122

▶ 평촌 센텀퍼스트 (A10022907) · 전용 84.9122㎡ · 41173-10400 · 지번 후보 1327, 992
   지번 1327 (1327-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022907-84.json
   전유 84.912 + 주거공용 25.154 = 공급 110.07㎡ = 33.3평 → **33평**
   표본: 108동 1703 (같은 전용 호 12개) · 전용률 77.1%
     · 아파트 / 계단실,ELEV [지상 각층] 18.5119
     · 아파트 / 벽체 [지상 17층] 6.6424
── A10022506 전용 84.9664

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022506 --area 84.9664

▶ 평촌엘프라우드아파트 (A10022506) · 전용 84.9664㎡ · 41173-10100 · 지번 후보 281-1
   지번 281-1 (0281-0001) · 대지 → 줄 0개
::error::지번 후보 281-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022506 --area 84.9664`
Exit status 1
── A10022506 전용 59.9793

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022506 --area 59.9793

▶ 평촌엘프라우드아파트 (A10022506) · 전용 59.9793㎡ · 41173-10100 · 지번 후보 281-1
   지번 281-1 (0281-0001) · 대지 → 줄 0개
::error::지번 후보 281-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022506 --area 59.9793`
Exit status 1
── A10024077 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024077 --area 84.95

▶ 평촌래미안푸르지오아파트 (A10024077) · 전용 84.95㎡ · 41173-10100 · 지번 후보 413-1
   지번 413-1 (0413-0001) · 대지 → 줄 0개
::error::지번 후보 413-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024077 --area 84.95`
Exit status 1
── A10024077 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024077 --area 59.96

▶ 평촌래미안푸르지오아파트 (A10024077) · 전용 59.96㎡ · 41173-10100 · 지번 후보 413-1
   지번 413-1 (0413-0001) · 대지 → 줄 0개
::error::지번 후보 413-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024077 --area 59.96`
Exit status 1
── A10023559 전용 84.6

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023559 --area 84.6

▶ 평촌어바인퍼스트 (A10023559) · 전용 84.6㎡ · 41173-10400 · 지번 후보 1296
   지번 1296 (1296-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023559-84.json
   전유 84.6 + 주거공용 29.745 = 공급 114.34㎡ = 34.59평 → **35평**
   표본: 122동 903 (같은 전용 호 8개) · 전용률 74.0%
     · 아파트 / 계단실,전실,코어 [각층 각층] 22.975
     · 아파트 / 벽체 [지상 9층] 6.77
── A10023559 전용 59.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023559 --area 59.87

▶ 평촌어바인퍼스트 (A10023559) · 전용 59.87㎡ · 41173-10400 · 지번 후보 1296
   지번 1296 (1296-0000) · 대지 → 줄 0개
::error::지번 후보 1296 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023559 --area 59.87`
Exit status 1
── A10025336 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025336 --area 84.98

▶ 평촌더샵아이파크아파트 (A10025336) · 전용 84.98㎡ · 41173-10400 · 지번 후보 1287
   지번 1287 (1287-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025336-84.json
   전유 84.98 + 주거공용 27.792 = 공급 112.77㎡ = 34.11평 → **34평**
   표본: 113동 1101 (같은 전용 호 147개) · 전용률 75.4%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 21.0921
     · 아파트 / 벽체 [지상 11층] 6.7
── A43183405 전용 84.846

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43183405 --area 84.846

▶ 호계e편한세상 (A43183405) · 전용 84.846㎡ · 41173-10400 · 지번 후보 813
   지번 813 (0813-0000) · 대지 → 줄 0개
::error::지번 후보 813 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43183405 --area 84.846`
Exit status 1
── A43183405 전용 59.882

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43183405 --area 59.882

▶ 호계e편한세상 (A43183405) · 전용 59.882㎡ · 41173-10400 · 지번 후보 813
   지번 813 (0813-0000) · 대지 → 줄 100개
::error::전용 59.882㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 813) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43183405 --area 59.882`
Exit status 1
── A43182909 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43182909 --area 60

▶ 초원부영 (A43182909) · 전용 60㎡ · 41173-10300 · 지번 후보 518, 896-6
   지번 518 (0518-0000) · 대지 → 줄 0개
::error::518 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43182909 --area 60`
Exit status 1
── A43107007 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43107007 --area 84.96

▶ 인덕원센트럴푸르지오 (A43107007) · 전용 84.96㎡ · 41173-10300 · 지번 후보 75-2
   지번 75-2 (0075-0002) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43107007-84.json
   전유 84.96 + 주거공용 15.377 = 공급 100.34㎡ = 30.35평 → **30평**
   표본: 117동 2607호 (같은 전용 호 17개) · 전용률 84.7%
     · 아파트 / 승강기,계단실 [각층 각층] 15.377
── A43107007 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43107007 --area 59.92

▶ 인덕원센트럴푸르지오 (A43107007) · 전용 59.92㎡ · 41173-10300 · 지번 후보 75-2
   지번 75-2 (0075-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43107007-59.json
   전유 59.92 + 주거공용 15.486 = 공급 75.41㎡ = 22.81평 → **23평**
   표본: 109동 1903호 (같은 전용 호 65개) · 전용률 79.5%
     · 아파트 / 승강기,계단실 [각층 각층] 15.486
── A43181102 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43181102 --area 84.9

▶ 샛별한양4-2,3차 (A43181102) · 전용 84.9㎡ · 41173-10100 · 지번 후보 1101-6
   지번 1101-6 (1101-0006) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43181102-84.json
   전유 84.9 + 주거공용 12.884 = 공급 97.78㎡ = 29.58평 → **30평**
   표본: 201동 3층 303호 (같은 전용 호 6개) · 전용률 86.8%
     · 아파트 / 계단,복도 [지상 3층] 12.884
   ⚠️ 전용률 86.8% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A43181102 전용 59.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43181102 --area 59.82

▶ 샛별한양4-2,3차 (A43181102) · 전용 59.82㎡ · 41173-10100 · 지번 후보 1101-6
   지번 1101-6 (1101-0006) · 대지 → 줄 0개
::error::1101-6 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43181102 --area 59.82`
Exit status 1
── A43105004 전용 84.918

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43105004 --area 84.918

▶ 비산삼성래미안아파트 (A43105004) · 전용 84.918㎡ · 41173-10100 · 지번 후보 425
   지번 425 (0425-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43105004-84.json
   전유 84.918 + 주거공용 23.345 = 공급 108.26㎡ = 32.75평 → **33평**
   표본: 111동 102 (같은 전용 호 23개) · 전용률 78.4%
     · 아파트 / 계단실 [각층 각층] 17.091
     · 아파트 / 벽체,닥트 [각층 각층] 6.254
── A43105004 전용 59.871

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43105004 --area 59.871

▶ 비산삼성래미안아파트 (A43105004) · 전용 59.871㎡ · 41173-10100 · 지번 후보 425
   지번 425 (0425-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43105004-59.json
   전유 59.871 + 주거공용 21.389 = 공급 81.26㎡ = 24.58평 → **25평**
   표본: 139동 603 (같은 전용 호 6개) · 전용률 73.7%
     · 아파트 / 계단실 [각층 각층] 16.473
     · 아파트 / 벽체,닥트 [각층 각층] 4.916
── A43105102 전용 84.75

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43105102 --area 84.75

▶ 더포레스트힐아파트 (A43105102) · 전용 84.75㎡ · 41173-10100 · 지번 후보 1155
   지번 1155 (1155-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43105102-84.json
   전유 84.75 + 주거공용 21.415 = 공급 106.16㎡ = 32.11평 → **32평**
   표본: 112동 1401호 (같은 전용 호 120개) · 전용률 79.8%
     · 아파트 / 계단실,승강기등 [각층 각층] 21.4145
── A43105102 전용 59.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43105102 --area 59.93

▶ 더포레스트힐아파트 (A43105102) · 전용 59.93㎡ · 41173-10100 · 지번 후보 1155
   지번 1155 (1155-0000) · 대지 → 줄 1400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43105102-59.json
   전유 59.93 + 주거공용 15.143 = 공급 75.07㎡ = 22.71평 → **23평**
   표본: 104동 202호 (같은 전용 호 61개) · 전용률 79.8%
     · 아파트 / 계단실,승강기등 [각층] 15.143
── A43181606 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43181606 --area 59.4

▶ 평촌관악타운 (A43181606) · 전용 59.4㎡ · 41173-10100 · 지번 후보 1102
   지번 1102 (1102-0000) · 대지 → 줄 0개
::error::1102 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43181606 --area 59.4`
Exit status 1
── A43173004 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43173004 --area 59.76

▶ 한가람신라 (A43173004) · 전용 59.76㎡ · 41173-10200 · 지번 후보 1589-1
   지번 1589-1 (1589-0001) · 대지 → 줄 600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43173004-59.json
   전유 59.76 + 주거공용 16.471 = 공급 76.23㎡ = 23.06평 → **23평**
   표본: 407동 605호 (같은 전용 호 20개) · 전용률 78.4%
     · 아파트 / 계단,복도 [지상 6층] 15.253
     · 부대시설 / 노인정,관리실 [1,2층] 1.075
     · 부대시설 / 중간기계실 [지하 지층] 0.114
     · 아파트 / 경비실 [지상 1층] 0.029
── A10027233 전용 84.9897

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027233 --area 84.9897

▶ 평촌더샵센트럴시티 (A10027233) · 전용 84.9897㎡ · 41173-10200 · 지번 후보 1815
   지번 1815 (1815-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027233-84.json
   전유 84.99 + 주거공용 28.472 = 공급 113.46㎡ = 34.32평 → **34평**
   표본: 107동 603 (같은 전용 호 19개) · 전용률 74.9%
     · 아파트 / 계단실,복도,ELEV. [지상 각층] 20.1865
     · 아파트 / 벽체 [지상 각층] 8.2855
── A43171701 전용 84.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43171701 --area 84.93

▶ 인덕원삼성 (A43171701) · 전용 84.93㎡ · 41173-10200 · 지번 후보 1510-1
   지번 1510-1 (1510-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43171701-84.json
   전유 84.93 + 주거공용 18.23 = 공급 103.16㎡ = 31.21평 → **31평**
   표본: 113동 1002호 (같은 전용 호 126개) · 전용률 82.3%
     · 아파트 / 계단실 [각층 각층] 14.9
     · 아파트 / 가정의례실,운동시설 [지하 지하2] 0.77
     · 아파트 / 독서실,입주자회의실 [지하 지하1] 0.75
     · 아파트 / 열교환실,휀룸 [지하1,2] 0.63
     · 아파트 / 경비실,노인정,입주자회의실 [각층] 0.43
     · 부대시설 / 기계실,전기실 [지하1,2] 0.41
     · 부대시설 / 보육시설 [지상 1] 0.15
     · 아파트 / 중앙감시실,경비초소 [지상 1] 0.12
     · 아파트 / 가정의례실,운동시설 [지상 1] 0.07
── A43171701 전용 59.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43171701 --area 59.8

▶ 인덕원삼성 (A43171701) · 전용 59.8㎡ · 41173-10200 · 지번 후보 1510-1
   지번 1510-1 (1510-0001) · 대지 → 줄 2100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43171701-59.json
   전유 59.8 + 주거공용 17.25 = 공급 77.05㎡ = 23.31평 → **23평**
   표본: 112동 803호 (같은 전용 호 82개) · 전용률 77.6%
     · 아파트 / 계단실 [각층 각층] 14.91
     · 아파트 / 가정의례실,운동시설 [지하 지하2] 0.54
     · 아파트 / 독서실,입주자회의실 [지하 지하1] 0.53
     · 아파트 / 열교환실,휀룸 [지하1,2] 0.44
     · 아파트 / 경비실,노인정,입주자회의실 [각층] 0.3
     · 부대시설 / 기계실,전기실 [지하1,2] 0.29
     · 부대시설 / 보육시설 [지상 1] 0.11
     · 아파트 / 중앙감시실,경비초소 [지상 1] 0.08
     · 아파트 / 가정의례실,운동시설 [지상 1] 0.05
── A43106006 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43106006 --area 84.97

▶ 동편마을3단지 (A43106006) · 전용 84.97㎡ · 41173-10200 · 지번 후보 1651
   지번 1651 (1651-0000) · 대지 → 줄 0개
::error::1651 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43106006 --area 84.97`
Exit status 1
── A43181406 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43181406 --area 60

▶ 공작부영2차 (A43181406) · 전용 60㎡ · 41173-10200 · 지번 후보 518, 1588
   지번 518 (0518-0000) · 대지 → 줄 0개
   지번 1588 (1588-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43181406-59.json
   전유 60 + 주거공용 18.203 = 공급 78.2㎡ = 23.66평 → **24평**
   표본: 313동 2001호 (같은 전용 호 82개) · 전용률 76.7%
     · 아파트 / 복도 [지상 20층] 12.106
     · 아파트 / 승강기및 홀 [지상 20층] 3.745
     · 아파트 / 주계단 [지상 20층] 2.352
── A10023653 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023653 --area 84.96

▶ 아르테자이 (A10023653) · 전용 84.96㎡ · 41171-10100 · 지번 후보 1448, 18-1
   지번 1448 (1448-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023653-84.json
   전유 84.96 + 주거공용 31.06 = 공급 116.02㎡ = 35.1평 → **35평**
   표본: 103동 1204 (같은 전용 호 9개) · 전용률 73.2%
     · 아파트 / 계단실 [지상 각층] 24.92
     · 아파트 / 벽체 [지상 12층] 6.14
── A43070902 전용 59.997

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070902 --area 59.997

▶ 석수아이파크 (A43070902) · 전용 59.997㎡ · 41171-10200 · 지번 후보 794
   지번 794 (0794-0000) · 대지 → 줄 0개
::error::794 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43070902 --area 59.997`
Exit status 1
── A43070705 전용 58.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070705 --area 58.76

▶ 석수엘지빌리지 (A43070705) · 전용 58.76㎡ · 41171-10200 · 지번 후보 484
   지번 484 (0484-0000) · 대지 → 줄 100개
::error::전용 58.76㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 484) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43070705 --area 58.76`
Exit status 1
── A43075306 전용 84.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43075306 --area 84.8

▶ 안양주공뜨란채 (A43075306) · 전용 84.8㎡ · 41171-10100 · 지번 후보 1380
   지번 1380 (1380-0000) · 대지 → 줄 2500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43075306-84.json
   전유 84.8 + 주거공용 25.434 = 공급 110.23㎡ = 33.35평 → **33평**
   표본: 103동 1402 (같은 전용 호 165개) · 전용률 76.9%
     · 아파트 / 계단실,승강기등 [각층 각층] 25.4336
── A43075306 전용 59.06

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43075306 --area 59.06

▶ 안양주공뜨란채 (A43075306) · 전용 59.06㎡ · 41171-10100 · 지번 후보 1380
   지번 1380 (1380-0000) · 대지 → 줄 0개
::error::1380 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43075306 --area 59.06`
Exit status 1
── A43071005 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 84.99

▶ 안양동삼성래미안 (A43071005) · 전용 84.99㎡ · 41171-10100 · 지번 후보 90-1
   지번 90-1 (0090-0001) · 대지 → 줄 0개
::error::지번 후보 90-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 84.99`
Exit status 1
⏳ 시간 예산(1200초)에 닿아 656줄은 다음 칸으로 미룹니다
```
