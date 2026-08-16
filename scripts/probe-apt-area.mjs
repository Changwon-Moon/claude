#!/usr/bin/env node
/**
 * 🔎 공급면적 탐침 — "카드의 평 표기를 관용 환산표가 아니라 실제 공급면적으로 바꿀 수 있나"
 *
 * 지금 카드의 `34평`·`25평` 은 **전용 84/59 → 고정 환산표**다
 * (`packages/collectors/src/parse/singo.ts` 의 `PYEONG_LABEL`).
 * 오너 지적(2026-08-16d): **단지 서칭은 전용으로 하되, 카드에는 실제 공급평수를 적는다.**
 *
 * 그러려면 공급면적이 **원자료에 있어야** 한다(오보 0 — 코드가 뽑는다).
 * 이 스크립트는 국토교통부 공동주택 기본정보·상세정보 응답을 **가공 없이 전부** 받아
 * `data/apt-area-probe.md` 에 적는다. 필드를 눈으로 보고 판단하려는 것이다.
 *
 * 우리가 찾는 것:
 *   · 타입별 공급면적이 그대로 있는가            → 있으면 그걸 쓴다(제일 좋다)
 *   · 단지 총 전용면적(privArea)과
 *     관리비부과면적(kaptMarea)이 있는가         → 있으면 단지별 전용률을 **재서** 환산할 수 있다
 *   · 둘 다 없는가                              → 이 API 로는 못 한다. 다른 원자료를 찾아야 한다
 *
 * 실행: node scripts/probe-apt-area.mjs A44340013 A44033010 …   (키는 MOLIT_API_KEY)
 */
import { writeFileSync } from "node:fs";

const KEY = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_KEY || "";
if (!KEY) { console.error("::error::MOLIT_API_KEY 가 없습니다"); process.exit(1); }

const HOST = "https://apis.data.go.kr/1613000";
const OPS = [
  ["기본정보", "AptBasisInfoServiceV4/getAphusBassInfoV4"],
  ["상세정보", "AptBasisInfoServiceV4/getAphusDtlInfoV4"],
];

const encKey = (k) => (/%[0-9A-Fa-f]{2}/.test(k) ? k : encodeURIComponent(k));

async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "wirit-collector/0.1" } });
      clearTimeout(t);
      return await res.text();
    } catch (e) {
      if (i === 2) throw e;
      await new Promise((r) => setTimeout(r, 20000));
    }
  }
}

/** 응답에서 item 하나를 평평한 객체로 — JSON 이든 XML 이든 */
function itemOf(raw) {
  try {
    const j = JSON.parse(raw);
    const it = j?.response?.body?.item;
    if (it) return Array.isArray(it) ? it[0] : it;
  } catch {}
  const body = raw.match(/<item>[\s\S]*?<\/item>/)?.[0];
  if (!body) return null;
  const o = {};
  for (const m of body.matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) o[m[1]] = m[2].trim();
  return o;
}

const codes = process.argv.slice(2).filter((a) => /^A\d+$/.test(a));
if (!codes.length) { console.error("::error::단지코드를 하나 이상 주세요 (예: A44340013)"); process.exit(1); }

const L = ["# 공급면적 탐침 — 국토교통부 공동주택 정보에 무엇이 들어 있나", ""];
L.push("> 카드의 평 표기를 고정 환산표에서 **실제 공급면적**으로 바꿀 수 있는지 보려고 받은 것이다.");
L.push("> 가공하지 않은 응답 필드 전부. 면적으로 보이는 칸은 **굵게** 표시했다.", "");

const AREAISH = /area|Area|면적|marea|tarea|priv/i;

for (const code of codes) {
  L.push(`## ${code}`, "");
  for (const [label, op] of OPS) {
    const url = `${HOST}/${op}?serviceKey=${encKey(KEY)}&kaptCode=${code}&_type=json`;
    let o = null, err = "";
    try { o = itemOf(await get(url)); } catch (e) { err = String(e?.message ?? e); }
    L.push(`### ${label} — \`${op}\``, "");
    if (err) { L.push("```", `실패: ${err}`, "```", ""); continue; }
    if (!o) { L.push("_응답에 item 이 없습니다._", ""); continue; }
    L.push("| 필드 | 값 |", "|---|---|");
    for (const [k, v] of Object.entries(o)) {
      const s = String(v ?? "").slice(0, 80);
      L.push(AREAISH.test(k) ? `| **${k}** | **${s}** |` : `| ${k} | ${s} |`);
    }
    L.push("");
  }
}

writeFileSync("data/apt-area-probe.md", L.join("\n") + "\n");
console.log(`✅ data/apt-area-probe.md — 단지 ${codes.length}건`);
