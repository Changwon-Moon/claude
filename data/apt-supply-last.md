# 단지 공급면적 — 마지막 실행

- 성공 0건 · 실패 0건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 338/250건 · 내일로 미룬 833줄 (상한은 실패가 아니다)

```
── A13381608 전용 59.91
🚫 공공데이터포털 **일일 호출 한도**입니다 — 오늘은 여기까지. 내일 이어서 받습니다.

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13381608 --area 59.91

▶ 청계현대아파트 (A13381608) · 전용 59.91㎡ · 11200-10500 · 지번 후보 1932-6, 481, 700-1, 818
::error::공공데이터포털 **일일 호출 한도**에 걸렸습니다(문구는 SERVICE_KEY_IS_NOT_REGISTERED 로 나오지만 키 문제가 아닙니다). 내일 cron 이 다시 받습니다.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13381608 --area 59.91`
Exit status 1
🧾 오늘 몫(250건)을 다 썼습니다 — 미리 채우기 833줄은 **내일** 이어서 받습니다.
   (실패가 아닙니다. 여기서 빨간불을 켜면 재시도 사다리가 상한을 우회합니다.)
```
