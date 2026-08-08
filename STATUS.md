# STATUS — 현재 상태 보드

> 모든 세션은 시작할 때 이 파일을 읽고, 끝낼 때 갱신한다(CLAUDE.md 참조).
> **여기엔 "지금 상태 + 다음 할 일"만 둔다.** 지나간 세션 서사는 `docs/archive/STATUS-history.md`,
> 소재 결정 이력은 `research/DECISION_LOG.md`로 간다. 다시 로그가 쌓이지 않게 한다.

**최종 갱신**: 2026-08-08 (기준 문서 리뉴얼)

## 지금 상태 한눈에

- **운영 방식**: 세션이 저장소를 열어 카드를 만들고, **발행은 오너가 직접**(자동 발행 폐지). 정기 데이터 수집·재생산은 GitHub Actions.
- **최근 판형 작업**: `news-figure@1`(인물·뉴스 카드) 시안 완료 — **오너 선택 대기**. 오너가 고르면 `builders.json`·`sets.json` 등록 + 첫 확정 시 `sample.json` 고정.
- **인구 소재 배관**: 지역 인구 통계 자동 추출 경로와 시군구 2026년판 지도 신설(2026-08-03). KOSIS 기반, 통계청 행정구역코드로 조인.
- **최근 소재**: 등록외국인 국적 지도, 토허제×외국인 매수 등 소재 등록·승격 진행(상세는 `research/DECISION_LOG.md`).

## 확정·발행 카드

**정본은 `data/review/sets.json`(confirmed) + `data/review/pixel-baselines.json`(md5)다.** 아래는 스냅샷:

| 카드 | 성격 |
|---|---|
| estate-84 · estate-59 · metro-speed | 커버 없이 재업로드 확정(2026-07-31) |
| sinbundang-loop | 신분당선 역세권 대장 시세(정기물) |
| mae-streak · jeonse-streak | 주간 매매·전세 지수(정기물, `reb-weekly`) |
| jeonwolse-map | 서울 월세 비중 지도(토허 40곳) |
| danji-hangang | 청약·분양 표준 `danji-cover@1` 첫 확정본 |
| danji-songdo | 무순위(줍줍) 첫 확정본 |
| world-capital | 뉴스 소재(verified:false — 세트 note에 명시) |

> 정기물(실거래·증시·주간지수)은 "같은 데이터면 같은 픽셀"이 약속이라 `pixel-baselines.json`에 넣지 않는다 — `confirm.mjs`가 자동으로 가른다(고정물만 픽셀 고정).

## 다음 할 일 / 대기

- `news-figure@1` 판형을 오너가 고르면 등록 + 첫 실제 카드(인물 실물 사진 교체) 확정.
- 인구 카드 시리즈 전개(자동 추출 배관 활용).
- 소재 대기열은 `research/ideas.json`(관제탑 보드)와 `research/DECISION_LOG.md`.

## 발급된 키/계정 (이름만 — 값은 절대 기록 금지)

| 항목 | 상태 |
|---|---|
| DART (`DART_API_KEY`) — 평균연봉 | ✅ 발급·등록 |
| 공공데이터포털 (`DATA_GO_KR_API_KEY`) — 부동산·청약홈 | 사용 중(Actions Secrets) |
| 한국부동산원 R-ONE (`RONE_API_KEY`) — 전월세 지수 | 사용 중(Actions Secrets) |
| 국토부 (`MOLIT_API_KEY`) — 실거래 | 사용 중(Actions Secrets) |
| 한국은행 ECOS (`ECOS_API_KEY`) — 환율·금리 | 등록 |
| 텔레그램 (`TELEGRAM_BOT_TOKEN`·`TELEGRAM_CHAT_ID`) — 알림, 무료·무만료 | 2026-07-31 카카오톡에서 전환 |
| Anthropic (`ANTHROPIC_API_KEY`) — LLM 검수(선택) | 세션에서 필요 시 |
| ~~Meta 앱 · 인스타 토큰~~ | ⛔ 불필요 — 2026-07-27 수동 발행 결정 |

> 키는 GitHub Secrets 또는 `.env`(gitignore). **저장소에 커밋 금지.** 등록 여부는 `node scripts/check-secrets.mjs`로 화면과 눈으로 대조한다(이름만 비슷한 키를 켜진 줄 오인한 적 있음).

## 정기물 자동화

주간 매매·전세 지수, 청약홈 신규 분양(매일 08:00 KST), 실거래·증시 등은 GitHub Actions가 수집→재생산까지 자동으로 한다. "이건 내가 눌러야 하나?" 싶으면 `docs/DATA_REFRESH.md`부터 본다(대개 안 눌러도 된다). 세션에서 수집을 걸어야 하면 대기열 파일에 push한다(`docs/HANDOFF.md` §6).

---

> 마일스톤(M0~M12) 표·세션 로그·07월 관제탑 개편기 등 과거 서사: `docs/archive/STATUS-history.md`.
