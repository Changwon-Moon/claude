# 청약홈 주택형별 분양가 — 수집 보고

- 실행: 2026-08-28
- 데이터셋: APT 주택형별 분양정보 (data.go.kr 15101047)

## 실패

```
APT 주택형별 분양정보 인증이 두 방식 모두 거부됐습니다 — header: GET 실패(1회 시도): https://api.odcloud.kr/api/15101047/v1/uddi:69236f4f-13ff-4ecb-a429-ed5398f2b459?page=1&perPage=1
HTTP 401 https://api.odcloud.kr/api/15101047/v1/uddi:69236f4f-13ff-4ecb-a429-ed5398f2b459?page=1&perPage=1 | query: GET 실패(1회 시도): https://api.odcloud.kr/api/15101047/v1/uddi:69236f4f-13ff-4ecb-a429-ed5398f2b459?page=1&perPage=1&serviceKey=***
HTTP 401 https://api.odcloud.kr/api/15101047/v1/uddi:69236f4f-13ff-4ecb-a429-ed5398f2b459?page=1&perPage=1&serviceKey=***
   ↳ 401/403 이면 키가 아니라 **활용신청**을 먼저 보세요.
      https://www.data.go.kr/data/15101047/fileData.do 는 청약홈 조회 서비스(15098547)와 **별개 승인**입니다.
```
