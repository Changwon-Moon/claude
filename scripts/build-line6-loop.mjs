/** 6호선 — 공용 렌더러. 수치는 line6-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const Z = "​"; // 단어단위 줄바꿈용 ZWSP
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line6-daejang-2026.json", template: "line6-loop@1",
  form: "caps", capName: "6호선", color: "#CD7C2F",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">6호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "불광":[["3","#EF7C1C",1,0]], "연신내":[["3","#EF7C1C",1,0], EXP.gtxa],
    "DMC":[["경의","#77C5A5",0,1], ["공항","#0072BC",0,0]],
    "공덕":[["5","#8936A8",1,0], ["경의","#77C5A5",0,1], ["공항","#0072BC",0,0]],
    "삼각지":[["4","#00A5DE",1,0]], "청구":[["5","#8936A8",1,0]],
    "석계":[["1","#0D3692",1,0]], "태릉입구":[["7","#747F00",1,0]], "신내":[["경춘","#0C8E72",0,0]],
  },
  DISP: {
    "응암":`백련산${Z}SK뷰아이파크`,"불광":`불광${Z}롯데캐슬`,"연신내":`북한산${Z}힐스테이트7차`,"DMC":"월드컵파크 4단지",
    "망원":`마포한강${Z}아이파크`,"광흥창":"웨스트리버 데시앙","공덕":`공덕${Z}파크자이`,"삼각지":`용산${Z}e편한세상`,
    "이태원":"청화","청구":"남산타운","창신":`보문${Z}파크뷰자이`,"월곡":"래미안월곡",
    "돌곶이":`래미안${Z}장위퍼스트하이`,"석계":`한진한화${Z}그랑빌`,"태릉입구":`태릉${Z}해링턴플레이스`,"신내":"신내데시앙",
  },
  SUB: { "이태원":"전용 106㎡ 기준" },
  GUC: {"마포구":"#C2701A","용산구":"#DB2777","중구":"#6B7280","성북구":"#7C3AED","노원구":"#E4572E","중랑구":"#0F766E","은평구":"#64748B"},
});
