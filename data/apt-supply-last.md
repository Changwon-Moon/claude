# 단지 공급면적 — 마지막 실행

- 성공 0건 · 실패 3건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 250/250건 · 내일로 미룬 140줄 (상한은 실패가 아니다)

```
── A13971502 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2

▶ 상계주공3단지 (A13971502) · 전용 84.2㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 100개
::error::전용 84.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 730-2) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2`
Exit status 1
── A13971502 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2

▶ 상계주공3단지 (A13971502) · 전용 84.2㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 100개
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
🧾 오늘 몫(250건)을 다 썼습니다 — 미리 채우기 140줄은 **내일** 이어서 받습니다.
   (실패가 아닙니다. 여기서 빨간불을 켜면 재시도 사다리가 상한을 우회합니다.)
```
