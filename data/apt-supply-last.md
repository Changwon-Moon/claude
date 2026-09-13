# 단지 공급면적 — 마지막 실행

- 성공 9건 · 실패 126건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 250/250건 · 내일로 미룬 268줄 (상한은 실패가 아니다)

```
�� → 줄 0개
::error::지번 후보 413-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024077 --area 59.96`
Exit status 1
── A43071005 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 84.99

▶ 안양동삼성래미안 (A43071005) · 전용 84.99㎡ · 41171-10100 · 지번 후보 90-1
   지번 90-1 (0090-0001) · 대지 → 줄 600개
::error::전용 84.99㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 90-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 84.99`
Exit status 1
── A43071005 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 59.76

▶ 안양동삼성래미안 (A43071005) · 전용 59.76㎡ · 41171-10100 · 지번 후보 90-1
   지번 90-1 (0090-0001) · 대지 → 줄 0개
::error::90-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 59.76`
Exit status 1
── A46382916 전용 59.535

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46382916 --area 59.535

▶ 이매촌삼성 (A46382916) · 전용 59.535㎡ · 41135-10600 · 지번 후보 100
   지번 100 (0100-0000) · 대지 → 줄 100개
::error::전용 59.535㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 100) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46382916 --area 59.535`
Exit status 1
── A46377908 전용 59.78

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 59.78

▶ 수내푸른마을신성벽산쌍용 (A46377908) · 전용 59.78㎡ · 41135-10200 · 지번 후보 64, 271-3, 71
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 71 (0071-0000) · 대지 → 줄 1356개
::error::전용 59.78㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 71) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 59.78`
Exit status 1
── A46377908 전용 84.72

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 84.72

▶ 수내푸른마을신성벽산쌍용 (A46377908) · 전용 84.72㎡ · 41135-10200 · 지번 후보 64, 271-3, 71
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 71 (0071-0000) · 대지 → 줄 1356개
::error::전용 84.72㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 71) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 84.72`
Exit status 1
── A46377908 전용 84.72

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 84.72

▶ 수내푸른마을신성벽산쌍용 (A46377908) · 전용 84.72㎡ · 41135-10200 · 지번 후보 64, 271-3, 71
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 71 (0071-0000) · 대지 → 줄 1356개
::error::전용 84.72㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 71) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 84.72`
Exit status 1
── A46377908 전용 59.78

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 59.78

▶ 수내푸른마을신성벽산쌍용 (A46377908) · 전용 59.78㎡ · 41135-10200 · 지번 후보 64, 271-3, 71
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 71 (0071-0000) · 대지 → 줄 1356개
::error::전용 59.78㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 71) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 59.78`
Exit status 1
── A10026318 전용 59.32

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026318 --area 59.32

▶ 파크타운아파트 (A10026318) · 전용 59.32㎡ · 41135-10200 · 지번 후보 51
   지번 51 (0051-0000) · 대지 → 줄 1100개
::error::전용 59.32㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 51) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026318 --area 59.32`
Exit status 1
── A46392206 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46392206 --area 59.76

▶ 수내양지마을한양1단지 (A46392206) · 전용 59.76㎡ · 41135-10200 · 지번 후보 24
   지번 24 (0024-0000) · 대지 → 줄 0개
::error::24 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46392206 --area 59.76`
Exit status 1
── A46390707 전용 85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46390707 --area 85

▶ 분당장안타운건영2차 (A46390707) · 전용 85㎡ · 41135-10100 · 지번 후보 68
   지번 68 (0068-0000) · 대지 → 줄 100개
::error::전용 85㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 68) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46390707 --area 85`
Exit status 1
── A44370903 전용 61.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44370903 --area 61.77

▶ 매탄주공5단지 (A44370903) · 전용 61.77㎡ · 41117-10100 · 지번 후보 359-1, 897
   지번 359-1 (0359-0001) · 대지 → 줄 0개
   지번 897 (0897-0000) · 대지 → 줄 0개
::error::지번 후보 359-1, 897 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
   지번 520 (0520-0000) · 대지 → 줄 3000개
::error::전용 60㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 520) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 60`
Exit status 1
── A10023204 전용 84.8505

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 84.8505

▶ 서광교 파크 스위첸 (A10023204) · 전용 84.8505㎡ · 41111-13700 · 지번 후보 244
   지번 244 (0244-0000) · 대지 → 줄 0개
::error::지번 후보 244 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 84.8505`
Exit status 1
── A10023204 전용 59.1473

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 59.1473

▶ 서광교 파크 스위첸 (A10023204) · 전용 59.1473㎡ · 41111-13700 · 지번 후보 244
   지번 244 (0244-0000) · 대지 → 줄 0개
::error::244 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
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

▶ 고덕롯데캐슬베네루체 (A10025112) · 전용 59.981㎡ · 11740-10300 · 지번 후보 187
   지번 187 (0187-0000) · 대지 → 줄 0개
::error::지번 후보 187 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
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

▶ 고덕롯데캐슬베네루체 (A10025112) · 전용 84.146㎡ · 11740-10300 · 지번 후보 187
   지번 187 (0187-0000) · 대지 → 줄 0개
::error::지번 후보 187 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
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
   지번 27 (0027-0000) · 대지 → 줄 300개
::error::전용 82.61㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 27) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13879102 --area 82.61`
Exit status 1
── A13520001 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13520001 --area 59.97

▶ 래미안포레 (A13520001) · 전용 59.97㎡ · 11680-11200 · 지번 후보 361
   지번 361 (0361-0000) · 대지 → 줄 0개
::error::지번 후보 361 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13520001 --area 59.97`
Exit status 1
── A10023348 전용 84.7509

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023348 --area 84.7509

▶ 개포자이프레지던스 (A10023348) · 전용 84.7509㎡ · 11680-10300 · 지번 후보 189
   지번 189 (0189-0000) · 대지 → 줄 0개
::error::189 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
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
   지번 1-1 (0001-0001) · 대지 → 줄 100개
::error::전용 84.95㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023043 --area 84.95`
Exit status 1
── A10024240 전용 84.51

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024240 --area 84.51

▶ 서초그랑자이 (A10024240) · 전용 84.51㎡ · 11650-10800 · 지번 후보 1335
   지번 1335 (1335-0000) · 대지 → 줄 0개
::error::1335 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024240 --area 84.51`
Exit status 1
── A13718001 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13718001 --area 59.94

▶ 서초더샵포레 (A13718001) · 전용 59.94㎡ · 11650-10900 · 지번 후보 77
   지번 77 (0077-0000) · 대지 → 줄 0개
::error::지번 후보 77 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
   지번 565 (0565-0000) · 대지 → 줄 700개
::error::전용 59.6㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 565) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15685206 --area 59.6`
Exit status 1
── A15089421 전용 60.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15089421 --area 60.96

▶ 여의도시범아파트 (A15089421) · 전용 60.96㎡ · 11560-11000 · 지번 후보 50
   지번 50 (0050-0000) · 대지 → 줄 200개
::error::전용 60.96㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 50) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15089421 --area 60.96`
Exit status 1
── A15370103 전용 84.786

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15370103 --area 84.786

▶ 남서울힐스테이트 (A15370103) · 전용 84.786㎡ · 11545-10300 · 지번 후보 789
   지번 789 (0789-0000) · 대지 → 줄 0개
::error::지번 후보 789 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
── A15286809 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15286809 --area 84.87

▶ 구로주공 (A15286809) · 전용 84.87㎡ · 11530-10200 · 지번 후보 685-222
   지번 685-222 (0685-0222) · 대지 → 줄 2300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15286809-84.json
   전유 84.87 + 주거공용 21.6 = 공급 106.47㎡ = 32.21평 → **32평**
   표본: 113동 306호 (같은 전용 호 235개) · 전용률 79.7%
     · / [] 21.6
── A15205513 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15205513 --area 59.88

▶ 신도림태영타운 (A15205513) · 전용 59.88㎡ · 11530-10200 · 지번 후보 1267
   지번 1267 (1267-0000) · 대지 → 줄 0개
::error::지번 후보 1267 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15205513 --area 59.88`
Exit status 1
── A15284906 전용 56.036

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15284906 --area 56.036

▶ 구로삼성래미안 (A15284906) · 전용 56.036㎡ · 11530-10200 · 지번 후보 256-1
   지번 256-1 (0256-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15284906-59.json
   전유 56.036 + 주거공용 18.811 = 공급 74.85㎡ = 22.64평 → **23평**
   표본: 105동 1103 (같은 전용 호 47개) · 전용률 74.9%
     · 아파트 / 계단,복도,승강기,벽체 [각층 각층] 18.811
── A15209207 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15209207 --area 84.99

▶ 개봉동현대아파트 (A15209207) · 전용 84.99㎡ · 11530-10700 · 지번 후보 1932-6, 481, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15209207-84.json
   전유 84.99 + 주거공용 16.28 = 공급 101.27㎡ = 30.63평 → **31평**
   표본: 131동 1002호 (같은 전용 호 8개) · 전용률 83.9%
     · 아파트 / 복도,계단 [1/22층] 16.28
── A15209207 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15209207 --area 59.94

▶ 개봉동현대아파트 (A15209207) · 전용 59.94㎡ · 11530-10700 · 지번 후보 1932-6, 481, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
::error::지번 후보 1932-6, 481, 700-1, 818, 929 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15209207 --area 59.94`
Exit status 1
── A15209305 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15209305 --area 59.95

▶ 개봉한진 (A15209305) · 전용 59.95㎡ · 11530-10700 · 지번 후보 478
   지번 478 (0478-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15209305-59.json
   전유 59.95 + 주거공용 22.58 = 공급 82.53㎡ = 24.97평 → **25평**
   표본: 113동 1903호 (같은 전용 호 187개) · 전용률 72.6%
     · 아파트 / 계단,복도,승강기 [1-24층] 22.58
── A10024426 전용 84.65

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024426 --area 84.65

▶ 마곡엠밸리9단지 (A10024426) · 전용 84.65㎡ · 11500-10500 · 지번 후보 744
   지번 744 (0744-0000) · 대지 → 줄 2000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024426-84.json
   전유 84.65 + 주거공용 32.96 = 공급 117.61㎡ = 35.58평 → **36평**
   표본: 911동 1104 (같은 전용 호 64개) · 전용률 72.0%
     · 아파트 / 계단실,승강기,홀,복도 [지상 각층] 27.95
     · 아파트 / 벽체 [지상 11층] 5.01
── A15701602 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 59.97

▶ 우장산롯데캐슬 (A15701602) · 전용 59.97㎡ · 11500-10300 · 지번 후보 1145
   지번 1145 (1145-0000) · 대지 → 줄 100개
::error::전용 59.97㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1145) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 59.97`
Exit status 1
── A15721007 전용 84.55

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15721007 --area 84.55

▶ 마곡엠밸리7단지 (A15721007) · 전용 84.55㎡ · 11500-10500 · 지번 후보 743-4
   지번 743-4 (0743-0004) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15721007-84.json
   전유 84.55 + 주거공용 24.25 = 공급 108.8㎡ = 32.91평 → **33평**
   표본: 704동 1007 (같은 전용 호 2개) · 전용률 77.7%
     · 아파트 / 계단실,승강기,홀,복도 [지상 각층] 19.85
     · 아파트 / 벽체 [지상 10층] 4.4
── A15701602 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 84.98

▶ 우장산롯데캐슬 (A15701602) · 전용 84.98㎡ · 11500-10300 · 지번 후보 1145
   지번 1145 (1145-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15701602-84.json
   전유 85 + 주거공용 24.27 = 공급 109.27㎡ = 33.05평 → **33평**
   표본: 306동 1501 (같은 전용 호 7개) · 전용률 77.8%
     · 아파트 / 계단실,승강기 [각층 각층] 17.96
     · 아파트 / 벽체 [각층 각층] 6.31
── A15792602 전용 84.914

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15792602 --area 84.914

▶ 화곡푸르지오 (A15792602) · 전용 84.914㎡ · 11500-10300 · 지번 후보 1091
   지번 1091 (1091-0000) · 대지 → 줄 0개
::error::지번 후보 1091 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15792602 --area 84.914`
Exit status 1
── A15701003 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 59.98

▶ 우장산아이파크이편한세상 (A15701003) · 전용 59.98㎡ · 11500-10300 · 지번 후보 1159
   지번 1159 (1159-0000) · 대지 → 줄 0개
::error::지번 후보 1159 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 59.98`
Exit status 1
── A15701007 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701007 --area 84.99

▶ 강서힐스테이트아파트 (A15701007) · 전용 84.99㎡ · 11500-10300 · 지번 후보 1165, 1025-33
   지번 1165 (1165-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15701007-84.json
   전유 84.99 + 주거공용 26.55 = 공급 111.54㎡ = 33.74평 → **34평**
   표본: 102동 1404 (같은 전용 호 159개) · 전용률 76.2%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 20.47
     · 아파트 / 벽체 [지상 14층] 6.08
── A15721006 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15721006 --area 84.99

▶ 마곡엠밸리6단지 (A15721006) · 전용 84.99㎡ · 11500-10500 · 지번 후보 6
   지번 6 (0006-0000) · 대지 → 줄 0개
::error::지번 후보 6 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15721006 --area 84.99`
Exit status 1
🧾 오늘 몫(250건)을 다 썼습니다 — 미리 채우기 268줄은 **내일** 이어서 받습니다.
   (실패가 아닙니다. 여기서 빨간불을 켜면 재시도 사다리가 상한을 우회합니다.)
```
