# 단지 공급면적 — 마지막 실행

- 성공 15건 · 실패 3건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A43181606 전용 84.945

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43181606 --area 84.945

▶ 평촌관악타운 (A43181606) · 전용 84.945㎡ · 41173-10100 · 지번 후보 1102
   지번 1102 (1102-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43181606-84.json
   전유 84.945 + 주거공용 20.706 = 공급 105.65㎡ = 31.96평 → **32평**
   표본: 131동 6층 603호 (같은 전용 호 260개) · 전용률 80.4%
     · 아파트 / 복도, 계단 [지상 6층] 14.901
     · 아파트 / 지하층(대피소) [지하 지층] 5.805
── A10022845 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022845 --area 59.98

▶ 산성역자이푸르지오1단지 (A10022845) · 전용 59.98㎡ · 41131-10100 · 지번 후보 6961
   지번 6961 (6961-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022845-59.json
   전유 59.98 + 주거공용 19.114 = 공급 79.09㎡ = 23.93평 → **24평**
   표본: 111동 606 (같은 전용 호 190개) · 전용률 75.8%
     · 아파트 / 계단실 [지상 각층] 13.7637
     · 아파트 / 벽체 [지상 6층] 5.35
── A13380703 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13380703 --area 84.99

▶ 금호두산 (A13380703) · 전용 84.99㎡ · 11200-11100 · 지번 후보 769, 10, 1331
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13380703-84.json
   전유 84.99 + 주거공용 12.53 = 공급 97.52㎡ = 29.5평 → **29평**
   표본: 110동 1501호 (같은 전용 호 76개) · 전용률 87.2%
     · 아파트 / 복도 [각층 각층] 7.54
     · 아파트 / 계단 엘리베이터 [각층 각층] 4.92
     · 아파트 / 경비실 [지상 1층] 0.07
   ⚠️ 전용률 87.2% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10022387 전용 59.9786

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022387 --area 59.9786

▶ 힐스테이트용인고진역1단지 (A10022387) · 전용 59.9786㎡ · 41461-10600 · 지번 후보 1026, 659-8
   지번 1026 (1026-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022387-59.json
   전유 59.979 + 주거공용 23.536 = 공급 83.51㎡ = 25.26평 → **25평**
   표본: 107동 2303 (같은 전용 호 136개) · 전용률 71.8%
     · 아파트 / 계단실,ELEV.홀 [각층 각층] 23.5357
── A44532015 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44532015 --area 84.94

▶ 숲속마을자연앤데시앙아파트 (A44532015) · 전용 84.94㎡ · 41597-10100 · 지번 후보 1131, 1131-0000
   지번 1131 (1131-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44532015-84.json
   전유 84.94 + 주거공용 23.827 = 공급 108.77㎡ = 32.9평 → **33평**
   표본: 873동 2501 (같은 전용 호 151개) · 전용률 78.1%
     · 아파트 / 벽체,계단실,승강기,홀 [각층 각층] 23.827
── A44573621 전용 59.07

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44573621 --area 59.07

▶ 시범다은마을월드반도 (A44573621) · 전용 59.07㎡ · 41597-10200 · 지번 후보 80
   지번 80 (0080-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44573621-59.json
   전유 59.07 + 주거공용 22.42 = 공급 81.49㎡ = 24.65평 → **25평**
   표본: 332동 1601 (같은 전용 호 225개) · 전용률 72.5%
     · 아파트 / 계단실,ELEV. [각층 각층] 17.38
     · 아파트 / 벽체면적 [각층 각층] 5.04
── A46571103 전용 84.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46571103 --area 84.89

▶ 꿈동산 신안아파트 (A46571103) · 전용 84.89㎡ · 41450-10300 · 지번 후보 521
   지번 521 (0521-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46571103-84.json
   전유 84.89 + 주거공용 22.797 = 공급 107.69㎡ = 32.58평 → **33평**
   표본: 418동 1002호 (같은 전용 호 404개) · 전용률 78.8%
     · 아파트 / 계단.현관.ELEV [각층] 17.0368
     · 부대시설 / 대피소 [지하 지하층] 5.7599
── A42374401 전용 59.9858

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42374401 --area 59.9858

▶ 광명두산위브트레지움 (A42374401) · 전용 59.9858㎡ · 41210-10300 · 지번 후보 769, 10, 1331, 863
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 863 (0863-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42374401-59.json
   전유 59.986 + 주거공용 22.725 = 공급 82.71㎡ = 25.02평 → **25평**
   표본: 101동 3003 (같은 전용 호 86개) · 전용률 72.5%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 22.7247
── A10027180 전용 84.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027180 --area 84.89

▶ 미사강변스타힐스 (A10027180) · 전용 84.89㎡ · 41450-10900 · 지번 후보 956
   지번 956 (0956-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027180-84.json
   전유 84.89 + 주거공용 35.448 = 공급 120.34㎡ = 36.4평 → **36평**
   표본: 807동 103 (같은 전용 호 129개) · 전용률 70.5%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 32.2129
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 3.235
── A15805303 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15805303 --area 84.97

▶ 목동롯데캐슬위너 (A15805303) · 전용 84.97㎡ · 11470-10200 · 지번 후보 956
   지번 956 (0956-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15805303-84.json
   전유 84.97 + 주거공용 22.53 = 공급 107.5㎡ = 32.52평 → **33평**
   표본: 106동 904 (같은 전용 호 194개) · 전용률 79.0%
     · 아파트 / 계단실,ELEV. [각층 각층] 17.39
     · 아파트 / 벽체공유 [각층 각층] 5.02
     · 복리시설 / 주민공동시설 [지하 지1층] 0.12
── A10027207 전용 59.35

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027207 --area 59.35

▶ 래미안힐스테이트 고덕 (A10027207) · 전용 59.35㎡ · 11740-10200 · 지번 후보 688, 670
   지번 688 (0688-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027207-59.json
   전유 59.35 + 주거공용 23.2 = 공급 82.55㎡ = 24.97평 → **25평**
   표본: 304동 702 (같은 전용 호 75개) · 전용률 71.9%
     · 아파트 / 계단실 [각층 각층] 17.03
     · 아파트 / 벽체 [지상 7층] 6.17
── A10026370 전용 59.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026370 --area 59.85

▶ e편한세상신촌아파트 (A10026370) · 전용 59.85㎡ · 11410-11000 · 지번 후보 1013
   지번 1013 (1013-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026370-59.json
   전유 59.85 + 주거공용 20.66 = 공급 80.51㎡ = 24.35평 → **24평**
   표본: 304동 402 (같은 전용 호 96개) · 전용률 74.3%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 15.04
     · 아파트 / 벽체 [지상 4층] 5.62
── A10025483 전용 84.9007

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025483 --area 84.9007

▶ 광교 중흥S-클래스 아파트 (A10025483) · 전용 84.9007㎡ · 41117-10200 · 지번 후보 589
   지번 589 (0589-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025483-84.json
   전유 84.901 + 주거공용 32.213 = 공급 117.11㎡ = 35.43평 → **35평**
   표본: 102동 605 (같은 전용 호 124개) · 전용률 72.5%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 21.6336
     · 아파트 / 벽체 [지상 6층] 10.0416
     · 아파트 / 피난안전구역 [각층 22층,24층,26층,29층] 0.5382
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) · 대지 → 줄 1814개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 271-1) — 파일을 만들지 않습니다
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
   지번 6029 (6029-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026600-84.json
   전유 84.99 + 주거공용 29.086 = 공급 114.08㎡ = 34.51평 → **35평**
   표본: 2206동 1403 (같은 전용 호 237개) · 전용률 74.5%
     · 아파트 / 코아 [지상 각층] 21.6163
     · 아파트 / 외벽 [지상 14층] 6.14
     · 부대시설 / 지하코아 [지하 지1] 1.3295
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 46개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
```
