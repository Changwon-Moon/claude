/** 7호선 — 공용 렌더러. 수치는 line7-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line7-daejang-2026.json", template: "line7-loop@1",
  form: "caps", capName: "7호선", color: "#747F00",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">7호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "상봉":[["경의","#77C5A5",0,1], EXP.gtxb], "강남구청":[["분당","#F5C400",0,1]],
    "이수":[["4","#00A5DE",1,0]], "신풍":[EXP.sinansan],
  },
  DISP: {
    "중계":"중계주공5","하계":"하계우성","공릉":"태릉​해링턴플레이스","상봉":"한일​써너스빌","자양":"한강우성",
    "강남구청":"힐스테이트 1단지","학동":"아크로힐스​논현","반포":"래미안​퍼스티지","내방":"서리풀​e편한세상",
    "이수":"이수푸르지오​더프레티움","남성":"래미안​로이파크","숭실대입구":"e편한세상 상도노빌리티",
    "상도":"상도파크자이","장승배기":"힐스테이트​장승배기역","신대방삼거리":"보라매자이​더포레스트","신풍":"힐스테이트​클래시안",
  },
  GUC: {"노원구":"#E4572E","중랑구":"#0F766E","광진구":"#16A34A","강남구":"#7C3AED","서초구":"#0891B2","동작구":"#DB2777","영등포구":"#EA580C"},
});
