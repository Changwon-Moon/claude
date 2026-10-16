# 단지 공급면적 — 마지막 실행

- 성공 1건 · 실패 29건 · 미룸 110줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 22/250건 · 내일로 미룬 0줄 (상한은 실패가 아니다)

```
── A13971502 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2

▶ 상계주공3단지 (A13971502) · 전용 84.2㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 382개
::error::전용 84.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 730-2) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2`
Exit status 1
── A13971502 전용 84.2

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2

▶ 상계주공3단지 (A13971502) · 전용 84.2㎡ · 11350-10500 · 지번 후보 730-2
   지번 730-2 (0730-0002) · 대지 → 줄 382개
::error::전용 84.2㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 730-2) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13971502 --area 84.2`
Exit status 1
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 643, 271-1
   지번 643 (0643-0000) · 대지 → 줄 29개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 643) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A13204105 전용 84.41

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 84.41

▶ 창동주공3단지 (A13204105) · 전용 84.41㎡ · 11320-10700 · 지번 후보 347
   지번 347 (0347-0000) · 대지 → 줄 3000개
::error::전용 84.41㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 347) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13204105 --area 84.41`
Exit status 1
── A13290107 전용 60.5

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 60.5

▶ 창동주공19단지 (A13290107) · 전용 60.5㎡ · 11320-10700 · 지번 후보 663-1, 685-222, 27
   지번 663-1 (0663-0001) · 대지 → 줄 0개
   지번 685-222 (0685-0222) · 대지 → 줄 0개
   지번 27 (0027-0000) · 대지 → 줄 2342개
::error::전용 60.5㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 27) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13290107 --area 60.5`
Exit status 1
── A10020950 전용 59.94

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10020950 --area 59.94

▶ 안양역푸르지오더샵 (A10020950) · 전용 59.94㎡ · 41171-10100 · 지번 후보 1459, 97-3
   지번 1459 (1459-0000) · 대지 → 줄 0개
   지번 97-3 (0097-0003) · 대지 → 줄 0개
::error::지번 후보 1459, 97-3 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10020950 --area 59.94`
Exit status 1
── A13984814 전용 84.815

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 84.815

▶ 월계주공2단지 (A13984814) · 전용 84.815㎡ · 11350-10200 · 지번 후보 556
   지번 556 (0556-0000) · 대지 → 줄 3000개
::error::전용 84.815㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 556) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13984814 --area 84.815`
Exit status 1
── A10023204 전용 59.6816

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023204 --area 59.6816

▶ 서광교 파크 스위첸 (A10023204) · 전용 59.6816㎡ · 41111-13700 · 지번 후보 300, 244
   지번 300 (0300-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023204-59.json
   전유 59.682 + 주거공용 22.16 = 공급 81.84㎡ = 24.76평 → **25평**
   표본: 106동 2404 (같은 전용 호 136개) · 전용률 72.9%
     · 아파트 / 계단실 [지상 각층] 13.2795
     · 아파트 / 벽체 [지상 24층] 6.7765
     · 부대시설 / 계단실,ELEV.홀,외부계단 [각층 지3~지1] 2.1045
── A10027830 전용 84.51

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027830 --area 84.51

▶ 동탄역시범한화꿈에그린프레스티지아파트 (A10027830) · 전용 84.51㎡ · 41597-10500 · 지번 후보 510-88
   지번 510-88 (0510-0088) · 대지 → 줄 0개
::error::지번 후보 510-88 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027830 --area 84.51`
Exit status 1
── A10028055 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028055 --area 84.98

▶ 동탄역 시범우남퍼스트빌 (A10028055) · 전용 84.98㎡ · 41597-10500 · 지번 후보 35
   지번 35 (0035-0000) · 대지 → 줄 0개
::error::지번 후보 35 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10028055 --area 84.98`
Exit status 1
── A10028055 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10028055 --area 59.98

▶ 동탄역 시범우남퍼스트빌 (A10028055) · 전용 59.98㎡ · 41597-10500 · 지번 후보 35
   지번 35 (0035-0000) · 대지 → 줄 0개
::error::지번 후보 35 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10028055 --area 59.98`
Exit status 1
── A10024763 전용 84.9402

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024763 --area 84.9402

▶ 한강메트로자이2단지 아파트 (A10024763) · 전용 84.9402㎡ · 41570-10200 · 지번 후보 180
   지번 180 (0180-0000) · 대지 → 줄 0개
::error::지번 후보 180 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024763 --area 84.9402`
Exit status 1
── A10024763 전용 59.9496

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024763 --area 59.9496

▶ 한강메트로자이2단지 아파트 (A10024763) · 전용 59.9496㎡ · 41570-10200 · 지번 후보 180
   지번 180 (0180-0000) · 대지 → 줄 0개
::error::지번 후보 180 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024763 --area 59.9496`
Exit status 1
── A10026165 전용 84.9706

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026165 --area 84.9706

▶ 풍무센트럴푸르지오 (A10026165) · 전용 84.9706㎡ · 41570-10700 · 지번 후보 289
   지번 289 (0289-0000) · 대지 → 줄 0개
::error::지번 후보 289 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026165 --area 84.9706`
Exit status 1
── A10026165 전용 59.9669

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10026165 --area 59.9669

▶ 풍무센트럴푸르지오 (A10026165) · 전용 59.9669㎡ · 41570-10700 · 지번 후보 289
   지번 289 (0289-0000) · 대지 → 줄 0개
::error::지번 후보 289 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10026165 --area 59.9669`
Exit status 1
── A10027199 전용 84.9699

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027199 --area 84.9699

▶ 한강센트럴자이1단지 (A10027199) · 전용 84.9699㎡ · 41570-10400 · 지번 후보 2128-1
   지번 2128-1 (2128-0001) · 대지 → 줄 0개
::error::지번 후보 2128-1 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027199 --area 84.9699`
Exit status 1
── A10025933 전용 84.981

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025933 --area 84.981

▶ 기흥역 더샵 아파트 (A10025933) · 전용 84.981㎡ · 41463-10200 · 지번 후보 234-5
   지번 234-5 (0234-0005) · 대지 → 줄 0개
::error::지번 후보 234-5 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025933 --area 84.981`
Exit status 1
── A10022829 전용 84.9156

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022829 --area 84.9156

▶ 힐스테이트 용인 둔전역 아파트 (A10022829) · 전용 84.9156㎡ · 41461-10600 · 지번 후보 503-38
   지번 503-38 (0503-0038) · 대지 → 줄 0개
::error::지번 후보 503-38 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022829 --area 84.9156`
Exit status 1
── A10022829 전용 59.8007

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10022829 --area 59.8007

▶ 힐스테이트 용인 둔전역 아파트 (A10022829) · 전용 59.8007㎡ · 41461-10600 · 지번 후보 503-38
   지번 503-38 (0503-0038) · 대지 → 줄 0개
::error::지번 후보 503-38 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10022829 --area 59.8007`
Exit status 1
── A10025188 전용 84.9858

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025188 --area 84.9858

▶ 인덕원푸르지오 엘센트로아파트 (A10025188) · 전용 84.9858㎡ · 41430-10900 · 지번 후보 487-22
   지번 487-22 (0487-0022) · 대지 → 줄 0개
::error::지번 후보 487-22 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025188 --area 84.9858`
Exit status 1
── A10025761 전용 84.9973

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025761 --area 84.9973

▶ 의왕역 푸르지오 라포레 (A10025761) · 전용 84.9973㎡ · 41430-10300 · 지번 후보 38
   지번 38 (0038-0000) · 대지 → 줄 0개
::error::지번 후보 38 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025761 --area 84.9973`
Exit status 1
── A10024845 전용 84.941

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024845 --area 84.941

▶ 시흥센트럴푸르지오아파트 (A10024845) · 전용 84.941㎡ · 41390-10100 · 지번 후보 418-21
   지번 418-21 (0418-0021) · 대지 → 줄 0개
::error::지번 후보 418-21 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024845 --area 84.941`
Exit status 1
── A10024845 전용 59.948

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024845 --area 59.948

▶ 시흥센트럴푸르지오아파트 (A10024845) · 전용 59.948㎡ · 41390-10100 · 지번 후보 418-21
   지번 418-21 (0418-0021) · 대지 → 줄 0개
::error::지번 후보 418-21 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024845 --area 59.948`
Exit status 1
── A10025841 전용 84.6698

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025841 --area 84.6698

▶ 시흥은계한양수자인더클래스아파트 (A10025841) · 전용 84.6698㎡ · 41390-10600 · 지번 후보 217-14
   지번 217-14 (0217-0014) · 대지 → 줄 0개
::error::지번 후보 217-14 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025841 --area 84.6698`
Exit status 1
── A42984208 전용 59.965

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A42984208 --area 59.965

▶ 숲속마을벽산신화 (A42984208) · 전용 59.965㎡ · 41390-13000 · 지번 후보 271-3, 807
   지번 271-3 (0271-0003) · 대지 → 줄 0개
::error::807 20쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42984208 --area 59.965`
Exit status 1
── A10025195 전용 84.8602

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025195 --area 84.8602

▶ 오산시티자이2차아파트 (A10025195) · 전용 84.8602㎡ · 41370-10200 · 지번 후보 694
::error::694 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025195 --area 84.8602`
Exit status 1
── A10025195 전용 59.9895

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025195 --area 59.9895

▶ 오산시티자이2차아파트 (A10025195) · 전용 59.9895㎡ · 41370-10200 · 지번 후보 694
::error::694 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025195 --area 59.9895`
Exit status 1
── A10024648 전용 59.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024648 --area 59.85

▶ 평내호평역 대명루첸포레스티움아파트 (A10024648) · 전용 59.85㎡ · 41360-10200 · 지번 후보 191
::error::191 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024648 --area 59.85`
Exit status 1
── A10024648 전용 84.81

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024648 --area 84.81

▶ 평내호평역 대명루첸포레스티움아파트 (A10024648) · 전용 84.81㎡ · 41360-10200 · 지번 후보 191
::error::191 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024648 --area 84.81`
Exit status 1
── A10027754 전용 84.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10027754 --area 84.99

▶ 힐스테이트황금산아파트 (A10027754) · 전용 84.99㎡ · 41360-11200 · 지번 후보 3129-65
::error::3129-65 1쪽 실패 — fetch failed: fetch failed
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10027754 --area 84.99`
Exit status 1
⛔ 연결이 6번 연달아 안 열렸습니다 — 문이 닫혔습니다. 남은 줄은 새 러너에 넘깁니다.
⏳ 문이 닫혀 접었습니다 — 남은 110줄은 다음 칸으로 미룹니다
```
