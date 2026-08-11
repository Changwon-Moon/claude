# STATUS — 현재 상태 보드

> 모든 세션은 시작할 때 이 파일을 읽고, 끝낼 때 갱신한다(CLAUDE.md 참조).
> **여기엔 "지금 상태 + 다음 할 일"만 둔다.** 지나간 세션 서사는 `docs/archive/STATUS-history.md`,
> 소재 결정 이력은 `research/DECISION_LOG.md`로 간다. 다시 로그가 쌓이지 않게 한다.

**최종 갱신**: 2026-08-11

> **08-11 (코워크 세션) 17건 패치 병합 + 무순위 2건(드파인 아르티아·송파) 제작 + 관제탑 등록 — 푸시는 여전히 막힘**
> 오너가 업로드한 `wirit작업분17건.patch`(청약·분양 카드 기준 md 포함)를 적용하고,
> 송파 시그니처 롯데캐슬·드파인 아르티아 두 무순위(줍줍) 카드를 만들어 관제탑에 반영했다.
> **이 세션의 커밋은 전부 로컬에만 있다 — 다음 세션이 반드시 이어받아야 한다.**
> ① `git apply` 는 컨텍스트 드리프트로 3건 실패 → `git am --3way --keep-cr` 로 전환해 해결.
>    패치 10건째(`company/teams/design.md`)에서 같은 삽입 지점을 두 로그(08-06 장위, 08-08 world-capital)가
>    다퉈 충돌 → **둘 다 시간순으로 남기고** 수동 병합. 나머지 7건은 그대로 적용됨.
> ② **드파인 아르티아(노량진, remndr)**: applyhomeNo(2026910214) 확보돼 표준 파이프라인
>    (`build-danji.mjs --only define-artia-remndr --publish`)으로 정상 제작. 타입별 분양가(84A 25.3억·
>    84B 27.6억·109A 30.6억)는 2차 출처(mhb-blog·homedubu) — 공고문 대조 전 발행 금지.
> ③ **송파 시그니처 롯데캐슬(거여동, remndr)**: 청약홈에 **공고번호가 아직 없는 재공급 1세대**라
>    `remndr()` 가드가 무조건 던진다. DATA_GO_KR_API_KEY 없음 + 상세페이지 JS 렌더라 공고번호를
>    이 세션에서 못 얻어 **예외 처리**: 데이터셋에 `_manual` 필드로 근거를 남기고, 카드 JSON을
>    표준 스키마 그대로 손으로 작성. 총세대수는 나무위키·리치고 2곳(1,945세대)이 롯데캐슬 공식
>    페이지(1,577세대, 소수의견) 와 달라 **다수결로 1,945 채택**. 분양가는 한국경제·헤럴드경제
>    2개 매체가 원단위까지 일치(공급가 9.4085억+옵션 0.717억=10.1255억→"10.1억") — 오너가
>    "청약홈이든 어디든 서칭해봐야지" 라고 재검색을 지시해 1개 출처(블로그)에서 2개 매체로 보강.
>    → **다음 세션에서 정식 공고번호가 확보되면 데이터셋에 `applyhomeNo`를 채우고 표준 빌더로 전환할 것.**
> ④ 오너 레이아웃 지시 2회 반영(제목 빨강 강조·안전마진 glow 강조·사진 칸 확대 등) →
>    `templates/danji-cover/template.html`(공유 파일)에 **opt-in** 클래스 `.dcv-item.warn`/`.glow` 신설,
>    `doctor.mjs` 로 확정본 9종 픽셀 불변 재확인(영향 없음 확인 완료).
> ⑤ **관제탑 등록**: `data/review/sets.json`·`builders.json` 에 `danji-define-artia`·`danji-songpa`
>    세트/빌더 추가. 송파는 표준 빌더를 못 태워 `scripts/build-danji-songpa-manual.mjs`(신규 커밋)에
>    승인된 카드 JSON을 고정 — `data/content`가 gitignore 대상이라 산출물 대신 **재현 스크립트**를
>    커밋해 새 clone·CI에서도 카드가 나오게 함. `render-sets → build-tower-site → smoke-tower` 재실행,
>    159/159 통과(승인대기 10→12).
> ⑥ **캡션 작성**: `data/review/captions/danji-songpa.txt`·`danji-define-artia.txt` 신규.
>    `node scripts/produce-card.mjs <라벨>` 로 재생산·렌더·코드검수(해시태그 5개·출처·금액 수치대조)
>    까지 돌려 둘 다 **PASS(error 0·warn 0)**. 리포트 `data/review/danji-*.json` 커밋.
> ⑦ **🚨 이 세션 전체(24커밋)가 origin 에 안 올라갔다.** `git push` 는 매번 다음 오류로 막힘:
>    `access denied by the git proxy: Changwon-Moon/claude is not in this session's authorized
>    repository set, so the proxy will not inject a credential for it.`
>    — **PAT 토큰 문제가 아니다** (`git ls-remote` 읽기는 항상 성공, 같은 토큰으로 push만 403).
>    오너가 토큰(`wirit_note2`)에 code·actions·workflows **Read/Write 권한을 새로 켜고 재시도**했지만
>    **동일하게 막힘** — 에러 문구가 "프록시가 자격증명을 아예 주입 안 한다"이므로 **토큰 스코프와
>    무관하게 세션 레벨 저장소 인가 목록**에서 막는 것으로 재확인. 데스크톱 앱 연결(`mcp__remote-devices__*`)
>    도 이 세션엔 안 붙음(ToolSearch 로 재확인, 툴 자체가 안 잡힘).
>    → **작업분은 `git bundle create ... "origin/<브랜치>..<브랜치>"` 로 뽑아 오너에게 반복 전달했다**
>    (최종 25커밋 번들, 이 STATUS 갱신 포함). 오너가 로컬에서 `git fetch <bundle> ...` + `git push` 로
>    직접 올리거나, **저장소가 연결된 새 코워크 세션**에서 다시 시도하기로 함(연결 여부는 검증 안 됨 —
>    claude.ai GitHub 커넥터는 문서상 읽기 전용 컨텍스트 임포트용이라 이 프록시 인가와 별개일 가능성 높음).
> ⑧ **다음 세션이 제일 먼저 할 일**: (1) `git push` 를 아무 변경 없이 한 번 테스트 — 되면 즉시
>    이 번들을 적용해 올린다. (2) 안 되면 오너에게 로컬 적용을 다시 안내하고, **새로운 카드
>    작업을 반복하지 않는다** — 이 세션 산출물(카드 2건·관제탑 등록·캡션)은 전부 끝난 상태로
>    번들 안에 있다. 재작업이 아니라 **푸시 방법**만 남았다.

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
