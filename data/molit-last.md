# 실거래 수집(국토부) — 마지막 실행

- 실행: 2026-09-02 (KST) · 방아쇠 `push`
- 기준: gyeonggi / 용인시기흥구,화성시동탄구,수원시장안구,수원시팔달구,의왕시 · 월 202607
- 결과: **실패**
- 커밋: `70d77cb6d1702baecbc2c84136561af458afa945`

> 예약 런은 대기열(data/molit-queue.txt)을 읽지 않습니다 — 기본 기준으로만 돕니다(2026-08-27).

## 실패 로그 (끝 25줄)
```
❌ 용인시기흥구 202607: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
❌ 화성시동탄구 202607: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
❌ 수원시장안구 202607: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
❌ 수원시팔달구 202607: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
❌ 의왕시 202607: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.

요약: 수집 0 · 스킵 0 · 실패 5 · 거래 0건
undefined
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command failed with exit code 1: tsx src/molitCli.ts --region gyeonggi --gu 용인시기흥구,화성시동탄구,수원시장안구,수원시팔달구,의왕시 --months 202607 --out /home/runner/work/claude/claude/data/datasets/molit
```
