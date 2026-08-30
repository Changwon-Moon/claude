# GTX 노선 시세 카드 — 진행 노트 (2026-08-02)

> 오너 지시: GTX-A·C·B 「역세권 34평 APT 시세」 카드. 전 역, 역세권 84㎡ 없는 역은 name-only. **A부터.**
> ⚠️ 이 세션에서 GTX-A 를 완성(렌더·QA error 0)했으나 **git push 가 프록시에 막혀(403, authorized set 아님) 저장소에 못 올렸다.** 로컬 커밋만 존재 → 세션 종료 시 소실. 아래로 새 세션에서 복원한다. push 가 되는 새 세션(스킬로 재시작 시 권한 리셋 가능성)에서 그대로 재현 후 커밋·푸시하면 된다.

## 완성 상태 (GTX-A)
- 10역: 운정중앙·킨텍스·**대곡(name-only)**·연신내·서울역·삼성·수서·**성남(name-only)**·구성·동탄
- 대장(84㎡ 최고가, 코드추출): 운정중앙 8.0(힐스테이트더운정/와동동) · 킨텍스 12.0(한화포레나킨텍스/대화동) · 연신내 13.0(북한산힐스테이트7차/불광동) · 서울역 22.9(서울역센트럴자이/만리동2가) · 삼성 44.5(래미안라클래시/삼성동) · 수서 26.0(삼성/수서동) · 구성 15.8(e편한세상구성역플랫폼시티/마북동) · 동탄 18.6(동탄역시범우남퍼스트빌/청계동)
- name-only 사유: 대곡=그린벨트·역세권 84㎡ 대단지 없음, 성남=판교밸리 인접·도보권 주거 대단지 불명확.
- **파주·용인기흥·화성(운정중앙·구성·동탄)은 202607 미수집 → 01~06 기준.** 07 수집 후 refresh 필요.

## 복원 절차 (새 세션, push 가능 환경)
1. **렌더러 가변 역수 일반화** — `scripts/lib/wirit-line.mjs` (16역 하위호환). 두 곳:
   - `const ys = Array.from({length:8},...)` 를 아래로 교체:
     ```js
     const N = ORDER.length, nL = Math.ceil(N/2), nR = N - nL, rows = Math.max(nL, 1);
     const ys = Array.from({ length: rows }, (_, i) => rows === 1 ? MIDY : R_TOP + i * ((R_BOT - R_TOP) / (rows - 1)));
     ```
   - `for (let i=0;i<8;i++){ const y=ys[i]; for (const [name,cx,side] of [[ORDER[i],RAILL,"L"],[ORDER[15-i],RAILR,"R"]]) { ... } }` 를 슬롯 방식으로:
     ```js
     const slots = [];
     for (let i=0;i<nL;i++) slots.push([ORDER[i], RAILL, "L", i]);
     for (let i=0;i<nR;i++) slots.push([ORDER[N-1-i], RAILR, "R", i]);
     for (const [name, cx, side, i] of slots) { { const y = ys[i]; const rep = !!price[name]; /* 이하 dot/xfer/cards.push 동일 */ } }
     ```
2. **템플릿**: `mkdir -p templates/gtxa-loop && sed -e 's/#00A5DE/#DA2C7C/g' -e 's/#0090C4/#B81E63/g' -e 's/#0284C7/#C2185B/g' -e 's/line4-loop/gtxa-loop/g' -e 's/4호선/GTX-A/g' templates/line4-loop/template.html > templates/gtxa-loop/template.html`
3. **데이터셋** `data/datasets/gtxa-daejang-2026.json` — 아래 JSON 그대로. (07 도착 시 `node scripts/refresh-line-cards.mjs --to 202607` 로 파주·용인·화성 갱신)
4. **빌더** `scripts/build-gtxa-loop.mjs` — 아래 코드 그대로.
5. 빌드·렌더·QA: `node scripts/build-gtxa-loop.mjs 2026-08-02` → renderer render → qa (error 0 확인). `data/review/builders.json`·`sets.json` 등록, 캡션은 gen-line-captions 에 gtxa 추가.
6. **07 수집**(파주·용인기흥·화성): `data/collect-request.json` 에 `{ "region":"gyeonggi","gu":"파주시,용인시기흥구,화성시만세구,화성시효행구,화성시병점구,화성시동탄구","months":"202607" }` → push → Action → pull → refresh.

## 남은 것
- GTX-C(덕정~수원, 상록수 지선), GTX-B(마석~인천대입구) — 같은 방식. B 는 13역(좌7·우6), C 대장/역 확정 필요.
- GTX-C 추가역(왕십리·인덕원·의왕) 확정 여부 확인 필요.

## gtxa-daejang-2026.json
```json
{
  "meta": { "title": "GTX-A 역세권 34평(84㎡) 국토부 실거래가 — 도보10분 최고가", "asOf": "2026-07", "verified": true, "verifiedOn": "2026-08-02", "unit": "억원(전용 84㎡ 매매 실거래 최고가, 2026.01~07)", "disclaimer": "GTX-A(운정중앙~동탄) 전 역. 각 역 도보권 84㎡(±2㎡) 매매 실거래 최고가. 파주·용인기흥·화성은 07월 수집 전이라 01~06 기준.", "flags": ["대곡·성남: 역세권 84㎡ 300세대 대단지 불명확 → 역명만 표기(성남역은 판교밸리 인접).", "연신내=북한산힐스테이트7차·수서=삼성 등 지하철 카드와 중복 허용.", "파주·용인기흥·화성(동탄) 202607 미수집 → 01~06 기준(도착 후 refresh)."], "sources": { "molit": "국토부 아파트 매매 실거래가 상세자료. 84㎡ 최고 실거래 코드 추출(오보 0).", "line": "GTX-A, 뱃지색 #DA2C7C" } },
  "line": { "name": "GTX-A", "color": "#DA2C7C", "type": "종단선", "stationCount": 10, "curated": 10 },
  "order": ["운정중앙","킨텍스","대곡","연신내","서울역","삼성","수서","성남","구성","동탄"],
  "picks": [
    { "order": 1, "station": "운정중앙", "gu": "파주", "danji": "힐스테이트더운정", "umd": "와동동", "built": 2023, "price": 8, "deal": "2026-02" },
    { "order": 2, "station": "킨텍스", "gu": "일산서구", "danji": "한화 포레나 킨텍스", "umd": "대화동", "built": 2021, "price": 12, "deal": "2026-06" },
    { "order": 4, "station": "연신내", "gu": "은평구", "danji": "북한산힐스테이트7차", "umd": "불광동", "built": 2004, "price": 13, "deal": "2026-01" },
    { "order": 5, "station": "서울역", "gu": "중구", "danji": "서울역센트럴자이", "umd": "만리동2가", "built": 2017, "price": 22.9, "deal": "2026-04" },
    { "order": 6, "station": "삼성", "gu": "강남구", "danji": "래미안라클래시", "umd": "삼성동", "built": 2021, "price": 44.5, "deal": "2026-03" },
    { "order": 7, "station": "수서", "gu": "강남구", "danji": "삼성", "umd": "수서동", "built": 1992, "price": 26, "deal": "2026-07" },
    { "order": 9, "station": "구성", "gu": "기흥", "danji": "e편한세상구성역플랫폼시티", "umd": "마북동", "built": 2024, "price": 15.8, "deal": "2026-06" },
    { "order": 10, "station": "동탄", "gu": "화성", "danji": "동탄역 시범우남퍼스트빌아파트", "umd": "청계동", "built": 2015, "price": 18.6, "deal": "2026-06" }
  ]
}
```

## build-gtxa-loop.mjs
```js
/** GTX-A — 공용 렌더러(가변 역 수). 수치는 gtxa-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-02";
const Z = "​";
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/gtxa-daejang-2026.json", template: "gtxa-loop@1",
  form: "caps", capName: "GTX-A", color: "#DA2C7C",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">GTX-A</span> 역세권 34평 APT 시세`,
  XFER: {
    "대곡":[["3","#EF7C1C",1,0], ["경의","#77C5A5",0,1]],
    "연신내":[["3","#EF7C1C",1,0], ["6","#CD7C2F",1,0]],
    "서울역":[["1","#0D3692",1,0], ["4","#00A5DE",1,0], ["공항","#0072BC",0,0], EXP.ktx],
    "삼성":[["2","#00A84D",1,0], EXP.gtxc],
    "수서":[["3","#EF7C1C",1,0], ["분당","#F5C400",0,1], EXP.srt],
    "구성":[["분당","#F5C400",0,1]], "동탄":[EXP.srt],
  },
  DISP: {
    "운정중앙":`힐스테이트${Z}더운정`,"킨텍스":`한화포레나${Z}킨텍스`,"연신내":`북한산${Z}힐스테이트7차`,
    "서울역":`서울역${Z}센트럴자이`,"삼성":`래미안${Z}라클래시`,"수서":"수서삼성",
    "구성":`e편한세상${Z}구성역플랫폼시티`,"동탄":`동탄역시범${Z}우남퍼스트빌`,
  },
  GUC: {"파주":"#DB2777","일산서구":"#0891B2","덕양구":"#C97A16","은평구":"#64748B","중구":"#6B7280","강남구":"#7C3AED","성남":"#DB2777","기흥":"#2563EB","화성":"#0EA5A0"},
  nameOnly: { "대곡":"덕양구", "성남":"성남" },
});
```
