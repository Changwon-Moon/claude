# 신고가 단지 이력 — 마지막 실행

- 대기열: 246줄
- 결과: **실패**

```

── 두산 전용 84타입 (11620)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 11620 --apt '두산' --umd '봉천동' --type 84 --from 202001 --force

두산 · 전용 84타입 · 11620 · 202001~202609 (81개월)
⚠️ 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202607 은 캐시로 메웁니다(2026-09-14 접음) — API 가 안 열렸습니다
⚠️ 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202608 은 캐시로 메웁니다(2026-09-11 접음) — API 가 안 열렸습니다
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   ⏸ 문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
⚠️ 1/81개월을 못 받았습니다 — 그 달은 곡선에서 끊깁니다.
/home/runner/work/claude/claude/data/datasets/singo-history/11620-두산-84.json
거래 있던 달 55/81 · 수집 실패 1개월
📦 캐시에서 78개월 · 국토부에 물은 것 0개월  ← **호출 0회**
최고가 14.83억 (2026-08-07 · 전용 84.92㎡ 21층)

── 과천자이 전용 59타입 (41290)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41290 --apt '과천자이' --umd '별양동' --type 59 --from 202001

⏭ 이미 있음 — 41290-과천자이-59.json (다시 받으려면 force=1)

── DMC래미안e편한세상 전용 84타입 (11410)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 11410 --apt 'DMC래미안e편한세상' --umd '북가좌동' --type 84 --from 202001

⏭ 이미 있음 — 11410-DMC래미안e편한세상-84.json (다시 받으려면 force=1)

── 동아1 전용 59타입 (11530)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 11530 --apt '동아1' --umd '신도림동' --type 59 --from 202001

⏭ 이미 있음 — 11530-동아1-59.json (다시 받으려면 force=1)

── 한진한화그랑빌 전용 84타입 (11350)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 11350 --apt '한진한화그랑빌' --umd '월계동' --type 84 --from 202001

⏭ 이미 있음 — 11350-한진한화그랑빌-84.json (다시 받으려면 force=1)

── 이수브라운스톤돈암 전용 84타입 (11290)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 11290 --apt '이수브라운스톤돈암' --umd '돈암동' --type 84 --from 202001

⏭ 이미 있음 — 11290-이수브라운스톤돈암-84.json (다시 받으려면 force=1)

── 매화마을공무원2 전용 59타입 (41135)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41135 --apt '매화마을공무원2' --umd '야탑동' --type 59 --from 202001

⏭ 이미 있음 — 41135-매화마을공무원2-59.json (다시 받으려면 force=1)

── 광명해모로이연 전용 84타입 (41210)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41210 --apt '광명해모로이연' --umd '광명동' --type 84 --from 202001

⏭ 이미 있음 — 41210-광명해모로이연-84.json (다시 받으려면 force=1)

── 수원센트럴아이파크자이 전용 84타입 (41115)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41115 --apt '수원센트럴아이파크자이' --umd '인계동' --type 84 --from 202001

⏭ 이미 있음 — 41115-수원센트럴아이파크자이-84.json (다시 받으려면 force=1)

── 수원센트럴아이파크자이 전용 59타입 (41115)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41115 --apt '수원센트럴아이파크자이' --umd '인계동' --type 59 --from 202001

⏭ 이미 있음 — 41115-수원센트럴아이파크자이-59.json (다시 받으려면 force=1)

── 래미안노블클래스1단지 전용 59타입 (41115)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41115 --apt '래미안노블클래스1단지' --umd '인계동' --type 59 --from 202001

⏭ 이미 있음 — 41115-래미안노블클래스1단지-59.json (다시 받으려면 force=1)

── 원천레이크파크 전용 59타입 (41117)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41117 --apt '원천레이크파크' --umd '원천동' --type 59 --from 202001

⏭ 이미 있음 — 41117-원천레이크파크-59.json (다시 받으려면 force=1)

── 중흥S-클래스에듀파크 전용 59타입 (41370)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41370 --apt '중흥S-클래스에듀파크' --umd '궐동' --type 59 --from 202001

⏭ 이미 있음 — 41370-중흥S클래스에듀파크-59.json (다시 받으려면 force=1)

── 평촌센텀퍼스트 전용 59타입 (41173)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41173 --apt '평촌센텀퍼스트' --umd '호계동' --type 59 --from 202001 --force

평촌센텀퍼스트 · 전용 59타입 · 41173 · 202001~202609 (81개월)
⚠️ 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202607 은 캐시로 메웁니다(2026-09-14 접음) — API 가 안 열렸습니다
⚠️ 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202608 은 캐시로 메웁니다(2026-09-14 접음) — API 가 안 열렸습니다
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   ⏸ 문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202609 은 캐시로 메웁니다(2026-09-10 접음) — API 가 안 열렸습니다
/home/runner/work/claude/claude/data/datasets/singo-history/41173-평촌센텀퍼스트-59.json
거래 있던 달 20/81 · 수집 실패 0개월
📦 캐시에서 78개월 · 국토부에 물은 것 0개월  ← **호출 0회**
최고가 12.15억 (2026-09-04 · 전용 59.7995㎡ 10층)

── 화서역푸르지오더에듀포레 전용 84타입 (41111)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41111 --apt '화서역푸르지오더에듀포레' --umd '천천동' --type 84 --from 202001 --force

화서역푸르지오더에듀포레 · 전용 84타입 · 41111 · 202001~202609 (81개월)
⚠️ 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202607 은 캐시로 메웁니다(2026-09-08 접음) — API 가 안 열렸습니다
⚠️ 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202608 은 캐시로 메웁니다(2026-09-14 접음) — API 가 안 열렸습니다
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   ⏸ 문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202609 은 캐시로 메웁니다(2026-09-14 접음) — API 가 안 열렸습니다
/home/runner/work/claude/claude/data/datasets/singo-history/41111-화서역푸르지오더에듀포레-84.json
거래 있던 달 64/81 · 수집 실패 0개월
📦 캐시에서 78개월 · 국토부에 물은 것 0개월  ← **호출 0회**
최고가 9.1억 (2026-09-05 · 전용 84.89㎡ 22층)

── e편한세상반월나노시티역 전용 59타입 (41595)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41595 --apt 'e편한세상반월나노시티역' --umd '반월동' --type 59 --from 202001 --force

e편한세상반월나노시티역 · 전용 59타입 · 41595 · 202001~202609 (81개월)
⚠️ 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202607 은 캐시로 메웁니다(2026-09-08 접음) — API 가 안 열렸습니다
⚠️ 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202608 은 캐시로 메웁니다(2026-09-10 접음) — API 가 안 열렸습니다
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   ⏸ 문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202609 은 캐시로 메웁니다(2026-09-14 접음) — API 가 안 열렸습니다
/home/runner/work/claude/claude/data/datasets/singo-history/41595-e편한세상반월나노시티역-59.json
거래 있던 달 59/81 · 수집 실패 0개월
📦 캐시에서 78개월 · 국토부에 물은 것 0개월  ← **호출 0회**
최고가 7.7억 (2026-09-05 · 전용 58.23㎡ 11층)

── 자연앤데시앙 전용 84타입 (41597)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41597 --apt '자연앤데시앙' --umd '능동' --type 84 --from 202001 --force

자연앤데시앙 · 전용 84타입 · 41597 · 202001~202609 (81개월)
⚠️ 202607 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
⚠️ 202608 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   📦 202608 은 캐시로 메웁니다(2026-09-11 접음) — API 가 안 열렸습니다
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
   ⏸ 문이 닫힌 것으로 보고 60초 기다립니다 (1/5)
⚠️ 202609 수집 실패: 모든 엔드포인트 실패 — getRTMSDataSvcAptTradeDev: fetch failed | getRTMSDataSvcAptTrade: fetch failed
↳ 403이면: (a) 방금 신청한 키의 전파 지연(최대 1~2시간) 또는 (b) 해당 API 활용신청 미완(상세/기본). 공공데이터포털 마이페이지에서 '아파트 매매 실거래가 상세/자료' 승인
⚠️ 2/81개월을 못 받았습니다 — 그 달은 곡선에서 끊깁니다.
/home/runner/work/claude/claude/data/datasets/singo-history/41597-자연앤데시앙-84.json
거래 있던 달 60/81 · 수집 실패 2개월
📦 캐시에서 78개월 · 국토부에 물은 것 0개월  ← **호출 0회**
최고가 7.28억 (2026-08-31 · 전용 84.94㎡ 21층)

── 수원하늘채더퍼스트2단지 전용 59타입 (41113)

> @wirit/collectors@0.1.0 collect-singo-history /home/runner/work/claude/claude/packages/collectors
> tsx src/molitHistoryCli.ts -- --lawd 41113 --apt '수원하늘채더퍼스트2단지' --umd '곡반정동' --type 59 --from 202001 --force

수원하늘채더퍼스트2단지 · 전용 59타입 · 41113 · 202001~202609 (81개월)
```
