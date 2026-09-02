#!/usr/bin/env node
/**
 * 📋 「출발선은 같았다」 안건표 — 오너가 **여기서 골라** 다음 카드를 정한다
 *
 *   node scripts/gap-agenda.mjs            → data/gap-안건.txt
 *   node scripts/gap-agenda.mjs --top 20   → 상위 20건만
 *
 * ── 왜 따로 만드나
 * `find-gap-pairs.mjs` 는 편마다 파일을 하나씩 낸다(`gap-ep1.md`·`gap-ep2.md`).
 * 고르는 사람 입장에서는 **번호가 이어지는 한 장**이 필요하다 — 두 파일을 오가며 고를 수는 없다.
 *
 * ── 이 표에만 있는 칸: **지금 바로 만들 수 있나**
 * 곡선을 그리려면 그 단지가 속한 구의 **모든 달**이 캐시에 있어야 한다(없는 달이 하나라도
 * 있으면 빌더가 던진다 — 「거래가 없던 달」과 「안 받아 온 달」을 같게 그릴 수 없으므로).
 * 그래서 카드마다 **빈 칸 수 = 필요한 국토부 호출 수**를 세어 적는다.
 * 이 숫자를 모르면 「이거 만들어 줘」가 반나절짜리인지 5분짜리인지 알 수 없다.
 *
 * 이 스크립트는 **읽기만 한다** — 네트워크도, 수집도 하지 않는다.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => join(ROOT, p);
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

const TOP = Number(arg("top", 999));
const CURVE_FROM = arg("from", "202001");
const CURVE_TO = arg("to", "202607");
const OUT = R(arg("out", "data/gap-안건.txt"));

/** 이미 만들어 확정한 카드 — 안건표에서 「완료」로 표시한다 */
const DONE = new Set(["gap-ep1-1"]);

function monthRange(from, to) {
  const out = [];
  let y = +from.slice(0, 4), m = +from.slice(4);
  const ey = +to.slice(0, 4), em = +to.slice(4);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}${String(m).padStart(2, "0")}`);
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}
const MONTHS = monthRange(CURVE_FROM, CURVE_TO);

/** 그 구에서 곡선 구간 중 캐시에 없는 달 수 = 그 구를 채우는 데 드는 호출 수 */
const holesCache = new Map();
function holes(lawd) {
  if (holesCache.has(lawd)) return holesCache.get(lawd);
  let n = 0;
  for (const ym of MONTHS) if (!existsSync(R(`data/datasets/molit-monthly/${lawd}/${ym}.json`))) n++;
  holesCache.set(lawd, n);
  return n;
}

const eok = (m) => (m / 10000).toFixed(1);
const pad = (s, n) => String(s) + " ".repeat(Math.max(0, n - [...String(s)].reduce((w, c) => w + (c.charCodeAt(0) > 0x1100 ? 2 : 1), 0)));

const SHORT_GU = { 성남시분당구: "분당", 성남시중원구: "성남중원", 성남시수정구: "성남수정",
  안산시상록구: "안산", 안산시단원구: "안산", 안양시동안구: "평촌", 안양시만안구: "안양",
  고양시일산동구: "일산", 고양시일산서구: "일산", 고양시덕양구: "덕양",
  수원시영통구: "수원영통", 수원시장안구: "수원장안", 수원시권선구: "수원권선", 수원시팔달구: "수원팔달",
  용인시수지구: "수지", 용인시기흥구: "기흥", 용인시처인구: "처인",
  화성시동탄구: "동탄", 화성시병점구: "병점", 화성시만세구: "화성", 화성시효행구: "화성",
  부천시원미구: "부천", 부천시소사구: "부천", 부천시오정구: "부천" };
const shortGu = (g) => SHORT_GU[g] ?? g.replace(/시$/, "");
const shortName = (s) => s.replace(/\s*\([^)]*\)\s*$/, "").trim() || s;

const rows = [];
for (const [set, band] of [["gap-ep1", "그때 10억 이하"], ["gap-ep2", "그때 15억 이상"]]) {
  const p = R(`data/datasets/${set}.json`);
  if (!existsSync(p)) continue;
  const d = JSON.parse(readFileSync(p, "utf8"));
  d.picks.forEach((g, i) => {
    const lawds = [...new Set(g.members.map((m) => m.lawd))];
    rows.push({
      set, band, pick: i + 1, label: `${set}-${i + 1}`,
      gapEok: g.gapEok, baseFrom: g.baseFrom, baseTo: g.baseTo,
      members: g.members,
      calls: lawds.reduce((s, l) => s + holes(l), 0),
      lawds,
    });
  });
}
rows.sort((a, b) => b.gapEok - a.gapEok);
/* `--top N` — 다 보여 주면 41건이라 고르기 어려울 때 잘라 낸다.
   ⚠️ 이미 만든 카드는 잘라 내지 않는다(무엇이 끝났는지가 안 보이면 표가 거짓말을 한다). */
const shown = rows.filter((r, i) => i < TOP || DONE.has(r.label));

const ready = shown.filter((r) => r.calls === 0 && !DONE.has(r.label));
const done = shown.filter((r) => DONE.has(r.label));

const L = [];
L.push("「출발선은 같았다」 — 카드 안건표");
L.push(`만든 날 ${new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10)} (KST) · 이 파일은 node scripts/gap-agenda.mjs 가 만든다`);
L.push("");
L.push("고르는 법 — [ ] 안의 **선택번호**만 말씀하시면 그 카드를 만듭니다.");
L.push("(선택번호는 이 표에서만 쓰는 번호입니다. 카드에 찍히는 연재번호 #N 은 발행 순서대로 따로 붙습니다)");
L.push("");
L.push("각 줄의 뜻");
L.push("  · 「격차」  = 가장 많이 오른 곳과 가장 덜 오른 곳의 지금 값 차이. 이 순서로 줄 세웠습니다");
L.push("  · 「그때」  = 2019.11~2020.03 실거래 최고가. 세 단지가 ±3% 안에서 겹칩니다");
L.push("  · 「자료」  = 곡선을 그리려면 더 받아야 하는 국토부 호출 수.");
L.push("             0 이면 지금 바로 만들 수 있고, 그 외에는 수집을 한 번 걸어야 합니다");
L.push("             (100회당 대략 2~3분. 하루 예산은 아침 알림 몫을 빼고 약 1,000회)");
L.push("");
L.push("⚠️ 이 카드는 평형을 섞어 묶습니다(25평·34평이 함께 나옵니다).");
L.push("   「같은 집끼리의 비교」가 아니라 **그때 같은 돈이면 살 수 있던 집들** 의 비교입니다.");
L.push("");
L.push(`총 ${shown.length}건 · 지금 바로 만들 수 있는 것 ${ready.length}건 · 완료 ${done.length}건`);
L.push("=".repeat(78));
L.push("");

const block = (r, no) => {
  const tag = DONE.has(r.label) ? "✅ 완료" : r.calls === 0 ? "🟢 바로 가능" : `🟡 자료 ${r.calls}회`;
  const out = [];
  out.push(`[${String(no).padStart(2)}] 격차 ${pad(r.gapEok.toFixed(1) + "억", 7)} · 그때 ${eok(r.baseFrom)}~${eok(r.baseTo)}억 · ${r.band} · ${tag}`);
  r.members.forEach((m, k) => {
    const mark = k === 0 ? "  ▲" : k === r.members.length - 1 ? "  ▼" : "  ·";
    out.push(`${mark} ${pad(`${shortGu(m.gu)} ${shortName(m.apt)} ${m.pyeong}`, 34)} ${pad(eok(m.base) + "억", 7)} → ${pad(eok(m.now) + "억", 8)} (${m.ratio.toFixed(2)}배)`);
  });
  if (DONE.has(r.label)) {
    out.push(`     → 발행 준비 끝. 「출발선은 같았다 #1」 (확정 md5 1c508ee2bec5 · ZIP 전달 완료)`);
  } else {
    out.push(`     만들기: node scripts/build-gap-duel.mjs --set ${r.set} --pick ${r.pick} --label ${r.label}`);
    if (r.calls) out.push(`     먼저 수집: ${r.lawds.length}개 구 · 약 ${r.calls}회`);
  }
  out.push("");
  return out;
};

shown.forEach((r, i) => L.push(...block(r, i + 1)));

L.push("=".repeat(78));
L.push("고르실 때 참고");
L.push("");
L.push("· 격차가 큰 순서지만, **공감이 큰 것이 반드시 위에 있지는 않습니다.**");
L.push("  그때 7억대에서 갈린 이야기가 20억대에서 갈린 이야기보다 반응이 클 수 있습니다.");
L.push("· 한 게시물(캐러셀)로 묶으실 거면 **같은 구가 두 번 나오지 않게** 고르시는 편이 낫습니다.");
L.push("· 「🟡 자료 N회」가 여럿이어도 **구가 겹치면 한 번에 받습니다** — 골라 주시면 묶어서 겁니다.");
L.push("");
L.push(`· 지금 캐시가 찬 구는 세 곳뿐입니다(분당·성북·안산). 나머지는 구마다 69개월이 비어 있어`);
L.push(`  한 구당 69회가 듭니다. 매일 06:40 정기 백필이 나흘에 걸쳐 전부 채우면 이 표의`);
L.push(`  「자료」 칸은 모두 0 이 됩니다 — 급하지 않으시면 기다리는 편이 호출을 아낍니다.`);
L.push("");
writeFileSync(OUT, L.join("\n"), "utf8");
console.log(L.slice(0, 20).join("\n"));
console.log(`…\n→ ${OUT.replace(ROOT + "/", "")} (총 ${shown.length}건 · 바로 가능 ${ready.length}건)`);
