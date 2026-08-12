# KOSIS 통계표 찾기 결과

> 표 ID 를 **추측하지 않기 위한** 파일이다. 키워드로 KOSIS 통계표를 훑어 적었다.
> 쓸 표를 고르면 `packages/collectors/src/sources/kosis.ts` 의 `TABLES` 에
> **`enabled: false` · `confidence: "표명확실"`** 로 넣고 → `data/kosis-probe-queue.txt` 푸시(probe) → 켠다.

- 실행 시각(KST): 2026. 8. 12. PM 3:19:48
- 키워드: 소비자물가 · 집세

## 연결 확인

✅ **kosis.kr 은 지금 살아 있다** (매일 도는 자료 조회 주소가 응답했다).
> 그러니 아래에서 검색이 실패한다면 그건 **망이 아니라 주소·파라미터 문제**다 — 다시 돌려도 같다.

## 「소비자물가」

### 시도한 조합

| 조합 | 결과 |
|---|---|
| 통계표 검색 statisticsSearch.do (searchNm) | ✅ 20건 |

### 찾은 통계표 (이름에 「소비자물가」 포함 5건 중 5건)

| orgId | tblId | 통계표명 | 주기·시점 | 목록 |
|---|---|---|---|---|
| 101 | `DT_1J22042` | 월별 소비자물가 등락률 | N | MT_ZTITLE |
| 101 | `DT_1YL20581` | 소비자물가 등락률(시도/시) | N | MT_GTITLE01 |
| 101 | `DT_1J22041` | 연도별 소비자물가 등락률 | N | MT_ZTITLE |
| 101 | `DT_2WEO011` | 물가상승률, 소비자물가지수 | N | MT_RTITLE |
| 101 | `DT_2WEO012` | 물가상승률, 기간말 소비자물가지수 | N | MT_RTITLE |

## 「집세」

### 시도한 조합

| 조합 | 결과 |
|---|---|
| 통계표 검색 statisticsSearch.do (searchNm) | ✅ 20건 |

### 찾은 통계표 (이름에 「집세」 포함 1건 중 1건)

| orgId | tblId | 통계표명 | 주기·시점 | 목록 |
|---|---|---|---|---|
| 331 | `DT_33109_A203` | (돈이 없어서) 집세 연체, 미납부로 인한 이사경험 여부 | N | MT_ZTITLE |

---

### 다음 단계

1. 위 표에서 쓸 `tblId` 를 고른다 (**이름이 정확히 맞는 것만** — 비슷한 이름의 표가 여럿이다)
2. `sources/kosis.ts` 의 `TABLES` 에 `enabled: false` 로 추가
3. `data/kosis-probe-queue.txt` 에 한 줄 덧붙여 푸시 → `data/kosis-probe.md` 에서 항목코드·분류축 확인
4. 스펙 확정 후 `enabled: true` + 셀프테스트 통과
