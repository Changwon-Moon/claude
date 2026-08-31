# 단지 공급면적 — 마지막 실행

- 성공 9건 · 실패 9건
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다

```
── A10028021 전용 84.48

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48

▶ 서초포레스타2단지아파트 (A10028021) · 전용 84.48㎡ · 11650-10900 · 지번 후보 384, 143
::error::384 10쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10028021 --area 84.48`
Exit status 1
── A10026600 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026600 --area 84.99

▶ 다산 롯데캐슬아파트 (A10026600) · 전용 84.99㎡ · 41360-11200 · 지번 후보 6029, 5869-2
   지번 6029 (6029-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026600-84.json
   전유 84.99 + 주거공용 29.086 = 공급 114.08㎡ = 34.51평 → **35평**
   표본: 2206동 1403 (같은 전용 호 237개) · 전용률 74.5%
     · 아파트 / 코아 [지상 각층] 21.6163
     · 아파트 / 외벽 [지상 14층] 6.14
     · 부대시설 / 지하코아 [지하 지1] 1.3295
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) · 대지 → 줄 600개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
::error::248 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 271-1
   지번 271-1 (0271-0001) · 대지 → 줄 1814개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 271-1) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A10027514 전용 84.9852

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027514 --area 84.9852

▶ 미사강변푸르지오 (A10027514) · 전용 84.9852㎡ · 41450-10900 · 지번 후보 1060
::error::1060 6쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027514 --area 84.9852`
Exit status 1
── A15288814 전용 59.9

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15288814 --area 59.9

▶ 신도림대림1,2차 (A15288814) · 전용 59.9㎡ · 11530-10100 · 지번 후보 642
   지번 642 (0642-0000) · 대지 → 줄 0개
::error::지번 후보 642 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A15288814 --area 59.9`
Exit status 1
── A15105302 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15105302 --area 84.2

▶ 관악푸르지오아파트 (A15105302) · 전용 84.2㎡ · 11620-10100 · 지번 후보 1102, 1717
   지번 1102 (1102-0000) · 대지 → 줄 0개
   지번 1717 (1717-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15105302-84.json
   전유 84.2 + 주거공용 28.73 = 공급 112.93㎡ = 34.16평 → **34평**
   표본: 121동 403 (같은 전용 호 198개) · 전용률 74.6%
     · 아파트 / 계단실 [각층 각층] 21.78
     · 아파트 / 지하대피소 [각층 지3~지1층] 6.95
── A10026065 전용 84.949

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026065 --area 84.949

▶ 동천자이아파트 (A10026065) · 전용 84.949㎡ · 41465-10300 · 지번 후보 가-
   지번 가- (0000-0000) · 대지 → 줄 0개
   지번 가- (0000-0000) · 블록 → 줄 1200개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10026065-84.json
   전유 84.949 + 주거공용 29.369 = 공급 114.32㎡ = 34.58평 → **35평**
   표본: 102동 202 (같은 전용 호 77개) · 전용률 74.3%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 21.8861
     · 아파트 / 벽체 [지상 2층] 7.4832
── A44656712 전용 84.7616

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44656712 --area 84.7616

▶ 죽현마을아이파크1차 (A44656712) · 전용 84.7616㎡ · 41463-11800 · 지번 후보 1267
::error::1267 2쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A44656712 --area 84.7616`
Exit status 1
── A10027782 전용 59.84

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027782 --area 59.84

▶ 미사강변 루나리움 (A10027782) · 전용 59.84㎡ · 41450-10900 · 지번 후보 1034
   지번 1034 (1034-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027782-59.json
   전유 59.84 + 주거공용 20.887 = 공급 80.73㎡ = 24.42평 → **24평**
   표본: 502동 1905 (같은 전용 호 112개) · 전용률 74.1%
     · 아파트 / 계단실,승강기,홀 등 [각층 각층] 19.4295
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 1.4579
── A10023989 전용 84.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023989 --area 84.96

▶ 수원하늘채더퍼스트2단지 (A10023989) · 전용 84.96㎡ · 41113-13600 · 지번 후보 654
   지번 654 (0654-0000) · 대지 → 줄 1300개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023989-84.json
   전유 84.96 + 주거공용 28.566 = 공급 113.53㎡ = 34.34평 → **34평**
   표본: 207동 1405 (같은 전용 호 36개) · 전용률 74.8%
     · 아파트 / 계단실,승강기,홀 [지상 각층] 18.8228
     · 아파트 / 벽체 [지상 14층] 6.69
     · 아파트 / 지하주차장연결통로 [각층 지2-지1] 3.0536
── A10024349 전용 59.89

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024349 --area 59.89

▶ 병점역아이파크캐슬 (A10024349) · 전용 59.89㎡ · 41595-10200 · 지번 후보 881
   지번 881 (0881-0000) · 대지 → 줄 0개
::error::881 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024349 --area 59.89`
Exit status 1
── A10027114 전용 58.92

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027114 --area 58.92

▶ 이편한세상 반월나노시티역 (A10027114) · 전용 58.92㎡ · 41595-10500 · 지번 후보 960
   지번 960 (0960-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10027114-59.json
   전유 58.92 + 주거공용 26.84 = 공급 85.76㎡ = 25.94평 → **26평**
   표본: 101동 302 (같은 전용 호 45개) · 전용률 68.7%
     · 아파트 / 계단실 [지상 각층] 21.27
     · 아파트 / 벽체 [지상 각층] 5.57
   ⚠️ 전용률 68.7% — 흔한 범위(70~85%) 밖이다. parts 를 보고 기타공용이 주건축물로 잡혔는지, 정말 그런 단지인지 확인할 것
── A44182326 전용 84.64

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44182326 --area 84.64

▶ 수원시청역SK뷰 (A44182326) · 전용 84.64㎡ · 41113-13700 · 지번 후보 1035
   지번 1035 (1035-0000) · 대지 → 줄 1400개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44182326-84.json
   전유 84.64 + 주거공용 26.61 = 공급 111.25㎡ = 33.65평 → **34평**
   표본: 214동 604 (같은 전용 호 73개) · 전용률 76.1%
     · 아파트 / EV홀,계단,초과발코니,세대벽체 [지상 각층] 26.61
── A10023989 전용 59.96

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023989 --area 59.96

▶ 수원하늘채더퍼스트2단지 (A10023989) · 전용 59.96㎡ · 41113-13600 · 지번 후보 654
::error::654 1쪽 실패 — {
  "OpenAPI_ServiceResponse": {
    "cmmMsgHeader": {
      "errMsg": "SERVICETIMEOUT_ERROR",
      "returnAuthMsg": "서
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023989 --area 59.96`
Exit status 1
── A44347026 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44347026 --area 59.99

▶ 영통포레파크원 (A44347026) · 전용 59.99㎡ · 41117-10500 · 지번 후보 955-1
   지번 955-1 (0955-0001) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44347026-59.json
   전유 59.99 + 주거공용 22.67 = 공급 82.66㎡ = 25평 → **25평**
   표본: 123동 1503호 (같은 전용 호 293개) · 전용률 72.6%
     · 아파트 / 복도,계단,승강기등 [각층 각층] 16.3112
     · 아파트 / 대피소 [지하 지1] 4.5601
     · 아파트 / 대피소(법상부족분) [지하 지1] 1.7983
── A44340013 전용 59.884

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A44340013 --area 59.884

▶ 망포늘푸른벽산 (A44340013) · 전용 59.884㎡ · 41117-10700 · 지번 후보 488, 271-3
   지번 488 (0488-0000) · 대지 → 줄 2900개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A44340013-59.json
   전유 59.884 + 주거공용 21.07 = 공급 80.95㎡ = 24.49평 → **24평**
   표본: 108동 1003호 (같은 전용 호 90개) · 전용률 74.0%
     · 아파트 / 계단,승강기 [각층 각층] 15.116
     · 아파트 / 지하대피소 [지하 지층] 5.954
```
