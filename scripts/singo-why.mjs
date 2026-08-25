/**
 * 「이 단지는 왜 신고가 알림에 안 떴나」 — 한 줄로 답하는 진단기.
 *
 * ── 왜 (2026-08-19 오너)
 * 오너가 다른 서비스의 카드(실까 「래미안안양메가트리아 59.65㎡ 10억 500만 신고가」)를 보고
 * *"오늘 받은 자동 신고가 텔레그램에 왜 안양메가트리아 없을까?"* 라고 물었다.
 * 답을 내는 데 **파일 다섯 개를 손으로 뒤져야 했다** — 명부·최고가 인덱스·원자료 월별 파일·
 * 신고가 로그·판정 코드. 그리고 답은 결국 한 줄이었다:
 *
 *   메가트리아 59타입의 2020년 이후 최고가는 이미 **10억 1,800만**(59.75㎡·2026-07-21)이라
 *   8/14 의 10억 500만은 **1,300만원 모자란다.** 우리 배관이 맞았다.
 *
 * 같은 질문은 앞으로도 계속 온다(다른 서비스가 먼저 올리면 오너는 반드시 되묻는다).
 * 그때마다 손으로 뒤지면 **답이 세션마다 달라진다.** 그래서 자리를 만든다.
 *
 * ── 무엇을 보나 (네트워크 안 쓴다 — 저장소 안의 것만 읽는다)
 *   ① 1000세대 명부에 있나 (없으면 애초에 대상이 아니다)
 *   ② 최고가 인덱스의 그 단지·타입 최고가 = **넘어야 할 문턱**
 *   ③ 로컬 원자료에 남아 있는 **서브면적별 최고가** (59.65 / 59.75 / 59.94 …)
 *      ← 오늘 같은 질문의 핵심이 여기 있다. 우리는 이들을 **한 칸으로 묶는다.**
 *   ④ 신고가 로그에 이 단지가 뜬 적이 있나
 *
 * ⚠️ 원자료(`data/datasets/molit/`)는 최근 달이 커밋돼 있지 않을 수 있다.
 *    ③은 "저장소에 있는 범위 안에서"의 답이고, 그 범위를 화면에 같이 적는다.
 *    ②의 인덱스는 최근 달까지 반영돼 있으니 **판정은 ②로 한다.**
 *
 * 실행:
 *   node scripts/singo-why.mjs 메가트리아
 *   node scripts/singo-why.mjs 래미안안양메가트리아 --type 59 --price 100500
 *   node scripts/singo-why.mjs 메가트리아 --json
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => join(ROOT, p);
const D = R("data/datasets");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const arg = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
/* 값을 받는 플래그의 **다음 한 칸**은 단지명이 아니다 — 그걸 건너뛰고 첫 자유 인자를 집는다.
   (`--json` 처럼 값이 없는 플래그가 섞여도 어긋나지 않게 목록으로 구분한다.) */
const VALUED = new Set(["--type", "--price"]);
let query = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) {
    if (VALUED.has(argv[i])) i++;
    continue;
  }
  query = argv[i];
  break;
}

if (!query) {
  console.error("사용법: node scripts/singo-why.mjs <단지명 일부> [--type 59|84] [--price 100500] [--json]");
  process.exit(2);
}

/* ── 판정 코드와 **같은 규칙**을 쓴다. 여기서 따로 정의하면 진단기와 배관이 갈린다.
   (parse/singo.ts 는 TS 라 그대로 import 할 수 없어 옮겨 적었다 — 바뀌면 여기도 바꾼다.
    셋 다 바뀌는 일이 없게 selftest 가 값을 대조한다.) */
const BASELINE_LABEL = "2020년 이후";
const areaType = (a) => (a >= 56 && a <= 62 ? "59" : a >= 82 && a <= 85.5 ? "84" : null);
const normAptName = (raw) =>
  String(raw ?? "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[\s·.\-_]/g, "")
    .trim();

const eok = (manwon) => {
  if (manwon == null) return "—";
  const s = (manwon / 10000).toFixed(2).replace(/\.?0+$/, "");
  return `${s}억`;
};
const man = (v) => Number(v).toLocaleString("ko-KR");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

const out = { query, findings: [], verdict: null };
const say = (s) => { if (!flag("json")) console.log(s); };

/* ── ① 1000세대 명부
 *
 * ⚠️ **대장 이름으로만 찾으면 틀린 답을 한다** (2026-08-25 실제로 틀렸다).
 * 오너가 「위례24단지(꿈에그린)」를 물었을 때 이 진단기는 "명부에 없습니다"라고 답했다.
 * 그런데 있었다 — 명부의 이름이 「송파꿈에그린아파트」였을 뿐이다.
 * **틀린 답은 답이 없는 것보다 나쁘다.** 그래서 세 갈래로 찾는다:
 *   ⑴ 대장 이름  ⑵ 실거래 신고명(원자료에서 되짚어 대장으로)  ⑶ 지번
 * 어느 길로 찾았는지 화면에 적는다 — 그게 곧 "왜 못 이었나"의 답이기도 하다. */
const universe = readJson(join(D, "apt-universe.json"));
const hhldAll = existsSync(join(D, "apt-hhld.json")) ? readJson(join(D, "apt-hhld.json")).byKapt : {};
const q = normAptName(query);

/** 대장 주소 → 지번 (수집기의 jibunFromAddr 과 같은 규칙) */
const jibunFromAddr = (addr) => {
  const toks = String(addr ?? "").trim().split(/\s+/);
  const i = toks.findIndex((t) => /[가동읍면리]$/.test(t));
  if (i < 0) return null;
  const t = toks[i + 1];
  return t && /^\d+(-\d+)?-?$/.test(t) ? t.replace(/-+$/, "") : null;
};

const byName = universe.items.filter((it) => normAptName(it.kaptName).includes(q));

/* ⑵·⑶ — 실거래 신고명이 질의와 맞는 거래를 원자료에서 찾아, 그 지번으로 명부를 되짚는다. */
const viaTrade = new Map();
const molitDir = join(D, "molit");
if (existsSync(molitDir)) {
  for (const f of readdirSync(molitDir).filter((f) => f.endsWith(".json"))) {
    for (const t of readJson(join(molitDir, f)).trades) {
      if (!normAptName(t.aptNm).includes(q)) continue;
      const lawd = f.split("-")[0];
      const jb = String(t.jibun ?? "").replace(/-+$/, "");
      for (const it of universe.items) {
        if (it.lawdCd !== lawd || it.umd !== t.umdNm) continue;
        if (jibunFromAddr(hhldAll[it.kaptCode]?.addr) !== jb) continue;
        viaTrade.set(it.kaptCode, { it, tradeName: t.aptNm, jibun: jb });
      }
    }
  }
}
const inRoster = [...byName, ...[...viaTrade.values()].map((v) => v.it).filter((it) => !byName.some((b) => b.kaptCode === it.kaptCode))];

say(`\n🔎 "${query}" — 신고가 알림 진단  (기준: ${BASELINE_LABEL} · ${universe.meta.minHhld}세대 이상 명부 · 전용 59·84 타입)\n`);

if (!inRoster.length) {
  say(`① 명부  ⛔ **1000세대 이상 명부에 없습니다** — 애초에 판정 대상이 아닙니다.`);
  say(`        (대장 이름·실거래 신고명·지번 세 갈래로 다 찾아봤습니다.)`);
  say(`        (명부 ${universe.meta.count}개 단지 · 갱신 ${universe.meta.updatedAt})`);
  out.verdict = "명부에 없음";
  out.findings.push({ step: "roster", ok: false });
  if (flag("json")) console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}
for (const it of inRoster) {
  const v = viaTrade.get(it.kaptCode);
  const how = byName.some((b) => b.kaptCode === it.kaptCode)
    ? "대장 이름으로 찾음"
    : `⚠️ **이름으로는 못 찾고 지번으로 찾음** — 실거래 「${v.tradeName}」 ↔ 대장 「${it.kaptName}」 (지번 ${v.jibun})`;
  say(`① 명부  ✅ ${it.gu} ${it.umd} · ${it.kaptName} · ${man(it.hhld)}세대`);
  say(`        ${how}`);
}
out.findings.push({ step: "roster", ok: true, items: inRoster });

const wantType = arg("type");
const price = arg("price") ? Number(arg("price")) : null;

for (const it of inRoster) {
  const peakPath = join(D, "molit-peak", `${it.lawdCd}.json`);
  if (!existsSync(peakPath)) {
    say(`\n② 문턱  ⚠️ ${it.gu} 최고가 인덱스가 아직 없습니다 (${peakPath.replace(ROOT + "/", "")})`);
    continue;
  }
  const pk = readJson(peakPath);
  /* ⚠️ 인덱스·원자료의 키는 **실거래 신고명**이다(대장 이름이 아니다).
     지번으로 찾은 단지는 두 이름이 다르므로, 여기서 대장 이름을 쓰면
     "인덱스에 없습니다"라는 **또 한 번의 틀린 답**이 나온다(2026-08-25에 실제로 그랬다). */
  const vt = viaTrade.get(it.kaptCode);
  const norm = normAptName(vt ? vt.tradeName : it.kaptName);
  const mine = Object.entries(pk.peaks).filter(([k]) => {
    const [, , nm] = k.split("|");
    return nm === norm;
  });

  say(`\n② 문턱  ${vt ? `${vt.tradeName}(대장: ${it.kaptName})` : it.kaptName} 의 ${BASELINE_LABEL} 최고가 (인덱스 갱신 ${pk.meta.updatedAt} · ${pk.meta.doneMonths.length}개월 반영)`);
  if (!mine.length) {
    say(`        ⚠️ 인덱스에 이 단지가 없습니다 — 59·84 타입 거래가 아직 한 건도 안 잡혔거나, 이름 표기가 다릅니다.`);
  }
  for (const [k, v] of mine) {
    const t = k.split("|")[3];
    if (wantType && t !== wantType) continue;
    say(`        · 전용 ${t}타입  **${eok(v.priceManwon)}** (${man(v.priceManwon)}만 · ${v.area}㎡ · ${v.floor}층 · ${v.date})`);
  }
  out.findings.push({ step: "peak", lawdCd: it.lawdCd, peaks: Object.fromEntries(mine) });

  /* ── ③ 서브면적별 최고가 — "왜 문턱이 저기냐"의 답이 여기 있다 */
  const dir = join(D, "molit");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.startsWith(`${it.lawdCd}-`)).sort() : [];
  if (files.length) {
    const bySub = new Map();
    for (const f of files) {
      for (const r of readJson(join(dir, f)).trades) {
        if (normAptName(r.aptNm) !== norm) continue;
        if (r.canceled) continue;
        const t = areaType(r.area);
        if (!t || (wantType && t !== wantType)) continue;
        const key = `${t}|${r.area}`;
        const cur = bySub.get(key);
        if (!cur || r.priceManwon > cur.priceManwon) bySub.set(key, r);
      }
    }
    const span = `${files[0].split("-")[1].slice(0, 6)}~${files.at(-1).split("-")[1].slice(0, 6)}`;
    say(`\n③ 같은 타입 안의 서브면적별 최고가  (저장소에 남아 있는 원자료 ${span} 범위)`);
    if (!bySub.size) say(`        (해당 없음)`);
    for (const [key, r] of [...bySub.entries()].sort((a, b) => b[1].priceManwon - a[1].priceManwon)) {
      const [t, a] = key.split("|");
      say(`        · ${t}타입 ${a}㎡  ${eok(r.priceManwon)} (${r.date} · ${r.floor}층)`);
    }
    if (bySub.size > 1) {
      say(`        ↑ 우리는 이들을 **한 칸(전용 ${wantType ?? "59/84"}타입)으로 묶어** 판정합니다.`);
      say(`          면적별로 가르는 서비스와 답이 갈리는 지점이 정확히 여기입니다 (company/CEO.md 2026-08-19).`);
    }
    out.findings.push({ step: "subAreas", span, items: Object.fromEntries(bySub) });
  }

  /* ── ④ 판정 */
  if (price != null) {
    const t = wantType ?? null;
    const cands = mine.filter(([k]) => !t || k.split("|")[3] === t);
    for (const [k, v] of cands) {
      const tt = k.split("|")[3];
      const gap = price - v.priceManwon;
      say(`\n④ 판정  전용 ${tt}타입 ${eok(price)} vs 문턱 ${eok(v.priceManwon)}`);
      if (gap === 0) {
        say(`        ↩︎ 문턱과 **같은 값**입니다. 인덱스가 이미 이 거래로 갱신됐을 수 있습니다`);
        say(`          (인덱스는 판정 직후 갱신되므로, 지나간 건을 되물으면 자기 자신이 문턱으로 보입니다).`);
        say(`          ⑤ 알림 이력에 같은 날짜가 있으면 그때 신고가로 잡힌 것입니다.`);
        out.verdict = "문턱과 동일(이미 반영 가능성)";
      } else if (gap > 0) {
        say(`        ✅ **신고가입니다** — ${man(gap)}만원 갱신`);
        out.verdict = "신고가";
      } else {
        say(`        ❌ **신고가가 아닙니다** — ${man(-gap)}만원 모자랍니다 (문턱: ${v.area}㎡ ${v.date})`);
        out.verdict = "문턱 미달";
      }
    }
  }
}

/* ── ⑤ 알림에 뜬 적 있나 */
const logDir = join(D, "singo-log");
const hits = [];
if (existsSync(logDir)) {
  for (const f of readdirSync(logDir).filter((f) => f.endsWith(".json"))) {
    for (const h of readJson(join(logDir, f)).hits ?? []) {
      if (normAptName(h.aptNm).includes(q)) hits.push(h);
    }
  }
}
say(`\n⑤ 알림 이력  ${hits.length ? `${hits.length}건` : "없음 (신고가 로그는 2026-08 부터 쌓입니다)"}`);
for (const h of hits.sort((a, b) => (a.foundOn < b.foundOn ? 1 : -1))) {
  say(`        · ${h.foundOn} 확인 · ${h.type}타입 ${eok(h.priceManwon)} (${h.area}㎡ ${h.floor}층 · ${h.date} 계약 · 직전 ${eok(h.prevPeakManwon)})`);
}
out.findings.push({ step: "alerts", hits });

say("");
if (flag("json")) console.log(JSON.stringify(out, null, 2));
