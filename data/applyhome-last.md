# 청약홈 수집 마지막 실행

- 실행: 2026-08-19 (KST) · 방아쇠 `push`
- 조건: 최근 14일 이내 · 소재 문턱 40점
- 결과: **실패**
- 커밋: `f897b1560ff89573df267788c48874ce1922165c`

## 수집 로그
```

> @wirit/collectors@0.1.0 collect-applyhome /home/runner/work/claude/claude/packages/collectors
> tsx src/applyhomeCli.ts -- --today 2026-08-19 --within 14

❌ 수집 실패: GET 실패(4회 시도): https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=500&serviceKey=***
HTTP 401 https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=500&serviceKey=***
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-applyhome: `tsx src/applyhomeCli.ts -- --today 2026-08-19 --within 14`
Exit status 1
```

## 「진단」 MOLIT_API_KEY 로 같은 API 호출 (임시 · 2026-08-19)
```
(B) MOLIT_API_KEY 로도 401 — 청약홈 활용신청 자체가 문제입니다

--- 진단 로그

> @wirit/collectors@0.1.0 collect-applyhome /home/runner/work/claude/claude/packages/collectors
> tsx src/applyhomeCli.ts -- --today 2026-08-19 --within 1

❌ 수집 실패: GET 실패(4회 시도): https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=500&serviceKey=***
HTTP 401 https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=500&serviceKey=***
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-applyhome: `tsx src/applyhomeCli.ts -- --today 2026-08-19 --within 1`
Exit status 1
```

## 소재 등록
```
(등록 단계가 실행되지 못했습니다)
```
