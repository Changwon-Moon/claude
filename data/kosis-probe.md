# KOSIS 표 검증 결과 — ❌ 검증이 돌지 못했다

- 실행 시각(KST): 2026-08-12 13:20
- 실행 로그: https://github.com/Changwon-Moon/claude/actions/runs/31560780069
- 키 있음: yes

## 마지막 로그 40줄

```

> @wirit/collectors@0.1.0 probe-kosis /home/runner/work/claude/claude/packages/collectors
> tsx src/kosisProbeCli.ts

· population (DT_1B040A3) … 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T20&objL1=ALL&f
   ↻ 표가 아니라 연결이 실패했다 — 90초 뒤 2/3회차 재시도
   2회차도 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&i
   ↻ 표가 아니라 연결이 실패했다 — 90초 뒤 3/3회차 재시도
   3회차도 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&i
· households (DT_1B040B3) … 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T1&objL1=ALL&fo
   ↻ 표가 아니라 연결이 실패했다 — 90초 뒤 2/3회차 재시도
   2회차도 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&i
   ↻ 표가 아니라 연결이 실패했다 — 90초 뒤 3/3회차 재시도
   3회차도 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&i
· migration (DT_1B26001_A01) … 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=***&itmId=T25&objL1=ALL&f
   ↻ 표가 아니라 연결이 실패했다 — 90초 뒤 2/3회차 재시도
```
