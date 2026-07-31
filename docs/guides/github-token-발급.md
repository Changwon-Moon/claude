# GitHub 토큰(PAT) 발급 — 오너용 단계별 안내

## 왜 필요한가

작업물은 이 컨테이너(임시 작업실)에 커밋까지는 되지만, **GitHub에 밀어넣기(push)까지 해야 영구 보관**된다.
세션이 끝나면 작업실은 통째로 사라지므로, 푸시하지 않은 커밋은 함께 없어진다.

푸시하려면 GitHub에 "나 맞다"고 증명해야 하는데, 그 증명서가 **PAT(Personal Access Token)** 이다.
비밀번호 대신 쓰는 긴 문자열이라고 보면 된다.

> 이 토큰은 세션마다 다시 필요하다. 보안 규칙상 clone 직후 저장소 주소에서 토큰을 지우고,
> 대화가 길어지면 앞부분이 정리되며 토큰도 함께 사라지기 때문이다. 불편하지만 이게 안전한 쪽이다.

## 발급 절차 (5분)

### 1. 발급 페이지 열기

https://github.com/settings/tokens?type=beta

(GitHub 로그인 → 우상단 프로필 → Settings → Developer settings → Personal access tokens → Fine-grained tokens)

### 2. Generate new token 누르기

### 3. 항목 채우기

| 칸 | 넣을 값 |
|---|---|
| **Token name** | `wirit-cowork` (아무 이름이나 무방 — 나중에 알아보려는 용도) |
| **Expiration** | `30 days` 권장. 길게 잡을수록 편하지만 유출 시 위험 기간도 길어진다 |
| **Repository access** | **Only select repositories** → `Changwon-Moon/claude` 하나만 고른다 |

> ⚠️ `All repositories` 는 고르지 않는다. 이 토큰이 새면 계정의 모든 저장소가 열린다.

### 4. Permissions → Repository permissions 에서 권한 주기

아래 **두 개만** 켠다. 나머지는 전부 `No access` 로 둔다.

| 권한 | 설정값 | 왜 |
|---|---|---|
| **Contents** | `Read and write` | 커밋을 푸시하려면 필요 |
| **Metadata** | `Read-only` | Contents 를 켜면 자동으로 켜진다 |

> 💡 `Workflows` 권한은 켜지 않아도 된다. `.github/workflows/*.yml` 파일 자체를
> 수정할 때만 필요한데, 지금 작업은 그게 아니다. (지난번 이 권한이 없어 푸시가 한 번 막혔는데,
> 대기열 파일로 우회했다.)

### 5. 맨 아래 Generate token → 나온 문자열 복사

`github_pat_` 로 시작하는 긴 문자열이다.
**이 화면을 벗어나면 다시 볼 수 없다.** 창을 닫기 전에 복사한다.

### 6. 채팅에 붙여넣기

붙여넣으면 바로 푸시하고, 끝나는 즉시 저장소 주소에서 지운다.
로그에도 값이 남지 않도록 마스킹(`***`)한다.

## 쓰고 난 뒤

작업이 끝났으면 https://github.com/settings/tokens?type=beta 에서 해당 토큰의 `Delete` 를 눌러
없애도 된다. 다음 세션에 다시 발급하면 된다. 만료일을 짧게 잡았다면 그냥 두어도 자동으로 죽는다.

## 절대 하지 말 것

- 토큰을 저장소 파일에 적어 커밋하지 않는다 (`CLAUDE.md` 절대 규칙).
  키·토큰은 GitHub Secrets 또는 `.env`(gitignore) 에만 둔다.
- 토큰 값을 로그·이슈·커밋 메시지에 남기지 않는다. 진단이 필요하면 **이름과 길이만** 출력한다.
