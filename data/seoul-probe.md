# 서울 열린데이터광장 서비스 검증 결과

> 시도 기준일 `20260804`, `20260801`, `20260728`, `20260721`, `20260714`, `20260704`, `20260619` (데이터 있는 첫 날짜 사용) · 서비스마다 5행만 받아 **컬럼 이름과 값**을 확인한 것이다.
> 세션은 Actions 로그를 못 보므로 이 파일이 유일한 눈이다.
> **맞다고 확인되면 `sources/seoulOpenApi.ts` 의 `enabled` 를 켠다.**

## foreignLong — 행정동별 서울생활인구(장기체류 외국인)

- 서비스명: `SPOP_FORN_LONG_RESD_DONG` · 확신도 이름확실 · 대기
- 메모: 오너가 데이터셋 페이지의 공식 샘플 URL 에서 확인해 준 서비스명이다.
- ✅ 응답 확인 (기준일 `20260728`) — **전체 10,176행** · 컬럼 6개

**컬럼 목록** — 중국/중국외 구분이 어느 이름인지, 분모로 쓸 총계가 무엇인지 여기서 고른다

```
STDR_DE_ID, TMZON_PD_SE, ADSTRD_CODE_SE, TOT_LVPOP_CO, CHINA_STAYPOP_CO, ETC_STAYPOP_CO
```

**첫 행 원본** — 행정동코드가 우리 지도와 같은 체계인지 눈으로 본다

```json
{
  "STDR_DE_ID": "20260728",
  "TMZON_PD_SE": "00",
  "ADSTRD_CODE_SE": "11110515",
  "TOT_LVPOP_CO": "233.329",
  "CHINA_STAYPOP_CO": "89.2222",
  "ETC_STAYPOP_CO": "144.107"
}
```

- 하루치를 받으려면 **11번** 나눠 불러야 한다(1,000행 제한)

## foreignShort — 행정동별 서울생활인구(단기체류 외국인)

- 서비스명: `SPOP_FORN_TEMP_RESD_DONG` · 확신도 이름확실 · 대기
- 메모: 오너가 OA-14993 데이터셋 페이지의 공식 샘플 URL 에서 확인해 준 서비스명이다(2026-08-08).
- ✅ 응답 확인 (기준일 `20260728`) — **전체 10,176행** · 컬럼 6개

**컬럼 목록** — 중국/중국외 구분이 어느 이름인지, 분모로 쓸 총계가 무엇인지 여기서 고른다

```
STDR_DE_ID, TMZON_PD_SE, ADSTRD_CODE_SE, TOT_LVPOP_CO, CHINA_STAYPOP_CO, ETC_STAYPOP_CO
```

**첫 행 원본** — 행정동코드가 우리 지도와 같은 체계인지 눈으로 본다

```json
{
  "STDR_DE_ID": "20260728",
  "TMZON_PD_SE": "00",
  "ADSTRD_CODE_SE": "11110515",
  "TOT_LVPOP_CO": "448.3182",
  "CHINA_STAYPOP_CO": "160.1194",
  "ETC_STAYPOP_CO": "288.1985"
}
```

- 하루치를 받으려면 **11번** 나눠 불러야 한다(1,000행 제한)

## local — 행정동별 서울생활인구(내국인)

- 서비스명: `SPOP_LOCAL_RESD_DONG` · 확신도 이름확실 · 대기
- 메모: 오너가 OA-14991 데이터셋 페이지의 공식 샘플 URL 에서 확인해 준 서비스명이다(2026-08-08).
- ✅ 응답 확인 (기준일 `20260728`) — **전체 10,176행** · 컬럼 32개

**컬럼 목록** — 중국/중국외 구분이 어느 이름인지, 분모로 쓸 총계가 무엇인지 여기서 고른다

```
STDR_DE_ID, TMZON_PD_SE, ADSTRD_CODE_SE, TOT_LVPOP_CO, MALE_F0T9_LVPOP_CO, MALE_F10T14_LVPOP_CO, MALE_F15T19_LVPOP_CO, MALE_F20T24_LVPOP_CO, MALE_F25T29_LVPOP_CO, MALE_F30T34_LVPOP_CO, MALE_F35T39_LVPOP_CO, MALE_F40T44_LVPOP_CO, MALE_F45T49_LVPOP_CO, MALE_F50T54_LVPOP_CO, MALE_F55T59_LVPOP_CO, MALE_F60T64_LVPOP_CO, MALE_F65T69_LVPOP_CO, MALE_F70T74_LVPOP_CO, FEMALE_F0T9_LVPOP_CO, FEMALE_F10T14_LVPOP_CO, FEMALE_F15T19_LVPOP_CO, FEMALE_F20T24_LVPOP_CO, FEMALE_F25T29_LVPOP_CO, FEMALE_F30T34_LVPOP_CO, FEMALE_F35T39_LVPOP_CO, FEMALE_F40T44_LVPOP_CO, FEMALE_F45T49_LVPOP_CO, FEMALE_F50T54_LVPOP_CO, FEMALE_F55T59_LVPOP_CO, FEMALE_F60T64_LVPOP_CO, FEMALE_F65T69_LVPOP_CO, FEMALE_F70T74_LVPOP_CO
```

**첫 행 원본** — 행정동코드가 우리 지도와 같은 체계인지 눈으로 본다

```json
{
  "STDR_DE_ID": "20260728",
  "TMZON_PD_SE": "00",
  "ADSTRD_CODE_SE": "11110515",
  "TOT_LVPOP_CO": "14247.2052",
  "MALE_F0T9_LVPOP_CO": "407.5893",
  "MALE_F10T14_LVPOP_CO": "259.7169",
  "MALE_F15T19_LVPOP_CO": "516.1335",
  "MALE_F20T24_LVPOP_CO": "422.2382",
  "MALE_F25T29_LVPOP_CO": "449.8472",
  "MALE_F30T34_LVPOP_CO": "460.4683",
  "MALE_F35T39_LVPOP_CO": "521.4744",
  "MALE_F40T44_LVPOP_CO": "453.9988",
  "MALE_F45T49_LVPOP_CO": "645.8849",
  "MALE_F50T54_LVPOP_CO": "580.5536",
  "MALE_F55T59_LVPOP_CO": "573.7661",
  "MALE_F60T64_LVPOP_CO": "340.9447",
  "MALE_F65T69_LVPOP_CO": "213.5571",
  "MALE_F70T74_LVPOP_CO": "549.748",
  "FEMALE_F0T9_LVPOP_CO": "600.6099",
  "FEMALE_F10T14_LVPOP_CO": "359.8684",
  "FEMALE_F15T19_LVPOP_CO": "438.429",
  "FEMALE_F20T24_LVPOP_CO": "333.7417",
  "FEMALE_F25T29_LVPOP_CO": "368.9911",
  "FEMALE_F30T34_LVPOP_CO": "499.4771",
  "FEMALE_F35T39_LVPOP_CO": "671.1747",
  "FEMALE_F40T44_LVPOP_CO": "679.5412",
  "FEMALE_F45T49_LVPOP_CO": "706.8576",
  "FEMALE_F50T54_LVPOP_CO": "692.6781",
  "FEMALE_F55T59_LVPOP_CO": "615.245",
  "FEMALE_F60T64_LVPOP_CO": "517.0125",
  "FEMALE_F65T69_LVPOP_CO": "298.3604",
  "FEMALE_F70T74_LVPOP_CO": "1069.2981"
}
```

- 하루치를 받으려면 **11번** 나눠 불러야 한다(1,000행 제한)

---

⚠️ **이 파일을 보고 판단할 것**

1. 중국인 구분 컬럼이 무엇인가 (중국 / 중국 외 두 갈래일 것)
2. **'총생활인구수' 가 전체 인구인가, 외국인 합계인가** ← 분모가 바뀌면 비율이 통째로 달라진다
3. 행정동코드가 우리 지도(`data/geo/`)와 같은 체계인가 — 다르면 대조표가 필요하다
4. 시간대 컬럼이 있는가 — 생활인구는 시간별이라 **어느 시간을 쓸지 정해야 한다**
