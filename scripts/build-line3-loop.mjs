/** 3호선 — 공용 렌더러. 수치는 line3-daejang-2026.json (오보 0). */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLineCard, EXP } from "./lib/wirit-line.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
renderLineCard({
  root: ROOT, date, dsFile: "data/datasets/line3-daejang-2026.json", template: "line3-loop@1",
  form: "caps", capName: "3호선", color: "#EF7C1C",
  subtitle: "국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title: `<span class="ln">3호선</span> 역세권 34평 APT 시세`,
  XFER: {
    "연신내":[["6","#CD7C2F",1,0], EXP.gtxa], "옥수":[["경의","#77C5A5",0,1]], "고속터미널":[["9","#C8A415",1,1]],
    "도곡":[["분당","#F5C400",0,1]], "수서":[["분당","#F5C400",0,1], EXP.gtxa, EXP.srt],
  },
  DISP: {
    "대화":"장성마을 동부","주엽":"문촌마을 19단지","정발산":"호수마을 청구","마두":"강촌마을 라이프",
    "화정":"별빛마을 7단지","삼송":"삼송2차​아이파크","연신내":"라이프미성","홍제":"서대문푸르지오​센트럴파크",
    "금호":"e편한세상 금호파크힐스","옥수":"옥수​파크힐스","압구정":"현대14차","고속터미널":"래미안​원베일리",
    "도곡":"도곡렉슬","대치":"래미안​대치팰리스","학여울":"한보미도​맨션1","수서":"삼성아파트",
  },
  GUC: {"일산서구":"#1C8C7D","일산동구":"#5B9E2E","덕양구":"#C97A16","은평구":"#64748B","서대문구":"#4F46E5","성동구":"#E4572E","강남구":"#7C3AED","서초구":"#0891B2"},
});
