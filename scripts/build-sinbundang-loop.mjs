/** 신분당선 — 공용 렌더러 사용. 수치는 data/datasets/sinbundang-daejang-2026.json (오보 0). */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const N=(c)=>[c,{ "1":"#0D3692","2":"#00A84D","3":"#EF7C1C","4":"#00A5DE","5":"#8936A8","6":"#CD7C2F","7":"#747F00","8":"#E6186C","9":"#C8A415" }[c],1, c==="9"?1:0];
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/sinbundang-daejang-2026.json", template: "sinbundang-loop@1",
  form: "caps", capName: "신분당선", color: "#D4003B",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">신분당선</span> 역세권 34평 APT 시세`,
  XFER: {
    "신사":[N("3")], "논현":[N("7")], "신논현":[N("9")], "강남":[N("2")],
    "양재":[N("3"), EXP.gtxc], "판교":[["경강","#003DA5",0,0], EXP.wolpan], "정자":[["분당","#F5C400",0,1]],
    "미금":[["분당","#F5C400",0,1]],
  },
  DISP: {
    "신사":"논현신동아​파밀리에","신논현":"개나리​푸르지오","강남":"래미안 리더스원","양재":"서초동 현대아파트",
    "양재시민의숲":"양재우성","청계산입구":"서초포레스타​7단지","판교":"봇들마을​7단지","정자":"분당 파크뷰",
    "미금":"청솔마을 계룡","동천":"동천​센트럴자이","수지구청":"신정마을​7단지","성복":"롯데캐슬 골드타운",
    "상현":"광교자이​더클래스","광교중앙":"자연앤​힐스테이트","광교":"호반베르디움​트라엘",
  },
  GUC: {"강남구":"#2E6BFF","서초구":"#0E9AA7","분당구":"#12A150","수지구":"#D9871A","영통구":"#8B5CF6"},
  nameOnly: {"논현":"강남구"},
});
