# 단지 공급면적 — 마지막 실행

- 성공 63건 · 실패 123건 · 미룸 286줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 180/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
ts -- --kapt A13509012 --area 84.236

▶ 삼성힐스테이트1단지 (A13509012) · 전용 84.236㎡ · 11680-10500 · 지번 후보 16-2
   지번 16-2 (0016-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13509012-84.json
   전유 84.236 + 주거공용 25.17 = 공급 109.41㎡ = 33.1평 → **33평**
   표본: 1단지 113동 1202 (같은 전용 호 292개) · 전용률 77.0%
     · 아파트 / 계단실,승강기 [지상 각층] 19.67
     · 아파트 / 벽체 [지상 각층] 5.5
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
── A13776509 전용 59.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13776509 --area 59.89

▶ 래미안퍼스티지 (A13776509) · 전용 59.89㎡ · 11650-10700 · 지번 후보 18-1
   지번 18-1 (0018-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13776509-59.json
   전유 59.89 + 주거공용 27.57 = 공급 87.46㎡ = 26.46평 → **26평**
   표본: 105동 2902 (같은 전용 호 89개) · 전용률 68.5%
     · 아파트 / 계단실,ELEV [지상 각층] 20.04
     · 아파트 / 벽체면적,발코니초과면적 [지상 각층] 7.53
   ⚠️ 전용률 68.5% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
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
── A13778205 전용 84.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13778205 --area 84.77

▶ 서초네이처힐3단지 (A13778205) · 전용 84.77㎡ · 11650-10300 · 지번 후보 717
   지번 717 (0717-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13778205-84.json
   전유 84.77 + 주거공용 27.8 = 공급 112.57㎡ = 34.05평 → **34평**
   표본: 310동 101 (같은 전용 호 109개) · 전용률 75.3%
     · 아파트 / 벽체,계단실,승강기,홀등 [각층 각층] 27.8
── A10027205 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027205 --area 84.98

▶ 아크로리버파크 (A10027205) · 전용 84.98㎡ · 11650-10700 · 지번 후보 2-12
   지번 2-12 (0002-0012) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027205-84.json
   전유 84.98 + 주거공용 27.291 = 공급 112.27㎡ = 33.96평 → **34평**
   표본: 101동 403 (같은 전용 호 136개) · 전용률 75.7%
     · 아파트 / 외벽,계단실 [각층 각층] 25.7035
     · 부대시설 / 피난안전구역 [각층 각층] 1.588
── A13704104 전용 84.943

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13704104 --area 84.943

▶ 반포자이 (A13704104) · 전용 84.943㎡ · 11650-10700 · 지번 후보 20-43
   지번 20-43 (0020-0043) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13704104-84.json
   전유 84.943 + 주거공용 31.932 = 공급 116.88㎡ = 35.35평 → **35평**
   표본: 141동 1701 (같은 전용 호 136개) · 전용률 72.7%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 22.83
     · 아파트 / 벽체,발코니초과 [지상 각층] 9.102
── A13776301 전용 84.967

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13776301 --area 84.967

▶ 반포리체 (A13776301) · 전용 84.967㎡ · 11650-10700 · 지번 후보 30-26
   지번 30-26 (0030-0026) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13776301-84.json
   전유 84.967 + 주거공용 28.447 = 공급 113.41㎡ = 34.31평 → **34평**
   표본: 108동 1802 (같은 전용 호 182개) · 전용률 74.9%
     · 아파트 / 계단실 [각층 각층] 17.394
     · 아파트 / 외벽 [각층 각층] 6.818
     · 아파트 / 발코니초과면적 [각층 각층] 4.235
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
── A15101504 전용 57.43

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15101504 --area 57.43

▶ 관악산휴먼시아 (A15101504) · 전용 57.43㎡ · 11620-10200 · 지번 후보 1102, 1735
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 1735 (1735-0000) · 대지 → 줄 3000개
::error::전용 57.43㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1735) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15101504 --area 57.43`
Exit status 1
── A15101508 전용 84.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15101508 --area 84.22

▶ 신림현대 (A15101508) · 전용 84.22㎡ · 11620-10200 · 지번 후보 1932-6, 481, 700-1, 818, 929, 1694
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 1694 (1694-0000) · 대지 → 줄 3000개
::error::전용 84.22㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1694) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15101508 --area 84.22`
Exit status 1
── A15101508 전용 82.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15101508 --area 82.2

▶ 신림현대 (A15101508) · 전용 82.2㎡ · 11620-10200 · 지번 후보 1932-6, 481, 700-1, 818, 929, 1694
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 1694 (1694-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15101508-84.json
   전유 82.2 + 주거공용 11.39 = 공급 93.59㎡ = 28.31평 → **28평**
   표본: 105동 507호 (같은 전용 호 39개) · 전용률 87.8%
     · 다세대주택 / 계단 [지상 5층] 11.39
── A15101508 전용 59.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15101508 --area 59.85

▶ 신림현대 (A15101508) · 전용 59.85㎡ · 11620-10200 · 지번 후보 1932-6, 481, 700-1, 818, 929, 1694
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 1694 (1694-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15101508-59.json
   전유 59.85 + 주거공용 17.68 = 공급 77.53㎡ = 23.45평 → **23평**
   표본: 106동 701호 (같은 전용 호 47개) · 전용률 77.2%
     · 다세대주택 / 복도 [지상 7층] 9.92
     · / 계단 [지상 7층] 7.76
── A15190705 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15190705 --area 59.95

▶ 신림푸르지오 (A15190705) · 전용 59.95㎡ · 11620-10200 · 지번 후보 1730
   지번 1730 (1730-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15190705-59.json
   전유 59.95 + 주거공용 19.46 = 공급 79.41㎡ = 24.02평 → **24평**
   표본: 112동 801 (같은 전용 호 19개) · 전용률 75.5%
     · 아파트 / 계단실 [각층 각층] 15.29
     · 아파트 / 벽체면적 [각층 각층] 4.17
── A15101506 전용 83.21

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15101506 --area 83.21

▶ 삼성산주공3단지 (A15101506) · 전용 83.21㎡ · 11620-10200 · 지번 후보 1714
   지번 1714 (1714-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15101506-84.json
   전유 83.21 + 주거공용 16.266 = 공급 99.48㎡ = 30.09평 → **30평**
   표본: 309동 505호 (같은 전용 호 221개) · 전용률 83.7%
     · 아파트 / 계단실,엘리베이터 [각층] 16.2658
── A15101506 전용 58.55

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15101506 --area 58.55

▶ 삼성산주공3단지 (A15101506) · 전용 58.55㎡ · 11620-10200 · 지번 후보 1714
   지번 1714 (1714-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15101506-59.json
   전유 58.55 + 주거공용 11.445 = 공급 70㎡ = 21.17평 → **21평**
   표본: 304동 1002호 (같은 전용 호 127개) · 전용률 83.7%
     · 아파트 / 계단실,엘리베이터 [각층] 11.4453
── A15101504 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15101504 --area 84.97

▶ 관악산휴먼시아 (A15101504) · 전용 84.97㎡ · 11620-10200 · 지번 후보 1102, 1735
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 1735 (1735-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15101504-84.json
   전유 84.97 + 주거공용 30.796 = 공급 115.77㎡ = 35.02평 → **35평**
   표본: 207동 1804 (같은 전용 호 166개) · 전용률 73.4%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 28.7047
     · 아파트 / 지하계단실 [각층 지3-지1] 2.0913
── A15101504 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15101504 --area 59.99

▶ 관악산휴먼시아 (A15101504) · 전용 59.99㎡ · 11620-10200 · 지번 후보 1102, 1735
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 1735 (1735-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15101504-59.json
   전유 59.99 + 주거공용 23.08 = 공급 83.07㎡ = 25.13평 → **25평**
   표본: 223동 103 (같은 전용 호 91개) · 전용률 72.2%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 21.6035
     · 아파트 / 지하계단실 [각층 지3-지1] 1.4765
── A15105303 전용 84.74

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15105303 --area 84.74

▶ 관악현대 (A15105303) · 전용 84.74㎡ · 11620-10100 · 지번 후보 1932-6, 1102, 481, 700-1, 818, 929, 1000
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 1000 (1000-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15105303-84.json
   전유 84.74 + 주거공용 10.63 = 공급 95.37㎡ = 28.85평 → **29평**
   표본: 122동 1404호 (같은 전용 호 61개) · 전용률 88.8%
     · 부대시설 / 복도,계단 [] 10.63
── A15105303 전용 58.59

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15105303 --area 58.59

▶ 관악현대 (A15105303) · 전용 58.59㎡ · 11620-10100 · 지번 후보 1932-6, 1102, 481, 700-1, 818, 929, 1000
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 1000 (1000-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15105303-59.json
   전유 58.59 + 주거공용 15.36 = 공급 73.95㎡ = 22.37평 → **22평**
   표본: 101동 703호 (같은 전용 호 97개) · 전용률 79.2%
     · 부대시설 / 복도,계단 [] 15.36
── A15105603 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15105603 --area 84.96

▶ 관악우성아파트 (A15105603) · 전용 84.96㎡ · 11620-10100 · 지번 후보 1102, 1706
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 1706 (1706-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15105603-84.json
   전유 84.96 + 주거공용 14.49 = 공급 99.45㎡ = 30.08평 → **30평**
   표본: 101동 1708호 (같은 전용 호 136개) · 전용률 85.4%
     · 아파트 / 계단실, 승강기 [각층] 13.414
     · 부대시설 / 중앙공급실 [지2,지1층] 1.076
── A15105603 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15105603 --area 59.76

▶ 관악우성아파트 (A15105603) · 전용 59.76㎡ · 11620-10100 · 지번 후보 1102, 1706
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 1706 (1706-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15105603-59.json
   전유 59.76 + 주거공용 23.222 = 공급 82.98㎡ = 25.1평 → **25평**
   표본: 107동 607호 (같은 전용 호 78개) · 전용률 72.0%
     · 아파트 / 계단실, 승강기 [각층] 22.465
     · 부대시설 / 중앙공급실 [지2,지1층] 0.757
── A15176202 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15176202 --area 84.87

▶ 성현동아 (A15176202) · 전용 84.87㎡ · 11620-10100 · 지번 후보 1703
   지번 1703 (1703-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15176202-84.json
   전유 84.87 + 주거공용 15.12 = 공급 99.99㎡ = 30.25평 → **30평**
   표본: 109동 2408호 (같은 전용 호 235개) · 전용률 84.9%
     · 아파트 / 코아,현관,복도 [] 15.12
── A15176202 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15176202 --area 59.76

▶ 성현동아 (A15176202) · 전용 59.76㎡ · 11620-10100 · 지번 후보 1703
   지번 1703 (1703-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15176202-59.json
   전유 59.76 + 주거공용 19.32 = 공급 79.08㎡ = 23.92평 → **24평**
   표본: 104동 1302호 (같은 전용 호 91개) · 전용률 75.6%
     · 아파트 / 코아,현관,복도 [] 19.32
── A15106901 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15106901 --area 59.92

▶ 봉천두산1,2단지 (A15106901) · 전용 59.92㎡ · 11620-10100 · 지번 후보 769, 10, 1331, 1708
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15106901-59.json
   전유 59.92 + 주거공용 16.93 = 공급 76.85㎡ = 23.25평 → **23평**
   표본: 두산아파트 201동 804호 (같은 전용 호 213개) · 전용률 78.0%
     · 아파트 / 계단,복도 [각층 각층] 16.93
── A15105302 전용 59.58

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15105302 --area 59.58

▶ 관악푸르지오아파트 (A15105302) · 전용 59.58㎡ · 11620-10100 · 지번 후보 1102, 1717
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 1717 (1717-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15105302-59.json
   전유 59.58 + 주거공용 18.89 = 공급 78.47㎡ = 23.74평 → **24평**
   표본: 104동 1403 (같은 전용 호 280개) · 전용률 75.9%
     · 아파트 / 계단실 [각층 각층] 18.89
── A15180705 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15180705 --area 84.96

▶ 관악드림타운 (A15180705) · 전용 84.96㎡ · 11620-10100 · 지번 후보 1102, 1712
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 1712 (1712-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15180705-84.json
   전유 84.96 + 주거공용 16.11 = 공급 101.07㎡ = 30.57평 → **31평**
   표본: 133동 2002 (같은 전용 호 214개) · 전용률 84.1%
     · 아파트 / 계단,복도 [각층 각층] 16.11
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
── A15603006 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15603006 --area 59.97

▶ 래미안상도3차 (A15603006) · 전용 59.97㎡ · 11590-10200 · 지번 후보 431
   지번 431 (0431-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15603006-59.json
   전유 59.97 + 주거공용 17.37 = 공급 77.34㎡ = 23.4평 → **23평**
   표본: 313동 1002 (같은 전용 호 31개) · 전용률 77.5%
     · 아파트 / 계단실,승강기,벽체 [각층 각층] 16.83
     · 부대시설 / 주민공동시설 [지하 지1층] 0.54
── A15685206 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15685206 --area 84.99

▶ 신대방우성1차 (A15685206) · 전용 84.99㎡ · 11590-10900 · 지번 후보 565
   지번 565 (0565-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15685206-84.json
   전유 84.99 + 주거공용 17.397 = 공급 102.39㎡ = 30.97평 → **31평**
   표본: 8동 1203호 (같은 전용 호 84개) · 전용률 83.0%
     · 부대시설 / 계단 및 승강기 [각층 각층] 12.07
     · 부대시설 / 지하실 [각층 각층] 4.884
     · 부대시설 / 경비실 [각층 각층] 0.443
── A15678103 전용 59.7754

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15678103 --area 59.7754

▶ 힐스테이트상도센트럴파크 (A15678103) · 전용 59.7754㎡ · 11590-10200 · 지번 후보 531
   지번 531 (0531-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15678103-59.json
   전유 59.775 + 주거공용 23.22 = 공급 83㎡ = 25.11평 → **25평**
   표본: 119동 502 (같은 전용 호 63개) · 전용률 72.0%
     · 아파트 / 벽체,계단,복도 [지상 각층] 23.2197
── A15603206 전용 84.995

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15603206 --area 84.995

▶ 상도더샵 (A15603206) · 전용 84.995㎡ · 11590-10200 · 지번 후보 521
   지번 521 (0521-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15603206-84.json
   전유 84.995 + 주거공용 23.045 = 공급 108.04㎡ = 32.68평 → **33평**
   표본: 114동 204호 (같은 전용 호 89개) · 전용률 78.7%
     · 아파트 / 계단실,승강기,벽체,전실 [각층 각층] 20.823
     · 아파트 / 지하층계단실(지3-지1) [각층 각층] 2.222
── A15603206 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15603206 --area 59.99

▶ 상도더샵 (A15603206) · 전용 59.99㎡ · 11590-10200 · 지번 후보 521
   지번 521 (0521-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15603206-59.json
   전유 59.99 + 주거공용 21.563 = 공급 81.55㎡ = 24.67평 → **25평**
   표본: 116동 202호 (같은 전용 호 113개) · 전용률 73.6%
     · 아파트 / 계단실,승강기,벽체,전실 [각층 각층] 19.995
     · 아파트 / 지하층계단실(지3-지1) [각층 각층] 1.568
── A15603006 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15603006 --area 84.96

▶ 래미안상도3차 (A15603006) · 전용 84.96㎡ · 11590-10200 · 지번 후보 431
   지번 431 (0431-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15603006-84.json
   전유 84.96 + 주거공용 22.23 = 공급 107.19㎡ = 32.42평 → **32평**
   표본: 327동 1408 (같은 전용 호 229개) · 전용률 79.3%
     · 아파트 / 계단실,승강기,벽체 [각층 각층] 21.49
     · 부대시설 / 주민공동시설 [지하 지1층] 0.74
── A15681502 전용 84.66

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15681502 --area 84.66

▶ 사당우성2단지 (A15681502) · 전용 84.66㎡ · 11590-10700 · 지번 후보 105
   지번 105 (0105-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15681502-84.json
   전유 84.66 + 주거공용 19.24 = 공급 103.9㎡ = 31.43평 → **31평**
   표본: 306동 1407호 (같은 전용 호 107개) · 전용률 81.5%
     · 아파트 / 복도,계단 [각층 각층] 19.24
── A15681502 전용 59.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15681502 --area 59.89

▶ 사당우성2단지 (A15681502) · 전용 59.89㎡ · 11590-10700 · 지번 후보 105
   지번 105 (0105-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15681502-59.json
   전유 59.89 + 주거공용 12.95 = 공급 72.84㎡ = 22.03평 → **22평**
   표본: 402동 503호 (같은 전용 호 83개) · 전용률 82.2%
     · 아파트 / 복도,계단 [각층 각층] 12.95
── A15609005 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15609005 --area 84.91

▶ 사당 대림아파트 (A15609005) · 전용 84.91㎡ · 11590-10700 · 지번 후보 501, 169-8
   지번 501 (0501-0000) · 대지 → 줄 0개
   지번 169-8 (0169-0008) · 대지 → 줄 2679개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15609005-84.json
   전유 84.91 + 주거공용 18.8 = 공급 103.71㎡ = 31.37평 → **31평**
   표본: 8동 4층403호 (같은 전용 호 570개) · 전용률 81.9%
     · 아파트 / [] 18.8
── A15609005 전용 59.67

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15609005 --area 59.67

▶ 사당 대림아파트 (A15609005) · 전용 59.67㎡ · 11590-10700 · 지번 후보 501, 169-8
   지번 501 (0501-0000) · 대지 → 줄 0개
   지번 169-8 (0169-0008) · 대지 → 줄 2679개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15609005-59.json
   전유 59.67 + 주거공용 21.26 = 공급 80.93㎡ = 24.48평 → **24평**
   표본: 1동 14층1409호 (같은 전용 호 162개) · 전용률 73.7%
     · 아파트 / [] 21.26
── A15681110 전용 59.84

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15681110 --area 59.84

▶ 대방대림 (A15681110) · 전용 59.84㎡ · 11590-10800 · 지번 후보 501
   지번 501 (0501-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15681110-59.json
   전유 59.84 + 주거공용 24.63 = 공급 84.47㎡ = 25.55평 → **26평**
   표본: 114동 1502호 (같은 전용 호 132개) · 전용률 70.8%
     · 부대시설 / 계단 [각층 각층] 21.02
     · 부대시설 / 지하실 [지하 지1층] 3.61
── A15605103 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15605103 --area 84.88

▶ 신동아리버파크 (A15605103) · 전용 84.88㎡ · 11590-10100 · 지번 후보 325
   지번 325 (0325-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15605103-84.json
   전유 84.88 + 주거공용 17.31 = 공급 102.19㎡ = 30.91평 → **31평**
   표본: 708동 706호 (같은 전용 호 263개) · 전용률 83.1%
     · 아파트 / 복도.계단 [각층 각층] 17.31
── A10024615 전용 84.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024615 --area 84.86

▶ 힐스테이트클래시안아파트 (A10024615) · 전용 84.86㎡ · 11560-13200 · 지번 후보 4969, 240-16
   지번 4969 (4969-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024615-84.json
   전유 84.86 + 주거공용 27.14 = 공급 112㎡ = 33.88평 → **34평**
   표본: 102동 1805 (같은 전용 호 92개) · 전용률 75.8%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 20.8601
     · 아파트 / 벽체 [지상 18층] 6.28
── A10025024 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025024 --area 84.98

▶ 신길센트럴자이 (A10025024) · 전용 84.98㎡ · 11560-13200 · 지번 후보 4964, 337-246
   지번 4964 (4964-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025024-84.json
   전유 84.98 + 주거공용 27.29 = 공급 112.27㎡ = 33.96평 → **34평**
   표본: 106동 404 (같은 전용 호 124개) · 전용률 75.7%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 21
     · 아파트 / 벽체 [지상 4층] 6.29
── A10024615 전용 59.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024615 --area 59.91

▶ 힐스테이트클래시안아파트 (A10024615) · 전용 59.91㎡ · 11560-13200 · 지번 후보 4969, 240-16
   지번 4969 (4969-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024615-59.json
   전유 59.91 + 주거공용 25.171 = 공급 85.08㎡ = 25.74평 → **26평**
   표본: 106동 1802 (같은 전용 호 149개) · 전용률 70.4%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 19.7212
     · 아파트 / 벽체 [지상 18층] 5.45
── A15089421 전용 60.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15089421 --area 60.96

▶ 여의도시범아파트 (A15089421) · 전용 60.96㎡ · 11560-11000 · 지번 후보 50
   지번 50 (0050-0000) · 대지 → 줄 1839개
::error::전용 60.96㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 50) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15089421 --area 60.96`
Exit status 1
── A15081107 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15081107 --area 84.96

▶ 대림현대3차 (A15081107) · 전용 84.96㎡ · 11560-13300 · 지번 후보 1932-6, 481, 700-1, 818, 929, 608-1
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 608-1 (0608-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15081107-84.json
   전유 84.89 + 주거공용 20.75 = 공급 105.64㎡ = 31.96평 → **32평**
   표본: 304동 1506호 (같은 전용 호 99개) · 전용률 80.4%
     · 부대시설 / 복도,계단 [각층] 20.75
── A10026816 전용 84.65

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026816 --area 84.65

▶ 아크로타워스퀘어 (A10026816) · 전용 84.65㎡ · 11560-10800 · 지번 후보 203, 145-8
   지번 203 (0203-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026816-84.json
   전유 84.65 + 주거공용 30.87 = 공급 115.52㎡ = 34.94평 → **35평**
   표본: 104동 502 (같은 전용 호 192개) · 전용률 73.3%
     · 아파트 / 벽체,코어 [각층 각층] 30.87
── A10026816 전용 59.7

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026816 --area 59.7

▶ 아크로타워스퀘어 (A10026816) · 전용 59.7㎡ · 11560-10800 · 지번 후보 203, 145-8
   지번 203 (0203-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026816-59.json
   전유 59.7 + 주거공용 22.72 = 공급 82.42㎡ = 24.93평 → **25평**
   표본: 106동 2302 (같은 전용 호 81개) · 전용률 72.4%
     · 아파트 / 벽체,코어 [각층 각층] 22.72
── A15003002 전용 84.908

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15003002 --area 84.908

▶ 영등포푸르지오 (A15003002) · 전용 84.908㎡ · 11560-10100 · 지번 후보 647
   지번 647 (0647-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15003002-84.json
   전유 84.908 + 주거공용 23.633 = 공급 108.54㎡ = 32.83평 → **33평**
   표본: 111동 1802호 (같은 전용 호 96개) · 전용률 78.2%
     · 아파트 / 계단실,엘리베이터 [각층] 23.633
── A15003002 전용 59.912

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15003002 --area 59.912

▶ 영등포푸르지오 (A15003002) · 전용 59.912㎡ · 11560-10100 · 지번 후보 647
   지번 647 (0647-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15003002-59.json
   전유 59.912 + 주거공용 20.179 = 공급 80.09㎡ = 24.23평 → **24평**
   표본: 214동 2303호 (같은 전용 호 69개) · 전용률 74.8%
     · 아파트 / 계단실,엘리베이터 [각층] 20.179
── A15010502 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15010502 --area 84.87

▶ 양평한신 (A15010502) · 전용 84.87㎡ · 11560-12900 · 지번 후보 76
   지번 76 (0076-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15010502-84.json
   전유 84.87 + 주거공용 16.34 = 공급 101.21㎡ = 30.62평 → **31평**
   표본: 110동 202호 (같은 전용 호 163개) · 전용률 83.9%
     · 연립주택 / 계단실 [각층] 16.34
── A15010502 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15010502 --area 59.94

▶ 양평한신 (A15010502) · 전용 59.94㎡ · 11560-12900 · 지번 후보 76
   지번 76 (0076-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15010502-59.json
   전유 59.94 + 주거공용 17.85 = 공급 77.79㎡ = 23.53평 → **24평**
   표본: 106동 807호 (같은 전용 호 206개) · 전용률 77.0%
     · 연립주택 / 계단실 [각층] 17.85
── A10027073 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027073 --area 84.97

▶ 래미안에스티움 (A10027073) · 전용 84.97㎡ · 11560-13200 · 지번 후보 4950
   지번 4950 (4950-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027073-84.json
   전유 84.97 + 주거공용 29.46 = 공급 114.43㎡ = 34.62평 → **35평**
   표본: 108동 1403 (같은 전용 호 176개) · 전용률 74.3%
     · 아파트 / 계단실,복도 [각층 각층] 22.42
     · 아파트 / 벽체 [지상 14층] 7.04
── A10027073 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027073 --area 59.95

▶ 래미안에스티움 (A10027073) · 전용 59.95㎡ · 11560-13200 · 지번 후보 4950
   지번 4950 (4950-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027073-59.json
   전유 59.95 + 주거공용 22.39 = 공급 82.34㎡ = 24.91평 → **25평**
   표본: 104동 1502 (같은 전용 호 111개) · 전용률 72.8%
     · 아파트 / 계단실,복도 [각층 각층] 17.16
     · 아파트 / 벽체 [지상 15층] 5.23
── A15083404 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15083404 --area 84.98

▶ 문래자이아파트 (A15083404) · 전용 84.98㎡ · 11560-12100 · 지번 후보 54
   지번 54 (0054-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15083404-84.json
   전유 84.98 + 주거공용 24.1 = 공급 109.08㎡ = 33평 → **33평**
   표본: 111동 102호 (같은 전용 호 178개) · 전용률 77.9%
     · 아파트 / 계단실,엘리베이터,외벽 [각층] 24.05
     · 아파트 / 문고 [지상 1층] 0.05
── A15081107 전용 59.83

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15081107 --area 59.83

▶ 대림현대3차 (A15081107) · 전용 59.83㎡ · 11560-13300 · 지번 후보 1932-6, 481, 700-1, 818, 929, 608-1
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 608-1 (0608-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15081107-59.json
   전유 59.83 + 주거공용 14.62 = 공급 74.45㎡ = 22.52평 → **23평**
   표본: 301동 1104호 (같은 전용 호 68개) · 전용률 80.4%
     · 부대시설 / 복도,계단 [각층] 14.62
── A15004507 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15004507 --area 84.94

▶ 당산삼성래미안 (A15004507) · 전용 84.94㎡ · 11560-11500 · 지번 후보 42
   지번 42 (0042-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15004507-84.json
   전유 84.94 + 주거공용 25.05 = 공급 109.99㎡ = 33.27평 → **33평**
   표본: 404동 2002 (같은 전용 호 51개) · 전용률 77.2%
     · 아파트 / 계단실,승강기 [각층 각층] 25.05
── A10025946 전용 84.408

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025946 --area 84.408

▶ 금천롯데캐슬골드파크3차아파트 (A10025946) · 전용 84.408㎡ · 11545-10200 · 지번 후보 1155
   지번 1155 (1155-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025946-84.json
   전유 84.408 + 주거공용 34.47 = 공급 118.88㎡ = 35.96평 → **36평**
   표본: 305동 1105 (같은 전용 호 106개) · 전용률 71.0%
     · 아파트 / 코아 [지상 각층] 28.0613
     · 아파트 / 벽체 [지상 11층] 6.4091
── A15303002 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15303002 --area 84.99

▶ 관악산벽산타운1단지 (A15303002) · 전용 84.99㎡ · 11545-10300 · 지번 후보 1102, 271-3, 1010
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 1010 (1010-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15303002-84.json
   전유 84.99 + 주거공용 11.878 = 공급 96.87㎡ = 29.3평 → **29평**
   표본: 110동 1805호 (같은 전용 호 94개) · 전용률 87.7%
     · 아파트 / 계단실,엘리베이터 [각층] 11.878
── A15303002 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15303002 --area 59.94

▶ 관악산벽산타운1단지 (A15303002) · 전용 59.94㎡ · 11545-10300 · 지번 후보 1102, 271-3, 1010
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 1010 (1010-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15303002-59.json
   전유 59.94 + 주거공용 20.398 = 공급 80.34㎡ = 24.3평 → **24평**
   표본: 116동 608호 (같은 전용 호 60개) · 전용률 74.6%
     · 아파트 / 계단실,엘리베이터,복도 [각층] 20.398
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
── A15303205 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15303205 --area 84.97

▶ 관악벽산타운5단지 (A15303205) · 전용 84.97㎡ · 11545-10300 · 지번 후보 1102, 271-3, 1013
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 1013 (1013-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15303205-84.json
   전유 84.97 + 주거공용 14.705 = 공급 99.67㎡ = 30.15평 → **30평**
   표본: 506동 2001 (같은 전용 호 201개) · 전용률 85.3%
     · 아파트 / 벽체,계단실,ELEV [각층 각층] 14.705
── A15303205 전용 59.34

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15303205 --area 59.34

▶ 관악벽산타운5단지 (A15303205) · 전용 59.34㎡ · 11545-10300 · 지번 후보 1102, 271-3, 1013
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 1013 (1013-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15303205-59.json
   전유 59.34 + 주거공용 17.392 = 공급 76.73㎡ = 23.21평 → **23평**
   표본: 521동 104 (같은 전용 호 111개) · 전용률 77.3%
     · 아파트 / 벽체,계단실,ELEV [각층 각층] 17.392
── A10027188 전용 84.4214

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027188 --area 84.4214

▶ 금천롯데캐슬골드파크1차아파트 (A10027188) · 전용 84.4214㎡ · 11545-10200 · 지번 후보 1147
   지번 1147 (1147-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027188-84.json
   전유 84.421 + 주거공용 31.903 = 공급 116.32㎡ = 35.19평 → **35평**
   표본: 109동 802 (같은 전용 호 204개) · 전용률 72.6%
     · 아파트 / 벽체,계단실 [지상 각층] 31.9034
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
── A15205405 전용 83.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15205405 --area 83.39

▶ 구로두산 (A15205405) · 전용 83.39㎡ · 11530-10200 · 지번 후보 769, 10, 1331, 1708, 1265
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 1265 (1265-0000) · 대지 → 줄 3000개
::error::전용 83.39㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 1265) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15205405 --area 83.39`
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
── A15213007 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15213007 --area 84.95

▶ 천왕연지타운2단지 (A15213007) · 전용 84.95㎡ · 11530-11100 · 지번 후보 281
   지번 281 (0281-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15213007-84.json
   전유 84.95 + 주거공용 28.44 = 공급 113.39㎡ = 34.3평 → **34평**
   표본: 210동 13 (같은 전용 호 87개) · 전용률 74.9%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 21.58
     · 아파트 / 벽체 [지상 1층] 6.86
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
── A15205405 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15205405 --area 84.9

▶ 구로두산 (A15205405) · 전용 84.9㎡ · 11530-10200 · 지번 후보 769, 10, 1331, 1708, 1265
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 1265 (1265-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15205405-84.json
   전유 84.9 + 주거공용 14.02 = 공급 98.92㎡ = 29.92평 → **30평**
   표본: 105동 205호 (같은 전용 호 32개) · 전용률 85.8%
     · 아파트 / 계단,승강기 [1∼19층] 14.02
⏳ 시간 예산(1200초)에 닿아 286줄은 다음 칸으로 미룹니다
```
