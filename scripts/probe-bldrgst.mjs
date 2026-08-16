#!/usr/bin/env node
/**
 * 🏗️ 건축물대장 전유공용면적 탐침 — 공급면적을 **실측**으로 가져올 수 있나
 *
 * 오너 지시(2026-08-16d): 단지 서칭은 전용 59/84 로 하되, **카드에는 실제 공급평수**를 적는다.
 * 전용률 환산은 단지 평균이라 타입별로 ±0.9평 어긋난다(작은 평형일수록 전용률이 낮다).
 * 그래서 환산을 거치지 않고 **호별 실측**을 노린다.
 *
 * ── 왜 이 API 인가
 * `getBrExposPubuseAreaInfo` 는 **호 하나하나의 전유·공용 면적을 줄 단위로** 준다.
 *   공급면적 = 전유면적 + **주거**공용면적
 * 공용 줄에는 지하주차장 같은 **기타공용**이 섞여 있어 그대로 더하면 안 된다.
 * 무엇이 주거공용이고 무엇이 기타공용인지는 **응답을 보고 정한다** — 그래서 이 탐침이 먼저다.
 *
 * ── 이 스크립트는 판단하지 않는다
 * 필터를 짜 넣지 않는다. 한 단지의 **한 호에 달린 모든 줄**을 그대로 적는다.
 * 사람이 보고 규칙을 정한 뒤에야 수집기를 만든다(오보 0 — 추측으로 면적을 만들지 않는다).
 *
 * 실행: node scripts/probe-bldrgst.mjs 4111710700:488 4111113300:333 …
 *        (bjdCode 10자리 : 지번)  키는 DATA_GO_KR_API_KEY 또는 MOLIT_API_KEY
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

async function get(url) {
  for (let i = 0; i < 2; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "wirit-collector/0.1" } });
      clearTimeout(t);
      return { status: res.status, body: await res.text() };
    } catch (e) {
      if (i === 1) return { status: 0, body: `fetch failed: ${String(e?.message ?? e)}` };
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

/** 응답 → item 배열 (JSON·XML 둘 다) */
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

/** 포털이 돌려주는 오류 문구(승인 안 됨·키 틀림 등) */
function apiErr(raw) {
  const m = raw.match(/<returnAuthMsg>([\s\S]*?)<\/returnAuthMsg>|"resultMsg"\s*:\s*"([^"]+)"|<errMsg>([\s\S]*?)<\/errMsg>/);
  const msg = (m?.[1] || m?.[2] || m?.[3] || "").trim();
  return msg && !/^NORMAL/i.test(msg) && !/정상/.test(msg) ? msg : "";
}

const targets = process.argv.slice(2).filter((a) => /^\d{10}:/.test(a));
if (!targets.length) { console.error("::error::bjdCode:지번 을 하나 이상 주세요 (예: 4111710700:488)"); process.exit(1); }

const L = ["# 건축물대장 전유공용면적 탐침 — 공급면적을 실측할 수 있나", ""];
L.push("> 오너 지시(08-16d): 카드에 **실제 공급평수**를 적는다. 환산이 아니라 실측을 노린다.");
L.push("> **공급면적 = 전유 + 주거공용.** 공용 줄에 지하주차장 같은 기타공용이 섞여 있어");
L.push("> 그대로 더하면 안 된다. 무엇을 걸러야 하는지 보려고 **한 호의 모든 줄**을 그대로 적었다.", "");

let anyOk = false;

for (const t of targets) {
  const [bjd, jibun] = t.split(":");
  const sigunguCd = bjd.slice(0, 5), bjdongCd = bjd.slice(5, 10);
  const [bunRaw, jiRaw] = String(jibun).split("-");
  const bun = pad4(bunRaw), ji = pad4(jiRaw ?? "0");
  L.push(`## ${bjd} · 지번 ${jibun}  (시군구 ${sigunguCd} · 법정동 ${bjdongCd} · 번 ${bun} · 지 ${ji})`, "");

  let done = false;
  for (const [keyName, key] of KEYS) {
    if (done) break;
    const url = `${URL_BASE}?serviceKey=${encKey(key)}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}`
      + `&platGbCd=0&bun=${bun}&ji=${ji}&numOfRows=200&pageNo=1&_type=json`;
    const { status, body } = await get(url);
    const err = apiErr(body);
    if (status !== 200 || err) {
      L.push(`- \`${keyName}\` → ❌ ${err || `HTTP ${status}`} ${body.slice(0, 120).replace(/\s+/g, " ")}`);
      continue;
    }
    const rs = rows(body);
    if (!rs.length) { L.push(`- \`${keyName}\` → ⚠️ 응답은 정상인데 줄이 0개다(지번이 다를 수 있다)`); continue; }

    anyOk = true; done = true;
    L.push(`- \`${keyName}\` → ✅ **${rs.length}줄**`, "");

    // 한 호를 골라 그 호에 달린 줄을 전부 보인다 — 필터 규칙은 이걸 보고 정한다
    const ho = rs.find((r) => String(r.hoNm ?? "").trim())?.hoNm;
    const mine = rs.filter((r) => String(r.hoNm ?? "").trim() === String(ho).trim());
    L.push(`### 호 \`${ho}\` 에 달린 줄 ${mine.length}개 — 이걸 보고 무엇이 주거공용인지 정한다`, "");
    L.push("| 전유/공용 | 주/부속 | 층 | 구조 | 용도 | 면적 |", "|---|---|---|---|---|---:|");
    for (const r of mine) {
      L.push(`| ${r.exposPubuseGbCdNm ?? r.exposPubuseGbCd} | ${r.mainAtchGbCdNm ?? r.mainAtchGbCd}`
        + ` | ${r.flrGbCdNm ?? ""} ${r.flrNoNm ?? r.flrNo ?? ""} | ${r.strctCdNm ?? ""}`
        + ` | **${r.mainPurpsCdNm ?? ""}** ${r.etcPurps ?? ""} | ${r.area} |`);
    }
    const sum = (f) => mine.filter(f).reduce((a, r) => a + Number(r.area || 0), 0);
    const jeonyu = sum((r) => String(r.exposPubuseGbCdNm ?? "").includes("전유"));
    const gongyong = sum((r) => String(r.exposPubuseGbCdNm ?? "").includes("공용"));
    L.push("", `- 전유 합계 **${jeonyu.toFixed(2)}㎡** · 공용 합계 **${gongyong.toFixed(2)}㎡**`);
    L.push(`- 전부 더하면 ${(jeonyu + gongyong).toFixed(2)}㎡ = ${((jeonyu + gongyong) / 3.3058).toFixed(1)}평`
      + " ← **이게 공급면적이면 안 된다**(기타공용이 섞였는지 위 표에서 확인할 것)");
    L.push("", "### 이 지번의 첫 줄 전체 필드", "", "```json", JSON.stringify(rs[0], null, 2), "```", "");
  }
  L.push("");
}

writeFileSync("data/bldrgst-probe.md", L.join("\n") + "\n");
console.log(anyOk ? "✅ data/bldrgst-probe.md — 응답 받음" : "⚠️ data/bldrgst-probe.md — 전부 실패(승인 여부·문 닫힘 확인)");
