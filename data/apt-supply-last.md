# 단지 공급면적 — 마지막 실행

- 성공 16건 · 실패 135건 · 미룸 195줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 139/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
하는 아파트 호를 못 찾았습니다(지번 68) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46390707 --area 85`
Exit status 1
── A44370903 전용 61.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44370903 --area 61.77

▶ 매탄주공5단지 (A44370903) · 전용 61.77㎡ · 41117-10100 · 지번 후보 359-1, 897
::error::359-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44370903 --area 61.77`
Exit status 1
── A44370903 전용 83.1

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44370903 --area 83.1

▶ 매탄주공5단지 (A44370903) · 전용 83.1㎡ · 41117-10100 · 지번 후보 359-1, 897
   지번 359-1 (0359-0001) · 대지 → 줄 0개
   지번 897 (0897-0000) · 대지 → 줄 0개
::error::지번 후보 359-1, 897 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44370903 --area 83.1`
Exit status 1
── A44170805 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44170805 --area 84.98

▶ 호매실경남아너스빌 (A44170805) · 전용 84.98㎡ · 41113-13500 · 지번 후보 1-1
   지번 1-1 (0001-0001) · 대지 → 줄 0개
::error::지번 후보 1-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44170805 --area 84.98`
Exit status 1
── A44170808 전용 59.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44170808 --area 59.9

▶ 호매실스위첸 (A44170808) · 전용 59.9㎡ · 41113-13500 · 지번 후보 1092
   지번 1092 (1092-0000) · 대지 → 줄 0개
::error::지번 후보 1092 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44170808 --area 59.9`
Exit status 1
── A44170408 전용 84.42

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 84.42

▶ 금곡엘지빌리지아파트 (A44170408) · 전용 84.42㎡ · 41113-13400 · 지번 후보 520
   지번 520 (0520-0000) · 대지 → 줄 3000개
::error::전용 84.42㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 520) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 84.42`
Exit status 1
── A44170408 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 60

▶ 금곡엘지빌리지아파트 (A44170408) · 전용 60㎡ · 41113-13400 · 지번 후보 520
   지번 520 (0520-0000) · 대지 → 줄 1700개
::error::전용 60㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 520) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 60`
Exit status 1
── A10023204 전용 84.8505

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 84.8505

▶ 서광교 파크 스위첸 (A10023204) · 전용 84.8505㎡ · 41111-13700 · 지번 후보 244
   지번 244 (0244-0000) · 대지 → 줄 0개
::error::244 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 84.8505`
Exit status 1
── A10023204 전용 59.1473

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 59.1473

▶ 서광교 파크 스위첸 (A10023204) · 전용 59.1473㎡ · 41111-13700 · 지번 후보 244
   지번 244 (0244-0000) · 대지 → 줄 0개
::error::지번 후보 244 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 59.1473`
Exit status 1
── A10022525 전용 84.977

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022525 --area 84.977

▶ 강동헤리티지자이 (A10022525) · 전용 84.977㎡ · 11740-10500 · 지번 후보 160
   지번 160 (0160-0000) · 대지 → 줄 0개
::error::지번 후보 160 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022525 --area 84.977`
Exit status 1
── A10022525 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022525 --area 59.98

▶ 강동헤리티지자이 (A10022525) · 전용 59.98㎡ · 11740-10500 · 지번 후보 160
   지번 160 (0160-0000) · 대지 → 줄 0개
::error::지번 후보 160 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022525 --area 59.98`
Exit status 1
── A10024468 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024468 --area 59.99

▶ 강동리버스트4단지 (A10024468) · 전용 59.99㎡ · 11740-11000 · 지번 후보 114
   지번 114 (0114-0000) · 대지 → 줄 0개
::error::지번 후보 114 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024468 --area 59.99`
Exit status 1
── A10025112 전용 59.981

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025112 --area 59.981

▶ 고덕롯데캐슬베네루체 (A10025112) · 전용 59.981㎡ · 11740-10300 · 지번 후보 2545, 187
   지번 2545 (2545-0000) · 대지 → 줄 0개
   지번 187 (0187-0000) · 대지 → 줄 0개
::error::지번 후보 2545, 187 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025112 --area 59.981`
Exit status 1
── A10025263 전용 84.046

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 84.046

▶ 고덕 그라시움 아파트 (A10025263) · 전용 84.046㎡ · 11740-10200 · 지번 후보 212
   지번 212 (0212-0000) · 대지 → 줄 0개
::error::지번 후보 212 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 84.046`
Exit status 1
── A10025263 전용 59.785

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 59.785

▶ 고덕 그라시움 아파트 (A10025263) · 전용 59.785㎡ · 11740-10200 · 지번 후보 212
   지번 212 (0212-0000) · 대지 → 줄 0개
::error::지번 후보 212 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 59.785`
Exit status 1
── A10025112 전용 84.146

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025112 --area 84.146

▶ 고덕롯데캐슬베네루체 (A10025112) · 전용 84.146㎡ · 11740-10300 · 지번 후보 2545, 187
   지번 2545 (2545-0000) · 대지 → 줄 0개
   지번 187 (0187-0000) · 대지 → 줄 0개
::error::지번 후보 2545, 187 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025112 --area 84.146`
Exit status 1
── A13470101 전용 57.1

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13470101 --area 57.1

▶ 길동삼익파크 (A13470101) · 전용 57.1㎡ · 11740-10500 · 지번 후보 53
   지번 53 (0053-0000) · 대지 → 줄 1560개
::error::전용 57.1㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 53) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13470101 --area 57.1`
Exit status 1
── A10025850 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025850 --area 59.96

▶ 헬리오시티아파트 (A10025850) · 전용 59.96㎡ · 11710-10700 · 지번 후보 479
   지번 479 (0479-0000) · 대지 → 줄 0개
::error::지번 후보 479 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025850 --area 59.96`
Exit status 1
── A10025850 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025850 --area 84.98

▶ 헬리오시티아파트 (A10025850) · 전용 84.98㎡ · 11710-10700 · 지번 후보 479
   지번 479 (0479-0000) · 대지 → 줄 0개
::error::지번 후보 479 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025850 --area 84.98`
Exit status 1
── A13879102 전용 82.61

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13879102 --area 82.61

▶ 잠실5단지아파트 (A13879102) · 전용 82.61㎡ · 11710-10100 · 지번 후보 27
   지번 27 (0027-0000) · 대지 → 줄 0개
::error::지번 후보 27 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13879102 --area 82.61`
Exit status 1
── A13520001 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13520001 --area 59.97

▶ 래미안포레 (A13520001) · 전용 59.97㎡ · 11680-11200 · 지번 후보 361
::error::361 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13520001 --area 59.97`
Exit status 1
── A10023348 전용 84.7509

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023348 --area 84.7509

▶ 개포자이프레지던스 (A10023348) · 전용 84.7509㎡ · 11680-10300 · 지번 후보 189
   지번 189 (0189-0000) · 대지 → 줄 0개
::error::지번 후보 189 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023348 --area 84.7509`
Exit status 1
── A10023348 전용 59.9751

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023348 --area 59.9751

▶ 개포자이프레지던스 (A10023348) · 전용 59.9751㎡ · 11680-10300 · 지번 후보 189
   지번 189 (0189-0000) · 대지 → 줄 0개
::error::지번 후보 189 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023348 --area 59.9751`
Exit status 1
── A10024216 전용 84.73

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024216 --area 84.73

▶ 디에이치 자이 개포 (A10024216) · 전용 84.73㎡ · 11680-11400 · 지번 후보 611-1
   지번 611-1 (0611-0001) · 대지 → 줄 0개
::error::지번 후보 611-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024216 --area 84.73`
Exit status 1
── A10027800 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027800 --area 59.99

▶ 래미안 대치 팰리스 (A10027800) · 전용 59.99㎡ · 11680-10600 · 지번 후보 633
   지번 633 (0633-0000) · 대지 → 줄 0개
::error::지번 후보 633 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027800 --area 59.99`
Exit status 1
── A10025203 전용 59.7479

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025203 --area 59.7479

▶ 디에이치 아너힐즈 (A10025203) · 전용 59.7479㎡ · 11680-10300 · 지번 후보 138
   지번 138 (0138-0000) · 대지 → 줄 0개
::error::지번 후보 138 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025203 --area 59.7479`
Exit status 1
── A13520002 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13520002 --area 59.88

▶ 강남한양수자인 (A13520002) · 전용 59.88㎡ · 11680-11200 · 지번 후보 77
   지번 77 (0077-0000) · 대지 → 줄 0개
::error::지번 후보 77 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13520002 --area 59.88`
Exit status 1
── A13520001 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13520001 --area 84.99

▶ 래미안포레 (A13520001) · 전용 84.99㎡ · 11680-11200 · 지번 후보 361
   지번 361 (0361-0000) · 대지 → 줄 0개
::error::지번 후보 361 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13520001 --area 84.99`
Exit status 1
── A13520002 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13520002 --area 84.99

▶ 강남한양수자인 (A13520002) · 전용 84.99㎡ · 11680-11200 · 지번 후보 77
   지번 77 (0077-0000) · 대지 → 줄 0개
::error::지번 후보 77 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13520002 --area 84.99`
Exit status 1
── A10027800 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027800 --area 84.97

▶ 래미안 대치 팰리스 (A10027800) · 전용 84.97㎡ · 11680-10600 · 지번 후보 633
   지번 633 (0633-0000) · 대지 → 줄 0개
::error::지번 후보 633 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027800 --area 84.97`
Exit status 1
── A10025203 전용 84.357

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025203 --area 84.357

▶ 디에이치 아너힐즈 (A10025203) · 전용 84.357㎡ · 11680-10300 · 지번 후보 138
   지번 138 (0138-0000) · 대지 → 줄 0개
::error::지번 후보 138 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025203 --area 84.357`
Exit status 1
── A10023043 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023043 --area 59.96

▶ 래미안원베일리 (A10023043) · 전용 59.96㎡ · 11650-10700 · 지번 후보 1-1
   지번 1-1 (0001-0001) · 대지 → 줄 1032개
::error::전용 59.96㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023043 --area 59.96`
Exit status 1
── A10024240 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024240 --area 59.98

▶ 서초그랑자이 (A10024240) · 전용 59.98㎡ · 11650-10800 · 지번 후보 1335
   지번 1335 (1335-0000) · 대지 → 줄 0개
::error::지번 후보 1335 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024240 --area 59.98`
Exit status 1
── A10023043 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023043 --area 84.95

▶ 래미안원베일리 (A10023043) · 전용 84.95㎡ · 11650-10700 · 지번 후보 1-1
   지번 1-1 (0001-0001) · 대지 → 줄 1032개
::error::전용 84.95㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023043 --area 84.95`
Exit status 1
── A10024240 전용 84.51

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024240 --area 84.51

▶ 서초그랑자이 (A10024240) · 전용 84.51㎡ · 11650-10800 · 지번 후보 1335
   지번 1335 (1335-0000) · 대지 → 줄 0개
::error::지번 후보 1335 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024240 --area 84.51`
Exit status 1
── A13718001 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13718001 --area 59.94

▶ 서초더샵포레 (A13718001) · 전용 59.94㎡ · 11650-10900 · 지번 후보 77
::error::77 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13718001 --area 59.94`
Exit status 1
── A13790929 전용 84.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13790929 --area 84.52

▶ 신반포한신2차 (A13790929) · 전용 84.52㎡ · 11650-10600 · 지번 후보 73
   지번 73 (0073-0000) · 대지 → 줄 3000개
::error::전용 84.52㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 73) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13790929 --area 84.52`
Exit status 1
── A13718001 전용 84.81

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13718001 --area 84.81

▶ 서초더샵포레 (A13718001) · 전용 84.81㎡ · 11650-10900 · 지번 후보 77
   지번 77 (0077-0000) · 대지 → 줄 0개
::error::지번 후보 77 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13718001 --area 84.81`
Exit status 1
── A10023661 전용 84.9433

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023661 --area 84.9433

▶ 힐스테이트뉴포레 (A10023661) · 전용 84.9433㎡ · 11620-10200 · 지번 후보 1644
   지번 1644 (1644-0000) · 대지 → 줄 0개
::error::지번 후보 1644 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023661 --area 84.9433`
Exit status 1
── A10023661 전용 59.9882

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023661 --area 59.9882

▶ 힐스테이트뉴포레 (A10023661) · 전용 59.9882㎡ · 11620-10200 · 지번 후보 1644
   지번 1644 (1644-0000) · 대지 → 줄 0개
::error::지번 후보 1644 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023661 --area 59.9882`
Exit status 1
── A10025770 전용 59.9154

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025770 --area 59.9154

▶ 아크로 리버하임 (A10025770) · 전용 59.9154㎡ · 11590-10500 · 지번 후보 158-1
   지번 158-1 (0158-0001) · 대지 → 줄 0개
::error::지번 후보 158-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025770 --area 59.9154`
Exit status 1
── A10025770 전용 84.9184

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025770 --area 84.9184

▶ 아크로 리버하임 (A10025770) · 전용 84.9184㎡ · 11590-10500 · 지번 후보 158-1
   지번 158-1 (0158-0001) · 대지 → 줄 0개
::error::지번 후보 158-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025770 --area 84.9184`
Exit status 1
── A15685206 전용 59.6

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15685206 --area 59.6

▶ 신대방우성1차 (A15685206) · 전용 59.6㎡ · 11590-10900 · 지번 후보 565
   지번 565 (0565-0000) · 대지 → 줄 1100개
::error::전용 59.6㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 565) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15685206 --area 59.6`
Exit status 1
── A15089421 전용 60.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15089421 --area 60.96

▶ 여의도시범아파트 (A15089421) · 전용 60.96㎡ · 11560-11000 · 지번 후보 50
   지번 50 (0050-0000) · 대지 → 줄 0개
::error::50 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15089421 --area 60.96`
Exit status 1
── A15370103 전용 84.786

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15370103 --area 84.786

▶ 남서울힐스테이트 (A15370103) · 전용 84.786㎡ · 11545-10300 · 지번 후보 789
::error::789 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15370103 --area 84.786`
Exit status 1
── A15370103 전용 59.817

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15370103 --area 59.817

▶ 남서울힐스테이트 (A15370103) · 전용 59.817㎡ · 11545-10300 · 지번 후보 789
   지번 789 (0789-0000) · 대지 → 줄 0개
::error::지번 후보 789 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15370103 --area 59.817`
Exit status 1
── A10025614 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025614 --area 84.88

::error::A10025614 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025614 --area 84.88`
Exit status 1
── A10025614 전용 59.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025614 --area 59.86

::error::A10025614 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025614 --area 59.86`
Exit status 1
── A15213005 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15213005 --area 84.98

▶ 천왕이펜하우스3단지 (A15213005) · 전용 84.98㎡ · 11530-11100 · 지번 후보 27
   지번 27 (0027-0000) · 대지 → 줄 0개
::error::지번 후보 27 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15213005 --area 84.98`
Exit status 1
── A15205405 전용 57.1

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15205405 --area 57.1

▶ 구로두산 (A15205405) · 전용 57.1㎡ · 11530-10200 · 지번 후보 769, 10, 1331, 1708, 1265
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 1265 (1265-0000) · 대지 → 줄 3000개
::error::전용 57.1㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1265) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15205405 --area 57.1`
Exit status 1
── A15701602 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 59.97

▶ 우장산롯데캐슬 (A15701602) · 전용 59.97㎡ · 11500-10300 · 지번 후보 1145, 2545
   지번 1145 (1145-0000) · 대지 → 줄 900개
::error::전용 59.97㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1145) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 59.97`
Exit status 1
── A15721006 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15721006 --area 84.99

▶ 마곡엠밸리6단지 (A15721006) · 전용 84.99㎡ · 11500-10500 · 지번 후보 6
   지번 6 (0006-0000) · 대지 → 줄 0개
::error::6 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15721006 --area 84.99`
Exit status 1
── A10024347 전용 84.9472

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024347 --area 84.9472

▶ 마포프레스티지자이아파트 (A10024347) · 전용 84.9472㎡ · 11440-10900 · 지번 후보 507
::error::507 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024347 --area 84.9472`
Exit status 1
── A10024347 전용 59.9286

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024347 --area 59.9286

▶ 마포프레스티지자이아파트 (A10024347) · 전용 59.9286㎡ · 11440-10900 · 지번 후보 507
   지번 507 (0507-0000) · 대지 → 줄 0개
::error::지번 후보 507 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024347 --area 59.9286`
Exit status 1
── A12181406 전용 84.42

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12181406 --area 84.42

▶ 도화현대1차아파트 (A12181406) · 전용 84.42㎡ · 11440-10400 · 지번 후보 1932-6, 481, 700-1, 818, 929, 357
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 357 (0357-0000) · 대지 → 줄 3000개
::error::전용 84.42㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 357) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12181406 --area 84.42`
Exit status 1
── A12181406 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12181406 --area 59.4

▶ 도화현대1차아파트 (A12181406) · 전용 59.4㎡ · 11440-10400 · 지번 후보 1932-6, 481, 700-1, 818, 929, 357
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 357 (0357-0000) · 대지 → 줄 3000개
::error::전용 59.4㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 357) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12181406 --area 59.4`
Exit status 1
── A10023959 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023959 --area 84.95

▶ 홍제역 해링턴플레이스아파트 (A10023959) · 전용 84.95㎡ · 11410-11100 · 지번 후보 270-1
   지번 270-1 (0270-0001) · 대지 → 줄 0개
::error::지번 후보 270-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023959 --area 84.95`
Exit status 1
── A10023959 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023959 --area 59.99

▶ 홍제역 해링턴플레이스아파트 (A10023959) · 전용 59.99㎡ · 11410-11100 · 지번 후보 270-1
::error::270-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023959 --area 59.99`
Exit status 1
── A10025130 전용 84.978

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025130 --area 84.978

▶ DMC에코자이 (A10025130) · 전용 84.978㎡ · 11410-12000 · 지번 후보 224
   지번 224 (0224-0000) · 대지 → 줄 0개
::error::지번 후보 224 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025130 --area 84.978`
Exit status 1
── A10025130 전용 59.79

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025130 --area 59.79

▶ DMC에코자이 (A10025130) · 전용 59.79㎡ · 11410-12000 · 지번 후보 224
   지번 224 (0224-0000) · 대지 → 줄 0개
::error::지번 후보 224 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025130 --area 59.79`
Exit status 1
── A10025976 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025976 --area 84.98

▶ DMC센트럴아이파크 (A10025976) · 전용 84.98㎡ · 11410-12000 · 지번 후보 369-10
   지번 369-10 (0369-0010) · 대지 → 줄 0개
::error::지번 후보 369-10 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025976 --area 84.98`
Exit status 1
── A12010104 전용 84.78

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12010104 --area 84.78

▶ 홍은벽산 (A12010104) · 전용 84.78㎡ · 11410-11800 · 지번 후보 271-3, 455
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 455 (0455-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12010104-84.json
   전유 84.78 + 주거공용 11.46 = 공급 96.24㎡ = 29.11평 → **29평**
   표본: 116동 102호 (같은 전용 호 176개) · 전용률 88.1%
     · 아파트 / ELE.계단,복도 [각층 각층] 11.46
── A12010104 전용 58.64

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12010104 --area 58.64

▶ 홍은벽산 (A12010104) · 전용 58.64㎡ · 11410-11800 · 지번 후보 271-3, 455
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 455 (0455-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12010104-59.json
   전유 58.64 + 주거공용 15.37 = 공급 74.01㎡ = 22.39평 → **22평**
   표본: 109동 906호 (같은 전용 호 34개) · 전용률 79.2%
     · 아파트 / ELE.계단,복도 [각층 각층] 15.37
── A12008003 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12008003 --area 84.87

▶ 독립문극동 (A12008003) · 전용 84.87㎡ · 11410-10900 · 지번 후보 200
   지번 200 (0200-0000) · 대지 → 줄 0개
::error::지번 후보 200 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12008003 --area 84.87`
Exit status 1
── A12004001 전용 57.78

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12004001 --area 57.78

▶ 서대문천연뜨란채아파트 (A12004001) · 전용 57.78㎡ · 11410-10600 · 지번 후보 145
   지번 145 (0145-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12004001-59.json
   전유 57.78 + 주거공용 20.799 = 공급 78.58㎡ = 23.77평 → **24평**
   표본: 111동 606 (같은 전용 호 131개) · 전용률 73.5%
     · 아파트 / 계단실,승강기,벽체 [각층 각층] 19.0636
     · 부대시설 / 주민복지관 [지하 지3~지1층] 0.9625
     · 부대시설 / 지하계단실 [지하 지4~지1층] 0.7635
     · 부대시설 / 경비실 [지하 지1층] 0.0093
── A12013003 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12013003 --area 59.97

▶ DMC래미안e편한세상 (A12013003) · 전용 59.97㎡ · 11410-11900 · 지번 후보 481
   지번 481 (0481-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12013003-59.json
   전유 59.97 + 주거공용 27.17 = 공급 87.14㎡ = 26.36평 → **26평**
   표본: 106동 801 (같은 전용 호 52개) · 전용률 68.8%
     · 아파트 / 벽체,코아 [각층 각층] 26.79
     · 아파트 / EV홀,계단실(지3~지2) [각층 각층] 0.38
   ⚠️ 전용률 68.8% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A12012203 전용 84.78

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12012203 --area 84.78

▶ 남가좌동현대아파트 (A12012203) · 전용 84.78㎡ · 11410-12000 · 지번 후보 1932-6, 481, 376, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 376 (0376-0000) · 대지 → 줄 700개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12012203-84.json
   전유 84.78 + 주거공용 15.701 = 공급 100.48㎡ = 30.4평 → **30평**
   표본: 105동 1006호 (같은 전용 호 21개) · 전용률 84.4%
     · 아파트 / 계단실,엘리베이터 [각층 각층] 15.701
── A12012203 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12012203 --area 59.4

▶ 남가좌동현대아파트 (A12012203) · 전용 59.4㎡ · 11410-12000 · 지번 후보 1932-6, 481, 376, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 376 (0376-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
::error::지번 후보 1932-6, 481, 376, 700-1, 818, 929 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12012203 --area 59.4`
Exit status 1
── A10025976 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025976 --area 59.99

▶ DMC센트럴아이파크 (A10025976) · 전용 59.99㎡ · 11410-12000 · 지번 후보 369-10
   지번 369-10 (0369-0010) · 대지 → 줄 0개
::error::지번 후보 369-10 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025976 --area 59.99`
Exit status 1
── A12012202 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12012202 --area 84.9

▶ DMC래미안클라시스(분양) (A12012202) · 전용 84.9㎡ · 11410-12000 · 지번 후보 377
   지번 377 (0377-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12012202-84.json
   전유 84.9 + 주거공용 16.32 = 공급 101.22㎡ = 30.62평 → **31평**
   표본: 110동 1302호 (같은 전용 호 151개) · 전용률 83.9%
     · 아파트 / 계단실,엘리베이터 [각층 각층] 16.32
── A10023079 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023079 --area 84.94

▶ DMC파인시티자이 (A10023079) · 전용 84.94㎡ · 11380-10100 · 지번 후보 431, 190
   지번 431 (0431-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023079-84.json
   전유 84.94 + 주거공용 27.47 = 공급 112.41㎡ = 34평 → **34평**
   표본: 112동 2302 (같은 전용 호 104개) · 전용률 75.6%
     · 아파트 / 계단실 [지상 각층] 22
     · 아파트 / 벽체공용 [지상 23층] 5.47
── A10023079 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023079 --area 59.98

▶ DMC파인시티자이 (A10023079) · 전용 59.98㎡ · 11380-10100 · 지번 후보 431, 190
   지번 431 (0431-0000) · 대지 → 줄 100개
::error::전용 59.98㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 431) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023079 --area 59.98`
Exit status 1
── A10023076 전용 59.9865

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023076 --area 59.9865

▶ DMC SKVIEW 아이파크포레 (A10023076) · 전용 59.9865㎡ · 11380-10100 · 지번 후보 191
   지번 191 (0191-0000) · 대지 → 줄 0개
::error::191 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023076 --area 59.9865`
Exit status 1
⏳ 시간 예산(1200초)에 닿아 195줄은 다음 칸으로 미룹니다
```
