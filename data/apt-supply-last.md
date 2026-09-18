# 단지 공급면적 — 마지막 실행

- 성공 37건 · 실패 152건 · 미룸 8줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 186/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
-0000) · 대지 → 줄 0개
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
   지번 1145 (1145-0000) · 대지 → 줄 200개
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
── A13984814 전용 84.815

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 84.815

▶ 월계주공2단지 (A13984814) · 전용 84.815㎡ · 11350-10200 · 지번 후보 556
   지번 556 (0556-0000) · 대지 → 줄 3000개
::error::전용 84.815㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 556) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 84.815`
Exit status 1
── A13986306 전용 59.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13986306 --area 59.22

▶ 중계그린 (A13986306) · 전용 59.22㎡ · 11350-10600 · 지번 후보 502-1
   지번 502-1 (0502-0001) · 대지 → 줄 600개
::error::전용 59.22㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 502-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13986306 --area 59.22`
Exit status 1
── A13984814 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 59.97

▶ 월계주공2단지 (A13984814) · 전용 59.97㎡ · 11350-10200 · 지번 후보 556
   지번 556 (0556-0000) · 대지 → 줄 3000개
::error::전용 59.97㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 556) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 59.97`
Exit status 1
── A13920706 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 84.2

▶ 상계주공4단지 (A13920706) · 전용 84.2㎡ · 11350-10500 · 지번 후보 749-5
   지번 749-5 (0749-0005) · 대지 → 줄 0개
::error::지번 후보 749-5 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
── A13982301 전용 59.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13982301 --area 59.2

▶ 상계주공11단지 (A13982301) · 전용 59.2㎡ · 11350-10500 · 지번 후보 663-1, 652
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 652 (0652-0000) · 대지 → 줄 2200개
::error::전용 59.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 652) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13982301 --area 59.2`
Exit status 1
── A13204105 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 84.41

▶ 창동주공3단지 (A13204105) · 전용 84.41㎡ · 11320-10700 · 지번 후보 347
   지번 347 (0347-0000) · 대지 → 줄 200개
::error::전용 84.41㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 347) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 84.41`
Exit status 1
── A13290107 전용 60.5

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 60.5

▶ 창동주공19단지 (A13290107) · 전용 60.5㎡ · 11320-10700 · 지번 후보 663-1, 27
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 27 (0027-0000) · 대지 → 줄 2342개
::error::전용 60.5㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 27) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 60.5`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 643, 271-1
   지번 643 (0643-0000) · 대지 → 줄 29개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 643) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A14207203 전용 57.46

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14207203 --area 57.46

▶ 수유벽산 (A14207203) · 전용 57.46㎡ · 11305-10300 · 지번 후보 271-3, 205
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 205 (0205-0000) · 대지 → 줄 1200개
::error::전용 57.46㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 205) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A14207203 --area 57.46`
Exit status 1
── A10027189 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027189 --area 84.96

▶ 보문파크뷰자이아파트 (A10027189) · 전용 84.96㎡ · 11290-12800 · 지번 후보 198-45
   지번 198-45 (0198-0045) · 대지 → 줄 0개
::error::지번 후보 198-45 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027189 --area 84.96`
Exit status 1
── A10027189 전용 59.19

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027189 --area 59.19

▶ 보문파크뷰자이아파트 (A10027189) · 전용 59.19㎡ · 11290-12800 · 지번 후보 198-45
   지번 198-45 (0198-0045) · 대지 → 줄 0개
::error::지번 후보 198-45 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027189 --area 59.19`
Exit status 1
── A13186708 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13186708 --area 84.98

▶ 신내동성1,2차 (A13186708) · 전용 84.98㎡ · 11260-10600 · 지번 후보 13, 397
   지번 13 (0013-0000) · 대지 → 줄 0개
   지번 397 (0397-0000) · 대지 → 줄 2400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13186708-84.json
   전유 84.98 + 주거공용 11.5 = 공급 96.48㎡ = 29.19평 → **29평**
   표본: 3동 107 (같은 전용 호 69개) · 전용률 88.1%
     · 아파트 / 복도계단 [지상 1층] 11.5
── A10023188 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023188 --area 84.96

▶ 청량리역 한양수자인 그라시엘 (A10023188) · 전용 84.96㎡ · 11230-10200 · 지번 후보 39-1
   지번 39-1 (0039-0001) · 대지 → 줄 0개
::error::지번 후보 39-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023188 --area 84.96`
Exit status 1
── A10023633 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023633 --area 59.92

▶ 래미안 엘리니티 (A10023633) · 전용 59.92㎡ · 11230-10200 · 지번 후보 753-9
   지번 753-9 (0753-0009) · 대지 → 줄 0개
::error::지번 후보 753-9 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023633 --area 59.92`
Exit status 1
── A10023633 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023633 --area 84.98

▶ 래미안 엘리니티 (A10023633) · 전용 84.98㎡ · 11230-10200 · 지번 후보 753-9
   지번 753-9 (0753-0009) · 대지 → 줄 0개
::error::지번 후보 753-9 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023633 --area 84.98`
Exit status 1
── A10026232 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026232 --area 84.99

▶ 래미안미드카운티 (A10026232) · 전용 84.99㎡ · 11230-10500 · 지번 후보 98-4
   지번 98-4 (0098-0004) · 대지 → 줄 0개
::error::지번 후보 98-4 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026232 --area 84.99`
Exit status 1
── A13084804 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13084804 --area 84.95

▶ 전농SK (A13084804) · 전용 84.95㎡ · 11230-10400 · 지번 후보 10
   지번 10 (0010-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13084804-84.json
   전유 84.95 + 주거공용 16.293 = 공급 101.24㎡ = 30.63평 → **31평**
   표본: 111동 1605호 (같은 전용 호 181개) · 전용률 83.9%
     · 아파트 / 계단,복도,승강기 [각층] 16.293
── A13010006 전용 59.54

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13010006 --area 59.54

▶ 장안현대홈타운 (A13010006) · 전용 59.54㎡ · 11230-10600 · 지번 후보 1932-6, 481, 700-1, 818, 929, 336
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 336 (0336-0000) · 대지 → 줄 1400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13010006-59.json
   전유 59.54 + 주거공용 17.084 = 공급 76.62㎡ = 23.18평 → **23평**
   표본: 제102동 405 (같은 전용 호 15개) · 전용률 77.7%
     · 아파트 / 계단실 [각층 각층] 17.084
── A13010005 전용 84.774

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13010005 --area 84.774

▶ 래미안장안2차 (A13010005) · 전용 84.774㎡ · 11230-10600 · 지번 후보 354-2, 329-3
   지번 354-2 (0354-0002) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13010005-84.json
   전유 84.774 + 주거공용 25.466 = 공급 110.24㎡ = 33.35평 → **33평**
   표본: 105동 803 (같은 전용 호 28개) · 전용률 76.9%
     · 아파트 / 계단실,승강기 [각층 각층] 20.346
     · 아파트 / 벽체 [각층 각층] 5.12
── A13010005 전용 59.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13010005 --area 59.86

▶ 래미안장안2차 (A13010005) · 전용 59.86㎡ · 11230-10600 · 지번 후보 354-2, 329-3
   지번 354-2 (0354-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13010005-59.json
   전유 59.86 + 주거공용 24.942 = 공급 84.8㎡ = 25.65평 → **26평**
   표본: 106동 1402 (같은 전용 호 64개) · 전용률 70.6%
     · 아파트 / 계단실,승강기 [각층 각층] 20.513
     · 아파트 / 벽체 [각층 각층] 4.429
── A13082805 전용 84.972

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13082805 --area 84.972

▶ 이문e-편한세상 (A13082805) · 전용 84.972㎡ · 11230-11000 · 지번 후보 225
   지번 225 (0225-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13082805-84.json
   전유 84.972 + 주거공용 22.573 = 공급 107.54㎡ = 32.53평 → **33평**
   표본: 101동 104 (같은 전용 호 92개) · 전용률 79.0%
     · 아파트 / 벽체,계단실,승강기홀 [각층 각층] 22.573
── A13082805 전용 59.958

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13082805 --area 59.958

▶ 이문e-편한세상 (A13082805) · 전용 59.958㎡ · 11230-11000 · 지번 후보 225
   지번 225 (0225-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13082805-59.json
   전유 59.958 + 주거공용 20.345 = 공급 80.3㎡ = 24.29평 → **24평**
   표본: 103동 1204 (같은 전용 호 97개) · 전용률 74.7%
     · 아파트 / 벽체,계단실,승강기홀 [각층 각층] 20.345
── A13003007 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13003007 --area 84.99

▶ 래미안위브 (A13003007) · 전용 84.99㎡ · 11230-10500 · 지번 후보 1003
   지번 1003 (1003-0000) · 대지 → 줄 1600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13003007-84.json
   전유 84.99 + 주거공용 26.48 = 공급 111.47㎡ = 33.72평 → **34평**
   표본: 204동 1805 (같은 전용 호 122개) · 전용률 76.2%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 26.48
── A13003007 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13003007 --area 59.99

▶ 래미안위브 (A13003007) · 전용 59.99㎡ · 11230-10500 · 지번 후보 1003
   지번 1003 (1003-0000) · 대지 → 줄 0개
::error::지번 후보 1003 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13003007 --area 59.99`
Exit status 1
── A10026232 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026232 --area 59.98

▶ 래미안미드카운티 (A10026232) · 전용 59.98㎡ · 11230-10500 · 지번 후보 98-4
   지번 98-4 (0098-0004) · 대지 → 줄 0개
::error::지번 후보 98-4 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026232 --area 59.98`
Exit status 1
── A13003202 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13003202 --area 84.94

▶ 답십리청솔우성 (A13003202) · 전용 84.94㎡ · 11230-10500 · 지번 후보 80
   지번 80 (0080-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13003202-84.json
   전유 84.94 + 주거공용 15.352 = 공급 100.29㎡ = 30.34평 → **30평**
   표본: 105동 1202호 (같은 전용 호 88개) · 전용률 84.7%
     · 아파트 / 현관,계단실 [각층] 15.352
── A13003202 전용 59.74

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13003202 --area 59.74

▶ 답십리청솔우성 (A13003202) · 전용 59.74㎡ · 11230-10500 · 지번 후보 80
   지번 80 (0080-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13003202-59.json
   전유 59.74 + 주거공용 12.942 = 공급 72.68㎡ = 21.99평 → **22평**
   표본: 109동 2003호 (같은 전용 호 79개) · 전용률 82.2%
     · 아파트 / 현관,계단실 [각층] 12.942
── A14320304 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14320304 --area 84.99

▶ 구의현대프라임 (A14320304) · 전용 84.99㎡ · 11215-10300 · 지번 후보 1932-6, 481, 631-1, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 631-1 (0631-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14320304-84.json
   전유 84.99 + 주거공용 15.42 = 공급 100.41㎡ = 30.37평 → **30평**
   표본: 2동 603호 (같은 전용 호 131개) · 전용률 84.6%
     · 아파트 / 계단,현관,엘리베이터 [지상 6층] 15.42
── A14383205 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14383205 --area 84.91

▶ 구의현대2단지 (A14383205) · 전용 84.91㎡ · 11215-10300 · 지번 후보 1932-6, 481, 700-1, 818, 929, 611
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 611 (0611-0000) · 대지 → 줄 2600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14383205-84.json
   전유 84.91 + 주거공용 15.53 = 공급 100.44㎡ = 30.38평 → **30평**
   표본: 206동 906호 (같은 전용 호 411개) · 전용률 84.5%
     · 부대시설 / 복도,계단 [] 15.53
── A14381516 전용 84.81

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14381516 --area 84.81

▶ 광장현대파크빌 (A14381516) · 전용 84.81㎡ · 11215-10400 · 지번 후보 1932-6, 481, 700-1, 818, 929, 577
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 577 (0577-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14381516-84.json
   전유 84.81 + 주거공용 15.01 = 공급 99.82㎡ = 30.2평 → **30평**
   표본: 1013동 603호 (같은 전용 호 251개) · 전용률 85.0%
     · 부대시설 / 계단실 [각층] 15.01
── A14381516 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14381516 --area 59.76

▶ 광장현대파크빌 (A14381516) · 전용 59.76㎡ · 11215-10400 · 지번 후보 1932-6, 481, 700-1, 818, 929, 577
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 577 (0577-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14381516-59.json
   전유 59.76 + 주거공용 15.57 = 공급 75.33㎡ = 22.79평 → **23평**
   표본: 1004동 702호 (같은 전용 호 122개) · 전용률 79.3%
     · 부대시설 / 계단실 [각층] 15.57
── A14381415 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14381415 --area 84.97

▶ 광장현대3단지아파트 (A14381415) · 전용 84.97㎡ · 11215-10400 · 지번 후보 1932-6, 481, 700-1, 818, 929, 484
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 484 (0484-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14381415-84.json
   전유 84.97 + 주거공용 15.32 = 공급 100.29㎡ = 30.34평 → **30평**
   표본: 305동 1602호 (같은 전용 호 183개) · 전용률 84.7%
     · 아파트 / 복도,계단 [] 15.14
     · 아파트 / 현관 [] 0.18
── A14381415 전용 59.67

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14381415 --area 59.67

▶ 광장현대3단지아파트 (A14381415) · 전용 59.67㎡ · 11215-10400 · 지번 후보 1932-6, 481, 700-1, 818, 929, 484
::error::1932-6 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A14381415 --area 59.67`
Exit status 1
── A10026207 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026207 --area 59.97

▶ 서울숲리버뷰자이아파트 (A10026207) · 전용 59.97㎡ · 11200-10700 · 지번 후보 380
   지번 380 (0380-0000) · 대지 → 줄 900개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026207-59.json
   전유 59.97 + 주거공용 24.933 = 공급 84.9㎡ = 25.68평 → **26평**
   표본: 106동 705 (같은 전용 호 30개) · 전용률 70.6%
     · 아파트 / 계단실,승강기 [각층 각층] 19.563
     · 아파트 / 벽체 [지상 7층] 5.37
── A13377703 전용 84.71

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13377703 --area 84.71

▶ 행당한진타운 (A13377703) · 전용 84.71㎡ · 11200-10700 · 지번 후보 478, 346
   지번 478 (0478-0000) · 대지 → 줄 0개
   지번 346 (0346-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13377703-84.json
   전유 84.71 + 주거공용 15.1 = 공급 99.81㎡ = 30.19평 → **30평**
   표본: 111동 1201호 (같은 전용 호 156개) · 전용률 84.9%
     · 아파트 / 계단실,엘리베이터 [각층] 15.1
── A13377703 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13377703 --area 59.96

▶ 행당한진타운 (A13377703) · 전용 59.96㎡ · 11200-10700 · 지번 후보 478, 346
   지번 478 (0478-0000) · 대지 → 줄 0개
   지번 346 (0346-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13377703-59.json
   전유 59.96 + 주거공용 20.87 = 공급 80.83㎡ = 24.45평 → **24평**
   표본: 107동 805호 (같은 전용 호 137개) · 전용률 74.2%
     · 아파트 / 계단실,엘리베이터 [각층] 20.87
── A13386702 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13386702 --area 84.95

▶ 서울숲한신더휴아파트 (A13386702) · 전용 84.95㎡ · 11200-10700 · 지번 후보 349
   지번 349 (0349-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13386702-84.json
   전유 84.95 + 주거공용 15.26 = 공급 100.21㎡ = 30.31평 → **30평**
   표본: 102동 1404호 (같은 전용 호 200개) · 전용률 84.8%
     · 아파트 / 계단실,승강기 [각층 각층] 15.26
── A13386702 전용 59.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13386702 --area 59.91

▶ 서울숲한신더휴아파트 (A13386702) · 전용 59.91㎡ · 11200-10700 · 지번 후보 349
   지번 349 (0349-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13386702-59.json
   전유 59.94 + 주거공용 15.16 = 공급 75.1㎡ = 22.72평 → **23평**
   표본: 103동 1002호 (같은 전용 호 3개) · 전용률 79.8%
     · 아파트 / 계단실,승강기 [각층 각층] 15.16
── A10027920 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027920 --area 59.88

▶ 텐즈힐1단지 (A10027920) · 전용 59.88㎡ · 11200-10200 · 지번 후보 1066
   지번 1066 (1066-0000) · 대지 → 줄 0개
::error::1066 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027920 --area 59.88`
Exit status 1
── A13376906 전용 84.42

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13376906 --area 84.42

▶ 응봉대림강변 (A13376906) · 전용 84.42㎡ · 11200-10800 · 지번 후보 15
   지번 15 (0015-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13376906-84.json
   전유 84.42 + 주거공용 14.974 = 공급 99.39㎡ = 30.07평 → **30평**
   표본: 109동 2004호 (같은 전용 호 146개) · 전용률 84.9%
     · 아파트 / 계단실,엘리베이터 [각층 각층] 14.974
── A13376906 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13376906 --area 59.76

▶ 응봉대림강변 (A13376906) · 전용 59.76㎡ · 11200-10800 · 지번 후보 15
   지번 15 (0015-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13376906-59.json
   전유 59.76 + 주거공용 14.123 = 공급 73.88㎡ = 22.35평 → **22평**
   표본: 111동 1504호 (같은 전용 호 157개) · 전용률 80.9%
     · 아파트 / 계단실,엘리베이터 [각층 각층] 14.123
── A10026748 전용 84.3

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026748 --area 84.3

▶ 옥수파크힐스아파트 (A10026748) · 전용 84.3㎡ · 11200-11300 · 지번 후보 528
   지번 528 (0528-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026748-84.json
   전유 84.3 + 주거공용 24.84 = 공급 109.14㎡ = 33.01평 → **33평**
   표본: 110동 404 (같은 전용 호 219개) · 전용률 77.2%
     · 아파트 / 계단실,승강기 [각층 각층] 18.84
     · 아파트 / 벽체 [지상 4층] 6
── A10026748 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026748 --area 59.88

▶ 옥수파크힐스아파트 (A10026748) · 전용 59.88㎡ · 11200-11300 · 지번 후보 528
   지번 528 (0528-0000) · 대지 → 줄 2900개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026748-59.json
   전유 59.88 + 주거공용 23.75 = 공급 83.63㎡ = 25.3평 → **25평**
   표본: 106동 1203 (같은 전용 호 185개) · 전용률 71.6%
     · 아파트 / 계단실,승강기 [각층 각층] 18.2
     · 아파트 / 벽체 [지상 12층] 5.55
── A13375902 전용 84.822

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13375902 --area 84.822

▶ 옥수삼성 (A13375902) · 전용 84.822㎡ · 11200-11300 · 지번 후보 250
   지번 250 (0250-0000) · 대지 → 줄 0개
::error::지번 후보 250 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13375902 --area 84.822`
Exit status 1
── A13375902 전용 59.7

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13375902 --area 59.7

▶ 옥수삼성 (A13375902) · 전용 59.7㎡ · 11200-11300 · 지번 후보 250
   지번 250 (0250-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13375902-59.json
   전유 59.7 + 주거공용 19.398 = 공급 79.1㎡ = 23.93평 → **24평**
   표본: 101동 1401 (같은 전용 호 159개) · 전용률 75.5%
     · 아파트 / 복도/계단 [각층 각층] 19.398
── A13375907 전용 84.81

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13375907 --area 84.81

▶ 래미안옥수리버젠 (A13375907) · 전용 84.81㎡ · 11200-11300 · 지번 후보 561
   지번 561 (0561-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13375907-84.json
   전유 84.81 + 주거공용 26.39 = 공급 111.2㎡ = 33.64평 → **34평**
   표본: 114동 1302 (같은 전용 호 5개) · 전용률 76.3%
     · 아파트 / 계단실 [각층 각층] 20.91
     · 아파트 / 벽체 [각층 각층] 5.48
── A13375907 전용 59.25

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13375907 --area 59.25

▶ 래미안옥수리버젠 (A13375907) · 전용 59.25㎡ · 11200-11300 · 지번 후보 561
   지번 561 (0561-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13375907-59.json
   전유 59.25 + 주거공용 20.18 = 공급 79.43㎡ = 24.03평 → **24평**
   표본: 102동 206 (같은 전용 호 177개) · 전용률 74.6%
     · 아파트 / 계단실 [각층 각층] 14.61
     · 아파트 / 벽체 [각층 각층] 5.57
── A13381608 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13381608 --area 84.91

▶ 청계현대아파트 (A13381608) · 전용 84.91㎡ · 11200-10500 · 지번 후보 1932-6, 481, 700-1, 818, 929
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 2900개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13381608-84.json
   전유 84.91 + 주거공용 15.96 = 공급 100.87㎡ = 30.51평 → **31평**
   표본: 107동 803호 (같은 전용 호 146개) · 전용률 84.2%
     · 아파트 / 계단실 승강기 [각층] 15.96
── A13309404 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13309404 --area 84.96

▶ 금호대우 (A13309404) · 전용 84.96㎡ · 11200-11200 · 지번 후보 800
   지번 800 (0800-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13309404-84.json
   전유 84.96 + 주거공용 18.752 = 공급 103.71㎡ = 31.37평 → **31평**
   표본: 109동 1201호 (같은 전용 호 4개) · 전용률 81.9%
     · 아파트 / 계단실,엘리베이터 [각층] 18.752
── A13309404 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13309404 --area 59.97

▶ 금호대우 (A13309404) · 전용 59.97㎡ · 11200-11200 · 지번 후보 800
   지번 800 (0800-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13309404-59.json
   전유 59.97 + 주거공용 14.955 = 공급 74.92㎡ = 22.66평 → **23평**
   표본: 111동 1104호 (같은 전용 호 122개) · 전용률 80.0%
     · 아파트 / 계단실,엘리베이터 [각층] 14.955
── A13380703 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13380703 --area 59.97

▶ 금호두산 (A13380703) · 전용 59.97㎡ · 11200-11100 · 지번 후보 769, 10, 1331, 1708
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13380703-59.json
   전유 59.97 + 주거공용 17.94 = 공급 77.91㎡ = 23.57평 → **24평**
   표본: 112동 703호 (같은 전용 호 9개) · 전용률 77.0%
     · 아파트 / 복도 [각층 각층] 10.35
     · 아파트 / 계단,엘리베이터 [각층 각층] 6.38
     · 아파트 / 중앙공급실 [지하 지1층] 1
     · 아파트 / 노인정,관리실 [1,2층] 0.19
     · 아파트 / 공중변소 [지상 1층] 0.02
── A10027602 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027602 --area 84.98

▶ 신금호파크자이아파트 (A10027602) · 전용 84.98㎡ · 11200-11000 · 지번 후보 1
   지번 1 (0001-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027602-84.json
   전유 84.98 + 주거공용 24.12 = 공급 109.1㎡ = 33평 → **33평**
   표본: 102동 805 (같은 전용 호 2개) · 전용률 77.9%
     · 아파트 / 벽체,계단실 [각층 각층] 24.12
── A10027602 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027602 --area 59.98

▶ 신금호파크자이아파트 (A10027602) · 전용 59.98㎡ · 11200-11000 · 지번 후보 1
   지번 1 (0001-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027602-59.json
   전유 59.98 + 주거공용 21.22 = 공급 81.2㎡ = 24.56평 → **25평**
   표본: 106동 1501 (같은 전용 호 13개) · 전용률 73.9%
     · 아파트 / 벽체,계단실 [각층 각층] 21.22
── A13380104 전용 84.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13380104 --area 84.82

▶ 금호벽산 (A13380104) · 전용 84.82㎡ · 11200-10900 · 지번 후보 271-3, 633
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 633 (0633-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13380104-84.json
   전유 84.82 + 주거공용 15.342 = 공급 100.16㎡ = 30.3평 → **30평**
   표본: 101동 903호 (같은 전용 호 135개) · 전용률 84.7%
     · 아파트 / 계단실,엘리베이터,복도 [각층 각층] 15.342
── A13380104 전용 59.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13380104 --area 59.9

▶ 금호벽산 (A13380104) · 전용 59.9㎡ · 11200-10900 · 지번 후보 271-3, 633
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 633 (0633-0000) · 대지 → 줄 1600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13380104-59.json
   전유 59.9 + 주거공용 20.596 = 공급 80.5㎡ = 24.35평 → **24평**
   표본: 203동 1901호 (같은 전용 호 66개) · 전용률 74.4%
     · 아파트 / 계단실,엘리베이터,복도 [각층 각층] 20.596
── A14072701 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14072701 --area 84.96

▶ 한가람아파트 (A14072701) · 전용 84.96㎡ · 11170-12900 · 지번 후보 404
   지번 404 (0404-0000) · 대지 → 줄 0개
::error::지번 후보 404 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A14072701 --area 84.96`
Exit status 1
── A14072701 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14072701 --area 59.88

▶ 한가람아파트 (A14072701) · 전용 59.88㎡ · 11170-12900 · 지번 후보 404
   지번 404 (0404-0000) · 대지 → 줄 2079개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14072701-59.json
   전유 59.88 + 주거공용 19.179 = 공급 79.06㎡ = 23.92평 → **24평**
   표본: 202동 1106호 (같은 전용 호 128개) · 전용률 75.7%
     · 아파트 / 계단,승강기 [각층 각층] 19.179
── A14003106 전용 84.905

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14003106 --area 84.905

▶ 이촌강촌아파트 (A14003106) · 전용 84.905㎡ · 11170-12900 · 지번 후보 402
   지번 402 (0402-0000) · 대지 → 줄 1600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14003106-84.json
   전유 84.905 + 주거공용 16.796 = 공급 101.7㎡ = 30.76평 → **31평**
   표본: 102동 1103호 (같은 전용 호 73개) · 전용률 83.5%
     · 아파트 / 계단,복도,승강기 [각층 각층] 16.796
⏳ 시간 예산(1200초)에 닿아 8줄은 다음 칸으로 미룹니다
```
