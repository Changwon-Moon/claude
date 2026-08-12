# KOSIS 통계표 찾기 결과

> 표 ID 를 **추측하지 않기 위한** 파일이다. 키워드로 KOSIS 통계표를 훑어 적었다.
> 쓸 표를 고르면 `packages/collectors/src/sources/kosis.ts` 의 `TABLES` 에
> **`enabled: false` · `confidence: "표명확실"`** 로 넣고 → `data/kosis-probe-queue.txt` 푸시(probe) → 켠다.

- 실행 시각(KST): 2026. 8. 12. PM 12:40:40
- 키워드: 소비자물가 · 집세

## 「소비자물가」

### 시도한 조합

| 조합 | 결과 |
|---|---|
| 통계표 검색 statisticsSearch.do (searchNm) | ❌ 요청 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/statisticsSearch.do?method=getList&apiKey=***&searchNm=%EC%86%8C%EB%B9%84%EC%9E%90%EB%AC%BC%EA%B0%80&format=json&jsonVD=Y
fetch failed |
| 통계표 검색 statisticsSearch.do (searchNm + 통계표만) | ❌ 요청 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/statisticsSearch.do?method=getList&apiKey=***&searchNm=%EC%86%8C%EB%B9%84%EC%9E%90%EB%AC%BC%EA%B0%80&startCount=1&resultCount=100&sort=RANK&format=json& |
| 통계목록 statisticsList.do (vwCd=MT_ZTITLE 최상위) | ❌ 요청 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/statisticsList.do?method=getList&apiKey=***&vwCd=MT_ZTITLE&parentListId=&format=json&jsonVD=Y
fetch failed |

**통한 조합이 없다.** 위 실패 문구를 그대로 읽고 파라미터를 고친다 — 추측해서 표를 박지 않는다.

## 「집세」

### 시도한 조합

| 조합 | 결과 |
|---|---|
| 통계표 검색 statisticsSearch.do (searchNm) | ❌ 요청 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/statisticsSearch.do?method=getList&apiKey=***&searchNm=%EC%A7%91%EC%84%B8&format=json&jsonVD=Y
fetch failed |
| 통계표 검색 statisticsSearch.do (searchNm + 통계표만) | ❌ 요청 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/statisticsSearch.do?method=getList&apiKey=***&searchNm=%EC%A7%91%EC%84%B8&startCount=1&resultCount=100&sort=RANK&format=json&jsonVD=Y
fetch failed |
| 통계목록 statisticsList.do (vwCd=MT_ZTITLE 최상위) | ❌ 요청 실패 — GET 실패(4회 시도): https://kosis.kr/openapi/statisticsList.do?method=getList&apiKey=***&vwCd=MT_ZTITLE&parentListId=&format=json&jsonVD=Y
fetch failed |

**통한 조합이 없다.** 위 실패 문구를 그대로 읽고 파라미터를 고친다 — 추측해서 표를 박지 않는다.

---

### 다음 단계

1. 위 표에서 쓸 `tblId` 를 고른다 (**이름이 정확히 맞는 것만** — 비슷한 이름의 표가 여럿이다)
2. `sources/kosis.ts` 의 `TABLES` 에 `enabled: false` 로 추가
3. `data/kosis-probe-queue.txt` 에 한 줄 덧붙여 푸시 → `data/kosis-probe.md` 에서 항목코드·분류축 확인
4. 스펙 확정 후 `enabled: true` + 셀프테스트 통과
