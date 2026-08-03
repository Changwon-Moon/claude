/** 8호선 — 공용 렌더러. 수치는 line8-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const Z = "​"; // 단어단위 줄바꿈용 ZWSP
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line8-daejang-2026.json", template: "line8-loop@1",
  form: "caps", capName: "8호선", color: "#E6186C",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">8호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "별내":[["경춘","#0C8E72",0,0], EXP.gtxb], "구리":[["경의","#77C5A5",0,1]], "천호":[["5","#8936A8",1,0]],
    "잠실":[["2","#00A84D",1,0]], "가락시장":[["3","#EF7C1C",1,0]], "복정":[["분당","#F5C400",0,1]], "모란":[["분당","#F5C400",0,1]],
  },
  DISP: {
    "별내":`별내자이${Z}더스타`,"다산":`다산자이${Z}아이비플레이스`,"구리":`힐스테이트${Z}구리역`,"암사":"선사현대",
    "천호":`래미안${Z}강동팰리스`,"몽촌토성":"올림픽 선수기자촌","잠실":"잠실엘스","가락시장":"헬리오시티",
    "문정":"힐스테이트 문정","장지":`송파${Z}파인타운4단지`,"복정":`위례래미안${Z}e편한세상`,"산성":`산성역${Z}포레스티아`,
    "단대오거리":"금빛그랑메종 1단지","신흥":`하늘채${Z}랜더스원`,"수진":"수진삼부","모란":"금호어울림",
  },
  GUC: {"강동구":"#0F766E","송파구":"#2563EB","성남":"#DB2777","남양주":"#7C3AED","구리":"#C2410C"},
});
