# 단지 공급면적 — 마지막 실행

- 성공 17건 · 실패 113건 · 미룸 383줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 121/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
tus 1
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
::error::지번 후보 1002-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
── A42281205 전용 59.45

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42281205 --area 59.45

▶ 소사주공 (A42281205) · 전용 59.45㎡ · 41194-10100 · 지번 후보 400-8
   지번 400-8 (0400-0008) · 대지 → 줄 3000개
::error::전용 59.45㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 400-8) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42281205 --area 59.45`
Exit status 1
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
::error::413-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024077 --area 59.96`
Exit status 1
── A43071005 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 84.99

▶ 안양동삼성래미안 (A43071005) · 전용 84.99㎡ · 41171-10100 · 지번 후보 90-1
   지번 90-1 (0090-0001) · 대지 → 줄 0개
::error::90-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 84.99`
Exit status 1
── A43071005 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 59.76

▶ 안양동삼성래미안 (A43071005) · 전용 59.76㎡ · 41171-10100 · 지번 후보 90-1
   지번 90-1 (0090-0001) · 대지 → 줄 3000개
::error::전용 59.76㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 90-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 59.76`
Exit status 1
── A46382916 전용 59.535

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46382916 --area 59.535

▶ 이매촌삼성 (A46382916) · 전용 59.535㎡ · 41135-10600 · 지번 후보 100
   지번 100 (0100-0000) · 대지 → 줄 3000개
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
   지번 71 (0071-0000) · 대지 → 줄 900개
::error::전용 59.78㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 71) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 59.78`
Exit status 1
── A46377908 전용 84.72

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 84.72

▶ 수내푸른마을신성벽산쌍용 (A46377908) · 전용 84.72㎡ · 41135-10200 · 지번 후보 64, 271-3, 71
::error::64 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 84.72`
Exit status 1
── A46377908 전용 84.72

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377908 --area 84.72

▶ 수내푸른마을신성벽산쌍용 (A46377908) · 전용 84.72㎡ · 41135-10200 · 지번 후보 64, 271-3, 71
   지번 64 (0064-0000) · 대지 → 줄 0개
::error::64 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
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
   지번 51 (0051-0000) · 대지 → 줄 2100개
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
   지번 68 (0068-0000) · 대지 → 줄 2000개
::error::전용 85㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 68) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46390707 --area 85`
Exit status 1
── A44370903 전용 61.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44370903 --area 61.77

▶ 매탄주공5단지 (A44370903) · 전용 61.77㎡ · 41117-10100 · 지번 후보 359-1, 897
   지번 359-1 (0359-0001) · 대지 → 줄 0개
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
   지번 520 (0520-0000) · 대지 → 줄 500개
::error::전용 84.42㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 520) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 84.42`
Exit status 1
── A44170408 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 60

▶ 금곡엘지빌리지아파트 (A44170408) · 전용 60㎡ · 41113-13400 · 지번 후보 520
   지번 520 (0520-0000) · 대지 → 줄 0개
::error::지번 후보 520 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
::error::지번 후보 244 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 59.1473`
Exit status 1
── A10021122 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10021122 --area 84.99

::error::A10021122 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10021122 --area 84.99`
Exit status 1
── A10021122 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10021122 --area 59.99

::error::A10021122 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10021122 --area 59.99`
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
::error::212 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 84.046`
Exit status 1
── A10025263 전용 59.785

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 59.785

▶ 고덕 그라시움 아파트 (A10025263) · 전용 59.785㎡ · 11740-10200 · 지번 후보 212
   지번 212 (0212-0000) · 대지 → 줄 0개
::error::212 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
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
   지번 27 (0027-0000) · 대지 → 줄 3000개
::error::전용 82.61㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 27) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13879102 --area 82.61`
Exit status 1
── A13811206 전용 59.73

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13811206 --area 59.73

▶ 거여1단지 (A13811206) · 전용 59.73㎡ · 11710-11300 · 지번 후보 290
   지번 290 (0290-0000) · 대지 → 줄 1700개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13811206-59.json
   전유 59.73 + 주거공용 19.66 = 공급 79.39㎡ = 24.02평 → **24평**
   표본: 106동 817호 (같은 전용 호 20개) · 전용률 75.2%
     · 다세대주택 / 복도 [] 17.92
     · 부대시설 / 기계실 [지하 지하] 0.92
     · 아파트 / 복지관 [] 0.82
     · 아파트 / 복지관 [] 0
     · 부대시설 / 주민공동시설 [] 0
     · 부대시설 / 주민공동시설 [] 0
     · 다세대주택 / 경비실 [] 0
     · 다세대주택 / 경비실 [] 0
     · 부대시설 / 전기실 [지하 지하] 0
     · 연립주택 / 계단실 [] 0
     · 아파트 / 승강기 [] 0
── A13880806 전용 84.69

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13880806 --area 84.69

▶ 가락쌍용1차 (A13880806) · 전용 84.69㎡ · 11710-10700 · 지번 후보 64, 140
::error::64 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13880806 --area 84.69`
Exit status 1
── A13880806 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13880806 --area 59.92

▶ 가락쌍용1차 (A13880806) · 전용 59.92㎡ · 11710-10700 · 지번 후보 64, 140
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 140 (0140-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13880806-59.json
   전유 59.92 + 주거공용 15.16 = 공급 75.08㎡ = 22.71평 → **23평**
   표본: 303동 2401호 (같은 전용 호 151개) · 전용률 79.8%
     · 다세대주택 / 계단 [] 15.16
     · 아파트 / 엘리베이터홀 [] 0
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
── A10027985 전용 84.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027985 --area 84.39

▶ 강남자곡힐스테이트아파트 (A10027985) · 전용 84.39㎡ · 11680-11200 · 지번 후보 619
   지번 619 (0619-0000) · 대지 → 줄 2300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027985-84.json
   전유 84.39 + 주거공용 35.664 = 공급 120.05㎡ = 36.32평 → **36평**
   표본: 501동 1332 (같은 전용 호 86개) · 전용률 70.3%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 35.6636
── A10027985 전용 59.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027985 --area 59.93

▶ 강남자곡힐스테이트아파트 (A10027985) · 전용 59.93㎡ · 11680-11200 · 지번 후보 619
   지번 619 (0619-0000) · 대지 → 줄 0개
::error::619 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027985 --area 59.93`
Exit status 1
── A10024216 전용 84.73

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024216 --area 84.73

▶ 디에이치 자이 개포 (A10024216) · 전용 84.73㎡ · 11680-11400 · 지번 후보 611-1
   지번 611-1 (0611-0001) · 대지 → 줄 0개
::error::611-1 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024216 --area 84.73`
Exit status 1
── A10024564 전용 84.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024564 --area 84.86

▶ 개포래미안포레스트 (A10024564) · 전용 84.86㎡ · 11680-10300 · 지번 후보 1282
   지번 1282 (1282-0000) · 대지 → 줄 0개
::error::지번 후보 1282 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024564 --area 84.86`
Exit status 1
── A10024564 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024564 --area 59.92

▶ 개포래미안포레스트 (A10024564) · 전용 59.92㎡ · 11680-10300 · 지번 후보 1282
   지번 1282 (1282-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024564-59.json
   전유 59.92 + 주거공용 26.13 = 공급 86.05㎡ = 26.03평 → **26평**
   표본: 120동 1202 (같은 전용 호 150개) · 전용률 69.6%
     · 아파트 / 계단실 [각층 각층] 20.86
     · 아파트 / 벽체 [지상 12층] 5.27
   ⚠️ 전용률 69.6% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13551103 전용 83.04

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13551103 --area 83.04

▶ 압구정한양아파트제1단지 (A13551103) · 전용 83.04㎡ · 11680-11000 · 지번 후보 490
   지번 490 (0490-0000) · 대지 → 줄 1300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13551103-84.json
   전유 83.04 + 주거공용 32.46 = 공급 115.5㎡ = 34.94평 → **35평**
   표본: 3 701호 (같은 전용 호 3개) · 전용률 71.9%
     · 부대시설 / 계단 [지상 7층] 22.18
     · / [지하 지하1층] 9.49
     · / [옥탑 옥탑층] 0.79
     · 부대시설 / 복도계단 [지상 7층] 0
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
── A13599303 전용 83.7

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13599303 --area 83.7

▶ 개포주공6단지 (A13599303) · 전용 83.7㎡ · 11680-10300 · 지번 후보 668-1, 185
   지번 668-1 (0668-0001) · 대지 → 줄 0개
   지번 185 (0185-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13599303-84.json
   전유 83.7 + 주거공용 31.02 = 공급 114.72㎡ = 34.7평 → **35평**
   표본: 705 206호 (같은 전용 호 17개) · 전용률 73.0%
     · 부대시설 / 지하실 [] 31.02
     · 부대시설 / 기계실 [] 0
     · 부대시설 / 변전실 [] 0
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
── A13593802 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13593802 --area 59.94

▶ 수서1-1단지아파트 (A13593802) · 전용 59.94㎡ · 11680-11400 · 지번 후보 711
   지번 711 (0711-0000) · 대지 → 줄 2300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13593802-59.json
   전유 59.94 + 주거공용 25.1 = 공급 85.04㎡ = 25.72평 → **26평**
   표본: 118 802호 (같은 전용 호 96개) · 전용률 70.5%
     · / [] 25.1
── A13599303 전용 60.13

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13599303 --area 60.13

▶ 개포주공6단지 (A13599303) · 전용 60.13㎡ · 11680-10300 · 지번 후보 668-1, 185
   지번 668-1 (0668-0001) · 대지 → 줄 0개
   지번 185 (0185-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13599303-59.json
   전유 60.13 + 주거공용 17.42 = 공급 77.55㎡ = 23.46평 → **23평**
   표본: 607 505호 (같은 전용 호 66개) · 전용률 77.5%
     · 부대시설 / 지하실 [] 17.42
     · 부대시설 / 기계실 [] 0
     · 부대시설 / 변전실 [] 0
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
── A13592706 전용 59.53

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13592706 --area 59.53

▶ 역삼래미안 (A13592706) · 전용 59.53㎡ · 11680-10100 · 지번 후보 757
   지번 757 (0757-0000) · 대지 → 줄 0개
::error::757 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13592706 --area 59.53`
Exit status 1
── A13509012 전용 84.236

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13509012 --area 84.236

▶ 삼성힐스테이트1단지 (A13509012) · 전용 84.236㎡ · 11680-10500 · 지번 후보 16-2
   지번 16-2 (0016-0002) · 대지 → 줄 0개
::error::16-2 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13509012 --area 84.236`
Exit status 1
── A13585804 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13585804 --area 84.97

▶ 역삼럭키 (A13585804) · 전용 84.97㎡ · 11680-11800 · 지번 후보 963
   지번 963 (0963-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13585804-84.json
   전유 84.97 + 주거공용 19.63 = 공급 104.6㎡ = 31.64평 → **32평**
   표본: 102 710호 (같은 전용 호 2개) · 전용률 81.2%
     · 부대시설 / 복도계단 [지상 7층] 14.42
     · 부대시설 / 계단 [지상 7층] 5.21
     · 부대시설 / 승강기 [지상 7층] 0
── A13527203 전용 84.9984

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13527203 --area 84.9984

▶ 도곡렉슬 (A13527203) · 전용 84.9984㎡ · 11680-11800 · 지번 후보 527
   지번 527 (0527-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13527203-84.json
   전유 84.998 + 주거공용 26.089 = 공급 111.09㎡ = 33.6평 → **34평**
   표본: 206동 601 (같은 전용 호 12개) · 전용률 76.5%
     · 아파트 / 계단실,승강기,홀,벽체 [각층 각층] 26.0891
── A13527203 전용 59.9818

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13527203 --area 59.9818

▶ 도곡렉슬 (A13527203) · 전용 59.9818㎡ · 11680-11800 · 지번 후보 527
   지번 527 (0527-0000) · 대지 → 줄 0개
::error::지번 후보 527 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13527203 --area 59.9818`
Exit status 1
── A13528004 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13528004 --area 84.96

▶ 대치미도맨션 (A13528004) · 전용 84.96㎡ · 11680-10600 · 지번 후보 511
   지번 511 (0511-0000) · 대지 → 줄 0개
::error::지번 후보 511 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13528004 --area 84.96`
Exit status 1
── A13528004 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13528004 --area 84.48

▶ 대치미도맨션 (A13528004) · 전용 84.48㎡ · 11680-10600 · 지번 후보 511
   지번 511 (0511-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13528004-84.json
   전유 84.48 + 주거공용 27.95 = 공급 112.43㎡ = 34.01평 → **34평**
   표본: 101 201호 (같은 전용 호 55개) · 전용률 75.1%
     · / [] 27.95
── A13583507 전용 84.43

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13583507 --area 84.43

▶ 은마 (A13583507) · 전용 84.43㎡ · 11680-10600 · 지번 후보 80, 316
   지번 80 (0080-0000) · 대지 → 줄 0개
   지번 316 (0316-0000) · 대지 → 줄 2100개
::error::전용 84.43㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 316) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13583507 --area 84.43`
Exit status 1
── A13583604 전용 84.55

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13583604 --area 84.55

▶ 대치선경 (A13583604) · 전용 84.55㎡ · 11680-10600 · 지번 후보 506
   지번 506 (0506-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13583604-84.json
   전유 84.55 + 주거공용 17.72 = 공급 102.27㎡ = 30.94평 → **31평**
   표본: 9 1103호 (같은 전용 호 2개) · 전용률 82.7%
     · 부대시설 / 공용 [] 11.47
     · / [지하 지하1층] 6.25
── A10027800 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027800 --area 84.97

▶ 래미안 대치 팰리스 (A10027800) · 전용 84.97㎡ · 11680-10600 · 지번 후보 633
::error::633 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027800 --area 84.97`
Exit status 1
── A10025675 전용 84.943

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025675 --area 84.943

▶ 래미안블레스티지 (A10025675) · 전용 84.943㎡ · 11680-10300 · 지번 후보 1280
   지번 1280 (1280-0000) · 대지 → 줄 0개
::error::지번 후보 1280 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025675 --area 84.943`
Exit status 1
── A10025675 전용 59.967

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025675 --area 59.967

▶ 래미안블레스티지 (A10025675) · 전용 59.967㎡ · 11680-10300 · 지번 후보 1280
   지번 1280 (1280-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025675-59.json
   전유 59.967 + 주거공용 20.959 = 공급 80.93㎡ = 24.48평 → **24평**
   표본: 205동 204 (같은 전용 호 117개) · 전용률 74.1%
     · 아파트 / 계단실 [각층 각층] 15.495
     · 아파트 / 외벽 [지상 2층] 5.464
⏳ 시간 예산(1200초)에 닿아 383줄은 다음 칸으로 미룹니다
```
