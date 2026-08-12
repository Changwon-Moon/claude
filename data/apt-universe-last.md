# 1000세대 이상 단지 명부 — 마지막 실행

- 실행: 2026-08-12 (KST) · 방아쇠 `push`
- 예산: 200회 · 최소 세대수 1000
- 결과: **성공**
- 커밋: `bbdafa720b13d1a4ff3ce2a69480a7ae0c2da8bf`

```

> @wirit/collectors@0.1.0 collect-apt-universe /home/runner/work/claude/claude/packages/collectors
> tsx src/aptUniverseCli.ts -- --min-hhld 1000 --budget 200

호출 0회 · 목록 0/61개 지역 · 세대수 확인 0/0곳
→ 1,000세대 이상 **0개 단지** · ⏳ 이어서 진행 필요

실패 61건 (다음 실행에서 다시 시도):
  · 목록 종로구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 중구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 용산구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 성동구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 광진구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 동대문구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 중랑구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 성북구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 강북구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 도봉구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 노원구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 은평구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 서대문구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 마포구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
  · 목록 양천구: 망 오류: UND_ERR_CONNECT_TIMEOUT · Connect Timeout Error (attempted address: apis.data.go.kr:443, timeout: 10000ms) · fetch failed
```
