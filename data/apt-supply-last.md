# 단지 공급면적 — 마지막 실행

- 성공 10건 · 실패 3건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A44173913 전용 59.963

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44173913 --area 59.963

▶ 권선자이e편한세상 (A44173913) · 전용 59.963㎡ · 41113-13700 · 지번 후보 1330
   지번 1330 (1330-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44173913-59.json
   전유 59.963 + 주거공용 24.4 = 공급 84.36㎡ = 25.52평 → **26평**
   표본: 126동 1201 (같은 전용 호 104개) · 전용률 71.1%
     · 아파트 / 계단실,승강기 [각층 각층] 17.0801
     · 아파트 / 벽체 [지상 12층] 4.5954
     · 아파트 / 발코니 [지상 12층] 2.7242
── A43070506 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43070506 --area 60

▶ 석수e편한세상 (A43070506) · 전용 60㎡ · 41171-10200 · 지번 후보 182-2
   지번 182-2 (0182-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43070506-59.json
   전유 60 + 주거공용 40.705 = 공급 100.7㎡ = 30.46평 → **30평**
   표본: 115동 702호 (같은 전용 호 109개) · 전용률 59.6%
     · 부대시설 / 지하주차장 [지하 지2,지1] 20.504
     · 부대시설 / 계단,승강기,홀 [각층] 14.938
     · 부대시설 / 지하대피소 [지하 지2,지1] 5.263
   ⚠️ 전용률 59.6% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A44278215 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44278215 --area 59.98

▶ 화서주공4단지 (A44278215) · 전용 59.98㎡ · 41115-13800 · 지번 후보 650
   지번 650 (0650-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44278215-59.json
   전유 59.98 + 주거공용 21.2 = 공급 81.18㎡ = 24.56평 → **25평**
   표본: 407동 606호 (같은 전용 호 229개) · 전용률 73.9%
     · 아파트 / 복도,계단,승강기등 [] 14.9557
     · 부대시설 / 지하 [] 3.8892
     · 아파트 / 지하(법상부족분) [] 2.3554
── A14272309 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272309 --area 84.97

▶ 래미안트리베라1차 (A14272309) · 전용 84.97㎡ · 11305-10100 · 지번 후보 813
   지번 813 (0813-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272309-84.json
   전유 84.97 + 주거공용 25.28 = 공급 110.25㎡ = 33.35평 → **33평**
   표본: 120동 1003호 (같은 전용 호 303개) · 전용률 77.1%
     · 아파트 / 벽체,계단실,홀 [각층 각층] 25.28
── A44812014 전용 84.911

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44812014 --area 84.911

▶ 동천디이스트 (A44812014) · 전용 84.911㎡ · 41465-10300 · 지번 후보 914
   지번 914 (0914-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44812014-84.json
   전유 84.911 + 주거공용 24.145 = 공급 109.06㎡ = 32.99평 → **33평**
   표본: 514동 903 (같은 전용 호 374개) · 전용률 77.9%
     · 아파트 / 벽체,계단실,승강기,홀 [각층 각층] 23.82
     · 아파트 / 주민공동시설,문고 [지하 지1층] 0.27
     · 아파트 / 지하계단실 [지하 지1층] 0.055
── A43708008 전용 84.982

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A43708008 --area 84.982

▶ 인덕원센트럴자이 (A43708008) · 전용 84.982㎡ · 41430-10700 · 지번 후보 844
   지번 844 (0844-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A43708008-84.json
   전유 84.982 + 주거공용 28.215 = 공급 113.2㎡ = 34.24평 → **34평**
   표본: 106동 2001 (같은 전용 호 230개) · 전용률 75.1%
     · 아파트 / 계단실,승강기 [지상 각층] 22.412
     · 아파트 / 벽체 [지상 각층] 5.803
── A44878510 전용 84.2102

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44878510 --area 84.2102

▶ 진산마을삼성5차아파트 (A44878510) · 전용 84.2102㎡ · 41465-10100 · 지번 후보 1167
   지번 1167 (1167-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44878510-84.json
   전유 84.21 + 주거공용 31.287 = 공급 115.5㎡ = 34.94평 → **35평**
   표본: 523동 404호 (같은 전용 호 188개) · 전용률 72.9%
     · 아파트 / 계단,승강기 [각층] 22.9011
     · 아파트 / 대피소 [지하 지1층] 8.3859
── A10022845 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022845 --area 84.98

▶ 산성역자이푸르지오1단지 (A10022845) · 전용 84.98㎡ · 41131-10100 · 지번 후보 6961
   지번 6961 (6961-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022845-84.json
   전유 84.98 + 주거공용 23.967 = 공급 108.95㎡ = 32.96평 → **33평**
   표본: 105동 2201 (같은 전용 호 55개) · 전용률 78.0%
     · 아파트 / 계단실 [지상 각층] 17.6365
     · 아파트 / 벽체 [지상 22층] 6.33
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
