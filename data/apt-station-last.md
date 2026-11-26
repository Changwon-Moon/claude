# 단지 가까운 역 — 마지막 실행

- 대기열: 838줄
- 결과: **실패**

```
⏭ 이미 있음 — data/datasets/apt-station/A10020950.json (다시 받으려면 force=1)

── A10024974

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10024974

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%8B%A0%EC%88%98%EB%8F%99%20462%20%EB%A7%88%ED%8F%AC%20%EC%95%84%EC%9D%B4%ED%8C%8C%ED%81%AC%20%ED%8F%AC%EB%A0%88%20%EC%95%84%ED%8C%8C%ED%8A%B8&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10024974`
Exit status 1

── A10024398

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10024398

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%96%91%EC%B2%9C%EA%B5%AC%20%EC%8B%A0%EC%A0%95%EB%8F%99%201326%20%EB%9E%98%EB%AF%B8%EC%95%88%20%EB%AA%A9%EB%8F%99%EC%95%84%EB%8D%B8%EB%A6%AC%EC%B2%B4&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10024398`
Exit status 1

── A10027375

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10027375

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%96%91%EC%B2%9C%EA%B5%AC%20%EC%8B%A0%EC%A0%95%EB%8F%99%201323%20%EB%AA%A9%EB%8F%99%ED%9E%90%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10027375`
Exit status 1

── A13071302

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A13071302

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EB%8F%99%EB%8C%80%EB%AC%B8%EA%B5%AC%20%EC%A0%84%EB%86%8D%EB%8F%99%20440-9%20%EB%9E%98%EB%AF%B8%EC%95%88%ED%81%AC%EB%A0%88%EC%8B%9C%ED%8B%B0&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A13071302`
Exit status 1

── A10026799

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10026799

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EC%88%98%EC%9B%90%EC%98%81%ED%86%B5%EA%B5%AC%20%EB%A7%9D%ED%8F%AC%EB%8F%99%20728%20%ED%9E%90%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8%20%EC%98%81%ED%86%B5%EC%95%84%ED%8C%8C%ED%8A%B8&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10026799`
Exit status 1

── A10025130

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10025130

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%84%9C%EB%8C%80%EB%AC%B8%EA%B5%AC%20%EB%82%A8%EA%B0%80%EC%A2%8C%EB%8F%99%20224%20DMC%EC%97%90%EC%BD%94%EC%9E%90%EC%9D%B4&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10025130`
Exit status 1

── A15178201

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A15178201

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B4%80%EC%95%85%EA%B5%AC%20%EB%B4%89%EC%B2%9C%EB%8F%99%201718%20%EA%B4%80%EC%95%85%EB%B2%BD%EC%82%B0%EB%B8%94%EB%A3%A8%EB%B0%8D&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A15178201`
Exit status 1

── A13613007

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A13613007

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%84%B1%EB%B6%81%EA%B5%AC%20%ED%95%98%EC%9B%94%EA%B3%A1%EB%8F%99%20225%20%EB%9E%98%EB%AF%B8%EC%95%88%EC%9B%94%EA%B3%A1&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A13613007`
Exit status 1

── A10023451

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10023451

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%ED%99%94%EC%84%B1%EB%B3%91%EC%A0%90%EA%B5%AC%20%EB%B0%98%EC%A0%95%EB%8F%99%20637%20%EB%B0%98%EC%A0%95%EC%95%84%EC%9D%B4%ED%8C%8C%ED%81%AC%EC%BA%90%EC%8A%AC5%EB%8B%A8%EC%A7%80&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10023451`
Exit status 1

── A10024349

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10024349

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%ED%99%94%EC%84%B1%EB%B3%91%EC%A0%90%EA%B5%AC%20%EB%B3%91%EC%A0%90%EB%8F%99%20881%20%EB%B3%91%EC%A0%90%EC%97%AD%EC%95%84%EC%9D%B4%ED%8C%8C%ED%81%AC%EC%BA%90%EC%8A%AC&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10024349`
Exit status 1

── A13606004

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A13606004

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%84%B1%EB%B6%81%EA%B5%AC%20%EB%8F%88%EC%95%94%EB%8F%99%20609-1%20%EB%8F%88%EC%95%94%ED%95%9C%EC%8B%A0%ED%95%9C%EC%A7%84%EC%95%84%ED%8C%8C%ED%8A%B8&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A13606004`
Exit status 1

── A44278215

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A44278215

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EC%88%98%EC%9B%90%ED%8C%94%EB%8B%AC%EA%B5%AC%20%ED%99%94%EC%84%9C%EB%8F%99%20650%20%ED%99%94%EC%84%9C%EC%A3%BC%EA%B3%B54%EB%8B%A8%EC%A7%80&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A44278215`
Exit status 1

── A10023329

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10023329

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%ED%99%94%EC%84%B1%EB%B3%91%EC%A0%90%EA%B5%AC%20%EB%B0%98%EC%9B%94%EB%8F%99%20974%20%EC%8B%A0%EB%8F%99%ED%83%84%ED%8F%AC%EB%A0%88%EC%9E%90%EC%9D%B4%EC%95%84%ED%8C%8C%ED%8A%B8&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10023329`
Exit status 1

── A10024093

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A10024093

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EB%82%A8%EC%96%91%EC%A3%BC%EC%8B%9C%20%EB%8B%A4%EC%82%B0%EB%8F%99%206163%20%EB%8B%A4%EC%82%B0%20%ED%91%B8%EB%A5%B4%EC%A7%80%EC%98%A4&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A10024093`
Exit status 1

── A15380403

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A15380403

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B8%88%EC%B2%9C%EA%B5%AC%20%EA%B0%80%EC%82%B0%EB%8F%99%20769%20%EA%B0%80%EC%82%B0%EB%91%90%EC%82%B0%EC%9C%84%EB%B8%8C&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A15380403`
Exit status 1

── A44173913

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A44173913

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EC%88%98%EC%9B%90%EA%B6%8C%EC%84%A0%EA%B5%AC%20%EA%B6%8C%EC%84%A0%EB%8F%99%201330%20%EA%B6%8C%EC%84%A0%EC%9E%90%EC%9D%B4e%ED%8E%B8%ED%95%9C%EC%84%B8%EC%83%81&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A44173913`
Exit status 1

── A15209305

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A15209305

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B5%AC%EB%A1%9C%EA%B5%AC%20%EA%B0%9C%EB%B4%89%EB%8F%99%20478%20%EA%B0%9C%EB%B4%89%ED%95%9C%EC%A7%84&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A15209305`
Exit status 1

── A44173006

> @wirit/collectors@0.1.0 collect-apt-station /home/runner/work/claude/claude/packages/collectors
> tsx src/aptStationCli.ts -- --kapt A44173006

Error: GET 실패(4회 시도): https://dapi.kakao.com/v2/local/search/address.json?query=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EC%88%98%EC%9B%90%EA%B6%8C%EC%84%A0%EA%B5%AC%20%EA%B5%AC%EC%9A%B4%EB%8F%99%20462%20%EA%B5%AC%EC%9A%B4%EC%82%BC%ED%99%98&size=5
fetch failed — 원인: ConnectTimeoutError: Connect Timeout Error (attempted address: dapi.kakao.com:443, timeout: 10000ms) (code=UND_ERR_CONNECT_TIMEOUT)
    at fetchText (/home/runner/work/claude/claude/packages/collectors/src/http.ts:59:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async kakao (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:37:16)
    at async main (/home/runner/work/claude/claude/packages/collectors/src/aptStationCli.ts:73:13)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-apt-station: `tsx src/aptStationCli.ts -- --kapt A44173006`
Exit status 1
```
