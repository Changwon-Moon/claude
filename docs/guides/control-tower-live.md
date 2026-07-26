# 관제탑을 "진짜 동작하는 도구"로 — 라이브 모드 설정

지금까지 관제탑은 **읽기 전용**이었습니다(버튼을 눌러도 "지시 전달함 → 요약 복사 → Claude" 우회). 라이브 모드를 켜면 관제탑이 **GitHub를 직접 조작**해서, 복사-붙여넣기 없이 실제로 동작합니다.

## 무엇이 되나 (라이브 모드)

| 관제탑에서 | 실제로 일어나는 일 |
|---|---|
| **⛏ 마이닝** 버튼 | 소재 수집 워크플로가 **바로 실행** |
| **🖼 로고 취득 / 💰 평균연봉** 버튼 | 해당 워크플로 바로 실행 |
| **자료 인박스**에 붙여넣기 → 지식 추가 | 저장소 `research/INBOX.md`에 **바로 커밋**(대량 OK) |
| 소재 **✅ 선정 / ❌ 탈락** | `research/decisions-inbox.md`에 **바로 기록**(트렌드분석·리서치 학습) |
| 💡 소재 탭 승인·수정·추가 | `research/ideas.json`을 **직접 갱신**(2026-07-26 추가) |
| **↻ 상태** | 워크플로 실행 현황 실시간 표시 |

## 왜 두 가지가 필요한가

1. **GitHub Pages에서 열어야 합니다.** claude.ai 아티팩트는 보안상 외부 통신을 전부 막아서(그래서 복사 버튼도 거기선 안 먹혔던 것) API 호출이 불가능합니다. Pages는 됩니다.
2. **GitHub 토큰**이 필요합니다. 관제탑이 오너 대신 GitHub에 명령하려면 열쇠가 있어야 해요. 토큰은 **이 브라우저에만 저장**되고 GitHub 외 어디로도 안 나갑니다.

## 설정 (1회, 약 5분)

### ① 관제탑 주소 (이미 완료 · 2026-07-26)
`https://wirit-tower.engineerest0.workers.dev/` — Cloudflare Workers에 상시 배포되고, 비밀번호 문이 걸려 있습니다.
설정 경위는 [control-tower-hosting.md](./control-tower-hosting.md).

### ② 저장소 전용 토큰 만들기
1. **github.com/settings/tokens?type=beta** 접속 (또는 Settings → Developer settings → **Fine-grained tokens**)
2. **Generate new token** 클릭
3. **Repository access** → **Only select repositories** → `Changwon-Moon/claude` 선택
4. **Permissions → Repository permissions** 에서 두 개만 권한 부여:
   - **Contents**: Read and write
   - **Actions**: Read and write
5. **Generate token** → 만들어진 토큰(`github_pat_...`) **복사**
   - ⚠️ 딱 한 번만 보여줍니다. 놓치면 새로 만들면 돼요.

### ③ 관제탑에 붙여넣기
1. `https://wirit-tower.engineerest0.workers.dev/` 를 엽니다(비밀번호 입력)
2. 상단 **🔌 GitHub 연결 안 됨 → [연결하기]** 클릭
3. 토큰 붙여넣고 **저장·연결** → "연결 성공"이 뜨면 끝

이제 상단 바가 🟢로 바뀌고 **모든 조작이 저장소에 바로 기록**됩니다.

| 관제탑에서 누르면 | 저장소에 이렇게 남습니다 |
|---|---|
| 💡 소재 탭에서 승인·보류·거부·수정·삭제·추가 | `research/ideas.json` 이 바로 갱신 |
| 소재 발굴 요청 / 티켓 승인·보류·반려·수정지시 / 회사 원칙 편집 | `research/decisions-inbox.md` 에 추가 |
| 자료 인박스에 붙여넣기 | `research/INBOX.md` 에 추가 |
| ⛏ 마이닝 실행 | 수집 워크플로가 바로 실행 |

화면 맨 아래 **저장 상태 바**에 `✔ 저장됨 · 시각`이 뜨면 기록된 것입니다.

> **연결 안 하면 읽기 전용입니다.** 버튼을 눌러도 아무것도 바뀌지 않습니다.
> (예전처럼 눌러놓고 요약을 복사하는 방식은 없앴습니다 — 새로고침하면 사라져서 위험했습니다.)

## 아직 안 되는 것 (정직하게)

- **인스타 자동 발행**: IG 토큰(M0 🔵 묶음)이 있어야 합니다. 그 전까지 "발행"은 렌더까지만.
- **AI 수준의 마이닝·카드 기획**: 버튼이 돌리는 마이닝은 자동 RSS 수집이라, 제가 세션에서 하는 웹 리서치보다 가볍습니다. 세션 수준의 리서치·기획을 버튼으로 돌리려면 **AI 직원(M6~, Anthropic 키)**이 필요합니다. 그 전까지 깊은 마이닝은 저에게 요청하는 게 더 좋습니다.

## 보안

- 토큰은 **이 저장소에만** 권한이 있고(다른 repo 접근 불가), **브라우저 localStorage에만** 저장됩니다.
- 공용 PC에서 쓰면 [연결 해제]로 지우세요. 유출 의심 시 github.com/settings/tokens에서 즉시 **Revoke**.
- 값을 Claude·메신저 등에 붙여넣지 마세요(관제탑 입력창 외).
