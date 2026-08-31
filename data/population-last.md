# 인구 수집 마지막 실행

- 실행: 2026-08-31 (KST) · 방아쇠 `push`
- 조건: 최근 25개월 · 신호 문턱 45점 · 상위 8건
- 보드 자동 등록: 끔(오너가 직접 고릅니다)
- 결과: **실패**
- 커밋: `25f681370ebadc195ca2c3da37ffaa1840f5420c`

## 수집 로그
```

> @wirit/collectors@0.1.0 collect-population /home/runner/work/claude/claude/packages/collectors
> tsx src/kosisCli.ts -- --today 2026-08-31 --months 25 --min 45

::error::인구(DT_1B040A3) 수집 실패 — KOSIS API 오류(population): 유효하지 않은 인증KEY입니다.
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::세대수(DT_1B040B3) 수집 실패 — KOSIS API 오류(households): 유효하지 않은 인증KEY입니다.
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::이동(DT_1B26001_A01) 수집 실패 — KOSIS API 오류(migration): 유효하지 않은 인증KEY입니다.
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
· 고령인구(DT_1B04006) — 202507~202607(14시점) · 지역 250곳을 23개씩 11번에 나눠 받습니다(4만 셀 한도)
::error::고령인구(DT_1B04006) 수집 실패 — KOSIS API 오류(age): 유효하지 않은 인증KEY입니다.
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::출생(DT_1B81A03) 수집 실패 — KOSIS API 오류(births): 유효하지 않은 인증KEY입니다.
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
::error::사망(DT_1B34E13) 수집 실패 — KOSIS API 오류(deaths): 유효하지 않은 인증KEY입니다.
  → 나머지 표는 계속 받습니다. 이 표는 이번 회차 산출물에서 빠집니다.
❌ 수집 실패: 인구 시계열이 비었다 — 표 ID·기간·인증키를 확인해야 한다.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-population: `tsx src/kosisCli.ts -- --today 2026-08-31 --months 25 --min 45`
Exit status 1
```

## 신호 정리
```
(등록 단계가 실행되지 못했습니다)
```

> 지도 조인에 "지도에 없는 시군구" 가 뜨면 행정구역이 바뀐 것입니다 —
> `scripts/build-sgg-geo.mjs` 로 경계를 다시 만들어야 합니다.
