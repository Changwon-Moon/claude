# 1000세대 이상 단지 명부 — 마지막 실행

- 실행: 2026-08-12 (KST) · 방아쇠 `push`
- 예산: 300회 · 최소 세대수 1000
- 결과: **성공**
- 커밋: `95556210fc415ae7a2f62bc4b02e1b36ab198d93`

```

> @wirit/collectors@0.1.0 collect-apt-universe /home/runner/work/claude/claude/packages/collectors
> tsx src/aptUniverseCli.ts -- --min-hhld 1000 --budget 300

호출 0회 · 목록 0/61개 지역 · 세대수 확인 0/0곳
→ 1,000세대 이상 **0개 단지** · ⏳ 이어서 진행 필요

실패 61건 (다음 실행에서 다시 시도):
  · 목록 종로구: fetch failed
  · 목록 중구: fetch failed
  · 목록 용산구: fetch failed
  · 목록 성동구: fetch failed
  · 목록 광진구: fetch failed
  · 목록 동대문구: fetch failed
  · 목록 중랑구: fetch failed
  · 목록 성북구: fetch failed
  · 목록 강북구: fetch failed
  · 목록 도봉구: fetch failed
  · 목록 노원구: fetch failed
  · 목록 은평구: fetch failed
  · 목록 서대문구: fetch failed
  · 목록 마포구: fetch failed
  · 목록 양천구: fetch failed
```
