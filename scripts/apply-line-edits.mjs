/**
 * 2026-08-02 오너 지시 — 4~8호선 역 추가/삭제/이름·단지 변경 일괄 반영.
 * 데이터셋만 손댄다(order·picks·price). DISP/XFER/GUC/SUB 는 빌더에서 별도 수정.
 *
 *  - 삭제: order·picks 에서 제거
 *  - 이름변경(rename): station 명만(단지 유지) → 가격 그대로 carry
 *  - 단지변경(danjiChange)·신규(add): molit 에서 84㎡(또는 area 오버라이드) 최고가 코드추출(오보 0)
 *  - 유지역: 기존 price/deal/umd/srcApt/built 그대로 carry
 *  - order 를 노선 순서대로 재배열, pick.order 재번호
 * 실행: node scripts/apply-line-edits.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MOLIT = join(ROOT, "data/datasets/molit");
const MONTHS = ["202601","202602","202603","202604","202605","202606","202607"];
const dsPath = (k)=> join(ROOT, `data/datasets/${k}-daejang-2026.json`);
const disp = (억)=> (Math.round((억+1e-9)*10)/10).toFixed(1);

// molit 전체 로드(월 필터). 각 trade: {aptNm, umdNm, area, priceManwon, canceled, ym}
const TRADES = [];
for (const f of readdirSync(MOLIT)){
  const m=f.match(/-(\d{6})\.json$/); if(!m || !MONTHS.includes(m[1])) continue;
  for (const x of JSON.parse(readFileSync(join(MOLIT,f),"utf8")).trades){
    if (x.canceled) continue;
    TRADES.push({apt:x.aptNm, umd:x.umdNm, area:x.area, p:x.priceManwon, ym:m[1]});
  }
}
const related = (a,b)=> a===b || a.includes(b) || b.includes(a);
// danji+umd(+area) 84㎡ 최고가. umd 지정 시 그 동만. lo/hi = area 창.
function findBest(danji, umd, lo=82, hi=86){
  let best=null;
  const pool = TRADES.filter(t=> t.area>=lo && t.area<=hi && (!umd || t.umd===umd));
  // 1) 이름 정확  2) 이름 관련
  for (const pass of [t=>t.apt===danji, t=>related(t.apt,danji)]){
    for (const t of pool){ if(pass(t) && (!best || t.p>best.p)) best={p:t.p, ym:t.ym, apt:t.apt, umd:t.umd}; }
    if (best) break;
  }
  return best;
}

const EDITS = {
  line4: {
    del: ["신용산"],
    danjiChange: {
      "평촌": { danji:"평촌더샵센트럴시티", umd:"관양동", built:2016 },
      "범계": { danji:"평촌센텀퍼스트", umd:"호계동", built:2025 },   // 아크로베스티뉴 실거래 없음 → 역 84㎡ 대장 대체(오너 확인)
    },
    add: [ { station:"안산중앙", gu:"안산", umd:"고잔동", danji:"안산레이크타운푸르지오", built:2016 } ],
    order: ["노원","창동","미아사거리","길음","성신여대입구","삼각지","이촌","이수","사당","과천","인덕원","평촌","범계","금정","산본","안산중앙"],
  },
  line5: {
    del: ["신길","천호","상일동"],
    danjiChange: {
      "발산": { danji:"우장산힐스테이트", umd:"내발산동", built:2005 },
      "목동": { danji:"목동신시가지7", umd:"목동", built:1986, lo:99, hi:103 },
      "오목교": { danji:"현대하이페리온2차", umd:"목동", built:2003, lo:117, hi:121 },  // 전용102 없음 → 목동 119㎡ 최소평형(오너: 실전용 병기)
      "애오개": { danji:"마포래미안푸르지오", umd:"아현동", built:2014 },
      "답십리": { danji:"힐스테이트청계", umd:"답십리동", built:2020 },   // 성동자이리버뷰 실거래 없음 → 답십리 84㎡ 대장 대체
      "신금호": { danji:"신금호파크자이", umd:"금호동2가", built:2016, lo:58, hi:62 },  // 84㎡ 없음 → 전용60㎡(오너: 실전용 병기)
    },
    add: [
      { station:"영등포시장", gu:"영등포구", umd:"영등포동7가", danji:"아크로타워스퀘어", built:2017 },
      { station:"서대문", gu:"종로구", umd:"홍파동", danji:"경희궁자이", built:2017 },
      { station:"청구", gu:"중구", umd:"신당동", danji:"청구e편한세상", built:2011 },
    ],
    order: ["마곡","발산","목동","오목교","영등포시장","여의도","공덕","애오개","서대문","청구","신금호","행당","답십리","광나루","고덕","미사"],
  },
  line6: {
    del: ["상월곡","고려대","효창공원앞","대흥"],
    rename: { "봉화산": { to:"신내" } },   // 역명만(단지 데시앙 유지)
    danjiChange: {
      "이태원": { danji:"청화1", umd:"이태원동", built:1998, lo:104, hi:108 },   // 84㎡ 없음 → 전용106㎡(오너: 실전용 병기)
      "돌곶이": { danji:"래미안장위퍼스트하이", umd:"장위동", built:2019 },   // 장위자이레디언트 실거래 없음 → 장위동 84㎡ 대장 대체
      "약수":  { danji:"남산타운", umd:"신당동", built:2002, to:"청구" },   // 단지변경 + 역명변경
    },
    add: [
      { station:"응암", gu:"은평구", umd:"응암동", danji:"백련산에스케이뷰아이파크", built:2020 },
      { station:"불광", gu:"은평구", umd:"불광동", danji:"불광롯데캐슬", built:2007 },   // 힐스테이트메디알레 실거래 없음 → 불광동 84㎡ 대장 대체
      { station:"연신내", gu:"은평구", umd:"불광동", danji:"북한산힐스테이트7차", built:2004 },
      { station:"창신", gu:"성북구", umd:"보문동6가", danji:"보문파크뷰자이", built:2019 },
    ],
    order: ["응암","불광","연신내","DMC","망원","광흥창","공덕","삼각지","이태원","청구","창신","월곡","돌곶이","석계","태릉입구","신내"],
  },
  line7: {
    del: ["하계","학동","내방","남성","숭실대입구","장승배기","신대방삼거리"],
    add: [
      { station:"도봉산", gu:"도봉구", umd:"도봉동", danji:"도봉한신", built:1988 },
      { station:"노원", gu:"노원구", umd:"상계동", danji:"포레나노원", built:2020 },
      { station:"사가정", gu:"중랑구", umd:"면목동", danji:"사가정센트럴아이파크", built:2020 },
      { station:"철산", gu:"광명", umd:"철산동", danji:"철산역롯데캐슬", built:2022 },   // 철산자이더헤리티지 실거래 없음 → 철산동 84㎡ 대장 대체
      { station:"광명사거리", gu:"광명", umd:"광명동", danji:"광명푸르지오포레나", built:2022 },   // 광명센트럴아이파크 84㎡ 없음 → 광명동 84㎡ 대장 대체
      { station:"온수", gu:"부천", umd:"괴안동", danji:"이편한세상온수역", built:2021 },
      { station:"부천시청", gu:"부천", umd:"중동", danji:"센트럴파크푸르지오", built:2020 },
    ],
    order: ["도봉산","노원","중계","공릉","상봉","사가정","자양","강남구청","반포","이수","상도","신풍","철산","광명사거리","온수","부천시청"],
  },
  line8: {
    del: ["강동구청","석촌","송파","남한산성입구"],
    add: [
      { station:"별내", gu:"남양주", umd:"별내동", danji:"별내자이더스타", built:2024 },
      { station:"다산", gu:"남양주", umd:"다산동", danji:"다산자이아이비플레이스", built:2021 },
      { station:"구리", gu:"구리", umd:"수택동", danji:"힐스테이트구리역", built:2023 },
      { station:"천호", gu:"강동구", umd:"천호동", danji:"래미안강동팰리스", built:2017 },
    ],
    order: ["별내","다산","구리","암사","천호","몽촌토성","잠실","가락시장","문정","장지","복정","산성","단대오거리","신흥","수진","모란"],
  },
};

const report = { resolved:[], unresolved:[] };
for (const [key, ed] of Object.entries(EDITS)){
  const ds = JSON.parse(readFileSync(dsPath(key),"utf8"));
  let picks = ds.picks.slice();
  const byStation = {}; for (const p of picks) byStation[p.station]=p;

  // 1) 삭제
  for (const s of ed.del||[]) delete byStation[s];

  // 2) 이름만 변경(rename): 단지 유지, 가격 carry
  for (const [from, r] of Object.entries(ed.rename||{})){
    const p = byStation[from]; if(!p) continue;
    p.station = r.to; byStation[r.to]=p; delete byStation[from];
  }

  // 3) 단지변경(+선택 역명변경): 새 가격 추출
  for (const [from, c] of Object.entries(ed.danjiChange||{})){
    const p = byStation[from]; if(!p){ report.unresolved.push(`[${key}] 단지변경 대상 없음: ${from}`); continue; }
    const st = c.to || from;
    if (c.to){ delete byStation[from]; p.station = c.to; byStation[c.to]=p; }
    p.danji = c.danji; if(c.umd) p.umd=c.umd; if(c.built) p.built=c.built; delete p.srcApt;
    const b = findBest(c.danji, c.umd, c.lo, c.hi);
    if(!b){ report.unresolved.push(`[${key}] ${st} · ${c.danji}|${c.umd||"?"} (area ${c.lo||82}~${c.hi||86}) 추출 실패`); p.price=null; }
    else { p.price=Math.round(b.p/100)/100; p.deal=`${b.ym.slice(0,4)}-${b.ym.slice(4)}`; p.umd=b.umd; if(b.apt!==c.danji)p.srcApt=b.apt;
      report.resolved.push(`[${key}] ${st} · ${c.danji} → ${disp(p.price)}억 (${p.deal}, ${b.apt}|${b.umd}${b.apt!==c.danji?" srcApt":""})`); }
  }

  // 4) 신규 추가
  for (const a of ed.add||[]){
    const b = findBest(a.danji, a.umd, a.lo, a.hi);
    const p = { order:0, station:a.station, gu:a.gu, danji:a.danji, umd:a.umd, built:a.built, price:null, deal:null };
    if(!b){ report.unresolved.push(`[${key}] 신규 ${a.station} · ${a.danji}|${a.umd} 추출 실패(07 미도착 가능)`); }
    else { p.price=Math.round(b.p/100)/100; p.deal=`${b.ym.slice(0,4)}-${b.ym.slice(4)}`; p.umd=b.umd; if(b.apt!==a.danji)p.srcApt=b.apt;
      report.resolved.push(`[${key}] +${a.station} · ${a.danji} → ${disp(p.price)}억 (${p.deal}, ${b.apt}|${b.umd}${b.apt!==a.danji?" srcApt":""})`); }
    byStation[a.station]=p;
  }

  // 5) order 재배열 + pick.order 재번호
  ds.order = ed.order;
  const newPicks = [];
  ed.order.forEach((s,i)=>{ const p=byStation[s]; if(!p){ report.unresolved.push(`[${key}] order 에 있으나 pick 없음: ${s}`); return; } p.order=i+1; newPicks.push(p); });
  ds.picks = newPicks;
  if (ds.line) ds.line.curated = newPicks.length;
  writeFileSync(dsPath(key), JSON.stringify(ds,null,2)+"\n");
}

console.log("=== 추출/유지 결과 ===");
report.resolved.forEach(x=>console.log("  ✓ "+x));
if(report.unresolved.length){ console.log("\n=== ⚠️ 미해결 ==="); report.unresolved.forEach(x=>console.log("  ✗ "+x)); }
else console.log("\n미해결 0건.");
