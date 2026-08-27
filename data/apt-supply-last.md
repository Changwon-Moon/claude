# 단지 공급면적 — 마지막 실행

- 성공 17건 · 실패 5건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 46개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 · 지번 후보 6029, 5869-2
   지번 6029 (6029-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026600-84.json
   전유 84.99 + 주거공용 29.086 = 공급 114.08㎡ = 34.51평 → **35평**
   표본: 2206동 1403 (같은 전용 호 237개) · 전용률 74.5%
     · 아파트 / 코아 [지상 각층] 21.6163
     · 아파트 / 외벽 [지상 14층] 6.14
     · 부대시설 / 지하코아 [지하 지1] 1.3295
── A10023833 전용 84.9264

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264

▶ 지제역 더샵 센트럴시티 (A10023833) · 전용 84.9264㎡ · 41220-12100 · 지번 후보 가-
   지번 가- (0000-0000) → 줄 0개
::error::지번 후보 가- 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A10023833 전용 84.9264

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264

▶ 지제역 더샵 센트럴시티 (A10023833) · 전용 84.9264㎡ · 41220-12100 · 지번 후보 가-
   지번 가- (0000-0000) → 줄 0개
::error::지번 후보 가- 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) → 줄 1814개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 271-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A10024552 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024552 --area 84.94

▶ 래미안리더스원 (A10024552) · 전용 84.94㎡ · 11650-10800 · 지번 후보 1755, 1336
   지번 1755 (1755-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024552-84.json
   전유 84.94 + 주거공용 26.17 = 공급 111.11㎡ = 33.61평 → **34평**
   표본: 111동 2002 (같은 전용 호 200개) · 전용률 76.4%
     · 아파트 / 계단실 [각층 각층] 18.39
     · 아파트 / 벽체 [지상 20층] 7.78
── A10026207 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026207 --area 84.96

▶ 서울숲리버뷰자이아파트 (A10026207) · 전용 84.96㎡ · 11200-10700 · 지번 후보 380
   지번 380 (0380-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026207-84.json
   전유 84.96 + 주거공용 24.174 = 공급 109.13㎡ = 33.01평 → **33평**
   표본: 102동 901 (같은 전용 호 334개) · 전용률 77.8%
     · 아파트 / 계단실,승강기 [각층 각층] 17.3639
     · 아파트 / 벽체 [지상 9층] 6.81
── A13482706 전용 83.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13482706 --area 83.52

▶ 고덕주공9단지 (A13482706) · 전용 83.52㎡ · 11740-10100 · 지번 후보 257
   지번 257 (0257-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13482706-84.json
   전유 83.52 + 주거공용 25.87 = 공급 109.39㎡ = 33.09평 → **33평**
   표본: 901동 607호 (같은 전용 호 563개) · 전용률 76.3%
     · 아파트 / 지하실 [지하 지1층] 18.77
     · 아파트 / 복도 [각층 각층] 4.095
     · 아파트 / 코아 [각층 각층] 2.677
     · 아파트 / 경비실 [지상 지상1층] 0.328
── A14320304 전용 59.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14320304 --area 59.82

▶ 구의현대프라임 (A14320304) · 전용 59.82㎡ · 11215-10300 · 지번 후보 1932-6, 481, 631-1
   지번 1932-6 (1932-0006) → 줄 0개
   지번 481 (0481-0000) → 줄 0개
   지번 631-1 (0631-0001) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14320304-59.json
   전유 59.82 + 주거공용 23.29 = 공급 83.11㎡ = 25.14평 → **25평**
   표본: 3동 1601호 (같은 전용 호 142개) · 전용률 72.0%
     · 아파트 / 계단,현관,엘리베이터 [지상 16층] 20.82
     · 부대시설 / 지하대피소 [지하 지층] 2.47
── A10045404 전용 57.63

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10045404 --area 57.63

▶ 신당약수하이츠 (A10045404) · 전용 57.63㎡ · 11140-16200 · 지번 후보 842
   지번 842 (0842-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10045404-59.json
   전유 57.63 + 주거공용 22.77 = 공급 80.4㎡ = 24.32평 → **24평**
   표본: 109동 501호 (같은 전용 호 66개) · 전용률 71.7%
     · 아파트 / 계단실,복도 [각층] 17.08
     · 부대시설 / 대피소 [지하 지1층] 5.69
── A13472701 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13472701 --area 84.87

▶ 고덕리엔파크3단지 (A13472701) · 전용 84.87㎡ · 11740-10300 · 지번 후보 490
   지번 490 (0490-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13472701-84.json
   전유 84.87 + 주거공용 26.91 = 공급 111.78㎡ = 33.81평 → **34평**
   표본: 334동 1004 (같은 전용 호 109개) · 전용률 75.9%
     · 아파트 / 벽체,계단실,승강기,홀 [각층 각층] 26.91
── A15180705 전용 60.00

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15180705 --area 60.00

▶ 관악드림타운 (A15180705) · 전용 60㎡ · 11620-10100 · 지번 후보 1102, 1712
   지번 1102 (1102-0000) → 줄 0개
   지번 1712 (1712-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15180705-59.json
   전유 60 + 주거공용 22.47 = 공급 82.47㎡ = 24.95평 → **25평**
   표본: 115동 1401 (같은 전용 호 144개) · 전용률 72.8%
     · 아파트 / 계단,복도 [각층 각층] 16.12
     · 아파트 / 지하대피소 [지하 지1층] 6.35
── A10023536 전용 59.36

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023536 --area 59.36

▶ 광명푸르지오센트베르아파트 (A10023536) · 전용 59.36㎡ · 41210-10100 · 지번 후보 788-1, 322
   지번 788-1 (0788-0001) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023536-59.json
   전유 59.358 + 주거공용 21.314 = 공급 80.67㎡ = 24.4평 → **24평**
   표본: 107동 603 (같은 전용 호 348개) · 전용률 73.6%
     · 아파트 / 계단,복도 [지상 각층] 13.8614
     · 아파트 / 벽체 [지상 6층] 7.4523
── A13082704 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13082704 --area 59.99

▶ 이문쌍용 (A13082704) · 전용 59.99㎡ · 11230-11000 · 지번 후보 64
   지번 64 (0064-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13082704-59.json
   전유 59.99 + 주거공용 21.21 = 공급 81.2㎡ = 24.56평 → **25평**
   표본: 101동 1801호 (같은 전용 호 176개) · 전용률 73.9%
     · 아파트 / 계단실,엘리베이터 [각층] 15.26
     · 부대시설 / 지하대피소 [지하 지하1층] 5.95
── A15209002 전용 59.57

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15209002 --area 59.57

▶ 개봉한마을 (A15209002) · 전용 59.57㎡ · 11530-10700 · 지번 후보 476
   지번 476 (0476-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15209002-59.json
   전유 59.57 + 주거공용 42.881 = 공급 102.45㎡ = 30.99평 → **31평**
   표본: 115동 602호 (같은 전용 호 193개) · 전용률 58.1%
     · 아파트 / 지하주차장 [지2~지1] 21.982
     · 아파트 / 계단,복도,엘리베이터 [1~25층] 14.82
     · 아파트 / 지하대피소 [지2~지1] 5.83
     · 아파트 / 전기실,기계실 [지2~지1] 0.249
   ⚠️ 전용률 58.1% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10023630 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023630 --area 84.91

▶ 힐스테이트푸르지오수원아파트 (A10023630) · 전용 84.91㎡ · 41115-13300 · 지번 후보 292, 287-110
   지번 292 (0292-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023630-84.json
   전유 84.91 + 주거공용 26.75 = 공급 111.66㎡ = 33.78평 → **34평**
   표본: 112동 901 (같은 전용 호 85개) · 전용률 76.0%
     · 아파트 / 계단실 [지상 각층] 20.44
     · 아파트 / 벽체 [지상 9층] 6.31
── A44851611 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44851611 --area 84.96

▶ 진산마을성원상떼빌아파트 (A44851611) · 전용 84.96㎡ · 41465-10700 · 지번 후보 30
   지번 30 (0030-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44851611-84.json
   전유 84.96 + 주거공용 23.107 = 공급 108.07㎡ = 32.69평 → **33평**
   표본: 101동 2003호 (같은 전용 호 108개) · 전용률 78.6%
     · 아파트 / 계단실 [각층] 14.809
     · 아파트 / 지하대피소 [지하 지1층] 8.298
── A13084803 전용 59.78

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13084803 --area 59.78

▶ 전농우성 (A13084803) · 전용 59.78㎡ · 11230-10400 · 지번 후보 6
   지번 6 (0006-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13084803-59.json
   전유 59.78 + 주거공용 19.95 = 공급 79.73㎡ = 24.12평 → **24평**
   표본: 30동 508호 (같은 전용 호 107개) · 전용률 75.0%
     · 부대시설 / 복도,계단 [] 13.68
     · 아파트 / 대피호 [지하 지층] 6.16
     · 아파트 / 현관 [] 0.11
── A46571004 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A46571004 --area 59.97

▶ 부영 (A46571004) · 전용 59.97㎡ · 41450-10300 · 지번 후보 518
   지번 518 (0518-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A46571004-59.json
   전유 59.97 + 주거공용 21.591 = 공급 81.56㎡ = 24.67평 → **25평**
   표본: 104동 609호 (같은 전용 호 169개) · 전용률 73.5%
     · 부대시설 / 계단, 복도 [각층] 13.238
     · 부대시설 / 지하대피소 [지하 지층] 5.338
     · 부대시설 / 승강기, 홀 [각층] 3.015
── A10027421 전용 59.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027421 --area 59.87

▶ 수원아이파크시티7단지 (A10027421) · 전용 59.87㎡ · 41113-13700 · 지번 후보 1337
   지번 1337 (1337-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027421-59.json
   전유 59.87 + 주거공용 23.08 = 공급 82.95㎡ = 25.09평 → **25평**
   표본: 714 403 (같은 전용 호 287개) · 전용률 72.2%
     · 아파트 / 벽체,계단실 [지상 각층] 23.08
```
