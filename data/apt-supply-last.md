# 단지 공급면적 — 마지막 실행

- 성공 5건 · 실패 0건
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
── A42385801 전용 59.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385801 --area 59.93

▶ 광명한진 (A42385801) · 전용 59.93㎡ · 41210-10100 · 지번 후보 200-6, 478
   지번 200-6 (0200-0006) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42385801-59.json
   전유 59.93 + 주거공용 33.75 = 공급 93.68㎡ = 28.34평 → **28평**
   표본: 107동 1203호 (같은 전용 호 184개) · 전용률 64.0%
     · 아파트 / 계단및기타(지하실) [] 17.98
     · 부대시설 / 주차장 [지하 지1] 15.1
     · 부대시설 / 관리실,경비실,공중화장실 [1,2] 0.47
     · 부대시설 / 기계,전기실 [지하 지1] 0.2
   ⚠️ 전용률 64.0% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10023875 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023875 --area 59.97

▶ DMC센트럴자이 (A10023875) · 전용 59.97㎡ · 11380-11000 · 지번 후보 258
   지번 258 (0258-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023875-59.json
   전유 59.97 + 주거공용 21.8 = 공급 81.77㎡ = 24.74평 → **25평**
   표본: 204동 1002 (같은 전용 호 50개) · 전용률 73.3%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 16.61
     · 아파트 / 벽체 [지상 10층] 5.19
── A10023875 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023875 --area 84.92

▶ DMC센트럴자이 (A10023875) · 전용 84.92㎡ · 11380-11000 · 지번 후보 258
   지번 258 (0258-0000) → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023875-84.json
   전유 84.92 + 주거공용 27.58 = 공급 112.5㎡ = 34.03평 → **34평**
   표본: 304동 1505 (같은 전용 호 181개) · 전용률 75.5%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 21.37
     · 아파트 / 벽체 [지상 15층] 6.21
```
