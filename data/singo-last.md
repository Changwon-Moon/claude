# 오늘의 신고가 — 마지막 실행

- 실행: 2026-11-09 (KST) · 방아쇠 `schedule`
- 기준: 1000세대 이상 명부 · 전용 59·84 타입 · 최근 2개월 신고분
- 결과: **성공**
- 커밋: `ab2663129ae878e5630f1e2c031c604200ac276e`

```

> @wirit/collectors@0.1.0 collect-singo /home/runner/work/claude/claude/packages/collectors
> tsx src/molitSingoCli.ts -- --today 2026-11-09 --months 2 --top 0 --sort price

   🔑 MOLIT_API_KEY: 166b… (64자) · 지문 4e34245e · 인코딩 안 됨
명부 지번 조회판 1050칸 (지번 겹쳐 버린 것 9칸)
명부 1147개 단지 · 판정 지역 61/61 · 수집 성공 122회 / 실패 0회
→ 오늘의 신고가 3건
  · 용인시수지구 e편한세상수지 34평 17.3억 (전용 84.929㎡ 18층 2026-10-31 · 직전 17.2억 2026-07-29 · 1,237세대)
  · 노원구 현대 34평 12.85억 (전용 84.96㎡ 8층 2026-10-15 · 직전 12.55억 2021-09-15 · 1,320세대)
  · 수원시장안구 수원 SK SKY VIEW 25평 7.87억 (전용 59.952㎡ 19층 2026-11-07 · 직전 7.8억 2026-10-18 · 3,498세대)
기간 2026-11-09
신고가 3건 · 돌파 0건
→ /home/runner/work/claude/claude/docs/daily/신고가재료-2026-11-09.md
→ data/datasets/singo-digest.json
→ data/singo-digest-alert.txt
```
