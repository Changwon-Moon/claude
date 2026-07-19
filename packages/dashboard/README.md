# packages/dashboard — 관제탑 산출물 폴더

이 폴더에는 **정적 관제탑(Control Tower B단계)**의 생성 결과물이 놓인다.

- `tower-state.json` — 저장소 산출물을 집계한 단일 상태 파일 *(생성물, gitignore)*
- `index.html` — 상태를 주입한 자체 완결 관제탑 페이지 *(생성물, gitignore)*

## 다시 만들기

```bash
pnpm --filter @wirit/dashboard-static all      # 상태 + HTML 한 번에
# 또는 단계별
pnpm --filter @wirit/dashboard-static state     # tower-state.json 만
pnpm --filter @wirit/dashboard-static html      # 기존 state로 index.html
```

생성기 소스는 [`packages/dashboard-static`](../dashboard-static)에 있다.
결과물은 대용량(썸네일 base64 포함)이라 커밋하지 않는다 —
필요할 때 위 명령으로 재생성하거나, 향후 GitHub Actions가 매일 재생성해 GitHub Pages로 배포한다(C단계 전 단계).

## 무엇을 읽어 만드나 (데이터 출처)

| 관제탑 영역 | 저장소 소스 |
|---|---|
| 소재후보 티켓 | `research/briefs/{최신}.md` (체크 안 된 항목) |
| 진행·승인대기 티켓 | `research/DECISION_LOG.md` + `data/content|out/{날짜}` (렌더 카드) |
| 회사 탭 — 원칙 | `company/CEO.md` |
| 회사 탭 — 팀 | `company/teams/*.md` |
| 자산 탭 | `data/datasets/catalog.json`, `templates/_shared/{logos,photos}/catalog.json` |

> ⚠️ `data/content`·`data/out`은 gitignore이므로, CI에서 관제탑을 만들 땐 **파이프라인 렌더 단계 이후**에 생성해야 썸네일이 포함된다.
