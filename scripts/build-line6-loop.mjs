/** 6호선 — 공용 렌더러. 수치는 line6-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line6-daejang-2026.json", template: "line6-loop@1",
  form: "caps", capName: "6호선", color: "#CD7C2F",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">6호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "DMC":[["경의","#77C5A5",0,1]], "공덕":[["5","#8936A8",1,0]], "효창공원앞":[["경의","#77C5A5",0,1]],
    "삼각지":[["4","#00A5DE",1,0]], "약수":[["3","#EF7C1C",1,0]], "고려대":[EXP.dongbuk], "석계":[["1","#0D3692",1,0]], "태릉입구":[["7","#747F00",1,0]],
  },
  DISP: {
    "DMC":"월드컵파크 4단지","망원":"마포한강​아이파크","광흥창":"웨스트리버 데시앙","대흥":"마포​프레스티지자이",
    "공덕":"공덕​파크자이","효창공원앞":"롯데캐슬​센터포레","삼각지":"용산​e편한세상","이태원":"남산대림",
    "약수":"청구​e편한세상","고려대":"래미안라센트","월곡":"래미안월곡","상월곡":"동아에코빌",
    "돌곶이":"래미안​아트리치","석계":"한진한화​그랑빌","태릉입구":"태릉​해링턴플레이스","봉화산":"신내데시앙",
  },
  GUC: {"마포구":"#C2701A","용산구":"#DB2777","중구":"#6B7280","성북구":"#7C3AED","노원구":"#E4572E","중랑구":"#0F766E"},
});
