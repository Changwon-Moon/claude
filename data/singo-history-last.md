# 신고가 단지 이력 — 마지막 실행

- 대기열: 1줄
- 결과: **성공**

```

── 호계2차현대홈타운 전용 59타입 (41173)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41173 --apt '호계2차현대홈타운' --umd '호계동' --type 59 --from 202001 --force

호계2차현대홈타운 · 전용 59타입 · 41173 · 202001~202609 (81개월)
⚠️ 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202607 은 캐시로 메웁니다(2026-09-08 접음) — API 가 안 열렸습니다
⚠️ 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202608 은 캐시로 메웁니다(2026-09-11 접음) — API 가 안 열렸습니다
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   ⏸ 문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
⚠️ 1/81개월을 못 받았습니다 — 그 달은 곡선에서 끊깁니다.
/home/runner/work/claude/claude/data/datasets/singo-history/41173-호계2차현대홈타운-59.json
거래 있던 달 58/81 · 수집 실패 1개월
📦 캐시에서 78개월 · 국토부에 물은 것 0개월  ← **호출 0회**
최고가 7.5억 (2026-08-21 · 전용 59.977㎡ 18층)

✅ 대기열 전 줄 완료
```
