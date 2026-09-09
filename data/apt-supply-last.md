# 단지 공급면적 — 마지막 실행

- 성공 92건 · 실패 93건 · 미룸 421줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 172/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
��급 114.09㎡ = 34.51평 → **35평**
   표본: 201동 802 (같은 전용 호 425개) · 전용률 74.5%
     · 아파트 / 벽체,계단실 [지상 각층] 27.871
     · 아파트 / 지하주동출입구 [각층 지1] 1.2159
── A44170408 전용 84.42

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 84.42

▶ 금곡엘지빌리지아파트 (A44170408) · 전용 84.42㎡ · 41113-13400 · 지번 후보 520
   지번 520 (0520-0000) · 대지 → 줄 3000개
::error::전용 84.42㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 520) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 84.42`
Exit status 1
── A44170408 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 60

▶ 금곡엘지빌리지아파트 (A44170408) · 전용 60㎡ · 41113-13400 · 지번 후보 520
   지번 520 (0520-0000) · 대지 → 줄 3000개
::error::전용 60㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 520) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44170408 --area 60`
Exit status 1
── A10027421 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027421 --area 84.99

▶ 수원아이파크시티7단지 (A10027421) · 전용 84.99㎡ · 41113-13700 · 지번 후보 1337
   지번 1337 (1337-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027421-84.json
   전유 84.99 + 주거공용 24.85 = 공급 109.84㎡ = 33.23평 → **33평**
   표본: 708 703 (같은 전용 호 30개) · 전용률 77.4%
     · 아파트 / 벽체,계단실 [지상 각층] 24.85
── A10027295 전용 84.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027295 --area 84.8

▶ 수원아이파크시티 5,6단지 아파트 (A10027295) · 전용 84.8㎡ · 41113-13700 · 지번 후보 1355
   지번 1355 (1355-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027295-84.json
   전유 84.8 + 주거공용 31.8 = 공급 116.6㎡ = 35.27평 → **35평**
   표본: 505동 1104 (같은 전용 호 214개) · 전용률 72.7%
     · 아파트 / 벽체,코아 [지상 각층] 31.8
── A10027295 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027295 --area 59.96

▶ 수원아이파크시티 5,6단지 아파트 (A10027295) · 전용 59.96㎡ · 41113-13700 · 지번 후보 1355
   지번 1355 (1355-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027295-59.json
   전유 59.96 + 주거공용 23.1 = 공급 83.06㎡ = 25.13평 → **25평**
   표본: 510동 706 (같은 전용 호 149개) · 전용률 72.2%
     · 아파트 / 벽체,코아 [지상 각층] 23.1
── A44173912 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44173912 --area 84.87

▶ 수원아이파크시티2단지 (A44173912) · 전용 84.87㎡ · 41113-13700 · 지번 후보 1361
   지번 1361 (1361-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44173912-84.json
   전유 84.87 + 주거공용 28.492 = 공급 113.36㎡ = 34.29평 → **34평**
   표본: 207동 1004 (같은 전용 호 259개) · 전용률 74.9%
     · 아파트 / 계단실,승강기 [지상 각층] 20.169
     · 아파트 / 벽체 [지상 10층] 8.323
── A44182326 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44182326 --area 59.97

▶ 수원시청역SK뷰 (A44182326) · 전용 59.97㎡ · 41113-13700 · 지번 후보 1035
   지번 1035 (1035-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44182326-59.json
   전유 59.97 + 주거공용 22.93 = 공급 82.9㎡ = 25.08평 → **25평**
   표본: 106동 504 (같은 전용 호 69개) · 전용률 72.3%
     · 아파트 / EV홀,계단,초과발코니,세대벽체 [지상 각층] 22.93
── A44183728 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44183728 --area 60

▶ 권선유원보성 (A44183728) · 전용 60㎡ · 41113-13700 · 지번 후보 1265
   지번 1265 (1265-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44183728-59.json
   전유 60 + 주거공용 14.198 = 공급 74.2㎡ = 22.44평 → **22평**
   표본: 610동 704호 (같은 전용 호 327개) · 전용률 80.9%
     · 아파트 / 계단실 [각층] 14.198
── A44171927 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44171927 --area 59.88

▶ 권선대원신동아 (A44171927) · 전용 59.88㎡ · 41113-13700 · 지번 후보 1274
   지번 1274 (1274-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44171927-59.json
   전유 59.88 + 주거공용 14.68 = 공급 74.56㎡ = 22.55평 → **23평**
   표본: 503동 1202호 (같은 전용 호 325개) · 전용률 80.3%
     · 아파트 / 복도,계단 [지상 12층] 14.68
── A44173913 전용 84.9441

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44173913 --area 84.9441

▶ 권선자이e편한세상 (A44173913) · 전용 84.9441㎡ · 41113-13700 · 지번 후보 1330
   지번 1330 (1330-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44173913-84.json
   전유 84.944 + 주거공용 27.288 = 공급 112.23㎡ = 33.95평 → **34평**
   표본: 110동 301 (같은 전용 호 151개) · 전용률 75.7%
     · 아파트 / 계단실,승강기 [각층 각층] 12.0796
     · 아파트 / 발코니 [지상 3층] 9.3316
     · 아파트 / 벽체 [지상 3층] 5.8769
── A10023204 전용 84.8505

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 84.8505

▶ 서광교 파크 스위첸 (A10023204) · 전용 84.8505㎡ · 41111-13700 · 지번 후보 244
   지번 244 (0244-0000) · 대지 → 줄 0개
::error::지번 후보 244 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 84.8505`
Exit status 1
── A10022987 전용 84.9666

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022987 --area 84.9666

▶ 포레나북수원 (A10022987) · 전용 84.9666㎡ · 41111-12900 · 지번 후보 640
   지번 640 (0640-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022987-84.json
   전유 84.967 + 주거공용 24.181 = 공급 109.15㎡ = 33.02평 → **33평**
   표본: 111동 1403 (같은 전용 호 190개) · 전용률 77.8%
     · 아파트 / 계단실 [지상 각층] 18.0631
     · 아파트 / 벽체 [지상 14층] 6.1182
── A10022677 전용 59.84

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022677 --area 59.84

▶ 북수원자이렉스비아 (A10022677) · 전용 59.84㎡ · 41111-13000 · 지번 후보 964, 530-6
   지번 964 (0964-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10022677-59.json
   전유 59.84 + 주거공용 20.95 = 공급 80.79㎡ = 24.44평 → **24평**
   표본: 113동 1905 (같은 전용 호 232개) · 전용률 74.1%
     · 아파트 / 계단실 [지상 각층] 15.07
     · 아파트 / 벽체 [지상 19층] 5.88
── A10023204 전용 59.1473

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 59.1473

▶ 서광교 파크 스위첸 (A10023204) · 전용 59.1473㎡ · 41111-13700 · 지번 후보 244
   지번 244 (0244-0000) · 대지 → 줄 0개
::error::지번 후보 244 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 59.1473`
Exit status 1
── A10024170 전용 59.78

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024170 --area 59.78

▶ 화서역 파크 푸르지오 (A10024170) · 전용 59.78㎡ · 41111-13000 · 지번 후보 950
   지번 950 (0950-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024170-59.json
   전유 59.78 + 주거공용 24.109 = 공급 83.89㎡ = 25.38평 → **25평**
   표본: 108동 704 (같은 전용 호 84개) · 전용률 71.3%
     · 아파트 / 계단실 [지상 각층] 17.1794
     · 아파트 / 벽체 [지상 7층] 6.93
── A10024170 전용 84.7

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024170 --area 84.7

▶ 화서역 파크 푸르지오 (A10024170) · 전용 84.7㎡ · 41111-13000 · 지번 후보 950
   지번 950 (0950-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024170-84.json
   전유 84.7 + 주거공용 32.251 = 공급 116.95㎡ = 35.38평 → **35평**
   표본: 109동 1805 (같은 전용 호 235개) · 전용률 72.4%
     · 아파트 / 계단실 [지상 각층] 24.3409
     · 아파트 / 벽체 [지상 18층] 7.91
── A44072412 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44072412 --area 59.4

▶ 율전밤꽃마을뜨란채 (A44072412) · 전용 59.4㎡ · 41111-13200 · 지번 후보 546
   지번 546 (0546-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44072412-59.json
   전유 59.06 + 주거공용 16.417 = 공급 75.48㎡ = 22.83평 → **23평**
   표본: 104동 802 (같은 전용 호 86개) · 전용률 78.3%
     · 아파트 / 계단실,승강기등 [각층 각층] 15.9777
     · 아파트 / 피트연결통로 [지하 지1층] 0.4395
── A44070904 전용 59.962

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44070904 --area 59.962

▶ 수원한일타운아파트 (A44070904) · 전용 59.962㎡ · 41111-13600 · 지번 후보 881
   지번 881 (0881-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44070904-59.json
   전유 59.962 + 주거공용 16.081 = 공급 76.04㎡ = 23평 → **23평**
   표본: 114동 1003호 (같은 전용 호 168개) · 전용률 78.8%
     · 아파트 / 코아 [각층] 16.081
── A44070707 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44070707 --area 84.98

▶ 정자동신2차 (A44070707) · 전용 84.98㎡ · 41111-13000 · 지번 후보 313-1
   지번 313-1 (0313-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44070707-84.json
   전유 84.98 + 주거공용 29.38 = 공급 114.36㎡ = 34.59평 → **35평**
   표본: 207동 702호 (같은 전용 호 55개) · 전용률 74.3%
     · 아파트 / 계단복도 [지상 7층] 19.97
     · 아파트 / 지하실 [지하 지1층] 6.09
     · 아파트 / 중앙공급실 [지상 1층] 1.42
     · 부대시설 / 관리사무실 [지상 1층] 0.51
     · 아파트 / 열교환실.공중변소 [지상 1층] 0.51
     · 복리시설 / 노인시설 [지상 1층] 0.45
     · 부대시설 / 경비실 [지상] 0.22
     · 아파트 / 지역변전실.열교환실 [지하 지1층] 0.21
── A44070707 전용 59.66

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44070707 --area 59.66

▶ 정자동신2차 (A44070707) · 전용 59.66㎡ · 41111-13000 · 지번 후보 313-1
   지번 313-1 (0313-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44070707-59.json
   전유 59.66 + 주거공용 19.9 = 공급 79.56㎡ = 24.07평 → **24평**
   표본: 206동 1208호 (같은 전용 호 40개) · 전용률 75.0%
     · 아파트 / 계단복도 [지상 십이층] 14.36
     · 아파트 / 지하실 [지하 지1층] 4.36
     · 아파트 / 중앙공급실 [지하 지1층] 0.5
     · 부대시설 / 관리사무실 [지하 지1층] 0.17
     · 부대시설 / 경비실 [지상] 0.16
     · 복리시설 / 노인시설 [지상 일층] 0.15
     · 아파트 / 열교환실및공중변소 [지하 지1층] 0.13
     · 아파트 / 지역변전실.열교환실 [지하 지1층] 0.07
── A44073008 전용 84.9981

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44073008 --area 84.9981

▶ 비단마을베스트타운아파트 (A44073008) · 전용 84.9981㎡ · 41111-13300 · 지번 후보 511
   지번 511 (0511-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44073008-84.json
   전유 84.998 + 주거공용 21.433 = 공급 106.43㎡ = 32.2평 → **32평**
   표본: 737동 1203호 (같은 전용 호 425개) · 전용률 79.9%
     · 아파트 / 계단실,엘리베이터 [각층 각층] 21.433
── A44070904 전용 84.772

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44070904 --area 84.772

▶ 수원한일타운아파트 (A44070904) · 전용 84.772㎡ · 41111-13600 · 지번 후보 881
   지번 881 (0881-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44070904-84.json
   전유 84.772 + 주거공용 16.064 = 공급 100.84㎡ = 30.5평 → **31평**
   표본: 119동 204호 (같은 전용 호 195개) · 전용률 84.1%
     · 아파트 / 코아 [각층] 16.064
── A44071603 전용 84.34

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44071603 --area 84.34

▶ 조원주공뉴타운2단지 (A44071603) · 전용 84.34㎡ · 41111-13600 · 지번 후보 861
   지번 861 (0861-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44071603-84.json
   전유 84.34 + 주거공용 21.369 = 공급 105.71㎡ = 31.98평 → **32평**
   표본: 212동 1702호 (같은 전용 호 174개) · 전용률 79.8%
     · 아파트 / 계단실,승강기등 [각층] 21.3695
── A44071603 전용 59.42

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44071603 --area 59.42

▶ 조원주공뉴타운2단지 (A44071603) · 전용 59.42㎡ · 41111-13600 · 지번 후보 861
   지번 861 (0861-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44071603-59.json
   전유 59.42 + 주거공용 15.056 = 공급 74.48㎡ = 22.53평 → **23평**
   표본: 201동 1505호 (같은 전용 호 247개) · 전용률 79.8%
     · 아파트 / 계단실,승강기등 [각층] 15.0555
── A44072212 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44072212 --area 59.98

▶ 화서역 우방 센트럴파크 (A44072212) · 전용 59.98㎡ · 41111-13000 · 지번 후보 887-1
   지번 887-1 (0887-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44072212-59.json
   전유 59.98 + 주거공용 13.363 = 공급 73.34㎡ = 22.19평 → **22평**
   표본: 323동 1606호 (같은 전용 호 327개) · 전용률 81.8%
     · 아파트 / 계단실, ELEV [각층] 13.363
── A44030005 전용 84.911

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44030005 --area 84.911

▶ 수원SK스카이뷰 (A44030005) · 전용 84.911㎡ · 41111-13000 · 지번 후보 945
   지번 945 (0945-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44030005-84.json
   전유 84.911 + 주거공용 31.105 = 공급 116.02㎡ = 35.09평 → **35평**
   표본: 125동 2303 (같은 전용 호 209개) · 전용률 73.2%
     · 아파트 / 벽체,계단실 [지상 각층] 31.105
── A44030005 전용 59.961

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44030005 --area 59.961

▶ 수원SK스카이뷰 (A44030005) · 전용 59.961㎡ · 41111-13000 · 지번 후보 945
   지번 945 (0945-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44030005-59.json
   전유 59.961 + 주거공용 22.559 = 공급 82.52㎡ = 24.96평 → **25평**
   표본: 111동 1604 (같은 전용 호 90개) · 전용률 72.7%
     · 아파트 / 벽체,계단실 [지상 각층] 22.559
── A44070706 전용 56.71

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44070706 --area 56.71

▶ 정자동신1차 (A44070706) · 전용 56.71㎡ · 41111-13000 · 지번 후보 395
   지번 395 (0395-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44070706-59.json
   전유 56.71 + 주거공용 18.9 = 공급 75.61㎡ = 22.87평 → **23평**
   표본: 108동 909호 (같은 전용 호 266개) · 전용률 75.0%
     · 아파트 / 계단복도 [지상 9층] 12.7
     · 아파트 / 지하실 [지하 지1층] 4.24
     · 아파트 / 기계실 [지하 지1층] 0.99
     · 아파트 / 열교환실 [지하 지1층] 0.39
     · 복리시설 / 노인정.공중변소 [지상 1층] 0.38
     · 부대시설 / 관리사무실 [지상 1층] 0.2
── A44072412 전용 84.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44072412 --area 84.8

▶ 율전밤꽃마을뜨란채 (A44072412) · 전용 84.8㎡ · 41111-13200 · 지번 후보 546
   지번 546 (0546-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44072412-84.json
   전유 84.8 + 주거공용 23.572 = 공급 108.37㎡ = 32.78평 → **33평**
   표본: 109동 1202 (같은 전용 호 411개) · 전용률 78.3%
     · 아파트 / 계단실,승강기등 [각층 각층] 22.9413
     · 아파트 / 피트연결통로 [지하 지1층] 0.631
── A10021122 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10021122 --area 84.99

::error::A10021122 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10021122 --area 84.99`
Exit status 1
── A10021122 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10021122 --area 59.99

::error::A10021122 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10021122 --area 59.99`
Exit status 1
── A10022525 전용 84.977

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022525 --area 84.977

▶ 강동헤리티지자이 (A10022525) · 전용 84.977㎡ · 11740-10500 · 지번 후보 160
   지번 160 (0160-0000) · 대지 → 줄 0개
::error::지번 후보 160 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022525 --area 84.977`
Exit status 1
── A10022525 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022525 --area 59.98

▶ 강동헤리티지자이 (A10022525) · 전용 59.98㎡ · 11740-10500 · 지번 후보 160
   지번 160 (0160-0000) · 대지 → 줄 0개
::error::지번 후보 160 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022525 --area 59.98`
Exit status 1
── A10024468 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024468 --area 59.99

▶ 강동리버스트4단지 (A10024468) · 전용 59.99㎡ · 11740-11000 · 지번 후보 114
   지번 114 (0114-0000) · 대지 → 줄 0개
::error::지번 후보 114 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024468 --area 59.99`
Exit status 1
── A10024473 전용 59.9398

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024473 --area 59.9398

▶ 고덕자이 아파트 (A10024473) · 전용 59.9398㎡ · 11740-10300 · 지번 후보 521, 124
   지번 521 (0521-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024473-59.json
   전유 59.94 + 주거공용 23.367 = 공급 83.31㎡ = 25.2평 → **25평**
   표본: 115동 2205 (같은 전용 호 157개) · 전용률 72.0%
     · 아파트 / 계단,복도 [각층 각층] 16.8821
     · 아파트 / 벽체 [지상 22층] 6.4846
── A10024473 전용 84.7398

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024473 --area 84.7398

▶ 고덕자이 아파트 (A10024473) · 전용 84.7398㎡ · 11740-10300 · 지번 후보 521, 124
   지번 521 (0521-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024473-84.json
   전유 84.74 + 주거공용 25.267 = 공급 110.01㎡ = 33.28평 → **33평**
   표본: 112동 1101 (같은 전용 호 293개) · 전용률 77.0%
     · 아파트 / 계단,복도 [각층 각층] 17.1958
     · 아파트 / 벽체 [지상 11층] 8.0709
── A10025112 전용 59.981

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025112 --area 59.981

▶ 고덕롯데캐슬베네루체 (A10025112) · 전용 59.981㎡ · 11740-10300 · 지번 후보 187
   지번 187 (0187-0000) · 대지 → 줄 0개
::error::지번 후보 187 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025112 --area 59.981`
Exit status 1
── A10025263 전용 84.046

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 84.046

▶ 고덕 그라시움 아파트 (A10025263) · 전용 84.046㎡ · 11740-10200 · 지번 후보 212
   지번 212 (0212-0000) · 대지 → 줄 0개
::error::지번 후보 212 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 84.046`
Exit status 1
── A10025010 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025010 --area 84.97

▶ 고덕 아르테온 아파트 (A10025010) · 전용 84.97㎡ · 11740-10300 · 지번 후보 519
   지번 519 (0519-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025010-84.json
   전유 84.97 + 주거공용 29.01 = 공급 113.98㎡ = 34.48평 → **34평**
   표본: 302동 1003 (같은 전용 호 345개) · 전용률 74.6%
     · 아파트 / 벽체,계단실 [각층 각층] 29.01
── A10025010 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025010 --area 59.98

▶ 고덕 아르테온 아파트 (A10025010) · 전용 59.98㎡ · 11740-10300 · 지번 후보 519
   지번 519 (0519-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025010-59.json
   전유 59.98 + 주거공용 21.07 = 공급 81.05㎡ = 24.52평 → **25평**
   표본: 330동 201 (같은 전용 호 129개) · 전용률 74.0%
     · 아파트 / 벽체,계단실 [각층 각층] 21.07
── A10025263 전용 59.785

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 59.785

▶ 고덕 그라시움 아파트 (A10025263) · 전용 59.785㎡ · 11740-10200 · 지번 후보 212
   지번 212 (0212-0000) · 대지 → 줄 0개
::error::지번 후보 212 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025263 --area 59.785`
Exit status 1
── A10025112 전용 84.146

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025112 --area 84.146

▶ 고덕롯데캐슬베네루체 (A10025112) · 전용 84.146㎡ · 11740-10300 · 지번 후보 187
   지번 187 (0187-0000) · 대지 → 줄 0개
::error::지번 후보 187 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025112 --area 84.146`
Exit status 1
── A13470101 전용 57.1

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13470101 --area 57.1

▶ 길동삼익파크 (A13470101) · 전용 57.1㎡ · 11740-10500 · 지번 후보 53
   지번 53 (0053-0000) · 대지 → 줄 1560개
::error::전용 57.1㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 53) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13470101 --area 57.1`
Exit status 1
── A13405003 전용 84.988

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13405003 --area 84.988

▶ 프라이어팰리스 (A13405003) · 전용 84.988㎡ · 11740-10700 · 지번 후보 413
   지번 413 (0413-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13405003-84.json
   전유 84.988 + 주거공용 27.082 = 공급 112.07㎡ = 33.9평 → **34평**
   표본: 121동 1304호 (같은 전용 호 286개) · 전용률 75.8%
     · 아파트 / 계단실,승강기 [각층 각층] 27.082
── A13405003 전용 59.983

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13405003 --area 59.983

▶ 프라이어팰리스 (A13405003) · 전용 59.983㎡ · 11740-10700 · 지번 후보 413
   지번 413 (0413-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13405003-59.json
   전유 59.983 + 주거공용 19.667 = 공급 79.65㎡ = 24.09평 → **24평**
   표본: 103동 703호 (같은 전용 호 100개) · 전용률 75.3%
     · 아파트 / 계단실,승강기 [각층 각층] 19.667
── A13405201 전용 82.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13405201 --area 82.94

▶ 암사선사현대 (A13405201) · 전용 82.94㎡ · 11740-10700 · 지번 후보 1932-6, 481, 700-1, 818, 929, 509
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 509 (0509-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13405201-84.json
   전유 82.94 + 주거공용 22.37 = 공급 105.31㎡ = 31.86평 → **32평**
   표본: 109동 904호 (같은 전용 호 65개) · 전용률 78.8%
     · 아파트 / 복도,계단 [각층 각층] 22.37
── A13405201 전용 59.64

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13405201 --area 59.64

▶ 암사선사현대 (A13405201) · 전용 59.64㎡ · 11740-10700 · 지번 후보 1932-6, 481, 700-1, 818, 929, 509
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 509 (0509-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13405201-59.json
   전유 59.64 + 주거공용 16.08 = 공급 75.72㎡ = 22.91평 → **23평**
   표본: 105동 1402호 (같은 전용 호 124개) · 전용률 78.8%
     · 아파트 / 복도,계단 [각층 각층] 16.08
── A13485302 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13485302 --area 84.98

▶ 강동롯데캐슬퍼스트아파트 (A13485302) · 전용 84.98㎡ · 11740-10700 · 지번 후보 414-2
   지번 414-2 (0414-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13485302-84.json
   전유 84.98 + 주거공용 27.85 = 공급 112.83㎡ = 34.13평 → **34평**
   표본: 107동 2702 (같은 전용 호 171개) · 전용률 75.3%
     · 아파트 / 벽체,계단실,승강기,홀 [지상 각층] 27.49
     · 아파트 / 관리사무실,주민공동시설,경로당(지1-1층) [지상 각층] 0.36
── A13485302 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13485302 --area 59.99

▶ 강동롯데캐슬퍼스트아파트 (A13485302) · 전용 59.99㎡ · 11740-10700 · 지번 후보 414-2
   지번 414-2 (0414-0002) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13485302-59.json
   전유 59.99 + 주거공용 27.67 = 공급 87.66㎡ = 26.52평 → **27평**
   표본: 124동 2601 (같은 전용 호 96개) · 전용률 68.4%
     · 아파트 / 벽체,계단실,승강기,홀 [지상 각층] 27.42
     · 아파트 / 관리사무실,주민공동시설,경로당(지1-1층) [지상 각층] 0.25
   ⚠️ 전용률 68.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13403101 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13403101 --area 84.99

▶ 성내삼성 (A13403101) · 전용 84.99㎡ · 11740-10800 · 지번 후보 590
   지번 590 (0590-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13403101-84.json
   전유 84.99 + 주거공용 17.24 = 공급 102.23㎡ = 30.92평 → **31평**
   표본: 204동 2301호 (같은 전용 호 171개) · 전용률 83.1%
     · 아파트 / 계단,승강기 [각층 각층] 17.24
── A13403101 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13403101 --area 59.88

▶ 성내삼성 (A13403101) · 전용 59.88㎡ · 11740-10800 · 지번 후보 590
   지번 590 (0590-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13403101-59.json
   전유 59.88 + 주거공용 18.82 = 공급 78.7㎡ = 23.81평 → **24평**
   표본: 103동 1908호 (같은 전용 호 166개) · 전용률 76.1%
     · 아파트 / 계단,승강기 [각층 각층] 18.82
── A13472701 전용 59.72

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13472701 --area 59.72

▶ 고덕리엔파크3단지 (A13472701) · 전용 59.72㎡ · 11740-10300 · 지번 후보 490
   지번 490 (0490-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13472701-59.json
   전유 59.72 + 주거공용 19.52 = 공급 79.24㎡ = 23.97평 → **24평**
   표본: 307동 701 (같은 전용 호 98개) · 전용률 75.4%
     · 아파트 / 벽체,계단실,승강기,홀 [각층 각층] 19.52
── A13407104 전용 84.755

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13407104 --area 84.755

▶ 명일삼익그린2차 (A13407104) · 전용 84.755㎡ · 11740-10100 · 지번 후보 15
   지번 15 (0015-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13407104-84.json
   전유 84.755 + 주거공용 14.355 = 공급 99.11㎡ = 29.98평 → **30평**
   표본: 505동 1406호 (같은 전용 호 90개) · 전용률 85.5%
     · 부대시설 / [지상 13층] 8.285
     · 부대시설 / [지하 지층] 6.07
   ⚠️ 전용률 85.5% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10025415 전용 84.63

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025415 --area 84.63

▶ 래미안솔베뉴 (A10025415) · 전용 84.63㎡ · 11740-10100 · 지번 후보 359
   지번 359 (0359-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025415-84.json
   전유 84.63 + 주거공용 27.81 = 공급 112.44㎡ = 34.01평 → **34평**
   표본: 107동 802 (같은 전용 호 67개) · 전용률 75.3%
     · 아파트 / 계단실 [각층 각층] 21.48
     · 아파트 / 벽체 [지상 8층] 6.33
── A10025415 전용 59.11

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025415 --area 59.11

▶ 래미안솔베뉴 (A10025415) · 전용 59.11㎡ · 11740-10100 · 지번 후보 359
   지번 359 (0359-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025415-59.json
   전유 59.11 + 주거공용 24.98 = 공급 84.09㎡ = 25.44평 → **25평**
   표본: 101동 1803 (같은 전용 호 284개) · 전용률 70.3%
     · 아파트 / 계단실 [각층 각층] 19.01
     · 아파트 / 벽체 [지상 18층] 5.97
── A10027207 전용 84.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027207 --area 84.88

▶ 래미안힐스테이트 고덕 (A10027207) · 전용 84.88㎡ · 11740-10200 · 지번 후보 688, 670
   지번 688 (0688-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027207-84.json
   전유 84.88 + 주거공용 30.59 = 공급 115.47㎡ = 34.93평 → **35평**
   표본: 207동 1501 (같은 전용 호 160개) · 전용률 73.5%
     · 아파트 / 계단실 [각층 각층] 24.36
     · 아파트 / 벽체 [지상 15층] 6.23
── A13408003 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13408003 --area 84.98

▶ 고덕아이파크아파트 (A13408003) · 전용 84.98㎡ · 11740-10200 · 지번 후보 499
   지번 499 (0499-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13408003-84.json
   전유 84.98 + 주거공용 28.17 = 공급 113.15㎡ = 34.23평 → **34평**
   표본: 105동 1701 (같은 전용 호 207개) · 전용률 75.1%
     · 아파트 / 계단실,승강기,홀,벽체,발코니초과,전실 [각층 각층] 28.17
── A13408003 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13408003 --area 59.99

▶ 고덕아이파크아파트 (A13408003) · 전용 59.99㎡ · 11740-10200 · 지번 후보 499
   지번 499 (0499-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13408003-59.json
   전유 59.99 + 주거공용 25.08 = 공급 85.07㎡ = 25.73평 → **26평**
   표본: 114동 803 (같은 전용 호 120개) · 전용률 70.5%
     · 아파트 / 계단실,승강기,홀,벽체,발코니초과,전실 [각층 각층] 25.08
── A10024787 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024787 --area 84.94

▶ 이편한세상 송파파크센트럴 (A10024787) · 전용 84.94㎡ · 11710-11300 · 지번 후보 696
   지번 696 (0696-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024787-84.json
   전유 84.94 + 주거공용 26.08 = 공급 111.02㎡ = 33.58평 → **34평**
   표본: 202동 1102 (같은 전용 호 262개) · 전용률 76.5%
     · 아파트 / 계단실 [각층 각층] 20.65
     · 아파트 / 벽체 [지상 11층] 5.43
── A10024787 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024787 --area 59.94

▶ 이편한세상 송파파크센트럴 (A10024787) · 전용 59.94㎡ · 11710-11300 · 지번 후보 696
   지번 696 (0696-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024787-59.json
   전유 59.94 + 주거공용 22.71 = 공급 82.65㎡ = 25평 → **25평**
   표본: 202동 1504 (같은 전용 호 162개) · 전용률 72.5%
     · 아파트 / 계단실 [각층 각층] 16.81
     · 아파트 / 벽체 [지상 15층] 5.9
── A10025850 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025850 --area 59.96

▶ 헬리오시티아파트 (A10025850) · 전용 59.96㎡ · 11710-10700 · 지번 후보 479
   지번 479 (0479-0000) · 대지 → 줄 0개
::error::지번 후보 479 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025850 --area 59.96`
Exit status 1
── A10025850 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025850 --area 84.98

▶ 헬리오시티아파트 (A10025850) · 전용 84.98㎡ · 11710-10700 · 지번 후보 479
   지번 479 (0479-0000) · 대지 → 줄 0개
::error::지번 후보 479 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025850 --area 84.98`
Exit status 1
── A13822702 전용 82.06

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822702 --area 82.06

▶ 잠실우성1,2,3차 (A13822702) · 전용 82.06㎡ · 11710-10100 · 지번 후보 101-1
   지번 101-1 (0101-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822702-84.json
   전유 82.06 + 주거공용 5.87 = 공급 87.93㎡ = 26.6평 → **27평**
   표본: 11동 503호 (같은 전용 호 25개) · 전용률 93.3%
     · / [지하 지1] 5.87
   ⚠️ 전용률 93.3% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13876114 전용 84.93

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13876114 --area 84.93

▶ 송파꿈에그린아파트 (A13876114) · 전용 84.93㎡ · 11710-10900 · 지번 후보 901
   지번 901 (0901-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13876114-84.json
   전유 84.93 + 주거공용 34.17 = 공급 119.1㎡ = 36.03평 → **36평**
   표본: 2403동 1804 (같은 전용 호 82개) · 전용률 71.3%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 31.3351
     · 아파트 / 설비배관공간 [각층 지2-지1] 2.8347
── A13876114 전용 59.66

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13876114 --area 59.66

▶ 송파꿈에그린아파트 (A13876114) · 전용 59.66㎡ · 11710-10900 · 지번 후보 901
   지번 901 (0901-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13876114-59.json
   전유 59.66 + 주거공용 24.003 = 공급 83.66㎡ = 25.31평 → **25평**
   표본: 2412동 1004 (같은 전용 호 110개) · 전용률 71.3%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 22.0116
     · 아파트 / 설비배관공간 [각층 지2-지1] 1.9913
── A13876113 전용 59.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13876113 --area 59.85

▶ 송파더센트레아파트 (A13876113) · 전용 59.85㎡ · 11710-10900 · 지번 후보 879
   지번 879 (0879-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13876113-59.json
   전유 59.85 + 주거공용 27.749 = 공급 87.6㎡ = 26.5평 → **26평**
   표본: 2210동 2204 (같은 전용 호 151개) · 전용률 68.3%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 25.623
     · 아파트 / 설비배관공간 [각층 지2-지1] 2.126
   ⚠️ 전용률 68.3% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13822002 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822002 --area 84.95

▶ 잠실동트리지움 (A13822002) · 전용 84.95㎡ · 11710-10100 · 지번 후보 35
   지번 35 (0035-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822002-84.json
   전유 84.95 + 주거공용 25.89 = 공급 110.84㎡ = 33.53평 → **34평**
   표본: 309동 1503호 (같은 전용 호 281개) · 전용률 76.6%
     · 아파트 / 계단실,승강기 [각층 각층] 20.12
     · 아파트 / 벽체 [지상 15층] 5.77
── A13822002 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822002 --area 59.88

▶ 잠실동트리지움 (A13822002) · 전용 59.88㎡ · 11710-10100 · 지번 후보 35
   지번 35 (0035-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822002-59.json
   전유 59.88 + 주거공용 24.82 = 공급 84.7㎡ = 25.62평 → **26평**
   표본: 311동 1302호 (같은 전용 호 83개) · 전용률 70.7%
     · 아파트 / 계단실,승강기 [각층 각층] 19.78
     · 아파트 / 벽체 [지상 13층] 5.04
── A13879102 전용 82.61

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13879102 --area 82.61

▶ 잠실5단지아파트 (A13879102) · 전용 82.61㎡ · 11710-10100 · 지번 후보 27
   지번 27 (0027-0000) · 대지 → 줄 3000개
::error::전용 82.61㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 27) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13879102 --area 82.61`
Exit status 1
── A13822004 전용 84.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822004 --area 84.8

▶ 잠실엘스아파트 (A13822004) · 전용 84.8㎡ · 11710-10100 · 지번 후보 19
   지번 19 (0019-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822004-84.json
   전유 84.8 + 주거공용 26.72 = 공급 111.52㎡ = 33.73평 → **34평**
   표본: 165동 903 (같은 전용 호 306개) · 전용률 76.0%
     · 아파트 / 계단실,승강기 [지상 각층] 20.36
     · 아파트 / 벽체 [지상 각층] 6.36
── A13822004 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822004 --area 59.96

▶ 잠실엘스아파트 (A13822004) · 전용 59.96㎡ · 11710-10100 · 지번 후보 19
   지번 19 (0019-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822004-59.json
   전유 59.96 + 주거공용 24.79 = 공급 84.75㎡ = 25.64평 → **26평**
   표본: 168동 1704 (같은 전용 호 99개) · 전용률 70.8%
     · 아파트 / 계단실,승강기 [지상 각층] 19.44
     · 아파트 / 벽체 [지상 각층] 5.35
── A13822003 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822003 --area 84.99

▶ 잠실리센츠 (A13822003) · 전용 84.99㎡ · 11710-10100 · 지번 후보 22
   지번 22 (0022-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822003-84.json
   전유 84.99 + 주거공용 24.36 = 공급 109.35㎡ = 33.08평 → **33평**
   표본: 227동 501 (같은 전용 호 225개) · 전용률 77.7%
     · 아파트 / 계단실,승강기 [지상 각층] 18.48
     · 아파트 / 벽체 [지상 각층] 5.88
── A13822003 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822003 --area 59.99

▶ 잠실리센츠 (A13822003) · 전용 59.99㎡ · 11710-10100 · 지번 후보 22
   지번 22 (0022-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822003-59.json
   전유 59.99 + 주거공용 22.33 = 공급 82.32㎡ = 24.9평 → **25평**
   표본: 239동 2704 (같은 전용 호 14개) · 전용률 72.9%
     · 아파트 / 계단실,승강기 [지상 각층] 17.19
     · 아파트 / 벽체 [지상 각층] 5.14
── A13822001 전용 84.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822001 --area 84.82

▶ 잠실레이크팰리스 (A13822001) · 전용 84.82㎡ · 11710-10100 · 지번 후보 44
   지번 44 (0044-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822001-84.json
   전유 84.82 + 주거공용 29.98 = 공급 114.8㎡ = 34.73평 → **35평**
   표본: 113동 1402호 (같은 전용 호 165개) · 전용률 73.9%
     · 아파트 / 계단실,승강기 [각층 각층] 23.83
     · 아파트 / 벽체 [지상 14층] 6.15
── A13822001 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13822001 --area 59.97

▶ 잠실레이크팰리스 (A13822001) · 전용 59.97㎡ · 11710-10100 · 지번 후보 44
   지번 44 (0044-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13822001-59.json
   전유 59.97 + 주거공용 26.46 = 공급 86.43㎡ = 26.15평 → **26평**
   표본: 103동 1001호 (같은 전용 호 93개) · 전용률 69.4%
     · 아파트 / 계단실,승강기 [각층 각층] 21.57
     · 아파트 / 벽체 [지상 10층] 4.89
   ⚠️ 전용률 69.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13813010 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13813010 --area 84.98

▶ 오금현대아파트 (A13813010) · 전용 84.98㎡ · 11710-11200 · 지번 후보 1932-6, 481, 700-1, 818, 929, 43
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 43 (0043-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13813010-84.json
   전유 84.98 + 주거공용 17.29 = 공급 102.27㎡ = 30.94평 → **31평**
   표본: 23동 1402호 (같은 전용 호 103개) · 전용률 83.1%
     · 아파트 / 계단 [] 10.48
     · 아파트 / 지하실 [지하 지1] 6.81
     · 아파트 / 복도 [] 0
── A13824006 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13824006 --area 84.97

▶ 잠실파크리오 (A13824006) · 전용 84.97㎡ · 11710-10200 · 지번 후보 17
   지번 17 (0017-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13824006-84.json
   전유 84.97 + 주거공용 23.26 = 공급 108.23㎡ = 32.74평 → **33평**
   표본: 107동 2102 (같은 전용 호 206개) · 전용률 78.5%
     · 아파트 / 계단실,승강기 [지상 각층] 18.06
     · 아파트 / 벽체 [지상 각층] 5.2
── A13824006 전용 59.64

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13824006 --area 59.64

▶ 잠실파크리오 (A13824006) · 전용 59.64㎡ · 11710-10200 · 지번 후보 17
   지번 17 (0017-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13824006-59.json
   전유 59.64 + 주거공용 27.5 = 공급 87.14㎡ = 26.36평 → **26평**
   표본: 119동 902 (같은 전용 호 49개) · 전용률 68.4%
     · 아파트 / 계단실,승강기 [지상 각층] 20.95
     · 아파트 / 벽체 [지상 각층] 6.55
   ⚠️ 전용률 68.4% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13824005 전용 82.45

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13824005 --area 82.45

▶ 신천장미1차2차 (A13824005) · 전용 82.45㎡ · 11710-10200 · 지번 후보 11
   지번 11 (0011-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13824005-84.json
   전유 82.45 + 주거공용 6.97 = 공급 89.42㎡ = 27.05평 → **27평**
   표본: 26동 302호 (같은 전용 호 2개) · 전용률 92.2%
     · 부대시설 / 지하 [지하 지1] 6.21
     · 아파트 / 옥탑 [옥탑 옥1] 0.76
   ⚠️ 전용률 92.2% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13805002 전용 83.06

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13805002 --area 83.06

▶ 올림픽선수기자촌아파트 (A13805002) · 전용 83.06㎡ · 11710-11100 · 지번 후보 89
   지번 89 (0089-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13805002-84.json
   전유 83.06 + 주거공용 17.96 = 공급 101.02㎡ = 30.56평 → **31평**
   표본: 134동 2004 (같은 전용 호 101개) · 전용률 82.2%
     · 부대시설 / 지하실 [] 17.96
     · 다세대주택 / 계단 [] 0
     · 아파트 / 승강기 [] 0
── A13820201 전용 84.751

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13820201 --area 84.751

▶ 올림픽훼밀리타운 (A13820201) · 전용 84.751㎡ · 11710-10800 · 지번 후보 150
   지번 150 (0150-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13820201-84.json
   전유 84.751 + 주거공용 19.641 = 공급 104.39㎡ = 31.58평 → **32평**
   표본: 106동 301호 (같은 전용 호 122개) · 전용률 81.2%
     · 아파트 / 지하층 [] 19.641
     · 다세대주택 / 계단 [] 0
── A13820006 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13820006 --area 84.96

▶ 문정래미안 (A13820006) · 전용 84.96㎡ · 11710-10800 · 지번 후보 1
   지번 1 (0001-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13820006-84.json
   전유 84.96 + 주거공용 26.97 = 공급 111.93㎡ = 33.86평 → **34평**
   표본: 127동 901호 (같은 전용 호 70개) · 전용률 75.9%
     · 부대시설 / 계단실,승강기 [각층 각층] 20.03
     · 부대시설 / 벽체 [각층 각층] 6.47
     · 부대시설 / 기계실,전기실 [지하 지3층] 0.47
⏳ 시간 예산(1200초)에 닿아 421줄은 다음 칸으로 미룹니다
```
