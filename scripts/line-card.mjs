/**
 * 원커맨드 — "N호선 역세권 대장 아파트 시세" 한 방에.
 *
 * 새 세션이 오너의 자연어 요청("3호선 역세권 대장 아파트 시세 작업해줘")을 받으면
 * 이 스크립트 하나만 돌리면 된다: 데이터 리프레시 → 캡션 → 카드 빌드 → 렌더 → 디자인 QA.
 * 사람이 손으로 순위를 고치거나 숫자를 지어내지 않는다(오보 0). 판단이 필요없다 = 스크립트가 한다.
 *
 * 실행:
 *   node scripts/line-card.mjs 3호선
 *   node scripts/line-card.mjs 신분당            # 별칭 허용
 *   node scripts/line-card.mjs "3호선 역세권 대장 아파트 시세"   # 문장째 넘겨도 됨
 *   node scripts/line-card.mjs 3호선 --collect 202608   # 새 달 수집부터(→ push→pull 후 다시 실행)
 *   node scripts/line-card.mjs 3호선 --no-render         # JSON 까지만
 *
 * 나오는 것:
 *   data/datasets/{key}-daejang-2026.json  (리프레시된 시세)
 *   data/review/captions/{key}-loop.txt    (재생성된 캡션)
 *   data/content/{date}/{key}-loop.json    (카드 JSON)
 *   data/out/{date}/{key}-loop.png         (렌더 PNG) + 디자인 QA 결과
 */
import { spawnSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const getArg = (f)=>{ const i=argv.indexOf(f); return i>=0?argv[i+1]:null; };
const flag = (f)=> argv.includes(f);

// ── 자연어 → 노선 키 ────────────────────────────────────────────────
// "3호선 역세권 대장 아파트 시세" 같은 문장/별칭에서 노선을 뽑는다.
const phrase = argv.filter(a=>!a.startsWith("--")).join(" ");
function resolveLine(s){
  const t = (s||"").replace(/\s/g,"");
  if(/신분당/.test(t)) return ["sinbundang","신분당선"];
  const m = t.match(/([2-9])호선/);
  if(m) return [`line${m[1]}`, `${m[1]}호선`];
  // 숫자만 준 경우
  const n = t.match(/(^|[^0-9])([2-9])([^0-9]|$)/);
  if(n) return [`line${n[2]}`, `${n[2]}호선`];
  return null;
}
const resolved = resolveLine(phrase);
if(!resolved){
  console.error(`❌ 노선을 못 알아봤어요: "${phrase}"\n   예) node scripts/line-card.mjs 3호선  ·  신분당  ·  "5호선 역세권 대장 아파트 시세"`);
  process.exit(1);
}
const [KEY, LABEL] = resolved;
const dsFile = join(ROOT, `data/datasets/${KEY}-daejang-2026.json`);
if(!existsSync(dsFile)){
  console.error(`❌ ${LABEL}(${KEY}) 데이터셋이 아직 없어요: ${dsFile}\n   신규 노선은 docs/LINE_CARDS.md §7 절차(큐레이션·에이전트 선정)를 먼저 밟아야 합니다.`);
  process.exit(1);
}
console.log(`\n🚇 ${LABEL} 카드 — 원커맨드 시작 (key=${KEY})\n`);

const run = (label, cmd, args)=>{
  console.log(`\n─── ${label} ───`);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  if(r.status!==0){ console.error(`❌ 실패: ${label} (exit ${r.status})`); process.exit(r.status||1); }
};

// ── (선택) 새 달 수집 ────────────────────────────────────────────────
const collect = getArg("--collect");
if(collect){
  run(`molit 수집요청 작성 (${collect})`, "node", ["scripts/refresh-line-cards.mjs","--only",KEY,"--collect",collect]);
  console.log(`\n⏸  여기서 멈춥니다. 아래를 실행해 캐시를 받은 뒤 --collect 없이 다시 돌리세요:`);
  console.log(`   git add data/collect-request.json && git commit -m "수집: ${collect}" && git push <PAT-remote>`);
  console.log(`   (Action 수집 완료 후) git pull  →  node scripts/line-card.mjs ${LABEL} --to ${collect}`);
  process.exit(0);
}

// ── 1) 데이터 리프레시(같은 단지 84㎡ 최고가 재추출, 오보 0) ─────────────
const to = getArg("--to");
run("① 데이터 리프레시", "node",
  ["scripts/refresh-line-cards.mjs","--only",KEY,"--no-rebuild", ...(to?["--to",to]:[])]);

// ── 2) 캡션 재생성(시세 순위, 코드 생성) ────────────────────────────────
run("② 캡션 재생성", "node", ["scripts/gen-line-captions.mjs","--only",KEY]);

// ── 3) 카드 빌드(JSON) ──────────────────────────────────────────────
const date = getArg("--date") || new Date().toISOString().slice(0,10);
run("③ 카드 빌드", "node", [`scripts/build-${KEY}-loop.mjs`, date]);

// ── 4) 렌더 + 디자인 QA ─────────────────────────────────────────────
if(flag("--no-render")){
  console.log(`\n✅ ${LABEL} — JSON 까지 완료(--no-render). data/content/${date}/${KEY}-loop.json`);
  process.exit(0);
}
// 카드 JSON 경로(최근 날짜 폴더에서 찾기)
const CONTENT = join(ROOT,"data/content");
const days = existsSync(CONTENT) ? readdirSync(CONTENT).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse() : [];
const cardPath = days.map(d=>join(CONTENT,d,`${KEY}-loop.json`)).find(existsSync);
if(!cardPath){ console.error("❌ 빌드된 카드 JSON 을 못 찾음"); process.exit(1); }
const outDir = join(ROOT,"data/out",date);
run("④ 렌더(PNG)", "pnpm", ["-s","--filter","@wirit/renderer","render","--data",cardPath,"--out",outDir]);
run("⑤ 디자인 QA", "pnpm", ["-s","--filter","@wirit/renderer","qa",cardPath]);

console.log(`\n✅ ${LABEL} 카드 완성`);
console.log(`   시세:   data/datasets/${KEY}-daejang-2026.json`);
console.log(`   캡션:   data/review/captions/${KEY}-loop.txt`);
console.log(`   카드:   ${cardPath.replace(ROOT+"/","")}`);
console.log(`   PNG:    data/out/${date}/${KEY}-loop-p1.png`);
console.log(`\n다음: PNG·캡션 확인 → 오너 확정 시 node scripts/confirm.mjs`);
