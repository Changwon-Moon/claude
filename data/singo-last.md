# 오늘의 신고가 — 마지막 실행

- 실행: 2026-08-12 (KST) · 방아쇠 `push`
- 기준: 1000세대 이상 명부 · 전용 59·84 타입 · 최근 2개월 신고분
- 결과: **성공**
- 커밋: `0b58c5de98fb6e3ae81bbf212646eb7e19f7a326`

```

> @wirit/collectors@0.1.0 collect-singo /home/runner/work/claude/claude/packages/collectors
> tsx src/molitSingoCli.ts -- --today 2026-08-12 --months 2 --top 10 --sort price

⚠️ 종로구 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
⚠️ 종로구 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
⚠️ 중구 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
⚠️ 중구 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
⚠️ 용산구 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
⚠️ 용산구 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인 상태 확인.
⛔ 6번 연속 실패 — 실거래 API 가 응답하지 않는 것으로 보고 여기서 접습니다.
   (계속 두드리면 30분을 태우고도 결과는 같습니다)
명부 1147개 단지 · 판정 지역 3/61 · 수집 성공 0회 / 실패 6회
→ 오늘의 신고가 0건
```
