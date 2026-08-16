# 단지 주차대수 — 마지막 실행

- 대기열: 5줄
- 결과: **실패**

```

── A44340013

> @wirit/collectors@0.1.0 collect-apt-detail /home/runner/work/claude/claude/packages/collectors
> tsx src/aptDetailCli.ts -- --kapt A44340013

   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (2/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (3/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (4/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (5/5)
Error: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed — 6번(약 5분) 시도했습니다
    at get (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:119:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async pickOp (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:151:30)
    at async fetchAptDetail (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:196:7)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptDetailCli.ts:44:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-detail: `tsx src/aptDetailCli.ts -- --kapt A44340013`
Exit status 1

── A13686302

> @wirit/collectors@0.1.0 collect-apt-detail /home/runner/work/claude/claude/packages/collectors
> tsx src/aptDetailCli.ts -- --kapt A13686302

   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (2/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (3/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (4/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (5/5)
Error: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed — 6번(약 5분) 시도했습니다
    at get (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:119:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async pickOp (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:151:30)
    at async fetchAptDetail (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:196:7)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptDetailCli.ts:44:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-detail: `tsx src/aptDetailCli.ts -- --kapt A13686302`
Exit status 1

── A10023451

> @wirit/collectors@0.1.0 collect-apt-detail /home/runner/work/claude/claude/packages/collectors
> tsx src/aptDetailCli.ts -- --kapt A10023451

   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (2/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (3/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (4/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (5/5)
Error: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed — 6번(약 5분) 시도했습니다
    at get (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:119:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async pickOp (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:151:30)
    at async fetchAptDetail (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:196:7)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptDetailCli.ts:44:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-detail: `tsx src/aptDetailCli.ts -- --kapt A10023451`
Exit status 1

── A10028021

> @wirit/collectors@0.1.0 collect-apt-detail /home/runner/work/claude/claude/packages/collectors
> tsx src/aptDetailCli.ts -- --kapt A10028021

   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 60초 기다립니다 (2/5)
```
