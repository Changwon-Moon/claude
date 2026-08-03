/** 5호선 — 공용 렌더러. 수치는 line5-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const Z = "​"; // 단어단위 줄바꿈용 ZWSP
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line5-daejang-2026.json", template: "line5-loop@1",
  form: "caps", capName: "5호선", color: "#8936A8",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">5호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "여의도":[["9","#C8A415",1,1], EXP.gtxb, EXP.sinansan],
    "공덕":[["6","#CD7C2F",1,0], ["경의","#77C5A5",0,1], ["공항","#0072BC",0,0]],
    "청구":[["6","#CD7C2F",1,0]],
  },
  DISP: {
    "마곡":`마곡엠밸리${Z}7단지`,"발산":`우장산${Z}힐스테이트`,"목동":`목동${Z}신시가지7`,"오목교":`현대${Z}하이페리온2차`,
    "영등포시장":`아크로${Z}타워스퀘어`,"여의도":`브라이튼${Z}여의도`,"공덕":`공덕${Z}파크자이`,"애오개":`마포래미안${Z}푸르지오`,
    "서대문":"경희궁자이","청구":`청구${Z}e편한세상`,"신금호":`신금호${Z}파크자이`,"행당":`행당${Z}한진타운`,
    "답십리":`힐스테이트${Z}청계`,"광나루":`광장${Z}힐스테이트`,"고덕":`래미안${Z}힐스테이트고덕`,"미사":`미사강변${Z}푸르지오`,
  },
  SUB: { "목동":"전용 101㎡ 기준", "오목교":"전용 119㎡ 기준", "신금호":"전용 60㎡ 기준" },
  GUC: {"강서구":"#0891B2","양천구":"#7C3AED","영등포구":"#EA580C","마포구":"#CA8A04","종로구":"#9333EA","중구":"#6B7280","성동구":"#DB2777","동대문구":"#2563EB","광진구":"#16A34A","강동구":"#0F766E","하남":"#64748B"},
});
