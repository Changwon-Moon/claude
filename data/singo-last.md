# 오늘의 신고가 — 마지막 실행

- 실행: 2026-08-25 (KST) · 방아쇠 `workflow_dispatch`
- 기준: 1000세대 이상 명부 · 전용 59·84 타입 · 최근 1개월 신고분
- 결과: **성공**
- 커밋: `2b1d2b177f9fdb6ebbb01aabe82abbb2d870744a`

```

> @wirit/collectors@0.1.0 collect-singo /home/runner/work/claude/claude/packages/collectors
> tsx src/molitSingoCli.ts -- --today 2026-08-25 --months 1 --top 0 --sort price

   🔑 MOLIT_API_KEY: 166b… (64자) · 지문 4e34245e · 인코딩 안 됨
명부 지번 조회판 1050칸 (지번 겹쳐 버린 것 9칸)
명부 1147개 단지 · 판정 지역 61/61 · 수집 성공 61회 / 실패 0회
→ 오늘의 신고가 0건
기간 2026-08-25
신고가 19건 · 돌파 0건
→ /home/runner/work/claude/claude/docs/daily/신고가재료-2026-08-25.md
→ data/datasets/singo-digest.json
→ data/singo-digest-alert.txt
```
