# 단지 공급면적 — 마지막 실행

- 성공 4건 · 실패 2건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A44340013 전용 84.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44340013 --area 84.92

▶ 망포늘푸른벽산 (A44340013) · 전용 84.92㎡ · 41117-10700 0488-0000
   줄 9832개 (응답이 말하는 총 9832)
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44340013-84.json
   전유 84.925 + 주거공용 25.015 = 공급 109.94㎡ = 33.26평 → **33평**
   표본: 110동 1703호 (같은 전용 호 562개)
── A13686302 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13686302 --area 84.95

▶ 래미안 크리시엘 아파트 관리사무소 (A13686302) · 전용 84.95㎡ · 11290-13500 0080-0000
   줄 9344개 (응답이 말하는 총 9344)
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A13686302-84.json
   전유 84.95 + 주거공용 23.07 = 공급 108.02㎡ = 32.68평 → **33평**
   표본: 117동 1401호 (같은 전용 호 473개)
── A44033010 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44033010 --area 59.98

▶ 화서역푸르지오더에듀포레 (A44033010) · 전용 59.98㎡ · 41111-13300 0333-0000
   줄 20000개 (응답이 말하는 총 23139)
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44033010-59.json
   전유 59.98 + 주거공용 25.79 = 공급 85.77㎡ = 25.95평 → **26평**
   표본: 118동 1302 (같은 전용 호 449개)
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 0143-0000
   줄 0개 (응답이 말하는 총 0)
::error::전용 84.48㎡ 에 해당하는 아파트 호를 못 찾았습니다 — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48`
Exit status 1
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 5869-0002
   줄 0개 (응답이 말하는 총 0)
::error::전용 84.99㎡ 에 해당하는 아파트 호를 못 찾았습니다 — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99`
Exit status 1
── A42385801 전용 84.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42385801 --area 84.95

▶ 광명한진 (A42385801) · 전용 84.95㎡ · 41210-10100 0200-0006
   줄 8460개 (응답이 말하는 총 8460)
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A42385801-84.json
   전유 84.95 + 주거공용 25.49 = 공급 110.44㎡ = 33.41평 → **33평**
   표본: 104동 2002호 (같은 전용 호 1046개)
```
