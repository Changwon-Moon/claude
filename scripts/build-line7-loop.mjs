/** 7호선 — 공용 렌더러. 수치는 line7-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const Z = "​"; // 단어단위 줄바꿈용 ZWSP
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line7-daejang-2026.json", template: "line7-loop@1",
  form: "caps", capName: "7호선", color: "#747F00",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">7호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "도봉산":[["1","#0D3692",1,0]], "노원":[["4","#00A5DE",1,0]],
    "상봉":[["경의","#77C5A5",0,1], ["경춘","#0C8E72",0,0], EXP.gtxb, EXP.ktx],
    "강남구청":[["분당","#F5C400",0,1]], "이수":[["4","#00A5DE",1,0]], "신풍":[EXP.sinansan], "온수":[["1","#0D3692",1,0]],
  },
  DISP: {
    "도봉산":"도봉한신","노원":"포레나노원","중계":"중계주공5","공릉":`태릉${Z}해링턴플레이스`,"상봉":`한일${Z}써너스빌`,
    "사가정":`사가정${Z}센트럴아이파크`,"자양":"한강우성","강남구청":"힐스테이트 1단지","반포":`래미안${Z}퍼스티지`,
    "이수":`이수푸르지오${Z}더프레티움`,"상도":"상도파크자이","신풍":`힐스테이트${Z}클래시안`,"철산":`철산역${Z}롯데캐슬`,
    "광명사거리":`광명${Z}푸르지오포레나`,"온수":`e편한세상${Z}온수역`,"부천시청":`센트럴파크${Z}푸르지오`,
  },
  GUC: {"노원구":"#E4572E","도봉구":"#CA8A04","중랑구":"#0F766E","광진구":"#16A34A","강남구":"#7C3AED","서초구":"#0891B2","동작구":"#DB2777","영등포구":"#EA580C","구로구":"#E11D48","광명":"#2563EB","부천":"#0EA5A0"},
});
