/**
 * 지하철 노선 시세 카드 — 데이터 리프레시(원할 때).
 *
 * 단지 선정은 데이터셋에 이미 고정돼 있다. 이 스크립트는 **같은 단지의 84㎡ 최고가만**
 * molit 캐시에서 기간을 다시 훑어 갱신한다(오보 0). 판단 없음 = 스크립트가 한다.
 *
 * 실행:
 *   node scripts/refresh-line-cards.mjs                 # 202601~(캐시 최신월) 재추출 + 재빌드
 *   node scripts/refresh-line-cards.mjs --to 202608     # 종료월 지정
 *   node scripts/refresh-line-cards.mjs --from 202601 --to 202608 --no-rebuild
 *
 * 새 달을 포함하려면 먼저 그 달 molit 을 수집해야 한다:
 *   node scripts/refresh-line-cards.mjs --collect 202608   # collect-request.json 작성(구 자동)
 *   → git commit & push → Action 수집 → git pull → 위 재추출 실행
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MOLIT = join(ROOT, "data/datasets/molit");
const ALL_LINES = ["sinbundang","line2","line3","line4","line5","line6","line7","line8","line9"];
const dsPath = (k)=> join(ROOT, `data/datasets/${k==="sinbundang"?"sinbundang":k}-daejang-2026.json`);

const argv = process.argv.slice(2);
const getArg = (f)=>{ const i=argv.indexOf(f); return i>=0?argv[i+1]:null; };
const collectMonth = getArg("--collect");
// --only <key>: 특정 노선만 재추출·재빌드(line-card.mjs 오케스트레이터가 사용). 없으면 전 노선.
const only = getArg("--only");
const LINES = only ? ALL_LINES.filter(k=>k===only) : ALL_LINES;

// 캐시에 있는 최신월 탐지
function latestMonth(){
  let mx="202601";
  for (const f of readdirSync(MOLIT)){ const m=f.match(/-(\d{6})\.json$/); if(m && m[1]>mx) mx=m[1]; }
  return mx;
}
function monthsInRange(from,to){ const out=[]; let y=+from.slice(0,4),mo=+from.slice(4); const ey=+to.slice(0,4),em=+to.slice(4);
  while(y<ey||(y===ey&&mo<=em)){ out.push(`${y}${String(mo).padStart(2,"0")}`); mo++; if(mo>12){mo=1;y++;} } return out; }

// --collect: 9개 노선이 지나는 모든 구의 collect-request 작성(구→region/gu 표기)
if (collectMonth){
  // 데이터셋 gu 라벨 → collect 표기(수집 CLI가 쓰는 시/구 풀네임)
  const REGION = {
    "강남구":["seoul","강남구"],"서초구":["seoul","서초구"],"송파구":["seoul","송파구"],"강동구":["seoul","강동구"],
    "성동구":["seoul","성동구"],"광진구":["seoul","광진구"],"동대문구":["seoul","동대문구"],"중랑구":["seoul","중랑구"],
    "성북구":["seoul","성북구"],"강북구":["seoul","강북구"],"도봉구":["seoul","도봉구"],"노원구":["seoul","노원구"],
    "은평구":["seoul","은평구"],"서대문구":["seoul","서대문구"],"마포구":["seoul","마포구"],"용산구":["seoul","용산구"],
    "중구":["seoul","중구"],"종로구":["seoul","종로구"],"영등포구":["seoul","영등포구"],"동작구":["seoul","동작구"],
    "관악구":["seoul","관악구"],"금천구":["seoul","금천구"],"구로구":["seoul","구로구"],"강서구":["seoul","강서구"],"양천구":["seoul","양천구"],
    "일산서구":["gyeonggi","고양시일산서구"],"일산동구":["gyeonggi","고양시일산동구"],"덕양구":["gyeonggi","고양시덕양구"],
    "과천":["gyeonggi","과천시"],"안양":["gyeonggi","안양시동안구"],"군포":["gyeonggi","군포시"],"하남":["gyeonggi","하남시"],
    "성남":["gyeonggi","성남시수정구,성남시중원구"],
  };
  const seoul=new Set(), gg=new Set();
  for (const k of LINES){ const ds=JSON.parse(readFileSync(dsPath(k),"utf8"));
    for (const p of ds.picks){ const r=REGION[p.gu]; if(!r){console.log(`  ⚠️ gu 매핑 없음: ${p.gu} (${p.station})`);continue;}
      (r[0]==="seoul"?seoul:gg).add(r[1]); } }
  const jobs=[]; if(seoul.size) jobs.push({region:"seoul",gu:[...seoul].join(","),months:collectMonth});
  if(gg.size) jobs.push({region:"gyeonggi",gu:[...gg].join(","),months:collectMonth});
  const req={ _:`지하철 카드 리프레시 수집 — ${collectMonth}. push 하면 collect-on-request.yml 가 수집.`, requestedAt:collectMonth, jobs, force:false };
  writeFileSync(join(ROOT,"data/collect-request.json"), JSON.stringify(req,null,2)+"\n");
  console.log(`✅ collect-request.json 작성(${collectMonth}). 이제:\n   git add data/collect-request.json && git commit -m "수집: ${collectMonth}" && git push ...\n   → Action 수집 후 git pull → node scripts/refresh-line-cards.mjs --to ${collectMonth}`);
  process.exit(0);
}

const from = getArg("--from") || "202601";
const to   = getArg("--to")   || latestMonth();
const months = monthsInRange(from,to);
const rebuild = !argv.includes("--no-rebuild");
const dry = argv.includes("--dry");   // 매칭만 점검, 데이터셋에 쓰지 않음
console.log(`🔄 리프레시 기간: ${from}~${to} (${months.length}개월)`);

// molit 전 파일에서 area 82~86 최고가 인덱스 — aptNm|umd(정확 매칭 전용)
// aptNm 단독 매칭은 동명이단지(예: 여러 '삼성'·'현대')를 잘못 잡으므로 쓰지 않는다.
const byKey = {};
for (const f of readdirSync(MOLIT)){
  const m=f.match(/-(\d{6})\.json$/); if(!m || !months.includes(m[1])) continue;
  const ym=m[1];
  for (const x of JSON.parse(readFileSync(join(MOLIT,f),"utf8")).trades){
    if (x.canceled || x.area<82 || x.area>86) continue;
    const k=`${x.aptNm}|${x.umdNm}`;
    if (!byKey[k] || x.priceManwon>byKey[k].p) byKey[k]={p:x.priceManwon, ym};
  }
}
const disp = (억)=> (Math.round((억+1e-9)*10)/10).toFixed(1); // 카드 표시값(round-half-up 1자리)

let changed=0; const missList=[];
for (const k of LINES){
  const ds=JSON.parse(readFileSync(dsPath(k),"utf8"));
  for (const p of ds.picks){ if(p.price==null) continue;
    // molit 원본키(srcApt||danji)+umd 정확 매칭만 자동 갱신. enrich-line-src 로 심어둔 srcApt 우선.
    const b = p.umd ? byKey[`${p.srcApt||p.danji}|${p.umd}`] : null;
    if(!b){ missList.push(`[${ds.line?.name||k}] ${p.station} · ${p.danji}${p.umd?"|"+p.umd:" (umd 없음)"}`); continue; }
    const np=Math.round(b.p/100)/100, nd=`${b.ym.slice(0,4)}-${b.ym.slice(4)}`;
    if(disp(np)!==disp(p.price) || nd!==p.deal){   // 표시값이 바뀔 때만 갱신(반올림 잡음 무시)
      console.log(`  · [${ds.line?.name||k}] ${p.station}: ${disp(p.price)}→${disp(np)}억 (${p.deal}→${nd})`);
      p.price=np; p.deal=nd; changed++;
    }
  }
  if(ds.meta) ds.meta.asOf=`${to.slice(0,4)}-${to.slice(4)}`;
  if(!dry) writeFileSync(dsPath(k), JSON.stringify(ds,null,2)+"\n");
}
if(missList.length){ console.log(`\n⚠️ 자동매칭 실패(단지명이 molit 원본과 달라 세션에서 확인 필요) ${missList.length}건:`); missList.forEach(x=>console.log("   - "+x)); }
console.log(`\n표시값 변경 ${changed}건.`);
console.log(`※ 기간 라벨(빌더 subtitle "2026.01~07월"·데이터셋 disclaimer)은 별도 확인 — 창을 넓혔으면 함께 수정.`);

if (dry){
  console.log("→ --dry: 데이터셋 미기록(매칭 점검만).");
} else if (rebuild){
  for (const k of LINES){ spawnSync("node",[`scripts/build-${k}-loop.mjs`],{cwd:ROOT,stdio:"inherit"}); }
  console.log("✅ 재빌드 완료. 렌더·QA·검수 후 confirm.mjs 로 확정.");
} else {
  console.log("→ 재빌드 생략(--no-rebuild). node scripts/build-*-loop.mjs 로 개별 빌드.");
}
