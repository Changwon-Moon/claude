# 단지 공급면적 — 마지막 실행

- 성공 5건 · 실패 4건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10025310 전용 59.9335

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025310 --area 59.9335

▶ 백련산 에스케이뷰 아이파크 (A10025310) · 전용 59.9335㎡ · 11380-10700 · 지번 후보 767
   지번 767 (0767-0000) · 대지 → 줄 0개
::error::지번 후보 767 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025310 --area 59.9335`
Exit status 1
── A10022853 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022853 --area 59.98

▶ 산성역 자이푸르지오2단지 (A10022853) · 전용 59.98㎡ · 41131-10100 · 지번 후보 6963
   지번 6963 (6963-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022853-59.json
   전유 59.98 + 주거공용 19.426 = 공급 79.41㎡ = 24.02평 → **24평**
   표본: 205동 2002 (같은 전용 호 265개) · 전용률 75.5%
     · 아파트 / 계단실 [지상 각층] 14.0757
     · 아파트 / 벽체 [지상 20층] 5.35
── A10028139 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028139 --area 84.88

▶ 미사강변골든센트로 (A10028139) · 전용 84.88㎡ · 41450-10900 · 지번 후보 1162
   지번 1162 (1162-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028139-84.json
   전유 84.88 + 주거공용 34.061 = 공급 118.94㎡ = 35.98평 → **36평**
   표본: 2814동 3002 (같은 전용 호 16개) · 전용률 71.4%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 31.868
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 2.193
── A15681110 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15681110 --area 84.92

▶ 대방대림 (A15681110) · 전용 84.92㎡ · 11590-10800 · 지번 후보 501
   지번 501 (0501-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15681110-84.json
   전유 84.92 + 주거공용 22.05 = 공급 106.97㎡ = 32.36평 → **32평**
   표본: 101동 1104호 (같은 전용 호 2개) · 전용률 79.4%
     · 생활편익시설 / 계단 [각층 각층] 16.8
     · 부대시설 / 지하실 [지하 지1층] 5.25
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) · 대지 → 줄 0개
::error::지번 후보 271-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) · 대지 → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) · 대지 → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 · 지번 후보 6029, 5869-2
   지번 6029 (6029-0000) · 대지 → 줄 800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026600-84.json
   전유 84.99 + 주거공용 29.086 = 공급 114.08㎡ = 34.51평 → **35평**
   표본: 2206동 1403 (같은 전용 호 63개) · 전용률 74.5%
     · 아파트 / 코아 [지상 각층] 21.6163
     · 아파트 / 외벽 [지상 14층] 6.14
     · 부대시설 / 지하코아 [지하 지1] 1.3295
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 2개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
```
