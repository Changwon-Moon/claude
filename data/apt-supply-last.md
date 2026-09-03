# 단지 공급면적 — 마지막 실행

- 성공 12건 · 실패 7건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10026043 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026043 --area 59.97

▶ 갈매6단지 (A10026043) · 전용 59.97㎡ · 41310-10100 · 지번 후보 631
   지번 631 (0631-0000) · 대지 → 줄 200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026043-59.json
   전유 59.97 + 주거공용 22.943 = 공급 82.91㎡ = 25.08평 → **25평**
   표본: 608동 504 (같은 전용 호 13개) · 전용률 72.3%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 21.7382
     · 아파트 / 지하주차장연결통로,주출입구연결통로 [지하 지1] 1.2052
── A44347023 전용 59.39

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44347023 --area 59.39

▶ 영통벽적골주공9 (A44347023) · 전용 59.39㎡ · 41117-10500 · 지번 후보 13, 970-3
   지번 13 (0013-0000) · 대지 → 줄 0개
   지번 970-3 (0970-0003) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44347023-59.json
   전유 59.39 + 주거공용 22.037 = 공급 81.43㎡ = 24.63평 → **25평**
   표본: 906동 503호 (같은 전용 호 276개) · 전용률 72.9%
     · 아파트 / 계단실,승강기등 [각층] 17.7731
     · 아파트 / 대피소 [지하 지층] 4.2635
── A42384502 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42384502 --area 58.01

▶ 하안주공9단지 (A42384502) · 전용 58.01㎡ · 41210-10300 · 지번 후보 13
   지번 13 (0013-0000) · 대지 → 줄 1700개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42384502-59.json
   전유 58.01 + 주거공용 22.16 = 공급 80.17㎡ = 24.25평 → **24평**
   표본: 912동 1004호 (같은 전용 호 228개) · 전용률 72.4%
     · 아파트 / [] 22.16
── A10025310 전용 59.9335

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025310 --area 59.9335

▶ 백련산 에스케이뷰 아이파크 (A10025310) · 전용 59.9335㎡ · 11380-10700 · 지번 후보 767
   지번 767 (0767-0000) · 대지 → 줄 0개
::error::767 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025310 --area 59.9335`
Exit status 1
── A15190705 전용 84.79

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15190705 --area 84.79

▶ 신림푸르지오 (A15190705) · 전용 84.79㎡ · 11620-10200 · 지번 후보 1730
   지번 1730 (1730-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15190705-84.json
   전유 84.79 + 주거공용 20.18 = 공급 104.97㎡ = 31.75평 → **32평**
   표본: 114동 2201 (같은 전용 호 194개) · 전용률 80.8%
     · 아파트 / 계단실 [각층 각층] 15.36
     · 아파트 / 벽체면적 [각층 각층] 4.82
── A12179504 전용 84.66

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12179504 --area 84.66

▶ 상암월드컵파크9단지 (A12179504) · 전용 84.66㎡ · 11440-12700 · 지번 후보 1752
   지번 1752 (1752-0000) · 대지 → 줄 1800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12179504-84.json
   전유 84.66 + 주거공용 31.79 = 공급 116.45㎡ = 35.23평 → **35평**
   표본: 903동 1003 (같은 전용 호 78개) · 전용률 72.7%
     · 아파트 / 벽체,계단실,승강기,홀 [각층 각층] 29.23
     · 아파트 / 지하계단실 [각층 지2-지1] 2.56
── A10022853 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022853 --area 59.98

▶ 산성역 자이푸르지오2단지 (A10022853) · 전용 59.98㎡ · 41131-10100 · 지번 후보 6963
   지번 6963 (6963-0000) · 대지 → 줄 0개
::error::지번 후보 6963 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022853 --area 59.98`
Exit status 1
── A10028139 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028139 --area 84.88

▶ 미사강변골든센트로 (A10028139) · 전용 84.88㎡ · 41450-10900 · 지번 후보 1162
   지번 1162 (1162-0000) · 대지 → 줄 0개
::error::지번 후보 1162 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10028139 --area 84.88`
Exit status 1
── A15106901 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15106901 --area 84.92

▶ 봉천두산1,2단지 (A15106901) · 전용 84.92㎡ · 11620-10100 · 지번 후보 769, 10, 1331, 1708
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 2800개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15106901-84.json
   전유 84.92 + 주거공용 27.86 = 공급 112.78㎡ = 34.12평 → **34평**
   표본: 두산아파트 112동 1105호 (같은 전용 호 197개) · 전용률 75.3%
     · 아파트 / 계단,복도 [각층 각층] 19.33
     · 아파트 / 대피소 [지상 지1층] 8.53
── A10027686 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027686 --area 84.98

▶ 위례롯데캐슬아파트 (A10027686) · 전용 84.98㎡ · 41450-11600 · 지번 후보 672
   지번 672 (0672-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027686-84.json
   전유 84.98 + 주거공용 29.25 = 공급 114.23㎡ = 34.55평 → **35평**
   표본: 6408동 1101 (같은 전용 호 29개) · 전용률 74.4%
     · 아파트 / 벽체,계단 [지상 각층] 29.2504
── A10025024 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025024 --area 59.98

▶ 신길센트럴자이 (A10025024) · 전용 59.98㎡ · 11560-13200 · 지번 후보 4964, 337-246
   지번 4964 (4964-0000) · 대지 → 줄 100개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025024-59.json
   전유 59.98 + 주거공용 23.96 = 공급 83.94㎡ = 25.39평 → **25평**
   표본: 110동 1202 (같은 전용 호 7개) · 전용률 71.5%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 18.29
     · 아파트 / 벽체 [지상 12층] 5.67
── A15681110 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15681110 --area 84.92

▶ 대방대림 (A15681110) · 전용 84.92㎡ · 11590-10800 · 지번 후보 501
   지번 501 (0501-0000) · 대지 → 줄 0개
::error::지번 후보 501 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15681110 --area 84.92`
Exit status 1
── A10026881 전용 59.943

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026881 --area 59.943

▶ 서울역센트럴자이아파트 (A10026881) · 전용 59.943㎡ · 11140-17400 · 지번 후보 273
   지번 273 (0273-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026881-59.json
   전유 59.943 + 주거공용 24.775 = 공급 84.72㎡ = 25.63평 → **26평**
   표본: 102동 2302 (같은 전용 호 91개) · 전용률 70.8%
     · 아파트 / 계단실 [각층 각층] 18.7891
     · 아파트 / 벽체 [지상 23층] 5.6013
     · 부대시설 / 지하계단실 [지하 지1층] 0.3849
── A12175203 전용 84.3884

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12175203 --area 84.3884

▶ 마포래미안푸르지오 (A12175203) · 전용 84.3884㎡ · 11440-10100 · 지번 후보 777, 767
   지번 777 (0777-0000) · 대지 → 줄 2200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12175203-84.json
   전유 84.388 + 주거공용 26.567 = 공급 110.96㎡ = 33.56평 → **34평**
   표본: 408동 2104 (같은 전용 호 124개) · 전용률 76.1%
     · 아파트 / 외벽,계단실 [각층 각층] 26.5666
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) · 대지 → 줄 200개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 271-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) · 대지 → 줄 0개
::error::지번 후보 248 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
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
   지번 6029 (6029-0000) · 대지 → 줄 1300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026600-84.json
   전유 84.99 + 주거공용 29.086 = 공급 114.08㎡ = 34.51평 → **35평**
   표본: 2206동 1403 (같은 전용 호 107개) · 전용률 74.5%
     · 아파트 / 코아 [지상 각층] 21.6163
     · 아파트 / 외벽 [지상 14층] 6.14
     · 부대시설 / 지하코아 [지하 지1] 1.3295
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) · 대지 → 줄 300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028021-84.json
   전유 84.48 + 주거공용 39.87 = 공급 124.35㎡ = 37.62평 → **38평**
   표본: 202동 1302 (같은 전용 호 3개) · 전용률 67.9%
     · 아파트 / 계단실,승강기,홀,복도 [각층 각층] 33.26
     · 아파트 / 벽체 [지상 13층] 6.61
   ⚠️ 전용률 67.9% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
```
