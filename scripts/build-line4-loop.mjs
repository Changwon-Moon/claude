/** 4호선 — 공용 렌더러. 수치는 line4-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line4-daejang-2026.json", template: "line4-loop@1",
  form: "caps", capName: "4호선", color: "#00A5DE",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">4호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "노원":[["7","#747F00",1,0]], "창동":[["1","#0D3692",1,0], EXP.gtxc], "미아사거리":[EXP.dongbuk], "삼각지":[["6","#CD7C2F",1,0]],
    "이촌":[["경의","#77C5A5",0,1]], "이수":[["7","#747F00",1,0]], "사당":[["2","#00A84D",1,0]],
    "인덕원":[EXP.gtxc, EXP.wolpan, EXP.indong], "금정":[["1","#0D3692",1,0], EXP.gtxc],
  },
  DISP: {
    "노원":"포레나노원","창동":"동아청솔","미아사거리":"미아동부​센트레빌","길음":"롯데캐슬​클라시아",
    "성신여대입구":"돈암 코오롱하늘채","삼각지":"용산​e편한세상","신용산":"벽산​메가트리움","이촌":"한가람",
    "이수":"이수푸르지오​더프레티움","사당":"사당우성2","과천":"과천푸르지오​써밋","인덕원":"인덕원마을 삼성",
    "평촌":"향촌롯데","범계":"평촌더샵​센트럴시티","금정":"힐스테이트​금정역","산본":"래미안​하이어스",
  },
  GUC: {"노원구":"#E4572E","도봉구":"#CA8A04","강북구":"#9A3412","성북구":"#7C3AED","용산구":"#DB2777","동작구":"#0E9AA7","과천":"#16A34A","안양":"#2563EB","군포":"#64748B"},
});
