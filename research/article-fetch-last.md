# 기사 읽어오기 — 마지막 실행 결과

- 실행: 2026-07-31 02:48 UTC
- 결과: **failure**
- 요청한 URL: https://n.news.naver.com/mnews/article/003/0014099900 
- 실행 기록: https://github.com/Changwon-Moon/claude/actions/runs/30599891177

> 워크플로가 매번 덮어씁니다. 작업 세션이 결과를 확인하는 통로입니다.

## 로그

```
::warning::못 읽음 — https://n.news.naver.com/mnews/article/003/0014099900 (본문 0자 · HTTP 200 · HTML 336820자 · 제목 "" · 최종URL https://n.news.naver.com/mnews/article/003/0014099900)

0/1건 저장
보관된 기사 총 2건

한 건도 못 읽었습니다. 위 진단(HTTP·HTML 길이·제목)을 보고 원인을 가리세요:
  · HTML 이 짧다 → 봇 차단 화면일 가능성. 그 사이트는 이 통로로 못 읽는다
  · HTML 은 긴데 본문 0자 → 본문 선택자를 추가해야 한다(EXTRACT)
  어느 쪽이든 우회를 억지로 시도하지 않는다 — 오너에게 본문을 받는 편이 빠르고 정직하다.
```
