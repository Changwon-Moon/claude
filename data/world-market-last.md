# 세계 지수 수집 마지막 실행

- 대상 연도: 2026 · 방아쇠 `push`
- 결과: **실패**
- 커밋: `a5a440fc2c15ed27cd64c0c4b8141eef37a41776`

```

> @wirit/collectors@0.1.0 collect-world-market /home/runner/work/claude/claude/packages/collectors
> tsx src/worldMarketCli.ts -- --year 2026 --out /home/runner/work/claude/claude/data/datasets/world-market-2026.json

📥 한국 코스피 (^KS11) 수집...
   ✅ ^KS11 · 2026-09-04 기준 6649.07 · YTD 57.78%
      1월 +23.97% · 2월 +19.52% · 3월 -19.08% · 4월 +30.61% · 5월 +28.45% · 6월 0% · 7월 -22.19% · 8월 +3.4% · 9월 -2.51%
📥 미국 S&P 500 (^GSPC) 수집...
   ✅ ^GSPC · 2026-09-03 기준 7747.71 · YTD 13.18%
      1월 +1.37% · 2월 -0.87% · 3월 -5.09% · 4월 +10.42% · 5월 +5.15% · 6월 -1.06% · 7월 -0.13% · 8월 +2.62% · 9월 +0.8%
📥 일본 닛케이225 (^N225) 수집...
   ✅ ^N225 · 2026-09-04 기준 64810.18 · YTD 28.75%
      1월 +5.93% · 2월 +10.37% · 3월 -13.23% · 4월 +16.1% · 5월 +11.88% · 6월 +5.63% · 7월 -8.14% · 8월 +3.03% · 9월 -2.26%
📥 중국 상해종합 (000001.SS) 수집...
   ✅ 000001.SS · 2026-09-02 기준 3941.39 · YTD -0.69%
      1월 +3.76% · 2월 +1.09% · 3월 -6.51% · 4월 +5.66% · 5월 -1.06% · 6월 +0.63% · 7월 -6.4% · 8월 +4.02% · 9월 -1.13%
📥 홍콩 항셍 (^HSI) 수집...
   ✅ ^HSI · 2026-09-02 기준 25311.21 · YTD -1.25%
      1월 +6.85% · 2월 -2.76% · 3월 -6.92% · 4월 +3.99% · 5월 -2.3% · 6월 -9.14% · 7월 +13.13% · 8월 -1.23% · 9월 -1%
📥 독일 DAX (^GDAXI) 수집...
   ✅ ^GDAXI · 2026-09-02 기준 25839.33 · YTD 5.51%
      1월 +0.2% · 2월 +3.04% · 3월 -10.3% · 4월 +7.11% · 5월 +3.34% · 6월 -0.43% · 7월 +2.53% · 8월 +2.45% · 9월 -1.59%
📥 인도 니프티50 (^NSEI) 수집...
   ✅ ^NSEI · 2026-09-02 기준 23914.45 · YTD -8.48%
      1월 -3.1% · 2월 -0.56% · 3월 -11.31% · 4월 +7.46% · 5월 -1.87% · 6월 +1.35% · 7월 +2.17% · 8월 -1.24% · 9월 -0.69%
📥 베트남 VN-Index (^VNINDEX) 수집...
📥 베트남 VN-Index (VNINDEX.VN) 수집...
📥 베트남 VN-Index (^VNI) 수집...
📥 베트남 VN-Index (VNINDEX) 수집...
📥 베트남 VN-Index (^VNINDEX.VN) 수집...
수집 실패: Error: 2026년 데이터가 1건 — 수집 불가
    at summarize (/home/runner/work/claude/claude/packages/collectors/src/worldMarketCli.ts:100:28)
    at main (/home/runner/work/claude/claude/packages/collectors/src/worldMarketCli.ts:213:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-world-market: `tsx src/worldMarketCli.ts -- --year 2026 --out /home/runner/work/claude/claude/data/datasets/world-market-2026.json`
Exit status 1
```
