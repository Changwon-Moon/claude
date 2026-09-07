# 단지 공급면적 — 마지막 실행

- 성공 67건 · 실패 80건 · 미룸 958줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
> tsx src/supplyAreaCli.ts -- --kapt A42586610 --area 59.42

▶ 안산고잔 그린빌18단지 (A42586610) · 전용 59.42㎡ · 41273-10700 · 지번 후보 738
   지번 738 (0738-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42586610-59.json
   전유 59.42 + 주거공용 17.935 = 공급 77.36㎡ = 23.4평 → **23평**
   표본: 1826동 404호 (같은 전용 호 6개) · 전용률 76.8%
     · 아파트 / 복도/계단/승강기등 [각층 각층] 17.9353
── A42513202 전용 84.9897

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42513202 --area 84.9897

▶ 안산8차푸르지오 (A42513202) · 전용 84.9897㎡ · 41273-10800 · 지번 후보 937
   지번 937 (0937-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42513202-84.json
   전유 84.99 + 주거공용 20.87 = 공급 105.86㎡ = 32.02평 → **32평**
   표본: 808동 301호 (같은 전용 호 6개) · 전용률 80.3%
     · 아파트 / 계단실,승강기 [각층 각층] 15.7045
     · 아파트 / 벽체 [지상 3층] 5.1655
── A42513202 전용 59.9624

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42513202 --area 59.9624

▶ 안산8차푸르지오 (A42513202) · 전용 59.9624㎡ · 41273-10800 · 지번 후보 937
   지번 937 (0937-0000) · 대지 → 줄 0개
::error::지번 후보 937 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42513202 --area 59.9624`
Exit status 1
── A42513001 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42513001 --area 84.99

▶ 원곡벽산블루밍 (A42513001) · 전용 84.99㎡ · 41273-10800 · 지번 후보 1718, 271-3, 828-5
   지번 1718 (1718-0000) · 대지 → 줄 0개
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 828-5 (0828-0005) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42513001-84.json
   전유 84.99 + 주거공용 22.08 = 공급 107.07㎡ = 32.39평 → **32평**
   표본: 108동 502 (같은 전용 호 239개) · 전용률 79.4%
     · 아파트 / 계단실,승강기 [각층 각층] 16.59
     · 아파트 / 벽체 [각층 각층] 5.13
     · 아파트 / 서비스공용 [각층 각층] 0.36
── A42513203 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42513203 --area 84.99

▶ 경남아너스빌 (A42513203) · 전용 84.99㎡ · 41273-10800 · 지번 후보 938
   지번 938 (0938-0000) · 대지 → 줄 700개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42513203-84.json
   전유 84.99 + 주거공용 24.87 = 공급 109.86㎡ = 33.23평 → **33평**
   표본: 102동 503호 (같은 전용 호 54개) · 전용률 77.4%
     · 아파트 / 계단실,승강기 [각층 각층] 24.87
── A42513203 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42513203 --area 59.99

▶ 경남아너스빌 (A42513203) · 전용 59.99㎡ · 41273-10800 · 지번 후보 938
   지번 938 (0938-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42513203-59.json
   전유 59.99 + 주거공용 17.56 = 공급 77.55㎡ = 23.46평 → **23평**
   표본: 111동 203호 (같은 전용 호 3개) · 전용률 77.4%
     · 아파트 / 계단실,승강기 [각층 각층] 17.56
── A10026028 전용 84.9123

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026028 --area 84.9123

▶ 안산 메트로타운 푸르지오 힐스테이트 아파트 (A10026028) · 전용 84.9123㎡ · 41273-10900 · 지번 후보 1177
   지번 1177 (1177-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026028-84.json
   전유 84.912 + 주거공용 33.236 = 공급 118.15㎡ = 35.74평 → **36평**
   표본: 106동 2204 (같은 전용 호 6개) · 전용률 71.9%
     · 아파트 / 코어 [지상 각층] 25.5461
     · 아파트 / 벽체 [지상 22층] 7.6898
── A10026028 전용 59.8167

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026028 --area 59.8167

▶ 안산 메트로타운 푸르지오 힐스테이트 아파트 (A10026028) · 전용 59.8167㎡ · 41273-10900 · 지번 후보 1177
   지번 1177 (1177-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026028-59.json
   전유 59.823 + 주거공용 30.812 = 공급 90.63㎡ = 27.42평 → **27평**
   표본: 105동 4501 (같은 전용 호 4개) · 전용률 66.0%
     · 아파트 / 코어 [지상 각층] 22.9538
     · 아파트 / 벽체 [지상 45층] 7.8581
   ⚠️ 전용률 66.0% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
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
── A42590617 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42590617 --area 84.96

▶ 고잔3차푸르지오 (A42590617) · 전용 84.96㎡ · 41273-10100 · 지번 후보 728
   지번 728 (0728-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42590617-84.json
   전유 84.96 + 주거공용 21.762 = 공급 106.72㎡ = 32.28평 → **32평**
   표본: 313동 1802호 (같은 전용 호 184개) · 전용률 79.6%
     · 아파트 / 계단,승강기 [각층] 16.679
     · 아파트 / 벽체공유 [각층] 5.083
── A42590614 전용 84.782

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42590614 --area 84.782

▶ 푸르지오1차대우 (A42590614) · 전용 84.782㎡ · 41273-10100 · 지번 후보 781
   지번 781 (0781-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42590614-84.json
   전유 84.782 + 주거공용 20.683 = 공급 105.46㎡ = 31.9평 → **32평**
   표본: 108동 403호 (같은 전용 호 12개) · 전용률 80.4%
     · 아파트 / 계단실,ELEV [각층] 15.6103
     · 아파트 / 안목공용 [각층] 5.0722
── A42580505 전용 61.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42580505 --area 61.52

▶ 안산고잔8단지 (A42580505) · 전용 61.52㎡ · 41273-10100 · 지번 후보 671
   지번 671 (0671-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42580505-59.json
   전유 61.52 + 주거공용 22.21 = 공급 83.73㎡ = 25.33평 → **25평**
   표본: 804동 1006호 (같은 전용 호 5개) · 전용률 73.5%
     · 아파트 / 공용 [10층] 22.21
── A42580504 전용 61.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42580504 --area 61.52

▶ 고잔주공7단지 (A42580504) · 전용 61.52㎡ · 41273-10100 · 지번 후보 295, 670
   지번 295 (0295-0000) · 대지 → 줄 0개
   지번 670 (0670-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42580504-59.json
   전유 61.52 + 주거공용 22.21 = 공급 83.73㎡ = 25.33평 → **25평**
   표본: 703동 704호 (같은 전용 호 7개) · 전용률 73.5%
     · 아파트 / 공용 [7층] 22.21
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
── A42580507 전용 61.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42580507 --area 61.52

▶ 고잔주공9단지 (A42580507) · 전용 61.52㎡ · 41273-10100 · 지번 후보 13, 672
   지번 13 (0013-0000) · 대지 → 줄 0개
   지번 672 (0672-0000) · 대지 → 줄 1800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42580507-59.json
   전유 61.52 + 주거공용 22.21 = 공급 83.73㎡ = 25.33평 → **25평**
   표본: 908동 1105호 (같은 전용 호 246개) · 전용률 73.5%
     · 아파트 / 공용 [11층] 22.21
── A10027619 전용 84.7053

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027619 --area 84.7053

▶ 안산레이크타운 푸르지오 아파트 (A10027619) · 전용 84.7053㎡ · 41273-10100 · 지번 후보 782
   지번 782 (0782-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027619-84.json
   전유 84.705 + 주거공용 25.416 = 공급 110.12㎡ = 33.31평 → **33평**
   표본: 104동 3204 (같은 전용 호 13개) · 전용률 76.9%
     · 아파트 / 계단,복도,ELEV. [지상 각층] 18.6155
     · 아파트 / 벽체 [지상 각층] 6.8001
── A10027619 전용 59.5637

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027619 --area 59.5637

▶ 안산레이크타운 푸르지오 아파트 (A10027619) · 전용 59.5637㎡ · 41273-10100 · 지번 후보 782
   지번 782 (0782-0000) · 대지 → 줄 0개
::error::지번 후보 782 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027619 --area 59.5637`
Exit status 1
── A42590616 전용 84.807

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42590616 --area 84.807

▶ 고잔5차푸르지오 (A42590616) · 전용 84.807㎡ · 41273-10100 · 지번 후보 712
   지번 712 (0712-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42590616-84.json
   전유 84.807 + 주거공용 20.996 = 공급 105.8㎡ = 32.01평 → **32평**
   표본: 513동 604호 (같은 전용 호 274개) · 전용률 80.2%
     · 아파트 / 계단실, 승강기 [각층] 15.495
     · 아파트 / 벽 체 [각층] 5.501
── A42590615 전용 84.5

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42590615 --area 84.5

▶ 네오빌6단지 (A42590615) · 전용 84.5㎡ · 41273-10100 · 지번 후보 767
   지번 767 (0767-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42590615-84.json
   전유 84.5 + 주거공용 12.41 = 공급 96.91㎡ = 29.32평 → **29평**
   표본: 613동 104호 (같은 전용 호 16개) · 전용률 87.2%
     · 아파트 / 계단실,승강기등 [각층] 12.4101
   ⚠️ 전용률 87.2% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10024584 전용 59.9595

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024584 --area 59.9595

▶ 그랑시티자이2차아파트 (A10024584) · 전용 59.9595㎡ · 41271-10300 · 지번 후보 1639
   지번 1639 (1639-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024584-59.json
   전유 59.959 + 주거공용 24.64 = 공급 84.6㎡ = 25.59평 → **26평**
   표본: 211동 4504 (같은 전용 호 1개) · 전용률 70.9%
     · 아파트 / 계단실 [지상 각층] 19.0351
     · 아파트 / 벽체 [지상 45층] 5.6053
── A10024584 전용 84.9921

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024584 --area 84.9921

▶ 그랑시티자이2차아파트 (A10024584) · 전용 84.9921㎡ · 41271-10300 · 지번 후보 1639
   지번 1639 (1639-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024584-84.json
   전유 84.992 + 주거공용 34.056 = 공급 119.05㎡ = 36.01평 → **36평**
   표본: 206동 2204 (같은 전용 호 11개) · 전용률 71.4%
     · 아파트 / 계단실 [지상 각층] 26.9821
     · 아파트 / 벽체 [지상 22층] 7.0741
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
── A10025014 전용 84.8345

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025014 --area 84.8345

▶ 그랑시티자이아파트 (A10025014) · 전용 84.8345㎡ · 41271-10300 · 지번 후보 1639-7
   지번 1639-7 (1639-0007) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025014-84.json
   전유 84.835 + 주거공용 32.982 = 공급 117.82㎡ = 35.64평 → **36평**
   표본: 105동 1104 (같은 전용 호 390개) · 전용률 72.0%
     · 아파트 / 계단실 [지상 각층] 27.2463
     · 아파트 / 벽체 [지상 11층] 5.7352
── A10026018 전용 59.9867

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026018 --area 59.9867

▶ 안산파크푸르지오 아파트 (A10026018) · 전용 59.9867㎡ · 41271-10800 · 지번 후보 747
   지번 747 (0747-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026018-59.json
   전유 59.987 + 주거공용 23.189 = 공급 83.18㎡ = 25.16평 → **25평**
   표본: 107동 1305 (같은 전용 호 33개) · 전용률 72.1%
     · 아파트 / 계단실 [각층 각층] 17.1122
     · 아파트 / 벽체 [지상 13층] 6.0765
── A42683705 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42683705 --area 84.87

▶ 성포예술인 (A42683705) · 전용 84.87㎡ · 41271-10800 · 지번 후보 583
   지번 583 (0583-0000) · 대지 → 줄 1700개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42683705-84.json
   전유 84.87 + 주거공용 28.34 = 공급 113.21㎡ = 34.25평 → **34평**
   표본: 7동 1403호 (같은 전용 호 175개) · 전용률 75.0%
     · 아파트 / 계단실 [14층] 20.55
     · 아파트 / [지1층] 6.09
     · 아파트 / 보일러및공중변소 [1층] 1.7
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
   지번 872 (0872-0000) · 대지 → 줄 0개
::error::지번 후보 872 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42681504 --area 59.94`
Exit status 1
── A42685306 전용 84.16

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42685306 --area 84.16

▶ 월피한양 (A42685306) · 전용 84.16㎡ · 41271-10900 · 지번 후보 447
   지번 447 (0447-0000) · 대지 → 줄 2850개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42685306-84.json
   전유 84.16 + 주거공용 18.04 = 공급 102.2㎡ = 30.92평 → **31평**
   표본: 4동 1005호 (같은 전용 호 148개) · 전용률 82.3%
     · 아파트 / [] 18.04
── A42685306 전용 57.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42685306 --area 57.92

▶ 월피한양 (A42685306) · 전용 57.92㎡ · 41271-10900 · 지번 후보 447
   지번 447 (0447-0000) · 대지 → 줄 2850개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42685306-59.json
   전유 57.92 + 주거공용 13.96 = 공급 71.88㎡ = 21.74평 → **22평**
   표본: 19동 105호 (같은 전용 호 240개) · 전용률 80.6%
     · 아파트 / [] 13.96
── A10026018 전용 84.6663

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026018 --area 84.6663

▶ 안산파크푸르지오 아파트 (A10026018) · 전용 84.6663㎡ · 41271-10800 · 지번 후보 747
   지번 747 (0747-0000) · 대지 → 줄 2800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026018-84.json
   전유 84.666 + 주거공용 31.105 = 공급 115.77㎡ = 35.02평 → **35평**
   표본: 101동 705 (같은 전용 호 209개) · 전용률 73.1%
     · 아파트 / 계단실 [각층 각층] 24.1525
     · 아파트 / 벽체 [지상 7층] 6.9522
── A42683707 전용 58.14

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42683707 --area 58.14

▶ 성포주공11단지 (A42683707) · 전용 58.14㎡ · 41271-10800 · 지번 후보 591
   지번 591 (0591-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42683707-59.json
   전유 58.14 + 주거공용 17.03 = 공급 75.17㎡ = 22.74평 → **23평**
   표본: 1103동 1407호 (같은 전용 호 11개) · 전용률 77.3%
     · 아파트 / 계단, 복도, 승강기등 [] 16.1
     · 복리시설 / 근로복지관 [] 0.93
── A42683704 전용 61.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42683704 --area 61.52

▶ 성포주공10단지 (A42683704) · 전용 61.52㎡ · 41271-10800 · 지번 후보 30, 584
::error::30 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42683704 --area 61.52`
Exit status 1
── A42683706 전용 84.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42683706 --area 84.93

▶ 성포선경 (A42683706) · 전용 84.93㎡ · 41271-10800 · 지번 후보 592
   지번 592 (0592-0000) · 대지 → 줄 1000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42683706-84.json
   전유 84.93 + 주거공용 19.64 = 공급 104.57㎡ = 31.63평 → **32평**
   표본: 17동 203호 (같은 전용 호 279개) · 전용률 81.2%
     · 아파트 / [] 19.64
── A42683706 전용 57.19

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42683706 --area 57.19

▶ 성포선경 (A42683706) · 전용 57.19㎡ · 41271-10800 · 지번 후보 592
   지번 592 (0592-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42683706-59.json
   전유 57.19 + 주거공용 20.97 = 공급 78.16㎡ = 23.64평 → **24평**
   표본: 7동 1002호 (같은 전용 호 70개) · 전용률 73.2%
     · 아파트 / [] 20.97
── A42689406 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42689406 --area 59.99

▶ 푸른마을고잔주공5단지아파트 (A42689406) · 전용 59.99㎡ · 41271-10300 · 지번 후보 359-1, 1536
   지번 359-1 (0359-0001) · 대지 → 줄 0개
   지번 1536 (1536-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42689406-59.json
   전유 59.99 + 주거공용 17.055 = 공급 77.04㎡ = 23.31평 → **23평**
   표본: 502동 1003호 (같은 전용 호 13개) · 전용률 77.9%
     · 아파트 / 계단실,승강기등 [각층 각층] 15.8724
     · 복리시설 / 주민복지관 [각층 각층] 0.8892
     · 아파트 / 재활용품보관소 [지상 1층] 0.1149
     · 아파트 / 음식물처리시설 [지상 1층] 0.1016
     · 부대시설 / 경비실 [지상 1층] 0.0625
     · 아파트 / 공중변소 [지상 1층] 0.014
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
── A42681505 전용 59.33

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42681505 --area 59.33

▶ 상림 우성 (A42681505) · 전용 59.33㎡ · 41271-10400 · 지번 후보 872-20
   지번 872-20 (0872-0020) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42681505-59.json
   전유 59.33 + 주거공용 13.715 = 공급 73.05㎡ = 22.1평 → **22평**
   표본: 12동 105호 (같은 전용 호 24개) · 전용률 81.2%
     · 아파트 / [] 13.715
── A42618201 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42618201 --area 84.92

▶ 신안1단지 (A42618201) · 전용 84.92㎡ · 41271-10400 · 지번 후보 871
   지번 871 (0871-0000) · 대지 → 줄 0개
::error::지번 후보 871 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42618201 --area 84.92`
Exit status 1
── A42672901 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42672901 --area 84.92

▶ 상록수한양 (A42672901) · 전용 84.92㎡ · 41271-10400 · 지번 후보 880
   지번 880 (0880-0000) · 대지 → 줄 2800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42672901-84.json
   전유 84.92 + 주거공용 19.376 = 공급 104.3㎡ = 31.55평 → **32평**
   표본: 30동 1007호 (같은 전용 호 381개) · 전용률 81.4%
     · 아파트 / [지상] 19.376
── A42672901 전용 58.5439

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42672901 --area 58.5439

▶ 상록수한양 (A42672901) · 전용 58.5439㎡ · 41271-10400 · 지번 후보 880
   지번 880 (0880-0000) · 대지 → 줄 0개
::error::880 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42672901 --area 58.5439`
Exit status 1
── A42621003 전용 84.9356

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42621003 --area 84.9356

▶ 건건이편한세상 (A42621003) · 전용 84.9356㎡ · 41271-11100 · 지번 후보 987
   지번 987 (0987-0000) · 대지 → 줄 1100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42621003-84.json
   전유 84.936 + 주거공용 25.604 = 공급 110.54㎡ = 33.44평 → **33평**
   표본: 105동 1001 (같은 전용 호 85개) · 전용률 76.8%
     · 아파트 / 계단,승강기,벽체 [각층 각층] 25.6035
── A42621003 전용 59.9713

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42621003 --area 59.9713

▶ 건건이편한세상 (A42621003) · 전용 59.9713㎡ · 41271-11100 · 지번 후보 987
   지번 987 (0987-0000) · 대지 → 줄 0개
::error::지번 후보 987 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42621003 --area 59.9713`
Exit status 1
── A10023196 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023196 --area 59.98

::error::A10023196 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023196 --area 59.98`
Exit status 1
── A10023390 전용 84.052

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023390 --area 84.052

▶ e편한세상지제역아파트 (A10023390) · 전용 84.052㎡ · 41220-11900 · 지번 후보 416
   지번 416 (0416-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023390-84.json
   전유 84.052 + 주거공용 26.459 = 공급 110.51㎡ = 33.43평 → **33평**
   표본: 101동 403 (같은 전용 호 149개) · 전용률 76.1%
     · 아파트 / 계단실 [지상 각층] 18.3036
     · 아파트 / 벽체 [지상 4층] 8.1557
── A10023390 전용 59.5302

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023390 --area 59.5302

▶ e편한세상지제역아파트 (A10023390) · 전용 59.5302㎡ · 41220-11900 · 지번 후보 416
   지번 416 (0416-0000) · 대지 → 줄 800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023390-59.json
   전유 59.53 + 주거공용 19.287 = 공급 78.82㎡ = 23.84평 → **24평**
   표본: 116동 903 (같은 전용 호 45개) · 전용률 75.5%
     · 아파트 / 계단실 [지상 각층] 12.9636
     · 아파트 / 벽체 [지상 9층] 6.3238
── A10024071 전용 84.8441

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024071 --area 84.8441

::error::A10024071 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024071 --area 84.8441`
Exit status 1
── A10024174 전용 84.9718

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024174 --area 84.9718

▶ 동문굿모닝힐맘시티3단지 (A10024174) · 전용 84.9718㎡ · 41220-10500 · 지번 후보 613
   지번 613 (0613-0000) · 대지 → 줄 500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024174-84.json
   전유 84.972 + 주거공용 25.49 = 공급 110.46㎡ = 33.41평 → **33평**
   표본: 306동 1304 (같은 전용 호 8개) · 전용률 76.9%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 18.4318
     · 아파트 / 벽체 [지상 13층] 7.058
── A10024174 전용 59.9701

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024174 --area 59.9701

▶ 동문굿모닝힐맘시티3단지 (A10024174) · 전용 59.9701㎡ · 41220-10500 · 지번 후보 613
   지번 613 (0613-0000) · 대지 → 줄 0개
::error::지번 후보 613 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024174 --area 59.9701`
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
   지번 388-13 (0388-0013) · 대지 → 줄 0개
::error::지번 후보 388-13 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024656 --area 84.7982`
Exit status 1
── A10024611 전용 59.7656

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024611 --area 59.7656

▶ 더샵지제역센트럴파크1BL아파트 (A10024611) · 전용 59.7656㎡ · 41220-11900 · 지번 후보 219-9
   지번 219-9 (0219-0009) · 대지 → 줄 2300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024611-59.json
   전유 59.766 + 주거공용 19.725 = 공급 79.49㎡ = 24.05평 → **24평**
   표본: 105동 503 (같은 전용 호 155개) · 전용률 75.2%
     · 아파트 / 계단실 [지상 각층] 13.1346
     · 아파트 / 벽체 [지상 5층] 6.5904
── A10024656 전용 59.7656

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024656 --area 59.7656

▶ 더샵 지제역 센트럴파크 2BL (A10024656) · 전용 59.7656㎡ · 41220-11900 · 지번 후보 388-13
   지번 388-13 (0388-0013) · 대지 → 줄 0개
::error::지번 후보 388-13 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024656 --area 59.7656`
Exit status 1
── A10024611 전용 84.7982

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024611 --area 84.7982

▶ 더샵지제역센트럴파크1BL아파트 (A10024611) · 전용 84.7982㎡ · 41220-11900 · 지번 후보 219-9
   지번 219-9 (0219-0009) · 대지 → 줄 2400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024611-84.json
   전유 84.798 + 주거공용 25.892 = 공급 110.69㎡ = 33.48평 → **33평**
   표본: 106동 1501 (같은 전용 호 50개) · 전용률 76.6%
     · 아파트 / 계단실 [지상 각층] 18.636
     · 아파트 / 벽체 [지상 15층] 7.2562
── A10025266 전용 84.7982

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025266 --area 84.7982

▶ 더샵지제역센트럴파크3BL (A10025266) · 전용 84.7982㎡ · 41220-11900 · 지번 후보 0
   지번 0 (0000-0000) · 대지 → 줄 0개
   지번 0 (0000-0000) · 블록 → 줄 1600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025266-84.json
   전유 84.954 + 주거공용 25.521 = 공급 110.47㎡ = 33.42평 → **33평**
   표본: 110동 2702 (같은 전용 호 96개) · 전용률 76.9%
     · 아파트 / 계단실 등 [지상 각층] 17.277
     · 아파트 / 벽체 [지상 27층] 8.2437
── A10025311 전용 59.7109

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025311 --area 59.7109

▶ 평택지제역동문디이스트2단지 (A10025311) · 전용 59.7109㎡ · 41220-10500 · 지번 후보 559
   지번 559 (0559-0000) · 대지 → 줄 2400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025311-59.json
   전유 59.711 + 주거공용 23.257 = 공급 82.97㎡ = 25.1평 → **25평**
   표본: 213동 801 (같은 전용 호 157개) · 전용률 72.0%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 15.922
     · 아파트 / 벽체 [지상 8층] 7.3348
── A10025440 전용 84.772

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025440 --area 84.772

::error::A10025440 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025440 --area 84.772`
Exit status 1
── A10025266 전용 59.6236

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025266 --area 59.6236

▶ 더샵지제역센트럴파크3BL (A10025266) · 전용 59.6236㎡ · 41220-11900 · 지번 후보 0
   지번 0 (0000-0000) · 대지 → 줄 0개
   지번 0 (0000-0000) · 블록 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025266-59.json
   전유 59.87 + 주거공용 22.701 = 공급 82.57㎡ = 24.98평 → **25평**
   표본: 115동 2002 (같은 전용 호 116개) · 전용률 72.5%
     · 아파트 / 계단실 등 [지상 각층] 15.231
     · 아파트 / 벽체 [지상 20층] 7.4698
── A10025760 전용 84.2757

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025760 --area 84.2757

▶ 평택센트럴자이3단지 (A10025760) · 전용 84.2757㎡ · 41220-11900 · 지번 후보 852
   지번 852 (0852-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025760-84.json
   전유 84.276 + 주거공용 28.28 = 공급 112.56㎡ = 34.05평 → **34평**
   표본: 309동 2304 (같은 전용 호 15개) · 전용률 74.9%
     · 아파트 / 벽체,계단실 [지상 각층] 28.2799
── A10025760 전용 59.5152

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025760 --area 59.5152

▶ 평택센트럴자이3단지 (A10025760) · 전용 59.5152㎡ · 41220-11900 · 지번 후보 852
   지번 852 (0852-0000) · 대지 → 줄 2200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025760-59.json
   전유 59.515 + 주거공용 20.882 = 공급 80.4㎡ = 24.32평 → **24평**
   표본: 310동 1005 (같은 전용 호 114개) · 전용률 74.0%
     · 아파트 / 벽체,계단실 [지상 각층] 20.8823
── A10025311 전용 84.9718

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025311 --area 84.9718

▶ 평택지제역동문디이스트2단지 (A10025311) · 전용 84.9718㎡ · 41220-10500 · 지번 후보 559
   지번 559 (0559-0000) · 대지 → 줄 100개
::error::전용 84.9718㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 559) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025311 --area 84.9718`
Exit status 1
── A10026872 전용 84.9939

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026872 --area 84.9939

▶ 중흥S-클래스에코시티 아파트 (A10026872) · 전용 84.9939㎡ · 41220-12700 · 지번 후보 721
   지번 721 (0721-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026872-84.json
   전유 84.994 + 주거공용 27.185 = 공급 112.18㎡ = 33.93평 → **34평**
   표본: 101동 805 (같은 전용 호 272개) · 전용률 75.8%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 19.066
     · 아파트 / 벽체 [지상 8층] 8.1192
── A45907001 전용 84.9448

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A45907001 --area 84.9448

▶ 장안마을코오롱하늘채 (A45907001) · 전용 84.9448㎡ · 41220-10800 · 지번 후보 619
   지번 619 (0619-0000) · 대지 → 줄 2200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A45907001-84.json
   전유 84.945 + 주거공용 29.475 = 공급 114.42㎡ = 34.61평 → **35평**
   표본: 1024동 102 (같은 전용 호 208개) · 전용률 74.2%
     · 아파트 / 계단실,승강기,홀,벽체 [지상 각층] 29.4749
── A45974614 전용 84.514

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A45974614 --area 84.514

▶ 이충현대 (A45974614) · 전용 84.514㎡ · 41220-10900 · 지번 후보 1932-6, 481, 700-1, 818, 381
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 381 (0381-0000) · 대지 → 줄 1200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A45974614-84.json
   전유 84.514 + 주거공용 10.605 = 공급 95.12㎡ = 28.77평 → **29평**
   표본: 103동 206호 (같은 전용 호 58개) · 전용률 88.8%
     · 부대시설 / 복도,계단 [지상 2] 10.605
   ⚠️ 전용률 88.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10027738 전용 84.9986

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027738 --area 84.9986

▶ 평택용이금호어울림1단지 아파트 (A10027738) · 전용 84.9986㎡ · 41220-12400 · 지번 후보 581
   지번 581 (0581-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027738-84.json
   전유 84.999 + 주거공용 29.474 = 공급 114.47㎡ = 34.63평 → **35평**
   표본: 119동 702 (같은 전용 호 27개) · 전용률 74.3%
     · 아파트 / 계단실/EV홀 [지상 각층] 22.2036
     · 아파트 / 벽체 [지상 각층] 7.2708
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
── A45074007 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A45074007 --area 59.94

▶ 부영원앙아파트 (A45074007) · 전용 59.94㎡ · 41220-12000 · 지번 후보 518, 555
   지번 518 (0518-0000) · 대지 → 줄 0개
   지번 555 (0555-0000) · 대지 → 줄 2300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A45074007-59.json
   전유 59.94 + 주거공용 16.632 = 공급 76.57㎡ = 23.16평 → **23평**
   표본: 511동 503호 (같은 전용 호 286개) · 전용률 78.3%
     · 아파트 / 계단.복도.경비실.에레베이타 [각층] 16.632
── A45015008 전용 84.9833

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A45015008 --area 84.9833

▶ 평택센트럴해링턴플레이스 (A45015008) · 전용 84.9833㎡ · 41220-11800 · 지번 후보 1089
   지번 1089 (1089-0000) · 대지 → 줄 1100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A45015008-84.json
   전유 84.983 + 주거공용 26.588 = 공급 111.57㎡ = 33.75평 → **34평**
   표본: 105동 802 (같은 전용 호 183개) · 전용률 76.2%
     · 아파트 / 벽체,계단,로비 [지상 각층] 26.5884
── A45070602 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A45070602 --area 59.96

▶ 군문주공2단지 (A45070602) · 전용 59.96㎡ · 41220-11500 · 지번 후보 360
   지번 360 (0360-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A45070602-59.json
   전유 59.96 + 주거공용 12.233 = 공급 72.19㎡ = 21.84평 → **22평**
   표본: 215동 1003호 (같은 전용 호 289개) · 전용률 83.0%
     · 부대시설 / 계단실,승강기 [각층] 12.2335
── A10025151 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025151 --area 84.98

▶ 고덕국제신도시 제일풍경채아파트 (A10025151) · 전용 84.98㎡ · 41220-12800 · 지번 후보 1899-2
   지번 1899-2 (1899-0002) · 대지 → 줄 500개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025151-84.json
   전유 84.98 + 주거공용 25.571 = 공급 110.55㎡ = 33.44평 → **33평**
   표본: 122동 103 (같은 전용 호 37개) · 전용률 76.9%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 17.3313
     · 아파트 / 벽체 [지상 1층] 8.24
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
── A10023536 전용 84.4559

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023536 --area 84.4559

▶ 광명푸르지오센트베르아파트 (A10023536) · 전용 84.4559㎡ · 41210-10100 · 지번 후보 788-1, 322
   지번 788-1 (0788-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023536-84.json
   전유 84.456 + 주거공용 28.04 = 공급 112.5㎡ = 34.03평 → **34평**
   표본: 102동 902 (같은 전용 호 89개) · 전용률 75.1%
     · 아파트 / 계단,복도 [지상 각층] 19.7223
     · 아파트 / 벽체 [지상 9층] 8.3179
── A10023884 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023884 --area 84.98

▶ 철산역 롯데캐슬 & SK VIEW 클래스티지 (A10023884) · 전용 84.98㎡ · 41210-10200 · 지번 후보 639-1
   지번 639-1 (0639-0001) · 대지 → 줄 2600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023884-84.json
   전유 84.98 + 주거공용 28.583 = 공급 113.56㎡ = 34.35평 → **34평**
   표본: 111동 2102 (같은 전용 호 106개) · 전용률 74.8%
     · 아파트 / 계단실 [지상 각층] 19.6827
     · 아파트 / 벽체 [지상 21층] 8.9
── A10023884 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023884 --area 59.98

▶ 철산역 롯데캐슬 & SK VIEW 클래스티지 (A10023884) · 전용 59.98㎡ · 41210-10200 · 지번 후보 639-1
   지번 639-1 (0639-0001) · 대지 → 줄 0개
::error::지번 후보 639-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023884 --area 59.98`
Exit status 1
── A10024531 전용 59.9915

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024531 --area 59.9915

▶ 광명아크포레자이위브아파트 (A10024531) · 전용 59.9915㎡ · 41210-10100 · 지번 후보 787-4
   지번 787-4 (0787-0004) · 대지 → 줄 0개
::error::지번 후보 787-4 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024531 --area 59.9915`
Exit status 1
── A10024531 전용 84.9935

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024531 --area 84.9935

▶ 광명아크포레자이위브아파트 (A10024531) · 전용 84.9935㎡ · 41210-10100 · 지번 후보 787-4
   지번 787-4 (0787-0004) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024531-84.json
   전유 84.993 + 주거공용 20.521 = 공급 105.51㎡ = 31.92평 → **32평**
   표본: 1106동 703 (같은 전용 호 97개) · 전용률 80.5%
     · 아파트 / 계단,복도 [각층 각층] 13.7915
     · 아파트 / 벽체 [지상 7층] 6.7294
── A10025825 전용 59.9968

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025825 --area 59.9968

▶ 광명역센트럴자이아파트 (A10025825) · 전용 59.9968㎡ · 41210-10600 · 지번 후보 517
::error::공공데이터포털 **일일 호출 한도**에 걸렸습니다(문구는 SERVICE_KEY_IS_NOT_REGISTERED 로 나오지만 키 문제가 아닙니다). 내일 cron 이 다시 받습니다.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025825 --area 59.9968`
Exit status 1
── A10025825 전용 84.9933

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025825 --area 84.9933

▶ 광명역센트럴자이아파트 (A10025825) · 전용 84.9933㎡ · 41210-10600 · 지번 후보 517
::error::공공데이터포털 **일일 호출 한도**에 걸렸습니다(문구는 SERVICE_KEY_IS_NOT_REGISTERED 로 나오지만 키 문제가 아닙니다). 내일 cron 이 다시 받습니다.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025825 --area 84.9933`
Exit status 1
── A42385203 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385203 --area 84.41

▶ 하안주공8단지 (A42385203) · 전용 84.41㎡ · 41210-10300 · 지번 후보 260
::error::공공데이터포털 **일일 호출 한도**에 걸렸습니다(문구는 SERVICE_KEY_IS_NOT_REGISTERED 로 나오지만 키 문제가 아닙니다). 내일 cron 이 다시 받습니다.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42385203 --area 84.41`
Exit status 1
── A42381904 전용 56.49

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42381904 --area 56.49

▶ 광명중앙하이츠 (A42381904) · 전용 56.49㎡ · 41210-10100 · 지번 후보 713
::error::공공데이터포털 **일일 호출 한도**에 걸렸습니다(문구는 SERVICE_KEY_IS_NOT_REGISTERED 로 나오지만 키 문제가 아닙니다). 내일 cron 이 다시 받습니다.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42381904 --area 56.49`
Exit status 1
⏳ 시간 예산(1200초)에 닿아 958줄은 다음 칸으로 미룹니다
```
