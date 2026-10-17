# 단지 공급면적 — 마지막 실행

- 성공 2건 · 실패 7건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 250/250건 · 내일로 미룬 131줄 (상한은 실패가 아니다)

```
── A13971502 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2

▶ 상계주공3단지 (A13971502) · 전용 84.2㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 382개
::error::전용 84.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 730-2) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2`
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
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 643, 271-1
   지번 643 (0643-0000) · 대지 → 줄 29개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 643) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A13204105 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 84.41

▶ 창동주공3단지 (A13204105) · 전용 84.41㎡ · 11320-10700 · 지번 후보 347
   지번 347 (0347-0000) · 대지 → 줄 3000개
::error::전용 84.41㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 347) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 84.41`
Exit status 1
── A13290107 전용 60.5

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 60.5

▶ 창동주공19단지 (A13290107) · 전용 60.5㎡ · 11320-10700 · 지번 후보 663-1, 685-222, 27
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 685-222 (0685-0222) · 대지 → 줄 0개
   지번 27 (0027-0000) · 대지 → 줄 2342개
::error::전용 60.5㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 27) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 60.5`
Exit status 1
── A10020950 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10020950 --area 59.94

▶ 안양역푸르지오더샵 (A10020950) · 전용 59.94㎡ · 41171-10100 · 지번 후보 1459, 97-3
   지번 1459 (1459-0000) · 대지 → 줄 0개
   지번 97-3 (0097-0003) · 대지 → 줄 0개
::error::지번 후보 1459, 97-3 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10020950 --area 59.94`
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
── A10023989 전용 84.96
🧹 force=1 을 지웠습니다 — kapt=A10023989 area=84.96   # 수원하늘채더퍼스트2단지 84 — 08-31 옛 파일, 

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023989 --area 84.96

▶ 수원하늘채더퍼스트2단지 (A10023989) · 전용 84.96㎡ · 41113-13600 · 지번 후보 654
   지번 654 (0654-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023989-84.json
   전유 84.96 + 주거공용 25.513 = 공급 110.47㎡ = 33.42평 → **33평**
   표본: 210동 304 (같은 전용 호 80개) · 전용률 76.9%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 18.8228
     · 아파트 / 벽체 [지상 3층] 6.69
── A10028139 전용 84.88
🧹 force=1 을 지웠습니다 — kapt=A10028139 area=84.88   # 미사강변골든센트로 84 — 09-03 옛 파일, 지하주

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028139 --area 84.88

▶ 미사강변골든센트로 (A10028139) · 전용 84.88㎡ · 41450-10900 · 지번 후보 1162
   지번 1162 (1162-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10028139-84.json
   전유 84.88 + 주거공용 31.868 = 공급 116.75㎡ = 35.32평 → **35평**
   표본: 2814동 802 (같은 전용 호 157개) · 전용률 72.7%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 31.868
🧾 오늘 몫(250건)을 다 썼습니다 — 미리 채우기 131줄은 **내일** 이어서 받습니다.
   (실패가 아닙니다. 여기서 빨간불을 켜면 재시도 사다리가 상한을 우회합니다.)
```
