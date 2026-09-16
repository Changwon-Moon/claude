# 단지 공급면적 — 마지막 실행

- 성공 36건 · 실패 141건 · 미룸 149줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 171/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
t-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13520001 --area 84.99`
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
   지번 565 (0565-0000) · 대지 → 줄 3000개
::error::전용 59.6㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 565) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15685206 --area 59.6`
Exit status 1
── A15089421 전용 60.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15089421 --area 60.96

▶ 여의도시범아파트 (A15089421) · 전용 60.96㎡ · 11560-11000 · 지번 후보 50
   지번 50 (0050-0000) · 대지 → 줄 1839개
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
── A15701602 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 59.97

▶ 우장산롯데캐슬 (A15701602) · 전용 59.97㎡ · 11500-10300 · 지번 후보 1145, 2545
   지번 1145 (1145-0000) · 대지 → 줄 3000개
::error::전용 59.97㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1145) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 59.97`
Exit status 1
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
── A10024347 전용 84.9472

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024347 --area 84.9472

▶ 마포프레스티지자이아파트 (A10024347) · 전용 84.9472㎡ · 11440-10900 · 지번 후보 507
   지번 507 (0507-0000) · 대지 → 줄 0개
::error::지번 후보 507 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
   지번 270-1 (0270-0001) · 대지 → 줄 0개
::error::지번 후보 270-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
── A12008003 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12008003 --area 84.87

▶ 독립문극동 (A12008003) · 전용 84.87㎡ · 11410-10900 · 지번 후보 200
   지번 200 (0200-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12008003-84.json
   전유 84.87 + 주거공용 15.192 = 공급 100.06㎡ = 30.27평 → **30평**
   표본: 101동 704호 (같은 전용 호 158개) · 전용률 84.8%
     · 아파트 / 현관,계단 [각층 각층] 15.192
── A12012203 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12012203 --area 59.4

▶ 남가좌동현대아파트 (A12012203) · 전용 59.4㎡ · 11410-12000 · 지번 후보 1932-6, 481, 376, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 376 (0376-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12012203-59.json
   전유 59.4 + 주거공용 20.456 = 공급 79.86㎡ = 24.16평 → **24평**
   표본: 107동 505호 (같은 전용 호 168개) · 전용률 74.4%
     · 아파트 / 계단실,엘리베이터,복도 [각층 각층] 20.456
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
── A10023079 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023079 --area 59.98

▶ DMC파인시티자이 (A10023079) · 전용 59.98㎡ · 11380-10100 · 지번 후보 431, 190
   지번 431 (0431-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023079-59.json
   전유 59.98 + 주거공용 22.88 = 공급 82.86㎡ = 25.07평 → **25평**
   표본: 105동 1101 (같은 전용 호 105개) · 전용률 72.4%
     · 아파트 / 계단실 [지상 각층] 17.95
     · 아파트 / 벽체공용 [지상 11층] 4.93
── A10023076 전용 59.9865

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023076 --area 59.9865

▶ DMC SKVIEW 아이파크포레 (A10023076) · 전용 59.9865㎡ · 11380-10100 · 지번 후보 191
   지번 191 (0191-0000) · 대지 → 줄 0개
::error::지번 후보 191 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023076 --area 59.9865`
Exit status 1
── A10024828 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024828 --area 84.87

▶ DMC롯데캐슬더퍼스트 (A10024828) · 전용 84.87㎡ · 11380-10100 · 지번 후보 417, 2545
   지번 417 (0417-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024828-84.json
   전유 84.87 + 주거공용 27.21 = 공급 112.08㎡ = 33.9평 → **34평**
   표본: 114동 1205 (같은 전용 호 135개) · 전용률 75.7%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 21.31
     · 아파트 / 벽체 [지상 12층] 5.9
── A10023076 전용 84.9926

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023076 --area 84.9926

▶ DMC SKVIEW 아이파크포레 (A10023076) · 전용 84.9926㎡ · 11380-10100 · 지번 후보 191
   지번 191 (0191-0000) · 대지 → 줄 0개
::error::지번 후보 191 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023076 --area 84.9926`
Exit status 1
── A10024828 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024828 --area 59.96

▶ DMC롯데캐슬더퍼스트 (A10024828) · 전용 59.96㎡ · 11380-10100 · 지번 후보 417, 2545
   지번 417 (0417-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024828-59.json
   전유 59.96 + 주거공용 25.82 = 공급 85.78㎡ = 25.95평 → **26평**
   표본: 109동 601 (같은 전용 호 100개) · 전용률 69.9%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 20.73
     · 아파트 / 벽체 [지상 6층] 5.09
   ⚠️ 전용률 69.9% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10024831 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024831 --area 84.94

▶ 녹번역e편한세상캐슬 (A10024831) · 전용 84.94㎡ · 11380-10700 · 지번 후보 769
   지번 769 (0769-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024831-84.json
   전유 84.94 + 주거공용 30.207 = 공급 115.15㎡ = 34.83평 → **35평**
   표본: 106동 2201 (같은 전용 호 133개) · 전용률 73.8%
     · 아파트 / 계단실,복도 [각층 각층] 22.26
     · 아파트 / 벽체 [지상 22층] 7.24
     · 부대시설 / 지하층 계단실 [지하 지1층] 0.707
── A12201003 전용 84.49

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12201003 --area 84.49

▶ 백련산힐스테이트1차 (A12201003) · 전용 84.49㎡ · 11380-10700 · 지번 후보 759
   지번 759 (0759-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12201003-84.json
   전유 84.49 + 주거공용 22.99 = 공급 107.48㎡ = 32.51평 → **33평**
   표본: 112동 105 (같은 전용 호 211개) · 전용률 78.6%
     · 아파트 / 계단실,승강기 [각층 각층] 17.4
     · 아파트 / 벽체 [각층 각층] 5.59
── A12201003 전용 59.63

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12201003 --area 59.63

▶ 백련산힐스테이트1차 (A12201003) · 전용 59.63㎡ · 11380-10700 · 지번 후보 759
   지번 759 (0759-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12201003-59.json
   전유 59.63 + 주거공용 24.32 = 공급 83.95㎡ = 25.39평 → **25평**
   표본: 110동 405 (같은 전용 호 158개) · 전용률 71.0%
     · 아파트 / 계단실,승강기 [각층 각층] 18.96
     · 아파트 / 벽체 [각층 각층] 5.36
── A12204004 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12204004 --area 84.96

▶ 북한산힐스테이트3차아파트 (A12204004) · 전용 84.96㎡ · 11380-10300 · 지번 후보 641
   지번 641 (0641-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12204004-84.json
   전유 84.96 + 주거공용 25.71 = 공급 110.67㎡ = 33.48평 → **33평**
   표본: 3303동 204 (같은 전용 호 136개) · 전용률 76.8%
     · 아파트 / 계단,승강기 [각층 각층] 19.93
     · 아파트 / 벽체 [각층 각층] 5.78
── A12285703 전용 84.65

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 84.65

▶ 미성아파트(불광동) (A12285703) · 전용 84.65㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12285703-84.json
   전유 84.65 + 주거공용 20.13 = 공급 104.78㎡ = 31.7평 → **32평**
   표본: 5동 906 (같은 전용 호 102개) · 전용률 80.8%
     · 아파트 / 복도 [각층 각층] 13.8
     · 아파트 / 코아 [] 5.35
     · 아파트 / 쓰레기통 [] 0.83
     · 아파트 / 현관 [지상 1층] 0.15
── A10027816 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027816 --area 84.99

▶ 북한산 푸르지오 (A10027816) · 전용 84.99㎡ · 11380-10200 · 지번 후보 281
   지번 281 (0281-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027816-84.json
   전유 84.99 + 주거공용 29.79 = 공급 114.78㎡ = 34.72평 → **35평**
   표본: 321동 201 (같은 전용 호 163개) · 전용률 74.1%
     · 아파트 / 계단실 [각층 각층] 23.99
     · 아파트 / 벽체 [각층 각층] 5.8
── A10027816 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027816 --area 59.99

▶ 북한산 푸르지오 (A10027816) · 전용 59.99㎡ · 11380-10200 · 지번 후보 281
   지번 281 (0281-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027816-59.json
   전유 59.99 + 주거공용 22.57 = 공급 82.56㎡ = 24.97평 → **25평**
   표본: 318동 402 (같은 전용 호 35개) · 전용률 72.7%
     · 아파트 / 계단실 [각층 각층] 17.62
     · 아파트 / 벽체 [각층 각층] 4.95
── A13981903 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13981903 --area 84.41

▶ 상계주공14단지 (A13981903) · 전용 84.41㎡ · 11350-10500 · 지번 후보 663-1, 626
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 626 (0626-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13981903-84.json
   전유 84.41 + 주거공용 7.79 = 공급 92.2㎡ = 27.89평 → **28평**
   표본: 1418동 402호 (같은 전용 호 72개) · 전용률 91.5%
     · 아파트 / 계단,복도등 [각층 각층] 7.79
   ⚠️ 전용률 91.6% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13983004 전용 59.18

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13983004 --area 59.18

▶ 상계주공2단지 (A13983004) · 전용 59.18㎡ · 11350-10500 · 지번 후보 740
   지번 740 (0740-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13983004-59.json
   전유 59.18 + 주거공용 10.95 = 공급 70.13㎡ = 21.21평 → **21평**
   표본: 211동 408호 (같은 전용 호 112개) · 전용률 84.4%
     · 아파트 / 계단등 [각층 각층] 10.95
── A13986302 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13986302 --area 84.97

▶ 중계경남롯데상아 (A13986302) · 전용 84.97㎡ · 11350-10600 · 지번 후보 505
   지번 505 (0505-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13986302-84.json
   전유 84.97 + 주거공용 10.07 = 공급 95.04㎡ = 28.75평 → **29평**
   표본: 14동 402호 (같은 전용 호 151개) · 전용률 89.4%
     · 아파트 / 계단,복도 [각층 각층] 10.07
── A13983105 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13983105 --area 84.41

▶ 상계주공1단지 (A13983105) · 전용 84.41㎡ · 11350-10500 · 지번 후보 663-1, 765
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 765 (0765-0000) · 대지 → 줄 2328개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13983105-84.json
   전유 84.41 + 주거공용 7.8 = 공급 92.21㎡ = 27.89평 → **28평**
   표본: 109동 204호 (같은 전용 호 60개) · 전용률 91.5%
     · 아파트 / 계단,복도등 [각층 각층] 7.8
   ⚠️ 전용률 91.5% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13905105 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13905105 --area 84.98

▶ 월계동현대 (A13905105) · 전용 84.98㎡ · 11350-10200 · 지번 후보 1932-6, 481, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13905105-84.json
   전유 84.98 + 주거공용 16.14 = 공급 101.12㎡ = 30.59평 → **31평**
   표본: 111동 1006호 (같은 전용 호 129개) · 전용률 84.0%
     · 아파트 / 복도.계단 [각층 각층] 16.14
── A13984814 전용 84.815

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 84.815

▶ 월계주공2단지 (A13984814) · 전용 84.815㎡ · 11350-10200 · 지번 후보 556
   지번 556 (0556-0000) · 대지 → 줄 3000개
::error::전용 84.815㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 556) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 84.815`
Exit status 1
── A13987303 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13987303 --area 84.95

▶ 하계현대우성 (A13987303) · 전용 84.95㎡ · 11350-10400 · 지번 후보 1932-6, 481, 700-1, 818, 929, 270
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 270 (0270-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13987303-84.json
   전유 84.95 + 주거공용 9.88 = 공급 94.83㎡ = 28.69평 → **29평**
   표본: 104동 501 (같은 전용 호 229개) · 전용률 89.6%
     · 아파트 / 계단등 [각층 각층] 9.88
── A13987305 전용 84.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13987305 --area 84.77

▶ 하계학여울청구 (A13987305) · 전용 84.77㎡ · 11350-10400 · 지번 후보 354
   지번 354 (0354-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13987305-84.json
   전유 84.77 + 주거공용 13.03 = 공급 97.8㎡ = 29.58평 → **30평**
   표본: 113동 1401호 (같은 전용 호 166개) · 전용률 86.7%
     · 아파트 / 계단,복도,ELE실 [각층 각층] 13.03
── A13987305 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13987305 --area 59.4

▶ 하계학여울청구 (A13987305) · 전용 59.4㎡ · 11350-10400 · 지번 후보 354
   지번 354 (0354-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13987305-59.json
   전유 59.4 + 주거공용 14.82 = 공급 74.22㎡ = 22.45평 → **22평**
   표본: 101동 1501호 (같은 전용 호 85개) · 전용률 80.0%
     · 아파트 / 계단,복도,ELE실 [각층 각층] 14.82
── A13923108 전용 59.7

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13923108 --area 59.7

▶ 하계청솔 (A13923108) · 전용 59.7㎡ · 11350-10400 · 지번 후보 274
   지번 274 (0274-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13923108-59.json
   전유 59.7 + 주거공용 18.94 = 공급 78.64㎡ = 23.79평 → **24평**
   표본: 707동 810 (같은 전용 호 143개) · 전용률 75.9%
     · 아파트 / 공용(복도,계단) [각층 각층] 18.94
── A13987306 전용 57.71

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13987306 --area 57.71

▶ 하계극동건영벽산 (A13987306) · 전용 57.71㎡ · 11350-10400 · 지번 후보 271-3
   지번 271-3 (0271-0003) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13987306-59.json
   전유 57.71 + 주거공용 7.52 = 공급 65.23㎡ = 19.73평 → **20평**
   표본: 11동 1503 (같은 전용 호 43개) · 전용률 88.5%
     · 아파트 / 계단,복도 [각층 각층] 7.52
── A13986504 전용 59.26

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13986504 --area 59.26

▶ 중계무지개아파트 (A13986504) · 전용 59.26㎡ · 11350-10600 · 지번 후보 512
   지번 512 (0512-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13986504-59.json
   전유 59.26 + 주거공용 18.72 = 공급 77.98㎡ = 23.59평 → **24평**
   표본: 210동 105호 (같은 전용 호 181개) · 전용률 76.0%
     · 아파트 / 복도,계단 [각층 각층] 18.72
── A13986306 전용 59.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13986306 --area 59.22

▶ 중계그린 (A13986306) · 전용 59.22㎡ · 11350-10600 · 지번 후보 502-1
   지번 502-1 (0502-0001) · 대지 → 줄 3000개
::error::전용 59.22㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 502-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13986306 --area 59.22`
Exit status 1
── A13922114 전용 84.79

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13922114 --area 84.79

▶ 중계주공5단지 (A13922114) · 전용 84.79㎡ · 11350-10600 · 지번 후보 359-1
   지번 359-1 (0359-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13922114-84.json
   전유 84.79 + 주거공용 13.05 = 공급 97.84㎡ = 29.6평 → **30평**
   표본: 518동 301호 (같은 전용 호 155개) · 전용률 86.7%
     · 아파트 / 계단,복도등 [각층 각층] 13.05
── A13984814 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 59.97

▶ 월계주공2단지 (A13984814) · 전용 59.97㎡ · 11350-10200 · 지번 후보 556
   지번 556 (0556-0000) · 대지 → 줄 3000개
::error::전용 59.97㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 556) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 59.97`
Exit status 1
── A13984005 전용 59.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984005 --area 59.22

▶ 월계시영고층 (A13984005) · 전용 59.22㎡ · 11350-10200 · 지번 후보 13
   지번 13 (0013-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13984005-59.json
   전유 59.22 + 주거공용 15.1 = 공급 74.32㎡ = 22.48평 → **22평**
   표본: 24동 801 (같은 전용 호 264개) · 전용률 79.7%
     · 아파트 / 계단,복도등 [각층 각층] 15.1
── A13983815 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13983815 --area 59.95

▶ 상계은빛2단지 (A13983815) · 전용 59.95㎡ · 11350-10500 · 지번 후보 1256
   지번 1256 (1256-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13983815-59.json
   전유 59.95 + 주거공용 16.25 = 공급 76.2㎡ = 23.05평 → **23평**
   표본: 201동 809호 (같은 전용 호 248개) · 전용률 78.7%
     · 아파트 / 복도,계단실,승강기 [각층 각층] 16.25
── A13983816 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13983816 --area 59.95

▶ 상계은빛1단지 (A13983816) · 전용 59.95㎡ · 11350-10500 · 지번 후보 1255
   지번 1255 (1255-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13983816-59.json
   전유 59.95 + 주거공용 17.27 = 공급 77.22㎡ = 23.36평 → **23평**
   표본: 110동 1309호 (같은 전용 호 229개) · 전용률 77.6%
     · 아파트 / 복도,계단실,승강기 [각층 각층] 17.27
── A13921005 전용 61.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13921005 --area 61.52

▶ 상계주공9단지 (A13921005) · 전용 61.52㎡ · 11350-10500 · 지번 후보 13, 670
   지번 13 (0013-0000) · 대지 → 줄 0개
   지번 670 (0670-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13921005-59.json
   전유 61.52 + 주거공용 18.83 = 공급 80.35㎡ = 24.31평 → **24평**
   표본: 905동 308호 (같은 전용 호 83개) · 전용률 76.6%
     · 아파트 / 계단,복도등 [각층 각층] 18.83
── A13982704 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13982704 --area 58.01

▶ 상계주공7단지 (A13982704) · 전용 58.01㎡ · 11350-10500 · 지번 후보 295, 691
   지번 295 (0295-0000) · 대지 → 줄 0개
   지번 691 (0691-0000) · 대지 → 줄 1428개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13982704-59.json
   전유 58.01 + 주거공용 17.13 = 공급 75.14㎡ = 22.73평 → **23평**
   표본: 721동 1305호 (같은 전용 호 176개) · 전용률 77.2%
     · 아파트 / 계단,복도등 [각층 각층] 17.13
── A13920707 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920707 --area 58.01

▶ 상계주공6단지 (A13920707) · 전용 58.01㎡ · 11350-10500 · 지번 후보 668-1, 720
   지번 668-1 (0668-0001) · 대지 → 줄 0개
   지번 720 (0720-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13920707-59.json
   전유 58.01 + 주거공용 17.28 = 공급 75.29㎡ = 22.78평 → **23평**
   표본: 622동 705호 (같은 전용 호 490개) · 전용률 77.0%
     · 아파트 / 계단,복도등 [각층 각층] 17.28
── A13920706 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 84.2

▶ 상계주공4단지 (A13920706) · 전용 84.2㎡ · 11350-10500 · 지번 후보 749-5
   지번 749-5 (0749-0005) · 대지 → 줄 369개
::error::전용 84.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 749-5) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 84.2`
Exit status 1
── A13920706 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 58.01

▶ 상계주공4단지 (A13920706) · 전용 58.01㎡ · 11350-10500 · 지번 후보 749-5
   지번 749-5 (0749-0005) · 대지 → 줄 369개
::error::전용 58.01㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 749-5) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 58.01`
Exit status 1
── A13971502 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2

▶ 상계주공3단지 (A13971502) · 전용 84.2㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 382개
::error::전용 84.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 730-2) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2`
Exit status 1
── A13971502 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 58.01

▶ 상계주공3단지 (A13971502) · 전용 58.01㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 382개
::error::전용 58.01㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 730-2) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 58.01`
Exit status 1
── A13983004 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13983004 --area 84.41

▶ 상계주공2단지 (A13983004) · 전용 84.41㎡ · 11350-10500 · 지번 후보 740
   지번 740 (0740-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13983004-84.json
   전유 84.41 + 주거공용 7.44 = 공급 91.85㎡ = 27.78평 → **28평**
   표본: 216동 405호 (같은 전용 호 19개) · 전용률 91.9%
     · 아파트 / 계단등 [각층 각층] 7.44
   ⚠️ 전용률 91.9% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13981903 전용 59.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13981903 --area 59.39

▶ 상계주공14단지 (A13981903) · 전용 59.39㎡ · 11350-10500 · 지번 후보 663-1, 626
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 626 (0626-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13981903-59.json
   전유 59.39 + 주거공용 12.9 = 공급 72.29㎡ = 21.87평 → **22평**
   표본: 1409동 207호 (같은 전용 호 81개) · 전용률 82.2%
     · 아파트 / 계단,복도등 [각층 각층] 12.9
── A13982202 전용 61.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13982202 --area 61.52

▶ 상계주공12단지 (A13982202) · 전용 61.52㎡ · 11350-10500 · 지번 후보 110, 663-1, 647
   지번 110 (0110-0000) · 대지 → 줄 0개
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 647 (0647-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13982202-59.json
   전유 61.52 + 주거공용 18.83 = 공급 80.35㎡ = 24.31평 → **24평**
   표본: 1210동 803호 (같은 전용 호 105개) · 전용률 76.6%
     · 아파트 / 계단,복도등 [각층 각층] 18.83
── A13982301 전용 59.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13982301 --area 59.2

▶ 상계주공11단지 (A13982301) · 전용 59.2㎡ · 11350-10500 · 지번 후보 663-1, 652
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 652 (0652-0000) · 대지 → 줄 3000개
::error::전용 59.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 652) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13982301 --area 59.2`
Exit status 1
── A13920804 전용 59.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920804 --area 59.39

▶ 상계주공10단지 (A13920804) · 전용 59.39㎡ · 11350-10500 · 지번 후보 30, 663-1, 666
   지번 30 (0030-0000) · 대지 → 줄 0개
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 666 (0666-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13920804-59.json
   전유 59.39 + 주거공용 18 = 공급 77.39㎡ = 23.41평 → **23평**
   표본: 1005동 703호 (같은 전용 호 147개) · 전용률 76.7%
     · 아파트 / 계단,복도등 [각층 각층] 18
⏳ 시간 예산(1200초)에 닿아 149줄은 다음 칸으로 미룹니다
```
