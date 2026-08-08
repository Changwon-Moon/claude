# 서울 생활인구 서비스 검증 — ❌ 검증이 돌지 못했다

- 실행 시각(KST): 2026-08-08 21:54
- 실행 로그: https://github.com/Changwon-Moon/claude/actions/runs/31258306457
- 키 있음: yes

```

> @wirit/collectors@0.1.0 probe-seoul /home/runner/work/claude/claude/packages/collectors
> tsx src/seoulProbeCli.ts

· foreignLong (SPOP_FORN_LONG_RESD_DONG) … 실패 — 서울시 API 오류(foreignLong): INFO-200 해당하는 데이터가 없습니다.
· foreignShort … 건너뜀(서비스명 미확인)
· local … 건너뜀(서비스명 미확인)

✅ 0/3 서비스 응답 확인 → /home/runner/work/claude/claude/data/seoul-probe.md
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 probe-seoul: `tsx src/seoulProbeCli.ts`
Exit status 1
```
