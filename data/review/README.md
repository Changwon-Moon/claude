# data/review — 검수 리포트

검수 오케스트레이터(`packages/pipeline/src/review/reviewCli.ts`)와 `.github/workflows/review.yml`이
콘텐츠 세트를 검수하고 이 폴더에 `<label>.json` 리포트를 남긴다. 관제탑이 이 리포트를 소비한다.

- `verdict`: pass · revise · block
- `findings`/`cards[].findings`: 검수자별 지적(수정 지시 포함)
- `llm.available`: LLM 검수 포함 여부(ANTHROPIC_API_KEY 유무)

기준: `docs/REVIEW_RUBRIC.md`
