# 단지 공급면적 — 마지막 실행

- 성공 1건 · 실패 1건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
   지번 384 (0384-0000) → 줄 0개
::error::143 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48`
Exit status 1
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
```
