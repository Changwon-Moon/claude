/** 9호선 — 공용 렌더러. 수치는 line9-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line9-daejang-2026.json", template: "line9-loop@1",
  form: "caps", capName: "9호선", color: "#C8A415",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">9호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "가양":[EXP.daehong], "당산":[["2","#00A84D",1,0]], "여의도":[["5","#8936A8",1,0], EXP.gtxb, EXP.sinansan],
    "노량진":[["1","#0D3692",1,0]], "동작":[["4","#00A5DE",1,0]], "올림픽공원":[["5","#8936A8",1,0]],
  },
  DISP: {
    "마곡나루":"마곡13단지 힐스테이트","가양":"한강타운","염창":"e편한세상 염창","당산":"당산센트럴​아이파크",
    "여의도":"브라이튼​여의도","노량진":"신동아​리버파크","흑석":"흑석한강​센트레빌","동작":"이수​힐스테이트",
    "구반포":"래미안​퍼스티지","신반포":"아크로​리버파크","사평":"반포자이","언주":"아크로힐스​논현",
    "삼성중앙":"래미안​라클래시","봉은사":"삼성동센트럴​아이파크","송파나루":"리센츠","올림픽공원":"올림픽 선수기자촌",
  },
  GUC: {"강서구":"#0891B2","영등포구":"#EA580C","동작구":"#DB2777","서초구":"#0F766E","강남구":"#7C3AED","송파구":"#2563EB"},
});
