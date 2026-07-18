# @wirit/renderer

콘텐츠 JSON → 인스타 카드 PNG 변환기. 파이프라인의 "디자인팀(렌더링)" 부품.

## 무엇을 하나

`콘텐츠 JSON` + `템플릿(HTML/CSS)` → **Playwright(헤드리스 Chromium) 스크린샷** → `1080×1350 PNG` (레티나 2배 = 2160×2700).

- **결정적**: 동일 입력 = 동일 픽셀 (타임스탬프·랜덤 없음). CI 회귀 테스트·QA의 전제.
- **계약 검증**: 콘텐츠 데이터를 템플릿 `schema.json`으로 검증. 불일치 시 명확한 에러로 반려(편집 에이전트가 읽고 수정).
- **캐러셀**: 콘텐츠 JSON에 `pages[]`가 있으면 페이지별로 PNG 생성.

## 사용법

```bash
# 저장소 루트에서
pnpm install          # 최초 1회

# 렌더 실행
pnpm --filter @wirit/renderer render -- \
  --data templates/dummy-card/sample.json \
  --out data/out
```

옵션:
- `--data, -d`  렌더할 콘텐츠 JSON (필수)
- `--out, -o`   PNG 출력 폴더 (기본 `data/out`)

## 구조

```
src/
├── cli.ts           # 명령행 진입점
├── renderContent.ts # 콘텐츠 1건 → PNG(들) 오케스트레이션
├── loadTemplate.ts  # 템플릿 ID(name@ver) → 폴더 로드
├── validate.ts      # ajv 로 schema.json 검증
├── renderHtml.ts    # Handlebars 바인딩 + base.css 인라인 주입
├── screenshot.ts    # Playwright 캡처 (Chromium 자동 탐색)
├── paths.ts         # 저장소 경로 상수
└── types.ts         # 데이터 계약 타입
```

## 템플릿 추가 방법 (M2~)

`templates/{이름}/` 폴더에 4개 파일:
- `template.html` — Handlebars 템플릿. `<head>`에 `<!--WIRIT_SHARED_CSS-->` 넣으면 공통 스타일 주입 지점
- `schema.json` — 입력 데이터 계약 (JSON Schema)
- `sample.json` — 샘플 데이터 (개발·회귀 테스트용)
- `config.json` — 크기/배율 등 (선택, 기본 1080×1350×2)

자세한 설계 규칙: [../../docs/TEMPLATES.md](../../docs/TEMPLATES.md)

## 환경 메모

- 이 저장소 실행 환경에는 Chromium이 사전 설치돼 있음(`PLAYWRIGHT_BROWSERS_PATH`). `screenshot.ts`가 자동 탐색하므로 `playwright install` 불필요.
- Node ≥ 20, pnpm 사용.
- 폰트: M1은 시스템 폰트 스택. **M2에서 Pretendard 웹폰트를 번들**해 머신 간 완전 동일 렌더 보장 예정.
