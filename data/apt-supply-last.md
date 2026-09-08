# 단지 공급면적 — 마지막 실행

- 성공 72건 · 실패 72건 · 미룸 596줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 130/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
-- --kapt A10025440 --area 84.772`
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
── A42384702 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42384702 --area 58.01

▶ 하안주공4단지 (A42384702) · 전용 58.01㎡ · 41210-10300 · 지번 후보 651
   지번 651 (0651-0000) · 대지 → 줄 2692개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42384702-59.json
   전유 58.01 + 주거공용 22.16 = 공급 80.17㎡ = 24.25평 → **24평**
   표본: 409동 1004호 (같은 전용 호 176개) · 전용률 72.4%
     · 아파트 / [] 22.16
── A42384503 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42384503 --area 58.01

▶ 하안주공10단지 (A42384503) · 전용 58.01㎡ · 41210-10300 · 지번 후보 30
   지번 30 (0030-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42384503-59.json
   전유 58.01 + 주거공용 22.16 = 공급 80.17㎡ = 24.25평 → **24평**
   표본: 1002동 405호 (같은 전용 호 256개) · 전용률 72.4%
     · 아파트 / [] 22.16
── A42370301 전용 84.35

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42370301 --area 84.35

▶ 철산래미안자이 (A42370301) · 전용 84.35㎡ · 41210-10200 · 지번 후보 634
   지번 634 (0634-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42370301-84.json
   전유 84.35 + 주거공용 26.43 = 공급 110.78㎡ = 33.51평 → **34평**
   표본: 102동 502 (같은 전용 호 207개) · 전용률 76.1%
     · 아파트 / 계단실,승강기 [각층 각층] 19.21
     · 아파트 / 벽체 [각층 각층] 7.22
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
── A42280405 전용 84.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42280405 --area 84.39

▶ 부천범박힐스테이트4단지 (A42280405) · 전용 84.39㎡ · 41194-10300 · 지번 후보 152-2
   지번 152-2 (0152-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42280405-84.json
   전유 84.39 + 주거공용 27.218 = 공급 111.61㎡ = 33.76평 → **34평**
   표본: 405동 201 (같은 전용 호 222개) · 전용률 75.6%
     · 아파트 / 계단,승강기 [각층] 20.7676
     · 아파트 / 벽체 [각층] 6.45
── A42280404 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42280404 --area 84.92

▶ 부천범박힐스테이트3단지 (A42280404) · 전용 84.92㎡ · 41194-10300 · 지번 후보 155-1
   지번 155-1 (0155-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42280404-84.json
   전유 84.92 + 주거공용 27.661 = 공급 112.58㎡ = 34.06평 → **34평**
   표본: 301동 2002 (같은 전용 호 185개) · 전용률 75.4%
     · 아파트 / 계단,승강기 [각층 각층] 22.1915
     · 아파트 / 벽체 [각층 각층] 5.29
     · 부대시설 / 주민공동시설 [지상 1층] 0.1793
── A42084708 전용 84.81

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42084708 --area 84.81

▶ 중동금강마을주공 (A42084708) · 전용 84.81㎡ · 41192-10800 · 지번 후보 1029
   지번 1029 (1029-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42084708-84.json
   전유 84.81 + 주거공용 13.57 = 공급 98.38㎡ = 29.76평 → **30평**
   표본: 414동 904호 (같은 전용 호 44개) · 전용률 86.2%
     · 아파트 / 복도,계단,승강기,관리실 [각층1층] 13.57
   ⚠️ 전용률 86.2% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A42084706 전용 59.56

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42084706 --area 59.56

▶ 중동한라마을주공3단지 (A42084706) · 전용 59.56㎡ · 41192-10800 · 지번 후보 1027
   지번 1027 (1027-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42084706-59.json
   전유 59.56 + 주거공용 16.926 = 공급 76.49㎡ = 23.14평 → **23평**
   표본: 129동 801호 (같은 전용 호 190개) · 전용률 77.9%
     · 아파트 / 복도,계단,승강기등 [각층] 16.926
── A42073301 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42073301 --area 84.98

▶ 부천두산위브트레지움2단지 (A42073301) · 전용 84.98㎡ · 41192-10500 · 지번 후보 769, 10, 1331, 1708, 209
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 209 (0209-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42073301-84.json
   전유 84.98 + 주거공용 29 = 공급 113.98㎡ = 34.48평 → **34평**
   표본: 209동 2102 (같은 전용 호 262개) · 전용률 74.6%
     · 아파트 / 계단,승강기 [각층 각층] 22.01
     · 아파트 / 벽체 [각층 각층] 6.99
── A42081207 전용 84.778

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081207 --area 84.778

▶ 한아름1차 아파트 (A42081207) · 전용 84.778㎡ · 41192-10900 · 지번 후보 392
   지번 392 (0392-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42081207-84.json
   전유 84.778 + 주거공용 14.034 = 공급 98.81㎡ = 29.89평 → **30평**
   표본: 1504동 1층104호 (같은 전용 호 170개) · 전용률 85.8%
     · 부대시설 / 복도,계단 [지상 1층] 14.034
   ⚠️ 전용률 85.8% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A42081207 전용 59.58

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081207 --area 59.58

▶ 한아름1차 아파트 (A42081207) · 전용 59.58㎡ · 41192-10900 · 지번 후보 392
   지번 392 (0392-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42081207-59.json
   전유 59.58 + 주거공용 14.033 = 공급 73.61㎡ = 22.27평 → **22평**
   표본: 1514동 1105호 (같은 전용 호 60개) · 전용률 80.9%
     · 부대시설 / 복도,계단,승강기 [지상 11층] 14.033
── A42081308 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42081308 --area 84.91

▶ 반달마을극동아파트 (A42081308) · 전용 84.91㎡ · 41192-10900 · 지번 후보 399
   지번 399 (0399-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42081308-84.json
   전유 84.91 + 주거공용 14.35 = 공급 99.26㎡ = 30.03평 → **30평**
   표본: 1836동 801호 (같은 전용 호 97개) · 전용률 85.5%
     · 부대시설 / 계단,복도 [각층] 14.35
   ⚠️ 전용률 85.5% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10022268 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022268 --area 84.98

▶ 평촌트리지아 아파트 (A10022268) · 전용 84.98㎡ · 41173-10400 · 지번 후보 1338
   지번 1338 (1338-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022268-84.json
   전유 84.98 + 주거공용 27.065 = 공급 112.05㎡ = 33.89평 → **34평**
   표본: 107동 1904 (같은 전용 호 99개) · 전용률 75.8%
     · 아파트 / 계단실 [지상 각층] 20.3554
     · 아파트 / 벽체공유 [지상 19층] 6.71
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
── A10023559 전용 59.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023559 --area 59.87

▶ 평촌어바인퍼스트 (A10023559) · 전용 59.87㎡ · 41173-10400 · 지번 후보 1296
   지번 1296 (1296-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023559-59.json
   전유 59.87 + 주거공용 25.556 = 공급 85.43㎡ = 25.84평 → **26평**
   표본: 110동 502 (같은 전용 호 186개) · 전용률 70.1%
     · 아파트 / 계단실,전실,코어 [각층 각층] 19.516
     · 아파트 / 벽체 [지상 5층] 6.04
── A43183405 전용 84.846

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43183405 --area 84.846

▶ 호계e편한세상 (A43183405) · 전용 84.846㎡ · 41173-10400 · 지번 후보 813
   지번 813 (0813-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43183405-84.json
   전유 84.846 + 주거공용 22.593 = 공급 107.44㎡ = 32.5평 → **33평**
   표본: 103동 1201 (같은 전용 호 221개) · 전용률 79.0%
     · 아파트 / 계단,승강기 [각층 각층] 16.212
     · 아파트 / 벽체공유 [각층 각층] 6.381
── A43183405 전용 59.882

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43183405 --area 59.882

▶ 호계e편한세상 (A43183405) · 전용 59.882㎡ · 41173-10400 · 지번 후보 813
   지번 813 (0813-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43183405-59.json
   전유 59.882 + 주거공용 22.252 = 공급 82.13㎡ = 24.85평 → **25평**
   표본: 102동 1202 (같은 전용 호 43개) · 전용률 72.9%
     · 아파트 / 계단,승강기 [각층 각층] 16.907
     · 아파트 / 벽체공유 [각층 각층] 5.345
── A43182909 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43182909 --area 60

▶ 초원부영 (A43182909) · 전용 60㎡ · 41173-10300 · 지번 후보 518, 896-6
   지번 518 (0518-0000) · 대지 → 줄 0개
   지번 896-6 (0896-0006) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43182909-59.json
   전유 60 + 주거공용 16.73 = 공급 76.73㎡ = 23.21평 → **23평**
   표본: 705동 106호 (같은 전용 호 109개) · 전용률 78.2%
     · 다세대주택 / 계단,복도 [지상 1층] 15.9
     · 부대시설 / 중간기계실 [지하 지층] 0.342
     · 부대시설 / 노인정,관리실 [1,2층] 0.304
     · 부대시설 / 변전실 [지하 지층] 0.131
     · 다세대주택 / 경비실 [지상 1층] 0.053
── A43181102 전용 59.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43181102 --area 59.82

▶ 샛별한양4-2,3차 (A43181102) · 전용 59.82㎡ · 41173-10100 · 지번 후보 1101-6
   지번 1101-6 (1101-0006) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43181102-59.json
   전유 59.82 + 주거공용 14.898 = 공급 74.72㎡ = 22.6평 → **23평**
   표본: 206동 14층 1401호 (같은 전용 호 148개) · 전용률 80.1%
     · 아파트 / 계단,복도 [지상 14층] 14.898
── A43181606 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43181606 --area 59.4

▶ 평촌관악타운 (A43181606) · 전용 59.4㎡ · 41173-10100 · 지번 후보 1102
   지번 1102 (1102-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43181606-59.json
   전유 59.4 + 주거공용 13.247 = 공급 72.65㎡ = 21.98평 → **22평**
   표본: 127동 4층 402호 (같은 전용 호 72개) · 전용률 81.8%
     · 아파트 / 복도.계단 [지상 4층] 13.247
── A43106006 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43106006 --area 84.97

▶ 동편마을3단지 (A43106006) · 전용 84.97㎡ · 41173-10200 · 지번 후보 1651
   지번 1651 (1651-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43106006-84.json
   전유 84.97 + 주거공용 26.278 = 공급 111.25㎡ = 33.65평 → **34평**
   표본: 315동 704 (같은 전용 호 303개) · 전용률 76.4%
     · 아파트 / 계단실,승강기,홀등 [각층 각층] 26.2776
── A43070902 전용 59.997

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070902 --area 59.997

▶ 석수아이파크 (A43070902) · 전용 59.997㎡ · 41171-10200 · 지번 후보 794
   지번 794 (0794-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43070902-59.json
   전유 59.997 + 주거공용 26.044 = 공급 86.04㎡ = 26.03평 → **26평**
   표본: 108동 504 (같은 전용 호 110개) · 전용률 69.7%
     · 아파트 / 계단실,승강기 [각층 각층] 18.877
     · 아파트 / 벽체 [각층 각층] 7.167
   ⚠️ 전용률 69.7% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A43070705 전용 58.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070705 --area 58.76

▶ 석수엘지빌리지 (A43070705) · 전용 58.76㎡ · 41171-10200 · 지번 후보 484
   지번 484 (0484-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43070705-59.json
   전유 58.76 + 주거공용 20.29 = 공급 79.05㎡ = 23.91평 → **24평**
   표본: 409동 505호 (같은 전용 호 2개) · 전용률 74.3%
     · 부대시설 / 계단,승강기 [각층 각층] 14.73
     · 아파트 / 주거공용(중심) [각층 각층] 5.56
── A43075306 전용 59.06

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43075306 --area 59.06

▶ 안양주공뜨란채 (A43075306) · 전용 59.06㎡ · 41171-10100 · 지번 후보 1380
   지번 1380 (1380-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43075306-59.json
   전유 59.06 + 주거공용 20.541 = 공급 79.6㎡ = 24.08평 → **24평**
   표본: 106동 504 (같은 전용 호 64개) · 전용률 74.2%
     · 아파트 / 계단실,승강기등 [각층 각층] 20.541
── A43071005 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43071005 --area 84.99

▶ 안양동삼성래미안 (A43071005) · 전용 84.99㎡ · 41171-10100 · 지번 후보 90-1
   지번 90-1 (0090-0001) · 대지 → 줄 3000개
::error::전용 84.99㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 90-1) — 파일을 만들지 않습니다
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
── A10027336 전용 84.7

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027336 --area 84.7

▶ 래미안안양메가트리아 (A10027336) · 전용 84.7㎡ · 41171-10100 · 지번 후보 1393
   지번 1393 (1393-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027336-84.json
   전유 84.7 + 주거공용 28.26 = 공급 112.96㎡ = 34.17평 → **34평**
   표본: 210동 1602 (같은 전용 호 135개) · 전용률 75.0%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 28.2596
── A10027336 전용 59.75

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027336 --area 59.75

▶ 래미안안양메가트리아 (A10027336) · 전용 59.75㎡ · 41171-10100 · 지번 후보 1393
   지번 1393 (1393-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027336-59.json
   전유 59.75 + 주거공용 19.935 = 공급 79.69㎡ = 24.1평 → **24평**
   표본: 111동 1001 (같은 전용 호 101개) · 전용률 75.0%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 19.9353
── A43070804 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070804 --area 84.87

▶ 석수현대 (A43070804) · 전용 84.87㎡ · 41171-10200 · 지번 후보 1932-6, 481, 700-1, 818, 929, 275-1
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 275-1 (0275-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43070804-84.json
   전유 84.87 + 주거공용 25.741 = 공급 110.61㎡ = 33.46평 → **33평**
   표본: 107동 1309호 (같은 전용 호 223개) · 전용률 76.7%
     · 아파트 / 주거공용(계단실,E/L실) [지상 13층] 24.9
     · 부대시설 / 전기,펌프실 [지하 지1,2층] 0.67
     · 부대시설 / 주민공동시설 [지하 지1,2층] 0.16
     · 아파트 / 2동피로티,MDF실 [지상 1층] 0.011
── A43070804 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070804 --area 60

▶ 석수현대 (A43070804) · 전용 60㎡ · 41171-10200 · 지번 후보 1932-6, 481, 700-1, 818, 929, 275-1
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 275-1 (0275-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43070804-59.json
   전유 60 + 주거공용 23.962 = 공급 83.96㎡ = 25.4평 → **25평**
   표본: 103동 1107호 (같은 전용 호 77개) · 전용률 71.5%
     · 아파트 / 주거공용(계단실,E/L실) [지상 11층] 23.35
     · 부대시설 / 전기,펌프실 [지하 지1,2층] 0.49
     · 부대시설 / 주민공동시설 [지하 지1,2층] 0.114
     · 아파트 / 2동피로티,MDF실 [지상 1층] 0.008
── A43070902 전용 84.986

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070902 --area 84.986

▶ 석수아이파크 (A43070902) · 전용 84.986㎡ · 41171-10200 · 지번 후보 794
   지번 794 (0794-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43070902-84.json
   전유 84.986 + 주거공용 28.917 = 공급 113.9㎡ = 34.46평 → **34평**
   표본: 113동 603 (같은 전용 호 294개) · 전용률 74.6%
     · 아파트 / 계단실,승강기 [각층 각층] 17.833
     · 아파트 / 벽체 [각층 각층] 11.084
── A43070506 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070506 --area 84.87

▶ 석수e편한세상 (A43070506) · 전용 84.87㎡ · 41171-10200 · 지번 후보 182-2
   지번 182-2 (0182-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43070506-84.json
   전유 84.87 + 주거공용 15.036 = 공급 99.91㎡ = 30.22평 → **30평**
   표본: 114동 1305호 (같은 전용 호 199개) · 전용률 85.0%
     · 부대시설 / 계단,승강기,홀 [각층 각층] 15.036
── A43080207 전용 84.68

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43080207 --area 84.68

▶ 한라비발디 (A43080207) · 전용 84.68㎡ · 41171-10300 · 지번 후보 114
   지번 114 (0114-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43080207-84.json
   전유 84.68 + 주거공용 17.593 = 공급 102.27㎡ = 30.94평 → **31평**
   표본: 110동 703호 (같은 전용 호 177개) · 전용률 82.8%
     · 부대시설 / 현관,계단 [각층 각층] 17.593
── A43080207 전용 59.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43080207 --area 59.91

▶ 한라비발디 (A43080207) · 전용 59.91㎡ · 41171-10300 · 지번 후보 114
   지번 114 (0114-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43080207-59.json
   전유 59.91 + 주거공용 16.458 = 공급 76.37㎡ = 23.1평 → **23평**
   표본: 108동 2404호 (같은 전용 호 102개) · 전용률 78.5%
     · 부대시설 / 현관,계단 [각층 각층] 16.458
── A43070306 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070306 --area 84.97

▶ 박달우성 (A43070306) · 전용 84.97㎡ · 41171-10300 · 지번 후보 85
   지번 85 (0085-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43070306-84.json
   전유 84.97 + 주거공용 10.701 = 공급 95.67㎡ = 28.94평 → **29평**
   표본: 103동 506호 (같은 전용 호 273개) · 전용률 88.8%
     · 부대시설 / 복도및계단 [지상 5층] 10.701
   ⚠️ 전용률 88.8% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46382916 전용 59.535

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46382916 --area 59.535

▶ 이매촌삼성 (A46382916) · 전용 59.535㎡ · 41135-10600 · 지번 후보 100
   지번 100 (0100-0000) · 대지 → 줄 3000개
::error::전용 59.535㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 100) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46382916 --area 59.535`
Exit status 1
── A46377208 전용 59.995

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377208 --area 59.995

▶ 분당시범삼성한신아파트 (A46377208) · 전용 59.995㎡ · 41135-10500 · 지번 후보 87
   지번 87 (0087-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46377208-59.json
   전유 59.995 + 주거공용 13.557 = 공급 73.55㎡ = 22.25평 → **22평**
   표본: 105동 403호 (같은 전용 호 38개) · 전용률 81.6%
     · 부대시설 / 계단.복도 [] 8.1
     · 부대시설 / 지하층 [] 4.844
     · 부대시설 / 공급실 [] 0.425
     · 복리시설 / 노인정.관리사무실 [] 0.131
     · 독서실 / 독서실 [] 0.057
── A46373315 전용 84.84

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46373315 --area 84.84

▶ 아름마을 두산삼호 (A46373315) · 전용 84.84㎡ · 41135-10600 · 지번 후보 769, 10, 1331, 1708, 133
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 133 (0133-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46373315-84.json
   전유 84.84 + 주거공용 11.912 = 공급 96.75㎡ = 29.27평 → **29평**
   표본: 408동 1004호 (같은 전용 호 72개) · 전용률 87.7%
     · 아파트 / 복도계단.경비실 [] 11.912
   ⚠️ 전용률 87.7% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
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
── A46376107 전용 84.696

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46376107 --area 84.696

▶ 서현효자촌그린타운 (A46376107) · 전용 84.696㎡ · 41135-10500 · 지번 후보 308
   지번 308 (0308-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46376107-84.json
   전유 84.696 + 주거공용 14.903 = 공급 99.6㎡ = 30.13평 → **30평**
   표본: 606동 2204호 (같은 전용 호 96개) · 전용률 85.0%
     · 아파트 / 계단.복도등 [] 14.903
   ⚠️ 전용률 85.0% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46377706 전용 59.55

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377706 --area 59.55

▶ 시범현대아파트 (A46377706) · 전용 59.55㎡ · 41135-10500 · 지번 후보 1932-6, 481, 700-1, 818, 929, 92
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 92 (0092-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46377706-59.json
   전유 59.55 + 주거공용 11.244 = 공급 70.79㎡ = 21.42평 → **21평**
   표본: 403동 401호 (같은 전용 호 32개) · 전용률 84.1%
     · 부대시설 / 복도.계단 [] 6.875
     · 부대시설 / 지하층 [] 3.708
     · 부대시설 / 중간기계실 [] 0.432
     · 아파트 / 노인정.관리사무소.전기실 [] 0.193
     · 부대시설 / 경비초소 [] 0.022
     · 아파트 / 놀이터.화장실 [] 0.014
── A46374321 전용 84.79

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46374321 --area 84.79

▶ 까치마을4단지롯데선경 (A46374321) · 전용 84.79㎡ · 41135-11400 · 지번 후보 63
   지번 63 (0063-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46374321-84.json
   전유 84.79 + 주거공용 14.783 = 공급 99.57㎡ = 30.12평 → **30평**
   표본: 405동 1003호 (같은 전용 호 151개) · 전용률 85.2%
     · 부대시설 / 계단 [지상 10층] 14.783
   ⚠️ 전용률 85.2% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46341003 전용 84.9907

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46341003 --area 84.9907

▶ 판교원한림풀에버9단지 (A46341003) · 전용 84.9907㎡ · 41135-10800 · 지번 후보 585
   지번 585 (0585-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46341003-84.json
   전유 84.991 + 주거공용 30.78 = 공급 115.77㎡ = 35.02평 → **35평**
   표본: 923 404 (같은 전용 호 225개) · 전용률 73.4%
     · 아파트 / 복도,계단실,발코니초과,벽체 [지상 각층] 28.6691
     · 부대시설 / 지하층(지2~지1) [지상 각층] 2.1113
── A46381114 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46381114 --area 84.96

▶ 아이파크분당 (A46381114) · 전용 84.96㎡ · 41135-10300 · 지번 후보 10-1
   지번 10-1 (0010-0001) · 대지 → 줄 1041개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46381114-84.json
   전유 84.96 + 주거공용 25.07 = 공급 110.03㎡ = 33.28평 → **33평**
   표본: 201동 2903 (같은 전용 호 24개) · 전용률 77.2%
     · 부대시설 / 계단,승강기 [각층] 21.595
     · 아파트 / 기계실,전기실,관리사무소,노인정,주민공동시설,경비실 [지3~1층,3층] 3.475
── A46374428 전용 58.19

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46374428 --area 58.19

▶ 정자한솔마을주공6차 (A46374428) · 전용 58.19㎡ · 41135-10300 · 지번 후보 668-1, 117
   지번 668-1 (0668-0001) · 대지 → 줄 0개
   지번 117 (0117-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46374428-59.json
   전유 58.19 + 주거공용 21.94 = 공급 80.13㎡ = 24.24평 → **24평**
   표본: 608동 1003호 (같은 전용 호 169개) · 전용률 72.6%
     · / 복도.계단.승강기 등 [] 16.91
     · 부대시설 / 지하층 [] 5.03
── A46386328 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46386328 --area 84.99

▶ 분당 파크뷰 (A46386328) · 전용 84.99㎡ · 41135-10300 · 지번 후보 6
   지번 6 (0006-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46386328-84.json
   전유 84.99 + 주거공용 25.04 = 공급 110.03㎡ = 33.28평 → **33평**
   표본: 파크뷰 604-1003 (같은 전용 호 88개) · 전용률 77.2%
     · 아파트 / 계단,복도,승강기등 [각층 각층] 23.17
     · 아파트 / 공동창고,기계실,전기실 [지하 지1층] 1.383
     · 아파트 / 관리실,도서실,경비실 [지상 1층,2층] 0.302
     · 아파트 / 주민공동시설 [지상 2층] 0.185
── A46378626 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46378626 --area 84.97

▶ 정자상록마을우성 (A46378626) · 전용 84.97㎡ · 41135-10300 · 지번 후보 121
   지번 121 (0121-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46378626-84.json
   전유 84.97 + 주거공용 13.186 = 공급 98.16㎡ = 29.69평 → **30평**
   표본: 313동 1205호 (같은 전용 호 51개) · 전용률 86.6%
     · 부대시설 / 계단.복도 [각층] 13.186
   ⚠️ 전용률 86.6% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46378626 전용 57.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46378626 --area 57.27

▶ 정자상록마을우성 (A46378626) · 전용 57.27㎡ · 41135-10300 · 지번 후보 121
   지번 121 (0121-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46378626-59.json
   전유 57.27 + 주거공용 16.153 = 공급 73.42㎡ = 22.21평 → **22평**
   표본: 305동 601호 (같은 전용 호 7개) · 전용률 78.0%
     · 부대시설 / 계단.복도 [각층] 16.153
── A46383017 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46383017 --area 84.9

▶ 이매촌한신 (A46383017) · 전용 84.9㎡ · 41135-10600 · 지번 후보 124
   지번 124 (0124-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46383017-84.json
   전유 84.9 + 주거공용 14.962 = 공급 99.86㎡ = 30.21평 → **30평**
   표본: 204동 203호 (같은 전용 호 109개) · 전용률 85.0%
     · 부대시설 / 계단.복도 [] 14.962
   ⚠️ 전용률 85.0% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46382916 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46382916 --area 84.94

▶ 이매촌삼성 (A46382916) · 전용 84.94㎡ · 41135-10600 · 지번 후보 100
   지번 100 (0100-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46382916-84.json
   전유 84.94 + 주거공용 13.677 = 공급 98.62㎡ = 29.83평 → **30평**
   표본: 1006동 604호 (같은 전용 호 79개) · 전용률 86.1%
     · 부대시설 / 계단 [] 13.677
   ⚠️ 전용률 86.1% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46373315 전용 59.79

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46373315 --area 59.79

▶ 아름마을 두산삼호 (A46373315) · 전용 59.79㎡ · 41135-10600 · 지번 후보 769, 10, 1331, 1708, 133
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 133 (0133-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46373315-59.json
   전유 59.79 + 주거공용 7.136 = 공급 66.93㎡ = 20.25평 → **20평**
   표본: 414동 503호 (같은 전용 호 18개) · 전용률 89.3%
     · 아파트 / 복도계단.경비실 [] 7.136
   ⚠️ 전용률 89.3% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46379108 전용 84.72

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46379108 --area 84.72

▶ 산운마을13단지 (A46379108) · 전용 84.72㎡ · 41135-11500 · 지번 후보 918
   지번 918 (0918-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46379108-84.json
   전유 84.72 + 주거공용 22.378 = 공급 107.1㎡ = 32.4평 → **32평**
   표본: 1302동 1403 (같은 전용 호 211개) · 전용률 79.1%
     · 아파트 / 계단실,승강기등 [지상 각층] 22.3781
── A46379226 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46379226 --area 84.97

▶ 야탑장미마을현대 (A46379226) · 전용 84.97㎡ · 41135-10700 · 지번 후보 1932-6, 481, 700-1, 818, 929, 334
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 334 (0334-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46379226-84.json
   전유 84.79 + 주거공용 12.163 = 공급 96.95㎡ = 29.33평 → **29평**
   표본: 805동 1101호 (같은 전용 호 88개) · 전용률 87.5%
     · 부대시설 / 복도.계단 [지상 11층] 11.195
     · 부대시설 / 기계실 [지하1층.지상1층] 0.328
     · 부대시설 / 전기실 [지하1층.지상1층] 0.256
     · 아파트 / 노인정.관리사무소.집회소.독서실 [지하1층.지상2층] 0.222
     · 아파트 / 노인정.집회소 [1.2층] 0.096
     · 부대시설 / 경비실 [지상 1층] 0.054
     · 부대시설 / 공중변소 [지상 1층] 0.012
   ⚠️ 전용률 87.5% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46379226 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46379226 --area 59.4

▶ 야탑장미마을현대 (A46379226) · 전용 59.4㎡ · 41135-10700 · 지번 후보 1932-6, 481, 700-1, 818, 929, 334
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 334 (0334-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46379226-59.json
   전유 59.4 + 주거공용 12.172 = 공급 71.57㎡ = 21.65평 → **22평**
   표본: 802동 401호 (같은 전용 호 58개) · 전용률 83.0%
     · 부대시설 / 복도.계단 [지상 4층] 12.172
── A46378822 전용 84.6

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46378822 --area 84.6

▶ 야탑장미마을코오롱 (A46378822) · 전용 84.6㎡ · 41135-10700 · 지번 후보 330
   지번 330 (0330-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46378822-84.json
   전유 84.6 + 주거공용 14.159 = 공급 98.76㎡ = 29.87평 → **30평**
   표본: 129동 1403호 (같은 전용 호 166개) · 전용률 85.7%
     · 아파트 / 계단.경비실 [] 14.159
   ⚠️ 전용률 85.7% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46378822 전용 59.55

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46378822 --area 59.55

▶ 야탑장미마을코오롱 (A46378822) · 전용 59.55㎡ · 41135-10700 · 지번 후보 330
   지번 330 (0330-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46378822-59.json
   전유 59.55 + 주거공용 13.4 = 공급 72.95㎡ = 22.07평 → **22평**
   표본: 120동 1001호 (같은 전용 호 122개) · 전용률 81.6%
     · 아파트 / 계단.경비실 [] 13.4
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
── A10026318 전용 84.6

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026318 --area 84.6

▶ 파크타운아파트 (A10026318) · 전용 84.6㎡ · 41135-10200 · 지번 후보 51
   지번 51 (0051-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026318-84.json
   전유 84.6 + 주거공용 13.711 = 공급 98.31㎡ = 29.74평 → **30평**
   표본: 104동 803호 (같은 전용 호 38개) · 전용률 86.1%
     · 아파트 / 계단.경비실.에레베이타 [] 13.711
   ⚠️ 전용률 86.1% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10026318 전용 59.32

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026318 --area 59.32

▶ 파크타운아파트 (A10026318) · 전용 59.32㎡ · 41135-10200 · 지번 후보 51
   지번 51 (0051-0000) · 대지 → 줄 3000개
::error::전용 59.32㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 51) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026318 --area 59.32`
Exit status 1
── A46392104 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46392104 --area 59.94

▶ 수내양지마을청구 (A46392104) · 전용 59.94㎡ · 41135-10200 · 지번 후보 32
   지번 32 (0032-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46392104-59.json
   전유 59.94 + 주거공용 16.323 = 공급 76.26㎡ = 23.07평 → **23평**
   표본: 602동 305호 (같은 전용 호 85개) · 전용률 78.6%
     · 부대시설 / 계단실 [지상 3층] 16.161
     · 부대시설 / 경비실 [] 0.162
── A46392206 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46392206 --area 84.9

▶ 수내양지마을한양1단지 (A46392206) · 전용 84.9㎡ · 41135-10200 · 지번 후보 24
   지번 24 (0024-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46392206-84.json
   전유 84.9 + 주거공용 14.497 = 공급 99.4㎡ = 30.07평 → **30평**
   표본: 517동 1503호 (같은 전용 호 34개) · 전용률 85.4%
     · 아파트 / 계단.기타 [지상 15층] 14.497
   ⚠️ 전용률 85.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A46392206 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46392206 --area 59.76

▶ 수내양지마을한양1단지 (A46392206) · 전용 59.76㎡ · 41135-10200 · 지번 후보 24
   지번 24 (0024-0000) · 대지 → 줄 3000개
::error::전용 59.76㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 24) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A46392206 --area 59.76`
Exit status 1
── A46377706 전용 84.57

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377706 --area 84.57

▶ 시범현대아파트 (A46377706) · 전용 84.57㎡ · 41135-10500 · 지번 후보 1932-6, 481, 700-1, 818, 929, 92
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 92 (0092-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46377706-84.json
   전유 84.57 + 주거공용 24.131 = 공급 108.7㎡ = 32.88평 → **33평**
   표본: 429동 2202호 (같은 전용 호 96개) · 전용률 77.8%
     · 부대시설 / 복도.계단 [지상 22층] 18.865
     · 부대시설 / 지하층 [] 5.266
── A46377610 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377610 --area 84.99

▶ 서현시범한양 (A46377610) · 전용 84.99㎡ · 41135-10500 · 지번 후보 91
   지번 91 (0091-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46377610-84.json
   전유 84.99 + 주거공용 18.543 = 공급 103.53㎡ = 31.32평 → **31평**
   표본: 325동 1102호 (같은 전용 호 48개) · 전용률 82.1%
     · 부대시설 / 계단실 [지상 11층] 18.543
── A46377610 전용 59.13

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377610 --area 59.13

▶ 서현시범한양 (A46377610) · 전용 59.13㎡ · 41135-10500 · 지번 후보 91
   지번 91 (0091-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46377610-59.json
   전유 59.13 + 주거공용 21.04 = 공급 80.17㎡ = 24.25평 → **24평**
   표본: 327동 303호 (같은 전용 호 44개) · 전용률 73.8%
     · 부대시설 / 복도.계단 [] 16.193
     · 부대시설 / 지하층 [] 4.377
     · 아파트 / 변전실.열교환실.펌프실 [] 0.338
     · 부대시설 / 관리사무소.노인정 [] 0.118
     · 부대시설 / 화장실 [] 0.009
     · 부대시설 / 경비실 [] 0.005
── A46377208 전용 84.69

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46377208 --area 84.69

▶ 분당시범삼성한신아파트 (A46377208) · 전용 84.69㎡ · 41135-10500 · 지번 후보 87
   지번 87 (0087-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46377208-84.json
   전유 84.69 + 주거공용 22.764 = 공급 107.45㎡ = 32.5평 → **33평**
   표본: 115동 1301호 (같은 전용 호 184개) · 전용률 78.8%
     · 부대시설 / 계단.복도 [] 15.062
     · 부대시설 / 지하층 [] 6.838
     · 부대시설 / 공급실 [] 0.599
     · 복리시설 / 노인정.관리사무실 [] 0.185
     · 독서실 / 독서실 [] 0.08
⏳ 시간 예산(1200초)에 닿아 596줄은 다음 칸으로 미룹니다
```
