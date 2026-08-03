/**
 * 지하철 노선 시세 카드 — 캡션 일괄 생성(데이터셋 → 시세 순위 리스트).
 * 데이터를 갱신했으면 이 스크립트로 캡션도 다시 뽑는다. 손으로 순위를 고치지 않는다.
 * 실행: node scripts/gen-line-captions.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const ALL_SETS = [
  ["sinbundang","신분당선"],["line2","2호선"],["line3","3호선"],["line4","4호선"],["line5","5호선"],
  ["line6","6호선"],["line7","7호선"],["line8","8호선"],["line9","9호선"],
];
// --only <key>: 한 노선 캡션만 재생성(통합본은 그대로 두려면 --no-all).
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx>=0 ? process.argv[onlyIdx+1] : null;
const SETS = only ? ALL_SETS.filter(s=>s[0]===only) : ALL_SETS;
const dsFile = (k)=> join(ROOT, `data/datasets/${k}-daejang-2026.json`);
const capFile = (k)=> join(ROOT, `data/review/captions/${k}-loop.txt`);
const px = (p)=> (Math.round((p+1e-9)*10)/10).toFixed(1);
const clean = (s)=> s.replace(/^\S*역\s+/,"");
const SIG = (line)=> `\n저장해두고 확인해보세요 👀\n\n—\n📊 출처 · 국토부 실거래가\n(2026년 1~7월 · 전용 84㎡)\n\n· · ·\n부동산·경제·트렌드를 한 눈에, 위릿.\n정확한 데이터, 감각적인 카드.\n매일 한 장, 내 맘속에 저장. 🫶\n\n#${line} #역세권 #대장아파트 #아파트시세 #부동산\n`;

let all = "";
for (const [key,line] of SETS){
  const ds = JSON.parse(readFileSync(dsFile(key),"utf8"));
  const picks = ds.picks.filter(p=>p.price!=null).slice().sort((a,b)=>b.price-a.price);
  let out = `${line} 역세권,\n대장 APT 지금 얼마일까요? 🚇\n\n📊 시세 순위 (전용 84㎡ 실거래 최고가)\n`;
  // 전용면적 예외(84㎡ 아님)는 헤더가 84㎡라 오해 소지 → 해당 픽만 전용면적 병기.
  picks.forEach((p,i)=>{ const meta = p.areaNote ? `${p.areaNote}·${p.built}년식` : `${p.built}년식`;
    out += `${i+1}위. ${p.station}역 : ${px(p.price)}억 - ${clean(p.danji)}(${meta})\n`; });
  out += SIG(line);
  writeFileSync(capFile(key), out); // {set}-loop.txt
  all += `═══════════════════════════════════════\n  ▸ ${key}-loop\n═══════════════════════════════════════\n\n${out}\n\n`;
}
if(!only){ writeFileSync(join(ROOT,"data/review/captions/_ALL-9lines.txt"), all); console.log("✅ 캡션 9종 + 통합본 재생성"); }
else console.log(`✅ 캡션 재생성: ${SETS.map(s=>s[0]).join(", ")}`);
