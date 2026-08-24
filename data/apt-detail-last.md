# 단지 주차대수 — 마지막 실행

- 대기열: 6줄
- 결과: **실패**

```
⏭ 이미 있음 — data/datasets/apt-detail/A44340013.json (다시 받으려면 force=1)
⏭ 이미 있음 — data/datasets/apt-detail/A13686302.json (다시 받으려면 force=1)
⏭ 이미 있음 — data/datasets/apt-detail/A44033010.json (다시 받으려면 force=1)
⏭ 이미 있음 — data/datasets/apt-detail/A10028021.json (다시 받으려면 force=1)
⏭ 이미 있음 — data/datasets/apt-detail/A10026600.json (다시 받으려면 force=1)

── A10023875

> @wirit/collectors@0.1.0 collect-apt-detail /home/runner/work/claude/claude/packages/collectors
> tsx src/aptDetailCli.ts -- --kapt A10023875

   ⏸ 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
     문이 닫힌 것으로 보고 20초 기다립니다 (1/1)
Error: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed — 2번(약 0분) 시도했습니다
    at get (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:128:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async pickOp (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:160:30)
    at async fetchAptDetail (/home/runner/work/claude/claude/packages/collectors/src/sources/aptInfo.ts:205:7)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptDetailCli.ts:44:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-detail: `tsx src/aptDetailCli.ts -- --kapt A10023875`
Exit status 1

⚠️ 일부 줄이 실패했습니다
```
