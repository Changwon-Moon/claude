/**
 * 신분당선 — 노선 2열 접이(U자) + 환승뱃지 + 편집형 정보(비-AI, 종이·괘선). 1장 카드.
 * 수치는 data/datasets/sinbundang-daejang-2026.json 에서 코드가 읽는다(오보 0).
 * 실행: node scripts/build-sinbundang-loop.mjs [date]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-07-31";
const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/sinbundang-daejang-2026.json"), "utf8"));
const price = {}; for (const p of ds.picks) price[p.station] = { danji: p.danji, price: p.price, households: p.households, built: p.built };

const ORDER = ["신사","논현","신논현","강남","양재","양재시민의숲","청계산입구","판교",
               "정자","미금","동천","수지구청","성복","상현","광교중앙","광교"];
// 환승노선: [표시라벨, 색, 숫자여부, 어두운글씨(1=검정 — 밝은 배경 대비 확보)]
const XFER = {
  "신사":[["3","#E8690C",1]], "논현":[["7","#747F00",1]], "신논현":[["9","#6B6440",1]],
  "강남":[["2","#00A84D",1]], "양재":[["3","#E8690C",1]],
  "판교":[["경강","#003DA5",0]], "정자":[["분당","#F5C400",0,1]], "미금":[["분당","#F5C400",0,1]],
};
const shortDanji = (s)=> s.replace(/^\S*역\s+/, "");
// 행정구역(구) 매핑 + 구별 색
const GU = {신사:"강남구",논현:"강남구",신논현:"강남구",강남:"서초구",양재:"서초구","양재시민의숲":"서초구",청계산입구:"서초구",
  판교:"분당구",정자:"분당구",미금:"분당구",동천:"수지구",수지구청:"수지구",성복:"수지구",상현:"수지구",광교중앙:"영통구",광교:"영통구"};
const GUC = {"강남구":"#2E6BFF","서초구":"#0E9AA7","분당구":"#12A150","수지구":"#D9871A","영통구":"#8B5CF6"};
// 가격 히트맵 범위
const _pv = Object.values(price).map(p=>p.price); const PMIN=Math.min(..._pv), PMAX=Math.max(..._pv);
const heat = (pr)=> (0.02 + (pr-PMIN)/(PMAX-PMIN)*0.13).toFixed(3); // 낮음 연분홍 → 높음 진분홍

const W=936, H=940, RAILL=334, RAILR=602, R_TOP=110, R_BOT=866;
const ys = Array.from({length:8},(_,i)=> R_TOP + i*((R_BOT-R_TOP)/7));

function badge(cx, cy, code, col, isNum, dark){
  const tc = dark ? "#141821" : "#fff";
  if (isNum){
    return `<circle cx="${cx}" cy="${cy}" r="19" fill="${col}"/>`
         + `<text x="${cx}" y="${cy+8}" text-anchor="middle" fill="${tc}" font-family="Pretendard" font-weight="800" font-size="24">${code}</text>`;
  }
  const w = code.length*22+22;
  return `<rect x="${cx-w/2}" y="${cy-19}" width="${w}" height="38" rx="10" fill="${col}"/>`
       + `<text x="${cx}" y="${cy+8}" text-anchor="middle" fill="${tc}" font-family="Pretendard" font-weight="800" font-size="22">${code}</text>`;
}
function dot(cx,cy,rep){
  return rep
   ? `<circle cx="${cx}" cy="${cy}" r="18" fill="#fff" stroke="#D4003B" stroke-width="7"/>`
   : `<circle cx="${cx}" cy="${cy}" r="11" fill="#D4003B"/>`;
}

const RAD=48; // 하단 자연스러운 라운드 코너 반경
let svg = `<svg class="slp-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
svg += `<line x1="${RAILL}" y1="${R_TOP}" x2="${RAILL}" y2="${R_BOT}" stroke="#D4003B" stroke-width="15" stroke-linecap="round"/>`;
svg += `<line x1="${RAILR}" y1="${R_TOP}" x2="${RAILR}" y2="${R_BOT}" stroke="#D4003B" stroke-width="15" stroke-linecap="round"/>`;
// 하단 U턴 — 둥근 코너 + 짧은 수평(판교~정자 자연스럽게 꺾임)
svg += `<path d="M${RAILL},${R_BOT} Q${RAILL},${R_BOT+RAD} ${RAILL+RAD},${R_BOT+RAD} L${RAILR-RAD},${R_BOT+RAD} Q${RAILR},${R_BOT+RAD} ${RAILR},${R_BOT}" stroke="#D4003B" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
// 종점 캡(신분당선) — 빨강 바탕·흰 글씨 — 신사/광교
for (const cx of [RAILL,RAILR]){
  svg += `<rect x="${cx-68}" y="${R_TOP-102}" width="136" height="42" rx="21" fill="#D4003B"/>`;
  svg += `<text x="${cx}" y="${R_TOP-74}" text-anchor="middle" fill="#fff" font-family="Pretendard" font-weight="800" font-size="23">신분당선</text>`;
  svg += `<line x1="${cx}" y1="${R_TOP-60}" x2="${cx}" y2="${R_TOP}" stroke="#D4003B" stroke-width="15"/>`;
}

const cards=[];
for (let i=0;i<8;i++){
  const y=ys[i];
  for (const [name,cx,side] of [[ORDER[i],RAILL,"L"],[ORDER[15-i],RAILR,"R"]]){
    const rep=!!price[name];
    svg += dot(cx,y,rep);
    // 환승뱃지 — 안쪽(센터 채널). 노선과 겹치지 않게 뱃지 크기만큼 여백 두고 배치
    const xf = XFER[name];
    if (xf){
      for (const [code,col,isNum,dark] of xf){
        const half = isNum ? 19 : (code.length*22+22)/2;
        const off = 28 + half; // 레일 가장자리(7.5)에서 ≈20px 이상 띄움
        const bx = side==="L" ? cx+off : cx-off;
        svg += badge(bx,y,code,col,isNum,dark);
      }
    }
    const boxW=298; // 레일(역 원)에서 카드를 더 떨어뜨려 시세가 점에 안 붙게
    const styleL = side==="L" ? `left:6px;width:${boxW}px;` : `left:${W-6-boxW}px;width:${boxW}px;`;
    const align = side==="L" ? "r" : "l";
    if (rep){ const {danji,price:pr,households,built}=price[name];
      const meta = `${households.toLocaleString()}세대 · ${built}년식`;
      const gu=GU[name], guc=GUC[gu], top=(pr>=PMAX-0.001);
      const bg=`background:rgba(212,0,59,${heat(pr)});`;
      cards.push({style:`${styleL}top:${Math.round(y-42)}px;${bg}`, align, rep:true, name, danji:shortDanji(danji), pr:pr.toFixed(1), meta, gu, guc, top});
    } else {
      cards.push({style:`${styleL}top:${Math.round(y-14)}px;`, align, rep:false, name, gu:GU[name], guc:GUC[GU[name]]});
    }
  }
}
svg += `</svg>`;

const card = {
  template:"sinbundang-loop@1", date,
  subtitle:"국토부 실거래가 2026.01~07월 · 전용면적 84㎡ · 최고가 기준",
  title:`<span class="ln">신분당선</span> 역세권 34평 APT 시세`,
  svg, cards,
  source:{ name:"국토부 실거래가" },
};
const outDir = join(ROOT, `data/content/${date}`);
mkdirSync(outDir,{recursive:true});
writeFileSync(join(outDir,"sinbundang-loop.json"), JSON.stringify(card,null,2)+"\n");
console.log(`✅ 접이형(편집형) 카드 → data/content/${date}/sinbundang-loop.json (카드 ${cards.length})`);
