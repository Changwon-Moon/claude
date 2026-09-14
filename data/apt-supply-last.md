# 단지 공급면적 — 마지막 실행

- 성공 0건 · 실패 6건 · 미룸 327줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 139/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
── A10024152 전용 84.8

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024152 --area 84.8

▶ 포레나송파 (A10024152) · 전용 84.8㎡ · 11710-11300 · 지번 후보 651
::error::651 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024152 --area 84.8`
Exit status 1
── A12204004 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12204004 --area 59.99

▶ 북한산힐스테이트3차아파트 (A12204004) · 전용 59.99㎡ · 11380-10300 · 지번 후보 641
::error::641 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12204004 --area 59.99`
Exit status 1
── A10023991 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023991 --area 59.98

▶ 태릉해링턴플레이스 (A10023991) · 전용 59.98㎡ · 11350-10300 · 지번 후보 758
::error::758 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023991 --area 59.98`
Exit status 1
── A15728008 전용 84.68

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15728008 --area 84.68

▶ 마곡수명산파크1단지 (A15728008) · 전용 84.68㎡ · 11500-10600 · 지번 후보 742
::error::742 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15728008 --area 84.68`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 643, 271-1
::error::643 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
::error::248 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
⛔ 연결이 6번 연달아 안 열렸습니다 — 문이 닫혔습니다. 남은 줄은 새 러너에 넘깁니다.
⏳ 문이 닫혀 접었습니다 — 남은 327줄은 다음 칸으로 미룹니다
```
