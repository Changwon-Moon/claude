# 청약홈 수집 마지막 실행

- 실행: 2026-08-19 (KST) · 방아쇠 `push`
- 조건: 최근 14일 이내 · 소재 문턱 40점
- 결과: **실패**
- 커밋: `d36abdd7561b4b6501a189c42e909156ce0c3388`

## 수집 로그
```

> @wirit/collectors@0.1.0 collect-applyhome /home/runner/work/claude/claude/packages/collectors
> tsx src/applyhomeCli.ts -- --today 2026-08-19 --within 14

❌ 수집 실패: 청약홈 인증이 두 방식 모두 거부됐습니다 — header: GET 실패(1회 시도): https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=1
HTTP 401 https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=1 | query: GET 실패(1회 시도): https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=1&serviceKey=***
HTTP 401 https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=1&serviceKey=***
   ↳ 401 이면 키가 아니라 **활용신청/게이트웨이** 문제일 수 있습니다 (2026-08-19 에 서로 다른 두 키가 똑같이 401 이었습니다).
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-applyhome: `tsx src/applyhomeCli.ts -- --today 2026-08-19 --within 14`
Exit status 1
```

## 소재 등록
```
(등록 단계가 실행되지 못했습니다)
```
