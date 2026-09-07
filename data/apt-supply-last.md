# 단지 공급면적 — 마지막 실행

- 성공 86건 · 실패 25건 · 미룸 1180줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
㎡ · 41461-10600 · 지번 후보 503-38
   지번 503-38 (0503-0038) · 대지 → 줄 0개
::error::지번 후보 503-38 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022829 --area 59.8007`
Exit status 1
── A10022690 전용 84.8409

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022690 --area 84.8409

▶ 용인보평역서희스타힐스리버파크 (A10022690) · 전용 84.8409㎡ · 41461-10500 · 지번 후보 330-1
   지번 330-1 (0330-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022690-84.json
   전유 84.841 + 주거공용 31.608 = 공급 116.45㎡ = 35.23평 → **35평**
   표본: 117동 1901 (같은 전용 호 27개) · 전용률 72.9%
     · 아파트 / 계단실,복도 [지상 각층] 24.5257
     · 아파트 / 벽체공용 [지상 19층] 7.0821
── A10022690 전용 59.9806

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022690 --area 59.9806

▶ 용인보평역서희스타힐스리버파크 (A10022690) · 전용 59.9806㎡ · 41461-10500 · 지번 후보 330-1
   지번 330-1 (0330-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022690-59.json
   전유 59.981 + 주거공용 23.179 = 공급 83.16㎡ = 25.16평 → **25평**
   표본: 111동 503 (같은 전용 호 214개) · 전용률 72.1%
     · 아파트 / 계단실,복도 [지상 각층] 17.3391
     · 아파트 / 벽체공용 [지상 5층] 5.8397
── A10023051 전용 84.4547

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023051 --area 84.4547

▶ 역북동 서희스타힐스포레스트아파트 (A10023051) · 전용 84.4547㎡ · 41461-10200 · 지번 후보 826, 233
   지번 826 (0826-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023051-84.json
   전유 84.455 + 주거공용 28.88 = 공급 113.33㎡ = 34.28평 → **34평**
   표본: 205동 1602 (같은 전용 호 45개) · 전용률 74.5%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 21.7509
     · 아파트 / 벽체 [지상 16층] 7.1293
── A10023051 전용 59.9957

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023051 --area 59.9957

▶ 역북동 서희스타힐스포레스트아파트 (A10023051) · 전용 59.9957㎡ · 41461-10200 · 지번 후보 826, 233
   지번 826 (0826-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023051-59.json
   전유 59.996 + 주거공용 21.497 = 공급 81.49㎡ = 24.65평 → **25평**
   표본: 207동 804 (같은 전용 호 130개) · 전용률 73.6%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 15.4516
     · 아파트 / 벽체 [지상 8층] 6.0454
── A10025660 전용 84.9704

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025660 --area 84.9704

▶ 양우내안애에듀퍼스트 (A10025660) · 전용 84.9704㎡ · 41461-10600 · 지번 후보 1014
   지번 1014 (1014-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025660-84.json
   전유 84.97 + 주거공용 31.689 = 공급 116.66㎡ = 35.29평 → **35평**
   표본: 209동 1904 (같은 전용 호 97개) · 전용률 72.8%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 23.6604
     · 아파트 / 벽체 [지상 19층] 8.0288
── A10026630 전용 84.9894

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026630 --area 84.9894

▶ 우미 린 센트럴파크 (A10026630) · 전용 84.9894㎡ · 41461-10200 · 지번 후보 736
   지번 736 (0736-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026630-84.json
   전유 84.989 + 주거공용 29.245 = 공급 114.23㎡ = 34.56평 → **35평**
   표본: 109동 803 (같은 전용 호 187개) · 전용률 74.4%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 21.0483
     · 아파트 / 벽체 [지상 8층] 8.1966
── A10026630 전용 59.9809

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026630 --area 59.9809

▶ 우미 린 센트럴파크 (A10026630) · 전용 59.9809㎡ · 41461-10200 · 지번 후보 736
   지번 736 (0736-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026630-59.json
   전유 59.981 + 주거공용 20.711 = 공급 80.69㎡ = 24.41평 → **24평**
   표본: 103동 605 (같은 전용 호 79개) · 전용률 74.3%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 14.8547
     · 아파트 / 벽체 [지상 6층] 5.8567
── A10026640 전용 84.8492

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026640 --area 84.8492

▶ 역북 푸르지오 (A10026640) · 전용 84.8492㎡ · 41461-10200 · 지번 후보 809
   지번 809 (0809-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026640-84.json
   전유 84.849 + 주거공용 29.394 = 공급 114.24㎡ = 34.56평 → **35평**
   표본: 103동 102 (같은 전용 호 114개) · 전용률 74.3%
     · 아파트 / 계단실,전실 [지상 각층] 22.5452
     · 아파트 / 벽체 [지상 1층] 6.8486
── A10026640 전용 59.9272

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026640 --area 59.9272

▶ 역북 푸르지오 (A10026640) · 전용 59.9272㎡ · 41461-10200 · 지번 후보 809
   지번 809 (0809-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026640-59.json
   전유 59.927 + 주거공용 21.005 = 공급 80.93㎡ = 24.48평 → **24평**
   표본: 105동 2405 (같은 전용 호 86개) · 전용률 74.1%
     · 아파트 / 계단실,전실 [지상 각층] 15.9232
     · 아파트 / 벽체 [지상 24층] 5.0813
── A10026784 전용 59.83

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026784 --area 59.83

▶ 미사강변해링턴플레이스아파트 (A10026784) · 전용 59.83㎡ · 41450-10900 · 지번 후보 1170
   지번 1170 (1170-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026784-59.json
   전유 59.83 + 주거공용 22.483 = 공급 82.31㎡ = 24.9평 → **25평**
   표본: 2910동 205 (같은 전용 호 98개) · 전용률 72.7%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 21.7526
     · 아파트 / 지하주출입구연결통로 [지하 지1] 0.7306
── A10026784 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026784 --area 84.92

▶ 미사강변해링턴플레이스아파트 (A10026784) · 전용 84.92㎡ · 41450-10900 · 지번 후보 1170
   지번 1170 (1170-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026784-84.json
   전유 84.92 + 주거공용 31.912 = 공급 116.83㎡ = 35.34평 → **35평**
   표본: 2905동 1401 (같은 전용 호 102개) · 전용률 72.7%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 30.8746
     · 아파트 / 지하주출입구연결통로 [지하 지1] 1.0369
── A10026619 전용 84.9917

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026619 --area 84.9917

▶ 미사 레스티아 아파트 (A10026619) · 전용 84.9917㎡ · 41450-10900 · 지번 후보 1177
   지번 1177 (1177-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026619-84.json
   전유 84.992 + 주거공용 28.765 = 공급 113.76㎡ = 34.41평 → **34평**
   표본: 3107동 204 (같은 전용 호 314개) · 전용률 74.7%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 21.2663
     · 아파트 / 벽체 [지상 2층] 7.4989
── A10026619 전용 60.8988

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026619 --area 60.8988

▶ 미사 레스티아 아파트 (A10026619) · 전용 60.8988㎡ · 41450-10900 · 지번 후보 1177
   지번 1177 (1177-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026619-59.json
   전유 60.899 + 주거공용 23.577 = 공급 84.48㎡ = 25.55평 → **26평**
   표본: 3110동 1304 (같은 전용 호 60개) · 전용률 72.1%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 17.5189
     · 아파트 / 벽체 [지상 13층] 6.0577
── A46572201 전용 84.83

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46572201 --area 84.83

▶ 하남대명강변타운 (A46572201) · 전용 84.83㎡ · 41450-10600 · 지번 후보 569
   지번 569 (0569-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46572201-84.json
   전유 84.83 + 주거공용 26.764 = 공급 111.59㎡ = 33.76평 → **34평**
   표본: 102동 702 (같은 전용 호 336개) · 전용률 76.0%
     · 아파트 / 계단,승강기 [각층 각층] 15.3338
     · 아파트 / 벽체,전실,발코니 [각층 각층] 11.43
── A10027344 전용 84.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027344 --area 84.89

▶ 미사강변센트리버 (A10027344) · 전용 84.89㎡ · 41450-11200 · 지번 후보 436
   지번 436 (0436-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027344-84.json
   전유 84.89 + 주거공용 30.45 = 공급 115.34㎡ = 34.89평 → **35평**
   표본: 708동 803 (같은 전용 호 184개) · 전용률 73.6%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 30.4503
── A10027180 전용 59.79

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027180 --area 59.79

▶ 미사강변스타힐스 (A10027180) · 전용 59.79㎡ · 41450-10900 · 지번 후보 956
   지번 956 (0956-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027180-59.json
   전유 59.79 + 주거공용 22.688 = 공급 82.48㎡ = 24.95평 → **25평**
   표본: 801동 1301 (같은 전용 호 70개) · 전용률 72.5%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 22.6883
── A10027782 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027782 --area 84.96

▶ 미사강변 루나리움 (A10027782) · 전용 84.96㎡ · 41450-10900 · 지번 후보 1034
   지번 1034 (1034-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027782-84.json
   전유 84.96 + 주거공용 27.586 = 공급 112.55㎡ = 34.05평 → **34평**
   표본: 503동 2301 (같은 전용 호 198개) · 전용률 75.5%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 27.5857
── A10027379 전용 84.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027379 --area 84.85

▶ 미사강변 센텀팰리스 (A10027379) · 전용 84.85㎡ · 41450-10900 · 지번 후보 1050
   지번 1050 (1050-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027379-84.json
   전유 84.85 + 주거공용 26.58 = 공급 111.43㎡ = 33.71평 → **34평**
   표본: 1806동 1401 (같은 전용 호 258개) · 전용률 76.1%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 26.5803
── A10028139 전용 59.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028139 --area 59.8

▶ 미사강변골든센트로 (A10028139) · 전용 59.8㎡ · 41450-10900 · 지번 후보 1162
   지번 1162 (1162-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028139-59.json
   전유 59.8 + 주거공용 22.452 = 공급 82.25㎡ = 24.88평 → **25평**
   표본: 2805동 802 (같은 전용 호 147개) · 전용률 72.7%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 22.4517
── A10025188 전용 84.9858

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025188 --area 84.9858

▶ 인덕원푸르지오 엘센트로아파트 (A10025188) · 전용 84.9858㎡ · 41430-10900 · 지번 후보 487-22
   지번 487-22 (0487-0022) · 대지 → 줄 0개
::error::지번 후보 487-22 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025188 --area 84.9858`
Exit status 1
── A43772723 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43772723 --area 84.94

▶ 의왕동백 (A43772723) · 전용 84.94㎡ · 41430-10500 · 지번 후보 849
   지번 849 (0849-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43772723-84.json
   전유 84.94 + 주거공용 14.674 = 공급 99.61㎡ = 30.13평 → **30평**
   표본: 112동 706호 (같은 전용 호 410개) · 전용률 85.3%
     · 부대시설 / 계단,복도 [각층] 14.674
   ⚠️ 전용률 85.3% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10025761 전용 84.9973

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025761 --area 84.9973

▶ 의왕역 푸르지오 라포레 (A10025761) · 전용 84.9973㎡ · 41430-10300 · 지번 후보 38
   지번 38 (0038-0000) · 대지 → 줄 0개
::error::지번 후보 38 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025761 --area 84.9973`
Exit status 1
── A43708008 전용 59.951

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43708008 --area 59.951

▶ 인덕원센트럴자이 (A43708008) · 전용 59.951㎡ · 41430-10700 · 지번 후보 844
   지번 844 (0844-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43708008-59.json
   전유 59.951 + 주거공용 25.839 = 공급 85.79㎡ = 25.95평 → **26평**
   표본: 203동 704 (같은 전용 호 100개) · 전용률 69.9%
     · 아파트 / 계단실,승강기 [지상 각층] 20.839
     · 아파트 / 벽체 [지상 각층] 5
   ⚠️ 전용률 69.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A43770703 전용 84.761

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43770703 --area 84.761

▶ 이편한세상인덕원더퍼스트 (A43770703) · 전용 84.761㎡ · 41430-10700 · 지번 후보 846
   지번 846 (0846-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43770703-84.json
   전유 84.761 + 주거공용 33.744 = 공급 118.5㎡ = 35.85평 → **36평**
   표본: 1405동 504 (같은 전용 호 155개) · 전용률 71.5%
     · 아파트 / 계단실/ELEV [각층 각층] 20.331
     · 아파트 / 초과발코니 [각층 각층] 7.692
     · 아파트 / 벽체 [각층 각층] 5.721
── A43770703 전용 59.707

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43770703 --area 59.707

▶ 이편한세상인덕원더퍼스트 (A43770703) · 전용 59.707㎡ · 41430-10700 · 지번 후보 846
   지번 846 (0846-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43770703-59.json
   전유 59.707 + 주거공용 25.06 = 공급 84.77㎡ = 25.64평 → **26평**
   표본: 1403동 2402 (같은 전용 호 58개) · 전용률 70.4%
     · 아파트 / 계단실/ELEV [각층 각층] 16.523
     · 아파트 / 벽체 [각층 각층] 6.401
     · 아파트 / 초과발코니 [각층 각층] 2.136
── A43571004 전용 84.209

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43571004 --area 84.209

▶ 광정목련한양 (A43571004) · 전용 84.209㎡ · 41410-10400 · 지번 후보 1088
   지번 1088 (1088-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43571004-84.json
   전유 84.209 + 주거공용 11.62 = 공급 95.83㎡ = 28.99평 → **29평**
   표본: 1228동 103호 (같은 전용 호 1개) · 전용률 87.9%
     · / 계단, 복도 [각층] 11.62
   ⚠️ 전용률 87.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A43575403 전용 84.209

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43575403 --area 84.209

▶ 수리한양 (A43575403) · 전용 84.209㎡ · 41410-10400 · 지번 후보 1151-5
   지번 1151-5 (1151-0005) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43575403-84.json
   전유 84.209 + 주거공용 12.227 = 공급 96.44㎡ = 29.17평 → **29평**
   표본: 804동 103호 (같은 전용 호 1개) · 전용률 87.3%
     · / 계단, 복도 [지상 1층] 12.227
   ⚠️ 전용률 87.3% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A43576005 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43576005 --area 59.98

▶ 산본한라2차 (A43576005) · 전용 59.98㎡ · 41410-10400 · 지번 후보 1156-15
   지번 1156-15 (1156-0015) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43576005-59.json
   전유 59.98 + 주거공용 21.315 = 공급 81.29㎡ = 24.59평 → **25평**
   표본: 412동 602호 (같은 전용 호 338개) · 전용률 73.8%
     · 아파트 / 복도,계단,승강기등 [] 21.3147
── A43575904 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43575904 --area 59.97

▶ 산본4단지한라1차 (A43575904) · 전용 59.97㎡ · 41410-10400 · 지번 후보 1156-1
   지번 1156-1 (1156-0001) · 대지 → 줄 2496개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43575904-59.json
   전유 59.97 + 주거공용 28.42 = 공급 88.39㎡ = 26.74평 → **27평**
   표본: 408동 1401호 (같은 전용 호 45개) · 전용률 67.8%
     · / [] 28.42
   ⚠️ 전용률 67.8% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A43504005 전용 58.19

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43504005 --area 58.19

▶ 산본금강1차 (A43504005) · 전용 58.19㎡ · 41410-10400 · 지번 후보 1148-4
   지번 1148-4 (1148-0004) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43504005-59.json
   전유 58.19 + 주거공용 22.74 = 공급 80.93㎡ = 24.48평 → **24평**
   표본: 903동 404호 (같은 전용 호 264개) · 전용률 71.9%
     · 아파트 / 복도,계단,승강기등 [] 17.71
     · 부대시설 / 지하층 [] 5.03
── A43574805 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43574805 --area 58.01

▶ 산본11단지주공 (A43574805) · 전용 58.01㎡ · 41410-10400 · 지번 후보 1052
   지번 1052 (1052-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43574805-59.json
   전유 58.01 + 주거공용 22.17 = 공급 80.18㎡ = 24.25평 → **24평**
   표본: 1109동 1301호 (같은 전용 호 415개) · 전용률 72.4%
     · / [] 22.17
── A43573107 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43573107 --area 84.9

▶ 산본7단지 우륵아파트 (A43573107) · 전용 84.9㎡ · 41410-10400 · 지번 후보 1146-11
   지번 1146-11 (1146-0011) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43573107-84.json
   전유 84.9 + 주거공용 21.13 = 공급 106.03㎡ = 32.07평 → **32평**
   표본: 708동 1604호 (같은 전용 호 37개) · 전용률 80.1%
     · / 복도,계단,승강기 등 [] 16.96
     · 부대시설 / 지하층 [] 4.17
── A43573107 전용 58.71

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43573107 --area 58.71

▶ 산본7단지 우륵아파트 (A43573107) · 전용 58.71㎡ · 41410-10400 · 지번 후보 1146-11
   지번 1146-11 (1146-0011) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43573107-59.json
   전유 58.71 + 주거공용 22.77 = 공급 81.48㎡ = 24.65평 → **25평**
   표본: 712동 402호 (같은 전용 호 447개) · 전용률 72.0%
     · / 복도, 계단, 승강기등 [] 22.77
── A43504006 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43504006 --area 84.9

▶ 산본세종 (A43504006) · 전용 84.9㎡ · 41410-10400 · 지번 후보 1145
   지번 1145 (1145-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43504006-84.json
   전유 84.9 + 주거공용 16.96 = 공급 101.86㎡ = 30.81평 → **31평**
   표본: 633동 1003호 (같은 전용 호 62개) · 전용률 83.4%
     · 부대시설 / 복도,계단,승강기 [] 16.96
── A43504006 전용 58.71

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43504006 --area 58.71

▶ 산본세종 (A43504006) · 전용 58.71㎡ · 41410-10400 · 지번 후보 1145
   지번 1145 (1145-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43504006-59.json
   전유 58.71 + 주거공용 22.77 = 공급 81.48㎡ = 24.65평 → **25평**
   표본: 650동 601호 (같은 전용 호 414개) · 전용률 72.0%
     · / 복도, 계단, 승강기등 [] 22.77
── A43576808 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43576808 --area 84.95

▶ 산본래미안하이어스 (A43576808) · 전용 84.95㎡ · 41410-10400 · 지번 후보 1240
   지번 1240 (1240-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43576808-84.json
   전유 84.95 + 주거공용 27.926 = 공급 112.88㎡ = 34.14평 → **34평**
   표본: 110동 1501 (같은 전용 호 176개) · 전용률 75.3%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 27.926
── A43576808 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43576808 --area 59.94

▶ 산본래미안하이어스 (A43576808) · 전용 59.94㎡ · 41410-10400 · 지번 후보 1240
   지번 1240 (1240-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43576808-59.json
   전유 59.94 + 주거공용 27.714 = 공급 87.65㎡ = 26.52평 → **27평**
   표본: 114동 1103 (같은 전용 호 84개) · 전용률 68.4%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 27.714
   ⚠️ 전용률 68.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A43576807 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43576807 --area 59.98

▶ 산본13단지개나리 (A43576807) · 전용 59.98㎡ · 41410-10400 · 지번 후보 1066
   지번 1066 (1066-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43576807-59.json
   전유 59.98 + 주거공용 17.63 = 공급 77.61㎡ = 23.48평 → **23평**
   표본: 1331동 202호 (같은 전용 호 278개) · 전용률 77.3%
     · 부대시설 / 복도,계단,승강기 [지상 2층] 17.63
── A43574905 전용 58.46

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43574905 --area 58.46

▶ 가야1차 (A43574905) · 전용 58.46㎡ · 41410-10400 · 지번 후보 1155
   지번 1155 (1155-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43574905-59.json
   전유 58.46 + 주거공용 16.78 = 공급 75.24㎡ = 22.76평 → **23평**
   표본: 514동 1004호 (같은 전용 호 91개) · 전용률 77.7%
     · 부대시설 / 복도,계단,승강기 [] 16.78
── A43501009 전용 84.969

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43501009 --area 84.969

▶ 당동용호마을e편한세상 (A43501009) · 전용 84.969㎡ · 41410-10100 · 지번 후보 979-1
   지번 979-1 (0979-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43501009-84.json
   전유 84.969 + 주거공용 24.763 = 공급 109.73㎡ = 33.19평 → **33평**
   표본: 120동 204 (같은 전용 호 189개) · 전용률 77.4%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 18.86
     · 아파트 / 벽체 [각층 각층] 5.293
     · 아파트 / 경로당,문고,주민공동시설 [지하 지1층] 0.61
── A43501009 전용 59.895

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43501009 --area 59.895

▶ 당동용호마을e편한세상 (A43501009) · 전용 59.895㎡ · 41410-10100 · 지번 후보 979-1
   지번 979-1 (0979-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43501009-59.json
   전유 59.895 + 주거공용 19.887 = 공급 79.78㎡ = 24.13평 → **24평**
   표본: 115동 1404 (같은 전용 호 82개) · 전용률 75.1%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 14.892
     · 아파트 / 벽체 [각층 각층] 4.566
     · 아파트 / 경로당,문고,주민공동시설 [지하 지1층] 0.429
── A43576205 전용 58.65

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43576205 --area 58.65

▶ 산본무궁화주공1단지 (A43576205) · 전용 58.65㎡ · 41410-10500 · 지번 후보 849
   지번 849 (0849-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43576205-59.json
   전유 58.65 + 주거공용 22.63 = 공급 81.28㎡ = 24.59평 → **25평**
   표본: 107동 1403호 (같은 전용 호 88개) · 전용률 72.2%
     · / [] 22.63
── A43575706 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43575706 --area 59.97

▶ 군포율곡 (A43575706) · 전용 59.97㎡ · 41410-10500 · 지번 후보 876
   지번 876 (0876-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43575706-59.json
   전유 59.97 + 주거공용 17.933 = 공급 77.9㎡ = 23.57평 → **24평**
   표본: 347동 1004호 (같은 전용 호 41개) · 전용률 77.0%
     · / 복도, 계단, 승강기, 경비실 [] 17.9334
── A10026125 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026125 --area 84.87

▶ 네이처포레 아파트 (A10026125) · 전용 84.87㎡ · 41390-10600 · 지번 후보 632
   지번 632 (0632-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026125-84.json
   전유 84.87 + 주거공용 32.577 = 공급 117.45㎡ = 35.53평 → **36평**
   표본: 1110동 2804 (같은 전용 호 57개) · 전용률 72.3%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 32.5772
── A10025502 전용 59.9419

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025502 --area 59.9419

▶ 시흥배곧신도시 대방노블랜드엘리트시티 (A10025502) · 전용 59.9419㎡ · 41390-13500 · 지번 후보 55
   지번 55 (0055-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025502-59.json
   전유 59.942 + 주거공용 25.997 = 공급 85.94㎡ = 26평 → **26평**
   표본: 607동 2301 (같은 전용 호 333개) · 전용률 69.8%
     · 아파트 / 계단실 [지상 각층] 16.3707
     · 아파트 / 벽체 [지상 각층] 6.3497
     · 부대시설 / 지하창고 [지하 지1] 3.2762
   ⚠️ 전용률 69.7% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10024498 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024498 --area 59.96

▶ 은계파크자이아파트 (A10024498) · 전용 59.96㎡ · 41390-10600 · 지번 후보 647
   지번 647 (0647-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024498-59.json
   전유 59.96 + 주거공용 24.064 = 공급 84.02㎡ = 25.42평 → **25평**
   표본: 602동 1703 (같은 전용 호 146개) · 전용률 71.4%
     · 아파트 / 벽체,계단실 [각층 각층] 23.3042
     · 아파트 / 지하계단 [지하 지1] 0.7597
── A10024498 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024498 --area 84.95

▶ 은계파크자이아파트 (A10024498) · 전용 84.95㎡ · 41390-10600 · 지번 후보 647
   지번 647 (0647-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024498-84.json
   전유 84.95 + 주거공용 32.813 = 공급 117.76㎡ = 35.62평 → **36평**
   표본: 606동 1103 (같은 전용 호 184개) · 전용률 72.1%
     · 아파트 / 벽체,계단실 [각층 각층] 31.7362
     · 아파트 / 지하계단 [지하 지1] 1.0763
── A10024845 전용 84.941

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024845 --area 84.941

▶ 시흥센트럴푸르지오아파트 (A10024845) · 전용 84.941㎡ · 41390-10100 · 지번 후보 418-21
   지번 418-21 (0418-0021) · 대지 → 줄 0개
::error::지번 후보 418-21 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024845 --area 84.941`
Exit status 1
── A10024845 전용 59.948

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024845 --area 59.948

▶ 시흥센트럴푸르지오아파트 (A10024845) · 전용 59.948㎡ · 41390-10100 · 지번 후보 418-21
   지번 418-21 (0418-0021) · 대지 → 줄 0개
::error::지번 후보 418-21 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024845 --area 59.948`
Exit status 1
── A10025841 전용 84.6698

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025841 --area 84.6698

▶ 시흥은계한양수자인더클래스아파트 (A10025841) · 전용 84.6698㎡ · 41390-10600 · 지번 후보 217-14
   지번 217-14 (0217-0014) · 대지 → 줄 0개
::error::지번 후보 217-14 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025841 --area 84.6698`
Exit status 1
── A42983405 전용 84.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42983405 --area 84.86

▶ 월곶풍림1차아파트 (A42983405) · 전용 84.86㎡ · 41390-13100 · 지번 후보 1010-4
   지번 1010-4 (1010-0004) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42983405-84.json
   전유 84.86 + 주거공용 15.997 = 공급 100.86㎡ = 30.51평 → **31평**
   표본: 101동 1602호 (같은 전용 호 6개) · 전용률 84.1%
     · 아파트 / 계단실,승강기 [각층] 14.877
     · 아파트 / 피디 [각층] 1.12
── A10025100 전용 84.74

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025100 --area 84.74

▶ 은계어반리더스아파트 (A10025100) · 전용 84.74㎡ · 41390-10100 · 지번 후보 659
   지번 659 (0659-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025100-84.json
   전유 84.74 + 주거공용 26.944 = 공급 111.68㎡ = 33.78평 → **34평**
   표본: 108동 401 (같은 전용 호 156개) · 전용률 75.9%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 26.9443
── A42979803 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42979803 --area 84.48

▶ 하상연꽃마을대우삼호 (A42979803) · 전용 84.48㎡ · 41390-12000 · 지번 후보 368
   지번 368 (0368-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42979803-84.json
   전유 84.48 + 주거공용 15.439 = 공급 99.92㎡ = 30.23평 → **30평**
   표본: 315동 1203호 (같은 전용 호 52개) · 전용률 84.5%
     · 아파트 / 승강기,계단실 [각층] 15.439
── A42980007 전용 59.72

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42980007 --area 59.72

▶ 거모동보 (A42980007) · 전용 59.72㎡ · 41390-12700 · 지번 후보 612-1
   지번 612-1 (0612-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42980007-59.json
   전유 59.72 + 주거공용 14.604 = 공급 74.32㎡ = 22.48평 → **22평**
   표본: 107동 201호 (같은 전용 호 63개) · 전용률 80.3%
     · 아파트 / 코아 [각층] 14.6042
── A10026419 전용 84.7387

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026419 --area 84.7387

▶ 한라비발디캠퍼스2차아파트 (A10026419) · 전용 84.7387㎡ · 41390-13500 · 지번 후보 245
   지번 245 (0245-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026419-84.json
   전유 84.739 + 주거공용 34.256 = 공급 118.99㎡ = 36평 → **36평**
   표본: 208동 303 (같은 전용 호 186개) · 전용률 71.2%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 25.6244
     · 아파트 / 벽체 [지상 3층] 8.6317
── A42979803 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42979803 --area 59.88

▶ 하상연꽃마을대우삼호 (A42979803) · 전용 59.88㎡ · 41390-12000 · 지번 후보 368
   지번 368 (0368-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42979803-59.json
   전유 59.88 + 주거공용 14.042 = 공급 73.92㎡ = 22.36평 → **22평**
   표본: 318동 1701호 (같은 전용 호 273개) · 전용률 81.0%
     · 아파트 / 승강기,계단실 [각층] 14.042
── A42946002 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42946002 --area 84.99

▶ 시흥6차푸르지오1단지 (A42946002) · 전용 84.99㎡ · 41390-13300 · 지번 후보 759
   지번 759 (0759-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42946002-84.json
   전유 84.99 + 주거공용 28.275 = 공급 113.26㎡ = 34.26평 → **34평**
   표본: 106동 1004 (같은 전용 호 298개) · 전용률 75.0%
     · 아파트 / 계단실,복도 [지상 각층] 22.395
     · 아파트 / 벽체 [지상 각층] 5.88
── A42946002 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42946002 --area 59.98

▶ 시흥6차푸르지오1단지 (A42946002) · 전용 59.98㎡ · 41390-13300 · 지번 후보 759
   지번 759 (0759-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42946002-59.json
   전유 59.98 + 주거공용 24.017 = 공급 84㎡ = 25.41평 → **25평**
   표본: 117동 2202 (같은 전용 호 74개) · 전용률 71.4%
     · 아파트 / 계단실,복도 [지상 각층] 18.7368
     · 아파트 / 벽체 [지상 각층] 5.28
── A42984208 전용 59.965

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42984208 --area 59.965

▶ 숲속마을벽산신화 (A42984208) · 전용 59.965㎡ · 41390-13000 · 지번 후보 271-3, 807
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 807 (0807-0000) · 대지 → 줄 3000개
::error::전용 59.965㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 807) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42984208 --area 59.965`
Exit status 1
── A10026569 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026569 --area 84.88

▶ 은계센트럴타운 (A10026569) · 전용 84.88㎡ · 41390-10600 · 지번 후보 619
   지번 619 (0619-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026569-84.json
   전유 84.88 + 주거공용 31.585 = 공급 116.47㎡ = 35.23평 → **35평**
   표본: 511동 102 (같은 전용 호 110개) · 전용률 72.9%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 31.5851
── A42987813 전용 84.7561

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42987813 --area 84.7561

▶ 은행4차푸르지오 (A42987813) · 전용 84.7561㎡ · 41390-10600 · 지번 후보 599-1
   지번 599-1 (0599-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42987813-84.json
   전유 84.756 + 주거공용 22.343 = 공급 107.1㎡ = 32.4평 → **32평**
   표본: 415동 502호 (같은 전용 호 201개) · 전용률 79.1%
     · 아파트 / 계단실,승강기,벽체 [각층 각층] 21.4068
     · 아파트 / 홀 [지하 지1층] 0.9366
── A42983404 전용 84.829

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42983404 --area 84.829

▶ 월곶2차풍림아이원 (A42983404) · 전용 84.829㎡ · 41390-13100 · 지번 후보 1010-1
   지번 1010-1 (1010-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42983404-84.json
   전유 84.829 + 주거공용 25.705 = 공급 110.53㎡ = 33.44평 → **33평**
   표본: 203동 1301 (같은 전용 호 95개) · 전용률 76.7%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 17.04
     · 아파트 / 벽체 [각층 각층] 8.665
── A42983404 전용 59.989

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42983404 --area 59.989

▶ 월곶2차풍림아이원 (A42983404) · 전용 59.989㎡ · 41390-13100 · 지번 후보 1010-1
   지번 1010-1 (1010-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42983404-59.json
   전유 59.989 + 주거공용 21.503 = 공급 81.49㎡ = 24.65평 → **25평**
   표본: 212동 1701 (같은 전용 호 130개) · 전용률 73.6%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 17.258
     · 아파트 / 벽체 [각층 각층] 4.245
── A42983405 전용 59.965

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42983405 --area 59.965

▶ 월곶풍림1차아파트 (A42983405) · 전용 59.965㎡ · 41390-13100 · 지번 후보 1010-4
   지번 1010-4 (1010-0004) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42983405-59.json
   전유 59.965 + 주거공용 15.844 = 공급 75.81㎡ = 22.93평 → **23평**
   표본: 114동 1503호 (같은 전용 호 73개) · 전용률 79.1%
     · 아파트 / 계단실,승강기 [각층] 14.879
     · 아파트 / 피디 [각층] 0.965
── A10026631 전용 84.8957

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026631 --area 84.8957

▶ 호반베르디움센트로하임아파트 (A10026631) · 전용 84.8957㎡ · 41390-13500 · 지번 후보 174
   지번 174 (0174-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026631-84.json
   전유 84.896 + 주거공용 27.824 = 공급 112.72㎡ = 34.1평 → **34평**
   표본: 1108동 2101 (같은 전용 호 402개) · 전용률 75.3%
     · 아파트 / 벽체,계단실 [지상 각층] 27.8238
── A10027300 전용 84.4646

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027300 --area 84.4646

▶ 배곧호반베르디움더프라임아파트 (A10027300) · 전용 84.4646㎡ · 41390-13500 · 지번 후보 150
   지번 150 (0150-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027300-84.json
   전유 84.465 + 주거공용 28.585 = 공급 113.05㎡ = 34.2평 → **34평**
   표본: 912동 504 (같은 전용 호 225개) · 전용률 74.7%
     · 아파트 / 계단실,승강기,복도 [지상 각층] 28.5851
── A10026012 전용 84.9973

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026012 --area 84.9973

▶ 한라비발디캠퍼스3차 (A10026012) · 전용 84.9973㎡ · 41390-13500 · 지번 후보 262
   지번 262 (0262-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026012-84.json
   전유 84.997 + 주거공용 33.682 = 공급 118.68㎡ = 35.9평 → **36평**
   표본: 301동 1305 (같은 전용 호 321개) · 전용률 71.6%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 25.1445
     · 아파트 / 벽체 [지상 13층] 8.5376
── A10026846 전용 84.9906

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026846 --area 84.9906

▶ 한라비발디캠퍼스 (A10026846) · 전용 84.9906㎡ · 41390-13500 · 지번 후보 243
   지번 243 (0243-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026846-84.json
   전유 84.991 + 주거공용 33.7 = 공급 118.69㎡ = 35.9평 → **36평**
   표본: 108동 3301 (같은 전용 호 169개) · 전용률 71.6%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 25.6987
     · 아파트 / 벽체 [지상 33층] 8.0009
── A10026534 전용 84.9734

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026534 --area 84.9734

▶ 시흥배곧한신더휴 (A10026534) · 전용 84.9734㎡ · 41390-13500 · 지번 후보 155
   지번 155 (0155-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026534-84.json
   전유 84.973 + 주거공용 29.963 = 공급 114.94㎡ = 34.77평 → **35평**
   표본: 1012동 2302 (같은 전용 호 173개) · 전용률 73.9%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 23.1001
     · 아파트 / 벽체 [지상 23층] 6.8624
── A10025651 전용 84.8656

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025651 --area 84.8656

▶ 배곧 중흥S-클래스아파트 (A10025651) · 전용 84.8656㎡ · 41390-13500 · 지번 후보 5
   지번 5 (0005-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025651-84.json
   전유 84.866 + 주거공용 27.716 = 공급 112.58㎡ = 34.06평 → **34평**
   표본: 112동 901 (같은 전용 호 278개) · 전용률 75.4%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 20.0966
     · 아파트 / 벽체 [지상 9층] 7.6194
── A10027886 전용 84.2612

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027886 --area 84.2612

▶ 호반 베르디움 센트럴파크 (A10027886) · 전용 84.2612㎡ · 41390-13500 · 지번 후보 139
   지번 139 (0139-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027886-84.json
   전유 84.261 + 주거공용 28.442 = 공급 112.7㎡ = 34.09평 → **34평**
   표본: 814동 604 (같은 전용 호 168개) · 전용률 74.8%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 19.8377
     · 아파트 / 벽체 [지상 6층] 8.6046
── A10027950 전용 84.9805

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027950 --area 84.9805

▶ 시흥 배곧 SK VIEW 아파트 (A10027950) · 전용 84.9805㎡ · 41390-13500 · 지번 후보 135
   지번 135 (0135-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027950-84.json
   전유 84.981 + 주거공용 28.525 = 공급 113.51㎡ = 34.34평 → **34평**
   표본: 711동 2402 (같은 전용 호 165개) · 전용률 74.9%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 20.651
     · 아파트 / 벽체 [지상 24층] 7.8739
── A42980007 전용 84.965

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42980007 --area 84.965

▶ 거모동보 (A42980007) · 전용 84.965㎡ · 41390-12700 · 지번 후보 612-1
   지번 612-1 (0612-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42980007-84.json
   전유 84.965 + 주거공용 14.604 = 공급 99.57㎡ = 30.12평 → **30평**
   표본: 105동 703호 (같은 전용 호 35개) · 전용률 85.3%
     · 아파트 / 코아 [각층] 14.6042
   ⚠️ 전용률 85.3% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10020128 전용 84.8976

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10020128 --area 84.8976

▶ 세교파라곤 (A10020128) · 전용 84.8976㎡ · 41370-10400 · 지번 후보 826
   지번 826 (0826-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10020128-84.json
   전유 84.898 + 주거공용 29.642 = 공급 114.54㎡ = 34.65평 → **35평**
   표본: 402동 302 (같은 전용 호 348개) · 전용률 74.1%
     · 아파트 / 계단실,로비 [지상 각층] 20.5362
     · 아파트 / 벽체 [지상 3층] 9.1057
── A10022331 전용 84.9865

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022331 --area 84.9865

▶ 오산세교2중흥S클래스에듀파크아파트 (A10022331) · 전용 84.9865㎡ · 41370-10400 · 지번 후보 824
   지번 824 (0824-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022331-84.json
   전유 84.987 + 주거공용 31.324 = 공급 116.31㎡ = 35.18평 → **35평**
   표본: 505동 703 (같은 전용 호 94개) · 전용률 73.1%
     · 아파트 / 계단실,승강기홀 [지상 각층] 19.9676
     · 아파트 / 벽체 [지상 7층] 11.3561
── A10022331 전용 59.9784

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022331 --area 59.9784

▶ 오산세교2중흥S클래스에듀파크아파트 (A10022331) · 전용 59.9784㎡ · 41370-10400 · 지번 후보 824
   지번 824 (0824-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022331-59.json
   전유 59.978 + 주거공용 21.029 = 공급 81.01㎡ = 24.5평 → **25평**
   표본: 502동 802 (같은 전용 호 136개) · 전용률 74.0%
     · 아파트 / 계단실,승강기홀 [지상 각층] 14.0919
     · 아파트 / 벽체 [지상 8층] 6.9368
── A10022789 전용 84.9967

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022789 --area 84.9967

▶ 오산롯데캐슬스카이파크 (A10022789) · 전용 84.9967㎡ · 41370-10300 · 지번 후보 921
   지번 921 (0921-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022789-84.json
   전유 84.997 + 주거공용 27.418 = 공급 112.42㎡ = 34.01평 → **34평**
   표본: 310동 703 (같은 전용 호 244개) · 전용률 75.6%
     · 아파트 / 계단실 [지상 각층] 20.7937
     · 아파트 / 벽체 [지상 7층] 6.6246
── A10026366 전용 59.9841

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026366 --area 59.9841

▶ e편한세상 오산세교 아파트 (A10026366) · 전용 59.9841㎡ · 41370-11400 · 지번 후보 577
   지번 577 (0577-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026366-59.json
   전유 59.984 + 주거공용 25.142 = 공급 85.13㎡ = 25.75평 → **26평**
   표본: 106동 301 (같은 전용 호 216개) · 전용률 70.5%
     · 아파트 / 계단실 [지상 각층] 20.2814
     · 아파트 / 벽체 [지상 3층] 4.8603
── A44729004 전용 84.948

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44729004 --area 84.948

▶ 오산대우 (A44729004) · 전용 84.948㎡ · 41370-10800 · 지번 후보 514
   지번 514 (0514-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44729004-84.json
   전유 84.948 + 주거공용 11.552 = 공급 96.5㎡ = 29.19평 → **29평**
   표본: 제116동 1201호 (같은 전용 호 159개) · 전용률 88.0%
     · 부대시설 / 계단 [지상 12층] 11.552
   ⚠️ 전용률 88.0% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A44772901 전용 84.0525

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44772901 --area 84.0525

▶ 오산자이아파트 (A44772901) · 전용 84.0525㎡ · 41370-12300 · 지번 후보 321
   지번 321 (0321-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44772901-84.json
   전유 84.052 + 주거공용 26.449 = 공급 110.5㎡ = 33.43평 → **33평**
   표본: 105동 1604 (같은 전용 호 235개) · 전용률 76.1%
     · 아파트 / 벽체,전실,계단실,승강기,홀 [각층 각층] 25.2998
     · 아파트 / 지하계단실 [지하 지1층] 1.1495
── A10026366 전용 84.9828

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026366 --area 84.9828

▶ e편한세상 오산세교 아파트 (A10026366) · 전용 84.9828㎡ · 41370-11400 · 지번 후보 577
   지번 577 (0577-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026366-84.json
   전유 84.983 + 주거공용 27.911 = 공급 112.89㎡ = 34.15평 → **34평**
   표본: 109동 702 (같은 전용 호 227개) · 전용률 75.3%
     · 아파트 / 계단실 [지상 각층] 22.0245
     · 아파트 / 벽체 [지상 7층] 5.8864
── A44772116 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44772116 --area 59.99

▶ 운암주공5단지 (A44772116) · 전용 59.99㎡ · 41370-10300 · 지번 후보 359-1, 815-1
   지번 359-1 (0359-0001) · 대지 → 줄 0개
   지번 815-1 (0815-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44772116-59.json
   전유 59.99 + 주거공용 17.058 = 공급 77.05㎡ = 23.31평 → **23평**
   표본: 509동 1501호 (같은 전용 호 353개) · 전용률 77.9%
     · 부대시설 / 계단실 [각층] 17.0584
── A44774617 전용 84.9703

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44774617 --area 84.9703

▶ 오산역이편한세상2단지 (A44774617) · 전용 84.9703㎡ · 41370-10300 · 지번 후보 900
   지번 900 (0900-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44774617-84.json
   전유 84.97 + 주거공용 24.631 = 공급 109.6㎡ = 33.15평 → **33평**
   표본: 204동 1902 (같은 전용 호 224개) · 전용률 77.5%
     · 아파트 / 벽체,발코니초과,계단실,승강기,홀 [각층 각층] 24.6307
── A44774513 전용 84.8245

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44774513 --area 84.8245

▶ 오산역e편한세상1단지 (A44774513) · 전용 84.8245㎡ · 41370-10300 · 지번 후보 888
   지번 888 (0888-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44774513-84.json
   전유 84.825 + 주거공용 25.17 = 공급 109.99㎡ = 33.27평 → **33평**
   표본: 103동 701 (같은 전용 호 217개) · 전용률 77.1%
     · 아파트 / 벽체,발코니초과,계단실,승강기,홀 [각층 각층] 25.1702
⏳ 시간 예산(1200초)에 닿아 1180줄은 다음 칸으로 미룹니다
```
