# 세계 지수 수집 마지막 실행

- 대상 연도: 2026 · 방아쇠 `push`
- 결과: **실패**
- 커밋: `05f1359ef97df02fa92cbf69e2ee1592b8417c02`

```

> @wirit/collectors@0.1.0 collect-world-market /home/runner/work/claude/claude/packages/collectors
> tsx src/worldMarketCli.ts -- --year 2026 --out /home/runner/work/claude/claude/data/datasets/world-market-2026.json

📥 한국 코스피 (^KS11) 수집...
   ✅ ^KS11 · 2026-09-04 기준 6655.97 · YTD 57.94%
      1월 +23.97% · 2월 +19.52% · 3월 -19.08% · 4월 +30.61% · 5월 +28.45% · 6월 0% · 7월 -22.19% · 8월 +3.4% · 9월 -2.41%
📥 미국 S&P 500 (^GSPC) 수집...
   ✅ ^GSPC · 2026-09-03 기준 7747.71 · YTD 13.18%
      1월 +1.37% · 2월 -0.87% · 3월 -5.09% · 4월 +10.42% · 5월 +5.15% · 6월 -1.06% · 7월 -0.13% · 8월 +2.62% · 9월 +0.8%
📥 일본 닛케이225 (^N225) 수집...
   ✅ ^N225 · 2026-09-04 기준 64663.98 · YTD 28.46%
      1월 +5.93% · 2월 +10.37% · 3월 -13.23% · 4월 +16.1% · 5월 +11.88% · 6월 +5.63% · 7월 -8.14% · 8월 +3.03% · 9월 -2.49%
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
📥 베트남 VN-Index (VNI.VN) 수집...
   ❌ 베트남 실패 — ^VNINDEX: GET 실패(3회 시도): https://query1.finance.yahoo.com/v8/finance/chart/%5EVNINDEX?range=2y&inter / VNINDEX.VN: GET 실패(3회 시도): https://query1.finance.yahoo.com/v8/finance/chart/VNINDEX.VN?range=2y&inter / ^VNI: 시세 행 0건 / VNINDEX: GET 실패(3회 시도): https://query1.finance.yahoo.com/v8/finance/chart/VNINDEX?range=2y&interval / ^VNINDEX.VN: 2026년 거래일이 1일뿐 (최소 60일) — 지수가 아니거나 빈 심볼입니다 / VNI.VN: GET 실패(3회 시도): https://query1.finance.yahoo.com/v8/finance/chart/VNI.VN?range=2y&interval=
   🔎 야후 검색 결과 — 이 중에 맞는 것이 있는지 사람이 고릅니다:
      · 0P0000HY8X.VN  [INDEX] 0P0000HY8X.VN VSE

⛔ 수집 실패 — 파일을 쓰지 않습니다. 빠진 나라로 8개국 카드를 그리면 그게 오보입니다.

   · 베트남 VN-Index — 시도한 심볼: ^VNINDEX, VNINDEX.VN, ^VNI, VNINDEX, ^VNINDEX.VN, VNI.VN
     ^VNINDEX: GET 실패(3회 시도): https://query1.finance.yahoo.com/v8/finance/chart/%5EVNINDEX?range=2y&inter / VNINDEX.VN: GET 실패(3회 시도): https://query1.finance.yahoo.com/v8/finance/chart/VNINDEX.VN?range=2y&inter / ^VNI: 시세 행 0건 / VNINDEX: GET 실패(3회 시도): https://query1.finance.yahoo.com/v8/finance/chart/VNINDEX?range=2y&interval / ^VNINDEX.VN: 2026년 거래일이 1일뿐 (최소 60일) — 지수가 아니거나 빈 심볼입니다 / VNI.VN: GET 실패(3회 시도): https://query1.finance.yahoo.com/v8/finance/chart/VNI.VN?range=2y&interval=
     🔎 야후가 아는 것:
      · 0P0000HY8X.VN  [INDEX] 0P0000HY8X.VN VSE

   → 심볼이 틀렸다면 packages/collectors/src/worldMarketCli.ts 의 WORLD_INDICES 후보에 추가하세요.
     (야후 심볼 표기는 시장마다 갈립니다. 세션은 외부망이 막혀 미리 확인할 수 없어
      후보를 순서대로 시도하도록 만들어 두었습니다.)
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-world-market: `tsx src/worldMarketCli.ts -- --year 2026 --out /home/runner/work/claude/claude/data/datasets/world-market-2026.json`
Exit status 1
```
