# 단지 공급면적 — 마지막 실행

- 성공 3건 · 실패 29건 · 미룸 0줄
- 결과는 Actions 로그가 아니라 이 파일과 data/datasets/apt-supply/ 에서 본다
- 미리 채우기 오늘 몫 250/250건 · 내일로 미룬 316줄 (상한은 실패가 아니다)

```
── A12204004 전용 59.99

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12204004 --area 59.99

▶ 북한산힐스테이트3차아파트 (A12204004) · 전용 59.99㎡ · 11380-10300 · 지번 후보 641
   지번 641 (0641-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A12204004-59.json
   전유 59.99 + 주거공용 19.41 = 공급 79.4㎡ = 24.02평 → **24평**
   표본: 3205동 1304 (같은 전용 호 144개) · 전용률 75.5%
     · 아파트 / 계단,승강기 [각층 각층] 14.08
     · 아파트 / 벽체 [각층 각층] 5.33
── A10023991 전용 59.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023991 --area 59.98

▶ 태릉해링턴플레이스 (A10023991) · 전용 59.98㎡ · 11350-10300 · 지번 후보 758
   지번 758 (0758-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A10023991-59.json
   전유 59.98 + 주거공용 20.961 = 공급 80.94㎡ = 24.48평 → **24평**
   표본: 106동 1805 (같은 전용 호 71개) · 전용률 74.1%
     · 아파트 / 계단실 [지상 각층] 15.7311
     · 아파트 / 벽체 [지상 18층] 5.23
── A15728008 전용 84.68

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A15728008 --area 84.68

▶ 마곡수명산파크1단지 (A15728008) · 전용 84.68㎡ · 11500-10600 · 지번 후보 742
   지번 742 (0742-0000) · 대지 → 줄 3000개
✅ /home/runner/work/claude/claude/data/datasets/apt-supply/A15728008-84.json
   전유 84.68 + 주거공용 24.359 = 공급 109.04㎡ = 32.98평 → **33평**
   표본: 101동 604호 (같은 전용 호 134개) · 전용률 77.7%
     · 아파트 / 계단실,승강기 [각층 각층] 22.97
     · 부대시설 / 관리사무소,문고,보육시설,경로당,주민공동시설 [지상 1층] 0.709
     · 아파트 / 지하계단실 [지하 지1층] 0.662
     · 부대시설 / 경비실 [지상 1층] 0.018
── A13202312 전용 84.87

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87

▶ 방학신동아1단지 (A13202312) · 전용 84.87㎡ · 11320-10600 · 지번 후보 643, 271-1
   지번 643 (0643-0000) · 대지 → 줄 29개
::error::전용 84.87㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 643) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A13202312 --area 84.87`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) · 대지 → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A12285703 전용 83.27

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27

▶ 미성아파트(불광동) (A12285703) · 전용 83.27㎡ · 11380-10300 · 지번 후보 248
   지번 248 (0248-0000) · 대지 → 줄 3000개
::error::전용 83.27㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 248) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A12285703 --area 83.27`
Exit status 1
── A10023699 전용 59.95

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023699 --area 59.95

▶ 더샵오포센트럴포레 아파트 (A10023699) · 전용 59.95㎡ · 41610-11400 · 지번 후보 656
   지번 656 (0656-0000) · 대지 → 줄 0개
::error::지번 후보 656 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023699 --area 59.95`
Exit status 1
── A10023699 전용 84.98

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10023699 --area 84.98

▶ 더샵오포센트럴포레 아파트 (A10023699) · 전용 84.98㎡ · 41610-11400 · 지번 후보 656
   지번 656 (0656-0000) · 대지 → 줄 0개
::error::지번 후보 656 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10023699 --area 84.98`
Exit status 1
── A10025510 전용 84.52

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025510 --area 84.52

▶ 호수공원역 센트럴시티 (A10025510) · 전용 84.52㎡ · 41597-11000 · 지번 후보 593
   지번 593 (0593-0000) · 대지 → 줄 0개
::error::지번 후보 593 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025510 --area 84.52`
Exit status 1
── A10025603 전용 61.9248

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025603 --area 61.9248

::error::A10025603 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025603 --area 61.9248`
Exit status 1
── A10025510 전용 60.3768

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025510 --area 60.3768

▶ 호수공원역 센트럴시티 (A10025510) · 전용 60.3768㎡ · 41597-11000 · 지번 후보 593
   지번 593 (0593-0000) · 대지 → 줄 0개
::error::지번 후보 593 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025510 --area 60.3768`
Exit status 1
── A10025603 전용 84.8479

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025603 --area 84.8479

::error::A10025603 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025603 --area 84.8479`
Exit status 1
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
   지번 807 (0807-0000) · 대지 → 줄 3000개
::error::전용 59.965㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 807) — 파일을 만들지 않습니다
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A42984208 --area 59.965`
Exit status 1
── A10025195 전용 84.8602

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025195 --area 84.8602

▶ 오산시티자이2차아파트 (A10025195) · 전용 84.8602㎡ · 41370-10200 · 지번 후보 694
   지번 694 (0694-0000) · 대지 → 줄 0개
::error::지번 후보 694 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025195 --area 84.8602`
Exit status 1
── A10025195 전용 59.9895

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10025195 --area 59.9895

▶ 오산시티자이2차아파트 (A10025195) · 전용 59.9895㎡ · 41370-10200 · 지번 후보 694
   지번 694 (0694-0000) · 대지 → 줄 0개
::error::지번 후보 694 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10025195 --area 59.9895`
Exit status 1
── A10024648 전용 59.85

> @wirit/collectors@0.1.0 collect-supply-area /home/runner/work/claude/claude/packages/collectors
> tsx src/supplyAreaCli.ts -- --kapt A10024648 --area 59.85

▶ 평내호평역 대명루첸포레스티움아파트 (A10024648) · 전용 59.85㎡ · 41360-10200 · 지번 후보 191
   지번 191 (0191-0000) · 대지 → 줄 0개
::error::지번 후보 191 × 대지구분(대지·산·블록) 전부 줄 0개입니다.
   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**
   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때
   --jibun 으로 대지 지번을 직접 주세요.
/home/runner/work/claude/claude/packages/collectors:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @wirit/collectors@0.1.0 collect-supply-area: `tsx src/supplyAreaCli.ts -- --kapt A10024648 --area 59.85`
Exit status 1
🧾 오늘 몫(250건)을 다 썼습니다 — 미리 채우기 316줄은 **내일** 이어서 받습니다.
   (실패가 아닙니다. 여기서 빨간불을 켜면 재시도 사다리가 상한을 우회합니다.)
```
