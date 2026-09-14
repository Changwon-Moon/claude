# 단지 공급면적 — 마지막 실행

- 성공 3건 · 실패 3건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 250/250건 · 내일로 미룬 342줄 (상한은 실패가 아니다)

```
── A12204004 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12204004 --area 59.99

▶ 북한산힐스테이트3차아파트 (A12204004) · 전용 59.99㎡ · 11380-10300 · 지번 후보 641
   지번 641 (0641-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12204004-59.json
   전유 59.99 + 주거공용 19.41 = 공급 79.4㎡ = 24.02평 → **24평**
   표본: 3205동 1304 (같은 전용 호 144개) · 전용률 75.5%
     · 아파트 / 계단,승강기 [각층 각층] 14.08
     · 아파트 / 벽체 [각층 각층] 5.33
── A10023991 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023991 --area 59.98

▶ 태릉해링턴플레이스 (A10023991) · 전용 59.98㎡ · 11350-10300 · 지번 후보 758
   지번 758 (0758-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023991-59.json
   전유 59.98 + 주거공용 20.961 = 공급 80.94㎡ = 24.48평 → **24평**
   표본: 106동 1805 (같은 전용 호 71개) · 전용률 74.1%
     · 아파트 / 계단실 [지상 각층] 15.7311
     · 아파트 / 벽체 [지상 18층] 5.23
── A15728008 전용 84.68

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15728008 --area 84.68

▶ 마곡수명산파크1단지 (A15728008) · 전용 84.68㎡ · 11500-10600 · 지번 후보 742
   지번 742 (0742-0000) · 대지 → 줄 1600개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15728008-84.json
   전유 84.68 + 주거공용 24.359 = 공급 109.04㎡ = 32.98평 → **33평**
   표본: 101동 604호 (같은 전용 호 76개) · 전용률 77.7%
     · 아파트 / 계단실,승강기 [각층 각층] 22.97
     · 부대시설 / 관리사무소,문고,보육시설,경로당,주민공동시설 [지상 1층] 0.709
     · 아파트 / 지하계단실 [지하 지1층] 0.662
     · 부대시설 / 경비실 [지상 1층] 0.018
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 643, 271-1
   지번 643 (0643-0000) · 대지 → 줄 29개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 643) — 파일을 만들지 않습니다
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
🧾 오늘 몫(250건)을 다 썼습니다 — 미리 채우기 342줄은 **내일** 이어서 받습니다.
   (실패가 아닙니다. 여기서 빨간불을 켜면 재시도 사다리가 상한을 우회합니다.)
```
