# 🔌 이미 연결된 API — 단일 창구

> **이 문서가 있는 이유** (2026-08-12 오너 지시)
> 세션이 오너에게 **"API 키를 주세요"라고 물었다.** 물을 일이 아니었다 — 그 키는 이미
> GitHub Secrets 에 있었고 워크플로가 매일 그걸로 데이터를 받아오고 있었다.
> 세션 컨테이너에 키가 없다는 것과 **저장소에 배관이 없다는 것은 전혀 다른 문제**인데,
> 그 둘을 구분할 목록이 어디에도 없어서 세션이 "없다"로 오판했다.
>
> 오너: *"이미 KOSIS는 API 연결되어 있어. API 연결 리스트를 스킬 및 작업 기준에 반영해서
> 다음부터 이런 질문 하지 않도록 해줘."*
>
> 그래서 이 문서는 **"무엇이 이미 연결돼 있나"의 단일 창구**다.
> `DATA_SOURCES.md` 가 *어떤 데이터가 세상에 있나*(카탈로그)라면, 이 문서는 *무엇이 이미 우리 것인가*다.

---

## 🚫 세션이 하지 말아야 할 것 — 먼저 읽는다

1. **오너에게 API 키를 요구하지 않는다.** 아래 표에 있는 키는 전부 **GitHub Secrets 에 있고
   실제로 워크플로가 쓰고 있다.** 세션 컨테이너에 키가 없는 것은 정상이다 — 세션은 키를 쥐지 않는다.
2. **세션에서 외부 API 를 직접 부르려 하지 않는다.** 컨테이너는 외부망이 막혀 있다
   (2026-08-01 실측: `apis.data.go.kr` HTTP 000). 수집은 **GitHub Actions 가 한다.**
3. **수집을 걸고 싶으면 대기열 파일에 한 줄 밀어 푸시한다** (§3). 세션은 Actions 실행 버튼을
   못 누르지만 **푸시는 된다** — 그게 유일하고 충분한 손잡이다.
4. **`doctor.mjs` 의 "⚠️ ○○_API_KEY 없음" 경고를 "연결 안 됨"으로 읽지 않는다.**
   그건 *이 컨테이너에* 없다는 뜻이지 *저장소에* 없다는 뜻이 아니다.
5. **표 ID·항목코드를 추측해서 박지 않는다.** KOSIS 는 찾기(§4)와 검증(probe)이 배관으로 있다.

---

## 1. 키가 필요한 API — 전부 Secrets 에 있고 실사용 중

실측 기준: 2026-08-12, 워크플로 29개 · 수집기 소스 12개 전수.
교차검증 도구가 저장소 안에 있다 — **`node scripts/check-secrets.mjs`** 가 워크플로의 `secrets.*` 와
코드의 `process.env.*` 를 그때그때 다시 뽑아 대조한다. **이 표가 의심되면 그걸 돌린다.**

| API | 시크릿/환경변수 | 수집기 | 산출 데이터 | 워크플로 (cron은 UTC) | 상태 |
|---|---|---|---|---|---|
| **KOSIS 국가통계포털** | `KOSIS_API_KEY` | `sources/kosis.ts` · `kosisCli.ts` | `data/datasets/population-latest.json` · `population/{YYYY-MM}.json` | `population-collect.yml` `0 0 3 * *` + `data/population-queue.txt` | ✅ 실사용 |
| └ KOSIS 표 검증(probe) | 〃 | `kosisProbeCli.ts` | `data/kosis-probe.md` · `kosis-probe-raw.json` | `kosis-probe.yml` (`data/kosis-probe-queue.txt`) | ✅ 실사용 |
| └ KOSIS 표 찾기(search) | 〃 | `kosisSearchCli.ts` | `data/kosis-search.md` | 〃 (`search=키워드` 줄) | ✅ 2026-08-12 신설 |
| **국토부 실거래(매매)** | `MOLIT_API_KEY` | `sources/molit.ts` · `molitCli.ts` | `data/datasets/molit/{LAWD}-{YYYYMM}.json` | `molit-collect.yml` `20 3 5,20 * *` + `data/molit-queue.txt` · `collect-on-request.yml` | ✅ 실사용 |
| **국토부 전월세 실거래** | `MOLIT_API_KEY` | `molitRentCli.ts` | `data/datasets/molit-rent/{LAWD}-{YYYYMM}.json` | `molit-rent-collect.yml` `40 3 5,20 * *` + `data/molit-rent-queue.txt` | ✅ 실사용 |
| **청약홈 분양정보** | `DATA_GO_KR_API_KEY` | `sources/applyhome.ts` · `applyhomeCli.ts` | `data/datasets/applyhome-latest.json` · `applyhome/{날짜}.json` | `applyhome-collect.yml` `0 2 * * *` (매일 11:00 KST) | ✅ 실사용 |
| **국토부 최고가 인덱스(신고가 판정)** | `MOLIT_API_KEY` | `molitPeakCli.ts` · `molitSingoCli.ts` | `data/datasets/molit-peak/{LAWD}.json` · `singo-log/{YYYY-MM}.json` | `molit-peak-backfill.yml` · `singo-daily.yml` `0 22 * * *` (매일 07:00 KST) | ✅ 실사용 |
| └ 단지 월별 최고가 곡선 | 〃 | `molitHistoryCli.ts` | `data/datasets/singo-history/{LAWD}-{단지}-{타입}.json` | `singo-history.yml` (`data/singo-history-queue.txt`) | ✅ 실사용 |
| **국토부 공동주택 기본정보(세대수)** | `MOLIT_API_KEY` | `sources/aptInfo.ts` · `aptUniverseCli.ts` | `data/datasets/apt-hhld.json` (8,062단지) | `apt-universe.yml` | ✅ 실사용 |
| └ 공동주택 **상세**정보(주차대수) | 〃 | `aptDetailCli.ts` | `data/datasets/apt-detail/{kapt}.json` | `apt-detail.yml` (`data/apt-detail-queue.txt`) | ✅ 2026-08-16 신설 |
| **카카오 로컬(가장 가까운 역)** | `KAKAO_REST_KEY` | `aptStationCli.ts` · `parse/station.ts` | `data/datasets/apt-station/{kapt}.json` | `apt-station.yml` (`data/apt-station-queue.txt`) | ✅ 2026-08-16 신설 |
| **한국부동산원 R-ONE (월간)** | `RONE_API_KEY` **또는** `REB_API_KEY` | `sources/rebIndex.ts` · `rebCli.ts` | `data/datasets/reb-rent-index.json` | `reb-collect.yml` `0 2 16 * *` | ✅ 실사용 |
| **한국부동산원 R-ONE (주간)** | 〃 | `sources/rebWeekly.ts` · `rebWeeklyCli.ts` | `data/datasets/reb-weekly-index.json` | `reb-weekly-collect.yml` `7 1 * * 5` + `data/reb-weekly-queue.txt` | ✅ 실사용 |
| **금감원 DART** | `DART_API_KEY` | `sources/dartSalary.ts` · `dartCli.ts` | `data/datasets/avg-salary-2025.json` | `dart-salary.yml` (dispatch 전용) | ✅ 실사용(수동) |
| **한국은행 ECOS** | `ECOS_API_KEY` | `sources/krRates.ts` | `data/raw/{날짜}/kr-rates.json` **(gitignore — 아티팩트만)** | `collect.yml` `30 21 * * 1-5` | ⚠️ 연결됨·저장소 증거 없음 |
| **서울 열린데이터광장 생활인구** | `SEOUL_OPENAPI_KEY` | `sources/seoulOpenApi.ts` · `seoulProbeCli.ts` | `data/seoul-probe.md` (probe 산출뿐) | `seoul-living-probe.yml` (`data/seoul-probe-queue.txt`) | ⚠️ probe 배관만 — 정기 수집 워크플로 없음, 서비스 3종 `enabled:false` |
| **카카오 로컬(지오코딩)** | `KAKAO_REST_KEY` | `scripts/geocode-sites.mjs` | 대상 데이터셋에 좌표 주입 · `data/geocode-last.md` | `geocode.yml` (`data/geocode-queue.txt`) | ✅ 실사용 |
| **Brandfetch** (로고 Tier C) | `BRANDFETCH_API_KEY` | `sources/brandfetchLogo.ts` · `logoCli.ts` | `templates/_shared/logos/*` | `asset-fetch.yml` (`data/assets-queue.txt`) | ✅ 연결됨 |
| **Pexels / Pixabay** | `PEXELS_API_KEY` · `PIXABAY_API_KEY` | `scripts/fetch-photo.mjs` | `assets/photos/*` | `photo-fetch.yml` · `photo-batch.yml` | ✅ 연결됨 |
| **Telegram Bot** (알림) | `TELEGRAM_BOT_TOKEN` · `TELEGRAM_CHAT_ID` | `scripts/notify-telegram.mjs` | `data/telegram-last.md` | 8개 워크플로에서 사용 | ✅ 실사용 |
| **Cloudflare (관제탑 배포)** | `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` · `TOWER_PASSWORD` | `packages/tower-worker` | 관제탑 사이트 | `tower-deploy.yml` `0 21 * * *` | ✅ 실사용 |
| **Anthropic (LLM 검수)** | `ANTHROPIC_API_KEY` | `packages/pipeline/src/review/llmReview.ts` | `data/review/*` | `review.yml` (dispatch) | 선택 — 없으면 코드 검수만 |
| **Instagram Graph** | `IG_ACCESS_TOKEN` · `IG_USER_ID` | `scripts/collect-insights.mjs` | `data/performance.md` | `pipeline-tick.yml` `0 22 * * *` | ⛔ **미사용** — 자동 발행 폐지(2026-07-27). 키 없으면 조용히 `exit 0` |
| **GitHub (세션용 PAT)** | `WIRIT_GH_PAT` (프로젝트 문서에 보관) | `scripts/check-push.mjs` | — | — | ✅ 푸시·Actions 조회. `Actions: Read` 있음 / `Checks: Read` 없음 |

## 1b. 한국은행 ECOS — M2(통화량) (2026-08-12 신설)

| | |
|---|---|
| 키 | `ECOS_API_KEY` (Secrets, 이미 있음) |
| 수집기 | `packages/collectors/src/ecosM2Cli.ts` (`pnpm --filter @wirit/collectors collect-ecos-m2`) |
| 워크플로 | `.github/workflows/ecos-m2.yml` |
| 거는 법 | `data/ecos-queue.txt` 에 한 줄 적어 푸시 |
| 산출 | `data/datasets/m2-monthly.json` · 기록 `data/ecos-m2-probe.md` |

**세션에서는 `ecos.bok.or.kr` 이 egress 허용목록 밖이다.** 직접 부르지 말고 대기열을 쓴다.

### ECOS 를 다룰 때 밟게 되는 함정 4개 (전부 실측)

1. **이름이 글자까지 같은 은퇴한 표가 있다.** `101Y004`(1.7.3.1.2 구지표)와 `161Y006`(1.1.3.1.2 신지표)는
   이름이 동일한데 앞의 것은 2004-09 에서 멈춘다. → **최근 24개월을 찔러 보고** 살아 있는 표를 고른다.
2. **긴 구간을 한 번에 물으면 앞쪽 81개월만 오고 서버가 "총 81건"이라 답한다.** 거짓 총계다.
   → **1년 창으로 잘라** 여러 번 물어 붙인다.
3. **항목의 `END_TIME` 을 믿고 자르면 안 된다.** 구지표 표가 "1986~2003"이라 답하는데 실제로는 지금도 발표된다.
   끝은 **언제나 지금**까지 물어본다.
4. `StatisticTableList` 에 부모코드(`101`)를 주면 `INFO-200`(데이터 없음)이 온다. → 전체 목록을 받아 이름으로 거른다.

### ★ 2025-12-30 통화지표 개편 — 이 소재를 만지면 **기준부터** 확인한다
한국은행이 **수익증권(펀드·ETF)을 M2 에서 제외**했다(약 -400조). 신·구를 1년간 병행 발표한다.
ECOS 는 같은 통계표(`161Y006`)에 **`BBHA16 [참고] 구 M2(평잔, 원계열)`** 로 개편 전 계열을 함께 싣는다.

- 신 기준(`BBHA00`)으로 역대 정부를 재면 **현 정부 구간이 크게 줄어 결론이 뒤집힌다**(2배 → 0.95배).
- 개편 전 계열은 2003-10 부터다. 그 앞은 `101Y004`(1986-01~)에 있고 **겹치는 달의 값이 소수점까지 같다** —
  그래서 이을 수 있다. 다만 **이을 때마다 다시 대조**한다(빌더가 자동으로 하고, 다르면 던진다).
- 어느 계열을 쓸지는 **오너의 편집 판단**이다. 세션이 조용히 고르지 않는다.

## 2. 키 없이 부르는 공개 원천 — 전부 실배관

| 원천 | 수집기 | 산출 | 워크플로 |
|---|---|---|---|
| **Yahoo Finance** (국내·해외 지수) | `krMarketCli.ts` | `data/datasets/kr-market-2026.json` | `kr-market.yml` `10 22 * * 0-4` + `data/market-queue.txt` |
| **Stooq** (미 증시 CSV) | `sources/usMarket.ts` | `data/raw/{날짜}/us-market.json` (gitignore) | `collect.yml` |
| **Google News RSS · Google Trends RSS** | `sources/researchSignals.ts` | `research/briefs/{날짜}-auto.md` | `research-digest.yml` `0 22 * * *` |
| **Wikimedia Commons** (로고·사진) | `sources/logoFetch.ts` · `fetch-photo.mjs` | `templates/_shared/logos/` · `assets/photos/` | `asset-fetch.yml` · `photo-batch.yml` · `svg-asset-fetch.yml` |
| **vuski/admdongkor GeoJSON** | `scripts/build-sgg-geo.mjs` | `data/geo/korea-sgg-2026.geojson` | `sgg-geo-refresh.yml` (`data/geo-queue.txt`) |
| **기사 본문**(네이버·다음) | `scripts/fetch-article.mjs` (Chromium) | `research/articles/*` | `fetch-article.yml` (`research/article-queue.txt`) |

## 3. 대기열 파일 — 세션이 수집을 거는 유일한 손잡이

한 줄 덧붙여 **푸시**하면 그 워크플로가 깬다. 대부분 **마지막 줄만** 읽는다.

| 대기열 | 한 줄에 무엇을 적나 | 깨우는 워크플로 |
|---|---|---|
| `data/kosis-probe-queue.txt` | 사유 자유. `search=키워드[,키워드…]` 를 넣으면 표 찾기까지 돈다 | `kosis-probe.yml` |
| `data/population-queue.txt` | `months=25 min=45 top=8 digest=1 register=1` | `population-collect.yml` |
| `data/molit-queue.txt` | `region=seoul gu=all months=202607 force=false` | `molit-collect.yml` |
| `data/molit-rent-queue.txt` | `region=gyeonggi gu=과천시,… months=202604,202605` | `molit-rent-collect.yml` |
| `data/applyhome-queue.txt` | `within=7 min=45 digest=1` | `applyhome-collect.yml` |
| `data/singo-history-queue.txt` | `lawd=41210 umd=광명동 type=84 apt="광명한진타운"` | `singo-history.yml` |
| `data/apt-station-queue.txt` | `kapt=A42385801` (대장에 없으면 `addr="…" key=…`) | `apt-station.yml` |
| `data/apt-detail-queue.txt` | `kapt=A42385801` — 주차대수 | `apt-detail.yml` |
| `data/reb-weekly-queue.txt` | 아무 줄(변경이 방아쇠) | `reb-weekly-collect.yml` |
| `data/market-queue.txt` | 아무 줄 | `kr-market.yml` |
| `data/seoul-probe-queue.txt` | 아무 줄 | `seoul-living-probe.yml` |
| `data/geo-queue.txt` | `url=<geojson> tolerance=0.0004` | `sgg-geo-refresh.yml` |
| `data/assets-queue.txt` | 대상 파일 **경로**(첫 줄만 읽고 비운다) | `asset-fetch.yml` |
| `data/geocode-queue.txt` | 대상 파일 경로(실행 후 비운다) | `geocode.yml` |
| `data/collect-request.json` | `{"jobs":[{"region","gu","months"}],"force":false}` | `collect-on-request.yml` |
| `data/photo-batch.tsv` | `slug⇥source⇥제목/검색어` | `photo-batch.yml` |
| `data/logo-batch.tsv` | `slug⇥File:제목` | `photo-batch.yml` |
| `research/article-queue.txt` | 기사 URL | `fetch-article.yml` |
| `data/publish-queue.md` | 발행 승인 체크박스 줄 | `pipeline-tick.yml` · `publish-archive.yml` |

⚠️ **주차대수는 기본정보에 없다.** 세대수는 `getAphusBassInfoV4`, 주차대수는
`getAphusDtlInfoV4`(`kaptdPcnt` 지상 + `kaptdPcntu` 지하) — **다른 오퍼레이션**이다.
그래서 대장 `apt-hhld.json` 8,062건에는 주차대수가 아예 없고, 짚어 준 단지만 따로 받는다.

⚠️ `asset-fetch.yml` · `geocode.yml` 의 push 트리거는 브랜치가 **`claude/instagram-content-automation-roadmap-fxnb7p` 로 못박혀** 있다. 다른 브랜치에서 밀면 안 깬다.

## 4. 새 데이터가 필요할 때 — 순서

**"이 소재의 원자료가 없다"고 결론짓기 전에 이 순서를 끝까지 밟는다.**
없는 게 아니라 안 받아온 것일 때가 많다(2026-07-30: 월간 수집기밖에 없어 주간 지수를 '없다'고 오판).

1. **이 문서에서 찾는다** — 이미 연결돼 있나?
2. **`data/datasets/` 를 본다** — 받아 놓고 안 쓴 것 아닌가? (`catalog.json` 은 전수가 아니다 — 실제 파일을 본다)
3. **KOSIS 면 찾기부터**: `data/kosis-probe-queue.txt` 에 `search=키워드` 한 줄 → 푸시 →
   `data/kosis-search.md` 에서 `orgId`·`tblId`·통계표명을 읽는다. **추측해서 표를 박지 않는다.**
4. **표를 골랐으면 probe**: `sources/kosis.ts` 의 `TABLES` 에 **`enabled: false` · `confidence: "표명확실"`** 로 넣고
   대기열 푸시 → `data/kosis-probe.md` 에서 항목코드(`itmId`)·분류축(`objL`)·행정구역 축을 실측 확인.
5. **스펙 확정 → `enabled: true`** → `pnpm --filter @wirit/collectors selftest` 통과 → 수집 대기열 푸시.
6. KOSIS 가 아닌 새 원천이면 `docs/DATA_SOURCES.md` 와 프로젝트 문서
   「자료-API-연결-로드맵」의 우선순위를 본다.

### ⚠️ kosis.kr 은 **문이 닫히는 때가 있다** (2026-08-12 원인 확정)

GitHub 러너에서 kosis.kr:443 으로 **TCP 연결 자체가 안 잡히는 창**이 수 분씩 생긴다
(`ConnectTimeoutError · UND_ERR_CONNECT_TIMEOUT`). HTTP 오류가 아니라 연결 실패다.

- **초 단위 재시도로는 못 넘는다.** `fetchText` 의 1·2·4초 백오프는 나쁜 창 하나를 통째로 못 넘긴다.
  같은 실행에서 90초씩 쉬며 3회 재시도하는 표 검증은 성공하고, 검색만 실패한 일이 실제로 있었다.
- **닫힌 창에 후보를 태우지 않는다.** 태우면 전부 같은 이유로 실패하고, 그 기록이 다음 사람에게
  **"주소가 틀렸다"로 읽힌다** — 이번에 정확히 그렇게 오독했다.
- **원인을 반드시 남긴다.** Node 의 fetch 는 연결 끊김·TLS 오류·호스트 못 찾음을 전부
  `fetch failed` 한 줄로만 말한다. `http.ts` 가 `err.cause` 까지 적게 고쳐 두었다 —
  이 한 줄이 "망이 죽었나 / 주소가 틀렸나"를 가른다.
- **판정을 결과 파일 맨 위에 문장으로 적는다.** `data/kosis-search.md` 의 「연결 확인」 절이
  ✅(살아 있다 → 주소 문제) / ❌(거부 중 → 다시 돌린다) 를 대신 말해 준다.

### KOSIS 붙일 때 밟았던 함정 (되풀이 금지)

- **행정구역이 C1 이 아닐 수 있다.** 사망표는 C1=사망원인, C2=행정구역. 모르고 C1 을 지역으로 읽으면
  `11=호흡기 결핵` 이 지역 코드가 되고 지도는 예쁘게 칠해진다 — **응답은 정상이라 아무도 모른다.**
- **코드 체계가 표마다 다르다.** 인구표(kostat)와 출생·사망표(vital)는 시도부터 겹친다
  (26=울산/부산, 29=세종/광주, 31=경기/울산, 36=전남/세종). 반드시 `data/geo/kosis-region-map.json` 대조표를 거친다.
- **시도 이름도 표마다 다르다.** '강원도' vs '강원특별자치도' — 이름으로 맞추면 그 도가 통째로 빠지고
  **빈 지도는 오류로 안 보인다.**
- **한 요청 4만 셀 한도.** 1세별·사망원인 같은 축이 있으면 지역을 끊어 부른다(`cellsPerRegionPeriod`).
- **파서가 ITM_ID 축을 안 가른다.** `itmId` 는 단일 코드만 — `ALL`·`+` 를 쓰면 한 지역에 값이 여러 개 겹쳐
  시계열이 조용히 망가진다(셀프테스트가 막는다).

## 5. 아직 안 연결된 것 — 우선순위

프로젝트 문서 「자료-API-연결-로드맵-2026-08-11」이 정본이다. 요약:

- **P0**: 서울 지하철 승하차(배관 재사용·소재 4개 해금) · 국토부 미분양 · 소상공인 상가정보 · 국민연금 사업장
- **P1**: K-apt 관리비 · 공동주택 공시가격 · 법원 등기/경매 · 세움터 인허가
- **P2**: 국세통계 · SGIS · 학교알리미 · 관세청 · 한전 · 기상청 · 지방재정365

---

## 부록 — 이 문서를 만들며 바로잡은 것 (2026-08-12 실측)

문서와 실제가 어긋나 있던 지점들. 각 원천 문서도 함께 고쳤다.

1. `DATA_SOURCES.md` 의 KOSIS 표 상태표가 오래됐다 — 문서는 5개 표를 "검증 대기·발행 금지"로
   적었지만 실제로는 **여섯 표 전부 `enabled: true` · `confidence: "확실"`**(2026-08-04부터).
2. 서울 생활인구 서비스명 3종은 이미 코드에 확정 기재돼 있다(`SPOP_FORN_TEMP_RESD_DONG` 등).
   다만 **정기 수집 워크플로가 없고 3종 다 `enabled:false`** — probe 배관까지만 살아 있다.
   `data/datasets/seoul-foreign-2025.json` 은 API 산출물이 아니라 **오너가 올린 출입국 통계연보 엑셀**이다.
3. `DATA_REFRESH.md` §7 "수집 워크플로는 셀프테스트를 **먼저** 돌린다"는 지금 사실이 아니다 —
   `population-collect` · `applyhome-collect` 는 **수집 뒤에** 돌린다(2026-07-31 증시 수집이 셀프테스트
   실패로 며칠 죽은 뒤 "검사는 하되 수집을 막지 않게" 바꿨다).
4. `DATA_REFRESH.md` §5 대기열 표가 4종뿐이었다 — 실측 전수는 위 §3.
5. `check-secrets.mjs` 안내문: `KAKAO_REST_KEY` 는 "아직 아무도 안 읽는다"로 적혀 있지만
   `geocode-sites.mjs` 가 읽고 2026-07-31 실행 기록이 있다. `DATA_GO_KR_API_KEY` 도
   "예약분"이 아니라 **청약홈이 매일 쓴다.** `TOWER_URL` 이 '미사용'으로 보이는 건 이름 필터
   정규식이 `_URL` 을 안 잡는 오탐이다.
6. `data/datasets/catalog.json` 은 데이터셋 전수가 아니다(실파일 40여 개 중 10개만 등재).
   `verified` 로 발행 게이트를 거는 구조인데 **자동 수집 산출물 다수가 그 게이트 밖**이다.
