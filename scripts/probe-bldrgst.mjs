#!/usr/bin/env node
/**
 * 🏗️ 건축물대장 전유공용면적 탐침 v2 — 공급면적을 **실측**으로 가져올 수 있나
 *
 * 오너 지시(2026-08-16d): 단지 서칭은 전용 59/84 로 하되, **카드에는 실제 공급평수**를 적는다.
 * 전용률 환산은 단지 평균이라 타입별로 어긋난다(주거공용이 면적이 아니라 세대 단위로 걸려서
 * 작은 평형일수록 전용률이 낮다). 그래서 환산을 거치지 않고 **호별 실측**을 노린다.
 *
 * ── v1 에서 배운 것 (2026-08-16 실측)
 * · `DATA_GO_KR_API_KEY` 로 열린다(MOLIT 키가 아니다).
 * · 한 번에 100줄까지만 온다 → **쪽을 넘겨 전부 받아야 한다.**
 * · 첫 호가 상가(`주상가동 208호 · 생활편익시설`)로 잡혔다 → **아파트 호를 골라야 한다.**
 *
 * ── 이 스크립트는 여전히 판단하지 않는다
 *   공급면적 = 전유 + **주거**공용.  공용 줄에는 지하주차장·펌프실 같은 **기타공용**이 섞여 있다.
 *   무엇을 걸러야 하는지는 **응답을 보고** 정한다. 그래서 필터를 짜 넣지 않고,
 *   후보 셈법 몇 가지를 **나란히 찍어** 사람이 고르게 한다(오보 0 — 추측으로 면적을 만들지 않는다).
 *
 * 실행: node scripts/probe-bldrgst.mjs 4111710700:488:84.92 4111113300:333:59.98 …
 *        (bjdCode 10자리 : 지번 : 맞춰볼 전용면적)
 */
import { writeFileSync } from "node:fs";

const KEYS = [
  ["DATA_GO_KR_API_KEY", process.env.DATA_GO_KR_API_KEY],
  ["MOLIT_API_KEY", process.env.MOLIT_API_KEY],
].filter(([, v]) => v);
if (!KEYS.length) { console.error("::error::DATA_GO_KR_API_KEY 도 MOLIT_API_KEY 도 없습니다"); process.exit(1); }

const URL_BASE = "https://apis.data.go.kr/1613000/BldRgstHubService/getBrExposPubuseAreaInfo";
const encKey = (k) => (/%[0-9A-Fa-f]{2}/.test(k) ? k : encodeURIComponent(k));
const pad4 = (s) => String(s ?? "").replace(/\D/g, "").padStart(4, "0").slice(-4);
const PY = 3.305785;

async function get(url) {
  for (let i = 0; i < 2; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "wirit-collector/0.1" } });
      clearTimeout(t);
      return { status: res.status, body: await res.text() };
    } catch (e) {
      if (i === 1) return { status: 0, body: `fetch failed: ${String(e?.message ?? e)}` };
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

function rows(raw) {
  try {
    const j = JSON.parse(raw);
    const it = j?.response?.body?.items?.item ?? j?.response?.body?.item;
    if (it) return Array.isArray(it) ? it : [it];
  } catch {}
  const out = [];
  for (const m of raw.matchAll(/<item>[\s\S]*?<\/item>/g)) {
    const o = {};
    for (const f of m[0].matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) o[f[1]] = f[2].trim();
    out.push(o);
  }
  return out;
}
function totalOf(raw) {
  try { return Number(JSON.parse(raw)?.response?.body?.totalCount) || 0; } catch {}
  return Number(raw.match(/<totalCount>(\d+)<\/totalCount>/)?.[1] || 0);
}
function apiErr(raw) {
  const m = raw.match(/<returnAuthMsg>([\s\S]*?)<\/returnAuthMsg>|"resultMsg"\s*:\s*"([^"]+)"|<errMsg>([\s\S]*?)<\/errMsg>/);
  const msg = (m?.[1] || m?.[2] || m?.[3] || "").trim();
  return msg && !/^NORMAL/i.test(msg) && !/정상/.test(msg) ? msg : "";
}

/** 쪽을 넘겨 전부 받는다 */
async function fetchAll(key, sigunguCd, bjdongCd, bun, ji, log) {
  const all = [];
  let total = Infinity;
  for (let page = 1; page <= 80 && all.length < total; page++) {
    const url = `${URL_BASE}?serviceKey=${encKey(key)}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}`
      + `&platGbCd=0&bun=${bun}&ji=${ji}&numOfRows=100&pageNo=${page}&_type=json`;
    const { status, body } = await get(url);
    const err = apiErr(body);
    if (status !== 200 || err) { log.push(`  ⚠️ ${page}쪽에서 멈춤: ${err || `HTTP ${status}`}`); break; }
    if (page === 1) total = totalOf(body) || 0;
    const rs = rows(body);
    if (!rs.length) break;
    all.push(...rs);
  }
  return { all, total };
}

const targets = process.argv.slice(2).filter((a) => /^\d{10}:/.test(a));
if (!targets.length) { console.error("::error::bjdCode:지번[:전용면적] 을 하나 이상 주세요"); process.exit(1); }

const L = ["# 건축물대장 전유공용면적 탐침 v2 — 공급면적을 실측할 수 있나", ""];
L.push("> 오너 지시(08-16d): 카드에 **실제 공급평수**를 적는다. 환산이 아니라 실측을 노린다.");
L.push("> **공급면적 = 전유 + 주거공용.** 공용 줄에 지하주차장·펌프실 같은 기타공용이 섞여 있다.");
L.push("> 필터를 짜 넣지 않았다 — **후보 셈법을 나란히 찍어** 사람이 고르게 한다.", "");

let anyOk = false;

for (const t of targets) {
  const [bjd, jibun, wantArea] = t.split(":");
  const sigunguCd = bjd.slice(0, 5), bjdongCd = bjd.slice(5, 10);
  const [bunRaw, jiRaw] = String(jibun).split("-");
  const bun = pad4(bunRaw), ji = pad4(jiRaw ?? "0");
  const want = Number(wantArea) || 0;

  L.push(`## ${bjd} · 지번 ${jibun}${want ? ` · 전용 ${want}㎡ 를 찾는다` : ""}`, "");

  let ok = false;
  for (const [keyName, key] of KEYS) {
    if (ok) break;
    const log = [];
    const { all, total } = await fetchAll(key, sigunguCd, bjdongCd, bun, ji, log);
    L.push(...log);
    if (!all.length) { L.push(`- \`${keyName}\` → ❌ 줄이 없다`, ""); continue; }
    ok = true; anyOk = true;
    L.push(`- \`${keyName}\` → ✅ **${all.length}줄** 받음 (응답이 말하는 총 ${total}줄)`, "");

    // 호 단위로 묶는다
    const byHo = new Map();
    for (const r of all) {
      const k = `${String(r.dongNm ?? "").trim()}|${String(r.hoNm ?? "").trim()}`;
      if (!byHo.has(k)) byHo.set(k, []);
      byHo.get(k).push(r);
    }
    const isJeonyu = (r) => String(r.exposPubuseGbCdNm ?? "").includes("전유");
    const purps = (r) => `${r.mainPurpsCdNm ?? ""}/${r.etcPurps ?? ""}`;
    const isApt = (r) => /아파트|공동주택|주거/.test(purps(r));

    // 찾는 전용면적에 가장 가까운 **아파트** 호를 고른다
    let best = null, bestGap = Infinity;
    for (const [k, rs] of byHo) {
      const jy = rs.filter((r) => isJeonyu(r) && isApt(r)).reduce((a, r) => a + Number(r.area || 0), 0);
      if (jy <= 0) continue;
      const gap = want ? Math.abs(jy - want) : -jy;
      if (gap < bestGap) { bestGap = gap; best = { k, rs, jy }; }
    }
    if (!best) {
      L.push("- ⚠️ 아파트 용도의 전유 줄을 못 찾았다. 이 지번의 용도 분포:", "");
      const dist = new Map();
      for (const r of all) dist.set(purps(r), (dist.get(purps(r)) || 0) + 1);
      for (const [p, n] of [...dist].sort((a, b) => b[1] - a[1]).slice(0, 12)) L.push(`  - \`${p}\` × ${n}`);
      L.push("");
      continue;
    }

    L.push(`### 호 \`${best.k.replace("|", " ")}\` — 전유 ${best.jy.toFixed(2)}㎡`
      + (want ? ` (찾던 ${want}㎡ 와 ${bestGap.toFixed(2)}㎡ 차이)` : ""), "");
    L.push("| 전유/공용 | 주/부속 | 층 | 용도 | 면적 |", "|---|---|---|---|---:|");
    for (const r of best.rs) {
      L.push(`| ${r.exposPubuseGbCdNm ?? ""} | ${r.mainAtchGbCdNm ?? ""}`
        + ` | ${r.flrGbCdNm ?? ""} ${r.flrNoNm ?? ""} | **${r.mainPurpsCdNm ?? ""}** ${r.etcPurps ?? ""} | ${r.area} |`);
    }

    // ── 후보 셈법을 나란히 — 어느 것이 공급면적인지 사람이 고른다
    const gy = best.rs.filter((r) => !isJeonyu(r));
    const sum = (a) => a.reduce((x, r) => x + Number(r.area || 0), 0);
    const jiha = (r) => String(r.flrGbCdNm ?? "").includes("지하");
    const parkish = (r) => /주차|기계|전기|펌프|물탱크|정화조|관리|경비|노인|어린이|복리|근린/.test(purps(r) + (r.etcPurps ?? ""));
    const cands = [
      ["전유만 (= 전용면적)", best.jy],
      ["전유 + 공용 전부 (= 계약면적)", best.jy + sum(gy)],
      ["전유 + 공용 중 지하 제외", best.jy + sum(gy.filter((r) => !jiha(r)))],
      ["전유 + 공용 중 주차·기계·복리 제외", best.jy + sum(gy.filter((r) => !parkish(r)))],
      ["전유 + 공용 중 지하·주차·기계·복리 제외", best.jy + sum(gy.filter((r) => !jiha(r) && !parkish(r)))],
    ];
    L.push("", "#### 후보 셈법 — 어느 것이 공급면적인가", "", "| 셈법 | ㎡ | 평 |", "|---|---:|---:|");
    for (const [name, v] of cands) L.push(`| ${name} | ${v.toFixed(2)} | **${(v / PY).toFixed(2)}** |`);
    L.push("");
  }
  L.push("");
}

writeFileSync("data/bldrgst-probe.md", L.join("\n") + "\n");
console.log(anyOk ? "✅ data/bldrgst-probe.md" : "⚠️ 전부 실패");
