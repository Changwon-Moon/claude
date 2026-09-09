# 신고가 단지 이력 — 마지막 실행

- 대기열: 1줄
- 결과: **성공**

```

── 다산반도유보라메이플타운 전용 84타입 (41360)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41360 --apt '다산반도유보라메이플타운' --umd '다산동' --type 84 --from 202001 --force

다산반도유보라메이플타운 · 전용 84타입 · 41360 · 202001~202609 (81개월)
⚠️ 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
⚠️ 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   ⏸ 문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
⚠️ 3/81개월을 못 받았습니다 — 그 달은 곡선에서 끊깁니다.
/home/runner/work/claude/claude/data/datasets/singo-history/41360-다산반도유보라메이플타운-84.json
거래 있던 달 74/81 · 수집 실패 3개월
📦 캐시에서 78개월 · 국토부에 물은 것 0개월  ← **호출 0회**
최고가 9.45억 (2021-08-21 · 전용 84.9683㎡ 16층)

✅ 대기열 전 줄 완료
```
