/** 2호선 순환선 — 공용 렌더러. 수치는 line2-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line2-daejang-2026.json", template: "line2-loop@1",
  form: "loop", capName: "2호선 순환선", color: "#009D3E",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">2호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "신당":[["6","#CD7C2F",1,0]], "왕십리":[["5","#8936A8",1,0], EXP.dongbuk], "잠실":[["8","#E6186C",1,0]],
    "삼성":[EXP.gtxa, EXP.gtxc], "강남":[["신분당","#D4003B",0,0]], "교대":[["3","#EF7C1C",1,0]],
    "신도림":[["1","#0D3692",1,0]], "당산":[["9","#C8A415",1,1]], "합정":[["6","#CD7C2F",1,0]],
  },
  DISP: {
    "신당":"래미안​하이베르","왕십리":"센트라스","성수":"롯데캐슬​파크","구의":"구의​현대2단지","잠실":"잠실엘스",
    "삼성":"힐스테이트 1단지","역삼":"개나리​푸르지오","강남":"강남센트럴​아이파크","교대":"래미안 리더스원",
    "방배":"방배​그랑자이","서울대입구":"e편한세상 1단지","신도림":"대림 e편한세상4","당산":"당산센트럴​아이파크",
    "합정":"마포한강2차​푸르지오","신촌":"e편한세상 4단지","아현":"마포래미안​푸르지오4단지",
  },
  GUC: {"중구":"#6B7280","성동구":"#E4572E","광진구":"#E08600","송파구":"#2E6BFF","강남구":"#7C3AED","서초구":"#0E9AA7","관악구":"#16A34A","구로구":"#DB2777","영등포구":"#0891B2","마포구":"#C2701A","서대문구":"#4F46E5"},
});
