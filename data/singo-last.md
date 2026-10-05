# 오늘의 신고가 — 마지막 실행

- 실행: 2026-10-06 (KST) · 방아쇠 `workflow_dispatch`
- 기준: 1000세대 이상 명부 · 전용 59·84 타입 · 최근 2개월 신고분
- 결과: **성공**
- 커밋: `7948b0348cec3ee7aad8a5ccbeb095f11de741fa`

```

> @wirit/collectors@0.1.0 collect-singo /home/runner/work/claude/claude/packages/collectors
> tsx src/molitSingoCli.ts -- --today 2026-10-06 --months 2 --top 0 --sort price

   🔑 MOLIT_API_KEY: 166b… (64자) · 지문 4e34245e · 인코딩 안 됨
명부 지번 조회판 1050칸 (지번 겹쳐 버린 것 9칸)
명부 1147개 단지 · 판정 지역 61/61 · 수집 성공 122회 / 실패 0회
→ 오늘의 신고가 1건
  · 용인시수지구 수지삼성4차 25평 9.5억 (전용 59.76㎡ 9층 2026-09-23 · 직전 9.48억 2026-09-05 · 1,137세대)
기간 2026-10-06
신고가 1건 · 돌파 0건
→ /home/runner/work/claude/claude/docs/daily/신고가재료-2026-10-06.md
→ data/datasets/singo-digest.json
→ data/singo-digest-alert.txt
```
