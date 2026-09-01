# 실거래 수집(국토부) — 마지막 실행

- 실행: 2026-09-01 (KST) · 방아쇠 `push`
- 기준: jibang / 광주 · 월 202601,202602,202603,202604,202605,202606,202607
- 결과: **실패**
- 커밋: `ac560a13627cba89484eadd5cb6a8f1440350a67`

> 예약 런은 대기열(data/molit-queue.txt)을 읽지 않습니다 — 기본 기준으로만 돕니다(2026-08-27).

## 실패 로그 (끝 25줄)
```
⚠️ 알 수 없는 구: 광주

요약: 수집 0 · 스킵 0 · 실패 1 · 거래 0건
undefined
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command failed with exit code 1: tsx src/molitCli.ts --region jibang --gu 광주 --months 202601,202602,202603,202604,202605,202606,202607 --out /home/runner/work/claude/claude/data/datasets/molit --force
```
