/**
 * 1회 보강 — 각 pick 에 molit 원본 키를 심어 리프레시 100% 자동매칭을 만든다.
 *  - umd 없으면 채운다(신분당). danji 가 molit aptNm 과 다르면 srcApt 를 추가한다(옥수파크힐스 등).
 * 판정 기준: pick.price(표시값) 와 일치하는 84㎡ 최고가 레코드 중 이름이 관련된 것.
 * 실행: node scripts/enrich-line-src.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MOLIT = join(ROOT, "data/datasets/molit");
const LINES = ["sinbundang","line2","line3","line4","line5","line6","line7","line8","line9"];
const dsPath = (k)=> join(ROOT, `data/datasets/${k}-daejang-2026.json`);
const disp = (억)=> (Math.round((억+1e-9)*10)/10).toFixed(1);
const MONTHS = ["202601","202602","202603","202604","202605","202606","202607"];

// recs: 단지+법정동별 84㎡ 최고가
const recMap = {};
for (const f of readdirSync(MOLIT)){
  const m=f.match(/-(\d{6})\.json$/); if(!m || !MONTHS.includes(m[1])) continue;
  for (const x of JSON.parse(readFileSync(join(MOLIT,f),"utf8")).trades){
    if (x.canceled || x.area<82 || x.area>86) continue;
    const k=`${x.aptNm}${x.umdNm}`;
    if(!recMap[k] || x.priceManwon>recMap[k].p) recMap[k]={apt:x.aptNm, umd:x.umdNm, p:x.priceManwon};
  }
}
const recs = Object.values(recMap);
const related = (a,b)=> a===b || a.includes(b) || b.includes(a);

let filled=0, srced=0; const unresolved=[];
for (const k of LINES){
  const ds=JSON.parse(readFileSync(dsPath(k),"utf8"));
  for (const p of ds.picks){ if(p.price==null) continue;
    const tp=disp(p.price);
    let pool = recs.filter(r=> !p.umd || r.umd===p.umd);
    // 반드시 표시가격이 일치하는 후보만 채택(가격-무관 매칭 금지 → 오매칭 방지).
    // 1) 이름 정확 + 가격 일치  2) 이름 관련 + 가격 일치
    let cand = pool.find(r=>r.apt===p.danji && disp(r.p/10000)===tp)
            || pool.find(r=>related(r.apt,p.danji) && disp(r.p/10000)===tp);
    if(!cand){ unresolved.push(`[${ds.line?.name||k}] ${p.station} · ${p.danji}${p.umd?"|"+p.umd:""} (${tp}억)`); continue; }
    if(!p.umd){ p.umd=cand.umd; filled++; }
    if(cand.apt!==p.danji){ p.srcApt=cand.apt; srced++; }
  }
  // key 순서 유지 위해 재직렬화
  writeFileSync(dsPath(k), JSON.stringify(ds,null,2)+"\n");
}
console.log(`umd 채움 ${filled}건 · srcApt 추가 ${srced}건 · 미해결 ${unresolved.length}건`);
unresolved.forEach(x=>console.log("  ⚠️ "+x));
