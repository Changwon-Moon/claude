# 단지 공급면적 — 마지막 실행

- 성공 72건 · 실패 145건 · 미룸 71줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 213/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
area 84.9926

▶ DMC SKVIEW 아이파크포레 (A10023076) · 전용 84.9926㎡ · 11380-10100 · 지번 후보 191
   지번 191 (0191-0000) · 대지 → 줄 0개
::error::지번 후보 191 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023076 --area 84.9926`
Exit status 1
── A13984814 전용 84.815

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 84.815

▶ 월계주공2단지 (A13984814) · 전용 84.815㎡ · 11350-10200 · 지번 후보 556
   지번 556 (0556-0000) · 대지 → 줄 3000개
::error::전용 84.815㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 556) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 84.815`
Exit status 1
── A13986306 전용 59.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13986306 --area 59.22

▶ 중계그린 (A13986306) · 전용 59.22㎡ · 11350-10600 · 지번 후보 502-1
   지번 502-1 (0502-0001) · 대지 → 줄 3000개
::error::전용 59.22㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 502-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13986306 --area 59.22`
Exit status 1
── A13984814 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 59.97

▶ 월계주공2단지 (A13984814) · 전용 59.97㎡ · 11350-10200 · 지번 후보 556
   지번 556 (0556-0000) · 대지 → 줄 3000개
::error::전용 59.97㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 556) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 59.97`
Exit status 1
── A13920706 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 84.2

▶ 상계주공4단지 (A13920706) · 전용 84.2㎡ · 11350-10500 · 지번 후보 749-5
   지번 749-5 (0749-0005) · 대지 → 줄 369개
::error::전용 84.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 749-5) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 84.2`
Exit status 1
── A13920706 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 58.01

▶ 상계주공4단지 (A13920706) · 전용 58.01㎡ · 11350-10500 · 지번 후보 749-5
   지번 749-5 (0749-0005) · 대지 → 줄 369개
::error::전용 58.01㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 749-5) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13920706 --area 58.01`
Exit status 1
── A13971502 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2

▶ 상계주공3단지 (A13971502) · 전용 84.2㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 382개
::error::전용 84.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 730-2) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2`
Exit status 1
── A13971502 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 58.01

▶ 상계주공3단지 (A13971502) · 전용 58.01㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 382개
::error::전용 58.01㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 730-2) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 58.01`
Exit status 1
── A13982301 전용 59.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13982301 --area 59.2

▶ 상계주공11단지 (A13982301) · 전용 59.2㎡ · 11350-10500 · 지번 후보 663-1, 652
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 652 (0652-0000) · 대지 → 줄 3000개
::error::전용 59.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 652) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13982301 --area 59.2`
Exit status 1
── A13983105 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13983105 --area 58.01

▶ 상계주공1단지 (A13983105) · 전용 58.01㎡ · 11350-10500 · 지번 후보 663-1, 765
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 765 (0765-0000) · 대지 → 줄 2328개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13983105-59.json
   전유 58.01 + 주거공용 17.12 = 공급 75.13㎡ = 22.73평 → **23평**
   표본: 105동 306호 (같은 전용 호 264개) · 전용률 77.2%
     · 아파트 / 계단,복도등 [각층 각층] 17.12
── A13920506 전용 84.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920506 --area 84.89

▶ 상계벽산 (A13920506) · 전용 84.89㎡ · 11350-10500 · 지번 후보 271-3, 173-1
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 173-1 (0173-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13920506-84.json
   전유 84.89 + 주거공용 10.13 = 공급 95.02㎡ = 28.74평 → **29평**
   표본: 104동 1002호 (같은 전용 호 10개) · 전용률 89.3%
     · 아파트 / 복도,계단 [각층 각층] 9.64
     · 아파트 / 경비실 [지상 1층] 0.49
── A13920506 전용 59.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13920506 --area 59.9

▶ 상계벽산 (A13920506) · 전용 59.9㎡ · 11350-10500 · 지번 후보 271-3, 173-1
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 173-1 (0173-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13920506-59.json
   전유 59.9 + 주거공용 8.16 = 공급 68.06㎡ = 20.59평 → **21평**
   표본: 101동 1107호 (같은 전용 호 80개) · 전용률 88.0%
     · 아파트 / 복도,계단 [각층 각층] 8.04
     · 아파트 / 경비실 [지상 1층] 0.12
── A13980513 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13980513 --area 84.99

▶ 공릉풍림아이원 (A13980513) · 전용 84.99㎡ · 11350-10300 · 지번 후보 725
   지번 725 (0725-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13980513-84.json
   전유 84.99 + 주거공용 15.355 = 공급 100.34㎡ = 30.35평 → **30평**
   표본: 113동 101 (같은 전용 호 178개) · 전용률 84.7%
     · 아파트 / 계단실,전실,벽칸 [각층 각층] 15.355
── A13980019 전용 59.38

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13980019 --area 59.38

▶ 공릉태강 (A13980019) · 전용 59.38㎡ · 11350-10300 · 지번 후보 81
   지번 81 (0081-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13980019-59.json
   전유 59.38 + 주거공용 18.516 = 공급 77.9㎡ = 23.56평 → **24평**
   표본: 1015동 701호 (같은 전용 호 135개) · 전용률 76.2%
     · 아파트 / 코아,현관,복도 [각층 각층] 18.516
── A13204105 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 84.41

▶ 창동주공3단지 (A13204105) · 전용 84.41㎡ · 11320-10700 · 지번 후보 347
   지번 347 (0347-0000) · 대지 → 줄 3000개
::error::전용 84.41㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 347) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 84.41`
Exit status 1
── A13286110 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13286110 --area 84.9

▶ 쌍문한양2,3,4차 (A13286110) · 전용 84.9㎡ · 11320-10500 · 지번 후보 59
   지번 59 (0059-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13286110-84.json
   전유 84.9 + 주거공용 17.204 = 공급 102.1㎡ = 30.89평 → **31평**
   표본: 7동 1505호 (같은 전용 호 54개) · 전용률 83.2%
     · 부대시설 / 복도.계단 [] 10.682
     · / [지하 지층] 6.522
── A13202002 전용 60

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202002 --area 60

▶ 대상타운현대 (A13202002) · 전용 60㎡ · 11320-10600 · 지번 후보 1932-6, 481, 700-1, 818, 929, 720-1
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 720-1 (0720-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13202002-59.json
   전유 60 + 주거공용 15.5 = 공급 75.5㎡ = 22.84평 → **23평**
   표본: 101동 902 (같은 전용 호 51개) · 전용률 79.5%
     · 아파트 / 계단,현관,승강기 [각층] 15.5
── A13204105 전용 58.01

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 58.01

▶ 창동주공3단지 (A13204105) · 전용 58.01㎡ · 11320-10700 · 지번 후보 347
   지번 347 (0347-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13204105-59.json
   전유 58.01 + 주거공용 22.16 = 공급 80.17㎡ = 24.25평 → **24평**
   표본: 306동 1001호 (같은 전용 호 232개) · 전용률 72.4%
     · 아파트 / 복도, 계단실, 에레베타 [] 17.06
     · / [지하 지층] 5.1
── A13290107 전용 84.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 84.9

▶ 창동주공19단지 (A13290107) · 전용 84.9㎡ · 11320-10700 · 지번 후보 663-1, 27
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 27 (0027-0000) · 대지 → 줄 2342개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13290107-84.json
   전유 84.9 + 주거공용 16.32 = 공급 101.22㎡ = 30.62평 → **31평**
   표본: 1907동 1206호 (같은 전용 호 120개) · 전용률 83.9%
     · / [] 16.32
── A13290107 전용 60.5

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 60.5

▶ 창동주공19단지 (A13290107) · 전용 60.5㎡ · 11320-10700 · 지번 후보 663-1, 27
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 27 (0027-0000) · 대지 → 줄 2342개
::error::전용 60.5㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 27) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 60.5`
Exit status 1
── A13204406 전용 84.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204406 --area 84.76

▶ 창동쌍용 (A13204406) · 전용 84.76㎡ · 11320-10700 · 지번 후보 64, 807
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 807 (0807-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13204406-84.json
   전유 84.76 + 주거공용 15.99 = 공급 100.75㎡ = 30.48평 → **30평**
   표본: 115동 1401호 (같은 전용 호 171개) · 전용률 84.1%
     · 아파트 / 현관,계단,E.V [] 15.99
── A13204406 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204406 --area 59.88

▶ 창동쌍용 (A13204406) · 전용 59.88㎡ · 11320-10700 · 지번 후보 64, 807
   지번 64 (0064-0000) · 대지 → 줄 0개
   지번 807 (0807-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13204406-59.json
   전유 59.88 + 주거공용 13.14 = 공급 73.02㎡ = 22.09평 → **22평**
   표본: 104동 2102호 (같은 전용 호 151개) · 전용률 82.0%
     · 아파트 / 현관,계단,E.V [] 13.14
── A13204103 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204103 --area 84.87

▶ 창동삼성 (A13204103) · 전용 84.87㎡ · 11320-10700 · 지번 후보 45
   지번 45 (0045-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13204103-84.json
   전유 84.87 + 주거공용 16.189 = 공급 101.06㎡ = 30.57평 → **31평**
   표본: 117동 2001호 (같은 전용 호 301개) · 전용률 84.0%
     · 부대시설 / 복도 및 계단 [지상 20층] 16.189
── A13204510 전용 84.4516

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204510 --area 84.4516

▶ 창동북한산아이파크 (A13204510) · 전용 84.4516㎡ · 11320-10700 · 지번 후보 825
   지번 825 (0825-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13204510-84.json
   전유 84.452 + 주거공용 27.642 = 공급 112.09㎡ = 33.91평 → **34평**
   표본: 504동 1804 (같은 전용 호 172개) · 전용률 75.3%
     · 아파트 / 벽체,계단실,승강기홀 [각층 각층] 27.6422
── A13204409 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204409 --area 84.97

▶ 창동동아청솔 (A13204409) · 전용 84.97㎡ · 11320-10700 · 지번 후보 808
   지번 808 (0808-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13204409-84.json
   전유 84.97 + 주거공용 15.488 = 공급 100.46㎡ = 30.39평 → **30평**
   표본: 102동 1302호 (같은 전용 호 149개) · 전용률 84.6%
     · 다세대주택 / 계단 [각층] 15.488
── A13204409 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204409 --area 59.76

▶ 창동동아청솔 (A13204409) · 전용 59.76㎡ · 11320-10700 · 지번 후보 808
   지번 808 (0808-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13204409-59.json
   전유 59.76 + 주거공용 15.475 = 공급 75.23㎡ = 22.76평 → **23평**
   표본: 117동 203호 (같은 전용 호 149개) · 전용률 79.4%
     · 다세대주택 / 계단 [각층] 15.475
── A13286110 전용 59.67

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13286110 --area 59.67

▶ 쌍문한양2,3,4차 (A13286110) · 전용 59.67㎡ · 11320-10500 · 지번 후보 59
   지번 59 (0059-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13286110-59.json
   전유 59.67 + 주거공용 18.584 = 공급 78.25㎡ = 23.67평 → **24평**
   표본: 8동 102호 (같은 전용 호 80개) · 전용률 76.3%
     · 부대시설 / 복도.계단 [] 12.754
     · / [지하 지층] 5.83
── A13286304 전용 58.77

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13286304 --area 58.77

▶ 쌍문삼익 (A13286304) · 전용 58.77㎡ · 11320-10500 · 지번 후보 56
   지번 56 (0056-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13286304-59.json
   전유 58.77 + 주거공용 18.379 = 공급 77.15㎡ = 23.34평 → **23평**
   표본: 109동 602호 (같은 전용 호 128개) · 전용률 76.2%
     · 다세대주택 / 복도 [] 11.702
     · 다세대주택 / 계단 [] 6.604
     · 다세대주택 / 경비실 [] 0.073
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 643, 271-1
   지번 643 (0643-0000) · 대지 → 줄 29개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 643) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A13202002 전용 84.78

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202002 --area 84.78

▶ 대상타운현대 (A13202002) · 전용 84.78㎡ · 11320-10600 · 지번 후보 1932-6, 481, 700-1, 818, 929, 720-1
   지번 1932-6 (1932-0006) · 대지 → 줄 0개
   지번 481 (0481-0000) · 대지 → 줄 0개
   지번 700-1 (0700-0001) · 대지 → 줄 0개
   지번 818 (0818-0000) · 대지 → 줄 0개
   지번 929 (0929-0000) · 대지 → 줄 0개
   지번 720-1 (0720-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13202002-84.json
   전유 84.78 + 주거공용 17.96 = 공급 102.74㎡ = 31.08평 → **31평**
   표본: 105동 303 (같은 전용 호 179개) · 전용률 82.5%
     · 아파트 / 계단,현관,승강기 [각층] 17.96
── A13201209 전용 84.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13201209 --area 84.94

▶ 도봉한신 (A13201209) · 전용 84.94㎡ · 11320-10800 · 지번 후보 30-1
   지번 30-1 (0030-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13201209-84.json
   전유 84.94 + 주거공용 20.45 = 공급 105.39㎡ = 31.88평 → **32평**
   표본: 108동 206호 (같은 전용 호 346개) · 전용률 80.6%
     · 아파트 / 계단 및 기타 [] 20.45
── A13201208 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13201208 --area 59.76

▶ 서원아파트 (A13201208) · 전용 59.76㎡ · 11320-10800 · 지번 후보 641
   지번 641 (0641-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13201208-59.json
   전유 59.76 + 주거공용 17.63 = 공급 77.39㎡ = 23.41평 → **23평**
   표본: 113동 1004호 (같은 전용 호 15개) · 전용률 77.2%
     · 아파트 / 복도,계단,EV [] 17.63
── A14207203 전용 84.22

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14207203 --area 84.22

▶ 수유벽산 (A14207203) · 전용 84.22㎡ · 11305-10300 · 지번 후보 271-3, 205
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 205 (0205-0000) · 대지 → 줄 3000개
::error::전용 84.22㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 205) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A14207203 --area 84.22`
Exit status 1
── A14207203 전용 57.46

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14207203 --area 57.46

▶ 수유벽산 (A14207203) · 전용 57.46㎡ · 11305-10300 · 지번 후보 271-3, 205
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 205 (0205-0000) · 대지 → 줄 3000개
::error::전용 57.46㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 205) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A14207203 --area 57.46`
Exit status 1
── A14206003 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14206003 --area 84.41

▶ 번동1단지주공아파트 (A14206003) · 전용 84.41㎡ · 11305-10200 · 지번 후보 242
   지번 242 (0242-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14206003-84.json
   전유 84.41 + 주거공용 7.79 = 공급 92.2㎡ = 27.89평 → **28평**
   표본: 102동 106 (같은 전용 호 66개) · 전용률 91.5%
     · 다세대주택 / 복도,계단실 [지상 1층] 7.79
   ⚠️ 전용률 91.6% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A14207203 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14207203 --area 84.95

▶ 수유벽산 (A14207203) · 전용 84.95㎡ · 11305-10300 · 지번 후보 271-3, 205
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 205 (0205-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14207203-84.json
   전유 84.95 + 주거공용 11.76 = 공급 96.71㎡ = 29.25평 → **29평**
   표본: 6동 504 (같은 전용 호 129개) · 전용률 87.8%
     · 아파트 / 계단실 [지상 5층] 11.51
     · 아파트 / 경비실 [지상 1층] 0.25
── A14272304 전용 84.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272304 --area 84.76

▶ SK북한산시티아파트 (A14272304) · 전용 84.76㎡ · 11305-10100 · 지번 후보 1353
   지번 1353 (1353-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272304-84.json
   전유 84.76 + 주거공용 16.119 = 공급 100.88㎡ = 30.52평 → **31평**
   표본: 116동 1303 (같은 전용 호 164개) · 전용률 84.0%
     · 아파트 / 계단실,승강기홀 [각층 각층] 16.119
── A14272304 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272304 --area 59.98

▶ SK북한산시티아파트 (A14272304) · 전용 59.98㎡ · 11305-10100 · 지번 후보 1353
   지번 1353 (1353-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272304-59.json
   전유 59.98 + 주거공용 15.229 = 공급 75.21㎡ = 22.75평 → **23평**
   표본: 132동 504 (같은 전용 호 126개) · 전용률 79.8%
     · 아파트 / 계단실,승강기홀 [각층 각층] 15.229
── A14272308 전용 84.29

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272308 --area 84.29

▶ 래미안트리베라2차 (A14272308) · 전용 84.29㎡ · 11305-10100 · 지번 후보 812
   지번 812 (0812-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272308-84.json
   전유 84.29 + 주거공용 26.05 = 공급 110.34㎡ = 33.38평 → **33평**
   표본: 218동 1001호 (같은 전용 호 316개) · 전용률 76.4%
     · 아파트 / 벽체,계단실,홀 [각층 각층] 26.05
── A14272308 전용 59.38

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272308 --area 59.38

▶ 래미안트리베라2차 (A14272308) · 전용 59.38㎡ · 11305-10100 · 지번 후보 812
   지번 812 (0812-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272308-59.json
   전유 59.38 + 주거공용 21.1 = 공급 80.48㎡ = 24.35평 → **24평**
   표본: 207동 403호 (같은 전용 호 195개) · 전용률 73.8%
     · 아파트 / 벽체,계단실,홀 [각층 각층] 21.1
── A14210002 전용 84.705

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14210002 --area 84.705

▶ 삼각산아이원 (A14210002) · 전용 84.705㎡ · 11305-10100 · 지번 후보 1357
   지번 1357 (1357-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14210002-84.json
   전유 84.705 + 주거공용 21.384 = 공급 106.09㎡ = 32.09평 → **32평**
   표본: 113동 1501호 (같은 전용 호 195개) · 전용률 79.8%
     · 아파트 / 계단실,승강기 [각층 각층] 15.301
     · 아파트 / 벽체 [각층 각층] 5.193
     · 아파트 / 주민공동시설 [지하 지1] 0.89
── A14272305 전용 84.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272305 --area 84.89

▶ 벽산라이브파크 (A14272305) · 전용 84.89㎡ · 11305-10100 · 지번 후보 271-3, 1354
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 1354 (1354-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272305-84.json
   전유 84.89 + 주거공용 15.938 = 공급 100.83㎡ = 30.5평 → **31평**
   표본: 102동 1003 (같은 전용 호 199개) · 전용률 84.2%
     · 아파트 / 계단실,ELEV,코아 [각층 각층] 15.938
── A14272305 전용 59.67

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272305 --area 59.67

▶ 벽산라이브파크 (A14272305) · 전용 59.67㎡ · 11305-10100 · 지번 후보 271-3, 1354
   지번 271-3 (0271-0003) · 대지 → 줄 0개
   지번 1354 (1354-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272305-59.json
   전유 59.67 + 주거공용 13.54 = 공급 73.21㎡ = 22.15평 → **22평**
   표본: 101동 1602 (같은 전용 호 199개) · 전용률 81.5%
     · 아파트 / 계단실,ELEV,코아 [각층 각층] 13.54
── A14272309 전용 59.6

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272309 --area 59.6

▶ 래미안트리베라1차 (A14272309) · 전용 59.6㎡ · 11305-10100 · 지번 후보 813
   지번 813 (0813-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272309-59.json
   전유 59.6 + 주거공용 27.17 = 공급 86.77㎡ = 26.25평 → **26평**
   표본: 113동 1202호 (같은 전용 호 188개) · 전용률 68.7%
     · 아파트 / 벽체,계단실,홀 [각층 각층] 27.17
   ⚠️ 전용률 68.7% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A14272314 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272314 --area 84.99

▶ 미아뉴타운두산위브트레지움 (A14272314) · 전용 84.99㎡ · 11305-10100 · 지번 후보 769, 10, 1331, 1708, 811
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 811 (0811-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272314-84.json
   전유 84.99 + 주거공용 27.285 = 공급 112.27㎡ = 33.96평 → **34평**
   표본: 301동 603 (같은 전용 호 270개) · 전용률 75.7%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 27.285
── A14272314 전용 59.54

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A14272314 --area 59.54

▶ 미아뉴타운두산위브트레지움 (A14272314) · 전용 59.54㎡ · 11305-10100 · 지번 후보 769, 10, 1331, 1708, 811
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 811 (0811-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A14272314-59.json
   전유 59.54 + 주거공용 25.403 = 공급 84.94㎡ = 25.7평 → **26평**
   표본: 215동 1001 (같은 전용 호 99개) · 전용률 70.1%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 25.403
── A10025241 전용 84.67

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025241 --area 84.67

▶ 꿈의숲 해링턴 플레이스 아파트 (A10025241) · 전용 84.67㎡ · 11305-10100 · 지번 후보 1369
   지번 1369 (1369-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025241-84.json
   전유 84.67 + 주거공용 24.55 = 공급 109.22㎡ = 33.04평 → **33평**
   표본: 110동 101 (같은 전용 호 271개) · 전용률 77.5%
     · 아파트 / 계단실 [각층 각층] 19.17
     · 아파트 / 벽체 [지상 1층] 5.38
── A10025241 전용 59.36

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025241 --area 59.36

▶ 꿈의숲 해링턴 플레이스 아파트 (A10025241) · 전용 59.36㎡ · 11305-10100 · 지번 후보 1369
   지번 1369 (1369-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025241-59.json
   전유 59.36 + 주거공용 18.02 = 공급 77.38㎡ = 23.41평 → **23평**
   표본: 109동 101 (같은 전용 호 133개) · 전용률 76.7%
     · 아파트 / 계단실 [각층 각층] 13.4396
     · 아파트 / 벽체 [지상 1층] 4.58
── A10023926 전용 84.9757

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023926 --area 84.9757

▶ 롯데캐슬클라시아 (A10023926) · 전용 84.9757㎡ · 11290-13400 · 지번 후보 1289, 2545
   지번 1289 (1289-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023926-84.json
   전유 84.976 + 주거공용 24.545 = 공급 109.52㎡ = 33.13평 → **33평**
   표본: 114동 2603 (같은 전용 호 131개) · 전용률 77.6%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 16.5226
     · 아파트 / 벽체 [지상 26층] 8.0222
── A10024488 전용 84.47

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024488 --area 84.47

▶ 꿈의숲아이파크아파트 (A10024488) · 전용 84.47㎡ · 11290-13800 · 지번 후보 323, 189-3
   지번 323 (0323-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024488-84.json
   전유 84.47 + 주거공용 29.17 = 공급 113.64㎡ = 34.38평 → **34평**
   표본: 710동 1802 (같은 전용 호 173개) · 전용률 74.3%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 20.16
     · 아파트 / 벽체 [지상 18층] 9.01
── A10025638 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025638 --area 84.95

▶ 래미안길음센터피스 (A10025638) · 전용 84.95㎡ · 11290-13400 · 지번 후보 1288
   지번 1288 (1288-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025638-84.json
   전유 84.95 + 주거공용 33.21 = 공급 118.16㎡ = 35.74평 → **36평**
   표본: 112동 1703 (같은 전용 호 120개) · 전용률 71.9%
     · 아파트 / 계단실 [각층 각층] 26.03
     · 아파트 / 벽체 [지상 17층] 7.18
── A10025283 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025283 --area 84.97

▶ 래미안아트리치 (A10025283) · 전용 84.97㎡ · 11290-13900 · 지번 후보 410
   지번 410 (0410-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025283-84.json
   전유 84.97 + 주거공용 28 = 공급 112.97㎡ = 34.17평 → **34평**
   표본: 105동 1401 (같은 전용 호 192개) · 전용률 75.2%
     · 아파트 / 계단,ELEV [지상 14층] 21.01
     · 아파트 / 벽체 [지상 14층] 6.99
── A10025638 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025638 --area 59.97

▶ 래미안길음센터피스 (A10025638) · 전용 59.97㎡ · 11290-13400 · 지번 후보 1288
   지번 1288 (1288-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025638-59.json
   전유 59.97 + 주거공용 23.57 = 공급 83.54㎡ = 25.27평 → **25평**
   표본: 101동 306 (같은 전용 호 259개) · 전용률 71.8%
     · 아파트 / 계단실 [각층 각층] 18.39
     · 아파트 / 벽체 [지상 3층] 5.18
── A13613008 전용 84.647

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13613008 --area 84.647

▶ 월곡두산위브아파트 (A13613008) · 전용 84.647㎡ · 11290-13600 · 지번 후보 769, 10, 1331, 1708, 222
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 0개
   지번 1331 (1331-0000) · 대지 → 줄 0개
   지번 1708 (1708-0000) · 대지 → 줄 0개
   지번 222 (0222-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13613008-84.json
   전유 84.647 + 주거공용 25.04 = 공급 109.69㎡ = 33.18평 → **33평**
   표본: 116동 1001 (같은 전용 호 160개) · 전용률 77.2%
     · 부대시설 / 계단,승강기 [각층 각층] 25.04
── A13613007 전용 59.754

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13613007 --area 59.754

▶ 래미안월곡 (A13613007) · 전용 59.754㎡ · 11290-13600 · 지번 후보 225
   지번 225 (0225-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13613007-59.json
   전유 59.754 + 주거공용 19.671 = 공급 79.42㎡ = 24.03평 → **24평**
   표본: 117동 1502 (같은 전용 호 112개) · 전용률 75.2%
     · 아파트 / 벽체,계단실,복도 [각층 각층] 19.671
── A13671205 전용 84.72

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13671205 --area 84.72

▶ 종암SK (A13671205) · 전용 84.72㎡ · 11290-13500 · 지번 후보 104-1
   지번 104-1 (0104-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13671205-84.json
   전유 84.72 + 주거공용 24.84 = 공급 109.56㎡ = 33.14평 → **33평**
   표본: 105동 2404호 (같은 전용 호 151개) · 전용률 77.3%
     · 부대시설 / 아파트 [각층] 16.62
     · 부대시설 / 아파트 [지하 지층] 8.22
── A13671205 전용 59.04

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13671205 --area 59.04

▶ 종암SK (A13671205) · 전용 59.04㎡ · 11290-13500 · 지번 후보 104-1
   지번 104-1 (0104-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13671205-59.json
   전유 59.04 + 주거공용 15.8 = 공급 74.84㎡ = 22.64평 → **23평**
   표본: 106동 314호 (같은 전용 호 55개) · 전용률 78.9%
     · 부대시설 / 계단실,승강기 [각층 각층] 15.8
── A13686302 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13686302 --area 59.99

▶ 래미안 크리시엘 아파트 관리사무소 (A13686302) · 전용 59.99㎡ · 11290-13500 · 지번 후보 80
   지번 80 (0080-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13686302-59.json
   전유 59.99 + 주거공용 16.59 = 공급 76.58㎡ = 23.17평 → **23평**
   표본: 112동 404호 (같은 전용 호 158개) · 전용률 78.3%
     · 아파트 / 계단실,승강기 [각층 각층] 16.33
     · 아파트 / 주민공동시설,문고시설 [지하 지1층] 0.26
── A13610007 전용 84.09

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13610007 --area 84.09

▶ 정릉풍림아이원 (A13610007) · 전용 84.09㎡ · 11290-13300 · 지번 후보 239
   지번 239 (0239-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13610007-84.json
   전유 84.09 + 주거공용 13.113 = 공급 97.2㎡ = 29.4평 → **29평**
   표본: 102동 801호 (같은 전용 호 122개) · 전용률 86.5%
     · 아파트 / 계단실,승강기 [각층 각층] 13.113
── A13610007 전용 59.88

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13610007 --area 59.88

▶ 정릉풍림아이원 (A13610007) · 전용 59.88㎡ · 11290-13300 · 지번 후보 239
   지번 239 (0239-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13610007-59.json
   전유 59.88 + 주거공용 15.739 = 공급 75.62㎡ = 22.87평 → **23평**
   표본: 124동 1005호 (같은 전용 호 158개) · 전용률 79.2%
     · 아파트 / 계단실,승강기 [각층 각층] 15.739
── A10025283 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025283 --area 59.98

▶ 래미안아트리치 (A10025283) · 전용 59.98㎡ · 11290-13900 · 지번 후보 410
   지번 410 (0410-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10025283-59.json
   전유 59.98 + 주거공용 24.95 = 공급 84.93㎡ = 25.69평 → **26평**
   표본: 101동 207 (같은 전용 호 294개) · 전용률 70.6%
     · 아파트 / 계단,ELEV [지상 2층] 19.66
     · 아파트 / 벽체 [지상 2층] 5.29
── A13615003 전용 59.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13615003 --area 59.97

▶ 석관두산 (A13615003) · 전용 59.97㎡ · 11290-13900 · 지번 후보 769, 10, 1331, 1708
   지번 769 (0769-0000) · 대지 → 줄 0개
   지번 10 (0010-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13615003-59.json
   전유 59.97 + 주거공용 14.61 = 공급 74.58㎡ = 22.56평 → **23평**
   표본: 125동 605호 (같은 전용 호 147개) · 전용률 80.4%
     · 아파트 / 계단실,승강기 [지상 6층] 14.61
── A13612002 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13612002 --area 84.97

▶ 성북동아에코빌 (A13612002) · 전용 84.97㎡ · 11290-13700 · 지번 후보 101
   지번 101 (0101-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13612002-84.json
   전유 84.97 + 주거공용 15.82 = 공급 100.79㎡ = 30.49평 → **30평**
   표본: 103동 804 (같은 전용 호 130개) · 전용률 84.3%
     · 아파트 / 계단실,승강기 [각층 각층] 15.82
── A10027189 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027189 --area 84.96

▶ 보문파크뷰자이아파트 (A10027189) · 전용 84.96㎡ · 11290-12800 · 지번 후보 198-45
   지번 198-45 (0198-0045) · 대지 → 줄 0개
::error::지번 후보 198-45 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027189 --area 84.96`
Exit status 1
── A10027189 전용 59.19

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027189 --area 59.19

▶ 보문파크뷰자이아파트 (A10027189) · 전용 59.19㎡ · 11290-12800 · 지번 후보 198-45
   지번 198-45 (0198-0045) · 대지 → 줄 0개
::error::지번 후보 198-45 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027189 --area 59.19`
Exit status 1
── A13606004 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13606004 --area 84.87

▶ 돈암한신한진아파트 (A13606004) · 전용 84.87㎡ · 11290-10300 · 지번 후보 478, 609-1
   지번 478 (0478-0000) · 대지 → 줄 0개
   지번 609-1 (0609-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13606004-84.json
   전유 84.87 + 주거공용 63.29 = 공급 148.16㎡ = 44.82평 → **45평**
   표본: 213동 903호 (같은 전용 호 100개) · 전용률 57.3%
     · / [계] 46.88
     · / 계단,복도 [지상 9층] 16.41
   ⚠️ 전용률 57.3% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13606201 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13606201 --area 59.99

▶ 브라운스톤돈암 (A13606201) · 전용 59.99㎡ · 11290-10300 · 지번 후보 636
   지번 636 (0636-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13606201-59.json
   전유 59.99 + 주거공용 22.88 = 공급 82.87㎡ = 25.07평 → **25평**
   표본: 106동 304호 (같은 전용 호 192개) · 전용률 72.4%
     · 아파트 / 계단실,승강기 [각층 각층] 18.37
     · 아파트 / 벽체 [각층 각층] 4.51
── A13606107 전용 84.59

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13606107 --area 84.59

▶ 돈암삼성 (A13606107) · 전용 84.59㎡ · 11290-10300 · 지번 후보 15-1
   지번 15-1 (0015-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13606107-84.json
   전유 84.59 + 주거공용 15.91 = 공급 100.5㎡ = 30.4평 → **30평**
   표본: 102동 1203호 (같은 전용 호 188개) · 전용률 84.2%
     · / 계단,엘레베이터 [1/26] 15.91
── A13606107 전용 59.4

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13606107 --area 59.4

▶ 돈암삼성 (A13606107) · 전용 59.4㎡ · 11290-10300 · 지번 후보 15-1
   지번 15-1 (0015-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13606107-59.json
   전유 59.4 + 주거공용 15.54 = 공급 74.94㎡ = 22.67평 → **23평**
   표본: 101동 1418호 (같은 전용 호 85개) · 전용률 79.3%
     · / 계단,엘레베이터 [1/18] 15.54
── A13611202 전용 84.844

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611202 --area 84.844

▶ 길음동부센트레빌 (A13611202) · 전용 84.844㎡ · 11290-13400 · 지번 후보 1278
   지번 1278 (1278-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611202-84.json
   전유 84.844 + 주거공용 16.998 = 공급 101.84㎡ = 30.81평 → **31평**
   표본: 111동 102 (같은 전용 호 177개) · 전용률 83.3%
     · 아파트 / 계단,승강기 [각층 각층] 16.877
     · 아파트 / 주민공동시설 [지하 지1층] 0.121
── A13611202 전용 59.998

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611202 --area 59.998

▶ 길음동부센트레빌 (A13611202) · 전용 59.998㎡ · 11290-13400 · 지번 후보 1278
   지번 1278 (1278-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611202-59.json
   전유 59.998 + 주거공용 16.588 = 공급 76.59㎡ = 23.17평 → **23평**
   표본: 112동 604 (같은 전용 호 109개) · 전용률 78.3%
     · 아파트 / 계단,승강기 [각층 각층] 16.503
     · 아파트 / 주민공동시설 [지하 지1층] 0.085
── A13611011 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611011 --area 84.96

▶ 래미안길음뉴타운9단지 (A13611011) · 전용 84.96㎡ · 11290-13400 · 지번 후보 1286
   지번 1286 (1286-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611011-84.json
   전유 84.96 + 주거공용 24.91 = 공급 109.87㎡ = 33.24평 → **33평**
   표본: 906동 2602 (같은 전용 호 208개) · 전용률 77.3%
     · 아파트 / 벽체,계단,홀 [각층 각층] 24.91
── A13611011 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611011 --area 59.92

▶ 래미안길음뉴타운9단지 (A13611011) · 전용 59.92㎡ · 11290-13400 · 지번 후보 1286
   지번 1286 (1286-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611011-59.json
   전유 59.92 + 주거공용 22.65 = 공급 82.57㎡ = 24.98평 → **25평**
   표본: 904동 2402 (같은 전용 호 109개) · 전용률 72.6%
     · 아파트 / 벽체,계단,홀 [각층 각층] 22.65
── A13611008 전용 84.82

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611008 --area 84.82

▶ 길음뉴타운8단지 (A13611008) · 전용 84.82㎡ · 11290-13400 · 지번 후보 1284
   지번 1284 (1284-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611008-84.json
   전유 84.82 + 주거공용 26.61 = 공급 111.43㎡ = 33.71평 → **34평**
   표본: 810동 203 (같은 전용 호 201개) · 전용률 76.1%
     · 아파트 / 벽체,계단,복도 [각층 각층] 26.61
── A13611008 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611008 --area 59.99

▶ 길음뉴타운8단지 (A13611008) · 전용 59.99㎡ · 11290-13400 · 지번 후보 1284
   지번 1284 (1284-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611008-59.json
   전유 59.99 + 주거공용 25.55 = 공급 85.54㎡ = 25.88평 → **26평**
   표본: 819동 202 (같은 전용 호 146개) · 전용률 70.1%
     · 아파트 / 벽체,계단,복도 [각층 각층] 25.55
── A13611006 전용 84.64

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611006 --area 84.64

▶ 이편한세상 길음뉴타운4단지 (A13611006) · 전용 84.64㎡ · 11290-13400 · 지번 후보 1281
   지번 1281 (1281-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611006-84.json
   전유 84.64 + 주거공용 25.19 = 공급 109.83㎡ = 33.22평 → **33평**
   표본: 417동 702 (같은 전용 호 206개) · 전용률 77.1%
     · 아파트 / 벽체,계단,승강기 [각층 각층] 24.59
     · 아파트 / 주민운동시설 [지하 지1층] 0.6
── A13611006 전용 59.86

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611006 --area 59.86

▶ 이편한세상 길음뉴타운4단지 (A13611006) · 전용 59.86㎡ · 11290-13400 · 지번 후보 1281
   지번 1281 (1281-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611006-59.json
   전유 59.86 + 주거공용 20.66 = 공급 80.52㎡ = 24.36평 → **24평**
   표본: 420동 1103 (같은 전용 호 132개) · 전용률 74.3%
     · 아파트 / 벽체,계단,승강기 [각층 각층] 20.24
     · 아파트 / 주민운동시설 [지하 지1층] 0.42
── A13611007 전용 84.97

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611007 --area 84.97

▶ 길음뉴타운푸르지오아파트2,3단지 (A13611007) · 전용 84.97㎡ · 11290-13400 · 지번 후보 1280
   지번 1280 (1280-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611007-84.json
   전유 84.97 + 주거공용 27.07 = 공급 112.04㎡ = 33.89평 → **34평**
   표본: 221동 601 (같은 전용 호 195개) · 전용률 75.8%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 16.94
     · 아파트 / 벽체 [각층 각층] 10.13
── A13611007 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611007 --area 59.99

▶ 길음뉴타운푸르지오아파트2,3단지 (A13611007) · 전용 59.99㎡ · 11290-13400 · 지번 후보 1280
   지번 1280 (1280-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611007-59.json
   전유 59.99 + 주거공용 18.95 = 공급 78.94㎡ = 23.88평 → **24평**
   표본: 204동 501 (같은 전용 호 62개) · 전용률 76.0%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 14.62
     · 아파트 / 벽체 [각층 각층] 4.33
── A13611103 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13611103 --area 84.96

▶ 래미안길음1차 (A13611103) · 전용 84.96㎡ · 11290-13400 · 지번 후보 1279
   지번 1279 (1279-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13611103-84.json
   전유 84.96 + 주거공용 16.52 = 공급 101.48㎡ = 30.7평 → **31평**
   표본: 104동 103 (같은 전용 호 135개) · 전용률 83.7%
     · 아파트 / 계단실,승강기홀 [각층 각층] 16.3
     · 아파트 / 주민공동시설 [지하 지1층] 0.22
── A10024741 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024741 --area 59.92

▶ 사가정 센트럴 아이파크 아파트 (A10024741) · 전용 59.92㎡ · 11260-10100 · 지번 후보 1545
   지번 1545 (1545-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024741-59.json
   전유 59.92 + 주거공용 28.486 = 공급 88.41㎡ = 26.74평 → **27평**
   표본: 106동 1803 (같은 전용 호 127개) · 전용률 67.8%
     · 아파트 / 계단실,승강기 [각층 각층] 22.306
     · 아파트 / 벽체 [지상 18층] 6.18
   ⚠️ 전용률 67.8% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A10024741 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024741 --area 84.87

▶ 사가정 센트럴 아이파크 아파트 (A10024741) · 전용 84.87㎡ · 11260-10100 · 지번 후보 1545
   지번 1545 (1545-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10024741-84.json
   전유 84.87 + 주거공용 27.392 = 공급 112.26㎡ = 33.96평 → **34평**
   표본: 107동 3001 (같은 전용 호 335개) · 전용률 75.6%
     · 아파트 / 계단실,승강기 [각층 각층] 21.074
     · 아파트 / 벽체 [지상 30층] 6.318
── A13113008 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13113008 --area 59.99

▶ 신내우디안1단지 (A13113008) · 전용 59.99㎡ · 11260-10600 · 지번 후보 13, 816
   지번 13 (0013-0000) · 대지 → 줄 0개
   지번 816 (0816-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13113008-59.json
   전유 59.99 + 주거공용 25.72 = 공급 85.71㎡ = 25.93평 → **26평**
   표본: 113동 601 (같은 전용 호 103개) · 전용률 70.0%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 20.12
     · 아파트 / 벽체 [지상 6층] 5.6
   ⚠️ 전용률 70.0% — 흔한 범위(70~90%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A13113007 전용 59.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13113007 --area 59.92

▶ 신내 데시앙포레 (A13113007) · 전용 59.92㎡ · 11260-10600 · 지번 후보 13, 817
   지번 13 (0013-0000) · 대지 → 줄 0개
   지번 817 (0817-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13113007-59.json
   전유 59.92 + 주거공용 23.94 = 공급 83.86㎡ = 25.37평 → **25평**
   표본: 217동 1405 (같은 전용 호 56개) · 전용률 71.5%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 18.34
     · 아파트 / 벽체 [지상 14층] 5.6
── A13113008 전용 84.91

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13113008 --area 84.91

▶ 신내우디안1단지 (A13113008) · 전용 84.91㎡ · 11260-10600 · 지번 후보 13, 816
   지번 13 (0013-0000) · 대지 → 줄 0개
   지번 816 (0816-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13113008-84.json
   전유 84.91 + 주거공용 34.34 = 공급 119.25㎡ = 36.07평 → **36평**
   표본: 102동 2103 (같은 전용 호 110개) · 전용률 71.2%
     · 아파트 / 계단실,승강기,홀 [각층 각층] 28.48
     · 아파트 / 벽체 [지상 21층] 5.86
── A13176901 전용 59.76

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13176901 --area 59.76

▶ 신내6단지 (A13176901) · 전용 59.76㎡ · 11260-10600 · 지번 후보 13, 650
   지번 13 (0013-0000) · 대지 → 줄 0개
   지번 650 (0650-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13176901-59.json
   전유 59.76 + 주거공용 15.69 = 공급 75.45㎡ = 22.82평 → **23평**
   표본: 613동 208 (같은 전용 호 131개) · 전용률 79.2%
     · 아파트 / 계단,복도,엘리베이터 [각층 각층] 15.69
⏳ 시간 예산(1200초)에 닿아 71줄은 다음 칸으로 미룹니다
```
