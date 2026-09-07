# 단지 공급면적 — 마지막 실행

- 성공 96건 · 실패 17건 · 미룸 1275줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
보 494
   지번 494 (0494-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026985-84.json
   전유 84.839 + 주거공용 25.305 = 공급 110.14㎡ = 33.32평 → **33평**
   표본: 1911동 1302 (같은 전용 호 319개) · 전용률 77.0%
     · 아파트 / 벽체,계단실 [지상 각층] 25.3048
── A44532014 전용 84.3079

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44532014 --area 84.3079

▶ 푸른마을포스코더샵2차 (A44532014) · 전용 84.3079㎡ · 41597-10100 · 지번 후보 1134-0000
   지번 1134-0000 (1134-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44532014-84.json
   전유 84.308 + 주거공용 26.899 = 공급 111.21㎡ = 33.64평 → **34평**
   표본: 907동 2601 (같은 전용 호 187개) · 전용률 75.8%
     · 아파트 / 계단실,ELEV.,전실 [각층 각층] 20.324
     · 아파트 / 벽체면적 [각층 각층] 6.5747
── A44532015 전용 59.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44532015 --area 59.52

▶ 숲속마을자연앤데시앙아파트 (A44532015) · 전용 59.52㎡ · 41597-10100 · 지번 후보 1131, 1131-0000
   지번 1131 (1131-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44532015-59.json
   전유 59.52 + 주거공용 17.762 = 공급 77.28㎡ = 23.38평 → **23평**
   표본: 871동 204 (같은 전용 호 93개) · 전용률 77.0%
     · 아파트 / 벽체,계단실,승강기,홀 [각층 각층] 17.762
── A10023451 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023451 --area 59.92

▶ 반정아이파크캐슬5단지 (A10023451) · 전용 59.92㎡ · 41595-10600 · 지번 후보 637
   지번 637 (0637-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023451-59.json
   전유 59.92 + 주거공용 21.46 = 공급 81.38㎡ = 24.62평 → **25평**
   표본: 502동 303 (같은 전용 호 5개) · 전용률 73.6%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 14.29
     · 아파트 / 벽체 [지상 3층] 7.17
── A10023329 전용 84.9777

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023329 --area 84.9777

▶ 신동탄포레자이아파트 (A10023329) · 전용 84.9777㎡ · 41595-10500 · 지번 후보 974
   지번 974 (0974-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023329-84.json
   전유 84.978 + 주거공용 23.568 = 공급 108.55㎡ = 32.83평 → **33평**
   표본: 104동 2301 (같은 전용 호 181개) · 전용률 78.3%
     · 아파트 / 계단실 [지상 각층] 17.9498
     · 아파트 / 벽체 [지상 23층] 5.6179
── A44572703 전용 84.914

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44572703 --area 84.914

▶ 행복마을참누리 (A44572703) · 전용 84.914㎡ · 41595-10400 · 지번 후보 467
   지번 467 (0467-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44572703-84.json
   전유 84.914 + 주거공용 23.653 = 공급 108.57㎡ = 32.84평 → **33평**
   표본: 108동 1505호 (같은 전용 호 248개) · 전용률 78.2%
     · 아파트 / 계단실,승강기 [각층 각층] 18.352
     · 아파트 / 벽체 [지상 15층] 5.301
── A44598521 전용 84.918

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44598521 --area 84.918

▶ 병점한신 (A44598521) · 전용 84.918㎡ · 41595-10200 · 지번 후보 485
   지번 485 (0485-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44598521-84.json
   전유 84.918 + 주거공용 12.191 = 공급 97.11㎡ = 29.38평 → **29평**
   표본: 110동 108호 (같은 전용 호 178개) · 전용률 87.5%
     · 아파트 / 공동주택 [각층 각층] 12.191
   ⚠️ 전용률 87.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A44598521 전용 59.808

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44598521 --area 59.808

▶ 병점한신 (A44598521) · 전용 59.808㎡ · 41595-10200 · 지번 후보 485
   지번 485 (0485-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44598521-59.json
   전유 59.808 + 주거공용 11.973 = 공급 71.78㎡ = 21.71평 → **22평**
   표본: 102동 1511호 (같은 전용 호 173개) · 전용률 83.3%
     · 아파트 / 공동주택 [각층 각층] 11.973
── A44598820 전용 59.47

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44598820 --area 59.47

▶ 태안주공1단지 (A44598820) · 전용 59.47㎡ · 41595-10200 · 지번 후보 809
   지번 809 (0809-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44598820-59.json
   전유 59.47 + 주거공용 16.804 = 공급 76.27㎡ = 23.07평 → **23평**
   표본: 112동 1601호 (같은 전용 호 345개) · 전용률 78.0%
     · 아파트 / 복도,계단,승강기등 [] 16.8043
── A44536022 전용 84.925

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44536022 --area 84.925

▶ 병점역센트럴허브시티 (A44536022) · 전용 84.925㎡ · 41595-10200 · 지번 후보 817
   지번 817 (0817-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44536022-84.json
   전유 84.925 + 주거공용 24.622 = 공급 109.55㎡ = 33.14평 → **33평**
   표본: 106동 605호 (같은 전용 호 259개) · 전용률 77.5%
     · 아파트 / 계단실,승강기 [각층 각층] 11.578
     · 아파트 / 코아전실 [각층 각층] 7.432
     · 아파트 / 벽체 [각층 각층] 5.612
── A44536022 전용 59.997

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44536022 --area 59.997

▶ 병점역센트럴허브시티 (A44536022) · 전용 59.997㎡ · 41595-10200 · 지번 후보 817
   지번 817 (0817-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44536022-59.json
   전유 59.997 + 주거공용 25.269 = 공급 85.27㎡ = 25.79평 → **26평**
   표본: 120동 1007호 (같은 전용 호 43개) · 전용률 70.4%
     · 아파트 / 계단실,승강기 [각층 각층] 12.225
     · 아파트 / 코아전실 [각층 각층] 7.954
     · 아파트 / 벽체 [각층 각층] 5.09
── A44598308 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44598308 --area 84.99

▶ 신영통현대2단지 (A44598308) · 전용 84.99㎡ · 41595-10500 · 지번 후보 1932-6, 481, 700-1, 818, 868
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 868 (0868-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44598308-84.json
   전유 84.99 + 주거공용 17.195 = 공급 102.19㎡ = 30.91평 → **31평**
   표본: 208동 1403호 (같은 전용 호 243개) · 전용률 83.2%
     · 부대시설 / 계단실,승강기 [각층 각층] 17.195
── A10027114 전용 84.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027114 --area 84.8

▶ 이편한세상 반월나노시티역 (A10027114) · 전용 84.8㎡ · 41595-10500 · 지번 후보 960
   지번 960 (0960-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027114-84.json
   전유 84.8 + 주거공용 28.82 = 공급 113.62㎡ = 34.37평 → **34평**
   표본: 105동 2603 (같은 전용 호 193개) · 전용률 74.6%
     · 아파트 / 계단실 [지상 각층] 22.98
     · 아파트 / 벽체 [지상 각층] 5.84
── A44599008 전용 84.2119

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44599008 --area 84.2119

▶ 서동탄역우남퍼스트빌 (A44599008) · 전용 84.2119㎡ · 41595-10300 · 지번 후보 1039-0000
   지번 1039-0000 (1039-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44599008-84.json
   전유 84.212 + 주거공용 19.123 = 공급 103.34㎡ = 31.26평 → **31평**
   표본: 1001동 1001호 (같은 전용 호 375개) · 전용률 81.5%
     · 부대시설 / 계단실,엘리베이터 [각층 각층] 13.0097
     · 아파트 / 벽체 [각층 각층] 6.1136
── A44572703 전용 59.911

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44572703 --area 59.911

▶ 행복마을참누리 (A44572703) · 전용 59.911㎡ · 41595-10400 · 지번 후보 467
   지번 467 (0467-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44572703-59.json
   전유 59.911 + 주거공용 20.153 = 공급 80.06㎡ = 24.22평 → **24평**
   표본: 107동 502호 (같은 전용 호 74개) · 전용률 74.8%
     · 아파트 / 계단실,승강기 [각층 각층] 15.183
     · 아파트 / 벽체 [지상 5층] 4.97
── A10026893 전용 84.9815

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026893 --area 84.9815

▶ SK VIEW Park 2차 아파트 (A10026893) · 전용 84.9815㎡ · 41595-10400 · 지번 후보 476
   지번 476 (0476-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026893-84.json
   전유 84.981 + 주거공용 26.455 = 공급 111.44㎡ = 33.71평 → **34평**
   표본: 213동 1202 (같은 전용 호 310개) · 전용률 76.3%
     · 아파트 / 벽체,계단실 [지상 각층] 26.4548
── A10026893 전용 59.9901

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026893 --area 59.9901

▶ SK VIEW Park 2차 아파트 (A10026893) · 전용 59.9901㎡ · 41595-10400 · 지번 후보 476
   지번 476 (0476-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026893-59.json
   전유 59.99 + 주거공용 24.981 = 공급 84.97㎡ = 25.7평 → **26평**
   표본: 208동 801 (같은 전용 호 189개) · 전용률 70.6%
     · 아파트 / 벽체,계단실 [지상 각층] 24.9808
── A44577705 전용 84.8008

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44577705 --area 84.8008

▶ 기안마을풍성신미주 (A44577705) · 전용 84.8008㎡ · 41593-10200 · 지번 후보 895
   지번 895 (0895-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44577705-84.json
   전유 84.801 + 주거공용 29.759 = 공급 114.56㎡ = 34.65평 → **35평**
   표본: 112동 902 (같은 전용 호 312개) · 전용률 74.0%
     · 아파트 / 계단,승강기,외벽,복도 [각층 각층] 23.384
     · 아파트 / 동지하,계단실 [각층 각층] 6.3748
── A10026773 전용 84.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026773 --area 84.86

▶ 한강센트럴블루힐 (A10026773) · 전용 84.86㎡ · 41570-10800 · 지번 후보 637-3
   지번 637-3 (0637-0003) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026773-84.json
   전유 84.86 + 주거공용 29.163 = 공급 114.02㎡ = 34.49평 → **34평**
   표본: 513동 1003 (같은 전용 호 105개) · 전용률 74.4%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 29.1632
── A10024689 전용 84.969

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024689 --area 84.969

▶ 한강메트로자이 1단지 (A10024689) · 전용 84.969㎡ · 41570-10200 · 지번 후보 1595
   지번 1595 (1595-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024689-84.json
   전유 84.969 + 주거공용 28.55 = 공급 113.52㎡ = 34.34평 → **34평**
   표본: 102동 3403호 (같은 전용 호 233개) · 전용률 74.9%
     · 아파트 / 계단실,승강기 [지상 각층] 19.5185
     · 아파트 / 벽체 [지상 34층] 9.0319
── A10024689 전용 59.9538

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024689 --area 59.9538

▶ 한강메트로자이 1단지 (A10024689) · 전용 59.9538㎡ · 41570-10200 · 지번 후보 1595
   지번 1595 (1595-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024689-59.json
   전유 59.954 + 주거공용 25.777 = 공급 85.73㎡ = 25.93평 → **26평**
   표본: 104동 2602호 (같은 전용 호 20개) · 전용률 69.9%
     · 아파트 / 계단실,승강기 [지상 각층] 18.3102
     · 아파트 / 벽체 [지상 26층] 7.4667
   ⚠️ 전용률 69.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10024486 전용 84.9584

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024486 --area 84.9584

▶ 한강동일스위트더파크뷰1단지아파트 (A10024486) · 전용 84.9584㎡ · 41570-10800 · 지번 후보 638-4
   지번 638-4 (0638-0004) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024486-84.json
   전유 84.958 + 주거공용 25.714 = 공급 110.67㎡ = 33.48평 → **33평**
   표본: 608동 1601 (같은 전용 호 479개) · 전용률 76.8%
     · 아파트 / 계단실 [지상 각층] 17.9934
     · 아파트 / 벽체 [지상 16층] 7.7209
── A10024763 전용 84.9402

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024763 --area 84.9402

▶ 한강메트로자이2단지 아파트 (A10024763) · 전용 84.9402㎡ · 41570-10200 · 지번 후보 180
   지번 180 (0180-0000) · 대지 → 줄 0개
::error::지번 후보 180 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024763 --area 84.9402`
Exit status 1
── A10024763 전용 59.9496

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024763 --area 59.9496

▶ 한강메트로자이2단지 아파트 (A10024763) · 전용 59.9496㎡ · 41570-10200 · 지번 후보 180
   지번 180 (0180-0000) · 대지 → 줄 0개
::error::지번 후보 180 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024763 --area 59.9496`
Exit status 1
── A10026284 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026284 --area 84.92

▶ 김포 사우 아이파크 (A10026284) · 전용 84.92㎡ · 41570-10600 · 지번 후보 1481
   지번 1481 (1481-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026284-84.json
   전유 84.92 + 주거공용 27.38 = 공급 112.3㎡ = 33.97평 → **34평**
   표본: 105동 1204 (같은 전용 호 118개) · 전용률 75.6%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 21.1
     · 아파트 / 벽체 [지상 12층] 6.28
── A10027488 전용 84.9975

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027488 --area 84.9975

▶ 김포풍무푸르지오 (A10027488) · 전용 84.9975㎡ · 41570-10700 · 지번 후보 1060
   지번 1060 (1060-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027488-84.json
   전유 84.998 + 주거공용 28.831 = 공급 113.83㎡ = 34.43평 → **34평**
   표본: 122동 301 (같은 전용 호 201개) · 전용률 74.7%
     · 아파트 / 벽체,계단실 [지상 각층] 28.8312
── A10027488 전용 59.9935

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027488 --area 59.9935

▶ 김포풍무푸르지오 (A10027488) · 전용 59.9935㎡ · 41570-10700 · 지번 후보 1060
   지번 1060 (1060-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027488-59.json
   전유 59.993 + 주거공용 22.996 = 공급 82.99㎡ = 25.1평 → **25평**
   표본: 116동 2005 (같은 전용 호 63개) · 전용률 72.3%
     · 아파트 / 벽체,계단실 [지상 각층] 22.9958
── A10026165 전용 84.9706

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026165 --area 84.9706

▶ 풍무센트럴푸르지오 (A10026165) · 전용 84.9706㎡ · 41570-10700 · 지번 후보 289
   지번 289 (0289-0000) · 대지 → 줄 0개
::error::지번 후보 289 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026165 --area 84.9706`
Exit status 1
── A10026165 전용 59.9669

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026165 --area 59.9669

▶ 풍무센트럴푸르지오 (A10026165) · 전용 59.9669㎡ · 41570-10700 · 지번 후보 289
   지번 289 (0289-0000) · 대지 → 줄 0개
::error::지번 후보 289 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026165 --area 59.9669`
Exit status 1
── A41507010 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41507010 --area 84.96

▶ 풍무유현마을현대프라임빌 (A41507010) · 전용 84.96㎡ · 41570-10700 · 지번 후보 1932-6, 481, 631-1, 700-1, 818, 759
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 631-1 (0631-0001) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 759 (0759-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41507010-84.json
   전유 84.96 + 주거공용 28.604 = 공급 113.56㎡ = 34.35평 → **34평**
   표본: 202동 1801 (같은 전용 호 28개) · 전용률 74.8%
     · 아파트 / 계단실,승강기 [각층 각층] 28.565
     · 부대시설 / 문고 [각층 각층] 0.039
── A41507008 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41507008 --area 84.91

▶ 풍무유현마을신동아 (A41507008) · 전용 84.91㎡ · 41570-10700 · 지번 후보 583-6
   지번 583-6 (0583-0006) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41507008-84.json
   전유 84.91 + 주거공용 13.395 = 공급 98.3㎡ = 29.74평 → **30평**
   표본: 107동 603호 (같은 전용 호 130개) · 전용률 86.4%
     · 부대시설 / 계단실,엘리베이터 [각층 각층] 13.395
   ⚠️ 전용률 86.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A41507008 전용 59.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41507008 --area 59.93

▶ 풍무유현마을신동아 (A41507008) · 전용 59.93㎡ · 41570-10700 · 지번 후보 583-6
   지번 583-6 (0583-0006) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41507008-59.json
   전유 59.93 + 주거공용 14.276 = 공급 74.21㎡ = 22.45평 → **22평**
   표본: 112동 507호 (같은 전용 호 42개) · 전용률 80.8%
     · 부대시설 / 계단실,엘리베이터 [각층 각층] 14.276
── A41574413 전용 59.9695

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574413 --area 59.9695

▶ 한강호반베르디움 (A41574413) · 전용 59.9695㎡ · 41570-10400 · 지번 후보 1885-6
   지번 1885-6 (1885-0006) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574413-59.json
   전유 59.969 + 주거공용 23.377 = 공급 83.35㎡ = 25.21평 → **25평**
   표본: 501동 1003 (같은 전용 호 427개) · 전용률 72.0%
     · 아파트 / 벽체,계단실 [지상 10층] 23.3767
── A41574412 전용 84.9935

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574412 --area 84.9935

▶ 초당마을중흥S클래스리버티 (A41574412) · 전용 84.9935㎡ · 41570-10400 · 지번 후보 2058-1
   지번 2058-1 (2058-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574412-84.json
   전유 84.993 + 주거공용 24.71 = 공급 109.7㎡ = 33.19평 → **33평**
   표본: 302동 803 (같은 전용 호 345개) · 전용률 77.5%
     · 아파트 / 계단실,승강기,홀,벽체 [지상 각층] 24.7098
── A10027199 전용 84.9699

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027199 --area 84.9699

▶ 한강센트럴자이1단지 (A10027199) · 전용 84.9699㎡ · 41570-10400 · 지번 후보 2128-1
   지번 2128-1 (2128-0001) · 대지 → 줄 0개
::error::지번 후보 2128-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027199 --area 84.9699`
Exit status 1
── A41574416 전용 84.536

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574416 --area 84.536

▶ 청송마을모아미래도엘가 (A41574416) · 전용 84.536㎡ · 41570-10400 · 지번 후보 1869-5
   지번 1869-5 (1869-0005) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574416-84.json
   전유 84.536 + 주거공용 26.363 = 공급 110.9㎡ = 33.55평 → **34평**
   표본: 509동 901 (같은 전용 호 374개) · 전용률 76.2%
     · 아파트 / 벽체,계단실 [지상 각층] 26.3634
── A41506013 전용 84.281

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41506013 --area 84.281

▶ 청송현대홈타운2단지 (A41506013) · 전용 84.281㎡ · 41570-10400 · 지번 후보 1932-6, 481, 700-1, 818, 1342
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 1342 (1342-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41506013-84.json
   전유 84.281 + 주거공용 17.312 = 공급 101.59㎡ = 30.73평 → **31평**
   표본: 211동 1403호 (같은 전용 호 129개) · 전용률 83.0%
     · 부대시설 / 계단실,엘리베이터 [각층 각층] 16.624
     · 아파트 / 에이디,피디 [각층 각층] 0.688
── A41574405 전용 84.752

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574405 --area 84.752

▶ 쌍용예가 (A41574405) · 전용 84.752㎡ · 41570-10400 · 지번 후보 64, 2004-4
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 2004-4 (2004-0004) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574405-84.json
   전유 84.752 + 주거공용 25.824 = 공급 110.58㎡ = 33.45평 → **33평**
   표본: 115 304 (같은 전용 호 300개) · 전용률 76.6%
     · 아파트 / 승강장,계단실 [지상 각층] 19.024
     · 아파트 / 벽체 [지상 각층] 6.8
── A41574408 전용 84.8834

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574408 --area 84.8834

▶ 김포한양수자인리버팰리스 (A41574408) · 전용 84.8834㎡ · 41570-10400 · 지번 후보 1885-10
   지번 1885-10 (1885-0010) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574408-84.json
   전유 84.883 + 주거공용 27.026 = 공급 111.91㎡ = 33.85평 → **34평**
   표본: 603동 1301 (같은 전용 호 417개) · 전용률 75.8%
     · 아파트 / 벽체,계단실 [지상 각층] 27.0258
── A41574410 전용 59.959

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574410 --area 59.959

▶ 고창마을KCC스위첸 (A41574410) · 전용 59.959㎡ · 41570-10400 · 지번 후보 1886-2
   지번 1886-2 (1886-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574410-59.json
   전유 59.959 + 주거공용 21.69 = 공급 81.65㎡ = 24.7평 → **25평**
   표본: 406동 1402 (같은 전용 호 427개) · 전용률 73.4%
     · 아파트 / 세대내공용,계단실 [지상 각층] 21.69
── A10026216 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026216 --area 84.96

▶ 한강신도시2차 KCC 스위첸 아파트 (A10026216) · 전용 84.96㎡ · 41570-10300 · 지번 후보 1331-1
   지번 1331-1 (1331-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026216-84.json
   전유 84.96 + 주거공용 28.558 = 공급 113.52㎡ = 34.34평 → **34평**
   표본: 106동 2203 (같은 전용 호 598개) · 전용률 74.8%
     · 아파트 / 계단실 [지상 각층] 21.0583
     · 아파트 / 벽체 [지상 각층] 7.5
── A41574207 전용 84.9823

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574207 --area 84.9823

▶ 한강신도시롯데캐슬 (A41574207) · 전용 84.9823㎡ · 41570-10300 · 지번 후보 1301-1
   지번 1301-1 (1301-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574207-84.json
   전유 84.982 + 주거공용 26.398 = 공급 111.38㎡ = 33.69평 → **34평**
   표본: 306동 605 (같은 전용 호 182개) · 전용률 76.3%
     · 아파트 / 계단실 [지상 각층] 20.092
     · 아파트 / 벽 체 [지상 각층] 6.3059
── A41574206 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574206 --area 84.97

▶ 풍경마을 래미안 한강2차 (A41574206) · 전용 84.97㎡ · 41570-10300 · 지번 후보 1304-5
   지번 1304-5 (1304-0005) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574206-84.json
   전유 84.97 + 주거공용 28.215 = 공급 113.18㎡ = 34.24평 → **34평**
   표본: 515동 702 (같은 전용 호 279개) · 전용률 75.1%
     · 아파트 / 계단실,복도등 [지상 각층] 20.5348
     · 아파트 / 벽체 [지상 각층] 7.68
── A41506012 전용 84.252

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41506012 --area 84.252

▶ 김포전원마을월드1단지 (A41506012) · 전용 84.252㎡ · 41570-10300 · 지번 후보 1436
   지번 1436 (1436-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41506012-84.json
   전유 84.252 + 주거공용 17.103 = 공급 101.36㎡ = 30.66평 → **31평**
   표본: 107동 801호 (같은 전용 호 101개) · 전용률 83.1%
     · 부대시설 / 계단실 [각층 각층] 17.1033
── A41506012 전용 59.5305

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41506012 --area 59.5305

▶ 김포전원마을월드1단지 (A41506012) · 전용 59.5305㎡ · 41570-10300 · 지번 후보 1436
   지번 1436 (1436-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41506012-59.json
   전유 59.531 + 주거공용 15.679 = 공급 75.21㎡ = 22.75평 → **23평**
   표본: 102동 501호 (같은 전용 호 146개) · 전용률 79.1%
     · 부대시설 / 계단실 [각층 각층] 15.6789
── A41574205 전용 59.1119

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41574205 --area 59.1119

▶ 김포한강신도시반도유보라2차 (A41574205) · 전용 59.1119㎡ · 41570-10300 · 지번 후보 1300-3
   지번 1300-3 (1300-0003) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41574205-59.json
   전유 59.112 + 주거공용 21.968 = 공급 81.08㎡ = 24.53평 → **25평**
   표본: 703동 902 (같은 전용 호 427개) · 전용률 72.9%
     · 아파트 / 계단실 [지상 각층] 16.7391
     · 아파트 / 벽 체 [지상 각층] 5.2293
── A10026284 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026284 --area 59.98

▶ 김포 사우 아이파크 (A10026284) · 전용 59.98㎡ · 41570-10600 · 지번 후보 1481
   지번 1481 (1481-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026284-59.json
   전유 59.98 + 주거공용 20.09 = 공급 80.07㎡ = 24.22평 → **24평**
   표본: 111동 1204 (같은 전용 호 100개) · 전용률 74.9%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 14.91
     · 아파트 / 벽체 [지상 12층] 5.18
── A41576916 전용 84.9238

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41576916 --area 84.9238

▶ 한강힐스테이트아파트 (A41576916) · 전용 84.9238㎡ · 41570-10800 · 지번 후보 636-1
   지번 636-1 (0636-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41576916-84.json
   전유 84.924 + 주거공용 25.142 = 공급 110.07㎡ = 33.29평 → **33평**
   표본: 503동 2404 (같은 전용 호 498개) · 전용률 77.2%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 18.5658
     · 아파트 / 벽체 [지상 각층] 6.5757
── A41576915 전용 84.9759

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41576915 --area 84.9759

▶ 호수마을e편한세상 (A41576915) · 전용 84.9759㎡ · 41570-10900 · 지번 후보 6874-17
   지번 6874-17 (6874-0017) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41576915-84.json
   전유 84.976 + 주거공용 24.902 = 공급 109.88㎡ = 33.24평 → **33평**
   표본: 202동 1805 (같은 전용 호 333개) · 전용률 77.3%
     · 아파트 / 계단실,승강기,홀,벽체 [지상 각층] 24.9023
── A10027014 전용 59.539

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027014 --area 59.539

▶ 한강신도시3차푸르지오 (A10027014) · 전용 59.539㎡ · 41570-10900 · 지번 후보 6895-2
   지번 6895-2 (6895-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027014-59.json
   전유 59.539 + 주거공용 22.435 = 공급 81.97㎡ = 24.8평 → **25평**
   표본: 513동 2005 (같은 전용 호 375개) · 전용률 72.6%
     · 아파트 / 복도,계단실 [지상 각층] 16.8595
     · 아파트 / 벽체 [지상 각층] 5.5757
── A10026448 전용 84.9592

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026448 --area 84.9592

▶ 김포한강아이파크 (A10026448) · 전용 84.9592㎡ · 41570-10900 · 지번 후보 6874-20
   지번 6874-20 (6874-0020) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026448-84.json
   전유 84.959 + 주거공용 27.07 = 공급 112.03㎡ = 33.89평 → **34평**
   표본: 304동 405 (같은 전용 호 232개) · 전용률 75.8%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 20.8391
     · 아파트 / 벽체 [지상 4층] 6.2305
── A41501010 전용 84.886

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41501010 --area 84.886

▶ 푸른마을신안실크벨리1차 (A41501010) · 전용 84.886㎡ · 41570-10500 · 지번 후보 685
   지번 685 (0685-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41501010-84.json
   전유 84.886 + 주거공용 17.853 = 공급 102.74㎡ = 31.08평 → **31평**
   표본: 102동 1203호 (같은 전용 호 161개) · 전용률 82.6%
     · 부대시설 / 계단실,엘리베이터 [각층] 17.8526
── A41501010 전용 59.794

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41501010 --area 59.794

▶ 푸른마을신안실크벨리1차 (A41501010) · 전용 59.794㎡ · 41570-10500 · 지번 후보 685
   지번 685 (0685-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41501010-59.json
   전유 59.794 + 주거공용 13.283 = 공급 73.08㎡ = 22.11평 → **22평**
   표본: 108동 1506호 (같은 전용 호 75개) · 전용률 81.8%
     · 부대시설 / 계단실,엘리베이터 [각층] 13.2827
── A41570101 전용 84.8674

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A41570101 --area 84.8674

▶ 신안실크밸리3차 (A41570101) · 전용 84.8674㎡ · 41570-10500 · 지번 후보 696
   지번 696 (0696-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A41570101-84.json
   전유 84.867 + 주거공용 28.888 = 공급 113.76㎡ = 34.41평 → **34평**
   표본: 305동 902 (같은 전용 호 346개) · 전용률 74.6%
     · 아파트 / 계단,ELEV,복도,벽체 [지상 각층] 28.8881
── A10025481 전용 59.9772

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025481 --area 59.9772

▶ 동천센트럴자이아파트 (A10025481) · 전용 59.9772㎡ · 41465-10300 · 지번 후보 164-4
   지번 164-4 (0164-0004) · 대지 → 줄 0개
::error::지번 후보 164-4 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025481 --area 59.9772`
Exit status 1
── A10025481 전용 84.8152

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025481 --area 84.8152

▶ 동천센트럴자이아파트 (A10025481) · 전용 84.8152㎡ · 41465-10300 · 지번 후보 164-4
   지번 164-4 (0164-0004) · 대지 → 줄 0개
::error::지번 후보 164-4 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025481 --area 84.8152`
Exit status 1
── A44899209 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44899209 --area 59.99

▶ 현대성우 (A44899209) · 전용 59.99㎡ · 41465-10100 · 지번 후보 1932-6, 481, 700-1, 818, 1112
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44899209-59.json
   전유 60.03 + 주거공용 9.67 = 공급 69.7㎡ = 21.08평 → **21평**
   표본: 101동 1402호 (같은 전용 호 74개) · 전용률 86.1%
     · 아파트 / 복도.계단 [지상 14층] 9.67
   ⚠️ 전용률 86.1% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A44878309 전용 84.51

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44878309 --area 84.51

▶ 수지현대아파트 (A44878309) · 전용 84.51㎡ · 41465-10100 · 지번 후보 1932-6, 481, 700-1, 818
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44878309-84.json
   전유 84.51 + 주거공용 13.614 = 공급 98.12㎡ = 29.68평 → **30평**
   표본: 104동 902호 (같은 전용 호 253개) · 전용률 86.1%
     · 아파트 / 복도.계단 [지상 9층] 13.614
   ⚠️ 전용률 86.1% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A44876510 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44876510 --area 59.76

▶ 초입마을삼익풍림동아 (A44876510) · 전용 59.76㎡ · 41465-10100 · 지번 후보 664
   지번 664 (0664-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44876510-59.json
   전유 59.76 + 주거공용 15.793 = 공급 75.55㎡ = 22.85평 → **23평**
   표본: 104동 502호 (같은 전용 호 419개) · 전용률 79.1%
     · 아파트 / 복도.계단 [각층] 15.793
── A44898708 전용 59.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44898708 --area 59.39

▶ 신정마을주공1단지아파트 (A44898708) · 전용 59.39㎡ · 41465-10100 · 지번 후보 1065
   지번 1065 (1065-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44898708-59.json
   전유 59.39 + 주거공용 17.767 = 공급 77.16㎡ = 23.34평 → **23평**
   표본: 107동 1801호 (같은 전용 호 375개) · 전용률 77.0%
     · 아파트 / 계단실,승강기등 [각층] 17.7671
── A44876411 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44876411 --area 59.76

▶ 수지4차삼성 (A44876411) · 전용 59.76㎡ · 41465-10100 · 지번 후보 663-1
   지번 663-1 (0663-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44876411-59.json
   전유 59.76 + 주거공용 23.019 = 공급 82.78㎡ = 25.04평 → **25평**
   표본: 103동 1204호 (같은 전용 호 374개) · 전용률 72.2%
     · 아파트 / 엘리베이터실,계단실,복도 [각층] 16.4741
     · 아파트 / 지하실 [각층] 5.2549
     · 아파트 / 비상계단 [각층] 1.2056
     · 부대시설 / 주현관.경비실 [각층] 0.0847
── A10026839 전용 84.943

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026839 --area 84.943

▶ e편한세상 수지아파트 (A10026839) · 전용 84.943㎡ · 41465-10100 · 지번 후보 1209
   지번 1209 (1209-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026839-84.json
   전유 84.943 + 주거공용 28.716 = 공급 113.66㎡ = 34.38평 → **34평**
   표본: 107동 504 (같은 전용 호 338개) · 전용률 74.7%
     · 아파트 / 계단,복도,측벽 [지상 각층] 21.332
     · 아파트 / 벽체 [지상 각층] 7.384
── A44897120 전용 84.9959

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44897120 --area 84.9959

▶ 새터마을죽전힐스테이트 (A44897120) · 전용 84.9959㎡ · 41465-10200 · 지번 후보 1165
   지번 1165 (1165-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44897120-84.json
   전유 84.996 + 주거공용 26.301 = 공급 111.3㎡ = 33.67평 → **34평**
   표본: 715동 904 (같은 전용 호 374개) · 전용률 76.4%
     · 아파트 / 벽체,계단실,승강기홀 [각층 각층] 26.3008
── A44853819 전용 84.5773

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44853819 --area 84.5773

▶ 죽전건영캐스빌 (A44853819) · 전용 84.5773㎡ · 41465-10200 · 지번 후보 1182
   지번 1182 (1182-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44853819-84.json
   전유 84.577 + 주거공용 28.469 = 공급 113.05㎡ = 34.2평 → **34평**
   표본: 904동 702 (같은 전용 호 120개) · 전용률 74.8%
     · 아파트 / 계단,승강기,벽체,전실 [각층 각층] 27.5527
     · 부대시설 / 휀룸 [지하 지1층] 0.9161
── A44815010 전용 82.409

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44815010 --area 82.409

▶ 엘지신봉자이2차 (A44815010) · 전용 82.409㎡ · 41465-10500 · 지번 후보 911
   지번 911 (0911-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44815010-84.json
   전유 82.409 + 주거공용 26.922 = 공급 109.33㎡ = 33.07평 → **33평**
   표본: 207동 805 (같은 전용 호 83개) · 전용률 75.4%
     · 아파트 / 벽체,계단실,승강기홀 [각층 각층] 26.922
── A44815011 전용 83.278

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44815011 --area 83.278

▶ 엘지자이1차 (A44815011) · 전용 83.278㎡ · 41465-10500 · 지번 후보 873
   지번 873 (0873-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44815011-84.json
   전유 83.278 + 주거공용 27.197 = 공급 110.48㎡ = 33.42평 → **33평**
   표본: 106동 1906 (같은 전용 호 94개) · 전용률 75.4%
     · 아파트 / 벽체,계단실,승강기홀 [각층 각층] 27.197
── A44851611 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44851611 --area 59.99

▶ 진산마을성원상떼빌아파트 (A44851611) · 전용 59.99㎡ · 41465-10700 · 지번 후보 30
   지번 30 (0030-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44851611-59.json
   전유 59.99 + 주거공용 14.809 = 공급 74.8㎡ = 22.63평 → **23평**
   표본: 114동 1703호 (같은 전용 호 143개) · 전용률 80.2%
     · 아파트 / 계단실 [각층] 14.809
── A44851511 전용 84.938

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44851511 --area 84.938

▶ 광교자이 더 클래스 (A44851511) · 전용 84.938㎡ · 41465-10700 · 지번 후보 1134
   지번 1134 (1134-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44851511-84.json
   전유 84.938 + 주거공용 26.529 = 공급 111.47㎡ = 33.72평 → **34평**
   표본: 4210동 2501 (같은 전용 호 210개) · 전용률 76.2%
     · 아파트 / 계단실,ELEV,복도 [지상 각층] 20.703
     · 아파트 / 벽체 [지상 각층] 5.826
── A44851511 전용 59.902

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44851511 --area 59.902

▶ 광교자이 더 클래스 (A44851511) · 전용 59.902㎡ · 41465-10700 · 지번 후보 1134
   지번 1134 (1134-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44851511-59.json
   전유 59.902 + 주거공용 23.452 = 공급 83.35㎡ = 25.21평 → **25평**
   표본: 4207동 2505 (같은 전용 호 164개) · 전용률 71.9%
     · 아파트 / 계단실,ELEV,복도 [지상 각층] 18.468
     · 아파트 / 벽체 [지상 각층] 4.984
── A44851113 전용 84.975

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44851113 --area 84.975

▶ 동천마을현대2차홈타운 (A44851113) · 전용 84.975㎡ · 41465-10300 · 지번 후보 1932-6, 481, 700-1, 818, 862
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 862 (0862-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44851113-84.json
   전유 84.975 + 주거공용 29.924 = 공급 114.9㎡ = 34.76평 → **35평**
   표본: 203동 705호 (같은 전용 호 368개) · 전용률 74.0%
     · 아파트 / 계단실 [각층] 29.9237
── A10024231 전용 84.8682

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024231 --area 84.8682

▶ 용인동백두산위브더제니스 (A10024231) · 전용 84.8682㎡ · 41463-11500 · 지번 후보 694, 769, 10, 1331, 1708
   지번 694 (0694-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024231-84.json
   전유 84.868 + 주거공용 26.494 = 공급 111.36㎡ = 33.69평 → **34평**
   표본: 104동 2304 (같은 전용 호 157개) · 전용률 76.2%
     · 아파트 / 홀,계단 [지상 각층] 19.3818
     · 아파트 / 벽체 [지상 23층] 7.1118
── A10025541 전용 84.8998

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025541 --area 84.8998

▶ 신흥덕 롯데캐슬레이시티 (A10025541) · 전용 84.8998㎡ · 41463-10100 · 지번 후보 736
   지번 736 (0736-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025541-84.json
   전유 84.9 + 주거공용 30.374 = 공급 115.27㎡ = 34.87평 → **35평**
   표본: 109동 1704 (같은 전용 호 47개) · 전용률 73.7%
     · 아파트 / 홀,계단(주거공용) [지상 각층] 22.0259
     · 아파트 / 벽체 [지상 17층] 6.1677
     · 부대시설 / 홀,계단(기타공용) [각층 지3~지1] 2.1808
── A44694209 전용 84.895

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44694209 --area 84.895

▶ 수원동마을쌍용아파트 (A44694209) · 전용 84.895㎡ · 41463-11700 · 지번 후보 64, 621
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 621 (0621-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44694209-84.json
   전유 84.895 + 주거공용 30.985 = 공급 115.88㎡ = 35.05평 → **35평**
   표본: 306동 606호 (같은 전용 호 165개) · 전용률 73.3%
     · 아파트 / 계단,승강기 [각층] 16.879
     · 아파트 / 대 피 소 [지하 지1층] 7.148
     · 아파트 / 벽체 [각층] 6.958
── A44694013 전용 84.545

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44694013 --area 84.545

▶ 동아솔레시티 (A44694013) · 전용 84.545㎡ · 41463-11800 · 지번 후보 1162
   지번 1162 (1162-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44694013-84.json
   전유 84.545 + 주거공용 17.952 = 공급 102.5㎡ = 31.01평 → **31평**
   표본: 107동 1601호 (같은 전용 호 28개) · 전용률 82.5%
     · 아파트 / 계단실,승강기 [각층] 17.7813
     · 부대시설 / 경비실,공중화장실 [지1층,1층] 0.1711
── A10025933 전용 84.981

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025933 --area 84.981

▶ 기흥역 더샵 아파트 (A10025933) · 전용 84.981㎡ · 41463-10200 · 지번 후보 234-5
   지번 234-5 (0234-0005) · 대지 → 줄 0개
::error::지번 후보 234-5 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025933 --area 84.981`
Exit status 1
── A44672601 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44672601 --area 84.99

▶ 청명호수마을신안인스빌1,2단지 (A44672601) · 전용 84.99㎡ · 41463-10400 · 지번 후보 631
   지번 631 (0631-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44672601-84.json
   전유 84.99 + 주거공용 24.18 = 공급 109.17㎡ = 33.02평 → **33평**
   표본: 102동 803 (같은 전용 호 182개) · 전용률 77.8%
     · 아파트 / 벽체,계단실,승강기,홀 [지상 각층] 22.991
     · 아파트 / 지하계단실(지2-지1) [지상 각층] 1.189
── A44659201 전용 84.9852

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44659201 --area 84.9852

▶ 자봉마을써니밸리 (A44659201) · 전용 84.9852㎡ · 41463-10600 · 지번 후보 704
   지번 704 (0704-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44659201-84.json
   전유 84.985 + 주거공용 29.215 = 공급 114.2㎡ = 34.55평 → **35평**
   표본: 101동 401호 (같은 전용 호 300개) · 전용률 74.4%
     · 아파트 / 계단실,승강기 [각층 각층] 29.2148
── A44675301 전용 84.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44675301 --area 84.85

▶ 신동백롯데캐슬에코1단지 (A44675301) · 전용 84.85㎡ · 41463-11600 · 지번 후보 1096
   지번 1096 (1096-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44675301-84.json
   전유 84.85 + 주거공용 28.088 = 공급 112.94㎡ = 34.16평 → **34평**
   표본: 102동 1504 (같은 전용 호 279개) · 전용률 75.1%
     · 아파트 / 벽체,계단실 [지상 각층] 28.0876
── A10025587 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025587 --area 84.92

▶ 용인기흥 효성해링턴플레이스아파트 (A10025587) · 전용 84.92㎡ · 41463-11100 · 지번 후보 1267
   지번 1267 (1267-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025587-84.json
   전유 84.92 + 주거공용 30.637 = 공급 115.56㎡ = 34.96평 → **35평**
   표본: 108동 1202 (같은 전용 호 161개) · 전용률 73.5%
     · 아파트 / 계단 [지상 각층] 21.8375
     · 아파트 / 벽체 [지상 12층] 6.57
     · 부대시설 / 지하로비 [각층 지5~지1] 2.2298
── A44657207 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44657207 --area 84.98

▶ 장미마을 삼성래미안2차 (A44657207) · 전용 84.98㎡ · 41463-11200 · 지번 후보 495
   지번 495 (0495-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44657207-84.json
   전유 84.98 + 주거공용 28.07 = 공급 113.05㎡ = 34.2평 → **34평**
   표본: 216동 2002호 (같은 전용 호 245개) · 전용률 75.2%
     · 아파트 / 계단실,승강기 [각층 각층] 28.07
── A44657207 전용 59.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44657207 --area 59.85

▶ 장미마을 삼성래미안2차 (A44657207) · 전용 59.85㎡ · 41463-11200 · 지번 후보 495
   지번 495 (0495-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44657207-59.json
   전유 59.85 + 주거공용 24.6 = 공급 84.45㎡ = 25.55평 → **26평**
   표본: 212동 204호 (같은 전용 호 50개) · 전용률 70.9%
     · 아파트 / 계단실,승강기 [각층 각층] 24.6
── A10025541 전용 59.5731

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025541 --area 59.5731

▶ 신흥덕 롯데캐슬레이시티 (A10025541) · 전용 59.5731㎡ · 41463-10100 · 지번 후보 736
   지번 736 (0736-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025541-59.json
   전유 59.573 + 주거공용 27.916 = 공급 87.49㎡ = 26.47평 → **26평**
   표본: 101동 1803 (같은 전용 호 212개) · 전용률 68.1%
     · 아파트 / 홀,계단(주거공용) [지상 각층] 20.2256
     · 아파트 / 벽체 [지상 18층] 6.1605
     · 부대시설 / 홀,계단(기타공용) [각층 지3~지1] 1.5302
   ⚠️ 전용률 68.1% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A44695804 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44695804 --area 59.97

▶ 금화마을주공3단지 (A44695804) · 전용 59.97㎡ · 41463-10300 · 지번 후보 481
   지번 481 (0481-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44695804-59.json
   전유 59.97 + 주거공용 18.583 = 공급 78.55㎡ = 23.76평 → **24평**
   표본: 304동 1001호 (같은 전용 호 227개) · 전용률 76.3%
     · 아파트 / 복도,계단,승강기등 [각층] 18.5833
⏳ 시간 예산(1200초)에 닿아 1275줄은 다음 칸으로 미룹니다
```
