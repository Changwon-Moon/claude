/** 5호선 — 공용 렌더러. 수치는 line5-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line5-daejang-2026.json", template: "line5-loop@1",
  form: "caps", capName: "5호선", color: "#8936A8",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">5호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "신길":[["1","#0D3692",1,0]], "여의도":[["9","#C8A415",1,1], EXP.gtxb, EXP.sinansan],
    "공덕":[["6","#CD7C2F",1,0]], "천호":[["8","#E6186C",1,0]],
  },
  DISP: {
    "마곡":"마곡엠밸리​7단지","발산":"수명산파크 1단지","목동":"목동청구한신","오목교":"목동​신시가지14",
    "신길":"래미안​에스티움","여의도":"브라이튼​여의도","공덕":"공덕​파크자이","애오개":"더클래시",
    "신금호":"래미안​하이리버","행당":"행당​한진타운","답십리":"래미안위브","광나루":"광장​힐스테이트",
    "천호":"래미안​강동팰리스","고덕":"래미안​힐스테이트고덕","상일동":"고덕​그라시움","미사":"미사강변​푸르지오",
  },
  GUC: {"강서구":"#0891B2","양천구":"#7C3AED","영등포구":"#EA580C","마포구":"#CA8A04","성동구":"#DB2777","동대문구":"#2563EB","광진구":"#16A34A","강동구":"#0F766E","하남":"#64748B"},
});
