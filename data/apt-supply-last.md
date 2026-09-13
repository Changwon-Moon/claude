# 단지 공급면적 — 마지막 실행

- 성공 45건 · 실패 131건 · 미룸 214줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 170/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
aCli.ts -- --kapt A10027800 --area 59.99

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
── A15205513 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15205513 --area 59.88

▶ 신도림태영타운 (A15205513) · 전용 59.88㎡ · 11530-10200 · 지번 후보 1267
   지번 1267 (1267-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15205513-59.json
   전유 59.88 + 주거공용 15.67 = 공급 75.55㎡ = 22.85평 → **23평**
   표본: 101동 1502호 (같은 전용 호 84개) · 전용률 79.3%
     · 아파트 / 계단,복도,ELEV [1층∼27층] 15.67
── A15209207 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15209207 --area 59.94

▶ 개봉동현대아파트 (A15209207) · 전용 59.94㎡ · 11530-10700 · 지번 후보 1932-6, 481, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15209207-59.json
   전유 59.94 + 주거공용 16.73 = 공급 76.67㎡ = 23.19평 → **23평**
   표본: 122동 1803호 (같은 전용 호 63개) · 전용률 78.2%
     · 아파트 / 복도,계단 [1/25층] 16.73
── A15701602 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 59.97

▶ 우장산롯데캐슬 (A15701602) · 전용 59.97㎡ · 11500-10300 · 지번 후보 1145
   지번 1145 (1145-0000) · 대지 → 줄 3000개
::error::전용 59.97㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1145) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15701602 --area 59.97`
Exit status 1
── A15792602 전용 84.914

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15792602 --area 84.914

▶ 화곡푸르지오 (A15792602) · 전용 84.914㎡ · 11500-10300 · 지번 후보 1091
   지번 1091 (1091-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15792602-84.json
   전유 84.914 + 주거공용 30.084 = 공급 115㎡ = 34.79평 → **35평**
   표본: 134동 403 (같은 전용 호 86개) · 전용률 73.8%
     · 아파트 / 계단,승강기 [각층 4층] 21.5166
     · 아파트 / 지하실 [지하 지2층-지1층] 8.5677
── A15701003 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15701003 --area 59.98

▶ 우장산아이파크이편한세상 (A15701003) · 전용 59.98㎡ · 11500-10300 · 지번 후보 1159
   지번 1159 (1159-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15701003-59.json
   전유 59.98 + 주거공용 19.95 = 공급 79.93㎡ = 24.18평 → **24평**
   표본: 106동 404호 (같은 전용 호 87개) · 전용률 75.0%
     · 아파트 / 계단실,승강기 [각층 각층] 15.36
     · 아파트 / 벽체 [지상 4층] 4.59
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
── A10026879 전용 59.9825

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026879 --area 59.9825

▶ 마곡13단지 힐스테이트마스터 아파트 (A10026879) · 전용 59.9825㎡ · 11500-10500 · 지번 후보 748
   지번 748 (0748-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026879-59.json
   전유 59.983 + 주거공용 21.548 = 공급 81.53㎡ = 24.66평 → **25평**
   표본: 1305동 1504 (같은 전용 호 144개) · 전용률 73.6%
     · 아파트 / 홀,계단 [지상 각층] 15.6251
     · 아파트 / 벽체 [지상 각층] 5.9232
── A15703309 전용 58.14

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15703309 --area 58.14

▶ 등촌주공5단지 (A15703309) · 전용 58.14㎡ · 11500-10200 · 지번 후보 359-1, 695
   지번 359-1 (0359-0001) · 대지 → 줄 0개
   지번 695 (0695-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15703309-59.json
   전유 58.14 + 주거공용 15.68 = 공급 73.82㎡ = 22.33평 → **22평**
   표본: 503동 1503호 (같은 전용 호 469개) · 전용률 78.8%
     · 아파트 / 계단,복도 등 [각층] 15.68
── A15703308 전용 58.14

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15703308 --area 58.14

▶ 등촌3단지주공아파트 (A15703308) · 전용 58.14㎡ · 11500-10200 · 지번 후보 688
   지번 688 (0688-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15703308-59.json
   전유 58.14 + 주거공용 16.82 = 공급 74.96㎡ = 22.68평 → **23평**
   표본: 308동 601호 (같은 전용 호 489개) · 전용률 77.6%
     · 아파트 / 계단,복도 등 [각층] 16.82
── A15728009 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15728009 --area 84.98

▶ 우장산힐스테이트 (A15728009) · 전용 84.98㎡ · 11500-10600 · 지번 후보 657
   지번 657 (0657-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15728009-84.json
   전유 84.98 + 주거공용 24.09 = 공급 109.07㎡ = 32.99평 → **33평**
   표본: 128동 1102 (같은 전용 호 203개) · 전용률 77.9%
     · 아파트 / 계단,승강기,벽체 [각층 각층] 24.09
── A15728009 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15728009 --area 59.98

▶ 우장산힐스테이트 (A15728009) · 전용 59.98㎡ · 11500-10600 · 지번 후보 657
   지번 657 (0657-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15728009-59.json
   전유 59.98 + 주거공용 19.34 = 공급 79.32㎡ = 23.99평 → **24평**
   표본: 104동 1303 (같은 전용 호 95개) · 전용률 75.6%
     · 아파트 / 계단,승강기,벽체 [각층 각층] 19.34
── A15780905 전용 58.65

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15780905 --area 58.65

▶ 가양6단지 (A15780905) · 전용 58.65㎡ · 11500-10400 · 지번 후보 1485
   지번 1485 (1485-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15780905-59.json
   전유 58.65 + 주거공용 17.24 = 공급 75.89㎡ = 22.96평 → **23평**
   표본: 613동 1305호 (같은 전용 호 300개) · 전용률 77.3%
     · 아파트 / 계단,복도 [각층 각층] 17.24
── A15873701 전용 61.26

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15873701 --area 61.26

▶ 목동10단지 (A15873701) · 전용 61.26㎡ · 11470-10100 · 지번 후보 311
   지번 311 (0311-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15873701-59.json
   전유 61.26 + 주거공용 22.21 = 공급 83.47㎡ = 25.25평 → **25평**
   표본: 1018동 106호 (같은 전용 호 5개) · 전용률 73.4%
     · 아파트 / 계단실 [지상 1층] 21
     · 아파트 / 아파트 [지하 지층] 1.21
── A10024398 전용 59.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024398 --area 59.82

▶ 래미안 목동아델리체 (A10024398) · 전용 59.82㎡ · 11470-10100 · 지번 후보 1326
   지번 1326 (1326-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024398-59.json
   전유 59.82 + 주거공용 23.08 = 공급 82.9㎡ = 25.08평 → **25평**
   표본: 108동 1502 (같은 전용 호 104개) · 전용률 72.2%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 17.99
     · 아파트 / 벽체 [지상 15층] 5.09
── A15805504 전용 83.47

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15805504 --area 83.47

▶ 목동5단지 (A15805504) · 전용 83.47㎡ · 11470-10200 · 지번 후보 912
   지번 912 (0912-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15805504-84.json
   전유 83.47 + 주거공용 15.92 = 공급 99.39㎡ = 30.07평 → **30평**
   표본: 502동 103호 (같은 전용 호 3개) · 전용률 84.0%
     · 아파트 / 계단실 [지상 1층] 11.1
     · 아파트 / [지하 지층] 4.82
── A15873701 전용 85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15873701 --area 85

▶ 목동10단지 (A15873701) · 전용 85㎡ · 11470-10100 · 지번 후보 311
   지번 311 (0311-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15873701-84.json
   전유 85 + 주거공용 17.36 = 공급 102.36㎡ = 30.96평 → **31평**
   표본: 1025동 106호 (같은 전용 호 1개) · 전용률 83.0%
     · 아파트 / 계단실 [지상 1층] 17.35
     · 아파트 / 아파트 [지하 지층] 0.01
── A10024398 전용 84.58

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024398 --area 84.58

▶ 래미안 목동아델리체 (A10024398) · 전용 84.58㎡ · 11470-10100 · 지번 후보 1326
   지번 1326 (1326-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024398-84.json
   전유 84.58 + 주거공용 25.83 = 공급 110.41㎡ = 33.4평 → **33평**
   표본: 110동 1404 (같은 전용 호 281개) · 전용률 76.6%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 20.1
     · 아파트 / 벽체 [지상 14층] 5.73
── A15875101 전용 83.23

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15875101 --area 83.23

▶ 목동1단지 (A15875101) · 전용 83.23㎡ · 11470-10200 · 지번 후보 901
   지번 901 (0901-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15875101-84.json
   전유 83.23 + 주거공용 18.13 = 공급 101.36㎡ = 30.66평 → **31평**
   표본: 124동 102호 (같은 전용 호 9개) · 전용률 82.1%
     · 아파트 / 계단실 [지상 1층] 14
     · 아파트 / [지하 지1] 4.13
── A15807605 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15807605 --area 84.41

▶ 목동13단지 (A15807605) · 전용 84.41㎡ · 11470-10100 · 지번 후보 327
   지번 327 (0327-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15807605-84.json
   전유 84.41 + 주거공용 20.83 = 공급 105.24㎡ = 31.84평 → **32평**
   표본: 1323동 104호 (같은 전용 호 4개) · 전용률 80.2%
     · 아파트 / 계단실 [지상 1층] 18.11
     · 아파트 / 아파트 [지하 지층] 2.72
── A15807705 전용 59.29

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15807705 --area 59.29

▶ 목동11단지 (A15807705) · 전용 59.29㎡ · 11470-10100 · 지번 후보 325
   지번 325 (0325-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15807705-59.json
   전유 59.29 + 주거공용 16.14 = 공급 75.43㎡ = 22.82평 → **23평**
   표본: 1115동 101호 (같은 전용 호 6개) · 전용률 78.6%
     · 아파트 / 계단실 [지상 1층] 11.51
     · 아파트 / 아파트 [지하 지층] 4.63
── A15879502 전용 84.51

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15879502 --area 84.51

▶ 신정이펜하우스3단지 (A15879502) · 전용 84.51㎡ · 11470-10100 · 지번 후보 1316
   지번 1316 (1316-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15879502-84.json
   전유 84.51 + 주거공용 31.86 = 공급 116.37㎡ = 35.2평 → **35평**
   표본: 310 904 (같은 전용 호 85개) · 전용률 72.6%
     · 아파트 / 계단실,승강기 [각층 각층] 26
     · 아파트 / 벽체 [각층 각층] 5.86
── A15879502 전용 59.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15879502 --area 59.93

▶ 신정이펜하우스3단지 (A15879502) · 전용 59.93㎡ · 11470-10100 · 지번 후보 1316
   지번 1316 (1316-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15879502-59.json
   전유 59.93 + 주거공용 23.39 = 공급 83.32㎡ = 25.2평 → **25평**
   표본: 301 1004 (같은 전용 호 223개) · 전용률 71.9%
     · 아파트 / 계단실,승강기 [각층 각층] 18.44
     · 아파트 / 벽체 [각층 각층] 4.95
── A10027375 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027375 --area 84.98

▶ 목동힐스테이트 (A10027375) · 전용 84.98㎡ · 11470-10100 · 지번 후보 1323
   지번 1323 (1323-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027375-84.json
   전유 84.98 + 주거공용 24.48 = 공급 109.46㎡ = 33.11평 → **33평**
   표본: 105동 904 (같은 전용 호 198개) · 전용률 77.6%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 17.93
     · 아파트 / 벽체 [지상 9층] 6.51
     · 아파트 / MDF실 [지상 1층] 0.04
── A15807703 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15807703 --area 84.96

▶ 목동2차우성 (A15807703) · 전용 84.96㎡ · 11470-10100 · 지번 후보 337
   지번 337 (0337-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15807703-84.json
   전유 84.96 + 주거공용 13.95 = 공급 98.91㎡ = 29.92평 → **30평**
   표본: 제206동 202호 (같은 전용 호 187개) · 전용률 85.9%
     · 아파트 / 계단,복도,EV [] 12.93
     · 아파트 / 지하부속실 [] 1.02
── A15807606 전용 83.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15807606 --area 83.89

▶ 목동14단지 (A15807606) · 전용 83.89㎡ · 11470-10100 · 지번 후보 329
   지번 329 (0329-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15807606-84.json
   전유 83.89 + 주거공용 24.5 = 공급 108.39㎡ = 32.79평 → **33평**
   표본: 1420동 601호 (같은 전용 호 55개) · 전용률 77.4%
     · 아파트 / 계단실 [지상 6층] 18.87
     · 아파트 / 아파트 [지하 지층] 5.63
── A15807706 전용 56.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15807706 --area 56.76

▶ 목동12단지 (A15807706) · 전용 56.76㎡ · 11470-10100 · 지번 후보 326
   지번 326 (0326-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15807706-59.json
   전유 56.76 + 주거공용 13.75 = 공급 70.51㎡ = 21.33평 → **21평**
   표본: 1201동 104호 (같은 전용 호 45개) · 전용률 80.5%
     · 아파트 / 계단실 [지상 1층] 11.48
     · 아파트 / 아파트 [지하 지층] 2.27
── A15884703 전용 59.49

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15884703 --area 59.49

▶ 신월시영아파트 (A15884703) · 전용 59.49㎡ · 11470-10300 · 지번 후보 987-1
   지번 987-1 (0987-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15884703-59.json
   전유 59.49 + 주거공용 22.21 = 공급 81.7㎡ = 24.71평 → **25평**
   표본: 18동 406호 (같은 전용 호 107개) · 전용률 72.8%
     · 아파트 / 복도 및 계단 [지상 4층] 16.82
     · 아파트 / 아파트 [지하 지층] 5.39
── A15805002 전용 84.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15805002 --area 84.76

▶ 목동한신청구 (A15805002) · 전용 84.76㎡ · 11470-10200 · 지번 후보 929
   지번 929 (0929-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15805002-84.json
   전유 84.76 + 주거공용 18.46 = 공급 103.22㎡ = 31.22평 → **31평**
   표본: 107동 1501호 (같은 전용 호 303개) · 전용률 82.1%
     · 아파트 / 엘리베이터, 계단실 [지상 15층] 11.92
     · 아파트 / 지하실 [지하 지층] 6.54
── A15805115 전용 59.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15805115 --area 59.39

▶ 목동7단지 (A15805115) · 전용 59.39㎡ · 11470-10200 · 지번 후보 925
   지번 925 (0925-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15805115-59.json
   전유 59.39 + 주거공용 12.51 = 공급 71.9㎡ = 21.75평 → **22평**
   표본: 720동 102호 (같은 전용 호 30개) · 전용률 82.6%
     · 아파트 / 계단실 [지상 1층] 7.62
     · 아파트 / [지하 지1] 4.89
── A15805003 전용 82.43

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15805003 --area 82.43

▶ 목동3단지 (A15805003) · 전용 82.43㎡ · 11470-10200 · 지번 후보 903
   지번 903 (0903-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15805003-84.json
   전유 82.43 + 주거공용 18.2 = 공급 100.63㎡ = 30.44평 → **30평**
   표본: 330동 102호 (같은 전용 호 7개) · 전용률 81.9%
     · 아파트 / 계단실 [지상 1층] 13.74
     · 아파트 / 아파트 [지하 지1] 4.46
── A15875102 전용 83.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15875102 --area 83.52

▶ 목동2단지 (A15875102) · 전용 83.52㎡ · 11470-10200 · 지번 후보 902
   지번 902 (0902-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15875102-84.json
   전유 83.52 + 주거공용 15.58 = 공급 99.1㎡ = 29.98평 → **30평**
   표본: 201동 104호 (같은 전용 호 12개) · 전용률 84.3%
     · 아파트 / 계단실 [지상 1층] 10.96
     · 아파트 / 아파트 [지하 지1] 4.62
── A15805303 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15805303 --area 59.98

▶ 목동롯데캐슬위너 (A15805303) · 전용 59.98㎡ · 11470-10200 · 지번 후보 956
   지번 956 (0956-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15805303-59.json
   전유 59.98 + 주거공용 19.55 = 공급 79.53㎡ = 24.06평 → **24평**
   표본: 112동 1902 (같은 전용 호 68개) · 전용률 75.4%
     · 아파트 / 계단실,ELEV. [각층 각층] 15.01
     · 아파트 / 벽체공유 [각층 각층] 4.45
     · 복리시설 / 주민공동시설 [지하 지1층] 0.09
── A10024974 전용 59.751

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024974 --area 59.751

▶ 마포 아이파크 포레 아파트 (A10024974) · 전용 59.751㎡ · 11440-11100 · 지번 후보 462
   지번 462 (0462-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024974-59.json
   전유 59.751 + 주거공용 25.883 = 공급 85.63㎡ = 25.9평 → **26평**
   표본: 106동 1305 (같은 전용 호 133개) · 전용률 69.8%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 20.488
     · 아파트 / 벽체 [지상 13층] 5.395
   ⚠️ 전용률 69.8% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10023508 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023508 --area 84.94

▶ 마포더클래시 (A10023508) · 전용 84.94㎡ · 11440-10100 · 지번 후보 804
   지번 804 (0804-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023508-84.json
   전유 84.94 + 주거공용 30.63 = 공급 115.57㎡ = 34.96평 → **35평**
   표본: 108동 2102 (같은 전용 호 91개) · 전용률 73.5%
     · 아파트 / 계단실,복도,EV홀 [지상 각층] 22.91
     · 아파트 / 벽체 [지상 21층] 7.72
── A10023508 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023508 --area 59.97

▶ 마포더클래시 (A10023508) · 전용 59.97㎡ · 11440-10100 · 지번 후보 804
   지번 804 (0804-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023508-59.json
   전유 59.97 + 주거공용 21.84 = 공급 81.81㎡ = 24.75평 → **25평**
   표본: 109동 1401 (같은 전용 호 199개) · 전용률 73.3%
     · 아파트 / 계단실,복도,EV홀 [지상 각층] 16.19
     · 아파트 / 벽체 [지상 14층] 5.65
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
── A10025003 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025003 --area 84.98

▶ 마포그랑자이아파트 (A10025003) · 전용 84.98㎡ · 11440-10800 · 지번 후보 806
   지번 806 (0806-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025003-84.json
   전유 84.98 + 주거공용 27.97 = 공급 112.95㎡ = 34.17평 → **34평**
   표본: 102동 1403 (같은 전용 호 259개) · 전용률 75.2%
     · 아파트 / 계단실 [각층 각층] 22.23
     · 아파트 / 벽체 [지상 14층] 5.74
── A10025003 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025003 --area 59.96

▶ 마포그랑자이아파트 (A10025003) · 전용 59.96㎡ · 11440-10800 · 지번 후보 806
   지번 806 (0806-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025003-59.json
   전유 59.96 + 주거공용 20.89 = 공급 80.85㎡ = 24.46평 → **24평**
   표본: 106동 1303 (같은 전용 호 201개) · 전용률 74.2%
     · 아파트 / 계단실 [각층 각층] 15.68
     · 아파트 / 벽체 [지상 13층] 5.21
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
── A12175203 전용 59.9656

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12175203 --area 59.9656

▶ 마포래미안푸르지오 (A12175203) · 전용 59.9656㎡ · 11440-10100 · 지번 후보 777, 767
   지번 777 (0777-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12175203-59.json
   전유 59.966 + 주거공용 20.195 = 공급 80.16㎡ = 24.25평 → **24평**
   표본: 409동 203 (같은 전용 호 122개) · 전용률 74.8%
     · 아파트 / 외벽,계단실 [각층 각층] 20.1951
── A12185004 전용 59.43

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12185004 --area 59.43

▶ 성산시영아파트 (A12185004) · 전용 59.43㎡ · 11440-12500 · 지번 후보 446
   지번 446 (0446-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12185004-59.json
   전유 59.43 + 주거공용 18.49 = 공급 77.92㎡ = 23.57평 → **24평**
   표본: 15동 1303호 (같은 전용 호 247개) · 전용률 76.3%
     · 아파트 / 공용 [] 13.2
     · 아파트 / 지하실 [지하 지1층] 5.29
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
── A12181103 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12181103 --area 59.4

▶ 마포태영아파트 (A12181103) · 전용 59.4㎡ · 11440-10800 · 지번 후보 660
   지번 660 (0660-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12181103-59.json
   전유 59.4 + 주거공용 17.72 = 공급 77.12㎡ = 23.33평 → **23평**
   표본: 106동 507호 (같은 전용 호 63개) · 전용률 77.0%
     · 아파트 / 복도 [각층 각층] 10.52
     · 아파트 / 계단실,승강기 [각층 각층] 7.2
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
── A10024719 전용 84.9715

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024719 --area 84.9715

▶ 힐스테이트신촌 (A10024719) · 전용 84.9715㎡ · 11410-11000 · 지번 후보 1017
   지번 1017 (1017-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024719-84.json
   전유 84.972 + 주거공용 30.034 = 공급 115.01㎡ = 34.79평 → **35평**
   표본: 111동 504 (같은 전용 호 137개) · 전용률 73.9%
     · 아파트 / 계단실,승강기,홀,복도 [지상 각층] 23.276
     · 아파트 / 벽체 [지상 5층] 6.7583
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
── A10024719 전용 59.8404

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024719 --area 59.8404

▶ 힐스테이트신촌 (A10024719) · 전용 59.8404㎡ · 11410-11000 · 지번 후보 1017
   지번 1017 (1017-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024719-59.json
   전유 59.84 + 주거공용 28.587 = 공급 88.43㎡ = 26.75평 → **27평**
   표본: 102동 1306 (같은 전용 호 63개) · 전용률 67.7%
     · 아파트 / 계단실,승강기,홀,복도 [지상 각층] 22.9647
     · 아파트 / 벽체 [지상 13층] 5.6219
   ⚠️ 전용률 67.7% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A12004001 전용 84.74

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12004001 --area 84.74

▶ 서대문천연뜨란채아파트 (A12004001) · 전용 84.74㎡ · 11410-10600 · 지번 후보 145
   지번 145 (0145-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12004001-84.json
   전유 84.74 + 주거공용 30.504 = 공급 115.24㎡ = 34.86평 → **35평**
   표본: 101동 803 (같은 전용 호 14개) · 전용률 73.5%
     · 아파트 / 계단실,승강기,벽체 [각층 각층] 27.9587
     · 부대시설 / 주민복지관 [지하 지3~지1층] 1.4116
     · 부대시설 / 지하계단실 [지하 지4~지1층] 1.1198
     · 부대시설 / 경비실 [지하 지1층] 0.0137
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
── A12012202 전용 59.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12012202 --area 59.93

▶ DMC래미안클라시스(분양) (A12012202) · 전용 59.93㎡ · 11410-12000 · 지번 후보 377
   지번 377 (0377-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12012202-59.json
   전유 59.93 + 주거공용 18.38 = 공급 78.31㎡ = 23.69평 → **24평**
   표본: 108동 201호 (같은 전용 호 132개) · 전용률 76.5%
     · 아파트 / 계단실,엘리베이터 [각층 각층] 18.38
⏳ 시간 예산(1200초)에 닿아 214줄은 다음 칸으로 미룹니다
```
