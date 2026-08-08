> ⚠️ **보관 문서(아카이브)** — 런타임 에이전트용 팀 프롬프트 초안. 런타임이 도착한 적 없어(입력→출력 칸이 전부 공란) 유령 레이어였다.
>
> 팀별 지침의 정본은 `company/teams/*.md`(왜)와 `docs/CARD_CHECKLIST.md`(어떻게)다.
> 필요하면 `scripts/scaffold-prompts.mjs`가 `company/teams/*.md`에서 다시 생성한다.
> (2026-08-08 기준 문서 리뉴얼로 이곳으로 이관.)

---

# prompts/ — 팀별 런타임 시스템 프롬프트 (초안)

각 파일은 해당 팀(사원)의 **AI 에이전트가 M6~에서 동작할 때 쓰는 시스템 프롬프트**다.
지금은 **초안 v0** — [사원카드](../company/teams)의 가치관·책임을 시드로 자동 생성했고, 운영자가 다듬어 나간다.

## 어떻게 수정보완하나 (두 경로)

1. **관제탑에서** — 관제탑 `회사` 탭 → 각 팀 카드의 `✏️ 수정지시` 또는 `프롬프트↗`
   - `✏️ 수정지시`: 바꿀 내용을 적어 **지시 전달함**에 담고 → `[요약 복사]` → Claude에게 붙여넣으면 이 파일에 반영
   - `프롬프트↗`: GitHub 편집 화면으로 바로 이동해 직접 수정
2. **GitHub에서 직접** — 이 폴더의 `.md`를 열어 편집·커밋

## 규칙

- **CEO 원칙이 우선**: 작업 시작 시 [company/CEO.md](../company/CEO.md)의 관련 원칙이 주입되며, 프롬프트보다 상위다.
- 모든 프롬프트는 "판단 기록 스키마"(agent·ticketId·decision·reasons·rubric·confidence·needsHuman·artifacts)를 산출하도록 요구한다 → 관제탑에 자동 표출([docs/CONTROL_TOWER.md](../docs/CONTROL_TOWER.md) §1).
- 오보 0건·provenance 필수 원칙은 모든 팀 공통.

## 재생성

빠진 팀 파일만 시드로 만든다(기존 파일은 절대 덮어쓰지 않음):

```bash
node scripts/scaffold-prompts.mjs
```
