# 단지 공급면적 — 마지막 실행

- 성공 19건 · 실패 2건
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
── A10025412 전용 84.9126

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025412 --area 84.9126

▶ 성복역 롯데캐슬 골드타운 (A10025412) · 전용 84.9126㎡ · 41465-10600 · 지번 후보 789
   지번 789 (0789-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025412-84.json
   전유 84.913 + 주거공용 27.494 = 공급 112.41㎡ = 34평 → **34평**
   표본: 113동 2402 (같은 전용 호 240개) · 전용률 75.5%
     · 아파트 / 계단실,복도 [지상 각층] 21.1262
     · 아파트 / 벽체 [지상 24층] 6.3678
── A10024453 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024453 --area 84.91

▶ 성복역 롯데캐슬 클라시엘 아파트 (A10024453) · 전용 84.91㎡ · 41465-10600 · 지번 후보 819, 192-1
   지번 819 (0819-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024453-84.json
   전유 84.91 + 주거공용 28.361 = 공급 113.27㎡ = 34.26평 → **34평**
   표본: 212 902 (같은 전용 호 156개) · 전용률 75.0%
     · 아파트 / 계단실,홀(주거공용) [지상 각층] 21.5113
     · 아파트 / 벽체 [지상 9층] 6.85
── A10024488 전용 59.1

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024488 --area 59.1

▶ 꿈의숲아이파크아파트 (A10024488) · 전용 59.1㎡ · 11290-13800 · 지번 후보 323, 189-3
   지번 323 (0323-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024488-59.json
   전유 59.1 + 주거공용 25.77 = 공급 84.87㎡ = 25.67평 → **26평**
   표본: 713동 1804 (같은 전용 호 130개) · 전용률 69.6%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 19.24
     · 아파트 / 벽체 [지상 18층] 6.53
   ⚠️ 전용률 69.6% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10023991 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023991 --area 84.98

▶ 태릉해링턴플레이스 (A10023991) · 전용 84.98㎡ · 11350-10300 · 지번 후보 758
   지번 758 (0758-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023991-84.json
   전유 84.98 + 주거공용 25.503 = 공급 110.48㎡ = 33.42평 → **33평**
   표본: 104동 1204 (같은 전용 호 52개) · 전용률 76.9%
     · 아파트 / 계단실 [지상 각층] 19.3926
     · 아파트 / 벽체 [지상 12층] 6.11
── A15005705 전용 84.84

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15005705 --area 84.84

▶ 신길삼환 (A15005705) · 전용 84.84㎡ · 11560-13200 · 지번 후보 897-1
   지번 897-1 (0897-0001) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15005705-84.json
   전유 84.84 + 주거공용 20.67 = 공급 105.51㎡ = 31.92평 → **32평**
   표본: 109동 403호 (같은 전용 호 193개) · 전용률 80.4%
     · 아파트 / 계단,현관,엘리베이터 [각층] 15.4
     · 부대시설 / 대피소 [지하 지1] 5.27
── A10024831 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024831 --area 59.97

▶ 녹번역e편한세상캐슬 (A10024831) · 전용 59.97㎡ · 11380-10700 · 지번 후보 769
   지번 769 (0769-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024831-59.json
   전유 59.97 + 주거공용 22.437 = 공급 82.41㎡ = 24.93평 → **25평**
   표본: 117동 1202 (같은 전용 호 203개) · 전용률 72.8%
     · 아파트 / 계단실,복도 [각층 각층] 15.804
     · 아파트 / 벽체 [지상 12층] 6.15
     · 부대시설 / 지하층 계단실 [지하 지1층] 0.483
── A10025621 전용 84.69

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025621 --area 84.69

▶ 영통아이파크캐슬1단지 (A10025621) · 전용 84.69㎡ · 41117-10700 · 지번 후보 766
   지번 766 (0766-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025621-84.json
   전유 84.69 + 주거공용 25.94 = 공급 110.63㎡ = 33.47평 → **33평**
   표본: 110동 102 (같은 전용 호 152개) · 전용률 76.5%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 19.11
     · 아파트 / 벽체 [지상 1층] 6.83
── A44693813 전용 84.819

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44693813 --area 84.819

▶ 블루밍 구성 더센트럴 (A44693813) · 전용 84.819㎡ · 41463-11300 · 지번 후보 524-8
   지번 524-8 (0524-0008) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44693813-84.json
   전유 84.819 + 주거공용 23.02 = 공급 107.84㎡ = 32.62평 → **33평**
   표본: 105동 903호 (같은 전용 호 291개) · 전용률 78.6%
     · 아파트 / 계단,복도,승강기 [각층] 14.951
     · 아파트 / 지하대피소 [지하 지1층] 8.069
── A10027344 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027344 --area 59.98

▶ 미사강변센트리버 (A10027344) · 전용 59.98㎡ · 41450-11200 · 지번 후보 436
   지번 436 (0436-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027344-59.json
   전유 59.98 + 주거공용 23.253 = 공급 83.23㎡ = 25.18평 → **25평**
   표본: 703동 1704 (같은 전용 호 116개) · 전용률 72.1%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 21.515
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 1.7377
── A13984004 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984004 --area 59.94

▶ 그랑빌 (A13984004) · 전용 59.94㎡ · 11350-10200 · 지번 후보 18
   지번 18 (0018-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13984004-59.json
   전유 59.94 + 주거공용 16.553 = 공급 76.49㎡ = 23.14평 → **23평**
   표본: 114동 1203 (같은 전용 호 91개) · 전용률 78.4%
     · 아파트 / 계단실,승강기 [각층 각층] 16.553
── A44347021 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44347021 --area 84.96

▶ 영통에듀파크 (A44347021) · 전용 84.96㎡ · 41117-10500 · 지번 후보 957-6
   지번 957-6 (0957-0006) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44347021-84.json
   전유 84.96 + 주거공용 24.148 = 공급 109.11㎡ = 33.01평 → **33평**
   표본: 322동 604호 (같은 전용 호 311개) · 전용률 77.9%
     · 아파트 / 계단,복도,승강기 [각층 각층] 15.722
     · 아파트 / 지하대피소 [지하 지1] 8.426
── A10023833 전용 84.9264

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264

▶ 지제역 더샵 센트럴시티 (A10023833) · 전용 84.9264㎡ · 41220-12100 · 지번 후보 가-
   지번 가- (0000-0000) → 줄 0개
::error::지번 후보 가- 전부 줄 0개입니다 — --jibun 으로 대지 지번을 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023833 --area 84.9264`
Exit status 1
── A13922114 전용 58.46

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13922114 --area 58.46

▶ 중계주공5단지 (A13922114) · 전용 58.46㎡ · 11350-10600 · 지번 후보 359-1
   지번 359-1 (0359-0001) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13922114-59.json
   전유 58.46 + 주거공용 21.85 = 공급 80.31㎡ = 24.29평 → **24평**
   표본: 506동 301호 (같은 전용 호 221개) · 전용률 72.8%
     · 아파트 / 계단,복도등 [각층 각층] 16.78
     · 아파트 / 대피소 [지하 지하층] 5.07
── A44033010 전용 84.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44033010 --area 84.89

▶ 화서역푸르지오더에듀포레 (A44033010) · 전용 84.89㎡ · 41111-13300 · 지번 후보 333
   지번 333 (0333-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44033010-84.json
   전유 84.89 + 주거공용 25.05 = 공급 109.94㎡ = 33.26평 → **33평**
   표본: 131동 1304 (같은 전용 호 133개) · 전용률 77.2%
     · 아파트 / 벽체공용,초과발코니,세대공용,계단실 [지상 각층] 25.05
── A10023329 전용 59.9801

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023329 --area 59.9801

▶ 신동탄포레자이아파트 (A10023329) · 전용 59.9801㎡ · 41595-10500 · 지번 후보 974
   지번 974 (0974-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023329-59.json
   전유 59.98 + 주거공용 21.056 = 공급 81.04㎡ = 24.51평 → **25평**
   표본: 103동 2901 (같은 전용 호 201개) · 전용률 74.0%
     · 아파트 / 계단실 [지상 각층] 15.7935
     · 아파트 / 벽체 [지상 29층] 5.2623
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 140-1, 248
   지번 140-1 (0140-0001) → 줄 0개
   지번 248 (0248-0000) → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A15380403 전용 59.84

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15380403 --area 59.84

▶ 가산두산위브 (A15380403) · 전용 59.84㎡ · 11545-10100 · 지번 후보 769
   지번 769 (0769-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15380403-59.json
   전유 59.84 + 주거공용 21.89 = 공급 81.73㎡ = 24.72평 → **25평**
   표본: 114동 504호 (같은 전용 호 224개) · 전용률 73.2%
     · 아파트 / 계단,복도,승강기 [각층] 15.76
     · 아파트 / 지하대피소 [지하 지1] 6.13
── A44347020 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44347020 --area 59.99

▶ 영통센트럴파크뷰 (A44347020) · 전용 59.99㎡ · 41117-10500 · 지번 후보 948-4
   지번 948-4 (0948-0004) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44347020-59.json
   전유 59.99 + 주거공용 20.871 = 공급 80.86㎡ = 24.46평 → **24평**
   표본: 114동 1101호 (같은 전용 호 281개) · 전용률 74.2%
     · 아파트 / 계단실,승강기등 [각층 각층] 16.3112
     · 아파트 / 대피소 [지하 지1] 4.5601
── A10023740 전용 59.9958

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023740 --area 59.9958

▶ e편한세상 평내 메트로원 (A10023740) · 전용 59.9958㎡ · 41360-10200 · 지번 후보 667, 661
   지번 667 (0667-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023740-59.json
   전유 59.996 + 주거공용 21.747 = 공급 81.74㎡ = 24.73평 → **25평**
   표본: 105동 1102 (같은 전용 호 208개) · 전용률 73.4%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 15.0859
     · 아파트 / 벽체 [지상 11층] 6.6606
```
