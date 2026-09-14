# 억대 연봉 근로소득자 수집 — 마지막 실행

- 실행(UTC): 2026-09-14T05:26:45Z · run 34809488188
- 범위: 2009 ~ 2024
- 결과: failure

```
⏳ 총급여 규모별 인원: kosis.kr 연결이 안 잡힙니다(1/2). 60초 쉬고 다시 두드립니다 — 주소 문제가 아니라 닫힌 창입니다.
❌ GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=16133T2008_0135&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&orgId=133&tblId=DT_133N_427&objL2=15133JSJ00&startPrdDe=2009&endPrdDe=2024
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: kosis.kr:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
undefined
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command failed with exit code 1: tsx src/wageBracketCli.ts --from 2009 --to 2024 --out /home/runner/work/claude/claude/data/datasets/wage-100m.json
```
